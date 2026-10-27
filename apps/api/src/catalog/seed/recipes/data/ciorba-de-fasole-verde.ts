import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Ciorbă de fasole verde base is the Romanian vegetarian green bean soup:
// softened vegetables, potatoes and green beans cooked until tender, soured with
// borș once everything is soft, and finished with sour cream tempered with hot
// soup and plenty of dill. Each Variant is a full Recipe with its own lines,
// steps and guidance. The base's Recipe-level Tips are about borș (0), the
// sour-cream finish (1), leftovers (2) and frozen beans (3). The German Variant
// has no borș and no cream, so it hides 0, 1 and 2 (and has its own leftovers
// Tip); the Hungarian one has its own liaison and hides 0 and 1. Both keep the
// frozen-bean Tip, and the Hungarian one keeps the leftovers Tip.
export const ciorbaDeFasoleVerde: BaseRecipeSeed = {
  slug: 'ciorba-de-fasole-verde',
  title: t(
    'Romanian green bean sour soup with sour cream and dill (ciorbă de fasole verde)',
    'Ciorbă de fasole verde cu smântână și mărar',
  ),
  servings: 6,
  prepMinutes: 20,
  cookMinutes: 45,
  difficulty: 'easy',
  lines: [
    { ingredient: 'sunflower-oil', quantity: 50, unit: 'ml' },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('diced', 'tăiate cubulețe'),
    },
    {
      ingredient: 'carrot',
      quantity: 150,
      unit: 'g',
      note: t('diced small', 'tăiați cubulețe'),
    },
    {
      ingredient: 'parsley-root',
      quantity: 60,
      unit: 'g',
      note: t('diced small', 'tăiată cubulețe'),
    },
    {
      ingredient: 'bell-pepper',
      quantity: 1,
      unit: 'pcs',
      note: t('red, diced', 'roșu, tăiat cubulețe'),
    },
    { ingredient: 'still-water', quantity: 2.5, unit: 'l' },
    {
      ingredient: 'potato',
      quantity: 0.6,
      unit: 'kg',
      note: t('peeled, in 1.5 cm cubes', 'curățați, tăiați cubulețe de 1,5 cm'),
    },
    {
      ingredient: 'green-beans',
      quantity: 600,
      unit: 'g',
      note: t(
        'tops trimmed, cut in 2 to 3 cm lengths',
        'capetele tăiate, tăiată bucăți de 2-3 cm',
      ),
    },
    {
      ingredient: 'tomato',
      quantity: 250,
      unit: 'g',
      note: t('ripe, diced', 'coapte, tăiate cubulețe'),
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
      ingredient: 'sour-cream',
      quantity: 200,
      unit: 'g',
      note: t('full-fat, at room temperature', 'grasă, la temperatura camerei'),
    },
    {
      ingredient: 'dill',
      quantity: 40,
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
      ingredient: 'lovage',
      quantity: 15,
      unit: 'g',
      optional: true,
      note: t('chopped', 'tocat'),
    },
    { ingredient: 'salt' },
    { ingredient: 'black-pepper' },
    {
      ingredient: 'hot-pepper',
      quantity: 1,
      unit: 'pcs',
      optional: true,
      note: t('fresh, to serve', 'proaspăt, la servit'),
    },
  ],
  steps: [
    {
      key: 'prep',
      text: t(
        'Dice the onions, carrot, parsley root and pepper. Peel the potatoes and cut them into 1.5 cm cubes. Snap or cut the tops off the green beans and cut them into 2 to 3 cm lengths. Dice the tomatoes.',
        'Taie ceapa, morcovul, rădăcina de pătrunjel și ardeiul cubulețe. Curăță cartofii și taie-i cubulețe de 1,5 cm. Taie capetele fasolei verzi și taie-o bucăți de 2-3 cm. Taie roșiile cubulețe.',
      ),
    },
    {
      key: 'soften',
      text: t(
        'Heat the oil in a 6 l pot over medium-low heat. Cook the onions, carrot, parsley root and pepper for about 10 minutes, stirring, until soft and glossy but not browned. Meanwhile, bring 2.5 l of water to the boil in a kettle or another pot.',
        'Încălzește uleiul într-o oală de 6 l la foc mic-mediu. Călește ceapa, morcovul, rădăcina de pătrunjel și ardeiul aproximativ 10 minute, amestecând, până se înmoaie și devin lucioase, fără să se rumenească. Între timp, fierbe 2,5 l de apă în fierbător sau într-o altă oală.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'simmer',
      text: t(
        'Pour the boiling water over the softened vegetables, then add the potatoes and green beans. Bring back to a gentle boil and simmer for 15 minutes.',
        'Toarnă apa fiartă peste legumele călite, apoi adaugă cartofii și fasolea verde. Adu din nou la fierbere ușoară și lasă să fiarbă 15 minute.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'bors',
      text: t(
        'While the soup simmers, bring the borș to the boil in a small pan, skim off the foam and boil for 2 minutes. Keep it hot.',
        'Cât fierbe ciorba, adu borșul la fiert într-o cratiță mică, ia spuma și lasă-l la fiert 2 minute. Ține-l fierbinte.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'tomatoes',
      text: t(
        'Stir the diced tomatoes into the soup and simmer for 5 more minutes. Check the beans: they should be tender all the way through, with no squeak when you bite one, and the potato cubes should be soft when pierced with a knife. If not, simmer a few minutes longer.',
        'Pune roșiile tăiate în ciorbă și mai fierbe 5 minute. Verifică fasolea: trebuie să fie fragedă pe de-a-ntregul, fără să mai scârțâie în dinți, iar cartofii să fie moi la înțepat cu cuțitul. Dacă nu, mai lasă câteva minute.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'sour',
      text: t(
        'Now that the beans and potatoes are tender, pour in 500 ml of the hot borș and simmer for 5 minutes. Taste: add more borș, up to 250 ml, until the soup is pleasantly sour.',
        'Acum că fasolea și cartofii sunt fragezi, toarnă 500 ml din borșul fierbinte și fierbe 5 minute. Gustă: adaugă borș în plus, până la 250 ml, până când ciorba are aciditatea potrivită.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'temper',
      text: t(
        'Take the pot off the heat and wait a minute until the bubbling stops. Put the sour cream in a bowl and stir in 3 or 4 ladles of hot soup, one at a time, until smooth. Pour it back into the pot, stirring.',
        'Ia oala de pe foc și așteaptă un minut, până se oprește fierberea. Pune smântâna într-un bol și amestecă în ea 3-4 polonice de ciorbă fierbinte, pe rând, până se omogenizează. Toarnă amestecul înapoi în oală, amestecând.',
      ),
    },
    {
      key: 'finish',
      text: t(
        'Stir in the dill, parsley and lovage, if using. Season with pepper and add salt last, only if the soup needs it. Do not boil the soup again.',
        'Adaugă mărarul, pătrunjelul și leușteanul, dacă folosești. Pune piper și sare la final, doar dacă ciorba mai are nevoie. Nu mai da ciorba în clocot.',
      ),
    },
    {
      key: 'serve',
      text: t(
        'Ladle into bowls and serve with bread and a fresh hot pepper on the side, if you like.',
        'Pune ciorba în boluri și servește cu pâine și, dacă vrei, cu un ardei iute proaspăt alături.',
      ),
    },
  ],
  tips: [
    t(
      'Add the borș only once the beans and potatoes are tender: acid keeps them firm, and they would stay hard in a sour pot. Borș differs a lot between brands and homemade batches, so add it in two goes and taste in between.',
      'Pune borșul abia după ce fasolea și cartofii sunt fragezi: acidul îi ține tari, iar într-o oală acră ar rămâne vârtoși. Borșul diferă mult de la un producător la altul și de la o șarjă făcută în casă la alta, așa că pune-l în două rânduri și gustă între ele.',
    ),
    t(
      'Sour cream can split in hot, sour soup. Use full-fat cream at room temperature, take the pot off the boil, and warm the cream with a few ladles of soup before it goes in.',
      'Smântâna se poate tăia în ciorba fierbinte și acră. Folosește smântână grasă, la temperatura camerei, ia oala de pe foc și încălzește smântâna cu câteva polonice de ciorbă înainte s-o torni în oală.',
    ),
    t(
      'Leftovers: cool the soup within 2 hours, in shallow containers if you can, and keep it in the fridge for up to 3 days. Reheat only what you will eat, stirring, until it is steaming hot all the way through. A hard boil can make the cream grainy, but the soup is still fine to eat.',
      'Resturi: răcește ciorba în cel mult 2 ore, de preferat în recipiente joase, și ține-o la frigider până la 3 zile. Încălzește doar cât mănânci, amestecând, până iese abur din toată ciorba; dacă dă în clocot, smântâna se poate tăia puțin, dar ciorba e bună de mâncat.',
    ),
    t(
      'Frozen cut green beans work out of season: add them without thawing, about 5 minutes later than you would fresh beans, since they are already blanched and cook faster than fresh. Still cook them until tender.',
      'Fasolea verde congelată merge și în afara sezonului: pune-o fără s-o dezgheți, cam cu 5 minute mai târziu decât ai pune fasolea proaspătă, fiindcă e deja opărită și se gătește mai repede decât cea proaspătă. Gătește-o tot până e fragedă.',
    ),
  ],
  stepTips: [
    {
      step: 'prep',
      text: t(
        'Young beans only need the stalk end trimmed. Older, thicker ones have a tough string along the seam: snap the end and pull it down the length to remove it.',
        'La fasolea tânără e destul să tai codița. La cea mai bătrână și mai groasă, rupe capătul și trage ața de pe lungimea păstăii, ca să nu rămână ațe tari în supă.',
      ),
    },
    {
      step: 'bors',
      text: t(
        'Boiling the borș separately lets you skim off its foam, so the soup stays clear, and adding it hot keeps the pot simmering.',
        'Dacă fierbi borșul separat poți lua spuma, ca ciorba să rămână limpede, iar dacă îl torni fierbinte oala nu se oprește din fiert.',
      ),
    },
    {
      step: 'finish',
      text: t(
        'Lovage loses its aroma if boiled, so add it off the heat.',
        'Leușteanul își pierde aroma dacă fierbe, așa că pune-l după ce ai luat oala de pe foc.',
      ),
    },
  ],
  nutritionNote: t(
    'Green beans and vegetables bring fibre, and the potatoes make it a filling, carbohydrate-rich bowl without any meat. The sour cream adds saturated fat; use less sour cream in the finish if you want it lighter. Borș and added salt can make the soup salty, so taste before salting. The sunflower oil is mostly unsaturated.',
    'Fasolea verde și legumele aduc fibre, iar cartofii fac din ciorbă un castron sățios, bogat în carbohidrați, chiar și fără carne. Smântâna adaugă grăsimi saturate; pune mai puțină în dreasă dacă o vrei mai ușoară. Borșul și sarea adăugată pot face ciorba sărată, deci gustă înainte să sărezi. Uleiul de floarea-soarelui e în mare parte nesaturat.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Fresh bread', 'Pâine proaspătă'),
      reason: t(
        'Soft bread soaks up the sour, creamy broth.',
        'Pâinea moale adună zeama acrișoară și cremoasă.',
      ),
      principle: 'complement_flavour',
      ingredient: 'bread',
    },
    {
      kind: 'food',
      label: t('Telemea', 'Telemea'),
      reason: t(
        'Salty, tangy bites alongside the mild soup.',
        'Îmbucături sărate și pline de savoare, alături de supa blândă.',
      ),
      ingredient: 'telemea',
    },
  ],
  eatingMoments: [
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'Meatless and vegetable-rich, it fills you without sitting heavy.',
        'Fără carne și bogată în legume, te satură fără să cadă greu.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'good_for',
      reason: t(
        'The sour taste and fresh dill keep it light, even served warm.',
        'Gustul acrișor și mărarul proaspăt o fac ușoară, chiar servită caldă.',
      ),
    },
  ],
  variants: [
    {
      slug: 'ciorba-de-fasole-verde-german',
      cuisine: 'german',
      title: t(
        'Grüne Bohnensuppe (German green bean soup with bacon and savory)',
        'Grüne Bohnensuppe (supă germană de fasole verde cu bacon și cimbru)',
      ),
      servings: 6,
      prepMinutes: 20,
      cookMinutes: 45,
      difficulty: 'easy',
      hideBaseTips: [0, 1, 2],
      lines: [
        {
          ingredient: 'bacon',
          quantity: 120,
          unit: 'g',
          note: t(
            'smoked streaky, Speck or similar, diced',
            'afumat, Speck sau costiță, tăiat cubulețe',
          ),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('diced', 'tăiată cubulețe'),
        },
        {
          ingredient: 'leek',
          quantity: 150,
          unit: 'g',
          note: t(
            'white and pale green, sliced and rinsed',
            'partea albă și verde-deschis, tăiat rondele și spălat',
          ),
        },
        {
          ingredient: 'carrot',
          quantity: 150,
          unit: 'g',
          note: t('diced', 'tăiați cubulețe'),
        },
        {
          ingredient: 'celeriac',
          quantity: 150,
          unit: 'g',
          note: t('diced', 'tăiată cubulețe'),
        },
        {
          ingredient: 'vegetable-stock',
          quantity: 1500,
          unit: 'ml',
          note: t(
            'hot, made up as the pack says',
            'fierbinte, preparată după instrucțiunile de pe ambalaj',
          ),
        },
        {
          ingredient: 'potato',
          quantity: 500,
          unit: 'g',
          note: t(
            'peeled, in 1.5 cm cubes',
            'curățați, tăiați cubulețe de 1,5 cm',
          ),
        },
        {
          ingredient: 'savory',
          quantity: 2,
          unit: 'g',
          note: t(
            'dried (Bohnenkraut)',
            'uscat (cimbru de grădină, Bohnenkraut)',
          ),
        },
        {
          ingredient: 'green-beans',
          quantity: 600,
          unit: 'g',
          note: t(
            'tops trimmed, cut in 2 to 3 cm lengths',
            'capetele tăiate, tăiată bucăți de 2-3 cm',
          ),
        },
        { ingredient: 'salt' },
        { ingredient: 'black-pepper' },
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
            'Dice the onion, carrot and celeriac. Slice the leek and rinse it well. Peel the potatoes and cut them into 1.5 cm cubes. Trim the green beans and cut them into 2 to 3 cm lengths. Dice the raw bacon last. Then wash your hands, the board and the knife with hot soapy water, and chop the parsley on the clean board.',
            'Taie ceapa, morcovul și țelina cubulețe. Taie prazul rondele și spală-l bine. Curăță cartofii și taie-i cubulețe de 1,5 cm. Curăță fasolea verde de capete și taie-o bucăți de 2-3 cm. Taie baconul crud cubulețe la urmă. Apoi spală-ți mâinile, tocătorul și cuțitul cu apă caldă și detergent și toacă pătrunjelul pe tocătorul curat.',
          ),
        },
        {
          key: 'render',
          text: t(
            'Put the bacon in a cold 4 l pot and set it over medium heat. Cook for about 5 minutes, stirring, until the fat runs out and the bacon is lightly golden at the edges. Wash your hands after handling the raw bacon.',
            'Pune baconul într-o oală de 4 l rece și așeaz-o la foc mediu. Gătește-l cam 5 minute, amestecând, până se topește grăsimea și baconul se rumenește ușor la margini. Spală-ți mâinile după ce ai atins baconul crud.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'soften',
          text: t(
            'Add the onion, leek, carrot and celeriac to the bacon fat. Cook for about 8 minutes, stirring, until soft and glossy but not browned.',
            'Adaugă ceapa, prazul, morcovul și țelina în grăsimea de la bacon. Călește-le aproximativ 8 minute, amestecând, până se înmoaie și devin lucioase, fără să se rumenească.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'stock',
          text: t(
            'Pour in the hot stock, add the potatoes and the savory, and bring to the boil. Simmer gently for 10 minutes.',
            'Toarnă supa fierbinte, adaugă cartofii și cimbrul și adu la fierbere. Lasă să fiarbă încet 10 minute.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'beans',
          text: t(
            'Add the green beans and simmer for 15 minutes. Check that the beans are tender all the way through, with no squeak when you bite one, and the potato cubes soft when pierced with a knife. If not, simmer a few minutes longer.',
            'Adaugă fasolea verde și fierbe 15 minute. Verifică să fie fragedă pe de-a-ntregul, fără să mai scârțâie în dinți, iar cartofii să fie moi la înțepat cu cuțitul. Dacă nu, mai lasă câteva minute.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'crush',
          text: t(
            'Press about a quarter of the potato cubes against the side of the pot with the back of a spoon, and stir so they thicken the soup.',
            'Strivește cam un sfert din cartofi de peretele oalei cu dosul lingurii și amestecă, ca să lege supa.',
          ),
        },
        {
          key: 'season',
          text: t(
            'Season with pepper and add salt last, only if the soup needs it. Stir in the chopped parsley and serve hot.',
            'Pune piper și sare la final, doar dacă supa mai are nevoie. Adaugă pătrunjelul tocat și servește fierbinte.',
          ),
        },
      ],
      tips: [
        t(
          'Leftovers: cool the soup within 2 hours, in shallow containers if you can, and keep it in the fridge for up to 3 days. Reheat only what you will eat, stirring, until it is steaming hot all the way through.',
          'Resturi: răcește supa în cel mult 2 ore, de preferat în recipiente joase, și ține-o la frigider până la 3 zile. Încălzește doar cât mănânci, amestecând, până iese abur din toată supa.',
        ),
        t(
          'Bacon and stock are both salty, so taste before you add any salt, and use the bacon fat instead of extra oil.',
          'Atât baconul, cât și supa sunt sărate, deci gustă înainte să pui sare și folosește grăsimea de la bacon în loc de ulei în plus.',
        ),
      ],
      stepTips: [
        {
          step: 'stock',
          text: t(
            'Rub the dried savory between your fingers as it goes in: it is the herb that makes this soup what it is, and it needs the whole simmer to give up its flavour.',
            'Mărunțește cimbrul uscat între degete când îl pui în oală: el dă supei gustul ei, și are nevoie de toată fierberea ca să-și lase aroma.',
          ),
        },
      ],
      nutritionNote: t(
        'Green beans, leek and root vegetables bring fibre, and the potatoes make it filling. The bacon and the stock add salt, and the bacon some saturated fat, so skim off any extra fat and taste before salting. No oil is added beyond the bacon fat.',
        'Fasolea verde, prazul și rădăcinoasele aduc fibre, iar cartofii o fac sățioasă. Baconul și supa de legume adaugă sare, iar baconul și ceva grăsimi saturate, așa că ia grăsimea de la suprafață dacă e prea multă și gustă înainte să sărezi. Nu se adaugă ulei în afară de grăsimea de la bacon.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Rye bread', 'Pâine de secară'),
          reason: t(
            'Its dense, slightly sour crumb is good for mopping up the smoky broth.',
            'Miezul ei dens și ușor acrișor se potrivește bine la înmuiat în supa afumată.',
          ),
          principle: 'complement_flavour',
          ingredient: 'rye-bread',
        },
        {
          kind: 'drink',
          label: t('Beer', 'Bere'),
          reason: t(
            'Its light bitterness and bubbles refresh the palate after smoky bacon.',
            'Amăreala ușoară și bulele răcoresc gustul după baconul afumat.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'beer',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, savory, smoky soup warms you through.',
            'O supă fierbinte, cu cimbru și gust afumat, te încălzește.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'The bacon and salt sit heavy when eaten right before bed.',
            'Baconul și sarea cad greu dacă le mănânci chiar înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'ciorba-de-fasole-verde-hungarian',
      cuisine: 'hungarian',
      title: t(
        'Palócleves (Hungarian lamb and green bean soup with sour cream)',
        'Palócleves (supă ungurească de miel cu fasole verde și smântână)',
      ),
      servings: 6,
      prepMinutes: 25,
      cookMinutes: 100,
      difficulty: 'medium',
      hideBaseTips: [0, 1],
      lines: [
        {
          ingredient: 'lard',
          quantity: 40,
          unit: 'g',
        },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('diced', 'tăiate cubulețe'),
        },
        {
          ingredient: 'lamb',
          quantity: 700,
          unit: 'g',
          note: t(
            'boneless shoulder, in 2 to 3 cm cubes',
            'spată dezosată, tăiată cuburi de 2-3 cm',
          ),
        },
        {
          ingredient: 'paprika',
          quantity: 10,
          unit: 'g',
          note: t('sweet', 'dulce'),
        },
        { ingredient: 'still-water', quantity: 2, unit: 'l' },
        {
          ingredient: 'caraway-seeds',
          quantity: 2,
          unit: 'g',
        },
        { ingredient: 'bay-leaves', quantity: 0.4, unit: 'g' },
        {
          ingredient: 'garlic',
          quantity: 15,
          unit: 'g',
          note: t('3 cloves, crushed', '3 căței, striviți'),
        },
        {
          ingredient: 'potato',
          quantity: 600,
          unit: 'g',
          note: t('peeled, in 2 cm cubes', 'curățați, tăiați cubulețe de 2 cm'),
        },
        {
          ingredient: 'green-beans',
          quantity: 500,
          unit: 'g',
          note: t(
            'tops trimmed, cut in 2 to 3 cm lengths',
            'capetele tăiate, tăiată bucăți de 2-3 cm',
          ),
        },
        {
          ingredient: 'sour-cream',
          quantity: 250,
          unit: 'g',
          note: t(
            'full-fat, at room temperature',
            'grasă, la temperatura camerei',
          ),
        },
        {
          ingredient: 'flour',
          quantity: 30,
          unit: 'g',
        },
        {
          ingredient: 'dill',
          quantity: 30,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'vinegar',
          quantity: 15,
          unit: 'ml',
          optional: true,
          note: t('to taste', 'după gust'),
        },
        { ingredient: 'salt' },
        { ingredient: 'black-pepper' },
      ],
      steps: [
        {
          key: 'prep',
          text: t(
            'Dice the onions and crush the garlic. Peel the potatoes and cut them into 2 cm cubes. Trim the green beans and cut them into 2 to 3 cm lengths. Pat the lamb dry with kitchen paper (do not rinse it) and cut it into 2 to 3 cm cubes. Wash your hands, the board and the knife with hot soapy water after handling the raw lamb.',
            'Taie ceapa cubulețe și strivește usturoiul. Curăță cartofii și taie-i cubulețe de 2 cm. Curăță fasolea verde de capete și taie-o bucăți de 2-3 cm. Șterge mielul cu un prosop de hârtie (nu-l spăla) și taie-l cuburi de 2-3 cm. Spală-ți mâinile, tocătorul și cuțitul cu apă caldă și detergent după ce ai atins carnea crudă.',
          ),
        },
        {
          key: 'onion',
          text: t(
            'Melt the lard in a 5 l pot over medium heat. Cook the onions for about 8 minutes, stirring, until soft and golden but not dark.',
            'Topește untura într-o oală de 5 l la foc mediu. Călește ceapa cam 8 minute, amestecând, până se înmoaie și se îngălbenește, fără să se închidă la culoare.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'brown',
          text: t(
            'Add the lamb and cook over medium-high heat for about 8 minutes, stirring now and then, until it is no longer red on the outside and has lightly browned in places. Wash your hands again after stirring the raw lamb.',
            'Adaugă mielul și gătește-l la foc potrivit-mare cam 8 minute, amestecând din când în când, până nu mai e roșu pe dinafară și se rumenește ușor pe alocuri. Spală-ți din nou mâinile după ce ai amestecat carnea crudă.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'paprika',
          text: t(
            'Take the pot off the heat, stir in the paprika for 10 seconds, then at once pour in the 2 l of water, so it does not scorch and turn bitter. Add the caraway, bay leaves and garlic. Bring to the boil and skim off the foam.',
            'Ia oala de pe foc, amestecă boiaua 10 secunde, apoi toarnă imediat cei 2 l de apă, ca să nu se ardă și să nu se amărască. Adaugă chimenul, foile de dafin și usturoiul. Adu la fierbere și ia spuma.',
          ),
        },
        {
          key: 'simmer-lamb',
          text: t(
            'Lower the heat and simmer gently, partly covered, for 45 minutes. The lamb should be nearly tender by now: a piece should give easily when pressed with a spoon.',
            'Dă focul mai mic și fierbe încet, cu capacul pe jumătate, 45 de minute. Mielul trebuie să fie aproape fraged: o bucată să cedeze ușor când o apeși cu lingura.',
          ),
          timerSeconds: 2700,
        },
        {
          key: 'veg',
          text: t(
            'Add the potatoes and green beans and simmer for 20 minutes, until the beans and potatoes are tender, the beans with no squeak when you bite one. The lamb must be completely tender, falling apart under a fork: if it is not, keep simmering.',
            'Adaugă cartofii și fasolea verde și fierbe 20 de minute, până când fasolea și cartofii sunt fragezi, fasolea fără să mai scârțâie în dinți. Mielul trebuie să fie complet fraged, să se desfacă cu furculița: dacă nu e, mai fierbe.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'liaison',
          text: t(
            'Whisk the sour cream and flour in a bowl until smooth. Take the pot off the heat, and whisk in 4 ladles of the hot soup, one at a time. Pour the mixture back into the pot, stirring.',
            'Bate smântâna cu făina într-un bol până se omogenizează. Ia oala de pe foc și amestecă în bol 4 polonice de supă fierbinte, pe rând. Toarnă amestecul înapoi în oală, amestecând.',
          ),
        },
        {
          key: 'thicken',
          text: t(
            'Return the pot to low heat and simmer gently for 4 minutes, stirring, until the soup is slightly thickened. Do not let it boil hard.',
            'Pune oala la loc pe foc mic și fierbe încet 4 minute, amestecând, până când supa se leagă ușor. Nu o lăsa să fiarbă tare.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'finish',
          text: t(
            'Take the pot off the heat. Remove the bay leaves, stir in the dill and add a splash of vinegar if you like. Season with pepper and add salt to taste. Serve hot.',
            'Ia oala de pe foc. Scoate foile de dafin, adaugă mărarul și, dacă vrei, un strop de oțet. Pune piper și sare după gust. Servește fierbinte.',
          ),
        },
      ],
      tips: [
        t(
          'Mutton works too: cut it small and expect to simmer it for 1 to 1.5 hours before the vegetables go in, until it is tender.',
          'Merge și cu carne de berbec: taie-o mărunt și lasă-o să fiarbă 1-1,5 ore înainte să adaugi legumele, până e fragedă.',
        ),
      ],
      stepTips: [
        {
          step: 'liaison',
          text: t(
            'The flour holds the cream steady, but only if it goes in smooth and warmed: adding cold cream straight to the pot, or letting the soup boil hard afterwards, splits it.',
            'Făina ține smântâna legată, dar numai dacă intră netedă și încălzită: smântâna rece pusă direct în oală sau o fierbere tare după aceea o taie.',
          ),
        },
      ],
      nutritionNote: t(
        'Lamb and the cream-and-flour liaison make it a rich, filling soup with protein, and the potatoes and green beans add carbohydrate and fibre. The lamb, lard and sour cream bring a lot of saturated fat, so skim the surface and keep portions moderate. Salt is added only to taste.',
        'Mielul și legătura de smântână cu făină fac din ea o supă bogată și sățioasă, cu proteine, iar cartofii și fasolea verde aduc carbohidrați și fibre. Mielul, untura și smântâna adaugă multe grăsimi saturate, așa că ia grăsimea de la suprafață și servește porții moderate. Sarea se adaugă doar după gust.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Fresh bread', 'Pâine proaspătă'),
          reason: t(
            'Soft bread soaks up the paprika-red, creamy broth.',
            'Pâinea moale adună zeama roșiatică de boia, cremoasă.',
          ),
          principle: 'complement_flavour',
          ingredient: 'bread',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its acidity cuts through the richness of the lamb and the cream.',
            'Aciditatea lui taie bogăția mielului și a smântânii.',
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
            'A hot, hearty lamb soup warms you through.',
            'O supă fierbinte și consistentă de miel te încălzește.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'The lamb, lard and cream sit heavy when eaten right before bed.',
            'Mielul, untura și smântâna cad greu dacă le mănânci chiar înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
