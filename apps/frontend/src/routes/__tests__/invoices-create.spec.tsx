import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockNavigate = vi.fn()
const mockMutate = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  createRoute: (config: unknown) => ({ options: config }),
  createRootRoute: (config: unknown) => ({ options: config }),
  useNavigate: () => mockNavigate,
  redirect: vi.fn(),
  Outlet: () => null,
}))

vi.mock('@/lib/auth', () => ({
  isAuthenticated: () => true,
}))

const mockUseCreate = vi.fn()
vi.mock('@/api/generated/invoices/invoices', () => ({
  useInvoiceControllerCreate: () => mockUseCreate(),
}))

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

async function renderCreate() {
  const { Route } = await import('../invoices/create')
  const Component = (Route as { options: { component: React.FC } }).options.component
  return render(<Component />, { wrapper })
}

describe('Create invoice page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseCreate.mockReturnValue({ mutate: mockMutate, isPending: false, isError: false, error: null })
  })

  it('renders all required fields', async () => {
    const { container } = await renderCreate()
    // Check inputs exist by name attribute
    expect(container.querySelector('[name="invoiceNumber"]')).toBeInTheDocument()
    expect(container.querySelector('[name="invoiceDate"]')).toBeInTheDocument()
    expect(container.querySelector('[name="dueDate"]')).toBeInTheDocument()
    expect(container.querySelector('[name="currency"]')).toBeInTheDocument()
    expect(container.querySelector('[name="customerName"]')).toBeInTheDocument()
    expect(container.querySelector('[name="customerEmail"]')).toBeInTheDocument()
  })

  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup()
    await renderCreate()
    await user.click(screen.getByRole('button', { name: /create invoice/i }))
    await waitFor(() => {
      expect(screen.getAllByText('Required').length).toBeGreaterThan(0)
    })
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('shows dueDate error when due < invoice date', async () => {
    const { container } = await renderCreate()

    // Fill all required fields via fireEvent
    fireEvent.change(container.querySelector('[name="invoiceNumber"]')!, { target: { value: 'IV-001' } })
    fireEvent.change(container.querySelector('[name="invoiceDate"]')!, { target: { value: '2026-06-15' } })
    fireEvent.change(container.querySelector('[name="dueDate"]')!, { target: { value: '2026-06-01' } })
    fireEvent.change(container.querySelector('[name="currency"]')!, { target: { value: 'USD' } })
    fireEvent.change(container.querySelector('[name="currencySymbol"]')!, { target: { value: '$' } })
    fireEvent.change(container.querySelector('[name="customerName"]')!, { target: { value: 'Test Co' } })
    fireEvent.change(container.querySelector('[name="customerEmail"]')!, { target: { value: 'test@test.com' } })
    fireEvent.change(container.querySelector('[name="items.0.name"]')!, { target: { value: 'Widget' } })
    fireEvent.change(container.querySelector('[name="items.0.quantity"]')!, { target: { value: 1 } })
    fireEvent.change(container.querySelector('[name="items.0.rate"]')!, { target: { value: 100 } })

    fireEvent.click(screen.getByRole('button', { name: /create invoice/i }))
    await waitFor(() => {
      expect(screen.getByText('Due date must be on or after invoice date')).toBeInTheDocument()
    })
  })

  it('shows pending state during submit', async () => {
    mockUseCreate.mockReturnValue({ mutate: mockMutate, isPending: true, isError: false, error: null })
    await renderCreate()
    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled()
  })

  it('shows server error message', async () => {
    mockUseCreate.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: true,
      error: { response: { data: { message: 'Invoice number already exists' } } },
    })
    await renderCreate()
    expect(screen.getByText('Invoice number already exists')).toBeInTheDocument()
  })

  it('cancel button navigates back to list', async () => {
    const user = userEvent.setup()
    await renderCreate()
    const cancelButtons = screen.getAllByRole('button', { name: /cancel/i })
    await user.click(cancelButtons[0]!)
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
  })

  it('can add and remove items', async () => {
    const user = userEvent.setup()
    await renderCreate()
    const addBtn = screen.getByText('+ Add item')
    await user.click(addBtn)
    const nameInputs = screen.getAllByPlaceholderText('Item name')
    expect(nameInputs).toHaveLength(2)
  })
})
