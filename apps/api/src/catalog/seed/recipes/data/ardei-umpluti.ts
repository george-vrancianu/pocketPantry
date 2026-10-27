import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Ardei umpluți base is the Romanian home-cooking stuffed pepper: ardei
// grași filled with pork, rice and herbs, simmered upright in tomato juice and
// served with smântână. Each Variant is a full Recipe with its own
// lines, steps and guidance; the base's Recipe-level Tips are inherited unless
// hidden.
export const ardeiUmpluti: BaseRecipeSeed = {
  slug: 'ardei-umpluti',
  title: t('Romanian stuffed peppers (ardei umpluți)', 'Ardei umpluți'),
  servings: 6,
  prepMinutes: 30,
  cookMinutes: 95,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'bell-pepper',
      quantity: 12,
      unit: 'pcs',
      note: t(
        'medium, firm, able to stand upright',
        'mijlocii, tari, care stau drepți',
      ),
    },
    { ingredient: 'minced-pork', quantity: 700, unit: 'g' },
    {
      ingredient: 'round-rice',
      quantity: 120,
      unit: 'g',
      note: t('rinsed', 'spălat'),
    },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('finely chopped', 'tocate mărunt'),
    },
    {
      ingredient: 'carrot',
      quantity: 100,
      unit: 'g',
      optional: true,
      note: t('grated', 'rasă'),
    },
    { ingredient: 'sunflower-oil', quantity: 60, unit: 'ml' },
    {
      ingredient: 'eggs',
      quantity: 1,
      unit: 'pcs',
      optional: true,
      note: t('to bind the filling', 'pentru legarea umpluturii'),
    },
    {
      ingredient: 'dill',
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
    { ingredient: 'savory', quantity: 3, unit: 'g' },
    { ingredient: 'paprika', quantity: 5, unit: 'g' },
    { ingredient: 'salt', quantity: 10, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 3, unit: 'g' },
    { ingredient: 'tomato-juice', quantity: 800, unit: 'ml' },
    { ingredient: 'tomato-paste', quantity: 40, unit: 'g' },
    { ingredient: 'still-water', quantity: 200, unit: 'ml' },
    { ingredient: 'bay-leaves', quantity: 0.5, unit: 'g', optional: true },
    {
      ingredient: 'sour-cream',
      quantity: 300,
      unit: 'g',
      optional: true,
      note: t('to serve', 'pentru servit'),
    },
  ],
  steps: [
    {
      key: 'peppers',
      text: t(
        'Wash the peppers. Cut a lid off each one around the stem and keep the lids. Scrape out the seeds and the white ribs. If a pepper wobbles, slice a thin sliver off its base, without cutting through.',
        'Spală ardeii. Taie de la fiecare un capac în jurul cozii și păstrează capacele. Scoate semințele și nervurile albe dinăuntru. Dacă un ardei se clatină, taie o felie subțire de la bază, fără să-l găurești.',
      ),
    },
    {
      key: 'soften-onion',
      text: t(
        'Warm the oil in a pan over medium heat. Cook the onions and the carrot for about 8 minutes, stirring, until soft and glassy but not browned. Let them cool completely.',
        'Încinge uleiul într-o tigaie la foc mediu. Călește ceapa și morcovul cam 8 minute, amestecând, până se înmoaie și devin sticloase, fără să se rumenească. Lasă-le să se răcească complet.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'filling',
      text: t(
        'In a large bowl mix the minced pork, the cooled onions, the rinsed rice, the egg, half of the dill, all the parsley, the savory (cimbru), paprika, salt and pepper. Knead with your hands for a minute until evenly combined.',
        'Într-un bol mare amestecă carnea tocată, ceapa răcită, orezul spălat, oul, jumătate din mărar, tot pătrunjelul, cimbrul, boiaua, sarea și piperul. Frământă cu mâna un minut, până se omogenizează.',
      ),
    },
    {
      key: 'fill',
      text: t(
        'Spoon the filling into the peppers, filling each one about three-quarters full, and press it down lightly. Set the lids back on.',
        'Umple fiecare ardei cam trei sferturi cu umplutură și apas-o ușor. Pune capacele la loc.',
      ),
    },
    {
      key: 'pack',
      text: t(
        'Put the bay leaves in a wide, heavy pot and stand the peppers upright in it, packed snugly side by side so they hold each other up.',
        'Pune foile de dafin într-o oală lată și grea și așază ardeii în picioare, strâns unul lângă altul, ca să se sprijine între ei.',
      ),
    },
    {
      key: 'sauce',
      text: t(
        'Whisk the tomato paste into the tomato juice and water, stir in the rest of the dill, and pour it around the peppers. Taste the liquid and salt it lightly if the juice is unsalted. It should come about two-thirds of the way up; add a little water if it does not.',
        'Desfă pasta de roșii în sucul de roșii și apă, adaugă restul de mărar și toarnă în jurul ardeilor. Gustă lichidul și sărează-l ușor dacă sucul nu e sărat. Trebuie să ajungă cam la două treimi din înălțime; dacă nu, mai adaugă puțină apă.',
      ),
    },
    {
      key: 'boil',
      text: t(
        'Bring to a boil over medium heat, which takes about 10 minutes, then turn the heat right down and cover the pot.',
        'Adu la fierbere la foc mediu, cam 10 minute, apoi dă focul la minimum și acoperă oala.',
      ),
    },
    {
      key: 'simmer',
      text: t(
        'Simmer for 1 hour, until the peppers are soft and the sauce has turned deep red. The liquid should barely tremble, not boil hard.',
        'Fierbe o oră, până se înmoaie ardeii și sosul capătă o culoare roșie intensă. Lichidul trebuie să tremure ușor, nu să bolborosească tare.',
      ),
      timerSeconds: 3600,
    },
    {
      key: 'check',
      text: t(
        'Lift one pepper out and cut it open: the filling must be firm and cooked through with no raw, pink meat (71 C in the centre if you have a thermometer), the juices clear and the rice soft.',
        'Scoate un ardei și taie-l: umplutura trebuie să fie fermă și gătită în tot centrul, fără carne crudă, roz (71 C în mijloc, dacă ai termometru), cu zeama limpede și orezul moale.',
      ),
    },
    {
      key: 'more',
      text: t(
        'Only if the pepper was not done: cover again and simmer another 15 minutes, then check again.',
        'Doar dacă ardeiul nu era gata: acoperă la loc și mai fierbe 15 minute, apoi verifică din nou.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'rest',
      text: t(
        'Switch off the heat and leave the pot covered for 10 minutes, so the filling settles and the peppers do not split when you lift them.',
        'Oprește focul și lasă oala acoperită 10 minute, ca umplutura să se așeze și ardeii să nu se spargă când îi scoți.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'serve',
      text: t(
        'Serve two peppers per person with a ladle of the sauce, a spoon of sour cream.',
        'Servește câte doi ardei de persoană, cu un polonic de sos, o lingură de smântână.',
      ),
    },
  ],
  tips: [
    t(
      'Fill the peppers only three-quarters full and do not pack the filling hard: the rice swells as it cooks and tight peppers split or turn out dense.',
      'Umple ardeii doar trei sferturi și nu îndesa umplutura: orezul se umflă la fiert, iar ardeii prea plini crapă sau ies compacți.',
    ),
    t(
      'Ardei umpluți are even better the next day. Cool them quickly and refrigerate within 1 hour (cooked rice should not stand out); reheat gently in their sauce until piping hot all through.',
      'Ardeii umpluți sunt și mai buni a doua zi. Răcește-i repede și pune-i la frigider în cel mult o oră (orezul fiert nu are voie să stea afară); încălzește-i încet, în sosul lor, până fierb bine în tot centrul.',
    ),
  ],
  stepTips: [
    {
      step: 'pack',
      text: t(
        'A snug pot is what keeps the peppers upright and the filling from spilling out. If the pot is too wide, wedge in a peeled potato or two to fill the gaps.',
        'O oală în care ardeii încap strâns îi ține în picioare și împiedică umplutura să iasă. Dacă oala e prea largă, înfundă între ei unul-doi cartofi curățați.',
      ),
    },
    {
      step: 'simmer',
      text: t(
        'Do not stir once the pot is simmering; shake it gently by the handles if you worry about sticking.',
        'Nu amesteca în oală după ce a început să fiarbă; dacă te temi că se prind, scutură-o ușor de mânere.',
      ),
    },
  ],
  nutritionNote: t(
    'A filling dish: protein from the pork, fibre and vitamin C from the peppers and tomatoes, and the rice adds starch for energy. The pork fat, the oil and especially the sour cream bring saturated fat, and bought tomato juice can be salty. Leaner mince, less oil and a lighter spoon of sour cream make it lighter.',
    'Un fel sățios: carnea de porc dă proteine, ardeii și roșiile aduc fibre și vitamina C, iar orezul aduce amidon, deci energie. Grăsimea din porc, uleiul și mai ales smântâna aduc grăsimi saturate, iar sucul de roșii din comerț poate fi sărat. Carnea mai slabă, mai puțin ulei și o lingură mai mică de smântână îi fac mai ușori.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t(
        'Mămăligă with cheese and sour cream',
        'Mămăligă cu brânză și smântână',
      ),
      reason: t(
        'Soft boiled cornmeal soaks up the tomato sauce and gives the mild, juicy peppers something plain to rest on.',
        'Mălaiul fiert, moale, absoarbe sosul de roșii și dă ardeilor fragezi și zemoși o garnitură simplă pe care să se sprijine.',
      ),
      principle: 'complement_flavour',
      recipe: 'mamaliga',
    },
    {
      kind: 'food',
      label: t('Hot pepper', 'Ardei iute'),
      reason: t(
        'A bite of raw hot pepper adds heat against the mild filling and the cool sour cream.',
        'O îmbucătură de ardei iute crud aduce iuțeală peste umplutura blândă și smântâna rece.',
      ),
      principle: 'contrast_texture',
      ingredient: 'hot-pepper',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sharp brine cuts through the pork and the rich sauce.',
        'Zeama lor acră taie din greutatea cărnii de porc și a sosului.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'drink',
      label: t('Dry red wine', 'Vin roșu sec'),
      reason: t(
        'Its acidity stands up to the tomato sauce and cuts the fat of the pork.',
        'Aciditatea lui ține piept sosului de roșii și taie grăsimea cărnii de porc.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'red-wine',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot, hearty pot of peppers in sauce warms you through on a cold day.',
        'O oală fierbinte și consistentă de ardei în sos te încălzește într-o zi rece.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'A heavy meal of meat and fat sits in the stomach during exercise.',
        'O masă grea, cu carne și grăsime, rămâne la stomac în timpul efortului.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Fatty meat and sour cream make it heavy to digest before bed.',
        'Carnea grasă și smântâna o fac greu de digerat înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'ardei-umpluti-hungarian',
      cuisine: 'hungarian',
      title: t(
        'Töltött paprika (Hungarian stuffed peppers in sweet tomato sauce)',
        'Ardei umpluți ca în Ungaria (töltött paprika)',
      ),
      servings: 6,
      prepMinutes: 30,
      cookMinutes: 95,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'bell-pepper',
          quantity: 12,
          unit: 'pcs',
          note: t(
            'medium, firm, able to stand upright',
            'mijlocii, tari, care stau drepți',
          ),
        },
        { ingredient: 'minced-pork', quantity: 700, unit: 'g' },
        {
          ingredient: 'round-rice',
          quantity: 100,
          unit: 'g',
          note: t('rinsed', 'spălat'),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely chopped', 'tocată mărunt'),
        },
        {
          ingredient: 'garlic',
          quantity: 15,
          unit: 'g',
          note: t('crushed', 'zdrobit'),
        },
        { ingredient: 'eggs', quantity: 1, unit: 'pcs' },
        {
          ingredient: 'paprika',
          key: 'paprika-filling',
          quantity: 10,
          unit: 'g',
          note: t('sweet, for the filling', 'dulce, pentru umplutură'),
        },
        {
          ingredient: 'salt',
          key: 'salt-filling',
          quantity: 8,
          unit: 'g',
          note: t('for the filling', 'pentru umplutură'),
        },
        { ingredient: 'black-pepper', quantity: 3, unit: 'g' },
        { ingredient: 'passata', quantity: 700, unit: 'ml' },
        { ingredient: 'still-water', quantity: 400, unit: 'ml' },
        { ingredient: 'sunflower-oil', quantity: 40, unit: 'ml' },
        {
          ingredient: 'flour',
          quantity: 40,
          unit: 'g',
          note: t('for the roux', 'pentru rântaș'),
        },
        {
          ingredient: 'paprika',
          key: 'paprika-sauce',
          quantity: 5,
          unit: 'g',
          note: t('sweet, for the sauce', 'dulce, pentru sos'),
        },
        { ingredient: 'sugar', quantity: 15, unit: 'g' },
        {
          ingredient: 'salt',
          key: 'salt-sauce',
          quantity: 3,
          unit: 'g',
          note: t('for the sauce', 'pentru sos'),
        },
        {
          ingredient: 'potato',
          quantity: 1,
          unit: 'kg',
          note: t('peeled, in chunks', 'curățați, tăiați bucăți'),
        },
        {
          ingredient: 'salt',
          key: 'salt-potatoes',
          quantity: 10,
          unit: 'g',
          note: t('for the potato water', 'pentru apa cartofilor'),
        },
      ],
      steps: [
        {
          key: 'peppers',
          text: t(
            'Wash the peppers. Cut a lid off each one around the stem and keep the lids. Scrape out the seeds and the white ribs. If a pepper wobbles, slice a thin sliver off its base, without cutting through.',
            'Spală ardeii. Taie de la fiecare un capac în jurul cozii și păstrează capacele. Scoate semințele și nervurile albe dinăuntru. Dacă un ardei se clatină, taie o felie subțire de la bază, fără să-l găurești.',
          ),
        },
        {
          key: 'filling',
          text: t(
            'In a large bowl mix the minced pork, the chopped onion, the rinsed rice, the garlic, the egg, the filling paprika, the filling salt and the pepper. Knead with your hands for a minute until evenly combined.',
            'Într-un bol mare amestecă carnea tocată, ceapa tocată, orezul spălat, usturoiul, oul, boiaua și sarea pentru umplutură și piperul. Frământă cu mâna un minut, până se omogenizează.',
          ),
        },
        {
          key: 'fill',
          text: t(
            'Spoon the filling into the peppers, filling each one about three-quarters full, and press it down lightly. Set the lids back on.',
            'Umple fiecare ardei cam trei sferturi cu umplutură și apas-o ușor. Pune capacele la loc.',
          ),
        },
        {
          key: 'roux',
          text: t(
            'Warm the oil in a wide, heavy pot over medium heat. Stir in the flour and cook for 2 minutes, stirring, until pale golden. Take the pot off the heat and stir in the sauce paprika, which burns and turns bitter on direct heat.',
            'Încinge uleiul într-o oală lată și grea, la foc mediu. Adaugă făina și gătește 2 minute, amestecând, până capătă o culoare aurie deschisă. Ia oala de pe foc și amestecă boiaua pentru sos, care arde și se amărăște pe foc direct.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'sauce',
          text: t(
            'Whisk in the passata and the water a little at a time so there are no lumps. Add the sugar and the sauce salt, return to the heat and bring to a boil, stirring, until it thickens slightly. Taste and add a little more salt if needed.',
            'Adaugă pasata și apa puțin câte puțin, amestecând cu telul, ca să nu se facă cocoloașe. Pune zahărul și sarea pentru sos, du oala înapoi pe foc și adu la fierbere, amestecând, până se îngroașă puțin. Gustă și mai pune sare dacă e nevoie.',
          ),
        },
        {
          key: 'pack',
          text: t(
            'Stand the peppers upright in the sauce, packed snugly side by side. The sauce should come about two-thirds of the way up; add a little water if it does not.',
            'Așază ardeii în picioare în sos, strâns unul lângă altul. Sosul trebuie să ajungă cam la două treimi din înălțime; dacă nu, adaugă puțină apă.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Bring back to a boil, which takes about 5 minutes, then cover and simmer on the lowest heat for 1 hour, until the peppers are soft. Do not stir; check once or twice, tilting the pot gently, that nothing is sticking on the bottom.',
            'Adu din nou la fierbere, cam 5 minute, apoi acoperă și fierbe la foc foarte mic o oră, până se înmoaie ardeii. Nu amesteca; verifică de două ori, înclinând ușor oala, că nu se prinde nimic de fund.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'potatoes',
          text: t(
            'About 25 minutes before the peppers are done, put the potatoes in a pot with cold water to cover and the potato salt. Bring to a boil and cook for 20 minutes, until a knife slides in easily, then drain.',
            'Cam cu 25 de minute înainte să fie gata ardeii, pune cartofii într-o oală cu apă rece cât să-i acopere și cu sarea pentru apa cartofilor. Adu la fierbere și fierbe 20 de minute, până intră ușor cuțitul în ei, apoi scurge-i.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'check',
          text: t(
            'Lift one pepper out and cut it open: the filling must be firm and cooked through with no raw, pink meat (71 C in the centre if you have a thermometer), and the rice soft.',
            'Scoate un ardei și taie-l: umplutura trebuie să fie fermă și gătită în tot centrul, fără carne crudă, roz (71 C în mijloc, dacă ai termometru), iar orezul moale.',
          ),
        },
        {
          key: 'more',
          text: t(
            'Only if the pepper was not done: cover again and simmer another 15 minutes, then check again.',
            'Doar dacă ardeiul nu era gata: acoperă la loc și mai fierbe 15 minute, apoi verifică din nou.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'rest',
          text: t(
            'Take the pot off the heat and leave it covered for 10 minutes.',
            'Ia oala de pe foc și las-o acoperită 10 minute.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'serve',
          text: t(
            'Serve two peppers per person with plenty of the sweet sauce spooned over the boiled potatoes.',
            'Servește câte doi ardei de persoană, cu mult sos dulce turnat peste cartofii fierți.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'sauce',
          text: t(
            'If the passata tastes very sharp, add a little more sugar a pinch at a time; the sauce should be gently sweet-sour, not sugary.',
            'Dacă pasata e foarte acră, mai pune zahăr câte un praf; sosul trebuie să fie ușor dulce-acrișor, nu zaharisit.',
          ),
        },
      ],
      nutritionNote: t(
        'Protein from the pork, fibre and vitamin C from the peppers and tomato, and potatoes and rice for energy. The pork fat, the roux and the sugar in the sauce add saturated fat and sugar, and the double starch of rice and potatoes makes it a heavy plate. Leaner mince and a smaller helping of potatoes lighten it.',
        'Proteine din carnea de porc, fibre și vitamina C din ardei și roșii, plus energie din cartofi și orez. Grăsimea din porc, rântașul și zahărul din sos aduc grăsimi saturate și zahăr, iar amidonul dublu din orez și cartofi face farfuria grea. Carnea mai slabă și o porție mai mică de cartofi o fac mai ușoară.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Sour cream', 'Smântână'),
          reason: t(
            'Its cool tang cuts the richness of the pork and rounds off the sweet sauce.',
            'Aciditatea ei răcoroasă taie din bogăția cărnii și rotunjește sosul dulce.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'sour-cream',
        },
        {
          kind: 'food',
          label: t('Pickled cucumbers', 'Castraveți murați'),
          reason: t(
            'Their sharp brine cuts the sweetness and the richness of the sauce.',
            'Zeama lor acră taie dulceața și bogăția sosului.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-cucumbers',
        },
        {
          kind: 'drink',
          label: t('Dry red wine', 'Vin roșu sec'),
          reason: t(
            'Its acidity stands up to the sweet tomato sauce and cuts the fat of the pork.',
            'Aciditatea lui ține piept sosului dulce de roșii și taie grăsimea cărnii de porc.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'red-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Peppers in warm tomato sauce with potatoes are comforting on a cold day.',
            'Ardeii în sos cald de roșii, cu cartofi, mângâie într-o zi rece.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'A heavy meal of meat, rice and potatoes sits in the stomach during exercise.',
            'O masă grea, cu carne, orez și cartofi, rămâne la stomac în timpul efortului.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'It is a heavy, starchy plate to digest before bed.',
            'E o farfurie grea și făinoasă de digerat înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'ardei-umpluti-greek',
      cuisine: 'greek',
      title: t(
        'Gemista (Greek rice-stuffed tomatoes and peppers)',
        'Gemista (roșii și ardei umpluți cu orez, ca în Grecia)',
      ),
      servings: 6,
      prepMinutes: 40,
      cookMinutes: 100,
      difficulty: 'medium',
      hideBaseTips: [0, 1],
      lines: [
        {
          ingredient: 'tomato',
          quantity: 1200,
          unit: 'g',
          note: t(
            'about 6 large, ripe but firm',
            'cam 6 mari, coapte dar tari',
          ),
        },
        {
          ingredient: 'bell-pepper',
          quantity: 4,
          unit: 'pcs',
          note: t(
            'medium, able to stand upright',
            'mijlocii, care stau drepți',
          ),
        },
        {
          ingredient: 'medium-grain-rice',
          quantity: 180,
          unit: 'g',
          note: t('rinsed', 'spălat'),
        },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('finely chopped', 'tocate mărunt'),
        },
        {
          ingredient: 'garlic',
          quantity: 15,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        { ingredient: 'olive-oil', quantity: 120, unit: 'ml' },
        { ingredient: 'tomato-paste', quantity: 30, unit: 'g' },
        {
          ingredient: 'mint',
          quantity: 15,
          unit: 'g',
          note: t('finely chopped', 'tocată mărunt'),
        },
        {
          ingredient: 'parsley',
          quantity: 30,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        {
          ingredient: 'dill',
          quantity: 15,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        { ingredient: 'sugar', quantity: 5, unit: 'g' },
        { ingredient: 'salt', quantity: 12, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
        { ingredient: 'still-water', quantity: 400, unit: 'ml' },
        {
          ingredient: 'potato',
          quantity: 0.6,
          unit: 'kg',
          note: t('peeled, in wedges', 'curățați, tăiați felii groase'),
        },
        {
          ingredient: 'feta',
          quantity: 150,
          unit: 'g',
          optional: true,
          note: t('to serve', 'pentru servit'),
        },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 190 C (170 C fan). It needs about 15 minutes, which is just right for preparing the vegetables.',
            'Încălzește cuptorul la 190 C (170 C cu ventilator). Are nevoie de vreo 15 minute, cât pregătești legumele.',
          ),
        },
        {
          key: 'hollow',
          text: t(
            'Cut a lid off each tomato and each pepper and keep the lids. Scoop the pulp out of the tomatoes with a spoon into a bowl, leaving walls about 1 cm thick, and scrape the seeds and ribs out of the peppers. Chop the pulp roughly and keep its juices.',
            'Taie un capac de la fiecare roșie și de la fiecare ardei și păstrează capacele. Scoate cu lingura miezul roșiilor într-un bol, lăsând pereți de vreun centimetru, și curăță ardeii de semințe și nervuri albe. Taie miezul mărunt și păstrează-i sucul.',
          ),
        },
        {
          key: 'soften-onion',
          text: t(
            'Warm 60 ml of the olive oil in a pan over medium heat. Cook the onions for about 8 minutes, stirring, until soft and glassy, then add the garlic for the last minute.',
            'Încinge 60 ml din uleiul de măsline într-o tigaie la foc mediu. Călește ceapa cam 8 minute, amestecând, până se înmoaie și devine sticloasă, apoi adaugă usturoiul pentru ultimul minut.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'rice',
          text: t(
            'Stir in the rice and the tomato paste and cook for 2 minutes, then take the pan off the heat. Mix in the tomato pulp with its juices, the mint, parsley, dill, sugar, salt, pepper and 150 ml of the water.',
            'Adaugă orezul și pasta de roșii și gătește 2 minute, apoi ia tigaia de pe foc. Amestecă miezul de roșii cu sucul lui, menta, pătrunjelul, mărarul, zahărul, sarea, piperul și 150 ml din apă.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'fill',
          text: t(
            'Spoon the filling with its juices into the tomatoes and peppers, sharing the liquid evenly, and fill them about two-thirds full, because the rice swells as it cooks. Set the lids back on.',
            'Pune umplutura cu tot cu zeamă în roșii și în ardei, împărțind lichidul egal, și umple-le cam două treimi, pentru că orezul se umflă la copt. Pune capacele la loc.',
          ),
        },
        {
          key: 'tray',
          text: t(
            'Stand the vegetables upright and snug in a deep roasting tray, about 40 x 30 cm, and wedge the potatoes in the gaps. Season the potatoes with a pinch of salt, drizzle everything with the remaining 60 ml of olive oil, and pour the remaining 250 ml of water into the tray around them.',
            'Așază legumele în picioare, strâns, într-o tavă adâncă de vreo 40 x 30 cm și înfundă cartofii în spațiile dintre ele. Presară cartofii cu un praf de sare, stropește totul cu cei 60 ml de ulei de măsline rămași și toarnă în jurul lor cei 250 ml de apă rămași.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 1 hour 15 minutes, until the vegetable skins are wrinkled and browned at the edges, the potatoes are golden and tender, and the tray is almost dry of liquid.',
            'Coace o oră și un sfert, până se zbârcesc pielițele legumelor și se rumenesc pe margini, cartofii devin aurii și moi, iar în tavă a mai rămas foarte puțin lichid.',
          ),
          timerSeconds: 4500,
        },
        {
          key: 'check',
          text: t(
            'Test one tomato and one pepper: the rice must be tender all the way through. The peppers are the ones where it stays firm, because their walls give the rice no pulp.',
            'Încearcă o roșie și un ardei: orezul trebuie să fie fraged în tot centrul. La ardei rămâne mai des tare, pentru că pereții lor nu dau orezului sucul roșiilor.',
          ),
        },
        {
          key: 'more',
          text: t(
            'Only if the rice is still firm: add a splash of water to the tray and bake 10 more minutes, covering with foil if the tops are getting dark.',
            'Doar dacă orezul e încă tare: adaugă puțină apă în tavă și mai coace 10 minute, acoperind cu folie dacă se înnegresc capacele.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'rest',
          text: t(
            'Take the tray out and let it rest for 15 minutes.',
            'Scoate tava și las-o 15 minute la odihnă.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'serve',
          text: t(
            'Serve warm or lukewarm, with the tray juices spooned over and the feta crumbled on top.',
            'Servește cald sau călduț, cu zeama din tavă turnată peste și feta mărunțită deasupra.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'fill',
          text: t(
            'The rice is raw when it goes in and cooks in the tomato juices, so do not top up with extra rice: it would leave the middle hard.',
            'Orezul intră crud și se fierbe în sucul roșiilor, deci nu mai adăuga orez: ar rămâne tare în mijloc.',
          ),
        },
      ],
      tips: [
        t(
          'Gemista is good warm or lukewarm, once it has rested for 15 minutes. Eat it within an hour of baking. Refrigerate leftovers within 1 hour (cooked rice left out can grow Bacillus cereus) and eat them within a day, cold or reheated once until steaming.',
          'Gemista e bună caldă sau călduță, după ce a stat 15 minute. Mănâncă-o în cel mult o oră de la scoaterea din cuptor. Pune resturile la frigider în cel mult o oră (orezul fiert lăsat afară poate dezvolta Bacillus cereus) și mănâncă-le într-o zi, reci sau încălzite o singură dată până scot abur.',
        ),
      ],
      nutritionNote: t(
        'Meatless and rich in fibre, vitamin C and carbohydrates from the rice, tomatoes and peppers, with the feta adding protein and calcium. The olive oil is generous and mostly unsaturated, but it makes the dish calorie-dense, and the feta is salty. Less oil and a smaller crumble of feta lighten it.',
        'Fără carne, bogată în fibre, vitamina C și carbohidrați din orez, roșii și ardei, iar feta adaugă proteine și calciu. Uleiul de măsline e din belșug și în mare parte nesaturat, dar face mâncarea bogată în calorii, iar feta e sărată. Mai puțin ulei și mai puțină fetă o fac mai ușoară.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Greek lentil soup', 'Supă grecească de linte'),
          reason: t(
            'Both are everyday meatless Greek home dishes; a bowl of soup first and the gemista after make a full meatless meal.',
            'Amândouă sunt mâncăruri grecești de casă, fără carne; o supă întâi și gemista după alcătuiesc o masă completă fără carne.',
          ),
          principle: 'regional_tradition',
          recipe: 'lentil-soup-greek',
        },
        {
          kind: 'food',
          label: t('Bread', 'Pâine'),
          reason: t(
            'Fresh bread mops up the olive oil and tomato juices left in the tray.',
            'Pâinea proaspătă adună uleiul de măsline și zeama de roșii rămase în tavă.',
          ),
          principle: 'complement_flavour',
          ingredient: 'bread',
        },
        {
          kind: 'food',
          label: t('Olives', 'Măsline'),
          reason: t(
            'Their salty bite contrasts with the soft, sweet rice and tomato.',
            'Gustul lor sărat contrastează cu orezul moale și roșia dulce.',
          ),
          principle: 'contrast_texture',
          ingredient: 'olives',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its acidity cuts through the olive oil and keeps the tomato flavour fresh.',
            'Aciditatea lui taie uleiul de măsline și ține proaspăt gustul roșiilor.',
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
            'It is meatless and good lukewarm, so it makes an easy lunch.',
            'Nu are carne și e bună și călduță, deci iese un prânz ușor de făcut.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Rice and potatoes refill energy after exercise.',
            'Orezul și cartofii refac energia după efort.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'The olive oil and the bulk of rice sit heavily in the stomach before exercise.',
            'Uleiul de măsline și volumul de orez rămân greu la stomac înainte de efort.',
          ),
        },
      ],
    },
  ],
};
