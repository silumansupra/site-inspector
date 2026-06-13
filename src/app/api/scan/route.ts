import { NextRequest } from 'next/server'
import { domainSchema } from '@/lib/utils'
import { ALL_LOOKUPS } from '@/lib/lookups'
import sql from '@/lib/db'
import type { LookupResult } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const rawDomain = req.nextUrl.searchParams.get('domain') ?? ''

  const parsed = domainSchema.safeParse(rawDomain)
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: parsed.error.errors[0].message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const domain    = parsed.data
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

      await Promise.all(
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
      )

      const duration = Date.now() - scanStart

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