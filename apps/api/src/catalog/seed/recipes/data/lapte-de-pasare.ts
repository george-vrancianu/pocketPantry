import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Lapte de pasăre base is poached meringue islands floating on a cooled
// vanilla custard. Each Variant is a full Recipe with its own lines, steps and
// guidance; the base's Recipe-level Tips are inherited (the Variants hide the
// one that is about poached islands).
export const lapteDePasare: BaseRecipeSeed = {
  slug: 'lapte-de-pasare',
  title: t(
    'Romanian floating meringue islands on vanilla custard (lapte de pasăre)',
    'Lapte de pasăre cu spumă poșată și cremă de vanilie',
  ),
  servings: 6,
  prepMinutes: 160,
  cookMinutes: 76,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'milk',
      quantity: 1.5,
      unit: 'l',
      note: t(
        '1.2 l for poaching, the rest to top up the custard milk',
        '1,2 l pentru poșat, restul pentru completat laptele cremei',
      ),
    },
    {
      ingredient: 'eggs',
      quantity: 6,
      unit: 'pcs',
      note: t(
        'whites for the islands, yolks for the custard',
        'albușurile pentru spumă, gălbenușurile pentru cremă',
      ),
    },
    {
      ingredient: 'sugar',
      key: 'sugar-meringue',
      quantity: 90,
      unit: 'g',
      note: t('for the whites', 'pentru albușuri'),
    },
    {
      ingredient: 'sugar',
      key: 'sugar-custard',
      quantity: 60,
      unit: 'g',
      note: t('for the yolks', 'pentru gălbenușuri'),
    },
    { ingredient: 'vanilla-sugar', quantity: 16, unit: 'g' },
    { ingredient: 'corn-starch', quantity: 10, unit: 'g' },
    {
      ingredient: 'lemon',
      quantity: 0.5,
      unit: 'pcs',
      optional: true,
      note: t(
        'zest only, in wide strips, no white pith',
        'doar coaja, în fâșii late, fără partea albă',
      ),
    },
    {
      ingredient: 'salt',
      quantity: 0.5,
      unit: 'g',
      optional: true,
      note: t('a pinch, for the whites', 'un vârf de cuțit, pentru albușuri'),
    },
  ],
  steps: [
    {
      key: 'separate',
      text: t(
        'Set out a large, very clean, dry bowl for the whites and a medium bowl for the yolks. Crack one egg at a time over a small cup, tip the white into the large bowl and the yolk into the medium one, so that one broken yolk cannot spoil all the whites. Cover the yolks and keep them in the fridge. Wash your hands with soap after handling the raw eggs. If using the lemon, take the zest in wide strips with a vegetable peeler.',
        'Pregătește un bol mare, foarte curat și uscat, pentru albușuri și unul mijlociu pentru gălbenușuri. Sparge câte un ou deasupra unei ceșcuțe, varsă albușul în bolul mare și gălbenușul în cel mijlociu, ca un gălbenuș spart să nu strice toate albușurile. Acoperă gălbenușurile și ține-le la frigider. Spală-te pe mâini cu săpun după ce ai atins ouăle crude. Dacă folosești lămâia, ia coaja în fâșii late cu un curățător de legume.',
      ),
    },
    {
      key: 'heat-milk',
      text: t(
        'Pour 1.2 l of the milk into a wide pan (about 26 cm across) and add the vanilla sugar and, if using, the lemon zest. Heat over medium heat for about 8 minutes, until the milk steams and tiny bubbles show at the edge. Do not let it boil. Take it off the heat and cover it while you beat the whites.',
        'Toarnă 1,2 l din lapte într-o cratiță largă (de circa 26 cm) și adaugă zahărul vanilat și, dacă folosești, coaja de lămâie. Încălzește la foc mediu circa 8 minute, până când laptele scoate aburi și se văd bule mici pe margine. Nu-l lăsa să dea în clocot. Ia-l de pe foc și acoperă-l cât bați albușurile.',
      ),
    },
    {
      key: 'beat',
      text: t(
        'Add the salt to the whites. Beat with an electric whisk on medium speed for about 2 minutes, until soft and foamy. Add the meringue sugar one spoonful at a time, beating on high speed for about 4 more minutes, until the meringue is stiff and glossy and keeps a firm peak when you lift the whisk.',
        'Adaugă sarea la albușuri. Bate-le cu mixerul la viteză medie circa 2 minute, până devin spumoase și moi. Adaugă zahărul pentru spumă câte o lingură, bătând la viteză mare încă vreo 4 minute, până când spuma e fermă și lucioasă și păstrează un vârf ferm când ridici mixerul.',
      ),
    },
    {
      key: 'poach-first',
      text: t(
        'Put the pan back over medium-low heat until the milk is barely trembling, with a few tiny bubbles at the edge, and keep it there. Do not let it boil. With two spoons, shape the first 4 islands, each about a heaped serving spoon (about 50 ml), and slide them into the milk with space between them. Poach for 2 to 3 minutes, turn them over with a clean slotted spoon and poach 2 to 3 minutes more. The islands swell to about double their size.',
        'Pune cratița la loc pe foc mic-mediu, până când laptele abia tremură, cu câteva bule mici la margine, și ține-l așa. Nu-l lăsa să dea în clocot. Cu două linguri, modelează primele 4 insule, fiecare cam cât o lingură mare cu vârf (circa 50 ml), și strecoară-le în lapte, cu loc între ele. Poșează-le 2-3 minute, întoarce-le cu o spumieră curată și poșează-le încă 2-3 minute. Insulele se umflă până la dublul mărimii.',
      ),
      timerSeconds: 240,
    },
    {
      key: 'check',
      text: t(
        'Lift one island onto a plate with the clean slotted spoon and cut it open. It must be firm and springy right through, with no wet, glassy white in the middle. A thermometer in the thickest part should read at least 71 °C. If it is not ready, put it back with the others and give them 1 more minute, then check again. Lift the rest of the first batch onto a tray lined with clean kitchen paper.',
        'Ridică o insulă pe o farfurie cu spumiera curată și taie-o în două. Trebuie să fie fermă și elastică în toată masa, fără albuș umed și sticlos în mijloc. Un termometru băgat în partea cea mai groasă trebuie să arate cel puțin 71 °C. Dacă nu e gata, pune-o la loc lângă celelalte și mai lasă-le 1 minut, apoi verifică din nou. Scoate restul primei serii pe o tavă căptușită cu hârtie de bucătărie curată.',
      ),
    },
    {
      key: 'poach-rest',
      text: t(
        'Shape and poach the rest of the meringue in 4 more batches of 4 to 5 islands, the same way, giving each batch at least as long as the first one needed (2 to 3 minutes a side), and drain on the tray. Cut one island from every batch open as before: firm right through, no glassy white. Keep the milk at a bare simmer between batches. You get about 20 islands in all. Then wash the whisk, the bowl and the shaping spoons in hot soapy water.',
        'Modelează și poșează restul spumei în încă 4 serii de câte 4-5 insule, la fel, dând fiecărei serii cel puțin cât a avut nevoie prima (2-3 minute pe fiecare parte), și scurge-le pe tavă. Taie în două câte o insulă din fiecare serie, ca mai înainte: fermă în toată masa, fără albuș sticlos. Ține laptele la fierbere abia simțită între serii. Ies în total circa 20 de insule. Apoi spală mixerul, bolul și lingurile de modelat în apă caldă cu detergent.',
      ),
    },
    {
      key: 'strain',
      text: t(
        'Take the pan off the heat and strain the milk through a fine sieve into a jug, to catch the zest and any bits of meringue. Measure it: you need 1 l. If it is short, top it up with the spare cold milk. Rinse the pan and pour the milk back in. Heat it over medium heat for about 3 minutes, until it steams again.',
        'Ia cratița de pe foc și strecoară laptele printr-o sită fină într-un vas cu cioc, ca să rămână coaja și resturile de spumă. Măsoară-l: îți trebuie 1 l. Dacă e mai puțin, completează cu laptele rece rămas. Clătește cratița și toarnă laptele la loc. Încălzește-l la foc mediu circa 3 minute, până scoate din nou aburi.',
      ),
    },
    {
      key: 'yolks',
      text: t(
        'In a bowl, whisk the yolks with the custard sugar and the corn starch for about 1 minute, until pale and smooth, with no lumps of starch.',
        'Într-un bol, amestecă gălbenușurile cu zahărul pentru cremă și cu amidonul de porumb circa 1 minut, până devin palide și netede, fără cocoloașe de amidon.',
      ),
    },
    {
      key: 'temper',
      text: t(
        'Pour a ladle of the hot milk (about 150 ml) into the yolks in a thin stream, whisking all the time. Whisk in a second ladle, then pour the whole mixture back into the pan with the rest of the milk.',
        'Toarnă un polonic de lapte fierbinte (circa 150 ml) peste gălbenușuri, în fir subțire, amestecând continuu. Amestecă și un al doilea polonic, apoi toarnă tot amestecul înapoi în cratiță, peste restul laptelui.',
      ),
    },
    {
      key: 'cook-custard',
      text: t(
        'Cook over low heat for about 6 minutes, stirring all the time with a wooden spoon and scraping the base and the edge. It is ready when it has thickened, coats the back of the spoon and a line drawn with your finger stays clear. A thermometer should read at least 71 °C. Then let it bubble gently for 1 more minute, still stirring: the starch stops the yolks scrambling, and the heat stops the yolks from thinning the custard as it stands. Do not let it boil hard.',
        'Gătește la foc mic circa 6 minute, amestecând mereu cu o lingură de lemn și răzuind fundul și marginile. E gata când s-a îngroșat, acoperă dosul lingurii și o dungă trasă cu degetul rămâne limpede. Un termometru trebuie să arate cel puțin 71 °C. Apoi lasă-o să bolborosească ușor încă 1 minut, amestecând în continuare: amidonul împiedică gălbenușurile să se taie, iar căldura face ca gălbenușurile să nu subțieze crema cât stă. Nu o lăsa să fiarbă tare.',
      ),
      timerSeconds: 420,
    },
    {
      key: 'cool',
      text: t(
        'Pour the custard through the sieve into a jug, then divide it between 6 wide bowls of about 350 ml. Press cling film onto the surface of each, so no skin forms. Cover the tray of islands loosely and put it in the fridge. Leave the custard on the counter for 30 minutes, then put it in the fridge as well, well within 2 hours of cooking.',
        'Toarnă crema prin sită într-un vas cu cioc, apoi împarte-o în 6 boluri late, de circa 350 ml. Lipește folie alimentară direct pe suprafața fiecăruia, ca să nu se formeze pieliță. Acoperă tava cu insule fără să o strângi și pune-o la frigider. Lasă crema pe blat 30 de minute, apoi pune-o și pe ea la frigider, în mult mai puțin de 2 ore de la gătit.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'chill',
      text: t(
        'Chill the custard for at least 2 hours, until cold and slightly thicker.',
        'Ține crema la frigider cel puțin 2 ore, până se răcește bine și se îngroașă puțin.',
      ),
    },
    {
      key: 'serve',
      text: t(
        'Just before serving, set 3 or 4 islands on top of each bowl of cold custard.',
        'Chiar înainte de servire, așază 3-4 insule deasupra fiecărui bol cu cremă rece.',
      ),
    },
  ],
  tips: [
    t(
      'This dish uses eggs that are cooked, not raw: the islands are poached to 71 °C and the custard is cooked until thick. For children, older people and anyone pregnant or unwell, make sure the islands reach 71 °C and the custard has thickened fully. If you cannot check, use pasteurised eggs.',
      'Acest desert folosește ouă gătite, nu crude: insulele sunt poșate până la 71 °C, iar crema e gătită până se îngroașă. Pentru copii, vârstnici și persoane însărcinate sau bolnave, asigură-te că insulele ajung la 71 °C și că crema s-a îngroșat complet. Dacă nu poți verifica, folosește ouă pasteurizate.',
    ),
    t(
      'Keep this dish covered in the fridge and eat it within 2 days. Do not leave it out for more than 2 hours.',
      'Păstrează acest desert acoperit la frigider și mănâncă-l în cel mult 2 zile. Nu-l lăsa afară mai mult de 2 ore.',
    ),
    t(
      'This dish contains eggs and milk. If you cook for someone with an allergy, check the labels of bought ingredients.',
      'Acest desert conține ouă și lapte. Dacă gătești pentru cineva cu alergii, verifică etichetele produselor cumpărate.',
    ),
    t(
      'Poach the islands on the day you serve and put them on the custard only at the last moment. They go flat and weep as they sit in the custard.',
      'Poșează insulele în ziua în care servești și pune-le pe cremă abia în ultima clipă. Se aplatizează și lasă lichid cât stau în cremă.',
    ),
    t(
      'Use a heavy-based pan and low heat for the custard, and keep stirring: egg yolks set at a lower temperature than you might think, and strong heat scrambles them at the bottom.',
      'Folosește o cratiță cu fundul gros și foc mic pentru cremă și amestecă mereu: gălbenușurile se închegă la o temperatură mai joasă decât crezi, iar focul tare le face omletă pe fund.',
    ),
  ],
  stepTips: [
    {
      step: 'beat',
      text: t(
        'The bowl and whisk must be spotless and dry: even a drop of yolk or grease stops the whites from foaming.',
        'Bolul și mixerul trebuie să fie curate și uscate: chiar și o picătură de gălbenuș sau de grăsime împiedică albușurile să se spumeze.',
      ),
    },
    {
      step: 'poach-first',
      text: t(
        'If the milk boils, the islands puff up, turn rubbery and fall apart; if it is too cool, they soak up milk and stay wet. Move the pan off the heat for a moment to settle it if it bubbles.',
        'Dacă laptele fierbe, insulele se umflă, devin cauciucoase și se desfac; dacă e prea rece, absorb lapte și rămân ude. Dacă face bule, mută o clipă cratița de pe foc ca să se liniștească.',
      ),
    },
    {
      step: 'cook-custard',
      text: t(
        'If you see small lumps start to form, take the pan off the heat at once and whisk hard, then pour the custard through the sieve.',
        'Dacă vezi că se formează cocoloașe mici, ia imediat cratița de pe foc și bate energic, apoi toarnă crema prin sită.',
      ),
    },
  ],
  nutritionNote: t(
    'Eggs and milk give protein, but much of the energy comes from the added sugar in the meringue and the custard, and the yolks and milk add some saturated fat. It has almost no fibre, so keep portions small and add fruit.',
    'Ouăle și laptele aduc proteine, dar o bună parte din energie vine din zahărul adăugat în spumă și în cremă, iar gălbenușurile și laptele aduc ceva grăsimi saturate. Aproape nu are fibre, așa că ține porțiile mici și adaugă fructe.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Fresh strawberries', 'Căpșuni proaspete'),
      reason: t(
        'Their sharpness cuts through the rich, sweet custard and the sugar in the meringue.',
        'Aciditatea lor taie bogăția și dulceața cremei și zahărul din spumă.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'strawberry',
    },
    {
      kind: 'food',
      label: t('Sour cherries', 'Vișine'),
      reason: t(
        'Their tartness cuts through a rich, very sweet, soft dessert.',
        'Aciditatea lor taie bogăția unui desert foarte dulce și moale.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'sour-cherry',
    },
    {
      kind: 'drink',
      label: t('Coffee', 'Cafea'),
      reason: t(
        'The bitterness balances the sweet, milky custard.',
        'Amăreala ei echilibrează crema dulce, cu lapte.',
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
        'Served well chilled, it is a cool, refreshing dessert.',
        'Servit bine rece, e un desert răcoritor.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'The sugar and the richness of the custard are heavy just before bed.',
        'Zahărul și bogăția cremei cad greu chiar înainte de culcare.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'A sweet, creamy dessert sits heavy during exercise.',
        'Un desert dulce și cremos cade greu în timpul efortului.',
      ),
    },
  ],
  variants: [
    {
      slug: 'lapte-de-pasare-french',
      cuisine: 'french',
      hideBaseTips: [0, 3],
      title: t(
        'Île flottante (French baked meringue on crème anglaise with caramel)',
        'Île flottante (insulă de bezea pe cremă englezească, cu caramel)',
      ),
      servings: 6,
      prepMinutes: 135,
      cookMinutes: 70,
      difficulty: 'medium',
      lines: [
        { ingredient: 'milk', quantity: 0.5, unit: 'l' },
        {
          ingredient: 'whipping-cream',
          quantity: 100,
          unit: 'ml',
          optional: true,
          note: t(
            'for a richer sauce; without it the sauce is a little thinner',
            'pentru un sos mai bogat; fără ea sosul e puțin mai subțire',
          ),
        },
        {
          ingredient: 'eggs',
          quantity: 6,
          unit: 'pcs',
          note: t(
            'whites for the meringue, yolks for the sauce',
            'albușurile pentru bezea, gălbenușurile pentru sos',
          ),
        },
        {
          ingredient: 'sugar',
          key: 'sugar-meringue',
          quantity: 90,
          unit: 'g',
          note: t('for the whites', 'pentru albușuri'),
        },
        {
          ingredient: 'sugar',
          key: 'sugar-anglaise',
          quantity: 60,
          unit: 'g',
          note: t('for the yolks', 'pentru gălbenușuri'),
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
        { ingredient: 'vanilla-pods', quantity: 1, unit: 'pcs' },
        {
          ingredient: 'butter',
          quantity: 10,
          unit: 'g',
          note: t('for the ramekins', 'pentru forme'),
        },
        {
          ingredient: 'salt',
          quantity: 0.5,
          unit: 'g',
          optional: true,
          note: t(
            'a pinch, for the whites',
            'un vârf de cuțit, pentru albușuri',
          ),
        },
        {
          ingredient: 'flaked-almonds',
          quantity: 20,
          unit: 'g',
          optional: true,
        },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Set a deep roasting tray (about 25 by 35 cm) on the middle shelf of the oven, big enough for six 200 ml ramekins with a little space between them. Heat the oven to 150 °C. It takes about 15 minutes, so carry on with the next steps meanwhile. Brush the inside of the ramekins with the butter.',
            'Pune pe raftul din mijloc al cuptorului o tavă adâncă (de circa 25 pe 35 cm), în care încap șase forme individuale de 200 ml, cu puțin loc între ele. Încălzește cuptorul la 150 °C. Durează cam 15 minute, așa că treci între timp la pașii următori. Unge interiorul formelor cu unt.',
          ),
        },
        {
          key: 'separate',
          text: t(
            'Set out a large, very clean, dry bowl for the whites and a medium bowl for the yolks. Crack one egg at a time over a small cup, tip the white into the large bowl and the yolk into the medium one. Cover the yolks and keep them in the fridge. Wash your hands with soap after handling the raw eggs.',
            'Pregătește un bol mare, foarte curat și uscat, pentru albușuri și unul mijlociu pentru gălbenușuri. Sparge câte un ou deasupra unei ceșcuțe, varsă albușul în bolul mare și gălbenușul în cel mijlociu. Acoperă gălbenușurile și ține-le la frigider. Spală-te pe mâini cu săpun după ce ai atins ouăle crude.',
          ),
        },
        {
          key: 'infuse',
          text: t(
            'Split the vanilla pod lengthways and scrape the seeds into a pan with the milk and cream. Add the pod, and heat for about 5 minutes until the milk steams and tiny bubbles show at the edge. Do not let it boil. Take it off the heat, cover it and leave it to infuse for 10 minutes while you beat the whites.',
            'Taie păstaia de vanilie pe lung și răzuiește semințele într-o cratiță cu laptele și frișca. Adaugă păstaia și încălzește circa 5 minute, până când laptele scoate aburi și se văd bule mici pe margine. Nu-l lăsa să dea în clocot. Ia-l de pe foc, acoperă-l și lasă-l la infuzat 10 minute, cât bați albușurile.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'beat',
          text: t(
            'Add the salt to the whites. Beat with an electric whisk on medium speed for about 2 minutes, until soft and foamy. Add the meringue sugar one spoonful at a time, beating on high speed for about 4 more minutes, until the meringue is stiff and glossy and keeps a firm peak when you lift the whisk.',
            'Adaugă sarea la albușuri. Bate-le cu mixerul la viteză medie circa 2 minute, până devin spumoase și moi. Adaugă zahărul pentru bezea câte o lingură, bătând la viteză mare încă vreo 4 minute, până când bezeaua e fermă și lucioasă și păstrează un vârf ferm când ridici mixerul.',
          ),
        },
        {
          key: 'fill',
          text: t(
            'Boil a kettle of water. Spoon the meringue into the buttered ramekins, to about 1 cm below the rim, and smooth the tops. Pull the oven shelf out part of the way, wearing oven gloves, and set the ramekins in the tray with a little space between them.',
            'Fierbe apă în fierbător. Pune bezeaua cu lingura în formele unse, până la circa 1 cm sub margine, și netezește suprafața. Trage raftul cuptorului pe jumătate, cu mănuși de bucătărie, și așază formele în tavă, cu puțin loc între ele.',
          ),
        },
        {
          key: 'water-bath',
          text: t(
            'Pour the hot water from a heatproof jug into the tray, around the ramekins, until it comes halfway up their sides. Keep it away from the meringue. Do not carry the full tray: it stays on the shelf. Slide the shelf in slowly so the water does not slop. Then wash the whisk, bowl and spoons in hot soapy water.',
            'Toarnă apa fierbinte dintr-o cană cu cioc în tavă, în jurul formelor, până ajunge la jumătatea înălțimii lor. Ferește bezeaua de stropi. Nu muta tava plină: rămâne pe raft. Împinge raftul încet în cuptor, ca apa să nu se verse. Apoi spală mixerul, bolul și lingurile în apă caldă cu detergent.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 15 minutes, then check. The meringues are ready when they have risen, are firm and springy when you press them lightly, and a thermometer in the centre reads at least 71 °C. If they are not ready, bake on and check every 3 minutes. Make the sauce while they bake.',
            'Coace 15 minute, apoi verifică. Bezelele sunt gata când au crescut, sunt ferme și elastice la o apăsare ușoară, iar un termometru băgat în centru arată cel puțin 71 °C. Dacă nu sunt gata, mai coace și verifică din 3 în 3 minute. Fă sosul cât se coc.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'anglaise',
          text: t(
            'While the meringues bake, whisk the yolks with the sauce sugar for about 1 minute, until pale. Bring the infused milk back to steaming over medium heat, about 2 minutes. Pour a ladle of it into the yolks in a thin stream, whisking all the time, then pour everything back into the pan. Cook over low heat for about 6 minutes, stirring all the time with a wooden spoon, until it coats the back of the spoon and a line drawn with your finger stays clear. A thermometer should read at least 71 °C (usually 80 to 82 °C). Do not let it go above 85 °C or boil, or the yolks scramble.',
            'Cât se coc bezelele, amestecă gălbenușurile cu zahărul pentru sos circa 1 minut, până devin palide. Adu laptele infuzat la aburi, la foc mediu, circa 2 minute. Toarnă un polonic peste gălbenușuri, în fir subțire, amestecând continuu, apoi toarnă totul înapoi în cratiță. Gătește la foc mic circa 6 minute, amestecând mereu cu o lingură de lemn, până când acoperă dosul lingurii și o dungă trasă cu degetul rămâne limpede. Un termometru trebuie să arate cel puțin 71 °C (de obicei 80-82 °C). Nu-l lăsa să depășească 85 °C și nu-l lăsa să fiarbă, ca să nu se taie gălbenușurile.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'cool-sauce',
          text: t(
            'Strain the sauce through a fine sieve into a bowl, taking out the pod. Press cling film onto the surface so no skin forms. Leave it on the counter until the meringues are out of the oven, then put it in the fridge.',
            'Strecoară sosul printr-o sită fină într-un bol, scoțând păstaia. Lipește folie alimentară direct pe suprafață, ca să nu se formeze pieliță. Lasă-l pe blat până scoți bezelele din cuptor, apoi pune-l la frigider.',
          ),
        },
        {
          key: 'cool-meringues',
          text: t(
            'As soon as the meringues test done, turn the oven off and open the door. Lift the ramekins out of the water one at a time with tongs or dry silicone gloves (cloth gloves soak up hot water and can scald) and set them on a rack. Leave the tray of hot water in the switched-off oven until it is completely cold, then lift it out carefully or empty it with a jug. The meringues sink as they cool: that is normal. After about 20 minutes, when barely warm, cover them and put them in the fridge, within 2 hours of leaving the oven.',
            'De îndată ce bezelele sunt gata, oprește cuptorul și deschide ușa. Scoate formele din apă pe rând, cu clești sau cu mănuși de silicon uscate (mănușile de pânză absorb apa fierbinte și pot opări), și pune-le pe un grătar. Lasă tava cu apă fierbinte în cuptorul oprit, până se răcește complet, apoi scoate-o cu grijă sau golește-o cu o cană. Bezelele se dezumflă pe măsură ce se răcesc: e normal. După circa 20 de minute, când sunt doar călduțe, acoperă-le și pune-le la frigider, în cel mult 2 ore de la scoaterea din cuptor.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'chill',
          text: t(
            'Chill the meringues and the sauce for at least 2 hours, until cold.',
            'Ține bezelele și sosul la frigider cel puțin 2 ore, până se răcesc bine.',
          ),
        },
        {
          key: 'unmould',
          text: t(
            'Stir the sauce and pour it into 6 shallow bowls. Run a thin knife round the inside edge of each ramekin. If one sticks, first stand it in a bowl of hot tap water for 10 seconds. Turn each meringue out onto the sauce. If you are using the almonds, toast them in a dry pan over medium heat for about 3 minutes, stirring, until pale golden.',
            'Amestecă sosul și toarnă-l în 6 boluri puțin adânci. Treci un cuțit subțire pe marginea interioară a fiecărei forme. Dacă una se lipește, ține-o mai întâi 10 secunde într-un bol cu apă fierbinte de la robinet. Răstoarnă fiecare bezea peste sos. Dacă folosești migdalele, prăjește-le într-o tigaie uscată, la foc mediu, circa 3 minute, amestecând, până devin ușor aurii.',
          ),
        },
        {
          key: 'caramel',
          text: t(
            'Keep children away from the hob. Hot caramel is far hotter than boiling water and causes bad burns: never touch it or taste it, and never add water to the hot pan, because it spits violently. If caramel touches your skin, hold the area under cold running water for 20 minutes, and get medical help (112) for a large or deep burn or a burn on a child. Put the caramel sugar and water in a small heavy-based pan (about 16 cm) over medium heat. Do not stir; let the sugar dissolve, then turn the heat up a little and swirl the pan now and then for about 7 minutes, until the syrup turns deep amber. Take the pan off the heat at once and let the bubbles settle for 20 seconds.',
            'Ține copiii departe de aragaz. Caramelul fierbinte e mult mai fierbinte decât apa clocotită și provoacă arsuri grave: nu-l atinge, nu-l gusta și nu turna niciodată apă în cratița fierbinte, pentru că stropește violent. Dacă ți-a picat caramel pe piele, ține zona sub apă rece curgătoare 20 de minute și cheamă ajutor medical (112) pentru o arsură mare sau adâncă sau pentru o arsură la un copil. Pune zahărul pentru caramel și apa într-o cratiță mică cu fundul gros (de circa 16 cm), la foc mediu. Nu amesteca; lasă zahărul să se dizolve, apoi mărește puțin focul și învârte cratița din când în când, circa 7 minute, până când siropul devine chihlimbariu închis. Ia imediat cratița de pe foc și lasă bulele să se liniștească 20 de secunde.',
          ),
          timerSeconds: 420,
        },
        {
          key: 'finish',
          text: t(
            'Quickly drizzle the caramel in thin threads from a spoon over the meringues, add the toasted almonds if you like, and serve straight away: the caramel softens into the sauce within about 10 minutes. Fill the caramel pan with water only after it has cooled completely, and leave it to soak.',
            'Toarnă repede caramelul în fire subțiri, cu o lingură, peste bezele, adaugă migdalele prăjite dacă vrei și servește imediat: caramelul se înmoaie în sos în aproximativ 10 minute. Umple cratița de caramel cu apă abia după ce s-a răcit complet și las-o la înmuiat.',
          ),
        },
      ],
      tips: [
        t(
          'This dish uses eggs that are cooked, not raw: the meringue is baked to 71 °C and the sauce is cooked until it coats the spoon. For children, older people and anyone pregnant or unwell, check that the meringue reaches 71 °C in the centre, or use pasteurised eggs.',
          'Acest desert folosește ouă gătite, nu crude: bezeaua se coace până la 71 °C, iar sosul se gătește până acoperă lingura. Pentru copii, vârstnici și persoane însărcinate sau bolnave, verifică dacă bezeaua ajunge la 71 °C în centru sau folosește ouă pasteurizate.',
        ),
        t(
          'The meringue is baked, not poached: the water bath keeps the heat gentle so it stays tender and does not crack or turn rubbery.',
          'Bezeaua se coace, nu se poșează: baia de apă ține căldura blândă, așa că rămâne fragedă și nu crapă și nu devine cauciucoasă.',
        ),
        t(
          'This variant also contains tree nuts if you add the almonds, and the butter in the ramekins is a milk ingredient. Check the labels of bought ingredients.',
          'Această variantă conține și fructe cu coajă lemnoasă dacă adaugi migdalele, iar untul din forme e tot un ingredient din lapte. Verifică etichetele produselor cumpărate.',
        ),
      ],
      stepTips: [
        {
          step: 'unmould',
          text: t(
            'Turn the meringues out cold: they slide out cleanly and hold their shape better than warm ones.',
            'Răstoarnă bezelele reci: ies curat din formă și își țin forma mai bine decât cele calde.',
          ),
        },
      ],
      nutritionNote: t(
        'Eggs and milk give some protein, but much of the energy comes from the sugar in the meringue, the sauce and the caramel, and the yolks, milk and cream add saturated fat. Skip the cream and the almonds for a lighter dessert, and keep portions small.',
        'Ouăle și laptele aduc ceva proteine, dar o bună parte din energie vine din zahărul din bezea, din sos și din caramel, iar gălbenușurile, laptele și frișca aduc grăsimi saturate. Renunță la frișcă și la migdale pentru un desert mai ușor și ține porțiile mici.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Fresh raspberries', 'Zmeură proaspătă'),
          reason: t(
            'Their sharpness cuts through the sweet caramel and the rich sauce.',
            'Aciditatea ei taie dulceața caramelului și bogăția sosului.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'raspberry',
        },
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'The bitterness balances the sweet caramel.',
            'Amăreala ei echilibrează caramelul dulce.',
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
            'Served well chilled, it is a cool, refreshing dessert.',
            'Servită bine rece, e un desert răcoritor.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'The sugar and the richness of the sauce are heavy just before bed.',
            'Zahărul și bogăția sosului cad greu chiar înainte de culcare.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'A sweet, creamy dessert sits heavy during exercise.',
            'Un desert dulce și cremos cade greu în timpul efortului.',
          ),
        },
      ],
    },
    {
      slug: 'lapte-de-pasare-spanish',
      cuisine: 'spanish',
      hideBaseTips: [0, 3],
      title: t(
        'Natillas (Spanish lemon and cinnamon custard with a biscuit)',
        'Natillas (cremă spaniolă cu lămâie, scorțișoară și biscuit)',
      ),
      servings: 6,
      prepMinutes: 160,
      cookMinutes: 36,
      difficulty: 'easy',
      lines: [
        { ingredient: 'milk', quantity: 0.9, unit: 'l' },
        {
          ingredient: 'eggs',
          quantity: 5,
          unit: 'pcs',
          note: t('yolks only', 'doar gălbenușurile'),
        },
        {
          ingredient: 'sugar',
          quantity: 90,
          unit: 'g',
          note: t(
            '45 g in the milk, 45 g with the yolks',
            '45 g în lapte, 45 g la gălbenușuri',
          ),
        },
        { ingredient: 'corn-starch', quantity: 15, unit: 'g' },
        {
          ingredient: 'lemon',
          quantity: 0.5,
          unit: 'pcs',
          note: t(
            'zest only, in wide strips, no white pith',
            'doar coaja, în fâșii late, fără partea albă',
          ),
        },
        { ingredient: 'cinnamon-sticks', quantity: 4, unit: 'g' },
        {
          ingredient: 'cinnamon',
          quantity: 1,
          unit: 'g',
          note: t('for dusting', 'pentru pudrat'),
        },
        {
          ingredient: 'biscuits',
          quantity: 60,
          unit: 'g',
          note: t(
            'plain, flat, one per cup',
            'simpli, plați, câte unul pentru fiecare pahar',
          ),
        },
      ],
      steps: [
        {
          key: 'separate',
          text: t(
            'Crack the eggs one at a time over a small cup and tip each yolk into a medium bowl, putting the whites in a covered container in the fridge. Wash your hands with soap after handling the raw eggs. With a vegetable peeler, take the zest from the lemon in wide strips.',
            'Sparge ouăle pe rând deasupra unei ceșcuțe și varsă fiecare gălbenuș într-un bol mijlociu, iar albușurile pune-le într-un recipient acoperit, la frigider. Spală-te pe mâini cu săpun după ce ai atins ouăle crude. Cu un curățător de legume, ia coaja lămâii în fâșii late.',
          ),
        },
        {
          key: 'infuse',
          text: t(
            'Keep 100 ml of the milk cold. Put the rest in a pan (about 2 l) with the lemon zest, the cinnamon stick and 45 g of the sugar. Heat over medium heat for about 6 minutes, until it steams and tiny bubbles show at the edge. Do not let it boil. Take it off the heat, cover it and leave it to infuse for 10 minutes.',
            'Păstrează 100 ml de lapte rece. Pune restul într-o cratiță (de circa 2 l), cu coaja de lămâie, batonul de scorțișoară și 45 g din zahăr. Încălzește la foc mediu circa 6 minute, până când scoate aburi și se văd bule mici pe margine. Nu-l lăsa să dea în clocot. Ia-l de pe foc, acoperă-l și lasă-l la infuzat 10 minute.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'yolks',
          text: t(
            'In the bowl, whisk the yolks with the remaining 45 g of sugar, the corn starch and the cold milk for about 1 minute, until smooth, with no lumps of starch.',
            'În bol, amestecă gălbenușurile cu cele 45 g de zahăr rămase, cu amidonul de porumb și cu laptele rece circa 1 minut, până se omogenizează, fără cocoloașe de amidon.',
          ),
        },
        {
          key: 'temper',
          text: t(
            'Put the pan back over medium heat for about 2 minutes, until the milk steams again. Lift out the zest and the cinnamon stick. Pour a ladle of the hot milk (about 150 ml) into the yolks in a thin stream, whisking all the time, then pour the mixture back into the pan.',
            'Pune cratița la loc pe foc mediu circa 2 minute, până când laptele scoate din nou aburi. Scoate coaja și batonul de scorțișoară. Toarnă un polonic de lapte fierbinte (circa 150 ml) peste gălbenușuri, în fir subțire, amestecând continuu, apoi toarnă amestecul înapoi în cratiță.',
          ),
        },
        {
          key: 'cook',
          text: t(
            'Cook over low heat for about 6 minutes, stirring all the time with a wooden spoon and scraping the base and the edge. It is ready when it has thickened, coats the back of the spoon and a line drawn with your finger stays clear. A thermometer should read at least 71 °C. Then let it bubble gently for 1 more minute, still stirring: the starch stops the yolks scrambling, and the heat stops the yolks from thinning the custard as it stands. Do not let it boil hard.',
            'Gătește la foc mic circa 6 minute, amestecând mereu cu o lingură de lemn și răzuind fundul și marginile. E gata când s-a îngroșat, acoperă dosul lingurii și o dungă trasă cu degetul rămâne limpede. Un termometru trebuie să arate cel puțin 71 °C. Apoi lasă-o să bolborosească ușor încă 1 minut, amestecând în continuare: amidonul împiedică gălbenușurile să se taie, iar căldura face ca gălbenușurile să nu subțieze crema cât stă. Nu o lăsa să fiarbă tare.',
          ),
          timerSeconds: 420,
        },
        {
          key: 'cool',
          text: t(
            'Pour the custard through a fine sieve into a jug, then divide it between 6 cups of about 200 ml. Press cling film onto the surface of each, so no skin forms. Leave the cups on the counter for 30 minutes, then put them in the fridge, well within 2 hours of cooking.',
            'Toarnă crema printr-o sită fină într-un vas cu cioc, apoi împarte-o în 6 pahare de circa 200 ml. Lipește folie alimentară direct pe suprafața fiecăruia, ca să nu se formeze pieliță. Lasă paharele pe blat 30 de minute, apoi pune-le la frigider, în mult mai puțin de 2 ore de la gătit.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'chill',
          text: t(
            'Chill the cups for at least 2 hours, until cold and set to a soft, spoonable custard.',
            'Ține paharele la frigider cel puțin 2 ore, până se răcesc bine și crema se leagă moale, ca să se mănânce cu lingurița.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Just before serving, stand a biscuit upright in each cup and dust the top with the ground cinnamon.',
            'Chiar înainte de servire, înfige câte un biscuit în fiecare pahar și pudrează deasupra cu scorțișoară măcinată.',
          ),
        },
      ],
      tips: [
        t(
          'You are left with 5 egg whites. Keep them covered in the fridge and use them within 2 days: in an omelette, or beaten with about 75 g of sugar and poached as in the lapte de pasăre base (the beat, poach and check steps) to float on the natillas.',
          'Îți rămân 5 albușuri. Păstrează-le acoperite la frigider și folosește-le în cel mult 2 zile: într-o omletă, ori bătute cu circa 75 g de zahăr și poșate ca în lapte de pasăre (pașii de bătut, poșat și verificat), ca să plutească peste natillas.',
        ),
        t(
          'The biscuit contains gluten and milk, so check its label. Put it in only at the last moment, or it goes soft.',
          'Biscuitul conține gluten și lapte, așa că verifică eticheta. Pune-l abia în ultima clipă, altfel se înmoaie.',
        ),
      ],
      stepTips: [
        {
          step: 'infuse',
          text: t(
            'Leave the lemon zest as wide strips without the white pith, which is bitter, so you can lift them all out again.',
            'Lasă coaja de lămâie în fâșii late, fără partea albă, care e amară, ca să o poți scoate toată.',
          ),
        },
      ],
      nutritionNote: t(
        'Eggs and milk give protein, but much of the energy comes from the sugar and the biscuit, and the yolks and milk add some saturated fat. It has almost no fibre, so keep portions small and add fruit.',
        'Ouăle și laptele aduc proteine, dar o bună parte din energie vine din zahăr și din biscuit, iar gălbenușurile și laptele aduc ceva grăsimi saturate. Aproape nu are fibre, așa că ține porțiile mici și adaugă fructe.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Orange slices', 'Felii de portocală'),
          reason: t(
            'The sharp, juicy orange cuts through the rich, sweet custard and goes well with cinnamon.',
            'Portocala acidulată și zemoasă taie bogăția și dulceața cremei și se potrivește cu scorțișoara.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'orange',
        },
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'The bitterness balances the sweet, milky custard.',
            'Amăreala ei echilibrează crema dulce, cu lapte.',
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
            'Served well chilled, it is a cool, refreshing dessert.',
            'Servită bine rece, e un desert răcoritor.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'The sugar and the richness of the custard are heavy just before bed.',
            'Zahărul și bogăția cremei cad greu chiar înainte de culcare.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'A sweet, creamy dessert sits heavy during exercise.',
            'Un desert dulce și cremos cade greu în timpul efortului.',
          ),
        },
      ],
    },
  ],
};
