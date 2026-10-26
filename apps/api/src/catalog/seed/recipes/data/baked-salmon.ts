import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Baked salmon base is skin-on fillets baked in a hot oven with a lemon,
// dill and garlic butter. Each Variant is a full Recipe with its own lines,
// steps and guidance; the base's Recipe-level Tips are inherited.
export const bakedSalmon: BaseRecipeSeed = {
  slug: 'baked-salmon',
  title: t(
    'Oven-baked salmon with lemon and dill',
    'Somon la cuptor cu lămâie și mărar',
  ),
  servings: 4,
  prepMinutes: 10,
  cookMinutes: 16,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'salmon',
      quantity: 600,
      unit: 'g',
      note: t(
        '4 skin-on fillets of about 150 g, evenly thick',
        '4 fileuri cu piele de aproximativ 150 g, de grosime egală',
      ),
    },
    {
      ingredient: 'lemon',
      quantity: 2,
      unit: 'pcs',
      note: t(
        'one zested and juiced, one cut into thin slices',
        'uneia i se rade coaja și i se stoarce sucul, cealaltă se taie felii subțiri',
      ),
    },
    {
      ingredient: 'dill',
      quantity: 20,
      unit: 'g',
      note: t('finely chopped', 'tocat mărunt'),
    },
    {
      ingredient: 'garlic',
      quantity: 10,
      unit: 'g',
      note: t('3 cloves, finely chopped', '3 căței, tocați mărunt'),
    },
    { ingredient: 'butter', quantity: 40, unit: 'g' },
    {
      ingredient: 'olive-oil',
      quantity: 15,
      unit: 'ml',
      note: t('for the tray', 'pentru tavă'),
    },
    { ingredient: 'salt', quantity: 4, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
  ],
  steps: [
    {
      key: 'preheat',
      text: t(
        'Heat the oven to 200°C (180°C fan). Brush a baking tray with the olive oil.',
        'Încălzește cuptorul la 200°C (180°C cu ventilator). Unge o tavă cu uleiul de măsline.',
      ),
    },
    {
      key: 'prep-fish',
      text: t(
        'Pat the fillets dry with paper towels and set them skin side down on the tray, a few centimetres apart.',
        'Șterge fileurile cu șervețele de hârtie și pune-le pe tavă cu pielea în jos, la câțiva centimetri unul de altul.',
      ),
    },
    {
      key: 'butter',
      text: t(
        'Melt the butter with the garlic in a small pan over low heat for 1 minute, until fragrant but not browned. Off the heat, stir in the lemon zest, the juice of that lemon and half the dill.',
        'Topește untul cu usturoiul într-o cratiță mică la foc mic, 1 minut, până se simte mirosul de usturoi, fără să se rumenească. Ia de pe foc și adaugă coaja rasă și sucul aceleiași lămâi și jumătate din mărar.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'season',
      text: t(
        'Sprinkle the salt and pepper over the fillets, spoon the garlic butter on top and lay the lemon slices over each fillet.',
        'Presară sarea și piperul peste fileuri, toarnă untul cu usturoi deasupra și așază felii de lămâie pe fiecare file.',
      ),
    },
    {
      key: 'bake',
      text: t(
        'Bake for 12 minutes, until the flesh turns opaque and flakes easily when you press the thickest part with a fork.',
        'Coace 12 minute, până când carnea devine opacă și se desface ușor în fulgi când apeși cu furculița în partea cea mai groasă.',
      ),
      timerSeconds: 720,
    },
    {
      key: 'rest',
      text: t(
        'Lift the salmon onto warm plates and let it stand for 3 minutes. Spoon the buttery juices from the tray over the fillets and scatter the rest of the dill on top.',
        'Mută somonul pe farfurii calde și lasă-l 3 minute. Pune cu lingura sosul de unt din tavă peste fileuri și presară restul de mărar.',
      ),
      timerSeconds: 180,
    },
  ],
  tips: [
    t(
      'Take the salmon out as soon as it flakes: it keeps cooking on the hot tray, and overbaked salmon turns dry and chalky.',
      'Scoate somonul imediat ce se desface în fulgi: continuă să se gătească pe tava fierbinte, iar somonul copt prea mult se usucă și devine făinos.',
    ),
    t(
      'Buy fillets cut from the thick middle of the side, so they are the same thickness. If a piece has a thin tail end, fold it under so it does not overcook first.',
      'Alege fileuri tăiate din mijlocul gros al bucății, de aceeași grosime. Dacă o bucată are coada subțire, îndoaie-o dedesubt ca să nu se gătească prea tare înaintea restului.',
    ),
    t(
      'Leftovers: cool the salmon, cover it and refrigerate within 2 hours, and eat it within 2 days. Flake it cold into a salad, or reheat it gently until steaming hot.',
      'Resturi: lasă somonul să se răcească, acoperă-l și pune-l la frigider în maximum 2 ore, apoi consumă-l în 2 zile. Desfă-l în fulgi și adaugă-l rece într-o salată sau încălzește-l ușor, până scoate aburi.',
    ),
  ],
  stepTips: [
    {
      step: 'bake',
      text: t(
        'Check at 10 minutes by pressing the thickest part. Thinner fillets are done sooner, and a cold fillet straight from the fridge needs a little longer.',
        'Verifică la 10 minute apăsând partea cea mai groasă. Fileurile mai subțiri sunt gata mai repede, iar cele scoase direct din frigider mai au nevoie de puțin timp.',
      ),
    },
  ],
  nutritionNote: t(
    'Salmon is rich in protein and a source of omega-3 fats, and the lemon and dill add flavour without salt. The butter adds saturated fat and the added salt counts, so keep both modest, and serve with vegetables or potatoes for fibre.',
    'Somonul e bogat în proteine și este o sursă de acizi grași omega-3, iar lămâia și mărarul dau gust fără sare. Untul aduce grăsimi saturate și sarea adăugată contează, așa că folosește-le cu măsură și servește cu legume sau cartofi pentru fibre.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Potato puree', 'Piure de cartofi'),
      reason: t(
        'Soft mash soaks up the lemon-butter juices from the tray.',
        'Piureul moale absoarbe sosul de unt și lămâie din tavă.',
      ),
      principle: 'fat_carries_flavour',
      recipe: 'potato-puree',
    },
    {
      kind: 'food',
      label: t('Asparagus', 'Sparanghel'),
      reason: t(
        'Its green, slightly bitter flavour keeps the rich fish from feeling heavy.',
        'Gustul lui verde, ușor amărui, echilibrează somonul gras, ca să nu pară greu.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'asparagus',
    },
    {
      kind: 'food',
      label: t('Rocket salad', 'Salată de rucola'),
      reason: t(
        'Peppery leaves give a fresh, crisp contrast to the soft flakes of fish.',
        'Frunzele picante aduc un contrast proaspăt și crocant cu fulgii moi de pește.',
      ),
      principle: 'contrast_texture',
      ingredient: 'rocket',
    },
    {
      kind: 'drink',
      label: t('Dry white wine', 'Vin alb sec'),
      reason: t(
        'Its acidity cuts through the oily richness of the salmon.',
        'Aciditatea lui taie bogăția grasă a somonului.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'white-wine',
    },
    {
      kind: 'drink',
      label: t('Sparkling water', 'Apă minerală'),
      reason: t(
        'The bubbles refresh the palate between bites of buttery fish.',
        'Bulele împrospătează gustul între îmbucăturile de pește cu unt.',
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
        'Protein-rich and ready in under half an hour, without the heaviness of fried food.',
        'Bogat în proteine și gata în mai puțin de o jumătate de oră, fără greutatea alimentelor prăjite.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Protein helps muscles recover; add potatoes or rice for carbohydrates.',
        'Proteinele ajută mușchii să se refacă; adaugă cartofi sau orez pentru carbohidrați.',
      ),
    },
  ],
  variants: [
    {
      slug: 'baked-salmon-japanese',
      cuisine: 'japanese',
      title: t(
        'Miso-marinated salmon (saikyo-yaki)',
        'Somon marinat în miso (saikyo-yaki)',
      ),
      servings: 4,
      prepMinutes: 1451,
      cookMinutes: 11,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'salmon',
          quantity: 600,
          unit: 'g',
          note: t(
            '4 skin-on fillets of about 150 g, evenly thick',
            '4 fileuri cu piele de aproximativ 150 g, de grosime egală',
          ),
        },
        { ingredient: 'white-miso', quantity: 150, unit: 'g' },
        { ingredient: 'mirin', quantity: 60, unit: 'ml' },
        { ingredient: 'sake', quantity: 60, unit: 'ml' },
        { ingredient: 'sugar', quantity: 15, unit: 'g' },
        {
          ingredient: 'spring-onion',
          quantity: 20,
          unit: 'g',
          note: t('thinly sliced', 'tăiată subțire'),
        },
      ],
      steps: [
        {
          key: 'boil-marinade',
          text: t(
            'Bring the mirin and sake to a boil in a small pan and simmer for 1 minute to cook off the alcohol.',
            'Adu mirinul și sake-ul la fierbere într-o cratiță mică și fierbe-le 1 minut, ca alcoolul să se evapore.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'mix-marinade',
          text: t(
            'Off the heat, whisk in the sugar and the miso until smooth. Let the marinade cool completely, about 10 minutes.',
            'Ia de pe foc și amestecă zahărul și misoul până obții o pastă fină. Lasă marinada să se răcească complet, aproximativ 10 minute.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'marinate',
          text: t(
            'Put the fillets in a dish or a zip bag, coat them all over with the marinade, cover and refrigerate for 24 hours. Do not go beyond 48 hours, or the fish turns too salty and dense.',
            'Pune fileurile într-un vas sau într-o pungă cu închidere, acoperă-le peste tot cu marinada, acoperă și lasă la frigider 24 de ore. Nu depăși 48 de ore, altfel peștele devine prea sărat și compact.',
          ),
          timerSeconds: 86400,
        },
        {
          key: 'preheat',
          text: t(
            'Heat the oven grill to high, with a rack about 15 cm below the element. Line a baking tray with foil.',
            'Încălzește grillul cuptorului la maximum, cu grătarul la aproximativ 15 cm sub rezistență. Acoperă o tavă cu folie de aluminiu.',
          ),
        },
        {
          key: 'wipe',
          text: t(
            'Lift the fillets out of the marinade and wipe off nearly all of it with your fingers or paper towels, because the sugar in the miso burns. Set them skin side down on the foil. Throw away the leftover marinade, as raw fish has touched it.',
            'Scoate fileurile din marinadă și șterge aproape toată marinada cu degetele sau cu șervețele de hârtie, pentru că zahărul din miso se arde. Așază-le pe folie cu pielea în jos. Aruncă marinada rămasă, pentru că a atins pește crud.',
          ),
        },
        {
          key: 'grill-flesh',
          text: t(
            'Grill the fillets for 5 minutes, until the surface is browned in patches. If it darkens too fast, cover loosely with foil.',
            'Gătește fileurile sub grill 5 minute, până când suprafața se rumenește pe alocuri. Dacă se închide la culoare prea repede, acoperă-le liber cu folie.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'grill-through',
          text: t(
            'Grill for another 4 minutes, until the fish is opaque all the way through and flakes easily at the thickest part. If the centre is still translucent, keep grilling until it is opaque.',
            'Mai gătește încă 4 minute, până când peștele e opac în tot interiorul și se desface ușor în fulgi în partea cea mai groasă. Dacă centrul e încă translucid, continuă până devine opac.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'rest',
          text: t(
            'Rest the salmon for 2 minutes, then scatter the spring onion over it and serve.',
            'Lasă somonul 2 minute, apoi presară ceapa verde deasupra și servește.',
          ),
          timerSeconds: 120,
        },
      ],
      tips: [
        t(
          'Marinated fillets freeze well in their marinade; thaw them overnight in the fridge before grilling.',
          'Fileurile marinate se pot congela în marinadă; lasă-le peste noapte la frigider să se dezghețe înainte de grill.',
        ),
      ],
      stepTips: [
        {
          step: 'marinate',
          text: t(
            'Marinate in the fridge, never on the counter. Raw fish needs to stay cold for the whole day or two.',
            'Marinează la frigider, niciodată pe blat. Peștele crud trebuie să rămână rece pe toată durata marinării, o zi sau două.',
          ),
        },
      ],
      nutritionNote: t(
        'Salmon gives protein and omega-3 fats. The miso marinade brings a lot of salt, and the mirin and sugar add sugar, so wipe most of it off and serve with plain rice and vegetables rather than more salty sides.',
        'Somonul aduce proteine și acizi grași omega-3. Marinada de miso are multă sare, iar mirinul și zahărul adaugă zahăr, așa că șterge cea mai mare parte din ea și servește cu orez simplu și legume, nu cu garnituri sărate.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Steamed rice', 'Orez fiert la abur'),
          reason: t(
            'Plain rice mellows the salty-sweet glaze of the miso.',
            'Orezul simplu domolește glazura sărat-dulce de miso.',
          ),
          principle: 'complement_flavour',
          ingredient: 'rice',
        },
        {
          kind: 'food',
          label: t('Cucumber with rice vinegar', 'Castraveți cu oțet de orez'),
          reason: t(
            'Cold, crunchy cucumber with a sharp dressing contrasts with the soft, rich fish.',
            'Castravetele rece și crocant, cu un dressing acrișor, contrastează cu peștele moale și bogat.',
          ),
          principle: 'contrast_texture',
          ingredient: 'cucumber',
        },
        {
          kind: 'drink',
          label: t('Green tea', 'Ceai verde'),
          reason: t(
            'Its light bitterness clears the palate of the sweet miso glaze.',
            'Amăreala lui ușoară curăță gustul de glazura dulce de miso.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'green-tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Protein-rich and light, and the marinating is done a day ahead.',
            'Bogat în proteine și ușor, iar marinarea se face cu o zi înainte.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein helps muscles recover; serve with rice for carbohydrates.',
            'Proteinele ajută mușchii să se refacă; servește cu orez pentru carbohidrați.',
          ),
        },
      ],
    },
    {
      slug: 'baked-salmon-mediterranean',
      cuisine: 'mediterranean',
      title: t(
        'Salmon traybake with tomatoes, olives and capers',
        'Somon la tavă cu roșii, măsline și capere',
      ),
      servings: 4,
      prepMinutes: 10,
      cookMinutes: 29,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'salmon',
          quantity: 600,
          unit: 'g',
          note: t(
            '4 skin-on fillets of about 150 g, evenly thick',
            '4 fileuri cu piele de aproximativ 150 g, de grosime egală',
          ),
        },
        {
          ingredient: 'cherry-tomato',
          quantity: 300,
          unit: 'g',
          note: t('halved', 'tăiate în jumătăți'),
        },
        {
          ingredient: 'olives',
          quantity: 80,
          unit: 'g',
          note: t('pitted Kalamata', 'Kalamata fără sâmburi'),
        },
        {
          ingredient: 'capers',
          quantity: 30,
          unit: 'g',
          note: t('rinsed and drained', 'clătite și scurse'),
        },
        {
          ingredient: 'red-onion',
          quantity: 1,
          unit: 'pcs',
          note: t('cut into thin wedges', 'tăiată în felii subțiri'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t('3 cloves, sliced', '3 căței, tăiați felii'),
        },
        { ingredient: 'oregano', quantity: 2, unit: 'g' },
        { ingredient: 'olive-oil', quantity: 45, unit: 'ml' },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t('juiced', 'stoarsă'),
        },
        { ingredient: 'salt', quantity: 3, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 200°C (180°C fan).',
            'Încălzește cuptorul la 200°C (180°C cu ventilator).',
          ),
        },
        {
          key: 'toss-veg',
          text: t(
            'On a large baking tray, toss the tomatoes, onion, garlic and oregano with 30 ml of the olive oil and 1 g of the salt.',
            'Pe o tavă mare, amestecă roșiile, ceapa, usturoiul și oregano cu 30 ml din uleiul de măsline și 1 g din sare.',
          ),
        },
        {
          key: 'roast-veg',
          text: t(
            'Roast for 15 minutes, until the tomatoes have burst and the onion is soft at the edges.',
            'Coace 15 minute, până când roșiile plesnesc, iar ceapa se înmoaie la margini.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'add-fish',
          text: t(
            'Pat the fillets dry, season them with the remaining 2 g of salt and the pepper, and nestle them skin side down among the vegetables. Drizzle with the remaining 15 ml of olive oil.',
            'Șterge fileurile, condimentează-le cu cele 2 g de sare rămase și cu piper și așază-le printre legume, cu pielea în jos. Stropește cu cei 15 ml de ulei de măsline rămași.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 12 minutes, until the salmon turns opaque and flakes easily when you press the thickest part with a fork.',
            'Coace 12 minute, până când somonul devine opac și se desface ușor în fulgi când apeși cu furculița în partea cea mai groasă.',
          ),
          timerSeconds: 720,
        },
        {
          key: 'finish',
          text: t(
            'Scatter the olives and capers over the tray, squeeze the lemon juice on top and let it rest for 2 minutes. Spoon the tomato juices over the fish.',
            'Presară măslinele și caperele pe tavă, stoarce sucul de lămâie deasupra și lasă 2 minute. Pune cu lingura sucul roșiilor peste pește.',
          ),
          timerSeconds: 120,
        },
      ],
      tips: [
        t(
          'Olives and capers are salty, so salt the fish lightly and add them only at the end.',
          'Măslinele și caperele sunt sărate, așa că sărează puțin peștele și adaugă-le abia la sfârșit.',
        ),
      ],
      stepTips: [
        {
          step: 'roast-veg',
          text: t(
            'Spread the vegetables in one layer. If they are crowded they steam and stay watery instead of roasting.',
            'Întinde legumele într-un singur strat. Dacă sunt îngrămădite se fierb în abur și rămân apoase, în loc să se rumenească.',
          ),
        },
      ],
      nutritionNote: t(
        'Salmon gives protein and omega-3 fats, and the tomatoes and onion add vegetables and fibre. Olive oil is mostly unsaturated fat but still calorie-dense, and the olives and capers are salty, so rinse the capers and use little extra salt.',
        'Somonul aduce proteine și acizi grași omega-3, iar roșiile și ceapa adaugă legume și fibre. Uleiul de măsline are mai ales grăsimi nesaturate, dar este bogat în calorii, iar măslinele și caperele sunt sărate, așa că clătește caperele și adaugă puțină sare.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Spinach rice', 'Orez cu spanac'),
          reason: t(
            'Soft rice soaks up the tomato, olive and caper juices from the tray.',
            'Orezul moale absoarbe sucurile de roșii, măsline și capere din tavă.',
          ),
          principle: 'complement_flavour',
          recipe: 'rice-pilaf-greek',
        },
        {
          kind: 'food',
          label: t('Sourdough bread', 'Pâine cu maia'),
          reason: t(
            'A crusty slice mops up the juices and gives a crisp bite beside the soft fish.',
            'O felie cu crustă șterge sosul din tavă și oferă un contrast crocant lângă pește.',
          ),
          principle: 'contrast_texture',
          ingredient: 'sourdough',
        },
        {
          kind: 'drink',
          label: t('Dry rosé', 'Vin rosé sec'),
          reason: t(
            'Its acidity cuts the oily fish and stands up to the tomatoes.',
            'Aciditatea lui taie grăsimea peștelui și ține piept roșiilor.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'rose-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Light and fresh-tasting, and just as good warm as hot.',
            'Ușor și proaspăt la gust, la fel de bun cald ca fierbinte.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Fish and vegetables on one tray, with nothing to fry.',
            'Pește și legume pe o singură tavă, fără nimic de prăjit.',
          ),
        },
      ],
    },
    {
      slug: 'baked-salmon-french',
      cuisine: 'french',
      title: t('Salmon en papillote', 'Somon în pergament (en papillote)'),
      servings: 4,
      hideBaseTips: [0],
      prepMinutes: 20,
      cookMinutes: 17,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'salmon',
          quantity: 600,
          unit: 'g',
          note: t(
            '4 skinless fillets of about 150 g, evenly thick',
            '4 fileuri fără piele de aproximativ 150 g, de grosime egală',
          ),
        },
        {
          ingredient: 'leek',
          quantity: 150,
          unit: 'g',
          note: t(
            'white and pale green part, cut into thin strips',
            'partea albă și verde-deschis, tăiată în fâșii subțiri',
          ),
        },
        {
          ingredient: 'carrot',
          quantity: 150,
          unit: 'g',
          note: t('cut into thin strips', 'tăiați în fâșii subțiri'),
        },
        {
          ingredient: 'shallot',
          quantity: 40,
          unit: 'g',
          note: t('finely sliced', 'tăiată felii subțiri'),
        },
        { ingredient: 'butter', quantity: 40, unit: 'g' },
        { ingredient: 'white-wine', quantity: 80, unit: 'ml' },
        {
          ingredient: 'tarragon',
          quantity: 6,
          unit: 'g',
          note: t('leaves picked', 'frunzele desprinse'),
        },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t('4 thin slices', '4 felii subțiri'),
        },
        { ingredient: 'salt', quantity: 4, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 200°C (180°C fan).',
            'Încălzește cuptorul la 200°C (180°C cu ventilator).',
          ),
        },
        {
          key: 'cut-paper',
          text: t(
            'Cut four sheets of baking paper, each about 40 cm long, and fold each in half to mark the centre line.',
            'Taie patru foi de hârtie de copt, fiecare de aproximativ 40 cm, și îndoaie fiecare în două pentru a marca linia de la mijloc.',
          ),
        },
        {
          key: 'veg-bed',
          text: t(
            'Toss the leek, carrot and shallot with 1 g of the salt. Divide them between the sheets, piling each portion on one side of the fold.',
            'Amestecă prazul, morcovul și șalota cu 1 g din sare. Împarte-le pe foi, aranjând fiecare porție pe o parte a pliului.',
          ),
        },
        {
          key: 'fish',
          text: t(
            'Pat the fillets dry, season them with the remaining 3 g of salt and the pepper, and lay one on each bed of vegetables.',
            'Șterge fileurile, condimentează-le cu cele 3 g de sare rămase și cu piper și pune câte unul peste fiecare strat de legume.',
          ),
        },
        {
          key: 'top',
          text: t(
            'Top each fillet with a lemon slice, a few tarragon leaves and a quarter of the butter in small pieces. Spoon 20 ml of white wine over each.',
            'Pune pe fiecare file o felie de lămâie, câteva frunze de tarhon și un sfert din unt, în bucăți mici. Toarnă câte 20 ml de vin alb peste fiecare.',
          ),
        },
        {
          key: 'seal',
          text: t(
            'Fold the paper over the fish and crimp the edges tightly, folding them over each other all the way round, so the steam cannot escape. Set the parcels on a baking tray.',
            'Îndoaie hârtia peste pește și închide marginile strâns, împăturindu-le una peste alta pe tot conturul, ca aburul să nu iasă. Așază pachetele pe o tavă.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 15 minutes, until the parcels are puffed up and the paper has browned lightly at the edges.',
            'Coace 15 minute, până când pachetele se umflă, iar hârtia se rumenește ușor la margini.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'rest',
          text: t(
            'Rest the parcels for 2 minutes. Slide each onto a plate and cut it open at the table, keeping your face back from the steam. The salmon should be opaque and flake easily; if it is still translucent in the centre, fold the paper closed again and return it to the oven until it is opaque.',
            'Lasă pachetele 2 minute. Pune fiecare pachet într-o farfurie și deschide-l la masă, ținând fața departe de abur. Somonul trebuie să fie opac și să se desfacă ușor în fulgi; dacă centrul e încă translucid, închide hârtia la loc și pune pachetul înapoi în cuptor până devine opac.',
          ),
          timerSeconds: 120,
        },
      ],
      tips: [
        t(
          'Cut the vegetables into very thin strips: they have only 15 minutes in the steam, and thick pieces stay hard.',
          'Taie legumele în fâșii foarte subțiri: stau doar 15 minute în abur, iar bucățile groase rămân tari.',
        ),
      ],
      stepTips: [
        {
          step: 'seal',
          text: t(
            'Do not open a parcel early. Escaping steam cooks the fish unevenly and the juices are lost.',
            'Nu deschide un pachet mai devreme. Aburul care iese gătește peștele inegal și sosul se pierde.',
          ),
        },
      ],
      nutritionNote: t(
        'Salmon gives protein and omega-3 fats, and the leek and carrot add fibre and vegetables. Steaming needs no frying fat, but the butter adds saturated fat and the wine adds a little alcohol that does not fully cook off, so keep both modest.',
        'Somonul aduce proteine și acizi grași omega-3, iar prazul și morcovul adaugă fibre și legume. Gătitul la abur nu cere grăsime pentru prăjit, dar untul adaugă grăsimi saturate, iar vinul aduce puțin alcool care nu se evaporă complet, așa că folosește-le cu măsură.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Boiled new potatoes', 'Cartofi noi fierți'),
          reason: t(
            'Plain potatoes soak up the buttery wine juices from the parcel.',
            'Cartofii simpli absorb sosul de unt și vin din pachet.',
          ),
          principle: 'fat_carries_flavour',
          ingredient: 'potato',
        },
        {
          kind: 'food',
          label: t('Baguette', 'Baghetă'),
          reason: t(
            'A crisp crust gives a contrast to the soft fish and mops up the juices.',
            'Crusta crocantă contrastează cu peștele moale și șterge sosul din farfurie.',
          ),
          principle: 'contrast_texture',
          ingredient: 'baguette',
        },
        {
          kind: 'drink',
          label: t('Sparkling wine', 'Vin spumant'),
          reason: t(
            'Its acidity and bubbles cut through the butter and refresh the palate.',
            'Aciditatea și bulele lui taie untul și împrospătează gustul.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'sparkling-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Fish and vegetables in one parcel, light and with no frying.',
            'Pește și legume într-un singur pachet, ușor și fără prăjeală.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein helps muscles recover; add potatoes for carbohydrates.',
            'Proteinele ajută mușchii să se refacă; adaugă cartofi pentru carbohidrați.',
          ),
        },
      ],
    },
  ],
};
