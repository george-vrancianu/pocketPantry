// The Catalog Tags and Eating Moments the seeded Recipes use. To add one,
// append a line here (slugs are permanent; names must be unique after
// normalising) and reference it from a Recipe's data file (a Variant's `tag`
// is `group:slug`).
import type { SeedNamed } from './recipe-seed-types';

const named = (
  slug: string,
  en: string,
  ro: string,
  da: string,
): SeedNamed => ({ slug, en, ro, da });

const CUISINE_TAGS: SeedNamed[] = [
  named('mediterranean', 'Mediterranean', 'Mediteraneană', 'Middelhavsk'),
  named(
    'middle-eastern',
    'Middle Eastern',
    'Din Orientul Mijlociu',
    'Mellemøstlig',
  ),
  named('asian', 'Asian', 'Asiatică', 'Asiatisk'),
  named('romanian', 'Romanian', 'Românească', 'Rumænsk'),
  named('french', 'French', 'Franțuzească', 'Fransk'),
  named('irish', 'Irish', 'Irlandeză', 'Irsk'),
  named('american', 'American', 'Americană', 'Amerikansk'),
  named('greek', 'Greek', 'Grecească', 'Græsk'),
  named('thai', 'Thai', 'Thailandeză', 'Thailandsk'),
  named('british', 'British', 'Britanică', 'Britisk'),
  named('korean', 'Korean', 'Coreeană', 'Koreansk'),
  named('japanese', 'Japanese', 'Japoneză', 'Japansk'),
  named('italian', 'Italian', 'Italiană', 'Italiensk'),
  named('spanish', 'Spanish', 'Spaniolă', 'Spansk'),
  named('scandinavian', 'Scandinavian', 'Scandinavă', 'Skandinavisk'),
];

const METHOD_TAGS: SeedNamed[] = [
  named('rolled', 'French rolled', 'Rulată franțuzește', 'Fransk rullet'),
  named(
    'folded',
    'American folded',
    'Pliată americănește',
    'Amerikansk foldet',
  ),
  named('frittata', 'Frittata', 'Frittata', 'Frittata'),
  named('riced', 'Riced', 'Trecut prin presă', 'Presset'),
  named('gratin-topped', 'Gratin-topped', 'Gratinat', 'Gratineret'),
  named(
    'creamy-bound',
    'Creamy bound salad',
    'Salată cu maioneză',
    'Cremet salat',
  ),
  named('warm-salad', 'Warm salad', 'Salată caldă', 'Varm salat'),
  named('oven-fried', 'Oven-fried', 'Prăjit la cuptor', 'Ovnstegt'),
  named('air-fried', 'Air-fried', 'La air fryer', 'Airfryer-stegt'),
];

/** The Tag Groups in display order (ADR 0033). */
export const SEED_TAG_GROUPS: (SeedNamed & { position: number })[] = [
  { ...named('meal', 'Meal', 'Masă', 'Måltid'), position: 1 },
  { ...named('diet', 'Diet', 'Dietă', 'Diæt'), position: 2 },
  { ...named('cuisine', 'Cuisine', 'Bucătărie', 'Køkken'), position: 3 },
  { ...named('method', 'Method', 'Metodă', 'Metode'), position: 4 },
];

export type TagGroupSlug = 'meal' | 'diet' | 'cuisine' | 'method';

/** The Catalog Tags of each Tag Group. */
export const SEED_TAGS: Record<TagGroupSlug, SeedNamed[]> = {
  meal: [
    named('breakfast', 'Breakfast', 'Mic dejun', 'Morgenmad'),
    named('brunch', 'Brunch', 'Brunch', 'Brunch'),
    named('lunch', 'Lunch', 'Prânz', 'Frokost'),
    named('dinner', 'Dinner', 'Cină', 'Aftensmad'),
    named('snack', 'Snack', 'Gustare', 'Snack'),
    named('dessert', 'Dessert', 'Desert', 'Dessert'),
  ],
  diet: [
    named('vegetarian', 'Vegetarian', 'Vegetarian', 'Vegetarisk'),
    named('vegan', 'Vegan', 'Vegan', 'Vegansk'),
    named('keto', 'Keto', 'Keto', 'Keto'),
    named('low-carb', 'Low-carb', 'Cu puțini carbohidrați', 'Lavkulhydrat'),
    named('high-protein', 'High-protein', 'Bogat în proteine', 'Proteinrig'),
  ],
  cuisine: CUISINE_TAGS,
  method: METHOD_TAGS,
};

/** In display order. Exactly the list from the ticket. */
export const SEED_EATING_MOMENTS: SeedNamed[] = [
  named('morning', 'Morning', 'Dimineața', 'Morgen'),
  named('brunch', 'Brunch', 'Brunch', 'Brunch'),
  named('light-lunch', 'Light lunch', 'Prânz ușor', 'Let frokost'),
  named(
    'before-workout',
    'Before a workout',
    'Înainte de antrenament',
    'Før træning',
  ),
  named(
    'after-workout',
    'After a workout',
    'După antrenament',
    'Efter træning',
  ),
  named(
    'late-evening',
    'Late evening / before bed',
    'Seara târziu / înainte de culcare',
    'Sen aften / før sengetid',
  ),
  named('hot-day', 'Hot day', 'Zi caldă', 'Varm dag'),
  named('cold-day', 'Cold day', 'Zi rece', 'Kold dag'),
];
