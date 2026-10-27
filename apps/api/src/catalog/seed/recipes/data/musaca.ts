import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Musaca base is the Romanian potato musaca: sliced potatoes layered with
// a pork and beef mince filling, finished with an egg and milk topping. Each
// Variant is a full Recipe with its own lines, steps and guidance. The base's
// Recipe-level Tips are inherited; a Variant hides the ones that no longer hold.
export const musaca: BaseRecipeSeed = {
  slug: 'musaca',
  title: t(
    'Romanian potato and meat moussaka (musaca de cartofi)',
    'Musaca de cartofi',
  ),
  servings: 6,
  prepMinutes: 35,
  cookMinutes: 103,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'potato',
      quantity: 1.2,
      unit: 'kg',
      note: t('peeled', 'curățați'),
    },
    { ingredient: 'sunflower-oil', quantity: 60, unit: 'ml' },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('finely chopped', 'tăiate mărunt'),
    },
    {
      ingredient: 'minced-mixed-meat',
      quantity: 600,
      unit: 'g',
      note: t('pork and beef', 'porc și vită'),
    },
    { ingredient: 'tomato-paste', quantity: 40, unit: 'g' },
    { ingredient: 'paprika', quantity: 5, unit: 'g' },
    {
      ingredient: 'parsley',
      quantity: 20,
      unit: 'g',
      note: t('finely chopped', 'tocat mărunt'),
    },
    { ingredient: 'still-water', quantity: 0.25, unit: 'l' },
    { ingredient: 'eggs', quantity: 4, unit: 'pcs' },
    { ingredient: 'milk', quantity: 0.3, unit: 'l' },
    { ingredient: 'sour-cream', quantity: 100, unit: 'g', optional: true },
    { ingredient: 'salt', quantity: 15, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
  ],
  steps: [
    {
      key: 'slice',
      text: t(
        'Slice the potatoes about 5 mm thick, as evenly as you can, and drop them into a bowl of cold water.',
        'Taie cartofii felii de aproximativ 5 mm, cât mai egale, și pune-i într-un bol cu apă rece.',
      ),
    },
    {
      key: 'preheat',
      text: t(
        'Switch the oven on to 180 °C. It needs about 15 minutes and will be hot by the time the dish is built.',
        'Pornește cuptorul la 180 °C. Are nevoie de aproximativ 15 minute și va fi încins până așezi musacaua în tavă.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'parboil',
      text: t(
        'Drain the slices and put them in a pot. Cover with fresh cold water, add 5 g of the salt and bring to the boil, which takes about 10 minutes. Then boil for 3 minutes, until the edges are just tender but the slices still hold their shape. Drain well and let them steam dry in the colander.',
        'Scurge feliile și pune-le într-o oală. Acoperă-le cu apă rece proaspătă, adaugă 5 g din sare și adu la fierbere, ceea ce durează cam 10 minute. Apoi fierbe-le 3 minute, până când marginile se înmoaie, dar feliile își păstrează forma. Scurge-i bine și lasă-i să se zvânte în strecurătoare.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'onion',
      text: t(
        'Heat 40 ml of the oil in a wide pan over medium heat. Add the onions and cook for 5 minutes, stirring, until soft and translucent but not browned.',
        'Încălzește 40 ml din ulei într-o tigaie lată, la foc mediu. Adaugă ceapa și călește-o 5 minute, amestecând, până se înmoaie și devine sticloasă, fără să se rumenească.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'brown',
      text: t(
        'Add the mince and turn the heat up to medium-high. Cook for about 10 minutes, breaking it up with a spoon, until no pink remains and it is grey-brown with clear juices.',
        'Adaugă carnea tocată și crește focul la mediu-mare. Gătește aproximativ 10 minute, mărunțind-o cu lingura, până nu mai are nicio urmă de roz și e cenușie-maronie, cu zeama limpede.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'season',
      text: t(
        'Stir in the tomato paste, paprika, 7 g of the salt, 1.5 g of the pepper and 100 ml of the water. Simmer for 10 minutes, until thick with hardly any liquid left in the pan. Take off the heat and stir in the parsley.',
        'Adaugă pasta de roșii, boiaua, 7 g din sare, 1,5 g din piper și 100 ml din apă și amestecă. Fierbe la foc mic 10 minute, până se îngroașă și aproape nu mai rămâne lichid în tigaie. Ia de pe foc și adaugă pătrunjelul.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'layer',
      text: t(
        'Brush a 24 by 32 cm baking dish, at least 6 cm deep, with the remaining 20 ml of oil. Spread a third of the potatoes over the base, then half of the meat, then another third of the potatoes, the rest of the meat and the last third of the potatoes on top. Pour 150 ml of the water around the edge.',
        'Unge cu cei 20 ml de ulei rămași o tavă de 24 pe 32 cm, adâncă de cel puțin 6 cm. Pune pe fund o treime din cartofi, apoi jumătate din carne, încă o treime din cartofi, restul cărnii și ultima treime de cartofi deasupra. Toarnă pe margini 150 ml din apă.',
      ),
    },
    {
      key: 'bake-covered',
      text: t(
        'Cover the dish tightly with foil and bake at 180 °C for 35 minutes, until a knife slides easily through the potatoes.',
        'Acoperă tava strâns cu folie de aluminiu și coace la 180 °C timp de 35 de minute, până când un cuțit intră ușor prin cartofi.',
      ),
      timerSeconds: 2100,
    },
    {
      key: 'topping',
      text: t(
        'While the dish bakes, whisk the eggs with the milk, the sour cream if using, the remaining 3 g of salt and 0.5 g of pepper. Wash your hands and the whisk after handling the raw eggs. Take the dish out, remove the foil and pour the mixture evenly over the top.',
        'Cât se coace tava, bate ouăle cu laptele, cu smântâna, dacă o folosești, cu cele 3 g de sare rămase și cu 0,5 g de piper. Spală-ți mâinile și telul după ce ai atins ouăle crude. Scoate tava, ia folia și toarnă compoziția uniform deasupra.',
      ),
    },
    {
      key: 'bake-uncovered',
      text: t(
        'Return the dish, uncovered, to the oven for 20 minutes, until the topping is set with no wobble in the middle and golden on top. The centre of the dish must reach 75 °C on a probe thermometer, so the egg is cooked through.',
        'Pune tava la loc în cuptor, descoperită, pentru 20 de minute, până când compoziția se încheagă, fără să mai tremure la mijloc, și se rumenește deasupra. Centrul tăvii trebuie să ajungă la 75 °C, măsurat cu termometrul cu sondă, ca oul să fie gătit complet.',
      ),
      timerSeconds: 1200,
    },
    {
      key: 'rest',
      text: t(
        'Leave the musaca to rest for 10 minutes before cutting, so the topping firms up and the squares keep their shape.',
        'Lasă musacaua să se odihnească 10 minute înainte de tăiat, ca stratul de deasupra să se întărească și porțiile să-și păstreze forma.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'store',
      text: t(
        'Cool any leftovers and get them into the fridge within 2 hours of leaving the oven. Keep them covered for up to 3 days and reheat until steaming hot all the way through.',
        'Răcește ce rămâne și pune-l la frigider în cel mult 2 ore de la scoaterea din cuptor. Păstrează-l acoperit până la 3 zile și încălzește-l până devine fierbinte de tot, și la mijloc.',
      ),
    },
  ],
  tips: [
    t(
      'Slice the potatoes to the same thickness: thicker slices stay hard in the middle while the thin ones turn soft.',
      'Taie cartofii la aceeași grosime: feliile mai groase rămân tari în mijloc, în timp ce cele subțiri se înmoaie prea tare.',
    ),
    t(
      'Taste the meat before layering and season it a little more firmly than you would eat it alone; the potatoes and the topping are mild and dilute it.',
      'Gustă carnea înainte de a o pune în tavă și potrivește-o de sare ceva mai bine decât dacă ai mânca-o simplă; cartofii și compoziția de deasupra sunt blânde și o îndulcesc.',
    ),
  ],
  stepTips: [
    {
      step: 'parboil',
      text: t(
        'Let the drained slices steam dry for a few minutes: wet potatoes water down the meat layers.',
        'Lasă feliile scurse să se zvânte câteva minute: cartofii uzi diluează straturile de carne.',
      ),
    },
    {
      step: 'rest',
      text: t(
        'Cut with a sharp knife straight down, wiping the blade between cuts, for clean squares.',
        'Taie cu un cuțit bine ascuțit, drept în jos, și șterge lama între tăieturi, ca porțiile să iasă curate.',
      ),
    },
  ],
  nutritionNote: t(
    'A filling mix of potato, meat and egg, with protein and carbohydrate. The pork, egg topping and sour cream add saturated fat, the oil adds energy, the dish is quite salty and has few vegetables, so serve it with a fresh salad.',
    'Un amestec sățios de cartofi, carne și ou, cu proteine și carbohidrați. Carnea de porc, compoziția cu ou și smântâna aduc grăsimi saturate, uleiul aduce energie, mâncarea e destul de sărată și are puține legume, așa că servește-o cu o salată proaspătă.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sharp acidity cuts through the rich meat and egg.',
        'Aciditatea lor echilibrează gustul gras al cărnii și al oului.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'food',
      label: t('White cabbage salad', 'Salată de varză albă'),
      reason: t(
        'Crisp, shredded cabbage with a splash of vinegar adds crunch and freshness to a soft bake.',
        'Varza crocantă, tăiată fin și stropită cu oțet, aduce prospețime și ceva crocant lângă o mâncare moale.',
      ),
      principle: 'contrast_texture',
      ingredient: 'cabbage',
    },
    {
      kind: 'drink',
      label: t('Dry red wine', 'Vin roșu sec'),
      reason: t(
        'The acidity and light tannin refresh the palate between rich bites.',
        'Aciditatea și taninul ușor împrospătează gustul între îmbucături bogate.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'red-wine',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot, filling bake that warms you up.',
        'O mâncare caldă și sățioasă, care te încălzește.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Meat and egg give protein and the potatoes give carbohydrate to refuel.',
        'Carnea și oul aduc proteine, iar cartofii carbohidrați pentru refacere.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Heavy and rich, which can sit badly before bed.',
        'Grea și bogată, poate cădea greu înainte de culcare.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'Needs a long time in a hot oven and is heavy to eat in the heat.',
        'Stă mult într-un cuptor încins și e grea de mâncat pe caniculă.',
      ),
    },
  ],
  variants: [
    {
      slug: 'musaca-greek',
      cuisine: 'greek',
      title: t(
        'Moussaka (Greek aubergine and meat bake with béchamel)',
        'Musaca grecească cu vinete și sos béchamel',
      ),
      servings: 8,
      prepMinutes: 85,
      cookMinutes: 130,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'aubergine',
          quantity: 4,
          unit: 'pcs',
          note: t('large, about 350 g each', 'mari, de câte aproximativ 350 g'),
        },
        {
          ingredient: 'potato',
          quantity: 0.6,
          unit: 'kg',
          note: t('peeled', 'curățați'),
        },
        { ingredient: 'olive-oil', quantity: 100, unit: 'ml' },
        { ingredient: 'minced-beef', quantity: 800, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('finely chopped', 'tăiate mărunt'),
        },
        {
          ingredient: 'garlic',
          quantity: 15,
          unit: 'g',
          note: t('crushed', 'zdrobit'),
        },
        { ingredient: 'red-wine', quantity: 150, unit: 'ml' },
        { ingredient: 'canned-tomatoes', quantity: 800, unit: 'g' },
        { ingredient: 'tomato-paste', quantity: 40, unit: 'g' },
        { ingredient: 'cinnamon', quantity: 2, unit: 'g' },
        { ingredient: 'allspice', quantity: 2, unit: 'g' },
        { ingredient: 'bay-leaves', quantity: 0.6, unit: 'g' },
        {
          ingredient: 'parsley',
          quantity: 20,
          unit: 'g',
          optional: true,
          note: t('finely chopped', 'tocat mărunt'),
        },
        { ingredient: 'butter', quantity: 100, unit: 'g' },
        { ingredient: 'flour', quantity: 100, unit: 'g' },
        { ingredient: 'milk', quantity: 1, unit: 'l' },
        {
          ingredient: 'eggs',
          quantity: 3,
          unit: 'pcs',
          note: t(
            'yolks only; keep the whites for another dish',
            'doar gălbenușurile; păstrează albușurile pentru altceva',
          ),
        },
        { ingredient: 'nutmeg', quantity: 1, unit: 'g' },
        {
          ingredient: 'kefalotyri',
          quantity: 100,
          unit: 'g',
          note: t('finely grated', 'ras fin'),
        },
        { ingredient: 'salt', quantity: 22, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
      ],
      steps: [
        {
          key: 'salt-aubergine',
          text: t(
            'Trim the aubergines and cut them into 1 cm slices. Toss them with 8 g of the salt in a colander and leave them to drain for 20 minutes.',
            'Curăță vinetele de cozi și taie-le felii de 1 cm. Amestecă-le cu 8 g din sare într-o strecurătoare și lasă-le să se scurgă 20 de minute.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'preheat',
          text: t(
            'While the aubergines drain, switch the oven on to 200 °C. It needs about 15 minutes.',
            'Cât se scurg vinetele, pornește cuptorul la 200 °C. Are nevoie de aproximativ 15 minute.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'brush',
          text: t(
            'Pat the slices very dry with a clean towel; most of the salt comes off with the water. Brush both sides with 60 ml of the olive oil and spread them in a single layer over two large baking trays, or roast in two batches.',
            'Șterge feliile bine cu un prosop curat; cea mai mare parte din sare iese odată cu apa. Unge-le pe ambele fețe cu 60 ml din uleiul de măsline și așază-le într-un singur strat pe două tăvi mari de copt sau coace-le pe rând, în două șarje.',
          ),
        },
        {
          key: 'roast',
          text: t(
            'Roast at 200 °C for 25 minutes, swapping the trays and turning the slices halfway, until soft and golden at the edges.',
            'Coace la 200 °C timp de 25 de minute, schimbând tăvile între ele și întorcând feliile la jumătate, până se înmoaie și se rumenesc pe margini.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'parboil',
          text: t(
            'While the aubergines roast, slice the potatoes 4 mm thick. Cover them with cold water, add 5 g of the salt, bring to the boil and boil for 4 minutes. Drain well and let them steam dry.',
            'Cât se coc vinetele, taie cartofii felii de 4 mm. Acoperă-i cu apă rece, adaugă 5 g din sare, adu la fierbere și fierbe 4 minute. Scurge-i bine și lasă-i să se zvânte.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'sauce-onion',
          text: t(
            'Heat 30 ml of the olive oil in a wide, deep pan over medium heat. Cook the onions for 6 minutes, until soft, then add the garlic and cook for 1 minute.',
            'Încălzește 30 ml din uleiul de măsline într-o tigaie lată și adâncă, la foc mediu. Călește ceapa 6 minute, până se înmoaie, apoi adaugă usturoiul și mai călește 1 minut.',
          ),
          timerSeconds: 420,
        },
        {
          key: 'sauce-meat',
          text: t(
            'Add the mince and cook over medium-high heat for about 10 minutes, breaking it up, until no pink remains and it is grey-brown with clear juices.',
            'Adaugă carnea tocată și gătește la foc mediu-mare aproximativ 10 minute, mărunțind-o, până nu mai are nicio urmă de roz și e cenușie-maronie, cu zeama limpede.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'sauce-simmer',
          text: t(
            'Stir in the tomato paste, then pour in the wine and boil for 3 minutes. Add the tomatoes, crushing them with the spoon, the cinnamon, allspice, bay leaves, 6 g of the salt and 1.5 g of the pepper. Simmer uncovered for 30 minutes, stirring now and then, until a spoon drawn across the pan leaves a clear trail. Take out the bay leaves and stir in the parsley.',
            'Adaugă pasta de roșii, apoi toarnă vinul și fierbe 3 minute. Adaugă roșiile, strivindu-le cu lingura, scorțișoara, ienibaharul, foile de dafin, 6 g din sare și 1,5 g din piper. Fierbe descoperit 30 de minute, amestecând din când în când, până când lingura trasă prin tigaie lasă o urmă clară. Scoate foile de dafin și adaugă pătrunjelul.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'bechamel',
          text: t(
            'While the sauce simmers, melt the butter in a saucepan, stir in the flour and cook for 2 minutes without browning. Add the milk a little at a time, whisking, then simmer for 5 minutes until thick. Take the pan off the heat and stir in the nutmeg, the remaining 3 g of salt, 0.5 g of pepper and 70 g of the kefalotyri.',
            'Cât fierbe sosul, topește untul într-o cratiță, amestecă făina și călește-o 2 minute, fără să se rumenească. Adaugă laptele treptat, puțin câte puțin, amestecând cu telul, apoi fierbe 5 minute, până se îngroașă. Ia cratița de pe foc și adaugă nucșoara, cele 3 g de sare rămase, 0,5 g de piper și 70 g din kefalotyri.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'eggs',
          text: t(
            'Let the béchamel cool for 5 minutes. Whisk the 3 yolks in a bowl, whisk in a ladle of the sauce, then whisk it all back into the pan. Wash your hands and the bowl after handling the raw egg.',
            'Lasă sosul béchamel să se răcească 5 minute. Bate cele 3 gălbenușuri într-un bol, adaugă peste ele un polonic de sos și amestecă, apoi toarnă totul înapoi în cratiță, amestecând cu telul. Spală-ți mâinile și bolul după ce ai atins gălbenușurile crude.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'layer',
          text: t(
            'Lower the oven to 180 °C. Brush a 25 by 35 cm dish, at least 6 cm deep, with 10 ml of the olive oil. Layer, in this order: all the potatoes, half of the aubergine, half of the meat sauce, the rest of the aubergine and the rest of the meat sauce. Pour all the béchamel over the top and level it. Sprinkle with the remaining 30 g of kefalotyri.',
            'Scade cuptorul la 180 °C. Unge o tavă de 25 pe 35 cm, adâncă de cel puțin 6 cm, cu 10 ml din uleiul de măsline. Așază în straturi, în ordinea asta: toți cartofii, jumătate din vinete, jumătate din sosul de carne, restul de vinete și restul sosului de carne. Toarnă tot sosul béchamel deasupra și netezește-l. Presară cele 30 g de kefalotyri rămase.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake at 180 °C for 45 minutes, until deep golden and bubbling at the edges. The centre must reach 75 °C on a probe thermometer, so the egg in the béchamel is set through.',
            'Coace la 180 °C timp de 45 de minute, până când se rumenește bine și face clocote pe margini. Centrul trebuie să ajungă la 75 °C, măsurat cu termometrul cu sondă, ca oul din béchamel să fie închegat complet.',
          ),
          timerSeconds: 2700,
        },
        {
          key: 'rest',
          text: t(
            'Rest the moussaka for 30 minutes before cutting, so the layers set and the squares hold together.',
            'Lasă musacaua să se odihnească 30 de minute înainte de tăiat, ca straturile să se așeze și porțiile să rămână întregi.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'store',
          text: t(
            'Cool any leftovers and get them into the fridge within 2 hours of leaving the oven. Keep them covered for up to 3 days and reheat until steaming hot all the way through.',
            'Răcește ce rămâne și pune-l la frigider în cel mult 2 ore de la scoaterea din cuptor. Păstrează-l acoperit până la 3 zile și încălzește-l până devine fierbinte de tot, și la mijloc.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'rest',
          text: t(
            'Cut with a sharp knife straight down; a hot moussaka cut early slides apart.',
            'Taie cu un cuțit bine ascuțit, drept în jos; o musaca tăiată prea devreme se desface.',
          ),
        },
      ],
      nutritionNote: t(
        'Aubergine and tomato bring fibre and vegetables, and the beef gives protein. The béchamel, with its butter and cheese, adds a lot of saturated fat, the oil the aubergine soaks up adds energy, and it is salty. Roasting rather than frying the aubergine keeps the oil lower.',
        'Vinetele și roșiile aduc fibre și legume, iar carnea de vită proteine. Sosul béchamel, cu untul și brânza lui, aduce multe grăsimi saturate, uleiul pe care îl absorb vinetele aduce energie, iar preparatul e sărat. Dacă vinetele sunt coapte în cuptor, nu prăjite, preparatul are mai puțin ulei.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Cucumber salad', 'Salată de castraveți'),
          reason: t(
            'Cool, crisp cucumber with a squeeze of lemon freshens up the rich, creamy layers.',
            'Castravetele răcoros și crocant, cu puțină lămâie, împrospătează straturile bogate și cremoase.',
          ),
          principle: 'contrast_texture',
          ingredient: 'cucumber',
        },
        {
          kind: 'food',
          label: t('Olives', 'Măsline'),
          reason: t(
            'Their saltiness and slight bitterness play against the sweet spices in the meat sauce.',
            'Sărătura și amăreala lor ușoară contrastează cu condimentele dulci din sosul de carne.',
          ),
          principle: 'complement_flavour',
          ingredient: 'olives',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its acidity cuts through the béchamel and refreshes the palate.',
            'Aciditatea lui taie din sosul béchamel și împrospătează gustul.',
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
            'A hot, rich bake that warms you through.',
            'O mâncare caldă și bogată, care te încălzește.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Very rich, with béchamel and cheese; heavy before bed.',
            'Foarte bogată, cu béchamel și brânză; grea înainte de culcare.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'Needs a hot oven for a long time and is heavy in the heat.',
            'Cere mult timp într-un cuptor încins și e grea pe caniculă.',
          ),
        },
      ],
    },
    {
      slug: 'musaca-turkish',
      cuisine: 'turkish',
      title: t(
        'Patlıcan musakka (Turkish aubergine and mince in tomato)',
        'Patlıcan musakka (vinete cu carne tocată în sos de roșii, ca în Turcia)',
      ),
      servings: 4,
      prepMinutes: 30,
      cookMinutes: 75,
      difficulty: 'medium',
      hideBaseTips: [0, 1],
      lines: [
        {
          ingredient: 'aubergine',
          quantity: 3,
          unit: 'pcs',
          note: t('about 300 g each', 'de câte aproximativ 300 g'),
        },
        { ingredient: 'sunflower-oil', quantity: 110, unit: 'ml' },
        { ingredient: 'minced-beef', quantity: 400, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('finely chopped', 'tăiate mărunt'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          optional: true,
          note: t('crushed', 'zdrobit'),
        },
        {
          ingredient: 'sivri-pepper',
          quantity: 4,
          unit: 'pcs',
          note: t('sliced into rings', 'tăiați rondele'),
        },
        { ingredient: 'tomato', quantity: 400, unit: 'g' },
        { ingredient: 'tomato-paste', quantity: 30, unit: 'g' },
        {
          ingredient: 'butter',
          quantity: 20,
          unit: 'g',
          optional: true,
        },
        { ingredient: 'pul-biber', quantity: 2, unit: 'g', optional: true },
        { ingredient: 'still-water', quantity: 0.25, unit: 'l' },
        { ingredient: 'salt', quantity: 12, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'cut',
          text: t(
            'Peel the aubergines in lengthwise stripes, leaving about half the skin on, and cut them into 3 cm chunks. Toss with 6 g of the salt and leave for 15 minutes.',
            'Curăță vinetele de coajă în fâșii pe lungime, lăsând cam jumătate din coajă, și taie-le bucăți de 3 cm. Amestecă-le cu 6 g din sare și lasă-le 15 minute.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'fry',
          text: t(
            'Pat the chunks dry. Heat 30 ml of the oil in a large non-stick pan over medium-high heat and fry a third of the aubergine for about 6 minutes, turning, until golden and soft. Lift out onto a plate and repeat twice more with 30 ml of oil each time.',
            'Șterge bucățile cu un prosop. Încălzește 30 ml din ulei într-o tigaie mare antiaderentă, la foc mediu-mare, și prăjește o treime din vinete cam 6 minute, întorcându-le, până se rumenesc și se înmoaie. Scoate-le pe o farfurie și repetă de încă două ori, cu câte 30 ml de ulei.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'onion',
          text: t(
            'In the same pan, heat the remaining 20 ml of oil over medium heat. Cook the onions for 5 minutes until soft, adding the garlic for the last minute.',
            'În aceeași tigaie încălzește cei 20 ml de ulei rămași, la foc mediu. Călește ceapa 5 minute, până se înmoaie, și adaugă usturoiul în ultimul minut.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'meat',
          text: t(
            'Add the mince and cook for about 8 minutes, breaking it up, until no pink remains and it is grey-brown with clear juices.',
            'Adaugă carnea tocată și gătește aproximativ 8 minute, mărunțind-o, până nu mai are nicio urmă de roz și e cenușie-maronie, cu zeama limpede.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'peppers',
          text: t(
            'Add the sliced peppers and cook for 3 minutes. Stir in the tomato paste and cook for 1 minute. Add half of the tomatoes, chopped, with the remaining 6 g of salt, the black pepper and the pul biber, and cook for 5 minutes until jammy.',
            'Adaugă ardeii tăiați și gătește 3 minute. Amestecă pasta de roșii și gătește 1 minut. Adaugă jumătate din roșii, tocate, cu cele 6 g de sare rămase, piperul negru și pul biberul, și gătește 5 minute, până roșiile se topesc și sosul se leagă.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'assemble',
          text: t(
            'Boil 250 ml of water in a kettle. Spread the fried aubergine over the bottom of a wide, lidded pan about 28 cm across and spoon the meat over it. Slice the rest of the tomatoes and lay them on top, dot with the butter if using, and pour in the hot water carefully down the side.',
            'Fierbe 250 ml de apă la fierbător. Întinde vinetele prăjite pe fundul unei oale late, cu capac, de aproximativ 28 cm, și pune carnea deasupra. Taie restul de roșii felii, așază-le deasupra, adaugă bucățele de unt, dacă folosești, și toarnă cu grijă pe lângă marginea oalei apa fierbinte.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Bring to a gentle simmer, cover and cook over low heat for 20 minutes. Then uncover and cook for 10 minutes more, until the sauce is thick and the aubergine is very soft. Everything must be bubbling and steaming hot, at least 75 °C in the middle.',
            'Adu la un clocot ușor, acoperă și gătește la foc mic 20 de minute. Apoi descoperă și mai gătește 10 minute, până se îngroașă sosul și vinetele sunt foarte moi. Totul trebuie să facă clocote și să fie fierbinte, cu cel puțin 75 °C la mijloc.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'store',
          text: t(
            'Cool any leftovers and get them into the fridge within 2 hours of cooking. Keep them covered for up to 3 days and reheat until steaming hot all the way through.',
            'Răcește ce rămâne și pune-l la frigider în cel mult 2 ore de la gătit. Păstrează-l acoperit până la 3 zile și încălzește-l până devine fierbinte de tot, și la mijloc.',
          ),
        },
      ],
      tips: [
        t(
          'Use the oven for the aubergine if you prefer less oil: toss the chunks with 30 ml of oil and roast at 220 °C for about 25 minutes, turning once, until golden.',
          'Dacă vrei mai puțin ulei, coace vinetele în cuptor: amestecă bucățile cu 30 ml de ulei și coace la 220 °C cam 25 de minute, întorcându-le o dată, până se rumenesc.',
        ),
      ],
      stepTips: [
        {
          step: 'fry',
          text: t(
            'Fry in batches: a crowded pan steams the aubergine instead of browning it.',
            'Prăjește pe rând: într-o tigaie aglomerată vinetele se aburesc în loc să se rumenească.',
          ),
        },
      ],
      nutritionNote: t(
        'Aubergine, peppers and tomato make this a vegetable-heavy dish with fibre, and it has no cream or cheese. But fried aubergine soaks up a lot of oil, and the beef adds saturated fat. Serve with plain yogurt, and take care with the salt.',
        'Vinetele, ardeii și roșiile fac din ea o mâncare bogată în legume și fibre, fără smântână sau brânză. Vinetele prăjite însă absorb mult ulei, iar carnea de vită aduce grăsimi saturate. Servește cu iaurt simplu și ai grijă la sare.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Rice pilaf', 'Orez pilaf'),
          reason: t(
            'A buttery rice pilaf is a common partner for musakka in Turkey, and it soaks up the tomato sauce.',
            'Un orez pilaf cu unt se servește des cu musakka în Turcia și absoarbe sosul de roșii.',
          ),
          principle: 'regional_tradition',
          recipe: 'rice-pilaf',
        },
        {
          kind: 'food',
          label: t('Plain yogurt', 'Iaurt simplu'),
          reason: t(
            'Cool, tangy yogurt balances the warm, savoury sauce.',
            'Iaurtul răcoros și acrișor echilibrează sosul cald și sărat.',
          ),
          principle: 'complement_flavour',
          ingredient: 'yogurt',
        },
        {
          kind: 'drink',
          label: t('Ayran', 'Ayran'),
          reason: t(
            'A salty, cold yogurt drink is a common partner for Turkish home cooking, and it cools and cleanses the palate after the rich aubergine.',
            'O băutură rece de iaurt sărat se servește des la mâncarea turcească de casă și răcorește gura după vinetele bogate.',
          ),
          principle: 'regional_tradition',
          ingredient: 'drinking-yogurt',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A warm one-pan dish with a rich tomato sauce.',
            'O mâncare caldă, la o singură oală, cu sos bogat de roșii.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'The oily aubergine and meat can sit heavily before bed.',
            'Vinetele cu ulei și carnea pot cădea greu înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
