import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Translation parity across en, ro and da. Reads the JSON files directly and
 * collects every problem, so one run lists all of them (locale, namespace, key).
 */

const LOCALES_DIR = join(__dirname, 'locales');
const GLOSSARY = join(__dirname, '../../../../GLOSSARY.md');
const SOURCE = 'en';
const TARGETS = ['ro', 'da'] as const;
const ALL = [SOURCE, ...TARGETS] as const;

/** Plural forms each locale must have, per its own CLDR rules (checked against Intl below). */
const EXPECTED_FORMS: Record<string, string[]> = {
  en: ['one', 'other'],
  da: ['one', 'other'],
  // ro `few` covers 0 and counts ending 02-19 (101 is `other`).
  ro: ['one', 'few', 'other'],
};

const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;

type Strings = Map<string, string>;

/** `namespace -> flattened "a.b.c_one" -> text` for one locale. */
function load(locale: string): Map<string, Strings> {
  const dir = join(LOCALES_DIR, locale);
  const namespaces = new Map<string, Strings>();
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const strings: Strings = new Map();
    const walk = (value: unknown, prefix: string) => {
      if (typeof value === 'string') strings.set(prefix, value);
      else if (typeof value === 'object' && value !== null)
        for (const [k, v] of Object.entries(value))
          walk(v, prefix ? `${prefix}.${k}` : k);
    };
    walk(JSON.parse(readFileSync(join(dir, file), 'utf8')), '');
    namespaces.set(file.replace(/\.json$/, ''), strings);
  }
  return namespaces;
}

const localesByCode = Object.fromEntries(ALL.map((l) => [l, load(l)]));

/**
 * Error codes whose name merely ends like a plural form ("..._too_many" is the
 * API code, "not_household_of_one" is the Household of One code). Not plurals.
 */
const NOT_PLURAL = new Set([
  'errors:family.not_household_of_one',
  'errors:recipes.tips_too_many',
  'errors:recipes.pairings_too_many',
  'errors:recipes.eating_moments_too_many',
]);

const baseOf = (key: string) => key.replace(PLURAL_SUFFIX, '');
const formOf = (key: string) => PLURAL_SUFFIX.exec(key)?.[1];

/** base key -> forms present (empty set for non-plural keys) and the texts. */
function families(strings: Strings, ns: string) {
  const out = new Map<string, Map<string, string>>();
  for (const [key, text] of strings) {
    const plain = NOT_PLURAL.has(`${ns}:${key}`);
    const base = plain ? key : baseOf(key);
    const family = out.get(base) ?? new Map<string, string>();
    family.set(plain ? '' : (formOf(key) ?? ''), text);
    out.set(base, family);
  }
  return out;
}

/** Variable names in `{{name}}` / `{{name, number}}` / `{{- name}}`. */
const variables = (text: string) =>
  [...text.matchAll(/{{-?\s*([\w.]+)\s*(?:,[^}]*)?}}/g)].map((m) => m[1]);

/**
 * Interpolation rule: a plural family is compared as a whole. The union of
 * variables over all its forms must equal the English family's union, so one
 * form may drop `{{count}}` (ro `_one` "un articol") as long as another keeps it.
 */
const familyVariables = (family: Map<string, string>) =>
  [...new Set([...family.values()].flatMap(variables))].sort();

function parityProblems(): string[] {
  const problems: string[] = [];
  const en = localesByCode[SOURCE];
  for (const locale of TARGETS) {
    const other = localesByCode[locale];
    for (const ns of en.keys())
      if (!other.has(ns)) problems.push(`${locale}: missing namespace "${ns}"`);
    for (const ns of other.keys())
      if (!en.has(ns)) problems.push(`${locale}: extra namespace "${ns}"`);
    for (const [ns, enStrings] of en) {
      const localeStrings = other.get(ns);
      if (!localeStrings) continue;
      const enFamilies = families(enStrings, ns);
      const localeFamilies = families(localeStrings, ns);
      const isPlural = (family: Map<string, string>) =>
        [...family.keys()].some((form) => form !== '');
      for (const [base, enFamily] of enFamilies) {
        const family = localeFamilies.get(base);
        if (!family) problems.push(`${locale} ${ns}: missing key "${base}"`);
        else if (isPlural(enFamily) !== isPlural(family))
          problems.push(
            `${locale} ${ns}: "${base}" is ${isPlural(family) ? 'plural' : 'plain'} but en is ${isPlural(enFamily) ? 'plural' : 'plain'}`,
          );
      }
      for (const base of localeFamilies.keys())
        if (!enFamilies.has(base))
          problems.push(`${locale} ${ns}: extra key "${base}" (not in en)`);
    }
  }
  return problems;
}

