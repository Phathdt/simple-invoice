import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { emailSchema } from '../../../../common/dto/email.schema'

export const registerSchema = z.object({
  fullName: z.string().min(2),
  email: emailSchema,
  password: z.string().min(6),
})

export class RegisterInput extends createZodDto(registerSchema) {}
