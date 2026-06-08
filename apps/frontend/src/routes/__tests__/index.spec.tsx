import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'

import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockNavigate = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  createRoute: (config: unknown) => ({ options: config }),
  createRootRoute: (config: unknown) => ({ options: config }),
  useNavigate: () => mockNavigate,
  redirect: vi.fn(),
  Outlet: () => null,
  Link: ({ children, ...props }: Record<string, unknown>) => <a {...props}>{children as React.ReactNode}</a>,
}))

vi.mock('@/lib/auth', () => ({
  isAuthenticated: () => true,
  removeToken: vi.fn(),
}))

const mockUseList = vi.fn()
vi.mock('@/api/generated/invoices/invoices', () => ({
  useInvoiceControllerList: (...args: unknown[]) => mockUseList(...args),
}))

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

async function renderList() {
  const { HomePage } = await import('@/features/invoice/invoice-list-page')
  return render(<HomePage />, { wrapper })
}

describe('Invoice list page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state', async () => {
    mockUseList.mockReturnValue({ data: undefined, isLoading: true, isError: false })
    await renderList()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows error state', async () => {
    mockUseList.mockReturnValue({ data: undefined, isLoading: false, isError: true })
    await renderList()
    expect(screen.getByText('Failed to load invoices')).toBeInTheDocument()
  })

  it('renders invoice rows', async () => {
    mockUseList.mockReturnValue({
      data: {
        data: [
          {
            invoiceId: '1',
            invoiceNumber: 'IV-001',
            customer: { fullname: 'Acme Corp', email: 'acme@example.com', mobileNumber: null, address: null },
            invoiceDate: '2026-01-01',
            dueDate: '2026-02-01',
            totalAmount: 1100,
            currencySymbol: '$',
            status: 'Draft',
          },
        ],
        paging: { total: 1, page: 1, pageSize: 10 },
      },
      isLoading: false,
      isError: false,
    })
    await renderList()
    expect(screen.getByText('IV-001')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    // status badge (span) — dropdown also has 'Draft' so use getAllByText
    const draftEls = screen.getAllByText('Draft')
    expect(draftEls.some((el) => el.tagName === 'SPAN')).toBe(true)
  })

  it('shows empty state when no invoices', async () => {
    mockUseList.mockReturnValue({
      data: { data: [], paging: { total: 0, page: 1, pageSize: 10 } },
      isLoading: false,
      isError: false,
    })
    await renderList()
    expect(screen.getByText('No invoices found')).toBeInTheDocument()
  })

  it('navigates to detail on row click', async () => {
    mockUseList.mockReturnValue({
      data: {
        data: [
          {
            invoiceId: 'abc-123',
            invoiceNumber: 'IV-002',
            customer: { fullname: 'Beta Inc', email: 'beta@example.com', mobileNumber: null, address: null },
            invoiceDate: '2026-01-01',
            dueDate: '2026-02-01',
            totalAmount: 500,
            currencySymbol: '$',
            status: 'Paid',
          },
        ],
        paging: { total: 1, page: 1, pageSize: 10 },
      },
      isLoading: false,
      isError: false,
    })
    await renderList()
    fireEvent.click(screen.getByText('IV-002').closest('tr')!)
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/invoices/$id', params: { id: 'abc-123' } })
  })

  it('navigates to create on button click', async () => {
    mockUseList.mockReturnValue({
      data: { data: [], paging: { total: 0, page: 1, pageSize: 10 } },
      isLoading: false,
      isError: false,
    })
    await renderList()
    fireEvent.click(screen.getByText('Create invoice'))
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/invoices/create' })
  })

  it('shows overdue status with red indicator', async () => {
    mockUseList.mockReturnValue({
      data: {
        data: [
          {
            invoiceId: '2',
            invoiceNumber: 'IV-003',
            customer: { fullname: 'Gamma Ltd', email: 'gamma@example.com', mobileNumber: null, address: null },
            invoiceDate: '2025-01-01',
            dueDate: '2025-02-01',
            totalAmount: 200,
            currencySymbol: '$',
            status: 'Overdue',
          },
        ],
        paging: { total: 1, page: 1, pageSize: 10 },
      },
      isLoading: false,
      isError: false,
    })
    await renderList()
    // 'Overdue' appears in both dropdown option and badge span
    const overdueBadge = screen.getAllByText('Overdue').find((el) => el.tagName === 'SPAN')
    expect(overdueBadge).toBeDefined()
    expect(overdueBadge).toHaveClass('bg-red-100')
  })
})
