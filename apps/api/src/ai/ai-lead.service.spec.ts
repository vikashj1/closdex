import { Test } from '@nestjs/testing';
import { AiLeadService, parseSummarizeReply } from './ai-lead.service';
import { LLM_PROVIDER } from './llm-provider.interface';
import { MessageSender } from '@closdex/db';

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
});
