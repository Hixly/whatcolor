import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SettingsProvider } from './contexts/SettingsContext'
import LandingPage from './components/landing/LandingPage'
import AppPage from './components/app/AppPage'
import SettingsPage from './components/settings/SettingsPage'

export default function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<AppPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  )
}
