import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Pad thai base is the Thai wok noodle dish with shrimp and tofu. Each
// Variant is a full Recipe of another stir-fried noodle dish (a Cantonese beef
// chow fun and a Japanese yaki udon); the base's Recipe-level Tips are inherited
// unless a Variant hides them.
export const padThai: BaseRecipeSeed = {
  slug: 'pad-thai',
  title: t('Pad thai with shrimp and tofu', 'Pad thai cu creveți și tofu'),
  servings: 2,
  prepMinutes: 40,
  cookMinutes: 11,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'rice-noodles',
      quantity: 150,
      unit: 'g',
      note: t('dried, flat, 3 to 5 mm wide', 'uscați, plați, late de 3-5 mm'),
    },
    {
      ingredient: 'tamarind-paste',
      quantity: 25,
      unit: 'g',
      note: t(
        'Thai-style tamarind purée; if you use thick dark concentrate, start with half',
        'pastă de tamarind în stil thailandez; dacă folosești concentrat des și închis la culoare, începe cu jumătate',
      ),
    },
    { ingredient: 'fish-sauce', quantity: 30, unit: 'ml' },
    {
      ingredient: 'palm-sugar',
      quantity: 25,
      unit: 'g',
      note: t('chopped or shaved', 'tocat sau răzuit'),
    },
    { ingredient: 'sunflower-oil', quantity: 45, unit: 'ml' },
    {
      ingredient: 'shallot',
      quantity: 40,
      unit: 'g',
      note: t('thinly sliced', 'tăiată felii subțiri'),
    },
    {
      ingredient: 'garlic',
      quantity: 12,
      unit: 'g',
      note: t('finely chopped', 'tocat mărunt'),
    },
    {
      ingredient: 'tofu',
      quantity: 100,
      unit: 'g',
      note: t(
        'firm or pressed, in 1.5 cm cubes',
        'ferm sau presat, tăiat cuburi de 1,5 cm',
      ),
    },
    {
      ingredient: 'preserved-radish',
      quantity: 20,
      unit: 'g',
      optional: true,
      note: t('finely chopped', 'tocată mărunt'),
    },
    {
      ingredient: 'dried-shrimp',
      quantity: 10,
      unit: 'g',
      note: t('roughly chopped', 'tocați grosier'),
    },
    {
      ingredient: 'shrimp',
      quantity: 150,
      unit: 'g',
      note: t('raw, peeled and deveined', 'crude, curățate și fără intestin'),
    },
    { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
    {
      ingredient: 'still-water',
      quantity: 0.06,
      unit: 'l',
      note: t('a splash for the wok', 'un strop pentru wok'),
    },
    {
      ingredient: 'bean-sprouts',
      quantity: 70,
      unit: 'g',
      note: t('for the wok', 'pentru wok'),
    },
    {
      ingredient: 'bean-sprouts',
      key: 'bean-sprouts-side',
      quantity: 30,
      unit: 'g',
      optional: true,
      note: t(
        'raw, for the side (see the tip)',
        'crud, pentru servit alături (vezi sfatul)',
      ),
    },
    {
      ingredient: 'garlic-chives',
      quantity: 30,
      unit: 'g',
      note: t('cut into 4 cm pieces', 'tăiat în bucăți de 4 cm'),
    },
    {
      ingredient: 'peanuts',
      quantity: 30,
      unit: 'g',
      note: t('unsalted', 'nesărate'),
    },
    {
      ingredient: 'lime',
      quantity: 1,
      unit: 'pcs',
      note: t('cut into wedges', 'tăiată felii'),
    },
    { ingredient: 'chilli-flakes', quantity: 2, unit: 'g' },
  ],
  steps: [
    {
      key: 'soak',
      text: t(
        'Put the dried noodles in a large bowl, cover with lukewarm tap water and leave them for about 30 minutes, until they bend easily but still have a firm core. Do not use hot water: they would go soft before the wok.',
        'Pune tăițeii uscați într-un bol mare, acoperă-i cu apă călduță de la robinet și lasă-i aproximativ 30 de minute, până se îndoaie ușor, dar au încă un miez ferm. Nu folosi apă fierbinte: s-ar înmuia prea tare înainte de wok.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'sauce',
      text: t(
        'While the noodles soak, warm the tamarind paste, fish sauce and palm sugar in a small pan over low heat for about 2 minutes, stirring, until the sugar has dissolved. Taste it: it should be sour, salty and sweet in turn, and punchy. Set aside.',
        'Cât timp se înmoaie tăițeii, încălzește pasta de tamarind, sosul de pește și zahărul de palmier într-o cratiță mică la foc mic, aproximativ 2 minute, amestecând, până se dizolvă zahărul. Gustă: trebuie să fie pe rând acru, sărat și dulce, și puternic. Dă deoparte.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'peanuts',
      text: t(
        'Still while the noodles soak, dry-roast the peanuts in a pan over medium heat for about 3 minutes, shaking the pan, until golden and fragrant. Tip them onto a board, let them cool for a moment and crush them coarsely.',
        'Tot cât timp se înmoaie tăițeii, prăjește arahidele într-o tigaie uscată la foc mediu aproximativ 3 minute, scuturând tigaia, până se rumenesc și miros frumos. Pune-le pe un tocător, lasă-le să se răcească puțin și sfărâmă-le grosier.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'prep',
      text: t(
        'Do all the prep now, because the wok goes fast and you cannot chop once it is hot. Drain the noodles. Slice the shallot, chop the garlic, dried shrimp and radish, cube the tofu and pat it dry, cut the chives and the lime, and rinse the sprouts. Crack the eggs into a bowl. Pat the raw shrimp dry last, then wash your hands, the board and the knife. Line everything up beside the stove in the order it goes in.',
        'Pregătește acum tot, pentru că wokul merge repede și nu mai ai timp să tai după ce s-a încins. Scurge tăițeii. Taie șalota, toacă usturoiul, creveții uscați și ridichea, taie tofu cuburi și șterge-l, taie arpagicul chinezesc și lime și spală germenii. Sparge ouăle într-un bol. Șterge creveții cruzi cu un prosop de hârtie la sfârșit, apoi spală-ți mâinile, tocătorul și cuțitul. Așază tot lângă aragaz, în ordinea în care intră în wok.',
      ),
    },
    {
      key: 'heat',
      text: t(
        'Heat a wok over high heat until it just starts to smoke, then add 2 tablespoons (30 ml) of the oil and swirl it up the sides.',
        'Încinge un wok la foc mare până începe să scoată un fum subțire, apoi adaugă 2 linguri (30 ml) din ulei și învârte-l pe pereți.',
      ),
    },
    {
      key: 'tofu',
      text: t(
        'Add the tofu and fry for about 2 minutes, turning it now and then, until golden at the edges.',
        'Adaugă tofu și prăjește-l aproximativ 2 minute, întorcându-l din când în când, până se rumenește pe margini.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'aromatics',
      text: t(
        'Add the shallot, garlic, dried shrimp and radish and stir for about 30 seconds, until fragrant and the shallot is just turning translucent.',
        'Adaugă șalota, usturoiul, creveții uscați și ridichea și amestecă aproximativ 30 de secunde, până miroase frumos și șalota abia devine translucidă.',
      ),
      timerSeconds: 30,
    },
    {
      key: 'shrimp',
      text: t(
        'Add the raw shrimp and toss for about 90 seconds, until they are pink and opaque all through and have curled into a loose C. A tight, rubbery ring means they are overcooked. Lift them out onto a clean plate, not the one the raw shrimp sat on, and wash your hands again.',
        'Adaugă creveții cruzi și amestecă aproximativ 90 de secunde, până sunt roz și opaci în tot interiorul și s-au curbat într-un C larg. Un inel strâns și cauciucat înseamnă că sunt prea gătiți. Scoate-i pe o farfurie curată, nu pe cea pe care au stat creveții cruzi, și spală-ți din nou mâinile.',
      ),
      timerSeconds: 90,
    },
    {
      key: 'eggs',
      text: t(
        'Push the tofu and aromatics to one side, add the remaining oil to the empty side, pour in the eggs and scramble them for about 30 seconds, breaking them into small pieces, until set with no liquid egg left.',
        'Împinge tofu și condimentele într-o parte, pune uleiul rămas în partea goală, toarnă ouăle și amestecă-le aproximativ 30 de secunde, rupându-le în bucăți mici, până se încheagă complet, fără ou lichid.',
      ),
      timerSeconds: 30,
    },
    {
      key: 'noodles',
      text: t(
        'Add the noodles, the sauce and the water. Toss and fold for about 2 minutes, until the noodles are soft but still chewy and the sauce has been absorbed. Bite one: if the centre is still hard, add another splash of water and toss a little longer.',
        'Adaugă tăițeii, sosul și apa. Amestecă și întoarce aproximativ 2 minute, până tăițeii sunt moi, dar încă elastici, iar sosul a fost absorbit. Gustă unul: dacă miezul e încă tare, adaugă încă un strop de apă și amestecă puțin mai mult.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'finish',
      text: t(
        'Return the shrimp with their juices, add the 70 g of sprouts and the chives and toss for 30 seconds, until the chives wilt, the sprouts are hot but still crisp and the shrimp are hot through. Take the wok off the heat.',
        'Pune la loc creveții cu sucul lor, adaugă cele 70 g de germeni și arpagicul chinezesc și amestecă 30 de secunde, până se ofilește arpagicul, germenii sunt fierbinți, dar încă crocanți, iar creveții sunt fierbinți în tot interiorul. Ia wokul de pe foc.',
      ),
      timerSeconds: 30,
    },
    {
      key: 'serve',
      text: t(
        'Serve straight away on clean plates, with the crushed peanuts, lime wedges and chilli flakes on top or beside. Add the raw sprouts, only if sold as ready to eat, just for healthy adults, not for children, older people or anyone pregnant or with a weak immune system.',
        'Servește imediat pe farfurii curate, cu arahidele sfărâmate, felii de lime și fulgi de chili deasupra sau alături. Adaugă germenii cruzi, doar dacă sunt vânduți ca gata de consum, numai pentru adulți sănătoși, nu pentru copii, vârstnici, gravide sau persoane cu imunitate scăzută.',
      ),
    },
  ],
  tips: [
    t(
      'Cook one load of two portions at a time. A crowded wok loses heat and steams the noodles into a clump; for four, make two batches.',
      'Gătește câte o porție dublă odată. Un wok aglomerat pierde căldura și fierbe tăițeii în abur, lipindu-i într-un ghem; pentru patru persoane, gătește în două serii.',
    ),
    t(
      'Soak the noodles only until they bend but still have a firm core: they finish cooking in the wok, and noodles soaked soft turn to mush.',
      'Înmoaie tăițeii doar până se îndoaie, dar au încă un miez ferm: își termină gătirea în wok, iar cei înmuiați prea tare se fac păsat.',
    ),
    t(
      'Cooked rice noodles left out can grow Bacillus cereus, and reheating does not remove its toxin. Chill leftovers within 2 hours, keep them in the fridge and eat them within 1 day, and reheat them only once, until steaming hot.',
      'Tăițeii de orez gătiți lăsați la temperatura camerei pot dezvolta Bacillus cereus, iar încălzirea nu îi distruge toxina. Pune resturile la frigider în maximum 2 ore, consumă-le în 1 zi și reîncălzește-le o singură dată, până scot abur.',
    ),
  ],
  stepTips: [
    {
      step: 'sauce',
      text: t(
        'Make the sauce stronger than seems right on its own: the noodles will dilute it. If it is too sharp, add a spoon of water rather than more sugar.',
        'Fă sosul mai tare decât ți se pare potrivit: tăițeii îl diluează. Dacă e prea ascuțit, adaugă o lingură de apă, nu mai mult zahăr.',
      ),
    },
    {
      step: 'finish',
      text: t(
        'Sprouts stay in the wok only briefly, so for children, older people or anyone pregnant or with a weak immune system toss them for a full minute until steaming, or leave them out.',
        'Germenii stau în wok foarte puțin, așa că pentru copii, vârstnici, gravide sau persoane cu imunitate scăzută amestecă-i un minut întreg, până scot abur, sau omite-i.',
      ),
    },
    {
      step: 'shrimp',
      text: t(
        'Raw shrimp should be pink and opaque right through; cut the thickest one open to check. They are done at 63 °C in the centre, and they keep cooking a little in the noodles.',
        'Creveții cruzi trebuie să fie roz și opaci până în centru; taie-l pe cel mai gros ca să verifici. Sunt gata la 63 °C în centru și se mai gătesc puțin în tăiței.',
      ),
    },
  ],
  nutritionNote: t(
    'Shrimp, egg and tofu bring a good amount of protein, and the peanuts add mostly unsaturated fat. But the dish is mostly refined rice noodles with few vegetables, the fish sauce and dried shrimp make it salty, the palm sugar adds sugar, and the oil and peanuts make it energy-dense. Add more vegetables on the side.',
    'Creveții, ouăle și tofu aduc multe proteine, iar arahidele adaugă în mare parte grăsimi nesaturate. Dar preparatul e făcut mai ales din tăiței de orez rafinați, cu puține legume, sosul de pește și creveții uscați îl fac sărat, zahărul de palmier adaugă zahăr, iar uleiul și arahidele îl fac bogat în calorii. Adaugă mai multe legume alături.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Sliced cucumber', 'Castravete tăiat felii'),
      reason: t(
        'Cool, watery crunch next to the sweet, sour and salty noodles.',
        'Un crocant rece și apos lângă tăițeii dulci, acri și sărați.',
      ),
      principle: 'contrast_texture',
      ingredient: 'cucumber',
    },
    {
      kind: 'drink',
      label: t('Cold beer', 'Bere rece'),
      reason: t(
        'Its bubbles and cold bitterness refresh the palate between salty, rich bites and chilli heat.',
        'Bulele și amăreala rece împrospătează gura între îmbucăturile sărate, bogate, și iuțeala ardeiului.',
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
        'A single plate with carbohydrates and protein, ready in minutes once the prep is done.',
        'O singură farfurie cu carbohidrați și proteine, gata în câteva minute după ce ai pregătit ingredientele.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Noodles refill carbohydrate stores and the shrimp, egg and tofu supply protein.',
        'Tăițeii refac rezervele de carbohidrați, iar creveții, ouăle și tofu aduc proteine.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Salty, oily and heavy; it is better earlier in the evening than just before bed.',
        'Sărat, uleios și greu; e mai bine mai devreme seara decât chiar înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'pad-thai-chinese',
      cuisine: 'chinese',
      title: t(
        'Beef chow fun (Cantonese stir-fried wide rice noodles with beef)',
        'Beef chow fun (tăiței late de orez sotați cu vită, ca în Canton)',
      ),
      servings: 2,
      prepMinutes: 30,
      cookMinutes: 12,
      difficulty: 'medium',
      hideBaseTips: [1],
      lines: [
        {
          ingredient: 'ho-fun',
          quantity: 300,
          unit: 'g',
          note: t('fresh, separated by hand', 'proaspeți, desfăcuți cu mâna'),
        },
        {
          ingredient: 'beef-steak',
          quantity: 200,
          unit: 'g',
          note: t(
            'flank or sirloin, sliced 3 mm thin across the grain',
            'fleică sau contrafileu, tăiat felii de 3 mm, de-a curmezișul fibrelor',
          ),
        },
        {
          ingredient: 'soy-sauce',
          key: 'soy-sauce-marinade',
          quantity: 15,
          unit: 'ml',
          note: t('for the beef', 'pentru vită'),
        },
        { ingredient: 'corn-starch', quantity: 5, unit: 'g' },
        {
          ingredient: 'baking-soda',
          quantity: 1,
          unit: 'g',
          optional: true,
        },
        {
          ingredient: 'soy-sauce',
          quantity: 15,
          unit: 'ml',
          note: t('for the sauce', 'pentru sos'),
        },
        { ingredient: 'dark-soy-sauce', quantity: 15, unit: 'ml' },
        { ingredient: 'shaoxing-wine', quantity: 15, unit: 'ml' },
        { ingredient: 'sugar', quantity: 5, unit: 'g' },
        { ingredient: 'sunflower-oil', quantity: 60, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('medium, in thin wedges', 'medie, tăiată în felii subțiri'),
        },
        {
          ingredient: 'ginger',
          quantity: 10,
          unit: 'g',
          note: t('in thin slices', 'tăiat felii subțiri'),
        },
        { ingredient: 'bean-sprouts', quantity: 100, unit: 'g' },
        {
          ingredient: 'spring-onion',
          quantity: 40,
          unit: 'g',
          note: t('cut into 4 cm pieces', 'tăiată în bucăți de 4 cm'),
        },
        { ingredient: 'sesame-oil', quantity: 5, unit: 'ml' },
        {
          ingredient: 'white-pepper',
          quantity: 0.5,
          unit: 'g',
          optional: true,
        },
      ],
      steps: [
        {
          key: 'marinate',
          text: t(
            'Slice the beef 3 mm thin across the grain. Mix the slices with the marinade soy sauce, the corn starch and the baking soda, if using, and leave in the fridge for 20 minutes. Wash your hands, the board and the knife after handling the raw beef.',
            'Taie vita felii de 3 mm, de-a curmezișul fibrelor. Amestecă feliile cu sosul de soia pentru marinadă, amidonul de porumb și bicarbonatul, dacă îl folosești, și lasă-le la frigider 20 de minute. Spală-ți mâinile, tocătorul și cuțitul după ce ai atins carnea crudă.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'prep',
          text: t(
            'While the beef marinates, do all the prep, because the wok cannot wait. Gently pull the noodles apart into single strands; if they are stiff from the fridge, warm them in the microwave for 20 to 30 seconds first. Do not soak them. Stir the sauce soy sauce, dark soy sauce, Shaoxing wine and sugar together in a small bowl. Slice the onion and ginger, cut the spring onion and rinse the sprouts. Set everything beside the stove.',
            'În timp ce vita stă în marinadă, pregătește tot, pentru că wokul nu așteaptă. Desprinde ușor tăițeii în fire separate; dacă sunt rigizi de la frigider, încălzește-i mai întâi la microunde 20-30 de secunde. Nu îi înmuia. Amestecă într-un bol mic sosul de soia pentru sos, sosul de soia închis, vinul Shaoxing și zahărul. Taie ceapa și ghimbirul, taie ceapa verde și spală germenii. Pune tot lângă aragaz.',
          ),
        },
        {
          key: 'sear-beef',
          text: t(
            'Heat the wok over high heat until it smokes lightly, add 1 tablespoon (15 ml) of the oil and spread half the beef in one layer. Sear for about 40 seconds a side, until browned outside and no pink remains in the centre of the thin slices. Lift out onto a clean plate, not the one that held the raw beef. Repeat with the second half, with no more oil, then wash your hands.',
            'Încinge wokul la foc mare până scoate un fum ușor, adaugă 1 lingură (15 ml) din ulei și întinde jumătate din vită într-un singur strat. Rumenește-o aproximativ 40 de secunde pe fiecare parte, până se rumenește pe exterior și nu mai rămâne roz în centrul felioarelor subțiri. Scoate-o pe o farfurie curată, nu pe cea în care a stat carnea crudă. Repetă cu a doua jumătate, fără ulei în plus, apoi spală-ți mâinile.',
          ),
          timerSeconds: 80,
        },
        {
          key: 'aromatics',
          text: t(
            'Wipe out the wok if anything has scorched. Add another tablespoon (15 ml) of oil and stir-fry the onion and ginger for about 1 minute, until the onion edges soften and the ginger smells sharp.',
            'Șterge wokul dacă s-a ars ceva. Adaugă încă o lingură (15 ml) de ulei și călește ceapa și ghimbirul aproximativ 1 minut, până se înmoaie marginile cepei și ghimbirul miroase intens.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'char-noodles',
          text: t(
            'Push the onion aside, add the remaining 2 tablespoons (30 ml) of oil, and spread the noodles in a layer. Leave them for 45 seconds without stirring, until the underside is lightly charred, then turn them in sections and leave another 45 seconds.',
            'Împinge ceapa într-o parte, adaugă cele 2 linguri (30 ml) de ulei rămase și întinde tăițeii într-un strat. Lasă-i 45 de secunde fără să amesteci, până se rumenește ușor partea de jos, apoi întoarce-i pe porțiuni și lasă-i încă 45 de secunde.',
          ),
          timerSeconds: 90,
        },
        {
          key: 'sauce',
          text: t(
            'Pour the sauce around the edge of the wok, where it sizzles, and fold gently for about 1 minute, until the noodles are evenly brown and glossy. Fresh wide noodles tear easily, so fold rather than stir.',
            'Toarnă sosul pe marginea wokului, unde sfârâie, și întoarce ușor aproximativ 1 minut, până tăițeii sunt uniform bruni și lucioși. Tăițeii proaspeți și lați se rup ușor, așa că întoarce-i, nu îi amesteca.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'finish',
          text: t(
            'Return the beef and its juices, add the bean sprouts and spring onion, and toss for 30 seconds, until the sprouts have just wilted and everything is piping hot. Off the heat, stir in the sesame oil and the white pepper, if using. Serve straight away.',
            'Pune la loc vita cu sucul ei, adaugă germenii și ceapa verde și amestecă 30 de secunde, până se ofilesc ușor germenii și totul e fierbinte. Ia de pe foc, adaugă uleiul de susan și piperul alb, dacă îl folosești. Servește imediat.',
          ),
          timerSeconds: 30,
        },
      ],
      tips: [
        t(
          'Do not stir the noodles constantly: the smoky, charred edge comes from letting them sit on the hot wok. A wok that is not hot enough gives pale, steamed noodles.',
          'Nu amesteca tăițeii mereu: aroma afumată și marginile rumenite apar când îi lași să stea pe wokul încins. Un wok prea puțin încins dă tăiței palizi, fierți în abur.',
        ),
      ],
      stepTips: [
        {
          step: 'marinate',
          text: t(
            'Freeze the steak for 20 minutes before slicing: firm meat is easy to cut thin, and thin slices cook through in seconds.',
            'Ține friptura 20 de minute la congelator înainte să o tai: carnea fermă se taie ușor subțire, iar felioarele subțiri se gătesc în câteva secunde.',
          ),
        },
        {
          step: 'finish',
          text: t(
            'Sprouts stay in the wok only briefly, so for children, older people or anyone pregnant or with a weak immune system toss them for a full minute until steaming, or leave them out.',
            'Germenii stau în wok foarte puțin, așa că pentru copii, vârstnici, gravide sau persoane cu imunitate scăzută amestecă-i un minut întreg, până scot abur, sau omite-i.',
          ),
        },
      ],
      nutritionNote: t(
        'Beef brings protein and iron, and the sprouts and spring onion add a little freshness. The noodles are refined rice, the soy sauces make it salty, and the oil used to char the noodles adds a good amount of fat; the beef adds some saturated fat too.',
        'Vita aduce proteine și fier, iar germenii și ceapa verde adaugă puțină prospețime. Tăițeii sunt din orez rafinat, sosurile de soia îl fac sărat, iar uleiul folosit pentru rumenirea tăițeilor adaugă multă grăsime; vita adaugă și ea ceva grăsimi saturate.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Hot green tea', 'Ceai verde fierbinte'),
          reason: t(
            'Its light bitterness cuts through the oil and the savoury beef.',
            'Amăreala lui ușoară taie din ulei și din gustul de vită sărat.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'green-tea',
        },
        {
          kind: 'food',
          label: t('Sliced cucumber', 'Castravete tăiat felii'),
          reason: t(
            'Cool, crisp slices give relief next to the smoky, charred noodles.',
            'Feliile reci și crocante aduc un răgaz lângă tăițeii afumați și rumeniți.',
          ),
          principle: 'contrast_texture',
          ingredient: 'cucumber',
        },
      ],
      eatingMoments: [
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Rice noodles for carbohydrates and beef for protein and iron.',
            'Tăițeii de orez dau carbohidrați, iar vita proteine și fier.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Oily and salty; heavy just before bed.',
            'Uleios și sărat; greu chiar înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'pad-thai-japanese',
      cuisine: 'japanese',
      title: t(
        'Yaki udon (Japanese stir-fried udon with pork and cabbage)',
        'Yaki udon (tăiței udon sotați cu porc și varză, ca în Japonia)',
      ),
      servings: 2,
      prepMinutes: 15,
      cookMinutes: 15,
      difficulty: 'easy',
      hideBaseTips: [1, 2],
      lines: [
        {
          ingredient: 'udon',
          quantity: 400,
          unit: 'g',
          note: t('frozen', 'congelați'),
        },
        {
          ingredient: 'pork-belly',
          quantity: 150,
          unit: 'g',
          note: t(
            'in thin slices, cut into 3 cm pieces',
            'în felii subțiri, tăiate în bucăți de 3 cm',
          ),
        },
        { ingredient: 'sunflower-oil', quantity: 15, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('medium, in thin wedges', 'medie, tăiată în felii subțiri'),
        },
        {
          ingredient: 'carrot',
          quantity: 80,
          unit: 'g',
          note: t('in thin matchsticks', 'tăiați bețișoare subțiri'),
        },
        {
          ingredient: 'cabbage',
          quantity: 200,
          unit: 'g',
          note: t('in 3 cm squares', 'tăiată în pătrate de 3 cm'),
        },
        {
          ingredient: 'shiitake',
          quantity: 60,
          unit: 'g',
          optional: true,
          note: t('sliced', 'tăiate felii'),
        },
        { ingredient: 'soy-sauce', quantity: 30, unit: 'ml' },
        { ingredient: 'mirin', quantity: 15, unit: 'ml' },
        { ingredient: 'oyster-sauce', quantity: 15, unit: 'ml' },
        {
          ingredient: 'spring-onion',
          quantity: 20,
          unit: 'g',
          note: t('cut into 3 cm pieces', 'tăiată în bucăți de 3 cm'),
        },
        { ingredient: 'bonito-flakes', quantity: 4, unit: 'g' },
      ],
      steps: [
        {
          key: 'water',
          text: t(
            'Put a large pot of water on to boil; it takes about 8 minutes, so start it before you chop.',
            'Pune o oală mare cu apă la fiert; durează aproximativ 8 minute, așa că începe înainte să tai.',
          ),
        },
        {
          key: 'prep',
          text: t(
            'While the water heats, stir the soy sauce, mirin and oyster sauce together in a small bowl. Slice the onion, carrot, cabbage, shiitake, if using, and spring onion. Cut the pork belly last, then wash your hands, the board and the knife. Set everything beside the stove.',
            'În timp ce se încălzește apa, amestecă într-un bol mic sosul de soia, mirinul și sosul de stridii. Taie ceapa, morcovul, varza, ciupercile shiitake, dacă le folosești, și ceapa verde. Taie carnea de porc la urmă, apoi spală-ți mâinile, tocătorul și cuțitul. Pune tot lângă aragaz.',
          ),
        },
        {
          key: 'pork',
          text: t(
            'Heat the oil in a wok or large frying pan over medium-high heat. Add the pork and fry for about 4 minutes, until the fat has rendered, the edges are golden and the slices are opaque and firm all through, with no translucent raw patches. Thin slices like this are cooked. Wash your hands after adding the pork.',
            'Încinge uleiul într-un wok sau într-o tigaie mare la foc mediu-mare. Adaugă carnea de porc și prăjește-o aproximativ 4 minute, până se topește grăsimea, marginile se rumenesc, iar feliile sunt opace și ferme în tot interiorul, fără zone translucide crude. Felii subțiri care arată așa sunt gătite. Spală-ți mâinile după ce ai pus carnea.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'vegetables',
          text: t(
            'Add the onion, carrot and shiitake, if using, and stir-fry for 2 minutes, until the onion softens at the edges. Add the cabbage and cook for 2 minutes more, until wilted at the edges but still crunchy at the centre.',
            'Adaugă ceapa, morcovul și shiitake, dacă le folosești, și călește 2 minute, până se înmoaie ceapa pe margini. Adaugă varza și gătește încă 2 minute, până se ofilește pe margini, dar rămâne crocantă în centru.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'loosen',
          text: t(
            'Take the wok off the heat. Drop the frozen udon into the boiling water for 1 minute, separating the blocks with chopsticks, until the strands come apart. Drain well and put the wok back on the heat.',
            'Ia wokul de pe foc. Pune tăițeii udon congelați în apa clocotită pentru 1 minut, desfăcând blocurile cu bețișoare, până se despart firele. Scurge-i bine și pune wokul la loc pe foc.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'toss',
          text: t(
            'Add the udon and pour the sauce over. Toss for about 2 minutes, until the noodles are hot and evenly coated and the sauce has almost disappeared. Stir in the spring onion at the end.',
            'Adaugă tăițeii udon și toarnă sosul peste ei. Amestecă aproximativ 2 minute, până tăițeii sunt fierbinți și acoperiți uniform, iar sosul aproape a dispărut. Adaugă ceapa verde la sfârșit.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'serve',
          text: t(
            'Divide between two plates and scatter the bonito flakes on top; they curl in the heat. Serve straight away.',
            'Împarte în două farfurii și presară fulgii de bonito deasupra; se încrețesc în căldură. Servește imediat.',
          ),
        },
      ],
      tips: [
        t(
          'Cooked noodles and pork left out can grow bacteria such as Bacillus cereus. Chill leftovers within 2 hours, keep them in the fridge for 1 to 2 days at most, and reheat until steaming hot.',
          'Udonul și carnea gătite, lăsate la temperatura camerei, pot dezvolta bacterii precum Bacillus cereus. Pune resturile la frigider în maximum 2 ore, păstrează-le cel mult 1-2 zile și reîncălzește-le până scot abur.',
        ),
      ],
      stepTips: [
        {
          step: 'loosen',
          text: t(
            'Do not boil the udon any longer: they finish in the wok and go soft if you cook them through first.',
            'Nu fierbe udonul mai mult: își termină gătirea în wok și se înmoaie prea tare dacă îl gătești complet înainte.',
          ),
        },
      ],
      nutritionNote: t(
        'Udon is a good source of carbohydrate and the cabbage, carrot and onion add some vegetables. The pork belly adds a lot of saturated fat, and soy sauce and oyster sauce make it salty; the noodles are refined wheat, so add more vegetables for fibre.',
        'Udonul este o sursă bună de carbohidrați, iar varza, morcovul și ceapa adaugă legume. Pieptul de porc adaugă multe grăsimi saturate, iar sosul de soia și sosul de stridii îl fac sărat; tăițeii sunt din grâu rafinat, așa că adaugă mai multe legume pentru fibre.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Pickled cucumbers', 'Castraveți murați'),
          reason: t(
            'Their sharp acidity cuts the rich pork fat and the sweet-salty sauce.',
            'Aciditatea lor ascuțită taie grăsimea bogată a porcului și sosul dulce-sărat.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-cucumbers',
        },
        {
          kind: 'drink',
          label: t('Hot green tea', 'Ceai verde fierbinte'),
          reason: t(
            'Its light bitterness refreshes the palate after the rich, savoury noodles.',
            'Amăreala lui ușoară împrospătează gura după tăițeii bogați și savuroși.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'green-tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'A quick one-pan lunch with carbohydrates, protein and vegetables.',
            'Un prânz rapid dintr-o singură tigaie, cu carbohidrați, proteine și legume.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Fatty and salty; heavy just before bed.',
            'Gras și sărat; greu chiar înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
