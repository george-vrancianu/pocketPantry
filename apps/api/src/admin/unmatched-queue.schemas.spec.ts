import { unmatchedResolveBody } from './unmatched-queue.schemas';

describe('unmatchedResolveBody', () => {
  const base = { normalizedName: 'maelk', ingredientId: crypto.randomUUID() };

  it('accepts a Synonym in any Scan Language, including one with no catalog locale', () => {
    expect(unmatchedResolveBody.parse({ ...base, locale: 'da' }).locale).toBe(
      'da',
    );
  });

  it('asks for the printed-text Synonym only when told to', () => {
    expect(unmatchedResolveBody.parse(base).sourceSynonym).toBe(false);
    expect(
      unmatchedResolveBody.parse({ ...base, sourceSynonym: true })
        .sourceSynonym,
    ).toBe(true);
  });

  it('rejects a language outside the Scan Languages', () => {
    expect(
      unmatchedResolveBody.safeParse({ ...base, locale: 'fr' }).success,
    ).toBe(false);
  });
});
