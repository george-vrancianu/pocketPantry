// Every seeded Base Recipe with its Variants, one data file each (./data).
// To add a base: write its data file, import it here, and keep the slug
// permanent. `npm run test:unit` validates the lot (validate-recipe-seed.ts).
import type { BaseRecipeSeed } from './recipe-seed-types';
import { omelette } from './data/omelette';
import { appetizerPlatter } from './data/appetizer-platter';

export const SEED_BASE_RECIPES: BaseRecipeSeed[] = [omelette, appetizerPlatter];
