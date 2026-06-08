import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { LoggerModule } from 'nestjs-pino'

import { CommonModule } from './common/common.module'
import { buildLoggerConfig } from './logger.config'
import { AuthModule } from './modules/auth/auth.module'
import { InvoiceModule } from './modules/invoice/invoice.module'
import { PrismaModule } from './modules/prisma/prisma.module'
import { UserModule } from './modules/user/user.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => buildLoggerConfig(config),
    }),
    CommonModule,
    PrismaModule,
    UserModule,
    AuthModule,
    InvoiceModule,
  ],
})
export class AppModule {}
