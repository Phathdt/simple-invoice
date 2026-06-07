import type { Invoice } from '../entities/invoice.entity'
import type { InvoiceDisplayStatus, InvoiceStatus } from '../entities/invoice-status'

export interface InvoiceListFilter {
  page: number
  pageSize: number
  sortBy: string
  ordering: 'ASC' | 'DESC'
  status?: InvoiceDisplayStatus
  keyword?: string
  fromDate?: Date
  toDate?: Date
}

export interface CreateInvoiceData {
  invoiceNumber: string
  invoiceReference?: string
  invoiceDate: Date
  dueDate: Date
  currency: string
  currencySymbol: string
  description?: string
  status: InvoiceStatus

  customerName: string
  customerEmail: string
  customerMobile?: string
  customerAddress?: string

  taxRate: number
  invoiceSubTotal: number
  totalTax: number
  totalDiscount: number
  totalAmount: number
  totalPaid: number
  balanceAmount: number

  createdBy: string
  items: { name: string; quantity: number; rate: number }[]
}

export abstract class IInvoiceRepository {
  abstract findById(id: string): Promise<Invoice | null>
  abstract findMany(filter: InvoiceListFilter): Promise<{ rows: Invoice[]; total: number }>
  abstract create(data: CreateInvoiceData): Promise<Invoice>
}
