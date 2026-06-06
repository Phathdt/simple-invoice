import { IUserRepository, UserNotFoundError, type User } from '@modules/user'

import { compare, hash } from 'bcryptjs'

import { LoginInput } from '../../domain/dto/login.input'
import { RegisterInput } from '../../domain/dto/register.input'
import { EmailAlreadyRegisteredError, InvalidCredentialsError } from '../../domain/errors'
import { AuthSession, IAuthService } from '../../domain/interfaces/auth.service'
import { ITokenSigner } from '../../domain/interfaces/token-signer'

export class AuthService implements IAuthService {
  constructor(
    private readonly users: IUserRepository,
    private readonly tokens: ITokenSigner,
  ) {}

  async register(input: RegisterInput): Promise<AuthSession> {
    const existing = await this.users.findByEmail(input.email)
    if (existing) throw new EmailAlreadyRegisteredError()

    const passwordHash = await hash(input.password, 10)
    const user = await this.users.create({ fullName: input.fullName, email: input.email, passwordHash })
    return this.sign(user)
  }

  async login(input: LoginInput): Promise<AuthSession> {
    const creds = await this.users.findCredentialsByEmail(input.email)
    if (!creds) throw new InvalidCredentialsError()

    const ok = await compare(input.password, creds.passwordHash)
    if (!ok) throw new InvalidCredentialsError()

    return this.sign(creds)
  }

  async me(userId: string): Promise<User> {
    const user = await this.users.findById(userId)
    if (!user) throw new UserNotFoundError(userId)
    return user
  }

  private sign(user: { id: string; email: string; fullName: string; createdAt: Date }): AuthSession {
    const token = this.tokens.sign({ sub: user.id, email: user.email })
    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
      },
    }
  }
}
