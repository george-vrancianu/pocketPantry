import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Varză călită base is the everyday meatless (de post) Romanian one: fresh
// white cabbage braised with onion, tomato and savory. Each Variant is a full
// Recipe with its own lines, steps and guidance. Every Variant hides both
// Recipe-level Tips of the base (they are about this tomato braise) and writes
// its own.
export const varzaCalita: BaseRecipeSeed = {
  slug: 'varza-calita',
  title: t(
    'Romanian braised white cabbage with tomato (varză călită)',
    'Varză călită',
  ),
  servings: 6,
  prepMinutes: 30,
  cookMinutes: 65,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'cabbage',
      quantity: 1200,
      unit: 'g',
      note: t('trimmed weight, shredded thinly', 'curățată, tăiată fideluță'),
    },
    { ingredient: 'salt', quantity: 10, unit: 'g' },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('finely chopped', 'tocate mărunt'),
    },
    { ingredient: 'sunflower-oil', quantity: 80, unit: 'ml' },
    { ingredient: 'tomato-paste', quantity: 30, unit: 'g' },
    { ingredient: 'paprika', quantity: 5, unit: 'g' },
    { ingredient: 'canned-tomatoes', quantity: 400, unit: 'g' },
    { ingredient: 'still-water', quantity: 0.1, unit: 'l' },
    {
      ingredient: 'bay-leaves',
      quantity: 0.4,
      unit: 'g',
      note: t('2 leaves', '2 foi'),
    },
    {
      ingredient: 'peppercorns',
      quantity: 1,
      unit: 'g',
      note: t('about 15 peppercorns', 'vreo 15 boabe'),
    },
    { ingredient: 'savory', quantity: 2, unit: 'g' },
    {
      ingredient: 'sugar',
      quantity: 5,
      unit: 'g',
      optional: true,
      note: t('if the tomatoes are sharp', 'dacă roșiile sunt acre'),
    },
    {
      ingredient: 'dill',
      quantity: 15,
      unit: 'g',
      note: t('chopped', 'tocat'),
    },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
  ],
  steps: [
    {
      key: 'shred',
      text: t(
        'Quarter the cabbage, cut out the core and shred it thinly, about 3 to 4 mm. Do not rinse it.',
        'Taie varza în sferturi, scoate cotorul și toac-o fideluță, de vreo 3-4 mm. Nu o spăla după tăiere.',
      ),
    },
    {
      key: 'salt',
      text: t(
        'Tip the cabbage into a large bowl, add 10 g salt and rub it with your hands for about 2 minutes until it starts to soften and shine. Leave it for 15 minutes.',
        'Pune varza într-un castron mare, adaugă cele 10 g de sare și freac-o cu mâinile cam 2 minute, până începe să se înmoaie și să lucească. Las-o să stea 15 minute.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'onion',
      text: t(
        'While the cabbage rests, chop the onions finely.',
        'În timp ce varza stă, toacă ceapa mărunt.',
      ),
    },
    {
      key: 'soften',
      text: t(
        'Heat the oil in a wide, heavy pot (5 litres) over medium heat. Add the onion and cook for 5 minutes, stirring, until soft and translucent but not browned.',
        'Încinge uleiul într-o oală lată și groasă (de 5 litri) la foc mediu. Adaugă ceapa și călește-o 5 minute, amestecând, până se înmoaie și devine sticloasă, fără să se rumenească.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'braise',
      text: t(
        'Add the cabbage with the juices it gave off and stir. Cover and cook over medium-low heat for 15 minutes, stirring every 5 minutes, until it has collapsed to about half its volume.',
        'Adaugă varza cu tot sucul pe care l-a lăsat și amestecă. Acoperă și lasă la foc mic-mediu 15 minute, amestecând din 5 în 5 minute, până se reduce la jumătate din volum.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'paste',
      text: t(
        'Stir in the tomato paste and cook for 1 minute. Take the pot off the heat, stir in the paprika and add the tomatoes straight away, crushing them in your hand, so the paprika does not scorch.',
        'Amestecă pasta de roșii și călește-o 1 minut. Ia oala de pe foc, adaugă boiaua și pune imediat roșiile, strivite în mână, ca boiaua să nu se ardă.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'season',
      text: t(
        'Add the water, bay leaves, peppercorns, savory and the sugar if using. Return to the heat and bring to a simmer.',
        'Adaugă apa, foile de dafin, piperul boabe, cimbrul și zahărul, dacă îl folosești. Pune oala la loc pe foc și adu la fierbere domoală.',
      ),
    },
    {
      key: 'simmer',
      text: t(
        'Cover and simmer over low heat for 30 minutes, stirring from the bottom now and then, until the cabbage is completely soft.',
        'Acoperă și fierbe la foc mic 30 de minute, amestecând din când în când de pe fundul oalei, până varza se face complet moale.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'reduce',
      text: t(
        'Uncover, raise the heat to medium and cook for 8 minutes, stirring often, until the sauce is thick and the cabbage is lightly caramelised at the edges.',
        'Ia capacul, mărește focul la mediu și gătește 8 minute, amestecând des, până sosul se îngroașă și varza se caramelizează ușor pe margini.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'finish',
      text: t(
        'Take out the bay leaves, stir in the dill and black pepper, and taste for salt. Leave it for 5 minutes before serving.',
        'Scoate foile de dafin, amestecă mărarul și piperul negru și gustă de sare. Las-o să stea 5 minute înainte de servire.',
      ),
      timerSeconds: 300,
    },
  ],
  tips: [
    t(
      'If the bottom starts to catch, splash in 50 ml of water and scrape it up; the sticky tomato is where the flavour is, but burnt bits turn the whole pot bitter.',
      'Dacă începe să se prindă la fund, toarnă 50 ml de apă și răzuiește; roșiile lipite dau gust, dar partea arsă amărăște toată oala.',
    ),
    t(
      'It tastes better the next day. Chill leftovers within 2 hours, keep them in the fridge for up to 4 days and reheat until steaming; it also freezes well.',
      'A doua zi e și mai bună. Pune resturile la frigider în cel mult 2 ore, păstrează-le până la 4 zile și încălzește-le până scot aburi; se poate și congela.',
    ),
  ],
  stepTips: [
    {
      step: 'salt',
      text: t(
        'Rubbing with salt makes the cabbage give up its water and soften before it hits the oil, so it braises instead of staying raw and crunchy in the centre.',
        'Frecată cu sare, varza își lasă apa și se înmoaie înainte să ajungă în ulei, așa că se călește uniform și nu rămâne crudă și crocantă în mijloc.',
      ),
    },
    {
      step: 'paste',
      text: t(
        'Paprika burns in seconds in hot oil and turns bitter; always add it off the heat and follow at once with something wet.',
        'Boiaua se arde în câteva secunde în ulei încins și amărăște; pune-o mereu de pe foc și adaugă imediat ceva lichid.',
      ),
    },
  ],
  nutritionNote: t(
    'Cabbage brings fibre and little energy, and with no meat this is a light, fasting-friendly dish. The sunflower oil is mostly unsaturated but still adds energy, and the salt adds up, so go gently with it and taste at the end. Alone it is low in protein: beans add some (cheese too, if you are not fasting), and mămăligă makes it a filling meal.',
    'Varza aduce fibre și puține calorii, iar fără carne e un fel ușor, potrivit pentru post. Uleiul de floarea soarelui e în mare parte nesaturat, dar tot adaugă energie, iar sarea se adună, așa că dozeaz-o cu grijă și gustă la sfârșit. Singură are puține proteine: fasolea adaugă din ele (și brânza, dacă nu ții post), iar mămăliga o face o masă săturătoare.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Smoked sausages', 'Cârnați afumați'),
      reason: t(
        'Their smoke and fat sit well against the sweet, soft cabbage; fry them separately if you want meat with it.',
        'Gustul afumat și grăsimea lor se potrivesc cu varza dulce și moale; prăjește-i separat dacă vrei și carne alături.',
      ),
      principle: 'complement_flavour',
      ingredient: 'smoked-sausages',
    },
    {
      kind: 'food',
      label: t(
        'Mămăligă with cheese and sour cream',
        'Mămăligă cu brânză și smântână',
      ),
      reason: t(
        'The soft cornmeal soaks up the tomatoey juices. Leave off the cheese and sour cream for a fasting meal.',
        'Mămăliga moale ia în ea sosul de roșii. Lasă brânza și smântâna deoparte dacă ții post.',
      ),
      principle: 'complement_flavour',
      recipe: 'mamaliga',
    },
    {
      kind: 'food',
      label: t('Pickled peppers', 'Ardei murați'),
      reason: t(
        'Their sharp acidity cuts the oil in the braise, and a little heat wakes up a soft, sweet dish.',
        'Aciditatea lor ascuțită taie din uleiul mâncării, iar puțina iuțeală trezește gustul unei mâncări moi și dulci.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-peppers',
    },
    {
      kind: 'drink',
      label: t('Cold beer', 'Bere rece'),
      reason: t(
        'Its fizz and bitterness refresh the palate between spoonfuls.',
        'Bulele și amăreala ei împrospătează gustul între îmbucături.',
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
        'A hot, filling dish that warms you through, especially with mămăligă.',
        'O mâncare caldă și săturătoare, care te încălzește, mai ales cu mămăligă.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A big plate of cooked cabbage can sit heavy before bed.',
        'O farfurie mare de varză gătită poate cădea greu înainte de culcare.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'A big, hot plate of braised cabbage is not what you want when it is scorching.',
        'O farfurie mare și fierbinte de varză călită nu e ce îți dorești pe o caniculă.',
      ),
    },
  ],
  variants: [
    {
      slug: 'varza-calita-french',
      cuisine: 'french',
      title: t(
        'Choucroute garnie (Alsatian sauerkraut with smoked pork and sausages)',
        'Choucroute garnie (varză murată alsaciană cu afumătură și crenvurști)',
      ),
      servings: 6,
      prepMinutes: 20,
      cookMinutes: 120,
      difficulty: 'medium',
      hideBaseTips: [0, 1],
      lines: [
        { ingredient: 'sauerkraut', quantity: 1200, unit: 'g' },
        { ingredient: 'lard', quantity: 40, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'sliced, keeping one wedge whole for the cloves',
            'tăiate felii, păstrând un sfert întreg pentru cuișoare',
          ),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t('2 cloves, crushed', '2 căței, striviți'),
        },
        {
          ingredient: 'juniper-berries',
          quantity: 1,
          unit: 'g',
          note: t(
            '8 to 10 berries, lightly crushed',
            '8-10 boabe, ușor strivite',
          ),
        },
        {
          ingredient: 'cloves',
          quantity: 0.3,
          unit: 'g',
          note: t(
            '2 cloves, stuck into an onion wedge',
            '2 cuișoare, înfipte într-un sfert de ceapă',
          ),
        },
        {
          ingredient: 'bay-leaves',
          quantity: 0.4,
          unit: 'g',
          note: t('2 leaves', '2 foi'),
        },
        {
          ingredient: 'peppercorns',
          quantity: 1,
          unit: 'g',
          note: t('about 15 peppercorns', 'vreo 15 boabe'),
        },
        {
          ingredient: 'white-wine',
          quantity: 300,
          unit: 'ml',
          note: t(
            'dry, such as Riesling or Sylvaner',
            'sec, de pildă Riesling sau Sylvaner',
          ),
        },
        { ingredient: 'still-water', quantity: 0.2, unit: 'l' },
        {
          ingredient: 'bacon',
          quantity: 300,
          unit: 'g',
          note: t('smoked, in one slab', 'costiță afumată, într-o bucată'),
        },
        {
          ingredient: 'smoked-pork',
          quantity: 600,
          unit: 'g',
          note: t(
            'smoked shoulder or neck (kassler), in one piece',
            'spată sau ceafă afumată (kassler), într-o bucată',
          ),
        },
        {
          ingredient: 'frankfurters',
          quantity: 450,
          unit: 'g',
          note: t('Strasbourg-style sausages', 'de tip Strasbourg'),
        },
        {
          ingredient: 'potato',
          quantity: 1.2,
          unit: 'kg',
          note: t('peeled, quartered', 'curățați, tăiați sferturi'),
        },
        {
          ingredient: 'salt',
          quantity: 10,
          unit: 'g',
          note: t('for the potato water only', 'doar pentru apa cartofilor'),
        },
        {
          ingredient: 'mustard',
          quantity: 60,
          unit: 'g',
          note: t('to serve', 'pentru servire'),
        },
      ],
      steps: [
        {
          key: 'rinse',
          text: t(
            'Rinse the sauerkraut under cold water, squeeze it out by the handful and pull it apart. Taste a strand: if it is still very sharp, rinse once more.',
            'Clătește varza murată sub apă rece, stoarc-o de lichid cu mâna și desfir-o. Gustă un fir: dacă e încă foarte acră, mai clătește-o o dată.',
          ),
        },
        {
          key: 'soften',
          text: t(
            'Melt the lard in a wide, heavy pot (6 litres) over medium heat. Add the onions and garlic and cook for 5 minutes until soft and pale gold.',
            'Topește untura într-o oală lată și groasă (de 6 litri) la foc mediu. Adaugă ceapa și usturoiul și călește 5 minute, până se înmoaie și capătă o culoare aurie pală.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'layer',
          text: t(
            'Spread half the sauerkraut in the pot with the juniper, cloves, bay leaves and peppercorns. Push the cloves into an onion wedge and bury it in the sauerkraut. Lay the bacon and the smoked pork on top and cover with the rest of the sauerkraut.',
            'Întinde jumătate din varza murată în oală, cu ienupărul, cuișoarele, foile de dafin și piperul boabe. Înfige cuișoarele într-un sfert de ceapă și îngroapă-l în varză. Așază deasupra costița afumată și afumătura de porc, apoi acoperă cu restul de varză.',
          ),
        },
        {
          key: 'bring',
          text: t(
            'Pour in the wine and water and bring to a boil over high heat.',
            'Toarnă vinul și apa și adu la fierbere pe foc mare.',
          ),
        },
        {
          key: 'braise',
          text: t(
            'Cover, turn the heat to low and simmer for 1 hour 30 minutes, lifting the lid now and then to stir; add a splash of water if the pot looks dry.',
            'Acoperă, redu focul la mic și fierbe 1 oră și 30 de minute, ridicând din când în când capacul ca să amesteci; adaugă puțină apă dacă oala pare uscată.',
          ),
          timerSeconds: 5400,
        },
        {
          key: 'potatoes',
          text: t(
            'When the braise has 25 minutes left, put the potatoes in a separate pot, cover with cold water, add the salt and boil for 20 minutes, until a knife slides in easily. Drain.',
            'Când mai sunt 25 de minute din fierberea varzei, pune cartofii într-o altă oală, acoperă-i cu apă rece, adaugă sarea și fierbe-i 20 de minute, până intră ușor cuțitul în ei. Scurge-i.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'check-meat',
          text: t(
            'Check the meat: the smoked pork and bacon should be steaming hot to the centre (at least 70 °C on a thermometer) and tender when pierced with a fork. Lift them onto a board and cover with foil.',
            'Verifică carnea: afumătura și costița trebuie să fie fierbinți până în centru (cel puțin 70 °C la termometru) și fragede când le înțepi cu furculița. Scoate-le pe o tocătoare și acoperă-le cu folie.',
          ),
        },
        {
          key: 'sausages',
          text: t(
            'Push the sausages into the sauerkraut, cover and heat for 8 minutes, until plump and steaming hot right through.',
            'Înfige crenvurștii în varză, acoperă și încălzește 8 minute, până se umflă și sunt fierbinți pe dinăuntru.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'serve',
          text: t(
            'Fish out the bay leaves and the onion wedge with the cloves. Slice the smoked pork and bacon, pile the sauerkraut on a hot platter, arrange the meats and sausages on top and serve with the potatoes and mustard.',
            'Scoate foile de dafin și sfertul de ceapă cu cuișoare. Taie afumătura și costița felii, pune varza pe un platou cald, așază deasupra carnea și crenvurștii și servește cu cartofii și muștarul.',
          ),
        },
      ],
      tips: [
        t(
          'Smoked meats and sauerkraut are already salty, so add no salt to the pot; only the potato water is salted.',
          'Afumăturile și varza murată sunt deja sărate, așa că nu pune sare în oală; sărează doar apa cartofilor.',
        ),
        t(
          'Chill leftovers within 2 hours and keep them in the fridge for up to 3 days; reheat the meat and sauerkraut until steaming hot throughout.',
          'Pune resturile la frigider în cel mult 2 ore și păstrează-le până la 3 zile; încălzește carnea și varza până sunt fierbinți peste tot.',
        ),
      ],
      stepTips: [
        {
          step: 'layer',
          text: t(
            'Wash your hands, the board and the knife after handling the raw smoked bacon and pork, and keep that board away from the potatoes and the cooked sausages.',
            'Spală-ți mâinile, tocătoarea și cuțitul după ce ai atins costița și carnea afumată crude și ține tocătoarea aceea departe de cartofi și de crenvurștii gătiți.',
          ),
        },
      ],
      nutritionNote: t(
        'Sauerkraut gives fibre and the potatoes give filling carbohydrate. The lard, bacon, smoked pork and sausages add a lot of saturated fat and salt, so keep the meat portions small and make the cabbage the bulk of the plate.',
        'Varza murată aduce fibre, iar cartofii carbohidrați care săturează. Untura, costița, afumătura și crenvurștii aduc multe grăsimi saturate și sare, așa că ține porțiile de carne mici și lasă varza să fie cea mai mare parte din farfurie.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Horseradish', 'Hrean'),
          reason: t(
            'Its pungent bite lifts the smoked meats and clears the fat from your palate.',
            'Gustul lui iute și ascuțit ridică afumăturile și curăță gura de grăsime.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'horseradish',
        },
        {
          kind: 'food',
          label: t('Rye bread', 'Pâine de secară'),
          reason: t(
            'Dense and slightly sour, it mops up the juices and goes with the smoke.',
            'Densă și ușor acrișoară, culege sosul și se potrivește cu gustul afumat.',
          ),
          principle: 'complement_flavour',
          ingredient: 'rye-bread',
        },
        {
          kind: 'drink',
          label: t('Cold beer', 'Bere rece'),
          reason: t(
            'Fizz and a little bitterness refresh the palate after rich, salty meat.',
            'Bulele și puțina amăreală împrospătează gustul după carne grasă și sărată.',
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
            'A hearty, hot one-pot meal for a cold day.',
            'O masă consistentă și fierbinte dintr-o singură oală, pentru o zi rece.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Heavy, fatty and salty, it is too much before bed.',
            'Grea, grasă și sărată, e prea mult înainte de culcare.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'A long braise of smoked meat is out of place in the heat.',
            'O fiertură lungă cu afumături nu se potrivește pe căldură.',
          ),
        },
      ],
    },
    {
      slug: 'varza-calita-hungarian',
      cuisine: 'hungarian',
      title: t(
        'Székelykáposzta (Székely pork and sauerkraut stew with sour cream)',
        'Székelykáposzta (gulaș secuiesc: tocană de porc cu varză murată și smântână)',
      ),
      servings: 6,
      prepMinutes: 25,
      cookMinutes: 135,
      difficulty: 'medium',
      hideBaseTips: [0, 1],
      lines: [
        {
          ingredient: 'pork-shoulder',
          quantity: 900,
          unit: 'g',
          note: t('cut in 3 cm cubes', 'tăiată cuburi de 3 cm'),
        },
        { ingredient: 'lard', quantity: 40, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('chopped', 'tocate'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t('2 cloves, crushed', '2 căței, striviți'),
        },
        { ingredient: 'paprika', quantity: 10, unit: 'g' },
        { ingredient: 'caraway-seeds', quantity: 3, unit: 'g' },
        {
          ingredient: 'bay-leaves',
          quantity: 0.4,
          unit: 'g',
          note: t('2 leaves', '2 foi'),
        },
        { ingredient: 'still-water', quantity: 0.5, unit: 'l' },
        { ingredient: 'sauerkraut', quantity: 1000, unit: 'g' },
        { ingredient: 'sour-cream', quantity: 200, unit: 'g' },
        { ingredient: 'flour', quantity: 15, unit: 'g' },
        { ingredient: 'salt', quantity: 3, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        {
          ingredient: 'dill',
          quantity: 10,
          unit: 'g',
          optional: true,
          note: t('chopped', 'tocat'),
        },
      ],
      steps: [
        {
          key: 'rinse',
          text: t(
            'Rinse the sauerkraut under cold water, squeeze it out and set aside. Pat the pork dry with paper towels and season it with the salt and pepper.',
            'Clătește varza murată sub apă rece, stoarc-o și pune-o deoparte. Șterge carnea de porc cu hârtie de bucătărie și condimentează-o cu sarea și piperul.',
          ),
        },
        {
          key: 'brown',
          text: t(
            'Melt the lard in a heavy pot (6 litres) over medium-high heat. Brown the pork in two batches, about 7 minutes per batch (restart the timer for the second), turning, until browned on all sides. Lift it onto a plate.',
            'Topește untura într-o oală groasă (de 6 litri) la foc mediu-mare. Rumenește carnea în două porții, câte vreo 7 minute pe porție (repornește cronometrul pentru a doua), întorcând-o, până se rumenește pe toate părțile. Scoat-o pe o farfurie.',
          ),
          timerSeconds: 420,
        },
        {
          key: 'onion',
          text: t(
            'Lower the heat to medium, add the onions to the fat and cook for 6 minutes until soft and golden. Add the garlic and stir until fragrant.',
            'Redu focul la mediu, pune ceapa în grăsimea rămasă și călește 6 minute, până se înmoaie și se aurește. Adaugă usturoiul și amestecă până se simte aroma.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'paprika',
          text: t(
            'Take the pot off the heat, stir in the paprika and straight away pour in the water, scraping up the browned bits.',
            'Ia oala de pe foc, amestecă boiaua și toarnă imediat apa, răzuind bucățelele rumenite de pe fund.',
          ),
        },
        {
          key: 'stew',
          text: t(
            'Return the pork with its juices, add the caraway and bay leaves, bring to a simmer, cover and cook over low heat for 40 minutes.',
            'Pune carnea la loc, cu sucul ei, adaugă chimenul și foile de dafin, adu la fierbere domoală, acoperă și gătește la foc mic 40 de minute.',
          ),
          timerSeconds: 2400,
        },
        {
          key: 'kraut',
          text: t(
            'Spread the sauerkraut over the pork, cover and simmer for 50 minutes more, until the pork is tender: a cube should fall apart when pressed with a fork and have no pink inside (well past 63 °C in the centre).',
            'Întinde varza murată peste carne, acoperă și fierbe încă 50 de minute, până carnea se face fragedă: un cub trebuie să se desfacă când îl apeși cu furculița și să nu mai aibă nimic roz în interior (mult peste 63 °C în centru).',
          ),
          timerSeconds: 3000,
        },
        {
          key: 'temper',
          text: t(
            'In a bowl, whisk the sour cream and flour smooth. Whisk in 3 ladles of the hot liquid from the pot a little at a time, then stir the mixture back into the stew.',
            'Într-un bol, amestecă smântâna cu făina până se omogenizează. Adaugă treptat, amestecând, 3 polonice de lichid fierbinte din oală, apoi toarnă amestecul înapoi în tocană.',
          ),
        },
        {
          key: 'finish',
          text: t(
            'Simmer gently for 5 minutes, stirring, without letting it boil hard, until slightly thickened. Taste for salt and sprinkle with the dill.',
            'Fierbe domol 5 minute, amestecând, fără să bolborosească tare, până se îngroașă ușor. Gustă de sare și presară mărarul.',
          ),
          timerSeconds: 300,
        },
      ],
      tips: [
        t(
          'Give the sour cream a full-fat, room-temperature start and keep the final simmer gentle; a hard boil makes it split into grainy curds.',
          'Folosește smântână grasă, scoasă din frigider din timp, și ține fierberea de la sfârșit domoală; dacă bolborosește tare, smântâna se taie în firimituri.',
        ),
        t(
          'Better the next day. Chill leftovers within 2 hours, keep for up to 3 days and reheat gently until steaming hot.',
          'E mai bună a doua zi. Pune resturile la frigider în cel mult 2 ore, păstrează-le până la 3 zile și încălzește-le încet, până scot aburi.',
        ),
      ],
      stepTips: [
        {
          step: 'brown',
          text: t(
            'Do not crowd the pot: pork piled up steams grey instead of browning, and the browning is half the flavour. Wash your hands and the board after handling the raw pork.',
            'Nu înghesui carnea în oală: carnea îngrămădită se fierbe în abur în loc să se rumenească, iar rumenirea dă jumătate din gust. Spală-ți mâinile și tocătoarea după ce ai atins carnea crudă.',
          ),
        },
      ],
      nutritionNote: t(
        'Pork brings plenty of protein and the sauerkraut brings fibre. The lard, fatty shoulder and sour cream add a lot of saturated fat, and the sauerkraut is salty, so serve a modest portion with bread or boiled potatoes and plenty of the cabbage.',
        'Porcul aduce multe proteine, iar varza murată fibre. Untura, spata grasă și smântâna adaugă multe grăsimi saturate, iar varza murată e sărată, așa că servește o porție moderată, cu pâine sau cartofi fierți, și multă varză.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Country bread', 'Pâine de casă'),
          reason: t(
            'A crusty slice mops up the creamy paprika sauce.',
            'O felie cu crustă culege sosul cremos cu boia.',
          ),
          principle: 'contrast_texture',
          ingredient: 'country-bread',
        },
        {
          kind: 'food',
          label: t('Pickled peppers', 'Ardei murați'),
          reason: t(
            'Their sharp acidity cuts the rich pork and sour cream.',
            'Aciditatea lor ascuțită taie din bogăția porcului și a smântânii.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-peppers',
        },
        {
          kind: 'drink',
          label: t('Red wine', 'Vin roșu'),
          reason: t(
            'A light, fruity red stands up to the pork without fighting the sourness.',
            'Un vin roșu ușor și fructat ține piept porcului fără să se bată cu aciditatea.',
          ),
          principle: 'complement_flavour',
          ingredient: 'red-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A rich, warming stew for a cold day.',
            'O tocană bogată și încălzitoare pentru o zi rece.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Fatty pork and cream are heavy before bed.',
            'Carnea grasă de porc și smântâna cad greu înainte de culcare.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'A long-simmered, creamy pork stew is too heavy for the heat.',
            'O tocană cremoasă de porc, fiartă mult, e prea grea pe căldură.',
          ),
        },
      ],
    },
    {
      slug: 'varza-calita-indian',
      cuisine: 'indian',
      title: t(
        'Bandh gobhi matar (Indian spiced cabbage with peas)',
        'Bandh gobhi matar (varză cu mazăre și condimente, ca în India)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 15,
      difficulty: 'easy',
      hideBaseTips: [0, 1],
      lines: [
        {
          ingredient: 'cabbage',
          quantity: 600,
          unit: 'g',
          note: t(
            'trimmed weight, shredded thinly',
            'curățată, tăiată fideluță',
          ),
        },
        { ingredient: 'frozen-peas', quantity: 150, unit: 'g' },
        { ingredient: 'sunflower-oil', quantity: 40, unit: 'ml' },
        { ingredient: 'cumin-seeds', quantity: 3, unit: 'g' },
        {
          ingredient: 'ginger',
          quantity: 10,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        {
          ingredient: 'hot-pepper',
          quantity: 1,
          unit: 'pcs',
          note: t('green, slit lengthways', 'verde, tăiat pe lungime'),
        },
        { ingredient: 'turmeric', quantity: 2, unit: 'g' },
        { ingredient: 'ground-coriander', quantity: 3, unit: 'g' },
        { ingredient: 'chili-powder', quantity: 2, unit: 'g' },
        { ingredient: 'salt', quantity: 5, unit: 'g' },
        { ingredient: 'garam-masala', quantity: 2, unit: 'g' },
        {
          ingredient: 'coriander',
          quantity: 15,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        { ingredient: 'lemon-juice', quantity: 15, unit: 'ml', optional: true },
      ],
      steps: [
        {
          key: 'prep',
          text: t(
            'Shred the cabbage thinly and have every spice measured out next to the stove; the cooking goes fast.',
            'Toacă varza fideluță și măsoară toate condimentele lângă aragaz; gătitul merge repede.',
          ),
        },
        {
          key: 'cumin',
          text: t(
            'Heat the oil in a large wide pan or wok over medium-high heat. Add the cumin seeds and cook for 30 seconds until they sizzle and darken a shade.',
            'Încinge uleiul într-o tigaie mare și lată sau un wok, la foc mediu-mare. Adaugă semințele de chimion și lasă 30 de secunde, până sfârâie și se închid puțin la culoare.',
          ),
          timerSeconds: 30,
        },
        {
          key: 'aromatics',
          text: t(
            'Add the ginger and green chilli and cook for 30 seconds, stirring, until fragrant.',
            'Adaugă ghimbirul și ardeiul iute verde și lasă 30 de secunde, amestecând, până se simte aroma.',
          ),
          timerSeconds: 30,
        },
        {
          key: 'spices',
          text: t(
            'Stir in the turmeric, ground coriander and chilli powder and stir for a few seconds only, then add the cabbage straight away so the spices do not burn.',
            'Amestecă turmericul, coriandrul măcinat și ardeiul iute măcinat, amestecă doar câteva secunde, apoi pune imediat varza, ca să nu se ardă condimentele.',
          ),
        },
        {
          key: 'cabbage',
          text: t(
            'Add the salt and cook the cabbage uncovered for 6 minutes, stirring often, until it wilts and starts to catch gold at the edges.',
            'Adaugă sarea și gătește varza descoperită 6 minute, amestecând des, până se ofilește și începe să se aurească pe margini.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'peas',
          text: t(
            'Add the peas straight from the freezer and cook for 4 minutes, stirring, until they are hot through and the cabbage is tender with a little bite left.',
            'Adaugă mazărea direct din congelator și gătește 4 minute, amestecând, până se încălzește bine și varza e fragedă, dar mai are puțină consistență.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'finish',
          text: t(
            'Take off the heat, stir in the garam masala, the fresh coriander and the lemon juice if using. Taste for salt and serve hot.',
            'Ia de pe foc, amestecă garam masala, coriandrul proaspăt și sucul de lămâie, dacă folosești. Gustă de sare și servește fierbinte.',
          ),
        },
      ],
      tips: [
        t(
          'Cooking it uncovered over high heat keeps a little bite and some browning. Covered, as many Indian home cooks make it, the cabbage steams and turns softer.',
          'Gătită descoperită, la foc tare, varza păstrează puțină consistență și se rumenește pe alocuri. Acoperită, cum o fac multe gospodine din India, se fierbe în abur și iese mai moale.',
        ),
      ],
      stepTips: [
        {
          step: 'spices',
          text: t(
            'If your pan is very hot, take it off the heat for a moment before the ground spices go in; they scorch in seconds and turn bitter.',
            'Dacă tigaia e foarte încinsă, ia-o o clipă de pe foc înainte să pui condimentele măcinate; se ard în câteva secunde și amărăsc.',
          ),
        },
      ],
      nutritionNote: t(
        'Cabbage and peas give fibre and some plant protein for very little fat, and the spices add flavour without much salt. The oil still adds energy, so measure it, and eat it with rice or flatbread for a fuller meal.',
        'Varza și mazărea aduc fibre și ceva proteine vegetale cu foarte puține grăsimi, iar condimentele dau gust fără multă sare. Uleiul adaugă totuși energie, așa că măsoară-l, și servește cu orez sau lipie pentru o masă mai săturătoare.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Home-style chicken curry', 'Curry de pui'),
          reason: t(
            'A dry sabzi next to a saucy curry gives you a vegetable with texture beside the gravy.',
            'O garnitură de legume sotate, fără sos, lângă un curry cu sos aduce textură.',
          ),
          principle: 'contrast_texture',
          recipe: 'chicken-curry',
        },
        {
          kind: 'food',
          label: t('Naan', 'Naan'),
          reason: t(
            'Soft bread to scoop up the cabbage and peas.',
            'Pâine moale cu care iei varza și mazărea.',
          ),
          principle: 'complement_flavour',
          ingredient: 'naan',
        },
        {
          kind: 'food',
          label: t('Basmati rice', 'Orez basmati'),
          reason: t(
            'Plain rice soaks up the spices and turns the dish into a full meal.',
            'Orezul simplu ia în el condimentele și transformă preparatul într-o masă completă.',
          ),
          principle: 'complement_flavour',
          ingredient: 'basmati-rice',
        },
        {
          kind: 'food',
          label: t('Yogurt', 'Iaurt'),
          reason: t(
            'Cool yogurt tames the chilli heat and refreshes the palate.',
            'Iaurtul rece domolește iuțeala și împrospătează gustul.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'yogurt',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Quick, light and full of vegetables.',
            'Rapid, ușor și plin de legume.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Cabbage fibre and chilli can sit uncomfortably when you are about to exercise.',
            'Fibrele din varză și iuțeala pot deranja înainte de efort.',
          ),
        },
      ],
    },
  ],
};
