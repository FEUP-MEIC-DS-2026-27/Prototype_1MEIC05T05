import type {
  EmploymentType,
  MemberStatus,
  ProjectStatus,
  TeamStatus,
} from "../types/researcher.ts"

export type TeamRow = {
  id: number
  name: string
  description: string
  status: TeamStatus
  leaderId: number
}

export type ResearcherRow = {
  id: number
  name: string
  role: string
  memberStatus: MemberStatus
  employmentType: EmploymentType
  teamId: number
  skills: string[]
  researchHistory: string[]
}

export type ContractRow = {
  id: number
  researcherId: number
  type: string
  startDate: string
  endDate: string
}

export type TopicRow = {
  id: number
  name: string
}

export type ResearcherTopicRow = {
  researcherId: number
  topicId: number
}

export type TeamTopicRow = {
  teamId: number
  topicId: number
}

export type ProjectRow = {
  id: number
  name: string
  status: ProjectStatus
}

export type AssignmentRow = {
  researcherId: number
  projectId: number
  allocationPercentage: number
}

export const teams: TeamRow[] = [
  {
    id: 1,
    name: "Artificial Intelligence Team",
    description: "Research team focused on AI and intelligent systems.",
    status: "active",
    leaderId: 1,
  },
  {
    id: 2,
    name: "Computer Vision Team",
    description: "Research team focused on image and video analysis.",
    status: "active",
    leaderId: 3,
  },
  {
    id: 3,
    name: "Data Platform Team",
    description: "Research team focused on data platforms.",
    status: "active",
    leaderId: 4,
  },
]

export const researchers: ResearcherRow[] = [
  {
    id: 1,
    name: "Ana Silva",
    role: "Researcher",
    memberStatus: "active",
    employmentType: "employee",
    teamId: 1,
    skills: ["Machine Learning", "Python"],
    researchHistory: ["Machine Learning for Healthcare", "Data Analytics"],
  },
  {
    id: 2,
    name: "João Costa",
    role: "PhD Researcher",
    memberStatus: "active",
    employmentType: "scholarship",
    teamId: 1,
    skills: ["NLP", "Python"],
    researchHistory: ["Natural Language Processing"],
  },
  {
    id: 3,
    name: "Maria Ferreira",
    role: "Researcher",
    memberStatus: "former",
    employmentType: "contractor",
    teamId: 2,
    skills: ["Computer Vision"],
    researchHistory: ["Image Processing", "Computer Vision"],
  },
  {
    id: 4,
    name: "Rita Oliveira",
    role: "Researcher",
    memberStatus: "active",
    employmentType: "employee",
    teamId: 3,
    skills: ["Statistics"],
    researchHistory: ["Statistical Modelling"],
  },
]

export const contracts: ContractRow[] = [
  {
    id: 1,
    researcherId: 1,
    type: "Employment Contract",
    startDate: "2024-01-01",
    endDate: "2027-12-31",
  },
  {
    id: 2,
    researcherId: 2,
    type: "Research Scholarship",
    startDate: "2025-09-01",
    endDate: "2027-08-31",
  },
  {
    id: 3,
    researcherId: 3,
    type: "Fixed-term Contract",
    startDate: "2023-01-01",
    endDate: "2025-12-31",
  },
  {
    id: 4,
    researcherId: 4,
    type: "Employment Contract",
    startDate: "2024-03-01",
    endDate: "2026-12-31",
  },
]

export const topics: TopicRow[] = [
  { id: 1, name: "Artificial Intelligence" },
  { id: 2, name: "Data Science" },
  { id: 3, name: "Computer Vision" },
]

export const researcherTopics: ResearcherTopicRow[] = [
  { researcherId: 1, topicId: 1 },
  { researcherId: 1, topicId: 2 },
  { researcherId: 2, topicId: 1 },
  { researcherId: 3, topicId: 3 },
  { researcherId: 4, topicId: 2 },
]

export const teamTopics: TeamTopicRow[] = [
  { teamId: 1, topicId: 1 },
  { teamId: 1, topicId: 2 },
  { teamId: 2, topicId: 3 },
  { teamId: 3, topicId: 2 },
]

export const projects: ProjectRow[] = [
  { id: 1, name: "HumanISE", status: "active" },
  { id: 2, name: "AI4Health", status: "active" },
  { id: 3, name: "MedVis", status: "completed" },
  { id: 4, name: "Coastal Survey", status: "completed" },
]

export const assignments: AssignmentRow[] = [
  { researcherId: 1, projectId: 1, allocationPercentage: 60 },
  { researcherId: 1, projectId: 2, allocationPercentage: 30 },
  { researcherId: 2, projectId: 1, allocationPercentage: 100 },
  { researcherId: 4, projectId: 3, allocationPercentage: 40 },
]
