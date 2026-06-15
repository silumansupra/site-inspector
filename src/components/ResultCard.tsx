'use client'
// src/components/ResultCard.tsx
import type { LookupResult, HeadersData, DnsData, SslData, WhoisData, PortsData, RobotsData, SecurityHeadersData, SocialTagsData, EmailSecurityData } from '@/lib/types'

interface Props {
  result: LookupResult<unknown>
}

export function ResultCard({ result }: Props) {
  const isError = result.status === 'error'

  return (
    <div className="border border-terminal-border rounded-lg overflow-hidden animate-fade-in"
      style={{ background: 'var(--surface)' }}>

      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-terminal-border">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isError ? 'bg-terminal-red' : 'bg-terminal-green'}`} />
          <span className="text-sm font-medium text-terminal-text">{result.label}</span>
        </div>
        <span className="text-xs text-terminal-muted">{result.duration}ms</span>
      </div>

      {/* Body */}
      <div className="p-4">
        {isError ? (
          <p className="text-terminal-red text-xs">{result.error}</p>
        ) : (
          <ResultBody result={result} />
        )}
      </div>
    </div>
  )
}

function ResultBody({ result }: { result: LookupResult<unknown> }) {
  switch (result.id) {
    case 'headers':          return <HeadersBody data={result.data as HeadersData} />
    case 'dns':              return <DnsBody     data={result.data as DnsData} />
    case 'ssl':              return <SslBody     data={result.data as SslData} />
    case 'whois':            return <WhoisBody   data={result.data as WhoisData} />
    case 'ports':            return <PortsBody   data={result.data as PortsData} />
    case 'robots':           return <RobotsBody  data={result.data as RobotsData} />
    case 'security-headers': return <SecHeadersBody data={result.data as SecurityHeadersData} />
    case 'social-tags':     return <SocialTagsBody    data={result.data as SocialTagsData} />
    case 'email-security':  return <EmailSecurityBody data={result.data as EmailSecurityData} />
    default:                 return <pre className="text-xs text-terminal-muted overflow-auto">{JSON.stringify(result.data, null, 2)}</pre>
  }
}

// ── Sub-components ────────────────────────────────────────────────────────

const Row = ({ label, value, ok }: { label: string; value: React.ReactNode; ok?: boolean }) => (
  <div className="flex justify-between gap-4 py-1 border-b border-terminal-border/30 last:border-0">
    <span className="text-terminal-muted text-xs shrink-0">{label}</span>
    <span className={`text-xs text-right ${ok === true ? 'text-terminal-green' : ok === false ? 'text-terminal-red' : 'text-terminal-text'}`}>
      {value}
    </span>
  </div>
)

function HeadersBody({ data }: { data: HeadersData }) {
  const s = data.security
  return (
    <div className="space-y-1">
      <Row label="Status Code"    value={data.statusCode} />
      <Row label="Response Time"  value={`${data.responseTime}ms`} />
      {data.redirectChain.length > 0 && <Row label="Redirects" value={data.redirectChain.length} />}
      <Row label="CSP"            value={s.csp               ? '✓ Present' : '✗ Missing'} ok={s.csp} />
      <Row label="X-Frame-Options" value={s.xFrameOptions    ? '✓ Present' : '✗ Missing'} ok={s.xFrameOptions} />
      <Row label="X-Content-Type" value={s.xContentTypeOptions ? '✓ Present' : '✗ Missing'} ok={s.xContentTypeOptions} />
      <Row label="HSTS"           value={s.hsts              ? '✓ Present' : '✗ Missing'} ok={s.hsts} />
      <Row label="Referrer-Policy" value={s.referrerPolicy   ? '✓ Present' : '✗ Missing'} ok={s.referrerPolicy} />
    </div>
  )
}

function DnsBody({ data }: { data: DnsData }) {
  return (
    <div className="space-y-1">
      {data.a.length     > 0 && <Row label="A"     value={data.a.join(', ')} />}
      {data.aaaa.length  > 0 && <Row label="AAAA"  value={data.aaaa.join(', ')} />}
      {data.ns.length    > 0 && <Row label="NS"    value={data.ns.join(', ')} />}
      {data.mx.length    > 0 && <Row label="MX"    value={data.mx.map(r => r.exchange).join(', ')} />}
      {data.cname.length > 0 && <Row label="CNAME" value={data.cname.join(', ')} />}
      {data.txt.length   > 0 && <Row label="TXT"   value={`${data.txt.length} record(s)`} />}
    </div>
  )
}

