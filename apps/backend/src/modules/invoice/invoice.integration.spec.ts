import { type INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { ZodValidationPipe } from 'nestjs-zod'

import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { CommonModule } from '../../common/common.module'
import { startPostgres, stopPostgres } from '../../test-utils/setup-postgres'
import { AuthModule } from '../auth/auth.module'
import { PrismaModule } from '../prisma/prisma.module'
import { InvoiceModule } from './invoice.module'

const validInvoice = () => ({
  invoiceNumber: `IV-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
  invoiceDate: '2099-01-01',
  dueDate: '2099-02-01',
  currency: 'USD',
  currencySymbol: '$',
  customerName: 'Acme Corp',
  customerEmail: 'acme@example.com',
  items: [{ name: 'Widget', quantity: 2, rate: 100 }],
  tax: 10,
  discount: 0,
})

describe('Invoice (integration)', () => {
  let moduleRef: TestingModule
  let app: INestApplication
  let token: string

  beforeAll(async () => {
    await startPostgres()
    process.env.JWT_SECRET = 'test-secret'
    moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), CommonModule, PrismaModule, AuthModule, InvoiceModule],
    }).compile()

    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ZodValidationPipe())
    await app.init()

    const email = `inv-user-${Date.now()}@simple-invoice.test`
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ fullName: 'Inv User', email, password: 'password123' })
    token = res.body.data.token
  })

  afterAll(async () => {
    await app?.close()
    await moduleRef?.close()
    await stopPostgres()
  })

  const auth = () => ({ Authorization: `Bearer ${token}` })

  it('POST /invoices creates invoice with computed totals', async () => {
    const res = await request(app.getHttpServer()).post('/invoices').set(auth()).send(validInvoice())

    expect(res.status).toBe(201)
    expect(res.body.data.invoiceSubTotal).toBe(200)
    expect(res.body.data.totalTax).toBe(20)
    expect(res.body.data.totalAmount).toBe(220)
    expect(res.body.data.balanceAmount).toBe(220)
    expect(res.body.data.status).toBe('Draft')
    expect(res.body.data.items).toHaveLength(1)
  })

  it('POST /invoices rejects dueDate before invoiceDate with 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/invoices')
      .set(auth())
      .send({ ...validInvoice(), invoiceDate: '2026-02-01', dueDate: '2026-01-01' })

    expect(res.status).toBe(400)
    expect(Array.isArray(res.body.message)).toBe(true)
  })

  it('POST /invoices rejects duplicate invoiceNumber with 409', async () => {
    const payload = validInvoice()
    await request(app.getHttpServer()).post('/invoices').set(auth()).send(payload)
    const res = await request(app.getHttpServer()).post('/invoices').set(auth()).send(payload)
    expect(res.status).toBe(409)
  })

  it('POST /invoices rejects a currencySymbol that does not match the currency', async () => {
    const res = await request(app.getHttpServer())
      .post('/invoices')
      .set(auth())
      .send({ ...validInvoice(), currency: 'USD', currencySymbol: '₫' })
    expect(res.status).toBe(400)
  })

  it('POST /invoices requires exactly one line item', async () => {
    const res = await request(app.getHttpServer())
      .post('/invoices')
      .set(auth())
      .send({ ...validInvoice(), items: [{ name: 'A', quantity: 1, rate: 100 }, { name: 'B', quantity: 1, rate: 50 }] })
    expect(res.status).toBe(400)
  })

  it('POST /invoices without token returns 401', async () => {
    const res = await request(app.getHttpServer()).post('/invoices').send(validInvoice())
    expect(res.status).toBe(401)
  })

  it('GET /invoices returns paginated shape', async () => {
    const res = await request(app.getHttpServer()).get('/invoices').set(auth())
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.paging).toMatchObject({ page: 1, pageSize: 10 })
    expect(typeof res.body.paging.total).toBe('number')
  })

  it('GET /invoices?keyword filters by customer name', async () => {
    const payload = { ...validInvoice(), customerName: 'ZZZ Unique Customer' }
    await request(app.getHttpServer()).post('/invoices').set(auth()).send(payload)

    const res = await request(app.getHttpServer()).get('/invoices').query({ keyword: 'ZZZ Unique' }).set(auth())
    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeGreaterThan(0)
    expect(res.body.data.every((i: { customerName: string }) => i.customerName.includes('ZZZ Unique'))).toBe(true)
  })

  it('GET /invoices?status=Overdue returns only unsettled past-due invoices', async () => {
    // Past due + unsettled → should appear as Overdue.
    await request(app.getHttpServer())
      .post('/invoices')
      .set(auth())
      .send({ ...validInvoice(), invoiceDate: '2020-01-01', dueDate: '2020-02-01' })

    const res = await request(app.getHttpServer()).get('/invoices').query({ status: 'Overdue' }).set(auth())
    expect(res.status).toBe(200)
    expect(res.body.data.every((i: { status: string }) => i.status === 'Overdue')).toBe(true)
  })

  it('GET /invoices?status=Draft excludes invoices displayed as Overdue', async () => {
    await request(app.getHttpServer())
      .post('/invoices')
      .set(auth())
      .send({ ...validInvoice(), invoiceDate: '2020-01-01', dueDate: '2020-02-01' })

    const res = await request(app.getHttpServer()).get('/invoices').query({ status: 'Draft' }).set(auth())
    expect(res.status).toBe(200)
    expect(res.body.data.every((i: { status: string }) => i.status === 'Draft')).toBe(true)
  })

  it('GET /invoices/:id returns invoice with items', async () => {
    const created = await request(app.getHttpServer()).post('/invoices').set(auth()).send(validInvoice())
    const id = created.body.data.id

    const res = await request(app.getHttpServer()).get(`/invoices/${id}`).set(auth())
    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe(id)
    expect(res.body.data.items).toHaveLength(1)
  })

  it('GET /invoices/:id returns 404 for unknown id', async () => {
    const res = await request(app.getHttpServer())
      .get('/invoices/00000000-0000-0000-0000-000000000000')
      .set(auth())
    expect(res.status).toBe(404)
  })
})
