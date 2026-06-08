import { Badge } from '@/components/ui/badge'
import { InvoiceStatus } from '@/features/invoice/invoice-status'

function variantForStatus(status: string): 'default' | 'success' | 'warning' | 'danger' {
  switch (status) {
    case InvoiceStatus.Paid:
      return 'success'
    case InvoiceStatus.Overdue:
      return 'danger'
    case InvoiceStatus.Pending:
      return 'warning'
    default:
      return 'default'
  }
}

export function StatusBadge({ status, size = 'sm' }: { status: string; size?: 'sm' | 'md' }) {
  return (
    <Badge data-testid='status-badge' variant={variantForStatus(status)} size={size}>
      {status}
    </Badge>
  )
}
