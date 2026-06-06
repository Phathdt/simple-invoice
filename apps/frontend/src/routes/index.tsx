import { createRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { useInvoiceControllerList } from '@/api/generated/invoices/invoices'
import type { InvoiceControllerListParams } from '@/api/generated/models'
import { isAuthenticated, removeToken } from '@/lib/auth'

import { Route as rootRoute } from './__root'

const STATUS_OPTIONS = ['', 'Draft', 'Pending', 'Paid', 'Overdue']

function statusClasses(status: string): string {
  switch (status) {
    case 'Paid':
      return 'bg-green-100 text-green-800'
    case 'Overdue':
      return 'bg-red-100 text-red-800'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function formatMoney(symbol: string, amount: number): string {
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function HomePage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [sortBy, setSortBy] = useState<NonNullable<InvoiceControllerListParams['sortBy']>>('createdAt')
  const [ordering, setOrdering] = useState<NonNullable<InvoiceControllerListParams['ordering']>>('DESC')

  const params: InvoiceControllerListParams = {
    page,
    pageSize,
    sortBy,
    ordering,
    ...(keyword ? { keyword } : {}),
    ...(status ? { status } : {}),
  }

  const { data: response, isLoading, isError } = useInvoiceControllerList(params)
  const invoices = response?.data ?? []
  const paging = response?.paging
  const totalPages = paging ? Math.max(1, Math.ceil(paging.total / paging.pageSize)) : 1

  const handleLogout = () => {
    removeToken()
    navigate({ to: '/login' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <h1 className="text-xl font-bold text-gray-900">SimpleInvoice</h1>
        <button
          onClick={handleLogout}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Log out
        </button>
      </header>

      <main className="mx-auto max-w-6xl p-4 sm:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
          <button
            onClick={() => navigate({ to: '/invoices/create' })}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create invoice
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <input
            type="text"
            placeholder="Search by invoice number or customer..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value)
              setPage(1)
            }}
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === '' ? 'All statuses' : s}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="createdAt">Created date</option>
            <option value="invoiceDate">Invoice date</option>
            <option value="dueDate">Due date</option>
            <option value="totalAmount">Total amount</option>
          </select>
          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value as typeof ordering)}
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="DESC">Descending</option>
            <option value="ASC">Ascending</option>
          </select>
        </div>

        {isLoading && <p className="py-12 text-center text-gray-500">Loading...</p>}
        {isError && <p className="py-12 text-center text-red-600">Failed to load invoices</p>}

        {!isLoading && !isError && (
          <>
            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Invoice date</th>
                    <th className="px-4 py-3">Due date</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                        No invoices found
                      </td>
                    </tr>
                  )}
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      onClick={() => navigate({ to: '/invoices/$id', params: { id: invoice.id } })}
                      className="cursor-pointer border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-3 text-gray-700">{invoice.customerName}</td>
                      <td className="px-4 py-3 text-gray-500">{invoice.invoiceDate}</td>
                      <td className="px-4 py-3 text-gray-500">{invoice.dueDate}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {formatMoney(invoice.currencySymbol, invoice.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClasses(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>{paging ? `${paging.total} invoices` : ''}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded border border-gray-300 px-3 py-1.5 disabled:opacity-40"
                >
                  Previous
                </button>
                <span>
                  Page {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded border border-gray-300 px-3 py-1.5 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
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
