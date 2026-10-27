// Every seeded Base Recipe with its Variants, one data file each (./data).
// To add a base: write its data file, import it here, and keep the slug
// permanent. `npm run test:unit` validates the lot (validate-recipe-seed.ts).
import type { BaseRecipeSeed } from './recipe-seed-types';
import { appetizerPlatter } from './data/appetizer-platter';
import { ardeiUmpluti } from './data/ardei-umpluti';
import { bakedPotatoes } from './data/baked-potatoes';
import { bakedSalmon } from './data/baked-salmon';
import { beefStew } from './data/beef-stew';
import { biksemad } from './data/biksemad';
import { bolognese } from './data/bolognese';
import { braisedRedCabbage } from './data/braised-red-cabbage';
import { brunedeKartofler } from './data/brunede-kartofler';
import { burgers } from './data/burgers';
import { chickenCurry } from './data/chicken-curry';
import { chickenSalad } from './data/chicken-salad';
import { chickenSoup } from './data/chicken-soup';
import { chiliConCarne } from './data/chili-con-carne';
import { ciorbaDeFasole } from './data/ciorba-de-fasole';
import { ciorbaDePerisoare } from './data/ciorba-de-perisoare';
import { ciorbaDePeste } from './data/ciorba-de-peste';
import { ciorbaRadauteana } from './data/ciorba-radauteana';
import { coleslaw } from './data/coleslaw';
import { cottagePie } from './data/cottage-pie';
import { fishAndChips } from './data/fish-and-chips';
import { fishCakes } from './data/fish-cakes';
import { flaeskesteg } from './data/flaeskesteg';
import { frenchToast } from './data/french-toast';
import { friedChicken } from './data/fried-chicken';
import { friedRice } from './data/fried-rice';
import { frikadeller } from './data/frikadeller';
import { garlicShrimp } from './data/garlic-shrimp';
import { ghiveci } from './data/ghiveci';
import { homemadePizza } from './data/homemade-pizza';
import { hummus } from './data/hummus';
import { iahnieDeFasole } from './data/iahnie-de-fasole';
import { lasagne } from './data/lasagne';
import { lentilSoup } from './data/lentil-soup';
import { macAndCheese } from './data/mac-and-cheese';
import { mamaliga } from './data/mamaliga';
import { mancareDeMazare } from './data/mancare-de-mazare';
import { mici } from './data/mici';
import { musaca } from './data/musaca';
import { oatmeal } from './data/oatmeal';
import { omelette } from './data/omelette';
import { ostropel } from './data/ostropel';
import { padThai } from './data/pad-thai';
import { pancakes } from './data/pancakes';
import { papanasi } from './data/papanasi';
import { pastaCarbonara } from './data/pasta-carbonara';
import { placintaCuBranza } from './data/placinta-cu-branza';
import { porkChops } from './data/pork-chops';
import { potatoPuree } from './data/potato-puree';
import { potatoSalad } from './data/potato-salad';
import { puiLaCeaun } from './data/pui-la-ceaun';
import { quiche } from './data/quiche';
import { ricePilaf } from './data/rice-pilaf';
import { ricePudding } from './data/rice-pudding';
import { risotto } from './data/risotto';
import { roastChicken } from './data/roast-chicken';
import { roastedVegetables } from './data/roasted-vegetables';
import { salataDeBoeuf } from './data/salata-de-boeuf';
import { salataDeIcre } from './data/salata-de-icre';
import { salataDeVinete } from './data/salata-de-vinete';
import { saramuraDePeste } from './data/saramura-de-peste';
import { sarmale } from './data/sarmale';
import { shakshuka } from './data/shakshuka';
import { smorrebrod } from './data/smorrebrod';
import { steamedMussels } from './data/steamed-mussels';
import { stegtFlaesk } from './data/stegt-flaesk';
import { stirFry } from './data/stir-fry';
import { tacos } from './data/tacos';
import { tocanaDeCiuperci } from './data/tocana-de-ciuperci';
import { tochitura } from './data/tochitura';
import { tomatoPasta } from './data/tomato-pasta';
import { tomatoSoup } from './data/tomato-soup';
import { varzaCalita } from './data/varza-calita';
import { vegetableSoup } from './data/vegetable-soup';
import { zacusca } from './data/zacusca';

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
  fishCakes,
  salataDeVinete,
  brunedeKartofler,
  frenchToast,
  ricePudding,
  homemadePizza,
  papanasi,
  ciorbaDeFasole,
  vegetableSoup,
  burgers,
  pastaCarbonara,
  ostropel,
  mancareDeMazare,
  shakshuka,
  oatmeal,
  ciorbaRadauteana,
  varzaCalita,
  salataDeBoeuf,
  lasagne,
  tacos,
  cottagePie,
  iahnieDeFasole,
  puiLaCeaun,
  quiche,
  porkChops,
  musaca,
  tocanaDeCiuperci,
  zacusca,
  coleslaw,
  bakedPotatoes,
  hummus,
  ghiveci,
  ciorbaDePeste,
  padThai,
  fishAndChips,
  saramuraDePeste,
  salataDeIcre,
  placintaCuBranza,
];
