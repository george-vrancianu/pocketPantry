import { translationCreate } from './admin-catalog.schemas';

describe('translationCreate', () => {
  const base = {
    entityType: 'ingredient',
    entityId: crypto.randomUUID(),
    value: 'Mælk',
  };

  it('accepts a Synonym in any Scan Language', () => {
    expect(
      translationCreate.safeParse({ ...base, kind: 'synonym', locale: 'da' })
        .success,
    ).toBe(true);
  });

  it('accepts a Danish display name, since Danish is a catalog locale', () => {
    expect(
      translationCreate.safeParse({ ...base, kind: 'name', locale: 'da' })
        .success,
    ).toBe(true);
  });

  it('rejects a display name in a language outside the Scan Languages (it fails at the locale enum)', () => {
    expect(
      translationCreate.safeParse({ ...base, kind: 'name', locale: 'fr' })
        .success,
    ).toBe(false);
  });

  it('still accepts a display name in a catalog locale', () => {
    expect(
      translationCreate.safeParse({ ...base, kind: 'name', locale: 'ro' })
        .success,
    ).toBe(true);
  });

  it('rejects a language outside the Scan Languages', () => {
    expect(
      translationCreate.safeParse({ ...base, kind: 'synonym', locale: 'fr' })
        .success,
    ).toBe(false);
  });
});
