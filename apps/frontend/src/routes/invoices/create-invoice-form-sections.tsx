import type { ReactNode } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

import type { CreateInvoiceForm } from './create-invoice-form-schema'

type FormRegister = UseFormRegister<CreateInvoiceForm>
type FormErrors = FieldErrors<CreateInvoiceForm>

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-150 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10'

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h3>
      {children}
    </section>
  )
}

export function InvoiceDetailsSection({ register, errors }: { register: FormRegister; errors: FormErrors }) {
  return (
    <FormSection title="Invoice details">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Invoice number *" error={errors.invoiceNumber?.message}>
          <input {...register('invoiceNumber')} className={inputCls} />
        </Field>
        <Field label="Reference" error={errors.invoiceReference?.message}>
          <input {...register('invoiceReference')} className={inputCls} />
        </Field>
        <Field label="Invoice date *" error={errors.invoiceDate?.message}>
          <input type="date" {...register('invoiceDate')} className={inputCls} />
        </Field>
        <Field label="Due date *" error={errors.dueDate?.message}>
          <input type="date" {...register('dueDate')} className={inputCls} />
        </Field>
        <Field label="Currency *" error={errors.currency?.message}>
          <input {...register('currency')} placeholder="USD" className={inputCls} />
        </Field>
        <Field label="Currency symbol *" error={errors.currencySymbol?.message}>
          <input {...register('currencySymbol')} placeholder="$" className={inputCls} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description" error={errors.description?.message}>
            <textarea {...register('description')} rows={2} className={inputCls} />
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
          <input {...register('customerName')} className={inputCls} />
        </Field>
        <Field label="Email *" error={errors.customerEmail?.message}>
          <input type="email" {...register('customerEmail')} className={inputCls} />
        </Field>
        <Field label="Phone" error={errors.customerMobile?.message}>
          <input {...register('customerMobile')} className={inputCls} />
        </Field>
        <Field label="Address" error={errors.customerAddress?.message}>
          <input {...register('customerAddress')} className={inputCls} />
        </Field>
      </div>
    </FormSection>
  )
}

export function ItemSection({ register, errors }: { register: FormRegister; errors: FormErrors }) {
  return (
    <FormSection title="Item">
      {errors.items?.root && <p className="mb-2 text-xs text-red-600">{errors.items.root.message}</p>}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_5rem_7rem]">
        <ItemInput error={errors.items?.[0]?.name?.message}>
          <input {...register('items.0.name')} placeholder="Item name" className={inputCls} />
        </ItemInput>
        <ItemInput error={errors.items?.[0]?.quantity?.message}>
          <input type="number" {...register('items.0.quantity', { valueAsNumber: true })} placeholder="Qty" className={inputCls} />
        </ItemInput>
        <ItemInput error={errors.items?.[0]?.rate?.message}>
          <input type="number" step="0.01" {...register('items.0.rate', { valueAsNumber: true })} placeholder="Rate" className={inputCls} />
        </ItemInput>
      </div>
    </FormSection>
  )
}

function ItemInput({ error, children }: { error?: string; children: ReactNode }) {
  return (
    <div>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function TaxDiscountSection({ register, errors }: { register: FormRegister; errors: FormErrors }) {
  return (
    <FormSection title="Tax & Discount">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Tax (%)" error={errors.tax?.message}>
          <input type="number" step="0.01" {...register('tax', { valueAsNumber: true })} className={inputCls} />
        </Field>
        <Field label="Discount" error={errors.discount?.message}>
          <input type="number" step="0.01" {...register('discount', { valueAsNumber: true })} className={inputCls} />
        </Field>
      </div>
    </FormSection>
  )
}
