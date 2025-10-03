import { parse as parseYaml } from 'yaml'
export type JwtPair = { access: string; refresh: string }
export type Task = {
  id: number
  title: string
  description?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  due_date?: string | null
  created_at?: string
  updated_at?: string
}

export type TaskFilters = {
  page?: number
  search?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  due_date?: string // YYYY-MM-DD
  ordering?: string // e.g., '-created_at', 'due_date'
}

export type TaskList = {
  results: Task[]
  count?: number
  next?: string | null
  previous?: string | null
}

const base = '' // usamos proxy de Vite

export async function register(email: string, username: string, password: string) {
  const res = await fetch(`${base}/api/auth/users/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password, re_password: password })
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function login(email: string, password: string): Promise<JwtPair> {
  const res = await fetch(`${base}/api/auth/jwt/create/`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function refreshToken(refresh: string): Promise<{ access: string }> {
  const res = await fetch(`${base}/api/auth/jwt/refresh/`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh })
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function me(token: string) {
  const res = await fetch(`${base}/api/auth/users/me/`, { headers: { Authorization: `Bearer ${token}` }})
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function listTasks(token: string): Promise<Task[]> {
  const res = await fetch(`${base}/api/tasks/`, { headers: { Authorization: `Bearer ${token}` }})
  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  // Normalize: support both paginated and non-paginated responses
  return Array.isArray(data) ? data : (data?.results ?? [])
}

export async function createTask(token: string, payload: { title: string; description?: string; priority?: string; due_date?: string }) {
  const res = await fetch(`${base}/api/tasks/`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateTask(token: string, id: number, patch: Partial<Task>) {
  const res = await fetch(`${base}/api/tasks/${id}/`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(patch)
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function deleteTask(token: string, id: number) {
  const res = await fetch(`${base}/api/tasks/${id}/`, {
    method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error(await res.text())
}

function toRelative(path: string) {
  try {
    const u = new URL(path)
    return `${u.pathname}${u.search}`
  } catch {
    return path
  }
}

export async function listTasksPaged(token: string, filters?: TaskFilters, pageUrl?: string): Promise<TaskList> {
  let url: string
  if (pageUrl) {
    url = toRelative(pageUrl)
  } else {
    const qs = new URLSearchParams()
    if (filters?.page) qs.set('page', String(filters.page))
    if (filters?.search) qs.set('search', filters.search)
    if (filters?.priority) qs.set('priority', filters.priority)
    if (filters?.status) qs.set('status', filters.status)
    if (filters?.due_date) qs.set('due_date', filters.due_date)
    if (filters?.ordering) qs.set('ordering', filters.ordering)
    const q = qs.toString()
    url = `${base}/api/tasks/${q ? `?${q}` : ''}`
  }
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  if (Array.isArray(data)) {
    return { results: data }
  }
  return {
    results: data?.results ?? [],
    count: data?.count,
    next: data?.next,
    previous: data?.previous,
  }
}

// Fetch OpenAPI schema (JSON) from drf-spectacular
export async function fetchOpenApiSchema(baseOrigin?: string) {
  const origin = baseOrigin ?? base
  // Try JSON first; if backend serves YAML by default, we'll fetch and parse that.
  const jsonUrl = `${origin}/api/schema/?format=openapi-json`
  try {
    const r = await fetch(jsonUrl, { headers: { 'Accept': 'application/json' } })
    if (r.ok) return r.json()
  } catch (_) { /* continue to YAML */ }

  // Fallback to YAML (common when accessing /api/schema without ?format)
  const yamlUrl = `${origin}/api/schema/`
  const res = await fetch(yamlUrl, { headers: { 'Accept': 'application/yaml, text/yaml, */*' } })
  if (!res.ok) throw new Error(`Schema fetch failed: ${res.status}`)
  const text = await res.text()
  try {
    return parseYaml(text)
  } catch (e) {
    throw new Error('Failed to parse OpenAPI YAML')
  }
}
