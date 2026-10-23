import {
  FALLBACK_LOCALE,
  isLocale,
  isScanLanguage,
  type Locale,
  type ScanLanguage,
} from '../i18n/resources';
import type { VoiceAppliedEntry, VoiceReviewAction } from './voice';

/**
 * The Intro's rules, kept pure: which screens there are, where each lives, what Skip does, and the
 * running Setup counts. The state that has to outlive a screen is in `useIntro.tsx`; the screens
 * (tickets 497 to 499) read their next step from here instead of hard-coding paths.
 */
export const INTRO_STEPS = [
  'languages',
  'sign-up',
  'setup-or-skip',
  'snap',
  'setup-review',
  'say-it',
  'all-set',
  'dashboard',
] as const;

export type IntroStep = (typeof INTRO_STEPS)[number];

/**
 * Where a step lives. The Setup Review has no entry here because its path depends on the Scan
 * (`setupReviewPath`). Launch is not a step: a signed-out visitor sees it on whatever route they opened.
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
} as const;

/** The Setup Review: the line editor of one Setup Scan. It has no step path of its own because it depends on the Scan. */
export const setupReviewPath = (scanId: string) => `/intro/review/${scanId}`;

/** The Setup screens a signed-in Member who has not finished the Intro may be on. */
export const INTRO_SETUP_PREFIX = '/intro/';

/** The screen that follows when the Member carries on: the next one in order, except that Say it is followed by All set. */
export function nextStep(step: IntroStep): IntroStep {
  return INTRO_STEPS[INTRO_STEPS.indexOf(step) + 1] ?? 'dashboard';
}

/** The path of a step that has one; throws for the Setup Review, whose path depends on the Scan. */
export function introPath(step: IntroStep): string {
  const path = (INTRO_PATHS as Partial<Record<IntroStep, string>>)[step];
  if (!path) throw new Error(`The Intro step "${step}" has no path of its own`);
  return path;
}

/** The Setup screens that have a Skip next to the progress. */
export type SkippableStep = 'snap' | 'setup-review' | 'say-it';

/**
 * Where Skip goes. Skip moves on one step only: Snap or its Review go to Say it and Say it goes to All set.
 * ("Skip, take me to the app" on Set up or skip leaves the Intro altogether, through `finishIntro`.)
 */
export function skipStep(step: SkippableStep): IntroStep {
  return step === 'say-it' ? 'all-set' : 'say-it';
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

/**
 * What a Setup Voice Note really wrote: a Pantry add is a Batch, a Shopping add (or a "running low" that
 * lands on the list) is a Shopping Item. Only Voice Actions the server applied count; skipped ones and
 * ones already done (nothing new was written) do not, and a tick, remove or change adds nothing.
 */
export function savedByVoice(
  applied: Pick<VoiceAppliedEntry, 'actionId' | 'list' | 'alreadyDone'>[],
  actions: Pick<VoiceReviewAction, 'id' | 'op'>[],
): SetupCounts {
  const ops = new Map(actions.map((a) => [a.id, a.op]));
  const saved = { ...NO_SETUP_COUNTS };
  for (const entry of applied) {
    if (entry.alreadyDone) continue;
    const op = ops.get(entry.actionId);
    if (entry.list === 'pantry' && op === 'add') saved.batches += 1;
    if (entry.list === 'shopping' && (op === 'add' || op === 'runningLow'))
      saved.shoppingItems += 1;
  }
  return saved;
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
  const setupPath = INTRO_PATHS['setup-or-skip'];
  // Not started Setup in this visit (a reload, a reopened step): every Intro screen but Set up or skip
  // sends the Member back to it, so Setup resumes there with its counts from zero.
  if (onIntro) return setupStarted || pathname === setupPath ? null : setupPath;
  if (setupStarted && SCAN_PATHS.test(pathname)) return null;
  return setupPath;
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
