import { createRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { useInvoiceControllerList } from '@/api/generated/invoices/invoices'
import type { InvoiceControllerListParams } from '@/api/generated/models'
import { AppHeader } from '@/components/app-header'
import { Button, Spinner } from '@/components/button'
import { StatusBadge } from '@/components/status-badge'
import { isAuthenticated, removeToken } from '@/lib/auth'

import { Route as rootRoute } from './__root'

const STATUS_OPTIONS = ['', 'Draft', 'Pending', 'Paid', 'Overdue']

function formatMoney(symbol: string, amount: number): string {
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const selectCls =
  'rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 transition-colors duration-150 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10'

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
    <div className="min-h-dvh bg-slate-50">
      <AppHeader
        actions={
          <Button variant="secondary" onClick={handleLogout}>
            Log out
          </Button>
        }
      />

      <main className="mx-auto max-w-6xl p-4 sm:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Invoices</h2>
            <p className="mt-0.5 text-sm text-slate-500">Manage and track your invoices</p>
          </div>
          <Button onClick={() => navigate({ to: '/invoices/create' })}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create invoice
          </Button>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by invoice number or customer..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-150 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className={selectCls}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === '' ? 'All statuses' : s}
              </option>
            ))}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className={selectCls}>
            <option value="createdAt">Created date</option>
            <option value="invoiceDate">Invoice date</option>
            <option value="dueDate">Due date</option>
            <option value="totalAmount">Total amount</option>
          </select>
          <select value={ordering} onChange={(e) => setOrdering(e.target.value as typeof ordering)} className={selectCls}>
            <option value="DESC">Descending</option>
            <option value="ASC">Ascending</option>
          </select>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-20 text-slate-500">
            <Spinner className="h-6 w-6 text-blue-600" />
            <span className="text-sm">Loading...</span>
          </div>
        )}
        {isError && <p className="py-20 text-center text-sm text-red-600">Failed to load invoices</p>}

        {!isLoading && !isError && (
          <>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Invoice #</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Invoice date</th>
                    <th className="px-4 py-3 font-medium">Due date</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm">No invoices found</span>
                        </div>
                      </td>
                    </tr>
                  )}
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      onClick={() => navigate({ to: '/invoices/$id', params: { id: invoice.id } })}
                      className="cursor-pointer border-b border-slate-100 transition-colors duration-150 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-3 text-slate-700">{invoice.customerName}</td>
                      <td className="px-4 py-3 tabular-nums text-slate-500">{invoice.invoiceDate}</td>
                      <td className="px-4 py-3 tabular-nums text-slate-500">{invoice.dueDate}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-900">
                        {formatMoney(invoice.currencySymbol, invoice.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={invoice.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <span>{paging ? `${paging.total} invoices` : ''}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="tabular-nums">
                  Page {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
