import { useEffect, useState } from 'react'

import {
  loadFacetCatalog,
  loadSearchSuggestions,
  loadSearchSummary,
  searchResearchersAsync,
  type SearchSummary,
} from '../api/researchers'
import {
  copy,
  emptyResultCopy,
  resultSummary,
  type FacetCatalog,
  type FacetFilters,
  type SearchHit,
  type SearchSuggestion,
} from '../shared'
import FacetPanel, { activeChips, addFacet } from './FacetPanel'
import ResearcherResultList from './ResearcherResultList'
import SearchBar from './SearchBar'
import StatusMessage from './StatusMessage'

const emptyFacets: FacetFilters = {
  topics: [],
  skills: [],
  history: [],
  completed: 'all',
}

// Shown until the first facet catalog arrives from the API.
const emptyCatalog: FacetCatalog = {
  topics: [],
  skills: [],
  history: [],
  anyCompleted: { value: 'any', label: copy.anyCompletedProject, count: 0 },
  projects: [],
}

type SearchLoad =
  { status: 'loading' } | { status: 'ready'; results: SearchHit[] } | { status: 'error'; message: string }

function failureMessage(reason: unknown): string {
  if (reason instanceof Error && reason.message !== '') return reason.message
  return 'Could not search researchers.'
}

export default function ResearcherSearchPage({ basePath }: { basePath: string }) {
  const [query, setQuery] = useState('')
  const [facets, setFacets] = useState<FacetFilters>(emptyFacets)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [load, setLoad] = useState<SearchLoad>({ status: 'loading' })
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [catalog, setCatalog] = useState<FacetCatalog>(emptyCatalog)
  const [summary, setSummary] = useState<SearchSummary | null>(null)
  // Completed projects as the API knows them (the facet catalog lists all of them).
  const projectChoices = catalog.projects.map((choice) => ({
    id: Number(choice.value),
    name: choice.label,
  }))
  const chips = activeChips(facets, setFacets, projectChoices)
  const results = load.status === 'ready' ? load.results : null
  const emptyCopy =
    results === null
      ? null
      : emptyResultCopy({
          query,
          previous: facets.completed === 'any' ? 'any' : 'all',
          matchCount: results.length,
          // Until the summary arrives, fall back to the generic "no match".
          completedAssignmentCount: summary ? summary.withCompletedProjects : 1,
        })

  useEffect(() => {
    let active = true
    setLoad({ status: 'loading' })
    searchResearchersAsync({ query, previous: 'all', facets }).then(
      (hits) => {
        if (active) setLoad({ status: 'ready', results: hits })
      },
      (reason: unknown) => {
        if (!active) return
        setLoad({ status: 'error', message: failureMessage(reason) })
      },
    )
    return () => {
      active = false
    }
  }, [query, facets, attempt])

  // Facet counts follow the current search. If this call fails, the previous
  // catalog stays and the search request above reports the error.
  useEffect(() => {
    let active = true
    loadFacetCatalog({ query, facets }).then(
      (next) => {
        if (active) setCatalog(next)
      },
      () => {},
    )
    return () => {
      active = false
    }
  }, [query, facets, attempt])

  useEffect(() => {
    let active = true
    if (query.trim() === '') {
      setSuggestions([])
    } else {
      loadSearchSuggestions(query).then(
        (next) => {
          if (active) setSuggestions(next)
        },
        () => {
          if (active) setSuggestions([])
        },
      )
    }
    return () => {
      active = false
    }
  }, [query])

  useEffect(() => {
    let active = true
    loadSearchSummary().then(
      (next) => {
        if (active) setSummary(next)
      },
      () => {},
    )
    return () => {
      active = false
    }
  }, [attempt])

  function pickSuggestion(suggestion: SearchSuggestion) {
    if (suggestion.field === 'name') {
      setQuery(suggestion.label)
      return
    }
    setFacets((current) => addFacet(current, suggestion, projectChoices))
    setQuery('')
  }

  return (
    <div className="d-flex flex-column gap-3">
      <header>
        <p className="text-body-secondary mb-1">{copy.product}</p>
        <h1 className="h3 mb-0">{copy.researchers}</h1>
      </header>
      <div className="row g-4 align-items-start">
        <aside className="col-lg-4 d-none d-lg-block">
          <FacetPanel idPrefix="desk" facets={facets} catalog={catalog} onFacets={setFacets} />
        </aside>
        <div className="col-lg-8 d-flex flex-column gap-3">
          <div className="d-flex align-items-end gap-2">
            <SearchBar query={query} suggestions={suggestions} onQueryChange={setQuery} onPick={pickSuggestion} />
            <button type="button" className="btn btn-outline-secondary d-lg-none" onClick={() => setFiltersOpen(true)}>
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
                  <span className="text-body-secondary">{chip.group}</span> <span>{chip.label}</span>
                  <span aria-hidden="true"> ×</span>
                </button>
              ))}
            </div>
          ) : null}
          {load.status === 'loading' ? (
            <StatusMessage variant="loading" />
          ) : load.status === 'error' ? (
            <StatusMessage
              variant="error"
              message={load.message}
              onRetry={() => setAttempt((current) => current + 1)}
            />
          ) : (
            <>
              {summary ? (
                <p className="text-body-secondary small mb-0">{resultSummary(load.results.length, summary.total)}</p>
              ) : null}
              <ResearcherResultList results={load.results} basePath={basePath} emptyMessage={emptyCopy} />
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
              <button type="button" className="btn-close" aria-label="Close" onClick={() => setFiltersOpen(false)} />
            </div>
            <div className="offcanvas-body">
              <FacetPanel idPrefix="offcanvas" facets={facets} catalog={catalog} onFacets={setFacets} />
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
