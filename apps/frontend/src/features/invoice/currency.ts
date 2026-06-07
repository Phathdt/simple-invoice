// ISO 4217 currencies offered in the create form. The symbol is derived from the
// selected code so the two can never disagree. Mirrors the backend currency map.
export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
  VND: '₫',
  SGD: 'S$',
  JPY: '¥',
} as const

export type CurrencyCode = keyof typeof CURRENCY_SYMBOLS

export const CURRENCY_CODES = Object.keys(CURRENCY_SYMBOLS) as CurrencyCode[]

export function symbolForCurrency(code: string): string {
  return CURRENCY_SYMBOLS[code as CurrencyCode] ?? ''
}
