import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Pork chops base is the plain pan-fried chop with garlic and thyme butter.
// Each Variant is a full Recipe with its own lines, steps and guidance; the
// base's Recipe-level Tips are inherited unless a Variant hides them.
export const porkChops: BaseRecipeSeed = {
  slug: 'pork-chops',
  title: t(
    'Pan-fried pork chops with garlic and thyme butter',
    'Cotlete de porc la tigaie cu unt, usturoi și cimbrișor',
  ),
  servings: 4,
  prepMinutes: 55,
  cookMinutes: 18,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'pork-chops',
      quantity: 1000,
      unit: 'g',
      note: t(
        'bone-in, 2 to 2.5 cm thick, about 250 g each',
        'cu os, groase de 2-2,5 cm, de aproximativ 250 g fiecare',
      ),
    },
    { ingredient: 'salt', quantity: 6, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
    { ingredient: 'sunflower-oil', quantity: 30, unit: 'ml' },
    { ingredient: 'butter', quantity: 40, unit: 'g' },
    {
      ingredient: 'garlic',
      quantity: 20,
      unit: 'g',
      note: t(
        '4 cloves, crushed with the skin on',
        '4 căței, striviți cu tot cu coajă',
      ),
    },
    {
      ingredient: 'thyme',
      quantity: 6,
      unit: 'g',
      note: t('about 6 sprigs', 'aproximativ 6 crenguțe'),
    },
  ],
  steps: [
    {
      key: 'salt',
      text: t(
        'Snip the fat edge of each chop in 2 or 3 places so it does not curl. Sprinkle both sides with the salt, put the chops on a plate and leave them in the fridge for 45 minutes.',
        'Crestează marginea de grăsime a fiecărui cotlet în 2-3 locuri, ca să nu se strângă la gătit. Presară sarea pe ambele părți, pune cotletele pe o farfurie și lasă-le la frigider 45 de minute.',
      ),
      timerSeconds: 2700,
    },
    {
      key: 'dry',
      text: t(
        'Pat the chops very dry with paper towels and season both sides with the pepper. Keep the plate they sat on for raw meat only.',
        'Tamponează cotletele bine cu prosoape de hârtie și condimentează-le pe ambele părți cu piper. Farfuria pe care au stat rămâne doar pentru carne crudă.',
      ),
    },
    {
      key: 'heat',
      text: t(
        'Heat the oil in a 30 cm heavy pan over medium-high heat for about 2 minutes, until it is very hot and a corner of a chop sizzles at once.',
        'Încinge uleiul într-o tigaie grea de 30 cm la foc mediu-iute, aproximativ 2 minute, până uleiul e bine încins și un colț de cotlet sfârâie imediat.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'sear-first',
      text: t(
        'Lay the chops in the pan, placing them away from you so the oil does not splash you, and sear the first side for 3 minutes without moving them, until deep golden.',
        'Pune cotletele în tigaie, începând de la tine spre partea opusă, ca să nu te stropească uleiul, și rumenește prima parte 3 minute fără să le miști, până capătă o culoare aurie intensă.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'sear-second',
      text: t(
        'Turn the chops and sear the second side for 3 minutes, until golden.',
        'Întoarce cotletele și rumenește a doua parte 3 minute, până se aurește.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'baste',
      text: t(
        'Lower the heat to medium and add the butter, garlic and thyme. When the butter foams, tilt the pan and spoon the butter over the chops for 3 to 4 minutes, turning them once.',
        'Redu focul la mediu și adaugă untul, usturoiul și cimbrișorul. Când untul face spumă, înclină tigaia și toarnă untul peste cotlete cu o lingură 3-4 minute, întorcându-le o dată.',
      ),
      timerSeconds: 210,
    },
    {
      key: 'check',
      text: t(
        'Push a meat thermometer into the thickest part of a chop, not touching the bone. It should read 63 °C and the juices should run clear. The centre may still be faintly pink, which is safe at 63 °C after the rest, so trust the thermometer. If it reads lower, cook 1 to 2 minutes more and check again.',
        'Introdu un termometru de carne în partea cea mai groasă a unui cotlet, fără să atingă osul. Trebuie să arate 63 °C, iar zeama să fie limpede. Centrul poate rămâne ușor roz, ceea ce e în regulă la 63 °C după odihnă, așa că ai încredere în termometru. Dacă arată mai puțin, mai gătește 1-2 minute și verifică din nou.',
      ),
    },
    {
      key: 'rest',
      text: t(
        'Move the chops with clean tongs onto a clean warm plate, not the one the raw meat sat on. Cover loosely with foil and rest them for 3 minutes.',
        'Mută cotletele cu clește curat pe o farfurie curată și caldă, nu pe cea pe care a stat carnea crudă. Acoperă-le ușor cu folie și lasă-le să se odihnească 3 minute.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'wash',
      text: t(
        'While the chops rest, wash your hands, the board, the knife, the tongs and the raw-meat plate in hot soapy water, and wipe the thermometer probe.',
        'Cât se odihnesc cotletele, spală-ți mâinile, tocătorul, cuțitul, cleștele și farfuria pentru carnea crudă cu apă fierbinte și detergent, și șterge sonda termometrului.',
      ),
    },
    {
      key: 'serve',
      text: t(
        'Spoon the garlic and thyme butter from the pan, along with any juices from the resting plate, over the chops and serve at once.',
        'Toarnă cu lingura untul cu usturoi și cimbrișor din tigaie, împreună cu zeama de pe farfuria de odihnă, peste cotlete și servește imediat.',
      ),
    },
  ],
  tips: [
    t(
      'A thermometer is the surest way to a juicy chop. Take it off the heat at 63 °C and let it rest: pushed past that, a lean chop turns dry and stringy.',
      'Un termometru e cea mai sigură cale spre un cotlet suculent. Ia-l de pe foc la 63 °C și lasă-l să se odihnească: peste această temperatură, un cotlet slab devine uscat și fibros.',
    ),
    t(
      'Buy bone-in chops 2 to 2.5 cm thick with a rim of fat. Thin chops overcook before they brown, and the bone and fat keep the meat juicy.',
      'Cumpără cotlete cu os, groase de 2-2,5 cm, cu un strat de grăsime pe margine. Cele subțiri se gătesc prea tare înainte să se rumenească, iar osul și grăsimea păstrează carnea suculentă.',
    ),
    t(
      'Leftovers: chill them within 2 hours, keep in the fridge for up to 3 days, and reheat gently until steaming hot all the way through.',
      'Resturi: pune-le la frigider în cel mult 2 ore, păstrează-le până la 3 zile și reîncălzește-le încet, până sunt fierbinți în toată grosimea.',
    ),
  ],
  stepTips: [
    {
      step: 'dry',
      text: t(
        'A wet surface steams instead of browning, so dry the meat thoroughly, even if salting has drawn out some moisture.',
        'O suprafață umedă fierbe în abur în loc să se rumenească, așa că usucă bine carnea, chiar dacă sarea a scos puțină apă.',
      ),
    },
    {
      step: 'sear-first',
      text: t(
        'If the chops touch or the pan cools, they will steam: use two pans, or sear two at a time and add the others later.',
        'Dacă cotletele se ating sau tigaia se răcește, vor fierbe în abur: folosește două tigăi sau rumenește câte două și adaugă-le pe celelalte după aceea.',
      ),
    },
  ],
  nutritionNote: t(
    'A good source of protein, with B vitamins (especially thiamine) and zinc, and it cooks fast. The oil and butter add fat, the butter and the fat rim add saturated fat, and the salting and any pan sauce add sodium. Serve it with vegetables or beans for fibre, which the chop itself lacks.',
    'O sursă bună de proteine, cu vitamine din grupul B (mai ales tiamină) și zinc, care se gătește repede. Uleiul și untul adaugă grăsime, untul și grăsimea de pe margine aduc grăsimi saturate, iar sărarea și sosul din tigaie aduc sodiu. Servește-l cu legume sau fasole pentru fibre, care lipsesc din cotlet.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Potato puree', 'Piure de cartofi'),
      reason: t(
        'A soft, buttery mash catches the garlic and thyme pan juices that would otherwise be left on the plate.',
        'Un piure moale, cu unt, adună zeama de usturoi și cimbrișor din tigaie, care altfel ar rămâne în farfurie.',
      ),
      principle: 'contrast_texture',
      recipe: 'potato-puree',
    },
    {
      kind: 'food',
      label: t('Green beans', 'Fasole verde'),
      reason: t(
        'Their fresh, crisp snap is a contrast to the soft meat and the buttery juices.',
        'Crocantul lor proaspăt contrastează cu carnea fragedă și cu sucul cu unt.',
      ),
      principle: 'contrast_texture',
      ingredient: 'green-beans',
    },
    {
      kind: 'food',
      label: t('Pan-fried apple slices', 'Felii de măr prăjite în tigaie'),
      reason: t(
        'Sweet, tart apple cuts through the fat, and pork and apple suit each other well.',
        'Mărul dulce-acrișor taie din grăsime, iar porcul și mărul se potrivesc bine.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'apple',
    },
    {
      kind: 'drink',
      label: t('Dry cider', 'Cidru sec'),
      reason: t(
        'Its apple acidity and light fizz refresh the palate between rich bites.',
        'Aciditatea de măr și efervescența ușoară împrospătează gustul între îmbucături bogate.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'cider',
    },
    {
      kind: 'drink',
      label: t('Dry white wine', 'Vin alb sec'),
      reason: t(
        'Crisp acidity balances the butter without covering the taste of the pork.',
        'Aciditatea vie echilibrează untul fără să acopere gustul cărnii de porc.',
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
        'A hot, savoury plate that warms you through.',
        'O farfurie fierbinte și gustoasă, care te încălzește.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Plenty of protein for recovery; add potatoes or bread for carbohydrates.',
        'Multe proteine pentru refacere; adaugă cartofi sau pâine pentru carbohidrați.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A heavy, fatty meal sits poorly just before bed.',
        'O masă grea și grasă cade greu chiar înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'pork-chops-italian',
      cuisine: 'italian',
      title: t(
        'Pork chops alla pizzaiola (in tomato, garlic and oregano sauce)',
        'Cotlete de porc alla pizzaiola (în sos de roșii cu usturoi și oregano)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 33,
      difficulty: 'easy',
      hideBaseTips: [1],
      lines: [
        {
          ingredient: 'pork-chops',
          quantity: 800,
          unit: 'g',
          note: t(
            'bone-in, 1.5 to 2 cm thick, about 200 g each',
            'cu os, groase de 1,5-2 cm, de aproximativ 200 g fiecare',
          ),
        },
        { ingredient: 'olive-oil', quantity: 45, unit: 'ml' },
        {
          ingredient: 'garlic',
          quantity: 15,
          unit: 'g',
          note: t('3 cloves, sliced', '3 căței, tăiați felii'),
        },
        {
          ingredient: 'canned-tomatoes',
          quantity: 800,
          unit: 'g',
          note: t(
            'two 400 g tins of whole peeled tomatoes',
            'două conserve de 400 g de roșii întregi, decojite',
          ),
        },
        {
          ingredient: 'oregano',
          quantity: 3,
          unit: 'g',
          note: t('dried', 'uscat'),
        },
        {
          ingredient: 'chilli-flakes',
          quantity: 0.5,
          unit: 'g',
          optional: true,
        },
        {
          ingredient: 'capers',
          quantity: 20,
          unit: 'g',
          optional: true,
          note: t('rinsed', 'clătite'),
        },
        {
          ingredient: 'basil',
          quantity: 10,
          unit: 'g',
          optional: true,
          note: t('leaves, rinsed', 'frunze, spălate'),
        },
        { ingredient: 'salt', quantity: 5, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1.5, unit: 'g' },
      ],
      steps: [
        {
          key: 'crush',
          text: t(
            'Tip the tomatoes into a bowl and crush them with your hands into rough pieces, removing any hard stem ends.',
            'Pune roșiile într-un bol și strivește-le cu mâinile în bucăți mari, scoțând capetele tari ale cozilor.',
          ),
        },
        {
          key: 'season',
          text: t(
            'Pat the chops dry, snip the fat edge in 2 places and season both sides with 3 g of the salt and the pepper.',
            'Tamponează cotletele, crestează marginea de grăsime în 2 locuri și condimentează-le pe ambele părți cu 3 g din sare și cu piper.',
          ),
        },
        {
          key: 'heat',
          text: t(
            'Heat 30 ml of the olive oil in a wide, deep pan over medium-high heat until it is very hot.',
            'Încinge 30 ml din uleiul de măsline într-o tigaie lată și adâncă, la foc mediu-iute, până e bine încins.',
          ),
        },
        {
          key: 'sear-first',
          text: t(
            'Sear the chops for 2 minutes on the first side, until golden. They will not be cooked through yet.',
            'Rumenește cotletele 2 minute pe prima parte, până se aurește. Nu vor fi încă gătite complet.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'sear-second',
          text: t(
            'Turn the chops and sear the second side for 2 minutes, until golden.',
            'Întoarce cotletele și rumenește a doua parte 2 minute, până se aurește.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'lift-out',
          text: t(
            'Lift the chops onto a plate and cover them loosely. They go back into the pan, so this plate is for raw meat only. Wash your hands and the tongs in hot soapy water.',
            'Scoate cotletele pe o farfurie și acoperă-le ușor. Se întorc în tigaie, așa că această farfurie rămâne doar pentru carne crudă. Spală-ți mâinile și cleștele cu apă fierbinte și detergent.',
          ),
        },
        {
          key: 'garlic',
          text: t(
            'Lower the heat to medium and add the remaining 15 ml of olive oil to the same pan. Add the garlic and the chilli flakes, if using, and cook for 30 seconds, until fragrant but not browned.',
            'Redu focul la mediu și adaugă în aceeași tigaie cei 15 ml de ulei de măsline rămași. Adaugă usturoiul și fulgii de chili, dacă folosești, și gătește 30 de secunde, până se simte aroma, fără să se rumenească.',
          ),
          timerSeconds: 30,
        },
        {
          key: 'tomatoes',
          text: t(
            'Take the pan off the heat, pour in the crushed tomatoes with their juice, then add the oregano, the capers, if using, 2 g of the salt and the remaining pepper. Scrape up the browned bits from the bottom and put the pan back on the heat.',
            'Ia tigaia de pe foc, toarnă roșiile strivite cu tot sucul lor, apoi adaugă oreganoul, caperele, dacă folosești, 2 g din sare și restul de piper. Desprinde bucățelele rumenite de pe fund și pune tigaia la loc pe foc.',
          ),
        },
        {
          key: 'simmer-sauce',
          text: t(
            'Bring to a gentle simmer and cook uncovered for 15 minutes, stirring now and then, until the sauce is thick and the oil shows at the edges.',
            'Adu la fierbere domoală și gătește fără capac 15 minute, amestecând din când în când, până sosul se îngroașă și uleiul apare la margini.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'add-chops',
          text: t(
            'Lay the chops in the sauce and spoon the sauce over them. Discard the liquid left on the plate.',
            'Așază cotletele în sos și toarnă sosul peste ele. Aruncă lichidul rămas pe farfurie.',
          ),
        },
        {
          key: 'wash',
          text: t(
            'Wash your hands, the board, the knife, the tongs and the raw-meat plate in hot soapy water before you touch the basil or the bread.',
            'Spală-ți mâinile, tocătorul, cuțitul, cleștele și farfuria pentru carnea crudă cu apă fierbinte și detergent înainte să atingi busuiocul sau pâinea.',
          ),
        },
        {
          key: 'finish',
          text: t(
            'Cover the pan partly and simmer gently for 8 minutes, turning the chops once, until they are firm and cooked through.',
            'Acoperă tigaia pe jumătate și fierbe domol 8 minute, întorcând cotletele o dată, până devin ferme și gătite complet.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'check',
          text: t(
            'Check the thickest part of a chop: it should read 63 °C and the juices should run clear. The centre may still be faintly pink, which is safe at 63 °C after the rest, so trust the thermometer. If it reads lower, simmer 1 to 2 minutes more and check again.',
            'Verifică partea cea mai groasă a unui cotlet: trebuie să arate 63 °C, iar zeama să fie limpede. Centrul poate rămâne ușor roz, ceea ce e în regulă la 63 °C după odihnă, așa că ai încredere în termometru. Dacă arată mai puțin, mai fierbe 1-2 minute și verifică din nou.',
          ),
        },
        {
          key: 'rest',
          text: t(
            'Take the pan off the heat and leave the chops in the sauce for 3 minutes.',
            'Ia tigaia de pe foc și lasă cotletele în sos 3 minute.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'serve',
          text: t(
            'Taste the sauce and add salt if it needs it. Scatter over the torn basil, if using, and serve with bread for the sauce.',
            'Gustă sosul și adaugă sare dacă are nevoie. Presară busuioc rupt cu mâna, dacă folosești, și servește cu pâine pentru sos.',
          ),
        },
      ],
      tips: [
        t(
          'Tinned tomatoes and capers both bring salt, so taste the sauce at the end before you add more.',
          'Roșiile conservate și caperele aduc deja sare, așa că gustă sosul la final înainte să mai adaugi.',
        ),
      ],
      stepTips: [
        {
          step: 'tomatoes',
          text: t(
            'Crushing whole peeled tomatoes by hand gives a looser, more rustic sauce than chopped tinned ones.',
            'Roșiile întregi decojite strivite cu mâna dau un sos mai rustic și mai fluid decât cele tăiate cubulețe din conservă.',
          ),
        },
      ],
      nutritionNote: t(
        'Protein from the pork and plenty of tomato, which brings vitamin C and fibre, make this a balanced pan dish. The olive oil is mostly unsaturated fat, while the pork fat adds some saturated fat, and the tins and capers add salt. Bread soaks up the sauce but adds quick carbohydrates.',
        'Proteinele din porc și multele roșii, care aduc vitamina C și fibre, fac din acesta un preparat echilibrat. Uleiul de măsline are mai ales grăsimi nesaturate, grăsimea din porc adaugă ceva grăsimi saturate, iar conservele și caperele aduc sare. Pâinea absoarbe sosul, dar adaugă carbohidrați cu absorbție rapidă.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Crusty bread', 'Pâine crocantă'),
          reason: t(
            'Bread mops up the tomato sauce, which is half the point of the dish.',
            'Pâinea adună sosul de roșii, care e jumătate din rostul preparatului.',
          ),
          principle: 'contrast_texture',
          ingredient: 'bread',
        },
        {
          kind: 'food',
          label: t('Rocket salad', 'Salată de rucola'),
          reason: t(
            'Its peppery bitterness lifts the rich, cooked-down tomato sauce.',
            'Amăreala ei picantă înviorează sosul de roșii gătit, bogat.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'rocket',
        },
        {
          kind: 'drink',
          label: t('Light red wine', 'Vin roșu ușor'),
          reason: t(
            'Its acidity matches the tomato, and light tannins do not overpower the pork.',
            'Aciditatea lui se potrivește cu roșiile, iar taninurile ușoare nu acoperă carnea de porc.',
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
            'A hot, tomato-rich plate that warms you through.',
            'O farfurie fierbinte, bogată în roșii, care te încălzește.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein for recovery, with tomato and bread for carbohydrates.',
            'Proteine pentru refacere, cu roșii și pâine pentru carbohidrați.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Rich pork and acidic tomato sauce can sit heavily before bed.',
            'Carnea de porc bogată și sosul acid de roșii pot cădea greu înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'pork-chops-french',
      cuisine: 'french',
      title: t(
        'Côtes de porc charcutière (pork chops in mustard and gherkin sauce)',
        'Cotlete de porc charcutière (în sos de muștar cu castraveți cornișon)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 35,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'pork-chops',
          quantity: 800,
          unit: 'g',
          note: t(
            'bone-in, about 2 cm thick, about 200 g each',
            'cu os, groase de aproximativ 2 cm, de aproximativ 200 g fiecare',
          ),
        },
        { ingredient: 'salt', quantity: 4, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1.5, unit: 'g' },
        { ingredient: 'sunflower-oil', quantity: 15, unit: 'ml' },
        {
          ingredient: 'butter',
          quantity: 30,
          unit: 'g',
          note: t('for searing', 'pentru rumenit'),
        },
        {
          ingredient: 'butter',
          key: 'butter-finish',
          quantity: 15,
          unit: 'g',
          note: t(
            'cold, diced, to finish the sauce',
            'rece, tăiat cubulețe, pentru finalul sosului',
          ),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('medium, finely chopped', 'medie, tocată mărunt'),
        },
        { ingredient: 'flour', quantity: 15, unit: 'g' },
        {
          ingredient: 'white-wine',
          quantity: 150,
          unit: 'ml',
          note: t('dry', 'sec'),
        },
        { ingredient: 'veal-stock', quantity: 250, unit: 'ml' },
        {
          ingredient: 'mustard',
          quantity: 20,
          unit: 'g',
          note: t('Dijon', 'Dijon'),
        },
        {
          ingredient: 'cornichons',
          quantity: 60,
          unit: 'g',
          note: t('thinly sliced', 'tăiate felii subțiri'),
        },
        {
          ingredient: 'parsley',
          quantity: 5,
          unit: 'g',
          optional: true,
          note: t('chopped', 'tocat'),
        },
      ],
      steps: [
        {
          key: 'season',
          text: t(
            'Pat the chops dry, snip the fat edge in 2 places and season both sides with 3 g of the salt and the pepper.',
            'Tamponează cotletele, crestează marginea de grăsime în 2 locuri și condimentează-le pe ambele părți cu 3 g din sare și cu piper.',
          ),
        },
        {
          key: 'heat',
          text: t(
            'Heat the oil and the 30 g of butter in a 30 cm heavy pan over medium-high heat until the butter foam begins to settle.',
            'Încinge uleiul și cei 30 g de unt într-o tigaie grea de 30 cm, la foc mediu-iute, până spuma untului începe să se așeze.',
          ),
        },
        {
          key: 'sear-first',
          text: t(
            'Lay in the chops and sear the first side for 3 minutes, until golden.',
            'Pune cotletele în tigaie și rumenește prima parte 3 minute, până se aurește.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'sear-second',
          text: t(
            'Turn the chops and sear the second side for 3 minutes, until golden.',
            'Întoarce cotletele și rumenește a doua parte 3 minute, până se aurește.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'cook-through',
          text: t(
            'Lower the heat to medium and cook the chops for 3 more minutes, turning them once.',
            'Redu focul la mediu și gătește cotletele încă 3 minute, întorcându-le o dată.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'check',
          text: t(
            'Check the thickest part of a chop: it should read 63 °C and the juices should run clear. The centre may still be faintly pink, which is safe at 63 °C after the rest, so trust the thermometer. If it reads lower, cook 1 to 2 minutes more and check again.',
            'Verifică partea cea mai groasă a unui cotlet: trebuie să arate 63 °C, iar zeama să fie limpede. Centrul poate rămâne ușor roz, ceea ce e în regulă la 63 °C după odihnă, așa că ai încredere în termometru. Dacă arată mai puțin, mai gătește 1-2 minute și verifică din nou.',
          ),
        },
        {
          key: 'rest',
          text: t(
            'Move the chops with clean tongs onto a clean plate, not the one the raw meat sat on, and cover loosely with foil. They rest while you make the sauce.',
            'Mută cotletele cu clește curat pe o farfurie curată, nu pe cea pe care a stat carnea crudă, și acoperă-le ușor cu folie. Se odihnesc cât faci sosul.',
          ),
        },
        {
          key: 'wash',
          text: t(
            'Wash your hands, the board, the knife, the tongs and the raw-meat plate in hot soapy water, and wipe the thermometer probe.',
            'Spală-ți mâinile, tocătorul, cuțitul, cleștele și farfuria pentru carnea crudă cu apă fierbinte și detergent, și șterge sonda termometrului.',
          ),
        },
        {
          key: 'drain-fat',
          text: t(
            'Tip all but about 1 tablespoon (15 ml) of the fat from the pan into a heatproof bowl, leaving the browned bits behind.',
            'Varsă din tigaie toată grăsimea, mai puțin aproximativ o lingură (15 ml), într-un bol rezistent la căldură, lăsând bucățelele rumenite.',
          ),
        },
        {
          key: 'onion',
          text: t(
            'Cook the onion in the pan over medium-low heat for 4 minutes, scraping up the browned bits, until soft and translucent.',
            'Călește ceapa în tigaie la foc mic-mediu 4 minute, desprinzând bucățelele rumenite, până se înmoaie și devine translucidă.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'flour',
          text: t(
            'Sprinkle in the flour and stir for 1 minute, until it smells slightly toasty.',
            'Presară făina și amestecă 1 minut, până miroase ușor a prăjit.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'wine',
          text: t(
            'Take the pan off the heat, pour in the wine and stir until smooth. Return to medium heat and bubble for 3 minutes, until reduced by about half.',
            'Ia tigaia de pe foc, toarnă vinul și amestecă până se omogenizează. Pune-o la loc pe foc mediu și fierbe 3 minute, până scade la jumătate.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'stock',
          text: t(
            'Pour in the veal stock and simmer for 6 minutes, stirring now and then, until the sauce lightly coats the back of a spoon.',
            'Toarnă fondul de vițel și fierbe 6 minute, amestecând din când în când, până sosul acoperă ușor dosul lingurii.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'finish-sauce',
          text: t(
            'Take the pan off the heat. Whisk in the mustard and the cold diced butter until the sauce is glossy, then stir in the cornichons and the parsley, if using. Do not boil the sauce again.',
            'Ia tigaia de pe foc. Amestecă cu telul muștarul și untul rece tăiat cubulețe, până sosul devine lucios, apoi adaugă castraveții cornișon și pătrunjelul, dacă folosești. Nu mai fierbe sosul.',
          ),
        },
        {
          key: 'warm-chops',
          text: t(
            'Return the chops and the juices from their plate to the sauce, cover, and warm them over low heat for 4 minutes, turning them once and spooning the sauce over, until piping hot. Taste the sauce and add the last 1 g of salt only if it needs it.',
            'Pune la loc în sos cotletele și zeama de pe farfuria lor, acoperă și încălzește-le 4 minute la foc mic, întorcându-le o dată și turnând sosul peste ele, până sunt fierbinți. Gustă sosul și adaugă ultimul gram de sare doar dacă are nevoie.',
          ),
          timerSeconds: 240,
        },
      ],
      tips: [
        t(
          'Mustard, cornichons and stock all carry salt, so keep the last gram of salt in reserve and taste first.',
          'Muștarul, castraveții cornișon și fondul aduc sare, așa că păstrează ultimul gram de sare și gustă mai întâi.',
        ),
      ],
      stepTips: [
        {
          step: 'finish-sauce',
          text: t(
            'Boiling the sauce after the mustard goes in dulls its sharpness and can split the butter, so add both off the heat.',
            'Dacă fierbi sosul după ce ai pus muștarul, își pierde ascuțimea și untul se poate separa, așa că adaugă-le pe amândouă de pe foc.',
          ),
        },
      ],
      nutritionNote: t(
        'Lean, protein-rich pork in a sauce that is mostly stock, wine and onion, so it is lighter than a cream sauce. The butter adds saturated fat, and the mustard, cornichons and stock add a good deal of salt. A starch such as mash and a green vegetable make the plate complete.',
        'Carne de porc slabă, bogată în proteine, într-un sos făcut mai ales din fond, vin și ceapă, deci mai ușor decât un sos cu smântână. Untul aduce grăsimi saturate, iar muștarul, castraveții cornișon și fondul adaugă multă sare. O garnitură de cartofi și o legumă verde completează farfuria.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t(
            'French pommes purée',
            'Pommes purée franțuzesc (piure franțuzesc)',
          ),
          reason: t(
            'A smooth, buttery purée is a soft base that takes the sharp mustard sauce well.',
            'Un piure fin, cu unt, e o bază moale care primește bine sosul ascuțit de muștar.',
          ),
          principle: 'contrast_texture',
          recipe: 'potato-puree-french',
        },
        {
          kind: 'food',
          label: t('Green beans', 'Fasole verde'),
          reason: t(
            'Their fresh, crisp snap is a contrast to the soft meat and the sauce.',
            'Crocantul lor proaspăt contrastează cu carnea fragedă și cu sosul.',
          ),
          principle: 'contrast_texture',
          ingredient: 'green-beans',
        },
        {
          kind: 'drink',
          label: t('Dry cider', 'Cidru sec'),
          reason: t(
            'Apple acidity and a light fizz cut through the butter and the mustard.',
            'Aciditatea de măr și efervescența ușoară taie din unt și din muștar.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'cider',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A warming dish with a tangy hot sauce.',
            'Un preparat care încălzește, cu un sos fierbinte și acrișor.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Lean protein for recovery; add mash for carbohydrates.',
            'Proteine slabe pentru refacere; adaugă piure pentru carbohidrați.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A salty, wine-based sauce and rich meat are a lot just before bed.',
            'Un sos sărat, cu vin, și carnea bogată sunt prea mult chiar înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'pork-chops-american',
      cuisine: 'american',
      title: t(
        'Smothered pork chops (in onion gravy)',
        'Cotlete de porc înăbușite în sos de ceapă (smothered pork chops)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 44,
      difficulty: 'easy',
      hideBaseTips: [0],
      lines: [
        {
          ingredient: 'pork-chops',
          quantity: 1000,
          unit: 'g',
          note: t(
            'bone-in, about 2 cm thick, about 250 g each',
            'cu os, groase de aproximativ 2 cm, de aproximativ 250 g fiecare',
          ),
        },
        { ingredient: 'flour', quantity: 80, unit: 'g' },
        { ingredient: 'paprika', quantity: 6, unit: 'g' },
        { ingredient: 'garlic-powder', quantity: 3, unit: 'g' },
        { ingredient: 'onion-powder', quantity: 3, unit: 'g' },
        { ingredient: 'salt', quantity: 5, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
        { ingredient: 'sunflower-oil', quantity: 45, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('medium, thinly sliced', 'medii, tăiate felii subțiri'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          optional: true,
          note: t('2 cloves, minced', '2 căței, tocați mărunt'),
        },
        { ingredient: 'chicken-stock', quantity: 400, unit: 'ml' },
        {
          ingredient: 'whipping-cream',
          quantity: 60,
          unit: 'ml',
          optional: true,
        },
        {
          ingredient: 'parsley',
          quantity: 5,
          unit: 'g',
          optional: true,
          note: t('chopped', 'tocat'),
        },
      ],
      steps: [
        {
          key: 'mix',
          text: t(
            'Stir the flour, paprika, garlic powder, onion powder, 4 g of the salt and the pepper together in a shallow dish. Spoon 25 g of the mixture into a small bowl and set it aside for the gravy.',
            'Amestecă făina, boiaua, usturoiul granulat, ceapa granulată, 4 g din sare și piperul într-o farfurie întinsă. Pune 25 g din amestec într-un bol mic și lasă-l deoparte pentru sos.',
          ),
        },
        {
          key: 'dredge',
          text: t(
            'Pat the chops dry, snip the fat edge in 2 places and press each chop into the dish to coat both sides. Shake off the excess, then throw away the flour left in the dish.',
            'Tamponează cotletele, crestează marginea de grăsime în 2 locuri și apasă fiecare cotlet în farfurie ca să se acopere pe ambele părți. Scutură surplusul, apoi aruncă făina rămasă în farfurie.',
          ),
        },
        {
          key: 'heat',
          text: t(
            'Heat 30 ml of the oil in a large, deep pan with a lid over medium-high heat for about 2 minutes, until it is very hot.',
            'Încinge 30 ml din ulei într-o tigaie mare și adâncă, cu capac, la foc mediu-iute, aproximativ 2 minute, până uleiul e bine încins.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'brown-first',
          text: t(
            'Lay in the chops and brown the first side for 3 minutes, until deep golden. They will not be cooked through yet.',
            'Pune cotletele în tigaie și rumenește prima parte 3 minute, până capătă o culoare aurie intensă. Nu vor fi încă gătite complet.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'brown-second',
          text: t(
            'Turn the chops and brown the second side for 3 minutes, until golden.',
            'Întoarce cotletele și rumenește a doua parte 3 minute, până se aurește.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'lift-out',
          text: t(
            'Lift the chops out onto a plate. They go back into the pan, so this plate is for raw meat only.',
            'Scoate cotletele pe o farfurie. Se întorc în tigaie, așa că această farfurie rămâne doar pentru carne crudă.',
          ),
        },
        {
          key: 'onions',
          text: t(
            'Lower the heat to medium and add the remaining 15 ml of oil. Cook the onions for 8 minutes, stirring and scraping up the browned bits, until soft and golden. Add the garlic, if using, for the last 30 seconds.',
            'Redu focul la mediu și adaugă cei 15 ml de ulei rămași. Călește ceapa 8 minute, amestecând și desprinzând bucățelele rumenite, până se înmoaie și se aurește. Adaugă usturoiul, dacă folosești, în ultimele 30 de secunde.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'roux',
          text: t(
            'Sprinkle the reserved 25 g of seasoned flour over the onions and stir for 3 minutes, until the flour turns light brown and smells toasty.',
            'Presară cei 25 g de făină condimentată puși deoparte peste ceapă și amestecă 3 minute, până făina devine maronie deschis și miroase a prăjit.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'gravy',
          text: t(
            'Take the pan off the heat and pour in the stock a little at a time, whisking until smooth. Return to the heat and bring to a simmer, stirring, for about 2 minutes, until it thickens.',
            'Ia tigaia de pe foc și toarnă supa treptat, amestecând cu telul până se omogenizează. Pune-o la loc pe foc și adu la fierbere, amestecând, aproximativ 2 minute, până se îngroașă.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'return',
          text: t(
            'Nestle the chops back into the gravy, spooning the onions and gravy over them. Do not add the raw juices from the plate.',
            'Așază cotletele la loc în sos, turnând ceapa și sosul peste ele. Nu adăuga zeama crudă de pe farfurie.',
          ),
        },
        {
          key: 'wash',
          text: t(
            'Wash your hands, the board, the knife and the raw-meat plate in hot soapy water.',
            'Spală-ți mâinile, tocătorul, cuțitul și farfuria pentru carnea crudă cu apă fierbinte și detergent.',
          ),
        },
        {
          key: 'braise',
          text: t(
            'Cover the pan, lower the heat so the gravy barely bubbles, and cook for 20 minutes, turning the chops once halfway.',
            'Acoperă tigaia, scade focul ca sosul să bolborosească abia perceptibil și gătește 20 de minute, întorcând cotletele o dată la jumătate.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'check',
          text: t(
            'Check a chop: a fork should slide in easily and a thermometer in the thickest part should read at least 63 °C. If it reads lower, cover and cook 1 to 2 minutes more and check again.',
            'Verifică un cotlet: furculița trebuie să intre ușor, iar un termometru în partea cea mai groasă trebuie să arate cel puțin 63 °C. Dacă arată mai puțin, acoperă și mai gătește 1-2 minute, apoi verifică din nou.',
          ),
        },
        {
          key: 'finish',
          text: t(
            'Stir the cream into the gravy, if using, and simmer uncovered for 2 minutes. Taste and add the last 1 g of salt only if it needs it, scatter over the parsley, if using, and serve.',
            'Amestecă frișca lichidă în sos, dacă folosești, și fierbe fără capac 2 minute. Gustă și adaugă ultimul gram de sare doar dacă are nevoie, presară pătrunjelul, dacă folosești, și servește.',
          ),
          timerSeconds: 120,
        },
      ],
      tips: [
        t(
          'Browning the chops and then the onions in the same pan builds the flavour of the gravy: do not wash the pan in between.',
          'Rumenirea cotletelor și apoi a cepei în aceeași tigaie dă gustul sosului: nu spăla tigaia între etape.',
        ),
      ],
      stepTips: [
        {
          step: 'gravy',
          text: t(
            'If the gravy is lumpy, whisk it hard or press it through a sieve before the chops go back in; it will smooth out as it simmers.',
            'Dacă sosul are cocoloașe, bate-l energic cu telul sau treci-l printr-o strecurătoare înainte să pui cotletele la loc; se omogenizează la fiert.',
          ),
        },
      ],
      nutritionNote: t(
        'Protein from the pork and slow-cooked onions in a gravy that is mostly stock and a little flour, so it is lighter than a cream sauce. The frying oil and pork fat add fat, the stock and seasoning add a good deal of salt, and the flour coating adds refined carbohydrate. Serve it with a green vegetable for fibre.',
        'Proteine din porc și ceapă gătită încet, într-un sos făcut mai ales din supă și puțină făină, deci mai ușor decât unul cu smântână. Uleiul de prăjit și grăsimea din porc adaugă grăsime, supa și condimentele adaugă multă sare, iar făina în care sunt tăvălite cotletele aduce carbohidrați rafinați. Servește-l cu o legumă verde pentru fibre.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Steamed rice', 'Orez fiert'),
          reason: t(
            'Plain rice soaks up the onion gravy and keeps the plate mild.',
            'Orezul simplu absoarbe sosul de ceapă și păstrează farfuria blândă.',
          ),
          principle: 'complement_flavour',
          ingredient: 'rice',
        },
        {
          kind: 'food',
          label: t('Green beans', 'Fasole verde'),
          reason: t(
            'Their fresh, crisp snap is a contrast to the soft meat and the gravy.',
            'Crocantul lor proaspăt contrastează cu carnea fragedă și cu sosul.',
          ),
          principle: 'contrast_texture',
          ingredient: 'green-beans',
        },
        {
          kind: 'drink',
          label: t('Iced tea', 'Ceai rece'),
          reason: t(
            'Its light bitterness refreshes the palate between bites of the savoury gravy.',
            'Amăreala lui ușoară împrospătează gustul între îmbucăturile de sos gustos.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'iced-tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A warm, slow-cooked dish with a comforting gravy.',
            'Un preparat cald, gătit încet, cu un sos reconfortant.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Plenty of protein for recovery; the rice adds carbohydrates.',
            'Multe proteine pentru refacere; orezul adaugă carbohidrați.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A heavy, gravy-rich meal sits poorly just before bed.',
            'O masă grea, cu mult sos, cade greu chiar înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
