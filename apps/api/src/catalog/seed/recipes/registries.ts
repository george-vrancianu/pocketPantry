// The Cuisines, Methods and Eating Moments the seeded Recipes use. To add one,
// append a line here (slugs are permanent; names must be unique after
// normalising) and reference its slug from a Recipe's data file.
import type { SeedNamed } from './recipe-seed-types';

const named = (
  slug: string,
  en: string,
  ro: string,
  da: string,
): SeedNamed => ({ slug, en, ro, da });

export const SEED_CUISINES: SeedNamed[] = [
  named('mediterranean', 'Mediterranean', 'Mediteraneană', 'Middelhavs'),
  named(
    'middle-eastern',
    'Middle Eastern',
    'Orientul Mijlociu',
    'Mellemøstlig',
  ),
  named('asian', 'Asian', 'Asiatică', 'Asiatisk'),
  named('romanian', 'Romanian', 'Românească', 'Rumænsk'),
  named('american', 'American', 'Americană', 'Amerikansk'),
  named('korean', 'Korean', 'Coreeană', 'Koreansk'),
  named('japanese', 'Japanese', 'Japoneză', 'Japansk'),
];

export const SEED_METHODS: SeedNamed[] = [
  named('rolled', 'French rolled', 'Rulată franțuzește', 'Fransk rullet'),
  named('folded', 'American folded', 'Pliată american', 'Amerikansk foldet'),
  named('frittata', 'Frittata', 'Frittata', 'Frittata'),
  named('oven-fried', 'Oven-fried', 'Prăjit la cuptor', 'Ovnstegt'),
  named('air-fried', 'Air-fried', 'La air fryer', 'Airfryer-stegt'),
];

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
