import { AppHeader } from '@/components/app-header'
import { Button, Spinner } from '@/components/button'
import { StatusBadge } from '@/components/status-badge'
import { useInvoiceDetail } from '@/features/invoice/hooks/use-invoice-detail'

export function InvoiceDetailPage() {
  const { invoice, isLoading, isError, money, goToList } = useInvoiceDetail()

  return (
    <div className="min-h-dvh bg-slate-50">
      <AppHeader
        actions={
          <Button variant="secondary" onClick={goToList}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
        }
      />

      <main className="mx-auto max-w-4xl p-4 sm:p-8">
        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-20 text-slate-500">
            <Spinner className="h-6 w-6 text-blue-600" />
            <span className="text-sm">Loading...</span>
          </div>
        )}
        {isError && (
          <div className="flex flex-col items-center gap-2 py-20 text-center">
            <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-slate-600">Invoice not found</p>
          </div>
        )}

        {invoice && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 data-testid="detail-invoice-number" className="text-2xl font-bold tracking-tight text-slate-900">{invoice.invoiceNumber}</h2>
                {invoice.invoiceReference && (
                  <p className="mt-0.5 text-sm text-slate-500">Reference: {invoice.invoiceReference}</p>
                )}
              </div>
              <StatusBadge status={invoice.status} size="md" />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Invoice details</h3>
                <dl className="space-y-2.5 text-sm">
                  <Row label="Invoice date" value={invoice.invoiceDate} />
                  <Row label="Due date" value={invoice.dueDate} />
                  <Row label="Currency" value={invoice.currency} />
                  {invoice.description && <Row label="Description" value={invoice.description} />}
                </dl>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Customer</h3>
                <dl className="space-y-2.5 text-sm">
                  <Row label="Name" value={invoice.customer.fullname} />
                  <Row label="Email" value={invoice.customer.email} />
                  {invoice.customer.mobileNumber && <Row label="Phone" value={invoice.customer.mobileNumber} />}
                  {invoice.customer.address && <Row label="Address" value={invoice.customer.address} />}
                </dl>
              </section>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="py-2.5 font-medium">Name</th>
                      <th className="py-2.5 text-right font-medium">Quantity</th>
                      <th className="py-2.5 text-right font-medium">Rate</th>
                      <th className="py-2.5 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-2.5 text-slate-900">{item.name}</td>
                        <td className="py-2.5 text-right tabular-nums text-slate-600">{item.quantity}</td>
                        <td className="py-2.5 text-right tabular-nums text-slate-600">{money(item.rate)}</td>
                        <td className="py-2.5 text-right font-medium tabular-nums text-slate-900">
                          {money(item.quantity * item.rate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Summary</h3>
              <dl className="ml-auto max-w-xs space-y-2.5 text-sm">
                <Row label="Subtotal" value={money(invoice.invoiceSubTotal)} />
                <Row label={`Tax (${invoice.taxRate}%)`} value={money(invoice.totalTax)} />
                <Row label="Discount" value={`- ${money(invoice.totalDiscount)}`} />
                <div className="flex justify-between border-t border-slate-200 pt-2.5 text-base font-bold text-slate-900">
                  <span>Total</span>
                  <span className="tabular-nums">{money(invoice.totalAmount)}</span>
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
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium tabular-nums text-slate-900">{value}</dd>
    </div>
  )
}
