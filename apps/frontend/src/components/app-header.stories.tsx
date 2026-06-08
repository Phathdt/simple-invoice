import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'

import { AppHeader, BrandLogo } from '@/components/app-header'
import { Button } from '@/components/ui/button'

// AppHeader renders a TanStack Router <Link>, so stories must run inside a
// RouterProvider. A minimal in-memory router supplies that context.
function withRouter(ui: React.ReactNode) {
  const rootRoute = createRootRoute({ component: () => <Outlet /> })
  const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: () => <>{ui}</> })
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  return <RouterProvider router={router as never} />
}

const meta = {
  title: 'Components/AppHeader',
  component: AppHeader,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppHeader>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => withRouter(<AppHeader />),
}

export const WithActions: Story = {
  render: () =>
    withRouter(
      <AppHeader
        actions={
          <>
            <Button variant='ghost'>Sign out</Button>
            <Button>New invoice</Button>
          </>
        }
      />,
    ),
}

export const Logo: Story = {
  parameters: { layout: 'centered' },
  render: () => <BrandLogo />,
}

export const LogoCentered: Story = {
  parameters: { layout: 'centered' },
  render: () => <BrandLogo centered />,
}
