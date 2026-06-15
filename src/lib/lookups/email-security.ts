// src/lib/lookups/email-security.ts
import dns from 'node:dns/promises'
import type { LookupResult } from '@/lib/types'

export interface EmailSecurityData {
  spf:   { present: boolean; record: string }
  dmarc: { present: boolean; record: string; policy: string }
  dkim:  { present: boolean }
  bimi:  { present: boolean; record: string }
  mx:    { exchange: string; priority: number }[]
}

export async function checkEmailSecurity(domain: string): Promise<LookupResult<EmailSecurityData>> {
  const start = Date.now()
  const id    = 'email-security'
  const label = 'Email Security'

  try {
    const [txtRecords, dmarcRecords, bimiRecords, mxRecords] = await Promise.allSettled([
      dns.resolveTxt(domain),
      dns.resolveTxt(`_dmarc.${domain}`),
      dns.resolveTxt(`default._domainkey.${domain}`),
      dns.resolveMx(domain),
    ])

    const txt = txtRecords.status === 'fulfilled'
      ? txtRecords.value.map(r => r.join(''))
      : []

    const spfRecord  = txt.find(r => r.startsWith('v=spf1')) ?? ''
    const dmarcTxt   = dmarcRecords.status === 'fulfilled'
      ? dmarcRecords.value.map(r => r.join(''))[0] ?? ''
      : ''
    const bimiTxt    = bimiRecords.status === 'fulfilled'
      ? bimiRecords.value.map(r => r.join(''))[0] ?? ''
      : ''

    // Parse DMARC policy
    const policyMatch = dmarcTxt.match(/p=([^;]+)/)
    const dmarcPolicy = policyMatch ? policyMatch[1].trim() : ''

    // Check DKIM — try common selectors
    const dkimSelectors = ['default', 'google', 'mail', 'dkim', 'k1']
    const dkimResults = await Promise.allSettled(
      dkimSelectors.map(s => dns.resolveTxt(`${s}._domainkey.${domain}`))
    )
    const dkimPresent = dkimResults.some(r => r.status === 'fulfilled')

    const mx = mxRecords.status === 'fulfilled'
      ? mxRecords.value.map(r => ({ exchange: r.exchange, priority: r.priority }))
      : []

    return {
      id, label, status: 'success', duration: Date.now() - start,
      data: {
        spf:   { present: !!spfRecord,  record: spfRecord },
        dmarc: { present: !!dmarcTxt,   record: dmarcTxt, policy: dmarcPolicy },
        dkim:  { present: dkimPresent },
        bimi:  { present: !!bimiTxt,    record: bimiTxt },
        mx,
      }
    }
  } catch (err) {
    return { id, label, status: 'error', duration: Date.now() - start, error: String(err) }
  }
}