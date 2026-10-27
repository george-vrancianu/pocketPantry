import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Salam de biscuiți base is the Romanian no-bake chocolate log, made with
// a cooked milk-and-cocoa syrup (no raw egg). Each Variant is a full Recipe
// with its own lines, steps and guidance; the base's Recipe-level Tips are
// inherited unless a Variant hides them.
export const salamDeBiscuiti: BaseRecipeSeed = {
  slug: 'salam-de-biscuiti',
  title: t(
    'Romanian chocolate biscuit log (salam de biscuiți)',
    'Salam de biscuiți cu rahat',
  ),
  servings: 12,
  prepMinutes: 265,
  cookMinutes: 8,
  difficulty: 'easy',
  lines: [
    { ingredient: 'milk', quantity: 0.1, unit: 'l' },
    { ingredient: 'sugar', quantity: 120, unit: 'g' },
    { ingredient: 'cocoa-powder', quantity: 35, unit: 'g' },
    { ingredient: 'butter', quantity: 125, unit: 'g' },
    { ingredient: 'vanilla-sugar', quantity: 8, unit: 'g' },
    {
      ingredient: 'rum-essence',
      quantity: 5,
      unit: 'ml',
      optional: true,
    },
    {
      ingredient: 'biscuits',
      quantity: 400,
      unit: 'g',
      note: t('plain, petit beurre type', 'simpli, de tip petit beurre'),
    },
    {
      ingredient: 'turkish-delight',
      quantity: 150,
      unit: 'g',
      note: t('cut into small cubes', 'tăiat cubulețe mici'),
    },
    {
      ingredient: 'walnuts',
      quantity: 100,
      unit: 'g',
      optional: true,
      note: t('roughly chopped', 'tocate grosier'),
    },
    {
      ingredient: 'desiccated-coconut',
      quantity: 30,
      unit: 'g',
      optional: true,
      note: t('for rolling', 'pentru tăvălit'),
    },
    {
      ingredient: 'icing-sugar',
      quantity: 20,
      unit: 'g',
      optional: true,
      note: t('for rolling', 'pentru tăvălit'),
    },
  ],
  steps: [
    {
      key: 'whisk',
      text: t(
        'Put the milk, sugar and cocoa in a saucepan and whisk them cold until smooth, with no cocoa lumps.',
        'Pune laptele, zahărul și cacaoa într-o cratiță și amestecă-le la rece cu un tel, până se omogenizează și nu mai rămân cocoloașe de cacao.',
      ),
    },
    {
      key: 'boil',
      text: t(
        'Set the pan over medium heat and stir until it comes to the boil, then let it bubble gently for 2 minutes, stirring, until the sugar has dissolved and the syrup is glossy. Use a pan with room to spare: milk rises fast.',
        'Pune cratița la foc mediu și amestecă până dă în clocot, apoi lasă să fiarbă încet 2 minute, amestecând, până se topește zahărul și siropul e lucios. Folosește o cratiță încăpătoare: laptele dă repede în foc.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'butter',
      text: t(
        'Take the pan off the heat. Add the butter and stir until it has melted completely, then stir in the vanilla sugar and the rum essence, if using.',
        'Dă cratița de pe foc. Adaugă untul și amestecă până se topește complet, apoi adaugă zahărul vanilat și esența de rom, dacă folosești.',
      ),
    },
    {
      key: 'cool',
      text: t(
        'Pour the syrup into a large bowl and leave it for about 15 minutes, until it is only just warm to the touch. Break the biscuits while you wait.',
        'Toarnă siropul într-un castron mare și lasă-l vreo 15 minute, până e doar călduț la atingere. Rupe biscuiții cât timp aștepți.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'break',
      text: t(
        'Break the biscuits by hand into pieces the size of a thumbnail, with a few smaller crumbs, and put them in a second large bowl.',
        'Rupe biscuiții cu mâna în bucăți cam cât unghia degetului mare, cu câteva firimituri mai mici, și pune-i într-un al doilea castron mare.',
      ),
    },
    {
      key: 'mix',
      text: t(
        'Add the Turkish delight and the walnuts, if using, to the biscuits. Pour the warm syrup over and fold until every piece is coated and the mixture clumps together when you squeeze a handful.',
        'Adaugă rahatul și nucile, dacă folosești, peste biscuiți. Toarnă siropul călduț și amestecă până fiecare bucată e acoperită, iar compoziția se leagă când strângi o mână de ea în pumn.',
      ),
    },
    {
      key: 'shape',
      text: t(
        'Divide the mixture in two. Spoon each half onto a sheet of cling film, shape it into a log about 24 cm long, then roll it up tightly in the film and twist the ends like a sweet wrapper. Press along the log to close any gaps.',
        'Împarte compoziția în două. Pune fiecare jumătate pe o folie alimentară, formează un baton de vreo 24 cm, apoi rulează-l strâns în folie și răsucește capetele ca la o bomboană. Apasă de-a lungul batonului ca să nu rămână goluri.',
      ),
    },
    {
      key: 'chill',
      text: t(
        'Chill the logs in the fridge for at least 4 hours. They are ready when a log feels firm all the way through, with no soft give when you press it.',
        'Ține batoanele la frigider cel puțin 4 ore. Sunt gata când batonul e ferm în tot miezul, fără să cedeze moale când îl apeși.',
      ),
      timerSeconds: 14400,
    },
    {
      key: 'slice',
      text: t(
        'Unwrap one log and roll it in the coconut or icing sugar, if you like. Cut it into slices about 2 cm thick with a sharp knife, wiping the blade between cuts. Keep the second log in the fridge until you need it.',
        'Desfă un baton din folie și tăvălește-l prin cocos sau zahăr pudră, dacă vrei. Taie-l felii groase de vreo 2 cm cu un cuțit bine ascuțit, ștergând lama între tăieturi. Pe al doilea baton ține-l la frigider până îți trebuie.',
      ),
    },
  ],
  tips: [
    t(
      'Break the biscuits by hand or press them in a bag with a rolling pin, and keep thumbnail-sized pieces. A food processor turns them to paste, and the slices lose their marbled look.',
      'Rupe biscuiții cu mâna sau strivește-i într-o pungă cu sucitorul și păstrează bucăți cât unghia. Robotul îi face pastă, iar feliile pierd aspectul marmorat.',
    ),
    t(
      'Rum essence is only a flavouring and a teaspoon is enough, but brands differ: read the label, because some contain alcohol. For small children choose an alcohol-free one or leave it out.',
      'Esența de rom e doar un aromatizant și o linguriță ajunge, dar mărcile diferă: citește eticheta, pentru că unele conțin alcool. Pentru copii mici alege una fără alcool sau las-o deoparte.',
    ),
    t(
      'The syrup is boiled and there is no egg in it, so it suits children, older people and anyone pregnant, with alcohol-free rum essence, or none.',
      'Siropul e fiert și nu conține ou, așa că se potrivește copiilor, vârstnicilor și gravidelor, cu esență de rom fără alcool sau fără esență.',
    ),
    t(
      'Keep it covered in the fridge, up to 5 days, and take it out only to serve. Butter softens quickly at room temperature and the slices lose their shape.',
      'Păstrează-l acoperit la frigider, până la 5 zile, și scoate-l doar pentru servire. Untul se înmoaie repede la temperatura camerei, iar feliile își pierd forma.',
    ),
  ],
  stepTips: [
    {
      step: 'cool',
      text: t(
        'Do not mix while the syrup is hot: it melts the Turkish delight into a sticky mass and the cubes vanish from the slices.',
        'Nu amesteca cât siropul e fierbinte: topește rahatul într-o masă lipicioasă și cubulețele dispar din felii.',
      ),
    },
  ],
  nutritionNote: t(
    'Quick energy from the sugar and biscuits, and the walnuts add some unsaturated fat. But butter and sugar make it dense in saturated fat and sugar, and it has little fibre or protein. A thin slice is plenty; the Turkish delight adds still more sugar.',
    'Dă energie rapidă din zahăr și biscuiți, iar nucile aduc și ceva grăsimi nesaturate. Dar untul și zahărul îl fac bogat în grăsimi saturate și zahăr, cu puține fibre și proteine. O felie subțire ajunge; rahatul mai adaugă zahăr.',
  ),
  pairings: [
    {
      kind: 'drink',
      label: t('Coffee', 'Cafea'),
      reason: t(
        'Its bitterness balances the sweet, buttery slice.',
        'Amăreala ei echilibrează felia dulce și untoasă.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'coffee',
    },
    {
      kind: 'drink',
      label: t('Tea', 'Ceai'),
      reason: t(
        'Unsweetened tea cuts through the sugar and butter.',
        'Un ceai neîndulcit taie din dulceața și din untul feliei.',
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
        'A small slice with a hot drink suits a cold afternoon.',
        'O felie mică lângă o băutură caldă se potrivește unei după-amiezi reci.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Very sweet and rich, and easy to overeat just before bed; cocoa also contains a little caffeine.',
        'Foarte dulce și gras, ușor de mâncat în exces chiar înainte de culcare; cacaoa conține și puțină cafeină.',
      ),
    },
  ],
  variants: [
    {
      slug: 'salam-de-biscuiti-british',
      cuisine: 'british',
      title: t(
        'Chocolate tiffin (Scottish no-bake biscuit and raisin slice)',
        'Tiffin (prăjitură scoțiană fără coacere, cu biscuiți, stafide și ciocolată)',
      ),
      servings: 16,
      prepMinutes: 160,
      cookMinutes: 10,
      difficulty: 'easy',
      hideBaseTips: [0, 1, 2, 3],
      lines: [
        { ingredient: 'butter', quantity: 150, unit: 'g' },
        { ingredient: 'golden-syrup', quantity: 60, unit: 'g' },
        { ingredient: 'cocoa-powder', quantity: 30, unit: 'g' },
        {
          ingredient: 'sugar',
          quantity: 25,
          unit: 'g',
          optional: true,
        },
        {
          ingredient: 'digestive-biscuits',
          quantity: 300,
          unit: 'g',
        },
        { ingredient: 'raisins', quantity: 100, unit: 'g' },
        {
          ingredient: 'chocolate',
          quantity: 200,
          unit: 'g',
          note: t('milk chocolate, broken up', 'cu lapte, rupte bucăți'),
        },
      ],
      steps: [
        {
          key: 'line',
          text: t(
            'Line a 20 × 20 cm tin with baking paper, leaving the paper hanging over two sides so you can lift the slab out later.',
            'Tapetează o tavă de 20 × 20 cm cu hârtie de copt, lăsând hârtia să atârne pe două laturi, ca să poți scoate prăjitura ușor.',
          ),
        },
        {
          key: 'melt',
          text: t(
            'Put the butter, golden syrup, cocoa and the sugar, if using, in a saucepan over low heat. Stir until the butter has melted and the mixture is smooth, about 4 minutes. Do not let it boil hard.',
            'Pune untul, siropul auriu, cacaoa și zahărul, dacă folosești, într-o cratiță la foc mic. Amestecă până se topește untul și compoziția e netedă, cam 4 minute. Nu o lăsa să fiarbă tare.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'crush',
          text: t(
            'Put the digestives in a bag and crush them with a rolling pin into a mix of crumbs and pea-sized chunks, then tip them into a large bowl with the raisins.',
            'Pune biscuiții digestivi într-o pungă și strivește-i cu sucitorul, până obții un amestec de firimituri și bucățele cât bobul de mazăre, apoi toarnă-i într-un castron mare, împreună cu stafidele.',
          ),
        },
        {
          key: 'mix',
          text: t(
            'Pour the warm syrup over the biscuits and stir until nothing is dry.',
            'Toarnă siropul cald peste biscuiți și amestecă până nu mai rămâne nimic uscat.',
          ),
        },
        {
          key: 'press',
          text: t(
            'Tip the mixture into the tin and press it down firmly and level with the back of a spoon, into the corners too.',
            'Răstoarnă compoziția în tavă și apasă-o ferm și egal cu dosul unei linguri, inclusiv în colțuri.',
          ),
        },
        {
          key: 'chill-base',
          text: t(
            'Chill the base for 15 minutes, so it does not melt the chocolate when you spread it.',
            'Ține baza la frigider 15 minute, ca să nu topească ciocolata când o întinzi.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'melt-chocolate',
          text: t(
            'Melt the chocolate in a heatproof bowl over a pan of barely simmering water, with the bowl not touching the water. Stir gently and take it off the heat while a few small lumps remain, then stir until smooth. Or microwave it in 20-second bursts, stirring in between.',
            'Topește ciocolata într-un castron termorezistent deasupra unei oale cu apă care abia fierbe la foc mic, fără ca fundul castronului să atingă apa. Amestecă încet și ia castronul de pe foc când mai rămân câteva bucățele mici, apoi amestecă până se omogenizează. Sau încălzește-o la microunde în reprize de 20 de secunde, amestecând între ele.',
          ),
        },
        {
          key: 'spread',
          text: t(
            'Pour the melted chocolate over the chilled base and spread it right to the edges with a spatula.',
            'Toarnă ciocolata topită peste baza rece și întinde-o cu o spatulă până la margini.',
          ),
        },
        {
          key: 'chill',
          text: t(
            'Chill for at least 2 hours, until the chocolate is set hard and the slab feels firm when you press the middle.',
            'Ține la frigider cel puțin 2 ore, până ciocolata se întărește și prăjitura e fermă când apeși în mijloc.',
          ),
          timerSeconds: 7200,
        },
        {
          key: 'cut',
          text: t(
            'Lift the slab out by the paper. Dip a large knife in hot water, wipe it dry and cut the slab into 16 squares, wiping and re-heating the blade between cuts.',
            'Scoate prăjitura din tavă trăgând de hârtie. Înmoaie un cuțit mare în apă fierbinte, șterge-l și taie-o în 16 pătrate, ștergând și încălzind lama între tăieturi.',
          ),
        },
      ],
      tips: [
        t(
          'Keep the tiffin covered in the fridge, 4 to 5 days, and take it out only to serve. The chocolate top softens and dulls at room temperature.',
          'Păstrează tiffin-ul acoperit la frigider, 4-5 zile, și scoate-l doar pentru servire. Stratul de ciocolată se înmoaie și se mătuiește la temperatura camerei.',
        ),
        t(
          'Water is the enemy of melted chocolate: a drop of water or steam makes it seize into a thick, grainy paste. Keep the bowl and spatula dry and the water below a gentle simmer.',
          'Apa e dușmanul ciocolatei topite: o picătură de apă sau de abur o face să se încleieze într-o pastă groasă, granulată. Ține castronul și spatula uscate și apa doar să fiarbă ușor, la foc mic.',
        ),
      ],
      stepTips: [
        {
          step: 'cut',
          text: t(
            'A cold, hard chocolate top cracks under a cold knife. A warm, dry blade cuts through cleanly.',
            'Stratul de ciocolată rece și tare crapă sub un cuțit rece. O lamă caldă și uscată taie curat.',
          ),
        },
      ],
      nutritionNote: t(
        'Quick energy from biscuits, sugar and syrup, and the raisins add a little fibre. But butter and chocolate make it high in saturated fat, and it is very sweet. Cut small squares.',
        'Dă energie rapidă din biscuiți, zahăr și sirop, iar stafidele aduc puține fibre. Dar untul și ciocolata îl fac bogat în grăsimi saturate, iar dulceața e mare. Taie pătrate mici.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Tea', 'Ceai'),
          reason: t(
            'A cup of strong tea cuts through the sweet, buttery chocolate.',
            'O ceașcă de ceai tare taie din ciocolata dulce și untoasă.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'tea',
        },
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'Its bitterness answers the golden syrup and milk chocolate.',
            'Amăreala ei răspunde siropului auriu și ciocolatei cu lapte.',
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
            'A square with a hot drink suits a cold afternoon.',
            'Un pătrat lângă o băutură caldă se potrivește unei după-amiezi reci.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Very sweet and rich, and easy to overeat before bed; the chocolate also has a little caffeine.',
            'Foarte dulce și gras, ușor de mâncat în exces înainte de culcare; ciocolata conține și puțină cafeină.',
          ),
        },
      ],
    },
    {
      slug: 'salam-de-biscuiti-russian',
      cuisine: 'russian',
      title: t(
        "Kartoshka (Russian chocolate biscuit 'potato' cakes)",
        'Kartoșka (prăjituri rusești „cartofi”, din biscuiți, cacao și lapte condensat)',
      ),
      servings: 12,
      prepMinutes: 85,
      difficulty: 'easy',
      hideBaseTips: [0, 1, 2, 3],
      lines: [
        { ingredient: 'biscuits', quantity: 300, unit: 'g' },
        {
          ingredient: 'walnuts',
          quantity: 60,
          unit: 'g',
        },
        {
          ingredient: 'butter',
          quantity: 100,
          unit: 'g',
          note: t('soft', 'moale'),
        },
        { ingredient: 'condensed-milk', quantity: 170, unit: 'g' },
        {
          ingredient: 'cocoa-powder',
          key: 'cocoa-dough',
          quantity: 20,
          unit: 'g',
          note: t('for the dough', 'pentru aluat'),
        },
        {
          ingredient: 'rum',
          quantity: 15,
          unit: 'ml',
          optional: true,
        },
        {
          ingredient: 'cocoa-powder',
          key: 'cocoa-coating',
          quantity: 15,
          unit: 'g',
          note: t('for rolling', 'pentru tăvălit'),
        },
        {
          ingredient: 'icing-sugar',
          quantity: 20,
          unit: 'g',
          note: t('for rolling', 'pentru tăvălit'),
        },
      ],
      steps: [
        {
          key: 'crumb',
          text: t(
            'Blitz the biscuits and walnuts in a food processor to fine crumbs, with a few tiny nut pieces left. Or crush them in a bag with a rolling pin. Tip into a large bowl.',
            'Mărunțește biscuiții și nucile în robot până obții firimituri fine, cu câteva bucățele mici de nucă rămase. Sau strivește-le într-o pungă cu sucitorul. Toarnă-le într-un castron mare.',
          ),
        },
        {
          key: 'cream',
          text: t(
            'In another bowl, beat the soft butter with 130 g of the condensed milk for about 2 minutes, until creamy and pale. Keep the other 40 g of condensed milk back for the dough step.',
            'Într-un alt castron, bate untul moale cu 130 g din laptele condensat vreo 2 minute, până devine cremos și deschis la culoare. Păstrează restul de 40 g de lapte condensat pentru pasul cu aluatul.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'reserve',
          text: t(
            'If you want the "sprouts", scoop 2 tablespoons of this cream into a small bowl and put it in the fridge.',
            'Dacă vrei „mugurii”, ia 2 linguri din cremă într-un bol mic și pune-l la frigider.',
          ),
        },
        {
          key: 'dough',
          text: t(
            'Add the cocoa for the dough, the crumbs and the rum, if using, to the cream, and work it with a spoon, then your hands, into a dough like modelling clay. If it crumbles, work in a spoonful of the condensed milk you kept back.',
            'Adaugă cacaoa pentru aluat, firimiturile și romul, dacă folosești, peste cremă și lucrează cu lingura, apoi cu mâinile, până obții un aluat ca plastilina. Dacă se sfărâmă, adaugă o lingură din laptele condensat păstrat deoparte.',
          ),
        },
        {
          key: 'shape',
          text: t(
            'Take pieces of about 50 g and roll them between your palms into 12 small oval "potatoes".',
            'Ia bucăți de vreo 50 g și formează între palme 12 „cartofi” mici, ovali.',
          ),
        },
        {
          key: 'coat',
          text: t(
            'Mix the cocoa and icing sugar for rolling on a plate and roll each potato in it until evenly coated.',
            'Amestecă pe o farfurie cacaoa și zahărul pudră pentru tăvălit și rulează fiecare cartof prin ele, până e acoperit uniform.',
          ),
        },
        {
          key: 'sprouts',
          text: t(
            'If using, dab two tiny dots of the reserved cream on each potato with the tip of a teaspoon, for the sprouts.',
            'Dacă folosești, pune pe fiecare cartof două puncte mici din crema păstrată, cu vârful unei lingurițe, pentru muguri.',
          ),
        },
        {
          key: 'chill',
          text: t(
            'Chill the potatoes for 1 hour on a plate, until they feel firm to the touch and hold their shape.',
            'Ține cartofii o oră la frigider, pe o farfurie, până sunt fermi la atingere și își păstrează forma.',
          ),
          timerSeconds: 3600,
        },
      ],
      tips: [
        t(
          'Keep the potatoes covered in the fridge, 4 to 5 days, and take them out only to serve. They soften and lose their shape at room temperature.',
          'Păstrează cartofii acoperiți la frigider, 4-5 zile, și scoate-i doar pentru servire. La temperatura camerei se înmoaie și își pierd forma.',
        ),
        t(
          'Rum is optional and the alcohol stays in because nothing is cooked. For children leave it out, or use a few drops of rum essence from an alcohol-free brand.',
          'Romul e opțional, iar alcoolul rămâne în prăjituri, pentru că nu se gătește nimic. Pentru copii nu-l pune sau folosește câteva picături de esență de rom fără alcool.',
        ),
      ],
      stepTips: [
        {
          step: 'dough',
          text: t(
            'If the dough sticks to your hands, chill the bowl for 15 minutes and shape the potatoes with slightly damp palms.',
            'Dacă aluatul se lipește de mâini, ține castronul 15 minute la frigider și modelează cartofii cu palmele ușor umede.',
          ),
        },
      ],
      nutritionNote: t(
        'Quick energy from the biscuits, condensed milk and sugar, and the walnuts add some unsaturated fat. But butter and condensed milk make it high in sugar and saturated fat. One potato is a treat, not a snack.',
        'Dă energie rapidă din biscuiți, lapte condensat și zahăr, iar nucile aduc ceva grăsimi nesaturate. Dar untul și laptele condensat îl fac bogat în zahăr și grăsimi saturate. Un cartof e un răsfăț, nu o gustare.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Tea', 'Ceai'),
          reason: t(
            'Strong black tea balances the sweet condensed milk.',
            'Un ceai negru tare echilibrează laptele condensat dulce.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'tea',
        },
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'Bitter coffee answers the cocoa and sweetness.',
            'Cafeaua amară răspunde cacaoei și dulceții.',
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
            'A small potato with a hot drink suits a cold afternoon.',
            'Un cartof mic lângă o băutură caldă se potrivește unei după-amiezi reci.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Very sweet and rich, and easy to overeat before bed; cocoa also has a little caffeine.',
            'Foarte dulce și gras, ușor de mâncat în exces înainte de culcare; cacaoa conține și puțină cafeină.',
          ),
        },
      ],
    },
  ],
};
