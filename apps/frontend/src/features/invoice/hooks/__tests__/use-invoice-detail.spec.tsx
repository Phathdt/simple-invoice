import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'inv-1' }),
}))

let lastId: string | undefined
const mockUseFindById = vi.fn()
vi.mock('@/api/generated/invoices/invoices', () => ({
  useInvoiceControllerFindById: (id: string) => {
    lastId = id
    return mockUseFindById()
  },
}))

import { useInvoiceDetail } from '../use-invoice-detail'

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useInvoiceDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    lastId = undefined
    mockUseFindById.mockReturnValue({
      data: { data: { invoiceId: 'inv-1', currencySymbol: '$' } },
      isLoading: false,
      isError: false,
    })
  })

  it('passes the route param id to the query hook', () => {
    renderHook(() => useInvoiceDetail(), { wrapper })
    expect(lastId).toBe('inv-1')
  })

  it('formats money using the invoice currency symbol', () => {
    const { result } = renderHook(() => useInvoiceDetail(), { wrapper })
    expect(result.current.money(1234.5)).toBe('$1,234.50')
  })

  it('falls back to empty symbol when invoice is absent', () => {
    mockUseFindById.mockReturnValue({ data: undefined, isLoading: false, isError: true })
    const { result } = renderHook(() => useInvoiceDetail(), { wrapper })
    expect(result.current.money(10)).toBe('10.00')
    expect(result.current.isError).toBe(true)
  })

  it('goToList navigates to the invoice list', () => {
    const { result } = renderHook(() => useInvoiceDetail(), { wrapper })
    act(() => result.current.goToList())
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
  })
})
