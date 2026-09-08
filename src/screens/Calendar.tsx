import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { BottomNav } from '../components/BottomNav'
import { ServiceRequestCard } from '../components/Cards'
import { Header } from '../components/Header'
import { Icon } from '../components/Chrome'
import { Drawer, FilterSheet } from '../components/Overlays'
import { useApp } from '../context'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const dates = [16, 17, 18, 19, 20, 21, 22]

export function CalendarScreen() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { requests } = useApp()
  const [selected, setSelected] = useState(18)
  const [menu, setMenu] = useState(false)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(false)
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [applied, setApplied] = useState({ status: '', priority: '' })

  const visible = useMemo(
    () =>
      requests.filter(
        (item) =>
          !query ||
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.type.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, requests],
  )
  const filtered = visible.filter((item) => (!applied.status || item.status === applied.status) && (!applied.priority || item.priority === applied.priority))

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
          <button className="filter-btn" type="button" aria-label="Filter" onClick={() => setFilters(true)}>
            <Icon name="filter" />
          </button>
        </div>
        <div className="week">
          <div className="month">
            February 2026
            <Icon name="chevronDown" size={16} />
          </div>
          <div className="days">
            {days.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="dates">
            {dates.map((day) => (
              <button
                key={day}
                type="button"
                className={`date-btn${selected === day ? ' active' : ''}`}
                onClick={() => setSelected(day)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
        <div className="list">
          {filtered.map((item) => (
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
      <BottomNav active="calendar" />
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
