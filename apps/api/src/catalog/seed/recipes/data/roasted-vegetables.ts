import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Roasted vegetables base is a hot tray of root and summer vegetables with
// olive oil, garlic and woody herbs. Each Variant is a full Recipe with its own
// lines, steps and guidance. The base's Recipe-level Tips are inherited except
// where a Variant hides them: index 0 (room on the tray), 1 (roots and soft vegetables on separate trays) and
// 2 (storage and reheating of the roasted tray).
export const roastedVegetables: BaseRecipeSeed = {
  slug: 'roasted-vegetables',
  title: t('Roasted vegetables', 'Legume la cuptor'),
  servings: 4,
  prepMinutes: 20,
  cookMinutes: 40,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'carrot',
      quantity: 300,
      unit: 'g',
      note: t(
        'peeled, cut into 3 cm chunks',
        'curățați, tăiați în bucăți de 3 cm',
      ),
    },
    {
      ingredient: 'parsnip',
      quantity: 250,
      unit: 'g',
      note: t(
        'peeled, cut into 3 cm chunks',
        'curățat, tăiat în bucăți de 3 cm',
      ),
    },
    {
      ingredient: 'sweet-potato',
      quantity: 400,
      unit: 'g',
      note: t(
        'scrubbed, cut into 3 cm chunks',
        'spălați, tăiați în bucăți de 3 cm',
      ),
    },
    {
      ingredient: 'red-onion',
      quantity: 2,
      unit: 'pcs',
      note: t('cut into wedges', 'tăiate în opt'),
    },
    {
      ingredient: 'bell-pepper',
      quantity: 2,
      unit: 'pcs',
      note: t(
        'seeded, cut into 4 cm pieces',
        'fără semințe, tăiați în bucăți de 4 cm',
      ),
    },
    {
      ingredient: 'zucchini',
      quantity: 2,
      unit: 'pcs',
      note: t(
        'cut into 4 cm thick half-moons',
        'tăiați în semirondele groase de 4 cm',
      ),
    },
    {
      ingredient: 'garlic',
      quantity: 30,
      unit: 'g',
      note: t('one head, cloves left unpeeled', 'un cap, cu cățeii nedecojiți'),
    },
    { ingredient: 'olive-oil', quantity: 60, unit: 'ml' },
    {
      ingredient: 'thyme',
      quantity: 6,
      unit: 'g',
      note: t('leaves picked', 'doar frunzele'),
    },
    {
      ingredient: 'rosemary',
      quantity: 4,
      unit: 'g',
      note: t('leaves chopped', 'frunzele tocate'),
    },
    { ingredient: 'salt', quantity: 7, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
  ],
  steps: [
    {
      key: 'preheat',
      text: t(
        'Set the oven to 220 °C (200 °C fan) and put two large trays in it to heat while you cut the vegetables.',
        'Setează cuptorul la 220 °C (200 °C cu ventilator) și pune în el două tăvi mari, ca să se încălzească cât tai legumele.',
      ),
    },
    {
      key: 'cut',
      text: t(
        'Cut the carrots, parsnip and sweet potato into 3 cm chunks, and the onions, peppers and courgettes into slightly larger pieces, since they cook faster. Keep the two groups apart.',
        'Taie morcovii, păstârnacul și cartofii dulci în bucăți de 3 cm, iar ceapa, ardeii și dovleceii în bucăți ceva mai mari, fiindcă se gătesc mai repede. Ține cele două grupe separat.',
      ),
    },
    {
      key: 'season-roots',
      text: t(
        'Toss the carrots, parsnip, sweet potato and the garlic cloves in a bowl with half of the oil, half of the salt, the pepper, the thyme and the rosemary until every piece shines.',
        'Amestecă într-un bol morcovii, păstârnacul, cartofii dulci și cățeii de usturoi cu jumătate din ulei, jumătate din sare, piperul, cimbrul și rozmarinul, până când toate bucățile strălucesc.',
      ),
    },
    {
      key: 'roast-roots',
      text: t(
        'Tip the roots onto one hot tray in a single layer, with gaps between the pieces, and roast for 15 minutes.',
        'Răstoarnă rădăcinoasele pe o tavă încinsă, într-un singur strat, cu spații între bucăți, și coace-le 15 minute.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'season-soft',
      text: t(
        'While the roots roast, toss the onions, peppers and courgettes with the remaining oil and salt and spread them in a single layer on the second hot tray.',
        'Cât se coc rădăcinoasele, amestecă ceapa, ardeii și dovleceii cu uleiul și sarea rămase și întinde-i într-un singur strat pe a doua tavă încinsă.',
      ),
    },
    {
      key: 'roast-all',
      text: t(
        'Turn the roots over, slide the second tray into the oven and roast both for 25 minutes more, turning the vegetables once when their edges start to colour, until a knife slips into the sweet potato and the edges are browned.',
        'Întoarce rădăcinoasele pe partea cealaltă, bagă în cuptor a doua tavă și coace-le pe amândouă încă 25 de minute, întorcând legumele o dată când marginile încep să se rumenească, până când cuțitul intră ușor în cartoful dulce și marginile sunt rumene.',
      ),
      timerSeconds: 1500,
    },
    {
      key: 'serve',
      text: t(
        'Combine the vegetables on a warm platter. Squeeze a few of the soft garlic cloves out of their skins and mash them over the top, then serve hot.',
        'Pune legumele împreună pe un platou cald. Scoate din coajă câțiva dinți de usturoi moi, strivește-i peste legume și servește fierbinte.',
      ),
    },
  ],
  tips: [
    t(
      'Give the vegetables room: pieces packed together steam and turn soft instead of browning. If they touch on all sides, use another tray or roast in two rounds.',
      'Lasă legumele să aibă loc: bucățile îngrămădite se aburesc și se înmoaie în loc să se rumenească. Dacă se ating pe toate laturile, folosește altă tavă sau coace în două tranșe.',
    ),
    t(
      'Roots and soft vegetables cook at different speeds, which is why they go on separate trays. With only one tray, add the onions, peppers and courgettes 15 minutes in.',
      'Rădăcinoasele și legumele moi se coc în ritmuri diferite, de aceea merg pe tăvi separate. Cu o singură tavă, adaugă ceapa, ardeii și dovleceii după 15 minute.',
    ),
    t(
      'Cool leftovers within two hours, keep them covered in the fridge for up to 3 days and re-crisp them on a tray in a 200 °C oven for about 10 minutes. The microwave makes them soggy.',
      'Lasă resturile să se răcească în maximum două ore, păstrează-le acoperite la frigider până la 3 zile și rumenește-le din nou pe o tavă, la 200 °C, aproximativ 10 minute. Cuptorul cu microunde le înmoaie.',
    ),
  ],
  stepTips: [
    {
      step: 'cut',
      text: t(
        'Pat washed vegetables dry before oiling them: water on the surface steams the pieces instead of letting them brown.',
        'Usucă bine legumele spălate (cu un prosop) înainte să le dai cu ulei: apa de pe suprafață le aburește în loc să le lase să se rumenească.',
      ),
    },
    {
      step: 'preheat',
      text: t(
        'A hot tray gives the vegetables a head start: they sizzle the moment they land and brown on the underside.',
        'O tavă încinsă dă legumelor un avantaj: ele sfârâie imediat ce ating tava și se rumenesc pe dedesubt.',
      ),
    },
  ],
  nutritionNote: t(
    'Lots of vegetable fibre, and olive oil is mostly unsaturated fat. The oil makes the tray energy-dense, the sweet potato and carrots add natural sugars that caramelise, and salt adds up quickly. It holds little protein, so serve it with some.',
    'Multe fibre din legume, iar uleiul de măsline conține în mare parte grăsimi nesaturate. Uleiul face tava bogată în energie, cartofii dulci și morcovii aduc zaharuri naturale care se caramelizează, iar sarea se adună repede. Conține puține proteine, așa că servește-o cu o sursă de proteine.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Roast chicken', 'Pui la cuptor'),
      reason: t(
        "Both come from the oven, and the vegetables are good tossed in the chicken's pan juices before serving.",
        'Amândouă ies din cuptor, iar legumele sunt bune amestecate cu sosul rămas în tava puiului.',
      ),
      principle: 'complement_flavour',
      recipe: 'roast-chicken',
    },
    {
      kind: 'food',
      label: t('Crumbled goat cheese', 'Brânză de capră mărunțită'),
      reason: t(
        'Its salty tang balances the sweetness of the roasted sweet potato and carrots.',
        'Aroma sărată și acrișoară echilibrează dulceața cartofilor dulci și a morcovilor copți.',
      ),
      principle: 'salt_balances_sweet',
      ingredient: 'goat-cheese',
    },
    {
      kind: 'food',
      label: t('Greek yogurt', 'Iaurt grecesc'),
      reason: t(
        'A cool, creamy spoonful against the hot, caramelised edges.',
        'O lingură de cremă rece lângă marginile calde și caramelizate.',
      ),
      principle: 'contrast_texture',
      ingredient: 'greek-yogurt',
    },
    {
      kind: 'drink',
      label: t('Dry white wine', 'Vin alb sec'),
      reason: t(
        'Its acidity cuts the olive oil and the sweetness of the roots.',
        'Aciditatea lui taie uleiul de măsline și dulceața rădăcinoaselor.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'white-wine',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'Hot from the oven, and the oven warms the kitchen.',
        'Fierbinți din cuptor, iar cuptorul încălzește bucătăria.',
      ),
    },
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'Filling with bread or a protein on the side.',
        'Săturătoare, cu pâine sau o sursă de proteine alături.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'The oven runs hot for 40 minutes and heats the whole kitchen.',
        'Cuptorul merge fierbinte 40 de minute și încălzește toată bucătăria.',
      ),
    },
  ],
  variants: [
    {
      slug: 'roasted-vegetables-french',
      cuisine: 'french',
      // A tian is packed tight on purpose and has no separate trays; the storage tip is for a tray.
      hideBaseTips: [0, 1, 2],
      title: t(
        'Tian provençal',
        'Tian provensal (legume coapte în rânduri, în tavă)',
      ),
      servings: 4,
      prepMinutes: 25,
      cookMinutes: 85,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'aubergine',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'about 300 g, slim if you can find one, sliced 5 mm thick; halve any large rounds',
            'de aproximativ 300 g, subțire dacă găsești, tăiată felii de 5 mm; taie în jumătate rondelele mari',
          ),
        },
        {
          ingredient: 'zucchini',
          quantity: 2,
          unit: 'pcs',
          note: t('sliced 5 mm thick', 'tăiați felii de 5 mm'),
        },
        {
          ingredient: 'tomato',
          quantity: 400,
          unit: 'g',
          note: t('firm, sliced 5 mm thick', 'ferme, tăiate felii de 5 mm'),
        },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('thinly sliced', 'tăiate subțire'),
        },
        {
          ingredient: 'garlic',
          quantity: 12,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        { ingredient: 'olive-oil', quantity: 60, unit: 'ml' },
        {
          ingredient: 'thyme',
          quantity: 5,
          unit: 'g',
          note: t('leaves picked', 'doar frunzele'),
        },
        { ingredient: 'salt', quantity: 5, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Set the oven to 180 °C (160 °C fan). Brush a 24 x 20 cm baking dish with a little of the oil.',
            'Setează cuptorul la 180 °C (160 °C cu ventilator). Unge cu puțin ulei o tavă de copt de 24 x 20 cm.',
          ),
        },
        {
          key: 'slice',
          text: t(
            'Slice the aubergine, courgettes and tomatoes 5 mm thick, as evenly as you can. Slice the onions thinly.',
            'Taie vinetele, dovleceii și roșiile felii de 5 mm, cât mai egale. Taie ceapa subțire.',
          ),
        },
        {
          key: 'onions',
          text: t(
            'Soften the onions in 2 tablespoons of the oil in a wide pan over medium-low heat for 15 minutes, stirring now and then, until very soft and pale gold. Stir in the garlic and half of the thyme, take the pan off the heat and spread the onions over the bottom of the dish.',
            'Călește ceapa în 2 linguri de ulei, într-o tigaie lată, la foc mic-mediu, 15 minute, amestecând din când în când, până devine foarte moale și ușor aurie. Adaugă usturoiul și jumătate din cimbru, ia tigaia de pe foc și întinde ceapa pe fundul tavei.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'assemble',
          text: t(
            'Stand the slices upright in tight rows over the onions, alternating aubergine, courgette and tomato, until the dish is full. Season with the salt and pepper, scatter over the remaining thyme and trickle with the remaining oil.',
            'Așază feliile în picioare, în rânduri strânse, peste ceapă, alternând vinete, dovlecei și roșii, până se umple tava. Presară sare, piper și restul de cimbru și toarnă peste ele uleiul rămas.',
          ),
        },
        {
          key: 'bake-covered',
          text: t(
            'Cover the dish tightly with foil and bake for 30 minutes.',
            'Acoperă strâns tava cu folie de aluminiu și coace 30 de minute.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'bake-uncovered',
          text: t(
            'Remove the foil and bake for 30 minutes more, until the vegetables are very soft, the juices have reduced and the edges are caught and golden.',
            'Scoate folia și coace încă 30 de minute, până când legumele sunt foarte moi, sucul s-a redus și marginile sunt rumenite.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'rest',
          text: t(
            'Let the tian rest for 10 minutes before serving, warm or at room temperature.',
            'Lasă tianul să se odihnească 10 minute înainte de servire, cald sau la temperatura camerei.',
          ),
          timerSeconds: 600,
        },
      ],
      tips: [
        t(
          'Cool leftovers within two hours and keep them covered in the fridge for up to 3 days. The tian tastes even better the next day, cold or warmed gently.',
          'Lasă resturile să se răcească în maximum două ore și păstrează-le acoperite la frigider până la 3 zile. Tianul e și mai bun a doua zi, rece sau încălzit ușor.',
        ),
      ],
      stepTips: [
        {
          step: 'assemble',
          text: t(
            'Pack the rows tighter than looks sensible: the vegetables shrink a lot as they bake and will fall over if there is slack.',
            'Înghesuie rândurile mai tare decât ți se pare firesc: legumele se micșorează mult la copt și se răstoarnă dacă au loc.',
          ),
        },
        {
          step: 'slice',
          text: t(
            'Use firm tomatoes. Very ripe ones collapse into the dish instead of holding their shape.',
            'Alege roșii ferme. Cele foarte coapte se desfac în tavă în loc să-și păstreze forma.',
          ),
        },
      ],
      nutritionNote: t(
        'Plenty of vegetables and olive oil, which is mostly unsaturated fat, with little else added. The aubergine soaks up oil, so the dish is more energy-dense than it looks. It has little protein, so serve it with some.',
        'Multe legume și ulei de măsline, bogat în grăsimi nesaturate, fără alte adaosuri. Vinetele absorb ulei, așa că preparatul e mai bogat în energie decât pare. Are puține proteine, deci servește-l cu o sursă de proteine.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Baguette', 'Baghetă'),
          reason: t(
            'Crisp bread to mop up the olive oil and tomato juices.',
            'Pâine crocantă cu care ștergi uleiul de măsline și sucul roșiilor.',
          ),
          principle: 'contrast_texture',
          ingredient: 'baguette',
        },
        {
          kind: 'food',
          label: t('Crumbled goat cheese', 'Brânză de capră mărunțită'),
          reason: t(
            'Its tang lifts the soft, sweet vegetables.',
            'Aroma ei acrișoară ridică gustul legumelor moi și dulci.',
          ),
          principle: 'complement_flavour',
          ingredient: 'goat-cheese',
        },
        {
          kind: 'drink',
          label: t('Dry rosé', 'Rosé sec'),
          reason: t(
            'Its fresh acidity suits the tomato and olive oil.',
            'Aciditatea lui proaspătă se potrivește cu roșiile și uleiul de măsline.',
          ),
          principle: 'complement_flavour',
          ingredient: 'rose-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Meat-free and easy to serve with bread and a salad.',
            'Fără carne și se servește ușor cu pâine și o salată.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Made ahead, it is just as good at room temperature or cold. Bake it in the cool of the morning.',
            'Făcut din timp, e la fel de bun la temperatura camerei sau rece. Coace-l dimineața, când e răcoare.',
          ),
        },
      ],
    },
    {
      slug: 'roasted-vegetables-spanish',
      cuisine: 'spanish',
      // These are roasted whole, not cut up and spread out on a tray.
      hideBaseTips: [0, 1, 2],
      title: t(
        'Escalivada (Catalan roasted peppers, aubergine and onion)',
        'Escalivada (ardei, vinete și ceapă coapte, ca în Catalonia)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 85,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'bell-pepper',
          quantity: 3,
          unit: 'pcs',
          note: t('red, whole', 'roșii, întregi'),
        },
        {
          ingredient: 'aubergine',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'whole, pricked with a fork',
            'întregi, înțepate cu furculița',
          ),
        },
        {
          ingredient: 'onion',
          quantity: 3,
          unit: 'pcs',
          note: t('whole, in their skins', 'întregi, cu coaja'),
        },
        { ingredient: 'olive-oil', quantity: 50, unit: 'ml' },
        {
          ingredient: 'garlic',
          quantity: 6,
          unit: 'g',
          note: t('one clove, finely chopped', 'un cățel, tocat mărunt'),
        },
        { ingredient: 'flaky-salt', quantity: 4, unit: 'g' },
        {
          ingredient: 'country-bread',
          quantity: 0.5,
          unit: 'pcs',
          note: t('4 thick slices', '4 felii groase'),
        },
        {
          ingredient: 'anchovies',
          quantity: 40,
          unit: 'g',
          optional: true,
        },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Set the oven to 220 °C (200 °C fan).',
            'Setează cuptorul la 220 °C (200 °C cu ventilator).',
          ),
        },
        {
          key: 'prepare',
          text: t(
            'Prick the aubergines in several places with a fork. Rub the peppers, aubergines and onions all over with a third of the oil and put them on a large tray with space between them.',
            'Înțeapă vinetele în mai multe locuri cu o furculiță. Unge ardeii, vinetele și cepele peste tot cu o treime din ulei și pune-le pe o tavă mare, cu spațiu între ele.',
          ),
        },
        {
          key: 'roast-peppers',
          text: t(
            'Roast for 40 minutes, turning everything once halfway, until the peppers are blistered and charred in patches and collapsing. Transfer the peppers to a bowl and cover it with a plate. Leave the rest in the oven.',
            'Coace 40 de minute, întorcând totul o dată la jumătate, până când ardeii sunt umflați, arși pe alocuri și s-au înmuiat. Mută ardeii într-un bol și acoperă-l cu o farfurie. Lasă restul în cuptor.',
          ),
          timerSeconds: 2400,
        },
        {
          key: 'roast-rest',
          text: t(
            'Roast the aubergines and onions for 20 minutes more, until the aubergine skins are wrinkled and charred, the flesh is collapsed and the onions feel soft when squeezed. Move them to the bowl with the peppers and cover again.',
            'Coace vinetele și cepele încă 20 de minute, până când coaja vinetelor e încrețită și arsă, miezul s-a înmuiat, iar ceapa e moale când o strângi. Mută-le în bolul cu ardeii și acoperă din nou.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'steam',
          text: t(
            'Let the vegetables steam under the cover for 15 minutes, until cool enough to handle. This loosens the skins.',
            'Lasă legumele să se aburească sub capac 15 minute, până se răcesc destul cât să le poți ține în mână. Așa se desprind ușor cojile.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'toast',
          text: t(
            'While the vegetables steam, toast the bread slices on a tray in the hot oven for about 5 minutes, turning once, until golden.',
            'Cât se aburesc legumele, prăjește feliile de pâine pe o tavă în cuptorul încă fierbinte, aproximativ 5 minute, întorcându-le o dată, până se aurește.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'peel',
          text: t(
            'Peel the peppers and tear them into wide strips, discarding the stalks and seeds. Peel the aubergines, tear the flesh lengthways into strips and let them drain for a moment in a sieve. Peel the onions and tear them into thick petals.',
            'Curăță ardeii de coajă și rupe-i în fâșii late, fără cozi și semințe. Curăță vinetele, rupe miezul în fâșii pe lungime și lasă-l puțin la scurs într-o strecurătoare. Curăță cepele și rupe-le în petale groase.',
          ),
        },
        {
          key: 'dress',
          text: t(
            'Arrange the vegetables on a platter, scatter with the garlic, drizzle with the remaining oil and sprinkle with the salt. Serve warm or at room temperature on the toasted bread, with the anchovies on top if you like.',
            'Aranjează legumele pe un platou, presară usturoiul, stropește cu uleiul rămas și presară sarea. Servește cald sau la temperatura camerei, pe pâinea prăjită, cu anșoa deasupra dacă vrei.',
          ),
        },
      ],
      tips: [
        t(
          'Keep escalivada covered in the fridge for up to 3 days and bring it to room temperature before serving. Do not store it submerged in oil at room temperature.',
          'Păstrează escalivada acoperită la frigider până la 3 zile și scoate-o la temperatura camerei înainte de servire. Nu o ține scufundată în ulei la temperatura camerei.',
        ),
        t(
          'Dress the vegetables while they are still warm so they take up the oil and the garlic.',
          'Condimentează legumele cât sunt încă calde, ca să absoarbă uleiul și usturoiul.',
        ),
      ],
      stepTips: [
        {
          step: 'steam',
          text: t(
            'Keep the cover on until the vegetables are lukewarm: the steam is what makes the skins slip off.',
            'Ține capacul pus până când legumele sunt căldicele: aburul face cojile să se desprindă ușor.',
          ),
        },
        {
          step: 'peel',
          text: t(
            'Do not rinse the vegetables to help peel them: it washes away the smoky juices. Peel with your fingers over the bowl and spoon the pepper juices over the platter with the oil.',
            'Nu spăla legumele ca să le cureți mai ușor: pierzi sucul cu aromă de fum. Curăță-le cu degetele deasupra bolului și toarnă sucul ardeilor peste legume, odată cu uleiul.',
          ),
        },
      ],
      nutritionNote: t(
        'Mostly vegetables, with plenty of fibre and olive oil that is mostly unsaturated fat. The anchovies and the bread add salt, and the oil makes the dish richer than it looks. With bread it is more filling; on its own it has little protein.',
        'În mare parte legume, cu multe fibre și ulei de măsline, bogat în grăsimi nesaturate. Anșoa și pâinea adaugă sare, iar uleiul face preparatul mai bogat decât pare. Cu pâine e mai săturător; singur are puține proteine.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Spanish appetizer platter', 'Platou de aperitive spaniol'),
          reason: t(
            'It fits among small plates and shares the table with them.',
            'Se potrivește printre farfuriile mici și stă la aceeași masă cu ele.',
          ),
          principle: 'regional_tradition',
          recipe: 'appetizer-platter-spanish',
        },
        {
          kind: 'food',
          label: t('Goat cheese', 'Brânză de capră'),
          reason: t(
            'Its creamy tang sits well against the smoky, sweet vegetables.',
            'Aroma ei cremoasă și acrișoară se potrivește cu legumele afumate și dulci.',
          ),
          principle: 'complement_flavour',
          ingredient: 'goat-cheese',
        },
        {
          kind: 'drink',
          label: t('Dry rosé', 'Rosé sec'),
          reason: t(
            'A chilled glass refreshes the palate between smoky, salty bites.',
            'Un pahar rece împrospătează gustul între îmbucăturile afumate și sărate.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'rose-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Served at room temperature, so roast it in the morning and eat it later without reheating.',
            'Se servește la temperatura camerei, așa că o poți coace dimineața și mânca mai târziu, fără să o reîncălzești.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Light and fresh on toast, easy to make ahead.',
            'Ușoară și proaspătă pe pâine prăjită, ușor de pregătit din timp.',
          ),
        },
      ],
    },
    {
      slug: 'roasted-vegetables-air-fried',
      method: 'air-fried',
      // The room and trays tips name trays and the storage tip names the oven.
      hideBaseTips: [0, 1, 2],
      title: t('Air-fried vegetables', 'Legume la air fryer'),
      servings: 2,
      prepMinutes: 15,
      cookMinutes: 37,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'carrot',
          quantity: 150,
          unit: 'g',
          note: t(
            'peeled, cut into 2 cm chunks',
            'curățați, tăiați în bucăți de 2 cm',
          ),
        },
        {
          ingredient: 'parsnip',
          quantity: 100,
          unit: 'g',
          note: t(
            'peeled, cut into 2 cm chunks',
            'curățat, tăiat în bucăți de 2 cm',
          ),
        },
        {
          ingredient: 'sweet-potato',
          quantity: 200,
          unit: 'g',
          note: t(
            'scrubbed, cut into 2 cm chunks',
            'spălați, tăiați în bucăți de 2 cm',
          ),
        },
        {
          ingredient: 'red-onion',
          quantity: 1,
          unit: 'pcs',
          note: t('cut into wedges', 'tăiată în opt'),
        },
        {
          ingredient: 'bell-pepper',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'seeded, cut into 3 cm pieces',
            'fără semințe, tăiat în bucăți de 3 cm',
          ),
        },
        {
          ingredient: 'zucchini',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'cut into 2 cm thick half-moons',
            'tăiat în semirondele groase de 2 cm',
          ),
        },
        {
          ingredient: 'garlic',
          quantity: 15,
          unit: 'g',
          note: t(
            'half a head, cloves left unpeeled',
            'jumătate de cap, cu cățeii nedecojiți',
          ),
        },
        { ingredient: 'olive-oil', quantity: 30, unit: 'ml' },
        {
          ingredient: 'thyme',
          quantity: 3,
          unit: 'g',
          note: t('leaves picked', 'doar frunzele'),
        },
        {
          ingredient: 'rosemary',
          quantity: 2,
          unit: 'g',
          note: t('leaves finely chopped', 'frunzele tocate mărunt'),
        },
        { ingredient: 'salt', quantity: 4, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 0.5, unit: 'g' },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the air fryer to 190 °C for 3 minutes while you prepare the vegetables.',
            'Încălzește friteuza cu aer cald la 190 °C, 3 minute, cât pregătești legumele.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'cut',
          text: t(
            'Cut the carrots, parsnip and sweet potato into 2 cm chunks, and the onion, pepper and courgette into 3 cm pieces. Keep the roots apart from the rest, and pat all of them dry.',
            'Taie morcovii, păstârnacul și cartoful dulce în bucăți de 2 cm, iar ceapa, ardeiul și dovlecelul în bucăți de 3 cm. Ține rădăcinoasele separat de restul și șterge-le pe toate.',
          ),
        },
        {
          key: 'season',
          text: t(
            'Toss the roots and the garlic cloves with half of the oil, half of the salt, the pepper and half of the herbs. In a second bowl, toss the onion, pepper and courgette with the remaining oil, salt and herbs.',
            'Amestecă rădăcinoasele și cățeii de usturoi cu jumătate din ulei, jumătate din sare, piperul și jumătate din ierburi. Într-un al doilea bol, amestecă ceapa, ardeiul și dovlecelul cu uleiul, sarea și ierburile rămase.',
          ),
        },
        {
          key: 'roots-first',
          text: t(
            'Tip the roots and the garlic into the basket in a loose layer, no more than half full, and cook for 10 minutes.',
            'Pune rădăcinoasele și usturoiul în coș, într-un strat afânat, cel mult pe jumătate plin, și gătește 10 minute.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'roots-shake',
          text: t(
            'Shake the basket well and cook for 10 minutes more, until the edges are browned and a knife slips into the sweet potato. Tip the roots into a bowl.',
            'Scutură bine coșul și gătește încă 10 minute, până când marginile sunt rumene, iar cuțitul intră ușor în cartoful dulce. Răstoarnă rădăcinoasele într-un bol.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'soft-first',
          text: t(
            'Put the onion, pepper and courgette into the basket and cook for 6 minutes.',
            'Pune ceapa, ardeiul și dovlecelul în coș și gătește 6 minute.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'soft-shake',
          text: t(
            'Shake the basket and cook for 6 minutes more, until the edges are browned and the pieces are tender.',
            'Scutură coșul și gătește încă 6 minute, până când marginile sunt rumene, iar bucățile sunt fragede.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'reheat',
          text: t(
            'Tip the roots back on top and cook for 2 minutes to bring everything back to a serving heat. Squeeze the soft garlic cloves out of their skins over the vegetables and serve hot.',
            'Pune rădăcinoasele înapoi deasupra și gătește 2 minute, ca totul să fie din nou fierbinte. Scoate din coajă dinții de usturoi moi, strivește-i peste legume și servește fierbinte.',
          ),
          timerSeconds: 120,
        },
      ],
      tips: [
        t(
          'A crowded basket steams the vegetables instead of crisping them, so keep it no more than half full and cook in batches.',
          'Un coș înghesuit aburește legumele în loc să le facă crocante, așa că umple-l cel mult pe jumătate și gătește în tranșe.',
        ),
        t(
          'Cool leftovers within two hours and keep them covered in the fridge for up to 3 days. Re-crisp them in the air fryer at 180 °C for 3 to 4 minutes.',
          'Lasă resturile să se răcească în maximum două ore și păstrează-le acoperite la frigider până la 3 zile. Rumenește-le din nou în friteuza cu aer cald, la 180 °C, 3-4 minute.',
        ),
      ],
      stepTips: [
        {
          step: 'season',
          text: t(
            'Toss the herbs in the oil with the vegetables so they cling. Loose rosemary needles can scorch in the moving air.',
            'Amestecă ierburile cu uleiul și legumele, ca să se prindă de ele. Frunzele de rozmarin libere se pot arde în aerul care circulă.',
          ),
        },
      ],
      nutritionNote: t(
        'Vegetables give fibre, and a modest amount of olive oil, mostly unsaturated fat, is enough for crisp edges. The sweet potato and carrots add natural sugars that caramelise, and salt can still add up. It is light on protein, so serve it with some.',
        'Legumele aduc fibre, iar o cantitate mică de ulei de măsline, bogat în grăsimi nesaturate, e de ajuns pentru margini crocante. Cartofii dulci și morcovii aduc zaharuri naturale care se caramelizează, iar sarea se poate aduna totuși. Conține puține proteine, așa că servește-le cu o sursă de proteine.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Hummus', 'Humus'),
          reason: t(
            'A cool, creamy dip against the crisp edges.',
            'O cremă rece, bună pentru muiat, lângă marginile crocante.',
          ),
          principle: 'contrast_texture',
          ingredient: 'hummus',
        },
        {
          kind: 'food',
          label: t('Lemon', 'Lămâie'),
          reason: t(
            'A squeeze of juice cuts the oil and the sweetness of the roots.',
            'Câteva picături de suc taie uleiul și dulceața rădăcinoaselor.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'lemon',
        },
        {
          kind: 'drink',
          label: t('Sparkling water', 'Apă minerală'),
          reason: t(
            'Bubbles refresh the palate between caramelised bites.',
            'Bulele împrospătează gustul între îmbucăturile caramelizate.',
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
            'Quick for one or two, and filling with a dip or some bread.',
            'Se face repede pentru una sau două persoane și e săturătoare cu un dip sau puțină pâine.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'The air fryer does not heat the kitchen the way a full oven does.',
            'Friteuza cu aer cald nu încălzește bucătăria cum o face un cuptor întreg.',
          ),
        },
      ],
    },
  ],
};
