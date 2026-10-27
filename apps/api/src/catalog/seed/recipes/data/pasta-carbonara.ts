import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The base is the Roman spaghetti carbonara: guanciale, eggs, pecorino romano
// and black pepper, with no cream and no garlic. The egg sauce is only warmed
// by the pasta, so every Recipe here flags it for children, older people and
// anyone pregnant and says how to cook it further. Each Variant is a full
// Recipe; the base's Recipe-level Tips are inherited unless hidden.
export const pastaCarbonara: BaseRecipeSeed = {
  slug: 'pasta-carbonara',
  title: t('Spaghetti carbonara', 'Spaghete carbonara'),
  servings: 4,
  prepMinutes: 10,
  cookMinutes: 30,
  difficulty: 'medium',
  lines: [
    { ingredient: 'spaghetti', quantity: 400, unit: 'g' },
    {
      ingredient: 'guanciale',
      quantity: 150,
      unit: 'g',
      note: t('cut into 1 cm batons', 'tăiat în bastonașe de 1 cm'),
    },
    {
      ingredient: 'eggs',
      quantity: 2,
      unit: 'pcs',
      note: t('whole', 'întregi'),
    },
    {
      ingredient: 'eggs',
      key: 'egg-yolks',
      quantity: 4,
      unit: 'pcs',
      note: t('yolks only', 'doar gălbenușurile'),
    },
    {
      ingredient: 'pecorino',
      quantity: 80,
      unit: 'g',
      note: t(
        'pecorino romano, finely grated; keep 20 g for serving',
        'pecorino romano, ras fin; păstrează 20 g pentru servire',
      ),
    },
    {
      ingredient: 'peppercorns',
      quantity: 4,
      unit: 'g',
      note: t('coarsely crushed', 'pisate grosier'),
    },
    {
      ingredient: 'salt',
      quantity: 20,
      unit: 'g',
      note: t('for the pasta water', 'pentru apa de paste'),
    },
    { ingredient: 'still-water', quantity: 4, unit: 'l' },
  ],
  steps: [
    {
      key: 'water',
      text: t(
        'Put the water and salt in a large pot, cover, and bring to a rolling boil over high heat. This takes about 15 minutes, so the next steps happen while it heats.',
        'Pune apa și sarea într-o oală mare, acoperă și adu la fiert puternic, la foc mare. Durează aproximativ 15 minute, așa că pașii următori se fac cât se încălzește apa.',
      ),
    },
    {
      key: 'cut',
      text: t(
        'Cut the rind off the guanciale if it is hard, then cut the meat into batons about 1 cm thick and 3 cm long.',
        'Taie șoriciul de pe guanciale dacă e tare, apoi taie carnea în bastonașe groase de 1 cm și lungi de 3 cm.',
      ),
    },
    {
      key: 'egg-mix',
      text: t(
        'In a large bowl, beat the whole eggs and the yolks with 60 g of the pecorino and the crushed pepper into a thick, grainy paste. Set it next to the stove.',
        'Într-un castron mare, bate ouăle întregi și gălbenușurile cu 60 g din pecorino și cu piperul pisat, până obții o pastă groasă, cu textură granulată. Pune-l lângă aragaz.',
      ),
    },
    {
      key: 'render',
      text: t(
        'Put the guanciale in a cold, dry 30 cm frying pan over medium-low heat. Cook for about 10 minutes, stirring now and then, until the fat has turned translucent and the batons are golden at the edges but still slightly chewy inside. Turn off the heat and leave everything in the pan.',
        'Pune guanciale într-o tigaie uscată și rece de 30 cm, la foc mic-mediu. Gătește aproximativ 10 minute, amestecând din când în când, până când grăsimea devine translucidă, iar bucățile se rumenesc pe margini, dar rămân puțin elastice în interior. Stinge focul și lasă totul în tigaie.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'pasta',
      text: t(
        'Drop the spaghetti into the boiling water and stir. Cook for 1 minute less than the pack says, about 9 minutes for most spaghetti, until it is bendy but still firm in the middle.',
        'Pune spaghetele în apa clocotită și amestecă. Fierbe cu 1 minut mai puțin decât scrie pe pachet, aproximativ 9 minute pentru majoritatea spaghetelor, până sunt flexibile, dar încă ferme în mijloc.',
      ),
      timerSeconds: 540,
    },
    {
      key: 'reserve',
      text: t(
        'Before lifting out the spaghetti, scoop out 250 ml of the pasta water. Stir 50 ml of it into the egg mixture to loosen it into a thin cream.',
        'Înainte să scoți spaghetele, ia 250 ml din apa de paste. Amestecă 50 ml din ea în compoziția de ouă, ca să devină o cremă subțire.',
      ),
    },
    {
      key: 'toss-pasta',
      text: t(
        'Put the guanciale pan back over medium heat for the last minute of the pasta cooking, to warm the fat. Turn the heat off, lift the spaghetti straight from the pot into the pan with tongs, and toss for 30 seconds. The pan should be hot but no longer sizzling.',
        'Pune tigaia cu guanciale înapoi pe foc mediu pentru ultimul minut de fierbere a pastelor, ca să se încălzească grăsimea. Stinge focul, ridică spaghetele direct din oală în tigaie cu cleștele și amestecă 30 de secunde. Tigaia trebuie să fie fierbinte, dar să nu mai sfârâie.',
      ),
    },
    {
      key: 'sauce',
      text: t(
        'Pour in the egg mixture and toss quickly and constantly with the tongs. Add the reserved pasta water a spoonful at a time until the sauce turns glossy and coats every strand like thin cream, with no scrambled bits. The heat of the pasta only warms the egg through, so this sauce is lightly cooked; see the note on this step before serving it to children, older people, anyone pregnant or anyone with a weakened immune system.',
        'Toarnă compoziția de ouă și amestecă repede și continuu cu cleștele. Adaugă apa de paste rezervată câte o lingură, până când sosul devine lucios și învelește fiecare fir ca o cremă subțire, fără cocoloașe de ou fiert. Căldura pastelor doar încălzește oul, așa că sosul e gătit ușor; citește nota de la acest pas înainte să-l dai copiilor, persoanelor în vârstă, gravidelor sau persoanelor cu imunitate scăzută.',
      ),
    },
    {
      key: 'serve',
      text: t(
        'Divide between warm plates, top with the remaining 20 g of pecorino and more crushed pepper, and eat straight away.',
        'Împarte în farfurii calde, presară restul de 20 g de pecorino și mai mult piper pisat și servește imediat.',
      ),
    },
  ],
  tips: [
    t(
      'The pasta water gets only 20 g of salt for 4 l: guanciale and pecorino are both salty, and the sauce gets saltier as it clings to the spaghetti.',
      'Apa de paste primește doar 20 g de sare la 4 l: guanciale și pecorino sunt ambele sărate, iar sosul se concentrează pe măsură ce se prinde de spaghete.',
    ),
    t(
      'Keep a mug of the starchy pasta water by the stove. It is what turns egg and cheese into a creamy sauce instead of a clumpy or oily one; if the sauce tightens on the plate, a spoonful of hot water loosens it.',
      'Ține o cană cu apa amidonoasă de la paste lângă aragaz. Ea transformă oul și brânza într-un sos cremos, nu într-unul cocoloșit sau uleios; dacă sosul se strânge în farfurie, o lingură de apă fierbinte îl desface.',
    ),
    t(
      'Rigatoni works in place of spaghetti: the ridges and tubes catch the guanciale and the sauce.',
      'Merg și rigatoni în loc de spaghete: dungile și tuburile prind guanciale și sosul.',
    ),
    t(
      'Warm the plates or bowls (hot tap water, then dry them). The sauce stiffens fast on a cold plate.',
      'Încălzește farfuriile sau bolurile (apă fierbinte de la robinet, apoi șterge-le). Sosul se încheagă repede pe o farfurie rece.',
    ),
  ],
  stepTips: [
    {
      step: 'egg-mix',
      text: t(
        'Grate the pecorino as fine as snow (a microplane is best). Coarse shreds do not melt in the gentle heat and leave the sauce gritty.',
        'Dă pecorino pe răzătoarea cea mai fină (ideal una de tip microplane). Așchiile groase nu se topesc la căldura blândă și lasă sosul nisipos.',
      ),
    },
    {
      step: 'sauce',
      text: t(
        'To cook the sauce further for children, older people, anyone pregnant or anyone with a weakened immune system: use pasteurised eggs, or put the pan back over the lowest heat after adding the egg mixture and stir constantly, about 1 to 2 minutes, until the sauce reaches 71 °C on a probe thermometer and is thick with no runny egg left. Lift the pan off the heat at once if it starts to look grainy. The sauce will be less silky, but it will be cooked through.',
        'Ca să gătești sosul mai mult pentru copii, persoane în vârstă, gravide sau persoane cu imunitate scăzută: folosește ouă pasteurizate sau pune tigaia înapoi pe cel mai mic foc după ce ai adăugat compoziția de ouă și amestecă continuu, aproximativ 1-2 minute, până când sosul ajunge la 71 °C pe un termometru cu sondă și e gros, fără ou lichid. Ridică tigaia de pe foc imediat dacă începe să pară granulat. Sosul va fi mai puțin mătăsos, dar gătit complet.',
      ),
    },
  ],
  nutritionNote: t(
    'Filling, with protein from the eggs and cheese and plenty of carbohydrate from the pasta. The guanciale, yolks and pecorino bring a lot of saturated fat and salt, and there is hardly any fibre, so keep the portion of guanciale modest and serve a green salad alongside.',
    'Săturătoare, cu proteine din ouă și brânză și mulți carbohidrați din paste. Guanciale, gălbenușurile și pecorino aduc multe grăsimi saturate și sare, iar fibre sunt foarte puține, așa că folosește guanciale cu măsură și servește alături o salată verde.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Italian antipasto platter', 'Platou italian antipasto'),
      reason: t(
        'A light starter course first, then a smaller plate of the rich pasta as the next course.',
        'Un aperitiv ușor la început, apoi o porție mai mică din pastele bogate, ca fel următor.',
      ),
      recipe: 'appetizer-platter-italian',
    },
    {
      kind: 'food',
      label: t('Rocket salad with lemon', 'Salată de rucola cu lămâie'),
      reason: t(
        'The peppery leaves and the lemon cut through the fat of the guanciale and yolks.',
        'Frunzele picante și lămâia taie din grăsimea de la guanciale și gălbenușuri.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'rocket',
    },
    {
      kind: 'drink',
      label: t('Dry white wine', 'Vin alb sec'),
      reason: t(
        'Its acidity refreshes the palate between rich, salty forkfuls.',
        'Aciditatea lui împrospătează gustul între îmbucături bogate și sărate.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'white-wine',
    },
    {
      kind: 'drink',
      label: t('Sparkling water', 'Apă minerală'),
      reason: t(
        'The bubbles clear the creamy sauce from the tongue and keep the meal from feeling heavy.',
        'Bulele curăță limba de sosul cremos și fac masa să pară mai puțin grea.',
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
        'A hot, rich bowl of pasta is warming when it is cold outside.',
        'Un castron fierbinte și bogat de paste încălzește când e frig afară.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'It is rich and heavy in fat and salt, which can sit uncomfortably before bed.',
        'E bogată și grea, cu multă grăsime și sare, și poate cădea greu înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'pasta-carbonara-italian',
      cuisine: 'italian',
      // No guanciale or salty pasta-water advice and no ridged-pasta tip.
      hideBaseTips: [0, 2],
      title: t(
        'Carbonara di zucchine (courgette carbonara)',
        'Carbonara di zucchine (carbonara cu dovlecei)',
      ),
      servings: 4,
      prepMinutes: 10,
      cookMinutes: 30,
      difficulty: 'easy',
      lines: [
        { ingredient: 'spaghetti', quantity: 400, unit: 'g' },
        {
          ingredient: 'zucchini',
          quantity: 3,
          unit: 'pcs',
          note: t(
            'medium, cut into thin batons about 5 mm thick',
            'medii, tăiați în bastonașe subțiri de aproximativ 5 mm',
          ),
        },
        { ingredient: 'olive-oil', quantity: 45, unit: 'ml' },
        {
          ingredient: 'garlic',
          quantity: 5,
          unit: 'g',
          note: t('1 clove, lightly crushed', '1 cățel, strivit ușor'),
        },
        {
          ingredient: 'eggs',
          quantity: 2,
          unit: 'pcs',
          note: t('whole', 'întregi'),
        },
        {
          ingredient: 'eggs',
          key: 'egg-yolks',
          quantity: 3,
          unit: 'pcs',
          note: t('yolks only', 'doar gălbenușurile'),
        },
        {
          ingredient: 'pecorino',
          quantity: 40,
          unit: 'g',
          note: t('finely grated', 'ras fin'),
        },
        {
          ingredient: 'parmesan',
          quantity: 40,
          unit: 'g',
          note: t('finely grated', 'ras fin'),
        },
        {
          ingredient: 'basil',
          quantity: 10,
          unit: 'g',
          note: t('leaves, torn', 'frunze, rupte'),
        },
        {
          ingredient: 'peppercorns',
          quantity: 3,
          unit: 'g',
          note: t('coarsely crushed', 'pisate grosier'),
        },
        {
          ingredient: 'salt',
          quantity: 20,
          unit: 'g',
          note: t('for the pasta water', 'pentru apa de paste'),
        },
        {
          ingredient: 'salt',
          key: 'salt-courgettes',
          quantity: 2,
          unit: 'g',
          note: t('for the courgettes', 'pentru dovlecei'),
        },
        { ingredient: 'still-water', quantity: 4, unit: 'l' },
      ],
      steps: [
        {
          key: 'water',
          text: t(
            'Put the water and the pasta salt in a large pot, cover, and bring to a rolling boil over high heat. This takes about 15 minutes, so fry the courgettes while it heats.',
            'Pune apa și sarea pentru paste într-o oală mare, acoperă și adu la fiert puternic, la foc mare. Durează aproximativ 15 minute, așa că prăjește dovleceii cât se încălzește apa.',
          ),
        },
        {
          key: 'egg-mix',
          text: t(
            'In a large bowl, beat the whole eggs and the yolks with the pecorino, the Parmesan and the crushed pepper into a thick, grainy paste. Set it next to the stove.',
            'Într-un castron mare, bate ouăle întregi și gălbenușurile cu pecorino, parmezanul și piperul pisat, până obții o pastă groasă, cu textură granulată. Pune-l lângă aragaz.',
          ),
        },
        {
          key: 'fry',
          text: t(
            'Heat half of the oil in a 30 cm frying pan over medium-high heat with the garlic clove. When the garlic sizzles, lift it out and discard it, then add half of the courgette batons in a single layer with a pinch of the courgette salt. Fry for about 5 minutes, turning now and then, until golden at the edges and just tender. Tip them onto a plate and repeat with the rest of the oil and courgettes.',
            'Încinge jumătate din ulei într-o tigaie de 30 cm, la foc mediu-mare, cu cățelul de usturoi. Când usturoiul sfârâie, scoate-l și aruncă-l, apoi adaugă jumătate din bastonașele de dovlecel într-un singur strat, cu un praf din sarea pentru dovlecei. Prăjește aproximativ 5 minute, întorcând din când în când, până se rumenesc pe margini și sunt abia fragezi. Pune-i pe o farfurie și repetă cu restul de ulei și de dovlecei.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'pasta',
          text: t(
            'Drop the spaghetti into the boiling water and stir. Cook for 1 minute less than the pack says, about 9 minutes for most spaghetti, until it is bendy but still firm in the middle.',
            'Pune spaghetele în apa clocotită și amestecă. Fierbe cu 1 minut mai puțin decât scrie pe pachet, aproximativ 9 minute pentru majoritatea spaghetelor, până sunt flexibile, dar încă ferme în mijloc.',
          ),
          timerSeconds: 540,
        },
        {
          key: 'reserve',
          text: t(
            'Before lifting out the spaghetti, scoop out 250 ml of the pasta water. Stir 50 ml of it into the egg mixture to loosen it into a thin cream.',
            'Înainte să scoți spaghetele, ia 250 ml din apa de paste. Amestecă 50 ml din ea în compoziția de ouă, ca să devină o cremă subțire.',
          ),
        },
        {
          key: 'toss-pasta',
          text: t(
            'Return all the courgettes to the pan with the oil left in it. Lift the spaghetti with tongs into the pan and toss for 30 seconds off the heat, so the pan is hot but not sizzling.',
            'Pune toți dovleceii înapoi în tigaie, cu uleiul rămas în ea. Ridică spaghetele cu cleștele în tigaie și amestecă 30 de secunde, fără foc, astfel încât tigaia să fie fierbinte, dar să nu sfârâie.',
          ),
        },
        {
          key: 'sauce',
          text: t(
            'Pour in the egg mixture and toss quickly and constantly. Add the reserved pasta water a spoonful at a time until the sauce is glossy and creamy and coats the spaghetti, with no scrambled bits. The heat of the pasta only warms the egg through, so this sauce is lightly cooked; see the note on this step before serving it to children, older people, anyone pregnant or anyone with a weakened immune system.',
            'Toarnă compoziția de ouă și amestecă repede și continuu. Adaugă apa de paste rezervată câte o lingură, până când sosul e lucios, cremos și învelește spaghetele, fără cocoloașe de ou fiert. Căldura pastelor doar încălzește oul, așa că sosul e gătit ușor; citește nota de la acest pas înainte să-l dai copiilor, persoanelor în vârstă, gravidelor sau persoanelor cu imunitate scăzută.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Divide between warm plates, tear the basil over the top, finish with more crushed pepper, and eat straight away.',
            'Împarte în farfurii calde, rupe busuiocul deasupra, termină cu mai mult piper pisat și servește imediat.',
          ),
        },
      ],
      tips: [
        t(
          'This version is meat-free but not strictly vegetarian: pecorino and Parmesan are usually made with animal rennet, so check the labels if that matters to you.',
          'Această variantă nu are carne, dar nu e strict vegetariană: pecorino și parmezanul se fac de obicei cu cheag de origine animală, așa că verifică etichetele dacă asta contează pentru tine.',
        ),
        t(
          'The pasta water gets only 20 g of salt for 4 l: both cheeses are salty and the sauce concentrates as it coats the spaghetti.',
          'Apa de paste primește doar 20 g de sare la 4 l: ambele brânzeturi sunt sărate, iar sosul se concentrează pe măsură ce se prinde de spaghete.',
        ),
      ],
      stepTips: [
        {
          step: 'fry',
          text: t(
            'Do not crowd the pan: courgettes piled up steam and go soft and grey instead of turning golden. Two batches are worth the extra few minutes.',
            'Nu aglomera tigaia: dovleceii îngrămădiți se aburesc și devin moi și cenușii, în loc să se rumenească. Merită cele câteva minute în plus ca să-i prăjești în două rânduri.',
          ),
        },
        {
          step: 'sauce',
          text: t(
            'To cook the sauce further for children, older people, anyone pregnant or anyone with a weakened immune system: use pasteurised eggs, or put the pan back over the lowest heat after adding the egg mixture and stir constantly, about 1 to 2 minutes, until the sauce reaches 71 °C on a probe thermometer and is thick with no runny egg left. Lift the pan off the heat at once if it starts to look grainy. The sauce will be less silky, but it will be cooked through.',
            'Ca să gătești sosul mai mult pentru copii, persoane în vârstă, gravide sau persoane cu imunitate scăzută: folosește ouă pasteurizate sau pune tigaia înapoi pe cel mai mic foc după ce ai adăugat compoziția de ouă și amestecă continuu, aproximativ 1-2 minute, până când sosul ajunge la 71 °C pe un termometru cu sondă și e gros, fără ou lichid. Ridică tigaia de pe foc imediat dacă începe să pară granulat. Sosul va fi mai puțin mătăsos, dar gătit complet.',
          ),
        },
      ],
      nutritionNote: t(
        'Filling, with carbohydrate from the pasta, protein from the eggs and cheese, and some fibre and vitamins from the courgettes. Two cheeses, yolks and olive oil still make it rich in salt and fat, though lighter in saturated fat than the version with guanciale.',
        'Săturătoare, cu carbohidrați din paste, proteine din ouă și brânză și ceva fibre și vitamine din dovlecei. Cele două brânzeturi, gălbenușurile și uleiul de măsline o fac totuși bogată în sare și grăsimi, deși mai puțin în grăsimi saturate decât varianta cu guanciale.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Ripe tomato salad', 'Salată de roșii coapte'),
          reason: t(
            'Its acidity cuts through the cheese and yolk, and it is cool against the warm pasta.',
            'Aciditatea ei taie din bogăția brânzei și a gălbenușului și e răcoroasă lângă pastele calde.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'tomato',
        },
        {
          kind: 'food',
          label: t('Crusty bread', 'Pâine cu crustă'),
          reason: t(
            'Good for wiping up the last of the sauce from the plate.',
            'E bună ca să ștergi din farfurie ultimul strop de sos.',
          ),
          principle: 'contrast_texture',
          ingredient: 'bread',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'A crisp, acidic white refreshes the palate between the creamy, cheesy forkfuls.',
            'Un vin alb proaspăt și acid împrospătează gustul între îmbucăturile cremoase, cu brânză.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'white-wine',
        },
        {
          kind: 'drink',
          label: t('Sparkling water', 'Apă minerală'),
          reason: t(
            'The bubbles clear the palate and keep the meal feeling light.',
            'Bulele curăță gustul și fac masa să pară mai ușoară.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'sparkling-water',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Quick to make, and the courgettes make it feel lighter than the version with cured pork.',
            'Se face repede, iar dovleceii o fac să pară mai ușoară decât varianta cu porc maturat.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Fresh basil and courgettes keep it from feeling heavy when it is warm outside.',
            'Busuiocul proaspăt și dovleceii o fac mai puțin grea când e cald afară.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Pasta carbohydrate and egg protein help you refuel.',
            'Carbohidrații din paste și proteinele din ou te ajută să-ți refaci energia.',
          ),
        },
      ],
    },
    {
      slug: 'pasta-carbonara-japanese',
      cuisine: 'japanese',
      // Udon, not spaghetti: none of the pasta, guanciale or pasta-water advice applies.
      hideBaseTips: [0, 1, 2, 3],
      title: t(
        'Kamatama butter udon (Japanese egg and butter udon)',
        'Kamatama udon cu unt (tăiței udon cu ou și unt)',
      ),
      servings: 2,
      prepMinutes: 5,
      cookMinutes: 15,
      difficulty: 'easy',
      lines: [
        { ingredient: 'udon', quantity: 400, unit: 'g' },
        { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
        { ingredient: 'butter', quantity: 20, unit: 'g' },
        {
          ingredient: 'peppercorns',
          quantity: 2,
          unit: 'g',
          note: t('coarsely crushed', 'pisate grosier'),
        },
        { ingredient: 'soy-sauce', quantity: 20, unit: 'ml' },
        {
          ingredient: 'spring-onion',
          quantity: 20,
          unit: 'g',
          note: t('thinly sliced', 'tăiată subțire'),
        },
        {
          ingredient: 'bonito-flakes',
          quantity: 5,
          unit: 'g',
          optional: true,
        },
        {
          ingredient: 'parmesan',
          quantity: 20,
          unit: 'g',
          optional: true,
          note: t('finely grated', 'ras fin'),
        },
        { ingredient: 'still-water', quantity: 2, unit: 'l' },
      ],
      steps: [
        {
          key: 'water',
          text: t(
            'Put the water in a large pot, cover, and bring to a rolling boil over high heat. This takes about 8 minutes, so prepare everything else while it heats.',
            'Pune apa într-o oală mare, acoperă și adu la fiert puternic, la foc mare. Durează aproximativ 8 minute, așa că pregătește restul cât se încălzește apa.',
          ),
        },
        {
          key: 'bowls',
          text: t(
            'Rinse two wide bowls with hot water to warm them and dry them. Crack one egg into each bowl and beat it lightly with a fork. Add half the butter, cut into small pieces, to each bowl.',
            'Clătește două boluri late cu apă fierbinte ca să se încălzească și șterge-le. Sparge câte un ou în fiecare bol și bate-l ușor cu furculița. Adaugă în fiecare bol jumătate din unt, tăiat în bucățele mici.',
          ),
        },
        {
          key: 'udon',
          text: t(
            'Add the udon to the boiling water and loosen the noodles with chopsticks or tongs. Cook for the time on the pack (frozen udon is often about 1 minute, fresh a little longer) until they are soft and plump with no hard core.',
            'Pune udon în apa clocotită și desfă tăițeii cu bețișoare sau cu un clește. Fierbe cât scrie pe pachet (udon congelat e adesea gata în aproximativ 1 minut, cel proaspăt ceva mai mult), până când sunt moi și umflați, fără miez tare.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'drain',
          text: t(
            'Drain the noodles very well, shaking off the water, because water left on them thins the sauce. Divide them between the two bowls, on top of the egg and butter.',
            'Scurge tăițeii foarte bine, scuturând apa, pentru că apa rămasă subțiază sosul. Împarte-i în cele două boluri, peste ou și unt.',
          ),
        },
        {
          key: 'toss',
          text: t(
            'Add the crushed pepper and half of the soy sauce to the bowls and toss the noodles quickly with chopsticks for about 30 seconds, until the butter melts and the egg turns pale, thick and glossy around the noodles. The heat of the noodles only warms the egg, so this sauce is lightly cooked, close to raw; see the note on this step before serving it to children, older people, anyone pregnant or anyone with a weakened immune system.',
            'Adaugă piperul pisat și jumătate din sosul de soia în boluri și amestecă repede tăițeii cu bețișoarele, aproximativ 30 de secunde, până când untul se topește, iar oul devine pal, gros și lucios în jurul tăițeilor. Căldura tăițeilor doar încălzește oul, așa că sosul e gătit ușor, aproape crud; citește nota de la acest pas înainte să-l dai copiilor, persoanelor în vârstă, gravidelor sau persoanelor cu imunitate scăzută.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Top with the spring onion, and the bonito flakes and Parmesan if you use them. Add the rest of the soy sauce at the table, a little at a time, and eat straight away.',
            'Pune deasupra ceapa verde și, dacă le folosești, fulgii de bonito și parmezanul. Adaugă restul de sos de soia la masă, puțin câte puțin, și servește imediat.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'drain',
          text: t(
            'Fresh or frozen udon (not dried) gives the soft, bouncy texture this dish needs; the thick noodles hold the heat long enough to set the egg into a sauce.',
            'Udon proaspăt sau congelat (nu uscat) dă textura moale și elastică de care are nevoie preparatul; tăițeii groși păstrează căldura suficient cât să lege oul într-un sos.',
          ),
        },
        {
          step: 'toss',
          text: t(
            'To cook the egg through for children, older people, anyone pregnant or anyone with a weakened immune system: use pasteurised eggs, or tip the drained noodles, egg and butter into a pan over low heat and stir constantly, about 1 to 2 minutes, until the egg reaches 71 °C on a probe thermometer and has thickened with no runny egg left. The result is firmer and less silky, but cooked through.',
            'Ca să gătești oul complet pentru copii, persoane în vârstă, gravide sau persoane cu imunitate scăzută: folosește ouă pasteurizate sau pune tăițeii scurși, oul și untul într-o tigaie pe foc mic și amestecă continuu, aproximativ 1-2 minute, până când oul ajunge la 71 °C pe un termometru cu sondă și s-a îngroșat, fără ou lichid. Rezultatul e mai ferm și mai puțin mătăsos, dar gătit complet.',
          ),
        },
      ],
      tips: [
        t(
          'Sometimes called "Japanese carbonara" because it is egg, butter, pepper and hot noodles. It is a quick home dish with its own seasoning: a splash of soy sauce rather than cured pork.',
          'Uneori e numită "carbonara japoneză", pentru că are ou, unt, piper și tăiței fierbinți. E o mâncare rapidă de casă, cu condimentul ei: puțin sos de soia, în loc de porc maturat.',
        ),
      ],
      nutritionNote: t(
        'Quick carbohydrate from the noodles and some protein from the egg. The butter and optional Parmesan add saturated fat, the soy sauce and bonito add salt, and apart from the spring onion there are no vegetables, so serve it with a vegetable side.',
        'Carbohidrați rapizi din tăiței și ceva proteine din ou. Untul și parmezanul opțional aduc grăsimi saturate, sosul de soia și bonito aduc sare, iar în afară de ceapa verde nu există legume, așa că servește-o cu o garnitură de legume.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Salted cucumber', 'Castraveți proaspeți cu sare'),
          reason: t(
            'Cool, crunchy slices set against the soft, buttery noodles.',
            'Felii reci și crocante, în contrast cu tăițeii moi, cu gust de unt.',
          ),
          principle: 'contrast_texture',
          ingredient: 'cucumber',
        },
        {
          kind: 'food',
          label: t('Wilted spinach', 'Spanac călit'),
          reason: t(
            'Adds the vegetables and fibre the bowl lacks, and its green, slightly bitter taste balances the richness.',
            'Aduce legumele și fibrele care lipsesc din bol, iar gustul lui verde, ușor amărui, echilibrează bogăția.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'spinach',
        },
        {
          kind: 'drink',
          label: t('Green tea', 'Ceai verde'),
          reason: t(
            'Its light bitterness cleans the buttery taste from the palate.',
            'Amăreala lui ușoară curăță gustul de unt din gură.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'green-tea',
        },
        {
          kind: 'drink',
          label: t('Beer', 'Bere'),
          reason: t(
            'A cold, crisp beer cuts through the butter and refreshes the palate.',
            'O bere rece și proaspătă taie din unt și împrospătează gustul.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Ready in about 15 minutes with almost no preparation.',
            'Gata în aproximativ 15 minute, aproape fără pregătiri.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'good_for',
          reason: t(
            'A small, warm bowl that is quick to make when you are hungry late.',
            'Un bol mic și cald, care se face repede când ți-e foame târziu.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Noodle carbohydrate and egg protein help you refuel.',
            'Carbohidrații din tăiței și proteinele din ou te ajută să-ți refaci energia.',
          ),
        },
      ],
    },
  ],
};
