import { z } from 'zod'

// Accepts international phone numbers: optional +, digits, spaces, hyphens, parentheses.
// Must contain 7–15 digits (ITU-T E.164 range). Surrounding formatting chars are allowed.
export const phoneSchema = z
  .string()
  .regex(/^[+\d][\d\s\-()]*$/, 'Invalid phone number')
  .refine((val) => val.replace(/\D/g, '').length >= 7, 'Phone number too short (min 7 digits)')
  .refine((val) => val.replace(/\D/g, '').length <= 15, 'Phone number too long (max 15 digits)')
