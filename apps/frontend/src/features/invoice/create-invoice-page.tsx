import { AppHeader } from '@/components/app-header'
import { Button, Spinner } from '@/components/button'
import { useCreateInvoice } from '@/features/invoice/hooks/use-create-invoice'

import {
  CustomerSection,
  InvoiceDetailsSection,
  ItemSection,
  TaxDiscountSection,
} from './create-invoice-form-sections'

export function CreateInvoicePage() {
  const { register, setValue, errors, submit, goToList, created, isPending, isError, errorMessage } =
    useCreateInvoice()

  return (
    <div className="min-h-dvh bg-muted">
      <AppHeader
        actions={
          <Button type="button" variant="secondary" onClick={goToList}>
            Cancel
          </Button>
        }
      />

      <main className="mx-auto max-w-3xl p-4 sm:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Create invoice</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Enter invoice, customer, and payment item details</p>
        </div>

        <form onSubmit={submit} noValidate className="space-y-6">
          <InvoiceDetailsSection register={register} errors={errors} setValue={setValue} />
          <CustomerSection register={register} errors={errors} />
          <ItemSection register={register} errors={errors} />
          <TaxDiscountSection register={register} errors={errors} />

          {created && (
            <div data-testid="create-success" className="rounded-lg bg-green-50 px-3.5 py-3 text-sm text-green-700" role="status">
              Invoice created successfully. Redirecting to the invoice list...
            </div>
          )}

          {isError && (
            <div className="rounded-lg bg-red-50 px-3.5 py-3 text-sm text-red-700">{errorMessage}</div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={goToList}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} data-testid="create-submit">
              {isPending ? (
                <>
                  <Spinner />
                  Creating...
                </>
              ) : (
                'Create invoice'
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
