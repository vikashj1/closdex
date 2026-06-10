import { Test } from '@nestjs/testing';
import { AiLeadService } from './ai-lead.service';
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

  // 9. summarize returns the LLM reply for a fresh first run
  it('summarize returns the LLM-generated paragraph on a first run', async () => {
    mockLlm.complete.mockResolvedValue('  Salesperson pitched X, Alice asked about ROI.  ');

    const result = await service.summarize({
      personaName: 'Alice',
      existingSummary: null,
      newMessages: [
        { sender: MessageSender.SALESPERSON, content: 'Quick pitch on our analytics tool.' },
        { sender: MessageSender.LEAD, content: 'What ROI are existing customers seeing?' },
      ],
    });

    expect(result).toBe('Salesperson pitched X, Alice asked about ROI.');
    const callArgs = mockLlm.complete.mock.calls[0];
    expect(callArgs[1]).toEqual({ maxTokens: 350, temperature: 0.3 });
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
  it('summarize returns the existing summary unchanged when newMessages is empty', async () => {
    const result = await service.summarize({
      personaName: 'Alice',
      existingSummary: 'Existing context.',
      newMessages: [],
    });

    expect(result).toBe('Existing context.');
    expect(mockLlm.complete).not.toHaveBeenCalled();
  });
});
