import { useEffect, useState } from "react"

import { searchResearchersAsync } from "../api/researchers.ts"
import { copy } from "../copy.ts"
import {
  countResearchersWithCompletedProjects,
  emptyResultCopy,
  facetCatalog,
  listResearchers,
  resultSummary,
  searchSuggestions,
} from "../data/profile.ts"
import type {
  FacetFilters,
  SearchHit,
  SearchSuggestion,
} from "../types/researcher.ts"
import { activeChips, addFacet, FacetPanel } from "./FacetPanel.tsx"
import { ResearcherResultList } from "./ResearcherResultList.tsx"
import { SearchBar } from "./SearchBar.tsx"
import { StatusMessage } from "./StatusMessage.tsx"

const emptyFacets: FacetFilters = {
  topics: [],
  skills: [],
  history: [],
  completed: "all",
}

type SearchLoad =
  | { status: "loading" }
  | { status: "ready"; results: SearchHit[] }
  | { status: "error"; message: string }

function failureMessage(reason: unknown): string {
  if (reason instanceof Error && reason.message !== "") return reason.message
  return "Could not search researchers."
}

export function ResearcherSearchPage({ basePath }: { basePath: string }) {
  const [query, setQuery] = useState("")
  const [facets, setFacets] = useState<FacetFilters>(emptyFacets)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [load, setLoad] = useState<SearchLoad>({ status: "loading" })
  const suggestions = searchSuggestions(query)
  const catalog = facetCatalog({ query, facets })
  const chips = activeChips(facets, setFacets)
  const results = load.status === "ready" ? load.results : null
  const emptyCopy =
    results === null
      ? null
      : emptyResultCopy({
          query,
          previous: facets.completed === "any" ? "any" : "all",
          matchCount: results.length,
          completedAssignmentCount: countResearchersWithCompletedProjects(),
        })

  useEffect(() => {
    let active = true
    setLoad({ status: "loading" })
    searchResearchersAsync({ query, previous: "all", facets }).then(
      (hits) => {
        if (active) setLoad({ status: "ready", results: hits })
      },
      (reason: unknown) => {
        if (!active) return
        setLoad({ status: "error", message: failureMessage(reason) })
      }
    )
    return () => {
      active = false
    }
  }, [query, facets, attempt])

  function pickSuggestion(suggestion: SearchSuggestion) {
    if (suggestion.field === "name") {
      setQuery(suggestion.label)
      return
    }
    setFacets((current) => addFacet(current, suggestion))
    setQuery("")
  }

  return (
    <div className="d-flex flex-column gap-3">
      <header>
        <p className="text-body-secondary mb-1">{copy.product}</p>
        <h1 className="h3 mb-0">{copy.researchers}</h1>
      </header>
      <div className="row g-4 align-items-start">
        <aside className="col-lg-4 d-none d-lg-block">
          <FacetPanel
            idPrefix="desk"
            facets={facets}
            catalog={catalog}
            onFacets={setFacets}
          />
        </aside>
        <div className="col-lg-8 d-flex flex-column gap-3">
          <div className="d-flex align-items-end gap-2">
            <SearchBar
              query={query}
              suggestions={suggestions}
              onQueryChange={setQuery}
              onPick={pickSuggestion}
            />
            <button
              type="button"
              className="btn btn-outline-secondary d-lg-none"
              onClick={() => setFiltersOpen(true)}
            >
              {copy.filters}
            </button>
          </div>
          {chips.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  aria-label={`${copy.removeFilter}: ${chip.label}`}
                  onClick={chip.remove}
                >
                  <span className="text-body-secondary">{chip.group}</span>{" "}
                  <span>{chip.label}</span>
                  <span aria-hidden="true"> ×</span>
                </button>
              ))}
            </div>
          ) : null}
          {load.status === "loading" ? (
            <StatusMessage variant="loading" />
          ) : load.status === "error" ? (
            <StatusMessage
              variant="error"
              message={load.message}
              onRetry={() => setAttempt((current) => current + 1)}
            />
          ) : (
            <>
              <p className="text-body-secondary small mb-0">
                {resultSummary(load.results.length, listResearchers().length)}
              </p>
              <ResearcherResultList
                results={load.results}
                basePath={basePath}
                emptyMessage={emptyCopy}
              />
            </>
          )}
        </div>
      </div>
      {filtersOpen ? (
        <>
          <div
            className="offcanvas offcanvas-start show"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="facet-offcanvas-title"
          >
            <div className="offcanvas-header">
              <h2 className="offcanvas-title h5" id="facet-offcanvas-title">
                {copy.filters}
              </h2>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setFiltersOpen(false)}
              />
            </div>
            <div className="offcanvas-body">
              <FacetPanel
                idPrefix="offcanvas"
                facets={facets}
                catalog={catalog}
                onFacets={setFacets}
              />
            </div>
          </div>
          <button
            type="button"
            className="offcanvas-backdrop fade show border-0"
            aria-label="Close"
            onClick={() => setFiltersOpen(false)}
          />
        </>
      ) : null}
    </div>
  )
}
