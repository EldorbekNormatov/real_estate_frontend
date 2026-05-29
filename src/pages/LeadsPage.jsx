import { useCallback, useEffect, useMemo, useState } from 'react'
import AddLeadModal from '../components/AddLeadModal.jsx'
import {
  fetchLeadsKanban,
  fetchLeadsList,
  fetchOperators,
  patchLead,
} from '../api/crm.js'

const STATUS_LABELS = {
  new: 'Yangi',
  contacted: 'Bog‘langan',
  qualified: 'Loyiha mos',
  lost: 'Yo‘qotilgan',
}

const STATUS_BADGE = {
  new: 'bg-sky-500/15 text-sky-800 ring-sky-500/25',
  contacted: 'bg-amber-500/15 text-amber-900 ring-amber-500/25',
  qualified: 'bg-emerald-500/15 text-emerald-900 ring-emerald-500/25',
  lost: 'bg-rose-500/15 text-rose-900 ring-rose-500/25',
}

const COLUMN_BADGE = {
  pool: 'bg-sky-500/15 text-sky-800 ring-sky-500/25',
  operator: 'bg-violet-500/15 text-violet-900 ring-violet-500/25',
}

const PURPOSE_LABELS = {
  sell: 'Sotuv',
  rent_out: 'Ijara',
}

function OperatorSelect({ lead, operators, disabled, onAssigned }) {
  const val =
    lead.assignedTo?._id != null ? String(lead.assignedTo._id) : ''
  return (
    <select
      disabled={disabled}
      value={val}
      onChange={(e) => {
        const v = e.target.value
        onAssigned(v === '' ? null : v)
      }}
      className="mt-2 w-full rounded-lg border border-slate-200/80 bg-white py-1.5 pl-2 pr-6 text-[0.75rem] text-slate-700 outline-none ring-0 focus:border-[#1e9e8a] focus:ring-2 focus:ring-[#1e9e8a]/20"
    >
      <option value="">Operator biriktirilmagan</option>
      {operators.map((op) => (
        <option key={String(op._id)} value={String(op._id)}>
          {op.username}
        </option>
      ))}
    </select>
  )
}

