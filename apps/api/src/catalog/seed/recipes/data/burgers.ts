import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Burgers base is the classic pan-cooked beef burger in a toasted bun. Each
// Variant is a full Recipe with its own lines, steps and guidance; the base's
// Recipe-level Tips are inherited unless a Variant hides them. Minced beef is
// always cooked through (71 °C, no pink): burgers are not steaks.
export const burgers: BaseRecipeSeed = {
  slug: 'burgers',
  title: t('Classic beef burgers', 'Burgeri clasici de vită'),
  servings: 4,
  prepMinutes: 30,
  cookMinutes: 20,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'minced-beef',
      quantity: 600,
      unit: 'g',
      note: t(
        'about 20% fat, cold from the fridge; makes 4 patties of 150 g',
        'cu aproximativ 20% grăsime, rece din frigider; ies 4 chiftele de burger de câte 150 g',
      ),
    },
    { ingredient: 'salt', quantity: 5, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 1.5, unit: 'g' },
    { ingredient: 'sunflower-oil', quantity: 15, unit: 'ml' },
    { ingredient: 'burger-buns', quantity: 4, unit: 'pcs' },
    {
      ingredient: 'cheddar',
      quantity: 80,
      unit: 'g',
      optional: true,
      note: t('4 slices', '4 felii'),
    },
    {
      ingredient: 'iceberg-lettuce',
      quantity: 0.25,
      unit: 'pcs',
      note: t('4 leaves', '4 frunze'),
    },
    {
      ingredient: 'tomato',
      quantity: 200,
      unit: 'g',
      note: t('8 slices', '8 felii'),
    },
    {
      ingredient: 'red-onion',
      quantity: 1,
      unit: 'pcs',
      note: t('thin rings', 'inele subțiri'),
    },
    {
      ingredient: 'pickled-cucumbers',
      quantity: 60,
      unit: 'g',
      note: t('sliced', 'tăiați felii'),
    },
    { ingredient: 'ketchup', quantity: 40, unit: 'g' },
    { ingredient: 'mustard', quantity: 20, unit: 'g' },
    { ingredient: 'mayonnaise', quantity: 40, unit: 'g' },
  ],
  steps: [
    {
      key: 'shape',
      text: t(
        'Divide the 600 g of cold mince into 4 portions of 150 g. Shape each one lightly into a patty about 10 cm wide and 2 cm thick, and press a shallow thumbprint into the middle. Do not salt it yet. Wash your hands with soap and warm water after handling the raw mince.',
        'Împarte cele 600 g de carne tocată rece în 4 porții de câte 150 g. Modelează fiecare porție ușor într-o chiftea de aproximativ 10 cm lățime și 2 cm grosime și apasă cu degetul mare o adâncitură mică în mijloc. Nu o săra încă. Spală-te pe mâini cu apă caldă și săpun după ce ai atins carnea tocată crudă.',
      ),
    },
    {
      key: 'chill',
      text: t(
        'Put the patties on a plate, cover them and chill them in the fridge for 15 minutes, so they hold their shape in the pan. Do the next step while they chill.',
        'Pune chiftelele pe o farfurie, acoperă-le și ține-le la frigider 15 minute, ca să-și păstreze forma în tigaie. Fă pasul următor cât timp se răcesc.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'toppings',
      text: t(
        'Slice the tomato, cut the onion into thin rings, slice the pickles and separate 4 lettuce leaves. Spoon the ketchup, mustard and mayonnaise into separate small dishes for spreading.',
        'Taie roșiile felii, ceapa inele subțiri și castraveții murați felii și desprinde 4 frunze de salată. Pune cu lingura ketchupul, muștarul și maioneza în farfurioare separate, pentru întins.',
      ),
    },
    {
      key: 'heat',
      text: t(
        'Heat a large heavy frying pan, 28 to 30 cm, over medium-high heat for 3 minutes. Add the oil and let it shimmer. If the patties do not fit without touching, cook them in two batches, check that each batch reaches 71 °C (see the check step) before it leaves the pan, and keep the first batch on a clean, warm plate, not the one the raw patties sat on.',
        'Încinge o tigaie mare și grea, de 28-30 cm, la foc mediu spre mare timp de 3 minute. Adaugă uleiul și lasă-l să se încingă până sclipește. Dacă chiftelele nu încap fără să se atingă, gătește-le în două reprize, verifică dacă fiecare repriză ajunge la 71 °C (vezi pasul de verificare) înainte să iasă din tigaie și ține prima repriză la cald, pe o farfurie curată, nu pe cea pe care au stat chiftelele crude.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'season-sear',
      text: t(
        'Season both sides of each patty with the salt and pepper, then lay them in the pan with the thumbprint facing up. Cook for 4 minutes without moving or pressing them, until the underside is deep brown and lifts away easily.',
        'Condimentează chiftelele pe ambele părți cu sare și piper, apoi pune-le în tigaie cu adânciturile în sus. Gătește-le 4 minute fără să le miști și fără să le apeși, până când partea de jos e rumenă închis și se desprinde ușor.',
      ),
      timerSeconds: 240,
    },
    {
      key: 'flip',
      text: t(
        'Turn the patties once and cook the second side for 3 minutes.',
        'Întoarce chiftelele o singură dată și gătește-le pe cealaltă parte 3 minute.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'cheese',
      text: t(
        'If you are using cheddar, lay a slice on each patty, cover the pan with a lid and cook for 1 minute more, until the cheese has melted. Without cheese, just cook on for 1 minute.',
        'Dacă folosești cheddar, pune câte o felie pe fiecare chiftea, acoperă tigaia cu un capac și mai gătește 1 minut, până se topește brânza. Fără brânză, mai gătește doar 1 minut.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'check',
      text: t(
        'Check that every patty is cooked through: a probe thermometer in the centre should read 71 °C, and the juices must run clear with no pink inside. If not, cook 1 to 2 minutes more. Move the patties to a clean, warm plate (not the one the raw patties sat on) to rest.',
        'Verifică dacă fiecare chiftea e gătită complet: un termometru cu sondă în centru trebuie să arate 71 °C, iar sucul trebuie să fie limpede, fără nimic roz în interior. Dacă nu, mai gătește 1-2 minute. Mută chiftelele pe o farfurie curată și caldă (nu pe cea pe care au stat chiftelele crude), la odihnit.',
      ),
    },
    {
      key: 'toast',
      text: t(
        'Split the buns and toast them cut side down in the same pan for about 1 minute, until golden, while the patties rest.',
        'Taie chiflele în două și prăjește-le cu fața tăiată în jos în aceeași tigaie, aproximativ 1 minut, până se auresc, cât timp chiftelele se odihnesc.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'assemble',
      text: t(
        'Spread mayonnaise on the bottom buns and ketchup and mustard on the tops. Build each burger with lettuce, tomato, the patty with its cheese, pickles and onion, then close with the top bun and serve at once.',
        'Întinde maioneză pe jumătățile de jos ale chiflelor, iar ketchup și muștar pe cele de sus. Compune fiecare burger din salată, roșii, chiftea cu brânza ei, castraveți murați și ceapă, apoi închide cu jumătatea de sus și servește imediat.',
      ),
    },
  ],
  tips: [
    t(
      'Keep the mince in the fridge until you shape it, and shape it quickly: warm fat smears and the burgers turn out dense.',
      'Ține carnea tocată la frigider până o modelezi și modeleaz-o repede: grăsimea caldă se întinde, iar burgerii ies compacți.',
    ),
    t(
      'Salt the patties only just before they hit the pan. Salt worked into the meat early makes it springy, like a sausage.',
      'Sărează chiftelele abia înainte să intre în tigaie. Sarea amestecată devreme în carne o face elastică, ca pe un cârnat.',
    ),
    t(
      'Do not press the patties with the spatula while they cook: it only squeezes the juices out into the pan.',
      'Nu apăsa chiftelele cu spatula cât timp se gătesc: scoți doar sucul din ele în tigaie.',
    ),
    t(
      'Buy mince with around 20% fat. Lean mince gives a dry burger, because the fat is what keeps it juicy.',
      'Cumpără carne tocată cu aproximativ 20% grăsime. Carnea slabă dă un burger uscat, pentru că grăsimea îl ține suculent.',
    ),
    t(
      'Cool leftover cooked patties within 2 hours, keep them in the fridge and eat them within 2 days, reheated until steaming hot all the way through.',
      'Răcește chiftelele rămase în cel mult 2 ore, ține-le la frigider și mănâncă-le în 2 zile, reîncălzite până scot abur în tot miezul.',
    ),
  ],
  stepTips: [
    {
      step: 'shape',
      text: t(
        'The thumbprint keeps the middle from puffing up into a dome as the patty shrinks and contracts, so the burger stays flat and the toppings stay on.',
        'Adâncitura din mijloc împiedică chifteaua să se umfle ca o cupolă când se strânge, așa că burgerul rămâne plat, iar legumele și sosurile stau la locul lor.',
      ),
    },
    {
      step: 'check',
      text: t(
        'Slide the thermometer in from the side, so the tip sits in the middle of the patty and does not touch the pan.',
        'Introdu termometrul din lateral, ca vârful să ajungă în mijlocul chiftelei și să nu atingă tigaia.',
      ),
    },
  ],
  nutritionNote: t(
    'A good source of protein, iron and B12 from the beef; the 20% fat mince, the cheese and the mayonnaise add saturated fat, and the cheese, pickles, ketchup and bun add salt. The bun is mostly refined carbohydrate with little fibre, so pile on lettuce, tomato and onion; a salad alongside is a lighter choice than fries.',
    'O sursă bună de proteine, fier și vitamina B12 din carnea de vită; carnea tocată cu 20% grăsime, brânza și maioneza aduc grăsimi saturate, iar brânza, castraveții murați, ketchupul și chifla aduc sare. Chifla e în mare parte carbohidrat rafinat, cu puține fibre, așa că adaugă salată, roșii și ceapă din belșug; o salată alături e o alegere mai ușoară decât cartofii prăjiți.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Creamy potato salad', 'Salată de cartofi cu maioneză'),
      reason: t(
        'A cool, creamy side next to a hot, crusty patty, and it can be made ahead for a cookout.',
        'O garnitură rece și cremoasă lângă o chiftea fierbinte și cu crustă, care se poate pregăti dinainte pentru un grătar în aer liber.',
      ),
      principle: 'contrast_texture',
      recipe: 'potato-salad',
    },
    {
      kind: 'food',
      label: t('French fries', 'Cartofi prăjiți'),
      reason: t(
        'Crisp, salty fries give a crunch next to the soft bun and juicy patty.',
        'Cartofii prăjiți crocanți și sărați adaugă un crocant lângă chifla moale și chifteaua suculentă.',
      ),
      principle: 'contrast_texture',
      ingredient: 'french-fries',
    },
    {
      kind: 'drink',
      label: t('Cold lager', 'Bere blondă rece'),
      reason: t(
        'Cold, crisp bubbles refresh the palate between rich, savoury bites.',
        'Bulele reci și răcoritoare împrospătează gustul între îmbucături bogate și sărate.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'beer',
    },
    {
      kind: 'drink',
      label: t('Cola', 'Cola'),
      reason: t(
        'Its sweetness and fizz are a familiar match for salty, savoury burgers.',
        'Dulceața și bulele ei se potrivesc cu burgerii sărați și savuroși.',
      ),
      principle: 'salt_balances_sweet',
      ingredient: 'cola',
    },
  ],
  eatingMoments: [
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Beef protein helps muscles recover, and the bun brings carbohydrates.',
        'Proteinele din carnea de vită ajută mușchii să se refacă, iar chifla aduce carbohidrați.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'A fatty, filling burger sits heavy in the stomach during exercise.',
        'Un burger gras și sățios cade greu la stomac în timpul efortului.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A heavy, fatty meal late at night can make for a restless sleep.',
        'O masă grea și grasă seara târziu poate strica somnul.',
      ),
    },
  ],
  variants: [
    {
      slug: 'burgers-american',
      cuisine: 'american',
      title: t(
        'Smash burgers',
        'Smash burgeri (burgeri subțiri, striviți pe plită)',
      ),
      servings: 4,
      prepMinutes: 25,
      cookMinutes: 22,
      difficulty: 'easy',
      hideBaseTips: [2],
      lines: [
        {
          ingredient: 'minced-beef',
          quantity: 500,
          unit: 'g',
          note: t(
            'about 20% fat, cold; makes 8 balls of about 60 g, two per burger',
            'cu aproximativ 20% grăsime, rece; ies 8 bile de aproximativ 60 g, două pentru fiecare burger',
          ),
        },
        { ingredient: 'salt', quantity: 4, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        {
          ingredient: 'processed-cheese-slices',
          quantity: 150,
          unit: 'g',
          note: t('8 slices of American cheese', '8 felii de brânză topită'),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('sliced paper-thin', 'tăiată foarte subțire'),
        },
        {
          ingredient: 'burger-buns',
          quantity: 4,
          unit: 'pcs',
          note: t('soft', 'moi'),
        },
        {
          ingredient: 'pickled-cucumbers',
          quantity: 60,
          unit: 'g',
          note: t('sliced', 'tăiați felii'),
        },
        { ingredient: 'mayonnaise', quantity: 60, unit: 'g' },
        { ingredient: 'ketchup', quantity: 30, unit: 'g' },
        { ingredient: 'mustard', quantity: 15, unit: 'g' },
      ],
      steps: [
        {
          key: 'sauce',
          text: t(
            'Stir the mayonnaise, ketchup and mustard together in a small bowl to make the sauce. Slice the pickles and slice the onion paper-thin.',
            'Amestecă maioneza, ketchupul și muștarul într-un bol mic, pentru sos. Taie castraveții murați felii și ceapa foarte subțire.',
          ),
        },
        {
          key: 'balls',
          text: t(
            'Divide the 500 g of cold mince into 8 loose balls of about 60 g, rolling them only enough to hold together. Do not season or pack them. Wash your hands with soap and warm water after handling the raw mince, then chill the balls for 15 minutes.',
            'Împarte cele 500 g de carne tocată rece în 8 bile slab legate, de aproximativ 60 g, rulându-le doar cât să se țină. Nu le condimenta și nu le îndesa. Spală-te pe mâini cu apă caldă și săpun după ce ai atins carnea tocată crudă, apoi ține bilele la rece 15 minute.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'heat',
          text: t(
            'Heat a cast-iron pan or griddle over high heat for 5 minutes, until it is very hot and starting to smoke lightly. Switch on the extractor fan or open a window. Leave the pan dry.',
            'Încinge o tigaie din fontă sau o plită la foc mare 5 minute, până e foarte fierbinte și începe să scoată puțin fum. Pornește hota sau deschide o fereastră. Lasă tigaia uscată.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'toast',
          text: t(
            'Toast the split buns cut side down in the dry pan for about 30 seconds, watching them, until lightly golden, then set them aside on plates.',
            'Prăjește chiflele tăiate în două, cu fața tăiată în jos, în tigaia uscată, aproximativ 30 de secunde, urmărindu-le, până se auresc ușor, apoi pune-le deoparte pe farfurii.',
          ),
          timerSeconds: 30,
        },
        {
          key: 'smash',
          text: t(
            'Put 2 balls in the hot pan, well apart, which is as many as the pan holds with room to press. At once press each one flat with a stiff metal spatula, until it is about 3 mm thin and lacy at the edges. Season the tops with salt and pepper and press a few slices of onion into the raw side. Wash your hands with soap and warm water before touching the buns or toppings.',
            'Pune 2 bile în tigaia fierbinte, bine depărtate, adică atâtea câte încap cu loc de apăsat. Imediat apasă fiecare bilă cu o spatulă metalică rigidă, până ajunge la aproximativ 3 mm grosime, cu marginile zdrențuite. Condimentează fețele de sus cu sare și piper și apasă câteva felii de ceapă în partea crudă. Spală-te pe mâini cu apă caldă și săpun înainte să atingi chiflele sau garniturile.',
          ),
        },
        {
          key: 'sear',
          text: t(
            'Cook for 90 seconds without touching, until the edges are deep brown and crisp and juices bubble up through the top.',
            'Gătește 90 de secunde fără să le atingi, până când marginile sunt rumene închis și crocante, iar sucul iese la suprafață.',
          ),
          timerSeconds: 90,
        },
        {
          key: 'flip',
          text: t(
            'Slide the spatula flat under each patty to scrape up the crust, and flip it with the onion side down. Lay a slice of cheese on each patty and cook for 1 minute, until the cheese has melted.',
            'Strecoară spatula pe orizontală sub fiecare chiftea, ca să dezlipești crusta, și întoarce-o cu ceapa în jos. Pune o felie de brânză pe fiecare chiftea și gătește 1 minut, până se topește brânza.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'stack',
          text: t(
            'Check the patties on the pan: lift the edge of one with the spatula. Each must be deep brown through with no pink, and the juices clear; if any pink shows, cook a little longer. Then stack the two patties with their cheese on a bottom bun, top with pickles and a spoonful of sauce, and close with the top bun. Scrape the pan clean with the spatula and repeat from the smash step for the remaining 6 balls, in 3 more rounds, making 4 burgers in all.',
            'Verifică chiftelele în tigaie: ridică marginea uneia cu spatula. Fiecare trebuie să fie rumenă închis până în centru, fără nimic roz, cu suc limpede; dacă se vede ceva roz, mai gătește puțin. Apoi așază cele două chiftele, cu brânza lor, pe o jumătate de jos de chiflă, pune deasupra castraveți murați și o lingură de sos și închide cu jumătatea de sus. Răzuiește tigaia curată cu spatula și repetă de la pasul de strivit pentru cele 6 bile rămase, în încă 3 reprize, ca să faci 4 burgeri.',
          ),
        },
      ],
      tips: [
        t(
          'Smash the balls the moment they land in the pan. Once the crust sets, pressing tears it instead of flattening it.',
          'Strivește bilele imediat ce ating tigaia. După ce crusta s-a format, apăsarea o rupe în loc să aplatizeze carnea.',
        ),
      ],
      stepTips: [
        {
          step: 'smash',
          text: t(
            'Put a square of baking paper between the ball and the spatula when you press, so the meat does not stick to it.',
            'Pune un pătrat de hârtie de copt între bilă și spatulă când apeși, ca să nu se lipească carnea de ea.',
          ),
        },
      ],
      nutritionNote: t(
        'Each burger has a little less mince than the classic one, 125 g against 150 g, but the double processed cheese and the sauce bring saturated fat and salt, and the soft bun is mostly refined carbohydrate with little fibre. Still a good source of protein and iron; a salad alongside is a lighter choice than fries.',
        'Fiecare burger are ceva mai puțină carne tocată decât cel clasic, 125 g față de 150 g, dar brânza topită dublă și sosul aduc grăsimi saturate și sare, iar chifla moale e în mare parte carbohidrat rafinat, cu puține fibre. Rămâne o sursă bună de proteine și fier; o salată alături e o alegere mai ușoară decât cartofii prăjiți.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('French fries', 'Cartofi prăjiți'),
          reason: t(
            'Crisp fries make a crunchy contrast to the soft bun and the thin, lacy patties.',
            'Cartofii prăjiți crocanți fac un contrast bun cu chifla moale și cu chiftelele subțiri, zdrențuite.',
          ),
          principle: 'contrast_texture',
          ingredient: 'french-fries',
        },
        {
          kind: 'drink',
          label: t('Cold lager', 'Bere blondă rece'),
          reason: t(
            'Cold, crisp bubbles cut through melted cheese and beef fat.',
            'Bulele reci echilibrează grăsimea brânzei topite și a cărnii de vită.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
        {
          kind: 'drink',
          label: t('Cola', 'Cola'),
          reason: t(
            'Sweet fizz is a familiar partner for salty, cheesy burgers.',
            'Dulceața și bulele ei se potrivesc cu burgerii sărați, cu brânză.',
          ),
          principle: 'salt_balances_sweet',
          ingredient: 'cola',
        },
      ],
      eatingMoments: [
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Beef protein helps muscles recover, and the bun brings carbohydrates.',
            'Proteinele din carnea de vită ajută mușchii să se refacă, iar chifla aduce carbohidrați.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Two cheesy patties in a bun sit heavy in the stomach during exercise.',
            'Două chiftele cu brânză în chiflă cad greu la stomac în timpul efortului.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A heavy, fatty meal late at night can make for a restless sleep.',
            'O masă grea și grasă seara târziu poate strica somnul.',
          ),
        },
      ],
    },
    {
      slug: 'burgers-japanese',
      cuisine: 'japanese',
      title: t(
        'Hambāgu (Japanese hamburg steak)',
        'Hambāgu (chiftea japoneză de carne tocată, cu sos)',
      ),
      servings: 4,
      prepMinutes: 45,
      cookMinutes: 20,
      difficulty: 'medium',
      hideBaseTips: [0, 1, 2],
      lines: [
        {
          ingredient: 'minced-mixed-meat',
          quantity: 500,
          unit: 'g',
          note: t(
            'beef and pork; with the onion, panko and egg it makes 4 patties of about 180 g',
            'vită și porc; împreună cu ceapa, panko și oul ies 4 chiftele de aproximativ 180 g',
          ),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely chopped', 'tocată mărunt'),
        },
        { ingredient: 'sunflower-oil', quantity: 30, unit: 'ml' },
        { ingredient: 'panko', quantity: 30, unit: 'g' },
        {
          ingredient: 'milk',
          quantity: 0.06,
          unit: 'l',
          note: t('60 ml', '60 ml'),
        },
        { ingredient: 'eggs', quantity: 1, unit: 'pcs' },
        { ingredient: 'nutmeg', quantity: 0.5, unit: 'g' },
        { ingredient: 'salt', quantity: 5, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        { ingredient: 'ketchup', quantity: 60, unit: 'g' },
        { ingredient: 'worcestershire-sauce', quantity: 30, unit: 'ml' },
        { ingredient: 'red-wine', quantity: 60, unit: 'ml' },
        { ingredient: 'butter', quantity: 15, unit: 'g' },
      ],
      steps: [
        {
          key: 'panade',
          text: t(
            'Stir the panko into the milk in a small bowl and leave it to soak for 5 minutes, while you cook the onion.',
            'Amestecă panko cu laptele într-un bol mic și lasă-l la înmuiat 5 minute, cât timp călești ceapa.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'onion',
          text: t(
            'Warm 15 ml of the oil in a frying pan over medium heat and cook the chopped onion for 7 minutes, stirring, until soft and pale gold.',
            'Încălzește 15 ml din ulei într-o tigaie la foc mediu și călește ceapa tocată 7 minute, amestecând, până se înmoaie și devine ușor aurie.',
          ),
          timerSeconds: 420,
        },
        {
          key: 'cool',
          text: t(
            'Spread the onion on a plate and leave it to cool for 10 minutes, until only barely warm. Wipe out the pan.',
            'Întinde ceapa pe o farfurie și lasă-o să se răcească 10 minute, până e abia caldă. Șterge tigaia.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'mix',
          text: t(
            'In a large bowl, combine the mince, the cooled onion, the soaked panko, the egg, salt, pepper and nutmeg. Knead with your hand until the mixture turns sticky and pale and holds together.',
            'Într-un castron mare, amestecă carnea tocată, ceapa răcită, panko înmuiat, oul, sarea, piperul și nucșoara. Frământă cu mâna până când compoziția devine lipicioasă, mai deschisă la culoare și se ține bine.',
          ),
        },
        {
          key: 'shape',
          text: t(
            'Divide the mixture into 4 portions of about 180 g. Toss each one from hand to hand about 10 times to knock out the air, then shape it into an oval about 12 cm long and 2 cm thick, with a shallow dent in the middle. Wash your hands with soap and warm water after handling the raw mince.',
            'Împarte compoziția în 4 porții de aproximativ 180 g. Aruncă fiecare porție dintr-o mână în alta de vreo 10 ori, ca să scoți aerul, apoi modeleaz-o într-un oval de aproximativ 12 cm lungime și 2 cm grosime, cu o adâncitură mică în mijloc. Spală-te pe mâini cu apă caldă și săpun după ce ai atins carnea tocată crudă.',
          ),
        },
        {
          key: 'chill',
          text: t(
            'Cover the patties and chill them in the fridge for 15 minutes, so they hold together in the pan.',
            'Acoperă chiftelele și ține-le la frigider 15 minute, ca să se țină bine în tigaie.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'sear',
          text: t(
            'Heat the remaining 15 ml oil in a wide frying pan with a lid over medium-high heat for 1 minute. Lay in the patties dent side up and sear for 2 minutes, until the underside is browned.',
            'Încălzește cei 15 ml de ulei rămași într-o tigaie lată, cu capac, la foc mediu spre mare timp de 1 minut. Pune chiftelele cu adânciturile în sus și rumenește-le 2 minute, până când partea de jos se rumenește.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'turn',
          text: t(
            'Turn the patties and sear the second side for 1 minute, until browned.',
            'Întoarce chiftelele și rumenește-le pe cealaltă parte 1 minut.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'steam',
          text: t(
            'Take the pan off the heat and spoon most of the hot fat into a heatproof bowl (never the sink). Hold the lid in your other hand, pour 60 ml water slowly into a gap between the patties, standing back from the spitting, and cover at once. Put the pan back on low heat and steam for 8 minutes.',
            'Ia tigaia de pe foc și pune cu lingura aproape toată grăsimea fierbinte într-un bol termorezistent (niciodată în chiuvetă). Ține capacul într-o mână, toarnă încet 60 ml de apă într-un spațiu dintre chiftele, ferindu-te de stropi, și acoperă imediat. Pune tigaia înapoi pe foc mic și gătește la abur 8 minute.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'check',
          text: t(
            'Check that the patties are cooked through: a probe thermometer in the centre should read 71 °C, they should feel springy, and the juices must run clear with no pink inside. If not, cover and steam 1 to 2 minutes more. Move them to a warm plate and cover loosely with foil.',
            'Verifică dacă chiftelele sunt gătite complet: un termometru cu sondă în centru trebuie să arate 71 °C, să fie elastice la atingere, iar sucul să fie limpede, fără nimic roz în interior. Dacă nu, acoperă și mai gătește la abur 1-2 minute. Mută-le pe o farfurie caldă și acoperă-le lejer cu folie de aluminiu.',
          ),
        },
        {
          key: 'sauce',
          text: t(
            'In the same pan over medium heat, stir in the ketchup, Worcestershire sauce and red wine, scraping up the browned bits. Simmer for 3 minutes, until glossy and slightly thick, then take it off the heat and swirl in the butter.',
            'În aceeași tigaie, la foc mediu, adaugă ketchupul, sosul Worcestershire și vinul roșu, răzuind firimiturile rumenite. Fierbe 3 minute, până sosul devine lucios și puțin mai gros, apoi ia tigaia de pe foc și amestecă untul în sos.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'serve',
          text: t(
            'Spoon the sauce over the patties and serve with rice and a small salad.',
            'Toarnă sosul peste chiftele și servește cu orez și o salată mică.',
          ),
        },
      ],
      tips: [
        t(
          'Let the onion cool right down before mixing it in. Hot onion warms the fat in the mince and the patties turn greasy and slump.',
          'Lasă ceapa să se răcească bine înainte s-o amesteci. Ceapa fierbinte încălzește grăsimea din carne, iar chiftelele ies grase și se lățesc.',
        ),
      ],
      stepTips: [
        {
          step: 'shape',
          text: t(
            'Tossing the patty from hand to hand drives out air pockets. Skip it and the patty cracks and puffs as it cooks.',
            'Aruncarea chiftelei dintr-o mână în alta scoate bulele de aer. Dacă o sari, chifteaua crapă și se umflă la gătit.',
          ),
        },
      ],
      nutritionNote: t(
        'Beef and pork mince give protein, iron and B vitamins; the beef and pork fat and the butter add saturated fat, and the ketchup and Worcestershire sauce bring sugar and salt. There is no bun, the patty is seared in a little oil and finished with steam rather than fried through, and the onion adds a little fibre; serve it with plenty of vegetables, since the rice and panko are mostly refined carbohydrate.',
        'Carnea tocată de vită și porc aduce proteine, fier și vitamine din complexul B; grăsimea de vită și de porc, împreună cu untul, adaugă grăsimi saturate, iar ketchupul și sosul Worcestershire aduc zahăr și sare. Nu are chiflă, chifteaua e rumenită în puțin ulei și terminată la abur, nu prăjită complet, iar ceapa adaugă puține fibre; servește-o cu multe legume, pentru că orezul și panko sunt în mare parte carbohidrați rafinați.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t(
            'Japanese potato salad (potesara)',
            'Salată japoneză de cartofi (potesara)',
          ),
          reason: t(
            'Potesara is often served beside a hambāgu on a Japanese home plate; its cool creaminess is a soft contrast to the hot, saucy patty.',
            'Potesara se servește adesea lângă hambāgu într-o farfurie japoneză de casă; cremozitatea ei rece contrastează blând cu chifteaua fierbinte, cu sos.',
          ),
          principle: 'contrast_texture',
          recipe: 'potato-salad-japanese',
        },
        {
          kind: 'food',
          label: t('Japanese short-grain rice', 'Orez japonez cu bob scurt'),
          reason: t(
            'Soft, plain rice soaks up the sweet-and-tangy sauce and rounds out the plate.',
            'Orezul simplu și moale absoarbe sosul dulce-acrișor și completează farfuria.',
          ),
          principle: 'complement_flavour',
          ingredient: 'sushi-rice',
        },
        {
          kind: 'drink',
          label: t('Green tea', 'Ceai verde'),
          reason: t(
            'Its light bitterness cleans the palate after a rich, saucy bite.',
            'Amăreala ei ușoară curăță gustul după o îmbucătură bogată, cu sos.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'green-tea',
        },
        {
          kind: 'drink',
          label: t('Cold lager', 'Bere blondă rece'),
          reason: t(
            'Cold, crisp bubbles refresh the palate between rich, savoury bites.',
            'Bulele reci și răcoritoare împrospătează gustul între îmbucături bogate și sărate.',
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
            'A hot, saucy patty with rice is warming and filling.',
            'O chiftea fierbinte, cu sos și orez, încălzește și satură.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from the meat and egg helps muscles recover, and the rice brings carbohydrates.',
            'Proteinele din carne și ou ajută mușchii să se refacă, iar orezul aduce carbohidrați.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A rich, heavy meal late at night can make for a restless sleep.',
            'O masă bogată și grea seara târziu poate strica somnul.',
          ),
        },
      ],
    },
  ],
};
