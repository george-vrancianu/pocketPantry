import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The base is the Romanian meatless mushroom stew (tocăniță de ciuperci), made
// with oil so it also suits a fasting day. Each Variant is a full Recipe with
// its own lines, steps and guidance; the base's Recipe-level Tips are inherited
// unless a Variant hides them (hideBaseTips).
export const tocanaDeCiuperci: BaseRecipeSeed = {
  slug: 'tocana-de-ciuperci',
  title: t(
    'Romanian mushroom stew (tocăniță de ciuperci)',
    'Tocăniță de ciuperci',
  ),
  servings: 4,
  prepMinutes: 15,
  cookMinutes: 40,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'button-mushrooms',
      quantity: 800,
      unit: 'g',
      note: t('wiped clean, quartered', 'șterse, tăiate în patru'),
    },
    { ingredient: 'sunflower-oil', quantity: 60, unit: 'ml' },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('finely chopped', 'tăiate mărunt'),
    },
    {
      ingredient: 'garlic',
      quantity: 12,
      unit: 'g',
      note: t('about 3 cloves, minced', 'circa 3 căței, tocați'),
    },
    {
      ingredient: 'bell-pepper',
      quantity: 1,
      unit: 'pcs',
      optional: true,
      note: t('diced', 'tăiat cubulețe'),
    },
    { ingredient: 'tomato-paste', quantity: 30, unit: 'g', optional: true },
    { ingredient: 'paprika', quantity: 3, unit: 'g', optional: true },
    { ingredient: 'bay-leaves', quantity: 0.4, unit: 'g' },
    { ingredient: 'savory', quantity: 1, unit: 'g', optional: true },
    { ingredient: 'still-water', quantity: 0.2, unit: 'l' },
    {
      ingredient: 'dill',
      quantity: 15,
      unit: 'g',
      note: t('finely chopped', 'tocat mărunt'),
    },
    {
      ingredient: 'parsley',
      quantity: 10,
      unit: 'g',
      optional: true,
      note: t('finely chopped', 'tocat mărunt'),
    },
    { ingredient: 'salt', quantity: 5, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
  ],
  steps: [
    {
      key: 'onion',
      text: t(
        'Heat the oil in a wide, heavy pot over medium heat. Add the onions, and the diced pepper if using, and cook for about 5 minutes, stirring, until soft and translucent but not browned.',
        'Încinge uleiul într-o oală lată, cu fundul gros, la foc mediu. Adaugă ceapa, și ardeiul gras tăiat cubulețe dacă îl folosești, și călește circa 5 minute, amestecând, până se înmoaie și devine sticloasă, fără să se rumenească.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'mushrooms',
      text: t(
        'Raise the heat to high and add the mushrooms. Cook for about 12 minutes, stirring now and then. First they release a lot of water; keep going until the pot is nearly dry and the mushrooms start to turn golden at the edges.',
        'Dă focul la maxim și adaugă ciupercile. Gătește-le circa 12 minute, amestecând din când în când. Întâi lasă multă apă; continuă până când oala e aproape uscată, iar ciupercile încep să se rumenească pe margini.',
      ),
      timerSeconds: 720,
    },
    {
      key: 'flavour',
      text: t(
        'Lower the heat to medium. Stir in the garlic, the tomato paste and the paprika, if using, and fry for about 1 minute, stirring, so they do not catch.',
        'Scade focul la mediu. Adaugă usturoiul, pasta de roșii și boiaua, dacă le folosești, și călește-le circa 1 minut, amestecând, ca să nu se prindă.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'simmer',
      text: t(
        'Pour in the water and add the bay leaves, savory, salt and pepper. Bring to the boil, then lower the heat and simmer, partly covered, for 15 minutes, until the sauce is thick and the mushrooms are tender.',
        'Toarnă apa și adaugă foile de dafin, cimbrul, sarea și piperul. Adu la fierbere, apoi scade focul și fierbe ușor, cu capacul întredeschis, 15 minute, până când sosul se îngroașă și ciupercile sunt fragede.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'finish',
      text: t(
        'Take the pot off the heat and remove the bay leaves. Stir in the dill and the parsley, if using, and taste for salt. Serve hot.',
        'Ia oala de pe foc și scoate foile de dafin. Amestecă mărarul și pătrunjelul, dacă îl folosești, și gustă de sare. Servește fierbinte.',
      ),
    },
  ],
  tips: [
    t(
      'Wipe the mushrooms with a damp cloth, or rinse them quickly and pat them dry just before cooking; do not leave them soaking, or the wet surface slows browning.',
      'Șterge ciupercile cu o cârpă umedă sau spală-le repede și zvântează-le bine chiar înainte de gătit; nu le lăsa la înmuiat, că ciupercile ude se rumenesc greu.',
    ),
    t(
      'Mushrooms only brown once their water has cooked off: add garlic or sauce while the pot is still wet and you get pale, boiled mushrooms instead of golden ones.',
      'Lasă apa din ciuperci să se evapore înainte să se rumenească: dacă pui usturoiul sau sosul cât oala e încă plină de apă, ciupercile ies palide și fierte, nu aurii.',
    ),
    t(
      'Cool leftovers within 2 hours, store them in a covered container in the fridge and eat them within 3 days. Reheat once, until steaming hot all through.',
      'Răcește rămășițele în cel mult 2 ore, păstrează-le într-un recipient acoperit la frigider și mănâncă-le în 3 zile. Reîncălzește-le o singură dată, până sunt fierbinți peste tot.',
    ),
  ],
  stepTips: [
    {
      step: 'mushrooms',
      text: t(
        'Use a wide pot and leave the mushrooms alone for the first minute or two; crowded or stirred too early, they steam instead of browning.',
        'Folosește o oală lată și lasă ciupercile în pace primul minut-două; dacă sunt îngrămădite sau amestecate prea devreme, se aburesc în loc să se rumenească.',
      ),
    },
    {
      step: 'finish',
      text: t(
        'Add the dill last, off the heat: cooked long, it loses its fresh scent, which is what makes this stew.',
        'Pune mărarul la urmă, de pe foc: fiert mult, își pierde mirosul proaspăt, iar el face tocănița.',
      ),
    },
  ],
  nutritionNote: t(
    'Mushrooms are mostly water, so a big portion is light and filling and brings some fibre. The sunflower oil is mostly unsaturated fat but still dense in energy, the stew is low in protein, and the salt adds up. Serve it with mămăligă for a full meal, or with beans or an egg for more protein.',
    'Ciupercile sunt în mare parte apă, deci o porție mare e ușoară și săturătoare și aduce niște fibre. Uleiul de floarea soarelui e în mare parte grăsime nesaturată, dar tot bogat în energie, tocănița are puține proteine, iar sarea se adună. Servește-o cu mămăligă pentru o masă completă sau cu fasole ori un ou pentru mai multe proteine.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t(
        'Mămăligă with cheese and sour cream',
        'Mămăligă cu brânză și smântână',
      ),
      reason: t(
        'Soft, plain cornmeal soaks up the thick mushroom sauce. On a fasting day make just the mămăligă, with no butter, cheese, sour cream or eggs.',
        'Mămăliga moale și neutră se îmbibă cu sosul gros de ciuperci. În zilele de post fă doar mămăliga, fără unt, brânză, smântână sau ouă.',
      ),
      principle: 'regional_tradition',
      recipe: 'mamaliga',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sourness and crunch cut through the soft, oily stew.',
        'Aciditatea și textura lor crocantă taie din bogăția tocăniței moi și unsuroase.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'food',
      label: t('Sour cream', 'Smântână'),
      reason: t(
        'On a non-fasting day, a spoonful on each plate adds a cool, tangy richness to the hot stew.',
        'În zilele de dulce, o lingură de smântână în farfurie aduce o notă rece și acrișoară peste tocănița fierbinte.',
      ),
      principle: 'complement_flavour',
      ingredient: 'sour-cream',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot, thick stew with mămăligă warms you up.',
        'O tocăniță fierbinte și groasă, cu mămăligă, te încălzește.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'A hot, heavy stew is a poor fit when it is already warm outside.',
        'O tocăniță fierbinte și grea nu prea se potrivește când afară e deja cald.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'A big bowl of oily stew sits heavy before exercise.',
        'O porție mare de tocăniță cu ulei cade greu la stomac înainte de efort.',
      ),
    },
  ],
  variants: [
    {
      slug: 'tocana-de-ciuperci-hungarian',
      cuisine: 'hungarian',
      title: t(
        'Gombapaprikás (Hungarian mushroom paprikash)',
        'Gombapaprikás (papricaș de ciuperci, ca în Ungaria)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 40,
      difficulty: 'easy',
      hideBaseTips: [1],
      lines: [
        {
          ingredient: 'button-mushrooms',
          quantity: 700,
          unit: 'g',
          note: t('wiped clean, sliced', 'șterse, tăiate felii'),
        },
        { ingredient: 'sunflower-oil', quantity: 45, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('finely chopped', 'tăiate mărunt'),
        },
        {
          ingredient: 'bell-pepper',
          quantity: 1,
          unit: 'pcs',
          optional: true,
          note: t('green, diced', 'verde, tăiat cubulețe'),
        },
        {
          ingredient: 'tomato',
          quantity: 100,
          unit: 'g',
          optional: true,
          note: t('diced', 'tăiată cubulețe'),
        },
        { ingredient: 'paprika', quantity: 10, unit: 'g' },
        { ingredient: 'flour', quantity: 15, unit: 'g' },
        { ingredient: 'sour-cream', quantity: 200, unit: 'g' },
        { ingredient: 'still-water', quantity: 0.1, unit: 'l' },
        {
          ingredient: 'parsley',
          quantity: 15,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        { ingredient: 'salt', quantity: 5, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'onion',
          text: t(
            'Heat the oil in a wide pot over medium-low heat. Add the onions, with the diced pepper and tomato if using, and cook for about 8 minutes, stirring, until soft and pale gold. Do not let them brown.',
            'Încinge uleiul într-o oală lată la foc mic-mediu. Adaugă ceapa, cu ardeiul și roșia tăiate cubulețe dacă le folosești, și călește circa 8 minute, amestecând, până se înmoaie și capătă o culoare aurie, pală. Nu o lăsa să se rumenească.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'mushrooms',
          text: t(
            'Raise the heat to medium-high, add the mushrooms and the salt, and cook for about 10 minutes, stirring now and then, until they have released their juice.',
            'Mărește focul la mediu-mare, adaugă ciupercile și sarea și gătește circa 10 minute, amestecând din când în când, până lasă zeama.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'reduce',
          text: t(
            'Keep cooking for about 5 more minutes, until the juice has reduced by about half and the mushrooms are soft.',
            'Mai gătește circa 5 minute, până când zeama scade la jumătate și ciupercile sunt moi.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'paprika',
          text: t(
            'Take the pot off the heat and stir in the paprika and the pepper. Pour in the water, return to medium-low heat and simmer for 5 minutes. Paprika scorches fast in dry hot fat, which makes it bitter.',
            'Ia oala de pe foc și amestecă boiaua și piperul. Toarnă apa, pune oala înapoi la foc mic-mediu și fierbe ușor 5 minute. Boiaua se arde repede în grăsime fierbinte și uscată și devine amară.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'cream',
          text: t(
            'In a bowl, whisk the sour cream with the flour until smooth. Whisk in 4 tablespoons of the hot liquid from the pot, one spoon at a time, so the cream warms up gradually.',
            'Într-un bol, bate smântâna cu făina până se omogenizează. Adaugă 4 linguri din lichidul fierbinte din oală, câte una, bătând, ca smântâna să se încălzească treptat.',
          ),
        },
        {
          key: 'thicken',
          text: t(
            'Stir the warmed cream into the pot over low heat. Cook for 3 minutes, stirring, at a gentle bubble and never a hard boil, until the sauce is thick and creamy.',
            'Amestecă smântâna încălzită în oală, la foc mic. Gătește 3 minute, amestecând, la un clocot ușor, niciodată la fiert puternic, până când sosul se îngroașă și devine cremos.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'finish',
          text: t(
            'Stir in the parsley, taste for salt and serve hot.',
            'Adaugă pătrunjelul, gustă de sare și servește fierbinte.',
          ),
        },
      ],
      tips: [
        t(
          'Sour cream added cold to a hot sauce splits into grainy curds. Mixing it with flour, tempering it with hot liquid and keeping the sauce at a gentle bubble stops that; use full-fat cream, because low-fat sour cream splits more easily.',
          'Smântâna pusă rece într-un sos fierbinte se taie și face cocoloașe. Amestecată cu făină, încălzită treptat cu lichid fierbinte și ținută la un clocot ușor nu se mai taie; folosește smântână grasă, pentru că cea slabă se taie mai ușor.',
        ),
      ],
      stepTips: [
        {
          step: 'thicken',
          text: t(
            'Keep the sauce at a gentle bubble and never a hard boil; that is what stops the sour cream from splitting.',
            'Ține sosul la un clocot ușor, niciodată la fiert puternic; așa nu se taie smântâna.',
          ),
        },
      ],
      nutritionNote: t(
        'Light, filling mushrooms with some fibre; the sour cream and the oil bring saturated and total fat, so use the cream sparingly if you watch it. Low in protein, and the salt adds up. Nokedli (dumplings) or bread make it a full meal but add refined carbohydrate.',
        'Ciuperci ușoare și săturătoare, cu niște fibre; smântâna și uleiul aduc grăsimi, inclusiv saturate, așa că pune smântână cu măsură dacă ai grijă la grăsimi. Are puține proteine, iar sarea se adună. Găluștele sau pâinea fac din el o masă completă, dar adaugă carbohidrați rafinați.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Hungarian dumplings (nokedli)', 'Găluște (nokedli)'),
          reason: t(
            'Soft little dumplings catch the paprika cream sauce, as with other paprikás dishes.',
            'Găluștele moi prind sosul cremos cu boia, ca la orice papricaș.',
          ),
          principle: 'regional_tradition',
          ingredient: 'galuste',
        },
        {
          kind: 'food',
          label: t('Pickled cucumbers', 'Castraveți murați'),
          reason: t(
            'Their sourness cuts through the creamy sauce.',
            'Aciditatea lor taie din bogăția sosului cremos.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-cucumbers',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A warm, creamy paprika stew suits a cold day.',
            'O tocăniță caldă, cremoasă, cu boia, se potrivește într-o zi rece.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Cream and dumplings sit heavy late at night.',
            'Smântâna și găluștele cad greu seara târziu.',
          ),
        },
      ],
    },
    {
      slug: 'tocana-de-ciuperci-italian',
      cuisine: 'italian',
      title: t(
        'Funghi trifolati (Italian mushrooms sautéed with garlic and parsley)',
        'Funghi trifolati (ciuperci sotate cu usturoi și pătrunjel, ca în Italia)',
      ),
      servings: 4,
      prepMinutes: 10,
      cookMinutes: 25,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'button-mushrooms',
          quantity: 600,
          unit: 'g',
          note: t(
            'wiped clean, sliced 5 mm thick',
            'șterse, tăiate felii de 5 mm',
          ),
        },
        { ingredient: 'olive-oil', quantity: 45, unit: 'ml' },
        {
          ingredient: 'garlic',
          quantity: 12,
          unit: 'g',
          note: t(
            'about 3 cloves, lightly crushed',
            'circa 3 căței, zdrobiți ușor',
          ),
        },
        { ingredient: 'white-wine', quantity: 50, unit: 'ml', optional: true },
        {
          ingredient: 'chilli-flakes',
          quantity: 0.5,
          unit: 'g',
          optional: true,
        },
        {
          ingredient: 'parsley',
          quantity: 20,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        { ingredient: 'salt', quantity: 3, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 0.5, unit: 'g' },
      ],
      steps: [
        {
          key: 'batch-one',
          text: t(
            'Heat half of the oil in a large, wide pan over high heat for 1 minute. Add half of the mushrooms in a single layer and leave them for 2 minutes without stirring. Then stir and cook for about 6 minutes more, until the water has gone and they are golden. Tip them onto a plate.',
            'Încinge jumătate din ulei într-o tigaie mare și lată, la foc mare, 1 minut. Adaugă jumătate din ciuperci într-un singur strat și lasă-le 2 minute fără să le amesteci. Apoi amestecă și gătește încă circa 6 minute, până se evaporă apa și ciupercile se rumenesc. Pune-le pe o farfurie.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'batch-two',
          text: t(
            'Add the rest of the oil and the remaining mushrooms and cook them the same way, about 8 minutes, until golden and dry.',
            'Adaugă restul de ulei și ciupercile rămase și gătește-le la fel, circa 8 minute, până sunt aurii și fără apă.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'garlic',
          text: t(
            'Return the first batch to the pan. Lower the heat to medium, add the garlic and the chilli flakes, if using, and cook for 1 minute, stirring, until the garlic smells sweet and is just golden.',
            'Pune la loc în tigaie primele ciuperci. Scade focul la mediu, adaugă usturoiul și fulgii de chili, dacă îi folosești, și gătește 1 minut, amestecând, până usturoiul miroase dulce și se aurește ușor.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'wine',
          text: t(
            'If using wine, pour it in and cook for about 1 minute, until it has almost evaporated.',
            'Dacă folosești vin, toarnă-l și gătește circa 1 minut, până se evaporă aproape complet.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'finish',
          text: t(
            'Take the pan off the heat. Season with the salt and pepper, toss in the parsley and serve straight away, hot or warm.',
            'Ia tigaia de pe foc. Condimentează cu sare și piper, amestecă pătrunjelul și servește-le imediat, fierbinți sau calde.',
          ),
        },
      ],
      tips: [
        t(
          'Other mushrooms work too: porcini (hribi), oyster, chestnut or a mix. Cook the firm ones first and the delicate ones last.',
          'Merg și alte ciuperci: hribi, pleurotus, ciuperci brune sau un amestec. Gătește întâi pe cele ferme și la urmă pe cele fragede.',
        ),
      ],
      stepTips: [
        {
          step: 'garlic',
          text: t(
            'Garlic goes in late here because the mushrooms brown over high heat; in the pan the whole time it would turn dark and bitter by the end.',
            'Usturoiul intră târziu aici pentru că ciupercile se rumenesc la foc mare; ținut în tigaie tot timpul, ar ajunge închis la culoare și amar.',
          ),
        },
      ],
      nutritionNote: t(
        'A light side: mushrooms are mostly water and give a little fibre, and olive oil is mostly unsaturated fat. It is still energy-dense for its size, it has little protein, and the salt and any bread alongside add up.',
        'Un acompaniament ușor: ciupercile sunt în mare parte apă și dau puține fibre, iar uleiul de măsline e în mare parte grăsime nesaturată. Rămâne totuși bogat în energie raportat la volum, are puține proteine, iar sarea și pâinea de lângă se adună.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Toasted bread', 'Pâine prăjită'),
          reason: t(
            'Spoon the mushrooms and their garlicky oil onto crisp slices for a quick antipasto.',
            'Pune ciupercile cu uleiul lor cu usturoi pe felii crocante pentru un antipasto rapid.',
          ),
          principle: 'contrast_texture',
          ingredient: 'bread',
        },
        {
          kind: 'food',
          label: t('Soft polenta', 'Polenta moale și cremoasă'),
          reason: t(
            'Soft, creamy polenta makes a mild base for the garlicky mushrooms.',
            'Polenta moale și cremoasă face un pat blând pentru ciupercile cu usturoi.',
          ),
          principle: 'complement_flavour',
          ingredient: 'cornmeal',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Quick to make and light, especially on toasted bread.',
            'Se face repede și e ușor, mai ales pe pâine prăjită.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'good_for',
          reason: t(
            'A small portion is light enough for the evening.',
            'O porție mică e destul de ușoară pentru seară.',
          ),
        },
      ],
    },
    {
      slug: 'tocana-de-ciuperci-indian',
      cuisine: 'indian',
      title: t(
        'Mushroom masala (Indian mushroom curry)',
        'Mushroom masala (curry indian de ciuperci)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 40,
      difficulty: 'easy',
      hideBaseTips: [1],
      lines: [
        {
          ingredient: 'button-mushrooms',
          quantity: 500,
          unit: 'g',
          note: t('wiped clean, halved', 'șterse, tăiate în jumătăți'),
        },
        { ingredient: 'sunflower-oil', quantity: 45, unit: 'ml' },
        { ingredient: 'cumin-seeds', quantity: 2, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('finely chopped', 'tăiate mărunt'),
        },
        {
          ingredient: 'ginger',
          quantity: 15,
          unit: 'g',
          note: t('peeled, grated', 'curățat, ras'),
        },
        {
          ingredient: 'garlic',
          quantity: 12,
          unit: 'g',
          note: t('about 3 cloves, minced', 'circa 3 căței, tocați'),
        },
        {
          ingredient: 'hot-pepper',
          quantity: 1,
          unit: 'pcs',
          note: t('green, slit lengthways', 'verde, tăiat pe lungime'),
        },
        {
          ingredient: 'tomato',
          quantity: 400,
          unit: 'g',
          note: t('finely chopped', 'tocate mărunt'),
        },
        { ingredient: 'turmeric', quantity: 1.5, unit: 'g' },
        { ingredient: 'chili-powder', quantity: 2, unit: 'g' },
        { ingredient: 'ground-coriander', quantity: 4, unit: 'g' },
        { ingredient: 'salt', quantity: 5, unit: 'g' },
        { ingredient: 'still-water', quantity: 0.15, unit: 'l' },
        { ingredient: 'garam-masala', quantity: 2, unit: 'g' },
        {
          ingredient: 'dried-fenugreek-leaves',
          quantity: 1,
          unit: 'g',
          optional: true,
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
          key: 'cumin',
          text: t(
            'Heat the oil in a wide pan over medium heat. Add the cumin seeds and let them sizzle for about 30 seconds, until they darken a shade and smell toasty.',
            'Încinge uleiul într-o tigaie lată la foc mediu. Adaugă semințele de chimion și lasă-le să sfârâie circa 30 de secunde, până se închid puțin la culoare și miros a prăjit.',
          ),
          timerSeconds: 30,
        },
        {
          key: 'onion',
          text: t(
            'Add the onions and cook for about 10 minutes, stirring, until deep golden brown.',
            'Adaugă ceapa și călește-o circa 10 minute, amestecând, până capătă o culoare aurie închisă.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'aromatics',
          text: t(
            'Stir in the ginger, garlic and green chilli and cook for 1 minute, until the raw smell is gone.',
            'Adaugă ghimbirul, usturoiul și ardeiul iute verde și gătește 1 minut, până dispare mirosul de crud.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'masala',
          text: t(
            'Add the tomatoes, turmeric, chilli powder, ground coriander and salt. Cook for about 10 minutes, mashing the tomatoes with the spoon, until the masala is thick and the oil separates at the edges.',
            'Adaugă roșiile, turmericul, ardeiul iute măcinat, coriandrul măcinat și sarea. Gătește circa 10 minute, strivind roșiile cu lingura, până când masala se îngroașă, iar uleiul se separă pe margini.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'mushrooms',
          text: t(
            'Add the mushrooms and stir to coat them. Cook for about 5 minutes, until they have started to release their juice.',
            'Adaugă ciupercile și amestecă să se îmbrace în masala. Gătește circa 5 minute, până încep să lase zeama.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'simmer',
          text: t(
            'Pour in the water, cover and simmer over low heat for 10 minutes, until the mushrooms are tender and the sauce clings to them.',
            'Toarnă apa, acoperă și fierbe ușor, la foc mic, 10 minute, până când ciupercile sunt fragede, iar sosul se prinde de ele.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'finish',
          text: t(
            'Stir in the garam masala. Crush the fenugreek leaves between your palms over the pan, if using. Cook for 1 minute, then take off the heat and stir in the coriander.',
            'Amestecă garam masala. Mărunțește frunzele de schinduf între palme deasupra tigăii, dacă le folosești. Gătește 1 minut, apoi ia tigaia de pe foc și amestecă coriandrul.',
          ),
          timerSeconds: 60,
        },
      ],
      tips: [
        t(
          'If the masala sticks while the tomatoes cook down, add a splash of water and scrape the bottom; the powdered spices burn easily and turn bitter.',
          'Dacă masala se prinde cât se reduc roșiile, adaugă un strop de apă și răzuiește fundul; condimentele măcinate se ard ușor și devin amare.',
        ),
      ],
      nutritionNote: t(
        'Mushrooms, tomatoes and onions give a lot of volume and some fibre for little energy; the oil is mostly unsaturated fat but still adds energy. Protein is low, so serve it with rice or flatbread and a side of lentils or yogurt. The salt adds up.',
        'Ciupercile, roșiile și ceapa dau volum și puține fibre pentru puțină energie; uleiul e în mare parte grăsime nesaturată, dar tot adaugă energie. Proteinele sunt puține, așa că servește-l cu orez sau lipie și o garnitură de linte sau iaurt. Sarea se adună.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Basmati rice', 'Orez basmati'),
          reason: t(
            'Fluffy rice soaks up the thick, spiced masala.',
            'Orezul pufos absoarbe masala groasă și condimentată.',
          ),
          principle: 'complement_flavour',
          ingredient: 'basmati-rice',
        },
        {
          kind: 'food',
          label: t('Naan', 'Naan'),
          reason: t(
            'Soft flatbread for scooping up the sauce.',
            'O lipie moale cu care aduni sosul.',
          ),
          principle: 'complement_flavour',
          ingredient: 'naan',
        },
        {
          kind: 'food',
          label: t('Yogurt', 'Iaurt'),
          reason: t(
            'Cool, tangy yogurt calms the chilli heat.',
            'Iaurtul rece și acrișor domolește iuțeala.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'yogurt',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A warm, spiced curry is comforting when it is cold.',
            'Un curry cald, condimentat, e reconfortant când e frig.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Spices, oil and fibre can sit heavy before exercise.',
            'Condimentele, uleiul și fibrele pot cădea greu înainte de efort.',
          ),
        },
      ],
    },
  ],
};
