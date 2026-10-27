import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Ciorbă de potroace base is the Romanian chicken giblet sour soup: necks,
// wings, hearts and gizzards simmered with root vegetables, rice, optional
// liver, soured with borș. Each Variant is a full Recipe. Base Recipe-level
// Tips: 0 liver and pregnancy, 1 storage with rice, 2 sauerkraut juice,
// 3 skimming for a clear broth. The Brazilian stew hides 1, 2 and 3 (no rice,
// no borș, no skimming); the Hungarian soup hides 0, 1 and 2 (no liver, no
// rice, no borș). Each hiding Variant has its own storage Tip.
export const ciorbaDePotroace: BaseRecipeSeed = {
  slug: 'ciorba-de-potroace',
  title: t(
    'Romanian chicken giblet sour soup with rice (ciorbă de potroace)',
    'Ciorbă de potroace de pui cu orez și leuștean',
  ),
  servings: 6,
  prepMinutes: 25,
  cookMinutes: 110,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'chicken-back',
      quantity: 350,
      unit: 'g',
      note: t('necks and backs', 'gâturi și spinări'),
    },
    { ingredient: 'chicken-wings', quantity: 300, unit: 'g' },
    {
      ingredient: 'chicken-hearts',
      quantity: 350,
      unit: 'g',
      note: t(
        'hearts and gizzards, bought cleaned',
        'inimioare și pipote, cumpărate curățate',
      ),
    },
    {
      ingredient: 'chicken-feet',
      quantity: 150,
      unit: 'g',
      optional: true,
      note: t('bought cleaned', 'cumpărate curățate'),
    },
    {
      ingredient: 'chicken-liver',
      quantity: 150,
      unit: 'g',
      optional: true,
      note: t('added at the end', 'adăugat la final'),
    },
    { ingredient: 'still-water', quantity: 2.5, unit: 'l' },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('finely diced', 'tăiate mărunt'),
    },
    {
      ingredient: 'carrot',
      quantity: 200,
      unit: 'g',
      note: t('diced small', 'tăiați cubulețe'),
    },
    {
      ingredient: 'parsley-root',
      quantity: 100,
      unit: 'g',
      note: t('diced small', 'tăiată cubulețe'),
    },
    {
      ingredient: 'celeriac',
      quantity: 150,
      unit: 'g',
      note: t('peeled, diced small', 'curățată, tăiată cubulețe'),
    },
    {
      ingredient: 'bell-pepper',
      quantity: 1,
      unit: 'pcs',
      note: t('diced', 'tăiat cubulețe'),
    },
    {
      ingredient: 'rice',
      quantity: 60,
      unit: 'g',
      note: t('rinsed', 'spălat'),
    },
    {
      ingredient: 'ciorba-sour-base',
      quantity: 600,
      unit: 'ml',
      note: t(
        'borș: 400 ml first, up to 200 ml more, to taste',
        'borș: întâi 400 ml, apoi până la 200 ml în plus, după gust',
      ),
    },
    { ingredient: 'peppercorns', quantity: 3, unit: 'g' },
    { ingredient: 'bay-leaves', quantity: 0.6, unit: 'g' },
    {
      ingredient: 'salt',
      quantity: 20,
      unit: 'g',
      note: t(
        '10 g with the vegetables, the rest at the end to taste',
        '10 g odată cu legumele, restul la final, după gust',
      ),
    },
    {
      ingredient: 'lovage',
      quantity: 20,
      unit: 'g',
      note: t('fresh, chopped', 'proaspăt, tocat'),
    },
    {
      ingredient: 'parsley',
      quantity: 20,
      unit: 'g',
      note: t('chopped', 'tocat'),
    },
    {
      ingredient: 'sour-cream',
      quantity: 150,
      unit: 'g',
      optional: true,
      note: t('a spoonful in each bowl', 'câte o lingură în fiecare bol'),
    },
  ],
  steps: [
    {
      key: 'prep',
      text: t(
        'Peel and dice the onions, carrot, parsley root, celeriac and pepper, and chop the lovage and parsley. Do all of this before you touch the raw giblets. Put the vegetables in a bowl and the herbs in the fridge.',
        'Curăță și taie cubulețe ceapa, morcovul, rădăcina de pătrunjel, țelina și ardeiul, apoi toacă leușteanul și pătrunjelul. Fă toate acestea înainte să atingi potroacele crude. Pune legumele într-un bol, iar ierburile la frigider.',
      ),
    },
    {
      key: 'giblets',
      text: t(
        'Look over the gizzards on a board. If any yellow inner lining is left, peel it off with a knife. If using the feet, snip off any claws with kitchen scissors. Put the necks and backs, wings, hearts and gizzards and feet in a pot of at least 7 l, without rinsing them, and pour in the 2.5 l of cold water.',
        'Verifică pipotele pe o planșetă. Dacă a rămas pielița galbenă dinăuntru, desprinde-o cu un cuțit. Dacă folosești labele, taie ghearele cu foarfeca de bucătărie. Pune gâturile și spinările, aripioarele, inimioarele și pipotele și labele într-o oală de cel puțin 7 l, fără să le speli, și toarnă cei 2,5 l de apă rece.',
      ),
    },
    {
      key: 'wash',
      text: t(
        'Wash your hands, the board, the knife and the scissors with hot soapy water now, before touching anything else.',
        'Spală-ți acum mâinile, planșeta, cuțitul și foarfeca cu apă fierbinte și detergent, înainte să atingi altceva.',
      ),
    },
    {
      key: 'boil',
      text: t(
        'Bring to the boil over high heat, about 20 minutes. As grey foam rises, skim it off with a spoon, then turn the heat down to a bare simmer.',
        'Adu la fierbere la foc mare, cam 20 de minute. Pe măsură ce se ridică spuma cenușie, ia-o cu o lingură, apoi dă focul mic, ca să fiarbă abia perceptibil.',
      ),
    },
    {
      key: 'simmer',
      text: t(
        'Simmer gently for 30 minutes, skimming any new foam.',
        'Fierbe domol 30 de minute, luând spuma care mai apare.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'vegetables',
      text: t(
        'Add the onions, carrot, parsley root, celeriac, pepper, peppercorns, bay leaves and 10 g of the salt. Bring back to a bare simmer and cook for 30 minutes, until a gizzard is tender: lift one out onto a plate, cut it and bite a piece. It should give easily, with a slight spring. If it is still tough, simmer on and check another piece every 10 minutes, topping up with hot water if the level drops below the meat.',
        'Adaugă ceapa, morcovul, rădăcina de pătrunjel, țelina, ardeiul, piperul boabe, foile de dafin și 10 g din sare. Readu la fierbere domoală și gătește 30 de minute, până când pipota e fragedă: scoate una pe o farfurie, taie-o și gustă o bucată. Trebuie să se muște ușor, cu puțină elasticitate. Dacă e încă tare, mai fierbe și verifică o altă bucată din 10 în 10 minute, adăugând apă fierbinte dacă nivelul scade sub carne.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'rice',
      text: t(
        'Stir in the rice and simmer for 7 minutes. While it simmers, lift the necks, backs, wings and feet out with tongs onto a clean plate, pick the meat off the bones and throw the bones and feet away. Cut the gizzards and hearts into bite-size pieces on the plate, then return all the meat to the pot.',
        'Amestecă orezul și fierbe 7 minute. Cât fierbe, scoate cu o pensă gâturile, spinările, aripioarele și labele pe o farfurie curată, desprinde carnea de pe oase și aruncă oasele și labele. Taie pipotele și inimioarele în bucăți mici pe farfurie, apoi pune toată carnea înapoi în oală.',
      ),
      timerSeconds: 420,
    },
    {
      key: 'liver',
      text: t(
        'If using liver, cut it into 2 cm pieces on a clean board, add them to the soup and wash your hands, the board and the knife straight away. Either way, simmer for another 10 minutes, until you can bite a grain of rice and it is soft right through, and the liver is firm. While it simmers, bring 400 ml of the borș to the boil in a small pot, about 5 minutes, and keep it hot.',
        'Dacă folosești ficat, taie-l bucăți de 2 cm pe o planșetă curată, pune-l în ciorbă și spală imediat mâinile, planșeta și cuțitul. Oricum ar fi, mai fierbe 10 minute, până când un bob de orez se mușcă moale în tot miezul, iar ficatul e ferm. Cât fierbe, adu la fierbere 400 ml din borș într-o oală mică, cam 5 minute, și ține-l fierbinte.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'liver-check',
      text: t(
        'If you added liver, lift out the biggest piece onto a clean plate and cut it open. It must be firm, with no pink and steaming hot; the soup has then been well above 70 °C for far longer than the 2 minutes needed. Eat or throw away the test piece, then wash the plate and the knife.',
        'Dacă ai pus ficat, scoate cea mai mare bucată pe o farfurie curată și taie-o. Trebuie să fie fermă, fără pic de roz și fierbinte, aburindă; ciorba a stat atunci mult peste 70 °C, bine peste cele 2 minute necesare. Mănâncă bucata de probă sau aruncă-o, apoi spală farfuria și cuțitul.',
      ),
    },
    {
      key: 'sour',
      text: t(
        'Pour the hot borș into the soup and simmer for 3 minutes.',
        'Toarnă borșul fierbinte în ciorbă și fierbe 3 minute.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'taste',
      text: t(
        'Taste. If it is not sour enough, boil some of the remaining 200 ml of borș in the small pot and add it a little at a time. Add the rest of the salt, up to 10 g, a pinch at a time, until it tastes right.',
        'Gustă. Dacă nu e destul de acră, fierbe în oala mică o parte din cei 200 ml de borș rămași și adaug-o puțin câte puțin. Pune restul de sare, până la 10 g, câte un praf, până când gustul e echilibrat.',
      ),
    },
    {
      key: 'finish',
      text: t(
        'Take the pot off the heat and stir in the lovage and parsley. Ladle into hot bowls, with a spoonful of sour cream in each if you like, and serve with bread and hot pepper.',
        'Ia oala de pe foc și amestecă leușteanul și pătrunjelul. Servește în boluri calde, cu o lingură de smântână în fiecare, dacă vrei, și cu pâine și ardei iute.',
      ),
    },
    {
      key: 'store',
      text: t(
        'Divide the leftovers into shallow containers so they cool quickly, and put them in the fridge within 2 hours. Because the soup has rice in it, eat it within 1 day and reheat it only once, until steaming hot.',
        'Împarte ciorba rămasă în recipiente puțin adânci, ca să se răcească repede, și pune-o la frigider în cel mult 2 ore. Fiindcă ciorba conține orez, consum-o în cel mult o zi și încălzește-o o singură dată, până scoate aburi.',
      ),
    },
  ],
  tips: [
    t(
      'The liver is optional. UK government advice is that anyone pregnant or trying to conceive should avoid liver, because it is very rich in vitamin A, which in excess can harm an unborn baby. If that is you, leave the liver out; the soup is just as good without it.',
      'Ficatul e opțional. Recomandarea autorităților din Regatul Unit este ca cine e gravidă sau încearcă să rămână însărcinată să evite ficatul, fiindcă e foarte bogat în vitamina A, care în exces poate dăuna copilului nenăscut. Dacă te afli în această situație, renunță la ficat; ciorba e la fel de bună și fără el.',
    ),
    t(
      'Cool it in shallow containers and chill it within 2 hours. With the rice in it, keep it in the fridge for 1 day only and reheat it once, so make only as much as you will eat the next day, or cook the rice separately for leftovers.',
      'Răcește ciorba în recipiente puțin adânci și pune-o la frigider în cel mult 2 ore. Cu orezul în ea, ține-o la frigider cel mult o zi și încălzește-o o singură dată, așa că fă doar cât mănânci a doua zi, sau fierbe orezul separat pentru ce rămâne.',
    ),
    t(
      'Some families sour it with sauerkraut juice instead of borș. Boil it first and add it to taste, as you would the borș.',
      'Unele familii o acresc cu zeamă de varză acră în loc de borș. Fierbe-o întâi și adaug-o după gust, ca pe borș.',
    ),
    t(
      'Never rinse the raw giblets: splashing spreads bacteria around the sink. Skimming the foam as it rises is what gives a clear broth, and a hard boil would cloud it, so keep it at a bare simmer.',
      'Nu spăla potroacele crude: stropii răspândesc bacterii prin chiuvetă. Spuma luată pe măsură ce se ridică dă o supă limpede, iar fierberea tare o tulbură, așa că ține focul mic.',
    ),
  ],
  stepTips: [
    {
      step: 'giblets',
      text: t(
        'Gizzards are usually sold cleaned, but a bit of the yellow lining sometimes remains. It is tough and bitter, so peel it off first.',
        'Pipotele se vând de obicei curățate, dar uneori mai rămâne puțin din pielița galbenă. E tare și amară, așa că desprinde-o de la început.',
      ),
    },
    {
      step: 'sour',
      text: t(
        'Acid keeps rice and vegetables firm, so the borș goes in once they are tender, and it goes in boiled, so the soup does not stop simmering.',
        'Acrul ține orezul și legumele ferme, așa că borșul intră după ce acestea s-au fiert, și intră fiert, ca ciorba să nu se oprească din fiert.',
      ),
    },
  ],
  nutritionNote: t(
    'A filling soup built on protein from the giblets and fibre from the vegetables, with no added fat at all. The wings and feet add some fat from their skin, and the sour cream adds more saturated fat. The borș and the salt make it salty, so season at the end. Liver is very rich in vitamin A, so keep it for an occasional pot.',
    'O ciorbă săturătoare, cu proteine din potroace și fibre din legume, fără grăsime adăugată. Aripioarele și labele aduc ceva grăsime din piele, iar smântâna adaugă mai multe grăsimi saturate. Borșul și sarea o fac sărată, așa că sărează la final. Ficatul e foarte bogat în vitamina A, așa că păstrează-l pentru o oală ocazională.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Fresh bread', 'Pâine proaspătă'),
      reason: t(
        'A slice with a crust soaks up the sour broth.',
        'O felie cu crustă se îmbibă cu zeama acră.',
      ),
      principle: 'contrast_texture',
      ingredient: 'bread',
    },
    {
      kind: 'food',
      label: t('Hot pepper', 'Ardei iute'),
      reason: t(
        'A bite of hot pepper sharpens the rich, soured broth.',
        'O îmbucătură de ardei iute ascute zeama bogată și acrișoară.',
      ),
      principle: 'complement_flavour',
      ingredient: 'hot-pepper',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'Hot, sour and filling, it warms you through.',
        'Fierbinte, acrișoară și săturătoare, te încălzește.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Sour and salty, it sits heavy right before bed.',
        'Acrișoară și sărată, cade greu chiar înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'ciorba-de-potroace-brazilian',
      cuisine: 'brazilian',
      // Stew: no rice, no borș, no skimming; it has its own storage Tip.
      hideBaseTips: [1, 2, 3],
      title: t(
        'Miúdos de frango ensopados (Brazilian stewed chicken giblets in tomato sauce)',
        'Miúdos de frango ensopados (pipote și inimioare înăbușite în sos de roșii, ca în Brazilia)',
      ),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 105,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'chicken-hearts',
          quantity: 700,
          unit: 'g',
          note: t(
            'hearts and gizzards, bought cleaned, gizzards halved',
            'inimioare și pipote, cumpărate curățate, pipotele tăiate în jumătate',
          ),
        },
        {
          ingredient: 'chicken-liver',
          quantity: 150,
          unit: 'g',
          optional: true,
          note: t('added at the end', 'adăugat la final'),
        },
        { ingredient: 'sunflower-oil', quantity: 30, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('diced', 'tăiată cubulețe'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t('crushed', 'zdrobit'),
        },
        {
          ingredient: 'bell-pepper',
          quantity: 1,
          unit: 'pcs',
          note: t('diced', 'tăiat cubulețe'),
        },
        {
          ingredient: 'tomato',
          quantity: 300,
          unit: 'g',
          note: t('diced', 'tăiate cubulețe'),
        },
        { ingredient: 'tomato-paste', quantity: 30, unit: 'g' },
        { ingredient: 'bay-leaves', quantity: 0.6, unit: 'g' },
        { ingredient: 'still-water', quantity: 0.4, unit: 'l' },
        {
          ingredient: 'parsley',
          quantity: 15,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'spring-onion',
          quantity: 30,
          unit: 'g',
          note: t('chopped', 'tocată'),
        },
        { ingredient: 'salt', quantity: 5, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'prep',
          text: t(
            'Dice the onion, pepper and tomatoes, crush the garlic, and chop the parsley and spring onion. Do all of this before you touch the raw giblets.',
            'Taie cubulețe ceapa, ardeiul și roșiile, zdrobește usturoiul și toacă pătrunjelul și ceapa verde. Fă toate acestea înainte să atingi potroacele crude.',
          ),
        },
        {
          key: 'giblets',
          text: t(
            'On a board, peel any yellow lining off the gizzards and halve them. Pat all the giblets dry with kitchen paper, without rinsing, and put them in a bowl. Only then put the pan on the heat.',
            'Pe o planșetă, desprinde pielița galbenă de pe pipote, dacă a rămas, și taie-le în jumătate. Tamponează toate potroacele cu hârtie de bucătărie, fără să le speli, și pune-le într-un bol. Abia apoi pune cratița pe foc.',
          ),
        },
        {
          key: 'brown',
          text: t(
            'Heat the oil in a lidded deep sauté pan of about 3 l over medium-high heat, then put the giblets in the pan. Cook, stirring with a long spoon and with the lid ajar against spatter, for 8 minutes, until browned in places.',
            'Încinge uleiul într-o cratiță adâncă cu capac, de circa 3 l, la foc mijlociu spre mare, apoi pune potroacele în cratiță. Gătește-le 8 minute, amestecând cu o lingură lungă și cu capacul întredeschis ca să nu stropească, până se rumenesc pe alocuri.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'wash',
          text: t(
            'Turn the heat to medium. Wash your hands, the board, the knife, the bowl and the spoon with hot soapy water now, then use a clean spoon.',
            'Dă focul la mediu. Spală-ți acum mâinile, planșeta, cuțitul, bolul și lingura cu apă fierbinte și detergent, apoi folosește o lingură curată.',
          ),
        },
        {
          key: 'soften',
          text: t(
            'Add the onion, garlic and pepper and cook for 5 minutes, stirring, until the onion is soft.',
            'Adaugă ceapa, usturoiul și ardeiul și călește 5 minute, amestecând, până se înmoaie ceapa.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'sauce',
          text: t(
            'Stir in the tomatoes, tomato paste, bay leaves, salt, pepper and the 400 ml of water. Bring to the boil, about 3 minutes, then turn the heat to low and cover.',
            'Amestecă roșiile, pasta de roșii, foile de dafin, sarea, piperul și cei 400 ml de apă. Adu la fierbere, cam 3 minute, apoi dă focul mic și acoperă.',
          ),
        },
        {
          key: 'braise',
          text: t(
            'Simmer, covered, for 60 minutes, until a gizzard is tender: cut one on a plate and bite a piece; it should give easily with a slight spring. If it is still tough, simmer on and check every 15 minutes, adding a splash of water if the pan looks dry.',
            'Fierbe acoperit 60 de minute, până când pipota e fragedă: taie una pe o farfurie și gustă o bucată; trebuie să se muște ușor, cu puțină elasticitate. Dacă e încă tare, mai fierbe și verifică din 15 în 15 minute, adăugând puțină apă dacă tigaia pare uscată.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'liver',
          text: t(
            'If using liver, cut it into 2 cm pieces on a clean board, stir them into the stew and wash your hands, the board and the knife straight away. Take the lid off and simmer for 10 minutes, until the sauce thickens and the liver is firm.',
            'Dacă folosești ficat, taie-l bucăți de 2 cm pe o planșetă curată, amestecă-l în tocană și spală imediat mâinile, planșeta și cuțitul. Ia capacul și fierbe 10 minute, până când sosul se îngroașă și ficatul e ferm.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'liver-check',
          text: t(
            'If you added liver, cut the biggest piece open on a clean plate: it must be firm, with no pink and steaming hot, and the stew has been bubbling well above 70 °C for far longer than the 2 minutes needed. Eat or throw away the test piece, then wash the plate and the knife.',
            'Dacă ai pus ficat, taie cea mai mare bucată pe o farfurie curată: trebuie să fie fermă, fără pic de roz și fierbinte, aburindă, iar tocana a bolborosit mult peste 70 °C, bine peste cele 2 minute necesare. Mănâncă bucata de probă sau aruncă-o, apoi spală farfuria și cuțitul.',
          ),
        },
        {
          key: 'finish',
          text: t(
            'Take the pan off the heat and stir in the parsley and spring onion. Serve hot, with white rice.',
            'Ia cratița de pe foc și amestecă pătrunjelul și ceapa verde. Servește fierbinte, cu orez alb.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Cool the leftover stew in shallow containers and put it in the fridge within 2 hours. Eat it within 3 to 4 days and reheat it until steaming hot.',
            'Răcește tocana rămasă în recipiente puțin adânci și pune-o la frigider în cel mult 2 ore. Consum-o în 3-4 zile și încălzește-o până scoate aburi.',
          ),
        },
      ],
      tips: [
        t(
          'Unlike the soup, this stew has no rice in it, so it keeps for 3 to 4 days in the fridge. Cook the rice fresh, or keep leftover rice for no more than 1 day.',
          'Spre deosebire de ciorbă, tocana aceasta nu are orez, așa că ține 3-4 zile la frigider. Fierbe orezul proaspăt sau păstrează orezul rămas cel mult o zi.',
        ),
      ],
      stepTips: [
        {
          step: 'braise',
          text: t(
            'Keep the heat low: a hard boil toughens the gizzards instead of softening them.',
            'Păstrează focul mic: fierberea tare întărește pipotele în loc să le înmoaie.',
          ),
        },
      ],
      nutritionNote: t(
        'Protein-rich, with tomato, pepper and onion for some fibre; the only added fat is the oil, shared over four portions. Season to taste, as the salt is modest. Liver, if added, is very rich in vitamin A, so keep it for an occasional pot.',
        'Bogată în proteine, cu roșii, ardei și ceapă pentru ceva fibre; singura grăsime adăugată e uleiul, împărțit la patru porții. Sarea e în cantitate modestă, gustă înainte să adaugi. Ficatul, dacă îl pui, e foarte bogat în vitamina A, așa că păstrează-l pentru o oală ocazională.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('White rice', 'Orez alb'),
          reason: t(
            'Plain rice soaks up the tomato sauce.',
            'Orezul simplu absoarbe sosul de roșii.',
          ),
          principle: 'complement_flavour',
          ingredient: 'rice',
        },
        {
          kind: 'food',
          label: t('Green salad', 'Salată verde'),
          reason: t(
            'Crisp leaves give a cool contrast to the soft, rich stew.',
            'Frunzele crocante dau un contrast răcoritor cu tocana moale și bogată.',
          ),
          principle: 'contrast_texture',
          ingredient: 'mixed-salad',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, saucy stew that warms you through.',
            'O tocană fierbinte, cu sos, care te încălzește.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Rich and slow to digest right before bed.',
            'Bogată și greu de digerat chiar înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'ciorba-de-potroace-hungarian',
      cuisine: 'hungarian',
      // Clear soup: no liver, rice or borș; it has its own storage Tip.
      hideBaseTips: [0, 1, 2],
      title: t(
        'Aprólékleves (Hungarian chicken giblet soup with vegetables and thin noodles)',
        'Aprólékleves (supă ungurească de potroace cu legume și fidea)',
      ),
      servings: 6,
      prepMinutes: 30,
      cookMinutes: 100,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'chicken-back',
          quantity: 350,
          unit: 'g',
          note: t('necks and backs', 'gâturi și spinări'),
        },
        { ingredient: 'chicken-wings', quantity: 300, unit: 'g' },
        {
          ingredient: 'chicken-hearts',
          quantity: 350,
          unit: 'g',
          note: t(
            'hearts and gizzards, bought cleaned',
            'inimioare și pipote, cumpărate curățate',
          ),
        },
        {
          ingredient: 'chicken-feet',
          quantity: 150,
          unit: 'g',
          optional: true,
          note: t('bought cleaned', 'cumpărate curățate'),
        },
        { ingredient: 'still-water', quantity: 2.5, unit: 'l' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'halved, skin on or off',
            'tăiată în jumătate, cu sau fără coajă',
          ),
        },
        {
          ingredient: 'carrot',
          quantity: 200,
          unit: 'g',
          note: t('diced into 1 cm cubes', 'tăiați cubulețe de 1 cm'),
        },
        {
          ingredient: 'parsley-root',
          quantity: 100,
          unit: 'g',
          note: t('diced into 1 cm cubes', 'tăiată cubulețe de 1 cm'),
        },
        {
          ingredient: 'celeriac',
          quantity: 100,
          unit: 'g',
          note: t(
            'peeled, diced into 1 cm cubes',
            'curățată, tăiată cubulețe de 1 cm',
          ),
        },
        {
          ingredient: 'kohlrabi',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'peeled, diced into 1 cm cubes',
            'curățată, tăiată cubulețe de 1 cm',
          ),
        },
        {
          ingredient: 'hungarian-pepper',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'pale yellow-white, seeded, cut in large pieces',
            'galben-albicios, fără semințe, tăiat bucăți mari',
          ),
        },
        {
          ingredient: 'tomato',
          quantity: 150,
          unit: 'g',
          note: t('quartered', 'tăiată în sferturi'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t('2 to 3 cloves, crushed', '2-3 căței, zdrobiți'),
        },
        { ingredient: 'peppercorns', quantity: 1, unit: 'g' },
        {
          ingredient: 'parsley',
          quantity: 30,
          unit: 'g',
          note: t('a bunch, tied with string', 'o legătură, legată cu ață'),
        },
        {
          ingredient: 'lovage',
          quantity: 5,
          unit: 'g',
          optional: true,
          note: t('a sprig', 'o crenguță'),
        },
        {
          ingredient: 'vermicelli',
          quantity: 150,
          unit: 'g',
          note: t('thin soup noodles', 'fidea subțire pentru supă'),
        },
        {
          ingredient: 'still-water',
          key: 'noodle-water',
          quantity: 1.5,
          unit: 'l',
          note: t('for boiling the noodles', 'pentru fiertul fidelei'),
        },
        {
          ingredient: 'nutmeg',
          quantity: 0.3,
          unit: 'g',
          note: t('a pinch', 'un praf'),
        },
        {
          ingredient: 'salt',
          quantity: 22,
          unit: 'g',
          note: t(
            '8 g with the vegetables, 7 g in the noodle water, the rest at the end to taste',
            '8 g odată cu legumele, 7 g în apa fidelei, restul la final, după gust',
          ),
        },
      ],
      steps: [
        {
          key: 'prep',
          text: t(
            'Peel and dice the carrot, parsley root, celeriac and kohlrabi, seed and cut up the pepper, quarter the tomato, halve the onion, crush the garlic and tie the parsley in a bunch. Do all of this before you touch the raw giblets.',
            'Curăță și taie cubulețe morcovul, rădăcina de pătrunjel, țelina și gulia, curăță de semințe și taie bucăți ardeiul, taie roșia în sferturi, taie ceapa în jumătate, zdrobește usturoiul și leagă pătrunjelul într-o legătură. Fă toate acestea înainte să atingi potroacele crude.',
          ),
        },
        {
          key: 'giblets',
          text: t(
            'Look over the gizzards on a board. If any yellow inner lining is left, peel it off with a knife. If using the feet, snip off any claws with kitchen scissors. Put the necks and backs, wings, hearts and gizzards and feet in a pot of at least 7 l, without rinsing them, and pour in the 2.5 l of cold water.',
            'Verifică pipotele pe o planșetă. Dacă a rămas pielița galbenă dinăuntru, desprinde-o cu un cuțit. Dacă folosești labele, taie ghearele cu foarfeca de bucătărie. Pune gâturile și spinările, aripioarele, inimioarele și pipotele și labele într-o oală de cel puțin 7 l, fără să le speli, și toarnă cei 2,5 l de apă rece.',
          ),
        },
        {
          key: 'wash',
          text: t(
            'Wash your hands, the board, the knife and the scissors with hot soapy water now, before touching anything else.',
            'Spală-ți acum mâinile, planșeta, cuțitul și foarfeca cu apă fierbinte și detergent, înainte să atingi altceva.',
          ),
        },
        {
          key: 'boil',
          text: t(
            'Bring to the boil over high heat, about 20 minutes. As grey foam rises, skim it off with a spoon, then turn the heat down to a bare simmer.',
            'Adu la fierbere la foc mare, cam 20 de minute. Pe măsură ce se ridică spuma cenușie, ia-o cu o lingură, apoi dă focul mic, ca să fiarbă abia perceptibil.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Simmer gently for 30 minutes, skimming any new foam, so the broth stays clear.',
            'Fierbe domol 30 de minute, luând spuma care mai apare, ca zeama să rămână limpede.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'vegetables',
          text: t(
            'Add the onion, carrot, parsley root, celeriac, kohlrabi, garlic, peppercorns and 8 g of the salt. Bring back to a bare simmer and cook for 20 minutes.',
            'Adaugă ceapa, morcovul, rădăcina de pătrunjel, țelina, gulia, usturoiul, piperul boabe și 8 g din sare. Readu la fierbere domoală și gătește 20 de minute.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'pepper',
          text: t(
            'Add the pepper, tomato, the tied parsley and the lovage, if using, and simmer for 10 minutes, until a gizzard is tender: lift one out onto a plate, cut it and bite a piece. It should give easily, with a slight spring. If it is still tough, simmer on and check another piece every 10 minutes, topping up with hot water if the level drops below the meat.',
            'Adaugă ardeiul, roșia, pătrunjelul legat și leușteanul, dacă folosești, și fierbe 10 minute, până când pipota e fragedă: scoate una pe o farfurie, taie-o și gustă o bucată. Trebuie să se muște ușor, cu puțină elasticitate. Dacă e încă tare, mai fierbe și verifică o altă bucată din 10 în 10 minute, adăugând apă fierbinte dacă nivelul scade sub carne.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'noodles',
          text: t(
            'Bring the 1.5 l of noodle water to the boil with 7 g of salt in a separate pot of at least 3 l, about 8 minutes. Add the vermicelli and cook for 4 minutes, or as the packet says, until soft, then drain. Keep the soup hot on low heat meanwhile.',
            'Adu la fierbere cei 1,5 l de apă pentru fidea cu 7 g de sare într-o oală separată de cel puțin 3 l, cam 8 minute. Adaugă fideaua și fierbe 4 minute, sau cât scrie pe pachet, până se înmoaie, apoi scurge-o. Între timp ține supa fierbinte, la foc mic.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'pick',
          text: t(
            'With a slotted spoon, lift the feet, onion, tomato, pepper, tied parsley and lovage out onto a plate and throw them away. Lift out the necks, backs and wings with tongs onto a clean plate and pick the meat off the bones, then throw the bones away. Cut the gizzards and hearts into bite-size pieces on the plate, then return all the meat to the pot.',
            'Cu o lingură cu găuri, scoate labele, ceapa, roșia, ardeiul, pătrunjelul legat și leușteanul pe o farfurie și aruncă-le. Scoate cu o pensă gâturile, spinările și aripioarele pe o farfurie curată și desprinde carnea de pe oase, apoi aruncă oasele. Taie pipotele și inimioarele în bucăți mici pe farfurie, apoi pune toată carnea înapoi în oală.',
          ),
        },
        {
          key: 'finish',
          text: t(
            'Take the pot off the heat and stir in the nutmeg. Taste and add the rest of the salt, up to 7 g, a pinch at a time. Put the noodles in hot bowls and ladle the soup over them.',
            'Ia oala de pe foc și amestecă nucșoara. Gustă și pune restul de sare, până la 7 g, câte un praf. Pune fideaua în boluri calde și toarnă supa peste ea.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Divide the leftover soup and noodles into separate shallow containers so they cool quickly, and put them in the fridge within 2 hours. Eat within 3 to 4 days and reheat until steaming hot.',
            'Împarte supa rămasă și fideaua în recipiente separate, puțin adânci, ca să se răcească repede, și pune-le la frigider în cel mult 2 ore. Consumă-le în 3-4 zile și încălzește-o până scoate aburi.',
          ),
        },
      ],
      tips: [
        t(
          'Noodles left in the broth keep soaking it up and go soft in the fridge, which is why they are boiled separately and added to each bowl. Keep any leftover noodles apart from the soup.',
          'Fideaua rămasă în zeamă continuă să absoarbă zeama și se înmoaie la frigider, de aceea e fiartă separat și pusă în fiecare bol. Păstrează fideaua rămasă separat de supă.',
        ),
      ],
      stepTips: [
        {
          step: 'simmer',
          text: t(
            'Keep the heat low: a hard boil clouds the broth and toughens the gizzards.',
            'Păstrează focul mic: fierberea tare tulbură zeama și întărește pipotele.',
          ),
        },
      ],
      nutritionNote: t(
        'Protein from the giblets and fibre from plenty of vegetables, with no added fat; the vermicelli adds starch. Skim the fat off the top if you want it lighter. The salt is the main thing to watch, so season at the end and taste first.',
        'Proteine din potroace și fibre din multe legume, fără grăsime adăugată; fideaua adaugă amidon. Ia grăsimea de deasupra dacă vrei o supă mai ușoară. Sarea e lucrul de urmărit, așa că sărează la final și gustă înainte.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Fresh bread', 'Pâine proaspătă'),
          reason: t(
            'A slice with a crust goes well with the clear, light broth.',
            'O felie cu crustă se potrivește cu zeama limpede și ușoară.',
          ),
          principle: 'contrast_texture',
          ingredient: 'bread',
        },
        {
          kind: 'food',
          label: t('Hot pepper', 'Ardei iute'),
          reason: t(
            'A bite of hot pepper adds heat to the mild broth.',
            'O îmbucătură de ardei iute adaugă iuțeală zemii blânde.',
          ),
          principle: 'complement_flavour',
          ingredient: 'hot-pepper',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Hot, clear noodle soup that warms you through.',
            'O supă fierbinte, limpede, cu fidea, care te încălzește.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A big bowl of soup with noodles and bread is a filling meal to go to bed on.',
            'Un bol mare de supă cu fidea și pâine e o masă săturătoare înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
