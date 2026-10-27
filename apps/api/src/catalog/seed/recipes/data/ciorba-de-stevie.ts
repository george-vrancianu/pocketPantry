import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Ciorbă de ștevie base is the Romanian spring soup of patience dock:
// onion and carrot softened in oil, rice, the leaves cooked for a few minutes,
// soured with borș and finished with an egg and sour cream liaison. Each
// Variant is a full Recipe with its own lines, steps and guidance. They use
// sorrel (măcriș), which is what the French and Polish dishes call for. The
// base's first Recipe-level Tip (oxalate) holds in both Variants. The second
// (make ahead, reheat gently, about the egg liaison) holds in the French one,
// but the Polish soup has no egg in it, so it hides it. The third is about borș
// and ștevie, so both hide it.
export const ciorbaDeStevie: BaseRecipeSeed = {
  slug: 'ciorba-de-stevie',
  title: t(
    'Romanian patience dock sour soup with egg (ciorbă de ștevie)',
    'Ciorbă de ștevie',
  ),
  servings: 6,
  prepMinutes: 25,
  cookMinutes: 50,
  difficulty: 'easy',
  lines: [
    { ingredient: 'sunflower-oil', quantity: 60, unit: 'ml' },
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
      ingredient: 'still-water',
      quantity: 2.5,
      unit: 'l',
    },
    {
      ingredient: 'rice',
      quantity: 70,
      unit: 'g',
      note: t('rinsed', 'spălat'),
    },
    {
      ingredient: 'patience-dock',
      quantity: 600,
      unit: 'g',
      note: t(
        'leaves only, washed, tough stems removed, cut into ribbons',
        'doar frunzele, spălate, fără cozile tari, tăiate fâșii',
      ),
    },
    {
      ingredient: 'spring-onion',
      quantity: 150,
      unit: 'g',
      note: t('chopped', 'tocată'),
    },
    {
      ingredient: 'ciorba-sour-base',
      quantity: 750,
      unit: 'ml',
      note: t(
        'borș: 500 ml first, up to 250 ml more, to taste',
        'borș: întâi 500 ml, apoi până la 250 ml în plus, după gust',
      ),
    },
    {
      ingredient: 'eggs',
      quantity: 3,
      unit: 'pcs',
      note: t('for the liaison', 'pentru dres'),
    },
    {
      ingredient: 'sour-cream',
      quantity: 200,
      unit: 'g',
      note: t('full-fat, for the liaison', 'grasă, pentru dres'),
    },
    {
      ingredient: 'dill',
      quantity: 30,
      unit: 'g',
      note: t('chopped', 'tocat'),
    },
    {
      ingredient: 'lovage',
      quantity: 15,
      unit: 'g',
      optional: true,
      note: t('fresh, chopped', 'proaspăt, tocat'),
    },
    {
      ingredient: 'salt',
      quantity: 15,
      unit: 'g',
      note: t(
        '10 g with the water, the rest at the end to taste',
        '10 g la apă, restul la final, după gust',
      ),
    },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
  ],
  steps: [
    {
      key: 'prep',
      text: t(
        'Fill a large bowl or the sink with cold water, wash the dock leaves in it and lift them out, leaving any grit behind. Strip off the tough stems, stack the leaves and cut them into 1 cm ribbons. Dice the onions and the carrot, and chop the spring onion, the dill and the lovage, if using.',
        'Umple un castron mare sau chiuveta cu apă rece, spală frunzele de ștevie în ea și scoate-le, lăsând nisipul în apă. Dă la o parte cozile tari, așază frunzele una peste alta și taie-le fâșii de 1 cm. Taie ceapa și morcovul cubulețe și toacă ceapa verde, mărarul și leușteanul, dacă folosești.',
      ),
    },
    {
      key: 'soften',
      text: t(
        'Heat the oil in a pot of at least 6 l over medium-low heat. Add the onions and the carrot and cook for 8 minutes, stirring often, until soft and shiny but not browned.',
        'Încinge uleiul într-o oală de cel puțin 6 l la foc mic spre mediu. Adaugă ceapa și morcovul și călește 8 minute, amestecând des, până se înmoaie și devin lucioase, fără să se rumenească.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'water',
      text: t(
        'Pour in the 2.5 l of water, add 10 g of the salt and bring to the boil over high heat, about 10 minutes.',
        'Toarnă cei 2,5 l de apă, adaugă 10 g din sare și adu la fierbere la foc mare, cam 10 minute.',
      ),
    },
    {
      key: 'rice',
      text: t(
        'Add the rice and simmer gently for 15 minutes, until the rice is tender and the carrot is soft.',
        'Adaugă orezul și fierbe domol 15 minute, până când orezul e fiert și morcovul e moale.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'leaves',
      text: t(
        'Once the rice is tender, stir in the spring onion, then the dock a handful at a time, pushing each handful down until it wilts, and simmer for 5 minutes, until the leaves have wilted and turned olive green.',
        'Când orezul e fiert, amestecă ceapa verde, apoi ștevia câte o mână, apăsând-o în zeamă până scade, și fierbe 5 minute, până când frunzele se înmoaie, scad și devin verde-măsliniu.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'bors',
      text: t(
        'While the leaves simmer, bring 500 ml of the borș to the boil in a small pot. Pour the hot borș into the soup and simmer for 3 minutes.',
        'Cât fierbe ștevia, adu la fierbere 500 ml din borș într-o oală mică. Toarnă borșul fierbinte în ciorbă și fierbe 3 minute.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'taste',
      text: t(
        'Taste. If the soup is not sour enough, bring some of the remaining 250 ml of borș to the boil in the small pot and add it a little at a time, then add salt if it needs it. Take the pot off the heat and let the bubbling stop.',
        'Gustă. Dacă ciorba nu e destul de acră, fierbe în oala mică o parte din cei 250 ml de borș rămași și adaug-o puțin câte puțin, apoi pune sare dacă mai trebuie. Ia oala de pe foc și așteaptă să nu mai bolborosească.',
      ),
    },
    {
      key: 'liaison',
      text: t(
        'Whisk the eggs and the sour cream in a bowl for the liaison. Whisking all the time, add 2 ladles of the hot soup, a little at a time, to warm the eggs. Then pour the mixture back into the pot, stirring.',
        'Bate ouăle cu smântâna într-un bol, pentru dres. Amestecând întruna, adaugă 2 polonice de ciorbă fierbinte, puțin câte puțin, ca să se încălzească ouăle. Apoi toarnă amestecul înapoi în oală, amestecând.',
      ),
    },
    {
      key: 'hold',
      text: t(
        'Put the pot back over low heat and stir for 2 minutes, until the soup is hot, steaming and creamy-looking, with no bubbles breaking on the surface. Do not let it boil.',
        'Pune oala la loc pe foc mic și amestecă 2 minute, până când ciorba e fierbinte, aburindă și albită, fără să dea în clocot. Nu o lăsa să fiarbă.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'finish',
      text: t(
        'Take the pot off the heat. Stir in the dill, the lovage, if using, and the pepper. Ladle into hot bowls and serve at once.',
        'Ia oala de pe foc. Amestecă mărarul, leușteanul, dacă folosești, și piperul. Servește imediat, în boluri calde.',
      ),
    },
    {
      key: 'store',
      text: t(
        'Cool the leftovers and divide them into shallow containers so they cool quickly, and put them in the fridge within 2 hours. Because the soup has rice in it, eat it within 1 day and reheat it only once, gently, until steaming.',
        'Răcește ce rămâne, împărțit în recipiente puțin adânci ca să se răcească repede, și pune-l la frigider în cel mult 2 ore. Fiindcă ciorba conține orez, consum-o în cel mult o zi și încălzește-o o singură dată, ușor, până scoate aburi.',
      ),
    },
  ],
  tips: [
    t(
      'Sorrel is high in oxalate, and dock contains it too. If you have been told to limit oxalate, for example after kidney stones, ask your doctor or dietitian how much of this soup suits you.',
      'Măcrișul e bogat în oxalați, iar ștevia îi conține și ea. Dacă ți s-a spus să limitezi oxalații, de exemplu după pietre la rinichi, întreabă medicul sau dieteticianul cât din această ciorbă ți se potrivește.',
    ),
    t(
      'To make it ahead, stop before the liaison and keep the soup in the fridge. Reheat only as much as you will eat, until steaming, take it off the heat and make the liaison then. Never let it boil once the egg and cream are in; it curdles them.',
      'Dacă o pregătești dinainte, oprește-te înainte de dres și ține ciorba la frigider. Încălzește doar cât mănânci, până scoate aburi, ia-o de pe foc și fă dresul atunci. Nu o lăsa să fiarbă după ce ai pus oul și smântâna; se taie.',
    ),
    t(
      'Ștevie is milder than sorrel, so build the sourness in two goes and taste after each; you cannot take it back out.',
      'Ștevia e mai blândă decât măcrișul, așa că acrește ciorba în două rânduri și gustă după fiecare; acreala nu se mai scoate.',
    ),
  ],
  stepTips: [
    {
      step: 'leaves',
      text: t(
        'The leaves turn from bright green to olive as soon as they cook, and the borș deepens it. That is normal, so do not cook them longer to chase the colour.',
        'Frunzele trec de la verde viu la verde-măsliniu de cum se gătesc, iar borșul întunecă și mai mult culoarea. E normal, așa că nu le fierbe mai mult ca să le recapeți culoarea.',
      ),
    },
    {
      step: 'liaison',
      text: t(
        'Full-fat sour cream splits less easily than the low-fat kind. Do not skip the tempering: eggs and cream dropped straight into hot soup scramble and curdle.',
        'Smântâna grasă se taie mai greu decât cea slabă. Nu sări peste încălzirea treptată: ouăle și smântâna puse direct în ciorba fierbinte se taie.',
      ),
    },
  ],
  nutritionNote: t(
    'Leafy greens, onion and carrot bring fibre and make a light pot, with the oil mostly unsaturated. The eggs add protein, but they and the sour cream bring saturated fat, and the rice is the only source of starch. The borș and the leaves make it sharp, and the borș and the salt make it salty, so season at the end.',
    'Frunzele verzi, ceapa și morcovul aduc fibre și fac o ciorbă ușoară, cu ulei în mare parte nesaturat. Ouăle adaugă proteine, dar ele și smântâna aduc grăsimi saturate, iar orezul e singura sursă de amidon. Borșul și frunzele o fac acrișoară, iar borșul și sarea o fac sărată, așa că sărează la final.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Fresh bread', 'Pâine proaspătă'),
      reason: t(
        'A crusty slice soaks up the sour, creamy broth.',
        'O felie cu crustă se îmbibă cu zeama acrișoară și cremoasă.',
      ),
      principle: 'contrast_texture',
      ingredient: 'bread',
    },
    {
      kind: 'food',
      label: t('Fresh hot pepper', 'Ardei iute proaspăt'),
      reason: t(
        'A bite of hot pepper sharpens the mild, creamy sourness.',
        'O îmbucătură de ardei iute ascute acreala blândă și cremoasă.',
      ),
      principle: 'complement_flavour',
      ingredient: 'hot-pepper',
    },
    {
      kind: 'food',
      label: t('Radishes', 'Ridichi'),
      reason: t(
        'Their crisp, peppery bite refreshes the palate between spoonfuls of soft soup.',
        'Crocanteala și iuțeala lor împrospătează gustul între lingurile de supă moale.',
      ),
      principle: 'contrast_texture',
      ingredient: 'radish',
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
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'Hot and sour, it warms you through.',
        'Fierbinte și acrișoară, te încălzește.',
      ),
    },
  ],
  variants: [
    {
      slug: 'ciorba-de-stevie-french',
      cuisine: 'french',
      title: t(
        "Soupe à l'oseille (French sorrel and potato soup)",
        "Soupe à l'oseille (supă franțuzească de măcriș cu cartofi)",
      ),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 40,
      difficulty: 'easy',
      hideBaseTips: [2],
      lines: [
        { ingredient: 'butter', quantity: 40, unit: 'g' },
        {
          ingredient: 'leek',
          quantity: 200,
          unit: 'g',
          note: t(
            'white and pale green part, sliced, washed',
            'partea albă și verde-deschis, tăiată rondele, spălată',
          ),
        },
        {
          ingredient: 'potato',
          quantity: 0.4,
          unit: 'kg',
          note: t(
            'peeled, cut into 1 cm dice',
            'curățați, tăiați cubulețe de 1 cm',
          ),
        },
        {
          ingredient: 'vegetable-stock',
          quantity: 1,
          unit: 'l',
          note: t('made up, hot', 'pregătită, fierbinte'),
        },
        {
          ingredient: 'sorrel',
          quantity: 250,
          unit: 'g',
          note: t(
            'washed, stems removed, cut into ribbons',
            'spălat, fără cozi, tăiat fâșii',
          ),
        },
        {
          ingredient: 'eggs',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'yolks only; keep the whites for another dish',
            'doar gălbenușurile; păstrează albușurile pentru altă mâncare',
          ),
        },
        {
          ingredient: 'sour-cream',
          quantity: 100,
          unit: 'g',
          note: t('crème fraîche', 'crème fraîche'),
        },
        {
          ingredient: 'salt',
          quantity: 2,
          unit: 'g',
          note: t('to taste, if needed', 'după gust, dacă mai trebuie'),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'prep',
          text: t(
            'Wash the sorrel in a bowl of cold water and lift it out. Strip off the stems, stack the leaves and cut them into 1 cm ribbons. Slice the leek and wash it well, then peel and dice the potatoes. Separate the eggs and keep the yolks.',
            'Spală măcrișul într-un bol cu apă rece și scoate-l. Dă la o parte cozile, așază frunzele una peste alta și taie-le fâșii de 1 cm. Taie prazul rondele și spală-l bine, apoi curăță și taie cartofii cubulețe. Separă ouăle și păstrează gălbenușurile.',
          ),
        },
        {
          key: 'stock',
          text: t(
            'Heat the stock in a separate pan until hot, then keep it on the lowest heat.',
            'Încălzește supa de legume într-o altă oală până e fierbinte, apoi ține-o pe cel mai mic foc.',
          ),
        },
        {
          key: 'leek',
          text: t(
            'Melt the butter in a pot of at least 3 l over medium-low heat. Add the leek and cook for 8 minutes, stirring often, until soft but not browned.',
            'Topește untul într-o oală de cel puțin 3 l la foc mic spre mediu. Adaugă prazul și călește 8 minute, amestecând des, până se înmoaie, fără să se rumenească.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'sorrel',
          text: t(
            'Add the sorrel to the leek and stir for about 2 minutes, until it melts into a dull olive purée.',
            'Adaugă măcrișul peste praz și amestecă cam 2 minute, până se topește într-un piure verde-măsliniu.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'potato',
          text: t(
            'Add the potatoes and the hot stock, bring to the boil and simmer gently for 15 minutes, until a knife slides into the potato without resistance. If not, simmer a few minutes more and check again.',
            'Adaugă cartofii și supa fierbinte, adu la fierbere și fierbe domol 15 minute, până când un cuțit intră în cartof fără rezistență. Dacă nu, mai fierbe câteva minute și verifică din nou.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'blend',
          text: t(
            'Take the pot off the heat. Blend with a stick blender until smooth, or leave it rustic and just crush a few potato pieces against the side of the pot. Let the bubbling stop.',
            'Ia oala de pe foc. Mixează cu mixerul vertical până se omogenizează sau lasă-o rustică și strivește doar câteva bucăți de cartof de peretele oalei. Așteaptă să nu mai bolborosească.',
          ),
        },
        {
          key: 'liaison',
          text: t(
            'Whisk the yolks and the crème fraîche in a bowl. Whisking all the time, add 2 ladles of the hot soup, a little at a time, to warm the yolks. Then pour the mixture back into the pot, stirring.',
            'Bate gălbenușurile cu crème fraîche într-un bol. Amestecând întruna, adaugă 2 polonice de supă fierbinte, puțin câte puțin, ca să se încălzească gălbenușurile. Apoi toarnă amestecul înapoi în oală, amestecând.',
          ),
        },
        {
          key: 'hold',
          text: t(
            'Put the pot back over low heat and stir for 2 minutes, until the soup is hot, slightly thicker and steaming, with no bubbles breaking on the surface. Do not let it boil. Season with pepper and, if needed, salt.',
            'Pune oala la loc pe foc mic și amestecă 2 minute, până când supa e fierbinte, puțin mai groasă și scoate aburi, fără să dea în clocot. Nu o lăsa să fiarbă. Condimentează cu piper și, dacă mai trebuie, cu sare.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'serve',
          text: t(
            'Ladle into hot bowls and serve at once. Cool leftovers and put them in the fridge within 2 hours; keep for up to 3 to 4 days.',
            'Servește imediat, în boluri calde. Răcește ce rămâne și pune-l la frigider în cel mult 2 ore; se păstrează 3-4 zile.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'sorrel',
          text: t(
            'Do not worry about the colour: sorrel always turns from green to khaki in the heat. The sharpness is what you are after, and it softens once the cream goes in.',
            'Nu te speria de culoare: măcrișul trece mereu de la verde la kaki la căldură. Acreala e ceea ce cauți, iar ea se domolește când intră smântâna.',
          ),
        },
        {
          step: 'blend',
          text: t(
            'Fill a jug blender no more than half full of hot soup and hold the lid down with a cloth, or use a stick blender: hot soup expands and can spray.',
            'Umple vasul unui blender cel mult pe jumătate cu supă fierbinte și ține capacul apăsat cu o cârpă sau folosește un mixer vertical: supa fierbinte se dilată și poate stropi.',
          ),
        },
      ],
      nutritionNote: t(
        'Leek, potato and sorrel make a light, filling bowl with some fibre. The butter, the cream and the yolks bring saturated fat, so keep the cream modest, and the stock can be salty, so season at the end. It is low in protein, so it suits a starter or a light lunch.',
        'Prazul, cartofii și măcrișul fac un castron ușor și săturător, cu fibre. Untul, smântâna și gălbenușurile aduc grăsimi saturate, așa că folosește smântână puțină, iar supa de legume poate fi sărată, deci sărează la final. Are puține proteine, deci se potrivește ca fel întâi sau la un prânz ușor.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Baguette', 'Baghetă'),
          reason: t(
            'A crisp slice, plain or toasted, gives the velvety soup something to bite against.',
            'O felie crocantă, simplă sau prăjită, oferă supei catifelate un contrast la mestecat.',
          ),
          principle: 'contrast_texture',
          ingredient: 'baguette',
        },
        {
          kind: 'food',
          label: t('Croutons', 'Crutoane'),
          reason: t(
            'A scatter of crisp, buttery croutons adds crunch on top of the smooth purée.',
            'Câteva crutoane crocante cu unt adaugă crocanteală peste piureul fin.',
          ),
          principle: 'contrast_texture',
          ingredient: 'croutons',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its acidity matches the sorrel and cuts the cream.',
            'Aciditatea lui se potrivește cu măcrișul și taie din smântână.',
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
            'Light and quick; a slice of baguette makes it a lunch.',
            'Ușoară și rapidă; o felie de baghetă o face prânz.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, silky bowl warms you through.',
            'Un castron fierbinte și mătăsos te încălzește.',
          ),
        },
      ],
    },
    {
      slug: 'ciorba-de-stevie-polish',
      cuisine: 'polish',
      title: t(
        'Zupa szczawiowa (Polish sorrel soup with hard-boiled egg)',
        'Zupa szczawiowa (supă poloneză de măcriș cu ou fiert)',
      ),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 45,
      difficulty: 'easy',
      hideBaseTips: [1, 2],
      lines: [
        {
          ingredient: 'chicken-stock',
          quantity: 1.2,
          unit: 'l',
          note: t('made up, hot', 'pregătită, fierbinte'),
        },
        {
          ingredient: 'carrot',
          quantity: 100,
          unit: 'g',
          note: t('diced small', 'tăiat cubulețe'),
        },
        {
          ingredient: 'parsley-root',
          quantity: 80,
          unit: 'g',
          note: t('diced small', 'tăiată cubulețe'),
        },
        {
          ingredient: 'potato',
          quantity: 0.4,
          unit: 'kg',
          note: t(
            'peeled, cut into 1.5 cm dice',
            'curățați, tăiați cubulețe de 1,5 cm',
          ),
        },
        {
          ingredient: 'sorrel',
          quantity: 250,
          unit: 'g',
          note: t(
            'washed, stems removed, cut into ribbons',
            'spălat, fără cozi, tăiat fâșii',
          ),
        },
        {
          ingredient: 'sour-cream',
          quantity: 150,
          unit: 'g',
          note: t('full-fat', 'grasă'),
        },
        { ingredient: 'flour', quantity: 10, unit: 'g' },
        {
          ingredient: 'eggs',
          quantity: 4,
          unit: 'pcs',
          note: t('hard-boiled, to serve', 'fierte tari, pentru servit'),
        },
        {
          ingredient: 'dill',
          quantity: 15,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'salt',
          quantity: 3,
          unit: 'g',
          note: t('to taste, if needed', 'după gust, dacă mai trebuie'),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'prep',
          text: t(
            'Wash the sorrel in a bowl of cold water and lift it out. Strip off the stems, stack the leaves and cut them into 1 cm ribbons. Dice the carrot, the parsley root and the potatoes, and chop the dill.',
            'Spală măcrișul într-un bol cu apă rece și scoate-l. Dă la o parte cozile, așază frunzele una peste alta și taie-le fâșii de 1 cm. Taie morcovul, rădăcina de pătrunjel și cartofii cubulețe și toacă mărarul.',
          ),
        },
        {
          key: 'roots',
          text: t(
            'Bring the stock to the boil in a pot of at least 3 l. Add the carrot and the parsley root and simmer for 10 minutes.',
            'Adu supa la fierbere într-o oală de cel puțin 3 l. Adaugă morcovul și rădăcina de pătrunjel și fierbe 10 minute.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'potato',
          text: t(
            'Add the potatoes and simmer gently for 15 minutes, until a knife slides into the potato without resistance.',
            'Adaugă cartofii și fierbe domol 15 minute, până când un cuțit intră în cartof fără rezistență.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'eggs',
          text: t(
            'While the potatoes simmer, bring a small pan of water to the boil. Lower the eggs in gently with a spoon and boil for 10 minutes so the yolks are fully set. Then cool them in cold water, peel them and halve them lengthwise.',
            'Cât fierb cartofii, pune la fiert o cratiță mică cu apă. Pune ușor ouăle, cu o lingură, în apa care clocotește și fierbe-le 10 minute, ca gălbenușul să se întărească complet. Apoi răcește-le în apă rece, curăță-le și taie-le în jumătăți pe lungime.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'sorrel',
          text: t(
            'Stir the sorrel into the soup and simmer for 5 minutes, until the leaves have wilted and turned olive green.',
            'Amestecă măcrișul în supă și fierbe 5 minute, până când frunzele se înmoaie, scad și devin verde-măsliniu.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'liaison',
          text: t(
            'Whisk the sour cream and the flour in a bowl until smooth. Take the pot off the heat and let the bubbling stop. Whisking all the time, add 2 ladles of the hot soup, a little at a time. Then pour the mixture back into the pot, stirring.',
            'Bate smântâna cu făina într-un bol până se omogenizează. Ia oala de pe foc și așteaptă să nu mai bolborosească. Amestecând întruna, adaugă 2 polonice de supă fierbinte, puțin câte puțin. Apoi toarnă amestecul înapoi în oală, amestecând.',
          ),
        },
        {
          key: 'thicken',
          text: t(
            'Put the pot back over low heat and stir for 3 minutes, until the soup is hot and slightly thicker, with only a few small bubbles at the edge. Season with the dill, pepper and, if needed, salt.',
            'Pune oala la loc pe foc mic și amestecă 3 minute, până când supa e fierbinte și puțin mai groasă, cu doar câteva bule mici la margine. Condimentează cu mărar, piper și, dacă mai trebuie, cu sare.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'serve',
          text: t(
            'Ladle into hot bowls and put 2 egg halves in each. Divide leftover soup into shallow containers so it cools quickly and put it in the fridge within 2 hours, apart from the eggs; keep for up to 3 to 4 days. Reheat it until steaming, stirring, without a hard boil, and add fresh egg halves when you serve it.',
            'Servește în boluri calde, cu câte 2 jumătăți de ou în fiecare. Împarte supa rămasă în recipiente puțin adânci, ca să se răcească repede, și pune-o la frigider în cel mult 2 ore, separat de ouă; se păstrează 3-4 zile. Încălzește-o până scoate aburi, amestecând, fără clocot puternic, și adaugă jumătăți de ou proaspete la servire.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'liaison',
          text: t(
            'The flour steadies the cream, so this soup tolerates a gentle simmer better than a soup thickened with egg does. Still, keep the heat low and stir, because a hard boil can make it grainy.',
            'Făina stabilizează smântâna, așa că supa suportă un fiert domol mai bine decât una dreasă cu ou. Ține totuși focul mic și amestecă, pentru că un clocot puternic o poate face granulată.',
          ),
        },
      ],
      nutritionNote: t(
        'Potato, carrot and sorrel make a light, filling bowl with some fibre, and the eggs add protein. The sour cream and the egg yolks bring saturated fat, and the stock can be salty, so season at the end.',
        'Cartofii, morcovul și măcrișul fac un castron ușor și săturător, cu fibre, iar ouăle adaugă proteine. Smântâna și gălbenușurile aduc grăsimi saturate, iar supa de pui poate fi sărată, așa că sărează la final.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Rye bread', 'Pâine de secară'),
          reason: t(
            'Its dense, slightly sour crumb stands up to the tangy, creamy soup.',
            'Miezul ei des și ușor acrișor ține piept supei acrișoare și cremoase.',
          ),
          principle: 'complement_flavour',
          ingredient: 'rye-bread',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Potatoes and eggs make it filling without being heavy.',
            'Cartofii și ouăle o fac săturătoare fără să fie grea.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'The sorrel gives a fresh sharpness that suits a warm day; the soup can be served hot or just warm.',
            'Măcrișul dă o acreală proaspătă care se potrivește într-o zi caldă; supa se poate servi fierbinte sau doar caldă.',
          ),
        },
      ],
    },
  ],
};
