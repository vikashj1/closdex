# Closdex — Project Guide for Claude

## What this is
Closdex is a CodeChef-style gamification platform for B2B salespeople. Salespeople complete AI-driven roleplay challenges to earn points and rank up. Companies search talent and post jobs. Admins manage challenges, personas, scoring, and disputes.

## Monorepo layout

```
closdex/
├── apps/api/          NestJS 10 backend
├── apps/web/          Next.js 14 frontend
└── packages/db/       Prisma schema + generated client
```

## Stack

| Layer | Tech |
|-------|------|
| API | NestJS 10, Prisma 5, PostgreSQL 16, Redis 7, BullMQ |
| Web | Next.js 14 App Router, React 18, no Tailwind — inline style={{}} only |
| Auth | JWT in localStorage (`closdex.token`), `useRequireAuth(role)` guards pages |
| LLM | OpenAI-compatible via NVIDIA NIM (`nvapi-…`); `LlmProvider` injectable |
| Tests | Jest + ts-jest in `apps/api`; 411 specs, 24 suites |

## Running locally

```bash
# Prerequisites: Postgres 16 + Redis 7 running (Docker recommended)
# Set env vars: DATABASE_URL, REDIS_URL, JWT_SECRET, LLM_API_KEY, LLM_BASE_URL

cd apps/api && pnpm dev        # :4000
cd apps/web && pnpm dev        # :3000

# Run API tests
cd apps/api && npx jest --forceExit
# Typecheck web
cd apps/web && npx tsc --noEmit
```

## Environment variables (apps/api)

```
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
JWT_SECRET=...
LLM_API_KEY=nvapi-...           # NVIDIA NIM key — rotate after public exposure
LLM_BASE_URL=https://integrate.api.nvidia.com/v1
LLM_MODEL=meta/llama-3.1-8b-instruct
```

## Key files

| File | Purpose |
|------|---------|
| `apps/web/lib/api.ts` | Typed fetch client — all API methods + response types live here |
| `apps/web/lib/auth.tsx` | AuthProvider + useAuth + useRequireAuth |
| `apps/web/components/shell/AppShell.tsx` | Salesperson sidebar nav |
| `apps/web/app/(app)/` | All salesperson-facing pages |
| `apps/web/app/company/` | All company/recruiter pages |
| `apps/web/app/admin/` | Admin panel (challenges, personas, disputes, config, audit) |
| `apps/web/app/u/[slug]/` | Public shareable profile |
| `apps/api/src/scoring/` | Scoring, rubric, AI evaluation, streak update |
| `packages/db/prisma/schema.prisma` | Single source of truth for all DB types |

## Frontend conventions

- **No Tailwind.** All styling via inline `style={{}}` with CSS custom properties.
- CSS vars: `--bg`, `--bg-2`, `--surface`, `--border`, `--border-soft`, `--text`, `--text-dim`, `--text-mute`, `--gold`, `--emerald`, `--cool`, `--d-expert`, `--r-master`, `--r-${rank.toLowerCase()}`
- UI components in `apps/web/components/ui/`: `Card`, `Btn`, `Avatar`, `RankBadge`, `DifficultyTag`, `Stat`, `TextInput`, `Chip`, `Icon`, `ActivityHeatmap`, `Logo`
- Auth: every page calls `useRequireAuth('SALESPERSON' | 'COMPANY' | 'ADMIN')` at the top
- No `Icon.x` — use inline SVG `<path d="M18 6 6 18M6 6l12 12"/>` for close buttons

## Backend conventions

- All services accept `AuthUser` (`{ id, email, role }`) — never add extra fields to it
- `DisputeStatus` values: OPEN, UNDER_REVIEW, RESOLVED, REJECTED (no PENDING)
- `UserRole` values: SALESPERSON, COMPANY, ADMIN (no COMPANY_MEMBER)
- When mocking Prisma in tests: `prisma.$transaction = jest.fn((cb) => cb(mockTx))`
- Partial DTOs in tests: cast to `as any` to avoid required-field errors

## Deployment (VPS)

- Host: Bluehost 129.121.98.198
- Docker: Postgres 16 + Redis 7
- API + web run as systemd services
- Traefik on 80/443 (config at `/opt/hostedapps/dynamic/closdex.toml`)
- DNS: `closdex.in` must point to the VPS — **PENDING Vikash action**

## Security alerts (unresolved)

- SSH root private key was posted publicly — **rotation required**
- NIM API key was posted publicly — **rotation required**
- Email delivery credentials (SES/Sendgrid) not yet configured

## Slice history (slices 1–47 committed on `main`)

All UI pages complete through slice 47. Full test coverage at slice 41 (439 specs, 26 suites).
No remaining "coming soon" placeholders — all features shipped.

- Slice 38: Config edit UI (inline editing for all 5 scoring config tables + goal types)
- Slice 39: Badges system (NestJS module, admin UI, profile display, 6 demo badges in seed)
- Slice 40: Profile viewer tracking (ProfileView schema, auto-record on talent fetch, profile page display)
- Slice 41: Tests for BadgesService (15 specs) + ProfileViewsService (13 specs)
- Slice 42: Job lifecycle management — pause/close/repost + edit page (company/jobs)
- Slice 43: Admin learning content management — tracks, tutorials, quizzes CRUD UI
- Slice 44: Invoice actions on hires page — issue/void/mark-paid inline buttons
- Slice 45: Application pipeline management — Shortlist/Interview/Offer/Hire/Reject buttons
- Slice 46: Notifications inbox page — unread filter, mark-read, mark-all-read
- Slice 47: Salesperson job detail page — full JD view + apply from detail
