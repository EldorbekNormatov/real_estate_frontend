import { useCallback, useEffect, useState } from 'react'
import UsersSettingsSection from '../components/UsersSettingsSection.jsx'
import {
  connectBot,
  disconnectBot,
  fetchBotSettings,
} from '../api/crm.js'

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1e9e8a] focus:ring-2 focus:ring-[#1e9e8a]/20'

export default function SettingsPage() {
  const [settings, setSettings] = useState(null)
  const [tokenInput, setTokenInput] = useState('')
  const [botLoading, setBotLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')

  const loadBot = useCallback(async () => {
    const data = await fetchBotSettings()
    setSettings(data)
  }, [])

  useEffect(() => {
    loadBot()
      .catch((e) => setErr(e.message || 'Yuklashda xatolik'))
      .finally(() => setBotLoading(false))
  }, [loadBot])

  async function handleConnect(e) {
    e.preventDefault()
    setErr('')
    setSuccess('')
    if (!tokenInput.trim()) {
      setErr('Bot token kiriting')
      return
    }
    setPending(true)
    try {
      const res = await connectBot(tokenInput.trim())
      setTokenInput('')
      setSuccess(
        res.message + (res.bot?.username ? ` (@${res.bot.username})` : ''),
      )
      await loadBot()
    } catch (e) {
      setErr(e.message || 'Ulanishda xatolik')
    } finally {
      setPending(false)
    }
  }

  async function handleDisconnect() {
    if (!window.confirm('Botni uzmoqchimisiz? Telegram bot ishlamay qoladi.')) return
    setErr('')
    setSuccess('')
    setPending(true)
    try {
      const res = await disconnectBot()
      setSuccess(res.message || 'Bot uzildi')
      await loadBot()
    } catch (e) {
      setErr(e.message || 'Uzishda xatolik')
    } finally {
      setPending(false)
    }
  }

  const connected = settings?.connected
  const running = settings?.running
  const bot = settings?.bot

  return (
    <div className="p-6 lg:p-8" style={{ fontFamily: "'Instrument Sans', system-ui, sans-serif" }}>
      <header className="mb-8">
        <h1
          className="text-2xl font-semibold text-slate-900"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Sozlamalar
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Bot, foydalanuvchilar va tizim sozlamalari
        </p>
      </header>

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

      <div className="space-y-8">
        {botLoading ? (
          <div className="max-w-xl rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
            Yuklanmoqda…
          </div>
        ) : (
          <section className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#229ED9]/15 text-2xl">
                ✈
              </span>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Telegram bot</h2>
                <p className="mt-1 text-sm text-slate-500">
                  @BotFather dan olingan token. Yangi token eskisini avtomatik almashtiradi.
                </p>
              </div>
            </div>

            {connected && bot ? (
              <div className="mb-6 rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-emerald-900">Ulangan bot</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.65rem] font-medium ${
                      running
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-amber-200 text-amber-900'
                    }`}
                  >
                    {running ? 'Ishlayapti' : 'To‘xtagan'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-emerald-800">
                  {bot.firstName ? `${bot.firstName} ` : ''}
                  {bot.username ? (
                    <span className="font-medium">@{bot.username}</span>
                  ) : null}
                </p>
                <p className="mt-1 font-mono text-xs text-emerald-700/80">
                  Token: {bot.tokenMask}
                </p>
              </div>
            ) : (
              <div className="mb-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Hozir bot ulanmagan. Token kiriting va ulang.
              </div>
            )}

            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label htmlFor="bot-token" className="mb-1.5 block text-sm font-medium text-slate-700">
                  {connected ? 'Yangi bot token (almashtirish)' : 'Bot token'}
                </label>
                <input
                  id="bot-token"
                  type="password"
                  autoComplete="off"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                  className={inputCls}
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Faqat bitta bot faol bo‘ladi. Yangi token kiritilsa, avvalgi bot uziladi.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-xl bg-gradient-to-r from-[#1e9e8a] to-[#17806f] px-5 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-60"
                >
                  {pending ? 'Ulanmoqda…' : connected ? 'Botni almashtirish' : 'Botni ulash'}
                </button>

                {connected ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={handleDisconnect}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-medium text-rose-800 hover:bg-rose-100 disabled:opacity-60"
                  >
                    Botni uzish
                  </button>
                ) : null}
              </div>
            </form>
          </section>
        )}

        <UsersSettingsSection />
      </div>
    </div>
  )
}
