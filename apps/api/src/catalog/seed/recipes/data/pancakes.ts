import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Pancakes base is the American-style stack. Each Variant is a full Recipe
// with its own lines, steps and guidance. Only the first Tip (the test
// pancake) holds for every Variant; the others are specific to a thick,
// baking-powder batter, so each Variant hides them.
export const pancakes: BaseRecipeSeed = {
  slug: 'pancakes',
  title: t('Pancakes', 'Pancakes (clătite americane)'),
  servings: 4,
  prepMinutes: 15,
  cookMinutes: 16,
  difficulty: 'easy',
  lines: [
    { ingredient: 'flour', quantity: 250, unit: 'g' },
    { ingredient: 'baking-powder', quantity: 12, unit: 'g' },
    { ingredient: 'sugar', quantity: 30, unit: 'g' },
    { ingredient: 'salt', quantity: 2, unit: 'g' },
    { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
    { ingredient: 'milk', quantity: 0.35, unit: 'l' },
    {
      ingredient: 'butter',
      key: 'butter-batter',
      quantity: 40,
      unit: 'g',
      note: t('melted, for the batter', 'topit, pentru aluat'),
    },
    {
      ingredient: 'butter',
      key: 'butter-pan',
      quantity: 15,
      unit: 'g',
      note: t('for the pan', 'pentru tigaie'),
    },
    {
      ingredient: 'vanilla-extract',
      quantity: 5,
      unit: 'ml',
      optional: true,
    },
    { ingredient: 'maple-syrup', quantity: 120, unit: 'ml' },
    {
      ingredient: 'blueberry',
      quantity: 150,
      unit: 'g',
      optional: true,
      note: t('to serve', 'pentru servire'),
    },
  ],
  steps: [
    {
      key: 'melt',
      text: t(
        'Melt the 40 g of butter for the batter and let it cool for a few minutes, so that it is warm but will not cook the eggs.',
        'Topește cele 40 g de unt pentru aluat și lasă-l câteva minute să se răcorească, să fie cald, dar să nu gătească ouăle.',
      ),
    },
    {
      key: 'dry',
      text: t(
        'In a large bowl, whisk the flour, baking powder, sugar and salt together.',
        'Într-un castron mare, amestecă făina, praful de copt, zahărul și sarea.',
      ),
    },
    {
      key: 'wet',
      text: t(
        'In a jug, whisk the milk, eggs, vanilla and the melted butter until smooth.',
        'Într-un vas, amestecă laptele, ouăle, vanilia și untul topit până se omogenizează.',
      ),
    },
    {
      key: 'combine',
      text: t(
        'Pour the wet mixture into the dry and stir with a spatula for about 10 seconds, just until no dry flour is left. The batter should be thick and lumpy.',
        'Toarnă amestecul lichid peste cel uscat și mestecă cu o spatulă aproximativ 10 secunde, doar până nu mai rămâne făină uscată. Aluatul trebuie să fie gros și cu cocoloașe.',
      ),
    },
    {
      key: 'rest',
      text: t(
        'Leave the batter to rest for 5 minutes. It will thicken and start to bubble a little.',
        'Lasă aluatul să stea 5 minute. Se îngroașă și începe să facă mici bășici.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'heat',
      text: t(
        'Heat a large non-stick pan or griddle over medium heat. Rub it with a little of the pan butter. A drop of water should dance and evaporate within a couple of seconds.',
        'Încinge o tigaie mare antiaderentă la foc mediu. Unge-o cu puțin din untul pentru tigaie. O picătură de apă trebuie să sară și să se evapore în câteva secunde.',
      ),
    },
    {
      key: 'first-side',
      text: t(
        'Pour in the batter in rounds of about 80 ml (a scant third of a cup), leaving space between them. Cook until bubbles rise and pop on the surface and the edges look matte, about 2 minutes.',
        'Toarnă aluatul în cercuri de aproximativ 80 ml (puțin sub o treime de cană), lăsând loc între ele. Gătește până apar bășici care se sparg la suprafață și marginile devin mate, aproximativ 2 minute.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'flip',
      text: t(
        'Flip each pancake once and cook until the underside is golden and the centre springs back when pressed lightly, about 90 seconds.',
        'Întoarce fiecare clătită o singură dată și gătește până se rumenește pe dedesubt și centrul revine când îl apeși ușor, aproximativ 90 de secunde.',
      ),
      timerSeconds: 90,
    },
    {
      key: 'repeat',
      text: t(
        'Move the pancakes to a plate and repeat with the remaining batter, rubbing the pan with a little butter between batches, to make about 12 pancakes in 4 batches.',
        'Pune clătitele pe o farfurie și repetă cu restul de aluat, ungând tigaia cu puțin unt între porții, ca să iasă circa 12 clătite în 4 porții.',
      ),
    },
    {
      key: 'serve',
      text: t(
        'Stack three pancakes per plate, scatter over the blueberries and pour the maple syrup over. Serve while warm.',
        'Așază câte trei clătite pe farfurie, presară afinele și toarnă siropul de arțar. Servește calde.',
      ),
    },
  ],
  tips: [
    t(
      'Treat the first pancake as a test: if it browns too fast or stays pale, adjust the heat before you cook the rest.',
      'Consideră prima clătită una de probă: dacă se rumenește prea repede sau rămâne palidă, reglează focul înainte să le faci pe celelalte.',
    ),
    t(
      'Do not whisk out the lumps. Overmixing develops the gluten and gives tough, flat pancakes; the lumps cook out.',
      'Nu bate aluatul până dispar cocoloașele. Dacă îl amesteci prea mult, glutenul se dezvoltă și clătitele ies tari și plate; cocoloașele dispar la gătit.',
    ),
    t(
      'To serve everyone together, keep finished pancakes in a single layer on a rack in a 90 °C oven. Stacked and covered, they steam and go soggy.',
      'Ca să servești pe toată lumea deodată, ține clătitele gata într-un singur strat pe un grătar, în cuptor la 90 °C. Puse una peste alta și acoperite, se aburesc și se înmoaie.',
    ),
  ],
  stepTips: [
    {
      step: 'first-side',
      text: t(
        'Do not press the pancakes with the spatula. It squeezes out the air the baking powder has made.',
        'Nu apăsa clătitele cu spatula. Scoți aerul pe care l-a format praful de copt.',
      ),
    },
    {
      step: 'rest',
      text: t(
        'Baking powder starts to work as soon as it is wet, so cook soon after the rest for the best rise; the batter will hold for up to an hour.',
        'Praful de copt începe să lucreze de îndată ce se udă, așa că gătește la scurt timp după repaus pentru cea mai bună creștere; aluatul se ține bine până la o oră.',
      ),
    },
  ],
  nutritionNote: t(
    'Quick carbohydrates for energy, with some protein from the eggs and milk. They are low in fibre, the butter adds saturated fat, and the syrup supplies most of the sugar, so pour less of it, use fruit for sweetness and add yoghurt or eggs to make the plate more filling.',
    'Carbohidrați rapizi pentru energie, cu ceva proteine din ouă și lapte. Au puține fibre, untul aduce grăsimi saturate, iar siropul dă cea mai mare parte din zahăr; toarnă mai puțin sirop, îndulcește cu fructe și adaugă iaurt sau ouă ca farfuria să sature mai mult.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Maple syrup', 'Sirop de arțar'),
      reason: t(
        'Its deep caramel sweetness soaks into the soft crumb; the classic topping.',
        'Dulceața lui adâncă, de caramel, pătrunde în miezul moale; toppingul clasic.',
      ),
      principle: 'complement_flavour',
      ingredient: 'maple-syrup',
    },
    {
      kind: 'food',
      label: t('Blueberries', 'Afine'),
      reason: t(
        'Their tartness cuts through the butter and syrup.',
        'Aciditatea lor taie din bogăția untului și a siropului.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'blueberry',
    },
    {
      kind: 'food',
      label: t('Crisp bacon', 'Bacon crocant'),
      reason: t(
        'Salty, smoky bacon against sweet syrup is a well-loved American breakfast pairing.',
        'Fâșiile sărate și afumate alături de siropul dulce sunt o combinație iubită la micul dejun american.',
      ),
      principle: 'salt_balances_sweet',
      ingredient: 'bacon',
    },
    {
      kind: 'food',
      label: t('Greek yogurt', 'Iaurt grecesc'),
      reason: t(
        'A cool, tangy spoonful adds protein and lifts the sweetness.',
        'O lingură rece și acrișoară adaugă proteine și ușurează dulceața.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'greek-yogurt',
    },
    {
      kind: 'drink',
      label: t('Coffee', 'Cafea'),
      reason: t(
        'Its bitterness balances the sweet, buttery stack.',
        'Amăreala ei echilibrează teancul dulce și untos.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'coffee',
    },
    {
      kind: 'drink',
      label: t('Cold milk', 'Lapte rece'),
      reason: t(
        'A familiar companion that cools the palate between sweet bites.',
        'Un însoțitor obișnuit, care răcorește gustul între îmbucăturile dulci.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'milk',
    },
  ],
  eatingMoments: [
    {
      moment: 'morning',
      polarity: 'good_for',
      reason: t(
        'Carbohydrates give a quick start to the day; add eggs or yoghurt so it lasts.',
        'Carbohidrații dau un start rapid zilei; adaugă ouă sau iaurt ca să țină mai mult.',
      ),
    },
    {
      moment: 'brunch',
      polarity: 'good_for',
      reason: t(
        'Easy to make for a crowd and to dress up with fruit and bacon.',
        'Se fac ușor pentru mai mulți și se completează cu fructe și bacon.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'The carbohydrates refill energy stores; serve with yoghurt for protein.',
        'Carbohidrații refac rezervele de energie; servește cu iaurt pentru proteine.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A stack with syrup is sweet and heavy shortly before sleep.',
        'Un teanc cu sirop e dulce și greu înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'pancakes-romanian',
      cuisine: 'romanian',
      title: t('Clătite with sweet cheese filling', 'Clătite cu brânză dulce'),
      servings: 4,
      prepMinutes: 50,
      cookMinutes: 36,
      difficulty: 'medium',
      hideBaseTips: [1, 2],
      lines: [
        { ingredient: 'flour', quantity: 200, unit: 'g' },
        { ingredient: 'sugar', key: 'sugar-batter', quantity: 15, unit: 'g' },
        { ingredient: 'salt', quantity: 1, unit: 'g' },
        {
          ingredient: 'eggs',
          key: 'eggs-batter',
          quantity: 2,
          unit: 'pcs',
          note: t('for the batter', 'pentru aluat'),
        },
        { ingredient: 'milk', quantity: 0.5, unit: 'l' },
        { ingredient: 'sparkling-water', quantity: 0.15, unit: 'l' },
        {
          ingredient: 'sunflower-oil',
          key: 'oil-batter',
          quantity: 30,
          unit: 'ml',
          note: t('in the batter', 'în aluat'),
        },
        {
          ingredient: 'sunflower-oil',
          key: 'oil-pan',
          quantity: 15,
          unit: 'ml',
          note: t('for the pan', 'pentru tigaie'),
        },
        {
          ingredient: 'cottage-cheese',
          quantity: 500,
          unit: 'g',
          note: t('well drained', 'bine scursă'),
        },
        {
          ingredient: 'eggs',
          key: 'eggs-filling',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'yolks only, for the filling; keep the whites for an omelette',
            'doar gălbenușurile, pentru umplutură; albușurile păstrează-le pentru o omletă',
          ),
        },
        { ingredient: 'sugar', key: 'sugar-filling', quantity: 50, unit: 'g' },
        { ingredient: 'vanilla-sugar', quantity: 8, unit: 'g' },
        { ingredient: 'raisins', quantity: 60, unit: 'g' },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t('zest only', 'doar coaja rasă'),
        },
        {
          ingredient: 'sour-cream',
          quantity: 100,
          unit: 'g',
          optional: true,
          note: t('to spoon over', 'pentru deasupra'),
        },
      ],
      steps: [
        {
          key: 'batter',
          text: t(
            'Whisk the flour, the 15 g of sugar and the salt in a bowl. Add the 2 eggs and half of the milk and whisk to a smooth paste with no lumps, then whisk in the rest of the milk and the 30 ml of oil.',
            'Amestecă făina, cele 15 g de zahăr și sarea într-un castron. Adaugă cele 2 ouă și jumătate din lapte și bate până obții o pastă fără cocoloașe, apoi încorporează restul de lapte și cei 30 ml de ulei.',
          ),
        },
        {
          key: 'rest',
          text: t(
            'Cover the batter and rest it for 30 minutes. Then stir in the sparkling water gently. The batter should be as thin as single cream.',
            'Acoperă aluatul și lasă-l să stea 30 de minute. Apoi adaugă apa minerală, amestecând ușor. Aluatul trebuie să fie subțire ca o smântână lichidă.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'fry',
          text: t(
            'Heat a 22 to 24 cm non-stick pan over medium heat and wipe it with a little of the pan oil on a paper towel. Pour in about a ladle (60 ml) of batter and swirl the pan so it coats the base thinly. Cook until the edges lift and turn light gold, about 45 seconds.',
            'Încinge la foc mediu o tigaie antiaderentă de 22-24 cm și șterge-o cu puțin din uleiul pentru tigaie, pe un șervet de hârtie. Toarnă un polonic (60 ml) de aluat și rotește tigaia ca să acopere fundul într-un strat subțire. Gătește până se desprind marginile și se rumenesc ușor, aproximativ 45 de secunde.',
          ),
          timerSeconds: 45,
        },
        {
          key: 'flip',
          text: t(
            'Flip and cook the other side for about 20 seconds. Slide the clătită onto a plate and repeat, oiling the pan only when they start to stick, to make about 12.',
            'Întoarce și gătește cealaltă parte aproximativ 20 de secunde. Pune clătita pe o farfurie și repetă, ungând tigaia doar când încep să se lipească, până ai circa 12.',
          ),
          timerSeconds: 20,
        },
        {
          key: 'cool',
          text: t(
            'Let the clătite cool on the plate until warm to the touch, about 10 minutes. Warm clătite fold without tearing and do not steam into a soggy pile.',
            'Lasă clătitele să se răcorească pe farfurie până sunt călduțe, aproximativ 10 minute. Clătitele călduțe se îndoaie fără să se rupă și nu se aburesc într-o grămadă moale.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'filling',
          text: t(
            'Mash the drained cottage cheese with a fork. Mix in the egg yolks, the 50 g of sugar, the vanilla sugar, the raisins and the lemon zest.',
            'Pisează cu furculița brânza de vaci scursă. Amestecă gălbenușurile, cele 50 g de zahăr, zahărul vanilat, stafidele și coaja de lămâie.',
          ),
        },
        {
          key: 'fill',
          text: t(
            'Spoon about 3 tablespoons (50 g) of filling onto the centre of each clătită, fold in the sides and roll up into a parcel. Place them seam side down, side by side, in a baking dish oiled with the leftover pan oil.',
            'Pune circa 3 linguri (50 g) de umplutură în centrul fiecărei clătite, îndoaie marginile și rulează ca un pachet. Așază-le cu închiderea în jos, una lângă alta, într-o tavă unsă cu uleiul rămas de la tigaie.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Heat the oven to 180 °C. Bake for 18 minutes, until the filling is set and no longer wet when you press a clătită and the tops are lightly coloured. The filling has raw yolk, so do not skip this step.',
            'Încălzește cuptorul la 180 °C. Coace 18 minute, până se întărește umplutura, nu mai e udă când apeși o clătită și deasupra se colorează ușor. Umplutura are gălbenuș crud, așa că nu sări peste acest pas.',
          ),
          timerSeconds: 1080,
        },
        {
          key: 'serve',
          text: t(
            'Serve warm, with a spoon of sour cream if you like. Cool any leftovers within an hour, cover and refrigerate for up to 2 days. Reheat in a 160 °C oven for about 10 minutes until hot throughout.',
            'Servește calde, cu o lingură de smântână, dacă vrei. Răcește resturile în cel mult o oră, acoperă-le și păstrează-le la frigider până la 2 zile. Reîncălzește-le în cuptor la 160 °C circa 10 minute, până se încălzesc complet.',
          ),
        },
      ],
      tips: [
        t(
          'The sparkling water makes the clătite thin and lacy. If you have none, use still water; they will be slightly less delicate.',
          'Apa minerală face clătitele subțiri și fine. Dacă nu ai, folosește apă plată; vor fi puțin mai puțin delicate.',
        ),
      ],
      stepTips: [
        {
          step: 'filling',
          text: t(
            'If the cheese is wet, hang it in a clean cloth for 30 minutes first; watery cheese makes a runny filling that leaks from the parcels.',
            'Dacă brânza e udă, ține-o 30 de minute într-un tifon curat; o brânză cu zer face o umplutură lichidă care iese din pachete.',
          ),
        },
      ],
      nutritionNote: t(
        'The cottage cheese adds protein and calcium, and the thin clătite are lighter than a thick stack. The sugar, raisins and sour cream make it sweet and fairly rich, and there is little fibre, so keep to two or three and serve with fresh fruit.',
        'Brânza de vaci aduce proteine și calciu, iar clătitele subțiri sunt mai ușoare decât un teanc gros. Zahărul, stafidele și smântâna o fac dulce și destul de bogată, iar fibrele sunt puține; oprește-te la două-trei și servește cu fructe proaspete.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Sour cream', 'Smântână'),
          reason: t(
            'A cool, tangy spoonful balances the sweet filling.',
            'O lingură rece și acrișoară echilibrează umplutura dulce.',
          ),
          principle: 'complement_flavour',
          ingredient: 'sour-cream',
        },
        {
          kind: 'food',
          label: t('Jam', 'Dulceață'),
          reason: t(
            'A spoon of sour cherry or apricot jam is a common finish at a Romanian table.',
            'O lingură de dulceață de vișine sau de caise e un final obișnuit pe masa românească.',
          ),
          principle: 'regional_tradition',
          ingredient: 'jam',
        },
        {
          kind: 'food',
          label: t('Strawberries', 'Căpșuni'),
          reason: t(
            'Fresh strawberries bring acidity and freshness to the sweet cheese.',
            'Căpșunile proaspete aduc aciditate și prospețime brânzei dulci.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'strawberry',
        },
        {
          kind: 'drink',
          label: t('Hot tea', 'Ceai cald'),
          reason: t(
            'Unsweetened tea refreshes the palate between rich bites.',
            'Ceaiul neîndulcit împrospătează gustul între îmbucături bogate.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'Filled and baked ahead, they are easy to serve to a table.',
            'Umplute și coapte dinainte, se servesc ușor la masă.',
          ),
        },
        {
          moment: 'morning',
          polarity: 'good_for',
          reason: t(
            'The cheese gives protein that keeps you going until lunch.',
            'Brânza dă proteine care te țin până la prânz.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Sweet, rich and filling shortly before sleep.',
            'Dulci, bogate și săturătoare înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'pancakes-scandinavian',
      cuisine: 'scandinavian',
      title: t(
        'Æbleskiver (Danish pancake puffs)',
        'Æbleskiver (biluțe daneze din aluat de clătite)',
      ),
      servings: 4,
      prepMinutes: 25,
      cookMinutes: 24,
      difficulty: 'medium',
      hideBaseTips: [2],
      lines: [
        { ingredient: 'flour', quantity: 250, unit: 'g' },
        { ingredient: 'sugar', quantity: 25, unit: 'g' },
        { ingredient: 'baking-powder', quantity: 6, unit: 'g' },
        { ingredient: 'cardamom', quantity: 2, unit: 'g' },
        { ingredient: 'salt', quantity: 2, unit: 'g' },
        { ingredient: 'buttermilk', quantity: 0.5, unit: 'l' },
        {
          ingredient: 'eggs',
          quantity: 2,
          unit: 'pcs',
          note: t('separated', 'separate'),
        },
        {
          ingredient: 'butter',
          key: 'butter-batter',
          quantity: 40,
          unit: 'g',
          note: t('melted, for the batter', 'topit, pentru aluat'),
        },
        {
          ingredient: 'butter',
          key: 'butter-pan',
          quantity: 40,
          unit: 'g',
          note: t('melted, for the pan', 'topit, pentru tigaie'),
        },
        { ingredient: 'icing-sugar', quantity: 30, unit: 'g' },
        { ingredient: 'jam', quantity: 150, unit: 'g' },
      ],
      steps: [
        {
          key: 'dry',
          text: t(
            'Whisk the flour, sugar, baking powder, cardamom and salt in a large bowl.',
            'Amestecă făina, zahărul, praful de copt, cardamomul și sarea într-un castron mare.',
          ),
        },
        {
          key: 'yolks',
          text: t(
            'Whisk the buttermilk, the egg yolks and the 40 g of cooled melted butter, then stir this into the dry mixture just until combined.',
            'Amestecă zara, gălbenușurile și cele 40 g de unt topit și răcit, apoi adaugă totul peste ingredientele uscate, amestecând doar până se combină.',
          ),
        },
        {
          key: 'whites',
          text: t(
            'In a clean, dry bowl whisk the egg whites to stiff peaks, so that the whisk leaves ridges and the whites stay upright when you lift it. Fold them into the batter in two additions, keeping as much air in as you can.',
            'Într-un castron curat și uscat, bate albușurile spumă tare, până când mixerul lasă urme și albușurile stau drepte când îl ridici. Încorporează-le în aluat în două reprize, păstrând cât mai mult aer.',
          ),
        },
        {
          key: 'heat',
          text: t(
            'Heat an æbleskive pan (7 holes) over medium heat for 2 to 3 minutes. Brush each hole with melted butter from the 40 g set aside for the pan and fill it about three-quarters full, about 30 ml of batter.',
            'Încinge la foc mediu o tigaie pentru æbleskiver (cu 7 adâncituri) 2-3 minute. Unge fiecare adâncitură cu unt topit din cele 40 g puse deoparte pentru tigaie și umple-o cam trei sferturi, cu circa 30 ml de aluat.',
          ),
        },
        {
          key: 'first-side',
          text: t(
            'Cook for about 2 minutes, until the edge of the batter has set and bubbles show on top.',
            'Gătește aproximativ 2 minute, până aluatul se întărește la margine și apar bășici deasupra.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'turn',
          text: t(
            'Using a wooden skewer, turn each puff a quarter turn so the uncooked batter runs into the hole. Keep turning every 30 seconds or so until it has formed a golden ball, about 3 minutes in all. Lift one out and push in a skewer: it should come out clean.',
            'Cu un bețișor de lemn (de frigărui), întoarce fiecare biluță cu un sfert de rotație, ca aluatul necopt să curgă în adâncitură. Continuă să întorci la fiecare 30 de secunde, până se formează o bilă aurie, în aproximativ 3 minute. Scoate una și înfige un bețișor: trebuie să iasă curată.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'repeat',
          text: t(
            'Move the puffs to a plate lined with kitchen paper and keep them warm in a 90 °C oven. Brush the holes again and repeat with the rest, for about 28 puffs in 4 batches.',
            'Pune biluțele pe o farfurie tapetată cu hârtie de bucătărie și ține-le calde în cuptor la 90 °C. Unge din nou adânciturile și repetă cu restul, pentru circa 28 de biluțe în 4 porții.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Dust with the icing sugar and serve warm, with the jam for dipping. Cool any leftovers completely, cover and keep for a day, then warm in a 160 °C oven for 5 minutes.',
            'Presară zahărul pudră și servește calde, cu dulceața pentru înmuiat. Lasă resturile să se răcească complet, acoperă-le și păstrează-le o zi, apoi încălzește-le în cuptor la 160 °C circa 5 minute.',
          ),
        },
      ],
      tips: [
        t(
          'If the puffs brown on the outside but stay wet inside, the pan is too hot. Lower the heat and give them longer between turns.',
          'Dacă biluțele se rumenesc pe afară, dar rămân umede înăuntru, tigaia e prea fierbinte. Micșorează focul și lasă-le mai mult între întoarceri.',
        ),
      ],
      stepTips: [
        {
          step: 'whites',
          text: t(
            'Fold the whites with a spatula and stop as soon as no big streaks remain. Stirring knocks out the air that makes the puffs light.',
            'Încorporează albușurile cu o spatulă și oprește-te când nu mai sunt dungi mari. Dacă amesteci, scoți aerul care face biluțele ușoare.',
          ),
        },
      ],
      nutritionNote: t(
        'Light and airy for a fried treat, with some protein from the eggs and buttermilk, but made with white flour, butter and then sugar and jam, so they are sweet and low in fibre. They suit an occasional celebration, a few at a time.',
        'Ușoare și aerate pentru un desert prăjit, cu ceva proteine din ouă și zară, dar sunt făcute cu făină albă, unt, apoi zahăr și dulceață, deci sunt dulci și sărace în fibre. Se potrivesc la ocazii, câteva odată.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Jam', 'Dulceață'),
          reason: t(
            'Dipping each puff into tart jam is the usual way to eat them.',
            'Înmuiatul fiecărei biluțe în dulceață acrișoară e felul obișnuit de a le mânca.',
          ),
          principle: 'regional_tradition',
          ingredient: 'jam',
        },
        {
          kind: 'food',
          label: t('Icing sugar', 'Zahăr pudră'),
          reason: t(
            'A light dusting adds a delicate sweetness without making them heavy.',
            'Un strat subțire adaugă o dulceață fină, fără să le îngreuneze.',
          ),
          principle: 'complement_flavour',
          ingredient: 'icing-sugar',
        },
        {
          kind: 'drink',
          label: t('Cold milk', 'Lapte rece'),
          reason: t(
            'A cold glass cools the palate between warm, sweet puffs.',
            'Un pahar rece răcorește gustul între biluțele calde și dulci.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'milk',
        },
        {
          kind: 'drink',
          label: t('Mulled wine (gløgg)', 'Vin fiert (gløgg)'),
          reason: t(
            'Served with warm spiced wine at Christmas time in Denmark.',
            'De Crăciun, în Danemarca se servesc cu vin fiert cu condimente.',
          ),
          principle: 'regional_tradition',
        },
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'Bitterness balances the sweet dough and jam.',
            'Amăreala echilibrează aluatul dulce și dulceața.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'coffee',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Warm and sweet, they suit a cold winter afternoon.',
            'Calde și dulci, se potrivesc într-o după-amiază rece de iarnă.',
          ),
        },
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'A shareable treat to dip and pass around the table.',
            'O bunătate de împărțit și de înmuiat, pusă la mijlocul mesei.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Fried, sweet and heavy shortly before bed.',
            'Prăjite, dulci și grele înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'pancakes-japanese',
      cuisine: 'japanese',
      title: t('Japanese soufflé pancakes', 'Clătite pufoase japoneze'),
      servings: 2,
      prepMinutes: 20,
      cookMinutes: 12,
      difficulty: 'hard',
      hideBaseTips: [1, 2],
      lines: [
        {
          ingredient: 'eggs',
          quantity: 4,
          unit: 'pcs',
          note: t('separated', 'separate'),
        },
        { ingredient: 'milk', quantity: 0.04, unit: 'l' },
        { ingredient: 'flour', quantity: 60, unit: 'g' },
        { ingredient: 'baking-powder', quantity: 2, unit: 'g' },
        { ingredient: 'vanilla-extract', quantity: 3, unit: 'ml' },
        { ingredient: 'sugar', quantity: 40, unit: 'g' },
        { ingredient: 'lemon-juice', quantity: 5, unit: 'ml' },
        { ingredient: 'butter', quantity: 15, unit: 'g' },
        { ingredient: 'still-water', quantity: 0.06, unit: 'l' },
        {
          ingredient: 'whipping-cream',
          quantity: 100,
          unit: 'ml',
          note: t('whipped, to serve', 'frișcă, pentru servire'),
        },
        { ingredient: 'maple-syrup', quantity: 40, unit: 'ml' },
      ],
      steps: [
        {
          key: 'yolks',
          text: t(
            'Whisk the egg yolks, milk and vanilla in a bowl until smooth. Sift in the flour and baking powder and whisk until no lumps remain.',
            'Bate gălbenușurile, laptele și vanilia într-un castron până se omogenizează. Cerne peste ele făina și praful de copt și bate până dispar cocoloașele.',
          ),
        },
        {
          key: 'meringue',
          text: t(
            'In a very clean, dry bowl whisk the egg whites with the lemon juice until foamy. Add the sugar in three additions, whisking until stiff, glossy peaks form and you can turn the bowl upside down without anything moving.',
            'Într-un castron foarte curat și uscat, bate albușurile cu sucul de lămâie până fac spumă. Adaugă zahărul în trei reprize, bătând până se formează vârfuri ferme și lucioase și poți răsturna castronul fără să se miște nimic.',
          ),
        },
        {
          key: 'fold',
          text: t(
            'Stir a third of the meringue into the yolk mixture to loosen it, then gently fold in the rest in two additions with a spatula, cutting down through the middle and lifting from the bottom. Stop when no white streaks remain; the batter should stay thick and airy.',
            'Amestecă o treime din bezea în compoziția de gălbenușuri ca să o destinzi, apoi încorporează delicat restul în două reprize, cu o spatulă, tăind prin mijloc și ridicând de jos. Oprește-te când nu mai sunt dungi albe; aluatul trebuie să rămână gros și aerat.',
          ),
        },
        {
          key: 'heat',
          text: t(
            'Warm two 24 cm non-stick pans with lids over the lowest heat for 1 minute and wipe them with the butter. Spoon three mounds of batter into each pan, each about 7 cm wide and 4 cm tall, using a spoon to stack the batter up rather than letting it spread.',
            'Încălzește 1 minut, la cel mai mic foc, două tigăi antiaderente de 24 cm, cu capace, și șterge-le cu untul. Pune cu lingura trei movilițe de aluat în fiecare tigaie, fiecare de circa 7 cm lățime și 4 cm înălțime, ridicând aluatul cu lingura, nu lăsându-l să se întindă.',
          ),
        },
        {
          key: 'steam',
          text: t(
            'Add 15 ml of water to each pan at the sides, cover at once and cook on the lowest heat for 6 minutes, until the undersides are golden and the tops have set a little.',
            'Adaugă 15 ml de apă în fiecare tigaie, pe margini, acoperă imediat și gătește la cel mai mic foc 6 minute, până se aurește fundul și se întărește puțin partea de sus.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'flip',
          text: t(
            'Add 15 ml more water to each pan, slide a wide spatula under each mound and turn it over. Cover and cook for another 4 to 5 minutes. A skewer pushed into the centre should come out clean, with no wet batter.',
            'Mai adaugă 15 ml de apă în fiecare tigaie, strecoară o spatulă lată sub fiecare movilă și întoarce-o. Acoperă și mai gătește 4-5 minute. Un bețișor de lemn înfipt în centru trebuie să iasă curată, fără aluat umed.',
          ),
          timerSeconds: 270,
        },
        {
          key: 'serve',
          text: t(
            'Slide three onto each plate, add the whipped cream and pour over the maple syrup. Eat straight away, before they sink.',
            'Pune trei pe fiecare farfurie, pune frișca bătută și toarnă siropul de arțar. Mănâncă imediat, până nu se lasă.',
          ),
        },
      ],
      tips: [
        t(
          'Serve straight from the pan. These deflate within minutes, so do not make them in advance and do not keep leftovers.',
          'Servește direct din tigaie. Se lasă în câteva minute, așa că nu le face dinainte și nu păstra resturi.',
        ),
        t(
          'Keep the heat very low and do not lift the lid before the time is up. High heat browns the outside before the centre sets.',
          'Ține focul foarte mic și nu ridica capacul înainte de vreme. Focul mare rumenește exteriorul înainte să se închege centrul.',
        ),
      ],
      stepTips: [
        {
          step: 'meringue',
          text: t(
            'Any trace of yolk or grease keeps the whites from whipping, so separate the eggs one at a time over a small bowl.',
            'Orice urmă de gălbenuș sau grăsime împiedică albușurile să se bată, așa că separă ouăle pe rând, deasupra unui castron mic.',
          ),
        },
      ],
      nutritionNote: t(
        'Mostly egg and air, so lighter than a thick stack, with good protein from the eggs. The sugar, syrup and cream still make it a sweet, rich dish, and it has little fibre, so serve with fresh fruit and keep the cream small.',
        'În mare parte ou și aer, deci mai ușoare decât un teanc gros, cu proteine bune din ouă. Zahărul, siropul și frișca le fac totuși dulci și bogate, iar fibrele sunt puține; servește cu fructe proaspete și pune frișcă puțină.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Whipped cream', 'Frișcă'),
          reason: t(
            'Cool and light, it matches the airy texture.',
            'Rece și ușoară, se potrivește cu textura aerată.',
          ),
          principle: 'complement_flavour',
          ingredient: 'whipping-cream',
        },
        {
          kind: 'food',
          label: t('Strawberries', 'Căpșuni'),
          reason: t(
            'Their acidity cuts the sweetness and richness.',
            'Aciditatea lor taie din dulceață și din bogăție.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'strawberry',
        },
        {
          kind: 'food',
          label: t('Maple syrup', 'Sirop de arțar'),
          reason: t(
            'Its caramel sweetness suits the eggy, vanilla crumb.',
            'Dulceața lui de caramel se potrivește cu miezul de ou și vanilie.',
          ),
          principle: 'complement_flavour',
          ingredient: 'maple-syrup',
        },
        {
          kind: 'drink',
          label: t('Tea', 'Ceai'),
          reason: t(
            'Unsweetened tea refreshes the palate between sweet, soft bites.',
            'Ceaiul neîndulcit împrospătează gustul între îmbucături dulci și moi.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'tea',
        },
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'Bitterness balances the sweet cream and syrup.',
            'Amăreala echilibrează frișca și siropul dulci.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'coffee',
        },
      ],
      eatingMoments: [
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'A special, unhurried dish for a slow weekend table.',
            'Un preparat special, fără grabă, pentru o masă lejeră de weekend.',
          ),
        },
        {
          moment: 'morning',
          polarity: 'good_for',
          reason: t(
            'The eggs give protein for the morning.',
            'Ouăle dau proteine pentru dimineață.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Sweet and rich with cream shortly before sleep.',
            'Dulci și bogate, cu frișcă, înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
