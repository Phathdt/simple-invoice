import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
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
  Link: ({ children, ...props }: Record<string, unknown>) => <a {...props}>{children as React.ReactNode}</a>,
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
  const { CreateInvoicePage } = await import('@/features/invoice/create-invoice-page')
  return render(<CreateInvoicePage />, { wrapper })
}

// Opens a DatePicker popover (current month) and clicks the given day-of-month
// in the current month grid, ignoring outside-month duplicate cells.
async function pickDate(testid: string, day: number) {
  const user = userEvent.setup()
  await user.click(screen.getByTestId(testid))
  const dialog = await screen.findByRole('dialog')
  const cells = within(dialog)
    .getAllByText(String(day), { selector: 'button' })
    .filter((el) => !el.closest('.day')?.classList.contains('outside'))
  await user.click(cells[0]!)
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
    expect(screen.getByTestId('invoice-date-picker')).toBeInTheDocument()
    expect(screen.getByTestId('due-date-picker')).toBeInTheDocument()
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
    const user = userEvent.setup()
    const { container } = await renderCreate()

    // Fill text fields via fireEvent; dates are set through the DatePicker
    // (Controller-bound) below since they are no longer native inputs.
    fireEvent.change(container.querySelector('[name="invoiceNumber"]')!, { target: { value: 'IV-001' } })
    fireEvent.change(container.querySelector('[name="customerName"]')!, { target: { value: 'Test Co' } })
    fireEvent.change(container.querySelector('[name="customerEmail"]')!, { target: { value: 'test@test.com' } })
    fireEvent.change(container.querySelector('[name="items.0.name"]')!, { target: { value: 'Widget' } })
    fireEvent.change(container.querySelector('[name="items.0.quantity"]')!, { target: { value: 1 } })
    fireEvent.change(container.querySelector('[name="items.0.rate"]')!, { target: { value: 100 } })

    // Currency is a Radix Select: open the trigger and pick an option so the
    // derived symbol is set and the base schema passes (letting the dueDate refine run).
    await user.click(screen.getByLabelText('Currency'))
    await user.click(await screen.findByRole('option', { name: /USD/ }))

    await pickDate('invoice-date-picker', 15)
    await pickDate('due-date-picker', 1)

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

  it('implements exactly one line item for this assessment', async () => {
    await renderCreate()
    expect(screen.getAllByPlaceholderText('Item name')).toHaveLength(1)
    expect(screen.queryByText('+ Add item')).not.toBeInTheDocument()
  })
})
