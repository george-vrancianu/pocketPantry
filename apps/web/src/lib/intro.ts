import {
  FALLBACK_LOCALE,
  isLocale,
  isScanLanguage,
  type Locale,
  type ScanLanguage,
} from '../i18n/resources';

/**
 * The Intro's rules, kept pure: which screens there are, where each lives, what Skip does, and the
 * running Setup counts. The state that has to outlive a screen is in `useIntro.tsx`; the screens
 * (tickets 497 to 499) read their next step from here instead of hard-coding paths.
 */
export const INTRO_STEPS = [
  'launch',
  'log-in',
  'languages',
  'sign-up',
  'setup-or-skip',
  'snap',
  'setup-review',
  'say-it',
  'what-gator-heard',
  'all-set',
  'dashboard',
] as const;

export type IntroStep = (typeof INTRO_STEPS)[number];

/**
 * Where a step lives. Launch has no path of its own (a signed-out visitor sees it on whatever route they
 * opened) and the Setup Review's path depends on the Scan, so ticket 498 builds it.
 */
export const INTRO_PATHS = {
  'log-in': '/sign-in',
  languages: '/intro/languages',
  'sign-up': '/sign-up',
  'setup-or-skip': '/intro/setup',
  snap: '/intro/snap',
  'say-it': '/intro/say-it',
  'all-set': '/intro/all-set',
  dashboard: '/',
} as const satisfies Partial<Record<IntroStep, string>>;

/** The Setup Review: the line editor of one Setup Scan. It has no step path of its own because it depends on the Scan. */
export const setupReviewPath = (scanId: string) => `/intro/review/${scanId}`;

/** The Setup screens a signed-in Member who has not finished the Intro may be on. */
export const INTRO_SETUP_PREFIX = '/intro/';

/** The screen that follows when the Member carries on. */
export function nextStep(step: IntroStep): IntroStep {
  switch (step) {
    case 'launch':
      return 'languages';
    case 'log-in':
      return 'dashboard';
    // The Setup Review is followed by Say it, and Say it by All set (What Gator heard is a sheet on Say it).
    case 'say-it':
      return 'all-set';
    default: {
      const next = INTRO_STEPS[INTRO_STEPS.indexOf(step) + 1];
      return next ?? 'dashboard';
    }
  }
}

/** The path of a step that has one; throws for Launch and the Setup Review, which have none yet. */
export function introPath(step: IntroStep): string {
  const path = (INTRO_PATHS as Partial<Record<IntroStep, string>>)[step];
  if (!path) throw new Error(`The Intro step "${step}" has no path of its own`);
  return path;
}

/**
 * Where Skip goes, or `null` where the step has no Skip. Skip moves on one step only: Snap or its Review
 * go to Say it and Say it goes to All set. "Skip, take me to the app" leaves the Intro altogether.
 */
export function skipStep(step: IntroStep): IntroStep | null {
  switch (step) {
    case 'setup-or-skip':
      return 'dashboard';
    case 'snap':
    case 'setup-review':
      return 'say-it';
    case 'say-it':
    case 'what-gator-heard':
      return 'all-set';
    default:
      return null;
  }
}

/** What Setup really saved so far. */
export type SetupCounts = { batches: number; shoppingItems: number };

export const NO_SETUP_COUNTS: SetupCounts = { batches: 0, shoppingItems: 0 };

/** Adds what a save just wrote; anything not given counts as none. */
export function addSetupCounts(
  counts: SetupCounts,
  saved: Partial<SetupCounts>,
): SetupCounts {
  return {
    batches: counts.batches + Math.max(0, saved.batches ?? 0),
    shoppingItems: counts.shoppingItems + Math.max(0, saved.shoppingItems ?? 0),
  };
}

type RedirectInput = {
  pathname: string;
  introDone: boolean;
  /** The Member chose "Show me how" in this visit, so Setup's own use of the Scan screen is allowed. */
  setupStarted: boolean;
};

const SCAN_PATHS = /^\/scan(\/|$)/;

