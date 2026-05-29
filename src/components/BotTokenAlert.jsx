import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { fetchBotSettings } from '../api/crm.js'
import { useAuth } from '../context/AuthContext.jsx'
import { canManageUsers } from '../constants/roles.js'

/** Admin/menejer uchun: bot token ulanmagan bo‘lsa ogohlantirish */
export default function BotTokenAlert() {
  const { user } = useAuth()
  const location = useLocation()
  const [connected, setConnected] = useState(true)
  const [checked, setChecked] = useState(false)

  const showForRole = canManageUsers(user?.role)
  const onSettingsPage = location.pathname.startsWith('/sozlamalar')

  useEffect(() => {
    if (!showForRole) {
      setChecked(true)
      return
    }

    let cancelled = false
    fetchBotSettings()
      .then((data) => {
        if (!cancelled) setConnected(Boolean(data.connected))
      })
      .catch(() => {
        if (!cancelled) setConnected(false)
      })
      .finally(() => {
        if (!cancelled) setChecked(true)
      })

    return () => {
      cancelled = true
    }
  }, [showForRole, location.pathname])

  if (!showForRole || !checked || connected || onSettingsPage) {
    return null
  }

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-950"
      role="status"
    >
      <p>
        <span className="font-semibold">Telegram bot ulanmagan.</span>{' '}
        Mijozlar bot orqali lead yubora olmaydi — token qo‘shing.
      </p>
      <Link
        to="/sozlamalar"
        className="shrink-0 rounded-lg bg-amber-800 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-900"
      >
        Sozlamalar → Bot
      </Link>
    </div>
  )
}
