import { ConfigService } from '@nestjs/config'

import type { Params } from 'nestjs-pino'

export function buildLoggerConfig(config: ConfigService): Params {
  const isProd = config.get<string>('NODE_ENV') === 'production'
  const level = config.get<string>('LOG_LEVEL') ?? (isProd ? 'info' : 'debug')

  return {
    pinoHttp: {
      level,
      transport: isProd
        ? undefined
        : {
            target: 'pino-pretty',
            options: {
              singleLine: true,
              colorize: true,
              translateTime: 'SYS:HH:MM:ss.l',
              ignore: 'pid,hostname,req,res,responseTime',
            },
          },
      redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie'],
        censor: '[REDACTED]',
      },
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return 'error'
        if (res.statusCode >= 400) return 'warn'
        return 'info'
      },
      customSuccessMessage: (req, res) => {
        return `${req.method} ${req.url} -> ${res.statusCode}`
      },
      customErrorMessage: (req, res) => {
        return `${req.method} ${req.url} -> ${res.statusCode}`
      },
    },
  }
}
