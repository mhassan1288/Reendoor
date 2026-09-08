import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { BottomNav } from '../components/BottomNav'
import { ServiceRequestCard } from '../components/Cards'
import { Header } from '../components/Header'
import { Icon } from '../components/Chrome'
import { Drawer, FilterSheet } from '../components/Overlays'
import { useApp } from '../context'

export function Queues() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { requests, toast } = useApp()
  const [query, setQuery] = useState('')
  const [menu, setMenu] = useState(false)
  const [filters, setFilters] = useState(false)
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [applied, setApplied] = useState({ status: '', priority: '' })

  const visible = useMemo(() => {
    return requests.filter((item) => {
      const q = query.toLowerCase()
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q)
      const matchesStatus = !applied.status || item.status === applied.status
      const matchesPriority = !applied.priority || item.priority === applied.priority
      return matchesQuery && matchesStatus && matchesPriority
    })
  }, [applied, query, requests])

  return (
    <section className="screen">
      <Header welcome={user?.name} onMenu={() => setMenu(true)} />
      <div className="screen-body">
        <div className="search-row">
          <label className="search">
            <Icon name="search" size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search here"
            />
          </label>
          <button className="filter-btn" type="button" onClick={() => setFilters(true)} aria-label="Filter">
            <Icon name="filter" />
          </button>
        </div>
        <div className="list">
          {visible.map((item) => (
            <ServiceRequestCard
              key={item.id}
              request={item}
              onClick={() => navigate(`/requests/${item.id}`)}
            />
          ))}
        </div>
      </div>
      <button className="fab" type="button" onClick={() => navigate('/requests/new')} aria-label="Create">
        <Icon name="plus" />
      </button>
      <BottomNav active="queues" />
      {toast ? <div className="toast">{toast}</div> : null}
      <Drawer open={menu} onClose={() => setMenu(false)} onLogout={logout} />
      <FilterSheet
        open={filters}
        onClose={() => setFilters(false)}
        status={status}
        priority={priority}
        onStatus={setStatus}
        onPriority={setPriority}
        onClear={() => {
          setStatus('')
          setPriority('')
          setApplied({ status: '', priority: '' })
          setFilters(false)
        }}
        onApply={() => {
          setApplied({ status, priority })
          setFilters(false)
        }}
      />
    </section>
  )
}
