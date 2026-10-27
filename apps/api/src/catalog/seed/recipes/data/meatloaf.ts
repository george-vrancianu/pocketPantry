import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Meatloaf base is a baked beef-and-pork loaf with a ketchup glaze. Each
// Variant is a full Recipe with its own lines, steps and guidance; the base's
// Recipe-level Tips are inherited.
export const meatloaf: BaseRecipeSeed = {
  slug: 'meatloaf',
  title: t(
    'Meatloaf with ketchup glaze',
    'Meatloaf (ruladă de carne tocată la cuptor, cu glazură de ketchup)',
  ),
  servings: 6,
  prepMinutes: 40,
  cookMinutes: 70,
  difficulty: 'easy',
  lines: [
    { ingredient: 'minced-beef', quantity: 450, unit: 'g' },
    { ingredient: 'minced-pork', quantity: 450, unit: 'g' },
    { ingredient: 'breadcrumbs', quantity: 60, unit: 'g' },
    { ingredient: 'milk', quantity: 0.12, unit: 'l' },
    {
      ingredient: 'onion',
      quantity: 1,
      unit: 'pcs',
      note: t('finely chopped', 'tocată mărunt'),
    },
    {
      ingredient: 'garlic',
      quantity: 10,
      unit: 'g',
      note: t('crushed', 'zdrobit'),
    },
    { ingredient: 'sunflower-oil', quantity: 15, unit: 'ml' },
    { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
    { ingredient: 'worcestershire-sauce', quantity: 15, unit: 'ml' },
    {
      ingredient: 'ketchup',
      key: 'ketchup-mix',
      quantity: 40,
      unit: 'g',
      note: t('for the meat mixture', 'pentru amestecul de carne'),
    },
    {
      ingredient: 'parsley',
      quantity: 15,
      unit: 'g',
      note: t('finely chopped', 'tocat mărunt'),
    },
    { ingredient: 'dried-thyme', quantity: 2, unit: 'g' },
    { ingredient: 'salt', quantity: 9, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
    {
      ingredient: 'ketchup',
      key: 'ketchup-glaze',
      quantity: 80,
      unit: 'g',
      note: t('for the glaze', 'pentru glazură'),
    },
    { ingredient: 'brown-sugar', quantity: 25, unit: 'g' },
    { ingredient: 'apple-cider-vinegar', quantity: 15, unit: 'ml' },
  ],
  steps: [
    {
      key: 'preheat',
      text: t(
        'Heat the oven to 180 °C (conventional, not fan) and line a baking tray with baking paper. The oven needs about 15 minutes to get there; carry on with the next steps meanwhile.',
        'Încălzește cuptorul la 180 °C (fără ventilator) și tapetează o tavă cu hârtie de copt. Cuptorul are nevoie de aproximativ 15 minute; continuă între timp cu pașii următori.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'soak',
      text: t(
        'Stir the breadcrumbs into the milk in a large bowl and leave them to soak for 5 minutes, until they have swallowed the milk and form a thick paste.',
        'Amestecă pesmetul cu laptele într-un castron mare și lasă-l 5 minute să se înmoaie, până absoarbe laptele și devine o pastă groasă.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'onion',
      text: t(
        'While the breadcrumbs soak, warm the oil in a pan over medium heat and soften the onion for about 8 minutes, stirring now and then, until translucent and not browned. Add the garlic for the last minute.',
        'Cât timp se înmoaie pesmetul, încălzește uleiul într-o tigaie la foc mediu și călește ceapa aproximativ 8 minute, amestecând din când în când, până devine translucidă, fără să se rumenească. Adaugă usturoiul în ultimul minut.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'cool',
      text: t(
        'Tip the onion onto a plate and leave it to cool for about 10 minutes, until it is no longer hot to the touch.',
        'Pune ceapa pe o farfurie și lasă-o aproximativ 10 minute să se răcească, până nu mai e fierbinte la atingere.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'glaze-mix',
      text: t(
        'Stir the 80 g of ketchup, the brown sugar and the vinegar together and divide the glaze between two clean bowls. Do this before you touch the raw meat.',
        'Amestecă cele 80 g de ketchup, zahărul brun și oțetul și împarte glazura în două castroane curate. Fă asta înainte să atingi carnea crudă.',
      ),
    },
    {
      key: 'mix',
      text: t(
        'Add both minces, the cooled onion, eggs, Worcestershire sauce, the 40 g of ketchup, parsley, thyme, salt and pepper to the soaked breadcrumbs. Mix with your hand for about a minute, only until everything is evenly combined.',
        'Adaugă la pesmetul înmuiat ambele feluri de carne tocată, ceapa răcită, ouăle, sosul Worcestershire, cele 40 g de ketchup, pătrunjelul, cimbrișorul, sarea și piperul. Amestecă cu mâna aproximativ un minut, doar până se omogenizează.',
      ),
    },
    {
      key: 'shape',
      text: t(
        'Shape the mixture into a loaf about 22 cm long and 10 cm wide on the lined tray, smoothing the top and sides.',
        'Modelează compoziția într-o ruladă lungă de aproximativ 22 cm și lată de 10 cm, pe tava tapetată, netezind partea de sus și laturile.',
      ),
    },
    {
      key: 'glaze',
      text: t(
        'Brush the glaze from the first bowl over the raw loaf. Keep the other bowl covered for later.',
        'Unge rulada crudă cu glazura din primul castron. Ține celălalt castron acoperit pentru mai târziu.',
      ),
    },
    {
      key: 'wash',
      text: t(
        'Wash your hands, the mixing bowl, the pastry brush and the first glaze bowl in hot soapy water.',
        'Spală-ți mâinile, castronul în care ai amestecat, pensula și primul castron de glazură cu apă fierbinte și detergent.',
      ),
    },
    {
      key: 'bake',
      text: t(
        'Bake the loaf for 45 minutes, until the top is lightly browned and the sides have firmed.',
        'Coace rulada 45 de minute, până se rumenește ușor deasupra și laturile se întăresc.',
      ),
      timerSeconds: 2700,
    },
    {
      key: 'glaze-again',
      text: t(
        'Brush the loaf with the glaze from the clean bowl, using a clean brush, and bake for another 15 minutes, until the glaze is sticky and darker at the edges.',
        'Unge rulada cu glazura din castronul curat, cu o pensulă curată, și mai coace-o încă 15 minute, până când glazura devine lipicioasă și mai închisă la margini.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'check',
      text: t(
        'Push a probe thermometer into the centre of the loaf. It must read at least 71 °C, with clear juices; the thermometer decides, not the colour. If not, bake in 5-minute rounds until it does (usually no more than 70 minutes in all).',
        'Înfige un termometru cu sondă în centrul ruladei. Trebuie să arate cel puțin 71 °C, cu suc limpede; termometrul decide, nu culoarea. Dacă nu, mai coace câte 5 minute până ajunge (de obicei nu mai mult de 70 de minute în total).',
      ),
    },
    {
      key: 'rest',
      text: t(
        'Leave the loaf to rest on the tray for 10 minutes, so the juices settle and the slices hold together.',
        'Lasă rulada să se odihnească 10 minute pe tavă, ca sucurile să se așeze și feliile să nu se rupă.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'slice',
      text: t(
        'Lift the loaf onto a clean board and cut it into 2 cm slices with a serrated knife. Serve hot.',
        'Mută rulada pe un tocător curat și taie-o în felii groase de 2 cm cu un cuțit zimțat. Servește fierbinte.',
      ),
    },
    {
      key: 'store',
      text: t(
        'Slice the leftover loaf into a shallow container so it cools quickly, then put it in the fridge within 2 hours, covered.',
        'Taie rulada rămasă felii într-un recipient plat, ca să se răcească repede, apoi pune-o acoperită la frigider în cel mult 2 ore.',
      ),
    },
  ],
  tips: [
    t(
      'Mix only until combined: the more you work minced meat, the denser and tougher the loaf gets.',
      'Amestecă doar până se omogenizează: cu cât frămânți mai mult carnea tocată, cu atât rulada iese mai densă și mai tare.',
    ),
    t(
      'Leftovers keep 3 to 4 days in the fridge. Reheat slices until they reach 75 °C and steam all through, or eat them cold in a sandwich.',
      'Resturile se păstrează 3-4 zile la frigider. Încălzește feliile până ajung la 75 °C și scot abur în tot miezul, sau mănâncă-le reci, într-un sandviș.',
    ),
    t(
      'A free-form loaf on a tray browns on all sides and the fat runs off; in a loaf tin the sides stay pale and sit in the fat.',
      'O ruladă modelată liber pe tavă se rumenește pe toate laturile, iar grăsimea se scurge; într-o formă de pâine laturile rămân palide și stau în grăsime.',
    ),
  ],
  stepTips: [
    {
      step: 'cool',
      text: t(
        'Hot onion warms the raw mince and starts to set the egg unevenly; let it cool first.',
        'Ceapa fierbinte încălzește carnea tocată crudă și începe să închege oul neuniform; lasă-o întâi să se răcească.',
      ),
    },
    {
      step: 'check',
      text: t(
        'Keep the probe tip in the middle of the thickest part and off the tray; the metal reads hotter than the meat.',
        'Ține vârful sondei în mijlocul părții celei mai groase și departe de tavă; metalul arată o temperatură mai mare decât carnea.',
      ),
    },
  ],
  nutritionNote: t(
    'A filling main with plenty of protein and some iron from the meat. Beef and pork mince bring saturated fat, though some runs onto the tray; the ketchup glaze and Worcestershire sauce add sugar and salt. Serve with vegetables for the fibre the loaf lacks.',
    'Un fel principal săturător, cu multe proteine și ceva fier din carne. Carnea tocată de vită și porc aduce grăsimi saturate, deși o parte se scurge în tavă; glazura de ketchup și sosul Worcestershire adaugă zahăr și sare. Servește cu legume, pentru fibrele care lipsesc din ruladă.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Potato puree', 'Piure de cartofi'),
      reason: t(
        'The soft purée takes up the juices and the glaze of the sliced loaf.',
        'Piureul moale absoarbe sucul și glazura de la feliile de ruladă.',
      ),
      principle: 'complement_flavour',
      recipe: 'potato-puree',
    },
    {
      kind: 'food',
      label: t('Steamed green beans', 'Fasole verde la abur'),
      reason: t(
        'Their fresh snap contrasts with the soft, rich slices.',
        'Textura lor proaspătă și crocantă contrastează cu feliile moi și bogate.',
      ),
      principle: 'contrast_texture',
      ingredient: 'green-beans',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sourness cuts the fat of the meat and the sweetness of the glaze.',
        'Aciditatea lor taie grăsimea cărnii și dulceața glazurii.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'drink',
      label: t('Beer', 'Bere'),
      reason: t(
        'Its bitterness and bubbles refresh the palate after the rich, sweet-glazed meat.',
        'Amăreala și bulele ei împrospătează gustul după carnea bogată, cu glazură dulce.',
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
        'A hot, hearty slice with mash is comforting in cold weather.',
        'O felie fierbinte și consistentă, cu piure, încălzește pe vreme rece.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'The meat gives protein for recovery; add potatoes or bread for carbohydrates.',
        'Carnea oferă proteine pentru refacere; adaugă cartofi sau pâine pentru carbohidrați.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'It needs over an hour in a hot oven and sits heavy in the heat.',
        'Are nevoie de peste o oră în cuptorul încins și cade greu pe vreme caldă.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A heavy meal of meat and fat is hard to sleep on.',
        'O masă grea, cu carne și grăsime, îți strică somnul.',
      ),
    },
  ],
  variants: [
    {
      slug: 'meatloaf-german',
      cuisine: 'german',
      title: t(
        'Falscher Hase (German meatloaf with hard-boiled eggs)',
        'Falscher Hase (ruladă germană de carne tocată cu ouă fierte)',
      ),
      servings: 6,
      prepMinutes: 45,
      cookMinutes: 80,
      difficulty: 'medium',
      hideBaseTips: [2],
      lines: [
        { ingredient: 'bread-rolls', quantity: 2, unit: 'pcs' },
        {
          ingredient: 'still-water',
          key: 'water-soak',
          quantity: 0.15,
          unit: 'l',
          note: t('to soak the rolls', 'pentru înmuiat chiflele'),
        },
        {
          ingredient: 'eggs',
          key: 'eggs-boiled',
          quantity: 4,
          unit: 'pcs',
          note: t('hard-boiled and peeled', 'fierte tari și curățate'),
        },
        {
          ingredient: 'eggs',
          key: 'eggs-raw',
          quantity: 1,
          unit: 'pcs',
          note: t('raw, for the meat', 'crud, pentru carne'),
        },
        { ingredient: 'minced-mixed-meat', quantity: 900, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely chopped', 'tocată mărunt'),
        },
        { ingredient: 'sunflower-oil', quantity: 15, unit: 'ml' },
        { ingredient: 'mustard', quantity: 20, unit: 'g' },
        { ingredient: 'marjoram', quantity: 2, unit: 'g' },
        { ingredient: 'paprika', quantity: 3, unit: 'g' },
        { ingredient: 'salt', key: 'salt-mix', quantity: 9, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
        {
          ingredient: 'still-water',
          key: 'water-roast',
          quantity: 0.2,
          unit: 'l',
          note: t('in the roasting dish', 'în vasul de copt'),
        },
        { ingredient: 'sour-cream', quantity: 150, unit: 'g' },
        { ingredient: 'flour', quantity: 10, unit: 'g' },
        {
          ingredient: 'still-water',
          key: 'water-gravy',
          quantity: 0.15,
          unit: 'l',
          note: t('for the gravy', 'pentru sos'),
        },
        {
          ingredient: 'salt',
          key: 'salt-gravy',
          note: t('for the gravy', 'pentru sos'),
        },
        {
          ingredient: 'parsley',
          quantity: 10,
          unit: 'g',
          optional: true,
          note: t('chopped, to finish', 'tocat, pentru servire'),
        },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 180 °C (conventional, not fan). It needs about 15 minutes; carry on with the next steps meanwhile.',
            'Încălzește cuptorul la 180 °C (fără ventilator). Are nevoie de aproximativ 15 minute; continuă între timp cu pașii următori.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'eggs',
          text: t(
            'Lower the 4 eggs into a pan of boiling water and boil them for 10 minutes, until the yolks are fully set. Cool them in cold water and peel them.',
            'Pune cele 4 ouă într-o oală cu apă clocotită și fierbe-le 10 minute, până când gălbenușurile sunt complet întărite. Răcește-le în apă rece și curăță-le.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'soak',
          text: t(
            'While the eggs boil, tear the rolls into the soak water and leave them for 10 minutes, then squeeze them out well.',
            'Cât fierb ouăle, rupe chiflele în apa pentru înmuiat și lasă-le 10 minute, apoi stoarce-le bine.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'onion',
          text: t(
            'Warm the oil in a pan over medium heat and soften the onion for about 7 minutes, until translucent. Tip it onto a plate to cool for 10 minutes.',
            'Încălzește uleiul într-o tigaie la foc mediu și călește ceapa aproximativ 7 minute, până devine translucidă. Pune-o pe o farfurie și lasă-o 10 minute să se răcească.',
          ),
          timerSeconds: 420,
        },
        {
          key: 'mix',
          text: t(
            'In a bowl, mix the squeezed rolls, mince, cooled onion, the raw egg, mustard, marjoram, paprika, the salt and pepper with your hand for about a minute, until evenly combined.',
            'Într-un castron, amestecă cu mâna chiflele stoarse, carnea tocată, ceapa răcită, oul crud, muștarul, maghiranul, boiaua, sarea și piperul, aproximativ un minut, până se omogenizează.',
          ),
        },
        {
          key: 'shape',
          text: t(
            'On a board, press half of the mixture into a flat rectangle about 25 cm long and 10 cm wide. Lay the peeled eggs end to end down the middle.',
            'Pe un tocător, apasă jumătate din compoziție într-un dreptunghi plat, lung de aproximativ 25 cm și lat de 10 cm. Așază ouăle curățate cap la cap, pe mijloc.',
          ),
        },
        {
          key: 'close',
          text: t(
            'Press the rest of the mixture over the eggs and pinch the seams shut, so no egg shows. Lift the loaf into a roasting dish and pour in the roast water.',
            'Apasă restul compoziției peste ouă și lipește bine îmbinările, ca să nu se vadă niciun ou. Mută rulada într-un vas de copt și toarnă apa pentru copt.',
          ),
        },
        {
          key: 'wash',
          text: t(
            'Wash your hands, the board and the bowl in hot soapy water.',
            'Spală-ți mâinile, tocătorul și castronul cu apă fierbinte și detergent.',
          ),
        },
        {
          key: 'roast',
          text: t(
            'Roast for 60 minutes, spooning the pan juices over the loaf every 20 minutes, until it is well browned on top and sides. Top up with a splash of water if the dish dries out.',
            'Coace 60 de minute, turnând sucul din vas peste ruladă la fiecare 20 de minute, până se rumenește bine deasupra și pe laturi. Adaugă puțină apă dacă vasul se usucă.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'check',
          text: t(
            'Push a probe thermometer into the thickest part of the meat, beside an egg and not into it. It must read at least 71 °C, with clear juices; the thermometer decides, not the colour. If not, roast in 5-minute rounds until it does (usually no more than 70 minutes in all).',
            'Înfige un termometru cu sondă în partea cea mai groasă a cărnii, lângă un ou, nu în el. Trebuie să arate cel puțin 71 °C, cu suc limpede; termometrul decide, nu culoarea. Dacă nu, mai coace câte 5 minute până ajunge (de obicei nu mai mult de 70 de minute în total).',
          ),
        },
        {
          key: 'rest',
          text: t(
            'Lift the loaf onto a clean board and leave it to rest for 10 minutes before slicing.',
            'Mută rulada pe un tocător curat și lasă-o să se odihnească 10 minute înainte de feliere.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'gravy',
          text: t(
            'While the loaf rests, pour the pan juices into a small saucepan and skim off the fat. Whisk the sour cream and flour smooth with the gravy water, stir into the juices and simmer gently for 3 minutes, until slightly thickened. Season with salt to taste.',
            'Cât se odihnește rulada, toarnă sucul din vas într-o crăticioară și ia grăsimea de deasupra. Amestecă smântâna cu făina și apa pentru sos până se omogenizează, apoi adaugă amestecul în suc și fierbe încet 3 minute, până se îngroașă puțin. Potrivește de sare.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'serve',
          text: t(
            'Cut the loaf into 2 cm slices, so each shows a ring of egg. Spoon the gravy over and scatter with parsley, if using. Slice leftovers into a shallow container so they cool quickly, and put them in the fridge within 2 hours.',
            'Taie rulada în felii de 2 cm, ca pe fiecare felie să se vadă un cerc de ou. Toarnă sosul peste și presară pătrunjel, dacă folosești. Taie resturile felii într-un recipient plat, ca să se răcească repede, și pune-le la frigider în cel mult 2 ore.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'close',
          text: t(
            'Wet your hands before sealing the seams: the meat does not stick to them, and gaps close up cleanly.',
            'Udă-ți mâinile înainte de a lipi îmbinările: carnea nu se lipește de ele, iar golurile se închid frumos.',
          ),
        },
        {
          step: 'eggs',
          text: t(
            'Cool the eggs fully in cold water: warm eggs would warm the raw mince from the inside, and they are easier to peel cold.',
            'Răcește ouăle complet în apă rece: ouăle calde ar încălzi carnea tocată crudă din interior și se curăță mai ușor reci.',
          ),
        },
      ],
      nutritionNote: t(
        'Filling, with protein from meat and eggs. Mixed mince, yolks and sour cream bring saturated fat, and the salt in the mix and the gravy add salt. Serve with cabbage or another vegetable for the fibre the loaf lacks.',
        'Săturătoare, cu proteine din carne și ouă. Carnea tocată amestec, gălbenușurile și smântâna aduc grăsimi saturate, iar sarea din compoziție și din sos adaugă sare. Servește cu varză sau altă legumă, pentru fibrele care lipsesc din ruladă.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t(
            'Apfelrotkohl (German red cabbage with apples)',
            'Varză roșie cu mere, ca în Germania (Apfelrotkohl)',
          ),
          reason: t(
            'The sweet-sour cabbage cuts the rich meat and sour-cream gravy.',
            'Varza dulce-acrișoară taie bogăția cărnii și a sosului de smântână.',
          ),
          principle: 'acid_cuts_fat',
          recipe: 'braised-red-cabbage-german',
        },
        {
          kind: 'food',
          label: t('Boiled potatoes', 'Cartofi fierți'),
          reason: t(
            'Plain potatoes carry the sour-cream gravy.',
            'Cartofii simpli preiau sosul de smântână.',
          ),
          principle: 'complement_flavour',
          ingredient: 'potato',
        },
        {
          kind: 'drink',
          label: t('Beer', 'Bere'),
          reason: t(
            'Its bitterness balances the rich meat, egg and cream.',
            'Amăreala ei echilibrează carnea, oul și smântâna.',
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
            'A hot roast with gravy warms you through on a cold day.',
            'O friptură fierbinte, cu sos, te încălzește într-o zi rece.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Meat and eggs give protein; add potatoes for carbohydrates.',
            'Carnea și ouăle dau proteine; adaugă cartofi pentru carbohidrați.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'Over an hour in a hot oven, and a heavy dish in the heat.',
            'Peste o oră în cuptorul încins și un fel greu pe căldură.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Meat, eggs and cream sit heavy before bed.',
            'Carnea, ouăle și smântâna cad greu înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'meatloaf-italian',
      cuisine: 'italian',
      title: t(
        'Polpettone (Italian stuffed meatloaf braised in white wine)',
        'Polpettone (ruladă italiană de carne tocată umplută cu șuncă și brânză, înăbușită în vin alb)',
      ),
      servings: 6,
      prepMinutes: 60,
      cookMinutes: 70,
      difficulty: 'medium',
      hideBaseTips: [2],
      lines: [
        {
          ingredient: 'bread',
          quantity: 4,
          unit: 'pcs',
          note: t('slices, crusts removed', 'felii, fără coajă'),
        },
        { ingredient: 'milk', quantity: 0.15, unit: 'l' },
        { ingredient: 'minced-beef', quantity: 450, unit: 'g' },
        { ingredient: 'minced-pork', quantity: 450, unit: 'g' },
        { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
        {
          ingredient: 'parmesan',
          quantity: 60,
          unit: 'g',
          note: t('finely grated', 'dat pe răzătoare fină'),
        },
        {
          ingredient: 'parsley',
          quantity: 15,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        {
          ingredient: 'garlic',
          quantity: 8,
          unit: 'g',
          note: t('crushed', 'zdrobit'),
        },
        { ingredient: 'nutmeg', quantity: 0.5, unit: 'g' },
        { ingredient: 'salt', quantity: 8, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
        {
          ingredient: 'ham',
          quantity: 120,
          unit: 'g',
          note: t('thin slices', 'felii subțiri'),
        },
        {
          ingredient: 'fontina',
          quantity: 120,
          unit: 'g',
          note: t('thin slices', 'felii subțiri'),
        },
        { ingredient: 'breadcrumbs', quantity: 60, unit: 'g' },
        { ingredient: 'olive-oil', quantity: 45, unit: 'ml' },
        { ingredient: 'white-wine', quantity: 150, unit: 'ml' },
        { ingredient: 'beef-stock', quantity: 250, unit: 'ml' },
        { ingredient: 'rosemary', quantity: 3, unit: 'g' },
      ],
      steps: [
        {
          key: 'soak',
          text: t(
            'Tear the bread into the milk and leave it for 5 minutes, until soft. Squeeze it out well and discard the extra milk.',
            'Rupe pâinea în lapte și lasă-o 5 minute, până se înmoaie. Stoarce-o bine și aruncă laptele rămas.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'mix',
          text: t(
            'In a large bowl, mix the squeezed bread, both minces, the eggs, parmesan, parsley, garlic, nutmeg, salt and pepper with your hand for about a minute, until evenly combined.',
            'Într-un castron mare, amestecă cu mâna pâinea stoarsă, ambele feluri de carne tocată, ouăle, parmezanul, pătrunjelul, usturoiul, nucșoara, sarea și piperul, aproximativ un minut, până se omogenizează.',
          ),
        },
        {
          key: 'flatten',
          text: t(
            'Press the mixture on a sheet of baking paper into a rectangle about 30 by 25 cm and 1.5 cm thick.',
            'Apasă compoziția pe o foaie de hârtie de copt, într-un dreptunghi de aproximativ 30 pe 25 cm și gros de 1,5 cm.',
          ),
        },
        {
          key: 'fill',
          text: t(
            'Lay the ham and then the fontina over the meat, leaving a 2 cm margin all round.',
            'Așază șunca, apoi fontina peste carne, lăsând o margine de 2 cm peste tot.',
          ),
        },
        {
          key: 'roll',
          text: t(
            'Using the paper, roll the meat up tightly from a short side, to make a roll about 25 cm long, then pinch the seam and both ends shut so the cheese cannot leak. Roll the roll in the breadcrumbs, throw away any crumbs left over, then wash your hands, the bowl and the board in hot soapy water.',
            'Ajutându-te de hârtie, rulează carnea strâns pornind de pe o latură scurtă, ca să iasă o ruladă lungă de aproximativ 25 cm, apoi lipește bine îmbinarea și ambele capete, ca brânza să nu curgă. Tăvălește rulada prin pesmet, aruncă pesmetul rămas, apoi spală-ți mâinile, castronul și tocătorul cu apă fierbinte și detergent.',
          ),
        },
        {
          key: 'chill',
          text: t(
            'Chill the roll on its paper, on a plate, on the bottom shelf of the fridge for 30 minutes, until firm enough to turn without splitting.',
            'Pune rulada pe hârtia ei, pe o farfurie, pe raftul de jos al frigiderului, 30 de minute, până se întărește destul cât să o poți întoarce fără să crape.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'brown',
          text: t(
            'Heat the oil in a heavy, lidded, hob-safe casserole or sauté pan at least 28 cm across (or an oval casserole) over medium heat. Lay in the roll and wash your hands while the crust forms. Then brown it for about 10 minutes in all, turning it carefully with two spatulas, until golden all over.',
            'Încălzește uleiul într-o cratiță grea, cu capac, care merge pe plită, de cel puțin 28 cm (sau o cratiță ovală), la foc mediu. Pune rulada și spală-ți mâinile cât se formează crusta. Apoi rumenește-o aproximativ 10 minute în total, întorcând-o cu grijă cu două spatule, până devine aurie peste tot.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'wine',
          text: t(
            'Pour in the wine slowly at the side of the pan, standing back because it spits, and let it bubble for 2 minutes, until the sharp smell of alcohol fades.',
            'Toarnă vinul încet, pe marginea cratiței, și stai la distanță, fiindcă sare, apoi lasă-l să fiarbă 2 minute, până dispare mirosul ascuțit de alcool.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'braise',
          text: t(
            'Add the stock and the rosemary sprig and bring to a simmer. Cover, then wash the two browning spatulas and cook gently for 45 minutes, turning the roll once halfway with clean spatulas, until it is firm. If the pan runs dry, add a splash of water.',
            'Adaugă supa și crenguța de rozmarin și adu la fierbere. Acoperă, spală cele două spatule folosite la rumenit și gătește la foc mic 45 de minute, întorcând rulada o dată la jumătate cu spatule curate, până se întărește. Dacă cratița se usucă, adaugă puțină apă.',
          ),
          timerSeconds: 2700,
        },
        {
          key: 'check',
          text: t(
            'Push a probe thermometer in from the side, halfway along the roll, to its centre. It must read at least 71 °C, with clear juices; the thermometer decides, not the colour, and the ham stays pink. If not, cover and simmer in 5-minute rounds until it does (usually no more than 55 minutes in all).',
            'Înfige un termometru cu sondă din lateral, la jumătatea ruladei, până în centru. Trebuie să arate cel puțin 71 °C, cu suc limpede; termometrul decide, nu culoarea, iar șunca rămâne roz. Dacă nu, acoperă și mai fierbe câte 5 minute până ajunge (de obicei nu mai mult de 55 de minute în total).',
          ),
        },
        {
          key: 'rest',
          text: t(
            'Lift the roll onto a clean board with clean spatulas and leave it to rest for 10 minutes before slicing.',
            'Mută rulada pe un tocător curat, cu spatule curate, și lasă-o să se odihnească 10 minute înainte de feliere.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'reduce',
          text: t(
            'While the roll rests, lift out the rosemary sprig and simmer the pan juices uncovered for 5 minutes, until slightly reduced.',
            'Cât se odihnește rulada, scoate crenguța de rozmarin și fierbe sosul din cratiță descoperit 5 minute, până scade puțin.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'serve',
          text: t(
            'Cut the roll into 2 cm slices, so the ham and melted fontina show in the middle, and spoon the pan juices over. Slice leftovers into a shallow container so they cool quickly, and put them in the fridge within 2 hours.',
            'Taie rulada în felii de 2 cm, ca să se vadă șunca și fontina topită în mijloc, și toarnă sosul din cratiță peste. Taie resturile felii într-un recipient plat, ca să se răcească repede, și pune-le la frigider în cel mult 2 ore.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'roll',
          text: t(
            'Keep the filling thin and away from the edges: cheese that reaches the seam melts out and burns in the pan.',
            'Ține umplutura subțire și departe de margini: brânza care ajunge la îmbinare se topește și se arde în cratiță.',
          ),
        },
        {
          step: 'brown',
          text: t(
            'Do not move the roll until a crust has formed; before that it sticks and tears.',
            'Nu muta rulada până nu se formează o crustă; înainte de asta se lipește și se rupe.',
          ),
        },
      ],
      nutritionNote: t(
        'Rich in protein from the meat, with some calcium from the cheese. Two kinds of mince, ham, fontina and parmesan bring saturated fat and plenty of salt, and the breadcrumb crust adds little fibre. Serve with a green vegetable.',
        'Bogată în proteine din carne, cu ceva calciu din brânză. Cele două feluri de carne tocată, șunca, fontina și parmezanul aduc grăsimi saturate și multă sare, iar crusta de pesmet adaugă puține fibre. Servește cu o legumă verde.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Potato puree', 'Piure de cartofi'),
          reason: t(
            'The purée under the slices takes up the white-wine pan juices.',
            'Piureul de sub felii absoarbe sosul de vin alb din cratiță.',
          ),
          principle: 'complement_flavour',
          recipe: 'potato-puree',
        },
        {
          kind: 'food',
          label: t('Sautéed spinach', 'Spanac călit'),
          reason: t(
            'Its slight bitterness cuts the richness of ham and cheese.',
            'Gustul ușor amărui taie bogăția șuncii și a brânzei.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'spinach',
        },
        {
          kind: 'drink',
          label: t('Red wine', 'Vin roșu'),
          reason: t(
            'A light red matches the savoury meat and melted cheese without overpowering them.',
            'Un vin roșu ușor se potrivește cu carnea și brânza topită, fără să le acopere.',
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
            'A hot braise with melted cheese is comforting in the cold.',
            'O mâncare înăbușită fierbinte, cu brânză topită, încălzește pe frig.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Meat and cheese give protein; add potatoes for carbohydrates.',
            'Carnea și brânza dau proteine; adaugă cartofi pentru carbohidrați.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'A rich, hot braise is too heavy in the heat.',
            'O mâncare înăbușită bogată și fierbinte e prea grea pe căldură.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Meat, cheese and wine sit heavy before bed.',
            'Carnea, brânza și vinul cad greu înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
