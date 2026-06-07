import { z } from 'zod'

// Shared email validation for all DTOs. Matches validator.js isEmail behavior
// (accepts short TLDs like x@x.x) so backend rules stay consistent everywhere.
export const emailSchema = z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email')
