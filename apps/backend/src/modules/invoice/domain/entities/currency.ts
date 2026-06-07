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

// All invoice amounts are normalized to this currency for cross-currency
// sorting/reporting; original amount + symbol stay untouched for display.
export const BASE_CURRENCY = 'USD'

// USD-relative static rates: 1 unit of currency = N USD. Approximate,
// demo-only — not a live FX feed. Must cover every key in CURRENCY_SYMBOLS.
export const EXCHANGE_RATES_TO_USD: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  AUD: 0.66,
  VND: 0.00004,
  SGD: 0.74,
  JPY: 0.0064,
}

export function rateToBase(code: string): number | undefined {
  // Own-property guard: a bare lookup would return Object.prototype members
  // (e.g. rateToBase('toString')) and poison `amount * rate` into NaN.
  return Object.prototype.hasOwnProperty.call(EXCHANGE_RATES_TO_USD, code)
    ? EXCHANGE_RATES_TO_USD[code as CurrencyCode]
    : undefined
}
