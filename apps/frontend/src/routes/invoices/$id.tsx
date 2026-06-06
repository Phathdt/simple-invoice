import { createRoute, redirect } from '@tanstack/react-router'

import { InvoiceDetailPage } from '@/features/invoice/invoice-detail-page'
import { isAuthenticated } from '@/lib/auth'

import { Route as rootRoute } from '../__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invoices/$id',
  beforeLoad: () => {
    if (!isAuthenticated()) throw redirect({ to: '/login' })
  },
  component: InvoiceDetailPage,
})
