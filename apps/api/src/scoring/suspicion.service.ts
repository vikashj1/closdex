import { Injectable } from '@nestjs/common';
import { AiContentDetectorService } from './ai-content-detector.service';

/** Shape of one salesperson message's client-side telemetry (anti-cheat). */
export interface MessageClientMeta {
  pasteCount?: number;
  pastedChars?: number;
  totalTypingMs?: number;
  charCount?: number;
}

/** One salesperson message as it enters the suspicion compute. */
export interface SuspicionInput {
  clientMeta: MessageClientMeta | null;
  /** The raw user-typed text — fed to the AI-content detector. Optional so
   *  the existing telemetry-only path stays valid. */
  content?: string;
}

export interface SuspicionFlags {
  /** Fraction of total content that arrived via paste (0-1). */
  pasteRatio: number;
  /** True if the salesperson submitted a long message in under a second. */
  instantTyping: boolean;
  /** True if effective typing speed exceeds a human-plausible ceiling. */
  superhumanSpeed: boolean;
  /** True if pasteCount across messages exceeds the burst threshold. */
  pasteBurst: boolean;
  /** Mean AI-content-likeness across salesperson messages, 0-1. */
  aiContentLikeness: number;
  /** True if no telemetry came in (legacy rows OR a non-browser client). */
  noTelemetry: boolean;
  /** Per-heuristic contribution to the final score, for admin debugging. */
  contributions: {
    pasteRatio: number;
    instantTyping: number;
    superhumanSpeed: number;
    pasteBurst: number;
    aiContent: number;
  };
}

export interface SuspicionResult {
  /** 0-100, higher = more suspicious. */
  score: number;
  /** True when score >= QUARANTINE_THRESHOLD. */
  quarantined: boolean;
  flags: SuspicionFlags;
}

/** Anything at or above this gets quarantined. 60 catches naive paste-from-GPT
 *  without flagging humans who occasionally paste a URL or a number. */
export const QUARANTINE_THRESHOLD = 60;

/** Plausible upper bound on human typing speed in chars/sec. 20 cps ≈ 240 wpm,
 *  which is above world-record sustained typing — anything beyond is bot-like. */
const SUPERHUMAN_CHARS_PER_SEC = 20;

/** Long-message instant-typing threshold: chars submitted in under 1 second. */
const INSTANT_TYPING_MIN_CHARS = 100;
const INSTANT_TYPING_MAX_MS = 1000;

/** A paste burst is enough events to suggest a copy-paste workflow rather than
 *  occasional reference look-ups. */
const PASTE_BURST_COUNT = 3;

@Injectable()
export class SuspicionService {
  constructor(private readonly aiDetector: AiContentDetectorService) {}

  /** Compute the suspicion score for an attempt from its salesperson messages.
   *  Pure-ish — only branches on the injected stateless detector. */
  compute(messages: SuspicionInput[]): SuspicionResult {
    const salespersonMessages = messages.filter((m) => m.clientMeta != null);
    if (salespersonMessages.length === 0) {
      return {
        score: 0,
        quarantined: false,
        flags: {
          pasteRatio: 0,
          instantTyping: false,
          superhumanSpeed: false,
          pasteBurst: false,
          aiContentLikeness: 0,
          noTelemetry: true,
          contributions: { pasteRatio: 0, instantTyping: 0, superhumanSpeed: 0, pasteBurst: 0, aiContent: 0 },
        },
      };
    }

    let totalPasted = 0;
    let totalChars = 0;
    let totalPasteCount = 0;
    let instantTyping = false;
    let superhumanSpeed = false;

    for (const m of salespersonMessages) {
      const meta = m.clientMeta!;
      const pastedChars = meta.pastedChars ?? 0;
      const charCount = meta.charCount ?? 0;
      const totalTypingMs = meta.totalTypingMs ?? 0;
      const pasteCount = meta.pasteCount ?? 0;

      totalPasted += pastedChars;
      totalChars += charCount;
      totalPasteCount += pasteCount;

      if (charCount >= INSTANT_TYPING_MIN_CHARS && totalTypingMs > 0 && totalTypingMs < INSTANT_TYPING_MAX_MS) {
        instantTyping = true;
      }

      if (totalTypingMs > 0) {
        const cps = charCount / (totalTypingMs / 1000);
        if (cps > SUPERHUMAN_CHARS_PER_SEC) superhumanSpeed = true;
      }
    }

    const pasteRatio = totalChars > 0 ? Math.min(1, totalPasted / totalChars) : 0;
    const pasteBurst = totalPasteCount >= PASTE_BURST_COUNT;

    // AI-content detector — runs only on messages that include `content`.
    // Messages without content (e.g. older callers) just don't contribute.
    let aiContentLikeness = 0;
    const messagesWithContent = salespersonMessages.filter(
      (m): m is SuspicionInput & { content: string } => typeof m.content === 'string' && m.content.length > 0,
    );
    if (messagesWithContent.length > 0) {
      const probabilities = messagesWithContent.map((m) => this.aiDetector.classify(m.content).probability);
      aiContentLikeness = probabilities.reduce((a, b) => a + b, 0) / probabilities.length;
    }

    // Each heuristic contributes up to N points to the 0-100 total. The three
    // strong signals (paste ratio, instant typing, superhuman speed) each
    // peak at 70 — any one of them alone clears the 60-point quarantine
    // threshold. Paste-burst + AI-content are corroborating only.
    const contributions = {
      pasteRatio: Math.round(pasteRatio * 70),
      instantTyping: instantTyping ? 70 : 0,
      superhumanSpeed: superhumanSpeed ? 70 : 0,
      pasteBurst: pasteBurst ? 25 : 0,
      aiContent: Math.round(aiContentLikeness * 50),
    };

    const score = Math.min(
      100,
      contributions.pasteRatio +
        contributions.instantTyping +
        contributions.superhumanSpeed +
        contributions.pasteBurst +
        contributions.aiContent,
    );

    return {
      score,
      quarantined: score >= QUARANTINE_THRESHOLD,
      flags: {
        pasteRatio,
        instantTyping,
        superhumanSpeed,
        pasteBurst,
        aiContentLikeness,
        noTelemetry: false,
        contributions,
      },
    };
  }
}
