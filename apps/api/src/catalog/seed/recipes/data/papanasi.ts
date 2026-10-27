import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Papanasi base is the pan-fried version: a soft brânză de vaci dough shaped
// into a ring and a small ball, served with smântână and dulceață. Each Variant is
// a full Recipe with its own lines, steps and guidance; the base's Recipe-level
// Tips are inherited unless hidden.
export const papanasi: BaseRecipeSeed = {
  slug: 'papanasi',
  title: t(
    'Papanași (Romanian cheese doughnuts with sour cream and jam)',
    'Papanași prăjiți cu smântână și dulceață',
  ),
  servings: 4,
  prepMinutes: 40,
  cookMinutes: 33,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'cottage-cheese',
      quantity: 500,
      unit: 'g',
      note: t(
        'dry, crumbly, well drained',
        'uscată, sfărâmicioasă, bine scursă',
      ),
    },
    { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
    { ingredient: 'sugar', quantity: 50, unit: 'g' },
    { ingredient: 'vanilla-sugar', quantity: 8, unit: 'g' },
    {
      ingredient: 'lemon',
      quantity: 0.5,
      unit: 'pcs',
      note: t('zest only, finely grated', 'doar coaja, rasă fin'),
    },
    { ingredient: 'salt', quantity: 1, unit: 'g' },
    {
      ingredient: 'flour',
      quantity: 180,
      unit: 'g',
      note: t(
        'keep a few spoonfuls aside for dusting',
        'păstrează câteva linguri pentru pudrat',
      ),
    },
    { ingredient: 'semolina', quantity: 40, unit: 'g', optional: true },
    { ingredient: 'baking-soda', quantity: 2, unit: 'g' },
    {
      ingredient: 'sunflower-oil',
      quantity: 800,
      unit: 'ml',
      note: t(
        'for frying, about 2 cm deep',
        'pentru prăjit, în strat de circa 2 cm',
      ),
    },
    { ingredient: 'sour-cream', quantity: 200, unit: 'g' },
    {
      ingredient: 'jam',
      quantity: 160,
      unit: 'g',
      note: t('sour cherry or blueberry', 'de vișine sau de afine'),
    },
    { ingredient: 'icing-sugar', quantity: 10, unit: 'g', optional: true },
  ],
  steps: [
    {
      key: 'mix',
      text: t(
        'Mash the cheese with a fork in a large bowl until no big lumps remain. Add the eggs, sugar, vanilla sugar, lemon zest and salt and stir until smooth.',
        'Zdrobește brânza cu furculița într-un castron mare, până nu mai rămân bucăți mari. Adaugă ouăle, zahărul, zahărul vanilat, coaja de lămâie și sarea și amestecă până se omogenizează.',
      ),
    },
    {
      key: 'flour',
      text: t(
        'Mix the flour with the baking soda and the semolina, if using, add to the bowl and stir with a spoon just until you have a soft dough that holds its shape. It should be sticky, not runny. Do not taste it: it contains raw egg.',
        'Amestecă făina cu bicarbonatul și cu grișul, dacă îl folosești, adaugă-le în castron și amestecă cu lingura doar până obții un aluat moale, care își ține forma. Trebuie să fie lipicios, nu curgător. Nu-l gusta: conține ou crud.',
      ),
    },
    {
      key: 'rest',
      text: t(
        'Cover the bowl and leave the dough to rest for 15 minutes, so the flour and semolina swell and the dough becomes easier to handle.',
        'Acoperă castronul și lasă aluatul la odihnit 15 minute, ca făina și grișul să se umfle, iar aluatul să fie mai ușor de lucrat.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'shape',
      text: t(
        'Dust the counter and your hands with flour. Divide the dough into 4 pieces of about 150 g and 4 pieces of about 50 g. Pat each large piece into a 2 cm thick disc, press a hole of about 3 cm through the middle with a floured finger and widen it into a ring. Roll the small pieces into balls.',
        'Presară blatul și mâinile cu făină. Împarte aluatul în 4 bucăți de circa 150 g și 4 bucăți de circa 50 g. Aplatizează fiecare bucată mare într-un disc gros de 2 cm, apasă cu degetul înfăinat o gaură de circa 3 cm în mijloc și lărgește-o într-un inel. Fă bile din bucățile mici.',
      ),
    },
    {
      key: 'heat-oil',
      text: t(
        'Pour the oil into a heavy pot about 24 cm wide, so it is about 2 cm deep and comes no more than a third of the way up the sides, and heat over medium heat to about 165 °C. With no thermometer, drop in a pinch of dough: it should sizzle and rise within a few seconds and turn golden in about a minute. Stay by the pot.',
        'Toarnă uleiul într-o oală groasă, de circa 24 cm, astfel încât să fie înalt de circa 2 cm și să ajungă cel mult la o treime din înălțimea oalei, și încălzește-l la foc mediu la circa 165 °C. Dacă nu ai termometru, aruncă o bucățică de aluat: trebuie să sfârâie, să urce la suprafață în câteva secunde și să se rumenească în circa un minut. Nu pleca de lângă oală.',
      ),
    },
    {
      key: 'fry-rings',
      text: t(
        'Slide 2 rings into the oil with a slotted spoon, tilting them away from you. Fry 3 to 4 minutes per side over medium heat, turning once, until deep golden all over. Lift them out onto a rack or paper towels.',
        'Pune cu grijă 2 inele în ulei cu o spumieră, lăsându-le să alunece dinspre tine. Prăjește-le 3-4 minute pe fiecare parte la foc mediu, întorcându-le o dată, până se rumenesc bine peste tot. Scoate-le pe un grătar sau pe șervețele de hârtie.',
      ),
      timerSeconds: 420,
    },
    {
      key: 'check',
      text: t(
        'Check that the first batch is cooked through: push a toothpick into the thickest part of one ring. It must come out dry, with no wet dough on it. If it is wet, return the ring to the oil over lower heat for a couple of minutes more, and fry the next batch over lower heat from the start.',
        'Verifică dacă prima serie s-a copt în interior: înfige o scobitoare în partea cea mai groasă a unui inel. Trebuie să iasă uscată, fără aluat lipit. Dacă iese umedă, pune inelul înapoi în ulei, la foc mai mic, încă vreo două minute, și prăjește-le pe următoarele de la început la foc mai mic.',
      ),
    },
    {
      key: 'fry-rings-2',
      text: t(
        'Fry the other 2 rings the same way, 3 to 4 minutes per side, and lift them out.',
        'Prăjește la fel celelalte 2 inele, 3-4 minute pe fiecare parte, și scoate-le.',
      ),
      timerSeconds: 420,
    },
    {
      key: 'fry-balls',
      text: t(
        'Fry the 4 small balls together for 4 to 5 minutes, turning them, until deep golden, then drain them. Check one is cooked through: push a toothpick into the middle, and it must come out dry, with no wet dough. If it is wet, return the balls to the oil over lower heat for a couple of minutes more.',
        'Prăjește cele 4 bile mici împreună 4-5 minute, întorcându-le, până se rumenesc bine, apoi scurge-le. Verifică dacă s-au copt în interior: înfige o scobitoare în mijlocul unei bile, iar ea trebuie să iasă uscată, fără aluat lipit. Dacă iese umedă, pune bilele înapoi în ulei, la foc mai mic, încă vreo două minute.',
      ),
      timerSeconds: 270,
    },
    {
      key: 'serve',
      text: t(
        'Put each ring on a plate while still hot, top with a generous spoonful of sour cream, then the jam, and set a ball on top. Dust with icing sugar if you like and serve at once.',
        'Pune fiecare inel pe farfurie cât e fierbinte, adaugă deasupra o lingură generoasă de smântână, apoi dulceața, și așază o bilă deasupra. Pudrează cu zahăr pudră, dacă vrei, și servește imediat.',
      ),
    },
  ],
  tips: [
    t(
      'If the cheese looks wet or weeps when pressed, drain it in a cloth-lined sieve in the fridge for an hour first. Wet cheese needs more flour, and more flour means heavy, dense results.',
      'Dacă brânza pare udă sau lasă zer când o strângi, scurge-o o oră la frigider într-o sită căptușită cu tifon. Brânza udă cere mai multă făină, iar mai multă făină înseamnă un aluat greu și compact.',
    ),
    t(
      'Eat them straight from the pan: the crust is at its crispest in the first minutes and softens as it cools.',
      'Mănâncă-i direct din tigaie sau oală: crusta e cea mai crocantă în primele minute și se înmoaie pe măsură ce se răcește.',
    ),
    t(
      'A sour jam, such as vișine or afine, balances the sweet dough and the sour cream better than a very sweet one.',
      'O dulceață acrișoară, de vișine sau de afine, echilibrează mai bine aluatul dulce și smântâna decât una foarte dulce.',
    ),
  ],
  stepTips: [
    {
      step: 'heat-oil',
      text: t(
        'Keep a lid that fits the pot within reach. If the oil ever catches fire, turn off the heat and slide the lid on; never pour water on hot oil. Let the used oil cool completely before you strain or discard it.',
        'Ține la îndemână un capac potrivit oalei. Dacă uleiul ia foc, oprește focul și pune capacul; nu turna niciodată apă peste ulei încins. Lasă uleiul folosit să se răcească complet înainte să-l strecori sau să-l arunci.',
      ),
    },
    {
      step: 'fry-rings',
      text: t(
        'Fry only 2 rings at a time: crowding cools the oil, and the papanași come out greasy and pale.',
        'Prăjește doar câte 2 inele odată: dacă îngrămădești oala, uleiul se răcește, iar papanașii ies unsuroși și palizi.',
      ),
    },
  ],
  nutritionNote: t(
    'The cheese gives protein and calcium, but frying in oil makes them rich in fat and energy, and the sour cream and jam add more fat and sugar; best as an occasional treat, shared, with a fresh fruit on the side.',
    'Brânza aduce proteine și calciu, dar prăjirea în ulei îi face bogați în grăsimi și energie, iar smântâna și dulceața adaugă și mai multe grăsimi și zahăr; sunt mai potriviți ca desert ocazional, împărțit cu cineva, cu fructe proaspete alături.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Fresh blueberries', 'Afine proaspete'),
      reason: t(
        'Their tartness cuts through the fried dough and sour cream.',
        'Aciditatea lor echilibrează grăsimea aluatului prăjit și a smântânii.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'blueberry',
    },
    {
      kind: 'drink',
      label: t('Coffee', 'Cafea'),
      reason: t(
        'Its bitterness balances the rich, sweet dessert.',
        'Amăreala ei echilibrează desertul bogat și dulce.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'coffee',
    },
    {
      kind: 'drink',
      label: t('Black tea', 'Ceai negru'),
      reason: t(
        'A hot, lightly bitter tea refreshes the palate after the fried dough.',
        'Un ceai negru fierbinte, ușor amărui, împrospătează gustul după aluatul prăjit.',
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
        'A treat for a slow weekend table, shared between a few people.',
        'Un răsfăț pentru o masă lungă de weekend, împărțit între câțiva oameni.',
      ),
    },
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'Hot, filling and comforting when it is cold out.',
        'Fierbinți, sățioși și reconfortanți când e frig afară.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Fried and rich, they sit heavy in the stomach during exercise.',
        'Fiind prăjiți în ulei și bogați, cad greu la stomac în timpul efortului.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A heavy, fatty dessert is hard to digest right before bed.',
        'Un desert gras și greu e dificil de digerat chiar înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'papanasi-boiled',
      method: 'boiled',
      // The base's crispness Tip does not apply to boiled balls.
      hideBaseTips: [1],
      title: t(
        'Boiled papanași with buttered breadcrumbs',
        'Papanași fierți, cu pesmet rumenit în unt',
      ),
      servings: 4,
      prepMinutes: 55,
      cookMinutes: 30,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'cottage-cheese',
          quantity: 500,
          unit: 'g',
          note: t(
            'dry, crumbly, well drained',
            'uscată, sfărâmicioasă, bine scursă',
          ),
        },
        { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
        { ingredient: 'semolina', quantity: 100, unit: 'g' },
        {
          ingredient: 'flour',
          quantity: 60,
          unit: 'g',
          note: t('plus a little for your hands', 'plus puțină pentru mâini'),
        },
        { ingredient: 'sugar', quantity: 30, unit: 'g' },
        {
          ingredient: 'lemon',
          quantity: 0.5,
          unit: 'pcs',
          optional: true,
          note: t('zest only, finely grated', 'doar coaja, rasă fin'),
        },
        { ingredient: 'salt', quantity: 1, unit: 'g' },
        {
          ingredient: 'salt',
          key: 'water-salt',
          quantity: 15,
          unit: 'g',
          note: t('for the cooking water', 'pentru apa de fiert'),
        },
        { ingredient: 'still-water', quantity: 3, unit: 'l' },
        { ingredient: 'breadcrumbs', quantity: 80, unit: 'g' },
        { ingredient: 'butter', quantity: 50, unit: 'g' },
        {
          ingredient: 'sugar',
          key: 'crumb-sugar',
          quantity: 20,
          unit: 'g',
          note: t('for the breadcrumbs', 'pentru pesmet'),
        },
        { ingredient: 'sour-cream', quantity: 200, unit: 'g' },
        {
          ingredient: 'jam',
          quantity: 160,
          unit: 'g',
          note: t('sour cherry or blueberry', 'de vișine sau de afine'),
        },
      ],
      steps: [
        {
          key: 'mix',
          text: t(
            'Mash the cheese with a fork in a large bowl. Stir in the eggs, sugar, lemon zest and salt, then the semolina and flour, until you have a firm, slightly sticky dough. Do not taste it: it contains raw egg.',
            'Zdrobește brânza cu furculița într-un castron mare. Adaugă ouăle, zahărul, coaja de lămâie și sarea, apoi grișul și făina, până obții un aluat ferm, ușor lipicios. Nu-l gusta: conține ou crud.',
          ),
        },
        {
          key: 'rest',
          text: t(
            'Cover the bowl and leave the dough to rest for 30 minutes, so the semolina swells and firms it up.',
            'Acoperă castronul și lasă aluatul la odihnit 30 de minute, ca grișul să se umfle și aluatul să se întărească.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'shape',
          text: t(
            'With floured hands, roll the dough into 16 balls of about 50 g and set them on a floured tray.',
            'Cu mâinile înfăinate, rulează aluatul în 16 bile de circa 50 g și așază-le pe o tavă înfăinată.',
          ),
        },
        {
          key: 'boil-water',
          text: t(
            'Bring the water with the salt to a boil in a wide pot over high heat, then lower to a gentle simmer.',
            'Adu apa cu sare la fierbere într-o oală lată, la foc mare, apoi scade focul la o clocotire ușoară.',
          ),
        },
        {
          key: 'crumbs',
          text: t(
            'While the water heats, melt the butter in a pan over medium heat, add the breadcrumbs and sugar and stir for 3 to 4 minutes, until golden and fragrant. Tip into a wide bowl.',
            'Cât se încălzește apa, topește untul într-o tigaie la foc mediu, adaugă pesmetul și zahărul și amestecă 3-4 minute, până se rumenește și miroase frumos. Toarnă-l într-un bol larg.',
          ),
          timerSeconds: 210,
        },
        {
          key: 'simmer',
          text: t(
            'Lower 8 balls into the simmering water. Do not let it boil hard or they may fall apart. They sink at first; wait until they float, about 5 minutes.',
            'Pune 8 bile în apa care clocotește ușor. Nu lăsa apa să fiarbă tare, altfel bilele se pot desface. La început se duc la fund; așteaptă până ies la suprafață, circa 5 minute.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'cook-through',
          text: t(
            'Once they float, simmer for 3 more minutes so the middle cooks through. Lift one out and cut it open: it must be set and evenly pale, with no wet, raw-looking dough.',
            'După ce urcă la suprafață, mai fierbe-le 3 minute, ca să se facă și la mijloc. Scoate una și taie-o: trebuie să fie făcută și la mijloc, de aceeași culoare, fără aluat umed, cu aspect crud.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'roll',
          text: t(
            'Lift the balls out with a slotted spoon, drain well and roll them in the buttered breadcrumbs. Cook the other 8 balls the same way.',
            'Scoate bilele cu o spumieră, scurge-le bine și tăvălește-le prin pesmetul cu unt. Fierbe la fel și celelalte 8 bile.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Serve hot, 4 balls per plate, with the sour cream and jam.',
            'Servește fierbinte, câte 4 bile pe farfurie, cu smântână și dulceață.',
          ),
        },
      ],
      tips: [
        t(
          'Test one ball in the water first. If it breaks up, stir in 1 or 2 more spoonfuls of semolina and rest the dough 10 minutes more.',
          'Încearcă mai întâi o bilă în apă. Dacă se desface, adaugă 1-2 linguri de griș și lasă aluatul încă 10 minute la odihnit.',
        ),
      ],
      stepTips: [
        {
          step: 'simmer',
          text: t(
            'Cook in two batches so the water keeps its gentle simmer; a crowded pot cools and the balls stick together.',
            'Fierbe în două serii, ca apa să-și păstreze clocotul ușor; într-o oală aglomerată apa se răcește, iar bilele se lipesc.',
          ),
        },
      ],
      nutritionNote: t(
        'No frying oil, so lighter than the fried version, and the cheese and eggs give protein and calcium; the butter in the crumbs, the sour cream and the jam still add saturated fat and sugar, and the semolina and breadcrumbs add refined carbohydrate.',
        'Fără ulei de prăjit, sunt mai ușori decât cei prăjiți, iar brânza și ouăle aduc proteine și calciu; untul din pesmet, smântâna și dulceața adaugă totuși grăsimi saturate și zahăr, iar grișul și pesmetul aduc carbohidrați rafinați.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Fresh strawberries', 'Căpșuni proaspete'),
          reason: t(
            'Juicy, slightly sharp fruit lifts the soft, buttery balls.',
            'Fructele zemoase și ușor acrișoare înviorează bilele moi, cu gust de unt.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'strawberry',
        },
        {
          kind: 'drink',
          label: t('Fruit compote', 'Compot de fructe'),
          reason: t(
            'A cold fruit drink refreshes the palate after the sweet, creamy dish.',
            'O băutură rece de fructe împrospătează gustul după un desert dulce și cremos.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'fruit-compote',
        },
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'Its bitterness balances the sweet crumbs and jam.',
            'Amăreala ei echilibrează pesmetul dulce și dulceața.',
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
            'A sweet, filling dish for a slow weekend table.',
            'Un fel dulce și sățios pentru o masă lungă de weekend.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Warm and comforting without any frying.',
            'Calzi și reconfortanți, fără prăjeală.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Dense and sweet, heavy right before bed.',
            'Compacți și dulci, grei chiar înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'papanasi-ukrainian',
      cuisine: 'ukrainian',
      title: t(
        'Syrnyky (Ukrainian curd-cheese fritters)',
        'Sârniki (turtițe ucrainene din brânză de vaci)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 32,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'cottage-cheese',
          quantity: 500,
          unit: 'g',
          note: t(
            'dry, crumbly, well drained (tvorog)',
            'uscată, sfărâmicioasă, bine scursă (tvorog)',
          ),
        },
        { ingredient: 'eggs', quantity: 1, unit: 'pcs' },
        { ingredient: 'sugar', quantity: 40, unit: 'g' },
        { ingredient: 'vanilla-sugar', quantity: 8, unit: 'g', optional: true },
        { ingredient: 'salt', quantity: 1, unit: 'g' },
        {
          ingredient: 'flour',
          quantity: 110,
          unit: 'g',
          note: t(
            '80 g for the dough, the rest for dusting',
            '80 g pentru aluat, restul pentru pudrat',
          ),
        },
        { ingredient: 'raisins', quantity: 40, unit: 'g', optional: true },
        { ingredient: 'sunflower-oil', quantity: 60, unit: 'ml' },
        { ingredient: 'butter', quantity: 20, unit: 'g', optional: true },
        { ingredient: 'sour-cream', quantity: 200, unit: 'g' },
        { ingredient: 'jam', quantity: 120, unit: 'g', optional: true },
        { ingredient: 'honey', quantity: 40, unit: 'g', optional: true },
      ],
      steps: [
        {
          key: 'mix',
          text: t(
            'Mash the cheese with a fork in a bowl until fine. Stir in the egg, sugar, vanilla sugar, salt and raisins, then 80 g of the flour, until you have a soft dough that just holds together. Do not taste it: it contains raw egg.',
            'Zdrobește brânza cu furculița într-un bol, până devine fină. Adaugă oul, zahărul, zahărul vanilat, sarea și stafidele, apoi 80 g din făină, până obții un aluat moale, care abia se ține. Nu-l gusta: conține ou crud.',
          ),
        },
        {
          key: 'shape',
          text: t(
            'Spread the remaining flour on a plate. With wet hands, shape the dough into 12 patties about 6 cm wide and 1.5 cm thick, of about 55 g each, and press each lightly into the flour on both sides.',
            'Pune restul făinii pe o farfurie. Cu mâinile umede, modelează aluatul în 12 turtițe, late de circa 6 cm și groase de 1,5 cm, de circa 55 g fiecare, și apasă-le ușor în făină pe ambele părți.',
          ),
        },
        {
          key: 'heat',
          text: t(
            'Heat a third of the oil, and the butter if using, in a large non-stick pan over medium-low heat.',
            'Încălzește o treime din ulei, și untul dacă folosești, într-o tigaie mare antiaderentă, la foc mic spre mediu.',
          ),
        },
        {
          key: 'fry',
          text: t(
            'Fry 4 patties for 3 minutes per side, until golden. Keep the heat moderate: too hot and they brown while the middle stays raw.',
            'Prăjește 4 turtițe câte 3 minute pe fiecare parte, până se rumenesc. Ține focul moderat: dacă e prea tare, se rumenesc, iar mijlocul rămâne crud.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'cover',
          text: t(
            'Lower the heat, cover the pan and cook 3 more minutes to set the middle. Press a patty: it must feel springy and firm, with no wet dough; cut the first one open to check.',
            'Scade focul, acoperă tigaia și mai gătește 3 minute, ca mijlocul să se închege. Apasă o turtiță: trebuie să fie elastică și fermă, fără aluat umed; taie-o pe prima ca să verifici.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'repeat',
          text: t(
            'Move the patties to a plate, add another third of the oil and fry the next 4 the same way, then the last 4. Wipe out any burnt flour from the pan between batches.',
            'Mută turtițele pe o farfurie, adaugă încă o treime din ulei și prăjește la fel următoarele 4, apoi ultimele 4. Șterge din tigaie făina arsă între serii.',
          ),
          timerSeconds: 1080,
        },
        {
          key: 'serve',
          text: t(
            'Serve warm, 3 syrnyky per plate, with sour cream and jam or honey.',
            'Servește calde, câte 3 sârniki pe farfurie, cu smântână și dulceață sau miere.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'shape',
          text: t(
            'Keep a bowl of water next to you and wet your hands often; the dough sticks to dry ones.',
            'Ține un bol cu apă lângă tine și udă-ți des mâinile; aluatul se lipește de cele uscate.',
          ),
        },
      ],
      nutritionNote: t(
        'Pan-fried in far less oil than the fried papanași, and the cheese gives protein and calcium; the sour cream, jam or honey add fat and sugar, and the refined flour adds little fibre, so keep the toppings small.',
        'Prăjite în tigaie cu mult mai puțin ulei decât papanașii prăjiți, iar brânza aduce proteine și calciu; smântâna, dulceața sau mierea adaugă grăsimi și zahăr, iar făina rafinată aduce puține fibre, așa că pune smântână și dulceață cu măsură.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Fresh blueberries', 'Afine proaspete'),
          reason: t(
            'Tart blueberries balance the fat of the fried patties and the sour cream.',
            'Afinele acrișoare echilibrează grăsimea turtițelor prăjite și a smântânii.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'blueberry',
        },
        {
          kind: 'drink',
          label: t('Black tea', 'Ceai negru'),
          reason: t(
            'A hot, lightly bitter tea balances the sweet, creamy patties.',
            'Un ceai negru fierbinte, ușor amărui, echilibrează turtițele dulci și cremoase.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'tea',
        },
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'Its bitterness balances the sweet cheese and jam.',
            'Amăreala ei echilibrează brânza dulce și dulceața.',
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
            'A filling breakfast: the cheese keeps you full until lunch.',
            'Un mic dejun sățios: brânza te ține sătul până la prânz.',
          ),
        },
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'Easy to cook in batches and serve warm to a table.',
            'Se gătesc ușor în serii și se servesc calde la masă.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Fried cheese and sour cream sit heavy during exercise.',
            'Brânza prăjită și smântâna cad greu la stomac în timpul efortului.',
          ),
        },
      ],
    },
  ],
};
