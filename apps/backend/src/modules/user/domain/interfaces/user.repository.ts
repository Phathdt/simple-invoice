import type { User, UserCredentials } from '../entities/user.entity'

export abstract class IUserRepository {
  abstract findById(id: string): Promise<User | null>
  abstract findByIds(ids: string[]): Promise<User[]>
  abstract findByEmail(email: string): Promise<User | null>
  abstract findCredentialsByEmail(email: string): Promise<UserCredentials | null>
  abstract create(data: { fullName: string; email: string; passwordHash: string }): Promise<User>
}
