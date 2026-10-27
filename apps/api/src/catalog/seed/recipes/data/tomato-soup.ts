import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Tomato soup base is a pantry soup: onion and carrot softened in butter,
// canned tomatoes and stock simmered and blended smooth, finished with cream.
// The Variants are a raw chilled gazpacho, a Romanian soup with rice that is
// not blended, and a roasted-tomato soup. Each Variant is a full Recipe and
// hides the base Tips that do not hold for it.
export const tomatoSoup: BaseRecipeSeed = {
  slug: 'tomato-soup',
  title: t('Tomato soup', 'Supă cremă de roșii'),
  servings: 4,
  prepMinutes: 10,
  cookMinutes: 40,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'onion',
      quantity: 1,
      unit: 'pcs',
      note: t('finely chopped', 'tăiată mărunt'),
    },
    {
      ingredient: 'carrot',
      quantity: 100,
      unit: 'g',
      optional: true,
      note: t('finely diced', 'tăiat cubulețe mici'),
    },
    {
      ingredient: 'garlic',
      quantity: 10,
      unit: 'g',
      note: t('2 cloves, sliced', '2 căței, tăiați felii subțiri'),
    },
    { ingredient: 'butter', quantity: 20, unit: 'g' },
    { ingredient: 'olive-oil', quantity: 15, unit: 'ml' },
    { ingredient: 'tomato-paste', quantity: 30, unit: 'g' },
    {
      ingredient: 'canned-tomatoes',
      quantity: 800,
      unit: 'g',
      note: t('2 tins, with their juice', '2 conserve, cu tot sucul'),
    },
    { ingredient: 'vegetable-stock', quantity: 500, unit: 'ml' },
    { ingredient: 'sugar', quantity: 5, unit: 'g' },
    {
      ingredient: 'whipping-cream',
      quantity: 100,
      unit: 'ml',
      optional: true,
    },
    {
      ingredient: 'basil',
      quantity: 10,
      unit: 'g',
      optional: true,
      note: t('leaves, to finish', 'frunze, la final'),
    },
    { ingredient: 'salt', quantity: 5, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
  ],
  steps: [
    {
      key: 'chop',
      text: t(
        'Chop the onion finely, dice the carrot into small cubes and slice the garlic.',
        'Taie ceapa mărunt, taie morcovul cubulețe mici și feliază usturoiul subțire.',
      ),
    },
    {
      key: 'soften',
      text: t(
        'Melt the butter with the olive oil in a large pot over medium-low heat. Add the onion and carrot with a pinch of the salt and cook for about 8 minutes, stirring now and then, until soft and translucent but not browned.',
        'Topește untul cu uleiul de măsline într-o oală mare, la foc mic-mediu. Adaugă ceapa și morcovul cu un praf din sare și gătește aproximativ 8 minute, amestecând din când în când, până se înmoaie și devin translucide, fără să se rumenească.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'paste',
      text: t(
        'Stir in the garlic and the tomato paste and fry for 1 minute, stirring, until the paste darkens a shade and smells sweet.',
        'Adaugă usturoiul și pasta de roșii și prăjește-le 1 minut, amestecând, până pasta se închide puțin la culoare și miroase dulceag.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'simmer-start',
      text: t(
        'Add the canned tomatoes with their juice, the stock, the sugar and the rest of the salt. Break up the tomatoes with a spoon and bring to the boil over medium-high heat.',
        'Adaugă roșiile conservate cu tot sucul, supa de legume, zahărul și restul de sare. Sfărâmă roșiile cu lingura și adu la fierbere la foc mediu-mare.',
      ),
    },
    {
      key: 'simmer',
      text: t(
        'Turn the heat down, partly cover the pot and simmer gently for 20 minutes, stirring once or twice, until the soup has darkened and thickened slightly and the carrot, if using, is completely tender.',
        'Micșorează focul, acoperă oala pe jumătate și fierbe domol 20 de minute, amestecând o dată sau de două ori, până supa s-a închis la culoare și s-a îngroșat ușor, iar morcovul, dacă l-ai pus, e complet moale.',
      ),
      timerSeconds: 1200,
    },
    {
      key: 'blend',
      text: t(
        'Take the pot off the heat and blend the soup with a stick blender for 1 to 2 minutes, until completely smooth with no flecks of skin.',
        'Ia oala de pe foc și mixează supa cu un blender vertical 1-2 minute, până devine complet fină, fără bucățele de coajă.',
      ),
    },
    {
      key: 'finish',
      text: t(
        'Return the pot to low heat. Stir in the cream and warm the soup through without letting it boil. Taste and adjust with salt, pepper and, if it is still sharp, a pinch more sugar. Ladle into bowls and tear the basil over the top.',
        'Pune oala înapoi pe foc mic. Adaugă frișca lichidă și încălzește supa fără să o lași să fiarbă. Gustă și ajustează cu sare, piper și, dacă e încă acrișoară, încă un praf de zahăr. Toarnă în boluri și rupe busuioc deasupra.',
      ),
    },
  ],
  tips: [
    t(
      'Canned tomatoes differ a lot in acidity, so taste at the end before you add anything. If the soup is sharp, a pinch more sugar rounds it off; if it tastes flat, it usually needs salt, not cream.',
      'Roșiile conservate diferă mult ca aciditate, așa că gustă la final înainte să adaugi ceva. Dacă supa e prea acră, un praf de zahăr îi echilibrează gustul; dacă pare searbădă, de obicei îi trebuie sare, nu frișcă.',
    ),
    t(
      'Cool leftovers within 2 hours and keep them covered in the fridge for up to 3 days, or freeze them for up to 3 months. Freeze the soup before adding the cream if you can, and reheat until steaming hot.',
      'Răcește rămășițele în cel mult 2 ore și păstrează-le acoperite la frigider până la 3 zile sau congelează-le până la 3 luni. Dacă poți, congelează supa înainte să adaugi frișca și reîncălzește-o până scoate aburi.',
    ),
  ],
  stepTips: [
    {
      step: 'blend',
      text: t(
        'If you use a jug blender, fill it no more than halfway, work in batches and hold a folded towel over the lid with the vent open: hot soup expands and can blow the lid off.',
        'Dacă folosești un blender cu vas, umple-l cel mult pe jumătate, lucrează pe porții și ține un prosop împăturit peste capac, cu orificiul deschis: supa fierbinte se dilată și poate sări capacul.',
      ),
    },
  ],
  nutritionNote: t(
    'Mostly vegetables, so it is light and brings some fibre from the tomatoes and carrot. The cream and butter add saturated fat, and canned tomatoes and stock can carry a lot of salt, so choose low-salt ones and season at the end. It has little protein, so eat it with bread and cheese or an egg to make a meal.',
    'E făcută în mare parte din legume, deci e ușoară și aduce fibre din roșii și morcov. Frișca și untul aduc grăsimi saturate, iar roșiile conservate și supa pot conține multă sare, așa că alege variante cu puțină sare și condimentează la final. Are puține proteine, așa că servește-o cu pâine și brânză sau cu un ou ca să fie o masă completă.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Toasted sourdough', 'Pâine cu maia prăjită'),
      reason: t(
        'Crisp toast gives the smooth soup something to bite, and it is good for dipping.',
        'Pâinea crocantă dă supei fine ceva de mestecat și e bună pentru înmuiat.',
      ),
      principle: 'contrast_texture',
      ingredient: 'sourdough',
    },
    {
      kind: 'food',
      label: t('Melted cheddar', 'Cheddar topit'),
      reason: t(
        'The fat of melted cheese, say in a toasted sandwich, softens the acidity of the tomatoes.',
        'Grăsimea brânzei topite, de pildă într-un sandviș cald cu brânză topită, atenuează aciditatea roșiilor.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'cheddar',
    },
    {
      kind: 'food',
      label: t('Grated Parmesan', 'Parmezan ras'),
      reason: t(
        'Its salty, savoury depth makes a simple tomato soup taste fuller.',
        'Gustul lui sărat și profund face o supă simplă de roșii să pară mai plină.',
      ),
      principle: 'complement_flavour',
      ingredient: 'parmesan',
    },
    {
      kind: 'drink',
      label: t('Crisp dry white wine', 'Vin alb sec și proaspăt'),
      reason: t(
        'A wine with lively acidity matches the tomatoes instead of being flattened by them.',
        'Un vin cu aciditate vie se potrivește cu roșiile și nu e acoperit de ele.',
      ),
      principle: 'complement_flavour',
      ingredient: 'white-wine',
    },
  ],
  eatingMoments: [
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'Light and quick; with bread and cheese it is a lunch that does not weigh you down.',
        'Ușoară și rapidă; cu pâine și brânză e un prânz care nu te îngreunează.',
      ),
    },
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot bowl warms you through on a cold day.',
        'Un bol fierbinte te încălzește într-o zi rece.',
      ),
    },
  ],
  variants: [
    {
      slug: 'tomato-soup-spanish',
      cuisine: 'spanish',
      title: t(
        'Gazpacho (Andalusian chilled tomato soup)',
        'Gazpacho (supă rece andaluză de roșii)',
      ),
      servings: 4,
      prepMinutes: 155,
      difficulty: 'easy',
      hideBaseTips: [0, 1],
      lines: [
        {
          ingredient: 'tomato',
          quantity: 1000,
          unit: 'g',
          note: t(
            'very ripe, cored and cut into chunks',
            'foarte coapte, fără cotor, tăiate bucăți',
          ),
        },
        {
          ingredient: 'cucumber',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'about 200 g, peeled and chunked',
            'aproximativ 200 g, curățat și tăiat bucăți',
          ),
        },
        {
          ingredient: 'bell-pepper',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'green, about 150 g, seeded and chunked',
            'verde, aproximativ 150 g, fără semințe, tăiat bucăți',
          ),
        },
        {
          ingredient: 'garlic',
          quantity: 5,
          unit: 'g',
          note: t('1 small clove', '1 cățel mic'),
        },
        {
          ingredient: 'bread',
          quantity: 3,
          unit: 'pcs',
          note: t(
            'slices of stale white bread, crusts removed',
            'felii de pâine albă veche, fără coajă',
          ),
        },
        {
          ingredient: 'olive-oil',
          quantity: 80,
          unit: 'ml',
          note: t('extra virgin', 'extravirgin'),
        },
        { ingredient: 'sherry-vinegar', quantity: 30, unit: 'ml' },
        { ingredient: 'salt', quantity: 6, unit: 'g' },
        {
          ingredient: 'still-water',
          quantity: 0.1,
          unit: 'l',
          optional: true,
          note: t('only to thin', 'doar pentru subțiere'),
        },
      ],
      steps: [
        {
          key: 'chop',
          text: t(
            'Wash all the vegetables. Core the tomatoes and cut them into chunks, peel the cucumber, seed the green pepper and cut both into chunks. Halve the garlic and pull out any green germ.',
            'Spală toate legumele. Scoate cotorul roșiilor și taie-le bucăți, curăță castravetele, scoate semințele ardeiului verde și taie-le pe amândouă bucăți. Taie usturoiul în două și scoate mugurele verde, dacă există.',
          ),
        },
        {
          key: 'soak',
          text: t(
            'Tear the bread into a large bowl, add the tomatoes with all their juice and the salt, and leave for 10 minutes, pressing the bread down once or twice, until it is soaked and soft.',
            'Rupe pâinea într-un castron mare, adaugă roșiile cu tot sucul și sarea și lasă 10 minute, apăsând pâinea o dată sau de două ori, până se înmoaie complet.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'blend',
          text: t(
            'Add the cucumber, pepper and garlic. Blend in batches for about 2 minutes each, until the soup is completely smooth and pale orange.',
            'Adaugă castravetele, ardeiul și usturoiul. Mixează pe porții, cam 2 minute fiecare, până supa devine complet fină și portocalie deschis.',
          ),
        },
        {
          key: 'emulsify',
          text: t(
            'With the blender running, pour in the olive oil in a thin stream, then the sherry vinegar. The soup turns paler and creamy as the oil emulsifies.',
            'Cu blenderul pornit, toarnă uleiul de măsline în fir subțire, apoi oțetul de Xeres. Supa se face mai deschisă la culoare și cremoasă pe măsură ce uleiul se emulsionează.',
          ),
        },
        {
          key: 'sieve',
          text: t(
            'Pass the soup through a fine sieve into a clean bowl, pressing with a ladle, and discard the skins and seeds that stay behind.',
            'Strecoară supa printr-o sită deasă într-un castron curat, apăsând cu polonicul, și aruncă pielițele și semințele rămase în sită.',
          ),
        },
        {
          key: 'chill',
          text: t(
            'Taste and adjust the salt and vinegar; add a little cold water if it is too thick. Cover and chill in the fridge for at least 2 hours, until very cold.',
            'Gustă și ajustează sarea și oțetul; dacă e prea groasă, adaugă puțină apă rece. Acoperă și lasă la frigider cel puțin 2 ore, până se răcește bine.',
          ),
          timerSeconds: 7200,
        },
        {
          key: 'serve',
          text: t(
            'Stir well, because it separates as it stands, and ladle into chilled bowls or glasses. Finish with a thin thread of olive oil.',
            'Amestecă bine, pentru că se separă în timp, și toarn-o în boluri sau pahare răcite. Termină cu un fir subțire de ulei de măsline.',
          ),
        },
      ],
      tips: [
        t(
          'Gazpacho is only as good as the tomatoes: use very ripe, in-season ones at room temperature. If they are pale and watery, a pinch of sugar helps, but no recipe fully rescues them.',
          'Gazpacho e bun cât sunt de bune roșiile: folosește roșii foarte coapte, de sezon, la temperatura camerei. Dacă sunt palide și apoase, un praf de zahăr ajută, dar nicio rețetă nu le salvează complet.',
        ),
        t(
          'This soup is raw, so keep it cold. Store it covered in the fridge for up to 2 days and stir before serving; do not leave it out for more than 2 hours on a warm day. It does not freeze well.',
          'Supa e crudă, așa că ține-o rece. Păstreaz-o acoperită la frigider până la 2 zile și amestec-o înainte de servire; nu o lăsa la temperatura camerei mai mult de 2 ore într-o zi caldă. Nu se congelează bine.',
        ),
      ],
      stepTips: [
        {
          step: 'emulsify',
          text: t(
            'Add the oil slowly: poured in all at once it floats on top instead of making the soup creamy.',
            'Adaugă uleiul încet: dacă îl torni dintr-odată, plutește deasupra în loc să facă supa cremoasă.',
          ),
        },
      ],
      nutritionNote: t(
        'Raw vegetables make it light, refreshing and a source of fibre, and nothing is cooked away. The olive oil adds mostly unsaturated fat but also a fair amount of energy, and the bread adds carbohydrate. It has little protein and the salt adds up, so serve it with egg or ham if it is a meal.',
        'Legumele crude o fac ușoară, răcoritoare și o sursă de fibre, fără să se piardă nimic la gătit. Uleiul de măsline aduce în special grăsimi nesaturate, dar și destulă energie, iar pâinea aduce carbohidrați. Are puține proteine, iar sarea se adună, așa că servește-o cu ou sau șuncă dacă e o masă.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Toasted baguette croutons', 'Crutoane de baghetă'),
          reason: t(
            'Crisp bread against the cold, smooth soup gives it a contrast in texture.',
            'Pâinea crocantă pe lângă supa rece și fină dă un contrast de textură.',
          ),
          principle: 'contrast_texture',
          ingredient: 'baguette',
        },
        {
          kind: 'food',
          label: t('Boiled egg, diced', 'Ou fiert, tăiat cubulețe'),
          reason: t(
            'Adds the protein the soup lacks and a soft, mild bite.',
            'Aduce proteinele care lipsesc supei și o textură moale, cu gust blând.',
          ),
          principle: 'complement_flavour',
          ingredient: 'boiled-eggs',
        },
        {
          kind: 'food',
          label: t('Diced jamón serrano', 'Jamón serrano tăiat cubulețe'),
          reason: t(
            'The saltiness of the cured ham balances the sweetness of the ripe tomatoes.',
            'Sărătura șuncii crude uscate echilibrează dulceața roșiilor coapte.',
          ),
          principle: 'salt_balances_sweet',
          ingredient: 'serrano-ham',
        },
        {
          kind: 'drink',
          label: t('Dry white wine, well chilled', 'Vin alb sec, bine rece'),
          reason: t(
            'Cold, crisp acidity refreshes the palate between spoonfuls.',
            'Aciditatea rece și proaspătă împrospătează gustul între două linguri de supă.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'white-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Served cold, with no cooking, it cools you down and needs no stove.',
            'Servită rece, fără gătit, te răcorește și nu cere aragaz.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Light and made ahead, so lunch is ready when you are.',
            'Ușoară și făcută dinainte, deci prânzul e gata când ești tu.',
          ),
        },
      ],
    },
    {
      slug: 'tomato-soup-romanian',
      cuisine: 'romanian',
      title: t('Romanian tomato soup with rice', 'Supă de roșii cu orez'),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 35,
      difficulty: 'easy',
      hideBaseTips: [0, 1],
      lines: [
        { ingredient: 'sunflower-oil', quantity: 45, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely chopped', 'tăiată mărunt'),
        },
        {
          ingredient: 'carrot',
          quantity: 150,
          unit: 'g',
          note: t('diced', 'tăiat cubulețe'),
        },
        {
          ingredient: 'bell-pepper',
          quantity: 1,
          unit: 'pcs',
          note: t('diced', 'tăiat cubulețe'),
        },
        {
          ingredient: 'celeriac',
          quantity: 80,
          unit: 'g',
          optional: true,
          note: t('diced small', 'tăiată cubulețe mici'),
        },
        { ingredient: 'tomato-juice', quantity: 750, unit: 'ml' },
        { ingredient: 'still-water', quantity: 1, unit: 'l' },
        { ingredient: 'rice', quantity: 100, unit: 'g' },
        {
          ingredient: 'sugar',
          quantity: 5,
          unit: 'g',
          optional: true,
          note: t(
            'a pinch, if the juice is sharp',
            'un praf, dacă sucul e acru',
          ),
        },
        {
          ingredient: 'parsley',
          quantity: 20,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'lovage',
          quantity: 10,
          unit: 'g',
          optional: true,
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'sour-cream',
          quantity: 100,
          unit: 'g',
          optional: true,
          note: t('to serve', 'pentru servit'),
        },
        { ingredient: 'salt', quantity: 8, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'chop',
          text: t(
            'Chop the onion finely and dice the carrot, pepper and celeriac into small, even cubes so they cook at the same pace as the rice.',
            'Taie ceapa mărunt, iar morcovul, ardeiul și țelina cubulețe mici și egale, ca să se gătească odată cu orezul.',
          ),
        },
        {
          key: 'soften',
          text: t(
            'Heat the oil in a large pot over medium heat. Add the onion, carrot, pepper and celeriac and cook for about 8 minutes, stirring, until the onion is soft and glossy but not browned.',
            'Încinge uleiul într-o oală mare, la foc mediu. Adaugă ceapa, morcovul, ardeiul și țelina și călește aproximativ 8 minute, amestecând, până ceapa se înmoaie și devine lucioasă, fără să se rumenească.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'liquid',
          text: t(
            'Pour in the tomato juice and the water and bring to the boil over medium-high heat, which takes about 8 minutes. Meanwhile rinse the rice in a sieve until the water runs almost clear.',
            'Toarnă sucul de roșii și apa și adu la fierbere la foc mediu-mare, ceea ce durează aproximativ 8 minute. Între timp, spală orezul într-o strecurătoare până când apa curge aproape limpede.',
          ),
        },
        {
          key: 'rice',
          text: t(
            'Add the rice, turn the heat down and simmer gently for 15 minutes, stirring now and then so the rice does not stick, until the grains are tender and the carrot is soft.',
            'Adaugă orezul, micșorează focul și fierbe domol 15 minute, amestecând din când în când ca orezul să nu se lipească, până boabele sunt moi și morcovul e moale.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'season',
          text: t(
            'Take the pot off the heat. Stir in the salt, pepper, and the sugar if the soup is sharp. Taste, then add the parsley and the lovage.',
            'Ia oala de pe foc. Adaugă sarea, piperul și zahărul, dacă supa e acră. Gustă, apoi adaugă pătrunjelul și leușteanul.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Ladle into bowls and put a spoonful of sour cream on each at the table, to be stirred in as you eat.',
            'Toarnă supa în boluri și pune în fiecare câte o lingură de smântână, de amestecat la masă.',
          ),
        },
      ],
      tips: [
        t(
          'Taste the tomato juice before you salt: bought juice is often already salted, and homemade juice is not. Add the salt at the end, once the rice is cooked.',
          'Gustă sucul de roșii înainte să sărezi: cel cumpărat e adesea deja sărat, cel făcut în casă nu. Pune sarea la final, după ce orezul s-a fiert.',
        ),
        t(
          'Cooked rice must be cooled quickly. Cool leftovers within 1 hour in a shallow container, keep them in the fridge, eat them within 1 day and reheat once, until steaming hot. The rice keeps swelling, so thin the soup with a little water when you reheat it.',
          'Orezul fiert trebuie răcit repede. Răcește rămășițele în cel mult 1 oră, într-un vas lat, păstrează-le la frigider, consumă-le în maximum o zi și reîncălzește-le o singură dată, până scot aburi. Orezul continuă să se umfle, așa că subțiază supa cu puțină apă când o reîncălzești.',
        ),
        t(
          'Add the sour cream in the bowl, not in the pot: it can curdle if it boils. For a soup with noodles, leave out the rice and boil thin noodles for the last 5 minutes.',
          'Pune smântâna în bol, nu în oală: se poate tăia dacă fierbe. Pentru o supă cu tăiței, renunță la orez și fierbe tăițeii subțiri ultimele 5 minute.',
        ),
      ],
      stepTips: [
        {
          step: 'rice',
          text: t(
            'Stir gently: hard stirring breaks the grains and makes the soup thick and starchy.',
            'Amestecă ușor: dacă amesteci tare, boabele se sfărâmă și supa se îngroașă și se face cleioasă.',
          ),
        },
      ],
      nutritionNote: t(
        'A filling soup of vegetables and rice, with fibre from the vegetables and carbohydrate from the rice, and little fat if you go light on the oil and sour cream. Tomato juice can be salty, and the soup has little protein, so add an egg, beans or cheese on the side. Sour cream adds saturated fat.',
        'O supă sățioasă de legume și orez, cu fibre din legume și carbohidrați din orez, și puțină grăsime dacă folosești ulei și smântână cu măsură. Sucul de roșii poate fi sărat, iar supa are puține proteine, așa că adaugă alături un ou, fasole sau brânză. Smântâna aduce grăsimi saturate.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Country bread', 'Pâine de casă'),
          reason: t(
            'Good for mopping up the tomato broth.',
            'E bună de înmuiat în supă și de șters bolul la final.',
          ),
          principle: 'complement_flavour',
          ingredient: 'country-bread',
        },
        {
          kind: 'food',
          label: t('Telemea', 'Telemea'),
          reason: t(
            'Its salty, creamy bite rounds off the tangy tomato broth.',
            'Gustul sărat și cremos al telemelei îmblânzește supa acrișoară.',
          ),
          principle: 'complement_flavour',
          ingredient: 'telemea',
        },
        {
          kind: 'food',
          label: t('Hot pepper', 'Ardei iute'),
          reason: t(
            'A bite of fresh heat wakes up a mild soup.',
            'Un pic de iuțeală proaspătă dă viață unei supe blânde.',
          ),
          principle: 'complement_flavour',
          ingredient: 'hot-pepper',
        },
        {
          kind: 'drink',
          label: t('Sparkling water with lemon', 'Apă minerală cu lămâie'),
          reason: t(
            'Cold fizz refreshes the palate between spoonfuls.',
            'Bulele reci împrospătează gustul între două linguri de supă.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'sparkling-water',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'The rice makes it filling without being heavy.',
            'Orezul o face sățioasă fără să fie grea.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, tangy soup warms you up in cold weather.',
            'O supă fierbinte și acrișoară te încălzește pe vreme rece.',
          ),
        },
      ],
    },
    {
      slug: 'tomato-soup-oven-baked',
      method: 'oven-baked',
      title: t('Roasted tomato soup', 'Supă cremă de roșii coapte la cuptor'),
      servings: 4,
      prepMinutes: 10,
      cookMinutes: 65,
      difficulty: 'easy',
      hideBaseTips: [0, 1],
      lines: [
        {
          ingredient: 'tomato',
          quantity: 1000,
          unit: 'g',
          note: t('halved', 'tăiate în jumătate'),
        },
        {
          ingredient: 'bell-pepper',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'red, seeded and cut into large pieces',
            'roșu, fără semințe, tăiat în bucăți mari',
          ),
        },
        {
          ingredient: 'red-onion',
          quantity: 2,
          unit: 'pcs',
          note: t('peeled and quartered', 'curățate și tăiate în sferturi'),
        },
        {
          ingredient: 'garlic',
          quantity: 40,
          unit: 'g',
          note: t(
            'one head, separated into unpeeled cloves',
            'un cap, desfăcut în căței necurățați',
          ),
        },
        { ingredient: 'olive-oil', quantity: 45, unit: 'ml' },
        {
          ingredient: 'thyme',
          quantity: 4,
          unit: 'g',
          optional: true,
          note: t('a few sprigs', 'câteva crenguțe'),
        },
        {
          ingredient: 'vegetable-stock',
          quantity: 500,
          unit: 'ml',
          note: t('hot', 'fierbinte'),
        },
        {
          ingredient: 'basil',
          quantity: 10,
          unit: 'g',
          optional: true,
          note: t('leaves, to finish', 'frunze, la final'),
        },
        { ingredient: 'salt', quantity: 6, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 200 °C (180 °C fan); it takes about 15 minutes. Do the next step while it heats.',
            'Încălzește cuptorul la 200 °C (180 °C cu ventilator); durează aproximativ 15 minute. Fă pasul următor cât timp se încălzește.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'tray',
          text: t(
            'Spread the tomatoes cut side up, the pepper, the onions and the garlic cloves in a single layer on a large tray, or two trays so they do not crowd. Drizzle with the oil, scatter over the thyme, salt and pepper and turn everything over to coat.',
            'Așază roșiile cu partea tăiată în sus, ardeiul, ceapa și cățeii de usturoi într-un singur strat pe o tavă mare sau pe două tăvi, ca să nu fie înghesuite. Stropește cu ulei, presară cimbrișor, sare și piper și amestecă să se îmbrace bine.',
          ),
        },
        {
          key: 'roast',
          text: t(
            'Roast for 40 minutes, turning the onion and pepper once halfway, until the tomato skins are blistered and the edges of the vegetables are browned and caramelised.',
            'Coace 40 de minute, întorcând o dată ceapa și ardeiul la jumătatea timpului, până pielița roșiilor se bășicează, iar marginile legumelor se rumenesc și se caramelizează.',
          ),
          timerSeconds: 2400,
        },
        {
          key: 'cool',
          text: t(
            'Take the trays out and let the vegetables cool for 5 minutes. Slip the loosened skins off the tomatoes, squeeze the soft garlic out of its skins and pull the thyme stems out.',
            'Scoate tăvile și lasă legumele să se răcească 5 minute. Dezbracă roșiile de pielițele desprinse, scoate usturoiul copt din coji, strângându-l între degete, și scoate tulpinile de cimbrișor.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'blend',
          text: t(
            'Tip the vegetables and all the juices from the tray into a pot, add the hot stock and blend with a stick blender for 1 to 2 minutes, until completely smooth.',
            'Pune legumele și tot sucul din tavă într-o oală, adaugă supa fierbinte și mixează cu blenderul vertical 1-2 minute, până devine complet fină.',
          ),
        },
        {
          key: 'finish',
          text: t(
            'Warm the soup over low heat for about 5 minutes. Taste and adjust the salt and pepper, then ladle into bowls and tear the basil over the top.',
            'Încălzește supa la foc mic aproximativ 5 minute. Gustă și ajustează sarea și piperul, apoi toarn-o în boluri și rupe busuioc deasupra.',
          ),
          timerSeconds: 300,
        },
      ],
      tips: [
        t(
          'Let the vegetables really brown at the edges: the caramelised bits give the soup its sweetness, and there is no cream or sugar to add it.',
          'Lasă legumele să se rumenească bine la margini: bucățile caramelizate dau supei dulceața, iar aici nu există frișcă sau zahăr care s-o aducă.',
        ),
        t(
          'Cool leftovers within 2 hours and keep them covered in the fridge for up to 3 days, or freeze them for up to 3 months. Reheat until steaming hot.',
          'Răcește rămășițele în cel mult 2 ore și păstrează-le acoperite la frigider până la 3 zile sau congelează-le până la 3 luni. Reîncălzește-le până scot aburi.',
        ),
      ],
      stepTips: [
        {
          step: 'blend',
          text: t(
            'In a jug blender, fill no more than halfway and keep a towel over the vented lid; hot liquid can push the lid off.',
            'Într-un blender cu vas, umple cel mult pe jumătate și ține un prosop peste capacul cu orificiul deschis; lichidul fierbinte poate sări capacul.',
          ),
        },
      ],
      nutritionNote: t(
        'Nothing is strained off, so the soup keeps the fibre of all the vegetables, and roasting brings out their sweetness, so it needs no cream. The olive oil adds mostly unsaturated fat and some energy, and the stock can be salty, so pick a low-salt one. It has little protein; add bread and cheese to make it a meal.',
        'Nu se strecoară nimic, așa că supa păstrează toate fibrele legumelor, iar coacerea le scoate în evidență dulceața, deci nu are nevoie de frișcă. Uleiul de măsline aduce în special grăsimi nesaturate și ceva energie, iar supa de legume poate fi sărată, deci alege una cu puțină sare. Are puține proteine; adaugă pâine și brânză ca să fie o masă.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Toasted sourdough', 'Pâine cu maia prăjită'),
          reason: t(
            'Crisp toast contrasts with the smooth soup and is good for dipping.',
            'Pâinea crocantă contrastează cu supa fină și e bună pentru înmuiat.',
          ),
          principle: 'contrast_texture',
          ingredient: 'sourdough',
        },
        {
          kind: 'food',
          label: t('Goat cheese', 'Brânză de capră'),
          reason: t(
            'Its tang and creaminess lift the sweet, roasted tomato.',
            'Gustul ei acrișor și cremos pune în valoare roșia coaptă și dulce.',
          ),
          principle: 'complement_flavour',
          ingredient: 'goat-cheese',
        },
        {
          kind: 'food',
          label: t('Shaved Parmesan', 'Fulgi de parmezan'),
          reason: t(
            'A salty, savoury edge for the sweetness of the roasted vegetables.',
            'O notă sărată și savuroasă pentru dulceața legumelor coapte.',
          ),
          principle: 'salt_balances_sweet',
          ingredient: 'parmesan',
        },
        {
          kind: 'drink',
          label: t('Crisp dry white wine', 'Vin alb sec și proaspăt'),
          reason: t(
            'Its bright acidity keeps pace with the roasted tomato.',
            'Aciditatea lui vie ține pasul cu roșia coaptă.',
          ),
          principle: 'complement_flavour',
          ingredient: 'white-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, sweet soup, with the oven warming the kitchen as it roasts.',
            'O supă fierbinte și dulce, iar cuptorul încălzește bucătăria cât se coace.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Light, and the oven does most of the work.',
            'Ușoară, iar cuptorul face cea mai mare parte din muncă.',
          ),
        },
      ],
    },
  ],
};
