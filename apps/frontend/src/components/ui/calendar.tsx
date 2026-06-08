import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'

import { cn } from '@/lib/utils'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-2',
        month: 'flex flex-col gap-4',
        month_caption: 'flex justify-center pt-1 relative items-center w-full h-9 px-9',
        caption_label: 'flex items-center gap-1 text-sm font-medium',
        nav: 'flex items-center gap-1 absolute inset-x-0 top-1 z-10 justify-between px-1',
        button_previous:
          'inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-transparent text-foreground hover:bg-accent disabled:opacity-40',
        button_next:
          'inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-transparent text-foreground hover:bg-accent disabled:opacity-40',
        month_grid: 'w-full border-collapse space-x-1',
        weekdays: 'flex',
        weekday: 'text-muted-foreground rounded-md w-9 font-normal text-xs',
        week: 'flex w-full mt-2',
        day: 'h-9 w-9 text-center text-sm p-0 relative',
        day_button:
          'inline-flex h-9 w-9 items-center justify-center rounded-md p-0 font-normal hover:bg-accent hover:text-accent-foreground aria-selected:opacity-100 cursor-pointer',
        selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-md',
        today: 'bg-accent text-accent-foreground rounded-md',
        outside: 'text-muted-foreground opacity-50',
        disabled: 'text-muted-foreground opacity-50',
        hidden: 'invisible',
        dropdowns: 'flex gap-1.5 items-center justify-center',
        dropdown_root:
          'relative inline-flex items-center gap-1 rounded-md border border-input bg-background px-2 py-1 text-sm focus-within:ring-2 focus-within:ring-ring',
        dropdown: 'absolute inset-0 w-full cursor-pointer opacity-0',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...rest }) => {
          if (orientation === 'left') return <ChevronLeft className="h-4 w-4" {...rest} />
          if (orientation === 'right') return <ChevronRight className="h-4 w-4" {...rest} />
          return <ChevronDown className="h-4 w-4" {...rest} />
        },
      }}
      {...props}
    />
  )
}

export { Calendar }
