import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Shakshuka base is eggs poached in a spiced tomato and pepper sauce. The
// Variants change the dish itself: Spanish baked eggs with chorizo and ham,
// and Turkish menemen, where the eggs are stirred into the sauce. Each Variant
// is a full Recipe; the base's Recipe-level Tips are inherited unless hidden.
export const shakshuka: BaseRecipeSeed = {
  slug: 'shakshuka',
  title: t(
    'Shakshuka (eggs poached in spiced tomato and pepper sauce)',
    'Shakshuka (ouă gătite în sos de roșii cu ardei și condimente)',
  ),
  servings: 4,
  prepMinutes: 15,
  cookMinutes: 45,
  difficulty: 'easy',
  lines: [
    { ingredient: 'olive-oil', quantity: 45, unit: 'ml' },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('medium, diced', 'medii, tăiate cubulețe'),
    },
    {
      ingredient: 'bell-pepper',
      quantity: 2,
      unit: 'pcs',
      note: t('red, diced', 'roșii, tăiate cubulețe'),
    },
    {
      ingredient: 'garlic',
      quantity: 12,
      unit: 'g',
      note: t('crushed', 'zdrobit'),
    },
    { ingredient: 'cumin', quantity: 3, unit: 'g' },
    { ingredient: 'paprika', quantity: 6, unit: 'g' },
    { ingredient: 'chilli-flakes', quantity: 1.5, unit: 'g' },
    {
      ingredient: 'harissa',
      quantity: 15,
      unit: 'g',
      optional: true,
      note: t('for extra heat', 'pentru un gust mai iute'),
    },
    {
      ingredient: 'tomato-paste',
      quantity: 30,
      unit: 'g',
      optional: true,
    },
    { ingredient: 'canned-tomatoes', quantity: 800, unit: 'g' },
    { ingredient: 'sugar', quantity: 3, unit: 'g', optional: true },
    { ingredient: 'salt', quantity: 4, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
    { ingredient: 'eggs', quantity: 6, unit: 'pcs' },
    {
      ingredient: 'coriander',
      quantity: 15,
      unit: 'g',
      note: t('chopped', 'tocat'),
    },
    {
      ingredient: 'feta',
      quantity: 100,
      unit: 'g',
      optional: true,
      note: t('crumbled', 'mărunțită'),
    },
  ],
  steps: [
    {
      key: 'soften',
      text: t(
        'Warm the oil in a deep 28 cm lidded frying pan over medium heat. Add the onions and peppers with a pinch of the salt and cook for 10 minutes, stirring now and then, until the onions are translucent and the peppers are soft.',
        'Încălzește uleiul într-o tigaie adâncă de 28 cm, cu capac, la foc mediu. Adaugă ceapa și ardeii cu un praf din sare și gătește 10 minute, amestecând din când în când, până când ceapa devine translucidă, iar ardeii se înmoaie.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'spices',
      text: t(
        'Stir in the garlic, cumin, paprika, chilli flakes, the harissa and the tomato paste if using, and cook for 1 minute, stirring, until fragrant and the paste darkens slightly. Do not let the spices scorch.',
        'Adaugă usturoiul, chimionul, boiaua, fulgii de chili, harissa și pasta de roșii, dacă folosești, și gătește 1 minut, amestecând, până se simte aroma, iar pasta se închide puțin la culoare. Nu lăsa condimentele să se ardă.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'simmer',
      text: t(
        'Add the canned tomatoes, crushing them with the spoon, then the sugar, the rest of the salt and the pepper. Simmer gently, uncovered, for 15 minutes, until the sauce is thick and a spoon drawn across the pan leaves a trail. Taste and adjust the salt.',
        'Adaugă roșiile conservate, zdrobindu-le cu lingura, apoi zahărul, restul de sare și piperul. Fierbe domol, fără capac, 15 minute, până când sosul se îngroașă, iar lingura trasă prin tigaie lasă o urmă. Gustă și corectează sarea.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'eggs',
      text: t(
        'Make six wells in the sauce with the back of a spoon. Crack each egg into a cup, slide it into a well and season the eggs with a little salt and pepper.',
        'Fă șase adâncituri în sos cu dosul lingurii. Sparge fiecare ou într-o ceașcă, lasă-l să alunece într-o adâncitură și asezonează ouăle cu puțină sare și piper.',
      ),
    },
    {
      key: 'poach',
      text: t(
        'Cover the pan, turn the heat to low and cook for 8 minutes, until the whites are fully set and opaque, with no clear or jelly-like patches. Keep the lid on for 3 to 5 minutes more, until the yolks are firm too, if you are cooking for children, older people, anyone pregnant or anyone with a weakened immune system.',
        'Acoperă tigaia, dă focul la mic și gătește 8 minute, până când albușurile sunt complet închegate și opace, fără zone transparente sau gelatinoase. Dacă gătești pentru copii, vârstnici, femei însărcinate sau persoane cu imunitate scăzută, ține capacul pus încă 3-5 minute, până când și gălbenușurile se întăresc.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'serve',
      text: t(
        'Scatter the coriander and the feta, if using, over the top and serve straight from the pan, with bread or pita for scooping.',
        'Presară coriandrul și feta, dacă folosești, și servește direct din tigaie, cu pâine sau lipie, ca să iei sosul.',
      ),
    },
  ],
  tips: [
    t(
      'Runny yolks are not for everyone: children, older people, anyone pregnant and anyone with a weakened immune system should eat eggs cooked until the whites are fully set and the yolks are firm.',
      'Gălbenușurile moi nu sunt pentru toată lumea: copiii, vârstnicii, femeile însărcinate și cei cu imunitate scăzută ar trebui să mănânce ouă gătite până când albușurile sunt complet închegate, iar gălbenușurile ferme.',
    ),
    t(
      'A watery sauce floods the eggs and leaves the whites loose. Keep simmering until the sauce is thick enough to hold the shape of a well.',
      'Un sos apos inundă ouăle și lasă albușurile moi. Mai fierbe până când sosul e destul de gros încât adâncitura să-și păstreze forma.',
    ),
    t(
      'The sauce keeps well: make it up to 3 days ahead, chill it within 2 hours, and bring it back to a simmer before the eggs go in. Never keep leftovers with the eggs for more than a day.',
      'Sosul se păstrează bine: îl poți face cu până la 3 zile înainte, îl răcești în cel mult 2 ore și îl readuci la fierbere înainte să adaugi ouăle. Nu păstra mai mult de o zi resturile cu tot cu ouă.',
    ),
  ],
  stepTips: [
    {
      step: 'eggs',
      text: t(
        'Cracking each egg into a cup first lets you fish out shell and keeps a broken yolk from landing in the sauce.',
        'Dacă spargi fiecare ou întâi într-o ceașcă, poți scoate cojile și eviți ca un gălbenuș spart să ajungă în sos.',
      ),
    },
    {
      step: 'spices',
      text: t(
        'Spices turn bitter fast in hot oil. If the pan looks dry or smells sharp, add the tomatoes straight away.',
        'Condimentele devin amare repede în ulei fierbinte. Dacă tigaia pare uscată sau miroase înțepător, adaugă imediat roșiile.',
      ),
    },
  ],
  nutritionNote: t(
    'Eggs give protein, and tomatoes and peppers add vegetables and plenty of flavour for little fat; the olive oil is mostly unsaturated. Canned tomatoes and feta bring salt, and feta adds saturated fat, so taste before salting. It has little starch, so bread makes it a fuller meal.',
    'Ouăle dau proteine, iar roșiile și ardeii aduc legume și mult gust cu puține grăsimi; uleiul de măsline este în mare parte nesaturat. Roșiile conservate și feta aduc sare, iar feta adaugă grăsimi saturate, așa că gustă înainte să sărezi. Are puțin amidon, deci pâinea face masa mai săturătoare.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Warm pita', 'Lipie caldă'),
      reason: t(
        'Chewy, warm bread is the scoop for the loose sauce and the runny yolk.',
        'Pâinea elastică și caldă e lingura cu care ridici sosul lejer și gălbenușul curgător.',
      ),
      principle: 'contrast_texture',
      ingredient: 'pita',
    },
    {
      kind: 'food',
      label: t('Crusty bread', 'Pâine cu crustă'),
      reason: t(
        'The crust holds up to a thick sauce and soaks up what is left in the pan.',
        'Crusta ține piept sosului gros și absoarbe ce rămâne în tigaie.',
      ),
      principle: 'contrast_texture',
      ingredient: 'bread',
    },
    {
      kind: 'food',
      label: t('Plain yogurt', 'Iaurt simplu'),
      reason: t(
        'A cool, creamy spoonful tames the chilli heat.',
        'O lingură de iaurt rece și cremos domolește iuțeala de chili.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'yogurt',
    },
    {
      kind: 'drink',
      label: t('Mint tea', 'Ceai de mentă'),
      reason: t(
        'Hot and fresh, it rinses the palate between spicy, rich bites.',
        'Fierbinte și răcoritor, curăță gustul între îmbucăturile iuți și bogate.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'mint-tea',
    },
  ],
  eatingMoments: [
    {
      moment: 'brunch',
      polarity: 'good_for',
      reason: t(
        'One pan feeds a table, and the eggs and bread make it a full late breakfast.',
        'O singură tigaie hrănește o masă întreagă, iar ouăle cu pâine fac un mic dejun târziu consistent.',
      ),
    },
    {
      moment: 'morning',
      polarity: 'good_for',
      reason: t(
        'Protein and vegetables keep you going until lunch.',
        'Proteinele și legumele te țin sătul până la prânz.',
      ),
    },
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot, spiced pan warms you through.',
        'O tigaie fierbinte și condimentată te încălzește pe dinăuntru.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Chilli and tomato can bring on heartburn when you lie down soon after.',
        'Chili și roșiile pot provoca arsuri dacă te culci la scurt timp după masă.',
      ),
    },
  ],
  variants: [
    {
      slug: 'shakshuka-spanish',
      cuisine: 'spanish',
      title: t(
        'Huevos a la flamenca (Spanish baked eggs with chorizo, ham and vegetables)',
        'Huevos a la flamenca (ouă la cuptor cu chorizo, jamón și legume, ca în Spania)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 50,
      difficulty: 'medium',
      lines: [
        { ingredient: 'olive-oil', quantity: 30, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('large, finely diced', 'mare, tăiată mărunt'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t('finely sliced', 'tăiat felii subțiri'),
        },
        {
          ingredient: 'chorizo',
          quantity: 120,
          unit: 'g',
          note: t('cured, sliced 5 mm thick', 'maturat, tăiat felii de 5 mm'),
        },
        {
          ingredient: 'serrano-ham',
          quantity: 60,
          unit: 'g',
          note: t('diced', 'tăiat cubulețe'),
        },
        { ingredient: 'smoked-paprika', quantity: 5, unit: 'g' },
        { ingredient: 'canned-tomatoes', quantity: 400, unit: 'g' },
        { ingredient: 'still-water', quantity: 0.1, unit: 'l' },
        {
          ingredient: 'green-beans',
          quantity: 150,
          unit: 'g',
          note: t(
            'trimmed, cut in 3 cm pieces',
            'curățată, tăiată bucăți de 3 cm',
          ),
        },
        {
          ingredient: 'asparagus',
          quantity: 150,
          unit: 'g',
          optional: true,
          note: t('cut in 3 cm pieces', 'tăiat bucăți de 3 cm'),
        },
        { ingredient: 'frozen-peas', quantity: 150, unit: 'g' },
        {
          ingredient: 'roasted-peppers',
          quantity: 120,
          unit: 'g',
          note: t('cut in strips', 'tăiați fâșii'),
        },
        { ingredient: 'eggs', quantity: 6, unit: 'pcs' },
        {
          ingredient: 'parsley',
          quantity: 10,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        { ingredient: 'salt', quantity: 2, unit: 'g' },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 200 °C (180 °C fan). It will be hot by the time the sauce is ready.',
            'Încălzește cuptorul la 200 °C (180 °C cu ventilator). Va fi fierbinte până se face sosul.',
          ),
        },
        {
          key: 'sofrito',
          text: t(
            'Warm the oil in a wide, deep pan over medium heat. Cook the onion for 8 minutes, stirring, until soft and translucent, then add the garlic and cook for 1 minute.',
            'Încălzește uleiul într-o tigaie lată și adâncă la foc mediu. Călește ceapa 8 minute, amestecând, până se înmoaie și devine translucidă, apoi adaugă usturoiul și gătește 1 minut.',
          ),
          timerSeconds: 540,
        },
        {
          key: 'meats',
          text: t(
            'Add the chorizo and the ham and cook for 3 minutes, stirring, until the chorizo turns glossy and releases its red oil.',
            'Adaugă chorizo și jamón și gătește 3 minute, amestecând, până când chorizo devine lucios și lasă uleiul roșu.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'sauce',
          text: t(
            'Stir in the smoked paprika, then straight away the tomatoes, the water and the green beans. Cover and simmer gently for 12 minutes, until the beans are tender.',
            'Adaugă boiaua afumată, apoi imediat roșiile, apa și fasolea verde. Acoperă și fierbe domol 12 minute, până când fasolea se înmoaie.',
          ),
          timerSeconds: 720,
        },
        {
          key: 'greens',
          text: t(
            'Add the asparagus, if using, and the peas and simmer, uncovered, for 5 minutes, until the asparagus is just tender and the sauce is thick. Taste and add salt only if needed: the chorizo and ham are salty.',
            'Adaugă sparanghelul, dacă folosești, și mazărea și fierbe 5 minute, fără capac, până când sparanghelul e abia fraged, iar sosul s-a îngroșat. Gustă și adaugă sare doar dacă e nevoie: chorizo și jamónul sunt sărate.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'dish',
          text: t(
            'Spoon the mixture into a 28 cm oven dish, or into four small cazuelas with one or two eggs in each. Make six wells in all, crack an egg into each and lay the roasted pepper strips between the eggs.',
            'Pune amestecul într-un vas de cuptor de 28 cm sau în patru cazuele mici, cu unul sau două ouă în fiecare. Fă în total șase adâncituri, sparge câte un ou în fiecare și așază fâșiile de ardei copt printre ouă.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 12 minutes, until the whites are fully set and opaque. For children, older people, anyone pregnant or anyone with a weakened immune system, bake 6 to 8 minutes more, until the yolks are firm as well.',
            'Coace 12 minute, până când albușurile sunt complet închegate și opace. Pentru copii, vârstnici, femei însărcinate sau persoane cu imunitate scăzută, mai coace 6-8 minute, până când și gălbenușurile se întăresc.',
          ),
          timerSeconds: 720,
        },
        {
          key: 'serve',
          text: t(
            'Rest the dish for 2 minutes, sprinkle with the parsley and serve with bread.',
            'Lasă vasul să stea 2 minute, presară pătrunjelul și servește cu pâine.',
          ),
          timerSeconds: 120,
        },
      ],
      stepTips: [
        {
          step: 'dish',
          text: t(
            'Press the wells in firmly and keep them apart, or the whites run together and set unevenly.',
            'Apasă ferm adânciturile și ține-le la distanță, altfel albușurile se unesc și se prind neuniform.',
          ),
        },
      ],
      nutritionNote: t(
        'Eggs give protein, and the peas and green beans add fibre; the vegetables and olive oil are a good base. The chorizo and ham are salty and add saturated fat, so they are a flavour accent rather than a main ingredient; bread alongside adds the starch.',
        'Ouăle dau proteine, iar mazărea și fasolea verde adaugă fibre; legumele și uleiul de măsline sunt o bază bună. Chorizo și jamónul sunt sărate și aduc grăsimi saturate, deci sunt un accent de gust, nu ingredientul principal; pâinea alăturată adaugă amidonul.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Crusty bread', 'Pâine cu crustă'),
          reason: t(
            'It mops up the paprika-red oil and the yolk.',
            'Șterge uleiul roșu de boia și gălbenușul din vas.',
          ),
          principle: 'contrast_texture',
          ingredient: 'bread',
        },
        {
          kind: 'food',
          label: t('Rocket salad', 'Salată de rucola'),
          reason: t(
            'Peppery leaves dressed with a little lemon cut the richness of the chorizo.',
            'Frunzele piperate, cu puțină lămâie, taie din bogăția chorizo-ului.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'rocket',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its acidity refreshes the palate after the cured meats.',
            'Aciditatea lui împrospătează gustul după mezelurile maturate.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'white-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Eggs, vegetables and bread make a balanced plate.',
            'Ouăle, legumele și pâinea fac o farfurie echilibrată.',
          ),
        },
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'It comes to the table in its own dish and feeds several people.',
            'Ajunge la masă în propriul vas și hrănește mai multe persoane.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Cured meat, eggs and oil sit heavy during hard exercise.',
            'Mezelurile maturate, ouăle și uleiul cad greu în timpul unui efort intens.',
          ),
        },
      ],
    },
    {
      slug: 'shakshuka-turkish',
      cuisine: 'turkish',
      title: t(
        'Menemen (Turkish eggs scrambled into tomato and green pepper)',
        'Menemen (ouă amestecate cu roșii și ardei verde, ca în Turcia)',
      ),
      servings: 2,
      prepMinutes: 10,
      cookMinutes: 22,
      difficulty: 'easy',
      hideBaseTips: [0, 1, 2],
      lines: [
        { ingredient: 'butter', quantity: 25, unit: 'g' },
        {
          ingredient: 'bell-pepper',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'pale green, thin-walled, mild (like Turkish çarliston), diced',
            'verde deschis, cu pereți subțiri (ardei gras), tăiați cubulețe',
          ),
        },
        {
          ingredient: 'onion',
          quantity: 0.5,
          unit: 'pcs',
          optional: true,
          note: t('finely diced', 'tăiată mărunt'),
        },
        {
          ingredient: 'tomato',
          quantity: 300,
          unit: 'g',
          note: t(
            'ripe, grated on the coarse side, skins discarded',
            'coapte, date pe răzătoarea mare, fără coajă',
          ),
        },
        { ingredient: 'eggs', quantity: 4, unit: 'pcs' },
        { ingredient: 'salt', quantity: 2, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 0.5, unit: 'g' },
        { ingredient: 'pul-biber', quantity: 2, unit: 'g' },
      ],
      steps: [
        {
          key: 'peppers',
          text: t(
            'Melt the butter in a 24 cm pan over medium heat. Add the peppers, and the onion if using, and cook, covered, for 8 minutes, stirring now and then, until completely soft.',
            'Topește untul într-o tigaie de 24 cm la foc mediu. Adaugă ardeii, și ceapa dacă folosești, și gătește 8 minute cu capac, amestecând din când în când, până se înmoaie complet.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'tomatoes',
          text: t(
            'Add the grated tomatoes and the salt and cook, uncovered, for 8 minutes, until most of the liquid has evaporated and the mixture is thick and jammy.',
            'Adaugă roșiile rase și sarea și gătește 8 minute, fără capac, până când aproape tot lichidul s-a evaporat, iar amestecul e gros, ca un gem.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'eggs',
          text: t(
            'Turn the heat to low. Crack the eggs into the pan, break the yolks with a spoon, season with the pepper and stir gently for about 3 minutes, until soft curds form and no liquid egg is left. Take the pan off the heat while the eggs still look creamy. For children, older people, anyone pregnant or anyone with a weakened immune system, keep stirring for 1 to 2 minutes more, until the curds are firm and dry.',
            'Dă focul la mic. Sparge ouăle în tigaie, rupe gălbenușurile cu o lingură, asezonează cu piper și amestecă ușor aproximativ 3 minute, până se formează cheaguri moi și nu mai rămâne ou lichid. Ia tigaia de pe foc cât ouăle încă arată cremoase. Pentru copii, vârstnici, femei însărcinate sau persoane cu imunitate scăzută, mai amestecă 1-2 minute, până când cheagurile sunt ferme și uscate.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'serve',
          text: t(
            'Sprinkle with the pul biber and serve at once from the pan, with bread.',
            'Presară pul biber și servește imediat, direct din tigaie, cu pâine.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'tomatoes',
          text: t(
            'If the tomatoes are pale or sharp, a pinch of sugar rounds them off; if they are very watery, give them a few extra minutes so the eggs do not turn soupy.',
            'Dacă roșiile sunt palide sau acre, un praf de zahăr le rotunjește gustul; dacă sunt foarte apoase, mai lasă-le câteva minute ca ouăle să nu iasă apoase.',
          ),
        },
      ],
      tips: [
        t(
          'Serve menemen straight away and do not keep it: reheated scrambled egg turns rubbery. If you must, chill leftovers within 2 hours and heat them until steaming hot.',
          'Servește menemen imediat și nu-l păstra: oul amestecat reîncălzit devine cauciucat. Dacă trebuie, răcește resturile în cel mult 2 ore și încălzește-le până scot aburi.',
        ),
      ],
      nutritionNote: t(
        'Eggs give protein and the peppers and tomatoes add vitamins for very little else; it is a light dish. Butter adds some saturated fat and bread supplies the starch and most of the carbohydrate, so a wholemeal slice makes it more filling.',
        'Ouăle dau proteine, iar ardeii și roșiile adaugă vitamine, aproape fără altceva; e un preparat ușor. Untul aduce grăsimi saturate, iar pâinea oferă amidonul și cea mai mare parte din carbohidrați, deci o felie integrală îl face mai săturător.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Fresh bread', 'Pâine proaspătă'),
          reason: t(
            'Torn bread scoops up the creamy eggs and the tomato juices.',
            'Pâinea ruptă ridică ouăle cremoase și zeama de roșii.',
          ),
          principle: 'contrast_texture',
          ingredient: 'bread',
        },
        {
          kind: 'food',
          label: t('Sliced cucumber', 'Castravete felii'),
          reason: t(
            'Crisp, cool slices contrast with the soft, warm eggs.',
            'Feliile crocante și răcoroase fac contrast cu ouăle moi și calde.',
          ),
          principle: 'contrast_texture',
          ingredient: 'cucumber',
        },
        {
          kind: 'food',
          label: t('Feta (or other white brined cheese)', 'Brânză feta'),
          reason: t(
            'Salty cheese is a sharp counterpoint to the mild, sweet pepper and tomato.',
            'Brânza sărată contrastează cu gustul dulceag și blând al ardeiului și al roșiilor.',
          ),
          principle: 'salt_balances_sweet',
          ingredient: 'feta',
        },
        {
          kind: 'drink',
          label: t('Black tea', 'Ceai negru'),
          reason: t(
            'Its slight bitterness balances the rich, buttery eggs.',
            'Amăreala lui ușoară echilibrează ouăle bogate, cu gust de unt.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'morning',
          polarity: 'good_for',
          reason: t(
            'It is ready in about half an hour and gives protein to start the day.',
            'E gata în aproximativ o jumătate de oră și aduce proteine pentru începutul zilei.',
          ),
        },
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'Straight from the pan to the table with bread.',
            'Din tigaie direct pe masă, cu pâine.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Tomato and chilli can bring on heartburn at bedtime.',
            'Roșiile și ardeiul iute pot provoca arsuri la culcare.',
          ),
        },
      ],
    },
  ],
};
