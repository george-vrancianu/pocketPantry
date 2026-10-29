import { normalizeName } from '../catalog/normalize';

/**
 * Tag names that claim a Recipe is free of an Allergen ("Gluten-free", "Dairy free", "No nuts").
 * Allergens come from a Recipe's Ingredient Lines (ADR 0033), never from a Tag, so a Family Tag
 * with such a name earns a warning in the editor and a Catalog Tag may not carry one (#712 reuses
 * `isAllergenFreeName` to refuse it).
 *
 * The list is curated, not exhaustive: the EU's 14 Allergens plus their common everyday names, in
 * English, Romanian and Danish. Names are compared after `normalizeName` and with spaces removed,
 * so "Gluten-Free", "gluten free" and "glutenfree" are one.
 */
const TERMS = [
  // 1 cereals containing gluten
  'gluten',
  'wheat',
  'rye',
  'barley',
  'oat',
  'oats',
  'grain',
  'grains',
  'cereal',
  'cereals',
  // 2 crustaceans, 14 molluscs
  'crustacean',
  'crustaceans',
  'shellfish',
  'mollusc',
  'molluscs',
  'mollusk',
  'mollusks',
  'shrimp',
  'prawn',
  // 3 eggs
  'egg',
  'eggs',
  // 4 fish
  'fish',
  // 5 peanuts, 8 tree nuts
  'peanut',
  'peanuts',
  'nut',
  'nuts',
  'tree nut',
  'tree nuts',
  'almond',
  'almonds',
  'hazelnut',
  'hazelnuts',
  'walnut',
  'walnuts',
  // 6 soybeans
  'soy',
  'soya',
  'soybean',
  'soybeans',
  // 7 milk
  'milk',
  'dairy',
  'lactose',
  // 9 celery, 10 mustard, 11 sesame, 12 sulphites, 13 lupin
  'celery',
  'mustard',
  'sesame',
  'sulphite',
  'sulphites',
  'sulfite',
  'sulfites',
  'lupin',
  'lupine',
  // generic
  'allergen',
  'allergens',
  'allergy',
  // Romanian (after folding diacritics)
  'lapte',
  'oua',
  'ou',
  'peste',
  'arahide',
  'nuci',
  'soia',
  'telina',
  'mustar',
  'susan',
  'lactoza',
  'lactate',
  'grau',
  'sulfiti',
  'crustacee',
  'moluste',
  // Danish (after folding: aa, ae, oe)
  'maelk',
  'aeg',
  'fisk',
  'jordnoedder',
  'noedder',
  'skaldyr',
  'bloeddyr',
  'maelke',
  'noedde',
  'jordnoedde',
  'skaldyrs',
  'selleri',
  'sennep',
  'saesam',
  'sesam',
  'soja',
  'sulfit',
  'sulfitter',
  'laktose',
  'hvede',
  'allergener',
];

const FORMS: ((term: string) => string)[] = [
  (t) => `${t} free`,
  (t) => `free from ${t}`,
  (t) => `free of ${t}`,
  (t) => `no ${t}`,
  (t) => `without ${t}`,
  (t) => `${t} less`,
  // Romanian: "fara gluten", "fara lactoza"
  (t) => `fara ${t}`,
  // Danish: "glutenfri", "uden gluten"
  (t) => `${t} fri`,
  (t) => `uden ${t}`,
];

const compact = (name: string) => normalizeName(name).replace(/ /g, '');

const CLAIMS: ReadonlySet<string> = new Set(
  TERMS.flatMap((term) => FORMS.map((form) => compact(form(term)))),
);

/** Whether `name` reads as "free of an Allergen", e.g. "Gluten-free", "Fără lactoză", "Uden nødder". */
export function isAllergenFreeName(name: string): boolean {
  return CLAIMS.has(compact(name));
}
