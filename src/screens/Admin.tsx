import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../auth'
import { BottomNav } from '../components/BottomNav'
import { Header } from '../components/Header'
import { Drawer } from '../components/Overlays'
import { useApp } from '../context'

export function ActivityLogs() {
  const { logout } = useAuth()
  const [menu, setMenu] = useState(false)
  const [events, setEvents] = useState<{ id: string; message: string; author: string; date: string }[]>([])
  useEffect(() => {
    void api<{ events: typeof events }>('/admin/activity').then((res) => setEvents(res.events))
  }, [])
  return (
    <section className="screen">
      <Header title="Activity logs" onMenu={() => setMenu(true)} />
      <div className="screen-body">
        <div className="list">
          {events.map((item) => (
            <div className="card" key={item.id}>
              <h3>{item.author}</h3>
              <p className="addr">{item.message}</p>
              <p className="date">{item.date}</p>
            </div>
          ))}
        </div>
      </div>
      <BottomNav active="activity" />
      <Drawer open={menu} onClose={() => setMenu(false)} onLogout={logout} />
    </section>
  )
}

export function Reports() {
  const { logout } = useAuth()
  const [menu, setMenu] = useState(false)
  const [reports, setReports] = useState<{ id: string; name: string; rows: number }[]>([])
  useEffect(() => {
    void api<{ reports: typeof reports }>('/reports').then((res) => setReports(res.reports))
  }, [])
  async function downloadReport() {
    const csv = ['Report,Rows', ...reports.map((item) => `"${item.name.replaceAll('"', '""')}",${item.rows}`)].join('\n')
    const file = new File([csv], 'rendoor-report.csv', { type: 'text/csv' })
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title: 'Rendoor report', files: [file] })
      return
    }
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = 'rendoor-report.csv'
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    window.setTimeout(() => {
      link.remove()
      URL.revokeObjectURL(url)
    }, 1000)
  }
  return (
    <section className="screen">
      <Header title="Reports" onMenu={() => setMenu(true)} />
      <div className="screen-body">
        <div className="list">
          {reports.map((item) => (
            <div className="card" key={item.id}>
              <h3>{item.name}</h3>
              <p className="type">{item.rows} rows</p>
            </div>
          ))}
        </div>
        <div className="form">
          <button className="btn outline" type="button" onClick={() => void downloadReport()}>
            Download Report
          </button>
        </div>
      </div>
      <BottomNav active="reports" />
      <Drawer open={menu} onClose={() => setMenu(false)} onLogout={logout} />
    </section>
  )
}

