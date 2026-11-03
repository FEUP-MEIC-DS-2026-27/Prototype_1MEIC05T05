import { copy } from "../copy.ts"
import type {
  PreviousFilter,
  ProfileColleague,
  ProfileContract,
  ProfileLeader,
  ProfileProject,
  ProjectStatus,
  ResearcherListItem,
  ResearcherProfile,
  FacetCatalog,
  FacetFilters,
  FacetChoice,
  SearchHit,
  SearchReason,
  SearchSuggestion,
} from "../types/researcher.ts"
import {
  assignments,
  contracts,
  projects,
  researcherTopics,
  researchers,
  teamTopics,
  teams,
  topics,
} from "./mock.ts"

const researcherById = new Map(researchers.map((row) => [row.id, row]))
const teamById = new Map(teams.map((row) => [row.id, row]))
const topicById = new Map(topics.map((row) => [row.id, row]))
const projectById = new Map(projects.map((row) => [row.id, row]))

function lookup<T>(rows: Map<number, T>, id: number): T {
  const row = rows.get(id)
  if (row === undefined) throw new Error(`Missing related row ${id}`)
  return row
}

function topicNames(topicIds: number[]): string[] {
  return [...topicIds]
    .sort((left, right) => left - right)
    .map((id) => lookup(topicById, id).name)
}

function colleaguesOf(
  researcherId: number,
  teamId: number
): ProfileColleague[] {
  return researchers
    .filter((row) => row.teamId === teamId && row.id !== researcherId)
    .sort((left, right) => left.id - right.id)
    .map((row) => ({ id: row.id, name: row.name, role: row.role }))
}

function contractOf(researcherId: number): ProfileContract | null {
  const row = contracts.find((item) => item.researcherId === researcherId)
  if (!row) return null
  return { type: row.type, startDate: row.startDate, endDate: row.endDate }
}

function projectsOf(researcherId: number): ProfileProject[] {
  return assignments
    .filter((row) => row.researcherId === researcherId)
    .map((row) => {
      const project = lookup(projectById, row.projectId)
      return {
        id: project.id,
        name: project.name,
        status: project.status,
        allocationPercentage: row.allocationPercentage,
      }
    })
}

function fold(value: string): string {
  return value.toLocaleLowerCase("en")
}

function matchedStrings(
  values: readonly string[],
  foldedQuery: string
): string[] {
  if (foldedQuery === "") return []
  return values.filter((value) => fold(value).includes(foldedQuery))
}

function assignedProjects(
  researcherId: number
): { id: number; name: string; status: ProjectStatus }[] {
  return assignments
    .filter((row) => row.researcherId === researcherId)
    .map((row) => {
      const project = lookup(projectById, row.projectId)
      return { id: project.id, name: project.name, status: project.status }
    })
}

export function previousProjectNames(
  assigned: readonly { id: number; name: string; status: ProjectStatus }[]
): string[] {
  return assigned
    .filter((project) => project.status === "completed")
    .sort((left, right) => left.id - right.id)
    .map((project) => project.name)
}

function topicsOf(researcherId: number): string[] {
  return topicNames(
    researcherTopics
      .filter((link) => link.researcherId === researcherId)
      .map((link) => link.topicId)
  )
}

function completedSelection(input: {
  previous: PreviousFilter
  facets?: FacetFilters
}): "all" | "any" | readonly number[] {
  if (input.facets) return input.facets.completed
  if (input.previous === "all" || input.previous === "any") return input.previous
  return [input.previous]
}

function namesForCompleted(
  assigned: readonly { id: number; name: string; status: ProjectStatus }[],
  completed: "all" | "any" | readonly number[]
): string[] {
  if (completed === "all") return []
  if (completed === "any") return previousProjectNames(assigned)
  const ids = new Set(completed)
  return previousProjectNames(assigned.filter((project) => ids.has(project.id)))
}

function holdsAny(values: readonly string[], selected: readonly string[]): boolean {
  if (selected.length === 0) return true
  const folded = new Set(values.map((value) => fold(value)))
  return selected.some((value) => folded.has(fold(value)))
}

function reasonValues(
  stored: readonly string[],
  textMatched: readonly string[],
  selected: readonly string[]
): string[] {
  const text = new Set(textMatched.map((value) => fold(value)))
  const picked = new Set(selected.map((value) => fold(value)))
  return stored.filter(
    (value) => text.has(fold(value)) || picked.has(fold(value))
  )
}

