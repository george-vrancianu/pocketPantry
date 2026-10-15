// The Allergens each shared Ingredient contains, keyed by Ingredient slug, with
// Allergen slugs from ../allergens.ts. They sit apart from the per-Parent data
// files so the tagging reads as one list; catalog-seed-data.ts merges them in.
// Every shared Ingredient must have an entry (seed validation fails otherwise):
// an empty list is the deliberate claim "contains none" (ADR 0014). Tag by what
// the Ingredient is typically made of, so composite and prepared ones carry the
// Allergens of their usual recipe. "May contain traces" is never tagged.
// Allergen slugs inside a list are alphabetical.

export const SEED_INGREDIENT_ALLERGENS: Record<string, string[]> = {
  // produce/fruiting-vegetables
  tomato: [],
  'cherry-tomato': [],
  cucumber: [],
  'bell-pepper': [],
  'hot-pepper': [],
  zucchini: [],
  aubergine: [],
  pumpkin: [],
  'sweetcorn-cob': [],
  radish: [],

  // produce/root-vegetables
  carrot: [],
  beetroot: [],
  celeriac: ['celery'],
  parsnip: [],
  'parsley-root': [],
  turnip: [],
  ginger: [],

  // produce/alliums
  onion: [],
  'red-onion': [],
  'spring-onion': [],
  garlic: [],
  leek: [],
  shallot: [],

  // produce/leafy-greens
  lettuce: [],
  'iceberg-lettuce': [],
  spinach: [],
  rocket: [],
  'lambs-lettuce': [],
  'mixed-salad': [],
  'chinese-cabbage': [],
  kale: [],
  chard: [],
  sorrel: [],

  // produce/brassicas
  cabbage: [],
  'red-cabbage': [],
  cauliflower: [],
  broccoli: [],
  'brussels-sprouts': [],
  kohlrabi: [],

  // produce/stalks-and-pods
  'green-beans': [],
  'fresh-peas': [],
  asparagus: [],
  celery: ['celery'],
  fennel: [],
  okra: [],

  // produce/mushrooms
  'button-mushrooms': [],
  'oyster-mushrooms': [],
  shiitake: [],
  chanterelles: [],
  porcini: [],

  // produce/fruit
  apple: [],
  pear: [],
  plum: [],
  peach: [],
  nectarine: [],
  apricot: [],
  cherry: [],
  'sour-cherry': [],
  quince: [],

  // produce/citrus
  lemon: [],
  lime: [],
  orange: [],
  mandarin: [],
  grapefruit: [],

  // produce/tropical-fruit
  banana: [],
  avocado: [],
  pineapple: [],
  mango: [],
  kiwi: [],
  pomegranate: [],
  papaya: [],
  coconut: [],

  // produce/berries-and-grapes
  strawberry: [],
  raspberry: [],
  blueberry: [],
  blackberry: [],
  grapes: [],
  currants: [],

  // produce/melons
  watermelon: [],
  melon: [],

  // produce/potatoes-and-tubers
  potato: [],
  'sweet-potato': [],

  // herbs/fresh-herbs
  parsley: [],
  dill: [],
  coriander: [],
  basil: [],
  mint: [],
  chives: [],
  lovage: [],
  tarragon: [],
  'wild-garlic': [],

  // herbs/woody-herbs
  rosemary: [],
  thyme: [],
  sage: [],
  'fresh-oregano': [],

  // bakery/bread
  bread: ['gluten'],
  'rye-bread': ['gluten'],
  'wholemeal-bread': ['gluten'],
  baguette: ['gluten'],
  ciabatta: ['gluten'],
  sourdough: ['gluten'],
  'country-bread': ['gluten'],

  // bakery/sliced-bread
  'toast-bread': ['gluten'],
  'sliced-wholemeal-bread': ['gluten'],
  'sliced-rye-bread': ['gluten'],

  // bakery/rolls-and-buns
  'bread-rolls': ['gluten'],
  'kaiser-roll': ['gluten'],
  'burger-buns': ['gluten'],
  'hot-dog-buns': ['gluten'],
  bagel: ['gluten'],
  covrig: ['gluten', 'sesame'],

  // bakery/flatbreads-and-wraps
  'tortilla-wraps': ['gluten'],
  pita: ['gluten'],
  naan: ['gluten', 'milk'],
  lavash: ['gluten'],

  // bakery/pastries
  croissant: ['gluten', 'milk'],
  brioche: ['eggs', 'gluten', 'milk'],
  cozonac: ['eggs', 'gluten', 'milk', 'tree-nuts'],
  muffin: ['eggs', 'gluten', 'milk'],
  doughnut: ['eggs', 'gluten', 'milk'],

  // bakery/fresh-dough
  'pizza-dough': ['gluten'],
  'filo-pastry': ['gluten'],
  'puff-pastry-fresh': ['gluten', 'milk'],
  'shortcrust-pastry': ['gluten', 'milk'],

  // bakery/breadcrumbs-and-rusks
  breadcrumbs: ['gluten'],
  croutons: ['gluten'],
  rusks: ['gluten'],

  // bakery/filled-pastries
  placinta: ['eggs', 'gluten', 'milk'],
  'pizza-slice': ['gluten', 'milk'],
  'cream-cake': ['eggs', 'gluten', 'milk'],

  // meat/chicken-breast
  'chicken-breast': [],
  'chicken-schnitzel': ['eggs', 'gluten'],
  'smoked-chicken-breast': [],

  // meat/chicken-thighs-and-legs
  'chicken-thighs': [],
  'chicken-drumsticks': [],
  'chicken-leg-quarters': [],

  // meat/chicken-whole-and-wings
  'whole-chicken': [],
  'chicken-wings': [],
  'chicken-back': [],

  // meat/poultry
  'turkey-breast': [],
  'turkey-thighs': [],
  duck: [],
  'duck-breast': [],
  goose: [],

  // meat/minced-meat
  'minced-beef': [],
  'minced-pork': [],
  'minced-mixed-meat': [],
  'minced-chicken': [],
  'minced-turkey': [],
  'mici-mix': [],
  'fresh-sausages': ['gluten'],

  // meat/red-meat
  'beef-steak': [],
  'beef-for-stew': [],
  'beef-shank': [],
  'beef-ribs': [],
  'beef-soup-bones': [],
  veal: [],
  'beef-round': [],

  // meat/pork
  'pork-chops': [],
  'pork-neck': [],
  'pork-shoulder': [],
  'pork-ribs': [],
  'pork-belly': [],
  'pork-tenderloin': [],
  'pork-knuckle': [],
  'pork-fat': [],
  'pork-trotters': [],
  'pork-leg': [],

  // meat/lamb-and-game
  lamb: [],
  rabbit: [],
  venison: [],

  // meat/offal
  'chicken-liver': [],
  'beef-liver': [],
  'pork-liver': [],
  'chicken-hearts': [],

  // meat/cured-meat
  bacon: [],
  pancetta: [],
  ham: [],
  prosciutto: [],
  'smoked-pork': [],
  pastrami: [],

  // meat/sausages-and-cold-cuts
  salami: [],
  parizer: ['gluten', 'milk', 'soy'],
  frankfurters: ['gluten', 'milk', 'soy'],
  cabanos: [],
  'smoked-sausages': [],
  chorizo: [],
  'sausage-sibiu': [],

  // meat/chilled-meat-specialties
  'liver-pate': ['gluten', 'milk'],
  toba: [],
  caltabos: [],
  lebar: ['gluten'],

  // seafood/fish
  carp: ['fish'],
  trout: ['fish'],
  'sea-bass': ['fish'],
  'sea-bream': ['fish'],
  mackerel: ['fish'],
  herring: ['fish'],
  'whole-salmon': ['fish'],
  catfish: ['fish'],
  'pike-perch': ['fish'],
  pike: ['fish'],
  'crucian-carp': ['fish'],

  // seafood/fish-fillets
  salmon: ['fish'],
  cod: ['fish'],
  hake: ['fish'],
  pangasius: ['fish'],
  tilapia: ['fish'],
  'tuna-steak': ['fish'],
  'sea-bass-fillet': ['fish'],

  // seafood/smoked-fish
  'smoked-salmon': ['fish'],
  'smoked-mackerel': ['fish'],
  'salted-herring': ['fish'],
  'smoked-trout': ['fish'],
  'dried-fish': ['fish'],
  'salt-cured-carp': ['fish'],

  // seafood/shellfish
  shrimp: ['crustaceans'],
  mussels: ['molluscs'],
  squid: ['molluscs'],
  octopus: ['molluscs'],
  scallops: ['molluscs'],
  crab: ['crustaceans'],

  // seafood/fish-products
  surimi: ['eggs', 'fish', 'gluten'],
  'carp-roe': ['fish'],
  caviar: ['fish'],
  'fish-spread': ['fish'],

  // dairy/hard-cheese
  parmesan: ['milk'],
  'grana-padano': ['milk'],
  pecorino: ['milk'],
  manchego: ['milk'],

  // dairy/semi-hard-cheese
  cheddar: ['milk'],
  gouda: ['milk'],
  edam: ['milk'],
  emmental: ['milk'],
  gruyere: ['milk'],
  cascaval: ['milk'],
  maasdam: ['milk'],
  halloumi: ['milk'],
  'smoked-cheese': ['milk'],

  // dairy/soft-and-blue-cheese
  brie: ['milk'],
  camembert: ['milk'],
  gorgonzola: ['milk'],
  roquefort: ['milk'],

  // dairy/brined-cheese
  feta: ['milk'],
  telemea: ['milk'],
  'burduf-cheese': ['milk'],
  'sheep-cheese': ['milk'],

  // dairy/fresh-cheese
  mozzarella: ['milk'],
  'cottage-cheese': ['milk'],
  ricotta: ['milk'],
  urda: ['milk'],
  mascarpone: ['milk'],
  'cream-cheese': ['milk'],
  burrata: ['milk'],
  'fresh-curd': ['milk'],
  quark: ['milk'],
  'grated-mozzarella': ['milk'],

  // dairy/processed-cheese
  'processed-cheese-slices': ['milk'],
  'cheese-triangles': ['milk'],

  // dairy/milk-and-cream
  milk: ['milk'],
  'lactose-free-milk': ['milk'],
  'sour-cream': ['milk'],
  'whipping-cream': ['milk'],
  'cooking-cream': ['milk'],
  buttermilk: ['milk'],

  // dairy/plant-milks
  'oat-milk': ['gluten'],
  'almond-milk': ['tree-nuts'],
  'soy-milk': ['soy'],
  'coconut-milk': [],
  'rice-milk': [],

  // dairy/yogurt
  yogurt: ['milk'],
  'greek-yogurt': ['milk'],
  kefir: ['milk'],
  'drinking-yogurt': ['milk'],
  'fruit-yogurt': ['milk'],
  skyr: ['milk'],

  // dairy/butter
  butter: ['milk'],
  'clarified-butter': ['milk'],
  margarine: ['milk'],
  lard: [],

  // dairy/dairy-desserts
  'milk-pudding': ['milk'],
  'rice-pudding': ['milk'],
  'cream-dessert': ['eggs', 'milk'],

  // dairy/long-life-milk
  'condensed-milk': ['milk'],
  'milk-powder': ['milk'],
  'uht-milk': ['milk'],

  // eggs/hen-eggs
  eggs: ['eggs'],

  // eggs/quail-and-duck-eggs
  'quail-eggs': ['eggs'],
  'duck-eggs': ['eggs'],

  // eggs/prepared-eggs
  'boiled-eggs': ['eggs'],
  'egg-whites': ['eggs'],

  // frozen/frozen-vegetables
  'frozen-peas': [],
  'frozen-sweetcorn': [],
  'frozen-spinach': [],
  'frozen-green-beans': [],
  'frozen-broccoli': [],
  'frozen-cauliflower': [],
  'frozen-mixed-vegetables': [],
  'frozen-mushrooms': [],
  'frozen-okra': [],
  'frozen-peppers': [],
  edamame: ['soy'],

  // frozen/frozen-potatoes
  'french-fries': [],
  'potato-wedges': [],
  'hash-browns': [],

  // frozen/frozen-fruit
  'frozen-berries': [],
  'frozen-strawberries': [],
  'frozen-raspberries': [],
  'frozen-sour-cherries': [],
  'frozen-mango': [],

  // frozen/frozen-meat
  'chicken-nuggets': ['eggs', 'gluten'],
  'frozen-burger-patties': [],
  'frozen-mici': [],
  'frozen-meatballs': ['eggs', 'gluten'],
  'frozen-chicken-breast': [],
  'frozen-chicken-wings': [],
  'frozen-whole-chicken': [],

  // frozen/frozen-fish
  'fish-fingers': ['fish', 'gluten'],
  'frozen-fish-fillet': ['fish'],
  'frozen-shrimp': ['crustaceans'],
  'frozen-seafood-mix': ['crustaceans', 'molluscs'],
  'frozen-calamari-rings': ['molluscs'],

  // frozen/frozen-dough-and-meals
  'frozen-puff-pastry': ['gluten', 'milk'],
  'frozen-pizza': ['gluten', 'milk'],
  'frozen-dumplings': ['eggs', 'gluten'],
  'frozen-sarmale': [],
  'frozen-ready-meal': ['gluten', 'milk'],
  'frozen-pancakes': ['eggs', 'gluten', 'milk'],
  'frozen-dough': ['gluten'],
  falafel: [],

  // frozen/ice-cream
  'ice-cream': ['eggs', 'milk'],
  'ice-lollies': [],
  sorbet: [],

  // pasta/dried-pasta
  spaghetti: ['gluten'],
  penne: ['gluten'],
  fusilli: ['gluten'],
  farfalle: ['gluten'],
  macaroni: ['gluten'],
  rigatoni: ['gluten'],
  tagliatelle: ['eggs', 'gluten'],
  'lasagne-sheets': ['gluten'],
  orzo: ['gluten'],
  'pasta-shells': ['gluten'],

  // pasta/noodles-and-vermicelli
  vermicelli: ['gluten'],
  'egg-noodles': ['eggs', 'gluten'],
  'rice-noodles': [],
  'instant-noodles': ['gluten', 'soy'],
  'soba-noodles': ['gluten'],

  // pasta/fresh-pasta
  tortellini: ['eggs', 'gluten', 'milk'],
  gnocchi: ['eggs', 'gluten'],
  'fresh-tagliatelle': ['eggs', 'gluten'],
  galuste: ['eggs', 'gluten'],
  ravioli: ['eggs', 'gluten', 'milk'],

  // grains/rice-and-oats
  rice: [],
  'basmati-rice': [],
  'jasmine-rice': [],
  'arborio-rice': [],
  'brown-rice': [],
  'round-rice': [],
  oats: ['gluten'],

  // grains/breakfast-cereals
  muesli: ['gluten', 'tree-nuts'],
  cornflakes: ['gluten'],
  'chocolate-cereal': ['gluten', 'milk'],
  'wheat-flakes': ['gluten'],

  // grains/other-grains
  couscous: ['gluten'],
  bulgur: ['gluten'],
  quinoa: [],
  cornmeal: [],
  semolina: ['gluten'],
  'pearl-barley': ['gluten'],
  buckwheat: [],
  millet: [],
  'wheat-berries': ['gluten'],

  // grains/flour-and-sugar
  flour: ['gluten'],
  'wholemeal-flour': ['gluten'],
  'rye-flour': ['gluten'],
  'almond-flour': ['tree-nuts'],
  'potato-starch': [],
  sugar: [],
  'icing-sugar': [],
  'brown-sugar': [],
  'vanilla-sugar': [],
  sweetener: [],
  'corn-starch': [],

  // grains/baking-essentials
  'baking-powder': [],
  'baking-soda': [],
  'dry-yeast': [],
  'vanilla-extract': [],
  vanillin: [],
  'cocoa-powder': [],
  gelatin: [],
  'citric-acid': [],
  'food-colouring': [],
  'rum-essence': [],
  'pudding-mix': [],

  // grains/fresh-yeast
  'fresh-yeast': [],

  // legumes/dried-legumes
  lentils: [],
  'red-lentils': [],
  chickpeas: [],
  'kidney-beans': [],
  'white-beans': [],
  'black-beans': [],
  'split-peas': [],
  soybeans: ['soy'],
  'broad-beans': [],

  // legumes/tofu-and-tempeh
  tofu: ['soy'],
  tempeh: ['soy'],
  seitan: ['gluten'],
  'plant-based-mince': ['gluten', 'soy'],

  // canned-goods/canned-vegetables
  sweetcorn: [],
  'canned-peas': [],
  'canned-green-beans': [],
  'canned-mushrooms': [],
  'canned-carrots': [],
  'artichoke-hearts': [],
  'canned-beetroot': [],

  // canned-goods/tomato-products
  'canned-tomatoes': [],
  passata: [],
  'tomato-paste': [],
  'tomato-juice': [],
  'sun-dried-tomatoes': [],

  // canned-goods/canned-beans
  'canned-kidney-beans': [],
  'canned-white-beans': [],
  'canned-chickpeas': [],
  'baked-beans': [],
  'canned-lentils': [],

  // canned-goods/canned-fish
  'canned-tuna': ['fish'],
  'canned-sardines': ['fish'],
  'canned-mackerel': ['fish'],
  anchovies: ['fish'],
  'tuna-salad': ['eggs', 'fish'],

  // canned-goods/canned-meat
  'canned-pate': ['gluten', 'milk'],
  'luncheon-meat': ['gluten', 'milk', 'soy'],
  'canned-sausages': ['gluten', 'milk', 'soy'],
  'canned-chicken': [],

  // canned-goods/canned-fruit
  'canned-peaches': [],
  'canned-pineapple': [],
  'fruit-cocktail': [],
  'fruit-compote': [],
  'canned-mandarins': [],

  // canned-goods/pickles-and-preserves
  'pickled-cucumbers': [],
  sauerkraut: [],
  'pickled-peppers': [],
  olives: [],
  capers: [],
  zacusca: [],
  'roasted-peppers': [],
  'pickled-mixed-vegetables': [],
  'pickled-mushrooms': [],
  'horseradish-beetroot': [],
  'mango-chutney': [],
  dolmades: [],

  // condiments/table-sauces
  ketchup: [],
  mustard: ['mustard'],
  mayonnaise: ['eggs', 'mustard'],
  'hot-sauce': [],
  'bbq-sauce': ['mustard'],
  'tartar-sauce': ['eggs', 'mustard'],
  horseradish: [],
  'sweet-chili-sauce': [],

  // condiments/asian-sauces
  'soy-sauce': ['gluten', 'soy'],
  'worcestershire-sauce': ['fish', 'gluten'],
  'fish-sauce': ['fish'],
  'teriyaki-sauce': ['gluten', 'soy'],
  'oyster-sauce': ['gluten', 'molluscs', 'soy'],
  sriracha: [],
  'curry-paste': ['crustaceans', 'fish'],
  wasabi: [],
  tahini: ['sesame'],
  gochujang: ['gluten', 'soy'],
  nori: [],

  // condiments/pasta-sauces-and-pesto
  'tomato-pasta-sauce': [],
  'bolognese-sauce': ['celery'],
  pesto: ['milk', 'tree-nuts'],
  'carbonara-sauce': ['eggs', 'milk'],
  'pizza-sauce': [],

  // condiments/stock-and-seasoning-mixes
  'stock-cubes': ['celery', 'gluten'],
  'vegetable-seasoning': ['celery'],
  'chicken-stock': ['celery'],
  'beef-stock': ['celery'],
  'soup-mix': ['celery', 'gluten'],
  'ciorba-sour-base': ['gluten'],

  // condiments/dressings
  'salad-dressing': ['mustard'],
  'caesar-dressing': ['eggs', 'fish', 'milk', 'mustard'],
  'balsamic-glaze': ['sulphites'],
  'french-dressing': ['mustard'],

  // condiments/sweet-spreads
  jam: [],
  honey: [],
  'peanut-butter': ['peanuts'],
  'chocolate-spread': ['milk', 'soy', 'tree-nuts'],
  'maple-syrup': [],
  'marmalade-orange': [],
  'fruit-syrup': [],
  'agave-syrup': [],

  // condiments/chilled-sauces
  'garlic-sauce': ['eggs'],
  hummus: ['sesame'],
  tzatziki: ['milk'],
  'fresh-pesto': ['milk', 'tree-nuts'],

  // oils/cooking-oils
  'olive-oil': [],
  'sunflower-oil': [],
  'rapeseed-oil': [],
  'corn-oil': [],
  'coconut-oil': [],
  'cooking-spray': ['soy'],

  // oils/speciality-oils
  'sesame-oil': ['sesame'],
  'truffle-oil': [],

  // oils/vinegar
  vinegar: [],
  'wine-vinegar': ['sulphites'],
  'balsamic-vinegar': ['sulphites'],
  'apple-cider-vinegar': [],
  'rice-vinegar': [],

  // oils/cold-pressed-oils
  'pumpkin-seed-oil': [],
  'walnut-oil': ['tree-nuts'],
  'linseed-oil': [],

  // spices/ground-spices
  'black-pepper': [],
  'white-pepper': [],
  paprika: [],
  'smoked-paprika': [],
  cinnamon: [],
  cumin: [],
  turmeric: [],
  'ground-ginger': [],
  nutmeg: [],
  'ground-coriander': [],
  'chili-powder': [],
  'garlic-powder': [],
  'onion-powder': [],
  allspice: [],
  cardamom: [],
  saffron: [],
  sumac: [],
  'mustard-powder': ['mustard'],

  // spices/whole-spices
  peppercorns: [],
  'bay-leaves': [],
  cloves: [],
  'star-anise': [],
  'cinnamon-sticks': [],
  'cumin-seeds': [],
  'coriander-seeds': [],
  'mustard-seeds': ['mustard'],
  'juniper-berries': [],
  'vanilla-pods': [],
  'fennel-seeds': [],

  // spices/dried-herbs
  oregano: [],
  'dried-thyme': [],
  'dried-basil': [],
  'dried-parsley': [],
  'dried-dill': [],
  'dried-rosemary': [],
  marjoram: [],
  savory: [],
  'dried-lovage': [],
  'italian-herbs': [],
  'dried-tarragon': [],

  // spices/spice-blends
  'curry-powder': ['mustard'],
  'za-atar': ['sesame'],
  'gyros-seasoning': ['celery'],
  'chicken-seasoning': ['celery'],
  'grill-seasoning': ['celery'],
  'pork-seasoning': ['celery'],
  'taco-seasoning': [],
  'pizza-seasoning': [],
  'sarmale-seasoning': [],
  'five-spice': [],
  'garam-masala': [],
  'lemon-pepper': [],

  // spices/salt
  salt: [],
  'coarse-salt': [],
  'himalayan-salt': [],
  'flaky-salt': [],

  // snacks/sweet-snacks
  chocolate: ['milk', 'soy'],
  'dark-chocolate': ['soy'],
  'white-chocolate': ['milk', 'soy'],
  'chocolate-bar': ['milk', 'soy'],
  candy: [],
  'gummy-sweets': [],
  marshmallows: [],
  halva: ['sesame'],
  'turkish-delight': [],
  'chocolate-sprinkles': ['milk', 'soy'],

  // snacks/biscuits-and-wafers
  biscuits: ['gluten', 'milk'],
  'cream-biscuits': ['gluten', 'milk', 'soy'],
  'digestive-biscuits': ['gluten', 'milk'],
  wafers: ['gluten', 'milk', 'soy'],
  ladyfingers: ['eggs', 'gluten'],
  'gingerbread-snack': ['eggs', 'gluten'],

  // snacks/salty-snacks
  'potato-chips': [],
  popcorn: [],
  'tortilla-chips': [],
  pretzels: ['gluten'],
  'cheese-puffs': ['milk'],
  'salted-peanuts': ['peanuts'],

  // snacks/crackers-and-crispbread
  crackers: ['gluten'],
  crispbread: ['gluten'],
  'rice-cakes': [],
  breadsticks: ['gluten'],
  'dried-bread-chips': ['gluten'],
  'rice-crackers': ['gluten', 'soy'],

  // snacks/nuts-and-seeds
  peanuts: ['peanuts'],
  almonds: ['tree-nuts'],
  walnuts: ['tree-nuts'],
  hazelnuts: ['tree-nuts'],
  cashews: ['tree-nuts'],
  pistachios: ['tree-nuts'],
  'pumpkin-seeds': [],
  'sunflower-seeds': [],
  'sesame-seeds': ['sesame'],
  'chia-seeds': [],
  'flax-seeds': [],
  'pine-nuts': ['tree-nuts'],
  'desiccated-coconut': [],
  'mixed-nuts': ['peanuts', 'tree-nuts'],

  // snacks/dried-fruit
  raisins: [],
  'dried-apricots': ['sulphites'],
  prunes: [],
  dates: [],
  'dried-figs': [],
  'dried-cranberries': [],
  'dried-apple': ['sulphites'],
  'goji-berries': [],

  // snacks/snack-bars
  'cereal-bar': ['gluten'],
  'protein-bar': ['milk', 'soy'],
  'fruit-bar': [],

  // snacks/packaged-cakes
  'cake-snack': ['eggs', 'gluten', 'milk'],

  // beverage/juices
  'orange-juice': [],
  'apple-juice': [],
  'multifruit-juice': [],
  nectar: [],
  'grape-juice': [],
  'lemon-juice': [],
  'coconut-water': [],

  // beverage/soft-drinks
  cola: [],
  lemonade: [],
  'orange-soda': [],
  'iced-tea': [],
  'energy-drink': [],
  'tonic-water': [],
  kvass: ['gluten'],
  'ginger-beer': [],

  // beverage/water
  'still-water': [],
  'sparkling-water': [],
  'flavoured-water': [],

  // beverage/coffee-and-tea
  coffee: [],
  'coffee-beans': [],
  'instant-coffee': [],
  'coffee-capsules': [],
  'coffee-3in1': ['milk'],
  tea: [],
  'green-tea': [],
  'herbal-tea': [],
  'chamomile-tea': [],
  'mint-tea': [],
  'rosehip-tea': [],

  // beverage/hot-drink-mixes
  'hot-chocolate': ['milk'],
  'cocoa-drink-mix': ['milk'],
  'instant-cappuccino': ['milk'],
  'malted-drink': ['gluten', 'milk'],
  'chicory-drink': [],

  // beverage/beer-and-cider
  beer: ['gluten'],
  'dark-beer': ['gluten'],
  'non-alcoholic-beer': ['gluten'],
  radler: ['gluten'],
  cider: ['sulphites'],

  // beverage/wine
  'red-wine': ['sulphites'],
  'white-wine': ['sulphites'],
  'rose-wine': ['sulphites'],
  'sparkling-wine': ['sulphites'],
  'cooking-wine': ['sulphites'],
  'mulled-wine-base': ['sulphites'],

  // beverage/spirits
  vodka: [],
  rum: [],
  whisky: [],
  brandy: [],
  tuica: [],
  gin: [],
  liqueur: [],
  vermouth: ['sulphites'],

  // beverage/chilled-drinks
  smoothie: [],
  'fresh-orange-juice': [],
};
