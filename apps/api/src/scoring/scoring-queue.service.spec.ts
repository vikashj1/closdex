import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ScoringQueueService } from './scoring-queue.service';
import { SCORING_QUEUE } from '../queue/queue.module';

// ---------------------------------------------------------------------------
// Mock
// ---------------------------------------------------------------------------

const mockQueue = { add: jest.fn() };

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('ScoringQueueService', () => {
  let service: ScoringQueueService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoringQueueService,
        { provide: SCORING_QUEUE, useValue: mockQueue },
      ],
    }).compile();

    service = module.get<ScoringQueueService>(ScoringQueueService);
  });

  // ---- 1. calls queue.add with correct job name and payload ----

  it('1. enqueue calls queue.add with "score-attempt" and { attemptId }', async () => {
    mockQueue.add.mockResolvedValue(undefined);

    await service.enqueue('attempt-abc');

    expect(mockQueue.add).toHaveBeenCalledWith('score-attempt', { attemptId: 'attempt-abc' });
  });

  // ---- 2. queue.add is called exactly once per enqueue call ----

  it('2. queue.add is called exactly once per enqueue call', async () => {
    mockQueue.add.mockResolvedValue(undefined);

    await service.enqueue('attempt-xyz');

    expect(mockQueue.add).toHaveBeenCalledTimes(1);
  });

  // ---- 3. resolves to undefined on success ----

  it('3. enqueue resolves to undefined on success', async () => {
    mockQueue.add.mockResolvedValue({ id: 'job-1' });

    const result = await service.enqueue('attempt-1');

    expect(result).toBeUndefined();
  });

  // ---- 4. does NOT throw when queue.add rejects ----

  it('4. enqueue does NOT throw when queue.add rejects', async () => {
    mockQueue.add.mockRejectedValue(new Error('Redis connection lost'));

    await expect(service.enqueue('attempt-fail')).resolves.not.toThrow();
  });

  // ---- 5. still resolves to undefined when queue.add rejects ----

  it('5. enqueue resolves to undefined even when queue.add rejects', async () => {
    mockQueue.add.mockRejectedValue(new Error('Redis connection lost'));

    const result = await service.enqueue('attempt-fail');

    expect(result).toBeUndefined();
  });

  // ---- 6. queue.add receives the exact attemptId passed in ----

  it('6. queue.add is called with the exact attemptId passed to enqueue', async () => {
    mockQueue.add.mockResolvedValue(undefined);
    const id = 'very-specific-attempt-id-99';

    await service.enqueue(id);

    expect(mockQueue.add).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ attemptId: id }),
    );
  });

  // ---- 7. logger.error is called when queue.add throws ----

  it('7. logger.error is called with a message containing the attemptId when queue.add throws', async () => {
    const loggerSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const err = new Error('Queue unavailable');
    mockQueue.add.mockRejectedValue(err);

    await service.enqueue('attempt-err');

    expect(loggerSpy).toHaveBeenCalledTimes(1);
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('attempt-err'),
    );

    loggerSpy.mockRestore();
  });

  // ---- 8. each call is independent — two calls produce two queue.add invocations ----

  it('8. two separate enqueue calls each produce one queue.add invocation (two total)', async () => {
    mockQueue.add.mockResolvedValue(undefined);

    await service.enqueue('attempt-A');
    await service.enqueue('attempt-B');

    expect(mockQueue.add).toHaveBeenCalledTimes(2);
    expect(mockQueue.add).toHaveBeenNthCalledWith(1, 'score-attempt', { attemptId: 'attempt-A' });
    expect(mockQueue.add).toHaveBeenNthCalledWith(2, 'score-attempt', { attemptId: 'attempt-B' });
  });
});
