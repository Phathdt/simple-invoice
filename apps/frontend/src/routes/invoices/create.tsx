import { createRoute, lazyRouteComponent, redirect } from '@tanstack/react-router'

import { isAuthenticated } from '@/lib/auth'

import { Route as rootRoute } from '../__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invoices/create',
  beforeLoad: () => {
    if (!isAuthenticated()) throw redirect({ to: '/login' })
  },
  component: lazyRouteComponent(() => import('@/features/invoice/create-invoice-page'), 'CreateInvoicePage'),
})
