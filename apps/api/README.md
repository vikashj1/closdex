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

### M3 — Challenge Engine (slice 1)
- `personas/` — admin-only CRUD for lead personas; `personalityPrompt` (the LLM system
  prompt) is never returned to non-admins, by design
- `challenges/` — challenge CRUD + lifecycle (publish/archive). Non-admins see only
  PUBLISHED. Filtering by difficulty / goalType / category. Persona shown to
  salespeople omits the personalityPrompt.

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

## Next (M3 slice 2)

Starting a challenge attempt + the AI lead conversation loop (provider-agnostic LLM
call, persona-driven, goal/milestone evaluator). Scoring (rubric + bonuses/penalties)
sits in M4 and writes to the points ledger + Redis leaderboards.

## Run

```bash
pnpm install
pnpm --filter @closdex/db generate
pnpm --filter @closdex/api start:dev
```

Needs Postgres + Redis up (`docker compose up -d`) and `.env` filled.
