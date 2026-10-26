import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Mămăligă base is the everyday Romanian one: cornmeal cooked in salted
// water, turned out and served with telemea and smântână. Each Variant is a
// full Recipe with its own lines, steps and guidance. Every Variant hides the
// base's second Tip (leftover mămăligă, sliced and fried) and writes its own
// storage Tip; the first Tip (raining in the meal) holds for all of them.
export const mamaliga: BaseRecipeSeed = {
  slug: 'mamaliga',
  title: t(
    'Mămăligă with cheese and sour cream',
    'Mămăligă cu brânză și smântână',
  ),
  servings: 4,
  prepMinutes: 5,
  cookMinutes: 30,
  difficulty: 'easy',
  lines: [
    { ingredient: 'cornmeal', quantity: 250, unit: 'g' },
    { ingredient: 'still-water', quantity: 1, unit: 'l' },
    { ingredient: 'salt', quantity: 8, unit: 'g' },
    { ingredient: 'butter', quantity: 30, unit: 'g', optional: true },
    {
      ingredient: 'telemea',
      quantity: 200,
      unit: 'g',
      note: t('crumbled', 'sfărâmată'),
    },
    { ingredient: 'sour-cream', quantity: 200, unit: 'g' },
    {
      ingredient: 'eggs',
      quantity: 4,
      unit: 'pcs',
      optional: true,
      note: t('for fried eggs on top', 'pentru ochiuri deasupra'),
    },
    {
      ingredient: 'sunflower-oil',
      quantity: 20,
      unit: 'ml',
      optional: true,
      note: t('for the eggs', 'pentru ouă'),
    },
  ],
  steps: [
    {
      key: 'boil',
      text: t(
        'Bring the water and salt to a rolling boil in a heavy, deep pot. Keep a wooden spoon at hand.',
        'Pune apa cu sarea la fiert într-o oală grea și adâncă, până dă în clocot puternic. Ține lângă tine o lingură de lemn.',
      ),
    },
    {
      key: 'rain',
      text: t(
        'Lower the heat to medium. With one hand let the cornmeal fall in a thin stream, like rain, and with the other stir constantly so no lumps form. This takes about a minute.',
        'Dă focul la mediu. Cu o mână toarnă mălaiul în fir subțire, ca o ploaie, iar cu cealaltă amestecă mereu, ca să nu se facă cocoloașe. Durează cam un minut.',
      ),
    },
    {
      key: 'cook',
      text: t(
        'Turn the heat to low and cook for about 20 minutes, stirring every minute or two and pressing the mass against the sides of the pot. It is ready when it is thick and pulls away cleanly from the sides and bottom, and the grains no longer taste raw.',
        'Dă focul la mic și fierbe cam 20 de minute, amestecând la un minut-două și apăsând compoziția de pereții oalei. E gata când s-a îngroșat, se desprinde curat de pereți și de fund, iar mălaiul nu mai are gust de crud.',
      ),
      timerSeconds: 1200,
    },
    {
      key: 'butter',
      text: t(
        'Take the pot off the heat, stir in the butter if you use it, and cover the pot for 2 minutes so the mămăligă firms up.',
        'Ia oala de pe foc, amestecă untul (dacă îl folosești) și acoperă oala 2 minute, ca mămăliga să se întărească puțin.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'eggs',
      text: t(
        'If you want eggs, heat the oil in a pan over medium heat and fry the eggs for about 3 minutes, until the whites are fully set and no longer clear. The yolks stay runny; cook them through if you serve children, older people or anyone pregnant.',
        'Dacă vrei ouă, încinge uleiul într-o tigaie la foc mediu și prăjește ouăle cam 3 minute, până când albușurile sunt complet închegate și nu mai sunt translucide. Gălbenușurile rămân moi; gătește-le bine dacă servești copii, vârstnici sau gravide.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'turn-out',
      text: t(
        'Wet a wooden board, turn the mămăligă out onto it and let it settle for a minute. Cut it into thick slices with a taut thread or a wet knife.',
        'Udă un fund de lemn (sau o planșetă), răstoarnă mămăliga pe ea și las-o un minut să se așeze. Taie-o felii groase cu o ață întinsă sau cu un cuțit ud.',
      ),
    },
    {
      key: 'serve',
      text: t(
        'Put two slices on each plate while still hot. Top with the crumbled telemea, a generous spoon of sour cream and a fried egg if you made them.',
        'Pune două felii pe fiecare farfurie, cât sunt fierbinți. Adaugă telemeaua sfărâmată, o lingură generoasă de smântână și un ochi de ou, dacă ai făcut.',
      ),
    },
  ],
  tips: [
    t(
      'Never pour the cornmeal in all at once: it clumps into lumps that stay raw inside. A thin stream and constant stirring is the whole trick.',
      'Nu turna mălaiul deodată: se face cocoloașe care rămân crude în interior. Firul subțire și amestecatul continuu sunt tot secretul.',
    ),
    t(
      'Cool leftover mămăligă within 2 hours, wrap it and keep it in the fridge for up to 3 days. Cut it into slices and fry or grill them until crisp on both sides, and serve hot.',
      'Răcește mămăliga rămasă în cel mult 2 ore, învelește-o și ține-o la frigider până la 3 zile. Taie-o felii și prăjește-le sau coace-le pe grătar până se rumenesc pe ambele părți, apoi servește-le fierbinți.',
    ),
  ],
  stepTips: [
    {
      step: 'cook',
      text: t(
        'If the mămăligă is too thick to stir, add a splash of boiling water. If it stays loose after 20 minutes, keep cooking a few minutes more.',
        'Dacă mămăliga e prea groasă ca să o amesteci, adaugă puțină apă clocotită. Dacă rămâne moale după 20 de minute, mai las-o câteva minute pe foc.',
      ),
    },
    {
      step: 'turn-out',
      text: t(
        'A dry knife drags and sticks; a taut thread or a knife dipped in hot water cuts clean slices.',
        'Un cuțit uscat se lipește și trage; o ață întinsă sau un cuțit muiat în apă fierbinte taie felii curate.',
      ),
    },
  ],
  nutritionNote: t(
    'Cornmeal gives filling carbohydrate and, in itself, almost no fat. Telemea is salty and sour cream and butter bring saturated fat, so salt the water lightly and go easy on the toppings. It has little protein or fibre on its own: the cheese and egg add protein, and a salad or pickles add fibre.',
    'Mălaiul dă carbohidrați sățioși și, în sine, aproape deloc grăsime. Telemeaua e sărată, iar smântâna și untul aduc grăsimi saturate, așa că sărează apa ușor și nu exagera cu ce pui deasupra. Singură are puține proteine și fibre: brânza și oul adaugă proteine, iar o salată sau murăturile adaugă fibre.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Sarmale', 'Sarmale'),
      recipe: 'sarmale',
      reason: t(
        'Mămăligă is the usual side for sarmale: it soaks up the pot liquid and softens the richness of the rolls.',
        'Mămăliga este garnitura obișnuită pentru sarmale: absoarbe zeama din oală și îmblânzește gustul gras al sarmalelor.',
      ),
      principle: 'regional_tradition',
    },
    {
      kind: 'food',
      label: t('Pickled peppers', 'Ardei murați'),
      ingredient: 'pickled-peppers',
      reason: t(
        'Their sharp acidity cuts through the sour cream and the plain, soft cornmeal.',
        'Aciditatea lor taie din grăsimea smântânii și înviorează mămăliga.',
      ),
      principle: 'acid_cuts_fat',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      ingredient: 'pickled-cucumbers',
      reason: t(
        'Crunch and sourness against the soft, creamy mămăligă.',
        'Textura crocantă și gustul acru contrastează cu mămăliga moale și cremoasă.',
      ),
      principle: 'contrast_texture',
    },
    {
      kind: 'drink',
      label: t('Dry white wine', 'Vin alb sec'),
      ingredient: 'white-wine',
      reason: t(
        'Its acidity refreshes the palate after the salty cheese and sour cream.',
        'Aciditatea lui împrospătează gustul după brânza sărată și smântână.',
      ),
      principle: 'cleanses_palate',
    },
    {
      kind: 'drink',
      label: t('Buttermilk', 'Lapte bătut'),
      ingredient: 'buttermilk',
      reason: t(
        'Cold and tangy, soured milk is a familiar drink with mămăligă in the countryside.',
        'Rece și acrișor, laptele bătut e o băutură cunoscută la masa cu mămăligă, la țară.',
      ),
      principle: 'complement_flavour',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot, filling plate that warms you through on a cold day.',
        'O farfurie fierbinte și săturătoare, care te încălzește într-o zi rece.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Carbohydrate from the cornmeal and protein from the cheese and egg help you refuel.',
        'Carbohidrații din mălai și proteinele din brânză și ou te ajută să-ți reîncarci energia.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A heavy plate with cheese and sour cream sits uncomfortably before bed.',
        'O farfurie grea, cu brânză și smântână, cade greu înainte de culcare.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'A steaming, heavy dish is the last thing you want in the heat.',
        'Un fel fierbinte și greu e ultimul lucru pe care ți-l dorești pe caniculă.',
      ),
    },
  ],
  variants: [
    {
      slug: 'mamaliga-oven-baked',
      method: 'oven-baked',
      title: t('Bulz (baked cheese-filled mămăligă balls)', 'Bulz la cuptor'),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 60,
      difficulty: 'medium',
      hideBaseTips: [1],
      lines: [
        { ingredient: 'cornmeal', quantity: 300, unit: 'g' },
        { ingredient: 'still-water', quantity: 1, unit: 'l' },
        { ingredient: 'salt', quantity: 6, unit: 'g' },
        {
          ingredient: 'burduf-cheese',
          quantity: 200,
          unit: 'g',
          note: t('cut into 4 cubes', 'tăiată în 4 cuburi'),
        },
        {
          ingredient: 'butter',
          quantity: 40,
          unit: 'g',
          note: t('melted, for brushing', 'topit, pentru uns'),
        },
        { ingredient: 'sour-cream', quantity: 200, unit: 'g' },
        { ingredient: 'eggs', quantity: 4, unit: 'pcs' },
        {
          ingredient: 'sunflower-oil',
          quantity: 20,
          unit: 'ml',
          note: t('for the eggs', 'pentru ouă'),
        },
      ],
      steps: [
        {
          key: 'boil',
          text: t(
            'Heat the oven to 220 °C (200 °C fan). Bring the water and salt to a rolling boil in a heavy, deep pot.',
            'Încinge cuptorul la 220 °C (200 °C cu ventilator). Pune apa cu sarea la fiert într-o oală grea și adâncă, până dă în clocot puternic.',
          ),
        },
        {
          key: 'rain',
          text: t(
            'Lower the heat to medium. Let the cornmeal fall in a thin stream while you stir constantly with a wooden spoon, so no lumps form.',
            'Dă focul la mediu. Toarnă mălaiul în fir subțire, amestecând mereu cu o lingură de lemn, ca să nu se facă cocoloașe.',
          ),
        },
        {
          key: 'cook',
          text: t(
            'Turn the heat to low and cook for about 20 minutes, stirring often, until the mămăligă is very thick, pulls away from the sides of the pot and stands up on the spoon.',
            'Dă focul la mic și fierbe cam 20 de minute, amestecând des, până când mămăliga e foarte groasă, se desprinde de pereții oalei și stă în picioare pe lingură.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'cool',
          text: t(
            'Take the pot off the heat and let the mămăligă cool for 10 minutes, until you can handle it with wet hands without burning them.',
            'Ia oala de pe foc și lasă mămăliga să se răcească 10 minute, până o poți lucra cu mâinile ude fără să te arzi.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'shape',
          text: t(
            'Divide the mămăligă into 4 equal portions of about 280 g. With wet hands flatten one in your palm, set a cube of burduf cheese in the middle and close the mămăligă around it. Roll into a smooth, thick ball and seal every gap so the cheese cannot leak. Repeat with the other 3.',
            'Împarte mămăliga în 4 porții egale, de cam 280 g. Cu mâinile ude turtește o porție în palmă, pune în mijloc un cub de brânză de burduf și închide mămăliga în jurul lui. Rotunjește o bilă groasă și netedă și închide bine orice crăpătură, ca brânza să nu iasă. Repetă cu celelalte 3.',
          ),
        },
        {
          key: 'brush',
          text: t(
            'Set the balls on a baking tray lined with baking paper and brush them all over with half of the melted butter.',
            'Așază bilele pe o tavă tapetată cu hârtie de copt și unge-le peste tot cu jumătate din untul topit.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 20 minutes, until the outside is golden and crusty and the cheese inside is soft and hot. Brush with the rest of the butter after 10 minutes.',
            'Coace 20 de minute, până când exteriorul e auriu și crocant, iar brânza dinăuntru e moale și fierbinte. După 10 minute unge cu untul rămas.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'eggs',
          text: t(
            'While the bulz bakes, heat the oil in a pan over medium heat and fry the eggs for about 3 minutes, until the whites are fully set. The yolks stay runny; cook them through if you serve children, older people or anyone pregnant.',
            'Cât se coace bulzul, încinge uleiul într-o tigaie la foc mediu și prăjește ouăle cam 3 minute, până când albușurile sunt complet închegate. Gălbenușurile rămân moi; gătește-le bine dacă servești copii, vârstnici sau gravide.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'serve',
          text: t(
            'Serve each bulz hot, with a generous spoon of sour cream and a fried egg on top. Break it open at the table so the melted cheese runs out.',
            'Servește fiecare bulz fierbinte, cu o lingură generoasă de smântână și un ochi de ou deasupra. Desfă-l la masă, ca brânza topită să curgă.',
          ),
        },
      ],
      tips: [
        t(
          'Keep a bowl of cold water next to you and wet your hands often: mămăligă sticks to dry hands and tears when you shape it.',
          'Ține lângă tine un bol cu apă rece și udă-ți des mâinile: mămăliga se lipește de mâinile uscate și se rupe când o modelezi.',
        ),
        t(
          'Cool leftover bulz within 2 hours and keep it in the fridge for up to 2 days. Reheat in a 200 °C oven for about 15 minutes, until steaming hot in the middle. Fry fresh eggs rather than reheating the old ones.',
          'Răcește bulzul rămas în cel mult 2 ore și ține-l la frigider până la 2 zile. Încălzește-l în cuptor la 200 °C vreo 15 minute, până e fierbinte și în mijloc. Prăjește ouă proaspete, nu le reîncălzi pe cele vechi.',
        ),
      ],
      stepTips: [
        {
          step: 'shape',
          text: t(
            'Burduf is salty and strong, so a cube of about 50 g is plenty. The mămăligă should be firm enough to hold its shape; if it is too soft, cook it a few minutes longer next time.',
            'Brânza de burduf e sărată și puternică, deci un cub de cam 50 g e suficient. Mămăliga trebuie să fie destul de tare ca să-și țină forma; dacă e prea moale, la următoarea gătire mai las-o câteva minute pe foc.',
          ),
        },
      ],
      nutritionNote: t(
        'Filling carbohydrate from the cornmeal, with protein from the cheese and egg. Burduf is very salty and the butter and sour cream add saturated fat, so this is a heavy, salty dish: keep the portion to one bulz and serve it with pickles or a salad for fibre.',
        'Carbohidrați sățioși din mălai, cu proteine din brânză și ou. Brânza de burduf e foarte sărată, iar untul și smântâna aduc grăsimi saturate, deci e un fel greu și sărat: rămâi la un bulz de persoană și servește-l cu murături sau cu o salată pentru fibre.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Pickled cucumbers', 'Castraveți murați'),
          ingredient: 'pickled-cucumbers',
          reason: t(
            'Crisp and sour against the rich, melted cheese and sour cream.',
            'Crocanți și acri, în contrast cu brânza topită și bogată și cu smântâna.',
          ),
          principle: 'acid_cuts_fat',
        },
        {
          kind: 'food',
          label: t('Hot pepper', 'Ardei iute'),
          ingredient: 'hot-pepper',
          reason: t(
            'A bite of fresh heat wakes up the mild cornmeal and the salty cheese.',
            'O îmbucătură de iuțeală proaspătă trezește mălaiul blând și brânza sărată.',
          ),
          principle: 'complement_flavour',
        },
        {
          kind: 'drink',
          label: t('Cold lager', 'Bere blondă rece'),
          ingredient: 'beer',
          reason: t(
            'Cold bubbles and bitterness cut through the fat of the cheese and butter.',
            'Bulele reci și amăreala taie din grăsimea brânzei și a untului.',
          ),
          principle: 'bitter_balances_rich',
        },
        {
          kind: 'drink',
          label: t('Dry red wine', 'Vin roșu sec'),
          ingredient: 'red-wine',
          reason: t(
            'Its acidity stands up to the strong, salty burduf.',
            'Aciditatea lui ține piept brânzei de burduf, puternică și sărată.',
          ),
          principle: 'complement_flavour',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, crusty, cheese-filled ball is just right for a cold day.',
            'O bilă fierbinte, crocantă și plină de brânză e exact ce trebuie într-o zi rece.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Fat and salt from the cheese and sour cream sit heavy during exercise.',
            'Grăsimea și sarea din brânză și smântână cad greu în timpul efortului.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Too heavy and salty to eat shortly before bed.',
            'Prea greu și sărat ca să-l mănânci tocmai înainte de culcare.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'Oven-hot and rich, it is the wrong dish for the heat.',
            'Scos din cuptor și bogat, nu e felul potrivit pentru zilele calde.',
          ),
        },
      ],
    },
    {
      slug: 'mamaliga-italian',
      cuisine: 'italian',
      title: t(
        'Polenta concia (with fontina and butter)',
        'Polenta concia (cu fontina și unt)',
      ),
      servings: 4,
      prepMinutes: 10,
      cookMinutes: 40,
      difficulty: 'easy',
      hideBaseTips: [1],
      lines: [
        { ingredient: 'cornmeal', quantity: 250, unit: 'g' },
        { ingredient: 'still-water', quantity: 0.75, unit: 'l' },
        { ingredient: 'milk', quantity: 0.5, unit: 'l' },
        { ingredient: 'salt', quantity: 8, unit: 'g' },
        {
          ingredient: 'butter',
          key: 'butter-polenta',
          quantity: 40,
          unit: 'g',
          note: t('stirred into the polenta', 'amestecat în polenta'),
        },
        {
          ingredient: 'fontina',
          quantity: 150,
          unit: 'g',
          note: t('cut into 1 cm cubes', 'tăiată în cuburi de 1 cm'),
        },
        {
          ingredient: 'parmesan',
          quantity: 60,
          unit: 'g',
          note: t('finely grated', 'ras fin'),
        },
        {
          ingredient: 'butter',
          key: 'butter-finish',
          quantity: 40,
          unit: 'g',
          note: t('browned, to finish', 'rumenit, la final'),
        },
        { ingredient: 'black-pepper' },
      ],
      steps: [
        {
          key: 'heat',
          text: t(
            'Put the water, milk and salt in a heavy pot and heat until small bubbles form at the edge. Do not let the milk boil over.',
            'Pune apa, laptele și sarea într-o oală grea și încălzește până apar bule mici pe margine. Nu lăsa laptele să dea în foc.',
          ),
        },
        {
          key: 'rain',
          text: t(
            'Let the cornmeal fall into the liquid in a thin stream while you whisk constantly, so no lumps form.',
            'Toarnă mălaiul în lichid în fir subțire, amestecând mereu cu telul, ca să nu se facă cocoloașe.',
          ),
        },
        {
          key: 'cook',
          text: t(
            'Turn the heat to low and cook for about 30 minutes, stirring every few minutes with a wooden spoon and scraping the bottom. It is ready when it is thick but still falls off the spoon in a soft ribbon, and a taste has no gritty bite.',
            'Dă focul la mic și fierbe cam 30 de minute, amestecând la câteva minute cu o lingură de lemn și răzuind fundul oalei. E gata când e groasă, dar încă se scurge de pe lingură ca o panglică moale, iar la gust nu mai scrâșnește.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'cheese',
          text: t(
            'Take the pot off the heat. Stir in 40 g of butter, then the fontina and parmesan, for about a minute, until the cheese melts into long strings.',
            'Ia oala de pe foc. Amestecă 40 g de unt, apoi fontina și parmezanul, cam un minut, până când brânza se topește și se întinde în fire lungi.',
          ),
        },
        {
          key: 'brown',
          text: t(
            'In a small pan melt the remaining 40 g of butter over medium heat. Let it foam, then cook for about 3 minutes, swirling, until it smells nutty and the milk solids turn golden brown. Take it off the heat at once so it does not burn.',
            'Într-o tigăiță topește cei 40 g de unt rămași la foc mediu. Lasă-l să facă spumă, apoi gătește-l cam 3 minute, învârtind tigaia, până miroase a alune și resturile de pe fund devin aurii-brune. Ia-l imediat de pe foc, ca să nu se ardă.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'serve',
          text: t(
            'Spoon the polenta into warm bowls, pour the browned butter over each and finish with black pepper. Serve at once.',
            'Pune polenta în boluri calde, toarnă untul rumenit peste fiecare porție și termină cu piper negru. Servește imediat.',
          ),
        },
      ],
      tips: [
        t(
          'Serve straight away: concia stiffens as it cools. If it tightens in the pot, loosen it with a splash of hot milk.',
          'Servește imediat: concia se întărește pe măsură ce se răcește. Dacă s-a strâns în oală, înmoaie-o cu puțin lapte fierbinte.',
        ),
        t(
          'Cool leftover polenta within 2 hours and keep it covered in the fridge for up to 3 days. Pour it into a tray while still warm, so it sets, then slice and fry or grill it until crisp.',
          'Răcește polenta rămasă în cel mult 2 ore și ține-o acoperită la frigider până la 3 zile. Toarn-o într-o tavă cât e caldă, ca să se întărească, apoi taie-o felii și prăjește-le sau coace-le pe grătar până se rumenesc.',
        ),
      ],
      stepTips: [
        {
          step: 'cheese',
          text: t(
            'Cube the fontina small and add it off the heat: over high heat it turns rubbery and oily instead of stringy.',
            'Taie fontina mărunt și adaug-o de pe foc: la foc mare devine cauciucată și uleioasă, în loc să se întindă în fire.',
          ),
        },
      ],
      nutritionNote: t(
        'A rich main, not a side: the cheese adds protein, while the cheese, butter and milk together make it high in saturated fat and fairly salty. Cornmeal gives slow, filling carbohydrate. Eat a modest bowl and add a bitter green salad, since the dish itself has little fibre.',
        'Un fel principal bogat, nu o garnitură: brânza adaugă proteine, dar brânza, untul și laptele împreună îl fac bogat în grăsimi saturate și destul de sărat. Mălaiul dă carbohidrați sățioși. Mănâncă un bol potrivit și adaugă o salată de frunze amărui, fiindcă preparatul are puține fibre.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Sautéed porcini', 'Hribi trași la tigaie'),
          ingredient: 'porcini',
          reason: t(
            'Their earthy flavour suits the nutty browned butter and melted fontina.',
            'Gustul lor de pădure se potrivește cu untul rumenit și cu fontina topită.',
          ),
          principle: 'complement_flavour',
        },
        {
          kind: 'food',
          label: t('Radicchio salad', 'Salată de radicchio'),
          ingredient: 'radicchio',
          reason: t(
            'Its bitterness balances the rich, buttery cheese.',
            'Amăreala ei echilibrează brânza bogată și untoasă.',
          ),
          principle: 'bitter_balances_rich',
        },
        {
          kind: 'food',
          label: t('Crisp sage leaves', 'Frunze de salvie crocante'),
          ingredient: 'sage',
          reason: t(
            'Sage and butter are a classic pair, and the crisp leaves add texture.',
            'Salvia și untul sunt o pereche clasică, iar frunzele crocante adaugă textură.',
          ),
          principle: 'contrast_texture',
        },
        {
          kind: 'drink',
          label: t('Light dry red wine', 'Vin roșu sec, ușor'),
          ingredient: 'red-wine',
          reason: t(
            'Its acidity cuts through the cheese and butter without overwhelming the polenta.',
            'Aciditatea lui taie din brânză și din unt fără să acopere polenta.',
          ),
          principle: 'acid_cuts_fat',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Hot, creamy and rich: a bowl of this warms you on a cold day.',
            'Fierbinte, cremoasă și bogată: un bol din ea te încălzește într-o zi rece.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'The fat from the cheese and butter digests slowly and sits heavy.',
            'Grăsimea din brânză și din unt se digeră greu și stă ca o piatră în stomac.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A very rich bowl is too heavy to eat close to bedtime.',
            'Un bol foarte bogat e prea greu ca să-l mănânci aproape de culcare.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'Steaming and rich, it does not suit the heat.',
            'Fierbinte și bogat, nu se potrivește cu zilele călduroase.',
          ),
        },
      ],
    },
    {
      slug: 'mamaliga-american',
      cuisine: 'american',
      title: t('Shrimp and grits', 'Creveți cu grits'),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 55,
      difficulty: 'medium',
      hideBaseTips: [1],
      lines: [
        { ingredient: 'grits', quantity: 200, unit: 'g' },
        { ingredient: 'still-water', quantity: 0.5, unit: 'l' },
        {
          ingredient: 'chicken-stock',
          quantity: 500,
          unit: 'ml',
        },
        {
          ingredient: 'salt',
          key: 'salt-grits',
          quantity: 3,
          unit: 'g',
          note: t('for the grits', 'pentru grits'),
        },
        {
          ingredient: 'butter',
          quantity: 40,
          unit: 'g',
          note: t('for the grits', 'pentru grits'),
        },
        {
          ingredient: 'cheddar',
          quantity: 100,
          unit: 'g',
          note: t('coarsely grated', 'ras grosier'),
        },
        {
          ingredient: 'bacon',
          quantity: 100,
          unit: 'g',
          note: t('cut into 1 cm pieces', 'tăiat în bucăți de 1 cm'),
        },
        {
          ingredient: 'shrimp',
          quantity: 450,
          unit: 'g',
          note: t(
            'raw, peeled and deveined',
            'cruzi, curățați și fără intestin',
          ),
        },
        {
          ingredient: 'salt',
          key: 'salt-shrimp',
          quantity: 2,
          unit: 'g',
          note: t('for the shrimp', 'pentru creveți'),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        {
          ingredient: 'cayenne',
          quantity: 1,
          unit: 'g',
          optional: true,
        },
        {
          ingredient: 'garlic',
          quantity: 12,
          unit: 'g',
          note: t('3 cloves, minced', '3 căței, tocați mărunt'),
        },
        {
          ingredient: 'spring-onion',
          quantity: 40,
          unit: 'g',
          note: t('thinly sliced', 'tăiată subțire'),
        },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'half for the juice, half cut into 4 wedges',
            'jumătate pentru suc, jumătate tăiată în 4 felii',
          ),
        },
      ],
      steps: [
        {
          key: 'boil',
          text: t(
            'Bring the water and chicken stock to a boil with the salt in a heavy pot.',
            'Pune apa, supa de pui și sarea la fiert într-o oală grea, până dau în clocot.',
          ),
        },
        {
          key: 'whisk',
          text: t(
            'Lower the heat to medium. Whisk constantly while you pour in the grits in a thin stream, so no lumps form.',
            'Dă focul la mediu. Toarnă grits în fir subțire, amestecând mereu cu telul, ca să nu se facă cocoloașe.',
          ),
        },
        {
          key: 'cook',
          text: t(
            'Turn the heat to low and cook for 35 minutes, stirring every few minutes. Add a splash of hot water if the grits get too thick to stir. They are ready when they are creamy and tender, with no gritty crunch when you taste them.',
            'Dă focul la mic și fierbe 35 de minute, amestecând la câteva minute. Adaugă puțină apă fierbinte dacă grits devin prea groși ca să-i amesteci. Sunt gata când sunt cremoși și fragezi, iar la gust nu mai scrâșnesc.',
          ),
          timerSeconds: 2100,
        },
        {
          key: 'enrich',
          text: t(
            'Take the pot off the heat. Stir in the butter and the cheddar until melted and smooth, taste for salt, then cover to keep warm.',
            'Ia oala de pe foc. Amestecă untul și cheddarul până se topesc și compoziția e netedă, gustă de sare, apoi acoperă ca să rămână caldă.',
          ),
        },
        {
          key: 'bacon',
          text: t(
            'Put the bacon in a large cold skillet and cook over medium heat for about 7 minutes, stirring now and then, until crisp and golden. Lift it out onto paper towels and pour off all but about 2 tablespoons (30 ml) of the fat.',
            'Pune baconul într-o tigaie mare rece și gătește-l la foc mediu cam 7 minute, amestecând din când în când, până devine crocant și auriu. Scoate-l pe șervețele de hârtie și toarnă din tigaie grăsimea, lăsând doar cam 2 linguri (30 ml).',
          ),
          timerSeconds: 420,
        },
        {
          key: 'season',
          text: t(
            'Pat the shrimp dry with paper towels and toss them with the salt, black pepper and cayenne.',
            'Șterge bine creveții cu șervețele de hârtie și amestecă-i cu sarea, piperul negru și piperul cayenne.',
          ),
        },
        {
          key: 'sear',
          text: t(
            'Heat the skillet with the bacon fat over medium-high heat. Add the shrimp in a single layer and cook for about 2 minutes per side. They are done when they are pink and opaque all the way through and curled into a loose C; a tight O means overcooked.',
            'Încinge tigaia cu grăsimea de bacon la foc mediu spre mare. Adaugă creveții într-un singur strat și gătește-i cam 2 minute pe fiecare parte. Sunt gata când sunt roz și opaci până în centru și încolăciți într-un C larg; un O strâns înseamnă că s-au gătit prea mult.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'finish-shrimp',
          text: t(
            'Add the garlic and cook for 30 seconds, until fragrant. Take the pan off the heat, squeeze in the juice of the half lemon, and stir in the bacon and half of the spring onion.',
            'Adaugă usturoiul și gătește 30 de secunde, până miroase. Ia tigaia de pe foc, stoarce sucul de la jumătatea de lămâie și amestecă baconul și jumătate din ceapa verde.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Spoon the grits into warm bowls, top with the shrimp and pan juices, scatter over the rest of the spring onion and add a lemon wedge to each bowl.',
            'Pune grits în boluri calde, adaugă deasupra creveții cu sosul din tigaie, presară restul de ceapă verde și pune în fiecare bol o felie de lămâie.',
          ),
        },
      ],
      tips: [
        t(
          'Shrimp go from tender to rubbery in under a minute: pull them off the heat as soon as they are opaque, since they keep cooking in the pan juices.',
          'Creveții trec de la fragezi la cauciucați în mai puțin de un minut: ia-i de pe foc de îndată ce sunt opaci, fiindcă își continuă gătirea în sosul din tigaie.',
        ),
        t(
          'Cool leftovers within 2 hours and keep grits and shrimp separately in the fridge for up to 2 days. Reheat the grits with a splash of water or milk, and warm the shrimp only until hot, so they do not turn rubbery.',
          'Răcește resturile în cel mult 2 ore și ține grits și creveții separat la frigider până la 2 zile. Încălzește grits cu puțină apă sau lapte, iar creveții doar cât să se încălzească, ca să nu se întărească.',
        ),
      ],
      stepTips: [
        {
          step: 'sear',
          text: t(
            'Do not crowd the pan: cook the shrimp in two batches if they do not fit in one layer, otherwise they steam and turn pale instead of searing.',
            'Nu aglomera tigaia: gătește creveții în două tranșe dacă nu încap într-un singur strat, altfel se fierb în aburi și rămân palizi, în loc să se rumenească.',
          ),
        },
      ],
      nutritionNote: t(
        'Shrimp bring lean protein, and grits give filling carbohydrate. Bacon, cheddar, butter and stock make the dish high in salt and saturated fat, so use a low-salt stock, salt lightly and keep the bacon modest. Grits have little fibre, so serve a green side.',
        'Creveții aduc proteine slabe, iar grits dau carbohidrați sățioși. Baconul, cheddarul, untul și supa fac preparatul bogat în sare și grăsimi saturate, așa că alege o supă cu puțină sare, sărează ușor și nu exagera cu baconul. Grits au puține fibre, deci servește-le cu ceva verde alături.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Sautéed kale', 'Kale sotat'),
          ingredient: 'kale',
          reason: t(
            'Slightly bitter greens balance the rich, cheesy grits and add fibre.',
            'Verdețurile ușor amărui echilibrează grits bogați, cu brânză, și adaugă fibre.',
          ),
          principle: 'bitter_balances_rich',
        },
        {
          kind: 'food',
          label: t('Hot sauce', 'Sos iute'),
          ingredient: 'hot-sauce',
          reason: t(
            'Vinegary heat cuts through the butter and cheese, as it does on a Lowcountry table.',
            'Iuțeala acrișoară taie din unt și din brânză, așa cum se face pe masa din Lowcountry.',
          ),
          principle: 'acid_cuts_fat',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          ingredient: 'white-wine',
          reason: t(
            'Crisp acidity refreshes the palate after butter, bacon and shrimp.',
            'Aciditatea vie împrospătează gustul după unt, bacon și creveți.',
          ),
          principle: 'cleanses_palate',
        },
        {
          kind: 'drink',
          label: t('Cold lager', 'Bere blondă rece'),
          ingredient: 'beer',
          reason: t(
            'Cold and light, it cleans the palate between creamy, salty bites.',
            'Rece și ușoară, curăță gustul între îmbucăturile cremoase și sărate.',
          ),
          principle: 'cleanses_palate',
        },
      ],
      eatingMoments: [
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'A classic Southern brunch dish: hearty and impressive for a slow weekend meal.',
            'Un preparat clasic de brunch din sudul SUA: consistent și potrivit pentru o masă de weekend.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Warm, creamy grits are comforting on a cold day.',
            'Grits calzi și cremoși alină într-o zi rece.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Bacon, butter and cheese are heavy to digest before exercise.',
            'Baconul, untul și brânza se digeră greu înainte de efort.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A rich, salty plate sits heavy close to bedtime.',
            'O farfurie bogată și sărată cade greu aproape de culcare.',
          ),
        },
      ],
    },
  ],
};
