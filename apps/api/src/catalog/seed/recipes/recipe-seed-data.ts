// Every seeded Base Recipe with its Variants, one data file each (./data).
// To add a base: write its data file, import it here, and keep the slug
// permanent. `npm run test:unit` validates the lot (validate-recipe-seed.ts).
import type { BaseRecipeSeed } from './recipe-seed-types';
import { appetizerPlatter } from './data/appetizer-platter';
import { appleCrumble } from './data/apple-crumble';
import { ardeiUmpluti } from './data/ardei-umpluti';
import { bakedPotatoes } from './data/baked-potatoes';
import { bakedSalmon } from './data/baked-salmon';
import { bananaBread } from './data/banana-bread';
import { beefStew } from './data/beef-stew';
import { biksemad } from './data/biksemad';
import { bolognese } from './data/bolognese';
import { braisedRedCabbage } from './data/braised-red-cabbage';
import { brownies } from './data/brownies';
import { brunedeKartofler } from './data/brunede-kartofler';
import { burgers } from './data/burgers';
import { cartofiTaranesti } from './data/cartofi-taranesti';
import { chec } from './data/chec';
import { chickenCurry } from './data/chicken-curry';
import { chickenSalad } from './data/chicken-salad';
import { chickenSoup } from './data/chicken-soup';
import { chiftele } from './data/chiftele';
import { chiliConCarne } from './data/chili-con-carne';
import { ciorbaArdeleneasca } from './data/ciorba-ardeleneasca';
import { ciorbaDeBurta } from './data/ciorba-de-burta';
import { ciorbaDeCartofi } from './data/ciorba-de-cartofi';
import { ciorbaDeCiuperci } from './data/ciorba-de-ciuperci';
import { ciorbaDeFasole } from './data/ciorba-de-fasole';
import { ciorbaDeFasoleVerde } from './data/ciorba-de-fasole-verde';
import { ciorbaDeLegume } from './data/ciorba-de-legume';
import { ciorbaDeMiel } from './data/ciorba-de-miel';
import { ciorbaDePerisoare } from './data/ciorba-de-perisoare';
import { ciorbaDePeste } from './data/ciorba-de-peste';
import { ciorbaDePraz } from './data/ciorba-de-praz';
import { ciorbaDePui } from './data/ciorba-de-pui';
import { ciorbaDeSalata } from './data/ciorba-de-salata';
import { ciorbaDeStevie } from './data/ciorba-de-stevie';
import { ciorbaDeUrzici } from './data/ciorba-de-urzici';
import { ciorbaDeVacuta } from './data/ciorba-de-vacuta';
import { ciorbaDeVarza } from './data/ciorba-de-varza';
import { ciorbaRadauteana } from './data/ciorba-radauteana';
import { coleslaw } from './data/coleslaw';
import { cornulete } from './data/cornulete';
import { cottagePie } from './data/cottage-pie';
import { cozonac } from './data/cozonac';
import { dovleceiPane } from './data/dovlecei-pane';
import { drobDeMiel } from './data/drob-de-miel';
import { falafel } from './data/falafel';
import { fasoleBatuta } from './data/fasole-batuta';
import { fishAndChips } from './data/fish-and-chips';
import { fishCakes } from './data/fish-cakes';
import { flaeskesteg } from './data/flaeskesteg';
import { frenchToast } from './data/french-toast';
import { friedChicken } from './data/fried-chicken';
import { friedRice } from './data/fried-rice';
import { frikadeller } from './data/frikadeller';
import { garlicShrimp } from './data/garlic-shrimp';
import { ghiveci } from './data/ghiveci';
import { gogosi } from './data/gogosi';
import { grilledCheese } from './data/grilled-cheese';
import { homemadePizza } from './data/homemade-pizza';
import { hummus } from './data/hummus';
import { iahnieDeFasole } from './data/iahnie-de-fasole';
import { lasagne } from './data/lasagne';
import { lentilSoup } from './data/lentil-soup';
import { macAndCheese } from './data/mac-and-cheese';
import { mamaliga } from './data/mamaliga';
import { mancareDeCartofi } from './data/mancare-de-cartofi';
import { mancareDeMazare } from './data/mancare-de-mazare';
import { meatloaf } from './data/meatloaf';
import { mici } from './data/mici';
import { muraturi } from './data/muraturi';
import { musaca } from './data/musaca';
import { oatmeal } from './data/oatmeal';
import { omelette } from './data/omelette';
import { ostropel } from './data/ostropel';
import { ouaUmplute } from './data/oua-umplute';
import { padThai } from './data/pad-thai';
import { paella } from './data/paella';
import { pancakes } from './data/pancakes';
import { papanasi } from './data/papanasi';
import { pasca } from './data/pasca';
import { pastaCarbonara } from './data/pasta-carbonara';
import { pastravLaGratar } from './data/pastrav-la-gratar';
import { plachieDePeste } from './data/plachie-de-peste';
import { placintaCuBranza } from './data/placinta-cu-branza';
import { porkChops } from './data/pork-chops';
import { potatoPuree } from './data/potato-puree';
import { potatoSalad } from './data/potato-salad';
import { puiLaCeaun } from './data/pui-la-ceaun';
import { pulledPork } from './data/pulled-pork';
import { quiche } from './data/quiche';
import { rasol } from './data/rasol';
import { ricePilaf } from './data/rice-pilaf';
import { ricePudding } from './data/rice-pudding';
import { risotto } from './data/risotto';
import { roastChicken } from './data/roast-chicken';
import { roastedVegetables } from './data/roasted-vegetables';
import { salamDeBiscuiti } from './data/salam-de-biscuiti';
import { salataDeArdeiCopti } from './data/salata-de-ardei-copti';
import { salataDeBoeuf } from './data/salata-de-boeuf';
import { salataDeIcre } from './data/salata-de-icre';
import { salataDeSfecla } from './data/salata-de-sfecla';
import { salataDeVinete } from './data/salata-de-vinete';
import { saramuraDePeste } from './data/saramura-de-peste';
import { sarmale } from './data/sarmale';
import { shakshuka } from './data/shakshuka';
import { smorrebrod } from './data/smorrebrod';
import { spaghettiAglioOlio } from './data/spaghetti-aglio-olio';
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
  paella,
  grilledCheese,
  bananaBread,
  salataDeArdeiCopti,
  gogosi,
  appleCrumble,
  brownies,
  cozonac,
  salamDeBiscuiti,
  cornulete,
  ciorbaDePui,
  ciorbaDeLegume,
  chiftele,
  cartofiTaranesti,
  spaghettiAglioOlio,
  ciorbaDeVacuta,
  ciorbaDeCartofi,
  fasoleBatuta,
  plachieDePeste,
  falafel,
  ciorbaDeVarza,
  ciorbaDeFasoleVerde,
  mancareDeCartofi,
  dovleceiPane,
  meatloaf,
  ciorbaDeBurta,
  ciorbaDeCiuperci,
  pastravLaGratar,
  salataDeSfecla,
  pulledPork,
  drobDeMiel,
  ciorbaDeMiel,
  ciorbaDeStevie,
  pasca,
  ouaUmplute,
  ciorbaArdeleneasca,
  ciorbaDePraz,
  muraturi,
  rasol,
  chec,
  ciorbaDeUrzici,
  ciorbaDeSalata,
];
