import type { CatalogLocale } from '../catalog/catalog.schemas';
import type { VoiceLocation, VoiceUnit } from '../voice/voice-actions';

/**
 * The one sentence an assistant (Siri) speaks after an Assistant Request.
 *
 * Pure and self-contained: the API has no localisation of its own, so the
 * wording for en, ro and da lives here as plain dictionaries. The reply only
 * has to be understood when heard: clauses are "<what happened>: <items>".
 */

// Type-only import: catalog.schemas pulls in the database schema at runtime, so
// the locale set is tied to it at compile time and the list below stays pure.
export type AssistantLocale = CatalogLocale;
export const ASSISTANT_DEFAULT_LOCALE: AssistantLocale = 'en';

/** What happened to one Voice Action of the request. */
export type AssistantActionKind =
  | 'added'
  | 'quantitySet'
  | 'alreadyOnList'
  | 'flaggedRunningLow'
  | 'addedBecauseRunningLowNoBatch'
  | 'addedUnmatched'
  | 'refused';

/**
 * The answer to one Pantry Question (ADR 0020), mirroring the API's
 * `PantryAnswerKind`. A later kind (`notSure`) is added here, to `ANSWER_ORDER`
 * and to every dictionary.
 */
export type AssistantAnswerKind = 'yes' | 'onlyExpired' | 'no';

/** An entry of the outcomes list: what happened to a Voice Action, or the answer to a Pantry Question. */
export type AssistantOutcomeKind = AssistantActionKind | AssistantAnswerKind;

/**
 * One Voice Action of a request, as the reply needs it. #446 maps its apply
 * result onto these: a `skipped` entry is passed as `refused` (the Member is
 * sent to the app), and entries the assistant did not understand are dropped.
 */
export type AssistantActionOutcome = {
  kind: AssistantActionKind;
  /** The Ingredient's display name in the Member's locale, or the spoken name when Unmatched. */
  name: string;
  quantity?: number | null;
  /** A unit code (`VoiceUnit`); an unknown code is spoken as it is. */
  unit?: string | null;
};

/**
 * The answer to one Pantry Question. A yes carries what is in stock, each
 * detail optional so a bare yes still reads; a no and an only expired say
 * whether the Ingredient is already on the Shopping List.
 */
export type AssistantAnswerOutcome =
  | {
      kind: 'yes';
      /** The Ingredient's name in the reply language. */
      name: string;
      /** One total per unit (a `VoiceUnit` code), never converted. */
      totals?: ReadonlyArray<{ unit: string; quantity: number }>;
      locations?: readonly VoiceLocation[];
      expiringSoon?: boolean;
      runningLow?: boolean;
    }
  | {
      kind: 'onlyExpired' | 'no';
      name: string;
      onShoppingList?: boolean;
    };

export type AssistantOutcome = AssistantActionOutcome | AssistantAnswerOutcome;

/** Answer order of a reply; answers come before the outcome clauses. */
const ANSWER_ORDER: readonly AssistantAnswerKind[] = [
  'yes',
  'onlyExpired',
  'no',
];
const ANSWER_KINDS: ReadonlySet<string> = new Set<string>(ANSWER_ORDER);
const isAnswer = (
  outcome: AssistantOutcome,
): outcome is AssistantAnswerOutcome => ANSWER_KINDS.has(outcome.kind);

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
  outcomes: Record<AssistantActionKind, string>;
  /** One clause per answer kind; `{items}` is the Ingredient, or the joined list for a kind that is grouped. */
  answers: Record<AssistantAnswerKind, string>;
  /** The details a yes adds after the Ingredient. */
  answerDetails: {
    /** Each Location with its own preposition ("in the fridge", "på krydderihylden"). */
    locations: Record<VoiceLocation, string>;
    expiringSoon: string;
    runningLow: string;
    /** Added to a no or only expired: `{items}` are the ones already on the Shopping List. */
    onShoppingList: string;
    /** The same for a group of one, which would only repeat the name. */
    onShoppingListSolo: string;
  };
  /** The tail after the answers that were left out; `{n}` is the number left. */
  answersMore: Forms;
  /** The unit word of a bare count beside other units ("milk: 2 litres and 3 pieces"). */
  pieces: Forms;
  states: Record<AssistantState, string>;
};

const same = (word: string): Forms => ({ one: word, few: word, other: word });
const plain = (one: string, other: string): Forms => ({
  one,
  few: other,
  other,
});

