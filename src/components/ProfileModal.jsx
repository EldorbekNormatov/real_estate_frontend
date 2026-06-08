import { useEffect, useState } from 'react'
import { updateProfile } from '../api/crm.js'
import { useAuth } from '../context/AuthContext.jsx'
import { ROLE_LABELS } from '../constants/roles.js'

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1e9e8a] focus:ring-2 focus:ring-[#1e9e8a]/20'

export default function ProfileModal({ open, onClose }) {
  const { user, refreshUser } = useAuth()
  const [username, setUsername] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (open && user) {
      setUsername(user.username || '')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setError('')
      setSuccess('')
    }
  }, [open, user])

  if (!open) return null

  function handleClose() {
    if (pending) return
    onClose()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const nextUsername = username.trim()
    const loginChanged = nextUsername && nextUsername !== user?.username
    const passChanged = Boolean(newPassword)

    if (!loginChanged && !passChanged) {
      setError('Yangi login yoki parol kiriting')
      return
    }

    if (!currentPassword) {
      setError('Joriy parolni kiriting')
      return
    }

    if (passChanged) {
      if (newPassword.length < 6) {
        setError('Yangi parol kamida 6 belgidan iborat bo‘lishi kerak')
        return
      }
      if (newPassword !== confirmPassword) {
        setError('Yangi parollar mos kelmaydi')
        return
      }
    }

    setPending(true)
    try {
      const body = { currentPassword }
      if (loginChanged) body.username = nextUsername
      if (passChanged) body.newPassword = newPassword

      const res = await updateProfile(body)
      setSuccess(res.message || 'Profil yangilandi')
      await refreshUser()
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => onClose(), 1200)
    } catch (err) {
      setError(err?.message || 'Saqlashda xatolik')
    } finally {
      setPending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        onClick={handleClose}
        aria-label="Yopish"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2
            id="profile-title"
            className="text-lg font-semibold text-slate-900"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Profil sozlamalari
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={pending}
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p>
              Rol: <span className="font-medium text-slate-800">{ROLE_LABELS[user?.role] || user?.role}</span>
            </p>
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          ) : null}
          {success ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {success}
            </div>
          ) : null}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Login (foydalanuvchi nomi)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputCls}
              autoComplete="username"
              minLength={3}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Joriy parol <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputCls}
              autoComplete="current-password"
              placeholder="O‘zgarish uchun majburiy"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Yangi parol
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputCls}
              autoComplete="new-password"
              placeholder="O‘zgartirmasangiz bo‘sh qoldiring"
            />
          </div>

          {newPassword ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Yangi parolni tasdiqlang
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputCls}
                autoComplete="new-password"
              />
            </div>
          ) : null}

          <div className="flex gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={pending}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-xl bg-gradient-to-r from-[#1e9e8a] to-[#17806f] py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-60"
            >
              {pending ? 'Saqlanmoqda…' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
