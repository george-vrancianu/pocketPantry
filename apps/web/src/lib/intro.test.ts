import { describe, expect, it } from 'vitest';
import {
  addSetupCounts,
  introRedirect,
  languagePicksBody,
  nextStep,
  NO_SETUP_COUNTS,
  parseLanguagePicks,
  skipStep,
} from './intro';

describe('Intro steps', () => {
  it('follows Languages, Sign-up, Set up or skip, then Setup, then the Dashboard', () => {
    expect(nextStep('launch')).toBe('languages');
    expect(nextStep('languages')).toBe('sign-up');
    expect(nextStep('sign-up')).toBe('setup-or-skip');
    expect(nextStep('setup-or-skip')).toBe('snap');
    expect(nextStep('all-set')).toBe('dashboard');
    expect(nextStep('log-in')).toBe('dashboard');
  });

  it('skips one step only', () => {
    expect(skipStep('snap')).toBe('say-it');
    expect(skipStep('setup-review')).toBe('say-it');
    expect(skipStep('say-it')).toBe('all-set');
    expect(skipStep('setup-or-skip')).toBe('dashboard');
    expect(skipStep('languages')).toBeNull();
  });
});

describe('Setup counts', () => {
  it('adds only what was saved', () => {
    const after = addSetupCounts(NO_SETUP_COUNTS, { batches: 6 });
    expect(addSetupCounts(after, { shoppingItems: 1 })).toEqual({
      batches: 6,
      shoppingItems: 1,
    });
    expect(addSetupCounts(after, { batches: -3 })).toEqual(after);
  });
});

describe('Intro redirect', () => {
  const base = { introDone: false, setupStarted: false };
  it('sends a Member who is not done to Set up or skip from any route', () => {
    expect(introRedirect({ ...base, pathname: '/pantry' })).toBe(
      '/intro/setup',
    );
    expect(introRedirect({ ...base, pathname: '/' })).toBe('/intro/setup');
  });
  it('leaves them on the Intro screens', () => {
    expect(introRedirect({ ...base, pathname: '/intro/snap' })).toBeNull();
  });
  it('lets Setup use the Scan screen only after "Show me how"', () => {
    expect(introRedirect({ ...base, pathname: '/scan' })).toBe('/intro/setup');
    expect(
      introRedirect({
        ...base,
        setupStarted: true,
        pathname: '/scan/review/1',
      }),
    ).toBeNull();
  });
  it('keeps a done Member off the Intro', () => {
    expect(
      introRedirect({ ...base, introDone: true, pathname: '/intro/setup' }),
    ).toBe('/');
    expect(
      introRedirect({ ...base, introDone: true, pathname: '/pantry' }),
    ).toBeNull();
  });
});

describe('language picks', () => {
  it('leaves rows on "Same" out of the saved body', () => {
    expect(
      languagePicksBody({
        locale: 'ro',
        spokenLanguage: null,
        scanLanguage: 'da',
        catalogLanguage: null,
      }),
    ).toEqual({ locale: 'ro', scanLanguage: 'da' });
  });
  it('reads stored picks back and ignores junk', () => {
    const picks = {
      locale: 'da',
      spokenLanguage: null,
      scanLanguage: 'en',
      catalogLanguage: null,
    };
    expect(parseLanguagePicks(JSON.stringify(picks))).toEqual(picks);
    expect(parseLanguagePicks('{"locale":"xx"}')).toBeNull();
    expect(parseLanguagePicks('nope')).toBeNull();
    expect(parseLanguagePicks(null)).toBeNull();
  });
});
