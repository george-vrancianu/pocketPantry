import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Iahnie de fasole base is the everyday Romanian meatless (de post) bean
// stew: soaked white beans, plenty of slowly softened onion, tomato paste and
// paprika, savory (cimbru). Each Variant is a full Recipe with its own lines,
// steps and guidance; the base's Recipe-level Tips are inherited, the Greek Variant
// inherits all three; the American one hides the sugar-after-tender Tip (molasses
// goes in before the beans are tender, on purpose).
export const iahnieDeFasole: BaseRecipeSeed = {
  slug: 'iahnie-de-fasole',
  title: t(
    'Iahnie de fasole (Romanian white bean stew with onion and tomato)',
    'Iahnie de fasole',
  ),
  servings: 6,
  prepMinutes: 495,
  cookMinutes: 110,
  difficulty: 'easy',
  lines: [
    { ingredient: 'white-beans', quantity: 500, unit: 'g' },
    { ingredient: 'still-water', quantity: 5, unit: 'l' },
    { ingredient: 'sunflower-oil', quantity: 100, unit: 'ml' },
    {
      ingredient: 'onion',
      quantity: 4,
      unit: 'pcs',
      note: t('medium, finely chopped', 'medii, tăiate mărunt'),
    },
    {
      ingredient: 'carrot',
      quantity: 100,
      unit: 'g',
      optional: true,
      note: t('grated', 'ras'),
    },
    {
      ingredient: 'bell-pepper',
      quantity: 1,
      unit: 'pcs',
      optional: true,
      note: t('red, diced', 'roșu, tăiat cubulețe'),
    },
    { ingredient: 'tomato-paste', quantity: 45, unit: 'g' },
    { ingredient: 'paprika', quantity: 5, unit: 'g' },
    { ingredient: 'bay-leaves', quantity: 0.4, unit: 'g' },
    { ingredient: 'savory', quantity: 2, unit: 'g' },
    {
      ingredient: 'garlic',
      quantity: 15,
      unit: 'g',
      note: t('crushed', 'pisat'),
    },
    {
      ingredient: 'parsley',
      quantity: 15,
      unit: 'g',
      note: t('chopped', 'tocat'),
    },
    { ingredient: 'salt', quantity: 12, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
  ],
  steps: [
    {
      key: 'soak',
      text: t(
        'Rinse the beans, put them in a large bowl and cover with 2 litres of cold water. Leave them to soak overnight, about 8 hours.',
        'Spală fasolea, pune-o într-un bol mare și acoperă-o cu 2 litri de apă rece. Las-o la înmuiat peste noapte, aproximativ 8 ore.',
      ),
      timerSeconds: 28800,
    },
    {
      key: 'boil-hard',
      text: t(
        'Drain the beans and put them in a large pot with 1.5 litres of fresh water. Bring to a full, rolling boil and boil hard for 10 minutes. Drain and throw away this water.',
        'Scurge fasolea și pune-o într-o oală mare cu 1,5 litri de apă proaspătă. Adu la clocot și fierbe în clocot puternic 10 minute. Scurge și aruncă apa.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'simmer',
      text: t(
        'Cover the beans with 1.5 litres of fresh hot water, bring to the boil, then turn the heat down and simmer, half covered, for about 60 minutes, until a bean crushes easily between two fingers.',
        'Acoperă fasolea cu 1,5 litri de apă fierbinte proaspătă, adu la fiert, apoi dă focul mai mic și lasă să fiarbă încet, cu capacul pe jumătate, circa 60 de minute, până când o boabă se strivește ușor între două degete.',
      ),
      timerSeconds: 3600,
    },
    {
      key: 'onions',
      text: t(
        'While the beans simmer, warm the oil in a wide, deep pan over medium-low heat. Add the onions, the carrot and the pepper, if you use them, with a pinch of the salt. Cook for 15 minutes, stirring now and then, until very soft and golden.',
        'Cât fierbe fasolea, încălzește uleiul într-o cratiță largă și adâncă, la foc mic-mediu. Adaugă ceapa, morcovul și ardeiul, dacă le folosești, cu un praf de sare (din cea măsurată). Călește 15 minute, amestecând din când în când, până când ceapa e foarte moale și aurie.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'paste',
      text: t(
        'Stir in the tomato paste and the paprika and cook for 1 minute, stirring all the time so the paprika does not burn. If the beans are not tender yet, take the pan off the heat.',
        'Adaugă pasta de roșii și boiaua și gătește 1 minut, amestecând întruna ca boiaua să nu se ardă. Dacă fasolea nu e încă fiartă, ia cratița de pe foc.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'combine',
      text: t(
        'Scoop 300 ml of the bean cooking liquid into a jug, then drain the beans. Tip them into the onion pan with the 300 ml of liquid, the bay leaves, the savory, the rest of the salt and the pepper. Simmer uncovered for 20 minutes, stirring gently, until the stew is thick, not soupy. Crush a few beans against the side of the pan to thicken it.',
        'Pune într-o cană 300 ml din zeama în care a fiert fasolea, apoi scurge fasolea. Toarn-o în cratița cu ceapă împreună cu cei 300 ml de zeamă, dafinul, cimbrul, restul de sare și piperul. Fierbe 20 de minute, fără capac, amestecând ușor, până când mâncarea se îngroașă și nu mai e supă. Strivește câteva boabe de marginea cratiței ca să lege mai bine.',
      ),
      timerSeconds: 1200,
    },
    {
      key: 'finish',
      text: t(
        'Take the pan off the heat, fish out the bay leaves and stir in the garlic and the parsley. Taste and add salt if needed. Leave to rest for 10 minutes before serving, warm or at room temperature.',
        'Ia cratița de pe foc, scoate foile de dafin și adaugă usturoiul și pătrunjelul și amestecă. Gustă și mai adaugă sare, dacă e nevoie. Las-o să stea 10 minute înainte de servire; iahnia se mănâncă caldă sau la temperatura camerei.',
      ),
      timerSeconds: 600,
    },
  ],
  tips: [
    t(
      'If the beans need more water while they simmer, top up with boiling water from the kettle; cold water stops the simmer.',
      'Dacă fasolea mai cere apă în timp ce fierbe, adaugă apă clocotită din fierbător; apa rece oprește fierberea.',
    ),
    t(
      'Add tomato, vinegar or sugar only once the beans are tender: acid and sugar keep the skins firm, so beans that are still hard stay hard.',
      'Adaugă roșiile, oțetul sau zahărul abia după ce boabele s-au înmuiat: aciditatea și zahărul țin pielița tare, iar boabele nefierte de tot rămân tari.',
    ),
    t(
      'Beans taste better the next day, when the flavours settle and the sauce thickens. Reheat gently with a splash of water. Cool leftovers and refrigerate them within 2 hours; they keep 3 to 4 days.',
      'Fasolea e mai bună a doua zi, când aromele se leagă și sosul se îngroașă. Încălzește-o încet, cu puțină apă. Răcește resturile și pune-le la frigider în cel mult 2 ore; se păstrează 3–4 zile.',
    ),
  ],
  stepTips: [
    {
      step: 'soak',
      text: t(
        'With canned beans, use about 1.1 kg drained and rinsed (4 to 5 tins of 400 g), skip the soaking, boiling and simmering steps (they are already cooked) and add 300 ml of water instead of the cooking liquid when you combine the beans with the onions. Simmer them in the sauce for 10 minutes.',
        'Dacă folosești fasole la conservă, ia circa 1,1 kg scursă și clătită (4-5 conserve de 400 g), sari peste înmuiere și fierbere (e deja fiartă) și adaugă 300 ml de apă în locul zemii de fiert, când pui fasolea peste ceapă. Fierbe-o în sos 10 minute.',
      ),
    },
    {
      step: 'boil-hard',
      text: t(
        'Raw dried beans contain a natural compound that upsets the stomach. A hard rolling boil of at least 10 minutes destroys it; heat below a full boil (around 80 °C) does not.',
        'Fasolea uscată crudă conține o substanță naturală care irită stomacul. Un clocot puternic de cel puțin 10 minute o distruge, iar o căldură sub clocot (în jur de 80 °C) nu.',
      ),
    },
    {
      step: 'onions',
      text: t(
        'Be patient with the onions: slow, gentle heat turns them sweet. If they start to catch, add a spoonful of water rather than turning up the heat.',
        'Ai răbdare cu ceapa: focul mic o face dulce. Dacă începe să se prindă, pune o lingură de apă, nu mări focul.',
      ),
    },
  ],
  nutritionNote: t(
    'Beans bring plenty of fibre and plant protein and keep you full, and the sunflower oil is mostly unsaturated fat. The oil adds a good share of the calories, and the pickles and bread served with it add salt and starch. Beans can cause wind if you are not used to them.',
    'Fasolea aduce multe fibre și proteine vegetale și te satură, iar uleiul de floarea soarelui e în mare parte grăsime nesaturată. Totuși, uleiul adaugă o bună parte din calorii, iar murăturile și pâinea servite alături adaugă sare și amidon. Fasolea poate provoca balonare dacă nu ești obișnuit cu ea.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sharp, salty sourness cuts through the oily, soft beans.',
        'Aciditatea lor ascuțită și sărată taie din ulei și din moliciunea fasolei.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'food',
      label: t('Country bread', 'Pâine de casă'),
      reason: t(
        'A crusty slice soaks up the thick sauce and gives the soft beans something to bite against.',
        'O felie cu crustă se îmbibă cu sosul gros și oferă fasolei moi un contrast la mestecat.',
      ),
      principle: 'contrast_texture',
      ingredient: 'country-bread',
    },
    {
      kind: 'food',
      label: t(
        'Smoked sausages (on a non-fasting day)',
        'Cârnați afumați (în zilele de dulce)',
      ),
      reason: t(
        'Their smoke and salt suit the sweet onion and paprika; leave them out and the dish stays meatless.',
        'Afumătura și sarea lor se potrivesc cu ceapa dulce și cu boiaua; fără ei, mâncarea rămâne de post.',
      ),
      principle: 'complement_flavour',
      ingredient: 'smoked-sausages',
    },
    {
      kind: 'food',
      label: t('Pickled peppers', 'Ardei murați'),
      reason: t(
        'A crunchy, sour bite against the soft, thick stew.',
        'O îmbucătură crocantă și acrișoară pe lângă mâncarea moale și groasă.',
      ),
      principle: 'contrast_texture',
      ingredient: 'pickled-peppers',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A thick, warm bean stew fills you up and warms you through on a cold day.',
        'O iahnie groasă și caldă te satură și te încălzește într-o zi rece.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Beans give carbohydrates and protein to help you recover.',
        'Fasolea oferă carbohidrați și proteine care ajută la refacere.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A big bowl of beans sits heavy and can cause wind before bed.',
        'O porție mare de fasole cade greu și poate provoca balonare înainte de culcare.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'Thick and filling, it is more than most people want in the heat.',
        'E groasă și sățioasă, prea mult pentru o zi caldă.',
      ),
    },
  ],
  variants: [
    {
      slug: 'iahnie-de-fasole-greek',
      cuisine: 'greek',
      title: t(
        'Gigantes plaki (Greek baked giant beans in tomato)',
        'Gigantes plaki (fasole uriașă coaptă în sos de roșii, ca în Grecia)',
      ),
      servings: 6,
      prepMinutes: 735,
      cookMinutes: 185,
      difficulty: 'easy',
      lines: [
        { ingredient: 'gigantes-beans', quantity: 500, unit: 'g' },
        { ingredient: 'still-water', quantity: 5.5, unit: 'l' },
        { ingredient: 'olive-oil', quantity: 120, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('large, finely sliced', 'mari, tăiate fin'),
        },
        {
          ingredient: 'garlic',
          quantity: 20,
          unit: 'g',
          note: t('thinly sliced', 'tăiat în felii subțiri'),
        },
        { ingredient: 'canned-tomatoes', quantity: 800, unit: 'g' },
        { ingredient: 'tomato-paste', quantity: 30, unit: 'g' },
        {
          ingredient: 'dill',
          quantity: 15,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'parsley',
          quantity: 15,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        { ingredient: 'oregano', quantity: 1, unit: 'g', optional: true },
        { ingredient: 'sugar', quantity: 5, unit: 'g', optional: true },
        { ingredient: 'bay-leaves', quantity: 0.4, unit: 'g' },
        { ingredient: 'salt', quantity: 10, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'soak',
          text: t(
            'Rinse the beans, put them in a large bowl and cover with 2 litres of cold water. Leave them to soak overnight, about 12 hours: giant beans are bigger and need longer than ordinary ones.',
            'Spală fasolea, pune-o într-un bol mare și acoperă-o cu 2 litri de apă rece. Las-o la înmuiat peste noapte, aproximativ 12 ore: fasolea uriașă e mai mare și are nevoie de mai mult timp decât cea obișnuită.',
          ),
          timerSeconds: 43200,
        },
        {
          key: 'boil-hard',
          text: t(
            'Drain the beans and put them in a large pot with 1.5 litres of fresh water. Bring to a full, rolling boil and boil hard for 10 minutes. Drain and throw away this water.',
            'Scurge fasolea și pune-o într-o oală mare cu 1,5 litri de apă proaspătă. Adu la clocot și fierbe în clocot puternic 10 minute. Scurge și aruncă apa.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'simmer',
          text: t(
            'Cover the beans with 2 litres of fresh hot water and the bay leaves, bring to the boil, then turn the heat down and simmer, half covered, for about 60 minutes, until the beans are tender all the way through and creamy when crushed, but still whole.',
            'Acoperă fasolea cu 2 litri de apă fierbinte proaspătă și adaugă dafinul, adu la fiert, apoi dă focul mai mic și lasă să fiarbă încet, cu capacul pe jumătate, circa 60 de minute, până când boabele sunt moi pe dinăuntru și cremoase când le strivești, dar întregi.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'onions',
          text: t(
            'While the beans simmer, warm 80 ml of the olive oil in a wide pan over medium-low heat. Add the onions with a pinch of salt and cook for 10 minutes, stirring now and then, until soft and golden.',
            'Cât fierbe fasolea, încălzește 80 ml din uleiul de măsline într-o tigaie largă, la foc mic-mediu. Adaugă ceapa cu un praf de sare și gătește 10 minute, amestecând din când în când, până se înmoaie și devine aurie.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'sauce',
          text: t(
            'Add the garlic and the tomato paste and cook for 1 minute. Pour in the tomatoes, break them up with a spoon, add the sugar if you use it, the rest of the salt and the pepper, and simmer for 10 minutes until the sauce is slightly thick. Stir in the dill, the parsley and the oregano, if you use it.',
            'Adaugă usturoiul și pasta de roșii și gătește 1 minut. Toarnă roșiile, sfărâmă-le cu lingura, pune zahărul, dacă îl folosești, restul de sare și piperul și fierbe 10 minute, până când sosul se îngroașă puțin. Amestecă mărarul, pătrunjelul și oregano, dacă îl folosești.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 180 °C, which takes about 15 minutes. Meanwhile scoop 400 ml of the bean cooking liquid into a jug, fish out the bay leaves and drain the beans.',
            'Încălzește cuptorul la 180 °C, ceea ce durează circa 15 minute. Între timp pune într-o cană 400 ml din zeama de fiert, scoate foile de dafin și scurge fasolea.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'assemble',
          text: t(
            'Put the beans in a baking dish about 25 x 35 cm and at least 6 cm deep. Pour over the sauce and 300 ml of the cooking liquid (keep the other 100 ml for later), and mix gently. The beans should be almost covered. Drizzle the remaining 40 ml of olive oil on top.',
            'Pune fasolea într-o tavă de circa 25 x 35 cm, adâncă de cel puțin 6 cm. Toarnă sosul și 300 ml din zeamă (restul de 100 ml păstrează-l pentru mai târziu) și amestecă ușor. Boabele trebuie să fie aproape acoperite. Stropește deasupra cu cei 40 ml de ulei de măsline rămași.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake uncovered for 30 minutes. Stir gently, then bake for another 30 minutes, until the sauce is thick and the top is caramelised at the edges.',
            'Coace fără capac 30 de minute. Amestecă ușor, apoi mai coace încă 30 de minute, până când sosul se îngroașă și deasupra se caramelizează pe margini.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'rest',
          text: t(
            'Take the dish out and leave it to rest for 15 minutes; the sauce thickens as it cools. Serve warm or at room temperature.',
            'Scoate tava și las-o să stea 15 minute; sosul se îngroașă pe măsură ce se răcește. Servește caldă sau la temperatura camerei.',
          ),
          timerSeconds: 900,
        },
      ],
      tips: [
        t(
          'If the top starts to dry out before the hour is up, spoon a little of the reserved bean liquid over it instead of covering the dish: the browned top is the point.',
          'Dacă deasupra se usucă înainte să treacă ora, toarnă cu lingura puțină din zeama de fasole păstrată peste ea, în loc să acoperi tava: partea rumenită e tocmai ce contează.',
        ),
      ],
      stepTips: [
        {
          step: 'boil-hard',
          text: t(
            'Raw dried beans contain a natural compound that upsets the stomach. A hard rolling boil of at least 10 minutes destroys it, and heat below a full boil (around 80 °C) does not, so never skip this step before baking.',
            'Fasolea uscată crudă conține o substanță naturală care irită stomacul. Un clocot puternic de cel puțin 10 minute o distruge, iar o căldură sub clocot (în jur de 80 °C) nu, așa că nu sări peste acest pas înainte de copt.',
          ),
        },
      ],
      nutritionNote: t(
        'Giant beans give fibre and plant protein, and the tomatoes add more fibre. A lot of olive oil goes in, mostly unsaturated fat but plenty of calories, and feta served alongside adds salt and saturated fat. Beans can cause wind if you are not used to them.',
        'Fasolea uriașă aduce fibre și proteine vegetale, iar roșiile adaugă și ele fibre. Se pune mult ulei de măsline, în mare parte grăsime nesaturată, dar cu multe calorii, iar brânza feta servită alături adaugă sare și grăsimi saturate. Fasolea poate provoca balonare dacă nu ești obișnuit cu ea.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Feta', 'Brânză feta'),
          reason: t(
            'Its salty, crumbly tang contrasts with the sweet tomato and the soft beans.',
            'Gustul ei sărat și acrișor și textura sfărâmicioasă fac contrast cu roșiile dulci și fasolea moale.',
          ),
          principle: 'salt_balances_sweet',
          ingredient: 'feta',
        },
        {
          kind: 'food',
          label: t('Olives', 'Măsline'),
          reason: t(
            'Their salty brine contrasts with the sweet tomato sauce.',
            'Saramura lor sărată face contrast cu sosul dulce de roșii.',
          ),
          principle: 'salt_balances_sweet',
          ingredient: 'olives',
        },
        {
          kind: 'food',
          label: t('Crusty bread', 'Pâine cu crustă'),
          reason: t(
            'A crusty slice mops up the thick, oily tomato sauce.',
            'Cu o felie de pâine cu crustă ștergi sosul gros de roșii cu ulei.',
          ),
          principle: 'contrast_texture',
          ingredient: 'country-bread',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its acidity refreshes the palate after the oily, rich beans.',
            'Aciditatea lui împrospătează gustul după fasolea bogată, cu ulei.',
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
            'A hot bake of beans in tomato warms the house and fills you up.',
            'Fasolea coaptă în roșii, fierbinte, încălzește casa și te satură.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Beans and plenty of olive oil sit heavy before bed.',
            'Fasolea cu mult ulei de măsline cade greu înainte de culcare.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'An hour in a hot oven and a heavy dish do not suit a hot day.',
            'O oră de cuptor încins și o mâncare grea nu se potrivesc într-o zi caldă.',
          ),
        },
      ],
    },
    {
      slug: 'iahnie-de-fasole-american',
      cuisine: 'american',
      title: t(
        'Boston baked beans (navy beans slow-baked with molasses and salt pork)',
        'Boston baked beans (fasole albă coaptă lent cu melasă și slănină sărată)',
      ),
      servings: 8,
      prepMinutes: 735,
      cookMinutes: 420,
      hideBaseTips: [1],
      difficulty: 'easy',
      lines: [
        { ingredient: 'white-beans', quantity: 500, unit: 'g' },
        { ingredient: 'still-water', quantity: 4, unit: 'l' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('peeled, left whole', 'curățată, întreagă'),
        },
        {
          ingredient: 'salt-pork',
          quantity: 200,
          unit: 'g',
          note: t(
            'rinsed, rind scored in a diamond pattern',
            'clătită, cu șoricul crestat în romburi',
          ),
        },
        { ingredient: 'molasses', quantity: 90, unit: 'g' },
        { ingredient: 'brown-sugar', quantity: 50, unit: 'g' },
        { ingredient: 'mustard-powder', quantity: 5, unit: 'g' },
        { ingredient: 'salt', quantity: 5, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1.5, unit: 'g' },
      ],
      steps: [
        {
          key: 'soak',
          text: t(
            'Rinse the beans, put them in a large bowl and cover with 2 litres of cold water. Leave them to soak overnight, about 12 hours.',
            'Spală fasolea, pune-o într-un bol mare și acoperă-o cu 2 litri de apă rece. Las-o la înmuiat peste noapte, aproximativ 12 ore.',
          ),
          timerSeconds: 43200,
        },
        {
          key: 'boil-hard',
          text: t(
            'Drain the beans and put them in a large pot with 2 litres of fresh water. Bring to a full, rolling boil and boil hard for 10 minutes. The slow bake that follows is too gentle to make raw beans safe, so do not shorten this.',
            'Scurge fasolea și pune-o într-o oală mare cu 2 litri de apă proaspătă. Adu la clocot și fierbe în clocot puternic 10 minute. Coacerea lentă de după e prea blândă ca să facă sigură fasolea crudă, așa că nu scurta acest pas.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'parboil',
          text: t(
            'Turn the heat down and simmer for about 40 minutes, until the skins wrinkle and split when you blow on a spoonful of beans, and the beans are almost tender.',
            'Dă focul mai mic și lasă să fiarbă încet circa 40 de minute, până când pielița se încrețește și crapă dacă sufli peste o lingură de boabe, iar boabele sunt aproape moi.',
          ),
          timerSeconds: 2400,
        },
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 150 °C, which takes about 15 minutes. Meanwhile drain the beans, keeping 800 ml of the cooking liquid, and bring that liquid back to a simmer.',
            'Încălzește cuptorul la 150 °C, ceea ce durează circa 15 minute. Între timp scurge fasolea, păstrând 800 ml din zeama de fiert, și încălzește zeama până fierbe încet.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'assemble',
          text: t(
            'Stir the molasses, brown sugar, mustard powder, half the salt (2.5 g) and the pepper into 500 ml of the hot liquid. Put the whole onion in the bottom of a 4-litre ovenproof pot with a lid, add the beans, and push the salt pork into the beans so only the rind shows. Pour over the molasses liquid, then add enough of the remaining hot liquid, or boiling water, to just cover the beans.',
            'Amestecă melasa, zahărul brun, muștarul pudră, jumătate din sare (2,5 g) și piperul în 500 ml din zeama fierbinte. Pune ceapa întreagă pe fundul unei oale de 4 litri, care merge la cuptor și are capac, adaugă fasolea și împinge slănina printre boabe, încât să se vadă doar șoricul. Toarnă zeama cu melasă, apoi completează cu restul de zeamă fierbinte sau cu apă clocotită, cât să acopere fasolea tocmai.',
          ),
        },
        {
          key: 'bake-1',
          text: t(
            'Cover the pot and bake for 90 minutes.',
            'Acoperă oala cu capacul și coace 90 de minute.',
          ),
          timerSeconds: 5400,
        },
        {
          key: 'bake-2',
          text: t(
            'Check the liquid and top up with boiling water so the beans stay just covered. Put the lid back and bake for another 90 minutes.',
            'Verifică lichidul și completează cu apă clocotită, ca fasolea să rămână tocmai acoperită. Pune la loc capacul și mai coace 90 de minute.',
          ),
          timerSeconds: 5400,
        },
        {
          key: 'bake-3',
          text: t(
            'Check the liquid again and top up with boiling water if the beans are no longer covered. Put the lid back and bake for a last 90 minutes, which makes 4 and a half hours covered in all. The beans should be very soft and dark.',
            'Verifică din nou lichidul și completează cu apă clocotită dacă fasolea nu mai e acoperită. Pune la loc capacul și coace ultimele 90 de minute, adică 4 ore și jumătate sub capac în total. Boabele trebuie să fie foarte moi și închise la culoare.',
          ),
          timerSeconds: 5400,
        },
        {
          key: 'uncover',
          text: t(
            'Take off the lid and bake for 45 minutes more, until the liquid has thickened to a glossy syrup and the top of the beans is browned. Taste, then add the other 2.5 g of salt only if needed; salt pork is salty, so go carefully.',
            'Ia capacul și mai coace 45 de minute, până când lichidul se îngroașă ca un sirop lucios, iar deasupra boabele se rumenesc. Gustă, apoi adaugă restul de 2,5 g de sare doar dacă e nevoie; slănina sărată e sărată, așa că ai grijă.',
          ),
          timerSeconds: 2700,
        },
        {
          key: 'rest',
          text: t(
            'Take the pot out, lift out the onion and the salt pork, and leave the beans to rest for 10 minutes; the sauce thickens as it cools. Slice the pork and serve it with the beans.',
            'Scoate oala, ridică ceapa și slănina și lasă fasolea 10 minute; sosul se îngroașă pe măsură ce se răcește. Taie slănina felii și servește-o împreună cu fasolea.',
          ),
          timerSeconds: 600,
        },
      ],
      tips: [
        t(
          'Salt pork varies a lot in saltiness. Rinse it first, and add the second half of the salt only at the end, once the sauce has reduced and you have tasted it.',
          'Slănina sărată diferă mult ca sărătură. Clătește-o la început și pune a doua jumătate de sare abia la final, după ce sosul s-a redus și ai gustat.',
        ),
      ],
      stepTips: [
        {
          step: 'boil-hard',
          text: t(
            'Raw dried beans contain a natural compound that upsets the stomach. A hard rolling boil of at least 10 minutes destroys it, and heat below a full boil (around 80 °C), such as a low oven, does not.',
            'Fasolea uscată crudă conține o substanță naturală care irită stomacul. Un clocot puternic de cel puțin 10 minute o distruge, iar o căldură sub clocot (în jur de 80 °C), ca într-un cuptor la foc mic, nu.',
          ),
        },
      ],
      nutritionNote: t(
        'Beans give fibre and plant protein. The molasses and brown sugar add free sugars, and the salt pork adds a lot of salt and saturated fat, so serve a modest portion with something fresh, and use less sugar if you like. Beans can cause wind if you are not used to them.',
        'Fasolea aduce fibre și proteine vegetale. Melasa și zahărul brun adaugă zaharuri libere, iar slănina sărată aduce multă sare și grăsimi saturate, așa că servește o porție moderată împreună cu ceva proaspăt și pune mai puțin zahăr, dacă vrei. Fasolea poate provoca balonare dacă nu ești obișnuit cu ea.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Frankfurters', 'Crenvurști'),
          reason: t(
            'Their smoke and salt sit well against the sweet, dark sauce.',
            'Afumătura și sarea lor se potrivesc cu sosul dulce și închis la culoare.',
          ),
          principle: 'salt_balances_sweet',
          ingredient: 'frankfurters',
        },
        {
          kind: 'food',
          label: t('Pickled cucumbers', 'Castraveți murați'),
          reason: t(
            'Their sharp sourness cuts through the sweet, fatty beans.',
            'Aciditatea lor ascuțită taie din dulceața și grăsimea fasolei.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-cucumbers',
        },
        {
          kind: 'food',
          label: t('Rye bread', 'Pâine de secară'),
          reason: t(
            'A dense, slightly sour slice mops up the syrupy sauce.',
            'Cu o felie densă, ușor acrișoară, ștergi sosul siropos.',
          ),
          principle: 'contrast_texture',
          ingredient: 'rye-bread',
        },
        {
          kind: 'drink',
          label: t('Beer', 'Bere'),
          reason: t(
            'Its bitterness and fizz balance the sweet, rich beans.',
            'Amăreala și bulele ei echilibrează fasolea dulce și bogată.',
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
            'Hours in the oven warm the kitchen, and the dark, sweet beans warm you up.',
            'Orele de cuptor încălzesc bucătăria, iar fasolea dulce și închisă la culoare te încălzește.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Sweet, salty, fatty and full of beans, it sits heavy before bed.',
            'Dulce, sărată, grasă și plină de fasole, cade greu înainte de culcare.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'Over five hours of oven and a heavy dish are a poor fit for a hot day.',
            'Peste cinci ore de cuptor și o mâncare grea nu se potrivesc într-o zi caldă.',
          ),
        },
      ],
    },
  ],
};
