import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Pasca base is the Romanian Easter bread: a sweet yeast dough lined into a
// round tin, filled with a baked cottage-cheese filling and crossed with dough.
// The two Variants are not breads: the Russian paskha is a cooked, pressed curd
// dessert (no dough, no oven) and the Neapolitan pastiera is a shortcrust tart
// with ricotta and wheat. None of the base's Recipe-level Tips (the dough dent
// test, the rum, the bread's storage) holds for them, so both Variants hide all
// three and carry their own.
export const pasca: BaseRecipeSeed = {
  slug: 'pasca',
  title: t(
    'Pască (Romanian Easter bread with sweet cheese and raisins)',
    'Pască cu brânză de vaci și stafide',
  ),
  servings: 12,
  prepMinutes: 165,
  cookMinutes: 55,
  difficulty: 'hard',
  lines: [
    {
      ingredient: 'flour',
      quantity: 450,
      unit: 'g',
      note: t(
        '50 g for the sponge, 400 g for the dough, a little more for the table',
        '50 g pentru maia, 400 g pentru aluat, puțină în plus pentru masă',
      ),
    },
    {
      ingredient: 'milk',
      quantity: 0.2,
      unit: 'l',
      note: t('lukewarm', 'căldicel'),
    },
    { ingredient: 'fresh-yeast', quantity: 20, unit: 'g' },
    {
      ingredient: 'sugar',
      quantity: 170,
      unit: 'g',
      note: t(
        '10 g for the sponge, 60 g for the dough, 100 g for the filling',
        '10 g pentru maia, 60 g pentru aluat, 100 g pentru umplutură',
      ),
    },
    {
      ingredient: 'eggs',
      quantity: 6,
      unit: 'pcs',
      note: t(
        '2 for the dough, 3 for the filling, 1 for brushing',
        '2 pentru aluat, 3 pentru umplutură, 1 pentru uns',
      ),
    },
    {
      ingredient: 'butter',
      quantity: 90,
      unit: 'g',
      note: t(
        '80 g melted and cooled to lukewarm, 10 g for the tin',
        '80 g topit și răcit până e căldicel, 10 g pentru tavă',
      ),
    },
    { ingredient: 'salt', quantity: 4, unit: 'g' },
    {
      ingredient: 'lemon',
      quantity: 1,
      unit: 'pcs',
      note: t(
        'zest only, half in the dough and half in the filling',
        'doar coaja rasă, jumătate în aluat și jumătate în umplutură',
      ),
    },
    {
      ingredient: 'sunflower-oil',
      quantity: 20,
      unit: 'ml',
      note: t('for the bowl', 'pentru castron'),
    },
    {
      ingredient: 'cottage-cheese',
      quantity: 600,
      unit: 'g',
      note: t('dry, full-fat', 'uscată, grasă'),
    },
    { ingredient: 'sour-cream', quantity: 150, unit: 'g' },
    { ingredient: 'vanilla-sugar', quantity: 16, unit: 'g' },
    {
      ingredient: 'semolina',
      quantity: 30,
      unit: 'g',
      optional: true,
      note: t(
        'soaks up extra moisture from the cheese',
        'absoarbe umezeala în plus din brânză',
      ),
    },
    { ingredient: 'raisins', quantity: 100, unit: 'g' },
    {
      ingredient: 'rum',
      quantity: 40,
      unit: 'ml',
      optional: true,
      note: t(
        'to soak the raisins; warm water works instead',
        'pentru înmuiat stafidele; merge și apă caldă',
      ),
    },
  ],
  steps: [
    {
      key: 'raisins',
      text: t(
        'Put the raisins in a small bowl and pour over the rum, if using, plus 2 tablespoons of warm water, or just warm water, and stir now and then. Leave them to plump up for 30 minutes while you start the dough.',
        'Pune stafidele într-un bol mic și toarnă peste ele romul, dacă folosești, plus 2 linguri de apă caldă, sau doar apă caldă, și amestecă din când în când. Lasă-le 30 de minute să se umfle, cât timp începi aluatul.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'sponge',
      text: t(
        'Warm the milk until it is only lukewarm: a drop on your wrist should not feel hot, because hot milk kills yeast. Crumble in the yeast, add 10 g of the sugar and 50 g of the flour, stir, and leave for 15 minutes until the top is thick with foam.',
        'Încălzește laptele până e doar căldicel: o picătură pe încheietura mâinii nu trebuie să se simtă fierbinte, pentru că laptele fierbinte omoară drojdia. Mărunțește drojdia în lapte, adaugă 10 g din zahăr și 50 g din făină, amestecă și lasă 15 minute, până se face spumă groasă deasupra.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'dough',
      text: t(
        'In a large bowl beat 2 of the eggs with 60 g of the sugar, the salt and half of the lemon zest. Stir in the foamy sponge, then 400 g of the flour, and mix until no dry flour is left. Wash your hands after handling the raw eggs.',
        'Într-un castron mare bate 2 ouă cu 60 g din zahăr, sarea și jumătate din coaja de lămâie. Adaugă maiaua spumoasă, apoi 400 g din făină, și amestecă până nu mai rămâne făină uscată. Spală-te pe mâini după ce ai atins ouăle crude.',
      ),
    },
    {
      key: 'knead',
      text: t(
        'Knead for 10 minutes by hand on a lightly floured table, or about 7 minutes in a mixer with a dough hook, until the dough is smooth and elastic and only slightly sticky.',
        'Frământă 10 minute cu mâna, pe masa presărată ușor cu făină, sau cam 7 minute cu mixerul cu cârlige de aluat, până când aluatul e neted și elastic și doar puțin lipicios.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'butter',
      text: t(
        'Work in the 80 g of melted, lukewarm butter a little at a time, kneading about 5 minutes in all, until the dough is glossy, soft and comes away from your hands and the bowl.',
        'Încorporează cele 80 g de unt topit și căldicel puțin câte puțin, frământând în total cam 5 minute, până când aluatul e lucios, moale și se desprinde de mâini și de castron.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'rise-1',
      text: t(
        'Shape the dough into a ball, set it in a bowl greased with the oil, cover it with a cloth and leave it in a warm place for about 1 hour, up to 1½ hours in a cool kitchen. It is ready when it has doubled in size and is full of bubbles.',
        'Fă din aluat o bilă, pune-o într-un castron uns cu ulei, acoper-o cu un prosop și lasă-o la loc călduț cam 1 oră, până la 1 oră și jumătate dacă e răcoare în bucătărie. E gata când și-a dublat volumul și e plin de bule.',
      ),
      timerSeconds: 3600,
    },
    {
      key: 'cheese-drain',
      text: t(
        'While the dough rises, tip the cottage cheese into a fine sieve set over a bowl and leave it to drain for 30 minutes.',
        'Cât timp crește aluatul, pune brânza de vaci într-o strecurătoare fină, așezată peste un bol, și lasă-o 30 de minute să se scurgă.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'cheese-press',
      text: t(
        'Press the drained cheese through the sieve with the back of a spoon into a clean bowl, in batches, until it is fine and smooth.',
        'Trece brânza scursă prin strecurătoare, apăsând cu dosul unei linguri, într-un bol curat, în mai multe rânduri, până devine fină și netedă.',
      ),
    },
    {
      key: 'filling',
      text: t(
        'Still while the dough rises, beat 3 eggs with the 100 g of sugar, the vanilla sugar and the remaining lemon zest until the sugar dissolves. Stir in the cheese, the sour cream and the semolina, if using, then drain the raisins, pour the soaking liquid away and fold them in. The filling should be thick and creamy, but still spoonable. Wash your hands after handling the raw eggs.',
        'Tot cât timp crește aluatul, bate 3 ouă cu cele 100 g de zahăr, zahărul vanilat și restul cojii de lămâie, până se topește zahărul. Adaugă brânza, smântâna și grișul, dacă folosești, apoi scurge stafidele, aruncă lichidul de înmuiat și încorporează-le. Umplutura trebuie să fie groasă și cremoasă, dar totuși să se poată lua cu lingura. Spală-te pe mâini după ce ai atins ouăle crude.',
      ),
    },
    {
      key: 'roll',
      text: t(
        'Grease a 26 cm round tin with sides at least 4 cm high (a springform works well) with the 10 g of butter. Tip the risen dough onto a lightly floured table, press the air out gently and set aside a quarter of it. Roll the rest into a circle about 34 cm wide and just under 1 cm thick, and ease it into the tin so it covers the base and the sides up to a height of about 3 cm, with the extra dough folded back as an edge about 1 cm tall.',
        'Unge cu cele 10 g de unt o tavă rotundă de 26 cm, cu marginile înalte de cel puțin 4 cm (merge bine una cu inel detașabil). Răstoarnă aluatul crescut pe masa presărată ușor cu făină, scoate aerul cu mâna și pune deoparte un sfert din el. Întinde restul într-un cerc de cam 34 cm, gros de puțin sub 1 cm, și așază-l în tavă, ca să acopere fundul și marginile până la o înălțime de cam 3 cm, iar surplusul îndoaie-l înapoi, ca o margine de cam 1 cm.',
      ),
    },
    {
      key: 'fill',
      text: t(
        'Spoon the filling into the lined tin and level the top. It should be about 2.5 cm deep, a little below the dough edge.',
        'Toarnă umplutura în tava tapetată cu aluat și nivelează suprafața. Trebuie să aibă cam 2,5 cm grosime, puțin sub marginea de aluat.',
      ),
    },
    {
      key: 'shape',
      text: t(
        'Roll the reserved dough into two ropes about 1.2 cm thick and long enough to go round the tin, and two strips about 1.5 cm wide and 6 mm thick for the cross. Twist the two ropes together and press them onto the dough edge, then lay the two strips across the filling in a cross so they rest on it, pressing their ends into the twisted rope. Shape any leftover dough into a small roll and bake it beside the pască.',
        'Întinde aluatul pus deoparte în două suluri groase de cam 1,2 cm, destul de lungi cât să cuprindă marginea tăvii, și două fâșii late de cam 1,5 cm și groase de 6 mm pentru cruce. Răsucește cele două suluri unul peste altul și apasă-le pe marginea de aluat, apoi pune cele două fâșii peste umplutură, în cruce, ca să se sprijine pe ea, apăsându-le capetele în sulul răsucit. Din aluatul rămas fă un cozonăcel mic și coace-l lângă pască.',
      ),
    },
    {
      key: 'preheat',
      text: t(
        'Turn the oven on to 180 °C (160 °C fan), with the rack in the lower third. It will be hot by the time the pască has finished rising.',
        'Pornește cuptorul la 180 °C (160 °C cu ventilator), cu grătarul în treimea de jos. Va fi încins până termină pasca de crescut.',
      ),
    },
    {
      key: 'rise-2',
      text: t(
        'Cover the pască loosely with a cloth and leave it in a warm place for 30 minutes, until the dough looks puffy and the rope has swelled. A floured fingertip pressed in should leave a dent that springs back slowly.',
        'Acoperă pasca lejer cu un prosop și lasă-o 30 de minute la loc călduț, până când aluatul arată umflat, iar sulul de pe margine a crescut. O urmă lăsată cu degetul înfăinat trebuie să revină încet.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'wash',
      text: t(
        'Beat the last egg and brush it over the dough only, not the filling. Wash your hands afterwards.',
        'Bate ultimul ou și unge cu el doar aluatul, nu umplutura. După aceea spală-te pe mâini.',
      ),
    },
    {
      key: 'bake',
      text: t(
        'Bake for 45 minutes, then check: the dough should be deep golden, and the middle of the filling should be set, no longer wobbling, and read 71 °C on a thermometer. If it is not there yet, bake on and check every 5 minutes. If the top browns too soon, lay a sheet of foil over it.',
        'Coace 45 de minute, apoi verifică: aluatul trebuie să fie auriu închis, iar mijlocul umpluturii trebuie să fie închegat, să nu se mai clatine, și să arate 71 °C la termometru. Dacă nu e gata, mai coace și verifică din 5 în 5 minute. Dacă se rumenește prea repede deasupra, acoper-o cu o folie de aluminiu.',
      ),
      timerSeconds: 2700,
    },
    {
      key: 'cool',
      text: t(
        'Leave the pască in its tin on a rack for about 1 hour, until it is cool enough to handle. Put it in the fridge within 2 hours of leaving the oven, and cover it once it is cold. Unmould it and slice it when it is cold.',
        'Lasă pasca în tavă, pe un grătar, cam 1 oră, până se răcește cât să o poți atinge. Pune-o la frigider în cel mult 2 ore de la scoaterea din cuptor și acoper-o abia după ce s-a răcit. Scoate-o din tavă și taie-o felii când e rece.',
      ),
    },
  ],
  tips: [
    t(
      'Before the pască goes into the oven, press a floured fingertip into the dough: a dent that springs back slowly means it is ready, while one that stays deep means it has over-risen, and the bread will taste yeasty and may sink in the oven.',
      'Înainte să intre pasca în cuptor, apasă aluatul cu degetul înfăinat: dacă urma revine încet, e gata; dacă rămâne adâncă, a crescut prea mult, iar pasca va avea gust de drojdie și se poate lăsa în cuptor.',
    ),
    t(
      'The rum is optional. The raisins keep some of it, and baking does not drive it all off (USDA retention table). For children, anyone pregnant or anyone who avoids alcohol, soak the raisins in warm water instead.',
      'Romul e opțional, iar stafidele păstrează o parte din el, iar coacerea nu îl elimină complet (tabelul de retenție al USDA). Pentru copii, gravide sau oricine evită alcoolul, înmoaie stafidele în apă caldă.',
    ),
    t(
      'The filling is cheese and egg, so once the pască is cool keep it in the fridge, covered, and eat it within 3 to 4 days (USDA leftovers guidance). Take a slice out 20 minutes before eating if you like it less cold.',
      'Umplutura e din brânză și ouă, așa că odată răcită, ține pasca la frigider, acoperită, și consumă-o în 3-4 zile (ghidul USDA pentru resturi). Scoate o felie cu 20 de minute înainte de servire dacă o vrei mai puțin rece.',
    ),
  ],
  stepTips: [
    {
      step: 'cheese-drain',
      text: t(
        'Use a dry, full-fat cottage cheese. A wet or low-fat one gives a loose filling that stays soft in the middle and soaks into the dough.',
        'Folosește brânză de vaci uscată și grasă. Una umedă sau slabă dă o umplutură moale, care rămâne cremoasă la mijloc și se îmbibă în aluat.',
      ),
    },
    {
      step: 'shape',
      text: t(
        'Press the rope firmly onto the dough edge and tuck the ends of the cross into it, so nothing lifts and opens in the oven.',
        'Apasă bine sulul pe marginea de aluat și bagă capetele crucii în el, ca nimic să nu se dezlipească și să se deschidă în cuptor.',
      ),
    },
  ],
  nutritionNote: t(
    'The cottage cheese and eggs give protein and the milk some calcium, but the sugar, the raisins and the butter and sour cream make it a sweet, rich bread with saturated fat and very little fibre from the white flour. Eat it as a small slice.',
    'Brânza de vaci și ouăle dau proteine, iar laptele puțin calciu, dar zahărul, stafidele, untul și smântâna fac din ea o pâine dulce și grasă, cu grăsimi saturate și foarte puține fibre din făina albă. Mănâncă-o în felii mici.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Fresh strawberries', 'Căpșuni proaspete'),
      reason: t(
        'Their fresh acidity cuts through the rich, sweet cheese filling.',
        'Aciditatea lor proaspătă taie din bogăția umpluturii dulci de brânză.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'strawberry',
    },
    {
      kind: 'drink',
      label: t('Coffee', 'Cafea'),
      reason: t(
        'Its bitterness balances the sweetness of the filling and the raisins.',
        'Amăreala ei echilibrează dulceața umpluturii și a stafidelor.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'coffee',
    },
    {
      kind: 'drink',
      label: t('Tea', 'Ceai'),
      reason: t(
        'A hot, unsweetened tea refreshes the palate between slices.',
        'Un ceai cald, neîndulcit, împrospătează gustul între felii.',
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
        'It slices cleanly cold and is easy to serve to a table.',
        'Se taie frumos rece și e ușor de servit la masă.',
      ),
    },
    {
      moment: 'morning',
      polarity: 'good_for',
      reason: t(
        'It is made ahead and keeps in the fridge, so a thin slice with a coffee needs no cooking in the morning.',
        'Se face dinainte și se ține la frigider, așa că o felie subțire cu o cafea nu cere gătit dimineața.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A sweet, rich slice sits heavy before bed.',
        'O felie dulce și grasă cade greu înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'pasca-russian',
      cuisine: 'russian',
      title: t(
        'Paskha (Russian Easter curd-cheese dessert with raisins and candied peel)',
        'Pasha (desert rusesc de Paște din brânză de vaci, cu stafide și coajă confiată)',
      ),
      servings: 12,
      prepMinutes: 820,
      cookMinutes: 10,
      difficulty: 'medium',
      hideBaseTips: [0, 1, 2],
      lines: [
        {
          ingredient: 'cottage-cheese',
          quantity: 900,
          unit: 'g',
          note: t('dry, full-fat', 'uscată, grasă'),
        },
        {
          ingredient: 'eggs',
          quantity: 4,
          unit: 'pcs',
          note: t(
            'yolks only; keep the whites for another use',
            'doar gălbenușurile; păstrează albușurile pentru altceva',
          ),
        },
        { ingredient: 'sugar', quantity: 120, unit: 'g' },
        { ingredient: 'sour-cream', quantity: 150, unit: 'g' },
        {
          ingredient: 'butter',
          quantity: 100,
          unit: 'g',
          note: t('softened', 'moale'),
        },
        { ingredient: 'vanilla-sugar', quantity: 16, unit: 'g' },
        { ingredient: 'raisins', quantity: 80, unit: 'g' },
        {
          ingredient: 'candied-orange-peel',
          quantity: 60,
          unit: 'g',
          note: t('chopped small', 'tocată mărunt'),
        },
        {
          ingredient: 'almonds',
          quantity: 50,
          unit: 'g',
          optional: true,
          note: t('chopped', 'tocate'),
        },
      ],
      steps: [
        {
          key: 'drain',
          text: t(
            'Tip the cottage cheese into a fine sieve set over a bowl and leave it to drain for 30 minutes.',
            'Pune brânza de vaci într-o strecurătoare fină, așezată peste un bol, și lasă-o 30 de minute să se scurgă.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'raisins',
          text: t(
            'While the cheese drains, cover the raisins with warm water. After 15 minutes, drain them and pat them dry on a clean cloth.',
            'Cât timp se scurge brânza, acoperă stafidele cu apă caldă. După 15 minute scurge-le și tamponează-le uscat cu un prosop curat.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'press',
          text: t(
            'Press the drained cheese through the sieve with the back of a spoon into a clean bowl, in batches, until it is fine and smooth. Cover it and keep it in the fridge.',
            'Trece brânza scursă prin strecurătoare, apăsând cu dosul unei linguri, într-un bol curat, în mai multe rânduri, până devine fină și netedă. Acoper-o și ține-o la frigider.',
          ),
        },
        {
          key: 'yolks',
          text: t(
            'In a small heavy-bottomed pan whisk the 4 egg yolks with the sugar until pale, then whisk in the sour cream. Wash your hands after separating the eggs.',
            'Într-o cratiță mică cu fundul gros bate cele 4 gălbenușuri cu zahărul până se albesc, apoi adaugă smântâna și amestecă. Spală-te pe mâini după ce ai separat ouăle.',
          ),
        },
        {
          key: 'cook',
          text: t(
            'Set the pan over low heat and stir constantly with a wooden spoon, scraping the bottom, for about 8 minutes, until the custard thickens enough to coat the back of the spoon and reads 71 °C on a thermometer. Do not let it boil, or the yolks scramble.',
            'Pune cratița pe foc mic și amestecă încontinuu cu o lingură de lemn, răzuind fundul, cam 8 minute, până când crema se îngroașă cât să acopere dosul lingurii și arată 71 °C la termometru. Nu o lăsa să fiarbă, altfel gălbenușurile se taie.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'cool',
          text: t(
            'Pour the hot custard through a sieve into a bowl, and leave it for about 30 minutes, stirring now and then, until it is just lukewarm.',
            'Toarnă crema fierbinte printr-o strecurătoare într-un bol și lasă-o cam 30 de minute, amestecând din când în când, până e doar căldicică.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'butter',
          text: t(
            'Beat the softened butter into the lukewarm custard until smooth, then stir in the vanilla sugar.',
            'Bate untul moale în crema căldicică, până se omogenizează, apoi adaugă zahărul vanilat.',
          ),
        },
        {
          key: 'combine',
          text: t(
            'Fold the sieved cheese into the custard, then the raisins, the candied peel and the almonds, if using, until evenly mixed.',
            'Încorporează brânza trecută prin sită în cremă, apoi stafidele, coaja confiată și migdalele, dacă folosești, până se amestecă uniform.',
          ),
        },
        {
          key: 'mould',
          text: t(
            'Line a clean 2 litre sieve or colander with a double layer of damp, clean cloth, letting it hang over the sides. Spoon in the mixture, press it down, fold the cloth over the top, set a small plate on it with a weight of about 500 g (a tin of beans), and stand the sieve over a bowl.',
            'Tapetează o strecurătoare curată de 2 litri cu un strat dublu de pânză curată și umedă, lăsând-o să atârne pe margini. Pune compoziția cu lingura, apas-o, îndoaie pânza peste ea, așază deasupra o farfurie mică cu o greutate de cam 500 g (o conservă de fasole) și pune strecurătoarea peste un bol.',
          ),
        },
        {
          key: 'chill',
          text: t(
            'Put it in the fridge, within 2 hours of cooking the custard, for at least 12 hours and up to 24, until the whey has drained and the paskha is firm. Pour off the whey when the bowl fills.',
            'Pune-o la frigider, în cel mult 2 ore de la gătirea cremei, cel puțin 12 ore și cel mult 24, până se scurge zerul și pasha se întărește. Varsă zerul când se umple bolul.',
          ),
          timerSeconds: 43200,
        },
        {
          key: 'unmould',
          text: t(
            'Remove the weight and open the cloth, turn the paskha out onto a plate and peel off the cloth. Keep it cold and slice it with a sharp knife.',
            'Ridică greutatea și desfă pânza, răstoarnă pasha pe o farfurie și dezlipește pânza. Ține-o rece și taie-o cu un cuțit ascuțit.',
          ),
        },
      ],
      tips: [
        t(
          'Keep the heat low and stir without stopping: yolks go from creamy to scrambled in seconds. If you see specks of cooked egg, the sieve in the next step catches them.',
          'Ține focul mic și amestecă fără oprire: gălbenușurile trec din cremoase în tăiate în câteva secunde. Dacă vezi bucățele de ou închegat, strecurătoarea din pasul următor le oprește.',
        ),
        t(
          'The custard is cooked to 71 °C, so no raw egg goes into it, but it is still a dairy and egg dessert: keep it in the fridge the whole time and eat it within 3 to 4 days (USDA leftovers guidance). Serve it straight from the fridge.',
          'Crema e gătită până la 71 °C, deci nu intră ou crud, dar rămâne un desert din lactate și ouă: ține-l tot timpul la frigider și consumă-l în 3-4 zile (ghidul USDA pentru resturi). Servește-l direct din frigider.',
        ),
      ],
      stepTips: [
        {
          step: 'mould',
          text: t(
            'Scald the cloth with boiling water and wring it out first. A paskha mould is a truncated pyramid, often carved with ХВ ("Christ is risen") on its sides; a sieve or colander gives a round one and drains just as well.',
            'Opărește pânza cu apă clocotită și stoar-o înainte. Forma de pasha e o piramidă trunchiată, de obicei cu literele ХВ (Hristos a înviat) pe laturi; o strecurătoare dă o formă rotundă și scurge la fel de bine.',
          ),
        },
      ],
      nutritionNote: t(
        'Cottage cheese and egg yolks give protein, and the milk fats and butter make it rich, so it carries saturated fat; the sugar, raisins and candied peel add sweetness without fibre. It is rich and sweet, so a small, dessert-sized portion is enough.',
        'Brânza de vaci și gălbenușurile dau proteine, iar grăsimea din lapte și untul îl fac bogat, deci conține grăsimi saturate; zahărul, stafidele și coaja confiată adaugă dulceață fără fibre. E bogat și dulce, așa că o porție mică de desert ajunge.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t(
            'Kulich (Russian Easter bread with saffron, raisins and candied peel)',
            'Kulich (cozonac rusesc de Paște, cu șofran, stafide și coajă confiată)',
          ),
          reason: t(
            'Paskha is spread on slices of kulich, served together at the Russian Easter table.',
            'Pasha se întinde pe felii de kulich, servite împreună la masa rusească de Paște.',
          ),
          principle: 'regional_tradition',
          recipe: 'cozonac-russian',
        },
        {
          kind: 'food',
          label: t('Fresh strawberries', 'Căpșuni proaspete'),
          reason: t(
            'Their acidity cuts the richness of the sweet cheese.',
            'Aciditatea lor taie din bogăția brânzei dulci.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'strawberry',
        },
        {
          kind: 'drink',
          label: t('Tea', 'Ceai'),
          reason: t(
            'A hot tea cleanses the palate between rich spoonfuls.',
            'Un ceai fierbinte împrospătează gustul între lingurile bogate.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Serve it straight from the fridge and put it back between helpings.',
            'Servește-o direct din frigider și pune-o înapoi între porții.',
          ),
        },
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'It is made a day ahead and needs no oven on the day.',
            'Se face cu o zi înainte și nu cere cuptor în ziua servirii.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A dense, sweet, fatty dessert sits heavy before bed.',
            'Un desert dens, dulce și gras cade greu înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'pasca-italian',
      cuisine: 'italian',
      title: t(
        'Pastiera napoletana (Neapolitan Easter tart with ricotta and wheat berries)',
        'Pastiera napoletana (tartă napolitană de Paște cu ricotta și grâu)',
      ),
      servings: 12,
      prepMinutes: 720,
      cookMinutes: 70,
      difficulty: 'hard',
      hideBaseTips: [0, 1, 2],
      lines: [
        { ingredient: 'flour', quantity: 300, unit: 'g' },
        {
          ingredient: 'lard',
          quantity: 130,
          unit: 'g',
          note: t('very cold, cubed', 'foarte rece, tăiată cubulețe'),
        },
        {
          ingredient: 'sugar',
          quantity: 310,
          unit: 'g',
          note: t(
            '110 g for the pastry, 200 g for the filling',
            '110 g pentru aluat, 200 g pentru umplutură',
          ),
        },
        {
          ingredient: 'eggs',
          quantity: 6,
          unit: 'pcs',
          note: t(
            '2 for the pastry, 4 for the filling',
            '2 pentru aluat, 4 pentru umplutură',
          ),
        },
        { ingredient: 'salt', quantity: 1, unit: 'g' },
        {
          ingredient: 'lemon',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'zest only, one for the pastry and one for the wheat',
            'doar coaja rasă, una pentru aluat și una pentru grâu',
          ),
        },
        {
          ingredient: 'wheat-berries',
          quantity: 250,
          unit: 'g',
          note: t(
            'ready-cooked (grano cotto), drained',
            'gata fierte (grano cotto), scurse',
          ),
        },
        { ingredient: 'milk', quantity: 0.15, unit: 'l' },
        {
          ingredient: 'butter',
          quantity: 30,
          unit: 'g',
          note: t(
            '20 g for the wheat, 10 g for the tin',
            '20 g pentru grâu, 10 g pentru tavă',
          ),
        },
        { ingredient: 'ricotta', quantity: 450, unit: 'g' },
        {
          ingredient: 'candied-citron',
          quantity: 60,
          unit: 'g',
          note: t('diced small', 'tăiată mărunt'),
        },
        {
          ingredient: 'candied-orange-peel',
          quantity: 40,
          unit: 'g',
          note: t('diced small', 'tăiată mărunt'),
        },
        { ingredient: 'orange-blossom-water', quantity: 15, unit: 'ml' },
        { ingredient: 'cinnamon', quantity: 2, unit: 'g' },
        {
          ingredient: 'vanilla-extract',
          quantity: 5,
          unit: 'ml',
          optional: true,
        },
        {
          ingredient: 'icing-sugar',
          quantity: 15,
          unit: 'g',
          optional: true,
          note: t('to dust', 'pentru pudrat'),
        },
      ],
      steps: [
        {
          key: 'pastry',
          text: t(
            'In a large bowl rub the cold lard into the flour, 110 g of the sugar, the salt and one of the lemon zests with your fingertips for about 3 minutes, until it looks like coarse crumbs. Add the 2 eggs and bring it together quickly into a dough, without kneading. Wash your hands after handling the raw eggs.',
            'Într-un castron mare freacă untura rece cu făina, 110 g din zahăr, sarea și coaja unei lămâi, cu vârful degetelor, cam 3 minute, până seamănă cu firimituri mari. Adaugă cele 2 ouă și adună repede un aluat, fără să-l frământi. Spală-te pe mâini după ce ai atins ouăle crude.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'chill',
          text: t(
            'Flatten the dough into a disc, wrap it and chill it for 1 hour, until firm enough to roll.',
            'Aplatizează aluatul într-un disc, învelește-l și ține-l la frigider 1 oră, până se întărește cât să poată fi întins.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'wheat',
          text: t(
            'While the pastry chills, put the drained wheat, the milk, the 20 g of butter and the second lemon zest in a saucepan. Simmer over low heat for about 10 minutes, stirring often, until the milk is absorbed and the wheat is a thick, creamy mass. Take it off the heat and let it cool.',
            'Cât timp se odihnește aluatul, pune în cratiță grâul scurs, laptele, cele 20 g de unt și coaja celei de-a doua lămâi. Fierbe la foc mic cam 10 minute, amestecând des, până se absoarbe laptele și grâul devine o pastă groasă și cremoasă. Dă-l de pe foc și lasă-l să se răcească.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'ricotta-drain',
          text: t(
            'Also while the pastry chills, tip the ricotta into a fine sieve over a bowl and leave it to drain for 30 minutes.',
            'Tot cât timp se odihnește aluatul, pune ricotta într-o strecurătoare fină peste un bol și lasă-o 30 de minute să se scurgă.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'filling',
          text: t(
            'Press the ricotta through the sieve into a bowl, and beat it with the remaining 200 g of sugar until smooth. Beat in the 4 eggs one at a time, then the orange blossom water, the cinnamon and the vanilla, if using. Stir in the candied citron and orange peel and the cooled wheat. Wash your hands after handling the raw eggs.',
            'Trece ricotta prin strecurătoare într-un bol și bate-o cu restul de 200 g de zahăr până devine netedă. Adaugă cele 4 ouă, unul câte unul, apoi apa de flori de portocal, scorțișoara și vanilia, dacă folosești. Încorporează coaja confiată de chitră și de portocală și grâul răcit. Spală-te pe mâini după ce ai atins ouăle crude.',
          ),
        },
        {
          key: 'preheat',
          text: t(
            'Turn the oven on to 170 °C (150 °C fan), with the rack in the lower third and a baking sheet on it. It will be hot by the time the tart is ready to bake.',
            'Pornește cuptorul la 170 °C (150 °C cu ventilator), cu grătarul în treimea de jos și o tavă de copt pe el. Va fi încins până când tarta e gata de copt.',
          ),
        },
        {
          key: 'line',
          text: t(
            'Grease a 24 cm tart tin with a loose base and sides at least 4 cm high with the 10 g of butter. Roll out two thirds of the pastry between two sheets of baking paper to about 5 mm thick and ease it into the tin, pressing it into the corners. Trim it level with the rim, about 4 cm up the sides and chill the leftover pastry.',
            'Unge cu cele 10 g de unt o formă de tartă de 24 cm, cu fund detașabil și margini de cel puțin 4 cm. Întinde două treimi din aluat între două foi de hârtie de copt, la o grosime de cam 5 mm, și așază-l în formă, apăsându-l în colțuri. Taie-l la nivelul marginii, la cam 4 cm înălțime și ține restul aluatului la rece.',
          ),
        },
        {
          key: 'fill',
          text: t(
            'Pour the filling into the pastry case and level the top. It should come to about 5 mm below the pastry edge.',
            'Toarnă umplutura în coaja de aluat și nivelează suprafața. Trebuie să ajungă la cam 5 mm sub marginea de aluat.',
          ),
        },
        {
          key: 'lattice',
          text: t(
            'Roll the leftover pastry to about 4 mm thick and cut it into seven strips 1.5 cm wide. Lay four across the tart, then weave or lay the other three at an angle over them to make diamonds, and press the ends onto the pastry edge.',
            'Întinde restul de aluat la cam 4 mm grosime și taie-l în șapte fâșii late de 1,5 cm. Așază patru peste tartă, apoi alte trei în unghi peste ele, împletite sau doar suprapuse, ca să iasă romburi, și apasă capetele pe marginea de aluat.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Set the tin on the hot baking sheet and bake for 60 minutes, then check: the pastry should be golden, the filling puffed and amber-coloured, set across the middle and reading 71 °C on a thermometer. If it is not there yet, bake on and check every 10 minutes. If the lattice browns too soon, lay foil over it.',
            'Așază forma pe tava încinsă și coace 60 de minute, apoi verifică: aluatul trebuie să fie auriu, umplutura umflată și de culoarea chihlimbarului, închegată în mijloc și să arate 71 °C la termometru. Dacă nu e gata, mai coace și verifică din 10 în 10 minute. Dacă rețeaua de aluat se rumenește prea repede, acoper-o cu folie de aluminiu.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'cool',
          text: t(
            'Leave the tart in its tin on a rack for about 1 hour, then put it in the fridge within 2 hours of leaving the oven, and cover it once it is cold. Leave it overnight so the filling firms up and the flavours settle.',
            'Lasă tarta în formă, pe un grătar, cam 1 oră, apoi pune-o la frigider în cel mult 2 ore de la scoaterea din cuptor și acoper-o abia după ce s-a răcit. Lasă-o peste noapte, ca umplutura să se întărească, iar aromele să se contopească.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Unmould the cold tart, dust it with the icing sugar if you like, and cut it into slices.',
            'Scoate tarta rece din formă, pudreaz-o cu zahăr pudră dacă dorești și taie-o felii.',
          ),
        },
      ],
      tips: [
        t(
          'If you start from dried wheat berries instead of a jar, soak them overnight (some recipes soak up to 3 days, changing the water daily), then simmer them in plenty of water for roughly 1 to 1½ hours until they are tender and split a little. Hard wheat takes longer. Drain well, then cook with the milk as in the recipe.',
          'Dacă pornești de la grâu uscat, nu din borcan, înmoaie-l peste noapte (unele rețete îl țin până la 3 zile, schimbând apa zilnic), apoi fierbe-l în multă apă cam 1 oră până la 1 oră și jumătate, până se înmoaie și crapă ușor. Grâul tare durează mai mult. Scurge-l bine, apoi gătește-l cu laptele ca în rețetă.',
        ),
        t(
          'Lard gives the pastry its short, tender bite. If you would rather not use it, replace it with the same weight of cold butter; the pastry will taste richer and brown a little faster.',
          'Untura dă aluatului textura fragedă și friabilă. Dacă nu vrei s-o folosești, înlocuiește-o cu aceeași cantitate de unt rece; aluatul va avea gust mai bogat și se va rumeni puțin mai repede.',
        ),
        t(
          'The filling has raw egg until it bakes, so do not taste it before baking. Once the tart is cool, keep it in the fridge, covered, and eat it within 3 to 4 days (USDA leftovers guidance).',
          'Umplutura conține ou crud până se coace, așa că nu o gusta înainte de copt. După ce s-a răcit, ține tarta la frigider, acoperită, și consumă-o în 3-4 zile (ghidul USDA pentru resturi).',
        ),
      ],
      stepTips: [
        {
          step: 'pastry',
          text: t(
            'Keep the lard and your hands cold and stop as soon as the dough holds together. Overworked pastry shrinks and turns tough in the oven.',
            'Ține untura și mâinile reci și oprește-te de îndată ce aluatul se leagă. Un aluat prea lucrat se strânge și iese tare la copt.',
          ),
        },
      ],
      nutritionNote: t(
        'Ricotta and eggs give protein, and the whole wheat grain adds a little fibre, but the lard, butter and ricotta bring saturated fat and the sugar and candied peel make it very sweet. It is dense and filling, so a thin slice is enough.',
        'Ricotta și ouăle dau proteine, iar grâul boabe adaugă puține fibre, dar untura, untul și ricotta aduc grăsimi saturate, iar zahărul și coaja confiată o fac foarte dulce. E densă și săturătoare, așa că o felie subțire ajunge.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Espresso', 'Espresso'),
          reason: t(
            'Its bitterness balances the sweet, rich filling.',
            'Amăreala lui echilibrează umplutura dulce și bogată.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'coffee',
        },
        {
          kind: 'food',
          label: t('Fresh orange segments', 'Felii proaspete de portocală'),
          reason: t(
            'Fresh orange echoes the candied citrus and orange blossom water, and its acidity lifts the ricotta.',
            'Portocala proaspătă amintește de coaja confiată și apa de flori de portocal, iar aciditatea ei înviorează ricotta.',
          ),
          principle: 'complement_flavour',
          ingredient: 'orange',
        },
      ],
      eatingMoments: [
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'It is baked a day ahead and cuts into neat slices cold.',
            'Se coace cu o zi înainte și se taie felii curate, rece.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A dense, sweet, fatty slice sits heavy before bed.',
            'O felie densă, dulce și grasă cade greu înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
