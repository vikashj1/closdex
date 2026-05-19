# apps/api — Closdex backend

NestJS (Node + TypeScript). Lands in M2. The SOW's 8 system components become Nest
modules:

- `identity` — registration, login, role-based access (Salesperson / Company / Admin)
- `challenge` — challenge metadata, lead personas, conversation state, goal tracking
- `ai-lead` — LLM orchestration, persona consistency, milestone evaluation (provider
  behind an interface — see root README)
- `scoring` — rubric, points, leaderboard updates
- `marketplace` — company-side search, filters, job postings
- `notification` — email + in-app
- `payment` — Razorpay subscriptions, placement-commission invoicing
- `admin` — challenge/persona CMS, rubric config, moderation

Empty until M2 — scaffolding it now would just be dead code.
