import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Ciorbă de ciuperci base is the Romanian vegan mushroom soup: softened
// vegetables, mushrooms cooked until their liquid is gone, potatoes, then borș
// added once the potatoes are tender, and plenty of dill. Sour cream is only an
// optional extra at the table. Each Variant is a full Recipe with its own lines,
// steps and guidance. The base's Recipe-level Tips are about borș (0) and
// leftovers (1); neither holds for the velouté (no borș, cream) or the tom yum
// (no borș, shorter keeping), so both Variants hide 0 and 1 and have their own.
export const ciorbaDeCiuperci: BaseRecipeSeed = {
  slug: 'ciorba-de-ciuperci',
  title: t(
    'Romanian mushroom sour soup with dill (ciorbă de ciuperci)',
    'Ciorbă de ciuperci cu mărar',
  ),
  servings: 6,
  prepMinutes: 30,
  cookMinutes: 50,
  difficulty: 'easy',
  lines: [
    { ingredient: 'sunflower-oil', quantity: 50, unit: 'ml' },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('diced', 'tăiate cubulețe'),
    },
    {
      ingredient: 'carrot',
      quantity: 150,
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
      ingredient: 'bell-pepper',
      quantity: 1,
      unit: 'pcs',
      note: t('red, diced', 'roșu, tăiat cubulețe'),
    },
    {
      ingredient: 'button-mushrooms',
      quantity: 600,
      unit: 'g',
      note: t(
        'wiped clean, sliced 5 mm thick',
        'curățate cu o cârpă umedă, tăiate felii de 5 mm',
      ),
    },
    { ingredient: 'still-water', quantity: 2.2, unit: 'l' },
    {
      ingredient: 'potato',
      quantity: 0.5,
      unit: 'kg',
      note: t('peeled, in 1.5 cm cubes', 'curățați, tăiați cubulețe de 1,5 cm'),
    },
    {
      ingredient: 'tomato',
      quantity: 200,
      unit: 'g',
      note: t('diced', 'tăiate cubulețe'),
    },
    {
      ingredient: 'ciorba-sour-base',
      quantity: 500,
      unit: 'ml',
      note: t('to taste, see the steps', 'după gust, vezi pașii'),
    },
    {
      ingredient: 'dill',
      quantity: 30,
      unit: 'g',
      note: t('chopped', 'tocat'),
    },
    {
      ingredient: 'parsley',
      quantity: 15,
      unit: 'g',
      note: t('chopped', 'tocat'),
    },
    { ingredient: 'salt', quantity: 12, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
    {
      ingredient: 'sour-cream',
      quantity: 150,
      unit: 'g',
      optional: true,
      note: t('for the table', 'pentru masă'),
    },
    {
      ingredient: 'hot-pepper',
      quantity: 1,
      unit: 'pcs',
      optional: true,
      note: t('for the table', 'pentru masă'),
    },
  ],
  steps: [
    {
      key: 'vegetables',
      text: t(
        'Heat the oil in a pot of at least 5 l over medium heat. Add the onions, carrot, parsley root and bell pepper and cook, stirring now and then, for about 7 minutes until soft but not browned.',
        'Încinge uleiul într-o oală de cel puțin 5 l la foc mediu. Adaugă ceapa, morcovul, rădăcina de pătrunjel și ardeiul și călește-le, amestecând din când în când, circa 7 minute, până se înmoaie, fără să se rumenească.',
      ),
      timerSeconds: 420,
    },
    {
      key: 'mushrooms',
      text: t(
        'Turn the heat to high, add the mushrooms and cook for about 9 minutes until the liquid they release has boiled away and they are lightly golden.',
        'Dă focul la maxim, adaugă ciupercile și gătește-le circa 9 minute, până se evaporă zeama pe care o lasă și se rumenesc ușor.',
      ),
      timerSeconds: 540,
    },
    {
      key: 'boil',
      text: t(
        'Pour in the water, add the potatoes and 6 g of the salt, and bring to the boil, then lower the heat to a gentle simmer.',
        'Toarnă apa, adaugă cartofii și 6 g din sare și adu la fierbere, apoi dă focul mic, ca ciorba să fiarbă domol.',
      ),
    },
    {
      key: 'simmer',
      text: t('Simmer for 15 minutes.', 'Fierbe domol 15 minute.'),
      timerSeconds: 900,
    },
    {
      key: 'bors',
      text: t(
        'While the soup simmers, bring the borș to the boil in a small pan and boil it for 2 minutes. Keep it hot.',
        'În timp ce ciorba fierbe, adu borșul la fiert într-o cratiță mică și fierbe-l 2 minute. Ține-l fierbinte.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'tomatoes',
      text: t(
        'Add the tomatoes and simmer for 5 more minutes, until a knife slides easily into a potato cube. If the potatoes are still firm, simmer on and check every 5 minutes.',
        'Adaugă roșiile și fierbe încă 5 minute, până când un cuțit intră ușor într-un cub de cartof. Dacă cartofii sunt încă tari, mai fierbe și verifică din 5 în 5 minute.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'sour',
      text: t(
        'Stir in half of the hot borș, taste, and add more a little at a time until the soup is pleasantly sour. Simmer for 5 minutes, then add the remaining 6 g of salt, or less, to taste.',
        'Toarnă jumătate din borșul fierbinte, amestecă și gustă; adaugă restul puțin câte puțin, până ciorba e acrișoară pe gustul tău. Mai fierbe 5 minute, apoi adaugă restul de 6 g de sare, sau mai puțin, după gust.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'finish',
      text: t(
        'Take the pot off the heat and stir in the dill, parsley and black pepper. Taste once more.',
        'Ia oala de pe foc și amestecă mărarul, pătrunjelul și piperul. Mai gustă o dată.',
      ),
    },
    {
      key: 'serve',
      text: t(
        'Ladle into bowls. Put the sour cream and the hot pepper on the table for anyone who wants them.',
        'Servește în boluri. Pune pe masă smântâna și ardeiul iute pentru cine le vrea.',
      ),
    },
  ],
  tips: [
    t(
      'Borș differs a lot from one jar or bottle to the next, so add it gradually and taste. Add it only once the potatoes are tender: acid keeps them firm.',
      'Borșul diferă mult de la un borcan sau o sticlă la alta, așa că adaugă-l treptat și gustă. Pune-l abia după ce cartofii s-au înmuiat: acidul îi ține tari.',
    ),
    t(
      'Cool leftovers and get them into the fridge within 2 hours. Keep for 3 to 4 days and reheat until steaming hot. Add sour cream to the bowl, not to the pot.',
      'Răcește ciorba rămasă și pune-o la frigider în cel mult 2 ore. Se ține 3-4 zile; încălzește-o până scoate aburi. Smântâna pune-o în farfurie, nu în oală.',
    ),
  ],
  stepTips: [
    {
      step: 'mushrooms',
      text: t(
        'Let the mushrooms sit for a minute between stirs. Constant stirring keeps them steaming instead of colouring, and the colour is where the flavour comes from.',
        'Lasă ciupercile un minut între amestecări. Dacă le amesteci mereu, se aburesc în loc să se rumenească, iar rumeneala le dă gustul.',
      ),
    },
  ],
  nutritionNote: t(
    'Mushrooms, potatoes and root vegetables make a filling bowl with fibre and little saturated fat, since the sunflower oil is mostly unsaturated. Salt is the main thing to watch; add the second half only after tasting. Without the optional sour cream it is vegan; the cream adds saturated fat.',
    'Ciupercile, cartofii și legumele rădăcinoase fac o ciorbă sățioasă, cu fibre și puține grăsimi saturate, fiindcă uleiul de floarea-soarelui e în mare parte nesaturat. Sarea e de urmărit; pune a doua jumătate abia după ce guști. Fără smântâna opțională e vegană; smântâna adaugă grăsimi saturate.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Fresh bread', 'Pâine proaspătă'),
      reason: t(
        'Soft bread soaks up the sour mushroom broth.',
        'Pâinea moale se înmoaie în zeama acrișoară, cu aromă de ciuperci.',
      ),
      principle: 'contrast_texture',
      ingredient: 'bread',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot, sour soup warms you up.',
        'O supă fierbinte și acrișoară te încălzește.',
      ),
    },
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'Meatless and vegetable-rich, it fills you without sitting heavy.',
        'Fără carne și bogată în legume, te satură fără să cadă greu.',
      ),
    },
  ],
  variants: [
    {
      slug: 'ciorba-de-ciuperci-french',
      cuisine: 'french',
      title: t(
        'Velouté de champignons (French cream of mushroom soup)',
        'Velouté de champignons (supă-cremă franțuzească de ciuperci)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 40,
      difficulty: 'easy',
      hideBaseTips: [0, 1],
      lines: [
        { ingredient: 'butter', quantity: 40, unit: 'g' },
        {
          ingredient: 'shallot',
          quantity: 100,
          unit: 'g',
          note: t('finely chopped', 'tocate mărunt'),
        },
        {
          ingredient: 'button-mushrooms',
          quantity: 500,
          unit: 'g',
          note: t(
            'wiped clean, sliced 5 mm thick',
            'curățate cu o cârpă umedă, tăiate felii de 5 mm',
          ),
        },
        {
          ingredient: 'garlic',
          quantity: 6,
          unit: 'g',
          note: t('2 cloves, crushed', '2 căței, zdrobiți'),
        },
        {
          ingredient: 'thyme',
          quantity: 2,
          unit: 'g',
          note: t('a few sprigs', 'câteva crenguțe'),
        },
        { ingredient: 'flour', quantity: 25, unit: 'g' },
        {
          ingredient: 'vegetable-stock',
          quantity: 700,
          unit: 'ml',
          note: t('hot', 'fierbinte'),
        },
        { ingredient: 'whipping-cream', quantity: 150, unit: 'ml' },
        { ingredient: 'nutmeg', quantity: 0.5, unit: 'g' },
        { ingredient: 'salt', quantity: 3, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 0.5, unit: 'g' },
        {
          ingredient: 'parsley',
          quantity: 5,
          unit: 'g',
          note: t('chopped, to serve', 'tocat, pentru servit'),
        },
      ],
      steps: [
        {
          key: 'shallots',
          text: t(
            'Melt the butter in a wide pot over medium heat. Add the shallots and cook for about 4 minutes until soft and translucent but not coloured.',
            'Topește untul într-o oală lată la foc mediu. Adaugă șalotele și gătește-le circa 4 minute, până se înmoaie și devin translucide, fără să se rumenească.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'mushrooms',
          text: t(
            'Turn the heat to high, add the mushrooms and cook for about 9 minutes until the liquid they release has boiled away and they are golden at the edges.',
            'Dă focul la maxim, adaugă ciupercile și gătește-le circa 9 minute, până se evaporă zeama pe care o lasă și se rumenesc pe margini.',
          ),
          timerSeconds: 540,
        },
        {
          key: 'aromatics',
          text: t(
            'Lower the heat to medium. Add the garlic and thyme and stir for 1 minute until fragrant.',
            'Dă focul la mediu. Adaugă usturoiul și cimbrișorul și amestecă 1 minut, până se simte aroma.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'flour',
          text: t(
            'Sprinkle in the flour and stir for 90 seconds so it cooks without browning.',
            'Presară făina și amestecă 90 de secunde, ca să se gătească fără să se rumenească.',
          ),
          timerSeconds: 90,
        },
        {
          key: 'stock',
          text: t(
            'Pour in the hot stock a little at a time, stirring so no lumps form. Bring to the boil, then lower the heat and simmer, partly covered, for 15 minutes.',
            'Toarnă supa fierbinte puțin câte puțin, amestecând ca să nu se formeze cocoloașe. Adu la fierbere, apoi dă focul mic și fierbe domol, cu oala pe jumătate acoperită, 15 minute.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'blend',
          text: t(
            'Take out the thyme stalks. Blend the soup smooth with an immersion blender, or in a blender filled no more than half at a time, holding the lid down with a cloth.',
            'Scoate crenguțele de cimbrișor. Pasează supa cu un blender vertical până devine fină, sau într-un blender obișnuit umplut cel mult pe jumătate o dată, ținând capacul apăsat cu un prosop.',
          ),
        },
        {
          key: 'cream',
          text: t(
            'If you used a blender, return the soup to the pot. Stir in the cream and warm it over low heat for about 3 minutes until steaming, without letting it boil hard.',
            'Dacă ai folosit un blender obișnuit, pune supa înapoi în oală. Adaugă frișca și încălzește-o la foc mic circa 3 minute, până scoate aburi, fără să fiarbă tare.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'season',
          text: t(
            'Stir in the nutmeg, salt and pepper, then taste and adjust.',
            'Amestecă nucșoara, sarea și piperul, apoi gustă și corectează.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Ladle into warm bowls and scatter with the parsley.',
            'Servește în boluri calde și presară pătrunjelul.',
          ),
        },
      ],
      tips: [
        t(
          'If the soup is too thick, loosen it with a splash of hot stock or water; it also thickens as it stands.',
          'Dacă supa e prea groasă, diluează-o cu puțină supă fierbinte sau apă; se mai îngroașă și pe măsură ce stă.',
        ),
        t(
          'Cool leftovers and get them into the fridge within 2 hours. Keep for up to 3 days and reheat gently until steaming, without boiling hard.',
          'Răcește supa rămasă și pune-o la frigider în cel mult 2 ore. Se ține până la 3 zile; încălzește-o încet, până scoate aburi, fără să fiarbă tare.',
        ),
      ],
      stepTips: [
        {
          step: 'mushrooms',
          text: t(
            'At first they release a lot of liquid; keep the heat high until it has boiled off, then stir only now and then so they can turn golden.',
            'La început lasă multă zeamă; ține focul mare până se evaporă, apoi amestecă doar din când în când, ca să se rumenească.',
          ),
        },
      ],
      nutritionNote: t(
        'Mushrooms and shallots give flavour and some fibre for few calories. The butter and cream bring a lot of saturated fat, so use less cream for a lighter bowl. The stock and added salt can make it salty. It has little starch or protein, so it is not very filling on its own.',
        'Ciupercile și șalotele dau gust și ceva fibre, cu puține calorii. Untul și frișca aduc multe grăsimi saturate, deci pune mai puțină frișcă pentru un castron mai ușor. Supa de legume și sarea adăugată o pot face sărată. Are puțin amidon și puține proteine, așa că singură nu prea satură.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Baguette', 'Baghetă'),
          reason: t(
            'Crisp slices give the smooth soup something to bite against.',
            'Feliile crocante dau supei fine ceva de mestecat.',
          ),
          principle: 'contrast_texture',
          ingredient: 'baguette',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its acidity lifts the cream and butter.',
            'Aciditatea lui echilibrează frișca și untul.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'white-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A creamy, hot soup warms you up.',
            'O supă cremoasă și fierbinte te încălzește.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'The butter and cream sit heavy before bed.',
            'Untul și frișca cad greu înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'ciorba-de-ciuperci-thai',
      cuisine: 'thai',
      title: t(
        'Tom yum het (Thai hot and sour mushroom soup)',
        'Tom yum het (supă thailandeză iute și acră, cu ciuperci)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 15,
      difficulty: 'easy',
      hideBaseTips: [0, 1],
      lines: [
        { ingredient: 'still-water', quantity: 1.2, unit: 'l' },
        {
          ingredient: 'lemongrass',
          quantity: 40,
          unit: 'g',
          note: t(
            '2 stalks, bruised and cut in 5 cm lengths',
            '2 tulpini, lovite și tăiate bucăți de 5 cm',
          ),
        },
        {
          ingredient: 'galangal',
          quantity: 30,
          unit: 'g',
          note: t('in thin slices', 'tăiat felii subțiri'),
        },
        {
          ingredient: 'makrut-lime-leaves',
          quantity: 6,
          unit: 'g',
          note: t('about 6, torn', 'circa 6, rupte'),
        },
        {
          ingredient: 'shallot',
          quantity: 60,
          unit: 'g',
          note: t('halved', 'tăiate pe jumătate'),
        },
        {
          ingredient: 'oyster-mushrooms',
          quantity: 300,
          unit: 'g',
          note: t('torn in strips by hand', 'rupte cu mâna în fâșii'),
        },
        {
          ingredient: 'tomato',
          quantity: 200,
          unit: 'g',
          note: t('in wedges', 'tăiate în sferturi'),
        },
        { ingredient: 'fish-sauce', quantity: 45, unit: 'ml' },
        {
          ingredient: 'lime',
          quantity: 2,
          unit: 'pcs',
          note: t('juiced', 'stoarse'),
        },
        {
          ingredient: 'birds-eye-chilli',
          quantity: 3,
          unit: 'pcs',
          note: t('lightly crushed', 'zdrobite ușor'),
        },
        {
          ingredient: 'coriander',
          quantity: 15,
          unit: 'g',
          note: t('roughly chopped', 'tocat grosier'),
        },
      ],
      steps: [
        {
          key: 'prep',
          text: t(
            'Bruise the lemongrass with the back of a knife and cut it in 5 cm lengths. Slice the galangal, tear the lime leaves, halve the shallots, tear the mushrooms in strips, cut the tomatoes in wedges, chop the coriander and lightly crush the chillies. Wash your hands after handling the chillies and keep them away from your eyes.',
            'Lovește lemongrassul cu spatele cuțitului și taie-l bucăți de 5 cm. Feliază galangalul, rupe frunzele de lămâi kaffir, taie șalotele pe jumătate, rupe ciupercile în fâșii, taie roșiile în sferturi, toacă coriandrul și zdrobește ușor ardeii iuți. Spală-te pe mâini după ce atingi ardeii și ține-i departe de ochi.',
          ),
        },
        {
          key: 'broth',
          text: t(
            'Put the water, lemongrass, galangal, lime leaves and shallots in a pot. Bring to the boil, then simmer for 5 minutes so the aromatics flavour the water.',
            'Pune apa, lemongrassul, galangalul, frunzele de lămâi kaffir și șalotele într-o oală. Adu la fierbere, apoi fierbe domol 5 minute, ca aromele să treacă în apă.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'mushrooms',
          text: t(
            'Add the mushrooms and tomatoes and simmer for 3 minutes, until the mushrooms are soft and the tomato wedges have just started to soften.',
            'Adaugă ciupercile și roșiile și fierbe domol 3 minute, până se înmoaie ciupercile, iar roșiile abia încep să se moaie.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'sour',
          text: t(
            'Take the pot off the heat. Stir in 30 ml of the fish sauce and all the lime juice, taste, and add the rest of the fish sauce (or a little more lime) until salty and sour are in balance.',
            'Ia oala de pe foc. Amestecă 30 ml din sosul de pește și tot sucul de lime, gustă și adaugă restul de sos de pește (sau puțin lime în plus), până sărătura și aciditatea se echilibrează.',
          ),
        },
        {
          key: 'chilli',
          text: t(
            'Stir in the crushed chillies and the coriander.',
            'Amestecă ardeii iuți zdrobiți și coriandrul.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Ladle into bowls. The lemongrass, galangal and lime leaves are there for flavour and are not eaten; push them to the side of the bowl.',
            'Servește în boluri. Lemongrassul, galangalul și frunzele de kaffir sunt doar pentru aromă și nu se mănâncă; dă-le la o parte în bol.',
          ),
        },
      ],
      tips: [
        t(
          'Fish sauces differ in saltiness, so hold back the last 15 ml and add it only if the soup needs it.',
          'Sosurile de pește diferă ca sărătură, așa că păstrează ultimii 15 ml și pune-i doar dacă ciorba are nevoie.',
        ),
        t(
          'Best eaten the day it is made. Cool leftovers and get them into the fridge within 2 hours, keep for up to 2 days and reheat until steaming hot.',
          'Se mănâncă cel mai bine în ziua în care e făcută. Răcește supa rămasă și pune-o la frigider în cel mult 2 ore; se ține până la 2 zile, iar la servire se încălzește până scoate aburi.',
        ),
      ],
      stepTips: [
        {
          step: 'sour',
          text: t(
            'Add the lime juice off the heat: boiling dulls its fresh aroma and can make it taste bitter.',
            'Pune sucul de lime după ce iei oala de pe foc: dacă fierbe, își pierde aroma proaspătă și se poate amărî.',
          ),
        },
      ],
      nutritionNote: t(
        'A light, clear soup: mushrooms and tomato bring a little fibre and almost no fat. The fish sauce is the main source of salt and is very salty, so go easy if you watch your salt. It has little starch or protein, so serve it with rice for a full meal.',
        'O supă ușoară și limpede: ciupercile și roșiile aduc puține fibre și aproape deloc grăsime. Sosul de pește e sursa principală de sare și e foarte sărat, deci pune cu măsură dacă ai grijă la sare. Are puțin amidon și puține proteine, așa că servește-o cu orez pentru o masă completă.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Jasmine rice', 'Orez jasmine'),
          reason: t(
            'Plain rice turns the soup into a meal and softens the heat.',
            'Orezul simplu face din supă o masă completă și mai domolește iuțeala.',
          ),
          principle: 'complement_flavour',
          ingredient: 'jasmine-rice',
        },
        {
          kind: 'drink',
          label: t('Beer', 'Bere'),
          reason: t(
            'A cold, light beer refreshes between hot, sour spoonfuls.',
            'O bere rece și ușoară te răcorește între lingurile de supă iute și acră.',
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
            'Clear and low in fat; with a bowl of rice it makes a lunch that does not sit heavy.',
            'Limpede și cu puțină grăsime; cu un bol de orez e un prânz care nu cade greu.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'The chilli and hot broth warm you up.',
            'Ardeiul iute și zeama fierbinte te încălzesc.',
          ),
        },
      ],
    },
  ],
};
