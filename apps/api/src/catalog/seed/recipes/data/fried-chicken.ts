import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Fried chicken base is flour-dredged, shallow pan-fried bone-in chicken.
// Each Variant is a full Recipe; the base's Recipe-level Tips are inherited.
export const friedChicken: BaseRecipeSeed = {
  slug: 'fried-chicken',
  title: t('Fried chicken', 'Pui prăjit'),
  servings: 4,
  prepMinutes: 40,
  cookMinutes: 25,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'chicken-leg-quarters',
      quantity: 1,
      unit: 'kg',
      note: t('cut into thighs and drumsticks', 'tăiate în pulpe și copănele'),
    },
    { ingredient: 'salt', quantity: 8, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
    { ingredient: 'paprika', quantity: 4, unit: 'g' },
    { ingredient: 'garlic-powder', quantity: 3, unit: 'g' },
    { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
    { ingredient: 'milk', quantity: 60, unit: 'ml' },
    { ingredient: 'flour', quantity: 150, unit: 'g' },
    {
      ingredient: 'sunflower-oil',
      quantity: 350,
      unit: 'ml',
      note: t(
        'for shallow frying, about 1.5 cm deep',
        'pentru prăjit în strat subțire, cam 1,5 cm adâncime',
      ),
    },
  ],
  steps: [
    {
      key: 'season',
      text: t(
        'Pat the chicken dry. Mix the salt, pepper, paprika and garlic powder, rub it over the chicken and leave it for 30 minutes at room temperature.',
        'Șterge puiul cu prosop de hârtie. Amestecă sarea, piperul, boiaua și usturoiul pudră, freacă bucățile cu amestecul și lasă-le 30 de minute la temperatura camerei.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'dredge',
      text: t(
        'Beat the eggs with the milk in a shallow dish and put the flour in another. Dip each piece in the egg, let the excess drip off, then roll it in the flour and press the flour on. Set the pieces on a rack for 10 minutes so the coating sticks.',
        'Bate ouăle cu laptele într-un vas lat și pune făina în altul. Trece fiecare bucată prin ou, lasă excesul să se scurgă, apoi rulează-o prin făină și apasă bine. Așază bucățile pe un grătar 10 minute, ca stratul de făină să se prindă.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'heat',
      text: t(
        'Pour the oil into a large, heavy 28 to 30 cm skillet and heat it over medium heat to 170 °C. Check it with a thermometer; a pinch of flour should sizzle steadily, not violently.',
        'Toarnă uleiul într-o tigaie grea, mare, de 28-30 cm și încinge-l la foc mediu spre 170 °C. Verifică cu un termometru; un praf de făină trebuie să sfârâie constant, nu violent.',
      ),
    },
    {
      key: 'fry',
      text: t(
        'Lower the pieces in carefully, skin side down, without crowding (fry in two batches if needed). Fry for 10 to 12 minutes until deep golden, turn with tongs and fry another 10 to 12 minutes. Keep the oil between 150 and 170 °C, adjusting the heat as needed.',
        'Coboară bucățile cu grijă, cu pielea în jos, fără să le înghesui (prăjește în două serii, dacă e nevoie). Prăjește 10-12 minute până se rumenesc intens, întoarce-le cu cleștele și mai prăjește 10-12 minute. Ține uleiul între 150 și 170 °C, reglând focul.',
      ),
      timerSeconds: 1320,
    },
    {
      key: 'check',
      text: t(
        'Push a probe thermometer into the thickest part of a thigh without touching the bone. It must read at least 74 °C, and the juices must run clear.',
        'Înfige un termometru cu sondă în cea mai groasă parte a unei pulpe, fără să atingi osul. Trebuie să arate cel puțin 74 °C, iar zeama să iasă limpede.',
      ),
    },
    {
      key: 'rest',
      text: t(
        'Lift the chicken onto a wire rack, not paper towels, and rest it for 5 minutes. Serve hot.',
        'Scoate puiul pe un grătar de sârmă, nu pe hârtie, și lasă-l să se odihnească 5 minute. Servește cald.',
      ),
      timerSeconds: 300,
    },
  ],
  tips: [
    t(
      'Never leave hot oil unattended, and keep a lid nearby to smother a flare-up; never pour water on an oil fire.',
      'Nu lăsa niciodată uleiul încins nesupravegheat și ține un capac la îndemână ca să înăbuși flăcările; nu turna niciodată apă pe ulei care arde.',
    ),
    t(
      'Hold the oil at about 170 °C: too cool and the coating turns greasy, too hot and it burns before the chicken is cooked through.',
      'Ține uleiul în jur de 170 °C: prea rece, crusta iese grasă; prea fierbinte, se arde înainte ca puiul să se gătească în interior.',
    ),
    t(
      'Let the chicken rest on a rack so steam does not soften the crust underneath.',
      'Lasă puiul să se odihnească pe grătar, ca aburul să nu înmoaie crusta de dedesubt.',
    ),
  ],
  stepTips: [
    {
      step: 'fry',
      text: t(
        'Take the chill off the chicken before it goes in, and add pieces one at a time: cold, crowded chicken drops the oil temperature fast.',
        'Scoate puiul din frigider din timp și adaugă bucățile pe rând: carnea rece, înghesuită în tigaie, scade repede temperatura uleiului.',
      ),
    },
    {
      step: 'check',
      text: t(
        'Thighs and drumsticks stay juicy and taste better a little past 74 °C; 80 °C is fine for dark meat.',
        'Pulpele și copănelele rămân suculente și au gust mai bun și puțin peste 74 °C; 80 °C e în regulă pentru carnea închisă la culoare.',
      ),
    },
  ],
  nutritionNote: t(
    'A good source of protein, and the dark meat brings iron and zinc; but the flour crust soaks up frying oil, and the skin adds saturated fat and plenty of calories, so eat it as an occasional treat with something fresh and green.',
    'O sursă bună de proteine, iar carnea închisă la culoare aduce fier și zinc; în schimb, crusta de făină absoarbe uleiul de prăjit, iar pielea adaugă grăsimi saturate și multe calorii, așa că mănâncă-l ocazional, alături de ceva proaspăt și verde.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Creamy coleslaw', 'Salată de varză cu maioneză'),
      reason: t(
        'Cool, crunchy cabbage cuts through the rich crust and refreshes each bite.',
        'Varza rece și crocantă taie din bogăția crustei și împrospătează fiecare îmbucătură.',
      ),
      principle: 'contrast_texture',
      ingredient: 'cabbage',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sharp acidity cuts the fat of the fried crust.',
        'Aciditatea lor ascuțită taie grăsimea crustei prăjite.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'food',
      label: t('Lemon wedges', 'Felii de lămâie'),
      reason: t(
        'A squeeze of lemon brightens the rich, salty chicken.',
        'Câteva picături de lămâie înviorează carnea bogată și sărată.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'lemon',
    },
    {
      kind: 'drink',
      label: t('Cold lager', 'Bere blondă rece'),
      reason: t(
        'Its bubbles and light bitterness cleanse the palate between fatty bites.',
        'Bulele și amăreala ușoară curăță gura între îmbucăturile grase.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'beer',
    },
    {
      kind: 'drink',
      label: t('Iced tea', 'Ceai rece'),
      reason: t(
        'Light, tannic and cold, it resets the palate without adding richness.',
        'Ușor, tanic și rece, resetează gura fără să adauge bogăție.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'iced-tea',
    },
  ],
  eatingMoments: [
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'The protein helps muscles recover; add a side of salad or potatoes.',
        'Proteinele ajută mușchii să se refacă; adaugă o salată sau cartofi.',
      ),
    },
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'Hot, crisp and filling comfort food.',
        'Mâncare caldă, crocantă și săturătoare.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Fried food sits heavy in the stomach during exercise.',
        'Mâncarea prăjită cade greu la stomac în timpul efortului.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A heavy, fatty meal can disturb sleep.',
        'O masă grea și grasă poate strica somnul.',
      ),
    },
  ],
  variants: [
    {
      slug: 'fried-chicken-southern',
      cuisine: 'american',
      title: t(
        'Southern buttermilk fried chicken',
        'Pui prăjit în stil sudist, cu zară',
      ),
      servings: 4,
      prepMinutes: 30,
      cookMinutes: 25,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'chicken-leg-quarters',
          quantity: 1,
          unit: 'kg',
          note: t(
            'cut into thighs and drumsticks',
            'tăiate în pulpe și copănele',
          ),
        },
        {
          ingredient: 'buttermilk',
          quantity: 0.5,
          unit: 'l',
          note: t(
            'for the overnight soak',
            'pentru marinat de seara până dimineața',
          ),
        },
        { ingredient: 'hot-sauce', quantity: 15, unit: 'ml' },
        { ingredient: 'salt', quantity: 10, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 3, unit: 'g' },
        { ingredient: 'paprika', quantity: 5, unit: 'g' },
        { ingredient: 'chili-powder', quantity: 2, unit: 'g' },
        { ingredient: 'garlic-powder', quantity: 4, unit: 'g' },
        { ingredient: 'onion-powder', quantity: 4, unit: 'g' },
        { ingredient: 'flour', quantity: 200, unit: 'g' },
        { ingredient: 'baking-powder', quantity: 3, unit: 'g' },
        { ingredient: 'sunflower-oil', quantity: 400, unit: 'ml' },
      ],
      steps: [
        {
          key: 'soak',
          text: t(
            'Whisk the buttermilk with the hot sauce and 5 g of the salt. Add the chicken, turn to coat, cover and chill for at least 4 hours, ideally overnight.',
            'Amestecă zara cu sosul picant și 5 g din sare. Adaugă puiul, răstoarnă-l prin amestec, acoperă și pune-l la frigider cel puțin 4 ore, ideal de seara până dimineața.',
          ),
        },
        {
          key: 'flour',
          text: t(
            'Mix the flour with the baking powder, the remaining salt, the pepper, paprika, chilli powder, garlic powder and onion powder in a wide bowl. Drizzle 3 tablespoons (45 ml) of the buttermilk marinade into the flour and rub it in with your fingertips to make small shaggy clumps.',
            'Amestecă făina cu praful de copt, sarea rămasă, piperul, boiaua, ardeiul iute, usturoiul pudră și ceapa pudră într-un castron lat. Stropește cu 45 ml din marinada de zară și frământă cu vârful degetelor până se formează cocoloașe mici, zdrențuite.',
          ),
        },
        {
          key: 'dredge',
          text: t(
            'Lift each piece out of the buttermilk, let the excess drip off, press it firmly into the flour, then rest it on a rack for 15 minutes.',
            'Scoate fiecare bucată din zară, lasă excesul să se scurgă, apasă-o bine în făină, apoi las-o 15 minute pe un grătar.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'fry',
          text: t(
            'Heat the oil in a large heavy skillet to 165 to 170 °C. Fry skin side down for 10 to 12 minutes, turn and fry 10 to 12 minutes more, keeping the oil between 150 and 170 °C. Do not crowd the pan.',
            'Încinge uleiul într-o tigaie mare și grea la 165-170 °C. Prăjește cu pielea în jos 10-12 minute, întoarce și mai prăjește 10-12 minute, ținând uleiul între 150 și 170 °C. Nu înghesui tigaia.',
          ),
          timerSeconds: 1320,
        },
        {
          key: 'check',
          text: t(
            'Check the thickest part of a thigh: at least 74 °C inside. Rest on a wire rack for 5 minutes.',
            'Verifică partea cea mai groasă a unei pulpe: cel puțin 74 °C în interior. Lasă la odihnit 5 minute pe un grătar de sârmă.',
          ),
          timerSeconds: 300,
        },
      ],
      stepTips: [
        {
          step: 'flour',
          text: t(
            'The little clumps are what turn into the craggy, extra-crisp bits of crust.',
            'Cocoloașele mici sunt cele care devin porțiunile crocante și zgrunțuroase ale crustei.',
          ),
        },
      ],
      tips: [
        t(
          'Buttermilk tenderises the meat gently; a soak longer than a day makes it mushy.',
          'Zara înmoaie ușor carnea; un marinat de peste o zi o face păstoasă.',
        ),
      ],
      nutritionNote: t(
        'Buttermilk makes the meat tender and adds a little calcium, and the seasoning is flavourful without much extra fat; but the thick, craggy crust soaks up a lot of frying oil, and the salt in the soak and the coating adds up.',
        'Zara înmoaie carnea și aduce puțin calciu, iar condimentele dau gust fără multă grăsime în plus; în schimb, crusta groasă și zgrunțuroasă absoarbe mult ulei, iar sarea din marinadă și din crustă se adună.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Coleslaw', 'Salată coleslaw'),
          reason: t(
            'Cool, tangy crunch against the hot spiced crust.',
            'Crocanta rece și acidulată contrastează cu crusta caldă și condimentată.',
          ),
          principle: 'contrast_texture',
          ingredient: 'cabbage',
        },
        {
          kind: 'food',
          label: t('Honey drizzle', 'Miere peste pui'),
          reason: t(
            'Sweet honey plays against the salty, peppery crust.',
            'Mierea dulce se joacă cu crusta sărată și piperată.',
          ),
          principle: 'salt_balances_sweet',
          ingredient: 'honey',
        },
        {
          kind: 'food',
          label: t('Hot sauce', 'Sos picant'),
          reason: t(
            'Vinegary heat lifts the rich fried coating.',
            'Iuțeala acră înviorează crusta bogată și prăjită.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'hot-sauce',
        },
        {
          kind: 'drink',
          label: t('Sweet iced tea', 'Ceai rece îndulcit'),
          reason: t(
            'The classic Southern pairing: cold, sweet and tannic.',
            'Asocierea clasică din Sud: rece, dulce și tanic.',
          ),
          principle: 'regional_tradition',
          ingredient: 'iced-tea',
        },
        {
          kind: 'drink',
          label: t('Lemonade', 'Limonadă'),
          reason: t(
            'Tart and cold, it refreshes the palate between bites.',
            'Acidulată și rece, împrospătează gura între îmbucături.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'lemonade',
        },
      ],
      eatingMoments: [
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Good picnic food, tasty even served warm or cold.',
            'Bun pentru picnic, gustos și servit călduț sau rece.',
          ),
        },
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'A Southern classic for a late, leisurely meal.',
            'Un clasic sudist pentru o masă târzie, fără grabă.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Heavy, fatty crust is slow to digest.',
            'Crusta grea și grasă se digeră încet.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Very rich and salty before bed.',
            'Foarte bogat și sărat înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'fried-chicken-korean',
      cuisine: 'korean',
      title: t(
        'Korean double-fried chicken with gochujang glaze',
        'Pui coreean prăjit de două ori, cu glazură de gochujang',
      ),
      servings: 4,
      prepMinutes: 25,
      cookMinutes: 30,
      difficulty: 'hard',
      lines: [
        {
          ingredient: 'chicken-wings',
          quantity: 1,
          unit: 'kg',
          note: t('split at the joint', 'tăiate la încheietură'),
        },
        { ingredient: 'salt', quantity: 5, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
        { ingredient: 'potato-starch', quantity: 100, unit: 'g' },
        { ingredient: 'flour', quantity: 50, unit: 'g' },
        { ingredient: 'sunflower-oil', quantity: 1, unit: 'l' },
        { ingredient: 'gochujang', quantity: 60, unit: 'g' },
        { ingredient: 'soy-sauce', quantity: 15, unit: 'ml' },
        { ingredient: 'honey', quantity: 30, unit: 'g' },
        { ingredient: 'rice-vinegar', quantity: 15, unit: 'ml' },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t('finely grated', 'dat pe răzătoare fină'),
        },
        {
          ingredient: 'ginger',
          quantity: 5,
          unit: 'g',
          note: t('finely grated', 'dat pe răzătoare fină'),
        },
        { ingredient: 'sesame-seeds', quantity: 5, unit: 'g' },
        { ingredient: 'spring-onion', quantity: 20, unit: 'g', optional: true },
      ],
      steps: [
        {
          key: 'season',
          text: t(
            'Pat the wings very dry and toss them with the salt and pepper.',
            'Șterge aripioarele foarte bine și amestecă-le cu sarea și piperul.',
          ),
        },
        {
          key: 'coat',
          text: t(
            'Mix the potato starch and the flour and toss the wings in it until lightly and evenly coated. Shake off the excess.',
            'Amestecă amidonul de cartofi cu făina și rostogolește aripioarele prin amestec până se acoperă ușor și uniform. Scutură excesul.',
          ),
        },
        {
          key: 'fry1',
          text: t(
            'Heat the oil in a deep, heavy pot (no more than half full) to 160 °C. Fry the wings in batches for 8 to 10 minutes until pale gold and cooked through, and lift onto a rack. Rest them for at least 10 minutes.',
            'Încinge uleiul într-o oală adâncă și grea (cel mult pe jumătate plină) la 160 °C. Prăjește aripioarele în serii 8-10 minute, până sunt aurii-pale și gătite în interior, și scoate-le pe un grătar. Lasă-le să se odihnească cel puțin 10 minute.',
          ),
          timerSeconds: 540,
        },
        {
          key: 'glaze',
          text: t(
            'While they rest, simmer the gochujang, soy sauce, honey, rice vinegar, garlic, ginger and 30 ml of water in a small pan for 2 to 3 minutes until glossy. Keep it warm.',
            'Cât se odihnesc, fierbe la foc mic gochujang, sosul de soia, mierea, oțetul de orez, usturoiul, ghimbirul și 30 ml de apă într-o cratiță mică 2-3 minute, până devine lucios. Ține-l cald.',
          ),
          timerSeconds: 150,
        },
        {
          key: 'fry2',
          text: t(
            'Raise the oil to 180 °C and fry the wings again for 3 to 4 minutes until deep golden and very crisp. Check one wing: at least 74 °C inside.',
            'Ridică uleiul la 180 °C și prăjește aripioarele încă 3-4 minute, până sunt auriu închis și foarte crocante. Verifică o aripioară: cel puțin 74 °C în interior.',
          ),
          timerSeconds: 210,
        },
        {
          key: 'toss',
          text: t(
            'Toss the hot wings in the warm glaze, then scatter the sesame seeds and the sliced spring onion over them. Serve immediately.',
            'Amestecă aripioarele fierbinți cu glazura caldă, apoi presară susan și ceapă verde tăiată felii. Servește imediat.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'fry2',
          text: t(
            'The rest between fries lets moisture escape from the surface, which is what makes the crust glass-crisp.',
            'Pauza dintre cele două prăjiri lasă umezeala să iasă la suprafață, iar asta face crusta crocantă ca sticla.',
          ),
        },
      ],
      tips: [
        t(
          'Glaze only just before serving; sauce softens the crust within minutes.',
          'Glazează chiar înainte de servire; sosul înmoaie crusta în câteva minute.',
        ),
      ],
      nutritionNote: t(
        'Wings give protein, and the starch crust is thin and light; but frying twice and the sugary, salty glaze make this rich in oil, sugar and sodium, and the skin carries plenty of saturated fat, so keep portions modest.',
        'Aripioarele dau proteine, iar crusta de amidon e subțire și ușoară; dar prăjirea dublă și glazura dulce și sărată o fac bogată în ulei, zahăr și sodiu, iar pielea aduce multe grăsimi saturate, deci păstrează porții mici.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Pickled radish or cucumber', 'Muraturi dulci-acrișoare'),
          reason: t(
            'Sharp, crunchy pickles cut the rich, sticky glaze.',
            'Murăturile ascuțite și crocante taie din glazura bogată și lipicioasă.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-cucumbers',
        },
        {
          kind: 'food',
          label: t('Steamed rice', 'Orez fiert la abur'),
          reason: t(
            'Plain rice softens the heat and sweetness of the glaze.',
            'Orezul simplu domolește iuțeala și dulceața glazurii.',
          ),
          principle: 'complement_flavour',
          ingredient: 'rice',
        },
        {
          kind: 'food',
          label: t('Sesame seeds', 'Semințe de susan'),
          reason: t(
            'Nutty seeds add crunch and tie in with the Korean flavours.',
            'Semințele cu gust de nucă adaugă crocanță și se potrivesc cu aromele coreene.',
          ),
          principle: 'regional_tradition',
          ingredient: 'sesame-seeds',
        },
        {
          kind: 'drink',
          label: t('Cold beer', 'Bere rece'),
          reason: t(
            'The classic Korean "chimaek" partner: light bubbles calm the chilli heat.',
            'Perechea clasică coreeană, „chimaek”: bulele ușoare domolesc iuțeala.',
          ),
          principle: 'regional_tradition',
          ingredient: 'beer',
        },
        {
          kind: 'drink',
          label: t('Sparkling water', 'Apă minerală'),
          reason: t(
            'Cold bubbles refresh the palate between sticky bites.',
            'Bulele reci împrospătează gura între îmbucăturile lipicioase.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'sparkling-water',
        },
      ],
      eatingMoments: [
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Rich, spicy and fried is hard on sleep and digestion.',
            'Bogat, picant și prăjit îngreunează somnul și digestia.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Double-fried and sugary, it sits heavy.',
            'Prăjit de două ori și îndulcit, cade greu.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'The chilli warmth is welcome in cold weather.',
            'Iuțeala încălzește pe vreme rece.',
          ),
        },
      ],
    },
    {
      slug: 'fried-chicken-karaage',
      cuisine: 'japanese',
      title: t('Japanese karaage', 'Karaage japonez'),
      servings: 4,
      prepMinutes: 40,
      cookMinutes: 12,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'chicken-thighs',
          quantity: 700,
          unit: 'g',
          note: t(
            'skin on if available, cut into 4 cm pieces',
            'cu piele, dacă se găsesc, tăiate bucăți de 4 cm',
          ),
        },
        { ingredient: 'soy-sauce', quantity: 45, unit: 'ml' },
        {
          ingredient: 'ginger',
          quantity: 15,
          unit: 'g',
          note: t('finely grated', 'dat pe răzătoare fină'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t('finely grated', 'dat pe răzătoare fină'),
        },
        { ingredient: 'sugar', quantity: 5, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        { ingredient: 'potato-starch', quantity: 90, unit: 'g' },
        { ingredient: 'sunflower-oil', quantity: 800, unit: 'ml' },
        { ingredient: 'lemon', quantity: 1, unit: 'pcs' },
        { ingredient: 'mayonnaise', quantity: 60, unit: 'g', optional: true },
      ],
      steps: [
        {
          key: 'marinate',
          text: t(
            'Mix the soy sauce, ginger, garlic, sugar and pepper. Massage into the chicken and marinate in the fridge for 30 minutes, no longer than 2 hours.',
            'Amestecă sosul de soia, ghimbirul, usturoiul, zahărul și piperul. Masează amestecul în carne și lasă la marinat la frigider 30 de minute, nu mai mult de 2 ore.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'coat',
          text: t(
            'Do not drain the chicken. Just before frying, toss it with the potato starch piece by piece until coated, and shake off the excess.',
            'Nu scurge carnea. Chiar înainte de prăjit, rostogolește bucățile prin amidonul de cartofi, una câte una, și scutură excesul.',
          ),
        },
        {
          key: 'fry1',
          text: t(
            'Heat the oil in a deep, heavy pot (no more than half full) to 170 °C. Fry in small batches for 4 to 5 minutes until light golden, and lift onto a rack. Rest for 3 minutes.',
            'Încinge uleiul într-o oală adâncă și grea (cel mult pe jumătate plină) la 170 °C. Prăjește în serii mici 4-5 minute, până se auresc ușor, și scoate pe un grătar. Lasă 3 minute.',
          ),
          timerSeconds: 270,
        },
        {
          key: 'fry2',
          text: t(
            'Raise the oil to 190 °C and fry the pieces for 1 minute until deep golden and crisp. A piece cut open must read at least 74 °C.',
            'Ridică uleiul la 190 °C și prăjește bucățile 1 minut, până sunt auriu închis și crocante. Un cub tăiat în două trebuie să aibă cel puțin 74 °C în interior.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'serve',
          text: t(
            'Drain on a rack and serve hot with lemon wedges and, if you like, Japanese-style mayonnaise.',
            'Scurge pe un grătar și servește fierbinte cu felii de lămâie și, dacă vrei, cu maioneză în stil japonez.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'marinate',
          text: t(
            'Grated ginger is the heart of karaage; use a fine grater so it spreads evenly into the meat.',
            'Ghimbirul ras e inima karaage-ului; folosește o răzătoare fină ca să se împrăștie uniform în carne.',
          ),
        },
      ],
      tips: [
        t(
          'Leave the pieces untouched for the first minute of frying, or the coating slides off.',
          'Nu atinge bucățile în primul minut de prăjit, altfel crusta se desprinde.',
        ),
      ],
      nutritionNote: t(
        'Boneless thigh is a good protein source and the thin starch coating takes up less oil than a thick breading; but it is still deep-fried, and the soy marinade is salty, so serve it with plain rice and raw vegetables.',
        'Pulpele dezosate sunt o sursă bună de proteine, iar crusta subțire de amidon absoarbe mai puțin ulei decât o pane groasă; totuși e prăjit în baie de ulei, iar marinada de soia e sărată, așa că servește-l cu orez simplu și legume crude.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Lemon wedge', 'Felie de lămâie'),
          reason: t(
            'A squeeze of citrus cuts the oiliness and lifts the ginger.',
            'Puțin citric taie uleiosul și scoate în evidență ghimbirul.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'lemon',
        },
        {
          kind: 'food',
          label: t('Shredded cabbage', 'Varză tocată fin'),
          reason: t(
            'The traditional fresh, crunchy bed under karaage.',
            'Patul tradițional, proaspăt și crocant, pe care se servește karaage.',
          ),
          principle: 'regional_tradition',
          ingredient: 'cabbage',
        },
        {
          kind: 'food',
          label: t('Steamed rice', 'Orez fiert la abur'),
          reason: t(
            'Plain rice carries the salty soy and ginger flavours.',
            'Orezul simplu preia aromele sărate de soia și ghimbir.',
          ),
          principle: 'complement_flavour',
          ingredient: 'rice',
        },
        {
          kind: 'drink',
          label: t('Cold beer', 'Bere rece'),
          reason: t(
            'Crisp lager is the izakaya favourite and cleans the palate.',
            'Berea blondă, seacă, e preferata din izakaya și curăță gura.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
        {
          kind: 'drink',
          label: t('Green tea', 'Ceai verde'),
          reason: t(
            'Light bitter tea balances the richness of fried meat.',
            'Ceaiul amărui, ușor, echilibrează bogăția cărnii prăjite.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Small pieces with rice and cabbage make a balanced lunch.',
            'Bucățile mici, cu orez și varză, fac un prânz echilibrat.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein plus rice carbohydrates help recovery.',
            'Proteinele și carbohidrații din orez ajută la refacere.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Deep-fried and salty, it sits heavy before bed.',
            'Prăjit în baie de ulei și sărat, cade greu înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'fried-chicken-snitel',
      cuisine: 'romanian',
      title: t('Romanian chicken schnitzel', 'Șnițel de pui'),
      servings: 4,
      prepMinutes: 25,
      cookMinutes: 10,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'chicken-breast',
          quantity: 700,
          unit: 'g',
          note: t(
            'cut into 4 cutlets and pounded to 1 cm',
            'tăiat în 4 felii și bătut până la 1 cm grosime',
          ),
        },
        { ingredient: 'salt', quantity: 6, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
        { ingredient: 'flour', quantity: 80, unit: 'g' },
        { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
        { ingredient: 'milk', quantity: 30, unit: 'ml' },
        { ingredient: 'breadcrumbs', quantity: 120, unit: 'g' },
        { ingredient: 'sunflower-oil', quantity: 250, unit: 'ml' },
        { ingredient: 'lemon', quantity: 1, unit: 'pcs' },
        { ingredient: 'parsley', quantity: 10, unit: 'g', optional: true },
      ],
      steps: [
        {
          key: 'pound',
          text: t(
            'Slice the breasts through the middle if thick, then pound the cutlets between two sheets of cling film to an even 1 cm. Season both sides with the salt and pepper.',
            'Taie pieptul în două pe lungime dacă e gros, apoi bate felile între două folii de plastic până la o grosime uniformă de 1 cm. Condimentează pe ambele fețe cu sare și piper.',
          ),
        },
        {
          key: 'bread',
          text: t(
            'Set up three dishes: flour, the eggs beaten with the milk, and the breadcrumbs. Coat each cutlet in flour, then egg, then breadcrumbs, pressing the crumbs on.',
            'Pregătește trei vase: făină, ouăle bătute cu lapte și pesmet. Trece fiecare șnițel prin făină, apoi prin ou, apoi prin pesmet, apăsând pesmetul.',
          ),
        },
        {
          key: 'heat',
          text: t(
            'Heat the oil in a wide skillet over medium heat to 170 °C. It should be about 1 cm deep.',
            'Încinge uleiul într-o tigaie lată la foc mediu, la 170 °C. Trebuie să aibă cam 1 cm adâncime.',
          ),
        },
        {
          key: 'fry',
          text: t(
            'Fry two cutlets at a time for 3 to 4 minutes per side until golden, shaking the pan gently so the crust puffs. A cutlet must reach at least 74 °C inside.',
            'Prăjește câte două șnițele deodată 3-4 minute pe fiecare parte, până se rumenesc, mișcând ușor tigaia ca pesmetul să se umfle. Șnițelul trebuie să ajungă la cel puțin 74 °C în interior.',
          ),
          timerSeconds: 420,
        },
        {
          key: 'serve',
          text: t(
            'Drain on paper towels for a minute, then serve straight away with lemon wedges and chopped parsley.',
            'Scurge pe hârtie de bucătărie un minut, apoi servește imediat cu felii de lămâie și pătrunjel tocat.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'pound',
          text: t(
            'An even thickness is the whole trick: thin edges dry out before the thick middle cooks.',
            'Grosimea uniformă e tot secretul: marginile subțiri se usucă înainte ca mijlocul gros să se gătească.',
          ),
        },
      ],
      tips: [
        t(
          'Do not press the cutlet down while it fries; it squeezes out juice and flattens the crust.',
          'Nu apăsa șnițelul în timp ce se prăjește; scoate zeama și turtește crusta.',
        ),
      ],
      nutritionNote: t(
        'Lean breast is high in protein and the shallow fry uses less oil than deep frying; but the breadcrumbs soak up fat, and breast dries out easily, so do not overcook it and serve it with a fresh salad or vegetables.',
        'Pieptul slab e bogat în proteine, iar prăjitul în strat subțire folosește mai puțin ulei decât baia de ulei; totuși pesmetul absoarbe grăsime, iar pieptul se usucă ușor, așa că nu-l găti prea mult și servește-l cu salată proaspătă sau legume.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Cabbage salad', 'Salată de varză'),
          reason: t(
            'A classic Romanian side whose vinegar cuts the fried crust.',
            'Un acompaniament românesc clasic, al cărui oțet taie crusta prăjită.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'cabbage',
        },
        {
          kind: 'food',
          label: t('Pickled cucumbers', 'Castraveți murați'),
          reason: t(
            'Crisp, sour pickles are a Romanian staple beside fried meat.',
            'Murăturile crocante și acre sunt o prezență obișnuită lângă carnea prăjită.',
          ),
          principle: 'regional_tradition',
          ingredient: 'pickled-cucumbers',
        },
        {
          kind: 'food',
          label: t('Lemon wedges', 'Felii de lămâie'),
          reason: t(
            'A squeeze of lemon brightens the mild chicken.',
            'Un strop de lămâie înviorează carnea de pui, delicată.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'lemon',
        },
        {
          kind: 'drink',
          label: t('Draught beer', 'Bere la halbă'),
          reason: t(
            'Cold, light lager cleanses the palate after the crust.',
            'Berea blondă, rece și ușoară, curăță gura după crustă.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Crisp acidity refreshes the palate between golden bites.',
            'Aciditatea fină împrospătează gura între îmbucăturile aurii.',
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
            'Thin cutlet and a salad make a quick, fairly light lunch.',
            'Un șnițel subțire și o salată fac un prânz rapid și relativ ușor.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Lean protein supports recovery.',
            'Proteinele slabe ajută la refacere.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Fried and breaded food is heavy before bed.',
            'Mâncarea prăjită și pânată e grea înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'fried-chicken-oven-fried',
      method: 'oven-fried',
      title: t('Oven-"fried" chicken', 'Pui „prăjit” la cuptor'),
      servings: 4,
      prepMinutes: 25,
      cookMinutes: 45,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'chicken-drumsticks',
          quantity: 1,
          unit: 'kg',
          note: t('skin removed if you like', 'fără piele, dacă preferi'),
        },
        { ingredient: 'buttermilk', quantity: 0.25, unit: 'l' },
        { ingredient: 'mustard', quantity: 15, unit: 'g' },
        { ingredient: 'salt', quantity: 8, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
        { ingredient: 'smoked-paprika', quantity: 4, unit: 'g' },
        { ingredient: 'breadcrumbs', quantity: 150, unit: 'g' },
        { ingredient: 'sunflower-oil', quantity: 45, unit: 'ml' },
      ],
      steps: [
        {
          key: 'marinate',
          text: t(
            'Whisk the buttermilk with the mustard and half the salt. Add the drumsticks, turn to coat and marinate in the fridge for at least 1 hour.',
            'Amestecă zara cu muștarul și jumătate din sare. Adaugă copănelele, răstoarnă-le prin amestec și lasă-le la marinat la frigider cel puțin 1 oră.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'heat',
          text: t(
            'Heat the oven to 220 °C (200 °C fan) and put a wire rack on a baking tray. Toss the breadcrumbs with the oil, remaining salt, pepper and smoked paprika, and toast them in a dry pan for 3 to 4 minutes until golden.',
            'Încălzește cuptorul la 220 °C (200 °C cu ventilator) și pune un grătar pe o tavă. Amestecă pesmetul cu uleiul, sarea rămasă, piperul și boiaua afumată și prăjește-l într-o tigaie uscată 3-4 minute, până se rumenește.',
          ),
          timerSeconds: 210,
        },
        {
          key: 'coat',
          text: t(
            'Lift each drumstick out of the buttermilk, let the excess drip off, roll it in the crumbs and press them on. Set on the rack.',
            'Scoate fiecare copănel din zară, lasă excesul să se scurgă, rostogolește-l prin pesmet și apasă. Așază-l pe grătar.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 40 to 45 minutes, turning once halfway, until the crust is deep golden. The thickest part must read at least 74 °C.',
            'Coace 40-45 de minute, întorcând o dată la jumătate, până crusta e auriu închis. Partea cea mai groasă trebuie să aibă cel puțin 74 °C.',
          ),
          timerSeconds: 2520,
        },
        {
          key: 'rest',
          text: t(
            'Rest for 5 minutes on the rack before serving.',
            'Lasă 5 minute la odihnit pe grătar înainte de servire.',
          ),
          timerSeconds: 300,
        },
      ],
      stepTips: [
        {
          step: 'heat',
          text: t(
            'Toasting the crumbs first gives them the colour that they would otherwise only get from hot oil.',
            'Prăjirea prealabilă a pesmetului îi dă culoarea pe care altfel ar căpăta-o doar din uleiul încins.',
          ),
        },
      ],
      tips: [
        t(
          'Bake on a rack so hot air reaches the underside; chicken sitting on the tray steams and the crust turns soft.',
          'Coace pe grătar ca aerul cald să ajungă dedesubt; puiul așezat direct pe tavă se aburește, iar crusta se înmoaie.',
        ),
      ],
      nutritionNote: t(
        'Baking uses far less oil than frying, so it is lighter in fat and calories while still crisp and high in protein; removing the skin cuts saturated fat further, but the crust is paler and less rich, and the salt in the coating still adds up.',
        'Coacerea folosește mult mai puțin ulei decât prăjirea, deci e mai ușoară în grăsimi și calorii, rămânând crocantă și bogată în proteine; fără piele scazi și grăsimile saturate, dar crusta e mai palidă și mai puțin bogată, iar sarea din ea se adună totuși.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Green salad', 'Salată verde'),
          reason: t(
            'Fresh, leafy greens complement the lighter crust.',
            'Verdeața proaspătă completează crusta mai ușoară.',
          ),
          principle: 'contrast_texture',
          ingredient: 'rocket',
        },
        {
          kind: 'food',
          label: t('Coleslaw', 'Salată coleslaw'),
          reason: t(
            'Cool crunchy cabbage cuts through the savoury crumbs.',
            'Varza rece și crocantă taie din bogăția pesmetului gustos.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'cabbage',
        },
        {
          kind: 'food',
          label: t('Mustard', 'Muștar'),
          reason: t(
            'A sharp dip echoes the mustard in the marinade.',
            'Un sos ascuțit reia nota de muștar din marinadă.',
          ),
          principle: 'complement_flavour',
          ingredient: 'mustard',
        },
        {
          kind: 'drink',
          label: t('Sparkling water with lemon', 'Apă minerală cu lămâie'),
          reason: t(
            'Fizz and citrus keep the meal feeling light.',
            'Bulele și citricele păstrează masa ușoară.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'sparkling-water',
        },
      ],
      eatingMoments: [
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Lean protein with less oil than the fried versions.',
            'Proteine slabe, cu mai puțin ulei decât variantele prăjite.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'A lighter take on fried chicken with a salad.',
            'O variantă mai ușoară de pui prăjit, cu salată.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Still a substantial meal for right before bed.',
            'Rămâne o masă consistentă pentru chiar înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'fried-chicken-air-fried',
      method: 'air-fried',
      title: t('Air-fried chicken', 'Pui la air fryer'),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 30,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'chicken-drumsticks',
          quantity: 800,
          unit: 'g',
        },
        { ingredient: 'salt', quantity: 6, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
        { ingredient: 'paprika', quantity: 4, unit: 'g' },
        { ingredient: 'garlic-powder', quantity: 3, unit: 'g' },
        { ingredient: 'baking-powder', quantity: 4, unit: 'g' },
        { ingredient: 'flour', quantity: 60, unit: 'g' },
        { ingredient: 'sunflower-oil', quantity: 15, unit: 'ml' },
      ],
      steps: [
        {
          key: 'dry',
          text: t(
            'Pat the drumsticks very dry. Mix the salt, pepper, paprika, garlic powder, baking powder and flour and toss the chicken in it until evenly coated.',
            'Șterge copănelele foarte bine. Amestecă sarea, piperul, boiaua, usturoiul pudră, praful de copt și făina și rostogolește puiul prin amestec până se acoperă uniform.',
          ),
        },
        {
          key: 'oil',
          text: t(
            'Preheat the air fryer to 180 °C for 3 minutes. Brush or spray the drumsticks lightly with the oil.',
            'Preîncălzește air fryer-ul la 180 °C timp de 3 minute. Unge sau pulverizează ușor copănelele cu ulei.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'cook',
          text: t(
            'Arrange the pieces in a single layer without touching and cook at 180 °C for 20 minutes, turning once halfway.',
            'Așază bucățile într-un singur strat, fără să se atingă, și gătește la 180 °C 20 de minute, întorcând o dată la jumătate.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'crisp',
          text: t(
            'Raise the heat to 200 °C and cook for 5 to 8 more minutes until crisp and deep golden. The thickest part must read at least 74 °C. Rest for 3 minutes.',
            'Ridică temperatura la 200 °C și mai gătește 5-8 minute, până când e crocant și auriu închis. Partea cea mai groasă trebuie să aibă cel puțin 74 °C. Lasă 3 minute la odihnit.',
          ),
          timerSeconds: 360,
        },
      ],
      stepTips: [
        {
          step: 'dry',
          text: t(
            'Baking powder helps the skin blister and crisp; use baking powder, not baking soda.',
            'Praful de copt ajută pielea să se bășicheze și să devină crocantă; folosește praf de copt, nu bicarbonat.',
          ),
        },
      ],
      tips: [
        t(
          'Cook in batches if the basket is crowded; touching pieces steam instead of crisp.',
          'Gătește în serii dacă sertarul e plin; bucățile care se ating se aburesc în loc să devină crocante.',
        ),
      ],
      nutritionNote: t(
        'Needs only a spoon of oil, so it is much lighter in fat and calories than frying while staying high in protein; but the skin still carries saturated fat, and the thin flour crust is less crunchy and rich than a true fried one.',
        'Are nevoie doar de o lingură de ulei, deci e mult mai ușor în grăsimi și calorii decât prăjitul, rămânând bogat în proteine; pielea aduce totuși grăsimi saturate, iar crusta subțire de făină e mai puțin crocantă și bogată decât una prăjită.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Fresh cucumber', 'Castravete proaspăt'),
          reason: t(
            'Cool, juicy slices refresh next to the crisp skin.',
            'Felii reci și suculente care înviorează lângă pielea crocantă.',
          ),
          principle: 'contrast_texture',
          ingredient: 'cucumber',
        },
        {
          kind: 'food',
          label: t('Mayonnaise dip', 'Sos de maioneză'),
          reason: t(
            'A creamy dip adds the richness the light crust lacks.',
            'Un sos cremos adaugă bogăția care lipsește crustei ușoare.',
          ),
          principle: 'fat_carries_flavour',
          ingredient: 'mayonnaise',
        },
        {
          kind: 'food',
          label: t('Lemon wedges', 'Felii de lămâie'),
          reason: t(
            'A squeeze of citrus brightens the smoky, salty crust.',
            'Un strop de citrice înviorează crusta sărată și condimentată.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'lemon',
        },
        {
          kind: 'drink',
          label: t('Iced tea', 'Ceai rece'),
          reason: t(
            'Cold and tannic, it cleanses the palate.',
            'Rece și tanic, curăță gura.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'iced-tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'High in protein and light on oil.',
            'Bogat în proteine și cu puțin ulei.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'No big pot of hot oil, so the kitchen stays cooler.',
            'Fără oală mare cu ulei încins, deci bucătăria rămâne mai răcoroasă.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Still a heavy meat meal right before exercise.',
            'Rămâne o masă grea cu carne chiar înainte de efort.',
          ),
        },
      ],
    },
  ],
};
