import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Ostropel base is the Romanian chicken braised in a flour-thickened tomato
// sauce with a whole head of garlic stirred in at the end. The Variants are two
// other braised-chicken-in-tomato dishes, each a full Recipe of its own.
export const ostropel: BaseRecipeSeed = {
  slug: 'ostropel',
  title: t(
    'Ostropel (Romanian chicken in garlic and tomato sauce)',
    'Ostropel de pui',
  ),
  servings: 4,
  prepMinutes: 15,
  cookMinutes: 80,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'chicken-leg-quarters',
      quantity: 1200,
      unit: 'g',
      note: t(
        'each cut in two at the joint',
        'fiecare tăiată în două, la încheietură',
      ),
    },
    { ingredient: 'sunflower-oil', quantity: 50, unit: 'ml' },
    {
      ingredient: 'onion',
      quantity: 1,
      unit: 'pcs',
      optional: true,
      note: t('finely chopped', 'tocată mărunt'),
    },
    { ingredient: 'flour', quantity: 20, unit: 'g' },
    { ingredient: 'tomato-paste', quantity: 40, unit: 'g' },
    { ingredient: 'still-water', quantity: 0.6, unit: 'l' },
    {
      ingredient: 'garlic',
      quantity: 40,
      unit: 'g',
      note: t('about a whole head, peeled', 'cam un cap întreg, curățat'),
    },
    { ingredient: 'bay-leaves', quantity: 0.4, unit: 'g' },
    { ingredient: 'savory', quantity: 2, unit: 'g', optional: true },
    {
      ingredient: 'parsley',
      quantity: 10,
      unit: 'g',
      optional: true,
      note: t('chopped', 'tocat'),
    },
    { ingredient: 'salt', quantity: 7, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
  ],
  steps: [
    {
      key: 'season',
      text: t(
        'Pat the chicken pieces dry with paper towels and season them all over with half of the salt and half of the pepper.',
        'Șterge bucățile de pui cu șervețele de hârtie și condimentează-le peste tot cu jumătate din sare și jumătate din piper.',
      ),
    },
    {
      key: 'heat',
      text: t(
        'Heat the oil in a wide heavy pot with a lid over medium-high heat until it shimmers.',
        'Încinge uleiul într-o oală lată, cu fund gros și cu capac, la foc mediu-mare, până se încinge bine.',
      ),
    },
    {
      key: 'brown',
      text: t(
        'Brown the chicken in two batches, skin side down first and turning once, for about 8 minutes per batch, until deep golden. Lift each batch onto a plate; do not crowd the pot.',
        'Rumenește puiul în două ture, întâi cu pielea în jos, întorcând o singură dată, circa 8 minute pe tură, până capătă o culoare aurie intensă. Scoate fiecare tură pe o farfurie și nu aglomera oala.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'pour-off',
      text: t(
        'Spoon off the fat until only about 2 tablespoons (30 ml) remain in the pot, and lower the heat to medium.',
        'Ia cu lingura grăsimea din oală, până rămân doar vreo 2 linguri (30 ml), și coboară focul la mediu.',
      ),
    },
    {
      key: 'onion',
      text: t(
        'If you use the onion, soften it in the fat for about 4 minutes, until translucent.',
        'Dacă pui ceapă, călește-o în grăsime circa 4 minute, până devine sticloasă.',
      ),
      timerSeconds: 240,
    },
    {
      key: 'flour',
      text: t(
        'Sprinkle in the flour and stir constantly until it turns pale golden and smells toasty.',
        'Presară făina și amestecă continuu, până se face galben-deschis și miroase a prăjit.',
      ),
    },
    {
      key: 'paste',
      text: t(
        'Stir in the tomato paste and fry it until it darkens a shade and smells sweet.',
        'Adaugă pasta de roșii și prăjește-o până se închide puțin la culoare și miroase dulceag.',
      ),
    },
    {
      key: 'water',
      text: t(
        'Take the pot off the heat and wait until the sizzling stops. Pour in the water in a thin stream, about 100 ml at a time, stirring until the sauce is smooth with no lumps. Add the bay leaves, the savory if using, the remaining pepper and the remaining salt.',
        'Ia oala de pe foc și așteaptă să nu mai sfârâie. Toarnă apa într-un fir subțire, câte 100 ml, amestecând până sosul e neted, fără cocoloașe. Adaugă foile de dafin, cimbrul, dacă folosești, restul de piper și restul de sare.',
      ),
    },
    {
      key: 'simmer-start',
      text: t(
        'Return the chicken and any juices from the plate to the pot, set it back over medium heat and bring to a gentle simmer.',
        'Pune la loc puiul, cu zeama de pe platou, așază oala înapoi pe foc mediu și adu sosul la fierbere ușoară.',
      ),
    },
    {
      key: 'braise',
      text: t(
        'Cover and braise on low heat for 35 minutes, turning the pieces halfway, until the meat is tender.',
        'Acoperă și fierbe la foc mic 35 de minute, întorcând bucățile la jumătatea timpului, până carnea e fragedă.',
      ),
      timerSeconds: 2100,
    },
    {
      key: 'garlic-prep',
      text: t(
        'While the chicken braises, crush the garlic or grate it finely into a paste.',
        'Cât timp se fierbe puiul, zdrobește usturoiul sau dă-l pe răzătoarea fină, ca să iasă o pastă.',
      ),
    },
    {
      key: 'check',
      text: t(
        'Check that the chicken is cooked through: a thermometer in the thickest part, not touching the bone, should read 75 °C, the juices run clear with no pink, and the meat pulls easily from the bone. If not, cover and simmer a few more minutes and check again.',
        'Verifică dacă puiul e gătit complet: un termometru în partea cea mai groasă, fără să atingă osul, trebuie să arate 75 °C, zeama să iasă limpede, fără nuanță roz, iar carnea să se desprindă ușor de os. Dacă nu, acoperă și mai fierbe câteva minute, apoi verifică din nou.',
      ),
    },
    {
      key: 'garlic',
      text: t(
        'Stir in the garlic and simmer uncovered for 5 minutes, until the sauce is thick enough to coat a spoon.',
        'Adaugă usturoiul în sos, amestecă și fierbe 5 minute fără capac, până sosul se îngroașă destul cât să acopere lingura.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'serve',
      text: t(
        'Remove the bay leaves, scatter over the parsley if using, and serve hot with the sauce spooned over.',
        'Scoate foile de dafin, presară pătrunjel, dacă folosești, și servește fierbinte, cu sosul peste pui.',
      ),
    },
  ],
  tips: [
    t(
      'Bone-in, skin-on legs give a richer sauce than breast meat, which dries out in a long braise.',
      'Pulpele cu os și cu piele dau un sos mai bogat decât pieptul, care se usucă la o fierbere îndelungată.',
    ),
    t(
      'Cool leftovers within 2 hours and keep them covered in the fridge for up to 3 days. Reheat until steaming hot all the way through; the sauce is even better the next day.',
      'Răcește resturile în cel mult 2 ore și păstrează-le acoperite la frigider până la 3 zile. Încălzește-le până clocotesc și sunt fierbinți peste tot; sosul e și mai gustos a doua zi.',
    ),
    t(
      'Add the garlic only at the end: long cooking dulls its bite, and the sharp, fresh garlic is what ostropel is about.',
      'Pune usturoiul abia la sfârșit: dacă fierbe mult, își pierde tăria, iar usturoiul proaspăt și iute e esența ostropelului.',
    ),
  ],
  stepTips: [
    {
      step: 'water',
      text: t(
        'Off the heat and a thin stream is what keeps the flour from clumping and the hot fat from spitting. Never pour water straight into hot fat.',
        'Dacă iei oala de pe foc și torni apa în fir subțire, făina nu face cocoloașe și grăsimea nu stropește. Nu turna niciodată apă direct în grăsime încinsă.',
      ),
    },
    {
      step: 'brown',
      text: t(
        'Leave the pieces alone until they release easily from the pot; skin that sticks is skin that is not golden yet.',
        'Nu muta bucățile până se desprind singure din oală; pielea care se lipește încă nu s-a rumenit.',
      ),
    },
  ],
  nutritionNote: t(
    'Plenty of protein, and tomato and garlic add flavour for few calories. The skin, the frying oil and the chicken fat carry most of the fat; salt it to taste, not heavily, and serve it with mămăligă for energy and add a fresh salad, since the dish has little fibre.',
    'Multe proteine, iar roșiile și usturoiul dau gust fără multe calorii. Pielea, uleiul și grăsimea de pui aduc cea mai mare parte din grăsime; sărează după gust, nu prea mult, și servește-l cu mămăligă pentru energie și adaugă o salată proaspătă, pentru că preparatul are puține fibre.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t(
        'Mămăligă with cheese and sour cream',
        'Mămăligă cu brânză și smântână',
      ),
      reason: t(
        'Ostropel goes well with mămăligă, and the plain, soft mămăligă soaks up the garlicky sauce. Make the mămăligă; the cheese and sour cream are up to you.',
        'Ostropelul merge bine cu mămăligă, iar mămăliga moale și neutră se îmbibă cu sosul cu usturoi. Fă mămăliga; brânza și smântâna rămân la alegerea ta.',
      ),
      principle: 'regional_tradition',
      recipe: 'mamaliga',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sourness cuts through the rich, oily sauce.',
        'Aciditatea lor taie din bogăția sosului gras.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'food',
      label: t('Country bread', 'Pâine de casă'),
      reason: t(
        'Something to mop up the last of the thick garlic sauce.',
        'Bună ca să ștergi din farfurie ultimele urme de sos gros cu usturoi.',
      ),
      principle: 'contrast_texture',
      ingredient: 'country-bread',
    },
    {
      kind: 'drink',
      label: t('Dry red wine', 'Vin roșu sec'),
      reason: t(
        'A light, fruity red echoes the tomato and stands up to the garlic.',
        'Un vin roșu ușor și fructat se potrivește cu roșiile și ține piept usturoiului.',
      ),
      principle: 'complement_flavour',
      ingredient: 'red-wine',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot, saucy braise with plenty of garlic warms you up.',
        'Un fel fierbinte, cu sos și mult usturoi, te încălzește.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Protein from the chicken; add mămăligă or bread for carbohydrates.',
        'Proteine din pui; adaugă mămăligă sau pâine pentru carbohidrați.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A heavy, garlicky dish that can sit badly before bed.',
        'Un fel consistent, cu mult usturoi, care poate cădea greu înainte de culcare.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'Long, hot cooking and a heavy sauce are not what you want in the heat.',
        'Gătitul lung la căldură și sosul consistent nu prea se potrivesc într-o zi caldă.',
      ),
    },
  ],
  variants: [
    {
      slug: 'ostropel-greek',
      cuisine: 'greek',
      title: t(
        'Kotopoulo kokkinisto (Greek chicken braised in tomato with cinnamon)',
        'Kotopoulo kokkinisto (pui înăbușit în sos de roșii cu scorțișoară, ca în Grecia)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 90,
      difficulty: 'easy',
      hideBaseTips: [2],
      lines: [
        {
          ingredient: 'chicken-leg-quarters',
          quantity: 1200,
          unit: 'g',
          note: t(
            'each cut in two at the joint',
            'fiecare tăiată în două, la încheietură',
          ),
        },
        { ingredient: 'olive-oil', quantity: 45, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('halved and sliced', 'tăiate în jumătăți și felii'),
        },
        {
          ingredient: 'garlic',
          quantity: 15,
          unit: 'g',
          note: t('4 cloves, sliced', '4 căței, tăiați felii'),
        },
        { ingredient: 'red-wine', quantity: 150, unit: 'ml' },
        { ingredient: 'canned-tomatoes', quantity: 800, unit: 'g' },
        { ingredient: 'tomato-paste', quantity: 30, unit: 'g' },
        { ingredient: 'cinnamon-sticks', quantity: 3, unit: 'g' },
        { ingredient: 'allspice-berries', quantity: 2, unit: 'g' },
        { ingredient: 'bay-leaves', quantity: 0.4, unit: 'g' },
        { ingredient: 'sugar', quantity: 3, unit: 'g', optional: true },
        { ingredient: 'salt', quantity: 6, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'season',
          text: t(
            'Pat the chicken pieces dry and season them all over with half of the salt and the pepper.',
            'Șterge bucățile de pui și condimentează-le peste tot cu jumătate din sare și cu piper.',
          ),
        },
        {
          key: 'brown',
          text: t(
            'Heat the olive oil in a wide heavy pot over medium-high heat. Brown the chicken in two batches, skin side down first and turning once, for about 8 minutes per batch, until deep golden. Lift each batch onto a plate.',
            'Încinge uleiul de măsline într-o oală lată, cu fund gros, la foc mediu-mare. Rumenește puiul în două ture, întâi cu pielea în jos, întorcând o singură dată, circa 8 minute pe tură, până capătă o culoare aurie intensă. Scoate fiecare tură pe o farfurie.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'pour-off',
          text: t(
            'Spoon off the fat until about 2 tablespoons (30 ml) remain and lower the heat to medium.',
            'Ia cu lingura grăsimea, până rămân vreo 2 linguri (30 ml), și coboară focul la mediu.',
          ),
        },
        {
          key: 'onion',
          text: t(
            'Cook the onions in the fat for about 8 minutes, stirring now and then, until soft and golden at the edges.',
            'Călește ceapa în grăsime circa 8 minute, amestecând din când în când, până se înmoaie și se rumenește pe margini.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'garlic-paste',
          text: t(
            'Add the garlic and tomato paste and stir for 1 minute, until the paste darkens a shade.',
            'Adaugă usturoiul și pasta de roșii și amestecă 1 minut, până pasta se închide puțin la culoare.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'wine',
          text: t(
            'Pour in the wine and scrape up the browned bits from the bottom. Let it bubble until the smell of alcohol fades and it has reduced by about half.',
            'Toarnă vinul și desprinde cu lingura bucățelele rumenite de pe fund. Lasă-l să fiarbă până dispare mirosul de alcool și scade la jumătate.',
          ),
        },
        {
          key: 'tomatoes',
          text: t(
            'Add the tomatoes, breaking them up with a spoon, then the cinnamon stick, allspice berries, bay leaves, sugar if using, and the remaining salt. Return the chicken with its juices and bring to a simmer.',
            'Adaugă roșiile, zdrobindu-le cu lingura, apoi batonul de scorțișoară, boabele de ienibahar, foile de dafin, zahărul, dacă folosești, și restul de sare. Pune la loc puiul, cu zeama lui, și adu la fierbere.',
          ),
        },
        {
          key: 'braise',
          text: t(
            'Cover and braise on low heat for 35 minutes, turning the pieces halfway.',
            'Acoperă și fierbe la foc mic 35 de minute, întorcând bucățile la jumătatea timpului.',
          ),
          timerSeconds: 2100,
        },
        {
          key: 'reduce',
          text: t(
            'Uncover and simmer for 15 minutes, until the sauce is thick enough to coat a spoon.',
            'Descoperă și fierbe 15 minute, până sosul se îngroașă destul cât să acopere lingura.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'check',
          text: t(
            'Check that the chicken is cooked through: a thermometer in the thickest part, not touching the bone, should read 75 °C, the juices run clear with no pink, and the meat pulls easily from the bone. If not, simmer a few more minutes and check again.',
            'Verifică dacă puiul e gătit complet: un termometru în partea cea mai groasă, fără să atingă osul, trebuie să arate 75 °C, zeama să iasă limpede, fără nuanță roz, iar carnea să se desprindă ușor de os. Dacă nu, mai fierbe câteva minute, apoi verifică din nou.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Lift out the cinnamon stick and bay leaves and serve hot with the sauce spooned over. Warn guests that the whole allspice berries are still in the sauce.',
            'Scoate batonul de scorțișoară și foile de dafin și servește fierbinte, cu sosul peste pui. Avertizează-ți oaspeții că în sos au rămas boabele întregi de ienibahar.',
          ),
        },
      ],
      tips: [
        t(
          'Make it a day ahead: the cinnamon and tomato settle into each other overnight.',
          'Fă-l cu o zi înainte: scorțișoara și roșiile se îmbină mai bine peste noapte.',
        ),
      ],
      stepTips: [
        {
          step: 'wine',
          text: t(
            'Reducing the wine first takes away its raw edge, so the sauce tastes round rather than sharp.',
            'Dacă reduci întâi vinul, i se ia asprimea, iar sosul iese rotund, nu ascuțit.',
          ),
        },
      ],
      nutritionNote: t(
        'Lots of protein, and cooked tomatoes and onions give a rich sauce. The skin and the olive oil carry most of the fat, and the dish is low in fibre unless you add a salad or vegetables; served over pasta it becomes a hearty, carbohydrate-rich meal.',
        'Multe proteine, iar roșiile și ceapa gătite dau un sos bogat. Pielea și uleiul de măsline aduc cea mai mare parte din grăsime, iar preparatul are puține fibre dacă nu adaugi salată sau legume; servit peste paste devine o masă consistentă, bogată în carbohidrați.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Thick spaghetti', 'Spaghete groase'),
          reason: t(
            'In Greece kokkinisto is often served over thick spaghetti (makaronia), which carries the cinnamon-scented sauce well.',
            'În Grecia, kokkinisto se servește adesea peste spaghete groase (makaronia), care țin bine sosul parfumat cu scorțișoară.',
          ),
          principle: 'regional_tradition',
          ingredient: 'spaghetti',
        },
        {
          kind: 'food',
          label: t('Grated kefalotyri', 'Kefalotyri ras'),
          reason: t(
            'A hard, salty cheese that adds depth to the sweet-spiced sauce.',
            'O brânză tare și sărată, care adaugă profunzime sosului dulce-condimentat.',
          ),
          principle: 'salt_balances_sweet',
          ingredient: 'kefalotyri',
        },
        {
          kind: 'food',
          label: t('Feta', 'Brânză feta'),
          reason: t(
            'Cool, tangy feta contrasts with the warm, rich sauce.',
            'Feta rece și acrișoară face contrast cu sosul cald și bogat.',
          ),
          principle: 'complement_flavour',
          ingredient: 'feta',
        },
        {
          kind: 'drink',
          label: t('Rosé wine', 'Vin rosé'),
          reason: t(
            'Its fruitiness and acidity keep up with the tomato and cinnamon.',
            'Fructuozitatea și aciditatea lui țin pasul cu roșiile și scorțișoara.',
          ),
          principle: 'complement_flavour',
          ingredient: 'rose-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A warm, spiced braise suits a cold day.',
            'Un fel cald, condimentat, se potrivește într-o zi rece.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from the chicken; the pasta underneath refills carbohydrates.',
            'Proteine din pui; pastele de dedesubt refac carbohidrații.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A big, rich plate is heavy right before bed.',
            'O farfurie mare și bogată cade greu chiar înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'ostropel-italian',
      cuisine: 'italian',
      title: t(
        "Pollo alla cacciatora (Italian hunter's-style chicken)",
        'Pollo alla cacciatora (pui vânătoresc italian)',
      ),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 90,
      difficulty: 'easy',
      hideBaseTips: [2],
      lines: [
        {
          ingredient: 'chicken-leg-quarters',
          quantity: 1200,
          unit: 'g',
          note: t(
            'each cut in two at the joint',
            'fiecare tăiată în două, la încheietură',
          ),
        },
        { ingredient: 'olive-oil', quantity: 45, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely chopped', 'tocată mărunt'),
        },
        {
          ingredient: 'carrot',
          quantity: 100,
          unit: 'g',
          note: t('finely diced', 'tăiat cubulețe mici'),
        },
        {
          ingredient: 'celery',
          quantity: 80,
          unit: 'g',
          note: t('finely diced', 'tăiată cubulețe mici'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t('3 cloves, sliced', '3 căței, tăiați felii'),
        },
        {
          ingredient: 'rosemary',
          quantity: 3,
          unit: 'g',
          note: t('1 to 2 sprigs', '1-2 crenguțe'),
        },
        { ingredient: 'bay-leaves', quantity: 0.4, unit: 'g', optional: true },
        { ingredient: 'red-wine', quantity: 150, unit: 'ml' },
        { ingredient: 'canned-tomatoes', quantity: 800, unit: 'g' },
        {
          ingredient: 'olives',
          quantity: 80,
          unit: 'g',
          note: t('black, pitted', 'negre, fără sâmburi'),
        },
        { ingredient: 'salt', quantity: 6, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'season',
          text: t(
            'Pat the chicken pieces dry and season them all over with half of the salt and the pepper.',
            'Șterge bucățile de pui și condimentează-le peste tot cu jumătate din sare și cu piper.',
          ),
        },
        {
          key: 'brown',
          text: t(
            'Heat the olive oil in a wide heavy pot over medium-high heat. Brown the chicken in two batches, skin side down first and turning once, for about 8 minutes per batch, until deep golden. Lift each batch onto a plate.',
            'Încinge uleiul de măsline într-o oală lată, cu fund gros, la foc mediu-mare. Rumenește puiul în două ture, întâi cu pielea în jos, întorcând o singură dată, circa 8 minute pe tură, până capătă o culoare aurie intensă. Scoate fiecare tură pe o farfurie.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'pour-off',
          text: t(
            'Spoon off the fat until about 2 tablespoons (30 ml) remain and lower the heat to medium.',
            'Ia cu lingura grăsimea, până rămân vreo 2 linguri (30 ml), și coboară focul la mediu.',
          ),
        },
        {
          key: 'soffritto',
          text: t(
            'Cook the onion, carrot and celery in the fat for about 8 minutes, stirring often, until soft and lightly golden.',
            'Călește ceapa, morcovul și țelina în grăsime circa 8 minute, amestecând des, până se înmoaie și se rumenesc ușor.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'garlic-herbs',
          text: t(
            'Add the garlic, rosemary and the bay leaves, if using, and stir for 30 seconds, until fragrant.',
            'Adaugă usturoiul, rozmarinul și foile de dafin, dacă folosești, și amestecă 30 de secunde, până se simte aroma.',
          ),
          timerSeconds: 30,
        },
        {
          key: 'wine',
          text: t(
            'Pour in the wine and scrape up the browned bits from the bottom. Let it bubble until the smell of alcohol fades and it has reduced by about half.',
            'Toarnă vinul și desprinde cu lingura bucățelele rumenite de pe fund. Lasă-l să fiarbă până dispare mirosul de alcool și scade la jumătate.',
          ),
        },
        {
          key: 'tomatoes',
          text: t(
            'Add the tomatoes, breaking them up with a spoon, and the remaining salt. Return the chicken with its juices and bring to a simmer.',
            'Adaugă roșiile, zdrobindu-le cu lingura, și restul de sare. Pune la loc puiul, cu zeama lui, și adu la fierbere.',
          ),
        },
        {
          key: 'braise',
          text: t(
            'Cover and braise on low heat for 35 minutes, turning the pieces halfway.',
            'Acoperă și fierbe la foc mic 35 de minute, întorcând bucățile la jumătatea timpului.',
          ),
          timerSeconds: 2100,
        },
        {
          key: 'olives',
          text: t(
            'Stir in the olives, uncover and simmer for 15 minutes, until the sauce is thick enough to coat a spoon.',
            'Adaugă măslinele, descoperă oala și fierbe 15 minute, până sosul se îngroașă destul cât să acopere lingura.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'check',
          text: t(
            'Check that the chicken is cooked through: a thermometer in the thickest part, not touching the bone, should read 75 °C, the juices run clear with no pink, and the meat pulls easily from the bone. If not, simmer a few more minutes and check again.',
            'Verifică dacă puiul e gătit complet: un termometru în partea cea mai groasă, fără să atingă osul, trebuie să arate 75 °C, zeama să iasă limpede, fără nuanță roz, iar carnea să se desprindă ușor de os. Dacă nu, mai fierbe câteva minute, apoi verifică din nou.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Remove the bay leaves and rosemary stems and serve hot with the sauce spooned over.',
            'Scoate foile de dafin și crenguțele de rozmarin și servește fierbinte, cu sosul peste pui.',
          ),
        },
      ],
      tips: [
        t(
          'Dice the soffritto small: it melts into the sauce and thickens it without any flour.',
          'Taie soffritto-ul mărunt: se topește în sos și îl îngroașă fără făină.',
        ),
      ],
      stepTips: [
        {
          step: 'olives',
          text: t(
            'Add the olives late: they are already salty and can turn bitter if cooked too long, so taste before adding more salt.',
            'Pune măslinele mai târziu: sunt deja sărate și devin amărui dacă fierb prea mult, așa că gustă înainte să mai adaugi sare.',
          ),
        },
      ],
      nutritionNote: t(
        'Protein from the chicken, and the soffritto and tomatoes give vegetables and a little fibre. The skin and olive oil carry most of the fat, and the olives add salt; with polenta or bread it is filling, so keep the portion of those moderate.',
        'Proteine din pui, iar soffritto și roșiile aduc legume și ceva fibre. Pielea și uleiul de măsline aduc cea mai mare parte din grăsime, iar măslinele adaugă sare; cu mămăligă (polenta) sau pâine e săturător, deci ține porția acestora moderată.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Soft polenta', 'Polenta moale'),
          reason: t(
            'Creamy maize soaks up the tomato sauce and suits braised meat.',
            'Porumbul cremos se îmbibă cu sosul de roșii și merge bine cu carnea înăbușită.',
          ),
          principle: 'regional_tradition',
          ingredient: 'cornmeal',
        },
        {
          kind: 'food',
          label: t('Country bread', 'Pâine de casă'),
          reason: t(
            'A crusty slice mops up the sauce.',
            'O felie crocantă șterge sosul din farfurie.',
          ),
          principle: 'contrast_texture',
          ingredient: 'country-bread',
        },
        {
          kind: 'food',
          label: t('Rocket', 'Rucola'),
          reason: t(
            'Peppery, bitter leaves cut through the rich sauce.',
            'Frunzele piperate și ușor amărui taie din bogăția sosului.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'rocket',
        },
        {
          kind: 'drink',
          label: t('Sparkling water', 'Apă minerală carbogazoasă'),
          reason: t(
            'Clean bubbles refresh the palate between rich, salty bites.',
            'Bulele curate împrospătează gustul între îmbucături bogate și sărate.',
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
            'A warm, hearty braise suits a cold day.',
            'Un fel cald și consistent se potrivește într-o zi rece.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from the chicken; add polenta or bread for carbohydrates.',
            'Proteine din pui; adaugă mămăligă (polenta) sau pâine pentru carbohidrați.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'Long, hot cooking and a heavy sauce are not what you want in the heat.',
            'Gătitul lung la căldură și sosul consistent nu prea se potrivesc într-o zi caldă.',
          ),
        },
      ],
    },
  ],
};
