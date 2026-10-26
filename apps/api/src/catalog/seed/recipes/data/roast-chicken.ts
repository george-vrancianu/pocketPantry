import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Roast chicken base is the plain Sunday bird: butter, lemon, garlic and
// thyme on a bed of onion. Each Variant is a full Recipe with its own lines,
// steps and guidance; the base's Recipe-level Tips are inherited.
export const roastChicken: BaseRecipeSeed = {
  slug: 'roast-chicken',
  title: t('Roast chicken', 'Pui la cuptor'),
  servings: 4,
  prepMinutes: 20,
  cookMinutes: 80,
  difficulty: 'easy',
  lines: [
    { ingredient: 'whole-chicken', quantity: 1600, unit: 'g' },
    { ingredient: 'butter', quantity: 60, unit: 'g', note: t('soft', 'moale') },
    { ingredient: 'lemon', quantity: 1, unit: 'pcs' },
    {
      ingredient: 'garlic',
      quantity: 50,
      unit: 'g',
      note: t(
        'one head: 2 cloves crushed, the rest halved crosswise',
        'un cap: 2 căței zdrobiți, restul tăiat în jumătate pe orizontală',
      ),
    },
    { ingredient: 'thyme', quantity: 8, unit: 'g' },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('cut into wedges', 'tăiate în sferturi'),
    },
    { ingredient: 'salt', quantity: 10, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
    {
      ingredient: 'white-wine',
      quantity: 100,
      unit: 'ml',
      optional: true,
      note: t('to deglaze', 'pentru a deglasa tava'),
    },
    {
      ingredient: 'chicken-stock',
      quantity: 100,
      unit: 'ml',
      optional: true,
      note: t('instead of the wine', 'în locul vinului'),
    },
  ],
  steps: [
    {
      key: 'dry',
      text: t(
        'Take the chicken out of the fridge 30 minutes before roasting. Pat it very dry with paper towels, inside and out, then season it all over and inside the cavity with the salt and pepper.',
        'Scoate puiul din frigider cu 30 de minute înainte de a-l coace. Șterge-l bine cu șervețele de hârtie, pe dinăuntru și pe dinafară, apoi condimentează-l peste tot și în cavitate cu sare și piper.',
      ),
    },
    {
      key: 'preheat',
      text: t(
        'Heat the oven to 200°C (180°C fan) with the rack in the lower third.',
        'Încălzește cuptorul la 200°C (180°C cu ventilator), cu grătarul în treimea de jos.',
      ),
    },
    {
      key: 'butter',
      text: t(
        'Mix the butter with the crushed garlic and half of the thyme, chopped, until smooth.',
        'Amestecă untul cu usturoiul zdrobit și jumătate din cimbru tocat, până se omogenizează.',
      ),
    },
    {
      key: 'rub',
      text: t(
        'Slide your fingers between the skin and the breast to loosen it, and push about half of the butter under the skin. Rub the rest over the outside.',
        'Strecoară degetele între piele și piept ca s-o desprinzi și împinge aproximativ jumătate din unt sub piele. Unge restul pe exterior.',
      ),
    },
    {
      key: 'stuff',
      text: t(
        'Halve the lemon and put it in the cavity with the halved garlic and the remaining thyme sprigs. Tie the legs together with kitchen string.',
        'Taie lămâia în două și pune-o în cavitate împreună cu usturoiul tăiat și restul de crenguțe de cimbru. Leagă picioarele cu ață de bucătărie.',
      ),
    },
    {
      key: 'trivet',
      text: t(
        'Spread the onion wedges in a roasting tin and set the chicken on top, breast up.',
        'Întinde felii de ceapă într-o tavă și așază puiul deasupra, cu pieptul în sus.',
      ),
    },
    {
      key: 'roast',
      text: t(
        'Roast for 1 hour without opening the oven.',
        'Coace o oră, fără să deschizi cuptorul.',
      ),
      timerSeconds: 3600,
    },
    {
      key: 'check',
      text: t(
        'Check the bird. Roast for another 15 to 20 minutes, until the skin is deep golden and the juices run clear when you prick the thickest part of the thigh. A thermometer there should read 75°C. If the skin browns too fast, cover the breast loosely with foil.',
        'Verifică puiul. Mai coace încă 15-20 de minute, până când pielea e auriu închis, iar sucul curge limpede când înțepi partea cea mai groasă a coapsei. Un termometru băgat acolo trebuie să arate 75°C. Dacă pielea se rumenește prea repede, acoperă pieptul lejer cu folie.',
      ),
    },
    {
      key: 'rest',
      text: t(
        'Lift the chicken onto a board, tip the juices from the cavity into the tin, and cover it loosely with foil. Rest for 15 minutes.',
        'Ridică puiul pe un tocător, toarnă sucul din cavitate în tavă și acoperă-l lejer cu folie. Lasă-l să se odihnească 15 minute.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'sauce',
      text: t(
        'While the chicken rests, spoon off most of the fat from the tin. Set the tin over medium heat, pour in the wine (or stock) and scrape up the browned bits. Simmer for about 3 minutes, until slightly reduced, then strain into a jug.',
        'Cât se odihnește puiul, ia cu lingura cea mai mare parte din grăsime din tavă. Pune tava la foc mediu, toarnă vinul (sau supa) și răzuiește bucățile rumenite de pe fund. Fierbe aproximativ 3 minute, până scade puțin, apoi strecoară într-un vas.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'carve',
      text: t(
        'Carve the chicken and serve with the pan juices and the soft roasted onion.',
        'Taie puiul porții și servește-l cu sosul din tavă și ceapa coaptă, moale.',
      ),
    },
  ],
  tips: [
    t(
      'Dry skin is crisp skin: if you have time, salt the chicken the day before and leave it uncovered in the fridge overnight, then skip the salt in the first step.',
      'Pielea uscată iese crocantă: dacă ai timp, sărează puiul cu o zi înainte și lasă-l necoperit în frigider peste noapte, apoi sari peste sare la primul pas.',
    ),
    t(
      'Do not carve straight away. Resting lets the juices settle back into the meat, so it stays moist instead of running onto the board.',
      'Nu tăia puiul imediat. Odihna lasă sucurile să se așeze înapoi în carne, care rămâne suculentă în loc să curgă pe tocător.',
    ),
    t(
      'A small meat thermometer is the surest way to know a chicken is cooked: breast meat dries out quickly if you roast "to be safe".',
      'Un termometru mic de carne e cea mai sigură metodă să știi că puiul e copt: pieptul se usucă repede dacă îl ții în cuptor „ca să fie sigur”.',
    ),
  ],
  stepTips: [
    {
      step: 'trivet',
      text: t(
        'The onions lift the bird off the tin so the underside does not stew, and they flavour the juices for the sauce.',
        'Ceapa ridică puiul de pe fundul tăvii, ca partea de jos să nu fiarbă, și dă gust sosului din tavă.',
      ),
    },
    {
      step: 'rub',
      text: t(
        'Butter under the skin bastes the breast from inside, so you do not need to open the oven to baste.',
        'Untul de sub piele udă pieptul dinăuntru, așa că nu mai e nevoie să deschizi cuptorul ca să-l uzi.',
      ),
    },
  ],
  nutritionNote: t(
    'A good source of protein, and roasting on onions adds vegetables to the plate; the skin and butter bring saturated fat, so take less skin if you watch fat. Serve with vegetables or salad, since the bird itself has no fibre.',
    'Sursă bună de proteine, iar ceapa din tavă adaugă legume în farfurie; pielea și untul aduc grăsimi saturate, așa că ia mai puțină piele dacă ții cont de grăsimi. Servește cu legume sau salată, pentru că puiul în sine nu are fibre.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Buttery mashed potatoes', 'Piure de cartofi cu unt'),
      reason: t(
        'Soft mash soaks up the pan juices: the classic Sunday roast plate.',
        'Piureul moale se îmbibă cu sosul din tavă: farfuria clasică de duminică.',
      ),
      principle: 'regional_tradition',
      recipe: 'potato-puree',
    },
    {
      kind: 'food',
      label: t('Green beans', 'Fasole verde'),
      reason: t(
        'Their fresh snap and green flavour lighten the rich, buttery meat.',
        'Textura crocantă și gustul proaspăt al fasolei ușurează carnea bogată, cu unt.',
      ),
      principle: 'contrast_texture',
      ingredient: 'green-beans',
    },
    {
      kind: 'food',
      label: t('Lemon', 'Lămâie'),
      reason: t(
        'A squeeze over the carved meat cuts through the fat of the skin.',
        'Câteva picături peste carnea tăiată taie grăsimea pielii.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'lemon',
    },
    {
      kind: 'drink',
      label: t('Dry white wine', 'Vin alb sec'),
      reason: t(
        'Crisp acidity refreshes the palate after butter and crisp skin.',
        'Aciditatea fină împrospătează gustul după unt și pielea crocantă.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'white-wine',
    },
    {
      kind: 'drink',
      label: t('Dry cider', 'Cidru sec'),
      reason: t(
        'Its crisp apple acidity cuts through the buttery skin and goes well with thyme.',
        'Aciditatea de măr a cidrului taie pielea cu unt și se potrivește cu cimbrul.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'cider',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot oven and a hearty plate warm the house and the table.',
        'Cuptorul încins și o farfurie sățioasă încălzesc casa și masa.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Plenty of protein for recovery; add potatoes for carbohydrates.',
        'Multe proteine pentru refacere; adaugă cartofi pentru carbohidrați.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A large roast dinner with skin sits heavy before bed.',
        'O masă mare de pui cu piele cade greu înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'roast-chicken-scandinavian',
      cuisine: 'scandinavian',
      title: t(
        'Danish roast chicken with parsley',
        'Pui la cuptor umplut cu pătrunjel, ca în Danemarca',
      ),
      servings: 4,
      prepMinutes: 40,
      cookMinutes: 90,
      difficulty: 'medium',
      lines: [
        { ingredient: 'whole-chicken', quantity: 1600, unit: 'g' },
        {
          ingredient: 'parsley',
          quantity: 60,
          unit: 'g',
          note: t(
            'a big bunch, stalks and leaves, chopped',
            'un mănunchi mare, cu tulpini și frunze, tocat',
          ),
        },
        {
          ingredient: 'butter',
          quantity: 100,
          unit: 'g',
          note: t('soft', 'moale'),
        },
        {
          ingredient: 'salt',
          quantity: 20,
          unit: 'g',
          note: t(
            '12 g for the chicken and salad, the rest for the potato water',
            '12 g pentru pui și salată, restul pentru apa cartofilor',
          ),
        },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
        {
          ingredient: 'still-water',
          quantity: 0.26,
          unit: 'l',
          note: t(
            '60 ml for the salad, the rest for the roasting pot',
            '60 ml pentru salată, restul pentru oala de copt',
          ),
        },
        { ingredient: 'whipping-cream', quantity: 200, unit: 'ml' },
        { ingredient: 'potato', quantity: 1, unit: 'kg' },
        { ingredient: 'cucumber', quantity: 1, unit: 'pcs' },
        { ingredient: 'vinegar', quantity: 60, unit: 'ml' },
        { ingredient: 'sugar', quantity: 30, unit: 'g' },
      ],
      steps: [
        {
          key: 'salad',
          text: t(
            'Slice the cucumber as thinly as you can and lay it in a bowl. Stir the vinegar, 60 ml of the water, the sugar and 2 g of the salt until dissolved, pour over the cucumber and leave to pickle while you cook.',
            'Taie castravetele cât mai subțire și pune-l într-un castron. Amestecă oțetul, 60 ml din apă, zahărul și 2 g din sare până se dizolvă, toarnă peste castravete și lasă-l la murat cât gătești.',
          ),
        },
        {
          key: 'filling',
          text: t(
            'Heat the oven to 200°C (180°C fan). Mash 60 g of the butter with the chopped parsley, 4 g of the salt and half of the pepper.',
            'Încălzește cuptorul la 200°C (180°C cu ventilator). Amestecă 60 g din unt cu pătrunjelul tocat, 4 g de sare și jumătate din piper.',
          ),
        },
        {
          key: 'stuff',
          text: t(
            'Pat the chicken dry. Pack the parsley butter into the cavity and close the opening with a toothpick or tie the legs together. Rub the outside with the remaining salt and pepper.',
            'Șterge puiul bine. Umple cavitatea cu untul cu pătrunjel și închide deschiderea cu o scobitoare sau leagă picioarele. Freacă exteriorul cu sarea și piperul rămase.',
          ),
        },
        {
          key: 'brown',
          text: t(
            'Melt the remaining butter in a large ovenproof pot over medium-high heat. Brown the chicken for 2 to 3 minutes on each side and on the back, until golden all over, then set it breast up.',
            'Topește untul rămas într-o oală mare care intră în cuptor, la foc mediu spre mare. Rumenește puiul 2-3 minute pe fiecare parte și pe spate, până devine auriu peste tot, apoi așază-l cu pieptul în sus.',
          ),
        },
        {
          key: 'roast',
          text: t(
            'Pour 200 ml of the water into the pot and roast for 1 hour 10 minutes, uncovered.',
            'Toarnă 200 ml din apă în oală și coace 1 oră și 10 minute, fără capac.',
          ),
          timerSeconds: 4200,
        },
        {
          key: 'potatoes',
          text: t(
            'Meanwhile peel the potatoes, halve the large ones and boil them in water with the extra salt for 20 to 25 minutes, until a knife slides in easily. Drain and keep warm.',
            'Între timp curăță cartofii, taie-i pe jumătate pe cei mari și fierbe-i în apă cu sarea rămasă 20-25 de minute, până intră ușor cuțitul. Scurge-i și ține-i la cald.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'check',
          text: t(
            'Check that the skin is golden and the juices run clear when you prick the thickest part of the thigh; a thermometer there should read 75°C. Roast longer if there is any pink.',
            'Verifică dacă pielea e aurie și sucul curge limpede când înțepi partea cea mai groasă a coapsei; un termometru acolo trebuie să arate 75°C. Mai coace dacă mai e vreo urmă de roz.',
          ),
        },
        {
          key: 'rest',
          text: t(
            'Move the chicken to a board and cover loosely with foil. Rest for 15 minutes.',
            'Mută puiul pe un tocător și acoperă-l lejer cu folie. Lasă-l să se odihnească 15 minute.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'sauce',
          text: t(
            'Spoon off excess fat from the pot, stir in the cream and the parsley butter from the cavity, and simmer over medium heat for 5 minutes, until slightly thickened. Taste and add salt if needed.',
            'Ia excesul de grăsime din oală, adaugă smântâna lichidă și untul cu pătrunjel din cavitate și fierbe la foc mediu 5 minute, până se îngroașă puțin. Gustă și adaugă sare dacă e nevoie.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'serve',
          text: t(
            'Carve the chicken and serve with the potatoes, the cream sauce and the drained cucumber salad.',
            'Taie puiul porții și servește cu cartofii, sosul cremos și salata de castraveți scursă.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'stuff',
          text: t(
            'Do not pack the parsley butter in hard: it melts into the meat as it roasts and needs room to spread.',
            'Nu îndesa prea tare untul cu pătrunjel: se topește în carne în timp ce se coace și are nevoie de loc.',
          ),
        },
        {
          step: 'sauce',
          text: t(
            'If the sauce is too thin, simmer it a few minutes longer.',
            'Dacă sosul e prea subțire, mai fierbe-l câteva minute.',
          ),
        },
      ],
      nutritionNote: t(
        'Parsley adds vitamins and the cucumber salad is light, but the butter stuffing, the cream sauce and the skin make this a rich dish with a lot of saturated fat. Take a little sauce, and fill up on the potatoes and cucumber.',
        'Pătrunjelul aduce vitamine, iar salata de castraveți e ușoară, dar umplutura cu unt, sosul cremos și pielea fac din asta un fel bogat, cu multe grăsimi saturate. Pune puțin sos și umple farfuria cu cartofi și castraveți.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Quick cucumber salad', 'Salată rapidă de castraveți'),
          reason: t(
            'The sweet-sour crunch cuts through the butter and cream.',
            'Crocantul dulce-acrișor taie untul și frișca.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'cucumber',
        },
        {
          kind: 'food',
          label: t('Boiled potatoes', 'Cartofi fierți'),
          reason: t(
            'Plain potatoes carry the creamy parsley sauce, as on a Danish Sunday table.',
            'Cartofii simpli țin sosul cremos cu pătrunjel, ca pe masa daneză de duminică.',
          ),
          principle: 'regional_tradition',
          ingredient: 'potato',
        },
        {
          kind: 'food',
          label: t('Pickled red cabbage', 'Varză roșie murată'),
          reason: t(
            'Its sharp sweetness cuts the cream and butter, a common side for Danish roast poultry.',
            'Dulceața ei acrișoară taie smântâna și untul, o garnitură obișnuită pentru păsările la cuptor daneze.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'red-cabbage',
        },
        {
          kind: 'drink',
          label: t('Lager', 'Bere blondă'),
          reason: t(
            'Cold bubbles and light bitterness balance the cream and butter.',
            'Bulele reci și amăreala ușoară echilibrează frișca și untul.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'beer',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A warming, filling Sunday dinner.',
            'O masă de duminică caldă și sățioasă.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Butter, cream and skin sit heavy before bed.',
            'Untul, frișca și pielea cad greu înainte de culcare.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'A rich cream sauce is too heavy before exercise.',
            'Un sos gras, cu smântână, e prea greu înainte de efort.',
          ),
        },
      ],
    },
    {
      slug: 'roast-chicken-middle-eastern',
      cuisine: 'middle-eastern',
      // This one marinates wet and covered, not salted and left to dry.
      hideBaseTips: [0],
      title: t(
        'Roast chicken with sumac and toum',
        'Pui la cuptor cu sumac și toum (sos de usturoi)',
      ),
      servings: 4,
      prepMinutes: 30,
      cookMinutes: 80,
      difficulty: 'medium',
      lines: [
        { ingredient: 'whole-chicken', quantity: 1600, unit: 'g' },
        { ingredient: 'lemon', quantity: 2, unit: 'pcs' },
        {
          ingredient: 'garlic',
          quantity: 70,
          unit: 'g',
          note: t(
            '20 g in the marinade, 50 g for the toum',
            '20 g în marinadă, 50 g pentru toum',
          ),
        },
        { ingredient: 'olive-oil', quantity: 60, unit: 'ml' },
        { ingredient: 'sumac', quantity: 6, unit: 'g' },
        { ingredient: 'allspice', quantity: 3, unit: 'g' },
        { ingredient: 'cinnamon', quantity: 2, unit: 'g' },
        {
          ingredient: 'red-onion',
          quantity: 2,
          unit: 'pcs',
          note: t('thickly sliced', 'tăiată în rondele groase'),
        },
        { ingredient: 'sunflower-oil', quantity: 250, unit: 'ml' },
        {
          ingredient: 'parsley',
          quantity: 20,
          unit: 'g',
          note: t('chopped, to serve', 'tocat, pentru servire'),
        },
        { ingredient: 'salt', quantity: 14, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
      ],
      steps: [
        {
          key: 'marinade',
          text: t(
            'Crush 20 g of the garlic and mix it with the juice of 1 lemon, the olive oil, sumac, allspice, cinnamon, 10 g of the salt and the pepper.',
            'Zdrobește 20 g din usturoi și amestecă-l cu zeama de la o lămâie, uleiul de măsline, sumacul, ienibaharul, scorțișoara, 10 g de sare și piperul.',
          ),
        },
        {
          key: 'rub',
          text: t(
            'Pat the chicken dry, then rub the marinade over the whole bird and into the cavity, working a little under the breast skin. Cover and refrigerate for at least 2 hours, or overnight.',
            'Șterge puiul bine, apoi freacă marinada peste tot și în cavitate, băgând puțin și sub pielea de pe piept. Acoperă și ține la frigider cel puțin 2 ore, sau peste noapte.',
          ),
        },
        {
          key: 'preheat',
          text: t(
            'Take the chicken out 30 minutes before roasting. Heat the oven to 200°C (180°C fan).',
            'Scoate puiul din frigider cu 30 de minute înainte de copt. Încălzește cuptorul la 200°C (180°C cu ventilator).',
          ),
        },
        {
          key: 'trivet',
          text: t(
            'Spread the sliced red onion in a roasting tin and set the chicken on top, breast up. Tie the legs together.',
            'Întinde ceapa roșie tăiată într-o tavă și așază puiul deasupra, cu pieptul în sus. Leagă picioarele.',
          ),
        },
        {
          key: 'roast',
          text: t('Roast for 1 hour.', 'Coace o oră.'),
          timerSeconds: 3600,
        },
        {
          key: 'check',
          text: t(
            'Roast for another 15 to 20 minutes, until the skin is deep golden and the juices run clear when you prick the thickest part of the thigh. A thermometer there should read 75°C.',
            'Mai coace încă 15-20 de minute, până când pielea e auriu închis, iar sucul curge limpede când înțepi partea cea mai groasă a coapsei. Un termometru acolo trebuie să arate 75°C.',
          ),
        },
        {
          key: 'rest',
          text: t(
            'Move the chicken to a board and cover loosely with foil. Rest for 15 minutes.',
            'Mută puiul pe un tocător și acoperă-l lejer cu folie. Lasă-l să se odihnească 15 minute.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'toum-base',
          text: t(
            'While it rests, make the toum. Peel the remaining garlic and remove any green germ. Blend it in a small food processor with the remaining 4 g of salt until it forms a fine paste, scraping down the sides.',
            'Cât se odihnește puiul, fă toumul. Curăță usturoiul rămas și scoate mugurele verde. Mixează-l într-un robot mic cu cele 4 g de sare rămase până face o pastă fină, răzuind pereții vasului.',
          ),
        },
        {
          key: 'toum-oil',
          text: t(
            'With the motor running, add the sunflower oil in a very thin trickle, a spoonful at a time at first, alternating with the juice of the second lemon, until the toum is thick, white and fluffy like mayonnaise.',
            'Cu robotul pornit, adaugă uleiul de floarea soarelui într-un firicel foarte subțire, la început câte o lingură, alternând cu zeama de la a doua lămâie, până când toumul devine gros, alb și pufos ca maioneza.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Carve the chicken, scatter with parsley and serve with the soft roasted onion and the toum.',
            'Taie puiul porții, presară pătrunjel și servește cu ceapa coaptă, moale, și cu toumul.',
          ),
        },
      ],
      tips: [
        t(
          'Start at least 2 hours ahead, or the night before: the chicken needs time in the marinade.',
          'Începe cu cel puțin 2 ore înainte, sau cu o seară înainte: puiul are nevoie de timp în marinadă.',
        ),
      ],
      stepTips: [
        {
          step: 'toum-oil',
          text: t(
            'Keep any leftover toum covered in the fridge and use it within 4 days; raw garlic kept in oil is not safe to store for long.',
            'Păstrează toumul rămas acoperit la frigider și folosește-l în cel mult 4 zile; usturoiul crud ținut în ulei nu e sigur la păstrare îndelungată.',
          ),
        },
        {
          step: 'toum-oil',
          text: t(
            'Add the oil slowly: if it goes in too fast the toum splits and turns oily instead of fluffy.',
            'Adaugă uleiul încet: dacă intră prea repede, toumul se taie și iese uleios în loc de pufos.',
          ),
        },
        {
          step: 'marinade',
          text: t(
            'Sumac is sour, not hot: it adds a lemony tang and a deep red colour to the skin.',
            'Sumacul e acrișor, nu iute: dă pielii un gust de lămâie și o culoare roșie intensă.',
          ),
        },
      ],
      nutritionNote: t(
        'Plenty of protein, and the lemon, spices and roasted onion bring flavour and some vitamins; the skin, the oil in the marinade and the toum add a lot of fat, so go easy on the toum. Garlic is strong, so use less if it upsets your stomach.',
        'Multe proteine, iar lămâia, condimentele și ceapa coaptă aduc gust și ceva vitamine; pielea, uleiul din marinadă și toumul adaugă multă grăsime, așa că ia toum cu măsură. Usturoiul e puternic, așa că folosește mai puțin dacă te supără la stomac.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Meze platter', 'Platou de aperitive levantin'),
          reason: t(
            'Hummus, pickles and flatbread alongside the chicken and toum make a shared table.',
            'Humus, murături și lipie lângă pui și toum fac o masă pentru împărțit.',
          ),
          principle: 'regional_tradition',
          recipe: 'appetizer-platter-levantine',
        },
        {
          kind: 'food',
          label: t('Warm pita', 'Lipie caldă'),
          reason: t(
            'Soft bread to wipe up the juices and scoop the toum.',
            'Pâine moale cu care ștergi sucul și iei toumul.',
          ),
          principle: 'complement_flavour',
          ingredient: 'pita',
        },
        {
          kind: 'food',
          label: t('Pickled cucumbers', 'Castraveți murați'),
          reason: t(
            'Sharp brine cuts through the garlic sauce and the roast skin.',
            'Saramura acră taie sosul de usturoi și pielea rumenită.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-cucumbers',
        },
        {
          kind: 'drink',
          label: t('Sparkling water with lemon', 'Apă minerală cu lămâie'),
          reason: t(
            'Cleans the palate between garlicky bites.',
            'Curăță gustul între îmbucăturile cu usturoi.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'sparkling-water',
        },
      ],
      eatingMoments: [
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein for recovery, with pita for carbohydrates.',
            'Proteine pentru refacere, iar lipia aduce carbohidrați.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Raw garlic and a heavy meal can disturb sleep.',
            'Usturoiul crud și o masă grea îți pot strica somnul.',
          ),
        },
      ],
    },
    {
      slug: 'roast-chicken-spatchcocked',
      method: 'spatchcocked',
      // The base tips on resting and thermometer still apply; nothing to hide.
      title: t(
        'Spatchcocked roast chicken',
        'Pui la cuptor desfăcut în fluture',
      ),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 45,
      difficulty: 'medium',
      lines: [
        { ingredient: 'whole-chicken', quantity: 1600, unit: 'g' },
        { ingredient: 'olive-oil', quantity: 30, unit: 'ml' },
        {
          ingredient: 'garlic',
          quantity: 20,
          unit: 'g',
          note: t('crushed', 'zdrobit'),
        },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t('zest and juice', 'coajă și zeamă'),
        },
        {
          ingredient: 'rosemary',
          quantity: 8,
          unit: 'g',
          note: t('leaves, finely chopped', 'frunze, tocate mărunt'),
        },
        { ingredient: 'salt', quantity: 10, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 220°C (200°C fan) with a rack in the upper third.',
            'Încălzește cuptorul la 220°C (200°C cu ventilator), cu grătarul în treimea de sus.',
          ),
        },
        {
          key: 'cut',
          text: t(
            'Set the chicken breast down. With strong kitchen scissors, cut along both sides of the backbone from tail to neck and lift the backbone out. Keep it for stock.',
            'Așază puiul cu pieptul în jos. Cu o foarfecă puternică de bucătărie, taie pe ambele părți ale spinării, de la coadă la gât, și scoate spinarea. Păstreaz-o pentru supă.',
          ),
        },
        {
          key: 'flatten',
          text: t(
            'Turn the bird over, open it like a book and press hard on the breastbone until you feel it crack and the chicken lies flat. Pat it very dry.',
            'Răstoarnă puiul, desfă-l ca pe o carte și apasă ferm pe osul pieptului până simți că trosnește osul și puiul stă plat. Șterge-l bine.',
          ),
        },
        {
          key: 'season',
          text: t(
            'Mix the garlic and rosemary with a little of the salt and push it under the skin of the breast and thighs. Rub the olive oil, lemon zest and juice, remaining salt and the pepper over the outside.',
            'Amestecă usturoiul și rozmarinul cu puțină sare și bagă-le sub pielea de pe piept și de pe pulpe. Freacă uleiul de măsline, coaja și zeama de lămâie, sarea rămasă și piperul pe exterior.',
          ),
        },
        {
          key: 'tray',
          text: t(
            'Lay the chicken skin side up on a rack set over a roasting tin, or directly on the tin, and tuck the wing tips under.',
            'Așază puiul cu pielea în sus pe un grătar pus peste o tavă, sau direct în tavă, și bagă vârfurile aripilor dedesubt.',
          ),
        },
        {
          key: 'roast',
          text: t('Roast for 35 minutes.', 'Coace 35 de minute.'),
          timerSeconds: 2100,
        },
        {
          key: 'check',
          text: t(
            'Check the bird. Roast for another 5 to 10 minutes, until the skin is crisp and deep golden and the juices run clear from the thickest part of the thigh. A thermometer there should read 75°C.',
            'Verifică puiul. Mai coace 5-10 minute, până când pielea e crocantă și auriu închis, iar sucul curge limpede din partea cea mai groasă a coapsei. Un termometru acolo trebuie să arate 75°C.',
          ),
        },
        {
          key: 'rest',
          text: t(
            'Rest on a board, uncovered, for 10 minutes, then carve.',
            'Lasă puiul pe un tocător, necoperit, 10 minute, apoi taie-l porții.',
          ),
          timerSeconds: 600,
        },
      ],
      stepTips: [
        {
          step: 'flatten',
          text: t(
            'An even, flat bird cooks at the same speed everywhere, so the legs are done when the breast is, and the skin crisps all over.',
            'Un pui plat și uniform se coace la fel peste tot, deci pulpele sunt gata odată cu pieptul, iar pielea se rumenește peste tot.',
          ),
        },
      ],
      nutritionNote: t(
        'Roasting hot on a rack lets some fat drip away, and the crisp skin needs no extra butter; it is still skin, so it brings saturated fat. A good source of protein, with no fibre until you serve vegetables or salad with it.',
        'Coptul la foc mare pe grătar lasă o parte din grăsime să se scurgă, iar pielea crocantă nu are nevoie de unt în plus; rămâne totuși piele, deci aduce grăsimi saturate. Sursă bună de proteine, fără fibre până îi adaugi legume sau salată.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Roast potatoes', 'Cartofi copți'),
          reason: t(
            'Roast them in the tin under the rack so they catch the juices.',
            'Coace-i în tava de sub grătar, ca să prindă sucurile.',
          ),
          principle: 'fat_carries_flavour',
          ingredient: 'potato',
        },
        {
          kind: 'food',
          label: t('Lemon wedges', 'Felii de lămâie'),
          reason: t(
            'Fresh acidity cuts through the crisp, fatty skin.',
            'Aciditatea proaspătă taie pielea crocantă și grasă.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'lemon',
        },
        {
          kind: 'food',
          label: t('Rocket salad', 'Salată de rucola'),
          reason: t(
            'Peppery, cold leaves contrast with the hot, crisp chicken.',
            'Frunzele piperate și reci fac contrast cu puiul fierbinte și crocant.',
          ),
          principle: 'contrast_texture',
          ingredient: 'rocket',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Crisp acidity echoes the lemon and rosemary.',
            'Aciditatea fină se potrivește cu lămâia și rozmarinul.',
          ),
          principle: 'complement_flavour',
          ingredient: 'white-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein for recovery, and quicker than a whole bird.',
            'Proteine pentru refacere, și mai repede gata decât un pui întreg.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot oven and a crisp, hot dinner.',
            'Cuptor încins și o cină fierbinte, crocantă.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A big roast with skin is heavy right before bed.',
            'Un pui mare, cu piele, cade greu chiar înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
