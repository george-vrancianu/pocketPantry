import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Ciorbă de văcuță base is the Romanian soured beef soup: beef shank
// simmered until fork-tender, a mix of diced root vegetables, potato and green
// beans, soured with borș and finished with lovage. Each Variant is a full
// Recipe with its own lines, steps and guidance; the base's Recipe-level Tips
// are inherited unless hidden.
export const ciorbaDeVacuta: BaseRecipeSeed = {
  slug: 'ciorba-de-vacuta',
  title: t(
    'Romanian beef sour soup (ciorbă de văcuță)',
    'Ciorbă de văcuță cu legume și leuștean',
  ),
  servings: 6,
  prepMinutes: 30,
  cookMinutes: 205,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'beef-shank',
      quantity: 1000,
      unit: 'g',
      note: t('in one or two pieces', 'într-o bucată sau două'),
    },
    {
      ingredient: 'beef-soup-bones',
      quantity: 400,
      unit: 'g',
      optional: true,
      note: t('for a fuller stock', 'pentru o supă mai plină'),
    },
    { ingredient: 'still-water', quantity: 3, unit: 'l' },
    {
      ingredient: 'onion',
      key: 'onion-stock',
      quantity: 1,
      unit: 'pcs',
      note: t(
        'peeled, halved, for the stock',
        'curățată, tăiată în două, pentru supă',
      ),
    },
    {
      ingredient: 'onion',
      key: 'onion-soup',
      quantity: 2,
      unit: 'pcs',
      note: t('finely diced, for the soup', 'tăiate mărunt, pentru ciorbă'),
    },
    { ingredient: 'peppercorns', quantity: 5, unit: 'g' },
    {
      ingredient: 'bay-leaves',
      quantity: 1,
      unit: 'g',
      note: t('about 5 leaves', 'cam 5 foi'),
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
      ingredient: 'parsnip',
      quantity: 60,
      unit: 'g',
      note: t('diced small', 'tăiat cubulețe'),
    },
    {
      ingredient: 'celeriac',
      quantity: 100,
      unit: 'g',
      note: t('peeled, diced small', 'curățată, tăiată cubulețe'),
    },
    {
      ingredient: 'bell-pepper',
      quantity: 1,
      unit: 'pcs',
      note: t('red, seeded, diced small', 'roșu, fără semințe, tăiat cubulețe'),
    },
    { ingredient: 'sunflower-oil', quantity: 50, unit: 'ml' },
    {
      ingredient: 'potato',
      quantity: 0.4,
      unit: 'kg',
      note: t('peeled, in 1.5 cm cubes', 'curățați, tăiați cuburi de 1,5 cm'),
    },
    {
      ingredient: 'green-beans',
      quantity: 150,
      unit: 'g',
      note: t('cut in 2 cm lengths', 'tăiată bucăți de 2 cm'),
    },
    { ingredient: 'frozen-peas', quantity: 80, unit: 'g' },
    {
      ingredient: 'tomato',
      quantity: 200,
      unit: 'g',
      note: t('ripe, diced', 'coapte, tăiate cubulețe'),
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
      ingredient: 'lovage',
      quantity: 30,
      unit: 'g',
      note: t('finely chopped, to finish', 'tocat mărunt, la final'),
    },
    {
      ingredient: 'parsley',
      quantity: 20,
      unit: 'g',
      note: t('finely chopped, to finish', 'tocat mărunt, la final'),
    },
    {
      ingredient: 'salt',
      key: 'salt-stock',
      quantity: 15,
      unit: 'g',
      note: t('for the stock', 'pentru supă'),
    },
    {
      ingredient: 'salt',
      key: 'salt-end',
      quantity: 5,
      unit: 'g',
      note: t('to finish, adjust to taste', 'la final, ajustează după gust'),
    },
    {
      ingredient: 'sour-cream',
      quantity: 150,
      unit: 'g',
      optional: true,
      note: t('a spoonful in each bowl', 'câte o lingură în fiecare farfurie'),
    },
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
      key: 'start',
      text: t(
        'Put the beef (and the bones) in a 6 l pot. Cover with the 3 l of cold water. Wash your hands, the board and the knife with hot soapy water after touching the raw beef, and keep raw beef away from the vegetables.',
        'Pune carnea de vită (și oasele) într-o oală de 6 l. Acoperă cu cei 3 l de apă rece. După ce ai atins carnea crudă, spală-ți mâinile, tocătorul și cuțitul cu apă caldă și săpun și ține carnea crudă departe de legume.',
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
      key: 'stock',
      text: t(
        'Add the halved onion, peppercorns, bay leaves and 15 g salt. Partly cover and simmer very gently for 1 hour 50 minutes. The shank is ready when a fork slides into the thickest part with no resistance and the meat starts to fall apart. If it still springs back, simmer 20 minutes more.',
        'Adaugă ceapa tăiată în două, boabele de piper, foile de dafin și 15 g de sare. Acoperă pe jumătate și fierbe foarte domol 1 oră și 50 de minute. Fluierul e gata când furculița intră în partea cea mai groasă fără nicio împotrivire, iar carnea începe să se desfacă. Dacă încă revine elastic, mai lasă-l 20 de minute.',
      ),
      timerSeconds: 6600,
    },
    {
      key: 'prep-veg',
      text: t(
        'While the stock simmers, dice the carrot, parsley root, parsnip, celeriac, bell pepper and the 2 soup onions, the potatoes in 1.5 cm cubes, and cut the green beans. Keep the potatoes in cold water. Chop the tomatoes, lovage and parsley, and set them aside.',
        'În timp ce supa fierbe, taie cubulețe morcovul, rădăcina de pătrunjel, păstârnacul, țelina, ardeiul și cele 2 cepe pentru ciorbă, cartofii cuburi de 1,5 cm și fasolea verde bucăți. Ține cartofii în apă rece. Toacă roșiile, leușteanul și pătrunjelul și pune-le deoparte.',
      ),
    },
    {
      key: 'strain',
      text: t(
        'Lift the meat out onto a clean board (not the one the raw beef sat on) and pour the stock through a fine sieve into a bowl, discarding the bones, onion, peppercorns and bay. Wipe the pot. Cut the meat off any gristle and dice it into 2 cm pieces. Spoon the fat off the stock if you like.',
        'Scoate carnea pe un tocător curat (nu pe cel pe care a stat carnea crudă) și toarnă supa printr-o sită deasă într-un castron, aruncând oasele, ceapa, piperul și dafinul. Șterge oala. Curăță carnea de cartilaje și taie-o cubulețe de 2 cm. Dacă vrei, ia grăsimea de la suprafața supei.',
      ),
    },
    {
      key: 'sweat',
      text: t(
        'Heat the oil in the clean pot over medium heat. Add the soup onions, carrot, parsley root, parsnip, celeriac and bell pepper and cook for 10 minutes, stirring, until soft but not browned.',
        'Încinge uleiul în oala curată la foc mediu. Adaugă ceapa, morcovul, rădăcina de pătrunjel, păstârnacul, țelina și ardeiul și călește 10 minute, amestecând, până se înmoaie, fără să se rumenească.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'stock-back',
      text: t(
        'Pour the strained stock over the vegetables and bring to the boil, then lower to a steady simmer and cook for 10 minutes, until the vegetables are half tender.',
        'Toarnă supa strecurată peste legume și adu la fierbere, apoi scade la un clocot constant și fierbe 10 minute, până legumele sunt pe jumătate fierte.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'potatoes',
      text: t(
        'Drain the potatoes and add them with the green beans. Simmer for 15 minutes, until the potato cubes are tender when pierced. While they simmer, bring the borș to the boil in a small pan and keep it hot.',
        'Scurge cartofii și adaugă-i împreună cu fasolea verde. Fierbe 15 minute, până cuburile de cartof se înmoaie când le înțepi. În timp ce fierb, adu borșul la fiert într-o cratiță mică și ține-l fierbinte.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'peas',
      text: t(
        'Add the peas and tomatoes and simmer for 5 minutes, until the peas are tender and the tomato has softened.',
        'Adaugă mazărea și roșiile și fierbe 5 minute, până mazărea se înmoaie, iar roșiile s-au înmuiat.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'sour',
      text: t(
        'Return the meat to the pot. Pour in 500 ml of the boiled borș, bring to the boil and cook for 5 minutes. Taste, then add up to 200 ml more borș, a little at a time, until the soup is as sour as you like. Add the last 5 g salt if it needs it.',
        'Pune carnea la loc în oală. Toarnă 500 ml din borșul fiert, adu la fierbere și lasă 5 minute. Gustă, apoi adaugă treptat până la 200 ml de borș în plus, până e ciorba cât de acră îți place. Adaugă ultimele 5 g de sare dacă mai trebuie.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'finish',
      text: t(
        'Take the pot off the heat and stir in the lovage and parsley. Serve hot, with a spoonful of sour cream and a slice of fresh hot pepper at the table, if you like.',
        'Ia oala de pe foc și amestecă leușteanul și pătrunjelul. Servește fierbinte, cu o lingură de smântână și o felie de ardei iute proaspăt la masă, dacă vrei.',
      ),
    },
    {
      key: 'store',
      text: t(
        'Cool leftovers within 2 hours, in shallow containers, and keep them in the fridge for up to 3 days. Reheat until it boils.',
        'Răcește ciorba rămasă în cel mult 2 ore, în recipiente joase, și păstreaz-o la frigider până la 3 zile. Reîncălzește-o până dă în clocot.',
      ),
    },
  ],
  tips: [
    t(
      'Keep the stock at a lazy simmer, with a bubble breaking the surface now and then. A hard boil clouds the stock and toughens the meat.',
      'Ține supa la un clocot leneș, cu câte o bulă care sparge din când în când suprafața. Fierberea tare tulbură supa și întărește carnea.',
    ),
    t(
      'Add the borș a little at a time and taste after each pour: brands and homemade borș differ a lot in sourness. Start with about half a litre for 3 l of water.',
      'Adaugă borșul treptat și gustă după fiecare turnare: borșul diferă mult ca aciditate de la o marcă la alta și de la unul făcut în casă la altul. Pornește de la jumătate de litru la 3 l de apă.',
    ),
    t(
      'Make the stock a day ahead: cool it quickly, chill it, and the fat sets on top so it lifts off in one piece.',
      'Poți face supa cu o zi înainte: răcește-o repede, ține-o la rece, iar grăsimea se întărește deasupra și se ia dintr-o bucată.',
    ),
  ],
  stepTips: [
    {
      step: 'skim',
      text: t(
        'Skim before you add the salt and vegetables: the scum is easy to see and lift off a plain, clear liquid.',
        'Ia spuma înainte să pui sarea și legumele: se vede ușor și se ia ușor de pe un lichid limpede.',
      ),
    },
    {
      step: 'finish',
      text: t(
        'Lovage is strong and loses its freshness in a long boil, so add it off the heat. Taste for salt only at the end, after the borș, which carries its own salt in some brands.',
        'Leușteanul e puternic și își pierde prospețimea la fiert îndelungat, așa că pune-l după ce ai luat oala de pe foc. Potrivește sarea abia la final, după borș, care la unele mărci conține sare.',
      ),
    },
  ],
  nutritionNote: t(
    'Beef shank gives protein and plenty of vegetables add fibre, with little fat once the stock is skimmed (the oil is about half a tablespoon per bowl). The stock salt and some borș brands make it salty, so season at the end; sour cream adds saturated fat, and potato adds starchy carbohydrate.',
    'Fluierul de vită aduce proteine, iar legumele multe aduc fibre, cu puțină grăsime după ce supa e degresată (uleiul înseamnă cam jumătate de lingură pe porție). Sarea din supă și unele mărci de borș o fac sărată, așa că sărează la final; smântâna aduce grăsimi saturate, iar cartofii carbohidrați amidonoși.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Fresh bread', 'Pâine proaspătă'),
      reason: t(
        'A crusty slice soaks up the sour broth and gives the soft meat and vegetables something to bite against.',
        'O felie cu crustă se îmbibă cu supa acrișoară și oferă cărnii și legumelor moi un contrast la mestecat.',
      ),
      principle: 'contrast_texture',
      ingredient: 'bread',
    },
    {
      kind: 'food',
      label: t('Pickled hot peppers', 'Ardei iuți murați'),
      reason: t(
        'A bite of sharp, vinegary heat between spoonfuls refreshes the palate after the rich beef.',
        'O îmbucătură de ardei iute murat, acrișor și picant, între linguri împrospătează gustul după carnea de vită.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'pickled-peppers',
    },
    {
      kind: 'drink',
      label: t('Țuică before the meal', 'Țuică înainte de masă'),
      reason: t(
        'A small glass of plum brandy is a familiar Romanian way to start a meal, ahead of the soup.',
        'Un păhărel de țuică înainte de masă e un obicei cunoscut la masa românească, înainte de ciorbă.',
      ),
      principle: 'regional_tradition',
      ingredient: 'tuica',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot, sour beef soup with plenty of vegetables warms you through.',
        'O ciorbă fierbinte și acrișoară de vită, cu multe legume, te încălzește bine.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Protein from the beef, carbohydrate from the potato and plenty of warm liquid.',
        'Proteine din vită, carbohidrați din cartofi și multe lichide calde.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A large, salty bowl of meat soup can sit heavy before bed.',
        'Un castron mare de supă sărată cu carne poate cădea greu înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'ciorba-de-vacuta-georgian',
      cuisine: 'georgian',
      title: t(
        'Kharcho (Georgian beef soup with rice, walnuts and sour plum)',
        'Kharcho (supă georgiană de vită cu orez, nuci și sos de corcodușe)',
      ),
      servings: 6,
      prepMinutes: 25,
      cookMinutes: 175,
      difficulty: 'medium',
      hideBaseTips: [1],
      lines: [
        {
          ingredient: 'beef-brisket',
          quantity: 900,
          unit: 'g',
          note: t('on the bone if you can', 'cu os, dacă găsești'),
        },
        { ingredient: 'still-water', quantity: 2.5, unit: 'l' },
        {
          ingredient: 'bay-leaves',
          quantity: 1,
          unit: 'g',
          note: t('about 5 leaves', 'cam 5 foi'),
        },
        { ingredient: 'peppercorns', quantity: 5, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 3,
          unit: 'pcs',
          note: t('finely diced', 'tăiate mărunt'),
        },
        { ingredient: 'sunflower-oil', quantity: 50, unit: 'ml' },
        { ingredient: 'tomato-paste', quantity: 30, unit: 'g' },
        {
          ingredient: 'rice',
          quantity: 100,
          unit: 'g',
          note: t(
            'rinsed until the water runs clear',
            'spălat până apa iese limpede',
          ),
        },
        {
          ingredient: 'walnuts',
          quantity: 100,
          unit: 'g',
          note: t('shelled', 'curățate de coajă'),
        },
        {
          ingredient: 'garlic',
          quantity: 30,
          unit: 'g',
          note: t('about 6 cloves, peeled', 'cam 6 căței, curățați'),
        },
        {
          ingredient: 'garlic',
          key: 'garlic-finish',
          quantity: 10,
          unit: 'g',
          optional: true,
          note: t('crushed, to finish', 'zdrobit, la final'),
        },
        {
          ingredient: 'tkemali',
          quantity: 50,
          unit: 'ml',
          note: t(
            'sour plum sauce, first amount',
            'sos de corcodușe acre, prima cantitate',
          ),
        },
        {
          ingredient: 'tkemali',
          key: 'tkemali-extra',
          quantity: 50,
          unit: 'ml',
          optional: true,
          note: t('extra, added to taste', 'în plus, adăugat după gust'),
        },
        { ingredient: 'khmeli-suneli', quantity: 6, unit: 'g' },
        { ingredient: 'ground-coriander', quantity: 3, unit: 'g' },
        {
          ingredient: 'dried-red-chillies',
          quantity: 2,
          unit: 'g',
          note: t('crumbled', 'fărâmițat'),
        },
        {
          ingredient: 'coriander',
          quantity: 30,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        {
          ingredient: 'parsley',
          quantity: 20,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        {
          ingredient: 'salt',
          key: 'salt-stock',
          quantity: 10,
          unit: 'g',
          note: t('for the stock', 'pentru supă'),
        },
        {
          ingredient: 'salt',
          key: 'salt-walnuts',
          quantity: 3,
          unit: 'g',
          note: t('pounded with the walnuts', 'pisată cu nucile'),
        },
      ],
      steps: [
        {
          key: 'start',
          text: t(
            'Put the brisket in a 5 l pot with the 2.5 l of cold water. Bring slowly to the boil over medium-high heat, about 15 minutes, then turn down to a bare simmer. Wash your hands, the board and the knife with hot soapy water after touching the raw beef.',
            'Pune pieptul de vită într-o oală de 5 l cu cei 2,5 l de apă rece. Adu încet la fierbere la foc potrivit-mare, cam 15 minute, apoi scade focul la un clocot abia vizibil. După ce ai atins carnea crudă, spală-ți mâinile, tocătorul și cuțitul cu apă caldă și săpun.',
          ),
        },
        {
          key: 'skim',
          text: t(
            'Skim off the grey scum for the first 10 minutes, until little new scum rises.',
            'Ia spuma cenușie în primele 10 minute, până nu se mai adună spumă nouă.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'stock',
          text: t(
            'Add the bay leaves, peppercorns and 10 g salt. Partly cover and simmer very gently for 1 hour 35 minutes. The brisket is ready when a fork slides in with no resistance and the meat starts to fall apart; if it still springs back, give it 20 minutes more.',
            'Adaugă foile de dafin, boabele de piper și 10 g de sare. Acoperă pe jumătate și fierbe foarte domol 1 oră și 35 de minute. Pieptul e gata când furculița intră fără nicio împotrivire, iar carnea începe să se desfacă; dacă încă revine elastic, mai lasă-l 20 de minute.',
          ),
          timerSeconds: 5700,
        },
        {
          key: 'strain',
          text: t(
            'Lift the brisket onto a clean board, not the one the raw beef sat on. Strain the stock through a fine sieve into a bowl and wipe the pot. Cut the meat off the bone and gristle into 2 cm pieces. Spoon the fat off the stock if you like.',
            'Scoate pieptul pe un tocător curat, nu pe cel pe care a stat carnea crudă. Strecoară supa printr-o sită deasă într-un castron și șterge oala. Taie carnea de pe os și de pe cartilaje în bucăți de 2 cm. Dacă vrei, ia grăsimea de la suprafața supei.',
          ),
        },
        {
          key: 'onions',
          text: t(
            'Heat the oil in the pot over medium heat and cook the onions for 8 minutes, stirring, until soft and golden at the edges. Stir in the tomato paste and cook 1 minute more.',
            'Încinge uleiul în oală la foc mediu și călește ceapa 8 minute, amestecând, până se înmoaie și devine aurie pe margini. Adaugă pasta de roșii și mai amestecă 1 minut.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'rice',
          text: t(
            'Pour in the strained stock and bring to the boil. Add the rinsed rice, lower the heat and simmer for 15 minutes, stirring now and then so the rice does not stick, until the grains are tender.',
            'Toarnă supa strecurată și adu la fierbere. Adaugă orezul spălat, scade focul și fierbe 15 minute, amestecând din când în când ca să nu se lipească, până boabele se înmoaie.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'pound',
          text: t(
            'While the rice simmers, pound the walnuts with the 30 g garlic and 3 g salt in a mortar, or pulse them in a small food processor, to a rough, damp paste.',
            'Cât timp fierbe orezul, pisează nucile cu cele 30 g de usturoi și cu 3 g de sare într-un mojar sau macină-le scurt într-un robot mic, până obții o pastă grunjoasă și umedă.',
          ),
        },
        {
          key: 'season',
          text: t(
            'Stir the walnut paste, 50 ml of the tkemali, khmeli-suneli, ground coriander and chilli into the soup, then add the meat. Simmer for 5 minutes, until the soup thickens slightly, then taste and add up to 50 ml more tkemali until it is as sour as you like.',
            'Amestecă în supă pasta de nuci, 50 ml din sosul tkemali, khmeli-suneli, coriandrul măcinat și ardeiul iute, apoi adaugă carnea. Fierbe 5 minute, până ciorba se îngroașă ușor, apoi gustă și adaugă până la 50 ml de tkemali în plus, până e ciorba cât de acră îți place.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'finish',
          text: t(
            'Take the pot off the heat. Stir in the coriander, parsley and, if you like, the crushed raw garlic. Taste for salt and sourness, cover and let it rest for 10 minutes, until the flavours join.',
            'Ia oala de pe foc. Amestecă coriandrul, pătrunjelul și, dacă vrei, usturoiul crud zdrobit. Gustă de sare și de acreală, acoperă și lasă 10 minute, ca aromele să se lege.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'store',
          text: t(
            'Cool leftovers within 1 to 2 hours, because of the rice, and keep them in the fridge. Eat them within 1 day and reheat once, until it boils. The soup thickens as it stands, so loosen it with a little hot water.',
            'Răcește ciorba rămasă în 1-2 ore, din cauza orezului, și păstreaz-o la frigider. Mănânc-o în cel mult 1 zi și reîncălzește-o o singură dată, până dă în clocot. Ciorba se îngroașă în repaus, așa că subțiaz-o cu puțină apă fierbinte.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'pound',
          text: t(
            'The salt helps the garlic break down into a paste instead of skidding about the mortar.',
            'Sarea ajută usturoiul să se facă pastă, în loc să sară prin mojar.',
          ),
        },
        {
          step: 'season',
          text: t(
            'Keep it at a gentle simmer: the walnut paste can catch on the bottom of the pot if it boils hard.',
            'Ține supa la un clocot domol: pasta de nuci se poate lipi de fundul oalei dacă fierbe tare.',
          ),
        },
      ],
      nutritionNote: t(
        'Beef gives protein, and walnuts add mostly unsaturated fat and some fibre, but they make the soup richer and higher in calories than a clear broth. Rice brings carbohydrate, and the stock salt plus tkemali make it salty, so taste before adding more. Brisket is a fattier cut: skim the fat off.',
        'Vita aduce proteine, iar nucile adaugă grăsimi în mare parte nesaturate și ceva fibre, dar fac supa mai bogată și mai calorică decât o supă limpede. Orezul aduce carbohidrați, iar sarea din supă și sosul tkemali o fac sărată, așa că gustă înainte să mai pui. Pieptul e o bucată mai grasă: ia grăsimea de deasupra.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Fresh bread', 'Pâine proaspătă'),
          reason: t(
            'A crusty slice gives a chewy contrast to the thick, soft soup and mops up the walnut broth.',
            'O felie cu crustă oferă un contrast la mestecat față de supa groasă și moale și adună supa cu nuci.',
          ),
          principle: 'contrast_texture',
          ingredient: 'bread',
        },
        {
          kind: 'drink',
          label: t('Dry red wine', 'Vin roșu sec'),
          reason: t(
            'A dry red has the body to stand next to the beef and the walnuts, and its tannins cut through the richness.',
            'Un vin roșu sec are corp pentru carnea de vită și nuci, iar taninurile lui taie din bogăția supei.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'red-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A thick, spiced beef and rice soup that warms you from the inside.',
            'O supă groasă și condimentată, cu vită și orez, care te încălzește pe dinăuntru.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Rich, salty and filling with the walnuts and rice, which can sit heavy before bed.',
            'Bogată, sărată și săturătoare din cauza nucilor și a orezului, poate cădea greu înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'ciorba-de-vacuta-vietnamese',
      cuisine: 'vietnamese',
      title: t(
        'Phở bò (Vietnamese beef noodle soup)',
        'Phở bò (supă vietnameză de vită cu tăiței de orez)',
      ),
      servings: 4,
      prepMinutes: 30,
      cookMinutes: 265,
      difficulty: 'hard',
      hideBaseTips: [1],
      lines: [
        {
          ingredient: 'beef-soup-bones',
          quantity: 1000,
          unit: 'g',
          note: t('marrow and knuckle bones', 'oase cu măduvă și articulații'),
        },
        {
          ingredient: 'beef-brisket',
          quantity: 400,
          unit: 'g',
          note: t('in one piece', 'într-o bucată'),
        },
        {
          ingredient: 'still-water',
          key: 'water-blanch',
          quantity: 2,
          unit: 'l',
          note: t('to blanch the bones', 'pentru opărit oasele'),
        },
        {
          ingredient: 'still-water',
          key: 'water-broth',
          quantity: 3,
          unit: 'l',
          note: t('fresh, for the broth', 'proaspătă, pentru supă'),
        },
        {
          ingredient: 'onion',
          key: 'onion-charred',
          quantity: 2,
          unit: 'pcs',
          note: t('large, unpeeled, to char', 'mari, necurățate, de pârlit'),
        },
        {
          ingredient: 'ginger',
          quantity: 80,
          unit: 'g',
          note: t(
            'a 7 cm piece, unpeeled, to char',
            'o bucată de 7 cm, necurățată, de pârlit',
          ),
        },
        {
          ingredient: 'star-anise',
          quantity: 3,
          unit: 'g',
          note: t('about 4 pods', 'cam 4 stele'),
        },
        {
          ingredient: 'cinnamon-sticks',
          quantity: 5,
          unit: 'g',
          note: t('1 stick', '1 baton'),
        },
        {
          ingredient: 'cloves',
          quantity: 1,
          unit: 'g',
          note: t('about 4', 'cam 4'),
        },
        { ingredient: 'coriander-seeds', quantity: 5, unit: 'g' },
        { ingredient: 'fish-sauce', quantity: 60, unit: 'ml' },
        { ingredient: 'rock-sugar', quantity: 25, unit: 'g' },
        {
          ingredient: 'salt',
          quantity: 10,
          unit: 'g',
          note: t('adjust to taste', 'ajustează după gust'),
        },
        {
          ingredient: 'rice-noodles',
          quantity: 300,
          unit: 'g',
          note: t(
            'flat, dried, 3 to 5 mm wide (bánh phở)',
            'late, uscate, de 3-5 mm (bánh phở)',
          ),
        },
        {
          ingredient: 'onion',
          key: 'onion-bowls',
          quantity: 0.5,
          unit: 'pcs',
          note: t('sliced paper-thin', 'tăiată foarte subțire'),
        },
        {
          ingredient: 'spring-onion',
          quantity: 40,
          unit: 'g',
          note: t('thinly sliced', 'tăiată rondele subțiri'),
        },
        {
          ingredient: 'coriander',
          quantity: 20,
          unit: 'g',
          note: t('roughly chopped', 'tocat grosier'),
        },
        {
          ingredient: 'thai-basil',
          quantity: 20,
          unit: 'g',
          note: t('leaves, for the table', 'frunze, pentru masă'),
        },
        {
          ingredient: 'bean-sprouts',
          quantity: 200,
          unit: 'g',
          note: t('for the table', 'pentru masă'),
        },
        {
          ingredient: 'lime',
          quantity: 2,
          unit: 'pcs',
          note: t('in wedges', 'felii'),
        },
        {
          ingredient: 'birds-eye-chilli',
          quantity: 2,
          unit: 'pcs',
          note: t('sliced, for the table', 'tăiat rondele, pentru masă'),
        },
        {
          ingredient: 'hoisin-sauce',
          quantity: 40,
          unit: 'ml',
          optional: true,
          note: t('for the table', 'pentru masă'),
        },
        {
          ingredient: 'sriracha',
          quantity: 20,
          unit: 'ml',
          optional: true,
          note: t('for the table', 'pentru masă'),
        },
      ],
      steps: [
        {
          key: 'grill',
          text: t(
            'Heat the grill to its highest setting for 5 minutes, with the rack about 10 cm from the element.',
            'Încinge grillul la maximum 5 minute, cu grătarul la cam 10 cm de rezistență.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'char',
          text: t(
            'Put the unpeeled onions and ginger on a foil-lined tray under the grill, and stay in the kitchen. Turn them every 5 minutes for about 15 minutes, until blackened in patches and the onions give when squeezed with tongs. If the ginger is done first, take it off. Over a gas flame, hold them with tongs and keep the extractor on and loose cloths away.',
            'Pune ceapa și ghimbirul necurățate pe o tavă tapetată cu folie sub grill și rămâi în bucătărie. Întoarce-le la fiecare 5 minute, cam 15 minute, până se înnegresc în pete, iar ceapa cedează când o strângi cu cleștele. Dacă ghimbirul e gata mai repede, scoate-l. Dacă le pârlești pe flacără de gaz, ține-le cu cleștele, cu hota pornită și departe de cârpe.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'peel',
          text: t(
            'Let them cool until you can handle them, then peel off the charred skin and rinse away loose ash. Halve the onions and bruise the ginger with the flat of a knife.',
            'Lasă-le să se răcească până le poți ține în mână, apoi curăță coaja arsă și clătește cenușa de pe ele. Taie ceapa în două și strivește ghimbirul cu partea lată a cuțitului.',
          ),
        },
        {
          key: 'boil-blanch',
          text: t(
            'Bring the 2 l of blanching water to a rolling boil in a large pot, about 12 minutes.',
            'Adu cei 2 l de apă pentru opărit la fierbere puternică într-o oală mare, cam 12 minute.',
          ),
        },
        {
          key: 'blanch',
          text: t(
            'Add the bones and the brisket and boil hard for 5 minutes, until a grey scum rises.',
            'Adaugă oasele și pieptul și fierbe tare 5 minute, până se adună o spumă cenușie.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'rinse',
          text: t(
            'Drain into a colander in the sink and rinse the bones and brisket under running water, picking off any clinging scum. Scrub the pot clean. Wash the sink with hot soapy water afterwards. Then wash your hands, the board and the knife with hot soapy water, since the brisket is still raw inside.',
            'Scurge într-o strecurătoare în chiuvetă și clătește oasele și pieptul sub jet de apă, luând spuma rămasă. Spală bine oala. Apoi spală chiuveta cu apă caldă și săpun. După aceea spală-ți mâinile, tocătorul și cuțitul cu apă caldă și săpun, pentru că pieptul e încă crud pe dinăuntru.',
          ),
        },
        {
          key: 'toast',
          text: t(
            'Toast the star anise, cinnamon, cloves and coriander seeds in a dry pan over medium heat for about 1 to 2 minutes, shaking, until they smell fragrant. Do not let them blacken.',
            'Prăjește anasonul stelat, scorțișoara, cuișoarele și semințele de coriandru într-o tigaie uscată la foc mediu, cam 1-2 minute, scuturând tigaia, până miros plăcut. Nu le lăsa să se înnegrească.',
          ),
          timerSeconds: 90,
        },
        {
          key: 'broth',
          text: t(
            'Put the bones, brisket, charred onion, ginger and toasted spices into the clean pot with the 3 l of fresh cold water. Bring to the boil, about 12 minutes, then lower the heat until the surface barely bubbles, and skim any foam.',
            'Pune oasele, pieptul, ceapa și ghimbirul pârlite și condimentele prăjite în oala curată, cu cei 3 l de apă proaspătă și rece. Adu la fierbere, cam 12 minute, apoi scade focul până suprafața abia bolborosește și ia spuma.',
          ),
        },
        {
          key: 'simmer-one',
          text: t(
            'Simmer, partly covered, for 1 hour 30 minutes.',
            'Fierbe, acoperit pe jumătate, 1 oră și 30 de minute.',
          ),
          timerSeconds: 5400,
        },
        {
          key: 'lift-brisket',
          text: t(
            'Test the brisket: a knife should slide in with little resistance. If it is still firm, simmer 15 minutes more and test again. Lift it out, rinse it briefly under cold water, cover it and refrigerate while the broth finishes. Cooked brisket must be in the fridge within 2 hours.',
            'Verifică pieptul: cuțitul trebuie să intre aproape fără împotrivire. Dacă e încă tare, mai fierbe 15 minute și verifică din nou. Scoate-l, clătește-l scurt cu apă rece, acoperă-l și pune-l la frigider cât timp se termină supa. Pieptul fiert trebuie băgat la frigider în cel mult 2 ore.',
          ),
        },
        {
          key: 'simmer-two',
          text: t(
            'Keep the broth at a barely bubbling simmer for another 1 hour 30 minutes, topping up with a little hot water only if it drops below the bones.',
            'Ține supa la un clocot abia vizibil încă 1 oră și 30 de minute, completând cu puțină apă fierbinte doar dacă scade sub nivelul oaselor.',
          ),
          timerSeconds: 5400,
        },
        {
          key: 'season',
          text: t(
            'Strain the broth through a fine sieve into a clean pot and discard the bones, onion and spices. Skim the fat from the top. Stir in two-thirds of the fish sauce and rock sugar, taste, then add the rest and the salt as needed: it should be savoury, lightly sweet and clear. Keep it hot.',
            'Strecoară supa printr-o sită deasă într-o oală curată și aruncă oasele, ceapa și condimentele. Ia grăsimea de la suprafață. Amestecă două treimi din sosul de pește și din zahărul candel, gustă, apoi adaugă restul și sarea, după nevoie: supa trebuie să fie bine gustată, sărată-dulce și limpede. Ține-o fierbinte.',
          ),
        },
        {
          key: 'noodles',
          text: t(
            'Cook the rice noodles in a separate pot of boiling water as the pack says (most take about 3 to 5 minutes), until tender but still springy. Drain, rinse under cold water and divide among 4 bowls.',
            'Fierbe tăițeii de orez într-o oală separată cu apă clocotită, așa cum scrie pe ambalaj (cei mai mulți vor cam 3-5 minute), până se înmoaie, dar rămân elastici. Scurge-i, clătește-i cu apă rece și împarte-i în 4 boluri.',
          ),
        },
        {
          key: 'bowls',
          text: t(
            'Slice the cold brisket thinly against the grain and lay it over the noodles with the paper-thin onion (rinsed in cold water), spring onion and coriander. Bring the broth to a rolling boil and ladle it over so the brisket heats through and steams.',
            'Feliază pieptul rece subțire, pe contrafibră, și așază-l peste tăiței împreună cu ceapa tăiată foarte subțire (clătită cu apă rece), ceapa verde și coriandrul. Adu supa la fierbere puternică și toarnă-o peste, ca pieptul să se încălzească și să scoată aburi.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Serve straight away with the basil, bean sprouts, lime wedges and chilli on a plate for everyone to add, plus hoisin and sriracha if you like. Children, older people, anyone pregnant or with a weak immune system should have the sprouts boiled in the pot of broth for about 1 minute, until steaming hot throughout, or left out.',
            'Servește imediat, cu busuiocul, germenii, felii de lime și ardeiul iute pe o farfurie, ca fiecare să-și pună singur, plus hoisin și sriracha dacă vrei. Pentru copii, vârstnici, femei însărcinate și persoane cu imunitate scăzută, fierbe germenii în oala cu supă cam 1 minut, până sunt fierbinți de tot, sau nu-i pune deloc.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Cool leftover broth within 2 hours and keep it in the fridge for up to 3 days, reheating until it boils. Store noodles and brisket separately and eat them within 1 day; reheat the noodles once, until steaming.',
            'Răcește supa rămasă în cel mult 2 ore și păstrează-o la frigider până la 3 zile, reîncălzind-o până dă în clocot. Păstrează tăițeii și pieptul separat și mănâncă-le în cel mult 1 zi; reîncălzește tăițeii o singură dată, până scot aburi.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'char',
          text: t(
            'Leave some black patches: they give the broth its sweet, smoky note. Rinse off loose ash so the broth stays clear.',
            'Lasă câteva pete negre: dau supei nota dulce și afumată. Clătește cenușa desprinsă, ca supa să rămână limpede.',
          ),
        },
        {
          step: 'bowls',
          text: t(
            'Warm the bowls with hot water first so the broth stays hot to the last spoonful.',
            'Încălzește bolurile cu apă fierbinte înainte, ca supa să rămână fierbinte până la ultima lingură.',
          ),
        },
      ],
      nutritionNote: t(
        'A clear, light-tasting broth with brisket for protein (a fattier cut, so skim the broth) and fresh herbs and lime for freshness, but the rice noodles are mostly starchy carbohydrate and the fish sauce, hoisin and salt make it salty. The sprouts add crunch, not much else; skim the fat if you want it lighter.',
        'O supă limpede, ușoară la gust, cu piept de vită pentru proteine (o bucată mai grasă, așa că degresează supa) și ierburi proaspete și lime pentru prospețime, dar tăițeii de orez sunt mai ales carbohidrați amidonoși, iar sosul de pește, hoisin și sarea o fac sărată. Germenii adaugă crocant, nu prea mult altceva; ia grăsimea de deasupra dacă o vrei mai ușoară.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Plain hot tea', 'Ceai cald, simplu'),
          reason: t(
            'Its mild bitterness refreshes the palate between spoonfuls of the rich, savoury broth.',
            'Amăreala lui ușoară împrospătează gustul între lingurile de supă bogată, sărată și aromată.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Hot, fragrant broth and noodles warm you through.',
            'Supa fierbinte și parfumată, cu tăiței, te încălzește bine.',
          ),
        },
        {
          moment: 'morning',
          polarity: 'good_for',
          reason: t(
            'Phở is a common breakfast in Vietnam: warm, filling and not heavy on fat once skimmed.',
            'Phở este un mic dejun obișnuit în Vietnam: cald, săturător și nu prea gras, după ce e degresat.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from the beef, carbohydrate from the noodles and warm liquid to rehydrate.',
            'Proteine din vită, carbohidrați din tăiței și lichid cald pentru rehidratare.',
          ),
        },
      ],
    },
  ],
};
