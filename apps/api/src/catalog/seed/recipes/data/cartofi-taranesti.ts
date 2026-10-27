import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Cartofi țărănești base is the Romanian pan of fried potatoes with smoked
// bacon, onion and peppers. Each Variant is a full Recipe with its own lines,
// steps and guidance; the base's Recipe-level Tips are inherited, and the
// Variants hide the ones that only hold for the bacon-and-pepper pan.
export const cartofiTaranesti: BaseRecipeSeed = {
  slug: 'cartofi-taranesti',
  title: t(
    'Peasant-style fried potatoes with bacon, onion and peppers (cartofi țărănești)',
    'Cartofi țărănești cu costiță, ceapă și ardei',
  ),
  servings: 4,
  prepMinutes: 25,
  cookMinutes: 33,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'bacon',
      quantity: 150,
      unit: 'g',
      note: t(
        'smoked, raw, cut into 1 cm pieces',
        'costiță afumată crudă, tăiată în bucăți de 1 cm',
      ),
    },
    {
      ingredient: 'sunflower-oil',
      quantity: 45,
      unit: 'ml',
      note: t(
        '15 ml to start the bacon, the rest to top up the fat for the potatoes',
        '15 ml ca să pornești costița, restul ca să completezi grăsimea pentru cartofi',
      ),
    },
    {
      ingredient: 'potato',
      quantity: 0.8,
      unit: 'kg',
      note: t(
        'peeled, cut into 1.5 cm cubes',
        'curățați, tăiați cuburi de 1,5 cm',
      ),
    },
    {
      ingredient: 'onion',
      quantity: 1,
      unit: 'pcs',
      note: t('large, in half-rings', 'mare, tăiată semiluni'),
    },
    {
      ingredient: 'bell-pepper',
      quantity: 2,
      unit: 'pcs',
      note: t(
        '1 red and 1 green, in strips',
        '1 roșu și 1 verde, tăiați fâșii',
      ),
    },
    {
      ingredient: 'garlic',
      quantity: 6,
      unit: 'g',
      optional: true,
      note: t('2 cloves, crushed', '2 căței, striviți'),
    },
    { ingredient: 'paprika', quantity: 3, unit: 'g' },
    {
      ingredient: 'salt',
      quantity: 3,
      unit: 'g',
      note: t(
        'add a little at a time: the bacon is already salty',
        'pune puțin câte puțin: costița e deja sărată',
      ),
    },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
    {
      ingredient: 'parsley',
      quantity: 10,
      unit: 'g',
      note: t('chopped', 'tocat'),
    },
  ],
  steps: [
    {
      key: 'prep',
      text: t(
        'Peel the potatoes and cut them into 1.5 cm cubes. Rinse them in cold water and dry them very well in a clean towel. Cut the onion into half-rings, the peppers into strips and crush the garlic.',
        'Curăță cartofii și taie-i cuburi de 1,5 cm. Spală-i în apă rece și șterge-i foarte bine cu un prosop curat. Taie ceapa semiluni, ardeii fâșii și strivește usturoiul.',
      ),
    },
    {
      key: 'cut-bacon',
      text: t(
        'Cut the raw bacon into 1 cm pieces.',
        'Taie costița crudă în bucăți de 1 cm.',
      ),
    },
    {
      key: 'render',
      text: t(
        'Set a 28 to 30 cm frying pan over medium heat with 15 ml of the oil and add the bacon. Straight away, wash your hands, the board and the knife with hot soapy water, as the bacon is raw. Stir now and then for about 7 minutes, until the fat has run out and the pieces are firm, crisp at the edges and no longer raw-looking. Lift the bacon out with a slotted spoon onto a clean plate, not the one the raw bacon was on.',
        'Pune o tigaie de 28-30 cm la foc mediu cu 15 ml din ulei și adaugă costița. Imediat după, spală-ți mâinile, tocătorul și cuțitul cu apă caldă și săpun, fiindcă costița e crudă. Amestecă din când în când aproximativ 7 minute, până când a dat drumul la grăsime, iar bucățile sunt ferme, crocante la margini și nu mai arată crude. Scoate costița cu o spumieră pe o farfurie curată, nu pe cea pe care a stat cea crudă.',
      ),
      timerSeconds: 420,
    },
    {
      key: 'heat-fat',
      text: t(
        'Leave about 45 ml of fat in the pan, pouring off any extra, or topping up with the remaining oil if there is less. Turn the heat to medium-high until the fat shimmers and a potato cube dropped in sizzles at once.',
        'Lasă în tigaie circa 45 ml de grăsime: scurge surplusul sau completează cu uleiul rămas dacă e mai puțină. Dă focul mai tare (mediu spre mare) până când grăsimea e bine încinsă și tremură, iar un cub de cartof pus în ea sfârâie imediat.',
      ),
    },
    {
      key: 'fry-lid',
      text: t(
        'Add the potatoes in one layer, or as near to one as the pan allows, and turn the heat down to medium. Cover and cook for 5 minutes without stirring, until the cubes start to soften. If they do not fit in one layer, use two pans.',
        'Pune cartofii într-un singur strat, sau cât mai aproape de unul, și dă focul la mediu. Acoperă și lasă 5 minute fără să amesteci, până când cuburile încep să se înmoaie. Dacă nu încap într-un singur strat, folosește două tigăi.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'fry',
      text: t(
        'Lift the lid away from you, tilting it so the water on it does not drip into the pan, and fry for 6 minutes, turning the potatoes only every 2 to 3 minutes so a golden crust forms on each side. If they brown before they soften, lower the heat and put the lid back on for a couple of minutes.',
        'Ridică capacul dinspre tine, înclinat, ca apa de pe el să nu picure în tigaie, și prăjește 6 minute, întorcând cartofii doar din 2 în 3 minute, ca să se formeze pe fiecare parte o crustă aurie. Dacă se rumenesc înainte să se înmoaie, micșorează focul și pune capacul la loc pentru câteva minute.',
      ),
      timerSeconds: 360,
    },
    {
      key: 'veg',
      text: t(
        'Add the onion and peppers and fry for 9 minutes, stirring every 2 minutes, until the potatoes are golden and a knife slides into a cube without resistance, and the onion and peppers are soft and catching at the edges.',
        'Adaugă ceapa și ardeii și prăjește 9 minute, amestecând din 2 în 2 minute, până când cartofii sunt aurii și un cuțit intră în cub fără rezistență, iar ceapa și ardeii sunt moi și rumeniți pe margini.',
      ),
      timerSeconds: 540,
    },
    {
      key: 'garlic',
      text: t(
        'Stir in the garlic, if using, and cook for 1 minute until it smells fragrant but is not brown. Return the bacon to the pan to warm through at the same time.',
        'Adaugă usturoiul, dacă folosești, și gătește 1 minut, până miroase bine, dar nu s-a rumenit. Pune costița înapoi în tigaie, ca să se încălzească în același timp.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'season',
      text: t(
        'Take the pan off the heat and stir in the paprika, pepper and a pinch of salt. Taste, and add more salt only if it needs it. Scatter the parsley over and serve hot, straight from the pan.',
        'Ia tigaia de pe foc și amestecă boiaua, piperul și un praf de sare. Gustă și mai adaugă sare doar dacă are nevoie. Presară pătrunjelul și servește fierbinte, direct din tigaie.',
      ),
    },
  ],
  tips: [
    t(
      'Put leftovers in a covered container in the fridge within 2 hours of cooking and eat them within 3 days. Reheat them in a hot pan until steaming all the way through, and only once.',
      'Pune resturile într-un recipient acoperit la frigider în cel mult 2 ore de la gătit și mănâncă-le în 3 zile. Încălzește-le într-o tigaie fierbinte până scot aburi și sunt fierbinți și în mijloc, o singură dată.',
    ),
    t(
      'Dry the potatoes very well after rinsing: wet cubes steam instead of frying, stick to the pan and make the fat spit.',
      'Șterge cartofii foarte bine după spălat: cuburile ude se fierb în abur în loc să se prăjească, se lipesc de tigaie și fac grăsimea să sară.',
    ),
    t(
      'Salt at the end and taste first: smoked bacon is salty, and salting raw potatoes draws out water that stops them crisping.',
      'Sărează la final și gustă mai întâi: costița afumată e sărată, iar sarea pusă pe cartofii cruzi scoate apă și îi împiedică să se rumenească.',
    ),
  ],
  stepTips: [
    {
      step: 'render',
      text: t(
        'Start the bacon in a pan that is only medium hot: too hot and the outside darkens before the fat has melted.',
        'Pune costița în tigaie la foc doar mediu: dacă e prea fierbinte, se închide la culoare pe dinafară înainte să se topească grăsimea.',
      ),
    },
    {
      step: 'heat-fat',
      text: t(
        'The fat is ready when it shimmers and a cube sizzles at once. If it smokes, it is too hot: take the pan off the heat for a minute and lower the burner.',
        'Grăsimea e gata când tremură și un cub sfârâie imediat. Dacă scoate fum, e prea fierbinte: ia tigaia de pe foc un minut și micșorează flacăra.',
      ),
    },
    {
      step: 'season',
      text: t(
        'Add the paprika off the heat: in hot fat it burns in seconds and turns the dish bitter.',
        'Pune boiaua după ce iei tigaia de pe foc: în grăsime fierbinte se arde în câteva secunde și face mâncarea amară.',
      ),
    },
  ],
  nutritionNote: t(
    'Potatoes give filling carbohydrate and potassium, and the peppers add some vitamin C. Frying in bacon fat and oil makes it rich in energy, and the smoked bacon adds saturated fat and a lot of salt, so use less bacon if you watch salt. Serve with a fresh salad or pickles for more vegetables.',
    'Cartofii dau carbohidrați care sațiază și potasiu, iar ardeii aduc puțină vitamina C. Prăjitul în grăsime de costiță și ulei îl face bogat în energie, iar costița afumată aduce grăsimi saturate și multă sare, așa că pune mai puțină costiță dacă ai grijă la sare. Servește-l cu o salată proaspătă sau murături pentru mai multe legume.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sharp brine cuts through the bacon fat and the fried potatoes.',
        'Zeama lor acrișoară taie din grăsimea costiței și a cartofilor prăjiți.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'food',
      label: t('Pickled green tomatoes', 'Gogonele murate'),
      reason: t(
        'A sour, crunchy bite that freshens a rich, fried plate.',
        'O îmbucătură acrișoară și crocantă care înviorează o farfurie grasă, prăjită.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-green-tomatoes',
    },
    {
      kind: 'food',
      label: t(
        'Romanian white cabbage salad with dill (salată de varză)',
        'Salată de varză albă cu mărar',
      ),
      reason: t(
        'The vinegar-dressed raw cabbage cuts the bacon fat and adds a cold, crisp contrast.',
        'Varza crudă cu oțet taie din grăsimea costiței și aduce un contrast rece și crocant.',
      ),
      principle: 'acid_cuts_fat',
      recipe: 'coleslaw-romanian',
    },
    {
      kind: 'food',
      label: t('Fresh tomatoes', 'Roșii proaspete'),
      reason: t(
        'Juicy and slightly acidic, they lift the heavy, smoky pan.',
        'Zemoase și ușor acidulate, ușurează tigaia grea și afumată.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'tomato',
    },
    {
      kind: 'drink',
      label: t('Cold beer', 'Bere rece'),
      reason: t(
        'The bitterness and bubbles refresh the palate between salty, fatty bites.',
        'Amăreala și bulele împrospătează gustul între îmbucăturile sărate și grase.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'beer',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot, filling pan of potatoes and smoked bacon warms you through.',
        'O tigaie fierbinte și sățioasă de cartofi cu costiță afumată te încălzește bine.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Potatoes refill carbohydrate and the bacon adds some protein.',
        'Cartofii refac carbohidrații, iar costița aduce și ceva proteine.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Fried, fatty food sits heavy in the stomach during exercise.',
        'Mâncarea prăjită și grasă cade greu la stomac în timpul efortului.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Fat and salt late at night can sit heavily and disturb sleep.',
        'Grăsimea și sarea seara târziu pot cădea greu și pot strica somnul.',
      ),
    },
  ],
  variants: [
    {
      slug: 'cartofi-taranesti-swiss',
      cuisine: 'swiss',
      title: t(
        'Rösti (Swiss crisp grated potato cake)',
        'Rösti (turtă elvețiană crocantă din cartofi rași)',
      ),
      servings: 4,
      prepMinutes: 280,
      cookMinutes: 56,
      difficulty: 'medium',
      hideBaseTips: [0, 1, 2],
      lines: [
        {
          ingredient: 'potato',
          quantity: 0.8,
          unit: 'kg',
          note: t(
            'firm, medium (about 150 g each), unpeeled',
            'cu miez ferm, de mărime medie (cam 150 g fiecare), cu coajă',
          ),
        },
        { ingredient: 'salt', quantity: 5, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        {
          ingredient: 'clarified-butter',
          quantity: 50,
          unit: 'g',
          note: t(
            '30 g for the first side, 20 g for the second',
            '30 g pentru prima parte, 20 g pentru a doua',
          ),
        },
        {
          ingredient: 'butter',
          quantity: 20,
          unit: 'g',
          note: t('added for the second side', 'adăugat pentru a doua parte'),
        },
      ],
      steps: [
        {
          key: 'boil',
          text: t(
            'Put the unpeeled potatoes in a pot, cover with cold water and bring to the boil. Simmer for about 15 minutes, until a knife slides into the outer centimetre but meets firm resistance in the middle.',
            'Pune cartofii cu coajă într-o oală, acoperă-i cu apă rece și adu la fierbere. Fierbe la foc mic aproximativ 15 minute, până când un cuțit intră în primul centimetru, dar în mijloc întâmpină rezistență.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'cool',
          text: t(
            'Drain the potatoes and leave them to steam dry for about 30 minutes. Put them in the fridge within 2 hours of boiling.',
            'Scurge cartofii și lasă-i să se zvânte vreo 30 de minute. Pune-i la frigider în cel mult 2 ore de la fierbere.',
          ),
        },
        {
          key: 'chill',
          text: t(
            'Chill them for at least 4 hours, or overnight, until they are cold and firm all the way through.',
            'Răcește-i la frigider cel puțin 4 ore, sau peste noapte, până sunt reci și fermi în tot miezul.',
          ),
          timerSeconds: 14400,
        },
        {
          key: 'grate',
          text: t(
            'Peel the cold potatoes and grate them coarsely into a bowl. Season with the salt and pepper and toss lightly with a fork. Do not rinse or squeeze them: the starch holds the cake together.',
            'Curăță cartofii reci de coajă și dă-i prin răzătoarea mare într-un castron. Condimentează cu sarea și piperul și amestecă ușor cu furculița. Nu-i clăti și nu-i stoarce: amidonul ține turta laolaltă.',
          ),
        },
        {
          key: 'heat',
          text: t(
            'Heat a 24 to 26 cm non-stick or well-seasoned pan over medium heat with 30 g of the clarified butter, until it shimmers and a shred of potato dropped in sizzles gently.',
            'Încinge la foc mediu o tigaie antiaderentă sau una de fontă bine tratată, de 24-26 cm, cu 30 g din untul clarifiat, până când e bine încinsă și un fir de cartof pus în ea sfârâie ușor.',
          ),
        },
        {
          key: 'cake',
          text: t(
            'Add the potatoes, spread them loosely to the edge, and press lightly with a spatula into a cake about 2 cm thick. Cook for about 13 minutes without stirring, until the underside is deep golden when you lift an edge to look. Lower the heat if the edge darkens too fast.',
            'Adaugă cartofii, întinde-i lejer până la margine, fără să-i tasezi, și apasă ușor cu o spatulă, într-o turtă groasă de circa 2 cm. Gătește aproximativ 13 minute fără să amesteci, până când partea de jos e aurie închis, când ridici o margine să te uiți. Micșorează focul dacă marginea se închide prea repede.',
          ),
          timerSeconds: 780,
        },
        {
          key: 'flip',
          text: t(
            'Slide the cake onto a flat plate that is larger than the pan. Put the remaining clarified butter and the butter into the pan and melt them over medium heat. With oven gloves, turn the cake back into the pan, golden side up.',
            'Glisează turta pe o farfurie plată, mai mare decât tigaia. Pune în tigaie restul de 20 g de unt clarifiat și untul obișnuit și lasă-le să se topească la foc mediu. Cu mănuși de bucătărie, răstoarnă turta înapoi în tigaie, cu partea aurie în sus.',
          ),
        },
        {
          key: 'second-side',
          text: t(
            'Cook the second side for about 11 minutes, until deep golden and the potato in the middle is hot and tender. Tidy the edges in with the spatula.',
            'Gătește a doua parte aproximativ 11 minute, până e aurie închis, iar cartoful din mijloc e fierbinte și moale. Potrivește marginile cu spatula.',
          ),
          timerSeconds: 660,
        },
        {
          key: 'serve',
          text: t(
            'Slide the rösti onto a board, cut it into wedges and serve at once, while the crust is crisp.',
            'Trage rösti pe un tocător, taie-l în felii triunghiulare și servește imediat, cât timp crusta e crocantă.',
          ),
        },
      ],
      tips: [
        t(
          'Cold, firm potatoes grate into separate strands; warm ones turn to mush. Boil them the day before.',
          'Cartofii reci și fermi se rad în fire separate; cei calzi se transformă în pastă. Fierbe-i cu o zi înainte.',
        ),
        t(
          'Put leftover rösti in the fridge within 2 hours of cooking; it keeps for 2 days. Reheat it in a hot pan or oven until steaming and crisp again.',
          'Pune rösti rămas la frigider în cel mult 2 ore de la gătit; se păstrează 2 zile. Încălzește-l într-o tigaie sau la cuptor fierbinte până scoate aburi și e din nou crocant.',
        ),
      ],
      stepTips: [
        {
          step: 'cake',
          text: t(
            'Do not press hard or keep prodding: a packed cake turns dense and gummy, and moving it stops the crust forming.',
            'Nu apăsa tare și nu tot atinge turta: o turtă îndesată devine densă și cleioasă, iar mutatul împiedică formarea crustei.',
          ),
        },
        {
          step: 'flip',
          text: t(
            'Pour off any loose fat first. Hold the plate firmly on the pan with both gloved hands and turn it in one quick move, away from your body.',
            'Scurge mai întâi grăsimea în exces. Ține farfuria bine pe tigaie cu ambele mâini în mănuși și răstoarnă dintr-o mișcare rapidă, în direcția opusă corpului.',
          ),
        },
      ],
      nutritionNote: t(
        'Potatoes give filling carbohydrate and potassium. The clarified butter and butter add saturated fat, and the crisp crust is rich in energy. Serve it with a green salad or other vegetables, which a plain potato cake lacks.',
        'Cartofii dau carbohidrați care sațiază și potasiu. Untul clarifiat și untul obișnuit aduc grăsimi saturate, iar crusta crocantă e bogată în energie. Servește-l cu o salată verde sau alte legume, care lipsesc dintr-o turtă de cartofi.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Fried eggs', 'Ouă ochiuri'),
          reason: t(
            'The soft yolk sauces the crisp potato. Cook the eggs until the white is set and the yolk firm for children, older people and anyone pregnant.',
            'Gălbenușul moale unge cartoful crocant. Pentru copii, vârstnici și gravide gătește ouăle până se întăresc albușul și gălbenușul.',
          ),
          principle: 'complement_flavour',
          ingredient: 'eggs',
        },
        {
          kind: 'food',
          label: t('Sour cream', 'Smântână'),
          reason: t(
            'Cool and tangy, it cuts the buttery richness of the crust.',
            'Rece și acrișoară, taie din bogăția untoasă a crustei.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'sour-cream',
        },
        {
          kind: 'food',
          label: t('Green salad', 'Salată verde'),
          reason: t(
            'Crisp, fresh leaves with a sharp dressing contrast the rich fried cake.',
            'Frunzele proaspete și crocante, cu un dressing acrișor, fac contrast cu turta bogată.',
          ),
          principle: 'contrast_texture',
          ingredient: 'lettuce',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its acidity refreshes the palate after the buttery potato.',
            'Aciditatea lui împrospătează gustul după cartoful cu unt.',
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
            'It goes well with eggs, and the potatoes can be boiled the day before.',
            'Se potrivește bine cu ouă, iar cartofii se pot fierbe cu o zi înainte.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Hot, crisp and buttery, it is warming.',
            'Fierbinte, crocant și cu gust de unt, încălzește bine.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Fried, buttery food sits heavy in the stomach during exercise.',
            'Mâncarea prăjită și cu unt cade greu la stomac în timpul efortului.',
          ),
        },
      ],
    },
    {
      slug: 'cartofi-taranesti-spanish',
      cuisine: 'spanish',
      title: t(
        'Patatas bravas (Spanish fried potatoes with spicy paprika sauce)',
        'Patatas bravas (cartofi prăjiți spaniolești cu sos iute de boia)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 58,
      difficulty: 'medium',
      hideBaseTips: [0, 1, 2],
      lines: [
        {
          ingredient: 'potato',
          quantity: 0.8,
          unit: 'kg',
          note: t(
            'peeled, cut into irregular 3 cm chunks',
            'curățați, tăiați bucăți neregulate de 3 cm',
          ),
        },
        {
          ingredient: 'olive-oil',
          key: 'frying-oil',
          quantity: 1000,
          unit: 'ml',
          note: t(
            'for frying, about 3 cm deep in a pot 20 cm wide',
            'pentru prăjit, cam 3 cm adâncime într-o oală de 20 cm lățime',
          ),
        },
        {
          ingredient: 'olive-oil',
          key: 'sauce-oil',
          quantity: 30,
          unit: 'ml',
          note: t('for the sauce', 'pentru sos'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t('3 cloves, finely sliced', '3 căței, tăiați subțire'),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          optional: true,
          note: t('small, finely chopped', 'mică, tocată mărunt'),
        },
        { ingredient: 'flour', quantity: 15, unit: 'g' },
        {
          ingredient: 'paprika',
          quantity: 6,
          unit: 'g',
          note: t('sweet', 'dulce'),
        },
        {
          ingredient: 'smoked-paprika',
          quantity: 3,
          unit: 'g',
          note: t('hot (pimentón picante)', 'iute (pimentón picante)'),
        },
        { ingredient: 'chicken-stock', quantity: 300, unit: 'ml' },
        {
          ingredient: 'cayenne',
          quantity: 0.5,
          unit: 'g',
          optional: true,
          note: t('for more heat', 'pentru mai mult iute'),
        },
        {
          ingredient: 'sherry-vinegar',
          quantity: 5,
          unit: 'ml',
          optional: true,
        },
        {
          ingredient: 'salt',
          quantity: 5,
          unit: 'g',
          note: t(
            'about 4 g on the potatoes, the rest in the sauce, to taste',
            'cam 4 g pe cartofi, restul în sos, după gust',
          ),
        },
      ],
      steps: [
        {
          key: 'prep',
          text: t(
            'Peel the potatoes and cut them into irregular 3 cm chunks. Pat them completely dry with a clean towel: any water makes hot oil spit.',
            'Curăță cartofii și taie-i în bucăți neregulate de 3 cm. Șterge-i complet cu un prosop curat: orice strop de apă face uleiul fierbinte să sară.',
          ),
        },
        {
          key: 'heat-oil',
          text: t(
            'Pour the frying oil into a heavy pot about 20 cm wide and at least 12 cm deep. The oil must fill no more than one-third of the pot. Heat it over medium heat to 140 to 150 °C, checking with a cooking thermometer. Do not leave the pot unattended.',
            'Toarnă uleiul pentru prăjit într-o oală cu fundul gros, de circa 20 cm lățime și cel puțin 12 cm adâncime. Uleiul trebuie să umple cel mult o treime din oală. Încălzește-l la foc mediu până la 140-150 °C, verificând cu un termometru de bucătărie. Nu lăsa oala nesupravegheată.',
          ),
        },
        {
          key: 'fry-1a',
          text: t(
            'Lower half of the potatoes into the oil with a slotted spoon, away from you. Fry for about 9 minutes, turning now and then so every side cooks, until a knife slides in easily and the chunks are still pale. Keep the oil at 140 to 150 °C by adjusting the heat.',
            'Coboară jumătate din cartofi în ulei cu o spumieră, în direcția opusă ție. Prăjește circa 9 minute, întorcându-i din când în când ca să se gătească pe toate părțile, până când un cuțit intră ușor, iar bucățile sunt încă palide. Ține uleiul la 140-150 °C ajustând focul.',
          ),
          timerSeconds: 540,
        },
        {
          key: 'fry-1b',
          text: t(
            'Lift the chunks out onto a wire rack or a tray lined with kitchen paper. Let the oil come back to 140 to 150 °C, then fry the other half the same way, for about 9 minutes.',
            'Scoate bucățile pe un grătar metalic sau pe o tavă tapetată cu hârtie de bucătărie. Lasă uleiul să revină la 140-150 °C, apoi prăjește și cealaltă jumătate la fel, circa 9 minute.',
          ),
          timerSeconds: 540,
        },
        {
          key: 'rest',
          text: t(
            'Lift the second batch out too and turn off the heat under the oil. Leave the oil where it is, away from children, while the potatoes cool and you make the sauce.',
            'Scoate și a doua tură și oprește focul de sub ulei. Lasă uleiul pe loc, departe de copii, cât timp se răcesc cartofii și faci sosul.',
          ),
        },
        {
          key: 'sauce-onion',
          text: t(
            'If using the onion, warm the 30 ml of sauce oil in a small pan over low heat and cook the onion for 3 minutes, until soft and translucent.',
            'Dacă folosești ceapa, încălzește cei 30 ml de ulei pentru sos într-o cratiță mică la foc mic și călește ceapa 3 minute, până se înmoaie și devine translucidă.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'sauce-garlic',
          text: t(
            'Add the garlic (and the oil too, if you skipped the onion) and cook for 2 minutes over low heat, until pale and soft. Do not let it brown, or the sauce will turn bitter.',
            'Adaugă usturoiul (și uleiul, dacă ai sărit peste ceapă) și gătește 2 minute la foc mic, până se înmoaie și e palid. Nu-l lăsa să se rumenească, altfel sosul iese amar.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'sauce-flour',
          text: t(
            'Stir in the flour and cook for 1 minute, stirring, until it smells toasty but is still pale.',
            'Adaugă făina și gătește 1 minut, amestecând, până miroase a prăjit, dar e încă deschisă la culoare.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'sauce-paprika',
          text: t(
            'Take the pan off the heat. Stir in the sweet and hot smoked paprika, the cayenne if using, then whisk in the stock a little at a time so there are no lumps.',
            'Ia cratița de pe foc. Amestecă boiaua dulce și boiaua afumată iute, piper cayenne dacă folosești, apoi adaugă supa puțin câte puțin, amestecând, ca să nu rămână cocoloașe.',
          ),
        },
        {
          key: 'sauce-simmer',
          text: t(
            'Put the pan back on low to medium heat and simmer for 5 minutes, stirring, until the sauce coats the back of a spoon but still pours. Add the vinegar if using, and salt to taste. Cover it off the heat to keep it warm.',
            'Pune cratița înapoi pe foc mic spre mediu și fierbe 5 minute, amestecând, până când sosul acoperă dosul lingurii, dar curge. Adaugă oțetul dacă folosești și sare după gust. Acoperă-l, de pe foc, ca să rămână cald.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'heat-180',
          text: t(
            'Bring the frying oil up to 180 °C over medium-high heat, checking with the thermometer. If the oil smokes, turn the heat off and do not move the pot.',
            'Adu uleiul pentru prăjit la 180 °C la foc mediu spre mare, verificând cu termometrul. Dacă uleiul scoate fum, oprește focul și nu muta oala.',
          ),
        },
        {
          key: 'fry-2a',
          text: t(
            'Lower half of the cooled chunks into the 180 °C oil. Fry for about 4 minutes, turning them so every side colours, until deep golden and crisp, then lift out onto a clean tray lined with kitchen paper.',
            'Coboară jumătate din bucățile răcite în uleiul de 180 °C. Prăjește circa 4 minute, întorcându-le ca să se rumenească pe toate părțile, până sunt aurii închis și crocante, apoi scoate-le pe o tavă curată, tapetată cu hârtie de bucătărie.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'fry-2b',
          text: t(
            'Let the oil come back to 180 °C and fry the other half the same way, for about 4 minutes. Drain and sprinkle both batches with about 4 g of salt while they are hot. Turn off the heat under the oil.',
            'Lasă uleiul să revină la 180 °C și prăjește și cealaltă jumătate la fel, circa 4 minute. Scurge și presară peste ambele tururi cam 4 g de sare cât sunt fierbinți. Oprește focul de sub ulei.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'serve',
          text: t(
            'Reheat the sauce until it is steaming, adding a splash of stock if it has thickened. Heap the potatoes on a warm dish and spoon the hot sauce over them, or serve it alongside, and eat at once while they are crisp.',
            'Încălzește sosul până scoate aburi, cu un strop de supă dacă s-a îngroșat. Pune cartofii grămadă într-un platou cald și toarnă peste ei sosul fierbinte cu lingura, sau servește-l alături, și mănâncă imediat cât sunt crocanți.',
          ),
        },
        {
          key: 'oil-after',
          text: t(
            'Leave the oil in the pot, off the heat, until it is completely cold, which takes several hours. Then strain it into a container with a lid. You can reuse it once or twice for frying; when it darkens or smells off, put it in the bin, never down the drain.',
            'Lasă uleiul în oală, de pe foc, până se răcește complet, ceea ce durează câteva ore. Apoi strecoară-l într-un recipient cu capac. Îl poți refolosi o dată sau de două ori la prăjit; când se întunecă sau miroase urât, aruncă-l la gunoi, nu pe chiuvetă.',
          ),
        },
      ],
      tips: [
        t(
          'If the oil catches fire, turn off the heat only if it is safe to do so and do not move the pot. Cover it with a lid or a damp towel, and never use water. If it does not go out at once, get everyone out, close the door and call 112.',
          'Dacă uleiul ia foc, oprește focul doar dacă poți face asta în siguranță și nu muta oala. Acoper-o cu un capac sau cu un prosop umed și nu folosi niciodată apă. Dacă nu se stinge imediat, scoate pe toată lumea din casă, închide ușa și sună la 112.',
        ),
        t(
          'Eat the potatoes straight away, as the crust softens as they sit. Keep the sauce in the fridge for 3 days. Put any leftover potatoes in the fridge within 2 hours, eat them within 1 day, and reheat in a hot oven until steaming and crisp.',
          'Mănâncă cartofii imediat, pentru că după un timp crusta se înmoaie. Păstrează sosul 3 zile la frigider. Pune eventualii cartofi rămași la frigider în cel mult 2 ore, mănâncă-i în maximum o zi și încălzește-i la cuptor fierbinte până scot aburi și sunt crocanți.',
        ),
      ],
      stepTips: [
        {
          step: 'heat-oil',
          text: t(
            'Never fill the pot more than one-third and never add water to hot oil. If the oil smokes, turn the heat off and let it cool a little.',
            'Nu umple oala mai mult de o treime și nu pune niciodată apă în ulei încins. Dacă uleiul scoate fum, oprește focul și lasă-l să se răcească puțin.',
          ),
        },
        {
          step: 'sauce-paprika',
          text: t(
            'Paprika burns in seconds in hot fat and turns bitter, so stir it in off the heat.',
            'Boiaua se arde în câteva secunde în grăsime încinsă și devine amară, așa că pune-o după ce iei cratița de pe foc.',
          ),
        },
      ],
      nutritionNote: t(
        'Potatoes give filling carbohydrate and potassium, and the sauce brings paprika flavour with little added fat. Frying twice makes them very energy-rich, olive oil is mostly unsaturated, and the stock and salt can make it salty, so taste the sauce before adding salt. Serve with a salad for vegetables.',
        'Cartofii dau carbohidrați care sațiază și potasiu, iar sosul aduce gust de boia cu puțină grăsime adăugată. Prăjirea de două ori îi face foarte bogați în energie, uleiul de măsline e în mare parte nesaturat, iar supa și sarea îl pot face sărat, așa că gustă sosul înainte să adaugi sare. Servește cu o salată pentru legume.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Cold beer', 'Bere rece'),
          reason: t(
            'Its bubbles and bitterness refresh the palate between spicy, fried bites.',
            'Bulele și amăreala ei împrospătează gustul între îmbucăturile picante și prăjite.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
        {
          kind: 'food',
          label: t('Olives', 'Măsline'),
          reason: t(
            'Their salty, briny bite suits a plate of tapas.',
            'Gustul lor sărat, de saramură, se potrivește cu o farfurie de tapas.',
          ),
          principle: 'complement_flavour',
          ingredient: 'olives',
        },
        {
          kind: 'food',
          label: t('Manchego', 'Manchego'),
          reason: t(
            'A firm, nutty cheese that goes with the smoky paprika sauce.',
            'O brânză fermă, cu gust de nucă, care merge cu sosul afumat de boia.',
          ),
          principle: 'complement_flavour',
          ingredient: 'manchego',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its acidity cuts through the oil and the spicy sauce.',
            'Aciditatea lui taie din ulei și din sosul picant.',
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
            'Hot, crisp and spicy, it warms you up.',
            'Fierbinți, crocanți și picanți, te încălzesc.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Deep-fried, spicy food late at night can sit heavily and disturb sleep.',
            'Mâncarea prăjită în ulei mult și picantă seara târziu poate cădea greu și poate strica somnul.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Deep-fried food sits heavy in the stomach during exercise.',
            'Mâncarea prăjită în ulei mult cade greu la stomac în timpul efortului.',
          ),
        },
      ],
    },
  ],
};