/**
 * Where a signed-in Member has to be sent, or `null` to stay put. One who is not done with the Intro
 * is sent to Set up or skip whatever route they opened (leaving mid-Setup resumes there); one who is
 * done never sees an Intro screen.
 */
export function introRedirect({
  pathname,
  introDone,
  setupStarted,
}: RedirectInput): string | null {
  const onIntro = pathname.startsWith(INTRO_SETUP_PREFIX);
  if (introDone) return onIntro ? '/' : null;
  if (onIntro) return null;
  if (setupStarted && SCAN_PATHS.test(pathname)) return null;
  return INTRO_PATHS['setup-or-skip'];
}

/**
 * The language picks made on Languages before the account exists. `null` is "Same as the app language"
 * for the three rows that have it.
 */
export type LanguagePicks = {
  locale: Locale;
  spokenLanguage: ScanLanguage | null;
  scanLanguage: ScanLanguage | null;
  catalogLanguage: Locale | null;
};

export const INTRO_LANGUAGES_STORAGE_KEY = 'pocket-pantry.intro-languages';

/** Parses what was stored; anything missing or malformed is no picks. */
export function parseLanguagePicks(raw: string | null): LanguagePicks | null {
  if (!raw) return null;
  try {
    const v: Record<string, unknown> = JSON.parse(raw) ?? {};
    const orNull = (value: unknown, ok: (x: string) => boolean) =>
      value === null || (typeof value === 'string' && ok(value));
    if (
      typeof v.locale === 'string' &&
      isLocale(v.locale) &&
      orNull(v.spokenLanguage, isScanLanguage) &&
      orNull(v.scanLanguage, isScanLanguage) &&
      orNull(v.catalogLanguage, isLocale)
    ) {
      return v as LanguagePicks;
    }
  } catch {
    // Malformed: treated as no picks.
  }
  return null;
}

/** The picks kept on the device, or none. Blocked storage reads as none. */
export function readLanguagePicks(): LanguagePicks | null {
  try {
    return parseLanguagePicks(
      window.localStorage.getItem(INTRO_LANGUAGES_STORAGE_KEY),
    );
  } catch {
    return null;
  }
}

export function writeLanguagePicks(picks: LanguagePicks): void {
  try {
    window.localStorage.setItem(
      INTRO_LANGUAGES_STORAGE_KEY,
      JSON.stringify(picks),
    );
  } catch {
    // Not persisting is acceptable: the Member picks again in Settings.
  }
}

/** Forget the picks once the account exists and they are saved. */
export function clearLanguagePicks(): void {
  try {
    window.localStorage.removeItem(INTRO_LANGUAGES_STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}

/**
 * The body that saves the picks once the account exists. A row left on "Same" is left out, so it stores
 * nothing and keeps following the app language.
 */
export function languagePicksBody(picks: LanguagePicks) {
  return {
    locale: picks.locale,
    ...(picks.spokenLanguage ? { spokenLanguage: picks.spokenLanguage } : {}),
    ...(picks.scanLanguage ? { scanLanguage: picks.scanLanguage } : {}),
    ...(picks.catalogLanguage
      ? { catalogLanguage: picks.catalogLanguage }
      : {}),
  };
}

/**
 * The first language on the phone's list that the app speaks (`en-GB` counts as English), or `null` when
 * none is supported, so Languages falls back to English without claiming the phone picked it.
 */
export function phoneLocale(languages: readonly string[]): Locale | null {
  for (const language of languages) {
    const base = language.slice(0, 2).toLowerCase();
    if (isLocale(base)) return base;
  }
  return null;
}

/** What the Languages screen starts on: the picks kept on the device, else the phone's language, else English. */
export function initialLanguagePicks(
  kept: LanguagePicks | null,
  phone: Locale | null,
): LanguagePicks {
  return (
    kept ?? {
      locale: phone ?? FALLBACK_LOCALE,
      spokenLanguage: null,
      scanLanguage: null,
      catalogLanguage: null,
    }
  );
}
