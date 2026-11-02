import type {
  EmploymentType,
  MemberStatus,
  ProjectStatus,
  TeamStatus,
} from "./types/researcher.ts"

export const copy: {
  product: "HumanISE.info"
  researchers: "Researchers"
  notFound: "Researcher not found"
  skills: "Skills"
  researchTopics: "Research topics"
  researchHistory: "Research history"
  projects: "Projects"
  team: "Team"
  colleagues: "Colleagues"
  contract: "Contract"
  leader: "Leader"
  noProject: "No project assignment"
  noColleagues: "No other members on this team"
  noContract: "No contract on file"
  search: "Search"
  searchPlaceholder: "Name, topic, skill, or expertise"
  previousProjects: "Previous projects"
  allResearchers: "All researchers"
  anyCompletedProject: "Any completed project"
  noMatch: "No researcher matches."
  noCompletedProject: "No researcher has a completed project."
  previousProject: "Previous project"
  suggestions: "Suggestions"
  recoveryHint: "Search matches a name, topic, skill, or line of expertise. It does not match project names."
  removeSearch: "Remove search"
  removePrevious: "Remove previous project"
} = {
  product: "HumanISE.info",
  researchers: "Researchers",
  notFound: "Researcher not found",
  skills: "Skills",
  researchTopics: "Research topics",
  researchHistory: "Research history",
  projects: "Projects",
  team: "Team",
  colleagues: "Colleagues",
  contract: "Contract",
  leader: "Leader",
  noProject: "No project assignment",
  noColleagues: "No other members on this team",
  noContract: "No contract on file",
  search: "Search",
  searchPlaceholder: "Name, topic, skill, or expertise",
  previousProjects: "Previous projects",
  allResearchers: "All researchers",
  anyCompletedProject: "Any completed project",
  noMatch: "No researcher matches.",
  noCompletedProject: "No researcher has a completed project.",
  previousProject: "Previous project",
  suggestions: "Suggestions",
  recoveryHint:
    "Search matches a name, topic, skill, or line of expertise. It does not match project names.",
  removeSearch: "Remove search",
  removePrevious: "Remove previous project",
}

export const memberStatusLabel: Record<MemberStatus, "Active" | "Former"> = {
  active: "Active",
  former: "Former",
}

export const employmentLabel: Record<
  EmploymentType,
  "Employee" | "Scholarship" | "Contractor"
> = {
  employee: "Employee",
  scholarship: "Scholarship",
  contractor: "Contractor",
}

export const teamStatusLabel: Record<TeamStatus, "Active" | "Inactive"> = {
  active: "Active",
  inactive: "Inactive",
}

export const projectStatusLabel: Record<
  ProjectStatus,
  "Active" | "Completed" | "Planned"
> = {
  active: "Active",
  completed: "Completed",
  planned: "Planned",
}
