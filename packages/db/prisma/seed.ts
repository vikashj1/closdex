// Seeds the admin-tunable config straight from the SOW (docs/SOW.md tables T3–T7
// + the §6.3 scoring rules). Re-runnable: every write is an upsert.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// T3 — Difficulty tiers
const DIFFICULTY_TIERS = [
  { tier: 'ROOKIE', color: 'Green', basePoints: 50, leadBehavior: 'Warm, cooperative, asks helpful questions' },
  { tier: 'EASY', color: 'Light Green', basePoints: 100, leadBehavior: 'Mildly curious, one minor objection' },
  { tier: 'MEDIUM', color: 'Yellow', basePoints: 200, leadBehavior: 'Skeptical, 2-3 objections, asks for proof' },
  { tier: 'HARD', color: 'Orange', basePoints: 400, leadBehavior: 'Busy, dismissive, gatekeeper-like' },
  { tier: 'EXPERT', color: 'Red', basePoints: 800, leadBehavior: 'Hostile, well-informed, comparison shopping' },
] as const;

// T4 — Goal types & multipliers
const GOAL_TYPES = [
  { goalType: 'QUALIFY_LEAD', label: 'Qualify Lead', multiplier: 1.0 },
  { goalType: 'BOOK_DISCOVERY_CALL', label: 'Book Discovery Call', multiplier: 1.2 },
  { goalType: 'SEND_PROPOSAL', label: 'Send Proposal / Demo Invite', multiplier: 1.4 },
  { goalType: 'REACH_DECISION_MAKER', label: 'Reach Decision Maker', multiplier: 1.5 },
  { goalType: 'WIN_BACK', label: 'Win-back / Re-engage', multiplier: 1.6 },
  { goalType: 'CLOSE_DEAL', label: 'Close the Deal', multiplier: 2.0 },
] as const;

// T5 — Quality multiplier dimensions (each 20%)
const RUBRIC_DIMENSIONS = [
  { name: 'Discovery & Listening', weight: 0.2 },
  { name: 'Objection Handling', weight: 0.2 },
  { name: 'Value Articulation', weight: 0.2 },
  { name: 'Conversational Quality', weight: 0.2 },
  { name: 'Goal Execution', weight: 0.2 },
] as const;

// T6 — Rank system
const RANKS = [
  { rank: 'ROOKIE', minPoints: 0, maxPoints: 499, privileges: 'Rookie + Easy challenges only' },
  { rank: 'BRONZE', minPoints: 500, maxPoints: 1499, privileges: 'Unlocks Medium; profile visible to companies' },
  { rank: 'SILVER', minPoints: 1500, maxPoints: 3999, privileges: 'Unlocks Hard; eligible for featured listings' },
  { rank: 'GOLD', minPoints: 4000, maxPoints: 8999, privileges: 'Unlocks Expert; eligible for premium job pools' },
  { rank: 'PLATINUM', minPoints: 9000, maxPoints: 17999, privileges: 'Visible badge; priority in talent search' },
  { rank: 'DIAMOND', minPoints: 18000, maxPoints: 34999, privileges: 'Top 5% display; private company opportunities' },
  { rank: 'MASTER', minPoints: 35000, maxPoints: 69999, privileges: 'Top 1%; homepage feature; ambassador eligible' },
  { rank: 'GRANDMASTER', minPoints: 70000, maxPoints: null, privileges: 'Top 0.1%; lifetime badge; referral revenue share' },
] as const;

// §6.3 — Scoring rules (bonuses, penalties, decay)
const SCORING_RULES = [
  { key: 'speed_bonus_pct', value: 0.10, note: '+10% base if goal hit in <60% of allowed messages' },
  { key: 'first_try_bonus_pct', value: 0.15, note: '+15% base if cleared on first attempt' },
  { key: 'streak_bonus_per_day', value: 5, note: '+5 pts per consecutive active day' },
  { key: 'streak_bonus_cap', value: 50, note: 'streak bonus capped per day' },
  { key: 'difficulty_jump_bonus_pct', value: 0.20, note: '+20% for a challenge >=2 tiers above rank' },
  { key: 'spam_penalty', value: -50, note: 'pushy/spammy behaviour' },
  { key: 'lying_penalty', value: -100, note: 'fabricated product capabilities' },
  { key: 'abandonment_penalty', value: -25, note: 'started but not completed in window' },
  { key: 'repeat_attempt_decay', value: 0.70, note: 'each retry earns 70% of previous max' },
  { key: 'goal_not_achieved_partial', value: 0.40, note: 'up to 40% of (base x quality) for effort' },
] as const;

async function main() {
  for (const t of DIFFICULTY_TIERS) {
    await prisma.difficultyTierConfig.upsert({ where: { tier: t.tier }, update: t, create: t });
  }
  for (const g of GOAL_TYPES) {
    await prisma.goalTypeConfig.upsert({ where: { goalType: g.goalType }, update: g, create: g });
  }
  for (const d of RUBRIC_DIMENSIONS) {
    await prisma.rubricDimensionConfig.upsert({ where: { name: d.name }, update: d, create: d });
  }
  for (const r of RANKS) {
    await prisma.rankConfig.upsert({ where: { rank: r.rank }, update: r, create: r });
  }
  for (const s of SCORING_RULES) {
    await prisma.scoringRuleConfig.upsert({ where: { key: s.key }, update: s, create: s });
  }
  console.log('Seeded: 5 difficulty tiers, 6 goal types, 5 rubric dimensions, 8 ranks, 10 scoring rules.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
