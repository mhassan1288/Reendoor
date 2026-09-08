import type { Role } from './types'

export function homeFor(role: Role) {
  if (role === 'admin') return '/dashboard'
  if (role === 'invoicing' || role === 'contractor') return '/quotations'
  return '/queues'
}

export function roleLabel(role: Role) {
  if (role === 'owner_free' || role === 'owner_pro') return 'Property Owner'
  if (role === 'tenant') return 'Tenant'
  if (role === 'invoicing' || role === 'contractor') return 'Contractor'
  return 'Admin'
}
