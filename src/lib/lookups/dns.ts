// src/lib/lookups/dns.ts
import dns from 'node:dns/promises'
import type { LookupResult, DnsData } from '@/lib/types'

export async function checkDns(domain: string): Promise<LookupResult<DnsData>> {
  const start = Date.now()
  const id    = 'dns'
  const label = 'DNS Records'

  try {
    const [a, aaaa, mx, ns, txt, cname] = await Promise.allSettled([
      dns.resolve4(domain),
      dns.resolve6(domain),
      dns.resolveMx(domain),
      dns.resolveNs(domain),
      dns.resolveTxt(domain),
      dns.resolveCname(domain),
    ])

    return {
      id, label, status: 'success', duration: Date.now() - start,
      data: {
        a:     a.status     === 'fulfilled' ? a.value                                                    : [],
        aaaa:  aaaa.status  === 'fulfilled' ? aaaa.value                                                 : [],
        mx:    mx.status    === 'fulfilled' ? mx.value.map(r => ({ exchange: r.exchange, priority: r.priority })) : [],
        ns:    ns.status    === 'fulfilled' ? ns.value                                                   : [],
        txt:   txt.status   === 'fulfilled' ? txt.value.map(r => r.join(''))                             : [],
        cname: cname.status === 'fulfilled' ? cname.value                                                : [],
      }
    }
  } catch (err) {
    return { id, label, status: 'error', duration: Date.now() - start, error: String(err) }
  }
}
