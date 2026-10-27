import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Mâncare de cartofi base is the Romanian potato stew in tomato sauce, a
// fasting-day dish unless the optional smoked sausages go in. Each Variant is a
// full Recipe with its own lines, steps and guidance; the base's Recipe-level
// Tips are inherited unless a Variant hides them.
export const mancareDeCartofi: BaseRecipeSeed = {
  slug: 'mancare-de-cartofi',
  title: t(
    'Romanian potato stew in tomato sauce (mâncare de cartofi)',
    'Mâncare de cartofi cu sos de roșii',
  ),
  servings: 4,
  prepMinutes: 15,
  cookMinutes: 50,
  difficulty: 'easy',
  lines: [
    { ingredient: 'sunflower-oil', quantity: 60, unit: 'ml' },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('diced', 'tăiate cubulețe'),
    },
    {
      ingredient: 'bell-pepper',
      quantity: 1,
      unit: 'pcs',
      note: t('red, cut in strips', 'roșu, tăiat fâșii'),
    },
    {
      ingredient: 'garlic',
      quantity: 15,
      unit: 'g',
      note: t('3 cloves, crushed', '3 căței, striviți'),
    },
    { ingredient: 'tomato-paste', quantity: 30, unit: 'g' },
    { ingredient: 'paprika', quantity: 5, unit: 'g' },
    {
      ingredient: 'potato',
      quantity: 1,
      unit: 'kg',
      note: t(
        'peeled, in 2 to 3 cm chunks',
        'curățați, tăiați bucăți de 2-3 cm',
      ),
    },
    { ingredient: 'passata', quantity: 400, unit: 'ml' },
    { ingredient: 'still-water', quantity: 0.5, unit: 'l' },
    {
      ingredient: 'bay-leaves',
      quantity: 0.6,
      unit: 'g',
      note: t('about 3 leaves', 'cam 3 foi'),
    },
    { ingredient: 'savory', quantity: 2, unit: 'g', note: t('dried', 'uscat') },
    {
      ingredient: 'smoked-sausages',
      quantity: 300,
      unit: 'g',
      optional: true,
      note: t('sliced 1 cm thick', 'tăiați felii de 1 cm'),
    },
    {
      ingredient: 'parsley',
      quantity: 20,
      unit: 'g',
      note: t('chopped', 'tocat'),
    },
    { ingredient: 'salt', quantity: 8, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
  ],
  steps: [
    {
      key: 'cut',
      text: t(
        'Peel the potatoes and cut them into chunks of about the same size, 2 to 3 cm, so they cook at the same pace. Dice the onions, cut the pepper into strips and chop the parsley.',
        'Curăță cartofii și taie-i bucăți cam la fel de mari, de 2-3 cm, ca să se fiarbă deodată. Taie ceapa cubulețe, ardeiul fâșii și toacă pătrunjelul.',
      ),
    },
    {
      key: 'soften',
      text: t(
        'Heat the oil in a wide, heavy pot over medium heat. Add the onion and pepper and cook for about 7 minutes, stirring now and then, until soft and translucent but not browned.',
        'Încinge uleiul într-o oală lată, cu fund gros, la foc mediu. Adaugă ceapa și ardeiul și călește-le cam 7 minute, amestecând din când în când, până se înmoaie și devin translucide, fără să se rumenească.',
      ),
      timerSeconds: 420,
    },
    {
      key: 'garlic',
      text: t(
        'Stir in the garlic and cook for 1 minute, until it smells fragrant.',
        'Adaugă usturoiul și călește-l 1 minut, până începe să miroasă.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'paste',
      text: t(
        'Turn the heat down to low. Stir in the tomato paste and the paprika and cook for 1 minute, stirring all the time, until the paste darkens a shade.',
        'Dă focul la mic. Adaugă pasta de roșii și boiaua și gătește 1 minut, amestecând întruna, până se închide puțin pasta la culoare.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'stew',
      text: t(
        'Add the potatoes, the passata, the water, the bay leaves, the savory and 5 g of the salt. Stir, bring to the boil over high heat, then turn the heat down. The liquid should almost cover the potatoes.',
        'Adaugă cartofii, pasata, apa, foile de dafin, cimbrul și 5 g din sare. Amestecă, adu la fierbere la foc mare, apoi scade focul. Lichidul trebuie să acopere cartofii aproape de tot.',
      ),
    },
    {
      key: 'simmer',
      text: t(
        'Simmer gently, partly covered, for 15 minutes, stirring now and then so nothing catches on the bottom.',
        'Fierbe domol, cu capacul întredeschis, 15 minute, amestecând din când în când ca să nu se prindă nimic de fund.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'sausages-brown',
      text: t(
        'If you use the sausages, brown the slices in a dry pan over medium heat for 5 minutes, turning them, until browned at the edges, while the stew keeps simmering. If the sausages were raw, wash your hands, the board and the knife with hot soapy water now.',
        'Dacă pui cârnați, rumenește felițele într-o tigaie uscată, la foc mediu, 5 minute, întorcându-le, până se rumenesc pe margini, în timp ce mâncarea continuă să fiarbă. Dacă cârnații au fost cruzi, spală-ți acum mâinile, tocătorul și cuțitul cu apă fierbinte și detergent.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'sausages-add',
      text: t(
        'Stir the browned sausages into the stew. Ready-to-eat smoked sausages only need to be steaming hot all the way through. If the label says to cook them before eating, cut a slice in half: it must be firm and steaming right through, with no soft, raw-looking centre (71 °C in the centre if you have a thermometer). Smoked sausage stays pink, so do not go by colour.',
        'Pune cârnații rumeniți în mâncare. Cârnații afumați gata de mâncat trebuie doar să fie fierbinți de tot, să scoată aburi. Dacă pe etichetă scrie că se consumă numai după preparare termică, taie o feliuță în două: trebuie să fie tare și fierbinte până în mijloc, fără miez moale, crud (71 °C în centru, dacă ai termometru). Cârnatul afumat rămâne roz, așa că nu te lua după culoare.',
      ),
    },
    {
      key: 'finish-simmer',
      text: t(
        'Simmer for 10 more minutes, until a knife slides into the biggest chunk with no resistance and the edges begin to crumble. Crush a few chunks against the side of the pot to thicken the sauce, which should coat the back of a spoon. If the potatoes still resist, simmer 5 minutes more and check again.',
        'Mai fierbe 10 minute, până intră cuțitul fără rezistență în cea mai mare bucată de cartof, iar marginile încep să se desfacă. Zdrobește câteva bucăți de cartof de peretele oalei ca să se îngroașe sosul, care trebuie să se prindă de dosul lingurii. Dacă cartofii încă opun rezistență, mai fierbe 5 minute și verifică din nou.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'finish',
      text: t(
        'Take out and throw away the bay leaves. Stir in the parsley and the pepper, taste, and add the remaining salt only if it needs it, especially if you used sausages. Leave the pot off the heat for 5 minutes before serving.',
        'Scoate foile de dafin și aruncă-le. Amestecă pătrunjelul și piperul, gustă și adaugă restul de sare doar dacă mai trebuie, mai ales dacă ai pus cârnați. Ia oala de pe foc și las-o 5 minute înainte de servire.',
      ),
      timerSeconds: 300,
    },
  ],
  tips: [
    t(
      'Without the sausages this is a fasting-day dish (eaten during Orthodox fasts), with only oil and vegetables. With them it is a different, meatier pot, and the sausages are salty, so hold back the last of the salt.',
      'Fără cârnați e o mâncare de post, doar cu ulei și legume. Cu ei devine o oală mai consistentă, iar cârnații sunt sărați, așa că ține deoparte ultima parte din sare.',
    ),
    t(
      'Use all-purpose potatoes: floury ones fall apart before the sauce is ready, very waxy ones barely thicken it.',
      'Alege cartofi de uz general: cei prea făinoși se destramă înainte să fie sosul gata, iar cei foarte ceroși abia îngroașă sosul.',
    ),
    t(
      'Cool leftovers within 2 hours, keep them in the fridge for up to 3 to 4 days and reheat until steaming hot all the way through, with a splash of water because the sauce thickens overnight.',
      'Răcește mâncarea rămasă în cel mult 2 ore, ține-o la frigider 3-4 zile și încălzește-o până scoate aburi în toată oala, cu puțină apă, pentru că sosul se îngroașă până a doua zi.',
    ),
  ],
  stepTips: [
    {
      step: 'paste',
      text: t(
        'Paprika burns in seconds and turns bitter: keep the heat low and add the liquid soon after.',
        'Boiaua se arde în câteva secunde și se amărăște: ține focul mic și adaugă lichidul repede.',
      ),
    },
    {
      step: 'finish',
      text: t(
        'Count the bay leaves going in and out: they stay sharp and are easy to choke on if one ends up on a plate.',
        'Numără foile de dafin la intrare și la ieșire: rămân țepoase și te poți îneca cu ele dacă una ajunge în farfurie.',
      ),
    },
  ],
  nutritionNote: t(
    'Filling and cheap: the potatoes give starchy energy, and the tomato and pepper add vegetables. It has little protein: add the sausages, or serve it with eggs, cheese or beans alongside. The oil is mostly unsaturated; pickles, bread and especially smoked sausages add salt, and the sausages add saturated fat.',
    'Sățioasă și ieftină: cartofii dau energie din amidon, iar roșiile și ardeiul adaugă legume. Are puține proteine: adaugă cârnații sau servește-o cu ouă, brânză sau fasole alături. Uleiul are mai ales grăsimi nesaturate; murăturile, pâinea și mai ales cârnații afumați aduc sare, iar cârnații adaugă și grăsimi saturate.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sharp, salty crunch cuts through the soft potatoes in sauce.',
        'Crocanțeala lor acră și sărată contrastează cu cartofii moi în sos.',
      ),
      principle: 'contrast_texture',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'food',
      label: t('Pickled green tomatoes', 'Gogonele murate'),
      reason: t(
        'Their sour, firm bite lifts a mild, soft stew.',
        'Gustul lor acru și textura fermă înviorează o mâncare moale și blândă.',
      ),
      principle: 'contrast_texture',
      ingredient: 'pickled-green-tomatoes',
    },
    {
      kind: 'food',
      label: t('Fresh bread', 'Pâine proaspătă'),
      reason: t(
        'A thick slice mops up the tomato sauce left on the plate.',
        'O felie groasă șterge sosul de roșii rămas în farfurie.',
      ),
      principle: 'complement_flavour',
      ingredient: 'bread',
    },
    {
      kind: 'food',
      label: t(
        'Romanian white cabbage salad with dill (salată de varză)',
        'Salată de varză albă cu mărar',
      ),
      reason: t(
        'The crisp, vinegar-dressed cabbage contrasts with the soft potatoes in sauce, and both suit a fasting day.',
        'Varza crocantă, cu oțet, face contrast cu cartofii moi în sos, iar amândouă merg într-o zi de post.',
      ),
      principle: 'contrast_texture',
      recipe: 'coleslaw-romanian',
    },
    {
      kind: 'drink',
      label: t('Sparkling water', 'Apă minerală'),
      reason: t(
        'The bubbles clear the palate between spoonfuls of the thick sauce.',
        'Bulele curăță gustul între lingurile de sos gros.',
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
        'A hot, thick stew warms you up on a cold day.',
        'O mâncare caldă și groasă te încălzește într-o zi rece.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Potatoes bring carbohydrates to refill energy; add the sausages or a side of protein if you want more.',
        'Cartofii aduc carbohidrați pentru refacerea energiei; adaugă cârnații sau o garnitură cu proteine dacă vrei mai mult.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'A hot, starchy stew is heavy when it is already warm outside.',
        'O mâncare fierbinte, cu mult amidon, cade greu când afară e deja cald.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A big bowl of potatoes just before bed can sit heavy.',
        'Un castron mare de cartofi chiar înainte de culcare poate cădea greu.',
      ),
    },
  ],
  variants: [
    {
      slug: 'mancare-de-cartofi-indian',
      cuisine: 'indian',
      title: t(
        'Aloo tamatar (North Indian potatoes in spiced tomato gravy)',
        'Aloo tamatar (cartofi în sos indian de roșii, cu condimente)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 40,
      difficulty: 'easy',
      hideBaseTips: [0, 2],
      lines: [
        { ingredient: 'sunflower-oil', quantity: 45, unit: 'ml' },
        {
          ingredient: 'cumin-seeds',
          quantity: 3,
          unit: 'g',
          note: t('about 1 teaspoon', 'cam 1 linguriță'),
        },
        {
          ingredient: 'ginger',
          quantity: 15,
          unit: 'g',
          note: t('peeled and grated', 'curățat și ras'),
        },
        {
          ingredient: 'hot-pepper',
          quantity: 1,
          unit: 'pcs',
          note: t('green, slit lengthways', 'verde, tăiat pe lung'),
        },
        {
          ingredient: 'tomato',
          quantity: 600,
          unit: 'g',
          note: t('ripe, puréed in a blender', 'coapte, pasate în blender'),
        },
        { ingredient: 'turmeric', quantity: 2, unit: 'g' },
        { ingredient: 'chili-powder', quantity: 2, unit: 'g' },
        { ingredient: 'ground-coriander', quantity: 5, unit: 'g' },
        { ingredient: 'salt', quantity: 8, unit: 'g' },
        {
          ingredient: 'potato',
          quantity: 800,
          unit: 'g',
          note: t(
            'peeled, in 2.5 cm chunks',
            'curățați, tăiați bucăți de 2,5 cm',
          ),
        },
        { ingredient: 'still-water', quantity: 0.4, unit: 'l' },
        { ingredient: 'garam-masala', quantity: 2, unit: 'g' },
        {
          ingredient: 'dried-fenugreek-leaves',
          quantity: 2,
          unit: 'g',
          optional: true,
          note: t('crushed between your palms', 'frecate între palme'),
        },
        {
          ingredient: 'coriander',
          quantity: 20,
          unit: 'g',
          note: t('fresh, chopped', 'proaspăt, tocat'),
        },
      ],
      steps: [
        {
          key: 'prep',
          text: t(
            'Peel the potatoes and cut them into 2.5 cm chunks. Purée the tomatoes in a blender until smooth.',
            'Curăță cartofii și taie-i bucăți de 2,5 cm. Pasează roșiile în blender până se fac omogene.',
          ),
        },
        {
          key: 'cumin',
          text: t(
            'Heat the oil in a wide, heavy pot over medium heat until it shimmers. Add the cumin seeds and let them sizzle for 30 seconds, until they darken a shade and smell toasty.',
            'Încinge uleiul într-o oală lată, cu fund gros, la foc mediu, până se încinge și se unduiește. Adaugă semințele de chimion și lasă-le 30 de secunde să sfârâie, până se închid puțin la culoare și miros a prăjit.',
          ),
          timerSeconds: 30,
        },
        {
          key: 'ginger',
          text: t(
            'Add the ginger and the slit chilli and stir for 30 seconds, until fragrant.',
            'Adaugă ghimbirul și ardeiul iute tăiat pe lung și amestecă 30 de secunde, până miroase frumos.',
          ),
          timerSeconds: 30,
        },
        {
          key: 'masala',
          text: t(
            'Pour in the puréed tomatoes, then add the turmeric, chilli powder, ground coriander and the salt. Cook over medium heat for 10 minutes, stirring now and then, until thick and the oil begins to separate at the edges.',
            'Toarnă roșiile pasate, apoi adaugă turmericul, ardeiul iute măcinat, coriandrul măcinat și sarea. Gătește la foc mediu 10 minute, amestecând din când în când, până se îngroașă și uleiul începe să se separe pe margini.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'potatoes',
          text: t(
            'Stir in the potatoes and the water. Bring to the boil, cover and turn the heat down to a gentle simmer.',
            'Adaugă cartofii și apa. Adu la fierbere, acoperă și scade focul la o fierbere domoală.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Simmer, covered, for 20 minutes, stirring once or twice, until a knife slides into a potato with no resistance.',
            'Fierbe acoperit 20 de minute, amestecând o dată sau de două ori, până intră cuțitul într-un cartof fără rezistență.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'thicken',
          text: t(
            'Mash a few chunks against the side of the pot and simmer uncovered for 3 minutes, until the gravy is thick and clings to the potatoes.',
            'Zdrobește câteva bucăți de cartof de peretele oalei și fierbe fără capac 3 minute, până sosul se îngroașă și se prinde de cartofi.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'finish',
          text: t(
            'Stir in the garam masala and the fenugreek leaves, if using. Take off the heat, taste for salt and scatter the fresh coriander over the top.',
            'Amestecă garam masala și frunzele de schinduf, dacă le folosești. Ia oala de pe foc, gustă de sare și presară coriandrul proaspăt deasupra.',
          ),
        },
      ],
      tips: [
        t(
          'Cook the tomatoes until the oil separates from the masala: before that the gravy tastes raw and sharp.',
          'Gătește roșiile până se separă uleiul din sos: până atunci sosul are gust crud și acru.',
        ),
        t(
          'Cool leftovers within 2 hours, keep them in the fridge for up to 3 days and reheat until steaming hot all the way through, with a splash of water.',
          'Răcește mâncarea rămasă în cel mult 2 ore, ține-o la frigider până la 3 zile și încălzește-o până scoate aburi în toată oala, cu puțină apă.',
        ),
      ],
      stepTips: [
        {
          step: 'cumin',
          text: t(
            'If the cumin turns dark brown, it is burnt and bitter: take the pot off the heat, let the oil cool, discard it and start again with fresh oil.',
            'Dacă chimionul se face brun închis, e ars și amar: ia oala de pe foc, lasă uleiul să se răcească, aruncă-l și ia-o de la capăt cu ulei proaspăt.',
          ),
        },
      ],
      nutritionNote: t(
        'Potatoes give filling starchy energy, and the tomatoes and spices add flavour without much fat. It has little protein, so eat it with yogurt or a lentil dish. The oil is mostly unsaturated, and the potatoes are high in starch, so keep the rice or bread alongside modest.',
        'Cartofii dau energie sățioasă din amidon, iar roșiile și condimentele adaugă gust fără multă grăsime. Are puține proteine, așa că mănâncă-o cu iaurt sau cu o mâncare de linte. Uleiul are mai ales grăsimi nesaturate, iar cartofii au mult amidon, așa că ține porția de orez sau de pâine moderată.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Plain rice', 'Orez simplu'),
          reason: t(
            'Rice soaks up the spiced tomato gravy.',
            'Orezul absoarbe sosul de roșii cu condimente.',
          ),
          principle: 'complement_flavour',
          ingredient: 'rice',
        },
        {
          kind: 'food',
          label: t('Naan', 'Naan'),
          reason: t(
            'Torn naan scoops up the thick gravy.',
            'Naanul rupt adună sosul gros.',
          ),
          principle: 'complement_flavour',
          ingredient: 'naan',
        },
        {
          kind: 'food',
          label: t('Plain yogurt', 'Iaurt simplu'),
          reason: t(
            'Its cool tang calms the chilli and rounds out the gravy.',
            'Gustul lui răcoros și acrișor domolește iuțeala și completează sosul.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'yogurt',
        },
        {
          kind: 'drink',
          label: t('Buttermilk', 'Zară'),
          reason: t(
            'A cool, tangy drink cools the heat of the chilli.',
            'O băutură răcoritoare și ușor acrișoară domolește iuțeala ardeiului.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'buttermilk',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Warm spices and a hot gravy suit a cold day.',
            'Condimentele calde și sosul fierbinte se potrivesc într-o zi rece.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'A hot, spiced gravy is heavy when it is already warm outside.',
            'Un sos fierbinte și condimentat cade greu când afară e deja cald.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Chilli and a big portion of starch just before bed can sit heavy.',
            'Iuțeala și o porție mare de amidon chiar înainte de culcare pot cădea greu.',
          ),
        },
      ],
    },
    {
      slug: 'mancare-de-cartofi-japanese',
      cuisine: 'japanese',
      title: t(
        'Nikujaga (Japanese simmered beef and potatoes)',
        'Nikujaga (cartofi cu carne de vită înăbușiți în sos dulce de soia, în stil japonez)',
      ),
      servings: 4,
      prepMinutes: 40,
      cookMinutes: 45,
      difficulty: 'easy',
      hideBaseTips: [0, 1, 2],
      lines: [
        {
          ingredient: 'beef-steak',
          quantity: 300,
          unit: 'g',
          note: t(
            'sirloin or ribeye, sliced as thin as you can, 2 mm at most',
            'vrăbioară sau antricot, tăiată cât de subțire poți, cel mult 2 mm',
          ),
        },
        { ingredient: 'sunflower-oil', quantity: 15, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'cut lengthways in thick wedges (1 cm)',
            'tăiate pe lung în felii groase (bucăți de 1 cm)',
          ),
        },
        {
          ingredient: 'potato',
          quantity: 600,
          unit: 'g',
          note: t(
            'peeled, in 3 to 4 cm chunks',
            'curățați, tăiați bucăți de 3-4 cm',
          ),
        },
        {
          ingredient: 'carrot',
          quantity: 150,
          unit: 'g',
          note: t('in 2 cm chunks', 'tăiați bucăți de 2 cm'),
        },
        {
          ingredient: 'dashi',
          quantity: 3,
          unit: 'g',
          note: t(
            'instant granules, dissolved in the water',
            'granule instant, dizolvate în apă',
          ),
        },
        { ingredient: 'still-water', quantity: 0.4, unit: 'l' },
        { ingredient: 'sake', quantity: 50, unit: 'ml' },
        { ingredient: 'mirin', quantity: 50, unit: 'ml' },
        { ingredient: 'sugar', quantity: 15, unit: 'g' },
        { ingredient: 'soy-sauce', quantity: 60, unit: 'ml' },
      ],
      steps: [
        {
          key: 'freeze',
          text: t(
            'Put the whole piece of beef on a plate in the freezer for 35 minutes, until firm but not frozen solid.',
            'Pune bucata întreagă de vită pe o farfurie în congelator, 35 de minute, până se întărește, fără să înghețe de tot.',
          ),
          timerSeconds: 2100,
        },
        {
          key: 'prep',
          text: t(
            'While the beef firms up, peel and cut the potatoes, onions and carrots. Stir the dashi granules into 0.4 l of hot water until dissolved.',
            'Cât timp se întărește carnea, curăță și taie cartofii, ceapa și morcovii. Dizolvă granulele de dashi în 0,4 l de apă fierbinte.',
          ),
        },
        {
          key: 'slice',
          text: t(
            'With a very sharp knife, slice the beef across the grain as thin as you can, 2 mm at most, cut the slices into 5 cm lengths and lay them on a clean plate (do not rinse the beef). Wash the board and the knife with hot soapy water.',
            'Cu un cuțit foarte ascuțit, taie carnea pe contra fibrei cât de subțire poți, cel mult 2 mm, taie felițele bucăți de 5 cm și pune-le pe o farfurie curată (nu clăti carnea). Spală tocătorul și cuțitul cu apă fierbinte și detergent.',
          ),
        },
        {
          key: 'beef',
          text: t(
            'Heat the oil in a wide, heavy pot over medium-high heat. Add the beef and the onion and stir-fry for 3 minutes, separating the slices, until the beef is no longer red on the outside. Now wash your hands with warm soapy water.',
            'Încinge uleiul într-o oală lată, cu fund gros, la foc mediu spre mare. Adaugă carnea și ceapa și amestecă 3 minute, desfăcând felițele, până carnea nu mai e roșie la exterior. Acum spală-ți mâinile cu apă caldă și săpun.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'veg',
          text: t(
            'Add the potatoes and carrots and stir for 1 minute, until coated in the oil.',
            'Adaugă cartofii și morcovii și amestecă 1 minut, până se acoperă cu ulei.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'liquid',
          text: t(
            'Pour in the dashi, the sake and the mirin, and add the sugar. Bring to the boil and skim off the grey foam with a spoon.',
            'Toarnă dashi, sake și mirin și adaugă zahărul. Adu la fierbere și ia cu o lingură spuma cenușie.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Add the soy sauce and turn the heat down to a gentle simmer. Cover with a drop lid, a disc of baking paper with a small hole cut in the middle, and simmer for 20 minutes, until a knife slides into a potato with no resistance, the beef is tender and cooked through, and the liquid has reduced by about half.',
            'Adaugă sosul de soia și scade focul la o fierbere domoală. Acoperă cu un capac plutitor, un disc de hârtie de copt cu o gaură mică la mijloc, și fierbe 20 de minute, până intră cuțitul într-un cartof fără rezistență, carnea e fragedă și gătită complet, iar lichidul scade cam la jumătate.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'rest',
          text: t(
            'Take the pot off the heat, leave the drop lid on and let it stand for 10 minutes, so the potatoes take up the sauce.',
            'Ia oala de pe foc, lasă capacul plutitor pe loc și las-o 10 minute, ca să absoarbă cartofii sosul.',
          ),
          timerSeconds: 600,
        },
      ],
      tips: [
        t(
          'Slicing is the hard part: a partly frozen piece slices thin without sliding. If your butcher sells thin sukiyaki slices, use 300 g of those and skip the freezing.',
          'Tăiatul e partea grea: o bucată pe jumătate înghețată se taie subțire fără să alunece. Dacă măcelarul are felii subțiri pentru sukiyaki, ia 300 g din ele și sari peste congelare.',
        ),
        t(
          'Cool leftovers within 2 hours, keep them in the fridge for up to 3 days and reheat until steaming hot all the way through. The potatoes taste even better on the second day.',
          'Răcește mâncarea rămasă în cel mult 2 ore, ține-o la frigider până la 3 zile și încălzește-o până e fierbinte și scoate aburi peste tot. Cartofii sunt și mai buni a doua zi.',
        ),
      ],
      stepTips: [
        {
          step: 'simmer',
          text: t(
            'The drop lid sends the simmering sauce back over the top and stops the potatoes tumbling, so they cook and season evenly in little liquid without breaking. A plate that fits inside the pot also works.',
            'Capacul plutitor trimite sosul care fierbe înapoi peste mâncare și oprește cartofii să se rostogolească, așa că se gătesc și se îmbibă egal în puțin lichid, fără să se rupă. Merge și o farfurie care încape în oală.',
          ),
        },
      ],
      nutritionNote: t(
        'Beef and potatoes make a filling meal with protein and starchy energy, and the carrot and onion add a little fibre. The soy sauce and dashi granules add a lot of salt, the sugar and mirin make it sweet, and the beef adds some saturated fat; serve it with a modest portion of rice.',
        'Vita și cartofii fac o masă sățioasă, cu proteine și energie din amidon, iar morcovul și ceapa aduc ceva fibre. Sosul de soia și dashi aduc multă sare, zahărul și mirinul îl îndulcesc, iar vita adaugă ceva grăsimi saturate; servește-o cu o porție moderată de orez.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t(
            'Japanese short-grain rice',
            'Orez japonez (bob scurt) fiert',
          ),
          reason: t(
            'Plain short-grain rice soaks up the sweet and salty sauce.',
            'Orezul simplu cu bob scurt absoarbe sosul dulce și sărat.',
          ),
          principle: 'complement_flavour',
          ingredient: 'sushi-rice',
        },
        {
          kind: 'food',
          label: t(
            'Miso soup (made with miso paste)',
            'Supă miso (din pastă miso)',
          ),
          reason: t(
            'A light, savoury broth rounds out the meal beside the sweeter stew.',
            'O supă ușoară și sărată completează masa alături de mâncarea mai dulce.',
          ),
          principle: 'complement_flavour',
          ingredient: 'miso',
        },
        {
          kind: 'drink',
          label: t('Green tea', 'Ceai verde'),
          reason: t(
            'Its light bitterness balances the sweet, salty sauce.',
            'Amăreala lui ușoară echilibrează sosul dulce și sărat.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'green-tea',
        },
        {
          kind: 'drink',
          label: t('Beer', 'Bere'),
          reason: t(
            'A cold, light beer refreshes the palate between bites.',
            'O bere rece și ușoară împrospătează gustul între îmbucături.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A warm, saucy simmer is comforting on a cold day.',
            'O mâncare caldă, cu sos, încălzește plăcut într-o zi rece.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Beef gives protein, and potatoes and rice bring carbohydrates.',
            'Vita dă proteine, iar cartofii și orezul aduc carbohidrați.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A big, salty bowl just before bed can sit heavy.',
            'Un castron mare și sărat chiar înainte de culcare poate cădea greu.',
          ),
        },
      ],
    },
  ],
};
