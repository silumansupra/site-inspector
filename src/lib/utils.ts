// src/lib/utils.ts
import { z } from 'zod'

export const domainSchema = z
  .string()
  .min(1, 'Domain is required')
  .transform(v => v.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase().trim())
  .pipe(
    z.string().regex(
      /^([a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/,
      'Invalid domain format'
    )
  )

export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ')
}
