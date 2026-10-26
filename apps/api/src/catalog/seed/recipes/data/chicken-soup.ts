import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Chicken soup base is a plain chicken noodle soup: bone-in chicken simmered
// into a broth with root vegetables, then noodles. Each Variant is a full Recipe
// with its own lines, steps and guidance; the base's Recipe-level Tips are
// inherited unless a Variant hides them.
export const chickenSoup: BaseRecipeSeed = {
  slug: 'chicken-soup',
  title: t('Chicken noodle soup', 'Supă de pui cu tăiței'),
  servings: 6,
  prepMinutes: 20,
  cookMinutes: 90,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'chicken-leg-quarters',
      quantity: 1000,
      unit: 'g',
      note: t('bone-in, skin on', 'cu os și piele'),
    },
    { ingredient: 'still-water', quantity: 3, unit: 'l' },
    {
      ingredient: 'onion',
      quantity: 1,
      unit: 'pcs',
      note: t('peeled and halved', 'curățată și tăiată în două'),
    },
    {
      ingredient: 'bay-leaves',
      quantity: 0.6,
      unit: 'g',
      note: t('tied in muslin', 'legate în tifon'),
    },
    {
      ingredient: 'peppercorns',
      quantity: 3,
      unit: 'g',
      note: t('tied in the muslin', 'legate în tifon'),
    },
    {
      ingredient: 'thyme',
      quantity: 3,
      unit: 'g',
      note: t('sprigs, tied in the muslin', 'crenguțe, legate în tifon'),
    },
    { ingredient: 'salt', quantity: 15, unit: 'g' },
    {
      ingredient: 'carrot',
      quantity: 300,
      unit: 'g',
      note: t('sliced 1 cm thick', 'tăiați felii de 1 cm'),
    },
    {
      ingredient: 'celery',
      quantity: 150,
      unit: 'g',
      note: t('sliced 1 cm thick', 'tăiată felii de 1 cm'),
    },
    {
      ingredient: 'parsley-root',
      quantity: 100,
      unit: 'g',
      note: t('sliced 1 cm thick', 'tăiată felii de 1 cm'),
    },
    { ingredient: 'egg-noodles', quantity: 200, unit: 'g' },
    {
      ingredient: 'parsley',
      quantity: 15,
      unit: 'g',
      note: t('finely chopped', 'tocat mărunt'),
    },
  ],
  steps: [
    {
      key: 'start',
      text: t(
        'Tie the bay leaves, peppercorns and thyme sprigs in a square of muslin. Put the chicken, halved onion, the muslin bundle and the salt in a large pot (5 litres or more) and pour in the cold water. Bring to a gentle boil over medium-high heat.',
        'Leagă foile de dafin, piperul boabe și crenguțele de cimbru într-o bucată de tifon. Pune puiul, ceapa tăiată în două, legătura de tifon și sarea într-o oală mare (de 5 litri sau mai mare) și toarnă apa rece. Adu la fierbere domoală, la foc mediu-mare.',
      ),
    },
    {
      key: 'simmer',
      text: t(
        'Skim off the grey foam that rises, then turn the heat down until only a few bubbles break the surface. Partly cover and simmer for 40 minutes, until the chicken is cooked through: the juices run clear and the meat pulls easily from the bone.',
        'Ia spuma cenușie de la suprafață, apoi dă focul mai mic, până când doar câteva bule sparg suprafața. Acoperă pe jumătate și fierbe 40 de minute, până când puiul e gătit complet: zeama iese limpede, iar carnea se desprinde ușor de pe os.',
      ),
      timerSeconds: 2400,
    },
    {
      key: 'vegetables',
      text: t(
        'Add the carrots, celery and parsley root and simmer for 20 minutes, until a knife slides into a carrot slice without resistance.',
        'Adaugă morcovii, țelina și rădăcina de pătrunjel și fierbe 20 de minute, până când un cuțit intră fără rezistență într-o felie de morcov.',
      ),
      timerSeconds: 1200,
    },
    {
      key: 'shred',
      text: t(
        'Lift the chicken onto a board. Fish out the onion and the muslin bundle with a slotted spoon. When the chicken is cool enough to handle, pull the meat from the bones in bite-sized pieces and discard the skin and bones.',
        'Scoate puiul pe o tocătoare. Pescuiește ceapa și legătura de tifon cu o lingură cu găuri. Când puiul s-a răcit destul cât să-l ții în mână, desprinde carnea de pe oase în bucăți mici; aruncă pielea și oasele.',
      ),
    },
    {
      key: 'noodles',
      text: t(
        'Bring the broth back to a boil, add the noodles and cook for about 6 minutes, or as long as the packet says, until tender.',
        'Adu din nou supa la fierbere, adaugă tăițeii și fierbe-i aproximativ 6 minute, sau cât scrie pe pachet, până se înmoaie.',
      ),
      timerSeconds: 360,
    },
    {
      key: 'finish',
      text: t(
        'Return the chicken to the pot, stir in the parsley and taste. Add salt a pinch at a time until the broth tastes savoury, then serve hot.',
        'Pune carnea înapoi în oală, adaugă pătrunjelul și gustă. Adaugă sare câte puțin, până când supa are gust bun, apoi servește fierbinte.',
      ),
    },
  ],
  tips: [
    t(
      'Start with cold water and keep the pot at a gentle simmer, never a hard boil: a hard boil turns the broth cloudy and the chicken stringy.',
      'Începe cu apă rece și ține oala la fiert domol, niciodată în clocot puternic: clocotul face supa tulbure și carnea fibroasă.',
    ),
    t(
      'To keep leftovers, cool the soup within 2 hours and keep it in the fridge for up to 3 days. Reheat until steaming hot all the way through.',
      'Ca să păstrezi resturile, răcește supa în cel mult 2 ore și ține-o la frigider până la 3 zile. Reîncălzește până dă în clocot și e fierbinte peste tot.',
    ),
  ],
  stepTips: [
    {
      step: 'noodles',
      text: t(
        'Noodles keep soaking up broth as they sit. If you expect leftovers, cook the noodles in a separate pot and add them to each bowl.',
        'Tăițeii continuă să absoarbă supă cât stau. Dacă vor rămâne resturi, fierbe tăițeii separat și pune-i în fiecare bol.',
      ),
    },
    {
      step: 'finish',
      text: t(
        'The broth already has the salt from the start. Add more in small steps, because the noodles and the meat soak it up.',
        'Supa are deja sarea pusă de la început. Adaugă încă în pași mici, pentru că tăițeii și carnea o absorb.',
      ),
    },
  ],
  nutritionNote: t(
    'The broth is a light, hydrating way to eat chicken protein and plenty of vegetables, but the noodles are mostly refined carbohydrate and the salt adds up fast. Skin the chicken before it goes in the pot, or skim the fat, to keep it lighter, and season gradually.',
    'Supa e o variantă ușoară de a mânca proteine din pui și multe legume, dar tăițeii sunt în mare parte carbohidrați rafinați, iar sarea se adună repede. Dezghioacă puiul înainte să intre în oală sau ia grăsimea de la suprafață, ca să fie mai ușoară, și sărează treptat.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Crusty country bread', 'Pâine de casă cu crustă'),
      reason: t(
        'The firm crust gives the soft noodles and vegetables something to bite against, and soaks up the broth.',
        'Crusta fermă oferă un contrast tăițeilor și legumelor moi și absoarbe supa.',
      ),
      principle: 'contrast_texture',
      ingredient: 'country-bread',
    },
    {
      kind: 'food',
      label: t('Lemon wedge', 'Felie de lămâie'),
      reason: t(
        'A squeeze of acidity brightens a mild broth.',
        'Un strop de acid face mai vioi gustul blând al supei.',
      ),
      principle: 'complement_flavour',
      ingredient: 'lemon',
    },
    {
      kind: 'drink',
      label: t('Dry white wine', 'Vin alb sec'),
      reason: t(
        'A light, crisp white suits the mild chicken broth without covering it.',
        'Un vin alb ușor și proaspăt se potrivește cu supa blândă de pui, fără să o acopere.',
      ),
      principle: 'complement_flavour',
      ingredient: 'white-wine',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'Hot, brothy and warming when it is cold outside.',
        'Fierbinte și încălzitoare când e frig afară.',
      ),
    },
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'Filling without being heavy.',
        'Săturătoare fără să fie grea.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'A big bowl of steaming soup is the last thing you want in the heat.',
        'Un bol mare de supă aburindă e ultimul lucru pe care îl vrei pe căldură.',
      ),
    },
  ],
  variants: [
    {
      slug: 'chicken-soup-greek',
      cuisine: 'greek',
      hideBaseTips: [1],
      title: t(
        'Greek egg-lemon chicken soup (kotosoupa avgolemono)',
        'Supă grecească de pui cu ou și lămâie (avgolemono)',
      ),
      servings: 6,
      prepMinutes: 15,
      cookMinutes: 95,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'whole-chicken',
          quantity: 1500,
          unit: 'g',
        },
        { ingredient: 'still-water', quantity: 3, unit: 'l' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('peeled and halved', 'curățată și tăiată în două'),
        },
        {
          ingredient: 'carrot',
          quantity: 150,
          unit: 'g',
          note: t('peeled, left whole', 'curățat, întreg'),
        },
        {
          ingredient: 'celery',
          quantity: 100,
          unit: 'g',
          note: t('cut in 3 pieces', 'tăiată în 3 bucăți'),
        },
        { ingredient: 'salt', quantity: 15, unit: 'g' },
        { ingredient: 'medium-grain-rice', quantity: 120, unit: 'g' },
        { ingredient: 'eggs', quantity: 3, unit: 'pcs' },
        {
          ingredient: 'lemon',
          quantity: 2,
          unit: 'pcs',
          note: t('juiced (about 80 ml)', 'storsă (aproximativ 80 ml)'),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'poach',
          text: t(
            'Put the chicken, onion, carrot, celery and salt in a large pot and cover with the cold water. Bring to a gentle boil, skim off the foam, then lower the heat, partly cover and simmer for 60 minutes. The chicken is done when the juices from the thickest part of the thigh run clear and the leg moves loosely.',
            'Pune puiul, ceapa, morcovul, țelina și sarea într-o oală mare și acoperă cu apa rece. Adu la fierbere domoală, ia spuma, apoi dă focul mai mic, acoperă pe jumătate și fierbe 60 de minute. Puiul e gata când zeama din partea cea mai groasă a pulpei iese limpede, iar piciorul se mișcă liber.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'strain',
          text: t(
            'Lift the chicken onto a board. Strain the broth into a clean pot and throw away the vegetables.',
            'Scoate puiul pe o tocătoare. Strecoară supa într-o oală curată și aruncă legumele.',
          ),
        },
        {
          key: 'rice',
          text: t(
            'Bring the broth to a gentle boil, add the rice and simmer for 15 minutes, until the grains are just tender.',
            'Adu supa la fierbere domoală, adaugă orezul și fierbe 15 minute, până când boabele sunt abia moi.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'shred',
          text: t(
            'While the rice cooks, pull the meat from the bones in bite-sized pieces, discarding the skin and bones, and check that no pink remains near the bone.',
            'Cât se fierbe orezul, desprinde carnea de pe oase în bucăți mici; aruncă pielea și oasele și verifică să nu fi rămas carne roz lângă os.',
          ),
        },
        {
          key: 'whisk',
          text: t(
            'Whisk the eggs in a large bowl until pale and frothy, then whisk in the lemon juice.',
            'Bate ouăle într-un bol mare până devin deschise la culoare și spumoase, apoi adaugă sucul de lămâie, amestecând.',
          ),
        },
        {
          key: 'temper',
          text: t(
            'Take the pot off the heat. Ladle in about 300 ml of the hot broth, a little at a time, whisking the eggs constantly so they warm up without scrambling.',
            'Ia oala de pe foc. Adaugă cam 300 ml de supă fierbinte, câte puțin, bătând ouăle neîncetat, ca să se încălzească fără să se taie.',
          ),
        },
        {
          key: 'combine',
          text: t(
            'Stir the egg-lemon mixture and the chicken into the pot. Set it over the lowest heat and stir gently for 3 minutes, until the soup is slightly thickened and coats a spoon. Do not let it boil. Season with the pepper and more salt if needed, then serve.',
            'Amestecă compoziția de ou și lămâie și carnea de pui în oală. Pune oala pe foc foarte mic și amestecă ușor 3 minute, până când supa se îngroașă puțin și acoperă lingura. Nu o lăsa să fiarbă. Adaugă piperul și mai multă sare, dacă e nevoie, apoi servește.',
          ),
          timerSeconds: 180,
        },
      ],
      tips: [
        t(
          'The egg is cooked only until it thickens, never boiled. If you cook for someone who should avoid lightly cooked egg (pregnant women, young children, older people, anyone with a weak immune system), make sure the soup has thickened and is steaming hot before serving.',
          'Oul se gătește doar până se îngroașă, fără să fiarbă. Dacă gătești pentru cineva care trebuie să evite ouăle slab gătite (femei însărcinate, copii mici, vârstnici, persoane cu imunitate scăzută), asigură-te că supa s-a îngroșat și e aburindă înainte de servire.',
        ),
        t(
          'Reheat leftovers gently, stirring, until steaming hot and never at a boil, which curdles the egg. Cool within 2 hours and eat within 2 days; the rice keeps swelling and thickens the soup.',
          'Reîncălzește resturile încet, amestecând, până se aburesc bine, dar fără să fiarbă, pentru că fierberea taie oul. Răcește în cel mult 2 ore și consumă în 2 zile; orezul continuă să se umfle și îngroașă supa.',
        ),
      ],
      stepTips: [
        {
          step: 'temper',
          text: t(
            'Pour the broth in a thin stream at first. Hot broth added too fast cooks the egg into threads.',
            'Toarnă supa într-un fir subțire la început. Dacă o torni prea repede, oul se face fire.',
          ),
        },
      ],
      nutritionNote: t(
        'Eggs and chicken give protein, and the rice makes it a filling meal in one bowl. Egg yolks and chicken skin add some saturated fat, and the rice is a plain starch, so serve it with a vegetable side for fibre. Salt is easy to overdo.',
        'Ouăle și puiul dau proteine, iar orezul face din supă o masă completă într-un singur bol. Gălbenușurile și pielea de pui adaugă grăsimi saturate, iar orezul e un amidon simplu, așa că servește-o cu o garnitură de legume pentru fibre. Sarea se pune ușor în exces.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Crusty country bread', 'Pâine de casă cu crustă'),
          reason: t(
            'The crust gives the smooth, creamy soup a crisp contrast.',
            'Crusta oferă supei fine și cremoase un contrast crocant.',
          ),
          principle: 'contrast_texture',
          ingredient: 'country-bread',
        },
        {
          kind: 'food',
          label: t('Olives', 'Măsline'),
          reason: t(
            'Their firm, briny bite sets off the soft, lemony soup.',
            'Măslinele, ferme și sărate, contrastează cu supa moale și acrișoară.',
          ),
          principle: 'contrast_texture',
          ingredient: 'olives',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'A crisp, citrusy white echoes the lemon in the soup.',
            'Un vin alb proaspăt, cu note de citrice, reia gustul de lămâie din supă.',
          ),
          principle: 'complement_flavour',
          ingredient: 'white-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Warm, creamy and comforting in cold weather.',
            'Caldă, cremoasă și reconfortantă pe vreme rece.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'A whole meal in one bowl that is lemony rather than heavy.',
            'O masă completă într-un singur bol, mai degrabă acrișoară decât grea.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'A hot, thickened soup is too much in the heat.',
            'O supă fierbinte și îngroșată e prea mult pe căldură.',
          ),
        },
      ],
    },
    {
      slug: 'chicken-soup-thai',
      cuisine: 'thai',
      hideBaseTips: [0],
      title: t(
        'Thai coconut chicken soup (tom kha gai)',
        'Supă thailandeză de pui cu lapte de cocos (tom kha gai)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 22,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'chicken-stock',
          quantity: 500,
          unit: 'ml',
        },
        {
          ingredient: 'galangal',
          quantity: 40,
          unit: 'g',
          note: t('sliced thin', 'tăiat felii subțiri'),
        },
        {
          ingredient: 'lemongrass',
          quantity: 60,
          unit: 'g',
          note: t(
            'about 2 stalks, bruised and cut in 5 cm lengths',
            'cam 2 tulpini, lovite și tăiate în bucăți de 5 cm',
          ),
        },
        {
          ingredient: 'makrut-lime-leaves',
          quantity: 3,
          unit: 'g',
          note: t('about 6 leaves, torn', 'cam 6 frunze, rupte'),
        },
        { ingredient: 'coconut-milk', quantity: 400, unit: 'ml' },
        {
          ingredient: 'chicken-thighs',
          quantity: 400,
          unit: 'g',
          note: t('sliced 1 cm thick', 'tăiate felii de 1 cm'),
        },
        {
          ingredient: 'oyster-mushrooms',
          quantity: 200,
          unit: 'g',
          note: t('torn into strips', 'rupte în fâșii'),
        },
        { ingredient: 'fish-sauce', quantity: 30, unit: 'ml' },
        {
          ingredient: 'lime',
          quantity: 2,
          unit: 'pcs',
          note: t('juiced (about 60 ml)', 'storse (aproximativ 60 ml)'),
        },
        { ingredient: 'palm-sugar', quantity: 10, unit: 'g' },
        {
          ingredient: 'birds-eye-chilli',
          quantity: 2,
          unit: 'pcs',
          note: t('sliced', 'tăiate felii'),
        },
        {
          ingredient: 'coriander',
          quantity: 15,
          unit: 'g',
          note: t('roughly chopped', 'tocat grosier'),
        },
      ],
      steps: [
        {
          key: 'infuse',
          text: t(
            'Bring the stock to a simmer in a pot with the galangal, lemongrass and lime leaves. Simmer gently for 10 minutes so they flavour the stock.',
            'Adu supa de pui la fiert domol într-o oală, împreună cu galangalul, lemongrassul și frunzele de lămâi kaffir. Fierbe încet 10 minute, ca să dea gust supei.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'chicken',
          text: t(
            'Stir in the coconut milk and the chicken and keep the soup at a gentle simmer for 8 minutes, until the chicken is opaque all the way through with no pink, and the juices run clear.',
            'Adaugă laptele de cocos și puiul și ține supa la fiert domol 8 minute, până când puiul e opac pe toată grosimea, fără urmă de roz, iar zeama iese limpede.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'mushrooms',
          text: t(
            'Add the mushrooms and simmer for 3 minutes, until they are soft.',
            'Adaugă ciupercile și fierbe 3 minute, până se înmoaie.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'season',
          text: t(
            'Take the pot off the heat. Stir in the fish sauce, lime juice, palm sugar and chilli. Taste and adjust: it should be salty, sour, a little sweet and hot at once.',
            'Ia oala de pe foc. Adaugă sosul de pește, sucul de lime, zahărul de palmier și ardeiul iute. Gustă și corectează: trebuie să fie în același timp sărat, acru, ușor dulce și iute.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Ladle into bowls and scatter with the coriander. The galangal, lemongrass and lime leaves flavour the soup but are not eaten; push them to the side of the bowl.',
            'Împarte supa în boluri și presară coriandru. Galangalul, lemongrassul și frunzele de lămâi kaffir dau gust supei, dar nu se mănâncă; dă-le la o parte în bol.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'season',
          text: t(
            'Add the lime juice off the heat: boiling dulls its fresh sourness. Add the fish sauce and lime a little at a time, because brands differ in strength.',
            'Adaugă sucul de lime după ce iei oala de pe foc: fierberea îi taie prospețimea acrișoară. Pune sosul de pește și sucul de lime câte puțin, pentru că mărcile diferă ca intensitate.',
          ),
        },
      ],
      nutritionNote: t(
        'Chicken and mushrooms give protein, and the soup is quick and flavourful without much oil. Coconut milk is high in saturated fat and fish sauce is very salty, so a lighter coconut milk and a small pour of fish sauce keep it lighter; it has few carbohydrates until you add rice.',
        'Puiul și ciupercile dau proteine, iar supa e rapidă și plină de gust, fără mult ulei. Laptele de cocos are multe grăsimi saturate, iar sosul de pește e foarte sărat, așa că un lapte de cocos mai ușor și puțin sos de pește o fac mai ușoară; are puțini carbohidrați, până adaugi orez.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Pad kra pao', 'Pad kra pao (porc sotat cu busuioc sfânt)'),
          reason: t(
            'A Thai meal puts a soup and a stir-fry on the table together with rice, rather than as separate courses.',
            'Într-o masă thailandeză, o supă și un preparat la wok se servesc împreună cu orez, nu ca feluri separate.',
          ),
          principle: 'regional_tradition',
          recipe: 'stir-fry-thai',
        },
        {
          kind: 'food',
          label: t('Jasmine rice', 'Orez jasmine'),
          reason: t(
            'Plain, fragrant rice soaks up the coconut broth and calms the chilli.',
            'Orezul simplu și parfumat absoarbe supa de cocos și îmblânzește iuțeala.',
          ),
          principle: 'complement_flavour',
          ingredient: 'jasmine-rice',
        },
        {
          kind: 'drink',
          label: t('Cold lager', 'Bere blondă rece'),
          reason: t(
            'Cold, light and fizzy, it cools the chilli heat and cleans the coconut fat off the palate.',
            'Rece, ușoară și acidulată, răcorește iuțeala și curăță gustul gras de cocos.',
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
            'Hot, aromatic and warming with the chilli.',
            'Fierbinte, aromată și încălzitoare datorită ardeiului iute.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Ready in about half an hour and not heavy.',
            'Gata în aproximativ jumătate de oră și nu e grea.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Chilli heat late at night does not suit everyone.',
            'Iuțeala ardeiului nu prieste tuturor seara târziu.',
          ),
        },
      ],
    },
    {
      slug: 'chicken-soup-british',
      cuisine: 'british',
      title: t(
        'Cock-a-leekie',
        'Supă scoțiană de pui cu praz și prune (cock-a-leekie)',
      ),
      servings: 6,
      prepMinutes: 20,
      cookMinutes: 125,
      difficulty: 'easy',
      lines: [
        { ingredient: 'whole-chicken', quantity: 1500, unit: 'g' },
        { ingredient: 'still-water', quantity: 3, unit: 'l' },
        {
          ingredient: 'leek',
          key: 'leek-tops',
          quantity: 200,
          unit: 'g',
          note: t(
            'dark green tops, roughly chopped, for the broth',
            'părțile verde-închis, tocate grosier, pentru supă',
          ),
        },
        { ingredient: 'bay-leaves', quantity: 0.6, unit: 'g' },
        { ingredient: 'thyme', quantity: 3, unit: 'g' },
        { ingredient: 'salt', quantity: 12, unit: 'g' },
        { ingredient: 'pearl-barley', quantity: 80, unit: 'g' },
        {
          ingredient: 'leek',
          key: 'leek-rings',
          quantity: 400,
          unit: 'g',
          note: t(
            'white and light green parts, sliced 1 cm thick, for the soup',
            'părțile albe și verde-deschis, tăiate felii de 1 cm, pentru supă',
          ),
        },
        {
          ingredient: 'carrot',
          quantity: 150,
          unit: 'g',
          note: t('diced', 'tăiat cubulețe'),
        },
        {
          ingredient: 'prunes',
          quantity: 100,
          unit: 'g',
          note: t('pitted, halved', 'fără sâmburi, tăiate în două'),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        {
          ingredient: 'parsley',
          quantity: 15,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
      ],
      steps: [
        {
          key: 'poach',
          text: t(
            'Put the chicken, leek tops, bay leaves, thyme and 8 g of the salt in a large pot and cover with the cold water. Bring to a gentle boil, skim off the foam, then lower the heat, partly cover and simmer for 60 minutes. The chicken is done when the juices from the thickest part of the thigh run clear and the leg moves loosely.',
            'Pune puiul, părțile verzi ale prazului, foile de dafin, cimbrul și 8 g din sare într-o oală mare și acoperă cu apa rece. Adu la fierbere domoală, ia spuma, apoi dă focul mai mic, acoperă pe jumătate și fierbe 60 de minute. Puiul e gata când zeama din partea cea mai groasă a pulpei iese limpede, iar piciorul se mișcă liber.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'strain',
          text: t(
            'Lift the chicken onto a board. Strain the broth into a clean pot and throw away the leek tops, bay leaves and thyme. When the chicken is cool enough to handle, pull the meat from the bones in bite-sized pieces, discarding the skin and bones.',
            'Scoate puiul pe o tocătoare. Strecoară supa într-o oală curată și aruncă părțile verzi ale prazului, foile de dafin și cimbrul. Când puiul s-a răcit destul cât să-l ții în mână, desprinde carnea de pe oase în bucăți mici; aruncă pielea și oasele.',
          ),
        },
        {
          key: 'barley',
          text: t(
            'Bring the broth to a simmer, add the barley and cook for 30 minutes, stirring now and then, until the grains are almost tender.',
            'Adu supa la fiert domol, adaugă arpacașul și fierbe 30 de minute, amestecând din când în când, până când boabele sunt aproape moi.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'vegetables',
          text: t(
            'Add the sliced leeks, carrot and prunes and simmer for 15 minutes, until the leeks are very soft and the barley is tender.',
            'Adaugă prazul tăiat felii, morcovul și prunele și fierbe 15 minute, până când prazul e foarte moale și arpacașul e fiert.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'finish',
          text: t(
            'Return the chicken to the pot with the remaining 4 g of salt and the pepper. Heat for a minute or two until steaming hot. Taste, add salt if needed, stir in the parsley and serve.',
            'Pune carnea înapoi în oală, cu cei 4 g de sare rămași și piperul. Încălzește un minut-două, până se aburește. Gustă, adaugă sare dacă e nevoie, amestecă pătrunjelul și servește.',
          ),
        },
      ],
      tips: [
        t(
          'The barley keeps swelling as the soup sits, so leftovers come out thick as a stew. Loosen them with a splash of water when you reheat.',
          'Arpacașul continuă să se umfle cât stă supa, așa că a doua zi iese groasă ca o tocăniță. Subțiaz-o cu puțină apă când o reîncălzești.',
        ),
      ],
      stepTips: [
        {
          step: 'vegetables',
          text: t(
            'Rinse the sliced leeks in a bowl of water first: grit hides between the layers.',
            'Spală prazul tăiat într-un bol cu apă înainte: nisipul se ascunde între straturi.',
          ),
        },
      ],
      nutritionNote: t(
        'A filling one-pot meal: chicken gives protein, and barley, leeks and prunes add plant fibre. Chicken skin and the broth fat add saturated fat, so skim the broth, and the prunes bring natural sugar, so the soup is not a low-carbohydrate dish.',
        'O masă săturătoare dintr-o singură oală: puiul dă proteine, iar arpacașul, prazul și prunele adaugă fibre vegetale. Pielea de pui și grăsimea din supă adaugă grăsimi saturate, așa că ia grăsimea de la suprafață; prunele aduc zahăr natural, deci supa nu e săracă în carbohidrați.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Wholemeal bread', 'Pâine integrală'),
          reason: t(
            'A hearty, chewy slice stands up to the barley and mops up the broth.',
            'O felie consistentă de pâine integrală ține pasul cu arpacașul și absoarbe supa.',
          ),
          principle: 'contrast_texture',
          ingredient: 'wholemeal-bread',
        },
        {
          kind: 'drink',
          label: t('Malty brown ale', 'Bere brună maltată'),
          reason: t(
            'Its malty sweetness echoes the prunes in the soup.',
            'Dulceața ei de malț reia gustul prunelor din supă.',
          ),
          principle: 'complement_flavour',
          ingredient: 'dark-beer',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Thick, hot and warming on a cold day.',
            'Groasă, fierbinte și încălzitoare într-o zi rece.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Chicken for protein and barley for carbohydrates.',
            'Pui pentru proteine și arpacaș pentru carbohidrați.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'Too hearty and hot for warm weather.',
            'Prea consistentă și fierbinte pentru vremea caldă.',
          ),
        },
      ],
    },
  ],
};
