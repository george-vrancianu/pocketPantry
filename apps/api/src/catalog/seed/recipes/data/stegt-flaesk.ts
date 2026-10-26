import {
  t,
  type BaseRecipeSeed,
  type LineSeed,
  type PairingSeed,
  type StepSeed,
} from '../recipe-seed-types';

// The Stegt flæsk base is Danish fried pork belly: rind-on slices crisped in a
// dry pan, served with boiled potatoes, parsley sauce (white sauce with plenty
// of curly parsley) and pickled beetroot. Each Variant is a full Recipe with its
// own lines, steps and guidance; the base's Recipe-level Tips are inherited.

const lines: LineSeed[] = [
  {
    ingredient: 'pork-belly',
    quantity: 800,
    unit: 'g',
    note: t(
      'rind on, sliced about 1 cm thick (about 12 slices)',
      'cu șorici, tăiat în felii de cca 1 cm grosime (cam 12 felii)',
    ),
  },
  {
    ingredient: 'potato',
    quantity: 1,
    unit: 'kg',
    note: t('peeled, large ones halved', 'curățați, cei mari tăiați în două'),
  },
  { ingredient: 'butter', quantity: 40, unit: 'g' },
  { ingredient: 'flour', quantity: 40, unit: 'g' },
  { ingredient: 'milk', quantity: 0.6, unit: 'l' },
  {
    ingredient: 'curly-parsley',
    quantity: 50,
    unit: 'g',
    note: t(
      'leaves and thin stalks, finely chopped',
      'frunze și tulpini subțiri, tocate mărunt',
    ),
  },
  {
    ingredient: 'canned-beetroot',
    quantity: 200,
    unit: 'g',
    note: t('drained', 'scursă'),
  },
  {
    ingredient: 'salt',
    key: 'salt-water',
    quantity: 10,
    unit: 'g',
    note: t('for the potato water', 'pentru apa cartofilor'),
  },
  {
    ingredient: 'salt',
    key: 'salt-sauce',
    quantity: 4,
    unit: 'g',
    note: t('for the sauce', 'pentru sos'),
  },
  {
    ingredient: 'salt',
    key: 'salt-pork',
    quantity: 4,
    unit: 'g',
    note: t('for the cooked pork', 'pentru carnea gătită'),
  },
  {
    ingredient: 'black-pepper',
    quantity: 3,
    unit: 'g',
    note: t(
      '2 g for the pork, 1 g for the sauce',
      '2 g pentru carne, 1 g pentru sos',
    ),
  },
];

const patDry: StepSeed = {
  key: 'pat-dry',
  text: t(
    'Pat the pork slices dry on both sides with paper towels and rub the pepper (2 g) onto them. Do not salt yet.',
    'Șterge feliile de carne bine pe ambele părți cu prosoape de hârtie și freacă-le cu piper (2 g). Nu le săra încă.',
  ),
};

const potatoes: StepSeed = {
  key: 'potatoes',
  text: t(
    'Put the potatoes in a large pot, cover with cold water by 2 cm, add the 10 g of salt and bring to the boil.',
    'Pune cartofii într-o oală mare, acoperă-i cu apă rece cu 2 cm deasupra, adaugă cei 10 g de sare și adu la fiert.',
  ),
};

const simmerPotatoes: StepSeed = {
  key: 'simmer-potatoes',
  text: t(
    'Once the water boils, reduce the heat, partly cover and simmer for about 20 minutes, until a knife slides into the largest potato without resistance. Carry on with the pork while they cook.',
    'Când apa fierbe, redu focul, acoperă parțial și fierbe la foc mic cam 20 de minute, până când un cuțit intră fără rezistență în cel mai mare cartof. Continuă cu carnea cât timp se gătesc.',
  ),
  timerSeconds: 1200,
};

const drainPotatoes: StepSeed = {
  key: 'drain-potatoes',
  text: t(
    'When the potatoes are tender, drain them, return them to the pot and cover to keep warm until serving.',
    'Când cartofii sunt fierți, scurge-i, pune-i înapoi în oală și acoperă-i ca să rămână calzi până la servire.',
  ),
};

