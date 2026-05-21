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
});
