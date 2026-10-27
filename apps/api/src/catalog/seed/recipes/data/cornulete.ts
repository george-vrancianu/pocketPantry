import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Cornulete base is the Romanian yeast-and-butter crescent cookie filled
// with Turkish delight or jam. Each Variant is a full Recipe with its own
// lines, steps and guidance; the base's Recipe-level Tips are inherited unless
// a Variant hides them.
export const cornulete: BaseRecipeSeed = {
  slug: 'cornulete',
  title: t(
    'Romanian crescent cookies (cornulețe)',
    'Cornulețe fragede cu rahat și gem',
  ),
  servings: 12,
  prepMinutes: 85,
  cookMinutes: 60,
  difficulty: 'medium',
  lines: [
    { ingredient: 'fresh-yeast', quantity: 15, unit: 'g' },
    {
      ingredient: 'milk',
      quantity: 50,
      unit: 'ml',
      note: t('lukewarm', 'călduț'),
    },
    {
      ingredient: 'sugar',
      key: 'sugar-yeast',
      quantity: 5,
      unit: 'g',
      note: t('for the yeast', 'pentru drojdie'),
    },
    { ingredient: 'flour', quantity: 400, unit: 'g' },
    {
      ingredient: 'butter',
      quantity: 200,
      unit: 'g',
      note: t('cold', 'rece'),
    },
    { ingredient: 'sour-cream', quantity: 150, unit: 'g' },
    {
      ingredient: 'eggs',
      quantity: 2,
      unit: 'pcs',
      note: t('yolks only', 'doar gălbenușurile'),
    },
    {
      ingredient: 'sugar',
      key: 'sugar-dough',
      quantity: 35,
      unit: 'g',
      note: t('for the dough', 'pentru aluat'),
    },
    {
      ingredient: 'vanilla-sugar',
      key: 'vanilla-sugar-dough',
      quantity: 8,
      unit: 'g',
      note: t('for the dough', 'pentru aluat'),
    },
    { ingredient: 'salt', quantity: 2, unit: 'g' },
    {
      ingredient: 'lemon',
      quantity: 1,
      unit: 'pcs',
      note: t('zest only, washed', 'doar coaja, spălată'),
    },
    {
      ingredient: 'turkish-delight',
      quantity: 120,
      unit: 'g',
      note: t('cut into small strips', 'tăiat în fâșii mici'),
    },
    {
      ingredient: 'jam',
      quantity: 100,
      unit: 'g',
      note: t('thick, for the other half', 'groasă, pentru cealaltă jumătate'),
    },
    {
      ingredient: 'walnuts',
      quantity: 60,
      unit: 'g',
      optional: true,
      note: t(
        'finely ground, for the walnut filling',
        'măcinate fin, pentru umplutura cu nucă',
      ),
    },
    {
      ingredient: 'sugar',
      key: 'sugar-filling',
      quantity: 20,
      unit: 'g',
      optional: true,
      note: t('mixed into the ground walnuts', 'amestecat cu nucile măcinate'),
    },
    {
      ingredient: 'icing-sugar',
      quantity: 120,
      unit: 'g',
      note: t('for rolling', 'pentru tăvălit'),
    },
    {
      ingredient: 'vanilla-sugar',
      key: 'vanilla-sugar-coating',
      quantity: 8,
      unit: 'g',
      note: t('for rolling', 'pentru tăvălit'),
    },
  ],
  steps: [
    {
      key: 'yeast',
      text: t(
        'Crumble the yeast into the lukewarm milk (it should feel barely warm on your wrist), add the 5 g of sugar and stir. Leave it for 10 minutes until foamy. Do the next step while you wait.',
        'Mărunțește drojdia în laptele călduț (să-l simți abia cald pe încheietura mâinii), adaugă cele 5 g de zahăr și amestecă. Lasă 10 minute, până face spumă. Fă pasul următor cât timp așteaptă.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'rub',
      text: t(
        'Mix the flour and salt in a large bowl. Grate or dice the cold butter over it and rub it in quickly with your fingertips until the mix looks like coarse crumbs with a few pea-sized lumps.',
        'Amestecă făina cu sarea într-un castron mare. Dă untul rece prin răzătoare sau taie-l cubulețe peste făină și freacă-l repede între degete, până când compoziția seamănă cu niște firimituri mari, cu câteva bucățele cât un bob de mazăre.',
      ),
    },
    {
      key: 'dough',
      text: t(
        'Add the foamy yeast, sour cream, egg yolks, the 35 g of sugar, 8 g of vanilla sugar and the lemon zest. Mix with your hands for about a minute, only until the dough comes together into a soft ball that does not stick to your fingers. Do not knead it.',
        'Adaugă drojdia spumoasă, smântâna, gălbenușurile, cele 35 g de zahăr, 8 g de zahăr vanilat și coaja de lămâie. Amestecă cu mâna cam un minut, doar până când aluatul se adună într-o bilă moale, care nu se mai lipește de degete. Nu-l frământa.',
      ),
    },
    {
      key: 'chill',
      text: t(
        'Divide the dough into 4 equal pieces, flatten each into a disc and wrap them in cling film. Chill for 45 minutes until firm. The dough does not need to rise.',
        'Împarte aluatul în 4 bucăți egale, aplatizează fiecare bucată într-un disc și înfășoară-o în folie alimentară. Dă la frigider 45 de minute, până se întărește. Aluatul nu are nevoie să crească.',
      ),
      timerSeconds: 2700,
    },
    {
      key: 'roll',
      text: t(
        'Line two baking trays with baking paper. Take one disc from the fridge and keep the others cold. Roll it on a lightly floured surface into a circle about 3 mm thick and 28 cm wide, then cut it into 12 wedges like a pizza.',
        'Tapetează două tăvi cu hârtie de copt. Scoate un disc din frigider și ține-le pe celelalte la rece. Întinde-l pe un blat presărat ușor cu făină, într-un cerc gros de aproximativ 3 mm și lat de 28 cm, apoi taie-l în 12 felii, ca pe o pizza.',
      ),
    },
    {
      key: 'fill',
      text: t(
        'Put a small strip of Turkish delight on the wide end of 6 wedges, and half a teaspoon of thick jam on the wide end of the other 6. If you are using the walnuts, mix them with the 20 g of sugar and fill 4 wedges with Turkish delight, 4 with jam and 4 with a teaspoon of the walnut mix instead.',
        'Pune câte o fâșie mică de rahat pe capătul lat la 6 dintre felii și câte o jumătate de linguriță de gem gros pe capătul lat al celorlalte 6. Dacă folosești nucile, amestecă-le cu cele 20 g de zahăr și umple câte 4 felii cu rahat, 4 cu gem și 4 cu o linguriță din amestecul de nucă.',
      ),
    },
    {
      key: 'shape',
      text: t(
        'Roll each wedge up from the wide end towards the tip, bend it into a crescent and set it tip-down on the tray, 2 cm apart. Repeat with the other 3 discs, putting 24 cornulețe on each tray. Keep the second tray in the fridge while the first one bakes.',
        'Rulează fiecare felie de la capătul lat spre vârf, îndoaie-o în formă de corn și așază-o pe tavă cu vârful în jos, la 2 cm distanță. Repetă cu celelalte 3 discuri, astfel încât să ai 24 de cornulețe pe fiecare tavă. Ține a doua tavă la frigider cât timp se coace prima.',
      ),
    },
    {
      key: 'preheat',
      text: t(
        'Heat the oven to 180 °C (fan 160 °C) and let it come to full temperature, about 15 minutes.',
        'Încălzește cuptorul la 180 °C (cu ventilator 160 °C) și lasă-l să ajungă la temperatura completă, cam 15 minute.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'bake-1',
      text: t(
        'Bake the first tray on the middle shelf for 15 to 20 minutes, until the cornulețe are pale golden at the edges and underneath. Lift one with a spatula to check the base. They should not brown on top.',
        'Coace prima tavă pe grătarul din mijloc 15-20 de minute, până când cornulețele au un auriu deschis la margini și pe dedesubt. Ridică unul cu o spatulă și verifică fața de jos. Nu trebuie să se rumenească deasupra.',
      ),
      timerSeconds: 1080,
    },
    {
      key: 'bake-2',
      text: t(
        'Take the first tray out and bake the second tray the same way, for 15 to 20 minutes, checking the base of one before you take it out.',
        'Scoate prima tavă și coace-o pe a doua în același fel, 15-20 de minute, verificând fața de jos a unuia înainte să o scoți.',
      ),
      timerSeconds: 1080,
    },
    {
      key: 'coat',
      text: t(
        'Let the cornulețe cool on the tray for 5 minutes: the jam is scalding hot at first. Mix the icing sugar with 8 g of vanilla sugar in a bowl and roll the warm cornulețe in it a few at a time, then leave them to cool completely on a rack.',
        'Lasă cornulețele să se răcească 5 minute pe tavă: gemul e fierbinte la început. Amestecă zahărul pudră cu 8 g de zahăr vanilat într-un castron și tăvălește cornulețele calde prin el, câte câteva, apoi lasă-le să se răcească complet pe un grătar.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'store',
      text: t(
        'Once completely cool, pack them in an airtight tin, with baking paper between the layers. They keep for about 1 week at room temperature.',
        'După ce s-au răcit complet, pune-le într-o cutie metalică bine închisă, cu hârtie de copt între straturi. Se păstrează cam 1 săptămână la temperatura camerei.',
      ),
    },
  ],
  tips: [
    t(
      'Keep the dough cold. If the butter softens and the dough turns greasy while you roll, put it back in the fridge for 10 minutes, otherwise the cornulețe spread and lose their shape in the oven.',
      'Ține aluatul rece. Dacă untul se înmoaie și aluatul devine uleios în timp ce îl întinzi, pune-l înapoi la frigider 10 minute, altfel cornulețele se întind în cuptor și își pierd forma.',
    ),
    t(
      'Take them out when they are pale. If they brown, they turn dry and hard instead of tender and crumbly; they firm up as they cool.',
      'Scoate-le din cuptor când sunt încă palide. Dacă se rumenesc, ies uscate și tari, nu fragede și friabile; se întăresc pe măsură ce se răcesc.',
    ),
    t(
      'Keep the filling small. A thick strip of Turkish delight or too much jam leaks out and burns on the paper.',
      'Pune puțină umplutură. O fâșie groasă de rahat sau prea mult gem se scurge și se arde pe hârtie.',
    ),
  ],
  stepTips: [
    {
      step: 'fill',
      text: t(
        'Use thick jam, the kind that stays on an upturned spoon. Runny jam leaks out through the dough.',
        'Folosește gem gros, din cel care nu se scurge de pe lingura întoarsă. Gemul subțire iese prin aluat.',
      ),
    },
    {
      step: 'dough',
      text: t(
        'Do not taste the raw dough: it contains raw flour and egg yolks.',
        'Nu gusta aluatul crud: conține făină crudă și gălbenușuri.',
      ),
    },
  ],
  nutritionNote: t(
    'Made from white flour, butter, sour cream, sugar and sweet fillings, so they are rich in saturated fat and sugar and low in fibre, and the small size makes it easy to eat many. Baked, not fried, and a couple with tea is a modest treat.',
    'Sunt făcute din făină albă, unt, smântână, zahăr și umpluturi dulci, deci conțin multe grăsimi saturate și zahăr și puține fibre, iar mărimea mică te face să mănânci multe. Sunt coapte, nu prăjite, iar două-trei cu un ceai sunt un desert potrivit.',
  ),
  pairings: [
    {
      kind: 'drink',
      label: t('Tea', 'Ceai'),
      reason: t(
        'Its light bitterness cuts through the sugar and the butter.',
        'Amăreala ușoară taie dulceața și untul.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'tea',
    },

    {
      kind: 'food',
      label: t(
        'Cozonac (Romanian sweet bread with walnut and cocoa swirl)',
        'Cozonac cu nucă și cacao',
      ),
      reason: t(
        'Both are baked for the winter holidays in Romania and set out together on the sweets plate.',
        'Se coc amândouă pentru sărbătorile de iarnă și se pun împreună pe platoul cu dulciuri.',
      ),
      principle: 'regional_tradition',
      recipe: 'cozonac',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A sweet treat to nibble with hot tea when it is cold outside.',
        'Un dulce de ronțăit cu un ceai fierbinte când e frig afară.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'The butter-rich dough sits heavy in the stomach during exercise.',
        'Aluatul bogat în unt cade greu la stomac în timpul efortului.',
      ),
    },
  ],
  variants: [
    {
      slug: 'cornulete-austrian',
      cuisine: 'austrian',
      title: t(
        'Vanillekipferl (Austrian vanilla almond crescents)',
        'Vanillekipferl (cornulețe austriece cu migdale și vanilie)',
      ),
      servings: 12,
      prepMinutes: 75,
      cookMinutes: 50,
      difficulty: 'medium',
      hideBaseTips: [2],
      lines: [
        { ingredient: 'flour', quantity: 250, unit: 'g' },
        {
          ingredient: 'almond-flour',
          quantity: 100,
          unit: 'g',
          note: t('ground almonds', 'migdale măcinate'),
        },
        { ingredient: 'sugar', quantity: 70, unit: 'g' },
        { ingredient: 'salt', quantity: 1, unit: 'g' },
        {
          ingredient: 'butter',
          quantity: 200,
          unit: 'g',
          note: t('cold, diced', 'rece, tăiat cubulețe'),
        },
        {
          ingredient: 'eggs',
          quantity: 1,
          unit: 'pcs',
          note: t('yolk only', 'doar gălbenușul'),
        },
        { ingredient: 'icing-sugar', quantity: 80, unit: 'g' },
        {
          ingredient: 'vanilla-sugar',
          quantity: 20,
          unit: 'g',
          note: t('for rolling', 'pentru tăvălit'),
        },
        {
          ingredient: 'vanilla-pods',
          quantity: 1,
          unit: 'pcs',
          note: t('seeds scraped out', 'doar semințele'),
        },
      ],
      steps: [
        {
          key: 'mix',
          text: t(
            'Mix the flour, ground almonds, sugar and salt in a bowl. Add the cold diced butter and the egg yolk.',
            'Amestecă făina, migdalele măcinate, zahărul și sarea într-un castron. Adaugă untul rece tăiat cubulețe și gălbenușul.',
          ),
        },
        {
          key: 'dough',
          text: t(
            'Work everything together quickly with your fingertips, then press it into a smooth dough with the heel of your hand. Do not overwork it: warm hands melt the butter. Do not taste the raw dough, it contains raw flour and egg yolk.',
            'Lucrează repede totul cu vârfurile degetelor, apoi apasă aluatul cu podul palmei până devine omogen. Nu-l lucra prea mult: mâinile calde topesc untul. Nu gusta aluatul crud, conține făină crudă și gălbenuș.',
          ),
        },
        {
          key: 'chill',
          text: t(
            'Flatten the dough into a disc, wrap it in cling film and chill for 30 minutes until firm.',
            'Aplatizează aluatul într-un disc, înfășoară-l în folie alimentară și dă-l la frigider 30 de minute, până se întărește.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'shape',
          text: t(
            'Line two baking trays with baking paper. Roll the dough by hand into ropes as thick as a thumb, cut them into 4 cm pieces and roll each piece with slightly tapered ends. Bend into a small crescent and set 2 cm apart on the trays, about 25 on each. Keep the second tray in the fridge while the first one bakes.',
            'Tapetează două tăvi cu hârtie de copt. Rulează aluatul cu mâna în suluri groase cât degetul mare, taie-le în bucăți de 4 cm și rulează fiecare bucată, subțiind ușor capetele. Îndoaie-le într-un cornuleț mic și așază-le la 2 cm distanță pe tavă, cam 25 pe fiecare. Ține a doua tavă la frigider cât timp se coace prima.',
          ),
        },
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 170 °C (fan 150 °C) and let it come to full temperature, about 15 minutes.',
            'Încălzește cuptorul la 170 °C (cu ventilator 150 °C) și lasă-l să ajungă la temperatura completă, cam 15 minute.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'bake-1',
          text: t(
            'Bake the first tray on the middle shelf for 10 to 12 minutes, until the tips are just pale gold and the underside is pale golden. They must not brown.',
            'Coace prima tavă pe grătarul din mijloc 10-12 minute, până când vârfurile sunt doar ușor aurii și fața de jos are un auriu deschis. Nu trebuie să se rumenească.',
          ),
          timerSeconds: 660,
        },
        {
          key: 'bake-2',
          text: t(
            'Take the first tray out and bake the second tray the same way, for 10 to 12 minutes.',
            'Scoate prima tavă și coace-o pe a doua în același fel, 10-12 minute.',
          ),
          timerSeconds: 660,
        },
        {
          key: 'rest',
          text: t(
            'Leave the crescents on the tray for 5 minutes. They are very fragile when hot and crumble if you lift them too soon.',
            'Lasă cornulețele pe tavă 5 minute. Sunt foarte fragile cât sunt fierbinți și se sfărâmă dacă le ridici prea devreme.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'coat',
          text: t(
            'Mix the icing sugar with the vanilla sugar and the seeds of the vanilla pod. Lift the warm crescents gently with a spatula and roll them in the sugar a few at a time. Leave to cool completely on a rack.',
            'Amestecă zahărul pudră cu zahărul vanilat și cu semințele din păstaia de vanilie. Ridică ușor cornulețele calde cu o spatulă și tăvălește-le prin zahăr, câte câteva. Lasă-le să se răcească complet pe un grătar.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Once cool, pack them in a tin with baking paper between the layers. They keep for about 2 weeks at room temperature.',
            'După ce s-au răcit, pune-le într-o cutie metalică, cu hârtie de copt între straturi. Se păstrează cam 2 săptămâni la temperatura camerei.',
          ),
        },
      ],
      tips: [
        t(
          'Ground hazelnuts can replace the almonds. Either way these contain tree nuts, so tell guests before you serve them.',
          'Poți înlocui migdalele cu alune de pădure măcinate. În ambele cazuri conțin fructe cu coajă lemnoasă, așa că anunță-ți invitații înainte să le servești.',
        ),
      ],
      stepTips: [
        {
          step: 'coat',
          text: t(
            'Roll them while still warm: the sugar clings to the butter on the surface. Once cold, the sugar will not stick.',
            'Tăvălește-le cât sunt calde: zahărul se prinde de untul de pe suprafață. După ce s-au răcit, zahărul nu se mai lipește.',
          ),
        },
      ],
      nutritionNote: t(
        'The almonds bring some unsaturated fat and protein, but the dough is mostly butter, white flour and sugar, so these are rich in saturated fat and sugar. They contain tree nuts (almonds or hazelnuts), an allergen, and a few small biscuits are enough.',
        'Migdalele aduc grăsimi nesaturate și proteine, dar aluatul e făcut în principal din unt, făină albă și zahăr, deci sunt bogate în grăsimi saturate și zahăr. Conțin fructe cu coajă lemnoasă (migdale sau alune de pădure), un alergen, iar câțiva biscuiți mici sunt de ajuns.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Tea', 'Ceai'),
          reason: t(
            'Its light bitterness balances the sugar and the buttery almond dough.',
            'Amăreala ușoară echilibrează zahărul și aluatul cu unt și migdale.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'tea',
        },
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'Its bitterness cuts through the rich, sweet shortbread.',
            'Amăreala ei taie bogăția și dulceața aluatului fraged.',
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
            'A buttery biscuit to dunk in a hot drink on a cold day.',
            'Un biscuit cu unt, bun de muiat într-o băutură fierbinte într-o zi rece.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Butter and nuts sit heavy in the stomach during exercise.',
            'Untul și migdalele cad greu la stomac în timpul efortului.',
          ),
        },
      ],
    },
    {
      slug: 'cornulete-moroccan',
      cuisine: 'moroccan',
      title: t(
        'Kaab el ghazal (Moroccan gazelle horns with almond paste)',
        'Kaab el ghazal (cornulețe marocane „coarne de gazelă”, cu pastă de migdale)',
      ),
      servings: 12,
      prepMinutes: 115,
      cookMinutes: 45,
      difficulty: 'hard',
      hideBaseTips: [0, 1, 2],
      lines: [
        {
          ingredient: 'almond-flour',
          quantity: 250,
          unit: 'g',
          note: t('blanched ground almonds', 'migdale decojite, măcinate'),
        },
        {
          ingredient: 'sugar',
          quantity: 100,
          unit: 'g',
        },
        {
          ingredient: 'butter',
          key: 'butter-filling',
          quantity: 40,
          unit: 'g',
          note: t('melted, for the filling', 'topit, pentru umplutură'),
        },
        {
          ingredient: 'orange-blossom-water',
          key: 'orange-blossom-water-filling',
          quantity: 30,
          unit: 'ml',
          note: t('for the filling', 'pentru umplutură'),
        },
        {
          ingredient: 'cinnamon',
          quantity: 2,
          unit: 'g',
          optional: true,
        },
        { ingredient: 'flour', quantity: 200, unit: 'g' },
        {
          ingredient: 'butter',
          key: 'butter-dough',
          quantity: 30,
          unit: 'g',
          note: t('melted, for the dough', 'topit, pentru aluat'),
        },
        { ingredient: 'salt', quantity: 1, unit: 'g' },
        {
          ingredient: 'orange-blossom-water',
          key: 'orange-blossom-water-dough',
          quantity: 15,
          unit: 'ml',
          note: t('for the dough', 'pentru aluat'),
        },
        {
          ingredient: 'still-water',
          quantity: 90,
          unit: 'ml',
          note: t('cool, a little at a time', 'rece, puțin câte puțin'),
        },
      ],
      steps: [
        {
          key: 'paste',
          text: t(
            'Mix the ground almonds, sugar and the cinnamon, if using, in a bowl. Add the 40 g of melted butter and 30 ml of orange blossom water and knead into a firm, smooth paste. If it is crumbly, add a few drops of water.',
            'Amestecă migdalele măcinate, zahărul și scorțișoara, dacă o folosești, într-un castron. Adaugă cele 40 g de unt topit și 30 ml de apă de flori de portocal și frământă până obții o pastă fermă și netedă. Dacă se sfărâmă, adaugă câteva picături de apă.',
          ),
        },
        {
          key: 'logs',
          text: t(
            'Divide the paste into 24 pieces of about 17 g. Roll each piece into a log about 6 cm long, tapered at both ends. Cover and set aside while you make the dough.',
            'Împarte pasta în 24 de bucăți de cam 17 g. Rulează fiecare bucată într-un cilindru lung de aproximativ 6 cm, subțiat la ambele capete. Acoperă-le și pune-le deoparte cât faci aluatul.',
          ),
        },
        {
          key: 'dough',
          text: t(
            'Mix the flour and salt in a large bowl. Add the 30 g of melted butter and 15 ml of orange blossom water, then pour in the cool water a little at a time, mixing, until the dough comes together.',
            'Amestecă făina cu sarea într-un castron mare. Adaugă cele 30 g de unt topit și 15 ml de apă de flori de portocal, apoi toarnă apa rece puțin câte puțin, amestecând, până se adună aluatul.',
          ),
        },
        {
          key: 'knead',
          text: t(
            'Knead the dough for 10 minutes on the counter until it is smooth and very elastic.',
            'Frământă aluatul 10 minute pe blat, până devine neted și foarte elastic.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'rest',
          text: t(
            'Cover the dough with a bowl or damp cloth and let it rest for 30 minutes so it relaxes and rolls out thinner.',
            'Acoperă aluatul cu un castron sau cu un prosop umed și lasă-l 30 de minute să se odihnească, ca să se întindă mai subțire.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'roll',
          text: t(
            'Roll out a quarter of the dough at a time, with a rolling pin or a pasta machine, as thin as paper, into a strip about 8 cm wide. Keep the rest covered so it does not dry out.',
            'Întinde câte un sfert din aluat, cu făcălețul sau cu mașina de paste, cât mai subțire, ca hârtia, într-o fâșie lată de aproximativ 8 cm. Ține restul acoperit ca să nu se usuce.',
          ),
        },
        {
          key: 'wrap',
          text: t(
            'Lay the almond logs along one side of the strip, 2 cm in from the edge and 2 cm apart. Fold the dough over them and press it down around each log. Cut round each one with a fluted cutter, leaving a narrow border.',
            'Așază cilindrii de migdale de-a lungul unei laturi a fâșiei, la 2 cm de margine și la 2 cm unul de altul. Îndoaie aluatul peste ei și apasă-l în jurul fiecăruia. Taie în jurul fiecăruia cu o rotiță zimțată, lăsând o margine îngustă.',
          ),
        },
        {
          key: 'shape',
          text: t(
            'Pinch the edge to form a ridge, curve each piece into a crescent and prick it all over with a needle so it does not burst in the oven. Set them on two lined baking trays, 12 on each. Keep the second tray in the fridge while the first one bakes.',
            'Ciupește marginea ca să formezi o creastă, curbează fiecare bucată într-un corn și înțeapă-l peste tot cu un ac, ca să nu crape în cuptor. Așază-le pe două tăvi tapetate cu hârtie de copt, câte 12 pe fiecare. Ține a doua tavă la frigider cât timp se coace prima.',
          ),
        },
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 180 °C (fan 160 °C) and let it come to full temperature, about 15 minutes.',
            'Încălzește cuptorul la 180 °C (cu ventilator 160 °C) și lasă-l să ajungă la temperatura completă, cam 15 minute.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'bake-1',
          text: t(
            'Bake the first tray on the middle shelf for 12 to 15 minutes, until the dough is still pale with only a hint of colour on the base. Lift one with a spatula to check. They must not brown.',
            'Coace prima tavă pe grătarul din mijloc 12-15 minute, până când aluatul e încă palid, cu doar o urmă de culoare pe fața de jos. Ridică unul cu o spatulă să verifici. Nu trebuie să se rumenească.',
          ),
          timerSeconds: 810,
        },
        {
          key: 'bake-2',
          text: t(
            'Take the first tray out and bake the second tray the same way, for 12 to 15 minutes. Cool completely on a rack.',
            'Scoate prima tavă și coace-o pe a doua în același fel, 12-15 minute. Lasă-le să se răcească complet pe un grătar.',
          ),
          timerSeconds: 810,
        },
        {
          key: 'store',
          text: t(
            'Once cool, keep them in an airtight tin for up to 5 days.',
            'După ce s-au răcit, păstrează-le într-o cutie metalică bine închisă până la 5 zile.',
          ),
        },
      ],
      tips: [
        t(
          'Orange blossom water is strongly scented. Measure it: too much makes the paste taste like perfume.',
          'Apa de flori de portocal are un parfum intens. Măsoar-o: dacă pui prea multă, pasta miroase și are gust de parfum.',
        ),
      ],
      stepTips: [
        {
          step: 'roll',
          text: t(
            'Dust the surface with as little flour as possible: extra flour makes the thin dough dry and brittle.',
            'Presară cât mai puțină făină pe blat: făina în plus face aluatul subțire uscat și casant.',
          ),
        },
      ],
      nutritionNote: t(
        'Almonds bring unsaturated fat and protein, and the dough itself is thin and low in sugar, but the paste is still sweet and rich. They contain tree nuts (almonds), an allergen, and one or two are plenty.',
        'Migdalele aduc grăsimi nesaturate și proteine, iar aluatul în sine e subțire și fără zahăr, dar pasta e totuși dulce și bogată. Conțin fructe cu coajă lemnoasă (migdale), un alergen, iar unul-două sunt de ajuns.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t(
            'Green tea with fresh mint',
            'Ceai verde cu mentă proaspătă',
          ),
          reason: t(
            'Moroccan mint tea is green tea brewed with fresh mint and sugar; its freshness lifts the rich almond paste.',
            'Ceaiul marocan cu mentă e ceai verde infuzat cu mentă proaspătă și zahăr, iar prospețimea lui ușurează pasta bogată de migdale.',
          ),
          principle: 'regional_tradition',
          ingredient: 'green-tea',
        },
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'Its bitterness balances the sweet almond filling.',
            'Amăreala ei echilibrează umplutura dulce de migdale.',
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
            'A small sweet that goes well with a hot glass of tea.',
            'Un dulce mic, care se potrivește cu un pahar de ceai fierbinte.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'The almond paste and butter sit heavy in the stomach during exercise.',
            'Pasta de migdale și untul cad greu la stomac în timpul efortului.',
          ),
        },
      ],
    },
  ],
};
