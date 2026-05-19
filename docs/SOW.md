# SOW — Closdex (Sales Gamification & Talent Marketplace Platform)

> Merged from the two source files Vikash shared on 2026-05-19 (a body export that
> dropped all tables + a second file restoring the 7 tables). This is the canonical
> spec for the build.

## What it is
A CodeChef-style competitive platform for sales professionals. Salespeople practice
against AI-simulated leads, get scored on a rubric, climb leaderboards/ranks; companies
browse rank-vetted talent, post jobs, hire. Revenue: placement commission (10-15% of
annual CTC) + tiered company subscriptions. Phase 1 = IT Sales vertical, Tier-1 India,
mobile-responsive web. Seed 10 salespeople → scale to 50-100 before onboarding companies.

## Phase 1 scope (MVP)
Salesperson reg/onboarding; challenge engine w/ AI lead sims (chat only); difficulty-
tiered challenge library; real-time scoring; leaderboards (daily/weekly/monthly/all-time);
rank/badge system; tutorials/learning library; company reg + KYC; job posting +
application mgmt; talent search/filter; basic ATS; admin panel; payments; notifications.

**Out of scope (P1):** voice/video sims, native mobile apps, multi-vertical, team
challenges, salesperson premium tier, AI coaching.

## 8 system components
Identity & Access · Challenge Engine · AI Lead Simulation · Scoring Engine · Talent
Marketplace · Notifications · Payments · Admin/CMS.

## T1 — Success criteria (first 6 months)
500+ registered salespeople · 150+ weekly active · 25+ verified companies · 40+ live
job listings · 10+ confirmed placements · 60%+ challenge completion rate.

## T2 — Tech stack (SOW recommendation)
Next.js + Tailwind front · Node/NestJS **or** Python/FastAPI back · PostgreSQL · Redis
(leaderboard sorted sets, cache, rate-limit) · BullMQ/Celery queue · LLM = OpenAI
GPT-4o-mini primary + Claude Haiku fallback · Socket.IO/Pusher realtime · S3/R2 storage ·
Auth.js/Clerk + LinkedIn OAuth · Razorpay (IN) + Stripe (intl) · PostHog analytics ·
AWS/Vercel + RDS, Mumbai region.

_Build decisions (see root README): NestJS backend, Prisma ORM, AI provider behind a
pluggable interface._

## T3 — Difficulty tiers (base points)
| Tier | Color | Base | Lead behaviour |
|------|-------|------|----------------|
| Rookie | Green | 50 | Warm, cooperative |
| Easy | Light Green | 100 | Mildly curious, one minor objection |
| Medium | Yellow | 200 | Skeptical, 2-3 objections, asks for proof |
| Hard | Orange | 400 | Busy, dismissive, gatekeeper-like |
| Expert | Red | 800 | Hostile, well-informed, comparison shopping |

## T4 — Goal types & multipliers
Qualify Lead 1.0× · Book Discovery Call 1.2× · Send Proposal/Demo 1.4× · Reach Decision
Maker 1.5× · Win-back/Re-engage 1.6× · Close the Deal 2.0×.

## T5 — Quality multiplier (5 dimensions, 20% each)
Discovery & Listening · Objection Handling · Value Articulation · Conversational Quality ·
Goal Execution. Each scored 0-5 by the AI evaluator; total/25 = quality multiplier (0-1).

## §6.3 — Final score formula
`Final = (Base × Goal mult × Quality mult) + Bonuses − Penalties`
- **Bonuses:** speed +10% (goal in <60% of messages), first-try +15%, streak +5/day
  (cap 50), difficulty-jump +20% (challenge ≥2 tiers above rank).
- **Penalties:** spam −50, lying −100, abandonment −25, repeat-attempt decay to 70% per
  retry. Goal not achieved → up to 40% of (Base × Quality) for effort.

## T6 — Rank system (points; rank never decays)
Rookie 0-499 · Bronze 500-1.5k · Silver 1.5k-4k · Gold 4k-9k · Platinum 9k-18k ·
Diamond 18k-35k · Master 35k-70k · Grandmaster 70k+.

## T7 — Company pricing (INR/month)
Free Browse ₹0 · Starter ₹4,999 · Growth ₹14,999 · Scale ₹39,999 · Enterprise custom.

## Leaderboards & resets
Daily (00:00 IST) · Weekly (Mon) · Monthly (1st) · All-time (never) · Season (3-monthly,
optional rewards). Tie-break: fewer messages → fewer attempts → earlier completion.

## Fairness rules
Score disputes reviewed within 48h. Gaming detection (repeat/scripted patterns) → flag +
penalty. Account sharing (IP + device fingerprint) → 30-day suspension + leaderboard reset.