function pluralProblems(): string[] {
  const problems: string[] = [];
  for (const locale of ALL) {
    const required = EXPECTED_FORMS[locale];
    for (const [ns, strings] of localesByCode[locale]) {
      for (const [base, family] of families(strings, ns)) {
        const forms = [...family.keys()].filter((f) => f !== '');
        if (forms.length === 0) continue;
        for (const form of required)
          if (!family.has(form))
            problems.push(`${locale} ${ns}: "${base}" lacks _${form}`);
        for (const form of forms)
          if (!required.includes(form))
            problems.push(`${locale} ${ns}: "${base}" has unexpected _${form}`);
        if (family.has(''))
          problems.push(
            `${locale} ${ns}: "${base}" mixes plural and plain forms`,
          );
      }
    }
  }
  return problems;
}

function interpolationProblems(): string[] {
  const problems: string[] = [];
  for (const locale of TARGETS) {
    for (const [ns, enStrings] of localesByCode[SOURCE]) {
      const localeStrings = localesByCode[locale].get(ns);
      if (!localeStrings) continue;
      const localeFamilies = families(localeStrings, ns);
      for (const [base, enFamily] of families(enStrings, ns)) {
        const family = localeFamilies.get(base);
        if (!family) continue;
        const want = familyVariables(enFamily);
        const got = familyVariables(family);
        if (want.join() !== got.join())
          problems.push(
            `${locale} ${ns}: "${base}" variables {${got}} should be {${want}}`,
          );
      }
    }
  }
  return problems;
}

/** Terms listed on `_Avoid_:` lines. Splits on top-level commas, drops "(qualifiers)". */
function avoidedTerms(): string[] {
  const terms = new Set<string>();
  for (const line of readFileSync(GLOSSARY, 'utf8').split('\n')) {
    const match = /^_Avoid_:\s*(.+)$/.exec(line.trim());
    if (!match) continue;
    let depth = 0;
    let current = '';
    const parts: string[] = [];
    for (const ch of match[1]) {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === ',' && depth === 0) {
        parts.push(current);
        current = '';
      } else if (depth === 0 && ch !== ')') current += ch;
    }
    parts.push(current);
    for (const part of parts) {
      const term = part.replace(/\(.*$/, '').trim().replace(/\.$/, '');
      if (term) terms.add(term);
    }
  }
  return [...terms].sort();
}

/** Bold headings of GLOSSARY.md: the canonical terms. */
function canonicalTerms(): Set<string> {
  const terms = new Set<string>();
  for (const line of readFileSync(GLOSSARY, 'utf8').split('\n')) {
    const m = /^\*\*(.+?)\*\*:/.exec(line);
    if (m) terms.add(m[1].toLowerCase());
  }
  return terms;
}

/**
 * Avoided terms that are ordinary English words. GLOSSARY.md avoids each only
 * as the name of one specific concept (e.g. "item" for an Ingredient, "line"
 * for a Shopping Item), but the UI legitimately uses the plain word, so they
 * are allowed everywhere in en. Key is the lower-case term.
 */
