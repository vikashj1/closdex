# Closdex

A CodeChef-style competitive platform for sales professionals. Salespeople practice
against AI-simulated leads, get scored on a transparent rubric, climb leaderboards and
ranks. Companies browse rank-vetted talent, post jobs, and hire. Revenue comes from
placement commissions and tiered company subscriptions.

Full spec: [`docs/SOW.md`](docs/SOW.md).

## Stack

Decisions made at scaffold time (the SOW left backend framework and ORM open):

| Layer        | Choice                          | Note |
|--------------|---------------------------------|------|
| Frontend     | Next.js + TypeScript + Tailwind | mobile-responsive web (Phase 1) |
| Backend      | NestJS (Node + TypeScript)      | maps cleanly onto the 8-service split |
| ORM          | Prisma                          | typed schema, migrations |
| Database     | PostgreSQL                      | relational core: scoring, jobs, billing |
| Cache / RT   | Redis                           | leaderboard sorted sets, sessions, rate limits |
| AI layer     | provider-agnostic interface     | SOW default GPT-4o-mini; Claude as alternative — pluggable |
| Payments     | Razorpay (India)                | UPI/cards, GST invoicing, GSTIN/PAN KYC |
| Monorepo     | pnpm workspaces                 | light, no extra build orchestration yet |

The AI provider is deliberately behind an interface — the SOW names GPT-4o-mini as
primary, but the engine shouldn't care. Final call belongs at the M3 kickoff.

## Layout

```
closdex/
  apps/
    api/      NestJS backend (the 8 services)        — M2+
    web/      Next.js frontend                       — M2+
  packages/
    db/       Prisma schema, migrations, seed        — done (M1)
  docs/
    SOW.md    merged statement of work
  docker-compose.yml   local Postgres + Redis
```

## Running locally

```bash
pnpm install
docker compose up -d            # Postgres + Redis
cp .env.example .env            # then fill in secrets
pnpm --filter @closdex/db prisma migrate dev
pnpm --filter @closdex/db seed  # loads rubric/rank/pricing config from the SOW
```

## Milestone roadmap

- **M1 — Foundation** ✅ repo, infra, data model, SOW config seed
- **M2 — Identity & Access** auth (email + Google + LinkedIn OAuth), salesperson &
  company onboarding, profiles
- **M3 — Challenge Engine + AI Lead Simulation** challenge CRUD, persona-driven AI
  lead chat, conversation state
- **M4 — Scoring + Leaderboards** rubric scoring, bonuses/penalties, Redis
  leaderboards, ranks & badges
- **M5 — Learning Library** tracks, tutorials, quizzes
- **M6 — Talent Marketplace** company profiles, job posting, talent search, basic ATS
- **M7 — Payments + Admin** Razorpay subscriptions & placement invoicing, admin/CMS
- **M8 — Hardening** notifications, polish, tests, deploy

Status: **M1–M7 (less Razorpay) + M8 (slice 1: notifications) in.** M2 less
OAuth. Notifications wired into application transitions, hire flow, dispute
resolution, and company verification — email goes through a swappable
provider (LogEmailProvider until SES/Sendgrid lands). M7 slice 2 (Razorpay)
paused on owner ack. M8 polish backlog: BullMQ async scoring, tests, deploy.
