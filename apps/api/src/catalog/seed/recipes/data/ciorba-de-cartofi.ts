import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Ciorbă de cartofi base is the Romanian potato soup soured with borș: smoked
// pork (afumătură) simmered for the stock, a softened vegetable base, plenty of
// potato, and fresh lovage at the end. Each Variant is a full Recipe with its own
// lines, steps and guidance. The base's Recipe-level Tips are about borș, the
// salty smoked pork and crushing potato cubes, so both Variants hide the first two
// and keep the leftovers Tip.
export const ciorbaDeCartofi: BaseRecipeSeed = {
  slug: 'ciorba-de-cartofi',
  title: t(
    'Romanian potato sour soup with smoked pork (ciorbă de cartofi)',
    'Ciorbă de cartofi cu afumătură',
  ),
  servings: 6,
  prepMinutes: 20,
  cookMinutes: 115,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'smoked-pork',
      quantity: 700,
      unit: 'g',
      note: t(
        'ribs, or a hock (ciolan) on the bone',
        'coaste sau ciolan cu os',
      ),
    },
    { ingredient: 'still-water', quantity: 2.5, unit: 'l' },
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
    { ingredient: 'sunflower-oil', quantity: 50, unit: 'ml' },
    { ingredient: 'tomato-paste', quantity: 30, unit: 'g' },
    {
      ingredient: 'potato',
      quantity: 0.8,
      unit: 'kg',
      note: t('peeled, in 1.5 cm cubes', 'curățați, tăiați cubulețe de 1,5 cm'),
    },
    {
      ingredient: 'ciorba-sour-base',
      quantity: 600,
      unit: 'ml',
      note: t(
        'borș: 400 ml first, up to 200 ml more, to taste',
        'borș: întâi 400 ml, apoi până la 200 ml în plus, după gust',
      ),
    },
    {
      ingredient: 'lovage',
      quantity: 20,
      unit: 'g',
      note: t('chopped', 'tocat'),
    },
    {
      ingredient: 'parsley',
      quantity: 15,
      unit: 'g',
      note: t('chopped', 'tocat'),
    },
    { ingredient: 'salt' },
    { ingredient: 'black-pepper' },
    {
      ingredient: 'sour-cream',
      quantity: 150,
      unit: 'g',
      optional: true,
      note: t('to serve', 'la servit'),
    },
    {
      ingredient: 'hot-pepper',
      quantity: 1,
      unit: 'pcs',
      optional: true,
      note: t('fresh, to serve', 'proaspăt, la servit'),
    },
  ],
  steps: [
    {
      key: 'boil-meat',
      text: t(
        'Rinse the smoked pork and put it in a 5 l pot with 2.5 l of cold water. Bring to the boil over high heat, then skim off the grey foam that rises. Wash your hands after handling the raw pork.',
        'Spală afumătura și pune-o într-o oală de 5 l cu 2,5 l de apă rece. Adu la fierbere la foc mare, apoi ia spuma cenușie care iese la suprafață. Spală-ți mâinile după ce ai atins carnea crudă.',
      ),
    },
    {
      key: 'simmer-meat',
      text: t(
        'Lower the heat and simmer gently, partly covered, for about 1 hour for ribs (1.5 to 2 hours for a hock), until the meat is tender and comes easily off the bone. Cured pork stays pink, so go by tenderness: it is cooked through when a fork slides in with no resistance.',
        'Dă focul mai mic și fierbe încet, cu capacul pe jumătate, aproximativ 1 oră pentru coaste (1,5-2 ore pentru ciolan), până când carnea e fragedă și se desprinde ușor de pe os. Carnea afumată rămâne roz, așa că te iei după fragezime: e gătită complet când furculița intră fără rezistență.',
      ),
      timerSeconds: 3600,
    },
    {
      key: 'dice',
      text: t(
        'While the meat simmers, dice the onions, carrot, parsley root and pepper. Peel the potatoes, cut them into 1.5 cm cubes and keep them in a bowl of cold water.',
        'Cât fierbe carnea, taie ceapa, morcovul, rădăcina de pătrunjel și ardeiul cubulețe. Curăță cartofii, taie-i cubulețe de 1,5 cm și ține-i într-un bol cu apă rece.',
      ),
    },
    {
      key: 'soften',
      text: t(
        'While the meat finishes simmering, heat the oil in a wide pan over medium-low heat. Cook the onions, carrot, parsley root and pepper for about 10 minutes, stirring, until soft and glossy but not browned.',
        'Cât se mai fierbe carnea, încălzește uleiul într-o tigaie largă la foc mic-mediu. Călește ceapa, morcovul, rădăcina de pătrunjel și ardeiul aproximativ 10 minute, amestecând, până se înmoaie și devin lucioase, fără să se rumenească.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'paste',
      text: t(
        'Stir in the tomato paste and cook for 1 minute, until it darkens a little and smells sweet.',
        'Adaugă pasta de roșii și amestecă 1 minut, până se închide puțin la culoare și miroase dulceag.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'lift-meat',
      text: t(
        'Lift the smoked pork onto a board. Cut the meat off the bone into bite-size pieces and throw the bones away.',
        'Scoate afumătura pe un tocător. Taie carnea de pe os în bucăți mici și aruncă oasele.',
      ),
    },
    {
      key: 'potatoes',
      text: t(
        'Tip the softened vegetables into the stock, drain the potatoes and add them. Bring back to a gentle boil and simmer for about 20 minutes, until the potato cubes are tender when pierced with a knife.',
        'Pune legumele călite în zeama de la carne, scurge cartofii și adaugă-i. Adu din nou la fierbere ușoară și lasă să fiarbă aproximativ 20 de minute, până când cartofii sunt fragezi la înțepat cu cuțitul.',
      ),
      timerSeconds: 1200,
    },
    {
      key: 'bors',
      text: t(
        'While the potatoes simmer, bring the borș to the boil in a small pan, skim off the foam and boil for 2 minutes. Keep it hot.',
        'Cât fierb cartofii, fierbe borșul într-o cratiță mică, ia spuma și lasă-l la fiert 2 minute. Ține-l fierbinte.',
      ),
    },
    {
      key: 'meat-back',
      text: t(
        'Once the potatoes are tender, return the meat to the pot and pour in 400 ml of the hot borș. Simmer for 5 minutes. Taste: add more borș, up to 200 ml, until the soup is pleasantly sour.',
        'Când cartofii sunt fragezi, pune carnea înapoi în oală și toarnă 400 ml din borșul fierbinte. Fierbe 5 minute. Gustă: adaugă borș în plus, până la 200 ml, până când ciorba are aciditatea potrivită.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'finish',
      text: t(
        'Take the pot off the heat. Stir in the chopped lovage and parsley. Season with pepper and add salt last, only if the soup needs it.',
        'Ia oala de pe foc. Adaugă leușteanul și pătrunjelul tocate. Pune piper și sare la final, doar dacă ciorba mai are nevoie.',
      ),
    },
    {
      key: 'serve',
      text: t(
        'Ladle into bowls. Serve with sour cream and a fresh hot pepper on the side, if you like.',
        'Pune ciorba în boluri. Servește cu smântână și un ardei iute proaspăt alături, dacă vrei.',
      ),
    },
  ],
  tips: [
    t(
      'Borș differs a lot between brands and homemade batches, so add it in two goes and taste in between: you can always add more, but you cannot take it out.',
      'Borșul diferă mult de la un producător la altul și de la o șarjă făcută în casă la alta, așa că pune-l în două rânduri și gustă între ele: poți adăuga oricând, dar nu poți scoate.',
    ),
    t(
      'For a slightly thicker soup, crush a few potato cubes against the side of the pot with the back of a spoon.',
      'Pentru o ciorbă puțin mai groasă, strivește câteva cubulețe de cartof de peretele oalei cu dosul lingurii.',
    ),
    t(
      'Leftovers: cool the soup within 2 hours, in shallow containers if you can, and keep it in the fridge for up to 3 days. Reheat until it is boiling hot all the way through.',
      'Resturi: răcește ciorba în cel mult 2 ore, de preferat în recipiente joase, și ține-o la frigider până la 3 zile. Încălzește-o până fierbe bine, în toată oala.',
    ),
  ],
  stepTips: [
    {
      step: 'simmer-meat',
      text: t(
        'Do not salt the water: smoked pork gives up salt as it cooks, and the soup is only seasoned at the end.',
        'Nu săra apa: afumătura lasă sare în timpul fierberii, iar ciorba se sărează abia la final.',
      ),
    },
    {
      step: 'bors',
      text: t(
        'Boiling the borș separately lets you skim off its foam, so the soup stays clear, and adding it hot keeps the pot simmering.',
        'Dacă fierbi borșul separat poți lua spuma, ca ciorba să rămână limpede, iar dacă îl torni fierbinte oala nu se oprește din fiert.',
      ),
    },
  ],
  nutritionNote: t(
    'Potatoes and vegetables make it a filling bowl of carbohydrates with some fibre. Smoked pork brings a lot of salt (and some brands of borș add more) as well as some saturated fat, so skim the fat, taste before salting and go easy on the sour cream. The sunflower oil is mostly unsaturated.',
    'Cartofii și legumele fac din ea un castron sățios, bogat în carbohidrați, cu ceva fibre. Afumătura aduce multă sare (iar unele borșuri din comerț mai adaugă) și ceva grăsimi saturate, așa că ia grăsimea de la suprafață, gustă înainte să sărezi și pune smântână cu măsură. Uleiul de floarea-soarelui e în mare parte nesaturat.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Fresh bread', 'Pâine proaspătă'),
      reason: t(
        'Soft bread soaks up the sour, smoky broth.',
        'Pâinea moale se înmoaie în zeama acrișoară, afumată, și o adună.',
      ),
      principle: 'complement_flavour',
      ingredient: 'bread',
    },
    {
      kind: 'food',
      label: t('Pickled green tomatoes', 'Gogonele murate'),
      reason: t(
        'Their sharp brine cuts the smoky fat of the pork between spoonfuls.',
        'Zeama lor acră taie grăsimea afumată a cărnii între linguri.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-green-tomatoes',
    },
    {
      kind: 'drink',
      label: t('Cold beer', 'Bere rece'),
      reason: t(
        'Its light bitterness and bubbles refresh the palate after smoked, salty meat.',
        'Amăreala ușoară și bulele o fac să curețe gustul după carnea afumată și sărată.',
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
        'A hot, sour, smoky soup warms you through.',
        'O ciorbă fierbinte, acrișoară și afumată te încălzește.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'The salt and smoked pork sit heavy when eaten right before bed.',
        'Sarea și afumătura cad greu dacă le mănânci chiar înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'ciorba-de-cartofi-german',
      cuisine: 'german',
      title: t(
        'Kartoffelsuppe (German potato soup with marjoram and Wiener sausages)',
        'Kartoffelsuppe (supă germană de cartofi cu maghiran și crenvurști)',
      ),
      servings: 6,
      prepMinutes: 20,
      cookMinutes: 50,
      difficulty: 'easy',
      hideBaseTips: [0, 1],
      lines: [
        {
          ingredient: 'bacon',
          quantity: 100,
          unit: 'g',
          optional: true,
          note: t(
            'Speck or streaky, diced',
            'Speck sau costiță, tăiată cubulețe',
          ),
        },
        { ingredient: 'butter', quantity: 30, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('diced', 'tăiată cubulețe'),
        },
        {
          ingredient: 'leek',
          quantity: 150,
          unit: 'g',
          note: t(
            'white and pale green, sliced and rinsed',
            'partea albă și verde-deschis, tăiat rondele și spălat',
          ),
        },
        {
          ingredient: 'carrot',
          quantity: 150,
          unit: 'g',
          note: t('diced', 'tăiați cubulețe'),
        },
        {
          ingredient: 'celeriac',
          quantity: 150,
          unit: 'g',
          note: t('diced', 'tăiată cubulețe'),
        },
        {
          ingredient: 'potato',
          quantity: 0.8,
          unit: 'kg',
          note: t(
            'peeled, in 1.5 cm cubes',
            'curățați, tăiați cubulețe de 1,5 cm',
          ),
        },
        {
          ingredient: 'vegetable-stock',
          quantity: 1200,
          unit: 'ml',
          note: t(
            'hot, made up as the pack says',
            'fierbinte, preparată după instrucțiunile de pe ambalaj',
          ),
        },
        {
          ingredient: 'bay-leaves',
          quantity: 0.4,
          unit: 'g',
          note: t('2 leaves', '2 foi'),
        },
        { ingredient: 'marjoram', quantity: 2, unit: 'g' },
        { ingredient: 'nutmeg', quantity: 0.5, unit: 'g' },
        {
          ingredient: 'frankfurters',
          quantity: 300,
          unit: 'g',
          note: t('sliced 1 cm thick', 'tăiați felii de 1 cm'),
        },
        {
          ingredient: 'parsley',
          quantity: 15,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        { ingredient: 'salt' },
        { ingredient: 'black-pepper' },
      ],
      steps: [
        {
          key: 'dice',
          text: t(
            'Dice the onion, carrot and celeriac, slice and rinse the leek, and cut the potatoes into 1.5 cm cubes.',
            'Taie ceapa, morcovul și țelina cubulețe, taie prazul rondele și spală-l, iar cartofii taie-i cubulețe de 1,5 cm.',
          ),
        },
        {
          key: 'bacon',
          text: t(
            'Melt the butter in a 4 l pot over medium heat. If using bacon, add it and cook for about 5 minutes, until golden at the edges and the fat has run. Wash your hands after handling the raw bacon.',
            'Topește untul într-o oală de 4 l la foc mediu. Dacă folosești costiță, adaugă-o și gătește-o aproximativ 5 minute, până se rumenește pe margini și își lasă grăsimea. Spală-ți mâinile după ce ai atins costița crudă.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'soften',
          text: t(
            'Add the onion, leek, carrot and celeriac. Cook over medium-low heat for about 8 minutes, stirring, until soft but not browned.',
            'Adaugă ceapa, prazul, morcovul și țelina. Călește la foc mic-mediu aproximativ 8 minute, amestecând, până se înmoaie, fără să se rumenească.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'simmer',
          text: t(
            'Add the potatoes, hot stock, bay leaves and marjoram. Bring to the boil, then simmer gently for about 20 minutes, until the potatoes fall apart when pressed with a spoon.',
            'Adaugă cartofii, supa fierbinte, foile de dafin și maghiranul. Adu la fierbere, apoi fierbe încet aproximativ 20 de minute, până când cartofii se desfac la apăsarea cu lingura.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'body',
          text: t(
            'Fish out the bay leaves. Pulse a stick blender in the pot a few times, or mash with a potato masher, until about half of the soup is smooth and the rest still has pieces.',
            'Scoate foile de dafin. Dă câteva pulsuri cu blenderul vertical direct în oală sau pasează cu pasatorul de cartofi, până când jumătate din supă e cremoasă, iar restul a rămas cu bucăți.',
          ),
        },
        {
          key: 'season',
          text: t(
            'Season with the nutmeg and pepper. Taste before adding any salt: the bacon, stock and sausages are all salty.',
            'Condimentează cu nucșoară și piper. Gustă înainte să adaugi sare: costița, supa și crenvurștii sunt toate sărate.',
          ),
        },
        {
          key: 'sausages',
          text: t(
            'Add the sliced sausages and simmer for about 5 minutes, until they are steaming hot all the way through. Stir in the chopped parsley and serve.',
            'Adaugă crenvurștii tăiați felii și fierbe aproximativ 5 minute, până sunt fierbinți în toată grosimea. Adaugă pătrunjelul tocat și servește.',
          ),
          timerSeconds: 300,
        },
      ],
      tips: [
        t(
          'The soup keeps thickening as it cools: loosen it with a splash of hot water or stock when you reheat it.',
          'Supa se îngroașă tot mai mult pe măsură ce se răcește: dacă o încălzești a doua zi, subțiază-o cu puțină apă sau supă fierbinte.',
        ),
      ],
      stepTips: [
        {
          step: 'simmer',
          text: t(
            'Rub the marjoram between your fingers as it goes in: it wakes the flavour, and it needs the simmer to blend into the broth.',
            'Mărunțește maghiranul între degete când îl pui în oală: își eliberează aroma, iar fierberea îl amestecă în supă.',
          ),
        },
      ],
      nutritionNote: t(
        'Potatoes and root vegetables make it filling, and blending half gives body without cream. Bacon, sausages and butter bring saturated fat, and bacon, sausages and stock bring salt, so use a little less bacon or skip it, and taste before salting.',
        'Cartofii și legumele rădăcinoase o fac sățioasă, iar pasarea unei jumătăți dă corp supei fără smântână. Costița, crenvurștii și untul aduc grăsimi saturate, iar costița, crenvurștii și supa aduc sare, așa că pune mai puțină costiță sau lasă-o deoparte și gustă înainte să sărezi.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Dark rye bread', 'Pâine neagră de secară'),
          reason: t(
            'Its dense, slightly sour crumb stands up to a thick soup.',
            'Miezul ei des și ușor acrișor ține piept unei supe groase.',
          ),
          principle: 'complement_flavour',
          ingredient: 'rye-bread',
        },
        {
          kind: 'drink',
          label: t('Light lager', 'Bere blondă'),
          reason: t(
            'Its bitterness and bubbles cut through the bacon and sausage fat.',
            'Amăreala și bulele taie grăsimea de la costiță și crenvurști.',
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
            'A thick, warm bowl is good when it is cold outside.',
            'Un castron gros și cald prinde bine când afară e frig.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'avoid',
          reason: t(
            'With sausages and bacon it is heavy for a light lunch.',
            'Cu crenvurști și costiță e prea grea pentru un prânz ușor.',
          ),
        },
      ],
    },
    {
      slug: 'ciorba-de-cartofi-portuguese',
      cuisine: 'portuguese',
      title: t(
        'Caldo verde (Portuguese potato and couve galega soup with chouriço)',
        'Caldo verde (supă portugheză de cartofi cu varză couve galega și chouriço)',
      ),
      servings: 6,
      prepMinutes: 20,
      cookMinutes: 45,
      difficulty: 'easy',
      hideBaseTips: [0, 1],
      lines: [
        {
          ingredient: 'olive-oil',
          quantity: 60,
          unit: 'ml',
          note: t(
            '30 ml to soften the onion, 30 ml to finish',
            '30 ml pentru călit ceapa, 30 ml la servit',
          ),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('large, finely diced', 'mare, tăiată mărunt'),
        },
        {
          ingredient: 'garlic',
          quantity: 12,
          unit: 'g',
          note: t(
            'about 3 cloves, sliced',
            'aproximativ 3 căței, tăiați felii',
          ),
        },
        {
          ingredient: 'potato',
          quantity: 0.8,
          unit: 'kg',
          note: t(
            'floury, peeled, sliced about 1 cm thick',
            'făinoși, curățați, tăiați felii de aproximativ 1 cm',
          ),
        },
        { ingredient: 'still-water', quantity: 1.5, unit: 'l' },
        {
          ingredient: 'couve-galega',
          quantity: 200,
          unit: 'g',
          note: t(
            'stalks removed, cut into hair-thin ribbons',
            'fără cotor, tăiată în fâșii cât firul de păr',
          ),
        },
        {
          ingredient: 'chourico',
          quantity: 150,
          unit: 'g',
          note: t('sliced 5 mm thick', 'tăiat felii de 5 mm'),
        },
        { ingredient: 'salt', quantity: 8, unit: 'g' },
      ],
      steps: [
        {
          key: 'prep',
          text: t(
            'Peel the potatoes and slice them about 1 cm thick so they cook evenly. Dice the onion and slice the garlic.',
            'Curăță cartofii și taie-i felii de aproximativ 1 cm, ca să se fiarbă uniform. Taie ceapa mărunt și usturoiul felii.',
          ),
        },
        {
          key: 'soften',
          text: t(
            'Warm 30 ml of the olive oil in a 4 l pot over medium-low heat. Cook the onion for about 5 minutes, until soft and translucent but not browned.',
            'Încălzește 30 ml din uleiul de măsline într-o oală de 4 l la foc mic-mediu. Călește ceapa aproximativ 5 minute, până se înmoaie și devine translucidă, fără să se rumenească.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'garlic',
          text: t(
            'Add the garlic and cook for 1 minute, until it smells good, without letting it brown.',
            'Adaugă usturoiul și lasă-l 1 minut, până miroase frumos, fără să se rumenească.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'simmer',
          text: t(
            'Add the potatoes, the water and 5 g of the salt. Bring to the boil, then simmer gently for about 20 minutes, until the potatoes are completely soft and fall apart when pressed.',
            'Adaugă cartofii, apa și 5 g din sare. Adu la fierbere, apoi fierbe încet aproximativ 20 de minute, până când cartofii sunt complet fragezi și se desfac la apăsare.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'greens',
          text: t(
            'While the potatoes simmer, wash the couve and cut out the thick midribs. Stack a few leaves, roll them up tightly like a cigar and slice across as thinly as you can, into ribbons about 1 to 2 mm wide.',
            'Cât fierb cartofii, spală varza și taie nervurile groase din mijloc. Așază câteva frunze una peste alta, rulează-le strâns ca pe o țigară de foi și taie-le în fâșii cât mai subțiri, de 1-2 mm.',
          ),
        },
        {
          key: 'chourico',
          text: t(
            'Also while the potatoes simmer, fry the chouriço slices in a dry pan over medium heat for about 3 minutes, turning once, until the edges are browned and the fat runs. Keep them warm on a plate.',
            'Tot cât fierb cartofii, prăjește feliile de chouriço într-o tigaie goală, la foc mediu, aproximativ 3 minute, întorcându-le o dată, până se rumenesc pe margini și lasă grăsime. Ține-le calde pe o farfurie.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'blend',
          text: t(
            'Take the pot off the heat and blend the potatoes and their liquid with a stick blender until completely smooth. If it is too thick to pour, add a little hot water. Taste and add up to 3 g more salt.',
            'Ia oala de pe foc și mixează cartofii cu lichidul lor cu un blender vertical până devine complet cremos. Dacă e prea groasă ca să curgă, adaugă puțină apă fierbinte. Gustă și adaugă încă cel mult 3 g de sare.',
          ),
        },
        {
          key: 'add-greens',
          text: t(
            'Bring the smooth soup back to a gentle boil, stir in the couve and simmer for about 4 minutes, until just tender and bright green. Do not cover the pot.',
            'Adu supa cremoasă din nou la fierbere ușoară, adaugă varza și fierbe aproximativ 4 minute, până se înmoaie și rămâne verde aprins. Nu acoperi oala.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'serve',
          text: t(
            'Ladle into bowls, lay a few chouriço slices on each and add a thin thread of olive oil, about 5 ml per bowl, from the remaining 30 ml.',
            'Pune supa în boluri, așază câteva felii de chouriço în fiecare și toarnă un fir subțire de ulei de măsline, aproximativ 5 ml per bol, din cei 30 ml rămași.',
          ),
        },
      ],
      tips: [
        t(
          'Cut the couve as thin as you possibly can: thicker strips stay tough and fibrous in the soup. Many cooks outside Portugal use collard greens, the closest match, or kale, which is chewier: cut kale even finer and simmer it a minute or two longer.',
          'Taie varza cât de subțire poți: fâșiile mai groase rămân tari și fibroase în supă. Mulți bucătari din afara Portugaliei folosesc varză collard (verze cu frunze, fără căpățână), cea mai apropiată, sau kale, care e mai tare la mestecat: taie kale și mai fin și fierbe-o un minut-două în plus.',
        ),
      ],
      stepTips: [
        {
          step: 'blend',
          text: t(
            'Blend away from the heat and keep the blender head under the surface, so the hot soup does not splash.',
            'Mixează în afara focului și ține capul blenderului sub nivelul supei, ca să nu stropească.',
          ),
        },
      ],
      nutritionNote: t(
        'Potatoes make it filling, and the couve adds leafy greens and some fibre. Chouriço brings salt and saturated fat, so use only a few slices per bowl; olive oil is mostly unsaturated fat, and the soup has no cream or butter.',
        'Cartofii o fac sățioasă, iar varza aduce frunze verzi și ceva fibre. Chouriço aduce sare și grăsimi saturate, așa că pune doar câteva felii în fiecare bol; uleiul de măsline e în mare parte grăsime nesaturată, iar supa nu are smântână sau unt.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Crusty country bread', 'Pâine de casă cu crustă'),
          reason: t(
            'The crisp crust gives the smooth soup something to bite against.',
            'Crusta crocantă dă supei cremoase un contrast la mestecat.',
          ),
          principle: 'contrast_texture',
          ingredient: 'country-bread',
        },
        {
          kind: 'drink',
          label: t(
            'Chilled light white wine (vinho verde style)',
            'Vin alb ușor, rece (de tip vinho verde)',
          ),
          reason: t(
            'Its crisp acidity cuts the smoky chouriço fat.',
            'Aciditatea lui proaspătă taie grăsimea afumată de la chouriço.',
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
            'A smooth, hot soup warms you through.',
            'O supă cremoasă și fierbinte te încălzește.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'good_for',
          reason: t(
            'Mild and simple, a small bowl is easy to eat late.',
            'Blândă și simplă, un bol mic se mănâncă ușor seara târziu.',
          ),
        },
      ],
    },
  ],
};
