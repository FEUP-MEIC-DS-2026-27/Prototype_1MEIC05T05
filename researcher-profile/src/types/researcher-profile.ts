/** Domain types for user story #73 — detailed researcher profile. */

export interface Publication {
  id: string
  title: string
  year: number
  venue: string
  citations: number
}

export interface ResearchProject {
  id: string
  title: string
  period: string
  status: "active" | "completed" | "paused"
  description: string
}

export interface ResearcherProfile {
  id: string
  name: string
  avatarUrl?: string
  role: string
  team: string
  institution: string
  location: string
  email: string
  bio: string
  skills: string[]
  researchTopics: string[]
  publications: Publication[]
  projects: ResearchProject[]
}
