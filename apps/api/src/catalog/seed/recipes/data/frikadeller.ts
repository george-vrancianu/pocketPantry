import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Frikadeller base is the Danish pan-fried meatball: veal and pork mince
// with grated onion, egg, flour and milk, fried in butter. Each Variant is a
// full Recipe with its own lines, steps and guidance; the base's Recipe-level
// Tips are inherited unless a Variant hides them.
export const frikadeller: BaseRecipeSeed = {
  slug: 'frikadeller',
  title: t('Frikadeller (Danish meatballs)', 'Frikadeller (chiftele daneze)'),
  servings: 4,
  prepMinutes: 20,
  cookMinutes: 25,
  difficulty: 'easy',
  lines: [
    { ingredient: 'minced-veal-and-pork', quantity: 500, unit: 'g' },
    {
      ingredient: 'onion',
      quantity: 1,
      unit: 'pcs',
      note: t('finely grated', 'dată pe răzătoarea fină'),
    },
    { ingredient: 'eggs', quantity: 1, unit: 'pcs' },
    { ingredient: 'flour', quantity: 40, unit: 'g' },
    { ingredient: 'milk', quantity: 100, unit: 'ml' },
    { ingredient: 'salt', quantity: 8, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
    { ingredient: 'allspice', quantity: 1, unit: 'g', optional: true },
    {
      ingredient: 'butter',
      quantity: 40,
      unit: 'g',
      note: t('for frying', 'pentru prăjit'),
    },
  ],
  steps: [
    {
      key: 'grate',
      text: t(
        'Grate the onion on the fine side of a box grater straight into a large bowl, so that none of its juice is lost.',
        'Dă ceapa pe partea fină a răzătorii direct într-un castron mare, ca să nu se piardă sucul.',
      ),
    },
    {
      key: 'mix',
      text: t(
        'Add the mince, salt, pepper, allspice, egg and flour. Work it with your hand or a wooden spoon for 2 minutes until it turns sticky and slightly paler.',
        'Adaugă carnea tocată, sarea, piperul, ienibaharul, oul și făina. Amestecă cu mâna sau cu o lingură de lemn 2 minute, până când compoziția devine lipicioasă și puțin mai deschisă la culoare.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'milk',
      text: t(
        'Pour in the milk a little at a time, stirring until each splash is absorbed. The mixture should be soft and wet, thick enough to hold on a spoon.',
        'Toarnă laptele treptat, amestecând până se absoarbe fiecare strop. Compoziția trebuie să fie moale și umedă, destul de groasă cât să țină pe lingură.',
      ),
    },
    {
      key: 'rest',
      text: t(
        'Cover the bowl and chill it for 30 minutes.',
        'Acoperă castronul și ține compoziția la frigider 30 de minute.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'heat',
      text: t(
        'Heat a large frying pan over medium heat. Add half of the butter and let it melt until it foams but has not browned.',
        'Încinge o tigaie mare la foc mediu. Adaugă jumătate din unt și lasă-l să se topească până face spumă, fără să se rumenească.',
      ),
    },
    {
      key: 'shape',
      text: t(
        'Dip two tablespoons in cold water and shape the mixture into flat ovals about 8 cm long. Slip them into the pan, 6 at a time and not touching.',
        'Înmoaie două linguri în apă rece și modelează compoziția în ovale turtite de aproximativ 8 cm lungime. Pune-le în tigaie câte 6, fără să se atingă.',
      ),
    },
    {
      key: 'brown',
      text: t(
        'Fry for 4 to 5 minutes without moving them, until the underside is a deep golden brown and releases from the pan.',
        'Prăjește 4-5 minute fără să le miști, până când partea de jos capătă o culoare aurie intensă și se desprinde de tigaie.',
      ),
      timerSeconds: 270,
    },
    {
      key: 'turn',
      text: t(
        'Turn them once, lower the heat a little and fry for another 5 minutes. Cut one open: there must be no pink, the juices must run clear, and the centre should reach at least 71 °C.',
        'Întoarce-le o singură dată, scade puțin focul și prăjește încă 5 minute. Taie una în două: nu trebuie să fie roz, sucul trebuie să fie limpede, iar centrul trebuie să atingă cel puțin 71 °C.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'batches',
      text: t(
        'Move the first batch to a plate in a 100 °C oven to keep warm. Wipe the pan, add the rest of the butter and fry the remaining mixture the same way.',
        'Mută prima tură pe o farfurie într-un cuptor la 100 °C, ca să rămână caldă. Șterge tigaia, adaugă untul rămas și prăjește restul compoziției la fel.',
      ),
    },
    {
      key: 'serve',
      text: t(
        'Serve hot with boiled potatoes or mash, pickled cucumbers and braised red cabbage, or cold on rye bread.',
        'Servește fierbinte cu cartofi fierți sau piure, castraveți murați și varză roșie călită, sau rece, pe pâine de secară.',
      ),
    },
  ],
  tips: [
    t(
      'Fry one small test patty first and taste it: it is the only way to check the salt before the whole batch is shaped.',
      'Prăjește mai întâi o chiftea mică și gust-o: e singura cale de a verifica sarea înainte de a modela tot restul.',
    ),
    t(
      'Keep the heat at medium. Butter that browns gives a nutty crust, but butter that turns black tastes bitter; wipe the pan between batches if it darkens.',
      'Păstrează focul mediu. Untul care se rumenește dă o crustă cu gust de nucă, dar cel care se înnegrește are gust amar; șterge tigaia între ture dacă s-a închis la culoare.',
    ),
    t(
      'Wet spoons or hands stop the mixture from sticking, so the meatballs come out smooth rather than ragged.',
      'Lingurile sau mâinile ude împiedică compoziția să se lipească, așa că chiftelele ies netede, nu zdrențuite.',
    ),
  ],
  stepTips: [
    {
      step: 'rest',
      text: t(
        'The mixture looks too loose at first. Resting lets the flour soak up the milk, and it firms up enough to shape.',
        'La început compoziția pare prea moale. Odihna lasă făina să absoarbă laptele, iar compoziția se întărește destul cât să poată fi modelată.',
      ),
    },
    {
      step: 'turn',
      text: t(
        'Do not press the frikadeller flat with the spatula; it squeezes out the juices and leaves them dry.',
        'Nu apăsa chiftelele cu spatula; scoți sucul din ele și ies uscate.',
      ),
    },
  ],
  nutritionNote: t(
    'A good source of protein, iron and B vitamins, and a filling dinner; the pork and the butter for frying add saturated fat, the dish is fairly salty, and it has little fibre, so serve it with vegetables or red cabbage and boiled rather than fried potatoes.',
    'O sursă bună de proteine, fier și vitamine din complexul B, o cină săturătoare; carnea de porc și untul pentru prăjit aduc grăsimi saturate, preparatul e destul de sărat și are puține fibre, așa că servește-l cu legume sau varză roșie și cu cartofi fierți, nu prăjiți.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Mashed potatoes', 'Piure de cartofi'),
      reason: t(
        'Frikadeller with mash is an everyday Danish dinner: soft mash with a spoon of brown gravy is the everyday Danish plate.',
        'Frikadeller cu piure e o cină daneză de zi cu zi: piureul moale, cu o lingură de sos brun, este farfuria daneză de zi cu zi.',
      ),
      principle: 'regional_tradition',
      recipe: 'potato-puree',
    },
    {
      kind: 'food',
      label: t('Boiled potatoes', 'Cartofi fierți'),
      reason: t(
        'Plain and floury, they carry the richness of the fried crust without adding more fat.',
        'Simpli și făinoși, preiau bogăția crustei prăjite fără să adauge mai multă grăsime.',
      ),
      principle: 'complement_flavour',
      ingredient: 'potato',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sourness cuts through the fried pork and butter.',
        'Aciditatea lor taie grăsimea cărnii de porc și a untului.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'food',
      label: t('Braised red cabbage', 'Varză roșie călită'),
      reason: t(
        'A sweet-sour cabbage on the side is the usual Danish partner for fried pork.',
        'O varză dulce-acrișoară alături e partenerul obișnuit al cărnii de porc prăjite în bucătăria daneză.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'red-cabbage',
    },
    {
      kind: 'food',
      label: t('Rye bread', 'Pâine de secară'),
      reason: t(
        'Cold frikadeller on dense, sour rye bread make a classic open sandwich.',
        'Frikadeller reci pe pâine de secară densă și acrișoară fac un sandviș deschis clasic.',
      ),
      principle: 'contrast_texture',
      ingredient: 'rye-bread',
    },
    {
      kind: 'drink',
      label: t('Light lager', 'Bere blondă ușoară'),
      reason: t(
        'Cold, crisp bubbles refresh the palate between fried, buttery bites.',
        'Bulele reci și răcoritoare împrospătează gustul între îmbucături prăjite, cu gust de unt.',
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
        'Hot, hearty and comforting with potatoes.',
        'Fierbinte, consistent și reconfortant, cu cartofi.',
      ),
    },
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'Cold leftovers on rye bread with pickles are a quick lunch.',
        'Resturile reci, pe pâine de secară cu murături, fac un prânz rapid.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Fried meat and butter sit heavy in the stomach during exercise.',
        'Carnea prăjită și untul cad greu la stomac în timpul efortului.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Rich and fatty, hard to digest right before bed.',
        'Bogate și grase, greu de digerat chiar înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'frikadeller-oven-baked',
      method: 'oven-baked',
      // No frying: the test patty is baked and there is no butter to watch.
      hideBaseTips: [0, 1],
      title: t('Oven-baked frikadeller', 'Frikadeller la cuptor'),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 25,
      difficulty: 'easy',
      lines: [
        { ingredient: 'minced-veal-and-pork', quantity: 500, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely grated', 'dată pe răzătoarea fină'),
        },
        { ingredient: 'eggs', quantity: 1, unit: 'pcs' },
        { ingredient: 'flour', quantity: 40, unit: 'g' },
        { ingredient: 'milk', quantity: 100, unit: 'ml' },
        { ingredient: 'salt', quantity: 8, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        { ingredient: 'allspice', quantity: 1, unit: 'g', optional: true },
        {
          ingredient: 'butter',
          quantity: 20,
          unit: 'g',
          note: t('melted', 'topit'),
        },
      ],
      steps: [
        {
          key: 'mix',
          text: t(
            'Grate the onion into a large bowl with its juice. Add the mince, salt, pepper, allspice, egg and flour and work for 2 minutes until sticky, then stir in the milk a little at a time until the mixture is soft and wet.',
            'Dă ceapa pe răzătoare într-un castron mare, cu tot sucul. Adaugă carnea tocată, sarea, piperul, ienibaharul, oul și făina și amestecă 2 minute, până devine lipicioasă, apoi toarnă laptele treptat până când compoziția e moale și umedă.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'rest',
          text: t(
            'Cover the bowl and chill it for 30 minutes.',
            'Acoperă castronul și ține compoziția la frigider 30 de minute.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 220 °C (200 °C fan) and line a large baking tray with baking paper.',
            'Încinge cuptorul la 220 °C (200 °C cu ventilator) și tapetează o tavă mare cu hârtie de copt.',
          ),
        },
        {
          key: 'shape',
          text: t(
            'Dip two tablespoons in cold water and shape the mixture into flat ovals about 8 cm long. Set them on the tray with a finger of space between them.',
            'Înmoaie două linguri în apă rece și modelează compoziția în ovale turtite de aproximativ 8 cm lungime. Așază-le pe tavă, la distanță de un deget una de alta.',
          ),
        },
        {
          key: 'butter',
          text: t(
            'Brush the tops with the melted butter.',
            'Unge partea de sus cu untul topit.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 20 to 25 minutes, until the tops are golden brown and the edges are crisp. Cut one open: there must be no pink, the juices must run clear, and the centre should reach at least 71 °C.',
            'Coace 20-25 de minute, până când partea de sus e aurie și marginile sunt crocante. Taie una în două: nu trebuie să fie roz, sucul trebuie să fie limpede, iar centrul trebuie să atingă cel puțin 71 °C.',
          ),
          timerSeconds: 1350,
        },
        {
          key: 'rest-tray',
          text: t(
            'Leave them on the tray for 5 minutes, then serve with boiled potatoes or mash and pickled cucumbers.',
            'Lasă-le pe tavă 5 minute, apoi servește-le cu cartofi fierți sau piure și castraveți murați.',
          ),
          timerSeconds: 300,
        },
      ],
      tips: [
        t(
          'Bake or fry one small test patty first and taste it: it is the only way to check the salt before the whole tray is shaped.',
          'Coace sau prăjește mai întâi o chiftea mică și gust-o: e singura cale de a verifica sarea înainte de a modela toată tava.',
        ),
      ],
      stepTips: [
        {
          step: 'bake',
          text: t(
            'For a browner crust, switch to the grill for the last 2 minutes, but watch them: they go from golden to dark in seconds.',
            'Pentru o crustă mai rumenă, pornește grill-ul în ultimele 2 minute, dar stai lângă ele: trec din aurii în închise la culoare în câteva secunde.',
          ),
        },
      ],
      nutritionNote: t(
        'Baked on paper with only a little butter brushed on top, it has less fat than the pan-fried version; it is still pork mince, so saturated fat and salt remain, and fibre is low unless you serve it with vegetables.',
        'Coapte pe hârtie, cu doar puțin unt pe deasupra, au mai puține grăsimi decât varianta prăjită în tigaie, iar toată tava nu cere atenție; rămâne totuși carne tocată de porc, deci grăsimile saturate și sarea nu dispar, iar fibrele sunt puține dacă nu servești și legume.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Mashed potatoes', 'Piure de cartofi'),
          reason: t(
            'A tray of baked frikadeller with mash is the easy weeknight version of the Danish dinner.',
            'O tavă de frikadeller la cuptor cu piure e varianta simplă, de seară din timpul săptămânii, a cinei daneze.',
          ),
          principle: 'regional_tradition',
          recipe: 'potato-puree',
        },
        {
          kind: 'food',
          label: t('Pickled cucumbers', 'Castraveți murați'),
          reason: t(
            'Their sourness cuts through the pork and butter.',
            'Aciditatea lor taie grăsimea cărnii de porc și a untului.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-cucumbers',
        },
        {
          kind: 'food',
          label: t('Braised red cabbage', 'Varză roșie călită'),
          reason: t(
            'Sweet-sour cabbage is the usual Danish partner for pork.',
            'Varza dulce-acrișoară este partenerul obișnuit al cărnii de porc în bucătăria daneză.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'red-cabbage',
        },
        {
          kind: 'drink',
          label: t('Sparkling water with lemon', 'Apă minerală cu lămâie'),
          reason: t(
            'Bubbles and citrus refresh the palate between savoury bites.',
            'Bulele și citricele împrospătează gustul între îmbucături sărate.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'sparkling-water',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A warm, hearty tray dinner with potatoes.',
            'O cină consistentă, caldă, dintr-o tavă, cu cartofi.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Cold leftovers on rye bread make an easy packed lunch.',
            'Resturile reci, pe pâine de secară, fac un prânz ușor de luat la pachet.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Meat and fat are hard to digest right before bed.',
            'Carnea și grăsimea sunt greu de digerat chiar înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'frikadeller-greek',
      cuisine: 'greek',
      // Fried in olive oil, not butter.
      hideBaseTips: [1],
      title: t('Keftedes (Greek meatballs)', 'Keftedes (chiftele grecești)'),
      servings: 4,
      prepMinutes: 25,
      cookMinutes: 15,
      difficulty: 'easy',
      lines: [
        { ingredient: 'minced-beef', quantity: 500, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely grated', 'dată pe răzătoarea fină'),
        },
        {
          ingredient: 'bread',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'slices of stale white bread, crusts removed',
            'felii de pâine albă veche, fără coajă',
          ),
        },
        { ingredient: 'still-water', quantity: 0.1, unit: 'l' },
        { ingredient: 'eggs', quantity: 1, unit: 'pcs' },
        {
          ingredient: 'mint',
          quantity: 10,
          unit: 'g',
          note: t('finely chopped', 'tocată mărunt'),
        },
        { ingredient: 'oregano', quantity: 2, unit: 'g' },
        {
          ingredient: 'parsley',
          quantity: 15,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        { ingredient: 'salt', quantity: 8, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        {
          ingredient: 'flour',
          quantity: 40,
          unit: 'g',
          note: t('for rolling', 'pentru tăvălit'),
        },
        {
          ingredient: 'olive-oil',
          quantity: 100,
          unit: 'ml',
          note: t('for shallow frying', 'pentru prăjit în ulei puțin'),
        },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t('cut in wedges', 'tăiată felii'),
        },
        { ingredient: 'tzatziki', quantity: 150, unit: 'g', optional: true },
      ],
      steps: [
        {
          key: 'soak',
          text: t(
            'Soak the bread in the water for 2 minutes, then squeeze it out firmly and tear it into crumbs.',
            'Înmoaie pâinea în apă 2 minute, apoi stoarce-o bine și rup-o în bucățele mici.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'mix',
          text: t(
            'In a large bowl, combine the mince, grated onion, bread, egg, mint, oregano, parsley, salt and pepper. Work with your hand for 2 minutes until the mixture holds together.',
            'Într-un castron mare, amestecă carnea tocată, ceapa rasă, pâinea, oul, menta, oregano, pătrunjelul, sarea și piperul. Frământă cu mâna 2 minute, până când compoziția se leagă.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'rest',
          text: t(
            'Cover and chill for 30 minutes so the flavours settle.',
            'Acoperă și ține la frigider 30 de minute, ca aromele să se așeze.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'shape',
          text: t(
            'With damp hands, roll the mixture into balls the size of a walnut, about 25 g each, then roll them lightly in the flour and press each one a little flat.',
            'Cu mâinile umede, rulează compoziția în bile cât o nucă, de aproximativ 25 g fiecare, apoi tăvălește-le ușor prin făină și apasă-le puțin.',
          ),
        },
        {
          key: 'fry',
          text: t(
            'Heat the olive oil in a wide frying pan over medium heat until a pinch of flour sizzles. Fry in two batches for 8 to 10 minutes, turning, until deep golden brown all over.',
            'Încălzește uleiul de măsline într-o tigaie lată la foc mediu, până când un praf de făină sfârâie. Prăjește în două ture, 8-10 minute, întorcând, până se rumenesc uniform.',
          ),
          timerSeconds: 540,
        },
        {
          key: 'check',
          text: t(
            'Cut one open: there must be no pink, the juices must run clear, and the centre should reach at least 71 °C. Drain on paper towels.',
            'Taie una în două: nu trebuie să fie roz, sucul trebuie să fie limpede, iar centrul trebuie să atingă cel puțin 71 °C. Scurge-le pe prosoape de hârtie.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Serve warm with lemon wedges for squeezing and the tzatziki alongside.',
            'Servește calde, cu felii de lămâie pentru stors și cu tzatziki alături.',
          ),
        },
      ],
      tips: [
        t(
          'Fresh mint is what makes keftedes taste Greek; do not leave it out, and chop it very fine so nobody bites on a leaf.',
          'Menta proaspătă e cea care dă keftedes gustul grecesc; nu o omite și toac-o foarte mărunt, ca să nu muște cineva din frunze întregi.',
        ),
      ],
      stepTips: [
        {
          step: 'soak',
          text: t(
            'Squeeze the bread properly: soggy bread makes the mixture slack, and the balls fall apart in the pan.',
            'Stoarce bine pâinea: pâinea îmbibată înmoaie compoziția, iar bilele se desfac în tigaie.',
          ),
        },
      ],
      nutritionNote: t(
        'Beef, herbs and a yogurt-based tzatziki make a protein-rich plate with some freshness; frying in olive oil adds fat, mostly unsaturated but still plenty of energy, and beef mince brings saturated fat, so drain the meatballs well and serve them with a salad.',
        'Carnea de vită, ierburile și tzatziki pe bază de iaurt fac o farfurie bogată în proteine și cu prospețime; prăjitul în ulei de măsline adaugă grăsime, în mare parte nesaturată, dar tot multă energie, iar carnea tocată de vită aduce grăsimi saturate, așa că scurge bine chiftelele și servește-le cu o salată.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Tzatziki', 'Tzatziki'),
          reason: t(
            'Cool, garlicky yogurt freshens the fried meat.',
            'Iaurtul rece, cu usturoi, înviorează carnea prăjită.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'tzatziki',
        },
        {
          kind: 'food',
          label: t('Warm pita', 'Pita caldă'),
          reason: t(
            'Soft bread to wrap the meatballs and mop up the oil and yogurt.',
            'Pâine moale în care învelești chiftelele și cu care ștergi uleiul și iaurtul.',
          ),
          principle: 'regional_tradition',
          ingredient: 'pita',
        },
        {
          kind: 'food',
          label: t(
            'Tomato and cucumber salad',
            'Salată de roșii și castraveți',
          ),
          reason: t(
            'Juicy, fresh vegetables with a little oil make a light contrast to the fried meat.',
            'Legumele proaspete și zemoase, cu puțin ulei, fac un contrast ușor cu carnea prăjită.',
          ),
          principle: 'contrast_texture',
          ingredient: 'tomato',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Crisp acidity refreshes the palate between oily, herby bites.',
            'Aciditatea fină împrospătează gustul între îmbucături grase, cu ierburi.',
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
            'Small and quick to eat, filling with pita and salad.',
            'Mici și rapid de mâncat, săturătoare cu pita și salată.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Lemon and cool tzatziki keep the plate fresh, and they are good at room temperature.',
            'Lămâia și tzatziki rece țin farfuria proaspătă, iar chiftelele sunt bune și la temperatura camerei.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Fried meat in oil is heavy before bed.',
            'Carnea prăjită în ulei e grea înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'frikadeller-italian',
      cuisine: 'italian',
      // Simmered in sauce, not fried in butter.
      hideBaseTips: [1],
      title: t('Polpette in tomato sauce', 'Polpette în sos de roșii'),
      servings: 4,
      prepMinutes: 25,
      cookMinutes: 35,
      difficulty: 'medium',
      lines: [
        { ingredient: 'minced-mixed-meat', quantity: 500, unit: 'g' },
        {
          ingredient: 'bread',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'slices of stale white bread, crusts removed',
            'felii de pâine albă veche, fără coajă',
          ),
        },
        { ingredient: 'milk', quantity: 80, unit: 'ml' },
        {
          ingredient: 'parmesan',
          quantity: 40,
          unit: 'g',
          note: t('finely grated', 'ras fin'),
        },
        { ingredient: 'eggs', quantity: 1, unit: 'pcs' },
        {
          ingredient: 'parsley',
          quantity: 15,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t(
            'finely chopped, half for the meatballs and half for the sauce',
            'tocat mărunt, jumătate pentru chiftele și jumătate pentru sos',
          ),
        },
        { ingredient: 'olive-oil', quantity: 45, unit: 'ml' },
        { ingredient: 'passata', quantity: 700, unit: 'ml' },
        {
          ingredient: 'basil',
          quantity: 10,
          unit: 'g',
          note: t('leaves, torn', 'frunze, rupte'),
        },
        { ingredient: 'salt', quantity: 8, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'soak',
          text: t(
            'Tear the bread into a bowl, pour over the milk and leave for 5 minutes, then squeeze it out and break it up with a fork.',
            'Rupe pâinea într-un bol, toarnă laptele peste ea și lasă-o 5 minute, apoi stoarce-o și desfă-o cu o furculiță.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'mix',
          text: t(
            'Add the mince, parmesan, egg, parsley, half of the garlic, 5 g of the salt and the pepper. Mix gently with your hands for no more than a minute, just until combined.',
            'Adaugă carnea tocată, parmezanul, oul, pătrunjelul, jumătate din usturoi, 5 g din sare și piperul. Amestecă ușor cu mâna cel mult un minut, doar până se omogenizează.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'shape',
          text: t(
            'Roll the mixture into balls the size of a golf ball, about 30 g each, with damp hands. You should get about 22.',
            'Cu mâinile umede, rulează compoziția în bile cât o minge de golf, de aproximativ 30 g fiecare. Ar trebui să iasă în jur de 22.',
          ),
        },
        {
          key: 'brown',
          text: t(
            'Heat the olive oil in a wide, deep frying pan over medium-high heat. Brown the meatballs in two batches for 5 to 6 minutes, turning, until golden on most sides. They do not need to be cooked through. Lift them out onto a plate.',
            'Încălzește uleiul de măsline într-o tigaie lată și adâncă, la foc mediu spre mare. Rumenește chiftelele în două ture, 5-6 minute, întorcându-le, până sunt aurii pe cele mai multe părți. Nu trebuie să fie gătite complet. Scoate-le pe o farfurie.',
          ),
          timerSeconds: 330,
        },
        {
          key: 'sauce',
          text: t(
            'Lower the heat to medium, add the remaining garlic to the pan and cook for 30 seconds until fragrant. Pour in the passata, add the remaining salt and scrape up the browned bits.',
            'Scade focul la mediu, adaugă în tigaie restul de usturoi și gătește 30 de secunde, până devine aromat. Toarnă pasata, adaugă sarea rămasă și desprinde cu lingura bucățelele rumenite de pe fund.',
          ),
          timerSeconds: 30,
        },
        {
          key: 'simmer',
          text: t(
            'Return the meatballs to the sauce, bring to a gentle simmer, partly cover and cook for 20 to 25 minutes, turning once, until the sauce is thick enough to coat a spoon. Cut one open: there must be no pink, and the centre should reach at least 71 °C.',
            'Pune chiftelele înapoi în sos, adu la fierbere domoală, acoperă parțial și gătește 20-25 de minute, întorcându-le o dată, până când sosul se îngroașă destul cât să acopere lingura. Taie una în două: nu trebuie să fie roz, iar centrul trebuie să atingă cel puțin 71 °C.',
          ),
          timerSeconds: 1350,
        },
        {
          key: 'serve',
          text: t(
            'Tear the basil over the top and serve with spaghetti, polenta or crusty bread.',
            'Rupe busuiocul deasupra și servește cu spaghete, mămăligă sau pâine crocantă.',
          ),
        },
      ],
      tips: [
        t(
          'Simmer gently: the egg and bread only bind the meatballs as they cook, so a hard boil or constant stirring breaks them apart.',
          'Fierbe domol: oul și pâinea leagă chiftelele abia pe măsură ce se gătesc, așa că un clocot puternic sau amestecatul continuu le desface.',
        ),
      ],
      stepTips: [
        {
          step: 'mix',
          text: t(
            'Handle the mixture as little as you can: the more it is worked, the tougher and denser the meatballs turn.',
            'Atinge compoziția cât mai puțin: cu cât o frământi mai mult, cu atât chiftelele ies mai tari și mai dense.',
          ),
        },
      ],
      nutritionNote: t(
        'Browning briefly and finishing in tomato sauce needs less fat than frying the meatballs through, and tomatoes add vitamin C and lycopene; parmesan and the meat add salt and saturated fat, the olive oil adds energy, and the dish has little fibre unless served with vegetables or wholemeal pasta.',
        'Rumenirea scurtă și gătitul în sos de roșii cer mai puțină grăsime decât prăjirea chiftelelor până în centru, iar roșiile adaugă vitamina C și licopen; parmezanul și carnea aduc sare și grăsimi saturate, uleiul de măsline adaugă energie, iar preparatul are puține fibre dacă nu e servit cu legume sau paste integrale.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Spaghetti', 'Spaghete'),
          reason: t(
            'The sauce also dresses pasta; meatballs and spaghetti on one plate is the Italian-American way.',
            'Sosul poate asezona și pastele; chiftele și spaghete în aceeași farfurie este stilul italo-american.',
          ),
          principle: 'complement_flavour',
          ingredient: 'spaghetti',
        },
        {
          kind: 'food',
          label: t('Crusty bread', 'Pâine crocantă'),
          reason: t(
            'A crisp crust for mopping up the sauce.',
            'O crustă crocantă cu care ștergi sosul din farfurie.',
          ),
          principle: 'contrast_texture',
          ingredient: 'ciabatta',
        },
        {
          kind: 'food',
          label: t('Rocket salad', 'Salată de rucola'),
          reason: t(
            'Peppery, slightly bitter leaves lighten the rich meat and sauce.',
            'Frunzele piperate, ușor amărui, ușurează carnea și sosul bogat.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'rocket',
        },
        {
          kind: 'drink',
          label: t('Dry red wine', 'Vin roșu sec'),
          reason: t(
            'Its acidity matches the tomato and its light tannin balances the meat.',
            'Aciditatea lui se potrivește cu roșiile, iar taninul ușor echilibrează carnea.',
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
            'Warm, saucy and comforting.',
            'Calde, cu sos și reconfortante.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from the meat helps recovery, and with pasta or bread alongside you get carbohydrates too.',
            'Proteinele din carne ajută la refacere, iar cu paste sau pâine alături primești și carbohidrați.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'A long-simmered, hot and heavy dish is a poor fit for hot weather.',
            'Un preparat fiert îndelung, fierbinte și greu nu se potrivește pe vreme caldă.',
          ),
        },
      ],
    },
  ],
};
