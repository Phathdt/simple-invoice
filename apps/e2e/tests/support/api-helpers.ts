import { URLS } from '@config/urls.config'

export interface ApiSession {
  token: string
}

async function post<T>(pathname: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${URLS.API}${pathname}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  const json = (await res.json()) as { data?: T; message?: unknown }
  if (!res.ok) throw new Error(`POST ${pathname} failed (${res.status}): ${JSON.stringify(json.message)}`)
  return json.data as T
}

// Logs in via REST and returns a JWT for authenticated API setup.
export async function loginViaApi(email: string, password: string): Promise<ApiSession> {
  const data = await post<{ token: string }>('/auth/login', { email, password })
  if (!data?.token) throw new Error('Login did not return a token')
  return { token: data.token }
}

export interface CreateInvoiceArgs {
  invoiceNumber?: string
  customerName?: string
  customerEmail?: string
}

// Unique invoice number per call keeps parallel workers from colliding on the
// DB unique constraint. Format: <prefix>-YYYYMMDD-XXXYYY (date + 6 random chars).
export function uniqueInvoiceNumber(prefix = 'E2E'): string {
  const now = new Date()
  const datePart =
    `${now.getFullYear()}` +
    `${String(now.getMonth() + 1).padStart(2, '0')}` +
    `${String(now.getDate()).padStart(2, '0')}`
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, '0')
  return `${prefix}-${datePart}-${randomPart}`
}

// Seeds an invoice through the REST API so list/detail scenarios have a known row.
export async function createInvoiceViaApi(token: string, args: CreateInvoiceArgs = {}): Promise<{ id: string; invoiceNumber: string }> {
  const invoiceNumber = args.invoiceNumber ?? uniqueInvoiceNumber()
  const data = await post<{ id: string; invoiceNumber: string }>(
    '/invoices',
    {
      invoiceNumber,
      invoiceDate: '2026-01-01',
      dueDate: '2026-02-01',
      currency: 'USD',
      currencySymbol: '$',
      customerName: args.customerName ?? 'E2E Customer',
      customerEmail: args.customerEmail ?? 'e2e@example.com',
      items: [{ name: 'E2E Widget', quantity: 2, rate: 100 }],
      tax: 10,
      discount: 0,
    },
    token,
  )
  return { id: data.id, invoiceNumber: data.invoiceNumber }
}
