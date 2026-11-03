import {
  getResearcherProfile,
  searchResearchers,
} from "../data/profile.ts"
import type { ResearcherProfile, SearchHit } from "../types/researcher.ts"

/*
 * PUBLIC_API_BASE is reserved for a later HTTP client. This module does not
 * read that variable and does not send requests.
 *
 * Intended REST shape, aligned with the researcher tables
 * (researchers, teams, researcher_contracts, research_topics,
 * researcher_topics, team_topics, projects, researcher_project_assignments):
 *
 * GET /researchers/{id}
 *   200 ResearcherProfile (researcher row plus team, leader, colleagues,
 *       topics, contract, and project assignments)
 *   404 no researchers row → null
 *
 * GET /researchers?query=&topics=&skills=&history=&completed=
 *   completed is "all", "any", or one or more completed project ids
 *   200 SearchHit[]
 */

function useMockData(): boolean {
  const flag = import.meta.env.PUBLIC_USE_MOCK
  return flag !== "false"
}

function mockDisabled(): Promise<never> {
  return Promise.reject(
    new Error(
      "Researcher API is not available while PUBLIC_USE_MOCK is false."
    )
  )
}

export function loadResearcherProfile(
  id: number
): Promise<ResearcherProfile | null> {
  if (!useMockData()) return mockDisabled()
  return Promise.resolve(getResearcherProfile(id))
}

export function searchResearchersAsync(
  input: Parameters<typeof searchResearchers>[0]
): Promise<SearchHit[]> {
  if (!useMockData()) return mockDisabled()
  return Promise.resolve(searchResearchers(input))
}
