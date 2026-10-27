import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Mici base is the Romanian skinless grilled sausage: beef and pork mince
// worked with garlic, cold bone stock, baking soda and savory, rested overnight
// and grilled. Each Variant is a full Recipe with its own lines, steps and
// guidance; the base's Recipe-level Tips are inherited unless a Variant hides
// them.
export const mici: BaseRecipeSeed = {
  slug: 'mici',
  title: t('Mici (Romanian grilled skinless sausages)', 'Mici'),
  servings: 6,
  prepMinutes: 750,
  cookMinutes: 35,
  difficulty: 'medium',
  lines: [
    { ingredient: 'minced-beef', quantity: 630, unit: 'g' },
    {
      ingredient: 'minced-pork',
      quantity: 270,
      unit: 'g',
      note: t('not too lean', 'nu prea slabă'),
    },
    {
      ingredient: 'garlic',
      quantity: 30,
      unit: 'g',
      note: t('about 8 cloves, crushed to a paste', 'cam 8 căței, pisați'),
    },
    {
      ingredient: 'beef-stock',
      quantity: 200,
      unit: 'ml',
      note: t('strong bone stock, cold', 'zeamă de oase concentrată, rece'),
    },
    { ingredient: 'baking-soda', quantity: 3, unit: 'g' },
    { ingredient: 'savory', quantity: 3, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 3, unit: 'g' },
    { ingredient: 'allspice', quantity: 2, unit: 'g' },
    { ingredient: 'ground-coriander', quantity: 2, unit: 'g' },
    { ingredient: 'paprika', quantity: 3, unit: 'g', optional: true },
    { ingredient: 'salt', quantity: 16, unit: 'g' },
    {
      ingredient: 'sunflower-oil',
      quantity: 20,
      unit: 'ml',
      note: t('for the grill rack', 'pentru grătar'),
    },
    {
      ingredient: 'mustard',
      quantity: 60,
      unit: 'g',
      note: t('to serve', 'pentru servit'),
    },
    {
      ingredient: 'bread',
      quantity: 1,
      unit: 'pcs',
      note: t('to serve', 'pentru servit'),
    },
  ],
  steps: [
    {
      key: 'garlic',
      text: t(
        'Crush the garlic with a pinch of the salt in a mortar, or with the flat of a knife, until it is a smooth paste.',
        'Pisează usturoiul cu un praf de sare într-un mojar sau cu partea lată a cuțitului, până devine o pastă fină.',
      ),
    },
    {
      key: 'stock',
      text: t(
        'Pour the cold stock into a small bowl and stir in the baking soda, savory, pepper, allspice, coriander and paprika.',
        'Toarnă zeama rece într-un castron mic și amestecă în ea bicarbonatul, cimbrul de grădină, piperul, ienibaharul, coriandrul și boiaua.',
      ),
    },
    {
      key: 'mix',
      text: t(
        'Put both minces in a large bowl with the garlic paste and the rest of the salt. Add the spiced stock a little at a time and knead with wet hands for 8 to 10 minutes, until the mixture is sticky, pale and comes away from the sides of the bowl in one mass.',
        'Pune ambele feluri de carne tocată într-un castron mare, împreună cu pasta de usturoi și restul de sare. Adaugă treptat zeama cu condimente și frământă cu mâinile ude 8-10 minute, până când compoziția devine lipicioasă, mai deschisă la culoare și se desprinde de pereții castronului dintr-o bucată.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'rest',
      text: t(
        'Cover the bowl and chill the mixture for at least 12 hours, up to 24. Do not shape it yet.',
        'Acoperă castronul și ține compoziția la frigider cel puțin 12 ore, cel mult 24. Nu o modela încă.',
      ),
      timerSeconds: 43200,
    },
    {
      key: 'preheat',
      text: t(
        'Light the charcoal about 20 minutes ahead (or heat a gas grill on high) until the coals are covered in grey ash. Scrub the rack and rub it with the oil on a folded paper towel.',
        'Aprinde cărbunii cu cam 20 de minute înainte (sau încinge grătarul pe gaz la maximum), până când se acoperă cu cenușă gri. Curăță grătarul cu peria și unge-l cu ulei, cu un prosop de hârtie împăturit.',
      ),
      timerSeconds: 1200,
    },
    {
      key: 'shape',
      text: t(
        'With wet hands, take about 48 g of mixture (a large golf-ball-sized lump) and roll it into a cylinder about 9 cm long and 2.5 cm thick, pressing lightly so it holds. You should get about 24. Keep the shaped ones on a tray in the fridge until the grill is ready.',
        'Cu mâinile ude, ia cam 48 g de compoziție (cât o minge mare de golf) și rulează-o într-un cilindru de aproximativ 9 cm lungime și 2,5 cm grosime, apăsând ușor ca să țină. Ar trebui să iasă cam 24. Ține mititeii modelați pe o tavă la frigider până se încinge grătarul.',
      ),
    },
    {
      key: 'grill',
      text: t(
        'Lay the mici on the hot rack, close together but not touching, and leave them for 3 minutes without moving them, until they release from the rack. Then turn them every 2 to 3 minutes for 13 to 15 minutes in all, until browned all over with a few charred spots.',
        'Așază mititeii pe grătarul fierbinte, aproape unul de altul, dar fără să se atingă, și lasă-i 3 minute fără să-i miști, până se desprind singuri de pe grătar. Apoi întoarce-i la fiecare 2-3 minute, în total 13-15 minute, până se rumenesc peste tot, cu câteva pete arse.',
      ),
      timerSeconds: 840,
    },
    {
      key: 'check',
      text: t(
        'Cut the thickest one open: there must be no pink, the juices must run clear, and the centre should reach at least 71 °C. Put back any that are not done.',
        'Taie în două cel mai gros mic: nu trebuie să fie roz, sucul trebuie să fie limpede, iar centrul trebuie să atingă cel puțin 71 °C. Pune la loc pe grătar pe cei care nu sunt gata.',
      ),
    },
    {
      key: 'serve',
      text: t(
        'Serve straight away, hot, with mustard and fresh bread.',
        'Servește imediat, fierbinți, cu muștar și pâine proaspătă.',
      ),
    },
    {
      key: 'store',
      text: t(
        'Cool any leftovers within 2 hours and keep them in the fridge for up to 3 days; reheat until steaming hot all the way through. Shaped raw mici freeze well on a tray, then in a bag, for up to 2 months; grill them from frozen on lower heat, or thaw them in the fridge first.',
        'Lasă resturile să se răcească în maximum 2 ore și păstrează-le la frigider până la 3 zile; reîncălzește-le până sunt fierbinți în toată grosimea. Mititeii crudi, modelați, se pot congela pe o tavă, apoi într-o pungă, până la 2 luni; coace-i pe grătar la foc mai mic direct din congelator sau dezgheață-i mai întâi la frigider.',
      ),
    },
  ],
  tips: [
    t(
      'Fry a spoonful of the mixture in a pan until it is cooked through, then taste it. It is the safe way to check the salt, since raw mince should not be tasted, before you shape the whole batch.',
      'Prăjește o lingură din compoziție într-o tigaie, până se face bine, și gust-o. E singurul mod sigur de a verifica sarea, fiindcă nu se gustă carne crudă, înainte de a modela tot restul.',
    ),
    t(
      'Do not buy the leanest mince: the fat is what keeps mici juicy, and they dry out fast without it.',
      'Nu lua cea mai slabă carne tocată: grăsimea ține mititeii suculenți, iar fără ea se usucă repede.',
    ),
    t(
      'Never press them down with a spatula; it squeezes out the juices and they turn dry.',
      'Nu-i apăsa cu spatula; scoți sucul din ei și ies uscați.',
    ),
  ],
  stepTips: [
    {
      step: 'mix',
      text: t(
        'Keep the stock cold and add it slowly. If it goes in all at once the mixture turns slippery and will not hold its shape.',
        'Ține zeama rece și toarn-o treptat. Dacă o torni deodată, compoziția devine alunecoasă și nu își mai ține forma.',
      ),
    },
    {
      step: 'rest',
      text: t(
        'The long rest lets the salt and garlic work through the meat and the mixture firm up, which makes it much easier to roll.',
        'Odihna lungă lasă sarea și usturoiul să pătrundă în carne, iar compoziția se întărește și se modelează mult mai ușor.',
      ),
    },
    {
      step: 'grill',
      text: t(
        'Keep a cooler corner on the grill for flare-ups: when the fat catches fire, move the mici there, because flames blacken them without cooking them through.',
        'Lasă pe grătar un colț mai puțin fierbinte pentru flăcări: când se aprinde grăsimea, mută mititeii acolo, pentru că flăcările îi înnegresc fără să-i facă și în interior.',
      ),
    },
  ],
  nutritionNote: t(
    'Rich in protein and filling. The pork fat and the beef bring plenty of saturated fat, the mix is quite salty, and charred spots from the grill are best kept small. Fresh bread adds carbohydrate but the mici have no fibre of their own, so serve them with a salad or pickles.',
    'Bogați în proteine și sățioși. Grăsimea de porc și carnea de vită aduc multe grăsimi saturate, compoziția e destul de sărată, iar petele arse de pe grătar e bine să fie cât mai puține. Pâinea proaspătă adaugă carbohidrați, dar mititeii nu conțin fibre, așa că servește-i cu salată sau murături.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'The sour brine cuts the fat of the grilled meat.',
        'Zeama acră taie grăsimea cărnii de la grătar.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'food',
      label: t('French fries', 'Cartofi prăjiți'),
      reason: t(
        'Crisp fries soak up the juices and set a crunch against the soft meat.',
        'Cartofii crocanți absorb sucul și contrastează cu carnea moale.',
      ),
      principle: 'contrast_texture',
      ingredient: 'french-fries',
    },
    {
      kind: 'food',
      label: t('Tomato salad', 'Salată de roșii'),
      reason: t(
        'Juicy, slightly acidic tomatoes freshen a plate of rich meat.',
        'Roșiile zemoase, ușor acidulate, înviorează o farfurie cu carne grasă.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'tomato',
    },
    {
      kind: 'drink',
      label: t('Cold lager', 'Bere blondă rece'),
      reason: t(
        'Bitterness and bubbles cut through the fat and refresh the mouth.',
        'Amăreala și bulele taie grăsimea și răcoresc gura.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'beer',
    },
    {
      kind: 'drink',
      label: t('Sparkling water', 'Apă minerală'),
      reason: t(
        'Cleans the palate between salty, garlicky bites.',
        'Curăță gustul între îmbucăturile sărate, cu usturoi.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'sparkling-water',
    },
  ],
  eatingMoments: [
    {
      moment: 'hot-day',
      polarity: 'good_for',
      reason: t(
        'Cooked outdoors on the grill, so the kitchen stays cool.',
        'Se gătesc afară, la grătar, așa că bucătăria rămâne răcoroasă.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Protein helps muscles recover; add bread or potatoes for carbohydrate.',
        'Proteinele ajută mușchii să se refacă; adaugă pâine sau cartofi pentru carbohidrați.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Fatty, salty meat sits heavy in the stomach during hard exercise.',
        'Carnea grasă și sărată cade greu la stomac în timpul unui efort intens.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A heavy, salty, garlicky meal late at night can disturb sleep.',
        'O masă grea, sărată și cu usturoi, seara târziu, poate deranja somnul.',
      ),
    },
  ],
  variants: [
    {
      slug: 'mici-middle-eastern',
      cuisine: 'middle-eastern',
      title: t(
        'Kofta kebab (grilled lamb kofta)',
        'Kofta kebab (frigărui din carne tocată de miel)',
      ),
      servings: 4,
      prepMinutes: 90,
      cookMinutes: 35,
      difficulty: 'easy',
      lines: [
        { ingredient: 'minced-lamb', quantity: 600, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('grated and squeezed dry', 'rasă și bine stoarsă de zeamă'),
        },
        {
          ingredient: 'parsley',
          quantity: 30,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        {
          ingredient: 'garlic',
          quantity: 12,
          unit: 'g',
          note: t('about 3 cloves, crushed', 'cam 3 căței, pisați'),
        },
        { ingredient: 'cumin', quantity: 4, unit: 'g' },
        { ingredient: 'ground-coriander', quantity: 3, unit: 'g' },
        { ingredient: 'allspice', quantity: 2, unit: 'g' },
        { ingredient: 'cinnamon', quantity: 1, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
        {
          ingredient: 'salt',
          quantity: 11,
          unit: 'g',
          note: t('for the meat', 'pentru carne'),
        },
        {
          ingredient: 'salt',
          key: 'salt-sides',
          quantity: 2,
          unit: 'g',
          note: t('for the onions and the sauce', 'pentru ceapă și sos'),
        },
        {
          ingredient: 'sunflower-oil',
          quantity: 15,
          unit: 'ml',
          note: t('for the grill rack', 'pentru grătar'),
        },
        { ingredient: 'pita', quantity: 4, unit: 'pcs' },
        { ingredient: 'tahini', quantity: 60, unit: 'g' },
        {
          ingredient: 'still-water',
          quantity: 0.06,
          unit: 'l',
          note: t('for the tahini sauce', 'pentru sosul de tahini'),
        },
        {
          ingredient: 'garlic',
          key: 'garlic-sauce',
          quantity: 4,
          unit: 'g',
          note: t('1 small clove, grated', '1 cățel mic, ras'),
        },
        { ingredient: 'lemon', quantity: 1, unit: 'pcs' },
        {
          ingredient: 'tomato',
          quantity: 300,
          unit: 'g',
          note: t('sliced', 'tăiate felii'),
        },
        {
          ingredient: 'red-onion',
          quantity: 1,
          unit: 'pcs',
          note: t('sliced very thin', 'tăiată foarte subțire'),
        },
        { ingredient: 'sumac', quantity: 3, unit: 'g' },
      ],
      steps: [
        {
          key: 'mix',
          text: t(
            'Put the lamb in a bowl with the grated onion, parsley, garlic, cumin, coriander, allspice, cinnamon, pepper and the salt for the meat. Knead for 3 to 4 minutes, until the mixture turns sticky and holds together.',
            'Pune carnea de miel într-un castron, cu ceapa rasă, pătrunjelul, usturoiul, chimionul, coriandrul, ienibaharul, scorțișoara, piperul și sarea pentru carne. Frământă 3-4 minute, până când compoziția devine lipicioasă și se ține bine.',
          ),
          timerSeconds: 210,
        },
        {
          key: 'chill',
          text: t(
            'Cover the bowl and chill the mixture for 1 hour, so it firms up and stays on the skewers.',
            'Acoperă castronul și ține compoziția la frigider 1 oră, ca să se întărească și să rămână pe frigărui.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'sides',
          text: t(
            'Toss the red onion with the sumac, the salt for the onions and the juice of half the lemon. Whisk the tahini with the grated garlic, a pinch of the salt, the juice of the other half lemon and the water, a little at a time, until smooth and pourable like cream.',
            'Amestecă ceapa roșie cu sumacul, sarea pentru ceapă și sucul de la jumătate de lămâie. Bate tahini cu usturoiul ras, un praf de sare, sucul de la cealaltă jumătate de lămâie și apa, puțin câte puțin, până se face un sos fin, care curge ca smântâna.',
          ),
        },
        {
          key: 'preheat',
          text: t(
            'Heat the grill for 20 minutes, or a ridged grill pan on high for about 5 minutes. Rub the rack or pan with the oil.',
            'Încinge grătarul 20 de minute sau o tigaie-grill la foc mare cam 5 minute. Unge grătarul sau tigaia cu ulei.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'shape',
          text: t(
            'With wet hands, divide the mixture into 8 portions of about 85 g. Press each one around a flat skewer into a sausage about 12 cm long, pinching lightly along it for ridges. Wooden skewers must be soaked in water beforehand.',
            'Cu mâinile ude, împarte compoziția în 8 porții de cam 85 g. Apasă fiecare porție în jurul unei frigărui late, într-un cârnat de aproximativ 12 cm, strângându-l ușor cu degetele ca să facă dungi. Frigăruile de lemn trebuie înmuiate în apă dinainte.',
          ),
        },
        {
          key: 'grill',
          text: t(
            'Grill the kofta for 8 to 10 minutes, turning every 2 to 3 minutes, until browned all over. Cut one open: there must be no pink and the centre should reach at least 71 °C.',
            'Coace kofta pe grătar 8-10 minute, întorcând frigăruile la fiecare 2-3 minute, până se rumenesc peste tot. Taie una în două: nu trebuie să fie roz, iar centrul trebuie să atingă cel puțin 71 °C.',
          ),
          timerSeconds: 540,
        },
        {
          key: 'pita',
          text: t(
            'Warm the pita on the grill for about 30 seconds on each side, then keep it wrapped in a clean cloth.',
            'Încălzește lipiile pe grătar cam 30 de secunde pe fiecare parte, apoi ține-le înfășurate într-un prosop curat.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'serve',
          text: t(
            'Slide the kofta off the skewers into the pita with tomato, sumac onions and a spoonful of tahini sauce. Cool leftovers within 2 hours and keep them in the fridge for up to 3 days; reheat until steaming hot.',
            'Trage kofta de pe frigărui în lipii, cu roșii, ceapa cu sumac și o lingură de sos de tahini. Lasă resturile să se răcească în maximum 2 ore, păstrează-le la frigider până la 3 zile și reîncălzește-le până sunt fierbinți.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'shape',
          text: t(
            'Squeezing the grated onion dry matters: wet onion makes the mixture slide off the skewer.',
            'Ceapa rasă trebuie stoarsă bine: dacă e udă, compoziția alunecă de pe frigărui.',
          ),
        },
      ],
      nutritionNote: t(
        'Protein-rich, with parsley, onion and tomato adding some vegetables. Lamb is a fatty meat with plenty of saturated fat, tahini adds more fat (mostly unsaturated), and pita is mostly refined carbohydrate. Keep the salt moderate.',
        'Bogată în proteine, cu pătrunjel, ceapă și roșii care adaugă legume. Mielul e o carne grasă, cu multe grăsimi saturate, tahini aduce și mai multă grăsime (mai ales nesaturată), iar lipia e în mare parte carbohidrați rafinați. Folosește sare cu măsură.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Vermicelli rice pilaf', 'Pilaf de orez cu fidea'),
          reason: t(
            'Buttery rice takes up the lamb juices and the tahini sauce.',
            'Orezul cu unt absoarbe sucul mielului și sosul de tahini.',
          ),
          principle: 'complement_flavour',
          recipe: 'rice-pilaf-middle-eastern',
        },
        {
          kind: 'food',
          label: t('Cucumber', 'Castravete'),
          reason: t(
            'Cool, crisp slices set a fresh crunch against the spiced meat.',
            'Felii răcoroase și crocante, un contrast proaspăt pentru carnea condimentată.',
          ),
          principle: 'contrast_texture',
          ingredient: 'cucumber',
        },
        {
          kind: 'drink',
          label: t('Drinking yogurt (ayran)', 'Iaurt de băut (ayran)'),
          reason: t(
            'Cold, tangy and salty-sour, it soothes the spices and refreshes the mouth.',
            'Rece, acrișor și ușor sărat, calmează condimentele și răcorește gura.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'drinking-yogurt',
        },
      ],
      eatingMoments: [
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Grilled quickly, with cool tomato, onion and cucumber alongside.',
            'Se fac repede la grătar și se servesc cu roșii, ceapă și castravete răcoroase.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from the lamb and carbohydrate from the pita.',
            'Proteine din miel și carbohidrați din lipie.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Fatty lamb and raw onion are heavy right before bed.',
            'Mielul gras și ceapa crudă cad greu înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'mici-balkan',
      cuisine: 'balkan',
      title: t(
        'Ćevapi (Bosnian grilled minced-beef rolls)',
        'Ćevapi (mici bosniaci de vită)',
      ),
      servings: 4,
      prepMinutes: 560,
      cookMinutes: 35,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'minced-beef',
          quantity: 600,
          unit: 'g',
          note: t('not too lean', 'nu prea slabă'),
        },
        {
          ingredient: 'garlic',
          quantity: 8,
          unit: 'g',
          optional: true,
          note: t(
            '2 cloves, crushed to a paste; Sarajevo ćevapi leave it out',
            '2 căței, pisați; ćevapi de Sarajevo se fac fără',
          ),
        },
        { ingredient: 'baking-soda', quantity: 2, unit: 'g' },
        {
          ingredient: 'sparkling-water',
          quantity: 0.06,
          unit: 'l',
          note: t('cold', 'rece'),
        },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
        { ingredient: 'salt', quantity: 10, unit: 'g' },
        {
          ingredient: 'sunflower-oil',
          quantity: 15,
          unit: 'ml',
          note: t('for the grill rack', 'pentru grătar'),
        },
        { ingredient: 'somun', quantity: 4, unit: 'pcs' },
        {
          ingredient: 'kajmak',
          quantity: 100,
          unit: 'g',
        },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('finely chopped, raw', 'tocate mărunt, crude'),
        },
      ],
      steps: [
        {
          key: 'mix',
          text: t(
            'Stir the baking soda into the cold sparkling water. Put the mince in a large bowl with the crushed garlic (if using), salt and pepper, add the water a little at a time and knead for 8 minutes, until the mixture is sticky, smooth and comes away from the bowl.',
            'Amestecă bicarbonatul în apa minerală rece. Pune carnea tocată într-un castron mare, cu usturoiul pisat (dacă îl folosești), sarea și piperul, adaugă treptat apa și frământă 8 minute, până când compoziția e lipicioasă, netedă și se desprinde de castron.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'rest',
          text: t(
            'Cover the bowl and chill the mixture for at least 8 hours, up to 24.',
            'Acoperă castronul și ține compoziția la frigider cel puțin 8 ore, cel mult 24.',
          ),
          timerSeconds: 28800,
        },
        {
          key: 'preheat',
          text: t(
            'Heat the grill on high for 20 minutes, until the coals are covered in grey ash, and rub the rack with the oil.',
            'Încinge grătarul la maximum 20 de minute, până când cărbunii se acoperă cu cenușă gri, și unge grătarul cu ulei.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'shape',
          text: t(
            'With wet hands, take about 15 g of mixture and roll it into a little finger-thick roll about 6 cm long. You should get about 40.',
            'Cu mâinile ude, ia cam 15 g de compoziție și rulează-o într-un cilindru gros cât un deget mic, lung de cam 6 cm. Ar trebui să iasă cam 40.',
          ),
        },
        {
          key: 'grill',
          text: t(
            'Grill the ćevapi for 8 to 10 minutes, turning them every 2 minutes, until browned all over. Cut one open: there must be no pink and the centre should reach at least 71 °C.',
            'Coace ćevapi pe grătar 8-10 minute, întorcându-i la fiecare 2 minute, până se rumenesc peste tot. Taie unul în două: nu trebuie să fie roz, iar centrul trebuie să atingă cel puțin 71 °C.',
          ),
          timerSeconds: 540,
        },
        {
          key: 'somun',
          text: t(
            'Sprinkle each somun with a little water and warm it on the edge of the grill for about 20 seconds on each side, until soft and hot.',
            'Stropește fiecare somun cu puțină apă și încălzește-l la marginea grătarului cam 20 de secunde pe fiecare parte, până devine moale și fierbinte.',
          ),
          timerSeconds: 40,
        },
        {
          key: 'serve',
          text: t(
            'Split each somun open, spread it with kajmak, and fill with 10 ćevapi and chopped raw onion. Cool leftovers within 2 hours and keep them in the fridge for up to 3 days; reheat until steaming hot.',
            'Deschide fiecare somun, întinde pe el caimac și umple-l cu 10 ćevapi și ceapă crudă tocată. Lasă resturile să se răcească în maximum 2 ore, păstrează-le la frigider până la 3 zile și reîncălzește-le până sunt fierbinți.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'shape',
          text: t(
            'Keep the pieces all the same size so they cook at the same speed.',
            'Păstrează bucățile de aceeași mărime, ca să se gătească în același timp.',
          ),
        },
      ],
      nutritionNote: t(
        'Rich in protein. Beef mince, kajmak and somun make it filling but heavy: kajmak is a fatty dairy product with plenty of saturated fat, the white bread is mostly refined carbohydrate, and the raw onion is the only vegetable. Add a salad and go easy on the salt.',
        'Bogat în proteine. Carnea de vită, caimacul și somunul îl fac săturător, dar greu: caimacul e un lactat gras, cu multe grăsimi saturate, pâinea albă e mai ales carbohidrați rafinați, iar ceapa crudă e singura legumă. Adaugă o salată și folosește sare cu măsură.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Pickled peppers', 'Ardei murați'),
          reason: t(
            'Their sharp brine cuts through the beef and the kajmak.',
            'Zeama lor acră taie bogăția cărnii și a caimacului.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-peppers',
        },
        {
          kind: 'food',
          label: t('French fries', 'Cartofi prăjiți'),
          reason: t(
            'Crisp fries add a crunch beside the soft rolls.',
            'Cartofii crocanți adaugă un contrast lângă rulourile moi.',
          ),
          principle: 'contrast_texture',
          ingredient: 'french-fries',
        },
        {
          kind: 'drink',
          label: t('Drinking yogurt', 'Iaurt de băut'),
          reason: t(
            'Cold and tangy, it refreshes the mouth after fatty meat and cream.',
            'Rece și acrișor, răcorește gura după carnea grasă și caimac.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'drinking-yogurt',
        },
        {
          kind: 'drink',
          label: t('Cold lager', 'Bere blondă rece'),
          reason: t(
            'Its bitterness balances the rich, salty meat.',
            'Amăreala ei echilibrează carnea bogată și sărată.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'beer',
        },
      ],
      eatingMoments: [
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from the beef and carbohydrate from the bread.',
            'Proteine din vită și carbohidrați din pâine.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Cooked outdoors on the grill, so the kitchen stays cool.',
            'Se gătesc afară, la grătar, așa că bucătăria rămâne răcoroasă.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Fatty meat and kajmak in white bread are heavy before bed.',
            'Carnea grasă și caimacul în pâine albă cad greu înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'mici-oven-baked',
      method: 'oven-baked',
      // The rack never sticks and nothing is turned with a spatula.
      hideBaseTips: [2],
      title: t('Oven-baked mici', 'Mici la cuptor'),
      servings: 6,
      prepMinutes: 750,
      cookMinutes: 35,
      difficulty: 'easy',
      lines: [
        { ingredient: 'minced-beef', quantity: 630, unit: 'g' },
        {
          ingredient: 'minced-pork',
          quantity: 270,
          unit: 'g',
          note: t('not too lean', 'nu prea slabă'),
        },
        {
          ingredient: 'garlic',
          quantity: 30,
          unit: 'g',
          note: t('about 8 cloves, crushed to a paste', 'cam 8 căței, pisați'),
        },
        {
          ingredient: 'beef-stock',
          quantity: 200,
          unit: 'ml',
          note: t('strong bone stock, cold', 'zeamă de oase concentrată, rece'),
        },
        { ingredient: 'baking-soda', quantity: 3, unit: 'g' },
        { ingredient: 'savory', quantity: 3, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 3, unit: 'g' },
        { ingredient: 'allspice', quantity: 2, unit: 'g' },
        { ingredient: 'ground-coriander', quantity: 2, unit: 'g' },
        { ingredient: 'paprika', quantity: 3, unit: 'g', optional: true },
        { ingredient: 'salt', quantity: 16, unit: 'g' },
        {
          ingredient: 'sunflower-oil',
          quantity: 20,
          unit: 'ml',
          note: t('for the rack', 'pentru grătarul din cuptor'),
        },
        {
          ingredient: 'mustard',
          quantity: 60,
          unit: 'g',
          note: t('to serve', 'pentru servit'),
        },
        {
          ingredient: 'bread',
          quantity: 1,
          unit: 'pcs',
          note: t('to serve', 'pentru servit'),
        },
      ],
      steps: [
        {
          key: 'garlic',
          text: t(
            'Crush the garlic with a pinch of the salt until it is a smooth paste.',
            'Pisează usturoiul cu un praf de sare, până devine o pastă fină.',
          ),
        },
        {
          key: 'stock',
          text: t(
            'Pour the cold stock into a small bowl and stir in the baking soda, savory, pepper, allspice, coriander and paprika.',
            'Toarnă zeama rece într-un castron mic și amestecă în ea bicarbonatul, cimbrul de grădină, piperul, ienibaharul, coriandrul și boiaua.',
          ),
        },
        {
          key: 'mix',
          text: t(
            'Put both minces in a large bowl with the garlic paste and the rest of the salt. Add the spiced stock a little at a time and knead with wet hands for 8 to 10 minutes, until the mixture is sticky, pale and comes away from the sides of the bowl in one mass.',
            'Pune ambele feluri de carne tocată într-un castron mare, împreună cu pasta de usturoi și restul de sare. Adaugă treptat zeama cu condimente și frământă cu mâinile ude 8-10 minute, până când compoziția devine lipicioasă, mai deschisă la culoare și se desprinde de pereții castronului dintr-o bucată.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'rest',
          text: t(
            'Cover the bowl and chill the mixture for at least 12 hours, up to 24. Do not shape it yet.',
            'Acoperă castronul și ține compoziția la frigider cel puțin 12 ore, cel mult 24. Nu o modela încă.',
          ),
          timerSeconds: 43200,
        },
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 250 °C (230 °C fan), or as high as it goes, for 20 minutes, with a shelf in the upper third. Line a deep tray with foil, set a wire rack on it and rub the rack with the oil.',
            'Încinge cuptorul la 250 °C (230 °C cu ventilator), sau cât de tare merge, timp de 20 de minute, cu grătarul în treimea de sus. Tapetează o tavă adâncă cu folie, pune deasupra un grătar metalic și unge-l cu ulei.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'shape',
          text: t(
            'With wet hands, take about 48 g of mixture (a large golf-ball-sized lump) and roll it into a cylinder about 9 cm long and 2.5 cm thick. You should get about 24. Set them on the rack, a finger apart.',
            'Cu mâinile ude, ia cam 48 g de compoziție (cât o minge mare de golf) și rulează-o într-un cilindru de aproximativ 9 cm lungime și 2,5 cm grosime. Ar trebui să iasă cam 24. Așază-i pe grătar, la distanță de un deget unul de altul.',
          ),
        },
        {
          key: 'bake-first',
          text: t(
            'Slide the tray into the oven and bake for 8 minutes, until the tops are browned.',
            'Introdu tava în cuptor și coace 8 minute, până se rumenește partea de sus.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'bake-second',
          text: t(
            'Turn the mici over once and bake for another 8 minutes, until browned all over.',
            'Întoarce mititeii o singură dată și mai coace-i 8 minute, până se rumenesc peste tot.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'check',
          text: t(
            'Cut the thickest one open: there must be no pink, the juices must run clear, and the centre should reach at least 71 °C. Bake any that are not done for 2 minutes more.',
            'Taie în două cel mai gros mic: nu trebuie să fie roz, sucul trebuie să fie limpede, iar centrul trebuie să atingă cel puțin 71 °C. Mai coace 2 minute pe cei care nu sunt gata.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'serve',
          text: t(
            'Serve hot with mustard and fresh bread.',
            'Servește fierbinți, cu muștar și pâine proaspătă.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Cool any leftovers within 2 hours and keep them in the fridge for up to 3 days; reheat until steaming hot all the way through. Shaped raw mici freeze well on a tray, then in a bag, for up to 2 months; thaw them in the fridge before baking.',
            'Lasă resturile să se răcească în maximum 2 ore și păstrează-le la frigider până la 3 zile; reîncălzește-le până sunt fierbinți în toată grosimea. Mititeii crudi, modelați, se pot congela pe o tavă, apoi într-o pungă, până la 2 luni; dezgheață-i la frigider înainte de copt.',
          ),
        },
      ],
      tips: [
        t(
          'Pour about 200 ml of hot water into the foil-lined tray, under the rack, before it goes into the oven: the dripping fat then does not burn and smoke. Never add water to a tray that already holds hot fat.',
          'Toarnă cam 200 ml de apă fierbinte în tava tapetată cu folie, sub grătar, înainte să intre în cuptor: grăsimea care picură nu se arde și nu face fum. Nu turna niciodată apă într-o tavă în care e deja grăsime fierbinte.',
        ),
      ],
      stepTips: [
        {
          step: 'stock',
          text: t(
            'The oven gives a browned crust but no smoky flavour; for the paprika, use smoked paprika instead of sweet.',
            'Cuptorul dă o crustă rumenă, dar nu gust de afumat; ca boia, folosește boia afumată în loc de cea dulce.',
          ),
        },
      ],
      nutritionNote: t(
        'Rich in protein. Baked on a rack, the fat drips away from the mici and there is no char from the grill, but the pork and beef still bring a lot of saturated fat and the mix is salty. Serve with salad or pickles for fibre, which the mici lack.',
        'Bogați în proteine și sățioși. Copți pe un grătar metalic deasupra tăvii, grăsimea se scurge din mititei și nu apar pete arse ca la grătar, dar porcul și vita aduc tot multe grăsimi saturate, iar compoziția e sărată. Servește-i cu salată sau murături pentru fibre, care lipsesc din mici.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Pickled cucumbers', 'Castraveți murați'),
          reason: t(
            'The sour brine cuts the fat of the baked meat.',
            'Zeama acră taie grăsimea cărnii coapte.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-cucumbers',
        },
        {
          kind: 'food',
          label: t('Potato wedges', 'Cartofi wedges'),
          reason: t(
            'Their crisp edges contrast with the soft meat.',
            'Marginile lor crocante contrastează cu carnea moale.',
          ),
          principle: 'contrast_texture',
          ingredient: 'potato-wedges',
        },
        {
          kind: 'drink',
          label: t('Cold lager', 'Bere blondă rece'),
          reason: t(
            'Bitterness and bubbles cut through the fat and refresh the mouth.',
            'Amăreala și bulele taie grăsimea și răcoresc gura.',
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
            'The hot oven warms the kitchen, and the meal is filling.',
            'Cuptorul încins încălzește bucătăria, iar masa este săturătoare.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein helps muscles recover; add bread for carbohydrate.',
            'Proteinele ajută mușchii să se refacă; adaugă pâine pentru carbohidrați.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A heavy, salty, garlicky meal late at night can disturb sleep.',
            'O masă grea, sărată și cu usturoi, seara târziu, poate deranja somnul.',
          ),
        },
      ],
    },
  ],
};
