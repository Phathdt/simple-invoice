import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CreateInvoiceInput } from '../../domain/dto/create-invoice.input'
import type { Invoice } from '../../domain/entities/invoice.entity'
import { InvoiceStatus } from '../../domain/entities/invoice-status'
import { InvoiceNotFoundError } from '../../domain/errors'
import type { CreateInvoiceData, IInvoiceRepository } from '../../domain/interfaces/invoice.repository'
import { InvoiceService } from './invoice.service'

function buildInput(overrides: Partial<CreateInvoiceInput> = {}): CreateInvoiceInput {
  return {
    invoiceNumber: 'IV-001',
    invoiceDate: '2026-01-01',
    dueDate: '2026-02-01',
    currency: 'USD',
    currencySymbol: '$',
    customerName: 'Acme',
    customerEmail: 'acme@example.com',
    items: [{ name: 'Widget', quantity: 2, rate: 100 }],
    tax: 10,
    discount: 0,
    ...overrides,
  } as CreateInvoiceInput
}

function makeRepo(): IInvoiceRepository {
  return {
    findById: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
  }
}

// Echo persisted data back as a stored entity, like the real repo would.
function persisted(data: CreateInvoiceData): Invoice {
  return {
    id: 'inv-1',
    ...data,
    invoiceReference: data.invoiceReference,
    description: data.description,
    customerMobile: data.customerMobile,
    customerAddress: data.customerAddress,
    items: data.items.map((i, idx) => ({ id: `item-${idx}`, ...i })),
    createdAt: new Date(),
  }
}

describe('InvoiceService', () => {
  let repo: IInvoiceRepository
  let service: InvoiceService

  beforeEach(() => {
    repo = makeRepo()
    service = new InvoiceService(repo)
  })

  describe('create', () => {
    it('computes totals per PRD formula', async () => {
      let captured: CreateInvoiceData | undefined
      vi.mocked(repo.create).mockImplementation(async (d) => {
        captured = d
        return persisted(d)
      })

      // subTotal = 2*100 = 200; tax 10% = 20; discount 0; total = 220; balance = 220
      const result = await service.create(buildInput(), 'user-1')

      expect(captured?.invoiceSubTotal).toBe(200)
      expect(captured?.totalTax).toBe(20)
      expect(captured?.totalDiscount).toBe(0)
      expect(captured?.totalAmount).toBe(220)
      expect(captured?.balanceAmount).toBe(220)
      expect(result.totalAmount).toBe(220)
    })

    it('applies discount after tax', async () => {
      let captured: CreateInvoiceData | undefined
      vi.mocked(repo.create).mockImplementation(async (d) => {
        captured = d
        return persisted(d)
      })

      // subTotal 200; tax 20; discount 50; total = 200+20-50 = 170
      await service.create(buildInput({ discount: 50 }), 'user-1')
      expect(captured?.totalAmount).toBe(170)
      expect(captured?.balanceAmount).toBe(170)
    })

    it('computes totals for the single assessment line item', async () => {
      let captured: CreateInvoiceData | undefined
      vi.mocked(repo.create).mockImplementation(async (d) => {
        captured = d
        return persisted(d)
      })

      await service.create(buildInput({ items: [{ name: 'A', quantity: 3, rate: 100 }], tax: 0 }), 'user-1')
      expect(captured?.invoiceSubTotal).toBe(300)
      expect(captured?.totalAmount).toBe(300)
    })

    it('always sets status=Draft and totalPaid=0, createdBy from userId', async () => {
      let captured: CreateInvoiceData | undefined
      vi.mocked(repo.create).mockImplementation(async (d) => {
        captured = d
        return persisted(d)
      })

      await service.create(buildInput(), 'user-42')
      expect(captured?.status).toBe('Draft')
      expect(captured?.totalPaid).toBe(0)
      expect(captured?.createdBy).toBe('user-42')
    })
  })

  describe('findById', () => {
    it('throws InvoiceNotFoundError when missing', async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)
      await expect(service.findById('nope')).rejects.toBeInstanceOf(InvoiceNotFoundError)
    })

    it('returns invoice when found', async () => {
      const invoice = persisted({
        ...buildInput(),
        invoiceDate: new Date('2026-01-01'),
        dueDate: new Date('2099-01-01'),
        status: InvoiceStatus.Draft,
        taxRate: 10,
        invoiceSubTotal: 200,
        totalTax: 20,
        totalDiscount: 0,
        totalAmount: 220,
        totalPaid: 0,
        balanceAmount: 220,
        createdBy: 'user-1',
      } as unknown as CreateInvoiceData)
      vi.mocked(repo.findById).mockResolvedValue(invoice)
      const result = await service.findById('inv-1')
      expect(result.id).toBe('inv-1')
    })
  })

  describe('deriveOverdue', () => {
    function invoiceWith(status: Invoice['status'], dueDate: Date): Invoice {
      return {
        id: 'x',
        invoiceNumber: 'IV',
        invoiceDate: new Date('2020-01-01'),
        dueDate,
        currency: 'USD',
        currencySymbol: '$',
        status,
        customerName: 'c',
        customerEmail: 'c@c.com',
        taxRate: 10,
        invoiceSubTotal: 100,
        totalTax: 10,
        totalDiscount: 0,
        totalAmount: 110,
        totalPaid: 0,
        balanceAmount: 110,
        createdBy: 'u',
        items: [],
        createdAt: new Date(),
      }
    }

    const past = new Date('2020-01-01')
    const future = new Date('2099-01-01')

    it('marks unsettled past-due as Overdue', async () => {
      vi.mocked(repo.findById).mockResolvedValue(invoiceWith(InvoiceStatus.Pending, past))
      const result = await service.findById('x')
      expect(result.status).toBe('Overdue')
    })

    it('does NOT mark Paid past-due as Overdue', async () => {
      vi.mocked(repo.findById).mockResolvedValue(invoiceWith(InvoiceStatus.Paid, past))
      const result = await service.findById('x')
      expect(result.status).toBe('Paid')
    })

    it('does NOT mark future-due as Overdue', async () => {
      vi.mocked(repo.findById).mockResolvedValue(invoiceWith(InvoiceStatus.Draft, future))
      const result = await service.findById('x')
      expect(result.status).toBe('Draft')
    })
  })

  describe('list', () => {
    it('returns paginated result with Overdue derived', async () => {
      vi.mocked(repo.findMany).mockResolvedValue({
        rows: [
          {
            id: 'a',
            invoiceNumber: 'IV',
            invoiceDate: new Date('2020-01-01'),
            dueDate: new Date('2020-02-01'),
            currency: 'USD',
            currencySymbol: '$',
            status: InvoiceStatus.Pending,
            customerName: 'c',
            customerEmail: 'c@c.com',
            taxRate: 10,
            invoiceSubTotal: 100,
            totalTax: 10,
            totalDiscount: 0,
            totalAmount: 110,
            totalPaid: 0,
            balanceAmount: 110,
            createdBy: 'u',
            items: [],
            createdAt: new Date(),
          },
        ],
        total: 1,
      })

      const result = await service.list({
        page: 1,
        pageSize: 10,
        sortBy: 'createdAt',
        ordering: 'DESC',
      } as never)

      expect(result.paging).toEqual({ page: 1, pageSize: 10, total: 1 })
      expect(result.data[0]?.status).toBe('Overdue')
    })
  })
})