export function searchResearchers(input: {
  query: string
  previous: PreviousFilter
  facets?: FacetFilters
}): SearchHit[] {
  const foldedQuery = fold(input.query.trim())
  const facets = input.facets ?? {
    topics: [],
    skills: [],
    history: [],
    completed: completedSelection(input),
  }
  const completed = completedSelection({ previous: input.previous, facets: input.facets })

  return [...researchers]
    .sort((left, right) => left.id - right.id)
    .flatMap((row) => {
      const storedTopics = topicsOf(row.id)
      const assigned = assignedProjects(row.id)
      const previousNames = namesForCompleted(assigned, completed)
      if (completed !== "all" && previousNames.length === 0) return []
      if (!holdsAny(storedTopics, facets.topics)) return []
      if (!holdsAny(row.skills, facets.skills)) return []
      if (!holdsAny(row.researchHistory, facets.history)) return []

      const topics = matchedStrings(storedTopics, foldedQuery)
      const skills = matchedStrings(row.skills, foldedQuery)
      const history = matchedStrings(row.researchHistory, foldedQuery)
      const nameMatches =
        foldedQuery !== "" && fold(row.name).includes(foldedQuery)
      const textMatches =
        foldedQuery === "" ||
        nameMatches ||
        topics.length > 0 ||
        skills.length > 0 ||
        history.length > 0
      if (!textMatches) return []

      const topicValues = reasonValues(storedTopics, topics, facets.topics)
      const skillValues = reasonValues(row.skills, skills, facets.skills)
      const historyValues = reasonValues(
        row.researchHistory,
        history,
        facets.history
      )
      const reasons: SearchReason[] = []
      if (topicValues.length > 0) {
        reasons.push({
          field: "topic",
          label: copy.researchTopics,
          values: topicValues,
        })
      }
      if (skillValues.length > 0) {
        reasons.push({
          field: "skill",
          label: copy.skills,
          values: skillValues,
        })
      }
      if (historyValues.length > 0) {
        reasons.push({
          field: "history",
          label: copy.researchHistory,
          values: historyValues,
        })
      }
      if (completed !== "all") {
        reasons.push({
          field: "previousProject",
          label: copy.previousProject,
          values: previousNames,
        })
      }

      return [
        {
          id: row.id,
          name: row.name,
          role: row.role,
          teamName: lookup(teamById, row.teamId).name,
          memberStatus: row.memberStatus,
          reasons,
        },
      ]
    })
}

function choice(
  label: string,
  count: number,
  value = label
): { value: string; label: string; count: number } {
  return { value, label, count }
}

function countWith(query: string, facets: FacetFilters): number {
  return searchResearchers({ query, previous: "all", facets }).length
}

export function facetCatalog(input: {
  query: string
  facets: FacetFilters
}): FacetCatalog {
  const topicLabels = [
    ...new Set(researcherTopics.map((link) => link.topicId)),
  ]
    .sort((left, right) => left - right)
    .map((id) => lookup(topicById, id).name)
  const skillLabels = uniqueLabels(
    [...researchers].sort(byId).map((row) => row.skills)
  )
  const historyLabels = uniqueLabels(
    [...researchers].sort(byId).map((row) => row.researchHistory)
  )

  return {
    topics: topicLabels.map((label) =>
      choice(
        label,
        countWith(input.query, { ...input.facets, topics: [label] })
      )
    ),
    skills: skillLabels.map((label) =>
      choice(
        label,
        countWith(input.query, { ...input.facets, skills: [label] })
      )
    ),
    history: historyLabels.map((label) =>
      choice(
        label,
        countWith(input.query, { ...input.facets, history: [label] })
      )
    ),
    anyCompleted: choice(
      copy.anyCompletedProject,
      countWith(input.query, { ...input.facets, completed: "any" }),
      "any"
    ),
    projects: completedProjectChoices().map((project) =>
      choice(
        project.name,
        countWith(input.query, { ...input.facets, completed: [project.id] }),
        String(project.id)
      )
    ),
  }
}

export const FACET_PAGE = 5

export function facetWindow(
  choices: readonly FacetChoice[],
  input: { query: string; limit: number; selected: readonly string[] }
): { visible: FacetChoice[]; remaining: number } {
  const needle = fold(input.query.trim())
  const sorted = [...choices].sort(
    (left, right) =>
      right.count - left.count || left.label.localeCompare(right.label, "en")
  )
  const matched =
    needle === ""
      ? sorted
      : sorted.filter((item) => fold(item.label).includes(needle))
  const selected = new Set(input.selected)
  const shown = new Set(matched.slice(0, input.limit).map((item) => item.value))
  const visible = matched.filter(
    (item) => shown.has(item.value) || selected.has(item.value)
  )
  return { visible, remaining: matched.length - visible.length }
}

function uniqueLabels(groups: readonly (readonly string[])[]): string[] {
  const seen = new Set<string>()
  const labels: string[] = []
  for (const group of groups) {
    for (const label of group) {
      const key = fold(label)
      if (seen.has(key)) continue
      seen.add(key)
      labels.push(label)
    }
  }
  return labels
}

const SUGGESTION_CAP = 8

function byId<T extends { id: number }>(left: T, right: T): number {
  return left.id - right.id
}

