import { Link } from "react-router"

import { Badge } from "@/components/ui/badge.tsx"
import { copy, memberStatusLabel } from "@/copy.ts"
import { listResearchers } from "@/data/profile.ts"

export function ResearcherIndex() {
  const researchers = listResearchers()

  return (
    <main className="flex min-h-svh flex-col gap-6 px-6 py-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">{copy.product}</p>
        <h1 className="text-2xl font-semibold">{copy.researchers}</h1>
      </header>
      <ul className="flex list-none flex-col p-0">
        {researchers.map((row) => (
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
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