export const assistantMessages = {
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
    answers: {
      yes: 'You have {items}',
      onlyExpired: 'Only expired {items}',
      no: 'No {items}',
    },
    answerDetails: {
      locations: {
        fridge: 'in the fridge',
        freezer: 'in the freezer',
        cupboard: 'in the cupboard',
        spices: 'on the spice rack',
      },
      expiringSoon: 'some expiring soon',
      runningLow: 'running low',
      onShoppingList: 'already on your Shopping List: {items}',
      onShoppingListSolo: 'already on your Shopping List',
    },
    pieces: plain('piece', 'pieces'),
    answersMore: same('And {n} more, check PantryGator'),
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
      added: 'Am adăugat pe Lista de cumpărături: {items}',
      quantitySet: 'Am actualizat pe Lista de cumpărături: {items}',
      alreadyOnList: 'Deja pe Lista de cumpărături: {items}',
      flaggedRunningLow: 'Am marcat ca pe cale să se termine: {items}',
      addedBecauseRunningLowNoBatch:
        'Am adăugat pe Lista de cumpărături, fiindcă nu mai este în stoc: {items}',
      addedUnmatched: 'Am adăugat, dar nu am recunoscut: {items}',
      refused: 'Deschide Pocket Pantry pentru {items}',
    },
    answers: {
      yes: 'Ai {items}',
      onlyExpired: 'Doar produse expirate: {items}',
      no: 'Nu ai {items}',
    },
    answerDetails: {
      locations: {
        fridge: 'în frigider',
        freezer: 'în congelator',
        cupboard: 'în cămară',
        spices: 'în dulapul cu condimente',
      },
      expiringSoon: 'o parte expiră curând',
      runningLow: 'pe cale să se termine',
      onShoppingList: 'deja pe Lista de cumpărături: {items}',
      onShoppingListSolo: 'deja pe Lista de cumpărături',
    },
    pieces: { one: 'bucată', few: 'bucăți', other: 'bucăți' },
    answersMore: {
      one: 'Și încă unul, verifică în PantryGator',
      few: 'Și încă {n}, verifică în PantryGator',
      other: 'Și încă {n}, verifică în PantryGator',
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
    answers: {
      yes: 'Du har {items}',
      onlyExpired: 'Kun udløbne varer: {items}',
      no: 'Du har ikke {items}',
    },
    answerDetails: {
      locations: {
        fridge: 'i køleskabet',
        freezer: 'i fryseren',
        cupboard: 'i skabet',
        spices: 'på krydderihylden',
      },
      expiringSoon: 'noget udløber snart',
      runningLow: 'ved at løbe tør',
      onShoppingList: 'allerede på indkøbslisten: {items}',
      onShoppingListSolo: 'allerede på indkøbslisten',
    },
    pieces: plain('stykke', 'stykker'),
    answersMore: same('Og {n} mere, tjek PantryGator'),
    states: {
      capReached:
        'Du har nået dagens grænse for assistenten. Prøv igen i morgen.',
      providerFailed: 'Jeg kunne ikke læse det lige nu. Prøv igen.',
      nothingUnderstood: 'Jeg forstod ikke noget. Prøv igen.',
      notConfigured: 'Assistenten er ikke sat op.',
    },
  },
} as const satisfies Record<AssistantLocale, Messages>;

export const ASSISTANT_LOCALES = Object.keys(
  assistantMessages,
) as AssistantLocale[];

/** Yes gets a clause per Ingredient ("You have milk. You have eggs."); the rest are grouped into one list. "No butter or eggs" is a choice; "only expired milk and eggs" is a fact about each. */
const LIST_TYPE: Record<
  Exclude<AssistantAnswerKind, 'yes'>,
  'conjunction' | 'disjunction'
> = {
  onlyExpired: 'conjunction',
  no: 'disjunction',
};

/**
 * Siri speaks at most this many answered Ingredients, whatever their kind;
 * the rest are left to the app ("And 3 more, check PantryGator"). The ones
 * spoken are the first asked, whatever their kind; those are then grouped and
 * spoken in `ANSWER_ORDER` as usual. So a "no" asked early is kept and a "yes"
 * asked ninth is dropped, and a grouped kind is cut by Ingredient: "No butter
 * or eggs" becomes "No butter" when only one of them fits.
 */
export const MAX_SPOKEN_ANSWERS = 8;

/** Clause order of a reply. */
const KIND_ORDER: readonly AssistantActionKind[] = [
  'added',
  'quantitySet',
  'alreadyOnList',
  'flaggedRunningLow',
  'addedBecauseRunningLowNoBatch',
  'addedUnmatched',
  'refused',
];

const resolveLocale = (locale: string | null | undefined): AssistantLocale =>
  locale != null && Object.hasOwn(assistantMessages, locale)
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
  /** Say "pieces" for a bare count, as it stands beside other units. */
  spellPieces = false,
): { amount: string; hasUnit: boolean } => {
  const cat = category(locale, quantity);
  const number = messages.count[cat].replace(
    '{n}',
    quantity.toLocaleString(locale, { maximumFractionDigits: 2 }),
  );
  if (!unit) return { amount: number, hasUnit: false };
  if (!Object.hasOwn(messages.units, unit)) {
    // Not a known unit code: speak it as it is.
    return { amount: `${number} ${unit}`, hasUnit: true };
  }
  const forms = messages.units[unit as VoiceUnit];
  // A known unit without a word (pieces) is a bare count.
  if (!forms && spellPieces) {
    return {
      amount: `${number} ${messages.pieces[cat]}`,
      hasUnit: true,
    };
  }
  return forms
    ? { amount: `${number} ${forms[cat]}`, hasUnit: true }
    : { amount: number, hasUnit: false };
};

