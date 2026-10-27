import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Murături base is a home lacto-fermentation of mixed vegetables in a salt
// brine, kept in the fridge: nothing is canned and no cellar is needed. The
// salt, vinegar, temperature and time follow the NCHFP fermented dill pickle
// recipe; the brine strength, submersion and discard rules follow Illinois
// Extension and UC Davis. No lab-tested process exists for this exact mix.
// Both Variants are quick vinegar pickles kept in the fridge: they do not
// ferment and are not canned.
export const muraturi: BaseRecipeSeed = {
  slug: 'muraturi',
  title: t(
    'Romanian mixed brine-fermented pickles (murături asortate)',
    'Murături asortate în saramură',
  ),
  servings: 20,
  prepMinutes: 30300,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'cucumber',
      quantity: 6,
      unit: 'pcs',
      note: t(
        'small, firm pickling cucumbers (about 100 g each), blossom end trimmed',
        'castraveți mici și tari, pentru murat (circa 100 g bucata), cu capătul de la floare tăiat',
      ),
    },
    {
      ingredient: 'green-tomatoes',
      quantity: 500,
      unit: 'g',
      note: t(
        'small ones whole, larger ones halved',
        'cele mici întregi, cele mari tăiate pe jumătate',
      ),
    },
    {
      ingredient: 'cauliflower',
      quantity: 400,
      unit: 'g',
      note: t('in florets', 'în buchețele'),
    },
    {
      ingredient: 'bell-pepper',
      quantity: 3,
      unit: 'pcs',
      note: t('seeded, in thick strips', 'fără semințe, tăiați fâșii late'),
    },
    {
      ingredient: 'carrot',
      quantity: 250,
      unit: 'g',
      note: t('in 1 cm slices', 'tăiați rondele de 1 cm'),
    },
    {
      ingredient: 'quince',
      quantity: 200,
      unit: 'g',
      optional: true,
      note: t('in thick slices', 'tăiată felii groase'),
    },
    {
      ingredient: 'horseradish-root',
      quantity: 50,
      unit: 'g',
      note: t('peeled, in sticks', 'curățată, tăiată bețișoare'),
    },
    {
      ingredient: 'dill-heads',
      quantity: 30,
      unit: 'g',
      note: t('fresh dill heads', 'mărar proaspăt cu umbrele (mărar bătrân)'),
    },
    {
      ingredient: 'garlic',
      quantity: 20,
      unit: 'g',
      note: t('peeled cloves', 'căței curățați'),
    },
    { ingredient: 'peppercorns', quantity: 5, unit: 'g' },
    { ingredient: 'bay-leaves', quantity: 1, unit: 'g' },
    {
      ingredient: 'mustard-seeds',
      quantity: 5,
      unit: 'g',
      optional: true,
    },
    {
      ingredient: 'coarse-salt',
      quantity: 190,
      unit: 'g',
      note: t(
        'canning or pickling salt, or plain salt with no additives; not iodised',
        'sare pentru conserve sau murături, ori sare simplă fără aditivi; nu iodată',
      ),
    },
    {
      ingredient: 'vinegar',
      quantity: 80,
      unit: 'ml',
      note: t('5 % acidity', 'cu aciditate de 5 %'),
    },
    {
      ingredient: 'still-water',
      quantity: 2.5,
      unit: 'l',
      note: t('room temperature', 'la temperatura camerei'),
    },
  ],
  steps: [
    {
      key: 'sanitise',
      text: t(
        'Read this first: no lab-tested process exists for this exact mix of vegetables, so follow the salt, the submersion and the discard rules below to the letter. Wash a 7 to 8 litre jar or food-grade crock, a plate or lid that fits inside it, a water-filled jar to weigh it down, and your utensils in hot soapy water, then rinse. Sanitise what fits in a pot by boiling it for 10 minutes; sanitise the big jar with a food-safe sanitiser, used and rinsed as its label says.',
        'Citește mai întâi: nu există un proces testat în laborator pentru acest amestec exact de legume, așa că respectă întocmai regulile de mai jos despre sare, scufundare și aruncare. Spală cu apă caldă și detergent un borcan de 7-8 litri sau un vas alimentar de ceramică ori sticlă, o farfurie sau un capac care încape înăuntru, un borcan umplut cu apă pentru greutate și ustensilele, apoi clătește. Sterilizează ce încape într-o oală fierbând totul 10 minute; borcanul mare îl igienizezi cu o soluție alimentară, folosită și clătită așa cum scrie pe etichetă.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'prep',
      text: t(
        'Wash all the vegetables under running water and throw away any with soft spots or other signs of spoilage. Cut a thin slice (about 1.5 mm) off the blossom end of each cucumber and discard it, leaving about 6 mm of stem. Cut the cauliflower into florets, the peppers into thick strips, the carrots into 1 cm slices and the horseradish into sticks; halve any large green tomatoes.',
        'Spală toate legumele sub jet de apă curgătoare și aruncă-le pe cele cu pete moi sau alte semne de stricare. Taie de la fiecare castravete o feliuță subțire (circa 1,5 mm) de la capătul cu floarea și aruncă-o, lăsând circa 6 mm din codiță. Împarte conopida în buchețele, ardeii în fâșii late, morcovii în rondele de 1 cm și hreanul în bețișoare; taie pe jumătate gogonelele mari.',
      ),
    },
    {
      key: 'brine',
      text: t(
        'In a clean bucket or large container, stir the 190 g salt and the vinegar into the 2.5 litres of room-temperature water until no crystals remain; a little sediment from rock salt is harmless.',
        'Într-o găleată curată sau un vas mare, amestecă cele 190 g de sare și oțetul în cei 2,5 litri de apă la temperatura camerei, până nu mai rămân cristale; un pic de sediment de la sarea gemă nu face rău.',
      ),
    },
    {
      key: 'pack',
      text: t(
        'Put half the dill heads, garlic, peppercorns, bay leaves and mustard seeds on the bottom of the jar. Pack in the vegetables tightly, with the horseradish sticks among them, and scatter the rest of the flavourings on top. Stop at least 10 cm below the rim so there is room for the weight and the brine.',
        'Pune pe fundul borcanului jumătate din umbrelele de mărar, usturoi, piper boabe, foi de dafin și semințe de muștar. Așază legumele bine îndesate, cu bețișoarele de hrean printre ele, și presară deasupra restul condimentelor. Oprește-te la cel puțin 10 cm sub margine, ca să încapă greutatea și saramura.',
      ),
    },
    {
      key: 'cover',
      text: t(
        'Pour the brine over the vegetables. Lay the plate on top and weigh it down with the water-filled jar, so that every piece sits 2.5 to 5 cm below the surface of the brine. If the brine does not cover them, make more at the same strength: 75 g salt and 30 ml vinegar to each litre of water.',
        'Toarnă saramura peste legume. Pune deasupra farfuria și apasă-o cu borcanul cu apă, astfel încât fiecare bucată să stea la 2,5-5 cm sub suprafața saramurii. Dacă saramura nu le acoperă, fă mai multă, de aceeași tărie: 75 g de sare și 30 ml de oțet la fiecare litru de apă.',
      ),
    },
    {
      key: 'ferment',
      text: t(
        'Fit a lid with an airlock if you have one; otherwise cover the jar with a clean cloth. Keep it at 21 to 24 °C for about 3 to 4 weeks. If your room is cooler, at 13 to 18 °C, it takes 5 to 6 weeks; between 18 and 21 °C, expect about 4 to 5 weeks and go by the taste and the bubbles. Below 13 °C it may not ferment at all, so move it somewhere warmer. Do not let it go above 27 °C, where the pickles turn too soft.',
        'Pune un capac cu supapă de fermentare dacă ai; altfel acoperă borcanul cu un tifon sau un ștergar curat. Ține-l la 21-24 °C circa 3-4 săptămâni. Dacă încăperea e mai rece, la 13-18 °C, durează 5-6 săptămâni; între 18 și 21 °C, socotește circa 4-5 săptămâni și te iei după gust și după bule. Sub 13 °C poate să nu fermenteze deloc, așa că mută-l într-un loc mai cald. Nu-l lăsa peste 27 °C, pentru că murăturile se înmoaie prea tare.',
      ),
    },
    {
      key: 'check',
      text: t(
        'Look at the jar several times a week. A flat, smooth white film is kahm yeast: skim it off with a clean spoon and make sure everything is still under the brine. Anything fuzzy, or growing in raised round spots, is mould whatever its colour, white included: throw away all the pickles. Throw them away too if they turn soft or slimy or smell rotten.',
        'Verifică borcanul de mai multe ori pe săptămână. O pojghiță albă, netedă și plată („floare”, drojdie kahm) o iei cu o lingură curată, apoi verifică dacă totul e tot sub saramură. Orice e pufos sau crește în pete rotunde, ridicate, e mucegai, de orice culoare, și cel alb la fel: aruncă toate murăturile. Aruncă-le și dacă se înmoaie, se fac mâzgoase sau miros a putred.',
      ),
    },
    {
      key: 'ready',
      text: t(
        'After the fermentation time, taste a cucumber and a piece of cauliflower with a clean fork. The pickles are ready when the bubbling has slowed right down or stopped, the smell is pleasantly sour and the taste is sour right through. If not, leave them a few more days and check again.',
        'După timpul de fermentare, gustă un castravete și o bucată de conopidă cu o furculiță curată. Murăturile sunt gata când bulele s-au domolit de tot sau au dispărut, mirosul e plăcut acrișor, iar gustul e acru până în miez. Dacă nu, mai lasă-le câteva zile și verifică din nou.',
      ),
    },
    {
      key: 'chill',
      text: t(
        'Put the jar in the fridge, at 4 °C or below, with the pickles still under the brine. Skim any film as before and keep them for up to 4 months. Lift pickles out with a clean fork and never put one back.',
        'Pune borcanul la frigider, la 4 °C sau mai puțin, cu murăturile tot sub saramură. Ia pojghița, ca înainte și păstrează murăturile cel mult 4 luni. Scoate murăturile cu o furculiță curată și nu pune niciuna la loc.',
      ),
    },
  ],
  tips: [
    t(
      'This is a home fermentation with no lab-tested process behind this exact mix. The ferments tested by NCHFP cover only cucumbers (dill pickles) and cabbage (sauerkraut); this Recipe borrows the cucumber brine. If you want a tested recipe, ferment the cucumbers alone.',
      'Aceasta e o fermentare făcută acasă, fără un proces testat în laborator pentru exact acest amestec. Fermentările testate de NCHFP acoperă doar castraveții (murați cu mărar) și varza (varza murată); rețeta de față preia saramura de la castraveți. Dacă vrei o rețetă testată, fermentează doar castraveții.',
    ),
    t(
      'Never cut the salt: it, together with the acid that the fermentation makes, is what keeps harmful microbes from growing. Weigh it on a scale, because cups of coarse and fine salt weigh differently.',
      'Nu reduce sarea: ea, împreună cu aciditatea pe care o produce fermentarea, oprește dezvoltarea microbilor dăunători. Cântărește-o la cântar, pentru că o cană de sare grunjoasă și una de sare fină cântăresc diferit.',
    ),
    t(
      'Check the vinegar label: the tested recipe uses 5 % acidity vinegar. If yours is 9 %, use about 44 ml instead of 80 ml.',
      'Verifică eticheta oțetului: rețeta testată folosește oțet cu aciditate de 5 %. Dacă al tău are 9 %, pune circa 44 ml în loc de 80 ml.',
    ),
    t(
      'Do not can this mix: there is no tested canning time for it. Do not keep it in a cellar either: the 4 to 6 months NCHFP gives for fermented pickles assumes they are refrigerated.',
      'Nu pune acest amestec la conservat în borcane fierte: nu există un timp de sterilizare testat pentru el. Nici la pivniță nu-l ține: cele 4-6 luni date de NCHFP pentru murăturile fermentate presupun că ele stau la frigider.',
    ),
  ],
  stepTips: [
    {
      step: 'brine',
      text: t(
        '190 g in 2.5 litres matches the tested cucumber brine, half a cup of canning salt to 8 cups of water. Half a cup of fine canning salt weighs about 145 g (18 g a tablespoon); the tested recipe gives only the cups.',
        '190 g în 2,5 litri corespund saramurii testate pentru castraveți, o jumătate de cană de sare pentru conserve la 8 căni de apă. O jumătate de cană de sare fină pentru conserve cântărește circa 145 g (18 g lingura); rețeta testată dă doar cănile.',
      ),
    },
    {
      step: 'check',
      text: t(
        'Mould sends roots into the pickles, so scooping it off does not make them safe. When in doubt, throw it out.',
        'Mucegaiul își trimite rădăcinile în murături, așa că scoaterea lui de la suprafață nu le face sigure. Când ai îndoieli, aruncă.',
      ),
    },
  ],
  nutritionNote: t(
    'Low in calories, with some fibre from the vegetables and a tangy flavour that goes a long way, so a small portion is enough. The brine is very salty: eat them in small amounts, especially if you watch your salt, and do not drink the brine.',
    'Puține calorii, ceva fibre din legume, cu un gust acrișor puternic, așa că o porție mică ajunge. Saramura e foarte sărată: mănâncă murăturile în cantități mici, mai ales dacă ai grijă la sare, și nu bea saramura.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Bread', 'Pâine'),
      reason: t(
        'Plain bread softens the salt and the sourness of the pickles.',
        'Pâinea simplă domolește sarea și aciditatea murăturilor.',
      ),
      principle: 'complement_flavour',
      ingredient: 'bread',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'Sharp, sour pickles lift heavy winter meals.',
        'Murăturile acre însuflețesc mesele grele de iarnă.',
      ),
    },
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'A few pickles add crunch and sourness to a plain lunch.',
        'Câteva murături adaugă crocant și acreală unui prânz simplu.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Very salty and sour just before bed.',
        'Foarte sărate și acre chiar înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'muraturi-scandinavian',
      cuisine: 'scandinavian',
      title: t(
        'Agurkesalat (Danish sweet-and-sour quick-pickled cucumber)',
        'Agurkesalat (castraveți murați rapid în oțet cu zahăr, ca în Danemarca)',
      ),
      servings: 6,
      prepMinutes: 85,
      difficulty: 'easy',
      hideBaseTips: [0, 1, 2, 3],
      lines: [
        {
          ingredient: 'cucumber',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'about 300 g each, unpeeled, sliced paper-thin',
            'circa 300 g bucata, cu coajă, tăiați foarte subțire',
          ),
        },
        {
          ingredient: 'salt',
          quantity: 5,
          unit: 'g',
          optional: true,
          note: t(
            'to draw out the water, for a less watery salad',
            'pentru a scoate apa, ca salata să fie mai puțin apoasă',
          ),
        },
        {
          ingredient: 'vinegar',
          quantity: 200,
          unit: 'ml',
          note: t('5 % acidity', 'cu aciditate de 5 %'),
        },
        { ingredient: 'still-water', quantity: 0.15, unit: 'l' },
        { ingredient: 'sugar', quantity: 120, unit: 'g' },
        { ingredient: 'white-pepper', quantity: 1, unit: 'g' },
        {
          ingredient: 'dill',
          quantity: 5,
          unit: 'g',
          optional: true,
          note: t('chopped', 'tocat mărunt'),
        },
      ],
      steps: [
        {
          key: 'slice',
          text: t(
            'Slice the cucumbers paper-thin with a mandoline, using its guard, or a very sharp knife.',
            'Taie castraveții foarte subțire cu o mandolină, folosind protecția ei, sau cu un cuțit foarte ascuțit.',
          ),
        },
        {
          key: 'salt',
          text: t(
            'If you like the salad less watery, toss the slices with the salt in a bowl and leave them for 15 minutes, until they look wet and limp. Otherwise skip to the brine.',
            'Dacă vrei salata mai puțin apoasă, amestecă feliile cu sarea într-un bol și lasă-le 15 minute, până se umezesc și se înmoaie. Altfel treci direct la saramură.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'press',
          text: t(
            'If you salted the slices, squeeze them in your hands to press out the liquid, and drain it away. Pack the slices into a clean glass jar or dish.',
            'Dacă ai sărat feliile, stoarce-le în mâini ca să scoți lichidul și aruncă-l. Pune feliile într-un borcan de sticlă curat sau într-un vas.',
          ),
        },
        {
          key: 'brine',
          text: t(
            'Stir the vinegar, water, sugar and white pepper in a jug until the sugar has dissolved, with no grains at the bottom.',
            'Amestecă oțetul, apa, zahărul și piperul alb într-un vas mare, până se dizolvă zahărul și nu mai rămân cristale pe fund.',
          ),
        },
        {
          key: 'cover',
          text: t(
            'Pour the brine over the cucumber and press the slices down so they are covered. Scatter over the dill, if you use it.',
            'Toarnă saramura peste castraveți și apasă feliile ca să fie acoperite. Presară mărarul, dacă îl folosești.',
          ),
        },
        {
          key: 'chill',
          text: t(
            'Cover and put in the fridge for at least 1 hour before serving. Keep it in the fridge at all times.',
            'Acoperă și pune la frigider cel puțin 1 oră înainte de servire. Ține borcanul tot timpul la frigider.',
          ),
          timerSeconds: 3600,
        },
      ],
      tips: [
        t(
          'This is a quick vinegar pickle, not a ferment. It is not canned, so it must live in the fridge, and it is best eaten within a few days, while the slices are still crisp. Throw away what is left after 2 weeks, the shortest limit extension services give for fridge pickles.',
          'Aceasta e o murătură rapidă în oțet, nu o fermentare. Nu se pune la conservat în borcane fierte, deci stă la frigider, și e cea mai bună în câteva zile, cât feliile sunt încă crocante. Aruncă ce rămâne după 2 săptămâni, cea mai scurtă limită dată de ghidurile de siguranță alimentară ale universităților americane pentru murăturile de la frigider.',
        ),
        t(
          'Keep at least as much vinegar as water. Watering the brine down makes the pickle less safe.',
          'Ține cel puțin tot atât oțet cât apă. O saramură diluită face murătura mai puțin sigură.',
        ),
      ],
      stepTips: [
        {
          step: 'press',
          text: t(
            'If you salted the slices, squeeze out the water well: the cucumber would otherwise thin the brine.',
            'Dacă ai sărat feliile, scoate bine apa: altfel castravetele subțiază saramura.',
          ),
        },
      ],
      nutritionNote: t(
        'Very low in calories and with little fibre, a light salad that wakes up a plate; the sugar in the brine adds sweetness and the salt adds sodium, so eat it as a side, not a bowlful.',
        'Foarte puține calorii și puține fibre, o salată ușoară care înviorează farfuria; zahărul din saramură adaugă dulceață, iar sarea adaugă sodiu, așa că mănâncă-o ca garnitură, nu cu castronul.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t(
            'Frikadeller (Danish meatballs)',
            'Frikadeller (chiftele daneze)',
          ),
          reason: t(
            'In Denmark the cool, sweet-sour cucumber is served with fried meatballs like these: the acid cuts through the fat.',
            'În Danemarca, castravetele rece și dulce-acrișor se servește lângă chiftele prăjite ca acestea: aciditatea taie din grăsime.',
          ),
          principle: 'acid_cuts_fat',
          recipe: 'frikadeller',
        },
      ],
      eatingMoments: [
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Cool and tangy, it refreshes on a warm day.',
            'Rece și acrișor, înviorează într-o zi caldă.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Quick to make and light beside a main dish.',
            'Se face repede și e ușor lângă un fel principal.',
          ),
        },
      ],
    },
    {
      slug: 'muraturi-middle-eastern',
      cuisine: 'middle-eastern',
      title: t(
        'Kabees el lift (Lebanese pink pickled turnips)',
        'Kabees el lift (napi murați roz, ca în Liban)',
      ),
      servings: 12,
      prepMinutes: 10110,
      difficulty: 'easy',
      hideBaseTips: [0, 1, 2, 3],
      lines: [
        {
          ingredient: 'turnip',
          quantity: 1000,
          unit: 'g',
          note: t(
            'peeled, in batons about 1 cm thick and 6 cm long',
            'curățați, tăiați bețișoare de circa 1 cm grosime și 6 cm lungime',
          ),
        },
        {
          ingredient: 'beetroot',
          quantity: 100,
          unit: 'g',
          note: t(
            'raw, peeled, in thin wedges',
            'crudă, curățată, tăiată felii subțiri',
          ),
        },
        {
          ingredient: 'garlic',
          quantity: 15,
          unit: 'g',
          note: t('peeled cloves', 'căței curățați'),
        },
        {
          ingredient: 'vinegar',
          quantity: 600,
          unit: 'ml',
          note: t('5 % acidity', 'cu aciditate de 5 %'),
        },
        { ingredient: 'still-water', quantity: 0.6, unit: 'l' },
        {
          ingredient: 'salt',
          quantity: 40,
          unit: 'g',
          note: t('not iodised', 'nu iodată'),
        },
        {
          ingredient: 'sugar',
          quantity: 15,
          unit: 'g',
          optional: true,
        },
        {
          ingredient: 'bay-leaves',
          quantity: 0.4,
          unit: 'g',
          optional: true,
          note: t('2 leaves', '2 foi'),
        },
      ],
      steps: [
        {
          key: 'jars',
          text: t(
            'Wash two 1 litre jars and their lids in hot soapy water and rinse. Sanitise them by boiling the jars and lids for 10 minutes, then let them cool.',
            'Spală două borcane de 1 litru și capacele lor cu apă caldă și detergent, apoi clătește. Sterilizează-le fierbând borcanele și capacele 10 minute, apoi lasă-le să se răcească.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'cut',
          text: t(
            'Peel the turnips and cut them into batons. Peel the beetroot and cut it into thin wedges.',
            'Curăță napii și taie-i bețișoare. Curăță sfecla și taie-o felii subțiri.',
          ),
        },
        {
          key: 'pack',
          text: t(
            'Pack the turnip batons tightly into the jars, tucking the beetroot wedges, garlic and bay leaves among them.',
            'Pune bețișoarele de nap strâns în borcane, strecurând printre ele feliile de sfeclă, usturoiul și foile de dafin.',
          ),
        },
        {
          key: 'brine',
          text: t(
            'Stir the vinegar, water, salt and sugar, if you use it, in a jug until the salt has dissolved and the brine is clear.',
            'Amestecă oțetul, apa, sarea și zahărul, dacă îl folosești, într-un vas mare, până se dizolvă sarea și saramura e limpede.',
          ),
        },
        {
          key: 'cover',
          text: t(
            'Pour the brine over the turnips until they are fully covered, and press them down. Close the lids and put the jars in the fridge straight away. Do not leave them out on the counter.',
            'Toarnă saramura peste napi până sunt complet acoperiți și apasă-i. Închide capacele și pune borcanele imediat la frigider. Nu le lăsa pe blat.',
          ),
        },
        {
          key: 'wait',
          text: t(
            'Leave the jars in the fridge for about a week, until the turnips are bright pink and taste sour and tangy right through.',
            'Lasă borcanele la frigider circa o săptămână, până când napii devin roz aprins și au un gust acru și înțepător până în miez.',
          ),
        },
      ],
      tips: [
        t(
          'These are quick vinegar pickles, not a ferment and not canned. They go in the fridge from the start, because quick pickles left out for days have caused food poisoning. They are ready after about a week, so count 2 weeks from the day you made them, and eat them within a week of their being ready. That is the shortest limit extension services give for fridge pickles. Throw them away if they smell off or turn slimy.',
          'Sunt murături rapide în oțet, nu o fermentare și nu se pun la conservat în borcane fierte. Merg la frigider de la început, pentru că murăturile rapide lăsate zile întregi afară au provocat intoxicații. Sunt gata după circa o săptămână, așa că numără 2 săptămâni din ziua în care le-ai făcut și mănâncă-le în cel mult o săptămână de când sunt gata. E cea mai scurtă limită dată de ghidurile de siguranță alimentară ale universităților americane pentru murăturile de la frigider. Aruncă-le dacă miros ciudat sau devin vâscoase.',
        ),
        t(
          'Keep the vinegar at least equal to the water; do not dilute the brine.',
          'Ține oțetul cel puțin egal cu apa; nu dilua saramura.',
        ),
      ],
      stepTips: [
        {
          step: 'pack',
          text: t(
            'A few raw beetroot wedges are enough: more makes the turnips dark red instead of pink.',
            'Câteva felii de sfeclă crudă ajung: mai multă face napii roșu închis în loc de roz.',
          ),
        },
      ],
      nutritionNote: t(
        'Low in calories and crunchy, with some fibre from the turnip. The brine is salty and sour, so eat these as a small side and not as a main part of the meal.',
        'Puține calorii și crocante, cu ceva fibre din nap. Saramura e sărată și acră, așa că mănâncă-i ca o garnitură mică, nu ca parte principală a mesei.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t(
            'Falafel (fried chickpea patties with tahini sauce)',
            'Falafel (chiftele de năut cu sos de tahini)',
          ),
          reason: t(
            'The crisp, sour turnips are tucked into the pita with the falafel, so their crunch plays against the soft patties.',
            'Napii crocanți și acri se pun în pita împreună cu falafelul, iar crocantul lor contrastează cu chiftelele moi.',
          ),
          principle: 'contrast_texture',
          recipe: 'falafel',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Crunchy and sour, they add life to a simple pita with falafel.',
            'Crocanți și acrișori, dau viață unei pita simple cu falafel.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Salty and sour just before bed.',
            'Sărați și acri chiar înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
