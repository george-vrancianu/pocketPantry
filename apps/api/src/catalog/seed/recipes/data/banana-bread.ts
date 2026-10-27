import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Banana bread base is the classic loaf made with very ripe bananas. Each
// Variant is a full Recipe with its own lines, steps and guidance; the base's
// Recipe-level Tips are inherited unless a Variant hides them.
export const bananaBread: BaseRecipeSeed = {
  slug: 'banana-bread',
  title: t(
    'Banana bread',
    'Banana bread (pâine dulce cu banane foarte coapte)',
  ),
  servings: 10,
  prepMinutes: 15,
  cookMinutes: 100,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'banana',
      quantity: 3,
      unit: 'pcs',
      note: t(
        'very ripe, about 350 g peeled',
        'foarte coapte, aproximativ 350 g curățate',
      ),
    },
    {
      ingredient: 'butter',
      quantity: 100,
      unit: 'g',
      note: t('for the batter', 'pentru aluat'),
    },
    {
      ingredient: 'butter',
      key: 'butter-tin',
      quantity: 10,
      unit: 'g',
      note: t('for the tin', 'pentru tavă'),
    },
    { ingredient: 'brown-sugar', quantity: 130, unit: 'g' },
    { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
    { ingredient: 'vanilla-extract', quantity: 5, unit: 'ml' },
    { ingredient: 'flour', quantity: 210, unit: 'g' },
    { ingredient: 'baking-soda', quantity: 5, unit: 'g' },
    { ingredient: 'salt', quantity: 2, unit: 'g' },
    { ingredient: 'cinnamon', quantity: 2, unit: 'g', optional: true },
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
        'Heat the oven to 180 °C (160 °C fan) with a rack in the middle. It takes about 15 minutes, so prepare the tin and the batter in the meantime.',
        'Încinge cuptorul la 180 °C (160 °C cu ventilator), cu grătarul la mijloc. Durează cam 15 minute, așa că pregătește între timp tava și aluatul.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'tin',
      text: t(
        'Butter a 900 g loaf tin (about 23 × 13 cm) with the 10 g of butter and line the base and the long sides with baking paper.',
        'Unge cu cele 10 g de unt o tavă de chec de 900 g (aproximativ 23 × 13 cm) și căptușește fundul și laturile lungi cu hârtie de copt.',
      ),
    },
    {
      key: 'mash',
      text: t(
        'Mash the bananas in a large bowl with a fork until mostly smooth, with a few small lumps left.',
        'Zdrobește bananele într-un bol mare cu furculița, până se face un piure aproape neted, cu câteva bucățele mici rămase.',
      ),
    },
    {
      key: 'wet',
      text: t(
        'Melt the 100 g of butter and let it cool for a few minutes so it does not cook the eggs. Beat it into the bananas with the brown sugar, the eggs and the vanilla until combined.',
        'Topește cele 100 g de unt și lasă-l câteva minute să se răcească, ca să nu coaguleze ouăle. Bate-l împreună cu zahărul brun, ouăle și vanilia peste banane, până se omogenizează.',
      ),
    },
    {
      key: 'dry',
      text: t(
        'Sprinkle the flour, baking soda, salt and cinnamon over the bowl and fold with a spatula just until no dry flour shows. Fold in the walnuts, if using.',
        'Presară făina, bicarbonatul, sarea și scorțișoara în bol și amestecă cu o spatulă, ridicând aluatul de jos în sus, doar până nu se mai vede făină uscată. Adaugă nucile, dacă folosești.',
      ),
    },
    {
      key: 'fill',
      text: t(
        'Scrape the batter into the tin and level the top.',
        'Toarnă aluatul în tavă și netezește suprafața.',
      ),
    },
    {
      key: 'bake',
      text: t('Bake for 40 minutes.', 'Coace 40 de minute.'),
      timerSeconds: 2400,
    },
    {
      key: 'tent',
      text: t(
        'Look at the loaf. If the top is already deep brown, lay a sheet of foil loosely over it so the inside can finish without the crust burning.',
        'Verifică pâinea. Dacă partea de sus e deja maro închis, pune deasupra, fără să strângi, o foaie de folie de aluminiu, ca interiorul să se coacă fără să se ardă crusta.',
      ),
    },
    {
      key: 'finish',
      text: t(
        'Bake for 15 minutes more, then push a skewer into the centre. It should come out clean (a few dry crumbs are fine) and the inside should read 93 to 96 °C on a probe thermometer. If the skewer is wet, bake 5 minutes at a time and test again.',
        'Mai coace 15 minute, apoi înfige o scobitoare lungă (sau o frigăruie subțire) în centru. Trebuie să iasă curată (câteva firimituri uscate nu contează), iar în interior termometrul cu sondă trebuie să arate 93-96 °C. Dacă iese udă, coace câte 5 minute și verifică din nou.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'cool-tin',
      text: t(
        'Leave the loaf to cool in the tin for 10 minutes; it is fragile while hot.',
        'Lasă pâinea să se răcească 10 minute în tavă; cât e fierbinte se rupe ușor.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'cool-rack',
      text: t(
        'Lift the loaf out by the paper onto a wire rack and cool for at least 30 minutes before slicing.',
        'Scoate pâinea din tavă ținând de hârtie, pune-o pe un grătar și lasă-o să se răcească cel puțin 30 de minute înainte să o tai.',
      ),
      timerSeconds: 1800,
    },
  ],
  tips: [
    t(
      'Use bananas with peels that are well speckled or black: they are sweeter and mash easily. Pale yellow bananas give a dry, bland result.',
      'Folosește banane cu coaja mult pătată sau neagră: sunt mai dulci și se zdrobesc ușor. Bananele galben-pal dau un rezultat uscat și fad.',
    ),
    t(
      'Stop folding as soon as the flour disappears; mixing longer makes the loaf tough and tunnelled.',
      'Oprește amestecarea de îndată ce dispare făina; dacă amesteci mai mult, pâinea iese tare și cu găuri lungi.',
    ),
  ],
  stepTips: [
    {
      step: 'dry',
      text: t(
        'The batter contains raw egg: keep children, older people and anyone pregnant from tasting it, and bake until the loaf is fully done.',
        'Aluatul conține ou crud: nu lăsa copiii, vârstnicii sau femeile însărcinate să îl guste și coace pâinea până e complet gata.',
      ),
    },
    {
      step: 'tent',
      text: t(
        'Ovens differ, so go by the colour of the crust rather than the clock: the tent lets the middle catch up without drying the outside.',
        'Cuptoarele diferă, așa că te ghidezi după culoarea crustei, nu după ceas: folia lasă mijlocul să ajungă din urmă fără să usuce exteriorul.',
      ),
    },
    {
      step: 'cool-rack',
      text: t(
        'Keep it wrapped at room temperature for 2 to 3 days. For longer, freeze the slices wrapped one by one and toast them straight from frozen.',
        'Ține-o învelită, la temperatura camerei, 2-3 zile. Pentru mai mult timp, congelează feliile învelite separat și prăjește-le direct din congelator.',
      ),
    },
  ],
  nutritionNote: t(
    'Bananas add some fibre and potassium and make it filling for a cake, and walnuts bring mostly unsaturated fat. But brown sugar and butter make it sweet and energy-dense, with saturated fat from the butter, and the white flour gives little fibre. Treat it as a treat, in modest slices.',
    'Bananele aduc ceva fibre și potasiu și o fac săturătoare pentru un desert, iar nucile aduc mai ales grăsimi nesaturate. Zahărul brun și untul o fac însă dulce și bogată în energie, cu grăsimi saturate din unt, iar făina albă dă puține fibre. Mănâncă-o ca pe un răsfăț, în felii moderate.',
  ),
  pairings: [
    {
      kind: 'drink',
      label: t('Coffee', 'Cafea'),
      reason: t(
        'Its bitterness balances the sweet, buttery crumb.',
        'Amăreala ei echilibrează miezul dulce și untos.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'coffee',
    },
    {
      kind: 'food',
      label: t('Greek yogurt', 'Iaurt grecesc'),
      reason: t(
        'Its tang cuts the sweetness and the creaminess suits the soft loaf.',
        'Aciditatea lui taie dulceața, iar cremozitatea se potrivește cu pâinea moale.',
      ),
      principle: 'complement_flavour',
      ingredient: 'greek-yogurt',
    },
    {
      kind: 'drink',
      label: t('Cold milk', 'Lapte rece'),
      reason: t(
        'A glass of plain milk goes well with the caramel flavour of the brown sugar.',
        'Un pahar de lapte simplu merge bine cu gustul de caramel al zahărului brun.',
      ),
      principle: 'complement_flavour',
      ingredient: 'milk',
    },
  ],
  eatingMoments: [
    {
      moment: 'morning',
      polarity: 'good_for',
      reason: t(
        'A slice with coffee is a quick, filling start to the day.',
        'O felie cu cafea e un început de zi rapid și săturător.',
      ),
    },
    {
      moment: 'brunch',
      polarity: 'good_for',
      reason: t(
        'Made ahead and sliced as needed, so it suits a relaxed table.',
        'Se face dinainte și se taie la nevoie, deci se potrivește unei mese relaxate.',
      ),
    },
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A warm slice with a hot drink comforts on a chilly afternoon.',
        'O felie caldă cu o băutură fierbinte alină într-o după-amiază friguroasă.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'The sugar is a lot right before bed.',
        'Zahărul e mult chiar înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'banana-bread-brazilian',
      cuisine: 'brazilian',
      // This cake wants firm-ripe banana slices, and the batter is blended.
      hideBaseTips: [0, 1],
      title: t(
        'Bolo de banana caramelizada (Brazilian upside-down caramel banana cake)',
        'Bolo de banana caramelizada (prăjitură braziliană răsturnată, cu banane și caramel)',
      ),
      servings: 8,
      prepMinutes: 20,
      cookMinutes: 65,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'sugar',
          key: 'sugar-caramel',
          quantity: 100,
          unit: 'g',
          note: t('for the caramel', 'pentru caramel'),
        },
        {
          ingredient: 'banana',
          quantity: 4,
          unit: 'pcs',
          note: t(
            'ripe but still firm, halved lengthways',
            'coapte, dar încă ferme, tăiate pe lung',
          ),
        },
        { ingredient: 'cinnamon', quantity: 3, unit: 'g' },
        { ingredient: 'eggs', quantity: 3, unit: 'pcs' },
        { ingredient: 'sunflower-oil', quantity: 120, unit: 'ml' },
        {
          ingredient: 'sugar',
          key: 'sugar-batter',
          quantity: 150,
          unit: 'g',
          note: t('for the batter', 'pentru aluat'),
        },
        { ingredient: 'milk', quantity: 0.24, unit: 'l' },
        { ingredient: 'flour', quantity: 250, unit: 'g' },
        { ingredient: 'baking-powder', quantity: 10, unit: 'g' },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 180 °C (160 °C fan) with a rack in the middle. It takes about 15 minutes, so make the batter and slice the bananas in the meantime.',
            'Încinge cuptorul la 180 °C (160 °C cu ventilator), cu grătarul la mijloc. Durează cam 15 minute, așa că între timp fă aluatul și taie bananele.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'batter',
          text: t(
            'Blend the eggs, oil, the 150 g of sugar and the milk for about a minute, until smooth. Add the flour and baking powder and blend briefly, just until smooth.',
            'Mixează ouăle, uleiul, cele 150 g de zahăr și laptele cam un minut, până se omogenizează. Adaugă făina și praful de copt și mixează scurt, doar până se netezește.',
          ),
        },
        {
          key: 'bananas',
          text: t(
            'Peel the bananas and halve them lengthways. Put the cinnamon on a plate and toss the banana halves in it. Set the plate next to the tin, so everything is ready before the caramel.',
            'Curăță bananele și taie-le pe lung. Pune scorțișoara pe o farfurie și tăvălește bucățile de banană prin ea. Lasă farfuria lângă tavă, ca totul să fie gata înainte de caramel.',
          ),
        },
        {
          key: 'caramel',
          text: t(
            'Put the 100 g of sugar in a heavy saucepan over medium heat, with no water. Leave it until the edges melt, then swirl the pan (stir only if needed) until the sugar is a deep amber. Watch it closely, because it darkens fast and turns bitter. Take it off the heat at once. Hot caramel is far hotter than boiling water and sticks to skin, so keep children away and never touch it. Never add water to it: it spits violently.',
            'Pune cele 100 g de zahăr într-o cratiță cu fundul gros, la foc mediu, fără apă. Lasă-l până se topește pe margini, apoi rotește cratița (amestecă doar dacă e nevoie) până zahărul devine chihlimbariu închis. Stai lângă el, pentru că se închide repede la culoare și devine amar. Ia-l imediat de pe foc. Caramelul fierbinte e mult mai fierbinte decât apa clocotită și se lipește de piele, așa că ține copiii departe și nu-l atinge. Nu adăuga niciodată apă în el: stropește violent.',
          ),
        },
        {
          key: 'pour',
          text: t(
            'Set a 22 cm round metal cake tin at least 6 cm deep (not a springform, which leaks) on a heatproof board. Pour the caramel in straight away and tilt the tin with oven gloves so it covers the base. The tin gets hot, so use oven gloves.',
            'Așază o tavă rotundă metalică de 22 cm și înaltă de cel puțin 6 cm (nu una cu fund detașabil, care curge) pe un suport rezistent la căldură. Toarnă caramelul imediat și înclină tava, cu mănuși de bucătărie, ca să acopere fundul. Tava se încinge, deci folosește mănuși de bucătărie.',
          ),
        },
        {
          key: 'arrange',
          text: t(
            'Cut the banana halves to fit the tin and lay them cut side down on the caramel, packed close together.',
            'Taie jumătățile de banană ca să încapă în tavă și așază-le cu partea tăiată în jos peste caramel, bine lipite una de alta.',
          ),
        },
        {
          key: 'fill',
          text: t(
            'Pour the batter slowly over the bananas so they stay in place.',
            'Toarnă aluatul încet peste banane, ca să nu se mute.',
          ),
        },
        {
          key: 'bake',
          text: t('Bake for 40 minutes.', 'Coace 40 de minute.'),
          timerSeconds: 2400,
        },
        {
          key: 'test',
          text: t(
            'Push a skewer into the cake. It should come out clean and the top should be golden. If it is wet, bake 5 minutes more and test again.',
            'Înfige o scobitoare lungă în prăjitură. Trebuie să iasă curată, iar suprafața să fie aurie. Dacă iese udă, mai coace 5 minute și verifică din nou.',
          ),
        },
        {
          key: 'rest',
          text: t(
            'Rest the cake in the tin for 10 minutes. Turn it out while it is still warm: once the caramel cools completely it glues the cake to the tin.',
            'Lasă prăjitura 10 minute în tavă. Răstoarn-o cât e încă caldă: dacă se răcește complet, caramelul lipește prăjitura de tavă.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'turn-out',
          text: t(
            'Run a knife around the edge, set a larger plate on top and, holding both firmly with oven gloves, flip them over. Lift the tin away slowly: the caramel is still hot. Spoon any caramel left in the tin over the bananas.',
            'Trece un cuțit pe marginea tăvii, pune deasupra o farfurie mai mare și, ținând-le strâns cu mănuși de bucătărie, răstoarnă-le. Ridică tava încet: caramelul e încă fierbinte. Pune cu lingura peste banane caramelul rămas în tavă.',
          ),
        },
      ],
      tips: [
        t(
          'Keep the cake covered at room temperature for 1 day, or in the fridge for up to 4 days; the caramel turns sticky and softer in the fridge, so let a slice come to room temperature before serving.',
          'Ține prăjitura acoperită la temperatura camerei 1 zi sau la frigider până la 4 zile; caramelul se înmoaie și devine lipicios la frigider, așa că lasă felia să ajungă la temperatura camerei înainte de servire.',
        ),
        t(
          'Have the bananas, tin and batter ready before you start the caramel: it sets within a minute or two of leaving the heat.',
          'Pregătește bananele, tava și aluatul înainte să faci caramelul: se întărește în cel mult două minute după ce l-ai luat de pe foc.',
        ),
      ],
      stepTips: [
        {
          step: 'batter',
          text: t(
            'The batter contains raw egg: keep children, older people and anyone pregnant from tasting it, and bake until the cake is fully done.',
            'Aluatul conține ou crud: nu lăsa copiii, vârstnicii sau femeile însărcinate să îl guste și coace prăjitura până e complet gata.',
          ),
        },
        {
          step: 'caramel',
          text: t(
            'Soak the empty pan in water only once it has cooled completely: the caramel then dissolves without spitting.',
            'Pune cratița goală la înmuiat în apă abia după ce s-a răcit complet: caramelul se dizolvă atunci fără să stropească.',
          ),
        },
        {
          step: 'turn-out',
          text: t(
            'Flip it over the sink or a rimmed tray, so any caramel that runs over is caught there. Keep your hands and arms clear of steam and drips.',
            'Răstoarn-o deasupra chiuvetei sau a unei tăvi cu margine, ca să prindă caramelul care se scurge. Ține mâinile și brațele departe de abur și de picături.',
          ),
        },
      ],
      nutritionNote: t(
        'Bananas and eggs add some potassium and protein, and the oil is mostly unsaturated fat. But the caramel plus sugar in the batter make it very sweet, and the white flour adds little fibre, so cut small slices and keep it for occasions.',
        'Bananele și ouăle aduc ceva potasiu și proteine, iar uleiul e în mare parte grăsime nesaturată. Caramelul și zahărul din aluat o fac însă foarte dulce, iar făina albă aduce puține fibre, deci taie felii mici și păstrează-o pentru ocazii.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Strong black coffee', 'Cafea neagră tare'),
          reason: t(
            'Its bitterness balances the sweet caramel.',
            'Amăreala ei echilibrează caramelul dulce.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'coffee',
        },
        {
          kind: 'food',
          label: t('Ice cream', 'Înghețată'),
          reason: t(
            'Cold, smooth ice cream against the soft warm cake and sticky caramel.',
            'Înghețata rece și fină contrastează cu prăjitura moale și caldă și cu caramelul lipicios.',
          ),
          principle: 'contrast_texture',
          ingredient: 'ice-cream',
        },
      ],
      eatingMoments: [
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'A showy, easy cake to turn out at a relaxed table.',
            'O prăjitură spectaculoasă și ușor de răsturnat la o masă relaxată.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Warm banana and caramel are comforting when it is cold.',
            'Banana caldă și caramelul alină când e frig.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Caramel and sugar are a lot right before bed.',
            'Caramelul și zahărul sunt mult chiar înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'banana-bread-indian',
      cuisine: 'indian',
      // A kneaded dough, not a batter: only the ripe-banana tip carries over.
      hideBaseTips: [1],
      title: t(
        'Mangalore buns (sweet banana puris)',
        'Mangalore buns (pâinițe pufoase prăjite, din aluat dulce cu banane, ca în India)',
      ),
      servings: 6,
      prepMinutes: 375,
      cookMinutes: 40,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'banana',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'very ripe, about 200 g peeled',
            'foarte coapte, aproximativ 200 g curățate',
          ),
        },
        { ingredient: 'sugar', quantity: 40, unit: 'g' },
        { ingredient: 'yogurt', quantity: 60, unit: 'g' },
        {
          ingredient: 'clarified-butter',
          quantity: 15,
          unit: 'g',
          optional: true,
          note: t('melted', 'topit'),
        },
        { ingredient: 'cumin-seeds', quantity: 2, unit: 'g' },
        { ingredient: 'baking-soda', quantity: 1.5, unit: 'g' },
        { ingredient: 'salt', quantity: 2, unit: 'g' },
        {
          ingredient: 'flour',
          quantity: 250,
          unit: 'g',
          note: t('for the dough', 'pentru aluat'),
        },
        {
          ingredient: 'flour',
          key: 'flour-dusting',
          quantity: 30,
          unit: 'g',
          note: t('for rolling', 'pentru întins'),
        },
        {
          ingredient: 'sunflower-oil',
          quantity: 1500,
          unit: 'ml',
          note: t(
            'for deep-frying, about 4 cm deep',
            'pentru prăjit, cam 4 cm adâncime',
          ),
        },
      ],
      steps: [
        {
          key: 'mash',
          text: t(
            'Mash the bananas in a large bowl until smooth. Stir in the sugar, yogurt and ghee, if using.',
            'Zdrobește bananele într-un bol mare, până se face un piure neted. Amestecă zahărul, iaurtul și untul clarificat (ghee), topit, dacă îl folosești.',
          ),
        },
        {
          key: 'knead',
          text: t(
            'Add the 250 g of flour, the cumin seeds, baking soda and salt. Mix, then knead on the work surface for about 5 minutes into a soft, slightly sticky dough. If it is too sticky to knead, work in a little of the 30 g of flour set aside for rolling.',
            'Adaugă cele 250 g de făină, semințele de chimion, bicarbonatul și sarea. Amestecă, apoi frământă pe blat cam 5 minute, până obții un aluat moale, ușor lipicios. Dacă e prea lipicios ca să-l frămânți, adaugă puțină din cele 30 g de făină puse deoparte pentru întins.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'rest',
          text: t(
            'Cover the bowl and leave the dough in a cool room, out of the sun, for 6 to 8 hours. It should look puffy, with a mild tangy smell.',
            'Acoperă bolul și lasă aluatul într-o cameră răcoroasă, ferit de soare, 6-8 ore. Trebuie să arate umflat și să miroasă ușor acrișor.',
          ),
          timerSeconds: 21600,
        },
        {
          key: 'roll',
          text: t(
            'Dust the surface with some of the 30 g of flour. Divide the dough into 12 balls of about 45 g and roll each one into a disc about 10 cm across and 5 mm thick. Brush off extra flour and set the discs on a tray, covered with a clean cloth.',
            'Presară blatul cu puțină din cele 30 g de făină. Împarte aluatul în 12 bile de aproximativ 45 g și întinde fiecare bilă într-un disc de cam 10 cm lățime și 5 mm grosime. Scutură făina în exces și așază discurile pe o tavă, acoperite cu un prosop curat.',
          ),
        },
        {
          key: 'heat-oil',
          text: t(
            'Pour the oil into a heavy, deep pan about 22 cm wide and at least 12 cm tall, so the oil is about 4 cm deep and fills no more than a third of the pan. Heat it over medium heat to 180 °C on a thermometer, which takes about 10 minutes. Stay by the stove. If you have no thermometer, drop in a small scrap of dough: it should sizzle and float up within seconds, without browning at once. Lift the scrap out.',
            'Toarnă uleiul într-o cratiță adâncă, cu fundul gros, lată de aproximativ 22 cm și înaltă de cel puțin 12 cm, astfel încât uleiul să aibă cam 4 cm adâncime și să umple cel mult o treime din vas. Încălzește-l la foc mediu până la 180 °C pe termometru, ceea ce durează cam 10 minute. Rămâi lângă aragaz. Dacă nu ai termometru, scufundă un fragment mic de aluat: trebuie să sfârâie și să iasă la suprafață în câteva secunde, fără să se rumenească imediat. Scoate fragmentul.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'fry',
          text: t(
            'Lower 2 discs into the oil with a slotted spoon, away from you. Fry for about 1 minute per side, pressing them gently under the oil so they puff, until golden on both sides.',
            'Coboară 2 discuri în ulei cu o lingură cu găuri, în direcția opusă ție. Prăjește-le cam 1 minut pe fiecare parte, apăsându-le ușor sub ulei ca să se umfle, până se rumenesc pe ambele părți.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'check',
          text: t(
            'Lift the first two out, drain them on kitchen paper and tear one open. The inside should be dry and cooked, with no wet dough. If it is raw, lower the heat a little and fry the next ones a bit longer.',
            'Scoate primele două, scurge-le pe hârtie de bucătărie și rupe una în două. Interiorul trebuie să fie uscat și copt, fără aluat umed. Dacă e crud, micșorează puțin focul și prăjește următoarele ceva mai mult.',
          ),
        },
        {
          key: 'batches',
          text: t(
            'Fry the rest in batches of 2, letting the oil come back to 180 °C between batches, and drain them all on kitchen paper.',
            'Prăjește restul în porții de câte 2, lăsând uleiul să revină la 180 °C între porții, și scurge-le pe hârtie de bucătărie.',
          ),
        },
        {
          key: 'finish-oil',
          text: t(
            'Turn off the heat. Leave the pan where it is, uncovered but untouched, until the oil is completely cold. Serve the buns warm.',
            'Oprește focul. Lasă cratița pe loc, descoperită și neatinsă, până când uleiul se răcește complet. Servește pâinițele calde.',
          ),
        },
      ],
      tips: [
        t(
          'Deep-frying safety: never leave hot oil unattended and keep children and pets out of the kitchen. Use a deep pan filled to no more than a third, with about 4 cm of oil, and keep it at about 180 °C: if it smokes, turn the heat off. Keep water away from hot oil, since it makes it spit; dry everything that goes into it and brush off excess flour. If the oil catches fire, turn off the heat if it is safe to do so, do not move the pan, and cover it with a lid or a damp tea towel. Never use water. If it does not go out at once, get everyone out, close the door and call 112.',
          'Siguranță la prăjirea în ulei mult: nu lăsa niciodată uleiul fierbinte nesupravegheat și ține copiii și animalele departe de bucătărie. Folosește o cratiță adâncă, umplută cel mult o treime, cu cam 4 cm de ulei, și ține-l la aproximativ 180 °C: dacă scoate fum, oprește focul. Ține apa departe de uleiul fierbinte, pentru că îl face să stropească; usucă tot ce intră în el și scutură făina în exces. Dacă uleiul ia foc, oprește focul dacă poți face asta în siguranță, nu muta cratița și acoper-o cu un capac sau cu un prosop ud (stors). Nu folosi niciodată apă. Dacă focul nu se stinge imediat, scoate toți oamenii din casă, închide ușa și sună la 112.',
        ),
      ],
      stepTips: [
        {
          step: 'fry',
          text: t(
            'Do not crowd the pan: more buns cool the oil, and cooler oil gives pale, greasy buns.',
            'Nu aglomera cratița: mai multe pâinițe răcesc uleiul, iar uleiul mai rece dă pâinițe palide și grase.',
          ),
        },
        {
          step: 'finish-oil',
          text: t(
            'Cold oil can be strained and used once more; never pour it down the drain. Eat leftover buns within a day at room temperature, or refrigerate them within 2 hours and reheat in a 180 °C oven for about 8 minutes.',
            'Uleiul rece poate fi strecurat și folosit încă o dată; nu-l turna niciodată în chiuvetă. Mănâncă pâinițele rămase în aceeași zi, la temperatura camerei, sau pune-le la frigider în cel mult 2 ore și reîncălzește-le în cuptor la 180 °C, cam 8 minute.',
          ),
        },
      ],
      nutritionNote: t(
        'Banana gives some potassium and fibre, and yogurt a little protein and calcium. But deep-frying makes the buns oily and energy-dense, the white flour and sugar add little fibre, and ghee, if used, adds saturated fat. Enjoy two or three as a treat, not an everyday breakfast.',
        'Banana aduce ceva potasiu și fibre, iar iaurtul puține proteine și calciu. Prăjirea în ulei mult face însă pâinițele grase și bogate în energie, făina albă și zahărul aduc puține fibre, iar untul clarificat (ghee), dacă îl folosești, adaugă grăsimi saturate. Mănâncă două-trei ca pe un răsfăț, nu ca mic dejun zilnic.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Coconut chutney', 'Chutney de cocos'),
          reason: t(
            'Mangalore buns are usually eaten with coconut chutney; its fresh, savoury taste offsets the sweet dough.',
            'Pâinițele Mangalore se mănâncă de obicei cu chutney de cocos; gustul lui proaspăt și sărat contrastează cu aluatul dulce.',
          ),
          principle: 'regional_tradition',
          ingredient: 'coconut',
        },
        {
          kind: 'drink',
          label: t('Hot tea with milk', 'Ceai fierbinte cu lapte'),
          reason: t(
            'The tannin and warmth cut the oiliness of the fried buns.',
            'Taninul și căldura taie senzația de gras a pâinițelor prăjite.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'tea',
        },
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'Its bitterness balances the sweet, rich dough.',
            'Amăreala ei echilibrează aluatul dulce și bogat.',
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
            'Best warm, with a hot drink, as a weekend breakfast.',
            'Sunt cele mai bune calde, cu o băutură fierbinte, la un mic dejun de weekend.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Warm fried bread comforts when it is cold.',
            'Pâinea caldă și prăjită alină când e frig.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Deep-fried dough sits heavy in the stomach during hard exercise.',
            'Aluatul prăjit în ulei mult cade greu la stomac în timpul unui efort intens.',
          ),
        },
      ],
    },
  ],
};
