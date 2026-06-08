import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useLogin } from '../use-login'

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => mockNavigate }))

const mockSetToken = vi.fn()
vi.mock('@/lib/auth', () => ({ setToken: (t: string) => mockSetToken(t) }))

const mockMutate = vi.fn()
const mockUseLogin = vi.fn()
vi.mock('@/api/generated/auth/auth', () => ({
  useAuthControllerLogin: () => mockUseLogin(),
}))

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseLogin.mockReturnValue({ mutate: mockMutate, isPending: false, isError: false })
  })

  it('exposes form state from react-hook-form', () => {
    const { result } = renderHook(() => useLogin(), { wrapper })
    expect(typeof result.current.register).toBe('function')
    expect(typeof result.current.submit).toBe('function')
    expect(result.current.isPending).toBe(false)
    expect(result.current.isError).toBe(false)
  })

  it('does not call mutate when fields are invalid', async () => {
    const { result } = renderHook(() => useLogin(), { wrapper })
    await act(async () => {
      await result.current.submit()
    })
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('reflects pending and error states from the mutation', () => {
    mockUseLogin.mockReturnValue({ mutate: mockMutate, isPending: true, isError: true })
    const { result } = renderHook(() => useLogin(), { wrapper })
    expect(result.current.isPending).toBe(true)
    expect(result.current.isError).toBe(true)
  })
})
