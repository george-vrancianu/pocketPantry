import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Mâncare de mazăre base is the Romanian pea stew with chicken drumsticks.
// Each Variant is a full Recipe with its own lines, steps and guidance; the
// base's Recipe-level Tips are inherited unless a Variant hides them.
export const mancareDeMazare: BaseRecipeSeed = {
  slug: 'mancare-de-mazare',
  title: t(
    'Romanian pea stew with chicken (mâncare de mazăre)',
    'Mâncare de mazăre cu pui',
  ),
  servings: 4,
  prepMinutes: 15,
  cookMinutes: 90,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'chicken-drumsticks',
      quantity: 1000,
      unit: 'g',
      note: t('about 8 drumsticks, skin on', 'cam 8 copănele, cu piele'),
    },
    { ingredient: 'sunflower-oil', quantity: 45, unit: 'ml' },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('finely chopped', 'tocată mărunt'),
    },
    {
      ingredient: 'carrot',
      quantity: 200,
      unit: 'g',
      note: t('diced small', 'tăiați cubulețe'),
    },
    { ingredient: 'tomato-paste', quantity: 40, unit: 'g' },
    { ingredient: 'still-water', quantity: 0.6, unit: 'l' },
    { ingredient: 'frozen-peas', quantity: 500, unit: 'g' },
    {
      ingredient: 'sugar',
      quantity: 2,
      unit: 'g',
      optional: true,
      note: t('a pinch', 'un praf'),
    },
    { ingredient: 'salt', quantity: 10, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
    {
      ingredient: 'garlic',
      quantity: 10,
      unit: 'g',
      optional: true,
      note: t('2 cloves, crushed', '2 căței, striviți'),
    },
    {
      ingredient: 'dill',
      quantity: 20,
      unit: 'g',
      note: t('chopped', 'tocat'),
    },
  ],
  steps: [
    {
      key: 'season',
      text: t(
        'Pat the drumsticks dry with paper towel and season them with half of the salt and the pepper. Wash your hands, the board and anything else the raw chicken touched with hot soapy water before moving on.',
        'Șterge copănelele cu hârtie de bucătărie și presară-le cu jumătate din sare și cu piper. Spală-ți mâinile, tocătorul și tot ce a atins puiul crud cu apă caldă și detergent, înainte să treci mai departe.',
      ),
    },
    {
      key: 'heat-oil',
      text: t(
        'Heat the oil in a wide, heavy pot over medium-high heat for about 2 minutes, until it is hot and runs thin like water.',
        'Încinge uleiul într-o oală lată, cu fund gros, la foc mediu spre mare, cam 2 minute, până se încinge bine și curge subțire ca apa.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'brown',
      text: t(
        'Brown the drumsticks in two batches, turning them now and then, for about 7 minutes a batch, until golden all over, then lift them onto a plate.',
        'Rumenește copănelele în două tranșe, întorcându-le din când în când, cam 7 minute o tranșă, până se auresc pe toate părțile, apoi scoate-le într-o farfurie.',
      ),
      timerSeconds: 420,
    },
    {
      key: 'soften',
      text: t(
        'If there is more than about 2 tablespoons of fat in the pot, pour the extra off. Add the onion and carrot and cook over medium heat, stirring and scraping up the browned bits, for 8 minutes, until soft and the onion is translucent.',
        'Dacă în oală au rămas mai mult de 2 linguri de grăsime, varsă surplusul. Adaugă ceapa și morcovul și călește-le la foc mediu, amestecând și desprinzând bucățelele rumenite de pe fund, 8 minute, până se înmoaie și ceapa devine translucidă.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'paste',
      text: t(
        'Stir in the tomato paste and cook it for 1 minute, until it darkens a shade and smells sweet.',
        'Adaugă pasta de roșii și lasă-o 1 minut, până se închide puțin la culoare și miroase dulceag.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'water',
      text: t(
        'Take the pot off the heat for a moment so the fat is not roaring hot. Pour in the water slowly, stirring and scraping the bottom, until the paste has dissolved into a smooth sauce. Stand back, it spits a little at first.',
        'Ia oala de pe foc o clipă, ca grăsimea să nu mai sfârâie tare. Toarnă apa încet, amestecând și răzuind fundul, până se topește pasta și iese un sos fără cocoloașe. Stai puțin deoparte, la început mai stropește.',
      ),
    },
    {
      key: 'simmer-chicken',
      text: t(
        'Return the drumsticks to the pot with any juices from the plate. Bring to the boil over high heat, lower to a gentle simmer, cover and cook for 25 minutes.',
        'Pune copănelele înapoi în oală, împreună cu zeama adunată în farfurie. Adu la fierbere la foc mare, scade focul la o fierbere domoală, acoperă și lasă 25 de minute.',
      ),
      timerSeconds: 1500,
    },
    {
      key: 'peas',
      text: t(
        'Stir in the frozen peas straight from the freezer, the sugar if you use it and the remaining salt. Bring back to a simmer and cook uncovered, stirring now and then, for 15 minutes, until the peas are tender and the sauce coats the back of a spoon.',
        'Adaugă mazărea congelată direct din congelator, zahărul, dacă folosești, și restul de sare. Readu la fierbere și gătește fără capac, amestecând din când în când, 15 minute, până se înmoaie mazărea și sosul se prinde de dosul lingurii.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'check',
      text: t(
        'Check the thickest drumstick: the meat must reach 75 °C at the thickest part without touching the bone, show no pink and the juices must run clear. If not, cover and simmer 5 minutes more and check again.',
        'Verifică cel mai gros copănel: carnea trebuie să ajungă la 75 °C în partea cea mai groasă, fără să atingi osul, să nu mai fie roz, iar zeama să iasă limpede. Dacă nu, acoperă și mai fierbe 5 minute, apoi verifică din nou.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'finish',
      text: t(
        'Stir in the garlic, if using, and the dill, and simmer for 2 minutes. Taste and add salt or pepper if it needs it.',
        'Amestecă usturoiul, dacă folosești, și mărarul și mai fierbe 2 minute. Gustă și potrivește de sare și piper.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'rest',
      text: t(
        'Leave the pot off the heat for 5 minutes before serving, so the sauce settles and thickens a little more.',
        'Ia oala de pe foc și las-o 5 minute înainte de servit, ca sosul să se așeze și să se îngroașe puțin.',
      ),
      timerSeconds: 300,
    },
  ],
  tips: [
    t(
      'For a fasting-day (vegan) version, leave out the chicken: cook the onion and carrot in 60 ml of oil, stir in the paste, then add only 0.4 l of water off the heat as above, with the peas, the sugar and all of the salt. Simmer uncovered for about 15 minutes, until the peas are tender and the sauce is thick, then finish with the garlic and dill. Skip the seasoning, browning, chicken-simmering and doneness-check steps.',
      'Pentru zilele de post, renunță la pui: călește ceapa și morcovul în 60 ml de ulei, adaugă pasta, apoi doar 0,4 l de apă, luată de pe foc ca mai sus, împreună cu mazărea, zahărul și toată sarea. Fierbe fără capac cam 15 minute, până se înmoaie mazărea și sosul se leagă, apoi termină cu usturoiul și mărarul. Sari peste pașii cu asezonatul, rumenirea, fierberea puiului și verificarea gătirii.',
    ),
    t(
      'Add the peas late: boiled for a long time they turn grey and mushy instead of sweet and tender.',
      'Pune mazărea târziu: fiartă mult timp se face cenușie și păstoasă, în loc să rămână dulce și fragedă.',
    ),
    t(
      'It tastes even better the next day. Cool leftovers within 2 hours, keep them in the fridge for up to 3 days and reheat until steaming hot all the way through.',
      'A doua zi e și mai bună. Răcește rămășițele în cel mult 2 ore, ține-le la frigider până la 3 zile și încălzește-le până fierb bine în toată oala.',
    ),
  ],
  stepTips: [
    {
      step: 'brown',
      text: t(
        'Do not crowd the pot: drumsticks packed together steam and turn grey instead of browning, and the browned bits on the bottom are what flavour the sauce.',
        'Nu înghesui copănelele în oală: înghesuite, se înăbușă în abur și rămân cenușii în loc să se rumenească, iar bucățelele rumenite de pe fund dau gustul sosului.',
      ),
    },
    {
      step: 'finish',
      text: t(
        'Add the dill off a rolling boil: it keeps its colour and fresh smell much better than when it cooks for long.',
        'Pune mărarul când fierberea s-a domolit: își păstrează culoarea și mirosul proaspăt mult mai bine decât dacă fierbe mult.',
      ),
    },
  ],
  nutritionNote: t(
    'Peas bring fibre and plant protein, and the chicken adds more protein, so one bowl is filling. The skin-on drumsticks and the frying oil add fat, and the salt can add up, so season gradually; serve it with a salad or some bread and not a pile of starch.',
    'Mazărea aduce fibre și proteine vegetale, iar puiul adaugă și mai multe proteine, așa că o porție satură bine. Copanelele cu piele și uleiul de prăjit aduc grăsime, iar sarea se adună repede, așa că sărează treptat; servește-o cu salată sau cu puțină pâine, nu cu o grămadă de garnitură cu amidon.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Fresh bread', 'Pâine proaspătă'),
      reason: t(
        'A thick slice mops up the tomato and dill sauce, so none of it is left on the plate.',
        'O felie groasă șterge sosul cu roșii și mărar din farfurie, așa că nu se pierde nimic.',
      ),
      principle: 'complement_flavour',
      ingredient: 'bread',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sharp, salty crunch cuts through the soft, tomato-rich stew.',
        'Crocanțeala lor acră și sărată taie din moliciunea mâncării cu roșii.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'drink',
      label: t('Dry white wine', 'Vin alb sec'),
      reason: t(
        'Its acidity refreshes the palate between spoonfuls of the rich sauce.',
        'Aciditatea lui împrospătează gustul între lingurile de sos bogat.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'white-wine',
    },
    {
      kind: 'drink',
      label: t('Sparkling water', 'Apă minerală'),
      reason: t(
        'The bubbles clear the palate and keep a hearty stew from feeling heavy.',
        'Bulele curăță gustul și fac o mâncare consistentă să se simtă mai ușoară.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'sparkling-water',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot, thick stew warms you up on a cold day.',
        'O mâncare caldă și groasă te încălzește într-o zi rece.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Chicken and peas give protein, and bread alongside brings carbohydrates.',
        'Puiul și mazărea dau proteine, iar pâinea alături aduce carbohidrați.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'A long-simmered hot stew is heavy when it is already warm outside.',
        'O mâncare fierbinte, gătită îndelung, cade greu când afară e deja cald.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A big bowl of stew just before bed can sit heavy.',
        'Un castron mare de mâncare chiar înainte de culcare poate cădea greu.',
      ),
    },
  ],
  variants: [
    {
      slug: 'mancare-de-mazare-middle-eastern',
      cuisine: 'middle-eastern',
      title: t(
        'Bazella (Lebanese pea and beef stew)',
        'Bazella (tocăniță libaneză de mazăre cu vită)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 135,
      difficulty: 'easy',
      hideBaseTips: [0],
      lines: [
        {
          ingredient: 'beef-for-stew',
          quantity: 700,
          unit: 'g',
          note: t('cut in 3 cm cubes', 'tăiată cuburi de 3 cm'),
        },
        { ingredient: 'olive-oil', quantity: 60, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('finely chopped', 'tocată mărunt'),
        },
        { ingredient: 'seven-spice', quantity: 4, unit: 'g' },
        { ingredient: 'tomato-paste', quantity: 30, unit: 'g' },
        { ingredient: 'canned-tomatoes', quantity: 200, unit: 'g' },
        { ingredient: 'still-water', quantity: 0.6, unit: 'l' },
        {
          ingredient: 'carrot',
          quantity: 250,
          unit: 'g',
          note: t('in 2 cm chunks', 'tăiați bucăți de 2 cm'),
        },
        { ingredient: 'frozen-peas', quantity: 400, unit: 'g' },
        {
          ingredient: 'garlic',
          quantity: 20,
          unit: 'g',
          note: t('4 cloves, crushed', '4 căței, striviți'),
        },
        {
          ingredient: 'coriander',
          quantity: 30,
          unit: 'g',
          note: t('fresh, chopped', 'proaspăt, tocat'),
        },
        { ingredient: 'salt', quantity: 10, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'season',
          text: t(
            'Pat the beef dry with paper towel and season it with half of the salt and the pepper.',
            'Șterge carnea de vită cu hârtie de bucătărie și presară-o cu jumătate din sare și cu piper.',
          ),
        },
        {
          key: 'heat-oil',
          text: t(
            'Heat 45 ml of the oil in a wide, heavy pot over medium-high heat for about 2 minutes, until it is hot and runs thin like water.',
            'Încinge 45 ml din ulei într-o oală lată, cu fund gros, la foc mediu spre mare, cam 2 minute, până se încinge bine și curge subțire ca apa.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'brown',
          text: t(
            'Brown the beef in three batches, turning the cubes, for about 10 minutes in all, until deep brown on all sides, then lift them onto a plate.',
            'Rumenește carnea în trei tranșe, întorcând cuburile, cam 10 minute în total, până prind culoare închisă pe toate părțile, apoi scoate-le într-o farfurie.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'onion',
          text: t(
            'Add the onion to the fat in the pot and cook over medium heat, scraping up the browned bits, for 6 minutes, until soft and golden at the edges.',
            'Pune ceapa în grăsimea din oală și călește-o la foc mediu, desprinzând bucățelele rumenite de pe fund, 6 minute, până se înmoaie și se aurește pe margini.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'spice',
          text: t(
            'Stir in the seven spice and the tomato paste and cook for 1 minute, until the paste darkens a shade and the spice smells warm.',
            'Adaugă amestecul de șapte condimente și pasta de roșii și gătește 1 minut, până se închide puțin pasta și condimentele miros cald.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'simmer-beef',
          text: t(
            'Return the beef with its juices. Add the canned tomatoes and the water, bring to the boil, skim off the foam, then lower to a gentle simmer, cover and cook for 1 hour 15 minutes, until the beef is nearly tender.',
            'Pune carnea la loc, cu zeama ei. Adaugă roșiile conservate și apa, adu la fierbere, ia spuma, apoi scade focul la o fierbere domoală, acoperă și lasă 1 oră și 15 minute, până carnea e aproape fragedă.',
          ),
          timerSeconds: 4500,
        },
        {
          key: 'carrots',
          text: t(
            'Add the carrots and the remaining salt and simmer, covered, for 20 minutes, until a knife slides into a carrot easily.',
            'Adaugă morcovii și restul de sare și fierbe acoperit 20 de minute, până intră ușor cuțitul într-un morcov.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'tender-check',
          text: t(
            'Press a cube of beef with a fork: it should be tender. If it is still firm, cover and simmer 10 to 15 minutes more and check again before adding the peas.',
            'Apasă un cub de carne cu furculița: trebuie să fie fraged. Dacă e încă tare, acoperă și mai fierbe 10-15 minute, apoi verifică din nou înainte să pui mazărea.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'peas',
          text: t(
            'Add the frozen peas and simmer uncovered for 10 minutes, until the peas are tender and the sauce has reduced and thickened a little.',
            'Adaugă mazărea congelată și fierbe fără capac 10 minute, până se înmoaie mazărea și sosul scade și se îngroașe puțin.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'garlic-coriander',
          text: t(
            'In a small pan, warm the remaining 15 ml of oil over medium heat, add the garlic and most of the coriander, and stir for 1 minute, until fragrant but not browned. Stir it into the stew.',
            'Într-o tigaie mică încălzește restul de 15 ml de ulei la foc mediu, adaugă usturoiul și cea mai mare parte din coriandru și amestecă 1 minut, până miroase frumos, fără să se rumenească. Toarnă amestecul în tocăniță.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'serve',
          text: t(
            'Simmer for 2 minutes more, taste and adjust the salt, and serve scattered with the coriander you kept back.',
            'Mai fierbe 2 minute, gustă și potrivește de sare și servește presărat cu coriandrul rămas.',
          ),
          timerSeconds: 120,
        },
      ],
      tips: [
        t(
          'Lamb shoulder in cubes works the same way: use the same weight and cooking times.',
          'Umărul de miel tăiat cuburi merge la fel: ia aceeași cantitate și păstrează timpii de gătire.',
        ),
      ],
      stepTips: [
        {
          step: 'garlic-coriander',
          text: t(
            'Fry the garlic only until fragrant: browned garlic turns bitter and spoils the whole pot.',
            'Prăjește usturoiul doar până miroase frumos: usturoiul rumenit se amărăște și strică toată oala.',
          ),
        },
      ],
      nutritionNote: t(
        'Beef gives protein, and the peas and carrots add fibre and make the dish more filling. The beef adds saturated fat, the olive oil is mostly unsaturated, and the salt can add up; serve it with a modest portion of rice and a fresh salad.',
        'Vita aduce proteine, iar mazărea și morcovii adaugă fibre și fac mâncarea mai săturătoare. Vita aduce grăsimi saturate, uleiul de măsline are mai ales grăsimi nesaturate, iar sarea se adună repede; servește-o cu o porție moderată de orez și cu o salată proaspătă.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t(
            "Lebanese vermicelli rice (riz bi sh'arieh)",
            "Orez libanez cu fidea (riz bi sh'arieh)",
          ),
          reason: t(
            'Bazella is often eaten over vermicelli rice, which soaks up the tomato and spice sauce.',
            'Bazella se mănâncă adesea peste orez cu fidea, care absoarbe sosul cu roșii și condimente.',
          ),
          principle: 'regional_tradition',
          recipe: 'rice-pilaf-middle-eastern',
        },
        {
          kind: 'food',
          label: t('Plain yogurt', 'Iaurt simplu'),
          reason: t(
            'Its cool tang balances the warm spices and the rich beef.',
            'Aciditatea lui rece echilibrează condimentele calde și carnea de vită.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'yogurt',
        },
        {
          kind: 'food',
          label: t('Lemon wedges', 'Felii de lămâie'),
          reason: t(
            'A squeeze of lemon brightens the stew and cuts through the richness.',
            'Un strop de lămâie înviorează tocănița și taie din bogăția ei.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'lemon',
        },
        {
          kind: 'drink',
          label: t('Black tea', 'Ceai negru'),
          reason: t(
            'Its slight bitterness balances the fat of the beef.',
            'Amăreala lui ușoară echilibrează grăsimea cărnii de vită.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'tea',
        },
        {
          kind: 'drink',
          label: t('Sparkling water', 'Apă minerală'),
          reason: t(
            'The bubbles clear the palate between spoonfuls of the spiced stew.',
            'Bulele curăță gustul între lingurile de tocăniță condimentată.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'sparkling-water',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A long-simmered, warmly spiced stew is a good way to warm up on a cold day.',
            'O tocăniță gătită îndelung și condimentată cald te încălzește bine într-o zi rece.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Beef and peas give protein, and the rice alongside brings carbohydrates.',
            'Vita și mazărea dau proteine, iar orezul alături aduce carbohidrați.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'avoid',
          reason: t(
            'It is a heavy, slow-cooked meal, more than a light lunch calls for.',
            'E o mâncare grea, gătită lent, mai mult decât cere un prânz ușor.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Rich beef stew late at night can sit heavy before bed.',
            'O tocăniță bogată de vită seara târziu poate cădea greu înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'mancare-de-mazare-indian',
      cuisine: 'indian',
      title: t(
        'Matar paneer (Indian peas and paneer curry)',
        'Matar paneer (mazăre cu paneer în sos indian)',
      ),
      servings: 4,
      prepMinutes: 25,
      cookMinutes: 45,
      difficulty: 'easy',
      hideBaseTips: [0],
      lines: [
        { ingredient: 'paneer', quantity: 250, unit: 'g' },
        { ingredient: 'frozen-peas', quantity: 250, unit: 'g' },
        { ingredient: 'clarified-butter', quantity: 40, unit: 'g' },
        { ingredient: 'cumin-seeds', quantity: 3, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('finely chopped', 'tocată mărunt'),
        },
        {
          ingredient: 'ginger',
          quantity: 15,
          unit: 'g',
          note: t('peeled, finely grated', 'curățat, ras fin'),
        },
        {
          ingredient: 'garlic',
          quantity: 15,
          unit: 'g',
          note: t('3 cloves, finely grated', '3 căței, rași fin'),
        },
        {
          ingredient: 'hot-pepper',
          quantity: 1,
          unit: 'pcs',
          note: t('green, finely chopped', 'verde, tocat mărunt'),
        },
        {
          ingredient: 'tomato',
          quantity: 400,
          unit: 'g',
          note: t('ripe, chopped', 'coapte, tocate'),
        },
        { ingredient: 'turmeric', quantity: 2, unit: 'g' },
        { ingredient: 'chili-powder', quantity: 2, unit: 'g' },
        { ingredient: 'ground-coriander', quantity: 5, unit: 'g' },
        { ingredient: 'still-water', quantity: 0.2, unit: 'l' },
        { ingredient: 'garam-masala', quantity: 3, unit: 'g' },
        { ingredient: 'salt', quantity: 5, unit: 'g' },
        {
          ingredient: 'whipping-cream',
          quantity: 50,
          unit: 'ml',
          optional: true,
        },
        {
          ingredient: 'coriander',
          quantity: 15,
          unit: 'g',
          note: t('fresh, chopped', 'proaspăt, tocat'),
        },
      ],
      steps: [
        {
          key: 'soak',
          text: t(
            'Cut the paneer into 2 cm cubes and leave them in a bowl of hot water for 10 minutes, so they turn soft and spongy. Drain just before using.',
            'Taie paneerul cuburi de 2 cm și lasă-l 10 minute într-un bol cu apă fierbinte, ca să se înmoaie și să devină buretos. Scurge-l chiar înainte de folosit.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'temper',
          text: t(
            'Melt the ghee in a wide pan over medium heat. Add the cumin seeds and let them sizzle for about 30 seconds, until they smell toasted and darken a shade.',
            'Topește untul clarificat într-o tigaie lată, la foc mediu. Adaugă semințele de chimion și lasă-le să sfârâie cam 30 de secunde, până miros a prăjit și se închid puțin la culoare.',
          ),
          timerSeconds: 30,
        },
        {
          key: 'onion',
          text: t(
            'Add the onion and cook over medium heat, stirring often, for 10 minutes, until deep golden brown at the edges.',
            'Adaugă ceapa și gătește-o la foc mediu, amestecând des, 10 minute, până se rumenește bine pe margini.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'aromatics',
          text: t(
            'Stir in the ginger, garlic and green chilli and cook for 1 minute, until the raw smell is gone.',
            'Adaugă ghimbirul, usturoiul și ardeiul iute verde și gătește 1 minut, până dispare mirosul de crud.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'spices',
          text: t(
            'Add the turmeric, chilli powder and ground coriander and stir for 30 seconds. Add the tomatoes right away, so the spices do not burn.',
            'Adaugă turmericul, ardeiul iute măcinat și coriandrul măcinat și amestecă 30 de secunde. Pune imediat roșiile, ca mirodeniile să nu se ardă.',
          ),
          timerSeconds: 30,
        },
        {
          key: 'tomato',
          text: t(
            'Add the salt and cook the tomatoes, stirring now and then, for 10 minutes, until they break down into a thick paste and the ghee separates at the edges.',
            'Adaugă sarea și gătește roșiile, amestecând din când în când, 10 minute, până se desfac într-o pastă groasă și untul clarificat iese la margini.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'sauce',
          text: t(
            'Pour in the water and simmer for 5 minutes. For a smooth sauce, blend it in the pan with a stick blender; for a rustic one, leave it chunky.',
            'Toarnă apa și fierbe 5 minute. Pentru un sos fin, mixează-l în tigaie cu un blender vertical; pentru unul rustic, lasă-l cu bucățele.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'peas-paneer',
          text: t(
            'Add the frozen peas and the drained paneer. Simmer gently for 5 minutes, until the peas are tender and the paneer is hot all the way through. Stir carefully, so the cubes stay whole.',
            'Adaugă mazărea congelată și paneerul scurs. Fierbe domol 5 minute, până se înmoaie mazărea și paneerul se încălzește bine în toată bucata. Amestecă cu grijă, ca cuburile să rămână întregi.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'finish',
          text: t(
            'Off the heat, stir in the garam masala and the cream, if using, and scatter with the fresh coriander. Taste and adjust the salt.',
            'De pe foc, amestecă garam masala și frișca lichidă, dacă folosești, și presară coriandrul proaspăt. Gustă și potrivește de sare.',
          ),
        },
      ],
      tips: [
        t(
          'Do not boil the paneer hard: it turns rubbery. A gentle simmer just to heat it through is enough.',
          'Nu fierbe paneerul tare: se face cauciucat. Ajunge o fierbere domoală, doar cât să se încălzească.',
        ),
      ],
      stepTips: [
        {
          step: 'tomato',
          text: t(
            'Wait for the ghee to separate at the edges: under-cooked tomato leaves the sauce sharp and sour.',
            'Așteaptă până iese untul clarificat la margini: roșiile nefierte destul lasă sosul ascuțit și acru.',
          ),
        },
        {
          step: 'finish',
          text: t(
            'Garam masala goes in at the end because its fragrance fades with long cooking, while the earlier spices need the heat to lose their raw taste.',
            'Garam masala se pune la final pentru că aroma ei se pierde la gătit îndelungat, în timp ce mirodeniile de la început au nevoie de căldură ca să-și piardă gustul de crud.',
          ),
        },
      ],
      nutritionNote: t(
        'Paneer and peas give a good amount of protein, and the peas add fibre. The ghee, the paneer and the optional cream add saturated fat, and the salt can add up; use the cream sparingly and serve with rice or naan in a measured portion.',
        'Paneerul și mazărea aduc o cantitate bună de proteine, iar mazărea adaugă fibre. Untul clarificat, paneerul și frișca lichidă opțională aduc grăsimi saturate, iar sarea se adună; folosește frișca cu măsură și servește cu orez sau naan într-o porție potrivită.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Basmati rice', 'Orez basmati'),
          reason: t(
            'Fluffy, plain rice soaks up the spiced tomato sauce.',
            'Orezul simplu, pufos, absoarbe sosul de roșii cu condimente.',
          ),
          principle: 'complement_flavour',
          ingredient: 'basmati-rice',
        },
        {
          kind: 'food',
          label: t('Naan', 'Naan'),
          reason: t(
            'Soft, warm flatbread is for scooping up the sauce.',
            'Pâinea plată, moale și caldă, e bună pentru a aduna sosul.',
          ),
          principle: 'complement_flavour',
          ingredient: 'naan',
        },
        {
          kind: 'food',
          label: t('Plain yogurt', 'Iaurt simplu'),
          reason: t(
            'A cool spoonful calms the heat of the chilli.',
            'O lingură rece de iaurt domolește iuțeala ardeiului.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'yogurt',
        },
        {
          kind: 'drink',
          label: t('Cold beer', 'Bere rece'),
          reason: t(
            'Cold, light beer refreshes the palate between spicy bites.',
            'O bere rece și ușoară împrospătează gustul între îmbucăturile picante.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
        {
          kind: 'drink',
          label: t('Black tea', 'Ceai negru'),
          reason: t(
            'Its slight bitterness balances the rich, creamy sauce.',
            'Amăreala lui ușoară echilibrează sosul bogat și cremos.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Warming spices and a hot, thick sauce suit a cold day.',
            'Condimentele calde și sosul fierbinte și gros se potrivesc într-o zi rece.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Paneer and peas give protein, and rice or naan brings carbohydrates.',
            'Paneerul și mazărea dau proteine, iar orezul sau naanul aduc carbohidrați.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Chilli and a rich, ghee-based sauce late at night can sit heavy before bed.',
            'Ardeiul iute și un sos bogat în unt clarificat seara târziu pot cădea greu înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
