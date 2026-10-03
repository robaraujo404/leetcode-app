import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './lib/i18n'
import { NavProvider } from './lib/nav'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <NavProvider>
        <App />
      </NavProvider>
    </LanguageProvider>
  </StrictMode>,
)
