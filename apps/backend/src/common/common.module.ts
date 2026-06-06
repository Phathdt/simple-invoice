import { Module } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'

import { HttpExceptionFilter } from './filters/http-exception.filter'
import { HealthController } from './health.controller'
import { ResponseEnvelopeInterceptor } from './interceptors/response-envelope.interceptor'

// Wires the global error filter + response-envelope interceptor via DI so any app
// (main bootstrap, integration tests) gets them by importing this module — no
// imperative useGlobalFilters/useGlobalInterceptors calls to keep in sync.
@Module({
  controllers: [HealthController],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseEnvelopeInterceptor },
  ],
})
export class CommonModule {}
