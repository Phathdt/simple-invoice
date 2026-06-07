import { createRoute, lazyRouteComponent, redirect } from '@tanstack/react-router'

import { isAuthenticated } from '@/lib/auth'

import { Route as rootRoute } from './__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    if (!isAuthenticated()) throw redirect({ to: '/login' })
  },
  component: lazyRouteComponent(() => import('@/features/invoice/invoice-list-page'), 'HomePage'),
})
