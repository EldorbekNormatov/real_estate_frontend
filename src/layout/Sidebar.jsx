import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import ProfileModal from '../components/ProfileModal.jsx'
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
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [menuOpen])

  function openProfile() {
    setMenuOpen(false)
    setProfileOpen(true)
  }

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col overflow-y-auto border-r border-white/[0.06] bg-[#15192b] text-slate-200">
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

      <div className="relative border-t border-white/[0.06] p-4" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className={[
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
            menuOpen
              ? 'bg-white/10 ring-1 ring-white/10'
              : 'bg-white/[0.04] hover:bg-white/[0.08]',
          ].join(' ')}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1e9e8a] to-[#0f766e] text-sm font-bold text-white">
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
          <span
            className={[
              'text-xs text-slate-500 transition-transform',
              menuOpen ? 'rotate-180' : '',
            ].join(' ')}
            aria-hidden
          >
            ▾
          </span>
        </button>

        {menuOpen ? (
          <div
            role="menu"
            className="absolute bottom-full left-4 right-4 mb-2 overflow-hidden rounded-xl border border-white/10 bg-[#1c2137] py-1 shadow-xl shadow-black/40"
          >
            <button
              type="button"
              role="menuitem"
              onClick={openProfile}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-200 transition-colors hover:bg-white/10"
            >
              <span className="text-base opacity-80">👤</span>
              Profil sozlamalari
            </button>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => logout()}
          className="mt-3 w-full rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          Chiqish
        </button>
      </div>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </aside>
  )
}
