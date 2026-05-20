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

  // Demo content — personas + published challenges so /challenges isn't empty
  // for a fresh tenant. Idempotent: skips if at least one challenge already exists.
  const existingChallenges = await prisma.challenge.count();
  if (existingChallenges > 0) {
    console.log(`Skipping demo content (${existingChallenges} challenges already exist).`);
    return;
  }

  const personas = await Promise.all([
    prisma.leadPersona.create({
      data: {
        name: 'Meera Krishnan',
        role: 'CTO',
        company: 'Vector Pay (Series B Fintech, 180 engineers)',
        contextSnippet: 'Time-poor, replies in 1-2 sentences. Comparison-shops vs Datadog. SOC2 audit in 8 weeks.',
        personalityPrompt:
          'You are Meera Krishnan, CTO at Vector Pay, a Series B fintech with 180 engineers. Personality: direct, time-poor, allergic to marketing slop, comparison-shops aggressively. You reply in 1-2 sentences max. You have a SOC2 audit in 8 weeks. You ARE busy, but if the salesperson earns a discovery call by being specific (concrete pain, data-backed claims, proposes a specific time slot), agree to it. Reject vague meetings, jargon ("platform", "revolutionary"), or disparaging competitors. Stay in character; never break the fourth wall.',
      },
    }),
    prisma.leadPersona.create({
      data: {
        name: 'Rajesh Iyer',
        role: 'Procurement Head',
        company: 'Aditya Birla Capital',
        contextSnippet: 'Detail-oriented, asks about pricing tiers, vendor lock-in, SLAs. Compliance-conscious.',
        personalityPrompt:
          'You are Rajesh Iyer, Procurement Head at Aditya Birla Capital. Personality: detail-oriented, slow to commit, compliance-conscious, asks pointed questions about pricing tiers, vendor lock-in, MSAs, and SLAs. You will not commit to a proposal unless the salesperson addresses at least two of: implementation timeline, exit clause, data residency. Polite but firm. Stay in character.',
      },
    }),
    prisma.leadPersona.create({
      data: {
        name: 'Anjali Desai',
        role: 'VP of Marketing',
        company: 'TrueBridge Skincare (D2C, 80 staff)',
        contextSnippet: 'Friendly, curious, easily distracted. Will buy if convinced of ROI in plain language.',
        personalityPrompt:
          'You are Anjali Desai, VP Marketing at TrueBridge Skincare, a D2C brand with 80 staff. Personality: friendly, curious, easily sidetracked into tangents about the latest tools. You respond well to ROI framed in plain language (revenue lift, hours saved per week) and storytelling case studies. You hate jargon and 50-page PDFs. If the salesperson keeps it concrete and human, you will book a call. Stay in character.',
      },
    }),
    prisma.leadPersona.create({
      data: {
        name: 'Vikram Singh',
        role: 'Head of Engineering',
        company: 'NextWave Logistics (Series A, ~40 engineers)',
        contextSnippet: 'Skeptical of new tools after a botched migration last quarter. Wants proof, not promises.',
        personalityPrompt:
          'You are Vikram Singh, Head of Engineering at NextWave Logistics. Personality: friendly but burned — your team did a botched migration last quarter and you are now allergic to vendor promises. You respond to: specific integration timelines, references from comparable customers, free trial offers. Will not engage with anything that smells like a generic pitch. Stay in character.',
      },
    }),
  ]);

  const [meera, rajesh, anjali, vikram] = personas;

  await prisma.challenge.createMany({
    data: [
      {
        title: 'The Skeptical CTO',
        brief: 'Pitch a DevOps observability platform to a busy Series B fintech CTO who is comparison-shopping vs Datadog. She has burned cycles on two prior tools. Book a 30-minute discovery call.',
        category: 'IT Sales',
        difficulty: 'HARD',
        goalType: 'BOOK_DISCOVERY_CALL',
        goalDescription: 'Get Meera to agree to a specific 30-minute time slot for a discovery call this week. Vague "let me think about it" does not count.',
        basePoints: 400,
        maxMessages: 25,
        estimatedMinutes: 15,
        attemptsAllowed: 3,
        status: 'PUBLISHED',
        personaId: meera.id,
      },
      {
        title: 'Procurement Maze',
        brief: 'Navigate a procurement-led conversation at a large Indian financial conglomerate. The buyer cares about SLAs, vendor lock-in, and compliance. Send a tailored proposal.',
        category: 'IT Sales',
        difficulty: 'EXPERT',
        goalType: 'SEND_PROPOSAL',
        goalDescription: 'Send a tailored proposal that explicitly addresses implementation timeline, exit clause, and data residency. Rajesh must confirm he will review it.',
        basePoints: 800,
        maxMessages: 30,
        estimatedMinutes: 20,
        attemptsAllowed: 3,
        status: 'PUBLISHED',
        personaId: rajesh.id,
      },
      {
        title: 'Warm Reply, Cold Lead',
        brief: 'A marketing-qualified lead replied positively to your outreach. Convert her interest into a follow-up meeting before her attention drifts.',
        category: 'SaaS',
        difficulty: 'EASY',
        goalType: 'BOOK_DISCOVERY_CALL',
        goalDescription: 'Get Anjali to confirm a discovery call with a specific day/time. ROI framing helps.',
        basePoints: 100,
        maxMessages: 15,
        estimatedMinutes: 8,
        attemptsAllowed: 3,
        status: 'PUBLISHED',
        personaId: anjali.id,
      },
      {
        title: 'Win Back the Burned Buyer',
        brief: 'A Series A logistics startup just survived a botched tooling migration. The Head of Engineering is wary of vendor pitches. Earn back trust enough for a free-trial commitment.',
        category: 'IT Sales',
        difficulty: 'MEDIUM',
        goalType: 'BOOK_DISCOVERY_CALL',
        goalDescription: 'Vikram commits to scoping a free trial. He must name a use case he wants to validate.',
        basePoints: 200,
        maxMessages: 20,
        estimatedMinutes: 12,
        attemptsAllowed: 3,
        status: 'PUBLISHED',
        personaId: vikram.id,
      },
    ],
  });

  console.log(`Seeded demo content: ${personas.length} personas, 4 challenges.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
