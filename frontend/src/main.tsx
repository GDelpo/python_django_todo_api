import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Card } from './components/Card'
import { Button } from './components/Button'
import { Modal } from './components/Modal'
import { Header } from './components/Header'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { FormRegister } from './components/FormRegister'
import { FormLogin } from './components/FormLogin'
import * as api from './actions/fetchData'

function Steps() {
  const [health, setHealth] = useState<string>('checking...')
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('test@example.com')
  const [username, setUsername] = useState('test')
  const [password, setPassword] = useState('TestPassword123!')
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [due, setDue] = useState<string>('')
  const [tasks, setTasks] = useState<any[]>([])
  const [filters, setFilters] = useState<{ search?: string; priority?: 'LOW'|'MEDIUM'|'HIGH'|''; status?: 'PENDING'|'IN_PROGRESS'|'COMPLETED'|''; due_date?: string; ordering?: string }>({})
  const [page, setPage] = useState<{ next?: string|null; previous?: string|null; count?: number }>({})
  const [taskEndpoints, setTaskEndpoints] = useState<Array<{ method: string; path: string }>>([])
  const [endpointsByTag, setEndpointsByTag] = useState<Record<string, Array<{ method: string; path: string }>>>({})
  const { access, refresh, username: uname, setAuth, getValidAccess } = useAuth()

  useEffect(() => {
    fetch('/health/').then(r => r.json()).then(d => setHealth(`${d.status} (db: ${d.database?.ok ? 'ok' : 'fail'})`)).catch(() => setHealth('offline'))
  }, [])

  // If authenticated but username not present (e.g., storage migrated), fetch /me with a valid (possibly refreshed) token
  useEffect(() => {
    (async () => {
      if (access && !uname) {
        try {
          const valid = await getValidAccess()
          if (!valid) return
          const me = await api.me(valid)
          setAuth({ access: valid, refresh: refresh ?? '', username: me.username || me.email })
        } catch {}
      }
    })()
  }, [access, refresh, uname, setAuth, getValidAccess])

  useEffect(() => {
    (async () => {
      try {
        const schema = await api.fetchOpenApiSchema('http://localhost:8081')
        const paths = schema.paths || {}
        const byTag: Record<string, Array<{ method: string; path: string }>> = {}
        const tasksOnly: Array<{ method: string; path: string }> = []
        for (const path in paths) {
          const ops = paths[path]
          for (const method of Object.keys(ops)) {
            const op = ops[method]
            const tags: string[] = op?.tags || []
            const entry = { method: method.toUpperCase(), path }
            if (tags.length === 0) {
              byTag['untagged'] = byTag['untagged'] || []
              byTag['untagged'].push(entry)
            } else {
              for (const t of tags) {
                byTag[t] = byTag[t] || []
                byTag[t].push(entry)
              }
            }
            if (tags.includes('Tasks')) tasksOnly.push(entry)
          }
        }
        setEndpointsByTag(byTag)
        setTaskEndpoints(tasksOnly)
      } catch (_) {
        // ignore if docs are not reachable
      }
    })()
  }, [])

  async function doRegister() {
    try {
      await api.register(email, username, password)
      setMessage('Usuario creado correctamente')
      setOpen(true)
    } catch (e: any) {
      setMessage('Registro: ' + e.message)
      setOpen(true)
    }
  }

  async function doLogin() {
    try {
      const jwt = await api.login(email, password)
      const me = await api.me(jwt.access)
      setAuth({ access: jwt.access, refresh: jwt.refresh, username: me.username || me.email })
      setMessage('Login OK')
      setOpen(true)
    } catch (e: any) {
      setMessage('Login: ' + e.message)
      setOpen(true)
    }
  }

  async function create() {
    if (!access) return
    try {
      const valid = await getValidAccess(); if (!valid) return
      const payload: any = { title, priority }
      if (due) payload.due_date = due
      await api.createTask(valid, payload)
      setTitle(''); setDue('')
      const list = await api.listTasks(valid)
      setTasks(list)
    } catch (e: any) {
      setMessage('Crear tarea: ' + e.message)
      setOpen(true)
    }
  }

  async function refreshTasks(pageUrl?: string) {
    if (!access) return
    try {
      const valid = await getValidAccess(); if (!valid) return
      const data = await api.listTasksPaged(valid, {
        search: filters.search,
        priority: filters.priority as any,
        status: filters.status as any,
        due_date: filters.due_date,
        ordering: filters.ordering,
      }, pageUrl)
      setTasks(data.results)
      setPage({ next: data.next, previous: data.previous, count: data.count })
    } catch (e: any) {
      setMessage('Listar tareas: ' + e.message); setOpen(true)
    }
  }

  return (
    <div className="font-sans">
      {/* Hero section */}
      <section className="min-h-[55vh] bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold">ToDo API – Demo</h1>
          <p className="mt-4 text-lg text-white/90">Una API de tareas con Django + DRF + JWT. Este front te guía por la demo end-to-end.</p>
          <div className="mt-6 flex gap-3 flex-wrap items-center">
            <a href="http://localhost:8081/api/docs/" target="_blank" className="underline decoration-white/60 underline-offset-4">Ir a la documentación</a>
            <span className="opacity-70">•</span>
            <span>Health: <strong>{health}</strong></span>
          </div>

          {/* Presentación: librerías y por qué */}
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <h3 className="text-xl font-semibold mb-2">Backend</h3>
              <ul className="space-y-1 text-white/90">
                <li><span className="font-semibold">Django + DRF</span>: productividad, ORM sólido y API rápida.</li>
                <li><span className="font-semibold">Djoser + SimpleJWT</span>: auth JWT out-of-the-box, endpoints listos.</li>
                <li><span className="font-semibold">drf-spectacular</span>: OpenAPI/Swagger automático.</li>
                <li><span className="font-semibold">django-filter</span>: filtros declarativos en listados.</li>
                <li><span className="font-semibold">django-environ</span>: configuración por variables de entorno.</li>
                <li><span className="font-semibold">Logging + Request-ID</span>: trazabilidad y observabilidad básica.</li>
                <li><span className="font-semibold">Docker</span>: dev/prod reproducibles.</li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <h3 className="text-xl font-semibold mb-2">Frontend</h3>
              <ul className="space-y-1 text-white/90">
                <li><span className="font-semibold">React + Vite</span>: DX veloz y build eficiente.</li>
                <li><span className="font-semibold">Tailwind CSS</span>: estilos utilitarios, entrega rápida de UI.</li>
                <li><span className="font-semibold">Fetch + Context</span>: llamadas simples y estado de auth persistente.</li>
                <li><span className="font-semibold">OpenAPI</span>: endpoints dinámicos desde el schema.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-3 -mt-10 pb-10">
        {/* Endpoints agrupados por TAG */}
  <Card title={`1) Endpoints por TAG (OpenAPI)`}>
          {Object.keys(endpointsByTag).length === 0 ? (
            <p className="text-slate-600">No se pudieron cargar los endpoints desde la documentación.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(endpointsByTag).map(([tag, items]) => (
                <div key={tag} className="border rounded-lg p-3">
                  <h4 className="font-semibold mb-2">{tag}</h4>
                  <ul className="space-y-1">
                    {items.map(e => (
                      <li key={e.method+e.path}><code className="text-sky-700 font-semibold">{e.method}</code> <span className="text-slate-700">{e.path}</span></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="grid gap-4 mt-4">
          {!access && (
            <>
              <Card title="1) Registrarse">
                <FormRegister
                  email={email} username={username} password={password}
                  onEmail={setEmail} onUsername={setUsername} onPassword={setPassword}
                  onSubmit={doRegister}
                />
              </Card>
              <Card title="2) Login">
                <FormLogin email={email} password={password} onEmail={setEmail} onPassword={setPassword} onSubmit={doLogin} />
              </Card>
            </>
          )}

  <Card title={`${access ? '2' : '3'}) Endpoints (tag: Tasks)`}>
          {taskEndpoints.length === 0 ? (
            <p className="text-slate-600">No se pudieron cargar los endpoints de Tasks desde la documentación.</p>
          ) : (
            <ul className="list-disc pl-6">
              {taskEndpoints.map(e => <li key={e.method+e.path}><code className="text-sky-700 font-semibold">{e.method}</code> <span className="text-slate-700">{e.path}</span></li>)}
            </ul>
          )}
        </Card>

  <Card title={`${access ? '3' : '4'}) Tareas ${access ? `de ${uname}` : ''}`}>
          {!access && <p>Logueate para gestionar tus tareas.</p>}
          {access && (
            <>
              <div className="flex gap-2 flex-wrap items-center">
                <input className="border border-slate-300 rounded-md px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} placeholder="Título" />
                <select className="border border-slate-300 rounded-md px-3 py-2" value={priority} onChange={e => setPriority(e.target.value)}>
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                </select>
                <input className="border border-slate-300 rounded-md px-3 py-2" type="date" value={due} onChange={e => setDue(e.target.value)} />
                <Button onClick={create} disabled={!title.trim()}>Crear</Button>
                <Button onClick={() => refreshTasks()}>Refrescar</Button>
              </div>
              {/* Filtros */}
              <div className="mt-3 flex gap-2 flex-wrap items-center">
                <input className="border border-slate-300 rounded-md px-3 py-2" placeholder="Buscar" value={filters.search ?? ''} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
                <select className="border border-slate-300 rounded-md px-3 py-2" value={filters.priority ?? ''} onChange={e => setFilters(f => ({ ...f, priority: (e.target.value || '') as any }))}>
                  <option value="">Prioridad (todas)</option>
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                </select>
                <select className="border border-slate-300 rounded-md px-3 py-2" value={filters.status ?? ''} onChange={e => setFilters(f => ({ ...f, status: (e.target.value || '') as any }))}>
                  <option value="">Estado (todos)</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="IN_PROGRESS">En Progreso</option>
                  <option value="COMPLETED">Completada</option>
                </select>
                <input className="border border-slate-300 rounded-md px-3 py-2" type="date" value={filters.due_date ?? ''} onChange={e => setFilters(f => ({ ...f, due_date: e.target.value }))} />
                <select className="border border-slate-300 rounded-md px-3 py-2" value={filters.ordering ?? ''} onChange={e => setFilters(f => ({ ...f, ordering: e.target.value }))}>
                  <option value="">Orden</option>
                  <option value="-created_at">Más nuevas</option>
                  <option value="created_at">Más antiguas</option>
                  <option value="due_date">Vencimiento ↑</option>
                  <option value="-due_date">Vencimiento ↓</option>
                </select>
                <Button onClick={() => refreshTasks()}>Aplicar filtros</Button>
              </div>
              <div className="mt-3">
                {tasks.length === 0 ? (
                  <p>No hay tareas aún. Creá la primera 👆</p>
                ) : (
                  <ul className="divide-y">
                    {tasks.map((t: any) => (
                      <TaskRow key={t.id} task={t} onChanged={refreshTasks} />
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-3 flex justify-between items-center">
                <Button variant="secondary" disabled={!page.previous} onClick={() => page.previous && refreshTasks(page.previous!)}>Anterior</Button>
                <div className="text-sm text-slate-600">{typeof page.count === 'number' ? `Total: ${page.count}` : ''}</div>
                <Button variant="secondary" disabled={!page.next} onClick={() => page.next && refreshTasks(page.next!)}>Siguiente</Button>
              </div>
            </>
          )}
        </Card>
        </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Notificación">
        <p>{message}</p>
      </Modal>
      </div>
    </div>
  )
}

function TaskRow({ task, onChanged }: { task: api.Task; onChanged: () => void }) {
  const { access } = useAuth()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [priority, setPriority] = useState<'LOW'|'MEDIUM'|'HIGH'>(task.priority ?? 'MEDIUM')
  const [status, setStatus] = useState<'PENDING'|'IN_PROGRESS'|'COMPLETED'>(task.status ?? 'PENDING')
  const [due, setDue] = useState(task.due_date ?? '')

  async function save() {
    if (!access) return
    await api.updateTask(access, task.id, { title, priority: priority as any, status: status as any, due_date: due || null })
    setEditing(false)
    onChanged()
  }

  async function remove() {
    if (!access) return
    await api.deleteTask(access, task.id)
    onChanged()
  }

  return (
    <li className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
      {!editing ? (
        <div className="text-slate-800">
          <span className="font-semibold">{task.title}</span>
          <span className="ml-2 text-sm text-slate-600">prio: {task.priority} {task.due_date ? `· vence: ${task.due_date}` : ''} · estado: {task.status}</span>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap items-center">
          <input className="border border-slate-300 rounded-md px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} />
          <select className="border border-slate-300 rounded-md px-3 py-2" value={priority} onChange={e => setPriority(e.target.value as 'LOW'|'MEDIUM'|'HIGH')}>
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
          </select>
          <select className="border border-slate-300 rounded-md px-3 py-2" value={status} onChange={e => setStatus(e.target.value as 'PENDING'|'IN_PROGRESS'|'COMPLETED')}>
            <option value="PENDING">Pendiente</option>
            <option value="IN_PROGRESS">En Progreso</option>
            <option value="COMPLETED">Completada</option>
          </select>
          <input className="border border-slate-300 rounded-md px-3 py-2" type="date" value={due ?? ''} onChange={e => setDue(e.target.value)} />
        </div>
      )}
      <div className="flex gap-2">
        {!editing ? (
          <>
            <Button variant="secondary" onClick={() => setEditing(true)}>Editar</Button>
            <Button variant="ghost" onClick={remove}>Eliminar</Button>
          </>
        ) : (
          <>
            <Button onClick={save}>Guardar</Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>
          </>
        )}
      </div>
    </li>
  )
}

function App() {
  return (
    <AuthProvider>
      <Steps />
    </AuthProvider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
