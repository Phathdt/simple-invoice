import type { Paginated } from '../../../../common/dto/paginated'
import { paginate } from '../../../../common/dto/paginated'
import type { CreateInvoiceInput } from '../../domain/dto/create-invoice.input'
import type { ListInvoicesQuery } from '../../domain/dto/list-invoices.query'
import type { Invoice } from '../../domain/entities/invoice.entity'
import { InvoiceNotFoundError } from '../../domain/errors'
import { IInvoiceRepository } from '../../domain/interfaces/invoice.repository'
import { IInvoiceService } from '../../domain/interfaces/invoice.service'

export class InvoiceService implements IInvoiceService {
  constructor(private readonly repo: IInvoiceRepository) {}

  async create(input: CreateInvoiceInput, userId: string): Promise<Invoice> {
    const invoiceSubTotal = input.items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
    const totalTax = invoiceSubTotal * (input.tax / 100)
    const totalDiscount = input.discount
    const totalAmount = invoiceSubTotal + totalTax - totalDiscount
    const totalPaid = 0
    const balanceAmount = totalAmount - totalPaid

    const created = await this.repo.create({
      invoiceNumber: input.invoiceNumber,
      invoiceReference: input.invoiceReference,
      invoiceDate: new Date(input.invoiceDate),
      dueDate: new Date(input.dueDate),
      currency: input.currency,
      currencySymbol: input.currencySymbol,
      description: input.description,
      status: 'Draft',
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerMobile: input.customerMobile,
      customerAddress: input.customerAddress,
      taxRate: input.tax,
      invoiceSubTotal,
      totalTax,
      totalDiscount,
      totalAmount,
      totalPaid,
      balanceAmount,
      createdBy: userId,
      items: input.items.map((i) => ({ name: i.name, quantity: i.quantity, rate: i.rate })),
    })

    return this.deriveOverdue(created)
  }

  async findById(id: string): Promise<Invoice> {
    const invoice = await this.repo.findById(id)
    if (!invoice) throw new InvoiceNotFoundError(id)
    return this.deriveOverdue(invoice)
  }

  async list(query: ListInvoicesQuery): Promise<Paginated<Invoice>> {
    const { rows, total } = await this.repo.findMany({
      page: query.page,
      pageSize: query.pageSize,
      sortBy: query.sortBy,
      ordering: query.ordering,
      status: query.status,
      keyword: query.keyword,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
    })
    return paginate(
      rows.map((r) => this.deriveOverdue(r)),
      query.page,
      query.pageSize,
      total,
    )
  }

  // Overdue is a read-time projection, never persisted: an unsettled invoice
  // whose due date has passed reads as Overdue.
  private deriveOverdue(invoice: Invoice): Invoice {
    if (invoice.status !== 'Paid' && new Date(invoice.dueDate) < startOfToday()) {
      return { ...invoice, status: 'Overdue' }
    }
    return invoice
  }
}

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}
