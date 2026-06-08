import { format, parse } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const ISO_FORMAT = 'yyyy-MM-dd'

// Parse/format helpers keep the public value as an ISO yyyy-MM-dd string so the
// form schema and API contract stay unchanged (dates compared as strings).
function isoToDate(value?: string): Date | undefined {
  if (!value) return undefined
  const parsed = parse(value, ISO_FORMAT, new Date())
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

interface DatePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  'data-testid'?: string
  'aria-label'?: string
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  className,
  ...rest
}: DatePickerProps) {
  const selected = isoToDate(value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          data-testid={rest['data-testid']}
          aria-label={rest['aria-label']}
          className={cn('w-full justify-start font-normal', !selected && 'text-muted-foreground', className)}
        >
          <CalendarIcon className="opacity-60" />
          {selected ? format(selected, ISO_FORMAT) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          startMonth={new Date(2000, 0)}
          endMonth={new Date(2100, 11)}
          defaultMonth={selected}
          selected={selected}
          onSelect={(date) => onChange(date ? format(date, ISO_FORMAT) : '')}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