export function Categories() {
  const { logout } = useAuth()
  const { flash, toast } = useApp()
  const [menu, setMenu] = useState(false)
  const [items, setItems] = useState<{ id: string; name: string }[]>([])
  const [name, setName] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  function load() {
    void api<{ categories: { id: string; name: string }[] }>('/admin/categories').then((res) =>
      setItems(res.categories),
    )
  }
  useEffect(load, [])
  return (
    <section className="screen">
      <Header title="Service categories" onMenu={() => setMenu(true)} />
      <div className="screen-body">
        <div className="list">
          {items.map((item) => (
            <div className="card" key={item.id}>
              {editing === item.id ? (
                <div className="field">
                  <input className="control" value={name} onChange={(e) => setName(e.target.value)} />
                  <button className="btn primary" type="button" onClick={() => void api(`/admin/categories/${item.id}`, { method: 'PATCH', body: JSON.stringify({ name }) }).then(() => { flash('Service updated'); setEditing(null); setName(''); load() })}>
                    Save
                  </button>
                </div>
              ) : (
                <>
                  <h3>{item.name}</h3>
                  <button className="btn outline" type="button" onClick={() => { setEditing(item.id); setName(item.name) }}>
                    Edit service
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="form">
          <div className="field">
            <label>New category</label>
            <input className="control" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <button
            className="btn primary"
            type="button"
            onClick={() => {
              if (!name.trim()) return
              void api('/admin/categories', { method: 'POST', body: JSON.stringify({ name }) }).then(() => {
                flash('Category added')
                setName('')
                load()
              })
            }}
          >
            Add
          </button>
        </div>
      </div>
      {toast ? <div className="toast">{toast}</div> : null}
      <BottomNav active="dashboard" />
      <Drawer open={menu} onClose={() => setMenu(false)} onLogout={logout} />
    </section>
  )
}

export function Subscriptions() {
  const { logout } = useAuth()
  const [menu, setMenu] = useState(false)
  const [plans, setPlans] = useState<{ id: string; name: string; count: number }[]>([])
  useEffect(() => {
    void api<{ plans: typeof plans }>('/admin/subscriptions').then((res) => setPlans(res.plans))
  }, [])
  const total = plans.reduce((s, p) => s + p.count, 0) || 1
  return (
    <section className="screen">
      <Header title="Subscriptions" onMenu={() => setMenu(true)} />
      <div className="screen-body">
        <div className="form">
          <div className="stat-card">
            <h2>Plan mix</h2>
            <div
              className="donut"
              style={{
                background: `conic-gradient(#0076b7 0 ${(plans[0]?.count || 0) / total * 100}%, #4d9fd6 0 ${((plans[0]?.count || 0) + (plans[1]?.count || 0)) / total * 100}%, #88d8b0 0 100%)`,
              }}
            >
              <span>Total {total}</span>
            </div>
            {plans.map((plan) => (
              <div className="cost-row" key={plan.id}>
                <span>{plan.name}</span>
                <b>{plan.count}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav active="dashboard" />
      <Drawer open={menu} onClose={() => setMenu(false)} onLogout={logout} />
    </section>
  )
}

export function Blogs() {
  const { logout } = useAuth()
  const { flash, toast } = useApp()
  const [menu, setMenu] = useState(false)
  const [blogs, setBlogs] = useState<{ id: string; title: string; body: string; author: string; date: string }[]>([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  function load() {
    void api<{ blogs: typeof blogs }>('/admin/blogs').then((res) => setBlogs(res.blogs))
  }
  useEffect(load, [])
  return (
    <section className="screen">
      <Header title="Blogs" onMenu={() => setMenu(true)} />
      <div className="screen-body">
        <div className="list">
          {blogs.map((item) => (
            <div className="card" key={item.id}>
              <h3>{item.title}</h3>
              <p className="addr">{item.body}</p>
              <p className="date">
                {item.author} · {item.date}
              </p>
            </div>
          ))}
        </div>
        <div className="form">
          <div className="field">
            <label>Title</label>
            <input className="control" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="field">
            <label>Body</label>
            <textarea className="control" value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <button
            className="btn primary"
            type="button"
            onClick={() => {
              if (!title.trim()) return
              void api('/admin/blogs', { method: 'POST', body: JSON.stringify({ title, body }) }).then(() => {
                flash('Blog published')
                setTitle('')
                setBody('')
                load()
              })
            }}
          >
            Publish
          </button>
        </div>
      </div>
      {toast ? <div className="toast">{toast}</div> : null}
      <BottomNav active="dashboard" />
      <Drawer open={menu} onClose={() => setMenu(false)} onLogout={logout} />
    </section>
  )
}

export function AdminDashboard() {
  const { logout } = useAuth()
  const [menu, setMenu] = useState(false)
  const [stats, setStats] = useState<{
    users: number
    byRole: Record<string, number>
    requests: number
    properties: number
    plans: { name: string; count: number }[]
  } | null>(null)
  useEffect(() => {
    void api<NonNullable<typeof stats>>('/admin/stats').then(setStats).catch(() => undefined)
  }, [])
  return (
    <section className="screen">
      <Header title="Admin dashboard" onMenu={() => setMenu(true)} />
      <div className="screen-body">
        <div className="form">
          <div className="stat-card">
            <h2>Users</h2>
            <p className="metric">{stats?.users ?? 0}</p>
            {Object.entries(stats?.byRole || {}).map(([k, v]) => (
              <div className="cost-row" key={k}>
                <span>{k}</span>
                <b>{v}</b>
              </div>
            ))}
          </div>
          <div className="stat-card">
            <h2>Service requests</h2>
            <p className="metric">{stats?.requests ?? 0}</p>
          </div>
          <div className="stat-card">
            <h2>Properties</h2>
            <p className="metric">{stats?.properties ?? 0}</p>
          </div>
          <div className="stat-card">
            <h2>Subscriptions</h2>
            {(stats?.plans || []).map((plan) => (
              <div className="cost-row" key={plan.name}>
                <span>{plan.name}</span>
                <b>{plan.count}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav active="dashboard" />
      <Drawer open={menu} onClose={() => setMenu(false)} onLogout={logout} />
    </section>
  )
}
