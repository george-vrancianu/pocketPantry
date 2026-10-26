import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Ciorbă de perișoare base is the Romanian soured meatball soup: pork and
// rice meatballs and diced vegetables, soured with borș and finished with
// lovage. Each Variant is a full Recipe with its own lines, steps and guidance;
// the base's Recipe-level Tips are inherited unless hidden.
export const ciorbaDePerisoare: BaseRecipeSeed = {
  slug: 'ciorba-de-perisoare',
  title: t(
    'Romanian meatball soup (ciorbă de perișoare)',
    'Ciorbă de perișoare',
  ),
  servings: 8,
  prepMinutes: 45,
  cookMinutes: 55,
  difficulty: 'medium',
  lines: [
    { ingredient: 'minced-pork', quantity: 700, unit: 'g' },
    {
      ingredient: 'round-rice',
      quantity: 80,
      unit: 'g',
      note: t('rinsed and drained', 'spălat și scurs'),
    },
    { ingredient: 'eggs', quantity: 1, unit: 'pcs' },
    {
      ingredient: 'onion',
      key: 'onion-meatballs',
      quantity: 1,
      unit: 'pcs',
      note: t('grated, for the meatballs', 'rasă, pentru perișoare'),
    },
    {
      ingredient: 'onion',
      key: 'onion-soup',
      quantity: 2,
      unit: 'pcs',
      note: t('finely diced, for the soup', 'tăiate mărunt, pentru ciorbă'),
    },
    {
      ingredient: 'carrot',
      quantity: 250,
      unit: 'g',
      note: t('diced small', 'tăiați cubulețe'),
    },
    {
      ingredient: 'parsley-root',
      quantity: 100,
      unit: 'g',
      note: t('diced small', 'tăiată cubulețe'),
    },
    {
      ingredient: 'celeriac',
      quantity: 150,
      unit: 'g',
      note: t('peeled, diced small', 'curățată, tăiată cubulețe'),
    },
    {
      ingredient: 'bell-pepper',
      quantity: 1,
      unit: 'pcs',
      note: t('seeded, diced small', 'fără semințe, tăiat cubulețe'),
    },
    {
      ingredient: 'tomato',
      quantity: 300,
      unit: 'g',
      note: t('ripe, diced', 'coapte, tăiate cubulețe'),
    },
    { ingredient: 'tomato-paste', quantity: 30, unit: 'g' },
    { ingredient: 'sunflower-oil', quantity: 60, unit: 'ml' },
    { ingredient: 'still-water', quantity: 3, unit: 'l' },
    {
      ingredient: 'ciorba-sour-base',
      quantity: 600,
      unit: 'ml',
      note: t('first pour', 'prima turnare'),
    },
    {
      ingredient: 'ciorba-sour-base',
      key: 'sour-base-extra',
      quantity: 150,
      unit: 'ml',
      optional: true,
      note: t('extra, added to taste', 'în plus, adăugat după gust'),
    },
    {
      ingredient: 'parsley',
      quantity: 20,
      unit: 'g',
      note: t(
        'finely chopped, for the meatballs',
        'tocat mărunt, pentru perișoare',
      ),
    },
    {
      ingredient: 'dill',
      quantity: 20,
      unit: 'g',
      note: t('finely chopped, to finish', 'tocat mărunt, la final'),
    },
    {
      ingredient: 'lovage',
      quantity: 40,
      unit: 'g',
      note: t('finely chopped, to finish', 'tocat mărunt, la final'),
    },
    {
      ingredient: 'salt',
      key: 'salt-meatballs',
      quantity: 10,
      unit: 'g',
      note: t('for the meatballs', 'pentru perișoare'),
    },
    {
      ingredient: 'salt',
      key: 'salt-soup',
      quantity: 20,
      unit: 'g',
      note: t(
        'for the pot, adjust at the end',
        'pentru oală, ajustează la final',
      ),
    },
    {
      ingredient: 'black-pepper',
      quantity: 2,
      unit: 'g',
      note: t('for the meatballs', 'pentru perișoare'),
    },
  ],
  steps: [
    {
      key: 'prep-veg',
      text: t(
        'Dice the carrot, parsley root, celeriac, bell pepper and tomatoes into small cubes of about 1 cm, and the soup onions finely. Grate the other onion for the meatballs.',
        'Taie morcovii, rădăcina de pătrunjel, țelina, ardeiul și roșiile cubulețe de aproximativ 1 cm, iar ceapa pentru ciorbă mărunt. Rade cealaltă ceapă pentru perișoare.',
      ),
    },
    {
      key: 'meatball-mix',
      text: t(
        'In a large bowl, mix the minced pork with the rice, egg, grated onion, parsley, 10 g salt and the pepper. Knead briefly, just until everything holds together.',
        'Într-un castron mare amestecă carnea tocată cu orezul, oul, ceapa rasă, pătrunjelul, cele 10 g de sare și piperul. Frământă scurt, doar până se leagă compoziția.',
      ),
    },
    {
      key: 'shape',
      text: t(
        'With wet hands, roll the mixture into about 36 balls of roughly 25 g each, the size of a walnut. Set them on a plate.',
        'Cu mâinile ude, formează din compoziție aproximativ 36 de perișoare de câte 25 g, cam cât o nucă. Așază-le pe o farfurie.',
      ),
    },
    {
      key: 'sweat',
      text: t(
        'Heat the oil in a large pot over medium heat. Add the soup onions, carrot, parsley root, celeriac and bell pepper and cook for 8 minutes, stirring, until the onion is translucent and the vegetables have softened slightly.',
        'Încinge uleiul într-o oală mare la foc mediu. Adaugă ceapa, morcovii, rădăcina de pătrunjel, țelina și ardeiul și călește 8 minute, amestecând, până ceapa devine translucidă, iar legumele se înmoaie ușor.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'paste',
      text: t(
        'Stir in the tomato paste and cook for 1 minute, until it darkens a shade and smells sweet.',
        'Adaugă pasta de roșii și amestecă 1 minut, până se închide puțin la culoare și miroase dulceag.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'water',
      text: t(
        'Pour in the water, add 20 g salt and bring to the boil over high heat.',
        'Toarnă apa, adaugă cele 20 g de sare și adu la fierbere la foc mare.',
      ),
    },
    {
      key: 'veg-simmer',
      text: t(
        'Add the diced tomatoes, lower the heat to a steady simmer and cook for 10 minutes, until the vegetables are half tender.',
        'Adaugă roșiile tăiate, scade focul la un clocot domol și fierbe 10 minute, până legumele sunt pe jumătate fierte.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'meatballs',
      text: t(
        'Drop the meatballs into the simmering soup one by one. Bring back to a gentle simmer and cook for 25 minutes, skimming any foam. They are done when they float and a cut one is grey-white right through, with tender rice and no pink (71 °C in the centre).',
        'Pune perișoarele pe rând în ciorba care fierbe domol. Adu din nou la un clocot ușor și fierbe 25 de minute, luând spuma. Sunt gata când plutesc, iar una tăiată e cenușiu-albicioasă pe tot interiorul, cu orezul moale și fără urmă de roz (71 °C în centru).',
      ),
      timerSeconds: 1500,
    },
    {
      key: 'sour',
      text: t(
        'Pour in 600 ml of the borș, bring to the boil and cook for 5 minutes. Taste, then stir in up to 150 ml more borș, a little at a time, until the soup is as sour as you like, and add salt if needed.',
        'Toarnă 600 ml de borș, adu la fierbere și lasă să fiarbă 5 minute. Gustă, apoi adaugă treptat până la 150 ml de borș în plus, cât să fie ciorba pe gustul tău de acră, și sare dacă mai trebuie.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'finish',
      text: t(
        'Take the pot off the heat and stir in the lovage and dill. Serve hot, with sour cream and sliced hot pepper on the table.',
        'Ia oala de pe foc, adaugă leușteanul și mărarul tocate și amestecă. Servește fierbinte, cu smântână și ardei iute tăiat felii pe masă.',
      ),
    },
  ],
  tips: [
    t(
      'Borș strength varies a lot between brands and homemade batches, so add the last part a little at a time and taste. Do not boil the soup for long once all the borș is in, or the fresh sourness fades.',
      'Tăria borșului diferă mult de la o marcă la alta și de la un borș făcut în casă la altul, așa că adaugă ultima parte treptat și gustă. După ce a intrat tot borșul, nu mai fierbe ciorba mult, altfel acrimea proaspătă dispare.',
    ),
    t(
      'To keep leftovers, cool the pot quickly: pour the soup into shallow containers, refrigerate within 2 hours and eat within 3 days. Reheat until it is steaming hot all the way through.',
      'Ca să păstrezi ce rămâne, răcește repede ciorba: pune-o în vase joase, dă-o la frigider în maximum 2 ore și consumă-o în 3 zile. Reîncălzește până dă în clocot.',
    ),
    t(
      'Roll the meatballs lightly and keep them all the same size, so they cook through at the same time and the rice has room to swell.',
      'Rotunjește perișoarele ușor și fă-le toate la fel de mari, ca să se gătească în același timp, iar orezul să aibă loc să se umfle.',
    ),
  ],
  stepTips: [
    {
      step: 'meatball-mix',
      text: t(
        'A couple of spoonfuls of cold water worked into the mixture keep the meatballs soft and juicy.',
        'Două linguri de apă rece amestecate în compoziție țin perișoarele moi și fragede.',
      ),
    },
    {
      step: 'meatballs',
      text: t(
        'Keep the simmer gentle; a hard boil breaks the meatballs apart and clouds the broth.',
        'Păstrează un clocot domol; fierberea puternică sparge perișoarele și tulbură supa.',
      ),
    },
  ],
  nutritionNote: t(
    'A filling bowl with plenty of vegetables for fibre, and protein from the pork and egg. The pork mince, sour cream and the salt in the borș and the pot add saturated fat and sodium, so season in steps and go easy on the cream.',
    'Un castron sățios, cu multe legume, pentru fibre, și proteine din carnea de porc și ou. Carnea tocată de porc, smântâna și sarea din borș și din oală aduc grăsimi saturate și sodiu, așa că sărează treptat și nu exagera cu smântâna.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Sour cream', 'Smântână'),
      reason: t(
        'Its cool, creamy tang rounds off the sharp sourness of the borș.',
        'Gustul ei răcoritor și cremos rotunjește aciditatea borșului.',
      ),
      principle: 'complement_flavour',
      ingredient: 'sour-cream',
    },
    {
      kind: 'food',
      label: t('Hot pepper', 'Ardei iute'),
      reason: t(
        'A slice of fresh heat wakes up the mild pork and the sour broth.',
        'O felie de ardei iute adaugă un iz proaspăt și iute care trezește gustul blând al cărnii și al supei acrișoare.',
      ),
      principle: 'complement_flavour',
      ingredient: 'hot-pepper',
    },
    {
      kind: 'food',
      label: t('Fresh bread', 'Pâine proaspătă'),
      reason: t(
        'A crusty slice soaks up the broth and gives the soft meatballs something to bite against.',
        'O felie cu crustă se îmbibă cu supă și oferă perișoarelor moi un contrast la mestecat.',
      ),
      principle: 'contrast_texture',
      ingredient: 'bread',
    },
    {
      kind: 'food',
      label: t('Sarmale', 'Sarmale'),
      reason: t(
        'On a Romanian festive menu the sour soup comes first and sarmale follow as the main.',
        'La o masă festivă românească, ciorba deschide masa, iar sarmalele urmează ca fel principal.',
      ),
      principle: 'regional_tradition',
      recipe: 'sarmale',
    },
    {
      kind: 'drink',
      label: t('Țuică before the meal', 'Țuică înainte de masă'),
      reason: t(
        'A small glass of plum brandy is a familiar Romanian way to start a meal, ahead of the soup.',
        'Un pahar mic de țuică e un obicei cunoscut la masa românească, înainte de ciorbă.',
      ),
      principle: 'regional_tradition',
      ingredient: 'tuica',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot, sour soup with meatballs warms you through on a cold day.',
        'O ciorbă fierbinte și acrișoară, cu perișoare, te încălzește într-o zi rece.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Protein from the meatballs, rice for carbohydrates and plenty of warm broth.',
        'Proteine din perișoare, orez pentru carbohidrați și supă caldă din belșug.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A large bowl with sour broth and salt can sit heavy before bed.',
        'Un castron mare de ciorbă acră și sărată poate cădea greu înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'ciorba-de-perisoare-greek',
      cuisine: 'greek',
      title: t(
        'Greek meatball soup with egg and lemon (youvarlakia avgolemono)',
        'Supă grecească de perișoare cu ou și lămâie (youvarlakia avgolemono)',
      ),
      servings: 6,
      prepMinutes: 30,
      cookMinutes: 45,
      difficulty: 'medium',
      hideBaseTips: [0, 1],
      lines: [
        { ingredient: 'minced-beef', quantity: 500, unit: 'g' },
        {
          ingredient: 'medium-grain-rice',
          quantity: 80,
          unit: 'g',
          note: t('rinsed and drained', 'spălat și scurs'),
        },
        {
          ingredient: 'onion',
          key: 'onion-meatballs',
          quantity: 1,
          unit: 'pcs',
          note: t('grated, for the meatballs', 'rasă, pentru perișoare'),
        },
        {
          ingredient: 'onion',
          key: 'onion-broth',
          quantity: 1,
          unit: 'pcs',
          note: t('halved, for the broth', 'tăiată în două, pentru supă'),
        },
        {
          ingredient: 'parsley',
          quantity: 20,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        {
          ingredient: 'dill',
          quantity: 20,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        {
          ingredient: 'mint',
          quantity: 5,
          unit: 'g',
          note: t('finely chopped', 'tocată mărunt'),
        },
        { ingredient: 'olive-oil', quantity: 30, unit: 'ml' },
        { ingredient: 'still-water', quantity: 2, unit: 'l' },
        { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
        {
          ingredient: 'lemon',
          quantity: 2,
          unit: 'pcs',
          note: t('juiced, about 90 ml', 'storsă, aproximativ 90 ml'),
        },
        {
          ingredient: 'salt',
          key: 'salt-meatballs',
          quantity: 7,
          unit: 'g',
          note: t('for the meatballs', 'pentru perișoare'),
        },
        {
          ingredient: 'salt',
          key: 'salt-broth',
          quantity: 12,
          unit: 'g',
          note: t('for the broth', 'pentru supă'),
        },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
      ],
      steps: [
        {
          key: 'meatball-mix',
          text: t(
            'In a bowl, mix the minced beef with the rice, grated onion, parsley, dill, mint, olive oil, 7 g salt and the pepper. Knead briefly, just until it holds together.',
            'Într-un castron amestecă carnea tocată cu orezul, ceapa rasă, pătrunjelul, mărarul, menta, uleiul de măsline, cele 7 g de sare și piperul. Frământă scurt, doar până se leagă compoziția.',
          ),
        },
        {
          key: 'shape',
          text: t(
            'With wet hands, roll about 30 balls of roughly 24 g each, the size of a walnut.',
            'Cu mâinile ude, formează aproximativ 30 de perișoare de câte 24 g, cam cât o nucă.',
          ),
        },
        {
          key: 'broth',
          text: t(
            'Put the water, the halved onion and 12 g salt in a wide pot and bring to the boil.',
            'Pune apa, ceapa tăiată în două și cele 12 g de sare într-o oală lată și adu la fierbere.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Slide the meatballs in one by one, bring back to a gentle simmer and cook for 35 minutes, until the rice is tender. Cut one open to check: it should be grey-brown right through with no pink (71 °C in the centre). Top up with hot water if the meatballs are no longer covered.',
            'Pune perișoarele pe rând în oală, adu din nou la un clocot ușor și fierbe 35 de minute, până orezul se înmoaie. Taie una ca să verifici: trebuie să fie cenușiu-maronie pe tot interiorul, fără urmă de roz (71 °C în centru). Dacă perișoarele nu mai sunt acoperite, adaugă apă fierbinte.',
          ),
          timerSeconds: 2100,
        },
        {
          key: 'cool-slightly',
          text: t(
            'Lift out the onion halves. Take the pot off the heat and leave it for 3 minutes, so the broth is hot but no longer bubbling.',
            'Scoate jumătățile de ceapă. Ia oala de pe foc și las-o 3 minute, ca supa să fie fierbinte, dar să nu mai clocotească.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'whisk',
          text: t(
            'Meanwhile, whisk the eggs in a bowl for 1 minute, until pale and frothy, then whisk in the lemon juice.',
            'Între timp bate ouăle într-un bol 1 minut, până devin deschise la culoare și spumoase, apoi adaugă sucul de lămâie, amestecând.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'temper',
          text: t(
            'Ladle about 250 ml of hot broth into the eggs in a thin stream, whisking all the time, so they warm up without scrambling.',
            'Toarnă aproximativ 250 ml de supă fierbinte peste ouă, într-un fir subțire, amestecând continuu, ca ouăle să se încălzească fără să se brânzească.',
          ),
        },
        {
          key: 'liaison',
          text: t(
            'Pour the egg-lemon mixture back into the pot, stirring gently. Set the pot over the lowest heat and stir for 2 minutes, until the broth turns pale and slightly thickened. Never let it boil, or the egg will curdle.',
            'Toarnă amestecul de ou și lămâie înapoi în oală, amestecând ușor. Pune oala la foc foarte mic și amestecă 2 minute, până supa devine palidă și ușor îngroșată. Nu o lăsa să fiarbă, altfel oul se brânzește.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'serve',
          text: t(
            'Taste and add salt or lemon if needed. Ladle into warm bowls, with the meatballs, and serve at once.',
            'Gustă și corectează cu sare sau lămâie, dacă e nevoie. Servește imediat în boluri calde, cu perișoare.',
          ),
        },
      ],
      tips: [
        t(
          'Lemons vary in sharpness, so add the juice a little at a time and taste: the soup should be clearly lemony without turning sharp.',
          'Lămâile diferă ca acrime, așa că adaugă sucul treptat și gustă: supa trebuie să aibă gust clar de lămâie, fără să devină înțepătoare.',
        ),
        t(
          'Eat this soup the day it is made. If you keep any, refrigerate it within 2 hours, eat it within a day and reheat gently without boiling; the egg thickening can split.',
          'Mănâncă supa în ziua în care ai gătit-o. Dacă îți rămâne, pune-o la frigider în maximum 2 ore, consumă-o într-o zi și reîncălzește-o încet, fără să fiarbă; dresul de ou și lămâie se poate brânzi.',
        ),
      ],
      stepTips: [
        {
          step: 'liaison',
          text: t(
            'The egg is only lightly cooked here, so use fresh, in-date eggs and avoid serving this to anyone who should not eat lightly cooked egg, such as pregnant women, small children, older people and those with weak immunity.',
            'Oul e doar ușor fiert aici, așa că folosește ouă proaspete și nu servi supa celor care nu trebuie să mănânce ou insuficient fiert: gravide, copii mici, vârstnici sau persoane cu imunitate scăzută.',
          ),
        },
      ],
      nutritionNote: t(
        'A lighter, clear soup with protein from the beef and egg and carbohydrate from the rice; there are few vegetables, so serve a salad alongside for fibre. The beef adds some saturated fat, and the egg-lemon liaison is only lightly cooked.',
        'O supă mai ușoară, limpede, cu proteine din carne și ou și carbohidrați din orez; are puține legume, așa că servește alături o salată pentru fibre. Carnea de vită aduce ceva grăsimi saturate, iar dresul de ou și lămâie e doar ușor fiert.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Greek meze platter', 'Platou de meze grecesc'),
          reason: t(
            'A spread of small plates makes a light start before the soup as a main.',
            'Un platou de gustări mici e o deschidere ușoară înainte de supă, ca fel principal.',
          ),
          principle: 'regional_tradition',
          recipe: 'appetizer-platter-greek',
        },
        {
          kind: 'food',
          label: t('Crusty bread', 'Pâine cu crustă'),
          reason: t(
            'It soaks up the lemony broth and adds a crisp contrast to the soft meatballs.',
            'Se îmbibă cu supa cu lămâie și adaugă un contrast crocant față de perișoarele moi.',
          ),
          principle: 'contrast_texture',
          ingredient: 'bread',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its freshness echoes the lemon and refreshes the palate.',
            'Prospețimea lui se potrivește cu lămâia și împrospătează gustul.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'white-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A warm, lemony broth comforts on a cold day.',
            'O supă caldă, cu gust de lămâie, încălzește într-o zi rece.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'A clear broth with a few meatballs is filling without being heavy.',
            'O supă limpede cu câteva perișoare săturează fără să încarce stomacul.',
          ),
        },
      ],
    },
    {
      slug: 'ciorba-de-perisoare-scandinavian',
      cuisine: 'scandinavian',
      title: t(
        'Danish hen soup with meatballs and dumplings (hønsekødssuppe med kød- og melboller)',
        'Supă daneză de găină cu perișoare și găluște (suppe med boller)',
      ),
      servings: 6,
      prepMinutes: 40,
      cookMinutes: 170,
      difficulty: 'medium',
      hideBaseTips: [0, 2],
      lines: [
        {
          ingredient: 'boiling-hen',
          quantity: 1500,
          unit: 'g',
          note: t('whole, giblets removed', 'întreagă, fără măruntaie'),
        },
        { ingredient: 'still-water', quantity: 3.5, unit: 'l' },
        {
          ingredient: 'onion',
          key: 'onion-broth',
          quantity: 1,
          unit: 'pcs',
          note: t('halved, unpeeled', 'tăiată în două, nedecojită'),
        },
        {
          ingredient: 'peppercorns',
          quantity: 1,
          unit: 'g',
          note: t('about 15', 'aproximativ 15 boabe'),
        },
        {
          ingredient: 'bay-leaves',
          quantity: 0.6,
          unit: 'g',
          note: t('3 leaves', '3 foi'),
        },
        {
          ingredient: 'salt',
          key: 'salt-broth',
          quantity: 20,
          unit: 'g',
          note: t('for the broth', 'pentru supă'),
        },
        {
          ingredient: 'leek',
          quantity: 300,
          unit: 'g',
          note: t(
            'white and pale green, cut in thick slices',
            'partea albă și verde-deschis, tăiat în rondele groase',
          ),
        },
        {
          ingredient: 'carrot',
          quantity: 300,
          unit: 'g',
          note: t('cut in 1.5 cm pieces', 'tăiați bucăți de 1,5 cm'),
        },
        {
          ingredient: 'celeriac',
          quantity: 200,
          unit: 'g',
          note: t(
            'peeled, cut in 1.5 cm pieces',
            'curățată, tăiată bucăți de 1,5 cm',
          ),
        },
        {
          ingredient: 'minced-veal-and-pork',
          quantity: 500,
          unit: 'g',
        },
        {
          ingredient: 'onion',
          key: 'onion-boller',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'small, grated, for the meatballs',
            'mică, rasă, pentru perișoare',
          ),
        },
        {
          ingredient: 'eggs',
          key: 'eggs-boller',
          quantity: 1,
          unit: 'pcs',
          note: t('for the meatballs', 'pentru perișoare'),
        },
        {
          ingredient: 'flour',
          key: 'flour-boller',
          quantity: 40,
          unit: 'g',
          note: t('for the meatballs', 'pentru perișoare'),
        },
        {
          ingredient: 'milk',
          key: 'milk-boller',
          quantity: 100,
          unit: 'ml',
          note: t('for the meatballs', 'pentru perișoare'),
        },
        {
          ingredient: 'salt',
          key: 'salt-boller',
          quantity: 8,
          unit: 'g',
          note: t('for the meatballs', 'pentru perișoare'),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        {
          ingredient: 'milk',
          key: 'milk-melboller',
          quantity: 250,
          unit: 'ml',
          note: t('for the dumplings', 'pentru găluște'),
        },
        {
          ingredient: 'butter',
          quantity: 50,
          unit: 'g',
          note: t('for the dumplings', 'pentru găluște'),
        },
        {
          ingredient: 'flour',
          key: 'flour-melboller',
          quantity: 100,
          unit: 'g',
          note: t('for the dumplings', 'pentru găluște'),
        },
        {
          ingredient: 'eggs',
          key: 'eggs-melboller',
          quantity: 2,
          unit: 'pcs',
          note: t('for the dumplings', 'pentru găluște'),
        },
        {
          ingredient: 'eggs',
          key: 'eggs-melboller-spare',
          quantity: 1,
          unit: 'pcs',
          optional: true,
          note: t(
            'beaten, only if the dough is too stiff',
            'bătut, doar dacă aluatul e prea tare',
          ),
        },
        {
          ingredient: 'salt',
          key: 'salt-melboller',
          quantity: 2,
          unit: 'g',
          note: t('for the dumplings', 'pentru găluște'),
        },
        {
          ingredient: 'parsley',
          quantity: 20,
          unit: 'g',
          note: t('finely chopped, to finish', 'tocat mărunt, la final'),
        },
      ],
      steps: [
        {
          key: 'hen',
          text: t(
            'Put the hen in a large pot with the halved onion, peppercorns, bay leaves and 20 g salt. Cover with the cold water and bring slowly to the boil, skimming off the foam.',
            'Pune găina într-o oală mare, cu ceapa tăiată în două, boabele de piper, foile de dafin și cele 20 g de sare. Acoperă cu apă rece și adu încet la fierbere, luând spuma de la suprafață.',
          ),
        },
        {
          key: 'hen-simmer',
          text: t(
            'Lower the heat so the surface barely trembles and simmer for 2 hours, until the leg meat is tender and pulls easily from the bone. Juices should run clear and the meat should be well done all through (74 °C or more); an old hen needs the time.',
            'Scade focul, ca la suprafață să se vadă doar o undă ușoară, și fierbe 2 ore, până carnea de la pulpă se înmoaie și se desprinde ușor de pe os. Zeama trebuie să iasă limpede, iar carnea să fie bine făcută pe tot interiorul (74 °C sau mai mult); o găină bătrână are nevoie de tot timpul.',
          ),
          timerSeconds: 7200,
        },
        {
          key: 'strain',
          text: t(
            'Lift out the hen and strain the broth into a clean pot, discarding the onion and spices. Pull the meat off the bones, discard the skin and bones, and tear the meat into bite-size pieces. Cover it and set aside, with the broth covered too.',
            'Scoate găina și strecoară supa într-o oală curată, aruncând ceapa și condimentele. Desprinde carnea de pe oase, aruncă pielea și oasele și rupe carnea în bucăți mici. Acoperă-o și pune-o deoparte, împreună cu supa acoperită.',
          ),
        },
        {
          key: 'boller-mix',
          text: t(
            'In a bowl, stir the minced veal and pork with the grated onion, egg, 40 g flour, 100 ml milk, 8 g salt and the pepper with a fork for about a minute, until sticky and smooth. With two wet spoons, shape about 36 balls of roughly 20 g each.',
            'Într-un castron amestecă cu furculița carnea tocată de vițel și porc cu ceapa rasă, oul, cele 40 g de făină, cei 100 ml de lapte, cele 8 g de sare și piperul, aproximativ un minut, până compoziția devine lipicioasă și omogenă. Cu două linguri ude, formează aproximativ 36 de perișoare de câte 20 g.',
          ),
        },
        {
          key: 'choux',
          text: t(
            'For the dumplings, bring 250 ml milk, the butter and 2 g salt to the boil in a small pan. Tip in 100 g flour all at once and stir hard over medium heat for 1 minute, until the dough forms a smooth ball and leaves the sides of the pan.',
            'Pentru găluște, adu la fierbere 250 ml de lapte, untul și cele 2 g de sare într-o cratiță mică. Toarnă dintr-odată cele 100 g de făină și amestecă energic la foc mediu 1 minut, până aluatul se adună într-o bilă netedă și se desprinde de pe pereți.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'choux-cool',
          text: t(
            'Scrape the dough into a bowl and leave it for 5 minutes, so it does not cook the eggs. Then beat in the 2 eggs one at a time until the dough is glossy and just holds its shape between two spoons.',
            'Pune aluatul într-un castron și lasă-l 5 minute, ca să nu fiarbă ouăle. Apoi bate pe rând cele 2 ouă, până aluatul devine lucios și își păstrează forma între două linguri.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'boller-poach',
          text: t(
            'Bring the strained broth back to a simmer and add the carrot and celeriac. Slide the meatballs in and poach gently for 15 minutes. They are done when they float and a cut one is grey-white right through, with no pink (71 °C in the centre).',
            'Adu supa strecurată din nou la fierbere și adaugă morcovii și țelina. Lasă perișoarele să alunece în supă și fierbe-le la foc mic 15 minute. Sunt gata când plutesc, iar una tăiată e cenușiu-albicioasă pe tot interiorul, fără urmă de roz (71 °C în centru).',
          ),
          timerSeconds: 900,
        },
        {
          key: 'melboller',
          text: t(
            'Add the leek to the pot. With two wet teaspoons, drop small ovals of dough into the simmering broth. Poach for 10 minutes, until the dumplings are puffed and firm and the vegetables are soft. Cut one dumpling open: it should be set and fluffy, with no raw dough.',
            'Adaugă prazul în oală. Cu două lingurițe ude, lasă să cadă în supa care fierbe domol ovale mici de aluat. Fierbe 10 minute, până găluștele se umflă și se întăresc, iar legumele se înmoaie. Taie o găluștă: trebuie să fie închegată și pufoasă, fără aluat crud.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'serve',
          text: t(
            'Return the hen meat to the soup and heat for 3 minutes. Taste and add salt. Stir in the parsley and serve in warm bowls.',
            'Pune carnea de găină înapoi în supă și încălzește 3 minute. Gustă și corectează cu sare. Adaugă pătrunjelul și servește în boluri calde.',
          ),
          timerSeconds: 180,
        },
      ],
      tips: [
        t(
          'For a crystal-clear broth, poach the dumplings in a separate pan of lightly salted simmering water and add them to the bowls at the end; the flour clouds the soup a little.',
          'Pentru o supă cristalină, fierbe găluștele într-o cratiță separată, cu apă ușor sărată, și pune-le în boluri la final; făina tulbură puțin supa.',
        ),
      ],
      stepTips: [
        {
          step: 'choux-cool',
          text: t(
            'Beat each egg in fully before adding the next. If the dough is too stiff to drop from the spoon, beat in a little of the extra egg.',
            'Încorporează bine fiecare ou înainte de următorul. Dacă aluatul e prea tare și nu se desprinde de pe lingură, încorporează puțin din oul în plus.',
          ),
        },
      ],
      nutritionNote: t(
        'A clear, unsoured broth with protein from the hen and meatballs and soft vegetables for fibre. The dumplings add refined carbohydrate, and the hen, butter and the salt in the pot add saturated fat and sodium, so skim some fat and go carefully with salt.',
        'O supă limpede, neacrită, cu proteine din găină și perișoare și legume moi pentru fibre. Găluștele aduc carbohidrați rafinați, iar găina, untul și sarea din oală aduc grăsimi saturate și sodiu, așa că îndepărtează o parte din grăsime și sărează cu grijă.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('White bread or baguette', 'Pâine albă sau baghetă'),
          reason: t(
            'A crisp crust soaks up the broth and contrasts with the soft dumplings.',
            'O crustă crocantă se îmbibă cu supă și contrastează cu găluștele moi.',
          ),
          principle: 'contrast_texture',
          ingredient: 'baguette',
        },
        {
          kind: 'drink',
          label: t('Beer', 'Bere'),
          reason: t(
            'Its bubbles and light bitterness refresh the palate between spoonfuls.',
            'Bulele și amăreala ușoară împrospătează gustul între linguri.',
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
            'A hot hen broth with dumplings warms you right through.',
            'O supă fierbinte de găină, cu găluște, te încălzește bine.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Meatballs and dumplings make a heavy bowl before bed.',
            'Perișoarele și găluștele fac un castron greu înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
