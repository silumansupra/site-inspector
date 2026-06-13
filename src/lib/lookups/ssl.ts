// src/lib/lookups/ssl.ts
import tls from 'node:tls'
import type { LookupResult, SslData } from '@/lib/types'

export async function checkSsl(domain: string): Promise<LookupResult<SslData>> {
  const start = Date.now()
  const id    = 'ssl'
  const label = 'SSL Certificate'

  return new Promise((resolve) => {
    const socket = tls.connect(
      443, domain,
      { servername: domain, rejectUnauthorized: false },
      () => {
        try {
          const cert     = socket.getPeerCertificate(true)
          const protocol = socket.getProtocol() ?? 'unknown'
          const validTo  = new Date(cert.valid_to)
          const daysRemaining = Math.floor((validTo.getTime() - Date.now()) / 86_400_000)

          const issuerCN = Array.isArray(cert.issuer?.CN)
            ? cert.issuer.CN[0]
            : (cert.issuer?.CN ?? cert.issuer?.O ?? 'Unknown')
        const selfSigned = issuerCN === (cert.subject?.CN ?? domain)

          socket.destroy()
          resolve({
            id, label, status: 'success', duration: Date.now() - start,
            data: {
              valid:         socket.authorized || true,
              issuer:        issuerCN,
              subject:       cert.subject?.CN ?? domain,
              validFrom:     cert.valid_from,
              validTo:       cert.valid_to,
              daysRemaining,
              protocol,
              selfSigned,
            }
          })
        } catch (err) {
          socket.destroy()
          resolve({ id, label, status: 'error', duration: Date.now() - start, error: String(err) })
        }
      }
    )

    socket.setTimeout(8000, () => {
      socket.destroy()
      resolve({ id, label, status: 'error', duration: Date.now() - start, error: 'Connection timeout' })
    })

    socket.on('error', (err) => {
      resolve({ id, label, status: 'error', duration: Date.now() - start, error: err.message })
    })
  })
}
