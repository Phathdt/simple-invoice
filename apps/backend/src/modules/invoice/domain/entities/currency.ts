// Supported ISO 4217 currencies and their display symbols. The frontend picks a
// currency code; the symbol is derived from this map, and the backend validates
// the submitted pair matches so a mismatched code/symbol can never be stored.
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

export function symbolForCurrency(code: string): string | undefined {
  return CURRENCY_SYMBOLS[code as CurrencyCode]
}
