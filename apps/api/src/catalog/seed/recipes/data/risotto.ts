import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Risotto base is the plain stirred risotto: onion softened in butter,
// rice toasted, white wine, hot stock added a ladle at a time, then beaten
// with cold butter and parmesan off the heat. Each Variant is a full Recipe
// with its own lines, steps and guidance. The base's Recipe-level Tips are
// inherited; a Variant hides the ones that no longer hold.
export const risotto: BaseRecipeSeed = {
  slug: 'risotto',
  title: t('Parmesan risotto (risotto bianco)', 'Risotto cu parmezan'),
  servings: 4,
  prepMinutes: 10,
  cookMinutes: 40,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'arborio-rice',
      quantity: 300,
      unit: 'g',
      note: t('do not rinse', 'nespălat'),
    },
    {
      ingredient: 'onion',
      quantity: 1,
      unit: 'pcs',
      note: t('very finely chopped', 'tăiată foarte mărunt'),
    },
    {
      ingredient: 'butter',
      key: 'butter-soffritto',
      quantity: 20,
      unit: 'g',
      note: t('for the onion', 'pentru ceapă'),
    },
    {
      ingredient: 'white-wine',
      quantity: 150,
      unit: 'ml',
      note: t('dry', 'sec'),
    },
    {
      ingredient: 'chicken-stock',
      quantity: 1000,
      unit: 'ml',
      note: t('hot', 'fierbinte'),
    },
    {
      ingredient: 'butter',
      key: 'butter-finish',
      quantity: 40,
      unit: 'g',
      note: t('cold, diced, to finish', 'rece, tăiat cubulețe, pentru final'),
    },
    {
      ingredient: 'parmesan',
      quantity: 60,
      unit: 'g',
      note: t('finely grated', 'ras fin'),
    },
    {
      ingredient: 'salt',
      note: t('only if needed', 'doar dacă e nevoie'),
    },
    { ingredient: 'black-pepper', quantity: 0.5, unit: 'g' },
  ],
  steps: [
    {
      key: 'stock',
      text: t(
        'Bring the stock to a gentle simmer in a separate pan and keep it barely bubbling on the lowest heat for the whole recipe.',
        'Adu supa la fierbere ușoară într-o cratiță separată și ține-o pe cel mai mic foc, abia clocotind, cât timp gătești.',
      ),
    },
    {
      key: 'soffritto',
      text: t(
        'Melt the 20 g of butter in a wide, heavy pot over medium-low heat. Cook the onion for about 7 minutes, stirring now and then, until soft and translucent but not browned.',
        'Topește cei 20 g de unt într-o oală lată, cu fund gros, la foc mic-mediu. Călește ceapa aproximativ 7 minute, amestecând din când în când, până se înmoaie și devine translucidă, fără să se rumenească.',
      ),
      timerSeconds: 420,
    },
    {
      key: 'toast',
      text: t(
        'Raise the heat to medium, add the rice and stir for about 2 minutes, until the grains are hot, translucent at the edges and make a faint clicking sound against the spoon.',
        'Mărește focul la mediu, adaugă orezul și amestecă aproximativ 2 minute, până când boabele sunt fierbinți, translucide pe margini și se aude un ușor țăcănit al boabelor pe lingură.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'wine',
      text: t(
        'Pour in the wine and stir until the pot is almost dry and the smell of alcohol has gone.',
        'Toarnă vinul și amestecă până când oala aproape se usucă și dispare mirosul de alcool.',
      ),
    },
    {
      key: 'ladle',
      text: t(
        'Add a ladle of hot stock, about 150 ml, and stir. When the rice has almost absorbed it, add the next ladle. Keep the heat so the rice bubbles gently, stir often and carry on for about 18 minutes.',
        'Adaugă un polonic de supă fierbinte, cam 150 ml, și amestecă. Când orezul a absorbit aproape tot lichidul, mai adaugă un polonic. Ține focul astfel încât orezul să bolborosească încet, amestecă des și continuă cam 18 minute.',
      ),
      timerSeconds: 1080,
    },
    {
      key: 'taste',
      text: t(
        'Taste a grain. It is ready when it is tender outside with a slight firm bite in the middle, and the risotto is loose enough to flow slowly when you tilt the pot. If the grains are still hard and the stock has run out, add hot water.',
        'Gustă un bob. E gata când e fraged la exterior, cu o mică rezistență la mijloc, iar risotto-ul e destul de lejer cât să curgă încet când înclini oala. Dacă boabele sunt încă tari și supa s-a terminat, adaugă apă fierbinte.',
      ),
    },
    {
      key: 'mantecatura',
      text: t(
        'Take the pot off the heat. Add the cold diced butter and the parmesan and beat hard with a wooden spoon for about 1 minute, until glossy and creamy. Taste, then season with pepper and salt only if needed. Cover and leave for 2 minutes.',
        'Ia oala de pe foc. Adaugă untul rece tăiat cubulețe și parmezanul și bate energic cu o lingură de lemn aproximativ 1 minut, până devine lucios și cremos. Gustă, apoi potrivește de piper și, doar dacă e nevoie, de sare. Acoperă și lasă 2 minute.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'serve',
      text: t(
        'Spoon onto warm plates and tap the plate on the table so the risotto spreads into a loose wave. Serve at once.',
        'Pune în farfurii calde și lovește ușor farfuria de masă, ca risotto-ul să se întindă într-un val lejer. Servește imediat.',
      ),
    },
  ],
  tips: [
    t(
      'Cooked rice must not sit out: cool leftovers within an hour by spreading them in a shallow tray, refrigerate them, eat them within a day and reheat until steaming hot all the way through. Bacillus cereus spores survive cooking and multiply in rice left warm.',
      'Orezul gătit nu se lasă la temperatura camerei: răcește resturile în cel mult o oră, întinse într-o tavă joasă, păstrează-le la frigider, consumă-le în cel mult o zi și reîncălzește-le până când sunt fierbinți peste tot. Sporii de Bacillus cereus rezistă la gătit și se înmulțesc în orezul lăsat la căldură.',
    ),
    t(
      'Heat the stock before it meets the grains: cold stock stalls the cooking every time it goes in, and the grains cook unevenly.',
      'Încălzește supa înainte să ajungă la boabe: supa rece oprește fierberea de fiecare dată când o torni, iar boabele se gătesc neuniform.',
    ),
    t(
      'Do not rinse the rice. The starch on the surface is what makes risotto creamy.',
      'Nu spăla orezul. Amidonul de la suprafață face risotto-ul cremos.',
    ),
    t(
      'Stock and parmesan are both salty, so taste at the end before you add any salt.',
      'Și supa, și parmezanul sunt sărate, așa că gustă la final, înainte să adaugi sare.',
    ),
  ],
  stepTips: [
    {
      step: 'ladle',
      text: t(
        'If the heat is too high, the outside of the grains turns to mush before the middle softens; if it is too low, the rice stews and goes gluey. Aim for small, steady bubbles.',
        'Dacă focul e prea tare, exteriorul boabelor se terciuiește înainte să se înmoaie mijlocul; dacă e prea mic, orezul se fierbe și devine lipicios. Caută bule mici și constante.',
      ),
    },
    {
      step: 'mantecatura',
      text: t(
        'The pot must be off the heat and the butter cold: the cold fat beaten into the starchy rice is what turns it creamy and glossy.',
        'Oala trebuie să fie luată de pe foc, iar untul rece: grăsimea rece bătută în orezul bogat în amidon face risotto-ul cremos și lucios.',
      ),
    },
  ],
  nutritionNote: t(
    'Risotto is mostly white rice: starchy carbohydrate for quick energy, but low in fibre. The butter and parmesan add saturated fat, and the stock and cheese add a good deal of salt. Parmesan brings some protein. A modest bowl with a vegetable or a green salad is better balanced than a large plate on its own.',
    'Risotto e în mare parte orez alb: carbohidrați amidonoși pentru energie rapidă, dar puține fibre. Untul și parmezanul aduc grăsimi saturate, iar supa și brânza adaugă destulă sare. Parmezanul oferă și ceva proteine. O porție moderată, alături de o legumă sau o salată verde, e mai echilibrată decât o farfurie mare servită singură.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Roast chicken', 'Pui la cuptor'),
      reason: t(
        'The creamy rice soaks up the roast juices from the pan.',
        'Orezul cremos absoarbe zeama lăsată de friptură în tavă.',
      ),
      principle: 'complement_flavour',
      recipe: 'roast-chicken',
    },
    {
      kind: 'food',
      label: t('Asparagus', 'Sparanghel'),
      reason: t(
        'Blanched or oven-roasted spears stay crisp-tender against the soft, creamy rice.',
        'Sparanghelul opărit sau copt la cuptor rămâne crocant lângă orezul moale și cremos.',
      ),
      principle: 'contrast_texture',
      ingredient: 'asparagus',
    },
    {
      kind: 'food',
      label: t('Rocket salad with lemon', 'Salată de rucola cu lămâie'),
      reason: t(
        'Peppery leaves and lemon juice cut through the butter and cheese.',
        'Frunzele iuți și sucul de lămâie taie din bogăția untului și a brânzei.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'rocket',
    },
    {
      kind: 'drink',
      label: t('Crisp dry white wine', 'Vin alb sec, răcoros'),
      reason: t(
        'Its acidity refreshes the palate after butter and cheese.',
        'Aciditatea lui împrospătează gustul după unt și brânză.',
      ),
      principle: 'cleanses_palate',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'Hot, creamy and comforting on a cold day.',
        'Fierbinte, cremos și reconfortant într-o zi rece.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'The rice refills carbohydrate stores and the parmesan adds a little protein.',
        'Orezul reface rezervele de carbohidrați, iar parmezanul adaugă puțin proteine.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A big bowl of buttery rice and cheese sits heavy before bed.',
        'O porție mare de orez cu unt și brânză cade greu înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'risotto-italian',
      cuisine: 'italian',
      title: t(
        'Risotto alla milanese (saffron risotto)',
        'Risotto alla milanese (cu șofran)',
      ),
      servings: 4,
      prepMinutes: 10,
      cookMinutes: 40,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'arborio-rice',
          quantity: 300,
          unit: 'g',
          note: t('do not rinse', 'nespălat'),
        },
        {
          ingredient: 'beef-stock',
          quantity: 1000,
          unit: 'ml',
          note: t('hot', 'fierbinte'),
        },
        {
          ingredient: 'saffron',
          quantity: 0.4,
          unit: 'g',
          note: t('a generous pinch of threads', 'un praf generos de fire'),
        },
        {
          ingredient: 'beef-marrow-bones',
          quantity: 300,
          unit: 'g',
          optional: true,
          note: t(
            'cut into short lengths; about 40 g of marrow',
            'tăiate în bucăți scurte; dau cam 40 g de măduvă',
          ),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('very finely chopped', 'tăiată foarte mărunt'),
        },
        {
          ingredient: 'butter',
          key: 'butter-soffritto',
          quantity: 30,
          unit: 'g',
          note: t('for the onion', 'pentru ceapă'),
        },
        {
          ingredient: 'white-wine',
          quantity: 100,
          unit: 'ml',
          note: t('dry', 'sec'),
        },
        {
          ingredient: 'butter',
          key: 'butter-finish',
          quantity: 40,
          unit: 'g',
          note: t(
            'cold, diced, to finish',
            'rece, tăiat cubulețe, pentru final',
          ),
        },
        {
          ingredient: 'parmesan',
          quantity: 70,
          unit: 'g',
          note: t('finely grated', 'ras fin'),
        },
        {
          ingredient: 'salt',
          note: t('only if needed', 'doar dacă e nevoie'),
        },
      ],
      steps: [
        {
          key: 'stock',
          text: t(
            'Bring the beef stock to a gentle simmer in a separate pan and keep it barely bubbling on the lowest heat for the whole recipe.',
            'Adu supa de vită la fierbere ușoară într-o cratiță separată și ține-o pe cel mai mic foc, abia clocotind, cât timp gătești.',
          ),
        },
        {
          key: 'saffron',
          text: t(
            'Crush the saffron threads between your fingers into a small cup, pour over 100 ml of the hot stock and leave to steep for 10 minutes while you start the onion. The liquid turns deep orange.',
            'Mărunțește firele de șofran între degete într-o ceșcuță, toarnă peste ele 100 ml din supa fierbinte și lasă la infuzat 10 minute, cât începi ceapa. Lichidul devine portocaliu închis.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'marrow',
          text: t(
            'If using marrow, push it out of the bones with the handle of a spoon and chop it finely. Discard the bones.',
            'Dacă folosești măduvă, scoate-o din oase cu mânerul unei linguri și toac-o mărunt. Aruncă oasele.',
          ),
        },
        {
          key: 'soffritto',
          text: t(
            'Melt the 30 g of butter with the marrow, if using, in a wide, heavy pot over medium-low heat. Cook the onion for about 8 minutes, stirring now and then, until soft and translucent but not browned. Any marrow should be fully melted.',
            'Topește cei 30 g de unt împreună cu măduva, dacă o folosești, într-o oală lată, cu fund gros, la foc mic-mediu. Călește ceapa aproximativ 8 minute, amestecând din când în când, până se înmoaie și devine translucidă, fără să se rumenească. Măduva trebuie să se topească complet.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'toast',
          text: t(
            'Raise the heat to medium, add the rice and stir for about 2 minutes, until the grains are hot and translucent at the edges.',
            'Mărește focul la mediu, adaugă orezul și amestecă aproximativ 2 minute, până când boabele sunt fierbinți și translucide pe margini.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'wine',
          text: t(
            'Pour in the wine and stir until the pot is almost dry and the smell of alcohol has gone.',
            'Toarnă vinul și amestecă până când oala aproape se usucă și dispare mirosul de alcool.',
          ),
        },
        {
          key: 'ladle',
          text: t(
            'Add a ladle of hot stock, about 150 ml, and stir. When the rice has almost absorbed it, add the next ladle. Keep the heat so the rice bubbles gently, stir often and carry on for 10 minutes.',
            'Adaugă un polonic de supă fierbinte, cam 150 ml, și amestecă. Când orezul a absorbit aproape tot lichidul, mai adaugă un polonic. Ține focul astfel încât orezul să bolborosească încet, amestecă des și continuă 10 minute.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'add-saffron',
          text: t(
            'Stir in the saffron stock, threads and all, and keep adding hot stock a ladle at a time for another 8 minutes, until the grains are tender outside with a slight firm bite in the middle and the risotto is a bright golden yellow. If the stock runs out, use hot water.',
            'Adaugă supa cu șofran, cu tot cu fire, și continuă să torni supă fierbinte câte un polonic, încă 8 minute, până când boabele sunt fragede la exterior, cu o mică rezistență la mijloc, iar risotto-ul are o culoare galbenă-aurie intensă. Dacă se termină supa, folosește apă fierbinte.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'mantecatura',
          text: t(
            'Take the pot off the heat. Add the cold diced butter and the parmesan and beat hard with a wooden spoon for about 1 minute, until glossy and creamy. Taste and add salt only if needed. Cover and leave for 2 minutes.',
            'Ia oala de pe foc. Adaugă untul rece tăiat cubulețe și parmezanul și bate energic cu o lingură de lemn aproximativ 1 minut, până devine lucios și cremos. Gustă și adaugă sare doar dacă e nevoie. Acoperă și lasă 2 minute.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'serve',
          text: t(
            'Spoon onto warm plates, loose enough to spread when you tap the plate. Serve at once.',
            'Pune în farfurii calde, destul de lejer cât să se întindă când lovești ușor farfuria. Servește imediat.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'saffron',
          text: t(
            'Crushing the threads and steeping them in hot liquid draws out far more colour and flavour than dropping them in dry. Add the saffron stock only for the last minutes of cooking: long boiling dulls its aroma.',
            'Fire mărunțite și infuzate în lichid fierbinte dau mult mai multă culoare și aromă decât dacă le arunci uscate în oală. Adaugă supa cu șofran doar în ultimele minute de gătit: fiertul îndelungat îi estompează aroma.',
          ),
        },
      ],
      nutritionNote: t(
        'This is a rich rice dish: starchy carbohydrate with little fibre, plus saturated fat from the butter, marrow and parmesan, and plenty of salt from the beef stock and cheese. Saffron is used in tiny amounts for colour and flavour, not nutrition. Leave out the marrow for a lighter plate, and serve a modest portion with a vegetable.',
        'E un preparat bogat din orez: carbohidrați amidonoși cu puține fibre, plus grăsimi saturate din unt, măduvă și parmezan, și multă sare din supa de vită și din brânză. Șofranul se folosește în cantități foarte mici, pentru culoare și aromă, nu pentru nutrienți. Renunță la măduvă pentru o farfurie mai ușoară și servește o porție moderată, cu o legumă.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t(
            'Ossobuco (braised veal shank)',
            'Ossobuco (fluier de vițel înăbușit)',
          ),
          reason: t(
            'Cooks in Milan serve the two together: the saffron rice takes up the rich braising sauce.',
            'În Milano cele două se servesc împreună: orezul cu șofran absoarbe sosul bogat al înăbușelii.',
          ),
          principle: 'regional_tradition',
        },
        {
          kind: 'food',
          label: t('Rocket salad with lemon', 'Salată de rucola cu lămâie'),
          reason: t(
            'Peppery leaves and lemon juice cut through the butter, marrow and cheese.',
            'Frunzele iuți și sucul de lămâie taie din bogăția untului, a măduvei și a brânzei.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'rocket',
        },
        {
          kind: 'drink',
          label: t('Crisp dry white wine', 'Vin alb sec, răcoros'),
          reason: t(
            'Its acidity refreshes the palate after such a rich dish.',
            'Aciditatea lui împrospătează gustul după un preparat atât de bogat.',
          ),
          principle: 'cleanses_palate',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Warm, golden and filling on a cold day.',
            'Cald, auriu și satisfăcător într-o zi rece.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Butter, marrow and cheese make it heavy before bed.',
            'Untul, măduva și brânza îl fac greu înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'risotto-oven-baked',
      method: 'oven-baked',
      title: t('Oven-baked risotto with peas', 'Risotto la cuptor cu mazăre'),
      servings: 4,
      prepMinutes: 10,
      cookMinutes: 40,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'arborio-rice',
          quantity: 300,
          unit: 'g',
          note: t('do not rinse', 'nespălat'),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('very finely chopped', 'tăiată foarte mărunt'),
        },
        {
          ingredient: 'butter',
          key: 'butter-soffritto',
          quantity: 20,
          unit: 'g',
          note: t('for the onion', 'pentru ceapă'),
        },
        {
          ingredient: 'white-wine',
          quantity: 120,
          unit: 'ml',
          note: t('dry', 'sec'),
        },
        {
          ingredient: 'chicken-stock',
          quantity: 900,
          unit: 'ml',
          note: t('hot', 'fierbinte'),
        },
        {
          ingredient: 'frozen-peas',
          quantity: 150,
          unit: 'g',
          note: t('no need to thaw', 'nu e nevoie să se dezghețe'),
        },
        {
          ingredient: 'butter',
          key: 'butter-finish',
          quantity: 20,
          unit: 'g',
          note: t(
            'cold, diced, to finish',
            'rece, tăiat cubulețe, pentru final',
          ),
        },
        {
          ingredient: 'parmesan',
          quantity: 60,
          unit: 'g',
          note: t('finely grated', 'ras fin'),
        },
        {
          ingredient: 'lemon',
          quantity: 0.5,
          unit: 'pcs',
          optional: true,
          note: t('zest and a squeeze of juice', 'coajă și puțin suc'),
        },
        {
          ingredient: 'salt',
          note: t('only if needed', 'doar dacă e nevoie'),
        },
        { ingredient: 'black-pepper', quantity: 0.5, unit: 'g' },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Put a rack in the middle of the oven and heat it to 180 °C (conventional). It takes about 15 minutes, so do the next steps while it heats.',
            'Pune grătarul la mijlocul cuptorului și încălzește-l la 180 °C (fără ventilator). Durează cam 15 minute, așa că fă următorii pași cât se încălzește.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'stock',
          text: t(
            'Bring the stock to a simmer in a separate pan and keep it hot.',
            'Adu supa la fierbere într-o cratiță separată și ține-o fierbinte.',
          ),
        },
        {
          key: 'soffritto',
          text: t(
            'Melt the 20 g of butter in an ovenproof, heavy pot with a tight lid over medium-low heat. Cook the onion for about 6 minutes, stirring now and then, until soft and translucent but not browned.',
            'Topește cei 20 g de unt într-o oală cu fund gros, rezistentă la cuptor, cu capac bine închis, la foc mic-mediu. Călește ceapa aproximativ 6 minute, amestecând din când în când, până se înmoaie și devine translucidă, fără să se rumenească.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'toast',
          text: t(
            'Raise the heat to medium, add the rice and stir for about 2 minutes, until the grains are hot and translucent at the edges.',
            'Mărește focul la mediu, adaugă orezul și amestecă aproximativ 2 minute, până când boabele sunt fierbinți și translucide pe margini.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'liquid',
          text: t(
            'Pour in the wine and let it bubble away for about 1 minute. Add all the hot stock, stir once and bring to a simmer.',
            'Toarnă vinul și lasă-l să fiarbă cam 1 minut. Adaugă toată supa fierbinte, amestecă o singură dată și adu la fierbere ușoară.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'bake',
          text: t(
            'Cover with the lid and bake for 20 minutes without opening the oven.',
            'Acoperă cu capacul și coace 20 de minute, fără să deschizi cuptorul.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'check',
          text: t(
            'Take the pot out and check: the rice should be tender with a slight firm bite in the middle, and most of the stock absorbed. If it is, skip the next step.',
            'Scoate oala și verifică: orezul trebuie să fie fraged, cu o mică rezistență la mijloc, iar cea mai mare parte din supă absorbită. Dacă e așa, sari peste pasul următor.',
          ),
        },
        {
          key: 'extra',
          text: t(
            'Only if the rice is still hard and the pot looks dry: add a splash of hot water, cover and bake for 5 more minutes.',
            'Doar dacă orezul e încă tare și oala pare uscată: adaugă un strop de apă fierbinte, acoperă și mai coace 5 minute.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'beat',
          text: t(
            'Put the pot on the hob over medium-low heat. Add the peas, the cold diced butter and the parmesan, then beat hard with a wooden spoon for about 3 minutes, until the rice turns creamy and the peas are hot and bright green.',
            'Pune oala pe plită, la foc mic-mediu. Adaugă mazărea, untul rece tăiat cubulețe și parmezanul, apoi bate energic cu o lingură de lemn cam 3 minute, până când orezul devine cremos, iar mazărea e fierbinte și verde aprins.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'finish',
          text: t(
            'Off the heat, stir in the lemon zest and a squeeze of juice, if using. Taste, season with pepper and salt only if needed, cover and leave for 2 minutes. Serve at once.',
            'Ia oala de pe foc și adaugă coaja de lămâie și puțin suc, dacă folosești. Gustă, potrivește de piper și, doar dacă e nevoie, de sare, acoperă și lasă 2 minute. Servește imediat.',
          ),
          timerSeconds: 120,
        },
      ],
      tips: [
        t(
          'Use a pot whose lid really seals. If it is loose, cover the pot with foil first and then put the lid on, otherwise the stock evaporates and the rice on top stays hard.',
          'Folosește o oală al cărei capac se închide bine. Dacă e larg, acoperă oala întâi cu folie și abia apoi cu capacul, altfel supa se evaporă, iar orezul de deasupra rămâne tare.',
        ),
      ],
      stepTips: [
        {
          step: 'bake',
          text: t(
            'Every time you open the oven the temperature drops and the rice cooks unevenly, so wait for the timer before you look.',
            'De fiecare dată când deschizi cuptorul, temperatura scade, iar orezul se gătește neuniform, așa că așteaptă sunetul cronometrului înainte să te uiți.',
          ),
        },
      ],
      nutritionNote: t(
        'Mostly white rice: starchy carbohydrate with little fibre. The peas add a little fibre and plant protein, and there is less butter than in the stirred version, but the parmesan and stock still bring saturated fat and salt. Serve it with a salad or roast vegetables to round out the plate.',
        'În mare parte orez alb: carbohidrați amidonoși cu puține fibre. Mazărea adaugă puțin fibre și proteine vegetale, iar untul e mai puțin decât în varianta amestecată, dar parmezanul și supa aduc totuși grăsimi saturate și sare. Servește-l cu o salată sau cu legume la cuptor, ca farfuria să fie echilibrată.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Roast chicken', 'Pui la cuptor'),
          reason: t(
            'The creamy rice soaks up the roast juices from the pan.',
            'Orezul cremos absoarbe zeama lăsată de friptură în tavă.',
          ),
          principle: 'complement_flavour',
          recipe: 'roast-chicken',
        },
        {
          kind: 'food',
          label: t('Rocket salad', 'Salată de rucola'),
          reason: t(
            'Peppery leaves cut through the butter and cheese.',
            'Frunzele iuți taie din bogăția untului și a brânzei.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'rocket',
        },
        {
          kind: 'drink',
          label: t('Crisp dry white wine', 'Vin alb sec, răcoros'),
          reason: t(
            'Its acidity refreshes the palate after butter and cheese.',
            'Aciditatea lui împrospătează gustul după unt și brânză.',
          ),
          principle: 'cleanses_palate',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Hot and comforting, and it needs almost no stirring.',
            'Fierbinte și reconfortant, și aproape nu cere amestecat.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Rice for carbohydrate, peas and parmesan for a little protein.',
            'Orez pentru carbohidrați, mazăre și parmezan pentru puțin proteine.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A big bowl of buttery rice sits heavy before bed.',
            'O porție mare de orez cu unt cade greu înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'risotto-greek',
      cuisine: 'greek',
      hideBaseTips: [0, 2, 3],
      title: t(
        'Kritharoto (Greek orzo cooked like risotto, with tomato and feta)',
        'Kritharoto (orzo grecesc cu roșii și feta, gătit ca un risotto)',
      ),
      servings: 4,
      prepMinutes: 10,
      cookMinutes: 35,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'orzo',
          quantity: 300,
          unit: 'g',
        },
        {
          ingredient: 'olive-oil',
          quantity: 60,
          unit: 'ml',
          note: t('plus a little to finish', 'plus puțin pentru final'),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely chopped', 'tăiată mărunt'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t('2 to 3 cloves, finely chopped', '2-3 căței, tăiați mărunt'),
        },
        {
          ingredient: 'tomato-paste',
          quantity: 20,
          unit: 'g',
        },
        {
          ingredient: 'canned-tomatoes',
          quantity: 400,
          unit: 'g',
          note: t('chopped', 'tăiate cubulețe'),
        },
        {
          ingredient: 'chicken-stock',
          quantity: 700,
          unit: 'ml',
          note: t('hot', 'fierbinte'),
        },
        {
          ingredient: 'oregano',
          quantity: 2,
          unit: 'g',
          note: t('dried', 'uscat'),
        },
        {
          ingredient: 'feta',
          quantity: 120,
          unit: 'g',
          note: t('crumbled', 'mărunțită cu mâna'),
        },
        {
          ingredient: 'basil',
          quantity: 5,
          unit: 'g',
          optional: true,
          note: t('torn, to serve', 'rupt, pentru servire'),
        },
        {
          ingredient: 'salt',
          note: t('only if needed', 'doar dacă e nevoie'),
        },
        { ingredient: 'black-pepper', quantity: 0.5, unit: 'g' },
      ],
      steps: [
        {
          key: 'stock',
          text: t(
            'Bring the stock to a gentle simmer in a separate pan and keep it hot on the lowest heat.',
            'Adu supa la fierbere ușoară într-o cratiță separată și ține-o fierbinte, pe cel mai mic foc.',
          ),
        },
        {
          key: 'onion',
          text: t(
            'Heat the 60 ml of olive oil in a wide, heavy pot over medium heat. Cook the onion for about 6 minutes, stirring now and then, until soft and translucent.',
            'Încălzește cei 60 ml de ulei de măsline într-o oală lată, cu fund gros, la foc mediu. Călește ceapa aproximativ 6 minute, amestecând din când în când, până se înmoaie și devine translucidă.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'garlic',
          text: t(
            'Add the garlic and stir for 1 minute, until fragrant but not browned.',
            'Adaugă usturoiul și amestecă un minut, până miroase plăcut, fără să se rumenească.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'toast',
          text: t(
            'Add the orzo and stir for about 2 minutes, until the grains are coated in oil and a few turn pale golden.',
            'Adaugă orzo și amestecă aproximativ 2 minute, până când boabele sunt acoperite cu ulei, iar câteva capătă o culoare aurie deschisă.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'paste',
          text: t(
            'Stir in the tomato paste and cook for 1 minute, until it darkens slightly.',
            'Adaugă pasta de roșii și gătește un minut, până se închide ușor la culoare.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'tomatoes',
          text: t(
            'Add the canned tomatoes with their juice, the oregano and 300 ml of the hot stock. Stir, breaking up the tomatoes with the spoon, and bring to a gentle simmer.',
            'Adaugă roșiile conservate cu tot sucul lor, oregano și 300 ml din supa fierbinte. Amestecă, zdrobind roșiile cu lingura, și adu la fierbere ușoară.',
          ),
        },
        {
          key: 'ladle',
          text: t(
            'Cook at a steady simmer for about 13 minutes, stirring often, and add the rest of the stock a ladle at a time whenever the pot looks almost dry. The orzo is ready when it is tender with a slight bite and the sauce clings to it like a loose risotto.',
            'Fierbe la foc mic, constant, cam 13 minute, amestecând des, și adaugă restul de supă câte un polonic, ori de câte ori oala pare aproape uscată. Orzo e gata când e fraged, cu o mică rezistență la mușcat, iar sosul îl învelește ca un risotto lejer.',
          ),
          timerSeconds: 780,
        },
        {
          key: 'finish',
          text: t(
            'Take the pot off the heat. Stir in half of the feta and a good drizzle of olive oil. Taste, season with pepper and salt only if needed, and leave for 2 minutes.',
            'Ia oala de pe foc. Adaugă jumătate din feta și un fir generos de ulei de măsline. Gustă, potrivește de piper și, doar dacă e nevoie, de sare, și lasă 2 minute.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'serve',
          text: t(
            'Spoon into warm bowls, crumble the rest of the feta on top and scatter with basil, if using. Serve at once.',
            'Pune în boluri calde, mărunțește deasupra restul de feta și presară busuioc, dacă folosești. Servește imediat.',
          ),
        },
      ],
      tips: [
        t(
          'Orzo sticks to the bottom of the pot more than rice does, so scrape the base as you stir. It also keeps absorbing liquid as it stands: loosen leftovers with a splash of hot water or stock when you reheat them. Cool leftovers within an hour or two, spread in a shallow tray, refrigerate them, eat them within a day or two and reheat until steaming hot all the way through.',
          'Orzo se lipește de fundul oalei mai ușor decât orezul, așa că răzuiește fundul când amesteci. Absoarbe lichid și după ce se oprește focul: dacă reîncălzești resturi, înmoaie-le cu un strop de apă fierbinte sau de supă. Răcește resturile în cel mult o oră-două, întinse într-o tavă joasă, păstrează-le la frigider, consumă-le în una-două zile și reîncălzește-le până sunt fierbinți peste tot.',
        ),
        t(
          'The stock and the feta are both salty, so taste at the end before you add any salt.',
          'Și supa, și feta sunt sărate, așa că gustă la final, înainte să adaugi sare.',
        ),
      ],
      stepTips: [
        {
          step: 'paste',
          text: t(
            'Frying the paste in the oil for a minute cooks off its raw, tinny taste and gives the dish a deeper, sweeter tomato flavour.',
            'Pasta prăjită un minut în ulei pierde gustul crud, metalic și dă preparatului o aromă de roșii mai profundă și mai dulce.',
          ),
        },
      ],
      nutritionNote: t(
        'Orzo is refined wheat pasta: quick carbohydrate with little fibre. The tomatoes add some vegetable to the dish. The olive oil is mostly unsaturated fat, but there is a fair amount of it, and the feta and the stock add a good deal of salt. A salad on the side makes the meal better balanced.',
        'Orzo e paste din grâu rafinat: carbohidrați rapizi, cu puține fibre. Roșiile adaugă ceva legume în preparat. Uleiul de măsline conține în mare parte grăsimi nesaturate, dar e destul de mult, iar feta și supa aduc multă sare. O salată alături face masa mai echilibrată.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Olives', 'Măsline'),
          reason: t(
            'Their salty, briny bite sets off the sweet tomato.',
            'Gustul lor sărat, de saramură, pune în valoare dulceața roșiilor.',
          ),
          principle: 'salt_balances_sweet',
          ingredient: 'olives',
        },
        {
          kind: 'food',
          label: t('Cucumber', 'Castravete'),
          reason: t(
            'Cool and crunchy against the warm, soft orzo.',
            'Răcoros și crocant lângă orzo cald și moale.',
          ),
          principle: 'contrast_texture',
          ingredient: 'cucumber',
        },
        {
          kind: 'food',
          label: t('Roast chicken', 'Pui la cuptor'),
          reason: t(
            'The tomato orzo soaks up the roast juices from the pan.',
            'Orzo cu roșii absoarbe zeama lăsată de friptură în tavă.',
          ),
          principle: 'complement_flavour',
          recipe: 'roast-chicken',
        },
        {
          kind: 'drink',
          label: t('Crisp dry white wine', 'Vin alb sec, răcoros'),
          reason: t(
            'Its acidity cuts through the olive oil and feta.',
            'Aciditatea lui taie din bogăția uleiului de măsline și a fetei.',
          ),
          principle: 'acid_cuts_fat',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, tomatoey bowl that fills you up.',
            'Un bol fierbinte, cu gust de roșii, care te satură.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Ready in half an hour, and one pot is enough.',
            'Gata în jumătate de oră, iar o singură oală e de ajuns.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A big bowl of pasta and oil sits heavy before bed.',
            'Un bol mare de paste cu ulei cade greu înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
