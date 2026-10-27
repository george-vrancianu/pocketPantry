import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Ciorbă de praz base is a Romanian leek soup: onion, carrot and parsley
// root softened in oil, plenty of leek, a little rice, soured with borș and
// finished with fresh herbs. It is vegan without the optional sour cream. Each
// Variant is a full Recipe with its own lines, steps and guidance. The base's
// first Recipe-level Tip (leek grit) holds in both Variants. The second (leave
// out the sour cream) and the third (borș) are about the base only, so both
// Variants hide them.
export const ciorbaDePraz: BaseRecipeSeed = {
  slug: 'ciorba-de-praz',
  title: t(
    'Romanian leek sour soup with rice (ciorbă de praz)',
    'Ciorbă de praz cu orez',
  ),
  servings: 6,
  prepMinutes: 20,
  cookMinutes: 50,
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
      quantity: 100,
      unit: 'g',
      note: t('diced small', 'tăiată cubulețe'),
    },
    {
      ingredient: 'bell-pepper',
      quantity: 1,
      unit: 'pcs',
      note: t('seeded and diced', 'fără semințe, tăiat cubulețe'),
    },
    {
      ingredient: 'leek',
      quantity: 700,
      unit: 'g',
      note: t(
        'white and light green parts, trimmed weight, sliced into 1 cm rings and rinsed free of grit',
        'părțile albe și verde-deschis, greutate curățată, tăiate rondele de 1 cm și spălate de nisip',
      ),
    },
    {
      ingredient: 'tomato-paste',
      quantity: 20,
      unit: 'g',
      optional: true,
    },
    { ingredient: 'still-water', quantity: 2.3, unit: 'l' },
    {
      ingredient: 'rice',
      quantity: 80,
      unit: 'g',
      note: t('rinsed', 'spălat'),
    },
    {
      ingredient: 'salt',
      quantity: 20,
      unit: 'g',
      note: t(
        '15 g with the water, up to 5 g more to taste after the borș',
        '15 g odată cu apa, până la 5 g în plus după borș, după gust',
      ),
    },
    {
      ingredient: 'ciorba-sour-base',
      quantity: 500,
      unit: 'ml',
      note: t('borș, boiled separately', 'borș, fiert separat'),
    },
    {
      ingredient: 'dill',
      quantity: 30,
      unit: 'g',
      note: t('chopped', 'tocat'),
    },
    {
      ingredient: 'parsley',
      quantity: 30,
      unit: 'g',
      note: t('chopped', 'tocat'),
    },
    {
      ingredient: 'lovage',
      quantity: 15,
      unit: 'g',
      optional: true,
      note: t('chopped', 'tocat'),
    },
    {
      ingredient: 'sour-cream',
      quantity: 150,
      unit: 'g',
      optional: true,
      note: t('at the table', 'la masă'),
    },
    { ingredient: 'black-pepper' },
  ],
  steps: [
    {
      key: 'clean',
      text: t(
        'Trim the roots and the tough dark green tops off the leeks and halve them lengthwise. Rinse between the layers under running water, then slice into 1 cm rings. Dice the onions, carrot, parsley root and bell pepper, and chop the dill, parsley and the lovage, if using.',
        'Taie rădăcinile și vârfurile verzi și tari ale prazului și despică-l în două pe lungime. Spală-l printre foi sub jet de apă, apoi taie-l în rondele de 1 cm. Taie cubulețe ceapa, morcovul, rădăcina de pătrunjel și ardeiul și toacă mărarul, pătrunjelul și leușteanul, dacă folosești.',
      ),
    },
    {
      key: 'soften',
      text: t(
        'Heat the oil in a 5 l pot over medium heat. Add the onions, carrot and parsley root and cook, stirring, for 5 minutes until the onion is soft and translucent but not browned.',
        'Încinge uleiul într-o oală de 5 l la foc mediu. Adaugă ceapa, morcovul și rădăcina de pătrunjel și călește, amestecând, 5 minute, până când ceapa se înmoaie și devine sticloasă, fără să se rumenească.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'leeks',
      text: t(
        'Add the bell pepper and leeks. Cook, stirring often, for 8 minutes until the leeks wilt and turn glossy.',
        'Adaugă ardeiul și prazul. Gătește, amestecând des, 8 minute, până când prazul se înmoaie și devine lucios.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'paste',
      text: t(
        'If you use the tomato paste, stir it into the vegetables for 1 minute until it darkens slightly.',
        'Dacă folosești pasta de roșii, amestec-o printre legume 1 minut, până se închide ușor la culoare.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'simmer',
      text: t(
        'Pour in the water and 15 g of the salt and bring to the boil. Add the rinsed rice, lower the heat and simmer gently for 15 minutes, until the rice and leeks are tender.',
        'Toarnă apa și 15 g din sare și adu la fierbere. Adaugă orezul spălat, micșorează focul și fierbe încet 15 minute, până când orezul și prazul sunt moi.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'bors',
      text: t(
        'While the soup simmers, bring the borș to the boil in a small pan on its own.',
        'În timp ce ciorba fierbe, adu borșul la fierbere într-o cratiță mică, separat.',
      ),
    },
    {
      key: 'sour',
      text: t(
        'Once the rice and leeks are tender, pour in about 300 ml of the hot borș, bring back to the boil and simmer for 5 minutes. Taste, then add more borș up to the full 500 ml if you want it sourer. Add up to 5 g more salt if needed, and pepper.',
        'Când orezul și prazul sunt moi, toarnă aproximativ 300 ml din borșul fierbinte, adu la fierbere și fierbe 5 minute. Gustă, apoi adaugă încă borș, până la cei 500 ml, dacă vrei mai acră. Adaugă până la 5 g de sare, dacă e nevoie, și piper.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'finish',
      text: t(
        'Take the pot off the heat and stir in the dill, parsley and the lovage, if using. Ladle into bowls and serve hot, with a spoonful of sour cream if you like.',
        'Ia oala de pe foc și amestecă mărarul, pătrunjelul și leușteanul, dacă folosești. Servește în boluri, fierbinte, cu o lingură de smântână, dacă vrei.',
      ),
    },
    {
      key: 'store',
      text: t(
        'Cool leftovers and get them into the fridge within 2 hours. Eat them within 1 day, because the soup has rice in it, and reheat only once, until steaming hot all the way through.',
        'Răcește mâncarea rămasă și pune-o la frigider în cel mult 2 ore. Consum-o în decurs de o zi, pentru că ciorba conține orez, și încălzește-o o singură dată, până scoate aburi în toată masa.',
      ),
    },
  ],
  tips: [
    t(
      'Leeks hide soil between their layers. After cutting, swish the pieces in a big bowl of cold water, let the grit sink, and lift the leeks out by hand instead of pouring them into a colander.',
      'Prazul ascunde pământ printre foi. După ce l-ai tăiat, mișcă bucățile într-un castron mare cu apă rece, lasă nisipul să se depună și scoate prazul cu mâna, nu îl turna în strecurătoare.',
    ),
    t(
      'For a fasting-day pot, leave out the sour cream: it is the only animal product here.',
      'Pentru o ciorbă de post, nu pune smântâna: este singurul produs de origine animală de aici.',
    ),
    t(
      'Borș strength varies from brand to brand and from one home batch to another. Add it in two goes and taste in between; you can always add more, but you cannot take it out.',
      'Tăria borșului diferă de la o marcă la alta și de la un borș de casă la altul. Adaugă-l în două rânduri și gustă între ele; poți adăuga oricând, dar nu poți scoate.',
    ),
  ],
  stepTips: [
    {
      step: 'clean',
      text: t(
        'Save the tough dark green tops for the stock pot rather than throwing them away.',
        'Păstrează vârfurile verde-închis și tari ale prazului pentru supa de oase sau de legume, în loc să le arunci.',
      ),
    },
    {
      step: 'sour',
      text: t(
        'Add the borș only once the rice and leeks are tender: acid keeps them from softening any further.',
        'Adaugă borșul abia când orezul și prazul sunt moi: aciditatea îi împiedică să se mai înmoaie.',
      ),
    },
  ],
  nutritionNote: t(
    'A vegetable-heavy soup that is filling from the leeks and vegetables, with only about 2 teaspoons of sunflower oil per bowl. It is low in protein, so have beans, eggs or cheese on the side. Most of the salt comes from the added salt and the borș; sour cream adds saturated fat.',
    'O supă bogată în legume, care satură datorită prazului și legumelor, cu doar cam 2 lingurițe de ulei de floarea soarelui pe castron. Are puține proteine, așa că servește-o cu fasole, ouă sau brânză alături. Cea mai mare parte a sării vine din sarea adăugată și din borș; smântâna adaugă grăsimi saturate.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Bread', 'Pâine'),
      reason: t(
        'A slice with a firm crust adds chew and soaks up the sour broth.',
        'O felie cu crustă tare adaugă consistență și absoarbe supa acrișoară.',
      ),
      principle: 'contrast_texture',
      ingredient: 'bread',
    },
    {
      kind: 'food',
      label: t('Hot pepper', 'Ardei iute'),
      reason: t(
        'A bite of heat lifts the mild sweetness of the leeks and the sourness of the borș.',
        'Iuțeala scoate în evidență dulceața blândă a prazului și acreala borșului.',
      ),
      principle: 'complement_flavour',
      ingredient: 'hot-pepper',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot, sour soup warms you up, and with bread beside it, it keeps you full.',
        'O supă fierbinte și acrișoară te încălzește și, cu pâine alături, te satură.',
      ),
    },
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'Light on fat and easy to make in one pot.',
        'Are puțină grăsime și se face ușor, într-o singură oală.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'avoid',
      reason: t(
        'It has little protein for recovery unless you add beans or eggs on the side.',
        'Are puține proteine pentru refacere, dacă nu adaugi alături fasole sau ouă.',
      ),
    },
  ],
  variants: [
    {
      slug: 'ciorba-de-praz-german',
      cuisine: 'german',
      title: t(
        'Käse-Lauch-Suppe (German leek, minced meat and melted cheese soup)',
        'Käse-Lauch-Suppe (supă germană de praz cu carne tocată și brânză topită)',
      ),
      servings: 6,
      prepMinutes: 15,
      cookMinutes: 45,
      difficulty: 'easy',
      hideBaseTips: [1, 2],
      lines: [
        { ingredient: 'sunflower-oil', quantity: 30, unit: 'ml' },
        {
          ingredient: 'minced-mixed-meat',
          quantity: 500,
          unit: 'g',
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely diced', 'tăiată mărunt'),
        },
        {
          ingredient: 'leek',
          quantity: 800,
          unit: 'g',
          note: t(
            'white and light green parts, trimmed weight, sliced into 1 cm rings and rinsed free of grit',
            'părțile albe și verde-deschis, greutate curățată, tăiate rondele de 1 cm și spălate de nisip',
          ),
        },
        {
          ingredient: 'chicken-stock',
          quantity: 1200,
          unit: 'ml',
          note: t(
            'hot, made up as the pack directs',
            'fierbinte, preparată conform instrucțiunilor de pe ambalaj',
          ),
        },
        {
          ingredient: 'cheese-triangles',
          quantity: 200,
          unit: 'g',
          note: t(
            'processed cheese (triangles or a tub)',
            'brânză topită (triunghiuri sau cutie)',
          ),
        },
        {
          ingredient: 'cream-cheese',
          quantity: 100,
          unit: 'g',
          optional: true,
        },
        { ingredient: 'nutmeg', quantity: 0.5, unit: 'g', optional: true },
        { ingredient: 'salt' },
        { ingredient: 'black-pepper' },
      ],
      steps: [
        {
          key: 'clean',
          text: t(
            'Trim the roots and the tough dark green tops off the leeks and halve them lengthwise. Rinse between the layers under running water, then slice into 1 cm rings. Dice the onion. Do this before you open the mince.',
            'Taie rădăcinile și vârfurile verzi și tari ale prazului și despică-l în două pe lungime. Spală-l printre foi sub jet de apă, apoi taie-l în rondele de 1 cm. Taie ceapa cubulețe. Fă toate acestea înainte să desfaci carnea tocată.',
          ),
        },
        {
          key: 'mince',
          text: t(
            'Heat the oil in a 4 l pot over medium-high heat for 2 minutes. Add the mince and break it up with a wooden spoon. Straight away, wash your hands and anything the raw mince touched, such as the scissors, with hot soapy water, and bin the tray.',
            'Încinge uleiul într-o oală de 4 l la foc mediu-mare, 2 minute. Adaugă carnea tocată și sfărâm-o cu o lingură de lemn. Imediat, spală-ți mâinile și tot ce a atins carnea crudă, de exemplu foarfeca, cu apă caldă și săpun, și aruncă caserola.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'brown',
          text: t(
            'Cook the mince, stirring and breaking up lumps, for 8 minutes, until it is lightly browned, no pink is left and the juices run clear. Then wash the spoon and use a clean one from here.',
            'Gătește carnea tocată, amestecând și sfărâmând cocoloașele, 8 minute, până când se rumenește ușor, nu mai rămâne roz și zeama e limpede. Apoi spală lingura și folosește una curată în continuare.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'onion',
          text: t(
            'Add the onion and cook for 3 minutes until soft and translucent.',
            'Adaugă ceapa și călește 3 minute, până se înmoaie și devine sticloasă.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'leeks',
          text: t(
            'Add the leeks and cook, stirring often, for 5 minutes until they wilt and turn glossy.',
            'Adaugă prazul și gătește, amestecând des, 5 minute, până se înmoaie și devine lucios.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'simmer',
          text: t(
            'Pour in the hot stock and bring to the boil. Lower the heat and simmer for 15 minutes, until the leeks are very tender.',
            'Toarnă supa de pui fierbinte și adu la fierbere. Micșorează focul și fierbe încet 15 minute, până când prazul e foarte moale.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'melt',
          text: t(
            'Turn the heat to low. Add the processed cheese and the cream cheese, if using, in small pieces and stir for 3 minutes until melted and smooth. Keep the soup just below a simmer.',
            'Dă focul la minim. Adaugă brânza topită și, dacă folosești, brânza cremă, în bucăți mici și amestecă 3 minute, până se topesc și supa e fină. Ține supa chiar sub punctul de fierbere.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'season',
          text: t(
            'Taste and season with pepper, the nutmeg if you like, and salt only if needed. Heat for 2 minutes more until steaming hot and serve with baguette.',
            'Gustă și condimentează cu piper, cu nucșoară, dacă vrei, și cu sare doar dacă e nevoie. Încălzește încă 2 minute, până scoate aburi, și servește cu baghetă.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'store',
          text: t(
            'Cool leftovers and get them into the fridge within 2 hours. Eat them within 3 to 4 days and reheat gently until steaming hot all the way through.',
            'Răcește mâncarea rămasă și pune-o la frigider în cel mult 2 ore. Consum-o în 3-4 zile și încălzește-o încet, până scoate aburi în toată masa.',
          ),
        },
      ],
      tips: [
        t(
          'Taste before you salt. The stock and the processed cheese are both salty, so the soup often needs none.',
          'Gustă înainte să sărezi. Supa concentrată și brânza topită sunt sărate, așa că adesea supa nu mai are nevoie de sare.',
        ),
      ],
      stepTips: [
        {
          step: 'melt',
          text: t(
            'Cut or break the cheese small and add it on low heat. It melts evenly that way and does not turn grainy.',
            'Taie sau rupe brânza mărunt și adaug-o pe foc mic. Așa se topește uniform și supa nu devine grunjoasă.',
          ),
        },
      ],
      nutritionNote: t(
        'Filling, with protein from the meat and cheese, and fibre from plenty of leek. It is rich: the mince, processed cheese and cream cheese bring saturated fat, and the stock and cheese make it salty. Serve a smaller bowl with a green salad.',
        'Satură, cu proteine din carne și brânză și fibre din mult praz. E bogată: carnea tocată, brânza topită și brânza cremă aduc grăsimi saturate, iar supa de pui și brânza o fac sărată. Servește un bol mai mic, cu o salată verde.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Baguette', 'Baghetă'),
          reason: t(
            'The crisp crust gives the creamy, soft soup something to bite against.',
            'Crusta crocantă oferă supei cremoase și moi un contrast la mestecat.',
          ),
          principle: 'contrast_texture',
          ingredient: 'baguette',
        },
        {
          kind: 'food',
          label: t(
            'Green salad with a sharp dressing',
            'Salată verde cu sos acrișor',
          ),
          reason: t(
            'The acidity cuts through the cheese and meat.',
            'Aciditatea taie din bogăția brânzei și a cărnii.',
          ),
          principle: 'acid_cuts_fat',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, creamy bowl that stays with you for hours.',
            'Un castron fierbinte și cremos, care te ține sătul ore în șir.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'avoid',
          reason: t(
            'It is rich with meat and cheese, so it is heavy for a light lunch.',
            'E bogată în carne și brânză, deci prea grea pentru un prânz ușor.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Rich and salty, which may sit heavily before bed.',
            'Bogată și sărată, poate cădea greu înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'ciorba-de-praz-turkish',
      cuisine: 'turkish',
      title: t(
        'Zeytinyağlı pırasa (Turkish leeks braised in olive oil with carrot and rice)',
        'Zeytinyağlı pırasa (praz înăbușit în ulei de măsline, cu morcov și orez, în stil turcesc)',
      ),
      servings: 4,
      prepMinutes: 50,
      cookMinutes: 40,
      difficulty: 'easy',
      hideBaseTips: [1, 2],
      lines: [
        { ingredient: 'olive-oil', quantity: 60, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'halved and thinly sliced',
            'tăiată în două și feliată subțire',
          ),
        },
        {
          ingredient: 'carrot',
          quantity: 150,
          unit: 'g',
          note: t('cut into 1 cm half-moons', 'tăiați semilune de 1 cm'),
        },
        {
          ingredient: 'leek',
          quantity: 800,
          unit: 'g',
          note: t(
            'white and light green parts, trimmed weight, cut into 4 cm chunks and rinsed free of grit',
            'părțile albe și verde-deschis, greutate curățată, tăiate bucăți de 4 cm și spălate de nisip',
          ),
        },
        {
          ingredient: 'rice',
          quantity: 30,
          unit: 'g',
          note: t('rinsed', 'spălat'),
        },
        { ingredient: 'sugar', quantity: 5, unit: 'g' },
        {
          ingredient: 'salt',
          quantity: 6,
          unit: 'g',
          note: t(
            '5 g with the leeks, up to 1 g more to taste',
            '5 g peste praz, până la 1 g în plus, după gust',
          ),
        },
        { ingredient: 'still-water', quantity: 0.25, unit: 'l' },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'half squeezed into the pan, half in wedges for serving',
            'jumătate stoarsă în tigaie, jumătate tăiată felii, pentru servire',
          ),
        },
      ],
      steps: [
        {
          key: 'clean',
          text: t(
            'Trim the roots and the tough dark green tops off the leeks and halve them lengthwise. Rinse between the layers under running water, then cut into 4 cm chunks. Slice the onion, cut the carrot into half-moons and rinse the rice.',
            'Taie rădăcinile și vârfurile verzi și tari ale prazului și despică-l în două pe lungime. Spală-l printre foi sub jet de apă, apoi taie-l în bucăți de 4 cm. Feliază ceapa, taie morcovul semilune și spală orezul.',
          ),
        },
        {
          key: 'onion',
          text: t(
            'Heat the olive oil in a 28 cm lidded sauté pan over medium heat. Add the onion and cook for 4 minutes until soft and translucent.',
            'Încinge uleiul de măsline într-o tigaie adâncă de 28 cm, cu capac, la foc mediu. Adaugă ceapa și călește 4 minute, până se înmoaie și devine sticloasă.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'carrot',
          text: t(
            'Add the carrot and cook for 3 minutes, stirring, until it begins to soften at the edges.',
            'Adaugă morcovul și gătește 3 minute, amestecând, până începe să se înmoaie la margini.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'rice',
          text: t(
            'Stir in the rice for 1 minute until the grains are coated in oil.',
            'Amestecă orezul 1 minut, până când boabele sunt acoperite de ulei.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'arrange',
          text: t(
            'Lay the leek chunks in an even, snug layer on the vegetables. Sprinkle with the sugar and 5 g of the salt, pour the water around them and bring to a simmer.',
            'Așază bucățile de praz într-un strat uniform, strâns, peste legume. Presară zahărul și 5 g din sare, toarnă apa pe lângă ele și adu la fierbere ușoară.',
          ),
        },
        {
          key: 'braise',
          text: t(
            'Cover, lower the heat and braise for 25 minutes, until a knife slides easily into the leeks and the carrot and rice are tender. At 20 minutes, check the pan: if it is dry, add 50 ml of water.',
            'Acoperă, micșorează focul și înăbușă 25 de minute, până când cuțitul intră ușor în praz, iar morcovul și orezul sunt moi. La 20 de minute verifică tigaia: dacă s-a uscat, adaugă 50 ml de apă.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'more',
          text: t(
            'If the leeks are still firm, cover and cook 5 minutes more; otherwise skip this step.',
            'Dacă prazul e încă tare, acoperă și mai gătește 5 minute; altfel treci peste acest pas.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'lemon',
          text: t(
            'Take the pan off the heat. Squeeze in the juice of half the lemon, shake the pan gently and taste, adding up to 1 g more salt or a little more lemon if needed.',
            'Ia tigaia de pe foc. Stoarce sucul de la jumătate de lămâie, mișcă ușor tigaia și gustă, adăugând până la 1 g de sare sau puțină lămâie în plus, dacă e nevoie.',
          ),
        },
        {
          key: 'cool',
          text: t(
            'Leave it to cool for about 30 minutes, then serve just warm, within the hour, with the remaining lemon in wedges.',
            'Lasă preparatul să se răcească aproximativ 30 de minute, apoi servește-l călduț, în decurs de o oră, cu restul lămâii tăiat felii.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Put whatever is not eaten in the fridge within 1 hour of cooking and eat them within 1 day, because the dish has rice in it. Eat them cold, or reheat once until steaming hot all the way through.',
            'Ce nu se mănâncă pune-l la frigider în cel mult o oră de la gătire și consum-o în decurs de o zi, pentru că preparatul conține orez. O poți mânca rece sau o poți încălzi o singură dată, până scoate aburi în toată masa.',
          ),
        },
      ],
      tips: [
        t(
          'Keep the leeks in an even, snug layer under a tight lid: they cook in their own juice, so you need very little water.',
          'Ține prazul într-un strat uniform, strâns, sub un capac bine închis: se gătește în zeama lui, așa că ai nevoie de foarte puțină apă.',
        ),
      ],
      stepTips: [
        {
          step: 'arrange',
          text: t(
            'The pinch of sugar rounds off the leeks and the lemon rather than making the dish sweet.',
            'Praful de zahăr rotunjește gustul prazului și al lămâii, fără să facă preparatul dulce.',
          ),
        },
      ],
      nutritionNote: t(
        'A light, mostly vegetable dish. The olive oil is mostly unsaturated fat but it brings a large share of the calories, and the dish is low in protein. The leeks and carrot give fibre; the small amount of rice and sugar adds only a little carbohydrate.',
        'Un preparat ușor, în mare parte din legume. Uleiul de măsline conține în principal grăsimi nesaturate, dar aduce o mare parte din calorii, iar preparatul are puține proteine. Prazul și morcovul aduc fibre; orezul și zahărul în cantități mici adaugă doar puțini carbohidrați.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Yogurt', 'Iaurt'),
          reason: t(
            'A spoonful of cool, tangy yogurt adds creaminess and protein to the soft leeks.',
            'O lingură de iaurt rece și acrișor adaugă cremozitate și proteine prazului moale.',
          ),
          principle: 'complement_flavour',
          ingredient: 'yogurt',
        },
        {
          kind: 'food',
          label: t('Bread', 'Pâine'),
          reason: t(
            'A slice with a firm crust is good for mopping up the olive oil and juices.',
            'O felie cu crustă tare e bună pentru a aduna uleiul de măsline și zeama.',
          ),
          principle: 'contrast_texture',
          ingredient: 'bread',
        },
      ],
      eatingMoments: [
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Served just warm or cold from the fridge, it is light and refreshing.',
            'Servit călduț sau rece, din frigider, este ușor și răcoritor.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Mostly vegetables, so it is light; add yogurt and bread to make it a meal.',
            'În mare parte legume, deci ușor; adaugă iaurt și pâine ca să fie o masă completă.',
          ),
        },
      ],
    },
  ],
};
