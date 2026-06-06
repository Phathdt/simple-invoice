import { describe, expect, it, vi } from 'vitest'

import type { User } from '../../domain/entities/user.entity'
import { UserNotFoundError } from '../../domain/errors'
import type { IUserRepository } from '../../domain/interfaces/user.repository'
import { UserService } from './user.service'

function makeRepo(user: User | null = null) {
  return {
    findById: vi.fn(async () => user),
  } as unknown as IUserRepository
}

describe('UserService', () => {
  it('findById: returns user when found', async () => {
    const testUser: User = {
      id: 'u1',
      name: 'Alice',
      email: 'alice@example.com',
      createdAt: new Date(),
    }
    const repo = makeRepo(testUser)
    const svc = new UserService(repo)

    const result = await svc.findById('u1')

    expect(result).toEqual(testUser)
    expect(repo.findById).toHaveBeenCalledWith('u1')
  })

  it('findById: throws UserNotFoundError when user is null', async () => {
    const repo = makeRepo(null)
    const svc = new UserService(repo)

    await expect(svc.findById('missing')).rejects.toBeInstanceOf(UserNotFoundError)
    expect(repo.findById).toHaveBeenCalledWith('missing')
  })
})
