import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Sarmale base is the Romanian festive cabbage roll: soured cabbage leaves
// around a pork and rice filling, simmered for hours with smoked pork. Each
// Variant is a full Recipe with its own lines, steps and guidance; the base's
// Recipe-level Tips are inherited unless hidden.
export const sarmale: BaseRecipeSeed = {
  slug: 'sarmale',
  title: t('Sarmale (Romanian cabbage rolls)', 'Sarmale'),
  servings: 8,
  prepMinutes: 90,
  cookMinutes: 210,
  difficulty: 'hard',
  lines: [
    {
      ingredient: 'sauerkraut',
      key: 'sauerkraut-leaves',
      quantity: 1000,
      unit: 'g',
      note: t('whole soured cabbage leaves', 'frunze întregi de varză murată'),
    },
    {
      ingredient: 'sauerkraut',
      key: 'sauerkraut-shredded',
      quantity: 500,
      unit: 'g',
      note: t('shredded, for the pot', 'tocată, pentru oală'),
    },
    { ingredient: 'minced-pork', quantity: 1000, unit: 'g' },
    {
      ingredient: 'round-rice',
      quantity: 150,
      unit: 'g',
      note: t('rinsed', 'spălat'),
    },
    {
      ingredient: 'onion',
      quantity: 3,
      unit: 'pcs',
      note: t('finely chopped', 'tocate mărunt'),
    },
    { ingredient: 'sunflower-oil', quantity: 80, unit: 'ml' },
    {
      ingredient: 'dill',
      quantity: 30,
      unit: 'g',
      note: t('finely chopped', 'tocat mărunt'),
    },
    { ingredient: 'savory', quantity: 3, unit: 'g' },
    { ingredient: 'paprika', quantity: 5, unit: 'g' },
    {
      ingredient: 'sarmale-seasoning',
      quantity: 5,
      unit: 'g',
      optional: true,
    },
    { ingredient: 'tomato-paste', quantity: 100, unit: 'g' },
    {
      ingredient: 'bacon',
      quantity: 250,
      unit: 'g',
      note: t(
        'smoked, in a thick piece or slices',
        'costiță afumată, bucată groasă sau felii',
      ),
    },
    {
      ingredient: 'smoked-pork',
      quantity: 300,
      unit: 'g',
      optional: true,
      note: t('in chunks', 'tăiată bucăți'),
    },
    { ingredient: 'bay-leaves', quantity: 1, unit: 'g' },
    { ingredient: 'still-water', quantity: 1, unit: 'l' },
    { ingredient: 'salt', quantity: 8, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 3, unit: 'g' },
    {
      ingredient: 'sour-cream',
      quantity: 300,
      unit: 'g',
      optional: true,
      note: t('to serve', 'pentru servit'),
    },
    {
      ingredient: 'cornmeal',
      quantity: 300,
      unit: 'g',
      optional: true,
      note: t('for the mămăligă', 'pentru mămăligă'),
    },
    {
      ingredient: 'still-water',
      key: 'water-mamaliga',
      quantity: 1.2,
      unit: 'l',
      optional: true,
      note: t('for the mămăligă', 'pentru mămăligă'),
    },
    {
      ingredient: 'hot-pepper',
      quantity: 8,
      unit: 'pcs',
      optional: true,
      note: t('to serve', 'pentru servit'),
    },
  ],
  steps: [
    {
      key: 'leaves',
      text: t(
        'Separate the soured cabbage leaves and taste one. If it is very sour or salty, soak all the leaves in cold water for 30 minutes and drain. Cut away the thick rib at the base of each leaf, and halve any leaf bigger than your hand.',
        'Desprinde frunzele de varză murată și gustă una. Dacă e foarte acră sau sărată, ține toate frunzele 30 de minute în apă rece și scurge-le. Taie nervura groasă de la baza fiecărei frunze și împarte în două frunzele mai mari decât palma.',
      ),
    },
    {
      key: 'soften-onion',
      text: t(
        'Warm 50 ml of the oil in a pan over medium heat. Cook the onions for about 8 minutes, stirring, until soft and glassy but not browned. Let them cool completely.',
        'Încinge 50 ml din ulei într-o tigaie la foc mediu. Călește ceapa cam 8 minute, amestecând, până devine moale și sticloasă, fără să se rumenească. Las-o să se răcească complet.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'filling',
      text: t(
        'In a large bowl mix the minced pork, the cooled onions, the rinsed rice, half of the dill, the savory (cimbru), paprika, seasoning if using, salt, pepper and 3 tablespoons of the tomato paste. Knead with your hands for a minute until evenly combined.',
        'Într-un bol mare amestecă carnea tocată, ceapa răcită, orezul spălat, jumătate din mărar, cimbrul de grădină, boiaua, condimentul pentru sarmale (dacă îl folosești), sare, piper și 3 linguri de pastă de roșii. Frământă cu mâna un minut, până se omogenizează.',
      ),
    },
    {
      key: 'roll',
      text: t(
        'Place a heaped tablespoon of filling near the base of a leaf, fold the base over it, fold in the sides, and roll up loosely, like a small cigar. Roll all the leaves, keeping the filling loose.',
        'Pune o lingură cu vârf de umplutură spre baza unei frunze, îndoaie baza peste ea, îndoaie laturile și rulează lejer, ca un trabuc mic. Rulează toate frunzele, fără să strângi umplutura.',
      ),
    },
    {
      key: 'layer',
      text: t(
        'Spread half of the shredded cabbage over the bottom of a large heavy pot. Add the 5 bay leaves and half of the bacon and smoked pork (if using). Pack in the rolls snugly, seam side down, in tight layers, tucking the rest of the bacon and smoked pork between them.',
        'Întinde jumătate din varza tocată pe fundul unei oale grele, mari. Adaugă cele 5 foi de dafin și jumătate din costiță și din afumătură (dacă folosești). Așază sarmalele strâns, cu marginea în jos, în straturi dese, iar restul de costiță și afumătură pune-l printre ele.',
      ),
    },
    {
      key: 'sauce',
      text: t(
        'Cover with the remaining shredded cabbage and the rest of the dill. Dissolve the remaining tomato paste and the 30 ml of oil in the water, pour it over, and add a plate on top to keep the rolls under the liquid. Add more water if the plate does not sit just below the surface.',
        'Acoperă cu restul de varză tocată și cu restul de mărar. Dizolvă restul de pastă de roșii și cei 30 ml de ulei în apă, toarnă peste sarmale și pune deasupra o farfurie, ca rulourile să rămână sub lichid. Completează cu apă dacă farfuria nu stă chiar sub nivelul lichidului.',
      ),
    },
    {
      key: 'simmer',
      text: t(
        'Bring to a boil, then cover and simmer on the lowest heat for 2 hours. The liquid should barely tremble, not boil hard.',
        'Adu la fierbere, apoi acoperă și fierbe la foc foarte mic 2 ore. Lichidul trebuie să tremure ușor, nu să bolborosească tare.',
      ),
      timerSeconds: 7200,
    },
    {
      key: 'finish',
      text: t(
        'Lift one roll out and cut it open: the filling must be firm and cooked through with no raw, pink meat, the juices clear and the rice soft. If not, simmer another 30 minutes. Switch off the heat and leave the pot covered for at least 20 minutes.',
        'Scoate o sarma și taie-o: umplutura trebuie să fie fermă și gătită în tot centrul, fără carne crudă, roz, cu zeama limpede și orezul moale. Dacă nu, mai fierbe 30 de minute. Oprește focul și lasă oala acoperită cel puțin 20 de minute.',
      ),
      timerSeconds: 1200,
    },
    {
      key: 'mamaliga',
      text: t(
        'For the mămăligă, bring the water with a pinch of salt to a boil. Rain in the cornmeal in a thin stream, stirring, then cook on low heat for about 25 minutes, stirring often, until it pulls away from the pot.',
        'Pentru mămăligă, fierbe apa cu un praf de sare. Toarnă mălaiul în ploaie subțire, amestecând, apoi fierbe la foc mic cam 25 de minute, amestecând des, până se desprinde de pe pereții oalei.',
      ),
      timerSeconds: 1500,
    },
    {
      key: 'serve',
      text: t(
        'Serve four or five sarmale per person with a ladle of the pot liquid, a spoon of sour cream and a slice of mămăligă, with hot peppers on the table.',
        'Servește patru-cinci sarmale de persoană, cu un polonic din zeama din oală, o lingură de smântână și o felie de mămăligă, cu ardei iute pe masă.',
      ),
    },
  ],
  tips: [
    t(
      'Sarmale are better the next day. Cool them quickly and refrigerate within 2 hours, splitting the pot into smaller containers; reheat gently until piping hot all through. They also freeze well.',
      'Sarmalele sunt mai bune a doua zi. Răcește-le repede și pune-le la frigider în maximum 2 ore, împărțite în recipiente mai mici; încălzește-le încet, până fierb bine în tot centrul. Se pot și congela.',
    ),
    t(
      'Fill each leaf loosely: the rice roughly doubles as it cooks, and tight rolls burst or turn out dense. If you would rather not watch the pot, cook it covered in a 160 C oven for the same time.',
      'Umple fiecare frunză lejer: orezul aproape că își dublează volumul la fiert, iar rulourile strânse crapă sau ies compacte. Dacă nu vrei să stai lângă oală, o poți găti acoperită, la cuptor la 160 C, același timp.',
    ),
    t(
      'Taste the soured leaves before you start. The pot liquid reduces, so salty leaves can make the whole pot too salty; soak them first and add little or no extra salt.',
      'Gustă frunzele murate înainte să începi. Zeama din oală scade, iar frunzele sărate pot săra prea tare toată mâncarea; ține-le întâi în apă și pune puțină sare sau deloc.',
    ),
  ],
  stepTips: [
    {
      step: 'layer',
      text: t(
        'Putting cabbage and smoked pork under the rolls stops them from scorching on the bottom and flavours the liquid.',
        'Varza și afumătura de sub rulouri le împiedică să se prindă de fund și dau gust zemii.',
      ),
    },
    {
      step: 'simmer',
      text: t(
        'Do not stir the pot once it is simmering; shake it gently by the handles if you worry about sticking.',
        'Nu amesteca în oală după ce a început să fiarbă; dacă te temi că se prind, scutur-o ușor de mânere.',
      ),
    },
  ],
  nutritionNote: t(
    'Filling and rich in protein, with cabbage adding fibre. The smoked pork, bacon and sour cream bring a lot of salt and saturated fat, and soured cabbage is salty too, so it suits a festive meal rather than an everyday one. Leaner meat and less bacon lighten it.',
    'Sățioase și bogate în proteine, iar varza adaugă fibre. Afumătura, costița și smântâna aduc multă sare și grăsimi saturate, iar varza murată e și ea sărată, așa că se potrivesc la masa de sărbătoare, nu zilnic. Carnea mai slabă și mai puțină costiță le fac mai ușoare.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Romanian cold appetizer platter', 'Platou rece românesc'),
      reason: t(
        'The festive Romanian table opens with the cold platter before the sarmale arrive.',
        'Masa festivă românească începe cu platoul rece, înainte să ajungă sarmalele.',
      ),
      principle: 'regional_tradition',
      recipe: 'appetizer-platter-romanian',
    },
    {
      kind: 'food',
      label: t('Mămăligă', 'Mămăligă'),
      reason: t(
        'Soft boiled cornmeal soaks up the tomato and cabbage liquid and tones down the sourness.',
        'Mălaiul fiert absoarbe zeama de roșii și varză și domolește aciditatea.',
      ),
      principle: 'complement_flavour',
      ingredient: 'cornmeal',
    },
    {
      kind: 'food',
      label: t('Sour cream', 'Smântână'),
      reason: t(
        'Its cool tang cuts through the pork and smoked bacon.',
        'Aciditatea ei răcoroasă taie din greutatea cărnii de porc și a costiței afumate.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'sour-cream',
    },
    {
      kind: 'food',
      label: t('Hot pepper', 'Ardei iute'),
      reason: t(
        'A bite of fresh heat between mouthfuls wakes up the rich, soft rolls.',
        'O îmbucătură de iuțeală proaspătă între sarmale trezește gustul bogat și moale al rulourilor.',
      ),
      principle: 'complement_flavour',
      ingredient: 'hot-pepper',
    },
    {
      kind: 'drink',
      label: t('Dry red wine', 'Vin roșu sec'),
      reason: t(
        'Its acidity and tannin cut through the fat of the pork and smoked meats.',
        'Aciditatea și taninul taie grăsimea cărnii de porc și a afumăturilor.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'red-wine',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot, hearty pot of rolls warms you through on a cold day.',
        'O oală fierbinte și consistentă de sarmale te încălzește într-o zi rece.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'A heavy, fatty meal sits in the stomach during exercise.',
        'O masă grea și grasă rămâne la stomac în timpul efortului.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Fat and salt make it heavy to digest before bed.',
        'Grăsimea și sarea o fac greu de digerat înainte de culcare.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'A long-simmered, fatty pot is too heavy when it is hot.',
        'O oală grasă, fiartă îndelung, e prea grea când e cald.',
      ),
    },
  ],
  variants: [
    {
      slug: 'sarmale-greek',
      cuisine: 'greek',
      title: t(
        'Dolmades with avgolemono',
        'Sarmale în foi de viță cu sos avgolemono',
      ),
      servings: 8,
      prepMinutes: 75,
      cookMinutes: 60,
      difficulty: 'hard',
      hideBaseTips: [0, 1, 2],
      lines: [
        {
          ingredient: 'vine-leaves',
          quantity: 250,
          unit: 'g',
          note: t('from a jar, in brine', 'din borcan, în saramură'),
        },
        { ingredient: 'minced-beef', quantity: 500, unit: 'g' },
        {
          ingredient: 'round-rice',
          quantity: 150,
          unit: 'g',
          note: t('rinsed', 'spălat'),
        },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('finely chopped', 'tocate mărunt'),
        },
        {
          ingredient: 'dill',
          quantity: 20,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        {
          ingredient: 'mint',
          quantity: 15,
          unit: 'g',
          note: t('finely chopped', 'tocată mărunt'),
        },
        {
          ingredient: 'parsley',
          quantity: 20,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        { ingredient: 'olive-oil', quantity: 120, unit: 'ml' },
        { ingredient: 'lemon', quantity: 3, unit: 'pcs' },
        {
          ingredient: 'eggs',
          quantity: 2,
          unit: 'pcs',
          note: t('for the sauce', 'pentru sos'),
        },
        { ingredient: 'still-water', quantity: 600, unit: 'ml' },
        { ingredient: 'salt', quantity: 6, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
      ],
      steps: [
        {
          key: 'rinse',
          text: t(
            'Lift the vine leaves out of the jar, pour boiling water over them in a bowl for 5 minutes to wash off the brine, then rinse in cold water and drain. Snip off any hard stalks.',
            'Scoate foile de viță din borcan, toarnă apă clocotită peste ele într-un bol și lasă-le 5 minute ca să se spele saramura, apoi clătește-le cu apă rece și scurge-le. Taie cozile tari.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'filling',
          text: t(
            'Warm 30 ml of the olive oil in a pan and cook the onions for about 6 minutes until soft and glassy. Let them cool, then mix with the beef, rice, dill, mint, parsley, the juice of half a lemon, salt and pepper.',
            'Încălzește 30 ml din uleiul de măsline într-o tigaie și călește ceapa cam 6 minute, până e moale și sticloasă. Las-o să se răcească, apoi amestec-o cu carnea de vită, orezul, mărarul, menta, pătrunjelul, sucul de la jumătate de lămâie, sare și piper.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'roll',
          text: t(
            'Lay a leaf shiny side down with the stalk end toward you. Put a heaped tablespoon of filling at the base, fold the base over it, fold in the sides and roll up into a small, loose cylinder. Repeat with the rest.',
            'Așază o frunză cu partea lucioasă în jos și codița spre tine. Pune o lingură plină de umplutură la bază, îndoaie baza peste ea, îndoaie laturile și rulează într-un cilindru mic, lejer. Repetă cu restul.',
          ),
        },
        {
          key: 'pack',
          text: t(
            'Line the bottom of a wide pot with torn or spare leaves. Pack the rolls in tight, seam side down, in layers. Pour over the rest of the olive oil, the juice of one lemon and the water, and set a small plate on top to hold the rolls down.',
            'Căptușește fundul unei oale late cu frunze rupte sau rămase. Așază rulourile strâns, cu marginea în jos, în straturi. Toarnă restul de ulei de măsline, sucul de la o lămâie și apa și pune deasupra o farfurie mică, să țină rulourile jos.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Bring to a boil, cover and simmer on low heat for 45 minutes, until the rice is tender and the beef is cooked through with no pink. Ladle off the cooking liquid (about 300 ml) into a jug, leaving the dolmades in the pot.',
            'Adu la fierbere, acoperă și fierbe la foc mic 45 de minute, până orezul e fraged, iar carnea de vită e gătită complet, fără pete roz. Scoate cu polonicul zeama de la fiert (cam 300 ml) într-o cană, lăsând dolmadele în oală.',
          ),
          timerSeconds: 2700,
        },
        {
          key: 'avgolemono',
          text: t(
            'Whisk the eggs with the juice of one lemon until frothy. Whisking all the time, add the hot (not boiling) cooking liquid from the jug, a ladle at a time, about 200 ml in all, so the eggs warm up without scrambling.',
            'Bate ouăle cu sucul de la o lămâie până fac spumă. Amestecând mereu, adaugă zeama fierbinte (nu clocotită) din cană, câte un polonic, cam 200 ml în total, ca ouăle să se încălzească fără să se taie.',
          ),
        },
        {
          key: 'finish',
          text: t(
            'Pour the sauce back over the dolmades and shake the pot gently over very low heat for 2 minutes, without letting it boil, until the sauce turns creamy. The eggs are only lightly cooked in the sauce, so serve it hot straight away.',
            'Toarnă sosul peste dolmade și scutură oala ușor, la foc foarte mic, 2 minute, fără să fiarbă, până sosul devine cremos. Ouăle se gătesc doar ușor în sos, așa că servește imediat, fierbinte.',
          ),
          timerSeconds: 120,
        },
      ],
      tips: [
        t(
          'Dolmades are best eaten the day they are made, since the egg sauce does not reheat or freeze well. In June, with fresh vine leaves, blanch them 1 to 2 minutes first instead of using the jar.',
          'Dolmadele sunt cel mai bune în ziua în care le faci, fiindcă sosul de ouă nu se reîncălzește și nu se congelează bine. Vara, cu foi proaspete de viță, opărește-le 1-2 minute în loc să folosești borcanul.',
        ),
        t(
          'Roll loosely, leaving room for the rice to swell; tight dolmades burst or stay hard in the centre.',
          'Rulează lejer, lăsând loc orezului să se umfle; dolmadele strânse crapă sau rămân tari în mijloc.',
        ),
      ],
      stepTips: [
        {
          step: 'avgolemono',
          text: t(
            'If the sauce is made with liquid that is too hot, or boiled afterwards, it curdles. Go slowly and keep the heat off the boil.',
            'Dacă sosul se face cu zeamă prea fierbinte sau fierbe după aceea, se taie. Mergi încet și ține focul sub fierbere.',
          ),
        },
      ],
      nutritionNote: t(
        'Lighter than the pork version: beef and rice wrapped in leaves, with olive oil giving mostly unsaturated fat and the herbs and lemon adding flavour for little salt. The jarred leaves and the oil still add salt and calories, and the egg sauce adds richness.',
        'Mai ușoare decât varianta cu porc: vită și orez în frunze, cu ulei de măsline care aduce mai ales grăsimi nesaturate, iar ierburile și lămâia dau gust cu puțină sare. Frunzele din borcan și uleiul adaugă totuși sare și calorii, iar sosul de ouă o face mai bogată.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Greek meze platter', 'Platou grecesc de meze'),
          reason: t(
            'Dolmades are part of a meze spread, alongside feta, olives and bread.',
            'Dolmadele fac parte dintr-o masă de meze, alături de feta, măsline și pâine.',
          ),
          principle: 'regional_tradition',
          recipe: 'appetizer-platter-greek',
        },
        {
          kind: 'food',
          label: t('Lemon wedges', 'Felii de lămâie'),
          reason: t(
            'A squeeze of lemon brightens the herbs and cuts the olive oil.',
            'Un strop de lămâie învie ierburile și taie din ulei.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'lemon',
        },
        {
          kind: 'food',
          label: t('Greek yogurt', 'Iaurt grecesc'),
          reason: t(
            'Cool, thick yogurt contrasts with the warm, soft rolls.',
            'Iaurtul gros și rece contrastează cu rulourile calde și moi.',
          ),
          principle: 'contrast_texture',
          ingredient: 'greek-yogurt',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Crisp acidity echoes the lemon and refreshes between bites.',
            'Aciditatea vie răspunde lămâii și împrospătează între îmbucături.',
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
            'Small rolls with rice and herbs make a satisfying but not heavy lunch.',
            'Rulourile mici cu orez și ierburi fac un prânz satisfăcător, dar nu greu.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Lemon and herbs keep it fresh and light.',
            'Lămâia și ierburile o țin proaspătă și ușoară.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Rice and oil make a filling meal that is heavy before bed.',
            'Orezul și uleiul fac o masă sățioasă, grea înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'sarmale-middle-eastern',
      cuisine: 'middle-eastern',
      title: t(
        'Lebanese cabbage rolls (malfouf)',
        'Sarmale libaneze în varză dulce (malfouf)',
      ),
      servings: 8,
      prepMinutes: 75,
      cookMinutes: 60,
      difficulty: 'medium',
      hideBaseTips: [2],
      lines: [
        {
          ingredient: 'cabbage',
          quantity: 1500,
          unit: 'g',
          note: t('one large head', 'un cap mare'),
        },
        { ingredient: 'minced-lamb', quantity: 500, unit: 'g' },
        {
          ingredient: 'round-rice',
          quantity: 150,
          unit: 'g',
          note: t('rinsed', 'spălat'),
        },
        {
          ingredient: 'garlic',
          key: 'garlic-filling',
          quantity: 10,
          unit: 'g',
          note: t('crushed', 'zdrobit'),
        },
        {
          ingredient: 'garlic',
          key: 'garlic-pot',
          quantity: 40,
          unit: 'g',
          note: t('whole peeled cloves', 'căței întregi, curățați'),
        },
        { ingredient: 'allspice', quantity: 4, unit: 'g' },
        { ingredient: 'cinnamon', quantity: 2, unit: 'g' },
        { ingredient: 'dried-mint', quantity: 4, unit: 'g' },
        {
          ingredient: 'lemon',
          quantity: 3,
          unit: 'pcs',
          note: t('juiced', 'storsă'),
        },
        { ingredient: 'olive-oil', quantity: 60, unit: 'ml' },
        { ingredient: 'still-water', quantity: 500, unit: 'ml' },
        { ingredient: 'salt', quantity: 8, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
      ],
      steps: [
        {
          key: 'core',
          text: t(
            'Cut out the core of the cabbage with a small knife. Lower the whole head into a large pot of boiling water.',
            'Scoate cotorul verzei cu un cuțit mic. Scufundă varza întreagă într-o oală mare cu apă clocotită.',
          ),
        },
        {
          key: 'peel',
          text: t(
            'After about 5 minutes the outer leaves turn pliable and bright green. Peel them off with tongs, one at a time, as they soften, and return the head to the water until you have about 30 leaves. Drain and cool.',
            'După cam 5 minute frunzele de la exterior devin flexibile și de un verde viu. Desprinde-le cu un clește, pe rând, pe măsură ce se înmoaie, și pune capul la loc în apă până ai cam 30 de frunze. Scurge-le și lasă-le să se răcească.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'filling',
          text: t(
            'Mix the lamb, the rinsed rice, crushed garlic, allspice, cinnamon, half of the dried mint, 2 tablespoons of the lemon juice, half of the salt and the pepper. Knead until evenly combined.',
            'Amestecă carnea de miel, orezul spălat, usturoiul zdrobit, ienibaharul, scorțișoara, jumătate din menta uscată, 2 linguri de suc de lămâie, jumătate din sare și piperul. Frământă până se omogenizează.',
          ),
        },
        {
          key: 'trim',
          text: t(
            'Cut out the thick rib from each leaf and halve any big leaf along the rib line, so each piece is about the size of your palm.',
            'Taie nervura groasă din fiecare frunză și împarte frunzele mari în două, ca fiecare bucată să fie cam cât palma.',
          ),
        },
        {
          key: 'roll',
          text: t(
            'Spread about a tablespoon of filling in a thin line along the base of a leaf. Fold in the sides and roll into a thin finger-sized roll. Do not roll tightly, as the rice needs room to swell.',
            'Întinde cam o lingură de umplutură într-o linie subțire la baza unei frunze. Îndoaie laturile și rulează într-un rulou subțire, cât un deget. Nu strânge prea tare, orezul are nevoie de loc să se umfle.',
          ),
        },
        {
          key: 'pack',
          text: t(
            'Scatter the whole garlic cloves and a few torn leaves over the bottom of a wide pot. Pack in the rolls in tight layers, seam side down. Pour over the olive oil, the rest of the lemon juice, the water, the rest of the salt and the rest of the dried mint, and set a plate on top.',
            'Împrăștie cățeii întregi de usturoi și câteva frunze rupte pe fundul unei oale late. Așază rulourile în straturi dese, cu marginea în jos. Toarnă uleiul de măsline, restul de suc de lămâie, apa, restul de sare și restul de mentă uscată și pune o farfurie deasupra.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Bring to a boil, cover and simmer on low heat for 45 minutes, until the rice is tender, the lamb is cooked through with no pink and most of the liquid is absorbed.',
            'Adu la fierbere, acoperă și fierbe la foc mic 45 de minute, până orezul e fraged, mielul e gătit complet, fără pete roz, iar cea mai mare parte din lichid s-a absorbit.',
          ),
          timerSeconds: 2700,
        },
      ],
      tips: [
        t(
          'Serve with the soft garlic cloves from the pot, mashed onto the rolls; they turn sweet and mild after cooking.',
          'Servește cu căței de usturoi moi din oală, striviți peste sarmale; după gătire devin dulci și blânzi.',
        ),
      ],
      stepTips: [
        {
          step: 'peel',
          text: t(
            'If the inner leaves are still stiff, put the head back in the water for another minute or two rather than forcing them.',
            'Dacă frunzele din interior sunt încă tari, pune capul înapoi în apă încă un minut-două, nu le forța.',
          ),
        },
      ],
      nutritionNote: t(
        'Light and fresh for a stuffed dish: cabbage gives fibre and vitamin C, lamb and rice give protein and energy, and lemon and garlic carry the flavour. Lamb is fattier than lean beef and the olive oil adds calories, but there is no smoked meat, so it is far less salty than the Romanian version.',
        'Ușoare și proaspete pentru un fel umplut: varza dă fibre și vitamina C, mielul și orezul dau proteine și energie, iar lămâia și usturoiul aduc gustul. Mielul e mai gras decât vita slabă și uleiul adaugă calorii, dar fără carne afumată sunt mult mai puțin sărate decât varianta românească.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Plain yogurt', 'Iaurt simplu'),
          reason: t(
            'Cool, tangy yogurt is a classic partner for lamb and warm spice.',
            'Iaurtul rece și acrișor se potrivește clasic cu mielul și condimentele calde.',
          ),
          principle: 'complement_flavour',
          ingredient: 'yogurt',
        },
        {
          kind: 'food',
          label: t('Pita bread', 'Lipie'),
          reason: t(
            'Warm flatbread mops up the lemony oil from the pot.',
            'Lipia caldă e bună de înmuiat în uleiul cu lămâie din oală.',
          ),
          principle: 'contrast_texture',
          ingredient: 'pita',
        },
        {
          kind: 'food',
          label: t('Pickled peppers', 'Ardei murați'),
          reason: t(
            'Their sharp acidity cuts through the lamb.',
            'Aciditatea lor ascuțită taie din grăsimea mielului.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-peppers',
        },
        {
          kind: 'drink',
          label: t('Sparkling water with lemon', 'Apă minerală cu lămâie'),
          reason: t(
            'Cold bubbles and lemon refresh the palate after the garlic and spice.',
            'Bulele reci și lămâia împrospătează gustul după usturoi și condimente.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'sparkling-water',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Warm, spiced rolls are comforting on a cold day.',
            'Rulourile calde, condimentate, sunt reconfortante într-o zi rece.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from the lamb and carbohydrates from the rice help recovery.',
            'Proteinele din miel și carbohidrații din orez ajută la refacere.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A filling meat and rice dish is heavy shortly before bed.',
            'Un fel sățios de carne cu orez e greu cu puțin timp înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
