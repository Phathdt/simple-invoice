// Persisted invoice statuses (Draft, Pending, Paid). `Overdue` is never stored —
// it is derived at read time, so it is kept in a separate union for display.
export enum InvoiceStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Paid = 'Paid',
}

export const OVERDUE_STATUS = 'Overdue' as const

export type InvoiceDisplayStatus = InvoiceStatus | typeof OVERDUE_STATUS
