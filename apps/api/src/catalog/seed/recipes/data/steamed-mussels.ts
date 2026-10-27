import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Steamed mussels base is moules marinières: mussels steamed open in white
// wine, shallot, garlic and butter. Each Variant is a full Recipe with its own
// lines, steps and guidance; the base's Recipe-level Tips are inherited.
export const steamedMussels: BaseRecipeSeed = {
  slug: 'steamed-mussels',
  title: t(
    'Mussels in white wine (moules marinières)',
    'Midii în vin alb (moules marinières)',
  ),
  servings: 2,
  prepMinutes: 20,
  cookMinutes: 15,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'mussels',
      quantity: 1000,
      unit: 'g',
      note: t('live, in the shell', 'vii, în cochilie'),
    },
    {
      ingredient: 'shallot',
      quantity: 60,
      unit: 'g',
      note: t('finely chopped', 'tocată mărunt'),
    },
    {
      ingredient: 'garlic',
      quantity: 10,
      unit: 'g',
      note: t(
        'about 3 cloves, thinly sliced',
        'aproximativ 3 căței, tăiați felii subțiri',
      ),
    },
    {
      ingredient: 'butter',
      key: 'butter-sauce',
      quantity: 30,
      unit: 'g',
      note: t('for softening the shallot', 'pentru călitul șalotei'),
    },
    {
      ingredient: 'white-wine',
      quantity: 200,
      unit: 'ml',
      note: t('dry', 'sec'),
    },
    {
      ingredient: 'thyme',
      quantity: 3,
      unit: 'g',
      optional: true,
      note: t('a few fresh sprigs', 'câteva crenguțe proaspete'),
    },
    {
      ingredient: 'bay-leaves',
      quantity: 0.4,
      unit: 'g',
      optional: true,
      note: t('2 dried leaves', '2 foi uscate'),
    },
    {
      ingredient: 'butter',
      key: 'butter-finish',
      quantity: 20,
      unit: 'g',
      note: t('cold, to finish', 'rece, la final'),
    },
    {
      ingredient: 'parsley',
      quantity: 15,
      unit: 'g',
      note: t('leaves, roughly chopped', 'frunze, tocate grosier'),
    },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
    {
      ingredient: 'baguette',
      quantity: 1,
      unit: 'pcs',
      note: t('for the juices', 'pentru sos'),
    },
  ],
  steps: [
    {
      key: 'sort',
      text: t(
        'Tip the mussels into a large bowl and look through them. Tap every open mussel on the counter or with your finger: if it does not close within a minute or so, throw it away. Throw away any with a cracked or broken shell.',
        'Pune midiile într-un castron mare și verifică-le pe rând. Lovește ușor fiecare midie deschisă de blat sau apas-o cu degetul: dacă nu se închide în cel mult un minut, aruncă-o. Aruncă și midiile cu cochilia crăpată sau ruptă.',
      ),
    },
    {
      key: 'clean',
      text: t(
        'Just before cooking, rinse the mussels in a colander under cold running water and scrub off any grit. Pull out the beard, the tuft of threads at the edge of the shell, with a tug toward the hinge end of the shell.',
        'Chiar înainte de gătit, clătește midiile într-o strecurătoare sub jet de apă rece și freacă-le să se ducă nisipul. Smulge „barba”, ciucurele de fire de la marginea cochiliei, trăgând spre capătul cu balamaua.',
      ),
    },
    {
      key: 'chop',
      text: t(
        'Chop the shallot finely, slice the garlic thinly and roughly chop the parsley leaves.',
        'Toacă șalota mărunt, taie usturoiul felii subțiri și toacă grosier frunzele de pătrunjel.',
      ),
    },
    {
      key: 'soften',
      text: t(
        'Melt 30 g of the butter in a wide pot of at least 4 litres over medium heat. Add the shallot and cook for 3 minutes, stirring, until soft and translucent but not browned.',
        'Topește 30 g din unt într-o oală lată, de minimum 4 litri, la foc mediu. Adaugă șalota și gătește 3 minute, amestecând, până se înmoaie și devine translucidă, fără să se rumenească.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'garlic',
      text: t(
        'Add the garlic and stir for 30 seconds, until it smells fragrant but has not coloured.',
        'Adaugă usturoiul și amestecă 30 de secunde, până miroase frumos, dar nu s-a colorat.',
      ),
      timerSeconds: 30,
    },
    {
      key: 'wine',
      text: t(
        'Pour in the wine, add the thyme and bay leaves, turn the heat to high and boil for 2 minutes to take the raw edge off the alcohol.',
        'Toarnă vinul, adaugă cimbrul și foile de dafin, dă focul la maximum și fierbe 2 minute, ca să se ducă asprimea alcoolului.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'steam',
      text: t(
        'Tip in the mussels, cover with the lid and steam over high heat for 4 to 5 minutes, shaking the pot firmly once or twice, until the shells have opened wide.',
        'Adaugă midiile, acoperă cu capac și gătește la abur, la foc iute, 4-5 minute, scuturând oala energic o dată sau de două ori, până când cochiliile se deschid larg.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'discard',
      text: t(
        'Take the pot off the heat. Throw away any mussel that stayed closed after cooking.',
        'Ia oala de pe foc. Aruncă orice midie care a rămas închisă după gătit.',
      ),
    },
    {
      key: 'finish',
      text: t(
        'Stir in the remaining 20 g of cold butter, the parsley and the pepper, and taste the juices; they rarely need salt. Ladle the mussels and the juices into warm bowls and serve at once with the baguette.',
        'Amestecă cele 20 g de unt rece rămase, pătrunjelul și piperul și gustă sosul; rareori mai are nevoie de sare. Pune midiile și sosul în boluri calde și servește imediat cu baghetă.',
      ),
    },
  ],
  tips: [
    t(
      'Buy mussels from a fishmonger or supermarket, never gathered wild, since some shellfish toxins are not destroyed by cooking. Buy them the day you cook them. Keep them cold in an open bowl under a damp cloth in the fridge, never in water and never in a sealed bag: they are alive and need to breathe.',
      'Cumpără midiile de la pescărie sau din supermarket, niciodată culese din natură, pentru că unele toxine din fructele de mare nu se distrug la gătit. Cumpără-le în ziua în care le gătești. Ține-le la rece, într-un bol deschis, acoperite cu o cârpă umedă, în frigider; niciodată în apă și niciodată în pungă închisă: sunt vii și au nevoie să respire.',
    ),
    t(
      'Mussels carry their own seawater, so the juices are already salty. Taste before you add any salt.',
      'Midiile au în ele apă de mare, așa că sosul lor e deja sărat. Gustă înainte să adaugi sare.',
    ),
    t(
      'Use a pot wide enough that the mussels sit no more than three or four deep, so they open evenly.',
      'Folosește o oală destul de lată ca midiile să stea cel mult în trei-patru straturi; așa se deschid uniform.',
    ),
    t(
      'Cook with a dry white wine you would be happy to drink. A sweet one makes the sauce cloying.',
      'Gătește cu un vin alb sec pe care l-ai bea cu plăcere. Unul dulce face sosul prea dulceag.',
    ),
    t(
      'If any mussels are left over, take them out of the shells and chill them within 2 hours, eat them within a day, and reheat until steaming hot.',
      'Dacă rămân midii, scoate-le din cochilii și pune-le la frigider în maximum 2 ore, mănâncă-le în cel mult o zi și încălzește-le până scot aburi.',
    ),
  ],
  stepTips: [
    {
      step: 'sort',
      text: t(
        'A tired mussel can take a minute to close after a tap, so give it a little time before you throw it away. One that stays open is dead.',
        'O midie obosită poate avea nevoie de un minut ca să se închidă după ce o lovești, așa că dă-i puțin timp înainte s-o arunci. Cea care rămâne deschisă e moartă.',
      ),
    },
    {
      step: 'finish',
      text: t(
        'Leave the last spoonful of juices in the pot when you serve: any sand that got through settles there.',
        'Lasă ultima lingură de sos în oală când servești: acolo se adună nisipul care a mai rămas.',
      ),
    },
  ],
  nutritionNote: t(
    'Mussels are a lean, filling source of protein and low in fat. The butter and the bread add saturated fat and refined carbohydrate, and the juices are salty, so go easy on the butter and extra salt. Not for anyone with a shellfish allergy.',
    'Midiile sunt o sursă de proteine slabe, care te satură, cu puține grăsimi. Untul și pâinea aduc grăsimi saturate și carbohidrați rafinați, iar sosul e sărat, așa că folosește puțin unt și nu adăuga sare în plus. Nu sunt potrivite pentru cine are alergie la fructe de mare.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('French fries', 'Cartofi prăjiți'),
      reason: t(
        'Moules-frites: crisp, salty chips to dip in the winey juices.',
        'Moules-frites: cartofi crocanți și sărați, de înmuiat în sosul cu vin.',
      ),
      principle: 'contrast_texture',
      ingredient: 'french-fries',
    },
    {
      kind: 'food',
      label: t('Mixed salad leaves', 'Salată de frunze mixte'),
      reason: t(
        'Fresh, lightly dressed leaves cut through the buttery juices.',
        'Frunzele proaspete, cu puțin dressing, taie din bogăția sosului cu unt.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'mixed-salad',
    },
    {
      kind: 'drink',
      label: t('Cold lager', 'Bere blondă rece'),
      reason: t(
        'Its bitterness and fizz refresh the palate between salty, buttery bites.',
        'Amăreala și bulele ei împrospătează gustul între îmbucăturile sărate, cu unt.',
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
        'Lean protein with bread, ready in about half an hour.',
        'Proteine slabe, cu pâine, gata în aproximativ o jumătate de oră.',
      ),
    },
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A steaming bowl of hot, winey broth warms you up.',
        'Un bol aburind de supă fierbinte, cu vin, te încălzește.',
      ),
    },
  ],
  variants: [
    // -------------------------------------------------------------------- Thai
    {
      slug: 'steamed-mussels-thai',
      cuisine: 'thai',
      title: t(
        'Thai steamed mussels with lemongrass and basil (hoi malaeng phu op)',
        'Midii thailandeze cu lemongrass și busuioc (hoi malaeng phu op)',
      ),
      servings: 2,
      prepMinutes: 25,
      cookMinutes: 12,
      difficulty: 'easy',
      hideBaseTips: [3],
      lines: [
        {
          ingredient: 'mussels',
          quantity: 1000,
          unit: 'g',
          note: t('live, in the shell', 'vii, în cochilie'),
        },
        {
          ingredient: 'lemongrass',
          quantity: 60,
          unit: 'g',
          note: t('2 stalks', '2 tulpini'),
        },
        {
          ingredient: 'galangal',
          quantity: 20,
          unit: 'g',
          note: t('thinly sliced', 'tăiat felii subțiri'),
        },
        {
          ingredient: 'makrut-lime-leaves',
          quantity: 2,
          unit: 'g',
          note: t('about 4 leaves', 'aproximativ 4 frunze'),
        },
        {
          ingredient: 'still-water',
          quantity: 0.1,
          unit: 'l',
          note: t('100 ml', '100 ml'),
        },
        {
          ingredient: 'thai-basil',
          quantity: 20,
          unit: 'g',
          note: t('leaves', 'frunze'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t(
            'about 3 cloves, for the sauce',
            'aproximativ 3 căței, pentru sos',
          ),
        },
        {
          ingredient: 'birds-eye-chilli',
          quantity: 3,
          unit: 'pcs',
          note: t('for the sauce', 'pentru sos'),
        },
        {
          ingredient: 'coriander',
          quantity: 25,
          unit: 'g',
          note: t(
            'with the roots if you can get them; roots (or a few stems) for the sauce, leaves to finish',
            'cu rădăcini, dacă găsești; rădăcinile (sau câteva tulpini) pentru sos, frunzele la final',
          ),
        },
        {
          ingredient: 'lime',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'one for the juice, one cut in wedges',
            'una pentru suc, una tăiată felii',
          ),
        },
        { ingredient: 'fish-sauce', quantity: 20, unit: 'ml' },
        { ingredient: 'sugar', quantity: 10, unit: 'g' },
      ],
      steps: [
        {
          key: 'sort',
          text: t(
            'Tip the mussels into a large bowl and look through them. Tap every open mussel: if it does not close within a minute or so, throw it away. Throw away any with a cracked or broken shell.',
            'Pune midiile într-un castron mare și verifică-le pe rând. Lovește ușor fiecare midie deschisă: dacă nu se închide în cel mult un minut, aruncă-o. Aruncă și midiile cu cochilia crăpată sau ruptă.',
          ),
        },
        {
          key: 'clean',
          text: t(
            'Just before cooking, rinse the mussels in a colander under cold running water, scrub off any grit and pull out the beard, the tuft of threads at the edge of the shell.',
            'Chiar înainte de gătit, clătește midiile într-o strecurătoare sub jet de apă rece, freacă-le să se ducă nisipul și smulge „barba”, ciucurele de fire de la marginea cochiliei.',
          ),
        },
        {
          key: 'sauce',
          text: t(
            'Pound the garlic, the coriander roots (or a few stems if you have no roots) and the chillies in a mortar to a coarse paste, or chop them very finely. Stir in the sugar, the juice of 1 lime and the fish sauce until the sugar dissolves. Taste: it should be sharp, salty, a little sweet and hot. Set it aside.',
            'Pisează într-un mojar usturoiul, rădăcinile de coriandru (sau câteva tulpini, dacă nu ai rădăcini) și ardeii iuți până obții o pastă grosieră sau toacă-le foarte mărunt. Adaugă zahărul, sucul de la o lime și sosul de pește și amestecă până se topește zahărul. Gustă: trebuie să fie acru, sărat, ușor dulce și iute. Pune-l deoparte.',
          ),
        },
        {
          key: 'aromatics',
          text: t(
            'Trim the lemongrass, bruise the stalks with the back of a knife and cut them into 5 cm pieces. Tear the lime leaves in half.',
            'Curăță lemongrassul, strivește tulpinile cu partea boantă a cuțitului și taie-le bucăți de 5 cm. Rupe frunzele de lime în două.',
          ),
        },
        {
          key: 'perfume',
          text: t(
            'Put the lemongrass, galangal, lime leaves and the water in a wide pot of at least 4 litres, cover, bring to the boil and simmer for 3 minutes so the water takes on their scent.',
            'Pune lemongrassul, galangalul, frunzele de lime și apa într-o oală lată, de minimum 4 litri, acoperă, adu la fierbere și lasă să fiarbă încet 3 minute, ca apa să capete aroma lor.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'steam',
          text: t(
            'Tip the mussels on top, cover and steam over high heat for 4 to 5 minutes, shaking the pot once or twice, until the shells have opened wide.',
            'Pune midiile deasupra, acoperă și gătește la abur, la foc iute, 4-5 minute, scuturând oala o dată sau de două ori, până când cochiliile se deschid larg.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'discard',
          text: t(
            'Take the pot off the heat. Throw away any mussel that stayed closed after cooking.',
            'Ia oala de pe foc. Aruncă orice midie care a rămas închisă după gătit.',
          ),
        },
        {
          key: 'finish',
          text: t(
            'Toss in the Thai basil and half the coriander leaves and put the lid back on for 30 seconds, until the basil wilts. Serve the mussels with some of the juices, the rest of the coriander, the lime wedges and the sauce for dipping.',
            'Adaugă busuiocul thailandez și jumătate din frunzele de coriandru, pune la loc capacul 30 de secunde, până se ofilește busuiocul. Servește midiile cu puțin din sosul din oală, cu restul de coriandru, felii de lime și sosul pentru înmuiat.',
          ),
          timerSeconds: 30,
        },
      ],
      tips: [
        t(
          'Three small Thai chillies make a fiery sauce. For a milder one, use a single chilli.',
          'Trei ardei thailandezi fac un sos foarte iute. Pentru unul mai blând, folosește un singur ardei.',
        ),
      ],
      stepTips: [
        {
          step: 'sauce',
          text: t(
            'Make the sauce before you start the pot so it can sit and mellow while the mussels cook.',
            'Fă sosul înainte să pui oala pe foc, ca să se îmbine aromele cât gătești midiile.',
          ),
        },
      ],
      nutritionNote: t(
        'Light and lean: mussels give protein with little fat, and there is no butter or wine. Fish sauce makes the dipping sauce very salty, so dip lightly. Lemongrass, galangal, basil and lime add flavour without fat. Not for anyone with a shellfish allergy.',
        'Ușor și sărac în grăsimi: midiile aduc proteine cu puține grăsimi, iar aici nu e nici unt, nici vin. Sosul de pește face sosul de înmuiat foarte sărat, așa că înmoaie ușor. Lemongrassul, galangalul, busuiocul și lime-ul dau gust fără grăsime. Nu sunt potrivite pentru cine are alergie la fructe de mare.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Jasmine rice', 'Orez jasmine'),
          reason: t(
            'Plain steamed rice is a mild partner for the lemongrass and basil, and soaks up the juices.',
            'Orezul simplu, fiert la abur, e un partener blând pentru lemongrass și busuioc și absoarbe sosul.',
          ),
          principle: 'complement_flavour',
          ingredient: 'jasmine-rice',
        },
        {
          kind: 'food',
          label: t('Sliced cucumber', 'Castravete felii'),
          reason: t(
            'Cool and crisp against the hot, sharp sauce.',
            'Rece și crocant, contrastează cu sosul iute și acrișor.',
          ),
          principle: 'contrast_texture',
          ingredient: 'cucumber',
        },
        {
          kind: 'drink',
          label: t('Cold lager', 'Bere blondă rece'),
          reason: t(
            'Cold, light beer cools the chilli and refreshes the palate.',
            'Berea ușoară și rece răcorește gura după ardei și împrospătează gustul.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
      ],
      eatingMoments: [
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Light, fresh and sharp with lime; no heavy sauce.',
            'Ușor, proaspăt și acrișor din lime; fără sos greu.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Lean protein and plenty of herbs, ready in under half an hour.',
            'Proteine slabe și multe ierburi aromatice, gata în mai puțin de o jumătate de oră.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein for recovery; serve with rice for carbohydrates.',
            'Proteine pentru refacere; servește cu orez pentru carbohidrați.',
          ),
        },
      ],
    },
    // ----------------------------------------------------------------- Spanish
    {
      slug: 'steamed-mussels-spanish',
      cuisine: 'spanish',
      title: t(
        'Mussels in tomato and paprika sauce (mejillones a la marinera)',
        'Midii în sos de roșii și boia, ca în Spania (mejillones a la marinera)',
      ),
      servings: 2,
      prepMinutes: 20,
      cookMinutes: 36,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'mussels',
          quantity: 1000,
          unit: 'g',
          note: t('live, in the shell', 'vii, în cochilie'),
        },
        {
          ingredient: 'white-wine',
          quantity: 100,
          unit: 'ml',
          note: t('dry', 'sec'),
        },
        {
          ingredient: 'bay-leaves',
          quantity: 0.4,
          unit: 'g',
          note: t('2 dried leaves', '2 foi uscate'),
        },
        { ingredient: 'olive-oil', quantity: 40, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('small, finely chopped', 'mică, tocată mărunt'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t(
            'about 3 cloves, finely chopped',
            'aproximativ 3 căței, tocați mărunt',
          ),
        },
        {
          ingredient: 'paprika',
          quantity: 5,
          unit: 'g',
          note: t('sweet, not smoked', 'dulce, nu afumată'),
        },
        {
          ingredient: 'dried-red-chillies',
          quantity: 1,
          unit: 'g',
          note: t(
            '1 whole dried chilli (guindilla)',
            '1 ardei iute uscat întreg (guindilla)',
          ),
        },
        {
          ingredient: 'canned-tomatoes',
          quantity: 200,
          unit: 'g',
          note: t('crushed', 'zdrobite'),
        },
        {
          ingredient: 'flour',
          quantity: 10,
          unit: 'g',
          optional: true,
          note: t('to thicken the sauce a little', 'pentru a lega ușor sosul'),
        },
        {
          ingredient: 'parsley',
          quantity: 10,
          unit: 'g',
          note: t('leaves, chopped', 'frunze, tocate'),
        },
        {
          ingredient: 'baguette',
          quantity: 1,
          unit: 'pcs',
          note: t('for the sauce', 'pentru sos'),
        },
      ],
      steps: [
        {
          key: 'sort',
          text: t(
            'Tip the mussels into a large bowl and look through them. Tap every open mussel: if it does not close within a minute or so, throw it away. Throw away any with a cracked or broken shell.',
            'Pune midiile într-un castron mare și verifică-le pe rând. Lovește ușor fiecare midie deschisă: dacă nu se închide în cel mult un minut, aruncă-o. Aruncă și midiile cu cochilia crăpată sau ruptă.',
          ),
        },
        {
          key: 'clean',
          text: t(
            'Just before cooking, rinse the mussels in a colander under cold running water, scrub off any grit and pull out the beard, the tuft of threads at the edge of the shell.',
            'Chiar înainte de gătit, clătește midiile într-o strecurătoare sub jet de apă rece, freacă-le să se ducă nisipul și smulge „barba”, ciucurele de fire de la marginea cochiliei.',
          ),
        },
        {
          key: 'open',
          text: t(
            'Put the wine and 1 bay leaf in a wide pot of at least 4 litres, cover and bring to the boil. Tip in the mussels, cover again and steam over high heat for 4 to 5 minutes, shaking the pot once, until the shells have opened.',
            'Pune vinul și o foaie de dafin într-o oală lată, de minimum 4 litri, acoperă și adu la fierbere. Adaugă midiile, acoperă din nou și gătește la abur, la foc iute, 4-5 minute, scuturând oala o dată, până se deschid cochiliile.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'discard',
          text: t(
            'Lift out the open mussels into a bowl. Throw away any that stayed closed after cooking.',
            'Scoate midiile deschise într-un castron. Aruncă orice midie care a rămas închisă după gătit.',
          ),
        },
        {
          key: 'strain',
          text: t(
            'Pour the cooking juices through a fine sieve into a jug, leaving the last spoonful with any sand behind. Wipe out the pot.',
            'Toarnă sosul din oală printr-o sită deasă într-o cană mare, lăsând ultima lingură, cu nisipul. Șterge oala.',
          ),
        },
        {
          key: 'onion',
          text: t(
            'Heat the oil in the pot over medium-low heat. Add the onion and cook for 8 minutes, stirring now and then, until soft and golden at the edges.',
            'Încinge uleiul în oală la foc mic-mediu. Adaugă ceapa și gătește 8 minute, amestecând din când în când, până se înmoaie și se aurește pe margini.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'garlic',
          text: t(
            'Add the garlic and the dried chilli and stir for 1 minute, until fragrant.',
            'Adaugă usturoiul și ardeiul iute uscat și amestecă 1 minut, până miroase frumos.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'paprika',
          text: t(
            'Take the pot off the heat, stir in the paprika for a few seconds, then add the tomatoes straight away, as paprika turns bitter if it burns.',
            'Ia oala de pe foc, amestecă boiaua câteva secunde, apoi adaugă imediat roșiile; boiaua se arde repede și devine amară.',
          ),
        },
        {
          key: 'tomato',
          text: t(
            'Return to medium heat and cook the tomatoes for 10 minutes, stirring, until thick and the oil starts to separate at the edges.',
            'Pune din nou oala la foc mediu și gătește roșiile 10 minute, amestecând, până se îngroașă și uleiul începe să se separe pe margini.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'thicken',
          text: t(
            'If using the flour, sprinkle it in and stir for 1 minute. Pour in the strained juices gradually, stirring, and add the other bay leaf.',
            'Dacă folosești făina, presară-o și amestecă 1 minut. Toarnă treptat sosul strecurat, amestecând, și adaugă cealaltă foaie de dafin.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'simmer',
          text: t(
            'Simmer for 5 minutes, until the sauce coats the back of a spoon. Taste; the juices are already salty, so it rarely needs salt.',
            'Fierbe încet 5 minute, până sosul acoperă dosul lingurii. Gustă; sosul midiilor e deja sărat, așa că rareori mai are nevoie de sare.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'serve',
          text: t(
            'Fish out the dried chilli and the bay leaf. Return the mussels to the pot, cover and heat for 2 minutes, until hot. Scatter with parsley and serve in the sauce, with the baguette.',
            'Scoate ardeiul iute uscat și foaia de dafin. Pune midiile înapoi în oală, acoperă și încălzește 2 minute, până se încing. Presară pătrunjel și servește în sos, cu baghetă.',
          ),
          timerSeconds: 120,
        },
      ],
      tips: [
        t(
          'Break the dried chilli open in the oil for more heat.',
          'Sparge ardeiul iute uscat în ulei dacă vrei mai multă iuțeală.',
        ),
      ],
      stepTips: [
        {
          step: 'tomato',
          text: t(
            'Do not rush the tomato: a sauce that has not cooked down tastes raw and thin.',
            'Nu grăbi roșiile: un sos care nu a scăzut bine are gust crud și e prea subțire.',
          ),
        },
      ],
      nutritionNote: t(
        'Mussels give lean protein and the tomato sauce adds vegetables, with olive oil as the main fat. The bread for the sauce adds refined carbohydrate and the juices are salty, so season with a light hand. Not for anyone with a shellfish allergy.',
        'Midiile aduc proteine slabe, iar sosul de roșii adaugă legume, cu ulei de măsline drept grăsime principală. Pâinea pentru sos aduce carbohidrați rafinați, iar sosul e sărat, așa că sărează cu grijă. Nu sunt potrivite pentru cine are alergie la fructe de mare.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Spanish tapas platter', 'Platou spaniol de tapas'),
          reason: t(
            'Mejillones a la marinera are often served as a tapa alongside other small plates.',
            'Mejillones a la marinera se servesc adesea ca tapas, alături de alte gustări mici.',
          ),
          principle: 'regional_tradition',
          recipe: 'appetizer-platter-spanish',
        },
        {
          kind: 'food',
          label: t('Olives', 'Măsline'),
          reason: t(
            'Their saltiness balances the sweetness of the tomato and paprika sauce.',
            'Sărătura lor echilibrează dulceața sosului de roșii și boia.',
          ),
          principle: 'salt_balances_sweet',
          ingredient: 'olives',
        },
        {
          kind: 'drink',
          label: t('Cold lager', 'Bere blondă rece'),
          reason: t(
            'A cold, light beer refreshes the palate after the spicy, paprika-rich sauce.',
            'O bere ușoară și rece împrospătează gustul după sosul picant, cu multă boia.',
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
            'A hot, paprika-warmed tomato sauce is comforting in cold weather.',
            'Un sos fierbinte de roșii, cu boia, te încălzește pe vreme rece.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Lean protein and vegetables in one pot, with bread for the sauce.',
            'Proteine slabe și legume într-o singură oală, cu pâine pentru sos.',
          ),
        },
      ],
    },
  ],
};
