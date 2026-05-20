# SalesArena — Source Files

Raw `.html` + `.jsx` source for the SalesArena user-journey prototype.

## Files

| File | What it contains |
|---|---|
| `Sales-as-a-service.html` | Host page. CSS variables (light theme tokens) live in `<style>` here. Loads the 5 JSX files via Babel standalone. |
| `ui.jsx` | Design-system primitives: `Logo`, `Btn`, `Card`, `Avatar`, `Stat`, `Field`, `TextInput`, `Chip`, `DifficultyTag`, `RankBadge`, `ActivityHeatmap` (GitHub-style contribution grid), `Icon` (inline SVG set), and the `DIFFICULTY` / `RANKS` lookup tables. |
| `app.jsx` | Root `<App>` + `JourneyNav`. Hash-based router. Maps a `view` id to a screen component. |
| `screens-salesperson.jsx` | Landing, Sign Up, Onboarding, Dashboard, plus the landing's extended sections: `ProductShowcase`, `PersonaShowcase`, `AudienceTabs`, `OutcomesStrip`, `SocialProofStrip`, `FAQSection`, `FinalCTABanner`. Also exports the `AppShell` (sidebar + topbar) used by all salesperson app screens. |
| `screens-salesperson-2.jsx` | Challenge browse, Challenge detail, Lead Conversation (interactive chat), Result (score breakdown + radar), Leaderboard, Profile, Jobs. |
| `screens-company.jsx` | Company app shell + Company Dashboard, Talent Search, Job Posting (multi-step form), Candidate Profile. |

## Architecture notes for Next.js conversion

### 1. Component sharing across files
Currently each `<script type="text/babel">` gets its own scope. Components are exposed by writing them to `window.*` at the bottom of each file:
```js
Object.assign(window, { LandingScreen, SignupScreen, ... });
```
**For Next.js:** convert these to normal `import` / `export` statements. Delete the `Object.assign(window, ...)` blocks.

### 2. Routing
Currently a single SPA with `hashchange` routing in `app.jsx`. Each "view" id maps 1:1 to a screen component — natural fit for Next.js file-based routing:

| View id | Suggested route |
|---|---|
| `landing` | `/` |
| `signup` | `/signup` |
| `onboarding` | `/onboarding` |
| `dashboard` | `/dashboard` |
| `challenges` | `/challenges` |
| `challenge-detail` | `/challenges/[id]` |
| `conversation` | `/challenges/[id]/conversation` |
| `result` | `/challenges/[id]/result` |
| `leaderboard` | `/leaderboard` |
| `profile` | `/profile` (or `/u/[handle]`) |
| `jobs` | `/jobs` |
| `co-dashboard` | `/company` |
| `co-talent` | `/company/talent` |
| `co-candidate` | `/company/talent/[id]` |
| `co-jobpost` | `/company/jobs/new` |

The `JourneyNav` component is a prototype-only artifact (lets reviewers jump between screens) — drop it in the Next.js build.

The `go(id)` prop passed to every screen becomes `router.push(<path>)`.

### 3. Layouts
- `AppShell` (in `screens-salesperson.jsx`) → wrap with Next.js `layout.tsx` for `/dashboard`, `/challenges`, etc.
- `CompanyShell` (in `screens-company.jsx`) → `layout.tsx` for `/company/*`.
- Landing / Signup / Onboarding don't use a shell.

### 4. State currently faked
Everything is hard-coded mock data — leaderboards, jobs, candidates, the chat replies in `ConversationScreen` (scripted array `SCRIPTED_LEAD`). Replace with real data fetching. The rubric formula in `ResultScreen` is real and can stay as a client-side calculation.

### 5. Styling
- CSS custom properties in `Sales-as-a-service.html`'s `<style>` block — port to a global CSS file or Tailwind theme config.
- All component styles are inline `style={{ ... }}` objects with `var(--token)` references. They'll work in Next.js as-is, or you can convert progressively to Tailwind / CSS Modules.
- Three Google fonts: Space Grotesk (display), DM Sans (body), JetBrains Mono (stats/code).

### 6. Dependencies to install
```bash
npm install react@18 react-dom@18
```
That's it — no other runtime deps. No icon library (icons are inline SVG in `ui.jsx`'s `Icon` object).

### 7. Things to remove for production
- `data-screen-label` attributes — prototype-only debug aids.
- `JourneyNav` — prototype navigation.
- `ImgPh` / `stripe-ph` placeholder utility — replace with real `<Image>` components.
- `generateActivityData()` in `ActivityHeatmap` — replace seeded fake data with real DB query.

## Starting point

If you're feeding this to Claude Code or similar, point it at this folder and ask for:
> Convert this React prototype to a Next.js 14 App Router project. Each "view" in `app.jsx`'s screens map becomes a route. Shared components (Btn, Card, RankBadge, etc.) move to `components/`. CSS variables in the host HTML become a `globals.css`. Replace `window.*` exports with ES module imports.

That single prompt should get 80% of the way there.
