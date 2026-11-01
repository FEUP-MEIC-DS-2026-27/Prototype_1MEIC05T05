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
