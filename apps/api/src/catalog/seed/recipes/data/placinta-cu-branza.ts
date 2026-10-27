import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Plăcintă cu brânză base is the baked filo pie with salty cheese and dill.
// Each Variant is a full Recipe with its own lines, steps and guidance; the
// base's Recipe-level Tips are inherited unless a Variant hides them.
export const placintaCuBranza: BaseRecipeSeed = {
  slug: 'placinta-cu-branza',
  title: t(
    'Romanian filo pie with salty cheese (plăcintă cu brânză)',
    'Plăcintă cu brânză sărată și mărar',
  ),
  servings: 10,
  prepMinutes: 30,
  cookMinutes: 55,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'filo-pastry',
      quantity: 400,
      unit: 'g',
      note: t(
        'thawed as the pack says',
        'dezghețate conform instrucțiunilor de pe pachet',
      ),
    },
    {
      ingredient: 'telemea',
      quantity: 400,
      unit: 'g',
      note: t('crumbled', 'mărunțită cu furculița'),
    },
    {
      ingredient: 'cottage-cheese',
      quantity: 400,
      unit: 'g',
      note: t('drained', 'scursă'),
    },
    { ingredient: 'eggs', quantity: 4, unit: 'pcs' },
    { ingredient: 'sour-cream', quantity: 150, unit: 'g' },
    {
      ingredient: 'dill',
      quantity: 40,
      unit: 'g',
      note: t('finely chopped', 'tocat mărunt'),
    },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g', optional: true },
    {
      ingredient: 'salt',
      quantity: 2,
      unit: 'g',
      optional: true,
      note: t(
        'only if the cheeses are mild',
        'doar dacă brânzeturile sunt blânde',
      ),
    },
    {
      ingredient: 'butter',
      quantity: 100,
      unit: 'g',
      note: t('melted', 'topit'),
    },
    {
      ingredient: 'sunflower-oil',
      quantity: 50,
      unit: 'ml',
      note: t('mixed into the melted butter', 'amestecat în untul topit'),
    },
    {
      ingredient: 'milk',
      quantity: 0.1,
      unit: 'l',
      optional: true,
      note: t('for a softer middle', 'pentru un mijloc mai moale'),
    },
  ],
  steps: [
    {
      key: 'melt',
      text: t(
        'Melt the butter in a small pan over low heat, take it off the heat and stir in the oil. This is your brushing fat.',
        'Topește untul într-o cratiță mică la foc mic, ia-l de pe foc și amestecă uleiul în el. Cu amestecul ăsta ungi foile.',
      ),
    },
    {
      key: 'preheat',
      text: t(
        'Heat the oven to 180 °C. It needs about 15 minutes, so it will be ready by the time the pie is assembled.',
        'Încinge cuptorul la 180 °C. Are nevoie de vreo 15 minute, așa că va fi gata până termini de așezat plăcinta în tavă.',
      ),
    },
    {
      key: 'cheese',
      text: t(
        'Crumble the telemea with a fork into pea-sized bits in a large bowl and add the drained cottage cheese. Taste a crumb of the mixed cheeses (before the eggs go in) and add a pinch of salt only if they are mild: the telemea carries most of the salt.',
        'Mărunțește telemeaua cu furculița în bucățele cât boabele de mazăre, într-un castron mare, și adaugă brânza de vaci scursă. Gustă o fărâmă din brânzeturile amestecate (înainte să pui ouăle) și adaugă un praf de sare doar dacă sunt blânde: telemeaua aduce cea mai mare parte din sare.',
      ),
    },
    {
      key: 'filling',
      text: t(
        'Add the eggs, sour cream, dill and pepper, and stir until even. Do not taste the filling now that it has raw egg in it, and wash your hands after handling the eggs.',
        'Adaugă ouăle, smântâna, mărarul și piperul și amestecă până se leagă. Nu gusta umplutura acum că are ou crud în ea și spală-ți mâinile după ce ai lucrat cu ouăle.',
      ),
    },
    {
      key: 'grease',
      text: t(
        'Brush a deep 30 × 20 cm tray (at least 5 cm high) generously with the butter and oil.',
        'Unge generos cu untul și uleiul o tavă adâncă de 30 × 20 cm (înaltă de cel puțin 5 cm).',
      ),
    },
    {
      key: 'unroll',
      text: t(
        'Unroll the filo on a sheet of baking paper and cover it with a damp, wrung-out cloth. Cut or fold the sheets to fit the tray with a little overhang.',
        'Desfă foile pe o coală de hârtie de copt și acoperă-le cu un prosop umed, bine stors. Taie sau îndoaie foile ca să încapă în tavă, cu puțin surplus peste margine.',
      ),
    },
    {
      key: 'bottom',
      text: t(
        'Lay about a third of the sheets in the tray one at a time, brushing each lightly with the fat, so the edges hang over the sides.',
        'Așază în tavă aproximativ o treime din foi, una câte una, ungând fiecare ușor cu grăsime, astfel încât marginile să atârne peste tavă.',
      ),
    },
    {
      key: 'fill-one',
      text: t(
        'Spread half of the filling evenly over the sheets.',
        'Întinde jumătate din umplutură uniform peste foi.',
      ),
    },
    {
      key: 'middle',
      text: t(
        'Lay the next third of the sheets on top, again brushing each one.',
        'Așază peste ele următoarea treime de foi, ungând din nou fiecare foaie.',
      ),
    },
    {
      key: 'fill-two',
      text: t(
        'Spread the rest of the filling evenly.',
        'Întinde uniform restul de umplutură.',
      ),
    },
    {
      key: 'top',
      text: t(
        'Lay the last sheets on top, brushing each, fold the overhanging edges in and brush the top with the remaining fat.',
        'Așază ultimele foi deasupra, ungând fiecare foaie, împăturește înăuntru marginile care atârnă și unge fața cu restul de grăsime.',
      ),
    },
    {
      key: 'cut',
      text: t(
        'With a sharp knife, cut the top layers into 10 pieces (5 × 2) before baking.',
        'Cu un cuțit bine ascuțit, taie straturile de deasupra în 10 bucăți (5 × 2) înainte de copt.',
      ),
    },
    {
      key: 'milk',
      text: t(
        'If you like a softer middle, pour the milk slowly along the cuts.',
        'Dacă îți place mijlocul mai moale, toarnă laptele încet pe liniile de tăiere.',
      ),
    },
    {
      key: 'bake',
      text: t(
        'Bake for 40 minutes, until the top is deep golden and crisp at the edges.',
        'Coace 40 de minute, până când fața se rumenește bine și e crocantă la margini.',
      ),
      timerSeconds: 2400,
    },
    {
      key: 'check',
      text: t(
        'Check the centre: the filling is done when a probe in the middle reads 75 °C, or when it is set and steaming and a knife pushed into the centre comes out hot with no liquid egg. If not, bake 5 minutes more and check again.',
        'Verifică mijlocul: umplutura e gata când un termometru băgat în centru arată 75 °C sau când e închegată și scoate aburi, iar cuțitul băgat în centru iese fierbinte și fără ou lichid. Dacă nu, mai coace 5 minute și verifică din nou.',
      ),
    },
    {
      key: 'rest',
      text: t(
        'Rest the pie in the tray for 10 minutes so the filling settles and the pieces cut cleanly.',
        'Lasă plăcinta în tavă 10 minute, ca umplutura să se așeze și bucățile să se taie curat.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'store',
      text: t(
        'Serve warm or cold. Cool leftovers, cover them and put them in the fridge within 2 hours; eat within 3 days.',
        'Servește caldă sau rece. Lasă resturile să se răcească, acoperă-le și pune-le la frigider în cel mult 2 ore; mănâncă-le în 3 zile.',
      ),
    },
  ],
  tips: [
    t(
      'Telemea varies a lot in saltiness between brands. Taste a crumb first; if it makes you wince, soak the pieces in cold water for 20 minutes, drain and pat them dry. Add salt only if both cheeses are mild.',
      'Telemeaua diferă mult ca sărătură de la o marcă la alta. Gustă mai întâi o fărâmă; dacă e prea sărată, ține bucățile 20 de minute în apă rece, scurge-le și șterge-le. Pune sare în umplutură doar dacă ambele brânzeturi sunt blânde.',
    ),
    t(
      'Filo dries out in minutes. Keep the sheets you are not using under a damp, wrung-out cloth (not dripping wet), brush each sheet as soon as it is down, and do not worry about tears: only the top sheet shows.',
      'Foile se usucă în câteva minute. Ține foile pe care nu le folosești sub un prosop umed, bine stors (nu picurând), unge fiecare foaie imediat ce ai așezat-o și nu te supăra dacă se rup: se vede doar foaia de deasupra.',
    ),
    t(
      'Reheat leftovers in a 180 °C oven (or a dry pan for a single piece) until steaming hot all the way through; the microwave makes filo soft.',
      'Încălzește resturile în cuptor la 180 °C (sau într-o tigaie uscată, pentru o singură bucată) până sunt fierbinți și aburesc în mijloc; cuptorul cu microunde înmoaie foile.',
    ),
  ],
  stepTips: [
    {
      step: 'cut',
      text: t(
        'Cut before baking: once baked, the crisp layers shatter under the knife.',
        'Taie înainte de copt: după copt, straturile crocante se sfărâmă sub cuțit.',
      ),
    },
    {
      step: 'cheese',
      text: t(
        'Drain a watery cottage cheese in a sieve for 10 minutes first, or the bottom layers turn soggy.',
        'Dacă brânza de vaci e apoasă, scurge-o 10 minute într-o sită, altfel foile de jos se înmoaie.',
      ),
    },
  ],
  nutritionNote: t(
    'Cheese and eggs give a fair amount of protein, and a piece is satisfying. The telemea makes it salty, and the cheese, sour cream, butter and egg yolks add saturated fat, on top of refined-flour filo. Keep it as a treat rather than every day, and eat it with fresh vegetables for fibre.',
    'Brânza și ouăle dau destule proteine, iar o bucată te satură. Telemeaua o face sărată, iar brânza, smântâna, untul și gălbenușurile aduc grăsimi saturate, pe lângă foile din făină rafinată. Ține-o ca preparat din când în când, nu zilnic, și servește-o cu legume proaspete pentru fibre.',
  ),
  pairings: [
    {
      kind: 'drink',
      label: t('Drinking yogurt (sana)', 'Iaurt de băut (sana)'),
      reason: t(
        'Its tang cuts through the salty, buttery layers and keeps the next bite fresh.',
        'Aciditatea lui taie din sărătura și untul straturilor și păstrează fiecare îmbucătură proaspătă.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'drinking-yogurt',
    },
    {
      kind: 'food',
      label: t('Ripe tomatoes', 'Roșii coapte'),
      reason: t(
        'Their juicy acidity lifts the rich cheese and butter.',
        'Aciditatea lor zemoasă înviorează brânza și untul.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'tomato',
    },
    {
      kind: 'food',
      label: t('Cucumber', 'Castraveți'),
      reason: t(
        'Cool and crunchy against the soft, flaky pie.',
        'Răcoroși și crocanți față de plăcinta moale și fragedă.',
      ),
      principle: 'contrast_texture',
      ingredient: 'cucumber',
    },
  ],
  eatingMoments: [
    {
      moment: 'brunch',
      polarity: 'good_for',
      reason: t(
        'One tray feeds a table, and it is good warm or cold.',
        'O tavă hrănește o masă întreagă și e bună și caldă, și rece.',
      ),
    },
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'Warm, filling and comforting when it is cold outside.',
        'Caldă, săturătoare și reconfortantă când e frig afară.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Rich and salty, it sits heavy just before bed.',
        'Fiind grasă și sărată, cade greu la stomac înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'placinta-cu-branza-pan-fried',
      method: 'pan-fried',
      title: t(
        'Moldovan pan-fried cheese pies (plăcinte la tigaie)',
        'Plăcinte moldovenești cu brânză la tigaie',
      ),
      servings: 6,
      prepMinutes: 60,
      cookMinutes: 60,
      difficulty: 'medium',
      hideBaseTips: [1, 2],
      lines: [
        { ingredient: 'flour', quantity: 400, unit: 'g' },
        { ingredient: 'kefir', quantity: 220, unit: 'ml' },
        {
          ingredient: 'sunflower-oil',
          key: 'sunflower-oil-dough',
          quantity: 40,
          unit: 'ml',
          note: t('for the dough', 'pentru aluat'),
        },
        {
          ingredient: 'salt',
          quantity: 4,
          unit: 'g',
          note: t('for the dough', 'pentru aluat'),
        },
        {
          ingredient: 'cottage-cheese',
          quantity: 250,
          unit: 'g',
          note: t('drained', 'scursă'),
        },
        {
          ingredient: 'telemea',
          quantity: 250,
          unit: 'g',
          note: t('crumbled', 'mărunțită cu furculița'),
        },
        { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
        {
          ingredient: 'dill',
          quantity: 30,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g', optional: true },
        {
          ingredient: 'salt',
          key: 'salt-filling',
          quantity: 1,
          unit: 'g',
          optional: true,
          note: t(
            'only if the cheeses are mild',
            'doar dacă brânzeturile sunt blânde',
          ),
        },
        {
          ingredient: 'sunflower-oil',
          key: 'sunflower-oil-pan',
          quantity: 50,
          unit: 'ml',
          note: t(
            'for brushing the dough and the pan',
            'pentru uns aluatul și tigaia',
          ),
        },
        {
          ingredient: 'butter',
          quantity: 30,
          unit: 'g',
          note: t('melted', 'topit'),
        },
      ],
      steps: [
        {
          key: 'dough',
          text: t(
            'Mix the flour, salt, kefir and the 40 ml of oil in a bowl, then knead for 5 minutes until the dough is smooth, soft and no longer sticky.',
            'Amestecă făina, sarea, chefirul și cei 40 ml de ulei într-un bol, apoi frământă 5 minute, până când aluatul e neted, moale și nu se mai lipește.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'rest-dough',
          text: t(
            'Cover the dough and let it rest for 30 minutes so it turns elastic and easy to stretch. Make the filling while it rests.',
            'Acoperă aluatul și lasă-l la odihnit 30 de minute, ca să devină elastic și ușor de întins. Pregătește umplutura cât se odihnește.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'filling',
          text: t(
            'Crumble the telemea into a bowl, add the drained cottage cheese, the eggs, dill and pepper, and stir until even. Add a pinch of salt only if both cheeses are mild, tasting a crumb of the cheeses before the eggs go in; do not taste it once the raw egg is in.',
            'Mărunțește telemeaua într-un bol, adaugă brânza de vaci scursă, ouăle, mărarul și piperul și amestecă până se leagă. Adaugă un praf de sare doar dacă ambele brânzeturi sunt blânde, gustând o fărâmă de brânză înainte să pui ouăle; nu o mai gusta după ce are ou crud în ea.',
          ),
        },
        {
          key: 'wash',
          text: t(
            'Wash your hands after handling the eggs. Cover the filling and keep it in the fridge until you fill each pie.',
            'Spală-ți mâinile după ce ai lucrat cu ouăle. Acoperă umplutura și ține-o la frigider până umpli fiecare plăcintă.',
          ),
        },
        {
          key: 'divide',
          text: t(
            'Divide the dough into 6 balls of about 110 g and keep them under a cloth.',
            'Împarte aluatul în 6 bile de aproximativ 110 g și ține-le sub un prosop.',
          ),
        },
        {
          key: 'roll',
          text: t(
            'On a floured counter, roll one ball into a thin square of about 30 cm, thin enough to see the counter faintly through it, and brush it lightly with oil.',
            'Pe blatul presărat cu făină, întinde o bilă într-un pătrat subțire de aproximativ 30 cm, atât de subțire încât să se vadă vag blatul prin el, și unge-l ușor cu ulei.',
          ),
        },
        {
          key: 'fill',
          text: t(
            'Put about 100 g of the filling (a sixth of it) in a 12 cm square in the middle.',
            'Pune aproximativ 100 g de umplutură (o șesime din ea) într-un pătrat de 12 cm în mijloc.',
          ),
        },
        {
          key: 'fold',
          text: t(
            'Fold the four corners into the middle like an envelope, pinch the seams shut, turn the parcel with the joined side down and press or roll it gently to a square of about 18 cm, a little under 1 cm thick, so it fits the pan.',
            'Împăturește cele patru colțuri spre mijloc ca pe un plic, lipește bine marginile, întoarce pachetul cu îmbinarea în jos și apasă-l sau întinde-l ușor până ajunge la un pătrat de aproximativ 18 cm, gros de puțin sub 1 cm, ca să încapă în tigaie.',
          ),
        },
        {
          key: 'repeat',
          text: t(
            'Put the covered filling back in the fridge. Fill and fold each of the other 5 balls the same way, but only while the pie before it is frying, so no raw-egg pie waits long at room temperature.',
            'Pune umplutura acoperită înapoi la frigider. Umple și împăturește la fel fiecare dintre celelalte 5 bile, dar doar cât se prăjește plăcinta dinaintea ei, ca nicio plăcintă cu ou crud să nu stea mult la temperatura camerei.',
          ),
        },
        {
          key: 'heat',
          text: t(
            'Heat a 26 to 28 cm pan over medium heat with a thin film of oil from the 50 ml. It is ready when a pinch of flour sizzles gently without burning at once.',
            'Încinge o tigaie de 26-28 cm la foc mediu, cu un strat subțire de ulei din cei 50 ml. E gata când un pic de făină sfârâie încet, fără să se ardă pe loc.',
          ),
        },
        {
          key: 'fry-one',
          text: t(
            'Fry the first pie for about 4 to 5 minutes, until the underside is golden with brown spots. If they darken in under 3 minutes, lower the heat.',
            'Prăjește prima plăcintă aproximativ 4-5 minute, până când partea de jos e aurie, cu pete maronii. Dacă se închid la culoare în mai puțin de 3 minute, dă focul mai mic.',
          ),
          timerSeconds: 270,
        },
        {
          key: 'fry-two',
          text: t(
            'Turn the pie and fry the second side for about 4 to 5 minutes, until golden.',
            'Întoarce plăcinta și prăjește a doua parte aproximativ 4-5 minute, până se rumenește.',
          ),
          timerSeconds: 270,
        },
        {
          key: 'check',
          text: t(
            'Cut open the first pie to check: the filling must be set, steaming and hot, with no liquid egg (75 °C on a probe). If not, cover the pan with a lid on low heat for 2 more minutes and check again.',
            'Taie prima plăcintă ca să verifici: umplutura trebuie să fie închegată, fierbinte și aburindă, fără ou lichid (75 °C la termometru). Dacă nu, acoperă tigaia cu un capac, la foc mic, încă 2 minute și verifică din nou.',
          ),
        },
        {
          key: 'batches',
          text: t(
            'Fry the other 5 pies one at a time, 4 to 5 minutes a side, adding a little oil to the pan each time. If you changed the heat, cut open the next pie the same way to check it.',
            'Prăjește celelalte 5 plăcinte pe rând, câte 4-5 minute pe fiecare parte, adăugând puțin ulei în tigaie de fiecare dată. Dacă ai schimbat focul, taie la fel următoarea plăcintă ca s-o verifici.',
          ),
        },
        {
          key: 'butter',
          text: t(
            'Brush each hot pie with melted butter and stack them under a cloth to keep them soft. Serve warm.',
            'Unge fiecare plăcintă fierbinte cu unt topit și pune-le una peste alta sub un prosop, ca să rămână moi. Servește-le calde.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Cool leftover pies, wrap them and put them in the fridge within 2 hours; eat within 3 days.',
            'Lasă plăcintele rămase să se răcească, înfășoară-le și pune-le la frigider în cel mult 2 ore; mănâncă-le în 3 zile.',
          ),
        },
      ],
      tips: [
        t(
          'Reheat leftover pies in a dry pan over low heat, a few minutes a side, until steaming hot all the way through.',
          'Încălzește plăcintele rămase într-o tigaie uscată, la foc mic, câteva minute pe fiecare parte, până sunt fierbinți și aburesc în mijloc.',
        ),
        t(
          'The pan decides the pie: too hot and the outside browns before the egg filling sets; too cool and the dough turns dry and pale. Aim for steady medium heat and a golden underside in 4 to 5 minutes.',
          'Tigaia face plăcinta: prea încinsă, se rumenește pe dinafară înainte să se lege umplutura cu ou; prea slabă, aluatul se usucă și rămâne palid. Ține un foc mediu constant și o parte de jos aurie în 4-5 minute.',
        ),
      ],
      stepTips: [
        {
          step: 'roll',
          text: t(
            'If the dough springs back when you roll it, cover it and give it 5 more minutes of rest.',
            'Dacă aluatul se strânge la loc când îl întinzi, acoperă-l și mai lasă-l 5 minute la odihnit.',
          ),
        },
      ],
      nutritionNote: t(
        'Pan-frying uses far less fat than deep-frying, and the cheese and eggs give protein. Still, the telemea adds a lot of salt, the cheese, egg and butter add saturated fat, and the dough is made of refined flour. Best as an occasional meal with fresh vegetables or a salad for fibre.',
        'Prăjirea la tigaie folosește mult mai puțină grăsime decât prăjirea în ulei mult, iar brânza și ouăle dau proteine. Totuși, telemeaua aduce multă sare, brânza, ouăle și untul aduc grăsimi saturate, iar aluatul e din făină rafinată. Cel mai bine din când în când, cu legume proaspete sau o salată pentru fibre.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Drinking yogurt (sana)', 'Iaurt de băut (sana)'),
          reason: t(
            'Its tang cuts the salty, buttery filling and cools the hot pie.',
            'Aciditatea lui taie din sărătura și untul umpluturii și răcorește plăcinta fierbinte.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'drinking-yogurt',
        },
        {
          kind: 'food',
          label: t('Radishes', 'Ridichi'),
          reason: t(
            'Crisp and peppery against the soft, salty filling.',
            'Crocante și iuți față de umplutura moale și sărată.',
          ),
          principle: 'contrast_texture',
          ingredient: 'radish',
        },
        {
          kind: 'food',
          label: t('Spring onion', 'Ceapă verde'),
          reason: t(
            'Fresh onion bite that sharpens the mild cheese and dill.',
            'Un gust proaspăt de ceapă care înviorează brânza blândă și mărarul.',
          ),
          principle: 'complement_flavour',
          ingredient: 'spring-onion',
        },
      ],
      eatingMoments: [
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'Quick to eat out of hand, warm from the pan.',
            'Se mănâncă ușor din mână, calde din tigaie.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'One or two pies with a salad make a filling lunch.',
            'Una sau două plăcinte cu o salată fac un prânz săturător.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Rich and salty, they sit heavy just before bed.',
            'Fiind grase și sărate, cad greu la stomac înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'placinta-cu-branza-turkish',
      cuisine: 'turkish',
      title: t(
        'Su böreği (Turkish boiled-pastry cheese börek)',
        'Su böreği (plăcintă turcească din foi fierte, cu brânză)',
      ),
      servings: 8,
      prepMinutes: 90,
      cookMinutes: 85,
      difficulty: 'hard',
      hideBaseTips: [0, 1, 2],
      lines: [
        { ingredient: 'flour', quantity: 500, unit: 'g' },
        { ingredient: 'eggs', quantity: 3, unit: 'pcs' },
        {
          ingredient: 'still-water',
          key: 'still-water-dough',
          quantity: 0.15,
          unit: 'l',
          note: t('for the dough', 'pentru aluat'),
        },
        {
          ingredient: 'salt',
          key: 'salt-dough',
          quantity: 3,
          unit: 'g',
          note: t('for the dough', 'pentru aluat'),
        },
        {
          ingredient: 'still-water',
          key: 'still-water-boil',
          quantity: 4,
          unit: 'l',
          note: t('for boiling the sheets', 'pentru fiert foile'),
        },
        {
          ingredient: 'salt',
          key: 'salt-boil',
          quantity: 12,
          unit: 'g',
          note: t('for the boiling water', 'pentru apa de fiert'),
        },
        {
          ingredient: 'butter',
          quantity: 150,
          unit: 'g',
          note: t('melted', 'topit'),
        },
        {
          ingredient: 'beyaz-peynir',
          quantity: 400,
          unit: 'g',
          note: t('crumbled', 'mărunțită'),
        },
        {
          ingredient: 'parsley',
          quantity: 40,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
      ],
      steps: [
        {
          key: 'dough',
          text: t(
            'Mix the flour, 3 g of salt, the eggs and 150 ml of water, then knead for about 10 minutes until the dough is smooth and firm but not dry.',
            'Amestecă făina, 3 g de sare, ouăle și 150 ml de apă, apoi frământă aproximativ 10 minute, până când aluatul e neted și ferm, dar nu uscat.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'rest',
          text: t(
            'Cover the dough and let it rest for 30 minutes so it relaxes and rolls out thin without tearing.',
            'Acoperă aluatul și lasă-l la odihnit 30 de minute, ca să se relaxeze și să se întindă subțire fără să se rupă.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'divide',
          text: t(
            'Divide the dough into 10 balls of about 85 g and keep them under a cloth.',
            'Împarte aluatul în 10 bile de aproximativ 85 g și ține-le sub un prosop.',
          ),
        },
        {
          key: 'roll',
          text: t(
            'Roll each ball on a floured counter into a thin round of about 28 cm, about 1 mm thick. Dust each round with flour and stack them under a cloth.',
            'Întinde fiecare bilă pe blatul presărat cu făină într-o foaie rotundă subțire de aproximativ 28 cm, groasă de vreo 1 mm. Presară făină pe fiecare foaie și așază-le una peste alta sub un prosop.',
          ),
        },
        {
          key: 'filling',
          text: t(
            'Mix the crumbled cheese with the parsley. Do not salt it: the cheese is salty.',
            'Amestecă brânza mărunțită cu pătrunjelul. Nu o săra: brânza e sărată.',
          ),
        },
        {
          key: 'tray',
          text: t(
            'Brush a 28 cm round baking dish, at least 5 cm deep, with melted butter. Lay one raw sheet in the bottom and brush it.',
            'Unge cu unt topit o tavă rotundă de 28 cm, adâncă de cel puțin 5 cm. Așază în fund o foaie crudă și unge-o.',
          ),
        },
        {
          key: 'station',
          text: t(
            'Set a large bowl of cold water and a clean tea towel next to the stove. Bring the 4 litres of water and 12 g of salt to a boil in the widest pot you have, about 28 to 30 cm across, on a back burner with the handles turned in. Keep children away from the stove while it boils.',
            'Pune lângă aragaz un castron mare cu apă rece și un prosop curat. Pune la fiert 4 litri de apă cu 12 g de sare în cea mai lată oală pe care o ai, de 28-30 cm, pe ochiul din spate, cu mânerele întoarse spre interior. Ține copiii departe de aragaz cât fierbe apa.',
          ),
        },
        {
          key: 'boil',
          text: t(
            'Lower one rolled sheet into the boiling water, sliding it in from the edge of the pot so the water does not splash. Boil it for 1 minute, until it floats and turns soft and slightly translucent.',
            'Introdu o foaie întinsă în apa clocotită, lăsând-o să alunece de la marginea oalei ca apa să nu stropească. Fierbe-o 1 minut, până când iese la suprafață și devine moale și ușor translucidă.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'lift',
          text: t(
            'Lift the sheet out with a wide skimmer or two spatulas, not your hands, holding it away from your face and the rising steam. Dip it in the cold water for a few seconds.',
            'Scoate foaia cu o spumieră lată sau cu două spatule, nu cu mâna, ținând-o departe de față și de aburul care iese. Cufund-o câteva secunde în apa rece.',
          ),
        },
        {
          key: 'lay',
          text: t(
            'Let the water drain off, lay the sheet in the dish on top of the raw sheet and brush it with butter. Make sure it is well drained, or the pie turns soggy.',
            'Lasă apa să se scurgă, așază foaia în tavă peste cea crudă și unge-o cu unt. Asigură-te că e bine scursă, altfel plăcinta iese apoasă.',
          ),
        },
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 190 °C. It needs about 15 minutes, so it will be ready when the pie is assembled.',
            'Încinge cuptorul la 190 °C. Are nevoie de vreo 15 minute, așa că va fi gata când termini de așezat plăcinta în tavă.',
          ),
        },
        {
          key: 'bottom',
          text: t(
            'Boil, cool, drain and butter three more sheets the same way, 4 boiled sheets in all, one at a time.',
            'Fierbe, răcește, scurge și unge încă trei foi la fel, în total 4 foi fierte, una câte una.',
          ),
        },
        {
          key: 'fill',
          text: t(
            'Spread the cheese and parsley evenly over the boiled sheets.',
            'Întinde uniform brânza cu pătrunjel peste foile fierte.',
          ),
        },
        {
          key: 'top-layers',
          text: t(
            'Boil, cool, drain and lay 4 more sheets on top the same way, brushing each one with butter.',
            'Fierbe, răcește, scurge și așază deasupra încă 4 foi la fel, ungând fiecare foaie cu unt.',
          ),
        },
        {
          key: 'top',
          text: t(
            'Lay the last raw sheet on top and brush it with the remaining butter.',
            'Așază deasupra ultima foaie crudă și unge-o cu untul rămas.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 50 minutes, until the top is deep golden and crisp and the edges bubble.',
            'Coace 50 de minute, până când fața se rumenește bine, e crocantă, iar marginile sfârâie.',
          ),
          timerSeconds: 3000,
        },
        {
          key: 'rest-pie',
          text: t(
            'Rest the pie in the dish for 10 minutes so the layers settle and soak up the butter, then cut it into 8 wedges.',
            'Lasă plăcinta în tavă 10 minute, ca straturile să se așeze și să tragă untul, apoi taie-o în 8 felii.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'store',
          text: t(
            'Serve warm. Cool leftovers, cover them and put them in the fridge within 2 hours; eat within 3 days.',
            'Servește caldă. Lasă resturile să se răcească, acoperă-le și pune-le la frigider în cel mult 2 ore; mănâncă-le în 3 zile.',
          ),
        },
      ],
      tips: [
        t(
          'Beyaz peynir is brined and salty, and the boiling water is only lightly salted, so taste a crumb of the cheese and leave the filling unsalted. If it is very salty, soak it in cold water for 20 minutes and pat it dry.',
          'Beyaz peynir e păstrată în saramură și e sărată, iar apa de fiert e sărată doar ușor, așa că gustă o fărâmă de brânză și nu săra umplutura. Dacă e foarte sărată, ține-o 20 de minute în apă rece și șterge-o.',
        ),
        t(
          'Pot water burns: keep the handles turned in, slide each sheet in at the edge of the pot, lift it out with a wide skimmer and never reach in with your hands.',
          'Apa fierbinte arde: ține mânerele întoarse spre interior, lasă fiecare foaie să alunece la marginea oalei, scoate-o cu o spumieră lată și nu băga niciodată mâna în apă.',
        ),
      ],
      stepTips: [
        {
          step: 'roll',
          text: t(
            'The sheets are ready to boil when you can see the counter pattern through them; thick sheets turn gummy.',
            'Foile sunt gata de fiert când se vede blatul prin ele; cele groase ies cleioase.',
          ),
        },
      ],
      nutritionNote: t(
        'Rich in refined carbohydrates from the pastry, with protein from the cheese and eggs. The brined cheese makes it salty, and the generous butter and cheese add saturated fat. Best as a treat rather than every day; serve it with fresh vegetables for fibre.',
        'Bogată în carbohidrați rafinați din aluat, cu proteine din brânză și ouă. Brânza din saramură o face sărată, iar untul și brânza din belșug aduc grăsimi saturate. Cel mai bine din când în când, nu zilnic; servește-o cu legume proaspete pentru fibre.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Ayran (drinking yogurt)', 'Ayran (iaurt de băut)'),
          reason: t(
            'Its tang and salt cut the buttery layers and cool the palate.',
            'Aciditatea și sarea lui răcoresc gura și taie din untul straturilor.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'drinking-yogurt',
        },
        {
          kind: 'drink',
          label: t('Black tea', 'Ceai negru'),
          reason: t(
            'Its slight bitterness balances the rich cheese and butter.',
            'Amăreala lui ușoară echilibrează brânza și untul.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'tea',
        },
        {
          kind: 'food',
          label: t('Cucumber', 'Castraveți'),
          reason: t(
            'Cool and crisp against the soft, layered pastry.',
            'Răcoroși și crocanți față de aluatul moale, în straturi.',
          ),
          principle: 'contrast_texture',
          ingredient: 'cucumber',
        },
      ],
      eatingMoments: [
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'Wedges are easy to serve to a table, warm with tea.',
            'Feliile se servesc ușor la masă, calde, cu ceai.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Warm, soft and filling when it is cold outside.',
            'Caldă, moale și săturătoare când e frig afară.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Rich and salty, it sits heavy just before bed.',
            'Fiind grasă și sărată, cade greu la stomac înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
