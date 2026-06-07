import { PrismaService } from '@modules/prisma'
import { Injectable } from '@nestjs/common'

import type { User as PrismaUser } from '../../../../generated/prisma/client'
import type { User, UserCredentials } from '../../domain/entities/user.entity'
import { IUserRepository } from '../../domain/interfaces/user.repository'

function toUser(row: PrismaUser): User {
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    createdAt: row.createdAt,
  }
}

function toCredentials(row: PrismaUser): UserCredentials {
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    passwordHash: row.passwordHash,
    createdAt: row.createdAt,
  }
}

@Injectable()
export class UserPrismaRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } })
    return row ? toUser(row) : null
  }

  async findByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) return []
    const rows = await this.prisma.user.findMany({ where: { id: { in: ids } } })
    return rows.map(toUser)
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } })
    return row ? toUser(row) : null
  }

  async findCredentialsByEmail(email: string): Promise<UserCredentials | null> {
    const row = await this.prisma.user.findUnique({ where: { email } })
    return row ? toCredentials(row) : null
  }

  async create(data: { fullName: string; email: string; passwordHash: string }): Promise<User> {
    const row = await this.prisma.user.create({ data })
    return toUser(row)
  }
}
