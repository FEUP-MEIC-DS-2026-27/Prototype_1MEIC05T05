import { useState } from "react"
import { Link } from "react-router"
import { cn } from "cn"
import { XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Checkbox } from "@/components/ui/checkbox.tsx"
import {
  Field,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field.tsx"
import { Input } from "@/components/ui/input.tsx"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet.tsx"
import { copy, memberStatusLabel } from "@/copy.ts"
import {
  completedProjectChoices,
  countResearchersWithCompletedProjects,
  emptyResultCopy,
  facetCatalog,
  facetWindow,
  FACET_PAGE,
  listResearchers,
  resultSummary,
  searchResearchers,
  searchSuggestions,
} from "@/data/profile.ts"
import type {
  FacetChoice,
  FacetFilters,
  SearchSuggestion,
} from "@/types/researcher.ts"

const controlFocus =
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"

const suggestionListId = "researcher-suggestions"

const emptyFacets: FacetFilters = {
  topics: [],
  skills: [],
  history: [],
  completed: "all",
}

const suggestionGroup: Record<SearchSuggestion["field"], string> = {
  name: copy.name,
  topic: copy.researchTopics,
  skill: copy.skills,
  history: copy.researchHistory,
  previousProject: copy.previousProjects,
}

export function ResearcherIndex() {
  const [query, setQuery] = useState("")
  const [facets, setFacets] = useState<FacetFilters>(emptyFacets)
  const [searchFocused, setSearchFocused] = useState(false)
  const [escapeDismissed, setEscapeDismissed] = useState(false)
  const [pickDismissed, setPickDismissed] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(0)
  const results = searchResearchers({ query, previous: "all", facets })
  const suggestions = searchSuggestions(query)
  const catalog = facetCatalog({ query, facets })
  const suggestionsOpen =
    searchFocused &&
    !escapeDismissed &&
    !pickDismissed &&
    suggestions.length > 0
  const activeSuggestionIndex = suggestionsOpen
    ? Math.min(activeSuggestion, suggestions.length - 1)
    : 0
  const emptyCopy = emptyResultCopy({
    query,
    previous: facets.completed === "any" ? "any" : "all",
    matchCount: results.length,
    completedAssignmentCount: countResearchersWithCompletedProjects(),
  })
  const chips = activeChips(facets, setFacets)

  function pickSuggestion(suggestion: SearchSuggestion) {
    if (suggestion.field === "name") {
      setQuery(suggestion.label)
    } else {
      setFacets((current) => addFacet(current, suggestion))
      setQuery("")
    }
    setPickDismissed(true)
    setActiveSuggestion(0)
  }

  return (
    <main className="flex min-h-svh flex-col gap-6 px-6 py-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">{copy.product}</p>
        <h1 className="text-2xl font-semibold">{copy.researchers}</h1>
      </header>
      <div className="grid items-start gap-8 md:grid-cols-[17rem_minmax(0,1fr)] md:gap-10">
        <aside className="hidden md:block md:sticky md:top-6">
          <FacetColumn
            idPrefix="desk"
            facets={facets}
            catalog={catalog}
            onFacets={setFacets}
          />
        </aside>
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex items-end gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <label htmlFor="researcher-search" className="text-sm font-medium">
                {copy.search}
              </label>
              <div
                onFocus={() => setSearchFocused(true)}
                onBlur={(event) => {
                  if (event.currentTarget.contains(event.relatedTarget)) return
                  setSearchFocused(false)
                  setEscapeDismissed(false)
                }}
              >
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
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setEscapeDismissed(false)
                    setPickDismissed(false)
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
                      if (suggestion) pickSuggestion(suggestion)
                      return
                    }
                    if (event.key === "Escape") {
                      event.preventDefault()
                      setEscapeDismissed(true)
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
                          className={cn(
                            "flex w-full cursor-default items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm",
                            selected && "bg-accent text-accent-foreground"
                          )}
                          onMouseEnter={() => setActiveSuggestion(index)}
                          onPointerDown={(event) => {
                            event.preventDefault()
                            pickSuggestion(suggestion)
                          }}
                        >
                          <span className="min-w-0 flex-1 truncate">
                            <SuggestionLabel
                              label={suggestion.label}
                              query={query}
                            />
                          </span>
                          <span className="shrink-0 text-muted-foreground">
                            {suggestionGroup[suggestion.field]}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            </div>
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="outline" className="md:hidden" />
                }
              >
                {copy.filters}
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>{copy.filters}</SheetTitle>
                </SheetHeader>
                <div className="overflow-y-auto px-4 pb-4">
                  <FacetColumn
                    idPrefix="sheet"
                    facets={facets}
                    catalog={catalog}
                    onFacets={setFacets}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          {chips.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <Button
                  key={chip.key}
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label={`${copy.removeFilter}: ${chip.label}`}
                  onClick={chip.remove}
                >
                  <span className="text-muted-foreground">{chip.group}</span>
                  <span className="max-w-48 truncate">{chip.label}</span>
                  <XIcon data-icon="inline-end" />
                </Button>
              ))}
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
        </div>
      </div>
    </main>
  )
}

