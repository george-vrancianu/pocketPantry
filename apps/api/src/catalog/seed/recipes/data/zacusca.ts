import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Zacuscă base is the Romanian spread of roasted aubergine and kapia pepper,
// cooked down slowly in oil. It is the de post (meatless) kind, kept in the
// fridge or freezer rather than jarred for the pantry. Each Variant is a full
// Recipe with its own lines, steps and guidance; the base's Recipe-level Tips
// are inherited unless hidden.
export const zacusca: BaseRecipeSeed = {
  slug: 'zacusca',
  title: t(
    'Zacuscă (Romanian roasted aubergine and pepper spread)',
    'Zacuscă de vinete',
  ),
  servings: 16,
  prepMinutes: 30,
  cookMinutes: 180,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'aubergine',
      quantity: 3,
      unit: 'pcs',
      note: t('large, about 400 g each', 'mari, de câte 400 g fiecare'),
    },
    {
      ingredient: 'kapia-pepper',
      quantity: 5,
      unit: 'pcs',
      note: t('red, about 120 g each', 'roșii, de câte 120 g fiecare'),
    },
    {
      ingredient: 'onion',
      quantity: 3,
      unit: 'pcs',
      note: t('medium, finely chopped', 'medii, tocate mărunt'),
    },
    { ingredient: 'sunflower-oil', quantity: 150, unit: 'ml' },
    { ingredient: 'tomato-paste', quantity: 60, unit: 'g' },
    {
      ingredient: 'bay-leaves',
      quantity: 0.4,
      unit: 'g',
      note: t('2 leaves', '2 foi'),
    },
    { ingredient: 'peppercorns', quantity: 3, unit: 'g' },
    { ingredient: 'salt', quantity: 12, unit: 'g' },
    { ingredient: 'sugar', quantity: 10, unit: 'g', optional: true },
  ],
  steps: [
    {
      key: 'preheat',
      text: t(
        'Heat the oven to 220 °C (about 15 minutes) and line a large tray with baking paper.',
        'Încălzește cuptorul la 220 °C (aproximativ 15 minute) și tapetează o tavă mare cu hârtie de copt.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'roast-aubergines',
      text: t(
        'Wash and dry the aubergines, prick each one in a few places with a fork and put them on the tray. Roast for 15 minutes.',
        'Spală și șterge vinetele, înțeapă-le în câteva locuri cu furculița și pune-le în tavă. Coace-le 15 minute.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'roast-peppers',
      text: t(
        'Add the whole peppers to the tray. Roast for 30 minutes more, turning everything once after 15 minutes, until the pepper skins are blistered and blackened in places and the aubergines have collapsed and are very soft.',
        'Adaugă ardeii întregi în tavă. Mai coace 30 de minute, întorcând totul o dată după 15 minute, până când coaja ardeilor e bășicată și înnegrită pe alocuri, iar vinetele s-au înmuiat complet și s-au lăsat.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'steam',
      text: t(
        'Slide the hot vegetables into a large bowl, cover it with a plate or cling film and leave for 15 minutes; the steam loosens the skins.',
        'Mută legumele fierbinți într-un bol mare, acoperă-l cu o farfurie sau cu folie alimentară și lasă-le 15 minute; aburul desprinde coaja.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'peel',
      text: t(
        'Peel the peppers and discard the skins, stems and seeds. Halve the aubergines lengthwise and scoop the flesh out with a spoon, leaving the skin behind. This takes about 10 minutes.',
        'Curăță ardeii de coajă și scoate cotoarele și semințele. Taie vinetele în două pe lungime și scoate pulpa cu lingura, lăsând coaja. Îți ia cam 10 minute.',
      ),
    },
    {
      key: 'drain',
      text: t(
        'Put the aubergine flesh in a colander set over a bowl and leave it to drain for 30 minutes, pressing gently once or twice with a spoon. While it drains, chop the peppers finely and chop the onions.',
        'Pune pulpa de vinete într-o strecurătoare așezată peste un bol și las-o să se scurgă 30 de minute, apăsând ușor o dată sau de două ori cu lingura. Cât timp se scurge, toacă mărunt ardeii și ceapa.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'chop',
      text: t(
        'Chop the drained aubergine finely with a knife, so a little texture stays.',
        'Toacă mărunt cu cuțitul vinetele scurse, ca să rămână puțină textură.',
      ),
    },
    {
      key: 'onions',
      text: t(
        'Warm the oil in a wide, heavy pot over medium-low heat. Add the onions and cook for 15 minutes, stirring now and then, until soft and translucent but not browned.',
        'Încălzește uleiul într-o oală lată și cu fundul gros, la foc mic-mediu. Adaugă ceapa și călește-o 15 minute, amestecând din când în când, până se înmoaie și devine translucidă, fără să se rumenească.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'peppers',
      text: t(
        'Add the chopped peppers and cook for 10 minutes, stirring, until they have softened into the onions.',
        'Adaugă ardeii tocați și gătește 10 minute, amestecând, până se topesc în ceapă.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'simmer',
      text: t(
        'Stir in the aubergine, tomato paste, bay leaves and peppercorns. Simmer gently, uncovered, for 40 minutes, stirring every 5 minutes and scraping the bottom of the pot so nothing catches.',
        'Adaugă vinetele, pasta de roșii, foile de dafin și boabele de piper. Las-o să fiarbă la foc mic, fără capac, 40 de minute, amestecând la fiecare 5 minute și răzuind fundul oalei, ca să nu se prindă nimic.',
      ),
      timerSeconds: 2400,
    },
    {
      key: 'thicken',
      text: t(
        'Simmer for 20 minutes more, now stirring every minute or two as it thickens and starts to stick and spit. Stir in the salt and the sugar, if using. It is ready when a spoon dragged across the bottom leaves a trail that stays open and the oil gathers around the edges.',
        'Mai fierbe 20 de minute, amestecând acum la un minut-două, pentru că se îngroașă, se lipește și stropește. Adaugă sarea și zahărul, dacă îl folosești. E gata când lingura trasă prin fundul oalei lasă o urmă care rămâne deschisă, iar uleiul iese la margini.',
      ),
      timerSeconds: 1200,
    },
    {
      key: 'store',
      text: t(
        'Fish out the bay leaves. Let it cool a little, spoon it into clean jars or shallow containers and put them in the fridge within 2 hours of cooking. Keep it in the fridge for up to 4 days, or freeze it in portions for up to 3 months.',
        'Scoate foile de dafin. Lasă-o să se răcească puțin, pune-o în borcane curate sau în caserole puțin adânci și dă-le la frigider în cel mult 2 ore de la gătire. Ține-o la frigider până la 4 zile sau congelează-o în porții, până la 3 luni.',
      ),
    },
  ],
  tips: [
    t(
      'Use the widest pot you have: more surface means the water evaporates faster, and the cooking time and the risk of catching both go down.',
      'Folosește cea mai lată oală pe care o ai: o suprafață mare lasă apa să se evapore mai repede, iar timpul de gătit și riscul să se prindă scad amândouă.',
    ),
    t(
      'Zacuscă is traditionally sterilised in jars for the winter, but a low-acid vegetable purée in oil is a botulism risk, and there is no tested home canning method for this purée. Keep it in the fridge or freezer.',
      'Tradițional, zacusca se pune la borcan și se sterilizează pentru iarnă, dar un piure de legume cu aciditate scăzută, în ulei, prezintă risc de botulism, iar pentru acest piure nu există nicio metodă de conservare de casă testată. Păstrează-o la frigider sau la congelator.',
    ),
    t(
      'It tastes better after a day in the fridge, once the flavours have settled together.',
      'E mai bună după o zi la frigider, când aromele s-au legat între ele.',
    ),
  ],
  stepTips: [
    {
      step: 'roast-aubergines',
      text: t(
        'Pricking lets the steam escape, so an aubergine does not burst and spatter the oven. On a gas hob or a grill you can char them over the flame, turning every few minutes, for a smokier flavour.',
        'Înțepatul lasă aburul să iasă, așa că vânăta nu plesnește și nu stropește cuptorul. Pe flacăra aragazului sau pe grătar le poți coace direct pe foc, întorcându-le la câteva minute, pentru un gust mai afumat.',
      ),
    },
    {
      step: 'peel',
      text: t(
        'Do not rinse the vegetables under the tap; it washes the flavour away. If a flake of skin sticks, wipe it off with your fingers or a damp cloth.',
        'Nu clăti legumele sub jet de apă, pentru că se duce gustul. Dacă mai rămâne un petic de coajă, șterge-l cu degetele sau cu o cârpă umedă.',
      ),
    },
    {
      step: 'drain',
      text: t(
        'Aubergines hold a lot of liquid. If you skip the draining, the bitter juice stays in and the zacuscă needs far longer on the hob to thicken.',
        'Vinetele țin multă apă. Dacă sari peste scurgere, zeama amăruie rămâne în ea, iar zacusca are nevoie de mult mai mult timp pe foc ca să se îngroașe.',
      ),
    },
    {
      step: 'thicken',
      text: t(
        'Keep a lid or a splatter screen nearby: as it thickens, the hot purée spits. Stir with a long-handled spoon.',
        'Ține la îndemână un capac sau o sită anti-stropire: pe măsură ce se îngroașă, piureul fierbinte stropește. Amestecă cu o lingură cu coadă lungă.',
      ),
    },
  ],
  nutritionNote: t(
    'Mostly vegetables, so it brings some fibre, and the sunflower oil is mostly unsaturated fat. But the oil gives most of its energy, so it is energy-dense, the salt adds up when you eat it with bread and cheese, and it has almost no protein on its own.',
    'În mare parte legume, așa că aduce ceva fibre, iar uleiul de floarea soarelui e în mare parte grăsime nesaturată. Totuși uleiul îi dă cea mai mare parte din energie, deci e bogată în energie, sarea se adună când o mănânci cu pâine și brânză, iar proteine nu are aproape deloc.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Country bread', 'Pâine de casă'),
      reason: t(
        'Thick slices of crusty bread are the usual way to eat it.',
        'Se mănâncă de obicei întinsă pe felii groase de pâine cu coajă crocantă.',
      ),
      principle: 'contrast_texture',
      ingredient: 'country-bread',
    },
    {
      kind: 'food',
      label: t('Telemea', 'Telemea'),
      reason: t(
        'The salty, firm cheese sets off the sweet, smoky spread.',
        'Brânza sărată și fermă pune în valoare gustul dulce și afumat al pastei.',
      ),
      principle: 'salt_balances_sweet',
      ingredient: 'telemea',
    },
    {
      kind: 'food',
      label: t('Red onion', 'Ceapă roșie'),
      reason: t(
        'A few raw slices add a sharp crunch against the soft, mellow spread.',
        'Câteva felii crude adaugă un crocant picant lângă pasta moale și dulceagă.',
      ),
      principle: 'contrast_texture',
      ingredient: 'red-onion',
    },
    {
      kind: 'food',
      label: t('Romanian appetizer platter', 'Platou românesc de aperitive'),
      reason: t(
        'A bowl of your own zacuscă fits on the platter beside the cheese, cold cuts and pickles.',
        'Un bol cu zacuscă făcută de tine se potrivește pe platou lângă brânză, mezeluri și murături.',
      ),
      principle: 'complement_flavour',
      recipe: 'appetizer-platter-romanian',
    },
  ],
  eatingMoments: [
    {
      moment: 'morning',
      polarity: 'good_for',
      reason: t(
        'Spread on bread, it is a quick meatless breakfast.',
        'Întinsă pe pâine, e un mic dejun rapid, fără carne.',
      ),
    },
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'Bread, zacuscă and a slice of cheese make an easy cold lunch.',
        'Pâine, zacuscă și o felie de brânză fac un prânz rece, ușor de pregătit.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'The oil makes it rich and heavy just before bed.',
        'Uleiul o face bogată și grea chiar înainte de culcare.',
      ),
    },
  ],
  variants: [
    // ------------------------------------------------------------------ Balkan
    {
      slug: 'zacusca-balkan',
      cuisine: 'balkan',
      // The base's canning Tip names zacuscă; ajvar has its own storage Tip.
      hideBaseTips: [1],
      title: t(
        'Ajvar (Balkan roasted red pepper relish)',
        'Ajvar (pastă balcanică de ardei roșii copți)',
      ),
      servings: 16,
      prepMinutes: 30,
      cookMinutes: 155,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'kapia-pepper',
          quantity: 16,
          unit: 'pcs',
          note: t(
            'red, about 125 g each (2 kg)',
            'roșii, de câte 125 g fiecare (2 kg)',
          ),
        },
        {
          ingredient: 'aubergine',
          quantity: 1,
          unit: 'pcs',
          optional: true,
          note: t('about 400 g', 'de aproximativ 400 g'),
        },
        {
          ingredient: 'hot-pepper',
          quantity: 2,
          unit: 'pcs',
          optional: true,
          note: t(
            'red, for a hot ajvar (ljuti ajvar)',
            'roșii, pentru un ajvar iute (ljuti ajvar)',
          ),
        },
        { ingredient: 'sunflower-oil', quantity: 200, unit: 'ml' },
        {
          ingredient: 'garlic',
          quantity: 8,
          unit: 'g',
          optional: true,
          note: t('1 to 2 cloves, crushed', '1-2 căței, striviți'),
        },
        { ingredient: 'vinegar', quantity: 30, unit: 'ml' },
        { ingredient: 'salt', quantity: 15, unit: 'g' },
        { ingredient: 'sugar', quantity: 10, unit: 'g' },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 220 °C (about 15 minutes) and line two large trays with baking paper.',
            'Încălzește cuptorul la 220 °C (aproximativ 15 minute) și tapetează două tăvi mari cu hârtie de copt.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'roast',
          text: t(
            'Spread the whole peppers, the hot peppers and the aubergine, pricked with a fork, over the two trays. Roast for 35 minutes, swapping the trays and turning everything after 17 minutes, until the pepper skins are blistered and blackened in places.',
            'Împarte pe cele două tăvi ardeii kapia întregi, ardeii iuți și vânăta, înțepată cu furculița. Coace 35 de minute, schimbând tăvile între ele și întorcând totul după 17 minute, până când coaja ardeilor e bășicată și înnegrită pe alocuri.',
          ),
          timerSeconds: 2100,
        },
        {
          key: 'roast-aubergine',
          text: t(
            'Take out the peppers and leave the aubergine in for 10 minutes more, until it has collapsed and is very soft.',
            'Scoate ardeii și lasă vânăta încă 10 minute, până se lasă și se înmoaie complet.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'steam',
          text: t(
            'Put all the peppers, still hot, in a large bowl, cover it with a plate or cling film and leave for 15 minutes; the steam loosens the skins. Leave the aubergine to cool on its tray.',
            'Pune toți ardeii, încă fierbinți, într-un bol mare, acoperă-l cu o farfurie sau cu folie alimentară și lasă-i 15 minute; aburul desprinde coaja. Lasă vânăta să se răcească în tavă.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'peel',
          text: t(
            'Peel the peppers and discard the skins, stems and seeds. Scoop the aubergine flesh out of its skin with a spoon. This takes about 20 to 25 minutes.',
            'Curăță ardeii de coajă și scoate cotoarele și semințele. Scoate pulpa vinetei cu lingura. Îți ia cam 20-25 de minute.',
          ),
        },
        {
          key: 'drain',
          text: t(
            'Put the peppers and the aubergine in a colander and leave them to drain for 20 minutes, pressing gently now and then. Do not skip this: the peppers hold a lot of water.',
            'Pune ardeii și vânăta într-o strecurătoare și lasă-i să se scurgă 20 de minute, apăsând ușor din când în când. Nu sări peste acest pas: ardeii țin multă apă.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'mince',
          text: t(
            'Mince the peppers and aubergine finely with a knife, or pulse them in a food processor in short bursts, until chunky-smooth rather than a watery purée.',
            'Toacă mărunt ardeii și vânăta cu cuțitul sau dă-le scurt prin robotul de bucătărie, până obții o pastă fină, dar cu bucățele, nu un piure apos.',
          ),
        },
        {
          key: 'cook-down',
          text: t(
            'Put the minced vegetables in your widest heavy pot over medium heat and cook for 30 minutes, uncovered, stirring every 3 to 4 minutes and scraping the bottom, until most of the water has gone and the mixture is thick.',
            'Pune legumele tocate în cea mai lată oală cu fundul gros, la foc mediu, și gătește 30 de minute, descoperit, amestecând la 3-4 minute și răzuind fundul, până când aproape toată apa s-a dus și compoziția se îngroașă.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'finish',
          text: t(
            'Stir in the oil, garlic, salt and sugar. Cook for 25 minutes more, stirring constantly now, as it thickens and sticks, until it is glossy and a spoon dragged across the bottom leaves a trail that stays open. Stir in the vinegar and cook for 2 minutes.',
            'Adaugă uleiul, usturoiul, sarea și zahărul. Mai gătește 25 de minute, amestecând acum continuu, pentru că se îngroașă și se lipește, până devine lucioasă, iar lingura trasă prin fundul oalei lasă o urmă care rămâne deschisă. Adaugă oțetul și mai gătește 2 minute.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'store',
          text: t(
            'Let it cool a little, spoon it into clean jars or shallow containers and put them in the fridge within 2 hours of cooking. Keep it in the fridge for up to 4 days, or freeze it in portions for up to 3 months.',
            'Lasă-l să se răcească puțin, pune-l în borcane curate sau în caserole puțin adânci și dă-le la frigider în cel mult 2 ore de la gătire. Ține-l la frigider până la 4 zile sau congelează-l în porții, până la 3 luni.',
          ),
        },
      ],
      tips: [
        t(
          'There is no tested home canning method for ajvar, and a low-acid pepper purée in oil is a botulism risk, even with a little vinegar. Keep it in the fridge for up to 4 days, or freeze it in portions.',
          'Pentru ajvar nu există nicio metodă de conservare de casă testată, iar un piure de ardei cu aciditate scăzută, în ulei, prezintă risc de botulism, chiar și cu puțin oțet. Ține-l la frigider până la 4 zile sau congelează-l în porții.',
        ),
        t(
          'Many Serbian and Macedonian cooks leave the garlic out altogether; add it only if you like it.',
          'Mulți gospodari din Serbia și Macedonia nu pun deloc usturoi; adaugă-l doar dacă îți place.',
        ),
        t(
          'Wear gloves, or wash your hands well, when you handle the hot peppers, and keep your hands away from your eyes.',
          'Poartă mănuși sau spală-te bine pe mâini după ce atingi ardeii iuți și nu te atinge la ochi.',
        ),
      ],
      stepTips: [
        {
          step: 'finish',
          text: t(
            'At this stage the thick relish spits like lava. Use a long-handled spoon and turn the heat down a little if it spatters badly.',
            'În această etapă pasta groasă stropește tare. Folosește o lingură cu coadă lungă și micșorează focul dacă stropește prea mult.',
          ),
        },
        {
          step: 'drain',
          text: t(
            'The red juice that drains out is full of flavour: save it for a soup or a stew.',
            'Zeama roșie care se scurge are mult gust: păstreaz-o pentru o supă sau o tocană.',
          ),
        },
      ],
      nutritionNote: t(
        'Peppers are the base, so it brings some fibre. But a lot of oil goes in and supplies most of the energy, so it is energy-dense, and the salt adds up with bread, cheese and grilled meat. It is not a source of protein on its own.',
        'Baza sunt ardeii, deci aduce ceva fibre. Dar intră mult ulei, care dă cea mai mare parte din energie, așa că e bogat în energie, iar sarea se adună împreună cu pâinea, brânza și carnea la grătar. Proteine nu are de la sine.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t(
            'Ćevapi (Bosnian grilled minced-beef rolls)',
            'Ćevapi (mici bosniaci de vită)',
          ),
          reason: t(
            'Ajvar is a common relish beside grilled ćevapi across the former Yugoslavia; in Bosnia, chopped onion and kajmak come first.',
            'Ajvarul e un condiment des întâlnit lângă ćevapi la grătar în fosta Iugoslavie; în Bosnia, ceapa tocată și kajmakul vin pe primul loc.',
          ),
          principle: 'regional_tradition',
          recipe: 'mici-balkan',
        },
        {
          kind: 'food',
          label: t('Somun flatbread', 'Lipie bosniacă (somun)'),
          reason: t(
            'Soft, warm flatbread to scoop up the thick relish.',
            'O lipie moale și caldă cu care iei pasta groasă.',
          ),
          principle: 'contrast_texture',
          ingredient: 'somun',
        },
        {
          kind: 'food',
          label: t('Kajmak', 'Caimac (kajmak)'),
          reason: t(
            'The creamy, mildly salty dairy spread tames the sweet, smoky pepper.',
            'Caimacul cremos și ușor sărat domolește gustul dulce și afumat al ardeiului.',
          ),
          principle: 'contrast_texture',
          ingredient: 'kajmak',
        },
        {
          kind: 'food',
          label: t('Feta', 'Brânză feta'),
          reason: t(
            'Salty white cheese sets off the sweetness of the roasted peppers.',
            'Brânza albă sărată pune în valoare dulceața ardeilor copți.',
          ),
          principle: 'salt_balances_sweet',
          ingredient: 'feta',
        },
      ],
      eatingMoments: [
        {
          moment: 'morning',
          polarity: 'good_for',
          reason: t(
            'Spread on bread with white cheese, it makes a quick breakfast.',
            'Întins pe pâine cu brânză albă, e un mic dejun rapid.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Bread, cheese and a spoonful of ajvar are an easy cold lunch.',
            'Pâinea, brânza și o lingură de ajvar fac un prânz rece și simplu.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'The oil makes it rich and heavy just before bed.',
            'Uleiul îl face bogat și greu chiar înainte de culcare.',
          ),
        },
      ],
    },
    // ------------------------------------------------------------------ Indian
    {
      slug: 'zacusca-indian',
      cuisine: 'indian',
      // A hot dish eaten the same day, not a jarred spread: the storage and
      // flavour-settling Tips of the base do not apply.
      hideBaseTips: [1, 2],
      title: t(
        'Baingan bharta (Indian smoky mashed aubergine with onion and tomato)',
        'Baingan bharta (vinete coapte, pisate și gătite cu ceapă și roșii, ca în India)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 100,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'aubergine',
          quantity: 2,
          unit: 'pcs',
          note: t('large, about 400 g each', 'mari, de câte 400 g fiecare'),
        },
        { ingredient: 'sunflower-oil', quantity: 45, unit: 'ml' },
        { ingredient: 'cumin-seeds', quantity: 3, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('medium, finely chopped', 'medii, tocate mărunt'),
        },
        {
          ingredient: 'ginger',
          quantity: 10,
          unit: 'g',
          note: t('finely grated', 'dat pe răzătoare fină'),
        },
        {
          ingredient: 'garlic',
          quantity: 12,
          unit: 'g',
          note: t('about 3 cloves, minced', 'aproximativ 3 căței, tocați'),
        },
        {
          ingredient: 'hot-pepper',
          quantity: 1,
          unit: 'pcs',
          note: t('green, finely chopped', 'verde, tocat mărunt'),
        },
        {
          ingredient: 'tomato',
          quantity: 300,
          unit: 'g',
          note: t('ripe, finely chopped', 'coapte, tocate mărunt'),
        },
        { ingredient: 'turmeric', quantity: 2, unit: 'g' },
        { ingredient: 'chili-powder', quantity: 2, unit: 'g' },
        { ingredient: 'salt', quantity: 6, unit: 'g' },
        { ingredient: 'garam-masala', quantity: 3, unit: 'g' },
        {
          ingredient: 'coriander',
          quantity: 10,
          unit: 'g',
          note: t('fresh, chopped', 'proaspăt, tocat'),
        },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 220 °C (about 15 minutes) and line a tray with baking paper.',
            'Încălzește cuptorul la 220 °C (aproximativ 15 minute) și tapetează o tavă cu hârtie de copt.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'char',
          text: t(
            'Prick the aubergines in a few places with a fork and put them on the tray. Roast for 40 minutes, turning every 15 minutes, until the skin is wrinkled and blackened in places and the flesh has collapsed completely.',
            'Înțeapă vinetele în câteva locuri cu furculița și pune-le în tavă. Coace-le 40 de minute, întorcându-le la 15 minute, până când coaja e încrețită și înnegrită pe alocuri, iar pulpa s-a lăsat complet.',
          ),
          timerSeconds: 2400,
        },
        {
          key: 'peel',
          text: t(
            'Leave the aubergines to cool in a covered bowl for 10 minutes. Then peel off the skin, cut off the stems and mash the flesh roughly with a fork.',
            'Lasă vinetele să se răcească 10 minute într-un bol acoperit. Apoi curăță-le de coajă, taie cotoarele și pisează pulpa grosier cu furculița.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'cumin',
          text: t(
            'Warm the oil in a wide pan over medium heat. Add the cumin seeds and cook for about 30 seconds, until they sizzle and smell fragrant; do not let them burn.',
            'Încălzește uleiul într-o tigaie lată, la foc mediu. Adaugă semințele de chimion și gătește-le aproximativ 30 de secunde, până sfârâie și miros plăcut; nu le lăsa să se ardă.',
          ),
          timerSeconds: 30,
        },
        {
          key: 'onions',
          text: t(
            'Add the onions and cook for 8 to 10 minutes, stirring, until soft and golden at the edges.',
            'Adaugă ceapa și gătește 8-10 minute, amestecând, până se înmoaie și se aurește la margini.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'aromatics',
          text: t(
            'Stir in the ginger, garlic and green chilli and cook for 1 minute, until the raw smell goes.',
            'Adaugă ghimbirul, usturoiul și ardeiul iute verde și gătește 1 minut, până dispare mirosul de crud.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'tomatoes',
          text: t(
            'Add the tomatoes, turmeric, chilli powder and salt. Cook for 8 to 10 minutes, until the tomatoes have broken down and the oil starts to separate at the edges.',
            'Adaugă roșiile, turmericul, ardeiul iute măcinat și sarea. Gătește 8-10 minute, până când roșiile se desfac, iar uleiul începe să iasă la margini.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'combine',
          text: t(
            'Stir in the mashed aubergine and cook for 8 minutes, stirring often, until the masala and aubergine are well blended and thick.',
            'Adaugă vinetele pisate și gătește 8 minute, amestecând des, până când masala și vinetele se leagă bine și se îngroașă.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'finish',
          text: t(
            'Take the pan off the heat and stir in the garam masala and half of the coriander. Scatter the rest of the coriander on top and serve hot.',
            'Ia tigaia de pe foc și amestecă garam masala și jumătate din coriandru. Presară restul de coriandru deasupra și servește fierbinte.',
          ),
        },
      ],
      tips: [
        t(
          'Let leftovers cool and put them in the fridge within 2 hours. Keep for up to 3 days and reheat until steaming hot.',
          'Lasă ce rămâne să se răcească și pune-l la frigider în cel mult 2 ore. Se păstrează până la 3 zile; încălzește-l până scoate aburi.',
        ),
      ],
      stepTips: [
        {
          step: 'char',
          text: t(
            'For the real smoky flavour, char the aubergines directly over a gas flame for 12 to 15 minutes, turning with tongs. Under a very hot grill, turn them every 5 minutes.',
            'Pentru gustul afumat autentic, coace vinetele direct pe flacăra aragazului 12-15 minute, întorcându-le cu un clește. Sub un grill foarte încins, întoarce-le la 5 minute.',
          ),
        },
        {
          step: 'aromatics',
          text: t(
            'Wash your hands well after chopping the chilli and keep them away from your eyes.',
            'Spală-te bine pe mâini după ce toci ardeiul iute și nu te atinge la ochi.',
          ),
        },
      ],
      nutritionNote: t(
        'Aubergine and tomato bring fibre and plenty of vegetables for little energy, with oil that is mostly unsaturated fat. But the salt and the oil add up, and the dish has little protein, so serve it with yogurt, lentils or a pulse dish and rice or bread.',
        'Vinetele și roșiile aduc fibre și multe legume cu puține calorii, iar uleiul e în mare parte grăsime nesaturată. Dar sarea și uleiul se adună, iar mâncarea are puține proteine, așa că servește-o cu iaurt sau linte și cu orez sau pâine.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Naan', 'Naan'),
          reason: t(
            'Soft, warm bread to scoop up the thick, smoky mash.',
            'O pâine moale și caldă cu care iei piureul gros și afumat.',
          ),
          principle: 'complement_flavour',
          ingredient: 'naan',
        },
        {
          kind: 'food',
          label: t('Basmati rice', 'Orez basmati'),
          reason: t(
            'Plain rice soaks up the spiced tomato and keeps the heat mild.',
            'Orezul simplu absoarbe sosul condimentat de roșii și ține iuțeala sub control.',
          ),
          principle: 'complement_flavour',
          ingredient: 'basmati-rice',
        },
        {
          kind: 'food',
          label: t('Yogurt', 'Iaurt'),
          reason: t(
            'Cool, creamy yogurt tames the chilli and cleans the palate between bites.',
            'Iaurtul rece și cremos domolește iuțeala și curăță gustul între îmbucături.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'yogurt',
        },
        {
          kind: 'drink',
          label: t('Beer', 'Bere'),
          reason: t(
            'A cold, light beer refreshes the mouth after the spice.',
            'O bere rece și ușoară împrospătează gura după condimente.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, spiced dish that warms you through.',
            'O mâncare fierbinte și condimentată, care te încălzește.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Vegetable-based and filling with rice or naan.',
            'Pe bază de legume, și te satură cu orez sau naan.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'Served hot and spiced, it adds to the heat on a warm day.',
            'Servită fierbinte și condimentată, aduce și mai multă căldură într-o zi caldă.',
          ),
        },
      ],
    },
  ],
};
