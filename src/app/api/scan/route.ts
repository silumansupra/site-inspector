import { NextRequest } from 'next/server'
import { domainSchema, isBlockedDomain } from '@/lib/utils'
import { ALL_LOOKUPS } from '@/lib/lookups'
import { checkRateLimit } from '@/lib/ratelimit'
import sql from '@/lib/db'
import type { LookupResult } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  // 1. Rate limit check
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please wait a minute.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // 2. Validate domain
  const rawDomain = req.nextUrl.searchParams.get('domain') ?? ''
  const parsed = domainSchema.safeParse(rawDomain)
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: parsed.error.errors[0].message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const domain = parsed.data

  // 3. Block internal/private domains
  if (isBlockedDomain(domain)) {
    return new Response(
      JSON.stringify({ error: 'Domain not allowed' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const encoder   = new TextEncoder()
  const scanStart = Date.now()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch { }
      }

      send({ id: 'start', domain, total: ALL_LOOKUPS.length })

      const allResults: LookupResult<unknown>[] = []
      let passed = 0
      let issues = 0

      // 4. Run all lookups in parallel with global timeout
      await Promise.race([
        Promise.all(
          ALL_LOOKUPS.map(async (lookup) => {
            try {
              const result = await lookup(domain)
              if (result.status === 'success') passed++
              else issues++
              allResults.push(result)
              send(result)
            } catch (err) {
              issues++
              const errResult = {
                id: 'unknown', label: 'Unknown', status: 'error' as const,
                error: String(err), duration: 0
              }
              allResults.push(errResult)
              send(errResult)
            }
          })
        ),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Scan timeout')), 30_000)
        )
      ]).catch((err) => {
        send({ id: 'error', error: String(err) })
      })

      const duration = Date.now() - scanStart

      // 5. Save to DB
      try {
        await sql`
          INSERT INTO scan_results
            (domain, duration_ms, total_lookups, passed, issues, results)
          VALUES (
            ${domain},
            ${duration},
            ${ALL_LOOKUPS.length},
            ${passed},
            ${issues},
            ${JSON.stringify(allResults)}
          )
        `
      } catch (err) {
        console.error('DB save error:', err)
      }

      send({ id: 'complete', domain, duration, total: ALL_LOOKUPS.length, passed, issues })
      controller.close()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type':                'text/event-stream',
      'Cache-Control':               'no-cache, no-transform',
      'Connection':                  'keep-alive',
      'X-Accel-Buffering':           'no',
      'Access-Control-Allow-Origin': '*',
    }
  })
}