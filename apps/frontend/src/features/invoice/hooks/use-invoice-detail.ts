import { useNavigate, useParams } from '@tanstack/react-router'

import { useInvoiceControllerFindById } from '@/api/generated/invoices/invoices'

export function useInvoiceDetail() {
  const navigate = useNavigate()
  const { id } = useParams({ from: '/invoices/$id' })
  const { data: response, isLoading, isError } = useInvoiceControllerFindById(id)
  const invoice = response?.data

  const money = (amount: number) =>
    `${invoice?.currencySymbol ?? ''}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  const goToList = () => navigate({ to: '/' })

  return { invoice, isLoading, isError, money, goToList }
}
