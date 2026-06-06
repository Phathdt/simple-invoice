function statusClasses(status: string): string {
  switch (status) {
    case 'Paid':
      return 'bg-green-100 text-green-800'
    case 'Overdue':
      return 'bg-red-100 text-red-800'
    case 'Pending':
      return 'bg-amber-100 text-amber-800'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

export function StatusBadge({ status, size = 'sm' }: { status: string; size?: 'sm' | 'md' }) {
  const sizing = size === 'md' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs'
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizing} ${statusClasses(status)}`}>
      {status}
    </span>
  )
}