const sauceSteps: StepSeed[] = [
  {
    key: 'roux',
    text: t(
      'Melt the butter in a saucepan over medium-low heat, whisk in the flour and cook for 2 minutes, stirring, without letting it colour.',
      'Topește untul într-o cratiță la foc mediu-mic, amestecă cu telul făina și gătește 2 minute, mestecând, fără să se rumenească.',
    ),
    timerSeconds: 120,
  },
  {
    key: 'milk',
    text: t(
      'Add the milk a little at a time, whisking until smooth after each addition. Bring to a gentle simmer and cook for 5 minutes, stirring, until the sauce coats the back of a spoon. Season with the 4 g of salt and the remaining pepper (1 g).',
      'Adaugă laptele puțin câte puțin, amestecând cu telul până se omogenizează după fiecare adaos. Adu la un clocot slab și gătește 5 minute, mestecând, până când sosul acoperă dosul lingurii. Condimentează cu cei 4 g de sare și cu restul de piper (1 g).',
    ),
    timerSeconds: 300,
  },
  {
    key: 'parsley',
    text: t(
      'Take the sauce off the heat and stir in all the parsley. Taste and add a pinch more salt if needed.',
      'Ia sosul de pe foc și amestecă tot pătrunjelul. Gustă și adaugă puțină sare, dacă mai e nevoie.',
    ),
  },
];

const serve: StepSeed = {
  key: 'serve',
  text: t(
    'Serve the pork with the potatoes, plenty of parsley sauce spooned over, and the pickled beetroot on the side.',
    'Servește carnea cu cartofii, multă sos de pătrunjel peste ei și sfecla murată alături.',
  ),
};

const pairings: PairingSeed[] = [
  {
    kind: 'food',
    label: t('Pickled cucumbers', 'Castraveți murați'),
    reason: t(
      'Their vinegar sharpness cuts through the fat of the pork.',
      'Oțetul din ei taie grăsimea cărnii de porc.',
    ),
    principle: 'acid_cuts_fat',
    ingredient: 'pickled-cucumbers',
  },
  {
    kind: 'food',
    label: t('Mustard', 'Muștar'),
    reason: t(
      'A little sharp heat on the side lifts the rich pork and creamy sauce.',
      'Un pic de iuțeală alături înviorează carnea bogată și sosul cremos.',
    ),
    principle: 'complement_flavour',
    ingredient: 'mustard',
  },
  {
    kind: 'drink',
    label: t('Lager', 'Bere blondă'),
    reason: t(
      'Cold bubbles and light bitterness refresh the mouth between fatty bites.',
      'Bulele reci și amăreala ușoară împrospătează gura între îmbucăturile grase.',
    ),
    principle: 'cleanses_palate',
    ingredient: 'beer',
  },
  {
    kind: 'drink',
    label: t('Cider', 'Cidru'),
    reason: t(
      'Its fruit acidity cuts through the rich pork and butter sauce.',
      'Aciditatea fructată taie bogăția cărnii și a sosului cu unt.',
    ),
    principle: 'acid_cuts_fat',
    ingredient: 'cider',
  },
  {
    kind: 'drink',
    label: t('Sparkling water with lemon', 'Apă minerală cu lămâie'),
    reason: t(
      'A zero-alcohol option whose bubbles and citrus reset the palate.',
      'O variantă fără alcool, ale cărei bule și citrice împrospătează gustul.',
    ),
    principle: 'cleanses_palate',
    ingredient: 'sparkling-water',
  },
];

