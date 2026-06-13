'use client'
// src/app/check/[domain]/page.tsx
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ResultCard } from '@/components/ResultCard'
import type { LookupResult, ScanCompleteEvent } from '@/lib/types'

interface Props {
  params: { domain: string }
}

type ScanState = 'scanning' | 'complete' | 'error'

export default function CheckPage({ params }: Props) {
  const { domain } = params

  const [results,   setResults]   = useState<LookupResult<unknown>[]>([])
  const [state,     setState]     = useState<ScanState>('scanning')
  const [summary,   setSummary]   = useState<ScanCompleteEvent | null>(null)
  const [total,     setTotal]     = useState(0)

  useEffect(() => {
    setResults([])
    setState('scanning')
    setSummary(null)

    const es = new EventSource(`/api/scan?domain=${encodeURIComponent(domain)}`)

    es.onmessage = (e) => {
      const data = JSON.parse(e.data)

      if (data.id === 'start') {
        setTotal(data.total)
        return
      }

      if (data.id === 'complete') {
        setSummary(data)
        setState('complete')
        es.close()
        return
      }

      setResults(prev => [...prev, data])
    }

    es.onerror = () => {
      setState('error')
      es.close()
    }

    return () => es.close()
  }, [domain])

  return (
    <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="text-terminal-muted hover:text-terminal-blue text-sm transition-colors">
          ← new scan
        </Link>
        <div className="flex items-center gap-2">
          {state === 'scanning' && (
            <>
              <span className="w-2 h-2 rounded-full bg-terminal-yellow animate-pulse-dot" />
              <span className="text-terminal-yellow text-xs">scanning {results.length}/{total}</span>
            </>
          )}
          {state === 'complete' && (
            <>
              <span className="w-2 h-2 rounded-full bg-terminal-green" />
              <span className="text-terminal-green text-xs">done in {((summary?.duration ?? 0) / 1000).toFixed(1)}s</span>
            </>
          )}
          {state === 'error' && (
            <span className="text-terminal-red text-xs">connection error</span>
          )}
        </div>
      </div>

      {/* Domain heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-terminal-text">
          <span className="text-terminal-muted font-normal text-lg">$ scan </span>
          {domain}
        </h1>
        {state === 'complete' && summary && (
          <div className="flex gap-4 mt-2 text-xs text-terminal-muted">
            <span className="text-terminal-green">{summary.passed} passed</span>
            <span className="text-terminal-red">{summary.issues} issues</span>
            <span>{summary.total} total lookups</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {state === 'scanning' && total > 0 && (
        <div className="mb-6 h-0.5 rounded-full bg-terminal-border overflow-hidden">
          <div
            className="h-full bg-terminal-blue transition-all duration-300"
            style={{ width: `${(results.length / total) * 100}%` }}
          />
        </div>
      )}

      {/* Results grid */}
      <div className="grid gap-4">
        {results.map((r, i) => (
          <ResultCard key={`${r.id}-${i}`} result={r} />
        ))}
      </div>

      {/* Skeleton loaders while scanning */}
      {state === 'scanning' && (
        <div className="grid gap-4 mt-4">
          {Array.from({ length: Math.max(0, total - results.length) }).map((_, i) => (
            <div key={i} className="border border-terminal-border rounded-lg h-20 animate-pulse"
              style={{ background: 'var(--surface)', opacity: 0.5 - i * 0.08 }} />
          ))}
        </div>
      )}
    </main>
  )
}
