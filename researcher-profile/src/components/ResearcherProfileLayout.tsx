import type { ReactNode } from "react"

export function ResearcherProfileLayout({
  title,
  children,
}: {
  title?: ReactNode
  children: ReactNode
}) {
  return (
    <div data-testid="researcher-profile">
      {title ? <div className="mb-3">{title}</div> : null}
      {children}
    </div>
  )
}
