import { Navigate, Route, Routes } from 'react-router-dom'
import GuestOnlyRoute from './components/GuestOnlyRoute.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import CrmLayout from './layout/CrmLayout.jsx'
import LeadsPage from './pages/LeadsPage.jsx'
import StatistikaPage from './pages/StatistikaPage.jsx'
import RequireManagerOrAdmin from './components/RequireManagerOrAdmin.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import SignInPage from './pages/SignInPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route
        path="/kirish"
        element={
          <GuestOnlyRoute>
            <SignInPage />
          </GuestOnlyRoute>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<CrmLayout />}>
          <Route index element={<Navigate to="/leadlar" replace />} />
          <Route path="leadlar" element={<LeadsPage />} />
          <Route path="statistika" element={<StatistikaPage />} />
          <Route
            path="sozlamalar"
            element={
              <RequireManagerOrAdmin>
                <SettingsPage />
              </RequireManagerOrAdmin>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
