import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Cozonac base is the Romanian sweet yeast bread rolled around a walnut and
// cocoa filling, twisted and baked in loaf tins. Each Variant is a full Recipe
// with its own lines, steps and guidance. The base's three Recipe-level Tips
// (lukewarm ingredients, dried yeast, a warm place for rising) hold for both
// Variants, except that the panettone rises at a set 24 to 26 degrees, so it
// hides the warm-place Tip. The walnut and storage advice sits in each recipe's
// own steps and step Tips, because those differ.
export const cozonac: BaseRecipeSeed = {
  slug: 'cozonac',
  title: t(
    'Cozonac (Romanian sweet bread with walnut and cocoa swirl)',
    'Cozonac cu nucă și cacao',
  ),
  servings: 20,
  prepMinutes: 285,
  cookMinutes: 120,
  difficulty: 'hard',
  lines: [
    { ingredient: 'fresh-yeast', quantity: 40, unit: 'g' },
    {
      ingredient: 'milk',
      quantity: 0.5,
      unit: 'l',
      note: t(
        '150 ml for the starter, 250 ml for the dough, 100 ml for the filling; the first two lukewarm',
        '150 ml pentru maia, 250 ml pentru aluat, 100 ml pentru umplutură; primele două căldicele',
      ),
    },
    {
      ingredient: 'sugar',
      quantity: 460,
      unit: 'g',
      note: t(
        '10 g for the starter, 250 g for the dough, 200 g for the filling',
        '10 g pentru maia, 250 g pentru aluat, 200 g pentru umplutură',
      ),
    },
    {
      ingredient: 'flour',
      quantity: 1050,
      unit: 'g',
      note: t(
        '30 g for the starter, 970 g for the dough, about 50 g for the table',
        '30 g pentru maia, 970 g pentru aluat, cam 50 g pentru masă',
      ),
    },
    {
      ingredient: 'eggs',
      quantity: 7,
      unit: 'pcs',
      note: t(
        '6 yolks for the dough, 1 whole egg for brushing',
        '6 gălbenușuri pentru aluat, 1 ou întreg pentru uns',
      ),
    },
    { ingredient: 'vanilla-sugar', quantity: 16, unit: 'g' },
    { ingredient: 'salt', quantity: 8, unit: 'g' },
    {
      ingredient: 'lemon',
      quantity: 1,
      unit: 'pcs',
      note: t('zest only', 'doar coaja rasă'),
    },
    {
      ingredient: 'orange',
      quantity: 1,
      unit: 'pcs',
      note: t('zest only', 'doar coaja rasă'),
    },
    {
      ingredient: 'rum-essence',
      quantity: 20,
      unit: 'ml',
      note: t(
        '10 ml for the dough, 10 ml for the filling',
        '10 ml pentru aluat, 10 ml pentru umplutură',
      ),
    },
    {
      ingredient: 'butter',
      quantity: 200,
      unit: 'g',
      note: t(
        'melted and cooled to lukewarm',
        'topit și răcit până e căldicel',
      ),
    },
    {
      ingredient: 'sunflower-oil',
      quantity: 50,
      unit: 'ml',
      note: t(
        'for your hands, the bowl and the tins',
        'pentru mâini, castron și tăvi',
      ),
    },
    {
      ingredient: 'walnuts',
      quantity: 300,
      unit: 'g',
      note: t('ground', 'măcinate'),
    },
    { ingredient: 'cocoa-powder', quantity: 40, unit: 'g' },
    {
      ingredient: 'raisins',
      quantity: 150,
      unit: 'g',
      note: t(
        'soaked in warm water and drained',
        'înmuiate în apă caldă și scurse',
      ),
    },
    {
      ingredient: 'turkish-delight',
      quantity: 100,
      unit: 'g',
      optional: true,
      note: t('diced small', 'tăiat cubulețe mici'),
    },
  ],
  steps: [
    {
      key: 'starter',
      text: t(
        'Warm 150 ml of the milk until it is only lukewarm: a drop on your wrist should not feel hot. Crumble in the yeast, add 10 g of the sugar and 30 g of the flour, stir, and leave for 15 minutes until the top is thick with foam.',
        'Încălzește 150 ml din lapte până e doar căldicel: o picătură pe încheietura mâinii nu trebuie să se simtă fierbinte. Mărunțește drojdia în lapte, adaugă 10 g din zahăr și 30 g din făină, amestecă și lasă 15 minute, până se face spumă groasă deasupra.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'yolks',
      text: t(
        'In a large bowl beat the 6 egg yolks with 250 g of the sugar for about 3 minutes, until pale and thick. Stir in the vanilla sugar, the salt, the lemon and orange zest and 10 ml of the rum essence. Keep the 6 egg whites for another use.',
        'Într-un castron mare freacă cele 6 gălbenușuri cu 250 g din zahăr cam 3 minute, până se albesc și se îngroașă. Adaugă zahărul vanilat, sarea, coaja de lămâie și de portocală și 10 ml din esența de rom. Păstrează cele 6 albușuri pentru altceva.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'dough',
      text: t(
        'Add the foamy yeast and 250 ml of lukewarm milk to the yolks. Add 970 g of the flour, a bit at a time, and stir until the dough comes together and no dry flour is left.',
        'Toarnă maiaua crescută și 250 ml de lapte căldicel peste gălbenușuri. Adaugă 970 g din făină, treptat, și amestecă până se leagă aluatul și nu mai rămâne făină uscată.',
      ),
    },
    {
      key: 'knead',
      text: t(
        'Knead for 15 minutes by hand on the table, or about 10 minutes in a mixer with a dough hook, until the dough is smooth and elastic, soft and only slightly sticky.',
        'Frământă 15 minute cu mâna, pe masă, sau cam 10 minute cu mixerul cu cârlige de aluat, până când aluatul e neted și elastic, moale și doar puțin lipicios.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'butter',
      text: t(
        'Oil your hands. Work in the melted, lukewarm butter a little at a time, kneading about 10 minutes in all, until the dough is glossy, soft and comes away from the bowl and your hands.',
        'Unge-ți mâinile cu ulei. Încorporează untul topit și căldicel puțin câte puțin, frământând în total cam 10 minute, până când aluatul e lucios, moale și se desprinde de castron și de mâini.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'rise-1',
      text: t(
        'Shape the dough into a ball, set it in an oiled bowl and cover it with a cloth. Leave it in a warm place for about 1½ hours, up to 2 in a cool kitchen, until it has doubled and is full of bubbles.',
        'Fă din aluat o bilă, pune-o într-un castron uns cu ulei și acoper-o cu un prosop. Lasă-o la loc călduț cam 1 oră și jumătate, până la 2 ore dacă e răcoare în bucătărie, până când își dublează volumul și e plin de bule.',
      ),
      timerSeconds: 5400,
    },
    {
      key: 'raisins',
      text: t(
        'While the dough rises, cover the raisins with warm water. When they are plump, drain them and pat them dry on a cloth.',
        'Cât timp crește aluatul, acoperă stafidele cu apă caldă. Când s-au umflat, scurge-le și tamponează-le uscat cu un prosop.',
      ),
    },
    {
      key: 'filling',
      text: t(
        'Also while the dough rises, heat the remaining 100 ml of milk with the remaining 200 g of sugar over low heat for about 3 minutes, stirring, until the sugar dissolves. Take it off the heat, stir in the ground walnuts, the cocoa and the remaining 10 ml of rum essence, and leave to cool. You want a thick paste that spreads easily.',
        'Tot cât timp crește aluatul, încălzește cei 100 ml de lapte rămași cu cele 200 g de zahăr rămase la foc mic, cam 3 minute, amestecând, până se topește zahărul. Ia de pe foc, adaugă nucile măcinate, cacaoua și cei 10 ml de esență de rom rămași și lasă să se răcească. Trebuie să iasă o pastă groasă, care se întinde ușor.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'shape',
      text: t(
        'Grease two 30 × 11 cm loaf tins with oil and line them with baking paper. Tip the risen dough onto a lightly floured table and divide it into 4 equal pieces. Roll each piece into a rectangle about 25 × 40 cm and 4 mm thick.',
        'Unge cu ulei două forme de chec de 30 × 11 cm și tapetează-le cu hârtie de copt. Răstoarnă aluatul crescut pe masa presărată ușor cu făină și împarte-l în 4 bucăți egale. Întinde fiecare bucată într-o foaie de cam 25 × 40 cm, groasă de 4 mm.',
      ),
    },
    {
      key: 'fill',
      text: t(
        'Spread a quarter of the filling over each sheet, leaving a 1 cm border. Scatter over a quarter of the raisins and the Turkish delight, if using. Roll each sheet up tightly from the long side, like a Swiss roll, and pinch the seam closed.',
        'Întinde un sfert din umplutură pe fiecare foaie, lăsând o margine de 1 cm. Presară deasupra un sfert din stafide și rahatul, dacă îl folosești. Rulează fiecare foaie strâns, pe latura lungă, ca pe o ruladă, și lipește marginea.',
      ),
    },
    {
      key: 'twist',
      text: t(
        'Twist 2 rolls around each other, tuck the ends under and lay them in a tin; if they are longer than the tin, fold the ends under. Do the same with the other 2 rolls in the second tin.',
        'Răsucește 2 rulade una în jurul celeilalte, ascunde capetele pe dedesubt și așază-le într-o formă; dacă sunt mai lungi decât forma, îndoaie capetele pe dedesubt. Fă la fel cu celelalte 2 rulade, în a doua formă.',
      ),
    },
    {
      key: 'preheat',
      text: t(
        'Cover the tins with a cloth. Switch the oven on to 180 °C (fan 160 °C) with a rack in the lower third; it takes about 15 minutes to heat, and the loaves keep rising meanwhile.',
        'Acoperă formele cu un prosop. Pornește cuptorul la 180 °C (cu ventilator 160 °C), cu grătarul în treimea de jos; durează cam 15 minute să se încălzească, iar cozonacii continuă să crească între timp.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'rise-2',
      text: t(
        'Leave the tins covered for another 30 minutes (45 minutes in all since shaping), until the dough has risen to the rim of the tins.',
        'Lasă formele acoperite încă 30 de minute (45 de minute în total de la formare), până când aluatul ajunge la marginea formelor.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'wash',
      text: t(
        'Beat the whole egg and brush it over the tops with a pastry brush. Set the tins on a baking tray.',
        'Bate oul întreg și unge-l pe deasupra cu un pămătuf. Pune formele pe o tavă de copt.',
      ),
    },
    {
      key: 'bake-1',
      text: t(
        'Bake at 180 °C for 15 minutes, until the tops start to colour.',
        'Coace la 180 °C timp de 15 minute, până încep să se rumenească deasupra.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'bake-2',
      text: t(
        'Lower the oven to 165 °C (fan 145 °C) and bake for another 20 minutes, until the tops are a deep brown.',
        'Scade cuptorul la 165 °C (cu ventilator 145 °C) și coace încă 20 de minute, până când partea de sus e bine rumenită.',
      ),
      timerSeconds: 1200,
    },
    {
      key: 'bake-3',
      text: t(
        'Lay a sheet of foil loosely over the tops so they do not burn, and bake for another 15 minutes.',
        'Pune o folie de aluminiu liber peste cozonaci, ca să nu se ardă deasupra, și mai coace 15 minute.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'check',
      text: t(
        'Check that they are done: a wooden skewer pushed into the thickest part should come out dry, apart from a few cocoa crumbs from the filling, and a thermometer in the centre should read about 92 to 95 °C. The loaves should sound hollow when tapped. If not, bake another 5 to 10 minutes with the foil on.',
        'Verifică dacă s-au copt: o frigăruie de lemn băgată în partea cea mai groasă trebuie să iasă uscată, în afară de câteva firimituri de cacao din umplutură, iar un termometru băgat în centru trebuie să arate cam 92–95 °C. Cozonacii trebuie să sune a gol când îi bați ușor. Dacă nu, mai coace 5–10 minute cu folia pusă.',
      ),
    },
    {
      key: 'cool-tin',
      text: t(
        'Take the tins out and leave the loaves in them for 15 minutes, then lift them out by the paper onto a wire rack.',
        'Scoate formele din cuptor și lasă cozonacii în ele 15 minute, apoi ridică-i de hârtie și pune-i pe un grătar.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'cool-rack',
      text: t(
        'Cover the loaves with a clean cloth and leave them for at least 2 hours until completely cool; they slice cleanly and the crumb sets as they cool.',
        'Acoperă cozonacii cu un prosop curat și lasă-i cel puțin 2 ore, până se răcesc complet; se taie curat, iar miezul se așază pe măsură ce se răcește.',
      ),
      timerSeconds: 7200,
    },
    {
      key: 'store',
      text: t(
        'Wrap each loaf in a clean cloth or a bag. They keep at room temperature for 4 to 5 days. For longer, freeze the slices for up to 2 months.',
        'Înfășoară fiecare cozonac într-un prosop curat sau pune-l într-o pungă. Se păstrează la temperatura camerei 4–5 zile. Pentru mai mult timp, congelează feliile până la 2 luni.',
      ),
    },
  ],
  tips: [
    t(
      'Keep the milk, eggs and butter lukewarm or at room temperature: cold ingredients slow the dough down, and anything hotter than hand-warm can kill the yeast.',
      'Ține laptele, ouăle și untul căldicele sau la temperatura camerei: ingredientele reci încetinesc aluatul, iar cele mai fierbinți decât căldicel pot omorî drojdia.',
    ),
    t(
      'No fresh yeast? Use dried yeast, about a third of the weight of fresh, and add it to the flour or the warm liquid as the packet says.',
      'Nu ai drojdie proaspătă? Folosește drojdie uscată, cam o treime din greutatea celei proaspete, și adaug-o în făină sau în lichidul căldicel, cum scrie pe pachet.',
    ),
    t(
      'For the first rise, an oven that is switched off with only its light on is a good warm place, or the shelf over a radiator.',
      'Pentru prima dospire, un cuptor oprit, cu becul aprins, e un loc bun și călduț, la fel și un raft deasupra caloriferului.',
    ),
  ],
  stepTips: [
    {
      step: 'yolks',
      text: t(
        'Freeze the leftover whites for a meringue later. Some cooks use them in the filling instead of the milk, whipped and folded with the walnuts, sugar and cocoa.',
        'Congelează albușurile rămase pentru o bezea mai târziu. Unii le folosesc în umplutură în locul laptelui, bătute spumă și amestecate cu nucile, zahărul și cacaoua.',
      ),
    },
    {
      step: 'butter',
      text: t(
        'Do not rush the butter: if you add it all at once the dough turns greasy and slips. Oiled hands also stop the dough sticking, without more flour that would make the bread dry.',
        'Nu te grăbi cu untul: dacă îl pui deodată, aluatul devine uleios și alunecos. Mâinile unse cu ulei opresc aluatul să se lipească, fără făină în plus care ar usca cozonacul.',
      ),
    },
    {
      step: 'filling',
      text: t(
        'The filling has walnuts, a tree-nut allergen: tell anyone who is allergic before they take a slice, and wash the board and bowls well if you cook for someone with an allergy.',
        'Umplutura are nucă, un alergen: spune-le celor alergici la nuci înainte să ia o felie și spală bine masa și vasele dacă gătești pentru cineva cu alergie.',
      ),
    },
    {
      step: 'fill',
      text: t(
        'Roll tightly and leave the border clean: loose rolls leave gaps in the swirl and the filling can leak out in the oven.',
        'Rulează strâns și lasă marginea curată: rulourile lejere lasă goluri în spirală, iar umplutura poate curge în cuptor.',
      ),
    },
    {
      step: 'check',
      text: t(
        'If the top is already deep brown but the centre is under 92 °C, keep the foil on and lower the oven by 10 °C rather than taking it out early.',
        'Dacă deasupra e deja bine rumenit, dar în centru sunt sub 92 °C, lasă folia pusă și scade cuptorul cu 10 °C, în loc să-l scoți mai devreme.',
      ),
    },
  ],
  nutritionNote: t(
    'Walnuts bring some fibre and unsaturated fat, but butter, egg yolks and sugar make each slice rich in saturated fat and sugar, and the white flour has little fibre. A thin slice with unsweetened coffee or tea is plenty; save it for the holidays.',
    'Nucile aduc fibre și grăsimi nesaturate, dar untul, gălbenușurile și zahărul fac fiecare felie bogată în grăsimi saturate și zahăr, iar făina albă are puține fibre. E de ajuns o felie subțire, cu cafea sau ceai neîndulcit; păstrează-l pentru sărbători.',
  ),
  pairings: [
    {
      kind: 'drink',
      label: t('Coffee', 'Cafea'),
      reason: t(
        'Its bitterness balances the sweet, buttery crumb and the cocoa.',
        'Amăreala ei echilibrează miezul dulce, cu gust de unt, și cacaoua.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'coffee',
    },
    {
      kind: 'drink',
      label: t('Tea', 'Ceai'),
      reason: t(
        'Unsweetened tea cleans the palate between slices of a rich sweet bread.',
        'Ceaiul neîndulcit curăță gustul între feliile unui cozonac bogat.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'tea',
    },
    {
      kind: 'food',
      label: t('Sarmale (Romanian cabbage rolls)', 'Sarmale'),
      reason: t(
        'Both are made for the winter holidays in Romanian homes: sarmale for the meal, cozonac after it with coffee.',
        'Ambele se fac pentru sărbătorile de iarnă în casele românești: sarmalele pentru masă, cozonacul după, cu cafea.',
      ),
      principle: 'regional_tradition',
      recipe: 'sarmale',
    },
  ],
  eatingMoments: [
    {
      moment: 'morning',
      polarity: 'good_for',
      reason: t(
        'A slice with coffee is a filling holiday breakfast.',
        'O felie cu cafea e un mic dejun săturător de sărbătoare.',
      ),
    },
    {
      moment: 'brunch',
      polarity: 'good_for',
      reason: t(
        'Sits well on a table with tea and coffee for guests.',
        'Se potrivește pe o masă cu ceai și cafea pentru oaspeți.',
      ),
    },
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A dense, sweet bread that suits a cold winter afternoon.',
        'O pâine densă și dulce, potrivită pentru o după-amiază rece de iarnă.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Rich in fat and sugar, heavy to lie down on.',
        'Bogat în grăsimi și zahăr, greu de digerat înainte de culcare.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'The fat and the thick filling sit heavily in the stomach.',
        'Grăsimile și umplutura groasă stau greu în stomac.',
      ),
    },
  ],
  variants: [
    {
      slug: 'cozonac-italian',
      cuisine: 'italian',
      title: t(
        'Panettone',
        'Panettone (cozonac italian cu stafide și fructe confiate)',
      ),
      servings: 12,
      prepMinutes: 1310,
      cookMinutes: 125,
      difficulty: 'hard',
      hideBaseTips: [2],
      lines: [
        {
          ingredient: 'strong-flour',
          quantity: 350,
          unit: 'g',
          note: t(
            '150 g for the first dough, 200 g for the second',
            '150 g pentru primul aluat, 200 g pentru al doilea',
          ),
        },
        {
          ingredient: 'fresh-yeast',
          quantity: 7,
          unit: 'g',
          note: t(
            '0.5 g for the first dough (the size of a chickpea), 6.5 g for the second',
            '0,5 g pentru primul aluat (cât un bob de năut), 6,5 g pentru al doilea',
          ),
        },
        {
          ingredient: 'still-water',
          quantity: 0.1,
          unit: 'l',
          note: t(
            '80 ml for the first dough, 20 ml for the second; lukewarm',
            '80 ml pentru primul aluat, 20 ml pentru al doilea; căldicioasă',
          ),
        },
        {
          ingredient: 'sugar',
          quantity: 105,
          unit: 'g',
          note: t(
            '30 g for the first dough, 75 g for the second',
            '30 g pentru primul aluat, 75 g pentru al doilea',
          ),
        },
        { ingredient: 'honey', quantity: 20, unit: 'g' },
        {
          ingredient: 'eggs',
          quantity: 5,
          unit: 'pcs',
          note: t(
            'yolks only: 2 for the first dough, 3 for the second',
            'doar gălbenușurile: 2 pentru primul aluat, 3 pentru al doilea',
          ),
        },
        {
          ingredient: 'butter',
          quantity: 150,
          unit: 'g',
          note: t(
            'soft: 30 g for the first dough, 110 g for the second, 10 g for the top',
            'moale: 30 g pentru primul aluat, 110 g pentru al doilea, 10 g pentru deasupra',
          ),
        },
        { ingredient: 'salt', quantity: 6, unit: 'g' },
        { ingredient: 'vanilla-pods', quantity: 1, unit: 'pcs' },
        {
          ingredient: 'orange',
          quantity: 1,
          unit: 'pcs',
          note: t('zest only', 'doar coaja rasă'),
        },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t('zest only', 'doar coaja rasă'),
        },
        { ingredient: 'raisins', quantity: 100, unit: 'g' },
        {
          ingredient: 'candied-orange-peel',
          quantity: 45,
          unit: 'g',
          note: t('diced small', 'tăiată cubulețe mici'),
        },
        {
          ingredient: 'candied-citron',
          quantity: 30,
          unit: 'g',
          note: t('diced small', 'tăiată cubulețe mici'),
        },
      ],
      steps: [
        {
          key: 'first-dough',
          text: t(
            'First dough: stir the 0.5 g of yeast (the size of a chickpea) into 80 ml of lukewarm water, then mix in 150 g of the strong flour, 30 g of the sugar, 2 egg yolks and 30 g of the soft butter. Knead for 5 minutes until you have a smooth, soft dough.',
            'Primul aluat: amestecă cele 0,5 g de drojdie (cât un bob de năut) în 80 ml de apă căldicică, apoi adaugă 150 g din făina tare, 30 g din zahăr, 2 gălbenușuri și 30 g din untul moale. Frământă 5 minute, până obții un aluat neted și moale.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'rise-first',
          text: t(
            'Put the dough in a bowl, cover it and leave it at 24 to 26 °C for about 10 hours, up to 12, overnight, until it has tripled and smells sweetly of yeast. If it has not at least doubled, do not go on.',
            'Pune aluatul într-un castron, acoper-l și lasă-l la 24–26 °C cam 10 ore, până la 12, peste noapte, până își triplează volumul și miroase dulceag a drojdie. Dacă nu și-a dublat măcar volumul, nu merge mai departe.',
          ),
          timerSeconds: 36000,
        },
        {
          key: 'soak',
          text: t(
            'Once the first dough has risen, cover the raisins with warm water. They plump up while you make the second dough; drain them and pat them dry before folding them in.',
            'Când primul aluat a crescut, acoperă stafidele cu apă caldă. Se umflă cât faci al doilea aluat; scurge-le și tamponează-le uscat înainte să le încorporezi.',
          ),
        },
        {
          key: 'second-dough',
          text: t(
            'Second dough: tear the risen first dough into pieces in a large bowl or the mixer bowl. Add the remaining 6.5 g of yeast, 20 ml of lukewarm water, 200 g of the strong flour, 75 g of the sugar, the honey, 3 egg yolks, the salt, the seeds scraped from the vanilla pod and the orange and lemon zest. Knead for 15 minutes until the dough is smooth and starts to pull away from the bowl.',
            'Al doilea aluat: rupe aluatul crescut bucăți într-un castron mare sau în vasul mixerului. Adaugă ceilalți 6,5 g de drojdie, 20 ml de apă căldicică, 200 g din făina tare, 75 g din zahăr, mierea, 3 gălbenușuri, sarea, semințele răzuite din păstaia de vanilie și coaja de portocală și de lămâie. Frământă 15 minute, până când aluatul e neted și începe să se desprindă de castron.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'work-butter',
          text: t(
            'Add 110 g of soft butter in 4 portions, kneading each in before adding the next, about 15 minutes in all, until the dough is glossy and stretches into a thin sheet without tearing.',
            'Adaugă 110 g de unt moale în 4 porții, frământând fiecare porție înainte de următoarea, cam 15 minute în total, până când aluatul e lucios și se întinde într-o foaie subțire fără să se rupă.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'fruit',
          text: t(
            'Fold in the drained raisins, the candied orange peel and the candied citron, just until evenly spread.',
            'Încorporează stafidele scurse, coaja de portocală confiată și coaja de chitră confiată, doar cât să se împrăștie uniform.',
          ),
        },
        {
          key: 'rest',
          text: t(
            'Cover the dough and let it rest for 30 minutes.',
            'Acoperă aluatul și lasă-l să se odihnească 30 de minute.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'mould',
          text: t(
            'Shape the dough into a tight ball and drop it, seam down, into a 1 kg paper panettone mould, about 18 cm wide and 12 cm tall. Set the mould on a baking tray.',
            'Modelează aluatul într-o bilă strânsă și pune-l, cu închiderea în jos, într-o formă de hârtie pentru panettone de 1 kg, lată de cam 18 cm și înaltă de 12 cm. Așază forma pe o tavă de copt.',
          ),
        },
        {
          key: 'rise-mould',
          text: t(
            'Cover the mould and leave it at 24 to 26 °C for about 3 hours, up to 4, until the dome is about 3 cm below the rim.',
            'Acoperă forma și lasă-o la 24–26 °C cam 3 ore, până la 4, până când cupola aluatului ajunge la cam 3 cm sub marginea formei.',
          ),
          timerSeconds: 10800,
        },
        {
          key: 'preheat',
          text: t(
            'Switch the oven on to 175 °C (fan 155 °C) with a rack in the lower third; it takes about 20 minutes to heat, and the dome keeps rising meanwhile.',
            'Pornește cuptorul la 175 °C (cu ventilator 155 °C), cu grătarul în treimea de jos; durează cam 20 de minute să se încălzească, iar aluatul continuă să crească între timp.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'score',
          text: t(
            'When the dome is 1 to 2 cm below the rim, cut a cross in the top with a sharp knife, fold the points back and put the remaining 10 g of butter in the middle.',
            'Când cupola aluatului e la 1–2 cm sub margine, taie în cruce vârful cu un cuțit ascuțit, îndoaie colțurile în afară și pune cele 10 g de unt rămase în mijloc.',
          ),
        },
        {
          key: 'bake-1',
          text: t(
            'Bake at 175 °C for 30 minutes, until the dome is a deep golden.',
            'Coace la 175 °C timp de 30 de minute, până când cupola e auriu închis.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'bake-2',
          text: t(
            'Lay a sheet of foil loosely over the top so it does not burn, and bake for another 20 minutes.',
            'Pune liber o folie de aluminiu deasupra, ca să nu se ardă, și mai coace 20 de minute.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'check',
          text: t(
            'Check that it is done: a thermometer in the centre should read about 92 to 94 °C and a long skewer should come out dry. If not, bake another 5 to 10 minutes with the foil on.',
            'Verifică dacă s-a copt: un termometru băgat în centru trebuie să arate cam 92–94 °C, iar o frigăruie lungă trebuie să iasă uscată. Dacă nu, mai coace 5–10 minute cu folia pusă.',
          ),
        },
        {
          key: 'hang',
          text: t(
            'Straight from the oven, using oven gloves, push 2 long skewers through the mould about 3 cm above the base, crossing at right angles. Turn the panettone upside down and hang it by the skewers between 2 tall pots or chair backs, for at least 8 hours or overnight, until completely cool, so the airy crumb does not collapse under its own weight.',
            'Imediat ce îl scoți din cuptor, cu mănuși de bucătărie, străpunge forma cu 2 frigărui lungi, la cam 3 cm de bază, în cruce. Răstoarnă panettone-ul cu capul în jos și atârnă-l de frigărui între 2 oale înalte sau două spătare de scaun, cel puțin 8 ore sau peste noapte, până se răcește complet, ca miezul aerat să nu se prăbușească sub propria greutate.',
          ),
          timerSeconds: 28800,
        },
        {
          key: 'store',
          text: t(
            'Slide out the skewers and wrap the panettone in its bag or in cling film. It keeps at room temperature for 4 to 5 days. For longer, freeze slices for up to 2 months.',
            'Scoate frigăruile și învelește panettone-ul în punga lui sau în folie alimentară. Se păstrează la temperatura camerei 4–5 zile. Pentru mai mult timp, congelează feliile până la 2 luni.',
          ),
        },
      ],
      tips: [
        t(
          'Bakery panettone is made with a stiff sourdough starter (lievito madre) kept for days. This home version uses fresh yeast and strong flour, so the crumb is a little denser but still soft.',
          'Panettone-ul de patiserie se face cu maia tare (lievito madre), hrănită zile întregi. Varianta de casă folosește drojdie proaspătă și făină tare, așa că miezul iese ceva mai des, dar tot moale.',
        ),
      ],
      stepTips: [
        {
          step: 'rise-first',
          text: t(
            'This long rise builds the flavour and the structure: a first dough that has not tripled gives a heavy panettone.',
            'Dospirea lungă dă gustul și structura: un prim aluat care nu și-a triplat volumul dă un panettone greu.',
          ),
        },
      ],
      nutritionNote: t(
        'Raisins and candied peel add a little fibre but mostly sugar, and the butter and egg yolks make each slice rich in saturated fat. Strong flour gives a light crumb but little fibre. A thin slice is plenty; it is made for special occasions.',
        'Stafidele și coaja confiată aduc puține fibre, dar mai ales zahăr, iar untul și gălbenușurile fac fiecare felie bogată în grăsimi saturate. Făina tare dă un miez ușor, dar cu puține fibre. E de ajuns o felie subțire; se face pentru ocazii speciale.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Sparkling wine', 'Vin spumant'),
          reason: t(
            'The bubbles and acidity cut through the butter and sweetness.',
            'Bulele și aciditatea taie din untul și din dulceața feliei.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'sparkling-wine',
        },
        {
          kind: 'food',
          label: t('Mascarpone', 'Mascarpone'),
          reason: t(
            'A spoonful of cool, creamy cheese contrasts with the airy crumb.',
            'O lingură de brânză cremoasă și rece face contrast cu miezul aerat.',
          ),
          principle: 'contrast_texture',
          ingredient: 'mascarpone',
        },
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'Its bitterness balances the sweet, buttery crumb and the candied peel.',
            'Amăreala ei echilibrează miezul dulce, cu gust de unt, și coaja confiată.',
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
            'A slice with coffee is a festive breakfast that needs no work, since it is already baked.',
            'O felie cu cafea e un mic dejun festiv fără nicio muncă, pentru că e deja copt.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A slice warmed in the toaster, with hot coffee, is comforting on a cold afternoon.',
            'O felie încălzită în prăjitorul de pâine, cu o cafea fierbinte, încălzește o după-amiază rece.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Rich in butter and sugar, heavy before bed.',
            'Bogat în unt și zahăr, greu înainte de culcare.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'A heavy, buttery bread that feels dense in the heat.',
            'O pâine grea, cu mult unt, care cade greu pe vreme caldă.',
          ),
        },
      ],
    },
    {
      slug: 'cozonac-russian',
      cuisine: 'russian',
      title: t(
        'Kulich (Russian Easter bread with saffron, raisins and candied peel)',
        'Kulich (cozonac rusesc de Paște, cu șofran, stafide și coajă confiată)',
      ),
      servings: 12,
      prepMinutes: 340,
      cookMinutes: 100,
      difficulty: 'hard',
      lines: [
        {
          ingredient: 'fresh-yeast',
          quantity: 25,
          unit: 'g',
        },
        {
          ingredient: 'milk',
          quantity: 0.25,
          unit: 'l',
          note: t(
            '150 ml for the sponge, 100 ml for the dough; lukewarm',
            '150 ml pentru maia, 100 ml pentru aluat; căldicel',
          ),
        },
        {
          ingredient: 'sugar',
          quantity: 160,
          unit: 'g',
          note: t(
            '10 g for the sponge, 150 g for the dough',
            '10 g pentru maia, 150 g pentru aluat',
          ),
        },
        {
          ingredient: 'flour',
          quantity: 700,
          unit: 'g',
          note: t(
            '120 g for the sponge, 560 g for the dough, about 20 g for the table',
            '120 g pentru maia, 560 g pentru aluat, cam 20 g pentru masă',
          ),
        },
        {
          ingredient: 'eggs',
          quantity: 4,
          unit: 'pcs',
          note: t(
            'separated: 4 yolks in the dough, the 4 whites whipped',
            'separate: 4 gălbenușuri în aluat, cele 4 albușuri bătute spumă',
          ),
        },
        { ingredient: 'vanilla-pods', quantity: 1, unit: 'pcs' },
        {
          ingredient: 'saffron',
          quantity: 0.3,
          unit: 'g',
          note: t('a generous pinch', 'un vârf de cuțit mare'),
        },
        {
          ingredient: 'cardamom',
          quantity: 2,
          unit: 'g',
          note: t('ground', 'măcinat'),
        },
        { ingredient: 'salt', quantity: 4, unit: 'g' },
        {
          ingredient: 'butter',
          quantity: 170,
          unit: 'g',
          note: t(
            'soft: 150 g for the dough, 20 g for the tins',
            'moale: 150 g pentru aluat, 20 g pentru forme',
          ),
        },
        {
          ingredient: 'raisins',
          quantity: 120,
          unit: 'g',
        },
        {
          ingredient: 'rum',
          quantity: 30,
          unit: 'ml',
          optional: true,
          note: t(
            'for soaking the raisins; use warm water instead for children',
            'pentru înmuiat stafidele; folosește apă caldă în loc pentru copii',
          ),
        },
        {
          ingredient: 'candied-orange-peel',
          quantity: 60,
          unit: 'g',
          note: t('diced small', 'tăiată cubulețe mici'),
        },
        { ingredient: 'icing-sugar', quantity: 120, unit: 'g' },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t('juice only', 'doar zeama'),
        },
      ],
      steps: [
        {
          key: 'sponge',
          text: t(
            'Sponge: warm 150 ml of the milk until lukewarm. Crumble in the yeast, add 10 g of the sugar and 120 g of the flour, stir to a thick batter, cover and leave for 30 minutes until it is bubbly and has risen.',
            'Maiaua: încălzește 150 ml din lapte până e căldicel. Mărunțește drojdia în lapte, adaugă 10 g din zahăr și 120 g din făină, amestecă până obții un aluat moale, acoperă și lasă 30 de minute, până face bule și crește.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'steep',
          text: t(
            'While the sponge rises, warm 2 tablespoons of the remaining milk, stir in the ground saffron and leave it to steep. Cover the raisins with the rum, or with warm water, and leave them to plump. Grease two tall tins about 12 cm wide and 14 cm high with the 20 g of butter, line them with baking paper, and let the paper stand 3 cm above the rim.',
            'Cât timp crește maiaua, încălzește 2 linguri din laptele rămas, amestecă șofranul măcinat în el și lasă-l să se infuzeze. Acoperă stafidele cu rom sau cu apă caldă și lasă-le să se umfle. Unge două forme înalte, late de cam 12 cm și înalte de 14 cm, cu cei 20 g de unt, tapetează-le cu hârtie de copt și lasă hârtia să iasă 3 cm deasupra marginii.',
          ),
        },
        {
          key: 'yolks',
          text: t(
            'In a large bowl beat the 4 yolks with the remaining 150 g of sugar for about 3 minutes until pale and thick. Stir in the saffron milk, the rest of the lukewarm milk, the seeds scraped from the vanilla pod, the cardamom and the salt, then the risen sponge.',
            'Într-un castron mare freacă cele 4 gălbenușuri cu cele 150 g de zahăr rămase cam 3 minute, până se albesc și se îngroașă. Adaugă laptele cu șofran, restul de lapte căldicel, semințele răzuite din păstaia de vanilie, cardamomul și sarea, apoi maiaua crescută.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'whites',
          text: t(
            'In a clean, dry bowl whip the 4 egg whites to soft peaks, about 3 minutes with an electric whisk. Fold them into the yolk and sponge mixture in two portions with a spatula, just until no streaks of white remain.',
            'Într-un castron curat și uscat bate cele 4 albușuri spumă moale, cam 3 minute cu mixerul. Încorporează-le în amestecul de gălbenușuri și maia în două porții, cu o spatulă, doar până nu mai rămân dungi albe.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'knead',
          text: t(
            'Sift in 560 g of the flour a bit at a time, stir to a dough and knead for 10 minutes, by hand or in a mixer with a dough hook, until the dough is smooth and elastic.',
            'Cerne 560 g din făină, treptat, amestecă până se leagă aluatul și frământă 10 minute, cu mâna sau cu mixerul cu cârlige de aluat, până când aluatul e neted și elastic.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'butter',
          text: t(
            'Work in the 150 g of soft butter, a little at a time, for about 10 minutes, until the dough is glossy, soft and comes away from the bowl.',
            'Încorporează cele 150 g de unt moale, puțin câte puțin, cam 10 minute, până când aluatul e lucios, moale și se desprinde de castron.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'fruit',
          text: t(
            'Drain the raisins and pat them dry. Fold them in with the candied orange peel, just until evenly spread.',
            'Scurge stafidele și tamponează-le uscat. Încorporează-le împreună cu coaja de portocală confiată, doar cât să se împrăștie uniform.',
          ),
        },
        {
          key: 'rise-1',
          text: t(
            'Cover the bowl and leave it in a warm place for about 1½ hours, up to 2, until the dough has doubled.',
            'Acoperă castronul și lasă-l la loc călduț cam 1 oră și jumătate, până la 2 ore, până când aluatul își dublează volumul.',
          ),
          timerSeconds: 5400,
        },
        {
          key: 'fill',
          text: t(
            'On a lightly floured table, gently knock the air out of the dough, divide it in 2 and shape each piece into a ball. Drop each ball into a prepared tin, seam down, so it fills the tin about halfway.',
            'Pe masa presărată ușor cu făină, dezumflă aluatul, împarte-l în 2 și modelează fiecare bucată într-o bilă. Pune fiecare bilă într-o formă pregătită, cu închiderea în jos, ca să umple forma cam pe jumătate.',
          ),
        },
        {
          key: 'preheat',
          text: t(
            'Cover the tins. Switch the oven on to 175 °C (fan 155 °C) with a rack in the lower third; it takes about 15 minutes to heat, and the dough keeps rising meanwhile.',
            'Acoperă formele. Pornește cuptorul la 175 °C (cu ventilator 155 °C), cu grătarul în treimea de jos; durează cam 15 minute să se încălzească, iar aluatul continuă să crească între timp.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'rise-2',
          text: t(
            'Leave the tins covered for another 45 minutes (1 hour in all since filling), until the dough reaches about three-quarters of the way up the tin.',
            'Lasă formele acoperite încă 45 de minute (1 oră în total de la umplere), până când aluatul ajunge pe trei sferturi din înălțimea formei.',
          ),
          timerSeconds: 2700,
        },
        {
          key: 'bake-1',
          text: t(
            'Set the tins on a baking tray and bake at 175 °C for 25 minutes, until the tops are golden.',
            'Pune formele pe o tavă de copt și coace la 175 °C timp de 25 de minute, până când partea de sus e aurie.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'bake-2',
          text: t(
            'Lay a sheet of foil loosely over the tops so they do not burn, and bake for another 20 minutes.',
            'Pune liber o folie de aluminiu peste vârfuri, ca să nu se ardă, și mai coace 20 de minute.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'check',
          text: t(
            'Check that they are done: a long skewer pushed into the centre should come out dry and a thermometer should read about 92 to 95 °C. If not, bake another 5 to 10 minutes with the foil on.',
            'Verifică dacă s-au copt: o frigăruie lungă băgată în centru trebuie să iasă uscată, iar un termometru trebuie să arate cam 92–95 °C. Dacă nu, mai coace 5–10 minute cu folia pusă.',
          ),
        },
        {
          key: 'cool-tin',
          text: t(
            'Leave the kulich in the tins for 10 minutes, then lift them out by the paper.',
            'Lasă kulich-urile în forme 10 minute, apoi ridică-le de hârtie.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'cool-side',
          text: t(
            'Lay them on their sides on a clean cloth on a rack. Turn them a quarter-turn now and then until completely cold, about 2 hours, so the tall, soft crumb does not flatten on one side.',
            'Așază-le pe o parte, pe un prosop curat, pe un grătar. Rotește-le din când în când un sfert de tură, până se răcesc complet, cam 2 ore, ca miezul înalt și moale să nu se turtească pe o parte.',
          ),
          timerSeconds: 7200,
        },
        {
          key: 'glaze',
          text: t(
            'Stir the icing sugar with 1 tablespoon (15 ml) of the lemon juice, then add more juice drop by drop, up to about 20 ml in all, until the glaze is smooth and thick enough to coat a spoon. Stand the kulich upright, and spoon the glaze over the tops so it runs down in drips. Leave it to set for 30 minutes.',
            'Amestecă zahărul pudră cu 1 lingură (15 ml) din zeama de lămâie, apoi adaugă zeamă picătură cu picătură, până la cam 20 ml în total, până când glazura e netedă și destul de groasă cât să acopere lingura. Așază kulich-urile în picioare și toarnă glazura cu lingura peste vârfuri, să curgă în picături. Lasă-o să se întărească 30 de minute.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'store',
          text: t(
            'Wrap the kulich in a clean cloth or a bag. They keep at room temperature for 3 to 4 days. For longer, freeze them unglazed for up to 2 months.',
            'Înfășoară kulich-urile într-un prosop curat sau pune-le într-o pungă. Se păstrează la temperatura camerei 3–4 zile. Pentru mai mult timp, congelează-le neglazurate până la 2 luni.',
          ),
        },
      ],
      tips: [
        t(
          'Glaze with icing sugar and lemon, not raw egg white: the egg white version is not safe for children, older people or anyone who is pregnant.',
          'Glazurează cu zahăr pudră și lămâie, nu cu albuș crud: glazura cu albuș crud nu e sigură pentru copii, bătrâni sau gravide.',
        ),
        t(
          'Toss the dried raisins and candied peel in a spoon of flour before folding them in, so they do not sink to the bottom of the tall loaf.',
          'Tăvălește stafidele uscate și coaja confiată într-o lingură de făină înainte să le încorporezi, ca să nu se ducă la fundul cozonacului înalt.',
        ),
      ],
      stepTips: [
        {
          step: 'whites',
          text: t(
            'Use a spotlessly clean, dry bowl: a trace of fat or yolk keeps the whites from whipping up.',
            'Folosește un castron foarte curat și uscat: o urmă de grăsime sau de gălbenuș nu lasă albușurile să se bată.',
          ),
        },
        {
          step: 'steep',
          text: t(
            'Steep the saffron in warm milk, not cold: it gives up more colour and aroma from a small pinch.',
            'Infuzează șofranul în lapte călduț, nu rece: dă mai multă culoare și aromă dintr-un vârf mic.',
          ),
        },
      ],
      nutritionNote: t(
        'Raisins and candied peel add a little fibre and plenty of sugar, and the butter and egg yolks make each slice rich in saturated fat. The icing adds more sugar. Cut thin slices and share them; the saffron and cardamom bring flavour without extra salt or fat.',
        'Stafidele și coaja confiată aduc puține fibre și mult zahăr, iar untul și gălbenușurile fac fiecare felie bogată în grăsimi saturate. Glazura adaugă și mai mult zahăr. Taie felii subțiri și împarte-le; șofranul și cardamomul dau gust fără sare sau grăsime în plus.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Tea', 'Ceai'),
          reason: t(
            'Strong black tea balances the sweetness of the glaze and the dried fruit.',
            'Ceaiul negru tare echilibrează dulceața glazurii și a fructelor uscate.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'tea',
        },
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'Its bitterness balances the sweet, buttery crumb.',
            'Amăreala ei echilibrează miezul dulce, cu gust de unt.',
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
            'A slice with tea makes a festive breakfast.',
            'O felie cu ceai e un mic dejun de sărbătoare.',
          ),
        },
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'Looks good on a festive table and is already baked and cooled.',
            'Arată bine pe o masă festivă și e deja copt și răcit.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Rich in butter and sugar, heavy before bed.',
            'Bogat în unt și zahăr, greu înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
