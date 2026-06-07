import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { dataResponse } from '../../../../common/dto/data-response.dto'

export const invoiceItemResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number(),
  rate: z.number(),
})

export const customerResponseSchema = z.object({
  fullname: z.string(),
  email: z.string(),
  mobileNumber: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
})

export const invoiceResponseSchema = z.object({
  invoiceId: z.string(),
  invoiceNumber: z.string(),
  invoiceReference: z.string().nullable().optional(),
  invoiceDate: z.string(),
  dueDate: z.string(),
  currency: z.string(),
  currencySymbol: z.string(),
  description: z.string().nullable().optional(),
  status: z.string(),

  customer: customerResponseSchema,

  taxRate: z.number(),
  invoiceSubTotal: z.number(),
  totalTax: z.number(),
  totalDiscount: z.number(),
  totalAmount: z.number(),
  totalPaid: z.number(),
  balanceAmount: z.number(),

  createdBy: z.string(),
  items: z.array(invoiceItemResponseSchema),
  createdAt: z.string(),
})

const pagingSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
})

// List endpoints emit { data: Invoice[], paging } directly (interceptor passes
// paginated payloads through untouched) — mirror that shape, don't double-wrap.
export const invoiceListSchema = z.object({
  data: z.array(invoiceResponseSchema),
  paging: pagingSchema,
})

export class InvoiceResponse extends createZodDto(invoiceResponseSchema) {}

export class InvoiceListDataResponse extends createZodDto(invoiceListSchema) {}

export class InvoiceDetailDataResponse extends dataResponse(invoiceResponseSchema) {}
