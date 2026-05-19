# apps/api — Closdex backend

NestJS (Node + TypeScript). The SOW's 8 system components become Nest modules.

## Landed

### M2 — Identity & Access
- `prisma/` — global PrismaService wrapping the `@closdex/db` client
- `auth/` — email/password registration & login, JWT (7d), passport-jwt strategy
  - role-aware registration: salesperson → SalespersonProfile (+ unique public slug);
    company → Company + ADMIN membership. ADMIN signup is blocked.
  - `JwtAuthGuard`, `RolesGuard` + `@Roles()` / `@CurrentUser()` — RBAC primitives
- `users/` — profile read + edit (user fields + salesperson-only fields)
- `companies/` — read + ADMIN-only edit

### M3 — Challenge Engine + AI Lead Simulation
- `personas/` — admin-only CRUD for lead personas; `personalityPrompt` (the LLM
  system prompt) is never returned to non-admins, by design
- `challenges/` — challenge CRUD + lifecycle (publish/archive). Non-admins see
  PUBLISHED only. Filtering by difficulty / goalType / category.
- `ai/` — provider-agnostic LLM interface, OpenAI + Anthropic providers, persona-driven
  `AiLeadService`. Provider selected by `AI_PROVIDER` env (`openai` | `anthropic`).
  Anthropic provider uses prompt caching on the persona system prompt + the trailing
  message in conversation history.
- `attempts/` — challenge attempt lifecycle: start, send message (drives the AI lead
  reply), end. Auto-completes when the salesperson hits `challenge.maxMessages`. The
  persona's `personalityPrompt` is stripped from every response shape.

## Endpoints

### Auth
- `POST /api/auth/register` — `{ email, password, name, role, companyName? }`
- `POST /api/auth/login` — `{ email, password }` → `{ accessToken, user }`

### Users (Bearer required)
- `GET   /api/users/me` — full profile
- `PATCH /api/users/me` — name / photoUrl / location
- `PATCH /api/users/me/salesperson` — salesperson-only fields (role-guarded)

### Companies
- `GET   /api/companies/:id` — public
- `PATCH /api/companies/:id` — Bearer + company ADMIN membership

### Personas (ADMIN, Bearer required)
- `GET   /api/personas` · `GET /api/personas/:id`
- `POST  /api/personas` · `PATCH /api/personas/:id`

### Challenges (Bearer required)
- `GET   /api/challenges` — list (filters: difficulty, goalType, category;
  paginated). Non-admins see PUBLISHED only.
- `GET   /api/challenges/:id` — detail
- `POST  /api/challenges` — ADMIN
- `PATCH /api/challenges/:id` — ADMIN
- `POST  /api/challenges/:id/publish` · `POST /api/challenges/:id/archive` — ADMIN

### Challenge attempts (SALESPERSON, Bearer required)
- `POST /api/challenges/:id/attempts` — start a new attempt
- `GET  /api/attempts/me` — list my attempts
- `GET  /api/attempts/:id` — attempt state + conversation
- `POST /api/attempts/:id/messages` — `{ content }` → `{ attempt, leadReply }`
- `POST /api/attempts/:id/end` — manually abandon

### M4 — Scoring engine (slice 1)
- `scoring/rubric.service.ts` — pure math, mirrors SOW §6.3 exactly. Inputs: base
  points, goal multiplier, 5 quality dims (0-5 each), bonuses/penalties flags,
  attempt number for repeat-attempt decay. Decay applies to earnings (base+bonuses)
  only — penalties stay at full value across retries.
- `scoring/ai-evaluator.service.ts` — provider-agnostic LLM call that returns the
  5 quality dims + goalAchieved + spamDetected + lyingDetected. Parses JSON with a
  conservative fallback (zeroed dims on parse failure → 0 points, reviewable via
  ScoreDispute).
- `scoring/scoring.service.ts` — orchestrator. Triggered when an attempt completes
  or is abandoned: loads config, runs evaluator, updates streak, computes rubric,
  writes PointsTransaction ledger entries (CHALLENGE_SCORE + one per bonus/penalty),
  updates SalespersonProfile.totalPoints (clamped at 0), promotes rank if applicable
  (ranks never decay per SOW §6.5).
- Scoring is awaited inline in `attempts.service` on COMPLETED/ABANDONED transitions
  but wrapped in try/catch — AI failure leaves the attempt unscored (recoverable),
  not failed.

## Next (M4 slice 2)

Redis client + sorted sets for daily / weekly / monthly / all-time leaderboards, plus
endpoints to query them. Optional polish: move scoring to a BullMQ queue so the
salesperson's last-message response doesn't wait on the evaluator.

## Run

```bash
pnpm install
pnpm --filter @closdex/db generate
pnpm --filter @closdex/api start:dev
```

Needs Postgres + Redis up (`docker compose up -d`), `.env` filled, and an LLM API
key for whichever provider (`AI_PROVIDER=openai` or `anthropic`).
