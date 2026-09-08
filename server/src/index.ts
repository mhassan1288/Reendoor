import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import fastifyStatic from '@fastify/static'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { mkdirSync } from 'node:fs'
import { createHash, randomBytes } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Fastify, { type FastifyRequest } from 'fastify'

const prisma = new PrismaClient()
const app = Fastify({ logger: false })

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDate(d: Date) {
  return `${String(d.getDate()).padStart(2, '0')}/${months[d.getMonth()]}/${d.getFullYear()}`
}

function formatCreated(d: Date) {
  const time = d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${formatDate(d)}, 3d, ${time}`
}

function publicUser(user: {
  id: string
  email: string
  role: string
  firstName: string
  lastName: string
  phone: string
  companyName: string
}) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    companyName: user.companyName,
    name: `${user.firstName} ${user.lastName}`,
  }
}

function mapRequest(r: {
  id: string
  code: string
  title: string
  type: string
  description: string
  address: string
  postTown: string
  postCode: string
  status: string
  priority: string
  quoteAmount: number | null
  quoteAccepted: boolean
  quoteRejected: boolean
  createdAt: Date
  images?: { url: string }[]
  comments?: {
    id: string
    body: string
    createdAt: Date
    user: { firstName: string; lastName: string }
  }[]
  activities?: {
    id: string
    message: string
    createdAt: Date
    user: { firstName: string; lastName: string }
  }[]
}) {
  return {
    id: r.id,
    code: r.code,
    title: r.title,
    type: r.type,
    description: r.description,
    address: r.address,
    postTown: r.postTown,
    postCode: r.postCode,
    status: r.status,
    priority: r.priority,
    quoteAmount: r.quoteAmount ?? undefined,
    quoteAccepted: r.quoteAccepted,
    quoteRejected: r.quoteRejected,
    date: formatDate(r.createdAt),
    createdAt: formatCreated(r.createdAt),
    images: r.images?.map((i) => i.url) ?? [],
    comments:
      r.comments?.map((c) => ({
        id: c.id,
        body: c.body,
        date: formatDate(c.createdAt),
        author: `${c.user.firstName} ${c.user.lastName}`,
        initials: `${c.user.firstName[0] ?? ''}${c.user.lastName[0] ?? ''}`.toUpperCase(),
      })) ?? [],
    activities:
      r.activities?.map((a) => ({
        id: a.id,
        message: a.message,
        date: formatCreated(a.createdAt),
        author: `${a.user.firstName} ${a.user.lastName}`,
        initials: `${a.user.firstName[0] ?? ''}${a.user.lastName[0] ?? ''}`.toUpperCase(),
      })) ?? [],
  }
}

type TokenUser = { id: string; role: string; email: string }

async function auth(req: FastifyRequest) {
  return req.jwtVerify<TokenUser>()
}

function ownerScope(user: TokenUser) {
  if (user.role === 'admin') return {}
  return { ownerId: user.id }
}

async function requestScope(user: TokenUser) {
  if (user.role === 'admin') return {}
  if (user.role === 'tenant') {
    const rows = await prisma.tenant.findMany({ where: { email: user.email } })
    const propertyIds = rows.map((row) => row.propertyId).filter((id): id is string => Boolean(id))
    return { OR: [{ ownerId: user.id }, { propertyId: { in: propertyIds } }] }
  }
  if (user.role === 'invoicing' || user.role === 'contractor') {
    return {
      OR: [{ ownerId: user.id }, { status: { in: ['Open', 'Quoted', 'Accepted', 'In-progress'] } }],
    }
  }
  return { ownerId: user.id }
}

async function propertyScope(user: TokenUser) {
  if (user.role === 'admin') return {}
  if (user.role === 'tenant') {
    const rows = await prisma.tenant.findMany({ where: { email: user.email } })
    const ids = rows.map((row) => row.propertyId).filter((id): id is string => Boolean(id))
    return { OR: [{ ownerId: user.id }, { id: { in: ids } }] }
  }
  return { ownerId: user.id }
}

const uploadDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../uploads')
mkdirSync(uploadDir, { recursive: true })

await app.register(cors, { origin: true })
await app.register(jwt, { secret: process.env.JWT_SECRET || 'rendoor-dev-secret' })
await app.register(fastifyStatic, { root: uploadDir, prefix: '/uploads/' })

app.get('/health', async () => ({ ok: true }))

app.post('/auth/login', async (req, reply) => {
  const body = req.body as { email?: string; password?: string }
  const email = body.email?.trim().toLowerCase()
  const password = body.password ?? ''
  if (!email || !password) return reply.code(400).send({ error: 'Email and password required' })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return reply.code(401).send({ error: 'Invalid email or password' })
  }
  const token = app.jwt.sign({ id: user.id, role: user.role, email: user.email })
  return { token, user: publicUser(user) }
})

app.post('/auth/forgot-password', async (req, reply) => {
  const body = req.body as { email?: string }
  const email = body.email?.trim().toLowerCase()
  if (!email) return reply.code(400).send({ error: 'Email is required' })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { message: 'If an account exists, a reset email has been sent.' }
  if (!process.env.RESEND_API_KEY || !process.env.MAIL_FROM || !process.env.APP_URL) {
    return reply.code(503).send({ error: 'Password reset email service is not configured' })
  }

  const rawToken = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })
  await prisma.passwordResetToken.create({
    data: { tokenHash, userId: user.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
  })

  const resetUrl = `${process.env.APP_URL.replace(/\/$/, '')}/reset-password?token=${rawToken}`
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to: [user.email],
      subject: 'Reset your Rendoor password',
      html: `<p>Hello ${user.firstName},</p><p>Use the link below to reset your Rendoor password. It expires in one hour.</p><p><a href="${resetUrl}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`,
    }),
  })
  if (!response.ok) {
    const detail = await response.text()
    req.log.error({ status: response.status, detail }, 'Password reset email failed')
    return reply.code(502).send({ error: 'Unable to send password reset email' })
  }
  return { message: 'If an account exists, a reset email has been sent.' }
})

