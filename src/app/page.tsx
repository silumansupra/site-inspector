'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface RecentScan {
  domain:     string
  scanned_at: string
  duration_ms: number
  passed:     number
  issues:     number
}

export default function HomePage() {
  const router  = useRouter()
  const [domain,  setDomain]  = useState('')
  const [error,   setError]   = useState('')
  const [recents, setRecents] = useState<RecentScan[]>([])

  useEffect(() => {
    fetch('/api/recent')
      .then(r => r.json())
      .then(d => { if (d.ok) setRecents(d.data) })
      .catch(() => {})
  }, [])

  const handleScan = () => {
    const cleaned = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim()
    if (!cleaned) { setError('Please enter a domain'); return }
    const valid = /^([a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(cleaned)
    if (!valid)   { setError('Invalid domain format'); return }
    setError('')
    router.push(`/check/${cleaned}`)
  }

  const timeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (diff < 60)   return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 text-terminal-green text-xs font-mono mb-4 border border-terminal-green/30 rounded px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse-dot inline-block" />
          OSINT &amp; Security Scanner
        </div>
        <h1 className="text-4xl font-bold text-terminal-text tracking-tight mb-3">
          site<span className="text-terminal-blue">_</span>inspector
        </h1>
        <p className="text-terminal-muted text-sm max-w-md">
          DNS · SSL · Security Headers · WHOIS · Open Ports · Robots.txt
        </p>
      </div>

      {/* Input */}
      <div className="w-full max-w-xl">
        <div className={`flex items-center border rounded-lg overflow-hidden transition-colors
          ${error ? 'border-terminal-red' : 'border-terminal-border focus-within:border-terminal-blue'}`}
          style={{ background: 'var(--surface)' }}>
          <span className="pl-4 text-terminal-muted select-none">$</span>
          <input
            type="text"
            value={domain}
            onChange={e => { setDomain(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleScan()}
            placeholder="example.com"
            className="flex-1 bg-transparent px-3 py-3.5 text-terminal-text placeholder-terminal-border outline-none font-mono"
            autoFocus
          />
          <button
            onClick={handleScan}
            className="px-5 py-3.5 bg-terminal-blue/10 hover:bg-terminal-blue/20 border-l border-terminal-border text-terminal-blue transition-colors font-mono text-sm"
          >
            scan →
          </button>
        </div>
        {error && <p className="mt-2 text-terminal-red text-xs">{error}</p>}
      </div>

      {/* Quick examples */}
      <div className="mt-4 flex gap-2 flex-wrap justify-center">
        {['github.com', 'cloudflare.com', 'google.com'].map(d => (
          <button
            key={d}
            onClick={() => router.push(`/check/${d}`)}
            className="text-xs text-terminal-muted hover:text-terminal-blue border border-terminal-border hover:border-terminal-blue/50 rounded px-3 py-1.5 transition-colors"
          >
            {d}
          </button>
        ))}
      </div>

      {/* Recent scans */}
      {recents.length > 0 && (
        <div className="mt-12 w-full max-w-xl">
          <p className="text-terminal-muted text-xs mb-3 uppercase tracking-widest">Recent Scans</p>
          <div className="border border-terminal-border rounded-lg overflow-hidden" style={{ background: 'var(--surface)' }}>
            {recents.map((r, i) => (
              <button
                key={i}
                onClick={() => router.push(`/check/${r.domain}`)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-terminal-blue/5 border-b border-terminal-border/50 last:border-0 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-1.5 h-1.5 rounded-full ${r.issues > 0 ? 'bg-terminal-yellow' : 'bg-terminal-green'}`} />
                  <span className="text-terminal-text text-sm group-hover:text-terminal-blue transition-colors">
                    {r.domain}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-terminal-muted">
                  {r.issues > 0 && (
                    <span className="text-terminal-yellow">{r.issues} issues</span>
                  )}
                  <span>{timeAgo(r.scanned_at)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <footer className="mt-12 text-terminal-border text-xs">
        For educational &amp; authorized use only
      </footer>
    </main>
  )
}