import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Chili con carne base is a home-style mince chili with kidney beans,
// simmered on the hob and served over rice. Each Variant is a full Recipe with
// its own lines, steps and guidance; the base's Recipe-level Tips are inherited
// unless a Variant hides them.
export const chiliConCarne: BaseRecipeSeed = {
  slug: 'chili-con-carne',
  title: t('Chili con carne', 'Chili con carne'),
  servings: 6,
  prepMinutes: 20,
  cookMinutes: 90,
  difficulty: 'easy',
  lines: [
    { ingredient: 'minced-beef', quantity: 750, unit: 'g' },
    { ingredient: 'sunflower-oil', quantity: 30, unit: 'ml' },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('finely chopped', 'tocate mărunt'),
    },
    {
      ingredient: 'bell-pepper',
      quantity: 1,
      unit: 'pcs',
      note: t('red, diced', 'roșu, tăiat cubulețe'),
    },
    {
      ingredient: 'garlic',
      quantity: 12,
      unit: 'g',
      note: t('crushed', 'zdrobit'),
    },
    {
      ingredient: 'hot-pepper',
      quantity: 1,
      unit: 'pcs',
      optional: true,
      note: t(
        'fresh red chilli, finely chopped; deseed for less heat',
        'ardei iute roșu proaspăt, tocat mărunt; scoate semințele pentru mai puțin iute',
      ),
    },
    {
      ingredient: 'chili-powder',
      quantity: 8,
      unit: 'g',
      note: t(
        'mild or medium; use half if yours is hot',
        'dulce-iute sau mediu; pune jumătate dacă e foarte iute',
      ),
    },
    { ingredient: 'cumin', quantity: 6, unit: 'g' },
    { ingredient: 'oregano', quantity: 3, unit: 'g' },
    { ingredient: 'smoked-paprika', quantity: 5, unit: 'g', optional: true },
    { ingredient: 'tomato-paste', quantity: 45, unit: 'g' },
    { ingredient: 'canned-tomatoes', quantity: 800, unit: 'g' },
    { ingredient: 'beef-stock', quantity: 300, unit: 'ml' },
    {
      ingredient: 'canned-kidney-beans',
      quantity: 480,
      unit: 'g',
      note: t('drained weight, rinsed', 'greutate scursă, clătită'),
    },
    { ingredient: 'salt', quantity: 8, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
    {
      ingredient: 'rice',
      quantity: 400,
      unit: 'g',
      note: t('to serve', 'pentru servit'),
    },
    {
      ingredient: 'salt',
      key: 'rice-salt',
      quantity: 12,
      unit: 'g',
      note: t('for the rice water', 'pentru apa orezului'),
    },
    {
      ingredient: 'sour-cream',
      quantity: 150,
      unit: 'g',
      note: t('to serve', 'pentru servit'),
    },
    {
      ingredient: 'cheddar',
      quantity: 120,
      unit: 'g',
      note: t('grated, to serve', 'ras, pentru servit'),
    },
    {
      ingredient: 'coriander',
      quantity: 15,
      unit: 'g',
      optional: true,
      note: t('chopped, to serve', 'tocat, pentru servit'),
    },
  ],
  steps: [
    {
      key: 'prep',
      text: t(
        'Chop the onions and pepper, crush the garlic and drain and rinse the beans. Open the tomatoes and have the spices, the paste and the stock within reach.',
        'Toacă ceapa și ardeiul, zdrobește usturoiul, scurge și clătește fasolea. Deschide roșiile și pregătește la îndemână condimentele, pasta și supa.',
      ),
    },
    {
      key: 'brown',
      text: t(
        'Heat the oil in a large heavy pot over medium-high heat. Add the mince, break it up with a wooden spoon and cook for about 10 minutes, until no pink remains and it is browned in places and sizzling rather than steaming.',
        'Încinge uleiul într-o oală mare cu fund gros la foc mediu spre mare. Adaugă carnea tocată, sfarm-o cu o lingură de lemn și gătește-o cam 10 minute, până nu mai rămâne roz, se rumenește pe alocuri și sfârâie în loc să facă abur.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'soften',
      text: t(
        'Add the onions and bell pepper. Cook over medium heat, stirring now and then, for about 6 minutes, until the onion is soft and translucent.',
        'Adaugă ceapa și ardeiul gras. Gătește la foc mediu, amestecând din când în când, cam 6 minute, până ceapa se înmoaie și devine translucidă.',
      ),
      timerSeconds: 360,
    },
    {
      key: 'spices',
      text: t(
        'Stir in the garlic, the fresh chilli if you use it, the chilli powder, cumin, oregano, smoked paprika and tomato paste. Cook for 1 minute, stirring, until the paste darkens slightly and the spices smell fragrant.',
        'Adaugă usturoiul, ardeiul iute proaspăt dacă folosești, ardeiul iute măcinat, chimionul, oregano, boia afumată și pasta de roșii. Gătește 1 minut, amestecând, până pasta se închide puțin la culoare și condimentele miros bine.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'liquid',
      text: t(
        'Pour in the tomatoes and the stock, add the salt and pepper, and scrape the bottom of the pot to lift any browned bits. Bring to the boil, which takes about 5 minutes.',
        'Toarnă roșiile și supa, adaugă sarea și piperul și răzuiește fundul oalei ca să se desprindă bucățelele rumenite. Adu la fierbere, ceea ce durează cam 5 minute.',
      ),
    },
    {
      key: 'simmer',
      text: t(
        'Turn the heat down to low, set the lid ajar and simmer for 45 minutes, stirring every 10 minutes or so, until the sauce has thickened and darkened.',
        'Dă focul la mic, pune capacul întredeschis și fierbe 45 de minute, amestecând cam la fiecare 10 minute, până sosul se îngroașă și se închide la culoare.',
      ),
      timerSeconds: 2700,
    },
    {
      key: 'rice',
      text: t(
        'About 10 minutes before the 45 minutes are up, bring about 3 litres of water to the boil with the rice salt, which takes about 10 minutes. Add the rice and boil for 12 minutes, until tender, then drain well. It finishes while the beans simmer.',
        'Cu cam 10 minute înainte să se împlinească cele 45 de minute, adu la fierbere cam 3 litri de apă cu sarea pentru orez, ceea ce durează cam 10 minute. Adaugă orezul și fierbe-l 12 minute, până se înmoaie, apoi scurge-l bine. Se termină în timp ce fasolea fierbe.',
      ),
      timerSeconds: 720,
    },
    {
      key: 'beans',
      text: t(
        'Stir in the beans and simmer for 15 more minutes, uncovered, until the sauce coats the back of a spoon.',
        'Adaugă fasolea și mai fierbe 15 minute, fără capac, până sosul acoperă dosul lingurii.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'serve',
      text: t(
        'Taste the chili and add salt or chilli powder if it needs it. The mince must be piping hot all the way through. Spoon it over the rice and top with sour cream, grated cheddar and coriander.',
        'Gustă chili și adaugă sare sau ardei iute măcinat dacă mai are nevoie. Chili trebuie să fie fierbinte de tot, să scoată abur. Pune chili peste orez și adaugă smântână, cheddar ras și coriandru.',
      ),
    },
  ],
  tips: [
    t(
      'Make it a day ahead if you can: the flavours settle and it tastes better reheated. Cool leftovers within 2 hours, keep them in the fridge for up to 3 days and reheat until steaming hot.',
      'Fă-l cu o zi înainte dacă poți: aromele se leagă, iar reîncălzit e mai gustos. Răcește resturile în maximum 2 ore, ține-le la frigider până la 3 zile și reîncălzește-le până scot abur.',
    ),
    t(
      'Rinse canned beans well: the liquid in the can is starchy and salty, and it clouds the sauce.',
      'Clătește bine fasolea din conservă: lichidul din cutie e amidonos și sărat și tulbură sosul.',
    ),
    t(
      'Chilli powders range from mild to fiery. If yours is hot, start with half: you can stir more in near the end, but you cannot take it out.',
      'Ardeiul iute măcinat poate fi de la dulce la foarte iute. Dacă al tău e iute, începe cu jumătate: poți adăuga spre final, dar nu mai poți scoate.',
    ),
  ],
  stepTips: [
    {
      step: 'brown',
      text: t(
        'Leave the mince alone for the first 2 minutes so it forms a brown crust before you break it up. That crust is where most of the flavour comes from.',
        'Nu amesteca carnea în primele 2 minute, ca să prindă crustă rumenă înainte s-o sfărâmi. Din crustă vine cea mai mare parte din gust.',
      ),
    },
    {
      step: 'spices',
      text: t(
        'Frying the spices and paste in the fat first mellows the raw edge of the paste and brings out the spices.',
        'Prăjite întâi în grăsime, condimentele și pasta își pierd gustul crud, iar aroma condimentelor iese mai bine la iveală.',
      ),
    },
  ],
  nutritionNote: t(
    'Beef and beans make it filling and rich in protein, and the beans and vegetables add fibre. Mince, cheddar and sour cream bring saturated fat, and the stock, canned tomatoes and beans add salt, so choose leaner mince, rinse the beans and go easy on the toppings.',
    'Vita și fasolea îl fac săturător și bogat în proteine, iar fasolea și legumele aduc fibre. Carnea tocată, cheddarul și smântâna aduc grăsimi saturate, iar supa, roșiile și fasolea conservate adaugă sare, așa că alege carne tocată mai slabă, clătește fasolea și pune smântână și cheddar cu măsură.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Avocado', 'Avocado'),
      reason: t(
        'Its cool, creamy flesh is a soft contrast to the spicy, stewy chili.',
        'Pulpa lui rece și cremoasă face un contrast moale cu chili picant și suculent.',
      ),
      principle: 'contrast_texture',
      ingredient: 'avocado',
    },
    {
      kind: 'food',
      label: t('Lime wedges', 'Felii de lime'),
      reason: t(
        'A squeeze of lime juice cuts through the richness of the beef and brightens the tomato.',
        'Un strop de zeamă de lime taie din bogăția cărnii de vită și învioarează roșiile.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'lime',
    },
    {
      kind: 'food',
      label: t('Tortilla chips', 'Chipsuri tortilla'),
      reason: t(
        'Crunchy chips for scooping give the soft, stewy chili a contrast in texture.',
        'Chipsurile crocante, bune de scufundat în chili, fac un contrast de textură cu mâncarea moale și suculentă.',
      ),
      principle: 'contrast_texture',
      ingredient: 'tortilla-chips',
    },
    {
      kind: 'drink',
      label: t('Cold lager', 'Bere blondă rece'),
      reason: t(
        'Cold, light beer refreshes the mouth between spicy bites.',
        'Berea blondă rece împrospătează gura între îmbucăturile picante.',
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
        'A hot, hearty bowl that warms you through.',
        'Un castron fierbinte și consistent care te încălzește.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Protein from the beef and beans plus carbohydrates from the rice help recovery.',
        'Proteinele din vită și fasole, plus carbohidrații din orez, ajută la refacere.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Spicy, heavy food can sit badly and disturb sleep.',
        'Mâncarea picantă și grea poate cădea greu la stomac și îți poate strica somnul.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'A long-simmered, spicy stew is too heavy when it is hot.',
        'O tocană picantă, fiartă îndelung, e prea grea când e cald.',
      ),
    },
  ],
  variants: [
    {
      slug: 'chili-con-carne-american',
      cuisine: 'american',
      title: t(
        'Texas chili (bowl of red)',
        'Chili texan din bucăți de vită, fără fasole (bowl of red)',
      ),
      servings: 6,
      prepMinutes: 25,
      cookMinutes: 205,
      difficulty: 'medium',
      hideBaseTips: [1, 2],
      lines: [
        {
          ingredient: 'beef-for-stew',
          quantity: 1200,
          unit: 'g',
          note: t(
            'chuck, cut into 2 to 3 cm cubes',
            'spată, tăiată cubulețe de 2-3 cm',
          ),
        },
        {
          ingredient: 'ancho-chillies',
          quantity: 55,
          unit: 'g',
          note: t('about 4 whole chillies', 'cam 4 ardei întregi'),
        },
        { ingredient: 'cumin-seeds', quantity: 8, unit: 'g' },
        { ingredient: 'oregano', quantity: 3, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('finely chopped', 'tocate mărunt'),
        },
        {
          ingredient: 'garlic',
          quantity: 15,
          unit: 'g',
          note: t('crushed', 'zdrobit'),
        },
        { ingredient: 'beef-stock', quantity: 750, unit: 'ml' },
        { ingredient: 'sunflower-oil', quantity: 45, unit: 'ml' },
        { ingredient: 'masa-harina', quantity: 30, unit: 'g' },
        { ingredient: 'salt', quantity: 10, unit: 'g' },
        {
          ingredient: 'onion',
          key: 'onion-serve',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'finely chopped, raw, to serve',
            'tocată mărunt, crudă, pentru servit',
          ),
        },
        {
          ingredient: 'cheddar',
          quantity: 100,
          unit: 'g',
          optional: true,
          note: t('grated, to serve', 'ras, pentru servit'),
        },
        {
          ingredient: 'tortilla-chips',
          quantity: 100,
          unit: 'g',
          optional: true,
          note: t('to serve', 'pentru servit'),
        },
      ],
      steps: [
        {
          key: 'dry-chillies',
          text: t(
            'Break the stems off the anchos, tear them open and shake out the seeds. Heat a dry heavy frying pan over medium heat and press the chillies flat in it for about 1 minute in total, turning them once, until fragrant and slightly puffed. Do not let them blacken, or they turn bitter.',
            'Rupe cozile ardeilor ancho, desfă-i și scutură semințele. Încinge o tigaie grea, uscată, la foc mediu și apasă ardeii în ea cam 1 minut în total, întorcându-i o dată, până miros bine și se umflă ușor. Nu-i lăsa să se înnegrească, altfel se amărăsc.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'toast-cumin',
          text: t(
            'Toast the cumin seeds in the same dry pan for 30 seconds, until they smell warm. Grind them to a powder in a mortar or spice grinder.',
            'Prăjește semințele de chimion în aceeași tigaie uscată 30 de secunde, până încep să miroasă. Macină-le în praf într-un mojar sau într-o râșniță de condimente.',
          ),
          timerSeconds: 30,
        },
        {
          key: 'soak',
          text: t(
            'Bring 500 ml of the stock to the boil, pour it over the anchos in a bowl and press them under with a plate. Leave them to soak for 20 minutes while you brown the beef.',
            'Adu la fierbere 500 ml din supă, toarn-o peste ardei într-un bol și ține-i scufundați cu o farfurie. Lasă-i la înmuiat 20 de minute, cât rumenești carnea.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'brown',
          text: t(
            'Pat the beef dry and sprinkle it with the salt. Heat 30 ml of the oil in a large heavy pot over medium-high heat and brown the beef in three batches, about 5 minutes per batch, until deeply browned on all sides. Lift each batch out onto a plate.',
            'Șterge carnea de vită cu un prosop de hârtie și presar-o cu sare. Încinge 30 ml din ulei într-o oală mare cu fund gros la foc mediu spre mare și rumenește carnea în trei porții, cam 5 minute fiecare, până se rumenește bine pe toate părțile. Scoate fiecare porție pe o farfurie.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'onion',
          text: t(
            'Lower the heat to medium and add the remaining oil and the chopped onions. Cook for about 8 minutes, scraping up the browned bits, until the onions are soft and golden. Add the garlic and ground cumin and stir until fragrant, a few seconds.',
            'Dă focul la mediu și adaugă uleiul rămas și ceapa tocată. Gătește cam 8 minute, răzuind bucățelele rumenite, până ceapa se înmoaie și devine aurie. Adaugă usturoiul și chimionul măcinat și amestecă câteva secunde, până miros.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'paste',
          text: t(
            'Tip the anchos and their soaking liquid into a blender and blend for about 1 minute until smooth. If bits of skin remain, press the paste through a sieve. The liquid is hot, so take the centre cap out of the lid and cover the opening with a folded tea towel while you blend.',
            'Pune ardeii și lichidul în care au stat într-un blender și mixează cam 1 minut, până se omogenizează. Dacă rămân bucățele de coajă, trece pasta printr-o sită. Lichidul e fierbinte, așa că scoate dopul din capac și acoperă orificiul cu un prosop împăturit cât mixezi.',
          ),
        },
        {
          key: 'combine',
          text: t(
            'Return the beef and its juices to the pot. Add the chilli paste, the oregano and the remaining 250 ml of stock. Bring to a gentle simmer, which takes about 5 minutes.',
            'Pune la loc în oală carnea cu zeama ei. Adaugă pasta de ardei, oregano și cei 250 ml de supă rămași. Adu la un clocot ușor, ceea ce durează cam 5 minute.',
          ),
        },
        {
          key: 'braise',
          text: t(
            'Cover the pot, turn the heat to its lowest and braise for 2 and a half hours, stirring every 30 minutes and adding a splash of water if it looks dry, until the beef is fork-tender.',
            'Acoperă oala, dă focul la minim și fierbe înăbușit 2 ore și jumătate, amestecând la fiecare 30 de minute și adăugând un strop de apă dacă pare uscat, până carnea se desface ușor cu furculița.',
          ),
          timerSeconds: 9000,
        },
        {
          key: 'thicken',
          text: t(
            'Whisk the masa harina with 100 ml of cold water until smooth and stir it into the pot. Simmer uncovered for 15 minutes, stirring, until the sauce is thick and glossy.',
            'Amestecă masa harina cu 100 ml de apă rece până se omogenizează și toarn-o în oală. Fierbe fără capac 15 minute, amestecând, până sosul se îngroașă și devine lucios.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'serve',
          text: t(
            'Taste and add salt if needed. Ladle into bowls and top with the raw chopped onion, the cheddar and tortilla chips if you like.',
            'Gustă și adaugă sare dacă mai trebuie. Pune în boluri și presară ceapa crudă tocată, cheddarul și chipsurile tortilla, dacă vrei.',
          ),
        },
      ],
      tips: [
        t(
          'Buy whole dried anchos that are soft and pliable. Brittle, dusty ones are old and taste flat.',
          'Cumpără ardei ancho uscați întregi, moi și flexibili. Cei casanți și prăfoși sunt vechi și au gust searbăd.',
        ),
      ],
      stepTips: [
        {
          step: 'brown',
          text: t(
            'Brown in batches: crowded cubes steam in their own juices and turn grey instead of brown.',
            'Rumenește pe porții: bucățile îngrămădite fierb în propriul suc și devin gri în loc de rumene.',
          ),
        },
      ],
      nutritionNote: t(
        'Plenty of protein from the beef, and the chillies and onion add flavour without much fat, but it has no beans or tomatoes, so little fibre. Chuck is a fatty cut and the stock adds salt, so skim the fat if you like and keep the toppings light.',
        'Multe proteine din carnea de vită, iar ardeii și ceapa dau gust fără prea multă grăsime, dar nu are fasole sau roșii, deci puține fibre. Spata e o bucată grasă, iar supa adaugă sare, așa că îndepărtează grăsimea de la suprafață dacă vrei și pune puțin cheddar și puține chipsuri deasupra.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Sour cream', 'Smântână'),
          reason: t(
            'Its tang and creaminess round off the earthy ancho.',
            'Aciditatea și cremozitatea ei rotunjesc gustul pământiu al ardeiului ancho.',
          ),
          principle: 'complement_flavour',
          ingredient: 'sour-cream',
        },
        {
          kind: 'food',
          label: t('Lime wedges', 'Felii de lime'),
          reason: t(
            'Lime juice cuts the richness of the braised beef.',
            'Zeama de lime taie din bogăția cărnii de vită fierte înăbușit.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'lime',
        },
        {
          kind: 'food',
          label: t('Bread', 'Pâine'),
          reason: t(
            'A crusty slice is a firm bite against the soft braised beef, and it mops up the thick sauce.',
            'O felie crocantă oferă o mușcătură fermă lângă carnea moale fiartă înăbușit și șterge sosul gros din farfurie.',
          ),
          principle: 'contrast_texture',
          ingredient: 'bread',
        },
        {
          kind: 'drink',
          label: t('Cold lager', 'Bere blondă rece'),
          reason: t(
            'Cold, light beer refreshes the mouth between rich, spicy bites.',
            'Berea blondă rece împrospătează gura între îmbucăturile bogate și picante.',
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
            'A deep, warming bowl for a cold day.',
            'Un castron cu gust intens, care te încălzește într-o zi rece.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'A lot of protein for recovery; add bread or rice for carbohydrates.',
            'Multe proteine pentru refacere; adaugă pâine sau orez pentru carbohidrați.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Rich, spicy braised beef sits heavy before bed.',
            'Carnea de vită condimentată și bogată cade greu înainte de culcare.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'A rich stew simmered for hours is too heavy in the heat.',
            'O tocană bogată, fiartă ore întregi, e prea grea pe căldură.',
          ),
        },
      ],
    },
    {
      slug: 'chili-con-carne-slow-cooker',
      method: 'slow-cooker',
      title: t('Slow-cooker chili con carne', 'Chili con carne la slow cooker'),
      servings: 6,
      prepMinutes: 20,
      cookMinutes: 450,
      difficulty: 'easy',
      lines: [
        { ingredient: 'minced-beef', quantity: 750, unit: 'g' },
        { ingredient: 'sunflower-oil', quantity: 30, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('finely chopped', 'tocate mărunt'),
        },
        {
          ingredient: 'bell-pepper',
          quantity: 1,
          unit: 'pcs',
          note: t('red, diced', 'roșu, tăiat cubulețe'),
        },
        {
          ingredient: 'garlic',
          quantity: 12,
          unit: 'g',
          note: t('crushed', 'zdrobit'),
        },
        {
          ingredient: 'chili-powder',
          quantity: 8,
          unit: 'g',
          note: t(
            'mild or medium; use half if yours is hot',
            'dulce-iute sau mediu; pune jumătate dacă e foarte iute',
          ),
        },
        { ingredient: 'cumin', quantity: 6, unit: 'g' },
        { ingredient: 'oregano', quantity: 3, unit: 'g' },
        { ingredient: 'tomato-paste', quantity: 45, unit: 'g' },
        { ingredient: 'canned-tomatoes', quantity: 400, unit: 'g' },
        { ingredient: 'beef-stock', quantity: 100, unit: 'ml' },
        {
          ingredient: 'canned-kidney-beans',
          quantity: 480,
          unit: 'g',
          note: t('drained weight, rinsed', 'greutate scursă, clătită'),
        },
        { ingredient: 'salt', quantity: 8, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
        {
          ingredient: 'rice',
          quantity: 400,
          unit: 'g',
          note: t('to serve', 'pentru servit'),
        },
        {
          ingredient: 'salt',
          key: 'rice-salt',
          quantity: 12,
          unit: 'g',
          note: t('for the rice water', 'pentru apa orezului'),
        },
        {
          ingredient: 'sour-cream',
          quantity: 150,
          unit: 'g',
          note: t('to serve', 'pentru servit'),
        },
        {
          ingredient: 'cheddar',
          quantity: 120,
          unit: 'g',
          note: t('grated, to serve', 'ras, pentru servit'),
        },
      ],
      steps: [
        {
          key: 'prep',
          text: t(
            'Chop the onions and pepper, crush the garlic and drain and rinse the beans. You need a 3 to 4 litre slow cooker; a bigger one is too empty and the chili catches.',
            'Toacă ceapa și ardeiul, zdrobește usturoiul, scurge și clătește fasolea. Ai nevoie de un slow cooker de 3-4 litri; într-unul mai mare chili e prea puțin și se prinde.',
          ),
        },
        {
          key: 'brown',
          text: t(
            'Heat the oil in a large frying pan over medium-high heat. Add the mince, break it up and cook for about 10 minutes, until no pink remains and it is browned in places. Spoon it into the slow cooker, leaving the fat in the pan.',
            'Încinge uleiul într-o tigaie mare la foc mediu spre mare. Adaugă carnea tocată, sfarm-o și gătește-o cam 10 minute, până nu mai rămâne roz și se rumenește pe alocuri. Pune-o cu lingura în slow cooker, lăsând grăsimea în tigaie.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'soften',
          text: t(
            'Add the onions and pepper to the pan and cook over medium heat for about 6 minutes, until the onion is soft. Stir in the garlic, chilli powder, cumin, oregano and tomato paste and cook for 1 minute.',
            'Adaugă ceapa și ardeiul în tigaie și gătește la foc mediu cam 6 minute, până ceapa se înmoaie. Adaugă usturoiul, ardeiul iute măcinat, chimionul, oregano și pasta de roșii și gătește 1 minut.',
          ),
          timerSeconds: 420,
        },
        {
          key: 'deglaze',
          text: t(
            'Pour in the stock and scrape up the browned bits from the bottom of the pan. Scrape everything into the slow cooker.',
            'Toarnă supa și răzuiește bucățelele rumenite de pe fundul tigăii. Pune tot conținutul în slow cooker.',
          ),
        },
        {
          key: 'layer',
          text: t(
            'Add the tomatoes, the salt and the pepper to the slow cooker and stir. Put the lid on, set it to low and cook for 6 hours. Do not lift the lid.',
            'Adaugă roșiile, sarea și piperul în slow cooker și amestecă. Pune capacul, pune-l pe treapta mică (low) și gătește 6 ore. Nu ridica capacul.',
          ),
          timerSeconds: 21600,
        },
        {
          key: 'beans',
          text: t(
            'Stir in the beans, put the lid back on and cook on low for the last hour, until the beans are hot and the sauce is thick.',
            'Adaugă fasolea, pune capacul la loc și gătește tot pe treapta mică ultima oră, până fasolea se încălzește și sosul se îngroașă.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'rice',
          text: t(
            'About 30 minutes before the end of the last hour, bring about 3 litres of water to the boil with the rice salt, which takes about 10 minutes. Add the rice and boil for 12 minutes, until tender, then drain well.',
            'Cu cam 30 de minute înainte de sfârșitul ultimei ore, adu la fierbere cam 3 litri de apă cu sarea pentru orez, ceea ce durează cam 10 minute. Adaugă orezul și fierbe-l 12 minute, până se înmoaie, apoi scurge-l bine.',
          ),
          timerSeconds: 720,
        },
        {
          key: 'serve',
          text: t(
            'Taste the chili and add salt if it needs it. The mince must be piping hot all the way through. Spoon it over the rice and top with sour cream and grated cheddar.',
            'Gustă chili și adaugă sare dacă mai are nevoie. Chili trebuie să fie fierbinte de tot, să scoată abur. Pune chili peste orez și adaugă smântână și cheddar ras.',
          ),
        },
      ],
      tips: [
        t(
          'Keep the lid on: every time you lift it, heat escapes and the cooking time stretches.',
          'Ține capacul pus: de fiecare dată când îl ridici, scapă căldura și timpul de gătit se lungește.',
        ),
      ],
      stepTips: [
        {
          step: 'layer',
          text: t(
            'A slow cooker loses almost no liquid, so this version uses far less stock and tomato than the hob chili. If you add more, the chili ends up as soup.',
            'Un slow cooker nu pierde aproape deloc lichid, așa că varianta asta folosește mult mai puțină supă și roșii decât chili de la aragaz. Dacă pui mai mult, chili iese ca o supă.',
          ),
        },
      ],
      nutritionNote: t(
        'Beef and beans make it filling and rich in protein, and the beans and vegetables add fibre. Mince, cheddar and sour cream bring saturated fat, and the stock, canned tomatoes and beans add salt, so choose leaner mince, rinse the beans and keep the toppings light.',
        'Vita și fasolea îl fac săturător și bogat în proteine, iar fasolea și legumele aduc fibre. Carnea tocată, cheddarul și smântâna aduc grăsimi saturate, iar supa, roșiile și fasolea conservate adaugă sare, așa că alege carne tocată mai slabă, clătește fasolea și pune smântână și cheddar cu măsură.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Avocado', 'Avocado'),
          reason: t(
            'Its cool, creamy flesh is a soft contrast to the spicy, stewy chili.',
            'Pulpa lui rece și cremoasă face un contrast moale cu chili picant și suculent.',
          ),
          principle: 'contrast_texture',
          ingredient: 'avocado',
        },
        {
          kind: 'food',
          label: t('Lime wedges', 'Felii de lime'),
          reason: t(
            'A squeeze of lime juice cuts through the richness of the beef.',
            'Un strop de zeamă de lime taie din bogăția cărnii de vită.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'lime',
        },
        {
          kind: 'food',
          label: t('Tortilla chips', 'Chipsuri tortilla'),
          reason: t(
            'Crunchy chips for scooping give the soft chili a contrast in texture.',
            'Chipsurile crocante, bune de scufundat în chili, fac un contrast de textură cu mâncarea moale.',
          ),
          principle: 'contrast_texture',
          ingredient: 'tortilla-chips',
        },
        {
          kind: 'drink',
          label: t('Cold lager', 'Bere blondă rece'),
          reason: t(
            'Cold, light beer refreshes the mouth between spicy bites.',
            'Berea blondă rece împrospătează gura între îmbucăturile picante.',
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
            'Waiting for you hot at the end of a cold day.',
            'Te așteaptă fierbinte la sfârșitul unei zile reci.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from the beef and beans plus carbohydrates from the rice help recovery.',
            'Proteinele din vită și fasole, plus carbohidrații din orez, ajută la refacere.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Spicy, heavy food can sit badly and disturb sleep.',
            'Mâncarea picantă și grea poate cădea greu la stomac și îți poate strica somnul.',
          ),
        },
      ],
    },
  ],
};
