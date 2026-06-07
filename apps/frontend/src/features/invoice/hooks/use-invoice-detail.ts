import { useNavigate, useParams } from '@tanstack/react-router'

import { useInvoiceControllerFindById } from '@/api/generated/invoices/invoices'
import { formatMoney } from '@/features/invoice/currency'

export function useInvoiceDetail() {
  const navigate = useNavigate()
  const { id } = useParams({ from: '/invoices/$id' })
  const { data: response, isLoading, isError } = useInvoiceControllerFindById(id)
  const invoice = response?.data

  const money = (amount: number) => formatMoney(amount, invoice?.currency ?? '', invoice?.currencySymbol ?? '')

  const goToList = () => navigate({ to: '/' })

  return { invoice, isLoading, isError, money, goToList }
}
