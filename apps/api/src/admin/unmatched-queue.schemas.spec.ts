import { unmatchedResolveBody } from './unmatched-queue.schemas';

describe('unmatchedResolveBody', () => {
  const base = { normalizedName: 'maelk', ingredientId: crypto.randomUUID() };

  it('takes the raw-name Synonym in a catalog locale', () => {
    expect(unmatchedResolveBody.parse({ ...base, locale: 'ro' }).locale).toBe(
      'ro',
    );
  });

  it('takes the raw-name Synonym in Danish, a catalog locale', () => {
    expect(unmatchedResolveBody.parse({ ...base, locale: 'da' }).locale).toBe(
      'da',
    );
  });

  it('rejects a locale outside the catalog locales', () => {
    expect(
      unmatchedResolveBody.safeParse({ ...base, locale: 'fr' }).success,
    ).toBe(false);
  });

  it('asks for the printed-text Synonym only when told to', () => {
    expect(unmatchedResolveBody.parse(base).sourceSynonym).toBe(false);
    expect(
      unmatchedResolveBody.parse({ ...base, sourceSynonym: true })
        .sourceSynonym,
    ).toBe(true);
  });

  it('rejects an unknown language', () => {
    expect(
      unmatchedResolveBody.safeParse({ ...base, locale: 'fr' }).success,
    ).toBe(false);
  });
});
