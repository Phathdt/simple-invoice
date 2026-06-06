import { createRoute, redirect, useNavigate, useParams } from '@tanstack/react-router'

import { useInvoiceControllerFindById } from '@/api/generated/invoices/invoices'
import { isAuthenticated } from '@/lib/auth'

import { Route as rootRoute } from '../__root'

function statusClasses(status: string): string {
  switch (status) {
    case 'Paid':
      return 'bg-green-100 text-green-800'
    case 'Overdue':
      return 'bg-red-100 text-red-800'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function InvoiceDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams({ from: '/invoices/$id' })
  const { data: response, isLoading, isError } = useInvoiceControllerFindById(id)
  const invoice = response?.data

  const money = (amount: number) =>
    `${invoice?.currencySymbol ?? ''}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <h1 className="text-xl font-bold text-gray-900">SimpleInvoice</h1>
        <button
          onClick={() => navigate({ to: '/' })}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Back
        </button>
      </header>

      <main className="mx-auto max-w-4xl p-4 sm:p-8">
        {isLoading && <p className="py-12 text-center text-gray-500">Loading...</p>}
        {isError && <p className="py-12 text-center text-red-600">Invoice not found</p>}

        {invoice && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h2>
                {invoice.invoiceReference && (
                  <p className="text-sm text-gray-500">Reference: {invoice.invoiceReference}</p>
                )}
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusClasses(invoice.status)}`}>
                {invoice.status}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <section className="rounded-lg border bg-white p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase text-gray-500">Invoice details</h3>
                <dl className="space-y-2 text-sm">
                  <Row label="Invoice date" value={invoice.invoiceDate} />
                  <Row label="Due date" value={invoice.dueDate} />
                  <Row label="Currency" value={invoice.currency} />
                  {invoice.description && <Row label="Description" value={invoice.description} />}
                </dl>
              </section>

              <section className="rounded-lg border bg-white p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase text-gray-500">Customer</h3>
                <dl className="space-y-2 text-sm">
                  <Row label="Name" value={invoice.customerName} />
                  <Row label="Email" value={invoice.customerEmail} />
                  {invoice.customerMobile && <Row label="Phone" value={invoice.customerMobile} />}
                  {invoice.customerAddress && <Row label="Address" value={invoice.customerAddress} />}
                </dl>
              </section>
            </div>

            <section className="rounded-lg border bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase text-gray-500">Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b text-xs uppercase text-gray-500">
                    <tr>
                      <th className="py-2">Name</th>
                      <th className="py-2 text-right">Quantity</th>
                      <th className="py-2 text-right">Rate</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-2 text-gray-900">{item.name}</td>
                        <td className="py-2 text-right text-gray-700">{item.quantity}</td>
                        <td className="py-2 text-right text-gray-700">{money(item.rate)}</td>
                        <td className="py-2 text-right font-medium text-gray-900">{money(item.quantity * item.rate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-lg border bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase text-gray-500">Summary</h3>
              <dl className="ml-auto max-w-xs space-y-2 text-sm">
                <Row label="Subtotal" value={money(invoice.invoiceSubTotal)} />
                <Row label={`Tax (${invoice.taxRate}%)`} value={money(invoice.totalTax)} />
                <Row label="Discount" value={`- ${money(invoice.totalDiscount)}`} />
                <div className="flex justify-between border-t pt-2 text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span>{money(invoice.totalAmount)}</span>
                </div>
                <Row label="Paid" value={money(invoice.totalPaid)} />
                <Row label="Balance" value={money(invoice.balanceAmount)} />
              </dl>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right font-medium text-gray-900">{value}</dd>
    </div>
  )
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invoices/$id',
  beforeLoad: () => {
    if (!isAuthenticated()) throw redirect({ to: '/login' })
  },
  component: InvoiceDetailPage,
})
