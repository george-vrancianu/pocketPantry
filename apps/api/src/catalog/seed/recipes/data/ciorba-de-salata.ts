import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Ciorbă de salată base is the Transylvanian lettuce sour soup: smoked
// bacon fried crisp, spring onion, wilted lettuce, an omelette fried in the
// bacon fat and cut into pieces, garlic, and a yolk, sour cream and vinegar
// liaison stirred in off the boil. Each Variant is a full Recipe with its own
// lines, steps and guidance. The base's first Recipe-level Tip (washing
// lettuce) holds in both Variants. The other three are about the liaison, the
// bacon soup and its leftovers, so both Variants hide them and carry their own.
export const ciorbaDeSalata: BaseRecipeSeed = {
  slug: 'ciorba-de-salata',
  title: t(
    'Transylvanian lettuce sour soup with smoked bacon and omelette (ciorbă de salată)',
    'Ciorbă ardelenească de salată verde cu afumătură și omletă',
  ),
  servings: 6,
  prepMinutes: 20,
  cookMinutes: 45,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'lettuce',
      quantity: 3,
      unit: 'pcs',
      note: t(
        'about 250 g each, washed, cut into 2 cm ribbons',
        'de câte 250 g fiecare, spălate, tăiate fâșii de 2 cm',
      ),
    },
    {
      ingredient: 'bacon',
      quantity: 150,
      unit: 'g',
      note: t(
        'smoked, cut into strips 1 cm wide',
        'afumat, tăiat fâșii late de 1 cm',
      ),
    },
    { ingredient: 'sunflower-oil', quantity: 15, unit: 'ml' },
    {
      ingredient: 'spring-onion',
      quantity: 150,
      unit: 'g',
      note: t('chopped', 'tocată'),
    },
    {
      ingredient: 'garlic',
      quantity: 15,
      unit: 'g',
      note: t('crushed', 'pisat'),
    },
    { ingredient: 'still-water', quantity: 2.5, unit: 'l' },
    {
      ingredient: 'eggs',
      quantity: 5,
      unit: 'pcs',
      note: t(
        '3 whole for the omelette, 2 separated: the whites go into the omelette, the yolks into the liaison',
        '3 întregi pentru omletă și 2 separate: albușurile merg în omletă, gălbenușurile în amestecul cu care dregi ciorba',
      ),
    },
    {
      ingredient: 'sour-cream',
      quantity: 180,
      unit: 'g',
      note: t(
        '30 g for the omelette, 150 g for the liaison',
        '30 g pentru omletă, 150 g pentru amestecul de gălbenușuri',
      ),
    },
    {
      ingredient: 'vinegar',
      quantity: 40,
      unit: 'ml',
      note: t(
        'start with 30 ml, add the rest to taste',
        'începe cu 30 ml, adaugă restul după gust',
      ),
    },
    {
      ingredient: 'dill',
      quantity: 30,
      unit: 'g',
      note: t('chopped', 'tocat'),
    },
    {
      ingredient: 'salt',
      quantity: 15,
      unit: 'g',
      note: t(
        '1 g (a pinch) for the omelette, 14 g at the end, to taste',
        '1 g (un praf) pentru omletă, 14 g la sfârșit, după gust',
      ),
    },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
  ],
  steps: [
    {
      key: 'prep',
      text: t(
        'Wash the lettuce in a big bowl of cold water, lift it out and repeat until no grit is left, then cut it into 2 cm ribbons. Chop the spring onion, crush the garlic and chop the dill, so all the raw chopping is done before the bacon and eggs.',
        'Spală salata într-un castron mare cu apă rece, scoate-o din apă și repetă până nu mai rămâne nisip, apoi taie-o fâșii de 2 cm. Toacă ceapa verde, pisează usturoiul și toacă mărarul, ca tot ce e de tocat crud să fie gata înainte de afumătură și de ouă.',
      ),
    },
    {
      key: 'bacon',
      text: t(
        'Cut the bacon into strips, put them in a cold 5 l pot with the oil and set it over medium heat. Fry, stirring now and then, for about 8 minutes, until the fat has run out and the strips are crisp. Wash your hands, the board and the knife after laying the bacon in the pot, and swap the spoon that stirred the raw bacon for a clean one once the bacon is crisp.',
        'Taie afumătura fâșii, pune-le într-o oală rece de 5 l împreună cu uleiul și așază oala pe foc mediu. Prăjește, amestecând din când în când, cam 8 minute, până se topește grăsimea și fâșiile devin crocante. Spală-ți mâinile, tocătorul și cuțitul după ce ai pus afumătura în oală și schimbă lingura cu care ai amestecat afumătura crudă cu una curată după ce fâșiile s-au făcut crocante.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'fat',
      text: t(
        'Take the pot off the heat. Lift the crisp bacon onto a plate. Spoon or ladle off all but about 1 tablespoon of the hot fat into a heatproof bowl or metal cup (not plastic) and keep it for the omelette. Never pour fat down the sink.',
        'Ia oala de pe foc. Scoate afumătura crocantă pe o farfurie. Ia cu o lingură sau un polonic grăsimea fierbinte, lăsând în oală doar cam o lingură, și pune-o într-un bol rezistent la căldură sau într-o cană metalică (nu din plastic); păstrează-o pentru omletă. Nu turna niciodată grăsime în chiuvetă.',
      ),
    },
    {
      key: 'onion',
      text: t(
        'Return the pot to medium heat, add the spring onion and soften it in the fat that is left for about 2 minutes, until it is bright and tender.',
        'Pune oala la loc pe foc mediu, adaugă ceapa verde și călește-o în grăsimea rămasă cam 2 minute, până se înmoaie și capătă un verde aprins.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'lettuce',
      text: t(
        'Add the lettuce in handfuls and stir for about 3 minutes, until it has wilted down and turned a darker green.',
        'Adaugă salata câte o mână și amestecă cam 3 minute, până se ofilește și capătă o culoare verde mai închisă.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'boil',
      text: t(
        'Pour in the water slowly, away from your face, and add the pepper and about two thirds of the crisp bacon. Bring to the boil over high heat, which takes about 10 minutes.',
        'Toarnă apa încet, ținând fața departe, și adaugă piperul și cam două treimi din afumătura crocantă. Adu la fierbere la foc mare, ceea ce durează cam 10 minute.',
      ),
    },
    {
      key: 'simmer',
      text: t(
        'Turn the heat down and simmer, uncovered, for 12 minutes. Do the omelette in the next two steps while it simmers.',
        'Scade focul și fierbe la foc mic, fără capac, 12 minute. Fă omleta din următorii doi pași cât timp fierbe ciorba.',
      ),
      timerSeconds: 720,
    },
    {
      key: 'eggs',
      text: t(
        'Separate 2 of the eggs: drop the yolks into a large bowl for the liaison mixture and the whites into a second bowl. Crack the other 3 eggs in with the whites, add 30 g of the sour cream and a pinch of salt (1 g), and whisk. Wash your hands after cracking the eggs.',
        'Separă 2 dintre ouă: pune gălbenușurile într-un castron mare pentru amestecul de dres și albușurile într-un al doilea castron. Sparge în albușuri și celelalte 3 ouă, adaugă 30 g din smântână și un praf de sare (1 g) și bate. Spală-ți mâinile după ce ai spart ouăle.',
      ),
    },
    {
      key: 'omelette',
      text: t(
        'Heat about 2 tablespoons of the kept bacon fat in a 24 cm non-stick pan over medium heat and pour in the eggs. Cook for about 4 minutes, until the underside is golden and the top is almost set, then slide it onto a plate, hold the pan upside down over it and, wearing an oven glove, turn the plate and pan over together. Lift the plate away (carefully, the fat spits) and cook for 2 minutes more. It is done when the middle is firm and opaque with no liquid egg: cut into it to check. Cut it into strips about 1 cm wide on a clean board. Let any leftover fat cool and throw it in the bin.',
        'Încinge cam 2 linguri din grăsimea de afumătură păstrată într-o tigaie antiaderentă de 24 cm la foc mediu și toarnă ouăle. Gătește cam 4 minute, până când partea de jos se rumenește și deasupra e aproape prinsă, apoi alunecă omleta pe o farfurie, ține tigaia răsturnată deasupra ei și, purtând mănușă de cuptor, întoarce farfuria și tigaia împreună. Ridică farfuria (cu grijă, grăsimea stropește) și mai gătește 2 minute. E gata când mijlocul e ferm și opac, fără ou lichid: taie în ea ca să verifici. Taie-o fâșii late de cam 1 cm pe un tocător curat. Lasă grăsimea rămasă să se răcească și aruncă-o la gunoi.',
      ),
      timerSeconds: 360,
    },
    {
      key: 'garlic',
      text: t(
        'Stir the garlic into the soup and simmer for 2 more minutes.',
        'Amestecă usturoiul în ciorbă și mai fierbe 2 minute.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'liaison',
      text: t(
        'Take the pot off the heat and wait until it stops bubbling. Add the remaining 150 g of sour cream and 30 ml of the vinegar to the yolks and whisk. Ladle in about 2 ladlefuls of the hot soup, a little at a time, whisking all the while, then pour the mixture back into the pot, stirring.',
        'Ia oala de pe foc și așteaptă până nu mai clocotește. Adaugă în gălbenușuri restul de 150 g de smântână și 30 ml din oțet și amestecă. Toarnă cam 2 polonice de ciorbă fierbinte, puțin câte puțin, amestecând mereu, apoi toarnă amestecul înapoi în oală, mestecând.',
      ),
    },
    {
      key: 'hold',
      text: t(
        'Put the pot back on the lowest heat. Stir constantly for about 2 minutes, until the soup is hot, steaming and very slightly thickened. Do not let it bubble again, or the yolks will curdle.',
        'Pune oala la loc pe focul cel mai mic. Amestecă încontinuu cam 2 minute, până când ciorba e fierbinte, scoate aburi și s-a îngroșat foarte puțin. Nu o lăsa să mai clocotească, altfel gălbenușurile se taie.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'finish',
      text: t(
        'Off the heat, stir in the omelette strips and half of the dill. Taste and add the rest of the vinegar and the remaining 14 g of salt, a little at a time, until it tastes right. Ladle into bowls and top with the remaining crisp bacon and dill.',
        'De pe foc, adaugă fâșiile de omletă și jumătate din mărar. Gustă și adaugă restul de oțet și cei 14 g de sare rămași, puțin câte puțin, până are gustul potrivit. Servește în boluri, cu restul de afumătură crocantă și de mărar deasupra.',
      ),
    },
  ],
  tips: [
    t(
      'Lettuce holds grit between its leaves. Wash it in a big bowl of cold water and lift it out rather than pouring the water off, so the grit stays at the bottom.',
      'Salata ține nisip între frunze. Spală-o într-un castron mare cu apă rece și scoate-o cu mâna, fără să torni apa, ca nisipul să rămână pe fund.',
    ),
    t(
      'Cool leftovers within 2 hours, in shallow containers, and keep them in the fridge for 3 to 4 days. Reheat gently, stirring, until steaming hot but not at a rolling boil, which would split the yolk and sour cream mixture.',
      'Lasă mâncarea rămasă să se răcească în cel mult 2 ore, în vase joase, și ține-o la frigider 3-4 zile. Încălzește-o încet, amestecând, până scoate aburi, dar nu la fiert puternic, ca amestecul de gălbenuș și smântână să nu se taie.',
    ),
    t(
      'The yolk and sour cream mixture is only warmed, not boiled. If anyone at the table should avoid lightly cooked egg (small children, older people, anyone pregnant or unwell), skip the yolks: stir in the sour cream and vinegar without them. The omelette is cooked through either way. The soup contains eggs and milk.',
      'Amestecul de gălbenuș și smântână este doar încălzit, nu fiert. Dacă la masă e cineva care trebuie să evite ouăle slab gătite (copii mici, persoane în vârstă, gravide sau bolnave), renunță la gălbenușuri: adaugă smântâna și oțetul fără ele. Omleta e oricum gătită complet. Ciorba conține ouă și lapte.',
    ),
    t(
      'Vinegars differ in strength, so add them a little at a time and taste. The bacon is already salty, so add most of the salt only at the end.',
      'Oțeturile diferă ca tărie, așa că adaugă-le puțin câte puțin și gustă. Afumătura e deja sărată, așa că pune cea mai mare parte din sare abia la sfârșit.',
    ),
  ],
  stepTips: [
    {
      step: 'bacon',
      text: t(
        'Starting the bacon in a cold pot lets the fat melt out slowly, so the strips crisp without burning.',
        'Dacă pui afumătura în oala rece, grăsimea se topește treptat, iar fâșiile se rumenesc fără să se ardă.',
      ),
    },
    {
      step: 'liaison',
      text: t(
        'Add the hot soup to the yolks slowly and keep whisking: yolks that warm up gradually thicken the soup, while a sudden rush of heat scrambles them.',
        'Adaugă ciorba fierbinte peste gălbenușuri încet și amestecă mereu: gălbenușurile încălzite treptat îngroașă ciorba, pe când o încălzire bruscă le face să se încheagă în bucăți.',
      ),
    },
  ],
  nutritionNote: t(
    'Mostly water and lettuce, so it is light, and the eggs add protein. The smoked bacon brings salt, the bacon and the sour cream bring saturated fat, and there is little fibre or starch, so serve it with bread to make a full meal and go easy on added salt, since the bacon is already salty.',
    'În mare parte apă și salată, deci este ușoară, iar ouăle aduc proteine. Afumătura aduce sare, afumătura și smântâna aduc grăsimi saturate, iar fibre și amidon sunt puține, așa că servește ciorba cu pâine ca să devină o masă completă și sărează cu măsură, pentru că afumătura e deja sărată.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Fresh bread', 'Pâine proaspătă'),
      reason: t(
        'A slice of crusty bread is good for dunking in the sour, creamy broth and gives the soft lettuce a contrast.',
        'O felie de pâine cu coajă crocantă e bună de înmuiat în zeama acrișoară și dă salatei moi un contrast.',
      ),
      principle: 'contrast_texture',
      ingredient: 'bread',
    },
    {
      kind: 'food',
      label: t('Hot pepper', 'Ardei iute'),
      reason: t(
        'A bite of fresh hot pepper wakes up the mild lettuce and the smoky bacon.',
        'O muscătură de ardei iute proaspăt trezește gustul blând al salatei și pe cel al afumăturii.',
      ),
      principle: 'complement_flavour',
      ingredient: 'hot-pepper',
    },
    {
      kind: 'drink',
      label: t('Sparkling water', 'Apă minerală'),
      reason: t(
        'The bubbles refresh the palate after the salty bacon and the sour cream.',
        'Bulele împrospătează gustul după afumătura sărată și smântână.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'sparkling-water',
    },
  ],
  eatingMoments: [
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'Light and sour, and the omelette makes it a proper lunch with bread.',
        'Ușoară și acrișoară, iar omleta o face un prânz potrivit, împreună cu pâine.',
      ),
    },
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'Hot, smoky and comforting.',
        'Fierbinte, afumată și reconfortantă.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'The smoked bacon and sour cream are salty and rich to go to bed on.',
        'Afumătura și smântâna sunt sărate și grele înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'ciorba-de-salata-french',
      cuisine: 'french',
      // The liaison, the bacon and the sour-cream tips do not apply to a
      // blended cream soup with no egg. It has its own storage Tip.
      hideBaseTips: [1, 2, 3],
      title: t(
        'Potage à la laitue (French cream of lettuce soup)',
        'Potage à la laitue (supă-cremă franțuzească de salată verde)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 32,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'butter',
          quantity: 30,
          unit: 'g',
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely chopped', 'tocată mărunt'),
        },
        {
          ingredient: 'potato',
          quantity: 0.25,
          unit: 'kg',
          note: t(
            'peeled, diced into 1.5 cm cubes',
            'curățați, tăiați cuburi de 1,5 cm',
          ),
        },
        {
          ingredient: 'vegetable-stock',
          quantity: 800,
          unit: 'ml',
          note: t(
            'hot, made up as the pack directs',
            'fierbinte, preparată după instrucțiunile de pe ambalaj',
          ),
        },
        {
          ingredient: 'lettuce',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'about 250 g each, washed, cut into ribbons',
            'de câte 250 g fiecare, spălate, tăiate fâșii',
          ),
        },
        { ingredient: 'whipping-cream', quantity: 120, unit: 'ml' },
        { ingredient: 'salt', quantity: 2, unit: 'g' },
        { ingredient: 'white-pepper', quantity: 0.5, unit: 'g' },
        {
          ingredient: 'chives',
          quantity: 5,
          unit: 'g',
          optional: true,
          note: t('finely chopped', 'tocat mărunt'),
        },
      ],
      steps: [
        {
          key: 'sweat',
          text: t(
            'Melt the butter in a 3 l pot over low heat. Add the onion and sweat it for about 6 minutes, stirring now and then, until soft and translucent but not coloured.',
            'Topește untul într-o oală de 3 l la foc mic. Adaugă ceapa și înmoaie-o cam 6 minute, amestecând din când în când, până devine moale și translucidă, fără să se rumenească.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'potato',
          text: t(
            'Add the potato and the hot stock and bring to the boil over high heat, about 4 minutes. Turn the heat down and simmer, partly covered, for about 12 minutes, until a piece of potato crushes easily against the side of the pot. If it is still firm, simmer on and check every 3 minutes.',
            'Adaugă cartofii și supa fierbinte și adu la fierbere la foc mare, cam 4 minute. Scade focul și fierbe, cu capacul pe jumătate pus, cam 12 minute, până când un cub de cartof se strivește ușor pe marginea oalei. Dacă mai e tare, mai fierbe și verifică din 3 în 3 minute.',
          ),
          timerSeconds: 720,
        },
        {
          key: 'lettuce',
          text: t(
            'Stir in the lettuce in handfuls and simmer for 4 minutes, until it has wilted but is still green. Cooking it longer turns the soup khaki.',
            'Adaugă salata câte o mână și fierbe 4 minute, până se ofilește, dar rămâne verde. Dacă o fierbi mai mult, supa se face verde-cenușiu.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'blend',
          text: t(
            'Take the pot off the heat and blend the soup until completely smooth, about 1 minute with a stick blender. If you use a jug blender, fill it no more than half, remove the centre cap of the lid, cover the hole with a folded tea towel and start on the lowest speed, because steam from hot soup builds pressure under a sealed lid and can blow it off.',
            'Ia oala de pe foc și mixează supa până devine complet fină, cam 1 minut cu un mixer vertical. Dacă folosești un blender cu vas, umple-l cel mult pe jumătate, scoate căpăcelul din mijlocul capacului, acoperă gaura cu un prosop de bucătărie împăturit și pornește-l la cea mai mică viteză, pentru că aburul supei fierbinți face presiune sub un capac închis etanș și îl poate arunca.',
          ),
        },
        {
          key: 'cream',
          text: t(
            'Return the soup to low heat, stir in the cream and warm it for 2 to 3 minutes until steaming, without letting it boil. Taste and season with the salt and white pepper.',
            'Pune supa la loc pe foc mic, adaugă smântâna lichidă și încălzește 2-3 minute, până scoate aburi, fără să fiarbă. Gustă și potrivește cu sare și piper alb.',
          ),
          timerSeconds: 150,
        },
        {
          key: 'serve',
          text: t(
            'Ladle into warm bowls and scatter with the chives, if you are using them.',
            'Servește în boluri calde, cu arpagic presărat deasupra, dacă îl folosești.',
          ),
        },
      ],
      tips: [
        t(
          'Cool leftovers within 2 hours and keep them in the fridge for 3 to 4 days. Reheat gently until steaming, without a rolling boil, which dulls the colour.',
          'Lasă supa rămasă să se răcească în cel mult 2 ore și ține-o la frigider 3-4 zile. Încălzește-o încet, până scoate aburi, fără fiert puternic, care îi tulbură culoarea.',
        ),
        t(
          'The soup contains milk (butter and cream), and the stock may contain celery: check the label.',
          'Supa conține lapte (unt și smântână lichidă), iar supa concentrată poate conține țelină: citește eticheta.',
        ),
      ],
      stepTips: [
        {
          step: 'lettuce',
          text: t(
            'Add the lettuce late: it needs only a few minutes, and the potato has already given the soup its body.',
            'Adaugă salata târziu: îi trebuie doar câteva minute, iar cartoful a dat deja corp supei.',
          ),
        },
      ],
      nutritionNote: t(
        'Lighter than many cream soups, because the potato gives it body so only a little cream is needed, but the butter and cream still add a good deal of fat, mostly saturated, stock can be salty (season at the end), and it has little protein, so it suits a starter or a light lunch with bread and cheese.',
        'Mai ușoară decât multe supe cremă, pentru că cartoful îi dă corp și e nevoie de puțină smântână lichidă, dar untul și smântâna lichidă aduc totuși destulă grăsime, în mare parte saturată, supa concentrată poate fi sărată (sărează la final), iar proteinele sunt puține, așa că se potrivește ca început de masă sau ca prânz ușor, cu pâine și brânză.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Croutons', 'Crutoane'),
          reason: t(
            'Crisp cubes of toasted bread against the smooth, velvety soup.',
            'Cuburi crocante de pâine prăjită, în contrast cu supa fină și catifelată.',
          ),
          principle: 'contrast_texture',
          ingredient: 'croutons',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Crisp acidity cuts through the cream and suits the green, mild flavour.',
            'Aciditatea fină taie smântâna lichidă și se potrivește cu gustul verde și blând.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'white-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Smooth and gentle, filling enough with bread.',
            'Fină și blândă, destul de săturătoare cu pâine.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Hot, creamy and soothing.',
            'Fierbinte, cremoasă și liniștitoare.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Cream and butter sit heavy in the stomach during hard exercise.',
            'Smântâna lichidă și untul cad greu la stomac în timpul unui efort intens.',
          ),
        },
      ],
    },
    {
      slug: 'ciorba-de-salata-chinese',
      cuisine: 'chinese',
      // The liaison, the bacon and the sour-cream tips do not apply to a clear
      // egg-drop broth. It has its own storage Tip.
      hideBaseTips: [1, 2, 3],
      title: t(
        'Lettuce and egg drop soup (shēngcài dànhuā tāng)',
        'Shēngcài dànhuā tāng (supă chinezească de salată verde cu fire de ou)',
      ),
      servings: 4,
      prepMinutes: 10,
      cookMinutes: 15,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'chicken-stock',
          quantity: 1000,
          unit: 'ml',
          note: t(
            'hot, made up as the pack directs, preferably low-salt',
            'fierbinte, preparată după instrucțiunile de pe ambalaj, de preferat cu puțină sare',
          ),
        },
        {
          ingredient: 'ginger',
          quantity: 15,
          unit: 'g',
          note: t('thinly sliced', 'tăiat felii subțiri'),
        },
        {
          ingredient: 'lettuce',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'about 250 g, cos (romaine) or other crisp lettuce, washed and torn into pieces',
            'de cam 250 g, salată romană sau altă salată crocantă, spălată și ruptă bucăți',
          ),
        },
        {
          ingredient: 'corn-starch',
          quantity: 10,
          unit: 'g',
          optional: true,
          note: t(
            'mixed with 30 ml cold water',
            'amestecat cu 30 ml de apă rece',
          ),
        },
        { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
        { ingredient: 'sesame-oil', quantity: 5, unit: 'ml' },
        { ingredient: 'white-pepper', quantity: 0.5, unit: 'g' },
        {
          ingredient: 'soy-sauce',
          quantity: 10,
          unit: 'ml',
          optional: true,
        },
        { ingredient: 'salt' },
        {
          ingredient: 'spring-onion',
          quantity: 20,
          unit: 'g',
          note: t('thinly sliced', 'tăiată rondele subțiri'),
        },
      ],
      steps: [
        {
          key: 'beat',
          text: t(
            'Beat the eggs in a small jug until smooth. Wash your hands after cracking them.',
            'Bate ouăle într-o cană mică până se omogenizează. Spală-ți mâinile după ce le-ai spart.',
          ),
        },
        {
          key: 'boil',
          text: t(
            'Put the hot stock and the ginger slices in a 2 l pot and bring to the boil over high heat, about 3 minutes.',
            'Pune supa fierbinte și feliile de ghimbir într-o oală de 2 l și adu la fierbere la foc mare, cam 3 minute.',
          ),
        },
        {
          key: 'infuse',
          text: t(
            'Turn the heat down and simmer for 5 minutes, so the ginger flavours the stock. Then lift out the ginger slices with a slotted spoon.',
            'Scade focul și fierbe 5 minute, ca ghimbirul să parfumeze supa. Apoi scoate feliile de ghimbir cu o lingură cu găuri.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'lettuce',
          text: t(
            'Add the torn lettuce and simmer for 1 minute, until it just wilts and is still bright green.',
            'Adaugă salata ruptă și fierbe 1 minut, până se ofilește puțin și rămâne verde aprins.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'slurry',
          text: t(
            'If you are using the corn-starch, stir it again and pour it into the soup, stirring, then simmer for 1 minute, until the soup is slightly thickened and clear.',
            'Dacă folosești amidonul de porumb, amestecă-l din nou și toarnă-l în supă, amestecând, apoi fierbe 1 minut, până supa se îngroașă ușor și e limpede.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'egg',
          text: t(
            'Keep the soup at a gentle simmer with small bubbles. Pour in the egg in a thin stream, stirring the soup slowly in one direction, until the egg has set into ribbons. They are done when they are opaque and firm, with no runny egg, after about 30 seconds.',
            'Ține supa la fiert domol, cu bule mici. Toarnă oul într-un fir subțire, amestecând încet supa într-o singură direcție, până când oul se prinde în fâșii. Sunt gata când sunt opace și ferme, fără ou lichid, după cam 30 de secunde.',
          ),
          timerSeconds: 30,
        },
        {
          key: 'finish',
          text: t(
            'Take the pot off the heat. Stir in the sesame oil, the white pepper and the soy sauce, if using. Taste and add salt only if it needs it, then scatter with the spring onion and serve at once.',
            'Ia oala de pe foc. Adaugă uleiul de susan, piperul alb și sosul de soia, dacă folosești. Gustă și adaugă sare doar dacă e nevoie, apoi presară ceapă verde și servește imediat.',
          ),
        },
      ],
      tips: [
        t(
          'Pour the egg slowly into simmering, not boiling, soup: fierce bubbles shred it into cloudy bits, while a gentle simmer sets it into silky ribbons.',
          'Toarnă oul încet în supa care fierbe domol, nu tare: bulele puternice îl fac bucăți tulburi, iar un fiert blând îl prinde în fâșii mătăsoase.',
        ),
        t(
          'Cool leftovers within 2 hours and keep them in the fridge for 3 to 4 days. Reheat until steaming hot. It is best eaten the same day, as the lettuce goes limp.',
          'Lasă supa rămasă să se răcească în cel mult 2 ore și ține-o la frigider 3-4 zile. Încălzește-o până scoate aburi. Cel mai bine se mănâncă în aceeași zi, pentru că salata se înmoaie.',
        ),
        t(
          'The soup contains egg, sesame (the oil) and celery (in the stock). Soy sauce, if used, adds soya and gluten: check the labels.',
          'Supa conține ou, susan (uleiul) și țelină (în supa concentrată). Sosul de soia, dacă îl folosești, adaugă soia și gluten: citește etichetele.',
        ),
      ],
      stepTips: [
        {
          step: 'egg',
          text: t(
            'Pour the egg from a height of about 15 cm through the tines of a fork: it falls in thinner threads, and thinner threads cook through faster.',
            'Toarnă oul de la cam 15 cm înălțime printre dinții unei furculițe: cade în fire mai subțiri, iar firele mai subțiri se gătesc mai repede.',
          ),
        },
      ],
      nutritionNote: t(
        'A light, quick broth with a little protein from the egg and little fat. The stock and soy sauce carry most of the salt, so choose low-salt stock and taste before adding more. Lettuce adds freshness more than substance, so serve it with rice or noodles for a full meal.',
        'O supă ușoară și rapidă, cu puține proteine din ou și puțină grăsime. Supa concentrată și sosul de soia aduc cea mai mare parte din sare, așa că alege o supă cu puțină sare și gustă înainte să mai adaugi. Salata aduce mai degrabă prospețime decât sațietate, așa că servește supa cu orez sau tăiței pentru o masă completă.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Steamed rice', 'Orez fiert la abur'),
          reason: t(
            'A plain, filling base that turns the light broth into a meal.',
            'O bază simplă și săturătoare, care transformă supa ușoară într-o masă.',
          ),
          principle: 'complement_flavour',
          ingredient: 'rice',
        },
        {
          kind: 'drink',
          label: t('Green tea', 'Ceai verde'),
          reason: t(
            'Its light bitterness cleanses the palate after the sesame and ginger.',
            'Amăreala ușoară împrospătează gustul după susan și ghimbir.',
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
            'Quick and light, ready in under half an hour.',
            'Rapidă și ușoară, gata în mai puțin de o jumătate de oră.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Hot and warming with ginger.',
            'Fierbinte și încălzitoare, cu ghimbir.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'good_for',
          reason: t(
            'Light on the stomach, with little to digest before bed.',
            'Ușoară pentru stomac, cu puțin de digerat înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
