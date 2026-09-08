import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth'
import type { TabKey } from '../types'
import { HomeIndicator, Icon } from './Chrome'

type IconName = 'list' | 'calendar' | 'house' | 'profile' | 'edit' | 'info' | 'filter'

const ownerItems: { to: string; key: TabKey; label: string; icon: IconName }[] = [
  { to: '/queues', key: 'queues', label: 'Queues', icon: 'list' },
  { to: '/calendar', key: 'calendar', label: 'Calendar', icon: 'calendar' },
  { to: '/properties', key: 'property', label: 'Property', icon: 'house' },
  { to: '/profile', key: 'profile', label: 'Profile', icon: 'profile' },
]

const invoiceItems: { to: string; key: TabKey; label: string; icon: IconName }[] = [
  { to: '/queues', key: 'queues', label: 'Queues', icon: 'list' },
  { to: '/quotations', key: 'quotations', label: 'Quotations', icon: 'edit' },
  { to: '/invoices', key: 'invoices', label: 'Invoices', icon: 'info' },
  { to: '/profile', key: 'profile', label: 'Profile', icon: 'profile' },
]

const adminItems: { to: string; key: TabKey; label: string; icon: IconName }[] = [
  { to: '/queues', key: 'queues', label: 'Queues', icon: 'list' },
  { to: '/dashboard', key: 'dashboard', label: 'Dashboard', icon: 'filter' },
  { to: '/activity', key: 'activity', label: 'Activity logs', icon: 'calendar' },
  { to: '/reports', key: 'reports', label: 'Reports', icon: 'info' },
]

export function BottomNav({ active }: { active: TabKey }) {
  const { user } = useAuth()
  const items =
    user?.role === 'admin'
      ? adminItems
      : user?.role === 'invoicing' || user?.role === 'contractor'
        ? invoiceItems
        : ownerItems

  return (
    <nav className="bottom-nav">
      <div className="nav-row">
        {items.map((item) => (
          <NavLink
            key={item.key}
            to={item.to}
            className={`nav-item${active === item.key ? ' active' : ''}`}
          >
            <Icon name={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </div>
      <HomeIndicator />
    </nav>
  )
}
