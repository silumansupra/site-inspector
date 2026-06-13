// src/lib/lookups/security-headers.ts
import type { LookupResult, SecurityHeadersData } from '@/lib/types'

const SECURITY_HEADERS = [
  { name: 'Content-Security-Policy',        key: 'content-security-policy',         risk: 'high'   as const, score: 25 },
  { name: 'Strict-Transport-Security',      key: 'strict-transport-security',        risk: 'high'   as const, score: 20 },
  { name: 'X-Frame-Options',               key: 'x-frame-options',                  risk: 'medium' as const, score: 15 },
  { name: 'X-Content-Type-Options',        key: 'x-content-type-options',           risk: 'medium' as const, score: 15 },
  { name: 'Referrer-Policy',               key: 'referrer-policy',                  risk: 'low'    as const, score: 10 },
  { name: 'Permissions-Policy',            key: 'permissions-policy',               risk: 'low'    as const, score: 10 },
  { name: 'Cross-Origin-Opener-Policy',    key: 'cross-origin-opener-policy',       risk: 'low'    as const, score: 5  },
]

function scoreToGrade(score: number): SecurityHeadersData['grade'] {
  if (score >= 90) return 'A'
  if (score >= 70) return 'B'
  if (score >= 50) return 'C'
  if (score >= 30) return 'D'
  return 'F'
}

export async function checkSecurityHeaders(domain: string): Promise<LookupResult<SecurityHeadersData>> {
  const start = Date.now()
  const id    = 'security-headers'
  const label = 'Security Headers Score'

  try {
    const res     = await fetch(`https://${domain}`, { signal: AbortSignal.timeout(8000) })
    const headers = Object.fromEntries(res.headers.entries())

    let totalScore  = 0
    let earnedScore = 0

    const results = SECURITY_HEADERS.map(({ name, key, risk, score }) => {
      const present = key in headers
      totalScore  += score
      if (present) earnedScore += score
      return { name, present, value: headers[key], risk }
    })

    const pct = Math.round((earnedScore / totalScore) * 100)

    return {
      id, label, status: 'success', duration: Date.now() - start,
      data: {
        score: pct,
        grade: scoreToGrade(pct),
        headers: results,
      }
    }
  } catch (err) {
    return { id, label, status: 'error', duration: Date.now() - start, error: String(err) }
  }
}
