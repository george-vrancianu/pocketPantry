import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Ciorbă de miel base is the Romanian soured lamb soup: bone-in lamb
// simmered until tender, diced roots and rice, plenty of spring onion and green
// garlic, soured with borș and enriched with a yolk and sour cream liaison. Each
// Variant is a full Recipe with its own lines, steps and guidance; the base's
// Recipe-level Tips are inherited unless hidden.
export const ciorbaDeMiel: BaseRecipeSeed = {
  slug: 'ciorba-de-miel',
  title: t(
    'Romanian lamb sour soup with lovage and green onion (ciorbă de miel)',
    'Ciorbă de miel cu leuștean și ceapă verde',
  ),
  servings: 6,
  prepMinutes: 30,
  cookMinutes: 130,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'lamb',
      quantity: 800,
      unit: 'g',
      note: t(
        'bone-in breast, neck or ribs, in pieces of about 5 cm (ask the butcher to chop it)',
        'piept, gât sau coaste cu os, tăiate bucăți de cam 5 cm (cere măcelarului să le taie)',
      ),
    },
    { ingredient: 'still-water', quantity: 2.5, unit: 'l' },
    {
      ingredient: 'salt',
      key: 'salt-stock',
      quantity: 12,
      unit: 'g',
      note: t('for the lamb', 'pentru carne'),
    },
    {
      ingredient: 'salt',
      key: 'salt-end',
      quantity: 3,
      unit: 'g',
      note: t('to finish, adjust to taste', 'la final, ajustează după gust'),
    },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('finely diced', 'tăiate mărunt'),
    },
    {
      ingredient: 'carrot',
      quantity: 150,
      unit: 'g',
      note: t('diced small', 'tăiat cubulețe'),
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
      note: t('red, seeded, diced small', 'roșu, fără semințe, tăiat cubulețe'),
    },
    { ingredient: 'sunflower-oil', quantity: 40, unit: 'ml' },
    {
      ingredient: 'rice',
      quantity: 60,
      unit: 'g',
      note: t(
        'rinsed until the water runs clear',
        'spălat până apa iese limpede',
      ),
    },
    {
      ingredient: 'spring-onion',
      quantity: 200,
      unit: 'g',
      note: t('green and white parts, sliced', 'verde și alb, tăiată felii'),
    },
    {
      ingredient: 'green-garlic',
      quantity: 40,
      unit: 'g',
      optional: true,
      note: t('in season, sliced thin', 'în sezon, tăiat subțire'),
    },
    {
      ingredient: 'ciorba-sour-base',
      quantity: 500,
      unit: 'ml',
      note: t('first pour', 'pentru început'),
    },
    {
      ingredient: 'ciorba-sour-base',
      key: 'sour-base-extra',
      quantity: 200,
      unit: 'ml',
      optional: true,
      note: t('extra, added to taste', 'în plus, adăugat după gust'),
    },
    {
      ingredient: 'eggs',
      quantity: 3,
      unit: 'pcs',
      note: t(
        'yolks only; keep the whites for another dish',
        'doar gălbenușurile; păstrează albușurile pentru altă mâncare',
      ),
    },
    {
      ingredient: 'sour-cream',
      quantity: 150,
      unit: 'g',
      note: t('for the egg liaison', 'pentru dreasă'),
    },
    {
      ingredient: 'lovage',
      quantity: 25,
      unit: 'g',
      note: t('finely chopped, to finish', 'tocat mărunt, la final'),
    },
    {
      ingredient: 'dill',
      quantity: 20,
      unit: 'g',
      note: t('finely chopped, to finish', 'tocat mărunt, la final'),
    },
    {
      ingredient: 'parsley',
      quantity: 20,
      unit: 'g',
      note: t('finely chopped, to finish', 'tocat mărunt, la final'),
    },
    { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
    {
      ingredient: 'hot-pepper',
      quantity: 1,
      unit: 'pcs',
      optional: true,
      note: t('fresh, for the table', 'proaspăt, pentru masă'),
    },
  ],
  steps: [
    {
      key: 'prep',
      text: t(
        'Before you touch the lamb, wash and chop the lovage, dill and parsley, slice the spring onion and green garlic, and dice the onions, carrot, parsley root and bell pepper. Keep the herbs, spring onion and garlic together in the fridge.',
        'Înainte să atingi carnea de miel, spală și toacă leușteanul, mărarul și pătrunjelul, taie felii ceapa verde și usturoiul verde și taie cubulețe ceapa, morcovul, rădăcina de pătrunjel și ardeiul. Ține verdețurile, ceapa verde și usturoiul verde la frigider.',
      ),
    },
    {
      key: 'start',
      text: t(
        'Put the lamb in a 6 l pot and cover it with the 2.5 l of cold water. Do not rinse the raw lamb. Wash your hands, the board and the knife with hot soapy water.',
        'Pune carnea de miel într-o oală de 6 l și acoper-o cu cei 2,5 l de apă rece. Nu spăla carnea crudă. Spală-ți mâinile, tocătorul și cuțitul cu apă caldă și săpun.',
      ),
    },
    {
      key: 'boil',
      text: t(
        'Set the pot over medium-high heat and bring it slowly to the boil, about 20 minutes. Grey scum rises as the meat heats.',
        'Pune oala la foc potrivit-mare și adu încet la fierbere, cam 20 de minute. Pe măsură ce carnea se încălzește, la suprafață se strânge spumă cenușie.',
      ),
    },
    {
      key: 'skim',
      text: t(
        'Turn the heat down so the water only trembles. Skim off the scum with a ladle or a slotted spoon for the first 10 minutes, until little new scum rises.',
        'Scade focul, să clocotească abia vizibil. Ia spuma cu polonicul sau cu spumiera în primele 10 minute, până nu se mai adună spumă nouă.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'simmer',
      text: t(
        'Add the 12 g of salt, partly cover the pot and simmer very gently for 1 hour, until the meat is nearly tender and starts to pull from the bone. If it is still firm, simmer on and check every 15 minutes.',
        'Adaugă cele 12 g de sare, acoperă oala pe jumătate și fierbe foarte domol 1 oră, până când carnea e aproape fragedă și începe să se desprindă de os. Dacă e încă tare, mai lasă-o la fiert și verific-o din 15 în 15 minute.',
      ),
      timerSeconds: 3600,
    },
    {
      key: 'sweat',
      text: t(
        'While the lamb simmers, heat the oil in a wide pan over medium heat. Add the onions, carrot, parsley root and bell pepper and cook for 10 minutes, stirring, until soft but not browned.',
        'În timp ce carnea fierbe, încinge uleiul într-o tigaie lată la foc mediu. Adaugă ceapa, morcovul, rădăcina de pătrunjel și ardeiul și călește 10 minute, amestecând, până se înmoaie, fără să se rumenească.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'veg',
      text: t(
        'Scrape the softened vegetables into the pot and simmer for 15 minutes, until the carrot is nearly tender.',
        'Răstoarnă legumele călite în oală și fierbe 15 minute, până când morcovul e aproape fraged.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'rice',
      text: t(
        'Stir in the rice and simmer for 10 minutes. While it cooks, bring the borș to the boil in a small pan and keep it hot.',
        'Adaugă orezul, amestecă și fierbe 10 minute. În timp ce se gătește, adu borșul la fiert într-o cratiță mică și ține-l fierbinte.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'greens',
      text: t(
        'Add the spring onion and green garlic and simmer for 5 minutes, until they are bright green and the rice and vegetables are tender.',
        'Adaugă ceapa verde și usturoiul verde și fierbe 5 minute, până devin de un verde intens, iar orezul și legumele sunt fragede.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'sour',
      text: t(
        'Pour in 500 ml of the boiled borș, bring back to the boil and cook for 3 minutes. Taste, then add up to 200 ml more borș, a little at a time, until the soup is as sour as you like. Add the last 3 g of salt and the pepper if it needs them.',
        'Toarnă 500 ml din borșul fiert, adu din nou la fierbere și lasă 3 minute. Gustă, apoi adaugă treptat până la 200 ml de borș în plus, până când ciorba e atât de acră cât îți place. Adaugă ultimele 3 g de sare și piperul, dacă mai trebuie.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'liaison',
      text: t(
        'Take the pot off the heat and let it stop bubbling. In a bowl, whisk the yolks with the sour cream. Whisking all the time, add 3 ladles of the hot soup, one at a time. Stir the mixture back into the pot, then put it over the lowest heat and stir for 1 to 2 minutes, until slightly thickened and steaming hot but not boiling.',
        'Ia oala de pe foc și așteaptă să nu mai clocotească. Într-un castron, amestecă gălbenușurile cu smântâna. Amestecând întruna, adaugă pe rând 3 polonice de supă fierbinte. Toarnă amestecul înapoi în oală, pune-o la cel mai mic foc și amestecă 1-2 minute, până se îngroașă ușor și scoate aburi, fără să fiarbă.',
      ),
      timerSeconds: 90,
    },
    {
      key: 'finish',
      text: t(
        'Off the heat, stir in the lovage, dill and parsley. Serve hot, with a slice of fresh hot pepper at the table, if you like.',
        'Ia oala de pe foc și amestecă leușteanul, mărarul și pătrunjelul. Servește fierbinte, cu o felie de ardei iute proaspăt la masă, dacă vrei.',
      ),
    },
    {
      key: 'store',
      text: t(
        'Because of the rice, cool leftovers within 1 to 2 hours, in shallow containers, put them in the fridge and eat them within 1 day. Reheat only the portion you need, once, gently and stirring, until steaming hot; do not let it boil, because the egg thickening splits.',
        'Din cauza orezului, răcește ciorba rămasă în 1-2 ore, în recipiente joase, pune-o la frigider și mănânc-o în cel mult 1 zi. Reîncălzește doar porția de care ai nevoie, o singură dată, domol și amestecând, până scoate aburi; nu o lăsa să fiarbă, pentru că dreasa se taie.',
      ),
    },
  ],
  tips: [
    t(
      'Keep the lamb at a lazy simmer, with a bubble breaking the surface now and then. A hard boil clouds the broth and toughens the meat.',
      'Ține carnea de miel la un clocot leneș, cu câte o bulă care sparge din când în când suprafața. Fierberea tare tulbură supa și întărește carnea.',
    ),
    t(
      'Add the borș a little at a time and taste after each pour: brands and homemade borș differ a lot in sourness. Start with about half a litre for 2.5 l of water, and add it only once the rice and vegetables are tender, because acid keeps them firm.',
      'Adaugă borșul treptat și gustă după fiecare turnare: borșul diferă mult ca aciditate de la o marcă la alta și de la unul făcut în casă la altul. Pornește de la jumătate de litru la 2,5 l de apă și pune-l abia după ce orezul și legumele sunt fragede, pentru că aciditatea le ține tari.',
    ),
    t(
      'Once the egg liaison is in, the soup must not boil again: it curdles. If you want to make the soup ahead, stop before the liaison, chill it, lift off the set fat, keep it in the fridge and use it within 1 day (it has rice in it). Bring it back to the boil, then add the liaison fresh as in the recipe.',
      'După ce ai pus dreasa, ciorba nu mai are voie să fiarbă: se taie. Dacă vrei s-o pregătești dinainte, oprește-te înainte de dreasă, răcește supa, ia grăsimea închegată de deasupra, păstreaz-o la frigider și folosește-o în cel mult 1 zi (are orez). Adu-o din nou la fierbere, apoi adaugă dreasa proaspătă ca în rețetă.',
    ),
  ],
  stepTips: [
    {
      step: 'store',
      text: t(
        'The rice keeps swelling as the soup stands, so leftovers turn thick. Thin them with a little hot water when you reheat, and add a splash of boiled borș if the soup has lost its sourness.',
        'Orezul continuă să se umfle cât stă ciorba, așa că ce rămâne se îngroașă. Subțiaz-o cu puțină apă fierbinte când o reîncălzești și adaugă un strop de borș fiert dacă și-a pierdut aciditatea.',
      ),
    },
    {
      step: 'liaison',
      text: t(
        'Adding the hot soup to the yolks gradually warms them, so they do not scramble when they meet the pot.',
        'Dacă adaugi supa fierbinte treptat peste gălbenușuri, acestea se încălzesc pe nesimțite și nu se taie când ajung în oală.',
      ),
    },
  ],
  nutritionNote: t(
    'Lamb gives protein, and the spring onion, roots and rice make it a filling one-pot meal. Breast and ribs are fatty, so lift off the fat from the surface; the yolks and sour cream add saturated fat, and the borș and salt make it salty, so taste before adding more. Rice adds starchy carbohydrate.',
    'Carnea de miel aduce proteine, iar ceapa verde, rădăcinoasele și orezul fac din ciorbă o masă săturătoare dintr-o singură oală. Pieptul și coastele sunt grase, așa că ia grăsimea de la suprafață; gălbenușurile și smântâna aduc grăsimi saturate, iar borșul și sarea o fac sărată, așa că gustă înainte să mai adaugi. Orezul aduce carbohidrați amidonoși.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Fresh bread', 'Pâine proaspătă'),
      reason: t(
        'A crusty slice soaks up the sour broth and gives the soft meat and rice something to bite against.',
        'O felie cu crustă se îmbibă cu supa acrișoară și oferă cărnii și orezului moi un contrast la mestecat.',
      ),
      principle: 'contrast_texture',
      ingredient: 'bread',
    },
    {
      kind: 'food',
      label: t('Pickled hot peppers', 'Ardei iuți murați'),
      reason: t(
        'A bite of sharp, vinegary heat between spoonfuls refreshes the palate after the fatty lamb.',
        'O îmbucătură de ardei iute murat, acrișor și picant, între linguri împrospătează gustul după carnea grasă de miel.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'pickled-peppers',
    },
    {
      kind: 'food',
      label: t(
        'Romanian lamb offal and spring-herb loaf (drob de miel)',
        'Drob de miel',
      ),
      reason: t(
        'The soup and the offal loaf are both made from the lamb of an Easter table, and are served together at Easter.',
        'Ciorba și drobul se fac din mielul de pe masa de Paște și se servesc împreună de Paște.',
      ),
      principle: 'regional_tradition',
      recipe: 'drob-de-miel',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot, sour lamb soup with rice warms you through.',
        'O ciorbă fierbinte și acrișoară de miel, cu orez, te încălzește bine.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Protein from the lamb, carbohydrate from the rice and plenty of warm liquid.',
        'Proteine din carnea de miel, carbohidrați din orez și multe lichide calde.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A large, rich bowl of lamb soup can sit heavy before bed.',
        'Un castron mare de supă bogată cu miel poate cădea greu înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'ciorba-de-miel-greek',
      cuisine: 'greek',
      title: t(
        'Mageiritsa (Greek Easter lamb offal soup with egg and lemon)',
        'Mageiritsa (supă grecească de Paște din organe de miel, cu ou și lămâie)',
      ),
      servings: 6,
      prepMinutes: 30,
      cookMinutes: 100,
      difficulty: 'medium',
      hideBaseTips: [0, 1, 2],
      lines: [
        {
          ingredient: 'lamb-offal',
          quantity: 700,
          unit: 'g',
          note: t(
            'the pluck: liver, heart and lungs',
            'organele: ficat, inimă și plămâni',
          ),
        },
        {
          ingredient: 'still-water',
          quantity: 4,
          unit: 'l',
          note: t(
            '1.5 l to blanch the offal and 2.5 l for the soup',
            '1,5 l pentru opărirea organelor și 2,5 l pentru supă',
          ),
        },
        { ingredient: 'olive-oil', quantity: 60, unit: 'ml' },
        {
          ingredient: 'spring-onion',
          quantity: 300,
          unit: 'g',
          note: t(
            'green and white parts, sliced',
            'verde și alb, tăiată felii',
          ),
        },
        {
          ingredient: 'rice',
          quantity: 80,
          unit: 'g',
          note: t(
            'rinsed until the water runs clear',
            'spălat până apa iese limpede',
          ),
        },
        {
          ingredient: 'lettuce',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'a head of cos, shredded',
            'un cap de salată romană, tăiată fâșii',
          ),
        },
        {
          ingredient: 'dill',
          quantity: 40,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        {
          ingredient: 'salt',
          key: 'salt-stock',
          quantity: 6,
          unit: 'g',
          note: t('for the stock', 'pentru supă'),
        },
        {
          ingredient: 'salt',
          key: 'salt-end',
          quantity: 4,
          unit: 'g',
          note: t(
            'to finish, adjust to taste',
            'la final, ajustează după gust',
          ),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        {
          ingredient: 'eggs',
          quantity: 3,
          unit: 'pcs',
          note: t('whole, for the avgolemono', 'întregi, pentru avgolemono'),
        },
        {
          ingredient: 'lemon',
          quantity: 2,
          unit: 'pcs',
          note: t('juiced, about 90 ml', 'storsă, cam 90 ml de suc'),
        },
      ],
      steps: [
        {
          key: 'prep',
          text: t(
            'Before you touch the offal, wash and slice the spring onions, chop the dill, shred the lettuce and juice the lemons. Keep them in the fridge.',
            'Înainte să atingi organele, spală și taie felii ceapa verde, toacă mărarul și taie fâșii salata și stoarce lămâile. Ține-le la frigider.',
          ),
        },
        {
          key: 'trim',
          text: t(
            'On a board, trim the offal: cut away the windpipe and large tubes, fat, gristle and any green-yellow stained bits of the liver, and cut the heart open to remove clots. Cut everything into 3 to 4 cm pieces and put them in a 5 l pot. Do not rinse the raw offal at the sink. Wash your hands, the board and the knife with hot soapy water.',
            'Pe tocător, curăță organele: taie traheea și tuburile mari, grăsimea, cartilajele și părțile pătate în verde-gălbui de la ficat, iar inima deschide-o ca să scoți cheagurile. Taie totul bucăți de 3-4 cm și pune-le într-o oală de 5 l. Nu spăla organele crude la chiuvetă. Spală-ți mâinile, tocătorul și cuțitul cu apă caldă și săpun.',
          ),
        },
        {
          key: 'blanch',
          text: t(
            'Cover the offal with 1.5 l of cold water, bring to the boil over high heat and boil for 5 minutes. Lift the pieces out with a slotted spoon into a bowl and discard the blanching water. Rinse the pot and wash the slotted spoon.',
            'Acoperă organele cu 1,5 l de apă rece, adu la fierbere la foc mare și fierbe 5 minute. Scoate bucățile cu spumiera într-un castron și aruncă apa. Clătește oala și spală spumiera.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'simmer',
          text: t(
            'Return the offal to the 5 l pot with 2.5 l of fresh cold water and the 6 g of salt, and wash the bowl with hot soapy water. Bring to the boil, skim until little new scum rises, then partly cover and simmer gently for 30 minutes. The pieces are cooked when they are firm, the lungs are light and spongy, and a cut piece of liver is grey-brown right through, with no pink juices (or 70 °C for 2 minutes in the centre of the thickest piece of liver). If not, simmer on for 5 minutes and check again.',
            'Pune organele înapoi în oala de 5 l cu 2,5 l de apă rece curată și cu cele 6 g de sare și spală castronul cu apă caldă și săpun. Adu la fierbere, ia spuma până nu se mai adună spumă nouă, apoi acoperă pe jumătate și fierbe domol 30 de minute. Bucățile sunt gătite când sunt ferme, plămânii sunt ușori și spongioși, iar o bucată de ficat tăiată e cenușie-brună pe toată grosimea, fără suc roz (sau 70 °C timp de 2 minute în mijlocul celei mai groase bucăți de ficat). Dacă nu, mai fierbe 5 minute și verifică din nou.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'chop',
          text: t(
            'Strain the stock through a fine sieve into a large clean heatproof bowl. Move the offal to a clean board and chop it small, about 5 mm. Wipe the pot. Wash your hands and the board with hot soapy water.',
            'Strecoară supa printr-o sită deasă într-un castron curat și termorezistent, mare. Mută organele pe un tocător curat și toacă-le mărunt, cam 5 mm. Șterge oala. Spală-ți mâinile și tocătorul cu apă caldă și săpun.',
          ),
        },
        {
          key: 'soften',
          text: t(
            'Heat the olive oil in the pot over medium heat. Add the spring onions and cook for 5 minutes, stirring, until soft and glossy but not browned.',
            'Încinge uleiul de măsline în oală la foc mediu. Adaugă ceapa verde și călește 5 minute, amestecând, până se înmoaie și devine lucioasă, fără să se rumenească.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'offal-in',
          text: t(
            'Add the chopped offal and the pepper and stir for 2 minutes so the pieces take up the oil.',
            'Adaugă organele tocate și piperul și amestecă 2 minute, ca bucățile să se îmbibe cu ulei.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'rice',
          text: t(
            'Pour in the stock, bring to the boil, stir in the rice and simmer for 10 minutes.',
            'Toarnă supa, adu la fierbere, amestecă orezul și fierbe 10 minute.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'lettuce',
          text: t(
            'Add the lettuce and dill and simmer for 5 minutes, until the lettuce has wilted and the rice is tender.',
            'Adaugă salata și mărarul și fierbe 5 minute, până salata se moaie și orezul e fraged.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'avgolemono',
          text: t(
            'Take the pot off the heat and let it stop bubbling. In a large bowl, whisk the eggs for 1 minute until frothy, then whisk in about three quarters of the lemon juice. Whisking all the time, add 3 ladles of the hot soup, one at a time. Stir the mixture back into the pot, then put it over the lowest heat and stir for 1 to 2 minutes, until slightly thickened and steaming hot but not boiling.',
            'Ia oala de pe foc și așteaptă să nu mai clocotească. Într-un castron mare, bate ouăle 1 minut până fac spumă, apoi amestecă aproximativ trei sferturi din sucul de lămâie. Amestecând întruna, adaugă pe rând 3 polonice de supă fierbinte. Toarnă amestecul înapoi în oală, pune-o la cel mai mic foc și amestecă 1-2 minute, până se îngroașă ușor și scoate aburi, fără să fiarbă.',
          ),
          timerSeconds: 90,
        },
        {
          key: 'serve',
          text: t(
            'Taste, then add the rest of the lemon juice and the last 4 g of salt, to taste. Serve straight away, hot.',
            'Gustă, apoi adaugă restul de suc de lămâie și ultimele 4 g de sare, după gust. Servește imediat, fierbinte.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Because of the rice, cool leftovers within 1 to 2 hours, in shallow containers, put them in the fridge and eat them within 1 day. Reheat only the portion you need, once, gently and stirring, until steaming hot; do not let it boil, because the egg thickening splits.',
            'Din cauza orezului, răcește supa rămasă în 1-2 ore, în recipiente joase, pune-o la frigider și mănânc-o în cel mult 1 zi. Reîncălzește doar porția de care ai nevoie, o singură dată, domol și amestecând, până scoate aburi; nu o lăsa să fiarbă, pentru că ouăle se taie.',
          ),
        },
      ],
      tips: [
        t(
          'This soup contains liver, as the pluck includes it. People who are pregnant should avoid liver and liver products, which contain a lot of vitamin A (NHS).',
          'Supa conține ficat. Persoanele însărcinate ar trebui să evite ficatul și produsele din ficat, care conțin multă vitamină A (NHS).',
        ),
        t(
          'Lemons vary: whisk in about three quarters of the juice, taste the finished soup and add the rest to taste. Never let the soup boil once the eggs are in, or they curdle.',
          'Lămâile diferă: amestecă aproximativ trei sferturi din suc, gustă supa gata și adaugă restul după gust. Nu lăsa supa să fiarbă după ce ai pus ouăle, altfel se taie.',
        ),
      ],
      stepTips: [
        {
          step: 'trim',
          text: t(
            'Trimming with a knife on the board, then blanching, does the cleaning. Rinsing raw offal under the tap only splashes bacteria around the sink.',
            'Curățatul cu cuțitul pe tocător, apoi opărirea, fac curățenia. Spălarea organelor crude sub jet de apă doar stropește bacterii prin jurul chiuvetei.',
          ),
        },
      ],
      nutritionNote: t(
        'The offal makes this a protein-rich soup with little carbohydrate beyond the rice, and the olive oil is mostly unsaturated fat. Liver is very rich in vitamin A and iron (hence the pregnancy Tip), offal and yolks bring cholesterol, the lettuce and spring onion add only a little fibre, and the salt adds up, so season to taste.',
        'Organele fac din supă o mâncare bogată în proteine, cu puțini carbohidrați în afară de orez, iar uleiul de măsline este în mare parte grăsime nesaturată. Ficatul este foarte bogat în vitamina A și fier (de aici sfatul pentru persoanele însărcinate), organele și gălbenușurile aduc colesterol, salata și ceapa verde aduc doar puține fibre, iar sarea se adună, așa că sărează după gust.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Country bread', 'Pâine de casă'),
          reason: t(
            'A crusty slice gives the soft offal and rice something to bite against and mops up the lemony broth.',
            'O felie cu crustă oferă organelor și orezului moi un contrast la mestecat și strânge supa acrișoară de lămâie.',
          ),
          principle: 'contrast_texture',
          ingredient: 'country-bread',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its acidity cuts through the richness of the offal and egg.',
            'Aciditatea lui taie din bogăția organelor și a oului.',
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
            'A hot, lemony soup with rice warms you through.',
            'O supă fierbinte, cu lămâie și orez, te încălzește bine.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Offal and egg make a rich bowl that can sit heavy before bed.',
            'Organele și ouăle fac un castron bogat, care poate cădea greu înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'ciorba-de-miel-moroccan',
      cuisine: 'moroccan',
      title: t(
        'Harira (Moroccan lamb, chickpea and lentil soup)',
        'Harira (supă marocană de miel cu năut și linte)',
      ),
      servings: 6,
      prepMinutes: 500,
      cookMinutes: 125,
      difficulty: 'medium',
      hideBaseTips: [1, 2],
      lines: [
        {
          ingredient: 'lamb',
          quantity: 400,
          unit: 'g',
          note: t(
            'boneless shoulder, trimmed, in 2 cm cubes',
            'spată de miel fără os, curățată de grăsime, tăiată cuburi de 2 cm',
          ),
        },
        {
          ingredient: 'chickpeas',
          quantity: 100,
          unit: 'g',
          note: t('dried, soaked overnight', 'uscat, înmuiat peste noapte'),
        },
        {
          ingredient: 'lentils',
          quantity: 80,
          unit: 'g',
          note: t('green or brown, rinsed', 'verde sau brună, spălată'),
        },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('finely diced', 'tăiate mărunt'),
        },
        {
          ingredient: 'celery',
          quantity: 100,
          unit: 'g',
          note: t(
            'stalks and leaves, finely chopped',
            'tulpini și frunze, tocate mărunt',
          ),
        },
        { ingredient: 'butter', quantity: 30, unit: 'g' },
        { ingredient: 'ground-ginger', quantity: 2, unit: 'g' },
        { ingredient: 'turmeric', quantity: 2, unit: 'g' },
        { ingredient: 'cinnamon', quantity: 2, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
        {
          ingredient: 'saffron',
          quantity: 0.1,
          unit: 'g',
          optional: true,
          note: t('a pinch of threads', 'un praf de fire'),
        },
        {
          ingredient: 'still-water',
          key: 'water-soup',
          quantity: 2.5,
          unit: 'l',
          note: t('for the soup', 'pentru supă'),
        },
        {
          ingredient: 'canned-tomatoes',
          quantity: 400,
          unit: 'g',
        },
        { ingredient: 'tomato-paste', quantity: 30, unit: 'g' },
        {
          ingredient: 'coriander',
          quantity: 30,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        {
          ingredient: 'parsley',
          quantity: 30,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        { ingredient: 'salt', quantity: 8, unit: 'g' },
        {
          ingredient: 'vermicelli',
          quantity: 50,
          unit: 'g',
          note: t('broken into short pieces', 'ruptă în bucăți scurte'),
        },
        {
          ingredient: 'flour',
          quantity: 30,
          unit: 'g',
          note: t('for the thickening', 'pentru îngroșare'),
        },
        {
          ingredient: 'still-water',
          key: 'water-slurry',
          quantity: 0.15,
          unit: 'l',
          note: t('cold, for the thickening', 'rece, pentru îngroșare'),
        },
        {
          ingredient: 'lemon',
          quantity: 2,
          unit: 'pcs',
          note: t('in wedges, for the table', 'felii, pentru masă'),
        },
      ],
      steps: [
        {
          key: 'soak',
          text: t(
            'The night before, put the chickpeas in a large bowl and cover them with at least three times their volume of cold water. Leave them to soak for at least 8 hours.',
            'Cu o seară înainte, pune năutul într-un castron mare și acoper-l cu apă rece, de cel puțin trei ori volumul lui. Lasă-l la înmuiat cel puțin 8 ore.',
          ),
          timerSeconds: 28800,
        },
        {
          key: 'prep',
          text: t(
            'Drain the chickpeas and discard the soaking water. Chop the coriander and parsley, dice the onions and chop the celery. Last, cut the lamb into 2 cm cubes, trimming off hard fat. Keep the herbs in the fridge.',
            'Scurge năutul și aruncă apa de la înmuiat. Toacă coriandrul și pătrunjelul, taie mărunt ceapa și țelina pai. La urmă, taie carnea de miel cuburi de 2 cm, curățând grăsimea tare. Ține verdețurile la frigider.',
          ),
        },
        {
          key: 'brown',
          text: t(
            'Melt the butter in a 5 l pot over medium heat. Add the lamb and onions, then wash your hands, the board and the knife with hot soapy water. Cook for 8 minutes, stirring, until the lamb has lost its raw colour and the onions are soft.',
            'Topește untul într-o oală de 5 l la foc mediu. Adaugă carnea de miel și ceapa, apoi spală-ți mâinile, tocătorul și cuțitul cu apă caldă și săpun. Călește 8 minute, amestecând, până carnea își pierde culoarea crudă, iar ceapa se înmoaie.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'spices',
          text: t(
            'Add the celery, ginger, turmeric, cinnamon, pepper and the saffron, if using, and stir for 1 minute until fragrant.',
            'Adaugă țelina pai, ghimbirul, turmericul, scorțișoara, piperul și șofranul, dacă folosești, și amestecă 1 minut, până se simte aroma.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'chickpeas',
          text: t(
            'Add the chickpeas and 2.5 l of water. Bring to the boil, skim off any scum, then partly cover and simmer gently for 1 hour, until the chickpeas are nearly tender, with a slightly firm centre, and the lamb is tender. If they are still hard, simmer on and check every 15 minutes.',
            'Adaugă năutul și 2,5 l de apă. Adu la fierbere, ia spuma, apoi acoperă pe jumătate și fierbe domol 1 oră, până când năutul e aproape fraged, cu miezul puțin ferm, iar carnea e fragedă. Dacă încă sunt tari, mai lasă-le la fiert și verifică-le din 15 în 15 minute.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'slurry',
          text: t(
            'While the chickpeas simmer, whisk the flour with the 150 ml of cold water in a bowl until smooth, with no lumps. Set it aside.',
            'În timp ce năutul fierbe, amestecă făina cu cei 150 ml de apă rece într-un castron, până se omogenizează, fără cocoloașe. Pune-l deoparte.',
          ),
        },
        {
          key: 'lentils',
          text: t(
            'Add the lentils, tomatoes (crush them with the spoon), tomato paste, half the coriander and parsley, and the salt. Simmer for 25 minutes, until the lentils and chickpeas are tender.',
            'Adaugă lintea, roșiile (strivește-le cu lingura), pasta de roșii, jumătate din coriandru și pătrunjel și sarea. Fierbe 25 de minute, până lintea și năutul sunt fragede.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'vermicelli',
          text: t(
            'Add the broken vermicelli and simmer for 6 minutes, until soft.',
            'Adaugă fideaua ruptă și fierbe 6 minute, până se înmoaie.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'thicken',
          text: t(
            'Stir the slurry again, then pour it into the pot in a thin stream, stirring all the time. Simmer for 5 minutes, stirring, until the soup is silky and the flour no longer tastes raw.',
            'Amestecă din nou amestecul de făină cu apă, apoi toarnă-l în oală în șuvoi subțire, amestecând întruna. Fierbe 5 minute, amestecând, până supa devine mătăsoasă, iar făina nu mai are gust crud.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'finish',
          text: t(
            'Stir in the remaining coriander and parsley, and taste for salt. Serve hot, with a lemon wedge in each bowl to squeeze over.',
            'Amestecă coriandrul și pătrunjelul rămase și gustă de sare. Servește fierbinte, cu o felie de lămâie în fiecare castron, ca să o stoarcă fiecare peste supă.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Cool leftovers within 2 hours, in shallow containers, and keep them in the fridge for up to 3 days. The soup thickens as it stands: thin it with hot water and reheat until steaming hot.',
            'Răcește supa rămasă în cel mult 2 ore, în recipiente joase, și păstreaz-o la frigider până la 3 zile. Supa se îngroașă cât stă: subțiaz-o cu apă fierbinte și reîncălzește-o până scoate aburi.',
          ),
        },
      ],
      tips: [
        t(
          'Add the tomatoes only once the chickpeas are nearly tender: acid slows their softening, so tomatoes too early leave you with hard chickpeas.',
          'Pune roșiile abia după ce năutul e aproape fraged: aciditatea îl înmoaie mai greu, iar dacă le pui prea devreme rămâne tare.',
        ),
        t(
          'Do not shorten the 5 minutes after the slurry goes in. Undercooked flour tastes pasty, and the soup only turns silky once it has cooked.',
          'Nu scurta cele 5 minute după ce ai pus amestecul de făină cu apă. Făina insuficient fiartă are gust de pastă, iar supa devine mătăsoasă abia după ce fierbe.',
        ),
      ],
      nutritionNote: t(
        'Chickpeas and lentils make this filling and fibre-rich, with protein from the lamb as well. The butter and lamb add saturated fat, the vermicelli and flour add refined starch, and the salt adds up, so taste before adding more.',
        'Năutul și lintea fac supa săturătoare și bogată în fibre, iar carnea de miel adaugă proteine. Untul și mielul aduc grăsimi saturate, fideaua și făina aduc amidon rafinat, iar sarea se adună, așa că gustă înainte să mai adaugi.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Dates', 'Curmale'),
          reason: t(
            'The sweetness of a date plays against the salty, spiced soup.',
            'Dulceața unei curmale contrastează cu supa sărată și condimentată.',
          ),
          principle: 'salt_balances_sweet',
          ingredient: 'dates',
        },
        {
          kind: 'drink',
          label: t('Mint tea', 'Ceai de mentă'),
          reason: t(
            'Hot, fresh mint tea refreshes the palate after a hearty bowl.',
            'Un ceai de mentă fierbinte și proaspăt împrospătează gustul după un castron consistent.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'mint-tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, spiced pulse soup warms you through.',
            'O supă fierbinte și condimentată, cu leguminoase, te încălzește bine.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from the lamb and pulses, carbohydrate from the lentils and vermicelli.',
            'Proteine din carnea de miel și leguminoase, carbohidrați din linte și fidea.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A big bowl of pulses and lamb can sit heavy before bed.',
            'Un castron mare de leguminoase cu miel poate cădea greu înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
