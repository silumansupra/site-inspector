// src/lib/lookups/social-tags.ts
import type { LookupResult } from '@/lib/types'

export interface SocialTagsData {
  title:       string
  description: string
  canonical:   string
  generator:   string
  themeColor:  string
  og: {
    title:       string
    description: string
    image:       string
    url:         string
    type:        string
    siteName:    string
  }
  twitter: {
    card:    string
    site:    string
    creator: string
    title:   string
    image:   string
  }
  keywords: string
  author:   string
  robots:   string
}

function getMeta(doc: string, name: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, 'i'),
  ]
  for (const p of patterns) {
    const m = doc.match(p)
    if (m) return m[1].trim()
  }
  return ''
}

function getOg(doc: string, property: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']og:${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${property}["']`, 'i'),
  ]
  for (const p of patterns) {
    const m = doc.match(p)
    if (m) return m[1].trim()
  }
  return ''
}

function getTwitter(doc: string, name: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+name=["']twitter:${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:${name}["']`, 'i'),
  ]
  for (const p of patterns) {
    const m = doc.match(p)
    if (m) return m[1].trim()
  }
  return ''
}

export async function checkSocialTags(domain: string): Promise<LookupResult<SocialTagsData>> {
  const start = Date.now()
  const id    = 'social-tags'
  const label = 'SEO & Social Tags'

  try {
    const res = await fetch(`https://${domain}`, {
      signal:  AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; site-inspector/1.0)' }
    })

    const html = await res.text()

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)

    return {
      id, label, status: 'success', duration: Date.now() - start,
      data: {
        title:       titleMatch?.[1]?.trim() ?? '',
        description: getMeta(html, 'description'),
        canonical:   canonicalMatch?.[1]?.trim() ?? '',
        generator:   getMeta(html, 'generator'),
        themeColor:  getMeta(html, 'theme-color'),
        keywords:    getMeta(html, 'keywords'),
        author:      getMeta(html, 'author'),
        robots:      getMeta(html, 'robots'),
        og: {
          title:       getOg(html, 'title'),
          description: getOg(html, 'description'),
          image:       getOg(html, 'image'),
          url:         getOg(html, 'url'),
          type:        getOg(html, 'type'),
          siteName:    getOg(html, 'site_name'),
        },
        twitter: {
          card:    getTwitter(html, 'card'),
          site:    getTwitter(html, 'site'),
          creator: getTwitter(html, 'creator'),
          title:   getTwitter(html, 'title'),
          image:   getTwitter(html, 'image'),
        }
      }
    }
  } catch (err) {
    return { id, label, status: 'error', duration: Date.now() - start, error: String(err) }
  }
}