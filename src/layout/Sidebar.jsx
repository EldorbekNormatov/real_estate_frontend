import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ROLE_LABELS, canManageUsers } from '../constants/roles.js'

const linkCls = ({ isActive }) =>
  [
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9rem] font-medium transition-colors',
    isActive
      ? 'bg-white/10 text-white'
      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
  ].join(' ')

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="flex h-svh w-[260px] shrink-0 flex-col border-r border-white/[0.06] bg-[#15192b] text-slate-200">
      <div className="px-5 py-6">
        <Link
          to="/leadlar"
          className="flex items-center gap-2 rounded-xl transition-colors hover:bg-white/5 -mx-2 px-2 py-1"
          title="Bosh sahifa — Leadlar"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e9e8a]/25 text-lg">
            ⌂
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Uy CRM</p>
            <p className="text-[0.65rem] uppercase tracking-wider text-slate-500">
              Ko‘chmas mulk
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        <p className="px-3 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Asosiy
        </p>
        <NavLink to="/leadlar" end className={linkCls}>
          <span className="text-lg leading-none opacity-90">◉</span>
          Leadlar
        </NavLink>
        <NavLink to="/statistika" className={linkCls}>
          <span className="text-lg leading-none opacity-90">▣</span>
          Statistika
        </NavLink>

        <p className="mt-8 px-3 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Boshqaruv
        </p>
        {canManageUsers(user?.role) ? (
          <NavLink to="/sozlamalar" className={linkCls}>
            <span className="text-lg leading-none opacity-90">⚙</span>
            Sozlamalar
          </NavLink>
        ) : (
          <div className="cursor-not-allowed rounded-xl px-3 py-2.5 text-[0.9rem] text-slate-600">
            Sozlamalar
          </div>
        )}
      </nav>

      <div className="border-t border-white/[0.06] p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#1e9e8a] to-[#0f766e] text-sm font-bold text-white">
            {(user?.username || '?').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user?.username || '—'}
            </p>
            <p className="truncate text-[0.7rem] text-slate-500">
              {ROLE_LABELS[user?.role] || user?.role || '—'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="w-full rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          Chiqish
        </button>
      </div>
    </aside>
  )
}
