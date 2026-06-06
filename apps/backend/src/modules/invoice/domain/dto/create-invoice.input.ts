import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const itemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  rate: z.number().positive(),
})

// ISO date strings (YYYY-MM-DD). Kept as strings so the DTO renders to JSON
// Schema cleanly; the service converts to Date. Same-format ISO strings compare
// chronologically under lexicographic ordering, so the refine below is valid.
const dateSchema = z.iso.date()

export const createInvoiceSchema = z
  .object({
    invoiceNumber: z.string().min(1),
    invoiceReference: z.string().optional(),
    invoiceDate: dateSchema,
    dueDate: dateSchema,
    currency: z.string().min(1),
    currencySymbol: z.string().min(1),
    description: z.string().optional(),

    customerName: z.string().min(1),
    customerEmail: z.string().email(),
    customerMobile: z.string().optional(),
    customerAddress: z.string().optional(),

    items: z.array(itemSchema).min(1),
    tax: z.number().min(0).default(10),
    discount: z.number().min(0).default(0),
  })
  .refine((d) => d.dueDate >= d.invoiceDate, {
    message: 'dueDate must be on or after invoiceDate',
    path: ['dueDate'],
  })

export class CreateInvoiceInput extends createZodDto(createInvoiceSchema) {}
