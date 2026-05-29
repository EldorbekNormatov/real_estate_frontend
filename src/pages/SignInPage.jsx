import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginRequest } from '../api/crm.js'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * Kirish sahifasi — JWT orqali backend `/api/crm/login`.
 */

function BuildingSilhouette() {
  return (
    <svg
      className="absolute bottom-0 left-0 right-0 h-auto w-full text-white/[0.07]"
      viewBox="0 0 1200 320"
      fill="currentColor"
      aria-hidden
    >
      <path d="M0 320V180l80-20v160H0Zm120 0V140l95-35v215H120Zm155 0V100l72-28v248H275Zm132 0V160l88-32v192H407Zm148 0V80l104-38v278H555Zm172 0V120l92-34v254H727Zm148 0V60l118-42v302H875Zm148 0V200l75-26v146h-75Zm125 0V150l52-22v192h-52Z" />
    </svg>
  )
}

export default function SignInPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [pending, setPending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setPending(true)
    try {
      const data = await loginRequest(username.trim(), password)
      login(data.token, data.user)
      navigate('/leadlar', { replace: true })
    } catch (err) {
      setSubmitError(err?.message || 'Kirishda xatolik')
    } finally {
      setPending(false)
    }
  }

  return (
    <div
      className="relative isolate flex min-h-svh overflow-hidden bg-[#0c1222]"
      style={{ fontFamily: "'Instrument Sans', system-ui, sans-serif" }}
    >
      {/* Ambient blobs */}
      <div
        className="pointer-events-none absolute -left-32 top-[-20%] h-[520px] w-[520px] rounded-full bg-[#1e9e8a]/25 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[-10%] right-[-15%] h-[480px] w-[480px] rounded-full bg-[#c9a227]/12 blur-[90px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-[40%] top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3b5998]/10 blur-[80px]"
        aria-hidden
      />

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:48px_48px]"
        aria-hidden
      />

      {/* Left panel — branding */}
      <div className="relative hidden flex-1 flex-col justify-between p-10 text-white lg:flex xl:p-14">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#c9a227]">
            Boshqaruv paneli
          </p>
          <h1
            className="mt-4 max-w-md text-[2.75rem] font-medium leading-[1.1] text-white xl:text-[3.25rem]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Ko‘chmas mulkingiz uchun zamonaviy CRM
          </h1>
          <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-slate-300">
            Mulklar, mijozlar va e‘lonlar bitta joyda — tez va tartibli.
          </p>
        </div>

        <div className="relative space-y-6">
          <div className="flex flex-wrap gap-4 border-t border-white/10 pt-8">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 backdrop-blur-sm">
              <p className="text-2xl font-semibold tracking-tight text-[#5eead4]">
                CRM
              </p>
              <p className="text-xs text-slate-400">
                Loyihalar uchun professional vosita
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 backdrop-blur-sm">
              <p className="text-2xl font-semibold tracking-tight text-[#facc15]">
                24/7
              </p>
              <p className="text-xs text-slate-400">Mijozlar bilan aloqa</p>
            </div>
          </div>
          <BuildingSilhouette />
        </div>
      </div>

      {/* Right — form */}
      <div className="relative flex w-full flex-col justify-center px-6 py-12 sm:px-10 lg:w-[min(100%,520px)] lg:shrink-0 lg:border-l lg:border-white/[0.06] lg:bg-[#0a0f1a]/80 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-[400px]">
          <div className="mb-10 lg:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a227]">
              CRM
            </p>
            <h2
              className="mt-2 text-2xl font-medium text-white"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Kirish
            </h2>
          </div>

          <div className="mb-10 hidden lg:block">
            <h2
              className="text-3xl font-medium text-white"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Tizimga kirish
            </h2>
            <p className="mt-2 text-[0.9375rem] text-slate-400">
              Xavfsizlik uchun faqat tasdiqlangan xodimlar kira oladi.
            </p>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.7)] backdrop-blur-xl">
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {submitError ? (
                <div
                  className="rounded-xl border border-rose-400/35 bg-rose-500/15 px-4 py-3 text-sm text-rose-100"
                  role="alert"
                >
                  {submitError}
                </div>
              ) : null}
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-slate-200"
                >
                  Foydalanuvchi nomi
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masalan: admin"
                  className="w-full rounded-xl border border-white/[0.1] bg-[#0f1628] px-4 py-3.5 text-[0.95rem] text-white outline-none ring-[#c9a227]/0 transition-[border-color,box-shadow] placeholder:text-slate-500 focus:border-[#c9a227]/55 focus:ring-[3px] focus:ring-[#c9a227]/18"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-200"
                >
                  Parol
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/[0.1] bg-[#0f1628] px-4 py-3.5 pr-12 text-[0.95rem] text-white outline-none ring-[#c9a227]/0 transition-[border-color,box-shadow] placeholder:text-slate-500 focus:border-[#c9a227]/55 focus:ring-[3px] focus:ring-[#c9a227]/18"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
                    aria-pressed={showPassword}
                  >
                    {showPassword ? 'Yashirish' : 'Ko‘rsatish'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={pending}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#1e9e8a] to-[#17806f] py-3.5 text-[0.95rem] font-semibold text-white shadow-[0_12px_40px_-12px_rgba(30,158,138,0.55)] transition-[transform,box-shadow] hover:shadow-[0_16px_48px_-12px_rgba(30,158,138,0.65)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="relative z-10">{pending ? 'Kirilmoqda…' : 'Kirish'}</span>
                <span
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/12 to-white/0 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-[0.8125rem] leading-relaxed text-slate-500">
            Hisobingiz yo‘qmi?{' '}
            <span className="text-slate-400">
              Kirish huquqi faqat kompaniya rahbari tomonidan beriladi.
            </span>
          </p>

          <p className="mt-6 text-center text-xs text-slate-600">
            © {new Date().getFullYear()} Ko‘chmas mulk CRM. Barcha huquqlar
            himoyalangan.
          </p>
        </div>
      </div>
    </div>
  )
}
