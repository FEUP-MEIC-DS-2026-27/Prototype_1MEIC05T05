import { useState } from "react"

import { copy } from "../copy.ts"
import {
  completedProjectChoices,
  facetWindow,
  FACET_PAGE,
} from "../data/profile.ts"
import type {
  FacetCatalog,
  FacetChoice,
  FacetFilters,
  SearchSuggestion,
} from "../types/researcher.ts"

export function setMember(
  values: readonly string[],
  label: string,
  on: boolean
): string[] {
  if (on) return values.includes(label) ? [...values] : [...values, label]
  return values.filter((value) => value !== label)
}

export function setProject(
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

export function addFacet(
  current: FacetFilters,
  suggestion: SearchSuggestion
): FacetFilters {
  if (suggestion.field === "topic") {
    return {
      ...current,
      topics: setMember(current.topics, suggestion.label, true),
    }
  }
  if (suggestion.field === "skill") {
    return {
      ...current,
      skills: setMember(current.skills, suggestion.label, true),
    }
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

export function activeChips(
  facets: FacetFilters,
  onFacets: (update: (current: FacetFilters) => FacetFilters) => void
): { key: string; group: string; label: string; remove: () => void }[] {
  const chips: {
    key: string
    group: string
    label: string
    remove: () => void
  }[] = []
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
    <div className="form-check">
      <input
        id={id}
        className="form-check-input"
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
      />
      <label className="form-check-label d-flex gap-2" htmlFor={id}>
        <span className="text-truncate">{choice.label}</span>
        <span className="text-body-secondary">({choice.count})</span>
      </label>
    </div>
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
    <fieldset className="border-bottom pb-3 mb-3">
      <legend className="form-label fw-semibold float-none w-auto px-0">
        {legend}
      </legend>
      {choices.map((choice, index) => (
        <ChoiceRow
          key={choice.value}
          id={`${idPrefix}-${index}`}
          choice={choice}
          checked={selected.includes(choice.label)}
          onCheckedChange={(on) => onToggle(choice.label, on)}
        />
      ))}
    </fieldset>
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
      <input
        className="form-control form-control-sm mb-2"
        value={query}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => {
          setQuery(event.target.value)
          setLimit(FACET_PAGE)
        }}
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
        <p className="text-body-secondary small mb-0">{copy.noFacetMatches}</p>
      ) : null}
      {window.remaining > 0 ? (
        <button
          type="button"
          className="btn btn-link btn-sm px-0"
          onClick={() => setLimit((current) => current + FACET_PAGE)}
        >
          {copy.showMore}
        </button>
      ) : null}
    </>
  )
  if (hideLegend) return <div className="d-flex flex-column">{rows}</div>
  return (
    <fieldset className="border-bottom pb-3 mb-3">
      <legend className="form-label fw-semibold float-none w-auto px-0">
        {legend}
      </legend>
      {rows}
    </fieldset>
  )
}

export function FacetPanel({
  idPrefix,
  facets,
  catalog,
  onFacets,
}: {
  idPrefix: string
  facets: FacetFilters
  catalog: FacetCatalog
  onFacets: (update: (current: FacetFilters) => FacetFilters) => void
}) {
  return (
    <section className="card">
      <h2 className="card-header h6 mb-0">{copy.refine}</h2>
      <div className="card-body">
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
        <fieldset>
          <legend className="form-label fw-semibold float-none w-auto px-0">
            {copy.previousProjects}
          </legend>
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
                completed: setProject(
                  current.completed,
                  Number(choice.value),
                  on
                ),
              }))
            }
          />
        </fieldset>
      </div>
    </section>
  )
}
