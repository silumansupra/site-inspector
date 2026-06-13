import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  try {
    const rows = await sql`
      SELECT DISTINCT ON (domain)
        domain, scanned_at, duration_ms, passed, issues
      FROM scan_results
      ORDER BY domain, scanned_at DESC
      LIMIT 10
    `
    // Re-sort by scanned_at after DISTINCT
    const sorted = [...rows].sort(
      (a, b) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime()
    )
    return NextResponse.json({ ok: true, data: sorted })
  } catch (err) {
    return NextResponse.json({ ok: false, data: [] })
  }
}