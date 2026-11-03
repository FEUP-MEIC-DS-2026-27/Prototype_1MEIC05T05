// Shared by the whole frontend: the contract with the host app, the data types
// (the shape of the API responses), the UI texts and small pure helpers.
// No React and no network calls in this file.

// ---------------------------------------------------------------------------
// Module Federation contract
// ---------------------------------------------------------------------------

/** Props agreed with the host. Contract version 1. */
export interface ResearcherProfileProps {
  /** URL prefix where the host mounts this micro frontend. "" when standalone. */
  basePath: string
}

export const contractVersion = 1

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

export type MemberStatus = 'active' | 'former'
export type EmploymentType = 'employee' | 'scholarship' | 'contractor'
export type TeamStatus = 'active' | 'inactive'
export type ProjectStatus = 'active' | 'completed' | 'planned'

export type ResearcherListItem = {
  id: number
  name: string
  role: string
  teamName: string
  memberStatus: MemberStatus
}

export type PreviousFilter = 'all' | 'any' | number

export type SearchReason = {
  field: 'topic' | 'skill' | 'history' | 'previousProject'
  label: string
  values: string[]
}

export type SearchHit = ResearcherListItem & { reasons: SearchReason[] }

export type FacetFilters = {
  topics: readonly string[]
  skills: readonly string[]
  history: readonly string[]
  completed: 'all' | 'any' | readonly number[]
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
  field: 'name' | 'topic' | 'skill' | 'history' | 'previousProject'
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
  /** null = open-ended contract */
  endDate: string | null
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

/** A completed project that can be used as a filter. */
export type ProjectChoice = { id: number; name: string }

// ---------------------------------------------------------------------------
// UI texts
// ---------------------------------------------------------------------------

export const copy: {
  product: 'HumanISE.info'
  researchers: 'Researchers'
  notFound: 'Researcher not found'
  skills: 'Skills'
  researchTopics: 'Research topics'
  researchHistory: 'Research history'
  projects: 'Projects'
  team: 'Team'
  colleagues: 'Colleagues'
  contract: 'Contract'
  leader: 'Leader'
  noProject: 'No project assignment'
  noColleagues: 'No other members on this team'
  noContract: 'No contract on file'
  openEnded: 'Open-ended'
  search: 'Search'
  searchPlaceholder: 'Name, topic, skill, or expertise'
  previousProjects: 'Previous projects'
  allResearchers: 'All researchers'
  anyCompletedProject: 'Any completed project'
  noMatch: 'No researcher matches.'
  noCompletedProject: 'No researcher has a completed project.'
  previousProject: 'Previous project'
  suggestions: 'Suggestions'
  recoveryHint: 'Search matches a name, topic, skill, or line of expertise. It does not match project names.'
  removeSearch: 'Remove search'
  removePrevious: 'Remove previous project'
  filters: 'Filters'
  refine: 'Refine'
  removeFilter: 'Remove filter'
  name: 'Name'
  showMore: 'Show more'
  searchHistory: 'Search research history'
  searchProjects: 'Search previous projects'
  noFacetMatches: 'No matches.'
} = {
  product: 'HumanISE.info',
  researchers: 'Researchers',
  notFound: 'Researcher not found',
  skills: 'Skills',
  researchTopics: 'Research topics',
  researchHistory: 'Research history',
  projects: 'Projects',
  team: 'Team',
  colleagues: 'Colleagues',
  contract: 'Contract',
  leader: 'Leader',
  noProject: 'No project assignment',
  noColleagues: 'No other members on this team',
  noContract: 'No contract on file',
  openEnded: 'Open-ended',
  search: 'Search',
  searchPlaceholder: 'Name, topic, skill, or expertise',
  previousProjects: 'Previous projects',
  allResearchers: 'All researchers',
  anyCompletedProject: 'Any completed project',
  noMatch: 'No researcher matches.',
  noCompletedProject: 'No researcher has a completed project.',
  previousProject: 'Previous project',
  suggestions: 'Suggestions',
  recoveryHint: 'Search matches a name, topic, skill, or line of expertise. It does not match project names.',
  removeSearch: 'Remove search',
  removePrevious: 'Remove previous project',
  filters: 'Filters',
  refine: 'Refine',
  removeFilter: 'Remove filter',
  name: 'Name',
  showMore: 'Show more',
  searchHistory: 'Search research history',
  searchProjects: 'Search previous projects',
  noFacetMatches: 'No matches.',
}

export const memberStatusLabel: Record<MemberStatus, 'Active' | 'Former'> = {
  active: 'Active',
  former: 'Former',
}

export const employmentLabel: Record<EmploymentType, 'Employee' | 'Scholarship' | 'Contractor'> = {
  employee: 'Employee',
  scholarship: 'Scholarship',
  contractor: 'Contractor',
}

export const teamStatusLabel: Record<TeamStatus, 'Active' | 'Inactive'> = {
  active: 'Active',
  inactive: 'Inactive',
}

export const projectStatusLabel: Record<ProjectStatus, 'Active' | 'Completed' | 'Planned'> = {
  active: 'Active',
  completed: 'Completed',
  planned: 'Planned',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function fold(value: string): string {
  return value.toLocaleLowerCase('en')
}

export const FACET_PAGE = 5

export function facetWindow(
  choices: readonly FacetChoice[],
  input: { query: string; limit: number; selected: readonly string[] },
): { visible: FacetChoice[]; remaining: number } {
  const needle = fold(input.query.trim())
  const sorted = [...choices].sort(
    (left, right) => right.count - left.count || left.label.localeCompare(right.label, 'en'),
  )
  const matched = needle === '' ? sorted : sorted.filter((item) => fold(item.label).includes(needle))
  const selected = new Set(input.selected)
  const shown = new Set(matched.slice(0, input.limit).map((item) => item.value))
  const visible = matched.filter((item) => shown.has(item.value) || selected.has(item.value))
  return { visible, remaining: matched.length - visible.length }
}

export function resultSummary(shown: number, total: number): string {
  return `${shown} of ${total} researchers`
}

export function emptyResultCopy(input: {
  query: string
  previous: PreviousFilter
  matchCount: number
  completedAssignmentCount: number
}): 'No researcher matches.' | 'No researcher has a completed project.' | null {
  if (input.matchCount > 0) return null
  const query = input.query.trim()
  if (query === '' && input.previous === 'any' && input.completedAssignmentCount === 0) {
    return copy.noCompletedProject
  }
  return copy.noMatch
}

export function parseResearcherId(param: string | undefined): number | null {
  if (param === undefined || !/^[1-9]\d*$/.test(param)) return null
  return Number(param)
}

export function formatProfileDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const formatted = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)))

  return formatted.replace(/[\u00A0\u202F]/g, ' ')
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
  const first = tokens[0]?.charAt(0) ?? ''
  if (tokens.length < 2) return first.toUpperCase()
  const last = tokens[tokens.length - 1]?.charAt(0) ?? ''
  return `${first}${last}`.toUpperCase()
}
