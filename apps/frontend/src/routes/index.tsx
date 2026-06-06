import { createRoute, redirect } from '@tanstack/react-router'

import { HomePage } from '@/features/invoice/invoice-list-page'
import { isAuthenticated } from '@/lib/auth'

import { Route as rootRoute } from './__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    if (!isAuthenticated()) throw redirect({ to: '/login' })
  },
  component: HomePage,
})
