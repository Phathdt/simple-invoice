import { IUserRepository } from '@modules/user'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule, JwtService } from '@nestjs/jwt'

import { UserModule } from '../user/user.module'
import { AuthService } from './application/services/auth.service'
import { IAuthService } from './domain/interfaces/auth.service'
import { ITokenSigner } from './domain/interfaces/token-signer'
import { AuthController } from './infrastructure/http/auth.controller'
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard'
import { JwtTokenSigner } from './infrastructure/token/jwt-token-signer'

@Module({
  controllers: [AuthController],
  imports: [
    UserModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET')
        const isProd = config.get('NODE_ENV') === 'production'
        // In production, reject a missing or known-weak placeholder secret —
        // a guessable secret lets anyone forge valid tokens.
        const weakSecrets = ['change-me', 'change-me-in-prod']
        if (isProd && (!secret || weakSecrets.includes(secret))) {
          throw new Error('A strong JWT_SECRET environment variable is required in production')
        }
        const expiresIn = Number(config.get('JWT_EXPIRES_IN')) || 3600
        return {
          secret: secret ?? 'change-me',
          signOptions: { expiresIn },
        }
      },
      global: true,
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: ITokenSigner,
      useFactory: (jwt: JwtService) => new JwtTokenSigner(jwt),
      inject: [JwtService],
    },
    {
      provide: IAuthService,
      useFactory: (users: IUserRepository, tokens: ITokenSigner) => new AuthService(users, tokens),
      inject: [IUserRepository, ITokenSigner],
    },
  ],
  exports: [IAuthService, JwtModule],
})
export class AuthModule {}
