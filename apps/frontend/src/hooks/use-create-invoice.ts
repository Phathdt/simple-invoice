import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useInvoiceControllerCreate } from '@/api/generated/invoices/invoices'

import { type CreateInvoiceForm, createInvoiceSchema } from '@/routes/invoices/create-invoice-form-schema'

const REDIRECT_DELAY_MS = 700

function serverErrorMessage(error: unknown): string {
  return (
    (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create invoice'
  )
}

export function useCreateInvoice() {
  const navigate = useNavigate()
  const create = useInvoiceControllerCreate()
  const [created, setCreated] = useState(false)

  const form = useForm<CreateInvoiceForm>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: { items: [{ name: '', quantity: 1, rate: 0 }], tax: 10, discount: 0 },
  })

  const goToList = () => navigate({ to: '/' })

  const submit = form.handleSubmit((data) => {
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
          window.setTimeout(goToList, REDIRECT_DELAY_MS)
        },
      },
    )
  })

  return {
    register: form.register,
    errors: form.formState.errors,
    submit,
    goToList,
    created,
    isPending: create.isPending,
    isError: create.isError,
    errorMessage: serverErrorMessage(create.error),
  }
}
