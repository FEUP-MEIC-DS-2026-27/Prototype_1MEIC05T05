import { useState, type FocusEvent, type KeyboardEvent } from 'react'

import { copy, type SearchSuggestion } from '../shared'

const suggestionListId = 'researcher-suggestions'

const suggestionGroup: Record<SearchSuggestion['field'], string> = {
  name: copy.name,
  topic: copy.researchTopics,
  skill: copy.skills,
  history: copy.researchHistory,
  previousProject: copy.previousProjects,
}

type SuggestionGroup = {
  field: SearchSuggestion['field']
  items: { suggestion: SearchSuggestion; index: number }[]
}

function groupSuggestions(suggestions: readonly SearchSuggestion[]): SuggestionGroup[] {
  const groups: SuggestionGroup[] = []
  suggestions.forEach((suggestion, index) => {
    const last = groups[groups.length - 1]
    if (!last || last.field !== suggestion.field) {
      groups.push({ field: suggestion.field, items: [{ suggestion, index }] })
    } else {
      last.items.push({ suggestion, index })
    }
  })
  return groups
}

function SuggestionLabel({ label, query }: { label: string; query: string }) {
  const needle = query.trim().toLocaleLowerCase('en')
  const folded = label.toLocaleLowerCase('en')
  const index = folded.indexOf(needle)
  if (needle === '' || index < 0 || folded.length !== label.length) {
    return label
  }
  return (
    <>
      {label.slice(0, index)}
      <span className="fw-semibold">{label.slice(index, index + needle.length)}</span>
      {label.slice(index + needle.length)}
    </>
  )
}

export default function SearchBar({
  query,
  suggestions,
  onQueryChange,
  onPick,
}: {
  query: string
  suggestions: readonly SearchSuggestion[]
  onQueryChange: (value: string) => void
  onPick: (suggestion: SearchSuggestion) => void
}) {
  const [searchFocused, setSearchFocused] = useState(false)
  const [escapeDismissed, setEscapeDismissed] = useState(false)
  const [pickDismissed, setPickDismissed] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(0)
  const suggestionsOpen = searchFocused && !escapeDismissed && !pickDismissed && suggestions.length > 0
  const activeSuggestionIndex = suggestionsOpen ? Math.min(activeSuggestion, suggestions.length - 1) : 0

  function pickSuggestion(suggestion: SearchSuggestion) {
    onPick(suggestion)
    setPickDismissed(true)
    setActiveSuggestion(0)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!suggestionsOpen) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveSuggestion((index) => Math.min(index + 1, suggestions.length - 1))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveSuggestion((index) => Math.max(index - 1, 0))
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      const suggestion = suggestions[activeSuggestionIndex]
      if (suggestion) pickSuggestion(suggestion)
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      setEscapeDismissed(true)
    }
  }

  function onBlur(event: FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget
    if (next instanceof Node && event.currentTarget.contains(next)) return
    setSearchFocused(false)
    setEscapeDismissed(false)
  }

  return (
    <div className="flex-grow-1" onFocus={() => setSearchFocused(true)} onBlur={onBlur}>
      <label htmlFor="researcher-search" className="form-label">
        {copy.search}
      </label>
      <input
        id="researcher-search"
        className="form-control"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={suggestionsOpen}
        aria-controls={suggestionsOpen ? suggestionListId : undefined}
        aria-activedescendant={suggestionsOpen ? `${suggestionListId}-${activeSuggestionIndex}` : undefined}
        value={query}
        placeholder={copy.searchPlaceholder}
        onChange={(event) => {
          onQueryChange(event.target.value)
          setEscapeDismissed(false)
          setPickDismissed(false)
          setActiveSuggestion(0)
        }}
        onKeyDown={onKeyDown}
      />
      {suggestionsOpen ? (
        <div id={suggestionListId} role="listbox" aria-label={copy.suggestions} className="list-group mt-1">
          {groupSuggestions(suggestions).map((group) => (
            <div key={group.field} role="group" aria-label={suggestionGroup[group.field]}>
              <div className="list-group-item py-1 small text-body-secondary">{suggestionGroup[group.field]}</div>
              {group.items.map(({ suggestion, index }) => {
                const selected = index === activeSuggestionIndex
                return (
                  <div
                    key={`${suggestion.field}-${suggestion.label}`}
                    id={`${suggestionListId}-${index}`}
                    role="option"
                    aria-selected={selected}
                    className={`list-group-item list-group-item-action${selected ? ' active' : ''}`}
                    onMouseEnter={() => setActiveSuggestion(index)}
                    onPointerDown={(event) => {
                      event.preventDefault()
                      pickSuggestion(suggestion)
                    }}
                  >
                    <SuggestionLabel label={suggestion.label} query={query} />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
