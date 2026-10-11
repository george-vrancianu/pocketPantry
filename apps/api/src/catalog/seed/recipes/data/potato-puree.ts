import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Potato puree base is a plain butter-and-milk mash. Each Variant is a full
// Recipe with its own lines, steps and guidance; the base's Recipe-level Tips
// are inherited.
export const potatoPuree: BaseRecipeSeed = {
  slug: 'potato-puree',
  title: t('Potato puree', 'Piure de cartofi'),
  servings: 4,
  prepMinutes: 15,
  cookMinutes: 25,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'potato',
      quantity: 800,
      unit: 'g',
      note: t(
        'floury, such as Maris Piper or Russet',
        'făinoși, cu amidon mult',
      ),
    },
    { ingredient: 'butter', quantity: 60, unit: 'g' },
    { ingredient: 'milk', quantity: 150, unit: 'ml' },
    { ingredient: 'salt', quantity: 10, unit: 'g' },
    { ingredient: 'white-pepper', quantity: 0.5, unit: 'g', optional: true },
    { ingredient: 'nutmeg', quantity: 0.3, unit: 'g', optional: true },
  ],
  steps: [
    {
      key: 'prep',
      text: t(
        'Peel the potatoes and cut them into even pieces of about 4 cm, so they cook at the same speed. Drop them into a pot of cold water as you go.',
        'Curăță cartofii și taie-i în bucăți egale de aproximativ 4 cm, ca să se fiarbă în același timp. Pune-i într-o oală cu apă rece pe măsură ce îi tai.',
      ),
    },
    {
      key: 'boil',
      text: t(
        'Add 8 g of the salt to the pot, bring to a boil, then lower to a steady simmer and cook for 15 to 20 minutes, until a knife slides in with no resistance.',
        'Adaugă 8 g din sare în oală, adu la fierbere, apoi redu focul și lasă să fiarbă domol 15-20 de minute, până când cuțitul intră fără rezistență.',
      ),
      timerSeconds: 1000,
    },
    {
      key: 'dry',
      text: t(
        'Drain well and return the potatoes to the hot pot over low heat for 1 minute, shaking, so the steam escapes and they dry out.',
        'Scurge bine cartofii și pune-i la loc în oala caldă, la foc mic, un minut, scuturând oala, ca aburul să iasă și cartofii să se usuce.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'mash',
      text: t(
        'Mash the potatoes with a masher until smooth. Warm the milk with the butter until the butter melts, then stir it in a little at a time.',
        'Pasează cartofii cu pasatorul până devin fini. Încălzește laptele cu untul până se topește untul, apoi adaugă-l treptat, amestecând.',
      ),
    },
    {
      key: 'season',
      text: t(
        'Season with the remaining salt, the white pepper and the nutmeg. Taste, adjust, and serve hot.',
        'Condimentează cu sarea rămasă, piperul alb și nucșoara. Gustă, corectează și servește fierbinte.',
      ),
    },
  ],
  tips: [
    t(
      'Start the potatoes in cold, salted water so the outside does not turn mushy before the middle is cooked.',
      'Pune cartofii la fiert în apă rece și sărată, ca exteriorul să nu se destrame înainte să se gătească mijlocul.',
    ),
    t(
      'Add warm milk, never cold: cold liquid cools the potatoes and makes the puree gluey.',
      'Adaugă lapte cald, niciodată rece: lichidul rece răcește cartofii și piureul iese lipicios.',
    ),
    t(
      'Never use a blender or food processor; it breaks the starch and turns the puree to paste.',
      'Nu folosi blenderul sau roboțelul; ele sparg amidonul și transformă piureul într-o pastă lipicioasă.',
    ),
  ],
  stepTips: [
    {
      step: 'dry',
      text: t(
        'Letting the steam escape is what keeps the puree rich and fluffy instead of watery.',
        'Dacă lași aburul să iasă, piureul rămâne pufos și bogat, nu apos.',
      ),
    },
  ],
  nutritionNote: t(
    'Potatoes give filling carbohydrates, potassium and some vitamin C, and the dish is gentle on the stomach; the butter and milk add saturated fat and the salt adds up, and it has little fibre or protein unless you leave the skins on or serve it with something else.',
    'Cartofii aduc carbohidrați care săturează, potasiu și puțină vitamina C, iar preparatul e blând cu stomacul; untul și laptele adaugă grăsimi saturate, sarea se adună, iar fibrele și proteinele sunt puține, dacă nu lași coaja sau nu-l servești cu altceva.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Fried chicken', 'Pui prăjit'),
      reason: t(
        'Crisp fried chicken is a classic partner for creamy mash.',
        'Puiul prăjit crocant este un partener clasic pentru piureul cremos.',
      ),
      principle: 'contrast_texture',
      recipe: 'fried-chicken',
    },
    {
      kind: 'food',
      label: t('Grilled steak', 'Friptură la grătar'),
      reason: t(
        'The soft, mild puree soaks up the meat juices and tempers the char.',
        'Piureul moale și blând absoarbe sosul cărnii și domolește aroma de grătar.',
      ),
      principle: 'complement_flavour',
      ingredient: 'beef-steak',
    },
    {
      kind: 'food',
      label: t('Pork chops', 'Cotlet de porc'),
      reason: t(
        'A classic plate where the creamy mash balances the savoury meat.',
        'O farfurie clasică, în care piureul cremos echilibrează gustul sărat al cărnii.',
      ),
      principle: 'complement_flavour',
      ingredient: 'pork-chops',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sharp acidity cuts through the buttery richness.',
        'Aciditatea lor echilibrează gustul gras al untului.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'food',
      label: t('Fresh chives', 'Arpagic proaspăt'),
      reason: t(
        'A mild onion note and a touch of green over the plain puree.',
        'O notă delicată de ceapă și un strop de verde peste piureul simplu.',
      ),
      principle: 'complement_flavour',
      ingredient: 'chives',
    },
    {
      kind: 'drink',
      label: t('Red wine', 'Vin roșu'),
      reason: t(
        'Its tannins and fruit stand up to roast and grilled meats served with mash.',
        'Taninii și aromele fructate țin piept cărnii la grătar sau la cuptor, servite cu piure.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'red-wine',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'Warm, soft and comforting when it is cold outside.',
        'Cald, moale și reconfortant când e frig afară.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Carbohydrates help refill energy; pair it with a protein.',
        'Carbohidrații ajută la refacerea energiei; servește-l cu o sursă de proteine.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Butter and a big portion sit heavy right before exercise.',
        'Untul și o porție mare cad greu la stomac chiar înainte de efort.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'A hot, heavy side is the last thing you want in the heat.',
        'O garnitură caldă și grea e ultimul lucru dorit pe căldură.',
      ),
    },
  ],
  variants: [
    {
      slug: 'potato-puree-french',
      cuisine: 'french',
      title: t(
        'French pommes purée',
        'Pommes purée franțuzesc (piure franțuzesc)',
      ),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 35,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'potato',
          quantity: 800,
          unit: 'g',
          note: t(
            'waxy, such as Ratte, or Yukon Gold, unpeeled',
            'cu pulpă fermă (cerați), de tip Ratte, sau Yukon Gold, nedecojiți',
          ),
        },
        {
          ingredient: 'butter',
          quantity: 200,
          unit: 'g',
          note: t('cold, cut into cubes', 'rece, tăiat cubulețe'),
        },
        { ingredient: 'milk', quantity: 150, unit: 'ml' },
        { ingredient: 'salt', quantity: 10, unit: 'g' },
        { ingredient: 'white-pepper', quantity: 0.5, unit: 'g' },
      ],
      steps: [
        {
          key: 'boil',
          text: t(
            'Put the whole, unpeeled potatoes in a pot of cold water with 8 g of the salt. Bring to a boil and simmer for 25 to 30 minutes, until very tender.',
            'Pune cartofii întregi, nedecojiți, într-o oală cu apă rece și 8 g din sare. Adu la fierbere și fierbe 25-30 de minute, până se înmoaie complet.',
          ),
          timerSeconds: 1650,
        },
        {
          key: 'peel',
          text: t(
            'Drain, and peel the potatoes while still hot, holding them in a cloth. Press them through a fine sieve or a food mill back into the pot.',
            'Scurge cartofii și curăță-i de coajă cât sunt încă fierbinți, ținându-i într-un prosop. Trece-i prin sită fină sau prin mașina de pasat, înapoi în oală.',
          ),
        },
        {
          key: 'dry',
          text: t(
            'Stir the puree over low heat for 2 to 3 minutes with a wooden spoon until it dries slightly and leaves a film on the bottom of the pot.',
            'Amestecă piureul la foc mic 2-3 minute cu o lingură de lemn, până se usucă ușor și lasă o peliculă pe fundul oalei.',
          ),
          timerSeconds: 150,
        },
        {
          key: 'butter',
          text: t(
            'Off the heat, beat in the cold butter a few cubes at a time, until the puree turns glossy and silky.',
            'Dă oala de pe foc și încorporează untul rece, câteva cubulețe odată, bătând până piureul devine lucios și mătăsos.',
          ),
        },
        {
          key: 'milk',
          text: t(
            'Heat the milk until steaming, then beat it in until the puree is loose enough to fall in a ribbon off the spoon. Season with the remaining salt and the white pepper, and serve at once.',
            'Încălzește laptele până scoate abur, apoi încorporează-l, bătând, până piureul curge în panglică de pe lingură. Condimentează cu sarea rămasă și piperul alb și servește imediat.',
          ),
        },
      ],
      tips: [
        t(
          'Taste for butter at the end; the aim is a puree that is nearly a sauce, so it should be soft and slightly loose.',
          'Gustă la final și potrivește untul; piureul trebuie să fie aproape ca un sos: moale și ușor curgător.',
        ),
      ],
      stepTips: [
        {
          step: 'butter',
          text: t(
            'Keep the butter cold: it emulsifies into the puree instead of melting out of it.',
            'Păstrează untul rece: se emulsionează în piure în loc să se topească și să iasă din el.',
          ),
        },
      ],
      nutritionNote: t(
        'Potatoes bring carbohydrates and potassium, and cooking them in their skins keeps more of their goodness; this version is very high in butter, so it is rich in saturated fat and energy. Enjoy it in a small portion beside something lean.',
        'Cartofii aduc carbohidrați și potasiu, iar fierberea în coajă păstrează mai multe din calitățile lor; versiunea aceasta conține foarte mult unt, deci e bogată în grăsimi saturate și energie. Mănâncă o porție mică, alături de ceva slab.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Seared steak', 'Friptură rumenită în tigaie'),
          reason: t(
            'The silky puree is a classic bed for a seared, juicy cut.',
            'Piureul mătăsos e un pat clasic pentru o bucată de carne suculentă, rumenită în tigaie.',
          ),
          principle: 'regional_tradition',
          ingredient: 'beef-steak',
        },
        {
          kind: 'food',
          label: t('Seared salmon', 'Somon rumenit în tigaie'),
          reason: t(
            'Crisp salmon skin gives texture next to the smooth puree.',
            'Pielea crocantă a somonului dă textură lângă piureul fin.',
          ),
          principle: 'contrast_texture',
          ingredient: 'salmon',
        },
        {
          kind: 'food',
          label: t('Fresh thyme', 'Cimbru proaspăt'),
          reason: t(
            'An aromatic herb that lifts the buttery flavour.',
            'O plantă aromatică ce ridică gustul de unt.',
          ),
          principle: 'complement_flavour',
          ingredient: 'thyme',
        },
        {
          kind: 'food',
          label: t('Dijon-style mustard', 'Muștar de Dijon'),
          reason: t(
            'A sharp spoonful cuts the richness of the butter.',
            'O lingură de muștar ascuțit taie din bogăția untului.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'mustard',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its crisp acidity refreshes the palate between buttery spoonfuls.',
            'Aciditatea lui proaspătă împrospătează gustul între îmbucăturile bogate în unt.',
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
            'Rich and warming on a chilly day.',
            'Bogat și încălzitor într-o zi răcoroasă.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'So much butter sits heavy before sleep.',
            'Atât de mult unt cade greu la stomac înainte de culcare.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'High fat slows digestion and weighs on you during exercise.',
            'Grăsimea multă încetinește digestia și te îngreunează în timpul efortului.',
          ),
        },
      ],
    },
    {
      slug: 'potato-puree-irish-colcannon',
      cuisine: 'irish',
      title: t('Irish colcannon', 'Colcannon irlandez'),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 30,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'potato',
          quantity: 800,
          unit: 'g',
          note: t('floury', 'făinoși'),
        },
        {
          ingredient: 'cabbage',
          quantity: 250,
          unit: 'g',
          note: t(
            'savoy or green, finely shredded',
            'creață sau verde, tăiată fin',
          ),
        },
        {
          ingredient: 'spring-onion',
          quantity: 60,
          unit: 'g',
          note: t('thinly sliced', 'tăiată felii subțiri'),
        },
        { ingredient: 'milk', quantity: 150, unit: 'ml' },
        { ingredient: 'butter', quantity: 80, unit: 'g' },
        { ingredient: 'salt', quantity: 10, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'boil',
          text: t(
            'Cut the peeled potatoes into even pieces and boil in cold, salted water (8 g of the salt) for 15 to 20 minutes, until tender. Drain and let them steam dry for a minute.',
            'Taie cartofii curățați în bucăți egale și fierbe-i în apă rece cu sare (8 g din sare) 15-20 de minute, până se înmoaie. Scurge-i și lasă-i un minut să iasă aburul din ei.',
          ),
          timerSeconds: 1000,
        },
        {
          key: 'cabbage',
          text: t(
            'Meanwhile, melt 20 g of the butter in a pan, add the cabbage and a splash of water, cover and cook over medium heat for 6 to 8 minutes, until tender but still green.',
            'Între timp, topește 20 g din unt într-o tigaie, adaugă varza și un strop de apă, acoperă și gătește la foc mediu 6-8 minute, până se înmoaie, dar rămâne verde.',
          ),
          timerSeconds: 420,
        },
        {
          key: 'milk',
          text: t(
            'Warm the milk with the spring onions for 3 minutes, until the onions soften and flavour the milk.',
            'Încălzește laptele cu ceapa verde 3 minute, până se înmoaie ceapa și parfumează laptele.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'mash',
          text: t(
            'Mash the potatoes with the onion milk and 20 g of the butter until smooth. Fold in the cabbage and season with the remaining salt and the black pepper.',
            'Pasează cartofii cu laptele cu ceapă verde și 20 g de unt, până devin fini. Încorporează varza și condimentează cu sarea rămasă și piperul negru.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Pile into a warm dish, make a well in the centre and pour in the remaining 40 g of melted butter. Eat each forkful dipped in the butter.',
            'Pune într-un vas cald, fă o adâncitură în mijloc și toarnă înăuntru restul de 40 g de unt topit. Mănâncă fiecare îmbucătură înmuiată în unt.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'cabbage',
          text: t(
            'Do not overcook the cabbage; it should keep a little bite and its colour.',
            'Nu găti varza prea mult; trebuie să-și păstreze puțină fermitate și culoarea.',
          ),
        },
      ],
      nutritionNote: t(
        'The cabbage and spring onion bring fibre, vitamin C and vitamin K that a plain mash lacks, so this is the more balanced choice; the generous butter, including the pool in the middle, still adds a lot of saturated fat, and the salt adds up.',
        'Varza și ceapa verde aduc fibre, vitamina C și vitamina K, care lipsesc dintr-un piure simplu, deci e alegerea mai echilibrată; untul generos, inclusiv cel din mijloc, adaugă totuși multe grăsimi saturate, iar sarea se adună.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Omelette', 'Omletă'),
          reason: t(
            'Colcannon with an omelette on the side makes a hearty brunch.',
            'Colcannon cu o omletă alături face un brunch consistent.',
          ),
          principle: 'complement_flavour',
          recipe: 'omelette',
        },
        {
          kind: 'food',
          label: t('Boiled or fried bacon', 'Bacon fiert sau prăjit'),
          reason: t(
            'Salty, smoky bacon is the traditional partner for the mild mash.',
            'Baconul sărat și afumat e partenerul tradițional al piureului blând.',
          ),
          principle: 'regional_tradition',
          ingredient: 'bacon',
        },
        {
          kind: 'food',
          label: t('Sausages', 'Cârnați'),
          reason: t(
            'A hearty, savoury plate of bangers and mash.',
            'O farfurie consistentă și savuroasă, cu cârnați și piure.',
          ),
          principle: 'complement_flavour',
          ingredient: 'fresh-sausages',
        },
        {
          kind: 'food',
          label: t('Grain mustard', 'Muștar cu boabe'),
          reason: t(
            'Its tang cuts the butter and wakes up the cabbage.',
            'Gustul lui înțepător taie untul și trezește aroma verzei.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'mustard',
        },
        {
          kind: 'drink',
          label: t('Stout', 'Bere stout'),
          reason: t(
            'Its roasted bitterness balances the rich butter.',
            'Amăreala de malț prăjit echilibrează untul bogat.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'dark-beer',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hearty, warming dish for cold weather.',
            'Un preparat consistent și încălzitor pentru vremea rece.',
          ),
        },
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'Good with fried eggs or leftover ham for a filling late breakfast.',
            'Merge cu ouă ochiuri sau cu șuncă rămasă, pentru un mic dejun târziu și sățios.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'Heavy and hot; better kept for cooler weather.',
            'Greu și fierbinte; mai bine îl păstrezi pentru vremea mai răcoroasă.',
          ),
        },
      ],
    },
    {
      slug: 'potato-puree-romanian',
      cuisine: 'romanian',
      title: t(
        'Romanian piure with sautéed onion',
        'Piure de cartofi cu ceapă călită',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 35,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'potato',
          quantity: 800,
          unit: 'g',
          note: t('floury', 'făinoși'),
        },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('medium, finely diced', 'medii, tăiate mărunt'),
        },
        { ingredient: 'sunflower-oil', quantity: 30, unit: 'ml' },
        { ingredient: 'butter', quantity: 40, unit: 'g' },
        { ingredient: 'milk', quantity: 200, unit: 'ml' },
        { ingredient: 'salt', quantity: 10, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 0.5, unit: 'g' },
        { ingredient: 'nutmeg', quantity: 0.3, unit: 'g', optional: true },
        {
          ingredient: 'dill',
          quantity: 10,
          unit: 'g',
          optional: true,
          note: t('chopped', 'tocat mărunt'),
        },
      ],
      steps: [
        {
          key: 'boil',
          text: t(
            'Cut the peeled potatoes into even pieces and boil in cold, salted water (8 g of the salt) for 15 to 20 minutes, until tender. Drain and let them steam dry.',
            'Taie cartofii curățați în bucăți egale și fierbe-i în apă rece cu sare (8 g din sare) 15-20 de minute, până se înmoaie. Scurge-i și lasă să iasă aburul din ei.',
          ),
          timerSeconds: 1000,
        },
        {
          key: 'onion',
          text: t(
            'Meanwhile, heat the oil in a pan over medium-low heat and cook the onion for 10 to 12 minutes, stirring, until golden and soft but not dark.',
            'Între timp, încinge uleiul într-o tigaie la foc mic-mediu și călește ceapa 10-12 minute, amestecând, până devine aurie și moale, dar nu închisă la culoare.',
          ),
          timerSeconds: 660,
        },
        {
          key: 'mash',
          text: t(
            'Mash the potatoes, then stir in the butter and the warm milk, a little at a time, until the puree is smooth and creamy.',
            'Pasează cartofii, apoi amestecă untul și laptele cald, puțin câte puțin, până când piureul devine fin și cremos.',
          ),
        },
        {
          key: 'combine',
          text: t(
            'Fold in about two thirds of the onion with its oil. Season with the remaining salt, the pepper and the nutmeg.',
            'Încorporează aproximativ două treimi din ceapă, cu uleiul ei. Condimentează cu sarea rămasă, piperul și nucșoara.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Serve topped with the rest of the onion and the dill.',
            'Servește cu restul de ceapă deasupra și cu mărar.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'onion',
          text: t(
            'Cook the onion low and slow; if it browns too fast it turns bitter.',
            'Călește ceapa încet, la foc mic; dacă se rumenește prea repede, devine amară.',
          ),
        },
      ],
      nutritionNote: t(
        'The onion adds flavour and a little fibre, and with less butter it is lighter than the French version; the oil and butter still add fat and the salt adds up, so keep the portion moderate.',
        'Ceapa adaugă aromă și puține fibre, iar cu mai puțin unt e mai ușor decât varianta franțuzească; uleiul și untul adaugă totuși grăsime, iar sarea se adună, așa că nu exagera cu porția.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Chicken schnitzel', 'Șnițel de pui'),
          reason: t(
            'Piure with șnițel is the Romanian home classic.',
            'Piureul cu șnițel este un clasic al bucătăriei românești de acasă.',
          ),
          principle: 'regional_tradition',
          recipe: 'fried-chicken-snitel',
        },
        {
          kind: 'food',
          label: t('Grilled sausages', 'Cârnați la grătar'),
          reason: t(
            'Juicy, well-seasoned sausage gives the soft, mild puree a savoury counterpoint.',
            'Cârnații suculenți și bine condimentați dau piureului moale și blând un contrapunct savuros.',
          ),
          principle: 'complement_flavour',
          ingredient: 'fresh-sausages',
        },
        {
          kind: 'food',
          label: t('Meatballs (chiftele)', 'Chiftele'),
          reason: t(
            'Crisp, fried meatballs against the soft puree make a home-style plate.',
            'Chiftelele crocante, prăjite, lângă piureul moale fac o farfurie ca la mama acasă.',
          ),
          principle: 'contrast_texture',
        },
        {
          kind: 'food',
          label: t('Pickled cucumbers', 'Castraveți murați'),
          reason: t(
            'The sour crunch cuts through the fat of the oil and butter.',
            'Castraveții acri și crocanți echilibrează grăsimea din ulei și unt.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-cucumbers',
        },
        {
          kind: 'drink',
          label: t('Lager', 'Bere blondă'),
          reason: t(
            'Cold, crisp beer is the usual companion to grilled meat and mash.',
            'Berea rece și proaspătă e însoțitorul obișnuit al cărnii la grătar cu piure.',
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
            'Warm, filling home cooking for winter days.',
            'Mâncare caldă și sățioasă, de casă, pentru zilele de iarnă.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'avoid',
          reason: t(
            'Too heavy for a light lunch, especially with fried meat.',
            'Prea greu pentru un prânz ușor, mai ales cu carne prăjită.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Sautéed onion and fat can cause heartburn before bed.',
            'Ceapa călită și grăsimea pot provoca arsuri la stomac înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'potato-puree-riced',
      method: 'riced',
      title: t('Riced potato puree', 'Piure de cartofi pasat prin presă'),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 25,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'potato',
          quantity: 800,
          unit: 'g',
          note: t('floury', 'făinoși'),
        },
        { ingredient: 'butter', quantity: 70, unit: 'g' },
        { ingredient: 'milk', quantity: 120, unit: 'ml' },
        { ingredient: 'salt', quantity: 10, unit: 'g' },
        { ingredient: 'white-pepper', quantity: 0.5, unit: 'g' },
      ],
      steps: [
        {
          key: 'boil',
          text: t(
            'Peel the potatoes, cut them into even pieces and boil in cold, salted water (8 g of the salt) for 15 to 20 minutes, until a knife slides in easily.',
            'Curăță cartofii, taie-i în bucăți egale și fierbe-i în apă rece cu sare (8 g din sare) 15-20 de minute, până când cuțitul intră ușor.',
          ),
          timerSeconds: 1000,
        },
        {
          key: 'drain',
          text: t(
            'Drain and leave the potatoes in the colander for 2 minutes, until the steam stops rising.',
            'Scurge cartofii și lasă-i în strecurătoare 2 minute, până nu mai iese abur.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'rice',
          text: t(
            'Press the hot potatoes through a potato ricer, a little at a time, straight into the dry pot. Do not press the riced strands down.',
            'Trece cartofii fierbinți prin presa de cartofi, puțin câte puțin, direct în oala uscată. Nu presa firele astfel obținute.',
          ),
        },
        {
          key: 'fold',
          text: t(
            'Melt the butter into the warm milk. Fold it into the riced potato with a spatula, using as few strokes as possible, until just combined. Season with the remaining salt and the white pepper.',
            'Topește untul în laptele cald. Încorporează-l în cartofii pasați cu o spatulă, cu cât mai puține mișcări, doar până se omogenizează. Condimentează cu sarea rămasă și piperul alb.',
          ),
        },
      ],
      tips: [
        t(
          'Rice the potatoes while they are still hot; cold potatoes turn gluey however you crush them.',
          'Pasează cartofii cât sunt încă fierbinți; cei reci devin lipicioși oricum i-ai strivi.',
        ),
      ],
      stepTips: [
        {
          step: 'fold',
          text: t(
            'Over-stirring wakes up the starch; fold gently and stop as soon as it is smooth.',
            'Amestecatul prea mult trezește amidonul; încorporează ușor și oprește-te de îndată ce piureul e fin.',
          ),
        },
      ],
      nutritionNote: t(
        'Ricing gives a light, lump-free puree with less butter and milk than the French style, so it is a gentler choice on fat; it is still mostly starchy carbohydrate with little fibre or protein, and the butter still adds saturated fat.',
        'Pasarea prin presă dă un piure ușor, fără cocoloașe, cu mai puțin unt și lapte decât în stilul franțuzesc, deci are mai puțină grăsime; rămâne totuși mai ales amidon, cu puține fibre sau proteine, iar untul adaugă grăsimi saturate.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Pan-seared salmon', 'Somon rumenit în tigaie'),
          reason: t(
            'The light, fluffy puree lets delicate fish stay the star.',
            'Piureul ușor și pufos lasă peștele delicat să rămână vedeta farfuriei.',
          ),
          principle: 'complement_flavour',
          ingredient: 'salmon',
        },
        {
          kind: 'food',
          label: t('Roasted mushrooms', 'Ciuperci la cuptor'),
          reason: t(
            'Earthy, browned mushrooms against the airy puree add depth and texture.',
            'Ciupercile coapte, rumenite, lângă piureul pufos adaugă profunzime și textură.',
          ),
          principle: 'contrast_texture',
          ingredient: 'button-mushrooms',
        },
        {
          kind: 'food',
          label: t('Fresh parsley', 'Pătrunjel proaspăt'),
          reason: t(
            'A fresh green note over the pale puree.',
            'O notă verde și proaspătă peste piureul alb.',
          ),
          principle: 'complement_flavour',
          ingredient: 'parsley',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Crisp acidity suits both fish and the buttery mash.',
            'Aciditatea proaspătă se potrivește atât cu peștele, cât și cu piureul cu unt.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'white-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Soft and comforting when it is chilly.',
            'Moale și reconfortant când e răcoare.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Easy-to-digest carbohydrates to refill energy.',
            'Carbohidrați ușor de digerat pentru refacerea energiei.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'A hot, starchy side feels heavy in the heat.',
            'O garnitură caldă și bogată în amidon se simte grea pe căldură.',
          ),
        },
      ],
    },
    {
      slug: 'potato-puree-gratin-topped',
      method: 'gratin-topped',
      title: t(
        'Gratin-topped potato puree',
        'Piure de cartofi gratinat la cuptor',
      ),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 45,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'potato',
          quantity: 800,
          unit: 'g',
          note: t('floury', 'făinoși'),
        },
        { ingredient: 'butter', quantity: 60, unit: 'g' },
        { ingredient: 'milk', quantity: 150, unit: 'ml' },
        { ingredient: 'salt', quantity: 10, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 0.5, unit: 'g' },
        { ingredient: 'nutmeg', quantity: 0.3, unit: 'g' },
        {
          ingredient: 'gruyere',
          quantity: 80,
          unit: 'g',
          note: t('finely grated', 'ras mărunt'),
        },
        { ingredient: 'breadcrumbs', quantity: 20, unit: 'g' },
      ],
      steps: [
        {
          key: 'oven',
          text: t(
            'Heat the oven to 210 °C (190 °C fan). Butter a 20 by 25 cm baking dish with a little of the butter.',
            'Încinge cuptorul la 210 °C (190 °C cu ventilator). Unge cu puțin unt o tavă de copt de 20 pe 25 cm.',
          ),
        },
        {
          key: 'boil',
          text: t(
            'Cut the peeled potatoes into even pieces and boil in cold, salted water (8 g of the salt) for 15 to 20 minutes, until tender. Drain and let them steam dry.',
            'Taie cartofii curățați în bucăți egale și fierbe-i în apă rece cu sare (8 g din sare) 15-20 de minute, până se înmoaie. Scurge-i și lasă să iasă aburul din ei.',
          ),
          timerSeconds: 1000,
        },
        {
          key: 'mash',
          text: t(
            'Mash the potatoes with 40 g of the butter and the warm milk until smooth. Season with the remaining salt, the pepper and the nutmeg, and stir in half of the cheese.',
            'Pasează cartofii cu 40 g de unt și laptele cald, până devin fini. Condimentează cu sarea rămasă, piperul și nucșoara și amestecă jumătate din brânză.',
          ),
        },
        {
          key: 'top',
          text: t(
            'Spread the puree evenly in the dish and rake the surface with a fork to make ridges. Mix the remaining cheese with the breadcrumbs, scatter over the top and dot with the remaining butter.',
            'Întinde piureul uniform în tavă și trage cu furculița dungi pe suprafață. Amestecă restul de brânză cu pesmetul, presară amestecul deasupra și pune bucățele din untul rămas.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 20 to 25 minutes, until the top is golden and the edges bubble. Rest for 5 minutes before serving.',
            'Coace 20-25 de minute, până când suprafața devine aurie și marginile fac bule. Lasă 5 minute să se odihnească înainte de servire.',
          ),
          timerSeconds: 1350,
        },
      ],
      tips: [
        t(
          'Let the puree cool for a few minutes before spreading, so the topping sits on the surface and browns rather than sinking in.',
          'Lasă piureul să se răcorească câteva minute înainte să-l întinzi, ca stratul de deasupra să nu se scufunde în el și să se rumenească mai bine.',
        ),
      ],
      stepTips: [
        {
          step: 'top',
          text: t(
            'The ridges made with the fork brown and crisp up the most.',
            'Dungile făcute cu furculița se rumenesc și devin crocante cel mai tare.',
          ),
        },
      ],
      nutritionNote: t(
        'The cheese adds protein and calcium and the crisp top makes a small portion feel satisfying; it also adds saturated fat and a lot of salt, so go easy on extra salt in the puree and serve it with plain vegetables.',
        'Brânza adaugă proteine și calciu, iar crusta crocantă face ca o porție mică să sature; adaugă însă grăsimi saturate și multă sare, așa că folosește puțină sare în piure și servește-l cu legume simple.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Roast chicken', 'Pui la cuptor'),
          reason: t(
            'Crisp cheesy top and roast juices make a classic Sunday plate.',
            'Crusta crocantă cu brânză și sosul de la cuptor fac o farfurie clasică de duminică.',
          ),
          principle: 'complement_flavour',
          ingredient: 'whole-chicken',
        },
        {
          kind: 'food',
          label: t('Crunchy cabbage salad', 'Salată de varză'),
          reason: t(
            'A crunchy, tangy salad cuts through the cheese.',
            'O salată crocantă și acrișoară taie din bogăția brânzei.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'cabbage',
        },
        {
          kind: 'food',
          label: t('Pork chops', 'Cotlet de porc'),
          reason: t(
            'The golden crust echoes the browned meat.',
            'Crusta aurie se potrivește cu aroma cărnii rumenite.',
          ),
          principle: 'complement_flavour',
          ingredient: 'pork-chops',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Acidity refreshes the palate after the melted cheese.',
            'Aciditatea împrospătează gustul după brânza topită.',
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
            'Oven-hot and cheesy; ideal for cold weather.',
            'Fierbinte din cuptor și cu brânză; ideal pentru vremea rece.',
          ),
        },
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'Easy to prepare ahead and bake when guests arrive.',
            'Se pregătește ușor dinainte și se coace când sosesc oaspeții.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Cheese and butter make a heavy meal before sleep.',
            'Brânza și untul fac o masă grea înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
