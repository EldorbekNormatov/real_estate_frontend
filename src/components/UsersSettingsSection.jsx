import { useCallback, useEffect, useState } from 'react'
import { createCrmUser, fetchCrmUsers, updateCrmUser } from '../api/crm.js'
import { useAuth } from '../context/AuthContext.jsx'
import {
  ROLE_LABELS,
  ROLES,
  canManageUsers,
  getAssignableRoles,
} from '../constants/roles.js'

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1e9e8a] focus:ring-2 focus:ring-[#1e9e8a]/20'

export default function UsersSettingsSection() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: ROLES.sales_operator,
  })

  const assignableRoles = getAssignableRoles(currentUser?.role)
  const mayManage = canManageUsers(currentUser?.role)

  const load = useCallback(async () => {
    const res = await fetchCrmUsers()
    setUsers(res.data || [])
  }, [])

  useEffect(() => {
    if (!mayManage) {
      setLoading(false)
      return
    }
    load()
      .catch((e) => setErr(e.message || 'Yuklashda xatolik'))
      .finally(() => setLoading(false))
  }, [load, mayManage])

  async function handleCreate(e) {
    e.preventDefault()
    setErr('')
    setSuccess('')
    setPending(true)
    try {
      const res = await createCrmUser({
        username: form.username.trim(),
        password: form.password,
        role: form.role,
      })
      setSuccess(res.message || 'Foydalanuvchi yaratildi')
      setForm({
        username: '',
        password: '',
        role: ROLES.sales_operator,
      })
      await load()
    } catch (e) {
      setErr(e.message || 'Xatolik')
    } finally {
      setPending(false)
    }
  }

  async function toggleActive(u) {
    if (String(u._id) === String(currentUser?.id) && u.isActive) {
      setErr('O‘zingizni o‘chirib bo‘lmaydi')
      return
    }
    setErr('')
    setSuccess('')
    setPending(true)
    try {
      await updateCrmUser(u._id, { isActive: !u.isActive })
      setSuccess(u.isActive ? 'Foydalanuvchi nofaol qilindi' : 'Foydalanuvchi faollashtirildi')
      await load()
    } catch (e) {
      setErr(e.message || 'Xatolik')
    } finally {
      setPending(false)
    }
  }

  if (!mayManage) {
    return (
      <section className="max-w-2xl rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        Foydalanuvchilarni boshqarish faqat <strong>Admin</strong> va{' '}
        <strong>Menejer</strong> uchun mavjud.
      </section>
    )
  }

  return (
    <section className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15 text-2xl">
          👤
        </span>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Foydalanuvchilar</h2>
          <p className="mt-1 text-sm text-slate-500">
            Yangi xodimlarni qo‘shing. Ular faqat tizimga kirishadi — ommaviy ro‘yxatdan o‘tish yo‘q.
          </p>
        </div>
      </div>

      {err ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {err}
        </div>
      ) : null}
      {success ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      ) : null}

      <form onSubmit={handleCreate} className="mb-8 space-y-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
        <p className="text-sm font-medium text-slate-800">Yangi foydalanuvchi</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Foydalanuvchi nomi <span className="text-rose-500">*</span>
            </label>
            <input
              required
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              className={inputCls}
              placeholder="masalan: operator1"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Parol <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="password"
              minLength={6}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className={inputCls}
              placeholder="Kamida 6 belgi"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Rol</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className={inputCls}
            >
              {assignableRoles.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r] || r}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-gradient-to-r from-[#1e9e8a] to-[#17806f] px-5 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-60"
        >
          {pending ? 'Saqlanmoqda…' : 'Foydalanuvchi qo‘shish'}
        </button>
      </form>

      <div>
        <p className="mb-3 text-sm font-medium text-slate-800">Mavjud foydalanuvchilar</p>
        {loading ? (
          <p className="text-sm text-slate-500">Yuklanmoqda…</p>
        ) : users.length ? (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {users.map((u) => (
              <li
                key={u._id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {u.username}
                    {String(u._id) === String(currentUser?.id) ? (
                      <span className="ml-2 text-xs font-normal text-slate-500">(siz)</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-slate-500">
                    {ROLE_LABELS[u.role] || u.role}
                    {' · '}
                    {u.isActive ? 'Faol' : 'Nofaol'}
                  </p>
                </div>
                {String(u._id) !== String(currentUser?.id) ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => toggleActive(u)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                      u.isActive
                        ? 'border border-rose-200 text-rose-700 hover:bg-rose-50'
                        : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    } disabled:opacity-50`}
                  >
                    {u.isActive ? 'Nofaol qilish' : 'Faollashtirish'}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Foydalanuvchi yo‘q</p>
        )}
      </div>
    </section>
  )
}
