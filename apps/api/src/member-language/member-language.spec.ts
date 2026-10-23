import { resolveLanguage, resolveLanguages } from './member-language';

const none = {
  locale: null,
  catalogLanguage: null,
  scanLanguage: null,
  spokenLanguage: null,
};

describe('Member language resolver', () => {
  it('uses the stored UI Language, then the request locale, then English', () => {
    expect(
      resolveLanguage('ui', { ...none, locale: 'da' }, { requestLocale: 'ro' }),
    ).toBe('da');
    expect(resolveLanguage('ui', none, { requestLocale: 'ro' })).toBe('ro');
    expect(resolveLanguage('ui', none)).toBe('en');
  });

  it('ignores a stored value that is not a catalog language', () => {
    expect(
      resolveLanguage('ui', { ...none, locale: 'fr' }, { requestLocale: 'ro' }),
    ).toBe('ro');
    expect(
      resolveLanguage('catalog', {
        ...none,
        locale: 'da',
        catalogLanguage: 'xx',
      }),
    ).toBe('da');
  });

  it('gives the Catalog Language the stored value, or the UI Language when empty', () => {
    expect(
      resolveLanguage('catalog', {
        ...none,
        locale: 'en',
        catalogLanguage: 'ro',
      }),
    ).toBe('ro');
    expect(
      resolveLanguage(
        'catalog',
        { ...none, locale: 'da' },
        { requestLocale: 'ro' },
      ),
    ).toBe('da');
    expect(resolveLanguage('catalog', none, { requestLocale: 'ro' })).toBe(
      'ro',
    );
    expect(resolveLanguage('catalog', none)).toBe('en');
  });

  it('lets an explicit override win over everything stored', () => {
    const stored = { ...none, locale: 'da', catalogLanguage: 'ro' };
    expect(resolveLanguage('catalog', stored, { override: 'en' })).toBe('en');
    expect(
      resolveLanguage('ui', stored, { override: 'ro', requestLocale: 'en' }),
    ).toBe('ro');
  });

  it('gives the Scan Language the stored value, or the UI Language when empty', () => {
    expect(
      resolveLanguage('scan', { ...none, locale: 'en', scanLanguage: 'da' }),
    ).toBe('da');
    expect(resolveLanguage('scan', { ...none, locale: 'ro' })).toBe('ro');
    expect(resolveLanguage('scan', none, { requestLocale: 'da' })).toBe('da');
    expect(resolveLanguage('scan', none)).toBe('en');
  });

  it('keeps the Scan Language apart from the Catalog Language', () => {
    const stored = { ...none, locale: 'en', catalogLanguage: 'ro' };
    expect(resolveLanguage('scan', stored)).toBe('en');
    expect(resolveLanguage('scan', { ...stored, scanLanguage: 'da' })).toBe(
      'da',
    );
    expect(resolveLanguage('catalog', { ...stored, scanLanguage: 'da' })).toBe(
      'ro',
    );
  });

  it('ignores a stored Scan Language that is not on the list, then falls back to English when the UI Language is not on it either', () => {
    expect(
      resolveLanguage('scan', { ...none, locale: 'ro', scanLanguage: 'xx' }),
    ).toBe('ro');
    expect(
      resolveLanguage('scan', { ...none, locale: 'fr', scanLanguage: 'xx' }),
    ).toBe('en');
  });

  it('lets a per-Scan override win for the Scan role', () => {
    expect(
      resolveLanguage(
        'scan',
        { ...none, scanLanguage: 'ro' },
        { override: 'da' },
      ),
    ).toBe('da');
  });

  it('gives the Spoken Language the stored value, or the UI Language when empty', () => {
    expect(
      resolveLanguage('spoken', {
        ...none,
        locale: 'en',
        spokenLanguage: 'ro',
      }),
    ).toBe('ro');
    expect(resolveLanguage('spoken', { ...none, locale: 'da' })).toBe('da');
    expect(resolveLanguage('spoken', none, { requestLocale: 'ro' })).toBe('ro');
    expect(resolveLanguage('spoken', none)).toBe('en');
  });

  it('keeps the Spoken Language apart from the Scan and Catalog Languages', () => {
    const stored = {
      ...none,
      locale: 'en',
      catalogLanguage: 'ro',
      scanLanguage: 'da',
    };
    expect(resolveLanguage('spoken', stored)).toBe('en');
    expect(resolveLanguage('spoken', { ...stored, spokenLanguage: 'ro' })).toBe(
      'ro',
    );
    expect(resolveLanguage('scan', { ...stored, spokenLanguage: 'ro' })).toBe(
      'da',
    );
  });

  it('ignores a stored Spoken Language that is not on the list, and lets an override win', () => {
    expect(
      resolveLanguage('spoken', {
        ...none,
        locale: 'ro',
        spokenLanguage: 'xx',
      }),
    ).toBe('ro');
    expect(resolveLanguage('spoken', { ...none, locale: 'fr' })).toBe('en');
    expect(
      resolveLanguage(
        'spoken',
        { ...none, spokenLanguage: 'ro' },
        { override: 'da' },
      ),
    ).toBe('da');
  });

  it('answers every role at once', () => {
    expect(
      resolveLanguages({ ...none, locale: 'en', catalogLanguage: 'ro' }),
    ).toEqual({ ui: 'en', catalog: 'ro', scan: 'en', spoken: 'en' });
  });
});
