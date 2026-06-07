import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { emailSchema } from '../../../../common/dto/email.schema'

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6),
})

export class LoginInput extends createZodDto(loginSchema) {}
