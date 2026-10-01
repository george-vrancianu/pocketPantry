// The Catalog seed. Aisles and Parent Categories live here; each Parent's Leaf
// Categories and Ingredients live in ./data. Names and Synonyms were drafted
// with an LLM and are reviewed by the repository owner in the pull request.
// Slugs are the stable identity: ids are derived from them, so re-seeding is
// idempotent. Never rename a slug once it has shipped.
import { bakery, meat, seafood } from './data/bakery-meat-seafood';
import { dairy, eggs, frozen } from './data/dairy-eggs-frozen';
import { grains, legumes, pasta } from './data/dry-goods';
import { cannedGoods, condiments, oils, spices } from './data/pantry-shelf';
import { herbs, produce } from './data/produce';
import { beverage, snacks } from './data/snacks-drinks';
import type {
  Location,
  SeedAisle,
  SeedIngredient,
  SeedLeaf,
  SeedParent,
  SeedSection,
} from './seed-types';

export type { SeedAisle, SeedIngredient, SeedLeaf, SeedParent };

const aisle = (
  slug: string,
  en: string,
  ro: string,
  sortOrder: number,
): SeedAisle => ({ slug, en, ro, sortOrder });

// Shop-walk order. Parent Categories sharing an Aisle share its sort order.
export const SEED_AISLES: SeedAisle[] = [
  aisle('fruit-veg', 'Fruit & veg', 'Legume și fructe', 1),
  aisle('bakery', 'Bakery', 'Panificație', 2),
  aisle('meat-fish', 'Meat & fish', 'Carne și pește', 3),
  aisle('dairy-eggs', 'Dairy & eggs', 'Lactate și ouă', 4),
  aisle('frozen', 'Frozen', 'Congelate', 5),
  aisle('dry-goods', 'Dry goods', 'Produse uscate', 6),
  aisle('tins-jars', 'Tins & jars', 'Conserve și borcane', 7),
  aisle('oils-spices', 'Oils & spices', 'Uleiuri și mirodenii', 8),
  aisle('snacks-drinks', 'Snacks & drinks', 'Gustări și băuturi', 9),
  aisle('other', 'Other', 'Altele', 10),
];

const parent = (
  slug: string,
  en: string,
  ro: string,
  aisleSlug: string,
  defaultExpiryDays: number | null,
  defaultLocation: Location | null,
): SeedParent => ({
  slug,
  en,
  ro,
  aisle: aisleSlug,
  defaultExpiryDays,
  defaultLocation,
});

// retzetar's 18 categories, in shop-walk order.
export const SEED_PARENTS: SeedParent[] = [
  parent('produce', 'Produce', 'Legume și fructe', 'fruit-veg', 7, 'fridge'),
  parent('herbs', 'Herbs', 'Ierburi aromatice', 'fruit-veg', 7, 'fridge'),
  parent('bakery', 'Bakery', 'Panificație', 'bakery', 4, 'cupboard'),
  parent('meat', 'Meat', 'Carne', 'meat-fish', 3, 'fridge'),
  parent(
    'seafood',
    'Seafood',
    'Pește și fructe de mare',
    'meat-fish',
    2,
    'fridge',
  ),
  parent('dairy', 'Dairy', 'Lactate', 'dairy-eggs', 10, 'fridge'),
  parent('eggs', 'Eggs', 'Ouă', 'dairy-eggs', 21, 'fridge'),
  parent('frozen', 'Frozen', 'Congelate', 'frozen', 180, 'freezer'),
  parent('pasta', 'Pasta', 'Paste', 'dry-goods', 365, 'cupboard'),
  parent(
    'grains',
    'Grains',
    'Cereale și făinuri',
    'dry-goods',
    365,
    'cupboard',
  ),
  parent('legumes', 'Legumes', 'Leguminoase', 'dry-goods', 365, 'cupboard'),
  parent(
    'canned-goods',
    'Canned Goods',
    'Conserve',
    'tins-jars',
    540,
    'cupboard',
  ),
  parent('condiments', 'Condiments', 'Sosuri', 'tins-jars', 180, 'cupboard'),
  parent('oils', 'Oils', 'Uleiuri și oțet', 'oils-spices', 365, 'cupboard'),
  parent('spices', 'Spices', 'Mirodenii', 'oils-spices', 730, 'spices'),
  parent('snacks', 'Snacks', 'Gustări', 'snacks-drinks', 180, 'cupboard'),
  parent('beverage', 'Beverage', 'Băuturi', 'snacks-drinks', 180, 'cupboard'),
  parent('other', 'Other', 'Altele', 'other', null, null),
];

const SECTIONS: SeedSection[] = [
  produce,
  herbs,
  bakery,
  meat,
  seafood,
  dairy,
  eggs,
  frozen,
  pasta,
  grains,
  legumes,
  cannedGoods,
  condiments,
  oils,
  spices,
  snacks,
  beverage,
];

// Every Parent gets an "Other" Leaf so Unmatched Batches always have a home.
// The top-level "Other" Parent's own Leaf is simply named "Other". These Leaves
// carry no Default Expiry of their own and fall back to the Parent's.
const OTHER_LEAVES: SeedLeaf[] = SEED_PARENTS.map((p) =>
  p.slug === 'other'
    ? { slug: 'other-other', parent: p.slug, en: 'Other', ro: 'Altele' }
    : {
        slug: `${p.slug}-other`,
        parent: p.slug,
        en: `Other ${p.slug === 'beverage' ? 'drinks' : p.en.toLowerCase()}`,
        ro: `Altele (${p.ro.toLowerCase()})`,
      },
);

export const SEED_LEAVES: SeedLeaf[] = [
  ...SECTIONS.flatMap((section) => section.leaves),
  ...OTHER_LEAVES,
];

export const SEED_INGREDIENTS: SeedIngredient[] = SECTIONS.flatMap(
  (section) => section.ingredients,
);
