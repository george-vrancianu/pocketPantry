import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Apple crumble base is the baked British crumble. Its Variants change the
// technique: the Danish one is not baked at all (compote and toasted crumbs
// layered cold), the Romanian one is a double-crust apple slice. Each Variant is
// a full Recipe. The base's Recipe-level Tips are inherited unless hidden.
export const appleCrumble: BaseRecipeSeed = {
  slug: 'apple-crumble',
  title: t('Apple crumble', 'Crumble cu mere'),
  servings: 6,
  prepMinutes: 30,
  cookMinutes: 40,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'cooking-apples',
      quantity: 4,
      unit: 'pcs',
      note: t(
        'about 1.2 kg in total, peeled, cored and cut into 2 to 3 cm chunks',
        'în total aproximativ 1,2 kg, curățate de coajă și de cotor, tăiate bucăți de 2-3 cm',
      ),
    },
    { ingredient: 'sugar', quantity: 50, unit: 'g' },
    {
      ingredient: 'lemon',
      quantity: 0.5,
      unit: 'pcs',
      note: t('juice only', 'doar sucul'),
    },
    { ingredient: 'cinnamon', quantity: 2, unit: 'g', optional: true },
    {
      ingredient: 'butter',
      key: 'butter-dish',
      quantity: 10,
      unit: 'g',
      note: t('to grease the dish', 'pentru uns vasul'),
    },
    { ingredient: 'flour', quantity: 225, unit: 'g' },
    { ingredient: 'salt', quantity: 1, unit: 'g' },
    {
      ingredient: 'butter',
      key: 'butter-topping',
      quantity: 150,
      unit: 'g',
      note: t('cold, cut into small cubes', 'rece, tăiat cubulețe'),
    },
    {
      ingredient: 'brown-sugar',
      quantity: 100,
      unit: 'g',
      note: t('demerara or light brown', 'demerara sau brun deschis'),
    },
  ],
  steps: [
    {
      key: 'preheat',
      text: t(
        'Switch the oven on to 190 °C (170 °C fan). It needs about 15 minutes to heat fully, so prepare the apples meanwhile. Put the shelf in the middle.',
        'Pornește cuptorul la 190 °C (170 °C cu ventilator). Are nevoie de aproximativ 15 minute să se încălzească bine, așa că pregătește merele între timp. Pune grătarul la mijloc.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'grease',
      text: t(
        'Grease a 20 × 30 cm baking dish, or a round one of 24 cm, with the 10 g of butter.',
        'Unge cu cele 10 g de unt un vas de copt de 20 × 30 cm sau unul rotund de 24 cm.',
      ),
    },
    {
      key: 'apples',
      text: t(
        'Peel and core the apples and cut them into 2 to 3 cm chunks. Put them in a bowl with the lemon juice as you go.',
        'Curăță merele de coajă și de cotor și taie-le bucăți de 2-3 cm. Pune-le într-un bol cu sucul de lămâie pe măsură ce le tai.',
      ),
    },
    {
      key: 'fill',
      text: t(
        'Toss the apples with the 50 g of sugar and the cinnamon, then spread them in the dish in an even layer.',
        'Amestecă merele cu cele 50 g de zahăr și cu scorțișoara, apoi întinde-le într-un strat egal în vas.',
      ),
    },
    {
      key: 'rub',
      text: t(
        'In a large bowl, mix the flour and salt. Add the 150 g of cold butter cubes and rub them in with your fingertips until the mixture looks like coarse crumbs, with a few pea-sized lumps left.',
        'Într-un castron mare amestecă făina cu sarea. Adaugă cele 150 g de unt rece, cubulețe, și freacă-l cu vârfurile degetelor până când compoziția seamănă cu niște firimituri mari, cu câteva bucățele cât mazărea.',
      ),
    },
    {
      key: 'sweeten',
      text: t(
        'Stir the brown sugar into the crumbs.',
        'Amestecă zahărul brun în firimituri.',
      ),
    },
    {
      key: 'top',
      text: t(
        'Scatter the topping loosely over the apples, without pressing it down, so it stays crumbly. Stand the dish on a baking tray to catch the juice that bubbles over.',
        'Presară firimiturile peste mere fără să le apeși, ca firimiturile să rămână sfărâmicioase. Pune vasul pe o tavă de copt, ca să prindă sucul care dă în foc.',
      ),
    },
    {
      key: 'bake',
      text: t(
        'Bake for 40 minutes. It is done when the topping is golden, the juice bubbles thickly at the edges and a knife slides into the apples without any resistance. If the knife still meets resistance, give it 5 more minutes. If the top is dark before the fruit is tender, cover it loosely with foil.',
        'Coace 40 de minute. E gata când crusta e aurie, sucul face bule groase la margini, iar un cuțit intră în mere fără nicio rezistență. Dacă cuțitul întâmpină încă rezistență, mai ține crumble-ul 5 minute. Dacă crusta se închide la culoare înainte ca merele să se înmoaie, acoperă-l ușor cu folie de aluminiu.',
      ),
      timerSeconds: 2400,
    },
    {
      key: 'rest',
      text: t(
        'Let the crumble rest for 10 minutes before serving. The fruit and its sugary juice are very hot, especially for children.',
        'Lasă crumble-ul să se odihnească 10 minute înainte de servire. Fructele și sucul zaharos sunt foarte fierbinți, mai ales pentru copii.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'serve',
      text: t(
        'Spoon into bowls and serve warm, with cream or ice cream.',
        'Pune în boluri și servește cald, cu frișcă lichidă sau înghețată.',
      ),
    },
  ],
  tips: [
    t(
      'Cooking apples collapse into a soft, tart purée as they bake, which is what makes the juicy base. If you only have eating apples, they hold their shape and are sweeter: use about 20 g less sugar.',
      'Merele pentru gătit se destramă la copt într-un piure moale și acrișor, care dă baza zemoasă. Dacă ai doar mere de consum, își păstrează forma și sunt mai dulci: pune cu aproximativ 20 g mai puțin zahăr.',
    ),
    t(
      'Keep the butter cold and work it in quickly with your fingertips. If it turns soft and greasy, chill the bowl for 10 minutes before going on.',
      'Păstrează untul rece și încorporează-l repede cu vârfurile degetelor. Dacă se înmoaie și devine unsuros, pune bolul la frigider 10 minute înainte să continui.',
    ),
    t(
      'Leftovers: cool within 2 hours, then cover and keep in the fridge for up to 3 days. Reheat in a 180 °C oven for 15 to 20 minutes until steaming hot; the topping crisps up again, which a microwave will not do.',
      'Rămășițe: lasă-le să se răcească în cel mult 2 ore, apoi acoperă-le și păstrează-le la frigider până la 3 zile. Reîncălzește-le în cuptor la 180 °C timp de 15-20 de minute, până scot aburi; crusta se întărește din nou, ceea ce nu se întâmplă la cuptorul cu microunde.',
    ),
  ],
  stepTips: [
    {
      step: 'top',
      text: t(
        'Make a double batch of the topping and freeze half in a bag. Scatter it frozen over fresh apples next time and bake as usual.',
        'Fă dublul cantității de firimituri și îngheață jumătate într-o pungă. Data viitoare presar-o congelată peste mere proaspete și coace ca de obicei.',
      ),
    },
  ],
  nutritionNote: t(
    'Apples add some fibre and make up most of the dish. The topping is mostly flour, butter and sugar, so a portion is high in sugar and in saturated fat from the butter, and cream or ice cream adds more of both. Keep the portions modest.',
    'Merele aduc ceva fibre și alcătuiesc cea mai mare parte din desert. Crusta e făcută mai ales din făină, unt și zahăr, așa că o porție conține mult zahăr și grăsimi saturate din unt, iar frișca sau înghețata adaugă și mai mult din ambele. Servește porții moderate.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Lightly whipped cream', 'Frișcă bătută ușor'),
      reason: t(
        'Cold, soft cream melts into the hot fruit and its fat rounds off the sharp apple.',
        'Frișca rece și moale se topește în fructele fierbinți, iar grăsimea ei rotunjește aciditatea merelor.',
      ),
      principle: 'fat_carries_flavour',
      ingredient: 'whipping-cream',
    },
    {
      kind: 'food',
      label: t('Vanilla ice cream', 'Înghețată de vanilie'),
      reason: t(
        'Cold and creamy against a hot, crisp topping.',
        'Rece și cremoasă, în contrast cu crusta fierbinte și crocantă.',
      ),
      principle: 'contrast_texture',
      ingredient: 'ice-cream',
    },
    {
      kind: 'food',
      label: t('Roast chicken', 'Pui la cuptor'),
      reason: t(
        'A British Sunday lunch is often followed by a baked fruit pudding like this one. Once the chicken is out, turn the oven down to 190 °C and put the crumble in; the tart apple cuts through the richness of the roast.',
        'La prânzul britanic de duminică urmează adesea un desert copt cu fructe, ca acesta. După ce scoți puiul, dă cuptorul la 190 °C și pune crumble-ul; mărul acrișor taie din bogăția friptinii.',
      ),
      principle: 'regional_tradition',
      recipe: 'roast-chicken',
    },
    {
      kind: 'drink',
      label: t('Black tea', 'Ceai negru'),
      reason: t(
        'Its slight bitterness balances the buttery, sweet topping.',
        'Amăreala ușoară echilibrează crusta dulce, cu gust de unt.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'tea',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'Served warm, with cinnamon and soft apples, it is comforting on a cold day.',
        'Servit cald, cu scorțișoară și mere moi, face bine într-o zi rece.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'The buttery topping and cream sit heavy in the stomach during exercise.',
        'Crusta cu unt și frișca cad greu la stomac în timpul efortului.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A lot of sugar and butter right before bed.',
        'Mult zahăr și unt chiar înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'apple-crumble-scandinavian',
      cuisine: 'scandinavian',
      title: t(
        'Gammeldags æblekage (Danish layered apple and buttery crumb dessert)',
        'Gammeldags æblekage (desert danez în straturi, cu piure de mere și pesmet rumenit în unt)',
      ),
      servings: 6,
      prepMinutes: 165,
      cookMinutes: 26,
      difficulty: 'easy',
      hideBaseTips: [0, 1, 2],
      lines: [
        {
          ingredient: 'cooking-apples',
          quantity: 4,
          unit: 'pcs',
          note: t(
            'about 1.2 kg in total, peeled, cored and cut into chunks',
            'în total aproximativ 1,2 kg, curățate de coajă și de cotor, tăiate bucăți',
          ),
        },
        {
          ingredient: 'sugar',
          key: 'sugar-compote',
          quantity: 80,
          unit: 'g',
          note: t('for the compote', 'pentru piureul de mere'),
        },
        { ingredient: 'still-water', quantity: 0.1, unit: 'l' },
        {
          ingredient: 'vanilla-pods',
          quantity: 1,
          unit: 'pcs',
          optional: true,
          note: t('split lengthways', 'tăiată pe lungime'),
        },
        { ingredient: 'breadcrumbs', quantity: 120, unit: 'g' },
        { ingredient: 'butter', quantity: 60, unit: 'g' },
        {
          ingredient: 'sugar',
          key: 'sugar-crumbs',
          quantity: 60,
          unit: 'g',
          note: t('for the crumbs', 'pentru pesmet'),
        },
        { ingredient: 'whipping-cream', quantity: 300, unit: 'ml' },
        {
          ingredient: 'redcurrant-jelly',
          quantity: 40,
          unit: 'g',
          optional: true,
        },
      ],
      steps: [
        {
          key: 'peel',
          text: t(
            'Peel and core the apples and cut them into rough chunks.',
            'Curăță merele de coajă și de cotor și taie-le bucăți mari.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Put the apples, the water, the 80 g of sugar and the vanilla pod in a wide pan with a lid. Cook over medium-low heat for 15 minutes, stirring now and then, until the apples fall apart.',
            'Pune merele, apa, cele 80 g de zahăr și păstaia de vanilie într-o cratiță lată, cu capac. Fierbe la foc mic-mediu 15 minute, amestecând din când în când, până când merele se destramă.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'thicken',
          text: t(
            'Take off the lid and cook for 5 more minutes, stirring and mashing with a spoon, until the compote is thick enough for a spoon to leave a trail.',
            'Ia capacul și mai fierbe 5 minute, amestecând și zdrobind cu lingura, până când piureul e atât de gros încât lingura lasă o urmă.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'cool',
          text: t(
            'Remove the vanilla pod and tip the compote into a bowl. Let it cool at room temperature for 30 minutes; toast the crumbs while you wait.',
            'Scoate păstaia de vanilie și toarnă piureul într-un bol. Lasă-l să se răcească la temperatura camerei 30 de minute; prăjește pesmetul între timp.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'toast',
          text: t(
            'Melt the butter in a wide frying pan over medium heat. Add the breadcrumbs and the 60 g of sugar and stir all the time for about 6 minutes, until golden and crisp. They burn quickly.',
            'Topește untul într-o tigaie lată la foc mediu. Adaugă pesmetul și cele 60 g de zahăr și amestecă mereu aproximativ 6 minute, până când se rumenește și devine crocant. Se arde repede.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'cool-crumbs',
          text: t(
            'Tip the crumbs onto a plate, spread them out and let them cool completely, about 15 minutes. Warm crumbs would turn soggy in the bowl.',
            'Toarnă pesmetul pe o farfurie, întinde-l și lasă-l să se răcească complet, aproximativ 15 minute. Pesmetul cald s-ar muia în bol.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'chill-compote',
          text: t(
            'Cover the compote and put it in the fridge until completely cold, at least 1 hour. Warm compote would soften the crumbs.',
            'Acoperă piureul și pune-l la frigider până se răcește complet, cel puțin 1 oră. Piureul cald ar înmuia pesmetul.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'layer',
          text: t(
            'In a glass bowl of about 2 l, or in six glasses, layer a third of the crumbs, half of the cold compote, another third of the crumbs, the rest of the compote and finish with the last crumbs.',
            'Într-un bol de sticlă de aproximativ 2 l, sau în șase pahare, pune pe rând o treime din pesmet, jumătate din piureul rece, încă o treime din pesmet, restul de piure și termină cu ultimul pesmet.',
          ),
        },
        {
          key: 'chill',
          text: t(
            'Chill for at least 1 hour so the layers settle.',
            'Pune la rece cel puțin 1 oră, ca straturile să se așeze.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'cream',
          text: t(
            'Just before serving, whip the cream to soft peaks, spoon it on top and add small spoonfuls of the redcurrant jelly. Serve cold.',
            'Chiar înainte de servire, bate frișca până face vârfuri moi, pune-o deasupra și adaugă câteva linguri mici de jeleu de coacăze roșii. Servește rece.',
          ),
        },
      ],
      tips: [
        t(
          'Take the crumbs off the heat the moment they turn golden and tip them out of the pan: they keep colouring in the hot pan and turn bitter.',
          'Ia pesmetul de pe foc de îndată ce se rumenește și scoate-l din tigaie: continuă să se rumenească în tigaia caldă și se amărăște.',
        ),
        t(
          'Storage: the assembled dessert keeps in the fridge for 1 day, but the crumbs soften. The compote alone keeps 3 to 4 days in a covered jar, so layer it fresh.',
          'Păstrare: desertul asamblat ține la frigider 1 zi, dar pesmetul se înmoaie. Piureul singur ține 3-4 zile într-un borcan acoperit, așa că asamblează desertul când îl servești.',
        ),
      ],
      stepTips: [
        {
          step: 'layer',
          text: t(
            'Assemble it no more than a few hours before serving: the crumbs absorb moisture from the compote and lose their crunch the longer it waits.',
            'Asamblează desertul cu cel mult câteva ore înainte de servire: pesmetul absoarbe umezeala din piure și își pierde crocanța cu cât stă mai mult.',
          ),
        },
      ],
      nutritionNote: t(
        'The compote is mostly apple with a modest amount of sugar, so it adds some fibre. The crumbs are fried in butter and sugar and the topping is cream, so the dessert is high in sugar and in saturated fat. A small glass goes a long way.',
        'Piureul e mai ales mere, cu puțin zahăr, deci aduce ceva fibre. Pesmetul e prăjit în unt cu zahăr, iar deasupra e frișcă, așa că desertul conține mult zahăr și grăsimi saturate. Un pahar mic e suficient.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'Its bitterness balances the sweet crumbs and cream.',
            'Amăreala ei echilibrează pesmetul dulce și frișca.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'coffee',
        },
        {
          kind: 'drink',
          label: t('Cider', 'Cidru'),
          reason: t(
            'Apple on apple: the cider echoes the fruit and its acidity cuts the cream.',
            'Măr lângă măr: cidrul reia aroma fructului, iar aciditatea lui taie din bogăția frișcii.',
          ),
          principle: 'complement_flavour',
          ingredient: 'cider',
        },
      ],
      eatingMoments: [
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Served cold and needs no oven.',
            'Se servește rece și nu cere cuptor.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'The butter-fried crumbs and cream sit heavy in the stomach during exercise.',
            'Pesmetul prăjit în unt și frișca cad greu la stomac în timpul efortului.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A lot of sugar and butter right before bed.',
            'Mult zahăr și unt chiar înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'apple-crumble-romanian',
      cuisine: 'romanian',
      title: t(
        'Romanian apple slice with shortcrust (prăjitură cu mere)',
        'Prăjitură cu mere și aluat fraged',
      ),
      servings: 12,
      prepMinutes: 135,
      cookMinutes: 52,
      difficulty: 'medium',
      hideBaseTips: [0, 2],
      lines: [
        { ingredient: 'flour', quantity: 500, unit: 'g' },
        {
          ingredient: 'butter',
          quantity: 250,
          unit: 'g',
          note: t('cold, cut into small cubes', 'rece, tăiat cubulețe'),
        },
        {
          ingredient: 'sugar',
          key: 'sugar-dough',
          quantity: 100,
          unit: 'g',
          note: t('for the dough', 'pentru aluat'),
        },
        { ingredient: 'vanilla-sugar', quantity: 10, unit: 'g' },
        {
          ingredient: 'eggs',
          quantity: 3,
          unit: 'pcs',
          note: t('yolks only', 'doar gălbenușurile'),
        },
        { ingredient: 'sour-cream', quantity: 150, unit: 'g' },
        { ingredient: 'baking-powder', quantity: 8, unit: 'g' },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t('grated zest only', 'doar coaja rasă'),
        },
        { ingredient: 'salt', quantity: 1, unit: 'g' },
        {
          ingredient: 'apple',
          quantity: 8,
          unit: 'pcs',
          note: t(
            'tart, such as Ionatan, about 1.5 kg in total, peeled and coarsely grated',
            'acrișoare, de exemplu Ionatan, în total aproximativ 1,5 kg, curățate de coajă și date pe răzătoarea mare',
          ),
        },
        {
          ingredient: 'sugar',
          key: 'sugar-filling',
          quantity: 100,
          unit: 'g',
          note: t('for the filling', 'pentru umplutură'),
        },
        { ingredient: 'cinnamon', quantity: 4, unit: 'g' },
        {
          ingredient: 'semolina',
          quantity: 30,
          unit: 'g',
          optional: true,
        },
        {
          ingredient: 'walnuts',
          quantity: 80,
          unit: 'g',
          optional: true,
          note: t('coarsely chopped', 'tocate grosier'),
        },
        {
          ingredient: 'icing-sugar',
          quantity: 30,
          unit: 'g',
          note: t('for dusting', 'pentru pudrat'),
        },
      ],
      steps: [
        {
          key: 'rub',
          text: t(
            'In a large bowl, mix the flour, baking powder, salt, the 100 g of sugar for the dough, the vanilla sugar and the lemon zest. Rub in the cold butter with your fingertips until the mixture looks like wet sand.',
            'Într-un castron mare amestecă făina cu praful de copt, sarea, cele 100 g de zahăr pentru aluat, zahărul vanilat și coaja de lămâie. Adaugă untul rece și freacă-l cu făina, cu vârfurile degetelor, până când compoziția seamănă cu nisipul umed.',
          ),
        },
        {
          key: 'bind',
          text: t(
            'Add the egg yolks and the sour cream and bring the dough together quickly, without kneading, until it is smooth and soft.',
            'Adaugă gălbenușurile și smântâna și leagă repede aluatul, fără să-l frământi, până devine neted și moale.',
          ),
        },
        {
          key: 'chill',
          text: t(
            'Divide the dough in two, one half a little larger than the other. Flatten each into a rectangle, wrap and chill for 30 minutes. Make the filling meanwhile.',
            'Împarte aluatul în două, o jumătate puțin mai mare decât cealaltă. Aplatizează fiecare bucată într-un dreptunghi, înfășoar-o în folie și ține-o la frigider 30 de minute. Între timp pregătește umplutura.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'grate',
          text: t(
            'Peel the apples, core them and grate them coarsely. Squeeze the grated apple in handfuls to get rid of the juice.',
            'Curăță merele de coajă și de cotor și dă-le pe răzătoarea mare. Storce merele rase câte un pumn, ca să scapi de zeamă.',
          ),
        },
        {
          key: 'cook-filling',
          text: t(
            'Put the apples in a wide pan with the 100 g of sugar for the filling and the cinnamon. Cook over medium heat for about 12 minutes, stirring often, until the juice has evaporated and the mixture is thick and dry, not wet.',
            'Pune merele într-o tigaie lată cu cele 100 g de zahăr pentru umplutură și cu scorțișoara. Gătește la foc mediu aproximativ 12 minute, amestecând des, până când zeama se evaporă, iar compoziția e groasă și uscată, nu apoasă.',
          ),
          timerSeconds: 720,
        },
        {
          key: 'cool-filling',
          text: t(
            'Spread the filling on a large plate or tray and let it cool completely, about 30 minutes. Warm filling would melt the butter in the dough.',
            'Întinde umplutura pe o farfurie mare sau pe o tavă și lasă-o să se răcească complet, aproximativ 30 de minute. Umplutura caldă ar topi untul din aluat.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'preheat',
          text: t(
            'Switch the oven on to 180 °C (160 °C fan). It needs about 15 minutes to heat fully, so roll out the dough meanwhile. Put the shelf in the middle.',
            'Pornește cuptorul la 180 °C (160 °C cu ventilator). Are nevoie de aproximativ 15 minute să se încălzească bine, așa că întinde aluatul între timp. Pune grătarul la mijloc.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'base',
          text: t(
            'Roll the larger piece of dough to about 5 mm between two sheets of baking paper, then lift it into a 25 × 35 cm tray lined with baking paper, letting it come 1 to 2 cm up the sides and patching any tears with your fingers. Prick it all over with a fork.',
            'Întinde bucata mai mare de aluat la aproximativ 5 mm între două foi de hârtie de copt, apoi pune-o într-o tavă de 25 × 35 cm tapetată cu hârtie de copt, lăsând-o să urce 1-2 cm pe marginile tăvii și lipind cu degetele eventualele crăpături. Înțeapă-o peste tot cu furculița.',
          ),
        },
        {
          key: 'layer',
          text: t(
            'Sprinkle the semolina over the base, then spread the cooled apple filling evenly and scatter the walnuts on top.',
            'Presară grișul peste foaia din tavă, apoi întinde uniform umplutura rece de mere și presară nucile deasupra.',
          ),
        },
        {
          key: 'lid',
          text: t(
            'Roll out the second piece of dough the same way, lay it over the filling and press the edges together. Prick the top all over with a fork so the steam can escape.',
            'Întinde la fel a doua bucată de aluat, așeaz-o peste umplutură și lipește marginile. Înțeapă foaia de deasupra peste tot cu furculița, ca aburul să poată ieși.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 35 minutes. It is done when the top is pale golden, a little darker at the edges, and the pastry is firm to the touch. Give it up to 5 minutes more if it is still pale.',
            'Coace 35 de minute. E gata când partea de sus e aurie-deschisă, puțin mai închisă la margini, iar aluatul e ferm la atingere. Mai ține-o până la 5 minute dacă e încă palidă.',
          ),
          timerSeconds: 2100,
        },
        {
          key: 'cool',
          text: t(
            'Leave the slice to cool completely in the tray, at least 1 hour. The pastry is fragile when warm and the filling sets as it cools.',
            'Lasă prăjitura să se răcească complet în tavă, cel puțin 1 oră. Aluatul e fragil cât e cald, iar umplutura se prinde pe măsură ce se răcește.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'cut',
          text: t(
            'Cut into 12 squares with a sharp knife and sift the icing sugar on top.',
            'Taie în 12 pătrate cu un cuțit ascuțit și cerne zahărul pudră deasupra.',
          ),
        },
      ],
      tips: [
        t(
          'Squeeze the grated apple well and cook the filling until dry: a wet filling soaks the pastry and the base turns doughy.',
          'Storce bine merele rase și gătește umplutura până se usucă: o umplutură apoasă înmoaie aluatul, iar foaia de jos rămâne păstoasă.',
        ),
        t(
          'Keep the egg whites: they keep for 2 days in a covered jar in the fridge, or freeze for later.',
          'Păstrează albușurile: țin 2 zile într-un borcan acoperit la frigider sau se pot congela pentru altă dată.',
        ),
        t(
          'Storage: once cool, cover the tray and keep it in the fridge for up to 4 days. Bring a slice to room temperature before serving.',
          'Păstrare: după ce s-a răcit, acoperă tava și ține prăjitura la frigider până la 4 zile. Scoate felia cu puțin timp înainte de servire, ca să ajungă la temperatura camerei.',
        ),
      ],
      stepTips: [
        {
          step: 'base',
          text: t(
            'If the dough is too soft to lift, chill the rolled sheet on its paper for 10 minutes, or press it into the tray with your fingers instead.',
            'Dacă aluatul e prea moale ca să-l ridici, ține foaia întinsă pe hârtie la frigider 10 minute sau întinde-l direct în tavă cu degetele.',
          ),
        },
      ],
      nutritionNote: t(
        'Apples bring some fibre, and the filling holds a lot of fruit for a cake. The shortcrust is made with butter, sour cream and sugar, so a slice is rich in saturated fat and sugar; cut small squares and keep the walnuts for their unsaturated fat.',
        'Merele aduc ceva fibre, iar umplutura conține multe fructe pentru o prăjitură. Aluatul fraged e făcut cu unt, smântână și zahăr, deci o felie conține multe grăsimi saturate și zahăr; taie pătrate mici și păstrează nucile, care aduc grăsimi nesaturate.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Cold milk', 'Un pahar de lapte rece'),
          reason: t(
            'Plain milk softens the cinnamon and the sweetness of the filling.',
            'Laptele simplu îmblânzește scorțișoara și dulceața umpluturii.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'milk',
        },
        {
          kind: 'drink',
          label: t('Hot tea', 'Ceai cald'),
          reason: t(
            'The slight bitterness of tea balances the buttery pastry and sweet apple.',
            'Amăreala ușoară a ceaiului echilibrează aluatul cu unt și mărul dulce.',
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
            'A square with coffee or tea, made the day before.',
            'Un pătrat cu cafea sau ceai, pregătit din ziua precedentă.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'The butter-rich pastry sits heavy in the stomach during exercise.',
            'Aluatul bogat în unt cade greu la stomac în timpul efortului.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A lot of sugar and butter right before bed.',
            'Mult zahăr și unt chiar înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
