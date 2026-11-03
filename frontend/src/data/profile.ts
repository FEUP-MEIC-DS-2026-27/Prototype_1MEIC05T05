import {
  copy,
  fold,
  type FacetCatalog,
  type FacetFilters,
  type PreviousFilter,
  type ProfileColleague,
  type ProfileContract,
  type ProfileLeader,
  type ProfileProject,
  type ProjectStatus,
  type ResearcherListItem,
  type ResearcherProfile,
  type SearchHit,
  type SearchReason,
  type SearchSuggestion,
} from '../shared'
import { assignments, contracts, projects, researcherTopics, researchers, teamTopics, teams, topics } from './mock'

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
  return [...topicIds].sort((left, right) => left - right).map((id) => lookup(topicById, id).name)
}

function colleaguesOf(researcherId: number, teamId: number): ProfileColleague[] {
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

function matchedStrings(values: readonly string[], foldedQuery: string): string[] {
  if (foldedQuery === '') return []
  return values.filter((value) => fold(value).includes(foldedQuery))
}

function assignedProjects(researcherId: number): { id: number; name: string; status: ProjectStatus }[] {
  return assignments
    .filter((row) => row.researcherId === researcherId)
    .map((row) => {
      const project = lookup(projectById, row.projectId)
      return { id: project.id, name: project.name, status: project.status }
    })
}

export function previousProjectNames(
  assigned: readonly { id: number; name: string; status: ProjectStatus }[],
): string[] {
  return assigned
    .filter((project) => project.status === 'completed')
    .sort((left, right) => left.id - right.id)
    .map((project) => project.name)
}

function topicsOf(researcherId: number): string[] {
  return topicNames(researcherTopics.filter((link) => link.researcherId === researcherId).map((link) => link.topicId))
}

function completedSelection(input: {
  previous: PreviousFilter
  facets?: FacetFilters
}): 'all' | 'any' | readonly number[] {
  if (input.facets) return input.facets.completed
  if (input.previous === 'all' || input.previous === 'any') return input.previous
  return [input.previous]
}

function namesForCompleted(
  assigned: readonly { id: number; name: string; status: ProjectStatus }[],
  completed: 'all' | 'any' | readonly number[],
): string[] {
  if (completed === 'all') return []
  if (completed === 'any') return previousProjectNames(assigned)
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
  selected: readonly string[],
): string[] {
  const text = new Set(textMatched.map((value) => fold(value)))
  const picked = new Set(selected.map((value) => fold(value)))
  return stored.filter((value) => text.has(fold(value)) || picked.has(fold(value)))
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
      if (completed !== 'all' && previousNames.length === 0) return []
      if (!holdsAny(storedTopics, facets.topics)) return []
      if (!holdsAny(row.skills, facets.skills)) return []
      if (!holdsAny(row.researchHistory, facets.history)) return []

      const topics = matchedStrings(storedTopics, foldedQuery)
      const skills = matchedStrings(row.skills, foldedQuery)
      const history = matchedStrings(row.researchHistory, foldedQuery)
      const nameMatches = foldedQuery !== '' && fold(row.name).includes(foldedQuery)
      const textMatches =
        foldedQuery === '' || nameMatches || topics.length > 0 || skills.length > 0 || history.length > 0
      if (!textMatches) return []

      const topicValues = reasonValues(storedTopics, topics, facets.topics)
      const skillValues = reasonValues(row.skills, skills, facets.skills)
      const historyValues = reasonValues(row.researchHistory, history, facets.history)
      const reasons: SearchReason[] = []
      if (topicValues.length > 0) {
        reasons.push({
          field: 'topic',
          label: copy.researchTopics,
          values: topicValues,
        })
      }
      if (skillValues.length > 0) {
        reasons.push({
          field: 'skill',
          label: copy.skills,
          values: skillValues,
        })
      }
      if (historyValues.length > 0) {
        reasons.push({
          field: 'history',
          label: copy.researchHistory,
          values: historyValues,
        })
      }
      if (completed !== 'all') {
        reasons.push({
          field: 'previousProject',
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

function choice(label: string, count: number, value = label): { value: string; label: string; count: number } {
  return { value, label, count }
}

function countWith(query: string, facets: FacetFilters): number {
  return searchResearchers({ query, previous: 'all', facets }).length
}

export function facetCatalog(input: { query: string; facets: FacetFilters }): FacetCatalog {
  const topicLabels = [...new Set(researcherTopics.map((link) => link.topicId))]
    .sort((left, right) => left - right)
    .map((id) => lookup(topicById, id).name)
  const skillLabels = uniqueLabels([...researchers].sort(byId).map((row) => row.skills))
  const historyLabels = uniqueLabels([...researchers].sort(byId).map((row) => row.researchHistory))

  return {
    topics: topicLabels.map((label) => choice(label, countWith(input.query, { ...input.facets, topics: [label] }))),
    skills: skillLabels.map((label) => choice(label, countWith(input.query, { ...input.facets, skills: [label] }))),
    history: historyLabels.map((label) => choice(label, countWith(input.query, { ...input.facets, history: [label] }))),
    anyCompleted: choice(
      copy.anyCompletedProject,
      countWith(input.query, { ...input.facets, completed: 'any' }),
      'any',
    ),
    projects: completedProjectChoices().map((project) =>
      choice(project.name, countWith(input.query, { ...input.facets, completed: [project.id] }), String(project.id)),
    ),
  }
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
  const names: SearchSuggestion[] = [...researchers].sort(byId).map((row) => ({ field: 'name', label: row.name }))

  const topicIds = [...new Set(researcherTopics.map((link) => link.topicId))].sort((left, right) => left - right)
  const linkedTopics: SearchSuggestion[] = topicIds.map((id) => ({
    field: 'topic',
    label: lookup(topicById, id).name,
  }))

  const orderedResearchers = [...researchers].sort(byId)
  const skills: SearchSuggestion[] = orderedResearchers.flatMap((row) =>
    row.skills.map((label) => ({ field: 'skill', label })),
  )
  const history: SearchSuggestion[] = orderedResearchers.flatMap((row) =>
    row.researchHistory.map((label) => ({ field: 'history', label })),
  )
  const projectSuggestions: SearchSuggestion[] = completedProjectChoices().map((project) => ({
    field: 'previousProject',
    label: project.name,
  }))

  return [...names, ...linkedTopics, ...skills, ...history, ...projectSuggestions]
}

export function searchSuggestions(query: string): SearchSuggestion[] {
  const foldedQuery = fold(query.trim())
  if (foldedQuery === '') return []

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

export function completedProjectChoices(): { id: number; name: string }[] {
  return projects
    .filter((project) => project.status === 'completed')
    .sort((left, right) => left.id - right.id)
    .map((project) => ({ id: project.id, name: project.name }))
}

export function countResearchersWithCompletedProjects(): number {
  return researchers.filter((row) => previousProjectNames(assignedProjects(row.id)).length > 0).length
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
    topics: topicNames(researcherTopics.filter((link) => link.researcherId === row.id).map((link) => link.topicId)),
    researchHistory: row.researchHistory,
    team: {
      id: team.id,
      name: team.name,
      description: team.description,
      status: team.status,
      topics: topicNames(teamTopics.filter((link) => link.teamId === team.id).map((link) => link.topicId)),
      leader: leaderView,
    },
    colleagues: colleaguesOf(row.id, team.id),
    contract: contractOf(row.id),
    projects: projectsOf(row.id),
  }
}
