import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Rice pilaf base is the plain buttery pilaf: onion softened in butter,
// rice toasted in the fat, simmered covered in hot stock. Each Variant is a
// full Recipe with its own lines, steps and guidance. The base's Recipe-level
// Tips are inherited; a Variant hides the ones that no longer hold.
export const ricePilaf: BaseRecipeSeed = {
  slug: 'rice-pilaf',
  title: t('Rice pilaf', 'Orez pilaf'),
  servings: 4,
  prepMinutes: 10,
  cookMinutes: 35,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'rice',
      quantity: 300,
      unit: 'g',
      note: t('long grain', 'cu bob lung'),
    },
    {
      ingredient: 'onion',
      quantity: 1,
      unit: 'pcs',
      note: t('finely chopped', 'tăiată mărunt'),
    },
    { ingredient: 'butter', quantity: 30, unit: 'g' },
    {
      ingredient: 'chicken-stock',
      quantity: 600,
      unit: 'ml',
      note: t('hot', 'fierbinte'),
    },
    {
      ingredient: 'bay-leaves',
      quantity: 0.4,
      unit: 'g',
      note: t('2 leaves', '2 foi'),
    },
    {
      ingredient: 'salt',
      quantity: 3,
      unit: 'g',
      note: t('less if the stock is salted', 'mai puțină dacă supa e sărată'),
    },
    { ingredient: 'black-pepper', quantity: 0.5, unit: 'g' },
    {
      ingredient: 'parsley',
      quantity: 10,
      unit: 'g',
      note: t('finely chopped', 'tăiat mărunt'),
    },
  ],
  steps: [
    {
      key: 'rinse',
      text: t(
        'Rinse the rice in a sieve under cold water until the water runs almost clear, then drain well.',
        'Spală orezul într-o strecurătoare sub apă rece, până când apa curge aproape limpede, apoi scurge-l bine.',
      ),
    },
    {
      key: 'onion',
      text: t(
        'Melt the butter in a heavy pot with a lid over medium-low heat. Cook the onion for about 5 minutes, stirring now and then, until soft and translucent but not browned.',
        'Topește untul într-o oală cu fund gros și capac, la foc mic-mediu. Călește ceapa aproximativ 5 minute, amestecând din când în când, până se înmoaie și devine translucidă, fără să se rumenească.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'toast',
      text: t(
        'Add the rice and stir for about 2 minutes, until the grains turn translucent at the edges and smell lightly nutty.',
        'Adaugă orezul și amestecă aproximativ 2 minute, până când boabele devin translucide pe margini și au un miros ușor de nucă.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'simmer',
      text: t(
        'Pour in the hot stock, add the bay leaves, the salt and the pepper, and stir once. Bring to a boil, cover with the lid and turn the heat to its lowest. Cook for 15 minutes without lifting the lid.',
        'Toarnă supa fierbinte, adaugă foile de dafin, sarea și piperul și amestecă o singură dată. Adu la fierbere, acoperă cu capacul și dă focul la minimum. Gătește 15 minute fără să ridici capacul.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'rest',
      text: t(
        'Take the pot off the heat and leave it covered for 10 minutes, so the steam finishes the grains.',
        'Ia oala de pe foc și las-o acoperită 10 minute, ca aburul să termine de gătit boabele.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'fluff',
      text: t(
        'Remove the bay leaves, fluff the rice with a fork until the grains separate, and fold in the parsley. Serve hot.',
        'Scoate foile de dafin, afânează orezul cu o furculiță până se desprind boabele și amestecă pătrunjelul. Servește fierbinte.',
      ),
    },
  ],
  tips: [
    t(
      'Cooked rice must not sit out: cool leftovers within an hour by spreading them in a shallow tray, refrigerate them, eat them within a day and reheat until steaming hot all the way through. Bacillus cereus spores survive cooking and multiply in rice left warm.',
      'Orezul gătit nu se lasă la temperatura camerei: răcește resturile în cel mult o oră, întinse într-o tavă joasă, păstrează-le la frigider, consumă-le în cel mult o zi și reîncălzește-le până când orezul e fierbinte peste tot. Sporii de Bacillus cereus rezistă la gătit și se înmulțesc în orezul lăsat la căldură.',
    ),
    t(
      'Keep the lid on while it simmers and rests: the steam does the cooking, and every peek lets it out.',
      'Ține capacul pus cât orezul fierbe și se odihnește: aburul îl gătește, iar fiecare privire pe sub capac îl lasă să scape.',
    ),
  ],
  stepTips: [
    {
      step: 'toast',
      text: t(
        'Coating every grain in butter helps keep the grains separate, so do not skip the stirring.',
        'Untul care îmbracă fiecare bob ajută boabele să rămână desprinse, așa că nu sări peste amestecat.',
      ),
    },
  ],
  nutritionNote: t(
    'Plain pilaf is mostly white rice: quick, easy-to-digest carbohydrate, but low in fibre and protein. The butter adds saturated fat, and the stock adds salt, so use unsalted or diluted stock if you can. Serve it with vegetables and a protein to round out the plate.',
    'Pilaful simplu e în mare parte orez alb: carbohidrați rapizi și ușor de digerat, dar cu puține fibre și proteine. Untul aduce grăsimi saturate, iar supa adaugă sare, așa că folosește supă nesărată sau diluată, dacă poți. Servește-l cu legume și o sursă de proteine, ca să fie o masă echilibrată.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Roast chicken', 'Pui la cuptor'),
      reason: t(
        'The buttery rice soaks up the roast juices from the pan.',
        'Orezul cu unt absoarbe zeama lăsată de friptură în tavă.',
      ),
      principle: 'complement_flavour',
      recipe: 'roast-chicken',
    },
    {
      kind: 'food',
      label: t('Tomato salad', 'Salată de roșii'),
      reason: t(
        'Its acidity cuts through the buttery rice.',
        'Aciditatea ei taie din bogăția orezului cu unt.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'tomato',
    },
    {
      kind: 'food',
      label: t('Cucumber', 'Castravete'),
      reason: t(
        'Crisp and cool against soft, warm grains.',
        'Crocant și răcoros lângă boabele moi și calde.',
      ),
      principle: 'contrast_texture',
      ingredient: 'cucumber',
    },
    {
      kind: 'drink',
      label: t('Dry white wine', 'Vin alb sec'),
      reason: t(
        'Crisp acidity refreshes the palate after butter.',
        'Aciditatea fină împrospătează gustul după unt.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'white-wine',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'Warm and comforting, a good base for a hot meal.',
        'Cald și reconfortant, o bază bună pentru o masă caldă.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'good_for',
      reason: t(
        'Plain rice is easy to digest; eat a small portion a couple of hours ahead.',
        'Orezul simplu se digeră ușor; mănâncă o porție mică cu câteva ore înainte.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A large plate of rice and butter sits heavy before bed.',
        'O farfurie mare de orez cu unt cade greu înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'rice-pilaf-middle-eastern',
      cuisine: 'middle-eastern',
      title: t(
        "Lebanese vermicelli rice (riz bi sh'arieh)",
        "Orez libanez cu fidea (riz bi sh'arieh)",
      ),
      servings: 4,
      prepMinutes: 10,
      cookMinutes: 33,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'rice',
          quantity: 300,
          unit: 'g',
          note: t('long grain', 'cu bob lung'),
        },
        {
          ingredient: 'vermicelli',
          quantity: 75,
          unit: 'g',
          note: t('broken into short pieces', 'frântă în bucăți mici'),
        },
        { ingredient: 'butter', quantity: 30, unit: 'g' },
        { ingredient: 'sunflower-oil', quantity: 15, unit: 'ml' },
        {
          ingredient: 'still-water',
          quantity: 0.55,
          unit: 'l',
          note: t('boiling', 'clocotită'),
        },
        { ingredient: 'salt', quantity: 4, unit: 'g' },
      ],
      steps: [
        {
          key: 'rinse',
          text: t(
            'Rinse the rice under cold water until the water runs almost clear, then drain it well.',
            'Spală orezul sub apă rece până când apa curge aproape limpede, apoi scurge-l bine.',
          ),
        },
        {
          key: 'fry',
          text: t(
            'Melt the butter with the oil in a heavy pot over medium heat. Add the vermicelli and fry for about 4 minutes, stirring all the time, until deep golden brown.',
            'Topește untul cu uleiul într-o oală cu fund gros, la foc mediu. Adaugă fideaua și prăjește-o aproximativ 4 minute, amestecând continuu, până devine aurie-închis.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'rice',
          text: t(
            'Add the rice and stir for 1 minute to coat it in the fat.',
            'Adaugă orezul și amestecă un minut, ca să se îmbrace în grăsime.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'simmer',
          text: t(
            'Pour in the boiling water, add the salt and stir once. Bring back to a boil, cover and turn the heat to its lowest. Cook for 15 minutes without lifting the lid.',
            'Toarnă apa clocotită, adaugă sarea și amestecă o singură dată. Readu la fierbere, acoperă și dă focul la minimum. Gătește 15 minute fără să ridici capacul.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'rest',
          text: t(
            'Take the pot off the heat and leave it covered for 10 minutes.',
            'Ia oala de pe foc și las-o acoperită 10 minute.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'fluff',
          text: t(
            'Fluff with a fork so the golden noodles are mixed through the rice, and serve hot.',
            'Afânează cu o furculiță, ca fideaua aurie să se amestece prin orez, și servește fierbinte.',
          ),
        },
      ],
      tips: [
        t(
          'Do not walk away while the vermicelli fries: it goes from golden to burnt in seconds. Pull it off the heat the moment it is the colour of strong tea.',
          'Nu pleca de lângă oală cât se prăjește fideaua: trece de la auriu la ars în câteva secunde. Ia oala de pe foc când fideaua are culoarea unui ceai tare.',
        ),
      ],
      stepTips: [
        {
          step: 'fry',
          text: t(
            'Break the nests of vermicelli by hand into pieces about 2 cm long before you start, as the heat leaves no time for it.',
            'Rupe cuiburile de fidea cu mâna în bucăți de aproximativ 2 cm înainte să începi, pentru că pe foc nu mai e timp.',
          ),
        },
      ],
      nutritionNote: t(
        'Rice and noodles are both refined carbohydrate, so this is a filling but low-fibre side with little protein of its own. The butter and oil add fat, and you can cut the salt without losing flavour, as the toasted noodles are so nutty. Serve with a protein and vegetables.',
        'Orezul și fideaua sunt carbohidrați rafinați, deci garnitura e săturătoare, dar cu puține fibre și cu puține proteine proprii. Untul și uleiul adaugă grăsime, iar sarea o poți reduce fără pierdere de gust, fiindcă fideaua prăjită e foarte aromată. Servește cu o sursă de proteine și legume.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t(
            'Sumac roast chicken with toum',
            'Pui la cuptor cu sumac și toum',
          ),
          reason: t(
            'The standard Levantine side: the rice takes up the chicken juices and softens the sharp garlic sauce.',
            'Garnitura obișnuită din Levant: orezul ia sucul puiului și îmblânzește sosul înțepător de usturoi.',
          ),
          principle: 'regional_tradition',
          recipe: 'roast-chicken-middle-eastern',
        },
        {
          kind: 'food',
          label: t('Plain yogurt', 'Iaurt simplu'),
          reason: t(
            'Cool, tangy yogurt balances the buttery, toasted rice.',
            'Iaurtul răcoros și acrișor echilibrează orezul prăjit, cu gust de unt.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'yogurt',
        },
        {
          kind: 'food',
          label: t('Cucumber', 'Castravete'),
          reason: t(
            'Crisp and fresh against the soft, rich rice.',
            'Crocant și proaspăt lângă orezul moale și bogat.',
          ),
          principle: 'contrast_texture',
          ingredient: 'cucumber',
        },
        {
          kind: 'food',
          label: t('Toasted pine nuts', 'Semințe de pin prăjite'),
          reason: t(
            'A scatter of nuts echoes the toasted notes of the noodles.',
            'Câteva semințe de pin repetă notele de prăjit ale fidelei.',
          ),
          principle: 'complement_flavour',
          ingredient: 'pine-nuts',
        },
        {
          kind: 'drink',
          label: t('Mint tea', 'Ceai de mentă'),
          reason: t(
            'Its freshness cleans the palate after a buttery meal.',
            'Prospețimea lui curăță gustul după o masă cu unt.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'mint-tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Warm, toasty and comforting.',
            'Cald, cu gust de prăjit și reconfortant.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Carbohydrates refill energy stores; add chicken or lentils for protein.',
            'Carbohidrații refac rezervele de energie; adaugă pui sau linte pentru proteine.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A big portion of buttery rice is heavy before bed.',
            'O porție mare de orez cu unt cade greu înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'rice-pilaf-romanian',
      cuisine: 'romanian',
      title: t('Romanian chicken pilaf', 'Pilaf cu pui'),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 75,
      difficulty: 'easy',
      hideBaseTips: [1],
      lines: [
        {
          ingredient: 'chicken-leg-quarters',
          quantity: 1200,
          unit: 'g',
          note: t('4 legs, about 300 g each', '4 pulpe, de câte 300 g'),
        },
        { ingredient: 'sunflower-oil', quantity: 30, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('finely chopped', 'tăiate mărunt'),
        },
        {
          ingredient: 'carrot',
          quantity: 150,
          unit: 'g',
          note: t('grated', 'rase'),
        },
        {
          ingredient: 'bell-pepper',
          quantity: 1,
          unit: 'pcs',
          optional: true,
          note: t('diced', 'tăiat cubulețe'),
        },
        {
          ingredient: 'tomato-paste',
          quantity: 20,
          unit: 'g',
          optional: true,
        },
        {
          ingredient: 'rice',
          quantity: 250,
          unit: 'g',
          note: t('long grain', 'cu bob lung'),
        },
        {
          ingredient: 'still-water',
          quantity: 0.6,
          unit: 'l',
          note: t('hot', 'fierbinte'),
        },
        {
          ingredient: 'bay-leaves',
          quantity: 0.4,
          unit: 'g',
          note: t('2 leaves', '2 foi'),
        },
        { ingredient: 'salt', quantity: 11, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        {
          ingredient: 'parsley',
          quantity: 10,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'pickled-cucumbers',
          quantity: 150,
          unit: 'g',
          note: t('to serve', 'pentru servire'),
        },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 180°C. Rinse the rice under cold water until the water runs almost clear, and drain it.',
            'Încinge cuptorul la 180°C. Spală orezul sub apă rece până când apa curge aproape limpede și scurge-l.',
          ),
        },
        {
          key: 'brown',
          text: t(
            'Pat the legs dry and season them with 5 g of the salt and the pepper. Heat the oil in a wide ovenproof pot with a lid over medium-high heat and brown the legs, in two batches if they do not fit in one layer, for 8 to 10 minutes in total, turning them once, until the skin is deep golden. Lift them onto a plate.',
            'Șterge pulpele cu un prosop de hârtie și condimentează-le cu 5 g din sare și cu piper. Încinge uleiul într-o oală largă, rezistentă la cuptor, cu capac, la foc mediu-mare și rumenește pulpele, în două serii dacă nu încap într-un singur strat, 8-10 minute în total, întorcându-le o dată, până pielea e aurie-închis. Scoate-le pe o farfurie.',
          ),
          timerSeconds: 540,
        },
        {
          key: 'vegetables',
          text: t(
            'In the fat left in the pot, cook the onion, carrot and bell pepper (if using) over medium heat for about 8 minutes, stirring, until soft. Stir in the tomato paste, if using, for the last minute.',
            'În grăsimea rămasă în oală, călește ceapa, morcovul și ardeiul gras (dacă îl folosești) la foc mediu aproximativ 8 minute, amestecând, până se înmoaie. Adaugă pasta de roșii, dacă o folosești, în ultimul minut.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'rice',
          text: t(
            'Add the rice and stir for 2 minutes, until the grains turn translucent at the edges.',
            'Adaugă orezul și amestecă 2 minute, până când boabele devin translucide pe margini.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'assemble',
          text: t(
            'Pour in the hot water with the remaining 6 g of salt, add the bay leaves and bring to a boil. Nestle the legs, skin side up, into the rice, together with the juices from the plate.',
            'Toarnă apa fierbinte cu cei 6 g de sare rămași, adaugă foile de dafin și adu la fierbere. Așază pulpele cu pielea în sus în orez, împreună cu zeama de pe farfurie.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Cover the pot and bake for 40 minutes.',
            'Acoperă oala și coace 40 de minute.',
          ),
          timerSeconds: 2400,
        },
        {
          key: 'crisp',
          text: t(
            'Remove the lid and bake for 10 minutes more, until the rice has absorbed the liquid and the skin is crisp.',
            'Scoate capacul și mai coace 10 minute, până când orezul a absorbit lichidul, iar pielea e crocantă.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'check',
          text: t(
            'Check that the chicken is cooked through: the juices run clear when you pierce the thickest part of a leg, or a thermometer reads 75°C. Rest the pot, covered, for 5 minutes.',
            'Verifică dacă puiul e gătit pe de-a-ntregul: zeama iese limpede când înțepi partea cea mai groasă a unei pulpe, sau un termometru arată 75°C. Lasă oala acoperită 5 minute.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'serve',
          text: t(
            'Remove the bay leaves, scatter the parsley over the top and serve with the pickled cucumbers.',
            'Scoate foile de dafin, presară pătrunjelul și servește cu castraveți murați.',
          ),
        },
      ],
      tips: [
        t(
          'Dry legs brown, wet legs steam: pat them dry and do not crowd the pot, or the skin stays pale and rubbery.',
          'Pulpele uscate se rumenesc, cele ude se aburesc: șterge-le bine și nu înghesui oala, altfel pielea rămâne palidă și cauciucată.',
        ),
      ],
      stepTips: [
        {
          step: 'bake',
          text: t(
            'Do not stir the rice once the legs are in; stirring breaks the grains and makes the pilaf sticky.',
            'Nu amesteca orezul după ce ai pus pulpele; amestecatul sparge boabele și lipește pilaful.',
          ),
        },
      ],
      nutritionNote: t(
        'A balanced one-dish meal: chicken gives protein, and carrot and pepper add some fibre and colour. Chicken skin and the frying fat add saturated fat, rice is refined carbohydrate, and the pickles are very salty, so serve them in small amounts and season lightly. Remove the skin for a leaner plate.',
        'O masă completă într-o singură oală: puiul aduce proteine, iar morcovul și ardeiul adaugă fibre și culoare. Pielea puiului și grăsimea de la prăjit aduc grăsimi saturate, orezul e carbohidrat rafinat, iar murăturile sunt foarte sărate, așa că servește-le în cantități mici și sărează cu măsură. Scoate pielea pentru o farfurie mai ușoară.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Pickled cucumbers', 'Castraveți murați'),
          reason: t(
            'Sour, salty crunch cuts the richness of the chicken and rice.',
            'Textura crocantă, acrișoară și sărată taie din bogăția puiului și a orezului.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-cucumbers',
        },
        {
          kind: 'food',
          label: t('Sauerkraut', 'Varză murată'),
          reason: t(
            'A classic Romanian partner for rich meat dishes; its sourness refreshes the palate.',
            'Un însoțitor clasic în bucătăria românească pentru mâncărurile cu carne; aciditatea ei împrospătează gustul.',
          ),
          principle: 'regional_tradition',
          ingredient: 'sauerkraut',
        },
        {
          kind: 'food',
          label: t('Sour cream', 'Smântână'),
          reason: t(
            'A spoonful adds cool tang to the savoury rice.',
            'O lingură aduce o notă răcoroasă și acrișoară orezului gustos.',
          ),
          principle: 'complement_flavour',
          ingredient: 'sour-cream',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Crisp acidity refreshes the palate after the roasted chicken.',
            'Aciditatea fină împrospătează gustul după puiul copt.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'white-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Hot, filling and warms the house while it bakes.',
            'Fierbinte, săturător și încălzește casa cât se coace.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein and carbohydrates together help recovery.',
            'Proteinele și carbohidrații împreună ajută la refacere.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'An hour of oven heat and a heavy plate are the last things you want in a heatwave.',
            'O oră de cuptor și o farfurie grea sunt ultimul lucru de dorit pe caniculă.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Too heavy to sleep well on.',
            'Prea greu pentru un somn bun.',
          ),
        },
      ],
    },
    {
      slug: 'rice-pilaf-greek',
      cuisine: 'greek',
      title: t(
        'Spanakorizo (Greek spinach rice)',
        'Spanakorizo (orez grecesc cu spanac)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 41,
      difficulty: 'easy',
      hideBaseTips: [1],
      lines: [
        {
          ingredient: 'spinach',
          quantity: 600,
          unit: 'g',
          note: t('washed and roughly chopped', 'spălat și tocat mare'),
        },
        {
          ingredient: 'medium-grain-rice',
          quantity: 200,
          unit: 'g',
          note: t('medium grain', 'cu bob mediu'),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely chopped', 'tăiată mărunt'),
        },
        {
          ingredient: 'spring-onion',
          quantity: 100,
          unit: 'g',
          note: t('sliced', 'tăiată rondele'),
        },
        {
          ingredient: 'olive-oil',
          quantity: 90,
          unit: 'ml',
          note: t(
            '75 ml to cook, the rest for drizzling',
            '75 ml pentru gătit, restul pentru servire',
          ),
        },
        {
          ingredient: 'still-water',
          quantity: 0.5,
          unit: 'l',
          note: t('hot', 'fierbinte'),
        },
        {
          ingredient: 'dill',
          quantity: 20,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'juice of half, the rest in wedges',
            'sucul de la jumătate, restul felii',
          ),
        },
        { ingredient: 'salt', quantity: 4, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        {
          ingredient: 'feta',
          quantity: 120,
          unit: 'g',
          note: t('to serve', 'pentru servire'),
        },
      ],
      steps: [
        {
          key: 'sweat',
          text: t(
            'Warm 75 ml of the olive oil in a wide pot over medium heat. Cook the onion and spring onion for about 7 minutes, stirring now and then, until soft and translucent.',
            'Încălzește 75 ml din uleiul de măsline într-o oală largă, la foc mediu. Călește ceapa și ceapa verde aproximativ 7 minute, amestecând din când în când, până se înmoaie și devin translucide.',
          ),
          timerSeconds: 420,
        },
        {
          key: 'wilt',
          text: t(
            'Add the spinach a handful at a time, stirring, and cook for about 7 minutes, until it has all wilted down and the liquid it gave off has started to reduce.',
            'Adaugă spanacul câte o mână, amestecând, și gătește aproximativ 7 minute, până s-a muiat tot, iar lichidul pe care l-a lăsat a început să scadă.',
          ),
          timerSeconds: 420,
        },
        {
          key: 'rice',
          text: t(
            'Stir in the rice, the salt and the pepper and cook for 1 minute, until the grains are coated in oil.',
            'Adaugă orezul, sarea și piperul și gătește un minut, până când boabele se îmbracă în ulei.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'simmer',
          text: t(
            'Pour in the hot water and bring to a boil. Lower the heat and simmer, partly covered, for about 18 minutes, stirring every few minutes, until the rice is tender and the pot is loose and creamy rather than dry. Add a splash of hot water if it dries out before the rice is done.',
            'Toarnă apa fierbinte și adu la fierbere. Scade focul și fierbe la foc mic, cu capacul pe jumătate, aproximativ 18 minute, amestecând la câteva minute, până când orezul e fraged, iar oala e cremoasă și lejeră, nu uscată. Dacă se usucă înainte să fie orezul gata, adaugă puțină apă fierbinte.',
          ),
          timerSeconds: 1080,
        },
        {
          key: 'finish',
          text: t(
            'Off the heat, stir in the dill and the juice of half the lemon. Cover and rest for 5 minutes so it thickens slightly.',
            'Dă oala de pe foc, amestecă mărarul și sucul de la jumătate de lămâie. Acoperă și lasă 5 minute, ca să se îngroașe puțin.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'serve',
          text: t(
            'Taste and add salt or lemon if needed. Serve warm, with the feta crumbled over each bowl, a drizzle of the reserved olive oil and the lemon wedges.',
            'Gustă și ajustează sarea sau lămâia. Servește cald, cu feta mărunțită în fiecare bol, un fir din uleiul de măsline rămas și felii de lămâie.',
          ),
        },
      ],
      tips: [
        t(
          'Add the dill and lemon only at the end: heat dulls both and they should taste bright against the cooked spinach.',
          'Pune mărarul și lămâia abia la sfârșit: căldura le tocește aroma, iar aici trebuie să iasă proaspete față de spanacul gătit.',
        ),
      ],
      stepTips: [
        {
          step: 'simmer',
          text: t(
            'Unlike a dry pilaf, spanakorizo is meant to be a little loose; stir it as it cooks and it will turn creamy from the starch.',
            'Spre deosebire de un pilaf uscat, spanakorizo trebuie să fie puțin lejer; amestecă-l cât fierbe și devine cremos din amidonul orezului.',
          ),
        },
      ],
      nutritionNote: t(
        'Plenty of greens and mostly unsaturated fat from the olive oil, with rice for energy. It is low in protein and the white rice is refined, so serve it with beans or fish if it is the main meal. Feta adds protein and calcium but also salt and saturated fat, so crumble it sparingly.',
        'Multă verdeață și grăsimi în mare parte nesaturate din uleiul de măsline, cu orez pentru energie. Are puține proteine, iar orezul alb e rafinat, așa că servește-l cu fasole sau pește dacă e masa principală. Feta aduce proteine și calciu, dar și sare și grăsimi saturate, așa că mărunțește-o cu măsură.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Thick yogurt', 'Iaurt gros'),
          reason: t(
            'A cool, tangy spoonful lifts the lemony rice and the cooked spinach.',
            'O lingură de iaurt răcoros și acrișor ridică orezul cu lămâie și spanacul gătit.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'yogurt',
        },
        {
          kind: 'food',
          label: t('Olives', 'Măsline'),
          reason: t(
            'Their brine and bitterness set off the fresh spinach.',
            'Saramura și gustul lor amărui pun în valoare spanacul proaspăt.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'olives',
        },
        {
          kind: 'food',
          label: t('Crusty bread', 'Pâine cu crustă'),
          reason: t(
            'Soft, loose rice wants something crisp to scoop with.',
            'Orezul moale și lejer cere ceva crocant cu care să-l ridici.',
          ),
          principle: 'contrast_texture',
          ingredient: 'sourdough',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Crisp acidity echoes the lemon and refreshes the palate.',
            'Aciditatea fină repetă lămâia și împrospătează gustul.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'white-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Vegetable-led and not heavy, good on its own with bread.',
            'Bazat pe legume, nu cade greu; bun singur, cu pâine.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Lemony and good warm or just cooled; eat it within an hour of cooking and refrigerate the rest.',
            'Cu lămâie, bun cald sau abia răcit; mănâncă-l în cel mult o oră de la gătit și pune restul la frigider.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Carbohydrates refill energy stores; add feta, fish or beans for protein.',
            'Carbohidrații refac rezervele de energie; adaugă feta, pește sau fasole pentru proteine.',
          ),
        },
      ],
    },
  ],
};
