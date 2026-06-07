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

// Currencies without minor units (no decimal places).
const ZERO_DECIMAL_CURRENCIES = new Set<string>(['VND', 'JPY'])

// Currencies that display the symbol after the amount (e.g. 1.109.961 ₫).
const SUFFIX_SYMBOL_CURRENCIES = new Set<string>(['VND'])

// Locale used for number grouping per currency (VND uses dot separators).
const CURRENCY_LOCALES: Record<string, string> = {
  VND: 'vi-VN',
}

function fractionDigits(code: string): number {
  return ZERO_DECIMAL_CURRENCIES.has(code) ? 0 : 2
}

// Formats an amount using the persisted symbol, the currency's decimal rules
// (e.g. VND/JPY have no decimals), locale-aware grouping, and symbol placement
// (VND trails the amount).
export function formatMoney(amount: number, currency: string, symbol: string): string {
  const digits = fractionDigits(currency)
  const locale = CURRENCY_LOCALES[currency] ?? 'en-US'
  const formatted = amount.toLocaleString(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
  return SUFFIX_SYMBOL_CURRENCIES.has(currency) ? `${formatted} ${symbol}` : `${symbol}${formatted}`
}

