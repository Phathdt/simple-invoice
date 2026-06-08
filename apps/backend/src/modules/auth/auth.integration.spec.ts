import { type INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'

import { ZodValidationPipe } from 'nestjs-zod'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { CommonModule } from '../../common/common.module'
import { startPostgres, stopPostgres } from '../../test-utils/setup-postgres'
import { PrismaModule } from '../prisma/prisma.module'
import { AuthModule } from './auth.module'
import { IAuthService } from './domain/interfaces/auth.service'

describe('AuthService (integration)', () => {
  let moduleRef: TestingModule
  let app: INestApplication
  let auth: IAuthService

  beforeAll(async () => {
    await startPostgres()
    process.env.JWT_SECRET = 'test-secret'
    moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), CommonModule, PrismaModule, AuthModule],
    }).compile()
    auth = moduleRef.get(IAuthService)

    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ZodValidationPipe())
    await app.init()
  })

  afterAll(async () => {
    await app?.close()
    await moduleRef?.close()
    await stopPostgres()
  })

  it('registers a new user and returns JWT', async () => {
    const email = `new-${Date.now()}@simple-invoice.test`
    const result = await auth.register({ fullName: 'New', email, password: 'password123' })
    expect(result.token).toMatch(/^eyJ/)
    expect(result.user.email).toBe(email)
    expect(result.user.fullName).toBe('New')
  })

  it('rejects duplicate email', async () => {
    const email = `dup-${Date.now()}@simple-invoice.test`
    await auth.register({ fullName: 'A', email, password: 'password123' })
    await expect(auth.register({ fullName: 'B', email, password: 'password123' })).rejects.toThrow(/already/i)
  })

  it('logs in with correct password', async () => {
    const email = `login-${Date.now()}@simple-invoice.test`
    await auth.register({ fullName: 'L', email, password: 'password123' })
    const result = await auth.login({ email, password: 'password123' })
    expect(result.token).toMatch(/^eyJ/)
  })

  it('rejects login with wrong password', async () => {
    const email = `wrong-${Date.now()}@simple-invoice.test`
    await auth.register({ fullName: 'W', email, password: 'password123' })
    await expect(auth.login({ email, password: 'wrongpass' })).rejects.toThrow(/invalid/i)
  })

  it('GET /auth/me with valid token returns current user', async () => {
    const email = `me-${Date.now()}@simple-invoice.test`
    const { token } = await auth.register({ fullName: 'Me', email, password: 'password123' })

    const res = await request(app.getHttpServer()).get('/auth/me').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.email).toBe(email)
    expect(res.body.data.fullName).toBe('Me')
    expect(res.body.data).not.toHaveProperty('passwordHash')
  })

  it('GET /auth/me without token returns 401', async () => {
    const res = await request(app.getHttpServer()).get('/auth/me')
    expect(res.status).toBe(401)
  })

  it('GET /auth/me with invalid token returns 401', async () => {
    const res = await request(app.getHttpServer()).get('/auth/me').set('Authorization', 'Bearer not-a-real-token')
    expect(res.status).toBe(401)
  })

  it('POST /auth/login is public (no token required)', async () => {
    const email = `pub-${Date.now()}@simple-invoice.test`
    await auth.register({ fullName: 'Pub', email, password: 'password123' })

    const res = await request(app.getHttpServer()).post('/auth/login').send({ email, password: 'password123' })

    expect(res.status).toBe(201)
    expect(res.body.data.token).toMatch(/^eyJ/)
  })

  it('returns PRD-shaped error envelope on invalid login', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nobody@simple-invoice.test', password: 'password123' })

    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ statusCode: 401, error: expect.any(String) })
    expect(res.body).not.toHaveProperty('data')
  })

  it('returns validation errors as a message array', async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({ email: 'not-an-email', password: '123' })

    expect(res.status).toBe(400)
    expect(res.body.statusCode).toBe(400)
    expect(res.body.error).toBe('Bad Request')
    expect(Array.isArray(res.body.message)).toBe(true)
    expect(res.body.message.length).toBeGreaterThan(0)
  })
})