const PLAIN_WORDS: Record<string, string> = {
  item: 'generic count noun ("3 items"); the concept is clear from the screen',
  line: 'receipt, Template or Ingredient Line rows ("3 lines"), not a Shopping Item',
  category:
    'Leaf Category shown to Members as just "category"; avoided for Recipe grouping',
  check:
    'plain verb ("Check your connection"); avoided only as a Health Factor noun',
  meal: 'everyday word in Meal Plan copy; avoided only as the name of a Plan Slot or Eating Moment',
  note: 'plain word; Voice Note and Nutrition Note are canonical and not matched',
  product: 'packaged goods in Product Scan copy, not an Ingredient',
};

/** Exceptions found when the broad whitelist was narrowed (term, key, reason). */
const WORD_EXCEPTIONS: [term: string, id: string, reason: string][] = [
  [
    'account',
    'errors:auth.user_already_exists',
    'the sign-in account (and people without one), not a Member',
  ],
  [
    'account',
    'errors:auth.user_already_exists_use_another_email',
    'the sign-in account (and people without one), not a Member',
  ],
  [
    'account',
    'settings:account',
    'the sign-in account (and people without one), not a Member',
  ],
  [
    'account',
    'settings:allergies.noAccount',
    'the sign-in account (and people without one), not a Member',
  ],
  [
    'account',
    'settings:familyAllergies.hint',
    'the sign-in account (and people without one), not a Member',
  ],
  [
    'account',
    'signIn:createAccount',
    'the sign-in account (and people without one), not a Member',
  ],
  [
    'account',
    'signUp:haveAccount',
    'the sign-in account (and people without one), not a Member',
  ],
  [
    'account',
    'signUp:submit',
    'the sign-in account (and people without one), not a Member',
  ],
  [
    'account',
    'signUp:submitting',
    'the sign-in account (and people without one), not a Member',
  ],
  [
    'account',
    'signUp:title',
    'the sign-in account (and people without one), not a Member',
  ],
  [
    'available',
    'dashboard:mealPlan.status.unavailable',
    'a service, camera, Recipe or voice target that is no longer available, not the Can Make state',
  ],
  [
    'available',
    'errors:scan.provider_unavailable',
    'a service, camera, Recipe or voice target that is no longer available, not the Can Make state',
  ],
  [
    'available',
    'errors:voice.provider_unavailable',
    'a service, camera, Recipe or voice target that is no longer available, not the Can Make state',
  ],
  [
    'available',
    'mealPlans:detail.unavailable',
    'a service, camera, Recipe or voice target that is no longer available, not the Can Make state',
  ],
  [
    'available',
    'scan:noCamera',
    'a service, camera, Recipe or voice target that is no longer available, not the Can Make state',
  ],
  [
    'available',
    'scan:overlay.noCamera',
    'a service, camera, Recipe or voice target that is no longer available, not the Can Make state',
  ],
  [
    'available',
    'voice:skipReason.pantry.category_not_found',
    'a service, camera, Recipe or voice target that is no longer available, not the Can Make state',
  ],
  [
    'available',
    'voice:skipReason.pantry.ingredient_not_found',
    'a service, camera, Recipe or voice target that is no longer available, not the Can Make state',
  ],
  [
    'available',
    'voice:skipReason.shopping.ingredient_not_found',
    'a service, camera, Recipe or voice target that is no longer available, not the Can Make state',
  ],
  [
    'available',
    'voice:unavailable',
    'a service, camera, Recipe or voice target that is no longer available, not the Can Make state',
  ],
  [
    'direction',
    'admin:recipe.guidance.nutrition.helper',
    'plain word ("a general direction") in a Nutrition Note hint, not a Method instruction',
  ],
  [
    'dish',
    'errors:scan.plate_token_invalid',
    'a dish on a plate Scan, not a Recipe or Meal',
  ],
  [
    'dish',
    'review:overview.pickDish',
    'a dish on a plate Scan, not a Recipe or Meal',
  ],
  [
    'entry',
    'errors:catalog.canonical_name_managed',
    'a Catalog or voice-review entry as a plain word, not a Template Line or Batch',
  ],
  [
    'entry',
    'errors:catalog.not_found',
    'a Catalog or voice-review entry as a plain word, not a Template Line or Batch',
  ],
  [
    'entry',
    'errors:catalog.translation_exists',
    'a Catalog or voice-review entry as a plain word, not a Template Line or Batch',
  ],
  [
    'entry',
    'voice:review.hide',
    'a Catalog or voice-review entry as a plain word, not a Template Line or Batch',
  ],
  [
    'food',
    'admin:recipe.guidance.pairings.kindFood',
    'plain adjective, a Pairing kind or the Open Food Facts brand, not an Ingredient',
  ],
  [
    'food',
    'pantry:form.prefill.credit',
    'plain adjective, a Pairing kind or the Open Food Facts brand, not an Ingredient',
  ],
  [
    'food',
    'recipes:pairingKind.food',
    'plain adjective, a Pairing kind or the Open Food Facts brand, not an Ingredient',
  ],
  [
    'food',
    'review:excluded.hint',
    'plain adjective, a Pairing kind or the Open Food Facts brand, not an Ingredient',
  ],
  [
    'food',
    'review:excluded.reason.not_food',
    'plain adjective, a Pairing kind or the Open Food Facts brand, not an Ingredient',
  ],
  [
    'label',
    'admin:recipe.guidance.pairings.invalid',
    'a Pairing label, a product label or a Family Allergy label, not a Product Description label',
  ],
  [
    'label',
    'admin:recipe.guidance.pairings.label',
    'a Pairing label, a product label or a Family Allergy label, not a Product Description label',
  ],
  [
    'label',
    'admin:recipe.translations.pairingIncomplete',
    'a Pairing label, a product label or a Family Allergy label, not a Product Description label',
  ],
  [
    'label',
    'admin:recipe.translations.pairingLabel',
    'a Pairing label, a product label or a Family Allergy label, not a Product Description label',
  ],
  [
    'label',
    'errors:settings.family_allergy_exists',
    'a Pairing label, a product label or a Family Allergy label, not a Product Description label',
  ],
  [
    'label',
    'recipes:allergens.reminder',
    'a Pairing label, a product label or a Family Allergy label, not a Product Description label',
  ],
  [
    'label',
    'settings:familyAllergies.label',
    'a Pairing label, a product label or a Family Allergy label, not a Product Description label',
  ],
  ['mode', 'scan:info.dial', 'the Scan Mode dial, not a Theme'],
  [
    'mode',
    'settings:appearance.lightOnlyToast',
    "the phone's OS dark/light mode (Match system), not a Theme",
  ],
  [
    'mode',
    'settings:appearance.matchSystemHint',
    "the phone's OS dark/light mode (Match system), not a Theme",
  ],
  [
    'mode',
    'settings:appearance.usedInDark',
    "the phone's OS dark/light mode (Match system), not a Theme",
  ],
  [
    'mode',
    'settings:appearance.usedInLight',
    "the phone's OS dark/light mode (Match system), not a Theme",
  ],
  [
    'old',
    'dashboard:health.line.age',
    'age of a Batch ("3 d old"); copy drift for Forgotten, flag',
  ],
  [
    'place',
    'voice:review.detail.noPlace',
    'asks for a storage place; copy drift for Location, flag',
  ],
  [
    'place',
    'voice:review.edit.locationDefault',
    'asks for a storage place; copy drift for Location, flag',
  ],
  [
    'place',
    'voice:review.footer.pickPlace',
    'asks for a storage place; copy drift for Location, flag',
  ],
  [
    'queue',
    'admin:unmatched.statusLabel',
    'the Admin Unmatched review list as a plain word, not a Scan queue',
  ],
  [
    'queue',
    'errors:family_ingredients.not_found',
    'the Admin Unmatched review list as a plain word, not a Scan queue',
  ],
  [
    'queue',
    'errors:family_synonyms.not_found',
    'the Admin Unmatched review list as a plain word, not a Scan queue',
  ],
  [
    'queue',
    'errors:unmatched.not_found',
    'the Admin Unmatched review list as a plain word, not a Scan queue',
  ],
  [
    'section',
    'admin:sections',
    'a group of tabs or Catalog areas, not a Receipt Section or Aisle',
  ],
  [
    'section',
    'settings:tabs.label',
    'a group of tabs or Catalog areas, not a Receipt Section or Aisle',
  ],
  [
    'settings',
    'settings:tabs.label',
    'the Settings page title, not a name for Member Preferences',
  ],
  [
    'settings',
    'settings:title',
    'the Settings page title, not a name for Member Preferences',
  ],
  ['side', 'errors:internal_server_error', '"on our side", an apology'],
  [
    'style',
    'recipes:facts.style',
    'label of the Cuisine fact, not a Cuisine alias',
  ],
  [
    'type',
    'catalog:catalogAdd.typeToSearch',
    'plain verb ("Type an ingredient"), not a Category type',
  ],
  [
    'type',
    'catalog:search.placeholder',
    'plain verb ("Type an ingredient"), not a Category type',
  ],
  [
    'unknown',
    'admin:recipe.lines.unknown',
    'plain adjective; copy drift for an Unmatched name, flag',
  ],
  [
    'unknown',
    'dashboard:mealPlan.line.unknown',
    'plain adjective; copy drift for an Unmatched name, flag',
  ],
];

