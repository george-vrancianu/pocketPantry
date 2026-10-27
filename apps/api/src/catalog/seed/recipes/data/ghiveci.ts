import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Ghiveci base is the Romanian mixed vegetable stew, cooked in oil with no
// meat (de post). Each Variant is a full Recipe with its own lines, steps and
// guidance; the base's Recipe-level Tips are inherited unless a Variant hides
// them.
export const ghiveci: BaseRecipeSeed = {
  slug: 'ghiveci',
  title: t(
    'Romanian mixed vegetable stew (ghiveci de legume)',
    'Ghiveci de legume',
  ),
  servings: 6,
  prepMinutes: 30,
  cookMinutes: 90,
  difficulty: 'easy',
  lines: [
    { ingredient: 'sunflower-oil', quantity: 90, unit: 'ml' },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('about 300 g, diced', 'cam 300 g, tăiate cubulețe'),
    },
    {
      ingredient: 'carrot',
      quantity: 300,
      unit: 'g',
      note: t('in 1.5 cm cubes', 'tăiați cuburi de 1,5 cm'),
    },
    {
      ingredient: 'celeriac',
      quantity: 200,
      unit: 'g',
      optional: true,
      note: t('peeled, in 1.5 cm cubes', 'curățată, tăiată cuburi de 1,5 cm'),
    },
    {
      ingredient: 'bell-pepper',
      quantity: 3,
      unit: 'pcs',
      note: t(
        'about 450 g, in 3 cm pieces',
        'cam 450 g, tăiați bucăți de 3 cm',
      ),
    },
    {
      ingredient: 'green-beans',
      quantity: 300,
      unit: 'g',
      note: t(
        'ends trimmed, cut in 3 cm',
        'tăiate capetele, în bucăți de 3 cm',
      ),
    },
    {
      ingredient: 'aubergine',
      quantity: 2,
      unit: 'pcs',
      note: t('about 600 g, in 2.5 cm cubes', 'cam 600 g, cuburi de 2,5 cm'),
    },
    {
      ingredient: 'zucchini',
      quantity: 2,
      unit: 'pcs',
      note: t('about 500 g, in 2.5 cm cubes', 'cam 500 g, cuburi de 2,5 cm'),
    },
    {
      ingredient: 'cauliflower',
      quantity: 300,
      unit: 'g',
      optional: true,
      note: t('in small florets', 'în buchețele mici'),
    },
    { ingredient: 'frozen-peas', quantity: 150, unit: 'g' },
    {
      ingredient: 'tomato',
      quantity: 600,
      unit: 'g',
      note: t('ripe, chopped', 'coapte, tocate'),
    },
    { ingredient: 'tomato-paste', quantity: 30, unit: 'g' },
    {
      ingredient: 'garlic',
      quantity: 20,
      unit: 'g',
      note: t('4 cloves, crushed', '4 căței, striviți'),
    },
    {
      ingredient: 'bay-leaves',
      quantity: 1,
      unit: 'g',
      note: t('5 leaves', '5 foi'),
    },
    { ingredient: 'still-water', quantity: 0.2, unit: 'l' },
    { ingredient: 'salt', quantity: 12, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
    {
      ingredient: 'sugar',
      quantity: 3,
      unit: 'g',
      optional: true,
      note: t('a pinch', 'un praf'),
    },
    {
      ingredient: 'parsley',
      quantity: 20,
      unit: 'g',
      note: t('chopped', 'tocat'),
    },
    {
      ingredient: 'dill',
      quantity: 20,
      unit: 'g',
      note: t('chopped', 'tocat'),
    },
  ],
  steps: [
    {
      key: 'cut',
      text: t(
        'Wash and cut all the vegetables as in the ingredient list. Keep them on separate plates in the order they go in the pot: onion, carrot and celeriac; peppers and beans; aubergine and courgette; cauliflower and peas last.',
        'Spală și taie toate legumele după cum scrie la ingrediente. Ține-le pe farfurii separate, în ordinea în care intră în oală: ceapa, morcovul și țelina; ardeii și fasolea; vinetele și dovleceii; la urmă conopida și mazărea.',
      ),
    },
    {
      key: 'soften',
      text: t(
        'Heat the oil in a wide, heavy pot of at least 6 litres over medium heat. Add the onion, carrot and celeriac and cook, stirring, for 10 minutes, until the onion is translucent and the carrot has started to soften at the edges.',
        'Încinge uleiul într-o oală lată, cu fund gros, de cel puțin 6 litri, la foc mediu. Adaugă ceapa, morcovul și țelina și călește, amestecând, 10 minute, până ceapa devine translucidă, iar morcovul începe să se înmoaie pe margini.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'peppers-beans',
      text: t(
        'Add the peppers and green beans and cook, stirring often, for 8 minutes, until the peppers start to soften and lose their raw gloss and the beans turn a deeper green.',
        'Adaugă ardeii și fasolea verde și gătește, amestecând des, 8 minute, până ardeii încep să se înmoaie și își pierd luciul de crud, iar fasolea capătă un verde mai închis.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'aubergine-courgette',
      text: t(
        'Add the aubergine and courgette and cook, stirring, for 8 minutes, until the aubergine cubes turn translucent at the edges and the courgette looks glossy.',
        'Adaugă vinetele și dovleceii și gătește, amestecând, 8 minute, până cuburile de vânătă devin translucide pe margini, iar dovleceii se lucesc.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'paste-garlic',
      text: t(
        'Stir in the tomato paste and garlic and cook for 1 minute, until the paste darkens a shade and the garlic smells sweet.',
        'Adaugă pasta de roșii și usturoiul și lasă 1 minut, până se închide puțin pasta la culoare și usturoiul miroase dulceag.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'tomatoes',
      text: t(
        'Add the chopped tomatoes, bay leaves, water, salt and pepper and bring to the boil over high heat, which takes about 5 minutes.',
        'Adaugă roșiile tocate, foile de dafin, apa, sarea și piperul și adu la fierbere la foc mare; durează cam 5 minute.',
      ),
    },
    {
      key: 'simmer',
      text: t(
        'Lower the heat to a gentle simmer, cover and cook for 30 minutes, stirring only two or three times, until a knife slides into a piece of carrot with no resistance and the aubergine is soft but still in cubes.',
        'Scade focul la o fierbere domoală, acoperă și lasă 30 de minute, amestecând doar de două-trei ori, până intră cuțitul fără rezistență într-o bucată de morcov, iar vinetele sunt moi, dar încă în cuburi.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'peas-cauliflower',
      text: t(
        'Stir in the cauliflower, if using, and the peas straight from the freezer. Simmer uncovered for 12 minutes, until the stalk of a floret gives easily to a knife tip, the peas are tender and the liquid has reduced to a short sauce that coats the vegetables and the oil starts to show at the edges.',
        'Adaugă conopida, dacă folosești, și mazărea direct din congelator. Fierbe fără capac 12 minute, până cedează ușor cotorul unui buchet la vârful cuțitului, mazărea se înmoaie, iar zeama scade la un sos scurt, care îmbracă legumele, iar uleiul începe să se vadă pe margini.',
      ),
      timerSeconds: 720,
    },
    {
      key: 'season',
      text: t(
        'Take the pot off the heat and remove the bay leaves. Taste and add salt, pepper or the pinch of sugar if the tomatoes are sharp, then stir in the parsley and dill.',
        'Ia oala de pe foc și scoate foile de dafin. Gustă și potrivește de sare, de piper sau cu un praf de zahăr, dacă roșiile sunt acre, apoi amestecă pătrunjelul și mărarul.',
      ),
    },
    {
      key: 'rest',
      text: t(
        'Leave the ghiveci, uncovered, for 10 minutes before serving, so it thickens a little more and the flavours come together.',
        'Lasă ghiveciul descoperit 10 minute înainte de servit, ca sosul să se îngroașe puțin și gusturile să se lege.',
      ),
      timerSeconds: 600,
    },
  ],
  tips: [
    t(
      'Cool leftovers within 2 hours, in shallow containers so they cool faster, then keep them covered in the fridge for 3 to 4 days. Reheat until steaming hot all the way through. Many people like ghiveci best the next day, cold or just warm, with bread.',
      'Răcește rămășițele în cel mult 2 ore, în caserole joase, ca să se răcească mai repede, apoi ține-le acoperite la frigider 3-4 zile. Încălzește-le până fierb bine în toată masa. Multora le place ghiveciul cel mai mult a doua zi, rece sau doar călduț, cu pâine.',
    ),
    t(
      'Stir gently and rarely once the liquid is in. Constant stirring breaks the soft aubergine and courgette into mush, and the cubes should still be whole at the end.',
      'După ce ai pus lichidul, amestecă blând și rar. Dacă amesteci mereu, vinetele și dovleceii se fac terci, iar la final cuburile trebuie să fie întregi.',
    ),
    t(
      'Out of season, a can of chopped tomatoes (about 400 g in place of 600 g of fresh) gives a better sauce than pale fresh ones.',
      'Iarna, o conservă de roșii tocate (cam 400 g în loc de 600 g de roșii proaspete) dă un sos mai bun decât roșiile palide, proaspete.',
    ),
  ],
  stepTips: [
    {
      step: 'aubergine-courgette',
      text: t(
        'Aubergine drinks oil at first, then gives it back as it softens. Resist adding more oil when the pot looks dry; it is back in the sauce by the end.',
        'Vânăta bea ulei la început, apoi îl dă înapoi pe măsură ce se înmoaie. Nu adăuga ulei când oala pare uscată; până la final, uleiul se întoarce în sos.',
      ),
    },
    {
      step: 'season',
      text: t(
        'Add the dill and parsley off the heat: they keep their colour and fresh smell much better than when they cook.',
        'Pune mărarul și pătrunjelul după ce iei oala de pe foc: își păstrează mult mai bine culoarea și mirosul proaspăt decât dacă fierb.',
      ),
    },
  ],
  nutritionNote: t(
    'Many different vegetables bring fibre and plenty of volume, and there is no meat, so it is a light, filling dish. The sunflower oil is mostly unsaturated fat but still adds energy, and the aubergine soaks it up, so measure it. Salt builds up with bread and pickles on the side.',
    'Legumele variate aduc fibre și volum, iar fără carne mâncarea e ușoară, dar săturătoare. Uleiul de floarea-soarelui e în mare parte grăsime nesaturată, dar tot dă multă energie, iar vânăta îl absoarbe, așa că măsoară-l. Sarea se adună cu pâinea și murăturile servite alături.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Country bread', 'Pâine de casă'),
      reason: t(
        'A thick slice mops up the tomato and oil at the bottom of the plate.',
        'O felie groasă șterge roșiile și uleiul rămase pe fundul farfuriei.',
      ),
      principle: 'complement_flavour',
      ingredient: 'country-bread',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sharp, salty crunch cuts through the soft, oil-rich vegetables.',
        'Crocanțeala lor acră și sărată taie din moliciunea legumelor bogate în ulei.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'food',
      label: t('Olives', 'Măsline'),
      reason: t(
        'A salty bite beside the sweet, soft stew; a fasting-day plate without meat or dairy.',
        'O îmbucătură sărată lângă tocănița dulceagă și moale; o farfurie de post, fără carne și fără lactate.',
      ),
      principle: 'salt_balances_sweet',
      ingredient: 'olives',
    },
    {
      kind: 'drink',
      label: t('Dry white wine', 'Vin alb sec'),
      reason: t(
        'Its acidity lifts the oil and the sweetness of the cooked peppers and tomatoes.',
        'Aciditatea lui ridică uleiul și dulceața ardeilor și a roșiilor gătite.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'white-wine',
    },
    {
      kind: 'drink',
      label: t('Sparkling water', 'Apă minerală'),
      reason: t(
        'The bubbles clear the palate between spoonfuls of a soft, rich stew.',
        'Bulele curăță gustul între lingurile de mâncare moale și bogată.',
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
        'A hot bowl of soft vegetables with bread warms you up on a cold day.',
        'Un castron fierbinte de legume moi, cu pâine, te încălzește într-o zi rece.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'good_for',
      reason: t(
        'Served cold or just warm, it is light and needs no reheating.',
        'Servit rece sau doar călduț, e ușor și nu trebuie încălzit.',
      ),
    },
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'Plenty of vegetables and fibre with bread, and no meat to weigh you down.',
        'Multe legume și fibre, cu pâine și fără carne care să te îngreuneze.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A large bowl of oily, tomato-rich stew just before bed can sit heavy.',
        'Un castron mare de mâncare cu ulei și roșii chiar înainte de culcare poate cădea greu.',
      ),
    },
  ],
  variants: [
    {
      slug: 'ghiveci-oven-baked',
      method: 'oven-baked',
      title: t(
        'Oven-baked monastery ghiveci (ghiveci călugăresc)',
        'Ghiveci călugăresc la cuptor',
      ),
      servings: 8,
      prepMinutes: 30,
      cookMinutes: 130,
      difficulty: 'easy',
      hideBaseTips: [1, 2],
      lines: [
        { ingredient: 'sunflower-oil', quantity: 120, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('about 300 g, sliced', 'cam 300 g, tăiate felii'),
        },
        {
          ingredient: 'carrot',
          quantity: 300,
          unit: 'g',
          note: t('in thick rounds', 'tăiați rondele groase'),
        },
        {
          ingredient: 'celeriac',
          quantity: 200,
          unit: 'g',
          note: t('peeled, in 2 cm cubes', 'curățată, cuburi de 2 cm'),
        },
        {
          ingredient: 'potato',
          quantity: 400,
          unit: 'g',
          note: t('peeled, in 4 cm chunks', 'curățați, tăiați bucăți de 4 cm'),
        },
        {
          ingredient: 'bell-pepper',
          quantity: 3,
          unit: 'pcs',
          note: t('about 450 g, in wedges', 'cam 450 g, tăiați felii late'),
        },
        {
          ingredient: 'green-beans',
          quantity: 250,
          unit: 'g',
          note: t('ends trimmed, cut in half', 'tăiate capetele, înjumătățite'),
        },
        {
          ingredient: 'aubergine',
          quantity: 2,
          unit: 'pcs',
          note: t('about 600 g, in thick rounds', 'cam 600 g, rondele groase'),
        },
        {
          ingredient: 'zucchini',
          quantity: 2,
          unit: 'pcs',
          note: t('about 500 g, in thick rounds', 'cam 500 g, rondele groase'),
        },
        {
          ingredient: 'cabbage',
          quantity: 300,
          unit: 'g',
          optional: true,
          note: t('in 4 cm chunks', 'bucăți de 4 cm'),
        },
        {
          ingredient: 'okra',
          quantity: 150,
          unit: 'g',
          optional: true,
          note: t('tops trimmed, whole', 'cu codița scurtată, întregi'),
        },
        { ingredient: 'tomato-paste', quantity: 40, unit: 'g' },
        {
          ingredient: 'garlic',
          quantity: 20,
          unit: 'g',
          note: t('4 cloves, crushed', '4 căței, striviți'),
        },
        {
          ingredient: 'tomato',
          quantity: 500,
          unit: 'g',
          note: t('ripe, in thick slices', 'coapte, tăiate felii groase'),
        },
        {
          ingredient: 'bay-leaves',
          quantity: 1,
          unit: 'g',
          note: t('5 leaves', '5 foi'),
        },
        { ingredient: 'still-water', quantity: 0.2, unit: 'l' },
        { ingredient: 'salt', quantity: 14, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        {
          ingredient: 'parsley',
          quantity: 20,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'dill',
          quantity: 20,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Switch the oven on to 180 °C (160 °C fan) and set a rack in the lower third. It takes about 15 minutes to heat, so cut the vegetables in the next step while it does.',
            'Pornește cuptorul la 180 °C (160 °C cu ventilator) și pune grătarul în treimea de jos. Durează cam 15 minute până se încălzește, așa că taie legumele la pasul următor cât timp se încălzește.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'cut',
          text: t(
            'Wash and cut the vegetables as in the ingredient list: larger pieces than for the stovetop version, so they hold their shape through the long bake. Slice the tomatoes last and keep them aside.',
            'Spală și taie legumele după lista de ingrediente: bucăți mai mari decât la ghiveciul de pe aragaz, ca să-și țină forma în coacerea lungă. Taie roșiile ultimele și ține-le deoparte.',
          ),
        },
        {
          key: 'soften',
          text: t(
            'Heat 30 ml of the oil in a wide pan over medium heat. Cook the onion and carrot, stirring, for 8 minutes, until the onion is translucent.',
            'Încinge 30 ml din ulei într-o tigaie largă la foc mediu. Călește ceapa și morcovul, amestecând, 8 minute, până ceapa devine translucidă.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'toss',
          text: t(
            'In a deep baking tin about 30 × 40 cm and at least 7 cm deep, toss the softened onion and carrot with the celeriac, potatoes, peppers, green beans, aubergine, courgette, the cabbage and okra if using, the remaining 90 ml of oil, the tomato paste, garlic, bay leaves, salt and pepper, until every piece is coated.',
            'Într-o tavă adâncă de cam 30 × 40 cm și de cel puțin 7 cm adâncime, amestecă ceapa și morcovul călite cu țelina, cartofii, ardeii, fasolea verde, vinetele, dovleceii, varza și bamele, dacă folosești, restul de 90 ml de ulei, pasta de roșii, usturoiul, foile de dafin, sarea și piperul, până se îmbracă fiecare bucată.',
          ),
        },
        {
          key: 'top',
          text: t(
            'Lay the tomato slices over the top in a single layer, pour the water in down the side of the tin and cover tightly with foil.',
            'Pune feliile de roșii deasupra, într-un singur strat, toarnă apa pe lângă marginea tăvii și acoperă bine cu folie de aluminiu.',
          ),
        },
        {
          key: 'bake-covered',
          text: t(
            'Bake covered for 45 minutes, until the vegetables have released their juices and are steaming.',
            'Coace acoperit 45 de minute, până legumele își dau zeama și scot aburi.',
          ),
          timerSeconds: 2700,
        },
        {
          key: 'stir',
          text: t(
            'Lift the foil from the edge farthest from you, because the steam is hot, and tilt the tin to spoon the pan juices over the vegetables without folding them. Cover again.',
            'Ridică folia începând cu marginea dinspre partea opusă ție, ca aburul să nu-ți vină în față, înclină tava și toarnă cu lingura zeama din tavă peste legume, fără să le amesteci. Acoperă la loc.',
          ),
        },
        {
          key: 'bake-covered-2',
          text: t(
            'Bake covered for 30 minutes more, until a knife slides into a carrot, a potato chunk and a piece of celeriac with no resistance.',
            'Mai coace acoperit 30 de minute, până intră cuțitul fără rezistență într-o bucată de morcov, într-una de cartof și într-una de țelină.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'bake-uncovered',
          text: t(
            'Remove the foil and bake for 30 minutes, until the tomatoes on top are browned at the edges, the aubergine is soft but whole and the liquid has reduced to a thick sauce that reaches a third of the way up the vegetables.',
            'Scoate folia și coace 30 de minute, până roșiile de deasupra se rumenesc pe margini, vinetele sunt moi, dar întregi, iar lichidul a scăzut la un sos gros care ajunge până la o treime din înălțimea legumelor.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'rest',
          text: t(
            'Take the tin out, discard the bay leaves, scatter over the parsley and dill and leave it to rest for 10 minutes, so the sauce settles before you serve.',
            'Scoate tava, aruncă foile de dafin, presară pătrunjelul și mărarul și las-o 10 minute, ca sosul să se așeze înainte de servit.',
          ),
          timerSeconds: 600,
        },
      ],
      tips: [
        t(
          'Keep the tomato slices on top and do not stir after the foil comes off: they baste the vegetables underneath and brown, which gives the dish its baked flavour.',
          'Ține feliile de roșii deasupra și nu mai amesteca după ce scoți folia: udă legumele de dedesubt și se rumenesc, iar asta îi dă mâncării gustul de copt la cuptor.',
        ),
      ],
      stepTips: [
        {
          step: 'toss',
          text: t(
            'If the tin is more than three-quarters full, use a second, smaller tin for the overflow; vegetables packed too high steam instead of baking.',
            'Dacă tava e plină mai mult de trei sferturi, pune surplusul într-o a doua tavă, mai mică; legumele îngrămădite prea sus se fierb în abur în loc să se coacă.',
          ),
        },
      ],
      nutritionNote: t(
        'A wide mix of vegetables gives plenty of fibre, and there is no meat. The sunflower oil is mostly unsaturated fat but still adds energy, and the aubergine soaks it up; measure it. Cabbage and okra add more fibre if you use them, and salt builds up with bread and pickles on the side.',
        'Amestecul larg de legume dă multe fibre, iar fără carne mâncarea e ușoară. Uleiul de floarea-soarelui e în mare parte grăsime nesaturată, dar tot dă multă energie, iar vânăta îl absoarbe; măsoară-l. Varza și bamele aduc și mai multe fibre, dacă le folosești, iar sarea se adună cu pâinea și murăturile servite alături.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Country bread', 'Pâine de casă'),
          reason: t(
            'A thick slice mops up the roasted tomato and oil in the tin.',
            'O felie groasă șterge roșiile coapte și uleiul din tavă.',
          ),
          principle: 'complement_flavour',
          ingredient: 'country-bread',
        },
        {
          kind: 'food',
          label: t('Pickled cucumbers', 'Castraveți murați'),
          reason: t(
            'Their sharp, salty crunch cuts through the soft, oily vegetables.',
            'Crocanțeala lor acră și sărată taie din moliciunea legumelor cu ulei.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-cucumbers',
        },
        {
          kind: 'drink',
          label: t('Dry red wine', 'Vin roșu sec'),
          reason: t(
            'Its light tannins stand up to the roasted, caramelised edges of the vegetables.',
            'Taninii lui ușori țin piept marginilor coapte și caramelizate ale legumelor.',
          ),
          principle: 'complement_flavour',
          ingredient: 'red-wine',
        },
        {
          kind: 'drink',
          label: t('Sparkling water', 'Apă minerală'),
          reason: t(
            'The bubbles clear the palate between rich, oily spoonfuls.',
            'Bulele curăță gustul între lingurile bogate, cu ulei.',
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
            'The long bake fills the kitchen with warmth, and the dish is hot and hearty.',
            'Coacerea lungă încălzește bucătăria, iar mâncarea e fierbinte și consistentă.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Lots of vegetables and no meat; a slice of bread makes it a full meal.',
            'Multe legume și fără carne; o felie de pâine îl face o masă completă.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'Two hours with the oven on heats the kitchen, which is unwelcome in hot weather.',
            'Două ore cu cuptorul pornit încălzesc bucătăria, ceea ce nu e plăcut pe vreme caldă.',
          ),
        },
      ],
    },
    {
      slug: 'ghiveci-hungarian',
      cuisine: 'hungarian',
      title: t(
        'Lecsó (Hungarian pepper, tomato and onion stew)',
        'Lecsó (tocăniță ungurească de ardei, roșii și ceapă)',
      ),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 50,
      difficulty: 'easy',
      hideBaseTips: [0, 1, 2],
      lines: [
        {
          ingredient: 'lard',
          quantity: 40,
          unit: 'g',
          note: t(
            'or 40 ml sunflower oil',
            'sau 40 ml de ulei de floarea-soarelui',
          ),
        },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('about 300 g, in half-moons', 'cam 300 g, tăiate semiluni'),
        },
        {
          ingredient: 'paprika',
          quantity: 3,
          unit: 'g',
          optional: true,
          note: t(
            'sweet; optional, some Hungarian cooks leave it out',
            'dulce; opțional, unii bucătari unguri nu o pun',
          ),
        },
        {
          ingredient: 'hungarian-pepper',
          quantity: 8,
          unit: 'pcs',
          note: t(
            'about 800 g, cored, in 1.5 cm strips',
            'cam 800 g, fără cotor, tăiați fâșii de 1,5 cm',
          ),
        },
        {
          ingredient: 'tomato',
          quantity: 400,
          unit: 'g',
          note: t(
            'ripe, peeled and chopped',
            'coapte, curățate de coajă și tocate',
          ),
        },
        { ingredient: 'salt', quantity: 6, unit: 'g' },
        {
          ingredient: 'sugar',
          quantity: 3,
          unit: 'g',
          optional: true,
          note: t('a pinch', 'un praf'),
        },
      ],
      steps: [
        {
          key: 'score',
          text: t(
            'Cut a shallow cross in the base of each tomato and put the tomatoes in a heatproof bowl.',
            'Taie o cruce mică la baza fiecărei roșii și pune roșiile într-un castron rezistent la căldură.',
          ),
        },
        {
          key: 'scald',
          text: t(
            'Pour boiling water over the tomatoes and leave them for 1 minute, until the skins split at the cross and curl back.',
            'Toarnă apă clocotită peste roșii și lasă-le 1 minut, până se crapă coaja la cruce și se răsfrânge.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'peel',
          text: t(
            'Lift the tomatoes out, peel off the skins and chop the flesh, keeping all the juice.',
            'Scoate roșiile, dă jos coaja și toacă pulpa, păstrând tot sucul.',
          ),
        },
        {
          key: 'cut',
          text: t(
            'Core the peppers and cut them into strips, and cut the onion into half-moons.',
            'Curăță ardeii de cotor și semințe și taie-i fâșii, iar ceapa taie-o semiluni.',
          ),
        },
        {
          key: 'onion',
          text: t(
            'Melt the lard in a wide, heavy pot over medium-low heat. Add the onion and cook, stirring, for 8 minutes, until soft and translucent but not browned.',
            'Topește untura într-o oală lată, cu fund gros, la foc mic spre mediu. Adaugă ceapa și călește, amestecând, 8 minute, până se înmoaie și devine translucidă, fără să se rumenească.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'paprika',
          text: t(
            'Take the pot off the heat, stir in the paprika, if using, for a few seconds and add the peppers straight away, stirring to coat them. Paprika scorches quickly and turns bitter.',
            'Ia oala de pe foc, amestecă boiaua, dacă folosești, câteva secunde și pune imediat ardeii, amestecând să se îmbrace. Boiaua se arde repede și se face amară.',
          ),
        },
        {
          key: 'peppers',
          text: t(
            'Return the pot to medium-low heat, cover and cook for 15 minutes, stirring now and then, until the pepper strips bend without snapping and have released their juice.',
            'Pune oala înapoi pe foc mic spre mediu, acoperă și gătește 15 minute, amestecând din când în când, până ardeii se îndoaie fără să se rupă și și-au dat zeama.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'tomatoes',
          text: t(
            'Add the chopped tomatoes with their juice and the salt, and bring to a simmer.',
            'Adaugă roșiile tocate cu tot sucul lor și sarea și adu la fierbere.',
          ),
        },
        {
          key: 'reduce',
          text: t(
            'Simmer uncovered for 20 minutes, stirring now and then, until the peppers are very soft, a short sauce coats them and the fat starts to show at the edges.',
            'Fierbe fără capac 20 de minute, amestecând din când în când, până ardeii sunt foarte moi, un sos scurt îi îmbracă, iar grăsimea începe să se vadă pe margini.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'season',
          text: t(
            'Taste, add the pinch of sugar if the tomatoes are sharp and adjust the salt. Serve hot or lukewarm.',
            'Gustă, adaugă un praf de zahăr, dacă roșiile sunt acre, și potrivește de sare. Servește fierbinte sau călduț.',
          ),
        },
      ],
      tips: [
        t(
          'Cool leftovers within 2 hours, in shallow containers so they cool faster, then keep them covered in the fridge for 3 to 4 days. Reheat until steaming hot all the way through. Many people like lecsó best the next day.',
          'Răcește rămășițele în cel mult 2 ore, în caserole joase, ca să se răcească mai repede, apoi ține-le acoperite la frigider 3-4 zile. Încălzește-le până fierb bine în toată masa. Multora le place lecsó-ul cel mai mult a doua zi.',
        ),
        t(
          'Cook the peppers until soft before the tomatoes go in: the acid of the tomatoes slows the softening of the peppers, so they take much longer and stay firmer if the tomatoes go in first.',
          'Fierbe ardeii până se înmoaie înainte să pui roșiile: aciditatea roșiilor încetinește înmuierea ardeilor, așa că dacă roșiile intră primele, ardeii se gătesc mult mai greu și rămân mai tari.',
        ),
        t(
          'For a meat-free lecsó, use sunflower oil in place of the lard.',
          'Pentru un lecsó fără carne, folosește ulei de floarea-soarelui în loc de untură.',
        ),
        t(
          'To turn it into a main dish, fry slices of smoked sausage (kolbász) in the pot first, set them aside, and stir them back in at the end, or stir beaten eggs into the finished stew over low heat until fully set, with no runny egg left.',
          'Ca să-l faci fel principal, prăjește întâi în oală felii de cârnat afumat (kolbász) scoate-le deoparte și pune-le înapoi la final, sau amestecă ouă bătute în tocana gata, la foc mic, până se încheagă complet, fără ou lichid.',
        ),
      ],
      stepTips: [
        {
          step: 'onion',
          text: t(
            'Keep the heat low: onion that browns turns bitter and brings a roasted taste that does not belong in lecsó.',
            'Ține focul mic: ceapa care se rumenește se amărăște și dă un gust de prăjit care nu-și are locul într-un lecsó.',
          ),
        },
      ],
      nutritionNote: t(
        'Peppers, tomatoes and onion bring fibre and a lot of volume for little energy. The lard adds saturated fat, so swap in oil if you prefer a lighter dish, and the salt adds up if you eat it with bread and smoked sausage.',
        'Ardeii, roșiile și ceapa aduc fibre și multă masă pentru puțină energie. Untura aduce grăsime saturată, așa că înlocuiește-o cu ulei dacă vrei o variantă mai ușoară, iar sarea se adună dacă îl mănânci cu pâine și cârnat afumat.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Country bread', 'Pâine de casă'),
          reason: t(
            'A thick slice mops up the sweet pepper and tomato juices.',
            'O felie groasă șterge zeama dulce de ardei și roșii.',
          ),
          principle: 'complement_flavour',
          ingredient: 'country-bread',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its acidity matches the tomato and lifts the sweetness of the peppers.',
            'Aciditatea lui se potrivește cu roșiile și ridică dulceața ardeilor.',
          ),
          principle: 'complement_flavour',
          ingredient: 'white-wine',
        },
        {
          kind: 'drink',
          label: t('Sparkling water', 'Apă minerală'),
          reason: t(
            'The bubbles refresh the palate between spoonfuls of sweet, soft stew.',
            'Bulele împrospătează gustul între lingurile de tocăniță dulce și moale.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'sparkling-water',
        },
      ],
      eatingMoments: [
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Made of summer vegetables and good lukewarm, so it needs no hot plate.',
            'Făcut din legume de vară și bun și călduț, așa că nu trebuie servit fierbinte.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Just three vegetables and a slice of bread make a light, quick meal.',
            'Doar trei legume și o felie de pâine fac o masă ușoară și rapidă.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Onion, peppers and tomato can bring on heartburn if you lie down soon after.',
            'Ceapa, ardeii și roșiile pot da arsuri dacă te culci la scurt timp după masă.',
          ),
        },
      ],
    },
  ],
};
