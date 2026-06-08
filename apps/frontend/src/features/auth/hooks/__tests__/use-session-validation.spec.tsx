import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useSessionValidation } from '../use-session-validation'

const mockIsAuthenticated = vi.fn()
vi.mock('@/lib/auth', () => ({ isAuthenticated: () => mockIsAuthenticated() }))

let lastOptions: { query?: { enabled?: boolean } } | undefined
const mockUseMe = vi.fn()
vi.mock('@/api/generated/auth/auth', () => ({
  useAuthControllerMe: (options: { query?: { enabled?: boolean } }) => {
    lastOptions = options
    return mockUseMe()
  },
}))

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useSessionValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    lastOptions = undefined
    mockUseMe.mockReturnValue({ isLoading: false, isError: false })
  })

  it('disables the query when there is no token', () => {
    mockIsAuthenticated.mockReturnValue(false)
    const { result } = renderHook(() => useSessionValidation(), { wrapper })
    expect(lastOptions?.query?.enabled).toBe(false)
    expect(result.current.validating).toBe(false)
    expect(result.current.invalid).toBe(false)
  })

  it('enables the query and reports validating while loading', () => {
    mockIsAuthenticated.mockReturnValue(true)
    mockUseMe.mockReturnValue({ isLoading: true, isError: false })
    const { result } = renderHook(() => useSessionValidation(), { wrapper })
    expect(lastOptions?.query?.enabled).toBe(true)
    expect(result.current.validating).toBe(true)
  })

  it('reports invalid when /auth/me errors with a token present', () => {
    mockIsAuthenticated.mockReturnValue(true)
    mockUseMe.mockReturnValue({ isLoading: false, isError: true })
    const { result } = renderHook(() => useSessionValidation(), { wrapper })
    expect(result.current.invalid).toBe(true)
  })
})
