import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Chicken salad base is grilled chicken on greens with a vinaigrette. Each
// Variant is a full Recipe with its own lines, steps and guidance; the base's
// Recipe-level Tips are inherited. Chicken is always cooked to 74 °C inside.
export const chickenSalad: BaseRecipeSeed = {
  slug: 'chicken-salad',
  title: t('Chicken salad', 'Salată cu pui'),
  servings: 2,
  prepMinutes: 15,
  cookMinutes: 15,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'chicken-breast',
      quantity: 400,
      unit: 'g',
      note: t(
        '2 breasts, about 200 g each',
        '2 piepți, de aproximativ 200 g fiecare',
      ),
    },
    {
      ingredient: 'olive-oil',
      quantity: 45,
      unit: 'ml',
      note: t(
        '15 ml for the chicken, 30 ml for the vinaigrette',
        '15 ml pentru pui, 30 ml pentru vinegretă',
      ),
    },
    { ingredient: 'lemon-juice', quantity: 30, unit: 'ml' },
    { ingredient: 'wine-vinegar', quantity: 15, unit: 'ml' },
    {
      ingredient: 'garlic',
      quantity: 4,
      unit: 'g',
      note: t('1 clove, grated', '1 cățel, ras'),
    },
    { ingredient: 'mustard', quantity: 5, unit: 'g' },
    { ingredient: 'honey', quantity: 5, unit: 'g' },
    {
      ingredient: 'mixed-salad',
      quantity: 150,
      unit: 'g',
      note: t('washed and dried', 'spălată și uscată'),
    },
    {
      ingredient: 'cherry-tomato',
      quantity: 150,
      unit: 'g',
      note: t('halved', 'tăiate în jumătăți'),
    },
    {
      ingredient: 'cucumber',
      quantity: 0.5,
      unit: 'pcs',
      note: t('sliced', 'tăiat felii'),
    },
    {
      ingredient: 'red-onion',
      quantity: 0.25,
      unit: 'pcs',
      note: t('very thinly sliced', 'tăiată foarte subțire'),
    },
    { ingredient: 'salt', quantity: 3, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
  ],
  steps: [
    {
      key: 'marinate',
      text: t(
        'Put the chicken breasts between two sheets of baking paper and flatten them with a rolling pin to an even thickness of about 2 cm. Rub with 15 ml of the olive oil, half the lemon juice, the garlic, half the salt and the pepper, and leave for 20 minutes.',
        'Pune piepții de pui între două foi de hârtie de copt și aplatizează-i cu făcăluțul la o grosime uniformă de aproximativ 2 cm. Unge-i cu 15 ml din uleiul de măsline, jumătate din sucul de lămâie, usturoiul, jumătate din sare și piper și lasă-i 20 de minute.',
      ),
      timerSeconds: 1200,
    },
    {
      key: 'grill',
      text: t(
        'Heat a grill pan over medium-high heat. Grill the chicken for 5 to 6 minutes per side, turning once, until the thickest part reaches 74 °C inside and the juices run clear.',
        'Încinge o tigaie grill la foc mediu-mare. Gătește puiul 5-6 minute pe fiecare parte, întorcându-l o singură dată, până când partea cea mai groasă ajunge la 74 °C în interior, iar sucul care iese e limpede.',
      ),
      timerSeconds: 660,
    },
    {
      key: 'rest',
      text: t(
        'Move the chicken to a board and rest it for 5 minutes, then slice it across the grain.',
        'Mută puiul pe un tocător și lasă-l să se odihnească 5 minute, apoi taie-l felii, de-a curmezișul fibrei.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'dress',
      text: t(
        'Shake the remaining olive oil, lemon juice, the vinegar, mustard, honey and remaining salt in a jar until creamy.',
        'Agită într-un borcan uleiul de măsline rămas, sucul de lămâie rămas, oțetul, muștarul, mierea și sarea rămasă, până se leagă într-o emulsie cremoasă.',
      ),
    },
    {
      key: 'assemble',
      text: t(
        'Toss the salad leaves, tomatoes, cucumber and onion with two thirds of the vinaigrette. Divide between two plates, top with the sliced chicken and drizzle with the rest.',
        'Amestecă frunzele de salată, roșiile, castravetele și ceapa cu două treimi din vinegretă. Împarte între două farfurii, pune deasupra puiul feliat și toarnă restul de vinegretă.',
      ),
    },
  ],
  tips: [
    t(
      'Flatten the breasts to an even thickness so they cook through at the same pace; otherwise the thin end dries out while the thick part catches up.',
      'Aplatizează piepții la o grosime uniformă, ca să se gătească în același timp; altfel capătul subțire se usucă până se pătrunde partea groasă.',
    ),
    t(
      'Dress the leaves only at the last moment; vinaigrette wilts them within minutes.',
      'Pune dressingul pe frunze abia în ultimul moment; vinegreta le ofilește în câteva minute.',
    ),
    t(
      'A probe thermometer removes the guesswork: 74 °C in the thickest part means safe and still juicy.',
      'Cu un termometru cu sondă nu mai ghicești: 74 °C în partea cea mai groasă înseamnă pui gătit în siguranță și încă suculent.',
    ),
  ],
  stepTips: [
    {
      step: 'rest',
      text: t(
        'Slice only after resting; cut straight away and the juices end up on the board instead of in the chicken.',
        'Taie abia după odihnă; dacă tai imediat, sucul rămâne pe tocător în loc să rămână în carne.',
      ),
    },
  ],
  nutritionNote: t(
    'Lean protein with plenty of fresh vegetables, so it is light yet filling; the olive oil is a healthy fat but adds calories fast, so go easy on the dressing, and without bread it may leave you hungry sooner.',
    'Proteine slabe și multe legume proaspete, deci e ușoară, dar săturătoare; uleiul de măsline e o grăsime sănătoasă, dar adaugă repede calorii, așa că nu exagera cu dressingul, iar fără pâine s-ar putea să ți se facă foame mai repede.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Crusty bread', 'Pâine cu coajă crocantă'),
      reason: t(
        'Crisp crust against tender chicken and soft leaves, and it mops up the vinaigrette.',
        'Coaja crocantă contrastează cu puiul fraged și frunzele moi, iar cu miezul ștergi vinegreta din farfurie.',
      ),
      principle: 'contrast_texture',
      ingredient: 'country-bread',
    },
    {
      kind: 'food',
      label: t('Shaved parmesan', 'Așchii de parmezan'),
      reason: t(
        'Salty, nutty shavings echo the grilled flavour of the chicken.',
        'Așchiile sărate, cu gust de nucă, se potrivesc cu aroma de grătar a puiului.',
      ),
      principle: 'complement_flavour',
      ingredient: 'parmesan',
    },
    {
      kind: 'food',
      label: t('Olives', 'Măsline'),
      reason: t(
        'Briny bites that sharpen the mild chicken.',
        'Bucăți sărate care înviorează gustul blând al puiului.',
      ),
      principle: 'complement_flavour',
      ingredient: 'olives',
    },
    {
      kind: 'drink',
      label: t('Dry white wine', 'Vin alb sec'),
      reason: t(
        'Crisp acidity matches the lemony vinaigrette and cleans the palate.',
        'Aciditatea fină se potrivește cu vinegreta cu lămâie și împrospătează gustul.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'white-wine',
    },
    {
      kind: 'drink',
      label: t('Sparkling water with lemon', 'Apă minerală cu lămâie'),
      reason: t(
        'Light and refreshing, it keeps a lean meal feeling clean.',
        'Ușoară și răcoritoare, lasă senzația unei mese curate, fără greutate.',
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
        'Filling protein without a heavy afternoon slump.',
        'Proteine sățioase, fără senzația de greutate de după-amiază.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Lean protein helps muscles recover; add bread for carbohydrates.',
        'Proteinele slabe ajută mușchii să se refacă; adaugă pâine pentru carbohidrați.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'good_for',
      reason: t(
        'Cool, crisp and needs little time at the stove.',
        'Rece, crocantă și cere puțin timp lângă aragaz.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Raw vegetables and a large portion of meat can feel heavy just before bed.',
        'Legumele crude și o porție mare de carne pot cădea greu chiar înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'chicken-salad-caesar',
      cuisine: 'american',
      title: t('Chicken Caesar salad', 'Salată Caesar cu pui'),
      servings: 2,
      prepMinutes: 20,
      cookMinutes: 20,
      difficulty: 'medium',
      lines: [
        { ingredient: 'chicken-breast', quantity: 400, unit: 'g' },
        {
          ingredient: 'lettuce',
          quantity: 2,
          unit: 'pcs',
          note: t('romaine hearts', 'inimioare de salată romană'),
        },
        {
          ingredient: 'bread',
          quantity: 2,
          unit: 'pcs',
          note: t('slices, cut in 2 cm cubes', 'felii, tăiate cuburi de 2 cm'),
        },
        {
          ingredient: 'olive-oil',
          quantity: 40,
          unit: 'ml',
          note: t(
            '15 ml for the chicken, 25 ml for the croutons',
            '15 ml pentru pui, 25 ml pentru crutoane',
          ),
        },
        { ingredient: 'parmesan', quantity: 40, unit: 'g' },
        {
          ingredient: 'mayonnaise',
          quantity: 60,
          unit: 'g',
          note: t(
            'shop-bought pasteurised mayonnaise, so the dressing has no raw egg',
            'maioneză cumpărată, pasteurizată, ca dressingul să nu conțină ou crud',
          ),
        },
        {
          ingredient: 'anchovies',
          quantity: 10,
          unit: 'g',
          note: t('finely chopped', 'tocați mărunt'),
        },
        {
          ingredient: 'garlic',
          quantity: 5,
          unit: 'g',
          note: t('2 cloves, grated', '2 căței, rași'),
        },
        { ingredient: 'lemon-juice', quantity: 20, unit: 'ml' },
        { ingredient: 'worcestershire-sauce', quantity: 5, unit: 'ml' },
        { ingredient: 'mustard', quantity: 5, unit: 'g' },
        { ingredient: 'salt', quantity: 2, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1.5, unit: 'g' },
      ],
      steps: [
        {
          key: 'croutons',
          text: t(
            'Heat the oven to 190 °C. Toss the bread cubes with 25 ml of olive oil and a pinch of salt, spread on a tray and bake for 10 minutes, turning once, until golden and crisp.',
            'Încălzește cuptorul la 190 °C. Amestecă cuburile de pâine cu 25 ml de ulei de măsline și un praf de sare, întinde-le pe o tavă și coace-le 10 minute, întorcându-le o dată, până se auresc și devin crocante.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'chicken',
          text: t(
            'Flatten the chicken to 2 cm, rub with 15 ml of olive oil, the pepper and a pinch of salt, and grill over medium-high heat for 5 to 6 minutes per side until 74 °C inside. Rest for 5 minutes and slice.',
            'Aplatizează puiul la 2 cm, unge-l cu 15 ml de ulei de măsline, piper și un praf de sare și gătește-l la grill, la foc mediu-mare, 5-6 minute pe fiecare parte, până ajunge la 74 °C în interior. Lasă-l 5 minute să se odihnească și taie-l felii.',
          ),
          timerSeconds: 660,
        },
        {
          key: 'dressing',
          text: t(
            'Mash the anchovies with the garlic into a paste. Whisk in the mayonnaise, lemon juice, Worcestershire sauce, mustard and half the parmesan, finely grated. Add a spoon of cold water if it is too thick to pour.',
            'Pisează anșoa cu usturoiul până obții o pastă. Amestecă cu maioneza, sucul de lămâie, sosul Worcestershire, muștarul și jumătate din parmezan, ras fin. Dacă e prea gros, adaugă o lingură de apă rece.',
          ),
        },
        {
          key: 'toss',
          text: t(
            'Tear the lettuce into large pieces and toss with the dressing until every leaf is coated. Top with the croutons, chicken and shavings of the remaining parmesan.',
            'Rupe salata în bucăți mari și amestec-o cu dressingul până se acoperă fiecare frunză. Pune deasupra crutoanele, puiul și așchii din parmezanul rămas.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'dressing',
          text: t(
            'Mashing the anchovies with a little salt and the garlic dissolves them, so you get savoury depth with no fishy bites.',
            'Dacă pisezi anșoa cu puțină sare și usturoiul, se dizolvă și dau savoare fără bucăți de pește.',
          ),
        },
      ],
      nutritionNote: t(
        'Plenty of protein and calcium from the chicken and parmesan; the mayonnaise dressing, cheese and oiled croutons make it one of the richer salads, high in fat and salt.',
        'Multe proteine și calciu din pui și parmezan; dressingul cu maioneză, brânza și crutoanele în ulei o fac una dintre cele mai bogate salate, cu multe grăsimi și multă sare.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Cherry tomatoes', 'Roșii cherry'),
          reason: t(
            'Sweet, juicy acidity beside the rich, salty dressing.',
            'Aciditate dulce și suculentă lângă dressingul bogat și sărat.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'cherry-tomato',
        },
        {
          kind: 'food',
          label: t('Lemon wedge', 'Felie de lămâie'),
          reason: t(
            'A squeeze of acidity cuts through the creamy dressing.',
            'Câteva picături de lămâie echilibrează dressingul cremos.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'lemon',
        },
        {
          kind: 'drink',
          label: t('Chardonnay', 'Chardonnay'),
          reason: t(
            'Its body holds up to the rich dressing, and the acidity refreshes.',
            'Corpul vinului ține piept dressingului bogat, iar aciditatea împrospătează.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'white-wine',
        },
        {
          kind: 'drink',
          label: t('Sparkling water', 'Apă minerală'),
          reason: t(
            'Bubbles reset the palate between creamy bites.',
            'Bulele împrospătează gustul între înghițituri cremoase.',
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
            'A full lunch in one bowl, though richer than a plain green salad.',
            'Un prânz complet într-un bol, deși mai bogat decât o salată verde simplă.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein plus carbohydrates from the croutons.',
            'Proteine plus carbohidrați din crutoane.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'The creamy dressing and cheese sit heavy during exercise.',
            'Dressingul cremos și brânza cad greu în timpul efortului.',
          ),
        },
      ],
    },
    {
      slug: 'chicken-salad-greek',
      cuisine: 'greek',
      title: t('Greek chicken salad', 'Salată grecească cu pui'),
      servings: 2,
      prepMinutes: 15,
      cookMinutes: 15,
      difficulty: 'easy',
      lines: [
        { ingredient: 'chicken-breast', quantity: 400, unit: 'g' },
        {
          ingredient: 'olive-oil',
          quantity: 60,
          unit: 'ml',
          note: t(
            '15 ml for the chicken, 45 ml for the dressing',
            '15 ml pentru pui, 45 ml pentru dressing',
          ),
        },
        {
          ingredient: 'oregano',
          quantity: 2,
          unit: 'g',
          note: t('dried', 'uscat'),
        },
        { ingredient: 'lemon-juice', quantity: 30, unit: 'ml' },
        { ingredient: 'wine-vinegar', quantity: 15, unit: 'ml' },
        {
          ingredient: 'garlic',
          quantity: 4,
          unit: 'g',
          note: t('1 clove, grated', '1 cățel, ras'),
        },
        {
          ingredient: 'cucumber',
          quantity: 1,
          unit: 'pcs',
          note: t('cut in thick half-moons', 'tăiat în semicercuri groase'),
        },
        {
          ingredient: 'cherry-tomato',
          quantity: 250,
          unit: 'g',
          note: t('halved', 'tăiate în jumătăți'),
        },
        {
          ingredient: 'red-onion',
          quantity: 0.5,
          unit: 'pcs',
          note: t('thinly sliced', 'tăiată subțire'),
        },
        {
          ingredient: 'bell-pepper',
          quantity: 1,
          unit: 'pcs',
          note: t('green, cut in strips', 'verde, tăiat fâșii'),
        },
        {
          ingredient: 'olives',
          quantity: 60,
          unit: 'g',
          note: t('Kalamata, whole', 'Kalamata, întregi'),
        },
        {
          ingredient: 'feta',
          quantity: 100,
          unit: 'g',
          note: t(
            'in a block or large cubes',
            'o bucată întreagă sau cuburi mari',
          ),
        },
        { ingredient: 'salt', quantity: 2, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'marinate',
          text: t(
            'Flatten the chicken to 2 cm. Rub with 15 ml of olive oil, half the oregano, the garlic, half the lemon juice, pepper and half the salt, and leave for 20 minutes.',
            'Aplatizează puiul la 2 cm. Unge-l cu 15 ml de ulei de măsline, jumătate din oregano, usturoiul, jumătate din sucul de lămâie, piper și jumătate din sare și lasă-l 20 de minute.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'grill',
          text: t(
            'Grill over medium-high heat for 5 to 6 minutes per side until 74 °C inside. Rest for 5 minutes, then slice.',
            'Gătește la grill, la foc mediu-mare, 5-6 minute pe fiecare parte, până ajunge la 74 °C în interior. Lasă-l 5 minute să se odihnească, apoi taie-l felii.',
          ),
          timerSeconds: 660,
        },
        {
          key: 'dressing',
          text: t(
            'Whisk the remaining olive oil, lemon juice, the vinegar, the rest of the oregano and the remaining salt.',
            'Amestecă uleiul de măsline rămas, sucul de lămâie rămas, oțetul, restul de oregano și sarea rămasă.',
          ),
        },
        {
          key: 'assemble',
          text: t(
            'Toss the cucumber, tomatoes, onion, pepper and olives with the dressing in a wide bowl. Top with the chicken, lay the feta on top and finish with a pinch of oregano.',
            'Amestecă castravetele, roșiile, ceapa, ardeiul și măslinele cu dressingul într-un bol larg. Pune deasupra puiul, așază feta și termină cu un praf de oregano.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'assemble',
          text: t(
            'Keep the feta in a block and add it last; stirred in, it crumbles and turns the dressing cloudy.',
            'Lasă feta bucată întreagă și pune-o la sfârșit; dacă o amesteci, se sfărâmă și tulbură dressingul.',
          ),
        },
      ],
      nutritionNote: t(
        'Lean protein, lots of vegetables and olive oil make it light and filling; feta brings salt and saturated fat and the olives add more salt, so go easy on them if you watch your salt.',
        'Proteine slabe, multe legume și ulei de măsline o fac ușoară și săturătoare; feta aduce sare și grăsimi saturate, iar măslinele și mai multă sare, așa că folosește-le cu măsură dacă ții cont de sare.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Warm pita', 'Lipie caldă'),
          reason: t(
            'Soft warm bread to scoop up the oily, lemony juices.',
            'Pâine moale și caldă cu care aduni sosul cu ulei și lămâie.',
          ),
          principle: 'regional_tradition',
          ingredient: 'pita',
        },
        {
          kind: 'food',
          label: t('Tzatziki', 'Tzatziki'),
          reason: t(
            'Cool garlicky yogurt dip beside grilled chicken, as on a Greek souvlaki plate.',
            'Sos rece de iaurt cu usturoi lângă puiul la grătar, ca la souvlaki grecesc.',
          ),
          principle: 'regional_tradition',
          ingredient: 'greek-yogurt',
        },
        {
          kind: 'drink',
          label: t('Assyrtiko or dry white wine', 'Assyrtiko sau vin alb sec'),
          reason: t(
            'Mineral, citrusy white wine that is a classic partner to feta and lemon.',
            'Un vin alb mineral, cu note de citrice, partener clasic pentru feta și lămâie.',
          ),
          principle: 'regional_tradition',
          ingredient: 'white-wine',
        },
        {
          kind: 'drink',
          label: t('Iced tea', 'Ceai rece'),
          reason: t(
            'Cool and lightly bitter, it refreshes after salty bites.',
            'Rece și ușor amărui, răcorește după înghițituri sărate.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'iced-tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Cool vegetables and brine are what you crave in the heat.',
            'Legume reci și sărătură, exact ce îți dorești pe căldură.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Fresh and filling without being heavy.',
            'Proaspătă și săturătoare, fără să fie grea.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'avoid',
          reason: t(
            'Cold raw vegetables are less appealing when you want something warm.',
            'Legumele crude și reci sunt mai puțin atrăgătoare când îți dorești ceva cald.',
          ),
        },
      ],
    },
    {
      slug: 'chicken-salad-thai',
      cuisine: 'thai',
      title: t('Thai chicken salad', 'Salată thailandeză cu pui'),
      servings: 2,
      prepMinutes: 20,
      cookMinutes: 15,
      difficulty: 'medium',
      lines: [
        { ingredient: 'chicken-breast', quantity: 400, unit: 'g' },
        { ingredient: 'sunflower-oil', quantity: 15, unit: 'ml' },
        {
          ingredient: 'lime',
          quantity: 2,
          unit: 'pcs',
          note: t('juiced, about 60 ml', 'storsă, aproximativ 60 ml'),
        },
        { ingredient: 'fish-sauce', quantity: 30, unit: 'ml' },
        { ingredient: 'sugar', quantity: 15, unit: 'g' },
        {
          ingredient: 'garlic',
          quantity: 5,
          unit: 'g',
          note: t('2 cloves, minced', '2 căței, tocați mărunt'),
        },
        {
          ingredient: 'hot-pepper',
          quantity: 1,
          unit: 'pcs',
          note: t('red, finely sliced', 'roșu, tăiat subțire'),
        },
        {
          ingredient: 'lettuce',
          quantity: 1,
          unit: 'pcs',
          note: t('crisp, torn', 'crocantă, ruptă bucăți'),
        },
        {
          ingredient: 'cucumber',
          quantity: 1,
          unit: 'pcs',
          note: t('cut in half-moons', 'tăiat în semicercuri'),
        },
        {
          ingredient: 'cherry-tomato',
          quantity: 150,
          unit: 'g',
          note: t('halved', 'tăiate în jumătăți'),
        },
        {
          ingredient: 'red-onion',
          quantity: 0.5,
          unit: 'pcs',
          note: t('thinly sliced', 'tăiată subțire'),
        },
        {
          ingredient: 'mint',
          quantity: 10,
          unit: 'g',
          note: t('leaves', 'frunze'),
        },
        {
          ingredient: 'coriander',
          quantity: 15,
          unit: 'g',
          note: t('leaves and tender stems', 'frunze și tulpini fragede'),
        },
        {
          ingredient: 'peanuts',
          quantity: 30,
          unit: 'g',
          note: t('roasted, roughly chopped', 'prăjite, tocate grosier'),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'chicken',
          text: t(
            'Flatten the chicken to 2 cm, rub with the oil, the pepper and 5 ml of the fish sauce, and grill or pan-fry over medium-high heat for 5 to 6 minutes per side until 74 °C inside. Rest for 5 minutes, then slice thinly or shred.',
            'Aplatizează puiul la 2 cm, unge-l cu ulei, piper și 5 ml din sosul de pește și gătește-l la grill sau în tigaie, la foc mediu-mare, 5-6 minute pe fiecare parte, până ajunge la 74 °C în interior. Lasă-l 5 minute să se odihnească, apoi taie-l subțire sau desfă-l fâșii.',
          ),
          timerSeconds: 660,
        },
        {
          key: 'dressing',
          text: t(
            'Stir the lime juice, the remaining fish sauce, sugar, garlic and chilli until the sugar dissolves. Taste: it should be sour, salty, sweet and hot in balance.',
            'Amestecă sucul de lime, restul de sos de pește, zahărul, usturoiul și ardeiul iute până se dizolvă zahărul. Gustă: trebuie să fie acru, sărat, dulce și iute, în echilibru.',
          ),
        },
        {
          key: 'toss',
          text: t(
            'Toss the lettuce, cucumber, tomatoes, onion, mint and coriander with the chicken and the dressing. Pile onto plates and scatter with the peanuts.',
            'Amestecă salata, castravetele, roșiile, ceapa, menta și coriandrul cu puiul și dressingul. Așază în farfurii și presară cu arahide.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'dressing',
          text: t(
            'Fish sauce brands differ in saltiness, so add it gradually and taste before you pour.',
            'Mărcile de sos de pește diferă ca sărătură, așa că adaugă-l treptat și gustă înainte să torni.',
          ),
        },
      ],
      nutritionNote: t(
        'Lean chicken and a big pile of vegetables and herbs, with very little oil, so it is light and bright; the fish sauce is very salty and the peanuts add fat, while the sugar is small but present.',
        'Pui slab și o grămadă de legume și ierburi, cu foarte puțin ulei, deci e ușoară și proaspătă; sosul de pește e foarte sărat și arahidele aduc grăsime, iar zahărul e puțin, dar prezent.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Jasmine rice', 'Orez jasmin'),
          reason: t(
            'Plain fragrant rice soaks up the sour-salty dressing.',
            'Orezul simplu, parfumat, absoarbe dressingul acru-sărat.',
          ),
          principle: 'complement_flavour',
          ingredient: 'jasmine-rice',
        },
        {
          kind: 'food',
          label: t('Sweet chilli sauce', 'Sos dulce-picant de chili'),
          reason: t(
            'Sweet heat for dipping the chicken.',
            'Dulce și iute, bun de înmuiat bucățile de pui.',
          ),
          principle: 'salt_balances_sweet',
          ingredient: 'sweet-chili-sauce',
        },
        {
          kind: 'drink',
          label: t('Iced tea with lime', 'Ceai rece cu lime'),
          reason: t(
            'Cooling and citrusy against chilli heat.',
            'Răcoritor, cu note de citrice, potolește iuțeala ardeiului.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'iced-tea',
        },
        {
          kind: 'drink',
          label: t('Off-dry Riesling', 'Riesling demisec'),
          reason: t(
            'A touch of sweetness calms the chilli while acidity matches the lime.',
            'O undă de dulceață potolește iuțeala, iar aciditatea se potrivește cu sucul de lime.',
          ),
          principle: 'salt_balances_sweet',
          ingredient: 'white-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Sharp, cold and herby, it refreshes in the heat.',
            'Acră, rece și plină de ierburi, răcorește pe căldură.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Full of protein and vegetables with little oil.',
            'Plină de proteine și legume, cu puțin ulei.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Chilli and a lot of raw vegetables can unsettle the stomach before bed.',
            'Ardeiul iute și multe legume crude pot deranja stomacul înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'chicken-salad-coronation',
      cuisine: 'british',
      // Bound with mayonnaise, not dressed with a vinaigrette.
      hideBaseTips: [1],
      title: t('Coronation chicken', 'Salată de pui Coronation'),
      servings: 2,
      prepMinutes: 15,
      cookMinutes: 20,
      difficulty: 'easy',
      lines: [
        { ingredient: 'chicken-breast', quantity: 400, unit: 'g' },
        { ingredient: 'mayonnaise', quantity: 80, unit: 'g' },
        { ingredient: 'greek-yogurt', quantity: 60, unit: 'g' },
        { ingredient: 'sunflower-oil', quantity: 5, unit: 'ml' },
        {
          ingredient: 'curry-powder',
          quantity: 6,
          unit: 'g',
          note: t('mild', 'blând (nu iute)'),
        },
        {
          ingredient: 'mango-chutney',
          quantity: 30,
          unit: 'g',
          note: t(
            'large mango pieces chopped small',
            'bucățile mari de mango tocate mărunt',
          ),
        },
        { ingredient: 'lemon-juice', quantity: 10, unit: 'ml' },
        { ingredient: 'raisins', quantity: 30, unit: 'g' },
        {
          ingredient: 'almonds',
          quantity: 20,
          unit: 'g',
          note: t('flaked, toasted', 'fulgi, prăjiți'),
        },
        {
          ingredient: 'coriander',
          quantity: 10,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'lettuce',
          quantity: 0.5,
          unit: 'pcs',
          note: t('for serving', 'pentru servit'),
        },
        { ingredient: 'salt', quantity: 2, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'poach',
          text: t(
            'Put the chicken in a pan, cover with cold salted water and bring to a bare simmer. Poach gently for 15 to 18 minutes until 74 °C inside. Lift out, cool completely, then cut into bite-size pieces.',
            'Pune puiul într-o oală, acoperă-l cu apă rece sărată și adu-l la un clocot abia perceptibil. Fierbe-l la foc mic 15-18 minute, până ajunge la 74 °C în interior. Scoate-l, lasă-l să se răcească complet, apoi taie-l în bucăți mici.',
          ),
          timerSeconds: 1020,
        },
        {
          key: 'spice',
          text: t(
            'Warm the oil in a small pan over low heat, stir in the curry powder for 1 minute until fragrant, and cool completely.',
            'Încălzește uleiul într-o tigaie mică, la foc mic, adaugă pudra de curry și amestec-o 1 minut, până se simte aroma, apoi las-o să se răcească complet.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'sauce',
          text: t(
            'Mix the mayonnaise, yogurt, the cooled curry paste, chutney, lemon juice, salt and pepper until smooth.',
            'Amestecă maioneza, iaurtul, pasta de curry răcită, chutney-ul, sucul de lămâie, sarea și piperul până se omogenizează.',
          ),
        },
        {
          key: 'combine',
          text: t(
            'Fold the cold chicken, raisins and half the coriander into the sauce. Chill for 30 minutes, then serve on lettuce, scattered with the almonds and the remaining coriander.',
            'Încorporează puiul rece, stafidele și jumătate din coriandru în sos. Ține la rece 30 de minute, apoi servește pe frunze de salată, presărat cu migdale și restul de coriandru.',
          ),
          timerSeconds: 1800,
        },
      ],
      stepTips: [
        {
          step: 'poach',
          text: t(
            'Cool the chicken before it meets the sauce; warm chicken thins the mayonnaise and makes it greasy.',
            'Lasă puiul să se răcească bine înainte să-l amesteci cu sosul; cald, face maioneza să se subțieze și să se separe.',
          ),
        },
      ],
      nutritionNote: t(
        'Plenty of protein, and the spices and herbs add flavour without much effort; the mayonnaise, chutney and raisins make it rich and fairly sweet, so it is heavier than a leafy salad.',
        'Multe proteine, iar condimentele și ierburile dau savoare fără efort; maioneza, chutney-ul și stafidele o fac bogată și destul de dulce, deci e mai grea decât o salată cu frunze.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Crusty bread', 'Pâine cu coajă crocantă'),
          reason: t(
            'A neutral, starchy base for the rich creamy chicken.',
            'O bază neutră și amidonoasă pentru puiul cremos și bogat.',
          ),
          principle: 'complement_flavour',
          ingredient: 'country-bread',
        },
        {
          kind: 'food',
          label: t('Cucumber slices', 'Felii de castravete'),
          reason: t(
            'Cool, watery crunch against the sweet, spiced sauce.',
            'Textură răcoroasă și crocantă pe lângă sosul dulce și condimentat.',
          ),
          principle: 'contrast_texture',
          ingredient: 'cucumber',
        },
        {
          kind: 'drink',
          label: t('Off-dry white wine', 'Vin alb demisec'),
          reason: t(
            'A little sweetness suits the curry and fruit, with enough acidity to cut the mayonnaise.',
            'O undă de dulceață se potrivește cu curry și fructele, iar aciditatea taie din maioneză.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'white-wine',
        },
        {
          kind: 'drink',
          label: t('Lemonade', 'Limonadă'),
          reason: t(
            'Tart and cold, it freshens the palate after the creamy curry.',
            'Acrișoară și rece, împrospătează gustul după curry-ul cremos.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'lemonade',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Make ahead and serve cold; easy to pack.',
            'Se pregătește din timp și se servește rece; ușor de luat la pachet.',
          ),
        },
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'A classic for a spread, with bread and salad.',
            'Un clasic pe o masă tip bufet, cu pâine și salată.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'The creamy sauce is rich and slow to digest.',
            'Sosul cremos e bogat și se digeră greu.',
          ),
        },
      ],
    },
    {
      slug: 'chicken-salad-creamy-bound',
      method: 'creamy-bound',
      // Bound with mayonnaise, not dressed with a vinaigrette.
      hideBaseTips: [1],
      title: t(
        'Creamy chicken salad sandwich',
        'Sandviș cu salată cremoasă de pui',
      ),
      servings: 2,
      prepMinutes: 15,
      cookMinutes: 20,
      difficulty: 'easy',
      lines: [
        { ingredient: 'chicken-breast', quantity: 300, unit: 'g' },
        { ingredient: 'mayonnaise', quantity: 90, unit: 'g' },
        { ingredient: 'greek-yogurt', quantity: 30, unit: 'g' },
        {
          ingredient: 'celery',
          quantity: 60,
          unit: 'g',
          note: t('finely diced', 'tulpini, tăiate cubulețe mici'),
        },
        {
          ingredient: 'red-onion',
          quantity: 0.25,
          unit: 'pcs',
          note: t('finely diced', 'tăiată cubulețe mici'),
        },
        { ingredient: 'mustard', quantity: 5, unit: 'g' },
        { ingredient: 'lemon-juice', quantity: 10, unit: 'ml' },
        {
          ingredient: 'dill',
          quantity: 5,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'toast-bread',
          quantity: 4,
          unit: 'pcs',
          note: t('slices, lightly toasted', 'felii, prăjite ușor'),
        },
        {
          ingredient: 'lettuce',
          quantity: 0.5,
          unit: 'pcs',
          note: t('a few leaves', 'câteva frunze'),
        },
        { ingredient: 'salt', quantity: 2, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'poach',
          text: t(
            'Cover the chicken with cold salted water, bring to a bare simmer and poach for 15 to 18 minutes until 74 °C inside. Drain and cool completely.',
            'Acoperă puiul cu apă rece sărată, adu-l la un clocot abia perceptibil și fierbe-l 15-18 minute, până ajunge la 74 °C în interior. Scurge-l și lasă-l să se răcească complet.',
          ),
          timerSeconds: 1020,
        },
        {
          key: 'chop',
          text: t(
            'Shred or chop the chicken into small, even pieces, about 1 cm.',
            'Desfă puiul în fâșii sau taie-l în bucăți mici și egale, de aproximativ 1 cm.',
          ),
        },
        {
          key: 'bind',
          text: t(
            'Mix the mayonnaise, yogurt, mustard, lemon juice, salt and pepper. Fold in the chicken, celery, onion and dill until everything is coated and holds together. Chill for 20 minutes.',
            'Amestecă maioneza, iaurtul, muștarul, sucul de lămâie, sarea și piperul. Încorporează puiul, tulpinile de țelină, ceapa și mărarul până se acoperă totul și compoziția se leagă. Ține la rece 20 de minute.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'fill',
          text: t(
            'Spread the salad on two slices of toast, add lettuce and close with the other slices. Cut in half and serve.',
            'Întinde salata pe două felii de pâine prăjită, adaugă frunze de salată și acoperă cu celelalte felii. Taie în două și servește.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'bind',
          text: t(
            'Chilling lets the flavours meld and the mixture firm up, so it stays in the sandwich instead of sliding out.',
            'Cât stă la rece, aromele se armonizează și compoziția se închegă, așa că rămâne în sandviș în loc să curgă.',
          ),
        },
      ],
      nutritionNote: t(
        'Good protein and a convenient, filling lunch; the mayonnaise binder and bread make it energy-dense, high in fat, and light on vegetables unless you add leaves and crunchy celery.',
        'Proteine bune și un prânz practic și săturător; maioneza și pâinea o fac bogată în energie, cu multe grăsimi și puține legume, dacă nu adaugi frunze și tulpini de țelină crocante.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Pickled cucumbers', 'Castraveți murați'),
          reason: t(
            'Sharp acidity cuts through the creamy filling.',
            'Aciditatea intensă taie din umplutura cremoasă.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-cucumbers',
        },
        {
          kind: 'food',
          label: t('Crisp salad leaves', 'Frunze de salată crocante'),
          reason: t(
            'Fresh crunch against soft chicken and bread.',
            'Textură proaspătă și crocantă pe lângă puiul și pâinea moi.',
          ),
          principle: 'contrast_texture',
          ingredient: 'lettuce',
        },
        {
          kind: 'drink',
          label: t('Iced tea', 'Ceai rece'),
          reason: t(
            'Light and slightly tannic, it refreshes between rich bites.',
            'Ușor și puțin astringent, răcorește între înghițituri bogate.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'iced-tea',
        },
        {
          kind: 'drink',
          label: t('Sparkling water', 'Apă minerală'),
          reason: t(
            'A clean palate cleanser for a creamy sandwich.',
            'Un mod curat de a împrospăta gura după un sandviș cremos.',
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
            'Portable and filling; easy to make the night before.',
            'Ușor de luat la pachet și săturător; se poate pregăti seara dinainte.',
          ),
        },
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'Easy to serve to a table as finger food.',
            'Tăiat în triunghiuri, se servește ușor și se mănâncă cu mâna.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'A mayonnaise salad should not sit in the heat; keep it cold.',
            'O salată cu maioneză nu trebuie lăsată la căldură; ține-o la rece.',
          ),
        },
      ],
    },
    {
      slug: 'chicken-salad-warm',
      method: 'warm-salad',
      title: t('Warm chicken salad', 'Salată caldă cu pui'),
      servings: 2,
      prepMinutes: 15,
      cookMinutes: 15,
      difficulty: 'medium',
      lines: [
        { ingredient: 'chicken-breast', quantity: 400, unit: 'g' },
        {
          ingredient: 'olive-oil',
          quantity: 45,
          unit: 'ml',
          note: t(
            '15 ml for the chicken, 30 ml for the warm dressing',
            '15 ml pentru pui, 30 ml pentru dressingul cald',
          ),
        },
        {
          ingredient: 'spinach',
          quantity: 80,
          unit: 'g',
          note: t('baby leaves', 'frunze tinere'),
        },
        { ingredient: 'rocket', quantity: 60, unit: 'g' },
        {
          ingredient: 'red-onion',
          quantity: 0.5,
          unit: 'pcs',
          note: t('thinly sliced', 'tăiată subțire'),
        },
        { ingredient: 'balsamic-vinegar', quantity: 20, unit: 'ml' },
        { ingredient: 'mustard', quantity: 5, unit: 'g' },
        { ingredient: 'honey', quantity: 5, unit: 'g' },
        {
          ingredient: 'walnuts',
          quantity: 30,
          unit: 'g',
          note: t('roughly chopped', 'tocate grosier'),
        },
        { ingredient: 'salt', quantity: 3, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'sear',
          text: t(
            'Flatten the chicken to 2 cm and season with salt and pepper. Heat 15 ml of oil in a heavy pan over medium-high heat and cook the chicken for 5 to 6 minutes per side until 74 °C inside. Move to a board and rest for 5 minutes.',
            'Aplatizează puiul la 2 cm și condimentează-l cu sare și piper. Încinge 15 ml de ulei într-o tigaie grea, la foc mediu-mare, și gătește puiul 5-6 minute pe fiecare parte, până ajunge la 74 °C în interior. Mută-l pe un tocător și lasă-l 5 minute să se odihnească.',
          ),
          timerSeconds: 660,
        },
        {
          key: 'dressing',
          text: t(
            'In the same pan over medium heat, warm the remaining oil, add the onion and walnuts and cook for 2 minutes until the onion softens. Off the heat, stir in the balsamic vinegar, mustard and honey, scraping up the browned bits.',
            'În aceeași tigaie, la foc mediu, încălzește uleiul rămas, adaugă ceapa și nucile și gătește 2 minute, până se înmoaie ceapa. Ia tigaia de pe foc și amestecă oțetul balsamic, muștarul și mierea, răzuind resturile rumenite de pe fundul tigăii.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'wilt',
          text: t(
            'Put the spinach and rocket in a large bowl, pour over the warm dressing and toss for 30 seconds until the leaves just start to wilt. Divide between plates, top with the sliced chicken and serve at once.',
            'Pune spanacul și rucola într-un bol mare, toarnă dressingul cald și amestecă 30 de secunde, până când frunzele abia încep să se ofilească. Împarte în farfurii, pune deasupra puiul feliat și servește imediat.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'wilt',
          text: t(
            'Dress and serve straight away; the leaves should be barely wilted, not soggy.',
            'Toarnă dressingul și servește imediat; frunzele trebuie să fie abia ofilite, nu înmuiate.',
          ),
        },
      ],
      nutritionNote: t(
        'Lean protein with iron-rich leafy greens, and the warmth makes it more comforting; the walnuts and oil add healthy fat but plenty of energy, and the honey and balsamic add a little sugar.',
        'Proteine slabe cu frunze verzi bogate în fier, iar căldura o face mai reconfortantă; nucile și uleiul aduc grăsimi sănătoase, dar și multă energie, iar mierea și balsamicul adaugă puțin zahăr.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Warm crusty bread', 'Pâine caldă, cu coajă crocantă'),
          reason: t(
            'Soaks up the warm dressing from the plate.',
            'Absoarbe dressingul cald din farfurie.',
          ),
          principle: 'complement_flavour',
          ingredient: 'country-bread',
        },
        {
          kind: 'food',
          label: t('Goat cheese', 'Brânză de capră'),
          reason: t(
            'Tangy and creamy against the sweet-sour balsamic.',
            'Acrișoară și cremoasă, pe lângă balsamicul dulce-acrișor.',
          ),
          principle: 'complement_flavour',
        },
        {
          kind: 'drink',
          label: t('Light red wine', 'Vin roșu ușor'),
          reason: t(
            'Soft tannins and fruit meet the balsamic and walnuts.',
            'Taninii moi și fructele se potrivesc cu balsamicul și nucile.',
          ),
          principle: 'complement_flavour',
          ingredient: 'red-wine',
        },
        {
          kind: 'drink',
          label: t('Mint tea', 'Ceai de mentă'),
          reason: t(
            'A warm, light drink for a cosy meal.',
            'O băutură caldă și ușoară pentru o masă liniștită.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'mint-tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Warm chicken and dressing make a salad feel like a proper meal.',
            'Puiul cald și dressingul cald fac din salată o masă adevărată.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Quick, light and satisfying.',
            'Rapidă, ușoară și satisfăcătoare.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Walnuts and a hearty portion of chicken are better earlier in the day.',
            'Nucile și o porție consistentă de pui sunt mai potrivite mai devreme în cursul zilei.',
          ),
        },
      ],
    },
  ],
};
