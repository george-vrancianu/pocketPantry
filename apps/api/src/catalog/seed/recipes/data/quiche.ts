import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Quiche base is a broccoli and cheddar tart in bought shortcrust. Each
// Variant is a full Recipe with its own lines, steps and guidance; the base's
// Recipe-level Tips are inherited unless a Variant hides them.
export const quiche: BaseRecipeSeed = {
  slug: 'quiche',
  title: t('Broccoli and cheddar quiche', 'Quiche cu broccoli și cheddar'),
  servings: 6,
  prepMinutes: 45,
  cookMinutes: 75,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'shortcrust-pastry',
      quantity: 300,
      unit: 'g',
      note: t('ready-made, chilled', 'gata făcut, de la frigider'),
    },
    {
      ingredient: 'flour',
      quantity: 10,
      unit: 'g',
      note: t('for rolling', 'pentru întins'),
    },
    {
      ingredient: 'broccoli',
      quantity: 250,
      unit: 'g',
      note: t('cut into small florets', 'tăiat în buchete mici'),
    },
    {
      ingredient: 'onion',
      quantity: 1,
      unit: 'pcs',
      optional: true,
      note: t('small, finely chopped', 'mică, tocată mărunt'),
    },
    {
      ingredient: 'butter',
      quantity: 15,
      unit: 'g',
      optional: true,
      note: t('for the onion', 'pentru ceapă'),
    },
    {
      ingredient: 'cheddar',
      quantity: 120,
      unit: 'g',
      note: t('grated', 'dat pe răzătoare'),
    },
    { ingredient: 'eggs', quantity: 3, unit: 'pcs' },
    { ingredient: 'whipping-cream', quantity: 150, unit: 'ml' },
    { ingredient: 'milk', quantity: 0.15, unit: 'l' },
    { ingredient: 'nutmeg', quantity: 0.5, unit: 'g' },
    {
      ingredient: 'thyme',
      quantity: 2,
      unit: 'g',
      optional: true,
      note: t('leaves only', 'doar frunzele'),
    },
    { ingredient: 'salt', quantity: 2, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
  ],
  steps: [
    {
      key: 'line',
      text: t(
        'Dust the worktop with the flour and roll the pastry out to a round about 3 mm thick and about 34 cm across, large enough to cover the base and sides with a little overhang. Lift it into a 23 cm tart tin with 3 to 4 cm sides, press it into the corners and leave a little overhang. Prick the base all over with a fork.',
        'Presară puțină făină pe masa de lucru și întinde aluatul într-un cerc gros de aproximativ 3 mm și lat de aproximativ 34 cm, suficient cât să acopere fundul și marginile, cu puțin aluat peste margine. Așază-l într-o formă de tartă de 23 cm, cu margini de 3-4 cm, apasă-l bine în colțuri și lasă puțin aluat peste margine. Înțeapă fundul cu furculița.',
      ),
    },
    {
      key: 'chill',
      text: t(
        'Chill the lined tin for 30 minutes. Meanwhile heat the oven to 200 °C with a baking tray on the middle shelf.',
        'Pune forma căptușită la frigider 30 de minute. Între timp, încălzește cuptorul la 200 °C, cu o tavă pe raftul de mijloc.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'blind-bake',
      text: t(
        'Press a sheet of crumpled baking paper into the case and fill it to the rim with pastry weights: ceramic baking beans, dried pulses or uncooked rice. Set the tin on the hot tray and bake for 15 minutes, until the rim looks set and pale gold. Do the next two steps while it bakes.',
        'Apasă în formă o foaie boțită de hârtie de copt și umple-o până sus cu greutăți pentru aluat: bile ceramice pentru copt, fasole uscată sau orez crud. Pune forma pe tava fierbinte și coace 15 minute, până când marginea pare întărită și ușor aurie. Fă următorii doi pași cât timp se coace.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'blanch',
      text: t(
        'Bring a pan of water to the boil and cook the broccoli florets for 2 minutes. Drain well, then spread them on a clean tea towel and pat them dry.',
        'Adu la fierbere o oală cu apă și gătește buchețelele de broccoli 2 minute. Scurge-le bine, apoi întinde-le pe un prosop curat de bucătărie și tamponează-le ca să se usuce.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'onion',
      text: t(
        'Melt the butter in a small pan over medium-low heat and cook the onion for about 5 minutes, stirring, until soft and translucent but not brown. Leave it to cool a little.',
        'Topește untul într-o tigaie mică la foc mic-mediu și călește ceapa aproximativ 5 minute, amestecând, până se înmoaie și devine translucidă, fără să se rumenească. Las-o să se răcească puțin.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'bare-bake',
      text: t(
        'Lift the paper and weights out by the corners. Return the case to the oven for another 10 minutes, until the base looks dry and pale golden. Take the case out, still on its tray, and turn the oven down to 180 °C.',
        'Ridică hârtia cu greutățile, ținând-o de colțuri. Pune forma înapoi în cuptor încă 10 minute, până când fundul pare uscat și ușor auriu. Scoate forma, încă pe tavă, și scade cuptorul la 180 °C.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'custard',
      text: t(
        'Whisk the eggs with the cream, milk, nutmeg, salt, pepper and the thyme leaves, if using, until smooth. Do not whisk in air: stir rather than beat.',
        'Bate ouăle cu frișca, laptele, nucșoara, sarea, piperul și frunzele de cimbrișor, dacă folosești, până se omogenizează. Nu încorpora aer: amestecă, nu bate energic.',
      ),
    },
    {
      key: 'fill',
      text: t(
        'Scatter the onion, broccoli and cheddar over the hot case on its tray, pour in the custard, then slide the tray into the oven.',
        'Presară ceapa, broccoli și cheddarul peste aluatul încă fierbinte, aflat pe tavă, toarnă crema, apoi bagă tava în cuptor.',
      ),
    },
    {
      key: 'bake',
      text: t(
        'Bake for 30 minutes, then check. It is done when the top is golden, the edge is firm and the very centre still wobbles slightly when you nudge the tin, and a thermometer in the centre reads 71 °C. If the centre still ripples like liquid, give it up to 5 more minutes.',
        'Coace 30 de minute, apoi verifică. E gata când suprafața e aurie, marginea e fermă, iar chiar centrul mai tremură ușor când miști forma, și un termometru înfipt în centru arată 71 °C. Dacă centrul se unduiește încă precum un lichid, mai lasă până la 5 minute.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'rest',
      text: t(
        'Leave the quiche in the tin for 10 minutes so the custard firms up, then trim any overhanging pastry and lift it out. Serve warm or at room temperature.',
        'Lasă quiche-ul în formă 10 minute, ca să se întărească crema, apoi taie aluatul care iese peste margine și scoate tarta din formă. Servește-o caldă sau la temperatura camerei.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'store',
      text: t(
        'Get leftovers into the fridge within 2 hours, covered. Keep up to 3 days and reheat slices until hot all the way through.',
        'Pune resturile la frigider în maximum 2 ore, acoperite. Se păstrează până la 3 zile; încălzește feliile până sunt fierbinți și în mijloc.',
      ),
    },
  ],
  tips: [
    t(
      'Pastry shrinks as it bakes, so leave the overhang on until after the quiche is baked and trim it then.',
      'Aluatul se strânge la copt, așa că lasă marginea care iese peste formă până după coacere și taie-o atunci.',
    ),
    t(
      'Keep every filling ingredient dry: water from vegetables or fat from meat seeps into the custard and leaves a soggy base and a weepy slice.',
      'Ține toate ingredientele din umplutură uscate: apa din legume sau grăsimea din carne se scurge în cremă și lasă un fund moale și felii care lasă apă.',
    ),
  ],
  stepTips: [
    {
      step: 'blind-bake',
      text: t(
        'Fill the weights right up the sides, not just the base: the walls slump if they are unsupported.',
        'Umple cu greutăți și pe lângă pereți, nu doar fundul: pereții se prăbușesc dacă nu au sprijin.',
      ),
    },
    {
      step: 'bake',
      text: t(
        'Take it out while the centre still wobbles: the heat in the tin finishes the set. Baked firm all over, the custard turns rubbery and weeps.',
        'Scoate tarta cât centrul mai tremură: căldura din formă termină închegarea. Coaptă ferm peste tot, crema devine cauciucată și lasă apă.',
      ),
    },
  ],
  nutritionNote: t(
    'Eggs, cheese and milk give protein and calcium, and the broccoli adds some fibre, though a slice holds only a little. The pastry, butter, cream and cheddar bring plenty of saturated fat, and the cheddar adds salt, so keep added salt low and serve it with a large salad.',
    'Ouăle, brânza și laptele aduc proteine și calciu, iar broccoli adaugă ceva fibre, deși o felie conține puține. Aluatul, untul, frișca și cheddarul aduc multe grăsimi saturate, iar cheddarul adaugă sare, așa că folosește cât mai puțină sare și servește tarta cu o salată mare.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Green salad', 'Salată verde'),
      reason: t(
        'Crisp leaves with a sharp dressing cut the richness of the custard and pastry.',
        'Frunzele crocante cu un sos de salată acrișor taie bogăția cremei și a aluatului.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'lettuce',
    },
    {
      kind: 'food',
      label: t('Cherry tomatoes', 'Roșii cherry'),
      reason: t(
        'Their sweet acidity brightens a rich, creamy slice.',
        'Aciditatea lor dulceagă înviorează o felie bogată și cremoasă.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'cherry-tomato',
    },
  ],
  eatingMoments: [
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'A slice with a salad is a filling lunch that is just as good cold.',
        'O felie cu salată e un prânz săturător, la fel de bun și rece.',
      ),
    },
    {
      moment: 'brunch',
      polarity: 'good_for',
      reason: t(
        'It can be baked ahead and served warm or at room temperature.',
        'Se poate coace dinainte și se servește caldă sau la temperatura camerei.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Pastry, cream and cheese sit heavy late at night.',
        'Aluatul, frișca și brânza cad greu seara târziu.',
      ),
    },
  ],
  variants: [
    {
      slug: 'quiche-french',
      cuisine: 'french',
      title: t(
        'Quiche lorraine',
        'Quiche lorraine (tartă franțuzească cu bacon și cremă de ouă)',
      ),
      servings: 6,
      prepMinutes: 70,
      cookMinutes: 75,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'flour',
          quantity: 210,
          unit: 'g',
          note: t(
            '200 g for the pastry, 10 g for rolling',
            '200 g pentru aluat, 10 g pentru întins',
          ),
        },
        {
          ingredient: 'butter',
          quantity: 100,
          unit: 'g',
          note: t('cold, diced', 'rece, tăiat cubulețe'),
        },
        {
          ingredient: 'eggs',
          key: 'pastry-egg',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'separated: the yolk goes in the pastry, the white seals the case',
            'separat: gălbenușul intră în aluat, albușul sigilează tarta',
          ),
        },
        {
          ingredient: 'still-water',
          quantity: 0.04,
          unit: 'l',
          note: t('iced', 'foarte rece'),
        },
        {
          ingredient: 'salt',
          key: 'salt-pastry',
          quantity: 2,
          unit: 'g',
          note: t('for the pastry', 'pentru aluat'),
        },
        {
          ingredient: 'bacon',
          quantity: 200,
          unit: 'g',
          note: t(
            'smoked streaky, cut into 1 cm lardons',
            'afumat, cu grăsime, tăiat în bastonașe de 1 cm',
          ),
        },
        {
          ingredient: 'eggs',
          key: 'custard-eggs',
          quantity: 3,
          unit: 'pcs',
          note: t('for the custard', 'pentru cremă'),
        },
        { ingredient: 'whipping-cream', quantity: 200, unit: 'ml' },
        { ingredient: 'milk', quantity: 0.15, unit: 'l' },
        { ingredient: 'nutmeg', quantity: 0.5, unit: 'g' },
        {
          ingredient: 'salt',
          key: 'salt-custard',
          quantity: 1,
          unit: 'g',
          note: t('for the custard', 'pentru cremă'),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'rub',
          text: t(
            'Put 200 g of the flour and the pastry salt in a bowl. Add the cold butter and rub it in with your fingertips for about 5 minutes, until the mixture looks like coarse crumbs with a few pea-sized bits of butter left.',
            'Pune în bol 200 g din făină și sarea pentru aluat. Adaugă untul rece și freacă-l cu vârful degetelor aproximativ 5 minute, până când amestecul arată ca niște firimituri grosiere, cu câteva bucățele de unt cât un bob de mazăre.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'bind',
          text: t(
            'Separate the egg; keep the white. Mix the yolk with the iced water, stir it into the crumbs with a knife and press the dough into a disc without kneading. Wrap it and chill for 30 minutes.',
            'Separă oul și păstrează albușul. Amestecă gălbenușul cu apa foarte rece, adaugă-l peste firimituri cu un cuțit și presează aluatul într-un disc, fără să-l frămânți. Înfoliază-l și pune-l la frigider 30 de minute.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'line',
          text: t(
            'Dust the worktop with the remaining 10 g of flour and roll the dough to a round about 3 mm thick. Line a 23 cm tart tin with 3 to 4 cm sides, press it into the corners, leave a little overhang and prick the base with a fork. Chill for 20 minutes while the oven heats to 200 °C with a baking tray on the middle shelf.',
            'Presară masa de lucru cu cele 10 g de făină rămase și întinde aluatul într-un cerc gros de aproximativ 3 mm. Căptușește o formă de tartă de 23 cm, cu margini de 3-4 cm, apasă-l în colțuri, lasă puțin aluat peste margine și înțeapă fundul cu furculița. Ține la frigider 20 de minute, cât cuptorul se încălzește la 200 °C, cu o tavă pe raftul de mijloc.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'blind-bake',
          text: t(
            'Press a sheet of crumpled baking paper into the case and fill it to the rim with pastry weights: ceramic baking beans, dried pulses or uncooked rice. Set the tin on the hot tray and bake for 15 minutes, until the rim looks set and pale gold. Cook the bacon in the next step while it bakes.',
            'Apasă în formă o foaie boțită de hârtie de copt și umple-o până sus cu greutăți pentru aluat: bile ceramice pentru copt, fasole uscată sau orez crud. Pune forma pe tava fierbinte și coace 15 minute, până când marginea pare întărită și ușor aurie. Gătește baconul în pasul următor cât timp se coace.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'lardons',
          text: t(
            'Put the lardons in a cold dry frying pan over medium-low heat and cook for about 8 minutes, stirring, until the fat runs and the pieces are golden at the edges but not crisp. Lift them onto kitchen paper to drain. Wash your hands, the board and the knife after handling the raw bacon.',
            'Pune bastonașele de bacon într-o tigaie rece și uscată, la foc mic-mediu, și gătește-le aproximativ 8 minute, amestecând, până când se topește grăsimea, iar bucățile sunt aurii la margini, dar nu crocante. Scoate-le pe hârtie de bucătărie, să se scurgă. Spală-ți mâinile, tocătorul și cuțitul după ce ai atins baconul crud.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'bare-bake',
          text: t(
            'Lift the paper and weights out by the corners. Return the case to the oven for another 10 minutes, until the base looks dry and pale golden.',
            'Ridică hârtia cu greutățile, ținând-o de colțuri. Pune forma înapoi în cuptor încă 10 minute, până când fundul pare uscat și ușor auriu.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'seal',
          text: t(
            'Whisk the egg white lightly and brush a thin coat over the hot base and sides. Bake for 2 more minutes to seal the pastry, then take the case out, still on its tray, and turn the oven down to 180 °C. Keep the rest of the white for the custard.',
            'Bate ușor albușul și pensulează un strat subțire peste fundul și marginile fierbinți. Mai coace 2 minute, ca să se sigileze aluatul, apoi scoate forma, încă pe tavă, și scade cuptorul la 180 °C. Păstrează restul albușului pentru cremă.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'custard',
          text: t(
            'Stir the 3 eggs and any leftover white with the cream, milk, nutmeg, custard salt and pepper until smooth, without whisking in air.',
            'Amestecă cele 3 ouă și albușul rămas cu frișca, laptele, nucșoara, sarea pentru cremă și piperul până se omogenizează, fără să încorporezi aer.',
          ),
        },
        {
          key: 'fill',
          text: t(
            'Scatter the lardons over the hot case on its tray, pour in the custard, then slide the tray into the oven.',
            'Presară bastonașele de bacon peste aluatul încă fierbinte, aflat pe tavă, toarnă crema, apoi bagă tava în cuptor.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 30 minutes, then check. It is done when the top is golden, the edge is firm and the very centre still wobbles slightly when you nudge the tin, and a thermometer in the centre reads 71 °C. If the centre still ripples like liquid, give it up to 5 more minutes.',
            'Coace 30 de minute, apoi verifică. E gata când suprafața e aurie, marginea e fermă, iar chiar centrul mai tremură ușor când miști forma, și un termometru înfipt în centru arată 71 °C. Dacă centrul se unduiește încă precum un lichid, mai lasă până la 5 minute.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'rest',
          text: t(
            'Leave the quiche in the tin for 10 minutes, then trim the overhanging pastry and lift it out. Serve warm or at room temperature.',
            'Lasă quiche-ul în formă 10 minute, apoi taie aluatul care iese peste margine și scoate tarta din formă. Servește-o caldă sau la temperatura camerei.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'store',
          text: t(
            'Get leftovers into the fridge within 2 hours, covered. Keep up to 3 days and reheat slices until hot all the way through.',
            'Pune resturile la frigider în maximum 2 ore, acoperite. Se păstrează până la 3 zile; încălzește feliile până sunt fierbinți și în mijloc.',
          ),
        },
      ],
      tips: [
        t(
          'Cook the lardons only until golden, not crisp: they bake a second time in the custard and crisp pieces turn hard.',
          'Gătește baconul doar până se aurește, nu până devine crocant: se coace încă o dată în cremă, iar bucățile crocante devin tari.',
        ),
        t(
          'Many cooks add about 60 g of grated Gruyère over the lardons. It is not needed, but it makes a richer, nuttier tart.',
          'Mulți adaugă circa 60 g de Gruyère ras peste bacon. Nu e obligatoriu, dar tarta iese mai bogată și cu gust de nucă.',
        ),
      ],
      stepTips: [
        {
          step: 'bind',
          text: t(
            'Handle the dough as little as you can: warm hands melt the butter and the pastry turns tough instead of short.',
            'Atinge aluatul cât mai puțin: mâinile calde topesc untul, iar aluatul iese tare, nu fraged.',
          ),
        },
      ],
      nutritionNote: t(
        'Eggs, cream and milk give protein and calcium. The bacon, butter pastry and cream bring a lot of saturated fat, and the bacon adds salt. With no vegetables inside, the tart has little fibre, so serve it with a big green salad.',
        'Ouăle, frișca și laptele aduc proteine și calciu. Baconul, aluatul cu unt și frișca aduc multe grăsimi saturate, iar baconul adaugă sare. Fără legume în umplutură, tarta are puține fibre, așa că servește-o cu o salată verde mare.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t(
            'Green salad with a mustard vinaigrette',
            'Salată verde cu vinegretă de muștar',
          ),
          reason: t(
            'Crisp leaves in a sharp mustard vinaigrette cut through the rich custard and bacon.',
            'Frunzele crocante cu vinegretă de muștar taie bogăția cremei și a baconului.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'lettuce',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'A crisp, dry white, such as a Pinot Blanc from Alsace, has the acidity to refresh the palate after cream and smoked bacon.',
            'Un vin alb sec și proaspăt, precum un Pinot Blanc din Alsacia, are aciditatea care împrospătează gustul după frișcă și bacon afumat.',
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
            'A small slice with a salad is satisfying and just as good lukewarm.',
            'O felie mică cu salată e săturătoare și la fel de bună căldicică.',
          ),
        },
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'Bake it ahead and serve it at room temperature.',
            'O poți coace dinainte și servi la temperatura camerei.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Bacon, cream and pastry make a heavy late meal.',
            'Baconul, frișca și aluatul fac o masă grea seara târziu.',
          ),
        },
      ],
    },
    {
      slug: 'quiche-german',
      cuisine: 'german',
      hideBaseTips: [0, 1],
      title: t(
        'Zwiebelkuchen (German onion and bacon tart)',
        'Zwiebelkuchen (plăcintă germană cu ceapă și bacon)',
      ),
      servings: 8,
      prepMinutes: 100,
      cookMinutes: 50,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'flour',
          quantity: 320,
          unit: 'g',
          note: t(
            '300 g for the dough, 20 g for dusting',
            '300 g pentru aluat, 20 g pentru presărat',
          ),
        },
        {
          ingredient: 'dry-yeast',
          quantity: 7,
          unit: 'g',
          note: t('instant', 'instant'),
        },
        { ingredient: 'sugar', quantity: 5, unit: 'g' },
        {
          ingredient: 'salt',
          key: 'salt-dough',
          quantity: 3,
          unit: 'g',
          note: t('for the dough', 'pentru aluat'),
        },
        {
          ingredient: 'milk',
          quantity: 0.15,
          unit: 'l',
          note: t('lukewarm', 'călduț'),
        },
        {
          ingredient: 'butter',
          key: 'butter-dough',
          quantity: 50,
          unit: 'g',
          note: t('soft, for the dough', 'moale, pentru aluat'),
        },
        {
          ingredient: 'onion',
          quantity: 8,
          unit: 'pcs',
          note: t(
            'about 1 kg in all, halved and thinly sliced',
            'aproximativ 1 kg în total, tăiate în jumătăți și felii subțiri',
          ),
        },
        {
          ingredient: 'bacon',
          quantity: 150,
          unit: 'g',
          note: t('smoked, diced', 'afumat, tăiat cubulețe'),
        },
        {
          ingredient: 'butter',
          key: 'butter-filling',
          quantity: 40,
          unit: 'g',
          note: t('for the onions', 'pentru ceapă'),
        },
        { ingredient: 'eggs', quantity: 3, unit: 'pcs' },
        { ingredient: 'sour-cream', quantity: 200, unit: 'g' },
        { ingredient: 'caraway-seeds', quantity: 3, unit: 'g' },
        {
          ingredient: 'salt',
          key: 'salt-filling',
          quantity: 3,
          unit: 'g',
          note: t('for the filling', 'pentru umplutură'),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'dough',
          text: t(
            'Mix 300 g of the flour with the yeast, sugar and dough salt in a large bowl. Add the lukewarm milk, which should feel barely warm on your finger, and the soft butter, and stir to a rough dough.',
            'Amestecă 300 g din făină cu drojdia, zahărul și sarea pentru aluat într-un castron mare. Adaugă laptele călduț, care trebuie să se simtă abia cald pe deget, și untul moale și amestecă până obții un aluat neregulat.',
          ),
        },
        {
          key: 'knead',
          text: t(
            'Knead on the worktop, dusting with a little of the remaining flour only if it sticks, for about 8 minutes, until smooth and springy.',
            'Frământă pe blat, presărând puțină din făina rămasă doar dacă se lipește, aproximativ 8 minute, până când aluatul e neted și elastic.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'rise',
          text: t(
            'Put the dough in a clean bowl, cover it and leave it in a warm place for 1 hour, until doubled in size. Cook the filling during this time.',
            'Pune aluatul într-un castron curat, acoperă-l și lasă-l într-un loc cald 1 oră, până își dublează volumul. Gătește umplutura în acest timp.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'bacon',
          text: t(
            'Melt the filling butter in a wide, heavy pan over medium heat, add the bacon and cook for about 5 minutes, stirring, until the fat runs and the bacon is just golden. Wash your hands, the board and the knife after handling the raw bacon.',
            'Topește untul pentru umplutură într-o tigaie lată și grea, la foc mediu, adaugă baconul și gătește aproximativ 5 minute, amestecând, până se topește grăsimea, iar baconul e abia auriu. Spală-ți mâinile, tocătorul și cuțitul după ce ai atins baconul crud.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'onions',
          text: t(
            'Add the sliced onions, cover and cook over low heat for 15 minutes, stirring now and then, until they are soft and have given off their water.',
            'Adaugă ceapa tăiată felii, acoperă și gătește la foc mic 15 minute, amestecând din când în când, până când ceapa se înmoaie și își lasă apa.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'reduce',
          text: t(
            'Uncover, raise the heat to medium and cook for 15 more minutes, stirring often, until the liquid has gone and the onions are pale gold, not brown. Tip them into a sieve, press out any liquid and leave them to cool until lukewarm. Switch the oven on to 200 °C now.',
            'Descoperă, mărește focul la mediu și gătește încă 15 minute, amestecând des, până când lichidul dispare, iar ceapa e de un auriu pal, nu brună. Pune ceapa într-o strecurătoare, stoarce lichidul rămas și lasă-o să se răcească până e căldicică. Pornește acum cuptorul la 200 °C.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'shape',
          text: t(
            'Line a 30 by 40 cm baking tray with baking paper. Roll the risen dough out to fit, press it up the sides by about 1 cm and prick the base. Cover it and leave it for 15 minutes while the oven finishes heating.',
            'Căptușește o tavă de copt de 30 pe 40 cm cu hârtie de copt. Întinde aluatul crescut ca să acopere tava, ridică-l pe margini cu aproximativ 1 cm și înțeapă fundul. Acoper-o și las-o 15 minute, cât timp cuptorul termină de încălzit.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'bind',
          text: t(
            'Beat the eggs with the sour cream, caraway, filling salt and pepper. Stir this into the lukewarm onions: if they are hot, the eggs will scramble. Do not taste the mixture, as it contains raw egg.',
            'Bate ouăle cu smântâna, chimenul, sarea pentru umplutură și piperul. Amestecă totul cu ceapa căldicică: dacă e fierbinte, ouăle se taie. Nu gusta compoziția, fiindcă are ou crud.',
          ),
        },
        {
          key: 'fill',
          text: t(
            'Spread the onion mixture evenly over the dough, leaving the raised edge clear.',
            'Întinde uniform compoziția de ceapă peste aluat, lăsând marginea ridicată liberă.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 30 minutes, then check. It is done when the dough edge is golden, the onions have golden-brown flecks, the filling no longer wobbles in the centre and a thermometer reads 71 °C there. If it is pale, give it up to 5 more minutes.',
            'Coace 30 de minute, apoi verifică. E gata când marginea aluatului e aurie, ceapa are pete auriu-brune, umplutura nu mai tremură în centru, iar un termometru arată acolo 71 °C. Dacă e încă palidă, mai lasă până la 5 minute.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'rest',
          text: t(
            'Rest the tray for 10 minutes, then cut into squares. Serve warm.',
            'Lasă tava să se odihnească 10 minute, apoi taie plăcinta în pătrate. Servește caldă.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'store',
          text: t(
            'Get leftovers into the fridge within 2 hours, covered. Keep up to 3 days and reheat in a 180 °C oven until hot all the way through.',
            'Pune resturile la frigider în maximum 2 ore, acoperite. Se păstrează până la 3 zile; încălzește-le în cuptor la 180 °C până sunt fierbinți și în mijloc.',
          ),
        },
      ],
      tips: [
        t(
          'Stew the onions gently. Browned onions turn bitter and dark, and the tart should taste sweet and mellow.',
          'Înăbușă ceapa la foc mic. Ceapa rumenită devine amară și închisă la culoare, iar plăcinta trebuie să aibă gust dulceag și blând.',
        ),
      ],
      stepTips: [
        {
          step: 'rise',
          text: t(
            'A warm spot can be the oven switched off with the light on. The dough has risen enough when a finger pressed in leaves a dent that springs back slowly.',
            'Un loc cald poate fi cuptorul oprit, cu lumina aprinsă. Aluatul a crescut destul când o apăsare cu degetul lasă o urmă care revine încet.',
          ),
        },
      ],
      nutritionNote: t(
        'The onions add fibre and sweetness, and the eggs and sour cream give protein. The white flour dough, butter, bacon and sour cream bring saturated fat, and the bacon adds salt, so use little extra salt and serve it with a fresh, sharp salad.',
        'Ceapa adaugă fibre și dulceață, iar ouăle și smântâna aduc proteine. Aluatul din făină albă, untul, baconul și smântâna aduc grăsimi saturate, iar baconul adaugă sare, așa că adaugă cât mai puțină sare în plus și servește plăcinta cu o salată proaspătă și acrișoară.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Green salad', 'Salată verde'),
          reason: t(
            'A crisp salad with a sharp dressing offsets the sweet, rich onion filling.',
            'O salată crocantă cu un sos de salată acrișor echilibrează umplutura dulce și bogată de ceapă.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'lettuce',
        },
        {
          kind: 'food',
          label: t('Pickled cucumbers', 'Castraveți murați'),
          reason: t(
            'Their sour crunch contrasts with the soft, sweet onions.',
            'Acrul lor crocant contrastează cu ceapa moale și dulce.',
          ),
          principle: 'contrast_texture',
          ingredient: 'pickled-cucumbers',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its acidity refreshes the palate against the sweet onion and smoky bacon.',
            'Aciditatea lui împrospătează gustul după ceapa dulce și baconul afumat.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'white-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Served warm, it is a comforting meal when it is cold outside.',
            'Servită caldă, e o masă reconfortantă când e frig afară.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'A square with a salad makes a simple lunch.',
            'Un pătrat cu salată face un prânz simplu.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Dough, onions and bacon are heavy before bed.',
            'Aluatul, ceapa și baconul cad greu înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
