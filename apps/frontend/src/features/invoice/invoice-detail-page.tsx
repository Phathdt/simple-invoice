import { ArrowLeft } from 'lucide-react'

import { AppHeader } from '@/components/app-header'
import { Button, Spinner } from '@/components/button'
import { StatusBadge } from '@/components/status-badge'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useInvoiceDetail } from '@/features/invoice/hooks/use-invoice-detail'

export function InvoiceDetailPage() {
  const { invoice, isLoading, isError, money, goToList } = useInvoiceDetail()

  return (
    <div className="min-h-dvh bg-muted">
      <AppHeader
        actions={
          <Button variant="secondary" onClick={goToList}>
            <ArrowLeft />
            Back
          </Button>
        }
      />

      <main className="mx-auto max-w-4xl p-4 sm:p-8">
        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
            <Spinner className="h-6 w-6 text-primary" />
            <span className="text-sm">Loading...</span>
          </div>
        )}
        {isError && (
          <div className="flex flex-col items-center gap-2 py-20 text-center">
            <svg className="h-10 w-10 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-foreground/80">Invoice not found</p>
          </div>
        )}

        {invoice && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 data-testid="detail-invoice-number" className="text-2xl font-bold tracking-tight text-foreground">{invoice.invoiceNumber}</h2>
                {invoice.invoiceReference && (
                  <p className="mt-0.5 text-sm text-muted-foreground">Reference: {invoice.invoiceReference}</p>
                )}
              </div>
              <StatusBadge status={invoice.status} size="md" />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Card>
                <CardContent className="p-5">
                  <CardTitle className="mb-3">Invoice details</CardTitle>
                  <dl className="space-y-2.5 text-sm">
                    <Row label="Invoice date" value={invoice.invoiceDate} />
                    <Row label="Due date" value={invoice.dueDate} />
                    <Row label="Currency" value={invoice.currency} />
                    {invoice.description && <Row label="Description" value={invoice.description} />}
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <CardTitle className="mb-3">Customer</CardTitle>
                  <dl className="space-y-2.5 text-sm">
                    <Row label="Name" value={invoice.customer.fullname} />
                    <Row label="Email" value={invoice.customer.email} />
                    {invoice.customer.mobileNumber && <Row label="Phone" value={invoice.customer.mobileNumber} />}
                    {invoice.customer.address && <Row label="Address" value={invoice.customer.address} />}
                  </dl>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-5">
                <CardTitle className="mb-3">Items</CardTitle>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-0">Name</TableHead>
                      <TableHead className="px-0 text-right">Quantity</TableHead>
                      <TableHead className="px-0 text-right">Rate</TableHead>
                      <TableHead className="px-0 text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.items.map((item) => (
                      <TableRow key={item.id} className="hover:bg-transparent">
                        <TableCell className="px-0 text-foreground">{item.name}</TableCell>
                        <TableCell className="px-0 text-right tabular-nums text-foreground/80">{item.quantity}</TableCell>
                        <TableCell className="px-0 text-right tabular-nums text-foreground/80">{money(item.rate)}</TableCell>
                        <TableCell className="px-0 text-right font-medium tabular-nums text-foreground">
                          {money(item.quantity * item.rate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <CardTitle className="mb-3">Summary</CardTitle>
                <dl className="ml-auto max-w-xs space-y-2.5 text-sm">
                  <Row label="Subtotal" value={money(invoice.invoiceSubTotal)} />
                  <Row label={`Tax (${invoice.taxRate}%)`} value={money(invoice.totalTax)} />
                  <Row label="Discount" value={`- ${money(invoice.totalDiscount)}`} />
                  <div className="flex justify-between border-t border-border pt-2.5 text-base font-bold text-foreground">
                    <span>Total</span>
                    <span className="tabular-nums">{money(invoice.totalAmount)}</span>
                  </div>
                  <Row label="Paid" value={money(invoice.totalPaid)} />
                  <Row label="Balance" value={money(invoice.balanceAmount)} />
                </dl>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium tabular-nums text-foreground">{value}</dd>
    </div>
  )
}