export const stegtFlaesk: BaseRecipeSeed = {
  slug: 'stegt-flaesk',
  title: t(
    'Crispy pork belly with parsley sauce (stegt flæsk med persillesovs)',
    'Piept de porc crocant cu sos de pătrunjel (stegt flæsk)',
  ),
  servings: 4,
  prepMinutes: 15,
  cookMinutes: 31,
  difficulty: 'medium',
  lines,
  steps: [
    {
      key: 'preheat',
      text: t(
        'Heat the oven to 100°C (80°C fan) to keep the fried slices warm and crisp between batches.',
        'Încălzește cuptorul la 100°C (80°C cu ventilator) ca să păstrezi feliile prăjite calde și crocante între porții.',
      ),
    },
    patDry,
    potatoes,
    simmerPotatoes,
    {
      key: 'fry-first-side-1',
      text: t(
        'While the potatoes cook, lay 6 slices in a cold, dry 28 to 30 cm frying pan, with space between them and no oil. Set it over medium heat and fry for 8 minutes, until the underside is golden and the fat has rendered into the pan.',
        'Cât timp se gătesc cartofii, pune 6 felii într-o tigaie rece și uscată de 28-30 cm, cu spațiu între ele și fără ulei. Pune-o pe foc mediu și prăjește 8 minute, până când partea de jos e aurie și grăsimea s-a topit în tigaie.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'turn-1',
      text: t(
        'Turn the slices with tongs and fry for another 4 minutes, until deep golden and crisp at the edges. Cut into one to check: there must be no pink left.',
        'Întoarce feliile cu cleștele și prăjește încă 4 minute, până se rumenesc auriu intens și devin crocante la margini. Taie una ca să verifici: nu trebuie să mai rămână nimic roz.',
      ),
      timerSeconds: 240,
    },
    {
      key: 'drain-1',
      text: t(
        'Lift the slices onto a paper-lined tray, sprinkle with half of the 4 g of salt for the pork and put them in the oven. Carefully pour most of the fat from the pan into a heatproof bowl, leaving a thin film.',
        'Scoate feliile pe o tavă tapetată cu hârtie de bucătărie, presară-le cu jumătate din cei 4 g de sare pentru carne și pune-le în cuptor. Toarnă cu grijă cea mai mare parte din grăsime din tigaie într-un vas termorezistent, lăsând doar un strat subțire.',
      ),
    },
    {
      key: 'fry-first-side-2',
      text: t(
        'Fry the remaining 6 slices the same way: 8 minutes on the first side over medium heat, until golden underneath.',
        'Prăjește cele 6 felii rămase la fel: 8 minute pe prima parte, la foc mediu, până se aurește partea de jos.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'turn-2',
      text: t(
        'Turn them and fry for 4 more minutes, until deep golden and crisp, with no pink inside. Lift onto the tray with the first batch and sprinkle with the rest of the salt for the pork.',
        'Întoarce-le și prăjește încă 4 minute, până se rumenesc intens și devin crocante, fără nimic roz înăuntru. Scoate-le pe tavă lângă prima porție și presară-le cu restul de sare pentru carne.',
      ),
      timerSeconds: 240,
    },
    drainPotatoes,
    ...sauceSteps,
    serve,
  ],
  tips: [
    t(
      'Dry slices crisp; wet ones steam. Pat the pork really dry and salt only after frying, because salt on the raw surface draws out moisture.',
      'Feliile uscate se fac crocante, cele ude se fierb în aburi. Șterge bine carnea și sărează abia după prăjire, pentru că sarea pe suprafața crudă scoate apa.',
    ),
    t(
      'Start the slices in a cold pan so the fat melts out slowly before the rind browns; a hot pan chars the outside while the middle stays fatty.',
      'Pune feliile în tigaia rece, ca grăsimea să se topească încet înainte să se rumenească șoricul; într-o tigaie fierbinte exteriorul se arde, iar mijlocul rămâne gras.',
    ),
    t(
      'Stir the parsley into the sauce off the heat, just before serving: it stays bright green and fresh-tasting.',
      'Amestecă pătrunjelul în sos după ce l-ai luat de pe foc, chiar înainte de servire: rămâne verde aprins și proaspăt la gust.',
    ),
    t(
      'Cool leftovers within 2 hours and keep the pork and the sauce in separate covered containers in the fridge for up to 3 days. Reheat the pork on a tray in a hot oven until crisp and steaming hot all through, and bring the sauce to a simmer, stirring.',
      'Răcește rămășițele în cel mult 2 ore și păstrează carnea și sosul în recipiente separate, acoperite, la frigider, până la 3 zile. Încălzește carnea pe o tavă în cuptor încins, până devine crocantă și fierbinte în tot miezul, iar sosul adu-l la fierbere, mestecând.',
    ),
  ],
  stepTips: [
    {
      step: 'fry-first-side-1',
      text: t(
        'The fat spits. Use a splatter guard or a large lid held at an angle, and keep the heat at medium rather than high.',
        'Grăsimea stropește. Folosește un protector anti-stropi sau un capac mare ținut înclinat și păstrează focul mediu, nu mare.',
      ),
    },
    {
      step: 'drain-1',
      text: t(
        'Let the spare fat cool, then throw it away in the bin, never down the drain.',
        'Lasă grăsimea în plus să se răcească, apoi aruncă-o la gunoi, niciodată în chiuvetă.',
      ),
    },
    {
      step: 'milk',
      text: t(
        'If lumps form, a minute with a whisk off the heat, or a quick blitz with a stick blender, smooths them out.',
        'Dacă se fac cocoloașe, un minut de amestecat cu telul de pe foc sau câteva secunde cu un blender vertical le netezește.',
      ),
    },
  ],
  nutritionNote: t(
    'Pork belly is a good source of protein, and the potatoes give carbohydrate for energy, but it is a very fatty, saturated-fat-heavy dish; the butter-and-milk sauce adds more, and the salt adds up. Drain the slices well, go easy on the sauce and the portion, and add fresh vegetables, since the plate has little fibre.',
    'Pieptul de porc e o sursă bună de proteine, iar cartofii aduc carbohidrați pentru energie, dar e un preparat foarte gras, bogat în grăsimi saturate; sosul cu unt și lapte mai adaugă și el, iar sarea se adună. Scurge bine feliile, folosește sosul și porția cu măsură și adaugă legume proaspete, pentru că farfuria are puține fibre.',
  ),
  pairings,
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot, rich, filling plate for a cold day.',
        'O farfurie caldă, bogată și săturătoare pentru o zi rece.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'Fried fat, butter sauce and a hot pan make a heavy meal when it is warm.',
        'Grăsimea prăjită, sosul cu unt și tigaia fierbinte dau o masă grea pe vreme caldă.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'A lot of fat takes a long time to digest and sits heavy during exercise.',
        'Multă grăsime se digeră greu și cade greu la stomac în timpul efortului.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A fatty, salty plate late at night can sit heavy and disturb sleep.',
        'O farfurie grasă și sărată seara târziu poate cădea greu și îți poate strica somnul.',
      ),
    },
  ],
  variants: [
    {
      slug: 'stegt-flaesk-oven-baked',
      method: 'oven-baked',
      // The cold-pan tip is about frying in a pan.
      hideBaseTips: [1],
      title: t(
        'Oven-crisped pork belly with parsley sauce',
        'Piept de porc crocant la cuptor, cu sos de pătrunjel',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 37,
      difficulty: 'easy',
      lines,
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 220°C (200°C fan). Line a baking tray with foil and set a wire rack on top.',
            'Încălzește cuptorul la 220°C (200°C cu ventilator). Tapetează o tavă cu folie de aluminiu și pune deasupra o grilă.',
          ),
        },
        {
          key: 'arrange',
          text: t(
            'Pat the pork slices dry, rub them on both sides with the pepper (2 g) and lay them on the rack in a single layer, not touching. Do not salt yet.',
            'Șterge bine feliile de carne, freacă-le pe ambele părți cu piper (2 g) și așază-le pe grilă într-un singur strat, fără să se atingă. Nu le săra încă.',
          ),
        },
        {
          key: 'roast',
          text: t(
            'Slide the tray onto the middle shelf and roast for 30 minutes without turning, until the rind has blistered and the slices are deep golden and crisp. Cut one open to check: there must be no pink left.',
            'Pune tava la nivelul din mijloc al cuptorului și coace 30 de minute, fără să întorci feliile, până când șoricul se umflă și feliile sunt auriu intens și crocante. Taie una ca să verifici: nu trebuie să mai rămână nimic roz.',
          ),
          timerSeconds: 1800,
        },
        potatoes,
        simmerPotatoes,
        {
          key: 'finish-pork',
          text: t(
            'Lift the slices onto a paper-lined plate sprinkle with the 4 g of salt for the pork and keep them warm in the switched-off oven while you finish the potatoes and make the sauce. If any are still pale, put them back in the oven and check often rather than leaving them.',
            'Scoate feliile pe o farfurie tapetată cu hârtie de bucătărie și presară-le cu cei 4 g de sare pentru carne și ține-le calde în cuptorul oprit cât timp termini cartofii și faci sosul. Dacă vreuna e încă palidă, pune-o înapoi în cuptor și verific-o des, nu o lăsa nesupravegheată.',
          ),
        },
        drainPotatoes,
        ...sauceSteps,
        serve,
      ],
      tips: [
        t(
          'Choose slices of an even thickness so they finish together, and do not crowd the rack: touching slices steam instead of crisping.',
          'Alege felii de aceeași grosime ca să se facă deodată și nu aglomera grila: feliile care se ating se fierb în aburi în loc să devină crocante.',
        ),
        t(
          'Put the potatoes on as soon as the pork goes into the oven: they take about as long as the roast, so everything finishes together.',
          'Pune cartofii la fiert imediat ce intră carnea în cuptor: durează cam cât friptura, așa că totul se termină deodată.',
        ),
      ],
      stepTips: [
        {
          step: 'roast',
          text: t(
            'Fat can smoke at this heat. Foil under the rack catches the drips and makes cleaning easy; open a window if it smokes.',
            'La această temperatură grăsimea poate scoate fum. Folia de sub grilă prinde picăturile și face curățenia ușoară; deschide geamul dacă fumegă.',
          ),
        },
        {
          step: 'finish-pork',
          text: t(
            'Let the fat in the tray cool completely before you lift the foil out, and bin it, never down the drain.',
            'Lasă grăsimea din tavă să se răcească complet înainte să ridici folia și aruncă-o la gunoi, niciodată în chiuvetă.',
          ),
        },
      ],
      nutritionNote: t(
        'The rack lets some of the fat drip away, so this version is a little lighter than pan-frying, though pork belly is still a very fatty, saturated-fat-heavy cut and the butter-and-milk sauce adds more. Potatoes give carbohydrate and the pork protein; the salt adds up, and there is little fibre, so add vegetables.',
        'Grila lasă o parte din grăsime să se scurgă, așa că varianta e puțin mai ușoară decât cea din tigaie, deși pieptul de porc rămâne o bucată foarte grasă, bogată în grăsimi saturate, iar sosul cu unt și lapte mai adaugă. Cartofii dau carbohidrați, iar carnea proteine; sarea se adună și sunt puține fibre, așa că adaugă legume.',
      ),
      pairings,
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'The oven warms the kitchen and the plate is hot and filling.',
            'Cuptorul încălzește bucătăria, iar farfuria e caldă și săturătoare.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'A hot oven at 220°C heats the kitchen, and the plate is heavy in warm weather.',
            'Un cuptor la 220°C încălzește bucătăria, iar farfuria e grea pe vreme caldă.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A fatty, salty plate late at night can sit heavy and disturb sleep.',
            'O farfurie grasă și sărată seara târziu poate cădea greu și îți poate strica somnul.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'A lot of fat takes a long time to digest and sits heavy during exercise.',
            'Multă grăsime se digeră greu și cade greu la stomac în timpul efortului.',
          ),
        },
      ],
    },
    {
      slug: 'stegt-flaesk-air-fried',
      method: 'air-fried',
      // The cold-pan tip is about frying in a pan.
      hideBaseTips: [1],
      title: t(
        'Air-fried pork belly with parsley sauce',
        'Piept de porc la air fryer, cu sos de pătrunjel',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 39,
      difficulty: 'easy',
      lines,
      steps: [
        {
          key: 'pat-dry',
          text: t(
            'Pat the pork slices dry on both sides and rub the pepper (2 g) onto them. Do not salt yet.',
            'Șterge bine feliile de carne pe ambele părți și freacă-le cu piper (2 g). Nu le săra încă.',
          ),
        },
        {
          key: 'preheat',
          text: t(
            'Preheat the air fryer to 200°C.',
            'Preîncălzește air fryer-ul la 200°C.',
          ),
        },
        {
          key: 'air-fry-side-1',
          text: t(
            'Lay 6 slices in a single layer in the basket, not overlapping, and cook for 8 minutes.',
            'Așază 6 felii într-un singur strat în coș, fără să se suprapună, și gătește 8 minute.',
          ),
          timerSeconds: 480,
        },
        potatoes,
        simmerPotatoes,
        {
          key: 'air-fry-turn-1',
          text: t(
            'Turn the slices with tongs and cook for 7 more minutes, until deep golden and crisp. Cut one open to check: there must be no pink left. Move them to a paper-lined plate, sprinkle with half of the 4 g of salt for the pork and tent with foil.',
            'Întoarce feliile cu cleștele și gătește încă 7 minute, până devin auriu intens și crocante. Taie una ca să verifici: nu trebuie să mai rămână nimic roz. Mută-le pe o farfurie tapetată cu hârtie de bucătărie, presară-le cu jumătate din cei 4 g de sare pentru carne și acoperă-le cu folie.',
          ),
          timerSeconds: 420,
        },
        {
          key: 'air-fry-side-2',
          text: t(
            'Put the remaining 6 slices in the basket in a single layer and cook for 8 minutes.',
            'Pune cele 6 felii rămase în coș, într-un singur strat, și gătește 8 minute.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'air-fry-turn-2',
          text: t(
            'Turn them and cook for 7 more minutes, until deep golden and crisp, with no pink inside.',
            'Întoarce-le și gătește încă 7 minute, până devin auriu intens și crocante, fără nimic roz înăuntru.',
          ),
          timerSeconds: 420,
        },
        {
          key: 'refresh',
          text: t(
            'Return the first batch to the basket with the second for 2 minutes to crisp up again and heat through, then sprinkle with the rest of the salt for the pork.',
            'Pune prima porție înapoi în coș, laolaltă cu a doua, pentru 2 minute, ca să se înfierbânte și să se facă din nou crocantă, apoi presară restul de sare pentru carne.',
          ),
          timerSeconds: 120,
        },
        drainPotatoes,
        ...sauceSteps,
        serve,
      ],
      tips: [
        t(
          'Put the potatoes on while the first batch cooks: they take about as long as the pork, so everything finishes together.',
          'Pune cartofii la fiert cât se gătește prima porție: durează cam cât carnea, așa că totul se termină deodată.',
        ),
        t(
          'Check your basket size: slices must lie flat without overlapping, so a small air fryer needs 3 batches rather than 2.',
          'Verifică dimensiunea coșului: feliile trebuie să stea întinse, fără să se suprapună, așa că un air fryer mic cere 3 porții, nu 2.',
        ),
      ],
      stepTips: [
        {
          step: 'air-fry-side-1',
          text: t(
            'Fatty pork can smoke in an air fryer. On drawer-style models, a few tablespoons of water in the drawer under the basket helps; if it still smokes heavily, lower the heat and open a window.',
            'Carnea grasă poate scoate fum în air fryer. La modelele cu sertar, ajută câteva linguri de apă în sertarul de sub coș; dacă tot fumegă tare, scade temperatura și deschide geamul.',
          ),
        },
        {
          step: 'refresh',
          text: t(
            'Let the fat in the drawer cool, then bin it, never down the drain.',
            'Lasă grăsimea din sertar să se răcească, apoi aruncă-o la gunoi, niciodată în chiuvetă.',
          ),
        },
      ],
      nutritionNote: t(
        'The hot air lets some fat drip into the drawer, so it is a little lighter than pan-frying, but pork belly is still a very fatty, saturated-fat-heavy cut and the butter-and-milk sauce adds more. Pork gives protein and potatoes carbohydrate; the salt adds up and fibre is low, so serve it with vegetables.',
        'Aerul fierbinte lasă o parte din grăsime să se scurgă în sertar, deci e puțin mai ușor decât prăjitul în tigaie, dar pieptul de porc rămâne o bucată foarte grasă, bogată în grăsimi saturate, iar sosul cu unt și lapte mai adaugă. Carnea dă proteine, iar cartofii carbohidrați; sarea se adună și fibrele sunt puține, așa că servește cu legume.',
      ),
      pairings,
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, rich, filling plate for a cold day.',
            'O farfurie caldă, bogată și săturătoare pentru o zi rece.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'It is lighter on kitchen heat than the oven, but still a heavy, fatty plate in warm weather.',
            'Încălzește bucătăria mai puțin decât cuptorul, dar rămâne o farfurie grea și grasă pe vreme caldă.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A fatty, salty plate late at night can sit heavy and disturb sleep.',
            'O farfurie grasă și sărată seara târziu poate cădea greu și îți poate strica somnul.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'A lot of fat takes a long time to digest and sits heavy during exercise.',
            'Multă grăsime se digeră greu și cade greu la stomac în timpul efortului.',
          ),
        },
      ],
    },
  ],
};
