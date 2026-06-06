import type { ReactNode } from 'react'
import type { FieldErrors, UseFieldArrayReturn, UseFormRegister } from 'react-hook-form'

import type { CreateInvoiceForm } from './create-invoice-form-schema'

type FormRegister = UseFormRegister<CreateInvoiceForm>
type FormErrors = FieldErrors<CreateInvoiceForm>
type ItemArray = UseFieldArrayReturn<CreateInvoiceForm, 'items'>

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

export function ItemsSection({ register, errors, fieldArray }: { register: FormRegister; errors: FormErrors; fieldArray: ItemArray }) {
  const { fields, append, remove } = fieldArray
  return (
    <FormSection title="Items">
      <div className="-mt-8 mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => append({ name: '', quantity: 1, rate: 0 })}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-blue-600 transition-colors duration-150 hover:bg-blue-50 focus:outline-none focus:ring-3 focus:ring-blue-500/20"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          + Add item
        </button>
      </div>
      {errors.items?.root && <p className="mb-2 text-xs text-red-600">{errors.items.root.message}</p>}
      <div className="space-y-3">
        {fields.map((field, i) => (
          <div key={field.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_5rem_7rem_2.75rem]">
            <ItemInput error={errors.items?.[i]?.name?.message}>
              <input {...register(`items.${i}.name`)} placeholder="Item name" className={inputCls} />
            </ItemInput>
            <ItemInput error={errors.items?.[i]?.quantity?.message}>
              <input type="number" {...register(`items.${i}.quantity`, { valueAsNumber: true })} placeholder="Qty" className={inputCls} />
            </ItemInput>
            <ItemInput error={errors.items?.[i]?.rate?.message}>
              <input type="number" step="0.01" {...register(`items.${i}.rate`, { valueAsNumber: true })} placeholder="Rate" className={inputCls} />
            </ItemInput>
            {fields.length > 1 && <RemoveItemButton onClick={() => remove(i)} />}
          </div>
        ))}
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

function RemoveItemButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Remove item"
      onClick={onClick}
      className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-red-500 transition-colors duration-150 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-3 focus:ring-red-500/20"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
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
