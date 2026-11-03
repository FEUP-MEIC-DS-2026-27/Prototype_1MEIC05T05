import { Route, Routes, useParams } from "react-router-dom"
import { PageNotFound } from "./components/PageNotFound.tsx"
import { ResearcherProfileLayout } from "./components/ResearcherProfileLayout.tsx"
import { parseResearcherId } from "./data/profile.ts"
import { contractVersion, type ResearcherProfileProps } from "./types.ts"

/**
 * Exposed as `researcher_profile/ResearcherProfile`.
 * Contract v1: default export with ResearcherProfileProps, and `contractVersion`.
 * The host supplies the router. This module does not import CSS.
 */
export { contractVersion }

function ResearcherIdPlaceholder({ basePath }: { basePath: string }) {
  const { id } = useParams()
  if (parseResearcherId(id) === null) {
    return <PageNotFound basePath={basePath} />
  }
  return <p>Researcher profile placeholder</p>
}

export default function ResearcherProfile({
  basePath,
}: ResearcherProfileProps) {
  return (
    <ResearcherProfileLayout>
      <Routes>
        <Route index element={<p>Researcher search placeholder</p>} />
        <Route
          path=":id"
          element={<ResearcherIdPlaceholder basePath={basePath} />}
        />
        <Route path="*" element={<PageNotFound basePath={basePath} />} />
      </Routes>
    </ResearcherProfileLayout>
  )
}
