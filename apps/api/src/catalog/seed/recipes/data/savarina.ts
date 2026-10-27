import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Savarină base is the Romanian rum-soaked yeast ring cake, filled with
// whipped cream. Each Variant is a full Recipe with its own lines, steps and
// guidance. The baba hides the alcohol and cream-storage Tips (it has more
// rum and serves the cream on the side) and writes its own; the tres leches
// has no yeast, no rum and no rum syrup, so it hides all four base Tips.
export const savarina: BaseRecipeSeed = {
  slug: 'savarina',
  title: t(
    'Romanian rum-soaked yeast ring cake with whipped cream (savarină)',
    'Savarină cu sirop de rom și frișcă',
  ),
  servings: 10,
  prepMinutes: 150,
  cookMinutes: 65,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'flour',
      quantity: 400,
      unit: 'g',
      note: t(
        '40 g for the leaven, 360 g for the dough',
        '40 g pentru maia, 360 g pentru aluat',
      ),
    },
    { ingredient: 'fresh-yeast', quantity: 25, unit: 'g' },
    {
      ingredient: 'milk',
      quantity: 0.2,
      unit: 'l',
      note: t(
        '100 ml for the leaven, 100 ml for the dough; hand-warm',
        '100 ml pentru maia, 100 ml pentru aluat; căldicel',
      ),
    },
    {
      ingredient: 'sugar',
      quantity: 300,
      unit: 'g',
      note: t(
        '10 g for the leaven, 40 g for the dough, 250 g for the syrup',
        '10 g pentru maia, 40 g pentru aluat, 250 g pentru sirop',
      ),
    },
    {
      ingredient: 'eggs',
      quantity: 4,
      unit: 'pcs',
      note: t(
        'medium, at room temperature',
        'mărime M, la temperatura camerei',
      ),
    },
    {
      ingredient: 'butter',
      quantity: 140,
      unit: 'g',
      note: t(
        '125 g soft for the dough, 15 g for the ring',
        '125 g moale pentru aluat, 15 g pentru formă',
      ),
    },
    { ingredient: 'salt', quantity: 4, unit: 'g' },
    { ingredient: 'vanilla-sugar', quantity: 8, unit: 'g' },
    {
      ingredient: 'lemon',
      quantity: 2,
      unit: 'pcs',
      note: t(
        'zest of 1 for the dough, peel of 1 in strips for the syrup',
        'coaja rasă de la 1 pentru aluat, coaja de la 1, în fâșii, pentru sirop',
      ),
    },
    {
      ingredient: 'orange',
      quantity: 1,
      unit: 'pcs',
      note: t('peel in strips, for the syrup', 'coaja, în fâșii, pentru sirop'),
    },
    {
      ingredient: 'still-water',
      quantity: 0.5,
      unit: 'l',
      note: t('for the syrup', 'pentru sirop'),
    },
    {
      ingredient: 'rum',
      quantity: 100,
      unit: 'ml',
      note: t(
        'stirred into the syrup off the heat',
        'amestecat în sirop, după ce ai luat vasul de pe foc',
      ),
    },
    {
      ingredient: 'whipping-cream',
      quantity: 400,
      unit: 'ml',
      note: t('cold', 'rece'),
    },
    { ingredient: 'icing-sugar', quantity: 40, unit: 'g' },
    {
      ingredient: 'jam',
      quantity: 80,
      unit: 'g',
      optional: true,
      note: t('apricot, for glazing', 'de caise, pentru glazurat'),
    },
    {
      ingredient: 'fruit-compote',
      quantity: 150,
      unit: 'g',
      optional: true,
      note: t(
        'sour cherries, drained, for the top',
        'de vișine, scurse, pentru deasupra',
      ),
    },
  ],
  steps: [
    {
      key: 'leaven',
      text: t(
        'Warm 100 ml of the milk until hand-warm. Crumble in the yeast, add 10 g of the sugar and 40 g of the flour, and stir smooth. Leave it for 15 minutes, until it is foamy and has about doubled.',
        'Încălzește 100 ml din lapte până e căldicel. Mărunțește drojdia în el, adaugă 10 g din zahăr și 40 g din făină și amestecă până se omogenizează. Lasă 15 minute, până face spumă și își dublează aproape volumul.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'ring',
      text: t(
        'Melt 15 g of the butter and brush it thickly into every groove of a 24 cm ring mould of at least 2 litres. Grate the zest of 1 lemon.',
        'Topește 15 g din unt și unge cu el din belșug fiecare adâncitură a unei forme de savarină de 24 cm, de cel puțin 2 litri. Dă pe răzătoare coaja unei lămâi.',
      ),
    },
    {
      key: 'dough',
      text: t(
        'In a large bowl mix the remaining 360 g flour, 40 g sugar, salt, vanilla sugar and the lemon zest. Add the leaven, the remaining 100 ml milk and the eggs. Beat for 8 minutes with a wooden spoon or the dough hook, until the dough is smooth, glossy and sticky, and pulls away from the bowl in strands.',
        'Într-un castron mare amestecă cei 360 g de făină rămași, cei 40 g de zahăr, sarea, zahărul vanilat și coaja de lămâie. Adaugă maiaua, cei 100 ml de lapte rămași și ouăle. Bate 8 minute cu lingura de lemn sau cu cârligul de frământat, până aluatul e fin, lucios și lipicios și se desprinde de pe castron în fire.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'butter',
      text: t(
        'Add the 125 g soft butter in three pieces, beating each in before the next. Keep beating for 3 minutes, until the dough is smooth again and no streaks of butter remain.',
        'Adaugă cei 125 g de unt moale în trei bucăți, bătând fiecare bucată până se încorporează. Mai bate 3 minute, până aluatul e din nou fin și nu se mai văd urme de unt.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'fill-ring',
      text: t(
        'Spoon the dough into the ring, so that it fills it no more than half, and smooth the top with a wet spoon. If your ring is smaller, bake any extra dough in a small buttered tin, checking it from 15 minutes.',
        'Pune aluatul cu lingura în formă, cel mult până la jumătate, și netezește-l deasupra cu o lingură udă. Dacă forma ta e mai mică, coace aluatul rămas într-o tavă mică unsă cu unt și verific-o de la 15 minute.',
      ),
    },
    {
      key: 'rise',
      text: t(
        'Cover the ring with a clean tea towel and leave it in a warm place for 60 minutes, until the dough has risen to just below the rim of the ring.',
        'Acoperă forma cu un prosop curat și las-o la căldură 60 de minute, până aluatul crește aproape de marginea formei.',
      ),
      timerSeconds: 3600,
    },
    {
      key: 'syrup',
      text: t(
        'While the dough rises, put the water, the 250 g sugar and the strips of lemon and orange peel in a pan. Bring to the boil, then simmer for 5 minutes. Take the pan off the heat and leave it to cool until hand-warm.',
        'Cât timp crește aluatul, pune într-o cratiță apa, cei 250 g de zahăr și fâșiile de coajă de lămâie și de portocală. Adu la fierbere, apoi fierbe încet 5 minute. Ia cratița de pe foc și lasă siropul să se răcească până e căldicel.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'preheat',
      text: t(
        'About 15 minutes before the rise ends, heat the oven to 180 °C with a rack in the lower third.',
        'Cu vreo 15 minute înainte de sfârșitul dospirii, încinge cuptorul la 180 °C, cu grătarul în treimea de jos.',
      ),
    },
    {
      key: 'bake',
      text: t(
        'Bake for 30 minutes. The cake is done when it is deep golden, a skewer pushed into the thickest part comes out clean and it sounds hollow when tapped. If not, bake on and check every 5 minutes.',
        'Coace 30 de minute. Savarina e gata când e auriu-închis, un bețișor lung de lemn înfipt în partea cea mai groasă iese curat și sună a gol când bați în ea. Dacă nu, mai coace și verifică la fiecare 5 minute.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'rum',
      text: t(
        'Fish out the peel and stir the rum into the hand-warm syrup.',
        'Scoate cojile și amestecă romul în siropul căldicel.',
      ),
    },
    {
      key: 'unmould',
      text: t(
        'Take the cake out of the oven and leave it in the ring for 5 minutes. Run a thin knife around the edges and turn it out onto a rack set over a tray.',
        'Scoate prăjitura din cuptor și las-o 5 minute în formă. Trece un cuțit subțire pe margini și răstoarn-o pe un grătar așezat peste o tavă.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'soak',
      text: t(
        'While the cake is still warm, spoon the syrup slowly over it, scooping up what drips into the tray and spooning it over again. Keep going for about 10 minutes, until the cake feels heavy and no more syrup soaks in.',
        'Cât timp prăjitura e încă caldă, toarnă siropul cu lingura, încet, peste ea, adunând din tavă ce se scurge și turnând din nou. Continuă cam 10 minute, până prăjitura devine grea și nu mai absoarbe sirop.',
      ),
    },
    {
      key: 'cool',
      text: t(
        'Leave the cake on the rack until it is completely cool, about 1 hour. If you glaze it, warm the jam in a small pan until runny, sieve it and brush it over the cooled cake.',
        'Lasă prăjitura pe grătar până se răcește complet, cam o oră. Dacă o glazurezi, încălzește dulceața într-o cratiță mică până se subțiază, strecoar-o și unge cu ea prăjitura rece.',
      ),
    },
    {
      key: 'whip',
      text: t(
        'Whip the cold cream with the icing sugar until it holds firm peaks that stand up on the whisk. Stop there: more whisking turns it grainy.',
        'Bate frișca rece cu zahărul pudră până face vârfuri tari, care stau drepte pe tel. Oprește-te atunci: dacă bați mai mult, se taie.',
      ),
    },
    {
      key: 'fill',
      text: t(
        'Slide the cake onto a serving plate with two wide spatulas. Pile the cream into the hollow and over the top, and add the drained sour cherries if you use them. Put the cake in the fridge straight away.',
        'Mut-o pe un platou cu două spatule late. Pune frișca în gaura din mijloc și deasupra, apoi adaugă vișinele scurse, dacă le folosești. Pune prăjitura imediat la frigider.',
      ),
    },
  ],
  tips: [
    t(
      'The rum goes into the syrup off the heat, so the alcohol stays: USDA retention tables give about 85% even for alcohol stirred into a boiling liquid taken off the heat; stirred into a syrup that has already cooled, as here, nearly all of it stays. With 100 ml of 40% rum, that is about 3 g of alcohol per slice, about two-fifths of a UK unit (8 g). The cake is not for children, anyone pregnant or anyone avoiding alcohol; for them use rum essence in the syrup instead, but check the label, because many essences are dissolved in alcohol.',
      'Romul intră în sirop după ce l-ai luat de pe foc, așa că alcoolul rămâne: tabelele USDA dau cam 85% alcool păstrat chiar și când e amestecat într-un lichid aflat în clocot și luat de pe foc; amestecat într-un sirop deja răcit, ca aici, aproape tot rămâne. La 100 ml de rom de 40%, asta înseamnă cam 3 g de alcool pe felie, cam două cincimi dintr-o unitate britanică (8 g). Prăjitura nu e pentru copii, pentru gravide sau pentru cine evită alcoolul; pentru ei pune esență de rom în sirop, dar citește eticheta, pentru că multe esențe sunt dizolvate în alcool.',
    ),
    t(
      'The dough is meant to be soft and sticky, more like a thick batter than a bread dough. Do not add flour to make it easier to handle: it gives a dry cake that will not drink the syrup.',
      'Aluatul trebuie să fie moale și lipicios, mai aproape de un aluat bătut gros decât de unul de pâine. Nu adăuga făină ca să-l manevrezi mai ușor: iese o prăjitură uscată, care nu bea siropul.',
    ),
    t(
      'A cake filled with whipped cream belongs in the fridge as soon as it is filled. It can stand at the table for at most 2 hours, and is best eaten within 1 day.',
      'O prăjitură umplută cu frișcă bătută se pune la frigider imediat ce e umplută. Poate sta pe masă cel mult 2 ore și e cel mai bine să o mănânci în maximum o zi.',
    ),
    t(
      'Hand-warm milk means you can hold a finger in it comfortably. Hot milk kills the yeast and cold milk makes the leaven slow.',
      'Lapte căldicel înseamnă că poți ține degetul în el fără să te frigă. Laptele fierbinte omoară drojdia, iar cel rece face maiaua leneșă.',
    ),
  ],
  stepTips: [
    {
      step: 'bake',
      text: t(
        'If the top is browning faster than the rest, lay a piece of foil loosely over the ring.',
        'Dacă partea de sus se rumenește mai repede decât restul, pune ușor deasupra o bucată de folie de aluminiu.',
      ),
    },
    {
      step: 'soak',
      text: t(
        'Spoon the syrup on in several rounds. Poured all at once, it runs off the crust into the tray instead of soaking in.',
        'Toarnă siropul în mai multe runde. Dacă îl torni deodată, se scurge pe coajă în tavă în loc să se absoarbă.',
      ),
    },
  ],
  nutritionNote: t(
    'A rich dessert: the sugar in the dough and syrup, and the butter and cream, bring a lot of sugar and saturated fat, and the rum adds alcohol. The eggs and milk add some protein. A small slice, with tart fruit on the side, is the sensible way to eat it.',
    'Un desert bogat: zahărul din aluat și din sirop, untul și frișca aduc mult zahăr și grăsimi saturate, iar romul adaugă alcool. Ouăle și laptele aduc și ceva proteine. O felie mică, cu fructe acrișoare alături, e felul chibzuit de a o mânca.',
  ),
  pairings: [
    {
      kind: 'drink',
      label: t('Coffee', 'Cafea'),
      reason: t(
        'Its bitterness balances the sweet syrup and the cream.',
        'Amăreala ei echilibrează siropul dulce și frișca.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'coffee',
    },
    {
      kind: 'food',
      label: t('Fresh apricots', 'Caise proaspete'),
      reason: t(
        'Their tartness cuts through the sweetness and the cream.',
        'Aciditatea lor taie dulceața și frișca.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'apricot',
    },
    {
      kind: 'food',
      label: t('Raspberries', 'Zmeură'),
      reason: t(
        'Fresh, tart berries lift the rich, soaked cake.',
        'Fructele de pădure proaspete, acrișoare, înviorează prăjitura bogată și îmbibată.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'raspberry',
    },
    {
      kind: 'drink',
      label: t('Tea', 'Ceai'),
      reason: t(
        'A cup of unsweetened tea cleans the sugar and cream from the palate.',
        'O ceașcă de ceai neîndulcit curăță gura de zahăr și de frișcă.',
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
        'Served cold from the fridge, it is a refreshing end to a meal.',
        'Servită rece din frigider, e un final răcoritor de masă.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Sugar, fat and alcohol sit heavy during exercise.',
        'Zahărul, grăsimea și alcoolul cad greu în timpul efortului.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A rich, sugary and alcoholic cake just before bed is a poor idea.',
        'O prăjitură bogată, dulce și cu alcool, chiar înainte de culcare, nu e o idee bună.',
      ),
    },
  ],
  variants: [
    {
      slug: 'savarina-french',
      cuisine: 'french',
      title: t(
        'Baba au rhum (French rum babas with raisins)',
        'Baba au rhum (babe franțuzești cu rom și stafide)',
      ),
      servings: 12,
      prepMinutes: 130,
      cookMinutes: 50,
      difficulty: 'medium',
      hideBaseTips: [0, 2],
      lines: [
        {
          ingredient: 'raisins',
          quantity: 80,
          unit: 'g',
        },
        {
          ingredient: 'rum',
          quantity: 220,
          unit: 'ml',
          note: t(
            '40 ml for the raisins, 120 ml for the syrup, 60 ml for the table',
            '40 ml pentru stafide, 120 ml pentru sirop, 60 ml pentru masă',
          ),
        },
        {
          ingredient: 'flour',
          quantity: 300,
          unit: 'g',
          note: t(
            '40 g for the leaven, 260 g for the dough',
            '40 g pentru maia, 260 g pentru aluat',
          ),
        },
        { ingredient: 'fresh-yeast', quantity: 20, unit: 'g' },
        {
          ingredient: 'milk',
          quantity: 0.12,
          unit: 'l',
          note: t(
            '70 ml for the leaven, 50 ml for the dough; hand-warm',
            '70 ml pentru maia, 50 ml pentru aluat; căldicel',
          ),
        },
        {
          ingredient: 'sugar',
          quantity: 330,
          unit: 'g',
          note: t(
            '5 g for the leaven, 25 g for the dough, 300 g for the syrup',
            '5 g pentru maia, 25 g pentru aluat, 300 g pentru sirop',
          ),
        },
        {
          ingredient: 'eggs',
          quantity: 3,
          unit: 'pcs',
          note: t(
            'medium, at room temperature',
            'mărime M, la temperatura camerei',
          ),
        },
        {
          ingredient: 'butter',
          quantity: 105,
          unit: 'g',
          note: t(
            '90 g soft for the dough, 15 g for the moulds',
            '90 g moale pentru aluat, 15 g pentru forme',
          ),
        },
        { ingredient: 'salt', quantity: 3, unit: 'g' },
        {
          ingredient: 'orange',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'peel in strips, for the syrup',
            'coaja, în fâșii, pentru sirop',
          ),
        },
        {
          ingredient: 'still-water',
          quantity: 0.6,
          unit: 'l',
          note: t('for the syrup', 'pentru sirop'),
        },
        {
          ingredient: 'whipping-cream',
          quantity: 300,
          unit: 'ml',
          note: t('cold', 'rece'),
        },
        { ingredient: 'icing-sugar', quantity: 30, unit: 'g' },
        {
          ingredient: 'jam',
          quantity: 80,
          unit: 'g',
          optional: true,
          note: t('apricot, for glazing', 'de caise, pentru glazurat'),
        },
      ],
      steps: [
        {
          key: 'raisins',
          text: t(
            'Put the raisins and 40 ml of the rum in a small bowl, stir, and leave them for 30 minutes, stirring once.',
            'Pune stafidele și 40 ml din rom într-un bol mic, amestecă și lasă-le 30 de minute, amestecând o dată.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'leaven',
          text: t(
            'Warm 70 ml of the milk until hand-warm. Crumble in the yeast, add 5 g of the sugar and 40 g of the flour, and stir smooth. Leave it for 15 minutes, until it is foamy.',
            'Încălzește 70 ml din lapte până e căldicel. Mărunțește drojdia în el, adaugă 5 g din zahăr și 40 g din făină și amestecă până se omogenizează. Lasă 15 minute, până face spumă.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'moulds',
          text: t(
            'Melt 15 g of the butter and brush it thickly into 12 dariole or baba moulds of about 150 ml each. Stand them on a baking tray.',
            'Topește 15 g din unt și unge cu el din belșug 12 forme mici de babă sau de dariole, de cam 150 ml fiecare. Așază-le pe o tavă.',
          ),
        },
        {
          key: 'dough',
          text: t(
            'In a large bowl mix the remaining 260 g flour, 25 g sugar and the salt. Add the leaven, the remaining 50 ml milk and the eggs. Beat for 8 minutes with a wooden spoon or the dough hook, until the dough is smooth, glossy and sticky.',
            'Într-un castron mare amestecă cei 260 g de făină rămași, cei 25 g de zahăr și sarea. Adaugă maiaua, cei 50 ml de lapte rămași și ouăle. Bate 8 minute cu lingura de lemn sau cu cârligul de frământat, până aluatul e fin, lucios și lipicios.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'butter',
          text: t(
            'Add the 90 g soft butter in three pieces, beating each in before the next, and keep beating for 3 minutes until smooth again.',
            'Adaugă cei 90 g de unt moale în trei bucăți, bătând fiecare bucată până se încorporează, și mai bate 3 minute, până aluatul e din nou fin.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'raisins-in',
          text: t(
            'Fold in the raisins together with any rum left in their bowl.',
            'Încorporează stafidele împreună cu romul rămas în bol.',
          ),
        },
        {
          key: 'fill-moulds',
          text: t(
            'Spoon about 65 g of dough into each mould, which fills it a little under half.',
            'Pune în fiecare formă cam 65 g de aluat cu lingura, adică ceva sub jumătate din formă.',
          ),
        },
        {
          key: 'rise',
          text: t(
            'Cover the tray with a clean tea towel and leave it in a warm place for 45 minutes, until the dough has risen to just below the rim of the moulds.',
            'Acoperă tava cu un prosop curat și las-o la căldură 45 de minute, până aluatul crește aproape de marginea formelor.',
          ),
          timerSeconds: 2700,
        },
        {
          key: 'syrup',
          text: t(
            'While the dough rises, put the water, the 300 g sugar and the orange peel in a wide pan. Bring to the boil, then simmer for 5 minutes. Take the pan off the heat and leave it until hand-warm.',
            'Cât timp crește aluatul, pune într-o cratiță lată apa, cei 300 g de zahăr și coaja de portocală. Adu la fierbere, apoi fierbe încet 5 minute. Ia cratița de pe foc și lasă siropul să se răcească până e căldicel.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'preheat',
          text: t(
            'About 15 minutes before the rise ends, heat the oven to 190 °C with a rack in the middle.',
            'Cu vreo 15 minute înainte de sfârșitul dospirii, încinge cuptorul la 190 °C, cu grătarul la mijloc.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 18 minutes. The babas are done when they are deep golden and a skewer comes out clean. If not, bake on and check every 3 minutes.',
            'Coace 18 minute. Babele sunt gata când sunt auriu-închis și un bețișor lung de lemn iese curat. Dacă nu, mai coace și verifică la fiecare 3 minute.',
          ),
          timerSeconds: 1080,
        },
        {
          key: 'rum',
          text: t(
            'Fish out the peel and stir 120 ml of the rum into the hand-warm syrup.',
            'Scoate coaja și amestecă 120 ml din rom în siropul căldicel.',
          ),
        },
        {
          key: 'unmould',
          text: t(
            'Take the babas out and let them stand in the moulds for 5 minutes. Turn them out onto a rack.',
            'Scoate babele și lasă-le 5 minute în forme. Răstoarnă-le pe un grătar.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'soak',
          text: t(
            'While the babas are still warm, lower them a few at a time into the hand-warm syrup with a slotted spoon. Turn them for 1 to 2 minutes, until each is swollen and heavy, then lift them back onto the rack over a tray.',
            'Cât babele sunt încă calde, coboară-le câteva odată în siropul căldicel, cu o lingură cu găuri. Întoarce-le 1-2 minute, până fiecare se umflă și devine grea, apoi ridică-le înapoi pe grătar, deasupra unei tăvi.',
          ),
        },
        {
          key: 'glaze',
          text: t(
            'Leave the babas to cool for 30 minutes. If you glaze them, warm the jam in a small pan until runny, sieve it and brush a thin coat over each.',
            'Lasă babele să se răcească 30 de minute. Dacă le glazurezi, încălzește dulceața într-o cratiță mică până se subțiază, strecoar-o și unge fiecare babă cu un strat subțire.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'whip',
          text: t(
            'Whip the cold cream with the icing sugar until it holds soft peaks, then put it in the fridge in a bowl.',
            'Bate frișca rece cu zahărul pudră până face vârfuri moi, apoi pune-o la frigider într-un bol.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Set the babas on plates and spoon about 5 ml of the remaining 60 ml rum over each. Serve with a spoon of cream on the side.',
            'Pune babele pe farfurii și toarnă peste fiecare cam 5 ml din cei 60 ml de rom rămași. Servește cu o lingură de frișcă alături.',
          ),
        },
      ],
      tips: [
        t(
          'These babas hold a lot of rum: the rum in the syrup stays almost entirely (USDA retention tables give about 85% even for alcohol stirred into a boiling liquid taken off the heat), and the rum at the table is raw. Counting all 220 ml of 40% rum as if none was lost, that is at most about 6 g of alcohol per baba, nearly three-quarters of a UK unit (8 g). They are not for children, anyone pregnant or anyone avoiding alcohol; for them use rum essence, but check the label, because many essences are dissolved in alcohol.',
          'Babele astea țin mult rom: romul din sirop rămâne aproape în întregime (tabelele USDA dau cam 85% alcool păstrat chiar și când e amestecat într-un lichid aflat în clocot și luat de pe foc), iar romul de la masă e crud. Socotind toți cei 220 ml de rom de 40% ca și cum nimic nu s-ar pierde, ies cel mult vreo 6 g de alcool pe babă, aproape trei sferturi dintr-o unitate britanică (8 g). Nu sunt pentru copii, pentru gravide sau pentru cine evită alcoolul; pentru ei folosește esență de rom, dar citește eticheta, pentru că multe esențe sunt dizolvate în alcool.',
        ),
        t(
          'Whip the cream just before serving and keep it in the fridge until then; it can stand at the table for at most 2 hours. Cover the soaked babas and keep them in the fridge, and eat them within 1 day.',
          'Bate frișca chiar înainte de servire și ține-o la frigider până atunci; poate sta pe masă cel mult 2 ore. Acoperă babele îmbibate, ține-le la frigider și mănâncă-le în maximum o zi.',
        ),
      ],
      stepTips: [
        {
          step: 'soak',
          text: t(
            'If a baba still feels light or firm in the middle after soaking, press it gently in the syrup: it should sink a little and fill up. Turn it again for another minute.',
            'Dacă o babă e încă ușoară sau tare la mijloc după îmbibare, apasă-o ușor în sirop: ar trebui să se scufunde puțin și să se umple. Întoarce-o încă un minut.',
          ),
        },
      ],
      nutritionNote: t(
        'A sugary, buttery dessert with a lot of rum: sugar in the dough and syrup, butter and cream bring a lot of sugar and saturated fat, and the rum adds more alcohol than the savarină. The eggs and milk add some protein and the raisins a little fibre. One baba is enough.',
        'Un desert dulce, cu unt și mult rom: zahărul din aluat și din sirop, untul și frișca aduc mult zahăr și grăsimi saturate, iar romul adaugă mai mult alcool decât la savarină. Ouăle și laptele aduc ceva proteine, iar stafidele puțină fibră. O singură babă e de ajuns.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Espresso', 'Espresso'),
          reason: t(
            'Its bitterness balances the sweet, rum-soaked cake.',
            'Amăreala lui echilibrează prăjitura dulce, îmbibată în rom.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'coffee',
        },
        {
          kind: 'food',
          label: t('Raspberries', 'Zmeură'),
          reason: t(
            'Tart berries cut through the sugar and the cream.',
            'Fructele de pădure acrișoare taie zahărul și frișca.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'raspberry',
        },
        {
          kind: 'food',
          label: t('Ice cream', 'Înghețată'),
          reason: t(
            'Cold, plain ice cream sets off the rum-soaked cake.',
            'Înghețata rece și simplă pune în valoare prăjitura îmbibată în rom.',
          ),
          principle: 'complement_flavour',
          ingredient: 'ice-cream',
        },
      ],
      eatingMoments: [
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Sugar, fat and alcohol sit heavy during exercise.',
            'Zahărul, grăsimea și alcoolul cad greu în timpul efortului.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A baba with this much rum just before bed is a poor idea.',
            'O babă cu atâta rom chiar înainte de culcare nu e o idee bună.',
          ),
        },
      ],
    },
    {
      slug: 'savarina-mexican',
      cuisine: 'mexican',
      title: t(
        'Pastel de tres leches (Mexican three-milk soaked sponge cake)',
        'Pastel de tres leches (pandișpan mexican îmbibat cu trei feluri de lapte)',
      ),
      servings: 12,
      prepMinutes: 260,
      cookMinutes: 80,
      difficulty: 'medium',
      hideBaseTips: [0, 1, 2, 3],
      lines: [
        {
          ingredient: 'butter',
          quantity: 10,
          unit: 'g',
          note: t('for the tin', 'pentru tavă'),
        },
        {
          ingredient: 'eggs',
          quantity: 6,
          unit: 'pcs',
          note: t(
            'medium, at room temperature',
            'mărime M, la temperatura camerei',
          ),
        },
        { ingredient: 'sugar', quantity: 180, unit: 'g' },
        { ingredient: 'flour', quantity: 180, unit: 'g' },
        { ingredient: 'baking-powder', quantity: 6, unit: 'g' },
        {
          ingredient: 'milk',
          quantity: 0.06,
          unit: 'l',
          note: t('for the sponge', 'pentru pandișpan'),
        },
        { ingredient: 'vanilla-extract', quantity: 5, unit: 'ml' },
        { ingredient: 'evaporated-milk', quantity: 340, unit: 'g' },
        {
          ingredient: 'condensed-milk',
          quantity: 395,
          unit: 'g',
          note: t('sweetened', 'îndulcit'),
        },
        {
          ingredient: 'whipping-cream',
          quantity: 550,
          unit: 'ml',
          note: t(
            '250 ml for the soak, 300 ml for the topping, cold',
            '250 ml pentru îmbibat, 300 ml pentru deasupra, rece',
          ),
        },
        { ingredient: 'icing-sugar', quantity: 30, unit: 'g' },
        { ingredient: 'cinnamon', quantity: 2, unit: 'g', optional: true },
      ],
      steps: [
        {
          key: 'tin',
          text: t(
            'Grease a 33 by 23 cm tin that is at least 5 cm deep with the butter.',
            'Unge cu unt o tavă de 33 pe 23 cm, adâncă de cel puțin 5 cm.',
          ),
        },
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 180 °C with a rack in the middle. This takes about 15 minutes.',
            'Încinge cuptorul la 180 °C, cu grătarul la mijloc. Durează cam 15 minute.',
          ),
        },
        {
          key: 'whisk',
          text: t(
            'Whisk the eggs and sugar with an electric whisk for about 8 minutes, until the mixture is pale, has tripled and leaves a ribbon on the surface for 3 seconds when you lift the whisk.',
            'Bate ouăle cu zahărul cu mixerul cam 8 minute, până compoziția e deschisă la culoare, și-a triplat volumul și lasă o panglică pe suprafață timp de 3 secunde când ridici mixerul.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'fold',
          text: t(
            'Sift the flour and baking powder over it in three batches, folding each in gently with a spatula. Fold in the milk and vanilla, until no streaks of flour remain. Do not stir hard: it knocks out the air.',
            'Cerne făina cu praful de copt peste compoziție în trei reprize, încorporând fiecare repriză ușor, cu o spatulă. Încorporează laptele și vanilia, până nu mai rămân dungi de făină. Nu amesteca energic: pierzi aerul.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Scrape the batter into the tin, level it and bake for 27 minutes. The sponge is done when it is golden, springs back when pressed lightly and a skewer comes out clean. If not, bake on and check every 3 minutes.',
            'Toarnă compoziția în tavă, netezește-o și coace 27 de minute. Pandișpanul e gata când e auriu, revine când apeși ușor și un bețișor lung de lemn iese curat. Dacă nu, mai coace și verifică la fiecare 3 minute.',
          ),
          timerSeconds: 1620,
        },
        {
          key: 'cool',
          text: t(
            'Leave the sponge in the tin on a rack for 20 minutes, until just warm.',
            'Lasă pandișpanul în tavă, pe un grătar, 20 de minute, până e doar călduț.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'mix-milks',
          text: t(
            'Whisk the evaporated milk, condensed milk and 250 ml of the cream in a jug until smooth.',
            'Amestecă cu telul într-un vas cu cioc laptele evaporat, laptele condensat și 250 ml din frișcă, până se omogenizează.',
          ),
        },
        {
          key: 'soak',
          text: t(
            'Prick the sponge all over with a skewer, about every 2 cm. Pour the milk mixture over it in four rounds, waiting for each to sink in before the next. It will look swamped, which is right.',
            'Înțeapă pandișpanul peste tot cu un bețișor lung de lemn, cam din 2 în 2 cm. Toarnă amestecul de lapte peste el în patru reprize, așteptând ca fiecare să se absoarbă înainte de următoarea. Va părea înecat, ceea ce e corect.',
          ),
        },
        {
          key: 'chill',
          text: t(
            'Cover the tin and put it in the fridge for at least 4 hours, or overnight, until the cake is cold and the milk has soaked in.',
            'Acoperă tava și pune-o la frigider cel puțin 4 ore, sau peste noapte, până prăjitura e rece și laptele s-a absorbit.',
          ),
        },
        {
          key: 'top',
          text: t(
            'Whip the remaining 300 ml cold cream with the icing sugar until it holds soft peaks. Spread it over the chilled cake and dust with the cinnamon, if you use it.',
            'Bate cei 300 ml de frișcă rece rămași cu zahărul pudră până face vârfuri moi. Întinde-o peste prăjitura rece și presară scorțișoară, dacă o folosești.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Cut into 12 squares and serve cold, straight from the fridge.',
            'Taie 12 pătrate și servește rece, direct din frigider.',
          ),
        },
      ],
      tips: [
        t(
          'Evaporated milk is unsweetened and condensed milk is sweetened. Use condensed milk for both and the cake is sickly sweet; use evaporated milk for both and it is thin and bland.',
          'Laptele evaporat e neîndulcit, iar cel condensat e îndulcit. Dacă folosești doar lapte condensat, prăjitura iese prea dulce; dacă folosești doar lapte evaporat, iese fadă și apoasă.',
        ),
        t(
          'Keep the cake covered in the fridge and eat it within 2 days. It can stand at the table for at most 2 hours.',
          'Ține prăjitura acoperită la frigider și mănâncă-o în maximum 2 zile. Poate sta pe masă cel mult 2 ore.',
        ),
      ],
      stepTips: [
        {
          step: 'whisk',
          text: t(
            'Do not rush the whisking. This sponge has no yeast and only a little baking powder, so most of its rise comes from the air whisked into the eggs.',
            'Nu te grăbi cu bătutul. Pandișpanul acesta nu are drojdie și are doar puțin praf de copt, așa că cea mai mare parte din creștere vine din aerul bătut în ouă.',
          ),
        },
      ],
      nutritionNote: t(
        'Very sweet and milky: the three milks bring calcium and protein, but also a lot of sugar and saturated fat, and the sponge is white flour. It has no added alcohol beyond a trace from the vanilla extract. Cut small squares and serve with fresh fruit.',
        'Foarte dulce și cu mult lapte: cele trei feluri de lapte aduc calciu și proteine, dar și mult zahăr și grăsimi saturate, iar pandișpanul e din făină albă. Nu are alcool adăugat, în afară de o urmă din extractul de vanilie. Taie pătrățele mici și servește cu fructe proaspete.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Strawberries', 'Căpșuni'),
          reason: t(
            'Tart, fresh fruit cuts through the sweet, creamy cake.',
            'Fructele proaspete, acrișoare, taie dulceața prăjiturii cremoase.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'strawberry',
        },
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'Its bitterness balances the very sweet milk soak.',
            'Amăreala ei echilibrează îmbibatul foarte dulce de lapte.',
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
            'Served cold and soft, it is refreshing.',
            'Servită rece și moale, e răcoritoare.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Sugar and fat sit heavy during exercise.',
            'Zahărul și grăsimea cad greu în timpul efortului.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A very sweet, rich cake just before bed is a poor idea.',
            'O prăjitură foarte dulce și bogată chiar înainte de culcare nu e o idee bună.',
          ),
        },
      ],
    },
  ],
};
