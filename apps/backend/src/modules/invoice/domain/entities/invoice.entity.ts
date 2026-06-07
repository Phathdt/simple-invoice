import type { InvoiceDisplayStatus } from './invoice-status'

export interface InvoiceItem {
  id: string
  name: string
  quantity: number
  rate: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  invoiceReference?: string
  invoiceDate: Date
  dueDate: Date
  currency: string
  currencySymbol: string
  description?: string
  status: InvoiceDisplayStatus

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

  exchangeRate: number
  baseCurrency: string
  totalAmountBase: number

  createdBy: string
  items: InvoiceItem[]

  createdAt: Date
}
