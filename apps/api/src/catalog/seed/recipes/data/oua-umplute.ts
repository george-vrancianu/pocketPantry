import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Ouă umplute base is the Romanian cold starter: hard-boiled eggs filled
// with a herb, butter and mustard yolk cream (no liver pâté, so no liver
// warning is needed). Each Variant is a full Recipe with its own lines, steps
// and guidance; the base's Recipe-level Tips are inherited unless hidden.
export const ouaUmplute: BaseRecipeSeed = {
  slug: 'oua-umplute',
  title: t(
    'Romanian stuffed eggs with mustard and herbs (ouă umplute)',
    'Ouă umplute cu muștar și verdeață',
  ),
  servings: 6,
  prepMinutes: 55,
  cookMinutes: 18,
  difficulty: 'easy',
  lines: [
    { ingredient: 'eggs', quantity: 6, unit: 'pcs' },
    {
      ingredient: 'butter',
      quantity: 30,
      unit: 'g',
      note: t('soft', 'moale'),
    },
    { ingredient: 'mustard', quantity: 10, unit: 'g' },
    {
      ingredient: 'mayonnaise',
      key: 'mayonnaise-filling',
      quantity: 30,
      unit: 'g',
      note: t('for the filling', 'pentru umplutură'),
    },
    {
      ingredient: 'mayonnaise',
      key: 'mayonnaise-top',
      quantity: 10,
      unit: 'g',
      note: t('for the dots on top', 'pentru buline deasupra'),
    },
    {
      ingredient: 'dill',
      quantity: 5,
      unit: 'g',
      note: t('finely chopped', 'tocat mărunt'),
    },
    {
      ingredient: 'parsley',
      quantity: 5,
      unit: 'g',
      note: t(
        'finely chopped; keep 12 small leaves for the top',
        'tocat mărunt; păstrează 12 frunzulițe pentru decor',
      ),
    },
    { ingredient: 'salt', quantity: 1, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 0.5, unit: 'g' },
    {
      ingredient: 'olives',
      quantity: 20,
      unit: 'g',
      optional: true,
      note: t('pitted, in thin slices', 'fără sâmburi, felii subțiri'),
    },
    {
      ingredient: 'paprika',
      quantity: 0.5,
      unit: 'g',
      optional: true,
      note: t('to dust on top', 'pentru pudrat deasupra'),
    },
  ],
  steps: [
    {
      key: 'cover',
      text: t(
        'Lay the eggs in a single layer in a saucepan, cover with cold water by about 2 cm and bring to the boil over high heat; this takes about 8 minutes. Use eggs with clean, uncracked shells (do not wash them) and wash your hands after handling the raw eggs.',
        'Pune ouăle într-un singur strat într-o cratiță, acoperă-le cu apă rece cam 2 cm deasupra și adu la fierbere la foc mare; durează aproximativ 8 minute. Folosește ouă cu coaja curată și nefisurată (nu le spăla) și spală-te pe mâini după ce le-ai atins crude.',
      ),
    },
    {
      key: 'boil',
      text: t(
        'As soon as the water boils, turn the heat down to a gentle boil and cook the eggs for 10 minutes, until the yolk is completely hard with no soft centre, which also makes them safe for children, older people and anyone pregnant.',
        'Imediat ce apa fierbe, redu focul la o fierbere domoală și fierbe ouăle 10 minute, până când gălbenușul e complet tare, fără centru moale, ceea ce le face sigure și pentru copii, vârstnici și gravide.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'cool',
      text: t(
        'Lift the eggs into a bowl of cold water and leave them for 10 minutes, adding fresh cold water once or twice, until you can hold them comfortably.',
        'Mută ouăle într-un bol cu apă rece și lasă-le 10 minute, adăugând apă rece de una-două ori, până se pot ține ușor în mână.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'peel',
      text: t(
        'Tap each egg all over on the counter, peel it under a thin stream of cold water, then cut it in half lengthwise with a sharp, wet knife.',
        'Lovește ușor fiecare ou pe blat, curăță-l sub un fir subțire de apă rece, apoi taie-l în două pe lungime cu un cuțit ascuțit și umed.',
      ),
    },
    {
      key: 'yolks',
      text: t(
        'Pop the yolks into a bowl and mash them with a fork into fine crumbs. Lay the whites on a plate, cut side up.',
        'Scoate gălbenușurile într-un bol și zdrobește-le cu furculița până devin firimituri fine. Așază albușurile pe o farfurie, cu partea tăiată în sus.',
      ),
    },
    {
      key: 'filling',
      text: t(
        'Add the soft butter, mustard, 30 g of the mayonnaise, dill, chopped parsley, salt and pepper to the yolks and mash until smooth and creamy. Taste and adjust the salt and mustard.',
        'Adaugă la gălbenușuri untul moale, muștarul, 30 g din maioneză, mărarul, pătrunjelul tocat, sarea și piperul și freacă până obții o cremă fină. Gustă și corectează sarea și muștarul.',
      ),
    },
    {
      key: 'fill',
      text: t(
        'Spoon the filling into the whites, or pipe it with a star nozzle, so it forms a soft mound.',
        'Umple albușurile cu crema, cu lingurița sau cu o pungă cu duză stelată, până se formează o movilă moale.',
      ),
    },
    {
      key: 'finish',
      text: t(
        'Put a small dot of the remaining 10 g mayonnaise on each half and top with a parsley leaf, and an olive slice and a pinch of paprika if you like.',
        'Pune pe fiecare jumătate câte o bulină din cele 10 g de maioneză rămase și o frunzuliță de pătrunjel, plus o felie de măslină și un praf de boia, dacă vrei.',
      ),
    },
    {
      key: 'chill',
      text: t(
        'Cover loosely and chill for at least 30 minutes, then serve cold, on lettuce leaves if you like.',
        'Acoperă fără să strângi și ține la rece cel puțin 30 de minute, apoi servește rece, pe frunze de salată verde, dacă vrei.',
      ),
      timerSeconds: 1800,
    },
  ],
  tips: [
    t(
      'Stuffed eggs have a creamy, much-handled filling, so do not leave them out for more than 2 hours in total, counting the time on the table (1 hour above 32 °C); throw out any left out longer. Otherwise put them back in the fridge and eat them within 2 days. Keep them on a chilled plate at the table.',
      'Ouăle umplute au o umplutură cremoasă, manevrată mult, așa că nu le lăsa afară mai mult de 2 ore în total, cu tot cu timpul petrecut pe masă (1 oră peste 32 °C); aruncă-le dacă au stat afară mai mult. Altfel pune-le la loc la frigider și consumă-le în cel mult 2 zile. Ține-le pe o farfurie rece la masă.',
    ),
    t(
      'Eggs that are a week or two old peel far more cleanly than very fresh ones, and cooling them in cold water straight after boiling helps the shell come away.',
      'Ouăle vechi de o săptămână sau două se curăță mult mai ușor decât cele foarte proaspete, iar răcirea în apă rece imediat după fierbere ajută coaja să se desprindă.',
    ),
  ],
  stepTips: [
    {
      step: 'boil',
      text: t(
        'Keep to the time and cool the eggs straight away: much longer, or slow cooling, and the yolk turns dry and gets a grey-green ring. The yolk must be completely hard, with no soft centre, which also makes the eggs safe for children, older people and anyone pregnant.',
        'Respectă timpul și răcește ouăle imediat: dacă fierb mult mai mult sau se răcesc încet, gălbenușul se usucă și capătă un inel gri-verzui. Gălbenușul trebuie să fie complet tare, fără centru moale, ceea ce face ouăle sigure și pentru copii, vârstnici și gravide.',
      ),
    },
    {
      step: 'fill',
      text: t(
        'If the halves wobble, slice a hair off the rounded base so they sit flat. Fill them just before chilling, so the whites do not dry out.',
        'Dacă jumătățile se clatină, taie o felie foarte subțire din baza rotunjită ca să stea drept. Umple-le chiar înainte de răcire, ca albușurile să nu se usuce.',
      ),
    },
  ],
  nutritionNote: t(
    'Eggs give protein and are filling. The butter and yolks bring saturated fat, mayonnaise adds fat that is mostly unsaturated oil, and mustard and olives add salt. There is almost no fibre, so serve them with salad, radishes and bread.',
    'Ouăle dau proteine și sățietate. Untul și gălbenușurile aduc grăsimi saturate, maioneza adaugă grăsime care vine mai ales din ulei nesaturat, iar muștarul și măslinele adaugă sare. Fibre sunt aproape deloc, așa că servește-le cu salată, ridichi și pâine.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Radishes', 'Ridichi'),
      reason: t(
        'Their crisp, peppery bite contrasts with the soft, creamy filling.',
        'Textura crocantă și gustul lor iute contrastează cu umplutura moale și cremoasă.',
      ),
      principle: 'contrast_texture',
      ingredient: 'radish',
    },
    {
      kind: 'food',
      label: t('Lettuce', 'Salată verde'),
      reason: t(
        'Fresh leaves make a cool bed that lightens the rich yolk cream.',
        'Frunzele proaspete formează un pat răcoros care ușurează crema bogată de gălbenuș.',
      ),
      principle: 'complement_flavour',
      ingredient: 'lettuce',
    },
    {
      kind: 'food',
      label: t(
        'Romanian lamb offal and spring-herb loaf (drob de miel)',
        'Drob de miel',
      ),
      reason: t(
        'Both are cold starters for the same Easter plate.',
        'Amândouă sunt aperitive reci pe aceeași farfurie, la masa de Paște.',
      ),
      principle: 'regional_tradition',
      recipe: 'drob-de-miel',
    },
    {
      kind: 'drink',
      label: t('Dry white wine', 'Vin alb sec'),
      reason: t(
        'Its acidity cuts through the butter and yolk and refreshes the palate.',
        'Aciditatea lui taie din untul și gălbenușul bogat și împrospătează gustul.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'white-wine',
    },
  ],
  eatingMoments: [
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'Cold, protein-rich and quick to serve with salad.',
        'Se servesc reci, au multe proteine și merg repede alături de o salată.',
      ),
    },
    {
      moment: 'brunch',
      polarity: 'good_for',
      reason: t(
        'Easy to make ahead and set out with bread and vegetables.',
        'Se pot pregăti dinainte și se așază pe masă cu pâine și legume.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'good_for',
      reason: t(
        'Served cold, but keep them chilled until you eat them.',
        'Se servesc reci, dar ține-le la frigider până le mănânci.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'The butter and yolks sit heavy in the stomach before hard exercise.',
        'Untul și gălbenușurile cad greu la stomac înainte de un efort intens.',
      ),
    },
  ],
  variants: [
    {
      slug: 'oua-umplute-italian',
      cuisine: 'italian',
      title: t(
        'Uova ripiene al tonno (Italian tuna and caper stuffed eggs)',
        'Uova ripiene al tonno (ouă umplute cu ton și capere, ca în Italia)',
      ),
      servings: 6,
      prepMinutes: 55,
      cookMinutes: 18,
      difficulty: 'easy',
      lines: [
        { ingredient: 'eggs', quantity: 6, unit: 'pcs' },
        {
          ingredient: 'canned-tuna',
          quantity: 80,
          unit: 'g',
          note: t('well drained', 'bine scurs'),
        },
        { ingredient: 'mayonnaise', quantity: 50, unit: 'g' },
        {
          ingredient: 'capers',
          key: 'capers-filling',
          quantity: 10,
          unit: 'g',
          note: t(
            'drained and chopped, for the filling',
            'scurse și tocate, pentru umplutură',
          ),
        },
        {
          ingredient: 'capers',
          key: 'capers-top',
          quantity: 5,
          unit: 'g',
          note: t(
            'drained, whole, for the top',
            'scurse, întregi, pentru decor',
          ),
        },
        {
          ingredient: 'anchovies',
          quantity: 10,
          unit: 'g',
          optional: true,
          note: t('mashed', 'zdrobite'),
        },
        {
          ingredient: 'lemon-juice',
          quantity: 10,
          unit: 'ml',
          optional: true,
        },
        {
          ingredient: 'parsley',
          quantity: 5,
          unit: 'g',
          note: t(
            'finely chopped; keep a pinch for the top',
            'tocat mărunt; păstrează puțin pentru decor',
          ),
        },
        { ingredient: 'salt', quantity: 0.5, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 0.5, unit: 'g' },
      ],
      steps: [
        {
          key: 'cover',
          text: t(
            'Lay the eggs in a single layer in a saucepan, cover with cold water by about 2 cm and bring to the boil over high heat; this takes about 8 minutes. Use eggs with clean, uncracked shells (do not wash them) and wash your hands after handling the raw eggs.',
            'Pune ouăle într-un singur strat într-o cratiță, acoperă-le cu apă rece cam 2 cm deasupra și adu la fierbere la foc mare; durează aproximativ 8 minute. Folosește ouă cu coaja curată și nefisurată (nu le spăla) și spală-te pe mâini după ce le-ai atins crude.',
          ),
        },
        {
          key: 'boil',
          text: t(
            'As soon as the water boils, turn the heat down to a gentle boil and cook the eggs for 10 minutes, until the yolk is completely hard with no soft centre, which also makes them safe for children, older people and anyone pregnant.',
            'Imediat ce apa fierbe, redu focul la o fierbere domoală și fierbe ouăle 10 minute, până când gălbenușul e complet tare, fără centru moale, ceea ce le face sigure și pentru copii, vârstnici și gravide.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'cool',
          text: t(
            'Lift the eggs into a bowl of cold water and leave them for 10 minutes, adding fresh cold water once or twice, until you can hold them comfortably.',
            'Mută ouăle într-un bol cu apă rece și lasă-le 10 minute, adăugând apă rece de una-două ori, până se pot ține ușor în mână.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'peel',
          text: t(
            'Tap each egg all over on the counter, peel it under a thin stream of cold water, then cut it in half lengthwise with a sharp, wet knife.',
            'Lovește ușor fiecare ou pe blat, curăță-l sub un fir subțire de apă rece, apoi taie-l în două pe lungime cu un cuțit ascuțit și umed.',
          ),
        },
        {
          key: 'yolks',
          text: t(
            'Pop the yolks into a bowl and mash them with a fork into fine crumbs. Lay the whites on a plate, cut side up.',
            'Scoate gălbenușurile într-un bol și zdrobește-le cu furculița până devin firimituri fine. Așază albușurile pe o farfurie, cu partea tăiată în sus.',
          ),
        },
        {
          key: 'filling',
          text: t(
            'Add the drained tuna, mayonnaise, the 10 g chopped capers, the anchovy and lemon juice if using, the chopped parsley and the pepper to the yolks. Mash to a thick, spoonable paste, then taste and add salt only if it needs it: tuna, capers and anchovy are already salty.',
            'Adaugă peste gălbenușuri tonul scurs, maioneza, cele 10 g de capere tocate, anșoa și sucul de lămâie, dacă le folosești, pătrunjelul tocat și piperul. Freacă până obții o pastă groasă, care se ia cu lingura, apoi gustă și adaugă sare doar dacă e nevoie: tonul, caperele și anșoa sunt deja sărate.',
          ),
        },
        {
          key: 'fill',
          text: t(
            'Spoon the filling into the whites in generous mounds. Top each with one or two whole capers and a pinch of parsley.',
            'Umple generos albușurile cu cremă, în formă de movilă. Pune deasupra una-două capere întregi și un vârf de cuțit de pătrunjel.',
          ),
        },
        {
          key: 'chill',
          text: t(
            'Cover loosely and chill for at least 30 minutes before serving cold.',
            'Acoperă fără să strângi și ține la rece cel puțin 30 de minute înainte de a servi rece.',
          ),
          timerSeconds: 1800,
        },
      ],
      stepTips: [
        {
          step: 'filling',
          text: t(
            'Squeeze the tuna dry in a clean cloth or sieve first; oil and brine loosen the filling so it slumps.',
            'Stoarce bine tonul într-o cârpă curată sau pe o strecurătoare; uleiul și saramura subțiază umplutura și o fac să se lase.',
          ),
        },
      ],
      tips: [
        t(
          'People who are pregnant are advised to keep tuna to 4 medium cans or 2 steaks a week (NHS, because of mercury); one serving here holds only about a spoonful.',
          'Femeile însărcinate sunt sfătuite să nu depășească 4 conserve medii sau 2 fripturi de ton pe săptămână (NHS, din cauza mercurului); o porție de aici conține doar cam o lingură.',
        ),
      ],
      nutritionNote: t(
        'Tuna and egg make this high in protein. The mayonnaise adds fat that is mostly unsaturated oil, the yolks add some saturated fat, and tuna, capers and anchovy are all salty, so keep added salt low. Hardly any fibre: serve with salad or vegetables.',
        'Tonul și oul fac preparatul bogat în proteine. Maioneza adaugă grăsime care vine mai ales din ulei nesaturat, gălbenușurile aduc ceva grăsimi saturate, iar tonul, caperele și anșoa sunt sărate, așa că păstrează sarea adăugată la minimum. Fibre sunt aproape deloc: servește cu salată sau legume.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Ripe cherry tomatoes', 'Roșii cherry coapte'),
          reason: t(
            'Their sweet acidity lifts the rich, savoury tuna filling.',
            'Aciditatea lor dulce ușurează umplutura bogată și sărată de ton.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'cherry-tomato',
        },
        {
          kind: 'food',
          label: t('Country bread', 'Pâine de casă'),
          reason: t(
            'A crusty slice gives the soft eggs something to bite against.',
            'O felie crocantă oferă ouălor moi un contrast la mestecat.',
          ),
          principle: 'contrast_texture',
          ingredient: 'country-bread',
        },
        {
          kind: 'drink',
          label: t('Sparkling wine', 'Vin spumant'),
          reason: t(
            'The bubbles and acidity refresh the palate between salty bites.',
            'Bulele și aciditatea împrospătează gustul între îmbucăturile sărate.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'sparkling-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Cold, filling and protein-rich with a simple salad.',
            'Se servesc reci, sunt săturătoare și bogate în proteine, alături de o salată simplă.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Served cold; keep them in the fridge until you eat them.',
            'Se servesc reci; ține-le la frigider până le mănânci.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Salty and rich, so a poor choice just before bed.',
            'Sunt sărate și bogate, deci nu sunt o alegere bună chiar înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'oua-umplute-french',
      cuisine: 'french',
      hideBaseTips: [0],
      title: t(
        'Œufs à la Chimay (French mushroom-stuffed eggs baked under Mornay sauce)',
        'Œufs à la Chimay (ouă umplute cu ciuperci, gratinate cu sos Mornay)',
      ),
      servings: 4,
      prepMinutes: 45,
      cookMinutes: 50,
      difficulty: 'medium',
      lines: [
        { ingredient: 'eggs', quantity: 6, unit: 'pcs' },
        {
          ingredient: 'button-mushrooms',
          quantity: 150,
          unit: 'g',
          note: t('wiped, very finely chopped', 'șterse, tocate foarte mărunt'),
        },
        {
          ingredient: 'shallot',
          quantity: 30,
          unit: 'g',
          note: t('very finely chopped', 'tocată foarte mărunt'),
        },
        {
          ingredient: 'butter',
          key: 'butter-duxelles',
          quantity: 15,
          unit: 'g',
          note: t('for the mushrooms', 'pentru ciuperci'),
        },
        {
          ingredient: 'butter',
          key: 'butter-sauce',
          quantity: 30,
          unit: 'g',
          note: t(
            '25 g for the sauce, 5 g to grease the dish',
            '25 g pentru sos, 5 g pentru uns vasul',
          ),
        },
        {
          ingredient: 'flour',
          quantity: 25,
          unit: 'g',
        },
        {
          ingredient: 'milk',
          quantity: 0.3,
          unit: 'l',
          note: t('warm', 'caldă'),
        },
        {
          ingredient: 'gruyere',
          key: 'gruyere-sauce',
          quantity: 60,
          unit: 'g',
          note: t('grated, for the sauce', 'rasă, pentru sos'),
        },
        {
          ingredient: 'gruyere',
          key: 'gruyere-top',
          quantity: 30,
          unit: 'g',
          note: t('grated, for the top', 'rasă, pentru deasupra'),
        },
        { ingredient: 'nutmeg', quantity: 0.3, unit: 'g' },
        {
          ingredient: 'parsley',
          quantity: 5,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        { ingredient: 'salt', quantity: 1.5, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 0.5, unit: 'g' },
      ],
      steps: [
        {
          key: 'cover',
          text: t(
            'Lay the eggs in a single layer in a saucepan, cover with cold water by about 2 cm and bring to the boil over high heat; this takes about 8 minutes. Use eggs with clean, uncracked shells (do not wash them) and wash your hands after handling the raw eggs.',
            'Pune ouăle într-un singur strat într-o cratiță, acoperă-le cu apă rece cam 2 cm deasupra și adu la fierbere la foc mare; durează aproximativ 8 minute. Folosește ouă cu coaja curată și nefisurată (nu le spăla) și spală-te pe mâini după ce le-ai atins crude.',
          ),
        },
        {
          key: 'boil',
          text: t(
            'As soon as the water boils, turn the heat down to a gentle boil and cook the eggs for 10 minutes, until the yolk is completely hard with no soft centre, which also makes them safe for children, older people and anyone pregnant.',
            'Imediat ce apa fierbe, redu focul la o fierbere domoală și fierbe ouăle 10 minute, până când gălbenușul e complet tare, fără centru moale, ceea ce le face sigure și pentru copii, vârstnici și gravide.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'cool',
          text: t(
            'Lift the eggs into a bowl of cold water and leave them for 10 minutes, adding fresh cold water once or twice, until you can hold them comfortably.',
            'Mută ouăle într-un bol cu apă rece și lasă-le 10 minute, adăugând apă rece de una-două ori, până se pot ține ușor în mână.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'peel',
          text: t(
            'Peel the eggs under a thin stream of cold water, cut them in half lengthwise, pop the yolks into a bowl and mash them with a fork. Lay the whites on a plate, cut side up.',
            'Curăță ouăle sub un fir subțire de apă rece, taie-le în două pe lungime, scoate gălbenușurile într-un bol și zdrobește-le cu furculița. Așază albușurile pe o farfurie, cu partea tăiată în sus.',
          ),
        },
        {
          key: 'duxelles',
          text: t(
            'Melt the 15 g butter in a frying pan over medium heat, add the shallot and mushrooms and cook for about 8 minutes, stirring, until all the liquid has gone and the mixture is dry and browning lightly. Season with a pinch of the salt and the pepper.',
            'Topește cele 15 g de unt într-o tigaie la foc mediu, adaugă șalota și ciupercile și gătește cam 8 minute, amestecând, până se evaporă tot lichidul și compoziția e uscată și se rumenește ușor. Condimentează cu un praf din sare și cu piper.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 220 °C (200 °C fan), which takes about 15 minutes; do this while you make the sauce. Grease a 24 × 20 cm gratin dish lightly with the 5 g butter.',
            'Încinge cuptorul la 220 °C (200 °C cu ventilator), ceea ce durează cam 15 minute; fă asta în timp ce prepari sosul. Unge ușor cu cele 5 g de unt un vas de gratinat de 24 × 20 cm.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'roux',
          text: t(
            'Warm the milk in a small pan or the microwave until steaming. Melt the 25 g of sauce butter in a saucepan over medium heat, stir in the flour and cook for 1 minute without browning.',
            'Încălzește laptele într-o oală mică sau la microunde, până scoate aburi. Topește cele 25 g de unt pentru sos într-o cratiță la foc mediu, adaugă făina și gătește 1 minut, fără să se rumenească.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'sauce',
          text: t(
            'Add the warm milk a little at a time, whisking, then simmer for about 3 minutes, stirring, until it coats the back of a spoon. Off the heat, stir in the nutmeg, the 60 g Gruyère and a pinch of salt until smooth.',
            'Adaugă laptele cald puțin câte puțin, amestecând cu telul, apoi fierbe domol cam 3 minute, amestecând, până sosul acoperă dosul lingurii. Ia cratița de pe foc și amestecă nucșoara, cele 60 g de Gruyère și un praf de sare, până se omogenizează.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'filling',
          text: t(
            'Stir the mushroom mixture, the parsley and 2 tablespoons of the sauce into the mashed yolks until you have a thick paste. Taste and add salt if needed.',
            'Amestecă ciupercile, pătrunjelul și 2 linguri din sos în gălbenușurile zdrobite, până obții o pastă groasă. Gustă și adaugă sare dacă e nevoie.',
          ),
        },
        {
          key: 'assemble',
          text: t(
            'Mound the filling into the whites, set them side by side in the gratin dish and spoon the rest of the sauce over them. Scatter the 30 g Gruyère on top.',
            'Pune umplutura în albușuri, așază-le una lângă alta în vasul de gratinat și toarnă peste ele restul de sos. Presară deasupra cele 30 g de Gruyère.',
          ),
        },
        {
          key: 'gratin',
          text: t(
            'Bake on the upper shelf for about 10 minutes, until the sauce bubbles at the edges and the top is browned in patches. Push a knife tip into the centre of an egg: it should come out hot (74 °C).',
            'Coace pe grătarul de sus cam 10 minute, până când sosul face bule pe margini și suprafața se rumenește pe alocuri. Înfige vârful unui cuțit în centrul unui ou: trebuie să iasă fierbinte (74 °C).',
          ),
          timerSeconds: 600,
        },
        {
          key: 'extra',
          text: t(
            'If the knife tip is not hot, bake 2 to 3 minutes more, covering with foil if the top is browning too fast.',
            'Dacă vârful cuțitului nu iese fierbinte, mai coace 2-3 minute, acoperind cu folie dacă suprafața se rumenește prea repede.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'rest',
          text: t(
            'Rest the dish for 5 minutes, then serve.',
            'Lasă vasul 5 minute, apoi servește.',
          ),
          timerSeconds: 300,
        },
      ],
      tips: [
        t(
          'Cool leftovers within 2 hours, cover and keep in the fridge for up to 3 to 4 days (USDA, leftovers). Reheat in a 180 °C oven, covered with foil, for 15 to 20 minutes until steaming hot all through (74 °C), then uncover for the last few minutes to crisp the top. Reheat only once.',
          'Răcește resturile în cel mult 2 ore, acoperă-le și ține-le la frigider maximum 3-4 zile (USDA, resturi). Reîncălzește-le în cuptor la 180 °C, acoperite cu folie, 15-20 de minute, până sunt fierbinți în tot centrul (74 °C), apoi descoperă-le ultimele minute ca să se rumenească suprafața. Reîncălzește doar o dată.',
        ),
      ],
      stepTips: [
        {
          step: 'duxelles',
          text: t(
            'Cook the mushrooms until the pan is dry. Any water left in them thins the filling and the sauce.',
            'Gătește ciupercile până tigaia e uscată. Apa rămasă în ele subțiază umplutura și sosul.',
          ),
        },
      ],
      nutritionNote: t(
        'Eggs and cheese give plenty of protein, and the cheese and milk add calcium; mushrooms add bulk and flavour for little fat. The butter, milk sauce and Gruyère bring a lot of saturated fat, and the cheese adds salt, so this is a rich dish for a small portion. Serve with a green salad for fibre.',
        'Ouăle și brânza dau multe proteine, iar brânza și laptele aduc calciu; ciupercile adaugă volum și gust cu puțină grăsime. Untul, sosul de lapte și Gruyère aduc multe grăsimi saturate, iar brânza adaugă sare, așa că e un preparat bogat, pentru porții mici. Servește cu o salată verde pentru fibre.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Baguette', 'Baghetă'),
          reason: t(
            'A crisp crust for mopping up the cheese sauce.',
            'Crusta crocantă e bună pentru a șterge sosul de brânză.',
          ),
          principle: 'contrast_texture',
          ingredient: 'baguette',
        },
        {
          kind: 'food',
          label: t('Mixed green salad', 'Salată verde mixtă'),
          reason: t(
            'Sharp, lightly dressed leaves cut through the rich sauce.',
            'Frunzele cu un dressing ușor acrișor taie din bogăția sosului.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'mixed-salad',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its acidity cleans the palate between bites of creamy cheese sauce.',
            'Aciditatea lui curăță gustul între îmbucăturile de sos cremos de brânză.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'white-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Served hot and bubbling, rich and warming.',
            'Se servesc fierbinți, cu sosul încă bolborosind, și încălzesc.',
          ),
        },
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'A hot, rich centrepiece made from simple staples; fill the eggs ahead, keep them in the fridge, pour the sauce over just before baking and allow 5 to 10 minutes longer.',
            'Un preparat cald și bogat din ingrediente simple; umple ouăle dinainte, ține-le la frigider, toarnă sosul chiar înainte de copt și lasă încă 5-10 minute.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Cheese sauce and butter sit heavy in the stomach before exercise.',
            'Sosul de brânză și untul cad greu la stomac înainte de efort.',
          ),
        },
      ],
    },
  ],
};
