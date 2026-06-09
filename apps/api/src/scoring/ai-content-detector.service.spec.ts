import { AiContentDetectorService } from './ai-content-detector.service';

describe('AiContentDetectorService', () => {
  const svc = new AiContentDetectorService();

  it('returns probability=0 for very short text', () => {
    const result = svc.classify('Sure thing!');
    expect(result.probability).toBe(0);
  });

  it('returns low probability for casual human sales-rep text', () => {
    const text =
      "Sounds good — I'll set up a quick call tomorrow. What time works for you? I've got mornings free.";
    const result = svc.classify(text);
    expect(result.probability).toBeLessThan(0.3);
  });

  it('returns high probability for stiff LLM-style reply (formulaic phrases + low contractions + hedging)', () => {
    const text =
      'I completely understand your concern. I would be happy to provide additional information about our platform. Furthermore, I can assure you that our solution would be ideal for your requirements. Additionally, please let me know if you would like to schedule a meeting at your earliest convenience.';
    const result = svc.classify(text);
    expect(result.probability).toBeGreaterThan(0.4);
    expect(result.signals.formulaicPhrases).toBeGreaterThan(0);
    expect(result.signals.transitionDensity).toBeGreaterThan(0);
    expect(result.signals.politeHedging).toBeGreaterThan(0);
  });

  it('flags low contraction rate on a long formal message', () => {
    const text =
      'Thank you for reaching out. I understand the importance of evaluating multiple options. Our pricing structure is designed to accommodate organizations of various sizes. We do offer flexible terms that should work for your team. Please let me know if you would like a detailed proposal so that we can move forward together.';
    const result = svc.classify(text);
    expect(result.signals.contractionRate).toBeLessThan(0.01);
  });

  it('does not flag a casual short reply', () => {
    const text = "Yeah, that's fine. Send me the link.";
    const result = svc.classify(text);
    expect(result.probability).toBe(0);
  });

  it('penalises uniform sentence length (humans vary)', () => {
    const text =
      'Our team delivers reliable software. Customers see better outcomes faster. The platform scales with your needs. Pricing fits any team size. Implementation usually takes two weeks.';
    const result = svc.classify(text);
    expect(result.signals.sentenceLengthVariance).toBe(1);
  });
});
