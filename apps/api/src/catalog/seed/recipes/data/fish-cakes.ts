import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Fish cakes base is the British-style cake: cod poached in milk and
// flaked, folded into dry mashed potato, chilled, crumbed and shallow-fried.
// Each Variant is a full Recipe with its own lines, steps and guidance; the
// base's Recipe-level Tips are inherited unless a Variant hides them.
export const fishCakes: BaseRecipeSeed = {
  slug: 'fish-cakes',
  title: t('Fish cakes', 'Chiftele de pește cu cartofi'),
  servings: 4,
  prepMinutes: 45,
  cookMinutes: 70,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'cod',
      quantity: 400,
      unit: 'g',
      note: t('skinless fillets', 'file fără piele'),
    },
    {
      ingredient: 'milk',
      quantity: 0.25,
      unit: 'l',
      note: t('for poaching', 'pentru fiert peștele'),
    },
    {
      ingredient: 'bay-leaves',
      quantity: 0.4,
      unit: 'g',
      optional: true,
      note: t('2 leaves', '2 foi'),
    },
    {
      ingredient: 'potato',
      quantity: 0.5,
      unit: 'kg',
      note: t('floury, peeled', 'făinoși, curățați'),
    },
    { ingredient: 'butter', quantity: 30, unit: 'g' },
    {
      ingredient: 'parsley',
      quantity: 20,
      unit: 'g',
      note: t('finely chopped', 'tocat mărunt'),
    },
    {
      ingredient: 'lemon',
      quantity: 1,
      unit: 'pcs',
      note: t(
        'zested, then cut into wedges to serve',
        'cu coaja rasă, apoi tăiată în felii pentru servit',
      ),
    },
    {
      ingredient: 'flour',
      quantity: 50,
      unit: 'g',
      note: t('for coating', 'pentru pane'),
    },
    {
      ingredient: 'eggs',
      quantity: 2,
      unit: 'pcs',
      note: t('beaten, for coating', 'bătute, pentru pane'),
    },
    {
      ingredient: 'breadcrumbs',
      quantity: 100,
      unit: 'g',
      note: t('for coating', 'pentru pane'),
    },
    {
      ingredient: 'sunflower-oil',
      quantity: 100,
      unit: 'ml',
      note: t('for shallow frying', 'pentru prăjit în ulei puțin'),
    },
    {
      ingredient: 'salt',
      quantity: 9,
      unit: 'g',
      note: t(
        '5 g for the potato water, the rest in the mix',
        '5 g pentru apa cartofilor, restul în compoziție',
      ),
    },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
  ],
  steps: [
    {
      key: 'peel',
      text: t(
        'Peel the potatoes and cut them into even chunks of about 4 cm. Put them in a pot, cover with cold water and add 5 g of the salt.',
        'Curăță cartofii și taie-i în bucăți egale de aproximativ 4 cm. Pune-i într-o oală, acoperă-i cu apă rece și adaugă 5 g din sare.',
      ),
    },
    {
      key: 'boil-potatoes',
      text: t(
        'Bring to the boil, then simmer for about 20 minutes, until a knife slides into a chunk with no resistance.',
        'Adu la fierbere, apoi fierbe la foc mic aproximativ 20 de minute, până când cuțitul intră în bucăți fără nicio rezistență.',
      ),
      timerSeconds: 1200,
    },
    {
      key: 'poach',
      text: t(
        'While the potatoes simmer, lay the cod in a lidded pan, add the milk and the bay leaves, and bring to a bare simmer. Cover and poach for 8 minutes, turning the fish halfway, until it is opaque all the way through and flakes easily with a fork. At the thickest part a probe thermometer should read 63 °C.',
        'Cât fierb cartofii, așază codul într-o tigaie cu capac, adaugă laptele și foile de dafin și adu la un clocot abia perceptibil. Acoperă și fierbe peștele 8 minute, întorcându-l la jumătate, până când e opac în toată grosimea și se desface ușor cu furculița. În partea cea mai groasă, termometrul trebuie să arate 63 °C.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'flake',
      text: t(
        'Lift the fish onto a plate with a slotted spoon and discard the milk and bay. Leave it to cool for 5 minutes, then flake it into large pieces, feeling for any stray bones.',
        'Scoate peștele pe o farfurie cu o lingură cu găuri și aruncă laptele și dafinul. Lasă-l să se răcească 5 minute, apoi desfă-l în bucăți mari, verificând cu degetele dacă au rămas oase mici.',
      ),
    },
    {
      key: 'mash',
      text: t(
        'Drain the potatoes well and return them to the hot, empty pot over low heat for 1 minute so the steam escapes. Mash them smooth with the butter and no milk, and leave to cool for 10 minutes.',
        'Scurge bine cartofii și pune-i înapoi în oala caldă și goală, la foc mic, 1 minut, ca să iasă aburii. Pasează-i fin cu untul, fără lapte, și lasă-i să se răcească 10 minute.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'mix',
      text: t(
        'Add the lemon zest, parsley, the remaining salt and the pepper to the mash, then fold in the flaked fish with a spatula, keeping some flakes visible.',
        'Adaugă în piure coaja de lămâie, pătrunjelul, restul de sare și piperul, apoi încorporează peștele desfăcut cu o spatulă, lăsând să se vadă bucățele de pește.',
      ),
    },
    {
      key: 'shape',
      text: t(
        'With damp hands, shape the mixture into 8 cakes about 2 cm thick and 8 cm across. Set them on a tray lined with baking paper.',
        'Cu mâinile umede, formează din compoziție 8 chiftele de aproximativ 2 cm grosime și 8 cm diametru. Așază-le pe o tavă tapetată cu hârtie de copt.',
      ),
    },
    {
      key: 'chill',
      text: t(
        'Chill the cakes in the fridge for 30 minutes, until firm to the touch.',
        'Ține chiftelele la frigider 30 de minute, până când sunt ferme la atingere.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'coat',
      text: t(
        'Put the flour, the beaten eggs and the breadcrumbs on three plates. Coat each cake in flour, then egg, then crumbs, pressing the crumbs on lightly, and return them to the tray.',
        'Pune făina, ouăle bătute și pesmetul pe trei farfurii. Tăvălește fiecare chiftea prin făină, apoi prin ou, apoi prin pesmet, apăsând ușor pesmetul, și pune-o înapoi pe tavă.',
      ),
    },
    {
      key: 'heat',
      text: t(
        'Heat the oil in a large frying pan over medium heat for about 3 minutes, until a few crumbs dropped in sizzle at once.',
        'Încinge uleiul într-o tigaie mare la foc mediu aproximativ 3 minute, până când câteva firimituri de pesmet puse în ulei sfârâie imediat.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'fry',
      text: t(
        'Lay 4 cakes in the oil and fry for 4 minutes, until the underside is deep golden.',
        'Pune 4 chiftele în ulei și prăjește-le 4 minute, până când partea de jos e auriu închis.',
      ),
      timerSeconds: 240,
    },
    {
      key: 'turn',
      text: t(
        'Turn the cakes carefully and fry for 4 minutes more, until golden all over and piping hot in the centre. Drain them on kitchen paper.',
        'Întoarce chiftelele cu grijă și prăjește-le încă 4 minute, până sunt aurii peste tot și fierbinți în centru. Scurge-le pe hârtie de bucătărie.',
      ),
      timerSeconds: 240,
    },
    {
      key: 'batch',
      text: t(
        'Fry the remaining 4 cakes the same way, adding a splash of oil if the pan has dried out. Serve hot with the lemon wedges.',
        'Prăjește celelalte 4 chiftele la fel, adăugând puțin ulei dacă tigaia s-a uscat. Servește fierbinte, cu felii de lămâie.',
      ),
    },
  ],
  tips: [
    t(
      'Keep the mash dry: steam the potatoes off in the pot and add no milk. Wet potato is the usual reason fish cakes slump or burst in the pan.',
      'Păstrează piureul uscat: lasă cartofii să elimine aburii în oală și nu adăuga lapte. Cartofii prea umezi sunt cauza obișnuită pentru care chiftelele se turtesc sau crapă în tigaie.',
    ),
    t(
      'You can shape and crumb the cakes up to a day ahead and keep them on a tray in the fridge. Fried from cold, they hold their shape better.',
      'Poți forma și pane chiftelele cu până la o zi înainte și le poți ține pe o tavă la frigider. Prăjite direct din frigider, își țin mai bine forma.',
    ),
    t(
      'Cod fillets often keep a line of pin bones near the thick end. Feel along the fillet and pull them out with tweezers before cooking.',
      'Fileurile de cod păstrează adesea un rând de oase fine lângă capătul gros. Pipăie fileul și scoate-le cu o pensetă înainte de gătit.',
    ),
  ],
  stepTips: [
    {
      step: 'mix',
      text: t(
        'Fold, do not beat. Overworked mash turns gluey and the fish breaks down to paste.',
        'Încorporează, nu bate. Piureul frământat prea mult devine lipicios și peștele se face pastă.',
      ),
    },
    {
      step: 'coat',
      text: t(
        'Use one hand for the flour and crumbs and the other for the egg, so your fingers do not clump up in breadcrumbs.',
        'Folosește o mână pentru făină și pesmet și cealaltă pentru ou, ca degetele să nu se umple de pesmet.',
      ),
    },
  ],
  nutritionNote: t(
    'Cod is lean and rich in protein, and the potato makes the cakes filling. The crumb coat soaks up frying oil, so use a shallow layer and drain well; the cakes are low in fibre, so serve them with a green salad or peas. The salt in the mix and the sauce adds up.',
    'Codul este slab și bogat în proteine, iar cartofii fac chiftelele săturătoare. Pesmetul absoarbe uleiul din prăjit, așa că folosește puțin ulei și scurge bine chiftelele; au puține fibre, așa că servește-le cu o salată verde sau cu mazăre. Sarea din compoziție și din sos se adună.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Tartar sauce', 'Sos tartar'),
      reason: t(
        'Its sharp pickle and caper tang cuts through the fried crumb.',
        'Aciditatea murăturilor și a caperelor taie din bogăția crustei prăjite.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'tartar-sauce',
    },
    {
      kind: 'food',
      label: t('Frozen peas', 'Mazăre congelată'),
      reason: t(
        'Sweet, fresh green peas add the fibre and colour the cakes lack.',
        'Mazărea verde, dulce și proaspătă, aduce fibrele și culoarea care lipsesc chiftelelor.',
      ),
      principle: 'complement_flavour',
      ingredient: 'frozen-peas',
    },
    {
      kind: 'food',
      label: t('Mixed salad leaves', 'Mix de salată'),
      reason: t(
        'Crisp, peppery leaves give a cool contrast to the hot, soft centre.',
        'Frunzele crocante și ușor iuți contrastează cu centrul cald și moale.',
      ),
      principle: 'contrast_texture',
      ingredient: 'mixed-salad',
    },
    {
      kind: 'drink',
      label: t('Dry white wine', 'Vin alb sec'),
      reason: t(
        'Its acidity refreshes the palate between bites of fried fish.',
        'Aciditatea lui împrospătează gustul între îmbucăturile de pește prăjit.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'white-wine',
    },
  ],
  eatingMoments: [
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'Protein and potato make a filling lunch that is not heavy.',
        'Proteinele și cartofii fac un prânz care satură fără să încarce.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Fish protein and potato carbohydrate help the body recover.',
        'Proteinele din pește și carbohidrații din cartofi ajută la refacere.',
      ),
    },
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'Hot, crisp and soft inside, a comforting plate for a chilly day.',
        'Fierbinți, crocante la exterior și moi în interior, sunt o masă reconfortantă într-o zi rece.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Fried food is heavy to digest just before bed.',
        'Mâncarea prăjită se digeră greu chiar înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'fish-cakes-scandinavian',
      cuisine: 'scandinavian',
      title: t(
        'Danish fish cakes (fiskefrikadeller)',
        'Chiftele daneze de pește (fiskefrikadeller)',
      ),
      servings: 4,
      prepMinutes: 45,
      cookMinutes: 30,
      difficulty: 'medium',
      hideBaseTips: [0, 1],
      lines: [
        {
          ingredient: 'cod',
          quantity: 500,
          unit: 'g',
          note: t(
            'skinless and boneless, very cold',
            'fără piele și fără oase, foarte rece',
          ),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely grated', 'dată pe răzătoarea fină'),
        },
        { ingredient: 'eggs', quantity: 1, unit: 'pcs' },
        { ingredient: 'flour', quantity: 40, unit: 'g' },
        { ingredient: 'milk', quantity: 0.1, unit: 'l' },
        {
          ingredient: 'dill',
          quantity: 15,
          unit: 'g',
          optional: true,
          note: t('finely chopped', 'tocat mărunt'),
        },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'zest of half in the mix, the rest cut into wedges to serve',
            'coaja de la jumătate rasă în compoziție, restul tăiat felii pentru servit',
          ),
        },
        {
          ingredient: 'butter',
          quantity: 40,
          unit: 'g',
          note: t('for frying', 'pentru prăjit'),
        },
        {
          ingredient: 'sunflower-oil',
          quantity: 20,
          unit: 'ml',
          note: t(
            'stops the butter from burning',
            'împiedică untul să se ardă',
          ),
        },
        { ingredient: 'salt', quantity: 8, unit: 'g' },
        { ingredient: 'white-pepper', quantity: 1, unit: 'g' },
        {
          ingredient: 'remoulade',
          quantity: 80,
          unit: 'g',
          note: t('to serve', 'pentru servit'),
        },
        {
          ingredient: 'rye-bread',
          quantity: 1,
          unit: 'pcs',
          optional: true,
          note: t('sliced, to serve', 'felii, pentru servit'),
        },
      ],
      steps: [
        {
          key: 'grate',
          text: t(
            'Cut the cold cod into 3 cm chunks and keep it in the fridge. Grate the onion on the fine side of a box grater into a large bowl, so none of its juice is lost.',
            'Taie codul rece în bucăți de 3 cm și ține-l la frigider. Dă ceapa pe partea fină a răzătorii într-un castron mare, ca să nu se piardă sucul.',
          ),
        },
        {
          key: 'mince',
          text: t(
            'Put the cod and the salt in a food processor and pulse in short bursts for 20 to 30 seconds, until you have a coarse, sticky paste with a few small flecks left. Do not run it until smooth.',
            'Pune codul și sarea în robotul de bucătărie și dă-i impulsuri scurte 20-30 de secunde, până obții o pastă grosieră și lipicioasă, cu mici bucățele rămase. Nu o face complet netedă.',
          ),
        },
        {
          key: 'mix',
          text: t(
            'Scrape the fish into the bowl with the onion. Add the egg, flour, white pepper, the zest of half the lemon and the dill, and stir until combined.',
            'Pune pasta de pește în castronul cu ceapă, ajutându-te de o spatulă. Adaugă oul, făina, piperul alb, coaja rasă de la jumătate de lămâie și mărarul și amestecă până se leagă.',
          ),
        },
        {
          key: 'milk',
          text: t(
            'Stir in the milk a little at a time. The mixture should be soft and wet, just firm enough to hold on a spoon.',
            'Adaugă laptele treptat, amestecând. Compoziția trebuie să fie moale și umedă, doar cât să țină pe lingură.',
          ),
        },
        {
          key: 'rest',
          text: t(
            'Cover the bowl and chill the mixture in the fridge for 30 minutes, so the flour swells and the raw fish stays cold.',
            'Acoperă castronul și ține compoziția la frigider 30 de minute, ca făina să se umfle și peștele crud să rămână rece.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'heat',
          text: t(
            'Heat half the butter and half the oil in a large frying pan over medium heat, until the butter foams and the foam begins to settle.',
            'Încinge jumătate din unt și jumătate din ulei într-o tigaie mare, la foc mediu, până când untul face spumă și spuma începe să se așeze.',
          ),
        },
        {
          key: 'fry',
          text: t(
            'Spoon 4 oval cakes of about 2 heaped tablespoons each (about 65 g) into the pan, flatten them slightly, and fry for 4 minutes, until the underside is golden brown.',
            'Pune în tigaie 4 chiftele ovale, câte aproximativ 2 linguri pline fiecare (circa 65 g), aplatizează-le ușor și prăjește-le 4 minute, până când partea de jos e aurie.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'turn',
          text: t(
            'Turn the cakes gently and fry for 3 minutes more, until golden and springy. Cut the first one open: it should be white and opaque in the centre, with no translucent patches (63 °C).',
            'Întoarce chiftelele cu grijă și prăjește-le încă 3 minute, până sunt aurii și elastice. Taie prima chiftea: în centru trebuie să fie albă și opacă, fără zone translucide (63 °C).',
          ),
          timerSeconds: 180,
        },
        {
          key: 'batches',
          text: t(
            'Fry the remaining mixture in two more batches of 4, so you have about 12 cakes in all, adding the rest of the butter and oil as needed and wiping the pan if any bits have burnt.',
            'Prăjește restul compoziției în încă două serii de câte 4, ca să ai în total aproximativ 12 chiftele, adăugând restul de unt și ulei după nevoie și ștergând tigaia dacă s-au ars resturi.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Serve warm with the remoulade, the lemon wedges and sliced rye bread.',
            'Servește calde, cu remuladă, felii de lămâie și felii de pâine de secară.',
          ),
        },
      ],
      tips: [
        t(
          'Raw fish cannot be tasted, so cook one small spoonful first and adjust the salt before you fry the rest.',
          'Peștele crud nu se poate gusta, așa că prăjește mai întâi o lingurică de compoziție și corectează sarea înainte să prăjești restul.',
        ),
      ],
      stepTips: [
        {
          step: 'mince',
          text: t(
            'Pulse briefly: overworked fish paste turns tough and rubbery. Keep the fish in the fridge until the moment you process it.',
            'Dă-i impulsuri scurte: pasta de pește prelucrată prea mult devine tare și cauciucată. Ține peștele la frigider până în clipa în care îl prelucrezi.',
          ),
        },
      ],
      nutritionNote: t(
        'Lean cod gives plenty of protein with little fat, and there is no breadcrumb coat. The butter adds saturated fat, and the remoulade is rich and salty, so use it sparingly. Serve with rye bread or boiled potatoes for carbohydrate and a salad for fibre.',
        'Codul slab aduce multe proteine cu puține grăsimi, iar chiftelele nu au pane. Untul adaugă grăsimi saturate, iar remulada este bogată și sărată, așa că folosește-o cu măsură. Servește cu pâine de secară sau cartofi fierți pentru carbohidrați și cu o salată pentru fibre.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Boiled potatoes', 'Cartofi fierți'),
          reason: t(
            'Plain, soft potatoes balance the savoury fish and soak up the sauce.',
            'Cartofii fierți, simpli și moi, echilibrează gustul peștelui și absorb sosul.',
          ),
          principle: 'complement_flavour',
          ingredient: 'potato',
        },
        {
          kind: 'food',
          label: t('Cucumber', 'Castraveți'),
          reason: t(
            'Cool, crisp slices contrast with the warm, soft fish cakes.',
            'Felii reci și crocante contrastează cu chiftelele calde și moi.',
          ),
          principle: 'contrast_texture',
          ingredient: 'cucumber',
        },
        {
          kind: 'drink',
          label: t('Beer', 'Bere'),
          reason: t(
            'Its carbonation and light bitterness refresh the palate between bites.',
            'Bulele și amăreala ușoară a berii împrospătează gustul între îmbucături.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Light, high in protein, and good on rye bread.',
            'Ușoare, bogate în proteine și se potrivesc bine pe pâine de secară.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Lean fish protein supports recovery; add bread or potatoes for carbohydrate.',
            'Proteinele din pește slab ajută la refacere; adaugă pâine sau cartofi pentru carbohidrați.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Pan-fried in butter, which is heavy just before bed.',
            'Sunt prăjite în unt, ceea ce încarcă stomacul chiar înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'fish-cakes-portuguese',
      cuisine: 'portuguese',
      title: t(
        'Portuguese salt cod cakes (pastéis de bacalhau)',
        'Chiftele portugheze de bacalău (pastéis de bacalhau)',
      ),
      servings: 4,
      prepMinutes: 2190,
      cookMinutes: 65,
      difficulty: 'medium',
      hideBaseTips: [1],
      lines: [
        {
          ingredient: 'salt-cod',
          quantity: 300,
          unit: 'g',
          note: t(
            'dried weight, soaked 24 to 48 hours',
            'greutate uscată, înmuiat 24-48 de ore',
          ),
        },
        {
          ingredient: 'potato',
          quantity: 0.5,
          unit: 'kg',
          note: t('floury, peeled', 'făinoși, curățați'),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('very finely chopped', 'tocată foarte mărunt'),
        },
        {
          ingredient: 'parsley',
          quantity: 20,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        { ingredient: 'eggs', quantity: 4, unit: 'pcs' },
        {
          ingredient: 'nutmeg',
          quantity: 0.5,
          unit: 'g',
          optional: true,
          note: t('freshly grated', 'proaspăt rasă'),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        {
          ingredient: 'sunflower-oil',
          quantity: 1500,
          unit: 'ml',
          note: t('for deep-frying', 'pentru prăjit în ulei mult'),
        },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          optional: true,
          note: t('cut into wedges, to serve', 'tăiată felii, pentru servit'),
        },
      ],
      steps: [
        {
          key: 'soak',
          text: t(
            'Rinse the salt cod under cold water, then put it in a large bowl and cover it generously with cold water. Keep the bowl in the fridge and change the water every 6 to 8 hours. Soak for 24 hours for thin pieces and up to 48 hours for thick ones.',
            'Clătește bacalăul sub apă rece, apoi pune-l într-un castron mare și acoperă-l generos cu apă rece. Ține castronul la frigider și schimbă apa din 6 în 8 ore. Înmoaie 24 de ore bucățile subțiri și până la 48 de ore pe cele groase.',
          ),
          timerSeconds: 28800,
        },
        {
          key: 'peel',
          text: t(
            'Peel the potatoes and cut them into even chunks of about 4 cm. Put them in a pot and cover with cold water, without salt.',
            'Curăță cartofii și taie-i în bucăți egale de aproximativ 4 cm. Pune-i într-o oală și acoperă-i cu apă rece, fără sare.',
          ),
        },
        {
          key: 'boil-potatoes',
          text: t(
            'Bring to the boil, then simmer for about 20 minutes, until a knife slides into a chunk with no resistance.',
            'Adu la fierbere, apoi fierbe la foc mic aproximativ 20 de minute, până când cuțitul intră în bucăți fără nicio rezistență.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'poach',
          text: t(
            'While the potatoes simmer, put the soaked cod in a pot of fresh cold water, bring it to a gentle simmer and cook for 10 minutes, until it is opaque and flakes easily with a fork.',
            'Cât fierb cartofii, pune bacalăul înmuiat într-o oală cu apă proaspătă și rece, adu-l la un clocot ușor și fierbe-l 10 minute, până când e opac și se desface ușor cu furculița.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'shred',
          text: t(
            'Lift out the cod and, once cool enough to handle, remove the skin and every bone. Shred the flesh very finely with your fingers, then taste a flake: it should be pleasantly salty, not harsh.',
            'Scoate bacalăul și, când poate fi atins, scoate pielea și toate oasele. Desfă carnea foarte mărunt cu degetele, apoi gustă o fărâmă: trebuie să fie plăcut sărată, nu aspră.',
          ),
        },
        {
          key: 'mash',
          text: t(
            'Drain the potatoes well and return them to the hot, empty pot over low heat for 1 minute so the steam escapes. Press them through a ricer or mash until completely smooth, and leave to cool for 10 minutes.',
            'Scurge bine cartofii și pune-i înapoi în oala caldă și goală, la foc mic, 1 minut, ca să iasă aburii. Treci-i prin presa de cartofi sau pasează-i până sunt complet fini și lasă-i să se răcească 10 minute.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'mix',
          text: t(
            'Mix the shredded cod, mash, onion, parsley, nutmeg and pepper in a large bowl. Beat in 3 of the eggs one at a time, beating well after each. Add the fourth only if the mixture is stiff, until it is light and firm enough to hold its shape between two spoons.',
            'Amestecă bacalăul desfăcut, piureul, ceapa, pătrunjelul, nucșoara și piperul într-un castron mare. Adaugă 3 dintre ouă unul câte unul, bătând bine compoziția după fiecare. Adaugă-l pe al patrulea doar dacă e tare, până când compoziția e pufoasă și își ține forma între două linguri.',
          ),
        },
        {
          key: 'heat',
          text: t(
            'Pour the oil into a heavy pot about 20 cm wide and at least 12 cm deep, so it comes no more than halfway up. Heat to 180 °C on a thermometer, about 8 minutes. The oil is ready when a pinch of the mixture rises and sizzles at once. Keep a lid or baking tray beside the pot: if the oil smokes, turn off the heat, and if it catches fire, cover it and never use water.',
            'Toarnă uleiul într-o oală grea de aproximativ 20 cm lățime și cel puțin 12 cm înălțime, astfel încât să ajungă cel mult la jumătate. Încălzește-l la 180 °C pe termometru, aproximativ 8 minute. Uleiul e gata când o fărâmă de compoziție urcă la suprafață și sfârâie imediat. Ține un capac sau o tavă lângă oală: dacă uleiul scoate fum, oprește focul, iar dacă ia foc, acoperă-l și nu folosi niciodată apă.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'shape',
          text: t(
            'Dip two dessert spoons in a little oil. Scoop up the mixture with one and pass it between the two spoons several times to make a smooth oval quenelle.',
            'Înmoaie două linguri de desert într-un pic de ulei. Ia compoziție cu una și trece-o de mai multe ori între cele două linguri, ca să iasă o chifteluță ovală și netedă (quenelle).',
          ),
        },
        {
          key: 'fry',
          text: t(
            'Lower 4 quenelles into the oil with the spoon, close to the surface and away from you, and fry for 3 minutes, turning them once, until deep golden and hot through. Never leave the pot unattended.',
            'Coboară 4 chifteluțe în ulei cu lingura, aproape de suprafață și în direcția opusă ție, și prăjește-le 3 minute, întorcându-le o dată, până când sunt auriu închis și fierbinți în centru. Nu lăsa oala nesupravegheată.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'drain',
          text: t(
            'Lift them out with a slotted spoon onto kitchen paper. Check the oil is back at 180 °C and fry the rest in batches of 4, until you have about 24 pastéis. Serve hot, with lemon wedges. Let the oil cool completely in the pot before you move or strain it.',
            'Scoate-le cu o lingură cu găuri pe hârtie de bucătărie. Verifică dacă uleiul a revenit la 180 °C și prăjește restul în serii de câte 4, până obții aproximativ 24 de pastéis. Servește fierbinți, cu felii de lămâie. Lasă uleiul să se răcească complet în oală înainte să-l muți sau să-l strecori.',
          ),
        },
      ],
      tips: [
        t(
          'Fry one test quenelle first. If the oil is too cool the quenelle soaks up fat, and if the mix is too wet it falls apart; adjust before frying the rest.',
          'Prăjește mai întâi o chifteluță de probă. Dacă uleiul e prea rece, chifteluța absoarbe grăsime, iar dacă amestecul e prea umed, se desface; corectează înainte să prăjești restul.',
        ),
        t(
          'Fry in small batches. Too many at once cool the oil, and the pastéis turn greasy instead of crisp.',
          'Prăjește în serii mici. Prea multe deodată răcesc uleiul, iar pastéis ies unsuroase, nu crocante.',
        ),
      ],
      stepTips: [
        {
          step: 'soak',
          text: t(
            'Taste a cooked flake before you stop soaking. If it is still harshly salty, soak for 8 more hours.',
            'Gustă o fărâmă fiartă înainte să oprești înmuierea. Dacă e încă prea sărată, mai înmoaie 8 ore.',
          ),
        },
      ],
      nutritionNote: t(
        'Salt cod is a dense source of protein, and the potato adds carbohydrate. It stays salty even after soaking, and deep-frying adds a lot of fat, so keep to a few per serving and drain well. Serve with a salad or greens for fibre.',
        'Bacalăul sărat este o sursă concentrată de proteine, iar cartofii aduc carbohidrați. Rămâne sărat chiar și după înmuiere, iar prăjirea în ulei mult adaugă multe grăsimi, așa că mănâncă doar câteva și scurge-le bine. Servește cu salată sau verdețuri pentru fibre.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Mixed salad leaves', 'Mix de salată'),
          reason: t(
            'Crisp, fresh leaves give a light contrast to the fried, salty quenelles.',
            'Frunzele crocante și proaspete contrastează ușor cu chifteluțele prăjite și sărate.',
          ),
          principle: 'contrast_texture',
          ingredient: 'mixed-salad',
        },
        {
          kind: 'food',
          label: t('Tomato', 'Roșii'),
          reason: t(
            'Its juicy acidity cuts the richness of the fried cod and potato.',
            'Aciditatea suculentă a roșiilor taie din bogăția bacalăului și a cartofilor prăjiți.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'tomato',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'A crisp, dry white refreshes the palate between salty, fried bites.',
            'Un vin alb sec și proaspăt împrospătează gustul între îmbucăturile sărate și prăjite.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'white-wine',
        },
        {
          kind: 'drink',
          label: t('Beer', 'Bere'),
          reason: t(
            'Cold, carbonated beer cleanses the palate after fried, salty food.',
            'Berea rece și acidulată curăță gustul după mâncarea prăjită și sărată.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'A few small pastéis with salad make a satisfying lunch.',
            'Câteva pastéis mici, cu salată, fac un prânz satisfăcător.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Cod protein and potato carbohydrate help recovery; mind the salt.',
            'Proteinele din bacalău și carbohidrații din cartofi ajută la refacere; ai grijă la sare.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Deep-fried and salty, which sits heavy before bed.',
            'Prăjite în ulei mult și sărate, încarcă stomacul înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
