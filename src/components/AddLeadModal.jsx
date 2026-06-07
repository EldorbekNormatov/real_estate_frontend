import { useEffect, useRef, useState } from 'react'
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

const MAX_IMAGES = 10

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1e9e8a] focus:ring-2 focus:ring-[#1e9e8a]/20'

export default function AddLeadModal({ open, onClose, operators, onCreated }) {
  const [form, setForm] = useState(EMPTY)
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    const urls = images.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [images])

  if (!open) return null

  const canAddMore = images.length < MAX_IMAGES

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function resetForm() {
    setForm(EMPTY)
    setImages([])
    setDragging(false)
    setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleClose() {
    if (pending) return
    resetForm()
    onClose()
  }

  function addImageFiles(fileList) {
    const picked = Array.from(fileList || []).filter((f) =>
      f.type.startsWith('image/'),
    )
    if (!picked.length) return
    setImages((prev) => {
      const room = MAX_IMAGES - prev.length
      return [...prev, ...picked.slice(0, room)]
    })
  }

  function handleFiles(e) {
    addImageFiles(e.target.files)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleDragOver(e) {
    e.preventDefault()
    e.stopPropagation()
    if (canAddMore && !pending) setDragging(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
    if (pending || !canAddMore) return
    addImageFiles(e.dataTransfer.files)
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setPending(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name.trim())
      fd.append('phone', form.phone.trim())
      if (form.district.trim()) fd.append('district', form.district.trim())
      if (form.propertyType.trim()) fd.append('propertyType', form.propertyType.trim())
      if (form.price.trim()) fd.append('price', form.price.trim())
      if (form.description.trim()) fd.append('description', form.description.trim())
      if (form.purpose) fd.append('purpose', form.purpose)
      fd.append('status', form.status)
      if (form.assignedTo) fd.append('assignedTo', form.assignedTo)
      images.forEach((file) => fd.append('images', file))

      await createLead(fd)
      resetForm()
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

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Rasmlar ({images.length}/{MAX_IMAGES})
              </label>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFiles}
                disabled={pending || !canAddMore}
                className="sr-only"
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={[
                  'rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors',
                  dragging
                    ? 'border-[#1e9e8a] bg-[#1e9e8a]/10'
                    : 'border-slate-200 bg-slate-50',
                  pending || !canAddMore ? 'opacity-60' : '',
                ].join(' ')}
              >
                <p className="text-sm font-medium text-slate-700">
                  {dragging ? 'Rasmlarni shu yerga qo‘ying' : 'Rasmlarni sudrab tashlang'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  maksimum {MAX_IMAGES} ta rasm
                </p>
              </div>

              <button
                type="button"
                disabled={pending || !canAddMore}
                onClick={() => fileRef.current?.click()}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-[#1e9e8a]/40 hover:bg-[#1e9e8a]/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Fayllarni tanlash
              </button>

              {previews.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {previews.map((src, i) => (
                    <div
                      key={`${src}-${i}`}
                      className="relative h-16 w-16 overflow-hidden rounded-lg ring-1 ring-slate-200"
                    >
                      <img src={src} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        disabled={pending}
                        className="absolute right-0.5 top-0.5 rounded bg-black/60 px-1 text-[10px] text-white hover:bg-black/80"
                        aria-label="Rasmni olib tashlash"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
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
