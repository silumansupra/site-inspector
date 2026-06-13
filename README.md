# web-scanner
#

OSINT & Security scanner — DNS, SSL, Headers, WHOIS, Ports, Robots.txt

Built with Next.js 14 + TypeScript + Tailwind. Realtime streaming results via SSE.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Open browser
http://localhost:3000
```

No `.env` needed for local development. All lookups use Node.js built-ins.

---

## Project Structure

```
src/
├── app/
│   ├── api/scan/route.ts          # SSE endpoint — triggers all lookups in parallel
│   ├── check/[domain]/page.tsx    # Results page (consumes SSE stream)
│   └── page.tsx                   # Home page with domain input
├── components/
│   └── ResultCard.tsx             # Renders each lookup result
└── lib/
    ├── lookups/
    │   ├── headers.ts             # HTTP headers + redirect chain
    │   ├── dns.ts                 # A, AAAA, MX, NS, TXT, CNAME
    │   ├── ssl.ts                 # TLS cert info via node:tls
    │   ├── whois.ts               # Raw WHOIS query via node:net
    │   ├── ports.ts               # Port scanner via node:net
    │   ├── robots.ts              # robots.txt parser
    │   ├── security-headers.ts    # Security score + grade
    │   └── index.ts               # Barrel export + ALL_LOOKUPS array
    ├── types.ts                   # All TypeScript interfaces
    └── utils.ts                   # Domain validator (zod)
```

---

## Adding a New Lookup

1. Create `src/lib/lookups/your-lookup.ts`:

```typescript
import type { LookupResult } from '@/lib/types'

export interface YourData {
  // define shape
}

export async function checkYourThing(domain: string): Promise<LookupResult<YourData>> {
  const start = Date.now()
  try {
    // your logic
    return { id: 'your-id', label: 'Your Label', status: 'success', duration: Date.now() - start, data: { ... } }
  } catch (err) {
    return { id: 'your-id', label: 'Your Label', status: 'error', duration: Date.now() - start, error: String(err) }
  }
}
```

2. Add to `src/lib/lookups/index.ts`:
```typescript
export { checkYourThing } from './your-lookup'
// add to ALL_LOOKUPS array
```

3. Add a `case 'your-id':` in `ResultCard.tsx` → `ResultBody()`

That's it — it will automatically run in parallel with all other lookups.

---

## Stack

| Layer     | Tech                        |
|-----------|-----------------------------|
| Frontend  | Next.js 14 App Router       |
| Styling   | Tailwind CSS (dark terminal theme) |
| Streaming | Server-Sent Events (SSE)    |
| Lookups   | Node.js built-ins (dns, tls, net) + fetch |
| Validation| Zod                         |

---

## Roadmap

- [ ] DNSSEC check
- [ ] HTTP/2 & HTTP/3 detection
- [ ] Technology stack detection (Wappalyzer-style)
- [ ] Carbon footprint estimate
- [ ] Export results as JSON
- [ ] Redis caching layer (avoid re-scanning same domain)
- [ ] Rate limiting per IP
