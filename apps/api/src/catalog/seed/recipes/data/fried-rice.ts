import { t, type BaseRecipeSeed, type StepSeed } from '../recipe-seed-types';

// The Fried rice base is Chinese-style egg fried rice (no Cuisine). Each Variant
// is a full Recipe with its own lines, steps and guidance. The rice is cooked
// and chilled as part of each Recipe, because fried rice needs cold, dry rice.

/** Shared by all three Recipes: cool the cooked rice fast. */
const coolRice: StepSeed = {
  key: 'cool',
  text: t(
    'Spread the rice in a thin layer on a tray or large plate, fluff it with a fork and leave it for 30 minutes, until it has stopped steaming.',
    'Întinde orezul într-un strat subțire pe o tavă sau o farfurie mare, afânează-l cu o furculiță și lasă-l 30 de minute, până nu mai scoate aburi.',
  ),
  timerSeconds: 1800,
};

/** Shared by all three Recipes: chill the rice, with the food-safety reason. */
const chillRice: StepSeed = {
  key: 'chill',
  text: t(
    'Cover the rice and refrigerate it within 1 hour of cooking, for at least 4 hours or overnight. Cooked rice left warm can grow Bacillus cereus, whose toxin survives frying, so never leave it out for hours, and use the chilled rice within 24 hours.',
    'Acoperă orezul și pune-l la frigider în cel mult o oră de la gătire, cel puțin 4 ore sau peste noapte. Orezul fiert lăsat la căldură poate dezvolta Bacillus cereus, a cărui toxină rezistă la prăjire, așa că nu-l lăsa ore în șir pe masă și folosește-l în 24 de ore.',
  ),
  timerSeconds: 14400,
};

