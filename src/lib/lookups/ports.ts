// src/lib/lookups/ports.ts
import net from 'node:net'
import type { LookupResult, PortsData } from '@/lib/types'

const COMMON_PORTS = [21, 22, 23, 25, 53, 80, 110, 143, 443, 587, 993, 995, 3000, 3306, 5432, 6379, 8080, 8443, 27017]

function scanPort(host: string, port: number, timeout = 2000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    let settled  = false

    const done = (open: boolean) => {
      if (settled) return
      settled = true
      socket.destroy()
      resolve(open)
    }

    socket.setTimeout(timeout)
    socket.on('connect', () => done(true))
    socket.on('timeout', () => done(false))
    socket.on('error',   () => done(false))
    socket.connect(port, host)
  })
}

export async function checkPorts(domain: string): Promise<LookupResult<PortsData>> {
  const start = Date.now()
  const id    = 'ports'
  const label = 'Open Ports'

  // Vercel serverless does not support raw TCP sockets
  if (process.env.VERCEL) {
    return {
      id, label, status: 'error', duration: 0,
      error: 'Port scanning not available on serverless — run locally or on VPS'
    }
  }

  try {
    // Scan in batches of 5 to avoid flooding
    const results: { port: number; open: boolean }[] = []

    for (let i = 0; i < COMMON_PORTS.length; i += 5) {
      const batch = COMMON_PORTS.slice(i, i + 5)
      const batchResults = await Promise.all(
        batch.map(async (port) => ({ port, open: await scanPort(domain, port) }))
      )
      results.push(...batchResults)
    }

    return {
      id, label, status: 'success', duration: Date.now() - start,
      data: {
        open:    results.filter(r => r.open).map(r => r.port),
        closed:  results.filter(r => !r.open).map(r => r.port),
        scanned: COMMON_PORTS,
      }
    }
  } catch (err) {
    return { id, label, status: 'error', duration: Date.now() - start, error: String(err) }
  }
}
