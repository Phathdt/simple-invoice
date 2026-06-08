import type { Meta, StoryObj } from '@storybook/react-vite'

import { StatusBadge } from '@/components/status-badge'
import { INVOICE_STATUSES, InvoiceStatus } from '@/features/invoice/invoice-status'

const meta = {
  title: 'Components/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: INVOICE_STATUSES,
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
  args: {
    status: InvoiceStatus.Pending,
  },
} satisfies Meta<typeof StatusBadge>

export default meta

type Story = StoryObj<typeof meta>

export const Draft: Story = {
  args: { status: InvoiceStatus.Draft },
}

export const Pending: Story = {
  args: { status: InvoiceStatus.Pending },
}

export const Paid: Story = {
  args: { status: InvoiceStatus.Paid },
}

export const Overdue: Story = {
  args: { status: InvoiceStatus.Overdue },
}

export const AllStatuses: Story = {
  render: () => (
    <div className='flex flex-wrap items-center gap-3'>
      {INVOICE_STATUSES.map((status) => (
        <StatusBadge key={status} status={status} />
      ))}
    </div>
  ),
}
