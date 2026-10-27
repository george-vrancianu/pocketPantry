import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Ciorbă ardelenească base is the Transylvanian pork sour soup: diced fresh
// pork simmered until tender, diced roots and potato, soured with vinegar once
// the potatoes are done, scented with tarragon and finished with a yolk and sour
// cream liaison. Each Variant is a full Recipe with its own lines, steps and
// guidance; the base's Recipe-level Tips are inherited unless hidden.
export const ciorbaArdeleneasca: BaseRecipeSeed = {
  slug: 'ciorba-ardeleneasca',
  title: t(
    'Transylvanian pork sour soup with tarragon and sour cream (ciorbă ardelenească)',
    'Ciorbă ardelenească de porc cu tarhon',
  ),
  servings: 6,
  prepMinutes: 30,
  cookMinutes: 115,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'pork-shoulder',
      quantity: 700,
      unit: 'g',
      note: t('diced into 3 cm cubes', 'tăiată cuburi de 3 cm'),
    },
    { ingredient: 'still-water', quantity: 2.2, unit: 'l' },
    {
      ingredient: 'salt',
      key: 'salt-stock',
      quantity: 10,
      unit: 'g',
      note: t('for the pork', 'pentru carne'),
    },
    {
      ingredient: 'salt',
      key: 'salt-end',
      quantity: 8,
      unit: 'g',
      note: t(
        'to finish; about 8 g, adjust to taste',
        'la final; cam 8 g, ajustează după gust',
      ),
    },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('finely diced', 'tăiate mărunt'),
    },
    {
      ingredient: 'carrot',
      quantity: 150,
      unit: 'g',
      note: t('diced small', 'tăiat cubulețe'),
    },
    {
      ingredient: 'parsley-root',
      quantity: 60,
      unit: 'g',
      note: t('diced small', 'tăiată cubulețe'),
    },
    {
      ingredient: 'celeriac',
      quantity: 100,
      unit: 'g',
      note: t('peeled, diced small', 'curățată, tăiată cubulețe'),
    },
    {
      ingredient: 'bell-pepper',
      quantity: 1,
      unit: 'pcs',
      note: t('red, seeded, diced small', 'roșu, fără semințe, tăiat cubulețe'),
    },
    { ingredient: 'sunflower-oil', quantity: 40, unit: 'ml' },
    {
      ingredient: 'potato',
      quantity: 600,
      unit: 'g',
      note: t('peeled, in 2 cm cubes', 'curățați, tăiați cubulețe de 2 cm'),
    },
    {
      ingredient: 'bay-leaves',
      quantity: 1,
      unit: 'g',
      note: t('about 5 leaves', 'cam 5 foi'),
    },
    {
      ingredient: 'vinegar',
      quantity: 60,
      unit: 'ml',
      note: t('first pour', 'pentru început'),
    },
    {
      ingredient: 'vinegar',
      key: 'vinegar-extra',
      quantity: 40,
      unit: 'ml',
      optional: true,
      note: t('extra, added to taste', 'în plus, adăugat după gust'),
    },
    {
      ingredient: 'tarragon',
      quantity: 15,
      unit: 'g',
      note: t('fresh, finely chopped', 'proaspăt, tocat mărunt'),
    },
    {
      ingredient: 'eggs',
      quantity: 3,
      unit: 'pcs',
      note: t(
        'yolks only; keep the whites for another dish',
        'doar gălbenușurile; păstrează albușurile pentru altă mâncare',
      ),
    },
    {
      ingredient: 'sour-cream',
      quantity: 200,
      unit: 'g',
      note: t('for the egg liaison', 'pentru dreasă'),
    },
    { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
    {
      ingredient: 'hot-pepper',
      quantity: 1,
      unit: 'pcs',
      optional: true,
      note: t('fresh, for the table', 'proaspăt, pentru masă'),
    },
  ],
  steps: [
    {
      key: 'prep',
      text: t(
        'Before you touch the pork, wash and finely chop the tarragon and keep it in the fridge. Dice the onions, carrot, parsley root, celeriac and bell pepper, and peel and cube the potatoes. Cover the potatoes with cold water.',
        'Înainte să atingi carnea de porc, spală și toacă mărunt tarhonul și ține-l la frigider. Taie cubulețe ceapa, morcovul, rădăcina de pătrunjel, țelina și ardeiul și curăță și taie cuburi cartofii. Acoperă cartofii cu apă rece.',
      ),
    },
    {
      key: 'start',
      text: t(
        'Dice the pork into 3 cm cubes and put it in a 6 l pot, then cover it with the 2.2 l of cold water. Do not rinse the raw pork. Wash your hands, the board, the knife and the plate or packaging the raw pork sat on with hot soapy water.',
        'Taie carnea de porc în cuburi de 3 cm și pune-o într-o oală de 6 l, apoi acoper-o cu cei 2,2 l de apă rece. Nu spăla carnea crudă. Spală-ți mâinile, tocătorul, cuțitul și farfuria sau ambalajul pe care a stat carnea crudă cu apă caldă și săpun.',
      ),
    },
    {
      key: 'boil',
      text: t(
        'Set the pot over medium-high heat and bring it slowly to the boil, about 20 minutes. Grey scum rises as the meat heats.',
        'Pune oala la foc potrivit-mare și adu încet la fierbere, cam 20 de minute. Pe măsură ce carnea se încălzește, la suprafață se strânge spumă cenușie.',
      ),
    },
    {
      key: 'skim',
      text: t(
        'Turn the heat down so the water only trembles. Skim off the scum with a ladle or a slotted spoon for the first 10 minutes, until little new scum rises.',
        'Scade focul, să clocotească abia vizibil. Ia spuma cu polonicul sau cu spumiera în primele 10 minute, până nu se mai adună spumă nouă.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'simmer',
      text: t(
        'Add the 10 g of salt and the bay leaves, partly cover the pot and simmer very gently for 50 minutes, until the pork is nearly tender. If it is still firm, simmer on and check every 15 minutes.',
        'Adaugă cele 10 g de sare și foile de dafin, acoperă oala pe jumătate și fierbe foarte domol 50 de minute, până când carnea e aproape fragedă. Dacă e încă tare, mai las-o la fiert și verific-o din 15 în 15 minute.',
      ),
      timerSeconds: 3000,
    },
    {
      key: 'sweat',
      text: t(
        'While the pork simmers, heat the oil in a wide pan over medium heat. Add the onions, carrot, parsley root, celeriac and bell pepper and cook for 10 minutes, stirring, until soft but not browned.',
        'În timp ce carnea fierbe, încinge uleiul într-o tigaie lată la foc mediu. Adaugă ceapa, morcovul, rădăcina de pătrunjel, țelina și ardeiul și călește 10 minute, amestecând, până se înmoaie, fără să se rumenească.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'veg',
      text: t(
        'Scrape the softened vegetables into the pot and simmer for 10 minutes, until the carrot is nearly tender.',
        'Răstoarnă legumele călite în oală și fierbe 10 minute, până când morcovul e aproape fraged.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'potatoes',
      text: t(
        'Drain the potatoes, add them to the pot and simmer for 15 minutes, until a knife slides into a cube with no resistance and the pork is tender. If the pork is still firm, simmer on and check every 10 minutes before adding the vinegar.',
        'Scurge cartofii, pune-i în oală și fierbe 15 minute, până când un cuțit intră într-un cub fără rezistență și carnea e fragedă. Dacă carnea e încă tare, mai fierbe și verific-o din 10 în 10 minute înainte să pui oțetul.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'sour',
      text: t(
        'Pour in 60 ml of the vinegar and the tarragon and simmer for 3 minutes. Taste, then add up to 40 ml more vinegar, a little at a time, until the soup is as sour as you like. Add the last 8 g of salt, or as much as it needs, and the pepper if it needs them.',
        'Toarnă 60 ml de oțet și adaugă tarhonul și fierbe 3 minute. Gustă, apoi adaugă treptat până la 40 ml de oțet în plus, până când ciorba e atât de acră cât îți place. Adaugă ultimele 8 g de sare, sau cât mai are nevoie, și piperul, dacă mai trebuie.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'liaison',
      text: t(
        'Take the pot off the heat and let it stop bubbling. Separate the eggs, cover the whites and keep them in the fridge. In a bowl, whisk the yolks with the sour cream. Whisking all the time, add 3 ladles of the hot soup, one at a time. Stir the mixture back into the pot, then put it over the lowest heat and stir for 1 to 2 minutes, until slightly thickened and steaming hot but not boiling. Wash your hands after handling the eggs.',
        'Ia oala de pe foc și așteaptă să nu mai clocotească. Separă ouăle, acoperă albușurile și păstrează-le la frigider. Într-un castron, amestecă gălbenușurile cu smântâna. Amestecând întruna, adaugă pe rând 3 polonice de supă fierbinte. Toarnă amestecul înapoi în oală, pune-o la cel mai mic foc și amestecă 1-2 minute, până se îngroașă ușor și scoate aburi, fără să fiarbă. Spală-te pe mâini după ce ai lucrat cu ouăle.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'finish',
      text: t(
        'Serve hot, with a slice of fresh hot pepper at the table, if you like.',
        'Servește fierbinte, cu o felie de ardei iute proaspăt la masă, dacă vrei.',
      ),
    },
    {
      key: 'store',
      text: t(
        'Cool leftovers within 2 hours, put them in the fridge and eat them within 3 days. Reheat gently, stirring, until steaming hot; do not let it boil, because the egg thickening splits.',
        'Răcește ciorba rămasă în maximum 2 ore, pune-o la frigider și mănânc-o în cel mult 3 zile. Reîncălzește-o domol, amestecând, până scoate aburi; nu o lăsa să fiarbă, pentru că dreasa se taie.',
      ),
    },
  ],
  tips: [
    t(
      'Keep the meat at a lazy simmer, with a bubble breaking the surface now and then. A hard boil clouds the broth and toughens the meat.',
      'Ține carnea la un clocot leneș, cu câte o bulă care sparge din când în când suprafața. Fierberea tare tulbură supa și întărește carnea.',
    ),
    t(
      'Add the vinegar a little at a time and taste after each pour: brands differ in strength. Put it in only once the potatoes are tender, because acid keeps them firm.',
      'Adaugă oțetul treptat și gustă după fiecare turnare: mărcile diferă ca tărie. Pune-l abia după ce cartofii sunt fragezi, pentru că aciditatea îi ține tari.',
    ),
    t(
      'Once the egg liaison is in, the soup must not boil again: it curdles. If you want to make the soup ahead, stop before the vinegar and tarragon, cool it within 2 hours and keep it in the fridge for up to 3 days. On the day, bring it back to the boil, then carry on from the vinegar step.',
      'După ce ai pus dreasa, ciorba nu mai are voie să fiarbă: se taie. Dacă vrei s-o pregătești dinainte, oprește-te înainte de oțet și de tarhon, răcește supa în maximum 2 ore și păstreaz-o la frigider cel mult 3 zile. În ziua servirii, adu-o din nou la fierbere, apoi continuă de la pasul cu oțetul.',
    ),
  ],
  stepTips: [
    {
      step: 'liaison',
      text: t(
        'The yolks are only heated until the soup thickens. If you serve anyone pregnant, elderly, unwell or very young, keep the soup steaming hot, just below a simmer, for the full 2 minutes.',
        'Gălbenușurile se încălzesc doar până când ciorba se îngroașă. Dacă servești femei însărcinate, persoane în vârstă sau bolnave ori copii mici, ține ciorba fierbinte, care scoate aburi, chiar sub fierbere, cele 2 minute întregi.',
      ),
    },
    {
      step: 'liaison',
      text: t(
        'Adding the hot soup to the yolks gradually warms them, so they do not scramble when they meet the pot.',
        'Dacă adaugi supa fierbinte treptat peste gălbenușuri, acestea se încălzesc treptat și nu se taie când ajung în oală.',
      ),
    },
    {
      step: 'sour',
      text: t(
        'Tarragon loses its scent if it cooks long, so it only gets the last few minutes.',
        'Tarhonul își pierde parfumul dacă fierbe mult, așa că primește doar ultimele minute.',
      ),
    },
  ],
  nutritionNote: t(
    'Pork gives protein, and the roots and potato make it a filling one-pot meal with some fibre. Shoulder is fatty, so skim the fat from the surface; the yolks and sour cream add saturated fat, and salt adds up quickly, so season to taste rather than by habit. Potato adds starchy carbohydrate.',
    'Carnea de porc aduce proteine, iar rădăcinoasele și cartofii fac din ciorbă o masă săturătoare dintr-o singură oală, cu ceva fibre. Spata este grasă, așa că ia grăsimea de la suprafață; gălbenușurile și smântâna aduc grăsimi saturate, iar sarea se adună repede, așa că sărează după gust, nu din obișnuință. Cartofii aduc carbohidrați amidonoși.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Fresh bread', 'Pâine proaspătă'),
      reason: t(
        'A crusty slice soaks up the sour broth and gives the soft pork and potato something to bite against.',
        'O felie cu crustă se îmbibă cu supa acrișoară și oferă cărnii de porc și cartofilor moi un contrast la mestecat.',
      ),
      principle: 'contrast_texture',
      ingredient: 'bread',
    },
    {
      kind: 'food',
      label: t('Pickled hot peppers', 'Ardei iuți murați'),
      reason: t(
        'A bite of sharp, vinegary heat between spoonfuls refreshes the palate after the fatty pork.',
        'O îmbucătură de ardei iute murat, acrișor și picant, între linguri împrospătează gustul după carnea grasă de porc.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'pickled-peppers',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot, sour pork soup with potato warms you through.',
        'O ciorbă fierbinte și acrișoară de porc, cu cartofi, te încălzește bine.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Protein from the pork, carbohydrate from the potato and plenty of warm liquid.',
        'Proteine din carnea de porc, carbohidrați din cartofi și multe lichide calde.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A large, rich bowl of pork soup can sit heavy before bed.',
        'Un castron mare de supă bogată cu porc poate cădea greu înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'ciorba-ardeleneasca-russian',
      cuisine: 'russian',
      title: t(
        'Solyanka (Russian mixed-meat soup with pickles, olives and lemon)',
        'Solianka (supă rusească cu mai multe feluri de carne, castraveți murați, măsline și lămâie)',
      ),
      servings: 6,
      prepMinutes: 25,
      cookMinutes: 195,
      difficulty: 'medium',
      hideBaseTips: [1, 2],
      lines: [
        {
          ingredient: 'beef-brisket',
          quantity: 500,
          unit: 'g',
          note: t('in 2 pieces', 'în 2 bucăți'),
        },
        { ingredient: 'still-water', quantity: 2.5, unit: 'l' },
        {
          ingredient: 'onion',
          key: 'onion-stock',
          quantity: 1,
          unit: 'pcs',
          note: t('halved, for the broth', 'tăiată în două, pentru supă'),
        },
        {
          ingredient: 'onion',
          key: 'onion-fry',
          quantity: 2,
          unit: 'pcs',
          note: t('finely diced, to fry', 'tăiate mărunt, pentru călit'),
        },
        {
          ingredient: 'peppercorns',
          quantity: 4,
          unit: 'g',
          note: t('whole, for the broth', 'boabe, pentru supă'),
        },
        {
          ingredient: 'bay-leaves',
          quantity: 1,
          unit: 'g',
          note: t('about 5 leaves', 'cam 5 foi'),
        },
        {
          ingredient: 'salt',
          quantity: 5,
          unit: 'g',
          note: t('for the beef', 'pentru carne'),
        },
        {
          ingredient: 'salt',
          key: 'salt-end',
          optional: true,
          note: t(
            'to taste, only if the soup needs it',
            'după gust, doar dacă ciorba mai are nevoie',
          ),
        },
        {
          ingredient: 'ham',
          quantity: 150,
          unit: 'g',
          note: t('cut in strips', 'tăiată fâșii'),
        },
        {
          ingredient: 'smoked-sausages',
          quantity: 200,
          unit: 'g',
          note: t('sliced 5 mm thick', 'tăiați felii de 5 mm'),
        },
        {
          ingredient: 'frankfurters',
          quantity: 150,
          unit: 'g',
          optional: true,
          note: t('sliced 5 mm thick', 'tăiați felii de 5 mm'),
        },
        {
          ingredient: 'butter',
          quantity: 30,
          unit: 'g',
        },
        {
          ingredient: 'tomato-paste',
          quantity: 40,
          unit: 'g',
        },
        {
          ingredient: 'pickled-cucumbers',
          quantity: 250,
          unit: 'g',
          note: t(
            'salty-sour, in strips; keep about 200 ml of the jar brine: 150 ml go in at once, the rest to taste',
            'sărate și acrișoare, tăiate fâșii; păstrează cam 200 ml din zeama din borcan: 150 ml intră deodată, restul după gust',
          ),
        },
        {
          ingredient: 'olives',
          quantity: 100,
          unit: 'g',
          note: t('pitted, halved', 'fără sâmburi, tăiate în două'),
        },
        {
          ingredient: 'capers',
          quantity: 30,
          unit: 'g',
        },
        {
          ingredient: 'dill',
          quantity: 20,
          unit: 'g',
          note: t('finely chopped, to finish', 'tocat mărunt, la final'),
        },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t('6 thin slices, to serve', '6 felii subțiri, pentru servit'),
        },
        {
          ingredient: 'sour-cream',
          quantity: 150,
          unit: 'g',
          note: t('a spoonful per bowl', 'o lingură în fiecare castron'),
        },
      ],
      steps: [
        {
          key: 'prep',
          text: t(
            'Before you touch the beef, wash and finely chop the dill and cut the lemon into 6 thin slices. Cut the pickled cucumbers into strips, halve the olives, and slice the ham, sausage and frankfurters. Dice the 2 onions for frying. Keep the ham and sausages together on a plate in the fridge.',
            'Înainte să atingi carnea de vită, spală și toacă mărunt mărarul și taie lămâia în 6 felii subțiri. Taie castraveții murați fâșii, taie măslinele în două și taie felii șunca, cârnații și crenvurștii. Taie mărunt cele 2 cepe pentru călit. Ține șunca și cârnații împreună, pe o farfurie, la frigider.',
          ),
        },
        {
          key: 'start',
          text: t(
            'Put the beef in a 5 l pot with the halved onion, peppercorns and bay leaves. Cover with the 2.5 l of cold water. Do not rinse the raw beef. Wash your hands and the plate or packaging the raw beef sat on with hot soapy water.',
            'Pune carnea de vită într-o oală de 5 l, cu ceapa tăiată în două, boabele de piper și foile de dafin. Acoper-o cu cei 2,5 l de apă rece. Nu spăla carnea crudă. Spală-ți mâinile și farfuria sau ambalajul pe care a stat carnea de vită crudă cu apă caldă și săpun.',
          ),
        },
        {
          key: 'boil',
          text: t(
            'Set the pot over medium-high heat and bring it slowly to the boil, about 20 minutes. Grey scum rises as the meat heats.',
            'Pune oala la foc potrivit-mare și adu încet la fierbere, cam 20 de minute. Pe măsură ce carnea se încălzește, la suprafață se strânge spumă cenușie.',
          ),
        },
        {
          key: 'skim',
          text: t(
            'Turn the heat down so the water only trembles. Skim off the scum with a ladle or a slotted spoon for the first 10 minutes, until little new scum rises.',
            'Scade focul, să clocotească abia vizibil. Ia spuma cu polonicul sau cu spumiera în primele 10 minute, până nu se mai adună spumă nouă.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'simmer',
          text: t(
            'Add the 5 g of salt, partly cover the pot and simmer very gently for 2 hours, until a fork slides into the beef with little resistance. If it is still firm, simmer on and check every 15 minutes.',
            'Adaugă cele 5 g de sare, acoperă oala pe jumătate și fierbe foarte domol 2 ore, până când furculița intră în carne cu puțină rezistență. Dacă e încă tare, mai las-o la fiert și verific-o din 15 în 15 minute.',
          ),
          timerSeconds: 7200,
        },
        {
          key: 'strain',
          text: t(
            'Lift the beef onto a clean board and set a sieve over a large bowl. Pour the broth through it, then discard the onion, peppercorns and bay leaves. Return the clear broth to the pot, about 2 l. Cut the beef into 2 cm pieces and add them to the broth. Wash the board and knife.',
            'Scoate carnea de vită pe un tocător curat și pune o strecurătoare peste un castron mare. Toarnă supa prin ea, apoi aruncă ceapa, boabele de piper și foile de dafin. Pune supa limpede înapoi în oală, cam 2 l. Taie carnea în bucăți de 2 cm și adaug-o în supă. Spală tocătorul și cuțitul.',
          ),
        },
        {
          key: 'fry',
          text: t(
            'Melt the butter in a wide pan over medium heat. Add the diced onions and cook for 8 minutes, stirring, until soft and golden.',
            'Topește untul într-o tigaie lată la foc mediu. Adaugă ceapa tăiată mărunt și călește 8 minute, amestecând, până se înmoaie și devine aurie.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'paste',
          text: t(
            'Stir in the tomato paste and cook for 2 minutes, stirring, until it darkens a shade and smells sweet.',
            'Adaugă pasta de roșii și călește 2 minute, amestecând, până se închide puțin la culoare și miroase dulceag.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'combine',
          text: t(
            'Scrape the onion and tomato mixture into the pot. Add the pickled cucumbers and 150 ml of their brine. Bring back to a simmer and cook for 10 minutes.',
            'Răstoarnă ceapa cu pasta de roșii în oală. Adaugă castraveții murați și 150 ml din zeama lor. Adu din nou la fierbere domoală și lasă 10 minute.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'meats',
          text: t(
            'Add the ham, smoked sausage and frankfurters and simmer for 10 minutes. Lift out one slice of sausage and cut it in half: it must be firm and steaming hot right through (71 °C). If it is not, simmer a few minutes more.',
            'Adaugă șunca, cârnații afumați și crenvurștii și fierbe 10 minute. Scoate o felie de cârnat și taie-o în două: trebuie să fie fermă și fierbinte, cu aburi, în toată grosimea (71 °C). Dacă nu e, mai fierbe câteva minute.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'olives',
          text: t(
            'Add the olives and capers and simmer for 3 minutes. Taste: the pickles, brine, olives and cured meats are already salty, so add salt only if it needs it, or a splash more of the kept brine (up to 50 ml) if it is not sour enough.',
            'Adaugă măslinele și caperele și fierbe 3 minute. Gustă: castraveții, zeama, măslinele și cărnurile afumate sunt deja sărate, așa că pune sare doar dacă mai are nevoie sau un strop din zeama păstrată (până la 50 ml) dacă nu e destul de acră.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'serve',
          text: t(
            'Turn off the heat and stir in the dill. Ladle the soup into bowls and top each with a slice of lemon and a spoonful of sour cream.',
            'Oprește focul și amestecă mărarul. Pune supa în castroane și adaugă în fiecare o felie de lămâie și o lingură de smântână.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Cool leftovers within 2 hours, put them in the fridge without the lemon and sour cream, and eat them within 3 days. Reheat until steaming hot.',
            'Răcește supa rămasă în maximum 2 ore, pune-o la frigider fără lămâie și smântână și mănânc-o în cel mult 3 zile. Reîncălzește-o până scoate aburi.',
          ),
        },
      ],
      tips: [
        t(
          'Use salty-sour pickled cucumbers, not sweet gherkins, and taste the soup before you add any salt. The sourness comes from the cucumbers, brine and lemon, and the saltiness from the cured meats, olives and capers.',
          'Folosește castraveți murați sărați și acrișori, nu cornișoni dulci, și gustă supa înainte să pui sare. Aciditatea vine de la castraveți, zeamă și lămâie, iar sarea de la cărnurile afumate, măsline și capere.',
        ),
        t(
          'Check the labels of the sausages and frankfurters: many contain milk, soya or wheat.',
          'Citește etichetele cârnaților și crenvurștilor: mulți conțin lapte, soia sau grâu.',
        ),
        t(
          'Simmer the sausage and ham just until a cut slice is steaming hot right through; longer only dulls their smoke into the broth.',
          'Fierbe cârnații și șunca doar până când o felie tăiată scoate aburi în toată grosimea; mai mult doar slăbește aroma lor afumată în supă.',
        ),
      ],
      stepTips: [
        {
          step: 'paste',
          text: t(
            'Frying the paste in the butter takes away its raw, tinny edge and gives the soup its deep orange-red colour.',
            'Dacă prăjești pasta în unt, pierde gustul crud, metalic și dă supei culoarea portocalie-roșiatică intensă.',
          ),
        },
      ],
      nutritionNote: t(
        'Beef and several meats make it high in protein, but ham, smoked sausage, olives, capers and pickle brine make it very salty, and the sausages and sour cream add saturated fat. There is no starch in the pot, so serve it with rye bread if you want it filling.',
        'Carnea de vită și celelalte feluri de carne o fac bogată în proteine, dar șunca, cârnații afumați, măslinele, caperele și zeama de murături o fac foarte sărată, iar cârnații și smântâna aduc grăsimi saturate. Nu are amidon în oală, așa că servește-o cu pâine de secară dacă vrei s-o faci mai săturătoare.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Rye bread', 'Pâine de secară'),
          reason: t(
            'Its dense, slightly sour crumb soaks up the salty, tangy broth and makes the soup a full meal.',
            'Miezul ei des, ușor acrișor, se îmbibă cu supa sărată și acrișoară și face din supă o masă completă.',
          ),
          principle: 'complement_flavour',
          ingredient: 'rye-bread',
        },
        {
          kind: 'drink',
          label: t('Kvass', 'Kvas'),
          reason: t(
            'Its gentle sourness and bubbles refresh the palate between spoonfuls of the salty broth.',
            'Aciditatea lui blândă și bulele împrospătează gustul între linguri de supă sărată.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'kvass',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, tangy, meaty soup warms you through.',
            'O supă fierbinte, acrișoară și cu multă carne te încălzește bine.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'The cured meats and brine make it salty and heavy before bed.',
            'Cărnurile afumate și zeama o fac sărată și grea înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'ciorba-ardeleneasca-japanese',
      cuisine: 'japanese',
      title: t(
        'Tonjiru (Japanese pork and root vegetable miso soup)',
        'Tonjiru (supă japoneză cu porc, legume rădăcinoase și miso)',
      ),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 35,
      difficulty: 'easy',
      hideBaseTips: [0, 1, 2],
      lines: [
        {
          ingredient: 'pork-belly',
          quantity: 250,
          unit: 'g',
          note: t(
            'sliced thin (2 to 3 mm), cut in 4 cm pieces',
            'tăiat felii subțiri (2-3 mm), apoi bucăți de 4 cm',
          ),
        },
        { ingredient: 'sesame-oil', quantity: 15, unit: 'ml' },
        {
          ingredient: 'daikon',
          quantity: 250,
          unit: 'g',
          note: t(
            'peeled, in thin half-moons',
            'curățată, tăiată semiluni subțiri',
          ),
        },
        {
          ingredient: 'carrot',
          quantity: 120,
          unit: 'g',
          note: t('in thin half-moons', 'tăiat semiluni subțiri'),
        },
        {
          ingredient: 'potato',
          quantity: 200,
          unit: 'g',
          note: t('peeled, in 2 cm cubes', 'curățați, tăiați cubulețe de 2 cm'),
        },
        { ingredient: 'still-water', quantity: 1.2, unit: 'l' },
        {
          ingredient: 'dashi',
          quantity: 8,
          unit: 'g',
          note: t(
            'about 2 level teaspoons; follow the pack if its ratio differs',
            'cam 2 lingurițe rase; urmează ambalajul dacă proporția e alta',
          ),
        },
        {
          ingredient: 'tofu',
          quantity: 200,
          unit: 'g',
          note: t('firm, in 2 cm cubes', 'ferm, tăiat cuburi de 2 cm'),
        },
        {
          ingredient: 'miso',
          quantity: 80,
          unit: 'g',
          note: t(
            'dissolve 60 g first, then add the rest to taste',
            'dizolvă mai întâi 60 g, apoi adaugă restul după gust',
          ),
        },
        {
          ingredient: 'spring-onion',
          quantity: 40,
          unit: 'g',
          note: t('sliced thin, to finish', 'tăiată subțire, la final'),
        },
      ],
      steps: [
        {
          key: 'prep',
          text: t(
            'Slice the spring onion thin and set it aside. Peel the daikon and slice it into thin half-moons, slice the carrot into half-moons of the same thickness, peel and cube the potato, and cube the tofu. Cut the pork belly slices into 4 cm pieces last and keep them on a plate.',
            'Taie subțire ceapa verde și pune-o deoparte. Curăță ridichea daikon și taie-o semiluni subțiri, taie morcovul semiluni de aceeași grosime, curăță și taie cuburi cartoful și taie cuburi tofu. Taie feliile de piept de porc în bucăți de 4 cm la sfârșit și ține-le pe o farfurie.',
          ),
        },
        {
          key: 'pork',
          text: t(
            'Heat the sesame oil in a 3 l pot over medium heat. Add the pork and cook for 4 minutes, stirring with a wooden spoon, until the pieces turn opaque and the edges are lightly golden. Lift the thickest piece onto the plate and cut it in half with the knife: it must be opaque and firm right through, with clear juices.',
            'Încinge uleiul de susan într-o oală de 3 l la foc mediu. Adaugă carnea de porc și rumenește-o 4 minute, amestecând cu lingura de lemn, până când bucățile devin opace și marginile se rumenesc ușor. Pune cea mai groasă bucată pe farfurie și taie-o în două cu cuțitul: trebuie să fie opacă și fermă în toată grosimea, cu zeama limpede.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'wash',
          text: t(
            'Take the pot off the heat. Wash your hands, the board, the knife, the plate and the spoon that stirred the raw pork with hot soapy water now that the last raw pork has been handled.',
            'Ia oala de pe foc. Spală-ți mâinile, tocătorul, cuțitul, farfuria și lingura cu care ai amestecat carnea crudă cu apă caldă și săpun, acum că ai terminat de atins carnea crudă de porc.',
          ),
        },
        {
          key: 'veg',
          text: t(
            'Put the pot back over medium heat. Add the daikon, carrot and potato and stir for 2 minutes, until they are glossy with the fat.',
            'Pune oala la loc pe foc mediu. Adaugă ridichea, morcovul și cartoful și amestecă 2 minute, până se acoperă cu grăsimea și devin lucioase.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'dashi',
          text: t(
            'Pour in the water, stir in the dashi granules and bring to the boil, about 6 minutes. Skim off any foam.',
            'Toarnă apa, amestecă granulele de dashi și adu la fierbere, cam 6 minute. Ia spuma de la suprafață.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Turn the heat down and simmer, partly covered, for 15 minutes, until a knife slides into the potato and the daikon is translucent and tender.',
            'Scade focul și fierbe domol, acoperit pe jumătate, 15 minute, până când un cuțit intră în cartof, iar daikonul e translucid și fraged.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'tofu',
          text: t(
            'Add the tofu and simmer for 3 minutes, until it is hot all through.',
            'Adaugă tofu și fierbe 3 minute, până se încălzește complet.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'miso',
          text: t(
            'Turn off the heat. Put 60 g of miso into a ladle, dip it into the soup and whisk with a spoon until dissolved, then stir it into the pot. Taste, and dissolve more miso the same way if you want it stronger. Heat gently for 1 minute until steaming, but do not let it boil.',
            'Oprește focul. Pune 60 g de miso într-un polonic, scufundă-l în supă și dizolvă pasta cu o lingură, apoi toarn-o în oală. Gustă și dizolvă mai mult miso în același fel dacă vrei mai intens. Încălzește domol 1 minut, până scoate aburi, fără să fiarbă.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'serve',
          text: t(
            'Ladle into bowls and scatter the spring onion on top. Serve hot.',
            'Pune supa în castroane și presară ceapa verde deasupra. Servește fierbinte.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Cool leftovers within 2 hours, put them in the fridge and eat them within 3 days. Reheat gently until steaming hot, without letting it boil.',
            'Răcește supa rămasă în maximum 2 ore, pune-o la frigider și mănânc-o în cel mult 3 zile. Reîncălzește-o domol până scoate aburi, fără să fiarbă.',
          ),
        },
      ],
      tips: [
        t(
          'Miso brands differ a lot in saltiness, and dashi granules are salty too, so add no salt. Dissolve less miso than you think you need, taste, and add more.',
          'Mărcile de miso diferă mult ca sărătură, iar granulele de dashi sunt și ele sărate, așa că nu pune sare. Dizolvă mai puțin miso decât crezi că ai nevoie, gustă și adaugă mai mult.',
        ),
        t(
          'Check the labels: dashi granules are made from fish (bonito) and often contain milk (lactose), tofu and miso are made from soya (barley miso also contains gluten), and the pork is fried in sesame oil.',
          'Citește etichetele: granulele de dashi sunt făcute din pește (bonito) și conțin adesea lapte (lactoză), tofu și miso sunt făcute din soia (miso din orz conține și gluten), iar carnea se prăjește în ulei de susan.',
        ),
      ],
      stepTips: [
        {
          step: 'prep',
          text: t(
            'Cut the daikon and carrot to the same thickness so they are tender at the same time.',
            'Taie daikonul și morcovul la aceeași grosime ca să se frăgezească în același timp.',
          ),
        },
      ],
      nutritionNote: t(
        'Pork belly is fatty, so the soup is rich in saturated fat; skim some off if you like. Daikon, carrot and potato add fibre and carbohydrate, and tofu and miso add plant protein. Miso and dashi granules make it salty, so go easy on the miso.',
        'Pieptul de porc este gras, așa că supa are multe grăsimi saturate; ia o parte de la suprafață dacă vrei. Daikonul, morcovul și cartofii aduc fibre și carbohidrați, iar tofu și miso aduc proteine vegetale. Miso și granulele de dashi o fac sărată, așa că pune miso cu măsură.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Plain boiled rice', 'Orez alb fiert'),
          reason: t(
            'Plain rice turns the soup into a full meal and mellows the salty miso.',
            'Orezul simplu face din supă o masă completă și îmblânzește miso-ul sărat.',
          ),
          principle: 'complement_flavour',
          ingredient: 'rice',
        },
        {
          kind: 'drink',
          label: t('Green tea', 'Ceai verde'),
          reason: t(
            'Its light bitterness cuts the richness of the pork belly.',
            'Amăreala lui ușoară taie bogăția pieptului de porc.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'green-tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, savoury miso soup with root vegetables warms you through.',
            'O supă fierbinte de miso, cu legume rădăcinoase, te încălzește bine.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from the pork and tofu, carbohydrate from the potato and plenty of warm liquid.',
            'Proteine din porc și tofu, carbohidrați din cartofi și multe lichide calde.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'The fatty pork belly and the salty miso can sit heavy before bed.',
            'Pieptul gras de porc și miso-ul sărat pot cădea greu înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
