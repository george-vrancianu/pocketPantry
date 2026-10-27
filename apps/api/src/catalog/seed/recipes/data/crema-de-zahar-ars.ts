import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Cremă de zahăr ars base is a milk-and-egg custard baked in individual
// forms over a layer of caramel. Each Variant is a full Recipe with its own
// lines, steps and guidance; the base's Recipe-level Tips are inherited.
export const cremaDeZaharArs: BaseRecipeSeed = {
  slug: 'crema-de-zahar-ars',
  title: t(
    'Romanian caramel custard (cremă de zahăr ars)',
    'Cremă de zahăr ars',
  ),
  servings: 6,
  prepMinutes: 290,
  cookMinutes: 60,
  difficulty: 'medium',
  lines: [
    { ingredient: 'milk', quantity: 0.6, unit: 'l' },
    { ingredient: 'eggs', quantity: 4, unit: 'pcs' },
    {
      ingredient: 'sugar',
      key: 'sugar-custard',
      quantity: 80,
      unit: 'g',
      note: t('for the custard', 'pentru cremă'),
    },
    {
      ingredient: 'sugar',
      key: 'sugar-caramel',
      quantity: 100,
      unit: 'g',
      note: t('for the caramel', 'pentru caramel'),
    },
    {
      ingredient: 'still-water',
      quantity: 0.03,
      unit: 'l',
      note: t('for the caramel', 'pentru caramel'),
    },
    { ingredient: 'vanilla-sugar', quantity: 10, unit: 'g' },
    {
      ingredient: 'lemon',
      quantity: 0.5,
      unit: 'pcs',
      note: t('zest only, in wide strips', 'doar coaja, în fâșii late'),
    },
  ],
  steps: [
    {
      key: 'preheat',
      text: t(
        'Set a deep roasting tray (about 25 by 35 cm) on the middle shelf of the oven, big enough for six 180 ml ramekins with a little space between them. Heat the oven to 150 °C. It takes about 15 minutes, so carry on with the next steps meanwhile.',
        'Pune pe raftul din mijloc al cuptorului o tavă adâncă (de circa 25 pe 35 cm), în care încap șase forme individuale de 180 ml, cu puțin loc între ele. Încălzește cuptorul la 150 °C. Durează cam 15 minute, așa că treci între timp la pașii următori.',
      ),
    },
    {
      key: 'warm-milk',
      text: t(
        'Put the milk, lemon zest and vanilla sugar in a pan and heat until it steams and tiny bubbles show at the edge. Do not let it boil. Take it off the heat, cover it and leave it to infuse for 10 minutes while you make the caramel.',
        'Pune laptele, coaja de lămâie și zahărul vanilat într-o cratiță și încălzește până scoate aburi și se văd bule mici pe margine. Nu-l lăsa să dea în clocot. Ia cratița de pe foc, acoper-o și lasă laptele la infuzat 10 minute, cât faci caramelul.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'caramel',
      text: t(
        'Keep children away from the hob. Put the caramel sugar and water in a small heavy-based pan (about 16 cm) over medium heat. Do not stir; let the sugar dissolve, then turn the heat up a little and swirl the pan now and then for about 7 minutes, until the syrup turns deep amber. Hot caramel is far hotter than boiling water and causes bad burns: never touch it or taste it. If caramel touches your skin, hold the area under cold running water for 20 minutes.',
        'Ține copiii departe de aragaz. Pune zahărul pentru caramel și apa într-o cratiță mică cu fundul gros (de circa 16 cm), la foc mediu. Nu amesteca; lasă zahărul să se dizolve, apoi mărește puțin focul și învârte cratița din când în când, circa 7 minute, până când siropul devine chihlimbariu închis. Caramelul fierbinte e mult mai fierbinte decât apa clocotită și provoacă arsuri grave: nu-l atinge și nu-l gusta. Dacă ți-a picat caramel pe piele, ține zona sub apă rece curgătoare 20 de minute.',
      ),
      timerSeconds: 420,
    },
    {
      key: 'pour-caramel',
      text: t(
        'Take the pan off the heat at once, because the caramel keeps darkening. Standing the ramekins on a heatproof board, pour about a tablespoon into each one and tilt it, holding it with an oven glove, so the caramel coats the base. Leave to harden. Never add water to the hot pan: it spits violently. Fill the pan with water only after it has cooled completely, and leave it to soak.',
        'Ia imediat cratița de pe foc, pentru că caramelul continuă să se închidă la culoare. Cu formele așezate pe un suport rezistent la căldură, toarnă în fiecare circa o lingură de caramel și înclină forma, ținând-o cu mănușa de bucătărie, ca să se acopere fundul. Lasă caramelul să se întărească. Nu turna niciodată apă în cratița fierbinte: stropește violent. Umple cratița cu apă abia după ce s-a răcit complet și las-o la înmuiat.',
      ),
    },
    {
      key: 'whisk',
      text: t(
        'Whisk the eggs with the custard sugar in a large bowl for about a minute, gently, only until smooth and without making foam.',
        'Bate ouăle cu zahărul pentru cremă într-un bol mare, circa un minut, ușor, doar până se omogenizează, fără să faci spumă.',
      ),
    },
    {
      key: 'combine',
      text: t(
        'Lift the zest out of the milk. The milk should be hot but not scalding. Pour it into the eggs in a thin stream, whisking all the time, then pour the mixture through a fine sieve into a jug. Skim off any foam with a spoon.',
        'Scoate coaja din lapte. Laptele trebuie să fie fierbinte, dar nu să opărească. Toarnă-l peste ouă în fir subțire, amestecând continuu, apoi strecoară compoziția printr-o sită fină într-un vas cu cioc. Ia spuma cu o lingură.',
      ),
    },
    {
      key: 'fill',
      text: t(
        'Pull the oven shelf out part of the way, wearing oven gloves. Set the ramekins in the tray and pour the custard into them, to about 1 cm below the rim. Boil a kettle of water.',
        'Trage raftul cuptorului pe jumătate, cu mănuși de bucătărie. Așază formele în tavă și toarnă crema în ele, până la circa 1 cm sub margine. Fierbe apă în fierbător.',
      ),
    },
    {
      key: 'water-bath',
      text: t(
        'Pour the hot water from a heatproof jug into the tray, around the ramekins, until it comes halfway up their sides. Keep it away from the custard. Do not carry the full tray: it stays on the shelf. Slide the shelf in slowly so the water does not slop.',
        'Toarnă apa fierbinte dintr-o cană cu cioc în tavă, în jurul formelor, până ajunge la jumătatea înălțimii lor. Ferește crema de stropi. Nu muta tava plină: rămâne pe raft. Împinge raftul încet în cuptor, ca apa să nu se verse.',
      ),
    },
    {
      key: 'bake',
      text: t(
        'Bake for 35 to 40 minutes, checking from 35. The custard is ready when the edges are set and only the very centre still wobbles slightly when you nudge the tray. A thermometer in the centre should read at least 71 °C (usually 75 to 80 °C when set). If it is not ready, bake on and check every 5 minutes.',
        'Coace 35-40 de minute, verificând de la minutul 35. Crema e gata când marginile s-au legat, iar doar centrul tremură încă ușor, ca o gelatină, când miști tava. Un termometru băgat în centru trebuie să arate cel puțin 71 °C (de obicei 75-80 °C când s-a legat). Dacă nu e gata, mai coace și verifică din 5 în 5 minute.',
      ),
      timerSeconds: 2100,
    },
    {
      key: 'cool',
      text: t(
        'Turn the oven off and leave the tray in it for about 30 minutes, until the water is no longer scalding. Then lift the ramekins out one at a time with tongs, a jar lifter or dry silicone gloves (cloth gloves soak up hot water and can scald) and set them on a rack. Leave them until barely warm, then cover them. Get them into the fridge within 2 hours of leaving the oven.',
        'Oprește cuptorul și lasă tava înăuntru circa 30 de minute, până când apa nu mai frige. Apoi scoate formele pe rând, cu clești, cu un ridicător pentru borcane sau cu mănuși de silicon uscate (mănușile de pânză absorb apa fierbinte și pot opări), și pune-le pe un grătar. Lasă-le până sunt doar călduțe, apoi acoperă-le. Pune-le la frigider în cel mult 2 ore de la scoaterea din cuptor.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'chill',
      text: t(
        'Chill in the fridge for at least 4 hours, or overnight, until the custard is firm all the way through.',
        'Ține la frigider cel puțin 4 ore, sau peste noapte, până când crema e fermă în toată masa.',
      ),
    },
    {
      key: 'unmould',
      text: t(
        'Run a thin knife round the inside edge of each ramekin. If one sticks, first stand it in a bowl of hot tap water for 10 seconds. Set a rimmed plate on top, turn both over in one firm move and give a gentle shake. Lift the ramekin away so the caramel sauce runs over the custard.',
        'Treci un cuțit subțire pe marginea interioară a fiecărei forme. Dacă una se lipește, ține-o mai întâi 10 secunde într-un bol cu apă fierbinte de la robinet. Pune deasupra o farfurie cu margine, răstoarnă totul dintr-o mișcare fermă și scutură ușor. Ridică forma, ca sosul de caramel să curgă peste cremă.',
      ),
    },
  ],
  tips: [
    t(
      'A low oven and the water bath are what keep this custard smooth: strong heat makes the eggs curdle and leaves holes and watery pockets.',
      'Cuptorul slab și baia de apă fac crema fină: la căldură mare ouăle se taie, iar crema rămâne cu găuri și cu apă.',
    ),
    t(
      'Cover the custards, keep them in the fridge and eat them within 2 days.',
      'Acoperă cremele, ține-le la frigider și mănâncă-le în cel mult 2 zile.',
    ),
    t(
      'This dish contains eggs and milk. If you cook for someone with an allergy, check the labels of bought ingredients.',
      'Această rețetă conține ouă și lapte. Dacă gătești pentru cineva cu alergii, verifică etichetele produselor cumpărate.',
    ),
  ],
  stepTips: [
    {
      step: 'caramel',
      text: t(
        'Do not stir the syrup with a spoon: it makes the sugar crystallise. If the sides of the pan darken first, swirl the pan to even it out.',
        'Nu amesteca siropul cu lingura: zahărul se cristalizează. Dacă marginile cratiței se închid primele la culoare, învârte cratița ca să se uniformizeze.',
      ),
    },
  ],
  nutritionNote: t(
    'Eggs and milk give protein, but most of the energy comes from the sugar in the caramel and the custard, and the milk and yolks add some saturated fat, so keep portions small.',
    'Ouăle și laptele aduc proteine, dar cea mai mare parte a energiei vine din zahărul din caramel și din cremă, iar laptele și gălbenușurile aduc și ceva grăsimi saturate, așa că ține porțiile mici.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Fresh strawberries', 'Căpșuni proaspete'),
      reason: t(
        'Their sharpness cuts through the sweet caramel and the rich custard.',
        'Aciditatea lor taie dulceața caramelului și bogăția cremei.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'strawberry',
    },
    {
      kind: 'drink',
      label: t('Coffee', 'Cafea'),
      reason: t(
        'The bitterness balances the sweet burnt sugar.',
        'Amăreala ei echilibrează zahărul ars, dulce.',
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
        'Served well chilled, it is a cool dessert.',
        'Servită bine rece, e un desert răcoritor.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'The sugar and the richness are heavy just before bed.',
        'Zahărul și bogăția cad greu chiar înainte de culcare.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'A rich, sweet custard sits heavy during exercise.',
        'O cremă bogată și dulce cade greu în timpul efortului.',
      ),
    },
  ],
  variants: [
    {
      slug: 'crema-de-zahar-ars-french',
      cuisine: 'french',
      title: t(
        'Crème brûlée',
        'Crème brûlée (cremă de vanilie cu crustă de zahăr caramelizat)',
      ),
      servings: 6,
      prepMinutes: 230,
      cookMinutes: 70,
      difficulty: 'medium',
      lines: [
        { ingredient: 'whipping-cream', quantity: 700, unit: 'ml' },
        { ingredient: 'vanilla-pods', quantity: 1, unit: 'pcs' },
        {
          ingredient: 'eggs',
          quantity: 7,
          unit: 'pcs',
          note: t(
            'yolks only; keep the whites',
            'doar gălbenușurile; păstrează albușurile',
          ),
        },
        {
          ingredient: 'sugar',
          key: 'sugar-custard',
          quantity: 90,
          unit: 'g',
          note: t('for the custard', 'pentru cremă'),
        },
        {
          ingredient: 'sugar',
          key: 'sugar-crust',
          quantity: 36,
          unit: 'g',
          note: t(
            'for the crust, 6 g (about 1½ level teaspoons) per dish',
            'pentru crustă, 6 g (circa 1½ lingurițe rase) pe formă',
          ),
        },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Set a deep roasting tray (about 30 by 40 cm) on the middle shelf of the oven, big enough for six shallow 150 ml dishes (about 12 cm across) with a little space between them. Heat the oven to 150 °C. It takes about 15 minutes, so carry on with the next steps meanwhile.',
            'Pune pe raftul din mijloc al cuptorului o tavă adâncă (de circa 30 pe 40 cm), în care încap șase forme joase de 150 ml (de circa 12 cm diametru), cu puțin loc între ele. Încălzește cuptorul la 150 °C. Durează cam 15 minute, așa că treci între timp la pașii următori.',
          ),
        },
        {
          key: 'infuse',
          text: t(
            'Split the vanilla pod lengthways and scrape out the seeds with the tip of a knife. Put the cream, seeds and pod in a pan and heat until it steams, without boiling. Take it off the heat, cover it and leave to infuse for 15 minutes.',
            'Taie păstaia de vanilie pe lungime și răzuiește semințele cu vârful cuțitului. Pune frișca lichidă, semințele și păstaia într-o cratiță și încălzește până scoate aburi, fără să dea în clocot. Ia cratița de pe foc, acoper-o și lasă la infuzat 15 minute.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'separate',
          text: t(
            'Separate the eggs, putting the yolks in a large bowl and the whites in a covered container in the fridge (use them within 2 to 4 days). Wash your hands after touching the raw eggs.',
            'Separă ouăle: gălbenușurile într-un bol mare, albușurile într-un recipient acoperit, la frigider (folosește-le în 2-4 zile). Spală-te pe mâini după ce ai atins ouăle crude.',
          ),
        },
        {
          key: 'whisk',
          text: t(
            'Whisk the yolks with the custard sugar for about a minute, gently, until smooth and pale, without making foam.',
            'Bate gălbenușurile cu zahărul pentru cremă circa un minut, ușor, până devin netede și deschise la culoare, fără să faci spumă.',
          ),
        },
        {
          key: 'combine',
          text: t(
            'Remove the pod. Pour the warm cream into the yolks in a thin stream, whisking all the time, then pour the mixture through a fine sieve into a jug. Skim off any foam.',
            'Scoate păstaia. Toarnă frișca caldă peste gălbenușuri în fir subțire, amestecând continuu, apoi strecoară compoziția printr-o sită fină într-un vas cu cioc. Ia spuma.',
          ),
        },
        {
          key: 'fill',
          text: t(
            'Pull the oven shelf out part of the way, wearing oven gloves. Set the dishes in the tray and pour in the custard almost to the rim (about 150 ml each). Boil a kettle of water.',
            'Trage raftul cuptorului pe jumătate, cu mănuși de bucătărie. Așază formele în tavă și toarnă crema în ele aproape până la margine (circa 150 ml în fiecare). Fierbe apă în fierbător.',
          ),
        },
        {
          key: 'water-bath',
          text: t(
            'Pour the hot water from a heatproof jug into the tray, around the dishes, until it comes halfway up their sides. Keep it away from the custard. Do not carry the full tray: it stays on the shelf. Slide the shelf in slowly.',
            'Toarnă apa fierbinte dintr-o cană cu cioc în tavă, în jurul formelor, până ajunge la jumătatea înălțimii lor. Ferește crema de stropi. Nu muta tava plină: rămâne pe raft. Împinge raftul încet în cuptor.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 25 to 35 minutes, checking from 25. The custard is ready when the edges are set and only the very centre still wobbles slightly when you nudge the tray. A thermometer in the centre should read at least 71 °C (usually 75 to 80 °C when set). If it is not ready, bake on and check every 5 minutes.',
            'Coace 25-35 de minute, verificând de la minutul 25. Crema e gata când marginile s-au legat, iar doar centrul tremură încă ușor, ca o gelatină, când miști tava. Un termometru băgat în centru trebuie să arate cel puțin 71 °C (de obicei 75-80 °C când s-a legat). Dacă nu e gata, mai coace și verifică din 5 în 5 minute.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'cool',
          text: t(
            'Turn the oven off and open the door. At once, lift each dish out of the water onto a rack with tongs, a jar lifter or dry silicone gloves (cloth gloves soak up hot water and can scald), so the custard does not keep cooking. Leave the water tray in the oven to cool. Leave the dishes for about 30 minutes, until barely warm, then cover them. Get them into the fridge within 2 hours of leaving the oven.',
            'Oprește cuptorul și deschide ușa. Scoate imediat fiecare formă din apă pe un grătar, cu clești, cu un ridicător pentru borcane sau cu mănuși de silicon uscate (mănușile de pânză absorb apa fierbinte și pot opări), ca să nu continue să se gătească crema. Lasă tava cu apă să se răcească în cuptor. Lasă formele circa 30 de minute, până sunt doar călduțe, apoi acoperă-le. Pune-le la frigider în cel mult 2 ore de la scoaterea din cuptor.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'chill',
          text: t(
            'Chill in the fridge for at least 3 hours, or overnight, until the custard is firm all the way through.',
            'Ține la frigider cel puțin 3 ore, sau peste noapte, până când crema e fermă în toată masa.',
          ),
        },
        {
          key: 'sugar-top',
          text: t(
            'Just before serving, blot any moisture from the surface with kitchen paper, then throw the paper away and keep paper and cloths well away from the flame. Sprinkle 6 g (about 1½ level teaspoons) of sugar over each custard and tilt the dish to spread it in an even layer.',
            'Chiar înainte de servire, tamponează cu un prosop de hârtie umezeala de pe suprafață, apoi aruncă hârtia și ține hârtia și cârpele departe de flacără. Presară 6 g (circa 1½ lingurițe rase) de zahăr peste fiecare cremă și înclină forma, ca zahărul să se întindă într-un strat uniform.',
          ),
        },
        {
          key: 'torch',
          text: t(
            'Stand the dishes on a heatproof board. Light a kitchen blowtorch with the nozzle pointing away from you. Keep the torch upright (never turn it upside down) and angle the flame onto the sugar from 5 to 10 cm, moving it in circles until the sugar melts and turns amber, 30 to 60 seconds per dish. Switch it off and stand it upright on its base, nozzle pointing away from you and from anything that can burn, until it is cool. Keep children away. The dish and the sugar are very hot, so do not touch them. Leave for 2 minutes until the crust hardens.',
            'Așază formele pe un suport rezistent la căldură. Aprinde un arzător de bucătărie (pistol de caramelizat) cu duza îndreptată departe de tine. Ține arzătorul în poziție verticală (niciodată cu capul în jos) și îndreaptă flacăra spre zahăr de la 5-10 cm, mișcând-o în cercuri până când zahărul se topește și devine chihlimbariu, 30-60 de secunde pe formă. Stinge-l și așază-l în picioare, pe baza lui, cu duza departe de tine și de orice poate lua foc, până se răcește. Ține copiii departe. Forma și zahărul sunt foarte fierbinți, așa că nu le atinge. Lasă 2 minute, până când crusta se întărește.',
          ),
          timerSeconds: 120,
        },
      ],
      tips: [
        t(
          'Without a torch, use the grill: heat it to its highest setting for 10 minutes, set the dishes on a tray of ice cubes on the shelf nearest the heat, and watch them the whole time. The sugar burns within a minute.',
          'Fără arzător, folosește grillul: încălzește-l la maximum 10 minute, pune formele pe o tavă cu cuburi de gheață pe raftul cel mai apropiat de sursa de căldură și nu le pierde din ochi. Zahărul se arde în mai puțin de un minut.',
        ),
        t(
          'Keep the whites covered in the fridge and use them within 2 to 4 days, for example in meringue.',
          'Păstrează albușurile acoperite la frigider și folosește-le în 2-4 zile, de exemplu pentru bezele.',
        ),
      ],
      stepTips: [
        {
          step: 'torch',
          text: t(
            'Caramelise just before serving: the crust turns soft within a few hours in the fridge.',
            'Caramelizează chiar înainte de servire: în câteva ore la frigider crusta se înmoaie.',
          ),
        },
      ],
      nutritionNote: t(
        'Cream and egg yolks make it very rich: it is high in saturated fat as well as sugar, and gives protein only in small amounts. The portion is small, so keep it to one.',
        'Frișca lichidă și gălbenușurile îl fac foarte bogat: are multe grăsimi saturate și zahăr, iar proteinele sunt puține. Porția e mică, deci rămâi la una.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Fresh raspberries', 'Zmeură proaspătă'),
          reason: t(
            'Their tartness cuts the cream and the burnt sugar.',
            'Acrișoara lor taie frișca și zahărul ars.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'raspberry',
        },
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'The bitterness balances the rich cream and the sweet crust.',
            'Amăreala ei echilibrează frișca bogată și crusta dulce.',
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
            'The chilled custard under the crisp top is cooling.',
            'Crema rece de sub crusta crocantă e răcoritoare.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Cream and sugar are heavy just before bed.',
            'Frișca și zahărul cad greu chiar înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'crema-de-zahar-ars-brazilian',
      cuisine: 'brazilian',
      title: t(
        'Pudim de leite condensado (Brazilian condensed-milk caramel pudding)',
        'Pudim de leite condensado (budincă braziliană cu lapte condensat și caramel)',
      ),
      servings: 8,
      prepMinutes: 400,
      cookMinutes: 90,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'condensed-milk',
          quantity: 395,
          unit: 'g',
          note: t('one standard can', 'o cutie standard'),
        },
        { ingredient: 'milk', quantity: 0.4, unit: 'l' },
        { ingredient: 'eggs', quantity: 4, unit: 'pcs' },
        {
          ingredient: 'vanilla-extract',
          quantity: 5,
          unit: 'ml',
          optional: true,
        },
        {
          ingredient: 'sugar',
          quantity: 150,
          unit: 'g',
          note: t('for the caramel', 'pentru caramel'),
        },
        {
          ingredient: 'still-water',
          quantity: 0.06,
          unit: 'l',
          note: t('for the caramel', 'pentru caramel'),
        },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Set a deep roasting tray (about 30 by 40 cm) on the middle shelf of the oven, big enough for a 1.5 litre ring tin of 20 to 22 cm. Heat the oven to 180 °C. It takes about 15 minutes, so carry on with the next steps meanwhile.',
            'Pune pe raftul din mijloc al cuptorului o tavă adâncă (de circa 30 pe 40 cm), în care încape o formă de savarină (cu gaură în mijloc) de 1,5 litri și 20-22 cm. Încălzește cuptorul la 180 °C. Durează cam 15 minute, așa că treci între timp la pașii următori.',
          ),
        },
        {
          key: 'caramel',
          text: t(
            'Keep children away from the hob. Put the caramel sugar and water in a small heavy-based pan over medium heat. Do not stir; let the sugar dissolve, then turn the heat up a little and swirl the pan now and then for about 8 minutes, until the syrup turns deep amber. Hot caramel is far hotter than boiling water and causes bad burns: never touch it or taste it. If caramel touches your skin, hold the area under cold running water for 20 minutes.',
            'Ține copiii departe de aragaz. Pune zahărul pentru caramel și apa într-o cratiță mică cu fundul gros, la foc mediu. Nu amesteca; lasă zahărul să se dizolve, apoi mărește puțin focul și învârte cratița din când în când, circa 8 minute, până când siropul devine chihlimbariu închis. Caramelul fierbinte e mult mai fierbinte decât apa clocotită și provoacă arsuri grave: nu-l atinge și nu-l gusta. Dacă ți-a picat caramel pe piele, ține zona sub apă rece curgătoare 20 de minute.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'coat-tin',
          text: t(
            'Take the pan off the heat at once. Stand a 1.5 litre metal ring tin (20 to 22 cm) on a heatproof board and pour in the caramel. Holding the tin with oven gloves, because it heats up fast, tilt it so the caramel covers the base and a little of the sides. Leave to harden. Never add water to the hot pan: it spits violently. Fill the pan with water only after it has cooled completely, and leave it to soak.',
            'Ia imediat cratița de pe foc. Așază pe un suport rezistent la căldură o formă metalică de savarină de 1,5 litri (20-22 cm) și toarnă caramelul în ea. Ține tava cu mănuși de bucătărie, pentru că se încinge repede, și înclină-o ca să se acopere fundul și puțin din pereți. Lasă caramelul să se întărească. Nu turna niciodată apă în cratița fierbinte: stropește violent. Umple cratița cu apă abia după ce s-a răcit complet și las-o la înmuiat.',
          ),
        },
        {
          key: 'blend',
          text: t(
            'Put the condensed milk, milk, eggs and vanilla, if using, in a blender and blend on low speed for about 30 seconds, until smooth. Do not blend longer, because it fills the mixture with bubbles.',
            'Pune laptele condensat, laptele, ouăle și vanilia, dacă folosești, în blender și mixează la viteză mică circa 30 de secunde, până se omogenizează. Nu mixa mai mult, pentru că se umple compoziția de bule.',
          ),
        },
        {
          key: 'strain',
          text: t(
            'Pour the mixture through a fine sieve into the ring tin, to about two-thirds full. Let it stand for 5 minutes, then skim off the foam. Cover the tin tightly with foil.',
            'Toarnă compoziția printr-o sită fină în formă, până se umple cam două treimi. Las-o 5 minute, apoi ia spuma. Acoperă forma strâns cu folie de aluminiu.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'water-bath',
          text: t(
            'Pull the oven shelf out part of the way, wearing oven gloves, and set the tin in the tray. Boil a kettle of water and pour it from a heatproof jug into the tray, around the tin, until it comes halfway up its sides. Do not carry the full tray: it stays on the shelf. Slide the shelf in slowly so the water does not slop.',
            'Trage raftul cuptorului pe jumătate, cu mănuși de bucătărie, și așază forma în tavă. Fierbe apă în fierbător și toarnă-o dintr-o cană cu cioc în tavă, în jurul formei, până ajunge la jumătatea înălțimii ei. Nu muta tava plină: rămâne pe raft. Împinge raftul încet în cuptor, ca apa să nu se verse.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for about 50 minutes, then check; it can take up to 80. To check, lift a corner of the foil away from you, because steam comes out. The pudding is ready when the edge is set and only the very centre still wobbles slightly when you nudge the tin; a knife pushed in near the centre comes out clean. A thermometer in the centre should read at least 71 °C (usually 75 to 80 °C when set). Cover it again if you bake on. If it is not ready, bake on and check every 10 minutes.',
            'Coace circa 50 de minute, apoi verifică; poate dura până la 80. Ca să verifici, ridică un colț al foliei în partea opusă ție, pentru că iese abur. Budinca e gata când marginea s-a legat, iar doar centrul tremură încă ușor când miști forma; un cuțit băgat lângă centru iese curat. Un termometru băgat în centru trebuie să arate cel puțin 71 °C (de obicei 75-80 °C când s-a legat). Dacă mai coci, acoper-o la loc. Dacă nu e gata, mai coace și verifică din 10 în 10 minute.',
          ),
          timerSeconds: 3000,
        },
        {
          key: 'cool',
          text: t(
            'Turn the oven off and leave the tray in it for about 30 minutes, until the water is no longer scalding (if it still steams, wait longer). Then lift the tin out with dry silicone gloves and set it on a rack. When barely warm, cover it. Get it into the fridge within 2 hours of leaving the oven.',
            'Oprește cuptorul și lasă tava înăuntru circa 30 de minute, până când apa nu mai frige (dacă încă scoate aburi, mai așteaptă). Apoi scoate forma cu mănuși de silicon uscate și pune-o pe un grătar. Când e doar călduță, acoper-o. Pune-o la frigider în cel mult 2 ore de la scoaterea din cuptor.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'chill',
          text: t(
            'Chill in the fridge for at least 6 hours, or overnight, until the pudding is firm all the way through.',
            'Ține la frigider cel puțin 6 ore, sau peste noapte, până când budinca e fermă în toată masa.',
          ),
        },
        {
          key: 'unmould',
          text: t(
            'Run a thin knife round both the inner and the outer edge of the tin. If it sticks, first stand the tin in a bowl of hot tap water for 10 seconds. Set a rimmed serving plate on top, turn both over in one firm move and give a gentle shake. Lift the tin away so the caramel sauce runs over the pudding.',
            'Treci un cuțit subțire pe marginea interioară și pe cea exterioară a formei. Dacă se lipește, ține mai întâi forma 10 secunde într-un bol cu apă fierbinte de la robinet. Pune deasupra o farfurie de servire cu margine, răstoarnă totul dintr-o mișcare fermă și scutură ușor. Ridică forma, ca sosul de caramel să curgă peste budincă.',
          ),
        },
      ],
      hideBaseTips: [0],
      tips: [
        t(
          'Blend only briefly, then strain and skim: bubbles are what leave small holes in the cut pudding.',
          'Mixează scurt, apoi strecoară și ia spuma: bulele lasă mici găuri în budinca tăiată.',
        ),
      ],
      stepTips: [
        {
          step: 'bake',
          text: t(
            'The foil keeps splashes from the water bath off the pudding.',
            'Folia ferește budinca de stropii din baia de apă.',
          ),
        },
      ],
      nutritionNote: t(
        'Condensed milk makes it denser and sweeter than the base, so it is high in sugar and also brings saturated fat. The eggs and milk give some protein. A thin slice is plenty.',
        'Laptele condensat îl face mai dens și mai dulce decât baza, deci are mult zahăr și aduce și grăsimi saturate. Ouăle și laptele dau ceva proteine. O felie subțire e destulă.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Fresh strawberries', 'Căpșuni proaspete'),
          reason: t(
            'Their sharpness cuts the rich, sweet pudding.',
            'Aciditatea lor taie budinca bogată și dulce.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'strawberry',
        },
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'The bitterness balances the very sweet pudding.',
            'Amăreala ei echilibrează budinca foarte dulce.',
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
            'Served well chilled, it is a cool dessert.',
            'Servită bine rece, e un desert răcoritor.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'A dense, very sweet pudding sits heavy during exercise.',
            'O budincă densă și foarte dulce cade greu în timpul efortului.',
          ),
        },
      ],
    },
  ],
};
