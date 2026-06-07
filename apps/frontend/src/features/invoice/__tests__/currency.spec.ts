import { describe, expect, it } from 'vitest'

import { formatMoney, symbolForCurrency } from '../currency'

describe('formatMoney', () => {
  it('uses 2 decimals for USD', () => {
    expect(formatMoney(1109961.15, 'USD', '$')).toBe('$1,109,961.15')
  })

  it('uses no decimals and a trailing symbol for VND', () => {
    expect(formatMoney(1109961.15, 'VND', '₫')).toBe('1,109,961 ₫')
  })

  it('uses no decimals for JPY', () => {
    expect(formatMoney(2500, 'JPY', '¥')).toBe('¥2,500')
  })

  it('falls back to 2 decimals for unknown currency', () => {
    expect(formatMoney(10, 'XXX', '')).toBe('10.00')
  })
})

describe('symbolForCurrency', () => {
  it('maps known codes', () => {
    expect(symbolForCurrency('USD')).toBe('$')
    expect(symbolForCurrency('VND')).toBe('₫')
  })

  it('returns empty for unknown code', () => {
    expect(symbolForCurrency('XXX')).toBe('')
  })
})
