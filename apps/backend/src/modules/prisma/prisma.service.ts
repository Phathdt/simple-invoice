import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'

import { incrementQueryCount, requestContext } from '../../common/request-context'
import { PrismaClient } from '../../generated/prisma/client'

interface PrismaQueryEvent {
  query: string
  params: string
  duration: number
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly sqlLogger = new Logger('PrismaSQL')
  private readonly isProd: boolean
  private readonly logSql: boolean

  constructor(config: ConfigService) {
    const isProd = config.get<string>('NODE_ENV') === 'production'
    const adapter = new PrismaPg({
      connectionString: config.get<string>('DATABASE_URL'),
    })
    super({
      adapter,
      log: isProd
        ? ['error']
        : [
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'warn' },
            { emit: 'stdout', level: 'error' },
          ],
    })
    this.isProd = isProd
    this.logSql = config.get<string>('LOG_SQL') === '1'
  }

  async onModuleInit() {
    // @ts-expect-error — generated client types $on with the runtime log config
    this.$on('query', (e: PrismaQueryEvent) => {
      incrementQueryCount()
      if (this.isProd && !this.logSql) return

      const stats = requestContext.getStore()
      const seq = stats ? `#${stats.queryCount}` : ''
      const dl = stats ? (stats.dataLoaderEnabled ? 'dl=on' : 'dl=off') : ''
      const params = e.params.length > 200 ? `${e.params.slice(0, 200)}…` : e.params
      this.sqlLogger.debug(`${seq} ${dl} (${e.duration}ms) ${e.query} -- params=${params}`)
    })
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
