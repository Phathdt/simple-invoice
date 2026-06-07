import { z } from 'zod'

// Mirror the backend email rule (validator.js isEmail style, accepts short TLDs)
// so client-side validation matches what the server accepts.
export const emailSchema = z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email')
