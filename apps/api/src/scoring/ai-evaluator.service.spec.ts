import { Test } from '@nestjs/testing';
import { AiEvaluatorService } from './ai-evaluator.service';
import { LLM_PROVIDER } from '../ai/llm-provider.interface';
import { MessageSender } from '@closdex/db';

const mockLlm = { complete: jest.fn() };

function makeEvalJson(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    qualityDims: {
      discoveryListening: 4,
      objectionHandling: 3,
      valueArticulation: 4,
      conversationalQuality: 5,
      goalExecution: 4,
    },
    goalAchieved: true,
    spamDetected: false,
    lyingDetected: false,
    notes: 'Good attempt',
    ...overrides,
  });
}

const BASE_INPUT = {
  personaName: 'Test Lead',
  goalDescription: 'Book a demo',
  messages: [
    { sender: MessageSender.SALESPERSON, content: 'Hi, I wanted to reach out.' },
    { sender: MessageSender.LEAD, content: 'Sure, tell me more.' },
  ],
};

describe('AiEvaluatorService', () => {
  let service: AiEvaluatorService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AiEvaluatorService,
        { provide: LLM_PROVIDER, useValue: mockLlm },
      ],
    }).compile();

    service = module.get(AiEvaluatorService);
  });

  // 1. Returns valid evaluation when LLM returns well-formed JSON
  it('returns valid evaluation when LLM returns well-formed JSON', async () => {
    mockLlm.complete.mockResolvedValue(makeEvalJson());

    const result = await service.evaluate(BASE_INPUT);

    expect(result.qualityDims).toEqual({
      discoveryListening: 4,
      objectionHandling: 3,
      valueArticulation: 4,
      conversationalQuality: 5,
      goalExecution: 4,
    });
    expect(result.notes).toBe('Good attempt');
  });

  // 2. Returns goalAchieved=true when LLM sets goalAchieved=true
  it('returns goalAchieved=true when LLM sets goalAchieved=true', async () => {
    mockLlm.complete.mockResolvedValue(makeEvalJson({ goalAchieved: true }));

    const result = await service.evaluate(BASE_INPUT);

    expect(result.goalAchieved).toBe(true);
  });

  // 3. Returns goalAchieved=false when LLM sets goalAchieved=false
  it('returns goalAchieved=false when LLM sets goalAchieved=false', async () => {
    mockLlm.complete.mockResolvedValue(makeEvalJson({ goalAchieved: false }));

    const result = await service.evaluate(BASE_INPUT);

    expect(result.goalAchieved).toBe(false);
  });

  // 4. Detects spam when LLM sets spamDetected=true
  it('detects spam when LLM sets spamDetected=true', async () => {
    mockLlm.complete.mockResolvedValue(makeEvalJson({ spamDetected: true }));

    const result = await service.evaluate(BASE_INPUT);

    expect(result.spamDetected).toBe(true);
  });

  // 5. Detects lying when LLM sets lyingDetected=true
  it('detects lying when LLM sets lyingDetected=true', async () => {
    mockLlm.complete.mockResolvedValue(makeEvalJson({ lyingDetected: true }));

    const result = await service.evaluate(BASE_INPUT);

    expect(result.lyingDetected).toBe(true);
  });

  // 6. Returns empty evaluation when LLM returns no JSON at all
  it('returns empty evaluation when LLM returns no JSON at all', async () => {
    mockLlm.complete.mockResolvedValue('Sorry, I cannot evaluate this.');

    const result = await service.evaluate(BASE_INPUT);

    expect(result).toEqual({
      qualityDims: {
        discoveryListening: 0,
        objectionHandling: 0,
        valueArticulation: 0,
        conversationalQuality: 0,
        goalExecution: 0,
      },
      goalAchieved: false,
      spamDetected: false,
      lyingDetected: false,
      notes: 'evaluator returned invalid output: no JSON in response',
    });
  });

  // 7. Returns empty evaluation when LLM returns malformed JSON
  it('returns empty evaluation when LLM returns malformed JSON', async () => {
    mockLlm.complete.mockResolvedValue('{ "qualityDims": { bad json ,,, }');

    const result = await service.evaluate(BASE_INPUT);

    expect(result).toEqual({
      qualityDims: {
        discoveryListening: 0,
        objectionHandling: 0,
        valueArticulation: 0,
        conversationalQuality: 0,
        goalExecution: 0,
      },
      goalAchieved: false,
      spamDetected: false,
      lyingDetected: false,
      notes: 'evaluator returned invalid output: JSON parse failed',
    });
  });

  // 8. Clamps quality dim > 5 to 5
  it('clamps quality dim > 5 to 5', async () => {
    mockLlm.complete.mockResolvedValue(
      makeEvalJson({ qualityDims: { discoveryListening: 10, objectionHandling: 3, valueArticulation: 4, conversationalQuality: 5, goalExecution: 4 } }),
    );

    const result = await service.evaluate(BASE_INPUT);

    expect(result.qualityDims.discoveryListening).toBe(5);
  });

  // 9. Clamps quality dim < 0 to 0
  it('clamps quality dim < 0 to 0', async () => {
    mockLlm.complete.mockResolvedValue(
      makeEvalJson({ qualityDims: { discoveryListening: -3, objectionHandling: 3, valueArticulation: 4, conversationalQuality: 5, goalExecution: 4 } }),
    );

    const result = await service.evaluate(BASE_INPUT);

    expect(result.qualityDims.discoveryListening).toBe(0);
  });

  // 10. Handles non-numeric quality dim values → clamps to 0
  it('handles non-numeric quality dim values (string, null, undefined) → clamps to 0', async () => {
    mockLlm.complete.mockResolvedValue(
      makeEvalJson({
        qualityDims: {
          discoveryListening: 'excellent',
          objectionHandling: null,
          valueArticulation: undefined,
          conversationalQuality: 4,
          goalExecution: 3,
        },
      }),
    );

    const result = await service.evaluate(BASE_INPUT);

    expect(result.qualityDims.discoveryListening).toBe(0);
    expect(result.qualityDims.objectionHandling).toBe(0);
    expect(result.qualityDims.valueArticulation).toBe(0);
  });

  // 11. Notes truncated to 500 chars when LLM returns a long string
  it('truncates notes to 500 characters when LLM returns a long string', async () => {
    const longNotes = 'A'.repeat(600);
    mockLlm.complete.mockResolvedValue(makeEvalJson({ notes: longNotes }));

    const result = await service.evaluate(BASE_INPUT);

    expect(result.notes).toHaveLength(500);
    expect(result.notes).toBe('A'.repeat(500));
  });

  // 12. Transcript format: SALESPERSON prefixed "SALES:", LEAD prefixed "LEAD:"
  it('builds transcript with SALES: prefix for SALESPERSON and LEAD: prefix for LEAD', async () => {
    mockLlm.complete.mockResolvedValue(makeEvalJson());

    await service.evaluate({
      personaName: 'Alice',
      goalDescription: 'Close the deal',
      messages: [
        { sender: MessageSender.SALESPERSON, content: 'Hello there' },
        { sender: MessageSender.LEAD, content: 'What do you offer?' },
      ],
    });

    const callArgs = mockLlm.complete.mock.calls[0];
    const userMessage: string = callArgs[0].find((m: { role: string }) => m.role === 'user').content;
    expect(userMessage).toContain('SALES: Hello there');
    expect(userMessage).toContain('LEAD: What do you offer?');
  });

  // 13. LLM is called with maxTokens=600 and temperature=0.1
  it('calls LLM with maxTokens=600 and temperature=0.1', async () => {
    mockLlm.complete.mockResolvedValue(makeEvalJson());

    await service.evaluate(BASE_INPUT);

    expect(mockLlm.complete).toHaveBeenCalledWith(
      expect.any(Array),
      { maxTokens: 600, temperature: 0.1 },
    );
  });

  // 14. Empty message array produces valid transcript and still calls LLM
  it('handles empty message array, calls LLM, and returns a valid evaluation', async () => {
    mockLlm.complete.mockResolvedValue(makeEvalJson());

    const result = await service.evaluate({
      personaName: 'Empty Lead',
      goalDescription: 'N/A',
      messages: [],
    });

    expect(mockLlm.complete).toHaveBeenCalledTimes(1);
    const userMessage: string = mockLlm.complete.mock.calls[0][0].find(
      (m: { role: string }) => m.role === 'user',
    ).content;
    expect(userMessage).toContain('TRANSCRIPT:\n\n');
    expect(result.qualityDims.discoveryListening).toBe(4);
  });
});
