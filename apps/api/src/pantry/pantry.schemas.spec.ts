import { createBatchBody, scanQuery } from './pantry.schemas';

describe('scanQuery', () => {
  it('defaults the Scan Language to the UI locale', () => {
    expect(scanQuery.parse({ locale: 'ro' })).toMatchObject({
      locale: 'ro',
      scanLanguage: 'ro',
    });
    expect(scanQuery.parse({})).toMatchObject({
      locale: 'en',
      scanLanguage: 'en',
    });
  });

  it('takes a Scan Language that is not a catalog locale, independent of the locale', () => {
    expect(scanQuery.parse({ locale: 'ro', scanLanguage: 'da' })).toMatchObject(
      { locale: 'ro', scanLanguage: 'da' },
    );
  });

  it('rejects a language outside the Scan Languages', () => {
    expect(scanQuery.safeParse({ scanLanguage: 'fr' }).success).toBe(false);
  });

  it('still rejects a UI locale outside the catalog locales', () => {
    expect(scanQuery.safeParse({ locale: 'da' }).success).toBe(false);
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