app.post('/auth/reset-password', async (req, reply) => {
  const body = req.body as { token?: string; password?: string }
  if (!body.token || !body.password || body.password.length < 8) {
    return reply.code(400).send({ error: 'A token and password of at least 8 characters are required' })
  }
  const tokenHash = createHash('sha256').update(body.token).digest('hex')
  const reset = await prisma.passwordResetToken.findUnique({ where: { tokenHash } })
  if (!reset || reset.expiresAt <= new Date()) {
    return reply.code(400).send({ error: 'This reset link is invalid or expired' })
  }
  const passwordHash = await bcrypt.hash(body.password, 10)
  await prisma.$transaction([
    prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.delete({ where: { id: reset.id } }),
  ])
  return { message: 'Password updated successfully' }
})

app.get('/auth/me', async (req, reply) => {
  try {
    const token = await auth(req)
    const user = await prisma.user.findUnique({ where: { id: token.id } })
    if (!user) return reply.code(401).send({ error: 'Unauthorized' })
    return { user: publicUser(user) }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.patch('/auth/profile', async (req, reply) => {
  try {
    const token = await auth(req)
    const body = req.body as { firstName?: string; lastName?: string; phone?: string; companyName?: string }
    const user = await prisma.user.update({
      where: { id: token.id },
      data: {
        firstName: body.firstName?.trim() || undefined,
        lastName: body.lastName?.trim() || undefined,
        phone: body.phone?.trim() || undefined,
        companyName: body.companyName?.trim() || undefined,
      },
    })
    return { user: publicUser(user) }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.get('/requests', async (req, reply) => {
  try {
    const user = await auth(req)
    const list = await prisma.serviceRequest.findMany({
      where: await requestScope(user),
      orderBy: { createdAt: 'desc' },
      include: { images: true },
    })
    return { requests: list.map(mapRequest) }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.get('/requests/:id', async (req, reply) => {
  try {
    const user = await auth(req)
    const { id } = req.params as { id: string }
    const item = await prisma.serviceRequest.findFirst({
      where: { id, ...(await requestScope(user)) },
      include: {
        images: true,
        comments: { include: { user: true }, orderBy: { createdAt: 'asc' } },
        activities: { include: { user: true }, orderBy: { createdAt: 'desc' } },
      },
    })
    if (!item) return reply.code(404).send({ error: 'Not found' })
    return { request: mapRequest(item) }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.post('/requests', async (req, reply) => {
  try {
    const user = await auth(req)
    const body = req.body as {
      title: string
      type: string
      description?: string
      priority: string
      address: string
      postTown: string
      postCode: string
      imageUrls?: string[]
    }
    const count = await prisma.serviceRequest.count()
    const created = await prisma.serviceRequest.create({
      data: {
        code: `SR-${210000 + count + 1}`,
        ownerId: user.id,
        title: body.title,
        type: body.type,
        description: body.description || 'No description provided.',
        priority: body.priority,
        address: body.address,
        postTown: body.postTown,
        postCode: body.postCode,
        status: 'Open',
        images: body.imageUrls?.length ? { create: body.imageUrls.map((url) => ({ url })) } : undefined,
      },
      include: { images: true },
    })
    await prisma.activityEvent.create({
      data: {
        requestId: created.id,
        userId: user.id,
        message: 'Service Request Created',
      },
    })
    return { request: mapRequest(created) }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.post('/requests/:id/accept-quote', async (req, reply) => {
  try {
    const user = await auth(req)
    const { id } = req.params as { id: string }
    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: { status: 'Accepted', quoteAccepted: true, quoteRejected: false },
      include: { images: true },
    })
    await prisma.activityEvent.create({
      data: { requestId: id, userId: user.id, message: 'Quote accepted' },
    })
    return { request: mapRequest(updated) }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.post('/requests/:id/reject-quote', async (req, reply) => {
  try {
    const user = await auth(req)
    const { id } = req.params as { id: string }
    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: { quoteRejected: true, quoteAccepted: false },
      include: { images: true },
    })
    await prisma.activityEvent.create({
      data: { requestId: id, userId: user.id, message: 'Quote rejected' },
    })
    return { request: mapRequest(updated) }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.post('/requests/:id/comments', async (req, reply) => {
  try {
    const user = await auth(req)
    const { id } = req.params as { id: string }
    const body = req.body as { body: string }
    if (!body.body?.trim()) return reply.code(400).send({ error: 'Comment required' })
    await prisma.comment.create({
      data: { requestId: id, userId: user.id, body: body.body.trim() },
    })
    await prisma.activityEvent.create({
      data: { requestId: id, userId: user.id, message: 'Added a comment' },
    })
    const item = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        images: true,
        comments: { include: { user: true }, orderBy: { createdAt: 'asc' } },
        activities: { include: { user: true }, orderBy: { createdAt: 'desc' } },
      },
    })
    return { request: item ? mapRequest(item) : null }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.get('/properties', async (req, reply) => {
  try {
    const user = await auth(req)
    const list = await prisma.property.findMany({
      where: await propertyScope(user),
      include: { spaces: true },
      orderBy: { createdAt: 'desc' },
    })
    return { properties: list }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.post('/properties', async (req, reply) => {
  try {
    const user = await auth(req)
    const body = req.body as {
      type: string
      address: string
      postTown: string
      postCode: string
      spaces?: { name: string; note: string }[]
    }
    const created = await prisma.property.create({
      data: {
        ownerId: user.id,
        type: body.type || 'My property',
        address: body.address,
        postTown: body.postTown,
        postCode: body.postCode,
        spaces: body.spaces?.length
          ? { create: body.spaces }
          : {
              create: [
                { name: 'Lounging Area', note: 'Farmer Meeting' },
                { name: 'Bedroom 1', note: 'Farmer Meeting' },
                { name: 'Guestroom', note: 'Farmer Meeting' },
                { name: 'Bathroom', note: 'Farmer Meeting' },
              ],
            },
      },
      include: { spaces: true },
    })
    return { property: created }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.get('/properties/:id', async (req, reply) => {
  try {
    const user = await auth(req)
    const { id } = req.params as { id: string }
    const property = await prisma.property.findFirst({
      where: { id, ...(await propertyScope(user)) },
      include: { spaces: true, inventory: true },
    })
    if (!property) return reply.code(404).send({ error: 'Not found' })
    return { property }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.post('/feedback', async (req, reply) => {
  try {
    const user = await auth(req)
    const body = req.body as { mood: string; note?: string }
    const created = await prisma.feedback.create({
      data: { userId: user.id, mood: body.mood, note: body.note || '' },
    })
    return { feedback: created }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.get('/contractors', async (req, reply) => {
  try {
    const user = await auth(req)
    const list = await prisma.contractor.findMany({
      where: ownerScope(user),
      orderBy: { createdAt: 'desc' },
    })
    return { contractors: list }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.post('/contractors', async (req, reply) => {
  try {
    const user = await auth(req)
    const body = req.body as { name: string; company?: string; email?: string; phone?: string; trade?: string }
    const created = await prisma.contractor.create({
      data: {
        ownerId: user.id,
        name: body.name,
        company: body.company || '',
        email: body.email || '',
        phone: body.phone || '',
        trade: body.trade || '',
      },
    })
    return { contractor: created }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.get('/tenants', async (req, reply) => {
  try {
    const user = await auth(req)
    const list = await prisma.tenant.findMany({
      where: ownerScope(user),
      include: { property: true },
      orderBy: { createdAt: 'desc' },
    })
    return { tenants: list }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.post('/tenants', async (req, reply) => {
  try {
    const user = await auth(req)
    const body = req.body as { name: string; email?: string; phone?: string; propertyId?: string }
    const created = await prisma.tenant.create({
      data: {
        ownerId: user.id,
        name: body.name,
        email: body.email || '',
        phone: body.phone || '',
        propertyId: body.propertyId,
      },
    })
    return { tenant: created }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.get('/inventory', async (req, reply) => {
  try {
    const user = await auth(req)
    const list = await prisma.inventoryItem.findMany({
      where: ownerScope(user),
      include: { property: true },
      orderBy: { createdAt: 'desc' },
    })
    return { inventory: list }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.post('/inventory', async (req, reply) => {
  try {
    const user = await auth(req)
    const body = req.body as { name: string; category?: string; propertyId?: string }
    const created = await prisma.inventoryItem.create({
      data: {
        ownerId: user.id,
        name: body.name,
        category: body.category || '',
        propertyId: body.propertyId,
      },
    })
    return { item: created }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.get('/accounts/users', async (req, reply) => {
  try {
    const user = await auth(req)
    const list = await prisma.accountUser.findMany({
      where: user.role === 'admin' ? {} : { ownerId: user.id },
      orderBy: { createdAt: 'desc' },
    })
    return { users: list }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.post('/accounts/users', async (req, reply) => {
  try {
    const user = await auth(req)
    const body = req.body as { name: string; email?: string; roleName?: string }
    const created = await prisma.accountUser.create({
      data: {
        ownerId: user.id,
        name: body.name,
        email: body.email || '',
        roleName: body.roleName || 'Manager',
      },
    })
    return { user: created }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.get('/quotes', async (req, reply) => {
  try {
    const user = await auth(req)
    const list = await prisma.quote.findMany({
      where: ownerScope(user),
      include: { lines: true },
      orderBy: { createdAt: 'desc' },
    })
    return { quotes: list.map((q) => ({ ...q, date: formatDate(q.createdAt) })) }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.post('/quotes', async (req, reply) => {
  try {
    const user = await auth(req)
    const body = req.body as {
      name: string
      companyName?: string
      companyEmail?: string
      clientName?: string
      clientEmail?: string
      notes?: string
      color?: string
      discount?: number
      vat?: number
      lines?: { description: string; quantity: number; unitPrice: number }[]
    }
    const lines = body.lines?.length
      ? body.lines
      : [{ description: 'Service', quantity: 1, unitPrice: 0 }]
    const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)
    const discount = body.discount ?? 0
    const vat = body.vat ?? 0
    const created = await prisma.quote.create({
      data: {
        ownerId: user.id,
        name: body.name,
        status: 'Pending',
        companyName: body.companyName || '',
        companyEmail: body.companyEmail || '',
        clientName: body.clientName || '',
        clientEmail: body.clientEmail || '',
        notes: body.notes || '',
        color: body.color || '#0076b7',
        subtotal,
        discount,
        vat,
        total: Math.max(0, subtotal - discount + vat),
        lines: { create: lines },
      },
      include: { lines: true },
    })
    return { quote: created }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.get('/quotes/:id', async (req, reply) => {
  try {
    const user = await auth(req)
    const { id } = req.params as { id: string }
    const quote = await prisma.quote.findFirst({
      where: { id, ...ownerScope(user) },
      include: { lines: true },
    })
    if (!quote) return reply.code(404).send({ error: 'Not found' })
    return { quote: { ...quote, date: formatDate(quote.createdAt) } }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.post('/quotes/:id/send', async (req, reply) => {
  try {
    await auth(req)
    const { id } = req.params as { id: string }
    const quote = await prisma.quote.update({
      where: { id },
      data: { status: 'Sent' },
      include: { lines: true },
    })
    return { quote }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.post('/quotes/:id/invoice', async (req, reply) => {
  try {
    const user = await auth(req)
    const { id } = req.params as { id: string }
    const quote = await prisma.quote.findUnique({ where: { id }, include: { lines: true } })
    if (!quote) return reply.code(404).send({ error: 'Not found' })
    const count = await prisma.invoice.count()
    const invoice = await prisma.invoice.create({
      data: {
        ownerId: user.id,
        quoteId: quote.id,
        name: `INV-${1000 + count + 1}`,
        status: 'Sent',
        companyName: quote.companyName,
        clientName: quote.clientName,
        notes: quote.notes,
        total: quote.total,
        lines: {
          create: quote.lines.map((line) => ({
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
          })),
        },
      },
      include: { lines: true },
    })
    await prisma.quote.update({ where: { id }, data: { status: 'Paid' } })
    return { invoice }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.get('/invoices', async (req, reply) => {
  try {
    const user = await auth(req)
    const list = await prisma.invoice.findMany({
      where: ownerScope(user),
      include: { lines: true },
      orderBy: { createdAt: 'desc' },
    })
    return { invoices: list.map((i) => ({ ...i, date: formatDate(i.createdAt) })) }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.post('/invoices', async (req, reply) => {
  try {
    const user = await auth(req)
    const body = req.body as {
      name: string
      clientName?: string
      companyName?: string
      notes?: string
      lines?: { description: string; quantity: number; unitPrice: number }[]
    }
    const lines = body.lines?.length
      ? body.lines
      : [{ description: 'Service', quantity: 1, unitPrice: 0 }]
    const total = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)
    const count = await prisma.invoice.count()
    const created = await prisma.invoice.create({
      data: {
        ownerId: user.id,
        name: body.name || `INV-${1000 + count + 1}`,
        status: 'Pending',
        clientName: body.clientName || '',
        companyName: body.companyName || '',
        notes: body.notes || '',
        total,
        lines: { create: lines },
      },
      include: { lines: true },
    })
    return { invoice: created }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.get('/invoices/:id', async (req, reply) => {
  try {
    const user = await auth(req)
    const { id } = req.params as { id: string }
    const invoice = await prisma.invoice.findFirst({
      where: { id, ...ownerScope(user) },
      include: { lines: true },
    })
    if (!invoice) return reply.code(404).send({ error: 'Not found' })
    return { invoice: { ...invoice, date: formatDate(invoice.createdAt) } }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.get('/contacts', async (req, reply) => {
  try {
    const user = await auth(req)
    const list = await prisma.contact.findMany({
      where: ownerScope(user),
      orderBy: { createdAt: 'desc' },
    })
    return { contacts: list }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.post('/contacts', async (req, reply) => {
  try {
    const user = await auth(req)
    const body = req.body as { name: string; email?: string; phone?: string; company?: string }
    const created = await prisma.contact.create({
      data: {
        ownerId: user.id,
        name: body.name,
        email: body.email || '',
        phone: body.phone || '',
        company: body.company || '',
      },
    })
    return { contact: created }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.get('/dashboard', async (req, reply) => {
  try {
    const user = await auth(req)
    const where = await requestScope(user)
    const requests = await prisma.serviceRequest.findMany({ where })
    const properties = await prisma.property.findMany({ where })
    const tenants = await prisma.tenant.findMany({ where })
    const byStatus = {
      Open: requests.filter((r) => r.status === 'Open').length,
      Quoted: requests.filter((r) => r.status === 'Quoted').length,
      Accepted: requests.filter((r) => r.status === 'Accepted').length,
      Completed: requests.filter((r) => r.status === 'Completed').length,
    }
    const costing = Object.entries(
      requests.reduce<Record<string, number>>((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + (r.quoteAmount || 0)
        return acc
      }, {}),
    ).map(([name, amount]) => ({ name, amount }))
    return {
      totalRequests: requests.length,
      byStatus,
      properties: properties.length,
      tenants: tenants.length,
      costing,
      avgCost: requests.length
        ? Math.round(requests.reduce((s, r) => s + (r.quoteAmount || 0), 0) / requests.length)
        : 0,
      resolution: '2 days, 14 hrs, 23 mins',
    }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.get('/admin/stats', async (req, reply) => {
  try {
    const user = await auth(req)
    if (user.role !== 'admin') return reply.code(403).send({ error: 'Forbidden' })
    const [users, requests, properties, plans] = await Promise.all([
      prisma.user.findMany(),
      prisma.serviceRequest.findMany(),
      prisma.property.findMany(),
      prisma.subscriptionPlan.findMany(),
    ])
    const byRole = {
      Admins: users.filter((u) => u.role === 'admin').length,
      Managers: users.filter((u) => u.role === 'owner_pro').length,
      Agents: users.filter((u) => u.role === 'invoicing' || u.role === 'contractor').length,
    }
    return {
      users: users.length,
      byRole,
      requests: requests.length,
      properties: properties.length,
      plans,
    }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.get('/admin/activity', async (req, reply) => {
  try {
    const user = await auth(req)
    if (user.role !== 'admin' && user.role !== 'owner_pro') {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const list = await prisma.activityEvent.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return {
      events: list.map((e) => ({
        id: e.id,
        message: e.message,
        author: `${e.user.firstName} ${e.user.lastName}`,
        date: formatCreated(e.createdAt),
      })),
    }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.get('/admin/categories', async (req, reply) => {
  try {
    await auth(req)
    return { categories: await prisma.serviceCategory.findMany() }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.post('/admin/categories', async (req, reply) => {
  try {
    const user = await auth(req)
    if (user.role !== 'admin') return reply.code(403).send({ error: 'Forbidden' })
    const body = req.body as { name: string }
    const created = await prisma.serviceCategory.create({ data: { name: body.name } })
    return { category: created }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.get('/admin/subscriptions', async (req, reply) => {
  try {
    await auth(req)
    return { plans: await prisma.subscriptionPlan.findMany() }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.get('/admin/blogs', async (req, reply) => {
  try {
    await auth(req)
    const list = await prisma.blogPost.findMany({
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    })
    return {
      blogs: list.map((b) => ({
        id: b.id,
        title: b.title,
        body: b.body,
        author: `${b.author.firstName} ${b.author.lastName}`,
        date: formatDate(b.createdAt),
      })),
    }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.post('/admin/blogs', async (req, reply) => {
  try {
    const user = await auth(req)
    if (user.role !== 'admin') return reply.code(403).send({ error: 'Forbidden' })
    const body = req.body as { title: string; body: string }
    const created = await prisma.blogPost.create({
      data: { authorId: user.id, title: body.title, body: body.body },
    })
    return { blog: created }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.get('/reports', async (req, reply) => {
  try {
    const user = await auth(req)
    const requests = await prisma.serviceRequest.findMany({
      where: user.role === 'admin' ? {} : { ownerId: user.id },
    })
    return {
      reports: [
        { id: 'sr', name: 'Service request summary', rows: requests.length },
        { id: 'cost', name: 'Maintenance costing', rows: requests.filter((r) => r.quoteAmount).length },
      ],
    }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

const port = Number(process.env.PORT || 3001)
await app.listen({ port, host: '0.0.0.0' })
console.log(`Rendoor API on http://localhost:${port}`)
