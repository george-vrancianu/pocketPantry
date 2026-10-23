import { createBatchBody, scanQuery } from './pantry.schemas';

describe('scanQuery', () => {
  it('leaves the Scan Language open when none is sent (the Member Preference applies)', () => {
    expect(scanQuery.parse({})).toEqual({});
  });

  it('takes a Scan Language', () => {
    expect(scanQuery.parse({ scanLanguage: 'da' })).toEqual({
      scanLanguage: 'da',
    });
  });

  it('rejects a language outside the Scan Languages', () => {
    expect(scanQuery.safeParse({ scanLanguage: 'fr' }).success).toBe(false);
  });

  it('ignores a ?locale=, whatever it is', () => {
    expect(scanQuery.parse({ locale: 'ro' })).toEqual({});
    expect(scanQuery.safeParse({ locale: 'fr' }).success).toBe(true);
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
