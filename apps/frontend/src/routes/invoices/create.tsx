import { zodResolver } from '@hookform/resolvers/zod'
import { createRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useInvoiceControllerCreate } from '@/api/generated/invoices/invoices'
import { AppHeader } from '@/components/app-header'
import { Button, Spinner } from '@/components/button'
import { isAuthenticated } from '@/lib/auth'

import { Route as rootRoute } from '../__root'
import {
  CustomerSection,
  InvoiceDetailsSection,
  ItemSection,
  TaxDiscountSection,
} from './create-invoice-form-sections'
import { type CreateInvoiceForm, createInvoiceSchema } from './create-invoice-form-schema'

function CreateInvoicePage() {
  const navigate = useNavigate()
  const create = useInvoiceControllerCreate()
  const [created, setCreated] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateInvoiceForm>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: { items: [{ name: '', quantity: 1, rate: 0 }], tax: 10, discount: 0 },
  })

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
      {
        onSuccess: () => {
          setCreated(true)
          window.setTimeout(() => navigate({ to: '/' }), 700)
        },
      },
    )
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      <AppHeader
        actions={
          <Button type="button" variant="secondary" onClick={() => navigate({ to: '/' })}>
            Cancel
          </Button>
        }
      />

      <main className="mx-auto max-w-3xl p-4 sm:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create invoice</h2>
          <p className="mt-0.5 text-sm text-slate-500">Enter invoice, customer, and payment item details</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <InvoiceDetailsSection register={register} errors={errors} />
          <CustomerSection register={register} errors={errors} />
          <ItemSection register={register} errors={errors} />
          <TaxDiscountSection register={register} errors={errors} />

          {created && (
            <div className="rounded-lg bg-green-50 px-3.5 py-3 text-sm text-green-700" role="status">
              Invoice created successfully. Redirecting to the invoice list...
            </div>
          )}

          {create.isError && (
            <div className="rounded-lg bg-red-50 px-3.5 py-3 text-sm text-red-700">
              {(create.error as unknown as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                'Failed to create invoice'}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => navigate({ to: '/' })}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? (
                <>
                  <Spinner />
                  Creating...
                </>
              ) : (
                'Create invoice'
              )}
            </Button>
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
