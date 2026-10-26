import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Lentil soup base is a plain vegetable-and-lentil soup in a tomato broth.
// Each Variant is a full Recipe with its own lines, steps and guidance; the
// base's Recipe-level Tips are inherited unless a Variant hides them.
export const lentilSoup: BaseRecipeSeed = {
  slug: 'lentil-soup',
  title: t('Lentil soup', 'Supă de linte'),
  servings: 6,
  prepMinutes: 15,
  cookMinutes: 50,
  difficulty: 'easy',
  lines: [
    { ingredient: 'lentils', quantity: 300, unit: 'g' },
    { ingredient: 'olive-oil', quantity: 45, unit: 'ml' },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('finely diced', 'tăiate mărunt'),
    },
    {
      ingredient: 'carrot',
      quantity: 200,
      unit: 'g',
      note: t('diced', 'tăiați cubulețe'),
    },
    {
      ingredient: 'celery',
      quantity: 100,
      unit: 'g',
      note: t('diced', 'tăiată cubulețe'),
    },
    {
      ingredient: 'garlic',
      quantity: 15,
      unit: 'g',
      note: t('minced', 'tocat'),
    },
    { ingredient: 'cumin', quantity: 3, unit: 'g' },
    { ingredient: 'canned-tomatoes', quantity: 400, unit: 'g' },
    {
      ingredient: 'bay-leaves',
      quantity: 0.5,
      unit: 'g',
      note: t('2 to 3 leaves', '2-3 foi'),
    },
    { ingredient: 'still-water', quantity: 1.5, unit: 'l' },
    {
      ingredient: 'lemon',
      quantity: 1,
      unit: 'pcs',
      note: t('juiced', 'storsă'),
    },
    {
      ingredient: 'parsley',
      quantity: 15,
      unit: 'g',
      note: t('chopped', 'tocat'),
    },
    { ingredient: 'salt', quantity: 6, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
  ],
  steps: [
    {
      key: 'rinse',
      text: t(
        'Tip the lentils into a sieve, pick out any small stones or shrivelled lentils, and rinse under cold water.',
        'Pune lintea într-o strecurătoare, scoate pietricelele și boabele zbârcite și clătește-o sub apă rece.',
      ),
    },
    {
      key: 'sweat',
      text: t(
        'Heat the oil in a large pot over medium heat. Add the onion, carrot, celery and a pinch of the salt, and cook, stirring, for 8 to 10 minutes until soft and the onion is translucent but not browned.',
        'Încinge uleiul într-o oală mare la foc mediu. Adaugă ceapa, morcovul, țelina și un praf din sare și gătește amestecând 8-10 minute, până se înmoaie și ceapa devine translucidă, fără să se rumenească.',
      ),
      timerSeconds: 540,
    },
    {
      key: 'spice',
      text: t(
        'Stir in the garlic and cumin and cook for 1 minute, until fragrant.',
        'Adaugă usturoiul și chimionul și gătește un minut, până se simte aroma.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'simmer',
      text: t(
        'Add the lentils, tomatoes, bay leaves and water. Bring to the boil, then turn down to a gentle simmer, cover partly and cook for 30 to 40 minutes, until the lentils are tender but still hold their shape.',
        'Adaugă lintea, roșiile, foile de dafin și apa. Adu la fierbere, apoi dă focul mic, acoperă pe jumătate și fierbe 30-40 de minute, până lintea e moale, dar își păstrează forma.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'season',
      text: t(
        'Fish out the bay leaves. Stir in the rest of the salt and the pepper, taste, and add a little more if the soup still tastes flat.',
        'Scoate foile de dafin. Adaugă restul de sare și piperul, gustă și mai pune puțin dacă supa pare fadă.',
      ),
    },
    {
      key: 'finish',
      text: t(
        'Take the pot off the heat, stir in the lemon juice and the parsley, and serve hot.',
        'Ia oala de pe foc, amestecă sucul de lămâie și pătrunjelul și servește fierbinte.',
      ),
    },
  ],
  tips: [
    t(
      'Add the lemon juice off the heat, right at the end: it brightens the earthy lentils, and a soup that tastes flat usually wants acid, not more salt.',
      'Pune sucul de lămâie la final, cu oala luată de pe foc: dă prospețime lintei, iar o supă fadă are de obicei nevoie de aciditate, nu de mai multă sare.',
    ),
    t(
      'The soup thickens as it stands. Loosen it with a splash of hot water when you reheat it.',
      'Supa se îngroașă cât stă. Când o încălzești, subțiază-o cu puțină apă fierbinte.',
    ),
    t(
      'It keeps in the fridge for up to 3 days and freezes well; it is often better the next day.',
      'Se păstrează la frigider până la 3 zile și se poate congela; de multe ori e mai bună a doua zi.',
    ),
  ],
  stepTips: [
    {
      step: 'sweat',
      text: t(
        'The salt draws water out of the vegetables so they soften and sweeten instead of browning. Keep the heat at medium.',
        'Sarea scoate apa din legume, așa că se înmoaie și se îndulcesc în loc să se rumenească. Păstrează focul la mediu.',
      ),
    },
    {
      step: 'simmer',
      text: t(
        'Keep the simmer gentle. A hard boil splits the skins and turns the lentils to mush. Lentils vary with age, so taste one at 25 minutes.',
        'Păstrează fierberea lentă. O fierbere puternică sparge coaja și face lintea păstoasă. Lintea diferă în funcție de vechime, așa că gustă o boabă după 25 de minute.',
      ),
    },
  ],
  nutritionNote: t(
    'Lentils bring plenty of fibre, plant protein and iron for very little fat, and the vegetables add more fibre. The fibre can cause wind if you are not used to pulses, and the iron is absorbed better with the lemon. Go easy on the salt, as the soup is easy to over-season.',
    'Lintea aduce multe fibre, proteine vegetale și fier cu foarte puține grăsimi, iar legumele adaugă și mai multe fibre. Fibrele pot provoca balonare dacă nu ești obișnuit cu leguminoasele, iar fierul se absoarbe mai bine împreună cu lămâia. Nu exagera cu sarea, pentru că supa se sărează ușor prea tare.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Toasted sourdough', 'Pâine cu maia prăjită'),
      reason: t(
        'A crisp slice to dunk gives the soft, brothy soup something to bite against.',
        'O felie crocantă de înmuiat în supă oferă supei moi un contrast la mestecat.',
      ),
      principle: 'contrast_texture',
      ingredient: 'sourdough',
    },
    {
      kind: 'food',
      label: t('A spoon of yogurt', 'O lingură de iaurt'),
      reason: t(
        'Cool, tangy cream softens the earthy spice and rounds off each spoonful.',
        'Cremozitatea rece și acidulată îmblânzește condimentele și rotunjește fiecare lingură.',
      ),
      principle: 'complement_flavour',
      ingredient: 'yogurt',
    },
    {
      kind: 'food',
      label: t('A splash of wine vinegar', 'Un strop de oțet de vin'),
      reason: t(
        'A little sharpness lifts the deep, earthy lentil flavour at the table.',
        'Puțină aciditate scoate în față gustul adânc, pământos al lintei, direct la masă.',
      ),
      principle: 'complement_flavour',
      ingredient: 'wine-vinegar',
    },
    {
      kind: 'drink',
      label: t('Light red wine', 'Vin roșu ușor'),
      reason: t(
        'A soft, low-tannin red matches the earthy lentils without overpowering them.',
        'Un roșu fin, cu taninuri puține, se potrivește cu lintea fără s-o acopere.',
      ),
      principle: 'complement_flavour',
      ingredient: 'red-wine',
    },
    {
      kind: 'drink',
      label: t('Sparkling water with lemon', 'Apă minerală cu lămâie'),
      reason: t(
        'The bubbles and citrus freshen the palate between spoonfuls.',
        'Bulele și citricele împrospătează gustul între linguri.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'sparkling-water',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot, filling bowl warms you through.',
        'Un castron fierbinte și săturător te încălzește bine.',
      ),
    },
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'Filling without being heavy, and it keeps well for a packed lunch.',
        'Săturătoare fără să fie grea, și se păstrează bine pentru un prânz la pachet.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Plant protein and slow carbohydrates help you refuel.',
        'Proteinele vegetale și carbohidrații lenți te ajută să-ți refaci energia.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'The fibre and pulses sit heavy and can cause bloating during hard exercise.',
        'Fibrele și leguminoasele cad greu și pot provoca balonare în timpul unui efort intens.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'A hot, hearty soup is the last thing most people want in the heat.',
        'O supă fierbinte și consistentă e ultimul lucru pe care ți-l dorești pe caniculă.',
      ),
    },
  ],
  variants: [
    {
      slug: 'lentil-soup-middle-eastern',
      cuisine: 'middle-eastern',
      title: t(
        'Red lentil soup (shorbat adas)',
        'Supă de linte roșie (shorbat adas)',
      ),
      servings: 6,
      prepMinutes: 15,
      cookMinutes: 40,
      difficulty: 'easy',
      lines: [
        { ingredient: 'red-lentils', quantity: 300, unit: 'g' },
        { ingredient: 'olive-oil', quantity: 45, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('chopped', 'tăiate mărunt'),
        },
        {
          ingredient: 'carrot',
          quantity: 200,
          unit: 'g',
          note: t('sliced', 'tăiați rondele'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t('minced', 'tocat'),
        },
        { ingredient: 'cumin', quantity: 5, unit: 'g' },
        { ingredient: 'turmeric', quantity: 2, unit: 'g' },
        { ingredient: 'still-water', quantity: 1.5, unit: 'l' },
        { ingredient: 'lemon', quantity: 1, unit: 'pcs' },
        {
          ingredient: 'parsley',
          quantity: 15,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        { ingredient: 'salt', quantity: 6, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'rinse',
          text: t(
            'Rinse the red lentils in a sieve under cold water until the water runs almost clear.',
            'Clătește lintea roșie într-o strecurătoare sub apă rece, până când apa curge aproape limpede.',
          ),
        },
        {
          key: 'sweat',
          text: t(
            'Heat the oil in a large pot over medium heat. Add the onion and carrot with a pinch of salt and cook for 8 to 10 minutes, stirring, until soft and lightly golden at the edges.',
            'Încinge uleiul într-o oală mare la foc mediu. Adaugă ceapa și morcovul cu un praf de sare și gătește 8-10 minute, amestecând, până se înmoaie și se aurește ușor pe margini.',
          ),
          timerSeconds: 540,
        },
        {
          key: 'spice',
          text: t(
            'Stir in the garlic, cumin and turmeric and cook for 30 seconds, until fragrant.',
            'Adaugă usturoiul, chimionul și turmericul și gătește 30 de secunde, până se simte aroma.',
          ),
          timerSeconds: 30,
        },
        {
          key: 'simmer',
          text: t(
            'Add the lentils and water and bring to the boil. Skim off the foam, then simmer gently for 25 minutes, stirring now and then, until the lentils have collapsed and the carrot is very soft.',
            'Adaugă lintea și apa și adu la fierbere. Ia spuma de la suprafață, apoi fierbe liniștit 25 de minute, amestecând din când în când, până lintea s-a destrămat și morcovul e foarte moale.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'blend',
          text: t(
            'Blend the soup smooth with a stick blender. If you use a jug blender, work in batches and leave the lid vent open, as hot soup can spurt out.',
            'Mixează supa cremă cu un mixer vertical. Dacă folosești un blender cu vas, lucrează pe porții și lasă deschis orificiul capacului, pentru că supa fierbinte poate țâșni.',
          ),
        },
        {
          key: 'finish',
          text: t(
            'Return to low heat, add the salt and pepper, and thin with hot water if it is thicker than single cream. Take the pot off the heat, stir in the juice of half the lemon, taste, and add more if you like. Serve with the parsley and lemon wedges.',
            'Pune din nou oala pe foc mic, adaugă sarea și piperul și subțiază cu apă fierbinte dacă e mai groasă decât smântâna lichidă. Ia oala de pe foc, adaugă sucul de la o jumătate de lămâie, gustă și mai pune dacă vrei. Servește cu pătrunjel și felii de lămâie.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'rinse',
          text: t(
            'Rinsing washes off the dust and some of the starch that makes the foam, so the soup tastes cleaner.',
            'Clătirea spală praful și o parte din amidonul care face spuma, așa că supa are un gust mai curat.',
          ),
        },
        {
          step: 'blend',
          text: t(
            'Blending only half the soup keeps some texture if you prefer it less smooth.',
            'Dacă o preferi mai puțin fină, mixează doar jumătate din supă, ca să rămână ceva textură.',
          ),
        },
      ],
      nutritionNote: t(
        'Red lentils are rich in plant protein and fibre and cook down without any cream, so the soup is filling and low in fat. The fibre can cause wind in people not used to pulses, and the oil adds calories, so measure it. Lemon helps absorb the iron.',
        'Lintea roșie are multe proteine vegetale și fibre și se destramă fără smântână, așa că supa e săturătoare și săracă în grăsimi. Fibrele pot provoca balonare la cei neobișnuiți cu leguminoasele, iar uleiul adaugă calorii, deci măsoară-l. Lămâia ajută la absorbția fierului.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Warm pita', 'Lipie caldă'),
          reason: t(
            'Soft bread for scooping up the smooth soup, as it is eaten across the Levant.',
            'Pâine moale cu care iei supa cremoasă, cum se mănâncă în tot Levantul.',
          ),
          principle: 'regional_tradition',
          ingredient: 'pita',
        },
        {
          kind: 'food',
          label: t('Crisp pita chips', 'Chipsuri crocante de lipie'),
          reason: t(
            'Broken into the smooth soup, toasted bread adds crunch to a dish with no texture of its own.',
            'Rupte în supa cremoasă, bucățile de lipie prăjită aduc crocanțeală unei supe fără textură.',
          ),
          principle: 'contrast_texture',
          ingredient: 'pita',
        },
        {
          kind: 'food',
          label: t('Fresh mint', 'Mentă proaspătă'),
          reason: t(
            'Its cool freshness lifts the warm cumin and turmeric.',
            'Răcoarea ei scoate în evidență chimionul și turmericul calde.',
          ),
          principle: 'complement_flavour',
          ingredient: 'mint',
        },
        {
          kind: 'drink',
          label: t('Black tea', 'Ceai negru'),
          reason: t(
            'Hot, lightly bitter tea is the everyday drink with a simple meal across the Levant.',
            'Ceaiul fierbinte, ușor amărui, e băutura de zi cu zi la o masă simplă în Levant.',
          ),
          principle: 'regional_tradition',
          ingredient: 'tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Smooth, warm and gently spiced, it is comfort in a bowl.',
            'Cremoasă, caldă și ușor condimentată, e confort într-un castron.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Quick to cook and light enough for a midday meal.',
            'Se face repede și e destul de ușoară pentru o masă de prânz.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein and carbohydrates in an easy-to-digest, smooth form.',
            'Proteine și carbohidrați într-o formă cremoasă, ușor de digerat.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Pulses and fibre can cause bloating during hard exercise.',
            'Leguminoasele și fibrele pot provoca balonare în timpul unui efort intens.',
          ),
        },
      ],
    },
    {
      slug: 'lentil-soup-greek',
      cuisine: 'greek',
      hideBaseTips: [0],
      title: t('Greek lentil soup (fakes)', 'Supă grecească de linte (fakes)'),
      servings: 6,
      prepMinutes: 15,
      cookMinutes: 55,
      difficulty: 'easy',
      lines: [
        { ingredient: 'lentils', quantity: 300, unit: 'g' },
        { ingredient: 'olive-oil', quantity: 90, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('finely chopped', 'tăiate mărunt'),
        },
        {
          ingredient: 'carrot',
          quantity: 150,
          unit: 'g',
          note: t('diced', 'tăiați cubulețe'),
        },
        {
          ingredient: 'garlic',
          quantity: 15,
          unit: 'g',
          note: t('sliced', 'tăiat felii'),
        },
        { ingredient: 'tomato-paste', quantity: 45, unit: 'g' },
        {
          ingredient: 'bay-leaves',
          quantity: 0.5,
          unit: 'g',
          note: t('2 to 3 leaves', '2-3 foi'),
        },
        { ingredient: 'oregano', quantity: 2, unit: 'g' },
        { ingredient: 'still-water', quantity: 1.8, unit: 'l' },
        { ingredient: 'wine-vinegar', quantity: 30, unit: 'ml' },
        { ingredient: 'salt', quantity: 6, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'rinse',
          text: t(
            'Pick over the lentils for small stones and rinse them under cold water.',
            'Alege lintea de pietricele și clătește-o sub apă rece.',
          ),
        },
        {
          key: 'sweat',
          text: t(
            'Heat 60 ml of the oil in a large pot over medium heat. Cook the onion and carrot for 8 minutes, stirring, until soft and translucent. Add the garlic for the last minute.',
            'Încinge 60 ml din ulei într-o oală mare la foc mediu. Gătește ceapa și morcovul 8 minute, amestecând, până se înmoaie și devin translucide. Adaugă usturoiul pentru ultimul minut.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'paste',
          text: t(
            'Stir in the tomato paste and cook for 1 minute, until it darkens a shade and smells sweet.',
            'Adaugă pasta de roșii și gătește un minut, până se închide puțin la culoare și miroase dulceag.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'simmer',
          text: t(
            'Add the lentils, bay leaves, oregano and water. Bring to the boil, then simmer gently, partly covered, for 40 minutes, until the lentils are soft and the broth is lightly thickened.',
            'Adaugă lintea, foile de dafin, oregano și apa. Adu la fierbere, apoi fierbe liniștit, pe jumătate acoperit, 40 de minute, până lintea e moale și supa s-a îngroșat ușor.',
          ),
          timerSeconds: 2400,
        },
        {
          key: 'season',
          text: t(
            'Remove the bay leaves, stir in the salt and pepper, and taste. Add a little hot water if the soup is too thick; fakes should be brothy, not a stew.',
            'Scoate foile de dafin, adaugă sarea și piperul și gustă. Pune puțină apă fierbinte dacă supa e prea groasă; fakes trebuie să fie cu zeamă, nu tocană.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Ladle into bowls, pour a thin thread of the remaining oil over each, and add the vinegar at the table, about a teaspoon per bowl.',
            'Toarnă în boluri, adaugă un fir subțire din uleiul rămas peste fiecare și pune oțetul la masă, cam o linguriță pe castron.',
          ),
        },
      ],
      tips: [
        t(
          'Be generous with the olive oil: in fakes it is a flavour, not just a cooking fat. Use your best bottle for the final drizzle.',
          'Nu economisi uleiul de măsline: în fakes este un gust, nu doar o grăsime de gătit. Folosește cea mai bună sticlă pentru firul final.',
        ),
      ],
      stepTips: [
        {
          step: 'serve',
          text: t(
            'Add the vinegar in the bowl, not in the pot: it stays sharp and fresh instead of cooking away.',
            'Pune oțetul în castron, nu în oală: rămâne vioi și proaspăt, în loc să se evapore la gătit.',
          ),
        },
      ],
      nutritionNote: t(
        'Lentils give plant protein and fibre, and olive oil adds mostly unsaturated fat, but there is a good deal of it, so the soup is more calorie-dense than it looks. The fibre can cause wind if you are not used to pulses. Watch the salt when you eat it with feta and olives.',
        'Lintea aduce proteine vegetale și fibre, iar uleiul de măsline adaugă mai ales grăsimi nesaturate, dar în cantitate mare, așa că supa e mai calorică decât pare. Fibrele pot provoca balonare dacă nu ești obișnuit cu leguminoasele. Ai grijă la sare când o mănânci cu feta și măsline.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Meze platter', 'Platou de meze'),
          reason: t(
            'Fakes is eaten with feta, olives and bread, the cold meze that fill out a simple soup.',
            'Fakes se mănâncă cu feta, măsline și pâine, mezele reci care completează o supă simplă.',
          ),
          principle: 'regional_tradition',
          recipe: 'appetizer-platter-greek',
        },
        {
          kind: 'food',
          label: t('Feta', 'Brânză feta'),
          reason: t(
            'Its salty tang is a sharp contrast to the soft, mild lentils.',
            'Gustul ei sărat și acrișor contrastează cu lintea moale și blândă.',
          ),
          principle: 'complement_flavour',
          ingredient: 'feta',
        },
        {
          kind: 'food',
          label: t('Olives', 'Măsline'),
          reason: t(
            'Briny and bitter, they cut the olive-oil richness of the bowl.',
            'Sărate și ușor amărui, taie din bogăția uleiului de măsline din castron.',
          ),
          principle: 'complement_flavour',
          ingredient: 'olives',
        },
        {
          kind: 'food',
          label: t('Crusty bread', 'Pâine cu crustă'),
          reason: t(
            'For mopping up the oily, tomato-tinted broth.',
            'Pentru a șterge castronul de supa cu ulei și roșii.',
          ),
          principle: 'contrast_texture',
          ingredient: 'bread',
        },
        {
          kind: 'drink',
          label: t('Dry red wine', 'Vin roșu sec'),
          reason: t(
            'Its acidity and light tannin cut the olive oil and suit the earthy lentils.',
            'Aciditatea și taninurile ușoare taie uleiul de măsline și se potrivesc cu lintea.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'red-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A warming, hearty bowl for the cold months.',
            'Un castron cald și consistent pentru lunile reci.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Brothy rather than heavy, and it fills you up without a second course.',
            'Cu zeamă, nu grea, și te satură fără un fel doi.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Plant protein and carbohydrates to refuel; the olive oil adds energy.',
            'Proteine vegetale și carbohidrați pentru refacere; uleiul de măsline adaugă energie.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Fibre and a lot of olive oil sit heavy during hard exercise.',
            'Fibrele și mult ulei de măsline cad greu în timpul unui efort intens.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'A hot bowl with a lot of oil is heavy in the heat.',
            'Un castron fierbinte, cu mult ulei, e greu pe caniculă.',
          ),
        },
      ],
    },
    {
      slug: 'lentil-soup-spanish',
      cuisine: 'spanish',
      hideBaseTips: [0, 2],
      title: t(
        'Spanish lentils with chorizo (lentejas)',
        'Linte spaniolă cu chorizo (lentejas)',
      ),
      servings: 6,
      prepMinutes: 20,
      cookMinutes: 60,
      difficulty: 'easy',
      lines: [
        { ingredient: 'lentils', quantity: 300, unit: 'g' },
        {
          ingredient: 'chorizo',
          quantity: 150,
          unit: 'g',
          note: t(
            'cured or cooking chorizo, sliced',
            'chorizo uscat sau pentru gătit, tăiat felii',
          ),
        },
        { ingredient: 'olive-oil', quantity: 30, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely chopped', 'tăiată mărunt'),
        },
        {
          ingredient: 'bell-pepper',
          quantity: 1,
          unit: 'pcs',
          note: t('green, finely chopped', 'verde, tăiat mărunt'),
        },
        {
          ingredient: 'carrot',
          quantity: 150,
          unit: 'g',
          note: t('diced', 'tăiați cubulețe'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t('minced', 'tocat'),
        },
        { ingredient: 'smoked-paprika', quantity: 5, unit: 'g' },
        {
          ingredient: 'bay-leaves',
          quantity: 0.5,
          unit: 'g',
          note: t('2 to 3 leaves', '2-3 foi'),
        },
        {
          ingredient: 'potato',
          quantity: 0.4,
          unit: 'kg',
          note: t(
            'peeled, cut in 2 cm cubes',
            'curățați, tăiați cuburi de 2 cm',
          ),
        },
        { ingredient: 'still-water', quantity: 1.5, unit: 'l' },
        { ingredient: 'salt', quantity: 5, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'rinse',
          text: t(
            'Pick over the lentils for small stones and rinse them under cold water.',
            'Alege lintea de pietricele și clătește-o sub apă rece.',
          ),
        },
        {
          key: 'chorizo',
          text: t(
            'Heat the oil in a large pot over medium heat. Add the chorizo and fry for 3 minutes, until it has released its red oil and the edges are lightly crisp.',
            'Încinge uleiul într-o oală mare la foc mediu. Adaugă chorizo și prăjește-l 3 minute, până a eliberat grăsimea roșie și marginile sunt ușor crocante.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'sofrito',
          text: t(
            'Add the onion, green pepper and carrot to the chorizo oil. Cook for 10 minutes, stirring, until soft. Add the garlic for the last minute.',
            'Adaugă ceapa, ardeiul verde și morcovul în grăsimea de la chorizo. Gătește 10 minute, amestecând, până se înmoaie. Adaugă usturoiul pentru ultimul minut.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'paprika',
          text: t(
            'Take the pot off the heat, stir in the smoked paprika for 20 seconds, then straight away add the lentils, bay leaves and water.',
            'Ia oala de pe foc, amestecă boiaua afumată 20 de secunde, apoi adaugă imediat lintea, foile de dafin și apa.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Return to the heat, bring to the boil, then simmer gently, partly covered, for 25 minutes.',
            'Pune oala înapoi pe foc, adu la fierbere, apoi fierbe liniștit, pe jumătate acoperit, 25 de minute.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'potato',
          text: t(
            'Add the potato and simmer for another 20 minutes, until the potato is tender when pierced with a knife and the lentils are soft. Add a little hot water if it gets too thick.',
            'Adaugă cartofii și fierbe încă 20 de minute, până cartofii se străpung ușor cu cuțitul și lintea e moale. Pune puțină apă fierbinte dacă se îngroașă prea mult.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'rest',
          text: t(
            'Remove the bay leaves, season with salt and pepper (the chorizo is salty, so taste first) and leave to rest off the heat for 10 minutes before serving.',
            'Scoate foile de dafin, condimentează cu sare și piper (chorizo e sărat, așa că gustă mai întâi) și lasă să se odihnească 10 minute, de pe foc, înainte de servire.',
          ),
          timerSeconds: 600,
        },
      ],
      stepTips: [
        {
          step: 'paprika',
          text: t(
            'Pimentón burns in seconds and turns the whole pot bitter, so keep it off the heat.',
            'Pimentón se arde în câteva secunde și amărăște toată oala, așa că ține-l departe de foc.',
          ),
        },
        {
          step: 'rest',
          text: t(
            'Lentejas taste better after a rest and even better the next day, as the potato starch gives the broth body. Keeps 3 days in the fridge; it freezes, though the potato softens.',
            'Lentejas au gust mai bun după ce se odihnesc, și mai bun a doua zi, pentru că amidonul din cartofi dă corp supei. Se păstrează 3 zile la frigider; se poate congela, dar cartofii se înmoaie.',
          ),
        },
      ],
      nutritionNote: t(
        'A full meal in a pot: lentils for plant protein and fibre, potato for slow carbohydrates. The chorizo adds saturated fat and a lot of salt, so use a modest amount and taste before salting. The fibre can cause wind if you are not used to pulses.',
        'O masă completă într-o oală: linte pentru proteine vegetale și fibre, cartofi pentru carbohidrați lenți. Chorizo adaugă grăsimi saturate și multă sare, deci folosește o cantitate moderată și gustă înainte să sărezi. Fibrele pot provoca balonare dacă nu ești obișnuit cu leguminoasele.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Crusty bread', 'Pâine cu crustă'),
          reason: t(
            'For mopping up the thick, paprika-red broth.',
            'Pentru a șterge supa groasă, roșie de la boia.',
          ),
          principle: 'contrast_texture',
          ingredient: 'bread',
        },
        {
          kind: 'food',
          label: t('Green olives', 'Măsline verzi'),
          reason: t(
            'Their briny bite cuts through the richness of the chorizo.',
            'Gustul lor sărat taie din bogăția chorizo-ului.',
          ),
          principle: 'complement_flavour',
          ingredient: 'olives',
        },
        {
          kind: 'food',
          label: t('A splash of wine vinegar', 'Un strop de oțet de vin'),
          reason: t(
            'Some Spanish cooks add it at the table to lift the heavy, smoky stew.',
            'Unii bucătari spanioli îl pun la masă, ca să înviorească tocănița grea și afumată.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'wine-vinegar',
        },
        {
          kind: 'food',
          label: t('Tapas platter', 'Platou de tapas'),
          reason: t(
            'A few cold tapas before the pot is a natural Spanish table.',
            'Câteva tapas reci înaintea oalei sunt o masă firească în Spania.',
          ),
          principle: 'regional_tradition',
          recipe: 'appetizer-platter-spanish',
        },
        {
          kind: 'drink',
          label: t('Dry red wine', 'Vin roșu sec'),
          reason: t(
            'A medium-bodied Spanish red stands up to the chorizo and paprika.',
            'Un vin roșu spaniol cu corp mediu ține piept chorizo-ului și boielei.',
          ),
          principle: 'regional_tradition',
          ingredient: 'red-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Thick, smoky and warming, a proper winter pot.',
            'Groasă, afumată și încălzitoare, o oală adevărată de iarnă.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from the lentils and chorizo and carbohydrates from the potato.',
            'Proteine din linte și chorizo și carbohidrați din cartofi.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Fibre, chorizo fat and a large portion sit heavy during hard exercise.',
            'Fibrele, grăsimea din chorizo și o porție mare cad greu în timpul unui efort intens.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A heavy, spiced, fatty stew can disturb sleep.',
            'O tocăniță grea, condimentată și grasă poate strica somnul.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'Too heavy and hot for a hot day.',
            'Prea grea și fierbinte pentru o zi caldă.',
          ),
        },
      ],
    },
  ],
};
