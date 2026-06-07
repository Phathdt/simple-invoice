import { z } from 'zod'

// Mirror the backend email rule (validator.js isEmail style, accepts short TLDs)
// so client-side validation matches what the server accepts.
export const emailSchema = z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email')

// International phone: optional +, digits, spaces, hyphens, parentheses. 7–15 digits (E.164).
export const phoneSchema = z
  .string()
  .regex(/^[+\d][\d\s\-()]*$/, 'Invalid phone number')
  .refine((val) => val.replace(/\D/g, '').length >= 7, 'Phone number too short (min 7 digits)')
  .refine((val) => val.replace(/\D/g, '').length <= 15, 'Phone number too long (max 15 digits)')
