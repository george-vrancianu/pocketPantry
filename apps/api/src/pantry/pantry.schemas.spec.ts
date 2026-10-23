import { createBatchBody, scanQuery } from './pantry.schemas';

describe('scanQuery', () => {
  it('leaves the Scan Language open when none is sent (the Member Preference applies)', () => {
    expect(scanQuery.parse({ locale: 'ro' })).toEqual({ locale: 'ro' });
    expect(scanQuery.parse({})).toEqual({ locale: 'en' });
  });

  it('takes a Scan Language that differs from the locale', () => {
    expect(scanQuery.parse({ locale: 'ro', scanLanguage: 'da' })).toMatchObject(
      { locale: 'ro', scanLanguage: 'da' },
    );
  });

  it('rejects a language outside the Scan Languages', () => {
    expect(scanQuery.safeParse({ scanLanguage: 'fr' }).success).toBe(false);
  });

  it('takes Danish as a UI locale', () => {
    expect(scanQuery.parse({ locale: 'da' })).toEqual({ locale: 'da' });
  });

  it('rejects a UI locale outside the catalog locales', () => {
    expect(scanQuery.safeParse({ locale: 'fr' }).success).toBe(false);
  });
});

describe('createBatchBody sourceText', () => {
  it('accepts the printed text of an Unmatched line, trimmed', () => {
    expect(
      createBatchBody.parse({ rawName: 'Yogurt', sourceText: '  Skyr 450g ' }),
    ).toMatchObject({ rawName: 'Yogurt', sourceText: 'Skyr 450g' });
  });

  it('rejects printed text without an Unmatched name', () => {
    expect(
      createBatchBody.safeParse({
        ingredientId: crypto.randomUUID(),
        sourceText: 'Skyr',
      }).success,
    ).toBe(false);
  });

  it('rejects printed text that is too long', () => {
    expect(
      createBatchBody.safeParse({
        rawName: 'Yogurt',
        sourceText: 'x'.repeat(201),
      }).success,
    ).toBe(false);
  });

  it('no longer takes a per-batch Scan Language', () => {
    expect(
      createBatchBody.parse({ rawName: 'Yogurt', scanLanguage: 'da' }),
    ).not.toHaveProperty('scanLanguage');
  });
});
