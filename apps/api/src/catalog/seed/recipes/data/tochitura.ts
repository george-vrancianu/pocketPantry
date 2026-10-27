import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Tochitură base is the Moldavian pan stew of pork, smoked sausage and
// garlic, served on mămăligă (a Pairing, not cooked here). Both Variants are
// full Recipes with their own lines, steps and guidance. The base's two
// Recipe-level Tips (a marbled cut, cooling and reheating leftovers) hold for
// every Variant, so none hides them.
export const tochitura: BaseRecipeSeed = {
  slug: 'tochitura',
  title: t(
    'Romanian pork and sausage pan stew (tochitură moldovenească)',
    'Tochitură moldovenească',
  ),
  servings: 4,
  prepMinutes: 20,
  cookMinutes: 90,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'pork-neck',
      quantity: 700,
      unit: 'g',
      note: t('cut into 3 cm cubes', 'tăiată cuburi de 3 cm'),
    },
    {
      ingredient: 'smoked-sausages',
      quantity: 300,
      unit: 'g',
      note: t('cut into thick slices', 'tăiați rondele groase'),
    },
    {
      ingredient: 'pork-liver',
      quantity: 200,
      unit: 'g',
      optional: true,
      note: t('cut into 2 cm cubes', 'tăiat cuburi de 2 cm'),
    },
    {
      ingredient: 'lard',
      key: 'lard-stew',
      quantity: 30,
      unit: 'g',
      note: t('for the stew', 'pentru tochitură'),
    },
    {
      ingredient: 'lard',
      key: 'lard-eggs',
      quantity: 20,
      unit: 'g',
      note: t('for the fried eggs', 'pentru ouăle ochiuri'),
    },
    {
      ingredient: 'onion',
      quantity: 1,
      unit: 'pcs',
      optional: true,
      note: t('finely diced', 'tăiată mărunt'),
    },
    {
      ingredient: 'tomato-paste',
      quantity: 30,
      unit: 'g',
    },
    { ingredient: 'paprika', quantity: 3, unit: 'g' },
    { ingredient: 'white-wine', quantity: 150, unit: 'ml' },
    { ingredient: 'still-water', quantity: 0.15, unit: 'l' },
    { ingredient: 'savory', quantity: 1, unit: 'g', optional: true },
    { ingredient: 'bay-leaves', quantity: 0.4, unit: 'g', optional: true },
    { ingredient: 'salt', quantity: 5, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 1.5, unit: 'g' },
    {
      ingredient: 'garlic',
      quantity: 25,
      unit: 'g',
      note: t('crushed or finely chopped', 'zdrobit sau tocat mărunt'),
    },
    { ingredient: 'eggs', quantity: 4, unit: 'pcs' },
    {
      ingredient: 'telemea',
      quantity: 120,
      unit: 'g',
      note: t('crumbled', 'mărunțită'),
    },
  ],
  steps: [
    {
      key: 'prep',
      text: t(
        'Cut the pork into 3 cm cubes, slice the sausages into thick rounds, cube the liver if you use it, and dice the onion. Pat the pork dry with paper towels.',
        'Taie ceafa cuburi de 3 cm, taie cârnații rondele groase, taie ficatul cuburi, dacă îl folosești, și toacă ceapa mărunt. Șterge carnea de porc cu prosoape de hârtie.',
      ),
    },
    {
      key: 'brown',
      text: t(
        'Melt the stew lard in a wide heavy pan or cast-iron skillet over medium-high heat. Brown the pork in two batches, turning now and then, for about 6 minutes per batch, until deep golden on every side. Do not crowd the pan.',
        'Topește untura pentru tochitură într-o tigaie largă și groasă sau într-un vas de fontă la foc mediu spre mare. Rumenește carnea în două tranșe, întorcând-o din când în când, aproximativ 6 minute la fiecare tranșă, până capătă o crustă aurie pe toate părțile. Nu aglomera tigaia.',
      ),
      timerSeconds: 720,
    },
    {
      key: 'onion',
      text: t(
        'Return all the pork to the pan, add the onion and cook for 4 minutes, stirring, until it softens and turns glassy.',
        'Pune toată carnea înapoi în tigaie, adaugă ceapa și gătește 4 minute, amestecând, până se înmoaie și devine sticloasă.',
      ),
      timerSeconds: 240,
    },
    {
      key: 'paste',
      text: t(
        'Lower the heat, stir in the tomato paste and paprika and cook for 1 minute, until the paste darkens slightly. Do not let the paprika scorch, or it turns bitter.',
        'Dă focul mai mic, adaugă pasta de roșii și boiaua și gătește 1 minut, până pasta se închide puțin la culoare. Nu lăsa boiaua să se ardă, că se face amară.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'wine',
      text: t(
        'Pour in the wine, scrape up the browned bits from the bottom and let it boil for 2 minutes. Add the water, savory, bay leaves, salt and pepper.',
        'Toarnă vinul, desprinde cu lingura bucățelele rumenite de pe fund și lasă să fiarbă 2 minute. Adaugă apa, cimbrul, foile de dafin, sarea și piperul.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'simmer',
      text: t(
        'Cover and simmer on low heat for 40 minutes, stirring every 10 minutes, until a fork slides into a piece of pork with no resistance and the meat is white-grey with no pink inside.',
        'Acoperă și fierbe la foc mic 40 de minute, amestecând din 10 în 10 minute, până când furculița intră fără rezistență într-o bucată de carne, iar carnea e albă-cenușie, fără urmă de roz în interior.',
      ),
      timerSeconds: 2400,
    },
    {
      key: 'sausage',
      text: t(
        'Add the sausages, take the lid off and simmer for 10 minutes more, stirring, until the sauce is short and glossy and clings to the meat.',
        'Adaugă cârnații, ia capacul și mai fierbe 10 minute, amestecând, până când sosul se reduce, devine lucios și se prinde de carne.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'liver',
      text: t(
        'If you use liver, stir it in and cook for 6 minutes, until it is firm and brown all through with no pink in the middle and the juices run clear. Skip this step if you leave it out.',
        'Dacă folosești ficat, adaugă-l și gătește 6 minute, până când e ferm și maroniu pe toată grosimea, fără urmă de roz la mijloc, iar sucul care iese e limpede. Sari peste acest pas dacă nu pui ficat.',
      ),
      timerSeconds: 360,
    },
    {
      key: 'garlic',
      text: t(
        'Stir in the garlic and cook for 2 minutes, then taste and add salt if needed. Take the pan off the heat and keep it covered while you fry the eggs.',
        'Adaugă usturoiul și gătește 2 minute, apoi gustă și pune sare dacă mai e nevoie. Dă tigaia de pe foc și ține-o acoperită cât prăjești ouăle.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'eggs',
      text: t(
        'Melt the egg lard in a separate pan over medium heat and fry the eggs for about 3 minutes (ochiuri), until the whites are completely set and opaque. The yolks stay runny unless you cook them longer.',
        'Topește untura pentru ouă într-o tigaie separată la foc mediu și prăjește ouăle ochiuri aproximativ 3 minute, până când albușul se prinde complet și devine opac. Gălbenușul rămâne curgător dacă nu le ții mai mult.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'serve',
      text: t(
        'Spoon the tochitură onto hot mămăligă, top each portion with a fried egg and a handful of crumbled telemea, and serve with pickles on the side.',
        'Pune tochitura peste mămăligă fierbinte, așază deasupra câte un ou ochi și o mână de telemea mărunțită și servește cu murături alături.',
      ),
    },
  ],
  tips: [
    t(
      'Buy pork neck with a little marbling. Lean loin turns dry and stringy in a stew or a hot pan, while the fat in the neck melts into the sauce.',
      'Alege ceafă de porc cu puțină grăsime printre fibre. Cotletul slab iese uscat și fibros într-o tocăniță sau la tigaie, pe când grăsimea din ceafă se topește în sos.',
    ),
    t(
      'Cool leftovers within 2 hours and keep them in the fridge for up to 3 days. Reheat until steaming hot all through, adding a splash of water if the sauce has thickened.',
      'Răcește resturile în maximum 2 ore și păstrează-le la frigider cel mult 3 zile. Încălzește-le până fierb bine în toată masa, cu puțină apă dacă sosul s-a îngroșat.',
    ),
  ],
  stepTips: [
    {
      step: 'brown',
      text: t(
        'Wet meat steams instead of browning. If the pan floods with juices, tip them into a bowl, finish browning, then pour them back in.',
        'Carnea umedă se fierbe în loc să se rumenească. Dacă tigaia se umple cu zeamă, toarn-o într-un bol, termină rumenitul și pune-o la loc.',
      ),
    },
    {
      step: 'garlic',
      text: t(
        'Garlic goes in at the end on purpose: cooked for 40 minutes it loses its punch, and the sharp bite of fresh garlic is what the dish is about.',
        'Usturoiul se pune la sfârșit cu un scop: fiert 40 de minute își pierde din tărie, iar gustul înțepător de usturoi proaspăt e chiar sufletul tochiturii.',
      ),
    },
    {
      step: 'eggs',
      text: t(
        'Runny yolks are not safe for young children, older people, anyone pregnant or anyone with a weakened immune system. For them, flip the egg and cook until the yolk is firm.',
        'Gălbenușul curgător nu e potrivit pentru copii mici, vârstnici, gravide sau persoane cu imunitatea scăzută. Pentru ei, întoarce oul și ține-l până când gălbenușul se întărește.',
      ),
    },
  ],
  nutritionNote: t(
    'Filling and rich in protein, so a little goes a long way. The lard, pork neck and smoked sausages bring a lot of saturated fat, and the sausages, telemea and pickles make it salty. It has little fibre: add a fresh salad, and watch the portion of mămăligă.',
    'Săturătoare și bogată în proteine, așa că nu ai nevoie de porții mari. Untura, ceafa și cârnații afumați aduc multă grăsime saturată, iar cârnații, telemeaua și murăturile o fac sărată. Are puține fibre: adaugă o salată proaspătă și ai grijă la porția de mămăligă.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t(
        'Mămăligă with cheese and sour cream',
        'Mămăligă cu brânză și smântână',
      ),
      reason: t(
        'Tochitură is served on mămăligă, which soaks up the garlicky sauce and softens the rich, salty meat.',
        'Tochitura se servește pe mămăligă, care absoarbe sosul cu usturoi și îmblânzește carnea bogată și sărată.',
      ),
      principle: 'regional_tradition',
      recipe: 'mamaliga',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sharp acidity cuts through the lard and smoked meat.',
        'Aciditatea lor tăioasă taie din untură și din carnea afumată.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'drink',
      label: t('Red wine', 'Vin roșu'),
      reason: t(
        'A dry red has enough body to stand up to the pork and paprika.',
        'Un vin roșu sec are destul corp cât să țină piept cărnii de porc și boielii.',
      ),
      principle: 'complement_flavour',
      ingredient: 'red-wine',
    },
    {
      kind: 'drink',
      label: t('Beer', 'Bere'),
      reason: t(
        'Cold, fizzy beer cleanses the palate between fatty bites.',
        'Berea rece și spumoasă curăță gustul între îmbucăturile grase.',
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
        'A hot, rich stew on mămăligă warms you through.',
        'O tocăniță fierbinte și consistentă, pe mămăligă, te încălzește bine.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Protein from the meat and eggs, plus carbohydrates from the mămăligă.',
        'Proteine din carne și ouă, plus carbohidrați din mămăligă.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Fatty meat and a lot of garlic sit heavy before bed.',
        'Carnea grasă și mult usturoi cad greu înainte de culcare.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'Too heavy and hot to enjoy in summer heat.',
        'Prea grea și prea fierbinte pentru zilele toride de vară.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Fat and a big portion of meat slow digestion during hard exercise.',
        'Grăsimea și o porție mare de carne încetinesc digestia în timpul unui efort intens.',
      ),
    },
  ],
  variants: [
    {
      slug: 'tochitura-balkan',
      cuisine: 'balkan',
      title: t(
        'Mućkalica (Serbian pork and pepper pan stew)',
        'Mućkalica (tocăniță sârbească de porc cu ardei)',
      ),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 80,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'pork-neck',
          quantity: 700,
          unit: 'g',
          note: t('cut into 3 cm cubes', 'tăiată cuburi de 3 cm'),
        },
        {
          ingredient: 'lard',
          quantity: 40,
          unit: 'g',
        },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('sliced', 'tăiate felii'),
        },
        {
          ingredient: 'bell-pepper',
          quantity: 5,
          unit: 'pcs',
          note: t(
            'red and green, cut into strips',
            'roșii și verzi, tăiați fâșii',
          ),
        },
        {
          ingredient: 'hot-pepper',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'sliced, seeds in or out as you like',
            'tăiați rondele, cu sau fără semințe, după gust',
          ),
        },
        {
          ingredient: 'tomato',
          quantity: 400,
          unit: 'g',
          note: t('chopped', 'tăiate cubulețe'),
        },
        {
          ingredient: 'garlic',
          quantity: 15,
          unit: 'g',
          optional: true,
          note: t('crushed', 'zdrobit'),
        },
        { ingredient: 'paprika', quantity: 5, unit: 'g' },
        { ingredient: 'salt', quantity: 5, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1.5, unit: 'g' },
        {
          ingredient: 'parsley',
          quantity: 10,
          unit: 'g',
          optional: true,
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'country-bread',
          quantity: 0.5,
          unit: 'pcs',
          optional: true,
        },
      ],
      steps: [
        {
          key: 'prep',
          text: t(
            'Cut the pork into 3 cm cubes and pat dry. Slice the onions, cut the bell peppers into strips, slice the hot peppers and chop the tomatoes.',
            'Taie ceafa cuburi de 3 cm și șterge-o cu prosoape de hârtie. Feliază ceapa, taie ardeii grași fâșii, ardeii iuți rondele și roșiile cubulețe.',
          ),
        },
        {
          key: 'brown',
          text: t(
            'Melt the lard in a wide heavy pan over medium-high heat. Brown the pork in two batches for about 10 minutes in all, until golden on every side.',
            'Topește untura într-o tigaie largă și groasă la foc mediu spre mare. Rumenește carnea în două tranșe, aproximativ 10 minute în total, până e aurie pe toate părțile.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'onion',
          text: t(
            'Return the pork to the pan, add the onions and cook for 6 minutes, stirring, until soft and golden at the edges.',
            'Pune carnea înapoi în tigaie, adaugă ceapa și gătește 6 minute, amestecând, până se înmoaie și se rumenește pe margini.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'peppers',
          text: t(
            'Add the bell peppers, hot peppers and garlic and cook for 8 minutes, stirring, until they start to soften and brown in spots.',
            'Adaugă ardeii grași, ardeii iuți și usturoiul și gătește 8 minute, amestecând, până încep să se înmoaie și să se rumenească pe alocuri.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'paprika',
          text: t(
            'Take the pan off the heat, stir in the paprika for 30 seconds so it does not scorch, then add the tomatoes, salt and pepper and put it back on low heat.',
            'Dă tigaia de pe foc, amestecă boiaua 30 de secunde ca să nu se ardă, apoi adaugă roșiile, sarea și piperul și pune-o înapoi la foc mic.',
          ),
          timerSeconds: 30,
        },
        {
          key: 'simmer',
          text: t(
            'Cover and simmer on low heat for 40 minutes, stirring now and then, until a fork slides into the pork with no resistance and the meat has no pink inside. Add a splash of water only if it catches.',
            'Acoperă și fierbe la foc mic 40 de minute, amestecând din când în când, până când furculița intră fără rezistență în carne, iar în interior nu mai e roz. Adaugă puțină apă doar dacă se prinde de fund.',
          ),
          timerSeconds: 2400,
        },
        {
          key: 'reduce',
          text: t(
            'Uncover and simmer for 10 minutes more, until the sauce is thick and the oil shows red at the edges. Sprinkle with parsley and serve with bread.',
            'Ia capacul și mai fierbe 10 minute, până când sosul se îngroașă, iar grăsimea apare roșiatică pe margini. Presară pătrunjel și servește cu pâine.',
          ),
          timerSeconds: 600,
        },
      ],
      stepTips: [
        {
          step: 'peppers',
          text: t(
            'The peppers give the sauce its body, so do not skimp on them. Taste a slice of hot pepper first, since the heat varies a lot.',
            'Ardeii dau corp sosului, așa că nu te zgârci cu ei. Gustă întâi o rondea de ardei iute, fiindcă iuțeala diferă mult de la unul la altul.',
          ),
        },
      ],
      nutritionNote: t(
        'More vegetables than the base, so more fibre and a lighter plate. The pork neck and lard still bring a lot of saturated fat, and the hot peppers can upset a sensitive stomach. Bread adds carbohydrates.',
        'Are mai multe legume decât tochitura, deci mai multe fibre și o farfurie mai ușoară. Ceafa și untura aduc totuși multă grăsime saturată, iar ardeii iuți pot deranja un stomac sensibil. Pâinea adaugă carbohidrați.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Cucumber', 'Castraveți'),
          reason: t(
            'Cool, crisp slices refresh the palate between spicy, rich bites.',
            'Rondelele reci și crocante împrospătează gustul între îmbucăturile iuți și grase.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'cucumber',
        },
        {
          kind: 'food',
          label: t('Kajmak', 'Caimac (kajmak)'),
          reason: t(
            'The cool, rich cream softens the heat of the hot peppers.',
            'Caimacul rece și gras îmblânzește iuțeala ardeilor.',
          ),
          principle: 'complement_flavour',
          ingredient: 'kajmak',
        },
        {
          kind: 'drink',
          label: t('Beer', 'Bere'),
          reason: t(
            'Cold beer refreshes between spicy, fatty bites.',
            'Berea rece împrospătează gustul între îmbucăturile iuți și grase.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
        {
          kind: 'drink',
          label: t('Red wine', 'Vin roșu'),
          reason: t(
            'A dry red matches the body of the pepper and tomato sauce.',
            'Un vin roșu sec se potrivește cu corpul sosului de ardei și roșii.',
          ),
          principle: 'complement_flavour',
          ingredient: 'red-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, spicy stew warms you on a cold day.',
            'O tocăniță fierbinte și iute te încălzește într-o zi rece.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from the pork and carbohydrates from the bread.',
            'Proteine din carnea de porc și carbohidrați din pâine.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Fatty pork and hot peppers can keep you awake or give heartburn.',
            'Porcul gras și ardeii iuți pot da arsuri sau pot strica somnul.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'A long-cooked hot stew is too heavy for summer heat.',
            'O tocăniță fierbinte, gătită îndelung, e prea grea pentru căldura verii.',
          ),
        },
      ],
    },
    {
      slug: 'tochitura-greek',
      cuisine: 'greek',
      title: t(
        'Hirino tigania (Greek pan-fried pork with wine and mustard)',
        'Hirino tigania (porc la tigaie cu vin și muștar, ca în Grecia)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 25,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'pork-neck',
          quantity: 600,
          unit: 'g',
          note: t('cut into 2 cm pieces', 'tăiată bucăți de 2 cm'),
        },
        { ingredient: 'olive-oil', quantity: 45, unit: 'ml' },
        {
          ingredient: 'bell-pepper',
          quantity: 1,
          unit: 'pcs',
          optional: true,
          note: t('green, cut into strips', 'verde, tăiat fâșii'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          optional: true,
          note: t('sliced', 'tăiat felii'),
        },
        { ingredient: 'white-wine', quantity: 100, unit: 'ml' },
        { ingredient: 'mustard', quantity: 20, unit: 'g' },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'half juiced, half cut into wedges',
            'jumătate stoarsă, jumătate tăiată felii',
          ),
        },
        { ingredient: 'oregano', quantity: 2, unit: 'g' },
        { ingredient: 'salt', quantity: 4, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1.5, unit: 'g' },
      ],
      steps: [
        {
          key: 'prep',
          text: t(
            'Cut the pork into 2 cm pieces and pat very dry. Slice the pepper and garlic, and squeeze half the lemon.',
            'Taie ceafa bucăți de 2 cm și șterge-o foarte bine cu prosoape de hârtie. Taie ardeiul și usturoiul și stoarce jumătate de lămâie.',
          ),
        },
        {
          key: 'fry',
          text: t(
            'Heat 30 ml of the oil in a wide pan over high heat until it shimmers. Fry the pork in two batches for about 6 minutes each, turning rarely, until browned and crusty at the edges, lifting each batch onto a plate.',
            'Încinge 30 ml din ulei într-o tigaie largă la foc mare, până când se vede că tremură la suprafață. Prăjește carnea în două tranșe, câte 6 minute, întorcând-o rar, până se rumenește și face crustă la margini, scoțând fiecare tranșă pe o farfurie.',
          ),
          timerSeconds: 720,
        },
        {
          key: 'pepper',
          text: t(
            'Return all the pork to the pan and push it to one side. Add the remaining oil, the green pepper and the garlic and cook for 3 minutes, until the pepper softens and the garlic is pale gold.',
            'Pune toată carnea înapoi în tigaie și dă-o la o parte. Adaugă uleiul rămas, ardeiul verde și usturoiul și gătește 3 minute, până ardeiul se înmoaie, iar usturoiul devine auriu-pal.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'wine',
          text: t(
            'Pour in the wine, add the oregano, salt and pepper and boil for 3 minutes, scraping the pan, until the wine has reduced by about half.',
            'Toarnă vinul, adaugă oregano, sarea și piperul și fierbe 3 minute, răzuind fundul tigăii, până vinul scade aproximativ la jumătate.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'mustard',
          text: t(
            'Take the pan off the heat, stir in the mustard and lemon juice. Cut one piece open: it must be white-grey right through with no pink and clear juices (at least 70 °C in the centre). If it is not, cook it on low heat for 2 minutes more.',
            'Dă tigaia de pe foc și amestecă muștarul și sucul de lămâie. Taie o bucată: trebuie să fie albă-cenușie pe toată grosimea, fără urmă de roz, iar sucul să fie limpede (cel puțin 70 °C la mijloc). Dacă nu e, mai ține tigaia 2 minute la foc mic.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Serve hot, straight from the pan, with lemon wedges.',
            'Servește fierbinte, direct din tigaie, cu felii de lămâie.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'fry',
          text: t(
            'Keep the heat high and the pieces small. Pork that goes in cold and wet stews grey and tough instead of crisping.',
            'Ține focul tare și bucățile mici. Carnea pusă rece și umedă în tigaie se fierbe cenușie și tare în loc să se rumenească.',
          ),
        },
      ],
      nutritionNote: t(
        'A quick, high-protein dish with olive oil, which is mostly unsaturated fat. The pork neck is still fatty, and the mustard and added salt make it fairly salty. Without bread or potatoes it is light on carbohydrates and fibre.',
        'Un fel rapid, bogat în proteine, cu ulei de măsline, care are în mare parte grăsimi nesaturate. Ceafa rămâne totuși grasă, iar muștarul și sarea o fac destul de sărată. Fără pâine sau cartofi are puțini carbohidrați și puține fibre.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Greek meze platter', 'Platou grecesc de meze'),
          reason: t(
            'Tigania is a tavern meze, so it sits naturally among small shared dishes.',
            'Tigania e un meze de tavernă, așa că se potrivește printre preparate mici, de împărțit.',
          ),
          principle: 'regional_tradition',
          recipe: 'appetizer-platter-greek',
        },
        {
          kind: 'food',
          label: t('Pita bread', 'Lipie'),
          reason: t(
            'Soft, warm bread mops up the wine and mustard juices.',
            'Pâinea moale și caldă ia sosul de vin și muștar din tigaie.',
          ),
          principle: 'contrast_texture',
          ingredient: 'pita',
        },
        {
          kind: 'food',
          label: t('Greek yogurt', 'Iaurt grecesc'),
          reason: t(
            'Cool, creamy yogurt balances the sharp mustard and lemon.',
            'Iaurtul rece și cremos echilibrează muștarul și lămâia.',
          ),
          principle: 'complement_flavour',
          ingredient: 'greek-yogurt',
        },
        {
          kind: 'drink',
          label: t('Beer', 'Bere'),
          reason: t(
            'Cold beer cleanses the palate between rich, salty bites.',
            'Berea rece curăță gustul între îmbucăturile bogate și sărate.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
      ],
      eatingMoments: [
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Fried fatty pork sits heavy before bed.',
            'Porcul gras prăjit cade greu înainte de culcare.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein-rich; add pita or potatoes for carbohydrates.',
            'Bogat în proteine; adaugă lipie sau cartofi pentru carbohidrați.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Fried pork and oil sit heavy in the stomach during hard exercise.',
            'Porcul prăjit și uleiul cad greu la stomac în timpul unui efort intens.',
          ),
        },
      ],
    },
  ],
};
