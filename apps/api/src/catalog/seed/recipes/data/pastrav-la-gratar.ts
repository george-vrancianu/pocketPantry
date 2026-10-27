import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Păstrăv la grătar base is whole trout grilled with a garlic sauce (mujdei).
// Each Variant is a full Recipe with its own lines, steps and guidance; the
// base's Recipe-level Tips are inherited unless a Variant hides them.
export const pastravLaGratar: BaseRecipeSeed = {
  slug: 'pastrav-la-gratar',
  title: t(
    'Grilled whole trout with garlic sauce (păstrăv la grătar)',
    'Păstrăv la grătar cu mujdei',
  ),
  servings: 4,
  prepMinutes: 20,
  cookMinutes: 35,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'trout',
      quantity: 1300,
      unit: 'g',
      note: t(
        '4 whole trout of about 325 g each, gutted',
        '4 păstrăvi întregi de circa 325 g fiecare, eviscerați',
      ),
    },
    {
      ingredient: 'salt',
      quantity: 8,
      unit: 'g',
      note: t('for the fish', 'pentru pește'),
    },
    { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
    {
      ingredient: 'parsley',
      quantity: 20,
      unit: 'g',
      note: t('sprigs', 'crenguțe'),
    },
    {
      ingredient: 'dill',
      quantity: 20,
      unit: 'g',
      note: t('sprigs', 'crenguțe'),
    },
    {
      ingredient: 'lemon',
      quantity: 2,
      unit: 'pcs',
      note: t(
        'one in 4 slices for the cavities, one in wedges to serve',
        'una tăiată în 4 felii pentru burta peștilor, una în sferturi, pentru servit',
      ),
    },
    {
      ingredient: 'sunflower-oil',
      quantity: 35,
      unit: 'ml',
      note: t(
        '30 ml for brushing the fish, about 5 ml for greasing the grill',
        '30 ml pentru uns peștii, circa 5 ml pentru uns grătarul',
      ),
    },
    { ingredient: 'garlic', quantity: 30, unit: 'g' },
    {
      ingredient: 'salt',
      key: 'salt-mujdei',
      quantity: 2,
      unit: 'g',
      note: t('for the garlic sauce', 'pentru mujdei'),
    },
    { ingredient: 'still-water', quantity: 0.04, unit: 'l' },
    {
      ingredient: 'sunflower-oil',
      key: 'sunflower-oil-mujdei',
      quantity: 20,
      unit: 'ml',
      note: t('for the garlic sauce', 'pentru mujdei'),
    },
  ],
  steps: [
    {
      key: 'mujdei',
      text: t(
        'Crush the garlic with the 2 g of salt in a mortar, or with the flat of a knife, to a smooth paste. Stir in the water, then the 20 ml of oil, and leave the garlic sauce aside.',
        'Pisează usturoiul cu cele 2 g de sare într-un mojar sau cu partea plată a cuțitului, până devine pastă fină. Amestecă cu apa, apoi cu cei 20 ml de ulei și lasă mujdeiul deoparte.',
      ),
    },
    {
      key: 'herbs-lemon',
      text: t(
        'Pick the parsley and dill into sprigs. Cut one lemon into 4 slices and the other into wedges.',
        'Desprinde crenguțele de pătrunjel și de mărar. Taie o lămâie în 4 felii subțiri și cealaltă în sferturi.',
      ),
    },
    {
      key: 'slash',
      text: t(
        'Pat the trout dry with paper towels, inside and out, without rinsing them. With a sharp knife, cut 3 slashes about 1 cm deep into each side.',
        'Șterge păstrăvii cu prosoape de hârtie, pe dinăuntru și pe dinafară, fără să îi speli. Cu un cuțit bine ascuțit, taie pe fiecare parte câte 3 tăieturi adânci de circa 1 cm.',
      ),
    },
    {
      key: 'season',
      text: t(
        'Sprinkle the 8 g of salt and the pepper over the fish, inside and out, and into the slashes. Fill each cavity with a few sprigs of parsley and dill and a slice of lemon.',
        'Presară cele 8 g de sare și piperul peste pești, pe dinăuntru, pe dinafară și în tăieturi. Pune în burta fiecăruia câteva crenguțe de pătrunjel și de mărar și o felie de lămâie.',
      ),
    },
    {
      key: 'oil',
      text: t(
        'Brush the fish all over with 30 ml of the oil (keep the rest for greasing the grill), and lay the oiled fish on a tray. Wash the board, the knife, the brush and your hands with hot soapy water.',
        'Unge peștii peste tot cu 30 ml din ulei (restul păstrează-l pentru uns grătarul) și așază-i unși pe o tavă. Spală tocătorul, cuțitul, pensula și mâinile cu apă fierbinte și detergent.',
      ),
    },
    {
      key: 'preheat',
      text: t(
        'Heat a large rectangular ridged grill pan, about 40 × 30 cm, which holds two trout side by side, over medium-high heat for 5 minutes, until a drop of water dances and disappears. Rub the ridges with a paper towel dipped in the oil and held in tongs. On a charcoal grill, heat the oiled hinged fish grill on the rack instead.',
        'Încinge o tigaie-grătar mare, dreptunghiulară, cu striații, de circa 40 × 30 cm, în care încap doi păstrăvi unul lângă altul, la foc mediu-mare timp de 5 minute, până când o picătură de apă dansează și dispare. Unge striațiile cu un prosop de hârtie înmuiat în ulei, ținut cu cleștele. La grătarul pe cărbuni, pune grătarul dublu pentru pește, uns cu ulei, să se încingă deasupra jarului.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'grill-first',
      text: t(
        'Lay the fish in the grill pan, two at a time, or all four in the hinged fish grill over the coals. If your pan holds only one trout, grill them one at a time, repeating the grilling steps for each fish and keeping the cooked ones under foil: the grilling then takes about 55 minutes instead of 35. Grill for about 6 minutes, without moving them, until the skin releases from the pan and chars in places.',
        'Pune peștii în tigaia-grătar, câte doi odată, sau pe toți patru în grătarul dublu pentru pește, deasupra jarului. Dacă în tigaie încape un singur păstrăv, gătește-i pe rând, repetând pașii pentru fiecare pește și ținându-i pe cei gătiți sub folie: gătitul durează atunci circa 55 de minute în loc de 35. Gătește circa 6 minute, fără să îi miști, până când pielea se desprinde de tigaie și se înnegrește pe alocuri.',
      ),
      timerSeconds: 360,
    },
    {
      key: 'grill-second',
      text: t(
        'Turn each fish once, gently, with a fish slice or by flipping the fish grill. Grill the second side for about 6 minutes. Once they are turned, wash your hands, the tongs or fish slice, and any plate or tray the raw fish sat on.',
        'Întoarce fiecare pește o singură dată, cu grijă, cu o spatulă lată sau răsucind grătarul dublu. Gătește a doua parte circa 6 minute. Imediat după ce i-ai întors, spală-te pe mâini și spală cleștii sau spatula și orice farfurie sau tavă pe care au stat peștii cruzi.',
      ),
      timerSeconds: 360,
    },
    {
      key: 'check',
      text: t(
        'Check the first fish: a thermometer in the thickest part by the spine should read 63 °C, the flesh should be opaque, and it should lift easily off the bone with a fork. If not, grill 1 to 2 minutes more and check again. Lift the cooked fish onto a clean warm platter, not the one the raw fish sat on, and cover it loosely with foil to keep it warm.',
        'Verifică primul pește: un termometru înfipt în partea cea mai groasă, lângă coloană, trebuie să arate 63 °C, carnea să fie opacă și să se desprindă ușor de os cu furculița. Dacă nu, mai ține-l 1-2 minute pe grătar și verifică din nou. Pune peștii gătiți pe un platou curat și cald, nu pe cel pe care au stat cei cruzi, și acoperă-i ușor cu folie ca să rămână calzi.',
      ),
    },
    {
      key: 'second-first',
      text: t(
        'Only if you used the pan: with the pan still hot, lay the other two fish in it. Grill for about 6 minutes, without moving them, until the skin releases from the pan and chars in places.',
        'Doar dacă ai folosit tigaia: cu tigaia încă fierbinte, pune în ea ceilalți doi pești. Gătește circa 6 minute, fără să îi miști, până când pielea se desprinde de tigaie și se înnegrește pe alocuri.',
      ),
      timerSeconds: 360,
    },
    {
      key: 'second-turn',
      text: t(
        'Turn the two fish once, gently, and grill the second side for about 6 minutes. Once they are turned, wash your hands, the tongs or fish slice, and the tray again.',
        'Întoarce cei doi pești o singură dată, cu grijă, și gătește a doua parte circa 6 minute. Imediat după ce i-ai întors, spală-te din nou pe mâini și spală cleștii sau spatula și tava.',
      ),
      timerSeconds: 360,
    },
    {
      key: 'second-check',
      text: t(
        'Check the first of these two fish the same way: 63 °C by the spine, opaque flesh that lifts off the bone. If not, grill 1 to 2 minutes more. Lift them with clean tongs or a clean fish slice onto the platter and re-cover it.',
        'Verifică primul dintre acești doi pești în același fel: 63 °C lângă coloană, carne opacă, care se desprinde de os. Dacă nu, mai ține-i 1-2 minute pe grătar. Scoate-i cu clești sau cu o spatulă curată pe platou și acoperă-l la loc.',
      ),
    },
    {
      key: 'serve',
      text: t(
        'Put a trout on each plate and spoon the garlic sauce over it or beside it. Add lemon wedges and serve straight away. Throw away the lemon slices from the cavities.',
        'Pune câte un păstrăv în farfurie și toarnă mujdeiul deasupra sau alături. Adaugă sferturi de lămâie și servește imediat. Aruncă feliile de lămâie din burta peștilor.',
      ),
    },
  ],
  tips: [
    t(
      'Buy trout that smell of clean water, with clear eyes and firm flesh, and cook them the day you buy them.',
      'Alege păstrăvi care miros a apă curată, cu ochi limpezi și carne fermă, și gătește-i în ziua în care îi cumperi.',
    ),
    t(
      'Do not move the fish until it releases from the grate or pan. Skin that sticks tears; skin that has finished searing lifts away on its own.',
      'Nu muta peștele până nu se desprinde singur de grătar sau de tigaie. Pielea care se lipește se rupe; cea rumenită bine se dezlipește singură.',
    ),
    t(
      'To eat the trout, run a knife along the spine, lift off the top fillet, then lift out the backbone with the tail in one piece. Most of the small bones come with it.',
      'Ca să mănânci păstrăvul, trage cuțitul de-a lungul coloanei, ridică filetul de sus, apoi scoate dintr-o bucată coloana împreună cu coada. Majoritatea oscioarelor vin odată cu ea.',
    ),
    t(
      'Leftover fish: cool it and put it in the fridge within 2 hours, eat it within 2 days, and reheat it until steaming hot.',
      'Peștele rămas: răcește-l și pune-l la frigider în maximum 2 ore, mănâncă-l în cel mult 2 zile și încălzește-l până scoate aburi.',
    ),
  ],
  stepTips: [
    {
      step: 'mujdei',
      text: t(
        'The salt grinds the garlic as you crush it, so you get a smooth paste with less effort. Make it shortly before serving, and keep any leftover in the fridge and use it within a day.',
        'Sarea macină usturoiul în timp ce îl pisezi, așa că ajungi mai ușor la o pastă fină. Fă-l cu puțin timp înainte de servit, iar ce rămâne păstrează la frigider și folosește în cel mult o zi.',
      ),
    },
    {
      step: 'slash',
      text: t(
        'The slashes let the heat reach the thick part by the spine and stop the skin from splitting as it cooks.',
        'Tăieturile lasă căldura să ajungă în partea groasă de lângă coloană și împiedică spargerea pielii în timpul gătitului.',
      ),
    },
    {
      step: 'preheat',
      text: t(
        'On charcoal, light the coals well ahead and wait until they are covered in grey ash before the fish goes on, or the skin sticks and chars before the inside cooks.',
        'La grătarul pe cărbuni, aprinde jarul din timp și așteaptă să se acopere cu cenușă cenușie înainte să pui peștii, altfel pielea se lipește și se arde înainte să se gătească miezul.',
      ),
    },
  ],
  nutritionNote: t(
    'Whole grilled trout gives plenty of protein for little added fat, and the oil used is mostly unsaturated. The salt in the fish and the garlic sauce adds up, so season to taste. Leave any skin that has burnt black, and expect the raw garlic sauce to be strong.',
    'Păstrăvul întreg la grătar oferă multe proteine cu puțină grăsime adăugată, iar uleiul folosit e în mare parte nesaturat. Sarea din pește și din mujdei se adună, așa că sărează după gust. Nu mânca pielea arsă neagră și ține cont că mujdeiul, din usturoi crud, e iute.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t(
        'Romanian white cabbage salad with dill (salată de varză)',
        'Salată de varză albă cu mărar',
      ),
      reason: t(
        'Crisp, vinegar-dressed cabbage freshens the palate between bites of charred fish and garlic sauce.',
        'Varza crocantă, asezonată cu oțet, împrospătează gustul între îmbucăturile de pește rumenit pe grătar și mujdei.',
      ),
      principle: 'cleanses_palate',
      recipe: 'coleslaw-romanian',
    },
    {
      kind: 'food',
      label: t('Boiled new potatoes', 'Cartofi noi fierți'),
      reason: t(
        'Soft, mild potatoes soak up the garlic sauce and calm its sharpness.',
        'Cartofii fierți, moi și blânzi, beau mujdeiul și îi domolesc iuțeala.',
      ),
      principle: 'complement_flavour',
      ingredient: 'potato',
    },
    {
      kind: 'food',
      label: t('Mămăligă (polenta-style cornmeal porridge)', 'Mămăligă'),
      reason: t(
        'Soft, plain cornmeal soaks up the garlic sauce and balances its sharpness.',
        'Mămăliga moale, simplă, absoarbe mujdeiul și îi domolește iuțeala.',
      ),
      principle: 'complement_flavour',
      ingredient: 'cornmeal',
    },
    {
      kind: 'drink',
      label: t('Dry white wine', 'Vin alb sec'),
      reason: t(
        'Its crisp acidity cleans the palate after the garlic and the grill flavour.',
        'Aciditatea lui proaspătă curăță gustul după usturoi și după gustul de grătar.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'white-wine',
    },
  ],
  eatingMoments: [
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'A lean, quick-cooking fish that fills you without feeling heavy.',
        'Un pește slab, care se gătește repede și te satură fără să te îngreuneze.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'good_for',
      reason: t(
        'Grilled outdoors with lemon and a crisp salad, it suits warm weather.',
        'Făcut la grătar afară, cu lămâie și o salată crocantă, se potrivește vremii calde.',
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
  variants: [
    {
      slug: 'pastrav-la-gratar-french',
      cuisine: 'french',
      title: t(
        'Truite aux amandes (French pan-fried trout with brown butter and almonds)',
        'Truite aux amandes (păstrăv la tigaie cu unt rumenit și migdale, ca în Franța)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 35,
      difficulty: 'easy',
      hideBaseTips: [1],
      lines: [
        {
          ingredient: 'trout',
          quantity: 1300,
          unit: 'g',
          note: t(
            '4 whole trout of about 325 g each, gutted',
            '4 păstrăvi întregi de circa 325 g fiecare, eviscerați',
          ),
        },
        { ingredient: 'salt', quantity: 6, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
        {
          ingredient: 'flour',
          quantity: 60,
          unit: 'g',
          note: t('for dusting', 'pentru tăvălit'),
        },
        {
          ingredient: 'sunflower-oil',
          quantity: 40,
          unit: 'ml',
          note: t('for frying', 'pentru prăjit'),
        },
        {
          ingredient: 'butter',
          quantity: 20,
          unit: 'g',
          note: t('for frying the fish', 'pentru prăjit peștele'),
        },
        {
          ingredient: 'butter',
          key: 'butter-almonds',
          quantity: 60,
          unit: 'g',
          note: t('for the almonds', 'pentru migdale'),
        },
        { ingredient: 'flaked-almonds', quantity: 40, unit: 'g' },
        {
          ingredient: 'lemon',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'one juiced, one cut in wedges',
            'una stoarsă, una tăiată în sferturi',
          ),
        },
        {
          ingredient: 'parsley',
          quantity: 15,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
      ],
      steps: [
        {
          key: 'lemon-parsley',
          text: t(
            'Squeeze the juice of one lemon into a small cup and cut the other into wedges. Chop the parsley finely.',
            'Stoarce sucul de la o lămâie într-o ceașcă mică și taie cealaltă în sferturi. Toacă mărunt pătrunjelul.',
          ),
        },
        {
          key: 'season',
          text: t(
            'Pat the trout dry with paper towels, inside and out, without rinsing them. Sprinkle the salt and pepper over them, inside and out. Put the flour on a long plate.',
            'Șterge păstrăvii cu prosoape de hârtie, pe dinăuntru și pe dinafară, fără să îi speli. Presară sare și piper pe dinăuntru și pe dinafară. Pune făina pe o farfurie lungă.',
          ),
        },
        {
          key: 'heat',
          text: t(
            'Use two frying pans about 28 cm across, side by side, one per trout. Put 10 ml of the oil and 5 g of the frying butter in each over medium heat for about 2 minutes, until the butter foams and the foam starts to die down. With only one pan, fry one trout at a time and repeat the frying steps for each fish: the dish then takes about 50 minutes instead of 35.',
            'Folosește două tigăi de circa 28 cm, puse alături, câte una pentru fiecare păstrăv. Pune în fiecare 10 ml din ulei și 5 g din untul pentru prăjit, la foc mediu, circa 2 minute, până când untul face spumă și spuma începe să se așeze. Dacă ai o singură tigaie, prăjește câte un păstrăv și repetă pașii de prăjit pentru fiecare pește: preparatul durează atunci circa 50 de minute în loc de 35.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'dust-fry',
          text: t(
            'Roll two trout in the flour, shake off the extra, and lay one in each pan right away. Fry for about 5 minutes without moving them, until the skin is golden. Turn the fish once, then wash your hands and the tongs.',
            'Tăvălește doi păstrăvi prin făină, scutură surplusul și pune imediat câte unul în fiecare tigaie. Prăjește-i circa 5 minute, fără să îi miști, până când pielea devine aurie. Întoarce peștii o singură dată, apoi spală-te pe mâini și spală cleștii.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'fry-second',
          text: t(
            'Fry the second side for about 5 minutes, until golden.',
            'Prăjește a doua parte circa 5 minute, până devine aurie.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'check',
          text: t(
            'Check the first fish: a thermometer in the thickest part by the spine should read 63 °C, the flesh should be opaque, and it should lift easily off the bone with a fork. If not, fry 1 to 2 minutes more. Lift the cooked fish with clean tongs or a fish slice onto a clean plate, not the one the raw fish sat on, and cover it loosely with foil.',
            'Verifică primul pește: un termometru înfipt în partea cea mai groasă, lângă coloană, trebuie să arate 63 °C, carnea să fie opacă și să se desprindă ușor de os cu furculița. Dacă nu, mai prăjește-l 1-2 minute. Scoate peștii gătiți cu clești sau cu o spatulă curată pe o farfurie curată, nu pe cea pe care au stat cei cruzi, și acoperă-i ușor cu folie.',
          ),
        },
        {
          key: 'second-heat',
          text: t(
            'Take the pans off the heat and wipe them with a folded paper towel held in tongs. Return them to medium heat with the remaining oil and butter, 10 ml and 5 g in each, for 1 minute.',
            'Ia tigăile de pe foc și șterge-le cu un prosop de hârtie împăturit, ținut cu cleștele. Pune-le înapoi la foc mediu cu restul de ulei și de unt, câte 10 ml și 5 g în fiecare, pentru 1 minut.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'second-fry',
          text: t(
            'Roll the other two trout in the flour, shake off the extra, and lay one in each pan right away. Fry for about 5 minutes without moving them, until the skin is golden.',
            'Tăvălește ceilalți doi păstrăvi prin făină, scutură surplusul și pune imediat câte unul în fiecare tigaie. Prăjește-i circa 5 minute, fără să îi miști, până când pielea devine aurie.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'second-turn',
          text: t(
            'Turn the fish once and fry the second side for about 5 minutes, until golden. After turning them, wash your hands and the tongs. Throw away the leftover flour, and wash the flour plate and the plate the raw fish sat on.',
            'Întoarce peștii o singură dată și prăjește a doua parte circa 5 minute, până devine aurie. După ce i-ai întors, spală-te pe mâini și spală cleștii. Aruncă făina rămasă și spală farfuria de făină și farfuria pe care au stat peștii cruzi.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'second-check',
          text: t(
            'Check the first of these two fish the same way: 63 °C by the spine, opaque flesh that lifts off the bone. If not, fry 1 to 2 minutes more. Lift them with clean tongs or a fish slice onto the plate with the others and re-cover it.',
            'Verifică primul dintre acești doi pești în același fel: 63 °C lângă coloană, carne opacă, care se desprinde de os. Dacă nu, mai prăjește-i 1-2 minute. Scoate-i cu clești sau cu o spatulă curată pe farfuria cu ceilalți și acoperă-o la loc.',
          ),
        },
        {
          key: 'almonds',
          text: t(
            'Take the pan off the heat and wipe the burnt flour out with a folded paper towel held in tongs. Over medium heat, melt the 60 g of butter with the almonds and stir for about 3 minutes, until the almonds are golden and the butter smells nutty and has brown flecks. Take the pan off the heat at once.',
            'Ia tigaia de pe foc și șterge făina arsă cu un prosop de hârtie împăturit, ținut cu cleștele. La foc mediu, topește cei 60 g de unt cu migdalele și amestecă circa 3 minute, până când migdalele devin aurii, iar untul miroase a alune și are mici particule maronii pe fund. Ia imediat tigaia de pe foc.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'finish',
          text: t(
            'Stir in the lemon juice, which will sizzle, and the parsley. Put a trout on each plate, spoon the almond butter over it, and serve with the lemon wedges.',
            'Adaugă sucul de lămâie, care va sfârâi, și pătrunjelul. Pune câte un păstrăv în farfurie, toarnă deasupra untul cu migdale și servește cu sferturile de lămâie.',
          ),
        },
      ],
      tips: [
        t(
          'Butter goes from brown to bitter in seconds. Take the pan off the heat as soon as it smells of hazelnuts, because the pan stays hot enough to keep browning it.',
          'Untul trece de la brun la amar în câteva secunde. Ia tigaia de pe foc imediat ce miroase a alune, pentru că rămâne destul de fierbinte ca să continue să-l rumenească.',
        ),
        t(
          'This dish contains fish, almonds (tree nuts), gluten and milk. Tell guests before serving.',
          'Preparatul conține pește, migdale (fructe cu coajă lemnoasă), gluten și lapte. Spune-le oaspeților înainte de a servi.',
        ),
      ],
      stepTips: [
        {
          step: 'dust-fry',
          text: t(
            'Flour the fish only when the pan is ready: left to sit, the flour turns pasty and the coating comes away.',
            'Tăvălește peștii prin făină abia când tigaia e gata: dacă stau, făina se face păstoasă și crusta se desprinde.',
          ),
        },
        {
          step: 'almonds',
          text: t(
            'Wiping the pan first stops the leftover flour from burning in the butter and turning it bitter.',
            'Ștergerea tigăii mai întâi împiedică făina rămasă să se ardă în unt și să-l facă amar.',
          ),
        },
      ],
      nutritionNote: t(
        'Trout gives plenty of protein, and the almonds add crunch and mostly unsaturated fat. Frying in butter and finishing with more butter adds saturated fat, and the flour coating adds a little refined carbohydrate, so use the butter measured and serve it with vegetables.',
        'Păstrăvul oferă multe proteine, iar migdalele adaugă crocant și grăsimi în mare parte nesaturate. Prăjitul în unt și finisarea cu și mai mult unt aduc grăsimi saturate, iar făina adaugă puțini carbohidrați rafinați, așa că măsoară untul și servește cu legume.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Boiled parsley potatoes', 'Cartofi fierți cu pătrunjel'),
          reason: t(
            'Mild potatoes soak up the brown butter and make the plate more filling.',
            'Cartofii fierți, blânzi, absorb untul rumenit și fac farfuria mai săturătoare.',
          ),
          principle: 'complement_flavour',
          ingredient: 'potato',
        },
        {
          kind: 'food',
          label: t('Steamed green beans', 'Fasole verde la aburi'),
          reason: t(
            'Crisp-tender beans give a fresh, firm contrast to the soft fish and rich butter.',
            'Fasolea verde fragedă, dar crocantă, face un contrast proaspăt cu peștele moale și cu untul bogat.',
          ),
          principle: 'contrast_texture',
          ingredient: 'green-beans',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its acidity cuts through the brown butter and keeps the fish tasting light.',
            'Aciditatea lui taie din bogăția untului rumenit și păstrează peștele ușor la gust.',
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
            'Quick to cook, and light on the plate when served with beans or a salad.',
            'Se face repede și e ușor în farfurie, servit cu fasole sau cu o salată.',
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
    {
      slug: 'pastrav-la-gratar-german',
      cuisine: 'german',
      title: t(
        'Forelle blau (German poached blue trout with melted butter)',
        'Forelle blau (păstrăv albastru fiert încet, cu unt topit, ca în Germania)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 50,
      difficulty: 'medium',
      hideBaseTips: [1],
      lines: [
        {
          ingredient: 'trout',
          quantity: 1300,
          unit: 'g',
          note: t(
            '4 very fresh whole trout of about 325 g each, gutted but not scaled or rinsed',
            '4 păstrăvi întregi foarte proaspeți, de circa 325 g fiecare, eviscerați, dar nespălați și nedesolziți',
          ),
        },
        {
          ingredient: 'still-water',
          quantity: 3,
          unit: 'l',
          note: t('for the court-bouillon', 'pentru zeama aromată'),
        },
        {
          ingredient: 'vinegar',
          quantity: 300,
          unit: 'ml',
          note: t('for the court-bouillon', 'pentru zeama aromată'),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('sliced', 'tăiată în felii'),
        },
        {
          ingredient: 'carrot',
          quantity: 100,
          unit: 'g',
          note: t('sliced', 'tăiat în rondele'),
        },
        { ingredient: 'bay-leaves', quantity: 0.4, unit: 'g' },
        { ingredient: 'peppercorns', quantity: 3, unit: 'g' },
        {
          ingredient: 'salt',
          quantity: 30,
          unit: 'g',
          note: t('for the court-bouillon', 'pentru zeama aromată'),
        },
        {
          ingredient: 'vinegar',
          key: 'vinegar-fish',
          quantity: 100,
          unit: 'ml',
          note: t('to pour over the fish', 'de turnat peste pești'),
        },
        {
          ingredient: 'potato',
          quantity: 1,
          unit: 'kg',
          note: t('scrubbed', 'curățați cu peria'),
        },
        {
          ingredient: 'still-water',
          key: 'still-water-potatoes',
          quantity: 1.5,
          unit: 'l',
          note: t('for the potatoes', 'pentru cartofi'),
        },
        {
          ingredient: 'salt',
          key: 'salt-potatoes',
          quantity: 10,
          unit: 'g',
          note: t('for the potatoes', 'pentru cartofi'),
        },
        { ingredient: 'butter', quantity: 120, unit: 'g' },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t('cut in wedges', 'tăiată în sferturi'),
        },
        {
          ingredient: 'parsley',
          quantity: 15,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'horseradish',
          quantity: 40,
          unit: 'g',
          note: t(
            'grated, from a jar or fresh root',
            'ras, din borcan sau din rădăcină proaspătă',
          ),
        },
      ],
      steps: [
        {
          key: 'prep',
          text: t(
            'Slice the onion and carrot, chop the parsley and cut the lemon into wedges. Do this before touching the fish.',
            'Taie ceapa în felii și morcovul în rondele, toacă pătrunjelul și taie lămâia în sferturi. Fă toate acestea înainte să atingi peștii.',
          ),
        },
        {
          key: 'court-bouillon',
          text: t(
            'In a fish kettle or a deep oval roasting tin about 35 cm long (set over two burners) that holds two trout lying flat, put the 3 l of water, 300 ml of vinegar, onion, carrot, bay leaves, peppercorns and 30 g of salt. Bring to the boil, then simmer for 10 minutes.',
            'Într-un vas pentru pește sau într-o tavă adâncă, ovală, de circa 35 cm lungime (pusă pe două ochiuri), în care încap doi păstrăvi întinși, pune cei 3 l de apă, 300 ml de oțet, ceapa, morcovul, foile de dafin, boabele de piper și 30 g de sare. Adu la fierbere, apoi lasă să fiarbă încet 10 minute.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'potatoes',
          text: t(
            'Once the court-bouillon simmers, put the potatoes in a second pot with the 1.5 l of cold water and 10 g of salt. Bring to the boil, then simmer for about 20 minutes, until a knife slides in easily.',
            'Când zeama aromată fierbe încet, pune cartofii într-o a doua oală, cu cei 1,5 l de apă rece și 10 g de sare. Adu la fierbere, apoi lasă să fiarbă încet circa 20 de minute, până când un cuțit intră ușor în ei.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'vinegar-splash',
          text: t(
            'Open a window or turn on the extractor, then heat the 100 ml of vinegar in a small pan until steaming. Lay the four trout on a tray, handling them as little as possible and never wiping them, and pour the hot vinegar over them. The skin may turn blue. Wash your hands.',
            'Deschide fereastra sau pornește hota, apoi încălzește cei 100 ml de oțet într-o cratiță mică, până scoate aburi. Pune cei patru păstrăvi pe o tavă, atingându-i cât mai puțin și fără să îi ștergi, și toarnă oțetul fierbinte peste ei. Pielea poate deveni albăstruie. Spală-te pe mâini.',
          ),
        },
        {
          key: 'poach-first',
          text: t(
            'Turn the court-bouillon down until the surface barely trembles and no bubbles break. Lower two trout in gently with a fish slice. The liquid must cover them by about 1 cm; if it does not, top up with boiling water. Poach for 10 minutes, until the eye turns white and the fish passes the doneness check.',
            'Dă focul mai mic, până când suprafața abia se mișcă și nu se sparg bule. Lasă să alunece ușor doi păstrăvi în lichid, cu o spatulă lată. Lichidul trebuie să-i acopere cu circa 1 cm; dacă nu, completează cu apă clocotită. Fierbe-i încet 10 minute, până când ochiul devine alb și peștele trece verificarea de gătire.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'check',
          text: t(
            'Check the first fish: a thermometer in the thickest part by the spine should read 63 °C, the flesh should be opaque, and it should lift easily off the bone with a fork. If not, poach 1 to 2 minutes more. Lift the cooked fish with a second, clean fish slice onto a warm plate, not the tray the raw fish sat on, and cover it.',
            'Verifică primul pește: un termometru înfipt în partea cea mai groasă, lângă coloană, trebuie să arate 63 °C, carnea să fie opacă și să se desprindă ușor de os cu furculița. Dacă nu, mai fierbe-l încet 1-2 minute. Scoate peștii gătiți cu o a doua spatulă lată, curată, pe o farfurie caldă, nu pe tava pe care au stat cei cruzi, și acoperă-i.',
          ),
        },
        {
          key: 'poach-second',
          text: t(
            'Keep the court-bouillon barely trembling and lower in the other two trout. Poach for 10 minutes, then check the first of them the same way. Wash your hands, the first fish slice and the tray the raw fish sat on.',
            'Ține zeama la foc mic, abia tremurând, și introdu ceilalți doi păstrăvi. Fierbe-i încet 10 minute, apoi verifică primul în același fel. Spală-te pe mâini și spală prima spatulă și tava pe care au stat peștii cruzi.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'butter',
          text: t(
            'While the second pair poaches, drain the potatoes and keep them covered. Melt the butter in a small pan over low heat for about 2 minutes, until fully melted but not browned.',
            'În timp ce al doilea rând de pești fierbe, scurge cartofii și ține-i acoperiți. Topește untul într-o cratiță mică, la foc mic, circa 2 minute, până se topește de tot, fără să se rumenească.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'serve',
          text: t(
            'Lift each fish onto a warm plate. Spoon over the melted butter and sprinkle with parsley. Serve at once with the potatoes, lemon wedges and horseradish.',
            'Pune fiecare pește pe o farfurie caldă. Toarnă deasupra untul topit și presară pătrunjel. Servește imediat cu cartofii, sferturile de lămâie și hreanul.',
          ),
        },
      ],
      tips: [
        t(
          'The blue comes from the slime on the skin, so it shows only on very fresh trout that are never rinsed, scrubbed or scaled. If the colour is pale, the dish still tastes right.',
          'Albastrul vine din mucusul de pe piele, așa că apare doar la păstrăvi foarte proaspeți, care nu sunt spălați, frecați sau desolziți. Dacă culoarea e palidă, preparatul are totuși gustul potrivit.',
        ),
        t(
          'Never let the court-bouillon boil hard. Rolling bubbles split the skin and dry the flesh.',
          'Nu lăsa zeama aromată să dea în clocot. Clocotul sparge pielea și usucă carnea.',
        ),
      ],
      stepTips: [
        {
          step: 'vinegar-splash',
          text: t(
            'The vinegar fumes are sharp, so keep a window open or the extractor on, and keep your face away from the pan.',
            'Aburii de oțet sunt înțepători, așa că ține fereastra deschisă sau hota pornită și ține fața departe de cratiță.',
          ),
        },
      ],
      nutritionNote: t(
        'Poaching adds no fat, so the trout stays a lean source of protein and the potatoes add carbohydrate. The melted butter is the main source of saturated fat, so use less if you like. Horseradish adds sharpness; the salt in the court-bouillon mostly stays in the liquid, but any salted butter or table salt adds up.',
        'Fierberea nu adaugă grăsime, așa că păstrăvul rămâne o sursă slabă de proteine, iar cartofii aduc carbohidrați. Untul topit e principala sursă de grăsimi saturate, așa că folosește mai puțin dacă vrei. Hreanul adaugă iuțeală; sarea din zeama aromată rămâne în cea mai mare parte în lichid, dar sarea de la masă sau untul sărat se adună.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its acidity cuts through the melted butter and suits the delicate fish.',
            'Aciditatea lui taie din bogăția untului topit și se potrivește cu peștele delicat.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'white-wine',
        },
        {
          kind: 'food',
          label: t('Cucumber salad', 'Salată de castraveți'),
          reason: t(
            'Cool, crisp cucumber freshens the palate between bites of buttery fish.',
            'Castravetele rece și crocant împrospătează gustul între îmbucăturile de pește cu unt.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'cucumber',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Gentle poaching keeps the fish light.',
            'Fierberea blândă păstrează peștele ușor.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Hot potatoes with melted butter and sharp horseradish warm you through.',
            'Cartofii fierbinți cu unt topit și hrean iute te încălzesc.',
          ),
        },
      ],
    },
  ],
};
