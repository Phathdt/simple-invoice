import { type CallHandler, type ExecutionContext, Injectable, type NestInterceptor } from '@nestjs/common'

import type { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { isPaginated } from '../dto/paginated'

@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((payload) => {
        // List endpoints already build { data, paging } — pass through to avoid double-wrap.
        if (isPaginated(payload)) return payload
        return { data: payload }
      }),
    )
  }
}
