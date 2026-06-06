import { Test, type TestingModule } from '@nestjs/testing'

import { startPostgres, stopPostgres } from 'src/test-utils/setup-postgres'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { PrismaModule } from '../prisma/prisma.module'
import { PrismaService } from '../prisma/prisma.service'
import { IUserService } from './domain/interfaces/user.service'
import { UserModule } from './user.module'

describe('Domain services (integration)', () => {
  let moduleRef: TestingModule
  let prisma: PrismaService
  let users: IUserService

  let alice: { id: string }
  let bob: { id: string }

  beforeAll(async () => {
    await startPostgres()
    moduleRef = await Test.createTestingModule({
      imports: [PrismaModule, UserModule],
    }).compile()
    prisma = moduleRef.get(PrismaService)
    users = moduleRef.get(IUserService)

    alice = await prisma.user.create({
      data: { name: 'alice', email: 'alice@d.test', password: 'x' },
    })
    bob = await prisma.user.create({
      data: { name: 'bob', email: 'bob@d.test', password: 'x' },
    })
  })

  afterAll(async () => {
    await moduleRef?.close()
    await stopPostgres()
  })

  describe('UserService', () => {
    it('findById returns user', async () => {
      const u = await users.findById(alice.id)
      expect(u.name).toBe('alice')
    })

    it('findById throws NotFoundException on missing', async () => {
      await expect(users.findById('00000000-0000-0000-0000-000000000000')).rejects.toThrow(/not found/i)
    })
  })
})
