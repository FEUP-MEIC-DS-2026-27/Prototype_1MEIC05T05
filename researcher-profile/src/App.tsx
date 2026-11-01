import { BrowserRouter, Route, Routes } from "react-router"

import { ResearcherIndex } from "./components/ResearcherIndex.tsx"
import { ResearcherProfile } from "./components/ResearcherProfile.tsx"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ResearcherIndex />} />
        <Route path="/researchers/:id" element={<ResearcherProfile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
