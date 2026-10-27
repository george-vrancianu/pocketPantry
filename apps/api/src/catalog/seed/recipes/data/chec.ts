import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Chec base is the Romanian marble loaf: an oil-and-milk batter with a
// cocoa swirl, baked in a 25 cm loaf tin. Each Variant is a full Recipe with
// its own lines, steps and guidance; the base's Recipe-level Tips are
// inherited unless a Variant hides them. All three loaves use the same
// 25 × 11 cm tin, at least 7 cm deep (about 1.5-1.7 l with sloped sides), and
// each batter is about 850-950 ml, so it fills the tin to roughly 3.5-4 cm
// and has room to rise.
export const chec: BaseRecipeSeed = {
  slug: 'chec',
  title: t(
    'Romanian marble loaf cake with cocoa (chec marmorat)',
    'Chec marmorat cu cacao',
  ),
  servings: 10,
  prepMinutes: 25,
  cookMinutes: 105,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'butter',
      quantity: 10,
      unit: 'g',
      note: t('for the tin', 'pentru tavă'),
    },
    {
      ingredient: 'eggs',
      quantity: 4,
      unit: 'pcs',
      note: t('large', 'mari'),
    },
    { ingredient: 'sugar', quantity: 150, unit: 'g' },
    { ingredient: 'vanilla-sugar', quantity: 8, unit: 'g' },
    { ingredient: 'salt', quantity: 1, unit: 'g' },
    { ingredient: 'sunflower-oil', quantity: 120, unit: 'ml' },
    {
      ingredient: 'milk',
      quantity: 0.1,
      unit: 'l',
      note: t('for the batter', 'pentru aluat'),
    },
    {
      ingredient: 'lemon',
      quantity: 1,
      unit: 'pcs',
      note: t('zest only, finely grated', 'doar coaja, rasă fin'),
    },
    { ingredient: 'flour', quantity: 230, unit: 'g' },
    { ingredient: 'baking-powder', quantity: 8, unit: 'g' },
    { ingredient: 'cocoa-powder', quantity: 20, unit: 'g' },
    {
      ingredient: 'milk',
      key: 'milk-cocoa',
      quantity: 0.015,
      unit: 'l',
      note: t('for the cocoa batter', 'pentru aluatul cu cacao'),
    },
    {
      ingredient: 'icing-sugar',
      quantity: 10,
      unit: 'g',
      optional: true,
      note: t('to dust the top', 'pentru pudrat deasupra'),
    },
  ],
  steps: [
    {
      key: 'preheat',
      text: t(
        'Heat the oven to 175 °C (155 °C fan) with a rack in the middle. It takes about 15 minutes, so prepare the tin and the batter in the meantime.',
        'Încinge cuptorul la 175 °C (155 °C cu ventilator), cu grătarul la mijloc. Durează cam 15 minute, așa că între timp pregătește tava și aluatul.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'tin',
      text: t(
        'Grease a 25 × 11 cm loaf tin, at least 7 cm deep, with the butter and line the base and the long sides with baking paper, leaving a little overhang to lift the loaf out by.',
        'Unge cu untul o tavă de chec de 25 × 11 cm, înaltă de cel puțin 7 cm, și căptușește fundul și laturile lungi cu hârtie de copt, lăsând puțină hârtie în exces, ca să poți scoate checul ținând de ea.',
      ),
    },
    {
      key: 'whisk',
      text: t(
        'Whisk the eggs, sugar, vanilla sugar and salt in a large bowl with an electric mixer for about 4 minutes, until pale, thick and doubled in volume, so that a ribbon of batter lifted from the whisk stays on the surface for a moment.',
        'Bate ouăle cu zahărul, zahărul vanilat și sarea într-un bol mare, cu mixerul electric, cam 4 minute, până devin deschise la culoare, groase și își dublează volumul, iar o panglică de compoziție ridicată cu telul rămâne un moment la suprafață.',
      ),
      timerSeconds: 240,
    },
    {
      key: 'wet',
      text: t(
        'With the mixer on low, pour in the oil in a thin stream, then the 100 ml of milk, and mix in the lemon zest.',
        'Cu mixerul la viteză mică, toarnă uleiul în fir subțire, apoi cei 100 ml de lapte, și amestecă coaja de lămâie.',
      ),
    },
    {
      key: 'dry',
      text: t(
        'Mix the flour and baking powder, sift them over the bowl and fold in with a spatula, lifting from the bottom, just until no dry flour shows. The batter should fall from the spatula in a thick ribbon.',
        'Amestecă făina cu praful de copt, cerne-le peste bol și încorporează-le cu o spatulă, ridicând compoziția de jos în sus, doar până nu se mai vede făină uscată. Aluatul trebuie să curgă de pe spatulă într-o panglică groasă.',
      ),
    },
    {
      key: 'split',
      text: t(
        'Scoop about a third of the batter (roughly 300 ml, a generous cupful and a half) into a second bowl. Sift the cocoa over it, add the 15 ml of milk and fold until smooth and evenly brown.',
        'Pune aproximativ o treime din aluat (cam 300 ml, o cană și jumătate) într-un al doilea bol. Cerne cacaua peste el, adaugă cei 15 ml de lapte și amestecă până se omogenizează și are o culoare maronie uniformă.',
      ),
    },
    {
      key: 'fill',
      text: t(
        'Spread half of the pale batter in the tin, spoon the cocoa batter in a line down the middle, then cover with the rest of the pale batter. The tin will be only about half full, which leaves room for the loaf to rise.',
        'Întinde jumătate din aluatul alb în tavă, pune aluatul cu cacao cu lingura într-o dungă pe mijloc, apoi acoperă cu restul de aluat alb. Tava va fi plină doar pe jumătate, deci checul are loc să crească.',
      ),
    },
    {
      key: 'swirl',
      text: t(
        'Push a skewer down to the bottom and draw two or three slow zigzags along the length of the tin, then level the top lightly.',
        'Înfige o frigăruie subțire până la fund și trage două-trei zigzaguri lente pe lungimea tăvii, apoi netezește ușor suprafața.',
      ),
    },
    {
      key: 'bake',
      text: t(
        'Bake for 45 minutes without opening the oven door.',
        'Coace 45 de minute, fără să deschizi ușa cuptorului.',
      ),
      timerSeconds: 2700,
    },
    {
      key: 'test',
      text: t(
        'Push a skewer into the centre of the loaf. It should come out clean (a few dry crumbs are fine), the top should be risen and cracked along the middle, and a probe thermometer, if you have one, should read 96 to 99 °C in the centre. If the skewer is wet, bake 5 minutes more and test again.',
        'Înfige o scobitoare lungă în centrul checului. Trebuie să iasă curată (câteva firimituri uscate nu contează), partea de sus să fie crescută și crăpată pe mijloc, iar termometrul cu sondă, dacă ai unul, să arate 96-99 °C în centru. Dacă scobitoarea iese udă, mai coace 5 minute și verifică din nou.',
      ),
    },
    {
      key: 'cool-tin',
      text: t(
        'Leave the loaf to cool in the tin for 10 minutes; it is fragile while hot.',
        'Lasă checul să se răcească 10 minute în tavă; cât e fierbinte se rupe ușor.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'cool-rack',
      text: t(
        'Lift the loaf out by the paper onto a wire rack and cool for at least 45 minutes before slicing. Dust with icing sugar, if you like.',
        'Scoate checul din tavă ținând de hârtie, pune-l pe un grătar și lasă-l să se răcească cel puțin 45 de minute înainte să-l tai. Pudrează-l cu zahăr pudră, dacă vrei.',
      ),
      timerSeconds: 2700,
    },
  ],
  tips: [
    t(
      'Test in the centre and go by the skewer, not the clock: the middle of a loaf is the last part to set, and ovens differ. If the top is already deep brown before the centre is done, lay a sheet of foil loosely over it.',
      'Verifică în centru și ghidează-te după scobitoare, nu după ceas: mijlocul este ultimul care se coace, iar cuptoarele diferă. Dacă partea de sus e deja maro închis înainte să fie gata centrul, pune deasupra, fără să strângi, o foaie de folie de aluminiu.',
    ),
    t(
      'Keep the cooled loaf wrapped or in an airtight tin at room temperature and eat it within 3 days. For longer, freeze the slices wrapped one by one for up to 3 months and thaw them still wrapped at room temperature.',
      'Ține checul răcit învelit sau într-o cutie ermetică, la temperatura camerei, și mănâncă-l în cel mult 3 zile. Pentru mai mult timp, congelează feliile învelite separat, până la 3 luni, și lasă-le să se dezghețe învelite, la temperatura camerei.',
    ),
  ],
  stepTips: [
    {
      step: 'dry',
      text: t(
        'The batter contains raw egg: keep children, older people and anyone pregnant from tasting it, and bake until the loaf is fully done.',
        'Aluatul conține ou crud: nu lăsa copiii, vârstnicii sau femeile însărcinate să îl guste și coace checul până e complet gata.',
      ),
    },
    {
      step: 'swirl',
      text: t(
        'Stop after two or three passes: more than that blends the two batters into a uniform light brown instead of clear marbling.',
        'Oprește-te după două-trei treceri: dacă amesteci mai mult, cele două aluaturi se contopesc într-un maro deschis uniform, în loc să rămână marmorate.',
      ),
    },
    {
      step: 'bake',
      text: t(
        'Opening the door in the first 30 minutes lets heat escape before the crumb has set, and the loaf can sink in the middle.',
        'Dacă deschizi ușa în primele 30 de minute, iese căldura înainte să se fixeze miezul, iar checul poate să se lase la mijloc.',
      ),
    },
  ],
  nutritionNote: t(
    'Eggs and milk add some protein, the oil is mostly unsaturated fat, and cocoa gives a little fibre and flavour. But sugar and white flour make it sweet and energy-dense, with little fibre, so it is a treat in modest slices rather than a daily snack.',
    'Ouăle și laptele aduc ceva proteine, uleiul e în mare parte grăsime nesaturată, iar cacaoa dă puțină fibră și aromă. Zahărul și făina albă îl fac însă dulce și bogat în energie, cu puține fibre, așa că e un răsfăț în felii moderate, nu o gustare zilnică.',
  ),
  pairings: [
    {
      kind: 'drink',
      label: t('Coffee', 'Cafea'),
      reason: t(
        'Its bitterness balances the sweet, cocoa-rich crumb.',
        'Amăreala ei echilibrează miezul dulce, cu cacao.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'coffee',
    },
    {
      kind: 'food',
      label: t('Raspberries', 'Zmeură'),
      reason: t(
        'Their tartness cuts the richness of the oil-and-egg crumb and suits the cocoa.',
        'Aciditatea lor taie bogăția miezului cu ulei și ou și se potrivește cu cacaoa.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'raspberry',
    },
  ],
  eatingMoments: [
    {
      moment: 'morning',
      polarity: 'good_for',
      reason: t(
        'A slice with coffee is a quick start to the day, and the loaf keeps well for several days.',
        'O felie cu cafea e un început rapid de zi, iar checul se păstrează bine mai multe zile.',
      ),
    },
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A slice with a hot drink comforts on a chilly afternoon.',
        'O felie cu o băutură fierbinte alină într-o după-amiază friguroasă.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'The sugar is a lot right before bed.',
        'E prea mult zahăr chiar înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'chec-scandinavian',
      cuisine: 'scandinavian',
      title: t(
        'Sandkage (Danish butter pound cake)',
        'Sandkage (chec danez cu unt)',
      ),
      servings: 10,
      prepMinutes: 30,
      cookMinutes: 105,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'butter',
          key: 'butter-tin',
          quantity: 10,
          unit: 'g',
          note: t('for the tin', 'pentru tavă'),
        },
        {
          ingredient: 'butter',
          quantity: 200,
          unit: 'g',
          note: t('soft, at room temperature', 'moale, la temperatura camerei'),
        },
        { ingredient: 'sugar', quantity: 200, unit: 'g' },
        {
          ingredient: 'eggs',
          quantity: 4,
          unit: 'pcs',
          note: t(
            'medium, at room temperature',
            'mărime medie, la temperatura camerei',
          ),
        },
        { ingredient: 'flour', quantity: 200, unit: 'g' },
        { ingredient: 'baking-powder', quantity: 5, unit: 'g' },
        { ingredient: 'salt', quantity: 1, unit: 'g' },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t('zest only, finely grated', 'doar coaja, rasă fin'),
        },
        { ingredient: 'vanilla-sugar', quantity: 8, unit: 'g' },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 175 °C (155 °C fan) with a rack in the middle. It takes about 15 minutes, so prepare the tin and the batter in the meantime.',
            'Încinge cuptorul la 175 °C (155 °C cu ventilator), cu grătarul la mijloc. Durează cam 15 minute, așa că între timp pregătește tava și aluatul.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'tin',
          text: t(
            'Grease a 25 × 11 cm loaf tin, at least 7 cm deep, with the 10 g of butter and line the base and the long sides with baking paper, leaving a little overhang to lift the cake out by.',
            'Unge cu cele 10 g de unt o tavă de chec de 25 × 11 cm, înaltă de cel puțin 7 cm, și căptușește fundul și laturile lungi cu hârtie de copt, lăsând puțină hârtie în exces, ca să poți scoate checul ținând de ea.',
          ),
        },
        {
          key: 'cream',
          text: t(
            'Beat the soft butter with the sugar, vanilla sugar, lemon zest and salt with an electric mixer for about 4 minutes, until pale and fluffy.',
            'Bate untul moale cu zahărul, zahărul vanilat, coaja de lămâie și sarea, cu mixerul electric, cam 4 minute, până devine deschis la culoare și pufos.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'eggs',
          text: t(
            'Add the eggs one at a time, beating each in fully before the next. If the mixture starts to look split, beat in a spoonful of the flour.',
            'Adaugă ouăle pe rând, bătând fiecare până se încorporează complet înainte de următorul. Dacă amestecul începe să se taie, bate în el o lingură din făină.',
          ),
        },
        {
          key: 'dry',
          text: t(
            'Mix the flour and baking powder, sift them over the bowl and fold in with a spatula, lifting from the bottom, just until no dry flour shows. The batter should be thick and smooth.',
            'Amestecă făina cu praful de copt, cerne-le peste bol și încorporează-le cu o spatulă, ridicând compoziția de jos în sus, doar până nu se mai vede făină uscată. Aluatul trebuie să fie gros și neted.',
          ),
        },
        {
          key: 'fill',
          text: t(
            'Scrape the batter into the tin and level the top. The tin will be only about half full, which leaves room for the cake to rise.',
            'Pune aluatul în tavă și netezește suprafața. Tava va fi plină doar pe jumătate, deci checul are loc să crească.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 45 minutes without opening the oven door.',
            'Coace 45 de minute, fără să deschizi ușa cuptorului.',
          ),
          timerSeconds: 2700,
        },
        {
          key: 'test',
          text: t(
            'Push a skewer into the centre of the cake. It should come out clean (a few dry crumbs are fine), the top should be golden and cracked along the middle, and a probe thermometer, if you have one, should read 96 to 99 °C in the centre. If the skewer is wet, bake 5 minutes more and test again; this cake often needs 50 to 55 minutes in all.',
            'Înfige o scobitoare lungă în centrul checului. Trebuie să iasă curată (câteva firimituri uscate nu contează), suprafața să fie aurie și crăpată pe mijloc, iar termometrul cu sondă, dacă ai unul, să arate 96-99 °C în centru. Dacă scobitoarea iese udă, mai coace 5 minute și verifică din nou; acest chec are adesea nevoie de 50-55 de minute în total.',
          ),
        },
        {
          key: 'cool-tin',
          text: t(
            'Leave the cake to cool in the tin for 10 minutes; it is fragile while hot.',
            'Lasă checul să se răcească 10 minute în tavă; cât e fierbinte se rupe ușor.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'cool-rack',
          text: t(
            'Lift the cake out by the paper onto a wire rack and cool for at least 45 minutes before slicing.',
            'Scoate checul din tavă ținând de hârtie, pune-l pe un grătar și lasă-l să se răcească cel puțin 45 de minute înainte să-l tai.',
          ),
          timerSeconds: 2700,
        },
      ],
      tips: [
        t(
          'Take the butter and eggs out of the fridge an hour ahead: cold eggs make the creamed butter split, and the cake turns heavy.',
          'Scoate untul și ouăle din frigider cu o oră înainte: ouăle reci taie untul bătut, iar checul iese greu.',
        ),
      ],
      stepTips: [
        {
          step: 'dry',
          text: t(
            'The batter contains raw egg: keep children, older people and anyone pregnant from tasting it, and bake until the cake is fully done.',
            'Aluatul conține ou crud: nu lăsa copiii, vârstnicii sau femeile însărcinate să îl guste și coace checul până e complet gata.',
          ),
        },
      ],
      nutritionNote: t(
        'Eggs add some protein, and the butter gives a fine, rich crumb. But the butter brings a lot of saturated fat, and sugar and white flour make it sweet and energy-dense with almost no fibre, so keep to thin slices.',
        'Ouăle aduc ceva proteine, iar untul dă un miez fin și bogat. Untul aduce însă multă grăsime saturată, iar zahărul și făina albă îl fac dulce și bogat în energie, aproape fără fibre, așa că taie felii subțiri.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'Its bitterness balances the rich, buttery crumb.',
            'Amăreala ei echilibrează miezul bogat, cu unt.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'coffee',
        },
        {
          kind: 'food',
          label: t('Strawberries', 'Căpșuni'),
          reason: t(
            'Their fresh tartness cuts through the butter and sugar.',
            'Aciditatea lor proaspătă taie untul și zahărul.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'strawberry',
        },
      ],
      eatingMoments: [
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'Made a day ahead and sliced thin, so it suits a relaxed table.',
            'Se face cu o zi înainte și se taie subțire, deci se potrivește unei mese relaxate.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A buttery slice with a hot drink comforts on a chilly afternoon.',
            'O felie fragedă, bogată în unt, alături de o băutură fierbinte, alină într-o după-amiază friguroasă.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'The sugar and butter are a lot right before bed.',
            'E prea mult zahăr și unt chiar înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'chec-british',
      cuisine: 'british',
      title: t(
        'Lemon drizzle loaf cake',
        'Chec englezesc cu lămâie și sirop (lemon drizzle cake)',
      ),
      servings: 10,
      prepMinutes: 20,
      cookMinutes: 110,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'butter',
          key: 'butter-tin',
          quantity: 10,
          unit: 'g',
          note: t('for the tin', 'pentru tavă'),
        },
        {
          ingredient: 'butter',
          quantity: 225,
          unit: 'g',
          note: t('soft, at room temperature', 'moale, la temperatura camerei'),
        },
        {
          ingredient: 'sugar',
          key: 'sugar-batter',
          quantity: 225,
          unit: 'g',
          note: t('for the batter', 'pentru aluat'),
        },
        {
          ingredient: 'eggs',
          quantity: 4,
          unit: 'pcs',
          note: t('large', 'mari'),
        },
        { ingredient: 'self-raising-flour', quantity: 225, unit: 'g' },
        {
          ingredient: 'milk',
          quantity: 0.03,
          unit: 'l',
        },
        {
          ingredient: 'lemon',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'zest of both in the batter, juice of one and a half for the drizzle (squeeze the half last)',
            'coaja ambelor în aluat, sucul a o lămâie și jumătate pentru sirop (stoarce jumătatea la urmă)',
          ),
        },
        {
          ingredient: 'sugar',
          key: 'sugar-drizzle',
          quantity: 85,
          unit: 'g',
          note: t('for the drizzle', 'pentru sirop'),
        },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 175 °C (155 °C fan) with a rack in the middle. It takes about 15 minutes, so prepare the tin and the batter in the meantime.',
            'Încinge cuptorul la 175 °C (155 °C cu ventilator), cu grătarul la mijloc. Durează cam 15 minute, așa că între timp pregătește tava și aluatul.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'tin',
          text: t(
            'Grease a 25 × 11 cm loaf tin, at least 7 cm deep, with the 10 g of butter and line the base and the long sides with baking paper, leaving a little overhang to lift the cake out by.',
            'Unge cu cele 10 g de unt o tavă de chec de 25 × 11 cm, înaltă de cel puțin 7 cm, și căptușește fundul și laturile lungi cu hârtie de copt, lăsând puțină hârtie în exces, ca să poți scoate checul ținând de ea.',
          ),
        },
        {
          key: 'zest',
          text: t(
            'Grate the zest of both lemons finely, then squeeze the juice of one and a half lemons into a small bowl and set it aside for the drizzle.',
            'Dă pe răzătoare fină coaja ambelor lămâi, apoi stoarce sucul a o lămâie și jumătate într-un bol mic și lasă-l deoparte pentru sirop.',
          ),
        },
        {
          key: 'mix',
          text: t(
            'Put the 225 g of soft butter, the 225 g of sugar for the batter, the eggs, the self-raising flour, the milk and the zest in a large bowl and beat with an electric mixer for about 2 minutes, until smooth, pale and thick enough to drop slowly from a spoon.',
            'Pune cele 225 g de unt moale, cele 225 g de zahăr pentru aluat, ouăle, făina cu praf de copt, laptele și coaja într-un bol mare și bate cu mixerul electric cam 2 minute, până compoziția e netedă, deschisă la culoare și suficient de groasă cât să cadă încet de pe lingură.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'fill',
          text: t(
            'Scrape the batter into the tin and level the top. The tin will be only about half full, which leaves room for the cake to rise.',
            'Pune aluatul în tavă și netezește suprafața. Tava va fi plină doar pe jumătate, deci checul are loc să crească.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 45 minutes without opening the oven door.',
            'Coace 45 de minute, fără să deschizi ușa cuptorului.',
          ),
          timerSeconds: 2700,
        },
        {
          key: 'test',
          text: t(
            'Push a skewer into the centre of the cake. It should come out clean (a few dry crumbs are fine), the top should be golden, and a probe thermometer, if you have one, should read 96 to 99 °C in the centre. If the skewer is wet, bake 5 minutes more and test again.',
            'Înfige o scobitoare lungă în centrul checului. Trebuie să iasă curată (câteva firimituri uscate nu contează), suprafața să fie aurie, iar termometrul cu sondă, dacă ai unul, să arate 96-99 °C în centru. Dacă scobitoarea iese udă, mai coace 5 minute și verifică din nou.',
          ),
        },
        {
          key: 'syrup',
          text: t(
            'Stir the 85 g of sugar into the lemon juice just briefly and use it at once, while the sugar is still grainy: the sugar that stays undissolved makes the crunchy crust.',
            'Amestecă cele 85 g de zahăr în sucul de lămâie doar scurt și folosește-l imediat, cât zahărul e încă granulat: zahărul care rămâne nedizolvat dă crusta crocantă.',
          ),
        },
        {
          key: 'drizzle',
          text: t(
            'While the cake is still hot in its tin, prick it all over with a skewer, going down about 3 cm, and spoon the lemon mixture slowly over the top so the juice sinks in and the sugar stays on the surface.',
            'Cât timp checul e încă fierbinte în tavă, înțeapă-l peste tot cu o scobitoare lungă, cam 3 cm în adâncime, și toarnă cu lingura amestecul de lămâie încet deasupra, ca sucul să se absoarbă, iar zahărul să rămână la suprafață.',
          ),
        },
        {
          key: 'cool',
          text: t(
            'Leave the cake to cool in the tin for about 1 hour, until the topping has set to a crisp crust and the tin is barely warm. Lift it out by the paper and slice.',
            'Lasă checul să se răcească în tavă cam 1 oră, până când glazura se întărește într-o crustă crocantă, iar tava e abia caldă. Scoate-l ținând de hârtie și taie-l felii.',
          ),
          timerSeconds: 3600,
        },
      ],
      tips: [
        t(
          'Drizzle while the cake is hot: on a cold cake the juice sits on top instead of soaking in, and the crust does not set as thin and crisp.',
          'Toarnă siropul cât checul e fierbinte: pe un chec rece sucul rămâne deasupra în loc să se absoarbă, iar crusta nu se întărește la fel de subțire și crocantă.',
        ),
      ],
      stepTips: [
        {
          step: 'mix',
          text: t(
            'The batter contains raw egg: keep children, older people and anyone pregnant from tasting it, and bake until the cake is fully done.',
            'Aluatul conține ou crud: nu lăsa copiii, vârstnicii sau femeile însărcinate să îl guste și coace checul până e complet gata.',
          ),
        },
        {
          step: 'zest',
          text: t(
            'Grate only the yellow part of the peel: the white pith underneath is bitter.',
            'Dă pe răzătoare doar partea galbenă a cojii: partea albă de sub coajă e amară.',
          ),
        },
      ],
      nutritionNote: t(
        'Eggs add some protein and the lemon adds freshness without extra fat. But the butter brings a lot of saturated fat, and sugar in both the cake and the drizzle makes it sweet and energy-dense, with little fibre, so keep to thin slices.',
        'Ouăle aduc ceva proteine, iar lămâia dă prospețime fără grăsime în plus. Untul aduce însă multă grăsime saturată, iar zahărul din chec și din sirop îl face dulce și bogat în energie, cu puține fibre, așa că taie felii subțiri.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Tea', 'Ceai'),
          reason: t(
            'Its slight bitterness balances the sweet, sharp lemon crust.',
            'Amăreala lui ușoară echilibrează crusta dulce și acrișoară de lămâie.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'tea',
        },
        {
          kind: 'food',
          label: t('Greek yogurt', 'Iaurt grecesc'),
          reason: t(
            'Its cool tang suits the lemon, and its creaminess softens the crisp crust.',
            'Gustul lui acrișor și rece se potrivește cu lămâia, iar cremozitatea înmoaie crusta crocantă.',
          ),
          principle: 'contrast_texture',
          ingredient: 'greek-yogurt',
        },
      ],
      eatingMoments: [
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'Made ahead and sliced as needed, and the lemon keeps it fresh-tasting.',
            'Se face dinainte și se taie la nevoie, iar lămâia îi dă un gust proaspăt.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A slice with a hot cup of tea comforts on a chilly afternoon.',
            'O felie cu o ceașcă de ceai fierbinte alină într-o după-amiază friguroasă.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'The sugar is a lot right before bed.',
            'E prea mult zahăr chiar înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
