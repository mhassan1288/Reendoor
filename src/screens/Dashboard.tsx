import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { api } from '../api/client'
import { BottomNav } from '../components/BottomNav'
import { Header } from '../components/Header'
import { Icon } from '../components/Chrome'
import { Drawer } from '../components/Overlays'

type Dash = {
  totalRequests: number
  byStatus: Record<string, number>
  properties: number
  tenants: number
  costing: { name: string; amount: number }[]
  avgCost: number
  resolution: string
}

export function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [menu, setMenu] = useState(false)
  const [data, setData] = useState<Dash | null>(null)

  useEffect(() => {
    void api<Dash>('/dashboard').then(setData)
  }, [])

  const total = data?.totalRequests || 1

  return (
    <section className="screen">
      <Header title="Dashboard" onMenu={() => setMenu(true)} />
      <div className="screen-body">
        <div className="form">
          <div className="stat-card">
            <div className="stat-h">
              <h2>Total Service Requests</h2>
              <Icon name="info" size={16} />
            </div>
            <div className="stat-row">
              <ul className="legend">
                {Object.entries(data?.byStatus || {}).map(([k, v]) => (
                  <li key={k}>
                    {k} {v}
                  </li>
                ))}
              </ul>
              <div
                className="donut"
                style={{
                  background: `conic-gradient(#0076b7 0 ${(data?.byStatus.Open || 0) / total * 100}%, #4d9fd6 0 ${((data?.byStatus.Open || 0) + (data?.byStatus.Quoted || 0)) / total * 100}%, #9fcaf0 0 ${((data?.byStatus.Open || 0) + (data?.byStatus.Quoted || 0) + (data?.byStatus.Accepted || 0)) / total * 100}%, #88d8b0 0 100%)`,
                }}
              >
                <span>Total {data?.totalRequests ?? 0}</span>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <h2>Properties</h2>
            <p className="metric">{data?.properties ?? 0}</p>
          </div>
          <div className="stat-card">
            <h2>Tenants</h2>
            <p className="metric">{data?.tenants ?? 0}</p>
          </div>
          <div className="stat-card">
            <h2>Service Request Costing / Category</h2>
            {(data?.costing.length ? data.costing : [{ name: 'Plumbing', amount: 0 }]).map((row) => (
              <div className="cost-row" key={row.name}>
                <span>{row.name}</span>
                <b>€{row.amount}</b>
              </div>
            ))}
          </div>
          <div className="stat-card">
            <h2>Avg Maintenance Cost / Property</h2>
            <p className="metric">€{data?.avgCost ?? 0}</p>
            <p className="trend up">+45% vs last cycle</p>
          </div>
          <div className="stat-card">
            <h2>Avg Issue Resolution Time</h2>
            <p className="metric sm">{data?.resolution}</p>
            <p className="trend down">-3% vs last cycle</p>
          </div>
          <button className="btn outline" type="button" onClick={() => navigate('/reports')}>
            Download Report
          </button>
        </div>
      </div>
      <BottomNav active={user?.role === 'admin' ? 'dashboard' : 'queues'} />
      <Drawer open={menu} onClose={() => setMenu(false)} onLogout={logout} />
    </section>
  )
}
