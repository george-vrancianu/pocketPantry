import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Ciorbă de lobodă base is the Romanian spring soup of orache: spring
// onion, onion and carrot softened in oil, rice, the leaves cooked for a few
// minutes, soured with borș and finished with an egg and yogurt liaison. Each
// Variant is a full Recipe with its own lines, steps and guidance. The oven-baked
// one is the Romanian orache pie in filo; the Balkan one is the Bulgarian
// orache rolls with a mince and rice filling and an egg and yogurt sauce.
// The base's first Recipe-level Tip (buying, washing, colour) holds in both
// Variants. The make-ahead and storage Tip (a soup with rice and a liaison), the
// fasting Tip and the allergen Tip are about the soup, so both Variants hide
// them and carry their own.
// Sources: the plăcintă follows romaniatv.net "Lobodă, aurul primăverii:
// plăcintă cu lobodă verde în foi subțiri"; the Balkan rolls follow
// https://recepti.gotvach.bg/r-46752 "Сарми от домашна лобода" (Bulgarian
// recipe site: 16 leaves, 150 g rice boiled until tender, 300 g mixed mince,
// green onion, savory, a plate on top, about 30 minutes, an egg and yogurt
// sauce tempered with the cooking broth off the heat).
export const ciorbaDeLoboda: BaseRecipeSeed = {
  slug: 'ciorba-de-loboda',
  title: t(
    'Romanian orache sour soup with green onion and rice (ciorbă de lobodă)',
    'Ciorbă de lobodă cu ceapă verde și orez',
  ),
  servings: 6,
  prepMinutes: 25,
  cookMinutes: 45,
  difficulty: 'easy',
  lines: [
    { ingredient: 'sunflower-oil', quantity: 45, unit: 'ml' },
    {
      ingredient: 'onion',
      quantity: 1,
      unit: 'pcs',
      note: t('finely diced', 'tăiată mărunt'),
    },
    {
      ingredient: 'carrot',
      quantity: 200,
      unit: 'g',
      note: t('diced small', 'tăiați cubulețe'),
    },
    {
      ingredient: 'spring-onion',
      quantity: 300,
      unit: 'g',
      note: t(
        'about 2 bunches, white and green parts, chopped',
        'cam 2 legături, partea albă și cea verde, tocată',
      ),
    },
    { ingredient: 'still-water', quantity: 2.5, unit: 'l' },
    {
      ingredient: 'rice',
      quantity: 60,
      unit: 'g',
      note: t('rinsed', 'spălat'),
    },
    {
      ingredient: 'orache',
      quantity: 800,
      unit: 'g',
      note: t(
        'leaves only, washed, stems removed, cut into ribbons',
        'doar frunzele, spălate, fără cozi, tăiate fâșii',
      ),
    },
    {
      ingredient: 'ciorba-sour-base',
      quantity: 700,
      unit: 'ml',
      note: t(
        'borș: 500 ml first, up to 200 ml more, to taste',
        'borș: întâi 500 ml, apoi până la 200 ml în plus, după gust',
      ),
    },
    {
      ingredient: 'salt',
      quantity: 18,
      unit: 'g',
      note: t(
        '12 g with the water, up to 6 g more at the end, to taste',
        '12 g în apă, apoi până la 6 g în plus la final, după gust',
      ),
    },
    {
      ingredient: 'black-pepper',
      quantity: 1,
      unit: 'g',
      note: t('ground', 'măcinat'),
    },
    { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
    {
      ingredient: 'yogurt',
      quantity: 250,
      unit: 'g',
      note: t('plain, full fat', 'simplu, gras'),
    },
    {
      ingredient: 'dill',
      quantity: 30,
      unit: 'g',
      note: t('chopped', 'tocat'),
    },
    {
      ingredient: 'lovage',
      quantity: 20,
      unit: 'g',
      optional: true,
      note: t('chopped', 'tocat'),
    },
    {
      ingredient: 'green-garlic',
      quantity: 40,
      unit: 'g',
      optional: true,
      note: t('finely chopped', 'tocat mărunt'),
    },
  ],
  steps: [
    {
      key: 'wash',
      text: t(
        'Strip the orache leaves from the thick stems and discard the stems. Fill a large bowl with cold water, add the leaves, swish them around and lift them out into a colander. Repeat in 3 to 4 changes of water, until no grit is left at the bottom of the bowl. Stack the leaves and cut them into 2 cm ribbons.',
        'Desprinde frunzele de lobodă de cozile groase și aruncă cozile. Umple un castron mare cu apă rece, pune frunzele, învârte-le prin apă și scoate-le într-o strecurătoare. Repetă în 3-4 ape, până nu mai rămâne nisip pe fundul castronului. Pune frunzele una peste alta și taie-le fâșii de 2 cm.',
      ),
    },
    {
      key: 'chop',
      text: t(
        'Finely dice the onion, dice the carrot into small cubes and chop the spring onion. Chop the dill, and the lovage and green garlic if you use them, and keep them together on a plate for the end.',
        'Taie ceapa mărunt, morcovii cubulețe mici și tocă ceapa verde. Tocă mărarul, iar dacă folosești, și leușteanul și usturoiul verde, și ține-le laolaltă pe o farfurie pentru final.',
      ),
    },
    {
      key: 'soften',
      text: t(
        'Heat the oil in a 6 litre pot over medium heat. Add the onion, carrot and spring onion and stir for about 6 minutes, until soft and glossy but not browned.',
        'Încălzește uleiul într-o oală de 6 litri la foc mediu. Adaugă ceapa, morcovii și ceapa verde și amestecă cam 6 minute, până se înmoaie și devin lucioase, fără să se rumenească.',
      ),
      timerSeconds: 360,
    },
    {
      key: 'water',
      text: t(
        'Pour in the water, add 12 g of the salt and the pepper, and bring to the boil over high heat. From cold this takes about 12 minutes.',
        'Toarnă apa, adaugă 12 g din sare și piperul și adu la fierbere la foc mare. De la rece durează cam 12 minute.',
      ),
    },
    {
      key: 'rice',
      text: t(
        'Add the rice and simmer gently for 12 minutes, until the grains are nearly tender with a small firm core.',
        'Adaugă orezul și fierbe liniștit 12 minute, până boabele sunt aproape fragede, cu un mic miez tare.',
      ),
      timerSeconds: 720,
    },
    {
      key: 'orache',
      text: t(
        'Add the orache in handfuls, stirring as it wilts, because the pile shrinks fast. Simmer for 4 minutes, until the leaves are soft and wilted. While it simmers, bring 500 ml of the borș to the boil in a small pot.',
        'Adaugă loboda câte o mână, amestecând pe măsură ce se înmoaie, pentru că se face mult mai puțină. Fierbe 4 minute, până frunzele sunt moi și s-au înmuiat de tot. Cât fierbe, adu la fierbere 500 ml din borș într-o oală mică.',
      ),
      timerSeconds: 240,
    },
    {
      key: 'sour',
      text: t(
        'Pour the hot borș into the soup and simmer for 3 minutes, until the rice is tender. Taste. If it is not sour enough, boil some of the remaining 200 ml of borș in the small pot and add it a little at a time. Add salt from the remaining 6 g if it needs it. Take the pot off the heat and wait for the bubbling to stop.',
        'Toarnă borșul fierbinte în ciorbă și fierbe 3 minute, până orezul e fraged. Gustă. Dacă nu e destul de acră, fierbe în oala mică o parte din cei 200 ml de borș rămași și adaug-o puțin câte puțin. Pune sare din cele 6 g rămase, dacă mai trebuie. Ia oala de pe foc și așteaptă să nu mai bolborosească.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'liaison',
      text: t(
        'Whisk the eggs and yogurt in a bowl. Whisk in one ladle of the hot soup, wait a moment, then add a second and a third, so the mixture warms slowly. Stir it into the pot off the heat. Put the pot back on the lowest heat for 2 minutes, stirring, until the soup steams and has thickened a little. Do not let it bubble.',
        'Bate ouăle cu iaurtul într-un bol. Adaugă un polonic de ciorbă fierbinte, amestecând, așteaptă puțin, apoi un al doilea și un al treilea, ca amestecul să se încălzească treptat. Toarnă-l în oală, cu oala luată de pe foc. Pune oala la loc pe focul cel mai mic, 2 minute, amestecând, până scoate aburi și s-a îngroșat puțin. Nu o lăsa să fiarbă.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'finish',
      text: t(
        'Take the pot off the heat and stir in the dill, and the lovage and green garlic if you use them. Let it stand for 2 minutes, then taste and serve hot, with bread and a hot pepper on the side.',
        'Ia oala de pe foc și amestecă mărarul, iar dacă folosești, și leușteanul și usturoiul verde. Las-o 2 minute, apoi gustă și servește fierbinte, cu pâine și un ardei iute alături.',
      ),
      timerSeconds: 120,
    },
  ],
  tips: [
    t(
      'Buy orache at a market, or pick only garden orache you know. The wild "lobodă" on waste ground is often fat hen (Chenopodium album), which is a different plant, so do not pick it unless you are sure what it is. Red orache tints the dish pink-red, while green orache keeps it green.',
      'Cumpără loboda din piață sau culege doar lobodă de grădină pe care o cunoști. Loboda sălbatică de pe maidane este adesea Chenopodium album, o altă plantă, așa că nu o culege dacă nu ești sigur ce este. Loboda roșie colorează mâncarea în roșu-roz, iar cea verde o păstrează verde.',
    ),
    t(
      'To make it ahead, stop before the liaison. Cool the soup within 2 hours, in shallow containers, and keep it in the fridge. Because it has rice, eat it within 1 day. Reheat only as much as you will eat, once, until steaming, take it off the heat and make the liaison then. Never let it bubble once the egg and yogurt are in; it curdles.',
      'Dacă o pregătești dinainte, oprește-te înainte de dres. Răcește ciorba în cel mult 2 ore, în vase joase, și ține-o la frigider. Pentru că are orez, mănâncă-o în cel mult o zi. Încălzește doar cât mănânci, o singură dată, până scoate aburi, ia-o de pe foc și fă dresul atunci. Nu o lăsa să fiarbă după ce ai pus oul și iaurtul; se brânzește.',
    ),
    t(
      'For a fasting version, leave out the egg and yogurt. The soup stands well without them, and the borș still gives it its sourness.',
      'Pentru o variantă de post, lasă la o parte oul și iaurtul. Ciorba se descurcă bine și fără ele, iar borșul îi dă în continuare aciditatea.',
    ),
    t(
      'Allergens: the borș is made from bran, so it contains gluten, and the soup also has eggs and milk (the yogurt). Check the label of bought borș.',
      'Alergeni: borșul se face din tărâțe, deci conține gluten, iar ciorba are și ouă și lapte (iaurtul). Verifică eticheta borșului cumpărat.',
    ),
  ],
  stepTips: [
    {
      step: 'wash',
      text: t(
        'Lift the leaves out of the water instead of pouring the bowl into the colander. The grit stays on the bottom and does not go back onto the leaves.',
        'Scoate frunzele din apă, în loc să torni castronul în strecurătoare. Nisipul rămâne pe fund și nu se întoarce pe frunze.',
      ),
    },
    {
      step: 'sour',
      text: t(
        'Borș differs from maker to maker, so add it in two goes and taste after each. You cannot take the sourness back out.',
        'Borșul diferă de la un producător la altul, așa că pune-l în două rânduri și gustă după fiecare. Acreala nu se mai scoate.',
      ),
    },
    {
      step: 'liaison',
      text: t(
        'Yogurt is acidic and curdles if it meets boiling soup straight from the bowl. Warming it with a few ladles first, then keeping the soup below a bubble, keeps it smooth. The egg is only gently cooked, so children, older people and anyone pregnant should have the soup steaming hot throughout.',
        'Iaurtul este acid și se brânzește dacă ajunge direct în ciorba care fierbe. Dacă îl încălzești întâi cu câteva polonice și apoi nu lași ciorba să bolborosească, rămâne fin. Oul este doar ușor fiert, deci copiii, vârstnicii și gravidele să mănânce ciorba bine încălzită, cu aburi, în toată oala.',
      ),
    },
  ],
  nutritionNote: t(
    'Orache, onion, spring onion and carrot make a big pot of leafy greens and vegetables, with mostly unsaturated oil. The egg and yogurt add protein but also some saturated fat, and the rice is the only starch. The salt you add and any salt in bought borș are the main sources of sodium, so add the last of the salt only at the end, to taste.',
    'Loboda, ceapa, ceapa verde și morcovii fac o oală mare de verdețuri și legume, cu ulei în mare parte nesaturat. Oul și iaurtul adaugă proteine, dar și ceva grăsimi saturate, iar orezul e singura sursă de amidon. Sarea pe care o adaugi și cea din borșul cumpărat sunt principalele surse de sodiu, așa că pune ultima sare abia la final, după gust.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Fresh bread', 'Pâine proaspătă'),
      reason: t(
        'A slice with a crust soaks up the sour, creamy broth.',
        'O felie cu crustă se îmbibă cu zeama acrișoară și cremoasă.',
      ),
      principle: 'contrast_texture',
      ingredient: 'bread',
    },
    {
      kind: 'food',
      label: t('Fresh hot pepper', 'Ardei iute proaspăt'),
      reason: t(
        'A bite of hot pepper sharpens the mild, creamy sourness of the soup.',
        'O îmbucătură de ardei iute ascute acreala blândă și cremoasă a ciorbei.',
      ),
      principle: 'complement_flavour',
      ingredient: 'hot-pepper',
    },
    {
      kind: 'food',
      label: t('A spoon of sour cream', 'O lingură de smântână'),
      reason: t(
        'It softens the sharp borș and adds a cool, rich note at the table.',
        'Îmblânzește borșul ascuțit și adaugă la masă o notă rece și cremoasă.',
      ),
      principle: 'complement_flavour',
      ingredient: 'sour-cream',
    },
  ],
  eatingMoments: [
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'A light green soup that is filling enough with a slice of bread.',
        'O supă verde și ușoară, destul de săturătoare cu o felie de pâine.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'good_for',
      reason: t(
        'Sour, light and green, it is a spring and summer soup.',
        'Acrișoară, ușoară și verde, e o supă de primăvară și de vară.',
      ),
    },
  ],
  variants: [
    {
      slug: 'ciorba-de-loboda-oven-baked',
      method: 'oven-baked',
      title: t(
        'Romanian orache filo pie (plăcintă cu lobodă)',
        'Plăcintă cu lobodă în foi subțiri',
      ),
      servings: 8,
      prepMinutes: 65,
      cookMinutes: 63,
      difficulty: 'medium',
      hideBaseTips: [1, 2, 3],
      lines: [
        {
          ingredient: 'orache',
          quantity: 1000,
          unit: 'g',
          note: t(
            'leaves only, washed, stems removed',
            'doar frunzele, spălate, fără cozi',
          ),
        },
        {
          ingredient: 'spring-onion',
          quantity: 200,
          unit: 'g',
          note: t(
            'about 2 bunches, finely chopped',
            'cam 2 legături, tocată mărunt',
          ),
        },
        { ingredient: 'sunflower-oil', quantity: 30, unit: 'ml' },
        {
          ingredient: 'eggs',
          quantity: 3,
          unit: 'pcs',
          note: t('beaten', 'bătute'),
        },
        {
          ingredient: 'milk',
          quantity: 0.15,
          unit: 'l',
          note: t('whole', 'integral'),
        },
        {
          ingredient: 'butter',
          quantity: 50,
          unit: 'g',
          note: t('melted and cooled', 'topit și răcit'),
        },
        {
          ingredient: 'filo-pastry',
          quantity: 300,
          unit: 'g',
          note: t(
            'about 8 large sheets (250 to 300 g), thawed if frozen',
            'cam 8 foi mari (250-300 g), decongelate dacă sunt congelate',
          ),
        },
        { ingredient: 'salt', quantity: 6, unit: 'g' },
      ],
      steps: [
        {
          key: 'wash',
          text: t(
            'Strip the orache leaves from the thick stems and discard the stems. Wash the leaves in 3 to 4 changes of cold water, lifting them out each time, until no grit is left in the bowl. Drain well and cut roughly into 2 cm ribbons. Finely chop the spring onion.',
            'Desprinde frunzele de lobodă de cozile groase și aruncă cozile. Spală frunzele în 3-4 ape reci, scoțându-le de fiecare dată din apă, până nu mai rămâne nisip în castron. Scurge-le bine și taie-le aproximativ fâșii de 2 cm. Tocă mărunt ceapa verde.',
          ),
        },
        {
          key: 'sweat',
          text: t(
            'Heat the oil in a very large, wide pan over medium heat. Add the spring onion and cook for 3 minutes, stirring, until soft.',
            'Încălzește uleiul într-o tigaie foarte mare și lată, la foc mediu. Adaugă ceapa verde și gătește 3 minute, amestecând, până se înmoaie.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'wilt',
          text: t(
            'Add the orache in handfuls, turn the heat to high, add the salt and stir until it has wilted. Keep cooking, stirring, for about 10 minutes, until the pan is nearly dry and no liquid pools when you tilt it.',
            'Adaugă loboda câte o mână, dă focul la maxim, adaugă sarea și amestecă până se înmoaie. Continuă să gătești, amestecând, cam 10 minute, până tigaia e aproape uscată și nu se mai adună lichid când o înclini.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'cool',
          text: t(
            'Spread the filling in a shallow dish and leave it until it is completely cold, about 20 minutes. A warm filling would start to scramble the eggs and make the pastry soggy. Meanwhile brush a 20 x 30 cm baking dish, at least 5 cm deep, with melted butter.',
            'Întinde umplutura într-un vas larg și puțin adânc și las-o până se răcește complet, cam 20 de minute. O umplutură caldă ar prinde ouăle și ar muia foile. Între timp unge cu unt topit o tavă de 20 x 30 cm, adâncă de cel puțin 5 cm.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'preheat',
          text: t(
            'Set the oven to 180 °C. It takes about 15 minutes to heat, so stir the beaten eggs into the cold filling now and start layering the pie in the next steps while it heats.',
            'Setează cuptorul la 180 °C. Se încălzește în vreo 15 minute, așa că amestecă acum ouăle bătute în umplutura rece și începe să așezi plăcinta în pașii următori cât se încălzește.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'bottom',
          text: t(
            'Lay one sheet of filo in the dish with the edges hanging over the sides, brush it with melted butter, and repeat with 3 more sheets. Keep the sheets you are not using under a slightly damp tea towel so they do not dry out.',
            'Pune o foaie în tavă, cu marginile care atârnă peste laturi, unge-o cu unt topit și repetă cu încă 3 foi. Ține foile pe care nu le folosești sub un prosop ușor umed, ca să nu se usuce.',
          ),
        },
        {
          key: 'fill',
          text: t(
            'Spread the filling in an even layer over the bottom sheets. Fold the overhanging edges in over the filling.',
            'Întinde umplutura într-un strat uniform peste foile de jos. Împătură marginile care atârnă peste umplutură.',
          ),
        },
        {
          key: 'top',
          text: t(
            'Cut the remaining 4 sheets to the size of the dish. Lay them on top one by one, brushing each with melted butter, and tuck in the edges. Prick the top all over with a fork.',
            'Taie cele 4 foi rămase la mărimea tăvii. Pune-le deasupra pe rând, ungând fiecare cu unt topit, și bagă marginile pe sub ele. Înțeapă tot aluatul de deasupra cu furculița.',
          ),
        },
        {
          key: 'milk',
          text: t(
            'Pour the milk over the top, especially around the edges, and leave it for 5 minutes to soak into the pastry.',
            'Toarnă laptele deasupra, mai ales pe margini, și lasă 5 minute să se absoarbă în foi.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'bake',
          text: t(
            'Bake on the middle shelf for 40 to 45 minutes, until the top is deep golden. Push a probe thermometer into the centre of the filling: it should read 71 °C. If the top browns before then, cover it loosely with foil and bake on. If it is not done at 45 minutes, bake on and check every 5 minutes.',
            'Coace pe grătarul din mijloc 40-45 de minute, până deasupra e de un auriu închis. Înfige un termometru cu sondă în mijlocul umpluturii: trebuie să arate 71 °C. Dacă se rumenește mai devreme, acoper-o larg cu folie și coace mai departe. Dacă la 45 de minute nu e gata, mai coace și verifică din 5 în 5 minute.',
          ),
          timerSeconds: 2400,
        },
        {
          key: 'rest',
          text: t(
            'Take the pie out and let it cool in the dish for 15 minutes, so the filling sets and the pastry does not tear. Cut it into 8 squares and serve warm.',
            'Scoate plăcinta și las-o în tavă să se răcească 15 minute, ca umplutura să se așeze și foile să nu se rupă. Taie-o în 8 pătrate și servește caldă.',
          ),
          timerSeconds: 900,
        },
      ],
      tips: [
        t(
          'Cook the orache until the pan is nearly dry and let it go completely cold before the eggs go in. Any water left in the filling seeps into the bottom sheets and leaves them wet.',
          'Gătește loboda până tigaia e aproape uscată și las-o să se răcească complet înainte să pui ouăle. Orice apă rămasă în umplutură se duce în foile de jos și le lasă ude.',
        ),
        t(
          'The pie holds eggs and milk, so cool it within 2 hours and keep it covered in the fridge for 3 to 4 days (the USDA foodsafety.gov chart for cooked egg dishes and quiche). Reheat slices in a hot oven until steaming hot throughout.',
          'Plăcinta are ouă și lapte, deci răcește-o în cel mult 2 ore și ține-o acoperită la frigider 3-4 zile (tabelul USDA de pe foodsafety.gov pentru preparate cu ouă și quiche). Încălzește feliile în cuptor încins până sunt fierbinți cu aburi în toată felia.',
        ),
        t(
          'Allergens: filo contains gluten, and the pie has eggs and milk, with butter as well.',
          'Alergeni: foile conțin gluten, iar plăcinta are ouă și lapte, plus unt.',
        ),
      ],
      stepTips: [
        {
          step: 'top',
          text: t(
            'Pricking the top lets steam out and lets the milk reach the layers underneath, which keeps the crust from puffing into a dome.',
            'Înțepatul lasă aburul să iasă și laptele să ajungă la straturile de dedesubt, așa că scoarța nu se umflă ca o cupolă.',
          ),
        },
        {
          step: 'bake',
          text: t(
            'The eggs inside are only done at 71 °C. A golden top alone is not proof of this, so check the centre before serving to children, older people or anyone pregnant.',
            'Ouăle dinăuntru sunt gata abia la 71 °C. Un vârf auriu singur nu dovedește asta, așa că verifică mijlocul înainte să o dai copiilor, vârstnicilor sau gravidelor.',
          ),
        },
      ],
      nutritionNote: t(
        'Orache and spring onion make the filling a leafy green one, and little oil is used in it. The filo, butter, eggs and milk bring most of the energy and the saturated fat, and the butter brushed between the sheets adds up. The pastry is the main source of starch. It is a baked dish, so a small square with a salad or yogurt goes a long way.',
        'Loboda și ceapa verde fac umplutura verde, cu puțin ulei. Foile, untul, ouăle și laptele aduc cea mai mare parte din energie și din grăsimile saturate, iar untul dat între foi se adună. Foile sunt principala sursă de amidon. E un preparat copt, așa că un pătrat mic cu o salată sau cu iaurt ajunge departe.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Plain yogurt', 'Iaurt simplu'),
          reason: t(
            'Cool, tangy yogurt cuts through the buttery pastry and the rich eggs.',
            'Iaurtul rece și acrișor taie din untul foilor și din ouăle bogate.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'yogurt',
        },
        {
          kind: 'drink',
          label: t('Drinking yogurt', 'Iaurt de băut (sana)'),
          reason: t(
            'A cold, lightly salty yogurt drink refreshes the palate between bites of buttery pastry.',
            'Un iaurt de băut rece și ușor sărat împrospătează gustul între îmbucăturile de foi cu unt.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'drinking-yogurt',
        },
      ],
      eatingMoments: [
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'A cut square holds well and tastes good warm or at room temperature.',
            'Un pătrat tăiat se ține bine și e bun cald sau la temperatura camerei.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'A square with a salad or a glass of yogurt makes a light meal.',
            'Un pătrat cu o salată sau un pahar de iaurt face o masă ușoară.',
          ),
        },
      ],
    },
    {
      slug: 'ciorba-de-loboda-balkan',
      cuisine: 'balkan',
      title: t(
        'Loboda sarmi (Bulgarian orache rolls with rice, mince and an egg and yogurt sauce)',
        'Sarmale bulgărești din lobodă, cu orez, carne tocată și sos de ouă cu iaurt',
      ),
      servings: 8,
      prepMinutes: 30,
      cookMinutes: 65,
      difficulty: 'medium',
      hideBaseTips: [1, 2, 3],
      lines: [
        {
          ingredient: 'orache',
          quantity: 250,
          unit: 'g',
          note: t(
            'about 250 g, enough for 16 large leaves plus spares, washed, stems trimmed',
            'cam 250 g, destule pentru 16 frunze mari plus rezerve, spălate, cozile tăiate',
          ),
        },
        {
          ingredient: 'rice',
          quantity: 150,
          unit: 'g',
          note: t('rinsed', 'spălat'),
        },
        {
          ingredient: 'still-water',
          quantity: 1.5,
          unit: 'l',
          note: t(
            '450 ml for cooking the rice, the rest to cover the rolls',
            '450 ml pentru fierberea orezului, restul ca să acopere sarmalele',
          ),
        },
        {
          ingredient: 'minced-mixed-meat',
          quantity: 300,
          unit: 'g',
          note: t('pork and beef', 'porc și vită'),
        },
        {
          ingredient: 'spring-onion',
          quantity: 120,
          unit: 'g',
          note: t('3 to 4 stalks, finely chopped', '3-4 fire, tocate mărunt'),
        },
        { ingredient: 'sunflower-oil', quantity: 30, unit: 'ml' },
        {
          ingredient: 'vegetable-seasoning',
          quantity: 5,
          unit: 'g',
          note: t('about 1 teaspoon', 'cam 1 linguriță'),
        },
        {
          ingredient: 'savory',
          quantity: 1,
          unit: 'g',
        },
        {
          ingredient: 'salt',
          quantity: 8,
          unit: 'g',
          note: t(
            '6 g in the filling, 2 g in the sauce',
            '6 g în umplutură, 2 g în sos',
          ),
        },
        {
          ingredient: 'black-pepper',
          quantity: 1.5,
          unit: 'g',
          note: t(
            '1 g in the filling, 0.5 g in the sauce',
            '1 g în umplutură, 0,5 g în sos',
          ),
        },
        {
          ingredient: 'yogurt',
          quantity: 200,
          unit: 'g',
          note: t('for the sauce', 'pentru sos'),
        },
        { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
        {
          ingredient: 'parsley',
          quantity: 15,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'yogurt',
          key: 'yogurt-serving',
          quantity: 100,
          unit: 'g',
          optional: true,
          note: t('to serve', 'pentru servit'),
        },
      ],
      steps: [
        {
          key: 'wash',
          text: t(
            'Wash the orache leaves in 3 to 4 changes of cold water, lifting them out each time, until no grit is left in the bowl. Trim the thick stalk from each leaf and drain them. Finely chop the spring onion and the parsley first, before the mince is opened.',
            'Spală frunzele de lobodă în 3-4 ape reci, scoțându-le de fiecare dată din apă, până nu mai rămâne nisip în castron. Taie din fiecare frunză tulpina groasă și scurge-le. Tocă mărunt ceapa verde și pătrunjelul înainte să deschizi carnea tocată.',
          ),
        },
        {
          key: 'rice',
          text: t(
            'Put the rice and 450 ml of the water in a small pot, bring to the boil, cover and cook on the lowest heat for 15 minutes, until the water is gone and the rice is just tender, not mushy.',
            'Pune orezul și 450 ml din apă într-o oală mică, adu la fierbere, acoperă și gătește la foc foarte mic 15 minute, până se consumă apa și orezul e tocmai fraged, nu pap.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'fry',
          text: t(
            'While the rice cooks, heat the oil in a wide pan over medium heat. Add the spring onion and cook for 2 minutes, until soft.',
            'Cât se gătește orezul, încălzește uleiul într-o tigaie lată la foc mediu. Adaugă ceapa verde și gătește 2 minute, până se înmoaie.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'mince',
          text: t(
            'Add the mince, break it up with a spoon and leave the spoon in the pan. Now wash your hands and the surface where the mince packet lay, before touching anything else. Fry for about 8 minutes, until the mince is grey-brown all through with no pink left and the juices run clear. Wash the spoon afterwards.',
            'Adaugă carnea tocată, mărunțește-o cu lingura și lasă lingura în tigaie. Acum spală-ți mâinile și suprafața pe care a stat pachetul cu carne, înainte să atingi altceva. Prăjește cam 8 minute, până carnea e cenușiu-brună peste tot, fără urmă de roz, iar zeama e limpede. Spală lingura după aceea.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'filling',
          text: t(
            'Stir in the cooked rice, the vegetable seasoning, savory, 6 g of the salt and 1 g of the pepper. Take the pan off the heat and let the filling cool for 5 minutes, until you can handle it.',
            'Amestecă orezul fiert, condimentul pentru legume, cimbrul de grădină, 6 g din sare și 1 g din piper. Ia tigaia de pe foc și lasă umplutura să se răcească 5 minute, până poate fi atinsă.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'roll',
          text: t(
            'Lay a leaf flat with the underside up and the stalk end towards you. Put about 3 tablespoons (50 g) of filling near the stalk end, fold in the sides and roll up tightly. If a leaf is small or torn, overlap two. Make 16 rolls.',
            'Pune o frunză întinsă, cu fața de dedesubt în sus și capătul cozii spre tine. Pune cam 3 linguri (50 g) de umplutură lângă capătul cozii, împătură laturile și rulează strâns. Dacă o frunză e mică sau ruptă, suprapune două. Fă 16 sarmale.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Pack the rolls seam down, in tight layers, in a pot 26 to 28 cm wide and at least 8 cm deep. Put a heatproof plate on top to keep them under the liquid, and pour in about 1 litre of the remaining water, just enough to cover them. Bring to the boil, which takes about 8 minutes, then turn the heat down and simmer gently for 30 minutes.',
            'Așază sarmalele cu rostul în jos, în straturi strânse, într-o oală lată de 26-28 cm și adâncă de cel puțin 8 cm. Pune deasupra o farfurie rezistentă la foc, ca să rămână sub lichid, și toarnă cam 1 litru din apa rămasă, cât să le acopere. Adu la fierbere, ceea ce durează cam 8 minute, apoi dă focul mic și fierbe liniștit 30 de minute.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'check',
          text: t(
            'Lift out one roll with a spoon onto a clean plate and cut it open: the leaf should be soft, and the filling steaming hot all through (71 °C). Eat or discard that roll. If it was not done, simmer the rest for 10 minutes more, then test another roll on a clean plate.',
            'Scoate o sarma cu lingura pe o farfurie curată și taie-o: frunza trebuie să fie moale, iar umplutura fierbinte, cu aburi, în tot miezul (71 °C). Mănâncă sau aruncă sarmaua tăiată. Dacă nu era gata, mai fierbe restul 10 minute, apoi verifică altă sarmă pe o farfurie curată.',
          ),
        },
        {
          key: 'sauce',
          text: t(
            'Once the roll passes the check, whisk the yogurt, the eggs, the remaining 2 g of salt and 0.5 g of pepper in a bowl. Take the pot off the heat. Whisk in one ladle of the hot cooking liquid, wait a moment, then add a second ladle, so the sauce warms slowly without the egg setting.',
            'După ce sarmaua trece de verificare, bate iaurtul, ouăle, cele 2 g de sare rămase și 0,5 g de piper într-un bol. Ia oala de pe foc. Adaugă un polonic de zeamă fierbinte de la fiert, amestecând, așteaptă puțin, apoi încă un polonic, ca sosul să se încălzească treptat, fără să se prindă oul.',
          ),
        },
        {
          key: 'finish',
          text: t(
            'Pour the sauce over the rolls and tilt the pot to mix it into the liquid, which becomes a light, creamy broth around them. Put the pot back on the lowest heat for 2 minutes, until it steams. Do not let it bubble. Scatter the parsley on top and serve hot, with extra yogurt if you like.',
            'Toarnă sosul peste sarmale și înclină oala ca să se amestece cu lichidul, care devine o supă ușor cremoasă în jurul lor. Pune oala la loc pe focul cel mai mic, 2 minute, până scoate aburi. Nu o lăsa să fiarbă. Presară pătrunjelul deasupra și servește fierbinte, cu iaurt în plus dacă vrei.',
          ),
          timerSeconds: 120,
        },
      ],
      tips: [
        t(
          'Cool the rolls within 2 hours, in shallow dishes, and keep them in the fridge. Because they hold rice and mince, eat them within 1 day and reheat once, covered, until steaming hot all through (71 °C), over low heat so the sauce does not bubble and curdle.',
          'Răcește sarmalele în cel mult 2 ore, în vase joase, și ține-le la frigider. Pentru că au orez și carne tocată, mănâncă-le în cel mult o zi și încălzește-le o singură dată, acoperite, până sunt fierbinți cu aburi în tot miezul (71 °C), la foc mic, ca sosul să nu fiarbă și să se brânzească.',
        ),
        t(
          'Allergens: the sauce has eggs and milk (the yogurt), and the vegetable seasoning contains celery. Check the label of the seasoning, which can hold other allergens too.',
          'Alergeni: sosul are ouă și lapte (iaurtul), iar condimentul pentru legume conține țelină. Verifică eticheta condimentului, care poate avea și alți alergeni.',
        ),
      ],
      stepTips: [
        {
          step: 'roll',
          text: t(
            'Do not overfill: the rice swells a little more as the rolls simmer, and a tight roll with a little room holds together better than a fat one that splits.',
            'Nu pune prea multă umplutură: orezul se mai umflă puțin la fiert, iar o sarma strânsă, cu puțin loc, rămâne întreagă mai bine decât una groasă care se desface.',
          ),
        },
        {
          step: 'check',
          text: t(
            'Cut the test roll on a clean plate, not the one the raw mince sat on, and eat it or discard it rather than putting it back in the pot.',
            'Taie sarmaua de probă pe o farfurie curată, nu pe cea pe care a stat carnea crudă, și mănâncă-o sau aruncă-o, nu o pune înapoi în oală.',
          ),
        },
        {
          step: 'finish',
          text: t(
            'The egg in the sauce is only gently cooked, so children, older people and anyone pregnant should have it steaming hot throughout.',
            'Oul din sos este doar ușor fiert, deci copiii, vârstnicii și gravidele să mănânce sosul bine încălzit, cu aburi în toată oala.',
          ),
        },
      ],
      nutritionNote: t(
        'The orache leaves and spring onion add greens, and the rice gives starch. The mince, egg and yogurt make the rolls filling, with protein, but they also bring saturated fat, mostly from the meat, eggs and yogurt. Most of the oil is unsaturated. Salt comes from the seasoning and what you add, so taste before adding more.',
        'Frunzele de lobodă și ceapa verde aduc verdețuri, iar orezul amidon. Carnea tocată, oul și iaurtul fac sarmalele săturătoare, cu proteine, dar aduc și grăsimi saturate, mai ales din carne, ouă și iaurt. Cea mai mare parte din ulei este nesaturat. Sarea vine din condiment și din ce adaugi tu, așa că gustă înainte să mai pui.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Fresh bread', 'Pâine proaspătă'),
          reason: t(
            'A slice of bread soaks up the warm egg and yogurt sauce.',
            'O felie de pâine se îmbibă cu sosul cald de ouă și iaurt.',
          ),
          principle: 'contrast_texture',
          ingredient: 'bread',
        },
        {
          kind: 'food',
          label: t('Pickled cucumbers', 'Castraveți murați'),
          reason: t(
            'Their sharp brine cuts the richness of the mince and the creamy sauce.',
            'Acreala lor taie din bogăția cărnii tocate și a sosului cremos.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-cucumbers',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Hot rolls in a warm creamy sauce are a filling dish for a cold day.',
            'Sarmalele fierbinți într-un sos cald și cremos sunt o mâncare săturătoare pentru o zi rece.',
          ),
        },
      ],
    },
  ],
};
