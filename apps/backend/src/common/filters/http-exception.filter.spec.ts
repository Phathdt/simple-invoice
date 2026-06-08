import { BadRequestException, NotFoundException } from '@nestjs/common'

import { createZodDto, ZodValidationException } from 'nestjs-zod'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { HttpExceptionFilter } from './http-exception.filter'

function makeHost() {
  const json = vi.fn()
  const status = vi.fn(() => ({ json }))
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as never
  return { host, status, json }
}

function lastBody(json: ReturnType<typeof vi.fn>) {
  return json.mock.calls[0]?.[0]
}

describe('HttpExceptionFilter', () => {
  const filter = new HttpExceptionFilter()

  it('maps Zod validation errors to a message array', () => {
    const schema = z.object({ email: z.string().email(), password: z.string().min(6) })
    class Dto extends createZodDto(schema) {}
    const parsed = Dto.schema.safeParse({ email: 'bad', password: '1' })
    const exception = new ZodValidationException((parsed as { error: z.ZodError }).error)

    const { host, status, json } = makeHost()
    filter.catch(exception, host)

    expect(status).toHaveBeenCalledWith(400)
    const body = lastBody(json)
    expect(body.statusCode).toBe(400)
    expect(body.error).toBe('Bad Request')
    expect(Array.isArray(body.message)).toBe(true)
    expect(body.message.length).toBeGreaterThan(0)
  })

  it('preserves status + message for known HttpException', () => {
    const { host, status, json } = makeHost()
    filter.catch(new NotFoundException('Invoice not found'), host)

    expect(status).toHaveBeenCalledWith(404)
    const body = lastBody(json)
    expect(body.statusCode).toBe(404)
    expect(body.message).toBe('Invoice not found')
    expect(body.error).toBe('Not Found')
  })

  it('keeps array message from BadRequestException intact', () => {
    const { host, json } = makeHost()
    filter.catch(new BadRequestException(['a must be set', 'b must be set']), host)

    const body = lastBody(json)
    expect(body.message).toEqual(['a must be set', 'b must be set'])
  })

  it('returns opaque 500 for unknown errors without leaking details', () => {
    const { host, status, json } = makeHost()
    filter.catch(new Error('database exploded with secret connection string'), host)

    expect(status).toHaveBeenCalledWith(500)
    const body = lastBody(json)
    expect(body).toEqual({
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error',
    })
    expect(JSON.stringify(body)).not.toContain('secret')
  })
})
