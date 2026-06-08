import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockNavigate = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  createRoute: (config: unknown) => ({ options: config }),
  createRootRoute: (config: unknown) => ({ options: config }),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'test-id-123' }),
  redirect: vi.fn(),
  Outlet: () => null,
  Link: ({ children, ...props }: Record<string, unknown>) => <a {...props}>{children as React.ReactNode}</a>,
}))

vi.mock('@/lib/auth', () => ({
  isAuthenticated: () => true,
}))

const mockUseFindById = vi.fn()
vi.mock('@/api/generated/invoices/invoices', () => ({
  useInvoiceControllerFindById: (...args: unknown[]) => mockUseFindById(...args),
}))

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

const mockInvoice = {
  invoiceId: 'test-id-123',
  invoiceNumber: 'IV-001',
  invoiceReference: 'REF-001',
  invoiceDate: '2026-01-01',
  dueDate: '2026-02-01',
  currency: 'USD',
  currencySymbol: '$',
  description: 'Test invoice',
  status: 'Draft',
  customer: {
    fullname: 'Acme Corp',
    email: 'acme@example.com',
    mobileNumber: '+1234567890',
    address: '123 Main St',
  },
  invoiceSubTotal: 200,
  taxRate: 10,
  totalTax: 20,
  totalDiscount: 0,
  totalAmount: 220,
  totalPaid: 0,
  balanceAmount: 220,
  items: [{ id: 'item-1', name: 'Widget', quantity: 2, rate: 100 }],
}

async function renderDetail() {
  const { InvoiceDetailPage } = await import('@/features/invoice/invoice-detail-page')
  return render(<InvoiceDetailPage />, { wrapper })
}

describe('Invoice detail page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state', async () => {
    mockUseFindById.mockReturnValue({ data: undefined, isLoading: true, isError: false })
    await renderDetail()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows error state when invoice not found', async () => {
    mockUseFindById.mockReturnValue({ data: undefined, isLoading: false, isError: true })
    await renderDetail()
    expect(screen.getByText('Invoice not found')).toBeInTheDocument()
  })

  it('renders invoice info and customer info', async () => {
    mockUseFindById.mockReturnValue({ data: { data: mockInvoice }, isLoading: false, isError: false })
    await renderDetail()
    expect(screen.getByText('IV-001')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('acme@example.com')).toBeInTheDocument()
    expect(screen.getByText('+1234567890')).toBeInTheDocument()
  })

  it('renders items table', async () => {
    mockUseFindById.mockReturnValue({ data: { data: mockInvoice }, isLoading: false, isError: false })
    await renderDetail()
    expect(screen.getByText('Widget')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders amounts breakdown correctly', async () => {
    mockUseFindById.mockReturnValue({ data: { data: mockInvoice }, isLoading: false, isError: false })
    await renderDetail()
    // $200 appears in items table (2×$100) and subtotal row
    expect(screen.getAllByText('$200.00').length).toBeGreaterThanOrEqual(1)
    // $220 appears in both total and balance
    expect(screen.getAllByText('$220.00').length).toBeGreaterThanOrEqual(1)
    // $0.00 for paid
    expect(screen.getByText('$0.00')).toBeInTheDocument()
  })

  it('shows status badge', async () => {
    mockUseFindById.mockReturnValue({ data: { data: mockInvoice }, isLoading: false, isError: false })
    await renderDetail()
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('back button navigates to list', async () => {
    const { fireEvent } = await import('@testing-library/react')
    mockUseFindById.mockReturnValue({ data: { data: mockInvoice }, isLoading: false, isError: false })
    await renderDetail()
    fireEvent.click(screen.getByText('Back'))
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
  })

  it('passes invoice id to query hook', async () => {
    mockUseFindById.mockReturnValue({ data: { data: mockInvoice }, isLoading: false, isError: false })
    await renderDetail()
    expect(mockUseFindById).toHaveBeenCalledWith('test-id-123')
  })
})
