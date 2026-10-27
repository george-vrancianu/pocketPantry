import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Garlic shrimp base is raw peeled shrimp seared in butter and oil with
// garlic, a splash of white wine, lemon and parsley. Each Variant is a full
// Recipe with its own lines, steps and guidance; the base's Recipe-level Tips
// are inherited, and the Variants hide the garlic Tip, which does not hold
// for them (their garlic goes in first).
export const garlicShrimp: BaseRecipeSeed = {
  slug: 'garlic-shrimp',
  title: t('Garlic butter shrimp', 'Creveți cu unt și usturoi'),
  servings: 2,
  prepMinutes: 10,
  cookMinutes: 10,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'shrimp',
      quantity: 300,
      unit: 'g',
      note: t(
        'raw, peeled and deveined, thawed if frozen',
        'crude, curățați și fără firul negru, decongelați dacă sunt congelați',
      ),
    },
    { ingredient: 'butter', quantity: 30, unit: 'g' },
    { ingredient: 'olive-oil', quantity: 15, unit: 'ml' },
    {
      ingredient: 'garlic',
      quantity: 15,
      unit: 'g',
      note: t('about 5 cloves, sliced', 'aproximativ 5 căței, tăiați felii'),
    },
    { ingredient: 'white-wine', quantity: 60, unit: 'ml', optional: true },
    {
      ingredient: 'lemon',
      quantity: 1,
      unit: 'pcs',
      note: t(
        'half juiced, half in wedges',
        'jumătate pentru suc, jumătate felii pentru servit',
      ),
    },
    {
      ingredient: 'parsley',
      quantity: 10,
      unit: 'g',
      note: t('leaves chopped', 'frunzele tocate'),
    },
    { ingredient: 'chilli-flakes', quantity: 1, unit: 'g', optional: true },
    { ingredient: 'salt', quantity: 2, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
    {
      ingredient: 'baguette',
      quantity: 0.5,
      unit: 'pcs',
      optional: true,
      note: t(
        'to serve, for mopping up the butter',
        'pentru servit, ca să înmoi în unt',
      ),
    },
  ],
  steps: [
    {
      key: 'prep-shrimp',
      text: t(
        'If the shrimp are frozen, thaw them overnight in the fridge, or seal them in a bag and leave them in a bowl of cold water for 15 to 20 minutes; never thaw them on the counter. Drain them, pat them very dry with paper towels, then toss with the salt and pepper.',
        'Dacă sunt congelați, lasă creveții să se decongeleze peste noapte la frigider sau pune-i într-o pungă închisă într-un bol cu apă rece, 15-20 de minute; nu-i decongela niciodată pe blat. Scurge-i, tamponează-i bine cu șervețele de hârtie, apoi amestecă-i cu sarea și piperul.',
      ),
    },
    {
      key: 'prep-rest',
      text: t(
        'Slice the garlic, chop the parsley, and halve the lemon. Squeeze one half and cut the other half into wedges.',
        'Taie usturoiul felii, toacă pătrunjelul și taie lămâia pe jumătate. Stoarce o jumătate și taie-o pe cealaltă felii.',
      ),
    },
    {
      key: 'sear',
      text: t(
        'Heat the olive oil and half of the butter in a large wide pan over medium-high heat until the butter foams. Add the shrimp in a single layer and cook for 90 seconds without moving them, until the underside is pink and lightly golden.',
        'Încinge uleiul de măsline și jumătate din unt într-o tigaie mare și lată, la foc mediu-mare, până face spumă untul. Adaugă creveții într-un singur strat și gătește-i 90 de secunde fără să-i miști, până când partea de jos devine roz și ușor aurie.',
      ),
      timerSeconds: 90,
    },
    {
      key: 'flip',
      text: t(
        'Turn the shrimp over and cook for 1 minute more, until they curl into a loose C and are pink and opaque all through. Move them to a plate.',
        'Întoarce creveții și gătește-i încă un minut, până se răsucesc într-un C larg și sunt roz și opaci în toată grosimea. Mută-i pe o farfurie.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'garlic',
      text: t(
        'Lower the heat to medium. Add the remaining butter, the garlic and the chilli flakes, and stir for 30 seconds until the garlic is fragrant and just pale gold.',
        'Micșorează focul la mediu. Adaugă untul rămas, usturoiul și fulgii de chili și amestecă 30 de secunde, până când usturoiul miroase puternic și se aurește ușor.',
      ),
      timerSeconds: 30,
    },
    {
      key: 'wine',
      text: t(
        'Pour in the wine, standing back as it spits, and simmer for 1 minute, scraping up the browned bits, until the pan is only half as wet. If you skip the wine, add a spoonful of water instead, standing back as it spits.',
        'Toarnă vinul, ferindu-te de stropi, și fierbe-l un minut, răzuind bucățelele rumenite de pe fundul tigăii, până când lichidul scade la jumătate. Dacă nu folosești vin, adaugă o lingură de apă, ferindu-te de stropi.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'finish',
      text: t(
        'Return the shrimp and their juices to the pan with the lemon juice and parsley. Toss for 30 seconds to warm them through, then cut the thickest shrimp open: it must be white and opaque, with no glassy grey centre. Taste and add salt if needed.',
        'Pune la loc creveții cu zeama lor, adaugă sucul de lămâie și pătrunjelul. Amestecă 30 de secunde ca să se încălzească, apoi taie cel mai gros crevete: trebuie să fie alb și opac, fără centru sticlos, cenușiu. Gustă și adaugă sare dacă e nevoie.',
      ),
      timerSeconds: 30,
    },
    {
      key: 'serve',
      text: t(
        'Spoon the shrimp and the garlic butter onto warm plates and serve at once with the lemon wedges and the baguette.',
        'Pune creveții și untul cu usturoi în farfurii calde și servește imediat, cu felii de lămâie și baghetă.',
      ),
    },
  ],
  tips: [
    t(
      'Dry shrimp in a single layer sear; wet or crowded shrimp steam and turn rubbery. Cook in two batches if your pan is small.',
      'Creveții uscați, într-un singur strat, se rumenesc; cei uzi sau înghesuiți fierb în abur și devin cauciucați. Dacă tigaia e mică, gătește-i în două tranșe.',
    ),
    t(
      'Add the garlic only after the shrimp are out and the heat is down: over high heat it burns in seconds and turns the whole pan bitter.',
      'Pune usturoiul abia după ce ai scos creveții și ai micșorat focul: la foc mare se arde în câteva secunde și amărăște tot sosul.',
    ),
    t(
      'Cooked shrimp keep poorly: cool leftovers within 2 hours, keep them in the fridge and eat them the next day, reheated gently until steaming hot, or they turn tough.',
      'Creveții gătiți se păstrează puțin: răcește resturile în maximum 2 ore, ține-le la frigider și mănâncă-i a doua zi, reîncălziți ușor până scot aburi, altfel devin tari.',
    ),
  ],
  stepTips: [
    {
      step: 'sear',
      text: t(
        'If a shrimp sticks when you try to turn it, give it another 15 seconds: it lets go of the pan once the crust has formed.',
        'Dacă un crevete se lipește când vrei să-l întorci, mai lasă-l 15 secunde: se desprinde de tigaie după ce s-a format crusta.',
      ),
    },
  ],
  nutritionNote: t(
    'Shrimp are lean and rich in protein with almost no carbohydrate; the butter adds saturated fat and the dish has no fibre, so serve it with a green salad or vegetables. Shrimp and the added salt make it fairly salty, so go easy on extra salt and salty bread.',
    'Creveții sunt slabi și bogați în proteine, aproape fără carbohidrați; untul aduce grăsimi saturate, iar preparatul nu are fibre, așa că servește-l cu salată verde sau legume. Creveții și sarea adăugată îl fac destul de sărat, deci nu mai sări și evită pâinea prea sărată.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Parmesan risotto (risotto bianco)', 'Risotto cu parmezan'),
      reason: t(
        'Spoon the shrimp and their garlic butter over it: the creamy rice soaks up the sauce.',
        'Pune creveții și untul cu usturoi peste el: orezul cremos absoarbe sosul.',
      ),
      principle: 'complement_flavour',
      recipe: 'risotto',
    },
    {
      kind: 'food',
      label: t('Steamed rice', 'Orez fiert'),
      reason: t(
        'A neutral base that takes up the garlic butter instead of wasting it.',
        'O bază neutră care preia untul cu usturoi, în loc să-l lași în farfurie.',
      ),
      principle: 'fat_carries_flavour',
      ingredient: 'rice',
    },
    {
      kind: 'food',
      label: t('Rocket salad', 'Salată de rucola'),
      reason: t(
        'Its peppery bitterness balances the rich butter.',
        'Amăreala ei piperată echilibrează untul gras.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'rocket',
    },
    {
      kind: 'drink',
      label: t('Sparkling water', 'Apă minerală'),
      reason: t(
        'The bubbles cleanse the palate between buttery mouthfuls.',
        'Bulele curăță gustul între îmbucăturile cu unt.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'sparkling-water',
    },
  ],
  eatingMoments: [
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'Ready in 20 minutes and light on the stomach with a salad.',
        'Gata în 20 de minute și ușor la stomac, alături de o salată.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Lean protein for recovery; add rice or bread for carbohydrates.',
        'Proteine slabe pentru refacere; adaugă orez sau pâine pentru carbohidrați.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Butter and garlic sit heavy and repeat on you during hard exercise.',
        'Untul și usturoiul cad greu și se simt în timpul unui efort intens.',
      ),
    },
  ],
  variants: [
    {
      slug: 'garlic-shrimp-spanish',
      cuisine: 'spanish',
      title: t(
        'Gambas al ajillo',
        'Creveți cu usturoi în ulei, ca în Spania (gambas al ajillo)',
      ),
      servings: 2,
      prepMinutes: 10,
      cookMinutes: 9,
      difficulty: 'easy',
      hideBaseTips: [0, 1],
      lines: [
        {
          ingredient: 'shrimp',
          quantity: 250,
          unit: 'g',
          note: t(
            'raw, peeled and deveined, thawed if frozen',
            'crude, curățați și fără firul negru, decongelați dacă sunt congelați',
          ),
        },
        { ingredient: 'olive-oil', quantity: 120, unit: 'ml' },
        {
          ingredient: 'garlic',
          quantity: 20,
          unit: 'g',
          note: t(
            'about 6 cloves, sliced',
            'aproximativ 6 căței, tăiați felii',
          ),
        },
        {
          ingredient: 'dried-red-chillies',
          quantity: 1,
          unit: 'g',
          note: t(
            '1 to 2 whole pods, snapped in half',
            '1-2 păstăi întregi, rupte în două',
          ),
        },
        {
          ingredient: 'parsley',
          quantity: 8,
          unit: 'g',
          note: t('leaves chopped', 'frunzele tocate'),
        },
        { ingredient: 'salt', quantity: 3, unit: 'g' },
        {
          ingredient: 'baguette',
          quantity: 0.5,
          unit: 'pcs',
          note: t('to serve, for the oil', 'pentru servit, la uleiul din vas'),
        },
      ],
      steps: [
        {
          key: 'prep-shrimp',
          text: t(
            'If the shrimp are frozen, thaw them overnight in the fridge, or seal them in a bag and leave them in a bowl of cold water for 15 to 20 minutes; never thaw them on the counter. Drain, then pat them completely dry with paper towels (wet shrimp make the hot oil spit) and toss with the salt.',
            'Dacă sunt congelați, lasă creveții să se decongeleze peste noapte la frigider sau pune-i într-o pungă închisă într-un bol cu apă rece, 15-20 de minute; nu-i decongela niciodată pe blat. Scurge-i și tamponează-i complet cu șervețele de hârtie (creveții uzi fac uleiul fierbinte să sară) apoi amestecă-i cu sarea.',
          ),
        },
        {
          key: 'prep-rest',
          text: t(
            'Slice the garlic thinly, snap the chilli pods in half and chop the parsley.',
            'Taie usturoiul felii subțiri, rupe păstăile de ardei în două și toacă pătrunjelul.',
          ),
        },
        {
          key: 'infuse',
          text: t(
            'Put the oil, garlic and chilli into a flameproof clay cazuela or a small heavy frying pan and warm over medium-low heat for about 4 minutes, until the garlic bubbles gently and turns pale gold at the edges. Do not let it brown.',
            'Pune uleiul, usturoiul și ardeiul într-un vas de lut rezistent la foc (cazuela) sau într-o tigaie mică și grea și încălzește-le la foc mic-mediu aproximativ 4 minute, până când usturoiul bolborosește încet și se aurește ușor la margini. Nu-l lăsa să se rumenească.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'cook',
          text: t(
            'Raise the heat to medium-high, add the shrimp in a single layer and cook for about 2 minutes, turning once, until they are pink and opaque all through and curled into a loose C.',
            'Mărește focul la mediu-mare, adaugă creveții într-un singur strat și gătește-i aproximativ 2 minute, întorcându-i o dată, până când sunt roz și opaci în toată grosimea și răsuciți într-un C larg.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'finish',
          text: t(
            'Take the dish off the heat, scatter the parsley over the top and check that the thickest shrimp is white right through. Serve sizzling, in the dish, with the baguette for the oil.',
            'Ia vasul de pe foc, presară pătrunjelul și verifică dacă cel mai gros crevete e alb în toată grosimea. Servește-l încă sfârâind, în vasul în care l-ai gătit, cu bagheta pentru uleiul din el.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'infuse',
          text: t(
            'Start the garlic in cold oil and keep the heat low: the slices flavour the oil slowly instead of browning and turning bitter.',
            'Pune usturoiul în uleiul rece și ține focul mic: feliile dau gust uleiului treptat, în loc să se rumenească și să amărască.',
          ),
        },
      ],
      nutritionNote: t(
        'Shrimp give lean protein and the olive oil is mostly unsaturated fat, but there is a lot of it in the dish, so the calories depend on how much oil and bread you eat. It is salty, and with only a little parsley and no vegetables it has almost no fibre.',
        'Creveții aduc proteine slabe, iar uleiul de măsline are mai ales grăsimi nesaturate, dar în vas e mult, așa că numărul de calorii depinde de cât ulei și câtă pâine mănânci. Este sărat și, cu puțin pătrunjel și fără legume, aproape că nu are fibre.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Spanish tapas platter', 'Platou spaniol de tapas'),
          reason: t(
            'Gambas al ajillo is itself a tapa: set it out beside the other small plates.',
            'Gambas al ajillo este chiar o tapa: pune-o pe masă lângă celelalte farfurii mici.',
          ),
          principle: 'regional_tradition',
          recipe: 'appetizer-platter-spanish',
        },
        {
          kind: 'food',
          label: t('Tomato salad', 'Salată de roșii'),
          reason: t(
            'Its acidity cuts through the hot olive oil.',
            'Aciditatea ei taie din grăsimea uleiului fierbinte.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'tomato',
        },
        {
          kind: 'drink',
          label: t('Chilled dry white wine', 'Vin alb sec, rece'),
          reason: t(
            'Crisp acidity refreshes the palate between garlicky mouthfuls.',
            'Aciditatea lui proaspătă împrospătează gustul între îmbucăturile cu usturoi.',
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
            'A small, quick plate that suits a light meal.',
            'O farfurie mică și rapidă, potrivită pentru o masă ușoară.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein for recovery, with bread for carbohydrates.',
            'Proteine pentru refacere, cu pâine pentru carbohidrați.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Plenty of oil and garlic sits heavy close to bedtime.',
            'Uleiul din belșug și usturoiul cad greu înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'garlic-shrimp-thai',
      cuisine: 'thai',
      title: t(
        'Thai garlic and pepper shrimp (goong kratiem prik thai)',
        'Creveți thailandezi cu usturoi și piper (goong kratiem prik thai)',
      ),
      servings: 2,
      prepMinutes: 15,
      cookMinutes: 23,
      difficulty: 'easy',
      hideBaseTips: [1],
      lines: [
        {
          ingredient: 'shrimp',
          quantity: 300,
          unit: 'g',
          note: t(
            'raw, peeled and deveined, thawed if frozen',
            'crude, curățați și fără firul negru, decongelați dacă sunt congelați',
          ),
        },
        {
          ingredient: 'garlic',
          quantity: 30,
          unit: 'g',
          note: t('about 8 cloves', 'aproximativ 8 căței'),
        },
        {
          ingredient: 'coriander',
          quantity: 25,
          unit: 'g',
          note: t(
            'roots and stems, well washed and finely chopped (stems alone if your bunch has no roots)',
            'rădăcinile și tulpinile, bine spălate și tocate mărunt (doar tulpinile, dacă legătura nu are rădăcini)',
          ),
        },
        { ingredient: 'white-pepper', quantity: 2, unit: 'g' },
        { ingredient: 'fish-sauce', quantity: 15, unit: 'ml' },
        { ingredient: 'oyster-sauce', quantity: 15, unit: 'ml' },
        { ingredient: 'soy-sauce', quantity: 10, unit: 'ml', optional: true },
        { ingredient: 'sugar', quantity: 5, unit: 'g' },
        { ingredient: 'sunflower-oil', quantity: 45, unit: 'ml' },
        {
          ingredient: 'jasmine-rice',
          quantity: 150,
          unit: 'g',
          note: t('to serve', 'pentru servit'),
        },
        {
          ingredient: 'still-water',
          quantity: 0.25,
          unit: 'l',
          note: t('for the rice', 'pentru orez'),
        },
        {
          ingredient: 'cucumber',
          quantity: 0.5,
          unit: 'pcs',
          optional: true,
          note: t('sliced, to serve', 'felii, pentru servit'),
        },
      ],
      steps: [
        {
          key: 'prep-shrimp',
          text: t(
            'If the shrimp are frozen, thaw them overnight in the fridge, or seal them in a bag and leave them in a bowl of cold water for 15 to 20 minutes; never thaw them on the counter. Drain them and pat them very dry with paper towels.',
            'Dacă sunt congelați, lasă creveții să se decongeleze peste noapte la frigider sau pune-i într-o pungă închisă într-un bol cu apă rece, 15-20 de minute; nu-i decongela niciodată pe blat. Scurge-i și tamponează-i bine cu șervețele de hârtie.',
          ),
        },
        {
          key: 'paste',
          text: t(
            'Pound the garlic, coriander roots and stems and white pepper in a mortar to a coarse paste. If you have no mortar, chop everything as finely as you can and mash it with the flat of the knife.',
            'Pisează usturoiul, rădăcinile și tulpinile de coriandru și piperul alb în mojar, până obții o pastă grosieră. Dacă nu ai mojar, toacă totul cât mai mărunt și strivește cu partea lată a cuțitului.',
          ),
        },
        {
          key: 'sauce',
          text: t(
            'Stir the fish sauce, oyster sauce, soy sauce (if using) and sugar together in a small bowl until the sugar dissolves.',
            'Amestecă într-un bol mic sosul de pește, sosul de stridii, sosul de soia (dacă îl folosești) și zahărul, până se dizolvă zahărul.',
          ),
        },
        {
          key: 'rice',
          text: t(
            'Rinse the rice in a sieve until the water runs almost clear. Bring it to the boil with the water in a small pot with a lid, then turn the heat to its lowest, cover and cook for 12 minutes.',
            'Spală orezul într-o strecurătoare până când apa e aproape limpede. Adu-l la fierbere cu apa într-o oală mică cu capac, apoi dă focul la minimum, acoperă și lasă-l 12 minute.',
          ),
          timerSeconds: 720,
        },
        {
          key: 'rest',
          text: t(
            'Take the rice off the heat and leave it covered for 5 minutes. Use this time for the next steps (the shrimp may finish just after the rice), then fluff it with a fork.',
            'Ia orezul de pe foc și lasă-l acoperit 5 minute. Folosește timpul pentru pașii următori (creveții pot fi gata puțin după orez), apoi răsfiră-l cu o furculiță.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'fry-paste',
          text: t(
            'While the rice rests, heat the oil in a wok or large frying pan over medium heat. Fry the paste, stirring, for 2 to 3 minutes, until it smells fragrant and is pale gold and crisp. Lift it out with a slotted spoon, leaving the oil in the pan.',
            'În timp ce orezul stă acoperit, încinge uleiul într-un wok sau o tigaie mare la foc mediu. Prăjește pasta, amestecând, 2-3 minute, până miroase puternic și devine aurie deschis și crocantă. Scoate-o cu o lingură cu găuri, lăsând uleiul în tigaie.',
          ),
          timerSeconds: 150,
        },
        {
          key: 'fry-shrimp',
          text: t(
            'Raise the heat to high, add the shrimp in a single layer and cook for about 2 minutes, turning once, until they are pink and opaque all through and curled into a loose C.',
            'Mărește focul la maximum, adaugă creveții într-un singur strat și gătește-i aproximativ 2 minute, întorcându-i o dată, până când sunt roz și opaci în toată grosimea și răsuciți într-un C larg.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'toss',
          text: t(
            'Return the fried paste, pour in the sauce and toss for 30 seconds, until the shrimp are glazed. Cut the thickest shrimp open to check that it is white right through.',
            'Pune la loc pasta prăjită, toarnă sosul și amestecă 30 de secunde, până când creveții se glazurează. Taie cel mai gros crevete ca să verifici dacă e alb în toată grosimea.',
          ),
          timerSeconds: 30,
        },
        {
          key: 'serve',
          text: t(
            'Serve straight away over the jasmine rice, with the cucumber slices on the side.',
            'Servește imediat peste orezul jasmine, cu felii de castravete alături.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'fry-paste',
          text: t(
            'Keep the heat at medium and stir constantly: the thin bits of garlic go from golden to bitter in seconds.',
            'Ține focul mediu și amestecă mereu: bucățelele subțiri de usturoi trec din auriu în amar în câteva secunde.',
          ),
        },
      ],
      nutritionNote: t(
        'Shrimp give lean protein and the garlic and herbs add flavour without much fat, with a fair amount of oil, all of it eaten with the shrimp; the white jasmine rice is mostly refined carbohydrate and the fish and oyster sauces are very salty. Add a vegetable side for fibre.',
        'Creveții aduc proteine slabe, iar usturoiul și ierburile dau gust fără multă grăsime, cu destul ulei, mâncat în întregime odată cu creveții; orezul jasmine alb este în mare parte carbohidrat rafinat, iar sosurile de pește și de stridii sunt foarte sărate. Adaugă o garnitură de legume pentru fibre.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t(
            'Pad kra pao (holy basil stir-fry with pork)',
            'Pad kra pao (porc sotat cu busuioc sfânt)',
          ),
          reason: t(
            'Two quick wok dishes shared over jasmine rice make a Thai family-style meal.',
            'Două preparate rapide la wok, împărțite cu orez jasmine, alcătuiesc o masă thailandeză în familie.',
          ),
          principle: 'regional_tradition',
          recipe: 'stir-fry-thai',
        },
        {
          kind: 'food',
          label: t('Lime wedges', 'Felii de lime'),
          reason: t(
            'A squeeze of lime cuts through the oil and lifts the salty, garlicky glaze.',
            'Puțin lime taie din ulei și ridică glazura sărată, cu usturoi.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'lime',
        },
        {
          kind: 'drink',
          label: t('Cold lager', 'Bere blondă, rece'),
          reason: t(
            'Light bitterness and bubbles refresh the palate after salty, peppery bites.',
            'Amăreala ușoară și bulele împrospătează gustul după îmbucături sărate și piperate.',
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
            'Quick to cook and not too heavy over a bowl of rice.',
            'Se gătește repede și nu e prea greu, servit peste o porție de orez.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from the shrimp and carbohydrates from the rice.',
            'Proteine din creveți și carbohidrați din orez.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Light and quick, with cool cucumber on the side.',
            'Ușor și rapid, cu castravete răcoros alături.',
          ),
        },
      ],
    },
  ],
};
