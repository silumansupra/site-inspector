# site-inspector

OSINT & Security scanner — DNS, SSL, Headers, WHOIS, Ports, Robots.txt

Built with Next.js 14 + TypeScript + Tailwind. Realtime streaming results via SSE.

Live: https://site-checker.silumansuprais.my.id

---

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

---

## Environment Variables

```env
SITECHECK_DATABASE_URL=postgres://user:password@host/db?sslmode=require
MIGRATE_SECRET=your-random-secret
```

Run migration once:
GET /api/migrate?secret=YOUR_SECRET

---

## Stack

- **Framework** — Next.js 14 App Router
- **Language** — TypeScript
- **Styling** — Tailwind CSS (dark terminal theme)
- **Streaming** — Server-Sent Events (SSE)
- **Database** — Neon PostgreSQL
- **Validation** — Zod
- **Deploy** — Vercel

---

## Security

- Rate limiting — 10 requests/min per IP
- Domain validation — Zod + regex
- Blocked domains — localhost, raw IPs, AWS metadata endpoint
- Scan timeout — 30 seconds
- Migration endpoint — protected by `MIGRATE_SECRET`
- SQL injection safe — tagged template literals

---

## Lookups

| Lookup | Method |
|---|---|
| HTTP Headers | fetch |
| DNS Records | node:dns |
| SSL Certificate | node:tls |
| WHOIS | RDAP over HTTPS |
| Open Ports | node:net |
| Robots.txt | fetch |
| Security Headers Score | fetch + scoring |

---

## Adding a New Lookup

1. Create `src/lib/lookups/your-lookup.ts`
2. Export and add to `ALL_LOOKUPS` in `src/lib/lookups/index.ts`
3. Add `case 'your-id':` in `ResultCard.tsx`

---

## Deployment
master       → Vercel preview (auto deploy)

master-prod  → Vercel production (protected, merge via PR)

---

## Roadmap

- [ ] DNSSEC check
- [ ] HTTP/2 & HTTP/3 detection
- [ ] Technology stack detection
- [ ] Export results as JSON
- [ ] Upstash Redis rate limiting
- [ ] Scan history page per domain