// Invoice statuses shown in the UI. Draft/Pending/Paid are persisted by the
// backend; Overdue is derived at read time. Mirrors the backend enum.
export enum InvoiceStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Paid = 'Paid',
  Overdue = 'Overdue',
}

// Persisted + derived statuses a user can filter the list by.
export const INVOICE_STATUSES = [
  InvoiceStatus.Draft,
  InvoiceStatus.Pending,
  InvoiceStatus.Paid,
  InvoiceStatus.Overdue,
] as const
