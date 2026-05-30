import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  disconnectGoogleAccount,
  exportLeadsCsv,
  exportToGoogleSheet,
  fetchSheetSettings,
  getGoogleConnectUrl,
  importFromGoogleSheet,
  removeGoogleSheet,
} from '../api/crm.js'

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1e9e8a] focus:ring-2 focus:ring-[#1e9e8a]/20'

export default function GoogleSheetsSection({ onMessage }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [settings, setSettings] = useState(null)
  const [urlInput, setUrlInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [action, setAction] = useState('')

  const load = useCallback(async () => {
    const data = await fetchSheetSettings()
    setSettings(data)
    if (data.sheet?.spreadsheetUrl) {
      setUrlInput(data.sheet.spreadsheetUrl)
    }
  }, [])

  useEffect(() => {
    load()
      .catch((e) => onMessage?.({ type: 'error', text: e.message }))
      .finally(() => setLoading(false))
  }, [load, onMessage])

  useEffect(() => {
    const status = searchParams.get('sheets')
    if (!status) return

    if (status === 'connected') {
      onMessage?.({ type: 'success', text: 'Google hisob ulandi — endi jadvalga yozish mumkin' })
      load().catch(() => {})
    } else if (status === 'error') {
      const msg = searchParams.get('message') || 'Google ulanishda xatolik'
      onMessage?.({ type: 'error', text: decodeURIComponent(msg) })
    }

    searchParams.delete('sheets')
    searchParams.delete('message')
    setSearchParams(searchParams, { replace: true })
  }, [searchParams, setSearchParams, onMessage, load])

  async function handleConnectGoogle() {
    setPending(true)
    setAction('connect')
    try {
      const { url } = await getGoogleConnectUrl()
      window.location.href = url
    } catch (e) {
      onMessage?.({ type: 'error', text: e.message })
      setPending(false)
      setAction('')
    }
  }

  async function handleDisconnectGoogle() {
    if (!window.confirm('Google hisob uzilsinmi?')) return
    setPending(true)
    try {
      const res = await disconnectGoogleAccount()
      onMessage?.({ type: 'success', text: res.message })
      await load()
    } catch (e) {
      onMessage?.({ type: 'error', text: e.message })
    } finally {
      setPending(false)
    }
  }

  async function handleImport() {
    if (!urlInput.trim()) {
      onMessage?.({ type: 'error', text: 'Jadval havolasini kiriting' })
      return
    }
    if (!window.confirm('Jadvaldagi ma’lumotlar lead sifatida qo‘shiladi. Davom etasizmi?')) {
      return
    }
    setPending(true)
    setAction('import')
    try {
      const res = await importFromGoogleSheet(urlInput.trim())
      onMessage?.({
        type: 'success',
        text: `${res.message} (o‘tkazib yuborilgan: ${res.skipped ?? 0})`,
      })
      await load()
    } catch (e) {
      onMessage?.({ type: 'error', text: e.message })
    } finally {
      setPending(false)
      setAction('')
    }
  }

  async function handleExportGoogle() {
    if (!window.confirm('Barcha leadlar Google jadvalga yoziladi. Davom etasizmi?')) {
      return
    }
    setPending(true)
    setAction('export')
    try {
      const res = await exportToGoogleSheet()
      onMessage?.({ type: 'success', text: res.message })
    } catch (e) {
      onMessage?.({ type: 'error', text: e.message })
    } finally {
      setPending(false)
      setAction('')
    }
  }

  async function handleExportCsv() {
    setPending(true)
    setAction('csv')
    try {
      const res = await exportLeadsCsv()
      const blob = new Blob(['\uFEFF' + res.csv], {
        type: 'text/csv;charset=utf-8',
      })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = res.filename || 'mijozlar.csv'
      a.click()
      URL.revokeObjectURL(a.href)
      onMessage?.({ type: 'success', text: res.message })
    } catch (e) {
      onMessage?.({ type: 'error', text: e.message })
    } finally {
      setPending(false)
      setAction('')
    }
  }

  async function handleRemoveSheet() {
    if (!window.confirm('Saqlangan jadval havolasini olib tashlaysizmi?')) return
    setPending(true)
    try {
      await removeGoogleSheet()
      setUrlInput('')
      onMessage?.({ type: 'success', text: 'Jadval havolasi olib tashlandi' })
      await load()
    } catch (e) {
      onMessage?.({ type: 'error', text: e.message })
    } finally {
      setPending(false)
    }
  }

  if (loading) {
    return (
      <section className="max-w-xl rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
        Google Sheets yuklanmoqda…
      </section>
    )
  }

  const googleConnected = settings?.googleConnected
  const oauthReady = settings?.oauthAppConfigured

  return (
    <section className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#34A853]/15 text-2xl">
          ▦
        </span>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Google Sheets</h2>
          <p className="mt-1 text-sm text-slate-500">
            Jadval havolasini kiriting va import qiling. Parol yoki texnik sozlama
            kerak emas.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="sheet-url" className="mb-1.5 block text-sm font-medium text-slate-700">
            Google Sheets havolasi
          </label>
          <input
            id="sheet-url"
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            className={inputCls}
          />
          <p className="mt-2 text-xs text-slate-500">
            Import uchun: Google Sheets → <strong>Ulashish</strong> →{' '}
            <strong>Havola bilan ko‘ruvchi</strong> (yoki Google hisob ulangan
            bo‘lsa, shaxsiy jadval ham ishlaydi).
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={handleImport}
            className="rounded-xl border border-[#1e9e8a]/40 bg-[#1e9e8a]/10 px-5 py-2.5 text-sm font-semibold text-[#17806f] hover:bg-[#1e9e8a]/20 disabled:opacity-60"
          >
            {pending && action === 'import' ? 'Import…' : 'Import qilish'}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={handleExportCsv}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {pending && action === 'csv' ? 'Yuklanmoqda…' : 'CSV yuklab olish'}
          </button>
          {googleConnected ? (
            <button
              type="button"
              disabled={pending}
              onClick={handleExportGoogle}
              className="rounded-xl bg-gradient-to-r from-[#1e9e8a] to-[#17806f] px-5 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-60"
            >
              {pending && action === 'export' ? 'Export…' : 'Jadvalga yozish'}
            </button>
          ) : null}
        </div>

        {settings?.sheetConnected ? (
          <button
            type="button"
            disabled={pending}
            onClick={handleRemoveSheet}
            className="text-xs text-slate-500 underline hover:text-slate-700"
          >
            Saqlangan havolani olib tashlash
          </button>
        ) : null}
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <p className="mb-3 text-sm font-medium text-slate-700">
          Yopiq jadvalga to‘g‘ridan-to‘g‘ri yozish (ixtiyoriy)
        </p>
        {googleConnected ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <span>
              Google: <strong>{settings.googleEmail}</strong>
            </span>
            <button
              type="button"
              disabled={pending}
              onClick={handleDisconnectGoogle}
              className="rounded-lg border border-rose-200 bg-white px-3 py-1 text-xs text-rose-800"
            >
              Uzish
            </button>
          </div>
        ) : oauthReady ? (
          <button
            type="button"
            disabled={pending}
            onClick={handleConnectGoogle}
            className="rounded-xl bg-[#4285F4] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending && action === 'connect' ? 'Yo‘naltirilmoqda…' : 'Google bilan ulash'}
          </button>
        ) : (
          <p className="text-xs text-slate-500">
            Shaxsiy jadvalga yozish uchun administrator Google OAuth ni serverda
            bir marta sozlaydi. Import ochiq jadval orqali hozir ham ishlaydi.
          </p>
        )}
        <p className="mt-2 text-xs text-slate-500">
          Google parolini bu yerga kiritish mumkin emas — faqat «Google bilan
          ulash» (xavfsiz ruxsat) ishlatiladi.
        </p>
      </div>
    </section>
  )
}
