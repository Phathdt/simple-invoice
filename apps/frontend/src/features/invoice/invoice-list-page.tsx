import { AppHeader } from '@/components/app-header'
import { Spinner } from '@/components/spinner'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatMoney } from '@/features/invoice/currency'
import { useInvoiceList } from '@/features/invoice/hooks/use-invoice-list'
import { INVOICE_STATUSES } from '@/features/invoice/invoice-status'

import { Plus, Search } from 'lucide-react'

const ALL_STATUSES = '__all__'

export function HomePage() {
  const {
    state,
    setSortBy,
    setOrdering,
    onKeyword,
    onStatus,
    onFromDate,
    onToDate,
    onPageSize,
    pageSizeOptions,
    prevPage,
    nextPage,
    logout,
    openInvoice,
    openCreate,
    query: { isLoading, isError },
    invoices,
    paging,
    totalPages,
  } = useInvoiceList()

  return (
    <div className='min-h-dvh bg-muted'>
      <AppHeader
        actions={
          <Button variant='secondary' onClick={logout}>
            Log out
          </Button>
        }
      />

      <main className='mx-auto max-w-6xl p-4 sm:p-8' data-testid='invoice-list'>
        <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight text-foreground'>Invoices</h2>
            <p className='mt-0.5 text-sm text-muted-foreground'>Manage and track your invoices</p>
          </div>
          <Button onClick={openCreate} data-testid='invoice-create-btn'>
            <Plus />
            Create invoice
          </Button>
        </div>

        <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap'>
          <div className='relative flex-1'>
            <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              type='text'
              placeholder='Search by invoice number or customer...'
              value={state.keyword}
              onChange={(e) => onKeyword(e.target.value)}
              data-testid='invoice-search'
              className='pl-9'
            />
          </div>
          <Select
            value={state.status === '' ? ALL_STATUSES : state.status}
            onValueChange={(v) => onStatus(v === ALL_STATUSES ? '' : v)}
          >
            <SelectTrigger className='sm:w-44' aria-label='Status filter'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
              {INVOICE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={state.sortBy} onValueChange={(v) => setSortBy(v as typeof state.sortBy)}>
            <SelectTrigger className='sm:w-44' aria-label='Sort by'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='createdAt'>Created date</SelectItem>
              <SelectItem value='invoiceDate'>Invoice date</SelectItem>
              <SelectItem value='dueDate'>Due date</SelectItem>
              <SelectItem value='totalAmount'>Total amount</SelectItem>
            </SelectContent>
          </Select>
          <Select value={state.ordering} onValueChange={(v) => setOrdering(v as typeof state.ordering)}>
            <SelectTrigger className='sm:w-36' aria-label='Order'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='DESC'>Descending</SelectItem>
              <SelectItem value='ASC'>Ascending</SelectItem>
            </SelectContent>
          </Select>
          <DatePicker
            value={state.fromDate}
            onChange={onFromDate}
            placeholder='From date'
            aria-label='From date'
            className='w-auto'
          />
          <DatePicker
            value={state.toDate}
            onChange={onToDate}
            placeholder='To date'
            aria-label='To date'
            className='w-auto'
          />
        </div>

        {isLoading && (
          <div className='flex flex-col items-center gap-3 py-20 text-muted-foreground'>
            <Spinner className='h-6 w-6 text-primary' />
            <span className='text-sm'>Loading...</span>
          </div>
        )}
        {isError && <p className='py-20 text-center text-sm text-destructive'>Failed to load invoices</p>}

        {!isLoading && !isError && (
          <>
            <Card className='overflow-hidden p-0'>
              <Table>
                <TableHeader className='bg-muted'>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Invoice date</TableHead>
                    <TableHead>Due date</TableHead>
                    <TableHead className='text-right'>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 && (
                    <TableRow className='hover:bg-transparent'>
                      <TableCell colSpan={6} className='py-16 text-center'>
                        <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                          <svg
                            className='h-10 w-10 text-border'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                            />
                          </svg>
                          <span className='text-sm'>No invoices found</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {invoices.map((invoice) => (
                    <TableRow
                      key={invoice.invoiceId}
                      data-testid='invoice-row'
                      onClick={() => openInvoice(invoice.invoiceId)}
                      className='cursor-pointer'
                    >
                      <TableCell className='font-medium text-foreground'>{invoice.invoiceNumber}</TableCell>
                      <TableCell className='text-foreground'>{invoice.customer.fullname}</TableCell>
                      <TableCell className='tabular-nums text-muted-foreground'>{invoice.invoiceDate}</TableCell>
                      <TableCell className='tabular-nums text-muted-foreground'>{invoice.dueDate}</TableCell>
                      <TableCell className='text-right font-medium tabular-nums text-foreground'>
                        {formatMoney(invoice.totalAmount, invoice.currency, invoice.currencySymbol)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={invoice.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <div className='mt-4 flex items-center justify-between text-sm text-foreground/80'>
              <div className='flex items-center gap-3'>
                <span>{paging ? `${paging.total} invoices` : ''}</span>
                <label className='flex items-center gap-1.5'>
                  Rows per page
                  <Select value={String(state.pageSize)} onValueChange={(v) => onPageSize(Number(v))}>
                    <SelectTrigger className='h-9 w-20' aria-label='Rows per page'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pageSizeOptions.map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
              </div>
              <div className='flex items-center gap-2'>
                <Button variant='secondary' size='sm' onClick={prevPage} disabled={state.page <= 1}>
                  Previous
                </Button>
                <span className='tabular-nums'>
                  Page {state.page} / {totalPages}
                </span>
                <Button variant='secondary' size='sm' onClick={nextPage} disabled={state.page >= totalPages}>
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
