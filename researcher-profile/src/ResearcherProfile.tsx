import { Route, Routes } from "react-router-dom"
import { PageNotFound } from "./components/PageNotFound.tsx"
import { ResearcherProfileLayout } from "./components/ResearcherProfileLayout.tsx"
import { ResearcherProfilePage } from "./components/ResearcherProfilePage.tsx"
import { ResearcherSearchPage } from "./components/ResearcherSearchPage.tsx"
import { contractVersion, type ResearcherProfileProps } from "./types.ts"

/**
 * Exposed as `researcher_profile/ResearcherProfile`.
 * Contract v1: default export with ResearcherProfileProps, and `contractVersion`.
 * The host supplies the router. This module does not import CSS.
 */
export { contractVersion }

export default function ResearcherProfile({
  basePath,
}: ResearcherProfileProps) {
  return (
    <ResearcherProfileLayout>
      <Routes>
        <Route
          index
          element={<ResearcherSearchPage basePath={basePath} />}
        />
        <Route
          path=":id"
          element={<ResearcherProfilePage basePath={basePath} />}
        />
        <Route path="*" element={<PageNotFound basePath={basePath} />} />
      </Routes>
    </ResearcherProfileLayout>
  )
}
