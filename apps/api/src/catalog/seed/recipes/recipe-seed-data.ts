// Every seeded Base Recipe with its Variants, one data file each (./data).
// To add a base: write its data file, import it here, and keep the slug
// permanent. `npm run test:unit` validates the lot (validate-recipe-seed.ts).
import type { BaseRecipeSeed } from './recipe-seed-types';
import { appetizerPlatter } from './data/appetizer-platter';
import { chickenSalad } from './data/chicken-salad';
import { friedChicken } from './data/fried-chicken';
import { frikadeller } from './data/frikadeller';
import { lentilSoup } from './data/lentil-soup';
import { omelette } from './data/omelette';
import { pancakes } from './data/pancakes';
import { potatoPuree } from './data/potato-puree';
import { ricePilaf } from './data/rice-pilaf';
import { roastChicken } from './data/roast-chicken';
import { sarmale } from './data/sarmale';
import { stirFry } from './data/stir-fry';
import { tomatoPasta } from './data/tomato-pasta';

export const SEED_BASE_RECIPES: BaseRecipeSeed[] = [
  omelette,
  potatoPuree,
  friedChicken,
  chickenSalad,
  appetizerPlatter,
  tomatoPasta,
  roastChicken,
  lentilSoup,
  sarmale,
  frikadeller,
  pancakes,
  ricePilaf,
  stirFry,
];
