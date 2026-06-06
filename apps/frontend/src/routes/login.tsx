import { createRoute, redirect } from '@tanstack/react-router'

import { LoginPage } from '@/features/auth/login-page'
import { isAuthenticated } from '@/lib/auth'

import { Route as rootRoute } from './__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: () => {
    if (isAuthenticated()) throw redirect({ to: '/' })
  },
  component: LoginPage,
})
