import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import sql from '@/lib/db'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS scan_results (
        id            SERIAL PRIMARY KEY,
        domain        VARCHAR(255) NOT NULL,
        scanned_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        duration_ms   INTEGER,
        total_lookups INTEGER,
        passed        INTEGER,
        issues        INTEGER,
        results       JSONB NOT NULL
      )
    `
    await sql`CREATE INDEX IF NOT EXISTS idx_scan_results_domain ON scan_results(domain)`
    await sql`CREATE INDEX IF NOT EXISTS idx_scan_results_scanned_at ON scan_results(scanned_at DESC)`

    return NextResponse.json({ ok: true, message: 'Migration complete' })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}