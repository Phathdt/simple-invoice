import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

// Matches validator.js isEmail behavior (accepts short TLDs like x@x.x)
const emailSchema = z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email')

export const registerSchema = z.object({
  fullName: z.string().min(2),
  email: emailSchema,
  password: z.string().min(6),
})

export class RegisterInput extends createZodDto(registerSchema) {}
