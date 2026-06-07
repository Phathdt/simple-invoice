import { PrismaService } from '@modules/prisma'
import { Injectable } from '@nestjs/common'

import {
  Prisma,
  Invoice as PrismaInvoiceModel,
  InvoiceItem as PrismaInvoiceItem,
} from '../../../../generated/prisma/client'
import type { Invoice, InvoiceItem } from '../../domain/entities/invoice.entity'
import { InvoiceStatus, OVERDUE_STATUS } from '../../domain/entities/invoice-status'
import { DuplicateInvoiceNumberError } from '../../domain/errors'
import {
  IInvoiceRepository,
  type CreateInvoiceData,
  type InvoiceListFilter,
} from '../../domain/interfaces/invoice.repository'

// Prisma row shapes (Decimal-typed money) → domain entities (number money).
// The model type has no relations, so compose `items` for the include query.
type PrismaInvoice = PrismaInvoiceModel & { items: PrismaInvoiceItem[] }

function toItem(row: PrismaInvoiceItem): InvoiceItem {
  return { id: row.id, name: row.name, quantity: row.quantity, rate: row.rate.toNumber() }
}

function toEntity(row: PrismaInvoice): Invoice {
  return {
    id: row.id,
    invoiceNumber: row.invoiceNumber,
    invoiceReference: row.invoiceReference ?? undefined,
    invoiceDate: row.invoiceDate,
    dueDate: row.dueDate,
    currency: row.currency,
    currencySymbol: row.currencySymbol,
    description: row.description ?? undefined,
    status: row.status as InvoiceStatus,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    customerMobile: row.customerMobile ?? undefined,
    customerAddress: row.customerAddress ?? undefined,
    taxRate: row.taxRate.toNumber(),
    invoiceSubTotal: row.invoiceSubTotal.toNumber(),
    totalTax: row.totalTax.toNumber(),
    totalDiscount: row.totalDiscount.toNumber(),
    totalAmount: row.totalAmount.toNumber(),
    totalPaid: row.totalPaid.toNumber(),
    balanceAmount: row.balanceAmount.toNumber(),
    exchangeRate: row.exchangeRate.toNumber(),
    baseCurrency: row.baseCurrency,
    totalAmountBase: row.totalAmountBase.toNumber(),
    createdBy: row.createdBy,
    items: (row.items ?? []).map(toItem),
    createdAt: row.createdAt,
  }
}

@Injectable()
export class InvoicePrismaRepository implements IInvoiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Invoice | null> {
    const row = await this.prisma.invoice.findUnique({ where: { id }, include: { items: true } })
    return row ? toEntity(row) : null
  }

  async findMany(filter: InvoiceListFilter): Promise<{ rows: Invoice[]; total: number }> {
    const where = this.buildWhere(filter)
    // Sort "totalAmount" by the base-currency value so amounts across currencies
    // order by real worth, not raw figures. Other sort fields pass through.
    const col = filter.sortBy === 'totalAmount' ? 'totalAmountBase' : filter.sortBy
    const orderBy = { [col]: filter.ordering.toLowerCase() as 'asc' | 'desc' }
    const skip = (filter.page - 1) * filter.pageSize

    const [rows, total] = await Promise.all([
      this.prisma.invoice.findMany({ where, orderBy, skip, take: filter.pageSize, include: { items: true } }),
      this.prisma.invoice.count({ where }),
    ])

    return { rows: rows.map(toEntity), total }
  }

  async create(data: CreateInvoiceData): Promise<Invoice> {
    const { items, ...invoice } = data
    try {
      const row = await this.prisma.invoice.create({
        data: { ...invoice, items: { create: items } },
        include: { items: true },
      })
      return toEntity(row)
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new DuplicateInvoiceNumberError(data.invoiceNumber)
      }
      throw err
    }
  }

  private buildWhere(filter: InvoiceListFilter): Prisma.InvoiceWhereInput {
    const where: Prisma.InvoiceWhereInput = {}

    if (filter.keyword) {
      where.OR = [
        { invoiceNumber: { contains: filter.keyword, mode: 'insensitive' } },
        { customerName: { contains: filter.keyword, mode: 'insensitive' } },
      ]
    }

    if (filter.status === OVERDUE_STATUS) {
      // Overdue is derived, never persisted: not-yet-settled invoices past due.
      where.AND = [{ status: { in: [InvoiceStatus.Draft, InvoiceStatus.Pending] } }, { dueDate: { lt: startOfToday() } }]
    } else if (filter.status === InvoiceStatus.Draft || filter.status === InvoiceStatus.Pending) {
      where.AND = [{ status: filter.status }, { dueDate: { gte: startOfToday() } }]
    } else if (filter.status) {
      where.status = filter.status
    }

    if (filter.fromDate || filter.toDate) {
      where.invoiceDate = {}
      if (filter.fromDate) where.invoiceDate.gte = filter.fromDate
      if (filter.toDate) where.invoiceDate.lte = filter.toDate
    }

    return where
  }
}

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}
