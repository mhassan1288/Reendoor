import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { roleLabel } from '../roles'
import { useAuth } from '../auth'
import { Icon } from './Chrome'

export function Drawer({
  open,
  onClose,
  onLogout,
}: {
  open: boolean
  onClose: () => void
  onLogout: () => void
}) {
  const { user } = useAuth()
  const navigate = useNavigate()
  if (!open || !user) return null
  const pro = user.role === 'owner_pro'
  const invoicing = user.role === 'invoicing' || user.role === 'contractor'
  const admin = user.role === 'admin'

  return (
    <>
      <button className="overlay" type="button" aria-label="Close menu" onClick={onClose} />
      <aside className="drawer">
        <div className="drawer-user">
          <span className="avatar">{user.firstName[0]}{user.lastName[0]}</span>
          <div>
            <div>{user.name}</div>
            <p className="role">{roleLabel(user.role)}</p>
          </div>
        </div>
        <Link className="drawer-link" to="/profile" onClick={onClose}>
          <Icon name="profile" />
          Profile
        </Link>
        {pro ? (
          <>
            <Link className="drawer-link" to="/dashboard" onClick={onClose}>
              <Icon name="filter" />
              Dashboard
            </Link>
            <Link className="drawer-link" to="/contractors" onClick={onClose}>
              <Icon name="profile" />
              Contractors
            </Link>
            <Link className="drawer-link" to="/tenants" onClick={onClose}>
              <Icon name="house" />
              Tenants
            </Link>
            <Link className="drawer-link" to="/inventory" onClick={onClose}>
              <Icon name="list" />
              Inventory
            </Link>
            <Link className="drawer-link" to="/accounts" onClick={onClose}>
              <Icon name="profile" />
              Accounts
            </Link>
          </>
        ) : null}
        {invoicing ? (
          <>
            <Link className="drawer-link" to="/contacts" onClick={onClose}>
              <Icon name="profile" />
              Contacts
            </Link>
            <Link className="drawer-link" to="/subcontractors" onClick={onClose}>
              <Icon name="profile" />
              Sub-contractors
            </Link>
          </>
        ) : null}
        {admin ? (
          <>
            <Link className="drawer-link" to="/categories" onClick={onClose}>
              <Icon name="list" />
              Service categories
            </Link>
            <Link className="drawer-link" to="/subscriptions" onClick={onClose}>
              <Icon name="info" />
              Subscriptions
            </Link>
            <Link className="drawer-link" to="/blogs" onClick={onClose}>
              <Icon name="edit" />
              Blogs
            </Link>
            <Link className="drawer-link" to="/accounts" onClick={onClose}>
              <Icon name="profile" />
              Accounts
            </Link>
          </>
        ) : null}
        <Link className="drawer-link" to="/feedback" onClick={onClose}>
          <Icon name="info" />
          Help & Feedback
        </Link>
        <button
          className="drawer-link"
          type="button"
          onClick={() => {
            onLogout()
            onClose()
            navigate('/signin')
          }}
        >
          <Icon name="arrowBack" />
          Logout
        </button>
      </aside>
    </>
  )
}

export function FilterSheet({
  open,
  onClose,
  status,
  priority,
  onStatus,
  onPriority,
  onApply,
  onClear,
}: {
  open: boolean
  onClose: () => void
  status: string
  priority: string
  onStatus: (value: string) => void
  onPriority: (value: string) => void
  onApply: () => void
  onClear: () => void
}) {
  if (!open) return null
  return (
    <>
      <button className="overlay" type="button" aria-label="Close filters" onClick={onClose} />
      <div className="sheet">
        <div className="handle" />
        <p className="section-title" style={{ marginBottom: 8 }}>
          By status
        </p>
        <div className="chips">
          {['Open', 'Quoted', 'Accepted', 'In-progress', 'Completed'].map((item) => (
            <button
              key={item}
              type="button"
              className={`choice${status === item ? ' on' : ''}`}
              onClick={() => onStatus(status === item ? '' : item)}
            >
              {item}
            </button>
          ))}
        </div>
        <p className="section-title" style={{ marginBottom: 8 }}>
          By priority
        </p>
        <div className="chips">
          {['High', 'Medium', 'Low'].map((item) => (
            <button
              key={item}
              type="button"
              className={`choice${priority === item ? ' on' : ''}`}
              onClick={() => onPriority(priority === item ? '' : item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="sheet-actions">
          <ButtonLike outline onClick={onClear}>
            Clear
          </ButtonLike>
          <ButtonLike onClick={onApply}>Apply filters</ButtonLike>
        </div>
        <div className="home-indicator">
          <span />
        </div>
      </div>
    </>
  )
}

function ButtonLike({
  children,
  onClick,
  outline,
}: {
  children: ReactNode
  onClick: () => void
  outline?: boolean
}) {
  return (
    <button type="button" className={`btn ${outline ? 'outline' : 'primary'}`} onClick={onClick}>
      {children}
    </button>
  )
}
