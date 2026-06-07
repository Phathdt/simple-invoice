import type { ReactNode } from 'react'
import type { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form'

import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import { CURRENCY_CODES, symbolForCurrency } from './currency'
import type { CreateInvoiceForm } from './create-invoice-form-schema'

type FormRegister = UseFormRegister<CreateInvoiceForm>
type FormErrors = FieldErrors<CreateInvoiceForm>
type FormSetValue = UseFormSetValue<CreateInvoiceForm>

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

// Native select styled to match shadcn Input. Kept native (not Radix Select) so
// react-hook-form register() and the [name="currency"] e2e selector keep working.
const nativeSelectCls =
  'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50'

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5">
        <CardTitle className="mb-4">{title}</CardTitle>
        {children}
      </CardContent>
    </Card>
  )
}

export function InvoiceDetailsSection({
  register,
  errors,
  setValue,
}: {
  register: FormRegister
  errors: FormErrors
  setValue: FormSetValue
}) {
  return (
    <FormSection title="Invoice details">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Invoice number *" error={errors.invoiceNumber?.message}>
          <Input {...register('invoiceNumber')} />
        </Field>
        <Field label="Reference" error={errors.invoiceReference?.message}>
          <Input {...register('invoiceReference')} />
        </Field>
        <Field label="Invoice date *" error={errors.invoiceDate?.message}>
          <Input type="date" {...register('invoiceDate')} />
        </Field>
        <Field label="Due date *" error={errors.dueDate?.message}>
          <Input type="date" {...register('dueDate')} />
        </Field>
        <Field label="Currency *" error={errors.currency?.message}>
          <select
            {...register('currency', {
              onChange: (e) =>
                setValue('currencySymbol', symbolForCurrency(e.target.value), { shouldValidate: true }),
            })}
            className={nativeSelectCls}
          >
            <option value="">Select currency</option>
            {CURRENCY_CODES.map((code) => (
              <option key={code} value={code}>
                {code} ({symbolForCurrency(code)})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Currency symbol" error={errors.currencySymbol?.message}>
          {/* Derived from the selected currency via setValue; read-only so the pair can't drift. */}
          <Input {...register('currencySymbol')} readOnly placeholder="—" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description" error={errors.description?.message}>
            <Textarea {...register('description')} rows={2} />
          </Field>
        </div>
      </div>
    </FormSection>
  )
}

export function CustomerSection({ register, errors }: { register: FormRegister; errors: FormErrors }) {
  return (
    <FormSection title="Customer">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name *" error={errors.customerName?.message}>
          <Input {...register('customerName')} />
        </Field>
        <Field label="Email *" error={errors.customerEmail?.message}>
          <Input type="email" {...register('customerEmail')} />
        </Field>
        <Field label="Phone" error={errors.customerMobile?.message}>
          <Input {...register('customerMobile')} />
        </Field>
        <Field label="Address" error={errors.customerAddress?.message}>
          <Input {...register('customerAddress')} />
        </Field>
      </div>
    </FormSection>
  )
}

export function ItemSection({ register, errors }: { register: FormRegister; errors: FormErrors }) {
  return (
    <FormSection title="Item">
      {errors.items?.root && <p className="mb-2 text-xs text-destructive">{errors.items.root.message}</p>}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_5rem_7rem]">
        <ItemInput error={errors.items?.[0]?.name?.message}>
          <Input {...register('items.0.name')} placeholder="Item name" />
        </ItemInput>
        <ItemInput error={errors.items?.[0]?.quantity?.message}>
          <Input type="number" {...register('items.0.quantity', { valueAsNumber: true })} placeholder="Qty" />
        </ItemInput>
        <ItemInput error={errors.items?.[0]?.rate?.message}>
          <Input type="number" step="0.01" {...register('items.0.rate', { valueAsNumber: true })} placeholder="Rate" />
        </ItemInput>
      </div>
    </FormSection>
  )
}

function ItemInput({ error, children }: { error?: string; children: ReactNode }) {
  return (
    <div className={cn('space-y-1.5')}>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function TaxDiscountSection({ register, errors }: { register: FormRegister; errors: FormErrors }) {
  return (
    <FormSection title="Tax & Discount">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Tax (%)" error={errors.tax?.message}>
          <Input type="number" step="0.01" {...register('tax', { valueAsNumber: true })} />
        </Field>
        <Field label="Discount" error={errors.discount?.message}>
          <Input type="number" step="0.01" {...register('discount', { valueAsNumber: true })} />
        </Field>
      </div>
    </FormSection>
  )
}