/**
 * Specific legitimate uses, as "namespace:key|term" (term in lower case).
 * Each reason says why the word is not the avoided concept.
 */
const GLOSSARY_EXCEPTIONS: Record<string, string> = {
  ...Object.fromEntries(
    WORD_EXCEPTIONS.map(([term, id, reason]) => [`${id}|${term}`, reason]),
  ),
  ...Object.fromEntries(
    [
      'admin:ingredient.pantryBasicHint|stock',
      'admin:ingredient.pantryBasicHint|in stock',
      'dashboard:widgets.pantryStock.itemsInStock_one|stock',
      'dashboard:widgets.pantryStock.itemsInStock_one|in stock',
      'dashboard:widgets.pantryStock.itemsInStock_other|stock',
      'dashboard:widgets.pantryStock.itemsInStock_other|in stock',
      'staples:hint|stock',
      'staples:hint|in stock',
      'voice:listening.toShopping|stock',
    ].map((id) => [
      id,
      'plain "in stock" availability phrase, not the Pantry noun',
    ]),
  ),
  'common:locations.fridge|fridge':
    'Fridge is a Location value, not a name for the Pantry',
  'voice:intro.examples.shopping.three.say|fridge':
    'example of what a Member says out loud',
  'voice:intro.examples.pantry.one.say|fridge':
    'example of what a Member says out loud',
  'voice:intro.examples.pantry.two.say|finished':
    'example of what a Member says out loud',
  'shopping:finish.empty|finished':
    'the Finish Shopping action in plain past tense, not Used Up',
  'common:unverified_one|unverified':
    'Unmatched names after a Review Save, not the Allergen "Unchecked" state (copy drift, flag)',
  'common:unverified_other|unverified': 'same as unverified_one',
  'shopping:suggestions.goneNone|run out':
    'Used Up / expired Suggestions empty state, plain verb (copy drift, flag)',
  'screenHeader:home|home':
    'aria label of the button that leads to the Dashboard',
  'review:overview.fixValues|card':
    'a Review row card in the Review UI, not a Dashboard Widget',
  'settings:allergies.hint|intolerance':
    'explains that intolerances count as Allergies',
  'errors:recipes.source_locale|source language':
    'a Recipe language, not the Scan Language',
  'dashboard:settings|settings': 'link to Settings',
  'voice:blocked.safariStep2|settings': 'Safari "Website Settings" menu name',
  'shopping:empty.importTitle|import':
    'Shopping Template import action (copy drift, flag)',
  'shopping:import.button|import':
    'Shopping Template import action (copy drift, flag)',
  'shopping:import.title|import':
    'Shopping Template import action (copy drift, flag)',
  'shopping:import.aria|import':
    'Shopping Template import action (copy drift, flag)',
  'shopping:import.tickLabel|import':
    'Shopping Template import action (copy drift, flag)',
  'shopping:import.confirm_one|import':
    'Shopping Template import action (copy drift, flag)',
  'shopping:import.confirm_other|import':
    'Shopping Template import action (copy drift, flag)',
};

