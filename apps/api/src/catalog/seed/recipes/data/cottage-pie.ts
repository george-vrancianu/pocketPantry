import { t, type BaseRecipeSeed, type StepSeed } from '../recipe-seed-types';

// The Cottage pie base is the British beef-mince pie under mashed potato. Each
// Variant is a full Recipe with its own lines, steps and guidance; the base's
// Recipe-level Tips are inherited, except the ones a Variant hides.

// Cooling, storage and reheating are the same for all three pies.
const storeStep: StepSeed = {
  key: 'store',
  text: t(
    'Within 2 hours of baking, spoon any leftovers into shallow containers, let them cool for a few minutes, then chill. Keep in the fridge for up to 3 days, or freeze in portions. Reheat a portion only once, until steaming hot with the centre at 75 °C.',
    'În cel mult 2 ore după coacere, pune resturile în recipiente puțin adânci, lasă-le câteva minute să se răcească, apoi dă-le la frigider. Se păstrează la frigider până la 3 zile sau la congelator, în porții. Reîncălzește o porție o singură dată, până scoate abur și centrul ajunge la 75 °C.',
  ),
};

export const cottagePie: BaseRecipeSeed = {
  slug: 'cottage-pie',
  title: t(
    'Cottage pie',
    'Cottage pie (plăcintă britanică de carne tocată sub piure de cartofi)',
  ),
  servings: 6,
  prepMinutes: 30,
  cookMinutes: 95,
  difficulty: 'easy',
  lines: [
    { ingredient: 'sunflower-oil', quantity: 30, unit: 'ml' },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('finely chopped', 'tocate mărunt'),
    },
    {
      ingredient: 'carrot',
      quantity: 200,
      unit: 'g',
      note: t('diced small', 'tăiați cubulețe mici'),
    },
    {
      ingredient: 'celery',
      quantity: 100,
      unit: 'g',
      optional: true,
      note: t('diced small', 'tăiată cubulețe mici'),
    },
    {
      ingredient: 'garlic',
      quantity: 10,
      unit: 'g',
      optional: true,
      note: t('crushed', 'zdrobit'),
    },
    { ingredient: 'minced-beef', quantity: 750, unit: 'g' },
    { ingredient: 'tomato-paste', quantity: 30, unit: 'g' },
    { ingredient: 'flour', quantity: 25, unit: 'g' },
    { ingredient: 'beef-stock', quantity: 400, unit: 'ml' },
    { ingredient: 'worcestershire-sauce', quantity: 30, unit: 'ml' },
    {
      ingredient: 'thyme',
      quantity: 4,
      unit: 'g',
      note: t('a few sprigs', 'câteva crengi'),
    },
    {
      ingredient: 'bay-leaves',
      quantity: 0.4,
      unit: 'g',
      note: t('2 leaves', '2 foi'),
    },
    {
      ingredient: 'frozen-peas',
      quantity: 150,
      unit: 'g',
      optional: true,
    },
    {
      ingredient: 'potato',
      quantity: 1200,
      unit: 'g',
      note: t('floury, peeled', 'făinoși, curățați'),
    },
    { ingredient: 'butter', quantity: 60, unit: 'g' },
    { ingredient: 'milk', quantity: 100, unit: 'ml' },
    {
      ingredient: 'cheddar',
      quantity: 60,
      unit: 'g',
      optional: true,
      note: t('grated', 'ras'),
    },
    { ingredient: 'salt', key: 'salt-meat', quantity: 5, unit: 'g' },
    { ingredient: 'salt', key: 'salt-water', quantity: 4, unit: 'g' },
    { ingredient: 'salt', key: 'salt-mash', quantity: 3, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
  ],
  steps: [
    {
      key: 'veg',
      text: t(
        'Chop the onions, carrot and celery into small, even pieces and crush the garlic.',
        'Taie ceapa, morcovii și țelina pai în bucăți mici și egale și zdrobește usturoiul.',
      ),
    },
    {
      key: 'potato-prep',
      text: t(
        'Peel the potatoes and cut them into pieces of about 3 cm. Keep them in cold water until you need them.',
        'Curăță cartofii și taie-i în bucăți de aproximativ 3 cm. Ține-i în apă rece până îi folosești.',
      ),
    },
    {
      key: 'brown',
      text: t(
        'Heat 15 ml of the oil in a wide, deep pan over high heat. Add half the mince and 2.5 g of the salt, break it up with a wooden spoon and cook for 4 to 5 minutes, until no pink is left, the juices run clear and the meat starts to colour. Move it to a clean plate and repeat with the rest of the mince and salt.',
        'Încinge 15 ml din ulei într-o tigaie lată și adâncă la foc iute. Adaugă jumătate din carnea tocată și 2,5 g din sare, sfărâm-o cu o lingură de lemn și gătește 4-5 minute, până nu mai rămâne nimic roz, zeama iese limpede, iar carnea începe să capete culoare. Mut-o pe o farfurie curată și repetă cu restul de carne și de sare.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'soften',
      text: t(
        'Lower the heat to medium and add the remaining oil, then the onions, carrot and celery. Cook for 8 minutes, stirring now and then, until the onion is soft and translucent.',
        'Redu focul la mediu și adaugă uleiul rămas, apoi ceapa, morcovii și țelina pai. Gătește 8 minute, amestecând din când în când, până când ceapa se înmoaie și devine translucidă.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'paste',
      text: t(
        'Return the mince to the pan with its juices. Stir in the garlic, tomato paste and flour and cook for 2 minutes, stirring, until the paste darkens a shade and no dry flour is visible.',
        'Pune carnea înapoi în tigaie, cu zeama ei. Adaugă usturoiul, pasta de roșii și făina și gătește 2 minute, amestecând, până când pasta se închide puțin la culoare și nu se mai vede făină uscată.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'gravy',
      text: t(
        'Pour in the stock and Worcestershire sauce, add the thyme, bay leaves and half the pepper, and bring to the boil, stirring.',
        'Toarnă supa de vită și sosul Worcestershire, adaugă cimbrișorul, foile de dafin și jumătate din piper și adu la fierbere, amestecând.',
      ),
    },
    {
      key: 'simmer',
      text: t(
        'Lower the heat and simmer uncovered for 25 minutes, stirring now and then, until the gravy is thick enough to coat the back of a spoon.',
        'Redu focul și fierbe la foc mic, fără capac, 25 de minute, amestecând din când în când, până când sosul e destul de gros cât să acopere dosul lingurii.',
      ),
      timerSeconds: 1500,
    },
    {
      key: 'preheat',
      text: t(
        'While the gravy simmers, heat the oven to 200 °C (180 °C fan) with a rack in the middle (about 15 minutes).',
        'În timp ce sosul fierbe, încălzește cuptorul la 200 °C (180 °C cu ventilator), cu grătarul la mijloc (aproximativ 15 minute).',
      ),
    },
    {
      key: 'potatoes',
      text: t(
        'While the gravy simmers, lift the potatoes out of their water into a pot, cover them with just-boiled water from the kettle, add 4 g of salt and bring back to the boil. Simmer for 15 minutes, until a knife slides in with no resistance.',
        'În timp ce sosul fierbe, scoate cartofii din apa în care au stat și pune-i într-o oală, acoperă-i cu apă fiartă proaspăt din fierbător, adaugă 4 g de sare și adu din nou la fierbere. Fierbe 15 minute, până când un cuțit intră fără rezistență.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'drain',
      text: t(
        'Drain the potatoes well and leave them in the hot pot, off the heat, until the steam stops rising.',
        'Scurge bine cartofii și lasă-i în oala fierbinte, luată de pe foc, până nu mai iese abur.',
      ),
    },
    {
      key: 'warm-milk',
      text: t(
        'Warm the milk with the butter in a small pan until the butter has melted.',
        'Încălzește laptele cu untul într-o cratiță mică, până se topește untul.',
      ),
    },
    {
      key: 'mash',
      text: t(
        'Mash the potatoes, pour in the warm milk and butter, add the remaining pepper and the 3 g of salt and stir until smooth and stiff enough to hold a ridge.',
        'Pasează cartofii, toarnă laptele cald cu unt, adaugă restul de piper și cele 3 g de sare și amestecă până obții un piure fin, destul de ferm cât să țină dungi.',
      ),
    },
    {
      key: 'peas',
      text: t(
        'Fish out the thyme stalks and bay leaves, stir the peas into the gravy and cook for 3 minutes. Taste and add salt if needed.',
        'Scoate crenguțele de cimbrișor și foile de dafin, amestecă mazărea în sos și gătește 3 minute. Gustă și adaugă sare dacă e nevoie.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'assemble',
      text: t(
        'Spoon the meat into a 3 litre (about 30 x 22 cm) baking dish. Spread the mash over it from the edges inward, so it seals against the dish. Rake the top with a fork into ridges and scatter over the cheddar.',
        'Pune carnea cu sos într-o tavă de copt de 3 litri (aproximativ 30 x 22 cm). Întinde piureul peste ea dinspre margini spre centru, ca să se lipească de tavă. Trasează dungi pe suprafață cu furculița și presară cheddarul.',
      ),
    },
    {
      key: 'bake',
      text: t(
        'Bake for 25 to 30 minutes, until the gravy bubbles up at the edges, the top is browned and the centre reads at least 75 °C on a food thermometer. The pie must be hot all the way through.',
        'Coace 25-30 de minute, până când sosul clocotește pe margini, suprafața se rumenește, iar centrul arată cel puțin 75 °C la termometrul de alimente. Plăcinta trebuie să fie fierbinte în tot miezul.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'rest',
      text: t(
        'Rest the pie for 10 minutes before serving, so the gravy settles and the portions hold their shape.',
        'Lasă plăcinta să stea 10 minute înainte de servire, ca sosul să se așeze, iar porțiile să-și păstreze forma.',
      ),
      timerSeconds: 600,
    },
    storeStep,
  ],
  tips: [
    t(
      'Give the mince room and a hot pan. If it sits in its own juices it steams and turns grey, and you lose the browned flavour that gives the filling its depth.',
      'Dă-i cărnii tocate loc și o tigaie fierbinte. Dacă stă în propriul suc, se fierbe și devine cenușie, iar umplutura pierde aroma de rumenit care îi dă profunzime.',
    ),
    t(
      'Spread the mash while the filling is still hot and take it right to the edges: it seals the pie, and the ridges you rake in are what brown and crisp.',
      'Întinde piureul cât umplutura e încă fierbinte și ajunge cu el până la margini: sigilează plăcinta, iar dungile trasate sunt cele care se rumenesc și devin crocante.',
    ),
    t(
      'Make the gravy thick, not runny. A thin gravy rises through the mash as it bakes and the topping sinks.',
      'Fă sosul gros, nu apos. Un sos subțire iese prin piure în timpul coacerii, iar piureul se scufundă.',
    ),
  ],
  stepTips: [
    {
      step: 'drain',
      text: t(
        'Let the potatoes steam dry. Wet potatoes make a watery, gluey mash that slumps into the filling.',
        'Lasă cartofii să se zvânte în abur. Cartofii umezi dau un piure apos și lipicios, care se scufundă în umplutură.',
      ),
    },
    {
      step: 'simmer',
      text: t(
        'Worcestershire sauce and the stock are salty and the gravy reduces, so taste at the end before adding more salt.',
        'Sosul Worcestershire și supa sunt sărate, iar sosul se reduce, așa că gustă la final înainte să mai adaugi sare.',
      ),
    },
  ],
  nutritionNote: t(
    'Filling, a good source of protein and some iron from the beef, with some fibre and vitamins from the carrot, celery and peas. The beef, butter and cheddar add saturated fat, and the stock, Worcestershire sauce and cheese add salt; the mash is mostly starchy carbohydrate, so serve the pie with a green vegetable.',
    'Săturătoare, o sursă bună de proteine și ceva fier din carnea de vită, cu fibre și vitamine din morcov, țelină pai și mazăre. Carnea, untul și cheddarul aduc grăsimi saturate, iar supa, sosul Worcestershire și brânza aduc sare; piureul este în mare parte carbohidrați amidonoși, așa că servește plăcinta cu o legumă verde.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Buttered green beans', 'Fasole verde cu unt'),
      reason: t(
        'Crisp-tender beans give a bite and some freshness against the soft mash and rich gravy.',
        'Fasolea verde fragedă, dar crocantă, aduce textură și prospețime lângă piureul moale și sosul bogat.',
      ),
      principle: 'contrast_texture',
      ingredient: 'green-beans',
    },
    {
      kind: 'food',
      label: t('Buttered cabbage', 'Varză albă cu unt'),
      reason: t(
        'Lightly cooked cabbage adds a slightly sharp, green note that refreshes the palate between rich bites.',
        'Varza gătită ușor adaugă o notă verde, puțin ascuțită, care împrospătează gustul între îmbucăturile bogate.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'cabbage',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sharp acidity lifts a heavy, savoury pie.',
        'Aciditatea lor puternică înviorează o plăcintă grea și savuroasă.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'drink',
      label: t('Beer', 'Bere'),
      reason: t(
        'Its bitterness and bubbles refresh the palate between bites of gravy and mash.',
        'Amăreala și bulele ei împrospătează gustul între îmbucăturile de sos și piure.',
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
        'A hot, filling pie that warms you up.',
        'O plăcintă fierbinte și săturătoare, care te încălzește.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Protein from the beef and carbohydrates from the potato help you refuel.',
        'Proteinele din carne și carbohidrații din cartofi te ajută să-ți refaci energia.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'A heavy meal of meat, butter and mash sits long in the stomach.',
        'O masă grea de carne, unt și piure stă mult în stomac.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'Hot and heavy, and it needs the oven on for over an hour.',
        'Fierbinte și grea, iar cuptorul trebuie ținut aprins peste o oră.',
      ),
    },
  ],
  variants: [
    {
      slug: 'cottage-pie-french',
      cuisine: 'french',
      title: t(
        'Hachis Parmentier (French beef and potato gratin)',
        'Hachis Parmentier (gratin franțuzesc de carne tocată și piure)',
      ),
      servings: 6,
      prepMinutes: 20,
      cookMinutes: 60,
      difficulty: 'easy',
      hideBaseTips: [2],
      lines: [
        { ingredient: 'minced-beef', quantity: 700, unit: 'g' },
        {
          ingredient: 'shallot',
          quantity: 100,
          unit: 'g',
          note: t('finely chopped', 'tocată mărunt'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t('crushed', 'zdrobit'),
        },
        {
          ingredient: 'parsley',
          quantity: 30,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        { ingredient: 'tomato-paste', quantity: 15, unit: 'g', optional: true },
        { ingredient: 'still-water', quantity: 80, unit: 'ml' },
        { ingredient: 'butter', key: 'butter-meat', quantity: 20, unit: 'g' },
        {
          ingredient: 'potato',
          quantity: 1200,
          unit: 'g',
          note: t('floury, peeled', 'făinoși, curățați'),
        },
        { ingredient: 'butter', key: 'butter-mash', quantity: 60, unit: 'g' },
        { ingredient: 'milk', quantity: 150, unit: 'ml' },
        {
          ingredient: 'eggs',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'yolks only; keep the whites for another use',
            'doar gălbenușurile; albușurile le poți folosi în altă rețetă',
          ),
        },
        { ingredient: 'nutmeg', quantity: 0.5, unit: 'g' },
        {
          ingredient: 'gruyere',
          quantity: 80,
          unit: 'g',
          note: t('grated', 'ras'),
        },
        { ingredient: 'breadcrumbs', quantity: 20, unit: 'g', optional: true },
        {
          ingredient: 'butter',
          key: 'butter-dish',
          quantity: 5,
          unit: 'g',
          note: t('for greasing the dish', 'pentru uns tava'),
        },
        {
          ingredient: 'butter',
          key: 'butter-top',
          quantity: 15,
          unit: 'g',
          note: t('in small flakes', 'în fulgi mici'),
        },
        { ingredient: 'salt', key: 'salt-meat', quantity: 4, unit: 'g' },
        { ingredient: 'salt', key: 'salt-water', quantity: 3, unit: 'g' },
        { ingredient: 'salt', key: 'salt-mash', quantity: 3, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
      ],
      steps: [
        {
          key: 'potato-prep',
          text: t(
            'Peel the potatoes and cut them into pieces of about 3 cm. Chop the shallot and parsley and crush the garlic.',
            'Curăță cartofii și taie-i în bucăți de aproximativ 3 cm. Toacă șalota și pătrunjelul și zdrobește usturoiul.',
          ),
        },
        {
          key: 'potatoes',
          text: t(
            'Put the potatoes in a pot, cover them with just-boiled water from the kettle, add 3 g of salt and bring back to the boil. Simmer for 15 minutes, until a knife slides in with no resistance. Cook the meat while they simmer.',
            'Pune cartofii într-o oală, acoperă-i cu apă fiartă proaspăt din fierbător, adaugă 3 g de sare și adu din nou la fierbere. Fierbe 15 minute, până când un cuțit intră fără rezistență. Gătește carnea cât timp fierb cartofii.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 200 °C (180 °C fan) with a rack in the upper third (about 15 minutes).',
            'Încălzește cuptorul la 200 °C (180 °C cu ventilator), cu grătarul în treimea de sus (aproximativ 15 minute).',
          ),
        },
        {
          key: 'soften',
          text: t(
            'Melt the 20 g of butter in a wide pan over medium heat, add the shallot and cook for 4 minutes, until soft but not coloured.',
            'Topește cele 20 g de unt într-o tigaie lată la foc mediu, adaugă șalota și gătește 4 minute, până se înmoaie, fără să se rumenească.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'brown',
          text: t(
            'Turn the heat up, add the mince and 4 g of the salt and break it up with a wooden spoon. Cook for 8 minutes, until no pink is left, the juices run clear and the meat is lightly browned.',
            'Mărește focul, adaugă carnea tocată și 4 g din sare și sfărâm-o cu o lingură de lemn. Gătește 8 minute, până nu mai rămâne nimic roz, zeama iese limpede, iar carnea e ușor rumenită.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'garlic',
          text: t(
            'Stir in the garlic, the tomato paste if using, and half the pepper and cook for 1 minute.',
            'Adaugă usturoiul, pasta de roșii, dacă o folosești, și jumătate din piper și gătește 1 minut.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'moisten',
          text: t(
            'Add the water and simmer for 5 minutes, until the meat is moist but no liquid pools in the pan.',
            'Adaugă apa și fierbe 5 minute, până când carnea e suculentă, dar nu rămâne lichid în tigaie.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'parsley',
          text: t(
            'Stir in the parsley, taste and add salt if needed. Take the pan off the heat.',
            'Amestecă pătrunjelul, gustă și adaugă sare dacă e nevoie. Dă tigaia de pe foc.',
          ),
        },
        {
          key: 'drain',
          text: t(
            'Drain the potatoes well and leave them in the hot pot, off the heat, until the steam stops rising.',
            'Scurge bine cartofii și lasă-i în oala fierbinte, luată de pe foc, până nu mai iese abur.',
          ),
        },
        {
          key: 'warm-milk',
          text: t(
            'Warm the milk with the 60 g of butter in a small pan until the butter has melted.',
            'Încălzește laptele cu cele 60 g de unt într-o cratiță mică, până se topește untul.',
          ),
        },
        {
          key: 'mash',
          text: t(
            'Mash the potatoes, stir in the warm milk and butter, the nutmeg, the remaining pepper and the 3 g of salt, then beat in the egg yolks one at a time until smooth.',
            'Pasează cartofii, amestecă laptele cald cu unt, nucșoara, restul de piper și cele 3 g de sare, apoi bate gălbenușurile, unul câte unul, până obții un piure fin.',
          ),
        },
        {
          key: 'assemble',
          text: t(
            'Spread the meat in a buttered 2.5 litre baking dish and cover it with the mash, from the edges inward. Rake the top with a fork, scatter over the Gruyère and breadcrumbs and dot with the butter flakes.',
            'Întinde carnea într-o tavă de copt de 2,5 litri unsă cu unt și acoper-o cu piure, dinspre margini spre centru. Trasează dungi cu furculița, presară Gruyère-ul și pesmetul și pune deasupra fulgii de unt.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 25 minutes, until the top is golden and crusty, the edges bubble and the centre reads at least 75 °C on a food thermometer. The gratin must be hot all the way through.',
            'Coace 25 de minute, până când suprafața e aurie și crocantă, marginile clocotesc, iar centrul arată cel puțin 75 °C la termometrul de alimente. Gratinul trebuie să fie fierbinte în tot miezul.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'rest',
          text: t(
            'Rest for 5 minutes before serving.',
            'Lasă să stea 5 minute înainte de servire.',
          ),
          timerSeconds: 300,
        },
        storeStep,
      ],
      tips: [
        t(
          'Hachis Parmentier is a classic way to use up leftover pot-au-feu beef: shred it, moisten it with a ladle of the broth instead of the water and skip the browning, but still heat the filling through before it goes under the mash.',
          'Hachis Parmentier este un mod clasic de a folosi carnea rămasă de la pot-au-feu: desfă-o în fire, umezește-o cu un polonic de supă în loc de apă și sari peste rumenire, dar încălzește umplutura bine înainte să o acoperi cu piure.',
        ),
      ],
      stepTips: [
        {
          step: 'mash',
          text: t(
            'Beat the yolks into the hot mash straight away so they blend in; the bake then cooks them. Do not serve it half-baked: the yolks are only safe once the centre reaches 75 °C.',
            'Bate gălbenușurile în piureul fierbinte imediat, ca să se încorporeze; coacerea le gătește apoi. Nu servi gratinul necopt: gălbenușurile sunt sigure abia când centrul ajunge la 75 °C.',
          ),
        },
      ],
      nutritionNote: t(
        'A good source of protein and some iron from the beef, and the parsley adds a little vitamin C. The butter, egg yolks and Gruyère add a lot of saturated fat and some salt, and the potato is mostly starchy carbohydrate with little fibre; a green salad alongside makes it lighter.',
        'O sursă bună de proteine și ceva fier din carnea de vită, iar pătrunjelul adaugă puțină vitamina C. Untul, gălbenușurile și Gruyère aduc multe grăsimi saturate și ceva sare, iar cartoful este în mare parte carbohidrat amidonos, cu puține fibre; o salată verde alături îl face mai ușor.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Green salad with vinaigrette', 'Salată verde cu vinegretă'),
          reason: t(
            'The sharp dressing and crisp leaves cut through the butter and cheese.',
            'Dressingul acrișor și frunzele crocante taie din untul și brânza gratinului.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'lettuce',
        },
        {
          kind: 'drink',
          label: t('Light red wine', 'Vin roșu ușor'),
          reason: t(
            'A fruity, low-tannin red goes with beef and does not overpower the delicate purée.',
            'Un vin roșu fructat, cu puțin tanin, merge cu vita și nu acoperă piureul delicat.',
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
            'A hot gratin that warms a cold evening.',
            'Un gratin fierbinte care încălzește o seară rece.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein and carbohydrates in one dish.',
            'Proteine și carbohidrați într-o singură mâncare.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Butter, cheese and egg yolks make it heavy.',
            'Untul, brânza și gălbenușurile îl fac greu.',
          ),
        },
      ],
    },
    {
      slug: 'cottage-pie-argentinian',
      cuisine: 'argentinian',
      title: t(
        'Pastel de papa (Argentine beef and potato pie with olives and egg)',
        'Pastel de papa (plăcintă argentiniană de carne și piure, cu măsline și ou)',
      ),
      servings: 6,
      prepMinutes: 25,
      cookMinutes: 70,
      difficulty: 'medium',
      hideBaseTips: [2],
      lines: [
        { ingredient: 'sunflower-oil', quantity: 45, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('finely chopped', 'tocate mărunt'),
        },
        {
          ingredient: 'bell-pepper',
          quantity: 1,
          unit: 'pcs',
          note: t('red, diced small', 'roșu, tăiat cubulețe mici'),
        },
        {
          ingredient: 'spring-onion',
          quantity: 60,
          unit: 'g',
          note: t('sliced', 'tăiată rondele'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t('crushed', 'zdrobit'),
        },
        { ingredient: 'minced-beef', quantity: 700, unit: 'g' },
        { ingredient: 'paprika', quantity: 5, unit: 'g' },
        { ingredient: 'cumin', quantity: 3, unit: 'g' },
        { ingredient: 'chilli-flakes', quantity: 1, unit: 'g' },
        { ingredient: 'oregano', quantity: 2, unit: 'g' },
        {
          ingredient: 'eggs',
          key: 'eggs-filling',
          quantity: 3,
          unit: 'pcs',
          note: t('hard-boiled', 'fierte tari'),
        },
        {
          ingredient: 'olives',
          quantity: 80,
          unit: 'g',
          note: t(
            'green, pitted and halved',
            'verzi, fără sâmburi, tăiate în jumătăți',
          ),
        },
        { ingredient: 'raisins', quantity: 50, unit: 'g', optional: true },
        {
          ingredient: 'potato',
          quantity: 1200,
          unit: 'g',
          note: t('floury, peeled', 'făinoși, curățați'),
        },
        { ingredient: 'butter', quantity: 50, unit: 'g' },
        { ingredient: 'milk', quantity: 150, unit: 'ml' },
        { ingredient: 'nutmeg', quantity: 0.5, unit: 'g' },
        {
          ingredient: 'eggs',
          key: 'eggs-wash',
          quantity: 1,
          unit: 'pcs',
          note: t('beaten, to brush', 'bătut, pentru uns'),
        },
        { ingredient: 'sugar', quantity: 5, unit: 'g', optional: true },
        { ingredient: 'salt', key: 'salt-meat', quantity: 4, unit: 'g' },
        { ingredient: 'salt', key: 'salt-water', quantity: 4, unit: 'g' },
        { ingredient: 'salt', key: 'salt-mash', quantity: 2, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
      ],
      steps: [
        {
          key: 'potato-prep',
          text: t(
            'Peel the potatoes and cut them into pieces of about 3 cm. Chop the onions, red pepper and spring onions and crush the garlic.',
            'Curăță cartofii și taie-i în bucăți de aproximativ 3 cm. Toacă ceapa, ardeiul gras roșu și ceapa verde și zdrobește usturoiul.',
          ),
        },
        {
          key: 'potatoes',
          text: t(
            'Put the potatoes in a pot, cover them with just-boiled water from the kettle, add 4 g of salt and bring back to the boil. Simmer for 15 minutes, until a knife slides in with no resistance. Boil the eggs and cook the filling while they simmer.',
            'Pune cartofii într-o oală, acoperă-i cu apă fiartă proaspăt din fierbător, adaugă 4 g de sare și adu din nou la fierbere. Fierbe 15 minute, până când un cuțit intră fără rezistență. Fierbe ouăle și gătește umplutura cât timp fierb cartofii.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'eggs',
          text: t(
            'While the potatoes simmer, put the 3 eggs for the filling in a small pan, cover with cold water and bring to the boil. Boil for 10 minutes, so the yolks are fully set.',
            'În timp ce fierb cartofii, pune cele 3 ouă pentru umplutură într-o cratiță mică, acoperă-le cu apă rece și adu la fierbere. Fierbe 10 minute, ca gălbenușurile să se întărească complet.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'eggs-peel',
          text: t(
            'Cool the eggs under cold running water, then peel and chop them into rough pieces.',
            'Răcește ouăle sub jet de apă rece, apoi curăță-le de coajă și taie-le în bucăți mari.',
          ),
        },
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 200 °C (180 °C fan) with a rack in the middle (about 15 minutes).',
            'Încălzește cuptorul la 200 °C (180 °C cu ventilator), cu grătarul la mijloc (aproximativ 15 minute).',
          ),
        },
        {
          key: 'soften',
          text: t(
            'Meanwhile, heat the oil in a wide pan over medium heat. Add the onions, red pepper and spring onions and cook for 8 minutes, until soft and starting to colour.',
            'Între timp, încinge uleiul într-o tigaie lată la foc mediu. Adaugă ceapa, ardeiul gras și ceapa verde și gătește 8 minute, până se înmoaie și încep să capete culoare.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'brown',
          text: t(
            'Turn the heat up, add the mince and 4 g of the salt and break it up with a wooden spoon. Cook for 8 minutes, until no pink is left, the juices run clear and the meat is lightly browned.',
            'Mărește focul, adaugă carnea tocată și 4 g din sare și sfărâm-o cu o lingură de lemn. Gătește 8 minute, până nu mai rămâne nimic roz, zeama iese limpede, iar carnea e ușor rumenită.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'spices',
          text: t(
            'Stir in the garlic, paprika, cumin, chilli flakes, oregano and half the pepper and cook for 1 minute, until fragrant.',
            'Adaugă usturoiul, boiaua, chimionul, fulgii de chili, oregano și jumătate din piper și gătește 1 minut, până se simte aroma.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'fold',
          text: t(
            'Take the pan off the heat and fold in the chopped eggs, olives and raisins. Taste and add salt only if needed: the olives are salty.',
            'Dă tigaia de pe foc și amestecă ușor ouăle tocate, măslinele și stafidele. Gustă și adaugă sare doar dacă e nevoie: măslinele sunt sărate.',
          ),
        },
        {
          key: 'drain',
          text: t(
            'Drain the potatoes well and leave them in the hot pot, off the heat, until the steam stops rising.',
            'Scurge bine cartofii și lasă-i în oala fierbinte, luată de pe foc, până nu mai iese abur.',
          ),
        },
        {
          key: 'warm-milk',
          text: t(
            'Warm the milk with the butter in a small pan until the butter has melted.',
            'Încălzește laptele cu untul într-o cratiță mică, până se topește untul.',
          ),
        },
        {
          key: 'mash',
          text: t(
            'Mash the potatoes, stir in the warm milk and butter, the nutmeg, the remaining pepper and the 2 g of salt until smooth.',
            'Pasează cartofii, amestecă laptele cald cu unt, nucșoara, restul de piper și cele 2 g de sare până obții un piure fin.',
          ),
        },
        {
          key: 'assemble',
          text: t(
            'Spread the filling in a 3 litre baking dish and cover it with the mash, from the edges inward. Smooth the top, brush it with the beaten egg, sprinkle over the sugar if using and rake lightly with a fork.',
            'Întinde umplutura într-o tavă de copt de 3 litri și acoper-o cu piure, dinspre margini spre centru. Netezește suprafața, unge-o cu oul bătut, presară zahărul, dacă îl folosești, și trasează ușor dungi cu furculița.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 25 to 30 minutes, until the top is golden and the centre reads at least 75 °C on a food thermometer. The pie must be hot all the way through; the egg wash is cooked by the bake.',
            'Coace 25-30 de minute, până când suprafața e aurie, iar centrul arată cel puțin 75 °C la termometrul de alimente. Plăcinta trebuie să fie fierbinte în tot miezul; oul cu care ai uns suprafața se gătește la coacere.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'rest',
          text: t(
            'Rest for 5 minutes before serving.',
            'Lasă să stea 5 minute înainte de servire.',
          ),
          timerSeconds: 300,
        },
        storeStep,
      ],
      tips: [
        t(
          'Raisins divide opinion. Leave them out if you like the filling purely savoury; with them, the pie is sweet and salty at once.',
          'Stafidele împart părerile. Lasă-le deoparte dacă preferi umplutura doar savuroasă; cu ele, plăcinta e dulce-sărată în același timp.',
        ),
      ],
      stepTips: [
        {
          step: 'fold',
          text: t(
            'Fold the eggs in gently at the end and keep the pieces chunky, so you find a piece of egg in each slice.',
            'Amestecă ouăle ușor la final și păstrează bucățile mari, ca să găsești ou în fiecare felie.',
          ),
        },
      ],
      nutritionNote: t(
        'Protein and iron from the beef and eggs, with some vitamin C from the red pepper. The beef, butter and egg add saturated fat, the olives add salt, and the raisins and optional sugar add a little sugar; the potato is mostly starchy carbohydrate, so a tomato salad alongside adds freshness.',
        'Proteine și fier din vită și ouă, cu puțină vitamina C din ardeiul gras roșu. Carnea, untul și oul aduc grăsimi saturate, măslinele aduc sare, iar stafidele și zahărul opțional aduc puțin zahăr; cartoful este în mare parte carbohidrat amidonos, așa că o salată de roșii alături aduce prospețime.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Tomato and onion salad', 'Salată de roșii cu ceapă'),
          reason: t(
            'Juicy, acidic tomatoes lift the spiced beef and the soft potato.',
            'Roșiile zemoase și acidulate înviorează carnea condimentată și piureul moale.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'tomato',
        },
        {
          kind: 'drink',
          label: t('Red wine, such as Malbec', 'Vin roșu, de exemplu Malbec'),
          reason: t(
            'Malbec is Argentina’s best-known red grape, and its fruit stands up to the paprika and cumin.',
            'Malbec este cel mai cunoscut soi roșu argentinian, iar aromele lui fructate se potrivesc cu boiaua și chimionul.',
          ),
          principle: 'regional_tradition',
          ingredient: 'red-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, hearty pie for a cold evening.',
            'O plăcintă fierbinte și consistentă pentru o seară rece.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Beef and eggs give protein; the potato gives carbohydrates.',
            'Vita și ouăle dau proteine; cartofii dau carbohidrați.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'Heavy and hot, with the oven on for about an hour.',
            'Grea și fierbinte, cu cuptorul aprins aproape o oră.',
          ),
        },
      ],
    },
  ],
};
