import { CoachingService, maxRepetition } from './coaching.service';

describe('CoachingService', () => {
  const svc = new CoachingService();

  it('returns null for an empty message list', () => {
    expect(svc.detect([])).toBeNull();
  });

  it('returns null for a healthy 4-turn opening with a discovery question', () => {
    const nudge = svc.detect([
      'Hey Alice, quick intro — mind if I ask a couple questions before pitching?',
      'What is currently getting in the way of your team hitting quota this quarter?',
      'Got it. And which of those hurts most in a typical week?',
      'That makes sense. Would it help to see how we cut that specific cycle in half?',
    ]);
    expect(nudge).toBeNull();
  });

  it('flags defer-to-proposal loop when the salesperson defers 3+ times', () => {
    const nudge = svc.detect([
      'We can chat about the specifics of exit clauses.',
      'The proposal will include the full commercial terms.',
      "The proposal will address data-residency requirements too.",
      'That will be captured in the proposal we send over.',
    ]);
    expect(nudge?.category).toBe('defer_to_proposal_loop');
    expect(nudge?.tip.toLowerCase()).toContain('concrete');
  });

  it('flags repetition when nearly-identical claims recur 3+ times', () => {
    const nudge = svc.detect([
      'We are flexible on pricing and structure for enterprise customers.',
      'Our pricing is very flexible for enterprise customers, always.',
      'We stay flexible on pricing for enterprise customers, always the case.',
      'Very flexible pricing for enterprise customers is what we always do.',
    ]);
    expect(nudge?.category).toBe('repetition');
  });

  it('flags no-discovery when there are 5+ turns and zero questions', () => {
    const nudge = svc.detect([
      'Hey there, we help teams cut cycle time in half.',
      'Our platform integrates with everything you already run.',
      'Big enterprise customers love us because of our SLA.',
      'We also have compliance covered end to end.',
      'Happy to send over a case study whenever.',
    ]);
    expect(nudge?.category).toBe('no_discovery_questions');
  });

  it('flags a monologue when the last message crosses 800 chars', () => {
    const wall = 'x'.repeat(900);
    const nudge = svc.detect(['Short opener.', 'Also short.', wall]);
    expect(nudge?.category).toBe('monologue');
  });

  it('prioritises defer-loop over other signals when multiple could fire', () => {
    const defers = [
      'Details will be captured in the proposal.',
      'The proposal will include exit clauses.',
      'The proposal will address timelines.',
    ];
    const nudge = svc.detect([...defers, 'x'.repeat(900)]);
    expect(nudge?.category).toBe('defer_to_proposal_loop');
  });

  it('maxRepetition counts near-duplicates via 4-char shingle overlap', () => {
    expect(
      maxRepetition([
        'We are flexible on pricing for enterprise.',
        'We are flexible on pricing for enterprise buyers.',
        'We are flexible on our pricing model for enterprise customers.',
      ]),
    ).toBe(3);
    expect(maxRepetition(['Totally different topic here.', 'A separate thought entirely.'])).toBe(1);
  });
});
