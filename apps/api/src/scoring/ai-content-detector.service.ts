import { Injectable } from '@nestjs/common';

/** One per-message classification result. */
export interface AiContentScore {
  /** 0-1, higher = more AI-like. */
  probability: number;
  /** Heuristics that contributed. */
  signals: {
    formulaicPhrases: number;
    transitionDensity: number;
    contractionRate: number;
    sentenceLengthVariance: number;
    politeHedging: number;
  };
}

@Injectable()
export class AiContentDetectorService {
  /** Phrases that LLMs (especially when asked to play a sales prospect or
   *  responder) lean on heavily. Hand-picked from real GPT/Claude completions
   *  on sales role-play prompts. Lowercased; matched as substrings.
   *  Each hit adds to the formulaic-phrases signal. */
  private static readonly FORMULAIC_PHRASES = [
    'i understand your',
    'i appreciate your',
    'thank you for reaching out',
    'i would be happy to',
    "i'd be happy to",
    'feel free to',
    'please let me know',
    'do not hesitate',
    "don't hesitate",
    'looking forward to',
    'in the meantime',
    'at your earliest convenience',
    'i hope this',
    'as i mentioned',
    'just to clarify',
    'absolutely, ',
    'certainly, ',
    'great question',
    'that is a great',
    "that's a great",
    'i completely understand',
    'rest assured',
    'i want to assure',
    'i can assure you',
    'please be assured',
  ];

  /** Transition words that show up in LLM output at higher density than
   *  natural sales-rep text. */
  private static readonly TRANSITION_WORDS = [
    'furthermore',
    'additionally',
    'moreover',
    'however',
    'therefore',
    'consequently',
    'subsequently',
    'nevertheless',
    'in addition',
    'in conclusion',
    'in summary',
    'on the other hand',
  ];

  /** Returns a 0-1 AI-likeness probability for a single salesperson message.
   *  Pure function — no I/O — so unit tests stay trivial. */
  classify(text: string): AiContentScore {
    const lower = text.toLowerCase().trim();
    if (lower.length < 30) {
      return {
        probability: 0,
        signals: {
          formulaicPhrases: 0,
          transitionDensity: 0,
          contractionRate: 0,
          sentenceLengthVariance: 0,
          politeHedging: 0,
        },
      };
    }

    const words = lower.split(/\s+/).filter(Boolean);
    const wordCount = Math.max(1, words.length);

    // 1. Formulaic phrases — count hits, normalize by 4 hits = max.
    let phraseHits = 0;
    for (const p of AiContentDetectorService.FORMULAIC_PHRASES) {
      if (lower.includes(p)) phraseHits += 1;
    }
    const formulaicPhrases = Math.min(1, phraseHits / 4);

    // 2. Transition density — fraction of words that are formal transitions.
    let transitionHits = 0;
    for (const t of AiContentDetectorService.TRANSITION_WORDS) {
      let idx = 0;
      while ((idx = lower.indexOf(t, idx)) !== -1) {
        transitionHits += 1;
        idx += t.length;
      }
    }
    const transitionDensity = Math.min(1, (transitionHits / wordCount) * 20);

    // 3. Contraction rate — LLMs in formal-reply mode use few contractions.
    //    Low contraction rate in a long message bumps the signal up.
    const contractionMatches = lower.match(/\b\w+'\w+\b/g) ?? [];
    const contractionRate = contractionMatches.length / wordCount;
    const lowContraction = wordCount > 40 && contractionRate < 0.01 ? 1 : 0;

    // 4. Sentence-length variance — humans vary, LLMs cluster around a mean.
    const sentences = text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    let lengthVariance = 0;
    if (sentences.length >= 3) {
      const lens = sentences.map((s) => s.split(/\s+/).length);
      const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
      const variance = lens.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) / lens.length;
      // Low variance + multiple sentences = uniform = AI-like.
      lengthVariance = mean > 5 && variance < 4 ? 1 : 0;
    }

    // 5. Polite hedging density — "perhaps", "might", "would", "could" used
    //    at high rate in formal LLM output.
    const hedgeRegex = /\b(perhaps|might|may|would|could|should|kindly|certainly|absolutely)\b/g;
    const hedgeHits = (lower.match(hedgeRegex) ?? []).length;
    const politeHedging = Math.min(1, (hedgeHits / wordCount) * 12);

    // Weighted sum, all caps individual contributions at 0.3 so any single
    // signal can't on its own peg the score.
    const probability = Math.min(
      1,
      formulaicPhrases * 0.35 +
        transitionDensity * 0.2 +
        lowContraction * 0.15 +
        lengthVariance * 0.15 +
        politeHedging * 0.15,
    );

    return {
      probability,
      signals: {
        formulaicPhrases,
        transitionDensity,
        contractionRate,
        sentenceLengthVariance: lengthVariance,
        politeHedging,
      },
    };
  }
}
