import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const invoiceSortFields = ['invoiceDate', 'dueDate', 'totalAmount', 'createdAt'] as const

export const listInvoicesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(invoiceSortFields).default('createdAt'),
  ordering: z.enum(['ASC', 'DESC']).default('DESC'),
  status: z.string().optional(),
  keyword: z.string().optional(),
  fromDate: z.iso.date().optional(),
  toDate: z.iso.date().optional(),
})

export class ListInvoicesQuery extends createZodDto(listInvoicesSchema) {}
