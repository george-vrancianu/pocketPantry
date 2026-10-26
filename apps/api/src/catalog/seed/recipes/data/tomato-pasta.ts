import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Tomato pasta base is the everyday simmered tomato sauce over spaghetti.
// Each Variant is a full Recipe with its own lines, steps and guidance; the
// base's Recipe-level Tips are inherited unless a Variant hides them.
export const tomatoPasta: BaseRecipeSeed = {
  slug: 'tomato-pasta',
  title: t('Pasta with tomato sauce', 'Paste cu sos de roșii'),
  servings: 4,
  prepMinutes: 10,
  cookMinutes: 30,
  difficulty: 'easy',
  lines: [
    { ingredient: 'spaghetti', quantity: 400, unit: 'g' },
    { ingredient: 'canned-tomatoes', quantity: 800, unit: 'g' },
    {
      ingredient: 'garlic',
      quantity: 12,
      unit: 'g',
      note: t('3 cloves, thinly sliced', '3 căței, tăiați felii subțiri'),
    },
    { ingredient: 'olive-oil', quantity: 45, unit: 'ml' },
    {
      ingredient: 'basil',
      quantity: 10,
      unit: 'g',
      note: t('leaves, torn', 'frunze, rupte cu mâna'),
    },
    {
      ingredient: 'parmesan',
      quantity: 40,
      unit: 'g',
      note: t('finely grated', 'ras fin'),
    },
    {
      ingredient: 'onion',
      quantity: 1,
      unit: 'pcs',
      optional: true,
      note: t('finely chopped', 'tocată mărunt'),
    },
    {
      ingredient: 'sugar',
      quantity: 2,
      unit: 'g',
      optional: true,
      note: t(
        'a pinch, only if the tomatoes taste sharp',
        'un praf, doar dacă roșiile sunt prea acre',
      ),
    },
    { ingredient: 'still-water', quantity: 3, unit: 'l' },
    {
      ingredient: 'salt',
      key: 'salt-water',
      quantity: 30,
      unit: 'g',
      note: t('for the pasta water', 'pentru apa de fiert pastele'),
    },
    {
      ingredient: 'salt',
      key: 'salt-sauce',
      quantity: 3,
      unit: 'g',
      note: t('for the sauce', 'pentru sos'),
    },
    { ingredient: 'black-pepper' },
  ],
  steps: [
    {
      key: 'onion',
      text: t(
        'If you are using the onion, soften it in 30 ml of the olive oil in a wide, heavy pan over low heat for about 8 minutes, until soft and translucent but not coloured. Without onion, just warm the oil.',
        'Dacă folosești ceapa, înmoaie-o în 30 ml de ulei de măsline într-o tigaie lată și grea, la foc mic, aproximativ 8 minute, până devine moale și translucidă, fără să se rumenească. Fără ceapă, doar încălzește uleiul.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'garlic',
      text: t(
        'Add the garlic and stir for 30 to 60 seconds, until it smells sweet and is barely pale gold.',
        'Adaugă usturoiul și amestecă 30-60 de secunde, până miroase dulce și abia capătă o culoare aurie pal.',
      ),
      timerSeconds: 45,
    },
    {
      key: 'boil',
      text: t(
        'Put the water on to boil in a large covered pot, so it is ready by the time the sauce is. Once it boils, stir in the 30 g of salt.',
        'Pune apa la fiert într-o oală mare, cu capac, ca să fie gata când e gata și sosul. Când fierbe, amestecă în ea cei 30 g de sare.',
      ),
    },
    {
      key: 'tomatoes',
      text: t(
        'Tip in the tomatoes, crushing any whole ones with the back of a spoon. Add the 3 g of salt and the sugar, if using. Simmer uncovered over medium-low heat for about 20 minutes, stirring now and then, until the sauce is thick and a little oil shows at the edges.',
        'Adaugă roșiile, strivind cu dosul lingurii pe cele întregi. Pune cei 3 g de sare și zahărul, dacă îl folosești. Fierbe la foc mic-mediu, fără capac, aproximativ 20 de minute, amestecând din când în când, până când sosul se îngroașă și apare un strat subțire de ulei pe margini.',
      ),
      timerSeconds: 1200,
    },
    {
      key: 'pasta',
      text: t(
        'Cook the spaghetti for 1 minute less than the packet says, usually about 9 minutes, until firm to the bite in the centre. Scoop out a mug of the cooking water, then drain.',
        'Fierbe spaghetele cu 1 minut mai puțin decât scrie pe pachet, de obicei aproximativ 9 minute, până sunt încă ferme la mușcat în centru. Ia o cană din apa de fiert, apoi scurge pastele.',
      ),
      timerSeconds: 540,
    },
    {
      key: 'toss',
      text: t(
        'Add the pasta to the sauce with a splash of the cooking water and toss over medium heat for about 1 minute, until the sauce clings and turns glossy. Take off the heat, stir in the basil, the remaining oil and pepper to taste.',
        'Pune pastele în sos împreună cu un strop de apă de la paste și amestecă la foc mediu cam 1 minut, până când sosul se prinde de paste și devine lucios. Ia de pe foc și adaugă busuiocul, uleiul rămas și piper după gust.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'serve',
      text: t(
        'Serve at once in warm bowls, with the parmesan scattered over the top.',
        'Servește imediat, în boluri calde, cu parmezanul presărat deasupra.',
      ),
    },
  ],
  tips: [
    t(
      'Salt the pasta water properly, so it tastes like mild seawater: it is the only chance to season the pasta from the inside.',
      'Sărează apa pentru paste cum trebuie, să aibă gustul unei ape de mare mai puțin sărate: e singura ocazie de a săra pastele pe dinăuntru.',
    ),
    t(
      'Keep a mug of the starchy cooking water: a splash loosens a sauce that has thickened too much and helps it cling, which tap water cannot do.',
      'Păstrează o cană din apa de la paste: un strop slăbește un sos prea gros și îl ajută să se prindă de paste, ceea ce apa de la robinet nu poate face.',
    ),
  ],
  stepTips: [
    {
      step: 'tomatoes',
      text: t(
        'Taste before you add sugar. Good tomatoes need none; a pinch is only to round off a sharp tin.',
        'Gustă înainte de a pune zahăr. Roșiile bune nu au nevoie de el; un praf doar rotunjește o conservă prea acră.',
      ),
    },
    {
      step: 'pasta',
      text: t(
        'Do not rinse the pasta: the starch on the surface is what lets the sauce cling.',
        'Nu clăti pastele: amidonul de la suprafață face ca sosul să se prindă de ele.',
      ),
    },
  ],
  nutritionNote: t(
    'A good source of carbohydrate for energy, with tomatoes adding vitamin C and lycopene and olive oil mostly unsaturated fat; it is low in protein and fibre unless you use wholemeal pasta or add vegetables, and the cheese and salted water add salt.',
    'O sursă bună de carbohidrați pentru energie, cu roșii care aduc vitamina C și licopen și ulei de măsline cu grăsimi în mare parte nesaturate; are puține proteine și fibre dacă nu folosești paste integrale sau nu adaugi legume, iar brânza și apa sărată adaugă sare.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Rocket and lemon salad', 'Salată de rucola cu lămâie'),
      reason: t(
        'Peppery, sharp leaves refresh the palate after the soft, rich pasta.',
        'Frunzele piperate și acrișoare împrospătează gustul după pastele moi și bogate.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'rocket',
    },
    {
      kind: 'food',
      label: t('Ciabatta', 'Ciabatta'),
      reason: t(
        'A crusty piece to mop up the last of the sauce.',
        'O bucată crocantă cu care ștergi ultimul sos din farfurie.',
      ),
      principle: 'contrast_texture',
      ingredient: 'ciabatta',
    },
    {
      kind: 'drink',
      label: t('Light red wine', 'Vin roșu ușor'),
      reason: t(
        'Its acidity matches the acidity of the tomatoes, so neither tastes flat.',
        'Aciditatea lui se potrivește cu cea a roșiilor, așa că niciunul nu pare searbăd.',
      ),
      principle: 'complement_flavour',
      ingredient: 'red-wine',
    },
    {
      kind: 'drink',
      label: t('Sparkling water', 'Apă minerală'),
      reason: t(
        'Bubbles clear the palate between forkfuls.',
        'Bulele curăță gustul între îmbucături.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'sparkling-water',
    },
  ],
  eatingMoments: [
    {
      moment: 'before-workout',
      polarity: 'good_for',
      reason: t(
        'Mostly easily digested carbohydrate, with only moderate fat, if you eat it a couple of hours ahead; keep the oil light if you eat closer to training.',
        'În principal carbohidrați ușor de digerat, cu grăsimi moderate, dacă o mănânci cu câteva ore înainte; folosește mai puțin ulei dacă mănânci mai aproape de antrenament.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Refills energy stores; add some protein on the side.',
        'Reface rezervele de energie; adaugă alături ceva proteine.',
      ),
    },
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t('Warm, simple and filling.', 'Caldă, simplă și săturătoare.'),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A big plate of acidic tomato sauce can bring on heartburn when you lie down.',
        'O porție mare de sos acru de roșii poate da arsuri când te culci.',
      ),
    },
  ],
  variants: [
    {
      slug: 'tomato-pasta-italian',
      cuisine: 'italian',
      title: t("Penne all'arrabbiata", "Penne all'arrabbiata"),
      servings: 4,
      prepMinutes: 5,
      cookMinutes: 25,
      difficulty: 'easy',
      lines: [
        { ingredient: 'penne', quantity: 400, unit: 'g' },
        { ingredient: 'canned-tomatoes', quantity: 800, unit: 'g' },
        {
          ingredient: 'garlic',
          quantity: 16,
          unit: 'g',
          note: t('4 cloves, sliced', '4 căței, tăiați felii'),
        },
        {
          ingredient: 'chilli-flakes',
          quantity: 2,
          unit: 'g',
          note: t('to taste', 'după gust'),
        },
        { ingredient: 'olive-oil', quantity: 60, unit: 'ml' },
        {
          ingredient: 'parsley',
          quantity: 15,
          unit: 'g',
          note: t('leaves, chopped', 'frunze, tocate'),
        },
        { ingredient: 'still-water', quantity: 3, unit: 'l' },
        {
          ingredient: 'salt',
          key: 'salt-water',
          quantity: 30,
          unit: 'g',
          note: t('for the pasta water', 'pentru apa de fiert pastele'),
        },
        {
          ingredient: 'salt',
          key: 'salt-sauce',
          quantity: 3,
          unit: 'g',
          note: t('for the sauce', 'pentru sos'),
        },
      ],
      steps: [
        {
          key: 'boil',
          text: t(
            'Bring the water to a rolling boil in a large pot and stir in the 30 g of salt.',
            'Adu apa la fiert puternic într-o oală mare și amestecă în ea cei 30 g de sare.',
          ),
        },
        {
          key: 'infuse',
          text: t(
            'Warm 45 ml of the olive oil in a wide pan over low heat. Add the garlic and chilli flakes and cook gently for 1 to 2 minutes, until the garlic is pale gold and the oil smells of chilli. Do not let the garlic go brown.',
            'Încălzește 45 ml de ulei de măsline într-o tigaie lată, la foc mic. Adaugă usturoiul și fulgii de chili și gătește blând 1-2 minute, până când usturoiul capătă o culoare aurie pal, iar uleiul miroase a chili. Nu lăsa usturoiul să se rumenească.',
          ),
          timerSeconds: 90,
        },
        {
          key: 'sauce',
          text: t(
            'Add the tomatoes, crushing them with a spoon, and the 3 g of salt. Simmer over medium heat for about 15 minutes, stirring often, until the sauce is thick and a little oil shows at the edges.',
            'Adaugă roșiile, strivindu-le cu lingura, și cei 3 g de sare. Fierbe în clocot ușor, la foc mediu, aproximativ 15 minute, amestecând des, până când sosul se îngroașă și apare puțin ulei pe margini.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'pasta',
          text: t(
            'Meanwhile, cook the penne for 1 minute less than the packet says, usually about 10 minutes. Scoop out a mug of the cooking water, then drain.',
            'Între timp, fierbe penne cu 1 minut mai puțin decât scrie pe pachet, de obicei aproximativ 10 minute. Ia o cană din apa de fiert, apoi scurge pastele.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'toss',
          text: t(
            'Toss the penne in the sauce with a splash of the cooking water for about 1 minute over medium heat, until it clings to the pasta. Off the heat, stir in the parsley and the remaining oil.',
            'Amestecă penne în sos cu un strop de apă de la paste, cam 1 minut la foc mediu, până când sosul se prinde de paste. Ia de pe foc și adaugă pătrunjelul și uleiul rămas.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'serve',
          text: t(
            'Serve at once, without cheese, and with more chilli at the table for those who want it.',
            'Servește imediat, fără brânză, iar pentru cei care vor mai iute, pune chili pe masă.',
          ),
        },
      ],
      tips: [
        t(
          'Chilli flakes vary a lot in heat: start with half, taste the sauce, and add more at the table.',
          'Fulgii de chili diferă mult ca iuțeală: începe cu jumătate, gustă sosul și adaugă mai mult la masă.',
        ),
      ],
      stepTips: [
        {
          step: 'infuse',
          text: t(
            'If the garlic browns, it turns bitter: start again rather than carry on.',
            'Dacă usturoiul se rumenește, devine amar: mai bine o iei de la capăt decât să continui.',
          ),
        },
      ],
      nutritionNote: t(
        'Carbohydrate for energy and tomatoes for vitamin C, with no cheese to add saturated fat; it is low in protein and fibre, and the spice and acidity can upset a sensitive stomach.',
        'Carbohidrați pentru energie și roșii pentru vitamina C, fără brânză care să adauge grăsimi saturate; are puține proteine și fibre, iar iuțeala și aciditatea pot deranja un stomac sensibil.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Mixed green salad', 'Salată verde mixtă'),
          reason: t(
            'Cool, crisp leaves give the mouth a break between spicy forkfuls.',
            'Frunzele reci și crocante dau gurii o pauză între îmbucăturile iuți.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'mixed-salad',
        },
        {
          kind: 'food',
          label: t('Crusty bread', 'Pâine cu crustă'),
          reason: t(
            'Plain bread takes the edge off the spice and mops up the sauce.',
            'Pâinea simplă mai domolește iuțeala și șterge sosul din farfurie.',
          ),
          principle: 'contrast_texture',
          ingredient: 'ciabatta',
        },
        {
          kind: 'drink',
          label: t('Chilled beer', 'Bere rece'),
          reason: t(
            'A cold, light lager refreshes between spicy forkfuls; pick a less hoppy one, since bitterness can make the heat feel stronger.',
            'O bere blondă, rece și ușoară, răcorește între îmbucăturile iuți; alege una mai puțin amăruie, pentru că amăreala poate accentua iuțeala.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
        {
          kind: 'drink',
          label: t('Red wine', 'Vin roșu'),
          reason: t(
            'A fruity, not too heavy red matches the tomato acidity.',
            'Un roșu fructat, nu prea greu, se potrivește cu aciditatea roșiilor.',
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
            'The chilli warms you from the inside.',
            'Chiliul te încălzește pe dinăuntru.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'good_for',
          reason: t(
            'Quick carbohydrate with moderate fat and no cheese, if your stomach copes with spice.',
            'Carbohidrați rapizi cu grăsimi moderate și fără brânză, dacă stomacul tău suportă iuțeala.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Chilli and tomato are a common cause of heartburn at night.',
            'Chiliul și roșiile provoacă des arsuri noaptea.',
          ),
        },
      ],
    },
    {
      slug: 'tomato-pasta-oven-baked',
      method: 'oven-baked',
      // The pasta is only part-cooked and finished in the oven, not in the pan.
      hideBaseTips: [1],
      title: t(
        'Baked tomato pasta with mozzarella',
        'Paste la cuptor cu roșii și mozzarella',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 50,
      difficulty: 'easy',
      lines: [
        { ingredient: 'rigatoni', quantity: 350, unit: 'g' },
        { ingredient: 'passata', quantity: 700, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely chopped', 'tocată mărunt'),
        },
        {
          ingredient: 'garlic',
          quantity: 8,
          unit: 'g',
          note: t('2 cloves, sliced', '2 căței, tăiați felii'),
        },
        { ingredient: 'olive-oil', quantity: 30, unit: 'ml' },
        {
          ingredient: 'mozzarella',
          quantity: 250,
          unit: 'g',
          note: t('drained and torn', 'scursă și ruptă în bucăți'),
        },
        {
          ingredient: 'parmesan',
          quantity: 40,
          unit: 'g',
          note: t('finely grated', 'ras fin'),
        },
        {
          ingredient: 'basil',
          quantity: 10,
          unit: 'g',
          note: t('leaves, torn', 'frunze, rupte cu mâna'),
        },
        { ingredient: 'still-water', quantity: 3, unit: 'l' },
        {
          ingredient: 'salt',
          key: 'salt-water',
          quantity: 30,
          unit: 'g',
          note: t('for the pasta water', 'pentru apa de fiert pastele'),
        },
        {
          ingredient: 'salt',
          key: 'salt-sauce',
          quantity: 2,
          unit: 'g',
          note: t('for the sauce', 'pentru sos'),
        },
        { ingredient: 'black-pepper' },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 200 °C (180 °C fan) and bring the water to a rolling boil in a large pot with the 30 g of salt.',
            'Încinge cuptorul la 200 °C (180 °C cu ventilator) și adu apa la fiert puternic într-o oală mare, cu cei 30 g de sare.',
          ),
        },
        {
          key: 'onion',
          text: t(
            'Soften the onion in the olive oil in a pan over medium-low heat for about 6 minutes, until translucent. Add the garlic and stir for 30 seconds.',
            'Înmoaie ceapa în uleiul de măsline într-o tigaie, la foc mic-mediu, aproximativ 6 minute, până devine translucidă. Adaugă usturoiul și amestecă 30 de secunde.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'sauce',
          text: t(
            'Add the passata and the 2 g of salt and simmer for 10 minutes, until slightly thickened.',
            'Adaugă pasata și cei 2 g de sare și fierbe 10 minute, până se îngroașă puțin.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'pasta',
          text: t(
            'Boil the rigatoni for 4 to 5 minutes less than the packet says, so it is still quite firm. It finishes cooking in the oven. Drain well.',
            'Fierbe rigatoni cu 4-5 minute mai puțin decât scrie pe pachet, ca să rămână destul de fermi. Se vor găti mai departe în cuptor. Scurge-i bine.',
          ),
        },
        {
          key: 'assemble',
          text: t(
            'Toss the pasta with the sauce, half of the basil, half of the mozzarella and a little pepper, and tip into a 22 x 30 cm baking dish. Top with the rest of the mozzarella and the parmesan.',
            'Amestecă pastele cu sosul, jumătate din busuioc, jumătate din mozzarella și puțin piper și toarnă totul într-un vas de copt de 22 x 30 cm. Acoperă cu restul de mozzarella și cu parmezanul.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake on the middle shelf for 20 to 25 minutes, until the sauce bubbles at the edges and the cheese is melted and browned in spots.',
            'Coace pe raftul din mijloc 20-25 de minute, până când sosul clocotește pe margini, iar brânza e topită și rumenită pe alocuri.',
          ),
          timerSeconds: 1320,
        },
        {
          key: 'rest',
          text: t(
            'Rest for 5 minutes, then scatter with the remaining basil and serve.',
            'Lasă 5 minute să se odihnească, apoi presară restul de busuioc și servește.',
          ),
          timerSeconds: 300,
        },
      ],
      tips: [
        t(
          'Pat the mozzarella dry with paper towels after draining: wet cheese leaves a pool of water in the dish.',
          'Șterge mozzarella cu hârtie de bucătărie după ce o scurgi: brânza udă lasă o baltă de apă în vas.',
        ),
      ],
      stepTips: [
        {
          step: 'pasta',
          text: t(
            'If the pasta is cooked through before it goes in, it turns soft and mushy after baking.',
            'Dacă pastele sunt fierte complet înainte de cuptor, ies moi și lipicioase după coacere.',
          ),
        },
      ],
      nutritionNote: t(
        'Filling and a good source of calcium and protein from the cheese, with tomatoes for vitamin C; mozzarella and parmesan add saturated fat and salt, so it is a richer dish than the plain version, and it has little fibre without a vegetable side.',
        'Săturătoare și o sursă bună de calciu și proteine din brânză, cu roșii pentru vitamina C; mozzarella și parmezanul adaugă grăsimi saturate și sare, deci e un preparat mai bogat decât cel simplu, iar fără o garnitură de legume are puține fibre.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Rocket salad with lemon', 'Salată de rucola cu lămâie'),
          reason: t(
            'Peppery leaves and a squeeze of lemon cut through the melted cheese.',
            'Frunzele piperate și un strop de lămâie taie brânza topită.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'rocket',
        },
        {
          kind: 'food',
          label: t('Crusty bread', 'Pâine cu crustă'),
          reason: t(
            'Good for scraping up the browned cheese and sauce from the dish.',
            'Bună pentru a răzui din vas brânza rumenită și sosul.',
          ),
          principle: 'contrast_texture',
          ingredient: 'ciabatta',
        },
        {
          kind: 'drink',
          label: t('Red wine', 'Vin roșu'),
          reason: t(
            'Its acidity and tannin handle the rich cheese and tomato.',
            'Aciditatea și taninul lui se potrivesc cu brânza bogată și cu roșiile.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'red-wine',
        },
        {
          kind: 'drink',
          label: t('Sparkling water with lemon', 'Apă minerală cu lămâie'),
          reason: t(
            'A sharp, bubbly drink resets the palate between rich bites.',
            'O băutură acrișoară și cu bule curăță gustul între îmbucături bogate.',
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
            'Hot, bubbling and comforting from the oven.',
            'Fierbinte, gratinată și reconfortantă, direct din cuptor.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Carbohydrate and cheese protein help recovery.',
            'Carbohidrații și proteinele din brânză ajută la refacere.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'Heavy and cheesy, and it heats the kitchen.',
            'Grea, cu multă brânză, și încălzește bucătăria.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Rich and slow to digest before bed.',
            'Bogată și greu de digerat înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'tomato-pasta-one-pot',
      method: 'one-pot',
      // No separate boiling or draining: both base tips are about that.
      hideBaseTips: [0, 1],
      title: t('One-pot tomato pasta', 'Paste cu roșii într-o singură oală'),
      servings: 4,
      prepMinutes: 10,
      cookMinutes: 25,
      difficulty: 'easy',
      lines: [
        { ingredient: 'spaghetti', quantity: 320, unit: 'g' },
        {
          ingredient: 'cherry-tomato',
          quantity: 400,
          unit: 'g',
          note: t('halved', 'tăiate pe jumătate'),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('thinly sliced', 'tăiată subțire'),
        },
        {
          ingredient: 'garlic',
          quantity: 12,
          unit: 'g',
          note: t('3 cloves, sliced', '3 căței, tăiați felii'),
        },
        { ingredient: 'olive-oil', quantity: 45, unit: 'ml' },
        {
          ingredient: 'basil',
          quantity: 10,
          unit: 'g',
          note: t('leaves, torn', 'frunze, rupte cu mâna'),
        },
        {
          ingredient: 'parmesan',
          quantity: 40,
          unit: 'g',
          note: t('finely grated', 'ras fin'),
        },
        { ingredient: 'still-water', quantity: 0.9, unit: 'l' },
        { ingredient: 'salt', quantity: 5, unit: 'g' },
        { ingredient: 'black-pepper' },
      ],
      steps: [
        {
          key: 'onion',
          text: t(
            'Soften the onion in 30 ml of the olive oil in a wide, deep pan or shallow pot (about 28 cm) over medium heat for about 5 minutes, until translucent. Add the garlic and stir for 30 seconds.',
            'Înmoaie ceapa în 30 ml de ulei de măsline într-o tigaie lată și adâncă sau o cratiță joasă (cam 28 cm), la foc mediu, aproximativ 5 minute, până devine translucidă. Adaugă usturoiul și amestecă 30 de secunde.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'tomatoes',
          text: t(
            'Add the tomatoes and a pinch of the salt and cook for about 3 minutes, until the skins split and they start to give up their juice.',
            'Adaugă roșiile și un praf din sare și gătește cam 3 minute, până crapă coaja și încep să lase suc.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'water',
          text: t(
            'Pour in the water, add the rest of the salt and bring to a boil. Lay in the spaghetti, pressing it down as it softens until it is all submerged.',
            'Toarnă apa, adaugă restul de sare și adu la fierbere. Pune spaghetele în tigaie, apăsându-le pe măsură ce se înmoaie, până sunt toate acoperite de lichid.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Simmer briskly for 9 to 10 minutes, turning the pasta with tongs every minute, until it is al dente and the liquid has reduced to a glossy sauce. If it gets dry before the pasta is tender, add a splash of hot water.',
            'Fierbe viguros 9-10 minute, întorcând pastele cu cleștele în fiecare minut, până când sunt al dente, iar lichidul s-a redus la un sos lucios. Dacă se usucă înainte ca pastele să fie moi, adaugă un strop de apă fierbinte.',
          ),
          timerSeconds: 570,
        },
        {
          key: 'finish',
          text: t(
            'Take off the heat and stir in the remaining oil, the basil, half of the parmesan and pepper to taste. Rest for 1 minute, then serve with the rest of the parmesan.',
            'Ia de pe foc și adaugă uleiul rămas, busuiocul, jumătate din parmezan și piper după gust. Lasă 1 minut, apoi servește cu restul de parmezan.',
          ),
          timerSeconds: 60,
        },
      ],
      tips: [
        t(
          'Start with the amount of water given and keep about 200 ml of hot water at hand: too much leaves a thin sauce, and you can always add a splash but not take it away.',
          'Începe cu cantitatea de apă din rețetă și ține la îndemână vreo 200 ml de apă fierbinte: prea multă lasă un sos subțire, iar un strop poți adăuga oricând, dar nu poți scoate.',
        ),
      ],
      stepTips: [
        {
          step: 'simmer',
          text: t(
            'Keep turning the pasta: without stirring, it sticks together and to the bottom of the pan.',
            'Continuă să întorci pastele: dacă nu le amesteci, se lipesc între ele și de fundul tigăii.',
          ),
        },
      ],
      nutritionNote: t(
        'Fresh tomatoes and onion add vitamin C and some fibre, with modest oil and cheese; it is still mostly carbohydrate and low in protein, so add a protein side if it is your main meal.',
        'Roșiile proaspete și ceapa adaugă vitamina C și ceva fibre, cu ulei și brânză în cantitate moderată; rămâne totuși mai ales o sursă de carbohidrați, cu puține proteine, așa că adaugă o garnitură cu proteine dacă e masa principală.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Mozzarella and basil', 'Mozzarella cu busuioc'),
          reason: t(
            'Cool, milky cheese is a creamy contrast to the hot, tangy pasta.',
            'Brânza rece și lăptoasă face un contrast cremos cu pastele fierbinți și acrișoare.',
          ),
          principle: 'contrast_texture',
          ingredient: 'mozzarella',
        },
        {
          kind: 'food',
          label: t('Green salad', 'Salată verde'),
          reason: t(
            'Fresh leaves add the crunch and fibre that the pasta lacks.',
            'Frunzele proaspete aduc textura crocantă și fibrele care lipsesc pastelor.',
          ),
          principle: 'contrast_texture',
          ingredient: 'mixed-salad',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Crisp acidity goes with the sweet, tart cherry tomatoes.',
            'Aciditatea fină merge cu roșiile cherry dulci și acrișoare.',
          ),
          principle: 'complement_flavour',
          ingredient: 'white-wine',
        },
        {
          kind: 'drink',
          label: t('Lemonade', 'Limonadă'),
          reason: t(
            'Cold and citrusy, it refreshes the palate on a warm day.',
            'Rece și cu lămâie, răcorește gustul într-o zi caldă.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'lemonade',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Quick, and lighter than the baked or cheese-heavy versions, with fresh tomatoes.',
            'Rapidă și mai ușoară decât variantele la cuptor sau cu multă brânză, cu roșii proaspete.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Fresh cherry tomatoes and basil, and no big pot of boiling water to heat the kitchen.',
            'Roșii cherry proaspete și busuioc, fără o oală mare cu apă clocotită care să încălzească bucătăria.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'good_for',
          reason: t(
            'Quick energy with moderate fat, if eaten a couple of hours ahead.',
            'Energie rapidă, cu grăsimi moderate, dacă o mănânci cu câteva ore înainte.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Tomatoes and onion can cause heartburn when lying down.',
            'Roșiile și ceapa pot da arsuri când te culci.',
          ),
        },
      ],
    },
  ],
};
