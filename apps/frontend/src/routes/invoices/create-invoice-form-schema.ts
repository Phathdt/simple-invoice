import { z } from 'zod'

const itemSchema = z.object({
  name: z.string().min(1, 'Required'),
  quantity: z.number().int().positive('Must be > 0'),
  rate: z.number().positive('Must be > 0'),
})

export const createInvoiceSchema = z
  .object({
    invoiceNumber: z.string().min(1, 'Required'),
    invoiceReference: z.string().optional(),
    invoiceDate: z.string().min(1, 'Required'),
    dueDate: z.string().min(1, 'Required'),
    currency: z.string().min(1, 'Required'),
    currencySymbol: z.string().min(1, 'Required'),
    description: z.string().optional(),
    customerName: z.string().min(1, 'Required'),
    customerEmail: z.email('Invalid email'),
    customerMobile: z.string().optional(),
    customerAddress: z.string().optional(),
    items: z.array(itemSchema).min(1, 'At least one item required'),
    tax: z.number().min(0).optional(),
    discount: z.number().min(0).optional(),
  })
  .refine((d) => !d.invoiceDate || !d.dueDate || d.dueDate >= d.invoiceDate, {
    message: 'Due date must be on or after invoice date',
    path: ['dueDate'],
  })

export type CreateInvoiceForm = z.infer<typeof createInvoiceSchema>
