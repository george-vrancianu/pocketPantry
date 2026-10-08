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

describe('createBatchBody scanLanguage', () => {
  it('accepts a per-batch Scan Language for an Unmatched line', () => {
    expect(
      createBatchBody.parse({ rawName: 'Skyr', scanLanguage: 'da' }),
    ).toMatchObject({ scanLanguage: 'da' });
  });

  it('rejects a per-batch language outside the Scan Languages', () => {
    expect(
      createBatchBody.safeParse({ rawName: 'Skyr', scanLanguage: 'fr' })
        .success,
    ).toBe(false);
  });
});
