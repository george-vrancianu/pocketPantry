import { describe, expect, it } from 'vitest';
import {
  addSetupCounts,
  savedByVoice,
  initialLanguagePicks,
  introPath,
  introRedirect,
  languagePicksBody,
  nextStep,
  NO_SETUP_COUNTS,
  parseLanguagePicks,
  phoneLocale,
  setupReviewPath,
  skipStep,
} from './intro';

describe('Intro steps', () => {
  it('follows Languages, Sign-up, Set up or skip, then Setup, then the Dashboard', () => {
    expect(nextStep('languages')).toBe('sign-up');
    expect(nextStep('sign-up')).toBe('setup-or-skip');
    expect(nextStep('setup-or-skip')).toBe('snap');
    expect(nextStep('setup-review')).toBe('say-it');
    expect(nextStep('say-it')).toBe('all-set');
    expect(nextStep('all-set')).toBe('dashboard');
  });

  it('skips one step only', () => {
    expect(skipStep('snap')).toBe('say-it');
    expect(skipStep('setup-review')).toBe('say-it');
    expect(skipStep('say-it')).toBe('all-set');
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
  it.each([
    '/intro/snap',
    '/intro/say-it',
    '/intro/all-set',
    '/intro/review/x',
  ])(
    'sends a Member who has not started Setup from %s back to Set up or skip',
    (pathname) => {
      expect(introRedirect({ ...base, pathname })).toBe('/intro/setup');
    },
  );
  it('leaves them on Set up or skip, and on the Intro screens once Setup started', () => {
    expect(introRedirect({ ...base, pathname: '/intro/setup' })).toBeNull();
    expect(
      introRedirect({ ...base, setupStarted: true, pathname: '/intro/say-it' }),
    ).toBeNull();
  });
  it('no longer lets the app Scan routes through mid-Intro, even once Setup started', () => {
    for (const pathname of ['/scan', '/scan/review', '/scan/review/1']) {
      expect(introRedirect({ ...base, setupStarted: true, pathname })).toBe(
        '/intro/setup',
      );
    }
  });
  it('lets the Intro camera through once Setup started, and sends a resumed visit to Set up or skip', () => {
    const pathname = '/intro/camera';
    expect(introRedirect({ ...base, setupStarted: true, pathname })).toBeNull();
    expect(introRedirect({ ...base, pathname })).toBe('/intro/setup');
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

describe('the phone language', () => {
  it('takes the first listed language the app speaks, by its base code', () => {
    expect(phoneLocale(['fr-FR', 'ro-RO', 'en'])).toBe('ro');
    expect(phoneLocale(['en-GB'])).toBe('en');
    expect(phoneLocale(['DA'])).toBe('da');
  });

  it('is none when the phone speaks nothing the app does', () => {
    expect(phoneLocale(['fr-FR', 'de'])).toBeNull();
    expect(phoneLocale([])).toBeNull();
  });

  it('starts Languages on the kept picks, else the phone, else English with every other row on Same', () => {
    const kept = {
      locale: 'da',
      spokenLanguage: 'en',
      scanLanguage: null,
      catalogLanguage: null,
    } as const;
    expect(initialLanguagePicks(kept, 'ro')).toEqual(kept);
    expect(initialLanguagePicks(null, 'ro')).toEqual({
      locale: 'ro',
      spokenLanguage: null,
      scanLanguage: null,
      catalogLanguage: null,
    });
    expect(initialLanguagePicks(null, null).locale).toBe('en');
  });
});

describe('introPath', () => {
  it('gives the path of a step and throws for one with none', () => {
    expect(introPath('sign-up')).toBe('/sign-up');
    expect(() => introPath('setup-review')).toThrow();
  });
});

describe('setupReviewPath', () => {
  it('is an Intro screen: the guard lets it through once Setup started, and resumes at Set up or skip otherwise', () => {
    const path = setupReviewPath('abc');
    expect(path).toBe('/intro/review/abc');
    expect(
      introRedirect({ pathname: path, introDone: false, setupStarted: true }),
    ).toBeNull();
    expect(
      introRedirect({ pathname: path, introDone: false, setupStarted: false }),
    ).toBe('/intro/setup');
  });
});

describe('savedByVoice', () => {
  const entry = (
    actionId: string,
    list: 'pantry' | 'shopping',
    alreadyDone = false,
  ) => ({ actionId, list, alreadyDone });

  it('counts Pantry adds as Batches and Shopping adds as Shopping Items', () => {
    expect(
      savedByVoice(
        [entry('a', 'pantry'), entry('b', 'pantry'), entry('c', 'shopping')],
        [
          { id: 'a', op: 'add' },
          { id: 'b', op: 'add' },
          { id: 'c', op: 'add' },
        ],
      ),
    ).toEqual({ batches: 2, shoppingItems: 1 });
  });

  it('leaves out what was already done and anything that is not an add', () => {
    expect(
      savedByVoice(
        [
          entry('a', 'pantry', true),
          entry('b', 'shopping'),
          entry('c', 'pantry'),
          entry('d', 'shopping'),
        ],
        [
          { id: 'a', op: 'add' },
          { id: 'b', op: 'check' },
          { id: 'c', op: 'remove' },
          { id: 'd', op: 'runningLow' },
        ],
      ),
    ).toEqual({ batches: 0, shoppingItems: 1 });
  });

  it('counts nothing for actions that were skipped (not in applied)', () => {
    expect(savedByVoice([], [{ id: 'a', op: 'add' }])).toEqual({
      batches: 0,
      shoppingItems: 0,
    });
  });
});
