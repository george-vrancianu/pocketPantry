import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Ciorbă de legume base is the Romanian soured vegetable soup, a dish for
// fasting days: no meat, dairy or egg. Diced root vegetables softened in oil,
// then green vegetables, soured with borș and finished with fresh lovage. Each
// Variant is a full Recipe with its own lines, steps and guidance; the base's
// Recipe-level Tips are about borș and the dice, so both Variants hide them.
export const ciorbaDeLegume: BaseRecipeSeed = {
  slug: 'ciorba-de-legume',
  title: t(
    'Romanian sour vegetable soup with lovage (ciorbă de legume)',
    'Ciorbă de legume cu leuștean',
  ),
  servings: 6,
  prepMinutes: 25,
  cookMinutes: 60,
  difficulty: 'easy',
  lines: [
    { ingredient: 'sunflower-oil', quantity: 60, unit: 'ml' },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('finely diced', 'tăiate mărunt'),
    },
    {
      ingredient: 'carrot',
      quantity: 200,
      unit: 'g',
      note: t('diced small', 'tăiați cubulețe'),
    },
    {
      ingredient: 'parsley-root',
      quantity: 60,
      unit: 'g',
      note: t('diced small', 'tăiată cubulețe'),
    },
    {
      ingredient: 'parsnip',
      quantity: 60,
      unit: 'g',
      note: t('diced small', 'tăiat cubulețe'),
    },
    {
      ingredient: 'celeriac',
      quantity: 100,
      unit: 'g',
      note: t('diced small', 'tăiată cubulețe'),
    },
    {
      ingredient: 'bell-pepper',
      quantity: 1,
      unit: 'pcs',
      note: t('red, diced', 'roșu, tăiat cubulețe'),
    },
    {
      ingredient: 'still-water',
      quantity: 2.5,
      unit: 'l',
    },
    {
      ingredient: 'potato',
      quantity: 0.4,
      unit: 'kg',
      note: t('peeled, diced', 'curățați, tăiați cubulețe'),
    },
    {
      ingredient: 'green-beans',
      quantity: 150,
      unit: 'g',
      note: t('cut into 2 cm lengths', 'tăiate bucățele de 2 cm'),
    },
    {
      ingredient: 'cauliflower',
      quantity: 150,
      unit: 'g',
      optional: true,
      note: t('small florets', 'buchețele mici'),
    },
    {
      ingredient: 'zucchini',
      quantity: 1,
      unit: 'pcs',
      note: t('about 200 g, diced', 'cam 200 g, tăiat cubulețe'),
    },
    { ingredient: 'frozen-peas', quantity: 100, unit: 'g' },
    {
      ingredient: 'tomato',
      quantity: 250,
      unit: 'g',
      note: t('ripe, diced', 'coapte, tăiate cubulețe'),
    },
    { ingredient: 'tomato-paste', quantity: 30, unit: 'g' },
    {
      ingredient: 'ciorba-sour-base',
      quantity: 750,
      unit: 'ml',
      note: t(
        'borș: 500 ml first, up to 250 ml more, to taste',
        'borș: întâi 500 ml, apoi până la 250 ml în plus, după gust',
      ),
    },
    {
      ingredient: 'lovage',
      quantity: 20,
      unit: 'g',
      note: t('fresh, chopped', 'proaspăt, tocat'),
    },
    {
      ingredient: 'parsley',
      quantity: 20,
      unit: 'g',
      note: t('chopped', 'tocat'),
    },
    {
      ingredient: 'salt',
      quantity: 15,
      unit: 'g',
      note: t(
        '10 g with the water, the rest at the end to taste',
        '10 g la apă, restul la final, după gust',
      ),
    },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
    {
      ingredient: 'hot-pepper',
      quantity: 2,
      unit: 'pcs',
      optional: true,
      note: t('fresh, to serve', 'proaspeți, pentru servit'),
    },
  ],
  steps: [
    {
      key: 'prep',
      text: t(
        'Peel and dice the onions, carrot, parsley root, parsnip, celeriac and potatoes, dice the pepper, cut the beans, and dice the tomatoes. Keep the potatoes in cold water until needed.',
        'Curăță și taie cubulețe ceapa, morcovul, rădăcina de pătrunjel, păstârnacul, țelina și cartofii, taie ardeiul cubulețe, taie fasolea verde și taie roșiile cubulețe. Ține cartofii în apă rece până îi folosești.',
      ),
    },
    {
      key: 'soften',
      text: t(
        'Heat the oil in a pot of at least 6 l over medium-low heat. Add the onions, carrot, parsley root, parsnip, celeriac and pepper and cook for 10 minutes, stirring often, until soft and shiny but not browned.',
        'Încinge uleiul într-o oală de cel puțin 6 l la foc mic spre mediu. Adaugă ceapa, morcovul, rădăcina de pătrunjel, păstârnacul, țelina și ardeiul și călește 10 minute, amestecând des, până se înmoaie și devin lucioase, fără să se rumenească.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'water',
      text: t(
        'Pour in the 2.5 l of water, add 10 g of the salt and bring to the boil over high heat, about 10 minutes.',
        'Toarnă cei 2,5 l de apă, adaugă 10 g din sare și adu la fierbere la foc mare, cam 10 minute.',
      ),
    },
    {
      key: 'hard-veg',
      text: t(
        'Drain the potatoes and add them with the green beans and the cauliflower, if using. Simmer gently for 15 minutes, until the potatoes are nearly tender.',
        'Scurge cartofii și adaugă-i în oală împreună cu fasolea verde și cu conopida, dacă folosești. Fierbe domol 15 minute, până când cartofii sunt aproape fragezi.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'soft-veg',
      text: t(
        'Add the zucchini and the frozen peas and simmer for 8 minutes, until the zucchini is tender.',
        'Adaugă dovlecelul și mazărea congelată și fierbe 8 minute, până când dovlecelul e fraged.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'tomatoes',
      text: t(
        'Stir in the tomatoes and the tomato paste and simmer for 5 minutes, until the tomatoes have softened.',
        'Amestecă roșiile și pasta de tomate și fierbe 5 minute, până se înmoaie roșiile.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'sour',
      text: t(
        'In a small pot, bring 500 ml of the borș to the boil, then pour it into the soup. Simmer for 3 minutes and taste. If it needs more, bring some of the remaining 250 ml to the boil the same way and add it a little at a time until the soup is pleasantly sour.',
        'Într-o oală mică, adu la fierbere 500 ml din borș, apoi toarnă-l în ciorbă. Fierbe 3 minute și gustă. Dacă mai trebuie, fierbe în același fel o parte din cei 250 ml rămași și adaug-o puțin câte puțin, până când ciorba e plăcut de acrișoară.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'finish',
      text: t(
        'Take the pot off the heat. Stir in the lovage, the parsley and the ground black pepper, taste, and add salt only if it needs it. Leave to rest for 5 minutes.',
        'Ia oala de pe foc. Amestecă leușteanul, pătrunjelul și piperul măcinat, gustă și adaugă sare doar dacă mai trebuie. Lasă ciorba să se odihnească 5 minute.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'serve',
      text: t(
        'Ladle into hot bowls. Put the fresh hot peppers on the table, with bread, for those who like them.',
        'Servește în boluri calde. Pune pe masă ardeii iuți proaspeți și pâine, pentru cine îi vrea.',
      ),
    },
    {
      key: 'store',
      text: t(
        'Cool the leftovers and put them in the fridge within 2 hours. Keep for up to 3 to 4 days and reheat until boiling.',
        'Răcește ce rămâne și pune-l la frigider în cel mult 2 ore. Se păstrează 3-4 zile; încălzește-l până fierbe.',
      ),
    },
  ],
  tips: [
    t(
      'The soup is even better the next day, once the lovage and the borș have settled in. Reheat it until boiling.',
      'Ciorba e și mai bună a doua zi, după ce se așază leușteanul și borșul. Încălzește-o până fierbe.',
    ),
    t(
      'Borș differs a lot from one brand or home batch to the next. Add it in two goes and taste after each, because you cannot take the sourness back out.',
      'Borșul diferă mult de la un producător sau de la o rețetă de casă la alta. Pune-l în două rânduri și gustă după fiecare, pentru că acreala nu se mai scoate.',
    ),
  ],
  stepTips: [
    {
      step: 'soften',
      text: t(
        'Keep the heat low so the vegetables sweeten instead of browning; a browned base makes the soup taste heavy.',
        'Ține focul mic, ca legumele să se îndulcească, nu să se rumenească; o bază rumenită face ciorba grea la gust.',
      ),
    },
    {
      step: 'finish',
      text: t(
        'Add the lovage off the heat: boiled for long it turns bitter and loses its scent.',
        'Pune leușteanul după ce iei oala de pe foc: fiert mult se amărăște și își pierde mirosul.',
      ),
    },
  ],
  nutritionNote: t(
    'Many vegetables for little fat, so it brings fibre and vitamins and is light; the oil is mostly unsaturated. It has little protein, so serve it with bread or follow it with beans or a grain. The borș and the salt add up to a salty bowl, so season at the end.',
    'Multe legume cu puțină grăsime, deci aduce fibre și vitamine și e ușoară; uleiul e în mare parte nesaturat. Are puține proteine, așa că servește-o cu pâine sau urmeaz-o cu fasole sau cu un fel cu cereale. Borșul și sarea fac un castron destul de sărat, așa că sărează la final.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Fresh bread', 'Pâine proaspătă'),
      reason: t(
        'A crusty slice soaks up the sour broth and adds the starch and protein that the soup lacks.',
        'O felie cu crustă se îmbibă cu zeama acrișoară și adaugă amidonul și proteinele care lipsesc din ciorbă.',
      ),
      principle: 'contrast_texture',
      ingredient: 'bread',
    },
    {
      kind: 'food',
      label: t('Raw red onion', 'Ceapă roșie crudă'),
      reason: t(
        'A bite of crunchy raw onion sharpens a soft, sweet vegetable broth.',
        'O îmbucătură de ceapă crudă și crocantă dă un contrast ascuțit unei supe moi și dulci de legume.',
      ),
      principle: 'contrast_texture',
      ingredient: 'red-onion',
    },
    {
      kind: 'food',
      label: t(
        'Sour cream (outside fasting days)',
        'Smântână (în afara zilelor de post)',
      ),
      reason: t(
        'A spoonful rounds off the sourness of the borș; leave it out when fasting.',
        'O lingură rotunjește acreala borșului; las-o deoparte când ții post.',
      ),
      principle: 'complement_flavour',
      ingredient: 'sour-cream',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A big bowl of hot, sour soup warms you through.',
        'Un castron mare de ciorbă fierbinte și acrișoară te încălzește.',
      ),
    },
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'Light and full of vegetables; add bread to make it filling.',
        'Ușoară și plină de legume; adaugă pâine ca să te sature.',
      ),
    },
  ],
  variants: [
    {
      slug: 'ciorba-de-legume-ukrainian',
      cuisine: 'ukrainian',
      title: t(
        'Lenten borshch (Ukrainian beetroot, cabbage and bean soup)',
        'Borș ucrainean de post (supă de sfeclă roșie, varză și fasole)',
      ),
      servings: 6,
      prepMinutes: 20,
      cookMinutes: 50,
      difficulty: 'medium',
      hideBaseTips: [0, 1],
      lines: [
        {
          ingredient: 'beetroot',
          quantity: 400,
          unit: 'g',
          note: t(
            'peeled, cut into matchsticks',
            'curățată, tăiată fâșii subțiri',
          ),
        },
        {
          ingredient: 'sunflower-oil',
          quantity: 60,
          unit: 'ml',
          note: t(
            '30 ml for the beetroot, 30 ml for the carrot and onion',
            '30 ml pentru sfeclă, 30 ml pentru morcov și ceapă',
          ),
        },
        {
          ingredient: 'vinegar',
          quantity: 20,
          unit: 'ml',
          note: t('keeps the beetroot red', 'păstrează culoarea sfeclei'),
        },
        { ingredient: 'sugar', quantity: 10, unit: 'g' },
        {
          ingredient: 'tomato-paste',
          quantity: 30,
          unit: 'g',
          note: t(
            '15 g with the beetroot, 15 g with the carrot and onion',
            '15 g la sfeclă, 15 g la morcov și ceapă',
          ),
        },
        {
          ingredient: 'still-water',
          quantity: 2.6,
          unit: 'l',
          note: t(
            '2.5 l for the pot, 100 ml for the beetroot',
            '2,5 l pentru oală, 100 ml pentru sfeclă',
          ),
        },
        {
          ingredient: 'potato',
          quantity: 0.4,
          unit: 'kg',
          note: t('peeled, 2 cm cubes', 'curățați, cuburi de 2 cm'),
        },
        { ingredient: 'bay-leaves', quantity: 1, unit: 'g' },
        { ingredient: 'peppercorns', quantity: 2, unit: 'g' },
        {
          ingredient: 'carrot',
          quantity: 150,
          unit: 'g',
          note: t('grated', 'dați pe răzătoare'),
        },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('finely diced', 'tăiate mărunt'),
        },
        {
          ingredient: 'cabbage',
          quantity: 300,
          unit: 'g',
          note: t('finely shredded', 'tăiată fideluță'),
        },
        {
          ingredient: 'bell-pepper',
          quantity: 1,
          unit: 'pcs',
          note: t('diced', 'tăiat cubulețe'),
        },
        {
          ingredient: 'canned-white-beans',
          quantity: 240,
          unit: 'g',
          note: t('drained weight, rinsed', 'greutate scursă, clătită'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t('crushed', 'zdrobit'),
        },
        {
          ingredient: 'lemon-juice',
          quantity: 20,
          unit: 'ml',
          optional: true,
          note: t('to sharpen at the end', 'pentru acreală, la final'),
        },
        {
          ingredient: 'dill',
          quantity: 15,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'parsley',
          quantity: 15,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'salt',
          quantity: 14,
          unit: 'g',
          note: t(
            '8 g with the potatoes, the rest at the end to taste',
            '8 g la cartofi, restul la final, după gust',
          ),
        },
        {
          ingredient: 'sour-cream',
          quantity: 120,
          unit: 'g',
          optional: true,
          note: t(
            'at the table; leave out when fasting',
            'la masă; las-o deoparte când ții post',
          ),
        },
      ],
      steps: [
        {
          key: 'prep',
          text: t(
            'Cut the beetroot into matchsticks, grate the carrot, shred the cabbage, and dice the onions, the pepper and the potatoes. Crush the garlic.',
            'Taie sfecla fâșii subțiri, dă morcovul pe răzătoare, taie varza fideluță și taie cubulețe ceapa, ardeiul și cartofii. Zdrobește usturoiul.',
          ),
        },
        {
          key: 'potatoes',
          text: t(
            'Put the potatoes, the bay leaves, the peppercorns and 8 g of the salt in a pot of at least 5 l with the 2.5 l of cold water. Bring to the boil, about 12 minutes, then simmer for 5 minutes. Start the beetroot in the next step while the water heats.',
            'Pune cartofii, foile de dafin, boabele de piper și 8 g din sare într-o oală de cel puțin 5 l cu cei 2,5 l de apă rece. Adu la fierbere, cam 12 minute, apoi fierbe domol 5 minute. Începe sfecla în pasul următor, cât se încălzește apa.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'beetroot',
          text: t(
            'While the water heats, heat 30 ml of the oil in a wide pan over medium heat and fry the beetroot for 3 minutes. Add the vinegar, the sugar, 15 g of the tomato paste and 100 ml of water. Cover and stew over low heat for 15 minutes, until tender but still holding its shape.',
            'Cât se încălzește apa, încinge 30 ml din ulei într-o tigaie largă la foc mediu și călește sfecla 3 minute. Adaugă oțetul, zahărul, 15 g din pasta de tomate și 100 ml de apă. Acoperă și fierbe înăbușit la foc mic 15 minute, până când sfecla e fragedă, dar își păstrează forma.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'cabbage',
          text: t(
            'When the potatoes have simmered for 5 minutes, add the cabbage to the pot and let it simmer while you make the next step.',
            'După ce cartofii au fiert domol 5 minute, adaugă varza în oală și las-o să fiarbă domol, cât pregătești pasul următor.',
          ),
        },
        {
          key: 'carrot-onion',
          text: t(
            'When the beetroot is done, and while the cabbage simmers, heat the remaining 30 ml of oil in another pan over medium heat. Fry the onions and the grated carrot for 8 minutes with the remaining 15 g of tomato paste, until soft and orange.',
            'Când sfecla e gata, și cât fierbe varza, încinge cei 30 ml de ulei rămași într-o altă tigaie la foc mediu. Călește ceapa și morcovul ras 8 minute cu cele 15 g de pastă de tomate rămase, până se înmoaie și capătă o culoare portocalie.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'combine',
          text: t(
            'Add the stewed beetroot, the carrot and onion, the beans and the diced pepper. Simmer for 10 minutes, until the cabbage is tender.',
            'Adaugă sfecla înăbușită, morcovul cu ceapa, fasolea și ardeiul tăiat cubulețe. Fierbe 10 minute, până când varza e fragedă.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'finish',
          text: t(
            'Take the pot off the heat and remove the bay leaves. Stir in the garlic, the dill and the parsley, then taste and add salt and, if you like, the lemon juice. Cover and leave for 10 minutes so the colour and flavour settle.',
            'Ia oala de pe foc și scoate foile de dafin. Amestecă usturoiul, mărarul și pătrunjelul, apoi gustă și adaugă sare și, dacă vrei, sucul de lămâie. Acoperă și lasă 10 minute, ca să se așeze culoarea și gustul.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'serve',
          text: t(
            'Ladle into bowls and, outside fasting days, add a spoonful of sour cream to each.',
            'Servește în boluri și, în afara zilelor de post, pune câte o lingură de smântână în fiecare.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Cool the leftovers and put them in the fridge within 2 hours. Keep for up to 3 to 4 days and reheat until boiling.',
            'Răcește ce rămâne și pune-l la frigider în cel mult 2 ore. Se păstrează 3-4 zile; încălzește-l până fierbe.',
          ),
        },
      ],
      tips: [
        t(
          'Do not boil the stewed beetroot hard in the pot: it fades to brown. The vinegar and a short simmer keep it red.',
          'Nu fierbe sfecla înăbușită tare în oală: se decolorează spre maro. Oțetul și o fierbere scurtă o păstrează roșie.',
        ),
      ],
      stepTips: [
        {
          step: 'finish',
          text: t(
            'The soup tastes better after the rest; if the colour looks dull, a little lemon juice brings it back.',
            'Ciorba are gust mai bun după odihnă; dacă și-a pierdut culoarea, puțin suc de lămâie o readuce.',
          ),
        },
      ],
      nutritionNote: t(
        'Beetroot, cabbage and beans give fibre and plant protein, and the soup is low in fat. Potatoes and the pinch of sugar add carbohydrates, and the canned beans and salt make it salty, so rinse the beans and season at the end. Sour cream, if you add it, brings saturated fat.',
        'Sfecla, varza și fasolea dau fibre și proteine vegetale, iar supa e săracă în grăsimi. Cartofii și puțin zahăr adaugă carbohidrați, iar fasolea din conservă și sarea o fac sărată, așa că clătește fasolea și sărează la final. Smântâna, dacă o pui, aduce grăsimi saturate.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Rye bread', 'Pâine de secară'),
          reason: t(
            'Its sour, earthy crumb matches the sweet and sour beetroot and soaks up the broth.',
            'Miezul ei acrișor și pământos se potrivește cu sfecla dulce-acrișoară și absoarbe zeama.',
          ),
          principle: 'complement_flavour',
          ingredient: 'rye-bread',
        },
        {
          kind: 'food',
          label: t('Raw spring onion', 'Ceapă verde crudă'),
          reason: t(
            'A sharp, crunchy raw bite against the soft, sweet and sour beetroot.',
            'O îmbucătură crudă, ascuțită și crocantă, lângă sfecla moale și dulce-acrișoară.',
          ),
          principle: 'contrast_texture',
          ingredient: 'spring-onion',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, hearty soup with beans and potatoes warms you through.',
            'O supă fierbinte și consistentă, cu fasole și cartofi, te încălzește.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Filling thanks to the beans, yet low in fat.',
            'Săturătoare datorită fasolei, dar săracă în grăsimi.',
          ),
        },
      ],
    },
    {
      slug: 'ciorba-de-legume-chinese',
      cuisine: 'chinese',
      title: t(
        'Hot and sour soup (suan la tang)',
        'Supă chinezească iute-acrișoară (suan la tang)',
      ),
      servings: 4,
      prepMinutes: 45,
      cookMinutes: 20,
      difficulty: 'medium',
      hideBaseTips: [0, 1],
      lines: [
        {
          ingredient: 'dried-shiitake',
          quantity: 15,
          unit: 'g',
          note: t('about 6 mushrooms', 'cam 6 ciuperci'),
        },
        {
          ingredient: 'wood-ear-mushrooms',
          quantity: 10,
          unit: 'g',
          note: t('they swell a lot', 'se umflă mult'),
        },
        {
          ingredient: 'still-water',
          key: 'soaking-water',
          quantity: 0.4,
          unit: 'l',
          note: t(
            'hot, not boiling, for soaking',
            'fierbinte, nu clocotită, pentru înmuiat',
          ),
        },
        {
          ingredient: 'vegetable-stock',
          quantity: 1000,
          unit: 'ml',
        },
        {
          ingredient: 'canned-bamboo-shoots',
          quantity: 100,
          unit: 'g',
          note: t('drained, cut into strips', 'scurși, tăiați fâșii'),
        },
        {
          ingredient: 'tofu',
          quantity: 200,
          unit: 'g',
          note: t('firm, cut into strips', 'ferm, tăiat fâșii'),
        },
        { ingredient: 'soy-sauce', quantity: 20, unit: 'ml' },
        {
          ingredient: 'dark-soy-sauce',
          quantity: 10,
          unit: 'ml',
          note: t('for colour', 'pentru culoare'),
        },
        { ingredient: 'sugar', quantity: 5, unit: 'g' },
        {
          ingredient: 'salt',
          note: t('only if needed', 'doar dacă e nevoie'),
        },
        {
          ingredient: 'corn-starch',
          quantity: 25,
          unit: 'g',
        },
        {
          ingredient: 'still-water',
          key: 'slurry-water',
          quantity: 0.075,
          unit: 'l',
          note: t('cold, for the cornflour', 'rece, pentru amidon'),
        },
        {
          ingredient: 'eggs',
          quantity: 2,
          unit: 'pcs',
          note: t('beaten', 'bătute'),
        },
        {
          ingredient: 'chinkiang-vinegar',
          quantity: 40,
          unit: 'ml',
        },
        {
          ingredient: 'white-pepper',
          quantity: 2,
          unit: 'g',
        },
        { ingredient: 'sesame-oil', quantity: 10, unit: 'ml' },
        {
          ingredient: 'spring-onion',
          quantity: 30,
          unit: 'g',
          note: t('thinly sliced', 'tăiată felii subțiri'),
        },
      ],
      steps: [
        {
          key: 'soak',
          text: t(
            'Put the dried shiitake and the wood ear in a bowl and cover with 400 ml of hot, not boiling, water. Weigh them down with a small plate so they stay under the water and soak for 30 minutes, until soft all through.',
            'Pune ciupercile shiitake uscate și ciupercile urechi-de-lemn într-un bol și acoperă-le cu 400 ml de apă fierbinte, nu clocotită. Apasă-le cu o farfurioară ca să rămână sub apă și lasă-le la înmuiat 30 de minute, până se înmoaie complet.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'prepare',
          text: t(
            'Lift the mushrooms out and squeeze them gently over the bowl. Cut off the hard shiitake stems and the hard knobs of the wood ear, rinse the wood ear well, and slice both thinly. Strain the soaking water through a fine sieve lined with kitchen paper into a jug, to leave the grit behind, and keep it for the soup.',
            'Scoate ciupercile și stoarce-le ușor deasupra bolului. Taie cozile tari de la shiitake și nodurile tari de la urechi-de-lemn, clătește-le bine și taie ambele feluri de ciuperci felii subțiri. Strecoară apa de la înmuiat printr-o sită deasă tapetată cu hârtie de bucătărie într-o cană, ca să rămână nisipul pe fund, și păstreaz-o pentru supă.',
          ),
        },
        {
          key: 'mix',
          text: t(
            'Mix the cornflour with 75 ml of cold water until smooth. Beat the eggs in a small bowl, slice the spring onion, and cut the tofu and bamboo shoots into strips.',
            'Amestecă amidonul cu 75 ml de apă rece până se omogenizează. Bate ouăle într-un bol mic, taie ceapa verde felii și taie tofu și lăstarii de bambus fâșii.',
          ),
        },
        {
          key: 'boil',
          text: t(
            'Put the stock, the strained soaking water, the mushrooms and the bamboo shoots in a pot. Bring to the boil, about 5 minutes, then simmer for 5 minutes.',
            'Pune supa de legume, apa strecurată de la înmuiat, ciupercile și lăstarii de bambus într-o oală. Adu la fierbere, cam 5 minute, apoi fierbe domol 5 minute.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'season',
          text: t(
            'Add the tofu, the soy sauce, the dark soy sauce and the sugar and simmer for 2 minutes. Taste, and add a little more soy sauce if you like. It is salty, so hold back on the salt for now.',
            'Adaugă tofu, sosul de soia, sosul de soia închis la culoare și zahărul și fierbe 2 minute. Gustă și mai adaugă puțin sos de soia, dacă vrei. E sărat, așa că nu pune sare deocamdată.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'thicken',
          text: t(
            'Stir the cornflour mixture again, because the starch settles, and pour it in while stirring. Simmer for 1 minute, until the soup turns glossy and lightly thickened.',
            'Amestecă din nou amidonul, pentru că se depune, și toarnă-l în supă amestecând. Fierbe 1 minut, până când supa devine lucioasă și puțin legată.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'egg',
          text: t(
            'Keep the soup at a bare simmer. Pour the beaten eggs in a thin stream, stirring slowly in one direction, and cook for 1 minute, until the egg ribbons are fully set, with no wet or runny egg left.',
            'Ține supa la un clocot abia perceptibil. Toarnă ouăle bătute într-un fir subțire, amestecând încet într-o singură direcție, și fierbe 1 minut, până când fâșiile de ou sunt complet închegate, fără ou lichid sau moale.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'finish',
          text: t(
            'Take the pot off the heat. Stir in 30 ml of the black vinegar and the white pepper, taste, and add the rest of the vinegar and a little more pepper until the soup is sharply sour with a warm heat. Add salt only if needed, then the sesame oil.',
            'Ia oala de pe foc. Amestecă 30 ml din oțetul negru și piperul alb, gustă și mai adaugă restul de oțet și puțin piper, până când supa e bine acrișoară și are o căldură plăcută. Adaugă sare doar dacă e nevoie, apoi uleiul de susan.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Ladle into hot bowls, scatter the spring onion on top and serve at once.',
            'Servește în boluri calde, presară ceapa verde deasupra și servește imediat.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Cool the leftovers and put them in the fridge within 2 hours. Keep for up to 2 days and reheat until boiling.',
            'Răcește ce rămâne și pune-l la frigider în cel mult 2 ore. Se păstrează cel mult 2 zile; încălzește-l până fierbe.',
          ),
        },
      ],
      tips: [
        t(
          'Add the vinegar and the white pepper last, off the heat: boiled, they lose their sharpness and the soup turns flat.',
          'Pune oțetul și piperul alb la urmă, după ce iei oala de pe foc: fierte, își pierd ascuțimea și supa iese searbădă.',
        ),
        t(
          'Black vinegar varies from brand to brand. Start with less than the recipe says and add more to taste.',
          'Oțetul negru diferă de la o marcă la alta. Începe cu mai puțin decât scrie în rețetă și adaugă după gust.',
        ),
      ],
      stepTips: [
        {
          step: 'prepare',
          text: t(
            'The soaking water is full of flavour, so do not pour it away; strain it well, because dried mushrooms often carry grit.',
            'Apa de la înmuiat are mult gust, deci nu o arunca; strecoar-o bine, pentru că ciupercile uscate au adesea nisip.',
          ),
        },
        {
          step: 'egg',
          text: t(
            'Stirring slowly gives long, silky ribbons; fast stirring breaks the egg into small crumbs.',
            'Dacă amesteci încet, ouăle fac fâșii lungi și mătăsoase; dacă amesteci repede, se sfărâmă în bucăți mici.',
          ),
        },
      ],
      nutritionNote: t(
        'Tofu and egg give protein, and the mushrooms and bamboo shoots add fibre for little fat. Soy sauce and the stock make it high in salt, so go easy on added salt. It has some starch from the thickening and little else for energy, so serve it with rice or noodles for a full meal.',
        'Tofu și oul dau proteine, iar ciupercile și lăstarii de bambus adaugă fibre cu puțină grăsime. Sosul de soia și supa de legume o fac bogată în sare, așa că pune sare doar dacă e nevoie. Are puțin amidon de la legare și altfel puțină energie, așa că servește-o cu orez sau tăiței ca să fie o masă completă.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Steamed jasmine rice', 'Orez jasmine fiert la aburi'),
          reason: t(
            'Plain rice softens the sharp sour heat and makes the bowl more filling.',
            'Orezul simplu domolește iuțeala acră și face castronul mai săturător.',
          ),
          principle: 'complement_flavour',
          ingredient: 'jasmine-rice',
        },
        {
          kind: 'drink',
          label: t('Green tea', 'Ceai verde'),
          reason: t(
            'Its light bitterness cleans the palate between sharp, spicy spoonfuls.',
            'Amăreala lui ușoară curăță gura între lingurile acre și iuți.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'green-tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Hot, sour and peppery, it warms you from the inside.',
            'Fierbinte, acră și cu piper, te încălzește pe dinăuntru.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'The sharp heat and sourness are a lot just before bed.',
            'Iuțeala și acreala sunt prea mult chiar înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
