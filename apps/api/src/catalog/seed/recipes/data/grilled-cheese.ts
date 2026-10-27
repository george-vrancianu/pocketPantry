import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Grilled cheese base is the buttered pan sandwich. Each Variant is a full
// Recipe with its own lines, steps and guidance; the base's Recipe-level Tips are
// inherited unless a Variant hides them (hideBaseTips).
export const grilledCheese: BaseRecipeSeed = {
  slug: 'grilled-cheese',
  title: t(
    'Grilled cheese sandwich',
    'Grilled cheese (sandviș cu cheddar, rumenit în tigaie)',
  ),
  servings: 2,
  prepMinutes: 5,
  cookMinutes: 10,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'toast-bread',
      quantity: 4,
      unit: 'pcs',
      note: t('slices', 'felii'),
    },
    { ingredient: 'butter', quantity: 20, unit: 'g', note: t('soft', 'moale') },
    {
      ingredient: 'cheddar',
      quantity: 100,
      unit: 'g',
      note: t('mature, coarsely grated', 'maturat, ras grosier'),
    },
  ],
  steps: [
    {
      key: 'butter',
      text: t(
        'Spread the soft butter thinly and evenly on one side of each slice of bread, right out to the edges and corners.',
        'Întinde untul moale într-un strat subțire și uniform pe una dintre fețele fiecărei felii de pâine, până la margini și colțuri.',
      ),
    },
    {
      key: 'assemble',
      text: t(
        'Lay two slices buttered side down. Pile the cheddar on the bare sides, leaving a 5 mm border so it does not melt out into the pan. Close with the other two slices, buttered side up.',
        'Așază două felii cu fața unsă în jos. Pune cheddarul pe fețele neunse, lăsând o margine de 5 mm, ca să nu se scurgă în tigaie. Acoperă cu celelalte două felii, cu fața unsă în sus.',
      ),
    },
    {
      key: 'heat',
      text: t(
        'Set a 26 cm non-stick or heavy frying pan over medium-low heat for 2 minutes. Add no oil: the butter is already on the bread.',
        'Pune o tigaie de 26 cm, antiaderentă sau groasă, la foc mic-mediu pentru 2 minute. Nu pune ulei: untul e deja pe pâine.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'cook-first',
      text: t(
        'Lay both sandwiches in the dry pan and cover with a lid. Cook for about 3 minutes, until the underside is deep golden when you lift a corner. The butter should sizzle softly, not hiss or smoke.',
        'Pune ambele sandvișuri în tigaia uscată și acoperă cu un capac. Gătește aproximativ 3 minute, până când partea de jos e de un auriu închis când ridici un colț. Untul trebuie să sfârâie încet, să nu sfârâie puternic sau să scoată fum.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'cook-second',
      text: t(
        'Turn the sandwiches, press each one gently with the spatula and cook uncovered for about 3 minutes, until the second side is golden and the cheese just shows at the edges.',
        'Întoarce sandvișurile, apasă fiecare ușor cu spatula și gătește descoperit aproximativ 3 minute, până când a doua față e aurie și brânza se vede topită la margini.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'rest',
      text: t(
        'Move the sandwiches to a board and leave them for 1 minute so the cheese settles, then cut each one in half on the diagonal.',
        'Mută sandvișurile pe o tocătoare și lasă-le 1 minut, ca brânza să se așeze, apoi taie fiecare sandviș în diagonală, în două.',
      ),
      timerSeconds: 60,
    },
  ],
  tips: [
    t(
      'Heat is the whole trick. If the underside is dark after 2 minutes, lower the heat; if it is still pale after 3, raise it a notch. A gentle sizzle browns the bread at the same pace as the cheese melts.',
      'Totul ține de foc. Dacă partea de jos e închisă la culoare după 2 minute, scade focul; dacă e încă palidă după 3, mărește-l puțin. Un sfârâit domol rumenește pâinea în același ritm în care se topește brânza.',
    ),
    t(
      'Grate a block of cheese yourself. It melts more smoothly than bagged pre-grated cheese, which is dusted to keep the shreds apart.',
      'Rade singur o bucată de brânză. Se topește mai uniform decât brânza rasă din comerț, la pungă, care e presărată cu amidon ca să nu se lipească.',
    ),
    t(
      'Melted cheese stays far hotter than the bread around it suggests. Give it a minute before the first bite, and longer for children.',
      'Brânza topită rămâne mult mai fierbinte decât pare după pâinea din jur. Dă-i un minut înainte de prima îmbucătură, iar copiilor lasă-le mai mult timp.',
    ),
    t(
      'Leftovers: cool within 2 hours, wrap and keep in the fridge for up to 2 days. Reheat in a dry pan over low heat with a lid, 4 minutes a side, or in a 180 °C oven for about 10 minutes, until hot all the way through. The microwave makes the bread soft and chewy.',
      'Resturi: răcește-le în cel mult 2 ore, înfășoară-le și păstrează-le la frigider până la 2 zile. Încălzește-le într-o tigaie uscată, la foc mic, cu capac, câte 4 minute pe fiecare parte, sau la cuptor, la 180 °C, aproximativ 10 minute, până sunt fierbinți și în centru. La microunde, pâinea se înmoaie și devine gumoasă.',
    ),
  ],
  stepTips: [
    {
      step: 'butter',
      text: t(
        'Take the butter out of the fridge 30 minutes ahead. Cold butter tears the bread, and bare patches come out pale and dry.',
        'Scoate untul din frigider cu 30 de minute înainte. Untul rece rupe pâinea, iar zonele neunse ies palide și uscate.',
      ),
    },
    {
      step: 'cook-first',
      text: t(
        'The lid holds the heat in, so the cheese starts melting before the crust gets dark.',
        'Capacul păstrează căldura, așa că brânza începe să se topească înainte ca pâinea să se închidă la culoare.',
      ),
    },
  ],
  nutritionNote: t(
    'Cheddar gives protein and calcium and the sandwich is quick and filling, but cheddar and butter together bring plenty of saturated fat and salt, and white sandwich bread adds little fibre. Serve it with a vegetable soup or a salad.',
    'Cheddarul aduce proteine și calciu, iar sandvișul e rapid și săturător, dar cheddarul și untul împreună dau multe grăsimi saturate și sare, iar pâinea albă pentru toast aduce puține fibre. Servește-l cu o supă de legume sau cu o salată.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Tomato soup', 'Supă cremă de roșii'),
      reason: t(
        'Dip the sandwich in it: the soup acidity cuts the butter and cheese.',
        'Înmoaie sandvișul în supă: aciditatea ei taie din untul și brânza sandvișului.',
      ),
      principle: 'acid_cuts_fat',
      recipe: 'tomato-soup',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sharp brine and crunch cut through the rich melted cheese.',
        'Zeama lor acră și textura crocantă taie din bogăția brânzei topite.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'drink',
      label: t('Black tea', 'Ceai negru'),
      reason: t(
        'Its slight bitterness balances the buttery cheese.',
        'Amăreala ușoară a ceaiului echilibrează brânza cu gust de unt.',
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
        'Ready in about 15 minutes from three ingredients.',
        'E gata în aproximativ 15 minute din trei ingrediente.',
      ),
    },
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'Hot, crisp and comforting when it is cold outside.',
        'Fierbinte, crocant și reconfortant când e frig afară.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'Hot, buttery and heavy when you already feel overheated.',
        'Fierbinte, cu mult unt și greu de mâncat când ți-e deja prea cald.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Butter and cheese sit heavy in the stomach during exercise.',
        'Untul și brânza cad greu la stomac în timpul efortului.',
      ),
    },
  ],
  variants: [
    {
      slug: 'grilled-cheese-french',
      cuisine: 'french',
      title: t(
        'Croque monsieur',
        'Croque monsieur (sandviș cald cu șuncă, gruyère și sos béchamel)',
      ),
      servings: 4,
      prepMinutes: 10,
      cookMinutes: 30,
      difficulty: 'easy',
      hideBaseTips: [0, 3],
      lines: [
        {
          ingredient: 'toast-bread',
          quantity: 8,
          unit: 'pcs',
          note: t('slices', 'felii'),
        },
        {
          ingredient: 'ham',
          quantity: 160,
          unit: 'g',
          note: t('8 thin slices', '8 felii subțiri'),
        },
        {
          ingredient: 'gruyere',
          quantity: 200,
          unit: 'g',
          note: t(
            'grated: 100 g into the sauce, 60 g in the sandwiches, 40 g on top',
            'ras: 100 g în sos, 60 g în sandvișuri, 40 g deasupra',
          ),
        },
        { ingredient: 'butter', quantity: 25, unit: 'g' },
        { ingredient: 'flour', quantity: 25, unit: 'g' },
        { ingredient: 'milk', quantity: 0.25, unit: 'l' },
        { ingredient: 'nutmeg', quantity: 0.5, unit: 'g' },
        { ingredient: 'salt', quantity: 1, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 0.5, unit: 'g' },
        {
          ingredient: 'mustard',
          quantity: 20,
          unit: 'g',
          optional: true,
          note: t('Dijon', 'Dijon'),
        },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 200 °C (fan 180 °C) with a rack in the upper third. It needs about 15 minutes; make the sauce while it heats.',
            'Încinge cuptorul la 200 °C (cu ventilator 180 °C), cu grătarul în treimea de sus. Are nevoie de aproximativ 15 minute; fă sosul cât se încălzește.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'roux',
          text: t(
            'Melt the butter in a small saucepan over medium heat. Stir in the flour and cook for 1 minute, stirring, until it smells like biscuits but has not coloured.',
            'Topește untul într-o cratiță mică la foc mediu. Adaugă făina și gătește 1 minut, amestecând, până miroase a biscuiți, dar nu s-a colorat.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'milk',
          text: t(
            'Pour in the milk a splash at a time, whisking smooth after each, then simmer gently for 3 minutes, whisking, until it is thick and coats the spoon heavily, like a soft paste.',
            'Toarnă laptele puțin câte puțin, amestecând bine după fiecare adaos, apoi fierbe încet 3 minute, amestecând, până se îngroașă și acoperă gros lingura, ca o pastă moale.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'season',
          text: t(
            'Take the pan off the heat. Stir in the nutmeg, salt, pepper and 100 g of the gruyère until melted and smooth. Leave the sauce thick; it thins a little in the oven.',
            'Ia cratița de pe foc. Adaugă nucșoara, sarea, piperul și 100 g din gruyère și amestecă până se topesc și sosul e fin. Lasă sosul gros; în cuptor se subțiază puțin.',
          ),
        },
        {
          key: 'fill',
          text: t(
            'Line a baking tray with baking paper and lay 4 slices of bread on it. Spread each with 1 tablespoon of the béchamel and a thin layer of mustard, if using, then add 2 slices of ham and 15 g of gruyère. Close with the other slices.',
            'Tapetează o tavă cu hârtie de copt și așază pe ea 4 felii de pâine. Întinde pe fiecare câte o lingură de béchamel și un strat subțire de muștar, dacă folosești, apoi adaugă 2 felii de șuncă și câte 15 g de gruyère. Acoperă cu celelalte felii.',
          ),
        },
        {
          key: 'top',
          text: t(
            'Spread the rest of the béchamel over the tops, a quarter on each sandwich, and scatter the remaining 40 g of gruyère over them, 10 g on each.',
            'Întinde restul de béchamel deasupra, un sfert pe fiecare sandviș, și presară deasupra restul de 40 g de gruyère, câte 10 g pe sandviș.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 10 minutes, until the sauce is hot and just starting to bubble at the edges.',
            'Coace 10 minute, până când sosul e fierbinte și abia începe să facă bule la margini.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'grill',
          text: t(
            'Switch the oven to its grill (broiler) on high, following your oven manual about the door. Grill for about 3 minutes, staying beside it, until the top is bubbling and spotted brown. Take it out before it darkens: it goes from golden to burnt in under a minute.',
            'Pornește grillul cuptorului la maxim, urmând indicațiile cuptorului tău despre ușă. Gratinează aproximativ 3 minute, stând lângă cuptor, până când deasupra face bule și are pete rumene. Scoate tava înainte să se închidă la culoare: trece de la auriu la ars în mai puțin de un minut.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'rest',
          text: t(
            'Leave the sandwiches on the tray for 2 minutes, then serve with a knife and fork. The filling and the sauce are very hot.',
            'Lasă sandvișurile 2 minute pe tavă, apoi servește cu cuțit și furculiță. Umplutura și sosul sunt foarte fierbinți.',
          ),
          timerSeconds: 120,
        },
      ],
      tips: [
        t(
          'Keep the béchamel thick. A thin sauce runs off the bread and makes the bottom soggy.',
          'Păstrează béchamelul gros. Un sos subțire se scurge de pe pâine și face baza moale.',
        ),
        t(
          'Leftovers: cool within 2 hours, keep in the fridge for up to 1 day, and reheat in a 180 °C oven for about 10 minutes until piping hot in the centre.',
          'Resturi: răcește-le în cel mult 2 ore, păstrează-le la frigider cel mult 1 zi și încălzește-le la cuptor, la 180 °C, aproximativ 10 minute, până sunt fierbinți și în centru.',
        ),
      ],
      stepTips: [
        {
          step: 'milk',
          text: t(
            'If lumps form, whisk hard off the heat, or pour the sauce through a sieve.',
            'Dacă se formează cocoloașe, amestecă energic de pe foc sau strecoară sosul printr-o sită.',
          ),
        },
      ],
      nutritionNote: t(
        'Ham, gruyère and the milk sauce give protein and calcium, but the cheese, butter and cured ham bring a lot of saturated fat and salt, and the white bread adds little fibre. Serve it with a green salad to balance the richness.',
        'Șunca, gruyère-ul și sosul cu lapte aduc proteine și calciu, dar brânza, untul și șunca dau multe grăsimi saturate și sare, iar pâinea albă aduce puține fibre. Servește-l cu o salată verde pentru a echilibra bogăția.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Rocket', 'Rucola'),
          reason: t(
            'Peppery bitter leaves balance the rich béchamel and melted cheese.',
            'Frunzele piperate și ușor amărui echilibrează béchamelul bogat și brânza topită.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'rocket',
        },
        {
          kind: 'food',
          label: t('Cornichons', 'Castraveți cornișon'),
          reason: t(
            'Their sharp vinegar cuts the butter and cheese.',
            'Oțetul lor acru taie din unt și din brânză.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'cornichons',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Crisp acidity refreshes the palate between creamy bites.',
            'Aciditatea vie împrospătează gustul între îmbucăturile cremoase.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'white-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'A hot, filling plate that suits a slow weekend morning.',
            'O farfurie caldă și săturătoare, potrivită pentru o dimineață lejeră de weekend.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'With a green salad it is a full lunch.',
            'Împreună cu o salată verde e un prânz complet.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Bubbling cheese sauce warms you up.',
            'Sosul de brânză clocotit te încălzește.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Ham, cheese and béchamel are heavy to digest before exercise.',
            'Șunca, brânza și béchamelul se digeră greu înainte de efort.',
          ),
        },
      ],
    },
    {
      slug: 'grilled-cheese-british',
      cuisine: 'british',
      title: t(
        'Welsh rarebit (cheddar and stout sauce on toast)',
        'Welsh rarebit (pâine prăjită cu sos de cheddar și bere neagră)',
      ),
      servings: 4,
      prepMinutes: 5,
      cookMinutes: 20,
      difficulty: 'easy',
      hideBaseTips: [0, 3],
      lines: [
        {
          ingredient: 'bread',
          quantity: 4,
          unit: 'pcs',
          note: t(
            'thick slices, about 1.5 cm',
            'felii groase, de aproximativ 1,5 cm',
          ),
        },
        { ingredient: 'butter', quantity: 25, unit: 'g' },
        { ingredient: 'flour', quantity: 20, unit: 'g' },
        {
          ingredient: 'dark-beer',
          quantity: 150,
          unit: 'ml',
          note: t('stout or porter', 'stout sau porter'),
        },
        {
          ingredient: 'cheddar',
          quantity: 200,
          unit: 'g',
          note: t('mature, coarsely grated', 'maturat, ras grosier'),
        },
        { ingredient: 'mustard-powder', quantity: 3, unit: 'g' },
        { ingredient: 'worcestershire-sauce', quantity: 15, unit: 'ml' },
        { ingredient: 'cayenne', quantity: 0.5, unit: 'g', optional: true },
        { ingredient: 'black-pepper', quantity: 0.5, unit: 'g' },
      ],
      steps: [
        {
          key: 'roux',
          text: t(
            'Melt the butter in a saucepan over medium heat. Stir in the flour and cook for 1 minute, stirring, until it smells like biscuits but has not coloured.',
            'Topește untul într-o cratiță la foc mediu. Adaugă făina și gătește 1 minut, amestecând, până miroase a biscuiți, dar nu s-a colorat.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'beer',
          text: t(
            'Whisk in the beer a splash at a time, then let it bubble gently for 2 minutes, whisking, until it is thick like custard.',
            'Adaugă berea puțin câte puțin, amestecând, apoi las-o să fiarbă încet 2 minute, amestecând, până se îngroașă ca o cremă de vanilie.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'cheese',
          text: t(
            'Turn the heat to low. Stir in the cheddar a handful at a time, then the mustard powder, Worcestershire sauce, pepper and the cayenne, if using, until the sauce is smooth. Do not let it boil: it turns grainy.',
            'Dă focul la mic. Adaugă cheddarul câte o mână, amestecând, apoi muștarul pudră, sosul Worcestershire, piperul și cayenne, dacă folosești, până sosul e fin. Nu-l lăsa să fiarbă: se face granulos.',
          ),
        },
        {
          key: 'grill-heat',
          text: t(
            'Move the oven rack so the top of the bread will sit about 10 cm from the grill (broiler) element and heat the grill on high for 5 minutes. Meanwhile leave the sauce off the heat; it thickens as it cools.',
            'Mută grătarul cuptorului astfel încât partea de sus a pâinii să fie la aproximativ 10 cm de grill și încinge grillul la maxim 5 minute. Între timp lasă sosul de pe foc; se îngroașă pe măsură ce se răcește.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'toast-first',
          text: t(
            'Lay the bread on a baking tray and toast under the grill for about 1 minute, until pale golden on top.',
            'Așază pâinea pe o tavă și prăjește-o sub grill aproximativ 1 minut, până se rumenește ușor deasupra.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'toast-second',
          text: t(
            'Turn the slices and toast the second side for about 1 minute, until pale golden.',
            'Întoarce feliile și prăjește a doua față aproximativ 1 minut, până se rumenește ușor.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'spread',
          text: t(
            'Spread the sauce thickly over the toasted tops, right to the edges so the crust does not burn, a quarter of the sauce on each slice.',
            'Întinde sosul gros pe fața prăjită, până la margini, ca marginile să nu se ardă, un sfert din sos pe fiecare felie.',
          ),
        },
        {
          key: 'grill',
          text: t(
            'Grill for 2 to 3 minutes, staying beside the oven, until the sauce is bubbling, blistered and spotted brown. Take the tray out with oven gloves as soon as it is ready.',
            'Gratinează 2-3 minute, stând lângă cuptor, până când sosul face bule, se umflă și prinde pete rumene. Scoate tava cu mănuși de cuptor imediat ce e gata.',
          ),
          timerSeconds: 150,
        },
      ],
      tips: [
        t(
          'Never leave the grill unattended: it takes seconds to go from golden to burnt, and a drip of cheese can smoke on the element.',
          'Nu lăsa grillul nesupravegheat: trece în câteva secunde de la auriu la ars, iar o picătură de brânză poate scoate fum pe rezistență.',
        ),
        t(
          'The sauce keeps for up to 3 days: cool it within 2 hours, cover it and keep it in the fridge. Warm it gently over low heat, stirring, before spreading it. Leftover toasts are best eaten at once, because the bread goes soggy.',
          'Sosul se păstrează până la 3 zile: răcește-l în cel mult 2 ore, acoperă-l și ține-l la frigider. Încălzește-l încet, la foc mic, amestecând, înainte să-l întinzi. Pâinea cu sos e cel mai bună imediat, pentru că se înmoaie.',
        ),
        t(
          'A little of the alcohol in the beer stays in the sauce, so it is not for anyone avoiding alcohol.',
          'O parte din alcoolul din bere rămâne în sos, așa că nu e potrivit pentru cine evită alcoolul.',
        ),
      ],
      stepTips: [
        {
          step: 'cheese',
          text: t(
            'If the sauce starts to split and turn oily, take it off the heat at once and whisk hard until it comes together.',
            'Dacă sosul începe să se despartă și să devină uleios, ia-l imediat de pe foc și amestecă energic până se leagă la loc.',
          ),
        },
      ],
      nutritionNote: t(
        'Cheddar gives protein and calcium, but the cheese and butter bring plenty of saturated fat and salt, and the Worcestershire sauce adds more salt. It has little fibre and some of the beer alcohol stays in the sauce, so keep it as an occasional dish.',
        'Cheddarul aduce proteine și calciu, dar brânza și untul dau multe grăsimi saturate și sare, iar sosul Worcestershire mai adaugă sare. Are puține fibre și o parte din alcoolul din bere rămâne în sos, așa că păstrează-l ca preparat ocazional.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Cornichons', 'Castraveți cornișon'),
          reason: t(
            'Their sharp vinegar cuts the rich cheese sauce.',
            'Oțetul lor acru taie din sosul bogat de brânză.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'cornichons',
        },
        {
          kind: 'food',
          label: t('Sliced tomato', 'Roșii feliate'),
          reason: t(
            'Fresh acidity and juiciness lighten the heavy sauce.',
            'Aciditatea proaspătă și sucul roșiei ușurează sosul greu.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'tomato',
        },
        {
          kind: 'drink',
          label: t('Dry cider', 'Cidru sec'),
          reason: t(
            'Acidity and bubbles clear the palate between bites.',
            'Aciditatea și bulele curăță gustul între îmbucături.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'cider',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Hot, bubbling and warming when the weather is cold.',
            'Fierbinte, cu bule și încălzitor când afară e frig.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A thick cheese sauce with a little beer alcohol is heavy before bed.',
            'Un sos gros de brânză, cu puțin alcool din bere, cade greu înainte de culcare.',
          ),
        },
        {
          moment: 'morning',
          polarity: 'avoid',
          reason: t(
            'A beer and cheese sauce is a heavy start to the day.',
            'Un sos de bere și brânză e un început greu de zi.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Cheese and a little alcohol do not suit exercise.',
            'Brânza și puțin alcool nu se potrivesc cu efortul fizic.',
          ),
        },
      ],
    },
    {
      slug: 'grilled-cheese-italian',
      cuisine: 'italian',
      title: t(
        'Mozzarella in carrozza (fried mozzarella sandwiches)',
        'Mozzarella in carrozza (sandvișuri cu mozzarella, prăjite în ulei)',
      ),
      servings: 4,
      prepMinutes: 40,
      cookMinutes: 20,
      difficulty: 'medium',
      hideBaseTips: [0, 1, 3],
      lines: [
        {
          ingredient: 'toast-bread',
          quantity: 8,
          unit: 'pcs',
          note: t('slices, crusts cut off', 'felii, fără coajă'),
        },
        {
          ingredient: 'mozzarella',
          quantity: 250,
          unit: 'g',
          note: t('drained, in 1 cm slices', 'scursă, în felii de 1 cm'),
        },
        {
          ingredient: 'anchovies',
          quantity: 20,
          unit: 'g',
          optional: true,
          note: t(
            '4 fillets, one per sandwich',
            '4 fileuri, câte unul pe sandviș',
          ),
        },
        { ingredient: 'milk', quantity: 0.1, unit: 'l' },
        { ingredient: 'flour', quantity: 50, unit: 'g' },
        { ingredient: 'eggs', quantity: 3, unit: 'pcs' },
        { ingredient: 'salt', quantity: 1, unit: 'g' },
        { ingredient: 'sunflower-oil', quantity: 350, unit: 'ml' },
      ],
      steps: [
        {
          key: 'dry',
          text: t(
            'Lay the mozzarella slices on paper towels in the fridge for 30 minutes, then pat them dry on top. Wet cheese spits in hot oil.',
            'Așază feliile de mozzarella pe prosoape de hârtie, la frigider, 30 de minute, apoi tamponează-le și deasupra. Brânza umedă stropește în uleiul încins.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'assemble',
          text: t(
            'Lay out 4 slices of bread. Cover each with mozzarella (and one anchovy fillet, if using), leaving a 1 cm border. Close with the other slices and press the edges firmly together so no cheese can leak out.',
            'Așază 4 felii de pâine. Acoperă fiecare cu mozzarella (și un file de anșoa, dacă folosești), lăsând o margine de 1 cm. Acoperă cu celelalte felii și apasă bine marginile, ca brânza să nu se scurgă.',
          ),
        },
        {
          key: 'station',
          text: t(
            'Pour the milk into one shallow dish and the flour into another. Beat the eggs with the salt in a third. Set a plate lined with paper towels beside the hob for the cooked sandwiches.',
            'Toarnă laptele într-o farfurie adâncă, iar făina într-alta. Bate ouăle cu sarea într-a treia. Pregătește lângă aragaz o farfurie căptușită cu prosoape de hârtie pentru sandvișurile prăjite.',
          ),
        },
        {
          key: 'heat-oil',
          text: t(
            'Pour the oil into a 24 cm frying pan, about 1 cm deep. The pan must be no more than a third full. Heat it over medium heat for about 5 minutes to 170 °C on a thermometer, never leaving it. With no thermometer, a bread cube dropped in should sizzle steadily and turn golden in about a minute.',
            'Toarnă uleiul într-o tigaie de 24 cm, cam de 1 cm adâncime. Tigaia trebuie să fie plină cel mult o treime. Încălzește-l la foc mediu aproximativ 5 minute, până la 170 °C pe termometru, fără să pleci de lângă el. Fără termometru, un cub de pâine aruncat în ulei trebuie să sfârâie constant și să se rumenească în aproximativ un minut.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'coat-first',
          text: t(
            'Dip two sandwiches in the milk for a second on each side, dust them all over with flour and shake off the excess. Turn them in the egg until the bread has taken it up and looks glossy.',
            'Înmoaie două sandvișuri în lapte, o secundă pe fiecare parte, apoi tăvălește-le în făină și scutură excesul. Întoarce-le în ou până pâinea îl absoarbe și arată lucioasă.',
          ),
        },
        {
          key: 'fry-first',
          text: t(
            'Lower the two sandwiches into the oil away from you, one at a time. Fry for about 2 minutes, until the underside is golden.',
            'Coboară cele două sandvișuri în ulei, pe rând, dinspre tine spre partea opusă. Prăjește aproximativ 2 minute, până când partea de jos e aurie.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'turn-first',
          text: t(
            'Turn them with a spatula and fry the second side for about 2 minutes, until golden. Lift them onto the paper-lined plate.',
            'Întoarce-le cu o spatulă și prăjește a doua față aproximativ 2 minute, până e aurie. Scoate-le pe farfuria căptușită cu hârtie.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'check',
          text: t(
            'Cut one sandwich in half: the egg coating must be set and golden all the way round, with no wet or glossy egg, and the mozzarella soft. If the egg is still wet, fry the next batch 30 seconds longer on each side, and finish the cut halves in a dry non-stick pan over medium heat until the egg is set.',
            'Taie un sandviș în două: stratul de ou trebuie să fie întărit și auriu peste tot, fără ou umed sau lucios, iar mozzarella moale. Dacă oul e încă umed, prăjește următoarea tură cu 30 de secunde mai mult pe fiecare parte, iar jumătățile tăiate termină-le într-o tigaie antiaderentă uscată, la foc mediu, până se întărește oul.',
          ),
        },
        {
          key: 'coat-second',
          text: t(
            'Let the oil come back to 170 °C. Coat the other two sandwiches in milk, flour and egg as before, then wash your hands: this is the last of the raw egg.',
            'Lasă uleiul să revină la 170 °C. Trece celelalte două sandvișuri prin lapte, făină și ou, ca înainte, apoi spală-te pe mâini: ăsta e ultimul contact cu oul crud.',
          ),
        },
        {
          key: 'fry-second',
          text: t(
            'Fry the first side of the second batch for about 2 minutes, until golden.',
            'Prăjește prima față a celei de-a doua ture aproximativ 2 minute, până e aurie.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'turn-second',
          text: t(
            'Turn them and fry the second side for about 2 minutes, until golden. Drain on the paper-lined plate, then turn off the heat and leave the oil to cool completely before handling it.',
            'Întoarce-le și prăjește a doua față aproximativ 2 minute, până e aurie. Scurge-le pe farfuria cu hârtie, apoi oprește focul și lasă uleiul să se răcească complet înainte să-l muți.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'rest',
          text: t(
            'Leave the sandwiches for 1 to 2 minutes, because the melted mozzarella burns, then cut each one in half on the diagonal.',
            'Lasă sandvișurile 1-2 minute, pentru că mozzarella topită frige, apoi taie fiecare sandviș în diagonală, în două.',
          ),
          timerSeconds: 90,
        },
      ],
      tips: [
        t(
          'Hot oil safety: keep a lid beside the pan and never use water near hot oil. If the oil smokes, turn off the heat. If it catches fire, turn off the heat if you can do it safely, do not move the pan, smother it with the lid or a damp towel, and if it does not go out at once, get everyone out, close the door and call 112.',
          'Siguranța uleiului încins: ține un capac lângă tigaie și nu folosi niciodată apă lângă uleiul încins. Dacă uleiul scoate fum, oprește focul. Dacă ia foc, oprește focul dacă poți face asta în siguranță, nu muta tigaia, acoper-o cu capacul sau cu un prosop umed, iar dacă focul nu se stinge imediat, scoate pe toată lumea din casă, închide ușa și sună la 112.',
        ),
        t(
          'Reheat leftovers: cool within 2 hours, keep in the fridge for up to 1 day and reheat on a rack in a 180 °C oven for about 10 minutes, until the centre is piping hot. The microwave makes the coating soggy.',
          'Resturile: răcește-le în cel mult 2 ore, păstrează-le la frigider cel mult 1 zi și încălzește-le pe un grătar, la cuptor, la 180 °C, aproximativ 10 minute, până sunt fierbinți și în centru. La microunde, stratul se înmoaie.',
        ),
      ],
      stepTips: [
        {
          step: 'assemble',
          text: t(
            'Roll a rolling pin lightly over each sandwich before the egg dip. Thin, well-sealed edges stay shut in the oil.',
            'Trece un sucitor ușor peste fiecare sandviș înainte de oul bătut. Marginile subțiri și bine lipite rămân închise în ulei.',
          ),
        },
        {
          step: 'heat-oil',
          text: t(
            'Do not let the oil go past 180 °C. The coating then browns before the mozzarella has melted, and if the oil smokes, it is too hot: turn off the heat.',
            'Nu lăsa uleiul să treacă de 180 °C. Stratul se rumenește atunci înainte ca mozzarella să se topească, iar dacă uleiul scoate fum, e prea încins: oprește focul.',
          ),
        },
      ],
      nutritionNote: t(
        'Mozzarella gives protein and calcium and the egg adds more protein, but the sandwich is fried and soaks up oil (sunflower oil is mostly unsaturated), and the mozzarella brings saturated fat and some salt. White bread adds little fibre; serve it with a tomato or rocket salad.',
        'Mozzarella aduce proteine și calciu, iar oul mai multe proteine, dar sandvișul e prăjit și absoarbe ulei (uleiul de floarea soarelui e în mare parte nesaturat), iar mozzarella aduce grăsimi saturate și ceva sare. Pâinea albă aduce puține fibre; servește-l cu o salată de roșii sau de rucola.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Cherry tomatoes', 'Roșii cherry'),
          reason: t(
            'Their sweet acidity cuts the fried, milky richness.',
            'Aciditatea lor dulce taie din bogăția prăjită și lactată.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'cherry-tomato',
        },
        {
          kind: 'food',
          label: t('Rocket', 'Rucola'),
          reason: t(
            'Peppery bitter leaves balance the fried cheese.',
            'Frunzele piperate și ușor amărui echilibrează brânza prăjită.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'rocket',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Crisp acidity refreshes the palate after fried cheese.',
            'Aciditatea vie împrospătează gustul după brânza prăjită.',
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
            'Crisp outside, soft inside; with a salad it makes a quick lunch.',
            'Crocant pe dinafară, moale pe dinăuntru; cu o salată e un prânz rapid.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Served straight from the pan, it is hot and comforting.',
            'Servit direct din tigaie, e fierbinte și reconfortant.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Fried food and cheese sit heavy before bed.',
            'Mâncarea prăjită și brânza cad greu înainte de culcare.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'Standing over hot oil is unpleasant on a hot day.',
            'Să stai lângă uleiul încins e neplăcut într-o zi caldă.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Fried food sits heavy in the stomach during exercise.',
            'Mâncarea prăjită cade greu la stomac în timpul efortului.',
          ),
        },
      ],
    },
  ],
};
