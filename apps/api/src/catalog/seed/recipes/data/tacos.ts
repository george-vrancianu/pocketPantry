import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Tacos base is a family taco night with spiced beef mince in crisp shells.
// The Variants change the filling and the tortilla: al pastor pork on corn
// tortillas, and Korean BBQ beef tacos. Each is a full Recipe; the base's
// Recipe-level Tips are inherited unless hidden.
export const tacos: BaseRecipeSeed = {
  slug: 'tacos',
  title: t(
    'Beef tacos (taco night)',
    'Tacos cu carne de vită (seara de tacos)',
  ),
  servings: 4,
  prepMinutes: 15,
  cookMinutes: 25,
  difficulty: 'easy',
  lines: [
    { ingredient: 'sunflower-oil', quantity: 15, unit: 'ml' },
    {
      ingredient: 'onion',
      quantity: 1,
      unit: 'pcs',
      note: t('finely chopped', 'tocată mărunt'),
    },
    {
      ingredient: 'garlic',
      quantity: 6,
      unit: 'g',
      note: t('2 cloves, crushed', '2 căței, striviți'),
    },
    { ingredient: 'minced-beef', quantity: 500, unit: 'g' },
    { ingredient: 'chili-powder', quantity: 6, unit: 'g' },
    { ingredient: 'cumin', quantity: 4, unit: 'g' },
    { ingredient: 'paprika', quantity: 4, unit: 'g' },
    { ingredient: 'oregano', quantity: 2, unit: 'g' },
    { ingredient: 'garlic-powder', quantity: 2, unit: 'g' },
    { ingredient: 'tomato-paste', quantity: 30, unit: 'g' },
    { ingredient: 'still-water', quantity: 0.1, unit: 'l' },
    { ingredient: 'salt', quantity: 5, unit: 'g' },
    { ingredient: 'taco-shells', quantity: 12, unit: 'pcs' },
    {
      ingredient: 'iceberg-lettuce',
      quantity: 0.5,
      unit: 'pcs',
      note: t('finely shredded', 'tăiată fideluță'),
    },
    {
      ingredient: 'cheddar',
      quantity: 100,
      unit: 'g',
      note: t('grated', 'ras'),
    },
    { ingredient: 'sour-cream', quantity: 150, unit: 'g' },
    {
      ingredient: 'tomato',
      quantity: 250,
      unit: 'g',
      note: t('for the pico de gallo, diced', 'pentru pico de gallo, cubulețe'),
    },
    {
      ingredient: 'red-onion',
      quantity: 0.5,
      unit: 'pcs',
      note: t(
        'for the pico de gallo, finely chopped',
        'pentru pico de gallo, tocată mărunt',
      ),
    },
    {
      ingredient: 'coriander',
      quantity: 15,
      unit: 'g',
      note: t('chopped', 'tocat'),
    },
    { ingredient: 'lime', quantity: 1, unit: 'pcs' },
    {
      ingredient: 'hot-pepper',
      quantity: 1,
      unit: 'pcs',
      optional: true,
      note: t(
        'for the pico de gallo, finely chopped',
        'pentru pico de gallo, tocat mărunt',
      ),
    },
  ],
  steps: [
    {
      key: 'pico',
      text: t(
        'Make the pico de gallo: mix the diced tomato, red onion, coriander, the juice of the lime, the hot pepper if you use it and a pinch of salt. Leave it at room temperature while you cook. Shred the lettuce and grate the cheddar now too, so your hands are free of raw meat later.',
        'Pregătește pico de gallo: amestecă roșiile tăiate cubulețe, ceapa roșie, coriandrul, sucul de la lime, ardeiul iute (dacă îl folosești) și un praf de sare. Las-o la temperatura camerei cât gătești. Mărunțește acum și salata și rade cheddarul, ca să nu le atingi mai târziu cu mâinile care au ținut carnea crudă.',
      ),
    },
    {
      key: 'preheat',
      text: t(
        'Heat the oven to 180 °C so it is hot when the meat is ready.',
        'Încinge cuptorul la 180 °C, ca să fie fierbinte când e gata carnea.',
      ),
    },
    {
      key: 'soften',
      text: t(
        'Heat the sunflower oil in a large frying pan over medium heat and soften the chopped onion for about 5 minutes, until translucent and just starting to colour.',
        'Încinge uleiul de floarea-soarelui într-o tigaie mare la foc mediu și înmoaie ceapa tocată aproximativ 5 minute, până devine translucidă și abia începe să se coloreze.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'brown',
      text: t(
        'Raise the heat to medium-high, add the minced beef and break it up with a wooden spoon. Cook for about 8 minutes, until it has browned and no pink is left anywhere; the meat must be cooked through, with the biggest clump reading 71 °C.',
        'Mărește focul la mediu spre mare, adaugă carnea de vită tocată și mărunțește-o cu o lingură de lemn. Gătește aproximativ 8 minute, până se rumenește și nu mai rămâne deloc roz nicăieri; carnea trebuie gătită complet, iar cel mai mare bulgăre să arate 71 °C.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'wash',
      text: t(
        'Wash your hands with soap and hot water, and the board, spoon and anything else that touched the raw mince, before you touch the shells and toppings.',
        'Spală-te pe mâini cu săpun și apă caldă și spală și tocătorul, lingura și orice altceva a atins carnea tocată crudă, înainte să atingi cojile și garniturile.',
      ),
    },
    {
      key: 'spice',
      text: t(
        'Stir in the garlic, chilli powder, cumin, paprika, oregano, garlic powder and tomato paste. Fry for 1 minute, stirring, until fragrant.',
        'Adaugă usturoiul, ardeiul iute măcinat, chimionul, boiaua, oregano, usturoiul granulat și pasta de roșii. Prăjește un minut, amestecând, până se simte aroma.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'simmer',
      text: t(
        'Pour in the water and the salt and simmer for about 5 minutes, stirring now and then, until the sauce clings to the meat and the pan is nearly dry.',
        'Toarnă apa și sarea și fierbe la foc mic aproximativ 5 minute, amestecând din când în când, până când sosul se prinde de carne și în tigaie nu mai rămâne aproape deloc lichid.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'warm',
      text: t(
        'Stand the taco shells upright, open side up, in a baking dish and warm them in the oven for 5 minutes, until crisp.',
        'Așază cojile de tacos în picioare, cu deschiderea în sus, într-o tavă și încălzește-le în cuptor 5 minute, până devin crocante.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'serve',
      text: t(
        'Spoon the meat into a clean warm bowl, not onto the plate or bowl that held the raw mince. Put it on the table with the shells, pico de gallo, lettuce, cheddar and sour cream, and let everyone fill their own.',
        'Pune carnea într-un castron curat și cald, nu pe farfuria sau în vasul în care a stat carnea tocată crudă. Adu-l la masă împreună cu cojile, pico de gallo, salata, cheddarul și smântâna, iar fiecare își umple singur tacos-ul.',
      ),
    },
  ],
  tips: [
    t(
      'Fill the shells at the table, one at a time, and keep the wet pico de gallo for the top: a filled shell goes soft within minutes. Soft flour tortillas (tortilla wraps) work in place of the shells; warm them for about 20 seconds per side in a dry pan.',
      'Umple cojile la masă, pe rând, și pune pico de gallo deasupra: o coajă umplută se înmoaie în câteva minute. În loc de coji poți folosi tortilla moi din făină (tortilla wraps); încălzește-le circa 20 de secunde pe fiecare parte într-o tigaie uscată.',
    ),
    t(
      'Cool leftover meat within 2 hours, keep it in the fridge for up to 3 days and reheat it until steaming hot all the way through.',
      'Răcește carnea rămasă în maximum 2 ore, păstreaz-o la frigider cel mult 3 zile și reîncălzește-o până e fierbinte și scoate aburi peste tot.',
    ),
  ],
  stepTips: [
    {
      step: 'brown',
      text: t(
        'Press the mince flat and leave it for a couple of minutes before breaking it up, so it browns instead of turning grey.',
        'Apasă carnea tocată pe fundul tigăii și las-o câteva minute înainte s-o mărunțești, ca să se rumenească în loc să devină cenușie.',
      ),
    },
    {
      step: 'simmer',
      text: t(
        'The filling is ready when a spoon dragged across the pan leaves a trail that closes slowly; a wet filling soaks through the shells.',
        'Umplutura e gata când lingura trasă prin tigaie lasă o urmă care se închide încet; o umplutură prea udă înmoaie cojile.',
      ),
    },
  ],
  nutritionNote: t(
    'Beef gives plenty of protein and the pico de gallo and lettuce add freshness and some fibre; the beef, cheddar and sour cream bring saturated fat, the shells are fried, and the salt adds up with the cheese, so go lighter on the cheese and cream if you want a leaner plate.',
    'Carnea de vită oferă multe proteine, iar pico de gallo și salata adaugă prospețime și puține fibre; vita, cheddarul și smântâna aduc grăsimi saturate, cojile sunt prăjite, iar sarea se adună cu cea din brânză, așa că pune mai puțin cheddar și smântână dacă vrei o farfurie mai ușoară.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Hot sauce', 'Sos picant'),
      reason: t(
        'A few drops add heat and sharpness to the mild, rich beef, and everyone can set their own level.',
        'Câteva picături adaugă iuțeală și aciditate cărnii blânde și bogate, iar fiecare își alege cât de iute vrea.',
      ),
      principle: 'complement_flavour',
      ingredient: 'hot-sauce',
    },
    {
      kind: 'food',
      label: t('Sliced avocado', 'Avocado feliat'),
      reason: t(
        'Cool and creamy, it calms the chilli and gives the crisp shell something soft to bite against.',
        'Rece și cremos, domolește iuțeala și oferă cojii crocante un contrast moale.',
      ),
      principle: 'contrast_texture',
      ingredient: 'avocado',
    },
    {
      kind: 'drink',
      label: t('Cold lager', 'Bere lager rece'),
      reason: t(
        'The fizz and light bitterness refresh the palate between spicy, cheesy bites.',
        'Bulele și amăreala ușoară împrospătează gustul între îmbucături picante, cu brânză.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'beer',
    },
  ],
  eatingMoments: [
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Protein from the beef and carbohydrates from the shells help recovery.',
        'Proteinele din vită și carbohidrații din coji ajută la refacere.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'good_for',
      reason: t(
        'The cold, fresh toppings keep the plate light.',
        'Garniturile reci și proaspete țin farfuria ușoară.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'The spice, cheese and fried shells can sit heavy and cause heartburn lying down.',
        'Condimentele, brânza și cojile prăjite pot cădea greu și pot da arsuri când te culci.',
      ),
    },
  ],
  variants: [
    {
      slug: 'tacos-mexican',
      cuisine: 'mexican',
      // The shells are replaced by corn tortillas.
      hideBaseTips: [0],
      title: t(
        'Tacos al pastor (Mexican chilli-and-achiote pork with pineapple)',
        'Tacos al pastor (porc mexican marinat cu ardei uscați și achiote, cu ananas)',
      ),
      servings: 6,
      prepMinutes: 540,
      cookMinutes: 30,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'pork-shoulder',
          quantity: 900,
          unit: 'g',
          note: t(
            'sliced thinly across the grain',
            'tăiată subțire, pe curmezișul fibrelor',
          ),
        },
        {
          ingredient: 'guajillo-chillies',
          quantity: 30,
          unit: 'g',
          note: t(
            'about 6, stems and seeds removed',
            'aproximativ 6, fără cozi și semințe',
          ),
        },
        {
          ingredient: 'ancho-chillies',
          quantity: 25,
          unit: 'g',
          note: t(
            'about 2, stems and seeds removed',
            'aproximativ 2, fără cozi și semințe',
          ),
        },
        {
          ingredient: 'still-water',
          quantity: 0.25,
          unit: 'l',
          note: t(
            'just boiled, for soaking the chillies',
            'tocmai fiartă, pentru înmuiat ardeii',
          ),
        },
        { ingredient: 'achiote-paste', quantity: 40, unit: 'g' },
        {
          ingredient: 'garlic',
          quantity: 12,
          unit: 'g',
          note: t('4 cloves', '4 căței'),
        },
        { ingredient: 'vinegar', quantity: 60, unit: 'ml' },
        { ingredient: 'orange-juice', quantity: 100, unit: 'ml' },
        { ingredient: 'cumin', quantity: 4, unit: 'g' },
        { ingredient: 'cloves', quantity: 1, unit: 'g' },
        { ingredient: 'salt', quantity: 9, unit: 'g' },
        { ingredient: 'sunflower-oil', quantity: 45, unit: 'ml' },
        {
          ingredient: 'pineapple',
          quantity: 0.5,
          unit: 'pcs',
          note: t(
            'peeled, cored and cut into 1 cm rings',
            'curățat, fără miez, tăiat în rondele de 1 cm',
          ),
        },
        { ingredient: 'corn-tortillas', quantity: 18, unit: 'pcs' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('raw, finely chopped', 'crudă, tocată mărunt'),
        },
        {
          ingredient: 'coriander',
          quantity: 20,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'lime',
          quantity: 2,
          unit: 'pcs',
          note: t('cut into wedges', 'tăiate felii'),
        },
      ],
      steps: [
        {
          key: 'toast',
          text: t(
            'Press the guajillo and ancho chillies flat, a few at a time, in a dry heavy pan over medium heat for a few seconds per side, until fragrant and slightly puffed. Do not let them blacken: scorched chillies turn the marinade bitter.',
            'Apasă ardeii guajillo și ancho pe fundul unei tigăi grele, uscate, la foc mediu, câțiva deodată, câteva secunde pe fiecare parte, până miros plăcut și se umflă ușor. Nu-i lăsa să se înnegrească: ardeii arși fac marinata amară.',
          ),
        },
        {
          key: 'soak',
          text: t(
            'Put the toasted chillies in a bowl, cover with the just-boiled water and leave them for 20 minutes, until soft.',
            'Pune ardeii prăjiți într-un bol, acoperă-i cu apa tocmai fiartă și lasă-i 20 de minute, până se înmoaie.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'blend',
          text: t(
            'Lift the chillies out and blend them with the achiote paste, garlic, vinegar, orange juice, cumin, cloves, salt and about 100 ml of the soaking water, until completely smooth.',
            'Scoate ardeii și mixează-i cu pasta de achiote, usturoiul, oțetul, sucul de portocale, chimionul, cuișoarele, sarea și aproximativ 100 ml din apa de la înmuiat, până obții un piure fin.',
          ),
        },
        {
          key: 'marinate',
          text: t(
            'Coat the pork slices in the marinade, cover and leave them in the fridge for at least 8 hours or overnight, and no longer than 24 hours. Then wash your hands, the knife and the board with soap and hot water.',
            'Acoperă fâșiile de porc cu marinata, pune capac și lasă-le la frigider cel puțin 8 ore sau peste noapte, dar nu mai mult de 24 de ore. Apoi spală-te pe mâini, cuțitul și tocătorul cu săpun și apă caldă.',
          ),
          timerSeconds: 28800,
        },
        {
          key: 'prep',
          text: t(
            'Chop the onion and coriander and cut the limes into wedges. Do this before the pork goes in the pan, so you do not handle them with hands that touched raw pork.',
            'Toacă ceapa și coriandrul și taie lime-urile în felii. Fă asta înainte să pui porcul în tigaie, ca să nu le atingi cu mâinile care au ținut carnea crudă de porc.',
          ),
        },
        {
          key: 'pineapple',
          text: t(
            'Heat a dry heavy pan until very hot and char the pineapple rings for about 6 minutes in total, turning once, until browned in places. Cut them into small pieces.',
            'Încinge puternic o tigaie grea, uscată, și rumenește rondelele de ananas aproximativ 6 minute în total, întorcându-le o dată, până se rumenesc pe alocuri. Taie-le bucățele mici.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'sear',
          text: t(
            'Heat a little of the sunflower oil in the same pan over high heat. Lay a quarter of the pork in a single layer, without crowding, and cook for about 4 minutes in total, turning once, until the edges are charred and a slice cut open is opaque and firm right through, with clear juices (63 °C, then rest 3 minutes). Move each batch to a clean plate, never the one that held the raw pork, and repeat with the rest; discard any marinade left in the bowl.',
            'Încinge puțin din uleiul de floarea-soarelui în aceeași tigaie, la foc mare. Pune un sfert din porc într-un singur strat, fără să aglomerezi, și gătește aproximativ 4 minute în total, întorcând o dată, până când marginile sunt arse ușor, iar o fâșie tăiată e opacă și fermă până în mijloc, cu suc limpede (63 °C, apoi 3 minute de odihnă). Mută fiecare șarjă pe o farfurie curată, niciodată pe cea în care a stat porcul crud, și repetă cu restul; aruncă marinata rămasă în bol.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'wash',
          text: t(
            'Wash your hands with soap and hot water, together with the tongs and the bowl that touched the raw pork.',
            'Spală-te pe mâini cu săpun și apă caldă, la fel și cleștele și bolul care au atins porcul crud.',
          ),
        },
        {
          key: 'chop',
          text: t(
            'On a clean board, slice the rested pork into small bite-size pieces and mix in the pineapple.',
            'Pe un tocător curat, taie porcul odihnit în bucățele mici și amestecă-l cu ananasul.',
          ),
        },
        {
          key: 'tortillas',
          text: t(
            'Warm the corn tortillas in a dry hot pan for about 30 seconds per side, until soft and flecked with brown, and keep them wrapped in a clean tea towel.',
            'Încălzește tortilla de porumb într-o tigaie uscată și fierbinte, circa 30 de secunde pe fiecare parte, până se înmoaie și capătă pete rumene, și ține-le înfășurate într-un prosop curat.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'assemble',
          text: t(
            'Fill each tortilla with the pork and pineapple, then top with raw onion and coriander and squeeze over some lime.',
            'Umple fiecare tortilla cu porc și ananas, apoi adaugă ceapă crudă și coriandru și stoarce deasupra puțin lime.',
          ),
        },
      ],
      tips: [
        t(
          'Freeze the pork shoulder for 30 minutes before slicing: firm meat cuts into thin, even slices.',
          'Ține carnea de porc la congelator 30 de minute înainte să o tai: carnea fermă se taie în felii subțiri și egale.',
        ),
      ],
      stepTips: [
        {
          step: 'marinate',
          text: t(
            'Always marinate raw pork in the fridge, never on the counter. The longer it sits, the deeper the flavour.',
            'Marinează porcul crud întotdeauna la frigider, niciodată pe blat. Cu cât stă mai mult, cu atât gustul e mai adânc.',
          ),
        },
        {
          step: 'sear',
          text: t(
            'Sear in batches: too much meat in the pan steams instead of charring.',
            'Rumenește pe șarje: dacă pui prea multă carne, aceasta se fierbe în abur în loc să se rumenească.',
          ),
        },
      ],
      nutritionNote: t(
        'Plenty of protein, and the chillies, pineapple, onion and coriander give a lot of flavour for little added fat; pork shoulder is a fatty cut so it still brings saturated fat, and the salted marinade adds salt, so go easy on more at the table.',
        'Multe proteine, iar ardeii, ananasul, ceapa și coriandrul dau mult gust cu puțină grăsime adăugată; spata de porc e o bucată grasă, deci aduce totuși grăsimi saturate, iar marinata sărată adaugă sare, așa că fii zgârcit cu sarea la masă.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Sliced avocado', 'Avocado feliat'),
          reason: t(
            'Cool and creamy, it calms the chilli heat of the marinade.',
            'Rece și cremos, domolește iuțeala ardeiului din marinată.',
          ),
          principle: 'complement_flavour',
          ingredient: 'avocado',
        },
        {
          kind: 'drink',
          label: t('Cold lager', 'Bere lager rece'),
          reason: t(
            'The fizz and light bitterness refresh the palate between smoky, spicy bites.',
            'Bulele și amăreala ușoară împrospătează gustul între îmbucături afumate și picante.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
        {
          kind: 'drink',
          label: t('Lemonade', 'Limonadă'),
          reason: t(
            'Sweet and sharp, it cools the chilli and cuts through the pork.',
            'Dulce și acrișoară, răcorește iuțeala și taie grăsimea porcului.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'lemonade',
        },
      ],
      eatingMoments: [
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Fresh pineapple, lime and coriander make the spiced pork feel light.',
            'Ananasul proaspăt, lime și coriandrul fac porcul condimentat să pară ușor.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from the pork and carbohydrates from the tortillas help recovery.',
            'Proteinele din porc și carbohidrații din tortilla ajută la refacere.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Chilli and acidity can cause heartburn lying down.',
            'Ardeiul iute și aciditatea pot da arsuri când te culci.',
          ),
        },
      ],
    },
    {
      slug: 'tacos-korean',
      cuisine: 'korean',
      // The shells are replaced by corn tortillas.
      hideBaseTips: [0],
      title: t(
        'Korean BBQ beef tacos (bulgogi tacos with kimchi slaw)',
        'Tacos coreene cu vită bulgogi și salată de kimchi',
      ),
      servings: 4,
      prepMinutes: 55,
      cookMinutes: 12,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'beef-steak',
          quantity: 500,
          unit: 'g',
          note: t(
            'ribeye, sliced very thinly',
            'antricot, tăiat foarte subțire',
          ),
        },
        { ingredient: 'soy-sauce', quantity: 45, unit: 'ml' },
        { ingredient: 'brown-sugar', quantity: 20, unit: 'g' },
        {
          ingredient: 'garlic',
          quantity: 12,
          unit: 'g',
          note: t('4 cloves, grated', '4 căței, dați pe răzătoare'),
        },
        {
          ingredient: 'ginger',
          quantity: 10,
          unit: 'g',
          note: t('grated', 'dat pe răzătoare'),
        },
        {
          ingredient: 'sesame-oil',
          quantity: 15,
          unit: 'ml',
          note: t('for the marinade', 'pentru marinată'),
        },
        {
          ingredient: 'gochujang',
          quantity: 30,
          unit: 'g',
          note: t('for the marinade', 'pentru marinată'),
        },
        { ingredient: 'sunflower-oil', quantity: 30, unit: 'ml' },
        { ingredient: 'corn-tortillas', quantity: 12, unit: 'pcs' },
        {
          ingredient: 'kimchi',
          quantity: 120,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'cabbage',
          quantity: 150,
          unit: 'g',
          note: t('finely shredded', 'tăiată fideluță'),
        },
        {
          ingredient: 'spring-onion',
          quantity: 30,
          unit: 'g',
          note: t('sliced', 'tăiată rondele'),
        },
        { ingredient: 'rice-vinegar', quantity: 15, unit: 'ml' },
        {
          key: 'sesame-oil-slaw',
          ingredient: 'sesame-oil',
          quantity: 5,
          unit: 'ml',
          note: t('for the slaw', 'pentru salată'),
        },
        {
          ingredient: 'mayonnaise',
          quantity: 60,
          unit: 'g',
          optional: true,
        },
        {
          key: 'gochujang-mayo',
          ingredient: 'gochujang',
          quantity: 15,
          unit: 'g',
          optional: true,
          note: t('for the drizzle', 'pentru maioneza picantă'),
        },
        { ingredient: 'sesame-seeds', quantity: 6, unit: 'g' },
        {
          ingredient: 'coriander',
          quantity: 15,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'lime',
          quantity: 1,
          unit: 'pcs',
          note: t('cut into wedges', 'tăiată felii'),
        },
      ],
      steps: [
        {
          key: 'slice',
          text: t(
            'Slice the steak across the grain into slices as thin as you can manage, and put them in a bowl.',
            'Taie friptura pe curmezișul fibrelor în felii cât mai subțiri și pune-le într-un bol.',
          ),
        },
        {
          key: 'marinate',
          text: t(
            'Mix the soy sauce, brown sugar, garlic, ginger, the marinade sesame oil and the marinade gochujang, pour it over the beef and turn to coat. Cover and refrigerate for at least 30 minutes, or up to overnight. Then wash your hands, the knife and the board with soap and hot water.',
            'Amestecă sosul de soia, zahărul brun, usturoiul, ghimbirul, uleiul de susan și gochujang pentru marinată, toarnă peste vită și amestecă ca s-o acoperi. Acoperă și ține la frigider cel puțin 30 de minute sau chiar peste noapte. Apoi spală-te pe mâini, cuțitul și tocătorul cu săpun și apă caldă.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'slaw',
          text: t(
            'Toss the kimchi, cabbage and spring onion with the rice vinegar and the slaw sesame oil, and keep the slaw in the fridge until serving.',
            'Amestecă kimchi, varza și ceapa verde cu oțetul de orez și uleiul de susan pentru salată și ține salata la frigider până servești.',
          ),
        },
        {
          key: 'mayo',
          text: t(
            'If you use it, stir the drizzle gochujang into the mayonnaise with a squeeze of lime. Cut the rest of the lime into wedges.',
            'Dacă îl folosești, amestecă în maioneză gochujang-ul pentru maioneza picantă și puțin suc de lime. Taie restul de lime în felii.',
          ),
        },
        {
          key: 'sear',
          text: t(
            'Heat half of the sunflower oil in a heavy pan over high heat until very hot and just starting to smoke. Shake the excess marinade off half of the beef, lay it in a single layer and cook for about 2 minutes in total, turning once, until browned and charred at the edges with no pink. Move it to a clean plate, never the one that held the raw beef, and repeat with the rest. Throw away the marinade left in the bowl.',
            'Încinge jumătate din uleiul de floarea-soarelui într-o tigaie grea, la foc mare, până e foarte fierbinte și abia începe să fumege. Scutură excesul de marinată de pe jumătate din vită, așaz-o într-un singur strat și gătește aproximativ 2 minute în total, întorcând o dată, până se rumenește și se arde ușor la margini, fără urmă de roz. Mut-o pe o farfurie curată, niciodată pe cea în care a stat vita crudă, și repetă cu restul. Aruncă marinata rămasă în bol.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'wash',
          text: t(
            'Wash your hands with soap and hot water, together with the tongs and the bowl that touched the raw beef, before you touch the tortillas and toppings.',
            'Spală-te pe mâini cu săpun și apă caldă, la fel și cleștele și bolul care au atins vita crudă, înainte să atingi tortilla și garniturile.',
          ),
        },
        {
          key: 'tortillas',
          text: t(
            'Char the corn tortillas in a dry hot pan for about 30 seconds per side, until soft and flecked with brown, and keep them wrapped in a clean tea towel.',
            'Rumenește tortilla de porumb într-o tigaie uscată și fierbinte, circa 30 de secunde pe fiecare parte, până se înmoaie și capătă pete rumene, și ține-le înfășurate într-un prosop curat.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'assemble',
          text: t(
            'Fill each tortilla with beef and slaw, drizzle with the gochujang mayo, if using, and finish with sesame seeds, coriander and a squeeze of lime.',
            'Umple fiecare tortilla cu vită și salată, stropește cu maioneza cu gochujang, dacă ai făcut-o, și termină cu semințe de susan, coriandru și puțin suc de lime.',
          ),
        },
      ],
      tips: [
        t(
          'Bulgogi tacos are a Korean-Mexican dish from Los Angeles: Korean marinade and kimchi in a Mexican taco. Keep the tortillas small and the filling modest so they fold without tearing.',
          'Tacos-urile cu bulgogi sunt un preparat coreeano-mexican din Los Angeles: marinată coreeană și kimchi într-un taco mexican. Folosește tortilla mici și o umplutură moderată, ca să se plieze fără să se rupă.',
        ),
      ],
      stepTips: [
        {
          step: 'slice',
          text: t(
            'Freeze the steak for 30 minutes first: firm meat slices much thinner.',
            'Ține friptura 30 de minute la congelator înainte: carnea fermă se taie mult mai subțire.',
          ),
        },
        {
          step: 'sear',
          text: t(
            'The sugar in the marinade scorches fast: sear in small batches over a very hot pan so each slice browns instead of stewing.',
            'Zahărul din marinată se arde repede: rumenește pe șarje mici într-o tigaie foarte încinsă, ca fiecare felie să se rumenească în loc să fiarbă în suc.',
          ),
        },
      ],
      nutritionNote: t(
        'Plenty of protein, and the kimchi and cabbage slaw add crunch and fibre; ribeye is a fatty cut, soy sauce, gochujang and kimchi are all salty, and the mayonnaise drizzle adds extra fat, so keep the drizzle light.',
        'Multe proteine, iar salata de kimchi și varză adaugă textură crocantă și fibre; antricotul e o bucată grasă, sosul de soia, gochujang și kimchi sunt sărate, iar maioneza adaugă grăsime în plus, așa că pune puțin sos deasupra.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Sliced cucumber', 'Castravete feliat'),
          reason: t(
            'A cooling side for anyone who finds the gochujang hot.',
            'O garnitură răcoritoare pentru cei care găsesc gochujang prea iute.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'cucumber',
        },
        {
          kind: 'drink',
          label: t('Cold lager', 'Bere lager rece'),
          reason: t(
            'The fizz and light bitterness cut through the rich, spicy beef.',
            'Bulele și amăreala ușoară taie bogăția cărnii picante.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
        {
          kind: 'drink',
          label: t('Green tea', 'Ceai verde'),
          reason: t(
            'Its light bitterness cleanses the palate after the salty, sweet marinade.',
            'Amăreala ușoară împrospătează gustul după marinata sărată și dulce.',
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
            'Quick to cook, and the crunchy slaw balances the rich beef; skip the mayonnaise to keep it lighter.',
            'Se gătește repede, iar salata crocantă echilibrează carnea bogată; renunță la maioneză ca să fie mai ușoară.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from the beef and carbohydrates from the tortillas help recovery.',
            'Proteinele din vită și carbohidrații din tortilla ajută la refacere.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Spicy, salty and rich, it can cause heartburn and thirst at night.',
            'Picantă, sărată și bogată, poate da arsuri și sete în timpul nopții.',
          ),
        },
      ],
    },
  ],
};
