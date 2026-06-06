import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => mockNavigate }))

const mockRemoveToken = vi.fn()
vi.mock('@/lib/auth', () => ({ removeToken: () => mockRemoveToken() }))

const mockUseList = vi.fn()
let lastParams: Record<string, unknown> | undefined
vi.mock('@/api/generated/invoices/invoices', () => ({
  useInvoiceControllerList: (params: Record<string, unknown>) => {
    lastParams = params
    return mockUseList()
  },
}))

import { useInvoiceList } from '../use-invoice-list'

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useInvoiceList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    lastParams = undefined
    mockUseList.mockReturnValue({
      data: { data: [{ id: '1' }], paging: { total: 25, page: 1, pageSize: 10 } },
      isLoading: false,
      isError: false,
    })
  })

  it('builds default query params and computes total pages', () => {
    const { result } = renderHook(() => useInvoiceList(), { wrapper })
    expect(lastParams).toMatchObject({ page: 1, pageSize: 10, sortBy: 'createdAt', ordering: 'DESC' })
    expect(result.current.totalPages).toBe(3)
    expect(result.current.invoices).toHaveLength(1)
  })

  it('omits empty optional filters from params', () => {
    renderHook(() => useInvoiceList(), { wrapper })
    expect(lastParams).not.toHaveProperty('keyword')
    expect(lastParams).not.toHaveProperty('status')
    expect(lastParams).not.toHaveProperty('fromDate')
    expect(lastParams).not.toHaveProperty('toDate')
  })

  it('includes filters once set and resets page to 1', () => {
    const { result } = renderHook(() => useInvoiceList(), { wrapper })
    act(() => result.current.nextPage())
    expect(result.current.state.page).toBe(2)
    act(() => result.current.onKeyword('acme'))
    expect(result.current.state.page).toBe(1)
    act(() => result.current.onStatus('Paid'))
    act(() => result.current.onFromDate('2026-01-01'))
    act(() => result.current.onToDate('2026-02-01'))
    expect(lastParams).toMatchObject({
      keyword: 'acme',
      status: 'Paid',
      fromDate: '2026-01-01',
      toDate: '2026-02-01',
    })
  })

  it('clamps pagination within bounds', () => {
    const { result } = renderHook(() => useInvoiceList(), { wrapper })
    act(() => result.current.prevPage())
    expect(result.current.state.page).toBe(1)
    act(() => result.current.nextPage())
    act(() => result.current.nextPage())
    act(() => result.current.nextPage())
    expect(result.current.state.page).toBe(3)
  })

  it('logout clears token and navigates to login', () => {
    const { result } = renderHook(() => useInvoiceList(), { wrapper })
    act(() => result.current.logout())
    expect(mockRemoveToken).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' })
  })

  it('navigates to detail and create', () => {
    const { result } = renderHook(() => useInvoiceList(), { wrapper })
    act(() => result.current.openInvoice('abc'))
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/invoices/$id', params: { id: 'abc' } })
    act(() => result.current.openCreate())
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/invoices/create' })
  })
})
