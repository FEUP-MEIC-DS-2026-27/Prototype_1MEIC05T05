export type MemberStatus = "active" | "former"
export type EmploymentType = "employee" | "scholarship" | "contractor"
export type TeamStatus = "active" | "inactive"
export type ProjectStatus = "active" | "completed" | "planned"

export type ResearcherListItem = {
  id: number
  name: string
  role: string
  teamName: string
  memberStatus: MemberStatus
}

export type PreviousFilter = "all" | "any" | number

export type SearchReason = {
  field: "topic" | "skill" | "history" | "previousProject"
  label: string
  values: string[]
}

export type SearchHit = ResearcherListItem & { reasons: SearchReason[] }

export type FacetFilters = {
  topics: readonly string[]
  skills: readonly string[]
  history: readonly string[]
  completed: "all" | "any" | readonly number[]
}

export type FacetChoice = {
  value: string
  label: string
  count: number
}

export type FacetCatalog = {
  topics: FacetChoice[]
  skills: FacetChoice[]
  history: FacetChoice[]
  anyCompleted: FacetChoice
  projects: FacetChoice[]
}

export type SearchSuggestion = {
  field: "name" | "topic" | "skill" | "history" | "previousProject"
  label: string
}

export type ProfileLeader = {
  id: number
  name: string
  role: string
  isSelf: boolean
}

export type ProfileColleague = { id: number; name: string; role: string }

export type ProfileContract = {
  type: string
  startDate: string
  endDate: string
}

export type ProfileProject = {
  id: number
  name: string
  status: ProjectStatus
  allocationPercentage: number
}

export type ResearcherProfile = {
  id: number
  name: string
  role: string
  memberStatus: MemberStatus
  employmentType: EmploymentType
  skills: string[]
  topics: string[]
  researchHistory: string[]
  team: {
    id: number
    name: string
    description: string
    status: TeamStatus
    topics: string[]
    leader: ProfileLeader
  }
  colleagues: ProfileColleague[]
  contract: ProfileContract | null
  projects: ProfileProject[]
}
