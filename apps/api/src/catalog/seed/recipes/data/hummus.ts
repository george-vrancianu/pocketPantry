import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Hummus base is the smooth chickpea and tahini dip made from dried
// chickpeas. Each Variant is a full Recipe with its own lines, steps and
// guidance; the base's Recipe-level Tips are inherited unless a Variant hides
// them.
export const hummus: BaseRecipeSeed = {
  slug: 'hummus',
  title: t(
    'Hummus (chickpea and tahini dip)',
    'Humus (pastă de năut cu tahini)',
  ),
  servings: 8,
  prepMinutes: 730,
  cookMinutes: 95,
  difficulty: 'easy',
  lines: [
    { ingredient: 'chickpeas', quantity: 250, unit: 'g' },
    {
      ingredient: 'still-water',
      key: 'soak-cook-water',
      quantity: 3,
      unit: 'l',
      note: t(
        '1.5 l for soaking, 1.5 l for cooking',
        '1,5 l pentru înmuiat, 1,5 l pentru fiert',
      ),
    },
    {
      ingredient: 'baking-soda',
      quantity: 8,
      unit: 'g',
      note: t('3 g to soak, 5 g to cook', '3 g la înmuiat, 5 g la fiert'),
    },
    { ingredient: 'tahini', quantity: 120, unit: 'g' },
    {
      ingredient: 'lemon',
      quantity: 2,
      unit: 'pcs',
      note: t('juiced, about 80 ml', 'stoarse, aproximativ 80 ml'),
    },
    {
      ingredient: 'garlic',
      quantity: 6,
      unit: 'g',
      note: t('2 cloves', '2 căței'),
    },
    { ingredient: 'salt', quantity: 7, unit: 'g' },
    { ingredient: 'cumin', quantity: 2, unit: 'g', optional: true },
    {
      ingredient: 'still-water',
      key: 'ice-water',
      quantity: 0.09,
      unit: 'l',
      note: t('ice cold', 'rece ca gheața'),
    },
    {
      ingredient: 'olive-oil',
      quantity: 30,
      unit: 'ml',
      note: t('to serve', 'pentru servit'),
    },
    {
      ingredient: 'paprika',
      quantity: 1,
      unit: 'g',
      optional: true,
      note: t('to finish', 'pentru final'),
    },
    {
      ingredient: 'parsley',
      quantity: 10,
      unit: 'g',
      optional: true,
      note: t('chopped', 'tocat'),
    },
  ],
  steps: [
    {
      key: 'soak',
      text: t(
        'Rinse the chickpeas, then cover them with 1.5 l cold water and stir in 3 g of the baking soda. Soak for about 12 hours, or overnight; they will swell to more than double.',
        'Spală năutul, apoi acoperă-l cu 1,5 l de apă rece și adaugă 3 g din bicarbonat. Amestecă și lasă-l la înmuiat aproximativ 12 ore, sau peste noapte; se va umfla de mai mult de două ori.',
      ),
      timerSeconds: 43200,
    },
    {
      key: 'boil',
      text: t(
        'Drain and rinse the soaked chickpeas well. Put them in a large pot with 1.5 l fresh water and the remaining 5 g baking soda, and bring to the boil over high heat, about 10 minutes. Skim off the foam.',
        'Scurge și clătește bine năutul înmuiat. Pune-l într-o oală mare cu 1,5 l de apă proaspătă și restul de 5 g de bicarbonat și adu la fierbere la foc mare, aproximativ 10 minute. Ia spuma de la suprafață.',
      ),
    },
    {
      key: 'simmer',
      text: t(
        'Lower the heat and simmer, partly covered, for about 1 hour, skimming off any skins that float up. Top up with hot water if the level drops below the chickpeas. They are ready when a chickpea squashes to a paste between your thumb and finger with almost no pressure.',
        'Dă focul mai mic și lasă să fiarbă încet, cu capacul pe jumătate, aproximativ 1 oră, scoțând pielițele care ies la suprafață. Completează cu apă fierbinte dacă nivelul scade sub năut. Este gata când un bob se face pastă între degetul mare și arătător, aproape fără apăsare.',
      ),
      timerSeconds: 3600,
    },
    {
      key: 'drain',
      text: t(
        'Set aside 50 g of the cooked chickpeas for the top. Drain the rest in a colander, keeping a mugful of the cooking water, and use them while still warm.',
        'Pune deoparte 50 g din năutul fiert pentru decor. Scurge restul într-o strecurătoare, păstrând o cană din apa de fiert, și folosește-l cât e încă cald.',
      ),
    },
    {
      key: 'whip-tahini',
      text: t(
        'In a food processor, blend the tahini, lemon juice, garlic, salt and cumin (if using) for 1 minute until pale and thick. Scrape down the sides.',
        'Într-un robot de bucătărie, mixează tahini, sucul de lămâie, usturoiul, sarea și chimionul (dacă folosești) timp de 1 minut, până se deschide la culoare și se îngroașă. Răzuiește pereții vasului.',
      ),
    },
    {
      key: 'blend',
      text: t(
        'Add the warm chickpeas and blend for 2 minutes. With the motor running, pour in the ice-cold water a little at a time, then blend for another 3 to 4 minutes until completely smooth and creamy. Add a splash of the cooking water if it is stiff.',
        'Adaugă năutul cald și mixează 2 minute. Cu aparatul pornit, toarnă încet apa rece ca gheața, apoi mixează încă 3-4 minute, până devine complet fin și cremos. Dacă e prea tare, adaugă puțină apă de la fiert.',
      ),
      timerSeconds: 360,
    },
    {
      key: 'rest',
      text: t(
        'Taste and add more salt or lemon if needed. Cover and let the hummus rest for 10 minutes so the flavours settle.',
        'Gustă și adaugă sare sau lămâie, dacă e nevoie. Acoperă și lasă humusul să se odihnească 10 minute, ca aromele să se așeze.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'serve',
      text: t(
        'Spoon the hummus into a shallow bowl and sweep a well into the top with the back of the spoon. Fill it with the olive oil, scatter over the reserved chickpeas, then the paprika and parsley (if using). Serve at room temperature.',
        'Pune humusul într-un bol larg și fă cu dosul lingurii o adâncitură în el. Toarnă uleiul de măsline în ea, presară năutul rezervat, apoi boia și pătrunjelul (dacă folosești). Servește la temperatura camerei.',
      ),
    },
    {
      key: 'store',
      text: t(
        'Put any leftovers in an airtight container within 2 hours, pour a thin layer of olive oil over the top, and keep in the fridge for 3 to 4 days.',
        'Pune restul într-un recipient etanș în cel mult 2 ore, toarnă deasupra un strat subțire de ulei de măsline și păstrează la frigider 3-4 zile.',
      ),
    },
  ],
  tips: [
    t(
      'No time to soak? Use canned chickpeas: drain and rinse them, simmer for 15 to 20 minutes in water with about 2.5 g (½ tsp) baking soda per tin until very soft, then drain. One 400 g tin replaces about 100 g dried chickpeas, so use 2½ tins for 250 g dried.',
      'N-ai timp de înmuiat? Folosește năut din conservă: scurge-l și clătește-l, fierbe-l 15-20 de minute în apă cu aproximativ 2,5 g (½ linguriță) de bicarbonat la o conservă, până se înmoaie foarte tare, apoi scurge-l. O conservă de 400 g înlocuiește aproximativ 100 g de năut uscat, deci folosește 2½ conserve pentru 250 g de năut uscat.',
    ),
    t(
      'Hummus tastes flat straight from the fridge: let it stand for 20 minutes and taste again for salt and lemon before serving.',
      'Humusul are gust șters direct din frigider: lasă-l 20 de minute la temperatura camerei și gustă din nou de sare și lămâie înainte de servit.',
    ),
    t(
      'If the hummus has stiffened in the fridge, stir it and add a spoon of cold water.',
      'Dacă humusul s-a întărit la frigider, amestecă-l și adaugă o lingură de apă rece.',
    ),
  ],
  stepTips: [
    {
      step: 'simmer',
      text: t(
        'Overcook them on purpose: chickpeas that are merely tender give a grainy hummus, while ones that fall apart blend silky smooth.',
        'Fierbe-l mai mult decât ai crede: un năut doar fraged dă un humus granulat, unul care se destramă iese mătăsos.',
      ),
    },
    {
      step: 'whip-tahini',
      text: t(
        'The tahini first stiffens as the lemon juice goes in, then turns pale and loosens. Keep blending rather than adding water.',
        'Tahini se întărește mai întâi când intră sucul de lămâie, apoi se deschide la culoare și se înmoaie. Continuă să mixezi, fără să adaugi apă.',
      ),
    },
  ],
  nutritionNote: t(
    'Chickpeas bring plant protein and fibre, and tahini adds mostly unsaturated fat and minerals, so a small portion is filling. It is calorie-dense once the tahini and olive oil are in, and the salt adds up if you eat it by the bowlful; sesame is an allergen.',
    'Năutul aduce proteine vegetale și fibre, iar tahini adaugă grăsimi în mare parte nesaturate și minerale, așa că o porție mică săturează. E bogat în calorii din cauza tahini și a uleiului de măsline, iar sarea se adună dacă mănânci bolul întreg; susanul este alergen.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Warm pita', 'Lipie caldă'),
      reason: t(
        'Soft bread is the usual scoop, and its plain wheat flavour lets the tahini and lemon come through.',
        'Pâinea moale servește ca lingură, iar gustul ei neutru lasă să se simtă tahini și lămâia.',
      ),
      principle: 'complement_flavour',
      ingredient: 'pita',
    },
    {
      kind: 'food',
      label: t('Cucumber sticks', 'Bețe de castravete'),
      reason: t(
        'Cool, crisp and watery against the thick, rich dip.',
        'Răcoroase, crocante și zemoase, în contrast cu pasta groasă și bogată.',
      ),
      principle: 'contrast_texture',
      ingredient: 'cucumber',
    },
    {
      kind: 'food',
      label: t('Carrot sticks', 'Bețe de morcov'),
      reason: t(
        'Their sweetness and snap suit the nutty, garlicky dip.',
        'Dulceața și textura lor crocantă se potrivesc cu pasta cu gust de nucă și usturoi.',
      ),
      principle: 'contrast_texture',
      ingredient: 'carrot',
    },
    {
      kind: 'food',
      label: t('Olives', 'Măsline'),
      reason: t(
        'Their briny bite sets off the nutty tahini.',
        'Gustul lor sărat pune în valoare tahini.',
      ),
      principle: 'complement_flavour',
      ingredient: 'olives',
    },
    {
      kind: 'food',
      label: t(
        'Kofta kebab (grilled lamb kofta)',
        'Kofta kebab (frigărui din carne tocată de miel)',
      ),
      reason: t(
        'Hummus sits beside grilled kofta on a mezze table, where its creaminess cools the spiced, smoky meat.',
        'Humusul stă lângă kofta la grătar pe o masă de mezze, iar cremozitatea lui răcorește carnea condimentată și afumată.',
      ),
      principle: 'regional_tradition',
      recipe: 'mici-middle-eastern',
    },
    {
      kind: 'drink',
      label: t('Tea', 'Ceai'),
      reason: t(
        'Its light bitterness balances the rich dip.',
        'Amăreala ușoară a ceaiului echilibrează pasta bogată.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'tea',
    },
  ],
  eatingMoments: [
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'With pita and raw vegetables it is a filling meal that is not heavy.',
        'Cu lipie și legume crude e o masă săturătoare, dar ușoară.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'good_for',
      reason: t(
        'Pita and chickpeas give slow carbohydrates; keep the portion modest so it does not sit heavy.',
        'Lipia și năutul dau carbohidrați cu eliberare lentă; ține porția mică, ca să nu cadă greu.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'good_for',
      reason: t(
        'Made ahead, it is a no-heat meal on the day, light with raw vegetables.',
        'Făcut dinainte, e o masă fără foc în ziua respectivă, ușoară, cu legume crude.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Pulses and raw garlic can sit heavily and cause wind before bed.',
        'Leguminoasele și usturoiul crud pot cădea greu și produce gaze înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'hummus-middle-eastern',
      cuisine: 'middle-eastern',
      title: t(
        'Hummus bil lahme (hummus topped with spiced lamb and pine nuts)',
        'Hummus bil lahme (humus cu carne de miel condimentată și semințe de pin)',
      ),
      servings: 4,
      prepMinutes: 735,
      cookMinutes: 105,
      difficulty: 'easy',
      hideBaseTips: [2],
      lines: [
        { ingredient: 'chickpeas', quantity: 125, unit: 'g' },
        {
          ingredient: 'still-water',
          key: 'soak-cook-water',
          quantity: 1.5,
          unit: 'l',
          note: t(
            '750 ml for soaking, 750 ml for cooking',
            '750 ml pentru înmuiat, 750 ml pentru fiert',
          ),
        },
        {
          ingredient: 'baking-soda',
          quantity: 4,
          unit: 'g',
          note: t(
            '1.5 g to soak, 2.5 g to cook',
            '1,5 g la înmuiat, 2,5 g la fiert',
          ),
        },
        { ingredient: 'tahini', quantity: 60, unit: 'g' },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t('juiced, about 40 ml', 'storsă, aproximativ 40 ml'),
        },
        {
          ingredient: 'garlic',
          quantity: 3,
          unit: 'g',
          note: t('1 clove', '1 cățel'),
        },
        { ingredient: 'salt', quantity: 3.5, unit: 'g', key: 'salt-hummus' },
        {
          ingredient: 'still-water',
          key: 'ice-water',
          quantity: 0.045,
          unit: 'l',
          note: t('ice cold', 'rece ca gheața'),
        },
        {
          ingredient: 'minced-lamb',
          quantity: 300,
          unit: 'g',
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          optional: true,
          note: t('small, finely chopped', 'mică, tocată mărunt'),
        },
        {
          ingredient: 'clarified-butter',
          quantity: 30,
          unit: 'g',
          note: t('samneh or ghee', 'samneh sau ghee'),
        },
        { ingredient: 'pine-nuts', quantity: 30, unit: 'g' },
        { ingredient: 'seven-spice', quantity: 3, unit: 'g' },
        { ingredient: 'salt', key: 'salt-lamb', quantity: 2, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        {
          ingredient: 'parsley',
          quantity: 10,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'olive-oil',
          quantity: 15,
          unit: 'ml',
          note: t('to serve', 'pentru servit'),
        },
      ],
      steps: [
        {
          key: 'soak',
          text: t(
            'Rinse the chickpeas, then cover them with 750 ml cold water and stir in 1.5 g of the baking soda. Soak for about 12 hours, or overnight.',
            'Spală năutul, apoi acoperă-l cu 750 ml de apă rece și adaugă 1,5 g din bicarbonat. Amestecă și lasă-l la înmuiat aproximativ 12 ore, sau peste noapte.',
          ),
          timerSeconds: 43200,
        },
        {
          key: 'boil',
          text: t(
            'Drain and rinse the chickpeas. Put them in a pot with 750 ml fresh water and the remaining 2.5 g baking soda and bring to the boil over high heat, about 10 minutes. Skim off the foam.',
            'Scurge și clătește năutul. Pune-l într-o oală cu 750 ml de apă proaspătă și restul de 2,5 g de bicarbonat și adu la fierbere la foc mare, aproximativ 10 minute. Ia spuma de la suprafață.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Lower the heat and simmer, partly covered, for about 1 hour, skimming off floating skins. They are ready when a chickpea squashes to a paste between your thumb and finger with almost no pressure.',
            'Dă focul mai mic și lasă să fiarbă încet, cu capacul pe jumătate, aproximativ 1 oră, scoțând pielițele plutitoare. Este gata când un bob se face pastă între degetul mare și arătător, aproape fără apăsare.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'drain',
          text: t(
            'Drain the chickpeas, keeping a small cup of the cooking water. Meanwhile chop the onion (if using) and the parsley, so the board is clean before the lamb comes out.',
            'Scurge năutul, păstrând o ceașcă mică din apa de fiert. Între timp, toacă ceapa (dacă folosești) și pătrunjelul, ca tocătorul să fie curat înainte să scoți carnea de miel.',
          ),
        },
        {
          key: 'blend',
          text: t(
            'In a food processor, blend the tahini, lemon juice, garlic and the hummus salt for 1 minute. Add the warm chickpeas and blend for 2 minutes. With the motor running, pour in the ice-cold water a little at a time, then blend for another 3 to 4 minutes until smooth, adding a splash of cooking water if it is stiff.',
            'Într-un robot de bucătărie, mixează tahini, sucul de lămâie, usturoiul și sarea pentru humus timp de 1 minut. Adaugă năutul cald și mixează 2 minute. Cu aparatul pornit, toarnă încet apa rece ca gheața, apoi mixează încă 3-4 minute, până devine fin, adăugând puțină apă de la fiert dacă e prea tare.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'spread',
          text: t(
            'Spread the hummus in a shallow serving bowl, swirling it up the sides with the back of a spoon to leave a wide well. Leave it to rest while you cook the topping.',
            'Întinde humusul într-un bol larg, trăgând cu dosul lingurii spre margini, ca să rămână o adâncitură largă în mijloc. Lasă-l să se odihnească cât pregătești carnea.',
          ),
        },
        {
          key: 'pine-nuts',
          text: t(
            'Melt 10 g of the clarified butter in a wide frying pan over medium heat. Add the pine nuts and stir for 1 to 2 minutes until golden; they burn fast. Lift them out onto a clean plate.',
            'Topește 10 g din untul clarificat într-o tigaie largă, la foc mediu. Adaugă semințele de pin și amestecă 1-2 minute, până capătă o culoare aurie; se ard repede. Scoate-le pe o farfurie curată.',
          ),
        },
        {
          key: 'onion',
          text: t(
            'Add 10 g more clarified butter and the onion to the same pan and cook over medium heat for 5 minutes until soft and golden at the edges. If you are not using onion, skip this step and add the 10 g butter with the lamb.',
            'Adaugă în aceeași tigaie încă 10 g de unt clarificat și ceapa și gătește la foc mediu 5 minute, până se înmoaie și se rumenește pe margini. Dacă nu folosești ceapă, sari peste acest pas și adaugă cele 10 g de unt clarificat odată cu carnea.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'lamb',
          text: t(
            'Turn the heat to medium-high and add the minced lamb. Break it up with a spoon and fry for about 8 minutes, stirring now and then, until it is browned and there is no pink left. A thermometer in the thickest clump should read 71 °C and any juices should run clear. Stir in the seven spice, salt and pepper for the last minute.',
            'Dă focul mai tare și adaugă carnea tocată de miel. Desfă-o cu o lingură și prăjește-o aproximativ 8 minute, amestecând din când în când, până se rumenește și nu mai rămâne nimic roz. Un termometru în cea mai groasă bucată trebuie să arate 71 °C, iar zeama să fie limpede. În ultimul minut adaugă amestecul de șapte condimente, sarea și piperul și amestecă.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'wash',
          text: t(
            'Wash your hands, the board, the knife and the spoon that touched the raw lamb in hot soapy water before you handle anything else. Use a clean spoon from here on.',
            'Spală-te pe mâini și spală tocătorul, cuțitul și lingura care au atins carnea crudă de miel cu apă fierbinte și săpun, înainte să atingi altceva. De acum folosește o lingură curată.',
          ),
        },
        {
          key: 'top',
          text: t(
            'Spoon the hot lamb and its buttery juices into the well of the hummus. Melt the remaining 10 g clarified butter in the pan for a few seconds and pour it over. Scatter over the pine nuts and parsley and drizzle with the olive oil. Serve at once with pita.',
            'Pune carnea fierbinte cu zeama ei cu unt în adâncitura din humus. Topește în tigaie câteva secunde ultimele 10 g de unt clarificat și toarnă-l peste carne. Presară semințele de pin și pătrunjelul și stropește cu ulei de măsline. Servește imediat, cu lipie.',
          ),
        },
      ],
      tips: [
        t(
          'Keep the hummus and the lamb apart in the fridge: eat the hummus within 3 to 4 days, and the cooked lamb within 3 to 4 days, reheated until steaming hot (74 °C). Both go into the fridge within 2 hours.',
          'Păstrează humusul și carnea separat la frigider: mănâncă humusul în 3-4 zile și carnea gătită tot în 3-4 zile, reîncălzită până scoate aburi (74 °C). Ambele intră la frigider în cel mult 2 ore.',
        ),
      ],
      stepTips: [
        {
          step: 'lamb',
          text: t(
            'Do not crowd the pan: let the lamb sit for a minute between stirs so it browns instead of stewing in its own juice.',
            'Nu aglomera tigaia: lasă carnea un minut între amestecări, ca să se rumenească în loc să fiarbă în propria zeamă.',
          ),
        },
      ],
      nutritionNote: t(
        'Chickpeas and lamb give plenty of protein, the lamb adds iron, and the tahini adds mostly unsaturated fat. The lamb and clarified butter add saturated fat, and with the pita it is a heavy, salty plate, so keep portions moderate and serve vegetables beside it.',
        'Năutul și mielul dau multe proteine, mielul aduce fier, iar tahini adaugă grăsimi în mare parte nesaturate. Mielul și untul clarificat aduc grăsimi saturate, iar cu lipie e o farfurie grea și sărată, așa că ține porțiile moderate și servește legume alături.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Warm pita', 'Lipie caldă'),
          reason: t(
            'It scoops up the hummus and the spiced lamb together.',
            'Adună laolaltă humusul și carnea condimentată.',
          ),
          principle: 'complement_flavour',
          ingredient: 'pita',
        },
        {
          kind: 'food',
          label: t('Cucumber', 'Castravete'),
          reason: t(
            'Cool and crunchy against the hot, rich lamb.',
            'Răcoros și crocant, în contrast cu mielul fierbinte și bogat.',
          ),
          principle: 'contrast_texture',
          ingredient: 'cucumber',
        },
        {
          kind: 'food',
          label: t('Olives', 'Măsline'),
          reason: t(
            'Their salty tang suits the rich, spiced lamb.',
            'Gustul lor sărat se potrivește cu mielul bogat și condimentat.',
          ),
          principle: 'complement_flavour',
          ingredient: 'olives',
        },
        {
          kind: 'drink',
          label: t('Tea', 'Ceai'),
          reason: t(
            'Its light bitterness balances the rich meat.',
            'Amăreala ușoară a ceaiului echilibrează carnea bogată.',
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
            'Hot spiced meat over creamy hummus is warming and filling.',
            'Carnea fierbinte condimentată peste humusul cremos încălzește și satură.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from the lamb and chickpeas, plus carbohydrates from the pita, help recovery.',
            'Proteinele din miel și năut, plus carbohidrații din lipie, ajută la refacere.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Fatty meat, pulses and garlic make a heavy meal to sleep on.',
            'Carnea grasă, leguminoasele și usturoiul fac o masă grea înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'hummus-turkish',
      cuisine: 'turkish',
      title: t(
        'Sıcak humus (Turkish warm hummus baked and finished with sizzling butter and pul biber)',
        'Sıcak humus (humus turcesc cald, copt, servit fierbinte cu unt încins și pul biber)',
      ),
      servings: 4,
      prepMinutes: 735,
      cookMinutes: 110,
      difficulty: 'easy',
      hideBaseTips: [1],
      lines: [
        { ingredient: 'chickpeas', quantity: 125, unit: 'g' },
        {
          ingredient: 'still-water',
          key: 'soak-cook-water',
          quantity: 1.5,
          unit: 'l',
          note: t(
            '750 ml for soaking, 750 ml for cooking',
            '750 ml pentru înmuiat, 750 ml pentru fiert',
          ),
        },
        {
          ingredient: 'baking-soda',
          quantity: 4,
          unit: 'g',
          note: t(
            '1.5 g to soak, 2.5 g to cook',
            '1,5 g la înmuiat, 2,5 g la fiert',
          ),
        },
        { ingredient: 'tahini', quantity: 60, unit: 'g' },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t('juiced, about 40 ml', 'storsă, aproximativ 40 ml'),
        },
        {
          ingredient: 'garlic',
          quantity: 3,
          unit: 'g',
          note: t('1 clove', '1 cățel'),
        },
        { ingredient: 'salt', quantity: 3.5, unit: 'g' },
        { ingredient: 'cumin', quantity: 1, unit: 'g', optional: true },
        {
          ingredient: 'still-water',
          key: 'ice-water',
          quantity: 0.045,
          unit: 'l',
          note: t('ice cold', 'rece ca gheața'),
        },
        {
          ingredient: 'butter',
          quantity: 40,
          unit: 'g',
          note: t('to finish', 'pentru final'),
        },
        { ingredient: 'pul-biber', quantity: 3, unit: 'g' },
        { ingredient: 'sumac', quantity: 1, unit: 'g', optional: true },
        {
          ingredient: 'parsley',
          quantity: 10,
          unit: 'g',
          optional: true,
          note: t('chopped', 'tocat'),
        },
      ],
      steps: [
        {
          key: 'soak',
          text: t(
            'Rinse the chickpeas, then cover them with 750 ml cold water and add 1.5 g of the baking soda. Stir and soak for about 12 hours, or overnight.',
            'Spală năutul, apoi acoperă-l cu 750 ml de apă rece și adaugă 1,5 g din bicarbonat. Amestecă și lasă la înmuiat aproximativ 12 ore, sau peste noapte.',
          ),
          timerSeconds: 43200,
        },
        {
          key: 'boil',
          text: t(
            'Drain and rinse the chickpeas. Put them in a pot with 750 ml fresh water and the remaining 2.5 g baking soda and bring to the boil over high heat, about 10 minutes. Skim off the foam.',
            'Scurge și clătește năutul. Pune-l într-o oală cu 750 ml de apă proaspătă și restul de 2,5 g de bicarbonat și adu la fierbere la foc mare, aproximativ 10 minute. Ia spuma de la suprafață.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Lower the heat and simmer, partly covered, for about 1 hour, skimming off floating skins. They are ready when a chickpea squashes to a paste between your thumb and finger with almost no pressure.',
            'Dă focul mai mic și lasă să fiarbă încet, cu capacul pe jumătate, aproximativ 1 oră, scoțând pielițele plutitoare. Este gata când un bob se face pastă între degetul mare și arătător, aproape fără apăsare.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'drain',
          text: t(
            'Drain the chickpeas, keeping a small cup of the cooking water. Set aside 10 whole chickpeas for the top.',
            'Scurge năutul, păstrând o ceașcă mică din apa de fiert. Pune deoparte 10 boabe întregi pentru decor.',
          ),
        },
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 200 °C (180 °C fan), about 10 minutes, while you blend the hummus.',
            'Încălzește cuptorul la 200 °C (180 °C cu ventilator), aproximativ 10 minute, cât mixezi humusul.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'whip-tahini',
          text: t(
            'In a food processor, blend the tahini, lemon juice, garlic, salt and cumin (if using) for 1 minute until pale and thick.',
            'Într-un robot de bucătărie, mixează tahini, sucul de lămâie, usturoiul, sarea și chimionul (dacă folosești) timp de 1 minut, până se deschide la culoare și se îngroașă.',
          ),
        },
        {
          key: 'blend',
          text: t(
            'Add the rest of the warm chickpeas and blend for 2 minutes. With the motor running, pour in the ice-cold water a little at a time, then blend for another 3 to 4 minutes until smooth, adding a splash of cooking water if it is stiff.',
            'Adaugă restul de năut cald și mixează 2 minute. Cu aparatul pornit, toarnă încet apa rece ca gheața, apoi mixează încă 3-4 minute, până devine fin, adăugând puțină apă de la fiert dacă e prea tare.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'spread',
          text: t(
            'Spread the hummus about 3 cm deep in a shallow ovenproof dish, or in four small ones, and smooth the top.',
            'Întinde humusul pe aproximativ 3 cm grosime într-un vas termorezistent scund, sau în patru vase mici, și netezește suprafața.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for about 10 minutes until the edges bubble and the hummus is steaming hot and just starting to colour.',
            'Coace-l aproximativ 10 minute, până bolborosește pe margini, iar humusul scoate aburi și abia începe să capete culoare.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'butter',
          text: t(
            'In the last few minutes of baking, melt the butter in a small pan over medium heat until it foams. Take the pan off the heat and stir in the pul biber for a few seconds so it sizzles and turns the butter red. Take the hummus out with oven gloves and pour the butter straight over it.',
            'În ultimele minute de coacere, topește untul într-o cratiță mică la foc mediu, până face spumă. Ia cratița de pe foc, adaugă pul biber și amestecă câteva secunde, ca să sfârâie și să coloreze untul în roșu. Scoate humusul din cuptor cu mănuși de bucătărie și toarnă untul imediat peste el.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Top with the reserved chickpeas, then the sumac and parsley (if using). Serve at once, in the dish, with warm bread for scooping.',
            'Pune deasupra boabele rezervate, apoi sumacul și pătrunjelul (dacă folosești). Servește imediat, în vas, cu pâine caldă.',
          ),
        },
      ],
      tips: [
        t(
          'Make the hummus a day ahead and keep it in the fridge without the butter (3 to 4 days); bake only what you will eat. From the fridge, bake it 15 to 20 minutes, until the edges bubble and the centre is steaming hot. Chill any baked leftovers within 2 hours and reheat them until steaming hot (74 °C).',
          'Poți face humusul cu o zi înainte și îl poți păstra la frigider fără unt (3-4 zile); coace doar cât mănânci. Din frigider, coace-l 15-20 de minute, până bolborosește pe margini și centrul scoate aburi. Pune în cel mult 2 ore la frigider restul copt și reîncălzește-l până scoate aburi (74 °C).',
        ),
      ],
      stepTips: [
        {
          step: 'butter',
          text: t(
            'Pul biber scorches quickly in very hot butter and turns bitter, so add it off the heat.',
            'Pul biber se arde repede în untul foarte încins și devine amar, așa că adaugă-l de pe foc.',
          ),
        },
      ],
      nutritionNote: t(
        'Chickpeas and tahini give plant protein, fibre and mostly unsaturated fat. The butter poured over the top adds saturated fat, and with bread it is a rich, salty plate, so share it and add a salad or raw vegetables beside it.',
        'Năutul și tahini dau proteine vegetale, fibre și grăsimi în mare parte nesaturate. Untul turnat deasupra adaugă grăsimi saturate, iar cu pâine e o farfurie bogată și sărată, așa că împarte-o și adaugă alături o salată sau legume crude.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Warm pita', 'Lipie caldă'),
          reason: t(
            'Soft bread scoops up the hot hummus and the red butter.',
            'Pâinea moale adună humusul fierbinte și untul roșu.',
          ),
          principle: 'complement_flavour',
          ingredient: 'pita',
        },
        {
          kind: 'food',
          label: t('Pickled peppers', 'Ardei murați'),
          reason: t(
            'Sharp, sour pickles cut through the hot butter.',
            'Murăturile acre taie din bogăția untului fierbinte.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-peppers',
        },
        {
          kind: 'food',
          label: t('Cucumber', 'Castravete'),
          reason: t(
            'Cool and crunchy against the hot, creamy hummus.',
            'Răcoros și crocant, în contrast cu humusul cald și cremos.',
          ),
          principle: 'contrast_texture',
          ingredient: 'cucumber',
        },
        {
          kind: 'drink',
          label: t('Tea', 'Ceai'),
          reason: t(
            'Its light bitterness balances the buttery hummus.',
            'Amăreala ușoară a ceaiului echilibrează humusul cu unt.',
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
            'Served steaming hot with bread, it warms and fills.',
            'Servit fierbinte, cu pâine, încălzește și satură.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Butter and tahini make it rich and slow to digest.',
            'Untul și tahini îl fac bogat și greu de digerat.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Butter, chilli, pulses and garlic make a heavy meal to sleep on.',
            'Untul, ardeiul iute, leguminoasele și usturoiul fac o masă grea înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
