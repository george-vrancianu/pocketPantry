import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Oatmeal base is a creamy rolled-oat porridge cooked in milk. Each Variant
// is a full Recipe with its own lines, steps and guidance; the base's
// Recipe-level Tips are inherited unless a Variant hides them.
export const oatmeal: BaseRecipeSeed = {
  slug: 'oatmeal',
  title: t('Oatmeal porridge', 'Terci de ovăz'),
  servings: 2,
  prepMinutes: 5,
  cookMinutes: 11,
  difficulty: 'easy',
  lines: [
    { ingredient: 'oats', quantity: 80, unit: 'g' },
    { ingredient: 'milk', quantity: 0.3, unit: 'l' },
    { ingredient: 'still-water', quantity: 0.2, unit: 'l' },
    { ingredient: 'salt', quantity: 1, unit: 'g' },
    {
      ingredient: 'banana',
      quantity: 1,
      unit: 'pcs',
      note: t('sliced', 'tăiată rondele'),
    },
    { ingredient: 'blueberry', quantity: 60, unit: 'g' },
    { ingredient: 'honey', quantity: 20, unit: 'g' },
    { ingredient: 'cinnamon', quantity: 1, unit: 'g' },
    {
      ingredient: 'walnuts',
      quantity: 20,
      unit: 'g',
      optional: true,
      note: t('roughly chopped', 'tocate grosier'),
    },
  ],
  steps: [
    {
      key: 'combine',
      text: t(
        'Put the oats, milk, water and salt in a heavy-based saucepan, so the milk is less likely to catch on the bottom. Set it over medium heat and stir while it comes up to a gentle simmer, about 4 minutes.',
        'Pune fulgii de ovăz, laptele, apa și sarea într-o cratiță cu fund gros, ca laptele să se prindă mai greu. Pune-o pe foc mediu și amestecă până ajunge la un clocot ușor, cam 4 minute.',
      ),
    },
    {
      key: 'simmer',
      text: t(
        'Turn the heat down to low and simmer for 5 minutes, stirring every minute or so and scraping the bottom and corners, until the oats are soft and the porridge looks creamy and slightly looser than you want it.',
        'Dă focul la mic și fierbe 5 minute, amestecând din minut în minut și răzuind fundul și colțurile, până când fulgii sunt moi, iar terciul e cremos și puțin mai lejer decât îl vrei.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'rest',
      text: t(
        'Take the pan off the heat, cover it and leave it for 2 minutes to thicken. Slice the banana while you wait.',
        'Ia cratița de pe foc, acoper-o și lasă terciul 2 minute să se îngroașe. Taie banana rondele între timp.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'serve',
      text: t(
        'Divide the porridge between two bowls. Top with the banana, blueberries, walnuts if using, a drizzle of honey and a pinch of cinnamon. Serve hot.',
        'Împarte terciul în două boluri. Adaugă deasupra banana, afinele, nucile (dacă le folosești), puțină miere și un praf de scorțișoară. Servește fierbinte.',
      ),
    },
  ],
  tips: [
    t(
      'If the porridge has gone too thick in the bowl, stir in a splash of hot milk.',
      'Dacă terciul s-a îngroșat prea tare în bol, amestecă un strop de lapte fierbinte.',
    ),
    t(
      'Rinse the pan or dish as soon as you have served: dried oats set like glue, but a few minutes in cold water and they wipe away.',
      'Clătește cratița sau vasul imediat după ce ai servit: ovăzul uscat se lipește ca lipiciul, dar după câteva minute în apă rece se șterge ușor.',
    ),
  ],
  stepTips: [
    {
      step: 'simmer',
      text: t(
        'Milk scorches at the bottom long before it looks hot, so keep the heat low and use a spoon or spatula that reaches the corners of the pan.',
        'Laptele se arde la fund mult înainte să pară fierbinte, așa că ține focul mic și folosește o lingură sau o spatulă care ajunge în colțurile cratiței.',
      ),
    },
  ],
  nutritionNote: t(
    'Oats give slow-digesting carbohydrate and fibre, and the milk adds protein. Banana, berries and walnuts add more fibre, and the walnuts mostly unsaturated fat. Honey adds sugar, so keep it small, and whole milk adds some saturated fat. Oats contain gluten, so this is not a gluten-free breakfast.',
    'Ovăzul oferă carbohidrați cu digestie lentă și fibre, iar laptele adaugă proteine. Banana, fructele de pădure și nucile aduc fibre în plus, iar nucile grăsimi în mare parte nesaturate. Mierea adaugă zahăr, așa că folosește puțină, iar laptele integral aduce ceva grăsimi saturate. Ovăzul conține gluten, deci nu e un mic dejun fără gluten.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Peanut butter', 'Unt de arahide'),
      reason: t(
        'Its roasted, salty richness carries through the plain oats.',
        'Gustul lui copt și sărat se simte bine prin ovăzul simplu.',
      ),
      principle: 'fat_carries_flavour',
      ingredient: 'peanut-butter',
    },
    {
      kind: 'food',
      label: t('Sliced pear', 'Pară tăiată felii'),
      reason: t(
        'Juicy, lightly sweet fruit goes with the nutty oats and cinnamon.',
        'Fructul zemos și ușor dulce se potrivește cu ovăzul cu gust de nucă și cu scorțișoara.',
      ),
      principle: 'complement_flavour',
      ingredient: 'pear',
    },
    {
      kind: 'drink',
      label: t('Tea', 'Ceai'),
      reason: t(
        'A hot, lightly tannic drink cuts through the soft, milky porridge.',
        'O băutură fierbinte, ușor astringentă, taie din cremozitatea terciului cu lapte.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'tea',
    },
    {
      kind: 'drink',
      label: t('Coffee', 'Cafea'),
      reason: t(
        'Its bitterness balances the sweet honey and banana.',
        'Amăreala ei echilibrează dulceața mierii și a bananei.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'coffee',
    },
  ],
  eatingMoments: [
    {
      moment: 'morning',
      polarity: 'good_for',
      reason: t(
        'Slow-digesting oats keep you going until lunch.',
        'Ovăzul cu digestie lentă te ține sătul până la prânz.',
      ),
    },
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot bowl warms you from the inside.',
        'Un bol fierbinte te încălzește din interior.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Carbohydrate from the oats and banana and protein from the milk help you refuel.',
        'Carbohidrații din ovăz și banană și proteinele din lapte te ajută să-ți refaci energia.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'A steaming bowl is the last thing you want when it is hot out.',
        'Un bol aburind e ultimul lucru dorit când afară e cald.',
      ),
    },
  ],
  variants: [
    {
      slug: 'oatmeal-swiss',
      cuisine: 'swiss',
      title: t(
        'Bircher muesli (Swiss soaked oats with grated apple)',
        'Musli Bircher (fulgi de ovăz înmuiați peste noapte, cu măr ras, ca în Elveția)',
      ),
      servings: 2,
      prepMinutes: 490,
      difficulty: 'easy',
      hideBaseTips: [0, 1],
      lines: [
        { ingredient: 'oats', quantity: 80, unit: 'g' },
        { ingredient: 'milk', quantity: 0.2, unit: 'l' },
        { ingredient: 'yogurt', quantity: 150, unit: 'g' },
        { ingredient: 'lemon-juice', quantity: 15, unit: 'ml' },
        {
          ingredient: 'apple',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'washed, skin on, cored and coarsely grated',
            'spălat, cu coajă, fără cotor, ras pe răzătoarea mare',
          ),
        },
        { ingredient: 'honey', quantity: 15, unit: 'g' },
        {
          ingredient: 'hazelnuts',
          quantity: 20,
          unit: 'g',
          note: t('roughly chopped', 'tocate grosier'),
        },
        {
          ingredient: 'raspberry',
          quantity: 60,
          unit: 'g',
          optional: true,
        },
      ],
      steps: [
        {
          key: 'soak',
          text: t(
            'In a bowl, stir together the oats, milk, yogurt and 5 ml of the lemon juice until no dry oats remain. Cover and chill in the fridge for at least 8 hours, or overnight.',
            'Într-un bol, amestecă fulgii de ovăz, laptele, iaurtul și 5 ml din sucul de lămâie până nu mai rămân fulgi uscați. Acoperă și ține la frigider cel puțin 8 ore, sau peste noapte.',
          ),
          timerSeconds: 28800,
        },
        {
          key: 'apple',
          text: t(
            'In the morning, stir the soaked oats; they should be soft and thick. Coarsely grate the apple, skin on, into a small bowl and toss it with the remaining 10 ml of lemon juice so it stays pale. Stir it into the oats with the honey. Add a splash of milk if it is too stiff.',
            'Dimineața, amestecă ovăzul înmuiat; trebuie să fie moale și gros. Rade mărul, cu coajă, într-un bol mic și amestecă-l cu cei 10 ml de suc de lămâie rămași, ca să nu se închidă la culoare. Adaugă-l peste ovăz, împreună cu mierea. Dacă e prea tare, pune un strop de lapte.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Spoon into two bowls and top with the hazelnuts and raspberries, if using. Serve cold.',
            'Pune în două boluri și adaugă deasupra alunele și zmeura, dacă o folosești. Servește rece.',
          ),
        },
      ],
      tips: [
        t(
          'Keep the apple out of the overnight soak, and toss it in lemon juice once grated: grated apple browns and turns watery. The soaked oats alone keep for up to 3 days covered in the fridge, so you can make a batch and grate fresh apple each morning.',
          'Nu pune mărul la înmuiat peste noapte și amestecă-l cu suc de lămâie după ce l-ai răzuit: mărul ras se brunifică și se înmoaie. Ovăzul înmuiat singur ține până la 3 zile, acoperit, la frigider, așa că poți face o porție mai mare și răzui mărul proaspăt în fiecare dimineață.',
        ),
      ],
      stepTips: [
        {
          step: 'soak',
          text: t(
            'Use a bowl with a lid or cover it with cling film so the oats do not pick up fridge smells.',
            'Folosește un bol cu capac sau acoperă-l cu folie, ca ovăzul să nu ia mirosuri din frigider.',
          ),
        },
      ],
      nutritionNote: t(
        'Soaked oats and apple with its skin give plenty of fibre, and yogurt and milk add protein. Hazelnuts bring mostly unsaturated fat. Honey and fruit add sugar; a sweet apple may need little or no honey. Oats contain gluten, and the dish has milk and nuts.',
        'Ovăzul înmuiat și mărul cu coajă dau multe fibre, iar iaurtul și laptele adaugă proteine. Alunele aduc grăsimi în mare parte nesaturate. Mierea și fructele adaugă zahăr; un măr dulce poate cere puțină miere sau deloc. Ovăzul conține gluten, iar rețeta are lapte și nuci.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Pumpkin seeds', 'Semințe de dovleac'),
          reason: t(
            'A crunchy sprinkle against the soft, creamy oats.',
            'Un strop crocant peste ovăzul moale și cremos.',
          ),
          principle: 'contrast_texture',
          ingredient: 'pumpkin-seeds',
        },
        {
          kind: 'food',
          label: t('Strawberries', 'Căpșuni'),
          reason: t(
            'Their fresh tartness lightens the creamy yogurt and milk.',
            'Aciditatea lor proaspătă ușurează iaurtul și laptele cremos.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'strawberry',
        },
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'Its bitterness balances the sweet fruit and honey.',
            'Amăreala ei echilibrează dulceața fructelor și a mierii.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'coffee',
        },
        {
          kind: 'drink',
          label: t('Tea', 'Ceai'),
          reason: t(
            'Its light tannin refreshes the palate after the creamy yogurt.',
            'Taninul ușor îți împrospătează gustul după iaurtul cremos.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'morning',
          polarity: 'good_for',
          reason: t(
            'It is ready when you wake up, with nothing to cook.',
            'E gata când te trezești, fără nimic de gătit.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Served cold and fresh, it is easy to eat in warm weather.',
            'Servit rece și proaspăt, se mănâncă ușor pe vreme caldă.',
          ),
        },
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'Make it the night before and set out the fruit and nuts.',
            'Îl faci cu o seară înainte și pui pe masă fructele și nucile.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'avoid',
          reason: t(
            'A cold bowl is less welcome on a freezing morning.',
            'Un bol rece prinde mai puțin bine într-o dimineață geroasă.',
          ),
        },
      ],
    },
    {
      slug: 'oatmeal-british',
      cuisine: 'british',
      title: t(
        'Scottish porridge (pinhead oats cooked in water with salt)',
        'Terci scoțian de ovăz (porridge din ovăz tăiat, fiert în apă cu sare)',
      ),
      servings: 2,
      prepMinutes: 485,
      cookMinutes: 26,
      difficulty: 'easy',
      lines: [
        { ingredient: 'pinhead-oats', quantity: 80, unit: 'g' },
        { ingredient: 'still-water', quantity: 0.4, unit: 'l' },
        { ingredient: 'salt', quantity: 1.5, unit: 'g' },
        {
          ingredient: 'milk',
          quantity: 0.1,
          unit: 'l',
          note: t('cold, to serve', 'rece, pentru servit'),
        },
        {
          ingredient: 'brown-sugar',
          quantity: 10,
          unit: 'g',
          optional: true,
          note: t('at the table', 'la masă'),
        },
      ],
      steps: [
        {
          key: 'soak',
          text: t(
            'Put the pinhead oats and the water in a saucepan, cover and leave on the counter or in the fridge for at least 8 hours, or overnight.',
            'Pune ovăzul tăiat și apa într-o cratiță, acoperă și lasă la temperatura camerei sau la frigider cel puțin 8 ore, sau peste noapte.',
          ),
          timerSeconds: 28800,
        },
        {
          key: 'boil',
          text: t(
            'Set the pan, with the soaking water, over medium heat and bring to the boil, stirring now and then, about 4 minutes. Stir in the salt.',
            'Pune cratița, cu tot cu apa de înmuiere, pe foc mediu și adu la fierbere, amestecând din când în când, cam 4 minute. Adaugă sarea.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Turn the heat down to low and simmer for 20 minutes, stirring often and scraping the bottom, until the grains are tender with a slight chew and the porridge is thick. Add a splash of hot water if it gets too stiff.',
            'Dă focul la mic și fierbe 20 de minute, amestecând des și răzuind fundul, până când boabele sunt fragede, cu puțină consistență, iar terciul e gros. Dacă se îngroașe prea tare, adaugă un strop de apă fierbinte.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'rest',
          text: t(
            'Take the pan off the heat, cover and leave for 2 minutes. Taste a spoonful: the grains should be soft all the way through.',
            'Ia cratița de pe foc, acoper-o și lasă 2 minute. Gustă o lingură: boabele trebuie să fie moi până în miez.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'serve',
          text: t(
            'Ladle the porridge into bowls and serve hot, with the cold milk poured around the edge or on the side. Add brown sugar at the table, if you like.',
            'Pune terciul în boluri și servește fierbinte, cu laptele rece turnat pe margine sau pe lângă. Dacă vrei, adaugă zahăr brun la masă.',
          ),
        },
      ],
      tips: [
        t(
          'Pinhead oats stay chewy rather than creamy; that is the point. Without the overnight soak, simmer for about 30 minutes, stir more often and add a little hot water as it cooks.',
          'Ovăzul tăiat rămâne cu bobul ușor elastic, nu cremos, și așa trebuie. Dacă sari peste înmuierea de peste noapte, fierbe cam 30 de minute, amestecă mai des și adaugă puțină apă fierbinte pe parcurs.',
        ),
      ],
      stepTips: [
        {
          step: 'simmer',
          text: t(
            'Stir with a wooden spoon and keep the heat low: thick porridge sticks and scorches on the bottom easily.',
            'Amestecă cu o lingură de lemn și ține focul mic: terciul gros se prinde și se arde ușor la fund.',
          ),
        },
      ],
      nutritionNote: t(
        'Just oats, water and salt: plenty of fibre, no fat or sugar in the pot, and the salt is yours to control. On its own it has modest protein; the cold milk adds some, and a little fat too. Brown sugar at the table adds sugar. Oats contain gluten.',
        'Doar ovăz, apă și sare: multe fibre, fără grăsimi sau zahăr în oală, iar sarea o dozezi tu. Singur are puține proteine; laptele rece adaugă ceva proteine și puțină grăsime. Zahărul brun de la masă adaugă zahăr. Ovăzul conține gluten.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('A knob of butter', 'Puțin unt'),
          reason: t(
            'It melts into the hot porridge and carries the nutty flavour of the oats.',
            'Se topește în terciul fierbinte și duce mai departe gustul de nucă al ovăzului.',
          ),
          principle: 'fat_carries_flavour',
          ingredient: 'butter',
        },
        {
          kind: 'food',
          label: t('Golden syrup', 'Sirop auriu (golden syrup)'),
          reason: t(
            'Sweet syrup is set off by the salted, plain oats.',
            'Siropul dulce iese în evidență lângă ovăzul simplu, cu sare.',
          ),
          principle: 'salt_balances_sweet',
          ingredient: 'golden-syrup',
        },
        {
          kind: 'food',
          label: t('Crisp bacon', 'Bacon crocant'),
          reason: t(
            'Salty crunch against the soft, chewy grains.',
            'Crocanțul sărat contrastează cu boabele moi și ușor elastice.',
          ),
          principle: 'contrast_texture',
          ingredient: 'bacon',
        },
        {
          kind: 'drink',
          label: t('Tea', 'Ceai'),
          reason: t(
            'A strong, lightly tannic cup refreshes the palate after the plain, heavy oats.',
            'O ceașcă tare, ușor astringentă, împrospătează gustul după ovăzul simplu și consistent.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'morning',
          polarity: 'good_for',
          reason: t(
            'The chewy whole grains are slow to digest and keep you full.',
            'Boabele întregi, mestecabile, se digeră încet și te țin sătul.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, thick bowl warms you through.',
            'Un bol fierbinte și gros te încălzește bine.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'Thick, hot porridge is heavy in warm weather.',
            'Un terci gros și fierbinte cade greu pe vreme caldă.',
          ),
        },
      ],
    },
    {
      slug: 'oatmeal-oven-baked',
      method: 'oven-baked',
      title: t(
        'Baked oatmeal with berries',
        'Ovăz copt la cuptor cu fructe de pădure',
      ),
      servings: 6,
      prepMinutes: 15,
      cookMinutes: 45,
      difficulty: 'easy',
      hideBaseTips: [0],
      lines: [
        { ingredient: 'oats', quantity: 200, unit: 'g' },
        { ingredient: 'milk', quantity: 0.4, unit: 'l' },
        { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
        {
          ingredient: 'butter',
          quantity: 50,
          unit: 'g',
          note: t(
            'melted, plus a little for the dish',
            'topit, plus puțin pentru tavă',
          ),
        },
        { ingredient: 'maple-syrup', quantity: 60, unit: 'ml' },
        { ingredient: 'baking-powder', quantity: 6, unit: 'g' },
        { ingredient: 'cinnamon', quantity: 2, unit: 'g' },
        { ingredient: 'vanilla-extract', quantity: 5, unit: 'ml' },
        { ingredient: 'salt', quantity: 1.5, unit: 'g' },
        {
          ingredient: 'frozen-berries',
          quantity: 200,
          unit: 'g',
          note: t('straight from the freezer', 'direct din congelator'),
        },
        {
          ingredient: 'walnuts',
          quantity: 40,
          unit: 'g',
          optional: true,
          note: t('roughly chopped', 'tocate grosier'),
        },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 180 °C (conventional); it takes about 15 minutes, so carry on with the next steps while it heats. Butter a 20 x 25 cm baking dish.',
            'Încinge cuptorul la 180 °C (fără ventilator); durează cam 15 minute, așa că treci la pașii următori cât se încălzește. Unge cu unt o tavă de copt de 20 x 25 cm.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'melt',
          text: t(
            'Melt the 50 g of butter in a small pan over low heat, or in the microwave, and let it cool for a few minutes so it does not scramble the eggs.',
            'Topește cei 50 g de unt într-o cratiță mică, la foc mic, sau la microunde, și lasă-l să se răcească câteva minute, ca să nu coaguleze ouăle.',
          ),
        },
        {
          key: 'mix',
          text: t(
            'In a large bowl, mix the oats, baking powder, cinnamon and salt. In a jug, whisk the milk, eggs, maple syrup, vanilla and the cooled butter. Pour the wet mix into the oats and stir.',
            'Într-un bol mare, amestecă fulgii de ovăz, praful de copt, scorțișoara și sarea. Într-un vas, bate laptele cu ouăle, siropul de arțar, vanilia și untul răcit. Toarnă amestecul lichid peste ovăz și amestecă.',
          ),
        },
        {
          key: 'assemble',
          text: t(
            'Scatter the frozen berries over the bottom of the dish, pour the oat mixture over them and level it with the back of a spoon. Sprinkle the walnuts on top, if using.',
            'Împrăștie fructele de pădure congelate pe fundul tăvii, toarnă deasupra compoziția de ovăz și niveleaz-o cu dosul unei linguri. Presară nucile deasupra, dacă le folosești.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 35 minutes, until the top is golden and the centre is set: it should spring back when pressed, and a knife pushed into the middle should come out without raw egg on it. If it is still wobbly, bake for 5 minutes more and check again.',
            'Coace 35 de minute, până când partea de sus e aurie, iar centrul e închegat: trebuie să revină când îl apeși, iar un cuțit băgat în mijloc trebuie să iasă fără ou crud pe el. Dacă tremură încă, mai coace 5 minute și verifică din nou.',
          ),
          timerSeconds: 2100,
        },
        {
          key: 'rest',
          text: t(
            'Let the bake rest in the dish for 10 minutes, then cut it into squares and serve warm.',
            'Lasă ovăzul copt să se odihnească în tavă 10 minute, apoi taie-l pătrate și servește cald.',
          ),
          timerSeconds: 600,
        },
      ],
      tips: [
        t(
          'Do not thaw the berries: frozen berries bleed less colour into the batter, and they bake through in the time given.',
          'Nu dezgheța fructele de pădure: congelate, își lasă mai puțină culoare în compoziție și se coc bine în timpul indicat.',
        ),
        t(
          'Cool leftovers within 2 hours, cover them and keep them in the fridge for up to 4 days; reheat squares until steaming hot.',
          'Răcește rămășițele în maximum 2 ore, acoperă-le și ține-le la frigider până la 4 zile; reîncălzește pătratele până se încing bine.',
        ),
      ],
      stepTips: [
        {
          step: 'mix',
          text: t(
            'Let the mixture sit for 5 minutes before you pour it over the berries; the oats soak up some milk and the bake turns out softer.',
            'Lasă compoziția 5 minute înainte s-o torni peste fructe; ovăzul absoarbe din lapte, iar produsul final iese mai moale.',
          ),
        },
      ],
      nutritionNote: t(
        'A filling, fibre-rich breakfast, with protein from the eggs and milk and fibre from the oats and berries. The butter is mostly saturated fat and the maple syrup adds sugar, so cut small squares and use less syrup if the berries are sweet. It contains gluten, eggs, milk and, if used, nuts.',
        'Un mic dejun consistent, bogat în fibre, cu proteine din ouă și lapte și fibre din ovăz și fructe de pădure. Untul e în mare parte grăsime saturată, iar siropul de arțar adaugă zahăr, așa că taie pătrate mici și pune mai puțin sirop dacă fructele sunt dulci. Conține gluten, ouă, lapte și, dacă le folosești, nuci.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Plain yogurt', 'Iaurt simplu'),
          reason: t(
            'Its cool tang cuts the buttery, sweet bake.',
            'Gustul acrișor și rece echilibrează ovăzul copt, dulce și cu unt.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'yogurt',
        },
        {
          kind: 'food',
          label: t('Peanut butter', 'Unt de arahide'),
          reason: t(
            'A spoonful on a warm square adds a salty, nutty richness.',
            'O lingură pe un pătrat cald adaugă o bogăție sărată, cu gust de nucă.',
          ),
          principle: 'complement_flavour',
          ingredient: 'peanut-butter',
        },
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'Its bitterness balances the maple sweetness.',
            'Amăreala ei echilibrează dulceața siropului de arțar.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'coffee',
        },
      ],
      eatingMoments: [
        {
          moment: 'morning',
          polarity: 'good_for',
          reason: t(
            'Make it ahead and warm up a square on a busy morning.',
            'Îl faci dinainte și încălzești un pătrat într-o dimineață aglomerată.',
          ),
        },
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'It feeds a crowd from one dish.',
            'Hrănește mai multe persoane dintr-o singură tavă.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Carbohydrate from the oats and protein from the eggs help recovery.',
            'Carbohidrații din ovăz și proteinele din ouă ajută la refacere.',
          ),
        },
      ],
    },
  ],
};
