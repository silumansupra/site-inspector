import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const rows = await sql`
      SELECT DISTINCT ON (domain)
        domain, scanned_at, duration_ms, passed, issues
      FROM scan_results
      ORDER BY domain, scanned_at DESC
      LIMIT 10
    `
    const sorted = [...rows].sort(
      (a, b) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime()
    )
    return NextResponse.json(
      { ok: true, data: sorted },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
            'Expires': '0',
        }
      }
    )
  } catch (err) {
    return NextResponse.json({ ok: false, data: [] })
  }
}