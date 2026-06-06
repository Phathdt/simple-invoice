import { createRoute, redirect } from '@tanstack/react-router'

import { CreateInvoicePage } from '@/features/invoice/create-invoice-page'
import { isAuthenticated } from '@/lib/auth'

import { Route as rootRoute } from '../__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invoices/create',
  beforeLoad: () => {
    if (!isAuthenticated()) throw redirect({ to: '/login' })
  },
  component: CreateInvoicePage,
})
