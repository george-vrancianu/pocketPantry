import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Baked potatoes base is a jacket potato: a large floury potato baked in
// its skin and topped with butter and cheddar. Each Variant is a full Recipe
// with its own lines, steps and guidance; the base's Recipe-level Tips are
// inherited.
export const bakedPotatoes: BaseRecipeSeed = {
  slug: 'baked-potatoes',
  title: t(
    'Jacket potatoes with butter and cheddar',
    'Cartofi copți în coajă cu unt și cheddar',
  ),
  servings: 4,
  cookMinutes: 90,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'potato',
      quantity: 1.1,
      unit: 'kg',
      note: t(
        'floury baking potatoes, 4 large (250 to 300 g each)',
        'cartofi făinoși pentru copt, 4 mari (250-300 g bucata)',
      ),
    },
    { ingredient: 'sunflower-oil', quantity: 15, unit: 'ml' },
    { ingredient: 'salt', quantity: 5, unit: 'g' },
    { ingredient: 'butter', quantity: 60, unit: 'g' },
    {
      ingredient: 'cheddar',
      quantity: 120,
      unit: 'g',
      note: t('coarsely grated', 'dat pe răzătoarea mare'),
    },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
    {
      ingredient: 'baked-beans',
      quantity: 400,
      unit: 'g',
      optional: true,
      note: t('to warm and spoon over', 'de încălzit și pus deasupra'),
    },
  ],
  steps: [
    {
      key: 'preheat',
      text: t(
        'Set the oven to 200 °C (conventional, not fan) and put a rack in the middle with a tray on the shelf below. Heating takes about 15 minutes; do the next two steps while it heats.',
        'Pune cuptorul la 200 °C (încălzire sus-jos, fără ventilator) și așază un grătar la mijloc, cu o tavă pe raftul de dedesubt. Se încălzește în aproximativ 15 minute; fă următorii doi pași cât timp se încălzește.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'scrub',
      text: t(
        'Scrub the potatoes under cold water, cut out any green or damaged spots, then dry them completely with a clean towel. Prick each one 4 or 5 times with a fork.',
        'Spală cartofii bine cu o perie sub apă rece, taie petele verzi sau lovite, apoi șterge-i complet cu un prosop curat. Înțeapă fiecare cartof de 4-5 ori cu furculița.',
      ),
    },
    {
      key: 'rub',
      text: t(
        'Rub the oil over each potato, then the salt, until the skins are lightly glossy and speckled with salt.',
        'Unge fiecare cartof cu ulei, apoi cu sare, până când coaja devine ușor lucioasă și presărată cu sare.',
      ),
    },
    {
      key: 'bake',
      text: t(
        'Put the potatoes straight on the oven rack, with no foil. Bake for 1 hour 5 minutes, until the skin is dry and crisp and the potatoes feel soft when squeezed with an oven glove.',
        'Pune cartofii direct pe grătarul cuptorului, fără folie. Coace 1 oră și 5 minute, până când coaja e uscată și crocantă, iar cartofii cedează când îi strângi ușor cu o mănușă de bucătărie.',
      ),
      timerSeconds: 3900,
    },
    {
      key: 'check',
      text: t(
        'Push a thin skewer into the centre of the largest potato. It should slide in with no resistance (about 99 °C inside on a probe thermometer). If it meets a firm core, return them to the oven and test again.',
        'Înfige un bețișor subțire de frigărui în centrul celui mai mare cartof. Trebuie să intre fără nicio rezistență (aproximativ 99 °C în interior, la un termometru cu sondă). Dacă simți un miez tare, pune-i înapoi în cuptor și verifică din nou.',
      ),
    },
    {
      key: 'beans',
      text: t(
        'If using the beans, warm them in a small pan over medium-low heat for 5 minutes, stirring now and then, until bubbling at the edges. Meanwhile turn off the oven and leave the potatoes inside to stay hot.',
        'Dacă folosești fasolea, încălzește-o într-o cratiță mică la foc mic-mediu 5 minute, amestecând din când în când, până fierbe pe margini. Între timp oprește cuptorul și lasă cartofii înăuntru, să rămână calzi.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'split',
      text: t(
        'Cut a deep cross in the top of each potato, then squeeze the ends towards the middle so the flesh bursts up. Fluff it with a fork.',
        'Taie o cruce adâncă în vârful fiecărui cartof, apoi strânge capetele spre mijloc, ca miezul să iasă la suprafață. Afânează-l cu furculița.',
      ),
    },
    {
      key: 'top',
      text: t(
        'Divide the butter between the potatoes and let it melt into the flesh. Scatter over the cheddar and pepper, and spoon the warm beans over if using. Serve at once.',
        'Împarte untul între cartofi și lasă-l să se topească în miez. Presară cheddarul și piperul și, dacă folosești fasolea, pune-o caldă deasupra. Servește imediat.',
      ),
    },
    {
      key: 'store',
      text: t(
        'Put any leftover potatoes on a plate to cool, uncovered and not wrapped, and refrigerate them within 2 hours of leaving the oven; throw away any left out longer. Eat within 3 to 4 days and reheat until steaming hot all the way through.',
        'Pune cartofii rămași pe o farfurie la răcit, descoperiți și neînveliți, și bagă-i la frigider în cel mult 2 ore de la scoaterea din cuptor; aruncă ce a rămas afară mai mult. Consumă-i în 3-4 zile și încălzește-i până se încing complet, pe toată grosimea.',
      ),
    },
  ],
  tips: [
    t(
      'Keep baked potatoes out of foil. Never leave them sitting in foil at room temperature: the sealed, low-oxygen wrap lets botulism spores that survive baking make toxin. Unwrap them and serve at once, or chill them.',
      'Ține cartofii copți departe de folie. Nu-i lăsa niciodată în folie la temperatura camerei: învelișul etanș, fără oxigen, lasă sporii de botulism care au supraviețuit coacerii să producă toxină. Desfă-i și servește-i imediat, sau pune-i la rece.',
    ),
    t(
      'Choose floury baking potatoes (such as Maris Piper or russet-type); waxy ones stay dense and do not fluff.',
      'Alege cartofi făinoși, potriviți pentru copt; cei cu pulpă fermă rămân compacți și nu se fărâmițează.',
    ),
  ],
  stepTips: [
    {
      step: 'bake',
      text: t(
        'Size matters more than the clock: if your potatoes are smaller, start testing after 50 minutes.',
        'Mărimea contează mai mult decât timpul: dacă cartofii sunt mai mici, începe verificarea după 50 de minute.',
      ),
    },
    {
      step: 'scrub',
      text: t(
        'Dry the skins well: damp skin steams in the oven instead of crisping.',
        'Șterge bine coaja: cea umedă se aburește în cuptor în loc să devină crocantă.',
      ),
    },
    {
      step: 'check',
      text: t(
        'A firm core usually needs about 10 more minutes.',
        'Un miez tare mai cere de obicei aproximativ 10 minute.',
      ),
    },
  ],
  nutritionNote: t(
    'A filling, starchy staple; eating the skin adds fibre. The butter and cheddar bring saturated fat and salt, and baked beans add more salt and sugar, so go light on them or add a green salad for freshness.',
    'O bază consistentă, bogată în amidon; coaja mâncată aduce fibre. Untul și cheddarul aduc grăsimi saturate și sare, iar fasolea în sos adaugă încă sare și zahăr, așa că pune puțin din ele sau adaugă o salată verde pentru prospețime.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Coleslaw', 'Coleslaw (salată de varză și morcov cu maioneză)'),
      reason: t(
        'The cool, crunchy cabbage contrasts with the soft, buttery flesh, a common jacket-potato side.',
        'Varza rece și crocantă contrastează cu miezul moale și untos, o garnitură frecventă pentru cartofii copți.',
      ),
      principle: 'contrast_texture',
      recipe: 'coleslaw',
    },
    {
      kind: 'food',
      label: t('Chili con carne', 'Chili con carne'),
      reason: t(
        'Spooned into a split potato it makes a hearty meal; with the butter and cheese of the potato, leave out the rice and extra toppings.',
        'Pus într-un cartof tăiat, face o masă consistentă; cu untul și brânza de pe cartof, renunță la orez și la alte adaosuri.',
      ),
      principle: 'complement_flavour',
      recipe: 'chili-con-carne',
    },
    {
      kind: 'food',
      label: t('Crisp lettuce', 'Salată verde crocantă'),
      reason: t(
        'Cool, crisp leaves contrast with the hot, rich potato.',
        'Frunzele reci și crocante contrastează cu cartoful fierbinte și bogat.',
      ),
      principle: 'contrast_texture',
      ingredient: 'lettuce',
    },
    {
      kind: 'food',
      label: t('Cherry tomatoes', 'Roșii cherry'),
      reason: t(
        'Their juicy acidity lifts the richness of the cheddar.',
        'Aciditatea lor zemoasă înviorează bogăția cheddarului.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'cherry-tomato',
    },
    {
      kind: 'drink',
      label: t('Beer', 'Bere'),
      reason: t(
        'The carbonation and light bitterness refresh the palate between rich bites.',
        'Bulele și amăreala ușoară împrospătează gustul între îmbucături bogate.',
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
        'A hot, filling meal straight from the oven.',
        'O masă caldă și săturătoare, direct din cuptor.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Starchy carbohydrate refills energy; add beans or chili for protein.',
        'Carbohidrații din amidon refac energia; adaugă fasole sau chili pentru proteine.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'An hour of oven heat and a heavy plate suit a cooler day.',
        'O oră de cuptor încins și o farfurie grea se potrivesc mai bine într-o zi răcoroasă.',
      ),
    },
  ],
  variants: [
    {
      slug: 'baked-potatoes-american',
      cuisine: 'american',
      title: t(
        'Twice-baked potatoes (with bacon, cheddar and sour cream)',
        'Cartofi copți de două ori (umpluți cu bacon, cheddar și smântână)',
      ),
      servings: 4,
      cookMinutes: 125,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'potato',
          quantity: 1.1,
          unit: 'kg',
          note: t(
            'floury baking potatoes, 4 large (250 to 300 g each)',
            'cartofi făinoși pentru copt, 4 mari (250-300 g bucata)',
          ),
        },
        { ingredient: 'sunflower-oil', quantity: 15, unit: 'ml' },
        {
          ingredient: 'salt',
          key: 'salt-skins',
          quantity: 2,
          unit: 'g',
          note: t('for the skins', 'pentru coajă'),
        },
        {
          ingredient: 'salt',
          key: 'salt-filling',
          quantity: 3,
          unit: 'g',
          note: t(
            'for the filling, plus more to taste',
            'pentru umplutură, plus după gust',
          ),
        },
        { ingredient: 'butter', quantity: 50, unit: 'g' },
        { ingredient: 'sour-cream', quantity: 100, unit: 'g' },
        {
          ingredient: 'cheddar',
          quantity: 150,
          unit: 'g',
          note: t(
            'coarsely grated, 100 g for the filling and 50 g for the top',
            'dat pe răzătoarea mare, 100 g pentru umplutură și 50 g deasupra',
          ),
        },
        {
          ingredient: 'bacon',
          quantity: 150,
          unit: 'g',
          note: t('diced', 'tăiat cubulețe'),
        },
        {
          ingredient: 'chives',
          quantity: 15,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        {
          ingredient: 'milk',
          quantity: 0.05,
          unit: 'l',
          optional: true,
          note: t(
            'to loosen the filling if stiff',
            'pentru a înmuia umplutura, dacă e prea tare',
          ),
        },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Set the oven to 200 °C (conventional, not fan) and put a rack in the middle with a tray on the shelf below. Heating takes about 15 minutes; do the next two steps while it heats.',
            'Pune cuptorul la 200 °C (încălzire sus-jos, fără ventilator) și așază un grătar la mijloc, cu o tavă pe raftul de dedesubt. Se încălzește în aproximativ 15 minute; fă următorii doi pași cât timp se încălzește.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'scrub',
          text: t(
            'Scrub the potatoes under cold water, cut out any green or damaged spots, then dry them completely. Prick each one 4 or 5 times with a fork.',
            'Spală cartofii bine cu o perie sub apă rece, taie petele verzi sau lovite, apoi șterge-i complet. Înțeapă fiecare cartof de 4-5 ori cu furculița.',
          ),
        },
        {
          key: 'rub',
          text: t(
            'Rub the oil over each potato, then the 2 g of salt meant for the skins.',
            'Unge fiecare cartof cu ulei, apoi cu cei 2 g de sare pentru coajă.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Put the potatoes straight on the oven rack, with no foil. Bake for 1 hour 5 minutes, until the skin is dry and crisp.',
            'Pune cartofii direct pe grătarul cuptorului, fără folie. Coace 1 oră și 5 minute, până când coaja e uscată și crocantă.',
          ),
          timerSeconds: 3900,
        },
        {
          key: 'check',
          text: t(
            'Push a thin skewer into the centre of the largest potato. It should slide in with no resistance (about 99 °C inside). If it meets a firm core, return them to the oven and test again. Leave the oven on.',
            'Înfige un bețișor subțire de frigărui în centrul celui mai mare cartof. Trebuie să intre fără nicio rezistență (aproximativ 99 °C în interior). Dacă simți un miez tare, pune-i înapoi în cuptor și verifică din nou. Lasă cuptorul pornit.',
          ),
        },
        {
          key: 'cool',
          text: t(
            'Take the potatoes out and let them cool for 10 minutes, until you can hold them in a folded towel.',
            'Scoate cartofii și lasă-i să se răcească 10 minute, până îi poți ține într-un prosop împăturit.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'bacon',
          text: t(
            'While the potatoes cool, fry the bacon in a dry pan over medium heat for 8 minutes, stirring now and then, until browned and crisp. Lift it onto kitchen paper, then wash your hands, the board and the knife with hot soapy water.',
            'Cât timp se răcesc cartofii, prăjește baconul într-o tigaie uscată, la foc mediu, 8 minute, amestecând din când în când, până se rumenește și devine crocant. Scoate-l pe hârtie de bucătărie, apoi spală-ți mâinile, tocătorul și cuțitul cu apă caldă și detergent.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'scoop',
          text: t(
            'Halve each potato lengthways. Scoop the flesh into a bowl, leaving a shell about 5 mm thick so the skins hold their shape.',
            'Taie fiecare cartof în două pe lungime. Scoate miezul într-un bol, lăsând o coajă groasă de aproximativ 5 mm, ca să-și păstreze forma.',
          ),
        },
        {
          key: 'mash',
          text: t(
            'Mash the flesh with the butter, sour cream, 100 g of the cheddar, the bacon, the chives, the 3 g of salt and the pepper. Add the milk a spoonful at a time if it feels stiff, and taste for salt.',
            'Pisează miezul cu untul, smântâna, 100 g din cheddar, baconul, arpagicul, cei 3 g de sare și piperul. Dacă e prea tare, adaugă laptele câte o lingură și gustă de sare.',
          ),
        },
        {
          key: 'fill',
          text: t(
            'Set the skins on a baking tray. Pile the filling back into them, then scatter the remaining 50 g of cheddar over the tops.',
            'Așază cojile pe o tavă de copt. Pune umplutura înapoi în ele, apoi presară deasupra restul de 50 g de cheddar.',
          ),
        },
        {
          key: 'bake-again',
          text: t(
            'Bake at 200 °C for about 20 minutes, until the tops are golden and the filling is hot all the way through (74 °C in the centre, as for any reheated filling).',
            'Coace la 200 °C aproximativ 20 de minute, până când vârfurile sunt aurii, iar umplutura e fierbinte pe toată grosimea (74 °C în centru, ca la orice umplutură reîncălzită).',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'store',
          text: t(
            'Let any leftover halves cool, cover them, and refrigerate within 2 hours of leaving the oven; throw away any left out longer. Eat within 3 to 4 days and reheat until steaming hot all the way through.',
            'Lasă jumătățile rămase să se răcească, acoperă-le și pune-le la frigider în cel mult 2 ore de la scoaterea din cuptor; aruncă-le pe cele lăsate afară mai mult. Consumă-le în 3-4 zile și încălzește-le până se încing complet, pe toată grosimea.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'scoop',
          text: t(
            'Scoop while the flesh is still warm: it mashes smoothly and does not tear the skins.',
            'Scoate miezul cât e încă cald: se pisează fin și nu rupe cojile.',
          ),
        },
        {
          step: 'bake-again',
          text: t(
            'If the tops brown before the centre is hot, tent the tray loosely with foil, which is fine here because the potatoes go straight to the table.',
            'Dacă vârfurile se rumenesc înainte ca centrul să fie fierbinte, acoperă tava lejer cu folie; aici e în regulă, pentru că merg direct la masă.',
          ),
        },
      ],
      nutritionNote: t(
        'Hearty and filling, with fibre from the skins. Bacon, butter, sour cream and cheddar together bring plenty of saturated fat and salt, so it suits an occasional main or side; a green salad alongside balances it.',
        'Consistent și săturător, cu fibre din coajă. Baconul, untul, smântâna și cheddarul aduc împreună multe grăsimi saturate și multă sare, așa că se potrivește ca fel principal sau garnitură ocazională; o salată verde alături echilibrează masa.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Crisp lettuce', 'Salată verde crocantă'),
          reason: t(
            'Cool, crisp leaves contrast with the hot, rich, creamy filling.',
            'Frunzele reci și crocante contrastează cu umplutura fierbinte, bogată și cremoasă.',
          ),
          principle: 'contrast_texture',
          ingredient: 'lettuce',
        },
        {
          kind: 'food',
          label: t('Pickled cucumbers', 'Castraveți murați'),
          reason: t(
            'Their sharp brine cuts through the creamy, smoky filling.',
            'Zeama lor acrișoară taie din umplutura cremoasă și afumată.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-cucumbers',
        },
        {
          kind: 'drink',
          label: t('Beer', 'Bere'),
          reason: t(
            'The carbonation and light bitterness refresh the palate between rich bites.',
            'Bulele și amăreala ușoară împrospătează gustul între îmbucături bogate.',
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
            'Hot, rich and filling.',
            'Fierbinți, bogați și săturători.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Heavy with fat and salt, a lot to digest just before bed.',
            'Grei, cu multă grăsime și sare, greu de digerat chiar înainte de culcare.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'Two bakes and a heavy filling suit a cooler day.',
            'Două coaceri și o umplutură grea se potrivesc mai bine într-o zi răcoroasă.',
          ),
        },
      ],
    },
    {
      slug: 'baked-potatoes-scandinavian',
      cuisine: 'scandinavian',
      title: t(
        'Hasselback potatoes (Swedish accordion-cut roast potatoes)',
        'Cartofi Hasselback (cartofi suedezi tăiați în acordeon, copți la cuptor)',
      ),
      servings: 4,
      cookMinutes: 75,
      difficulty: 'easy',
      hideBaseTips: [1],
      lines: [
        {
          ingredient: 'potato',
          quantity: 0.8,
          unit: 'kg',
          note: t(
            'medium waxy or all-purpose potatoes, 4 of about 200 g, peeled',
            'cartofi mijlocii cu pulpă fermă sau universali, 4 de aproximativ 200 g, curățați',
          ),
        },
        {
          ingredient: 'butter',
          quantity: 60,
          unit: 'g',
          note: t('melted', 'topit'),
        },
        {
          ingredient: 'sunflower-oil',
          quantity: 15,
          unit: 'ml',
          optional: true,
          note: t('mixed with the butter', 'amestecat cu untul'),
        },
        { ingredient: 'salt', quantity: 5, unit: 'g' },
        { ingredient: 'breadcrumbs', quantity: 30, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g', optional: true },
        {
          ingredient: 'thyme',
          quantity: 3,
          unit: 'g',
          optional: true,
          note: t('leaves picked', 'frunzele desprinse'),
        },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Set the oven to 220 °C (conventional, not fan) and put a rack in the middle. Heating takes about 15 minutes; prepare the potatoes while it heats.',
            'Pune cuptorul la 220 °C (încălzire sus-jos, fără ventilator) și așază un grătar la mijloc. Se încălzește în aproximativ 15 minute; pregătește cartofii cât timp se încălzește.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'peel',
          text: t(
            'Peel the potatoes and trim each one slightly flat on the underside so it sits steady.',
            'Curăță cartofii de coajă și taie-i ușor pe partea de jos, ca să stea stabil.',
          ),
        },
        {
          key: 'slice',
          text: t(
            'Lay a potato between the handles of two wooden spoons. Cut crosswise into slices 2 to 3 mm thick; the spoons stop the knife about 5 mm above the base, so the potato stays joined at the bottom.',
            'Pune un cartof între mânerele a două linguri de lemn. Taie-l transversal în felii groase de 2-3 mm; lingurile opresc cuțitul la aproximativ 5 mm de bază, deci cartoful rămâne întreg în partea de jos.',
          ),
        },
        {
          key: 'rinse',
          text: t(
            'Rinse the cut potatoes briefly under cold water so the slices separate, then dry them thoroughly with a towel, including between the slices.',
            'Clătește scurt cartofii tăiați sub apă rece, ca feliile să se desfacă, apoi șterge-i bine cu un prosop, inclusiv printre felii.',
          ),
        },
        {
          key: 'butter',
          text: t(
            'Melt the butter (with the oil, if using) in a small pan. Set the potatoes in a baking dish, brush them all over with a little of the butter, working it between the slices, and sprinkle with the salt.',
            'Topește untul (împreună cu uleiul, dacă îl folosești) într-o cratiță mică. Așază cartofii într-o tavă, unge-i peste tot cu puțin unt, trecându-l printre felii, și presară sare.',
          ),
        },
        {
          key: 'roast',
          text: t(
            'Roast for 25 minutes, until the edges start to colour and the slices begin to fan out.',
            'Coace 25 de minute, până când marginile încep să se rumenească, iar feliile încep să se desfacă.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'baste',
          text: t(
            'Spoon the melted butter from the dish and the pan over the potatoes, then roast for 15 minutes more.',
            'Toarnă cu lingura untul topit din tavă și din cratiță peste cartofi, apoi mai coace 15 minute.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'crumbs',
          text: t(
            'Scatter the breadcrumbs (and the thyme leaves, if using) over the potatoes, baste again with the remaining butter, and roast for the last 15 minutes, until the crumbs are golden.',
            'Presară pesmetul (și frunzele de cimbrișor, dacă îl folosești) peste cartofi, unge-i din nou cu untul rămas și coace ultimele 15 minute, până când pesmetul devine auriu.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'check',
          text: t(
            'Push a thin skewer into the thickest part of a potato. It should slide through to the base with no resistance (about 99 °C inside). If it does not, return the dish to the oven and test again. Season with pepper and serve hot.',
            'Înfige un bețișor subțire de frigărui în partea cea mai groasă a unui cartof. Trebuie să treacă până la bază fără nicio rezistență (aproximativ 99 °C în interior). Dacă nu, pune tava înapoi în cuptor și verifică din nou. Asezonează cu piper și servește fierbinte.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Refrigerate any leftovers within 2 hours of leaving the oven; throw away any left out longer. Eat within 3 to 4 days and reheat until steaming hot all the way through.',
            'Pune cartofii rămași la frigider în cel mult 2 ore de la scoaterea din cuptor; aruncă ce a rămas afară mai mult. Consumă-i în 3-4 zile și încălzește-i până se încing complet, pe toată grosimea.',
          ),
        },
      ],
      tips: [
        t(
          'Prefer skin-on? Scrub the potatoes well instead of peeling them; the skin crisps nicely and needs no extra time.',
          'Preferi cu coajă? Spală cartofii bine în loc să-i cureți; coaja devine crocantă și nu cere timp în plus.',
        ),
      ],
      stepTips: [
        {
          step: 'slice',
          text: t(
            'No wooden spoons? Lay two chopsticks along the potato instead, and cut down until the knife touches them.',
            'Nu ai linguri de lemn? Pune două bețișoare chinezești pe lângă cartof și taie până când cuțitul le atinge.',
          ),
        },
        {
          step: 'baste',
          text: t(
            'Basting browns and crisps the fanned edges; do not skip it.',
            'Ungerea cu unt topit rumenește și face crocante marginile desfăcute; nu o sări.',
          ),
        },
      ],
      nutritionNote: t(
        'Mostly starch, with a little fibre. The butter adds saturated fat and the breadcrumbs and salt add a fair amount of sodium (about 500 mg per serving), so serve it alongside vegetables rather than as the whole plate.',
        'În mare parte amidon, cu puține fibre. Untul aduce grăsimi saturate, iar pesmetul și sarea adaugă destul sodiu (aproximativ 500 mg pe porție), așa că servește-i alături de legume, nu ca întreaga farfurie.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t(
            'Pan-fried pork chops with garlic and thyme butter',
            'Cotlete de porc la tigaie cu unt, usturoi și cimbrișor',
          ),
          reason: t(
            'Buttery, crisp potatoes are a good partner for juicy pork, and the thyme in the butter echoes the optional thyme here.',
            'Cartofii crocanți și untoși merg bine cu porcul suculent, iar cimbrișorul din unt reia cimbrișorul opțional de aici.',
          ),
          principle: 'complement_flavour',
          recipe: 'pork-chops',
        },
        {
          kind: 'food',
          label: t('Smoked salmon', 'Somon afumat'),
          reason: t(
            'The salty, silky fish contrasts with the crisp potato edges.',
            'Peștele sărat și fin contrastează cu marginile crocante ale cartofilor.',
          ),
          principle: 'contrast_texture',
          ingredient: 'smoked-salmon',
        },
        {
          kind: 'food',
          label: t('Fresh dill', 'Mărar proaspăt'),
          reason: t(
            'Its bright, grassy flavour freshens the buttery potatoes.',
            'Aroma lui proaspătă și ierboasă înviorează cartofii untoși.',
          ),
          principle: 'complement_flavour',
          ingredient: 'dill',
        },
        {
          kind: 'drink',
          label: t('Sparkling water', 'Apă minerală carbogazoasă'),
          reason: t(
            'The bubbles clear the buttery richness between bites.',
            'Bulele curăță gustul bogat de unt între îmbucături.',
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
            'Hot, crisp and buttery.',
            'Fierbinți, crocanți și untoși.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Starchy carbohydrate refills energy; serve with a protein.',
            'Carbohidrații din amidon refac energia; servește-i cu o sursă de proteine.',
          ),
        },
      ],
    },
  ],
};
