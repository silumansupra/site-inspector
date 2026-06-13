import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  try {
    const rows = await sql`
      SELECT domain, scanned_at, duration_ms, passed, issues
      FROM scan_results
      ORDER BY scanned_at DESC
      LIMIT 10
    `;
    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    return NextResponse.json({ ok: false, data: [] });
  }
}
