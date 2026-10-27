import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Falafel base is chickpea falafel with tahini sauce. The Variants swap the
// pulse and the flavour (ta'ameya, masala vada) and are full Recipes with
// their own lines, steps and guidance; the base's Recipe-level Tips are
// inherited unless hidden. All three are deep-fried, so each repeats the
// hot-oil advice in its own step Tips.
export const falafel: BaseRecipeSeed = {
  slug: 'falafel',
  title: t(
    'Falafel (fried chickpea patties with tahini sauce)',
    'Falafel (chiftele de năut cu sos de tahini)',
  ),
  servings: 4,
  prepMinutes: 780,
  cookMinutes: 35,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'chickpeas',
      quantity: 250,
      unit: 'g',
      note: t(
        'dried, never canned or cooked; soaked 12 to 24 hours',
        'uscat, nu din conservă și nici fiert; înmuiat 12-24 de ore',
      ),
    },
    {
      ingredient: 'onion',
      quantity: 1,
      unit: 'pcs',
      note: t('roughly chopped', 'tăiată grosier'),
    },
    {
      ingredient: 'garlic',
      quantity: 15,
      unit: 'g',
      note: t('for the mix', 'pentru compoziție'),
    },
    {
      ingredient: 'parsley',
      quantity: 40,
      unit: 'g',
      note: t('leaves and tender stems', 'frunze și tulpini fragede'),
    },
    {
      ingredient: 'coriander',
      quantity: 40,
      unit: 'g',
      note: t('leaves and tender stems', 'frunze și tulpini fragede'),
    },
    { ingredient: 'cumin', quantity: 6, unit: 'g' },
    { ingredient: 'ground-coriander', quantity: 4, unit: 'g' },
    { ingredient: 'cayenne', quantity: 1, unit: 'g' },
    {
      ingredient: 'salt',
      quantity: 8,
      unit: 'g',
      note: t('for the mix', 'pentru compoziție'),
    },
    {
      ingredient: 'baking-soda',
      quantity: 4,
      unit: 'g',
      note: t(
        'mixed in just before shaping',
        'se amestecă chiar înainte de modelare',
      ),
    },
    {
      ingredient: 'sunflower-oil',
      quantity: 1200,
      unit: 'ml',
      note: t(
        'for deep frying, in a heavy pot of at least 4 litres',
        'pentru prăjit în ulei încins, într-o oală groasă de cel puțin 4 litri',
      ),
    },
    { ingredient: 'tahini', quantity: 60, unit: 'g' },
    { ingredient: 'lemon-juice', quantity: 40, unit: 'ml' },
    {
      key: 'garlic-sauce',
      ingredient: 'garlic',
      quantity: 5,
      unit: 'g',
      note: t(
        'for the tahini sauce, crushed',
        'pentru sosul de tahini, zdrobit',
      ),
    },
    {
      key: 'salt-sauce',
      ingredient: 'salt',
      quantity: 1,
      unit: 'g',
      note: t('for the tahini sauce', 'pentru sosul de tahini'),
    },
    {
      ingredient: 'still-water',
      quantity: 0.06,
      unit: 'l',
      note: t('cold, for the tahini sauce', 'rece, pentru sosul de tahini'),
    },
    {
      ingredient: 'tomato',
      quantity: 300,
      unit: 'g',
      note: t('sliced, to serve', 'felii, pentru servit'),
    },
    {
      ingredient: 'cucumber',
      quantity: 1,
      unit: 'pcs',
      note: t('sliced, to serve', 'felii, pentru servit'),
    },
  ],
  steps: [
    {
      key: 'soak',
      text: t(
        'Put the dried chickpeas in a large bowl and cover with three times their volume of cold water. Soak for 12 to 24 hours at room temperature, until they have roughly doubled in size and no hard, dry white core is left when you split one open. In a warm kitchen, soak them in the fridge or change the water once.',
        'Pune năutul uscat într-un castron mare și acoperă-l cu apă rece, de trei ori cât volumul lui. Lasă-l la înmuiat 12-24 de ore la temperatura camerei, până când se umflă aproape de două ori și nu mai are miez alb și tare când rupi unul în două. Dacă bucătăria e caldă, înmoaie-le la frigider sau schimbă apa o dată.',
      ),
      timerSeconds: 43200,
    },
    {
      key: 'drain',
      text: t(
        'Drain the chickpeas well and spread them on a clean towel. Pat them dry. They should be firm, not mushy: do not cook them.',
        'Scurge bine năutul și întinde-l pe un prosop curat. Șterge-l ușor până se usucă. Trebuie să fie ferm, nu moale: nu-l fierbe.',
      ),
    },
    {
      key: 'grind',
      text: t(
        'Put the chickpeas, onion, the mix garlic, parsley, coriander, cumin, ground coriander, cayenne and the mix salt in a food processor, in two batches if needed. Pulse, scraping down the sides, until the mix is a coarse, sandy crumb that holds together when pinched. Do not blend it to a paste.',
        'Pune în robotul de bucătărie năutul, ceapa, usturoiul pentru compoziție, pătrunjelul, coriandrul verde, chimionul, coriandrul măcinat, cayenne și sarea pentru compoziție, în două tranșe dacă e nevoie. Mixează în reprize scurte, răzuind pereții, până când compoziția devine grunjoasă, ca nisipul umed, și se ține când o strângi între degete. Nu o face pastă.',
      ),
    },
    {
      key: 'chill',
      text: t(
        'Cover the bowl and chill the mix for 30 minutes, so that it firms up and is easier to shape.',
        'Acoperă castronul și ține compoziția la frigider 30 de minute, ca să se întărească și să fie mai ușor de modelat.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'sauce',
      text: t(
        'While the mix chills, whisk the tahini with the lemon juice, the sauce garlic and the sauce salt. The sauce will seize up and go thick. Whisk in the cold water a spoonful at a time until it is smooth and pourable like thick cream. Taste and add salt or lemon if needed.',
        'Cât timp se răcește compoziția, amestecă tahini cu sucul de lămâie, usturoiul pentru sos și sarea pentru sos. Sosul se va strânge și se va îngroșa. Adaugă apa rece câte o lingură, amestecând, până când sosul e fin și curge ca o smântână groasă. Gustă și adaugă sare sau lămâie dacă e nevoie.',
      ),
    },
    {
      key: 'shape',
      text: t(
        'Sprinkle the baking soda over the chilled mix and work it in. With wet hands, press the mix into 24 walnut-sized balls, about 35 g each, squeezing firmly so that they hold together. Put them on a plate; flatten them slightly if you like.',
        'Presară bicarbonatul peste compoziția răcită și amestecă-l. Cu mâinile ude, strânge compoziția în 24 de bile cât o nucă, de aproximativ 35 g fiecare, apăsând ferm ca să se țină. Pune-le pe o farfurie; le poți turti ușor dacă vrei.',
      ),
    },
    {
      key: 'heat-oil',
      text: t(
        'Pour the oil into a heavy, deep pot so that it is no more than a third full. Clip a frying thermometer to the side and heat over medium heat until it reads 175 to 180 °C. Stay with the pot while it heats.',
        'Toarnă uleiul într-o oală groasă și adâncă, astfel încât să o umple cel mult o treime. Fixează pe margine un termometru de prăjit și încălzește la foc mediu până când arată 175-180 °C. Rămâi lângă oală cât se încălzește.',
      ),
    },
    {
      key: 'fry-first',
      text: t(
        'Lower 6 to 8 balls into the oil with a slotted spoon, away from you; do not crowd the pot. Fry for about 4 minutes, turning once, until deep brown all over. Lift them onto a rack or paper towels. Cut one open: it should be green inside, hot and cooked through, not wet, pasty or raw in the middle. If it is raw or pasty in the middle, put that batch back in the oil for 1 to 2 minutes more and check again.',
        'Coboară în ulei 6-8 bile cu o spumieră, în direcția opusă ție; nu aglomera oala. Prăjește-le aproximativ 4 minute, întorcându-le o dată, până se rumenesc intens pe toate părțile. Scoate-le pe un grătar sau pe șervețele de hârtie. Taie una în două: înăuntru trebuie să fie verde, fierbinte și făcută până în centru, nu umedă, păstoasă sau crudă la mijloc. Dacă e crud sau păstos la mijloc, pune tranșa înapoi în ulei încă 1-2 minute și verifică din nou.',
      ),
      timerSeconds: 240,
    },
    {
      key: 'fry-rest',
      text: t(
        'Let the oil come back to 175 to 180 °C, then fry the remaining balls in the same way, in batches, about 4 minutes each. Cut one open from every batch to check it is cooked through. If it is raw or pasty in the middle, put that batch back in the oil for 1 to 2 minutes more and check again; then lower the heat a little and fry the next batch a minute longer.',
        'Lasă uleiul să revină la 175-180 °C, apoi prăjește restul bilelor la fel, în tranșe, câte aproximativ 4 minute. Taie câte una din fiecare tranșă ca să verifici că e coaptă până în centru. Dacă e crud sau păstos la mijloc, pune tranșa înapoi în ulei încă 1-2 minute și verifică din nou; apoi scade puțin focul și prăjește tranșa următoare cu un minut mai mult.',
      ),
      timerSeconds: 240,
    },
    {
      key: 'heat-off',
      text: t(
        'As soon as the last batch is out of the oil, turn the heat off. Leave the pot where it is, uncovered and out of reach of children.',
        'De îndată ce ai scos ultima tranșă din ulei, oprește focul. Lasă oala unde este, descoperită și departe de copii.',
      ),
    },
    {
      key: 'serve',
      text: t(
        'Serve the falafel hot, with the tahini sauce poured over or on the side, and the tomato and cucumber slices. Warm pita goes well on the side.',
        'Servește falafelul fierbinte, cu sosul de tahini turnat deasupra sau alături, și cu feliile de roșie și castravete. Merge bine cu lipie caldă.',
      ),
    },
    {
      key: 'cool-oil',
      text: t(
        'After the meal, leave the oil until it is completely cold, which takes several hours. Then strain it into a sealed container and throw it away with household waste, not down the sink.',
        'După masă, lasă uleiul până se răcește complet, ceea ce durează câteva ore. Apoi strecoară-l într-un recipient închis și aruncă-l la gunoiul menajer, nu pe chiuvetă.',
      ),
    },
    {
      key: 'store',
      text: t(
        'Within 2 hours of cooking, put the leftover falafel and the sauce in separate lidded containers in the fridge. Eat them within 3 days. Re-crisp the falafel on a tray in a 200 °C oven for 8 to 10 minutes, until hot all the way through; the microwave makes them soggy.',
        'În cel mult 2 ore de la gătit, pune falafelul rămas și sosul în recipiente separate, cu capac, la frigider. Consumă-le în 3 zile. Ca să redevină crocant, încălzește falafelul pe o tavă, în cuptorul la 200 °C, 8-10 minute, până se încălzește în tot mijlocul; la microunde se înmoaie.',
      ),
    },
  ],
  tips: [
    t(
      'Use dried chickpeas that were soaked, not cooked and not canned. Cooked or canned chickpeas are too soft and wet, so the falafel fall apart in the oil.',
      'Folosește năut uscat, înmuiat, nu fiert și nici din conservă. Năutul fiert sau din conservă e prea moale și prea umed, așa că falafelul se desface în ulei.',
    ),
    t(
      'Before you light the burner, put the pot lid and a damp, not dripping, towel within reach, and never leave hot oil alone. Water spits violently on hot oil, so keep it away from the pot.',
      'Înainte să aprinzi arzătorul, pune la îndemână capacul oalei și o cârpă umedă, bine stoarsă, și nu lăsa niciodată uleiul încins nesupravegheat. Apa stropește violent în uleiul fierbinte, așa că ține-o departe de oală.',
    ),
    t(
      'Keep the oil close to 175 to 180 °C. Cooler oil makes greasy falafel, and much hotter oil browns the outside before the middle is cooked.',
      'Ține uleiul aproape de 175-180 °C. Uleiul mai rece dă falafel gras, iar cel mult mai fierbinte rumenește exteriorul înainte să se coacă mijlocul.',
    ),
  ],
  stepTips: [
    {
      step: 'grind',
      text: t(
        'Pulse in short bursts and check often: a few seconds too long turns the crumb into hummus-like paste, and that makes dense, heavy falafel.',
        'Mixează în reprize scurte și verifică des: câteva secunde în plus transformă compoziția într-o pastă ca de humus, iar falafelul iese dens și greu.',
      ),
    },
    {
      step: 'heat-oil',
      text: t(
        'If the oil smokes, turn the heat off. If it catches fire, turn the heat off only if you can do it safely, do not move the pot and never throw water on it. Cover it with the lid or a damp towel. If it does not go out at once, get everyone out, close the door and call 112.',
        'Dacă uleiul începe să fumege, oprește focul. Dacă ia foc, oprește focul doar dacă poți face asta în siguranță, nu muta oala și nu arunca niciodată apă peste ea. Acoper-o cu capacul sau cu o cârpă umedă. Dacă flăcările nu se sting imediat, scoate pe toată lumea din casă, închide ușa și sună la 112.',
      ),
    },
    {
      step: 'fry-first',
      text: t(
        'If the first ball breaks up in the oil, chill the mix for another 15 minutes and squeeze the balls tighter before frying the rest.',
        'Dacă prima bilă se desface în ulei, mai ține compoziția 15 minute la rece și strânge bilele mai tare înainte să prăjești restul.',
      ),
    },
  ],
  nutritionNote: t(
    'Chickpeas bring plant protein and fibre, and the herbs add flavour without much else. Deep frying adds a lot of fat and calories, though the sunflower oil is mostly unsaturated fat, and the tahini sauce is rich too. Serve with fresh vegetables to balance the plate.',
    'Năutul aduce proteine vegetale și fibre, iar verdețurile dau gust fără să adauge prea multe altele. Prăjirea în ulei încins adaugă multe grăsimi și calorii, deși uleiul de floarea-soarelui are mai ales grăsimi nesaturate, iar sosul de tahini e și el bogat. Servește cu legume proaspete ca să echilibrezi farfuria.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t(
        'Hummus (chickpea and tahini dip)',
        'Humus (pastă de năut cu tahini)',
      ),
      reason: t(
        'The creamy dip contrasts with the crisp fritters, and the two share a plate in a mezze or a pita.',
        'Pasta cremoasă contrastează cu chiftelele crocante, iar cele două ajung împreună în aceeași farfurie, la un mezze sau într-o lipie.',
      ),
      principle: 'contrast_texture',
      recipe: 'hummus',
    },
    {
      kind: 'food',
      label: t('Warm pita', 'Lipie caldă'),
      reason: t(
        'Soft bread around the crisp fritters, so every bite has both.',
        'Pâine moale în jurul chiftelelor crocante, ca fiecare îmbucătură să le aibă pe amândouă.',
      ),
      principle: 'contrast_texture',
      ingredient: 'pita',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sharp brine cuts the oil of the fried fritters.',
        'Zeama lor acrișoară taie uleiul din chiftelele prăjite.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'drink',
      label: t('Hot tea', 'Ceai fierbinte'),
      reason: t(
        'Its gentle bitterness refreshes the palate after the fried, rich fritters.',
        'Amăreala lui blândă împrospătează gustul după chiftelele prăjite și bogate.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'tea',
    },
  ],
  eatingMoments: [
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'Filling plant protein, and it comes with raw vegetables.',
        'Proteine vegetale săturătoare, însoțite de legume crude.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Chickpeas give protein and carbohydrates; add pita for more carbohydrates.',
        'Năutul oferă proteine și carbohidrați; adaugă lipie pentru mai mulți carbohidrați.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Deep-fried food sits heavy in the stomach during exercise.',
        'Mâncarea prăjită în ulei încins cade greu la stomac în timpul efortului.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Fried and rich, it is heavy right before bed.',
        'Fiind prăjit și bogat, cade greu chiar înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'falafel-egyptian',
      cuisine: 'egyptian',
      title: t(
        "Ta'ameya (Egyptian fava bean falafel with herbs and sesame)",
        "Ta'ameya (falafel egiptean din bob, cu verdețuri și susan)",
      ),
      servings: 4,
      prepMinutes: 540,
      cookMinutes: 35,
      difficulty: 'medium',
      hideBaseTips: [0],
      lines: [
        {
          ingredient: 'split-fava-beans',
          quantity: 250,
          unit: 'g',
          note: t(
            'dried, skinless; soaked 8 to 12 hours',
            'uscat, decorticat; înmuiat 8-12 ore',
          ),
        },
        {
          ingredient: 'leek',
          quantity: 100,
          unit: 'g',
          note: t(
            'green and white parts, roughly chopped',
            'partea verde și albă, tăiat grosier',
          ),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('roughly chopped', 'tăiată grosier'),
        },
        {
          ingredient: 'garlic',
          quantity: 15,
          unit: 'g',
          note: t('for the mix', 'pentru compoziție'),
        },
        {
          ingredient: 'parsley',
          quantity: 40,
          unit: 'g',
          note: t('leaves and tender stems', 'frunze și tulpini fragede'),
        },
        {
          ingredient: 'dill',
          quantity: 20,
          unit: 'g',
          note: t('fronds and tender stems', 'frunze și tulpini fragede'),
        },
        {
          ingredient: 'coriander',
          quantity: 40,
          unit: 'g',
          note: t('leaves and tender stems', 'frunze și tulpini fragede'),
        },
        { ingredient: 'cumin', quantity: 5, unit: 'g' },
        { ingredient: 'ground-coriander', quantity: 4, unit: 'g' },
        { ingredient: 'cayenne', quantity: 1, unit: 'g' },
        {
          ingredient: 'salt',
          quantity: 7,
          unit: 'g',
          note: t('for the mix', 'pentru compoziție'),
        },
        {
          ingredient: 'baking-soda',
          quantity: 4,
          unit: 'g',
          note: t(
            'mixed in just before shaping',
            'se amestecă chiar înainte de modelare',
          ),
        },
        {
          ingredient: 'sesame-seeds',
          quantity: 40,
          unit: 'g',
          note: t('to coat one side', 'pentru acoperit o parte'),
        },
        {
          ingredient: 'sunflower-oil',
          quantity: 1200,
          unit: 'ml',
          note: t(
            'for deep frying, in a heavy pot of at least 4 litres',
            'pentru prăjit în ulei încins, într-o oală groasă de cel puțin 4 litri',
          ),
        },
        { ingredient: 'tahini', quantity: 60, unit: 'g' },
        { ingredient: 'lemon-juice', quantity: 40, unit: 'ml' },
        {
          key: 'garlic-sauce',
          ingredient: 'garlic',
          quantity: 5,
          unit: 'g',
          note: t(
            'for the tahini sauce, crushed',
            'pentru sosul de tahini, zdrobit',
          ),
        },
        {
          key: 'salt-sauce',
          ingredient: 'salt',
          quantity: 1,
          unit: 'g',
          note: t('for the tahini sauce', 'pentru sosul de tahini'),
        },
        {
          ingredient: 'still-water',
          quantity: 0.06,
          unit: 'l',
          note: t('cold, for the tahini sauce', 'rece, pentru sosul de tahini'),
        },
        {
          ingredient: 'tomato',
          quantity: 300,
          unit: 'g',
          note: t('sliced, to serve', 'felii, pentru servit'),
        },
      ],
      steps: [
        {
          key: 'soak',
          text: t(
            'Put the dried split fava beans in a large bowl and cover with three times their volume of cold water. Soak for 8 to 12 hours at room temperature, until they are plump and soft enough to crush between your fingers.',
            'Pune bobul decorticat uscat într-un castron mare și acoperă-l cu apă rece, de trei ori cât volumul lui. Lasă-l la înmuiat 8-12 ore la temperatura camerei, până când se umflă și e destul de moale cât să-l strivești între degete.',
          ),
          timerSeconds: 28800,
        },
        {
          key: 'drain',
          text: t(
            'Drain the beans well and spread them on a clean towel. Pat them dry. They go into the mix raw: do not cook them.',
            'Scurge bine bobul și întinde-l pe un prosop curat. Șterge-l ușor până se usucă. Intră crud în compoziție: nu-l fierbe.',
          ),
        },
        {
          key: 'grind',
          text: t(
            'Put the beans, leek, onion, the mix garlic, parsley, dill, coriander, cumin, ground coriander, cayenne and the mix salt in a food processor, in two batches if needed. Process, scraping down the sides, until the mix is fine and bright green, but still slightly grainy, not a smooth paste.',
            'Pune în robotul de bucătărie bobul, prazul, ceapa, usturoiul pentru compoziție, pătrunjelul, mărarul, coriandrul verde, chimionul, coriandrul măcinat, cayenne și sarea pentru compoziție, în două tranșe dacă e nevoie. Mixează, răzuind pereții, până când compoziția e fină și de un verde intens, dar încă ușor grunjoasă, nu o pastă netedă.',
          ),
        },
        {
          key: 'chill',
          text: t(
            'Cover the bowl and chill the mix for 30 minutes, so that it firms up and is easier to shape.',
            'Acoperă castronul și ține compoziția la frigider 30 de minute, ca să se întărească și să fie mai ușor de modelat.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'sauce',
          text: t(
            'While the mix chills, whisk the tahini with the lemon juice, the sauce garlic and the sauce salt. The sauce will seize up and go thick. Whisk in the cold water a spoonful at a time until it is smooth and pourable like thick cream.',
            'Cât timp se răcește compoziția, amestecă tahini cu sucul de lămâie, usturoiul pentru sos și sarea pentru sos. Sosul se va strânge și se va îngroșa. Adaugă apa rece câte o lingură, amestecând, până când sosul e fin și curge ca o smântână groasă.',
          ),
        },
        {
          key: 'shape',
          text: t(
            'Sprinkle the baking soda over the chilled mix and work it in. Spread the sesame seeds on a plate. With wet hands, press the mix into 24 discs about 6 cm wide and 1.5 cm thick, and press one side of each into the sesame seeds.',
            'Presară bicarbonatul peste compoziția răcită și amestecă-l. Întinde semințele de susan pe o farfurie. Cu mâinile ude, modelează compoziția în 24 de discuri late de aproximativ 6 cm și groase de 1,5 cm și apasă o parte din fiecare în semințele de susan.',
          ),
        },
        {
          key: 'heat-oil',
          text: t(
            'Pour the oil into a heavy, deep pot so that it is no more than a third full. Clip a frying thermometer to the side and heat over medium heat until it reads 175 °C. Stay with the pot while it heats.',
            'Toarnă uleiul într-o oală groasă și adâncă, astfel încât să o umple cel mult o treime. Fixează pe margine un termometru de prăjit și încălzește la foc mediu până când arată 175 °C. Rămâi lângă oală cât se încălzește.',
          ),
        },
        {
          key: 'fry-first',
          text: t(
            'Lower 5 or 6 discs into the oil with a slotted spoon, sesame side down and away from you; do not crowd the pot. Fry for about 4 minutes, turning once, until golden brown on both sides. Lift them onto a rack or paper towels. Cut one open: it should be bright green, hot and cooked through, not wet, pasty or raw in the middle. If it is raw or pasty in the middle, put that batch back in the oil for 1 to 2 minutes more and check again.',
            'Coboară în ulei 5-6 discuri cu o spumieră, cu partea cu susan în jos și în direcția opusă ție; nu aglomera oala. Prăjește-le aproximativ 4 minute, întorcându-le o dată, până se rumenesc auriu pe ambele părți. Scoate-le pe un grătar sau pe șervețele de hârtie. Taie unul în două: înăuntru trebuie să fie de un verde intens, fierbinte și făcut până în centru, nu umed, păstos sau crud la mijloc. Dacă e crud sau păstos la mijloc, pune tranșa înapoi în ulei încă 1-2 minute și verifică din nou.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'fry-rest',
          text: t(
            'Let the oil come back to 175 °C, then fry the remaining discs in the same way, in batches, about 4 minutes each. Cut one open from every batch to check it is cooked through. If it is raw or pasty in the middle, put that batch back in the oil for 1 to 2 minutes more and check again; then lower the heat a little and fry the next batch a minute longer.',
            'Lasă uleiul să revină la 175 °C, apoi prăjește restul discurilor la fel, în tranșe, câte aproximativ 4 minute. Taie câte unul din fiecare tranșă ca să verifici că e copt până în centru. Dacă e crud sau păstos la mijloc, pune tranșa înapoi în ulei încă 1-2 minute și verifică din nou; apoi scade puțin focul și prăjește tranșa următoare cu un minut mai mult.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'heat-off',
          text: t(
            'As soon as the last batch is out of the oil, turn the heat off. Leave the pot where it is, uncovered and out of reach of children.',
            'De îndată ce ai scos ultima tranșă din ulei, oprește focul. Lasă oala unde este, descoperită și departe de copii.',
          ),
        },
        {
          key: 'serve',
          text: t(
            "Serve the ta'ameya hot, tucked into warm pita with the tahini sauce and the tomato slices. Pickled cucumbers go well on the side.",
            "Servește ta'ameya fierbinte, pusă într-o lipie caldă, cu sosul de tahini și feliile de roșie. Castraveții murați se potrivesc alături.",
          ),
        },
        {
          key: 'cool-oil',
          text: t(
            'After the meal, leave the oil until it is completely cold, which takes several hours. Then strain it into a sealed container and throw it away with household waste, not down the sink.',
            'După masă, lasă uleiul până se răcește complet, ceea ce durează câteva ore. Apoi strecoară-l într-un recipient închis și aruncă-l la gunoiul menajer, nu pe chiuvetă.',
          ),
        },
        {
          key: 'store',
          text: t(
            "Within 2 hours of cooking, put the leftover ta'ameya and the sauce in separate lidded containers in the fridge. Eat them within 3 days. Re-crisp the discs on a tray in a 200 °C oven for 8 to 10 minutes, until hot all the way through.",
            "În cel mult 2 ore de la gătit, pune ta'ameya rămasă și sosul în recipiente separate, cu capac, la frigider. Consumă-le în 3 zile. Ca să redevină crocante, încălzește discurile pe o tavă, în cuptorul la 200 °C, 8-10 minute, până se încălzesc în tot mijlocul.",
          ),
        },
      ],
      tips: [
        t(
          "Fava beans can cause a serious reaction (favism) in people with G6PD deficiency, even when cooked. Anyone with G6PD deficiency should not eat ta'ameya; make the chickpea falafel instead.",
          "Bobul poate provoca o reacție gravă (favism) la persoanele cu deficit de G6PD, chiar și gătit. Cine are deficit de G6PD nu trebuie să mănânce ta'ameya; pregătește în schimb falafelul din năut.",
        ),
        t(
          'Use dried split fava beans that were soaked, not canned or cooked ones. They go in raw, which is what keeps the discs together in the oil.',
          'Folosește bob uscat decorticat, înmuiat, nu din conservă și nici fiert. Intră crud în compoziție, iar asta ține discurile întregi în ulei.',
        ),
      ],
      stepTips: [
        {
          step: 'grind',
          text: t(
            'Do not over-process: a fully smooth paste fries up dense and heavy. A little grain keeps the inside light.',
            'Nu mixa prea mult: o pastă complet netedă iese densă și grea la prăjit. Puțină granulație păstrează interiorul ușor.',
          ),
        },
        {
          step: 'heat-oil',
          text: t(
            'If the oil smokes, turn the heat off. If it catches fire, turn the heat off only if you can do it safely, do not move the pot and never throw water on it. Cover it with the lid or a damp towel. If it does not go out at once, get everyone out, close the door and call 112.',
            'Dacă uleiul începe să fumege, oprește focul. Dacă ia foc, oprește focul doar dacă poți face asta în siguranță, nu muta oala și nu arunca niciodată apă peste ea. Acoper-o cu capacul sau cu o cârpă umedă. Dacă flăcările nu se sting imediat, scoate pe toată lumea din casă, închide ușa și sună la 112.',
          ),
        },
      ],
      nutritionNote: t(
        'Fava beans bring plant protein and fibre, and the leek and herbs add flavour and some vitamins. Deep frying adds a lot of fat and calories, though the sunflower oil is mostly unsaturated fat; the sesame seeds and tahini add more. Serve with fresh tomato to balance the plate.',
        'Bobul aduce proteine vegetale și fibre, iar prazul și verdețurile adaugă gust și ceva vitamine. Prăjirea în ulei încins adaugă multe grăsimi și calorii, deși uleiul de floarea-soarelui are mai ales grăsimi nesaturate; susanul și tahini adaugă și mai multe. Servește cu roșii proaspete ca să echilibrezi farfuria.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Warm pita', 'Lipie caldă'),
          reason: t(
            'Soft bread to wrap the crisp discs and the sauce in one bite.',
            'Pâine moale în care învelești discurile crocante și sosul dintr-o îmbucătură.',
          ),
          principle: 'contrast_texture',
          ingredient: 'pita',
        },
        {
          kind: 'food',
          label: t('Pickled cucumbers', 'Castraveți murați'),
          reason: t(
            'Their sharp brine cuts the oil of the fried discs.',
            'Zeama lor acrișoară taie uleiul din discurile prăjite.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-cucumbers',
        },
        {
          kind: 'drink',
          label: t('Sweet black tea', 'Ceai negru îndulcit'),
          reason: t(
            'Its slight bitterness balances the richness of the fried beans.',
            'Amăreala lui ușoară echilibrează bogăția bobului prăjit.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'Hot in a pita, it makes a filling plant-based brunch.',
            'Fierbinte, într-o lipie, face un brunch vegetal săturător.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Plant protein with fresh tomato and herbs.',
            'Proteine vegetale cu roșii proaspete și verdețuri.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Deep-fried food sits heavy in the stomach during exercise.',
            'Mâncarea prăjită în ulei încins cade greu la stomac în timpul efortului.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Fried and rich, it is heavy right before bed.',
            'Fiind prăjit și bogat, cade greu chiar înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'falafel-indian',
      cuisine: 'indian',
      title: t(
        'Masala vada (South Indian chana dal fritters with curry leaves)',
        'Masala vada (chiftele indiene din chana dal, cu frunze de curry)',
      ),
      servings: 4,
      prepMinutes: 150,
      cookMinutes: 35,
      difficulty: 'medium',
      hideBaseTips: [0, 2],
      lines: [
        {
          ingredient: 'chana-dal',
          quantity: 200,
          unit: 'g',
          note: t('dried; soaked 2 to 3 hours', 'uscată; înmuiată 2-3 ore'),
        },
        {
          ingredient: 'ginger',
          quantity: 15,
          unit: 'g',
          note: t('peeled, roughly chopped', 'curățat, tăiat grosier'),
        },
        {
          ingredient: 'hot-pepper',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'green chillies, to taste; roughly chopped',
            'ardei iute verde, după gust; tăiat grosier',
          ),
        },
        { ingredient: 'fennel-seeds', quantity: 3, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely chopped', 'tocată mărunt'),
        },
        {
          ingredient: 'curry-leaves',
          quantity: 5,
          unit: 'g',
          note: t('fresh, torn', 'proaspete, rupte'),
        },
        {
          ingredient: 'coriander',
          quantity: 20,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        { ingredient: 'salt', quantity: 6, unit: 'g' },
        {
          ingredient: 'sunflower-oil',
          quantity: 1000,
          unit: 'ml',
          note: t(
            'for deep frying, in a heavy pot of at least 3 litres',
            'pentru prăjit în ulei încins, într-o oală groasă de cel puțin 3 litri',
          ),
        },
      ],
      steps: [
        {
          key: 'soak',
          text: t(
            'Rinse the chana dal and soak it in plenty of cold water for 2 to 3 hours, until the grains are plump but still firm.',
            'Spală chana dal și înmoaie-o în multă apă rece 2-3 ore, până când boabele se umflă, dar rămân ferme.',
          ),
          timerSeconds: 7200,
        },
        {
          key: 'drain',
          text: t(
            'Drain the dal very well in a sieve, shaking out the water, then pat it dry on a towel. Set 2 tablespoons (about 30 g) aside.',
            'Scurge foarte bine chana dal într-o sită, scuturând apa, apoi șterge-o pe un prosop. Pune deoparte 2 linguri (aproximativ 30 g).',
          ),
        },
        {
          key: 'grind',
          text: t(
            'Put the rest of the dal, the ginger, chillies and fennel seeds in a food processor. Pulse without adding water until the mix is coarse and crumbly, with visible grains. It should not become a smooth paste.',
            'Pune restul de chana dal, ghimbirul, ardeiul iute și semințele de fenicul în robotul de bucătărie. Mixează în reprize scurte, fără să adaugi apă, până când compoziția e grunjoasă și friabilă, cu boabe vizibile. Nu trebuie să devină o pastă netedă.',
          ),
        },
        {
          key: 'mix',
          text: t(
            'Tip the mix into a bowl. Add the whole dal you set aside, the onion, curry leaves and coriander, and mix. Add the salt last, just before shaping, because salt draws water out of the onion and makes the mix wet.',
            'Pune compoziția într-un castron. Adaugă chana dal întreagă pusă deoparte, ceapa, frunzele de curry și coriandrul și amestecă. Adaugă sarea la sfârșit, chiar înainte de modelare, fiindcă sarea scoate apă din ceapă și compoziția devine prea umedă.',
          ),
        },
        {
          key: 'shape',
          text: t(
            'With wet hands, shape the mix into 16 discs about 5 cm wide and 1.5 cm thick, pressing firmly. Put them on a plate.',
            'Cu mâinile ude, modelează compoziția în 16 discuri late de aproximativ 5 cm și groase de 1,5 cm, apăsând ferm. Pune-le pe o farfurie.',
          ),
        },
        {
          key: 'heat-oil',
          text: t(
            'Pour the oil into a heavy, deep pot so that it is no more than a third full. Clip a frying thermometer to the side and heat over medium heat until it reads 170 °C. Stay with the pot while it heats.',
            'Toarnă uleiul într-o oală groasă și adâncă, astfel încât să o umple cel mult o treime. Fixează pe margine un termometru de prăjit și încălzește la foc mediu până când arată 170 °C. Rămâi lângă oală cât se încălzește.',
          ),
        },
        {
          key: 'fry-first',
          text: t(
            'Lower 5 or 6 discs into the oil with a slotted spoon, away from you; do not crowd the pot. Fry for about 5 minutes, turning once or twice, until deep golden and crisp. Lift them onto a rack or paper towels. Cut one open: it should be hot and cooked through, with no raw, pale or pasty middle. If it is raw or pasty in the middle, put that batch back in the oil for 1 to 2 minutes more and check again.',
            'Coboară în ulei 5-6 discuri cu o spumieră, în direcția opusă ție; nu aglomera oala. Prăjește-le aproximativ 5 minute, întorcându-le o dată sau de două ori, până se rumenesc auriu intens și devin crocante. Scoate-le pe un grătar sau pe șervețele de hârtie. Taie unul în două: trebuie să fie fierbinte și făcut până în centru, fără mijloc crud, palid sau păstos. Dacă e crud sau păstos la mijloc, pune tranșa înapoi în ulei încă 1-2 minute și verifică din nou.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'fry-rest',
          text: t(
            'Let the oil come back to 170 °C, then fry the remaining discs in the same way, in batches, about 5 minutes each. Cut one open from every batch to check it is cooked through. If it is raw or pasty in the middle, put that batch back in the oil for 1 to 2 minutes more and check again; then lower the heat a little and fry the next batch a minute longer.',
            'Lasă uleiul să revină la 170 °C, apoi prăjește restul discurilor la fel, în tranșe, câte aproximativ 5 minute. Taie câte unul din fiecare tranșă ca să verifici că e copt până în centru. Dacă e crud sau păstos la mijloc, pune tranșa înapoi în ulei încă 1-2 minute și verifică din nou; apoi scade puțin focul și prăjește tranșa următoare cu un minut mai mult.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'heat-off',
          text: t(
            'As soon as the last batch is out of the oil, turn the heat off. Leave the pot where it is, uncovered and out of reach of children.',
            'De îndată ce ai scos ultima tranșă din ulei, oprește focul. Lasă oala unde este, descoperită și departe de copii.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Serve the vada hot, with coconut chutney or ketchup and a cup of hot tea.',
            'Servește vada fierbinte, cu chutney de cocos sau ketchup și o ceașcă de ceai fierbinte.',
          ),
        },
        {
          key: 'cool-oil',
          text: t(
            'After the meal, leave the oil until it is completely cold, which takes several hours. Then strain it into a sealed container and throw it away with household waste, not down the sink.',
            'După masă, lasă uleiul până se răcește complet, ceea ce durează câteva ore. Apoi strecoară-l într-un recipient închis și aruncă-l la gunoiul menajer, nu pe chiuvetă.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Vada are best the same day. Within 2 hours of cooking, put leftovers in a lidded container in the fridge and eat them within 2 days. Re-crisp on a tray in a 200 °C oven for 8 to 10 minutes, until hot all the way through.',
            'Vada sunt cele mai bune în aceeași zi. În cel mult 2 ore de la gătit, pune ce a rămas într-un recipient cu capac, la frigider, și consumă în 2 zile. Ca să redevină crocante, încălzește-le pe o tavă, în cuptorul la 200 °C, 8-10 minute, până se încălzesc în tot mijlocul.',
          ),
        },
      ],
      tips: [
        t(
          'Soak the dal no longer than 3 hours: over-soaked dal grinds wet, and the vada turn soft rather than crisp.',
          'Nu lăsa chana dal la înmuiat mai mult de 3 ore: dacă se înmoaie prea mult, se macină umedă, iar vada ies moi, nu crocante.',
        ),
      ],
      stepTips: [
        {
          step: 'grind',
          text: t(
            'Leave some grains whole and pulse in short bursts: the bits that stay whole are what make the vada crunchy.',
            'Lasă câteva boabe întregi și mixează în reprize scurte: bucățile rămase întregi fac vada crocante.',
          ),
        },
        {
          step: 'heat-oil',
          text: t(
            'If the oil smokes, turn the heat off. If it catches fire, turn the heat off only if you can do it safely, do not move the pot and never throw water on it. Cover it with the lid or a damp towel. If it does not go out at once, get everyone out, close the door and call 112.',
            'Dacă uleiul începe să fumege, oprește focul. Dacă ia foc, oprește focul doar dacă poți face asta în siguranță, nu muta oala și nu arunca niciodată apă peste ea. Acoper-o cu capacul sau cu o cârpă umedă. Dacă flăcările nu se sting imediat, scoate pe toată lumea din casă, închide ușa și sună la 112.',
          ),
        },
      ],
      nutritionNote: t(
        'Chana dal brings plant protein and fibre, and the ginger, chilli and curry leaves add flavour without much else. Deep frying adds a lot of fat and calories, though the sunflower oil is mostly unsaturated fat. Serve with a fresh chutney or vegetables to balance the plate.',
        'Chana dal aduce proteine vegetale și fibre, iar ghimbirul, ardeiul iute și frunzele de curry dau gust fără să adauge prea multe altele. Prăjirea în ulei încins adaugă multe grăsimi și calorii, deși uleiul de floarea-soarelui are mai ales grăsimi nesaturate. Servește cu un chutney proaspăt sau cu legume ca să echilibrezi farfuria.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Coconut chutney', 'Chutney de cocos'),
          reason: t(
            'The mild sweetness of coconut suits the fennel and curry leaf in the fritters.',
            'Dulceața blândă a cocosului se potrivește cu feniculul și frunzele de curry din chiftele.',
          ),
          principle: 'complement_flavour',
          ingredient: 'desiccated-coconut',
        },
        {
          kind: 'drink',
          label: t('Hot tea with milk', 'Ceai fierbinte cu lapte'),
          reason: t(
            'Hot tea refreshes the palate between fried, spicy bites.',
            'Ceaiul fierbinte împrospătează gustul între îmbucăturile prăjite și condimentate.',
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
            'Hot, crisp fritters with a cup of tea warm you up.',
            'Chiftelele fierbinți și crocante, cu o ceașcă de ceai, te încălzesc.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Deep-fried food sits heavy in the stomach during exercise.',
            'Mâncarea prăjită în ulei încins cade greu la stomac în timpul efortului.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Fried and spicy, it is heavy right before bed.',
            'Fiind prăjit și condimentat, cade greu chiar înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
