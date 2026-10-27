// Every seeded Base Recipe with its Variants, one data file each (./data).
// To add a base: write its data file, import it here, and keep the slug
// permanent. `npm run test:unit` validates the lot (validate-recipe-seed.ts).
import type { BaseRecipeSeed } from './recipe-seed-types';
import { appetizerPlatter } from './data/appetizer-platter';
import { ardeiUmpluti } from './data/ardei-umpluti';
import { bakedSalmon } from './data/baked-salmon';
import { beefStew } from './data/beef-stew';
import { biksemad } from './data/biksemad';
import { bolognese } from './data/bolognese';
import { braisedRedCabbage } from './data/braised-red-cabbage';
import { chickenCurry } from './data/chicken-curry';
import { chickenSalad } from './data/chicken-salad';
import { chickenSoup } from './data/chicken-soup';
import { chiliConCarne } from './data/chili-con-carne';
import { ciorbaDePerisoare } from './data/ciorba-de-perisoare';
import { flaeskesteg } from './data/flaeskesteg';
import { friedChicken } from './data/fried-chicken';
import { friedRice } from './data/fried-rice';
import { frikadeller } from './data/frikadeller';
import { garlicShrimp } from './data/garlic-shrimp';
import { lentilSoup } from './data/lentil-soup';
import { macAndCheese } from './data/mac-and-cheese';
import { mamaliga } from './data/mamaliga';
import { mici } from './data/mici';
import { omelette } from './data/omelette';
import { pancakes } from './data/pancakes';
import { potatoPuree } from './data/potato-puree';
import { potatoSalad } from './data/potato-salad';
import { ricePilaf } from './data/rice-pilaf';
import { risotto } from './data/risotto';
import { roastChicken } from './data/roast-chicken';
import { roastedVegetables } from './data/roasted-vegetables';
import { sarmale } from './data/sarmale';
import { smorrebrod } from './data/smorrebrod';
import { steamedMussels } from './data/steamed-mussels';
import { stegtFlaesk } from './data/stegt-flaesk';
import { stirFry } from './data/stir-fry';
import { tochitura } from './data/tochitura';
import { tomatoPasta } from './data/tomato-pasta';
import { tomatoSoup } from './data/tomato-soup';

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
  mamaliga,
  smorrebrod,
  chickenSoup,
  bolognese,
  bakedSalmon,
  ciorbaDePerisoare,
  stegtFlaesk,
  friedRice,
  beefStew,
  roastedVegetables,
  mici,
  braisedRedCabbage,
  chiliConCarne,
  risotto,
  garlicShrimp,
  ardeiUmpluti,
  flaeskesteg,
  chickenCurry,
  macAndCheese,
  steamedMussels,
  tochitura,
  biksemad,
  tomatoSoup,
  potatoSalad,
];
