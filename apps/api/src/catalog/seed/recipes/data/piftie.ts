import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Piftie base is the Romanian pork aspic with garlic, set by trotters, ears
// and knuckle alone (no gelatin). Each Variant is a full Recipe with its own
// lines, steps and guidance; the base's Recipe-level Tips are inherited. The
// pork and beef cuts are long-simmered, so every Recipe here shares the same
// cooling rule: shallow dishes, in the fridge within 2 hours.
export const piftie: BaseRecipeSeed = {
  slug: 'piftie',
  title: t(
    'Romanian pork aspic with garlic (piftie)',
    'Piftie de porc cu usturoi',
  ),
  servings: 10,
  prepMinutes: 490,
  cookMinutes: 455,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'pork-trotters',
      quantity: 1500,
      unit: 'g',
      note: t('split lengthways by the butcher', 'tăiate pe lung de măcelar'),
    },
    {
      ingredient: 'pork-knuckle',
      quantity: 1000,
      unit: 'g',
      note: t('fresh, not smoked', 'proaspăt, nu afumat'),
    },
    { ingredient: 'pork-ears', quantity: 500, unit: 'g' },
    {
      ingredient: 'still-water',
      quantity: 5,
      unit: 'l',
      note: t(
        'for the broth; the first boil uses extra tap water that is thrown away',
        'pentru zeamă; la prima fierbere se folosește apă de la robinet în plus, care se aruncă',
      ),
    },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('peeled', 'curățate'),
    },
    {
      ingredient: 'carrot',
      quantity: 200,
      unit: 'g',
      optional: true,
      note: t('peeled, left whole', 'curățați, întregi'),
    },
    { ingredient: 'peppercorns', quantity: 5, unit: 'g' },
    { ingredient: 'bay-leaves', quantity: 1, unit: 'g' },
    { ingredient: 'salt', quantity: 35, unit: 'g' },
    {
      ingredient: 'garlic',
      quantity: 40,
      unit: 'g',
      note: t('peeled, about a whole head', 'curățat, cam un cap întreg'),
    },
    { ingredient: 'paprika', quantity: 3, unit: 'g', optional: true },
  ],
  steps: [
    {
      key: 'prep-veg',
      text: t(
        'Peel the onions, peel the carrots (if using) and peel the garlic. Keep them all whole and set them aside; do this first, before you touch the raw pork.',
        'Curăță ceapa, morcovii (dacă îi folosești) și usturoiul. Lasă-le întregi și pune-le deoparte; fă asta primul lucru, înainte să atingi carnea crudă de porc.',
      ),
    },
    {
      key: 'clean',
      text: t(
        'On a board kept for raw meat, look the trotters and ears over for stray bristles and scrape them off with the back of a knife, or singe them briefly over a gas flame (hair and long sleeves tied back, kitchen paper and cloths well away). Do not rinse the pork. Put all the pork into a 12 litre pot and add about 4 litres of cold tap water, enough to cover it by about 1 cm.',
        'Pe un tocător folosit doar pentru carne crudă, verifică dacă au rămas fire de păr pe picioare și pe urechi și răzuiește-le cu spatele cuțitului sau pârlește-le scurt deasupra unei flăcări de aragaz (cu părul și mânecile lungi strânse, iar hârtia de bucătărie și cârpele departe). Nu spăla carnea de porc. Pune toată carnea într-o oală de 12 litri și adaugă cam 4 litri de apă rece de la robinet, cât să o acopere cu aproximativ 1 cm.',
      ),
    },
    {
      key: 'wash',
      text: t(
        'Wash your hands, the board, the knife and anything else that touched the raw pork with hot soapy water.',
        'Spală-ți mâinile, tocătorul, cuțitul și tot ce a atins carnea crudă cu apă fierbinte și detergent.',
      ),
    },
    {
      key: 'blanch',
      text: t(
        'Bring the pot to the boil over high heat, which takes about 25 minutes, then boil hard for 10 minutes. Grey scum will rise.',
        'Adu oala la fierbere la foc mare, ceea ce durează cam 25 de minute, apoi fierbe tare 10 minute. La suprafață va ieși o spumă cenușie.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'drain',
      text: t(
        'Turn off the heat. With tongs, lift the pork onto a clean tray or into a large bowl. Pour away the blanching water carefully, as it is very hot, and wash the pot. Put the pork back in the pot.',
        'Oprește focul. Cu cleștele, scoate carnea pe o tavă curată sau într-un castron mare. Aruncă cu grijă apa de la fiert, pentru că e fierbinte, și spală oala. Pune carnea înapoi în oală.',
      ),
    },
    {
      key: 'simmer-start',
      text: t(
        'Add about 5 litres of fresh cold water, enough to cover the pork by about 3 cm, then the onions, peppercorns and bay leaves. Bring to a gentle boil over medium heat, which takes about 25 minutes, skimming off the scum with a ladle. Then turn the heat right down until only a bubble breaks the surface now and then.',
        'Adaugă cam 5 litri de apă proaspătă, rece, cât să acopere carnea cu aproximativ 3 cm, apoi ceapa, boabele de piper și foile de dafin. Adu la fierbere ușoară la foc mediu, ceea ce durează cam 25 de minute, și ia spuma cu un polonic. Apoi dă focul la minimum, până când doar din când în când sparge suprafața câte o bulă.',
      ),
    },
    {
      key: 'simmer',
      text: t(
        'Simmer for 4 hours with the lid ajar. Keep the meat covered: if the level drops, top up with boiling water from a kettle, because cold water stops the simmer.',
        'Fierbe 4 ore la foc mic, cu capacul întredeschis. Ține carnea acoperită: dacă nivelul scade, completează cu apă clocotită din fierbător, pentru că apa rece oprește fierberea.',
      ),
      timerSeconds: 14400,
    },
    {
      key: 'salt',
      text: t(
        'Add the carrots (if using) and the salt, and simmer for 1 more hour, until the skin is soft and the meat slides off the bones when you push it with a fork. If it is not that tender yet, lift out the carrots first, then simmer on and check every 15 minutes.',
        'Adaugă morcovii (dacă îi folosești) și sarea și fierbe încă o oră, până când pielea e moale și carnea se desprinde de pe oase când o apeși cu furculița. Dacă nu e încă atât de fragedă, scoate mai întâi morcovii, apoi mai fierbe și verifică din 15 în 15 minute.',
      ),
      timerSeconds: 3600,
    },
    {
      key: 'strain',
      text: t(
        'Turn off the heat. Lift out and throw away the onions, and put the carrots on a plate. With tongs, move the pork onto a clean tray. Ladle the broth through a fine sieve into a large clean bowl or pot.',
        'Oprește focul. Scoate și aruncă ceapa, iar morcovii pune-i pe o farfurie. Cu cleștele, mută carnea pe o tavă curată. Strecoară zeama cu polonicul printr-o sită deasă într-un castron sau o oală mare, curate.',
      ),
    },
    {
      key: 'pick',
      text: t(
        'Once the pork is cool enough to handle but still warm, use tongs or forks to strip the meat, skin and soft gristle off the bones. Throw away the bones, hard cartilage and any hairs, and cut everything into pieces of 1 to 2 cm. Slice the carrots into rounds.',
        'Când carnea s-a răcit cât s-o poți atinge, dar e încă caldă, desprinde carnea, pielea și cartilajele moi de pe oase. Aruncă oasele, cartilajele tari și orice fir de păr și taie totul în bucăți de 1–2 cm. Taie morcovii în rondele.',
      ),
    },
    {
      key: 'divide',
      text: t(
        'Lay a few carrot rounds in the bottom of 10 shallow bowls, or 3 to 4 wide dishes no more than 5 cm deep. Divide the chopped meat between them.',
        'Pune câteva rondele de morcov pe fundul a 10 boluri late, sau în 3-4 vase late, adânci de cel mult 5 cm. Împarte carnea tăiată între ele.',
      ),
    },
    {
      key: 'garlic',
      text: t(
        'While the broth is still warm, press the garlic into it and stir. Taste and add salt if it needs it. Ladle the broth over the meat so that it is covered by about 1 cm.',
        'Cât timp zeama e încă caldă, stoarce usturoiul în ea cu storcătorul și amestecă. Gustă și adaugă sare dacă mai are nevoie. Toarnă zeama peste carne, ca să o acopere cu aproximativ 1 cm.',
      ),
    },
    {
      key: 'chill',
      text: t(
        'Put the bowls in the fridge, uncovered, within 2 hours of turning off the heat. Once they are cold, cover them. Leave in the fridge for at least 8 hours, or overnight, until completely set.',
        'Pune bolurile la frigider, neacoperite, în cel mult 2 ore de la oprirea focului. Când s-au răcit, acoperă-le. Lasă-le la frigider cel puțin 8 ore, sau peste noapte, până se prind complet.',
      ),
    },
    {
      key: 'serve',
      text: t(
        'Lift the white layer of fat off the top with a spoon. Dust with the paprika, if using, and serve cold, straight from the fridge.',
        'Ridică de deasupra stratul alb de grăsime cu o lingură. Presară boia, dacă o folosești, și servește rece, direct din frigider.',
      ),
    },
  ],
  tips: [
    t(
      'Before you pour the broth over the meat, put a spoonful on a cold plate in the fridge for 10 minutes. If it turns into a soft jelly, it will set; if it stays liquid, simmer the broth uncovered to reduce it and test again. Keep the covered meat in the fridge while you reduce and retest the broth.',
      'Înainte să torni zeama peste carne, pune o lingură de zeamă pe o farfurie rece, la frigider, 10 minute. Dacă se face o gelatină moale, se va închega; dacă rămâne lichidă, fierbe zeama la foc mic, fără capac, ca să scadă, și încearcă din nou. Ține carnea acoperită la frigider cât timp reduci și retestezi zeama.',
    ),
    t(
      'Get the meat and broth into the fridge within 2 hours of taking them off the heat, in shallow bowls or dishes no more than 5 cm deep: a deep pot of broth stays warm in the middle for hours. Set it in the fridge, not on a balcony or in a cold pantry, where the temperature is not controlled.',
      'Pune carnea și zeama la frigider în cel mult 2 ore de când le-ai luat de pe foc, în boluri sau vase late, adânci de cel mult 5 cm: o oală adâncă cu zeamă rămâne caldă la mijloc ore în șir. Lasă-o să se prindă la frigider, nu pe balcon sau în cămară rece, unde temperatura nu e controlată.',
    ),
    t(
      'Keep it covered in the fridge and eat it within 3 to 4 days. Serve it straight from the fridge, and put what is left back within 2 hours.',
      'Păstrează-o acoperită la frigider și mănâncă-o în 3-4 zile. Servește-o direct din frigider și pune ce rămâne înapoi în cel mult 2 ore.',
    ),
  ],
  stepTips: [
    {
      step: 'clean',
      text: t(
        'Do not rinse raw pork: it only splashes bacteria around the sink. The blanching in the next steps does the cleaning, so no overnight soak is needed.',
        'Nu spăla carnea crudă de porc: nu face decât să împrăștie bacterii în jurul chiuvetei. Fierberea scurtă din pașii următori o curăță, deci nu e nevoie de înmuiere peste noapte.',
      ),
    },
    {
      step: 'simmer-start',
      text: t(
        'Keep the heat low: a hard boil churns the fat into the broth and makes the piftie cloudy.',
        'Ține focul mic: o fierbere tare amestecă grăsimea în zeamă și piftia iese tulbure.',
      ),
    },
    {
      step: 'salt',
      text: t(
        'Season the broth a little firmly while it is hot: cold dulls the taste of salt.',
        'Sărează zeama puțin mai apăsat cât e fierbinte: frigul estompează gustul sării.',
      ),
    },
  ],
  nutritionNote: t(
    'Mostly protein from the meat and skin, but also a lot of fat: lifting off the fat layer removes some of it, but the skin and ears are still fatty, and the broth is salty. It has almost no fibre and no real vegetables, so eat a modest portion and put something sharp and green or pickled next to it.',
    'În mare parte proteine din carne și piele, dar și multă grăsime: ridicarea stratului de grăsime scoate o parte din ea, dar pielea și urechile rămân grase, iar zeama e sărată. Aproape nu are fibre și nici legume propriu-zise, așa că mănâncă o porție moderată și pune lângă ea ceva acru, verde sau murat.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Bread', 'Pâine'),
      reason: t(
        'Fresh bread gives the cold, soft jelly something to bite against.',
        'Pâinea proaspătă oferă piftiei reci și moi un contrast la mestecat.',
      ),
      principle: 'contrast_texture',
      ingredient: 'bread',
    },
    {
      kind: 'food',
      label: t('A dash of vinegar', 'Câteva picături de oțet'),
      reason: t(
        'Some people sprinkle a little over their portion; the acidity cuts the richness of the pork.',
        'Unii stropesc porția cu puțin oțet; aciditatea taie din bogăția cărnii de porc.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'vinegar',
    },
    {
      kind: 'food',
      label: t(
        'Romanian mixed brine-fermented pickles (murături asortate)',
        'Murături asortate în saramură',
      ),
      reason: t(
        'Sharp fermented pickles cut the rich, fatty aspic.',
        'Murăturile fermentate, acre, taie din bogăția piftiei grase.',
      ),
      principle: 'acid_cuts_fat',
      recipe: 'muraturi',
    },
    {
      kind: 'food',
      label: t('Sarmale (Romanian cabbage rolls)', 'Sarmale'),
      reason: t(
        'Both are made from pork and served at the same Christmas table, the cold piftie before the hot sarmale.',
        'Ambele se fac din carne de porc și se servesc la aceeași masă de Crăciun, piftia rece înaintea sarmalelor calde.',
      ),
      principle: 'regional_tradition',
      recipe: 'sarmale',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A rich, filling dish of meat and jelly for when you want something substantial.',
        'Un preparat bogat și săturător, din carne și gelatină, pentru când vrei ceva consistent.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'Heavy and fatty, and the jelly softens quickly on a warm table.',
        'Greu și gras, iar gelatina se înmoaie repede pe o masă caldă.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'The fat and salt make a heavy meal to go to bed on.',
        'Grăsimea și sarea fac o masă grea înainte de culcare.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Fatty food digests slowly and sits heavily during exercise.',
        'Mâncarea grasă se digeră greu și te îngreunează în timpul efortului.',
      ),
    },
  ],
  variants: [
    {
      slug: 'piftie-scandinavian',
      cuisine: 'scandinavian',
      title: t(
        'Danish pressed pork brawn (sylte)',
        'Sylte (piftie daneză presată, de porc, cu ienibahar și cuișoare)',
      ),
      servings: 10,
      prepMinutes: 490,
      cookMinutes: 360,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'pork-belly',
          quantity: 600,
          unit: 'g',
          note: t('skin on if you can', 'cu piele, dacă se găsește'),
        },
        { ingredient: 'pork-shoulder', quantity: 600, unit: 'g' },
        {
          ingredient: 'pork-trotters',
          quantity: 1000,
          unit: 'g',
          note: t(
            'split lengthways by the butcher',
            'tăiate pe lung de măcelar',
          ),
        },
        {
          ingredient: 'still-water',
          quantity: 4,
          unit: 'l',
          note: t(
            'for the broth; the first boil uses extra tap water that is thrown away',
            'pentru zeamă; la prima fierbere se folosește apă de la robinet în plus, care se aruncă',
          ),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('peeled, halved', 'curățată, tăiată în două'),
        },
        { ingredient: 'peppercorns', quantity: 2, unit: 'g' },
        { ingredient: 'allspice-berries', quantity: 2, unit: 'g' },
        {
          ingredient: 'cloves',
          quantity: 0.4,
          unit: 'g',
          note: t('about 4 cloves', 'cam 4 cuișoare'),
        },
        { ingredient: 'bay-leaves', quantity: 1, unit: 'g' },
        {
          ingredient: 'salt',
          quantity: 24,
          unit: 'g',
          note: t(
            '12 g in the pot, 12 g with the spices on the meat',
            '12 g în oală, 12 g cu condimentele pe carne',
          ),
        },
        {
          ingredient: 'allspice',
          quantity: 2,
          unit: 'g',
          note: t('ground, for the meat', 'măcinat, pentru carne'),
        },
        {
          ingredient: 'white-pepper',
          quantity: 2,
          unit: 'g',
          note: t('for the meat', 'pentru carne'),
        },
      ],
      steps: [
        {
          key: 'prep-onion',
          text: t(
            'Peel and halve the onion, and set it aside; do this before you touch the raw pork.',
            'Curăță ceapa, taie-o în două și pune-o deoparte; fă asta înainte să atingi carnea crudă de porc.',
          ),
        },
        {
          key: 'clean',
          text: t(
            'On a board kept for raw meat, look the trotters over for stray bristles and scrape them off with the back of a knife, or singe them briefly over a gas flame (hair and long sleeves tied back, kitchen paper and cloths well away). Do not rinse the pork. Put the belly, shoulder and trotters in an 8 litre pot and add about 3 litres of cold tap water, enough to cover them by about 1 cm.',
            'Pe un tocător folosit doar pentru carne crudă, verifică dacă au rămas fire de păr pe picioare și răzuiește-le cu spatele cuțitului sau pârlește-le scurt deasupra unei flăcări de aragaz (cu părul și mânecile lungi strânse, iar hârtia de bucătărie și cârpele departe). Nu spăla carnea de porc. Pune pieptul, spata și picioarele într-o oală de 8 litri și adaugă cam 3 litri de apă rece de la robinet, cât să le acopere cu aproximativ 1 cm.',
          ),
        },
        {
          key: 'wash',
          text: t(
            'Wash your hands, the board, the knife and anything else that touched the raw pork with hot soapy water.',
            'Spală-ți mâinile, tocătorul, cuțitul și tot ce a atins carnea crudă cu apă fierbinte și detergent.',
          ),
        },
        {
          key: 'blanch',
          text: t(
            'Bring the pot to the boil over high heat, which takes about 25 minutes, then boil hard for 5 minutes. Grey scum will rise.',
            'Adu oala la fierbere la foc mare, ceea ce durează cam 25 de minute, apoi fierbe tare 5 minute. La suprafață va ieși o spumă cenușie.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'drain',
          text: t(
            'Turn off the heat. With tongs, lift the pork onto a clean tray. Pour away the blanching water carefully, as it is very hot, and wash the pot. Put the pork back in the pot.',
            'Oprește focul. Cu cleștele, scoate carnea pe o tavă curată. Aruncă cu grijă apa de la fiert, pentru că e fierbinte, și spală oala. Pune carnea înapoi în oală.',
          ),
        },
        {
          key: 'simmer-start',
          text: t(
            'Add about 4 litres of fresh cold water, enough to cover the pork by about 3 cm, then the onion, peppercorns, allspice berries, cloves, bay leaves and 12 g of the salt. Bring to a gentle boil over medium heat, which takes about 20 minutes, skimming off the scum with a ladle. Then turn the heat right down until only a bubble breaks the surface now and then.',
            'Adaugă cam 4 litri de apă proaspătă, rece, cât să acopere carnea cu aproximativ 3 cm, apoi ceapa, boabele de piper, boabele de ienibahar, cuișoarele, foile de dafin și 12 g din sare. Adu la fierbere ușoară la foc mediu, ceea ce durează cam 20 de minute, și ia spuma cu un polonic. Apoi dă focul la minimum, până când doar din când în când sparge suprafața câte o bulă.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Simmer for 3 hours with the lid ajar. From 2½ hours, test a piece of belly and of shoulder: they are done when a fork pierces them easily but they still hold their shape, and the trotter skin is soft. If they are not tender yet at 3 hours, simmer on and check every 15 minutes. Keep the meat covered: if the level drops, top up with boiling water from a kettle, because cold water stops the simmer.',
            'Fierbe 3 ore la foc mic, cu capacul întredeschis. De la 2 ore și jumătate, încearcă o bucată de piept și una de spată: sunt gata când furculița intră ușor în ele, dar își păstrează forma, iar pielea de la picioare e moale. Dacă nu sunt încă fragede la 3 ore, mai fierbe și verifică din 15 în 15 minute. Ține carnea acoperită: dacă nivelul scade, completează cu apă clocotită din fierbător, pentru că apa rece oprește fierberea.',
          ),
          timerSeconds: 10800,
        },
        {
          key: 'lift',
          text: t(
            'Turn off the heat. With tongs, move all the meat onto a clean tray and cover it loosely. Throw away the onion and spices with a slotted spoon, and ladle the broth through a fine sieve into a clean pot.',
            'Oprește focul. Cu cleștele, mută toată carnea pe o tavă curată și acoperă-o larg. Scoate ceapa și condimentele cu o lingură cu găuri și aruncă-le, apoi strecoară zeama cu polonicul printr-o sită deasă într-o oală curată.',
          ),
        },
        {
          key: 'reduce',
          text: t(
            'Boil the strained broth uncovered over medium-high heat until it has reduced to about 700 ml, measuring it in a jug if you are unsure; this takes about 1 hour 15 minutes. While it reduces, do the next step.',
            'Fierbe zeama strecurată, fără capac, la foc mediu-mare, până scade la aproximativ 700 ml, măsurând-o într-o carafă dacă nu ești sigur; durează cam 1 oră și 15 minute. Cât timp scade, treci la pasul următor.',
          ),
          timerSeconds: 4500,
        },
        {
          key: 'cut-meat',
          text: t(
            'While the broth reduces, take the meat, skin and soft gristle off the trotter bones and throw away the bones and hard cartilage. Cut the belly, shoulder and trotter meat into strips about 1 cm thick, and mix them in a bowl with the ground allspice, the white pepper and the remaining 12 g of salt.',
            'Cât timp zeama scade, desprinde carnea, pielea și cartilajele moi de pe oasele picioarelor și aruncă oasele și cartilajele tari. Taie pieptul, spata și carnea de la picioare în fâșii groase de cam 1 cm și amestecă-le într-un bol cu ienibaharul măcinat, piperul alb și restul de 12 g de sare.',
          ),
        },
        {
          key: 'layer',
          text: t(
            'Line two loaf tins of about 20 by 10 cm with baking paper, leaving some hanging over the sides. Lay the meat strips lengthways in the tins, alternating lean and fatty ones so each slice has both, and pack them tightly. Ladle over the reduced broth until it just covers the meat. Fill the tins no more than 5 cm deep; use a third tin if needed. Fold the paper over the top.',
            'Tapetează două forme de chec de cam 20 pe 10 cm cu hârtie de copt, lăsând o parte să atârne peste margini. Așază fâșiile de carne pe lung în forme, alternând cele slabe cu cele grase, ca fiecare felie să le aibă pe amândouă, și înghesuie-le bine. Toarnă peste ele zeama redusă, până abia acoperă carnea. Umple formele cel mult 5 cm; dacă e nevoie, folosește și o a treia formă. Îndoaie hârtia peste.',
          ),
        },
        {
          key: 'press',
          text: t(
            'Set a board or plate that fits inside each tin on top, and weigh it down with about 1 kg, such as two tins of beans. Stand the tins on a tray and put them in the fridge within 2 hours of lifting the meat out of the pot. Leave for at least 8 hours, or overnight.',
            'Pune deasupra fiecărei forme o scândură sau o farfurie care încape în ea și apasă-o cu cam 1 kg, de exemplu două conserve de fasole. Pune formele pe o tavă și la frigider în cel mult 2 ore de când ai scos carnea din oală. Lasă-le cel puțin 8 ore, sau peste noapte.',
          ),
        },
        {
          key: 'unmould',
          text: t(
            'Lift the sylte out of a tin by the overhanging paper and put it on a board. Peel off the paper and slice thinly with a sharp knife. Serve cold.',
            'Ridică sylte-ul dintr-o formă de hârtia care atârnă peste margini și pune-l pe un tocător. Scoate hârtia și taie felii subțiri cu un cuțit bine ascuțit. Servește rece.',
          ),
        },
      ],
      tips: [
        t(
          'Pack the strips in tightly and press hard: any gaps become holes in the slice and make it fall apart.',
          'Înghesuie bine fâșiile și apasă tare: golurile devin găuri în felie și o fac să se destrame.',
        ),
        t(
          'Slice it cold, with a sharp knife, and keep each slice thin; a thick slice of fatty brawn is very rich.',
          'Taie-l rece, cu un cuțit bine ascuțit, și păstrează feliile subțiri; o felie groasă de sylte gras e foarte bogată.',
        ),
      ],
      stepTips: [
        {
          step: 'layer',
          text: t(
            'Press the strips down firmly as you pack each layer: tight packing, not the direction of the grain, is what makes a slice hold together.',
            'Apasă ferm fâșiile pe măsură ce umpli fiecare strat: umplerea strânsă, nu direcția fibrelor, face ca felia să se țină.',
          ),
        },
      ],
      nutritionNote: t(
        'Plenty of protein from the pork, but belly makes it fatty, and the salt adds up; thin slices keep the portion sensible. If you serve it with sweet pickled beetroot, that adds sugar. Rye bread adds some fibre that the brawn itself lacks.',
        'Multe proteine din carnea de porc, dar pieptul îl face gras, iar sarea se adună; feliile subțiri țin porția rezonabilă. Dacă îl servești cu sfeclă murată dulce, aceasta adaugă zahăr. Pâinea de secară adaugă puține fibre, care lipsesc din sylte.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Rye bread', 'Pâine de secară'),
          reason: t(
            'Its dense, slightly sour crumb is a sturdy base for a cold slice of rich meat.',
            'Miezul ei dens, ușor acrișor, e o bază solidă pentru o felie rece de carne bogată.',
          ),
          principle: 'contrast_texture',
          ingredient: 'rye-bread',
        },
        {
          kind: 'food',
          label: t('Mustard', 'Muștar'),
          reason: t(
            'A sharp, tangy spoonful cuts the fat of the belly.',
            'O linguriță picantă și acrișoară taie din grăsimea de la piept.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'mustard',
        },
        {
          kind: 'food',
          label: t(
            'Danish pickled beetroot (syltede rødbeder)',
            'Sfeclă roșie murată, dulce-acrișoară, ca în Danemarca (syltede rødbeder)',
          ),
          reason: t(
            'The sweet-sour beetroot cuts the rich brawn on rye bread.',
            'Sfecla dulce-acrișoară taie din bogăția sylte-ului pe pâine de secară.',
          ),
          principle: 'acid_cuts_fat',
          recipe: 'salata-de-sfecla-scandinavian',
        },
      ],
      eatingMoments: [
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Fatty, salty meat is a heavy thing to eat before bed.',
            'Carnea grasă și sărată e greu de mâncat înainte de culcare.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Fatty food digests slowly and sits heavily during exercise.',
            'Mâncarea grasă se digeră greu și te îngreunează în timpul efortului.',
          ),
        },
      ],
    },
    {
      slug: 'piftie-russian',
      cuisine: 'russian',
      title: t(
        'Kholodets (Russian beef and pork aspic with horseradish and mustard)',
        'Holodeț (piftie rusească de vită și porc, cu hrean și muștar)',
      ),
      servings: 10,
      prepMinutes: 490,
      cookMinutes: 515,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'beef-feet',
          quantity: 1000,
          unit: 'g',
          note: t(
            'cut into pieces of about 5 cm by the butcher',
            'tăiate de măcelar în bucăți de cam 5 cm',
          ),
        },
        {
          ingredient: 'beef-shank',
          quantity: 1000,
          unit: 'g',
          note: t('on the bone', 'cu os'),
        },
        {
          ingredient: 'pork-trotters',
          quantity: 1000,
          unit: 'g',
          note: t(
            'split lengthways by the butcher',
            'tăiate pe lung de măcelar',
          ),
        },
        {
          ingredient: 'still-water',
          quantity: 5,
          unit: 'l',
          note: t(
            'for the broth; the first boil uses extra tap water that is thrown away',
            'pentru zeamă; la prima fierbere se folosește apă de la robinet în plus, care se aruncă',
          ),
        },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('peeled', 'curățate'),
        },
        {
          ingredient: 'carrot',
          quantity: 200,
          unit: 'g',
          note: t('peeled, left whole', 'curățați, întregi'),
        },
        { ingredient: 'peppercorns', quantity: 5, unit: 'g' },
        { ingredient: 'bay-leaves', quantity: 1, unit: 'g' },
        { ingredient: 'salt', quantity: 35, unit: 'g' },
        {
          ingredient: 'garlic',
          quantity: 40,
          unit: 'g',
          note: t('peeled, about a whole head', 'curățat, cam un cap întreg'),
        },
        {
          ingredient: 'horseradish',
          quantity: 100,
          unit: 'g',
          note: t('to serve', 'pentru servit'),
        },
        {
          ingredient: 'mustard',
          quantity: 60,
          unit: 'g',
          note: t('to serve', 'pentru servit'),
        },
      ],
      steps: [
        {
          key: 'prep-veg',
          text: t(
            'Peel the onions, the carrots and the garlic. Keep them all whole and set them aside; do this first, before you touch the raw meat.',
            'Curăță ceapa, morcovii și usturoiul. Lasă-le întregi și pune-le deoparte; fă asta primul lucru, înainte să atingi carnea crudă.',
          ),
        },
        {
          key: 'clean',
          text: t(
            'On a board kept for raw meat, look the trotters and beef feet over for stray bristles and scrape them off with the back of a knife, or singe them briefly over a gas flame (hair and long sleeves tied back, kitchen paper and cloths well away). Do not rinse the meat. Put the beef feet, beef shank and trotters into a 12 litre pot and add about 4 litres of cold tap water, enough to cover them by about 1 cm.',
            'Pe un tocător folosit doar pentru carne crudă, verifică dacă au rămas fire de păr pe picioarele de porc și de vită și răzuiește-le cu spatele cuțitului sau pârlește-le scurt deasupra unei flăcări de aragaz (cu părul și mânecile lungi strânse, iar hârtia de bucătărie și cârpele departe). Nu spăla carnea. Pune picioarele de vită, fluierul de vită și picioarele de porc într-o oală de 12 litri și adaugă cam 4 litri de apă rece de la robinet, cât să le acopere cu aproximativ 1 cm.',
          ),
        },
        {
          key: 'wash',
          text: t(
            'Wash your hands, the board, the knife and anything else that touched the raw meat with hot soapy water.',
            'Spală-ți mâinile, tocătorul, cuțitul și tot ce a atins carnea crudă cu apă fierbinte și detergent.',
          ),
        },
        {
          key: 'blanch',
          text: t(
            'Bring the pot to the boil over high heat, which takes about 25 minutes, then boil hard for 10 minutes. Grey scum will rise.',
            'Adu oala la fierbere la foc mare, ceea ce durează cam 25 de minute, apoi fierbe tare 10 minute. La suprafață va ieși o spumă cenușie.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'drain',
          text: t(
            'Turn off the heat. With tongs, lift the meat onto a clean tray or into a large bowl. Pour away the blanching water carefully, as it is very hot, and wash the pot. Put the meat back in the pot.',
            'Oprește focul. Cu cleștele, scoate carnea pe o tavă curată sau într-un castron mare. Aruncă cu grijă apa de la fiert, pentru că e fierbinte, și spală oala. Pune carnea înapoi în oală.',
          ),
        },
        {
          key: 'simmer-start',
          text: t(
            'Add about 5 litres of fresh cold water, enough to cover the meat by about 3 cm, then the onions, peppercorns and bay leaves. Bring to a gentle boil over medium heat, which takes about 25 minutes, skimming off the scum with a ladle. Then turn the heat right down until only a bubble breaks the surface now and then.',
            'Adaugă cam 5 litri de apă proaspătă, rece, cât să acopere carnea cu aproximativ 3 cm, apoi ceapa, boabele de piper și foile de dafin. Adu la fierbere ușoară la foc mediu, ceea ce durează cam 25 de minute, și ia spuma cu un polonic. Apoi dă focul la minimum, până când doar din când în când sparge suprafața câte o bulă.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Simmer for 5 hours with the lid ajar. Keep the meat covered: if the level drops, top up with boiling water from a kettle, because cold water stops the simmer.',
            'Fierbe 5 ore la foc mic, cu capacul întredeschis. Ține carnea acoperită: dacă nivelul scade, completează cu apă clocotită din fierbător, pentru că apa rece oprește fierberea.',
          ),
          timerSeconds: 18000,
        },
        {
          key: 'salt',
          text: t(
            'Add the carrots and the salt, and simmer for 1 more hour, until the beef shank is so tender that it falls apart when pushed with a fork, and the skin of the feet is soft and the tendons come away from the bone. If it is not that tender yet, lift out the carrots first, then simmer on and check every 15 minutes.',
            'Adaugă morcovii și sarea și fierbe încă o oră, până când fluierul de vită e atât de fraged că se desface când îl apeși cu furculița, iar pielea de la picioare e moale și tendoanele se desprind de pe os. Dacă nu e încă atât de fraged, scoate mai întâi morcovii, apoi mai fierbe și verifică din 15 în 15 minute.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'strain',
          text: t(
            'Turn off the heat. Lift out and throw away the onions, and put the carrots on a plate. With tongs, move the meat onto a clean tray. Ladle the broth through a fine sieve into a large clean bowl or pot.',
            'Oprește focul. Scoate și aruncă ceapa, iar morcovii pune-i pe o farfurie. Cu cleștele, mută carnea pe o tavă curată. Strecoară zeama cu polonicul printr-o sită deasă într-un castron sau o oală mare, curate.',
          ),
        },
        {
          key: 'pick',
          text: t(
            'Once the meat is cool enough to handle but still warm, use tongs or forks to pull the beef shank meat apart along the grain into shreds. Strip the meat, skin and soft gristle off the other bones. Throw away the bones, hard cartilage and any hairs, and cut the skin and gristle of the feet and trotters into pieces of 1 to 2 cm; leave the shank in shreds. Slice the carrots into rounds.',
            'Când carnea s-a răcit cât s-o poți atinge, dar e încă caldă, desfă carnea de la fluierul de vită în fire, pe direcția fibrelor. Desprinde carnea, pielea și cartilajele moi de pe celelalte oase. Aruncă oasele, cartilajele tari și orice fir de păr și taie pielea și cartilajele moi de la picioare în bucăți de 1–2 cm; fluierul lasă-l în fire. Taie morcovii în rondele.',
          ),
        },
        {
          key: 'divide',
          text: t(
            'Lay a few carrot rounds in the bottom of 10 shallow bowls, or 3 to 4 wide dishes no more than 5 cm deep. Divide the meat between them.',
            'Pune câteva rondele de morcov pe fundul a 10 boluri late, sau în 3-4 vase late, adânci de cel mult 5 cm. Împarte carnea între ele.',
          ),
        },
        {
          key: 'garlic',
          text: t(
            'While the broth is still warm, press the garlic into it and stir. Taste and add salt if it needs it. Ladle the broth over the meat so that it is covered by about 1 cm.',
            'Cât timp zeama e încă caldă, stoarce usturoiul în ea cu storcătorul și amestecă. Gustă și adaugă sare dacă mai are nevoie. Toarnă zeama peste carne, ca să o acopere cu aproximativ 1 cm.',
          ),
        },
        {
          key: 'chill',
          text: t(
            'Put the bowls in the fridge, uncovered, within 2 hours of turning off the heat. Once they are cold, cover them. Leave in the fridge for at least 8 hours, or overnight, until completely set.',
            'Pune bolurile la frigider, neacoperite, în cel mult 2 ore de la oprirea focului. Când s-au răcit, acoperă-le. Lasă-le la frigider cel puțin 8 ore, sau peste noapte, până se prind complet.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Lift the white layer of fat off the top with a spoon and serve cold, straight from the fridge, with horseradish and mustard.',
            'Ridică de deasupra stratul alb de grăsime cu o lingură și servește rece, direct din frigider, cu hrean și muștar.',
          ),
        },
      ],
      tips: [
        t(
          'Ask the butcher to cut the beef feet into pieces of about 5 cm: they fit the pot better and give up their gelatine more easily.',
          'Roagă măcelarul să taie picioarele de vită în bucăți de cam 5 cm: încap mai bine în oală și își dau mai ușor gelatina.',
        ),
        t(
          'Mustard is an allergen. If you buy jarred horseradish, check its label too: some brands add other ingredients, such as cream, mustard or sulphites.',
          'Muștarul este un alergen. Dacă iei hrean din borcan, citește și eticheta lui: unele mărci adaugă alte ingrediente, de exemplu smântână, muștar sau sulfiți.',
        ),
      ],
      stepTips: [
        {
          step: 'pick',
          text: t(
            'Shredding the shank along the grain gives the finished aspic a good bite instead of a mush of small cubes.',
            'Fluierul desfăcut în fire pe direcția fibrelor dă piftiei o textură plăcută, nu un terci de cubulețe mici.',
          ),
        },
      ],
      nutritionNote: t(
        'Plenty of protein from the beef and pork, but lifting off the fat layer removes only some of the fat: the skin of the feet and trotters is still fatty, and the broth is salty. Horseradish and mustard add flavour for little fat; there is almost no fibre, so add pickles or a vegetable salad.',
        'Multe proteine din carnea de vită și de porc, dar ridicarea stratului de grăsime scoate doar o parte din grăsime: pielea de la picioare rămâne grasă, iar zeama e sărată. Hreanul și muștarul dau gust cu puțină grăsime; aproape nu are fibre, așa că adaugă murături sau o salată de legume.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Rye bread', 'Pâine de secară'),
          reason: t(
            'Its dense, slightly sour crumb gives the soft jelly something to bite against.',
            'Miezul ei dens, ușor acrișor, oferă piftiei moi un contrast la mestecat.',
          ),
          principle: 'contrast_texture',
          ingredient: 'rye-bread',
        },
        {
          kind: 'food',
          label: t(
            'Vinegret (Russian beetroot, potato and pickle salad)',
            'Vinegret (salată de sfeclă, cartofi și castraveți murați, ca în Rusia)',
          ),
          reason: t(
            'Both are cold dishes on the same New Year table; the sharp salad sets off the aspic.',
            'Ambele sunt preparate reci de pe aceeași masă de Anul Nou; salata acrișoară pune în valoare piftia.',
          ),
          principle: 'regional_tradition',
          recipe: 'salata-de-sfecla-russian',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A rich, filling dish of beef, pork and jelly for when you want something substantial.',
            'Un preparat bogat și săturător, din vită, porc și gelatină, pentru când vrei ceva consistent.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'The fat and salt make a heavy meal to go to bed on.',
            'Grăsimea și sarea fac o masă grea înainte de culcare.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Fatty food digests slowly and sits heavily during exercise.',
            'Mâncarea grasă se digeră greu și te îngreunează în timpul efortului.',
          ),
        },
      ],
    },
  ],
};
