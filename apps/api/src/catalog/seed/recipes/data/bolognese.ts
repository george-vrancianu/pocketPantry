import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Bolognese base is the Bologna-style ragù on tagliatelle: a soffritto,
// pancetta and beef, a little wine, milk and tomato, and a long, slow simmer.
// Each Variant is a full Recipe with its own lines, steps and guidance; the
// base's Recipe-level Tips are inherited unless a Variant hides them. The
// slow-simmer and pasta-water Tips only fit the long ragù, so every Variant
// hides them.
export const bolognese: BaseRecipeSeed = {
  slug: 'bolognese',
  title: t('Tagliatelle with Bolognese ragù', 'Tagliatelle cu ragù bolognese'),
  servings: 6,
  prepMinutes: 25,
  cookMinutes: 205,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'pancetta',
      quantity: 150,
      unit: 'g',
      note: t('finely diced', 'tăiată cubulețe mici'),
    },
    {
      ingredient: 'olive-oil',
      quantity: 30,
      unit: 'ml',
    },
    { ingredient: 'butter', quantity: 30, unit: 'g' },
    {
      ingredient: 'onion',
      quantity: 1,
      unit: 'pcs',
      note: t('very finely chopped', 'tocată foarte mărunt'),
    },
    {
      ingredient: 'carrot',
      quantity: 80,
      unit: 'g',
      note: t('very finely chopped', 'tocat foarte mărunt'),
    },
    {
      ingredient: 'celery',
      quantity: 80,
      unit: 'g',
      note: t('very finely chopped', 'tocată foarte mărunt'),
    },
    { ingredient: 'minced-beef', quantity: 600, unit: 'g' },
    {
      ingredient: 'white-wine',
      quantity: 150,
      unit: 'ml',
      note: t('dry', 'sec'),
    },
    { ingredient: 'milk', quantity: 0.2, unit: 'l' },
    { ingredient: 'tomato-paste', quantity: 30, unit: 'g' },
    { ingredient: 'passata', quantity: 200, unit: 'ml' },
    {
      ingredient: 'beef-stock',
      quantity: 300,
      unit: 'ml',
      note: t('hot, unsalted if you can', 'fierbinte, nesărată dacă se poate'),
    },
    {
      ingredient: 'salt',
      quantity: 8,
      unit: 'g',
      note: t('for the sauce', 'pentru sos'),
    },
    { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
    { ingredient: 'tagliatelle', quantity: 500, unit: 'g' },
    {
      ingredient: 'salt',
      key: 'pasta-water-salt',
      quantity: 45,
      unit: 'g',
      note: t(
        'for 5 litres of pasta water',
        'pentru 5 litri de apă de fiert pastele',
      ),
    },
    {
      ingredient: 'parmesan',
      quantity: 60,
      unit: 'g',
      note: t('finely grated, to serve', 'ras fin, pentru servit'),
    },
  ],
  steps: [
    {
      key: 'chop',
      text: t(
        'Chop the onion, carrot and celery as finely as you can, to about the size of a grain of rice, and dice the pancetta small.',
        'Toacă ceapa, morcovul și țelina cât mai mărunt, cam cât un bob de orez, și taie pancetta cubulețe mici.',
      ),
    },
    {
      key: 'render',
      text: t(
        'Heat the oil and butter in a wide, heavy pot over medium heat. Add the pancetta and cook for about 5 minutes, stirring, until the fat has run out and it is lightly golden.',
        'Încinge uleiul și untul într-o oală lată, cu fundul gros, la foc mediu. Adaugă pancetta și gătește-o aproximativ 5 minute, amestecând, până se topește grăsimea și capătă o culoare aurie ușoară.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'soffritto',
      text: t(
        'Add the chopped onion, carrot and celery. Cook for about 10 minutes over medium-low heat, stirring now and then, until soft and sweet-smelling but not browned.',
        'Adaugă ceapa, morcovul și țelina tocate. Gătește aproximativ 10 minute la foc mic-mediu, amestecând din când în când, până se înmoaie și miros dulce, fără să se rumenească.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'brown-beef',
      text: t(
        'Turn the heat up to medium-high and add the beef. Break it up with a wooden spoon and cook for about 10 minutes, until no pink is left, the juices have boiled away and the meat starts to sizzle and catch lightly on the base.',
        'Mărește focul la mediu-mare și adaugă carnea de vită. Desfă-o cu o lingură de lemn și gătește-o aproximativ 10 minute, până nu mai rămâne roz, sucul a dispărut și carnea începe să sfârâie și să se prindă ușor de fundul oalei.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'wine',
      text: t(
        'Pour in the wine and let it bubble for about 5 minutes, scraping up the browned bits, until it has almost evaporated and the smell of alcohol is gone.',
        'Toarnă vinul și lasă-l să fiarbă aproximativ 5 minute, răzuind bucățile rumenite de pe fund, până aproape se evaporă și dispare mirosul de alcool.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'milk',
      text: t(
        'Add the milk and simmer for about 10 minutes, stirring, until it is absorbed and the meat looks moist rather than wet.',
        'Adaugă laptele și fierbe-l aproximativ 10 minute, amestecând, până este absorbit și carnea pare umedă, nu înecată în lichid.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'tomato',
      text: t(
        'Stir in the tomato paste, then the passata, the hot stock, the 8 g of salt and the pepper. Bring to a bare simmer.',
        'Amestecă pasta de roșii, apoi pasata, supa fierbinte, cele 8 g de sare și piperul. Adu la fierbere ușoară.',
      ),
    },
    {
      key: 'simmer',
      text: t(
        'Turn the heat to its lowest and cook, partly covered, for 2 1/2 hours. Stir now and then; if the ragù starts to catch, add a splash of hot water. It is ready when it is dark, thick and glossy, with fat pooling at the edges.',
        'Dă focul la minim și gătește, acoperit pe jumătate, 2 ore și jumătate. Amestecă din când în când; dacă sosul începe să se prindă, adaugă puțină apă fierbinte. E gata când este închis la culoare, des și lucios, cu grăsime adunată pe margini.',
      ),
      timerSeconds: 9000,
    },
    {
      key: 'boil-water',
      text: t(
        'Near the end of the simmer, bring 5 litres of water to a rolling boil and add the 45 g of salt.',
        'Spre sfârșitul fierberii, adu la fierbere puternică 5 litri de apă și adaugă cele 45 g de sare.',
      ),
    },
    {
      key: 'pasta',
      text: t(
        'Cook the tagliatelle for about 9 minutes, or as the packet says, until just tender with a little bite. Scoop out a mug of the cooking water, then drain.',
        'Fierbe tagliatelle aproximativ 9 minute, sau cât indică ambalajul, până sunt moi, dar încă ferme sub dinte. Ia o cană din apa de fierbere, apoi scurge pastele.',
      ),
      timerSeconds: 540,
    },
    {
      key: 'toss',
      text: t(
        'Tip the pasta into the ragù with a splash of the cooking water and toss over low heat for about 2 minutes, until the sauce clings to every strand. Check the seasoning and serve with the Parmesan.',
        'Pune pastele în ragù cu puțină apă de fierbere și amestecă la foc mic aproximativ 2 minute, până sosul se prinde de fiecare fir. Gustă de sare și servește cu parmezan.',
      ),
      timerSeconds: 120,
    },
  ],
  tips: [
    t(
      'Keep the simmer so low that only a bubble breaks the surface every second or two. A hard boil makes the meat tough and the sauce dull instead of dark and glossy.',
      'Ține fierberea atât de slabă încât la suprafață să iasă doar o bulă la una-două secunde. O fierbere puternică face carnea tare și sosul șters, nu închis și lucios.',
    ),
    t(
      'Cool leftovers within 2 hours and keep them in the fridge in a covered container for up to 3 days. Reheat until steaming hot all the way through.',
      'Răcește resturile în maximum 2 ore și păstrează-le în frigider, într-un recipient acoperit, până la 3 zile. Reîncălzește-le până sunt fierbinți în tot volumul.',
    ),
    t(
      'Toss the pasta in the sauce with a little of its cooking water rather than spooning sauce on top: the starch helps the ragù cling to the ribbons.',
      'Amestecă pastele în sos cu puțină apă de fierbere, în loc să pui sosul deasupra: amidonul ajută ragù-ul să se lipească de panglici.',
    ),
  ],
  stepTips: [
    {
      step: 'chop',
      text: t(
        'The finer the soffritto, the more it melts into the sauce and the less it reads as separate vegetables. A food processor with short pulses does it fast.',
        'Cu cât soffritto e mai mărunt, cu atât se topește mai bine în sos și nu se simt bucăți de legume. Un robot de bucătărie, cu pulsuri scurte, îl face repede.',
      ),
    },
    {
      step: 'brown-beef',
      text: t(
        'Do not stir constantly. Let the meat sit against the hot pot for a minute at a time so it browns instead of stewing grey.',
        'Nu amesteca încontinuu. Lasă carnea câte un minut lipită de oala fierbinte, ca să se rumenească și să nu se fiarbă cenușie.',
      ),
    },
    {
      step: 'pasta',
      text: t(
        'Fresh egg tagliatelle, if you can find it, cooks in a fraction of the time; take it out while it still has some bite and finish it in the sauce.',
        'Tagliatelle proaspete cu ou, dacă le găsești, se fierb mult mai repede; scoate-le când mai au fermitate și termină-le în sos.',
      ),
    },
  ],
  nutritionNote: t(
    'A filling plate of protein and carbohydrate, with some vegetables cooked into the sauce. Pancetta, butter, beef and Parmesan add saturated fat and salt, and white pasta gives little fibre. A smaller ladle of ragù, a bit less cheese and a green salad on the side make it lighter.',
    'O farfurie săturătoare, cu proteine și carbohidrați și ceva legume gătite în sos. Pancetta, untul, carnea de vită și parmezanul aduc grăsimi saturate și sare, iar pastele albe dau puține fibre. Mai puțin ragù, puțin mai puțin parmezan și o salată verde alături o fac mai ușoară.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Italian antipasti platter', 'Platou italian de antipasti'),
      reason: t(
        'In an Italian meal the antipasti come first and a plate of tagliatelle al ragù follows as the primo, the first course.',
        'Într-o masă italiană antipasti deschid masa, iar apoi urmează tagliatelle al ragù, ca fel întâi (primo).',
      ),
      principle: 'regional_tradition',
      recipe: 'appetizer-platter-italian',
    },
    {
      kind: 'food',
      label: t('Dressed rocket', 'Rucola cu dressing'),
      reason: t(
        'Peppery, slightly bitter leaves with a sharp dressing cut through the rich, meaty sauce.',
        'Frunzele piperate, ușor amărui, cu un dressing acrișor taie din bogăția sosului de carne.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'rocket',
    },
    {
      kind: 'drink',
      label: t('Dry red wine', 'Vin roșu sec'),
      reason: t(
        'Its acidity matches the tomato and cuts through the fat of the pancetta and beef.',
        'Aciditatea lui se potrivește cu roșiile și taie din grăsimea pancettei și a cărnii.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'red-wine',
    },
    {
      kind: 'drink',
      label: t('Sparkling water', 'Apă minerală'),
      reason: t(
        'The bubbles refresh the mouth between rich forkfuls.',
        'Bulele împrospătează gura între îmbucături bogate.',
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
        'A hearty, warming plate for a cold day.',
        'O farfurie consistentă și caldă pentru o zi rece.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Pasta and beef give carbohydrate and protein to refuel.',
        'Pastele și carnea de vită aduc carbohidrați și proteine pentru refacere.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A large, rich plate of pasta sits heavy just before bed.',
        'O farfurie mare și bogată de paste cade greu chiar înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'bolognese-greek',
      cuisine: 'greek',
      title: t(
        'Greek spaghetti with meat sauce (makaronia me kima)',
        'Spaghete grecești cu sos de carne (makaronia me kima)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 75,
      difficulty: 'easy',
      hideBaseTips: [0, 2],
      lines: [
        { ingredient: 'olive-oil', quantity: 45, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely chopped', 'tocată mărunt'),
        },
        {
          ingredient: 'garlic',
          quantity: 8,
          unit: 'g',
          note: t('2 cloves, minced', '2 căței, tocați'),
        },
        { ingredient: 'minced-beef', quantity: 400, unit: 'g' },
        { ingredient: 'red-wine', quantity: 100, unit: 'ml' },
        { ingredient: 'canned-tomatoes', quantity: 400, unit: 'g' },
        { ingredient: 'tomato-paste', quantity: 30, unit: 'g' },
        { ingredient: 'still-water', quantity: 0.25, unit: 'l' },
        {
          ingredient: 'cinnamon-sticks',
          quantity: 3,
          unit: 'g',
          note: t('1 stick', '1 baton'),
        },
        {
          ingredient: 'allspice',
          quantity: 1.5,
          unit: 'g',
          note: t('ground', 'măcinat'),
        },
        {
          ingredient: 'cloves',
          quantity: 0.3,
          unit: 'g',
          note: t('ground, a pinch', 'măcinate, un vârf de cuțit'),
        },
        { ingredient: 'bay-leaves', quantity: 0.4, unit: 'g' },
        { ingredient: 'sugar', quantity: 5, unit: 'g' },
        {
          ingredient: 'salt',
          quantity: 7,
          unit: 'g',
          note: t('for the sauce', 'pentru sos'),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        { ingredient: 'spaghetti', quantity: 360, unit: 'g' },
        {
          ingredient: 'salt',
          key: 'pasta-water-salt',
          quantity: 36,
          unit: 'g',
          note: t(
            'for 4 litres of pasta water',
            'pentru 4 litri de apă de fiert pastele',
          ),
        },
        {
          ingredient: 'kefalotyri',
          quantity: 60,
          unit: 'g',
          note: t('grated, to serve', 'ras, pentru servit'),
        },
      ],
      steps: [
        {
          key: 'onion',
          text: t(
            'Heat the oil in a wide pan over medium heat. Add the onion and cook for about 8 minutes, stirring, until soft and translucent.',
            'Încinge uleiul într-o tigaie lată la foc mediu. Adaugă ceapa și gătește-o aproximativ 8 minute, amestecând, până se înmoaie și devine translucidă.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'garlic',
          text: t(
            'Add the garlic and stir for 1 minute, until fragrant.',
            'Adaugă usturoiul și amestecă 1 minut, până miroase puternic.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'brown-beef',
          text: t(
            'Turn the heat up, add the beef and break it up with a spoon. Cook for about 8 minutes, until no pink is left and it is lightly browned.',
            'Mărește focul, adaugă carnea și desfă-o cu lingura. Gătește aproximativ 8 minute, până nu mai rămâne roz și se rumenește ușor.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'wine',
          text: t(
            'Pour in the wine and let it bubble for about 3 minutes, until it has almost evaporated.',
            'Toarnă vinul și lasă-l să fiarbă aproximativ 3 minute, până aproape se evaporă.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'sauce',
          text: t(
            'Add the tomatoes, tomato paste, water, cinnamon stick, allspice, ground cloves, bay leaves, sugar, the 7 g of salt and the pepper. Stir and bring to a simmer.',
            'Adaugă roșiile, pasta de roșii, apa, batonul de scorțișoară, ienibaharul, cuișoarele măcinate, foile de dafin, zahărul, cele 7 g de sare și piperul. Amestecă și adu la fierbere.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Cook over low heat, partly covered, for 40 minutes, stirring now and then, until thick and the oil shines on top. Add a splash of water if it gets dry.',
            'Gătește la foc mic, acoperit pe jumătate, 40 de minute, amestecând din când în când, până sosul se îngroașă și uleiul strălucește deasupra. Adaugă puțină apă dacă se usucă.',
          ),
          timerSeconds: 2400,
        },
        {
          key: 'pasta',
          text: t(
            'During the last 15 minutes of the simmer, bring 4 litres of water to a rolling boil, add the 36 g of salt and cook the spaghetti for about 10 minutes, or as the packet says, until just tender. Drain.',
            'În ultimele 15 minute de fierbere a sosului, adu la fierbere puternică 4 litri de apă, adaugă cele 36 g de sare și fierbe spaghetele aproximativ 10 minute, sau cât indică ambalajul, până sunt moi, dar ferme sub dinte. Scurge-le.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'fish-out',
          text: t(
            'Fish out the cinnamon stick and bay leaves. Taste and adjust the salt.',
            'Scoate batonul de scorțișoară și foile de dafin. Gustă și corectează sarea.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Divide the spaghetti between plates, spoon the sauce over and top generously with the kefalotyri.',
            'Împarte spaghetele în farfurii, toarnă sosul deasupra și presară din belșug kefalotyri.',
          ),
        },
      ],
      tips: [
        t(
          'Cinnamon, allspice and clove should be a warm background, not the first thing you taste. If the cooked sauce smells like a dessert, you have used too much.',
          'Scorțișoara, ienibaharul și cuișoarele trebuie să fie o notă caldă de fundal, nu primul lucru pe care îl simți. Dacă sosul gătit miroase a desert, ai pus prea mult.',
        ),
      ],
      nutritionNote: t(
        'A satisfying plate of protein and carbohydrate with a tomato sauce that is lighter on fat than a cream or cheese sauce. Olive oil is mostly unsaturated fat, but the beef and the salty cheese add saturated fat and salt, and white spaghetti gives little fibre. Serve with a vegetable salad.',
        'O farfurie săturătoare, cu proteine și carbohidrați și un sos de roșii mai puțin gras decât unul cu smântână sau brânză. Uleiul de măsline este în mare parte grăsime nesaturată, dar carnea de vită și brânza sărată aduc grăsimi saturate și sare, iar spaghetele albe dau puține fibre. Servește cu o salată de legume.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Sliced cucumber and tomato', 'Castraveți și roșii feliate'),
          reason: t(
            'Cool, crisp and fresh against the warm, spiced sauce.',
            'Reci, crocante și proaspete, în contrast cu sosul cald și condimentat.',
          ),
          principle: 'contrast_texture',
          ingredient: 'cucumber',
        },
        {
          kind: 'drink',
          label: t('Cold lager', 'Bere blondă rece'),
          reason: t(
            'Cold carbonation refreshes the mouth after the cinnamon and clove.',
            'Bulele berii reci împrospătează gura după scorțișoară și cuișoare.',
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
            'Warm spices and a hot, saucy plate suit a cold day.',
            'Condimentele calde și o farfurie fierbinte, cu sos, se potrivesc unei zile reci.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Beef and pasta give protein and carbohydrate to refuel.',
            'Carnea de vită și pastele aduc proteine și carbohidrați pentru refacere.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A big plate of pasta and meat is heavy before bed.',
            'O farfurie mare de paste cu carne e grea înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'bolognese-scandinavian',
      cuisine: 'scandinavian',
      title: t(
        'Danish meat sauce with spaghetti (kødsovs)',
        'Sos danez de carne cu spaghete (kødsovs)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 40,
      difficulty: 'easy',
      hideBaseTips: [0, 2],
      lines: [
        { ingredient: 'olive-oil', quantity: 15, unit: 'ml' },
        { ingredient: 'minced-beef', quantity: 500, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely chopped', 'tocată mărunt'),
        },
        {
          ingredient: 'carrot',
          quantity: 150,
          unit: 'g',
          note: t('coarsely grated', 'dat pe răzătoarea mare'),
        },
        {
          ingredient: 'garlic',
          quantity: 8,
          unit: 'g',
          note: t('2 cloves, minced', '2 căței, tocați'),
        },
        { ingredient: 'tomato-paste', quantity: 30, unit: 'g' },
        { ingredient: 'canned-tomatoes', quantity: 400, unit: 'g' },
        { ingredient: 'still-water', quantity: 0.2, unit: 'l' },
        {
          ingredient: 'stock-cubes',
          quantity: 5,
          unit: 'g',
          note: t(
            'half a beef cube, crumbled',
            'jumătate de cub de vită, mărunțit',
          ),
        },
        { ingredient: 'oregano', quantity: 2, unit: 'g' },
        {
          ingredient: 'salt',
          quantity: 2,
          unit: 'g',
          note: t('for the sauce, to taste', 'pentru sos, după gust'),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        { ingredient: 'spaghetti', quantity: 360, unit: 'g' },
        {
          ingredient: 'salt',
          key: 'pasta-water-salt',
          quantity: 36,
          unit: 'g',
          note: t(
            'for 4 litres of pasta water',
            'pentru 4 litri de apă de fiert pastele',
          ),
        },
      ],
      steps: [
        {
          key: 'brown-beef',
          text: t(
            'Heat the oil in a large, deep pan over medium-high heat. Add the beef and cook for about 8 minutes, breaking it up, until no pink is left and it is browned in places.',
            'Încinge uleiul într-o tigaie mare și adâncă la foc mediu-mare. Adaugă carnea și gătește-o aproximativ 8 minute, desfăcând-o, până nu mai rămâne roz și se rumenește pe alocuri.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'vegetables',
          text: t(
            'Add the onion and carrot. Cook for about 5 minutes, stirring, until the onion is soft.',
            'Adaugă ceapa și morcovul. Gătește aproximativ 5 minute, amestecând, până ceapa se înmoaie.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'garlic-paste',
          text: t(
            'Stir in the garlic and tomato paste and cook for 1 minute, until the paste darkens slightly.',
            'Adaugă usturoiul și pasta de roșii și gătește 1 minut, până pasta se închide puțin la culoare.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'simmer',
          text: t(
            'Add the tomatoes, water, crumbled stock cube, oregano and pepper. Simmer over medium-low heat, uncovered, for 25 minutes, stirring now and then, until thick. Taste, and add the salt only if it needs it.',
            'Adaugă roșiile, apa, cubul de supă mărunțit, oregano și piperul. Fierbe la foc mic-mediu, fără capac, 25 de minute, amestecând din când în când, până sosul se îngroașă. Gustă și adaugă sare doar dacă e nevoie.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'pasta',
          text: t(
            'Towards the end of the simmer, bring 4 litres of water to a rolling boil, add the 36 g of salt and cook the spaghetti for about 10 minutes, or as the packet says, until just tender. Drain.',
            'Spre sfârșitul fierberii, adu la fierbere puternică 4 litri de apă, adaugă cele 36 g de sare și fierbe spaghetele aproximativ 10 minute, sau cât indică ambalajul, până sunt moi, dar ferme sub dinte. Scurge-le.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'serve',
          text: t(
            'Serve the spaghetti with the meat sauce spooned over.',
            'Servește spaghetele cu sosul de carne turnat deasupra.',
          ),
        },
      ],
      tips: [
        t(
          'Grate the carrot rather than dicing it. It melts into the sauce in the short cooking time and its sweetness softens the acidity of the canned tomatoes.',
          'Dă morcovul pe răzătoare, nu îl tăia cubulețe. Se topește în sos în timpul scurt de gătit, iar dulceața lui atenuează aciditatea roșiilor din conservă.',
        ),
      ],
      stepTips: [
        {
          step: 'brown-beef',
          text: t(
            'Brown the mince properly before adding anything wet: boiled grey mince tastes flat, and a quick sauce has no hours to make up for it.',
            'Rumenește bine carnea tocată înainte să adaugi lichide: carnea fiartă, cenușie, are gust searbăd, iar un sos rapid nu are ore în care să se repare.',
          ),
        },
      ],
      nutritionNote: t(
        'A quick, filling weeknight plate of protein and carbohydrate, with carrot and tomato giving some vegetables. Beef and a stock cube add saturated fat and salt, and white spaghetti gives little fibre. More grated carrot, a salad on the side and a lean mince make it lighter.',
        'O farfurie rapidă și săturătoare, cu proteine și carbohidrați, în care morcovul și roșiile aduc ceva legume. Carnea de vită și cubul de supă aduc grăsimi saturate și sare, iar spaghetele albe dau puține fibre. Mai mult morcov ras, o salată alături și carne mai slabă o fac mai ușoară.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Grated Parmesan', 'Parmezan ras'),
          reason: t(
            'A salty, savoury sprinkle that deepens the flavour of a quick sauce.',
            'O presărare sărată și aromată care adâncește gustul unui sos rapid.',
          ),
          principle: 'complement_flavour',
          ingredient: 'parmesan',
        },
        {
          kind: 'food',
          label: t('Mixed salad leaves', 'Mix de salată'),
          reason: t(
            'Crisp leaves with a sharp dressing refresh against the rich sauce.',
            'Frunzele crocante, cu un dressing acrișor, împrospătează după sosul bogat.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'mixed-salad',
        },
        {
          kind: 'drink',
          label: t('Beer', 'Bere'),
          reason: t(
            'Cold carbonation cleans the mouth between forkfuls.',
            'Bulele berii reci curăță gura între îmbucături.',
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
            'A hot, hearty plate for a cold day.',
            'O farfurie fierbinte și consistentă pentru o zi rece.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Beef and pasta give protein and carbohydrate to refuel.',
            'Carnea de vită și pastele aduc proteine și carbohidrați pentru refacere.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A big plate of pasta and meat is heavy before bed.',
            'O farfurie mare de paste cu carne e grea înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'bolognese-one-pot',
      method: 'one-pot',
      title: t(
        'One-pot spaghetti with meat sauce',
        'Spaghete cu sos de carne într-o singură oală',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 35,
      difficulty: 'easy',
      hideBaseTips: [0, 2],
      lines: [
        {
          ingredient: 'pancetta',
          quantity: 60,
          unit: 'g',
          note: t('finely diced', 'tăiată cubulețe mici'),
        },
        { ingredient: 'olive-oil', quantity: 10, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely chopped', 'tocată mărunt'),
        },
        {
          ingredient: 'carrot',
          quantity: 60,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        {
          ingredient: 'celery',
          quantity: 60,
          unit: 'g',
          note: t('finely chopped', 'tocată mărunt'),
        },
        { ingredient: 'minced-beef', quantity: 400, unit: 'g' },
        {
          ingredient: 'garlic',
          quantity: 8,
          unit: 'g',
          note: t('2 cloves, minced', '2 căței, tocați'),
        },
        { ingredient: 'tomato-paste', quantity: 30, unit: 'g' },
        { ingredient: 'passata', quantity: 300, unit: 'ml' },
        {
          ingredient: 'beef-stock',
          quantity: 750,
          unit: 'ml',
          note: t(
            'hot, unsalted if you can',
            'fierbinte, nesărată dacă se poate',
          ),
        },
        { ingredient: 'salt', quantity: 4, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        {
          ingredient: 'spaghetti',
          quantity: 320,
          unit: 'g',
          note: t('snapped in half', 'rupte în două'),
        },
        {
          ingredient: 'parmesan',
          quantity: 50,
          unit: 'g',
          note: t('finely grated', 'ras fin'),
        },
      ],
      steps: [
        {
          key: 'pancetta',
          text: t(
            'Heat the oil in a wide, deep sauté pan or pot, about 28 cm across, over medium heat. Add the pancetta and cook for about 4 minutes, until the fat runs and it is lightly golden.',
            'Încinge uleiul într-o tigaie adâncă sau o oală lată, de cam 28 cm diametru, la foc mediu. Adaugă pancetta și gătește-o aproximativ 4 minute, până se topește grăsimea și capătă o culoare aurie ușoară.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'soffritto',
          text: t(
            'Add the onion, carrot and celery and cook for about 6 minutes, stirring, until soft.',
            'Adaugă ceapa, morcovul și țelina și gătește aproximativ 6 minute, amestecând, până se înmoaie.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'brown-beef',
          text: t(
            'Turn up the heat, add the beef and cook for about 6 minutes, breaking it up, until no pink is left and it is browned in places.',
            'Mărește focul, adaugă carnea și gătește-o aproximativ 6 minute, desfăcând-o, până nu mai rămâne roz și se rumenește pe alocuri.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'garlic-paste',
          text: t(
            'Stir in the garlic and tomato paste and cook for 1 minute, until the paste darkens slightly.',
            'Adaugă usturoiul și pasta de roșii și gătește 1 minut, până pasta se închide puțin la culoare.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'liquid',
          text: t(
            'Pour in the passata and the hot stock, add the salt and pepper, and bring to a boil.',
            'Toarnă pasata și supa fierbinte, adaugă sarea și piperul și adu la fierbere.',
          ),
        },
        {
          key: 'spaghetti',
          text: t(
            'Add the spaghetti, pushing it under the liquid as it softens. Simmer for about 11 minutes, stirring often so it does not stick to the base, until the pasta is tender and the sauce has thickened and clings. If it gets dry before the pasta is cooked, add a splash of hot water.',
            'Adaugă spaghetele, apăsându-le sub lichid pe măsură ce se înmoaie. Fierbe aproximativ 11 minute, amestecând des ca să nu se lipească de fund, până pastele sunt moi, iar sosul s-a îngroșat și se prinde de ele. Dacă se usucă înainte ca pastele să fie fierte, adaugă puțină apă fierbinte.',
          ),
          timerSeconds: 660,
        },
        {
          key: 'rest',
          text: t(
            'Take the pan off the heat, stir in the Parmesan and leave it to rest for 2 minutes so the sauce settles and thickens a little more.',
            'Ia tigaia de pe foc, amestecă parmezanul și lasă-o să stea 2 minute, ca sosul să se așeze și să se îngroașe puțin.',
          ),
          timerSeconds: 120,
        },
      ],
      tips: [
        t(
          'The pasta starch thickens the sauce, so the pan should look quite wet when the spaghetti goes in. Judge by the plate, not the pot: the pasta on the plate should be saucy, not dry.',
          'Amidonul din paste îngroașă sosul, așa că tigaia trebuie să pară destul de umedă când intră spaghetele. Judecă după farfurie, nu după oală: pastele trebuie să fie cu sos, nu uscate.',
        ),
      ],
      stepTips: [
        {
          step: 'spaghetti',
          text: t(
            'Use a pan wide enough for the spaghetti to lie nearly flat, and stir with tongs, turning the strands from the bottom to the top.',
            'Folosește o tigaie suficient de lată ca spaghetele să stea aproape întinse și amestecă cu cleștele, mutând firele de jos în sus.',
          ),
        },
      ],
      nutritionNote: t(
        'A filling plate of protein and carbohydrate with some vegetables cooked in, made in one pot with little washing up. Pancetta, beef and Parmesan add saturated fat and salt, and white spaghetti gives little fibre. A green salad on the side adds freshness and fibre.',
        'O farfurie săturătoare, cu proteine și carbohidrați și ceva legume gătite în ea, făcută într-o singură oală, cu puțin de spălat. Pancetta, carnea de vită și parmezanul aduc grăsimi saturate și sare, iar spaghetele albe dau puține fibre. O salată verde alături aduce prospețime și fibre.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Peppery rocket salad', 'Salată de rucola'),
          reason: t(
            'Bitter, peppery leaves cut through the rich, cheesy pasta.',
            'Frunzele amărui și piperate taie din bogăția pastelor cu brânză.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'rocket',
        },
        {
          kind: 'food',
          label: t('Ciabatta', 'Ciabatta'),
          reason: t(
            'The crisp crust and airy crumb mop up the last of the sauce.',
            'Crusta crocantă și miezul aerat strâng ultimele picături de sos.',
          ),
          principle: 'contrast_texture',
          ingredient: 'ciabatta',
        },
        {
          kind: 'drink',
          label: t('Dry red wine', 'Vin roșu sec'),
          reason: t(
            'Its acidity matches the tomato and cuts through the fat of the pancetta and beef.',
            'Aciditatea lui se potrivește cu roșiile și taie din grăsimea pancettei și a cărnii.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'red-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, hearty one-pot dinner for a cold day.',
            'O cină fierbinte și consistentă, dintr-o singură oală, pentru o zi rece.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Beef and pasta give protein and carbohydrate to refuel.',
            'Carnea de vită și pastele aduc proteine și carbohidrați pentru refacere.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A big plate of pasta and meat is heavy before bed.',
            'O farfurie mare de paste cu carne e grea înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
