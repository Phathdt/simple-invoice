import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'

import { hash } from 'bcryptjs'

import { PrismaClient } from './generated/client'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

async function main() {
  await prisma.user.deleteMany()

  const passwordHash = await hash('password123', 10)

  const users = await Promise.all(
    ['alice', 'bob', 'carol', 'dave', 'eve'].map((name, i) =>
      prisma.user.create({
        data: {
          fullName: name,
          email: `${name}@simple-invoice.dev`,
          passwordHash,
          createdAt: new Date(Date.now() - i * 86400_000),
        },
      }),
    ),
  )

  console.log(`Seeded: ${users.length} users`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
