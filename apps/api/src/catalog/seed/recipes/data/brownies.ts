import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Brownies base is the fudgy chocolate brownie. Each Variant is a full
// Recipe with its own lines, steps and guidance; the base's Recipe-level Tips
// are inherited unless a Variant hides them.
export const brownies: BaseRecipeSeed = {
  slug: 'brownies',
  title: t('Chocolate brownies', 'Brownies cu ciocolată'),
  servings: 16,
  prepMinutes: 70,
  cookMinutes: 50,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'dark-chocolate',
      quantity: 200,
      unit: 'g',
      note: t('finely chopped', 'tocată mărunt'),
    },
    {
      ingredient: 'butter',
      quantity: 150,
      unit: 'g',
      note: t('cubed', 'tăiat cubulețe'),
    },
    { ingredient: 'sugar', quantity: 150, unit: 'g' },
    { ingredient: 'brown-sugar', quantity: 100, unit: 'g' },
    { ingredient: 'eggs', quantity: 3, unit: 'pcs' },
    { ingredient: 'vanilla-extract', quantity: 5, unit: 'ml' },
    { ingredient: 'flour', quantity: 80, unit: 'g' },
    { ingredient: 'cocoa-powder', quantity: 30, unit: 'g' },
    { ingredient: 'salt', quantity: 2, unit: 'g' },
    {
      ingredient: 'walnuts',
      quantity: 80,
      unit: 'g',
      optional: true,
      note: t('roughly chopped', 'tocate grosier'),
    },
  ],
  steps: [
    {
      key: 'preheat',
      text: t(
        'Heat the oven to 180 °C (160 °C fan). It takes about 15 minutes, so do the next steps while it heats.',
        'Încălzește cuptorul la 180 °C (160 °C cu ventilator). Durează cam 15 minute, așa că fă pașii următori cât se încălzește.',
      ),
    },
    {
      key: 'line',
      text: t(
        'Line a 20 × 20 cm tin with baking paper, leaving an overhang on two sides to lift the brownies out later.',
        'Căptușește o tavă de 20 × 20 cm cu hârtie de copt, lăsând hârtia să depășească marginea pe două laturi, ca să poți scoate brownies mai târziu.',
      ),
    },
    {
      key: 'melt',
      text: t(
        'Put the chocolate and butter in a dry heatproof bowl over a pan of barely simmering water, with the bowl not touching the water. Stir now and then until almost melted, then take the bowl off the heat and stir until smooth and glossy.',
        'Pune ciocolata și untul într-un bol termorezistent uscat, deasupra unei oale cu apă care abia fierbe, fără ca bolul să atingă apa. Amestecă din când în când, până aproape se topesc, apoi ia bolul de pe foc și amestecă până devin netede și lucioase.',
      ),
    },
    {
      key: 'cool-chocolate',
      text: t(
        'Wipe the base of the bowl dry and leave the chocolate to cool for about 10 minutes, until it is only just warm to the touch.',
        'Șterge fundul bolului și lasă ciocolata să se răcească cam 10 minute, până e doar călduță la atingere.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'whisk',
      text: t(
        'In a large bowl, using an electric mixer, whisk the eggs, both sugars, the vanilla and the salt for about 3 minutes, until thick, pale and falling from the whisk in a ribbon.',
        'Într-un bol mare, cu mixerul electric, bate ouăle cu ambele feluri de zahăr, vanilia și sarea cam 3 minute, până se îngroașă, se deschid la culoare și cad de pe tel în panglică.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'combine',
      text: t(
        'Pour the cooled chocolate mixture into the eggs and fold with a spatula until streak-free.',
        'Toarnă ciocolata răcită peste ouă și amestecă cu o spatulă, cu mișcări line, până dispar dungile.',
      ),
    },
    {
      key: 'flour',
      text: t(
        'Sift the flour and cocoa over the bowl and fold just until no dry streaks remain. Stop as soon as it is mixed.',
        'Cerne făina și cacaua peste compoziție și amestecă încet doar până nu mai rămân urme de făină. Oprește-te imediat ce s-a omogenizat.',
      ),
    },
    {
      key: 'nuts',
      text: t(
        'Fold in the walnuts, if using.',
        'Adaugă nucile, dacă folosești, și amestecă ușor.',
      ),
    },
    {
      key: 'fill',
      text: t(
        'Scrape the batter into the tin and level the top with the spatula.',
        'Toarnă compoziția în tavă și netezește suprafața cu spatula.',
      ),
    },
    {
      key: 'bake',
      text: t(
        'Bake for 25 minutes, until the top is set, shiny and slightly cracked, and the edges pull away a little from the paper.',
        'Coace 25 de minute, până când partea de sus se întărește, e lucioasă și ușor crăpată, iar marginile se desprind puțin de hârtie.',
      ),
      timerSeconds: 1500,
    },
    {
      key: 'check',
      text: t(
        'Push a skewer into the centre. It should come out with moist crumbs, not wet batter (a probe reads at least 80 °C). If it is wet, bake 3 to 5 minutes more and check again.',
        'Înfige un băț de frigărui în centru. Trebuie să iasă cu firimituri umede, nu cu compoziție lichidă (un termometru de gătit arată cel puțin 80 °C). Dacă iese ud, mai coace 3-5 minute și verifică din nou.',
      ),
    },
    {
      key: 'cool',
      text: t(
        'Leave the brownies to cool in the tin for 1 hour; they firm up as they cool. Lift them out by the paper.',
        'Lasă brownies să se răcească în tavă 1 oră; se întăresc pe măsură ce se răcesc. Scoate-i din tavă trăgând de hârtie.',
      ),
      timerSeconds: 3600,
    },
    {
      key: 'cut',
      text: t(
        'Cut into 16 squares with a sharp knife, wiping the blade clean between cuts.',
        'Taie în 16 pătrate cu un cuțit bine ascuțit, ștergând lama între tăieturi.',
      ),
    },
  ],
  tips: [
    t(
      'Do not taste the raw batter or let children lick the bowl: it holds raw egg and raw flour. Wash the bowl and spatula as soon as you are done.',
      'Nu gusta compoziția crudă și nu lăsa copiii să lingă bolul: conține ou crud și făină crudă. Spală bolul și spatula imediat după ce termini.',
    ),
    t(
      'Keep stray drops of water and steam out of melting chocolate: a few drops can make it seize into a stiff, grainy paste. Liquid that goes in from the start, such as butter or milk, is fine. Use a dry bowl and spoon.',
      'Ferește ciocolata care se topește de picăturile de apă și de aburi: câteva picături o pot face să se încleieze într-o pastă tare și granuloasă. Lichidul pus de la început, cum e untul sau laptele, nu e o problemă. Folosește un bol și o lingură uscate.',
    ),
    t(
      'Wrapped airtight, the brownies keep for 3 to 4 days at room temperature. For longer, wrap squares one by one and freeze them for up to 2 months.',
      'Închiși ermetic, brownies țin 3-4 zile la temperatura camerei. Pentru mai mult timp, înfășoară pătrățelele câte unul și congelează-le până la 2 luni.',
    ),
  ],
  stepTips: [
    {
      step: 'check',
      text: t(
        'Pull them while the centre is still soft: a clean skewer means cakey, dry brownies. Wet batter on the skewer means the egg is not set yet, so give them a few more minutes.',
        'Scoate-i când centrul e încă moale: un băț curat înseamnă brownies uscați, ca un chec. Compoziția lichidă pe băț înseamnă că oul nu s-a închegat încă, așa că mai lasă-i câteva minute.',
      ),
    },
    {
      step: 'whisk',
      text: t(
        'This is what gives the shiny, paper-thin crust on top, so do not cut it short.',
        'Asta dă crusta lucioasă și subțire de deasupra, așa că nu scurta timpul.',
      ),
    },
    {
      step: 'cool',
      text: t(
        'Cut them cold, or after a night in the fridge, for the cleanest squares and the fudgiest bite.',
        'Taie-i reci, sau după o noapte la frigider, pentru pătrate curate și un miez cât mai cremos.',
      ),
    },
  ],
  nutritionNote: t(
    'A rich, energy-dense treat: the sugar, butter and chocolate bring a lot of sugar and saturated fat, and there is little fibre. Dark chocolate and cocoa give real chocolate flavour from less sugar, and walnuts add unsaturated fat. Cut 16 small squares and enjoy one.',
    'O gustare bogată și foarte calorică: zahărul, untul și ciocolata aduc mult zahăr și grăsimi saturate, iar fibrele sunt puține. Ciocolata neagră și cacaua dau gust intens de ciocolată cu mai puțin zahăr, iar nucile adaugă grăsimi nesaturate. Taie 16 pătrățele mici și bucură-te de unul.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Vanilla ice cream', 'Înghețată de vanilie'),
      reason: t(
        'Cold, creamy ice cream against a dense brownie; warm a square for 10 to 15 seconds in the microwave if you like.',
        'Înghețata rece și cremoasă contrastează cu un brownie dens; încălzește un pătrat 10-15 secunde la microunde, dacă vrei.',
      ),
      principle: 'contrast_texture',
      ingredient: 'ice-cream',
    },
    {
      kind: 'food',
      label: t('Fresh raspberries', 'Zmeură proaspătă'),
      reason: t(
        'Their tartness cuts through the rich chocolate and butter.',
        'Aciditatea lor taie din bogăția ciocolatei și a untului.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'raspberry',
    },
    {
      kind: 'drink',
      label: t('Cold milk', 'Lapte rece'),
      reason: t(
        'Cools and refreshes the mouth after a sweet, dense bite.',
        'Răcorește și împrospătează gura după o îmbucătură dulce și densă.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'milk',
    },
    {
      kind: 'drink',
      label: t('Black coffee', 'Cafea neagră'),
      reason: t(
        'Its bitterness balances the sweetness of the chocolate.',
        'Amăreala ei echilibrează dulceața ciocolatei.',
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
        'A square of chocolate with a hot drink is comforting when it is cold outside.',
        'Un pătrat de ciocolată, cu o băutură fierbinte, mângâie când e frig afară.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Butter and chocolate are heavy in the stomach during hard exercise.',
        'Untul și ciocolata cad greu la stomac în timpul unui efort intens.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Sweet, rich and with a little caffeine from the chocolate, it may not sit well before bed.',
        'Fiind dulce, bogat și cu puțină cafeină din ciocolată, poate să nu cadă bine înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'brownies-romanian',
      cuisine: 'romanian',
      title: t(
        'Negresă (Romanian cocoa and walnut traybake with chocolate glaze)',
        'Negresă cu nucă și glazură de ciocolată',
      ),
      servings: 16,
      prepMinutes: 70,
      cookMinutes: 45,
      difficulty: 'easy',
      hideBaseTips: [2],
      tips: [
        t(
          'Covered, the negresă keeps for 2 to 3 days at room temperature, or up to 4 days in the fridge. Cut squares can be frozen for up to 2 months.',
          'Acoperită, negresa ține 2-3 zile la temperatura camerei sau până la 4 zile la frigider. Pătratele tăiate se pot congela până la 2 luni.',
        ),
      ],
      lines: [
        { ingredient: 'eggs', quantity: 5, unit: 'pcs' },
        { ingredient: 'sugar', quantity: 250, unit: 'g' },
        { ingredient: 'vanilla-sugar', quantity: 8, unit: 'g' },
        { ingredient: 'sunflower-oil', quantity: 150, unit: 'ml' },
        { ingredient: 'milk', quantity: 250, unit: 'ml' },
        { ingredient: 'flour', quantity: 250, unit: 'g' },
        { ingredient: 'cocoa-powder', quantity: 50, unit: 'g' },
        { ingredient: 'baking-powder', quantity: 10, unit: 'g' },
        {
          ingredient: 'walnuts',
          quantity: 100,
          unit: 'g',
          note: t('chopped, for the batter', 'tocate, pentru compoziție'),
        },
        {
          ingredient: 'rum-essence',
          quantity: 5,
          unit: 'ml',
          optional: true,
        },
        {
          ingredient: 'dark-chocolate',
          quantity: 100,
          unit: 'g',
          note: t('chopped, for the glaze', 'tocată, pentru glazură'),
        },
        {
          ingredient: 'butter',
          quantity: 50,
          unit: 'g',
          note: t('for the glaze', 'pentru glazură'),
        },
        {
          ingredient: 'milk',
          key: 'milk-glaze',
          quantity: 30,
          unit: 'ml',
          note: t('for the glaze', 'pentru glazură'),
        },
        {
          ingredient: 'walnuts',
          key: 'walnuts-top',
          quantity: 30,
          unit: 'g',
          note: t('chopped, to sprinkle', 'tocate, pentru presărat'),
        },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 180 °C (160 °C fan). It takes about 15 minutes, so do the next steps while it heats.',
            'Încălzește cuptorul la 180 °C (160 °C cu ventilator). Durează cam 15 minute, așa că fă pașii următori cât se încălzește.',
          ),
        },
        {
          key: 'line',
          text: t(
            'Line a 25 × 30 cm tray with baking paper.',
            'Căptușește o tavă de 25 × 30 cm cu hârtie de copt.',
          ),
        },
        {
          key: 'beat-eggs',
          text: t(
            'With an electric mixer, beat the eggs with the sugar and vanilla sugar for about 3 minutes, until pale and nearly doubled in volume.',
            'Cu mixerul electric, bate ouăle cu zahărul și zahărul vanilat cam 3 minute, până se deschid la culoare și își dublează aproape volumul.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'liquids',
          text: t(
            'Pour in the oil and milk and whisk until smooth.',
            'Adaugă uleiul și laptele și amestecă până se omogenizează.',
          ),
        },
        {
          key: 'dry',
          text: t(
            'Sift the flour, cocoa and baking powder over the bowl and fold in with a spatula just until no dry streaks remain.',
            'Cerne făina, cacaua și praful de copt peste compoziție și amestecă cu o spatulă, doar până nu mai rămân urme de făină.',
          ),
        },
        {
          key: 'nuts',
          text: t(
            'Fold in the 100 g of chopped walnuts and the rum essence, if using.',
            'Adaugă cele 100 g de nuci tocate și esența de rom, dacă folosești, și amestecă ușor.',
          ),
        },
        {
          key: 'fill',
          text: t(
            'Pour the batter into the tray and level the top.',
            'Toarnă compoziția în tavă și netezește suprafața.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 25 minutes, until risen and the top springs back when pressed lightly.',
            'Coace 25 de minute, până crește și suprafața revine când o apeși ușor.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'check',
          text: t(
            'Push a skewer into the centre. It should come out clean and dry. If it is wet, bake 5 minutes more and check again.',
            'Înfige un băț de frigărui în centru. Trebuie să iasă curat și uscat. Dacă iese ud, mai coace 5 minute și verifică din nou.',
          ),
        },
        {
          key: 'cool-warm',
          text: t(
            'Take the tray out and leave it to cool for 10 minutes. The glaze goes on while the cake is still warm.',
            'Scoate tava din cuptor și las-o să se răcească 10 minute. Glazura se pune cât prăjitura e încă caldă.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'glaze',
          text: t(
            'Meanwhile, melt the chocolate, butter and milk for the glaze in a dry heatproof bowl over a pan of barely simmering water, with the bowl not touching the water. Stir until almost melted, then take the bowl off the heat and stir until smooth.',
            'Între timp, topește ciocolata, untul și laptele pentru glazură într-un bol termorezistent uscat, deasupra unei oale cu apă care abia fierbe, fără ca bolul să atingă apa. Amestecă până aproape se topesc, apoi ia bolul de pe foc și amestecă până se omogenizează.',
          ),
        },
        {
          key: 'spread',
          text: t(
            'Spread the glaze over the warm cake and sprinkle the 30 g of chopped walnuts on top.',
            'Întinde glazura peste prăjitura caldă și presară deasupra cele 30 g de nuci tocate.',
          ),
        },
        {
          key: 'set',
          text: t(
            'Leave to cool for 1 hour, until the glaze has set, then cut into 16 squares.',
            'Lasă să se răcească 1 oră, până se întărește glazura, apoi taie în 16 pătrate.',
          ),
          timerSeconds: 3600,
        },
      ],
      stepTips: [
        {
          step: 'check',
          text: t(
            'Unlike the fudgy brownie, this is a cake: a skewer must come out clean. Do not open the oven in the first 20 minutes, or it may sink.',
            'Spre deosebire de brownies, aceasta e o prăjitură pufoasă: bățul trebuie să iasă curat. Nu deschide cuptorul în primele 20 de minute, altfel se poate lăsa.',
          ),
        },
      ],
      nutritionNote: t(
        'Cocoa and walnuts give plenty of flavour, and the oil is mostly unsaturated, but the sugar, the chocolate glaze and the butter in it make this a sweet, energy-dense slice with little fibre. Cut small squares.',
        'Cacaua și nucile dau mult gust, iar uleiul e în mare parte nesaturat, dar zahărul și glazura de ciocolată cu unt o fac o prăjitură dulce și foarte calorică, cu puține fibre. Taie pătrățele mici.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'Its bitterness balances the sweet chocolate glaze.',
            'Amăreala ei echilibrează dulceața glazurii de ciocolată.',
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
            'A soft cocoa cake with a warm drink suits a cold afternoon.',
            'O prăjitură moale cu cacao și o băutură caldă se potrivesc într-o după-amiază friguroasă.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'The butter-chocolate glaze and the oil make it heavy in the stomach during hard exercise.',
            'Glazura de ciocolată cu unt și uleiul cad greu la stomac în timpul unui efort intens.',
          ),
        },
      ],
    },
    {
      slug: 'brownies-italian',
      cuisine: 'italian',
      title: t(
        'Torta caprese (Italian flourless chocolate and almond cake)',
        'Torta caprese (tort italian de ciocolată și migdale, fără făină de grâu)',
      ),
      servings: 10,
      prepMinutes: 40,
      cookMinutes: 70,
      difficulty: 'medium',
      hideBaseTips: [0, 2],
      lines: [
        {
          ingredient: 'dark-chocolate',
          quantity: 200,
          unit: 'g',
          note: t('finely chopped', 'tocată mărunt'),
        },
        {
          ingredient: 'butter',
          quantity: 150,
          unit: 'g',
          note: t('cubed', 'tăiat cubulețe'),
        },
        {
          ingredient: 'butter',
          key: 'butter-tin',
          quantity: 10,
          unit: 'g',
          note: t('for the tin', 'pentru tavă'),
        },
        {
          ingredient: 'eggs',
          quantity: 5,
          unit: 'pcs',
          note: t('separated', 'separate'),
        },
        { ingredient: 'sugar', quantity: 150, unit: 'g' },
        { ingredient: 'almond-flour', quantity: 200, unit: 'g' },
        {
          ingredient: 'cocoa-powder',
          quantity: 15,
          unit: 'g',
          optional: true,
        },
        { ingredient: 'salt', quantity: 1, unit: 'g' },
        {
          ingredient: 'icing-sugar',
          quantity: 15,
          unit: 'g',
          note: t('for dusting', 'pentru pudrat'),
        },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 170 °C (150 °C fan). It takes about 15 minutes, so do the next steps while it heats.',
            'Încălzește cuptorul la 170 °C (150 °C cu ventilator). Durează cam 15 minute, așa că fă pașii următori cât se încălzește.',
          ),
        },
        {
          key: 'tin',
          text: t(
            'Grease the sides of a 24 cm springform tin with the 10 g of butter and line the base with baking paper.',
            'Unge marginile unei forme cu fund detașabil de 24 cm cu cele 10 g de unt și căptușește fundul cu hârtie de copt.',
          ),
        },
        {
          key: 'melt',
          text: t(
            'Put the chocolate and the 150 g of butter in a dry heatproof bowl over a pan of barely simmering water, with the bowl not touching the water. Stir until almost melted, then take the bowl off the heat and stir until smooth and glossy.',
            'Pune ciocolata și cele 150 g de unt într-un bol termorezistent uscat, deasupra unei oale cu apă care abia fierbe, fără ca bolul să atingă apa. Amestecă până aproape se topesc, apoi ia bolul de pe foc și amestecă până devin netede și lucioase.',
          ),
        },
        {
          key: 'cool-chocolate',
          text: t(
            'Wipe the base of the bowl dry and leave the chocolate to cool for about 10 minutes, until only just warm.',
            'Șterge fundul bolului și lasă ciocolata să se răcească cam 10 minute, până e doar călduță.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'separate',
          text: t(
            'Separate the eggs, putting the whites in a large clean, dry bowl. Not a speck of yolk should get into the whites.',
            'Separă ouăle, punând albușurile într-un bol mare, curat și uscat. Nu trebuie să ajungă nicio urmă de gălbenuș în albușuri.',
          ),
        },
        {
          key: 'yolks',
          text: t(
            'With an electric mixer, whisk the yolks with 100 g of the sugar for about 3 minutes, until thick and pale.',
            'Cu mixerul electric, bate gălbenușurile cu 100 g din zahăr cam 3 minute, până se îngroașă și se deschid la culoare.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'combine',
          text: t(
            'Stir the cooled chocolate mixture into the yolks until smooth.',
            'Amestecă ciocolata răcită cu gălbenușurile până se omogenizează.',
          ),
        },
        {
          key: 'almonds',
          text: t(
            'Fold in the ground almonds, and the cocoa if using, until combined.',
            'Adaugă migdalele măcinate, și cacaua dacă folosești, și amestecă până se combină.',
          ),
        },
        {
          key: 'whites',
          text: t(
            'With an electric mixer, whip the whites with the salt until foamy, add the remaining 50 g of sugar and keep whipping to soft peaks, which curl over at the tip when you lift the whisk.',
            'Cu mixerul electric, bate albușurile cu sarea până fac spumă, adaugă restul de 50 g de zahăr și continuă să bați până la vârfuri moi, care se răsucesc la capăt când ridici telul.',
          ),
        },
        {
          key: 'fold',
          text: t(
            'Fold the whites into the chocolate batter in three goes, gently, so as not to knock out the air.',
            'Încorporează albușurile în compoziția de ciocolată în trei tranșe, cu mișcări line, ca să nu piardă aerul.',
          ),
        },
        {
          key: 'fill',
          text: t(
            'Scrape the batter into the tin and level the top.',
            'Toarnă compoziția în formă și netezește suprafața.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 40 minutes, until the top is crisp and cracked and has risen.',
            'Coace 40 de minute, până când partea de sus e crocantă, crăpată și a crescut.',
          ),
          timerSeconds: 2400,
        },
        {
          key: 'check',
          text: t(
            'Push a skewer into the centre. It should come out with a few moist crumbs, not wet batter (a probe reads at least 80 °C). If it is wet, bake up to 5 minutes more and check again.',
            'Înfige un băț de frigărui în centru. Trebuie să iasă cu câteva firimituri umede, nu cu compoziție lichidă (un termometru de gătit arată cel puțin 80 °C). Dacă iese ud, mai coace până la 5 minute și verifică din nou.',
          ),
        },
        {
          key: 'cool',
          text: t(
            'Cool the cake in the tin for 30 minutes before releasing the springform and lifting it onto a plate.',
            'Lasă tortul să se răcească în formă 30 de minute, apoi desface forma și treci-l pe o farfurie.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'dust',
          text: t(
            'Once cool, dust with the icing sugar through a sieve and cut into 10 slices.',
            'Când s-a răcit, pudrează cu zahărul pudră printr-o sită și taie în 10 felii.',
          ),
        },
      ],
      tips: [
        t(
          'Contains almonds, which are tree nuts: do not serve it to anyone with a nut allergy. It has no wheat flour, so it is gluten-free by recipe; if you cook for someone with coeliac disease, check the chocolate, cocoa and ground-almond labels for gluten.',
          'Conține migdale, care sunt fructe cu coajă lemnoasă: nu servi tortul cuiva alergic la fructe cu coajă lemnoasă. Nu conține făină de grâu, deci rețeta este fără gluten; dacă gătești pentru cineva cu boală celiacă, verifică etichetele de la ciocolată, cacao și migdale măcinate.',
        ),
        t(
          'Do not taste the raw batter or let children lick the bowl: it holds raw egg. Wash the bowl and spatula as soon as you are done.',
          'Nu gusta compoziția crudă și nu lăsa copiii să lingă bolul: conține ou crud. Spală bolul și spatula imediat după ce termini.',
        ),
        t(
          'Covered, the cake keeps for 2 days at room temperature, or up to 4 days in the fridge; take it out of the fridge an hour before serving.',
          'Acoperit, tortul ține 2 zile la temperatura camerei sau până la 4 zile la frigider; scoate-l din frigider cu o oră înainte de servire.',
        ),
      ],
      stepTips: [
        {
          step: 'whites',
          text: t(
            'Whites whip best from room temperature in a spotless bowl; any grease or yolk keeps them from peaking.',
            'Albușurile se bat cel mai bine la temperatura camerei, într-un bol impecabil; orice urmă de grăsime sau gălbenuș le împiedică să facă vârfuri.',
          ),
        },
      ],
      nutritionNote: t(
        'Almonds add unsaturated fat, some protein and fibre, and there is no wheat flour, but the butter and chocolate bring plenty of saturated fat and the sugar makes it a sweet, dense treat. A thin slice goes a long way.',
        'Migdalele aduc grăsimi nesaturate, ceva proteine și fibre, iar tortul nu conține făină de grâu, dar untul și ciocolata aduc multe grăsimi saturate, iar zahărul îl face un desert dulce și dens. O felie subțire e de ajuns.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Lightly whipped cream', 'Frișcă ușor bătută'),
          reason: t(
            'Soft, cool cream softens the dense, rich crumb.',
            'Crema moale și rece îmblânzește miezul dens și bogat.',
          ),
          principle: 'contrast_texture',
          ingredient: 'whipping-cream',
        },
        {
          kind: 'food',
          label: t('Fresh raspberries', 'Zmeură proaspătă'),
          reason: t(
            'Their tartness cuts through the rich chocolate and butter.',
            'Aciditatea lor taie din bogăția ciocolatei și a untului.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'raspberry',
        },
        {
          kind: 'drink',
          label: t('Espresso', 'Espresso'),
          reason: t(
            'Its bitterness balances the sweet chocolate and almonds.',
            'Amăreala lui echilibrează dulceața ciocolatei și a migdalelor.',
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
            'A slice with a hot coffee is a comforting end to a cold day.',
            'O felie cu o cafea fierbinte încheie plăcut o zi rece.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Sweet and rich, with a little caffeine from the chocolate, it may not sit well before bed.',
            'Fiind dulce și bogat, cu puțină cafeină din ciocolată, poate să nu cadă bine înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
