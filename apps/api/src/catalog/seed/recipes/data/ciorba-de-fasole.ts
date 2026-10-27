import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Ciorbă de fasole base is the Romanian soured bean soup with smoked pork:
// soaked white beans, root vegetables and tomato paste, soured with borș and
// finished with tarragon and lovage. Each Variant is a full Recipe with its own
// lines, steps and guidance; the base's Recipe-level Tips are inherited unless
// hidden.
export const ciorbaDeFasole: BaseRecipeSeed = {
  slug: 'ciorba-de-fasole',
  title: t(
    'Romanian bean soup with smoked pork (ciorbă de fasole cu afumătură)',
    'Ciorbă de fasole cu afumătură',
  ),
  servings: 6,
  prepMinutes: 625,
  cookMinutes: 170,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'white-beans',
      quantity: 500,
      unit: 'g',
      note: t(
        'dried, soaked overnight',
        'uscată, lăsată la înmuiat peste noapte',
      ),
    },
    {
      ingredient: 'smoked-pork',
      quantity: 600,
      unit: 'g',
      note: t(
        'smoked hock, ribs or belly, on the bone',
        'ciolan, coaste sau costiță, afumate, cu os',
      ),
    },
    {
      ingredient: 'still-water',
      quantity: 7,
      unit: 'l',
      note: t(
        '2.5 l for soaking, 2 l for the first boil, 2.5 l hot for the soup',
        '2,5 l pentru înmuiat, 2 l pentru prima fierbere, 2,5 l fierbinți pentru ciorbă',
      ),
    },
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
      note: t('diced small', 'tăiați cubulețe'),
    },
    {
      ingredient: 'celeriac',
      quantity: 100,
      unit: 'g',
      note: t('peeled, diced small', 'curățată, tăiată cubulețe'),
    },
    {
      ingredient: 'parsley-root',
      quantity: 80,
      unit: 'g',
      optional: true,
      note: t('diced small', 'tăiată cubulețe'),
    },
    {
      ingredient: 'bell-pepper',
      quantity: 1,
      unit: 'pcs',
      note: t('seeded, diced', 'curățat de semințe, tăiat cubulețe'),
    },
    { ingredient: 'sunflower-oil', quantity: 60, unit: 'ml' },
    { ingredient: 'tomato-paste', quantity: 50, unit: 'g' },
    {
      ingredient: 'bay-leaves',
      quantity: 0.6,
      unit: 'g',
      note: t('about 3 leaves', 'cam 3 foi'),
    },
    {
      ingredient: 'savory',
      quantity: 2,
      unit: 'g',
      optional: true,
      note: t('dried (cimbru)', 'uscat (cimbru)'),
    },
    {
      ingredient: 'ciorba-sour-base',
      quantity: 400,
      unit: 'ml',
      note: t(
        'plus up to 100 ml more, to taste',
        'și încă până la 100 ml, după gust',
      ),
    },
    {
      ingredient: 'tarragon',
      quantity: 15,
      unit: 'g',
      note: t('fresh, chopped', 'proaspăt, tocat'),
    },
    {
      ingredient: 'lovage',
      quantity: 20,
      unit: 'g',
      optional: true,
      note: t('fresh, chopped', 'proaspăt, tocat'),
    },
    {
      ingredient: 'salt',
      quantity: 12,
      unit: 'g',
      note: t('adjust at the end', 'se potrivește la final'),
    },
    { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
  ],
  steps: [
    {
      key: 'soak',
      text: t(
        'Pick over the beans, rinse them and put them in a large bowl with 2.5 l cold water. Leave them in the fridge or a cool place for 10 hours, or overnight, until they have swollen to about double their size.',
        'Alege fasolea, spal-o și pune-o într-un castron mare cu 2,5 l de apă rece. Lasă-o la frigider sau într-un loc răcoros 10 ore, sau peste noapte, până se umflă și ajunge de aproape două ori mai mare.',
      ),
      timerSeconds: 36000,
    },
    {
      key: 'first-boil',
      text: t(
        'Drain the beans and rinse them. Put them in a 6 l pot with 2 l fresh cold water and bring to the boil over high heat. Boil hard, uncovered, for 10 minutes, skimming the foam.',
        'Scurge fasolea și clătește-o. Pune-o într-o oală de 6 l cu 2 l de apă proaspătă, rece, și adu la fierbere la foc mare. Fierbe tare, fără capac, 10 minute, luând spuma.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'drain',
      text: t(
        'Drain the beans in a colander and throw this water away. Rinse the pot.',
        'Scurge fasolea la strecurătoare și aruncă această apă. Spală oala.',
      ),
    },
    {
      key: 'simmer',
      text: t(
        'Put the beans back in the pot with the smoked pork, the bay leaves and 2.5 l hot water. Bring to the boil, then lower the heat to a gentle simmer, cover partly and cook for 1 hour, skimming now and then.',
        'Pune fasolea înapoi în oală, împreună cu afumătura, foile de dafin și 2,5 l de apă fierbinte. Adu la fierbere, apoi scade focul la un clocot domol, acoperă pe jumătate și fierbe 1 oră, luând spuma din când în când.',
      ),
      timerSeconds: 3600,
    },
    {
      key: 'veg',
      text: t(
        'Meanwhile, or as the hour runs out, heat the oil in a wide, deep 28 to 30 cm pan over medium heat. Add the onions, carrot, celeriac, parsley root and bell pepper and cook for 8 minutes, stirring, until the onion is translucent and the vegetables have softened slightly.',
        'Între timp, sau spre sfârșitul orei, încinge uleiul într-o tigaie lată și adâncă, de 28-30 cm, la foc mediu. Adaugă ceapa, morcovii, țelina, rădăcina de pătrunjel și ardeiul și călește 8 minute, amestecând, până ceapa devine translucidă, iar legumele se înmoaie ușor.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'paste',
      text: t(
        'Stir in the tomato paste and cook for 1 minute, until it darkens a shade and smells sweet. Add a ladle of the hot soup liquid and stir to loosen anything stuck to the pan.',
        'Adaugă pasta de roșii și amestecă 1 minut, până se închide puțin la culoare și miroase dulceag. Toarnă un polonic de zeamă din oală și desprinde tot ce s-a lipit de fundul tigăii.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'combine',
      text: t(
        'Scrape the vegetables into the pot, add the savory and stir. Cover partly and simmer gently for 30 minutes more. The beans are done when one crushes easily between your thumb and finger and is creamy inside, with no hard centre and the skin still mostly whole.',
        'Pune legumele în oală, adaugă cimbrul și amestecă. Acoperă pe jumătate și fierbe domol încă 30 de minute. Fasolea e gata când o boabă se strivește ușor între degete, e cremoasă în interior și nu mai e tare la mijloc, iar pielița e în mare parte întreagă.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'hock',
      text: t(
        'Check the smoked pork with a fork. Ribs and belly are usually tender by now. A hock often needs longer, so simmer it for 30 minutes more, until the meat comes away from the bone easily. If the meat is already tender, skip this step.',
        'Verifică afumătura cu o furculiță. Coastele și costița sunt de obicei fragede până acum. Ciolanul are adesea nevoie de mai mult timp, așa că mai fierbe-l 30 de minute, până carnea se desprinde ușor de os. Dacă ai carnea deja fragedă, sari peste acest pas.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'meat',
      text: t(
        'Lift the smoked pork and the bay leaves out of the pot; throw the bay leaves away. Put the pork on a board. When it is cool enough to handle, pull the meat off the bones, discard the bones and any hard skin, and cut the meat into small pieces. Return it to the pot.',
        'Scoate din oală afumătura și foile de dafin; aruncă foile de dafin. Pune afumătura pe o tocătoare. Când s-a răcit cât să o poți ține în mână, desprinde carnea de pe oase, aruncă oasele și pielea tare și taie carnea bucățele. Pune-o înapoi în oală.',
      ),
    },
    {
      key: 'sour',
      text: t(
        'Pour in 400 ml of the borș, bring to the boil and cook for 5 minutes. Taste, then stir in up to 100 ml more borș, a little at a time, until the soup is as sour as you like. Add the pepper and salt as needed; the smoked pork and the borș are already salty, so add a little at a time.',
        'Toarnă 400 ml de borș, adu la fierbere și lasă să fiarbă 5 minute. Gustă, apoi adaugă treptat până la 100 ml de borș în plus, până e ciorba atât de acră cât îți place ție. Pune piper și sare după gust; afumătura și borșul sunt deja sărate, așa că adaugă puțin câte puțin.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'finish',
      text: t(
        'Take the pot off the heat and stir in the tarragon and lovage. Let the soup stand for 10 minutes. Serve hot, with raw red onion and pickled or fresh hot peppers on the table.',
        'Ia oala de pe foc și adaugă tarhonul și leușteanul tocate. Lasă ciorba să se odihnească 10 minute. Servește fierbinte, cu ceapă roșie crudă și ardei iuți murați sau proaspeți pe masă.',
      ),
      timerSeconds: 600,
    },
  ],
  tips: [
    t(
      'Never skip the 10-minute hard boil: raw or undercooked kidney-type beans contain a natural toxin that makes you ill. A slow cooker or other low-temperature cooking may never get hot enough to destroy it, so always boil the soaked beans hard first.',
      'Nu sări peste fierberea tare de 10 minute: fasolea crudă sau insuficient fiartă, de tipul fasolei roșii, conține o toxină naturală care îmbolnăvește. Un multicooker sau o oală electrică și gătitul la temperatură joasă pot să nu încălzească destul, așa că fierbe întotdeauna întâi fasolea înmuiată, tare.',
    ),
    t(
      'No borș? Stir in about 60 ml vinegar at the end instead, a little at a time, and taste. Borș strength varies a lot, so go slowly, and do not boil the soup long once the souring is in, or the freshness fades.',
      'Nu ai borș? Adaugă la final aproximativ 60 ml de oțet, treptat, și gustă. Tăria borșului diferă mult, așa că mergi încet și nu fierbe ciorba mult după ce ai acrit-o, altfel prospețimea se pierde.',
    ),
    t(
      'To keep leftovers, cool the pot quickly: pour the soup into shallow containers, refrigerate within 2 hours and eat within 3 days. It thickens in the fridge; loosen it with a little water and reheat until it is steaming hot all the way through.',
      'Ca să păstrezi ce rămâne, răcește repede ciorba: pune-o în vase joase, dă-o la frigider în maximum 2 ore și consumă-o în 3 zile. Se îngroașă la frigider; subțiaz-o cu puțină apă și reîncălzește până dă în clocot.',
    ),
  ],
  stepTips: [
    {
      step: 'soak',
      text: t(
        'Soak in the fridge or a cool room. In a warm kitchen beans start to ferment after about 12 hours, and the water turns foamy and sour.',
        'Înmoaie fasolea la frigider sau într-o cameră răcoroasă. Într-o bucătărie caldă, după vreo 12 ore începe să fermenteze, iar apa face spumă și miroase acru.',
      ),
    },
    {
      step: 'simmer',
      text: t(
        'Keep the simmer gentle; a hard boil splits the skins and turns the beans to mush. If you need to top up, add hot water, not cold, which can leave the beans firm.',
        'Păstrează un clocot domol; fierberea puternică sparge pielițele și face din fasole un terci. Dacă trebuie să completezi cu apă, pune apă fierbinte, nu rece, care poate lăsa fasolea tare.',
      ),
    },
  ],
  nutritionNote: t(
    'Beans bring plenty of fibre and plant protein, and the vegetables add more fibre. The smoked pork and the borș are salty and the pork adds saturated fat, so season only at the end and choose a lean cut. Beans can cause wind if you are not used to them.',
    'Fasolea aduce multe fibre și proteine vegetale, iar legumele adaugă și mai multe fibre. Afumătura și borșul sunt sărate, iar carnea de porc adaugă grăsimi saturate, așa că sărează abia la final și alege o bucată slabă. Fasolea poate provoca balonare dacă nu ești obișnuit cu ea.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Red onion', 'Ceapă roșie'),
      reason: t(
        'Raw and crunchy, it adds a sharp bite against the soft beans and the smoky pork.',
        'Crudă și crocantă, adaugă o notă ascuțită pe lângă fasolea moale și carnea afumată.',
      ),
      principle: 'contrast_texture',
      ingredient: 'red-onion',
    },
    {
      kind: 'food',
      label: t('Pickled peppers', 'Ardei murați'),
      reason: t(
        'Their sharp, salty acidity cuts through the smoky fat of the pork.',
        'Aciditatea lor ascuțită și sărată taie grăsimea afumată a cărnii.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-peppers',
    },
    {
      kind: 'food',
      label: t('Country bread', 'Pâine de casă'),
      reason: t(
        'A crusty slice soaks up the thick broth and gives the soft beans something to bite against.',
        'O felie cu crustă se îmbibă cu zeama groasă și oferă fasolei moi un contrast la mestecat.',
      ),
      principle: 'contrast_texture',
      ingredient: 'country-bread',
    },
    {
      kind: 'food',
      label: t(
        'Papanași (Romanian cheese doughnuts with sour cream and jam)',
        'Papanași prăjiți cu smântână și dulceață',
      ),
      reason: t(
        'A bean ciorbă followed by papanași is a common Romanian restaurant and Sunday menu: the hot, sour soup first, the sweet dessert after.',
        'Ciorba de fasole urmată de papanași e o combinație frecventă în restaurantele și la masa de duminică din România: întâi ciorba fierbinte și acrișoară, apoi desertul dulce.',
      ),
      principle: 'regional_tradition',
      recipe: 'papanasi',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A thick, hot, smoky soup warms you through on a cold day.',
        'O ciorbă groasă, fierbinte și afumată te încălzește într-o zi rece.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Beans give carbohydrates and protein, and the broth brings back fluid and salt.',
        'Fasolea aduce carbohidrați și proteine, iar zeama te ajută să-ți refaci lichidele și sarea.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A big bowl of beans with salty smoked pork sits heavy before bed.',
        'Un castron mare de fasole cu afumătură sărată cade greu înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'ciorba-de-fasole-balkan',
      cuisine: 'balkan',
      title: t(
        'Serbian bean soup with smoked meat (pasulj)',
        'Fasole sârbească cu afumătură (pasulj)',
      ),
      servings: 6,
      prepMinutes: 620,
      cookMinutes: 145,
      difficulty: 'medium',
      hideBaseTips: [1],
      lines: [
        {
          ingredient: 'white-beans',
          quantity: 500,
          unit: 'g',
          note: t(
            'dried, soaked overnight',
            'uscată, lăsată la înmuiat peste noapte',
          ),
        },
        {
          ingredient: 'smoked-pork',
          quantity: 500,
          unit: 'g',
          note: t(
            'smoked ribs or hock, on the bone',
            'coaste sau ciolan afumat, cu os',
          ),
        },
        {
          ingredient: 'smoked-sausages',
          quantity: 250,
          unit: 'g',
          optional: true,
          note: t('sliced thickly', 'tăiați felii groase'),
        },
        {
          ingredient: 'still-water',
          quantity: 6.5,
          unit: 'l',
          note: t(
            '2.5 l for soaking, 2 l for the first boil, 2 l hot for the soup',
            '2,5 l pentru înmuiat, 2 l pentru prima fierbere, 2 l fierbinți pentru ciorbă',
          ),
        },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('chopped', 'tocate'),
        },
        {
          ingredient: 'carrot',
          quantity: 200,
          unit: 'g',
          note: t('diced', 'tăiați cubulețe'),
        },
        {
          ingredient: 'garlic',
          quantity: 12,
          unit: 'g',
          note: t('3 cloves, crushed', '3 căței, striviți'),
        },
        {
          ingredient: 'bay-leaves',
          quantity: 0.6,
          unit: 'g',
          note: t('about 3 leaves', 'cam 3 foi'),
        },
        { ingredient: 'sunflower-oil', quantity: 60, unit: 'ml' },
        { ingredient: 'flour', quantity: 40, unit: 'g' },
        { ingredient: 'paprika', quantity: 15, unit: 'g' },
        {
          ingredient: 'chilli-flakes',
          quantity: 1,
          unit: 'g',
          optional: true,
        },
        {
          ingredient: 'parsley',
          quantity: 20,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'salt',
          quantity: 10,
          unit: 'g',
          note: t('adjust at the end', 'se potrivește la final'),
        },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
      ],
      steps: [
        {
          key: 'soak',
          text: t(
            'Pick over the beans, rinse them and put them in a large bowl with 2.5 l cold water. Leave them in the fridge or a cool place for 10 hours, or overnight, until they have swollen to about double their size.',
            'Alege fasolea, spal-o și pune-o într-un castron mare cu 2,5 l de apă rece. Lasă-o la frigider sau într-un loc răcoros 10 ore, sau peste noapte, până se umflă și ajunge de aproape două ori mai mare.',
          ),
          timerSeconds: 36000,
        },
        {
          key: 'first-boil',
          text: t(
            'Drain the beans and rinse them. Put them in a 6 l pot with 2 l fresh cold water and bring to the boil over high heat. Boil hard, uncovered, for 10 minutes, skimming the foam.',
            'Scurge fasolea și clătește-o. Pune-o într-o oală de 6 l cu 2 l de apă proaspătă, rece, și adu la fierbere la foc mare. Fierbe tare, fără capac, 10 minute, luând spuma.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'drain',
          text: t(
            'Drain the beans in a colander and throw this water away. Rinse the pot.',
            'Scurge fasolea la strecurătoare și aruncă această apă. Spală oala.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Put the beans back in the pot with the smoked pork, onions, carrot, garlic, bay leaves and 2 l hot water. Bring to the boil, then lower the heat to a gentle simmer, cover partly and cook for 70 minutes, skimming now and then, until the beans are tender: one crushes easily between your thumb and finger and is creamy inside.',
            'Pune fasolea înapoi în oală, cu afumătura, ceapa, morcovii, usturoiul, foile de dafin și 2 l de apă fierbinte. Adu la fierbere, apoi scade focul la un clocot domol, acoperă pe jumătate și fierbe 70 de minute, luând spuma din când în când, până fasolea e fragedă: o boabă se strivește ușor între degete și e cremoasă în interior.',
          ),
          timerSeconds: 4200,
        },
        {
          key: 'sausage',
          text: t(
            'Add the sliced smoked sausages and simmer for 15 minutes, until they are hot all the way through. Meanwhile, lift out the smoked pork and the bay leaves (throw the bay leaves away), pull the meat off the bones, discard the bones and hard skin, cut the meat into pieces and return it to the pot.',
            'Adaugă cârnații afumați tăiați felii și fierbe 15 minute, până se încing bine în tot interiorul. Între timp, scoate afumătura și foile de dafin (aruncă foile de dafin), desprinde carnea de pe oase, aruncă oasele și pielea tare, taie carnea bucăți și pune-o înapoi în oală.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'roux',
          text: t(
            'Heat the oil in a small pan over medium heat. Stir in the flour and cook for 1 minute, stirring, until it smells nutty and is pale gold. Take the pan off the heat, stir in the paprika (and the chilli flakes, if using) for 10 seconds, then whisk in a ladle of the hot liquid from the pot until smooth. The paprika burns fast and turns bitter.',
            'Încinge uleiul într-o tigaie mică, la foc mediu. Adaugă făina și amestecă 1 minut, până miroase a nucă și capătă o culoare aurie, pală. Ia tigaia de pe foc, adaugă boiaua (și fulgii de ardei iute, dacă folosești) și amestecă 10 secunde, apoi bate cu un polonic de zeamă fierbinte din oală până se omogenizează. Boiaua se arde repede și se amărăște.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'thicken',
          text: t(
            'Stir the roux into the pot. Simmer gently for 15 minutes, stirring often, until the soup is thick and red. Season with the pepper and salt, a little at a time, as the smoked meat is already salty.',
            'Adaugă prăjeala în oală. Fierbe domol 15 minute, amestecând des, până ciorba se îngroașă și capătă o culoare roșie. Pune piperul și sare, treptat, pentru că afumătura e deja sărată.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'finish',
          text: t(
            'Take the pot off the heat, stir in the parsley and let the soup stand for 10 minutes. Serve hot.',
            'Ia oala de pe foc, adaugă pătrunjelul și lasă ciorba să se odihnească 10 minute. Servește fierbinte.',
          ),
          timerSeconds: 600,
        },
      ],
      tips: [
        t(
          'Pasulj is even better the next day: let it stand for an hour off the heat, or reheat it the day after, and the flavours deepen.',
          'Pasulj iese și mai bun a doua zi: lasă-l o oră de-o parte, sau reîncălzește-l a doua zi, și gustul se adâncește.',
        ),
      ],
      stepTips: [
        {
          step: 'thicken',
          text: t(
            'It thickens more as it cools. If it gets too thick the next day, loosen it with a little hot water.',
            'Se îngroașă și mai mult pe măsură ce se răcește. Dacă a doua zi e prea groasă, subțiaz-o cu puțină apă fierbinte.',
          ),
        },
      ],
      nutritionNote: t(
        'Beans give fibre and plant protein, and the carrot and onion add vegetables. The smoked meat and sausage bring salt and saturated fat, and the roux adds oil and calories, so choose lean smoked pork, skip the sausage if you like and season at the end.',
        'Fasolea aduce fibre și proteine vegetale, iar morcovii și ceapa adaugă legume. Afumătura și cârnații aduc sare și grăsimi saturate, iar prăjeala adaugă ulei și calorii, așa că alege carne afumată slabă, renunță la cârnați dacă vrei și sărează la final.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Country bread', 'Pâine de casă'),
          reason: t(
            'A crusty slice mops up the thick, red broth.',
            'O felie cu crustă șterge farfuria de zeama groasă și roșie.',
          ),
          principle: 'contrast_texture',
          ingredient: 'country-bread',
        },
        {
          kind: 'food',
          label: t('Red onion', 'Ceapă roșie'),
          reason: t(
            'Raw onion adds a sharp crunch against the soft beans and smoky meat.',
            'Ceapa crudă adaugă un crocant ascuțit pe lângă fasolea moale și carnea afumată.',
          ),
          principle: 'contrast_texture',
          ingredient: 'red-onion',
        },
        {
          kind: 'food',
          label: t('Pickled peppers', 'Ardei murați'),
          reason: t(
            'Their sharp acidity cuts through the paprika roux and the smoked fat.',
            'Aciditatea lor ascuțită taie prăjeala cu boia și grăsimea afumată.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-peppers',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A thick, hot, paprika-red stew-soup warms you through.',
            'O ciorbă groasă, fierbinte și roșie de la boia te încălzește bine.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Beans and meat give carbohydrates and protein in one bowl.',
            'Fasolea și carnea aduc carbohidrați și proteine într-un singur castron.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A heavy, salty, thick bowl sits badly just before bed.',
            'Un castron greu, sărat și gros cade prost chiar înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'ciorba-de-fasole-italian',
      cuisine: 'italian',
      title: t(
        'Pasta e fagioli (Italian bean and pasta soup)',
        'Pasta e fagioli (supă italiană de fasole cu paste)',
      ),
      servings: 4,
      prepMinutes: 615,
      cookMinutes: 130,
      difficulty: 'easy',
      hideBaseTips: [1],
      lines: [
        {
          ingredient: 'borlotti-beans',
          quantity: 250,
          unit: 'g',
          note: t(
            'dried, soaked overnight',
            'uscată, lăsată la înmuiat peste noapte',
          ),
        },
        {
          ingredient: 'ditalini',
          quantity: 120,
          unit: 'g',
        },
        {
          ingredient: 'still-water',
          quantity: 3.75,
          unit: 'l',
          note: t(
            '1.5 l for soaking, 1 l for the first boil, 1 l hot for the soup, up to 250 ml more to loosen',
            '1,5 l pentru înmuiat, 1 l pentru prima fierbere, 1 l fierbinte pentru supă, până la 250 ml în plus pentru subțiat',
          ),
        },
        {
          ingredient: 'olive-oil',
          key: 'olive-oil-soffritto',
          quantity: 45,
          unit: 'ml',
          note: t('for the soffritto', 'pentru soffritto'),
        },
        {
          ingredient: 'pancetta',
          quantity: 80,
          unit: 'g',
          optional: true,
          note: t('diced', 'tăiată cubulețe'),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely diced', 'tăiată mărunt'),
        },
        {
          ingredient: 'carrot',
          quantity: 100,
          unit: 'g',
          note: t('finely diced', 'tăiați mărunt'),
        },
        {
          ingredient: 'celery',
          quantity: 100,
          unit: 'g',
          note: t('finely diced', 'tăiată mărunt'),
        },
        {
          ingredient: 'garlic',
          quantity: 8,
          unit: 'g',
          note: t('2 cloves, sliced', '2 căței, tăiați felii'),
        },
        {
          ingredient: 'rosemary',
          quantity: 3,
          unit: 'g',
          note: t('1 sprig', '1 creangă'),
        },
        {
          ingredient: 'canned-tomatoes',
          quantity: 200,
          unit: 'g',
          note: t('chopped', 'tocate'),
        },
        {
          ingredient: 'parmesan',
          key: 'parmesan-rind',
          quantity: 40,
          unit: 'g',
          note: t('the rind, scrubbed', 'coaja, curățată bine'),
        },
        {
          ingredient: 'salt',
          quantity: 8,
          unit: 'g',
          note: t('adjust at the end', 'se potrivește la final'),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        {
          ingredient: 'parmesan',
          key: 'parmesan-serve',
          quantity: 30,
          unit: 'g',
          note: t('grated, to serve', 'ras, pentru servit'),
        },
        {
          ingredient: 'olive-oil',
          key: 'olive-oil-finish',
          quantity: 20,
          unit: 'ml',
          note: t('to finish', 'pentru final'),
        },
      ],
      steps: [
        {
          key: 'soak',
          text: t(
            'Pick over the beans, rinse them and put them in a bowl with 1.5 l cold water. Leave them in the fridge or a cool place for 10 hours, or overnight, until they have swollen to about double their size.',
            'Alege fasolea, spal-o și pune-o într-un castron cu 1,5 l de apă rece. Lasă-o la frigider sau într-un loc răcoros 10 ore, sau peste noapte, până se umflă și ajunge de aproape două ori mai mare.',
          ),
          timerSeconds: 36000,
        },
        {
          key: 'first-boil',
          text: t(
            'Drain the beans and rinse them. Put them in a pot with 1 l fresh cold water and bring to the boil over high heat. Boil hard, uncovered, for 10 minutes, skimming the foam.',
            'Scurge fasolea și clătește-o. Pune-o într-o oală cu 1 l de apă proaspătă, rece, și adu la fierbere la foc mare. Fierbe tare, fără capac, 10 minute, luând spuma.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'drain',
          text: t(
            'Drain the beans in a colander and throw this water away. Rinse the pot.',
            'Scurge fasolea la strecurătoare și aruncă această apă. Spală oala.',
          ),
        },
        {
          key: 'pancetta',
          text: t(
            'Heat the 45 ml olive oil in the pot over medium heat. Add the pancetta, if using, and cook for 4 minutes, until the fat runs and it turns lightly golden.',
            'Încinge cei 45 ml de ulei de măsline în oală, la foc mediu. Adaugă pancetta, dacă folosești, și călește 4 minute, până se topește grăsimea și capătă o culoare aurie ușoară.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'soffritto',
          text: t(
            'Add the onion, carrot and celery and cook gently for 10 minutes, stirring, until soft and sweet but not browned.',
            'Adaugă ceapa, morcovul și țelina și călește domol 10 minute, amestecând, până se înmoaie și devin dulci, fără să se rumenească.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'aromatics',
          text: t(
            'Stir in the garlic and rosemary and cook for 1 minute, until fragrant. Add the tomatoes and cook for 5 minutes, until they lose their raw smell and thicken a little.',
            'Adaugă usturoiul și rozmarinul și amestecă 1 minut, până miros frumos. Pune roșiile și fierbe 5 minute, până pierd mirosul de crud și se îngroașă puțin.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'simmer',
          text: t(
            'Add the drained beans, the Parmesan rind and 1 l hot water. Bring to the boil, then lower the heat to a gentle simmer, cover partly and cook for 1 hour. The beans are done when one crushes easily between your thumb and finger and is creamy inside, with no hard centre.',
            'Adaugă fasolea scursă, coaja de parmezan și 1 l de apă fierbinte. Adu la fierbere, apoi scade focul la un clocot domol, acoperă pe jumătate și fierbe 1 oră. Fasolea e gata când o boabă se strivește ușor între degete și e cremoasă în interior și nu mai e tare la mijloc.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'mash',
          text: t(
            'Take out the rosemary sprig. Scoop about a third of the beans, with a little liquid, into a bowl and mash them with a fork. Stir the mash back into the soup, so it turns thick and creamy.',
            'Scoate creanga de rozmarin. Ia aproximativ o treime din fasole, cu puțină zeamă, într-un bol și zdrobește-o cu furculița. Pune piureul înapoi în supă, ca să se îngroașe și să devină cremoasă.',
          ),
        },
        {
          key: 'pasta',
          text: t(
            'Bring the soup to a steady boil, add the ditalini and the salt and cook for 9 minutes, stirring often so the pasta does not stick, until tender with a little bite. If the soup gets too thick, add up to 250 ml hot water.',
            'Adu supa la fiert puternic, adaugă ditalini și sarea și fierbe 9 minute, amestecând des ca pastele să nu se lipească, până se înmoaie, dar mai păstrează puțină fermitate. Dacă supa se îngroașă prea tare, adaugă până la 250 ml de apă fierbinte.',
          ),
          timerSeconds: 540,
        },
        {
          key: 'rest',
          text: t(
            'Take the pot off the heat, remove the Parmesan rind and leave the soup to stand for 5 minutes. It should be thick enough to hold a spoon upright. Serve with the grated Parmesan, the pepper and a thread of olive oil.',
            'Ia oala de pe foc, scoate coaja de parmezan și lasă supa să se odihnească 5 minute. Trebuie să fie destul de groasă cât să țină lingura în picioare. Servește cu parmezan ras, piper și un fir de ulei de măsline.',
          ),
          timerSeconds: 300,
        },
      ],
      tips: [
        t(
          'The soup thickens as the pasta soaks up the liquid. Make only as much as you will eat, or cook the pasta separately and add it to each bowl, because leftover pasta turns soft.',
          'Supa se îngroașă pe măsură ce pastele absorb zeama. Fă doar cât mănânci sau fierbe pastele separat și pune-le în fiecare castron, pentru că pastele rămase se înmoaie prea tare.',
        ),
      ],
      stepTips: [
        {
          step: 'mash',
          text: t(
            'Mashing part of the beans thickens the soup without any cream or flour.',
            'Zdrobirea unei părți din fasole îngroașă supa fără smântână sau făină.',
          ),
        },
      ],
      nutritionNote: t(
        'Beans give fibre and plant protein, and the pasta adds filling carbohydrates. The pancetta and Parmesan bring salt and saturated fat, and the olive oil adds calories, so leave the pancetta out for a lighter bowl and measure the oil and cheese.',
        'Fasolea aduce fibre și proteine vegetale, iar pastele adaugă carbohidrați care sațiază. Pancetta și parmezanul aduc sare și grăsimi saturate, iar uleiul de măsline adaugă calorii, așa că renunță la pancetta pentru un castron mai ușor și măsoară uleiul și brânza.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Country bread', 'Pâine de casă'),
          reason: t(
            'A crusty slice soaks up the thick broth and adds crunch to the soft beans and pasta.',
            'O felie cu crustă se îmbibă cu zeama groasă și adaugă crocant pe lângă fasolea și pastele moi.',
          ),
          principle: 'contrast_texture',
          ingredient: 'country-bread',
        },
        {
          kind: 'food',
          label: t('Chilli flakes', 'Fulgi de chili'),
          reason: t(
            'A pinch of heat lifts the mild beans and the creamy, starchy broth.',
            'Un praf de iuțeală trezește gustul blând al fasolei și al zemii cremoase, cu amidon.',
          ),
          principle: 'complement_flavour',
          ingredient: 'chilli-flakes',
        },
        {
          kind: 'drink',
          label: t('Red wine', 'Vin roșu'),
          reason: t(
            'A light, dry red goes with the tomato and rosemary, and its acidity refreshes the palate between spoonfuls.',
            'Un vin roșu sec, ușor, se potrivește cu roșiile și rozmarinul, iar aciditatea lui împrospătează gustul între linguri.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'red-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A thick, hot bean and pasta soup is warming comfort food.',
            'O supă groasă și fierbinte, cu fasole și paste, te încălzește și te alină.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Pasta gives carbohydrates and beans give protein to refuel after exercise.',
            'Pastele dau carbohidrați, iar fasolea proteine, ca să te refaci după efort.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Beans and a large bowl of pasta soup can sit heavy before bed.',
            'Fasolea și un castron mare de supă cu paste pot cădea greu înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
