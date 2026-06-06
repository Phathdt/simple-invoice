import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

// Builds a named DTO whose schema is { data: <schema> }, matching the global
// response-envelope interceptor's wire shape. Each call site must still extend
// the result into a named class (e.g. `class UserDataResponse extends dataResponse(...)`)
// so @nestjs/swagger can emit a stable, named OpenAPI component.
export function dataResponse<T extends z.ZodTypeAny>(schema: T) {
  return createZodDto(z.object({ data: schema }))
}
