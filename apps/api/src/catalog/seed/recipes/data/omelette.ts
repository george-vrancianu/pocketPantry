import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Omelette base is a plain omelette. Each Variant is a full Recipe with its
// own lines, steps and guidance; the base's Recipe-level Tips are inherited.
export const omelette: BaseRecipeSeed = {
  slug: 'omelette',
  title: t('Omelette', 'Omletă'),
  servings: 1,
  prepMinutes: 5,
  cookMinutes: 5,
  difficulty: 'easy',
  lines: [
    { ingredient: 'eggs', quantity: 3, unit: 'pcs' },
    { ingredient: 'milk', quantity: 15, unit: 'ml', optional: true },
    { ingredient: 'butter', quantity: 15, unit: 'g' },
    { ingredient: 'salt', quantity: 1, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 0.5, unit: 'g' },
  ],
  steps: [
    {
      key: 'whisk',
      text: t(
        'Crack the eggs into a bowl, add the milk, salt and pepper, and whisk with a fork for about 30 seconds until no streaks of white remain.',
        'Sparge ouăle într-un bol, adaugă laptele, sarea și piperul și amestecă cu furculița aproximativ 30 de secunde, până nu mai rămân dungi de albuș.',
      ),
    },
    {
      key: 'heat',
      text: t(
        'Heat a 20 to 24 cm non-stick pan over medium heat. Add the butter and let it melt until it foams but has not browned.',
        'Încinge o tigaie antiaderentă de 20-24 cm la foc mediu. Adaugă untul și lasă-l să se topească până face spumă, fără să se rumenească.',
      ),
    },
    {
      key: 'cook',
      text: t(
        'Pour in the eggs and leave them for 15 seconds. Then pull the set edges toward the centre with a spatula, tilting the pan so the liquid egg runs to the edges. Repeat for about a minute.',
        'Toarnă ouăle și lasă-le 15 secunde. Apoi trage marginile închegate spre centru cu o spatulă, înclinând tigaia ca ouăle lichide să ajungă la margini. Repetă aproximativ un minut.',
      ),
      timerSeconds: 90,
    },
    {
      key: 'fold',
      text: t(
        'When the top is still slightly wet and glossy, fold the omelette in half and slide it onto a warm plate. Serve straight away.',
        'Când suprafața e încă ușor umedă și lucioasă, îndoaie omleta în două și treci-o pe o farfurie caldă. Servește imediat.',
      ),
    },
  ],
  tips: [
    t(
      'Take it off the heat while it still looks slightly wet; the eggs keep cooking on the plate.',
      'Ia omleta de pe foc cât timp pare încă ușor umedă; ouăle continuă să se gătească în farfurie.',
    ),
    t(
      'Use a pan that fits the eggs: too big a pan gives a thin, rubbery omelette.',
      'Folosește o tigaie potrivită cantității de ouă: într-una prea mare omleta iese subțire și cauciucată.',
    ),
  ],
  stepTips: [
    {
      step: 'whisk',
      text: t(
        'Season just before the eggs go into the pan; salt left in the bowl makes them watery.',
        'Sărează chiar înainte să torni ouăle în tigaie; sarea lăsată în bol le face apoase.',
      ),
    },
  ],
  nutritionNote: t(
    'Rich in protein and filling for few ingredients; the butter and yolks add saturated fat, so keep the butter modest and add vegetables for fibre, which a plain omelette lacks.',
    'Bogată în proteine și săturătoare cu puține ingrediente; untul și gălbenușurile aduc grăsimi saturate, așa că folosește unt puțin și adaugă legume pentru fibre, care lipsesc dintr-o omletă simplă.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Toasted sourdough', 'Pâine cu maia prăjită'),
      reason: t(
        'The crisp crust gives the soft eggs something to bite against.',
        'Crusta crocantă oferă ouălor moi un contrast la mestecat.',
      ),
      principle: 'contrast_texture',
      ingredient: 'sourdough',
    },
    {
      kind: 'food',
      label: t('Ripe tomato', 'Roșie coaptă'),
      reason: t(
        'Its acidity lifts the richness of the butter and yolks.',
        'Aciditatea ei ridică bogăția untului și a gălbenușurilor.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'tomato',
    },
    {
      kind: 'food',
      label: t('Fresh chives', 'Arpagic proaspăt'),
      reason: t(
        'A mild onion note that suits eggs without overpowering them.',
        'O notă delicată de ceapă care se potrivește cu ouăle fără să le acopere.',
      ),
      principle: 'complement_flavour',
      ingredient: 'chives',
    },
    {
      kind: 'drink',
      label: t('Fresh orange juice', 'Suc proaspăt de portocale'),
      reason: t(
        'The bright acidity refreshes the palate between rich bites.',
        'Aciditatea vie împrospătează gura între înghițituri bogate.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'fresh-orange-juice',
    },
    {
      kind: 'drink',
      label: t('Coffee', 'Cafea'),
      reason: t(
        'Its bitterness balances the rich, buttery eggs.',
        'Amăreala ei echilibrează ouăle bogate, cu gust de unt.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'coffee',
    },
  ],
  eatingMoments: [
    {
      moment: 'morning',
      polarity: 'good_for',
      reason: t(
        'Protein keeps you full through the morning.',
        'Proteinele te țin sătul pe parcursul dimineții.',
      ),
    },
    {
      moment: 'brunch',
      polarity: 'good_for',
      reason: t(
        'Quick to make and easy to dress up with sides.',
        'Se face repede și se poate completa ușor cu garnituri.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Protein helps muscles recover; add bread for carbohydrates.',
        'Proteinele ajută mușchii să se refacă; adaugă pâine pentru carbohidrați.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Eggs and butter sit heavy in the stomach during hard exercise.',
        'Ouăle și untul cad greu la stomac în timpul unui efort intens.',
      ),
    },
  ],
  variants: [
    {
      slug: 'omelette-mediterranean',
      cuisine: 'mediterranean',
      title: t('Mediterranean omelette', 'Omletă mediteraneană'),
      servings: 1,
      prepMinutes: 10,
      cookMinutes: 6,
      difficulty: 'easy',
      lines: [
        { ingredient: 'eggs', quantity: 3, unit: 'pcs' },
        { ingredient: 'olive-oil', quantity: 15, unit: 'ml' },
        {
          ingredient: 'cherry-tomato',
          quantity: 60,
          unit: 'g',
          note: t('halved', 'tăiate pe jumătate'),
        },
        {
          ingredient: 'olives',
          quantity: 20,
          unit: 'g',
          note: t('pitted and sliced', 'fără sâmburi, tăiate felii'),
        },
        {
          ingredient: 'feta',
          quantity: 40,
          unit: 'g',
          note: t('crumbled', 'mărunțită'),
        },
        { ingredient: 'oregano', quantity: 0.5, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 0.5, unit: 'g' },
      ],
      steps: [
        {
          key: 'whisk',
          text: t(
            'Whisk the eggs with the pepper and the oregano. Skip the salt for now: the feta and olives are salty.',
            'Amestecă ouăle cu piperul și oregano. Nu adăuga sare deocamdată: feta și măslinele sunt sărate.',
          ),
        },
        {
          key: 'tomatoes',
          text: t(
            'Warm half of the olive oil in a non-stick pan over medium heat and cook the tomatoes for 1 to 2 minutes, until they just soften. Tip them out onto a plate.',
            'Încălzește jumătate din uleiul de măsline într-o tigaie antiaderentă la foc mediu și gătește roșiile 1-2 minute, doar până se înmoaie. Scoate-le pe o farfurie.',
          ),
          timerSeconds: 90,
        },
        {
          key: 'cook',
          text: t(
            'Add the remaining oil, pour in the eggs and cook, pulling the edges toward the centre, until the top is just set but still glossy.',
            'Adaugă uleiul rămas, toarnă ouăle și gătește, trăgând marginile spre centru, până când partea de sus e abia închegată, dar încă lucioasă.',
          ),
          timerSeconds: 90,
        },
        {
          key: 'fill',
          text: t(
            'Scatter the tomatoes, olives and feta over one half, fold the other half over and slide onto a plate.',
            'Presară roșiile, măslinele și feta pe o jumătate, îndoaie cealaltă jumătate peste ele și treci omleta pe farfurie.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'tomatoes',
          text: t(
            'Pat the tomatoes dry first so they do not water down the eggs.',
            'Șterge roșiile cu un prosop de hârtie înainte, ca să nu lase apă în ouă.',
          ),
        },
      ],
      nutritionNote: t(
        'Olive oil and olives bring mostly unsaturated fat, and tomatoes add vitamins; feta and olives are quite salty, so go easy on added salt, and the cheese still adds saturated fat.',
        'Uleiul de măsline și măslinele aduc în mare parte grăsimi nesaturate, iar roșiile adaugă vitamine; feta și măslinele sunt destul de sărate, așa că adaugă puțină sare, iar brânza aduce totuși grăsimi saturate.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t(
            'Cucumber and rocket salad',
            'Salată de castravete și rucola',
          ),
          reason: t(
            'Crisp, peppery greens keep the plate fresh next to salty cheese.',
            'Verdeața crocantă și piperată ține farfuria proaspătă lângă brânza sărată.',
          ),
          principle: 'contrast_texture',
          ingredient: 'rocket',
        },
        {
          kind: 'food',
          label: t('Warm pita', 'Pita caldă'),
          reason: t(
            'Soft bread to scoop up the oil and tomato juices.',
            'Pâine moale cu care ștergi uleiul și sucul roșiilor.',
          ),
          principle: 'regional_tradition',
          ingredient: 'pita',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Crisp acidity cuts through the oil and cheese at a leisurely brunch.',
            'Aciditatea fină taie uleiul și brânza la un brunch relaxat.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'white-wine',
        },
        {
          kind: 'drink',
          label: t('Sparkling water with lemon', 'Apă minerală cu lămâie'),
          reason: t(
            'Bubbles and citrus refresh the palate between salty bites.',
            'Bulele și citricele împrospătează gura între îmbucături sărate.',
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
            'Filling but not heavy, with vegetables on the plate.',
            'Săturătoare, dar nu grea, cu legume în farfurie.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Quick to cook and pleasant with fresh tomatoes and olives.',
            'Se gătește repede și e plăcută cu roșii proaspete și măsline.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'The salty cheese and olives can make you thirsty at night.',
            'Brânza și măslinele sărate pot provoca sete în timpul nopții.',
          ),
        },
      ],
    },
    {
      slug: 'omelette-middle-eastern',
      cuisine: 'middle-eastern',
      title: t(
        'Middle Eastern spiced omelette',
        'Omletă orientală cu condimente',
      ),
      servings: 2,
      prepMinutes: 10,
      cookMinutes: 12,
      difficulty: 'medium',
      lines: [
        { ingredient: 'eggs', quantity: 4, unit: 'pcs' },
        { ingredient: 'olive-oil', quantity: 30, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely chopped', 'tocată mărunt'),
        },
        {
          ingredient: 'tomato',
          quantity: 150,
          unit: 'g',
          note: t('diced', 'tăiată cubulețe'),
        },
        { ingredient: 'cumin', quantity: 2, unit: 'g' },
        { ingredient: 'za-atar', quantity: 3, unit: 'g' },
        {
          ingredient: 'parsley',
          quantity: 10,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        { ingredient: 'greek-yogurt', quantity: 60, unit: 'g' },
        { ingredient: 'salt', quantity: 2, unit: 'g' },
      ],
      steps: [
        {
          key: 'soften',
          text: t(
            'Soften the onion in the olive oil in a medium non-stick pan over medium heat for about 5 minutes, until translucent.',
            'Înmoaie ceapa în uleiul de măsline într-o tigaie antiaderentă medie, la foc mediu, aproximativ 5 minute, până devine translucidă.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'spice',
          text: t(
            'Stir in the cumin and the tomato and cook for 3 to 4 minutes until the juices thicken.',
            'Adaugă chimenul și roșia și gătește 3-4 minute, până se îngroașă sosul.',
          ),
          timerSeconds: 210,
        },
        {
          key: 'eggs',
          text: t(
            "Beat the eggs with the salt and half of the za'atar, pour them over the vegetables, lower the heat and cook gently, lifting the edges, until the omelette is set and thick.",
            "Bate ouăle cu sarea și jumătate din za'atar, toarnă-le peste legume, scade focul și gătește blând, ridicând marginile, până când omleta se prinde și e groasă.",
          ),
          timerSeconds: 240,
        },
        {
          key: 'serve',
          text: t(
            "Slide onto a plate, scatter with parsley and the remaining za'atar and serve in wedges with spoonfuls of yogurt.",
            "Treci omleta pe o farfurie, presar-o cu pătrunjel și cu restul de za'atar și servește-o felii, cu linguri de iaurt.",
          ),
        },
      ],
      stepTips: [
        {
          step: 'eggs',
          text: t(
            'Keep the heat low: this omelette is cooked through and thick rather than soft in the middle.',
            'Păstrează focul mic: această omletă se gătește până în centru și iese groasă, nu moale la mijloc.',
          ),
        },
      ],
      nutritionNote: t(
        "Plenty of vegetables, herbs and olive oil make it more balanced than a plain omelette, and the spices add flavour without extra fat; the oil and eggs still make it energy-dense, and shop-bought za'atar blends can be salty.",
        "Multe legume, ierburi și ulei de măsline o fac mai echilibrată decât o omletă simplă, iar condimentele dau gust fără grăsime în plus; uleiul și ouăle o fac totuși bogată în energie, iar amestecurile de za'atar din comerț pot fi sărate.",
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Warm flatbread', 'Lipie caldă'),
          reason: t(
            'Perfect for scooping the spiced egg and tomato.',
            'Perfectă pentru a lua ouăle cu roșii și condimente.',
          ),
          principle: 'regional_tradition',
          ingredient: 'lavash',
        },
        {
          kind: 'food',
          label: t('Hummus', 'Hummus'),
          reason: t(
            'Creamy and nutty, it softens the sharper spice notes.',
            'Cremos și cu gust de nuci, îndulcește notele mai ascuțite ale condimentelor.',
          ),
          principle: 'fat_carries_flavour',
          ingredient: 'hummus',
        },
        {
          kind: 'food',
          label: t('Pickled peppers', 'Ardei murați'),
          reason: t(
            'Sharp pickle cuts through the oily, spiced eggs.',
            'Murătura acră taie uleiul din ouăle condimentate.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-peppers',
        },
        {
          kind: 'drink',
          label: t('Mint tea', 'Ceai de mentă'),
          reason: t(
            'A traditional hot drink whose fresh mint cleanses the palate.',
            'O băutură caldă tradițională, a cărei mentă proaspătă curăță gura.',
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
            'Made to share from the pan with bread.',
            'Gândită să fie împărțită din tigaie, cu pâine.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Warm, spiced and comforting.',
            'Caldă, condimentată și reconfortantă.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Onion and spices can cause heartburn lying down.',
            'Ceapa și condimentele pot da arsuri când te culci.',
          ),
        },
      ],
    },
    {
      slug: 'omelette-asian',
      cuisine: 'asian',
      title: t('Asian-style omelette', 'Omletă în stil asiatic'),
      servings: 1,
      prepMinutes: 8,
      cookMinutes: 5,
      difficulty: 'easy',
      lines: [
        { ingredient: 'eggs', quantity: 3, unit: 'pcs' },
        { ingredient: 'soy-sauce', quantity: 10, unit: 'ml' },
        { ingredient: 'sesame-oil', quantity: 5, unit: 'ml' },
        { ingredient: 'sunflower-oil', quantity: 10, unit: 'ml' },
        {
          ingredient: 'shiitake',
          quantity: 40,
          unit: 'g',
          note: t('thinly sliced', 'tăiate subțire'),
        },
        {
          ingredient: 'spring-onion',
          quantity: 20,
          unit: 'g',
          note: t('sliced', 'tăiată rondele'),
        },
        { ingredient: 'sesame-seeds', quantity: 3, unit: 'g', optional: true },
      ],
      steps: [
        {
          key: 'whisk',
          text: t(
            'Whisk the eggs with the soy sauce and half of the sesame oil. No extra salt is needed.',
            'Amestecă ouăle cu sosul de soia și jumătate din uleiul de susan. Nu mai e nevoie de sare.',
          ),
        },
        {
          key: 'mushrooms',
          text: t(
            'Heat the sunflower oil in a non-stick pan over medium-high heat and fry the shiitake for 2 minutes until golden. Add the spring onion for the last 20 seconds.',
            'Încinge uleiul de floarea-soarelui într-o tigaie antiaderentă la foc potrivit-mare și prăjește ciupercile shiitake 2 minute, până se rumenesc. Adaugă ceapa verde în ultimele 20 de secunde.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'cook',
          text: t(
            'Lower the heat to medium, pour in the eggs and stir gently for 20 seconds, then let the omelette set for about a minute.',
            'Scade focul la mediu, toarnă ouăle și amestecă ușor 20 de secunde, apoi lasă omleta să se prindă aproximativ un minut.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'finish',
          text: t(
            'Fold onto a plate, drizzle with the remaining sesame oil and sprinkle with sesame seeds.',
            'Îndoaie omleta pe o farfurie, stropește cu uleiul de susan rămas și presară semințe de susan.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'mushrooms',
          text: t(
            'Do not crowd the pan; mushrooms steam instead of browning when packed together.',
            'Nu aglomera tigaia; ciupercile se fierb în abur în loc să se rumenească dacă sunt îngrămădite.',
          ),
        },
      ],
      nutritionNote: t(
        'Mushrooms and spring onion add flavour and some fibre for little fat, and sesame oil is used only as a finish; soy sauce is high in salt, so use it sparingly, especially with high blood pressure.',
        'Ciupercile și ceapa verde adaugă aromă și puține fibre cu puțină grăsime, iar uleiul de susan se folosește doar la final; sosul de soia conține multă sare, așa că folosește-l cu măsură, mai ales dacă ai tensiune mare.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Steamed jasmine rice', 'Orez jasmine fiert la abur'),
          reason: t(
            'A plain, fragrant base that soaks up the soy and sesame.',
            'O bază simplă și parfumată, care absoarbe soia și susanul.',
          ),
          principle: 'complement_flavour',
          ingredient: 'jasmine-rice',
        },
        {
          kind: 'food',
          label: t('Sweet chilli sauce', 'Sos dulce-iute'),
          reason: t(
            'A little sweetness and heat set off the savoury eggs.',
            'Puțină dulceață și iuțeală pun în valoare ouăle sărate.',
          ),
          principle: 'salt_balances_sweet',
          ingredient: 'sweet-chili-sauce',
        },
        {
          kind: 'drink',
          label: t('Green tea', 'Ceai verde'),
          reason: t(
            'Its light bitterness cleanses the palate after the oil and soy.',
            'Amăreala ușoară curăță gura după ulei și soia.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'green-tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'morning',
          polarity: 'good_for',
          reason: t(
            'A quick, protein-rich start to the day.',
            'Un început rapid și bogat în proteine pentru zi.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Light, with rice on the side.',
            'Ușoară, cu orez alături.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'The salt in soy sauce can disturb sleep and leave you thirsty.',
            'Sarea din sosul de soia îți poate deranja somnul și te poate face să-ți fie sete.',
          ),
        },
      ],
    },
    {
      slug: 'omelette-romanian',
      cuisine: 'romanian',
      title: t(
        'Omelette with spring onion, telemea and dill',
        'Omletă cu ceapă verde, telemea și mărar',
      ),
      servings: 1,
      prepMinutes: 8,
      cookMinutes: 5,
      difficulty: 'easy',
      lines: [
        { ingredient: 'eggs', quantity: 3, unit: 'pcs' },
        { ingredient: 'butter', quantity: 15, unit: 'g' },
        {
          ingredient: 'spring-onion',
          quantity: 25,
          unit: 'g',
          note: t('sliced', 'tăiată rondele'),
        },
        {
          ingredient: 'telemea',
          quantity: 40,
          unit: 'g',
          note: t('crumbled', 'mărunțită'),
        },
        {
          ingredient: 'dill',
          quantity: 5,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        { ingredient: 'black-pepper', quantity: 0.5, unit: 'g' },
      ],
      steps: [
        {
          key: 'whisk',
          text: t(
            'Whisk the eggs with the pepper. Do not salt: the telemea will season the omelette.',
            'Bate ouăle cu piper. Nu sărăra: telemeaua va potrivi gustul omletei.',
          ),
        },
        {
          key: 'onion',
          text: t(
            'Melt the butter in a non-stick pan over medium heat and soften the spring onion for 1 minute.',
            'Topește untul într-o tigaie antiaderentă la foc mediu și înmoaie ceapa verde un minut.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'cook',
          text: t(
            'Pour in the eggs and cook, pulling the edges toward the centre, until almost set but still slightly wet on top.',
            'Toarnă ouăle și gătește, trăgând marginile spre centru, până sunt aproape prinse, dar încă ușor umede deasupra.',
          ),
          timerSeconds: 90,
        },
        {
          key: 'fill',
          text: t(
            'Sprinkle the telemea and dill over one half, fold and serve with bread and fresh vegetables.',
            'Presară telemeaua și mărarul peste o jumătate, îndoaie omleta și servește-o cu pâine și legume proaspete.',
          ),
        },
      ],
      tips: [
        t(
          'Choose a mild telemea: a very salty one can overpower the eggs.',
          'Alege o telemea mai puțin sărată: una foarte sărată poate acoperi gustul ouălor.',
        ),
      ],
      nutritionNote: t(
        'Protein from eggs and cheese keeps you full, and the herbs add freshness; telemea is salty and the butter and cheese add saturated fat, so it suits an occasional hearty breakfast more than daily eating.',
        'Proteinele din ouă și brânză te țin sătul, iar ierburile adaugă prospețime; telemeaua e sărată, iar untul și brânza aduc grăsimi saturate, așa că se potrivește mai degrabă unui mic dejun consistent ocazional decât consumului zilnic.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Country bread', 'Pâine de casă'),
          reason: t(
            'A classic Romanian partner, good for mopping the plate.',
            'Un partener clasic românesc, bun pentru a șterge farfuria.',
          ),
          principle: 'regional_tradition',
          ingredient: 'country-bread',
        },
        {
          kind: 'food',
          label: t('Pickled cucumbers', 'Castraveți murați'),
          reason: t(
            'Their sourness cuts the richness of butter and cheese.',
            'Aciditatea lor taie bogăția untului și a brânzei.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-cucumbers',
        },
        {
          kind: 'food',
          label: t('Zacuscă', 'Zacuscă'),
          reason: t(
            'A smoky aubergine spread that complements the eggs.',
            'O pastă afumată de vinete care se potrivește cu ouăle.',
          ),
          principle: 'regional_tradition',
          ingredient: 'zacusca',
        },
        {
          kind: 'drink',
          label: t('Kefir', 'Kefir'),
          reason: t(
            'Cool and tangy, it refreshes between salty bites.',
            'Răcoritor și ușor acrișor, împrospătează între îmbucături sărate.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'kefir',
        },
      ],
      eatingMoments: [
        {
          moment: 'morning',
          polarity: 'good_for',
          reason: t(
            'A hearty start that lasts until lunch.',
            'Un început consistent, care ține până la prânz.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Warm and filling when it is cold out.',
            'Caldă și săturătoare când e frig afară.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Rich and salty, a heavy thing to go to bed on.',
            'Bogată și sărată, o masă grea înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'omelette-french-rolled',
      method: 'rolled',
      title: t('French rolled omelette', 'Omletă franțuzească rulată'),
      servings: 1,
      prepMinutes: 5,
      cookMinutes: 4,
      difficulty: 'hard',
      lines: [
        { ingredient: 'eggs', quantity: 3, unit: 'pcs' },
        { ingredient: 'butter', quantity: 20, unit: 'g' },
        { ingredient: 'salt', quantity: 1, unit: 'g' },
        { ingredient: 'white-pepper', quantity: 0.3, unit: 'g' },
        {
          ingredient: 'chives',
          quantity: 4,
          unit: 'g',
          optional: true,
          note: t('finely chopped', 'tocat mărunt'),
        },
      ],
      steps: [
        {
          key: 'whisk',
          text: t(
            'Whisk the eggs with the salt and white pepper until completely smooth, then pass through a sieve if you want a perfectly even colour.',
            'Bate ouăle cu sare și piper alb până devin complet omogene, apoi strecoară-le printr-o sită dacă vrei o culoare perfect uniformă.',
          ),
        },
        {
          key: 'heat',
          text: t(
            'Melt the butter in a 20 cm non-stick pan over medium-high heat until it foams, then pour in the eggs.',
            'Topește untul într-o tigaie antiaderentă de 20 cm la foc potrivit-mare, până face spumă, apoi toarnă ouăle.',
          ),
        },
        {
          key: 'stir',
          text: t(
            'Stir constantly with a spatula and shake the pan for about 30 seconds, until the egg forms small, soft curds.',
            'Amestecă continuu cu o spatulă și scutură tigaia aproximativ 30 de secunde, până când ouăle formează cocoloașe mici și moi.',
          ),
          timerSeconds: 30,
        },
        {
          key: 'roll',
          text: t(
            'Stop stirring, let the base set for 10 seconds, then tilt the pan and roll the omelette into a cylinder, ending seam side down. Add the chives and serve at once.',
            'Oprește amestecarea, lasă baza să se prindă 10 secunde, apoi înclină tigaia și rulează omleta într-un cilindru, cu încheietura în jos. Adaugă arpagicul și servește imediat.',
          ),
          timerSeconds: 10,
        },
      ],
      tips: [
        t(
          'A French omelette should stay pale; if it browns, the heat was too high.',
          'O omletă franțuzească trebuie să rămână pal-gălbuie; dacă se rumenește, focul a fost prea tare.',
        ),
      ],
      stepTips: [
        {
          step: 'stir',
          text: t(
            'Keep the pan moving the whole time; that is what keeps the curds small and the texture creamy.',
            'Ține tigaia în mișcare tot timpul; așa rămân cocoloașele mici și textura cremoasă.',
          ),
        },
      ],
      nutritionNote: t(
        'Creamy and high in protein, with no added vegetables or cheese; the generous butter makes it richer in saturated fat than a plain omelette, and it has little fibre unless you serve it with a salad.',
        'Cremoasă și bogată în proteine, fără legume sau brânză adăugate; untul din belșug o face mai bogată în grăsimi saturate decât o omletă simplă și are puține fibre dacă nu o servești cu o salată.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Green salad with vinaigrette', 'Salată verde cu vinegretă'),
          reason: t(
            'A sharp dressing cuts through the buttery eggs.',
            'Dressingul acrișor taie ouăle cu gust de unt.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'mixed-salad',
        },
        {
          kind: 'food',
          label: t('Baguette', 'Baghetă'),
          reason: t(
            'Crusty bread contrasts with the silky texture.',
            'Pâinea crocantă contrastează cu textura mătăsoasă.',
          ),
          principle: 'contrast_texture',
          ingredient: 'baguette',
        },
        {
          kind: 'drink',
          label: t(
            'Champagne or dry sparkling wine',
            'Șampanie sau vin spumant sec',
          ),
          reason: t(
            'The bubbles and acidity refresh the palate between rich bites.',
            'Bulele și aciditatea împrospătează gura între îmbucături bogate.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'sparkling-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'Elegant and quick, a classic brunch dish.',
            'Elegantă și rapidă, un preparat clasic de brunch.',
          ),
        },
        {
          moment: 'morning',
          polarity: 'good_for',
          reason: t(
            'Gentle on the stomach and full of protein.',
            'Blândă cu stomacul și plină de proteine.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Butter and eggs digest slowly.',
            'Untul și ouăle se digeră încet.',
          ),
        },
      ],
    },
    {
      slug: 'omelette-american-folded',
      method: 'folded',
      title: t('American folded omelette', 'Omletă americană pliată'),
      servings: 1,
      prepMinutes: 10,
      cookMinutes: 6,
      difficulty: 'easy',
      lines: [
        { ingredient: 'eggs', quantity: 3, unit: 'pcs' },
        { ingredient: 'milk', quantity: 15, unit: 'ml' },
        { ingredient: 'butter', quantity: 10, unit: 'g' },
        {
          ingredient: 'ham',
          quantity: 40,
          unit: 'g',
          note: t('diced', 'tăiată cubulețe'),
        },
        {
          ingredient: 'bell-pepper',
          quantity: 0.25,
          unit: 'pcs',
          note: t('diced', 'tăiat cubulețe'),
        },
        {
          ingredient: 'cheddar',
          quantity: 30,
          unit: 'g',
          note: t('grated', 'rasă'),
        },
        { ingredient: 'salt', quantity: 1, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 0.5, unit: 'g' },
      ],
      steps: [
        {
          key: 'fry',
          text: t(
            'Melt half of the butter in a non-stick pan over medium heat and fry the ham and pepper for 2 to 3 minutes. Set aside.',
            'Topește jumătate din unt într-o tigaie antiaderentă la foc mediu și prăjește șunca și ardeiul 2-3 minute. Pune-le deoparte.',
          ),
          timerSeconds: 150,
        },
        {
          key: 'whisk',
          text: t(
            'Whisk the eggs with the milk, salt and pepper.',
            'Bate ouăle cu laptele, sarea și piperul.',
          ),
        },
        {
          key: 'cook',
          text: t(
            'Melt the remaining butter, pour in the eggs and cook for 2 minutes without stirring, lifting the edges once so the raw egg can run underneath.',
            'Topește untul rămas, toarnă ouăle și gătește 2 minute fără să amesteci, ridicând o singură dată marginile ca ouăle crude să curgă dedesubt.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'fold',
          text: t(
            'Spoon the ham, pepper and cheddar onto one half, fold the other half over, cover for 30 seconds so the cheese melts, and slide onto a plate.',
            'Pune șunca, ardeiul și cașcavalul cheddar pe o jumătate, îndoaie cealaltă jumătate peste, acoperă 30 de secunde ca brânza să se topească și treci omleta pe farfurie.',
          ),
          timerSeconds: 30,
        },
      ],
      tips: [
        t(
          'Let the fillings cool slightly before folding; piping hot fillings can make the eggs weep.',
          'Lasă umplutura să se răcească puțin înainte de a plia; o umplutură fierbinte poate face ouăle să lase apă.',
        ),
      ],
      nutritionNote: t(
        'Plenty of protein and a vegetable for some fibre, which makes it a substantial meal; ham and cheddar make it high in salt and saturated fat, so it is best kept as an occasional treat.',
        'Multe proteine și o legumă pentru puține fibre, ceea ce o face o masă consistentă; șunca și cheddarul o fac bogată în sare și grăsimi saturate, așa că e mai bine s-o păstrezi pentru ocazii.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Hash browns', 'Hash browns'),
          reason: t(
            'Crispy potato gives a crunchy contrast to the soft folded eggs.',
            'Cartofii crocanți oferă un contrast cu ouăle moi pliate.',
          ),
          principle: 'contrast_texture',
          ingredient: 'hash-browns',
        },
        {
          kind: 'food',
          label: t('Sliced tomato', 'Roșie feliată'),
          reason: t(
            'Fresh acidity balances the ham and cheddar.',
            'Aciditatea proaspătă echilibrează șunca și cheddarul.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'tomato',
        },
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'The classic partner: bitterness against the rich, salty filling.',
            'Partenerul clasic: amăreala contra umpluturii bogate și sărate.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'coffee',
        },
      ],
      eatingMoments: [
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'Hearty enough to carry you to the afternoon.',
            'Suficient de consistentă ca să te țină până după-amiază.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein-rich for recovery.',
            'Bogată în proteine pentru refacere.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'Heavy and salty when it is hot.',
            'Grea și sărată pe vreme caldă.',
          ),
        },
      ],
    },
    {
      slug: 'omelette-frittata',
      method: 'frittata',
      title: t(
        'Spinach and parmesan frittata',
        'Frittata cu spanac și parmezan',
      ),
      servings: 3,
      prepMinutes: 10,
      cookMinutes: 15,
      difficulty: 'medium',
      lines: [
        { ingredient: 'eggs', quantity: 6, unit: 'pcs' },
        { ingredient: 'milk', quantity: 50, unit: 'ml' },
        { ingredient: 'olive-oil', quantity: 15, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('thinly sliced', 'tăiată subțire'),
        },
        { ingredient: 'spinach', quantity: 150, unit: 'g' },
        {
          ingredient: 'parmesan',
          quantity: 30,
          unit: 'g',
          note: t('finely grated', 'rasă fin'),
        },
        { ingredient: 'salt', quantity: 2, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the grill (or oven to 200 C) with a rack in the upper third.',
            'Încinge grill-ul (sau cuptorul la 200 C) cu grătarul în treimea de sus.',
          ),
        },
        {
          key: 'onion',
          text: t(
            'Soften the onion in the olive oil in a 24 cm oven-safe pan over medium heat for 5 minutes. Add the spinach and cook for 2 minutes until wilted, and drain off any liquid.',
            'Înmoaie ceapa în uleiul de măsline într-o tigaie de 24 cm rezistentă la cuptor, la foc mediu, 5 minute. Adaugă spanacul și gătește 2 minute, până se ofilește, și scurge lichidul rămas.',
          ),
          timerSeconds: 420,
        },
        {
          key: 'eggs',
          text: t(
            'Whisk the eggs with the milk, half of the parmesan, salt and pepper. Pour over the vegetables and cook over low heat for 6 to 8 minutes, until the edges are set and the middle is still wobbly.',
            'Bate ouăle cu laptele, jumătate din parmezan, sare și piper. Toarnă-le peste legume și gătește la foc mic 6-8 minute, până când marginile sunt prinse, iar mijlocul tremură încă.',
          ),
          timerSeconds: 420,
        },
        {
          key: 'grill',
          text: t(
            'Sprinkle with the remaining parmesan and put the pan under the grill for 2 to 3 minutes until set and lightly golden. Rest for 5 minutes, then cut into wedges.',
            'Presară parmezanul rămas și pune tigaia sub grill 2-3 minute, până se prinde și capătă o culoare ușor aurie. Lasă-o 5 minute, apoi taie felii.',
          ),
          timerSeconds: 150,
        },
      ],
      tips: [
        t(
          'A frittata is good cold, so cook it ahead for packed lunches.',
          'Frittata e bună și rece, așa că poți s-o gătești dinainte pentru pachetul de prânz.',
        ),
      ],
      stepTips: [
        {
          step: 'onion',
          text: t(
            'Squeeze out as much liquid from the spinach as you can; wet spinach makes the frittata soggy.',
            'Stoarce cât mai mult lichid din spanac; spanacul ud face frittata moale.',
          ),
        },
      ],
      nutritionNote: t(
        'Spinach and onion bring vitamins, iron and fibre, so it is more balanced than a plain omelette and protein-rich; parmesan adds salt and saturated fat, and the iron in spinach is absorbed only partly.',
        'Spanacul și ceapa aduc vitamine, fier și fibre, deci e mai echilibrată decât o omletă simplă și bogată în proteine; parmezanul adaugă sare și grăsimi saturate, iar fierul din spanac se absoarbe doar parțial.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Rocket and lemon salad', 'Salată de rucola cu lămâie'),
          reason: t(
            'Peppery, acidic leaves lighten the dense, cheesy slice.',
            'Frunzele piperate și acrișoare ușurează felia densă, cu brânză.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'rocket',
        },
        {
          kind: 'food',
          label: t('Ciabatta', 'Ciabatta'),
          reason: t(
            'Airy, crusty bread to soak up the olive oil.',
            'Pâine aerată și crocantă, care absoarbe uleiul de măsline.',
          ),
          principle: 'contrast_texture',
          ingredient: 'ciabatta',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Crisp acidity suits eggs, spinach and parmesan.',
            'Aciditatea fină se potrivește cu ouăle, spanacul și parmezanul.',
          ),
          principle: 'complement_flavour',
          ingredient: 'white-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Eaten warm or cold, it is easy to portion.',
            'Se mănâncă caldă sau rece și se porționează ușor.',
          ),
        },
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'Feeds a few people with little last-minute work.',
            'Hrănește câțiva oameni cu puțină muncă în ultima clipă.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Dense and rich, hard to digest right before bed.',
            'Densă și bogată, greu de digerat chiar înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