function KanbanCard({ lead, busy, showStatus }) {
  const purpose = lead.purpose ? PURPOSE_LABELS[lead.purpose] || lead.purpose : '—'

  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/lead-id', lead._id)
        e.dataTransfer.effectAllowed = 'move'
      }}
      className={`rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm ${busy ? 'opacity-60' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-[0.85rem] font-semibold text-slate-900">{lead.name}</h3>
          <p className="text-[0.75rem] text-slate-500">{lead.phone}</p>
        </div>
        <span className="shrink-0 text-slate-400">⋮</span>
      </div>
      <p className="mt-2 line-clamp-2 text-[0.75rem] text-slate-600">{lead.district}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {showStatus && lead.status ? (
          <span
            className={`inline-flex rounded-md px-2 py-0.5 text-[0.65rem] font-medium ring-1 ring-inset ${STATUS_BADGE[lead.status] || 'bg-slate-100 text-slate-700'}`}
          >
            {STATUS_LABELS[lead.status] || lead.status}
          </span>
        ) : null}
        <span className="inline-flex rounded-md bg-violet-500/10 px-2 py-0.5 text-[0.65rem] font-medium text-violet-800">
          {purpose}
        </span>
        {lead.propertyType ? (
          <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[0.65rem] font-medium text-slate-700">
            {lead.propertyType}
          </span>
        ) : null}
      </div>
    </article>
  )
}

export default function LeadsPage() {
  const [view, setView] = useState(() => localStorage.getItem('crm_leads_view') || 'kanban')
  const [operatorFilter, setOperatorFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [kanban, setKanban] = useState({ columns: [] })
  const [listData, setListData] = useState({ data: [], total: 0, page: 1, totalPages: 1 })
  const [operators, setOperators] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [listPage, setListPage] = useState(1)
  const [addLeadOpen, setAddLeadOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput.trim())
      setListPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const assignedParam = useMemo(() => {
    if (operatorFilter === '') return undefined
    return operatorFilter
  }, [operatorFilter])

  const loadLeads = useCallback(async () => {
    const search = searchQuery || undefined
    if (view === 'kanban') {
      const res = await fetchLeadsKanban({ search })
      setKanban(res)
      return
    }
    const res = await fetchLeadsList({
      page: listPage,
      limit: 15,
      assignedTo: assignedParam,
      search,
    })
    setListData(res)
  }, [view, assignedParam, listPage, searchQuery])

  useEffect(() => {
    fetchOperators()
      .then((res) => setOperators(res.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setErr('')
    loadLeads()
      .catch((e) => {
        if (!cancelled) setErr(e.message || 'Yuklashda xatolik')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [loadLeads])

  useEffect(() => {
    localStorage.setItem('crm_leads_view', view)
  }, [view])

  async function reloadLeads() {
    setErr('')
    setLoading(true)
    try {
      await loadLeads()
    } catch (e) {
      setErr(e.message || 'Yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  async function handlePatchLead(leadId, body) {
    setBusyId(leadId)
    setErr('')
    try {
      await patchLead(leadId, body)
      await loadLeads()
    } catch (e) {
      setErr(e.message || 'Saqlashda xatolik')
    } finally {
      setBusyId(null)
    }
  }

  function onDropColumn(column, e) {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/lead-id')
    if (!id) return

    if (column.type === 'pool') {
      handlePatchLead(id, { assignedTo: null, status: 'new' })
      return
    }

    if (column.type === 'operator') {
      handlePatchLead(id, { assignedTo: column.id })
    }
  }

  return (
    <div className="p-6 lg:p-8" style={{ fontFamily: "'Instrument Sans', system-ui, sans-serif" }}>
      <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1
            className="text-2xl font-semibold text-slate-900"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Leadlar
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Kanban: Yangi (biriktirilmagan) va operator ustunlari · Ro‘yxatda filtr
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {view === 'list' ? (
            <select
              value={operatorFilter}
              onChange={(e) => {
                setOperatorFilter(e.target.value)
                setListPage(1)
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#1e9e8a] focus:ring-2 focus:ring-[#1e9e8a]/20"
            >
              <option value="">Barcha operatorlar</option>
              <option value="unassigned">Biriktirilmagan</option>
              {operators.map((op) => (
                <option key={String(op._id)} value={String(op._id)}>
                  {op.username}
                </option>
              ))}
            </select>
          ) : null}

          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => {
                setView('kanban')
                setListPage(1)
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                view === 'kanban' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Kanban
            </button>
            <button
              type="button"
              onClick={() => {
                setView('list')
                setListPage(1)
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                view === 'list' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Ro‘yxat
            </button>
          </div>

          <button
            type="button"
            onClick={() => reloadLeads()}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Yangilash
          </button>

          <button
            type="button"
            onClick={() => setAddLeadOpen(true)}
            className="rounded-xl bg-gradient-to-r from-[#1e9e8a] to-[#17806f] px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg"
          >
            + Lead qo‘shish
          </button>
        </div>
      </header>

      <AddLeadModal
        open={addLeadOpen}
        onClose={() => setAddLeadOpen(false)}
        operators={operators}
        onCreated={() => reloadLeads()}
      />

      <div className="mb-6">
        <label htmlFor="lead-search" className="sr-only">
          Lead qidiruv
        </label>
        <div className="relative max-w-xl">
          <span
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
            </svg>
          </span>
          <input
            id="lead-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Ism, telefon, hudud yoki operator bo‘yicha qidirish…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-10 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#1e9e8a] focus:ring-2 focus:ring-[#1e9e8a]/20"
          />
          {searchInput ? (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label="Qidiruvni tozalash"
            >
              ✕
            </button>
          ) : null}
        </div>
        {searchQuery ? (
          <p className="mt-2 text-xs text-slate-500">
            Qidiruv: <span className="font-medium text-slate-700">«{searchQuery}»</span>
          </p>
        ) : null}
      </div>

      {err ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {err}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500">
          Yuklanmoqda…
        </div>
      ) : view === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {kanban.columns?.map((col) => (
            <section
              key={col.id}
              onDragOver={(e) => {
                e.preventDefault()
              }}
              onDrop={(e) => onDropColumn(col, e)}
              className="flex w-[min(100vw-3rem,300px)] shrink-0 flex-col rounded-2xl border border-slate-200/80 bg-slate-100/60 p-3"
            >
              <div className="mb-3 flex items-center justify-between gap-2 px-1">
                <div className="flex min-w-0 items-center gap-2">
                  {col.type === 'operator' ? (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1e9e8a] to-[#0f766e] text-[0.65rem] font-bold text-white">
                      {(col.title || '?').slice(0, 1).toUpperCase()}
                    </span>
                  ) : null}
                  <span
                    className={`inline-flex max-w-full truncate items-center rounded-lg px-2.5 py-1 text-[0.7rem] font-semibold ring-1 ring-inset ${COLUMN_BADGE[col.type] || COLUMN_BADGE.operator}`}
                  >
                    {col.title || col.id}
                  </span>
                </div>
                <span className="shrink-0 text-xs font-medium text-slate-500">
                  {col.leads?.length ?? 0}
                </span>
              </div>
              {col.type === 'pool' ? (
                <p className="mb-2 px-1 text-[0.7rem] text-slate-500">
                  Yangi va operatorga biriktirilmagan
                </p>
              ) : null}
              <div className="flex min-h-[120px] flex-col gap-2.5">
                {col.leads?.length ? (
                  col.leads.map((lead) => (
                    <KanbanCard
                      key={lead._id}
                      lead={lead}
                      busy={busyId === lead._id}
                      showStatus={col.type === 'operator'}
                    />
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-300/80 px-3 py-8 text-center text-[0.8rem] text-slate-400">
                    Lead yo‘q
                  </p>
                )}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[0.85rem]">
              <thead className="border-b border-slate-100 bg-slate-50 text-[0.7rem] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Mijoz</th>
                  <th className="px-4 py-3">Tel</th>
                  <th className="px-4 py-3">Hudud</th>
                  <th className="px-4 py-3">Holat</th>
                  <th className="px-4 py-3">Operator</th>
                  <th className="px-4 py-3 text-right">Narx</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listData.data?.length ? (
                  listData.data.map((lead) => (
                    <tr key={lead._id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-medium text-slate-900">{lead.name}</td>
                      <td className="px-4 py-3 text-slate-600">{lead.phone}</td>
                      <td className="px-4 py-3 text-slate-600">{lead.district}</td>
                      <td className="px-4 py-3">
                        <select
                          disabled={busyId === lead._id}
                          value={lead.status}
                          onChange={(e) => handlePatchLead(lead._id, { status: e.target.value })}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[0.8rem] outline-none focus:border-[#1e9e8a] focus:ring-2 focus:ring-[#1e9e8a]/20"
                        >
                          {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="max-w-[200px] px-4 py-3">
                        <OperatorSelect
                          lead={lead}
                          operators={operators}
                          disabled={busyId === lead._id}
                          onAssigned={(assignedTo) => handlePatchLead(lead._id, { assignedTo })}
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800">{lead.price}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      Lead topilmadi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
            <span>
              Sahifa {listData.page || 1} / {listData.totalPages || 1}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={(listData.page || 1) <= 1}
                onClick={() => setListPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40"
              >
                Oldingi
              </button>
              <button
                type="button"
                disabled={(listData.page || 1) >= (listData.totalPages || 1)}
                onClick={() => setListPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40"
              >
                Keyingi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
