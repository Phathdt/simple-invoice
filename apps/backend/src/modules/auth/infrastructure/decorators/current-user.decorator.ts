import { createParamDecorator, type ExecutionContext } from '@nestjs/common'

export interface JwtPayload {
  sub: string
  email: string
}

// Relies on JwtAuthGuard having populated request.user. Only use on guarded
// routes — on a @Public() route request.user is undefined.
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): JwtPayload => {
  const request = ctx.switchToHttp().getRequest<{ user: JwtPayload }>()
  return request.user
})
