import type { User } from '../entities/user.entity'

export abstract class IUserService {
  abstract findById(id: string): Promise<User>
}
