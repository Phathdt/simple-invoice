import { zodResolver } from '@hookform/resolvers/zod'
import { createRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

import { useInvoiceControllerCreate } from '@/api/generated/invoices/invoices'
import { isAuthenticated } from '@/lib/auth'

import { Route as rootRoute } from '../__root'

const itemSchema = z.object({
  name: z.string().min(1, 'Required'),
  quantity: z.number().int().positive('Must be > 0'),
  rate: z.number().positive('Must be > 0'),
})

const createInvoiceSchema = z
  .object({
    invoiceNumber: z.string().min(1, 'Required'),
    invoiceReference: z.string().optional(),
    invoiceDate: z.string().min(1, 'Required'),
    dueDate: z.string().min(1, 'Required'),
    currency: z.string().min(1, 'Required'),
    currencySymbol: z.string().min(1, 'Required'),
    description: z.string().optional(),
    customerName: z.string().min(1, 'Required'),
    customerEmail: z.string().email('Invalid email'),
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

type CreateInvoiceForm = z.infer<typeof createInvoiceSchema>

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

const inputCls = 'w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none'

function CreateInvoicePage() {
  const navigate = useNavigate()
  const create = useInvoiceControllerCreate()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateInvoiceForm>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: { items: [{ name: '', quantity: 1, rate: 0 }], tax: 10, discount: 0 },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const onSubmit = (data: CreateInvoiceForm) => {
    create.mutate(
      {
        data: {
          invoiceNumber: data.invoiceNumber,
          invoiceReference: data.invoiceReference || undefined,
          invoiceDate: data.invoiceDate,
          dueDate: data.dueDate,
          currency: data.currency,
          currencySymbol: data.currencySymbol,
          description: data.description || undefined,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerMobile: data.customerMobile || undefined,
          customerAddress: data.customerAddress || undefined,
          items: data.items as { name: string; quantity: number; rate: number }[],
          tax: data.tax as number | undefined,
          discount: data.discount as number | undefined,
        },
      },
      { onSuccess: () => navigate({ to: '/' }) },
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <h1 className="text-xl font-bold text-gray-900">SimpleInvoice</h1>
        <button
          type="button"
          onClick={() => navigate({ to: '/' })}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
      </header>

      <main className="mx-auto max-w-3xl p-4 sm:p-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Create invoice</h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <section className="rounded-lg border bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">Invoice details</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Invoice number *" error={errors.invoiceNumber?.message}>
                <input {...register('invoiceNumber')} className={inputCls} />
              </Field>
              <Field label="Reference" error={errors.invoiceReference?.message}>
                <input {...register('invoiceReference')} className={inputCls} />
              </Field>
              <Field label="Invoice date *" error={errors.invoiceDate?.message}>
                <input type="date" {...register('invoiceDate')} className={inputCls} />
              </Field>
              <Field label="Due date *" error={errors.dueDate?.message}>
                <input type="date" {...register('dueDate')} className={inputCls} />
              </Field>
              <Field label="Currency *" error={errors.currency?.message}>
                <input {...register('currency')} placeholder="USD" className={inputCls} />
              </Field>
              <Field label="Currency symbol *" error={errors.currencySymbol?.message}>
                <input {...register('currencySymbol')} placeholder="$" className={inputCls} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Description" error={errors.description?.message}>
                  <textarea {...register('description')} rows={2} className={inputCls} />
                </Field>
              </div>
            </div>
          </section>

          <section className="rounded-lg border bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">Customer</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Name *" error={errors.customerName?.message}>
                <input {...register('customerName')} className={inputCls} />
              </Field>
              <Field label="Email *" error={errors.customerEmail?.message}>
                <input type="email" {...register('customerEmail')} className={inputCls} />
              </Field>
              <Field label="Phone" error={errors.customerMobile?.message}>
                <input {...register('customerMobile')} className={inputCls} />
              </Field>
              <Field label="Address" error={errors.customerAddress?.message}>
                <input {...register('customerAddress')} className={inputCls} />
              </Field>
            </div>
          </section>

          <section className="rounded-lg border bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase text-gray-500">Items</h3>
              <button
                type="button"
                onClick={() => append({ name: '', quantity: 1, rate: 0 })}
                className="text-sm text-blue-600 hover:underline"
              >
                + Add item
              </button>
            </div>
            {errors.items?.root && <p className="mb-2 text-xs text-red-600">{errors.items.root.message}</p>}
            <div className="space-y-3">
              {fields.map((field, i) => (
                <div key={field.id} className="flex gap-2">
                  <div className="flex-1">
                    <input
                      {...register(`items.${i}.name`)}
                      placeholder="Item name"
                      className={inputCls}
                    />
                    {errors.items?.[i]?.name && (
                      <p className="mt-1 text-xs text-red-600">{errors.items[i]?.name?.message}</p>
                    )}
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      {...register(`items.${i}.quantity`, { valueAsNumber: true })}
                      placeholder="Qty"
                      className={inputCls}
                    />
                    {errors.items?.[i]?.quantity && (
                      <p className="mt-1 text-xs text-red-600">{errors.items[i]?.quantity?.message}</p>
                    )}
                  </div>
                  <div className="w-28">
                    <input
                      type="number"
                      step="0.01"
                      {...register(`items.${i}.rate`, { valueAsNumber: true })}
                      placeholder="Rate"
                      className={inputCls}
                    />
                    {errors.items?.[i]?.rate && (
                      <p className="mt-1 text-xs text-red-600">{errors.items[i]?.rate?.message}</p>
                    )}
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">Tax & Discount</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tax (%)" error={errors.tax?.message}>
                <input type="number" step="0.01" {...register('tax', { valueAsNumber: true })} className={inputCls} />
              </Field>
              <Field label="Discount" error={errors.discount?.message}>
                <input type="number" step="0.01" {...register('discount', { valueAsNumber: true })} className={inputCls} />
              </Field>
            </div>
          </section>

          {create.isError && (
            <p className="text-sm text-red-600">
              {(create.error as unknown as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                'Failed to create invoice'}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate({ to: '/' })}
              className="rounded border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={create.isPending}
              className="rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {create.isPending ? 'Creating...' : 'Create invoice'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invoices/create',
  beforeLoad: () => {
    if (!isAuthenticated()) throw redirect({ to: '/login' })
  },
  component: CreateInvoicePage,
})
