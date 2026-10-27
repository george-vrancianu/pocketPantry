import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Plachie de pește base is the Romanian plachie de crap: carp steaks baked
// on a deep bed of onion and tomato in a hot oven. The Variants keep the idea
// of fish baked or finished in its own sauce but change the method and the
// flavours: a Moroccan tagine with chermoula over potatoes (oven), and a Basque
// merluza en salsa verde with clams (hob only). Each is a full Recipe.
export const plachieDePeste: BaseRecipeSeed = {
  slug: 'plachie-de-peste',
  title: t(
    'Plachie de pește (Romanian carp baked on onion and tomato)',
    'Plachie de crap',
  ),
  servings: 4,
  prepMinutes: 20,
  cookMinutes: 55,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'carp',
      quantity: 1200,
      unit: 'g',
      note: t(
        'one fish, scaled and gutted, cut across into 3 cm steaks',
        'un crap curățat de solzi și de măruntaie, tăiat în felii de 3 cm',
      ),
    },
    {
      ingredient: 'salt',
      key: 'salt-fish',
      quantity: 7,
      unit: 'g',
      note: t('for the fish', 'pentru pește'),
    },
    {
      ingredient: 'black-pepper',
      quantity: 1,
      unit: 'g',
      note: t('for the fish', 'pentru pește'),
    },
    {
      ingredient: 'sunflower-oil',
      quantity: 60,
      unit: 'ml',
    },
    {
      ingredient: 'onion',
      quantity: 4,
      unit: 'pcs',
      note: t(
        'about 600 g, cut into thin half-rings',
        'în total aproximativ 600 g, tăiate semirondele subțiri',
      ),
    },
    {
      ingredient: 'garlic',
      quantity: 15,
      unit: 'g',
      note: t('sliced', 'tăiat felioare'),
    },
    { ingredient: 'tomato-paste', quantity: 30, unit: 'g' },
    {
      ingredient: 'tomato',
      key: 'tomato-diced',
      quantity: 500,
      unit: 'g',
      note: t('diced, for the bed', 'tăiate cubulețe, pentru sosul de bază'),
    },
    {
      ingredient: 'tomato',
      key: 'tomato-sliced',
      quantity: 100,
      unit: 'g',
      note: t('sliced, for the top', 'tăiate rondele, pentru deasupra'),
    },
    {
      ingredient: 'white-wine',
      quantity: 150,
      unit: 'ml',
      note: t('dry', 'sec'),
    },
    { ingredient: 'bay-leaves', quantity: 0.4, unit: 'g' },
    { ingredient: 'peppercorns', quantity: 2, unit: 'g' },
    { ingredient: 'paprika', quantity: 3, unit: 'g' },
    {
      ingredient: 'savory',
      quantity: 1,
      unit: 'g',
      note: t('dried', 'uscat'),
    },
    {
      ingredient: 'salt',
      key: 'salt-bed',
      quantity: 3,
      unit: 'g',
      note: t('for the bed', 'pentru sosul de bază'),
    },
    {
      ingredient: 'lemon',
      quantity: 1,
      unit: 'pcs',
      note: t('in thin slices', 'tăiată rondele subțiri'),
    },
    {
      ingredient: 'parsley',
      quantity: 20,
      unit: 'g',
      note: t('leaves, chopped', 'frunze, tocate'),
    },
  ],
  steps: [
    {
      key: 'cut',
      text: t(
        'Rinse the carp and cut it across into 3 cm steaks (or take the steaks from the fishmonger). Use a board and knife kept for raw fish, and keep the fish in the fridge until you need it.',
        'Spală crapul și taie-l în felii de 3 cm (sau ia-le gata tăiate de la pescar). Folosește o planșetă și un cuțit pe care le ții doar pentru pește crud, iar peștele păstrează-l la frigider până îți trebuie.',
      ),
    },
    {
      key: 'salt',
      text: t(
        'Season the steaks on both sides with the 7 g of salt and the pepper, put them in a covered dish and return them to the fridge while you make the bed. Then wash your hands, the board and the knife with hot soapy water before you touch anything else.',
        'Sărează feliile pe ambele părți cu cele 7 g de sare și piperul, pune-le într-un vas acoperit și du-le înapoi la frigider cât pregătești sosul de bază. Apoi spală-ți mâinile, planșeta și cuțitul cu apă fierbinte și săpun înainte să atingi altceva.',
      ),
    },
    {
      key: 'oven',
      text: t(
        'Switch the oven on to 200 °C, top and bottom heat. It takes about 15 minutes to get hot, so carry on with the next steps while it heats.',
        'Pornește cuptorul la 200 °C, cu foc sus și jos. Durează cam 15 minute până se încinge, așa că treci la pașii următori cât se încălzește.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'onions',
      text: t(
        'Heat the oil in a wide 28 cm pan over medium heat and soften the onion with a pinch of the 3 g of salt for about 12 minutes, stirring often, until soft and pale golden. Do not let it brown.',
        'Încinge uleiul într-o tigaie lată de 28 cm la foc mediu și înmoaie ceapa cu un praf din cele 3 g de sare cam 12 minute, amestecând des, până devine moale și ușor aurie. Nu o lăsa să se rumenească.',
      ),
      timerSeconds: 720,
    },
    {
      key: 'garlic-paste',
      text: t(
        'Add the garlic and the tomato paste and stir for 1 minute, until the paste smells sweet and darkens a little.',
        'Adaugă usturoiul și pasta de roșii și amestecă 1 minut, până pasta capătă miros dulceag și se închide puțin la culoare.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'sauce',
      text: t(
        'Pour in the wine and add the diced tomatoes, bay, peppercorns, paprika, savory and the rest of the 3 g of salt. Simmer for 8 minutes, stirring now and then, until the tomatoes have collapsed and the sauce is loose but no longer watery. It will thicken further in the oven.',
        'Toarnă vinul și adaugă roșiile cubulețe, dafinul, piperul boabe, boiaua, cimbrul și restul de sare din cele 3 g. Fierbe 8 minute, amestecând din când în când, până roșiile se destramă, iar sosul e curgător, dar nu apos. Se mai îngroașă în cuptor.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'assemble',
      text: t(
        'Spread the bed in a 30 x 20 cm ovenproof dish. Lay the carp steaks on it, tuck the lemon slices between them and put the sliced tomato on top. Then wash your hands with hot soapy water.',
        'Întinde sosul într-o tavă termorezistentă de 30 x 20 cm. Așază feliile de crap deasupra, strecoară rondelele de lămâie printre ele și pune roșiile tăiate rondele pe deasupra. Apoi spală-ți mâinile cu apă fierbinte și săpun.',
      ),
    },
    {
      key: 'bake',
      text: t(
        'Bake in the middle of the hot oven for 15 minutes.',
        'Coace în mijlocul cuptorului încins 15 minute.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'baste',
      text: t(
        'Spoon some of the sauce over the tops of the steaks and bake for 10 more minutes, until the sauce has thickened and the edges are bubbling.',
        'Toarnă cu lingura din sos peste felii și mai coace 10 minute, până sosul se îngroașă și bolborosește pe margini.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'check',
      text: t(
        'Check the thickest steak next to the bone: it should read 63 °C, the flesh should be opaque all the way through and flake easily with a fork. If not, bake 3 to 5 minutes more and check again.',
        'Verifică felia cea mai groasă, lângă os: termometrul trebuie să arate 63 °C, iar carnea să fie opacă peste tot și să se desfacă ușor cu furculița. Dacă nu, mai coace 3-5 minute și verifică din nou.',
      ),
    },
    {
      key: 'serve',
      text: t(
        'Remove the bay leaves. Chop the parsley on a clean board and scatter it over the dish, then serve with a clean spoon, not the one you basted with.',
        'Scoate foile de dafin. Toacă pătrunjelul pe o planșetă curată și presară-l peste tavă, apoi servește cu o lingură curată, nu cu cea cu care ai stropit peștele.',
      ),
    },
  ],
  tips: [
    t(
      'Keep raw fish at 5 °C or colder until you cook it, use a board and knife only for the raw fish, and wash hands, board and knife with hot soapy water afterwards. Cooked fish never goes back onto a plate or board that held it raw.',
      'Ține peștele crud la 5 °C sau mai rece până îl gătești, folosește o planșetă și un cuțit doar pentru pește crud și spală-ți mâinile, planșeta și cuțitul cu apă fierbinte și săpun după aceea. Peștele gătit nu se pune niciodată înapoi pe o farfurie sau o planșetă pe care a stat crud.',
    ),
    t(
      'A cheap probe thermometer takes the guesswork out of fish: it stops you from drying it out for fear that it is undercooked.',
      'Un termometru cu sondă ieftin scoate ghicitul din gătitul peștelui: nu-l mai usuci de teamă că nu e gătit.',
    ),
    t(
      'Let the leftovers cool and get them into the fridge within 2 hours. Eat them within 1 to 2 days, and reheat until steaming hot all the way through.',
      'Lasă ce rămâne să se răcească și pune-l la frigider în cel mult 2 ore. Mănâncă-l în 1-2 zile și reîncălzește-l până e fierbinte bine peste tot.',
    ),
    t(
      'Carp has many fine Y-shaped bones in the flesh. For young children and older people, lift the flesh off the main bone and pick through it with a fork before it goes on their plate, and ask everyone to chew slowly.',
      'Crapul are multe oase mici în formă de Y în carne. Pentru copii mici și pentru persoanele în vârstă, desprinde carnea de pe osul mare și scoate cu furculița oasele mici înainte s-o pui în farfurie, iar pe toți roagă-i să mestece cu grijă.',
    ),
  ],
  stepTips: [
    {
      step: 'onions',
      text: t(
        'Do not hurry the onions: the sauce gets its sweetness from them. If they start to catch, add a splash of water and lower the heat.',
        'Nu te grăbi cu ceapa: de la ea ia sosul dulceața. Dacă începe să se prindă, adaugă un strop de apă și scade focul.',
      ),
    },
    {
      step: 'bake',
      text: t(
        'The sauce should come only about halfway up the steaks, so their tops stay firm while the bottoms cook in the sauce.',
        'Sosul trebuie să ajungă doar până pe la jumătatea feliilor, ca partea de sus să rămână fermă, iar cea de jos să se gătească în sos.',
      ),
    },
  ],
  nutritionNote: t(
    'Baked on a bed of onion and tomato with a moderate amount of sunflower oil (mostly unsaturated fat), it is lighter than fried fish and gives protein with vegetables. The salt is moderate to high, all from the seasoning, so cut it back if you need to. It has little starch, so serve it with mămăligă or bread, and the many fine bones need care.',
    'Fiind coaptă pe un pat de ceapă și roșii, cu o cantitate moderată de ulei de floarea-soarelui (în mare parte grăsimi nesaturate), e mai ușoară decât peștele prăjit și dă proteine împreună cu legume. Sarea e între moderată și multă, vine toată din condimentare, așa că pune mai puțină dacă trebuie. Are puțin amidon, așa că se servește cu mămăligă sau pâine, iar oasele mărunte cer atenție.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Plain mămăligă', 'Mămăligă simplă'),
      reason: t(
        'Its mild, creamy corn softness soaks up the tomato and onion sauce and balances the fish.',
        'Moliciunea ei de porumb, fină și blândă, absoarbe sosul de roșii și ceapă și echilibrează peștele.',
      ),
      principle: 'complement_flavour',
      ingredient: 'cornmeal',
    },
    {
      kind: 'food',
      label: t('Pickled peppers', 'Ardei murați'),
      reason: t(
        'Their sharp acidity cuts through the sweet, oily sauce.',
        'Aciditatea lor ascuțită taie din sosul dulce și uleios.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-peppers',
    },
    {
      kind: 'drink',
      label: t('Sparkling water with lemon', 'Apă minerală cu lămâie'),
      reason: t(
        'The bubbles and the sharp lemon refresh the palate between bites of the rich sauce.',
        'Bulele și lămâia acrișoară împrospătează gustul între îmbucăturile de sos bogat.',
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
        'A hot dish with a rich tomato sauce is welcome in cold weather.',
        'Un fel de mâncare fierbinte, cu sos de roșii bogat, face bine pe vreme rece.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Fish gives protein for recovery; add mămăligă or bread for carbohydrates.',
        'Peștele dă proteine pentru refacere; adaugă mămăligă sau pâine pentru carbohidrați.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A big dish of onion, tomato and wine sauce can sit heavy and unsettle sleep.',
        'O porție mare cu ceapă, roșii și sos cu vin poate cădea greu și îți poate strica somnul.',
      ),
    },
  ],
  variants: [
    {
      slug: 'plachie-de-peste-moroccan',
      cuisine: 'moroccan',
      title: t(
        'Fish tagine with chermoula (Moroccan baked fish with potatoes, olives and preserved lemon)',
        'Tajine de pește cu chermoula (pește marocan la cuptor cu cartofi, măsline și lămâie conservată)',
      ),
      servings: 4,
      prepMinutes: 25,
      cookMinutes: 55,
      difficulty: 'medium',
      hideBaseTips: [3],
      lines: [
        {
          ingredient: 'sea-bream',
          quantity: 640,
          unit: 'g',
          note: t(
            '4 fillets of about 160 g, skin on, scaled and pin-boned',
            '4 fileuri de aproximativ 160 g, cu piele, fără solzi și fără oase mici',
          ),
        },
        {
          ingredient: 'coriander',
          quantity: 30,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        {
          ingredient: 'parsley',
          quantity: 30,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        {
          ingredient: 'garlic',
          quantity: 15,
          unit: 'g',
          note: t('crushed', 'zdrobit'),
        },
        { ingredient: 'cumin', quantity: 4, unit: 'g' },
        { ingredient: 'paprika', quantity: 5, unit: 'g' },
        {
          ingredient: 'chili-powder',
          quantity: 1,
          unit: 'g',
          optional: true,
        },
        { ingredient: 'lemon-juice', quantity: 45, unit: 'ml' },
        { ingredient: 'olive-oil', quantity: 60, unit: 'ml' },
        {
          ingredient: 'salt',
          key: 'salt-chermoula',
          quantity: 3,
          unit: 'g',
          note: t('in the chermoula', 'în chermoula'),
        },
        {
          ingredient: 'salt',
          key: 'salt-vegetables',
          quantity: 3,
          unit: 'g',
          note: t('for the vegetables', 'pentru legume'),
        },
        {
          ingredient: 'potato',
          quantity: 0.6,
          unit: 'kg',
          note: t('sliced 3 mm thick', 'tăiați felii de 3 mm'),
        },
        {
          ingredient: 'carrot',
          quantity: 250,
          unit: 'g',
          note: t('sliced 3 mm thick', 'tăiați felii de 3 mm'),
        },
        {
          ingredient: 'bell-pepper',
          quantity: 2,
          unit: 'pcs',
          note: t('cut into strips', 'tăiați fâșii'),
        },
        {
          ingredient: 'tomato',
          quantity: 300,
          unit: 'g',
          note: t('sliced', 'tăiate rondele'),
        },
        { ingredient: 'still-water', quantity: 0.1, unit: 'l' },
        {
          ingredient: 'preserved-lemons',
          quantity: 40,
          unit: 'g',
          note: t(
            'rind only, rinsed and cut into thin strips; pulp discarded',
            'doar coaja, clătită și tăiată fâșii subțiri; miezul se aruncă',
          ),
        },
        {
          ingredient: 'olives',
          quantity: 80,
          unit: 'g',
          note: t('green, pitted', 'verzi, fără sâmburi'),
        },
      ],
      steps: [
        {
          key: 'chermoula',
          text: t(
            'Mix the coriander, parsley, garlic, cumin, paprika, chilli (if using), lemon juice, olive oil and the first 3 g of salt in a bowl. Spoon half into a small separate bowl for the fish and keep the rest for the vegetables.',
            'Amestecă într-un bol coriandrul, pătrunjelul, usturoiul, chimionul, boiaua, ardeiul iute (dacă îl folosești), sucul de lămâie, uleiul de măsline și primele 3 g de sare. Pune jumătate într-un bol mic separat pentru pește și păstrează restul pentru legume.',
          ),
        },
        {
          key: 'oven',
          text: t(
            'Switch the oven on to 200 °C, top and bottom heat. It takes about 15 minutes to get hot, which is the time you need to prepare the vegetables in the next step.',
            'Pornește cuptorul la 200 °C, cu foc sus și jos. Durează cam 15 minute până se încinge, adică exact timpul de care ai nevoie să pregătești legumele la pasul următor.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'veg',
          text: t(
            'While the oven heats, slice the potatoes and carrots 3 mm thick, cut the peppers into strips, and toss them with the chermoula in the other bowl and the second 3 g of salt.',
            'Cât se încălzește cuptorul, taie cartofii și morcovii felii de 3 mm, taie ardeii fâșii și amestecă-i cu chermoula din celălalt bol și cu cele 3 g de sare rămase.',
          ),
        },
        {
          key: 'layer',
          text: t(
            'In a 28 to 30 cm tagine or deep ovenproof dish, layer the potatoes, then the carrots and peppers, and put the sliced tomatoes on top. Pour the water down the side of the dish and cover with the lid or tightly with foil.',
            'Într-o tajine sau o tavă adâncă termorezistentă de 28-30 cm, pune pe rând cartofii, apoi morcovii și ardeii, iar deasupra roșiile feliate. Toarnă apa pe lângă marginea vasului și acoperă cu capacul sau bine cu folie.',
          ),
        },
        {
          key: 'bake-veg',
          text: t(
            'Bake covered for 30 minutes, until a fork slides into the potatoes with just a little resistance. Marinate the fish in the next step while this bakes.',
            'Coace acoperit 30 de minute, până când furculița intră în cartofi cu puțină rezistență. Marinează peștele la pasul următor, cât se coc legumele.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'marinate',
          text: t(
            'While the vegetables bake, pat the fish dry, rub it all over with the chermoula from the small bowl, cover and leave in the fridge until the vegetables are ready. Then wash your hands with hot soapy water.',
            'Cât se coc legumele, șterge peștele cu hârtie de bucătărie, unge-l peste tot cu chermoula din bolul mic, acoperă-l și lasă-l la frigider până sunt gata legumele. Apoi spală-ți mâinile cu apă fierbinte și săpun.',
          ),
        },
        {
          key: 'fish',
          text: t(
            'Uncover the dish and lay the fish on the vegetables skin side up, with the preserved lemon strips and the olives around it. Wash your hands with hot soapy water, then bake uncovered for 15 minutes.',
            'Descoperă tava și așază peștele peste legume cu pielea în sus, cu fâșiile de lămâie conservată și măslinele în jur. Spală-ți mâinile cu apă fierbinte și săpun, apoi coace descoperit 15 minute.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'check',
          text: t(
            'Check the thickest fillet: it should read 63 °C, the flesh should be opaque and flake easily with a fork, and the potatoes should be tender. If not, bake 3 to 5 minutes more. Serve from the dish with a clean spoon.',
            'Verifică fileul cel mai gros: trebuie să arate 63 °C, carnea să fie opacă și să se desfacă ușor cu furculița, iar cartofii să fie fragezi. Dacă nu, mai coace 3-5 minute. Servește din tavă cu o lingură curată.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'chermoula',
          text: t(
            'Never dip anything that touched the raw fish into the vegetables bowl of chermoula.',
            'Nu băga în bolul cu chermoula pentru legume nimic care a atins peștele crud.',
          ),
        },
      ],
      nutritionNote: t(
        'Fish with potatoes, carrots and peppers makes a balanced one-dish meal with protein, starch and vegetables. The olive oil is mostly unsaturated fat. Preserved lemon and olives are salty, so taste before you add more salt.',
        'Peștele cu cartofi, morcovi și ardei face o masă echilibrată dintr-o singură tavă, cu proteine, amidon și legume. Uleiul de măsline e în mare parte grăsime nesaturată. Lămâia conservată și măslinele sunt sărate, așa că gustă înainte să mai adaugi sare.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Bread', 'Pâine'),
          reason: t(
            'Soft bread mops up the olive oil and chermoula juices at the bottom of the dish.',
            'Pâinea moale adună uleiul de măsline și sucul de chermoula de pe fundul tăvii.',
          ),
          principle: 'complement_flavour',
          ingredient: 'bread',
        },
        {
          kind: 'drink',
          label: t('Mint tea', 'Ceai de mentă'),
          reason: t(
            'Hot, fresh mint refreshes the palate after the garlic and spices.',
            'Menta proaspătă și fierbinte împrospătează gustul după usturoi și condimente.',
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
            'A warm tray of potatoes and fish with spices warms you up.',
            'O tavă caldă cu cartofi și pește, cu condimente, te încălzește.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Fish gives protein and the potatoes give carbohydrates to refill energy.',
            'Peștele dă proteine, iar cartofii dau carbohidrați care refac energia.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'A full meal of potatoes, oil and spices sits heavy during hard exercise.',
            'O masă consistentă de cartofi, ulei și condimente cade greu în timpul unui efort intens.',
          ),
        },
      ],
    },
    {
      slug: 'plachie-de-peste-spanish',
      cuisine: 'spanish',
      title: t(
        'Merluza en salsa verde (Basque hake with clams in parsley and garlic sauce)',
        'Merluza en salsa verde (merluciu basc cu scoici în sos de pătrunjel și usturoi)',
      ),
      servings: 4,
      prepMinutes: 40,
      cookMinutes: 25,
      difficulty: 'medium',
      hideBaseTips: [2, 3],
      lines: [
        {
          ingredient: 'hake',
          quantity: 720,
          unit: 'g',
          note: t(
            '4 portions of about 180 g and 2.5 cm thick, skin on',
            '4 porții de aproximativ 180 g și 2,5 cm grosime, cu piele',
          ),
        },
        {
          ingredient: 'salt',
          key: 'salt-fish',
          quantity: 3,
          unit: 'g',
          note: t('for the hake', 'pentru merluciu'),
        },
        {
          ingredient: 'clams',
          quantity: 500,
          unit: 'g',
          note: t('live, in their shells', 'vii, în cochilie'),
        },
        {
          ingredient: 'still-water',
          quantity: 1,
          unit: 'l',
          note: t(
            'cold, to clean the sand out of the clams',
            'rece, pentru curățarea scoicilor de nisip',
          ),
        },
        {
          ingredient: 'salt',
          key: 'salt-purge',
          quantity: 30,
          unit: 'g',
          note: t(
            'dissolved in the water the clams soak in (not eaten)',
            'dizolvată în apa în care stau scoicile (nu se mănâncă)',
          ),
        },
        { ingredient: 'olive-oil', quantity: 80, unit: 'ml' },
        {
          ingredient: 'garlic',
          quantity: 25,
          unit: 'g',
          note: t('thinly sliced', 'tăiat felioare subțiri'),
        },
        { ingredient: 'flour', quantity: 10, unit: 'g' },
        {
          ingredient: 'white-wine',
          quantity: 100,
          unit: 'ml',
          note: t('dry', 'sec'),
        },
        { ingredient: 'fish-stock', quantity: 250, unit: 'ml' },
        {
          ingredient: 'parsley',
          quantity: 40,
          unit: 'g',
          note: t('leaves, chopped', 'frunze, tocate'),
        },
        {
          ingredient: 'frozen-peas',
          quantity: 100,
          unit: 'g',
          optional: true,
        },
        {
          ingredient: 'asparagus',
          quantity: 150,
          unit: 'g',
          optional: true,
          note: t('cut into 3 cm lengths', 'tăiat bucăți de 3 cm'),
        },
        {
          ingredient: 'salt',
          key: 'salt-sauce',
          note: t('to taste, at the end', 'după gust, la final'),
        },
      ],
      steps: [
        {
          key: 'purge',
          text: t(
            'Look over the clams and throw away any that are cracked, or open and do not close when tapped. Dissolve the 30 g of salt in the cold water in a bowl, add the clams and leave them in the fridge for 30 minutes to spit out their sand.',
            'Alege scoicile și aruncă-le pe cele crăpate sau deschise care nu se închid când le atingi. Dizolvă cele 30 g de sare în apa rece dintr-un bol, adaugă scoicile și lasă-le la frigider 30 de minute să elimine nisipul.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'salt-hake',
          text: t(
            'While the clams soak, pat the hake dry, salt it with the 3 g of salt and keep it in the fridge. Then wash your hands, board and knife with hot soapy water.',
            'Cât stau scoicile la înmuiat, șterge merluciul cu hârtie, sărează-l cu cele 3 g de sare și ține-l la frigider. Apoi spală-ți mâinile, planșeta și cuțitul cu apă fierbinte și săpun.',
          ),
        },
        {
          key: 'rinse',
          text: t(
            'Lift the clams out of the water with your hands, so the sand stays at the bottom of the bowl, and rinse them under cold water. Keep them in the fridge until needed. Then wash your hands with hot soapy water.',
            'Scoate scoicile din apă cu mâna, ca nisipul să rămână pe fundul bolului, și clătește-le sub apă rece. Ține-le la frigider până le folosești. Apoi spală-ți mâinile cu apă fierbinte și săpun.',
          ),
        },
        {
          key: 'stock',
          text: t(
            'Slice the garlic thinly and chop the parsley on a clean board. Warm the fish stock in a small pan until steaming.',
            'Taie usturoiul felioare subțiri și toacă pătrunjelul pe o planșetă curată. Încălzește supa de pește într-o cratiță mică până scoate aburi.',
          ),
        },
        {
          key: 'garlic',
          text: t(
            'Warm the oil in a wide 32 cm shallow pan over low heat and cook the garlic for 2 to 3 minutes, until it is fragrant and just pale gold. Do not let it brown, or it turns bitter.',
            'Încălzește uleiul într-o tigaie lată și joasă de 32 cm la foc mic și gătește usturoiul 2-3 minute, până miroase frumos și se face abia auriu. Nu-l lăsa să se rumenească, că se face amar.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'flour',
          text: t(
            'Stir in the flour and cook it for 1 minute, stirring, without letting it colour.',
            'Adaugă făina și gătește-o 1 minut, amestecând, fără să se coloreze.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'wine',
          text: t(
            'Pour in the wine and simmer for 2 minutes, stirring, to cook off the raw alcohol smell.',
            'Toarnă vinul și fierbe 2 minute, amestecând, să dispară mirosul de alcool crud.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'sauce',
          text: t(
            'Whisk in the hot stock a little at a time and simmer for 3 minutes, until the sauce lightly coats the back of a spoon. Stir in half of the parsley.',
            'Adaugă supa fierbinte puțin câte puțin, amestecând cu un tel, și fierbe 3 minute, până sosul acoperă ușor dosul lingurii. Amestecă jumătate din pătrunjel.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'hake',
          text: t(
            'Lay the hake in the sauce skin side up, with the peas and asparagus around it, if using, and wash your hands with hot soapy water. Keep the sauce at a very gentle simmer and cook for 4 minutes, swirling the pan often so the skin gelatin and the oil bind into a creamy sauce.',
            'Așază merluciul în sos cu pielea în sus, cu mazărea și sparanghelul în jur, dacă le folosești, și spală-ți mâinile cu apă fierbinte și săpun. Ține sosul la un clocot foarte slab și gătește 4 minute, rotind des tigaia, ca gelatina din piele și uleiul să lege sosul într-o cremă.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'clams',
          text: t(
            'Turn the hake over with a wide fish slice, scatter the clams around it and wash your hands with hot soapy water. Cover the pan and cook for 4 minutes, until the clams open.',
            'Întoarce merluciul cu o spatulă lată, presară scoicile în jur și spală-ți mâinile cu apă fierbinte și săpun. Acoperă tigaia și gătește 4 minute, până se deschid scoicile.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'check',
          text: t(
            'Check the thickest part of the hake: it should read 63 °C, with the flesh opaque and flaking easily. If not, cover and cook 1 to 2 minutes more. Throw away any clams that stayed shut.',
            'Verifică partea cea mai groasă a merluciului: trebuie să arate 63 °C, cu carnea opacă care se desface ușor. Dacă nu, acoperă și mai gătește 1-2 minute. Aruncă scoicile care au rămas închise.',
          ),
        },
        {
          key: 'finish',
          text: t(
            'Off the heat, scatter the rest of the parsley, swirl the pan, and taste the sauce before adding any salt, as the clams and the stock are already salty. Serve at once with bread.',
            'Dă tigaia de pe foc, presară restul de pătrunjel, rotește tigaia și gustă sosul înainte să adaugi sare, pentru că scoicile și supa sunt deja sărate. Servește imediat cu pâine.',
          ),
        },
      ],
      tips: [
        t(
          'Cook clams the day you buy them and buy them live. Throw away any that are cracked, or open and do not close when tapped before cooking, and any that stay shut after cooking. Never force them open.',
          'Gătește scoicile în ziua în care le cumperi și cumpără-le vii. Aruncă-le pe cele crăpate sau deschise care nu se închid când le atingi înainte de gătit, precum și pe cele rămase închise după gătit. Nu le forța niciodată să se deschidă.',
        ),
        t(
          'This is best eaten straight away. If any is left, cool it and put it in the fridge within 2 hours, eat it within 1 day and reheat until steaming hot. Do not keep the clams that did not open.',
          'Se mănâncă cel mai bine imediat. Dacă rămâne, lasă-l să se răcească și pune-l la frigider în cel mult 2 ore, mănâncă-l în 1 zi și reîncălzește-l până scoate aburi. Nu păstra scoicile care nu s-au deschis.',
        ),
      ],
      stepTips: [
        {
          step: 'hake',
          text: t(
            'Hake is soft and breaks up easily, so handle it as little as possible. Leave the skin on, turn it once with a wide fish slice, and move the pan, not the fish.',
            'Merluciul e fraged și se sfărâmă ușor, așa că atinge-l cât mai puțin. Lasă pielea pe el, întoarce-l o singură dată cu o spatulă lată și mișcă tigaia, nu peștele.',
          ),
        },
        {
          step: 'sauce',
          text: t(
            'If the sauce looks thin, simmer it for another minute before the fish goes in; if it is too thick, loosen it with a splash of hot water.',
            'Dacă sosul pare prea subțire, mai fierbe-l un minut înainte să pui peștele; dacă e prea gros, subțiază-l cu un strop de apă fierbinte.',
          ),
        },
      ],
      nutritionNote: t(
        'Hake and clams are lean, so this gives plenty of protein, but the sauce carries a generous amount of olive oil (mostly unsaturated fat). The stock, clams and salt make the sauce salty, and there is almost no starch or fibre, so bread or boiled potatoes and a green vegetable round it out.',
        'Merluciul și scoicile sunt slabe, așa că porția dă multe proteine, dar sosul poartă o cantitate generoasă de ulei de măsline (în mare parte grăsimi nesaturate). Supa, scoicile și sarea fac sosul sărat, iar amidon și fibre sunt aproape deloc, așa că pâinea sau cartofii fierți și o legumă verde completează masa.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Crusty bread', 'Pâine cu crustă'),
          reason: t(
            'The green sauce is the best part, and bread mops up every drop.',
            'Sosul verde e partea cea mai bună, iar pâinea adună fiecare strop.',
          ),
          principle: 'complement_flavour',
          ingredient: 'bread',
        },
        {
          kind: 'drink',
          label: t('Dry cider', 'Cidru sec'),
          reason: t(
            'Its tart acidity and light fizz cut through the olive oil and refresh the palate.',
            'Aciditatea lui și efervescența ușoară taie din uleiul de măsline și împrospătează gustul.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'cider',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Lean fish and clams make a quick lunch, as long as you go easy on the bread and sauce.',
            'Peștele slab și scoicile fac un prânz rapid, dacă nu exagerezi cu pâinea și cu sosul.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Lean protein helps muscles recover; add bread or potatoes for carbohydrates.',
            'Proteinele slabe ajută mușchii să se refacă; adaugă pâine sau cartofi pentru carbohidrați.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A rich oil, garlic and wine sauce may sit heavy right before bed.',
            'Un sos bogat cu ulei, usturoi și vin poate cădea greu chiar înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
