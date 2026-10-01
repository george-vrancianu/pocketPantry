// Hand-written starter Catalog. The full generated seed is a separate ticket.
// Slugs are the stable identity: ids are derived from them, so re-seeding is
// idempotent. Never rename a slug once it has shipped.
import type { ingredientUnit, storageLocation } from '../../database/schema';

type Location = (typeof storageLocation.enumValues)[number];
type Unit = (typeof ingredientUnit.enumValues)[number];

export type SeedAisle = {
  slug: string;
  en: string;
  ro: string;
  sortOrder: number;
};

export type SeedParent = {
  slug: string;
  en: string;
  ro: string;
  aisle: string; // Aisle slug
  defaultExpiryDays: number | null;
  defaultLocation: Location | null;
};

export type SeedLeaf = {
  slug: string;
  parent: string;
  en: string;
  ro: string;
  defaultExpiryDays?: number;
  defaultLocation?: Location;
};

export type SeedIngredient = {
  slug: string;
  leaf: string;
  en: string;
  ro: string;
  unit: Unit;
  synonyms?: { en?: string[]; ro?: string[] };
};

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

const leaf = (
  slug: string,
  parentSlug: string,
  en: string,
  ro: string,
  defaults: Pick<SeedLeaf, 'defaultExpiryDays' | 'defaultLocation'> = {},
): SeedLeaf => ({ slug, parent: parentSlug, en, ro, ...defaults });

const STARTER_LEAVES: SeedLeaf[] = [
  leaf('vegetables', 'produce', 'Vegetables', 'Legume'),
  leaf('fruit', 'produce', 'Fruit', 'Fructe'),
  leaf('fresh-herbs', 'herbs', 'Fresh herbs', 'Ierburi proaspete'),
  leaf('bread', 'bakery', 'Bread', 'Pâine'),
  leaf('poultry', 'meat', 'Poultry', 'Carne de pasăre'),
  leaf('red-meat', 'meat', 'Red meat', 'Carne roșie'),
  leaf('fish', 'seafood', 'Fish', 'Pește'),
  leaf('hard-cheese', 'dairy', 'Hard cheese', 'Brânzeturi tari', {
    defaultExpiryDays: 30,
  }),
  leaf('fresh-cheese', 'dairy', 'Fresh cheese', 'Brânzeturi proaspete', {
    defaultExpiryDays: 7,
  }),
  leaf('milk-and-cream', 'dairy', 'Milk and cream', 'Lapte și smântână', {
    defaultExpiryDays: 7,
  }),
  leaf('yogurt', 'dairy', 'Yogurt', 'Iaurt și chefir', {
    defaultExpiryDays: 14,
  }),
  leaf('butter', 'dairy', 'Butter', 'Unt', { defaultExpiryDays: 30 }),
  leaf('hen-eggs', 'eggs', 'Hen eggs', 'Ouă de găină'),
  leaf('frozen-vegetables', 'frozen', 'Frozen vegetables', 'Legume congelate'),
  leaf('dried-pasta', 'pasta', 'Dried pasta', 'Paste uscate'),
  leaf('rice-and-oats', 'grains', 'Rice and oats', 'Orez și ovăz'),
  leaf('flour-and-sugar', 'grains', 'Flour and sugar', 'Făină și zahăr'),
  leaf('dried-legumes', 'legumes', 'Dried legumes', 'Leguminoase uscate'),
  leaf(
    'canned-vegetables',
    'canned-goods',
    'Canned vegetables',
    'Conserve de legume',
  ),
  leaf('canned-fish', 'canned-goods', 'Canned fish', 'Conserve de pește'),
  leaf('table-sauces', 'condiments', 'Table sauces', 'Sosuri de masă'),
  leaf('cooking-oils', 'oils', 'Cooking oils', 'Uleiuri de gătit'),
  leaf('vinegar', 'oils', 'Vinegar', 'Oțet'),
  leaf('ground-spices', 'spices', 'Ground spices', 'Condimente măcinate'),
  leaf('sweet-snacks', 'snacks', 'Sweet snacks', 'Dulciuri'),
  leaf('salty-snacks', 'snacks', 'Salty snacks', 'Snacks-uri sărate'),
  leaf('juices', 'beverage', 'Juices', 'Sucuri'),
  leaf('coffee-and-tea', 'beverage', 'Coffee and tea', 'Cafea și ceai'),
];

