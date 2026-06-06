import { createRoute, redirect, useNavigate } from '@tanstack/react-router'

import { useAuthControllerMe } from '@/api/generated/auth/auth'
import { isAuthenticated, removeToken } from '@/lib/auth'

import { Route as rootRoute } from './__root'

function HomePage() {
  const navigate = useNavigate()
  const { data: user, isLoading } = useAuthControllerMe()

  const handleLogout = () => {
    removeToken()
    navigate({ to: '/login' })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <h1 className="text-xl font-bold text-gray-900">SimpleInvoice</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Đăng xuất
          </button>
        </div>
      </header>
      <main className="p-8">
        <p className="text-gray-600">Danh sách hoá đơn sẽ sớm có mặt...</p>
      </main>
    </div>
  )
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    if (!isAuthenticated()) throw redirect({ to: '/login' })
  },
  component: HomePage,
})
