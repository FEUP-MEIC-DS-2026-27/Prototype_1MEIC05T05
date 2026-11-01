import { BrowserRouter, Route, Routes } from "react-router"

import { ResearcherIndex } from "./components/ResearcherIndex.tsx"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ResearcherIndex />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
