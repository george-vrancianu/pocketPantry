import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Rasol base is Romanian boiled beef with vegetables and a horseradish and
// sour cream sauce. Each Variant is a full Recipe with its own lines, steps and
// guidance; the base's Recipe-level Tips are inherited.
export const rasol: BaseRecipeSeed = {
  slug: 'rasol',
  title: t(
    'Romanian boiled beef with vegetables and horseradish sauce (rasol de vită)',
    'Rasol de vită cu legume și sos de hrean',
  ),
  servings: 6,
  prepMinutes: 30,
  cookMinutes: 220,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'beef-shank',
      quantity: 1500,
      unit: 'g',
      note: t(
        'bone-in, in one or two thick pieces',
        'cu os, într-una sau două bucăți groase',
      ),
    },
    { ingredient: 'still-water', quantity: 3.5, unit: 'l' },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('peeled and halved', 'curățate și tăiate pe jumătate'),
    },
    { ingredient: 'bay-leaves', quantity: 1, unit: 'g' },
    { ingredient: 'peppercorns', quantity: 5, unit: 'g' },
    {
      ingredient: 'coarse-salt',
      quantity: 25,
      unit: 'g',
      note: t('for the broth', 'pentru supă'),
    },
    {
      ingredient: 'carrot',
      quantity: 500,
      unit: 'g',
      note: t('peeled, left whole', 'curățați, întregi'),
    },
    {
      ingredient: 'parsley-root',
      quantity: 200,
      unit: 'g',
      note: t('peeled, left whole', 'curățată, întreagă'),
    },
    {
      ingredient: 'celeriac',
      quantity: 300,
      unit: 'g',
      note: t('peeled, in 4 cm chunks', 'curățată, tăiată bucăți de 4 cm'),
    },
    {
      ingredient: 'potato',
      quantity: 0.8,
      unit: 'kg',
      note: t('small, peeled', 'mici, curățați'),
    },
    {
      ingredient: 'horseradish',
      quantity: 60,
      unit: 'g',
      note: t(
        'jarred, grated; check the label: jars often contain sulphites and some add milk or mustard',
        'din borcan, ras; verifică eticheta: borcanele conțin des sulfiți, iar unele adaugă lapte sau muștar',
      ),
    },
    { ingredient: 'sour-cream', quantity: 200, unit: 'g' },
    { ingredient: 'vinegar', quantity: 5, unit: 'ml' },
    { ingredient: 'sugar', quantity: 5, unit: 'g' },
    {
      ingredient: 'salt',
      key: 'salt-sauce',
      quantity: 1,
      unit: 'g',
      note: t('for the sauce', 'pentru sos'),
    },
    {
      ingredient: 'parsley',
      quantity: 15,
      unit: 'g',
      note: t('chopped', 'tocat'),
    },
  ],
  steps: [
    {
      key: 'prep',
      text: t(
        'Peel the onions, carrots, parsley root, celeriac and potatoes, cut the onions in half and the celeriac into 4 cm chunks, and chop the parsley. Do all of this before you touch the raw beef.',
        'Curăță ceapa, morcovii, rădăcina de pătrunjel, țelina și cartofii, taie ceapa pe jumătate și țelina bucăți de 4 cm și toacă pătrunjelul. Fă toate acestea înainte să atingi carnea crudă.',
      ),
    },
    {
      key: 'boil',
      text: t(
        'Put the beef shank in an 8 l pot, then wash your hands, and the board and knife that touched the raw beef. Pour in the cold water so it covers the meat by about 1 cm (add more if needed) and bring slowly to the boil over medium heat. Do not rinse the meat. As the grey foam rises, lift it off with a ladle.',
        'Pune fluierul de vită într-o oală de 8 l, apoi spală-te pe mâini și spală tocătorul și cuțitul care au atins carnea crudă. Toarnă apa rece, să acopere carnea cu circa 1 cm (adaugă mai multă dacă trebuie), și adu încet la fierbere, la foc mediu. Nu spăla carnea. Pe măsură ce urcă spuma cenușie, ia-o cu un polonic.',
      ),
    },
    {
      key: 'skim',
      text: t(
        'Lower the heat until the surface only trembles. Keep skimming for about 10 minutes, until hardly any foam rises and the broth looks clear.',
        'Scade focul până când suprafața abia tremură. Continuă să spumezi circa 10 minute, până când aproape nu mai urcă spumă și supa e limpede.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'simmer',
      text: t(
        'Add the onions, bay leaves, peppercorns and coarse salt. Cover with the lid ajar and simmer gently for 1 hour 50 minutes.',
        'Adaugă ceapa, foile de dafin, boabele de piper și sarea grunjoasă. Acoperă oala lăsând capacul întredeschis și fierbe încet 1 oră și 50 de minute.',
      ),
      timerSeconds: 6600,
    },
    {
      key: 'vegetables',
      text: t(
        'Add the carrots, parsley root and celeriac. If anything sticks out of the liquid, top up with boiling water so the pot covers the meat and vegetables by about 1 cm. Return to a gentle simmer and cook for 20 minutes.',
        'Adaugă morcovii, rădăcina de pătrunjel și țelina. Dacă ceva iese din lichid, completează cu apă clocotită, ca oala să acopere carnea și legumele cu circa 1 cm. Readu la un clocot ușor și fierbe 20 de minute.',
      ),
      timerSeconds: 1200,
    },
    {
      key: 'potatoes',
      text: t(
        'Ladle about 1 l of the broth into a saucepan, add the potatoes and top up with hot water to cover them. If anything now sticks out of the big pot, top that up with boiling water. Simmer the potatoes for 25 minutes, while the vegetables finish in the big pot, until a knife slides into a potato with no resistance.',
        'Ia cu polonicul circa 1 l de supă într-o cratiță, adaugă cartofii și completează cu apă fierbinte să-i acopere. Dacă acum ceva iese din oala mare, completează-o cu apă clocotită. Fierbe cartofii 25 de minute, în timp ce legumele se termină în oala mare, până când cuțitul intră în cartof fără rezistență.',
      ),
      timerSeconds: 1500,
    },
    {
      key: 'sauce',
      text: t(
        'While the potatoes cook, stir the horseradish with the sour cream, vinegar, sugar and the salt for the sauce. Taste, adding more horseradish a little at a time if you want it sharper. Keep the sauce in the fridge until serving.',
        'În timp ce fierb cartofii, amestecă hreanul cu smântâna, oțetul, zahărul și sarea pentru sos. Gustă și, dacă vrei mai iute, adaugă hrean puțin câte puțin. Ține sosul la frigider până la servire.',
      ),
    },
    {
      key: 'tender',
      text: t(
        'Lift the vegetables into a warm dish with a ladle of broth. Push a fork into the thickest part of the shank: it should slide in with little resistance and the meat should start to pull from the bone. If it is not tender yet, simmer on and check every 15 minutes. Then lift the meat onto a clean board, cover it loosely with foil and let it rest for 10 minutes. Drain the potatoes.',
        'Scoate legumele într-un vas cald, cu un polonic de supă. Înfige o furculiță în partea cea mai groasă a fluierului: trebuie să intre ușor, iar carnea să înceapă să se desprindă de os. Dacă nu e încă fragedă, lasă-o să fiarbă și verifică din 15 în 15 minute. Apoi scoate carnea pe un tocător curat, acoperă-o lejer cu folie și las-o 10 minute. Scurge cartofii.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'serve',
      text: t(
        'Strain the broth through a fine sieve into a clean pot, skim off the fat and reheat until steaming. Serve it first in bowls with the chopped parsley. Then slice the meat across the grain, and serve it with the vegetables, the potatoes and the horseradish sauce.',
        'Strecoară supa printr-o sită deasă într-o oală curată, ia grăsimea de deasupra și încălzește-o până scoate aburi. Servește-o mai întâi în boluri, cu pătrunjel tocat. Apoi taie carnea felii, de-a latul fibrelor, și servește-o cu legumele, cartofii și sosul de hrean.',
      ),
    },
  ],
  tips: [
    t(
      'Keep the pot at a bare simmer, with only a bubble now and then breaking the surface: a hard boil makes the broth cloudy and the meat dry and stringy.',
      'Ține oala la un clocot abia perceptibil, cu o bulă din când în când la suprafață: fierberea tare tulbură supa și face carnea uscată și firoasă.',
    ),
    t(
      'To store leftovers, cut the meat into smaller pieces, split the meat and the broth into shallow containers so they cool quickly, and get everything, with any sauce, into the fridge within 2 hours. Eat within 3 to 4 days. Reheat the broth until it is steaming hot, and the meat in the hot broth.',
      'Ca să păstrezi mâncarea rămasă, taie carnea în bucăți mai mici, împarte carnea și supa în recipiente mici, puțin adânci, ca să se răcească repede, și pune totul, cu sosul rămas, la frigider în cel mult 2 ore. Consumă în 3-4 zile. Încălzește supa până scoate aburi, iar carnea în supa fierbinte.',
    ),
    t(
      'You can cook the whole pot a day ahead: take the meat off the bone or cut it into a few smaller pieces, put the meat and the broth in shallow containers, and get everything into the fridge within 2 hours. Lift off the fat that sets on top, then reheat the meat in the broth until steaming.',
      'Poți găti toată oala cu o zi înainte: desprinde carnea de pe os sau taie-o în câteva bucăți mai mici, pune carnea și supa în recipiente puțin adânci și pune totul la frigider în cel mult 2 ore. Ridică grăsimea întărită deasupra, apoi încălzește carnea în supă până scoate aburi.',
    ),
  ],
  stepTips: [
    {
      step: 'boil',
      text: t(
        'Do not stir the pot. Skim from the edge with the ladle held flat; stirring mixes the foam back into the broth and clouds it.',
        'Nu amesteca în oală. Spumează de la margine, cu polonicul ținut aproape orizontal, chiar sub suprafață; amestecarea readuce spuma în supă și o tulbură.',
      ),
    },
    {
      step: 'sauce',
      text: t(
        'Jarred horseradish varies a lot in strength and in what is added to it, so taste before you add more. If someone at the table avoids sulphites, milk or mustard, read the label on the jar first.',
        'Hreanul din borcan diferă mult ca iuțeală și ca ingrediente adăugate, așa că gustă înainte să mai pui. Dacă la masă e cineva care evită sulfiții, laptele sau muștarul, citește mai întâi eticheta borcanului.',
      ),
    },
    {
      step: 'serve',
      text: t(
        'Slice the shank thinly: it has strands of connective tissue, and thin slices across the grain are the most tender to chew.',
        'Taie fluierul subțire: are fibre de țesut conjunctiv, iar feliile subțiri tăiate de-a latul fibrelor sunt cele mai fragede la mestecat.',
      ),
    },
  ],
  nutritionNote: t(
    'A filling meal of protein-rich beef and plenty of vegetables, cooked without added fat; the salted broth and the jarred horseradish add salt, and the sour cream adds saturated fat, so skim the fat off the broth and keep the sauce modest.',
    'O masă săturătoare, cu carne de vită bogată în proteine și multe legume, gătită fără grăsime adăugată; supa sărată și hreanul din borcan aduc sare, iar smântâna adaugă grăsimi saturate, așa că ia grăsimea de pe supă și folosește sosul cu măsură.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t(
        'Romanian mixed brine-fermented pickles (murături asortate)',
        'Murături asortate în saramură',
      ),
      reason: t(
        'Sharp, sour pickles cut through the rich boiled beef.',
        'Murăturile acre echilibrează gustul cărnii fierte și al sosului cu smântână.',
      ),
      principle: 'acid_cuts_fat',
      recipe: 'muraturi',
    },
    {
      kind: 'food',
      label: t('Bread', 'Pâine'),
      reason: t(
        'Good for mopping up the broth and the horseradish sauce.',
        'Bună ca să ștergi farfuria de supă și de sosul de hrean.',
      ),
      principle: 'complement_flavour',
      ingredient: 'bread',
    },
    {
      kind: 'drink',
      label: t('Red wine', 'Vin roșu'),
      reason: t(
        'A dry, not too heavy red suits the plain, meaty broth.',
        'Un vin roșu sec, nu prea puternic, se potrivește cu gustul simplu, de carne, al supei.',
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
        'Hot broth and tender meat warm you through.',
        'Supa fierbinte și carnea fragedă te încălzesc bine.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Protein from the beef, with potatoes for carbohydrates.',
        'Proteine din carnea de vită, cu cartofi pentru carbohidrați.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'A big hot pot of boiled meat is heavy in the heat.',
        'O oală mare de carne fiartă, fierbinte, cade greu pe vreme caldă.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A large meat meal is slow to digest right before bed.',
        'O masă mare cu carne se digeră greu chiar înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'rasol-french',
      cuisine: 'french',
      title: t(
        'Pot-au-feu (French boiled beef with marrow bones and winter vegetables)',
        'Pot-au-feu (rasol franțuzesc de vită cu oase cu măduvă și legume de iarnă)',
      ),
      servings: 6,
      prepMinutes: 35,
      cookMinutes: 205,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'beef-shank',
          quantity: 800,
          unit: 'g',
          note: t('bone-in', 'cu os'),
        },
        {
          ingredient: 'beef-ribs',
          quantity: 700,
          unit: 'g',
          note: t('short ribs, in large pieces', 'coaste, în bucăți mari'),
        },
        {
          ingredient: 'beef-marrow-bones',
          quantity: 500,
          unit: 'g',
          note: t('sawn into 5 cm pieces', 'tăiate în bucăți de 5 cm'),
        },
        { ingredient: 'still-water', quantity: 3.5, unit: 'l' },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'peeled; one studded with the cloves',
            'curățate; una înțepată cu cuișoarele',
          ),
        },
        {
          ingredient: 'cloves',
          quantity: 0.4,
          unit: 'g',
          note: t('about 4 cloves', 'circa 4 cuișoare'),
        },
        {
          ingredient: 'leek',
          quantity: 500,
          unit: 'g',
          note: t(
            'trimmed, washed between the layers, halved crosswise and tied in a bundle',
            'curățat, spălat printre straturi, tăiat în două de-a curmezișul și legat într-un mănunchi',
          ),
        },
        {
          ingredient: 'carrot',
          quantity: 500,
          unit: 'g',
          note: t('peeled, left whole', 'curățați, întregi'),
        },
        {
          ingredient: 'turnip',
          quantity: 400,
          unit: 'g',
          note: t('peeled, halved', 'curățați, tăiați pe jumătate'),
        },
        {
          ingredient: 'celery',
          quantity: 150,
          unit: 'g',
          note: t('stalks, in 8 cm lengths', 'tulpini, tăiate bucăți de 8 cm'),
        },
        { ingredient: 'thyme', quantity: 3, unit: 'g' },
        { ingredient: 'bay-leaves', quantity: 1, unit: 'g' },
        {
          ingredient: 'parsley',
          quantity: 20,
          unit: 'g',
          note: t(
            'stems for the bouquet garni, leaves chopped',
            'codițele pentru buchetul garni, frunzele tocate',
          ),
        },
        { ingredient: 'peppercorns', quantity: 5, unit: 'g' },
        {
          ingredient: 'coarse-salt',
          quantity: 25,
          unit: 'g',
          note: t('for the broth', 'pentru supă'),
        },
        {
          ingredient: 'coarse-salt',
          key: 'coarse-salt-table',
          quantity: 5,
          unit: 'g',
          note: t('for the table', 'pentru masă'),
        },
        {
          ingredient: 'mustard',
          quantity: 40,
          unit: 'g',
          note: t('Dijon', 'de Dijon'),
        },
        { ingredient: 'cornichons', quantity: 100, unit: 'g' },
        { ingredient: 'baguette', quantity: 1, unit: 'pcs' },
      ],
      steps: [
        {
          key: 'prep',
          text: t(
            'Peel the onions, carrots and turnips, halve the turnips, cut the celery into 8 cm lengths and chop the parsley leaves. Cut the leeks in half crosswise and tie them in a bundle. Tie the thyme, bay leaves and parsley stems into a bouquet garni and push the cloves into one onion. Do all of this before you touch the raw meat.',
            'Curăță ceapa, morcovii și napii, taie napii pe jumătate, taie țelina pai bucăți de 8 cm și toacă frunzele de pătrunjel. Taie prazul în două, de-a curmezișul, și leagă-l într-un mănunchi. Leagă cimbrișorul, foile de dafin și codițele de pătrunjel într-un buchet garni și înțeapă o ceapă cu cuișoarele. Fă toate acestea înainte să atingi carnea crudă.',
          ),
        },
        {
          key: 'boil',
          text: t(
            'Put the shank and the ribs in a 10 l pot. Wrap the marrow bones in muslin, or tie them, so the marrow stays in, and put them on a plate in the fridge. Then wash your hands, and the board and knife that touched the raw beef. Pour in the cold water so it covers the meat by about 1 cm (add more if needed) and bring slowly to the boil over medium heat. Do not rinse the meat. As the grey foam rises, lift it off with a ladle.',
            'Pune fluierul și coastele într-o oală de 10 l. Înfășoară oasele cu măduvă în tifon sau leagă-le, ca măduva să rămână înăuntru, și pune-le pe o farfurie la frigider. Apoi spală-te pe mâini și spală tocătorul și cuțitul care au atins carnea crudă. Toarnă apa rece, să acopere carnea cu circa 1 cm (adaugă mai multă dacă trebuie), și adu încet la fierbere, la foc mediu. Nu spăla carnea. Pe măsură ce urcă spuma cenușie, ia-o cu un polonic.',
          ),
        },
        {
          key: 'skim',
          text: t(
            'Lower the heat until the surface only trembles. Keep skimming for about 10 minutes, until hardly any foam rises and the broth looks clear.',
            'Scade focul până când suprafața abia tremură. Continuă să spumezi circa 10 minute, până când aproape nu mai urcă spumă și supa e limpede.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'simmer',
          text: t(
            'Add the studded onion, the other onion, the bouquet garni, peppercorns and the coarse salt for the broth. Cover with the lid ajar and simmer gently for 1 hour 50 minutes.',
            'Adaugă ceapa înțepată cu cuișoare, cealaltă ceapă, buchetul garni, boabele de piper și sarea grunjoasă pentru supă. Acoperă oala lăsând capacul întredeschis și fierbe încet 1 oră și 50 de minute.',
          ),
          timerSeconds: 6600,
        },
        {
          key: 'vegetables',
          text: t(
            'Add the leek bundle, carrots, turnips and celery. If anything sticks out of the liquid, top up with boiling water so the pot covers the meat and vegetables by about 1 cm. Return to a gentle simmer and cook for 15 minutes.',
            'Adaugă mănunchiul de praz, morcovii, napii și țelina pai. Dacă ceva iese din lichid, completează cu apă clocotită, ca oala să acopere carnea și legumele cu circa 1 cm. Readu la un clocot ușor și fierbe 15 minute.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'marrow',
          text: t(
            'Lower the wrapped marrow bones into the pot and simmer for 20 minutes more, until the marrow is soft and just translucent. Then wash your hands and the plate the bones sat on.',
            'Pune în oală oasele cu măduvă înfășurate și fierbe încă 20 de minute, până când măduva e moale și abia translucidă. Apoi spală-te pe mâini și spală farfuria pe care au stat oasele.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'tender',
          text: t(
            'Lift the vegetables and the marrow bones into a warm dish with a ladle of broth. Push a fork into the thickest part of the shank and the ribs: it should slide in with little resistance. If they are not tender yet, simmer on and check every 15 minutes. Then lift the meat onto a clean board, cover it loosely with foil and let it rest for 10 minutes.',
            'Scoate legumele și oasele cu măduvă într-un vas cald, cu un polonic de supă. Înfige o furculiță în partea cea mai groasă a fluierului și a coastelor: trebuie să intre ușor. Dacă nu sunt încă fragede, lasă-le să fiarbă și verifică din 15 în 15 minute. Apoi scoate carnea pe un tocător curat, acoperă-o lejer cu folie și las-o 10 minute.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'toast',
          text: t(
            'While the meat rests, slice the baguette and toast the slices in batches in a dry frying pan over medium heat, about 90 seconds on each side, until golden. Keep the toast warm under a clean cloth.',
            'În timp ce se odihnește carnea, taie bagheta felii și prăjește feliile pe rând, într-o tigaie uscată, la foc mediu, circa 90 de secunde pe fiecare parte, până se rumenesc. Ține pâinea prăjită la cald, sub un prosop curat.',
          ),
          timerSeconds: 90,
        },
        {
          key: 'serve',
          text: t(
            'Strain the broth through a fine sieve into a clean pot, skim off the fat and reheat until steaming. Serve it first in bowls with the chopped parsley. Then slice the meat across the grain and serve it with the vegetables, coarse salt, mustard and cornichons. Spoon the marrow onto the toast and add a pinch of coarse salt.',
            'Strecoară supa printr-o sită deasă într-o oală curată, ia grăsimea de deasupra și încălzește-o până scoate aburi. Servește-o mai întâi în boluri, cu pătrunjel tocat. Apoi taie carnea felii, de-a latul fibrelor, și servește-o cu legumele, sare grunjoasă, muștar și cornișoni. Scoate măduva cu lingura pe feliile prăjite și adaugă puțină sare grunjoasă.',
          ),
        },
      ],
      tips: [
        t(
          'Ask the butcher to saw the marrow bones into 5 cm pieces, so you can reach the marrow with a small spoon.',
          'Roagă măcelarul să taie oasele cu măduvă în bucăți de 5 cm, ca să poți scoate măduva cu o linguriță.',
        ),
      ],
      stepTips: [
        {
          step: 'vegetables',
          text: t(
            'Keep the leeks tied: the bundle lifts out whole, and the leeks do not fall apart into the broth.',
            'Ține prazul legat: mănunchiul se scoate întreg, iar prazul nu se desface în supă.',
          ),
        },
      ],
      nutritionNote: t(
        'Beef, marrow and plenty of vegetables in one pot give protein and fibre from the leeks, turnips and carrots; marrow bones and short ribs are very rich in saturated fat, so treat the marrow as a small extra, and note that the broth and the coarse salt at the table add salt.',
        'Carnea de vită, măduva și multe legume într-o singură oală aduc proteine și fibre din praz, nap și morcovi; oasele cu măduvă și coastele sunt foarte bogate în grăsimi saturate, așa că tratează măduva ca pe un mic extra, și ține minte că supa și sarea grunjoasă de la masă adaugă sare.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Boiled potatoes', 'Cartofi fierți'),
          reason: t(
            'Plain boiled potatoes soak up the broth and fill out the meal.',
            'Cartofii fierți simplu absorb supa și fac masa mai consistentă.',
          ),
          principle: 'complement_flavour',
          ingredient: 'potato',
        },
        {
          kind: 'drink',
          label: t('Red wine', 'Vin roșu'),
          reason: t(
            'A dry, not too heavy red suits the plain, meaty broth.',
            'Un vin roșu sec, nu prea puternic, se potrivește cu gustul simplu, de carne, al supei.',
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
            'A deep, warming broth and tender meat for a cold day.',
            'O supă consistentă, care încălzește, și carne fragedă pentru o zi rece.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Fatty meat and marrow are heavy right before bed.',
            'Carnea grasă și măduva cad greu chiar înainte de culcare.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'A big hot pot of boiled meat is heavy in the heat.',
            'O oală mare de carne fiartă, fierbinte, cade greu pe vreme caldă.',
          ),
        },
      ],
    },
    {
      slug: 'rasol-scandinavian',
      cuisine: 'scandinavian',
      title: t(
        'Danish boiled beef brisket with horseradish sauce (kogt oksebryst med peberrodssovs)',
        'Piept de vită fiert cu sos de hrean, ca în Danemarca (kogt oksebryst med peberrodssovs)',
      ),
      servings: 6,
      prepMinutes: 30,
      cookMinutes: 205,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'beef-brisket',
          quantity: 1500,
          unit: 'g',
          note: t('fresh, not cured', 'proaspăt, nesărat'),
        },
        { ingredient: 'still-water', quantity: 2.5, unit: 'l' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('peeled and halved', 'curățată și tăiată pe jumătate'),
        },
        { ingredient: 'bay-leaves', quantity: 1, unit: 'g' },
        { ingredient: 'peppercorns', quantity: 5, unit: 'g' },
        {
          ingredient: 'salt',
          quantity: 15,
          unit: 'g',
          note: t('for the broth', 'pentru supă'),
        },
        {
          ingredient: 'carrot',
          quantity: 300,
          unit: 'g',
          note: t('peeled, halved', 'curățați, tăiați pe jumătate'),
        },
        {
          ingredient: 'leek',
          quantity: 250,
          unit: 'g',
          note: t(
            'trimmed, halved lengthways and washed between the layers',
            'curățat, tăiat pe lung și spălat printre straturi',
          ),
        },
        {
          ingredient: 'potato',
          quantity: 1.2,
          unit: 'kg',
          note: t('peeled', 'curățați'),
        },
        {
          ingredient: 'still-water',
          key: 'water-potatoes',
          quantity: 1.5,
          unit: 'l',
          note: t('for the potatoes', 'pentru cartofi'),
        },
        {
          ingredient: 'salt',
          key: 'salt-potatoes',
          quantity: 6,
          unit: 'g',
          note: t('for the potatoes', 'pentru cartofi'),
        },
        {
          ingredient: 'butter',
          quantity: 40,
          unit: 'g',
        },
        { ingredient: 'flour', quantity: 40, unit: 'g' },
        {
          ingredient: 'whipping-cream',
          quantity: 150,
          unit: 'ml',
        },
        {
          ingredient: 'horseradish-root',
          quantity: 40,
          unit: 'g',
          note: t('peeled and finely grated', 'curățată și rasă fin'),
        },
        { ingredient: 'sugar', quantity: 5, unit: 'g' },
        { ingredient: 'lemon-juice', quantity: 10, unit: 'ml' },
        {
          ingredient: 'salt',
          key: 'salt-sauce',
          note: t('to taste, for the sauce', 'după gust, pentru sos'),
        },
        {
          ingredient: 'parsley',
          quantity: 10,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
      ],
      steps: [
        {
          key: 'prep',
          text: t(
            'Peel the onion, carrots and potatoes, wash the leek and chop the parsley. Do all of this before you touch the raw brisket.',
            'Curăță ceapa, morcovii și cartofii, spală prazul și toacă pătrunjelul. Fă toate acestea înainte să atingi pieptul crud.',
          ),
        },
        {
          key: 'boil',
          text: t(
            'Put the brisket in a 6 to 8 l pot just wide enough to hold it flat, then wash your hands, and the board and knife that touched the raw beef. Pour in the cold water so it covers the meat by about 1 cm; add a little more if needed. Bring slowly to the boil over medium heat. Do not rinse the meat. As the grey foam rises, lift it off with a ladle.',
            'Pune pieptul într-o oală de 6-8 l, în care încape întins, apoi spală-te pe mâini și spală tocătorul și cuțitul care au atins carnea crudă. Toarnă apa rece, să acopere carnea cu circa 1 cm; dacă trebuie, mai adaugă puțină apă. Adu încet la fierbere, la foc mediu. Nu spăla carnea. Pe măsură ce urcă spuma cenușie, ia-o cu un polonic.',
          ),
        },
        {
          key: 'skim',
          text: t(
            'Lower the heat until the surface only trembles. Keep skimming for about 10 minutes, until hardly any foam rises and the broth looks clear.',
            'Scade focul până când suprafața abia tremură. Continuă să spumezi circa 10 minute, până când aproape nu mai urcă spumă și supa e limpede.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'simmer',
          text: t(
            'Add the onion, bay leaves, peppercorns and the salt for the broth. Cover with the lid ajar and simmer gently for 2 hours 5 minutes.',
            'Adaugă ceapa, foile de dafin, boabele de piper și sarea pentru supă. Acoperă oala lăsând capacul întredeschis și fierbe încet 2 ore și 5 minute.',
          ),
          timerSeconds: 7500,
        },
        {
          key: 'vegetables',
          text: t(
            'Add the carrots and leek. If anything sticks out of the liquid, top up with boiling water so the pot covers the meat and vegetables by about 1 cm. Put the potatoes in a pan, cover them with boiling water from the kettle, add the salt for the potatoes and simmer. Simmer the brisket pot and the potatoes for 25 minutes, until a knife slides into a potato with no resistance and the carrots are tender.',
            'Adaugă morcovii și prazul. Dacă ceva iese din lichid, completează cu apă clocotită, ca oala să acopere carnea și legumele cu circa 1 cm. Pune cartofii într-o cratiță, acoperă-i cu apă clocotită din fierbător, adaugă sarea pentru cartofi și fierbe-i. Fierbe oala cu piept și cartofii 25 de minute, până când cuțitul intră în cartof fără rezistență, iar morcovii sunt fragezi.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'tender',
          text: t(
            'Lift the carrots and leek into a warm dish with a ladle of broth, and drain the potatoes and keep them covered. Push a fork into the thickest part of the brisket: it should slide in with little resistance. If it is not tender yet, simmer on and check every 15 minutes. Then lift the brisket onto a clean board, cover it loosely with foil and let it rest while you make the sauce.',
            'Scoate morcovii și prazul într-un vas cald, cu un polonic de supă, scurge cartofii și ține-i acoperiți. Înfige o furculiță în partea cea mai groasă a pieptului: trebuie să intre ușor. Dacă nu e încă fraged, lasă-l să fiarbă și verifică din 15 în 15 minute. Apoi scoate pieptul pe un tocător curat, acoperă-l lejer cu folie și lasă-l să se odihnească cât faci sosul.',
          ),
        },
        {
          key: 'roux',
          text: t(
            'Melt the butter in a medium saucepan over medium-low heat, whisk in the flour and cook for 1 minute, stirring, without letting it brown.',
            'Topește untul într-o cratiță medie, la foc mic spre mediu, amestecă făina în el și gătește 1 minut, mestecând, fără să se rumenească.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'sauce',
          text: t(
            'Skim the fat off the broth, then whisk 400 ml of the hot broth into the roux a little at a time, until smooth. Simmer for 5 minutes, stirring often. While it simmers, scrub, peel and finely grate the horseradish root into a small bowl, in a well-ventilated spot, and leave it to stand.',
            'Ia grăsimea de pe supă, apoi încorporează cu telul 400 ml de supă fierbinte în rântaș, puțin câte puțin, până se omogenizează. Fierbe 5 minute, mestecând des. În timp ce fierbe, spală, curăță și rade fin rădăcina de hrean într-un bol mic, într-un loc bine aerisit, și las-o să stea.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'cream',
          text: t(
            'Stir in the cream and warm it through for 2 minutes, without letting it boil hard.',
            'Adaugă frișca și încălzește sosul 2 minute, fără să fiarbă tare.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'horseradish',
          text: t(
            'Take the pan off the heat and let it cool for 1 minute. Then stir in the horseradish, which has stood for 2 minutes, and the sugar, followed by the lemon juice. Season with salt to taste and taste again.',
            'Ia cratița de pe foc și las-o să se răcească 1 minut. Apoi amestecă hreanul, care a stat 2 minute, și zahărul, apoi adaugă sucul de lămâie. Potrivește de sare după gust și gustă din nou.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'serve',
          text: t(
            'Slice the brisket across the grain, about 1 cm thick. Serve it with the potatoes, carrots and leek, the sauce and pickled beetroot, if you have it, and scatter with the parsley. Serve a cup of the broth beside it if you like.',
            'Taie pieptul felii de circa 1 cm, de-a latul fibrelor. Servește-l cu cartofii, morcovii și prazul, sosul și, dacă ai, sfeclă murată, și presară pătrunjel. Dacă vrei, servește alături și o cană de supă.',
          ),
        },
      ],
      tips: [
        t(
          'The broth is already salted, so season the sauce only at the end, after tasting it.',
          'Supa e deja sărată, așa că potrivește sosul de sare abia la final, după ce îl guști.',
        ),
      ],
      stepTips: [
        {
          step: 'sauce',
          text: t(
            'Grate the root in a well-ventilated spot: the fumes sting the eyes and nose. Grate it only now, not earlier: left standing, it browns and loses its bite.',
            'Rade rădăcina într-un loc bine aerisit: vaporii iuți înțeapă ochii și nasul. Rade-o abia acum, nu mai devreme: lăsată să stea, se înnegrește și își pierde iuțeala.',
          ),
        },
        {
          step: 'serve',
          text: t(
            'Brisket has long fibres, so slice across them; sliced along the grain it turns stringy.',
            'Pieptul are fibre lungi, așa că taie-l de-a latul lor; tăiat pe lungul fibrelor iese firos.',
          ),
        },
      ],
      nutritionNote: t(
        'Brisket is rich in protein, but also fatty, and the butter, flour and cream sauce adds more saturated fat, so skim the broth well and serve the sauce by the spoonful with plenty of the boiled carrots, leek and potatoes; the salted broth and sauce make the meal fairly salty.',
        'Pieptul de vită e bogat în proteine, dar și gras, iar sosul cu unt, făină și frișcă adaugă și mai multe grăsimi saturate, așa că ia bine grăsimea de pe supă și servește sosul cu lingura, cu mulți morcovi, praz și cartofi fierți; supa sărată și sosul fac masa destul de sărată.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t(
            'Danish pickled beetroot (syltede rødbeder)',
            'Sfeclă roșie murată, dulce-acrișoară, ca în Danemarca (syltede rødbeder)',
          ),
          reason: t(
            'Sweet-sour beetroot cuts through the fatty brisket and the creamy sauce.',
            'Sfecla dulce-acrișoară echilibrează pieptul gras și sosul cremos.',
          ),
          principle: 'acid_cuts_fat',
          recipe: 'salata-de-sfecla-scandinavian',
        },
        {
          kind: 'food',
          label: t('Rye bread', 'Pâine de secară'),
          reason: t(
            'Its dense crumb and slight sourness stand up to the sauce.',
            'Miezul dens și aciditatea ușoară țin piept sosului.',
          ),
          principle: 'complement_flavour',
          ingredient: 'rye-bread',
        },
        {
          kind: 'drink',
          label: t('Beer', 'Bere'),
          reason: t(
            'A cold, crisp lager refreshes the palate between rich bites.',
            'O bere rece, ușoară, împrospătează gustul între îmbucături bogate.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Hot, tender beef in a creamy sauce warms you on a cold day.',
            'Carnea fragedă și fierbinte, în sos cremos, te încălzește într-o zi rece.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Fatty brisket and a cream sauce are heavy right before bed.',
            'Pieptul gras și sosul cu frișcă cad greu chiar înainte de culcare.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'A hot, rich meal is heavy in the heat.',
            'O masă fierbinte și bogată cade greu pe vreme caldă.',
          ),
        },
      ],
    },
  ],
};
