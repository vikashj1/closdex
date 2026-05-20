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

### M4 — Scoring engine (slice 2: Redis leaderboards)
- `redis/redis.module.ts` — global ioredis client behind a `REDIS_CLIENT` token.
- `leaderboards/leaderboards.service.ts` — sorted-set updates per scoring event
  (4 periods × 2 scopes = 8 ZINCRBY ops, pipelined). Period buckets computed in
  IST so daily/weekly/monthly rotate at the boundaries the SOW specifies
  (00:00 IST daily, Monday for weekly, 1st of month for monthly). TTLs: 48h daily,
  14d weekly, 60d monthly, none for all-time. Read path enriches Redis IDs with
  salesperson info from Postgres.
- ScoringService now calls `LeaderboardsService.recordScore` after each persist.
  Redis failures are logged but never throw — Postgres remains the source of
  truth, leaderboards are a read-optimized projection.
- `GET /api/leaderboards?period=&category=&limit=` — Bearer required.

## Endpoints (additions)

### Leaderboards (Bearer required)
- `GET /api/leaderboards?period=daily|weekly|monthly|all-time&category=...&limit=50`

### M5 — Learning library (slice 1: admin CRUD)
- `learning/` — tracks, tutorials, quizzes. Single LearningService, single
  LearningController grouped under `/api/learning`.
- Cross-field validation: video tutorials require `contentUrl`, article tutorials
  require `body`. Quiz `answerIndex` is range-checked against `options.length`.
- Visibility shaping: quiz `answerIndex` values are stripped for non-admin viewers
  (salespeople take the quiz blind).

### Endpoints (learning, Bearer required)

Public-to-authenticated:
- `GET /api/learning/tracks` — list tracks + lightweight tutorial summaries
- `GET /api/learning/tracks/:id` — track + nested tutorials (+ quiz, answer-stripped)
- `GET /api/learning/tutorials/:id` — single tutorial (+ quiz, answer-stripped)

ADMIN:
- `POST   /api/learning/tracks` · `PATCH /api/learning/tracks/:id` · `DELETE /api/learning/tracks/:id`
- `POST   /api/learning/tracks/:trackId/tutorials`
- `PATCH  /api/learning/tutorials/:id` · `DELETE /api/learning/tutorials/:id`
- `PUT    /api/learning/tutorials/:tutorialId/quiz` (upsert) · `DELETE` (same path)

### M5 slice 2 — salesperson consumption
- `POST /api/learning/tutorials/:id/complete` — appends to TrackProgress
  (idempotent — same tutorial twice doesn't double-count).
- `POST /api/learning/quizzes/:id/attempt` — body `{ answerIndices: number[] }`.
  Scored server-side; pass threshold 70% (constant). Writes QuizAttempt. On
  the salesperson's **first** passing attempt, awards `quiz.rewardPoints` via
  PointsTransaction QUIZ_REWARD + updates leaderboards (scoped to the track's
  category). Subsequent passes don't re-award — prevents farming.
- `GET /api/learning/me/progress` — TrackProgress for the authed salesperson.

### M6 — Talent marketplace (slice 1: jobs + applications + ATS)
- `jobs/` — Jobs CRUD with lifecycle (DRAFT → LIVE ⇄ PAUSED → CLOSED → LIVE).
  Company-member-aware visibility: non-members see LIVE only, members see all
  their company's jobs in any status.
- `jobs/applications.service.ts` — salesperson apply (one-click; resume URL
  snapshotted at apply time; min-rank gated; deadline-gated; uniqueness on
  `(jobId, salespersonId)`). Company-side application listing (any company role
  including VIEWER). ATS state transitions enforced — APPLIED→VIEWED/SHORTLISTED/
  REJECTED, VIEWED→SHORTLISTED/REJECTED, SHORTLISTED→INTERVIEW/REJECTED,
  INTERVIEW→OFFERED/REJECTED, OFFERED→HIRED/REJECTED. HIRED and REJECTED terminal.
- ADMIN/RECRUITER write jobs; VIEWER reads applications. Platform-level ADMIN
  overrides company-role checks.

### Endpoints (jobs, Bearer required)

Jobs:
- `GET    /api/jobs` — list, filtered + paginated. Non-members see LIVE only.
- `GET    /api/jobs/:id`
- `POST   /api/jobs` — company ADMIN/RECRUITER (companyId in body, ownership checked)
- `PATCH  /api/jobs/:id` — company ADMIN/RECRUITER
- `POST   /api/jobs/:id/publish` · `pause` · `close` · `repost`

Applications:
- `POST /api/jobs/:id/apply` — SALESPERSON; enforces min-rank, deadline, uniqueness
- `GET  /api/jobs/:id/applications` — company member (any role)
- `GET  /api/applications/me` — SALESPERSON
- `GET  /api/applications/:id` — salesperson owner OR company member
- `PATCH /api/applications/:id` — company ADMIN/RECRUITER; validates state transition

## Next (M6 slice 2)

Talent search/filter (company-side discovery): rank, points, category performance,
location, experience, availability. Shortlists CRUD. Then M7 (payments + admin):
Razorpay subscriptions, placement commission flow (HIRED triggers Placement
record + invoice), admin/CMS surfaces.

## Run

```bash
pnpm install
pnpm --filter @closdex/db generate
pnpm --filter @closdex/api start:dev
```

Needs Postgres + Redis up (`docker compose up -d`), `.env` filled, and an LLM API
key for whichever provider (`AI_PROVIDER=openai` or `anthropic`).
