import { useCallback, useEffect, useState } from 'react'
import { fetchCrmStats } from '../api/crm.js'
import { ROLE_LABELS } from '../constants/roles.js'

const PERIODS = [
  { id: 'today', label: 'Bugun' },
  { id: '7d', label: '7 kun' },
  { id: '30d', label: '30 kun' },
  { id: 'all', label: 'Barcha vaqt' },
]

const STATUS_LABELS = {
  new: 'Yangi',
  contacted: 'Bog‘langan',
  qualified: 'Loyiha mos',
  lost: 'Yo‘qotilgan',
}

const STATUS_COLORS = {
  new: 'bg-sky-500',
  contacted: 'bg-amber-500',
  qualified: 'bg-emerald-500',
  lost: 'bg-rose-500',
}

function KpiCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
      <p className="text-[0.7rem] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-slate-500">{sub}</p> : null}
    </div>
  )
}

function BarChart({ items, max }) {
  const m = max || 1
  return (
    <div className="flex h-40 items-end gap-2">
      {items.map((item) => (
        <div key={item.key} className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <span className="text-xs font-medium text-slate-700">{item.count}</span>
          <div
            className={`w-full max-w-[48px] rounded-t-md ${item.color || 'bg-[#1e9e8a]'}`}
            style={{ height: `${Math.max(4, (item.count / m) * 100)}%` }}
            title={`${item.label}: ${item.count}`}
          />
          <span className="max-w-full truncate text-center text-[0.65rem] text-slate-500">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}

function HorizontalBars({ rows }) {
  const max = Math.max(...rows.map((r) => r.count), 1)
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.key}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-slate-700">{row.label}</span>
            <span className="font-medium text-slate-900">{row.count}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${row.color}`}
              style={{ width: `${(row.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function StatistikaPage() {
  const [period, setPeriod] = useState('30d')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    setErr('')
    const res = await fetchCrmStats(period)
    setData(res)
  }, [period])

  useEffect(() => {
    setLoading(true)
    load()
      .catch((e) => setErr(e.message || 'Yuklashda xatolik'))
      .finally(() => setLoading(false))
  }, [load])

  const kpi = data?.kpi
  const pipeline = data?.pipeline
  const purpose = data?.purpose
  const maxDaily = Math.max(...(data?.dailyLeads?.map((d) => d.count) || [0]), 1)

  const pipelineRows = pipeline
    ? ['new', 'contacted', 'qualified', 'lost'].map((key) => ({
        key,
        label: STATUS_LABELS[key],
        count: pipeline[key] || 0,
        color: STATUS_COLORS[key],
      }))
    : []

  const purposeRows = purpose
    ? [
        { key: 'sell', label: 'Sotuv', count: purpose.sell, color: 'bg-violet-500' },
        {
          key: 'rent_out',
          label: 'Ijara',
          count: purpose.rent_out,
          color: 'bg-indigo-500',
        },
      ]
    : []

  return (
    <div
      className="p-6 lg:p-8"
      style={{ fontFamily: "'Instrument Sans', system-ui, sans-serif" }}
    >
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-semibold text-slate-900"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Statistika
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Kompaniya bo‘yicha umumiy ko‘rsatkichlar
          </p>
        </div>
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                period === p.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      {data?.bot ? (
        <div
          className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
            data.bot.connected && data.bot.running
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-amber-200 bg-amber-50'
          }`}
        >
          <div className="text-sm">
            <span className="font-semibold text-slate-900">Telegram bot: </span>
            {data.bot.connected ? (
              <span className="text-emerald-800">
                {data.bot.running ? 'Ishlayapti' : 'Ulangan, to‘xtagan'}
                {data.bot.username ? ` (@${data.bot.username})` : ''}
              </span>
            ) : (
              <span className="text-amber-800">Ulanmagan — Sozlamalar orqali ulang</span>
            )}
          </div>
        </div>
      ) : null}

      {err ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {err}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500">
          Yuklanmoqda…
        </div>
      ) : data ? (
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Asosiy ko‘rsatkichlar
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
              <KpiCard label="Jami leadlar" value={kpi?.totalLeads ?? 0} />
              <KpiCard label="Yangi" value={kpi?.byStatus?.new ?? 0} />
              <KpiCard label="Bugun kelgan" value={kpi?.todayLeads ?? 0} />
              <KpiCard label="Biriktirilmagan" value={kpi?.unassigned ?? 0} />
              <KpiCard label="Bog‘langan" value={kpi?.byStatus?.contacted ?? 0} />
              <KpiCard label="Loyiha mos" value={kpi?.byStatus?.qualified ?? 0} />
              <KpiCard label="Yo‘qotilgan" value={kpi?.byStatus?.lost ?? 0} />
              <KpiCard
                label="Telegram foydalanuvchilar"
                value={kpi?.telegramUsers ?? 0}
              />
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-1 text-lg font-semibold text-slate-900">Pipeline</h2>
              <p className="mb-4 text-sm text-slate-500">
                {pipeline?.conversionLabel || '—'} (tanlangan davr ichida)
              </p>
              <HorizontalBars rows={pipelineRows} />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Maqsad (sotuv / ijara)
              </h2>
              <HorizontalBars rows={purposeRows} />
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Top hududlar</h2>
              {data.topDistricts?.length ? (
                <ul className="space-y-2">
                  {data.topDistricts.map((d, i) => (
                    <li
                      key={d.district}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                    >
                      <span className="text-slate-700">
                        {i + 1}. {d.district}
                      </span>
                      <span className="font-semibold text-slate-900">{d.count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">Ma’lumot yo‘q</p>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Kunlik yangi leadlar
              </h2>
              {data.dailyLeads?.length ? (
                <BarChart
                  items={data.dailyLeads.map((d) => ({
                    key: d.date,
                    label: d.label,
                    count: d.count,
                  }))}
                  max={maxDaily}
                />
              ) : (
                <p className="text-sm text-slate-500">Ma’lumot yo‘q</p>
              )}
            </section>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Operatorlar</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-slate-100 text-[0.7rem] font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Operator</th>
                    <th className="px-3 py-2">Rol</th>
                    <th className="px-3 py-2 text-right">Jami</th>
                    <th className="px-3 py-2 text-right">Yangi</th>
                    <th className="px-3 py-2 text-right">Bog‘langan</th>
                    <th className="px-3 py-2 text-right">Loyiha mos</th>
                    <th className="px-3 py-2 text-right">Yo‘qotilgan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.operators?.length ? (
                    data.operators.map((op) => (
                      <tr key={op.id || 'unassigned'} className="hover:bg-slate-50/80">
                        <td className="px-3 py-2.5 font-medium text-slate-900">
                          {op.username}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600">
                          {op.role ? ROLE_LABELS[op.role] || op.role : '—'}
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium">{op.total}</td>
                        <td className="px-3 py-2.5 text-right">{op.new}</td>
                        <td className="px-3 py-2.5 text-right">{op.contacted}</td>
                        <td className="px-3 py-2.5 text-right">{op.qualified}</td>
                        <td className="px-3 py-2.5 text-right">{op.lost}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                        Operator yo‘q
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Mulk (e’lonlar)</h2>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-slate-500">Jami e’lonlar</p>
                <p className="text-xl font-semibold text-slate-900">
                  {data.properties?.total ?? 0}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Sotuv</p>
                <p className="text-xl font-semibold text-slate-900">
                  {data.properties?.byType?.sale ?? 0}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Ijara</p>
                <p className="text-xl font-semibold text-slate-900">
                  {data.properties?.byType?.rent ?? 0}
                </p>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}