const itemPhrase = (
  locale: AssistantLocale,
  messages: Messages,
  outcome: AssistantActionOutcome,
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

/** What a yes says about one Ingredient: "2 litres of milk in the fridge, some expiring soon, running low". */
const yesPhrase = (
  locale: AssistantLocale,
  messages: Messages,
  outcome: Extract<AssistantAnswerOutcome, { kind: 'yes' }>,
): string => {
  const totals = outcome.totals ?? [];
  const what = (() => {
    if (totals.length === 0) return outcome.name;
    if (totals.length === 1) {
      const { amount, hasUnit } = amountPhrase(
        locale,
        messages,
        totals[0].quantity,
        totals[0].unit,
      );
      return [amount, hasUnit ? messages.unitOf : '', outcome.name]
        .filter(Boolean)
        .join(' ');
    }
    const amounts = totals.map(
      (total) =>
        amountPhrase(locale, messages, total.quantity, total.unit, true).amount,
    );
    return `${outcome.name}: ${joinList(locale, amounts)}`;
  })();
  const details = messages.answerDetails;
  const locations = outcome.locations ?? [];
  const where = locations.length
    ? ` ${joinList(
        locale,
        locations.map((location) => details.locations[location]),
      )}`
    : '';
  const flags = [
    outcome.expiringSoon ? details.expiringSoon : '',
    outcome.runningLow ? details.runningLow : '',
  ].filter(Boolean);
  return `${what}${where}${flags.map((flag) => `, ${flag}`).join('')}`;
};

/** "a", "a and b", "a, b and c" in the locale's own conjunction (answers use "or"). */
const joinList = (
  locale: AssistantLocale,
  items: string[],
  type: 'conjunction' | 'disjunction' = 'conjunction',
): string => new Intl.ListFormat(locale, { style: 'long', type }).format(items);

/** The sentence to speak for one Assistant Request. Pure; never throws on odd input. */
export function assistantSpeech(input: AssistantSpeechInput): string {
  const locale = resolveLocale(input.locale);
  const messages = assistantMessages[locale];
  if (input.state !== undefined) return messages.states[input.state];
  const all = input.outcomes ?? [];
  if (all.length === 0) return messages.states.nothingUnderstood;

  const asked = all.filter(isAnswer);
  const spokenAnswers = asked.slice(0, MAX_SPOKEN_ANSWERS);
  const leftOut = asked.length - spokenAnswers.length;
  const answerClauses = ANSWER_ORDER.flatMap((kind) => {
    const answers = spokenAnswers.filter((outcome) => outcome.kind === kind);
    if (answers.length === 0) return [];
    const say = (items: string) =>
      messages.answers[kind].replace('{items}', items);
    if (kind === 'yes') {
      return answers.map((answer) =>
        say(
          answer.kind === 'yes'
            ? yesPhrase(locale, messages, answer)
            : answer.name,
        ),
      );
    }
    const covered = answers.flatMap((answer) =>
      answer.kind !== 'yes' && answer.onShoppingList ? [answer.name] : [],
    );
    const grouped = say(
      joinList(
        locale,
        answers.map((answer) => answer.name),
        LIST_TYPE[kind],
      ),
    );
    return [
      covered.length
        ? `${grouped}, ${
            answers.length === 1
              ? messages.answerDetails.onShoppingListSolo
              : messages.answerDetails.onShoppingList.replace(
                  '{items}',
                  joinList(locale, covered),
                )
          }`
        : grouped,
    ];
  });
  const clauses = KIND_ORDER.flatMap((kind) => {
    const items = all
      .filter((outcome) => !isAnswer(outcome))
      .filter((outcome) => outcome.kind === kind)
      .map((outcome) => itemPhrase(locale, messages, outcome));
    return items.length === 0
      ? []
      : [messages.outcomes[kind].replace('{items}', joinList(locale, items))];
  });
  // Each answer is a sentence of its own, spoken before the outcome clauses.
  return [
    ...answerClauses.map((clause) => `${clause}.`),
    ...(leftOut > 0
      ? [
          `${messages.answersMore[category(locale, leftOut)].replace(
            '{n}',
            leftOut.toLocaleString(locale),
          )}.`,
        ]
      : []),
    ...(clauses.length ? [`${clauses.join(messages.clauseSeparator)}.`] : []),
  ].join(' ');
}