function FacetColumn({
  idPrefix,
  facets,
  catalog,
  onFacets,
}: {
  idPrefix: string
  facets: FacetFilters
  catalog: ReturnType<typeof facetCatalog>
  onFacets: (update: (current: FacetFilters) => FacetFilters) => void
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <h2 className="border-b border-border px-4 py-3 text-sm font-semibold">
        {copy.refine}
      </h2>
      <div className="flex flex-col gap-4 p-4">
      <ChoiceGroup
        idPrefix={`${idPrefix}-skill`}
        legend={copy.skills}
        choices={catalog.skills}
        selected={facets.skills}
        onToggle={(label, on) =>
          onFacets((current) => ({
            ...current,
            skills: setMember(current.skills, label, on),
          }))
        }
      />
      <ChoiceGroup
        idPrefix={`${idPrefix}-topic`}
        legend={copy.researchTopics}
        choices={catalog.topics}
        selected={facets.topics}
        onToggle={(label, on) =>
          onFacets((current) => ({
            ...current,
            topics: setMember(current.topics, label, on),
          }))
        }
      />
      <PagedChoices
        idPrefix={`${idPrefix}-history`}
        legend={copy.researchHistory}
        placeholder={copy.searchHistory}
        choices={catalog.history}
        selected={facets.history}
        isChecked={(choice) => facets.history.includes(choice.label)}
        onCheckedChange={(choice, on) =>
          onFacets((current) => ({
            ...current,
            history: setMember(current.history, choice.label, on),
          }))
        }
      />
      <FieldSet className="gap-2">
        <FieldLegend variant="label">{copy.previousProjects}</FieldLegend>
        <ChoiceRow
          id={`${idPrefix}-completed-any`}
          choice={catalog.anyCompleted}
          checked={facets.completed === "any"}
          onCheckedChange={(on) =>
            onFacets((current) => ({
              ...current,
              completed: on ? "any" : "all",
            }))
          }
        />
        <PagedChoices
          idPrefix={`${idPrefix}-project`}
          legend={copy.previousProjects}
          placeholder={copy.searchProjects}
          hideLegend
          choices={catalog.projects}
          selected={
            Array.isArray(facets.completed)
              ? facets.completed.map(String)
              : []
          }
          isChecked={(choice) =>
            Array.isArray(facets.completed) &&
            facets.completed.includes(Number(choice.value))
          }
          onCheckedChange={(choice, on) =>
            onFacets((current) => ({
              ...current,
              completed: setProject(current.completed, Number(choice.value), on),
            }))
          }
        />
      </FieldSet>
      </div>
    </section>
  )
}

function ChoiceGroup({
  idPrefix,
  legend,
  choices,
  selected,
  onToggle,
}: {
  idPrefix: string
  legend: string
  choices: FacetChoice[]
  selected: readonly string[]
  onToggle: (label: string, on: boolean) => void
}) {
  return (
    <FieldSet className="gap-2 border-b border-border pb-4">
      <FieldLegend variant="label">{legend}</FieldLegend>
      {choices.map((choice, index) => (
        <ChoiceRow
          key={choice.value}
          id={`${idPrefix}-${index}`}
          choice={choice}
          checked={selected.includes(choice.label)}
          onCheckedChange={(on) => onToggle(choice.label, on)}
        />
      ))}
    </FieldSet>
  )
}

function PagedChoices({
  idPrefix,
  legend,
  placeholder,
  hideLegend = false,
  choices,
  selected,
  isChecked,
  onCheckedChange,
}: {
  idPrefix: string
  legend: string
  placeholder: string
  hideLegend?: boolean
  choices: FacetChoice[]
  selected: readonly string[]
  isChecked: (choice: FacetChoice) => boolean
  onCheckedChange: (choice: FacetChoice, on: boolean) => void
}) {
  const [query, setQuery] = useState("")
  const [limit, setLimit] = useState(FACET_PAGE)
  const window = facetWindow(choices, { query, limit, selected })
  const rows = (
    <>
      <Input
        value={query}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => {
          setQuery(event.target.value)
          setLimit(FACET_PAGE)
        }}
        className={controlFocus}
      />
      {window.visible.map((choice, index) => (
        <ChoiceRow
          key={choice.value}
          id={`${idPrefix}-${index}`}
          choice={choice}
          checked={isChecked(choice)}
          onCheckedChange={(on) => onCheckedChange(choice, on)}
        />
      ))}
      {window.visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">{copy.noFacetMatches}</p>
      ) : null}
      {window.remaining > 0 ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={() => setLimit((current) => current + FACET_PAGE)}
        >
          {copy.showMore}
        </Button>
      ) : null}
    </>
  )
  if (hideLegend) return <div className="flex flex-col gap-2">{rows}</div>
  return (
    <FieldSet className="gap-2 border-b border-border pb-4">
      <FieldLegend variant="label">{legend}</FieldLegend>
      {rows}
    </FieldSet>
  )
}

