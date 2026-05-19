# apps/api — Closdex backend

NestJS (Node + TypeScript). The SOW's 8 system components become Nest modules.

## Landed (M2 — Identity & Access)

- `prisma/` — global PrismaService wrapping the `@closdex/db` client
- `auth/` — email/password registration & login, JWT (7d), passport-jwt strategy
  - role-aware registration: salesperson → SalespersonProfile (+ unique public slug);
    company → Company + ADMIN membership. ADMIN signup is blocked.
  - `JwtAuthGuard`, `RolesGuard` + `@Roles()` / `@CurrentUser()` — RBAC primitives
- `users/` — profile read + edit
- `companies/` — company read + ADMIN-only edit

## Endpoints

### Auth
- `POST /api/auth/register` — `{ email, password, name, role, companyName? }`
- `POST /api/auth/login` — `{ email, password }` → `{ accessToken, user }`

### Users (Bearer required)
- `GET  /api/users/me` — full profile (User + salesperson + companies)
- `PATCH /api/users/me` — edit name / photoUrl / location
- `PATCH /api/users/me/salesperson` — salesperson-only: experienceYears,
  currentCompany, specializationTags, skillSelfAssessment, resumeUrl, visibility,
  openToWork, preferredLocations, salaryExpectation

### Companies
- `GET  /api/companies/:id` — public
- `PATCH /api/companies/:id` — Bearer + company ADMIN membership required

## Next (M2 slice 3)

OAuth (Google + LinkedIn) — needs a real redirect URL, so it lands once the frontend
has the callback page. Then M3: challenge engine + AI lead simulation.

## Run

```bash
pnpm install
pnpm --filter @closdex/db generate     # prisma client
pnpm --filter @closdex/api start:dev
```

Needs Postgres + Redis up (`docker compose up -d`) and `.env` filled.
