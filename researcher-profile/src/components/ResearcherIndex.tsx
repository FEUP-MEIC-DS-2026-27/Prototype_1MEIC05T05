import { useState } from "react"
import { Link } from "react-router"

import { Badge } from "@/components/ui/badge.tsx"
import { Input } from "@/components/ui/input.tsx"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx"
import { copy, memberStatusLabel } from "@/copy.ts"
import {
  completedProjectChoices,
  countResearchersWithCompletedProjects,
  emptyResultCopy,
  listResearchers,
  resultSummary,
  searchResearchers,
  searchSuggestions,
} from "@/data/profile.ts"
import type { PreviousFilter } from "@/types/researcher.ts"

const controlFocus =
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"

const suggestionListId = "researcher-suggestions"

export function ResearcherIndex() {
  const [query, setQuery] = useState("")
  const [previous, setPrevious] = useState<PreviousFilter>("all")
  const [searchFocused, setSearchFocused] = useState(false)
  const [suggestionsDismissed, setSuggestionsDismissed] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(0)
  const results = searchResearchers({ query, previous })
  const suggestions = searchSuggestions(query)
  const suggestionsOpen =
    searchFocused && !suggestionsDismissed && suggestions.length > 0
  const activeSuggestionIndex = suggestionsOpen
    ? Math.min(activeSuggestion, suggestions.length - 1)
    : 0
  const trimmedQuery = query.trim()
  const previousValue =
    previous === "all" || previous === "any" ? previous : String(previous)
  const previousItems = [
    { value: "all", label: copy.allResearchers },
    { value: "any", label: copy.anyCompletedProject },
    ...completedProjectChoices().map((project) => ({
      value: String(project.id),
      label: project.name,
    })),
  ]
  const previousLabel =
    previousItems.find((item) => item.value === previousValue)?.label ?? ""
  const showSearchChip = trimmedQuery !== ""
  const showPreviousChip = previous !== "all"
  const emptyCopy = emptyResultCopy({
    query,
    previous,
    matchCount: results.length,
    completedAssignmentCount: countResearchersWithCompletedProjects(),
  })

  function pickSuggestion(label: string) {
    setQuery(label)
    setSuggestionsDismissed(true)
    setActiveSuggestion(0)
  }

  return (
    <main className="flex min-h-svh flex-col gap-6 px-6 py-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">{copy.product}</p>
        <h1 className="text-2xl font-semibold">{copy.researchers}</h1>
      </header>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <label htmlFor="researcher-search" className="text-sm font-medium">
            {copy.search}
          </label>
          <div>
            <Input
              id="researcher-search"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={suggestionsOpen}
              aria-controls={suggestionsOpen ? suggestionListId : undefined}
              aria-activedescendant={
                suggestionsOpen
                  ? `${suggestionListId}-${activeSuggestionIndex}`
                  : undefined
              }
              value={query}
              placeholder={copy.searchPlaceholder}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onChange={(event) => {
                setQuery(event.target.value)
                setSuggestionsDismissed(false)
                setActiveSuggestion(0)
              }}
              onKeyDown={(event) => {
                if (!suggestionsOpen) return
                if (event.key === "ArrowDown") {
                  event.preventDefault()
                  setActiveSuggestion((index) =>
                    Math.min(index + 1, suggestions.length - 1)
                  )
                  return
                }
                if (event.key === "ArrowUp") {
                  event.preventDefault()
                  setActiveSuggestion((index) => Math.max(index - 1, 0))
                  return
                }
                if (event.key === "Enter") {
                  event.preventDefault()
                  const suggestion = suggestions[activeSuggestionIndex]
                  if (suggestion) pickSuggestion(suggestion.label)
                  return
                }
                if (event.key === "Escape") {
                  event.preventDefault()
                  setSuggestionsDismissed(true)
                }
              }}
              className={controlFocus}
            />
            {suggestionsOpen ? (
              <div
                id={suggestionListId}
                role="listbox"
                aria-label={copy.suggestions}
                className="mt-1 flex flex-col rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
              >
                {suggestions.map((suggestion, index) => {
                  const selected = index === activeSuggestionIndex
                  return (
                    <div
                      key={`${suggestion.field}-${suggestion.label}`}
                      id={`${suggestionListId}-${index}`}
                      role="option"
                      aria-selected={selected}
                      className={`flex w-full cursor-default items-center rounded-md px-2 py-1.5 text-left text-sm ${selected ? "bg-accent text-accent-foreground" : ""}`}
                      onMouseEnter={() => setActiveSuggestion(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => pickSuggestion(suggestion.label)}
                    >
                      {suggestion.label}
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <label htmlFor="previous-projects" className="text-sm font-medium">
            {copy.previousProjects}
          </label>
          <Select
            items={previousItems}
            value={previousValue}
            onValueChange={(value) => {
              if (value === "all" || value === "any") {
                setPrevious(value)
                return
              }
              if (value != null) setPrevious(Number(value))
            }}
          >
            <SelectTrigger
              id="previous-projects"
              className={`w-full ${controlFocus}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {previousItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      {showSearchChip || showPreviousChip ? (
        <div className="flex flex-wrap gap-2">
          {showSearchChip ? (
            <button
              type="button"
              aria-label={`${copy.removeSearch}: ${trimmedQuery}`}
              onClick={() => setQuery("")}
              className={`inline-flex h-8 max-w-full items-center rounded-lg border border-border bg-background px-2.5 text-sm text-foreground transition-colors duration-150 ease-out hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:bg-accent motion-reduce:transition-none ${controlFocus}`}
            >
              <span className="truncate">
                {copy.search}: {trimmedQuery}
              </span>
            </button>
          ) : null}
          {showPreviousChip ? (
            <button
              type="button"
              aria-label={`${copy.removePrevious}: ${previousLabel}`}
              onClick={() => setPrevious("all")}
              className={`inline-flex h-8 max-w-full items-center rounded-lg border border-border bg-background px-2.5 text-sm text-foreground transition-colors duration-150 ease-out hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:bg-accent motion-reduce:transition-none ${controlFocus}`}
            >
              <span className="truncate">
                {copy.previousProjects}: {previousLabel}
              </span>
            </button>
          ) : null}
        </div>
      ) : null}
      <p className="text-sm text-muted-foreground">
        {resultSummary(results.length, listResearchers().length)}
      </p>
      {emptyCopy === copy.noMatch ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">{copy.noMatch}</p>
          <p className="text-sm text-muted-foreground">{copy.recoveryHint}</p>
        </div>
      ) : emptyCopy === copy.noCompletedProject ? (
        <p className="text-sm text-muted-foreground">
          {copy.noCompletedProject}
        </p>
      ) : (
        <ul className="flex list-none flex-col p-0">
          {results.map((row) => (
            <li key={row.id}>
              <Link
                to={`/researchers/${row.id}`}
                className="-mx-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b border-border px-2 py-4 text-foreground no-underline transition-colors duration-150 ease-out hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:bg-accent motion-reduce:transition-none"
              >
                <span className="truncate text-sm font-medium">{row.name}</span>
                <Badge variant="outline">
                  {memberStatusLabel[row.memberStatus]}
                </Badge>
                <span className="col-span-2 flex min-w-0 flex-wrap gap-x-3 text-sm text-muted-foreground">
                  <span>{row.role}</span>
                  <span>{row.teamName}</span>
                  {row.reasons.map((reason) => (
                    <span key={reason.field}>
                      {`${reason.label} · ${reason.values.join(", ")}`}
                    </span>
                  ))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
