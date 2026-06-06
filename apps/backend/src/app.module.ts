import { Module } from '@nestjs/common'

import { LoggerModule } from 'nestjs-pino'

import { loggerConfig } from './logger.config'
import { AuthModule } from './modules/auth/auth.module'
import { PrismaModule } from './modules/prisma/prisma.module'
import { UserModule } from './modules/user/user.module'

@Module({
  imports: [
    LoggerModule.forRoot(loggerConfig),
    PrismaModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
