// src/lib/types.ts

export type LookupStatus = 'pending' | 'running' | 'success' | 'error'

export interface LookupResult<T = unknown> {
  id:       string
  label:    string
  status:   LookupStatus
  data?:    T
  error?:   string
  duration: number
}

// ── Individual lookup data shapes ──────────────────────────────────────────

export interface HeadersData {
  statusCode:  number
  responseTime: number
  headers:     Record<string, string>
  redirectChain: string[]
  security: {
    csp:               boolean
    xFrameOptions:     boolean
    xContentTypeOptions: boolean
    hsts:              boolean
    referrerPolicy:    boolean
    permissionsPolicy: boolean
  }
}

export interface DnsData {
  a:    string[]
  aaaa: string[]
  mx:   { exchange: string; priority: number }[]
  ns:   string[]
  txt:  string[]
  cname: string[]
}

export interface SslData {
  valid:         boolean
  issuer:        string
  subject:       string
  validFrom:     string
  validTo:       string
  daysRemaining: number
  protocol:      string
  selfSigned:    boolean
}

export interface WhoisData {
  registrar:    string
  createdDate:  string
  updatedDate:  string
  expiresDate:  string
  nameServers:  string[]
  status:       string[]
  raw:          string
}

export interface PortsData {
  open:   number[]
  closed: number[]
  scanned: number[]
}

export interface RobotsData {
  found:      boolean
  content:    string
  sitemapUrl: string | null
  disallowed: string[]
  allowed:    string[]
}

export interface SecurityHeadersData {
  score:   number
  grade:   'A' | 'B' | 'C' | 'D' | 'F'
  headers: {
    name:    string
    present: boolean
    value?:  string
    risk:    'high' | 'medium' | 'low'
  }[]
}

export interface SocialTagsData {
  title: string; description: string; canonical: string
  generator: string; themeColor: string; keywords: string
  author: string; robots: string
  og: { title: string; description: string; image: string; url: string; type: string; siteName: string }
  twitter: { card: string; site: string; creator: string; title: string; image: string }
}

export interface EmailSecurityData {
  spf:   { present: boolean; record: string }
  dmarc: { present: boolean; record: string; policy: string }
  dkim:  { present: boolean }
  bimi:  { present: boolean; record: string }
  mx:    { exchange: string; priority: number }[]
}

// Union type semua lookup results
export type AnyLookupResult =
  | LookupResult<HeadersData>
  | LookupResult<DnsData>
  | LookupResult<SslData>
  | LookupResult<WhoisData>
  | LookupResult<PortsData>
  | LookupResult<RobotsData>
  | LookupResult<SecurityHeadersData>

export interface ScanCompleteEvent {
  id:       'complete'
  domain:   string
  duration: number
  total:    number
  passed:   number
  issues:   number
}