function SslBody({ data }: { data: SslData }) {
  const expiringSoon = data.daysRemaining < 30
  return (
    <div className="space-y-1">
      <Row label="Issuer"      value={data.issuer} />
      <Row label="Subject"     value={data.subject} />
      <Row label="Protocol"    value={data.protocol} />
      <Row label="Valid Until" value={data.validTo} />
      <Row label="Days Left"   value={`${data.daysRemaining} days`} ok={!expiringSoon} />
      <Row label="Self-Signed" value={data.selfSigned ? 'Yes' : 'No'} ok={!data.selfSigned} />
    </div>
  )
}

function WhoisBody({ data }: { data: WhoisData }) {
  return (
    <div className="space-y-1">
      <Row label="Registrar"  value={data.registrar || '—'} />
      <Row label="Created"    value={data.createdDate || '—'} />
      <Row label="Updated"    value={data.updatedDate || '—'} />
      <Row label="Expires"    value={data.expiresDate || '—'} />
      {data.nameServers.length > 0 && <Row label="NS" value={data.nameServers.slice(0, 2).join(', ')} />}
    </div>
  )
}

function PortsBody({ data }: { data: PortsData }) {
  return (
    <div className="space-y-1">
      <Row label="Open Ports"   value={data.open.length > 0 ? data.open.join(', ') : 'None found'} ok={data.open.length === 0} />
      <Row label="Ports Scanned" value={data.scanned.length} />
    </div>
  )
}

function RobotsBody({ data }: { data: RobotsData }) {
  return (
    <div className="space-y-1">
      <Row label="Found"       value={data.found ? 'Yes' : 'No'} ok={data.found} />
      {data.sitemapUrl && <Row label="Sitemap"  value={data.sitemapUrl} />}
      {data.disallowed.length > 0 && (
        <Row label="Disallowed" value={`${data.disallowed.length} path(s): ${data.disallowed.slice(0,3).join(', ')}`} />
      )}
    </div>
  )
}

function SecHeadersBody({ data }: { data: SecurityHeadersData }) {
  const gradeColor = { A: 'text-terminal-green', B: 'text-terminal-blue', C: 'text-terminal-yellow', D: 'text-terminal-yellow', F: 'text-terminal-red' }

  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        <span className={`text-3xl font-bold ${gradeColor[data.grade]}`}>{data.grade}</span>
        <div className="flex-1">
          <div className="h-1.5 rounded-full bg-terminal-border overflow-hidden">
            <div className="h-full rounded-full bg-terminal-green transition-all" style={{ width: `${data.score}%` }} />
          </div>
          <p className="text-xs text-terminal-muted mt-1">{data.score}/100</p>
        </div>
      </div>
      <div className="space-y-1">
        {data.headers.map(h => (
          <Row key={h.name} label={h.name} value={h.present ? '✓' : `✗ (${h.risk} risk)`} ok={h.present} />
        ))}
      </div>
    </div>
  )
}

function SocialTagsBody({ data }: { data: SocialTagsData }) {
  return (
    <div className="space-y-1">
      {data.title       && <Row label="Title"       value={data.title} />}
      {data.description && <Row label="Description" value={data.description.slice(0, 100) + (data.description.length > 100 ? '...' : '')} />}
      {data.canonical   && <Row label="Canonical"   value={data.canonical} />}
      {data.author      && <Row label="Author"      value={data.author} />}
      {data.generator   && <Row label="Generator"   value={data.generator} />}
      {data.themeColor  && <Row label="Theme Color" value={data.themeColor} />}
      {data.robots      && <Row label="Robots"      value={data.robots} />}
      {data.og.image    && <Row label="OG Image"    value={data.og.image} />}
      {data.twitter.site && <Row label="Twitter"    value={data.twitter.site} />}
    </div>
  )
}

function EmailSecurityBody({ data }: { data: EmailSecurityData }) {
  return (
    <div className="space-y-1">
      <Row label="SPF"   value={data.spf.present   ? `✓ ${data.spf.record.slice(0, 50)}` : '✗ Missing'} ok={data.spf.present} />
      <Row label="DMARC" value={data.dmarc.present  ? `✓ p=${data.dmarc.policy || 'none'}` : '✗ Missing'} ok={data.dmarc.present} />
      <Row label="DKIM"  value={data.dkim.present   ? '✓ Present' : '✗ Not detected'} ok={data.dkim.present} />
      <Row label="BIMI"  value={data.bimi.present   ? '✓ Present' : '✗ Missing'} ok={data.bimi.present} />
      {data.mx.length > 0 && (
        <Row label="MX" value={data.mx.map(r => r.exchange).slice(0, 2).join(', ')} />
      )}
    </div>
  )
}
