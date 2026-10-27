import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Vegetable soup base is a clear, vegetarian soup: onion, carrot, celery and
// leek softened in oil, then potato, green beans and courgette simmered in
// vegetable stock. The Variants are a smooth French potage, a Finnish summer
// soup cooked in milk, and a Scottish broth of lamb, barley and split peas.
// The base's Recipe-level Tips are inherited.
export const vegetableSoup: BaseRecipeSeed = {
  slug: 'vegetable-soup',
  title: t('Vegetable soup', 'Supă de legume'),
  servings: 6,
  prepMinutes: 20,
  cookMinutes: 45,
  difficulty: 'easy',
  lines: [
    { ingredient: 'olive-oil', quantity: 45, unit: 'ml' },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('finely diced', 'tăiate mărunt'),
    },
    {
      ingredient: 'leek',
      quantity: 200,
      unit: 'g',
      note: t(
        'white and pale green part, halved, washed and sliced',
        'partea albă și verde-deschis, tăiată în două, spălată și feliată',
      ),
    },
    {
      ingredient: 'carrot',
      quantity: 250,
      unit: 'g',
      note: t('diced 1 cm', 'tăiați cubulețe de 1 cm'),
    },
    {
      ingredient: 'celery',
      quantity: 150,
      unit: 'g',
      note: t('diced 1 cm', 'tăiată cubulețe de 1 cm'),
    },
    {
      ingredient: 'garlic',
      quantity: 10,
      unit: 'g',
      note: t('2 cloves, minced', '2 căței, tocați mărunt'),
    },
    {
      ingredient: 'potato',
      quantity: 0.4,
      unit: 'kg',
      note: t('diced 1.5 cm', 'tăiați cubulețe de 1,5 cm'),
    },
    {
      ingredient: 'vegetable-stock',
      quantity: 2000,
      unit: 'ml',
      note: t('hot', 'fierbinte'),
    },
    { ingredient: 'bay-leaves', quantity: 0.4, unit: 'g' },
    {
      ingredient: 'thyme',
      quantity: 4,
      unit: 'g',
      note: t('about 6 sprigs', 'aproximativ 6 crenguțe'),
    },
    {
      ingredient: 'green-beans',
      quantity: 200,
      unit: 'g',
      note: t(
        'trimmed, cut in 2 cm pieces',
        'curățată, tăiată în bucăți de 2 cm',
      ),
    },
    {
      ingredient: 'zucchini',
      quantity: 1,
      unit: 'pcs',
      note: t(
        'about 250 g, diced 1.5 cm',
        'de circa 250 g, tăiat cubulețe de 1,5 cm',
      ),
    },
    { ingredient: 'frozen-peas', quantity: 150, unit: 'g' },
    {
      ingredient: 'parsley',
      quantity: 15,
      unit: 'g',
      note: t('chopped', 'tocat'),
    },
    { ingredient: 'salt', quantity: 3, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
  ],
  steps: [
    {
      key: 'soften',
      text: t(
        'Warm the olive oil in a large pot over medium-low heat. Add the onions, leek, carrots and celery and cook, stirring now and then, for 10 minutes, until soft and glossy but not browned.',
        'Încălzește uleiul de măsline într-o oală mare, la foc mic-mediu. Adaugă ceapa, prazul, morcovii și țelina și gătește 10 minute, amestecând din când în când, până se înmoaie și devin lucioase, fără să se rumenească.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'garlic',
      text: t(
        'Stir in the garlic and cook for 1 minute, until it smells fragrant.',
        'Adaugă usturoiul și gătește 1 minut, până se simte aroma.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'stock',
      text: t(
        'Add the potatoes, hot stock, bay leaves and thyme. Cover and bring to the boil over high heat, then lower the heat so it bubbles gently.',
        'Adaugă cartofii, supa fierbinte de legume, foile de dafin și cimbrul. Acoperă și adu la fierbere la foc mare, apoi redu focul ca supa să fiarbă domol.',
      ),
    },
    {
      key: 'simmer',
      text: t(
        'Simmer, partly covered, for 10 minutes.',
        'Fierbe la foc mic, cu capacul întredeschis, 10 minute.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'greens',
      text: t(
        'Add the green beans and courgette and simmer for 10 minutes more, until the potato is soft all the way through and the beans give easily when bitten.',
        'Adaugă fasolea verde și dovleceii și mai fierbe 10 minute, până când cartoful e moale în interior, iar fasolea verde e fragedă.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'peas',
      text: t(
        'Stir in the frozen peas and simmer for 4 minutes, until they are hot and tender.',
        'Adaugă mazărea congelată și fierbe 4 minute, până se încălzește și se fragezește.',
      ),
      timerSeconds: 240,
    },
    {
      key: 'finish',
      text: t(
        'Take out the bay leaves and thyme stems. Stir in the parsley and pepper, then taste and add salt if needed. Serve hot.',
        'Scoate foile de dafin și tulpinile de cimbru. Adaugă pătrunjelul și piperul, gustă și sărează dacă e nevoie. Servește fierbinte.',
      ),
    },
  ],
  tips: [
    t(
      'Cut the vegetables to a similar size so they soften at the same pace.',
      'Taie legumele de mărimi apropiate, ca să se înmoaie în același ritm.',
    ),
    t(
      'Cool leftovers within 2 hours and keep them in the fridge for up to 3 days. Reheat gently until steaming hot.',
      'Lasă resturile să se răcească în maximum 2 ore și păstrează-le la frigider cel mult 3 zile. Reîncălzește-le la foc mic, până scot abur.',
    ),
    t(
      'Stock is already salty, so hold back the salt until the end and season to taste.',
      'Supa concentrată de legume este deja sărată, așa că sărează abia la sfârșit, după gust.',
    ),
  ],
  stepTips: [
    {
      step: 'soften',
      text: t(
        'Keep the heat gentle so the vegetables sweat rather than brown; browning turns a clear, light soup dull and sweet.',
        'Ține focul domol, ca legumele să se înmoaie în loc să se rumenească; rumenirea întunecă o supă limpede și o face prea dulce.',
      ),
    },
    {
      step: 'soften',
      text: t(
        'Leeks hide grit between their layers: slice them first, then swish them in a bowl of water and lift them out.',
        'Prazul ține nisip între foi: feliază-l întâi, apoi mișcă-l într-un castron cu apă și scoate-l cu mâna.',
      ),
    },
  ],
  nutritionNote: t(
    'Full of vegetables and fibre for little fat, and the olive oil is mostly unsaturated. It is low in protein and not very filling alone, so serve it with bread, and stock can make it salty, so season at the end.',
    'Plină de legume și fibre, cu puține grăsimi, iar uleiul de măsline e în mare parte nesaturat. Are puține proteine și singură nu satură prea mult, așa că servește-o cu pâine, iar supa concentrată o poate face sărată, așa că sărează la final.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Country bread', 'Pâine de casă'),
      reason: t(
        'A crusty slice gives the soft vegetables something to bite and mops up the broth.',
        'O felie cu crustă dă legumelor moi ceva de mestecat și șterge supa din farfurie.',
      ),
      principle: 'contrast_texture',
      ingredient: 'country-bread',
    },
    {
      kind: 'food',
      label: t('Grated Parmesan', 'Parmezan ras'),
      reason: t(
        'Its salty, nutty depth fills out a light vegetable broth.',
        'Gustul lui sărat, de nucă, dă adâncime unei supe ușoare de legume.',
      ),
      principle: 'complement_flavour',
      ingredient: 'parmesan',
    },
    {
      kind: 'drink',
      label: t('Dry white wine', 'Vin alb sec'),
      reason: t(
        'Its crisp acidity refreshes the palate against the sweet carrots and leeks.',
        'Aciditatea lui proaspătă răcorește gustul după morcovii și prazul dulci.',
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
        'Light and quick to eat, with plenty of vegetables.',
        'Ușoară și rapidă, cu multe legume.',
      ),
    },
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot bowl warms you through without feeling heavy.',
        'Un castron fierbinte te încălzește fără să cadă greu.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'good_for',
      reason: t(
        'Gentle on the stomach before bed.',
        'Blândă cu stomacul înainte de culcare.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'A large bowl of fibre-rich vegetables and liquid sits in the stomach during exercise.',
        'Un castron mare de legume bogate în fibre și lichid rămâne în stomac în timpul efortului.',
      ),
    },
  ],
  variants: [
    {
      slug: 'vegetable-soup-french',
      cuisine: 'french',
      title: t(
        'Potage de légumes (French blended vegetable soup)',
        'Potage de légumes (supă franțuzească de legume, pasată)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 45,
      difficulty: 'easy',
      hideBaseTips: [2],
      lines: [
        { ingredient: 'butter', quantity: 30, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('sliced', 'feliată'),
        },
        {
          ingredient: 'leek',
          quantity: 300,
          unit: 'g',
          note: t(
            'white and pale green part, halved, washed and sliced',
            'partea albă și verde-deschis, tăiată în două, spălată și feliată',
          ),
        },
        {
          ingredient: 'carrot',
          quantity: 200,
          unit: 'g',
          note: t('sliced', 'tăiați rondele'),
        },
        {
          ingredient: 'celeriac',
          quantity: 150,
          unit: 'g',
          note: t('peeled, diced 2 cm', 'curățată, tăiată cuburi de 2 cm'),
        },
        {
          ingredient: 'potato',
          quantity: 0.3,
          unit: 'kg',
          note: t('peeled, diced 2 cm', 'curățați, tăiați cuburi de 2 cm'),
        },
        { ingredient: 'still-water', quantity: 1, unit: 'l' },
        { ingredient: 'salt', quantity: 5, unit: 'g' },
        { ingredient: 'white-pepper', quantity: 0.5, unit: 'g' },
        {
          ingredient: 'sour-cream',
          quantity: 60,
          unit: 'g',
          note: t(
            'crème fraîche, or full-fat smântână',
            'crème fraîche sau smântână grasă',
          ),
        },
        {
          ingredient: 'parsley',
          quantity: 10,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
      ],
      steps: [
        {
          key: 'sweat',
          text: t(
            'Melt the butter in a large pot over low heat. Add the onion, leek and carrot, cover and cook for 10 minutes, stirring now and then, until soft but not browned.',
            'Topește untul într-o oală mare, la foc mic. Adaugă ceapa, prazul și morcovii, acoperă și gătește 10 minute, amestecând din când în când, până se înmoaie, fără să se rumenească.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'water',
          text: t(
            'Add the celeriac, potato, water and salt. Bring to the boil over high heat, then lower the heat.',
            'Adaugă țelina, cartofii, apa și sarea. Adu la fierbere la foc mare, apoi redu focul.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Simmer, partly covered, for 20 minutes, until a knife tip slides into the celeriac and potato without resistance.',
            'Fierbe la foc mic, cu capacul întredeschis, 20 de minute, până când vârful unui cuțit intră fără rezistență în țelină și cartof.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'blend',
          text: t(
            'Remove the pot from the heat and blend the soup with a stick blender for 2 to 3 minutes, until completely smooth. Add a little hot water if it is thicker than single cream.',
            'Ia oala de pe foc și pasează supa cu blenderul vertical 2-3 minute, până devine complet fină. Dacă e mai groasă decât smântâna lichidă, adaugă puțină apă fierbinte.',
          ),
        },
        {
          key: 'reheat',
          text: t(
            'Warm the soup over low heat for about 3 minutes, without letting it boil, then take it off the heat.',
            'Încălzește supa la foc mic aproximativ 3 minute, fără să fiarbă, apoi ia-o de pe foc.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'finish',
          text: t(
            'Stir in the crème fraîche and white pepper, then taste and add salt if needed. Ladle into bowls and scatter with the parsley.',
            'Amestecă crème fraîche și piperul alb, apoi gustă și sărează dacă e nevoie. Toarnă în boluri și presară pătrunjelul.',
          ),
        },
      ],
      tips: [
        t(
          'For a silkier soup, pass it through a fine sieve after blending, pressing with a ladle.',
          'Pentru o supă mai fină, strecoar-o după pasare printr-o sită deasă, apăsând cu un polonic.',
        ),
      ],
      stepTips: [
        {
          step: 'blend',
          text: t(
            'If you use a jug blender, fill it no more than half, hold a towel over the lid and blend in batches; hot soup expands and can spray.',
            'Dacă folosești un blender cu vas, umple-l cel mult pe jumătate, ține un prosop peste capac și pasează pe rând; supa fierbinte se dilată și poate sări.',
          ),
        },
        {
          step: 'finish',
          text: t(
            'Keep the soup below the boil once the cream is in; smântână or sour cream can split if boiled.',
            'Nu mai fierbe supa după ce ai adăugat smântâna; smântâna obișnuită se poate tăia dacă fierbe.',
          ),
        },
      ],
      nutritionNote: t(
        'Blending keeps all the fibre of the vegetables, and the potato makes it filling. The butter and crème fraîche add saturated fat, so keep the spoonful small. It is low in protein, so add bread with cheese or an egg to round it out.',
        'Pasarea păstrează toate fibrele legumelor, iar cartofii o fac săturătoare. Untul și crème fraîche aduc grăsimi saturate, așa că pune o lingură mică. Are puține proteine, așa că servește-o cu pâine cu brânză sau cu un ou.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Baguette', 'Baghetă'),
          reason: t(
            'Crisp crust against a smooth soup gives every spoonful a contrast.',
            'Crusta crocantă lângă o supă fină dă fiecărei linguri un contrast.',
          ),
          principle: 'contrast_texture',
          ingredient: 'baguette',
        },
        {
          kind: 'food',
          label: t('Grated Gruyère', 'Gruyère ras'),
          reason: t(
            'Its nutty, salty flavour suits the sweet, mild vegetables.',
            'Gustul lui sărat, de nucă, se potrivește cu legumele dulci și blânde.',
          ),
          principle: 'complement_flavour',
          ingredient: 'gruyere',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Crisp acidity cuts through the butter and cream.',
            'Aciditatea proaspătă taie bogăția untului și a smântânii.',
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
            'A smooth bowl with bread makes an easy lunch.',
            'Un castron de supă fină, cu pâine, face un prânz ușor.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t('Warming and comforting.', 'Încălzește și alină.'),
        },
      ],
    },
    {
      slug: 'vegetable-soup-finnish',
      cuisine: 'finnish',
      title: t(
        'Kesäkeitto (Finnish summer vegetable soup with milk)',
        'Kesäkeitto (supă finlandeză de legume de vară, cu lapte)',
      ),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 35,
      difficulty: 'easy',
      hideBaseTips: [2],
      lines: [
        {
          ingredient: 'potato',
          quantity: 0.4,
          unit: 'kg',
          note: t(
            'new potatoes, scrubbed, skin on, cut in 1.5 cm pieces',
            'cartofi noi, spălați bine, cu coajă, tăiați în bucăți de 1,5 cm',
          ),
        },
        {
          ingredient: 'carrot',
          quantity: 200,
          unit: 'g',
          note: t('diced 1 cm', 'tăiați cubulețe de 1 cm'),
        },
        { ingredient: 'still-water', quantity: 0.6, unit: 'l' },
        { ingredient: 'salt', quantity: 5, unit: 'g' },
        {
          ingredient: 'cauliflower',
          quantity: 200,
          unit: 'g',
          note: t('small florets', 'buchețele mici'),
        },
        {
          ingredient: 'green-beans',
          quantity: 100,
          unit: 'g',
          note: t(
            'trimmed, cut in 2 cm pieces',
            'curățată, tăiată în bucăți de 2 cm',
          ),
        },
        {
          ingredient: 'fresh-peas',
          quantity: 100,
          unit: 'g',
          note: t('shelled', 'decojită'),
        },
        {
          ingredient: 'spinach',
          quantity: 50,
          unit: 'g',
          optional: true,
          note: t('roughly chopped', 'tocat grosier'),
        },
        { ingredient: 'milk', quantity: 0.75, unit: 'l' },
        { ingredient: 'flour', quantity: 25, unit: 'g' },
        { ingredient: 'butter', quantity: 30, unit: 'g' },
        {
          ingredient: 'dill',
          quantity: 20,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'white-pepper',
          quantity: 0.5,
          unit: 'g',
          optional: true,
        },
      ],
      steps: [
        {
          key: 'roots',
          text: t(
            'Put the potatoes, carrots, water and salt in a large pot. Cover and bring to the boil over high heat, then lower the heat and simmer for 10 minutes, until the potato is almost tender.',
            'Pune cartofii, morcovii, apa și sarea într-o oală mare. Acoperă și adu la fierbere la foc mare, apoi redu focul și fierbe 10 minute, până când cartofii sunt aproape fragezi.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'cauliflower',
          text: t(
            'Add the cauliflower and green beans and simmer for 6 minutes, until a knife slides easily into the cauliflower.',
            'Adaugă conopida și fasolea verde și fierbe 6 minute, până când cuțitul intră ușor în conopidă.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'peas',
          text: t(
            'Add the peas and the spinach, if using, and simmer for 3 minutes, until the peas are tender and the spinach has wilted.',
            'Adaugă mazărea și spanacul, dacă folosești, și fierbe 3 minute, până când mazărea se fragezește și spanacul se ofilește.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'whisk',
          text: t(
            'In a jug, whisk the flour with about 150 ml of the milk until completely smooth, then whisk in the rest of the milk.',
            'Într-un vas, amestecă făina cu aproximativ 150 ml din lapte, până nu mai rămân cocoloașe, apoi adaugă restul laptelui.',
          ),
        },
        {
          key: 'milk',
          text: t(
            'Turn the heat to low and pour in the milk, stirring. Heat gently, stirring and scraping the bottom, until small bubbles appear at the edge, then let it simmer gently for 2 to 3 minutes until lightly thickened. This takes about 8 minutes in all.',
            'Dă focul la minim și toarnă laptele, amestecând. Încălzește încet, amestecând și răzuind fundul oalei, până apar bule mici pe margine, apoi lasă supa să fiarbă domol 2-3 minute, până se îngroașă ușor. În total durează aproximativ 8 minute.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'finish',
          text: t(
            'Take the pot off the heat. Stir in the butter, most of the dill and the white pepper, if using, then taste and add salt if needed. Serve topped with the remaining dill.',
            'Ia oala de pe foc. Amestecă untul, cea mai mare parte din mărar și piperul alb, dacă folosești, apoi gustă și sărează dacă e nevoie. Servește cu restul de mărar deasupra.',
          ),
        },
      ],
      tips: [
        t(
          'Milk catches on the bottom of the pot easily. Keep the heat low to moderate, stir often, and do not reheat leftovers on high heat.',
          'Laptele se prinde ușor de fundul oalei. Ține focul mic spre mediu, amestecă des și nu reîncălzi resturile la foc mare.',
        ),
        t(
          'Use the youngest vegetables you can find, and add the greenest ones last so they keep their colour.',
          'Folosește cele mai tinere legume pe care le găsești și adaugă la urmă pe cele verzi, ca să-și păstreze culoarea.',
        ),
      ],
      stepTips: [
        {
          step: 'milk',
          text: t(
            'Use a heavy-bottomed pot and a flat-edged wooden spoon, so you can reach the corners where milk catches first.',
            'Folosește o oală cu fund gros și o lingură de lemn cu margine dreaptă, ca să ajungi în colțurile unde se prinde laptele primul.',
          ),
        },
      ],
      nutritionNote: t(
        'Milk adds protein, and the many vegetables bring fibre and vitamins. With no stock and no oil it is mild in salt, but the milk and butter add saturated fat, so use semi-skimmed milk if you like and keep the butter modest.',
        'Laptele aduce proteine, iar legumele multe aduc fibre și vitamine. Fără supă concentrată și fără ulei, e puțin sărată, dar laptele și untul aduc grăsimi saturate, așa că poți folosi lapte semidegresat și puțin unt.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Rye bread', 'Pâine de secară'),
          reason: t(
            'Its dense, slightly sour crumb sets off the mild, milky soup.',
            'Miezul ei dens, ușor acrișor, pune în valoare supa blândă, cu lapte.',
          ),
          principle: 'contrast_texture',
          ingredient: 'rye-bread',
        },
        {
          kind: 'food',
          label: t('Smoked salmon', 'Somon afumat'),
          reason: t(
            'Salty smoke and dill go together, and lift the sweet, creamy broth.',
            'Fumul sărat și mărarul se potrivesc și înviorează supa dulceagă și cremoasă.',
          ),
          principle: 'salt_balances_sweet',
          ingredient: 'smoked-salmon',
        },
        {
          kind: 'drink',
          label: t('Cold buttermilk', 'Zară rece'),
          reason: t(
            'Its tang cuts through the creamy milk and butter.',
            'Aciditatea ei taie bogăția laptelui și a untului.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'buttermilk',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Light, fresh and ready in under an hour.',
            'Ușoară, proaspătă și gata în mai puțin de o oră.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'good_for',
          reason: t(
            'Mild and soothing before bed.',
            'Blândă și liniștitoare înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'vegetable-soup-british',
      cuisine: 'british',
      title: t(
        'Scotch broth (lamb, barley and vegetable soup)',
        'Scotch broth (supă scoțiană de miel cu arpacaș și legume)',
      ),
      servings: 6,
      prepMinutes: 505,
      cookMinutes: 160,
      difficulty: 'medium',
      hideBaseTips: [2],
      lines: [
        {
          ingredient: 'pearl-barley',
          quantity: 80,
          unit: 'g',
          note: t('soaked overnight', 'înmuiat peste noapte'),
        },
        {
          ingredient: 'split-peas',
          quantity: 80,
          unit: 'g',
          note: t('dried, soaked overnight', 'uscată, înmuiată peste noapte'),
        },
        {
          ingredient: 'lamb',
          quantity: 1000,
          unit: 'g',
          note: t(
            'neck on the bone, in 4 to 5 cm pieces',
            'gât pe os, tăiat în bucăți de 4-5 cm',
          ),
        },
        { ingredient: 'still-water', quantity: 2.5, unit: 'l' },
        { ingredient: 'salt', quantity: 8, unit: 'g' },
        {
          ingredient: 'carrot',
          quantity: 250,
          unit: 'g',
          note: t('diced 1 cm', 'tăiați cubulețe de 1 cm'),
        },
        {
          ingredient: 'swede',
          quantity: 250,
          unit: 'g',
          note: t('peeled, diced 1 cm', 'curățat, tăiat cubulețe de 1 cm'),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely diced', 'tăiată mărunt'),
        },
        {
          ingredient: 'leek',
          quantity: 200,
          unit: 'g',
          note: t(
            'halved, washed and sliced',
            'tăiat în două, spălat și feliat',
          ),
        },
        {
          ingredient: 'cabbage',
          quantity: 200,
          unit: 'g',
          note: t('finely shredded', 'tăiată fideluță'),
        },
        {
          ingredient: 'parsley',
          quantity: 20,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'soak',
          text: t(
            'The evening before, put the pearl barley and split peas in a bowl and cover with plenty of cold water. Leave to soak for 8 hours or overnight.',
            'Seara dinainte, pune arpacașul și mazărea despicată într-un castron și acoperă-le cu multă apă rece. Lasă-le la înmuiat 8 ore sau peste noapte.',
          ),
          timerSeconds: 28800,
        },
        {
          key: 'boil',
          text: t(
            'Put the lamb and the water in a 5 to 6 litre pot. Bring to the boil over high heat, which takes about 15 minutes.',
            'Pune carnea de miel și apa într-o oală de 5-6 litri. Adu la fierbere la foc mare, ceea ce durează aproximativ 15 minute.',
          ),
        },
        {
          key: 'skim',
          text: t(
            'Lower the heat so the water bubbles gently. For 10 minutes, skim off the grey foam that rises with a spoon.',
            'Redu focul, ca apa să fiarbă domol. Timp de 10 minute, ia cu o lingură spuma cenușie care iese la suprafață.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'simmer-lamb',
          text: t(
            'Simmer the lamb, partly covered, for 1 hour.',
            'Fierbe carnea la foc mic, cu capacul întredeschis, 1 oră.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'barley',
          text: t(
            'Drain and rinse the barley and split peas, then add them to the pot with the salt. Simmer for 30 minutes, stirring now and then so they do not catch on the bottom.',
            'Scurge și clătește arpacașul și mazărea despicată, apoi adaugă-le în oală împreună cu sarea. Fierbe 30 de minute la foc mic, amestecând din când în când, ca să nu se prindă de fund.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'veg',
          text: t(
            'Add the carrots, swede, onion and leek and simmer for 20 minutes, until the swede is tender.',
            'Adaugă morcovii, napul suedez, ceapa și prazul și fierbe 20 de minute, până când napul se fragezește.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'cabbage',
          text: t(
            'Stir in the cabbage and simmer for 10 minutes, until it is soft.',
            'Adaugă varza și fierbe 10 minute, până se înmoaie.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'meat',
          text: t(
            'Lift the lamb out onto a board and let it cool for a few minutes. It is ready when the meat slides off the bone with no resistance and has no pink inside. If it still clings, return it to the pot and simmer for 15 minutes more. Pull the meat off the bones in chunks and discard the bones, gristle and any hard fat.',
            'Scoate carnea pe un tocător și las-o să se răcească câteva minute. E gata când carnea se desprinde de pe os fără rezistență și nu mai e roz în interior. Dacă încă se ține de os, pune-o înapoi în oală și mai fierbe 15 minute. Desprinde carnea de pe oase în bucăți și aruncă oasele, cartilajele și grăsimea tare.',
          ),
        },
        {
          key: 'finish',
          text: t(
            'Return the meat to the pot with the parsley and pepper and simmer for 3 minutes. Taste and add salt if needed, then serve hot.',
            'Pune carnea înapoi în oală, cu pătrunjelul și piperul, și fierbe încă 3 minute. Gustă și sărează dacă e nevoie, apoi servește fierbinte.',
          ),
          timerSeconds: 180,
        },
      ],
      tips: [
        t(
          'The broth thickens as it stands because the barley keeps absorbing liquid. Thin it with a splash of hot water when you reheat it.',
          'Supa se îngroașă în timp ce stă, fiindcă arpacașul continuă să absoarbă lichid. Când o reîncălzești, subțiaz-o cu puțină apă fierbinte.',
        ),
      ],
      stepTips: [
        {
          step: 'meat',
          text: t(
            'Neck is fatty. If you have time, chill the soup overnight and lift off the solid fat from the top before reheating.',
            'Gâtul de miel e gras. Dacă ai timp, lasă supa peste noapte la rece și ia grăsimea închegată de la suprafață înainte de reîncălzire.',
          ),
        },
        {
          step: 'barley',
          text: t(
            'Soaked barley and peas need about 30 minutes here; if you skip the soak, give them 60 minutes instead.',
            'După înmuiere, arpacașul și mazărea au nevoie de aproximativ 30 de minute aici; dacă sari peste înmuiere, fierbe-le 60 de minute.',
          ),
        },
      ],
      nutritionNote: t(
        'Barley and split peas bring fibre and plant protein, the lamb adds protein and iron, and the vegetables fill the bowl. Lamb neck is fatty and adds saturated fat, so skim the top, and the added salt makes it salty, so taste before adding more.',
        'Arpacașul și mazărea aduc fibre și proteine vegetale, carnea de miel aduce proteine și fier, iar legumele umplu castronul. Gâtul de miel e gras și aduce grăsimi saturate, așa că ia grăsimea de la suprafață, iar sarea adăugată o face sărată, așa că gustă înainte să mai pui.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Country bread', 'Pâine de casă'),
          reason: t(
            'A thick slice soaks up the barley broth and makes a meal of it.',
            'O felie groasă absoarbe supa cu arpacaș și o transformă într-o masă completă.',
          ),
          principle: 'contrast_texture',
          ingredient: 'country-bread',
        },
        {
          kind: 'food',
          label: t('Mature cheddar', 'Cheddar maturat'),
          reason: t(
            'A wedge of cheese and bread alongside makes the hearty broth a fuller meal.',
            'O bucată de brânză și pâine alături fac din supa consistentă o masă mai completă.',
          ),
          principle: 'complement_flavour',
          ingredient: 'cheddar',
        },
        {
          kind: 'drink',
          label: t('Dark beer', 'Bere neagră'),
          reason: t(
            'Malty, roasted notes go with lamb and barley.',
            'Notele maltoase, prăjite, se potrivesc cu mielul și arpacașul.',
          ),
          principle: 'complement_flavour',
          ingredient: 'dark-beer',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Hot, thick and hearty on a cold day.',
            'Fierbinte, groasă și consistentă într-o zi rece.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Meat protein plus barley and peas for carbohydrates and fibre.',
            'Proteine din carne, plus carbohidrați și fibre din arpacaș și mazăre.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Heavy and fatty, it sits in the stomach before bed.',
            'Grea și grasă, rămâne în stomac înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