function suggestionCandidates(): SearchSuggestion[] {
  const names: SearchSuggestion[] = [...researchers]
    .sort(byId)
    .map((row) => ({ field: "name", label: row.name }))

  const topicIds = [
    ...new Set(researcherTopics.map((link) => link.topicId)),
  ].sort((left, right) => left - right)
  const linkedTopics: SearchSuggestion[] = topicIds.map((id) => ({
    field: "topic",
    label: lookup(topicById, id).name,
  }))

  const orderedResearchers = [...researchers].sort(byId)
  const skills: SearchSuggestion[] = orderedResearchers.flatMap((row) =>
    row.skills.map((label) => ({ field: "skill", label }))
  )
  const history: SearchSuggestion[] = orderedResearchers.flatMap((row) =>
    row.researchHistory.map((label) => ({ field: "history", label }))
  )
  const projectSuggestions: SearchSuggestion[] = completedProjectChoices().map(
    (project) => ({ field: "previousProject", label: project.name })
  )

  return [
    ...names,
    ...linkedTopics,
    ...skills,
    ...history,
    ...projectSuggestions,
  ]
}

export function searchSuggestions(query: string): SearchSuggestion[] {
  const foldedQuery = fold(query.trim())
  if (foldedQuery === "") return []

  const seen = new Set<string>()
  const suggestions: SearchSuggestion[] = []

  for (const candidate of suggestionCandidates()) {
    const foldedLabel = `${candidate.field}:${fold(candidate.label)}`
    if (seen.has(foldedLabel)) continue
    seen.add(foldedLabel)
    if (!foldedLabel.includes(foldedQuery)) continue
    suggestions.push(candidate)
    if (suggestions.length === SUGGESTION_CAP) break
  }

  return suggestions
}

export function resultSummary(shown: number, total: number): string {
  return `${shown} of ${total} researchers`
}

export function emptyResultCopy(input: {
  query: string
  previous: PreviousFilter
  matchCount: number
  completedAssignmentCount: number
}): "No researcher matches." | "No researcher has a completed project." | null {
  if (input.matchCount > 0) return null
  const query = input.query.trim()
  if (
    query === "" &&
    input.previous === "any" &&
    input.completedAssignmentCount === 0
  ) {
    return copy.noCompletedProject
  }
  return copy.noMatch
}

export function completedProjectChoices(): { id: number; name: string }[] {
  return projects
    .filter((project) => project.status === "completed")
    .sort((left, right) => left.id - right.id)
    .map((project) => ({ id: project.id, name: project.name }))
}

export function countResearchersWithCompletedProjects(): number {
  return researchers.filter(
    (row) => previousProjectNames(assignedProjects(row.id)).length > 0
  ).length
}

export function listResearchers(): ResearcherListItem[] {
  return [...researchers]
    .sort((left, right) => left.id - right.id)
    .map((row) => ({
      id: row.id,
      name: row.name,
      role: row.role,
      teamName: lookup(teamById, row.teamId).name,
      memberStatus: row.memberStatus,
    }))
}

export function getResearcherProfile(id: number): ResearcherProfile | null {
  const row = researcherById.get(id)
  if (!row) return null

  const team = lookup(teamById, row.teamId)
  const leader = lookup(researcherById, team.leaderId)
  const leaderView: ProfileLeader = {
    id: leader.id,
    name: leader.name,
    role: leader.role,
    isSelf: leader.id === row.id,
  }

  return {
    id: row.id,
    name: row.name,
    role: row.role,
    memberStatus: row.memberStatus,
    employmentType: row.employmentType,
    skills: row.skills,
    topics: topicNames(
      researcherTopics
        .filter((link) => link.researcherId === row.id)
        .map((link) => link.topicId)
    ),
    researchHistory: row.researchHistory,
    team: {
      id: team.id,
      name: team.name,
      description: team.description,
      status: team.status,
      topics: topicNames(
        teamTopics
          .filter((link) => link.teamId === team.id)
          .map((link) => link.topicId)
      ),
      leader: leaderView,
    },
    colleagues: colleaguesOf(row.id, team.id),
    contract: contractOf(row.id),
    projects: projectsOf(row.id),
  }
}

export function parseResearcherId(param: string | undefined): number | null {
  if (param === undefined || !/^[1-9]\d*$/.test(param)) return null
  return Number(param)
}

export function formatProfileDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number)
  const formatted = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)))

  return formatted.replace(/[\u00A0\u202F]/g, " ")
}

export function leaderPath(leader: ProfileLeader): string | null {
  if (leader.isSelf) return null
  return `/researchers/${leader.id}`
}

export function initials(name: string): string {
  const tokens = name
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0)
  const first = tokens[0]?.charAt(0) ?? ""
  if (tokens.length < 2) return first.toUpperCase()
  const last = tokens[tokens.length - 1]?.charAt(0) ?? ""
  return `${first}${last}`.toUpperCase()
}
