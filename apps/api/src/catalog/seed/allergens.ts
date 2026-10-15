// The Allergen list the Catalog seed starts with: the EU's 14 major allergens,
// in the order the law lists them. Admins curate the list afterwards. Slugs are
// permanent; ids are derived from them.
import type { SeedAllergen } from './seed-types';

const allergen = (
  slug: string,
  en: string,
  ro: string,
  da: string,
): SeedAllergen => ({ slug, en, ro, da });

export const SEED_ALLERGENS: SeedAllergen[] = [
  allergen('gluten', 'Gluten', 'Gluten', 'Gluten'),
  allergen('crustaceans', 'Crustaceans', 'Crustacee', 'Krebsdyr'),
  allergen('eggs', 'Eggs', 'Ouă', 'Æg'),
  allergen('fish', 'Fish', 'Pește', 'Fisk'),
  allergen('peanuts', 'Peanuts', 'Arahide', 'Jordnødder'),
  allergen('soy', 'Soy', 'Soia', 'Soja'),
  allergen('milk', 'Milk', 'Lapte', 'Mælk'),
  allergen('tree-nuts', 'Tree nuts', 'Fructe cu coajă', 'Trænødder'),
  allergen('celery', 'Celery', 'Țelină', 'Selleri'),
  allergen('mustard', 'Mustard', 'Muștar', 'Sennep'),
  allergen('sesame', 'Sesame', 'Susan', 'Sesam'),
  allergen('sulphites', 'Sulphites', 'Sulfiți', 'Sulfitter'),
  allergen('lupin', 'Lupin', 'Lupin', 'Lupin'),
  allergen('molluscs', 'Molluscs', 'Moluște', 'Bløddyr'),
];
