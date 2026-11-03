import {
  copy,
  type FacetCatalog,
  type FacetFilters,
  type PreviousFilter,
  type ResearcherListItem,
  type ResearcherProfile,
  type SearchHit,
  type SearchReason,
  type SearchSuggestion,
} from '../shared'
import {
  countResearchersWithCompletedProjects,
  facetCatalog,
  getResearcherProfile,
  listResearchers,
  searchResearchers,
  searchSuggestions,
} from '../data/profile'

/*
 * Researcher API client.
 *
 * PUBLIC_USE_MOCK=false  -> HTTP calls to the backend (PUBLIC_API_URL)
 * anything else          -> the in-memory mock in data/profile.ts
 *
 * PUBLIC_API_URL is the backend address, for example http://localhost:8001.
 * Every endpoint below lives under /api (backend/main.py):
 *
 * GET /researchers/{id}
 *   200 ResearcherProfile, 404 no researchers row → null
 *
 * GET /researchers?query=&topics=&skills=&history=&completed=
 *   Lists are repeated parameters (?topics=A&topics=B).
 *   completed is "all", "any", or one or more completed project ids.
 *   200 SearchHit[] (reasons come without label, see withLabels)
 *
 * GET /researchers/facets?query=&topics=&skills=&history=&completed=
 *   200 FacetCatalog (anyCompleted comes without label)
 *
 * GET /researchers/suggestions?query=
 *   200 SearchSuggestion[]
 *
 * GET /researchers/summary
 *   200 { total, withCompletedProjects }
 *
 * UI texts stay in this project (shared.ts); the backend only sends data.
 */

const defaultApiUrl = 'http://localhost:8001'

function useMockData(): boolean {
  const flag = import.meta.env.PUBLIC_USE_MOCK
  return flag !== 'false'
}

function apiUrl(): string {
  const url = import.meta.env.PUBLIC_API_URL
  return (url ? url : defaultApiUrl).replace(/\/+$/, '')
}

type ApiReason = Omit<SearchReason, 'label'>
type ApiSearchHit = ResearcherListItem & { reasons: ApiReason[] }
type ApiFacetCatalog = Omit<FacetCatalog, 'anyCompleted'> & {
  anyCompleted: { value: string; count: number }
}

export type SearchSummary = {
  total: number
  withCompletedProjects: number
}

const reasonLabels: Record<SearchReason['field'], string> = {
  topic: copy.researchTopics,
  skill: copy.skills,
  history: copy.researchHistory,
  previousProject: copy.previousProject,
}

function withLabels(hit: ApiSearchHit): SearchHit {
  return {
    ...hit,
    reasons: hit.reasons.map((reason) => ({
      ...reason,
      label: reasonLabels[reason.field],
    })),
  }
}

async function fetchJson<T>(path: string, params?: URLSearchParams): Promise<T | null> {
  const queryString = params?.toString() ?? ''
  const url = `${apiUrl()}/api${path}${queryString === '' ? '' : `?${queryString}`}`
  let response: Response
  try {
    response = await fetch(url, { headers: { Accept: 'application/json' } })
  } catch {
    throw new Error('Could not reach the researcher API.')
  }
  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error(`Researcher API error (${response.status}).`)
  }
  return (await response.json()) as T
}

async function requireJson<T>(path: string, params?: URLSearchParams): Promise<T> {
  const body = await fetchJson<T>(path, params)
  if (body === null) throw new Error('Researcher API returned no data.')
  return body
}

function completedFrom(previous: PreviousFilter): 'all' | 'any' | readonly number[] {
  if (previous === 'all' || previous === 'any') return previous
  return [previous]
}

function searchParams(query: string, facets: FacetFilters): URLSearchParams {
  const params = new URLSearchParams()
  params.set('query', query)
  for (const value of facets.topics) params.append('topics', value)
  for (const value of facets.skills) params.append('skills', value)
  for (const value of facets.history) params.append('history', value)
  if (facets.completed === 'all' || facets.completed === 'any') {
    params.append('completed', facets.completed)
  } else if (facets.completed.length === 0) {
    // An empty selection means "no completed-project filter".
    params.append('completed', 'all')
  } else {
    for (const id of facets.completed) params.append('completed', String(id))
  }
  return params
}

export async function loadResearcherProfile(id: number): Promise<ResearcherProfile | null> {
  if (useMockData()) return getResearcherProfile(id)
  return fetchJson<ResearcherProfile>(`/researchers/${id}`)
}

export async function searchResearchersAsync(input: Parameters<typeof searchResearchers>[0]): Promise<SearchHit[]> {
  if (useMockData()) return searchResearchers(input)
  const facets: FacetFilters = input.facets ?? {
    topics: [],
    skills: [],
    history: [],
    completed: completedFrom(input.previous),
  }
  const hits = await requireJson<ApiSearchHit[]>('/researchers', searchParams(input.query, facets))
  return hits.map(withLabels)
}

export async function loadFacetCatalog(input: { query: string; facets: FacetFilters }): Promise<FacetCatalog> {
  if (useMockData()) return facetCatalog(input)
  const catalog = await requireJson<ApiFacetCatalog>('/researchers/facets', searchParams(input.query, input.facets))
  return {
    ...catalog,
    anyCompleted: { ...catalog.anyCompleted, label: copy.anyCompletedProject },
  }
}

export async function loadSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  if (useMockData()) return searchSuggestions(query)
  return requireJson<SearchSuggestion[]>('/researchers/suggestions', new URLSearchParams({ query }))
}

export async function loadSearchSummary(): Promise<SearchSummary> {
  if (useMockData()) {
    return {
      total: listResearchers().length,
      withCompletedProjects: countResearchersWithCompletedProjects(),
    }
  }
  return requireJson<SearchSummary>('/researchers/summary')
}
