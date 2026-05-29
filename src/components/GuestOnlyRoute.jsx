import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function GuestOnlyRoute({ children }) {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#0c1222] text-slate-300">
        Yuklanmoqda…
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/leadlar" replace />
  }

  return children
}