function ChoiceRow({
  id,
  choice,
  checked,
  onCheckedChange,
}: {
  id: string
  choice: FacetChoice
  checked: boolean
  onCheckedChange: (on: boolean) => void
}) {
  return (
    <Field orientation="horizontal">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      <FieldLabel htmlFor={id} className="min-w-0 font-normal">
        <span className="truncate">{choice.label}</span>
        <span className="shrink-0 text-muted-foreground">({choice.count})</span>
      </FieldLabel>
    </Field>
  )
}

function SuggestionLabel({ label, query }: { label: string; query: string }) {
  const needle = query.trim().toLocaleLowerCase("en")
  const folded = label.toLocaleLowerCase("en")
  const index = folded.indexOf(needle)
  if (needle === "" || index < 0 || folded.length !== label.length) {
    return label
  }
  return (
    <>
      {label.slice(0, index)}
      <span className="font-medium">{label.slice(index, index + needle.length)}</span>
      {label.slice(index + needle.length)}
    </>
  )
}

function setMember(
  values: readonly string[],
  label: string,
  on: boolean
): string[] {
  if (on) return values.includes(label) ? [...values] : [...values, label]
  return values.filter((value) => value !== label)
}

function setProject(
  completed: FacetFilters["completed"],
  id: number,
  on: boolean
): FacetFilters["completed"] {
  const current = Array.isArray(completed) ? completed : []
  if (!on) {
    const next = current.filter((value) => value !== id)
    return next.length === 0 ? "all" : next
  }
  return current.includes(id) ? current : [...current, id]
}

function addFacet(current: FacetFilters, suggestion: SearchSuggestion): FacetFilters {
  if (suggestion.field === "topic") {
    return { ...current, topics: setMember(current.topics, suggestion.label, true) }
  }
  if (suggestion.field === "skill") {
    return { ...current, skills: setMember(current.skills, suggestion.label, true) }
  }
  if (suggestion.field === "history") {
    return {
      ...current,
      history: setMember(current.history, suggestion.label, true),
    }
  }
  if (suggestion.field === "previousProject") {
    const project = completedProjectChoices().find(
      (item) => item.name === suggestion.label
    )
    if (!project) return current
    return {
      ...current,
      completed: setProject(current.completed, project.id, true),
    }
  }
  return current
}

function activeChips(
  facets: FacetFilters,
  onFacets: (update: (current: FacetFilters) => FacetFilters) => void
): { key: string; group: string; label: string; remove: () => void }[] {
  const chips: { key: string; group: string; label: string; remove: () => void }[] =
    []
  for (const label of facets.topics) {
    chips.push({
      key: `topic:${label}`,
      group: copy.researchTopics,
      label,
      remove: () =>
        onFacets((current) => ({
          ...current,
          topics: current.topics.filter((value) => value !== label),
        })),
    })
  }
  for (const label of facets.skills) {
    chips.push({
      key: `skill:${label}`,
      group: copy.skills,
      label,
      remove: () =>
        onFacets((current) => ({
          ...current,
          skills: current.skills.filter((value) => value !== label),
        })),
    })
  }
  for (const label of facets.history) {
    chips.push({
      key: `history:${label}`,
      group: copy.researchHistory,
      label,
      remove: () =>
        onFacets((current) => ({
          ...current,
          history: current.history.filter((value) => value !== label),
        })),
    })
  }
  if (facets.completed === "any") {
    chips.push({
      key: "completed:any",
      group: copy.previousProjects,
      label: copy.anyCompletedProject,
      remove: () => onFacets((current) => ({ ...current, completed: "all" })),
    })
  }
  if (Array.isArray(facets.completed)) {
    for (const id of facets.completed) {
      const name =
        completedProjectChoices().find((project) => project.id === id)?.name ??
        String(id)
      chips.push({
        key: `project:${id}`,
        group: copy.previousProjects,
        label: name,
        remove: () =>
          onFacets((current) => ({
            ...current,
            completed: setProject(current.completed, id, false),
          })),
      })
    }
  }
  return chips
}
