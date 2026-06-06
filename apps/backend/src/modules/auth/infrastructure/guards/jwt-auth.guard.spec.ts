import { UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { JwtAuthGuard } from './jwt-auth.guard'

function makeContext(authHeader?: string, handler = () => {}, cls = class {}) {
  const request: { headers: { authorization?: string }; user?: unknown } = {
    headers: authHeader ? { authorization: authHeader } : {},
  }
  return {
    ctx: {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => handler,
      getClass: () => cls,
    } as never,
    request,
  }
}

function makeGuard(verifyImpl?: () => unknown, isPublic = false) {
  const jwt = { verifyAsync: vi.fn(verifyImpl ?? (() => ({ sub: 'u1', email: 'a@b.c' }))) } as unknown as JwtService
  const reflector = { getAllAndOverride: vi.fn(() => isPublic) } as unknown as Reflector
  return { guard: new JwtAuthGuard(jwt, reflector), jwt }
}

describe('JwtAuthGuard', () => {
  beforeEach(() => vi.clearAllMocks())

  it('allows public routes without token', async () => {
    const { guard } = makeGuard(undefined, true)
    const { ctx } = makeContext()
    await expect(guard.canActivate(ctx)).resolves.toBe(true)
  })

  it('attaches decoded payload to request.user on valid token', async () => {
    const { guard } = makeGuard(() => ({ sub: 'u1', email: 'a@b.c' }))
    const { ctx, request } = makeContext('Bearer valid-token')
    await expect(guard.canActivate(ctx)).resolves.toBe(true)
    expect(request.user).toEqual({ sub: 'u1', email: 'a@b.c' })
  })

  it('throws UnauthorizedException when Authorization header missing', async () => {
    const { guard } = makeGuard()
    const { ctx } = makeContext()
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('throws UnauthorizedException when token invalid/expired', async () => {
    const { guard } = makeGuard(() => {
      throw new Error('expired')
    })
    const { ctx } = makeContext('Bearer bad-token')
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('throws UnauthorizedException when scheme is not Bearer', async () => {
    const { guard } = makeGuard()
    const { ctx } = makeContext('Basic abc')
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException)
  })
})
