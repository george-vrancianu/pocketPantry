import type { VoiceUnit } from '../voice/voice-actions';

/**
 * The one sentence an assistant (Siri) speaks after an Assistant Request.
 *
 * Pure and self-contained: the API has no localisation of its own, so the
 * wording for en, ro and da lives here as plain dictionaries. The reply only
 * has to be understood when heard: clauses are "<what happened>: <items>".
 */

export const ASSISTANT_LOCALES = ['en', 'ro', 'da'] as const;
export type AssistantLocale = (typeof ASSISTANT_LOCALES)[number];
export const ASSISTANT_DEFAULT_LOCALE: AssistantLocale = 'en';

/** What happened to one Voice Action of the request. */
export type AssistantOutcomeKind =
  | 'added'
  | 'quantitySet'
  | 'alreadyOnList'
  | 'flaggedRunningLow'
  | 'addedBecauseRunningLowNoBatch'
  | 'addedUnmatched'
  | 'refused';

export type AssistantOutcome = {
  kind: AssistantOutcomeKind;
  /** The Ingredient's display name in the Member's locale, or the spoken name when Unmatched. */
  name: string;
  quantity?: number | null;
  /** A unit code (`VoiceUnit`); an unknown code is spoken as it is. */
  unit?: string | null;
};

/** A whole-request state that replaces per-outcome wording. */
export type AssistantState =
  'capReached' | 'providerFailed' | 'nothingUnderstood' | 'notConfigured';

/**
 * Either the outcomes of one request or a whole-request state. `locale` is
 * the reply language; anything but en, ro or da (or nothing) means English.
 * An empty `outcomes` list reads as `nothingUnderstood`.
 */
export type AssistantSpeechInput = { locale?: string | null } & (
  | { outcomes: readonly AssistantOutcome[]; state?: never }
  | { state: AssistantState; outcomes?: never }
);

type Category = 'one' | 'few' | 'other';
type Forms = Record<Category, string>;

type Messages = {
  /** Between clauses of one reply. */
  clauseSeparator: string;
  /** `{n}` is the formatted number; Romanian needs "de" after 20 and more. */
  count: Forms;
  /** Between an amount with a unit and the name ("litres of milk"); empty for none. */
  unitOf: string;
  /** A quantity set: `{name}` `{amount}`. */
  setTo: string;
  /** Spoken unit words per plural category. */
  units: Record<VoiceUnit, Forms | null>;
  /** One clause per kind; `{items}` is the joined list. */
  outcomes: Record<AssistantOutcomeKind, string>;
  states: Record<AssistantState, string>;
};

const same = (word: string): Forms => ({ one: word, few: word, other: word });
const plain = (one: string, other: string): Forms => ({
  one,
  few: other,
  other,
});

export const assistantMessages: Record<AssistantLocale, Messages> = {
  en: {
    clauseSeparator: '; ',
    count: same('{n}'),
    unitOf: 'of',
    setTo: '{name} to {amount}',
    units: {
      g: plain('gram', 'grams'),
      kg: plain('kilogram', 'kilograms'),
      ml: plain('millilitre', 'millilitres'),
      l: plain('litre', 'litres'),
      pcs: null,
    },
    outcomes: {
      added: 'Added to your Shopping List: {items}',
      quantitySet: 'Updated on your Shopping List: {items}',
      alreadyOnList: 'Already on your Shopping List: {items}',
      flaggedRunningLow: 'Marked as running low: {items}',
      addedBecauseRunningLowNoBatch:
        'Added to your Shopping List because there is no stock: {items}',
      addedUnmatched: 'Added but not recognised: {items}',
      refused: 'Open Pocket Pantry for {items}',
    },
    states: {
      capReached:
        'You have reached the daily limit for the assistant. Try again tomorrow.',
      providerFailed: 'I could not read that just now. Try again.',
      nothingUnderstood: 'I did not understand anything. Try again.',
      notConfigured: 'The assistant is not set up.',
    },
  },
  ro: {
    clauseSeparator: '; ',
    count: { one: '{n}', few: '{n}', other: '{n} de' },
    unitOf: 'de',
    setTo: '{name} la {amount}',
    units: {
      g: { one: 'gram', few: 'grame', other: 'grame' },
      kg: { one: 'kilogram', few: 'kilograme', other: 'kilograme' },
      ml: { one: 'mililitru', few: 'mililitri', other: 'mililitri' },
      l: { one: 'litru', few: 'litri', other: 'litri' },
      pcs: null,
    },
    outcomes: {
      added: 'Adăugat în Lista de cumpărături: {items}',
      quantitySet: 'Actualizat în Lista de cumpărături: {items}',
      alreadyOnList: 'Deja în Lista de cumpărături: {items}',
      flaggedRunningLow: 'Marcat ca pe cale să se termine: {items}',
      addedBecauseRunningLowNoBatch:
        'Adăugat în Lista de cumpărături fiindcă nu mai este în stoc: {items}',
      addedUnmatched: 'Adăugat, dar nerecunoscut: {items}',
      refused: 'Deschide Pocket Pantry pentru {items}',
    },
    states: {
      capReached: 'Ai atins limita zilnică pentru asistent. Încearcă mâine.',
      providerFailed: 'Nu am putut citi cererea acum. Încearcă din nou.',
      nothingUnderstood: 'Nu am înțeles nimic. Încearcă din nou.',
      notConfigured: 'Asistentul nu este configurat.',
    },
  },
  da: {
    clauseSeparator: '; ',
    count: same('{n}'),
    unitOf: '',
    setTo: '{name} til {amount}',
    units: {
      g: same('gram'),
      kg: same('kilo'),
      ml: same('milliliter'),
      l: same('liter'),
      pcs: null,
    },
    outcomes: {
      added: 'Føjet til indkøbslisten: {items}',
      quantitySet: 'Opdateret på indkøbslisten: {items}',
      alreadyOnList: 'Allerede på indkøbslisten: {items}',
      flaggedRunningLow: 'Markeret som ved at løbe tør: {items}',
      addedBecauseRunningLowNoBatch:
        'Føjet til indkøbslisten, fordi der ikke er mere på lager: {items}',
      addedUnmatched: 'Tilføjet, men ikke genkendt: {items}',
      refused: 'Åbn Pocket Pantry for {items}',
    },
    states: {
      capReached:
        'Du har nået dagens grænse for assistenten. Prøv igen i morgen.',
      providerFailed: 'Jeg kunne ikke læse det lige nu. Prøv igen.',
      nothingUnderstood: 'Jeg forstod ikke noget. Prøv igen.',
      notConfigured: 'Assistenten er ikke sat op.',
    },
  },
};

