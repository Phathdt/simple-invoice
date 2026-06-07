import { createRoute, lazyRouteComponent, redirect } from '@tanstack/react-router'

import { isAuthenticated } from '@/lib/auth'

import { Route as rootRoute } from './__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: () => {
    if (isAuthenticated()) throw redirect({ to: '/' })
  },
  component: lazyRouteComponent(() => import('@/features/auth/login-page'), 'LoginPage'),
})
