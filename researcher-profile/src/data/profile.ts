import type {
  ProfileColleague,
  ProfileContract,
  ProfileLeader,
  ProfileProject,
  ResearcherListItem,
  ResearcherProfile,
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
