import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Ciorbă de pui base is the everyday Romanian chicken soup with a mix of
// diced root vegetables, soured with borș (boiled separately) and finished with
// lovage. Each Variant is a full Recipe with its own lines, steps and guidance;
// the base's Recipe-level Tips are inherited unless hidden.
export const ciorbaDePui: BaseRecipeSeed = {
  slug: 'ciorba-de-pui',
  title: t(
    'Romanian chicken sour soup (ciorbă de pui)',
    'Ciorbă de pui cu legume și leuștean',
  ),
  servings: 6,
  prepMinutes: 25,
  cookMinutes: 90,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'chicken-leg-quarters',
      quantity: 1200,
      unit: 'g',
      note: t('bone in, skin on', 'cu os și piele'),
    },
    { ingredient: 'still-water', quantity: 3, unit: 'l' },
    {
      ingredient: 'onion',
      key: 'onion-stock',
      quantity: 1,
      unit: 'pcs',
      note: t(
        'peeled, left whole, for the stock',
        'curățată, întreagă, pentru supă',
      ),
    },
    { ingredient: 'peppercorns', quantity: 3, unit: 'g' },
    {
      ingredient: 'bay-leaves',
      quantity: 0.4,
      unit: 'g',
      note: t('2 leaves', '2 foi'),
    },
    {
      ingredient: 'onion',
      key: 'onion-diced',
      quantity: 1,
      unit: 'pcs',
      note: t('diced small', 'tăiată cubulețe mici'),
    },
    {
      ingredient: 'carrot',
      quantity: 250,
      unit: 'g',
      note: t('diced small', 'tăiați cubulețe mici'),
    },
    {
      ingredient: 'parsley-root',
      quantity: 80,
      unit: 'g',
      note: t('diced small', 'tăiată cubulețe mici'),
    },
    {
      ingredient: 'parsnip',
      quantity: 100,
      unit: 'g',
      note: t('diced small', 'tăiat cubulețe mici'),
    },
    {
      ingredient: 'celeriac',
      quantity: 150,
      unit: 'g',
      note: t('diced small', 'tăiată cubulețe mici'),
    },
    {
      ingredient: 'bell-pepper',
      quantity: 1,
      unit: 'pcs',
      note: t('red, diced', 'roșu, tăiat cubulețe'),
    },
    { ingredient: 'sunflower-oil', quantity: 45, unit: 'ml' },
    {
      ingredient: 'round-rice',
      quantity: 80,
      unit: 'g',
      optional: true,
      note: t('rinsed', 'spălat'),
    },
    {
      ingredient: 'tomato',
      quantity: 250,
      unit: 'g',
      note: t('ripe, diced', 'coapte, tăiate cubulețe'),
    },
    {
      ingredient: 'ciorba-sour-base',
      quantity: 500,
      unit: 'ml',
      note: t('boiled separately', 'fiert separat'),
    },
    {
      ingredient: 'lemon-juice',
      quantity: 20,
      unit: 'ml',
      optional: true,
      note: t('to adjust the sourness', 'pentru a potrivi aciditatea'),
    },
    {
      ingredient: 'lovage',
      quantity: 30,
      unit: 'g',
      note: t(
        'leaves and tender stalks, chopped',
        'frunze și tulpini fragede, tocate',
      ),
    },
    {
      ingredient: 'parsley',
      quantity: 20,
      unit: 'g',
      note: t('chopped', 'tocat'),
    },
    { ingredient: 'salt', quantity: 18, unit: 'g' },
    {
      ingredient: 'hot-pepper',
      quantity: 2,
      unit: 'pcs',
      optional: true,
      note: t('fresh, to bite on the side', 'proaspăt, de mușcat alături'),
    },
  ],
  steps: [
    {
      key: 'start',
      text: t(
        'Put the chicken in a 6 litre pot, cover with the cold water and bring slowly to the boil over medium heat, about 20 minutes. As the grey foam rises, skim it off with a spoon. Wash your hands, the board and the knife in hot soapy water now, before you touch anything else.',
        'Pune pulpele într-o oală de 6 litri, acoperă-le cu apa rece și adu încet la fierbere, la foc mediu, în vreo 20 de minute. Pe măsură ce se ridică spuma cenușie, ia-o cu lingura. Spală-ți acum mâinile, tocătorul și cuțitul cu apă caldă și săpun, înainte să mai atingi altceva.',
      ),
    },
    {
      key: 'simmer',
      text: t(
        'Add the whole onion, the peppercorns, the bay leaves and 12 g of the salt. Turn the heat down to a bare simmer, with the lid ajar, and cook for 40 minutes.',
        'Adaugă ceapa întreagă, boabele de piper, foile de dafin și 12 g din sare. Dă focul mic, ca supa să fiarbă abia perceptibil, pune capacul întredeschis și lasă 40 de minute.',
      ),
      timerSeconds: 2400,
    },
    {
      key: 'dice',
      text: t(
        'While the stock simmers, dice the second onion, the carrots, parsley root, parsnip, celeriac and bell pepper into small cubes, about 1 cm.',
        'Cât timp fierbe supa, taie cealaltă ceapă, morcovii, rădăcina de pătrunjel, păstârnacul, țelina și ardeiul gras în cubulețe mici, de vreo 1 cm.',
      ),
    },
    {
      key: 'soften',
      text: t(
        'Warm the sunflower oil in a wide pan over medium-low heat. Soften the onion for 3 minutes, then add the other vegetables and cook 7 more minutes, stirring, until they are soft and shiny but not browned.',
        'Încălzește uleiul într-o tigaie mare, la foc mic-mediu. Călește ușor ceapa 3 minute, apoi adaugă restul legumelor și mai ține 7 minute, amestecând, până se înmoaie și devin lucioase, fără să se rumenească.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'vegetables',
      text: t(
        'When the 40 minutes are up, scrape the softened vegetables into the pot, add the rice if you use it, bring back to a gentle simmer and cook for 10 minutes.',
        'După cele 40 de minute, varsă legumele înăbușite în oală, adaugă orezul, dacă pui, readu supa la un clocot ușor și lasă 10 minute.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'bors',
      text: t(
        'While the vegetables simmer, bring the borș to the boil in a small saucepan and boil it for 2 minutes. Take it off the heat.',
        'Cât timp fierb legumele, adu borșul la fiert într-o cratiță mică și ține-l la fiert 2 minute. Dă-l de pe foc.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'tomatoes',
      text: t(
        'Stir the diced tomatoes into the pot and simmer for 5 minutes, until the vegetables are tender and the rice, if used, is soft.',
        'Pune roșiile tăiate cubulețe în oală și lasă la fiert 5 minute, până se înmoaie legumele și orezul, dacă ai pus.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'chicken',
      text: t(
        'Lift the chicken onto a clean plate. Check the thickest piece next to the bone: it must read 75 °C, the juices must run clear and the meat must come away from the bone. If not, put it back in the soup for 10 more minutes. Once it is cool enough to handle, discard the skin and bones, tear the meat into bite-sized pieces and return it to the pot. Wash your hands afterwards.',
        'Scoate pulpele pe o farfurie curată. Înfige termometrul în bucata cea mai groasă, lângă os: trebuie să arate 75 °C, zeama să iasă limpede, iar carnea să se desprindă ușor de pe os. Dacă nu, pune-o înapoi în supă încă 10 minute. Când se răcește destul cât să o poți ține în mână, aruncă pielea și oasele, rupe carnea în bucăți mici și pune-o înapoi în oală. Spală-te pe mâini după aceea.',
      ),
    },
    {
      key: 'sour',
      text: t(
        'Take the pot off the heat and fish out the whole onion and the bay leaves. Stir in about 350 ml of the boiled borș, taste, and add the rest a little at a time until the soup is pleasantly sour. Use the lemon juice if you want it sourer. Then add salt, up to the remaining 6 g, until it tastes right.',
        'Ia oala de pe foc și scoate ceapa întreagă și foile de dafin. Amestecă vreo 350 ml din borșul fiert, gustă și adaugă restul puțin câte puțin, până ciorba e plăcut de acră. Dacă vrei mai acră, adaugă zeamă de lămâie. La final potrivește de sare, până la cele 6 g rămase.',
      ),
    },
    {
      key: 'herbs',
      text: t(
        'Stir in the lovage and the parsley, cover and leave 2 minutes off the heat. Serve in hot bowls, with a fresh hot pepper on the side if you like.',
        'Pune leușteanul și pătrunjelul, acoperă și lasă 2 minute pe loc, fără foc. Servește în boluri calde, cu un ardei iute proaspăt alături, dacă îți place.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'store',
      text: t(
        'Cool any leftovers within 2 hours and keep them in the fridge for up to 3 days, or 1 day if you made it with rice. Reheat until it boils.',
        'Dacă rămâne ciorbă, răcește-o în cel mult 2 ore și ține-o la frigider cel mult 3 zile, sau o zi dacă ai făcut-o cu orez. Reîncălzește-o până dă în clocot.',
      ),
    },
  ],
  tips: [
    t(
      'Souring is a matter of taste and borș differs from one jar to the next: add it a little at a time and taste after each addition, because you can add sourness but you cannot take it out.',
      'Acreala se potrivește din gust, iar borșul diferă de la un borcan la altul: pune-l pe rând, puțin câte puțin, și gustă după fiecare adăugare, pentru că poți adăuga oricând acreală, dar nu o mai poți scoate.',
    ),
    t(
      'Keep the soup at a bare simmer, a few lazy bubbles, never a hard boil: a hard boil clouds the broth and toughens the meat.',
      'Ține ciorba la foc mic, cu bulbuci rari, niciodată la fiert tare: fierberea tare tulbură supa și întărește carnea.',
    ),
  ],
  stepTips: [
    {
      step: 'start',
      text: t(
        'Start with cold water, not hot: the chicken gives its flavour to the water as it warms, and the scum is easy to catch at the surface.',
        'Începe cu apă rece, nu fierbinte: carnea își lasă gustul în apă pe măsură ce se încălzește, iar spuma se strânge ușor deasupra.',
      ),
    },
    {
      step: 'soften',
      text: t(
        'Keep the heat gentle and do not brown the vegetables: browned ones turn the clear, light soup dark and heavy.',
        'Ține focul blând și nu rumeni legumele: cele rumenite fac ciorba, care trebuie să fie limpede și ușoară, întunecată și grea.',
      ),
    },
    {
      step: 'herbs',
      text: t(
        'Add the lovage at the very end: its strong smell fades and dulls the longer it cooks.',
        'Pune leușteanul chiar la sfârșit: mirosul lui puternic se pierde și se tocește cu cât fierbe mai mult.',
      ),
    },
  ],
  nutritionNote: t(
    'Chicken protein and plenty of vegetables in a light broth: filling for the size, and the oil is a modest amount of mostly unsaturated fat. The skin-on legs add some fat, which you can skim, and salt builds up from the pot, so taste before adding more; rice adds starch.',
    'Proteine din pui și multe legume într-o supă ușoară: săturătoare pentru cât e de ușoară, iar uleiul e o cantitate mică de grăsime mai ales nesaturată. Pulpele cu piele aduc ceva grăsime, pe care o poți lua de deasupra, iar sarea se adună din oală, deci gustă înainte să mai pui; orezul adaugă amidon.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Fresh bread', 'Pâine proaspătă'),
      reason: t(
        'To mop up the sour broth, and the soft crumb is a plain contrast to the vegetables.',
        'Pentru a șterge farfuria de supa acrișoară, iar miezul moale contrastează cu legumele.',
      ),
      principle: 'contrast_texture',
      ingredient: 'bread',
    },
    {
      kind: 'food',
      label: t('A spoonful of sour cream', 'O lingură de smântână'),
      reason: t(
        'Its creaminess softens the sourness of the borș bowl by bowl, as each eater likes.',
        'Cremozitatea ei îndulcește acreala borșului, în funcție de gustul fiecăruia, direct în farfurie.',
      ),
      principle: 'fat_carries_flavour',
      ingredient: 'sour-cream',
    },
    {
      kind: 'food',
      label: t('Pickled peppers', 'Ardei murați'),
      reason: t(
        'A sharp, crunchy bite alongside the soft vegetables of the soup.',
        'O îmbucătură ascuțită și crocantă, lângă legumele moi din ciorbă.',
      ),
      principle: 'contrast_texture',
      ingredient: 'pickled-peppers',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot, sour soup that warms you from the inside.',
        'O supă fierbinte și acrișoară, care te încălzește pe dinăuntru.',
      ),
    },
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'Filling from chicken and vegetables without feeling heavy.',
        'Săturătoare, din pui și legume, fără să te îngreuneze.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A sour, hot soup can bring on heartburn when you lie down soon after.',
        'O supă acră și fierbinte poate da arsuri dacă te culci la scurt timp după ea.',
      ),
    },
  ],
  variants: [
    {
      slug: 'ciorba-de-pui-russian',
      cuisine: 'russian',
      // The sourness here comes from pickles and their brine, not borș.
      hideBaseTips: [0],
      title: t(
        'Rassolnik (Russian chicken soup with pickles and pearl barley)',
        'Rassolnik (supă rusească de pui cu castraveți murați și arpacaș)',
      ),
      servings: 6,
      prepMinutes: 25,
      cookMinutes: 85,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'chicken-leg-quarters',
          quantity: 1000,
          unit: 'g',
          note: t('bone in, skin on', 'cu os și piele'),
        },
        { ingredient: 'still-water', quantity: 3, unit: 'l' },
        {
          ingredient: 'onion',
          key: 'onion-stock',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'peeled, left whole, for the stock',
            'curățată, întreagă, pentru supă',
          ),
        },
        { ingredient: 'peppercorns', quantity: 3, unit: 'g' },
        {
          ingredient: 'bay-leaves',
          quantity: 0.4,
          unit: 'g',
          note: t('2 leaves', '2 foi'),
        },
        {
          ingredient: 'pearl-barley',
          quantity: 100,
          unit: 'g',
          note: t('rinsed', 'spălat'),
        },
        {
          ingredient: 'still-water',
          key: 'barley-water',
          quantity: 0.6,
          unit: 'l',
          note: t('for cooking the barley', 'pentru fiertul arpacașului'),
        },
        {
          ingredient: 'potato',
          quantity: 0.5,
          unit: 'kg',
          note: t(
            'peeled, diced 1.5 cm',
            'curățați, tăiați cubulețe de 1,5 cm',
          ),
        },
        {
          ingredient: 'onion',
          key: 'onion-diced',
          quantity: 1,
          unit: 'pcs',
          note: t('diced', 'tăiată cubulețe'),
        },
        {
          ingredient: 'carrot',
          quantity: 200,
          unit: 'g',
          note: t('coarsely grated', 'rasă grosier'),
        },
        { ingredient: 'sunflower-oil', quantity: 40, unit: 'ml' },
        {
          ingredient: 'pickled-cucumbers',
          quantity: 300,
          unit: 'g',
          note: t(
            "brine-fermented (not vinegar), grated or diced; keep about 150 ml of the jar's brine",
            'murați în saramură (nu în oțet), rași sau tăiați cubulețe; păstrează vreo 150 ml din zeama din borcan',
          ),
        },
        {
          ingredient: 'tomato-paste',
          quantity: 30,
          unit: 'g',
          optional: true,
        },
        {
          ingredient: 'dill',
          quantity: 20,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'parsley',
          quantity: 15,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'salt',
          quantity: 6,
          unit: 'g',
          note: t(
            'only for the stock; the pickles and brine add more',
            'doar pentru supă; murăturile și zeama mai adaugă sare',
          ),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        {
          ingredient: 'sour-cream',
          quantity: 150,
          unit: 'g',
          note: t('a spoonful in each bowl', 'câte o lingură în fiecare bol'),
        },
      ],
      steps: [
        {
          key: 'start',
          text: t(
            'Put the chicken in a 6 litre pot, cover with the 3 litres of cold water and bring slowly to the boil over medium heat, about 20 minutes. Skim off the grey foam as it rises. Wash your hands, the board and the knife in hot soapy water now.',
            'Pune pulpele într-o oală de 6 litri, acoperă-le cu cei 3 litri de apă rece și adu încet la fierbere, la foc mediu, în vreo 20 de minute. Ia spuma cenușie pe măsură ce se ridică. Spală-ți acum mâinile, tocătorul și cuțitul cu apă caldă și săpun.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Add the whole onion, the peppercorns, the bay leaves and the 6 g of salt. Turn the heat down to a bare simmer, with the lid ajar, and cook for 40 minutes.',
            'Adaugă ceapa întreagă, boabele de piper, foile de dafin și cele 6 g de sare. Dă focul mic, ca supa să fiarbă abia perceptibil, pune capacul întredeschis și lasă 40 de minute.',
          ),
          timerSeconds: 2400,
        },
        {
          key: 'barley',
          text: t(
            'While the stock simmers, put the rinsed barley in a small pot with the 0.6 litres of water and simmer, covered, for 35 minutes, until tender but still a little chewy. Cooked in its own pot, it does not cloud the soup.',
            'Cât timp fierbe supa, pune arpacașul spălat într-o oală mică cu cei 0,6 litri de apă și fierbe-l acoperit 35 de minute, până se moaie, dar rămâne puțin elastic. Fiert separat, nu tulbură ciorba.',
          ),
          timerSeconds: 2100,
        },
        {
          key: 'soften',
          text: t(
            'Also while the stock simmers, soften the diced onion and the grated carrot in the oil over medium-low heat for 8 minutes, stirring, until soft and golden at the most.',
            'Tot cât timp fierbe supa, călește ceapa tăiată cubulețe și morcovul ras în ulei, la foc mic-mediu, 8 minute, amestecând, până se înmoaie și capătă cel mult o culoare aurie.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'pickles',
          text: t(
            'Add the pickled cucumbers and the tomato paste, if used, to the pan and stew for 5 minutes, until the pickles lose their raw crunch. Set aside.',
            'Adaugă în tigaie castraveții murați și pasta de roșii, dacă pui, și înăbușă 5 minute, până nu mai sunt crocanți. Dă deoparte.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'lift',
          text: t(
            'When the 40 minutes are up, lift the chicken onto a clean plate and fish out the whole onion and the bay leaves. Check the thickest piece next to the bone: it must read 75 °C, the juices must run clear and the meat must come away from the bone. If not, put it back in the soup for 10 more minutes.',
            'După cele 40 de minute, scoate pulpele pe o farfurie curată și ia ceapa întreagă și foile de dafin. Înfige termometrul în bucata cea mai groasă, lângă os: trebuie să arate 75 °C, zeama să iasă limpede, iar carnea să se desprindă de pe os. Dacă nu, pune-o înapoi în supă încă 10 minute.',
          ),
        },
        {
          key: 'potatoes',
          text: t(
            'Add the diced potatoes to the stock and simmer for 12 minutes. While they cook, discard the skin and bones from the chicken and tear the meat into bite-sized pieces. Wash your hands afterwards.',
            'Pune cartofii tăiați cubulețe în supă și fierbe-i 12 minute. Cât se fierb, aruncă pielea și oasele de la pui și rupe carnea în bucăți mici. Spală-te pe mâini după aceea.',
          ),
          timerSeconds: 720,
        },
        {
          key: 'combine',
          text: t(
            'Drain the barley and add it to the soup together with the stewed vegetables and pickles. Simmer for 5 more minutes, until the potatoes are tender.',
            'Scurge arpacașul și pune-l în ciorbă împreună cu legumele și castraveții înăbușiți. Mai lasă 5 minute la fiert, până se înmoaie cartofii.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'brine',
          text: t(
            'Return the chicken to the pot. Add the pickle brine a few spoonfuls at a time, tasting after each: it is salty, and the stock has only a little salt, so taste before adding any more, as often none is needed. Season with the pepper.',
            'Pune carnea înapoi în oală. Adaugă zeama de castraveți câteva linguri odată, gustând după fiecare: e sărată, iar supa are doar puțină sare, așa că gustă înainte să mai pui, pentru că de multe ori nu mai e nevoie. Pune piperul.',
          ),
        },
        {
          key: 'herbs',
          text: t(
            'Take the pot off the heat, stir in the dill and parsley and leave 2 minutes. Serve hot, with a spoonful of sour cream in each bowl.',
            'Ia oala de pe foc, amestecă mărarul și pătrunjelul și lasă 2 minute. Servește fierbinte, cu o lingură de smântână în fiecare bol.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'store',
          text: t(
            'Cool any leftovers within 2 hours and keep them in the fridge for up to 3 days. Reheat until it boils, adding a little water, because the barley thickens the soup as it stands.',
            'Dacă rămâne supă, răcește-o în cel mult 2 ore și ține-o la frigider cel mult 3 zile. Reîncălzește-o până dă în clocot, cu puțină apă, pentru că arpacașul îngroașă supa cât stă.',
          ),
        },
      ],
      tips: [
        t(
          'Buy cucumbers pickled in brine, not in vinegar: the soup needs their lactic sourness, and vinegar gherkins give a sharper, thinner taste.',
          'Ia castraveți murați în saramură, nu în oțet: ciorba are nevoie de acreala lor fermentată, iar cei din oțet dau un gust mai ascuțit și mai subțire.',
        ),
      ],
      stepTips: [
        {
          step: 'brine',
          text: t(
            'Brines differ a lot in saltiness. Taste the first spoonful on its own before it goes in, then add by the spoon.',
            'Saramurile diferă mult de la un borcan la altul cât de sărate sunt. Gustă prima lingură separat înainte s-o pui, apoi adaugă pe rând, cu lingura.',
          ),
        },
      ],
      nutritionNote: t(
        'Barley brings fibre and slower-digested starch, potato more starch, and the chicken and vegetables make it a full meal in a bowl. The pickles and brine add a lot of salt, and the sour cream adds some saturated fat, so it is a soup to enjoy now and then rather than daily if you watch your salt.',
        'Arpacașul aduce fibre și amidon digerat mai încet, iar cartofii mai mult amidon, iar puiul și legumele fac din ea o masă completă. Murăturile și zeama aduc multă sare, iar smântâna adaugă grăsimi saturate, deci e o supă de mâncat din când în când, nu zilnic, dacă ești atent la sare.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Rye bread', 'Pâine de secară'),
          reason: t(
            'Its dense, slightly sour crumb goes with the pickle-sour broth.',
            'Miezul ei dens și ușor acrișor merge cu supa acrișoară de murături.',
          ),
          principle: 'complement_flavour',
          ingredient: 'rye-bread',
        },
        {
          kind: 'drink',
          label: t('Kvass', 'Kvas'),
          reason: t(
            'A cold, lightly sour and malty drink that cleans the palate after the salty soup.',
            'O băutură rece, ușor acrișoară și maltată, care curăță gustul după supa sărată.',
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
            'Hot and hearty with barley and potatoes.',
            'Fierbinte și consistentă, cu arpacaș și cartofi.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from the chicken and starch from the barley and potatoes.',
            'Proteine din pui și amidon din arpacaș și cartofi.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Salty and filling, and it can leave you thirsty at night.',
            'Sărată și săturătoare, te poate lăsa însetat noaptea.',
          ),
        },
      ],
    },
    {
      slug: 'ciorba-de-pui-mexican',
      cuisine: 'mexican',
      // No borș here: lime is squeezed in at the table.
      hideBaseTips: [0],
      title: t(
        'Caldo de pollo (Mexican chicken soup with corn, lime and coriander)',
        'Caldo de pollo (supă mexicană de pui cu porumb, lime și coriandru)',
      ),
      servings: 6,
      prepMinutes: 20,
      cookMinutes: 80,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'chicken-drumsticks',
          quantity: 600,
          unit: 'g',
          note: t('bone in, skin on', 'cu os și piele'),
        },
        {
          ingredient: 'chicken-leg-quarters',
          quantity: 600,
          unit: 'g',
          note: t('bone in, skin on', 'cu os și piele'),
        },
        { ingredient: 'still-water', quantity: 2.5, unit: 'l' },
        {
          ingredient: 'onion',
          key: 'onion-pot',
          quantity: 1,
          unit: 'pcs',
          note: t('halved, peel on', 'tăiată în jumătăți, cu coajă'),
        },
        {
          ingredient: 'garlic',
          quantity: 20,
          unit: 'g',
          note: t('5 cloves, lightly crushed', '5 căței, zdrobiți ușor'),
        },
        {
          ingredient: 'coriander',
          key: 'coriander-pot',
          quantity: 20,
          unit: 'g',
          note: t('stalks, for the pot', 'tulpinile, pentru oală'),
        },
        {
          ingredient: 'bay-leaves',
          quantity: 0.4,
          unit: 'g',
          note: t('2 leaves', '2 foi'),
        },
        { ingredient: 'salt', quantity: 18, unit: 'g' },
        {
          ingredient: 'carrot',
          quantity: 300,
          unit: 'g',
          note: t(
            'peeled, cut into 4 cm chunks',
            'curățați, tăiați bucăți de 4 cm',
          ),
        },
        {
          ingredient: 'potato',
          quantity: 0.5,
          unit: 'kg',
          note: t(
            'peeled, cut into large chunks',
            'curățați, tăiați bucăți mari',
          ),
        },
        {
          ingredient: 'sweetcorn-cob',
          quantity: 2,
          unit: 'pcs',
          note: t('cut into 4 to 5 cm rounds', 'tăiați rondele de 4-5 cm'),
        },
        {
          ingredient: 'zucchini',
          quantity: 2,
          unit: 'pcs',
          note: t('cut into large chunks', 'tăiați bucăți mari'),
        },
        {
          ingredient: 'onion',
          key: 'onion-serve',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'finely chopped, for the table',
            'tocată mărunt, pentru masă',
          ),
        },
        {
          ingredient: 'coriander',
          key: 'coriander-serve',
          quantity: 20,
          unit: 'g',
          note: t(
            'leaves, chopped, for the table',
            'frunze, tocate, pentru masă',
          ),
        },
        {
          ingredient: 'hot-pepper',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'fresh green chilli, sliced, for the table',
            'ardei iute verde proaspăt, tăiat felii, pentru masă',
          ),
        },
        {
          ingredient: 'lime',
          quantity: 3,
          unit: 'pcs',
          note: t('cut into wedges', 'tăiate în sferturi'),
        },
        {
          ingredient: 'rice',
          quantity: 150,
          unit: 'g',
          optional: true,
          note: t(
            'for serving, cooked separately',
            'pentru servit, fiert separat',
          ),
        },
        {
          ingredient: 'still-water',
          key: 'rice-water',
          quantity: 0.3,
          unit: 'l',
          optional: true,
          note: t('for cooking the rice', 'pentru fiertul orezului'),
        },
        {
          ingredient: 'corn-tortillas',
          quantity: 12,
          unit: 'pcs',
          optional: true,
          note: t('warmed', 'încălzite'),
        },
      ],
      steps: [
        {
          key: 'start',
          text: t(
            'Put the drumsticks and leg quarters in a 6 litre pot, cover with the cold water and bring slowly to the boil over medium heat, about 20 minutes. Skim off the grey foam as it rises. Wash your hands, the board and the knife in hot soapy water now, before you touch anything else.',
            'Pune copănelele și pulpele întregi într-o oală de 6 litri, acoperă-le cu apa rece și adu încet la fierbere, la foc mediu, în vreo 20 de minute. Ia spuma cenușie pe măsură ce se ridică. Spală-ți acum mâinile, tocătorul și cuțitul cu apă caldă și săpun, înainte să mai atingi altceva.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Add the onion halves, the garlic, the coriander stalks, the bay leaves and 12 g of the salt. Turn the heat down to a bare simmer, with the lid ajar, and cook for 30 minutes.',
            'Adaugă jumătățile de ceapă, usturoiul, tulpinile de coriandru, foile de dafin și 12 g din sare. Dă focul mic, ca supa să fiarbă abia perceptibil, pune capacul întredeschis și lasă 30 de minute.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'vegetables',
          text: t(
            'Add the carrots, potatoes and corn rounds, bring back to a gentle simmer and cook for 12 minutes.',
            'Adaugă morcovii, cartofii și rondelele de porumb, readu la un clocot ușor și lasă 12 minute.',
          ),
          timerSeconds: 720,
        },
        {
          key: 'rice',
          text: t(
            'If you serve rice, as soon as the vegetables are in, start it in a separate pot; it is ready a few minutes before the soup: bring the rice and the 0.3 litres of water to the boil, cover, cook on the lowest heat for 12 minutes and leave it covered for 5 more.',
            'Dacă servești cu orez, imediat ce ai pus legumele, pune-l într-o oală separată; e gata cu câteva minute înainte de ciorbă: adu orezul și cei 0,3 litri de apă la fiert, acoperă, ține-l 12 minute la foc foarte mic și lasă-l acoperit încă 5 minute.',
          ),
          timerSeconds: 720,
        },
        {
          key: 'zucchini',
          text: t(
            'Add the zucchini and simmer for 8 more minutes, until the carrots and potatoes are tender when pierced with a knife.',
            'Adaugă dovleceii și mai ține 8 minute la fiert, până se înmoaie morcovii și cartofii când îi înțepi cu cuțitul.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'check',
          text: t(
            'Check the thickest chicken piece next to the bone: it must read 75 °C, the juices must run clear and the meat must come away from the bone. If not, simmer 10 more minutes. Then fish out the onion halves, the coriander stalks and the bay leaves, and add the remaining 6 g of salt, to taste.',
            'Înfige termometrul în bucata cea mai groasă de pui, lângă os: trebuie să arate 75 °C, zeama să iasă limpede, iar carnea să se desprindă de pe os. Dacă nu, mai fierbe 10 minute. Apoi scoate jumătățile de ceapă, tulpinile de coriandru și foile de dafin și potrivește de sare cu cele 6 g rămase, după gust.',
          ),
        },
        {
          key: 'table',
          text: t(
            'On a clean board, chop the raw onion, the coriander leaves and the chilli, and cut the limes. Warm the tortillas in a dry pan, if you use them. Wash your hands after touching the chicken and before the garnishes.',
            'Pe un tocător curat, taie ceapa crudă, frunzele de coriandru și ardeiul iute și taie lime în sferturi. Încălzește tortillas într-o tigaie uscată, dacă le folosești. Spală-te pe mâini după ce ai atins puiul și înainte de garnituri.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Serve in deep bowls, each with a piece of chicken on the bone, a few vegetables and plenty of broth. Put the onion, coriander, chilli, lime wedges and the rice on the table for everyone to add.',
            'Servește în boluri adânci, fiecare cu o bucată de pui cu os, câteva legume și multă supă. Pune pe masă ceapa, coriandrul, ardeiul iute, sferturi de lime și orezul, ca fiecare să-și adauge după gust.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Cool any leftovers within 2 hours and keep the soup in the fridge for up to 3 days; keep any rice apart and eat it within 1 day. Reheat the soup until it boils.',
            'Dacă rămâne supă, răcește-o în cel mult 2 ore și ține-o la frigider cel mult 3 zile; orezul rămas ține-l separat și mănâncă-l în cel mult o zi. Reîncălzește supa până dă în clocot.',
          ),
        },
      ],
      tips: [
        t(
          'Squeeze the lime into your own bowl, not into the pot: its fresh smell fades when it is cooked or left to stand.',
          'Stoarce lime în bolul tău, nu în oală: mirosul ei proaspăt se pierde dacă fierbe sau stă.',
        ),
      ],
      stepTips: [
        {
          step: 'vegetables',
          text: t(
            'Keep the vegetables in large chunks: in a soup that is served with a chicken piece on the bone, small cubes would cook to mush.',
            'Păstrează legumele în bucăți mari: într-o supă servită cu pui cu os, cubulețele s-ar face terci.',
          ),
        },
      ],
      nutritionNote: t(
        'A broth-based meal with chicken protein, and carrots, zucchini, potato and corn bringing fibre and starch. The skin-on legs add some fat, which you can skim off or leave on the plate, and the salt is yours to control; rice and tortillas make it heavier on starch.',
        'O masă pe bază de supă, cu proteine din pui, iar morcovii, dovleceii, cartofii și porumbul aduc fibre și amidon. Pulpele cu piele adaugă ceva grăsime, pe care o poți lua de deasupra sau o poți lăsa în farfurie, iar sarea o controlezi tu; orezul și tortillas o fac mai bogată în amidon.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Sliced avocado', 'Avocado feliat'),
          reason: t(
            'Its soft, rich flesh is a cool contrast to the hot, thin broth.',
            'Pulpa lui moale și bogată contrastează cu supa fierbinte și subțire.',
          ),
          principle: 'contrast_texture',
          ingredient: 'avocado',
        },
        {
          kind: 'drink',
          label: t('Cold beer', 'Bere rece'),
          reason: t(
            'Light and bubbly, it cleans the palate between spoonfuls.',
            'Ușoară și cu bule, curăță gustul între lingurile de supă.',
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
            'A big hot bowl with chunky vegetables.',
            'Un bol mare și fierbinte, cu legume în bucăți mari.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Chicken protein, with potato and corn for carbohydrate.',
            'Proteine din pui, cu cartofi și porumb pentru carbohidrați.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A big bowl with meat on the bone is too much to lie down on.',
            'Un bol mare, cu carne cu os, e prea mult înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
