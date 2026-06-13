// src/lib/lookups/whois.ts
import type { LookupResult, WhoisData } from '@/lib/types'

// RDAP bootstrap - each TLD may have its own RDAP server
const RDAP_SERVERS: Record<string, string> = {
  'my.id': 'https://rdap.pandi.or.id/rdap',
  'id':    'https://rdap.pandi.or.id/rdap',
  'com':   'https://rdap.verisign.com/com/v1',
  'net':   'https://rdap.verisign.com/net/v1',
  'org':   'https://rdap.publicinterestregistry.org/rdap',
}

function getRdapBase(domain: string): string {
  const parts = domain.split('.')
  // Check multi-level TLD first (e.g. my.id)
  if (parts.length >= 3) {
    const multiTld = parts.slice(-2).join('.')
    if (RDAP_SERVERS[multiTld]) return RDAP_SERVERS[multiTld]
  }
  const tld = parts[parts.length - 1]
  return RDAP_SERVERS[tld] ?? 'https://rdap.org'
}

async function queryRdap(domain: string): Promise<WhoisData> {
  const base = getRdapBase(domain)
  const url  = `${base}/domain/${domain}`

  const res = await fetch(url, {
    signal:  AbortSignal.timeout(8000),
    headers: { 'Accept': 'application/json' }
  })

  if (!res.ok) {
    // Fallback to rdap.org if specific server fails
    if (base !== 'https://rdap.org') {
      const fallback = await fetch(`https://rdap.org/domain/${domain}`, {
        signal:  AbortSignal.timeout(8000),
        headers: { 'Accept': 'application/json' }
      })
      if (!fallback.ok) throw new Error(`RDAP returned ${fallback.status}`)
      return parseRdap(await fallback.json())
    }
    throw new Error(`RDAP returned ${res.status}`)
  }

  return parseRdap(await res.json())
}

function parseRdap(data: any): WhoisData {
  const getEvent = (action: string): string =>
    data.events?.find((e: any) => e.eventAction === action)?.eventDate ?? ''

  const registrarEntity = data.entities?.find((e: any) => e.roles?.includes('registrar'))
  const registrar = registrarEntity?.vcardArray?.[1]
    ?.find((v: any) => v[0] === 'fn')?.[3] ?? ''

  const nameServers: string[] = data.nameservers
    ?.map((ns: any) => (ns.ldhName ?? '').toLowerCase()) ?? []

  const status: string[] = Array.isArray(data.status) ? data.status : []

  return {
    registrar:   registrar || 'N/A',
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