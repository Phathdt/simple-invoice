import { lastValueFrom, of } from 'rxjs'
import { describe, expect, it } from 'vitest'

import { ResponseEnvelopeInterceptor } from './response-envelope.interceptor'

function run(payload: unknown) {
  const interceptor = new ResponseEnvelopeInterceptor()
  const next = { handle: () => of(payload) }
  return lastValueFrom(interceptor.intercept({} as never, next))
}

describe('ResponseEnvelopeInterceptor', () => {
  it('wraps a plain object in { data }', async () => {
    const result = await run({ id: 'u1', email: 'a@b.c' })
    expect(result).toEqual({ data: { id: 'u1', email: 'a@b.c' } })
  })

  it('wraps primitives and arrays in { data }', async () => {
    expect(await run('hello')).toEqual({ data: 'hello' })
    expect(await run([1, 2, 3])).toEqual({ data: [1, 2, 3] })
  })

  it('passes through an already-paginated payload without double-wrapping', async () => {
    const paginated = { data: [{ id: 1 }], paging: { page: 1, pageSize: 10, total: 1 } }
    expect(await run(paginated)).toBe(paginated)
  })

  it('wraps null in { data }', async () => {
    expect(await run(null)).toEqual({ data: null })
  })
})
