import { createRouter } from '@tanstack/react-router'

import { Route as rootRoute } from './routes/__root'
import { Route as indexRoute } from './routes/index'
import { Route as invoiceDetailRoute } from './routes/invoices/$id'
import { Route as invoiceCreateRoute } from './routes/invoices/create'
import { Route as loginRoute } from './routes/login'

const routeTree = rootRoute.addChildren([indexRoute, loginRoute, invoiceCreateRoute, invoiceDetailRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
