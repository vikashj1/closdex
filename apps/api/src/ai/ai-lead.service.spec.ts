import { Test } from '@nestjs/testing';
import {
  AiLeadService,
  parseSummarizeReply,
  parseReflectionReply,
  parseGoalJson,
  deriveTurns,
  winnableWindow,
  DISPOSITION,
} from './ai-lead.service';
import { LLM_PROVIDER } from './llm-provider.interface';
import { DifficultyTier, MessageSender } from '@closdex/db';

const mockLlm = { complete: jest.fn() };

const BASE_INPUT = {
  personaName: 'Alice',
  personaPrompt: 'You are a busy CFO who needs ROI proof.',
  history: [
    { sender: MessageSender.SALESPERSON, content: 'Hi Alice, got a minute?' },
    { sender: MessageSender.LEAD, content: 'What is this about?' },
  ],
};

describe('AiLeadService', () => {
  let service: AiLeadService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AiLeadService,
        { provide: LLM_PROVIDER, useValue: mockLlm },
      ],
    }).compile();

    service = module.get(AiLeadService);
  });

  // 1. Returns the trimmed LLM reply
  it('returns the trimmed LLM reply', async () => {
    mockLlm.complete.mockResolvedValue('  Sure, sounds good.  ');

    const result = await service.respond(BASE_INPUT);

    expect(result).toBe('Sure, sounds good.');
  });

  // 2. Passes the persona name in the system message
  it('passes the persona name in the system message', async () => {
    mockLlm.complete.mockResolvedValue('reply');

    await service.respond(BASE_INPUT);

    const messages: Array<{ role: string; content: string }> = mockLlm.complete.mock.calls[0][0];
    const systemMsg = messages.find((m) => m.role === 'system');
    expect(systemMsg?.content).toContain('Alice');
  });

  // 3. Passes the persona prompt in the system message
  it('passes the persona prompt in the system message', async () => {
    mockLlm.complete.mockResolvedValue('reply');

    await service.respond(BASE_INPUT);

    const messages: Array<{ role: string; content: string }> = mockLlm.complete.mock.calls[0][0];
    const systemMsg = messages.find((m) => m.role === 'system');
    expect(systemMsg?.content).toContain('You are a busy CFO who needs ROI proof.');
  });

  // 4. Maps SALESPERSON messages to role 'user'
  it("maps SALESPERSON messages to role 'user'", async () => {
    mockLlm.complete.mockResolvedValue('reply');

    await service.respond(BASE_INPUT);

    const messages: Array<{ role: string; content: string }> = mockLlm.complete.mock.calls[0][0];
    const userMsg = messages.find((m) => m.content === 'Hi Alice, got a minute?');
    expect(userMsg?.role).toBe('user');
  });

  // 5. Maps LEAD messages to role 'assistant'
  it("maps LEAD messages to role 'assistant'", async () => {
    mockLlm.complete.mockResolvedValue('reply');

    await service.respond(BASE_INPUT);

    const messages: Array<{ role: string; content: string }> = mockLlm.complete.mock.calls[0][0];
    const assistantMsg = messages.find((m) => m.content === 'What is this about?');
    expect(assistantMsg?.role).toBe('assistant');
  });

  // 6. Calls llm.complete with maxTokens=300 and temperature=0.85
  it('calls llm.complete with maxTokens=300 and temperature=0.85', async () => {
    mockLlm.complete.mockResolvedValue('reply');

    await service.respond(BASE_INPUT);

    expect(mockLlm.complete).toHaveBeenCalledWith(
      expect.any(Array),
      { maxTokens: 300, temperature: 0.85 },
    );
  });

  // 7. Trims whitespace from the LLM response
  it('trims leading and trailing whitespace from the LLM response', async () => {
    mockLlm.complete.mockResolvedValue('\n\n  Interesting.  \n');

    const result = await service.respond(BASE_INPUT);

    expect(result).toBe('Interesting.');
  });

  // 8. priorSummary is injected into the system prompt when provided
  it('injects priorSummary into the system message when present', async () => {
    mockLlm.complete.mockResolvedValue('ok');

    await service.respond({
      ...BASE_INPUT,
      priorSummary: 'Salesperson is pitching an analytics tool. Alice is curious about ROI.',
    });

    const messages = mockLlm.complete.mock.calls[0][0] as Array<{ role: string; content: string }>;
    const systemMsg = messages.find((m) => m.role === 'system');
    expect(systemMsg?.content).toContain('EARLIER IN THIS CONVERSATION');
    expect(systemMsg?.content).toContain('analytics tool');
  });

  // 9. summarize returns structured { summary, resolvedTopics } from the two-part LLM reply
  it('summarize parses the two-part LLM reply into summary + resolvedTopics', async () => {
    mockLlm.complete.mockResolvedValue(
      `SUMMARY:\nSalesperson pitched X, Alice asked about ROI.\n\nRESOLVED_TOPICS:\nroi|integration_cost|pilot_scope`,
    );

    const result = await service.summarize({
      personaName: 'Alice',
      existingSummary: null,
      newMessages: [
        { sender: MessageSender.SALESPERSON, content: 'Quick pitch on our analytics tool.' },
        { sender: MessageSender.LEAD, content: 'What ROI are existing customers seeing?' },
      ],
    });

    expect(result.summary).toBe('Salesperson pitched X, Alice asked about ROI.');
    expect(result.resolvedTopics).toEqual(['roi', 'integration_cost', 'pilot_scope']);
    const callArgs = mockLlm.complete.mock.calls[0];
    expect(callArgs[1]).toEqual({ maxTokens: 450, temperature: 0.3 });
  });

  // 10. summarize folds new messages into an existing summary
  it('summarize folds new turns into an existing rolling summary', async () => {
    mockLlm.complete.mockResolvedValue('Updated summary.');

    await service.summarize({
      personaName: 'Alice',
      existingSummary: 'Salesperson opened, Alice gave 5 minutes.',
      newMessages: [
        { sender: MessageSender.SALESPERSON, content: 'Our tool cuts log spend 40%.' },
      ],
    });

    const messages = mockLlm.complete.mock.calls[0][0] as Array<{ role: string; content: string }>;
    const userMsg = messages.find((m) => m.role === 'user');
    expect(userMsg?.content).toContain('Existing summary');
    expect(userMsg?.content).toContain('Salesperson opened');
    expect(userMsg?.content).toContain('cuts log spend 40%');
  });

  // 11. summarize is a no-op when there are no new messages
  it('summarize returns the existing summary + topics unchanged when newMessages is empty', async () => {
    const result = await service.summarize({
      personaName: 'Alice',
      existingSummary: 'Existing context.',
      existingResolvedTopics: ['pricing', 'sla'],
      newMessages: [],
    });

    expect(result.summary).toBe('Existing context.');
    expect(result.resolvedTopics).toEqual(['pricing', 'sla']);
    expect(mockLlm.complete).not.toHaveBeenCalled();
  });

  // 12. resolvedTopics → respond system prompt injects the anti-loop block
  it('injects resolvedTopics into the system prompt as OFF-LIMITS topics', async () => {
    mockLlm.complete.mockResolvedValue('ok');

    await service.respond({
      ...BASE_INPUT,
      resolvedTopics: ['exit_clause', 'notice_period', 'onboarding_timeline'],
    });

    const messages = mockLlm.complete.mock.calls[0][0] as Array<{ role: string; content: string }>;
    const systemMsg = messages.find((m) => m.role === 'system');
    expect(systemMsg?.content).toContain('ALREADY ADDRESSED');
    expect(systemMsg?.content).toContain('exit_clause');
    expect(systemMsg?.content).toContain('notice_period');
    expect(systemMsg?.content).toContain('onboarding_timeline');
  });

  // 13. turnCount >= 8 → respond injects convergence-bias block
  it('injects convergence bias after turn 8', async () => {
    mockLlm.complete.mockResolvedValue('ok');

    await service.respond({ ...BASE_INPUT, turnCount: 10 });

    const messages = mockLlm.complete.mock.calls[0][0] as Array<{ role: string; content: string }>;
    const systemMsg = messages.find((m) => m.role === 'system');
    expect(systemMsg?.content).toContain('CONVERGENCE BIAS');
    expect(systemMsg?.content).toContain('turn 10');
  });

  // 14. Below the threshold, no convergence block leaks through
  it('does NOT inject convergence bias before turn 8', async () => {
    mockLlm.complete.mockResolvedValue('ok');

    await service.respond({ ...BASE_INPUT, turnCount: 4 });

    const messages = mockLlm.complete.mock.calls[0][0] as Array<{ role: string; content: string }>;
    const systemMsg = messages.find((m) => m.role === 'system');
    expect(systemMsg?.content).not.toContain('CONVERGENCE BIAS');
  });

  // 15. parseSummarizeReply falls back to previous values on malformed output
  it('parseSummarizeReply falls back cleanly on malformed LLM output', () => {
    const result = parseSummarizeReply(
      'garbage without headers',
      'PREVIOUS SUMMARY',
      ['prev_topic'],
    );
    // The whole reply becomes summary if no SUMMARY: header, topics fallback.
    expect(result.summary).toBe('garbage without headers');
    expect(result.resolvedTopics).toEqual(['prev_topic']);
  });

  // 16. reflect() parses the three-part LLM reply
  it('reflect returns { whatWorked, whatToTry, betterMove } on a well-formed reply', async () => {
    mockLlm.complete.mockResolvedValue(
      `WHAT_WORKED:\nYou opened with a clear discovery question.\n\n` +
      `WHAT_TO_TRY:\nAsk one hard-priced question earlier.\n\n` +
      `BETTER_MOVE:\n"Would this be a fit?" → "What would make this a no-brainer for you?"`,
    );

    const result = await service.reflect({
      personaName: 'Alice',
      goalDescription: 'Book a follow-up call.',
      goalAchieved: false,
      messages: [
        { sender: MessageSender.SALESPERSON, content: 'Hi.' },
        { sender: MessageSender.LEAD, content: 'Hi back.' },
      ],
    });

    expect(result).toEqual({
      whatWorked: 'You opened with a clear discovery question.',
      whatToTry: 'Ask one hard-priced question earlier.',
      betterMove: '"Would this be a fit?" → "What would make this a no-brainer for you?"',
    });
  });

  // 17. reflect returns null on empty transcript (no LLM call)
  it('reflect returns null immediately when messages array is empty', async () => {
    const result = await service.reflect({
      personaName: 'Alice',
      goalDescription: 'x',
      goalAchieved: false,
      messages: [],
    });
    expect(result).toBeNull();
    expect(mockLlm.complete).not.toHaveBeenCalled();
  });

  // 18. reflect swallows LLM errors and returns null so scoring never crashes
  it('reflect returns null when the LLM throws', async () => {
    mockLlm.complete.mockRejectedValue(new Error('LLM 500'));
    const result = await service.reflect({
      personaName: 'Alice',
      goalDescription: 'x',
      goalAchieved: false,
      messages: [{ sender: MessageSender.SALESPERSON, content: 'Hi.' }],
    });
    expect(result).toBeNull();
  });

  // 19. parseReflectionReply rejects malformed replies (returns null)
  it('parseReflectionReply returns null when a section is missing', () => {
    const result = parseReflectionReply('WHAT_WORKED: only worked, no other sections');
    expect(result).toBeNull();
  });

  // --- LEAD_DISPOSITION_V2 -------------------------------------------------

  describe('LEAD_DISPOSITION_V2 respond assembly', () => {
    const OLD_ENV = process.env.LEAD_DISPOSITION_V2;
    beforeEach(() => {
      process.env.LEAD_DISPOSITION_V2 = 'true';
    });
    afterEach(() => {
      if (OLD_ENV === undefined) delete process.env.LEAD_DISPOSITION_V2;
      else process.env.LEAD_DISPOSITION_V2 = OLD_ENV;
    });

    const sys = () => {
      const messages = mockLlm.complete.mock.calls[0][0] as Array<{ role: string; content: string }>;
      return messages.find((m) => m.role === 'system')!.content;
    };

    it('renders NEGOTIATION STATE with the per-tier objection budget', async () => {
      mockLlm.complete.mockResolvedValue('ok');
      await service.respond({
        ...BASE_INPUT,
        difficulty: DifficultyTier.EXPERT,
        maxMessages: 20,
        turnCount: 2,
      });
      expect(sys()).toContain('NEGOTIATION STATE');
      // EXPERT budget is 4, nothing resolved yet → 4 remaining.
      expect(sys()).toContain('total of 4 genuine concern(s)');
      expect(sys()).toContain('You have 4 remaining');
      expect(sys()).toContain('(none yet)');
    });

    it('decrements remaining concerns by resolvedTopics and lists them', async () => {
      mockLlm.complete.mockResolvedValue('ok');
      await service.respond({
        ...BASE_INPUT,
        difficulty: DifficultyTier.HARD, // budget 3
        maxMessages: 15,
        turnCount: 2,
        resolvedTopics: ['pricing', 'integration effort'],
      });
      expect(sys()).toContain('You have 1 remaining');
      expect(sys()).toContain('- pricing');
      expect(sys()).toContain('- integration effort');
    });

    it('does NOT leak the legacy DEFAULT DISPOSITION / ANTI-LOOP prose', async () => {
      mockLlm.complete.mockResolvedValue('ok');
      await service.respond({
        ...BASE_INPUT,
        difficulty: DifficultyTier.MEDIUM,
        maxMessages: 20,
        turnCount: 2,
      });
      expect(sys()).not.toContain('DEFAULT DISPOSITION');
      expect(sys()).not.toContain('ANTI-LOOP RULE');
      expect(sys()).not.toContain('CONVERGENCE BIAS');
    });

    it('injects the derived DECISION POINT only at/after convergence', async () => {
      mockLlm.complete.mockResolvedValue('ok');
      // MEDIUM @20: commitFloor 6, convergence 12.
      await service.respond({
        ...BASE_INPUT,
        difficulty: DifficultyTier.MEDIUM,
        maxMessages: 20,
        turnCount: 11,
      });
      expect(sys()).not.toContain('DECISION POINT');

      jest.clearAllMocks();
      mockLlm.complete.mockResolvedValue('ok');
      await service.respond({
        ...BASE_INPUT,
        difficulty: DifficultyTier.MEDIUM,
        maxMessages: 20,
        turnCount: 12,
      });
      expect(sys()).toContain('DECISION POINT');
    });

    it('falls back to the legacy assembly when difficulty/maxMessages are absent', async () => {
      mockLlm.complete.mockResolvedValue('ok');
      await service.respond({ ...BASE_INPUT, turnCount: 2 });
      // No difficulty/maxMessages → v1 even with the flag on.
      expect(sys()).toContain('DEFAULT DISPOSITION');
    });
  });

  describe('deriveTurns / winnableWindow', () => {
    it('every seed difficulty/cap pair clears a winnable window of at least 3', () => {
      const seed: Array<[DifficultyTier, number]> = [
        [DifficultyTier.ROOKIE, 10],
        [DifficultyTier.EASY, 15],
        [DifficultyTier.MEDIUM, 20],
        [DifficultyTier.HARD, 15],
        [DifficultyTier.EXPERT, 20],
      ];
      for (const [difficulty, cap] of seed) {
        expect(winnableWindow(difficulty, cap)).toBeGreaterThanOrEqual(3);
      }
    });

    it('never lets convergence fall at or below the commit floor', () => {
      // Tiny cap where the raw percentages would collide.
      const derived = deriveTurns(DISPOSITION.EXPERT, 3);
      expect(derived.convergence).toBeGreaterThan(derived.commitFloor);
    });
  });

  describe('evaluateGoal extractTopics + parseGoalJson', () => {
    it('parseGoalJson extracts booleans + deduped, capped topics', () => {
      const v = parseGoalJson(
        'noise {"goalAchieved": true, "closed": false, "newlyAddressedTopics": ["Pricing","pricing","sla","onboarding","extra"]} trailing',
      );
      expect(v.goalAchieved).toBe(true);
      expect(v.closed).toBe(false);
      expect(v.newlyAddressedTopics).toEqual(['Pricing', 'sla', 'onboarding']);
    });

    it('parseGoalJson defaults conservatively on garbage', () => {
      expect(parseGoalJson('totally not json')).toEqual({
        goalAchieved: false,
        closed: false,
        newlyAddressedTopics: [],
      });
    });

    it('evaluateGoal(extractTopics) requests JSON and returns parsed topics', async () => {
      mockLlm.complete.mockResolvedValue(
        '{"goalAchieved": false, "closed": false, "newlyAddressedTopics": ["pricing"]}',
      );
      const verdict = await service.evaluateGoal({
        personaName: 'Alice',
        goalDescription: 'Book a call.',
        history: [{ sender: MessageSender.SALESPERSON, content: 'We cut cost 40%.' }],
        extractTopics: true,
      });
      expect(verdict.newlyAddressedTopics).toEqual(['pricing']);
      expect(mockLlm.complete.mock.calls[0][1]).toEqual({ maxTokens: 96, temperature: 0 });
    });

    it('evaluateGoal without extractTopics keeps the two-line format + empty topics', async () => {
      mockLlm.complete.mockResolvedValue('GOAL: NO\nCLOSED: NO');
      const verdict = await service.evaluateGoal({
        personaName: 'Alice',
        goalDescription: 'Book a call.',
        history: [{ sender: MessageSender.SALESPERSON, content: 'Hi.' }],
      });
      expect(verdict.newlyAddressedTopics).toEqual([]);
      expect(mockLlm.complete.mock.calls[0][1]).toEqual({ maxTokens: 16, temperature: 0 });
    });
  });
});
