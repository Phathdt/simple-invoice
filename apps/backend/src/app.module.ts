import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { LoggerModule } from 'nestjs-pino'

import { loggerConfig } from './logger.config'
import { CommonModule } from './common/common.module'
import { AuthModule } from './modules/auth/auth.module'
import { InvoiceModule } from './modules/invoice/invoice.module'
import { PrismaModule } from './modules/prisma/prisma.module'
import { UserModule } from './modules/user/user.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot(loggerConfig),
    CommonModule,
    PrismaModule,
    UserModule,
    AuthModule,
    InvoiceModule,
  ],
})
export class AppModule {}
