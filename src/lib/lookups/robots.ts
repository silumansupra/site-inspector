// src/lib/lookups/robots.ts
import type { LookupResult, RobotsData } from '@/lib/types'

export async function checkRobots(domain: string): Promise<LookupResult<RobotsData>> {
  const start = Date.now()
  const id    = 'robots'
  const label = 'Robots & Crawl Rules'

  try {
    const res = await fetch(`https://${domain}/robots.txt`, {
      signal: AbortSignal.timeout(6000)
    })

    if (!res.ok) {
      return {
        id, label, status: 'success', duration: Date.now() - start,
        data: { found: false, content: '', sitemapUrl: null, disallowed: [], allowed: [] }
      }
    }

    const content    = await res.text()
    const lines      = content.split('\n').map(l => l.trim())
    const disallowed = lines.filter(l => l.toLowerCase().startsWith('disallow:')).map(l => l.split(':')[1]?.trim() ?? '')
    const allowed    = lines.filter(l => l.toLowerCase().startsWith('allow:')).map(l => l.split(':')[1]?.trim() ?? '')
    const sitemapLine = lines.find(l => l.toLowerCase().startsWith('sitemap:'))
    const sitemapUrl  = sitemapLine ? sitemapLine.split(/sitemap:/i)[1]?.trim() ?? null : null

    return {
      id, label, status: 'success', duration: Date.now() - start,
      data: { found: true, content, sitemapUrl, disallowed, allowed }
    }
  } catch (err) {
    return { id, label, status: 'error', duration: Date.now() - start, error: String(err) }
  }
}