// Every Parent gets an "Other" Leaf so Unmatched Batches always have a home.
// The top-level "Other" Parent's own Leaf is simply named "Other".
const OTHER_LEAVES: SeedLeaf[] = SEED_PARENTS.map((p) =>
  p.slug === 'other'
    ? leaf('other-other', p.slug, 'Other', 'Altele')
    : leaf(
        `${p.slug}-other`,
        p.slug,
        `Other ${p.en.toLowerCase()}`,
        `Altele (${p.ro.toLowerCase()})`,
      ),
);

export const SEED_LEAVES: SeedLeaf[] = [...STARTER_LEAVES, ...OTHER_LEAVES];

const ingredient = (
  slug: string,
  leafSlug: string,
  en: string,
  ro: string,
  unit: Unit,
  synonyms?: SeedIngredient['synonyms'],
): SeedIngredient => ({ slug, leaf: leafSlug, en, ro, unit, synonyms });

export const SEED_INGREDIENTS: SeedIngredient[] = [
  ingredient('tomato', 'vegetables', 'Tomato', 'Roșii', 'g', {
    en: ['tomatoes'],
    ro: ['roșie'],
  }),
  ingredient('onion', 'vegetables', 'Onion', 'Ceapă', 'pcs'),
  ingredient('garlic', 'vegetables', 'Garlic', 'Usturoi', 'g'),
  ingredient('potato', 'vegetables', 'Potato', 'Cartofi', 'kg'),
  ingredient('carrot', 'vegetables', 'Carrot', 'Morcovi', 'g'),
  ingredient('cucumber', 'vegetables', 'Cucumber', 'Castraveți', 'pcs'),
  ingredient('bell-pepper', 'vegetables', 'Bell pepper', 'Ardei gras', 'pcs', {
    en: ['capsicum'],
  }),
  ingredient('apple', 'fruit', 'Apple', 'Mere', 'pcs'),
  ingredient('banana', 'fruit', 'Banana', 'Banane', 'pcs'),
  ingredient('lemon', 'fruit', 'Lemon', 'Lămâie', 'pcs'),
  ingredient('parsley', 'fresh-herbs', 'Parsley', 'Pătrunjel', 'g'),
  ingredient('dill', 'fresh-herbs', 'Dill', 'Mărar', 'g'),
  ingredient('bread', 'bread', 'Bread', 'Pâine', 'pcs', {
    en: ['loaf'],
    ro: ['franzelă'],
  }),
  ingredient(
    'chicken-breast',
    'poultry',
    'Chicken breast',
    'Piept de pui',
    'g',
  ),
  ingredient(
    'minced-beef',
    'red-meat',
    'Minced beef',
    'Carne tocată de vită',
    'g',
    {
      en: ['ground beef'],
    },
  ),
  ingredient('pork-chops', 'red-meat', 'Pork chops', 'Cotlet de porc', 'g'),
  ingredient('salmon', 'fish', 'Salmon', 'Somon', 'g'),
  ingredient('parmesan', 'hard-cheese', 'Parmesan', 'Parmezan', 'g', {
    en: ['parmigiano reggiano'],
    ro: ['parmigiano'],
  }),
  ingredient('cheddar', 'hard-cheese', 'Cheddar', 'Cheddar', 'g'),
  ingredient('feta', 'fresh-cheese', 'Feta', 'Brânză feta', 'g', {
    en: ['greek cheese'],
    ro: ['telemea de vaci'],
  }),
  ingredient('mozzarella', 'fresh-cheese', 'Mozzarella', 'Mozzarella', 'g'),
  ingredient(
    'cottage-cheese',
    'fresh-cheese',
    'Cottage cheese',
    'Brânză de vaci',
    'g',
  ),
  ingredient('milk', 'milk-and-cream', 'Milk', 'Lapte', 'l'),
  ingredient('sour-cream', 'milk-and-cream', 'Sour cream', 'Smântână', 'g'),
  ingredient('yogurt', 'yogurt', 'Yogurt', 'Iaurt', 'g', {
    en: ['yoghurt'],
  }),
  ingredient('butter', 'butter', 'Butter', 'Unt', 'g'),
  ingredient('eggs', 'hen-eggs', 'Eggs', 'Ouă', 'pcs', {
    en: ['egg'],
    ro: ['ou'],
  }),
  ingredient(
    'frozen-peas',
    'frozen-vegetables',
    'Frozen peas',
    'Mazăre congelată',
    'g',
  ),
  ingredient('spaghetti', 'dried-pasta', 'Spaghetti', 'Spaghete', 'g'),
  ingredient('penne', 'dried-pasta', 'Penne', 'Penne', 'g'),
  ingredient('rice', 'rice-and-oats', 'Rice', 'Orez', 'g'),
  ingredient('oats', 'rice-and-oats', 'Oats', 'Fulgi de ovăz', 'g', {
    en: ['porridge oats'],
  }),
  ingredient('flour', 'flour-and-sugar', 'Flour', 'Făină', 'g'),
  ingredient('sugar', 'flour-and-sugar', 'Sugar', 'Zahăr', 'g'),
  ingredient('lentils', 'dried-legumes', 'Lentils', 'Linte', 'g'),
  ingredient('chickpeas', 'dried-legumes', 'Chickpeas', 'Năut', 'g', {
    en: ['garbanzo beans'],
  }),
  ingredient(
    'kidney-beans',
    'dried-legumes',
    'Kidney beans',
    'Fasole roșie',
    'g',
  ),
  ingredient(
    'canned-tomatoes',
    'canned-vegetables',
    'Canned tomatoes',
    'Roșii conservate',
    'g',
    {
      en: ['tinned tomatoes', 'passata'],
    },
  ),
  ingredient(
    'sweetcorn',
    'canned-vegetables',
    'Sweetcorn',
    'Porumb dulce',
    'g',
    {
      en: ['corn'],
      ro: ['porumb'],
    },
  ),
  ingredient(
    'canned-tuna',
    'canned-fish',
    'Canned tuna',
    'Ton la conservă',
    'g',
  ),
  ingredient('ketchup', 'table-sauces', 'Ketchup', 'Ketchup', 'g'),
  ingredient('mustard', 'table-sauces', 'Mustard', 'Muștar', 'g'),
  ingredient('mayonnaise', 'table-sauces', 'Mayonnaise', 'Maioneză', 'g', {
    en: ['mayo'],
  }),
  ingredient(
    'olive-oil',
    'cooking-oils',
    'Olive oil',
    'Ulei de măsline',
    'ml',
    {
      en: ['extra virgin olive oil'],
    },
  ),
  ingredient(
    'sunflower-oil',
    'cooking-oils',
    'Sunflower oil',
    'Ulei de floarea soarelui',
    'ml',
  ),
  ingredient('vinegar', 'vinegar', 'Vinegar', 'Oțet', 'ml'),
  ingredient(
    'black-pepper',
    'ground-spices',
    'Black pepper',
    'Piper negru',
    'g',
    {
      en: ['pepper'],
      ro: ['piper'],
    },
  ),
  ingredient('paprika', 'ground-spices', 'Paprika', 'Boia de ardei', 'g', {
    ro: ['boia', 'paprika'],
  }),
  ingredient('salt', 'ground-spices', 'Salt', 'Sare', 'g', {
    en: ['table salt'],
  }),
  ingredient('cinnamon', 'ground-spices', 'Cinnamon', 'Scorțișoară', 'g'),
  ingredient('chocolate', 'sweet-snacks', 'Chocolate', 'Ciocolată', 'g'),
  ingredient('potato-chips', 'salty-snacks', 'Potato chips', 'Chipsuri', 'g', {
    en: ['crisps'],
  }),
  ingredient(
    'orange-juice',
    'juices',
    'Orange juice',
    'Suc de portocale',
    'ml',
  ),
  ingredient('coffee', 'coffee-and-tea', 'Coffee', 'Cafea', 'g'),
  ingredient('tea', 'coffee-and-tea', 'Tea', 'Ceai', 'g'),
];
