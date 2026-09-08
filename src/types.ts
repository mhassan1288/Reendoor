export type Role = 'owner_free' | 'owner_pro' | 'tenant' | 'contractor' | 'invoicing' | 'admin'

export type RequestStatus = 'Open' | 'Quoted' | 'Accepted' | 'In-progress' | 'Completed'
export type Priority = 'High' | 'Medium' | 'Low'

export type User = {
  id: string
  email: string
  role: Role
  firstName: string
  lastName: string
  phone: string
  companyName: string
  name: string
}

export type CommentItem = {
  id: string
  body: string
  date: string
  author: string
  initials: string
}

export type ActivityItem = {
  id: string
  message: string
  date: string
  author: string
  initials: string
}

export type ServiceRequest = {
  id: string
  code: string
  title: string
  type: string
  address: string
  postTown: string
  postCode: string
  status: RequestStatus
  priority: Priority
  date: string
  createdAt: string
  description: string
  quoteAmount?: number
  quoteAccepted?: boolean
  quoteRejected?: boolean
  images?: string[]
  comments?: CommentItem[]
  activities?: ActivityItem[]
}

export type PropertyRecord = {
  id: string
  type: string
  address: string
  postTown: string
  postCode: string
  spaces: { id?: string; name: string; note: string }[]
}

export type QuoteRecord = {
  id: string
  name: string
  status: string
  companyName: string
  clientName: string
  notes: string
  subtotal: number
  discount: number
  vat: number
  total: number
  date?: string
  lines: { id?: string; description: string; quantity: number; unitPrice: number }[]
}

export type InvoiceRecord = {
  id: string
  name: string
  status: string
  companyName: string
  clientName: string
  notes: string
  total: number
  date?: string
  lines: { id?: string; description: string; quantity: number; unitPrice: number }[]
}

export type TabKey =
  | 'queues'
  | 'calendar'
  | 'property'
  | 'profile'
  | 'quotations'
  | 'invoices'
  | 'dashboard'
  | 'activity'
  | 'reports'
