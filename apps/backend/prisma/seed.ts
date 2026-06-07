import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'
import { faker } from '@faker-js/faker'
import { hash } from 'bcryptjs'

import { PrismaClient } from '../src/generated/prisma/client'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

// Persisted statuses only — Overdue is derived at read-time, never seeded.
const STATUSES = ['Draft', 'Pending', 'Paid'] as const

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

async function main() {
  await prisma.invoiceItem.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await hash('password123', 10)

  const users = await Promise.all(
    ['alice', 'bob', 'carol', 'dave', 'eve'].map((name, i) =>
      prisma.user.create({
        data: {
          fullName: name,
          email: `${name}@simple-invoice.dev`,
          passwordHash,
          createdAt: new Date(Date.now() - i * 86_400_000),
        },
      }),
    ),
  )

  const dayMs = 86_400_000
  let createdCount = 0

  for (let i = 0; i < 40; i++) {
    faker.seed(i)

    const creator = users[i % users.length]

    // Item details
    const itemCount = faker.number.int({ min: 1, max: 4 })
    const items = Array.from({ length: itemCount }, () => ({
      name: faker.commerce.productName(),
      quantity: faker.number.int({ min: 1, max: 10 }),
      rate: round2(faker.number.float({ min: 10, max: 5000, fractionDigits: 2 })),
    }))

    const invoiceSubTotal = round2(items.reduce((sum, it) => sum + it.quantity * it.rate, 0))
    const tax = faker.helpers.arrayElement([0, 5, 8, 10])
    const discountPct = faker.helpers.arrayElement([0, 0, 0, 5, 10])
    const totalTax = round2(invoiceSubTotal * (tax / 100))
    const totalDiscount = round2(invoiceSubTotal * (discountPct / 100))
    const totalAmount = round2(invoiceSubTotal + totalTax - totalDiscount)

    // Dates: spread across past ~6 months
    const invoiceDate = faker.date.recent({ days: 180 })
    // ~1 in 6 invoices go past-due (unsettled) → reads as Overdue
    const pastDue = i % 6 === 0
    const dueDate = pastDue
      ? new Date(Date.now() - faker.number.int({ min: 1, max: 30 }) * dayMs)
      : new Date(invoiceDate.getTime() + faker.number.int({ min: 14, max: 60 }) * dayMs)

    // Past-due stay Draft/Pending so Overdue derivation fires at read-time.
    const status = pastDue
      ? faker.helpers.arrayElement(['Draft', 'Pending'] as const)
      : faker.helpers.arrayElement(STATUSES)

    const totalPaid = status === 'Paid' ? totalAmount : 0
    const balanceAmount = round2(totalAmount - totalPaid)

    await prisma.invoice.create({
      data: {
        invoiceNumber: `IV-${faker.string.alphanumeric({ length: 8, casing: 'upper' })}`,
        invoiceReference: faker.datatype.boolean(0.4) ? `REF-${faker.string.alphanumeric({ length: 6, casing: 'upper' })}` : null,
        invoiceDate,
        dueDate,
        currency: 'USD',
        currencySymbol: '$',
        description: faker.datatype.boolean(0.6) ? faker.commerce.productDescription() : null,
        status,
        customerName: faker.person.fullName(),
        customerEmail: faker.internet.email(),
        customerMobile: faker.datatype.boolean(0.7) ? faker.phone.number() : null,
        customerAddress: faker.datatype.boolean(0.7) ? faker.location.streetAddress({ useFullAddress: true }) : null,
        taxRate: tax,
        invoiceSubTotal,
        totalTax,
        totalDiscount,
        totalAmount,
        totalPaid,
        balanceAmount,
        createdBy: creator.id,
        items: { create: items },
      },
    })
    createdCount++
  }

  console.log(`Seeded: ${users.length} users, ${createdCount} invoices`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
