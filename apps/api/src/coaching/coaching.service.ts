import { Injectable } from '@nestjs/common';

/** One coaching nudge to surface in the play UI immediately after the
 *  salesperson's message is sent. Ephemeral — the frontend can dismiss it
 *  or auto-hide after a few seconds. */
export interface CoachingNudge {
  /** Antipattern category — used for analytics and to avoid repeat nudges. */
  category:
    | 'defer_to_proposal_loop'
    | 'repetition'
    | 'no_discovery_questions'
    | 'monologue';
  /** Short actionable text the user sees. First person, present tense. */
  tip: string;
}

const DEFER_PATTERNS = [
  /\bproposal\s+will\b/i,
  /\bwill\s+(?:include|address|cover|contain|have)\b/i,
  /\b(?:documented|defined|outlined)\s+(?:in|as\s+part\s+of)\s+(?:the|our)\s+proposal\b/i,
  /\bcaptured\s+in\s+the\s+proposal\b/i,
];

const DISCOVERY_MIN_TURNS = 5;
const DISCOVERY_MIN_QUESTIONS = 1;
const DEFER_LOOP_MIN = 3;
const REPETITION_MIN = 3;
const MONOLOGUE_CHAR_MIN = 800;

@Injectable()
export class CoachingService {
  /** Inspects the salesperson's messages so far and returns a single most-
   *  actionable coaching nudge, or null if nothing is obviously wrong.
   *  Runs on every sendMessage — cheap, in-process, no LLM.
   *
   *  Order of checks is priority order: defer-loop is the loudest failure
   *  mode (drives the "tough" complaint on 2026-07-28), then repetition,
   *  then no-discovery (early-attempt signal only), then monologue length. */
  detect(salespersonMessages: string[]): CoachingNudge | null {
    if (salespersonMessages.length === 0) return null;

    // 1. Defer-to-proposal loop — Noor's exact failure mode.
    const deferMatches = salespersonMessages.filter((m) =>
      DEFER_PATTERNS.some((rx) => rx.test(m)),
    ).length;
    if (deferMatches >= DEFER_LOOP_MIN) {
      return {
        category: 'defer_to_proposal_loop',
        tip: `You've deferred to "the proposal" ${deferMatches} times. Try one concrete example or a specific number instead — that's what actually moves procurement.`,
      };
    }

    // 2. Repetition — nearly-identical phrasing sent 3+ times.
    const repetitionCount = maxRepetition(salespersonMessages);
    if (repetitionCount >= REPETITION_MIN) {
      return {
        category: 'repetition',
        tip: `You're repeating a similar line ${repetitionCount} times. Change the angle: pivot to discovery, or hard-close with a specific ask ("what would you need to see to move this forward?").`,
      };
    }

    // 3. No discovery questions in the first N turns.
    if (salespersonMessages.length >= DISCOVERY_MIN_TURNS) {
      const questionsInFirstN = salespersonMessages
        .slice(0, DISCOVERY_MIN_TURNS)
        .filter((m) => m.includes('?')).length;
      if (questionsInFirstN < DISCOVERY_MIN_QUESTIONS) {
        return {
          category: 'no_discovery_questions',
          tip: `You haven't asked a real question yet. Discovery is how the persona lowers its guard — ask about their current setup or biggest pain point before pitching further.`,
        };
      }
    }

    // 4. Monologue — last message is a wall of text.
    const last = salespersonMessages[salespersonMessages.length - 1] ?? '';
    if (last.length >= MONOLOGUE_CHAR_MIN) {
      return {
        category: 'monologue',
        tip: `That message ran ${last.length} chars — chat replies over ~500 chars read as lecturing. Cut to the one line that matters and let them ask for more.`,
      };
    }

    return null;
  }
}

/** Returns the highest count of near-duplicate messages by comparing
 *  bag-of-words overlap on 4-char shingles. Not perfect, but catches
 *  "the proposal will have exit clauses" ≈ "the proposal covers all
 *  exit terms" without a full embedding model. */
export function maxRepetition(messages: string[]): number {
  if (messages.length < 2) return 1;
  const shingles = messages.map(toShingles);
  let maxCluster = 1;
  for (let i = 0; i < messages.length; i++) {
    let cluster = 1;
    for (let j = i + 1; j < messages.length; j++) {
      if (jaccard(shingles[i], shingles[j]) >= 0.5) cluster += 1;
    }
    if (cluster > maxCluster) maxCluster = cluster;
  }
  return maxCluster;
}

function toShingles(text: string): Set<string> {
  const cleaned = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const s = new Set<string>();
  for (let i = 0; i <= cleaned.length - 4; i++) s.add(cleaned.slice(i, i + 4));
  return s;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter += 1;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}
