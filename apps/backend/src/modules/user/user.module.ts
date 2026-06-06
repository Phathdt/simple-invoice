import { Module } from '@nestjs/common'

import { UserService } from './application/services/user.service'
import { IUserRepository } from './domain/interfaces/user.repository'
import { IUserService } from './domain/interfaces/user.service'
import { UserController } from './infrastructure/http/user.controller'
import { UserPrismaRepository } from './infrastructure/repositories/user.prisma-repository'

@Module({
  controllers: [UserController],
  providers: [
    { provide: IUserRepository, useClass: UserPrismaRepository },
    {
      provide: IUserService,
      useFactory: (repo: IUserRepository) => new UserService(repo),
      inject: [IUserRepository],
    },
  ],
  exports: [IUserService, IUserRepository],
})
export class UserModule {}
