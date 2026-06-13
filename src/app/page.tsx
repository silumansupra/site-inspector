'use client'
// src/app/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router   = useRouter()
  const [domain, setDomain] = useState('')
  const [error,  setError]  = useState('')

  const handleScan = () => {
    const cleaned = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim()
    if (!cleaned) { setError('Please enter a domain'); return }
    const valid = /^([a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(cleaned)
    if (!valid)   { setError('Invalid domain format'); return }
    setError('')
    router.push(`/check/${cleaned}`)
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
          web<span className="text-terminal-blue">_</span>scanner
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

        <p className="mt-3 text-terminal-border text-xs text-center">
          e.g. github.com · google.com · cloudflare.com
        </p>
      </div>

      {/* Quick examples */}
      <div className="mt-8 flex gap-2 flex-wrap justify-center">
        {['github.com', 'cloudflare.com', 'google.com'].map(d => (
          <button
            key={d}
            onClick={() => { setDomain(d); setError(''); router.push(`/check/${d}`) }}
            className="text-xs text-terminal-muted hover:text-terminal-blue border border-terminal-border hover:border-terminal-blue/50 rounded px-3 py-1.5 transition-colors"
          >
            {d}
          </button>
        ))}
      </div>

      <footer className="absolute bottom-6 text-terminal-border text-xs">
        For educational &amp; authorized use only
      </footer>
    </main>
  )
}
