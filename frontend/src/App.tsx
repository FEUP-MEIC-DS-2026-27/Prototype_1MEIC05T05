import { Route, Routes } from 'react-router-dom'
import PageNotFound from './components/PageNotFound'
import ResearcherProfileLayout from './components/ResearcherProfileLayout'
import ResearcherProfilePage from './components/ResearcherProfilePage'
import ResearcherSearchPage from './components/ResearcherSearchPage'
import { contractVersion, type ResearcherProfileProps } from './shared'

/**
 * Root component: lays out the two pages (search and profile).
 * Exposed to the host as `researcher_profile/ResearcherProfile`
 * (see module-federation.config.ts).
 * Contract v1: default export with ResearcherProfileProps, and `contractVersion`.
 * The host supplies the router. This module does not import CSS.
 */
export { contractVersion }

export default function App({ basePath }: ResearcherProfileProps) {
  return (
    <ResearcherProfileLayout>
      <Routes>
        <Route index element={<ResearcherSearchPage basePath={basePath} />} />
        <Route path=":id" element={<ResearcherProfilePage basePath={basePath} />} />
        <Route path="*" element={<PageNotFound basePath={basePath} />} />
      </Routes>
    </ResearcherProfileLayout>
  )
}
