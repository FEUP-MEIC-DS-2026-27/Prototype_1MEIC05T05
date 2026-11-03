import { Link, Route, Routes } from "react-router-dom"
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
  const home = basePath || "/"
  return (
    <Routes>
      <Route index element={<p>Researcher search placeholder</p>} />
      <Route path=":id" element={<p>Researcher profile placeholder</p>} />
      <Route
        path="*"
        element={
          <p>
            Page not found. <Link to={home}>Back to search</Link>
          </p>
        }
      />
    </Routes>
  )
}
