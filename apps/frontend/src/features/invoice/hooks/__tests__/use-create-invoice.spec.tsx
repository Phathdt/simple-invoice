import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useCreateInvoice } from '../use-create-invoice'

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => mockNavigate }))

const mockMutate = vi.fn()
const mockUseCreate = vi.fn()
vi.mock('@/api/generated/invoices/invoices', () => ({
  useInvoiceControllerCreate: () => mockUseCreate(),
}))

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useCreateInvoice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseCreate.mockReturnValue({ mutate: mockMutate, isPending: false, isError: false, error: null })
  })

  it('derives a friendly default error message', () => {
    mockUseCreate.mockReturnValue({ mutate: mockMutate, isPending: false, isError: true, error: {} })
    const { result } = renderHook(() => useCreateInvoice(), { wrapper })
    expect(result.current.errorMessage).toBe('Failed to create invoice')
  })

  it('surfaces server error message when present', () => {
    mockUseCreate.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: true,
      error: { response: { data: { message: 'Invoice number already exists' } } },
    })
    const { result } = renderHook(() => useCreateInvoice(), { wrapper })
    expect(result.current.errorMessage).toBe('Invoice number already exists')
  })

  it('does not submit when the form is invalid', async () => {
    const { result } = renderHook(() => useCreateInvoice(), { wrapper })
    await act(async () => {
      await result.current.submit()
    })
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('reflects pending state from the mutation', () => {
    mockUseCreate.mockReturnValue({ mutate: mockMutate, isPending: true, isError: false, error: null })
    const { result } = renderHook(() => useCreateInvoice(), { wrapper })
    expect(result.current.isPending).toBe(true)
    expect(result.current.created).toBe(false)
  })

  it('goToList navigates to the invoice list', () => {
    const { result } = renderHook(() => useCreateInvoice(), { wrapper })
    act(() => result.current.goToList())
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
  })
})
