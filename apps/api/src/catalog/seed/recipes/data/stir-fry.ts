import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Stir-fry base is a vegetable stir-fry with a soy and oyster sauce over rice.
// Each Variant is a full Recipe with its own lines, steps and guidance. The
// base's Recipe-level Tips are inherited; every Variant hides Tip 1, which is
// about vegetables.
export const stirFry: BaseRecipeSeed = {
  slug: 'stir-fry',
  title: t('Vegetable stir-fry', 'Legume sotate la wok'),
  servings: 2,
  prepMinutes: 15,
  cookMinutes: 18,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'broccoli',
      quantity: 200,
      unit: 'g',
      note: t('small florets', 'buchețele mici'),
    },
    {
      ingredient: 'carrot',
      quantity: 120,
      unit: 'g',
      note: t('sliced into thin coins', 'tăiați în rondele subțiri'),
    },
    {
      ingredient: 'bell-pepper',
      quantity: 1,
      unit: 'pcs',
      note: t('cut into strips', 'tăiat în fâșii'),
    },
    {
      ingredient: 'shiitake',
      quantity: 100,
      unit: 'g',
      note: t(
        'stems removed, caps sliced',
        'fără picioare, pălăriile tăiate felii',
      ),
    },
    {
      ingredient: 'spring-onion',
      quantity: 30,
      unit: 'g',
      note: t(
        'whites and greens separated, sliced',
        'partea albă separată de cea verde, tăiate felii',
      ),
    },
    {
      ingredient: 'garlic',
      quantity: 8,
      unit: 'g',
      note: t('2 cloves, finely chopped', '2 căței, tocați mărunt'),
    },
    {
      ingredient: 'ginger',
      quantity: 8,
      unit: 'g',
      note: t('finely chopped', 'tocat mărunt'),
    },
    { ingredient: 'soy-sauce', quantity: 20, unit: 'ml' },
    { ingredient: 'oyster-sauce', quantity: 20, unit: 'ml' },
    { ingredient: 'corn-starch', quantity: 5, unit: 'g' },
    {
      ingredient: 'still-water',
      key: 'sauce-water',
      quantity: 0.08,
      unit: 'l',
      note: t('for the sauce', 'pentru sos'),
    },
    { ingredient: 'sunflower-oil', quantity: 30, unit: 'ml' },
    { ingredient: 'sesame-oil', quantity: 5, unit: 'ml' },
    { ingredient: 'rice', quantity: 150, unit: 'g' },
    {
      ingredient: 'still-water',
      key: 'rice-water',
      quantity: 0.3,
      unit: 'l',
      note: t('for cooking the rice', 'pentru fiertul orezului'),
    },
  ],
  steps: [
    {
      key: 'rice',
      text: t(
        'Rinse the rice until the water runs nearly clear. Put it in a small pot with the 300 ml of water, bring to a boil, then cover and cook on the lowest heat for 12 minutes. Take it off the heat and leave it covered while you cook the vegetables.',
        'Spală orezul până când apa se limpezește aproape complet. Pune-l într-o oală mică cu cei 300 ml de apă, adu la fierbere, apoi acoperă și gătește la foc foarte mic 12 minute. Ia oala de pe foc și las-o acoperită cât gătești legumele.',
      ),
      timerSeconds: 720,
    },
    {
      key: 'prep',
      text: t(
        'Cut the broccoli, carrot, pepper and shiitake as described in the ingredient list, and chop the garlic and ginger. Keep the spring onion whites and greens apart, and put everything within reach of the stove.',
        'Taie broccoli, morcovul, ardeiul și shiitake așa cum scrie la ingrediente și toacă usturoiul și ghimbirul. Ține separat partea albă și cea verde a cepei verzi și așază totul la îndemâna aragazului.',
      ),
    },
    {
      key: 'sauce',
      text: t(
        'Stir the soy sauce, oyster sauce, corn starch and the 80 ml of water together in a small bowl until no lumps of starch remain.',
        'Amestecă într-un bol mic sosul de soia, sosul de stridii, amidonul de porumb și cei 80 ml de apă, până nu mai rămân cocoloașe de amidon.',
      ),
    },
    {
      key: 'hard-veg',
      text: t(
        'Heat a wok or a large frying pan over the highest heat until a drop of water vanishes at once. Add half of the sunflower oil, then the broccoli and carrot. Toss for about 3 minutes, until the broccoli is bright green with a few browned edges.',
        'Încinge un wok sau o tigaie mare la foc maxim, până când o picătură de apă dispare imediat. Adaugă jumătate din uleiul de floarea soarelui, apoi broccoli și morcovul. Amestecă aproximativ 3 minute, până când broccoli devine verde intens, cu câteva margini rumenite.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'soft-veg',
      text: t(
        'Add the rest of the oil, the pepper and the shiitake and toss for about 2 minutes, until the mushrooms are golden and the pepper has lost its raw look but still has a bite.',
        'Adaugă restul uleiului, ardeiul și shiitake și amestecă aproximativ 2 minute, până când ciupercile se rumenesc, iar ardeiul nu mai arată crud, dar rămâne crocant.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'aromatics',
      text: t(
        'Push the vegetables to the sides, drop the garlic, ginger and spring onion whites into the clear middle and stir for 20 seconds, until fragrant. Do not let the garlic brown.',
        'Împinge legumele spre margini, pune usturoiul, ghimbirul și partea albă a cepei verzi în mijlocul liber și amestecă 20 de secunde, până se simte aroma. Nu lăsa usturoiul să se rumenească.',
      ),
      timerSeconds: 20,
    },
    {
      key: 'sauce-in',
      text: t(
        'Stir the sauce again, because the starch settles, and pour it in. Toss for about a minute, until the sauce thickens and coats the vegetables in a glossy film.',
        'Amestecă din nou sosul, pentru că amidonul se depune, și toarnă-l în wok. Amestecă aproximativ un minut, până când sosul se îngroașă și acoperă legumele cu o peliculă lucioasă.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'serve',
      text: t(
        'Take the wok off the heat, stir in the sesame oil and the spring onion greens, and serve straight away over the rice, fluffed with a fork.',
        'Ia wokul de pe foc, adaugă uleiul de susan și partea verde a cepei verzi și servește imediat peste orezul afânat cu furculița.',
      ),
    },
  ],
  tips: [
    t(
      'Stir-frying is over in minutes, so cut everything and mix the sauce before you light the stove. Nothing can wait while the pan is hot.',
      'Gătitul la wok durează doar câteva minute, așa că taie tot și amestecă sosul înainte să aprinzi focul. Nimic nu poate aștepta cât tigaia e încinsă.',
    ),
    t(
      'Dry the washed vegetables well and do not crowd the pan: wet or packed vegetables steam and go limp instead of searing. If your pan is small, cook in two batches.',
      'Șterge bine legumele spălate și nu aglomera tigaia: legumele ude sau îngrămădite se fierb în abur și se moaie, în loc să se rumenească. Dacă tigaia e mică, gătește în două reprize.',
    ),
    t(
      'If you cook extra rice, spread it on a tray, cool it within an hour and refrigerate it. Eat it within a day and reheat it until steaming hot.',
      'Dacă faci orez în plus, întinde-l pe o tavă, lasă-l să se răcească într-o oră și pune-l la frigider. Consumă-l în maximum o zi și reîncălzește-l până scoate aburi.',
    ),
  ],
  stepTips: [
    {
      step: 'hard-veg',
      text: t(
        'Let the vegetables sit still for 20 to 30 seconds between tosses so they brown on the hot metal instead of just warming through.',
        'Lasă legumele nemișcate 20-30 de secunde între amestecări, ca să se rumenească pe metalul încins, nu doar să se încălzească.',
      ),
    },
    {
      step: 'sauce-in',
      text: t(
        'If the sauce turns gluey, loosen it with a splash of water; if it stays thin, give it another 20 seconds on the heat.',
        'Dacă sosul devine prea gelatinos, subțiază-l cu un strop de apă; dacă rămâne subțire, mai ține-l 20 de secunde pe foc.',
      ),
    },
  ],
  nutritionNote: t(
    'Plenty of vegetables for fibre and colour, with rice for energy and a moderate amount of oil. The soy and oyster sauces are salty, so measure them rather than splash. There is very little protein, so add tofu or an egg to make it a fuller meal.',
    'Multe legume pentru fibre și culoare, cu orez pentru energie și o cantitate moderată de ulei. Sosurile de soia și de stridii sunt sărate, așa că măsoară-le, nu le turna din ochi. Are foarte puține proteine, așa că adaugă tofu sau un ou pentru o masă mai completă.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Crisp fried tofu', 'Tofu prăjit crocant'),
      reason: t(
        'Adds the protein the vegetables lack, and its crust sits well against the soft sauce.',
        'Aduce proteinele care lipsesc legumelor, iar crusta lui contrastează cu sosul moale.',
      ),
      principle: 'contrast_texture',
      ingredient: 'tofu',
    },
    {
      kind: 'food',
      label: t('Sriracha', 'Sriracha'),
      reason: t(
        'A little garlicky heat wakes up the mild vegetables and the sweet oyster sauce.',
        'Un pic de iuțeală cu usturoi trezește legumele blânde și sosul dulceag de stridii.',
      ),
      principle: 'complement_flavour',
      ingredient: 'sriracha',
    },
    {
      kind: 'food',
      label: t('Cucumber with rice vinegar', 'Castraveți cu oțet de orez'),
      reason: t(
        'Cold, tangy crunch against the hot, soft vegetables and the glossy sauce.',
        'Un crocant rece și acrișor, în contrast cu legumele calde și moi și cu sosul lucios.',
      ),
      principle: 'contrast_texture',
      ingredient: 'cucumber',
    },
    {
      kind: 'drink',
      label: t('Green tea', 'Ceai verde'),
      reason: t(
        'Light and slightly bitter, it cleans the palate between bites of savoury sauce.',
        'Ușor și puțin amărui, curăță gura între îmbucăturile de sos sărat.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'green-tea',
    },
    {
      kind: 'drink',
      label: t('Cold lager', 'Bere blondă rece'),
      reason: t(
        'Its crisp fizz refreshes the palate after the salty sauce.',
        'Spuma ei fină împrospătează gustul după sosul sărat.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'beer',
    },
  ],
  eatingMoments: [
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'Ready in about half an hour and full of vegetables without feeling heavy.',
        'Gata în aproximativ o jumătate de oră și plină de legume, fără să cadă greu.',
      ),
    },
  ],
  variants: [
    {
      slug: 'stir-fry-chinese',
      cuisine: 'chinese',
      hideBaseTips: [0, 1],
      title: t(
        'Tomato and egg stir-fry',
        'Ouă cu roșii sotate, în stil chinezesc',
      ),
      servings: 2,
      prepMinutes: 10,
      cookMinutes: 17,
      difficulty: 'easy',
      lines: [
        { ingredient: 'eggs', quantity: 4, unit: 'pcs' },
        {
          ingredient: 'tomato',
          quantity: 400,
          unit: 'g',
          note: t('3 medium, cut into wedges', '3 medii, tăiate felii late'),
        },
        {
          ingredient: 'spring-onion',
          quantity: 20,
          unit: 'g',
          note: t('thinly sliced', 'tăiată subțire'),
        },
        { ingredient: 'sugar', quantity: 5, unit: 'g' },
        { ingredient: 'salt', quantity: 3, unit: 'g' },
        { ingredient: 'sunflower-oil', quantity: 30, unit: 'ml' },
        { ingredient: 'sesame-oil', quantity: 5, unit: 'ml', optional: true },
        { ingredient: 'rice', quantity: 150, unit: 'g' },
        {
          ingredient: 'still-water',
          key: 'rice-water',
          quantity: 0.3,
          unit: 'l',
          note: t('for cooking the rice', 'pentru fiertul orezului'),
        },
      ],
      steps: [
        {
          key: 'rice',
          text: t(
            'Rinse the rice until the water runs nearly clear. Put it in a small pot with the 300 ml of water, bring to a boil, then cover and cook on the lowest heat for 12 minutes. Take it off the heat and leave it covered while you cook the eggs and tomatoes.',
            'Spală orezul până când apa se limpezește aproape complet. Pune-l într-o oală mică cu cei 300 ml de apă, adu la fierbere, apoi acoperă și gătește la foc foarte mic 12 minute. Ia oala de pe foc și las-o acoperită cât gătești ouăle și roșiile.',
          ),
          timerSeconds: 720,
        },
        {
          key: 'prep',
          text: t(
            'Cut each tomato into 8 wedges. Beat the eggs in a bowl with 1 g of the salt until evenly yellow.',
            'Taie fiecare roșie în 8 felii late. Bate ouăle într-un bol cu 1 g din sare, până când amestecul are o culoare uniformă.',
          ),
        },
        {
          key: 'eggs',
          text: t(
            'Heat a wok over medium-high heat and add half of the oil. Pour in the eggs and let them puff for a few seconds, then push them gently into large curds. After about 40 seconds, while they are still soft and wet, tip them onto a plate.',
            'Încinge un wok la foc mediu spre mare și adaugă jumătate din ulei. Toarnă ouăle și lasă-le câteva secunde să se umfle, apoi împinge-le ușor în bucăți mari. După aproximativ 40 de secunde, când sunt încă moi și umede, mută-le pe o farfurie.',
          ),
          timerSeconds: 40,
        },
        {
          key: 'tomatoes',
          text: t(
            'Add the rest of the oil and the tomatoes with the sugar and the remaining 2 g of salt. Cook for about 4 minutes, pressing on the wedges with the spatula, until they have slumped and made a thick, glossy sauce.',
            'Adaugă restul uleiului și roșiile, cu zahărul și cei 2 g de sare rămași. Gătește aproximativ 4 minute, apăsând feliile cu spatula, până când se înmoaie și fac un sos gros și lucios.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'combine',
          text: t(
            'Return the eggs to the wok and fold gently for about 30 seconds, until the sauce coats them and no liquid egg is left. Take off the heat and stir in the sesame oil, if using, and half of the spring onion.',
            'Pune ouăle înapoi în wok și amestecă ușor aproximativ 30 de secunde, până când sosul le acoperă și nu mai rămâne ou lichid. Ia de pe foc și adaugă uleiul de susan, dacă folosești, și jumătate din ceapa verde.',
          ),
          timerSeconds: 30,
        },
        {
          key: 'serve',
          text: t(
            'Spoon the eggs and tomatoes over the rice and scatter the rest of the spring onion on top.',
            'Pune ouăle cu roșii peste orez și presară deasupra restul cepei verzi.',
          ),
        },
      ],
      tips: [
        t(
          'Beat the eggs and cut the tomatoes before you light the stove: once the wok is hot, the whole dish takes only a few minutes.',
          'Bate ouăle și taie roșiile înainte să aprinzi focul: odată ce wokul e încins, tot preparatul durează doar câteva minute.',
        ),
        t(
          'Take the eggs out while they are still soft. They cook a second time in the sauce, and eggs that are firm at this point end up rubbery.',
          'Scoate ouăle cât sunt încă moi. Se mai gătesc o dată în sos, iar dacă sunt ferme de pe acum, ies cauciucate.',
        ),
        t(
          'Use ripe, red tomatoes; pale ones make a sharp, thin sauce. The pinch of sugar is there to round the acidity, not to make it sweet.',
          'Folosește roșii bine coapte, de un roșu intens; cele palide dau un sos acru și subțire. Zahărul e acolo ca să rotunjească aciditatea, nu ca să îndulcească.',
        ),
      ],
      stepTips: [
        {
          step: 'tomatoes',
          text: t(
            'If the sauce is too thin, keep cooking with the heat high until it clings to a spoon; if it catches, add a splash of water.',
            'Dacă sosul e prea subțire, mai gătește-l la foc iute până se prinde de lingură; dacă începe să se lipească, adaugă un strop de apă.',
          ),
        },
      ],
      nutritionNote: t(
        'Eggs give protein and the tomatoes add some fibre. The only vegetable is the tomato, and the dish is otherwise egg, oil and white rice, so the oil and salt add up. Serve it with a green side for variety.',
        'Ouăle aduc proteine, iar roșiile ceva fibre. Singura legumă este roșia, iar în rest preparatul e făcut din ouă, ulei și orez alb, deci uleiul și sarea se adună. Servește-l cu o garnitură verde, pentru varietate.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t(
            'Quick-cooked Chinese cabbage',
            'Varză chinezească gătită rapid',
          ),
          reason: t(
            'A green side with garlic adds the fibre and freshness the soft eggs lack.',
            'O garnitură verde cu usturoi aduce fibrele și prospețimea care lipsesc ouălor moi.',
          ),
          principle: 'complement_flavour',
          ingredient: 'chinese-cabbage',
        },
        {
          kind: 'food',
          label: t('Cucumber', 'Castraveți'),
          reason: t(
            'Cold and crunchy slices contrast with the warm, soft eggs and saucy tomatoes.',
            'Feliile reci și crocante contrastează cu ouăle calde și moi și cu roșiile în sos.',
          ),
          principle: 'contrast_texture',
          ingredient: 'cucumber',
        },
        {
          kind: 'drink',
          label: t('Green tea', 'Ceai verde'),
          reason: t(
            'A light, slightly bitter tea cleans the palate after the rich eggs.',
            'Un ceai ușor, puțin amărui, curăță gura după ouăle bogate.',
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
            'Made from a few ingredients in under half an hour.',
            'Se face din puține ingrediente în mai puțin de o jumătate de oră.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Eggs give protein and the rice replaces energy.',
            'Ouăle dau proteine, iar orezul reface energia.',
          ),
        },
      ],
    },
    {
      slug: 'stir-fry-thai',
      cuisine: 'thai',
      hideBaseTips: [1],
      title: t(
        'Pad kra pao (holy basil stir-fry with pork)',
        'Pad kra pao (porc sotat cu busuioc sfânt)',
      ),
      servings: 2,
      prepMinutes: 15,
      cookMinutes: 19,
      difficulty: 'medium',
      lines: [
        { ingredient: 'minced-pork', quantity: 300, unit: 'g' },
        {
          ingredient: 'holy-basil',
          quantity: 40,
          unit: 'g',
          note: t(
            'leaves picked from the stems',
            'frunzele desprinse de pe tulpini',
          ),
        },
        {
          ingredient: 'garlic',
          quantity: 20,
          unit: 'g',
          note: t('about 5 cloves', 'aproximativ 5 căței'),
        },
        {
          ingredient: 'birds-eye-chilli',
          quantity: 4,
          unit: 'pcs',
          note: t(
            'use fewer for less heat',
            'mai puține, pentru mai puțină iuțeală',
          ),
        },
        { ingredient: 'oyster-sauce', quantity: 15, unit: 'ml' },
        { ingredient: 'soy-sauce', quantity: 10, unit: 'ml' },
        { ingredient: 'dark-soy-sauce', quantity: 5, unit: 'ml' },
        { ingredient: 'fish-sauce', quantity: 10, unit: 'ml' },
        { ingredient: 'sugar', quantity: 5, unit: 'g' },
        {
          ingredient: 'still-water',
          key: 'sauce-water',
          quantity: 0.03,
          unit: 'l',
          note: t('for the sauce', 'pentru sos'),
        },
        {
          ingredient: 'sunflower-oil',
          key: 'wok-oil',
          quantity: 30,
          unit: 'ml',
          note: t('for the pork', 'pentru porc'),
        },
        { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
        {
          ingredient: 'sunflower-oil',
          key: 'egg-oil',
          quantity: 40,
          unit: 'ml',
          note: t('for frying the eggs', 'pentru prăjitul ouălor'),
        },
        { ingredient: 'jasmine-rice', quantity: 150, unit: 'g' },
        {
          ingredient: 'still-water',
          key: 'rice-water',
          quantity: 0.25,
          unit: 'l',
          note: t('for cooking the rice', 'pentru fiertul orezului'),
        },
      ],
      steps: [
        {
          key: 'rice',
          text: t(
            'Rinse the jasmine rice until the water runs nearly clear. Put it in a small pot with the 250 ml of water, bring to a boil, then cover and cook on the lowest heat for 12 minutes. Take it off the heat and leave it covered.',
            'Spală orezul jasmine până când apa se limpezește aproape complet. Pune-l într-o oală mică cu cei 250 ml de apă, adu la fierbere, apoi acoperă și gătește la foc foarte mic 12 minute. Ia oala de pe foc și las-o acoperită.',
          ),
          timerSeconds: 720,
        },
        {
          key: 'paste',
          text: t(
            'Pound the garlic and chillies in a mortar to a coarse paste, or crush them with the flat of a knife and chop them very finely.',
            'Pisează usturoiul și ardeii iuți într-un mojar până obții o pastă grosieră sau zdrobește-le cu latul cuțitului și toacă-le foarte mărunt.',
          ),
        },
        {
          key: 'sauce',
          text: t(
            'Stir the oyster sauce, soy sauce, dark soy sauce, fish sauce, sugar and the 30 ml of water together in a small bowl until the sugar dissolves.',
            'Amestecă într-un bol mic sosul de stridii, sosul de soia, sosul de soia închis, sosul de pește, zahărul și cei 30 ml de apă, până se dizolvă zahărul.',
          ),
        },
        {
          key: 'eggs',
          text: t(
            'Heat the egg oil in a small frying pan over high heat until it shimmers. Crack in the eggs one at a time and fry for about 90 seconds, spooning hot oil over the whites, until they are puffed, bubbly and lacy brown at the edges. Lift each egg onto a plate.',
            'Încinge uleiul pentru ouă într-o tigaie mică la foc iute, până se încinge bine. Sparge ouăle pe rând și prăjește-le aproximativ 90 de secunde, turnând ulei fierbinte peste albușuri, până când se umflă, fac bășici și se rumenesc la margini, ca o dantelă. Pune fiecare ou pe o farfurie.',
          ),
          timerSeconds: 90,
        },
        {
          key: 'aromatics',
          text: t(
            'Heat a wok over the highest heat, add the wok oil and, when it shimmers, stir in the garlic and chilli paste for 10 seconds, until fragrant but not browned.',
            'Încinge un wok la foc maxim, adaugă uleiul pentru wok și, când se încinge bine, amestecă pasta de usturoi și ardei iute 10 secunde, până se simte aroma, fără să se rumenească.',
          ),
          timerSeconds: 10,
        },
        {
          key: 'pork',
          text: t(
            'Add the pork and break it up. Let it fry hard for about 4 minutes, tossing only every 30 seconds, until it is browned and crisp in places. Cut into a larger piece to check: there must be no pink left anywhere.',
            'Adaugă carnea de porc și sfărâm-o. Las-o să se prăjească puternic aproximativ 4 minute, amestecând doar la fiecare 30 de secunde, până când se rumenește și devine crocantă pe alocuri. Taie un bucățel mai mare ca să verifici: nu trebuie să mai rămână deloc roz.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'sauce-in',
          text: t(
            'Pour in the sauce and toss for about a minute, until it has reduced to a dark glaze clinging to the pork.',
            'Toarnă sosul și amestecă aproximativ un minut, până se reduce într-o glazură închisă la culoare, lipită de carne.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'basil',
          text: t(
            'Take the wok off the heat, add all the basil and fold for about 10 seconds, until the leaves just wilt. Spoon the rice onto the plates, add the pork and top each with an egg. Serve at once.',
            'Ia wokul de pe foc, adaugă tot busuiocul și amestecă aproximativ 10 secunde, până când frunzele abia se ofilesc. Pune orezul în farfurii, adaugă carnea și pune câte un ou deasupra. Servește imediat.',
          ),
          timerSeconds: 10,
        },
      ],
      tips: [
        t(
          'Add the basil off the heat. Cooking it longer dulls its peppery, clove-like scent and turns the leaves black.',
          'Adaugă busuiocul după ce iei wokul de pe foc. Dacă îl gătești mai mult, își pierde aroma piperată, de cuișoare, iar frunzele se înnegresc.',
        ),
        t(
          'Four chillies make this properly hot. Use two if you are unsure: the small fresh chillies and their seeds are fierce, and the heat cannot be taken back out.',
          'Cei patru ardei iuți fac preparatul cu adevărat picant. Pune doi dacă nu ești sigur: ardeii mici proaspeți și semințele lor sunt foarte iuți, iar iuțeala nu se mai poate scoate.',
        ),
        t(
          'Leftover pork keeps in the fridge for up to 2 days if cooled within an hour. Reheat it until steaming hot, with a fresh handful of basil.',
          'Carnea rămasă se păstrează la frigider cel mult 2 zile, dacă o răcești într-o oră. Reîncălzește-o până scoate aburi, cu o mână proaspătă de busuioc.',
        ),
      ],
      stepTips: [
        {
          step: 'pork',
          text: t(
            'Do not stir constantly: pork that sits against the hot metal browns and crisps, while pork that is always moving just steams grey.',
            'Nu amesteca încontinuu: carnea care stă pe metalul fierbinte se rumenește și devine crocantă, în timp ce cea mereu în mișcare se fierbe și rămâne cenușie.',
          ),
        },
        {
          step: 'eggs',
          text: t(
            'The yolk stays runny. If you cook for children, older people or anyone pregnant, fry the egg longer until the yolk is set.',
            'Gălbenușul rămâne curgător. Dacă gătești pentru copii, vârstnici sau gravide, prăjește oul mai mult, până când gălbenușul se întărește.',
          ),
        },
      ],
      nutritionNote: t(
        'Pork and egg give plenty of protein. The pork mince, the oil for frying the egg and the glaze add fat, and the oyster, soy and fish sauces make it salty. There are almost no vegetables, so serve it with a cucumber or a green side for fibre.',
        'Porcul și oul aduc multe proteine. Carnea tocată de porc, uleiul în care se prăjește oul și glazura adaugă grăsimi, iar sosurile de stridii, soia și pește îl fac sărat. Aproape nu are legume, așa că servește-l cu castraveți sau o garnitură verde pentru fibre.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Cucumber slices', 'Felii de castravete'),
          reason: t(
            'Cool and watery, they calm the chilli heat and the salty glaze.',
            'Reci și suculente, domolesc iuțeala ardeiului și glazura sărată.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'cucumber',
        },
        {
          kind: 'food',
          label: t(
            'Fish sauce with chillies (prik nam pla)',
            'Sos de pește cu ardei iute (prik nam pla)',
          ),
          reason: t(
            'The usual Thai table condiment: salty, sharp heat for those who want it hotter.',
            'Condimentul obișnuit de pe masa thailandeză: sărat, cu iuțeală ascuțită, pentru cine o vrea mai picantă.',
          ),
          principle: 'regional_tradition',
          ingredient: 'fish-sauce',
        },
        {
          kind: 'drink',
          label: t('Cold lager', 'Bere blondă rece'),
          reason: t(
            'Cold and light, it cools the chilli and cuts through the salty glaze.',
            'Rece și ușoară, răcorește iuțeala și taie din glazura sărată.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
        {
          kind: 'drink',
          label: t('Cold green tea', 'Ceai verde rece'),
          reason: t(
            'Chilled and unsweetened, it refreshes the mouth between hot bites.',
            'Rece și neîndulcit, înviorează gura între îmbucăturile iuți.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'green-tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Pork and egg give protein, and the jasmine rice replaces energy.',
            'Porcul și oul dau proteine, iar orezul jasmine reface energia.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'The chilli, the fried egg and the pork are heavy before sleep.',
            'Ardeiul iute, oul prăjit și carnea de porc cad greu înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'stir-fry-korean',
      cuisine: 'korean',
      hideBaseTips: [1],
      title: t(
        'Jeyuk bokkeum (spicy Korean pork stir-fry)',
        'Jeyuk bokkeum (porc picant coreean sotat)',
      ),
      servings: 4,
      prepMinutes: 75,
      cookMinutes: 21,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'pork-shoulder',
          quantity: 500,
          unit: 'g',
          note: t('sliced 2 to 3 mm thin', 'tăiată felii de 2-3 mm'),
        },
        { ingredient: 'gochujang', quantity: 40, unit: 'g' },
        { ingredient: 'gochugaru', quantity: 10, unit: 'g' },
        { ingredient: 'soy-sauce', quantity: 30, unit: 'ml' },
        { ingredient: 'sugar', quantity: 20, unit: 'g' },
        {
          ingredient: 'garlic',
          quantity: 20,
          unit: 'g',
          note: t(
            'about 5 cloves, grated',
            'aproximativ 5 căței, dați pe răzătoare',
          ),
        },
        {
          ingredient: 'ginger',
          quantity: 10,
          unit: 'g',
          note: t('grated', 'dat pe răzătoare'),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('large, sliced into half-moons', 'mare, tăiată în semiluni'),
        },
        {
          ingredient: 'spring-onion',
          quantity: 40,
          unit: 'g',
          note: t('cut into 4 cm lengths', 'tăiată în bucăți de 4 cm'),
        },
        { ingredient: 'sunflower-oil', quantity: 15, unit: 'ml' },
        { ingredient: 'sesame-oil', quantity: 10, unit: 'ml' },
        { ingredient: 'sesame-seeds', quantity: 5, unit: 'g' },
        { ingredient: 'sushi-rice', quantity: 300, unit: 'g' },
        {
          ingredient: 'still-water',
          key: 'rice-water',
          quantity: 0.36,
          unit: 'l',
          note: t('for cooking the rice', 'pentru fiertul orezului'),
        },
        {
          ingredient: 'lettuce',
          quantity: 1,
          unit: 'pcs',
          optional: true,
          note: t(
            'leaves separated, for wraps',
            'frunzele separate, pentru rulouri',
          ),
        },
      ],
      steps: [
        {
          key: 'slice',
          text: t(
            'Put the pork shoulder in the freezer for 30 minutes to firm up, then slice it across the grain as thin as you can, about 2 to 3 mm.',
            'Pune spata de porc 30 de minute la congelator ca să se întărească, apoi taie-o felii cât mai subțiri, aproximativ 2-3 mm, de-a curmezișul fibrelor.',
          ),
        },
        {
          key: 'marinade',
          text: t(
            'Mix the gochujang, gochugaru, soy sauce, sugar, garlic, ginger, pepper and half of the sesame oil in a large bowl. Add the pork and work the marinade in with your hands until every slice is coated. Cover and refrigerate for at least 30 minutes.',
            'Amestecă într-un bol mare gochujang, gochugaru, sosul de soia, zahărul, usturoiul, ghimbirul, piperul și jumătate din uleiul de susan. Adaugă carnea și masează-o cu mâinile, până când fiecare felie e acoperită de marinadă. Acoperă și ține la frigider cel puțin 30 de minute.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'rice',
          text: t(
            'Rinse the sushi rice until the water runs nearly clear. Put it in a pot with the 360 ml of water, bring to a boil, then cover and cook on the lowest heat for 12 minutes. Take it off the heat and leave it covered.',
            'Spală orezul pentru sushi până când apa se limpezește aproape complet. Pune-l într-o oală cu cei 360 ml de apă, adu la fierbere, apoi acoperă și gătește la foc foarte mic 12 minute. Ia oala de pe foc și las-o acoperită.',
          ),
          timerSeconds: 720,
        },
        {
          key: 'onion',
          text: t(
            'Heat the sunflower oil in a very large frying pan or wok over high heat. Cook the onion for 2 minutes, until it begins to soften at the edges.',
            'Încinge uleiul de floarea soarelui într-o tigaie foarte mare sau într-un wok, la foc iute. Gătește ceapa 2 minute, până începe să se înmoaie la margini.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'pork',
          text: t(
            'Add the pork with all its marinade, spread it out and leave it for a minute, then toss. Keep cooking for about 5 more minutes, until the slices are browned with sticky, charred edges. Cut into the thickest slice to check: it must be white-grey inside, with no pink.',
            'Adaugă carnea cu toată marinada, întinde-o și las-o un minut, apoi amestecă. Continuă să gătești încă aproximativ 5 minute, până când feliile se rumenesc, cu margini lipicioase și ușor arse. Taie cea mai groasă felie ca să verifici: în interior trebuie să fie alb-cenușie, fără roz.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'finish',
          text: t(
            'Add the spring onion and cook for 1 minute, until it just wilts. Take off the heat, drizzle with the rest of the sesame oil and scatter with the sesame seeds.',
            'Adaugă ceapa verde și gătește 1 minut, până se ofilește ușor. Ia de pe foc, stropește cu restul uleiului de susan și presară semințele de susan.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'serve',
          text: t(
            'Serve the pork with the rice and the lettuce leaves, if using. To eat, put a little rice and pork in a leaf, fold it up and eat it in one bite.',
            'Servește carnea cu orezul și, dacă folosești, cu frunzele de salată. Pentru a mânca, pune puțin orez și carne într-o frunză, împătură-o și mănâncă-o dintr-o îmbucătură.',
          ),
        },
      ],
      tips: [
        t(
          'The sugar and gochujang burn quickly. Keep the heat high but stay at the pan, and add a splash of water if the marinade starts to catch before the pork is cooked.',
          'Zahărul și gochujang se ard repede. Ține focul iute, dar nu pleca de lângă tigaie, și adaugă un strop de apă dacă marinada începe să se lipească înainte să se gătească carnea.',
        ),
        t(
          'Marinate overnight in the fridge for a deeper flavour, but never at room temperature. Cook all the marinade with the pork: never use it raw as a sauce.',
          'Marinează peste noapte la frigider pentru un gust mai profund, dar niciodată la temperatura camerei. Gătește toată marinada împreună cu carnea: nu o folosi niciodată crudă, ca sos.',
        ),
        t(
          'Leftovers keep in the fridge for up to 2 days if cooled within an hour. Reheat them until steaming hot.',
          'Resturile se păstrează la frigider cel mult 2 zile, dacă le răcești într-o oră. Reîncălzește-le până scot aburi.',
        ),
      ],
      stepTips: [
        {
          step: 'slice',
          text: t(
            'Slicing semi-frozen meat is much easier. Cutting across the grain keeps the thin slices tender.',
            'Carnea semi-înghețată se taie mult mai ușor. Tăiatul de-a curmezișul fibrelor păstrează feliile subțiri fragede.',
          ),
        },
        {
          step: 'pork',
          text: t(
            'Cook in two batches if your pan is smaller than 30 cm, otherwise the pork stews in its own liquid and does not char.',
            'Gătește în două reprize dacă tigaia are sub 30 cm, altfel carnea se fierbe în propriul suc și nu se rumenește.',
          ),
        },
      ],
      nutritionNote: t(
        'Pork shoulder gives plenty of protein but is a fatty cut, and the sugar in the marinade and the gochujang and soy add sweetness and a lot of salt. The lettuce wraps and onion add some fibre and freshness. The chilli can be hard on a sensitive stomach.',
        'Spata de porc dă multe proteine, dar este o bucată grasă, iar zahărul din marinadă, gochujang și soia adaugă dulce și multă sare. Salata și ceapa aduc ceva fibre și prospețime. Ardeiul iute poate fi greu de suportat pentru un stomac sensibil.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Kimchi', 'Kimchi'),
          reason: t(
            'The sour crunch cuts through the sweet, sticky, fatty pork.',
            'Acrul crocant taie din carnea de porc dulce, lipicioasă și grasă.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'kimchi',
        },
        {
          kind: 'food',
          label: t('Cucumber', 'Castraveți'),
          reason: t(
            'Cold, crisp slices cool the chilli and contrast with the sticky pork.',
            'Feliile reci și crocante domolesc iuțeala și contrastează cu carnea lipicioasă.',
          ),
          principle: 'contrast_texture',
          ingredient: 'cucumber',
        },
        {
          kind: 'drink',
          label: t('Cold lager', 'Bere blondă rece'),
          reason: t(
            'A familiar partner for Korean grilled and fried pork, it refreshes the mouth after the chilli.',
            'Un partener obișnuit pentru carnea de porc coreeană la grătar sau la tigaie, care înviorează gura după iuțeală.',
          ),
          principle: 'regional_tradition',
          ingredient: 'beer',
        },
        {
          kind: 'drink',
          label: t('Green tea', 'Ceai verde'),
          reason: t(
            'Slightly bitter, it balances the sticky sweet glaze.',
            'Ușor amărui, echilibrează glazura dulce și lipicioasă.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'green-tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Pork gives protein, and the rice replaces energy.',
            'Porcul dă proteine, iar orezul reface energia.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Chilli, salt and a fatty cut of pork are heavy before bed.',
            'Ardeiul iute, sarea și o bucată grasă de porc cad greu înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
