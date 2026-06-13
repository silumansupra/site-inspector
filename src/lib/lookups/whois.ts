// src/lib/lookups/whois.ts
import type { LookupResult, WhoisData } from '@/lib/types'

// Uses rdap.org — free, no API key, works over HTTPS (port 443)
// RDAP is the modern replacement for raw WHOIS (RFC 7483)
async function queryRdap(domain: string): Promise<WhoisData> {
  const res = await fetch(`https://rdap.org/domain/${domain}`, {
    signal: AbortSignal.timeout(8000),
    headers: { 'Accept': 'application/json' }
  })

  if (!res.ok) throw new Error(`RDAP returned ${res.status}`)

  const data = await res.json()

  // Parse RDAP response format
  const getEvent = (action: string): string =>
    data.events?.find((e: any) => e.eventAction === action)?.eventDate ?? ''

  const registrar = data.entities
    ?.find((e: any) => e.roles?.includes('registrar'))
    ?.vcardArray?.[1]
    ?.find((v: any) => v[0] === 'fn')?.[3] ?? ''

  const nameServers: string[] = data.nameservers
    ?.map((ns: any) => ns.ldhName?.toLowerCase() ?? '') ?? []

  const status: string[] = Array.isArray(data.status) ? data.status : []

  return {
    registrar,
    createdDate: getEvent('registration'),
    updatedDate: getEvent('last changed'),
    expiresDate: getEvent('expiration'),
    nameServers,
    status,
    raw: JSON.stringify(data, null, 2),
  }
}

export async function checkWhois(domain: string): Promise<LookupResult<WhoisData>> {
  const start = Date.now()
  const id    = 'whois'
  const label = 'WHOIS / Domain Info'

  try {
    const data = await queryRdap(domain)
    return { id, label, status: 'success', duration: Date.now() - start, data }
  } catch (err) {
    return { id, label, status: 'error', duration: Date.now() - start, error: String(err) }
  }
}
