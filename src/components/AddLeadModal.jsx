import { useState } from 'react'
import { createLead } from '../api/crm.js'

const EMPTY = {
  name: '',
  phone: '',
  district: '',
  propertyType: '',
  price: '',
  description: '',
  purpose: '',
  assignedTo: '',
  status: 'new',
}

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1e9e8a] focus:ring-2 focus:ring-[#1e9e8a]/20'

export default function AddLeadModal({ open, onClose, operators, onCreated }) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  if (!open) return null

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleClose() {
    if (pending) return
    setForm(EMPTY)
    setError('')
    onClose()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setPending(true)
    try {
      const body = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        district: form.district.trim() || undefined,
        propertyType: form.propertyType.trim() || undefined,
        price: form.price.trim() || undefined,
        description: form.description.trim() || undefined,
        purpose: form.purpose || undefined,
        status: form.status,
        assignedTo: form.assignedTo || undefined,
      }
      await createLead(body)
      setForm(EMPTY)
      onCreated()
      onClose()
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
      aria-labelledby="add-lead-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        onClick={handleClose}
        aria-label="Yopish"
      />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <h2
            id="add-lead-title"
            className="text-lg font-semibold text-slate-900"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Yangi lead qo‘shish
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
          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Ism <span className="text-rose-500">*</span>
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className={inputCls}
                placeholder="Mijoz ismi"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Telefon <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className={inputCls}
                placeholder="+998 90 123 45 67"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Hudud</label>
              <input
                value={form.district}
                onChange={(e) => update('district', e.target.value)}
                className={inputCls}
                placeholder="Yunusobod"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Mulk turi</label>
              <input
                value={form.propertyType}
                onChange={(e) => update('propertyType', e.target.value)}
                className={inputCls}
                placeholder="3 xonali kvartira"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Narx</label>
              <input
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                className={inputCls}
                placeholder="85000"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Maqsad</label>
              <select
                value={form.purpose}
                onChange={(e) => update('purpose', e.target.value)}
                className={inputCls}
              >
                <option value="">Tanlanmagan</option>
                <option value="sell">Sotuv</option>
                <option value="rent_out">Ijara</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Holat</label>
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value)}
                className={inputCls}
              >
                <option value="new">Yangi</option>
                <option value="contacted">Bog‘langan</option>
                <option value="qualified">Loyiha mos</option>
                <option value="lost">Yo‘qotilgan</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Operator</label>
              <select
                value={form.assignedTo}
                onChange={(e) => update('assignedTo', e.target.value)}
                className={inputCls}
              >
                <option value="">Biriktirilmagan (Yangi ustun)</option>
                {operators.map((op) => (
                  <option key={String(op._id)} value={String(op._id)}>
                    {op.username}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Tavsif</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                className={inputCls}
                placeholder="Qo‘shimcha ma’lumot…"
              />
            </div>
          </div>

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
