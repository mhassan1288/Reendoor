import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  await prisma.comment.deleteMany()
  await prisma.activityEvent.deleteMany()
  await prisma.requestImage.deleteMany()
  await prisma.quoteLine.deleteMany()
  await prisma.invoiceLine.deleteMany()
  await prisma.quote.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.propertySpace.deleteMany()
  await prisma.inventoryItem.deleteMany()
  await prisma.tenant.deleteMany()
  await prisma.contractor.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.serviceRequest.deleteMany()
  await prisma.property.deleteMany()
  await prisma.feedback.deleteMany()
  await prisma.blogPost.deleteMany()
  await prisma.accountUser.deleteMany()
  await prisma.serviceCategory.deleteMany()
  await prisma.subscriptionPlan.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash('password', 10)

  const oliver = await prisma.user.create({
    data: {
      email: 'oliver@rendoor.com',
      passwordHash,
      role: 'owner_free',
      firstName: 'Oliver',
      lastName: 'Smith',
      phone: '+44 20 7123 4567',
    },
  })

  const pro = await prisma.user.create({
    data: {
      email: 'pro@rendoor.com',
      passwordHash,
      role: 'owner_pro',
      firstName: 'Bilal',
      lastName: 'Quraishi',
      phone: '+44 20 7000 1111',
      companyName: 'Quraishi Estates',
    },
  })

  const tenantUser = await prisma.user.create({
    data: {
      email: 'tenant@rendoor.com',
      passwordHash,
      role: 'tenant',
      firstName: 'Emma',
      lastName: 'Wright',
      phone: '+44 20 7000 2222',
    },
  })

  const invoicing = await prisma.user.create({
    data: {
      email: 'contractor@rendoor.com',
      passwordHash,
      role: 'invoicing',
      firstName: 'Khaibar',
      lastName: 'Lalaj',
      phone: '+44 20 7000 3333',
      companyName: 'Lalaj Services',
    },
  })

  const admin = await prisma.user.create({
    data: {
      email: 'admin@rendoor.com',
      passwordHash,
      role: 'admin',
      firstName: 'Aisha',
      lastName: 'Khan',
      phone: '+44 20 7000 4444',
    },
  })

  const oliverHome = await prisma.property.create({
    data: {
      ownerId: oliver.id,
      type: 'My property',
      address: '1 Broadway Hemel Hempstead HP25 8BL',
      postTown: 'LONDON',
      postCode: 'SE',
      spaces: {
        create: [
          { name: 'Kitchen', note: 'Ground floor' },
          { name: 'Bathroom', note: 'First floor' },
        ],
      },
    },
  })

  const proHome = await prisma.property.create({
    data: {
      ownerId: pro.id,
      type: 'My property',
      address: 'Hampstead High Stree, London, NW3, London, United Kingdom',
      postTown: 'LONDON',
      postCode: 'SE',
      spaces: {
        create: [
          { name: 'Lounging Area', note: 'Farmer Meeting' },
          { name: 'Bedroom 1', note: 'Farmer Meeting' },
          { name: 'Guestroom', note: 'Farmer Meeting' },
          { name: 'Bathroom', note: 'Farmer Meeting' },
        ],
      },
    },
  })

  const dec = new Date('2025-12-14T10:33:00')

  const sr1 = await prisma.serviceRequest.create({
    data: {
      code: 'SR-210411',
      ownerId: oliver.id,
      propertyId: oliverHome.id,
      title: 'Kitchen Pipe Broke',
      type: 'Plumbing',
      description:
        'Need help with my kitchen sink. The pipes underneath have a leakage, my house is about to drown.',
      address: '1 Broadway Hemel Hempstead HP25 8BL ...',
      postTown: 'LONDON',
      postCode: 'SE',
      status: 'Open',
      priority: 'High',
      createdAt: dec,
    },
  })

  const sr2 = await prisma.serviceRequest.create({
    data: {
      code: 'SR-212415',
      ownerId: oliver.id,
      propertyId: oliverHome.id,
      title: 'Fuze box blew up',
      type: 'Electrical',
      description: 'The fuse box sparked and the lights went out on the first floor.',
      address: '953 New Street Birmingham B33 1NX',
      postTown: 'BIRMINGHAM',
      postCode: 'B33',
      status: 'Quoted',
      priority: 'Medium',
      quoteAmount: 200,
      createdAt: dec,
    },
  })

  await prisma.serviceRequest.create({
    data: {
      code: 'SR-210418',
      ownerId: oliver.id,
      title: 'Rain leaking from rooftop',
      type: 'Roofing',
      description: 'Water is coming through the ceiling after last night’s rain.',
      address: '953 New Street Birmingham B33 1NX',
      postTown: 'BIRMINGHAM',
      postCode: 'B33',
      status: 'Accepted',
      priority: 'Medium',
      quoteAmount: 450,
      quoteAccepted: true,
      createdAt: dec,
    },
  })

  await prisma.serviceRequest.create({
    data: {
      code: 'SR-210420',
      ownerId: oliver.id,
      title: 'Chipped paint needs painting',
      type: 'Painting',
      description: 'Hallway walls have chipped paint and need a fresh coat.',
      address: '953 New Street Birmingham B33 1NX',
      postTown: 'BIRMINGHAM',
      postCode: 'B33',
      status: 'Completed',
      priority: 'Low',
      createdAt: new Date('2026-01-21T10:33:00'),
    },
  })

  await prisma.comment.createMany({
    data: [
      {
        requestId: sr1.id,
        userId: oliver.id,
        body: 'I had a sudden kitchen leakage, and this platform connected me with a plumber within minutes.',
        createdAt: dec,
      },
      {
        requestId: sr1.id,
        userId: invoicing.id,
        body: 'He diagnosed the issue quickly, replaced a damaged pipe, and made sure everything was sealed perfectly.',
        createdAt: dec,
      },
    ],
  })

  await prisma.activityEvent.createMany({
    data: [
      {
        requestId: sr1.id,
        userId: oliver.id,
        message: 'Changed service request name from Kitchen leakage to Kitchen Pipe Broke',
        createdAt: new Date('2025-12-24T11:30:00'),
      },
      {
        requestId: sr1.id,
        userId: invoicing.id,
        message: 'Added image to the service request',
        createdAt: new Date('2025-12-24T11:45:00'),
      },
      {
        requestId: sr2.id,
        userId: invoicing.id,
        message: 'Sent a quotation of $200',
        createdAt: dec,
      },
    ],
  })

  await prisma.serviceRequest.create({
    data: {
      code: 'SR-310101',
      ownerId: pro.id,
      propertyId: proHome.id,
      title: 'Bathroom flush not working',
      type: 'Plumbing',
      description: 'Need help with my kitchen sink. The pipes underneath have a leakage.',
      address: proHome.address,
      postTown: proHome.postTown,
      postCode: proHome.postCode,
      status: 'Open',
      priority: 'High',
      createdAt: dec,
    },
  })

  await prisma.contractor.createMany({
    data: [
      {
        ownerId: pro.id,
        name: 'Saqlain Shoaib',
        company: 'Shoaib Plumbing',
        email: 'saqlain@example.com',
        phone: '+44 7700 900111',
        trade: 'Plumbing',
        active: true,
      },
      {
        ownerId: pro.id,
        name: 'Haseeb Abbasi',
        company: 'Abbasi Electricals',
        email: 'haseeb@example.com',
        phone: '+44 7700 900222',
        trade: 'Electrical',
        active: true,
      },
    ],
  })

  await prisma.tenant.create({
    data: {
      ownerId: pro.id,
      propertyId: proHome.id,
      name: 'Emma Wright',
      email: tenantUser.email,
      phone: tenantUser.phone,
      active: true,
    },
  })

  await prisma.serviceRequest.create({
    data: {
      code: 'SR-410201',
      ownerId: tenantUser.id,
      propertyId: proHome.id,
      title: 'Heating not coming on',
      type: 'Heating',
      description: 'The radiators on the first floor stay cold even with the thermostat up.',
      address: proHome.address,
      postTown: proHome.postTown,
      postCode: proHome.postCode,
      status: 'Open',
      priority: 'High',
      createdAt: dec,
    },
  })

  await prisma.contractor.createMany({
    data: [
      {
        ownerId: invoicing.id,
        name: 'Rashid Khan',
        company: 'Khan Joinery',
        email: 'rashid@example.com',
        phone: '+44 7700 900333',
        trade: 'Carpentry',
        active: true,
      },
      {
        ownerId: invoicing.id,
        name: 'Laura Chen',
        company: 'Chen Painting',
        email: 'laura@example.com',
        phone: '+44 7700 900444',
        trade: 'Painting',
        active: true,
      },
    ],
  })

  await prisma.inventoryItem.createMany({
    data: [
      { ownerId: pro.id, propertyId: proHome.id, name: 'Boiler', category: 'Heating' },
      { ownerId: pro.id, propertyId: proHome.id, name: 'Smoke alarm', category: 'Safety' },
    ],
  })

  await prisma.accountUser.createMany({
    data: [
      { ownerId: pro.id, name: 'Bilal Quraishi', email: pro.email, roleName: 'Admin' },
      { ownerId: pro.id, name: 'Maya Ali', email: 'maya@quraishi.com', roleName: 'Manager' },
      { ownerId: invoicing.id, name: 'Khaibar Lalaj', email: invoicing.email, roleName: 'Admin' },
      { ownerId: admin.id, name: 'Aisha Khan', email: admin.email, roleName: 'Admin' },
      { ownerId: admin.id, name: 'Omar Reid', email: 'omar@rendoor.com', roleName: 'Manager' },
    ],
  })

  const quote = await prisma.quote.create({
    data: {
      ownerId: invoicing.id,
      name: 'December Quote',
      status: 'Pending',
      companyName: 'Lalaj Services',
      companyEmail: invoicing.email,
      clientName: 'Oliver Smith',
      clientEmail: oliver.email,
      notes: 'Includes call-out and parts.',
      subtotal: 180,
      vat: 20,
      total: 200,
      createdAt: dec,
      lines: {
        create: [{ description: 'Fuse box repair', quantity: 1, unitPrice: 180 }],
      },
    },
  })

  await prisma.quote.create({
    data: {
      ownerId: invoicing.id,
      name: 'Testing Quote',
      status: 'Paid',
      companyName: 'Lalaj Services',
      clientName: 'Bilal Quraishi',
      subtotal: 400,
      vat: 50,
      total: 450,
      createdAt: dec,
      lines: {
        create: [{ description: 'Roof patch', quantity: 1, unitPrice: 400 }],
      },
    },
  })

  await prisma.invoice.create({
    data: {
      ownerId: invoicing.id,
      quoteId: quote.id,
      name: 'INV-1001',
      status: 'Sent',
      companyName: 'Lalaj Services',
      clientName: 'Oliver Smith',
      total: 200,
      createdAt: dec,
      lines: {
        create: [{ description: 'Fuse box repair', quantity: 1, unitPrice: 200 }],
      },
    },
  })

  await prisma.invoice.create({
    data: {
      ownerId: invoicing.id,
      name: 'INV-1002',
      status: 'Paid',
      companyName: 'Lalaj Services',
      clientName: 'Bilal Quraishi',
      total: 450,
      createdAt: dec,
      lines: {
        create: [{ description: 'Roof patch', quantity: 1, unitPrice: 450 }],
      },
    },
  })

  await prisma.contact.createMany({
    data: [
      {
        ownerId: invoicing.id,
        name: 'Oliver Smith',
        email: oliver.email,
        phone: oliver.phone,
        company: 'Private owner',
      },
      {
        ownerId: invoicing.id,
        name: 'Bilal Quraishi',
        email: pro.email,
        phone: pro.phone,
        company: 'Quraishi Estates',
      },
    ],
  })

  await prisma.serviceCategory.createMany({
    data: [
      { name: 'Plumbing', active: true },
      { name: 'Electrical', active: true },
      { name: 'Roofing', active: true },
      { name: 'Painting', active: true },
      { name: 'Carpentry', active: true },
    ],
  })

  await prisma.subscriptionPlan.createMany({
    data: [
      { name: 'Property management free', count: 400 },
      { name: 'Property management pro', count: 400 },
      { name: 'Invoicing pro', count: 200 },
    ],
  })

  await prisma.blogPost.create({
    data: {
      authorId: admin.id,
      title: 'Winter maintenance checklist',
      body: 'Bleed radiators, service the boiler, and check loft insulation before the cold snap.',
    },
  })

  await prisma.activityEvent.create({
    data: {
      userId: admin.id,
      message: 'Published blog: Winter maintenance checklist',
    },
  })

  console.log('Seeded Rendoor demo users:')
  console.log('  oliver@rendoor.com / password  (owner free)')
  console.log('  pro@rendoor.com / password     (owner pro)')
  console.log('  tenant@rendoor.com / password  (tenant)')
  console.log('  contractor@rendoor.com / password (invoicing)')
  console.log('  admin@rendoor.com / password   (admin)')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err)
    await prisma.$disconnect()
    process.exit(1)
  })