export const friedRice: BaseRecipeSeed = {
  slug: 'fried-rice',
  title: t('Egg fried rice', 'Orez prăjit cu ou'),
  servings: 2,
  prepMinutes: 280,
  cookMinutes: 36,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'rice',
      quantity: 150,
      unit: 'g',
      note: t(
        'long grain, cooked ahead; about 430 g cooked',
        'cu bobul lung, fiert dinainte; aproximativ 430 g după fierbere',
      ),
    },
    {
      ingredient: 'still-water',
      key: 'rice-water',
      quantity: 0.3,
      unit: 'l',
      note: t('for cooking the rice', 'pentru fiertul orezului'),
    },
    { ingredient: 'eggs', quantity: 3, unit: 'pcs' },
    { ingredient: 'frozen-peas', quantity: 80, unit: 'g' },
    {
      ingredient: 'carrot',
      quantity: 80,
      unit: 'g',
      note: t('cut in 5 mm dice', 'tăiat cubulețe de 5 mm'),
    },
    {
      ingredient: 'spring-onion',
      quantity: 40,
      unit: 'g',
      note: t(
        'sliced, whites and greens kept apart',
        'tăiată felii, părțile albe separate de cele verzi',
      ),
    },
    {
      ingredient: 'garlic',
      quantity: 6,
      unit: 'g',
      note: t('2 cloves, minced', '2 căței, tocați mărunt'),
    },
    {
      ingredient: 'soy-sauce',
      quantity: 20,
      unit: 'ml',
      note: t('light soy sauce', 'sos de soia deschis la culoare'),
    },
    { ingredient: 'sesame-oil', quantity: 5, unit: 'ml' },
    { ingredient: 'white-pepper', quantity: 0.5, unit: 'g' },
    { ingredient: 'sunflower-oil', quantity: 30, unit: 'ml' },
    { ingredient: 'salt', quantity: 2, unit: 'g' },
  ],
  steps: [
    {
      key: 'rice',
      text: t(
        'At least 4 hours ahead, ideally the day before: rinse the rice in a sieve until the water runs nearly clear. Put it in a pot with the 300 ml of water and 1 g of the salt, bring to a boil over high heat (about 4 minutes), then cover and cook on the lowest heat for 12 minutes.',
        'Cu cel puțin 4 ore înainte, ideal în ajun: clătește orezul într-o strecurătoare până când apa se limpezește aproape complet. Pune-l într-o oală cu cei 300 ml de apă și 1 g din sare, adu la fierbere la foc mare (aproximativ 4 minute), apoi acoperă și gătește la foc foarte mic 12 minute.',
      ),
      timerSeconds: 720,
    },
    {
      key: 'rest',
      text: t(
        'Take the pot off the heat and leave it covered for 10 minutes, so the grains finish steaming and firm up.',
        'Ia oala de pe foc și las-o acoperită 10 minute, ca boabele să termine de aburit și să se întărească.',
      ),
      timerSeconds: 600,
    },
    coolRice,
    chillRice,
    {
      key: 'prep',
      text: t(
        'Dice the carrot into 5 mm pieces, slice the spring onions (whites and greens in separate piles) and mince the garlic. Beat the eggs with a pinch of the remaining salt. Rub the cold rice between wet fingers to break up any clumps.',
        'Taie morcovul cubulețe de 5 mm, taie ceapa verde felii (părțile albe și cele verzi în grămezi separate) și toacă mărunt usturoiul. Bate ouăle cu un praf din sarea rămasă. Desfă orezul rece cu degetele umede, ca să spargi cocoloașele.',
      ),
    },
    {
      key: 'heat',
      text: t(
        'Heat a wok or a large frying pan over high heat for 1 minute, until it is very hot and a drop of water vanishes at once.',
        'Încinge un wok sau o tigaie mare la foc iute 1 minut, până se înfierbântă bine și o picătură de apă dispare imediat.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'eggs',
      text: t(
        'Add 15 ml of the oil, pour in the eggs and stir for about 30 seconds into large, soft curds that are just set. Tip them onto a plate; they finish cooking in the rice.',
        'Adaugă 15 ml din ulei, toarnă ouăle și amestecă aproximativ 30 de secunde, până se formează bucăți mari și moi, abia închegate. Pune-le pe o farfurie; își termină gătirea în orez.',
      ),
      timerSeconds: 30,
    },
    {
      key: 'carrot',
      text: t(
        'Add the remaining oil and the carrot and the spring onion whites. Stir-fry for 2 minutes, until the carrot is just tender.',
        'Adaugă uleiul rămas, morcovul și părțile albe de ceapă verde. Prăjește amestecând 2 minute, până când morcovul se înmoaie ușor.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'garlic-peas',
      text: t(
        'Add the garlic and the frozen peas straight from the freezer and stir-fry for 1 minute, until the garlic smells sweet and the peas are hot.',
        'Adaugă usturoiul și mazărea direct din congelator și prăjește amestecând 1 minut, până când usturoiul miroase dulce, iar mazărea e fierbinte.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'rice-fry',
      text: t(
        'Add the cold rice, spreading it over the pan. Press and toss it for about 4 minutes, until every grain is steaming hot in the middle and a few grains turn lightly golden.',
        'Adaugă orezul rece, întinzându-l în tigaie. Apasă-l și amestecă-l aproximativ 4 minute, până când fiecare bob e fierbinte în mijloc și câteva boabe se rumenesc ușor.',
      ),
      timerSeconds: 240,
    },
    {
      key: 'season',
      text: t(
        'Return the eggs, breaking them into pieces, and pour the soy sauce round the edge of the pan. Add the white pepper and toss for 1 minute, until no wet egg is left. Take it off the heat, stir in the sesame oil and the spring onion greens, and taste for salt. Serve straight away.',
        'Pune ouăle înapoi, rupându-le în bucăți, și toarnă sosul de soia pe marginea tigăii. Adaugă piperul alb și amestecă 1 minut, până când nu mai rămâne ou lichid. Ia tigaia de pe foc, amestecă uleiul de susan și părțile verzi de ceapă verde și gustă de sare. Servește imediat.',
      ),
      timerSeconds: 60,
    },
  ],
  tips: [
    t(
      'Cold, dry, day-old rice is the whole trick: freshly cooked rice is wet and steams into a paste in the pan.',
      'Orezul rece, uscat, fiert în ajun face toată diferența: orezul proaspăt e umed și se face pastă în tigaie.',
    ),
    t(
      'If your pan is smaller than a 30 cm wok, fry the rice in two batches; a crowded pan steams the rice instead of frying it.',
      'Dacă tigaia ta e mai mică decât un wok de 30 cm, prăjește orezul în două tranșe; într-o tigaie aglomerată orezul se aburește, nu se prăjește.',
    ),
    t(
      "Don't reheat fried rice again: cook only what you'll eat and throw away leftovers.",
      'Nu reîncălzi orezul prăjit: gătește doar cât vei mânca și aruncă ce rămâne.',
    ),
    t(
      'Have cooked rice left over from yesterday, about the cooked weight in the rice line? Skip the first four steps and use it straight from the fridge, within 24 hours of cooking.',
      'Ai orez fiert rămas de ieri, cam cât arată greutatea după fierbere din linia de orez? Sari peste primii patru pași și folosește-l direct din frigider, în 24 de ore de la gătire.',
    ),
  ],
  stepTips: [
    {
      step: 'cool',
      text: t(
        'A thin layer on a tray cools much faster than a bowlful, and the surface dries, which keeps the grains separate in the pan.',
        'Un strat subțire pe tavă se răcește mult mai repede decât un bol plin, iar suprafața se zvântă, ceea ce ține boabele separate în tigaie.',
      ),
    },
    {
      step: 'eggs',
      text: t(
        'Take the eggs out while they still look a little glossy: cooked through here, they turn dry and rubbery by the time the rice is done.',
        'Scoate ouăle cât mai au un luciu ușor: dacă se gătesc complet aici, ajung uscate și cauciucate până e gata orezul.',
      ),
    },
  ],
  nutritionNote: t(
    'Rice gives the energy, and the eggs add protein, with peas and carrot adding some fibre. The soy sauce and salt make it quite salty and the oil adds fat, so measure the soy sauce and add more vegetables to make it a fuller meal.',
    'Orezul dă energia, ouăle aduc proteine, iar mazărea și morcovul adaugă ceva fibre. Sosul de soia și sarea îl fac destul de sărat, iar uleiul adaugă grăsime, așa că măsoară sosul de soia și pune mai multe legume pentru o masă mai completă.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Tomato and egg stir-fry', 'Ouă cu roșii sotate'),
      reason: t(
        'In a Chinese-style meal the rice sits beside a stir-fried dish, and the saucy tomato juices soak into the grains.',
        'La o masă în stil chinezesc, orezul se servește lângă un preparat sotat, iar sosul zemos de roșii se îmbibă în boabe.',
      ),
      principle: 'regional_tradition',
      recipe: 'stir-fry-chinese',
    },
    {
      kind: 'food',
      label: t('Cucumber with rice vinegar', 'Castraveți cu oțet de orez'),
      reason: t(
        'Cold, tangy crunch against the hot, oily rice.',
        'Un crocant rece și acrișor, în contrast cu orezul fierbinte și uleios.',
      ),
      principle: 'contrast_texture',
      ingredient: 'cucumber',
    },
    {
      kind: 'food',
      label: t('Sriracha', 'Sriracha'),
      reason: t(
        'A little garlicky heat wakes up the mild egg and rice.',
        'Un pic de iuțeală cu usturoi trezește gustul blând al oului și al orezului.',
      ),
      principle: 'complement_flavour',
      ingredient: 'sriracha',
    },
    {
      kind: 'drink',
      label: t('Green tea', 'Ceai verde'),
      reason: t(
        'Light and slightly bitter, it cleans the palate between oily, salty bites.',
        'Ușor și puțin amărui, curăță gura între îmbucăturile uleioase și sărate.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'green-tea',
    },
  ],
  eatingMoments: [
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'Ready in about 20 minutes once the rice is chilled, with vegetables and egg in one pan.',
        'Gata în aproximativ 20 de minute după ce orezul s-a răcit, cu legume și ou într-o singură tigaie.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Rice replaces carbohydrates and the egg adds protein.',
        'Orezul reface carbohidrații, iar oul adaugă proteine.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Oily and salty, it sits heavy and can leave you thirsty before bed.',
        'Fiind uleios și sărat, cade greu și te poate lăsa însetat înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'fried-rice-thai',
      cuisine: 'thai',
      title: t(
        'Thai chicken fried rice (khao pad gai)',
        'Orez prăjit thailandez cu pui (khao pad gai)',
      ),
      servings: 2,
      prepMinutes: 285,
      cookMinutes: 35,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'jasmine-rice',
          quantity: 150,
          unit: 'g',
          note: t(
            'cooked ahead; about 370 g cooked',
            'fiert dinainte; aproximativ 370 g după fierbere',
          ),
        },
        {
          ingredient: 'still-water',
          key: 'rice-water',
          quantity: 0.24,
          unit: 'l',
          note: t('for cooking the rice', 'pentru fiertul orezului'),
        },
        {
          ingredient: 'chicken-thighs',
          quantity: 200,
          unit: 'g',
          note: t(
            'boneless, sliced 5 mm thick',
            'dezosate, tăiate felii de 5 mm',
          ),
        },
        { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('small, sliced', 'mică, tăiată felii'),
        },
        {
          ingredient: 'garlic',
          quantity: 8,
          unit: 'g',
          note: t('3 cloves, minced', '3 căței, tocați mărunt'),
        },
        {
          ingredient: 'tomato',
          quantity: 120,
          unit: 'g',
          note: t('1 medium, in 8 wedges', '1 medie, tăiată în 8 bucăți'),
        },
        {
          ingredient: 'spring-onion',
          quantity: 30,
          unit: 'g',
          note: t('sliced', 'tăiată felii'),
        },
        {
          ingredient: 'fish-sauce',
          quantity: 15,
          unit: 'ml',
          note: t('for the rice', 'pentru orez'),
        },
        { ingredient: 'soy-sauce', quantity: 10, unit: 'ml' },
        { ingredient: 'sugar', quantity: 5, unit: 'g' },
        { ingredient: 'sunflower-oil', quantity: 45, unit: 'ml' },
        {
          ingredient: 'cucumber',
          quantity: 0.5,
          unit: 'pcs',
          note: t('sliced, to serve', 'tăiat felii, pentru servit'),
        },
        {
          ingredient: 'lime',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'cut in wedges, to serve',
            'tăiată în sferturi, pentru servit',
          ),
        },
        {
          ingredient: 'birds-eye-chilli',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'thinly sliced, for the prik nam pla',
            'tăiate rondele subțiri, pentru prik nam pla',
          ),
        },
        {
          ingredient: 'fish-sauce',
          key: 'prik-nam-pla',
          quantity: 15,
          unit: 'ml',
          note: t('for the prik nam pla', 'pentru prik nam pla'),
        },
      ],
      steps: [
        {
          key: 'rice',
          text: t(
            'At least 4 hours ahead, ideally the day before: rinse the rice in a sieve until the water runs nearly clear. Put it in a pot with the 240 ml of water, bring to a boil over high heat (about 4 minutes), then cover and cook on the lowest heat for 10 minutes.',
            'Cu cel puțin 4 ore înainte, ideal în ajun: clătește orezul într-o strecurătoare până când apa se limpezește aproape complet. Pune-l într-o oală cu cei 240 ml de apă, adu la fierbere la foc mare (aproximativ 4 minute), apoi acoperă și gătește la foc foarte mic 10 minute.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'rest',
          text: t(
            'Take the pot off the heat and leave it covered for 10 minutes.',
            'Ia oala de pe foc și las-o acoperită 10 minute.',
          ),
          timerSeconds: 600,
        },
        coolRice,
        chillRice,
        {
          key: 'prep',
          text: t(
            'Slice the chicken thinly, the onion and the cucumber, cut the tomato into wedges, mince the garlic and slice the spring onion. Mix the 15 ml of fish sauce for the rice with the soy sauce and sugar. In a small bowl, put the sliced chillies in the 15 ml of fish sauce for the prik nam pla. Rub the cold rice between wet fingers to break up any clumps.',
            'Taie subțire puiul, ceapa și castravetele, taie roșia în 8 bucăți, toacă mărunt usturoiul și taie ceapa verde. Amestecă cei 15 ml de sos de pește pentru orez cu sosul de soia și zahărul. Într-un bol mic, pune rondelele de ardei iute în cei 15 ml de sos de pește pentru prik nam pla. Desfă orezul rece cu degetele umede, ca să spargi cocoloașele.',
          ),
        },
        {
          key: 'heat',
          text: t(
            'Heat a wok or a large frying pan over high heat for 1 minute, until very hot. Add 30 ml of the oil.',
            'Încinge un wok sau o tigaie mare la foc iute 1 minut, până se înfierbântă bine. Adaugă 30 ml din ulei.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'chicken',
          text: t(
            'Add the chicken in a single layer and stir-fry for 3 minutes, until it is white on the outside and a cut piece shows no pink in the middle.',
            'Adaugă puiul într-un singur strat și prăjește amestecând 3 minute, până devine alb la exterior, iar o bucată tăiată nu mai arată roz în mijloc.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'aromatics',
          text: t(
            'Add the onion and the garlic and stir-fry for 1 minute, until the onion starts to soften.',
            'Adaugă ceapa și usturoiul și prăjește amestecând 1 minut, până când ceapa începe să se înmoaie.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'eggs',
          text: t(
            'Push everything to one side, add the remaining 15 ml of oil to the empty side and crack in the eggs. Scramble them for 30 seconds until fully set with no runny egg left, then mix them into the chicken.',
            'Împinge totul într-o parte, adaugă cei 15 ml de ulei rămași în partea liberă și sparge ouăle. Amestecă-le 30 de secunde, până se închegă complet și nu mai rămâne ou lichid, apoi amestecă-le cu puiul.',
          ),
          timerSeconds: 30,
        },
        {
          key: 'rice-fry',
          text: t(
            'Add the cold rice and the tomato wedges. Press and toss for about 4 minutes, until every grain is steaming hot in the middle.',
            'Adaugă orezul rece și roșiile. Apasă și amestecă aproximativ 4 minute, până când fiecare bob e fierbinte în mijloc.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'season',
          text: t(
            'Pour the fish sauce, soy sauce and sugar mixture round the edge of the pan and toss for 1 minute, until the rice is evenly coloured. Stir in the spring onion and take the pan off the heat.',
            'Toarnă amestecul de sos de pește, sos de soia și zahăr pe marginea tigăii și amestecă 1 minut, până când orezul capătă o culoare uniformă. Adaugă ceapa verde și ia tigaia de pe foc.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'serve',
          text: t(
            'Serve the rice with the cucumber slices, the lime wedges and the prik nam pla on the side, so everyone adds lime, heat and salt to taste.',
            'Servește orezul cu felii de castravete, felii de lime și prik nam pla alături, ca fiecare să adauge lime, iuțeală și sare după gust.',
          ),
        },
      ],
      tips: [
        t(
          'Thai fried rice is seasoned lightly, with the lime, cucumber and prik nam pla on the table so each person adjusts it; add the prik nam pla by the spoonful, as it is very salty and hot.',
          'Orezul prăjit thailandez se condimentează ușor, cu lime, castravete și prik nam pla pe masă, ca fiecare să-l ajusteze; pune prik nam pla cu lingurița, fiind foarte sărat și iute.',
        ),
      ],
      stepTips: [
        {
          step: 'chicken',
          text: t(
            'Thigh meat stays juicy in a hot pan; breast dries out in the 3 minutes it takes to cook through.',
            'Carnea de pulpă rămâne suculentă într-o tigaie fierbinte; pieptul se usucă în cele 3 minute cât durează gătirea.',
          ),
        },
      ],
      nutritionNote: t(
        'Chicken thigh and egg make it high in protein, and the tomato and cucumber add freshness and some fibre. The fish sauce, soy sauce and prik nam pla are very salty and the thigh and oil add fat, so go lightly on the sauces at the table.',
        'Pulpa de pui și oul îl fac bogat în proteine, iar roșia și castravetele adaugă prospețime și ceva fibre. Sosul de pește, sosul de soia și prik nam pla sunt foarte sărate, iar pulpa și uleiul adaugă grăsime, așa că pune sosurile cu măsură la masă.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Thai chicken soup', 'Supă thailandeză de pui'),
          reason: t(
            'A Thai meal shares a sour, fragrant soup with the rice dish, which freshens the palate between salty bites.',
            'La o masă thailandeză se servește împreună cu orezul o supă acrișoară și aromată, care împrospătează gura între îmbucăturile sărate.',
          ),
          principle: 'regional_tradition',
          recipe: 'chicken-soup-thai',
        },
        {
          kind: 'food',
          label: t('Fresh coriander', 'Coriandru proaspăt'),
          reason: t(
            'A fresh, citrusy herb note that lifts the fish sauce and chicken.',
            'O notă proaspătă de plantă cu iz de citrice, care ridică gustul sosului de pește și al puiului.',
          ),
          principle: 'complement_flavour',
          ingredient: 'coriander',
        },
        {
          kind: 'drink',
          label: t('Cold lager', 'Bere blondă rece'),
          reason: t(
            'Its crisp fizz refreshes the palate after the salty, spicy rice.',
            'Bulele ei răcoresc gustul după orezul sărat și picant.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'A balanced plate of rice, chicken and fresh vegetables, ready in minutes once the rice is chilled.',
            'O farfurie echilibrată cu orez, pui și legume proaspete, gata în câteva minute după ce orezul s-a răcit.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Chicken and egg give protein, and the rice replaces carbohydrates.',
            'Puiul și oul dau proteine, iar orezul reface carbohidrații.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Salty and oily, it sits heavy and can leave you thirsty before bed.',
            'Fiind sărat și uleios, cade greu și te poate lăsa însetat înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'fried-rice-korean',
      cuisine: 'korean',
      title: t(
        'Kimchi fried rice (kimchi-bokkeumbap)',
        'Orez prăjit cu kimchi (kimchi-bokkeumbap)',
      ),
      servings: 2,
      prepMinutes: 285,
      cookMinutes: 42,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'sushi-rice',
          quantity: 150,
          unit: 'g',
          note: t(
            'cooked ahead; about 340 g cooked',
            'fiert dinainte; aproximativ 340 g după fierbere',
          ),
        },
        {
          ingredient: 'still-water',
          key: 'rice-water',
          quantity: 0.21,
          unit: 'l',
          note: t('for cooking the rice', 'pentru fiertul orezului'),
        },
        {
          ingredient: 'kimchi',
          quantity: 200,
          unit: 'g',
          note: t(
            'well fermented and sour, chopped, plus 3 tbsp of its juice',
            'bine fermentat și acru, tocat, plus 3 linguri din zeama lui',
          ),
        },
        {
          ingredient: 'luncheon-meat',
          quantity: 100,
          unit: 'g',
          note: t('diced 1 cm', 'tăiată cubulețe de 1 cm'),
        },
        { ingredient: 'gochujang', quantity: 15, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 0.5,
          unit: 'pcs',
          note: t('finely diced', 'tăiată mărunt'),
        },
        {
          ingredient: 'spring-onion',
          quantity: 30,
          unit: 'g',
          note: t(
            'sliced, whites and greens kept apart',
            'tăiată felii, părțile albe separate de cele verzi',
          ),
        },
        { ingredient: 'soy-sauce', quantity: 10, unit: 'ml' },
        { ingredient: 'sunflower-oil', quantity: 25, unit: 'ml' },
        { ingredient: 'sesame-oil', quantity: 10, unit: 'ml' },
        { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
        { ingredient: 'sesame-seeds', quantity: 5, unit: 'g' },
      ],
      steps: [
        {
          key: 'rice',
          text: t(
            'At least 4 hours ahead, ideally the day before: rinse the rice in a sieve until the water runs nearly clear. Put it in a pot with the 210 ml of water, bring to a boil over high heat (about 4 minutes), then cover and cook on the lowest heat for 12 minutes.',
            'Cu cel puțin 4 ore înainte, ideal în ajun: clătește orezul într-o strecurătoare până când apa se limpezește aproape complet. Pune-l într-o oală cu cei 210 ml de apă, adu la fierbere la foc mare (aproximativ 4 minute), apoi acoperă și gătește la foc foarte mic 12 minute.',
          ),
          timerSeconds: 720,
        },
        {
          key: 'rest',
          text: t(
            'Take the pot off the heat and leave it covered for 10 minutes.',
            'Ia oala de pe foc și las-o acoperită 10 minute.',
          ),
          timerSeconds: 600,
        },
        coolRice,
        chillRice,
        {
          key: 'prep',
          text: t(
            'Chop the kimchi into 1 cm pieces and keep 3 tablespoons of its juice. Dice the luncheon meat and the onion, and slice the spring onions, keeping the whites and greens apart. Rub the cold rice between wet fingers to break up any clumps.',
            'Taie kimchi în bucăți de 1 cm și păstrează 3 linguri din zeama lui. Taie cubulețe carnea la conservă și ceapa și feliază ceapa verde, ținând părțile albe separat de cele verzi. Desfă orezul rece cu degetele umede, ca să spargi cocoloașele.',
          ),
        },
        {
          key: 'meat',
          text: t(
            'Heat a large frying pan or wok over medium-high heat until hot. Add 10 ml of the oil and the luncheon meat and fry for 3 minutes, until browned at the edges.',
            'Încinge o tigaie mare sau un wok la foc mediu-mare, până se încinge. Adaugă 10 ml din ulei și carnea la conservă și prăjește 3 minute, până se rumenește pe margini.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'onion',
          text: t(
            'Add the onion and the spring onion whites and fry for 2 minutes, until the onion turns translucent.',
            'Adaugă ceapa și părțile albe de ceapă verde și prăjește 2 minute, până când ceapa devine translucidă.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'kimchi',
          text: t(
            'Add the kimchi with its juice, the gochujang and the soy sauce. Fry for 3 minutes, until most of the liquid has cooked away and the kimchi is soft with a few browned edges.',
            'Adaugă kimchi cu zeama lui, gochujang și sosul de soia. Prăjește 3 minute, până când cea mai mare parte din lichid s-a evaporat, iar kimchi e moale, cu marginile ușor rumenite.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'rice-fry',
          text: t(
            'Add the cold rice. Press and toss it for about 4 minutes, until every grain is red-tinted, steaming hot in the middle and no wet patches remain.',
            'Adaugă orezul rece. Apasă-l și amestecă-l aproximativ 4 minute, până când fiecare bob capătă o nuanță roșiatică, e fierbinte în mijloc și nu mai rămân zone ude.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'finish',
          text: t(
            'Take the pan off the heat and stir in the sesame oil and the spring onion greens. Divide the rice between two bowls and keep it warm.',
            'Ia tigaia de pe foc și amestecă uleiul de susan și părțile verzi de ceapă verde. Împarte orezul în două boluri și ține-l la cald.',
          ),
        },
        {
          key: 'eggs',
          text: t(
            'Heat the remaining 15 ml of oil in a small non-stick pan over medium heat and fry the eggs for 3 minutes, until the whites are fully set. The yolks stay runny; cook them through if you serve children, older people or anyone pregnant: cover the pan and keep frying until the yolk is firm. Slide one egg onto each bowl.',
            'Încinge cei 15 ml de ulei rămași într-o tigaie mică antiaderentă la foc mediu și prăjește ouăle 3 minute, până când albușurile se încheagă complet. Gălbenușurile rămân curgătoare; fă-le complet dacă servești copii, vârstnici sau femei însărcinate: acoperă tigaia și continuă să prăjești până când gălbenușul se întărește. Pune câte un ou peste fiecare bol.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'serve',
          text: t(
            'Sprinkle the sesame seeds over the eggs and serve straight away.',
            'Presară semințele de susan peste ouă și servește imediat.',
          ),
        },
      ],
      tips: [
        t(
          'Sour, well-fermented kimchi gives the best flavour; very fresh kimchi tastes flat, so add a splash more juice and a little extra gochujang.',
          'Kimchi acru, bine fermentat, dă cel mai bun gust; kimchi foarte proaspăt e searbăd, așa că adaugă puțin mai multă zeamă și puțin mai mult gochujang.',
        ),
      ],
      stepTips: [
        {
          step: 'kimchi',
          text: t(
            'Fry the kimchi until its liquid has gone before the rice goes in: wet kimchi turns the rice soggy.',
            'Prăjește kimchi până se evaporă lichidul, înainte să pui orezul: un kimchi ud face orezul păstos.',
          ),
        },
      ],
      nutritionNote: t(
        'Kimchi adds fibre and flavour for few calories, and the egg adds protein. Luncheon meat is processed, salty and high in saturated fat, and kimchi, gochujang and soy sauce add more salt, so use less luncheon meat and serve the rice with plain vegetables.',
        'Kimchi adaugă fibre și gust cu puține calorii, iar oul adaugă proteine. Carnea la conservă e procesată, sărată și bogată în grăsimi saturate, iar kimchi, gochujang și sosul de soia adaugă și mai multă sare, așa că pune mai puțină carne la conservă și servește orezul cu legume simple.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Roasted seaweed', 'Alge nori'),
          reason: t(
            'Crisp, salty-sweet sheets to wrap round spoonfuls of the spicy rice.',
            'Foi crocante, sărate și ușor dulci, în care poți înfășura linguri de orez picant.',
          ),
          principle: 'contrast_texture',
          ingredient: 'nori',
        },
        {
          kind: 'food',
          label: t('Cold cucumber', 'Castravete rece'),
          reason: t(
            'Its watery crunch cools the heat of the gochujang and kimchi.',
            'Crocantul lui apos răcorește iuțeala de la gochujang și kimchi.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'cucumber',
        },
        {
          kind: 'drink',
          label: t('Cold lager', 'Bere blondă rece'),
          reason: t(
            'Its crisp fizz cuts through the spicy, fatty rice.',
            'Bulele ei taie din bogăția și iuțeala orezului.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'One pan and one bowl, ready in about 30 minutes once the rice is chilled.',
            'O singură tigaie și un singur bol, gata în aproximativ 30 de minute după ce orezul s-a răcit.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Hot, spicy and filling, it warms you up.',
            'Fierbinte, picant și săturător, te încălzește.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Spicy, salty and fatty, it can sit heavy and unsettle sleep.',
            'Fiind picant, sărat și gras, poate cădea greu și îți poate strica somnul.',
          ),
        },
      ],
    },
  ],
};