const escape = (s: string) =>
  s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
const wholeWord = (alternatives: string[], flags: string) =>
  new RegExp(
    `(?<![\\p{L}\\p{N}])(?:${alternatives.map(escape).join('|')})(?:e?s)?(?![\\p{L}\\p{N}])`,
    flags,
  );

const canonical = canonicalTerms();
const canonicalRegex = wholeWord(
  [...canonical].sort((a, b) => b.length - a.length),
  'giu',
);
const avoidedPatterns = avoidedTerms()
  .filter((term) => !canonical.has(term.toLowerCase()))
  .map((term) => ({ term, regex: wholeWord([term], 'giu') }));

/**
 * An interpolation variable is replaced by a separator that no word matches
 * across, so "Move {{count}} to Pantry" is not the avoided "Move to pantry"
 * (the Member sees "Move 3 to Pantry").
 */
const VARIABLE_GAP = '\u2063';

function glossaryProblems(): string[] {
  const problems: string[] = [];
  for (const [ns, strings] of localesByCode[SOURCE])
    for (const [key, text] of strings) {
      const copy = text.replace(/{{[^}]*}}/g, VARIABLE_GAP);
      // A hit inside a canonical term is that term, not the avoided word:
      // "Voice Note" is not the avoided "note".
      const canonicalSpans = [...copy.matchAll(canonicalRegex)].map((m) => [
        m.index,
        m.index + m[0].length,
      ]);
      for (const { term, regex } of avoidedPatterns) {
        const lower = term.toLowerCase();
        if (
          lower in PLAIN_WORDS ||
          `${ns}:${key}|${lower}` in GLOSSARY_EXCEPTIONS
        )
          continue;
        const hit = [...copy.matchAll(regex)].some((m) => {
          const [start, end] = [m.index, m.index + m[0].length];
          return !canonicalSpans.some(([s, e]) => s <= start && end <= e);
        });
        if (hit)
          problems.push(
            `en ${ns}: "${key}" uses avoided term "${term}": ${text}`,
          );
      }
    }
  return problems;
}

