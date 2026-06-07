import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'

export function BrandLogo({ centered = false }: { centered?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${centered ? 'flex-col text-center' : ''}`}>
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
        <svg className="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <span className="text-lg font-bold tracking-tight text-foreground">SimpleInvoice</span>
    </div>
  )
}

export function AppHeader({ actions }: { actions?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-8">
        <Link to="/" className="no-underline">
          <BrandLogo />
        </Link>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
