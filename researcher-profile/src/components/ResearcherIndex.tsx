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
  searchResearchers,
} from "@/data/profile.ts"
import type { PreviousFilter } from "@/types/researcher.ts"

const controlFocus =
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"

export function ResearcherIndex() {
  const [query, setQuery] = useState("")
  const [previous, setPrevious] = useState<PreviousFilter>("all")
  const results = searchResearchers({ query, previous })
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
          <Input
            id="researcher-search"
            value={query}
            placeholder={copy.searchPlaceholder}
            onChange={(event) => setQuery(event.target.value)}
            className={controlFocus}
          />
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
      {results.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {emptyResultCopy({
            query,
            previous,
            matchCount: 0,
            completedAssignmentCount: countResearchersWithCompletedProjects(),
          })}
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
