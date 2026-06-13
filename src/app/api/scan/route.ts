// src/app/api/scan/route.ts
import { NextRequest } from 'next/server'
import { domainSchema } from '@/lib/utils'
import { ALL_LOOKUPS } from '@/lib/lookups'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const rawDomain = req.nextUrl.searchParams.get('domain') ?? ''

  // Validate domain
  const parsed = domainSchema.safeParse(rawDomain)
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: parsed.error.errors[0].message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const domain  = parsed.data
  const encoder = new TextEncoder()
  const scanStart = Date.now()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          // Client disconnected
        }
      }

      // Send initial event
      send({ id: 'start', domain, total: ALL_LOOKUPS.length })

      let passed = 0
      let issues = 0

      // Run all lookups in parallel, stream each result as it completes
      await Promise.all(
        ALL_LOOKUPS.map(async (lookup) => {
          try {
            const result = await lookup(domain)
            if (result.status === 'success') passed++
            else issues++
            send(result)
          } catch (err) {
            issues++
            send({ id: 'unknown', status: 'error', error: String(err), duration: 0 })
          }
        })
      )

      // Final summary event
      send({
        id:       'complete',
        domain,
        duration: Date.now() - scanStart,
        total:    ALL_LOOKUPS.length,
        passed,
        issues,
      })

      controller.close()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type':                'text/event-stream',
      'Cache-Control':               'no-cache, no-transform',
      'Connection':                  'keep-alive',
      'X-Accel-Buffering':           'no',  // important for nginx
      'Access-Control-Allow-Origin': '*',
    }
  })
}
