import { Test, type TestingModule } from '@nestjs/testing'

import { startPostgres, stopPostgres } from 'src/test-utils/setup-postgres'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { PrismaModule } from '../../../prisma/prisma.module'
import { PrismaService } from '../../../prisma/prisma.service'
import { IUserRepository } from '../../domain/interfaces/user.repository'
import { UserModule } from '../../user.module'

describe('UserPrismaRepository (integration)', () => {
  let moduleRef: TestingModule
  let repo: IUserRepository
  let prisma: PrismaService

  beforeAll(async () => {
    await startPostgres()
    moduleRef = await Test.createTestingModule({
      imports: [PrismaModule, UserModule],
    }).compile()
    prisma = moduleRef.get(PrismaService)
    repo = moduleRef.get(IUserRepository)
  })

  afterAll(async () => {
    await moduleRef?.close()
    await stopPostgres()
  })

  describe('findById', () => {
    it('returns mapped user without password hash', async () => {
      const row = await prisma.user.create({
        data: { fullName: 'find-me', email: `find-${Date.now()}@t.dev`, passwordHash: 'secret-hash' },
      })
      const user = await repo.findById(row.id)
      expect(user).toMatchObject({ id: row.id, fullName: 'find-me' })
      expect((user as unknown as Record<string, unknown>).passwordHash).toBeUndefined()
    })

    it('returns null on missing id', async () => {
      const result = await repo.findById('00000000-0000-0000-0000-000000000000')
      expect(result).toBeNull()
    })
  })

  describe('findByIds', () => {
    it('returns users matching the given ids without password hash', async () => {
      const stamp = Date.now()
      const a = await prisma.user.create({ data: { fullName: 'a', email: `bulk-a-${stamp}@t.dev`, passwordHash: 'h' } })
      const b = await prisma.user.create({ data: { fullName: 'b', email: `bulk-b-${stamp}@t.dev`, passwordHash: 'h' } })
      const users = await repo.findByIds([a.id, b.id])
      const ids = users.map((u) => u.id).sort()
      expect(ids).toEqual([a.id, b.id].sort())
      expect((users[0] as unknown as Record<string, unknown>).passwordHash).toBeUndefined()
    })

    it('skips ids that do not exist', async () => {
      const a = await prisma.user.create({
        data: { fullName: 'partial', email: `partial-${Date.now()}@t.dev`, passwordHash: 'h' },
      })
      const users = await repo.findByIds([a.id, '00000000-0000-0000-0000-000000000000'])
      expect(users).toHaveLength(1)
      expect(users[0].id).toBe(a.id)
    })

    it('returns empty array for empty input without hitting db', async () => {
      expect(await repo.findByIds([])).toEqual([])
    })
  })

  describe('findByEmail', () => {
    it('returns user without password hash', async () => {
      const email = `email-${Date.now()}@t.dev`
      await prisma.user.create({ data: { fullName: 'a', email, passwordHash: 'h' } })
      const user = await repo.findByEmail(email)
      expect(user?.email).toBe(email)
      expect((user as unknown as Record<string, unknown>).passwordHash).toBeUndefined()
    })

    it('returns null when email not registered', async () => {
      expect(await repo.findByEmail('nope@nope.test')).toBeNull()
    })
  })

  describe('findCredentialsByEmail', () => {
    it('returns credentials including password hash', async () => {
      const email = `cred-${Date.now()}@t.dev`
      await prisma.user.create({ data: { fullName: 'b', email, passwordHash: 'hashed-xyz' } })
      const creds = await repo.findCredentialsByEmail(email)
      expect(creds?.passwordHash).toBe('hashed-xyz')
      expect(creds?.email).toBe(email)
    })

    it('returns null on missing email', async () => {
      expect(await repo.findCredentialsByEmail('missing@nope.test')).toBeNull()
    })
  })

  describe('create', () => {
    it('persists row and returns mapped user without password hash', async () => {
      const email = `create-${Date.now()}@t.dev`
      const user = await repo.create({ fullName: 'new', email, passwordHash: 'pw-hash' })
      expect(user).toMatchObject({ fullName: 'new', email })
      expect((user as unknown as Record<string, unknown>).passwordHash).toBeUndefined()

      const row = await prisma.user.findUnique({ where: { id: user.id } })
      expect(row?.passwordHash).toBe('pw-hash')
    })
  })
})
