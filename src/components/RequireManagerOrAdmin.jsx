import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { canManageUsers } from '../constants/roles.js'

export default function RequireManagerOrAdmin({ children }) {
  const { loading, user } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#f4f6f9] text-slate-600">
        Yuklanmoqda…
      </div>
    )
  }

  if (!canManageUsers(user?.role)) {
    return <Navigate to="/leadlar" replace />
  }

  return children
}
