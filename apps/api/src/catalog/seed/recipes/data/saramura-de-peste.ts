import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Saramură de pește base is the Romanian saramură de crap: carp steaks
// grilled on a hot pan, then left a few minutes in a hot brine of garlic, hot
// pepper and tomato that is made and served fresh. The Variants keep the
// grilled or whole-fish idea but change the sauce: a hot garlic-and-chilli oil
// (Spain) and a light tomato broth (Italy). Each is a full Recipe.
export const saramuraDePeste: BaseRecipeSeed = {
  slug: 'saramura-de-peste',
  title: t(
    'Grilled carp in garlic and chilli brine (saramură de crap)',
    'Saramură de crap',
  ),
  servings: 4,
  prepMinutes: 35,
  cookMinutes: 36,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'carp',
      quantity: 1500,
      unit: 'g',
      note: t(
        'one whole fish, scaled and gutted, gills removed',
        'un pește întreg, curățat de solzi și de măruntaie, fără branhii',
      ),
    },
    {
      ingredient: 'coarse-salt',
      quantity: 15,
      unit: 'g',
      note: t('to season the fish', 'pentru sărat peștele'),
    },
    {
      ingredient: 'sunflower-oil',
      quantity: 40,
      unit: 'ml',
      note: t('to brush the fish', 'pentru uns peștele'),
    },
    {
      ingredient: 'still-water',
      quantity: 1,
      unit: 'l',
      note: t('for the brine', 'pentru saramură'),
    },
    {
      ingredient: 'salt',
      quantity: 12,
      unit: 'g',
      note: t('for the brine', 'pentru saramură'),
    },
    { ingredient: 'bay-leaves', quantity: 1, unit: 'g' },
    { ingredient: 'peppercorns', quantity: 2, unit: 'g' },
    {
      ingredient: 'garlic',
      quantity: 40,
      unit: 'g',
      note: t('crushed', 'zdrobit'),
    },
    {
      ingredient: 'hot-pepper',
      quantity: 1,
      unit: 'pcs',
      note: t('thinly sliced', 'tăiat rondele subțiri'),
    },
    {
      ingredient: 'tomato',
      quantity: 300,
      unit: 'g',
      note: t('ripe, peeled and diced', 'coapte, decojite și tăiate cubulețe'),
    },
    {
      ingredient: 'bell-pepper',
      quantity: 1,
      unit: 'pcs',
      optional: true,
      note: t('diced', 'tăiat cubulețe'),
    },
    {
      ingredient: 'parsley',
      quantity: 20,
      unit: 'g',
      note: t('chopped', 'tocat'),
    },
    { ingredient: 'savory', quantity: 1, unit: 'g', optional: true },
  ],
  steps: [
    {
      key: 'cut',
      text: t(
        'Rinse the carp inside and out. Cut off the head and tail and cut the body across into steaks about 3 cm thick (about 8). Pat them dry with paper towels.',
        'Spală crapul pe dinăuntru și pe dinafară. Taie capul și coada și împarte corpul în felii de aproximativ 3 cm grosime (cam 8). Șterge-le bine cu hârtie de bucătărie.',
      ),
    },
    {
      key: 'salt',
      text: t(
        'Rub the steaks with the coarse salt, put them on a plate and leave them in the fridge for 15 minutes. Then brush off the loose grains and pat dry again. Wash your hands, the board and the knife with hot soapy water now, before you chop the vegetables.',
        'Freacă feliile cu sarea grunjoasă, pune-le pe o farfurie și lasă-le la frigider 15 minute. Apoi scutură boabele de sare rămase pe deasupra și șterge-le din nou. Spală acum mâinile, tocătorul și cuțitul cu apă fierbinte și săpun, înainte să tai legumele.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'brine-boil',
      text: t(
        'While the fish rests, bring the water to the boil in a pot with the salt, the bay leaves and the peppercorns. Simmer for 5 minutes.',
        'În timp ce peștele stă la rece, adu apa la fiert într-o oală, împreună cu sarea, foile de dafin și boabele de piper. Lasă să fiarbă încet 5 minute.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'tomatoes',
      text: t(
        'While the brine simmers, cut a cross in the base of each tomato. Lower them into the simmering brine with a slotted spoon for 1 minute, lift them out, then peel and dice them.',
        'În timp ce saramura fierbe, taie o cruce la baza fiecărei roșii. Coboară-le cu o lingură cu găuri în saramura care fierbe, 1 minut, scoate-le, apoi decojește-le și taie-le cubulețe.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'brine-finish',
      text: t(
        'Take the pot off the heat. Stir in the garlic, hot pepper, tomatoes, parsley, and the bell pepper and savory if using. Cover and leave it while you grill the fish.',
        'Ia oala de pe foc. Adaugă usturoiul, ardeiul iute, roșiile, pătrunjelul și, dacă folosești, ardeiul gras și cimbrul. Acoperă și las-o deoparte cât se frige peștele.',
      ),
    },
    {
      key: 'preheat',
      text: t(
        'Set a large cast-iron grill pan or griddle over medium-high heat for 5 minutes, until it is very hot. Open a window or switch on the extractor fan. Brush the steaks with the sunflower oil, not the pan.',
        'Pune o tigaie grill sau o placă mare din fontă la foc mediu spre mare pentru 5 minute, până se încinge foarte tare. Deschide geamul sau pornește hota. Unge feliile de pește cu uleiul de floarea soarelui, nu tigaia.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'grill-first',
      text: t(
        'Lay 4 steaks on the hot pan and leave them without moving them for 6 minutes, until the underside is charred in stripes and the steaks let go of the pan.',
        'Pune 4 felii pe tigaia încinsă și lasă-le fără să le miști 6 minute, până se rumenesc în dungi pe partea de jos și se desprind de tigaie.',
      ),
      timerSeconds: 360,
    },
    {
      key: 'turn',
      text: t(
        'Turn the steaks and grill the other side for 6 minutes. Check one steak at the backbone: the flesh must be opaque all the way through and pull easily from the bone, and read 63 °C at the thickest part. If not, give it 1 to 2 minutes more.',
        'Întoarce feliile și lasă cealaltă parte la grătar 6 minute. Verifică o felie lângă coloană: carnea trebuie să fie opacă pe toată grosimea și să se desprindă ușor de os, iar la partea cea mai groasă termometrul trebuie să arate 63 °C. Dacă nu, mai lasă 1-2 minute.',
      ),
      timerSeconds: 360,
    },
    {
      key: 'dish',
      text: t(
        'Lift the cooked steaks into a clean, deep dish, not the plate the raw fish sat on, and cover them with aluminium foil to keep them warm.',
        'Pune feliile gătite într-un vas adânc și curat, nu în farfuria în care a stat peștele crud, și acoper-le cu folie de aluminiu ca să rămână calde.',
      ),
    },
    {
      key: 'grill-second',
      text: t(
        'Grill the other 4 steaks the same way, 6 minutes a side, and check one at the backbone for opaque flesh and 63 °C. While they cook, warm the brine over low heat until it steams, without letting it boil hard.',
        'Pune la grătar celelalte 4 felii la fel, câte 6 minute pe fiecare parte, și verifică una lângă coloană: carnea să fie opacă, la 63 °C. Cât se frig, încălzește saramura la foc mic până scoate aburi, fără să fiarbă tare.',
      ),
      timerSeconds: 720,
    },
    {
      key: 'soak',
      text: t(
        'Add the second batch to the dish, pour the hot brine over the fish and leave it for 5 minutes so the steaks take on the garlic and pepper.',
        'Adaugă și a doua tură în vas, toarnă saramura fierbinte peste pește și lasă 5 minute, ca feliile să ia gustul usturoiului și al ardeiului.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'serve',
      text: t(
        'Serve straight away with hot mămăligă, spooning the brine over it. Eat the fish from a separate plate and take care: carp has many fine, forked bones. The flesh lifts off the backbone in two pieces; for children and older people, flake it and pick out every bone first.',
        'Servește imediat, cu mămăligă fierbinte, peste care pui saramură cu lingura. Mănâncă peștele dintr-o farfurie separată și ai grijă: crapul are multe oase fine, în formă de Y. Carnea se desprinde de coloană în două bucăți; pentru copii și pentru persoanele în vârstă, desfă carnea și scoate toate oasele înainte.',
      ),
    },
  ],
  tips: [
    t(
      'Make the saramură just before you eat and serve it fresh. It is not a brine to keep: do not store it or reuse it, and throw away what is left after the meal. Leftover fish: lift it out, chill it within 2 hours and eat it within 1 to 2 days, reheated until steaming.',
      'Fă saramura chiar înainte de masă și servește-o proaspătă. Nu e o saramură de păstrat: nu o ține la frigider și nu o refolosi, aruncă ce rămâne după masă. Peștele rămas: scoate-l din saramură, pune-l la frigider în maximum 2 ore și mănâncă-l în 1-2 zile, încălzit până scoate aburi.',
    ),
    t(
      'Oil the fish, not the pan: an oiled hot pan smokes and the oil burns before the fish is done.',
      'Unge peștele, nu tigaia: pe o tigaie unsă și foarte încinsă uleiul fumegă și se arde înainte să fie gata peștele.',
    ),
    t(
      'Buy the fish the same day. A fresh fish has clear eyes, bright red gills and smells fresh, of clean water or the sea; if it smells strongly or muddy, leave it.',
      'Cumpără peștele în aceeași zi. Un pește proaspăt are ochii limpezi, branhii roșii și miroase a proaspăt, a apă curată sau a mare; dacă miroase puternic sau a mâl, nu-l lua.',
    ),
    t(
      'Ask the fishmonger to scale and gut the carp and to take the gills out, and keep it cold on ice until you cook it.',
      'Roagă vânzătorul de la pescărie să curețe crapul de solzi și de măruntaie și să scoată branhiile, și ține-l la rece, pe gheață, până îl gătești.',
    ),
    t(
      'On the Danube the fish is often seared on a hot iron plate covered with a finger of coarse salt, which seasons it and stops it sticking. You can do the same on a cast-iron plate or over charcoal.',
      'La Dunăre, peștele se frige adesea pe o placă de fontă încinsă, acoperită cu un strat gros de sare grunjoasă, care îl sărează și nu-l lasă să se lipească. Poți face la fel pe o placă de fontă sau pe jar.',
    ),
  ],
  stepTips: [
    {
      step: 'grill-first',
      text: t(
        'Do not try to lift the steaks early. They stick at first and let go of the pan by themselves once a crust has formed.',
        'Nu încerca să ridici feliile mai devreme. La început se lipesc și se desprind singure din tigaie după ce s-a format crusta.',
      ),
    },
    {
      step: 'brine-finish',
      text: t(
        'Keep the garlic raw in the brine: boiling softens it and takes away the fresh bite the dish depends on.',
        'Nu lăsa usturoiul să fiarbă în saramură: fiert, se îndulcește și își pierde iuțeala proaspătă de care depinde gustul.',
      ),
    },
  ],
  nutritionNote: t(
    'Carp gives protein and some fish fat, and the brine adds vegetables, garlic and little fat since the oil is only brushed on. The salt on the fish and in the brine adds a lot of sodium, so go easy on the brine. Mămăligă served with it adds carbohydrate. There is little fibre apart from the vegetables in the brine.',
    'Crapul aduce proteine și puțină grăsime de pește, iar saramura adaugă legume și usturoi, cu foarte puțină grăsime, fiindcă uleiul e doar întins pe pește. Sarea de pe pește și din saramură aduce mult sodiu, așa că nu exagera cu saramura. Mămăliga servită alături adaugă carbohidrați. Fibre sunt puține, în afară de legumele din saramură.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t(
        'Mămăligă with cheese and sour cream',
        'Mămăligă cu brânză și smântână',
      ),
      reason: t(
        'Hot, soft mămăligă is a familiar Romanian partner for saramură, with the brine spooned over it; serve it plain, without the cheese and sour cream.',
        'Mămăliga caldă și moale e un acompaniament cunoscut pentru saramură, cu saramura turnată peste ea; servește-o simplă, fără brânză și smântână.',
      ),
      principle: 'regional_tradition',
      recipe: 'mamaliga',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sour crunch cuts the richness of the grilled carp.',
        'Gustul lor acru și crocant taie din bogăția crapului la grătar.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'drink',
      label: t('Dry white wine', 'Vin alb sec'),
      reason: t(
        'Its acidity refreshes the palate between bites of garlicky, spicy fish.',
        'Aciditatea lui răcorește gustul între îmbucăturile de pește cu usturoi și iuțeală.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'white-wine',
    },
    {
      kind: 'drink',
      label: t('Cold beer', 'Bere rece'),
      reason: t(
        'A cold, light beer refreshes the palate between bites of garlicky, peppery fish.',
        'O bere rece și ușoară te răcorește între îmbucăturile de pește cu usturoi și ardei iute.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'beer',
    },
  ],
  eatingMoments: [
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Fish protein helps muscles recover, and the mămăligă served with it restores carbohydrate.',
        'Proteinele din pește ajută mușchii să se refacă, iar mămăliga servită alături reface carbohidrații.',
      ),
    },
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'The hot brine and the hot pepper warm you up.',
        'Saramura fierbinte și ardeiul iute te încălzesc.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A lot of garlic, hot pepper and salt can sit heavy before bed, and the fine bones need unhurried eating.',
        'Mult usturoi, ardei iute și sare pot cădea greu înainte de culcare, iar oasele fine cer să mănânci fără grabă.',
      ),
    },
  ],
  variants: [
    {
      slug: 'saramura-de-peste-spanish',
      cuisine: 'spanish',
      title: t(
        'Dorada a la espalda (Spanish oven-baked gilt-head bream with garlic and chilli oil)',
        'Dorada a la espalda (doradă la cuptor cu ulei încins cu usturoi și ardei iute, ca în Spania)',
      ),
      servings: 2,
      prepMinutes: 15,
      cookMinutes: 36,
      difficulty: 'medium',
      hideBaseTips: [0, 1, 3, 4],
      lines: [
        {
          ingredient: 'sea-bream',
          quantity: 700,
          unit: 'g',
          note: t(
            'one whole fish, scaled and gutted',
            'un pește întreg, curățat de solzi și de măruntaie',
          ),
        },
        { ingredient: 'salt', quantity: 5, unit: 'g' },
        {
          ingredient: 'olive-oil',
          key: 'olive-oil-fish',
          quantity: 10,
          unit: 'ml',
          note: t('to brush the fish', 'pentru uns peștele'),
        },
        {
          ingredient: 'olive-oil',
          key: 'olive-oil-refrito',
          quantity: 60,
          unit: 'ml',
          note: t('for the garlic oil', 'pentru uleiul cu usturoi'),
        },
        {
          ingredient: 'garlic',
          quantity: 25,
          unit: 'g',
          note: t('thinly sliced', 'tăiat felii subțiri'),
        },
        {
          ingredient: 'dried-red-chillies',
          quantity: 2,
          unit: 'g',
          note: t('guindilla, crumbled', 'guindilla, sfărâmat'),
        },
        {
          ingredient: 'wine-vinegar',
          quantity: 15,
          unit: 'ml',
          note: t('white wine vinegar', 'oțet de vin alb'),
        },
        {
          ingredient: 'parsley',
          quantity: 10,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
      ],
      steps: [
        {
          key: 'open',
          text: t(
            'Rinse the bream. Ask the fishmonger to open it a la espalda (butterflied, with the two fillets still joined), or do it yourself: with a sharp knife cut along the belly cavity and down one side of the backbone, so the two fillets stay joined at the back, and open the fish out flat like a book, skin side down. Leave the backbone in; you will eat the flesh off it. Pat it dry.',
            'Spală dorada. Roagă vânzătorul să o deschidă a la espalda (în fluture, cu cele două jumătăți încă unite), sau fă-o singur: cu un cuțit ascuțit taie pe lângă cavitatea burții și în josul unei părți a coloanei, ca jumătățile să rămână unite pe spate, și desfă peștele ca pe o carte, cu pielea în jos. Lasă coloana pe loc; vei mânca carnea de pe ea. Șterge-l bine.',
          ),
        },
        {
          key: 'season',
          text: t(
            'Sprinkle the flesh with the salt and brush the flesh with half of the 10 ml of olive oil. Use the rest to oil a baking tray. Wash your hands, the board and the knife with hot soapy water.',
            'Presară carnea cu sare și unge carnea cu jumătate din cei 10 ml de ulei de măsline. Cu restul unge o tavă. Spală mâinile, tocătorul și cuțitul cu apă fierbinte și săpun.',
          ),
        },
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 200 °C (conventional) for 15 minutes.',
            'Încălzește cuptorul la 200 °C (static) timp de 15 minute.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'bake',
          text: t(
            'Lay the fish open on the oiled tray, skin side down, flesh up, and bake it for 13 minutes. Check the thickest part beside the backbone: the flesh must be opaque all the way through, flake easily, and read 63 °C. If not, give it 2 more minutes.',
            'Așază peștele deschis pe tava unsă, cu pielea în jos și carnea în sus, și coace-l 13 minute. Verifică partea cea mai groasă, lângă coloană: carnea trebuie să fie opacă pe toată grosimea, să se desprindă în foi și să arate 63 °C. Dacă nu, mai lasă 2 minute.',
          ),
          timerSeconds: 780,
        },
        {
          key: 'plate',
          text: t(
            'Lift the fish with two wide spatulas onto a clean warm platter, skin side down and still open, not onto a plate that held the raw fish.',
            'Mută peștele cu grijă, cu două spatule late, pe un platou curat și cald, cu pielea în jos și tot deschis, nu pe o farfurie care a ținut peștele crud.',
          ),
        },
        {
          key: 'refrito',
          text: t(
            'Put the 60 ml of olive oil, the sliced garlic and the chilli in a small pan and warm them over low heat for 4 to 5 minutes, until the garlic is pale gold. Do not let it brown, or it turns bitter, and never let the oil smoke.',
            'Pune cei 60 ml de ulei de măsline, usturoiul tăiat și ardeiul iute într-o tigăiță și încălzește-le la foc mic 4-5 minute, până usturoiul devine auriu-pal. Nu-l lăsa să se rumenească, fiindcă se amărăște, și nu lăsa uleiul să fumege.',
          ),
          timerSeconds: 270,
        },
        {
          key: 'vinegar',
          text: t(
            "Take the pan off the heat, stand back and pour the vinegar in slowly at arm's length. It will spit, so keep your face away. Never add vinegar to smoking oil.",
            'Ia tigaia de pe foc, dă-te înapoi și toarnă oțetul încet, cu brațul întins. Va stropi, așa că ține fața departe. Nu pune niciodată oțet în ulei care fumegă.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Pour the hot garlic oil over the open flesh, scatter the parsley on top and serve at once. Eat the flesh off the bones; gilt-head bream has a few small bones, so check each forkful for children and older people.',
            'Toarnă uleiul fierbinte cu usturoi peste carnea deschisă, presară pătrunjelul și servește imediat. Mănâncă carnea de pe oase; dorada are câteva oase mici, așa că verifică fiecare îmbucătură pentru copii și pentru persoanele în vârstă.',
          ),
        },
      ],
      tips: [
        t(
          'Heat the garlic oil so it is still sizzling when it goes on: the hot oil warms the flesh and carries the garlic into it.',
          'Încălzește uleiul cu usturoi așa încât să sfârâie încă atunci când îl torni: uleiul fierbinte încălzește carnea și duce usturoiul în ea.',
        ),
      ],
      stepTips: [
        {
          step: 'bake',
          text: t(
            'Leave the skin underneath: it holds the fish together when you lift it onto the platter.',
            'Lasă pielea dedesubt: ține peștele întreg când îl muți pe platou.',
          ),
        },
      ],
      nutritionNote: t(
        'Sea bream gives protein and some fish fat, and the olive oil is mostly unsaturated fat, though a fair amount for two. There are no vegetables or fibre, so add a salad. Watch the salt.',
        'Dorada aduce proteine și ceva grăsime de pește, iar uleiul de măsline este în mare parte grăsime nesaturată, deși e o cantitate însemnată pentru două persoane. Nu are legume sau fibre, așa că adaugă o salată. Atenție la sare.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Country bread', 'Pâine de casă'),
          reason: t(
            'A slice mops up the garlic oil left on the platter.',
            'O felie șterge uleiul cu usturoi rămas pe platou.',
          ),
          principle: 'contrast_texture',
          ingredient: 'country-bread',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its acidity lifts the olive oil and the garlic.',
            'Aciditatea lui înviorează uleiul de măsline și usturoiul.',
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
            'Quick to bake, with no heavy side.',
            'Se coace repede, fără garnitură grea.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Quick to cook, with no long time at the stove on a hot day.',
            'Se face repede, fără mult timp la aragaz într-o zi caldă.',
          ),
        },
      ],
    },
    {
      slug: 'saramura-de-peste-italian',
      cuisine: 'italian',
      title: t(
        "Pesce all'acqua pazza (sea bass poached in tomato and garlic water)",
        "Pesce all'acqua pazza (lup de mare fiert încet în zeamă cu roșii și usturoi)",
      ),
      servings: 2,
      prepMinutes: 15,
      cookMinutes: 25,
      difficulty: 'easy',
      hideBaseTips: [0, 1, 3, 4],
      lines: [
        {
          ingredient: 'sea-bass',
          quantity: 700,
          unit: 'g',
          note: t(
            'one whole fish, scaled and gutted',
            'un pește întreg, curățat de solzi și de măruntaie',
          ),
        },
        { ingredient: 'olive-oil', quantity: 40, unit: 'ml' },
        {
          ingredient: 'garlic',
          quantity: 15,
          unit: 'g',
          note: t('sliced', 'tăiat felii'),
        },
        {
          ingredient: 'cherry-tomato',
          quantity: 250,
          unit: 'g',
          note: t('halved', 'tăiate pe jumătate'),
        },
        {
          ingredient: 'white-wine',
          quantity: 100,
          unit: 'ml',
          optional: true,
        },
        { ingredient: 'still-water', quantity: 0.4, unit: 'l' },
        { ingredient: 'salt', quantity: 5, unit: 'g' },
        {
          ingredient: 'parsley',
          quantity: 10,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'chilli-flakes',
          quantity: 0.5,
          unit: 'g',
          optional: true,
        },
      ],
      steps: [
        {
          key: 'prepare',
          text: t(
            'Rinse the sea bass inside and out and pat it dry. If it is longer than your pan, cut off the head and tail. Rub the salt into the skin and inside the belly. Wash your hands, the board and the knife with hot soapy water.',
            'Spală lupul de mare pe dinăuntru și pe dinafară și șterge-l bine. Dacă e mai lung decât tigaia, taie capul și coada. Freacă sarea pe piele și în burtă. Spală mâinile, tocătorul și cuțitul cu apă fierbinte și săpun.',
          ),
        },
        {
          key: 'garlic',
          text: t(
            'Warm the olive oil and the sliced garlic in a wide, deep pan over low heat for 2 minutes, until the garlic is fragrant and just pale. Do not brown it.',
            'Încălzește uleiul de măsline cu usturoiul tăiat într-o tigaie lată și adâncă la foc mic, 2 minute, până usturoiul miroase și devine doar palid. Nu-l rumeni.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'tomatoes',
          text: t(
            'Add the cherry tomatoes and cook over medium heat for 5 minutes, pressing them lightly, until they soften and release their juice.',
            'Adaugă roșiile cherry și gătește la foc mediu 5 minute, apăsându-le ușor, până se înmoaie și își lasă sucul.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'liquid',
          text: t(
            'Pour in the wine, if using, and let it bubble for 1 minute. Add the water and the chilli flakes, if using, and bring to a gentle simmer.',
            'Toarnă vinul, dacă folosești, și lasă-l să fiarbă 1 minut. Adaugă apa și fulgii de chili, dacă folosești, și adu la o fierbere ușoară.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'poach',
          text: t(
            'Lay the fish in the pan, spoon some of the tomatoes over it, cover, and simmer very gently for 12 minutes. The liquid will only be about 1 to 2 cm deep; the lid keeps the steam in. Spoon some of the liquid over the top halfway through.',
            'Așază peștele în tigaie, pune câteva roșii cu lingura deasupra, acoperă și fierbe foarte încet 12 minute. Lichidul va fi adânc de numai 1-2 cm; capacul ține aburii înăuntru. Pe la jumătate, stropește peștele cu puțin din lichid.',
          ),
          timerSeconds: 720,
        },
        {
          key: 'check',
          text: t(
            'Test the thickest part beside the backbone: the flesh must be opaque all the way through and flake easily, and read 63 °C. If not, cover and cook 2 to 3 minutes more.',
            'Verifică partea cea mai groasă, lângă coloană: carnea trebuie să fie opacă pe toată grosimea, să se desprindă ușor în foi și să arate 63 °C. Dacă nu, acoperă și mai gătește 2-3 minute.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Lift the fish onto a clean warm platter, not a plate that held it raw. Scatter the parsley over the broth and spoon it around the fish. Take the flesh off the bones at the table, checking for bones for children and older people.',
            'Mută peștele pe un platou curat și cald, nu pe o farfurie care l-a ținut crud. Presară pătrunjelul pe zeamă și toarn-o cu lingura în jurul peștelui. Desprinde carnea de pe oase la masă și verifică oasele pentru copii și pentru persoanele în vârstă.',
          ),
        },
      ],
      tips: [
        t(
          'Taste the broth before you add more salt: some of the salt rubbed on the fish ends up in it.',
          'Gustă zeama înainte să mai pui sare: o parte din sarea cu care ai frecat peștele ajunge în ea.',
        ),
      ],
      stepTips: [
        {
          step: 'poach',
          text: t(
            'Keep the heat low. A hard boil dries out the fish and clouds the broth.',
            'Ține focul mic. O fierbere puternică usucă peștele și tulbură zeama.',
          ),
        },
      ],
      nutritionNote: t(
        'Sea bass is lean protein, and poaching in a tomato broth uses little oil. The cherry tomatoes give some fibre and vitamin C. The broth is thin, so it is light but not filling alone; serve it with bread, which adds carbohydrate. Watch the salt.',
        'Lupul de mare este proteină slabă, iar fierberea în zeamă de roșii folosește puțin ulei. Roșiile cherry aduc fibre și vitamina C. Zeama e subțire, deci e ușoară, dar nu te satură singură; servește-o cu pâine, care adaugă carbohidrați. Atenție la sare.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Country bread', 'Pâine de casă'),
          reason: t(
            'A slice of bread mops up the garlicky tomato broth.',
            'O felie de pâine șterge zeama de roșii cu usturoi.',
          ),
          principle: 'contrast_texture',
          ingredient: 'country-bread',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its acidity suits the tomato and keeps the delicate fish in focus.',
            'Aciditatea lui se potrivește cu roșiile și lasă în prim-plan peștele delicat.',
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
            'Light and quick, with little oil.',
            'Ușor și rapid, cu puțin ulei.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Lean protein, and bread on the side restores carbohydrate.',
            'Proteină slabă, iar pâinea servită alături reface carbohidrații.',
          ),
        },
      ],
    },
  ],
};
