const getBase = () => import.meta.env.VITE_API_URL || ''

function getToken() {
  return localStorage.getItem('crm_token')
}

export function setToken(token) {
  if (token) localStorage.setItem('crm_token', token)
  else localStorage.removeItem('crm_token')
}

/**
 * @param {string} path - begins with /api
 * @param {RequestInit} [options]
 */
export async function crmFetch(path, options = {}) {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json')
  }
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${getBase()}${path}`, {
    ...options,
    headers,
  })

  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { error: text }
    }
  }

  if (!res.ok) {
    const msg = data?.error || data?.message || res.statusText || 'Xatolik'
    throw new Error(msg)
  }

  return data
}

export async function loginRequest(username, password) {
  return crmFetch('/api/crm/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export async function meRequest() {
  return crmFetch('/api/crm/me')
}

export async function fetchLeadsKanban(params = {}) {
  const q = new URLSearchParams()
  if (params.search?.trim()) q.set('search', params.search.trim())
  const suffix = q.toString() ? `?${q}` : ''
  return crmFetch(`/api/crm/leads/kanban${suffix}`)
}

export async function fetchLeadsList(params = {}) {
  const q = new URLSearchParams()
  if (params.page) q.set('page', String(params.page))
  if (params.limit) q.set('limit', String(params.limit))
  if (params.status) q.set('status', params.status)
  if (params.assignedTo) q.set('assignedTo', params.assignedTo)
  if (params.search?.trim()) q.set('search', params.search.trim())
  const suffix = q.toString() ? `?${q}` : ''
  return crmFetch(`/api/crm/leads${suffix}`)
}

export async function patchLead(id, body) {
  return crmFetch(`/api/crm/leads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export async function createLead(body) {
  return crmFetch('/api/crm/leads', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function fetchOperators() {
  return crmFetch('/api/crm/operators')
}

export async function fetchBotSettings() {
  return crmFetch('/api/crm/settings/bot')
}

export async function connectBot(token) {
  return crmFetch('/api/crm/settings/bot', {
    method: 'POST',
    body: JSON.stringify({ token }),
  })
}

export async function disconnectBot() {
  return crmFetch('/api/crm/settings/bot', { method: 'DELETE' })
}

export async function fetchCrmUsers() {
  return crmFetch('/api/crm/settings/users')
}

export async function createCrmUser(body) {
  return crmFetch('/api/crm/settings/users', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function updateCrmUser(id, body) {
  return crmFetch(`/api/crm/settings/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export async function fetchCrmStats(period = 'all') {
  return crmFetch(`/api/crm/stats?period=${encodeURIComponent(period)}`)
}
