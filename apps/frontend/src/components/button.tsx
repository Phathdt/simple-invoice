import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { Button as UiButton } from '@/components/ui/button'

type Variant = 'primary' | 'secondary' | 'ghost'

// Maps the app's original variant names onto shadcn button variants so existing
// call sites keep working after the shadcn migration.
const variantMap: Record<Variant, 'default' | 'outline' | 'ghost'> = {
  primary: 'default',
  secondary: 'outline',
  ghost: 'ghost',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
}

export function Button({ variant = 'primary', children, ...props }: ButtonProps) {
  return (
    <UiButton variant={variantMap[variant]} {...props}>
      {children}
    </UiButton>
  )
}

export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox='0 0 24 24' fill='none'>
      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
    </svg>
  )
}
