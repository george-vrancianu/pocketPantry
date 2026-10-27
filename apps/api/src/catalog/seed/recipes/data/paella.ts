import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Paella base is paella mixta (chicken, squid, prawns and mussels). The
// Variants are paella valenciana (chicken, rabbit and beans, cooked in water)
// and arròs al forn (rice baked in the oven with pork, morcilla and chickpeas).
// Each Variant is a full Recipe; the base's Recipe-level Tips are inherited.
export const paella: BaseRecipeSeed = {
  slug: 'paella',
  title: t(
    'Chicken and seafood paella (paella mixta)',
    'Paella cu pui și fructe de mare (paella mixta)',
  ),
  servings: 4,
  prepMinutes: 25,
  cookMinutes: 55,
  difficulty: 'medium',
  lines: [
    { ingredient: 'paella-rice', quantity: 320, unit: 'g' },
    { ingredient: 'olive-oil', quantity: 60, unit: 'ml' },
    {
      ingredient: 'chicken-thighs',
      quantity: 400,
      unit: 'g',
      note: t('cut into 3 cm pieces', 'tăiate în bucăți de 3 cm'),
    },
    {
      ingredient: 'squid',
      quantity: 200,
      unit: 'g',
      note: t(
        'cleaned, cut into 1 cm rings',
        'curățat, tăiat în inele de 1 cm',
      ),
    },
    {
      ingredient: 'prawns',
      quantity: 300,
      unit: 'g',
      note: t(
        'raw, shell on (head on if you can get them)',
        'crude, cu carapace (cu cap, dacă găsești)',
      ),
    },
    {
      ingredient: 'mussels',
      quantity: 500,
      unit: 'g',
      note: t('live, in the shell', 'vii, în cochilie'),
    },
    {
      ingredient: 'onion',
      quantity: 1,
      unit: 'pcs',
      note: t('finely diced', 'tăiată mărunt'),
    },
    {
      ingredient: 'bell-pepper',
      quantity: 1,
      unit: 'pcs',
      note: t('red, cut into strips', 'roșu, tăiat fâșii'),
    },
    {
      ingredient: 'garlic',
      quantity: 12,
      unit: 'g',
      note: t('about 3 cloves, minced', 'aproximativ 3 căței, tocați'),
    },
    {
      ingredient: 'tomato',
      quantity: 250,
      unit: 'g',
      note: t(
        'grated on the large holes, skin discarded',
        'dați pe răzătoarea mare, fără coajă',
      ),
    },
    {
      ingredient: 'paprika',
      quantity: 3,
      unit: 'g',
      note: t('sweet', 'dulce'),
    },
    {
      ingredient: 'saffron',
      quantity: 0.3,
      unit: 'g',
      note: t('a generous pinch of threads', 'un praf bun de fire'),
    },
    {
      ingredient: 'fish-stock',
      quantity: 1000,
      unit: 'ml',
      note: t('hot', 'fierbinte'),
    },
    { ingredient: 'salt', quantity: 6, unit: 'g' },
    {
      ingredient: 'frozen-peas',
      quantity: 100,
      unit: 'g',
      optional: true,
    },
    {
      ingredient: 'lemon',
      quantity: 1,
      unit: 'pcs',
      note: t('cut into wedges', 'tăiată felii'),
    },
  ],
  steps: [
    {
      key: 'stock',
      text: t(
        'Pour the fish stock into a pan, crumble in the saffron threads and bring to a simmer. Keep it hot over the lowest heat while you prepare everything else.',
        'Toarnă supa de pește într-o cratiță, mărunțește în ea firele de șofran și adu la fierbere mică. Ține-o fierbinte la foc foarte mic cât pregătești restul.',
      ),
    },
    {
      key: 'prep-veg',
      text: t(
        'Dice the onion, cut the red pepper into strips, mince the garlic and grate the tomatoes, discarding the skins. Do the vegetables first, before any raw meat or seafood touches the board.',
        'Taie ceapa mărunt, ardeiul roșu fâșii, tocă usturoiul și dă roșiile pe răzătoare, aruncând cojile. Pregătește legumele primele, înainte ca vreo carne sau vreun fruct de mare crud să atingă tocătorul.',
      ),
    },
    {
      key: 'prep-seafood',
      text: t(
        'Scrub the mussels under cold water and pull off the beards. Tap each open mussel on the counter: if it does not close within a minute, throw it away, and throw away any with a cracked or broken shell. Pat the squid dry. Keep the mussels, squid and prawns in the fridge until you need them. Wash your hands, the board and the knife with hot soapy water.',
        'Freacă midiile sub apă rece și smulge-le bărbile. Lovește ușor fiecare midie deschisă de blat: dacă nu se închide într-un minut, aruncă-o, la fel ca pe cele cu cochilia crăpată sau ruptă. Șterge calmarul cu un prosop de hârtie. Ține midiile, calmarul și creveții la frigider până ai nevoie de ei. Spală-ți mâinile, tocătorul și cuțitul cu apă fierbinte și săpun.',
      ),
    },
    {
      key: 'chicken',
      text: t(
        'Cut the chicken into 3 cm pieces on a clean board and sprinkle with 2 g of the salt. Heat the oil in a 38 to 40 cm paella pan over medium-high heat. Brown the chicken for about 9 minutes, turning, until golden all over and cooked through: a piece cut open has no pink and clear juices, or a probe in the thickest piece reads 75 °C. Push the chicken to the rim of the pan.',
        'Taie puiul în bucăți de 3 cm pe un tocător curat și presară peste el 2 g din sare. Încinge uleiul într-o tigaie de paella de 38-40 cm la foc mare-mediu. Rumenește puiul aproximativ 9 minute, întorcându-l, până e auriu peste tot și fript complet: o bucată tăiată nu mai are roz și are zeama limpede, sau un termometru în cea mai groasă bucată arată 75 °C. Împinge puiul spre marginea tigăii.',
      ),
      timerSeconds: 540,
    },
    {
      key: 'sofrito-base',
      text: t(
        'Wash your hands, the board and the knife after the raw chicken. Add the squid, onion and red pepper to the centre of the pan and cook for about 6 minutes, stirring, until the onion is soft and the squid is opaque white. Add the garlic for the last minute.',
        'Spală-ți mâinile, tocătorul și cuțitul după puiul crud. Pune calmarul, ceapa și ardeiul roșu în centrul tigăii și gătește aproximativ 6 minute, amestecând, până ceapa se înmoaie și calmarul devine alb opac. Adaugă usturoiul în ultimul minut.',
      ),
      timerSeconds: 360,
    },
    {
      key: 'tomato',
      text: t(
        'Add the grated tomato and cook for about 6 minutes, stirring now and then, until it is thick and jammy and the oil separates at the edges. This sofrito is where the flavour of the whole pan comes from.',
        'Adaugă roșiile rase și gătește aproximativ 6 minute, amestecând din când în când, până se îngroașă ca un gem și uleiul se separă pe margini. În acest sofrito stă gustul întregii tigăi.',
      ),
      timerSeconds: 360,
    },
    {
      key: 'stock-in',
      text: t(
        'Take the pan off the heat, stir in the paprika for 10 seconds (it scorches and turns bitter on strong heat), then pour in the hot saffron stock and add 4 g of salt. Bring to the boil and simmer for 3 minutes. Taste the liquid: it should be a little saltier than you would like to drink, because the rice will absorb it.',
        'Dă tigaia de pe foc, amestecă boiaua 10 secunde (arde și se amărăște la foc tare), apoi toarnă supa fierbinte cu șofran și adaugă 4 g de sare. Adu la fierbere și lasă să fiarbă 3 minute. Gustă lichidul: trebuie să fie puțin mai sărat decât ți-ar plăcea să-l bei, pentru că orezul îl va absorbi.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'rice',
      text: t(
        'Scatter the rice evenly over the whole pan, shake the pan once to level it, and do not stir again. Cook on high heat for about 10 minutes, rotating the pan over the burner so it cooks evenly, until the rice shows above the liquid.',
        'Presară orezul uniform pe toată tigaia, scutură tigaia o dată ca să-l nivelezi și nu mai amesteca. Gătește la foc mare aproximativ 10 minute, rotind tigaia deasupra arzătorului ca să se gătească uniform, până orezul apare deasupra lichidului.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'rice-lower',
      text: t(
        'Lower the heat to medium-low and tuck the mussels in hinge down. Cook for 3 minutes without stirring.',
        'Scade focul la mediu-mic și înfige midiile cu balamaua în jos. Gătește 3 minute, fără să amesteci.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'seafood',
      text: t(
        'Press the prawns into the rice and scatter over the peas, if using. Cook for 5 minutes, turning the prawns after 3 minutes. The prawns are done when pink and opaque all through (63 °C in the thickest part); the mussels, 8 minutes in, are done when they open. Throw away any mussel that stays shut. The rice should be cooked but still slightly firm at the centre of the grain, with the liquid gone; if the grains are still hard and the pan is dry, sprinkle over 50 ml of hot water from the kettle.',
        'Apasă creveții în orez și presară mazărea, dacă folosești. Gătește 5 minute, întorcând creveții după 3 minute. Creveții sunt gata când sunt roz și opaci în tot interiorul (63 °C în partea cea mai groasă); midiile, după 8 minute, sunt gata când se deschid. Aruncă orice midie care rămâne închisă. Orezul trebuie să fie fiert, dar încă ușor ferm în centrul boabei, fără lichid; dacă boabele sunt încă tari și tigaia e uscată, stropește cu 50 ml de apă fierbinte din fierbător.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'wash-seafood',
      text: t(
        'Wash your hands and anything that touched the raw seafood, including the bowl it sat in, before you touch the lemon, the cloth or the serving spoon.',
        'Spală-ți mâinile și tot ce a atins fructele de mare crude, inclusiv bolul în care au stat, înainte să atingi lămâia, prosopul sau lingura de servit.',
      ),
    },
    {
      key: 'socarrat',
      text: t(
        'Turn the heat to high for 1 to 2 minutes to make the socarrat, the toasted crust on the bottom. Listen for a light crackle and smell for toast; if it smells scorched, take the pan off the heat at once.',
        'Dă focul la maxim 1-2 minute ca să se facă socarrat, crusta rumenită de pe fund. Ascultă să se audă un pârâit ușor și să miroasă a pâine prăjită; dacă miroase a ars, dă tigaia imediat de pe foc.',
      ),
      timerSeconds: 90,
    },
    {
      key: 'rest',
      text: t(
        'Take the pan off the heat, cover it with a clean tea towel and rest it for 5 minutes so the rice finishes absorbing the liquid.',
        'Dă tigaia de pe foc, acoper-o cu un prosop curat de bucătărie și lasă-o să se odihnească 5 minute ca orezul să termine de absorbit lichidul.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'serve',
      text: t(
        'Serve straight from the pan with the lemon wedges. Do not leave the pan on the hob: spread leftovers thin in a shallow container and put them in the fridge within 1 to 2 hours, eat them within 1 day and reheat them only once, until steaming hot all the way through.',
        'Servește direct din tigaie, cu felii de lămâie. Nu lăsa tigaia pe aragaz: întinde ce rămâne într-un strat subțire într-un recipient plat și pune-l la frigider în 1-2 ore, mănâncă-l în cel mult o zi și încălzește-l o singură dată, până scoate aburi în tot interiorul.',
      ),
    },
  ],
  tips: [
    t(
      'The quantities are for a 38 to 40 cm paella pan, where the rice lies 1 to 1.5 cm deep. In a 30 cm frying pan make only half, otherwise the rice is too deep and cooks unevenly.',
      'Cantitățile sunt pentru o tigaie de paella de 38-40 cm, unde orezul stă într-un strat de 1-1,5 cm. Într-o tigaie de 30 cm fă doar jumătate, altfel orezul e prea gros și se gătește inegal.',
    ),
    t(
      'Taste the liquid before the rice goes in and fix the salt then. After that it is too late.',
      'Gustă lichidul înainte să intre orezul și corectează sarea atunci. După aceea e prea târziu.',
    ),
    t(
      'Once the rice is in the liquid, do not stir it. Stirring releases starch and makes it creamy, which is risotto, not paella.',
      'După ce orezul e în lichid, nu-l amesteca. Amestecatul eliberează amidonul și îl face cremos, adică risotto, nu paella.',
    ),
  ],
  stepTips: [
    {
      step: 'stock',
      text: t(
        'Steeping the saffron in hot stock for 10 minutes or more draws out far more colour and flavour than dropping dry threads into the pan.',
        'Dacă lași șofranul în supa fierbinte 10 minute sau mai mult, își scoate mult mai multă culoare și aromă decât dacă arunci firele uscate în tigaie.',
      ),
    },
    {
      step: 'tomato',
      text: t(
        'Be patient here. A watery sofrito leaves the rice pale and sour; wait until you can drag a spoon through it and see the pan bottom.',
        'Ai răbdare aici. Un sofrito apos lasă orezul palid și acru; așteaptă până poți trage lingura prin el și se vede fundul tigăii.',
      ),
    },
    {
      step: 'seafood',
      text: t(
        'A mussel that stays shut after cooking was most likely dead before it went in, so do not force it open.',
        'O midie care rămâne închisă după gătire era, cel mai probabil, moartă înainte să intre în tigaie, așa că nu o forța.',
      ),
    },
  ],
  nutritionNote: t(
    'Carbohydrate from the rice plus plenty of protein from the chicken, squid, prawns and mussels, with some vegetables from the pepper, tomato and peas. White rice has little fibre, and the stock, seafood and added salt make it fairly salty. The olive oil is mostly unsaturated fat, but there is a good amount of it; a green salad alongside adds fibre. Not for anyone allergic to shellfish or fish.',
    'Carbohidrați din orez și multe proteine din pui, calmar, creveți și midii, plus puține legume din ardei, roșii și mazăre. Orezul alb are puține fibre, iar supa, fructele de mare și sarea adăugată fac mâncarea destul de sărată. Uleiul de măsline are mai ales grăsimi nesaturate, dar este în cantitate destul de mare; o salată verde alături adaugă fibre. Nu este potrivită pentru cei alergici la fructe de mare sau pește.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Spanish tapas platter', 'Platou spaniol de tapas'),
      reason: t(
        'A few tapas to pick at while the paella cooks and rests fit a Spanish table; the platter has no rice, so it does not compete.',
        'Câteva tapas de ciugulit cât se gătește și se odihnește paella se potrivesc la o masă spaniolă; platoul nu are orez, deci nu concurează cu paella.',
      ),
      principle: 'regional_tradition',
      recipe: 'appetizer-platter-spanish',
    },
    {
      kind: 'food',
      label: t('Crisp green salad', 'Salată verde crocantă'),
      reason: t(
        'Crunchy leaves and a sharp dressing contrast with the soft rice and cut through the olive oil.',
        'Frunzele crocante și dressingul acrișor fac contrast cu orezul moale și taie din ulei.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'mixed-salad',
    },
    {
      kind: 'drink',
      label: t('Dry white wine', 'Vin alb sec'),
      reason: t(
        'Its acidity freshens the palate after the rich, saffron rice and goes well with the seafood.',
        'Aciditatea lui împrospătează gustul după orezul bogat cu șofran și merge bine cu fructele de mare.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'white-wine',
    },
    {
      kind: 'drink',
      label: t('Sparkling water', 'Apă minerală'),
      reason: t(
        'The bubbles clear the oil and salt from the mouth between bites.',
        'Bulele curăță gura de ulei și sare între îmbucături.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'sparkling-water',
    },
  ],
  eatingMoments: [
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Rice replaces energy and the chicken and seafood give protein for recovery.',
        'Orezul reface energia, iar puiul și fructele de mare dau proteine pentru refacere.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'It takes an hour at a hot pan and sits heavy in the heat.',
        'Cere o oră lângă o tigaie fierbinte și cade greu pe stomac pe căldură.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A big plate of rice and seafood is heavy just before bed.',
        'O farfurie mare de orez cu fructe de mare e grea chiar înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'paella-spanish',
      cuisine: 'spanish',
      title: t(
        'Paella valenciana (chicken, rabbit and green beans)',
        'Paella valenciana (cu pui, iepure și fasole verde)',
      ),
      servings: 4,
      prepMinutes: 740,
      cookMinutes: 100,
      difficulty: 'medium',
      lines: [
        { ingredient: 'paella-rice', quantity: 320, unit: 'g' },
        { ingredient: 'olive-oil', quantity: 80, unit: 'ml' },
        {
          ingredient: 'whole-chicken',
          quantity: 700,
          unit: 'g',
          note: t(
            'cut into small bone-in pieces of about 5 cm',
            'tăiat în bucăți mici cu os, de aproximativ 5 cm',
          ),
        },
        {
          ingredient: 'rabbit',
          quantity: 600,
          unit: 'g',
          note: t(
            'jointed and cut into small bone-in pieces of about 5 cm',
            'tranșat și tăiat în bucăți mici cu os, de aproximativ 5 cm',
          ),
        },
        {
          ingredient: 'flat-green-beans',
          quantity: 250,
          unit: 'g',
          note: t('cut into 4 cm pieces', 'tăiată în bucăți de 4 cm'),
        },
        {
          ingredient: 'garrofo-beans',
          quantity: 120,
          unit: 'g',
          note: t(
            'dried, soaked in cold water for 12 hours',
            'uscată, înmuiată 12 ore în apă rece',
          ),
        },
        {
          ingredient: 'tomato',
          quantity: 200,
          unit: 'g',
          note: t(
            'grated on the large holes, skin discarded',
            'dați pe răzătoarea mare, fără coajă',
          ),
        },
        {
          ingredient: 'paprika',
          quantity: 4,
          unit: 'g',
          note: t('sweet', 'dulce'),
        },
        {
          ingredient: 'saffron',
          quantity: 0.3,
          unit: 'g',
          note: t('a generous pinch of threads', 'un praf bun de fire'),
        },
        {
          ingredient: 'still-water',
          quantity: 1.5,
          unit: 'l',
          note: t('for the broth in the pan', 'pentru supa din tigaie'),
        },
        { ingredient: 'salt', quantity: 9, unit: 'g' },
        {
          ingredient: 'rosemary',
          quantity: 2,
          unit: 'g',
          optional: true,
          note: t('1 sprig', 'o crenguță'),
        },
      ],
      steps: [
        {
          key: 'garrofo-boil',
          text: t(
            'Drain the soaked garrofó beans and throw the soaking water away. Put them in a saucepan, cover with plenty of fresh cold water and bring to a rolling boil. Boil them hard, uncovered, for 10 minutes. Raw lima-type beans contain a natural toxin; soaking them, throwing the soaking water away, boiling them in plenty of fresh water and draining that cooking water make them safe to eat.',
            'Scurge fasolea garrofó înmuiată și aruncă apa de la înmuiat. Pune boabele într-o oală, acoperă-le cu multă apă proaspătă rece și adu la fierbere puternică. Fierbe-le tare, fără capac, 10 minute. Fasolea lima crudă conține o toxină naturală; înmuierea, aruncarea apei de la înmuiat, fierberea în multă apă proaspătă și scurgerea apei de fierbere o fac sigură de mâncat.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'garrofo-simmer',
          text: t(
            'Lower the heat to a gentle simmer and cook for about 45 minutes, until a bean squashes easily between two fingers and is creamy inside, not chalky. Keep them in their water until the pan is ready for them. Meanwhile, carry on with the next steps.',
            'Scade focul la fiert domol și gătește aproximativ 45 de minute, până când o boabă se strivește ușor între două degete și e cremoasă înăuntru, nu cretoasă. Lasă-le în apa lor până ai nevoie de ele în tigaie. Între timp continuă cu pașii următori.',
          ),
          timerSeconds: 2700,
        },
        {
          key: 'prep-veg',
          text: t(
            'While the beans boil, cut the green beans into 4 cm pieces and grate the tomatoes, discarding the skins. Do this before the raw meat is on the board.',
            'Cât fierb boabele, taie fasolea verde în bucăți de 4 cm și dă roșiile pe răzătoare, aruncând cojile. Fă asta înainte ca pe tocător să ajungă carnea crudă.',
          ),
        },
        {
          key: 'prep-meat',
          text: t(
            'Cut the chicken and rabbit into small bone-in pieces of about 5 cm on a clean board, or ask the butcher to do it. Sprinkle the meat with 3 g of the salt.',
            'Taie puiul și iepurele în bucăți mici cu os, de aproximativ 5 cm, pe un tocător curat, sau roagă măcelarul să le taie. Presară carnea cu 3 g din sare.',
          ),
        },
        {
          key: 'brown',
          text: t(
            'Heat the oil in a 38 to 40 cm paella pan over medium heat. Add the meat and brown it slowly for about 15 minutes, turning, until deep golden all over. Then wash your hands, the board and the knife with hot soapy water.',
            'Încinge uleiul într-o tigaie de paella de 38-40 cm la foc mediu. Adaugă carnea și rumenește-o încet aproximativ 15 minute, întorcând-o, până e aurie intens peste tot. Apoi spală-ți mâinile, tocătorul și cuțitul cu apă fierbinte și săpun.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'green-beans',
          text: t(
            'Push the meat to the rim, add the green beans to the centre and fry them for about 3 minutes, stirring, until they take on a little colour.',
            'Împinge carnea spre margine, pune fasolea verde în centru și prăjește-o aproximativ 3 minute, amestecând, până capătă puțină culoare.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'tomato',
          text: t(
            'Push the beans aside, add the grated tomato to the centre and cook for about 5 minutes, until thick and jammy. Take the pan off the heat, stir in the paprika for 10 seconds (it scorches and turns bitter on strong heat) and return it to the heat.',
            'Împinge fasolea într-o parte, pune roșiile rase în centru și gătește aproximativ 5 minute, până se îngroașă ca un gem. Dă tigaia de pe foc, amestecă boiaua 10 secunde (arde și se amărăște la foc tare) și pune tigaia la loc pe foc.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'water',
          text: t(
            'Pour in the water, crumble in the saffron, add 6 g of salt and bring to the boil, skimming off the foam. This takes about 8 minutes.',
            'Toarnă apa, mărunțește șofranul în ea, adaugă 6 g de sare și adu la fierbere, luând spuma. Durează aproximativ 8 minute.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'simmer',
          text: t(
            'Simmer for 30 minutes so the meat turns tender and the water becomes a broth. When about 10 minutes remain and the garrofó are tender, drain them and stir them into the pan.',
            'Fierbe domol 30 de minute, ca să se înmoaie carnea și apa să devină supă. Când mai rămân aproximativ 10 minute și boabele de garrofó sunt fragede, scurge-le și amestecă-le în tigaie.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'check',
          text: t(
            'Check the meat before the rice goes in: a probe near the bone should read 75 °C in the chicken and the rabbit, the juices should run clear and the meat should pull easily from the bone. Then adjust the liquid to about 1 litre, a depth of about 1 cm: boil it down if there is more, top up with hot water if there is less. Taste the liquid and correct the salt; it should be a little salty.',
            'Verifică carnea înainte să intre orezul: un termometru lângă os trebuie să arate 75 °C la pui și la iepure, zeama trebuie să fie limpede, iar carnea să se desprindă ușor de os. Apoi ajustează lichidul la aproximativ 1 litru, adică o adâncime de aproximativ 1 cm: fierbe-l dacă e mai mult, completează cu apă fierbinte dacă e mai puțin. Gustă lichidul și corectează sarea; trebuie să fie puțin sărat.',
          ),
        },
        {
          key: 'rice',
          text: t(
            'Scatter the rice evenly over the pan, shake the pan once to level it, and do not stir again. Cook on high heat for about 10 minutes, rotating the pan over the burner so it cooks evenly.',
            'Presară orezul uniform pe tigaie, scutură tigaia o dată ca să-l nivelezi și nu mai amesteca. Gătește la foc mare aproximativ 10 minute, rotind tigaia deasupra arzătorului ca să se gătească uniform.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'rice-lower',
          text: t(
            'Lower the heat to medium-low, lay the rosemary on top, if using, and cook for about 8 minutes, until the liquid is gone and the grains are cooked but still slightly firm at the centre.',
            'Scade focul la mediu-mic, pune rozmarinul deasupra, dacă folosești, și gătește aproximativ 8 minute, până dispare lichidul și boabele sunt fierte, dar încă ușor ferme în centru.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'socarrat',
          text: t(
            'Turn the heat to high for 1 to 2 minutes to make the socarrat, the toasted crust on the bottom. Listen for a light crackle and smell for toast; if it smells scorched, take the pan off the heat at once.',
            'Dă focul la maxim 1-2 minute ca să se facă socarrat, crusta rumenită de pe fund. Ascultă să se audă un pârâit ușor și să miroasă a pâine prăjită; dacă miroase a ars, dă tigaia imediat de pe foc.',
          ),
          timerSeconds: 90,
        },
        {
          key: 'rest',
          text: t(
            'Take the pan off the heat and lift out the rosemary sprig, if you used it. Cover the pan with a clean tea towel and rest it for 5 minutes.',
            'Dă tigaia de pe foc și scoate crenguța de rozmarin, dacă ai pus. Acoperă tigaia cu un prosop curat de bucătărie și lasă-o să se odihnească 5 minute.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'serve',
          text: t(
            'Serve straight from the pan. Do not leave the pan on the hob: spread leftovers thin in a shallow container and put them in the fridge within 1 to 2 hours, eat them within 1 day and reheat them only once, until steaming hot all the way through.',
            'Servește direct din tigaie. Nu lăsa tigaia pe aragaz: întinde ce rămâne într-un strat subțire într-un recipient plat și pune-l la frigider în 1-2 ore, mănâncă-l în cel mult o zi și încălzește-l o singură dată, până scoate aburi în tot interiorul.',
          ),
        },
      ],
      tips: [
        t(
          'There is no lemon on the table here: with the browned meat and beans the rice tastes best plain.',
          'Aici nu pune lămâie pe masă: cu carnea rumenită și fasolea, orezul are cel mai bun gust simplu.',
        ),
        t(
          'Keep the bones in. They give the water body and flavour, so the broth tastes of meat without any stock.',
          'Lasă oasele. Dau apei corp și aromă, așa că supa are gust de carne fără niciun bulion.',
        ),
      ],
      stepTips: [
        {
          step: 'garrofo-simmer',
          text: t(
            'Dried beans vary with age. If they are not tender after 45 minutes, keep simmering and top up with hot water; it cannot be rushed, and hard beans spoil the pan.',
            'Fasolea uscată diferă în funcție de vechime. Dacă nu e fragedă după 45 de minute, mai fierbe-o și completează cu apă fierbinte; nu se poate grăbi, iar boabele tari strică tigaia.',
          ),
        },
      ],
      nutritionNote: t(
        'Carbohydrate from the rice, protein from the chicken and rabbit, and fibre and plant protein from the green and lima-type beans. Rabbit is lean, but chicken on the bone adds some saturated fat from the skin. White rice has little fibre. Olive oil is mostly unsaturated, though there is a good amount of it; the salt comes from what you add, as there is no stock.',
        'Carbohidrați din orez, proteine din pui și iepure, plus fibre și proteine vegetale din fasolea verde și fasolea lima. Iepurele este slab, dar puiul cu os și piele adaugă ceva grăsimi saturate. Orezul alb are puține fibre. Uleiul de măsline este în mare parte nesaturat, dar e în cantitate destul de mare; sarea vine doar din cea adăugată de tine, fiindcă nu există supă gata făcută.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Rosé wine', 'Vin rosé'),
          reason: t(
            'Fresh and fruity, it cools the palate after the rich meat and saffron without overpowering the rice.',
            'Proaspăt și fructat, răcorește gustul după carnea bogată și șofran, fără să acopere orezul.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'rose-wine',
        },
        {
          kind: 'food',
          label: t('Crisp lettuce salad', 'Salată verde crocantă'),
          reason: t(
            'Cold, crunchy leaves with a sharp dressing contrast with the soft, savoury rice.',
            'Frunzele reci și crocante cu un dressing acrișor fac contrast cu orezul moale și sărat.',
          ),
          principle: 'contrast_texture',
          ingredient: 'lettuce',
        },
        {
          kind: 'food',
          label: t('Olives', 'Măsline'),
          reason: t(
            'Their salty bite makes a good start while the paella rests.',
            'Gustul lor sărat este un început bun cât se odihnește paella.',
          ),
          principle: 'regional_tradition',
          ingredient: 'olives',
        },
      ],
      eatingMoments: [
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Rice refills energy and the chicken and rabbit supply protein.',
            'Orezul reface energia, iar puiul și iepurele dau proteine.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A large plate of rice and meat is heavy just before bed.',
            'O farfurie mare de orez cu carne e grea chiar înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'paella-oven-baked',
      method: 'oven-baked',
      title: t(
        'Arròs al forn (Valencian oven-baked rice with pork ribs, morcilla and chickpeas)',
        'Arròs al forn (orez valencian la cuptor cu coaste de porc, morcilla și năut)',
      ),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 60,
      difficulty: 'medium',
      hideBaseTips: [0],
      lines: [
        { ingredient: 'paella-rice', quantity: 300, unit: 'g' },
        { ingredient: 'olive-oil', quantity: 60, unit: 'ml' },
        {
          ingredient: 'pork-ribs',
          quantity: 500,
          unit: 'g',
          note: t(
            'chopped by the butcher into 4 to 5 cm pieces',
            'tăiate de măcelar în bucăți de 4-5 cm',
          ),
        },
        {
          ingredient: 'pork-belly',
          quantity: 250,
          unit: 'g',
          note: t('cut into 3 cm pieces', 'tăiat în bucăți de 3 cm'),
        },
        {
          ingredient: 'morcilla',
          quantity: 200,
          unit: 'g',
          note: t(
            'cooked, sliced about 2 cm thick',
            'gătită, tăiată felii de aproximativ 2 cm',
          ),
        },
        {
          ingredient: 'potato',
          quantity: 0.4,
          unit: 'kg',
          note: t(
            'peeled, sliced 5 mm thick',
            'curățați, tăiați felii de 5 mm',
          ),
        },
        {
          ingredient: 'tomato',
          quantity: 300,
          unit: 'g',
          note: t('2 medium, halved', '2 medii, tăiate în jumătăți'),
        },
        {
          ingredient: 'garlic',
          quantity: 50,
          unit: 'g',
          note: t('1 whole head', 'un cap întreg'),
        },
        {
          ingredient: 'paprika',
          quantity: 4,
          unit: 'g',
          note: t('sweet', 'dulce'),
        },
        {
          ingredient: 'saffron',
          quantity: 0.3,
          unit: 'g',
          note: t('a generous pinch of threads', 'un praf bun de fire'),
        },
        {
          ingredient: 'canned-chickpeas',
          quantity: 240,
          unit: 'g',
          note: t('drained weight', 'greutate după scurgere'),
        },
        {
          ingredient: 'chicken-stock',
          quantity: 750,
          unit: 'ml',
          note: t('hot', 'fierbinte'),
        },
        { ingredient: 'salt', quantity: 4, unit: 'g' },
      ],
      steps: [
        {
          key: 'heat',
          text: t(
            'Heat the oven to 250 °C (230 °C fan). Pour the stock into a pan, crumble in the saffron and bring to a simmer, then keep it hot over the lowest heat.',
            'Încălzește cuptorul la 250 °C (230 °C cu ventilator). Toarnă supa într-o cratiță, mărunțește șofranul în ea și adu la fierbere mică, apoi ține-o fierbinte la foc foarte mic.',
          ),
        },
        {
          key: 'prep-veg',
          text: t(
            'Slice the potatoes 5 mm thick and halve the tomatoes. Do the vegetables first, before any raw pork touches the board.',
            'Taie cartofii felii de 5 mm și înjumătățește roșiile. Pregătește legumele primele, înainte ca porcul crud să atingă tocătorul.',
          ),
        },
        {
          key: 'brown-pork',
          text: t(
            'Heat 30 ml of the oil in a 30 cm wide pan over medium-high heat. Add the ribs and the belly, sprinkle with 2 g of the salt and brown for about 12 minutes, turning, until deep golden on all sides. Lift them into a 30 to 32 cm earthenware dish or roasting tin, leaving the fat in the pan. They finish cooking in the oven. Then wash your hands, the board and the knife with hot soapy water.',
            'Încinge 30 ml din ulei într-o tigaie lată de 30 cm la foc mare-mediu. Adaugă coastele și pieptul de porc, presară 2 g din sare și rumenește aproximativ 12 minute, întorcând, până sunt aurii intens pe toate părțile. Pune-le într-un vas de lut sau o tavă de 30-32 cm, lăsând grăsimea în tigaie. Se gătesc complet la cuptor. Apoi spală-ți mâinile, tocătorul și cuțitul cu apă fierbinte și săpun.',
          ),
          timerSeconds: 720,
        },
        {
          key: 'potatoes',
          text: t(
            'Add the potato slices to the fat in the pan and fry for about 8 minutes, turning, until golden at the edges but still firm in the middle. Lift them onto a clean plate.',
            'Pune feliile de cartof în grăsimea din tigaie și prăjește-le aproximativ 8 minute, întorcându-le, până sunt aurii pe margini, dar încă ferme la mijloc. Scoate-le pe o farfurie curată.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'morcilla',
          text: t(
            'Brown the morcilla slices for about 2 minutes on each side, until crisp at the edges, and add them to the dish. The morcilla is already cooked, so you are only crisping it.',
            'Rumenește feliile de morcilla aproximativ 2 minute pe fiecare parte, până se crocantează la margini, și adaugă-le în vas. Morcilla este deja gătită, deci doar o crocantezi.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'sear',
          text: t(
            'Sear the tomato halves cut side down and the whole garlic head in the same pan for about 3 minutes, until the tomatoes take colour. Set them aside.',
            'Rumenește jumătățile de roșii cu partea tăiată în jos și capul întreg de usturoi în aceeași tigaie aproximativ 3 minute, până roșiile capătă culoare. Pune-le deoparte.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'rice-in-fat',
          text: t(
            'Add the remaining 30 ml of oil. Take the pan off the heat, stir in the paprika for 10 seconds, then stir in the rice and chickpeas for 1 minute to coat them in the fat. Tip them over the meat in the dish and spread level.',
            'Adaugă cei 30 ml de ulei rămași. Dă tigaia de pe foc, amestecă boiaua 10 secunde, apoi amestecă orezul și năutul 1 minut, ca să se îmbrace în grăsime. Toarnă-le peste carne în vas și nivelează.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'assemble',
          text: t(
            'Lay the potato slices over the rice, shingled, with the tomato halves cut side up and the garlic head in the middle. Taste the hot stock and add up to 2 g of salt if it needs it, then pour it around, not over, the potatoes, so the rice is just covered.',
            'Așază feliile de cartof peste orez, suprapuse, cu jumătățile de roșii cu partea tăiată în sus și capul de usturoi la mijloc. Gustă supa fierbinte și adaugă până la 2 g de sare dacă are nevoie, apoi toarnă-o pe lângă cartofi, nu peste ei, astfel încât orezul să fie doar acoperit.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake, uncovered and without stirring, for about 20 minutes, until the liquid has gone, the rice is cooked but still slightly firm at the centre and the potatoes are golden. If liquid is left, give it up to 5 more minutes. The pork must be opaque and firm with clear juices, 63 °C in a piece of belly, then rest; the 5-minute rest below covers that.',
            'Coace, descoperit și fără să amesteci, aproximativ 20 de minute, până dispare lichidul, orezul e fiert, dar încă ușor ferm în centru, iar cartofii sunt aurii. Dacă mai rămâne lichid, mai lasă-l încă 5 minute. Porcul trebuie să fie opac și ferm, cu zeamă limpede, 63 °C într-o bucată de piept, apoi lăsat să se odihnească; odihna de 5 minute de mai jos acoperă asta.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'rest',
          text: t(
            'Take the dish out and rest it for 5 minutes. Squeeze the soft garlic cloves out of the head over the rice.',
            'Scoate vasul și lasă-l să se odihnească 5 minute. Stoarce cățeii moi de usturoi din cap peste orez.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'serve',
          text: t(
            'Serve from the dish. Do not leave the pan on the hob: spread leftovers thin in a shallow container and put them in the fridge within 1 to 2 hours, eat them within 1 day and reheat them only once, until steaming hot all the way through.',
            'Servește din vas. Nu lăsa tigaia pe aragaz: întinde ce rămâne într-un strat subțire într-un recipient plat și pune-l la frigider în 1-2 ore, mănâncă-l în cel mult o zi și încălzește-l o singură dată, până scoate aburi în tot interiorul.',
          ),
        },
      ],
      tips: [
        t(
          'Check the morcilla label for breadcrumbs or other allergens before you serve it to a guest with an allergy.',
          'Verifică eticheta de la morcilla pentru pesmet sau alți alergeni înainte să o servești unui invitat cu alergii.',
        ),
      ],
      stepTips: [
        {
          step: 'assemble',
          text: t(
            'Keep the potato slices and tomato halves above the liquid, so they brown in the dry heat instead of stewing.',
            'Ține feliile de cartof și jumătățile de roșii deasupra lichidului, ca să se rumenească în căldura uscată, nu să fiarbă.',
          ),
        },
      ],
      nutritionNote: t(
        'Carbohydrate from the rice and potato, and fibre and plant protein from the chickpeas, plus a good amount of protein from the pork. The ribs, belly and morcilla bring a lot of saturated fat, and the morcilla and stock make it salty, so keep the portion of meat modest and add a salad. The olive oil is mostly unsaturated.',
        'Carbohidrați din orez și cartofi, fibre și proteine vegetale din năut, plus multe proteine din porc. Coastele, pieptul și morcilla aduc multe grăsimi saturate, iar morcilla și supa o fac sărată, așa că păstrează o porție moderată de carne și adaugă o salată. Uleiul de măsline este în mare parte nesaturat.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Red wine', 'Vin roșu'),
          reason: t(
            'Its tannins and acidity stand up to the fatty pork and the morcilla.',
            'Taninii și aciditatea lui țin piept porcului gras și morcillei.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'red-wine',
        },
        {
          kind: 'food',
          label: t('Rocket salad', 'Salată de rucola'),
          reason: t(
            'Its peppery bitterness balances the rich pork and rice.',
            'Amăreala piperată a rucolei echilibrează porcul și orezul bogate.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'rocket',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, hearty dish from the oven that warms a cold day.',
            'Un fel copt, consistent și fierbinte, care încălzește o zi rece.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'It needs a very hot oven and sits heavy in the heat.',
            'Cere un cuptor foarte fierbinte și cade greu pe stomac pe căldură.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Fatty pork and rice are heavy just before bed.',
            'Porcul gras și orezul sunt grele chiar înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
