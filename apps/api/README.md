# apps/api — Closdex backend

NestJS (Node + TypeScript). The SOW's 8 system components become Nest modules.

## Landed (M2 — Identity & Access, slice 1)

- `prisma/` — global PrismaService wrapping the `@closdex/db` client
- `auth/` — email/password registration & login, JWT (7d), passport-jwt strategy
  - role-aware registration: salesperson → SalespersonProfile (+ unique public slug);
    company → Company + ADMIN membership. ADMIN signup is blocked.
  - `JwtAuthGuard`, `RolesGuard` + `@Roles()` / `@CurrentUser()` — RBAC primitives
- `users/` — `GET /api/users/me` (full profile, password hash stripped)

## Endpoints

- `POST /api/auth/register` — `{ email, password, name, role, companyName? }`
- `POST /api/auth/login` — `{ email, password }` → `{ accessToken, user }`
- `GET  /api/users/me` — Bearer token required

## Next (M2 slice 2)

Google + LinkedIn OAuth, profile editing (specialization tags, resume upload,
visibility/open-to-work), company KYC fields.

## Run

```bash
pnpm install
pnpm --filter @closdex/db generate     # prisma client
pnpm --filter @closdex/api start:dev
```

Needs Postgres + Redis up (`docker compose up -d`) and `.env` filled.

## Remaining modules (M3+)

`challenge`, `ai-lead`, `scoring`, `marketplace`, `notification`, `payment`, `admin`.
