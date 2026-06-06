import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const userResponseSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  createdAt: z.string(),
})

export class UserResponse extends createZodDto(userResponseSchema) {}

export const authSessionSchema = z.object({
  token: z.string(),
  user: userResponseSchema,
})

export class AuthSessionResponse extends createZodDto(authSessionSchema) {}
