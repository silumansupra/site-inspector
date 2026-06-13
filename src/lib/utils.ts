// src/lib/utils.ts
import { z } from 'zod'

const BLOCKED_DOMAINS = [
  'localhost', '127.0.0.1', '0.0.0.0',
  '169.254.169.254', // AWS metadata endpoint
]

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

export function isBlockedDomain(domain: string): boolean {
  return BLOCKED_DOMAINS.some(b => domain.includes(b))
    || /^(\d{1,3}\.){3}\d{1,3}$/.test(domain) // block raw IP
}