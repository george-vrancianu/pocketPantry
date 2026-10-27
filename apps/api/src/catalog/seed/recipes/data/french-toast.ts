import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The French toast base is thick bread soaked in a sweet custard and pan-fried
// in butter. Each Variant is a full Recipe with its own lines, steps and
// guidance; the base's Recipe-level Tips are inherited unless hidden.
export const frenchToast: BaseRecipeSeed = {
  slug: 'french-toast',
  title: t('French toast', 'French toast (pâine prăjită dulce cu ou)'),
  servings: 4,
  prepMinutes: 15,
  cookMinutes: 30,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'bread',
      quantity: 8,
      unit: 'pcs',
      note: t(
        'slices of day-old white loaf, about 2 cm thick',
        'felii de pâine albă de ieri, groase de circa 2 cm',
      ),
    },
    { ingredient: 'eggs', quantity: 4, unit: 'pcs' },
    { ingredient: 'milk', quantity: 0.25, unit: 'l' },
    { ingredient: 'sugar', quantity: 20, unit: 'g' },
    { ingredient: 'vanilla-extract', quantity: 5, unit: 'ml' },
    { ingredient: 'cinnamon', quantity: 2, unit: 'g' },
    { ingredient: 'salt', quantity: 1, unit: 'g' },
    {
      ingredient: 'butter',
      quantity: 40,
      unit: 'g',
      note: t('for frying', 'pentru prăjit'),
    },
    {
      ingredient: 'maple-syrup',
      quantity: 80,
      unit: 'ml',
      note: t('to serve', 'pentru servit'),
    },
    {
      ingredient: 'blueberry',
      quantity: 100,
      unit: 'g',
      optional: true,
      note: t('to serve', 'pentru servit'),
    },
  ],
  steps: [
    {
      key: 'oven',
      text: t(
        'Heat the oven to 100 °C and put a baking tray inside, to keep the cooked slices warm while you fry the rest.',
        'Încălzește cuptorul la 100 °C și pune înăuntru o tavă, ca să ții feliile gătite calde cât prăjești restul.',
      ),
    },
    {
      key: 'custard',
      text: t(
        'Whisk the eggs, milk, sugar, vanilla, cinnamon and salt in a wide shallow dish until no streaks of egg white remain.',
        'Bate ouăle, laptele, zahărul, vanilia, scorțișoara și sarea într-un vas lat și puțin adânc, până nu mai rămân dungi de albuș.',
      ),
    },
    {
      key: 'soak',
      text: t(
        'Lay three slices in the custard and soak them for about 20 seconds per side, until heavy and soft but still holding together when lifted.',
        'Pune trei felii în compoziția de ou și înmoaie-le circa 20 de secunde pe fiecare parte, până devin grele și moi, dar încă se țin întregi când le ridici.',
      ),
      timerSeconds: 40,
    },
    {
      key: 'melt',
      text: t(
        'Melt a third of the butter in a large non-stick pan over medium heat until it foams but has not browned.',
        'Topește o treime din unt într-o tigaie mare antiaderentă, la foc mediu, până face spumă, fără să se rumenească.',
      ),
    },
    {
      key: 'fry-first',
      text: t(
        'Lift the soaked slices out, let the extra custard drip off, and lay them in the pan. Fry for about 3 minutes, until golden brown underneath.',
        'Scoate feliile înmuiate, lasă să se scurgă surplusul și pune-le în tigaie. Prăjește-le circa 3 minute, până se rumenesc frumos pe partea de jos.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'fry-second',
      text: t(
        'Turn the slices and fry the other side for about 3 minutes, until golden brown.',
        'Întoarce feliile și prăjește cealaltă parte circa 3 minute, până se rumenește.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'check',
      text: t(
        'Cut into the first slice to check the middle: it must be set and spongy, with no wet, shiny egg. If it is still wet, lower the heat and fry a minute longer on each side.',
        'Taie prima felie și verifică mijlocul: trebuie să fie închegat și pufos, fără ou umed și lucios. Dacă e încă umed, micșorează focul și mai prăjește un minut pe fiecare parte.',
      ),
    },
    {
      key: 'keep-warm',
      text: t(
        'Move the cooked slices to the tray in the oven. Soak and fry the remaining slices in two more batches (three slices, then two), adding a third of the butter to the pan before each one.',
        'Mută feliile gătite pe tava din cuptor. Înmoaie și prăjește restul feliilor în încă două reprize (trei felii, apoi două), adăugând în tigaie o treime din unt înainte de fiecare.',
      ),
    },
    {
      key: 'serve',
      text: t(
        'Serve hot, two slices per plate, with maple syrup and blueberries.',
        'Servește fierbinte, câte două felii pe farfurie, cu sirop de arțar și afine.',
      ),
    },
  ],
  tips: [
    t(
      'Use bread a day or two old. Fresh bread turns to mush in the custard; if yours is fresh, leave the slices out for a few hours or dry them briefly in a low oven.',
      'Folosește pâine de acum una-două zile. Pâinea proaspătă se face terci în compoziția de ou; dacă a ta e proaspătă, lasă feliile câteva ore la aer sau uscă-le puțin în cuptor, la temperatură mică.',
    ),
    t(
      'Keep the heat at medium. If the pan is too hot, the outside browns while the middle is still raw custard.',
      'Ține focul mediu. Dacă tigaia e prea fierbinte, exteriorul se rumenește, iar în mijloc rămâne compoziție crudă de ou.',
    ),
    t(
      'Brioche or challah makes a richer French toast; if you use either, cut the sugar in the custard, as the bread is already sweet.',
      'Din brioche sau challah iese un French toast mai bogat; dacă folosești una dintre ele, pune mai puțin zahăr în compoziție, fiindcă pâinea e deja dulce.',
    ),
  ],
  stepTips: [
    {
      step: 'soak',
      text: t(
        'Soak only as many slices as will fit in the pan at once. Slices left lying in the custard go soggy and tear when you lift them.',
        'Înmoaie doar atâtea felii câte încap deodată în tigaie. Cele lăsate în compoziție se muiază prea tare și se rup când le ridici.',
      ),
    },
  ],
  nutritionNote: t(
    'Eggs and milk give protein and the bread gives energy, so it keeps you going through the morning; the sugar, syrup and butter make it a sweet, fairly rich dish, and white bread adds little fibre. Fruit on top helps, and it suits a relaxed breakfast more than every day.',
    'Ouăle și laptele aduc proteine, iar pâinea energie, așa că te ține sătul până spre prânz; zahărul, siropul și untul îl fac un preparat dulce și destul de bogat, iar pâinea albă aduce puține fibre. Fructele deasupra ajută; e mai potrivit pentru un mic dejun fără grabă decât pentru fiecare zi.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Crisp bacon', 'Bacon crocant'),
      reason: t(
        'Its saltiness sets off the sweet syrup, and it adds a crunchy bite to the soft slices.',
        'Gustul lui sărat pune în valoare siropul dulce și adaugă o textură crocantă pe lângă feliile moi.',
      ),
      principle: 'salt_balances_sweet',
      ingredient: 'bacon',
    },
    {
      kind: 'food',
      label: t('Strawberries', 'Căpșuni'),
      reason: t(
        'Their tartness cuts through the butter and sweetness.',
        'Aciditatea lor taie din bogăția untului și din dulceață.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'strawberry',
    },
    {
      kind: 'drink',
      label: t('Black coffee', 'Cafea neagră'),
      reason: t(
        'Its bitterness balances the sweet, buttery slices.',
        'Amăreala ei echilibrează feliile dulci și unsuroase.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'coffee',
    },
    {
      kind: 'drink',
      label: t('Orange juice', 'Suc de portocale'),
      reason: t(
        'Its freshness and acidity lighten the sweetness.',
        'Prospețimea și aciditatea lui ușurează dulceața.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'orange-juice',
    },
  ],
  eatingMoments: [
    {
      moment: 'morning',
      polarity: 'good_for',
      reason: t(
        'Protein from the eggs and energy from the bread make a satisfying start to the day.',
        'Proteinele din ouă și energia din pâine fac un început de zi săturător.',
      ),
    },
    {
      moment: 'brunch',
      polarity: 'good_for',
      reason: t(
        'Easy to make in batches for a table of people.',
        'Se face ușor în reprize pentru o masă cu mai multă lume.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Sweet, buttery and heavy just before bed.',
        'Dulce, unsuroasă și grea chiar înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'french-toast-spanish',
      cuisine: 'spanish',
      title: t(
        'Torrijas (Spanish fried milk-soaked bread)',
        'Torrijas (pâine înmuiată în lapte și prăjită, ca în Spania)',
      ),
      servings: 4,
      prepMinutes: 45,
      cookMinutes: 30,
      difficulty: 'easy',
      hideBaseTips: [2],
      lines: [
        {
          ingredient: 'baguette',
          quantity: 0.5,
          unit: 'pcs',
          note: t(
            'about half a day-old baguette, cut into 12 slices about 2 cm thick',
            'circa jumătate de baghetă de ieri, tăiată în 12 felii groase de circa 2 cm',
          ),
        },
        { ingredient: 'milk', quantity: 0.6, unit: 'l' },
        { ingredient: 'cinnamon-sticks', quantity: 5, unit: 'g' },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'peel only, in wide strips without the white pith',
            'doar coaja, în fâșii late, fără partea albă',
          ),
        },
        {
          ingredient: 'sugar',
          key: 'sugar-milk',
          quantity: 60,
          unit: 'g',
          note: t('for the milk', 'pentru lapte'),
        },
        { ingredient: 'eggs', quantity: 3, unit: 'pcs' },
        {
          ingredient: 'olive-oil',
          quantity: 500,
          unit: 'ml',
          note: t('for frying', 'pentru prăjit'),
        },
        {
          ingredient: 'sugar',
          key: 'sugar-coating',
          quantity: 50,
          unit: 'g',
          note: t('for rolling', 'pentru tăvălit'),
        },
        {
          ingredient: 'cinnamon',
          quantity: 4,
          unit: 'g',
          note: t('for rolling', 'pentru tăvălit'),
        },
        {
          ingredient: 'honey',
          quantity: 40,
          unit: 'g',
          optional: true,
          note: t('to drizzle', 'pentru turnat deasupra'),
        },
      ],
      steps: [
        {
          key: 'slice',
          text: t(
            'Cut about half the baguette into 12 slices about 2 cm thick. If it is fresh, leave the slices out for a few hours to dry a little.',
            'Taie jumătate de baghetă în 12 felii groase de circa 2 cm. Dacă e proaspătă, lasă feliile câteva ore la aer să se usuce puțin.',
          ),
        },
        {
          key: 'infuse',
          text: t(
            'Put the milk, cinnamon stick, lemon peel and the 60 g of sugar in a saucepan and heat over medium heat until steaming with tiny bubbles at the edge. Do not let it boil. Take it off the heat.',
            'Pune laptele, batonul de scorțișoară, coaja de lămâie și cele 60 g de zahăr într-o oală și încălzește la foc mediu, până scoate abur și apar bule mici pe margine. Nu-l lăsa să fiarbă. Ia oala de pe foc.',
          ),
        },
        {
          key: 'steep',
          text: t(
            'Cover and leave the milk to steep for 20 minutes.',
            'Acoperă și lasă laptele să se infuzeze 20 de minute.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'cool',
          text: t(
            'Strain the milk into a wide dish and let it cool to room temperature. Hot milk would make the bread fall apart.',
            'Strecoară laptele într-un vas lat și lasă-l să se răcească la temperatura camerei. Laptele fierbinte ar face pâinea să se desfacă.',
          ),
        },
        {
          key: 'soak',
          text: t(
            'Lay half the slices in the milk and soak them for about 1 minute per side, until soaked right through but still whole. Lift them carefully with a spatula onto a tray and soak the rest.',
            'Pune jumătate din felii în lapte și înmoaie-le circa 1 minut pe fiecare parte, până se îmbibă complet, dar rămân întregi. Ridică-le cu grijă cu o spatulă pe o tavă și înmoaie-le pe restul.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'beat-eggs',
          text: t(
            'Beat the eggs in a shallow dish. Let the soaked slices drip for a minute on the tray.',
            'Bate ouăle într-un vas puțin adânc. Lasă feliile înmuiate să se scurgă un minut pe tavă.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'heat-oil',
          text: t(
            'Pour the olive oil into a wide 24 cm frying pan, about 1 cm deep, and heat over medium heat until a drop of beaten egg sizzles at once. Stay by the pan: hot oil must never be left alone.',
            'Toarnă uleiul de măsline într-o tigaie lată de 24 cm, cam 1 cm adâncime, și încălzește la foc mediu până când o picătură de ou bătut sfârâie imediat. Rămâi lângă tigaie: uleiul încins nu se lasă nesupravegheat.',
          ),
        },
        {
          key: 'dip',
          text: t(
            'Dip four slices, one at a time, in the egg, turning to coat both sides, and let the extra drip off. Lay them in the oil away from you, so it does not splash.',
            'Trece patru felii, pe rând, prin ou, întorcându-le să se acopere pe ambele părți, și lasă surplusul să se scurgă. Pune-le în ulei departe de tine, ca să nu stropească.',
          ),
        },
        {
          key: 'fry-first',
          text: t(
            'Fry for about 2 minutes, until deep golden underneath.',
            'Prăjește circa 2 minute, până se rumenesc intens pe partea de jos.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'fry-second',
          text: t(
            'Turn the slices and fry the other side for about 2 minutes, until deep golden.',
            'Întoarce feliile și prăjește cealaltă parte circa 2 minute, până se rumenește intens.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'drain',
          text: t(
            'Lift the torrijas onto paper towels to drain. Cut into the first one: the egg coating must be set and the inside hot and soft. Repeat the dipping and frying with the remaining slices in two more batches.',
            'Scoate torrijas pe hârtie de bucătărie să se scurgă. Taie-o pe prima: stratul de ou trebuie să fie închegat, iar interiorul cald și moale. Repetă înmuierea în ou și prăjirea cu restul feliilor, în încă două reprize.',
          ),
        },
        {
          key: 'roll',
          text: t(
            'Mix the 50 g of sugar and the ground cinnamon on a plate and roll the warm torrijas in it, covering them all over.',
            'Amestecă cele 50 g de zahăr cu scorțișoara măcinată pe o farfurie și tăvălește torrijas calde prin amestec, până se acoperă peste tot.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Serve warm or at room temperature, with a little honey drizzled over if you like.',
            'Servește calde sau la temperatura camerei, cu puțină miere turnată deasupra, dacă vrei.',
          ),
        },
      ],
      tips: [
        t(
          'Torrijas keep for one day at most, covered in the fridge; take them out in good time so they come to room temperature before serving.',
          'Torrijas se păstrează cel mult o zi, acoperite, la frigider; scoate-le din timp, ca să ajungă la temperatura camerei înainte de servire.',
        ),
      ],
      stepTips: [
        {
          step: 'soak',
          text: t(
            'A baguette soaks up a lot of milk without collapsing; lift the slices with a spatula, not your fingers, so they keep their shape.',
            'Bagheta absoarbe mult lapte fără să se desfacă; ridică feliile cu spatula, nu cu degetele, ca să-și păstreze forma.',
          ),
        },
      ],
      nutritionNote: t(
        'Milk and egg add some protein, but the bread, sugar and fried coating make this a sweet, energy-dense treat, and olive oil brings mostly unsaturated fat. Best kept for an occasion with a coffee, in a small portion.',
        'Laptele și oul aduc ceva proteine, dar pâinea, zahărul și învelișul prăjit fac din ea o delicatesă dulce și bogată în energie, iar uleiul de măsline aduce în principal grăsimi nesaturate. Se potrivește cel mai bine la o ocazie, într-o porție mică, alături de o cafea.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'Its bitterness balances the sweet, cinnamon-sugar coating.',
            'Amăreala ei echilibrează stratul dulce de zahăr cu scorțișoară.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'coffee',
        },
        {
          kind: 'food',
          label: t('Yogurt', 'Iaurt'),
          reason: t(
            'Its cool tang offsets the warm, fried and sugary slices.',
            'Aciditatea lui răcoroasă contrastează cu feliile calde, prăjite și îndulcite.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'yogurt',
        },
      ],
      eatingMoments: [
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'Made ahead and eaten at room temperature, so easy to share with a coffee.',
            'Se fac dinainte și se mănâncă la temperatura camerei, deci se împart ușor la o cafea.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Cinnamon and sugar make a comforting treat.',
            'Scorțișoara și zahărul fac un desert reconfortant.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Fried and sugary, too heavy just before bed.',
            'Prăjite și dulci, prea grele chiar înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'french-toast-romanian',
      cuisine: 'romanian',
      title: t('Frigănele (Romanian savoury eggy bread)', 'Frigănele'),
      servings: 4,
      prepMinutes: 10,
      cookMinutes: 20,
      difficulty: 'easy',
      hideBaseTips: [2],
      lines: [
        {
          ingredient: 'bread',
          quantity: 8,
          unit: 'pcs',
          note: t(
            'slices of day-old franzelă, about 1.5 cm thick',
            'felii de franzelă de ieri, groase de circa 1,5 cm',
          ),
        },
        { ingredient: 'eggs', quantity: 4, unit: 'pcs' },
        { ingredient: 'milk', quantity: 0.1, unit: 'l', optional: true },
        { ingredient: 'salt', quantity: 2, unit: 'g' },
        {
          ingredient: 'sunflower-oil',
          quantity: 60,
          unit: 'ml',
          note: t('for frying', 'pentru prăjit'),
        },
        {
          ingredient: 'telemea',
          quantity: 150,
          unit: 'g',
          optional: true,
          note: t('to serve', 'pentru servit'),
        },
        {
          ingredient: 'tomato',
          quantity: 300,
          unit: 'g',
          optional: true,
          note: t('sliced, to serve', 'felii, pentru servit'),
        },
      ],
      steps: [
        {
          key: 'slice',
          text: t(
            'Cut the franzelă into 8 slices about 1.5 cm thick.',
            'Taie franzela în 8 felii groase de circa 1,5 cm.',
          ),
        },
        {
          key: 'beat',
          text: t(
            'Beat the eggs with the milk and salt in a wide shallow dish until smooth.',
            'Bate ouăle cu laptele și sarea într-un vas lat și puțin adânc, până se omogenizează.',
          ),
        },
        {
          key: 'heat-oil',
          text: t(
            'Heat a third of the oil in a large frying pan over medium heat until a drop of beaten egg sizzles at once. Stay by the pan: hot oil must never be left alone.',
            'Încinge o treime din ulei într-o tigaie mare, la foc mediu, până când o picătură de ou bătut sfârâie imediat. Rămâi lângă tigaie: uleiul încins nu se lasă nesupravegheat.',
          ),
        },
        {
          key: 'dip',
          text: t(
            'Dip three slices, one at a time, in the egg, turning them once so both sides take it up, and let the extra drip off. Lay them in the pan away from you, so the oil does not splash.',
            'Trece trei felii, pe rând, prin ou, întorcându-le o dată ca să se îmbibe pe ambele părți, și lasă surplusul să se scurgă. Pune-le în tigaie departe de tine, ca să nu stropească uleiul.',
          ),
        },
        {
          key: 'fry-first',
          text: t(
            'Fry for about 2 minutes, until golden underneath.',
            'Prăjește circa 2 minute, până se rumenesc pe partea de jos.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'fry-second',
          text: t(
            'Turn the slices and fry the other side for about 2 minutes, until golden.',
            'Întoarce feliile și prăjește cealaltă parte circa 2 minute, până se rumenește.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'check',
          text: t(
            'Cut into the first slice: the egg must be set all the way through, with no wet or shiny egg. If it is still wet, lower the heat and fry a minute longer on each side.',
            'Taie prima felie: oul trebuie să fie închegat în tot mijlocul, fără ou umed sau lucios. Dacă e încă umed, micșorează focul și mai prăjește un minut pe fiecare parte.',
          ),
        },
        {
          key: 'drain',
          text: t(
            'Drain the fried slices on paper towels. Fry the rest in two more batches, adding a third of the oil to the pan before each one.',
            'Scurge feliile prăjite pe hârtie de bucătărie. Prăjește restul în încă două reprize, adăugând în tigaie câte o treime din ulei înainte de fiecare.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Serve hot, with the telemea and sliced tomatoes alongside.',
            'Servește fierbinte, cu telemea și felii de roșii alături.',
          ),
        },
      ],
      tips: [
        t(
          'Go easy on the salt in the egg if you serve telemea: the cheese will season the plate.',
          'Nu exagera cu sarea din ou dacă servești cu telemea: brânza sărează deja farfuria.',
        ),
        t(
          'For a sweet version, leave out the telemea and tomato and sprinkle the hot slices with sugar.',
          'Pentru o variantă dulce, renunță la telemea și la roșii și presară zahăr pe feliile fierbinți.',
        ),
      ],
      stepTips: [
        {
          step: 'dip',
          text: t(
            'Day-old franzelă takes up the egg slowly, so do not rush: a slice that has soaked only on the surface will brown but stay raw in the middle.',
            'Franzela de ieri absoarbe oul încet, așa că nu te grăbi: o felie îmbibată doar la suprafață se rumenește, dar rămâne crudă în mijloc.',
          ),
        },
      ],
      nutritionNote: t(
        'Eggs and bread make a filling, protein-rich meal, and tomatoes add freshness; frying in oil adds fat, white bread has little fibre and telemea is salty, so keep the cheese modest and add a vegetable side.',
        'Ouăle și pâinea fac o masă săturătoare și bogată în proteine, iar roșiile adaugă prospețime; prăjirea în ulei adaugă grăsime, pâinea albă are puține fibre, iar telemeaua e sărată, așa că pune brânză cu măsură și adaugă o garnitură de legume.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Sour cream', 'Smântână'),
          reason: t(
            'A cool, creamy spoonful that softens the fried crust.',
            'O lingură răcoroasă și cremoasă, care îmblânzește crusta prăjită.',
          ),
          principle: 'contrast_texture',
          ingredient: 'sour-cream',
        },
        {
          kind: 'food',
          label: t('Pickled cucumbers', 'Castraveți murați'),
          reason: t(
            'Their sourness cuts the richness of the fried egg and oil.',
            'Aciditatea lor taie bogăția oului și a uleiului.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-cucumbers',
        },
        {
          kind: 'food',
          label: t('Spring onion', 'Ceapă verde'),
          reason: t(
            'A fresh, sharp crunch next to the soft, eggy slices.',
            'Un crocant proaspăt și iute lângă feliile moi, cu gust de ou.',
          ),
          principle: 'contrast_texture',
          ingredient: 'spring-onion',
        },
      ],
      eatingMoments: [
        {
          moment: 'morning',
          polarity: 'good_for',
          reason: t(
            'Quick, filling and made with things already in the kitchen.',
            'Rapide, săturătoare și făcute din ce ai deja în bucătărie.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'With tomatoes and cheese they make a simple, satisfying meal.',
            'Cu roșii și brânză fac o masă simplă și satisfăcătoare.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Fried and heavy just before bed.',
            'Prăjite și grele chiar înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'french-toast-chinese',
      cuisine: 'chinese',
      title: t(
        'Hong Kong-style French toast (sai do si)',
        'French toast în stil Hong Kong (sai do si)',
      ),
      servings: 2,
      prepMinutes: 10,
      cookMinutes: 25,
      difficulty: 'medium',
      hideBaseTips: [0, 1, 2],
      lines: [
        {
          ingredient: 'toast-bread',
          quantity: 4,
          unit: 'pcs',
          note: t(
            'thick slices of soft white sandwich bread',
            'felii groase de pâine albă moale pentru sandvișuri',
          ),
        },
        { ingredient: 'peanut-butter', quantity: 60, unit: 'g' },
        { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
        {
          ingredient: 'sunflower-oil',
          quantity: 1000,
          unit: 'ml',
          note: t('for frying', 'pentru prăjit'),
        },
        {
          ingredient: 'butter',
          quantity: 20,
          unit: 'g',
          note: t('to serve', 'pentru servit'),
        },
        {
          ingredient: 'golden-syrup',
          quantity: 60,
          unit: 'g',
          note: t('to serve', 'pentru servit'),
        },
        {
          ingredient: 'condensed-milk',
          quantity: 30,
          unit: 'g',
          optional: true,
          note: t('to drizzle', 'pentru turnat deasupra'),
        },
      ],
      steps: [
        {
          key: 'sandwich',
          text: t(
            'Cut the crusts off all four slices. Spread the peanut butter on two of them, top with the other two and press the edges firmly together to seal.',
            'Taie coaja de pe toate cele patru felii. Întinde untul de arahide pe două dintre ele, acoperă cu celelalte două și apasă ferm marginile ca să se lipească.',
          ),
        },
        {
          key: 'beat',
          text: t(
            'Beat the eggs in a wide shallow dish, wide enough to lay a sandwich flat.',
            'Bate ouăle într-un vas lat și puțin adânc, destul de larg cât să încapă un sandviș pus plat.',
          ),
        },
        {
          key: 'heat-oil',
          text: t(
            'Pour the oil into a 20 cm saucepan, never filling it more than halfway, and heat over medium heat until it reaches 170 °C on a thermometer. Without one, a cube of bread dropped in should turn golden in about 40 seconds. Stay by the pan: hot oil must never be left alone.',
            'Toarnă uleiul într-o cratiță de 20 cm, fără s-o umpli mai mult de jumătate, și încălzește-l la foc mediu până ajunge la 170 °C pe termometru. Fără termometru, un cub de pâine aruncat în ulei trebuie să se rumenească în circa 40 de secunde. Rămâi lângă cratiță: uleiul încins nu se lasă nesupravegheat.',
          ),
        },
        {
          key: 'dip',
          text: t(
            'Lay one sandwich in the egg, turn it to coat both sides and the edges, and let the extra egg drip off.',
            'Pune un sandviș în ou, întoarce-l să se acopere pe ambele părți și pe margini și lasă surplusul de ou să se scurgă.',
          ),
        },
        {
          key: 'fry',
          text: t(
            'Lower the sandwich into the oil with tongs, away from you. Fry for about 4 minutes in total, turning once and spooning oil over the top, until puffed and deep golden.',
            'Coboară sandvișul în ulei cu cleștele, departe de tine. Prăjește-l circa 4 minute în total, întorcându-l o dată și turnând ulei cu lingura deasupra, până se umflă și capătă o culoare aurie intensă.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'check',
          text: t(
            'Lift it out onto a rack. Cut into a corner of the first sandwich: the egg must be set all the way through, with no wet egg, and the peanut butter hot and soft. If it is wet, fry it a minute or two longer.',
            'Scoate-l pe un grătar. Taie un colț din primul sandviș: oul trebuie să fie închegat în tot mijlocul, fără ou umed, iar untul de arahide cald și moale. Dacă e umed, mai prăjește-l un minut-două.',
          ),
        },
        {
          key: 'reheat',
          text: t(
            'Wait about 2 minutes for the oil to come back to 170 °C before frying the second sandwich.',
            'Așteaptă circa 2 minute ca uleiul să revină la 170 °C înainte de a prăji al doilea sandviș.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'second',
          text: t(
            'Dip the second sandwich in the egg and fry it the same way for about 4 minutes in total, until puffed and deep golden. Check the middle as before.',
            'Trece al doilea sandviș prin ou și prăjește-l la fel, circa 4 minute în total, până se umflă și capătă o culoare aurie intensă. Verifică mijlocul ca mai înainte.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'serve',
          text: t(
            'Cut each sandwich in half. Put the butter on top, pour over the golden syrup and, if you like, the condensed milk. Serve at once.',
            'Taie fiecare sandviș în două. Pune untul deasupra, toarnă siropul (golden syrup) și, dacă vrei, laptele condensat. Servește imediat.',
          ),
        },
        {
          key: 'cool-oil',
          text: t(
            'Switch off the heat and leave the pan to cool completely, away from the edge of the hob, before moving or straining the oil. Never pour water into hot oil.',
            'Oprește focul și lasă cratița să se răcească complet, departe de marginea plitei, înainte s-o muți sau să strecori uleiul. Nu turna niciodată apă peste ulei încins.',
          ),
        },
      ],
      tips: [
        t(
          'Soft, cheap sandwich bread works best: it puffs up and stays tender, where a crusty loaf turns hard when fried.',
          'Merge cel mai bine pâinea moale pentru sandvișuri: se umflă și rămâne fragedă, în timp ce o pâine cu coajă groasă se întărește la prăjit.',
        ),
        t(
          'If a fire starts in the pan, switch off the heat and cover it with a lid. Never use water.',
          'Dacă ia foc uleiul din cratiță, oprește focul și acoperă-o cu un capac. Nu folosi niciodată apă.',
        ),
        t(
          'Warn guests that the sandwich contains peanut butter and egg.',
          'Avertizează oaspeții că sandvișul conține unt de arahide și ou.',
        ),
      ],
      stepTips: [
        {
          step: 'fry',
          text: t(
            'Oil that is too cool makes the toast greasy; oil that is too hot browns the outside before the middle is hot. Fry one sandwich at a time to keep the temperature steady.',
            'Uleiul prea rece face pâinea unsuroasă; cel prea fierbinte rumenește exteriorul înainte să se încălzească mijlocul. Prăjește câte un sandviș pe rând, ca temperatura să rămână constantă.',
          ),
        },
      ],
      nutritionNote: t(
        'Peanut butter and egg give protein, but deep-frying soaks the bread in oil, and the butter, syrup and condensed milk add a lot of sugar and saturated fat. It is a rich once-in-a-while treat, best shared.',
        'Untul de arahide și oul aduc proteine, dar prăjirea în ulei mult îmbibă pâinea cu grăsime, iar untul, siropul și laptele condensat adaugă mult zahăr și grăsimi saturate. E un răsfăț bogat, pentru când și când, de împărțit cu cineva.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Hot tea', 'Ceai fierbinte'),
          reason: t(
            'Its bitterness balances the sweetness and the fried richness.',
            'Amăreala lui echilibrează dulceața și bogăția prăjelii.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'tea',
        },
        {
          kind: 'food',
          label: t('Orange', 'Portocală'),
          reason: t(
            'Its tartness cuts through the butter and syrup.',
            'Aciditatea ei taie din bogăția untului și a siropului.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'orange',
        },
      ],
      eatingMoments: [
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'A rich shared treat for a leisurely table.',
            'Un răsfăț bogat, de împărțit, pentru o masă fără grabă.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Hot, sweet and comforting.',
            'Fierbinte, dulce și reconfortant.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Deep-fried and very sweet, too heavy just before bed.',
            'Prăjit în ulei mult și foarte dulce, prea greu chiar înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