/** Clause order of a reply. */
const KIND_ORDER: readonly AssistantOutcomeKind[] = [
  'added',
  'quantitySet',
  'alreadyOnList',
  'flaggedRunningLow',
  'addedBecauseRunningLowNoBatch',
  'addedUnmatched',
  'refused',
];

const resolveLocale = (locale: string | null | undefined): AssistantLocale =>
  (ASSISTANT_LOCALES as readonly string[]).includes(locale ?? '')
    ? (locale as AssistantLocale)
    : ASSISTANT_DEFAULT_LOCALE;

const category = (locale: AssistantLocale, n: number): Category => {
  const c = new Intl.PluralRules(locale).select(n);
  return c === 'one' || c === 'few' ? c : 'other';
};

const amountPhrase = (
  locale: AssistantLocale,
  messages: Messages,
  quantity: number,
  unit: string | null | undefined,
): { amount: string; hasUnit: boolean } => {
  const cat = category(locale, quantity);
  const number = messages.count[cat].replace(
    '{n}',
    quantity.toLocaleString(locale, { maximumFractionDigits: 2 }),
  );
  const forms = unit ? messages.units[unit as VoiceUnit] : null;
  const word = forms
    ? forms[cat]
    : unit && !(unit in messages.units)
      ? unit
      : '';
  return word
    ? { amount: `${number} ${word}`, hasUnit: forms !== null }
    : { amount: number, hasUnit: false };
};

const itemPhrase = (
  locale: AssistantLocale,
  messages: Messages,
  outcome: AssistantOutcome,
): string => {
  const { name, quantity } = outcome;
  if (outcome.kind === 'refused' || quantity == null) return name;
  const { amount, hasUnit } = amountPhrase(
    locale,
    messages,
    quantity,
    outcome.unit,
  );
  if (outcome.kind === 'quantitySet') {
    return messages.setTo.replace('{name}', name).replace('{amount}', amount);
  }
  return [amount, hasUnit ? messages.unitOf : '', name]
    .filter(Boolean)
    .join(' ');
};

/** "a", "a and b", "a, b and c" in the locale's own conjunction. */
const joinList = (locale: AssistantLocale, items: string[]): string =>
  new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format(
    items,
  );

/** The sentence to speak for one Assistant Request. Pure; never throws on odd input. */
export function assistantSpeech(input: AssistantSpeechInput): string {
  const locale = resolveLocale(input.locale);
  const messages = assistantMessages[locale];
  if (input.state !== undefined) return messages.states[input.state];
  const outcomes = input.outcomes ?? [];
  if (outcomes.length === 0) return messages.states.nothingUnderstood;

  const clauses = KIND_ORDER.flatMap((kind) => {
    const items = outcomes
      .filter((outcome) => outcome.kind === kind)
      .map((outcome) => itemPhrase(locale, messages, outcome));
    return items.length === 0
      ? []
      : [messages.outcomes[kind].replace('{items}', joinList(locale, items))];
  });
  return `${clauses.join(messages.clauseSeparator)}.`;
}
