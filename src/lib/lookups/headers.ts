// src/lib/lookups/headers.ts
import type { LookupResult, HeadersData } from '@/lib/types'

export async function checkHeaders(domain: string): Promise<LookupResult<HeadersData>> {
  const start = Date.now()
  const id    = 'headers'
  const label = 'HTTP Headers'

  try {
    const redirectChain: string[] = []
    let currentUrl = `https://${domain}`

    // Follow redirects manually to track chain
    for (let i = 0; i < 5; i++) {
      const res = await fetch(currentUrl, {
        method:   'GET',
        redirect: 'manual',
        signal:   AbortSignal.timeout(8000),
      })

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get('location')
        if (!location) break
        redirectChain.push(currentUrl)
        currentUrl = location.startsWith('http') ? location : `https://${domain}${location}`
      } else {
        const headers = Object.fromEntries(res.headers.entries())
        return {
          id, label, status: 'success', duration: Date.now() - start,
          data: {
            statusCode:    res.status,
            responseTime:  Date.now() - start,
            headers,
            redirectChain,
            security: {
              csp:                 'content-security-policy' in headers,
              xFrameOptions:       'x-frame-options' in headers,
              xContentTypeOptions: 'x-content-type-options' in headers,
              hsts:                'strict-transport-security' in headers,
              referrerPolicy:      'referrer-policy' in headers,
              permissionsPolicy:   'permissions-policy' in headers,
            }
          }
        }
      }
    }

    throw new Error('Too many redirects')
  } catch (err) {
    return { id, label, status: 'error', duration: Date.now() - start, error: String(err) }
  }
}
