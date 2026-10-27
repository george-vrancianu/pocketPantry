import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Rice pudding base is the slow stovetop kind: pudding rice simmered
// straight in whole milk with a vanilla pod, sugar and butter stirred in at
// the end, served warm. Each Variant is a full Recipe with its own lines,
// steps and guidance; the base's Recipe-level Tips are inherited unless hidden.
export const ricePudding: BaseRecipeSeed = {
  slug: 'rice-pudding',
  title: t(
    'Creamy vanilla rice pudding',
    'Orez cu lapte cald, cu vanilie și unt',
  ),
  servings: 4,
  prepMinutes: 10,
  cookMinutes: 50,
  difficulty: 'easy',
  lines: [
    { ingredient: 'round-rice', quantity: 100, unit: 'g' },
    { ingredient: 'milk', quantity: 1, unit: 'l' },
    { ingredient: 'vanilla-pods', quantity: 1, unit: 'pcs' },
    { ingredient: 'salt', quantity: 1, unit: 'g' },
    { ingredient: 'sugar', quantity: 50, unit: 'g' },
    { ingredient: 'butter', quantity: 20, unit: 'g' },
    {
      ingredient: 'jam',
      quantity: 80,
      unit: 'g',
      optional: true,
      note: t('a spoonful per bowl', 'o lingură în fiecare castron'),
    },
    {
      ingredient: 'nutmeg',
      quantity: 0.5,
      unit: 'g',
      optional: true,
      note: t('ground, to dust on top', 'măcinată, pentru presărat deasupra'),
    },
  ],
  steps: [
    {
      key: 'pod',
      text: t(
        'Split the vanilla pod lengthways with the tip of a knife and scrape out the seeds with the back of the blade. Keep both the seeds and the pod.',
        'Taie păstaia de vanilie pe lungime cu vârful cuțitului și răzuiește semințele cu spatele lamei. Păstrează și semințele, și păstaia.',
      ),
    },
    {
      key: 'heat',
      text: t(
        'Pour the milk into a heavy-based pan of about 3 litres. Add the vanilla seeds, the pod and the salt. Warm over medium heat until the milk steams and tiny bubbles form at the edge. Stay by the pan, because milk rises fast once it boils.',
        'Toarnă laptele într-o oală cu fundul gros, de aproximativ 3 litri. Adaugă semințele de vanilie, păstaia și sarea. Încălzește la foc mediu până când laptele scoate abur și se formează bule mici la margine. Rămâi lângă oală, pentru că laptele dă în foc repede când fierbe.',
      ),
    },
    {
      key: 'rice',
      text: t(
        'Stir in the rice and turn the heat down to the lowest setting, so the milk barely bubbles.',
        'Amestecă orezul în lapte și redu focul la minim, ca laptele să facă doar bule rare.',
      ),
    },
    {
      key: 'simmer',
      text: t(
        'Simmer for about 40 minutes, stirring every couple of minutes and scraping the bottom and corners, until the rice is completely soft and the pudding is thick, like loose porridge.',
        'Fierbe aproximativ 40 de minute, amestecând la fiecare două minute și răzuind fundul și colțurile oalei, până când orezul e complet moale, iar orezul cu lapte e gros, ca un terci ușor lichid.',
      ),
      timerSeconds: 2400,
    },
    {
      key: 'finish',
      text: t(
        'Take the pan off the heat and lift out the vanilla pod. Stir in the sugar and the butter until both have melted.',
        'Ia oala de pe foc și scoate păstaia de vanilie. Amestecă zahărul și untul până se topesc.',
      ),
    },
    {
      key: 'serve',
      text: t(
        'Spoon the pudding into bowls while it is warm. Add a spoonful of jam to each bowl and dust with a little nutmeg.',
        'Pune orezul cu lapte cald în castroane. Adaugă în fiecare câte o lingură de dulceață și presară puțină nucșoară.',
      ),
    },
  ],
  tips: [
    t(
      'Cool leftovers quickly: spoon them into a shallow container, refrigerate within 1 hour and eat within a day. Reheat only once, with a splash of milk, until steaming hot all the way through.',
      'Răcește rapid ce rămâne: pune orezul cu lapte într-un vas lat, dă-l la frigider în cel mult o oră și consumă-l în cel mult o zi. Reîncălzește-l o singură dată, cu puțin lapte, până scoate abur peste tot.',
    ),
    t(
      'Do not rinse the rice. The starch on the grains is what makes the pudding creamy.',
      'Nu clăti orezul. Amidonul de pe boabe face orezul cu lapte cremos.',
    ),
    t(
      'The pudding keeps thickening as it cools. If it turns too firm, stir in a splash of warm milk.',
      'Orezul cu lapte se îngroașă în continuare pe măsură ce se răcește. Dacă e prea tare, amestecă cu puțin lapte cald.',
    ),
  ],
  stepTips: [
    {
      step: 'heat',
      text: t(
        'Rinse the pan with cold water and leave it wet before you pour in the milk; it helps keep the milk from sticking and scorching.',
        'Clătește oala cu apă rece și las-o udă înainte să torni laptele; ajută ca laptele să nu se lipească și să nu se ardă.',
      ),
    },
    {
      step: 'simmer',
      text: t(
        'If you smell anything toasty, lift the pan off the heat at once and do not scrape the bottom: pour the pudding into a clean pan and carry on.',
        'Dacă simți miros de ars, ia imediat oala de pe foc și nu răzui fundul: toarnă orezul cu lapte într-o oală curată și continuă.',
      ),
    },
  ],
  nutritionNote: t(
    'Filling and gentle: the rice gives energy and the milk some protein. Whole milk, butter and sugar make it rich in saturated fat and sugar, so use only as much sugar and butter as you like, and serve it with fruit, which the pudding itself lacks.',
    'Săturător și ușor la stomac: orezul dă energie, iar laptele aduce și proteine. Laptele integral, untul și zahărul îl fac bogat în grăsimi saturate și zahăr, așa că pune zahăr și unt cât ai nevoie și servește-l cu fructe, care lipsesc din el.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Fresh raspberries', 'Zmeură proaspătă'),
      reason: t(
        'Their tartness cuts through the creamy, sweet pudding.',
        'Aciditatea lor taie dulceața și cremozitatea orezului cu lapte.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'raspberry',
    },
    {
      kind: 'food',
      label: t('Stewed apple', 'Mere fierte'),
      reason: t(
        'Soft, lightly tart fruit makes a fresh contrast to the plain, milky rice.',
        'Fructele moi și ușor acrișoare fac un contrast proaspăt cu orezul simplu, cu gust de lapte.',
      ),
      principle: 'complement_flavour',
      ingredient: 'apple',
    },
    {
      kind: 'drink',
      label: t('Hot tea', 'Ceai fierbinte'),
      reason: t(
        'A little bitterness balances the sweet, rich pudding.',
        'O amăreală ușoară echilibrează dulceața și bogăția orezului cu lapte.',
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
        'A warm, soft bowl that is easy to eat when it is cold outside.',
        'Un castron cald și moale, plăcut când e frig afară.',
      ),
    },
    {
      moment: 'morning',
      polarity: 'good_for',
      reason: t(
        'Works like a warm porridge and keeps you full through the morning.',
        'Merge ca un terci cald și te ține sătul toată dimineața.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Milk, butter and thick rice sit heavy in the stomach during exercise.',
        'Laptele, untul și orezul gros cad greu la stomac în timpul efortului.',
      ),
    },
  ],
  variants: [
    {
      slug: 'rice-pudding-scandinavian',
      cuisine: 'scandinavian',
      title: t(
        'Risalamande (Danish almond rice pudding with cherry sauce)',
        'Risalamande (orez cu lapte, frișcă și migdale, ca în Danemarca)',
      ),
      servings: 6,
      prepMinutes: 540,
      cookMinutes: 70,
      difficulty: 'medium',
      hideBaseTips: [0, 2],
      lines: [
        { ingredient: 'round-rice', quantity: 125, unit: 'g' },
        { ingredient: 'milk', quantity: 1, unit: 'l' },
        { ingredient: 'vanilla-pods', quantity: 1, unit: 'pcs' },
        { ingredient: 'salt', quantity: 1, unit: 'g' },
        {
          ingredient: 'sugar',
          key: 'sugar',
          quantity: 60,
          unit: 'g',
          note: t('for the porridge', 'pentru terci'),
        },
        { ingredient: 'whipping-cream', quantity: 400, unit: 'ml' },
        {
          ingredient: 'almonds',
          quantity: 100,
          unit: 'g',
          note: t(
            'blanched (skins off), chopped, plus 1 whole almond kept aside',
            'albite (fără pieliță), tocate, plus o migdală întreagă păstrată separat',
          ),
        },
        {
          ingredient: 'frozen-sour-cherries',
          quantity: 400,
          unit: 'g',
          note: t('for the sauce', 'pentru sos'),
        },
        {
          ingredient: 'sugar',
          key: 'sugar-sauce',
          quantity: 60,
          unit: 'g',
          note: t('for the cherry sauce', 'pentru sosul de vișine'),
        },
        {
          ingredient: 'corn-starch',
          quantity: 12,
          unit: 'g',
          note: t('for the cherry sauce', 'pentru sosul de vișine'),
        },
        {
          ingredient: 'still-water',
          quantity: 0.12,
          unit: 'l',
          note: t(
            '90 ml for simmering the cherries, 30 ml to mix the starch',
            '90 ml pentru fierberea vișinelor, 30 ml pentru amidon',
          ),
        },
      ],
      steps: [
        {
          key: 'pod',
          text: t(
            'Split the vanilla pod lengthways and scrape out the seeds with the back of the knife.',
            'Taie păstaia de vanilie pe lungime și răzuiește semințele cu spatele cuțitului.',
          ),
        },
        {
          key: 'heat',
          text: t(
            'Pour the milk into a heavy-based pan. Add the vanilla seeds, the pod and the salt, and warm over medium heat until the milk steams and tiny bubbles appear at the edge.',
            'Toarnă laptele într-o oală cu fundul gros. Adaugă semințele de vanilie, păstaia și sarea și încălzește la foc mediu până când laptele scoate abur și apar bule mici la margine.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Stir in the rice, turn the heat to the lowest setting and cook for about 40 minutes, stirring often and scraping the bottom, until the rice is very soft and you have a thick porridge.',
            'Amestecă orezul, redu focul la minim și fierbe aproximativ 40 de minute, amestecând des și răzuind fundul oalei, până când orezul e foarte moale și ai un terci gros.',
          ),
          timerSeconds: 2400,
        },
        {
          key: 'cool',
          text: t(
            'Lift out the vanilla pod and spread the porridge in a wide, shallow dish so it cools fast. Press cling film onto the surface to stop a skin forming and leave it for 1 hour.',
            'Scoate păstaia de vanilie și întinde terciul într-un vas lat și puțin adânc, ca să se răcească repede. Lipește folie alimentară direct pe suprafață, ca să nu se formeze crustă, și lasă-l 1 oră.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'chill',
          text: t(
            'Put the covered dish in the fridge for at least 8 hours, or overnight, until the porridge is completely cold.',
            'Pune vasul acoperit la frigider cel puțin 8 ore, sau peste noapte, până când terciul e complet rece.',
          ),
          timerSeconds: 28800,
        },
        {
          key: 'almonds',
          text: t(
            'If your almonds still have skins, cover them with boiling water for 2 minutes, drain and slip the skins off. Pat them dry, chop all but one coarsely and keep the whole almond aside.',
            'Dacă migdalele au încă pielița, acoper-le cu apă clocotită 2 minute, scurge-le și scoate-le pielița, apăsând între degete. Șterge-le, toacă grosier toate în afară de una și păstrează migdala întreagă separat.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'whip',
          text: t(
            'Whip the cold cream in a cold bowl until it forms soft peaks and just holds its shape.',
            'Bate frișca rece într-un bol rece până formează vârfuri moi și abia își ține forma.',
          ),
        },
        {
          key: 'fold',
          text: t(
            'Stir the sugar and the chopped almonds into the cold porridge, then fold in the whipped cream in two additions. Hide the whole almond in one portion if you like, and keep the pudding in the fridge until serving.',
            'Amestecă zahărul și migdalele tocate în terciul rece, apoi încorporează frișca bătută în două reprize. Ascunde migdala întreagă într-o porție, dacă vrei, și ține desertul la frigider până servești.',
          ),
        },
        {
          key: 'cherries',
          text: t(
            'Put the frozen cherries, the sauce sugar and 90 ml water in a small pan. Bring to a simmer over medium heat, then cook for 8 minutes until the cherries are soft.',
            'Pune vișinele congelate, zahărul pentru sos și 90 ml de apă într-o cratiță mică. Adu la fierbere la foc mediu, apoi fierbe 8 minute, până când vișinele sunt moi.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'thicken',
          text: t(
            'Mix the starch with 30 ml cold water, stir it into the cherries and boil for 1 minute, stirring, until the sauce turns glossy and slightly thick. It thickens more as it cools.',
            'Amestecă amidonul cu 30 ml de apă rece, adaugă-l peste vișine și fierbe 1 minut, amestecând, până când sosul devine lucios și ușor îngroșat. Se îngroașă și mai mult când se răcește.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'serve',
          text: t(
            'Spoon the cold pudding into bowls and pour the warm cherry sauce over at the table.',
            'Pune desertul rece în castroane și toarnă sosul cald de vișine deasupra, la masă.',
          ),
        },
      ],
      tips: [
        t(
          'Eat risalamande within a day of cooking the porridge. Refrigerate the porridge within 1 hour, keep it cold until you add the cream, and keep the finished dessert in the fridge until you serve it. It is served cold, so there is nothing to reheat.',
          'Risalamande se mănâncă în cel mult o zi de la gătitul terciului. Dă terciul la frigider în cel mult o oră, ține-l la rece până adaugi frișca, iar desertul gata ține-l la frigider până îl servești. Se servește rece, fără reîncălzire.',
        ),
        t(
          'Whoever finds the whole almond wins the mandelgave, a small present. A whole almond is a choking risk for small children, so leave it out of the portions for children under 5.',
          'Cine găsește migdala întreagă primește mandelgave, un mic cadou. O migdală întreagă îi poate îneca pe copiii mici, așa că nu o pune în porțiile copiilor sub 5 ani.',
        ),
      ],
      stepTips: [
        {
          step: 'whip',
          text: t(
            'Stop whipping at soft peaks: cream whipped stiff turns grainy when you fold it into the porridge.',
            'Oprește-te la vârfuri moi: frișca bătută tare se face grunjoasă când o încorporezi în terci.',
          ),
        },
        {
          step: 'simmer',
          text: t(
            'Use the lowest heat and a heavy pan, because this much milk scorches quickly on the bottom.',
            'Folosește focul cel mai mic și o oală cu fundul gros, pentru că atâta lapte se arde repede pe fund.',
          ),
        },
      ],
      nutritionNote: t(
        'A festive dessert, not an everyday one: the cream, milk and sugar make it high in saturated fat and sugar. Almonds add some unsaturated fat and crunch, and the tart cherries lighten the sweetness; keep portions small.',
        'Un desert de sărbătoare, nu de zi cu zi: frișca, laptele și zahărul îl fac bogat în grăsimi saturate și zahăr. Migdalele aduc ceva grăsimi nesaturate și textură, iar vișinele acrișoare ușurează dulceața; servește porții mici.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t(
            'Danish roast pork with crackling (flæskesteg)',
            'Friptură daneză de porc cu șorici crocant (flæskesteg)',
          ),
          reason: t(
            'In Denmark risalamande is the dessert served after the flæskesteg on Christmas Eve; the cold, sweet cream follows the rich meat.',
            'În Danemarca, risalamande este desertul servit după flæskesteg în Ajunul Crăciunului; crema rece și dulce urmează după carnea bogată.',
          ),
          principle: 'regional_tradition',
          recipe: 'flaeskesteg',
        },
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'Its bitterness balances the rich, sweet cream.',
            'Amăreala ei echilibrează frișca bogată și dulce.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'coffee',
        },
      ],
      eatingMoments: [
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Served well chilled, so it is a cool dessert.',
            'Se servește bine răcit, așa că e un desert răcoritor.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Cream and rice sit heavy in the stomach during exercise.',
            'Frișca și orezul cad greu la stomac în timpul efortului.',
          ),
        },
      ],
    },
    {
      slug: 'rice-pudding-romanian',
      cuisine: 'romanian',
      title: t(
        'Romanian rice pudding with lemon zest and cinnamon (orez cu lapte)',
        'Orez cu lapte',
      ),
      servings: 4,
      prepMinutes: 215,
      cookMinutes: 45,
      difficulty: 'easy',
      hideBaseTips: [0, 1, 2],
      lines: [
        { ingredient: 'round-rice', quantity: 120, unit: 'g' },
        { ingredient: 'still-water', quantity: 0.25, unit: 'l' },
        { ingredient: 'milk', quantity: 0.8, unit: 'l' },
        { ingredient: 'salt', quantity: 1, unit: 'g' },
        { ingredient: 'sugar', quantity: 70, unit: 'g' },
        { ingredient: 'vanilla-sugar', quantity: 8, unit: 'g' },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t('zest only, grated', 'doar coaja, rasă'),
        },
        {
          ingredient: 'orange',
          quantity: 1,
          unit: 'pcs',
          optional: true,
          note: t('zest only, grated', 'doar coaja, rasă'),
        },
        {
          ingredient: 'raisins',
          quantity: 40,
          unit: 'g',
          optional: true,
        },
        {
          ingredient: 'cinnamon',
          quantity: 2,
          unit: 'g',
          note: t('to dust on top', 'pentru presărat deasupra'),
        },
      ],
      steps: [
        {
          key: 'wash',
          text: t(
            'Wash the rice in a sieve under cold running water until the water runs almost clear, then drain.',
            'Spală orezul într-o strecurătoare sub jet de apă rece, până când apa curge aproape limpede, apoi scurge-l.',
          ),
        },
        {
          key: 'zest',
          text: t(
            'Grate the zest of the lemon (and of the orange, if using) on the fine side of the grater. Take only the coloured part and leave the white pith behind.',
            'Dă pe răzătoarea fină coaja de lămâie (și de portocală, dacă folosești). Ia doar partea colorată și lasă partea albă, amară.',
          ),
        },
        {
          key: 'boil-rice',
          text: t(
            'Put the rice, the water and the salt in a pot and bring to the boil. Lower the heat and cook for about 10 minutes, stirring now and then, until the rice has soaked up the water and the grains are swollen.',
            'Pune orezul, apa și sarea într-o oală și adu la fierbere. Dă focul mai mic și fierbe aproximativ 10 minute, amestecând din când în când, până când orezul a băut apa și boabele s-au umflat.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'milk',
          text: t(
            'Pour in the milk and add the zest and the raisins, if using. Bring to the boil over medium heat, stirring and watching the pot so the milk does not boil over.',
            'Toarnă laptele și adaugă coaja rasă și stafidele, dacă folosești. Adu la fierbere la foc mediu, amestecând și supraveghind oala, ca să nu dea laptele în foc.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Turn the heat down to low and cook for about 25 minutes, stirring often so the rice does not stick to the bottom, until the rice is very soft and the mixture is like a loose porridge.',
            'Dă focul mic și fierbe aproximativ 25 de minute, amestecând des ca orezul să nu se prindă de fundul oalei, până când orezul e foarte moale, iar compoziția e ca un terci ușor lichid.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'sweeten',
          text: t(
            'Take the pot off the heat and stir in the sugar and the vanilla sugar until they dissolve.',
            'Ia oala de pe foc și amestecă zahărul și zahărul vanilat până se topesc.',
          ),
        },
        {
          key: 'pour',
          text: t(
            'Spoon the orez cu lapte into 4 bowls and leave them on the counter for 30 minutes, until they stop steaming.',
            'Pune orezul cu lapte în 4 castroane și lasă-le pe masă 30 de minute, până nu mai ies aburi.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'chill',
          text: t(
            'Cover the bowls and refrigerate for at least 3 hours, until the pudding is cold and set. Dust with cinnamon just before serving.',
            'Acoperă castroanele și pune-le la frigider cel puțin 3 ore, până când orezul cu lapte e rece și s-a întărit. Presară scorțișoară chiar înainte de servire.',
          ),
          timerSeconds: 10800,
        },
      ],
      tips: [
        t(
          'Get the bowls into the fridge within an hour of cooking and eat the pudding within a day.',
          'Pune castroanele la frigider în cel mult o oră de la gătit și consumă orezul cu lapte în cel mult o zi.',
        ),
        t(
          'Grate the zest before you cut the lemon; afterwards it is hard to grate.',
          'Rade coaja înainte să tai lămâia; după aceea e greu de ras.',
        ),
      ],
      stepTips: [
        {
          step: 'boil-rice',
          text: t(
            'Boiling the rice in water first lets the grains swell without scorching milk, so the milk stage needs less watching.',
            'Dacă fierbi întâi orezul în apă, boabele se umflă fără să arzi laptele, deci în a doua etapă îl supraveghezi mai puțin.',
          ),
        },
        {
          step: 'simmer',
          text: t(
            'Keep the heat low and stir the bottom of the pot, because milk with rice burns quickly.',
            'Ține focul mic și amestecă pe fundul oalei, pentru că laptele cu orez se arde repede.',
          ),
        },
      ],
      nutritionNote: t(
        'Light and filling, with energy from the rice and some protein from the milk. It is sweet and low in fibre; use less sugar if you add raisins, which are sweet already, and serve with fresh fruit.',
        'Ușor și săturător, cu energie din orez și ceva proteine din lapte. E dulce și sărac în fibre; pune mai puțin zahăr dacă adaugi stafide, care sunt deja dulci, și servește-l cu fructe proaspete.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Fruit compote', 'Compot de fructe'),
          reason: t(
            'Tart fruit in syrup lifts the plain, sweet pudding.',
            'Fructele acrișoare în sirop înviorează orezul simplu și dulce.',
          ),
          principle: 'complement_flavour',
          ingredient: 'fruit-compote',
        },
        {
          kind: 'drink',
          label: t('Chamomile tea', 'Ceai de mușețel'),
          reason: t(
            'A mild, warm drink that matches the gentle flavour of the pudding.',
            'O băutură caldă și blândă, potrivită cu gustul delicat al orezului cu lapte.',
          ),
          principle: 'complement_flavour',
          ingredient: 'chamomile-tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Eaten cold and set, it is a cooling, light dessert.',
            'Mâncat rece, când s-a întărit, e un desert răcoritor și ușor.',
          ),
        },
        {
          moment: 'morning',
          polarity: 'good_for',
          reason: t(
            'Rice and milk are filling at breakfast.',
            'Orezul și laptele satură la micul dejun.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'A bowl of milk and rice sits heavy in the stomach during exercise.',
            'Un castron cu lapte și orez cade greu la stomac în timpul efortului.',
          ),
        },
      ],
    },
    {
      slug: 'rice-pudding-indian',
      cuisine: 'indian',
      title: t(
        'Kheer (Indian cardamom rice pudding)',
        'Kheer (orez cu lapte indian, cu cardamom)',
      ),
      servings: 4,
      prepMinutes: 45,
      cookMinutes: 60,
      difficulty: 'easy',
      hideBaseTips: [1],
      lines: [
        { ingredient: 'basmati-rice', quantity: 70, unit: 'g' },
        { ingredient: 'milk', quantity: 1, unit: 'l' },
        {
          ingredient: 'clarified-butter',
          quantity: 10,
          unit: 'g',
          optional: true,
          note: t('ghee', 'ghee'),
        },
        { ingredient: 'sugar', quantity: 60, unit: 'g' },
        {
          ingredient: 'cardamom',
          quantity: 1,
          unit: 'g',
          note: t('ground', 'măcinat'),
        },
        {
          ingredient: 'saffron',
          quantity: 0.2,
          unit: 'g',
          optional: true,
          note: t('a generous pinch', 'un vârf de cuțit mai plin'),
        },
        {
          ingredient: 'almonds',
          quantity: 25,
          unit: 'g',
          note: t('sliced', 'tăiate felii'),
        },
        {
          ingredient: 'pistachios',
          quantity: 20,
          unit: 'g',
          note: t('unsalted, roughly chopped', 'nesărate, tocate grosier'),
        },
        {
          ingredient: 'raisins',
          quantity: 30,
          unit: 'g',
          optional: true,
        },
      ],
      steps: [
        {
          key: 'wash',
          text: t(
            'Wash the basmati in a bowl of cold water, changing the water 3 or 4 times until it runs nearly clear. Cover with fresh water and soak for 30 minutes, then drain well.',
            'Spală orezul basmati într-un bol cu apă rece, schimbând apa de 3-4 ori, până când e aproape limpede. Acoperă-l cu apă proaspătă, lasă-l la înmuiat 30 de minute, apoi scurge-l bine.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'saffron',
          text: t(
            'While the rice soaks, warm 2 tablespoons of the milk, crumble the saffron into it and leave it to steep. Mark the level of the remaining milk in your pan by dipping a wooden spoon handle into it.',
            'În timp ce orezul stă la înmuiat, încălzește 2 linguri din lapte, sfărâmă șofranul în el și lasă-l să se infuzeze. Marchează nivelul laptelui din oală: scufundă coada unei linguri de lemn și reține până unde s-a udat.',
          ),
        },
        {
          key: 'toast',
          text: t(
            'If using ghee, melt it in a heavy-based pan over medium heat, add the drained rice and stir for 1 minute until it smells nutty. Skip this step if you are not using ghee.',
            'Dacă folosești ghee, topește-l într-o oală cu fundul gros la foc mediu, adaugă orezul scurs și amestecă 1 minut, până miroase a nucă. Sari peste acest pas dacă nu folosești ghee.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'boil',
          text: t(
            'Pour in the rest of the milk (and add the rice now, if you skipped the ghee). Bring to the boil over medium-high heat, stirring so the milk does not stick or boil over.',
            'Toarnă restul laptelui (și adaugă acum orezul, dacă ai sărit peste ghee). Adu la fierbere la foc potrivit-mare, amestecând ca laptele să nu se lipească și să nu dea în foc.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Turn the heat to low and simmer for about 40 minutes, stirring every few minutes and scraping the bottom, until the rice is very soft and the milk has reduced by about a third, to a thick, creamy consistency.',
            'Dă focul mic și fierbe aproximativ 40 de minute, amestecând la câteva minute și răzuind fundul oalei, până când orezul e foarte moale, iar laptele a scăzut cu aproximativ o treime, până la o consistență groasă și cremoasă.',
          ),
          timerSeconds: 2400,
        },
        {
          key: 'sweeten',
          text: t(
            'Stir in the sugar, the cardamom and the saffron milk, and simmer for 5 more minutes. Press a few rice grains against the side of the pan with the spoon to make it creamier.',
            'Amestecă zahărul, cardamomul și laptele cu șofran și mai fierbe 5 minute. Strivește câteva boabe de orez de peretele oalei cu lingura, ca să iasă mai cremos.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'nuts',
          text: t(
            'Take the pan off the heat and stir in the raisins and most of the almonds and pistachios. Serve warm or chilled, topped with the nuts you kept back.',
            'Ia oala de pe foc și amestecă stafidele și cea mai mare parte din migdale și fistic. Servește-l cald sau rece, cu migdalele și fisticul păstrate deasupra.',
          ),
        },
      ],
      tips: [
        t(
          'Add the sugar only after the rice is soft: sugar added early tends to keep the grains firm.',
          'Adaugă zahărul abia după ce orezul s-a înmuiat: zahărul pus devreme tinde să țină boabele tari.',
        ),
      ],
      stepTips: [
        {
          step: 'simmer',
          text: t(
            'Use a wide pan and compare the milk with the mark you made: it should have dropped by about a third.',
            'Folosește o oală lată și compară laptele cu semnul făcut: ar trebui să fi scăzut cu aproximativ o treime.',
          ),
        },
        {
          step: 'boil',
          text: t(
            'Milk scorches easily, so keep the heat under control and stir the bottom of the pan often.',
            'Laptele se arde ușor, așa că ține focul sub control și amestecă des pe fundul oalei.',
          ),
        },
      ],
      nutritionNote: t(
        'Milk, rice and nuts make it filling, and the nuts add some unsaturated fat. It is still a sweet dessert with sugar and plenty of milk fat, so keep the portion modest, and use less sugar if you add the raisins.',
        'Laptele, orezul, migdalele și fisticul îl fac săturător, iar migdalele și fisticul adaugă grăsimi nesaturate. Rămâne totuși un desert dulce, cu zahăr și multă grăsime din lapte, așa că servește porții moderate și pune mai puțin zahăr dacă adaugi stafide.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Fresh mango', 'Mango proaspăt'),
          reason: t(
            'Juicy, tangy-sweet fruit freshens the creamy, spiced rice.',
            'Fructul suculent, dulce-acrișor, înviorează orezul cremos și aromat.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'mango',
        },
        {
          kind: 'drink',
          label: t('Hot tea', 'Ceai fierbinte'),
          reason: t(
            'A little bitterness balances the sweet, creamy kheer.',
            'O amăreală ușoară echilibrează dulceața și cremozitatea kheer-ului.',
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
            'Served warm, it is a comforting bowl in cold weather.',
            'Servit cald, e un castron reconfortant pe vreme rece.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Served chilled, it is a cooling dessert.',
            'Servit rece, e un desert răcoritor.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Thick milk and rice sit heavy in the stomach during exercise.',
            'Laptele gros și orezul cad greu la stomac în timpul efortului.',
          ),
        },
      ],
    },
  ],
};
