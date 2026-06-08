import type { ReactNode } from 'react'

import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import { Controller, type Control, type FieldErrors, type UseFormRegister, type UseFormSetValue } from 'react-hook-form'

import type { CreateInvoiceForm } from './create-invoice-form-schema'
import { CURRENCY_CODES, symbolForCurrency } from './currency'

type FormRegister = UseFormRegister<CreateInvoiceForm>
type FormErrors = FieldErrors<CreateInvoiceForm>
type FormSetValue = UseFormSetValue<CreateInvoiceForm>
type FormControl = Control<CreateInvoiceForm>

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className='space-y-1.5'>
      <Label>{label}</Label>
      {children}
      {error && <p className='text-xs text-destructive'>{error}</p>}
    </div>
  )
}

// Currency uses the shadcn Select (Radix); the derived symbol is a read-only Input.
function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardContent className='p-5'>
        <CardTitle className='mb-4'>{title}</CardTitle>
        {children}
      </CardContent>
    </Card>
  )
}

export function InvoiceDetailsSection({
  register,
  control,
  errors,
  setValue,
}: {
  register: FormRegister
  control: FormControl
  errors: FormErrors
  setValue: FormSetValue
}) {
  return (
    <FormSection title='Invoice details'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <Field label='Invoice number *' error={errors.invoiceNumber?.message}>
          <Input {...register('invoiceNumber')} />
        </Field>
        <Field label='Reference' error={errors.invoiceReference?.message}>
          <Input {...register('invoiceReference')} />
        </Field>
        <Field label='Invoice date *' error={errors.invoiceDate?.message}>
          <Controller
            control={control}
            name='invoiceDate'
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                data-testid='invoice-date-picker'
                aria-label='Invoice date'
              />
            )}
          />
        </Field>
        <Field label='Due date *' error={errors.dueDate?.message}>
          <Controller
            control={control}
            name='dueDate'
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                data-testid='due-date-picker'
                aria-label='Due date'
              />
            )}
          />
        </Field>
        <Field label='Currency *' error={errors.currency?.message}>
          <Controller
            control={control}
            name='currency'
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={(value) => {
                  field.onChange(value)
                  setValue('currencySymbol', symbolForCurrency(value), { shouldValidate: true })
                }}
              >
                <SelectTrigger name='currency' aria-label='Currency'>
                  <SelectValue placeholder='Select currency' />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_CODES.map((code) => (
                    <SelectItem key={code} value={code}>
                      {code} ({symbolForCurrency(code)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label='Currency symbol' error={errors.currencySymbol?.message}>
          {/* Derived from the selected currency via setValue; read-only so the pair can't drift. */}
          <Input {...register('currencySymbol')} readOnly placeholder='—' />
        </Field>
        <div className='sm:col-span-2'>
          <Field label='Description' error={errors.description?.message}>
            <Textarea {...register('description')} rows={2} />
          </Field>
        </div>
      </div>
    </FormSection>
  )
}

export function CustomerSection({ register, errors }: { register: FormRegister; errors: FormErrors }) {
  return (
    <FormSection title='Customer'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <Field label='Name *' error={errors.customerName?.message}>
          <Input {...register('customerName')} />
        </Field>
        <Field label='Email *' error={errors.customerEmail?.message}>
          <Input type='email' {...register('customerEmail')} />
        </Field>
        <Field label='Phone' error={errors.customerMobile?.message}>
          <Input {...register('customerMobile')} />
        </Field>
        <Field label='Address' error={errors.customerAddress?.message}>
          <Input {...register('customerAddress')} />
        </Field>
      </div>
    </FormSection>
  )
}

export function ItemSection({ register, errors }: { register: FormRegister; errors: FormErrors }) {
  return (
    <FormSection title='Item'>
      {errors.items?.root && <p className='mb-2 text-xs text-destructive'>{errors.items.root.message}</p>}
      <div className='grid grid-cols-1 gap-2 sm:grid-cols-[1fr_5rem_7rem]'>
        <ItemInput error={errors.items?.[0]?.name?.message}>
          <Input {...register('items.0.name')} placeholder='Item name' />
        </ItemInput>
        <ItemInput error={errors.items?.[0]?.quantity?.message}>
          <Input type='number' {...register('items.0.quantity', { valueAsNumber: true })} placeholder='Qty' />
        </ItemInput>
        <ItemInput error={errors.items?.[0]?.rate?.message}>
          <Input type='number' step='0.01' {...register('items.0.rate', { valueAsNumber: true })} placeholder='Rate' />
        </ItemInput>
      </div>
    </FormSection>
  )
}

function ItemInput({ error, children }: { error?: string; children: ReactNode }) {
  return (
    <div className={cn('space-y-1.5')}>
      {children}
      {error && <p className='text-xs text-destructive'>{error}</p>}
    </div>
  )
}

export function TaxDiscountSection({ register, errors }: { register: FormRegister; errors: FormErrors }) {
  return (
    <FormSection title='Tax & Discount'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <Field label='Tax (%)' error={errors.tax?.message}>
          <Input type='number' step='0.01' {...register('tax', { valueAsNumber: true })} />
        </Field>
        <Field label='Discount' error={errors.discount?.message}>
          <Input type='number' step='0.01' {...register('discount', { valueAsNumber: true })} />
        </Field>
      </div>
    </FormSection>
  )
}
