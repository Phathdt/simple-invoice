import { z } from 'zod'

import { dataResponse } from '../../../../common/dto/data-response.dto'

export const userResponseSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  createdAt: z.string(),
})

export const authSessionSchema = z.object({
  token: z.string(),
  user: userResponseSchema,
})

// Response-envelope wrappers — the global interceptor wraps every payload in { data }.
// These exist so the OpenAPI spec (and generated client) reflect the real wire shape.
export class AuthSessionDataResponse extends dataResponse(authSessionSchema) {}

export class UserDataResponse extends dataResponse(userResponseSchema) {}
