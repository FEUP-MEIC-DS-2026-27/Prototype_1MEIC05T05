import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <div className="container py-4">
        <App basePath="" />
      </div>
    </BrowserRouter>
  </StrictMode>,
)