describe('translation parity', () => {
  it('ro and da have exactly the namespaces and keys of en', () => {
    expect(parityProblems()).toEqual([]);
  });

  it.each(ALL)('%s plural categories come from Intl.PluralRules', (locale) => {
    const categories = new Intl.PluralRules(locale).resolvedOptions()
      .pluralCategories;
    expect([...categories].sort()).toEqual([...EXPECTED_FORMS[locale]].sort());
  });

  it('every plural family has the forms its locale needs', () => {
    expect(pluralProblems()).toEqual([]);
  });

  it('interpolation variables match en, family by family', () => {
    expect(interpolationProblems()).toEqual([]);
  });

  it('en copy avoids the terms GLOSSARY.md lists under _Avoid_', () => {
    expect(avoidedTerms()).toContain('Household');
    expect(glossaryProblems()).toEqual([]);
  });

  it('every glossary exception still refers to existing copy', () => {
    const terms = avoidedTerms().map((t) => t.toLowerCase());
    const stale = [
      ...Object.keys(GLOSSARY_EXCEPTIONS).filter((id) => {
        const [path, term] = id.split('|');
        const colon = path.indexOf(':');
        const text = localesByCode[SOURCE].get(path.slice(0, colon))?.get(
          path.slice(colon + 1),
        );
        // The key must exist and its current copy must still contain the term.
        return (
          text === undefined ||
          !terms.includes(term) ||
          !wholeWord([term], 'iu').test(
            text.replace(/{{[^}]*}}/g, VARIABLE_GAP),
          )
        );
      }),
      ...Object.keys(PLAIN_WORDS).filter((term) => !terms.includes(term)),
    ];
    expect(stale).toEqual([]);
  });
});
