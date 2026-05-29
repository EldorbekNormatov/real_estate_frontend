import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute() {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#f4f6f9] text-slate-600">
        Yuklanmoqda…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/kirish" replace />
  }

  return <Outlet />
}
