import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const password = process.env.ADMIN_PASSWORD || 'password'

try {
  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.user.upsert({
    where: { email: 'admin@rendoor.com' },
    update: { passwordHash, role: 'admin' },
    create: {
      email: 'admin@rendoor.com',
      passwordHash,
      role: 'admin',
      firstName: 'Aisha',
      lastName: 'Khan',
      phone: '+44 20 7000 4444',
    },
  })
  console.log('Admin account is ready')
} finally {
  await prisma.$disconnect()
}
