import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Stufat de miel base is the white, green-onion braise of lamb on the bone:
// no tomato and no flour, just wine, water and a lot of spring onion and green
// garlic. Each Variant is a full Recipe with its own lines, steps and guidance;
// the base's Recipe-level Tips are inherited unless a Variant hides them.
export const stufatDeMiel: BaseRecipeSeed = {
  slug: 'stufat-de-miel',
  title: t(
    'Romanian braised lamb with green onion and green garlic (stufat de miel)',
    'Stufat de miel cu ceapă verde și usturoi verde',
  ),
  servings: 6,
  prepMinutes: 30,
  cookMinutes: 150,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'lamb',
      quantity: 1800,
      unit: 'g',
      note: t(
        'on the bone (breast, ribs or shoulder), in 5 to 6 cm pieces',
        'cu os (piept, coaste sau spată), tăiat în bucăți de 5-6 cm',
      ),
    },
    { ingredient: 'sunflower-oil', quantity: 60, unit: 'ml' },
    {
      ingredient: 'spring-onion',
      quantity: 500,
      unit: 'g',
      note: t(
        'white and green parts, cut in 4 cm lengths',
        'părțile albe și verzi, tăiate în bucăți de 4 cm',
      ),
    },
    {
      ingredient: 'green-garlic',
      quantity: 100,
      unit: 'g',
      note: t(
        'bulbs and tender stalks, sliced 1 cm thick',
        'căpățâni și tulpini fragede, tăiate felii de 1 cm',
      ),
    },
    { ingredient: 'white-wine', quantity: 200, unit: 'ml' },
    { ingredient: 'still-water', quantity: 0.6, unit: 'l' },
    {
      ingredient: 'bay-leaves',
      quantity: 0.5,
      unit: 'g',
      note: t('2 to 3 leaves', '2-3 foi'),
    },
    { ingredient: 'paprika', quantity: 3, unit: 'g', optional: true },
    {
      ingredient: 'dill',
      quantity: 20,
      unit: 'g',
      note: t('finely chopped', 'tocat mărunt'),
    },
    {
      ingredient: 'parsley',
      quantity: 20,
      unit: 'g',
      note: t('finely chopped', 'tocat mărunt'),
    },
    { ingredient: 'salt', quantity: 8, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
  ],
  steps: [
    {
      key: 'prep-greens',
      text: t(
        'Wash the spring onions, green garlic, dill and parsley. Cut the spring onions in 4 cm lengths, slice the green garlic 1 cm thick and chop the dill and parsley finely. Keep the herbs in a covered bowl. Do all of this before the raw lamb comes out of its packet.',
        'Spală ceapa verde, usturoiul verde, mărarul și pătrunjelul. Taie ceapa verde în bucăți de 4 cm, usturoiul verde în felii de 1 cm și toacă mărunt mărarul și pătrunjelul. Ține verdeața într-un bol acoperit. Fă toate astea înainte să scoți carnea de miel crudă din ambalaj.',
      ),
    },
    {
      key: 'prep-lamb',
      text: t(
        'Put the lamb on a tray and pat it dry with kitchen paper; do not rinse it. Season the pieces on the tray with 5 g of the salt and the pepper, and put the paper in the bin.',
        'Pune carnea de miel pe o tavă și șterge-o cu hârtie de bucătărie; nu o spăla. Presară peste bucăți, pe tavă, 5 g din sare și piperul și aruncă hârtia la gunoi.',
      ),
    },
    {
      key: 'brown',
      text: t(
        'Heat the oil in a wide 5 litre pot over medium-high heat until it is very hot and the surface ripples. Brown about a third of the lamb for about 8 minutes, turning the pieces with tongs until they are deep golden on all sides, and lift them onto a separate plate, not the tray. Brown the other two batches the same way, leaving space between the pieces.',
        'Încinge uleiul într-o oală lată de 5 litri la foc mediu-mare, până se încinge bine și uleiul tremură la suprafață. Rumenește aproximativ o treime din carne vreo 8 minute, întorcând bucățile cu cleștele până se rumenesc bine pe toate părțile, și scoate-le pe o farfurie separată, nu pe tavă. Rumenește la fel și celelalte două porții, lăsând loc între bucăți.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'spoon-fat',
      text: t(
        'Spoon all but about 3 tablespoons (45 ml) of the fat out of the pot.',
        'Ia cu lingura din oală toată grăsimea, în afară de aproximativ 3 linguri (45 ml).',
      ),
    },
    {
      key: 'soften',
      text: t(
        'Add the spring onions and green garlic to the pot over medium heat. Stir for about 7 minutes, until the onions are wilted and glossy and the green parts are bright.',
        'Adaugă în oală ceapa verde și usturoiul verde, la foc mediu. Amestecă vreo 7 minute, până când ceapa se înmoaie și devine lucioasă, iar partea verde rămâne vie la culoare.',
      ),
      timerSeconds: 420,
    },
    {
      key: 'deglaze',
      text: t(
        'Pour in the wine, scrape the browned bits off the bottom with a wooden spoon and boil for 2 minutes.',
        'Toarnă vinul, desprinde cu o lingură de lemn bucățelele rumenite de pe fund și fierbe 2 minute.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'braise-start',
      text: t(
        'Put the lamb and any juices from the plate back into the pot, then wash your hands, the tongs, the tray and the plate with hot soapy water before you touch anything else. Add the water, the bay leaves, the paprika if you use it and the remaining 3 g of salt, and bring to a gentle simmer.',
        'Pune la loc în oală carnea și zeama de pe farfurie, apoi spală-te pe mâini și spală cleștele, tava și farfuria cu apă fierbinte și detergent, înainte să atingi altceva. Adaugă apa, foile de dafin, boiaua (dacă o folosești) și cele 3 g de sare rămase și adu la fierbere domoală.',
      ),
    },
    {
      key: 'braise',
      text: t(
        'Cover and cook over low heat for 90 minutes, with a gentle bubble and a stir every 30 minutes. The lamb is ready when the meat is very tender and pulls away from the bone. If it is not tender yet, cook on and check every 15 minutes.',
        'Acoperă și gătește la foc mic 90 de minute, cu clocot domol, amestecând din 30 în 30 de minute. Carnea e gata când e foarte fragedă și se desprinde de pe os. Dacă nu e încă fragedă, mai gătește și verifică din 15 în 15 minute.',
      ),
      timerSeconds: 5400,
    },
    {
      key: 'finish',
      text: t(
        'Uncover the pot and spoon off the fat that has risen to the surface. Simmer for 10 minutes, until the sauce is reduced to a glossy gravy that coats the meat. If it is still thin, simmer a few minutes more.',
        'Descoperă oala și ia cu lingura grăsimea ieșită la suprafață. Fierbe 10 minute, până când sosul se reduce la o zeamă lucioasă care îmbracă carnea. Dacă e încă subțire, mai fierbe câteva minute.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'herbs',
      text: t(
        'Take the pot off the heat and take out the bay leaves. Stir in the dill and parsley, then taste and add salt and pepper if it needs them. Leave it to rest for 5 minutes with the lid on.',
        'Ia oala de pe foc și scoate foile de dafin. Amestecă mărarul și pătrunjelul, apoi gustă și adaugă sare și piper dacă mai e nevoie. Lasă mâncarea să se odihnească 5 minute, cu capacul pus.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'store',
      text: t(
        'Serve hot. Cool leftovers within 2 hours, in shallow containers, then put them in the fridge and eat them within 3 to 4 days. Reheat until steaming hot all the way through.',
        'Servește fierbinte. Răcește mâncarea rămasă în cel mult 2 ore, în recipiente joase, apoi pune-o la frigider și consum-o în 3-4 zile. Reîncălzește până e fierbinte și scoate aburi peste tot.',
      ),
    },
  ],
  tips: [
    t(
      'Lamb on the bone gives a fuller sauce than boneless meat. Ask the butcher to cut it in 5 to 6 cm pieces.',
      'Mielul cu os dă un sos mai plin decât carnea dezosată. Roagă măcelarul să-l taie în bucăți de 5-6 cm.',
    ),
    t(
      'Dry the lamb well before it goes in the pot: wet meat steams and turns grey instead of browning, and the browning is what flavours the sauce.',
      'Șterge bine carnea înainte să intre în oală: carnea umedă se fierbe în abur și se face cenușie în loc să se rumenească, iar rumenirea e cea care dă gust sosului.',
    ),
    t(
      'It tastes better the next day. Cool it within 2 hours in shallow containers, chill it overnight in the fridge, lift off the fat that has set on top, and reheat until steaming hot.',
      'E mai bună a doua zi. Răcește-o în cel mult 2 ore, în recipiente joase, ține-o peste noapte la frigider, ia grăsimea întărită de deasupra și reîncălzește până scoate aburi.',
    ),
    t(
      'This is a spring dish, made when green onion and green garlic are in the market. Use plenty of the green parts too, as they melt into the sauce.',
      'E o mâncare de primăvară, care se face când ceapa verde și usturoiul verde sunt în piață. Folosește multă și din partea verde, pentru că se topește în sos.',
    ),
    t(
      'Contains sulphites from the wine. Check the label if you cook for someone who is sensitive to them.',
      'Conține sulfiți din vin. Verifică eticheta dacă gătești pentru cineva sensibil la ei.',
    ),
  ],
  stepTips: [
    {
      step: 'brown',
      text: t(
        'Do not crowd the pot. Pieces that touch each other steam and turn grey, so brown in three batches even if it takes longer.',
        'Nu pune prea multe bucăți deodată în oală. Bucățile care se ating se fierb în abur și se fac cenușii, așa că rumenește în trei porții, chiar dacă durează mai mult.',
      ),
    },
    {
      step: 'braise',
      text: t(
        'Keep the bubble gentle. A hard boil makes the lamb stringy and the sauce cloudy.',
        'Păstrează clocotul domol. Un clocot puternic face carnea de miel fibroasă și sosul tulbure.',
      ),
    },
  ],
  nutritionNote: t(
    'Lamb gives plenty of protein, and the large amount of spring onion adds vegetables to the dish. Breast and ribs are fatty and much of that fat is saturated, so spooning off the fat before serving helps. There is almost no starch, so serve it with mămăligă or bread, and a salad for fibre.',
    'Mielul dă multe proteine, iar cantitatea mare de ceapă verde adaugă legume în mâncare. Pieptul și coastele sunt grase, iar mare parte din grăsime e saturată, așa că ajută să iei grăsimea cu lingura înainte de servire. Aproape nu are amidon, așa că servește-o cu mămăligă sau pâine și cu o salată pentru fibre.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t(
        'Mămăligă with cheese and sour cream',
        'Mămăligă cu brânză și smântână',
      ),
      reason: t(
        'Soft mămăligă soaks up the wine and green-onion sauce and gives the lamb a mild, creamy base.',
        'Mămăliga moale absoarbe sosul cu vin și ceapă verde și dă mielului o garnitură blândă, cremoasă.',
      ),
      principle: 'complement_flavour',
      recipe: 'mamaliga',
    },
    {
      kind: 'food',
      label: t(
        'Romanian lamb offal and spring-herb loaf (drob de miel)',
        'Drob de miel',
      ),
      reason: t(
        'Both are made from lamb and are served at the same Easter table: the cold drob first, then the hot stufat.',
        'Amândouă se fac din miel și se servesc la aceeași masă de Paște: întâi drobul rece, apoi stufatul fierbinte.',
      ),
      principle: 'regional_tradition',
      recipe: 'drob-de-miel',
    },
    {
      kind: 'food',
      label: t(
        'Romanian mixed brine-fermented pickles (murături asortate)',
        'Murături asortate în saramură',
      ),
      reason: t(
        'The sharp, salty pickles cut through the fat of the lamb.',
        'Murăturile acre și sărate echilibrează grăsimea mielului.',
      ),
      principle: 'acid_cuts_fat',
      recipe: 'muraturi',
    },
    {
      kind: 'food',
      label: t('Fresh bread', 'Pâine proaspătă'),
      reason: t(
        'The crumb mops up the last of the sauce, which is the best part of the pot.',
        'Miezul de pâine strânge ultimul sos din farfurie, care e cel mai bun din oală.',
      ),
      principle: 'complement_flavour',
      ingredient: 'bread',
    },
    {
      kind: 'drink',
      label: t('Light red wine', 'Vin roșu ușor'),
      reason: t(
        'Its fruit and acidity stand up to the lamb without covering the green onion and dill.',
        'Fructul și aciditatea lui țin piept cărnii de miel fără să acopere ceapa verde și mărarul.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'red-wine',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot, rich braise warms you through on a cool spring day.',
        'O tocană fierbinte și bogată te încălzește într-o zi răcoroasă de primăvară.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Protein from the lamb; add mămăligă or bread for carbohydrates.',
        'Proteine din carnea de miel; adaugă mămăligă sau pâine pentru carbohidrați.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'A heavy, hot lamb braise is hard to enjoy in the heat.',
        'O tocană grea și fierbinte de miel e greu de savurat pe căldură.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A large, fatty meal can sit heavy before bed.',
        'O masă mare și grasă poate cădea greu înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'stufat-de-miel-french',
      cuisine: 'french',
      title: t(
        "Navarin d'agneau printanier (French spring lamb stew with young vegetables)",
        "Navarin d'agneau printanier (tocană franțuzească de miel cu legume de primăvară)",
      ),
      servings: 6,
      prepMinutes: 40,
      cookMinutes: 130,
      difficulty: 'medium',
      hideBaseTips: [3, 4],
      lines: [
        {
          ingredient: 'lamb',
          quantity: 1500,
          unit: 'g',
          note: t(
            'shoulder or neck on the bone, in 5 to 6 cm pieces',
            'spată sau gât cu os, tăiat în bucăți de 5-6 cm',
          ),
        },
        { ingredient: 'sunflower-oil', quantity: 45, unit: 'ml' },
        { ingredient: 'flour', quantity: 30, unit: 'g' },
        { ingredient: 'tomato-paste', quantity: 30, unit: 'g' },
        {
          ingredient: 'garlic',
          quantity: 15,
          unit: 'g',
          note: t('4 cloves, crushed', '4 căței, zdrobiți'),
        },
        { ingredient: 'still-water', quantity: 1, unit: 'l' },
        {
          ingredient: 'thyme',
          quantity: 3,
          unit: 'g',
          note: t('a few sprigs', 'câteva crenguțe'),
        },
        {
          ingredient: 'bay-leaves',
          quantity: 0.5,
          unit: 'g',
          note: t('2 to 3 leaves', '2-3 foi'),
        },
        {
          ingredient: 'parsley',
          quantity: 15,
          unit: 'g',
          note: t(
            'stalks for the bouquet, leaves chopped to finish',
            'cozile pentru buchet, frunzele tocate pentru final',
          ),
        },
        {
          ingredient: 'pearl-onions',
          quantity: 300,
          unit: 'g',
          note: t('peeled, left whole', 'curățată, lăsată întreagă'),
        },
        {
          ingredient: 'turnip',
          quantity: 400,
          unit: 'g',
          note: t('peeled, in wedges', 'curățat, tăiat în felii groase'),
        },
        {
          ingredient: 'carrot',
          quantity: 400,
          unit: 'g',
          note: t(
            'peeled, in 4 cm chunks',
            'curățați, tăiați în bucăți de 4 cm',
          ),
        },
        {
          ingredient: 'potato',
          quantity: 0.6,
          unit: 'kg',
          note: t(
            'small waxy potatoes, halved',
            'cartofi mici, cu pulpa fermă, tăiați pe jumătate',
          ),
        },
        {
          ingredient: 'green-beans',
          quantity: 200,
          unit: 'g',
          note: t(
            'trimmed, in 3 cm pieces',
            'curățată, tăiată în bucăți de 3 cm',
          ),
        },
        {
          ingredient: 'fresh-peas',
          quantity: 200,
          unit: 'g',
          note: t('shelled weight', 'cântărită fără păstăi'),
        },
        { ingredient: 'salt', quantity: 12, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'soak-onions',
          text: t(
            'Put the pearl onions in a heatproof bowl, pour boiling water over them and leave them for 2 minutes to loosen the skins. Drain them.',
            'Pune ceapa perlată într-un bol rezistent la căldură, toarnă peste ea apă clocotită și lasă-o 2 minute ca să se desprindă coaja. Scurge-o.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'prep-veg',
          text: t(
            'Peel the pearl onions and keep them whole. Peel the turnips and carrots and cut them as in the ingredient list, halve the potatoes, trim and cut the beans, shell the peas and crush the garlic. Chop the parsley leaves and tie the thyme, bay leaves and parsley stalks into a bouquet. Do all of this before the raw lamb comes out of its packet.',
            'Curăță ceapa perlată și lasă-o întreagă. Curăță napii și morcovii și taie-i cum scrie la ingrediente, taie cartofii pe jumătate, curăță și taie fasolea, scoate mazărea din păstăi și zdrobește usturoiul. Toacă frunzele de pătrunjel și leagă cimbrișorul, foile de dafin și cozile de pătrunjel într-un buchet. Fă toate astea înainte să scoți carnea de miel crudă din ambalaj.',
          ),
        },
        {
          key: 'prep-lamb',
          text: t(
            'Put the lamb on a tray and pat it dry with kitchen paper; do not rinse it. Season it on the tray with 5 g of the salt and the pepper, and put the paper in the bin.',
            'Pune carnea de miel pe o tavă și șterge-o cu hârtie de bucătărie; nu o spăla. Condimentează-o pe tavă cu 5 g din sare și cu piperul și aruncă hârtia la gunoi.',
          ),
        },
        {
          key: 'brown',
          text: t(
            'Heat the oil in a wide 7 litre pot over medium-high heat until it is very hot and the surface ripples. Brown half of the lamb for about 8 minutes, turning the pieces with tongs until they are deep golden on all sides, and lift them onto a separate plate, not the tray. Brown the second half the same way.',
            'Încinge uleiul într-o oală lată de 7 litri la foc mediu-mare, până se încinge bine și uleiul tremură la suprafață. Rumenește jumătate din carne vreo 8 minute, întorcând bucățile cu cleștele până se rumenesc bine pe toate părțile, și scoate-le pe o farfurie separată, nu pe tavă. Rumenește la fel și a doua jumătate.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'spoon-fat',
          text: t(
            'Spoon all but about 2 tablespoons (30 ml) of the fat out of the pot.',
            'Ia cu lingura din oală toată grăsimea, în afară de aproximativ 2 linguri (30 ml).',
          ),
        },
        {
          key: 'flour',
          text: t(
            'Put the lamb and any juices from the plate back into the pot, then wash your hands, the tongs, the tray and the plate with hot soapy water before you touch anything else. Sprinkle the flour over the lamb and stir over medium heat for 2 minutes, until no dry flour is left.',
            'Pune la loc în oală carnea și zeama de pe farfurie, apoi spală-te pe mâini și spală cleștele, tava și farfuria cu apă fierbinte și detergent, înainte să atingi altceva. Presară făina peste carne și amestecă la foc mediu 2 minute, până nu mai rămâne făină uscată.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'paste',
          text: t(
            'Stir in the tomato paste and garlic and cook for 1 minute, until the paste darkens and smells sweet.',
            'Amestecă pasta de roșii și usturoiul și gătește 1 minut, până când pasta se închide la culoare și miroase dulceag.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'simmer-start',
          text: t(
            'Pour in the water a little at a time, stirring and scraping up the browned bits. Add the bouquet and the remaining 7 g of salt, and bring to a boil.',
            'Toarnă apa puțin câte puțin, amestecând și desprinzând bucățelele rumenite de pe fund. Adaugă buchetul și cele 7 g de sare rămase și adu la fierbere.',
          ),
        },
        {
          key: 'braise',
          text: t(
            'Cover and simmer gently for 60 minutes. Spoon off the fat from the surface, then test a piece: the knife should meet only a little resistance. If it is still firm, cook on and check every 15 minutes.',
            'Acoperă și fierbe domol 60 de minute. Ia cu lingura grăsimea de la suprafață, apoi încearcă o bucată: cuțitul ar trebui să întâmpine doar puțină rezistență. Dacă e încă tare, mai gătește și verifică din 15 în 15 minute.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'roots',
          text: t(
            'Add the pearl onions, turnips, carrots and potatoes. Cover and simmer for 25 minutes, until a knife slides easily into the potatoes and carrots. If the lamb is still not tender, lift the vegetables out with a slotted spoon into a bowl, simmer the lamb on and check every 15 minutes, then put the vegetables back for the last 5 minutes.',
            'Adaugă ceapa perlată, napii, morcovii și cartofii. Acoperă și fierbe 25 de minute, până când un cuțit intră ușor în cartofi și morcovi. Dacă carnea nu e încă fragedă, scoate legumele cu o spumieră într-un bol, mai fierbe carnea și verifică-o din 15 în 15 minute, apoi pune legumele la loc pentru ultimele 5 minute.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'greens',
          text: t(
            'Add the green beans and peas and simmer uncovered for 8 minutes, until the beans are tender but still bright green.',
            'Adaugă fasolea verde și mazărea și fierbe descoperit 8 minute, până când fasolea e fragedă, dar încă verde aprins.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'finish',
          text: t(
            'Take out the bouquet, taste and add salt and pepper if it needs them, and scatter the chopped parsley over the top. Serve hot.',
            'Scoate buchetul, gustă și adaugă sare și piper dacă mai e nevoie, apoi presară deasupra pătrunjelul tocat. Servește fierbinte.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Cool leftovers within 2 hours, in shallow containers, then put them in the fridge and eat them within 3 to 4 days. Reheat until steaming hot all the way through.',
            'Răcește mâncarea rămasă în cel mult 2 ore, în recipiente joase, apoi pune-o la frigider și consum-o în 3-4 zile. Reîncălzește până e fierbinte și scoate aburi peste tot.',
          ),
        },
      ],
      tips: [
        t(
          'Cut the root vegetables to about the same size, so they all finish at the same minute.',
          'Taie legumele rădăcinoase cam de aceeași mărime, ca să se gătească toate în același timp.',
        ),
        t(
          'The beans and peas go in last on purpose: they keep their colour and their bite. Frozen peas also work; put them in for the last 3 minutes.',
          'Fasolea și mazărea intră la urmă intenționat: își păstrează culoarea și textura. Merge și mazărea congelată; pune-o pentru ultimele 3 minute.',
        ),
        t(
          'Contains gluten from the flour. Check the tomato paste label too if you cook for someone with coeliac disease.',
          'Conține gluten din făină. Verifică și eticheta pastei de roșii dacă gătești pentru cineva cu boală celiacă.',
        ),
      ],
      stepTips: [
        {
          step: 'flour',
          text: t(
            'Cook the flour for the full 2 minutes, or the sauce will taste raw and floury.',
            'Gătește făina cele 2 minute întregi, altfel sosul va avea gust crud, de făină.',
          ),
        },
      ],
      nutritionNote: t(
        'Lamb gives protein, and the turnips, carrots, beans and peas add fibre and a good variety of vegetables. The potatoes and flour add starch, so it is a filling one-pot meal. Shoulder and neck are fatty, so spoon off the fat, and watch the salt if you add more.',
        'Mielul dă proteine, iar napii, morcovii, fasolea și mazărea adaugă fibre și o varietate bună de legume. Cartofii și făina aduc amidon, așa că e o masă săturătoare dintr-o singură oală. Spata și gâtul sunt grase, așa că ia grăsimea cu lingura, și fii atent la sare dacă mai adaugi.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Fresh bread', 'Pâine proaspătă'),
          reason: t(
            'The crumb soaks up the tomato and lamb sauce.',
            'Miezul pâinii absoarbe sosul de roșii și miel.',
          ),
          principle: 'complement_flavour',
          ingredient: 'bread',
        },
        {
          kind: 'drink',
          label: t('Light red wine', 'Vin roșu ușor'),
          reason: t(
            'Its fruit and acidity stand up to the lamb without covering the young vegetables.',
            'Fructul și aciditatea lui țin piept cărnii de miel fără să acopere legumele tinere.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'red-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot stew with vegetables warms you through on a cool spring day.',
            'O tocană fierbinte cu legume te încălzește într-o zi răcoroasă de primăvară.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from the lamb and carbohydrate from the potatoes.',
            'Proteine din carnea de miel și carbohidrați din cartofi.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'A hot, hearty stew is heavy in warm weather.',
            'O tocană fierbinte și consistentă cade greu pe vreme caldă.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A large, fatty meal can sit heavy before bed.',
            'O masă mare și grasă poate cădea greu înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'stufat-de-miel-greek',
      cuisine: 'greek',
      title: t(
        'Arni fricassee (Greek lamb with lettuce, dill and egg-lemon sauce)',
        'Arni fricassee (miel grecesc cu salată verde, mărar și sos de ou cu lămâie)',
      ),
      servings: 6,
      prepMinutes: 30,
      cookMinutes: 125,
      difficulty: 'medium',
      hideBaseTips: [2, 3, 4],
      lines: [
        {
          ingredient: 'lamb',
          quantity: 1500,
          unit: 'g',
          note: t(
            'on the bone (shoulder or ribs), in 5 to 6 cm pieces',
            'cu os (spată sau coaste), tăiat în bucăți de 5-6 cm',
          ),
        },
        { ingredient: 'olive-oil', quantity: 60, unit: 'ml' },
        {
          ingredient: 'spring-onion',
          quantity: 400,
          unit: 'g',
          note: t(
            'white and green parts, sliced 2 cm thick',
            'părțile albe și verzi, tăiate felii de 2 cm',
          ),
        },
        { ingredient: 'still-water', quantity: 0.7, unit: 'l' },
        {
          ingredient: 'lettuce',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'cos (romaine), about 300 g each, cut in 3 cm ribbons',
            'salată romană, de aproximativ 300 g bucata, tăiată fâșii de 3 cm',
          ),
        },
        {
          ingredient: 'dill',
          quantity: 40,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        { ingredient: 'salt', quantity: 8, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        {
          ingredient: 'eggs',
          quantity: 2,
          unit: 'pcs',
          note: t('for the egg-lemon sauce', 'pentru sosul de ou cu lămâie'),
        },
        {
          ingredient: 'lemon',
          quantity: 2,
          unit: 'pcs',
          note: t('juiced, about 100 ml', 'stoarse, aproximativ 100 ml suc'),
        },
      ],
      steps: [
        {
          key: 'prep-greens',
          text: t(
            'Wash the lettuce and cut it in 3 cm ribbons. Slice the spring onions 2 cm thick and chop the dill finely. Squeeze the lemons and keep the juice in a jug. Do all of this before the raw lamb comes out of its packet.',
            'Spală salata verde și taie-o fâșii de 3 cm. Taie ceapa verde felii de 2 cm și toacă mărunt mărarul. Stoarce lămâile și păstrează sucul într-o cană. Fă toate astea înainte să scoți carnea de miel crudă din ambalaj.',
          ),
        },
        {
          key: 'prep-lamb',
          text: t(
            'Put the lamb on a tray and pat it dry with kitchen paper; do not rinse it. Season it on the tray with 5 g of the salt and the pepper, and put the paper in the bin.',
            'Pune carnea de miel pe o tavă și șterge-o cu hârtie de bucătărie; nu o spăla. Condimentează-o pe tavă cu 5 g din sare și cu piperul și aruncă hârtia la gunoi.',
          ),
        },
        {
          key: 'brown',
          text: t(
            'Heat the oil in a wide 6 litre pot over medium-high heat until it is very hot and the surface ripples. Brown half of the lamb for about 8 minutes, turning the pieces with tongs until they are well browned on all sides, and lift them onto a separate plate, not the tray. Brown the second half the same way.',
            'Încinge uleiul într-o oală lată de 6 litri la foc mediu-mare, până se încinge bine și uleiul tremură la suprafață. Rumenește jumătate din carne vreo 8 minute, întorcând bucățile cu cleștele până se rumenesc bine pe toate părțile, și scoate-le pe o farfurie separată, nu pe tavă. Rumenește la fel și a doua jumătate.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'soften',
          text: t(
            'Add the spring onions to the oil in the pot, over medium heat. Stir for about 5 minutes, until they are wilted and glossy.',
            'Adaugă ceapa verde în uleiul din oală, la foc mediu. Amestecă vreo 5 minute, până când se înmoaie și devine lucioasă.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'braise-start',
          text: t(
            'Put the lamb and any juices from the plate back into the pot, then wash your hands, the tongs, the tray and the plate with hot soapy water before you touch anything else. Add the water and the remaining 3 g of salt, and bring to a gentle simmer.',
            'Pune la loc în oală carnea și zeama de pe farfurie, apoi spală-te pe mâini și spală cleștele, tava și farfuria cu apă fierbinte și detergent, înainte să atingi altceva. Adaugă apa și cele 3 g de sare rămase și adu la fierbere domoală.',
          ),
        },
        {
          key: 'braise',
          text: t(
            'Cover and cook over low heat for 75 minutes, with a gentle bubble. The lamb is ready when the meat is very tender and pulls away from the bone. If it is not tender yet, cook on and check every 15 minutes.',
            'Acoperă și gătește la foc mic 75 de minute, cu clocot domol. Carnea e gata când e foarte fragedă și se desprinde de pe os. Dacă nu e încă fragedă, mai gătește și verifică din 15 în 15 minute.',
          ),
          timerSeconds: 4500,
        },
        {
          key: 'lettuce',
          text: t(
            'Spoon off the fat from the surface. Stir in the lettuce a handful at a time as it wilts, then add two thirds of the dill. Simmer uncovered for 10 minutes, until the lettuce is soft and olive green.',
            'Ia cu lingura grăsimea de la suprafață. Adaugă salata câte o mână, pe măsură ce se înmoaie, apoi două treimi din mărar. Fierbe descoperit 10 minute, până când salata e moale și verde-măsliniu.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'off-heat',
          text: t(
            'Take the pot off the heat and leave it for 2 minutes, so the broth stops bubbling.',
            'Ia oala de pe foc și lasă-o 2 minute, ca zeama să nu mai clocotească.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'avgolemono',
          text: t(
            'In a bowl, whisk the eggs for 1 minute until frothy, then whisk in half of the lemon juice (about 50 ml) in a thin stream. Whisking all the time, add 3 ladles (about 250 ml) of the hot broth one ladle at a time, so the eggs warm up slowly and do not scramble.',
            'Într-un bol, bate ouăle 1 minut, până fac spumă, apoi adaugă jumătate din sucul de lămâie (aproximativ 50 ml) într-un fir subțire, tot batând. Fără să te oprești din bătut, adaugă 3 polonice (aproximativ 250 ml) din zeama fierbinte, câte unul pe rând, ca ouăle să se încălzească încet și să nu se taie.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'combine',
          text: t(
            'Pour the egg-lemon mixture into the pot and stir gently. Put the pot back on the lowest heat for 2 minutes, stirring, until the sauce is steaming and coats the spoon lightly. Do not let it bubble, or the egg will curdle.',
            'Toarnă amestecul de ou cu lămâie în oală și amestecă ușor. Pune oala la loc pe cel mai mic foc pentru 2 minute, amestecând, până când sosul scoate aburi și îmbracă lingura ușor. Nu-l lăsa să clocotească, altfel oul se taie.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'finish',
          text: t(
            'Take the pot off the heat, stir in the rest of the dill and taste. Add more of the lemon juice, a little at a time, and salt and pepper if it needs them. Serve straight away.',
            'Ia oala de pe foc, amestecă restul de mărar și gustă. Adaugă puțin câte puțin din sucul de lămâie rămas, plus sare și piper dacă mai e nevoie. Servește imediat.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Cool leftovers within 2 hours, in shallow containers, then put them in the fridge and eat them within 3 to 4 days. Reheat gently over low heat, stirring, until steaming hot, and do not let it boil.',
            'Răcește mâncarea rămasă în cel mult 2 ore, în recipiente joase, apoi pune-o la frigider și consum-o în 3-4 zile. Reîncălzește încet, la foc mic, amestecând, până scoate aburi, și nu o lăsa să clocotească.',
          ),
        },
      ],
      tips: [
        t(
          'Never add the egg-lemon mixture straight to the pot, and never let the pot boil after it goes in. Tempering with hot broth and a last gentle heat is what keeps the sauce smooth.',
          'Nu pune amestecul de ou cu lămâie direct în oală și nu lăsa oala să clocotească după ce l-ai adăugat. Încălzirea treptată a ouălor cu zeamă fierbinte și o ultimă încălzire blândă țin sosul fin.',
        ),
        t(
          'Lemons vary in sourness. Start with half of the juice in the sauce, taste at the end, and add the rest to your liking.',
          'Lămâile diferă ca aciditate. Începe cu jumătate din suc în sos, gustă la final și adaugă restul după gust.',
        ),
        t(
          'Contains eggs. The egg in the sauce is only gently heated, not boiled. For pregnant women, older people, young children and anyone with a weak immune system, keep the sauce steaming (about 71 °C on a thermometer) without boiling it, or use pasteurised eggs.',
          'Conține ouă. Oul din sos este doar încălzit blând, nu fiert. Pentru femei însărcinate, persoane în vârstă, copii mici și oricine are imunitatea scăzută, ține sosul aburind (aproximativ 71 °C pe termometru), fără să clocotească, sau folosește ouă pasteurizate.',
        ),
      ],
      stepTips: [
        {
          step: 'avgolemono',
          text: t(
            'Use a ladle and pour with the other hand while you whisk. If you pour from the pot, the first splash of hot broth can cook the egg at once.',
            'Folosește un polonic și toarnă cu o mână în timp ce bați cu cealaltă. Dacă torni direct din oală, primul val de zeamă fierbinte poate fierbe oul pe loc.',
          ),
        },
      ],
      nutritionNote: t(
        'Lamb gives protein, the lettuce, spring onion and dill add vegetables, and the lemon gives freshness without extra salt. The lamb fat is largely saturated, and the olive oil and egg make it richer, so spoon off the fat. There is almost no starch, so serve it with bread.',
        'Mielul dă proteine, iar salata verde, ceapa verde și mărarul adaugă legume, în timp ce lămâia aduce prospețime fără sare în plus. Grăsimea mielului e în mare parte saturată, iar uleiul de măsline și oul îl fac mai bogat, așa că ia grăsimea cu lingura. Aproape nu are amidon, așa că servește-l cu pâine.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Country bread', 'Pâine de casă'),
          reason: t(
            'The crumb soaks up the lemony sauce.',
            'Miezul pâinii absoarbe sosul cu lămâie.',
          ),
          principle: 'complement_flavour',
          ingredient: 'country-bread',
        },
        {
          kind: 'food',
          label: t('Feta', 'Brânză feta'),
          reason: t(
            'Its salt and tang match the lemon and dill.',
            'Sărătura și aciditatea ei se potrivesc cu lămâia și mărarul.',
          ),
          principle: 'complement_flavour',
          ingredient: 'feta',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its crisp acidity echoes the lemon and refreshes the palate between rich bites.',
            'Aciditatea lui proaspătă se potrivește cu lămâia și împrospătează gustul între îmbucături bogate.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'white-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A warm lamb braise with a lemony sauce suits a cool spring day.',
            'O tocană caldă de miel cu sos de lămâie se potrivește într-o zi răcoroasă de primăvară.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from the lamb and the egg; add bread for carbohydrates.',
            'Proteine din carnea de miel și din ou; adaugă pâine pentru carbohidrați.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A large, rich lamb meal can sit heavy before bed.',
            'O masă mare și bogată cu miel poate cădea greu înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
