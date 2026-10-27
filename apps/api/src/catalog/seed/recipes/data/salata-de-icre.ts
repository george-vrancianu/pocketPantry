import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Salată de icre base is the Romanian whipped carp-roe spread: salted roe
// beaten with sunflower oil, added drop by drop as for mayonnaise, with no egg.
// The roe is cured, not cooked, so every Recipe here is kept cold and carries
// the raw-roe note. Each Variant is a full Recipe with its own lines, steps and
// guidance; the base's Recipe-level Tips are inherited.
export const salataDeIcre: BaseRecipeSeed = {
  slug: 'salata-de-icre',
  title: t(
    'Romanian whipped carp-roe spread (salată de icre)',
    'Salată de icre de crap',
  ),
  servings: 6,
  prepMinutes: 40,
  cookMinutes: 12,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'carp-roe',
      quantity: 150,
      unit: 'g',
      note: t('salted, store-bought', 'sărate, cumpărate gata preparate'),
    },
    { ingredient: 'sunflower-oil', quantity: 180, unit: 'ml' },
    { ingredient: 'lemon-juice', quantity: 30, unit: 'ml' },
    {
      ingredient: 'bread',
      quantity: 1,
      unit: 'pcs',
      optional: true,
      note: t(
        '1 slice of white bread, about 30 g, crust off',
        '1 felie de pâine albă, de circa 30 g, fără coajă',
      ),
    },
    {
      ingredient: 'still-water',
      quantity: 0.1,
      unit: 'l',
      optional: true,
      note: t('to soak the bread', 'pentru înmuiat pâinea'),
    },
    {
      ingredient: 'onion',
      quantity: 1,
      unit: 'pcs',
      note: t(
        'small, about 60 g, finely chopped',
        'mică, de circa 60 g, tocată mărunt',
      ),
    },
  ],
  steps: [
    {
      key: 'soak',
      text: t(
        'If you are using the bread, tear it into pieces and soak it in the cold water for 5 minutes.',
        'Dacă folosești pâine, rupe-o bucăți și înmoaie-o 5 minute în apa rece.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'chop',
      text: t(
        'Chop the onion very finely and set it aside. If you soaked bread, squeeze it hard in your fist until no more water drips out.',
        'Toacă ceapa foarte mărunt și las-o deoparte. Dacă ai înmuiat pâine, stoarce-o bine în pumn, până nu mai curge apă din ea.',
      ),
    },
    {
      key: 'beat-roe',
      text: t(
        'Put the roe in a deep bowl and pick out any stringy bits of membrane. Add half of the lemon juice and beat with a whisk (or a hand mixer on low) for 2 minutes, until the roe loosens and turns a shade lighter.',
        'Pune icrele într-un bol adânc și scoate eventualele bucăți de membrană. Adaugă jumătate din sucul de lămâie și bate cu telul (sau cu mixerul la viteză mică) 2 minute, până se desfac și se deschid puțin la culoare.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'drops',
      text: t(
        'Beating all the time, add 30 ml of the oil a few drops at a time, as for a mayonnaise. Wait until each addition has disappeared into the roe before the next. After about 3 minutes it should look thick and paler.',
        'Bătând continuu, adaugă 30 ml din ulei câteva picături odată, ca la maioneză. Așteaptă ca fiecare adaos să dispară în icre înainte de următorul. După circa 3 minute compoziția trebuie să fie groasă și mai deschisă la culoare.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'stream',
      text: t(
        'Beat in the squeezed bread, if using. Now pour in the remaining oil in a thin stream, beating without stopping, for about 7 minutes. The spread is ready when it is pale, fluffy and about twice the volume. If oil pools on top or the mixture turns shiny, greasy and grainy, it has split: stop pouring and see the Tip.',
        'Încorporează pâinea stoarsă, bătând, dacă o folosești. Acum toarnă restul uleiului într-un fir subțire, bătând fără oprire, circa 7 minute. Salata e gata când e deschisă la culoare, pufoasă și are aproape dublul volumului. Dacă uleiul se adună deasupra sau compoziția devine lucioasă, grasă și granulată, s-a tăiat: oprește turnarea și vezi sfatul.',
      ),
      timerSeconds: 420,
    },
    {
      key: 'season',
      text: t(
        'Stir in half of the onion. Taste and add the rest of the lemon juice a spoonful at a time until the salt is balanced. Do not add salt.',
        'Amestecă jumătate din ceapă. Gustă și adaugă restul sucului de lămâie câte o lingură, până se echilibrează sărătura. Nu mai adăuga sare.',
      ),
    },
    {
      key: 'chill',
      text: t(
        'Cover the bowl and chill for at least 30 minutes so the spread firms up. Scatter the remaining onion on top just before serving.',
        'Acoperă bolul și ține-l la frigider cel puțin 30 de minute, ca salata să se întărească. Presară deasupra restul de ceapă chiar înainte de servire.',
      ),
      timerSeconds: 1800,
    },
  ],
  tips: [
    t(
      'Salted roe is already very salty. Taste a pinch before you start, and balance with lemon rather than reaching for salt.',
      'Icrele sărate sunt deja foarte sărate. Gustă un vârf de linguriță înainte să începi și echilibrează cu lămâie, nu cu sare.',
    ),
    t(
      'Cured roe is usually eaten raw. Anyone who is pregnant or immunocompromised, older people and small children should skip it.',
      'Icrele sărate se mănâncă de obicei crude. Femeile însărcinate, persoanele cu imunitatea scăzută, cele în vârstă și copiii mici ar fi bine să evite icrele crude.',
    ),
    t(
      'Set the bowl on a damp cloth so it does not slide while you beat with one hand and pour with the other.',
      'Pune bolul pe un prosop umed ca să nu alunece, în timp ce bați cu o mână și torni cu cealaltă.',
    ),
    t(
      'Keep the bowl covered in the fridge and eat it within 2 to 3 days, or by the date on the roe if that comes first. Take out only what you will serve and put the bowl back at once; throw away spread that has stood at room temperature for more than 2 hours.',
      'Păstrează bolul acoperit la frigider și consumă conținutul în 2-3 zile, sau până la data de pe icre, dacă aceasta vine mai devreme. Scoate din frigider doar cât servești și pune bolul înapoi imediat; aruncă ce a stat la temperatura camerei mai mult de 2 ore.',
    ),
    t(
      'Instead of bread, some cooks bind the spread with 1 to 2 tablespoons of semolina soaked in a little hot water until swollen, then cooled before it is beaten in.',
      'În loc de pâine, unii leagă salata cu 1-2 linguri de griș înmuiat în puțină apă fierbinte până se umflă, apoi răcit înainte de a fi bătut în compoziție.',
    ),
  ],
  stepTips: [
    {
      step: 'stream',
      text: t(
        'To rescue a split spread, stop beating oil in. In a clean bowl, beat a spoonful of cold water (or a little squeezed bread), then beat the split mixture in a spoonful at a time. Once it is smooth again, carry on with the oil more slowly.',
        'Ca să repari o salată tăiată, nu mai adăuga ulei. Într-un bol curat bate o lingură de apă rece (sau puțină pâine stoarsă), apoi adaugă compoziția tăiată câte o lingură, bătând. Când s-a legat din nou, continuă cu uleiul, mai încet.',
      ),
    },
    {
      step: 'drops',
      text: t(
        'Be patient with the first spoonfuls of oil. Once the roe has taken them, the rest goes in much more easily.',
        'Ai răbdare cu primele linguri de ulei. După ce icrele le-au absorbit, restul intră mult mai ușor.',
      ),
    },
  ],
  nutritionNote: t(
    'Roe brings protein and some omega-3 fats, and the sunflower oil is mostly unsaturated. But cured roe is very salty, and about half of the bowl is oil, so it is energy-dense: serve a spoonful on bread or tomato rather than a plateful, and add raw vegetables for fibre.',
    'Icrele aduc proteine și ceva grăsimi omega-3, iar uleiul de floarea soarelui e în mare parte nesaturat. În schimb, icrele sărate sunt foarte sărate, iar aproape jumătate din bol e ulei, deci salata e foarte calorică: servește o lingură pe pâine sau pe roșie, nu o farfurie, și adaugă legume crude pentru fibre.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Country bread', 'Pâine de casă'),
      reason: t(
        'A mild, chewy crumb carries the salty spread and softens it.',
        'Miezul moale și dens ține bine salata sărată și îi îmblânzește gustul.',
      ),
      principle: 'complement_flavour',
      ingredient: 'country-bread',
    },
    {
      kind: 'food',
      label: t('Black olives', 'Măsline negre'),
      reason: t(
        'Their briny, slightly bitter bite echoes the sea flavour of the roe; keep to a few, as both are salty.',
        'Gustul lor sărat și ușor amărui se potrivește cu aroma de mare a icrelor; pune doar câteva, fiindcă ambele sunt sărate.',
      ),
      principle: 'complement_flavour',
      ingredient: 'olives',
    },
    {
      kind: 'food',
      label: t('Ripe tomato', 'Roșii coapte'),
      reason: t(
        'Juicy, slightly sour slices cut through the rich oil.',
        'Felii suculente și ușor acrișoare echilibrează grăsimea uleiului.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'tomato',
    },
    {
      kind: 'food',
      label: t(
        'Romanian aubergine spread (salată de vinete)',
        'Salată de vinete',
      ),
      reason: t(
        'Both are cold spreads put out together with bread on a Romanian table.',
        'Sunt două salate reci care se pun împreună, cu pâine, pe masa românească.',
      ),
      principle: 'regional_tradition',
      recipe: 'salata-de-vinete',
    },
    {
      kind: 'drink',
      label: t('Cold dry white wine', 'Vin alb sec, rece'),
      reason: t(
        'Its acidity cuts through the oil and refreshes the palate.',
        'Aciditatea lui echilibrează uleiul și împrospătează gustul.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'white-wine',
    },
  ],
  eatingMoments: [
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'A spoonful on bread with tomato and olives makes a quick cold plate.',
        'O lingură pe pâine, cu roșii și măsline, face repede o farfurie rece.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'good_for',
      reason: t(
        'Served cold from the fridge, and nothing to cook.',
        'Se servește rece, direct din frigider, și nu cere gătit.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Rich in oil and very salty, which sits heavily before bed.',
        'Bogată în ulei și foarte sărată, cade greu înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'salata-de-icre-greek',
      cuisine: 'greek',
      title: t(
        'Taramasalata (Greek fish-roe dip with bread and olive oil)',
        'Taramosalata (salată grecească de icre, cu pâine și ulei de măsline)',
      ),
      servings: 8,
      prepMinutes: 40,
      cookMinutes: 10,
      difficulty: 'easy',
      hideBaseTips: [2, 4],
      lines: [
        {
          ingredient: 'tarama',
          quantity: 100,
          unit: 'g',
          note: t('salt-cured roe', 'icre sărate'),
        },
        {
          ingredient: 'bread',
          quantity: 4,
          unit: 'pcs',
          note: t(
            '4 slices of stale white bread, about 120 g, crusts off',
            '4 felii de pâine albă veche, de circa 120 g, fără coajă',
          ),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('small, about 50 g, grated', 'mică, de circa 50 g, rasă'),
        },
        { ingredient: 'lemon-juice', quantity: 60, unit: 'ml' },
        { ingredient: 'olive-oil', quantity: 120, unit: 'ml' },
        {
          ingredient: 'sunflower-oil',
          quantity: 100,
          unit: 'ml',
          optional: true,
          note: t(
            'for a milder dip; or use 220 ml olive oil in all',
            'pentru un gust mai blând; sau folosește 220 ml de ulei de măsline în total',
          ),
        },
        {
          ingredient: 'still-water',
          quantity: 0.2,
          unit: 'l',
          note: t(
            '150 ml to soak the bread, up to 50 ml to loosen the dip',
            '150 ml pentru înmuiat pâinea, până la 50 ml pentru a subția crema',
          ),
        },
      ],
      steps: [
        {
          key: 'soak',
          text: t(
            'Tear the bread into pieces and soak it in 150 ml of the cold water for 5 minutes.',
            'Rupe pâinea bucăți și înmoaie-o 5 minute în 150 ml din apa rece.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'squeeze',
          text: t(
            'While the bread soaks, grate the onion. Then squeeze the bread hard in your fist until no more water drips out. It should feel like a damp, soft paste.',
            'Cât stă pâinea la înmuiat, dă ceapa pe răzătoare. Apoi stoarce pâinea bine în pumn, până nu mai curge apă din ea. Trebuie să rămână o pastă moale și umedă.',
          ),
        },
        {
          key: 'blend-roe',
          text: t(
            'Put the roe, the onion and 30 ml of the lemon juice in a food processor and blend for 30 seconds into a rough paste.',
            'Pune icrele, ceapa și 30 ml din sucul de lămâie în robotul de bucătărie și mixează 30 de secunde, până obții o pastă grosieră.',
          ),
          timerSeconds: 30,
        },
        {
          key: 'add-bread',
          text: t(
            'Add the squeezed bread, a handful at a time, and blend until the mixture is smooth and pale pink.',
            'Adaugă pâinea stoarsă, câte o mână, și mixează până compoziția e netedă și roz deschis.',
          ),
        },
        {
          key: 'oil',
          text: t(
            'With the motor running, pour in the oil in a thin stream, a few drops at a time at first, as for a mayonnaise. If oil pools on top or the dip turns greasy and grainy, it has split: stop pouring and see the Tip.',
            'Cu motorul pornit, toarnă uleiul într-un fir subțire, la început câteva picături odată, ca la maioneză. Dacă uleiul se adună deasupra sau crema devine grasă și granulată, s-a tăiat: oprește turnarea și vezi sfatul.',
          ),
        },
        {
          key: 'season',
          text: t(
            'Add the rest of the lemon juice a spoonful at a time, tasting each time. If the dip is stiff, loosen it with up to 50 ml of the cold water. Do not add salt.',
            'Adaugă restul sucului de lămâie câte o lingură, gustând de fiecare dată. Dacă crema e prea tare, subțiază-o cu până la 50 ml de apă rece. Nu adăuga sare.',
          ),
        },
        {
          key: 'chill',
          text: t(
            'Spoon into a bowl, cover and chill for at least 30 minutes before serving.',
            'Pune crema într-un bol, acoperă-l și ține-l la frigider cel puțin 30 de minute înainte de servire.',
          ),
          timerSeconds: 1800,
        },
      ],
      tips: [
        t(
          'Use bread that is a day or two old, with no crusts: fresh bread turns gluey when it is blended.',
          'Folosește pâine veche de o zi-două, fără coajă: pâinea proaspătă se lipește când o mixezi.',
        ),
      ],
      stepTips: [
        {
          step: 'oil',
          text: t(
            'To rescue a split dip, scrape it into a bowl and rinse out the processor. Put a spoonful of cold water in it, then, with the motor running, add the split dip back a spoonful at a time.',
            'Ca să repari crema tăiată, pune-o într-un bol și clătește robotul. Pune în el o lingură de apă rece, apoi, cu motorul pornit, adaugă crema tăiată înapoi câte o lingură.',
          ),
        },
      ],
      nutritionNote: t(
        'More bread than roe makes this milder and a little more filling than the Romanian spread, with some carbohydrate. Olive oil is mostly unsaturated, but the dip is still oil-rich and energy-dense, and the cured roe is very salty. Eat small amounts with raw vegetables for fibre.',
        'Cu mai multă pâine decât icre, salata e mai blândă și ceva mai săturătoare decât cea românească, fiindcă pâinea aduce și carbohidrați. Uleiul de măsline e în mare parte nesaturat, dar crema rămâne bogată în ulei și calorică, iar icrele sărate sunt foarte sărate. Mănâncă-o în porții mici, cu legume crude pentru fibre.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Warm pita bread', 'Lipie caldă'),
          reason: t(
            'Soft flatbread scoops up the dip and balances its salt.',
            'Cu lipia moale iei ușor crema, iar pâinea îi atenuează sărătura.',
          ),
          principle: 'complement_flavour',
          ingredient: 'pita',
        },
        {
          kind: 'food',
          label: t('Olives', 'Măsline'),
          reason: t(
            'Their briny bite echoes the sea flavour of the roe; keep to a few, as both are salty.',
            'Gustul lor sărat se potrivește cu aroma de mare a icrelor; pune doar câteva, fiindcă ambele sunt sărate.',
          ),
          principle: 'complement_flavour',
          ingredient: 'olives',
        },
        {
          kind: 'food',
          label: t('Cucumber', 'Castraveți'),
          reason: t(
            'Cool, crisp slices contrast with the soft, rich dip.',
            'Felii reci și crocante contrastează cu crema moale și bogată.',
          ),
          principle: 'contrast_texture',
          ingredient: 'cucumber',
        },
      ],
      eatingMoments: [
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Served cold, with pita and cucumber, for a light meal.',
            'Se servește rece, cu lipie și castraveți, pentru o masă ușoară.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'No cooking needed, and the bread makes it more filling.',
            'Nu cere gătit, iar pâinea o face mai săturătoare.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Oily and very salty, which sits heavily before bed.',
            'Grasă și foarte sărată, cade greu înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'salata-de-icre-scandinavian',
      cuisine: 'scandinavian',
      title: t(
        'Romsås (Swedish lumpfish-roe sauce with sour cream, red onion and dill)',
        'Romsås (sos suedez de icre de lump cu smântână, ceapă roșie și mărar)',
      ),
      servings: 6,
      prepMinutes: 40,
      cookMinutes: 5,
      difficulty: 'easy',
      hideBaseTips: [2, 4],
      lines: [
        { ingredient: 'lumpfish-roe', quantity: 100, unit: 'g' },
        { ingredient: 'sour-cream', quantity: 200, unit: 'g' },
        {
          ingredient: 'mayonnaise',
          quantity: 30,
          unit: 'g',
          optional: true,
          note: t('for a richer sauce', 'pentru un sos mai bogat'),
        },
        {
          ingredient: 'red-onion',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'small, about 50 g, very finely chopped',
            'mică, de circa 50 g, tocată foarte mărunt',
          ),
        },
        {
          ingredient: 'dill',
          quantity: 10,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        {
          ingredient: 'lemon-juice',
          quantity: 15,
          unit: 'ml',
          optional: true,
        },
        {
          ingredient: 'black-pepper',
          quantity: 0.5,
          unit: 'g',
          optional: true,
        },
      ],
      steps: [
        {
          key: 'chop',
          text: t(
            'Chop the red onion very finely and the dill finely.',
            'Toacă ceapa roșie foarte mărunt și mărarul mărunt.',
          ),
        },
        {
          key: 'base',
          text: t(
            'In a bowl, stir the sour cream with the mayonnaise (if using), the onion, the dill and the pepper until smooth.',
            'Într-un bol, amestecă smântâna cu maioneza (dacă o folosești), ceapa, mărarul și piperul, până se omogenizează.',
          ),
        },
        {
          key: 'fold',
          text: t(
            'Add the roe and fold it in with a spatula, using only 4 or 5 gentle turns, just until it is mixed in. Stirring harder breaks the eggs.',
            'Adaugă icrele și încorporează-le cu o spatulă, din 4-5 mișcări blânde, doar cât să se amestece. Dacă amesteci mai tare, se sparg boabele.',
          ),
        },
        {
          key: 'season',
          text: t(
            'Taste and add a little of the lemon juice if you like it sharper. Do not add salt: the roe already seasons the sauce.',
            'Gustă și adaugă puțin suc de lămâie, dacă îți place mai acrișor. Nu adăuga sare: icrele sărează deja sosul.',
          ),
        },
        {
          key: 'chill',
          text: t(
            'Cover and chill for 30 minutes so the flavours blend and the sauce firms up a little.',
            'Acoperă bolul și ține-l la frigider 30 de minute, ca aromele să se lege și sosul să se îngroașe puțin.',
          ),
          timerSeconds: 1800,
        },
      ],
      tips: [
        t(
          'Fold the roe in last and gently. The whole eggs are the point: they pop on the tongue.',
          'Adaugă icrele la sfârșit și amestecă blând. Boabele întregi sunt farmecul: pocnesc sub limbă.',
        ),
      ],
      stepTips: [
        {
          step: 'chop',
          text: t(
            'Chop the onion very small, so that no big raw piece overwhelms the delicate roe.',
            'Toacă ceapa foarte mărunt, ca să nu apese cu gustul ei peste icrele delicate.',
          ),
        },
      ],
      nutritionNote: t(
        'Roe adds protein, while the sour cream brings saturated fat and calcium, and the mayonnaise adds mostly unsaturated oil. It has less oil than the whipped spreads, but cured roe is very salty. Serve small spoonfuls on potatoes or crispbread, and add raw vegetables for fibre.',
        'Icrele adaugă proteine, smântâna aduce grăsimi saturate și calciu, iar maioneza adaugă în principal ulei nesaturat. Are mai puțin ulei decât salatele bătute, dar icrele sărate sunt foarte sărate. Servește linguri mici peste cartofi sau pâine crocantă și adaugă legume crude pentru fibre.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Crispbread', 'Pâine crocantă'),
          reason: t(
            'The dry crunch contrasts with the creamy sauce.',
            'Crocanța uscată contrastează cu sosul cremos.',
          ),
          principle: 'contrast_texture',
          ingredient: 'crispbread',
        },
        {
          kind: 'food',
          label: t('Boiled potatoes', 'Cartofi fierți'),
          reason: t(
            'Plain, warm potatoes soften the salt of the roe and the sour cream.',
            'Cartofii fierți simpli, calzi, atenuează sărătura icrelor și a smântânii.',
          ),
          principle: 'complement_flavour',
          ingredient: 'potato',
        },
        {
          kind: 'food',
          label: t('Poached salmon', 'Somon fiert în apă'),
          reason: t(
            'Mild, tender fish lets the salty roe and the sharp, creamy sauce stand out.',
            'Peștele fraged și delicat lasă icrele sărate și sosul cremos, acrișor, să iasă în față.',
          ),
          principle: 'complement_flavour',
          ingredient: 'salmon',
        },
        {
          kind: 'food',
          label: t('Radishes', 'Ridichi'),
          reason: t(
            'Crisp, peppery slices contrast with the soft sauce.',
            'Feliile crocante și iuți contrastează cu sosul moale.',
          ),
          principle: 'contrast_texture',
          ingredient: 'radish',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Made in minutes, with potatoes or crispbread, for a cold plate.',
            'Se face în câteva minute și, cu cartofi sau pâine crocantă, e o masă rece rapidă.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Served cold, and nothing to cook.',
            'Se servește rece și nu cere gătit.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Salty and rich in cream, which sits heavily before bed.',
            'Sărat și bogat în smântână, cade greu înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
