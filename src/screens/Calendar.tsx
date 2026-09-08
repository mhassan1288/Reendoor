import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { BottomNav } from '../components/BottomNav'
import { ServiceRequestCard } from '../components/Cards'
import { Header } from '../components/Header'
import { Icon } from '../components/Chrome'
import { Drawer, FilterSheet } from '../components/Overlays'
import { useApp } from '../context'

export function CalendarScreen() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { requests } = useApp()
  const week = useMemo(() => {
    const today = new Date()
    const monday = new Date(today)
    const day = monday.getDay()
    monday.setDate(monday.getDate() + (day === 0 ? -6 : 1 - day))
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + index)
      return date
    })
  }, [])
  const [selected, setSelected] = useState(() => new Date().toISOString().slice(0, 10))
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
          {week[0].toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            <Icon name="chevronDown" size={16} />
          </div>
          <div className="days">
          {week.map((date) => (
            <span key={date.toISOString()}>{date.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
            ))}
          </div>
          <div className="dates">
          {week.map((date) => {
            const value = date.toISOString().slice(0, 10)
            return (
            <button
              key={value}
              type="button"
              className={`date-btn${selected === value ? ' active' : ''}`}
              onClick={() => setSelected(value)}
            >
              {date.getDate()}
            </button>
            )
          })}
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
