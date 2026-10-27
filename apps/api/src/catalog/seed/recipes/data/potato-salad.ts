import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Potato salad base is the creamy, mayonnaise-dressed salad of waxy
// potatoes. Each Variant is a full Recipe with its own lines, steps and
// guidance; the base's Recipe-level Tips are inherited unless hidden.
export const potatoSalad: BaseRecipeSeed = {
  slug: 'potato-salad',
  title: t('Creamy potato salad', 'Salată de cartofi cu maioneză'),
  servings: 6,
  prepMinutes: 70,
  cookMinutes: 45,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'potato',
      quantity: 1200,
      unit: 'g',
      note: t(
        'waxy, such as Charlotte or Annabelle, similar in size',
        'cu pulpă fermă, care nu se desface la fiert, cam de aceeași mărime',
      ),
    },
    {
      key: 'salt-boil',
      ingredient: 'salt',
      quantity: 15,
      unit: 'g',
      note: t('for the cooking water', 'pentru apa de fiert'),
    },
    {
      ingredient: 'wine-vinegar',
      quantity: 30,
      unit: 'ml',
      note: t('white', 'alb'),
    },
    {
      ingredient: 'mayonnaise',
      quantity: 180,
      unit: 'g',
    },
    { ingredient: 'mustard', quantity: 15, unit: 'g' },
    {
      ingredient: 'spring-onion',
      quantity: 40,
      unit: 'g',
      note: t('thinly sliced', 'tăiată subțire'),
    },
    {
      ingredient: 'chives',
      quantity: 10,
      unit: 'g',
      note: t('finely snipped', 'tăiat mărunt'),
    },
    {
      ingredient: 'salt',
      quantity: 4,
      unit: 'g',
      note: t('to season the potatoes', 'pentru condimentarea cartofilor'),
    },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
  ],
  steps: [
    {
      key: 'boil',
      text: t(
        'Scrub the potatoes and put them in a large pot with their skins on, halving any that are much bigger than the rest. Cover with cold water by 3 cm, add the 15 g of salt and bring to the boil over high heat, about 10 minutes.',
        'Spală bine cartofii și pune-i în coajă într-o oală mare, tăind în două pe cei mult mai mari decât ceilalți. Acoperă-i cu apă rece, cu 3 cm deasupra, adaugă cele 15 g de sare și adu la fierbere la foc mare, în aproximativ 10 minute.',
      ),
    },
    {
      key: 'simmer',
      text: t(
        'Lower the heat so the water barely bubbles and cook for about 25 minutes, until a knife slides into the largest potato with no resistance.',
        'Redu focul, ca apa abia să mai clocotească, și fierbe aproximativ 25 de minute, până când un cuțit intră fără rezistență în cel mai mare cartof.',
      ),
      timerSeconds: 1500,
    },
    {
      key: 'peel',
      text: t(
        'Drain the potatoes and let them cool for 5 minutes, just until you can hold them in a folded tea towel. Peel off the skins with a small knife while they are still warm, then cut them into slices 1 cm thick, or bite-size chunks.',
        'Scurge cartofii și lasă-i 5 minute, doar cât să-i poți ține într-un prosop de bucătărie împăturit. Curăță-i de coajă cu un cuțit mic cât sunt încă calzi, apoi taie-i felii de 1 cm grosime sau cuburi cât o îmbucătură.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'season-warm',
      text: t(
        'Put the warm potatoes in a large bowl and sprinkle with the vinegar, the 4 g of salt and the pepper. Turn them gently with a spatula, then leave them to cool to room temperature, about 30 minutes.',
        'Pune cartofii calzi într-un castron mare și stropește-i cu oțetul, cele 4 g de sare și piperul. Amestecă-i ușor cu o spatulă, apoi lasă-i să se răcească la temperatura camerei, aproximativ 30 de minute.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'dressing',
      text: t(
        'While the potatoes cool, stir the mayonnaise, mustard, spring onion and chives together in a small bowl.',
        'Cât se răcesc cartofii, amestecă maioneza, muștarul, ceapa verde și arpagicul într-un bol mic.',
      ),
    },
    {
      key: 'fold',
      text: t(
        'When the potatoes feel cool, with no warmth left when you touch one to the inside of your wrist, fold in the dressing with a spatula until every piece is coated. Keep the movements gentle so the slices stay whole.',
        'Când cartofii sunt reci și nu mai simți nicio urmă de căldură dacă atingi unul cu dosul palmei, încorporează sosul cu o spatulă până când fiecare bucată e acoperită. Amestecă blând, ca feliile să rămână întregi.',
      ),
    },
    {
      key: 'chill',
      text: t(
        'Cover the bowl and refrigerate for at least 30 minutes so the flavours settle. Taste, and add a pinch of salt or a few drops of vinegar if it needs it. Serve cold, straight from the fridge.',
        'Acoperă bolul și pune-l la frigider cel puțin 30 de minute, ca aromele să se lege. Gustă și adaugă un vârf de sare sau câteva picături de oțet, dacă mai are nevoie. Servește rece, direct din frigider.',
      ),
      timerSeconds: 1800,
    },
  ],
  tips: [
    t(
      'Choose waxy potatoes: they keep their shape when sliced and dressed. Floury ones crumble into a mash.',
      'Alege cartofi cu pulpă fermă: își păstrează forma după ce sunt tăiați și amestecați cu sosul. Cei făinoși se sfărâmă și se transformă în piure.',
    ),
    t(
      'Season with vinegar while the potatoes are warm, because they soak it up, but add the mayonnaise only once they are cool: on warm potatoes it turns thin and oily.',
      'Condimentează cu oțet cât cartofii sunt calzi, pentru că îl absorb, dar adaugă maioneza abia când sunt reci: pe cartofi calzi se subțiază și devine uleioasă.',
    ),
    t(
      'A mayonnaise salad must not sit out: keep it in the fridge, leave it at room temperature for no more than 2 hours in total (less on a hot day), and eat it within 3 days.',
      'O salată cu maioneză nu trebuie lăsată afară: ține-o la frigider, las-o la temperatura camerei cel mult 2 ore în total (mai puțin pe caniculă) și consum-o în 3 zile.',
    ),
  ],
  stepTips: [
    {
      step: 'simmer',
      text: t(
        'Keep the water at a gentle bubble: a hard boil splits the skins and leaves the outside mushy before the middle is done.',
        'Ține apa la un clocot ușor: un fiert puternic crapă coaja și lasă exteriorul moale înainte să se fiarbă mijlocul.',
      ),
    },
    {
      step: 'chill',
      text: t(
        'Cold dulls salt, so taste again after chilling rather than before.',
        'Frigul estompează sarea, așa că gustă din nou după răcire, nu înainte.',
      ),
    },
  ],
  nutritionNote: t(
    'A filling, starchy side. The vinegar, herbs and spring onion add freshness, but the mayonnaise carries most of the fat and calories, so measure it, and swap a few spoonfuls for yogurt if you want it lighter. With the skins peeled it is low in fibre; serve it with raw vegetables or a green salad.',
    'Garnitură săturătoare și bogată în amidon. Oțetul, ierburile și ceapa verde aduc prospețime, dar maioneza aduce cea mai mare parte din grăsimi și calorii, așa că măsoar-o și înlocuiește câteva linguri cu iaurt dacă o vrei mai ușoară. Fiind fără coajă, are puține fibre; servește-o cu legume crude sau cu o salată verde.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t(
        'Frikadeller (Danish meatballs)',
        'Frikadeller (chiftele daneze)',
      ),
      reason: t(
        'Cold or warm frikadeller beside a creamy potato salad make an easy summer or picnic plate: the browned, savoury meat against the cool, soft potatoes.',
        'Frikadeller calde sau reci, lângă o salată cremoasă de cartofi, fac o farfurie ușoară de vară sau de picnic: carnea rumenită și sărată în contrast cu cartofii reci și moi.',
      ),
      principle: 'contrast_texture',
      recipe: 'frikadeller',
    },
    {
      kind: 'food',
      label: t('Frankfurters', 'Crenvurști'),
      reason: t(
        'The salty, smoky sausage is balanced by the mild, creamy salad.',
        'Crenvurștii sărați și afumați sunt echilibrați de salata blândă și cremoasă.',
      ),
      principle: 'complement_flavour',
      ingredient: 'frankfurters',
    },
    {
      kind: 'food',
      label: t('Radishes', 'Ridichi'),
      reason: t(
        'Their crunch and peppery bite wake up a soft, rich salad.',
        'Crocanța și gustul lor înțepător trezesc o salată moale și bogată.',
      ),
      principle: 'contrast_texture',
      ingredient: 'radish',
    },
    {
      kind: 'drink',
      label: t('Lager beer', 'Bere blondă'),
      reason: t(
        'Cold, bubbly beer cuts through the mayonnaise and refreshes the palate.',
        'Berea rece și spumoasă taie din grăsimea maionezei și răcorește gustul.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'beer',
    },
    {
      kind: 'drink',
      label: t('Dry white wine', 'Vin alb sec'),
      reason: t(
        'Its acidity cuts the richness of the mayonnaise.',
        'Aciditatea lui taie din bogăția maionezei.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'white-wine',
    },
  ],
  eatingMoments: [
    {
      moment: 'hot-day',
      polarity: 'good_for',
      reason: t(
        'Served cold, it is a refreshing side in the heat; just keep it chilled until the moment you serve it.',
        'Servită rece, e o garnitură răcoritoare pe căldură; ține-o la frigider până în momentul servirii.',
      ),
    },
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'Needs no cooking at the last minute and goes with cold meats or fish.',
        'Nu cere gătit în ultimul moment și merge cu mezeluri sau pește rece.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'The potatoes help refill energy; keep the portion modest, because of the mayonnaise, and add a protein such as egg or chicken.',
        'Cartofii ajută la refacerea energiei; ține porția moderată, din cauza maionezei, și adaugă o proteină, de exemplu ou sau pui.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'The mayonnaise makes it heavy to digest right before exercise.',
        'Maioneza o face grea de digerat chiar înainte de efort.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A big, rich portion sits heavy before bed.',
        'O porție mare și bogată cade greu înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'potato-salad-german',
      cuisine: 'german',
      title: t(
        'Swabian potato salad (Schwäbischer Kartoffelsalat)',
        'Salată de cartofi șvăbească (Schwäbischer Kartoffelsalat)',
      ),
      servings: 4,
      prepMinutes: 50,
      cookMinutes: 35,
      difficulty: 'easy',
      hideBaseTips: [1, 2],
      lines: [
        {
          ingredient: 'potato',
          quantity: 800,
          unit: 'g',
          note: t(
            'waxy, such as Charlotte or Annabelle, similar in size',
            'cu pulpă fermă, care nu se desface la fiert, cam de aceeași mărime',
          ),
        },
        {
          key: 'salt-boil',
          ingredient: 'salt',
          quantity: 10,
          unit: 'g',
          note: t('for the cooking water', 'pentru apa de fiert'),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('small, very finely chopped', 'mică, tocată foarte mărunt'),
        },
        { ingredient: 'beef-stock', quantity: 200, unit: 'ml' },
        {
          ingredient: 'wine-vinegar',
          quantity: 40,
          unit: 'ml',
          note: t('white', 'alb'),
        },
        { ingredient: 'mustard', quantity: 10, unit: 'g' },
        { ingredient: 'sugar', quantity: 3, unit: 'g' },
        { ingredient: 'sunflower-oil', quantity: 45, unit: 'ml' },
        {
          ingredient: 'chives',
          quantity: 10,
          unit: 'g',
          note: t('finely snipped', 'tăiat mărunt'),
        },
        {
          ingredient: 'salt',
          quantity: 3,
          unit: 'g',
          note: t(
            'for the dressing; use less if your stock is salted',
            'pentru sos; mai puțină dacă supa e sărată',
          ),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'boil',
          text: t(
            'Scrub the potatoes and put them in a large pot with their skins on. Cover with cold water by 3 cm, add the 10 g of salt and bring to the boil over high heat, about 10 minutes.',
            'Spală bine cartofii și pune-i în coajă într-o oală mare. Acoperă-i cu apă rece, cu 3 cm deasupra, adaugă cele 10 g de sare și adu la fierbere la foc mare, în aproximativ 10 minute.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Lower the heat so the water barely bubbles and cook for about 25 minutes, until a knife slides into the largest potato with no resistance.',
            'Redu focul, ca apa abia să mai clocotească, și fierbe aproximativ 25 de minute, până când un cuțit intră fără rezistență în cel mai mare cartof.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'dressing',
          text: t(
            "In the last 5 minutes of the potatoes' cooking, put the onion, stock, vinegar, mustard, sugar, the salt and the pepper in a small pan. Bring to a simmer, cook for 2 minutes so the onion softens, then keep it covered over very low heat so it does not reduce.",
            'În ultimele 5 minute de fierbere a cartofilor, pune ceapa, supa, oțetul, muștarul, zahărul, sarea și piperul într-o cratiță mică. Adu la fierbere, lasă 2 minute ca ceapa să se înmoaie, apoi ține sosul acoperit la foc foarte mic, ca să nu scadă.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'slice',
          text: t(
            'Drain the potatoes and let them cool for 5 minutes, just until you can hold them in a folded tea towel. Peel them while still warm and cut into slices 3 to 4 mm thick, dropping them straight into a large bowl.',
            'Scurge cartofii și lasă-i 5 minute, doar cât să-i poți ține într-un prosop de bucătărie împăturit. Curăță-i cât sunt încă calzi și taie-i felii de 3-4 mm, direct într-un castron mare.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'soak',
          text: t(
            'Pour the hot dressing over the warm slices and turn them gently with a spatula. Leave them for 30 minutes, turning once or twice, until the potatoes have drunk up most of the liquid and look glossy.',
            'Toarnă sosul fierbinte peste feliile calde și amestecă-le blând cu o spatulă. Lasă-le 30 de minute, amestecând o dată sau de două ori, până când cartofii absorb aproape tot lichidul și devin lucioși.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'oil',
          text: t(
            'Drizzle in the oil, fold gently and taste, adding salt or a splash of vinegar if needed. Scatter the chives on top and serve lukewarm or at room temperature.',
            'Adaugă uleiul în fir subțire, amestecă blând și gustă, adăugând sare sau puțin oțet dacă e nevoie. Presară arpagicul deasupra și servește călduță sau la temperatura camerei.',
          ),
        },
      ],
      tips: [
        t(
          'Leftovers tighten up in the fridge: loosen them with a splash of warm water or stock and a drop of oil before serving. Refrigerate within 2 hours and eat within 2 days.',
          'Resturile se întăresc la frigider: înmoaie-le cu puțină apă sau supă caldă și o picătură de ulei înainte de servire. Pune-le la frigider în maximum 2 ore și consumă-le în 2 zile.',
        ),
      ],
      stepTips: [
        {
          step: 'soak',
          text: t(
            'The dressing must be hot and the potatoes warm: cold potatoes take up the liquid poorly and stay dry.',
            'Sosul trebuie să fie fierbinte, iar cartofii calzi: cartofii reci absorb prost lichidul și rămân uscați.',
          ),
        },
      ],
      nutritionNote: t(
        'Made without mayonnaise, so it carries much less fat than the creamy version; the oil is a few spoonfuls across four portions. It is still a starchy side, and the stock and salt make it salty. Low in fibre once peeled, so serve it with something green.',
        'Fără maioneză, are mult mai puține grăsimi decât varianta cremoasă; uleiul înseamnă doar câteva linguri la patru porții. Rămâne o garnitură bogată în amidon, iar supa și sarea o fac sărată. Are puține fibre după curățare, așa că servește-o cu ceva verde.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Frankfurters', 'Crenvurști'),
          reason: t(
            'Warm sausages go well with the tangy potatoes; the sour dressing cuts through the fatty sausage.',
            'Mezelurile calde merg bine cu cartofii acrișori; sosul acru taie din grăsimea cârnatului.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'frankfurters',
        },
        {
          kind: 'food',
          label: t('Fresh sausages', 'Cârnați proaspeți'),
          reason: t(
            'Pan-fried sausages with browned skin are balanced by the sharp dressing.',
            'Cârnații rumeniți în tigaie sunt echilibrați de sosul înțepător.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'fresh-sausages',
        },
        {
          kind: 'drink',
          label: t('Lager beer', 'Bere blondă'),
          reason: t(
            'Light, crisp beer refreshes between salty, sour bites.',
            'Berea ușoară și proaspătă împrospătează gustul între îmbucături sărate și acrișoare.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'A dry, high-acid white echoes the vinegar in the dressing.',
            'Un vin alb sec, cu aciditate ridicată, reia nota de oțet din sos.',
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
            'Light on fat and easy to serve lukewarm with a sausage.',
            'Ușoară în grăsimi și ușor de servit călduță, cu un cârnat.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Fine at room temperature, so no heavy cold mayonnaise on a warm day.',
            'Bună la temperatura camerei, deci fără maioneză grea pe vreme caldă.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Carbohydrates help refill energy; add a protein on the side.',
            'Carbohidrații ajută la refacerea energiei; adaugă o proteină alături.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'A large plate of potatoes sits heavy right before exercise.',
            'O farfurie mare de cartofi cade greu chiar înainte de efort.',
          ),
        },
      ],
    },
    {
      slug: 'potato-salad-japanese',
      cuisine: 'japanese',
      title: t(
        'Japanese potato salad (potesara)',
        'Salată japoneză de cartofi (potesara)',
      ),
      servings: 4,
      prepMinutes: 65,
      cookMinutes: 30,
      difficulty: 'easy',
      hideBaseTips: [0],
      lines: [
        {
          ingredient: 'potato',
          quantity: 600,
          unit: 'g',
          note: t(
            'floury, such as Maris Piper or Russet',
            'făinoși, cu amidon mult',
          ),
        },
        {
          key: 'salt-boil',
          ingredient: 'salt',
          quantity: 6,
          unit: 'g',
          note: t('for the cooking water', 'pentru apa de fiert'),
        },
        {
          ingredient: 'carrot',
          quantity: 60,
          unit: 'g',
          note: t('sliced 3 mm thin', 'tăiat felii de 3 mm'),
        },
        {
          ingredient: 'rice-vinegar',
          quantity: 15,
          unit: 'ml',
        },
        {
          ingredient: 'cucumber',
          quantity: 1,
          unit: 'pcs',
          note: t('small, sliced very thin', 'mic, tăiat foarte subțire'),
        },
        {
          key: 'salt-cucumber',
          ingredient: 'salt',
          quantity: 2,
          unit: 'g',
          note: t('for the cucumber', 'pentru castravete'),
        },
        {
          ingredient: 'onion',
          quantity: 0.5,
          unit: 'pcs',
          note: t('sliced paper-thin', 'tăiată foarte subțire'),
        },
        {
          ingredient: 'ham',
          quantity: 60,
          unit: 'g',
          note: t('cut into thin strips', 'tăiată fâșii subțiri'),
        },
        {
          ingredient: 'eggs',
          quantity: 2,
          unit: 'pcs',
          optional: true,
          note: t('hard-boiled', 'fierte tari'),
        },
        { ingredient: 'japanese-mayonnaise', quantity: 90, unit: 'g' },
        {
          ingredient: 'salt',
          quantity: 2,
          unit: 'g',
          note: t('to season the mash', 'pentru condimentarea piureului'),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'cucumber',
          text: t(
            'Toss the cucumber slices with the 2 g of salt and leave them for 10 minutes. Soak the sliced onion in a bowl of cold water for the same time to take off its sharpness.',
            'Amestecă felițele de castravete cu cele 2 g de sare și lasă-le 10 minute. Ține ceapa tăiată într-un bol cu apă rece tot atâta timp, ca să-și piardă iuțeala.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'boil',
          text: t(
            'Peel the potatoes and cut them into chunks about 4 cm across. Put them in a pot, cover with cold water, add the 6 g of salt and bring to the boil over high heat, about 8 minutes.',
            'Curăță cartofii și taie-i bucăți de aproximativ 4 cm. Pune-i într-o oală, acoperă-i cu apă rece, adaugă cele 6 g de sare și adu la fierbere la foc mare, în aproximativ 8 minute.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Simmer the potatoes for 14 minutes. If you want the hard-boiled eggs, lower them into a separate pan of boiling water now and cook them for 10 minutes, then cool them under cold water.',
            'Fierbe cartofii 14 minute. Dacă vrei ouă fierte tari, pune-le acum într-o altă oală cu apă clocotită, fierbe-le 10 minute, apoi răcește-le sub jet de apă rece.',
          ),
          timerSeconds: 840,
        },
        {
          key: 'carrot',
          text: t(
            'Add the carrot slices to the potato pot and simmer for 3 minutes more, until a knife slides into the potatoes with no resistance and the carrot is tender but not mushy.',
            'Adaugă felițele de morcov în oala cu cartofi și fierbe încă 3 minute, până când cuțitul intră fără rezistență în cartofi, iar morcovul e moale, dar nu fiert în exces.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'dry',
          text: t(
            'Drain well and tip the potatoes and carrot back into the dry pot. Leave them over very low heat for 1 minute, shaking the pot, to steam off the surface water.',
            'Scurge bine și pune cartofii cu morcovul înapoi în oala uscată. Ține-i 1 minut la foc foarte mic, scuturând oala, ca să se evapore apa de pe suprafață.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'mash',
          text: t(
            'While still hot, sprinkle with the rice vinegar, the 2 g of salt and the pepper, and mash coarsely with a potato masher, leaving plenty of small chunks. Spread on a tray and cool for 20 minutes.',
            'Cât sunt încă fierbinți, stropește-i cu oțetul de orez și presară cele 2 g de sare și piperul, apoi zdrobește-i grosier cu un zdrobitor de cartofi, lăsând multe bucățele mici. Întinde-i pe o tavă și lasă-i 20 de minute să se răcească.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'squeeze',
          text: t(
            'Squeeze the cucumber hard in your fist, a handful at a time, and drain the onion well; both must be quite dry. If using the eggs, peel them and chop roughly.',
            'Strânge castravetele cu putere în pumn, câte o mână, și scurge bine ceapa; amândouă trebuie să fie destul de uscate. Dacă folosești ouăle, curăță-le de coajă și toacă-le grosier.',
          ),
        },
        {
          key: 'mix',
          text: t(
            'Mix the cooled potato with the cucumber, onion, ham and the chopped eggs. Add the Japanese mayonnaise and fold until everything is bound but still chunky. Cover and refrigerate for 30 minutes before serving.',
            'Amestecă piureul răcit cu castravetele, ceapa, șunca și ouăle tocate. Adaugă maioneza japoneză și încorporează până când totul se leagă, dar rămâne cu bucăți. Acoperă și ține la frigider 30 de minute înainte de servire.',
          ),
          timerSeconds: 1800,
        },
      ],
      tips: [
        t(
          'Keep it chunky: a few lumps of potato are the point. Over-mashed, it turns into a paste.',
          'Las-o cu bucăți: câteva cocoloașe de cartof sunt tocmai ideea. Zdrobită prea mult, devine pastă.',
        ),
      ],
      stepTips: [
        {
          step: 'squeeze',
          text: t(
            'Wring the cucumber out firmly; water left in it thins the mayonnaise and the salad turns watery after an hour.',
            'Stoarce bine castravetele; apa rămasă în el subțiază maioneza, iar salata devine apoasă după o oră.',
          ),
        },
      ],
      nutritionNote: t(
        'The potato and egg make it filling, and the cucumber and carrot add some freshness and colour. The mayonnaise and ham bring fat and salt, so go easy on both. Peeled potatoes give little fibre; serve with a vegetable side.',
        'Cartoful și oul o fac săturătoare, iar castravetele și morcovul aduc prospețime și culoare. Maioneza și șunca aduc grăsimi și sare, așa că nu exagera cu ele. Cartofii curățați dau puține fibre; servește cu o garnitură de legume.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Japanese karaage', 'Karaage japonez'),
          reason: t(
            'The crisp, hot fried chicken contrasts with the cool, soft salad.',
            'Puiul prăjit, crocant și fierbinte, contrastează cu salata rece și moale.',
          ),
          principle: 'contrast_texture',
          recipe: 'fried-chicken-karaage',
        },
        {
          kind: 'food',
          label: t('Edamame', 'Edamame'),
          reason: t(
            'Salted soybeans add a fresh, green bite and some protein.',
            'Boabele de soia sărate adaugă un gust proaspăt, verde, și proteine.',
          ),
          principle: 'complement_flavour',
          ingredient: 'edamame',
        },
        {
          kind: 'drink',
          label: t('Green tea', 'Ceai verde'),
          reason: t(
            'Its light bitterness cleans the palate after the creamy mayonnaise.',
            'Amăreala lui ușoară curăță gustul după maioneza cremoasă.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'green-tea',
        },
        {
          kind: 'drink',
          label: t('Lager beer', 'Bere blondă'),
          reason: t(
            'Cold, light beer cuts the richness of the mayonnaise.',
            'Berea rece și ușoară taie din bogăția maionezei.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Easy to make ahead, and it fills a sandwich or a bento box.',
            'Se pregătește ușor dinainte și umple un sandviș sau un bento.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Served cold it is refreshing; keep it chilled until serving.',
            'Servită rece e răcoritoare; ține-o la frigider până la servire.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Carbohydrates from the potato, plus protein from the ham and egg.',
            'Carbohidrați din cartof, plus proteine din șuncă și ou.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'The mayonnaise makes it heavy right before exercise.',
            'Maioneza o face grea chiar înainte de efort.',
          ),
        },
      ],
    },
    {
      slug: 'potato-salad-romanian',
      cuisine: 'romanian',
      title: t(
        'Romanian potato, onion and olive salad (salată orientală)',
        'Salată orientală de post',
      ),
      servings: 4,
      prepMinutes: 50,
      cookMinutes: 35,
      difficulty: 'easy',
      hideBaseTips: [1, 2],
      lines: [
        {
          ingredient: 'potato',
          quantity: 800,
          unit: 'g',
          note: t(
            'waxy, such as Charlotte or Annabelle, similar in size',
            'cu pulpă fermă, care nu se desface la fiert, cam de aceeași mărime',
          ),
        },
        {
          key: 'salt-boil',
          ingredient: 'salt',
          quantity: 10,
          unit: 'g',
          note: t('for the cooking water', 'pentru apa de fiert'),
        },
        {
          ingredient: 'red-onion',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'sliced into thin half-moons',
            'tăiată în semirondele subțiri',
          ),
        },
        { ingredient: 'sunflower-oil', quantity: 45, unit: 'ml' },
        {
          ingredient: 'vinegar',
          quantity: 30,
          unit: 'ml',
          note: t('white', 'alb'),
        },
        {
          ingredient: 'parsley',
          quantity: 20,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        {
          ingredient: 'olives',
          quantity: 50,
          unit: 'g',
          note: t('black, pitted', 'negre, fără sâmburi'),
        },
        {
          ingredient: 'salt',
          quantity: 3,
          unit: 'g',
          note: t('for the dressing', 'pentru sos'),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'boil',
          text: t(
            'Scrub the potatoes and put them in a large pot with their skins on. Cover with cold water by 3 cm, add the 10 g of salt and bring to the boil over high heat, about 10 minutes.',
            'Spală bine cartofii și pune-i în coajă într-o oală mare. Acoperă-i cu apă rece, cu 3 cm deasupra, adaugă cele 10 g de sare și adu la fierbere la foc mare, în aproximativ 10 minute.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Lower the heat so the water barely bubbles and cook for about 25 minutes, until a knife slides into the largest potato with no resistance.',
            'Redu focul, ca apa abia să mai clocotească, și fierbe aproximativ 25 de minute, până când un cuțit intră fără rezistență în cel mai mare cartof.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'onion',
          text: t(
            'While the potatoes cook, put the sliced onion in a bowl, cover with cold water and leave it for 10 minutes to mellow its bite, then drain it well.',
            'Cât se fierb cartofii, pune ceapa tăiată într-un bol, acoper-o cu apă rece și las-o 10 minute ca să-și piardă din iuțeală, apoi scurge-o bine.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'peel',
          text: t(
            'Drain the potatoes and let them cool for 15 minutes, until they are only lukewarm. Peel them and cut into slices about 5 mm thick.',
            'Scurge cartofii și lasă-i 15 minute, până sunt doar călduți. Curăță-i de coajă și taie-i felii de aproximativ 5 mm.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'dress',
          text: t(
            'In a large bowl, whisk the oil, vinegar, the 3 g of salt and the pepper. Add the potatoes, the onion, most of the parsley and the olives, and turn gently so the slices stay whole.',
            'Într-un castron mare, amestecă uleiul, oțetul, cele 3 g de sare și piperul. Adaugă cartofii, ceapa, cea mai mare parte din pătrunjel și măslinele și amestecă blând, ca feliile să rămână întregi.',
          ),
        },
        {
          key: 'rest',
          text: t(
            'Leave the salad for 15 minutes so the potatoes take up the dressing, then taste, adjust salt and vinegar, and scatter the rest of the parsley on top.',
            'Lasă salata 15 minute ca cartofii să absoarbă sosul, apoi gustă, corectează sarea și oțetul și presară deasupra restul de pătrunjel.',
          ),
          timerSeconds: 900,
        },
      ],
      tips: [
        t(
          'Slice the potatoes only once they are lukewarm: hot ones break up when tossed with the onion, and cold ones take up the dressing poorly.',
          'Taie cartofii abia când sunt călduți: cei fierbinți se sfărâmă la amestecat cu ceapa, iar cei reci absorb prost sosul.',
        ),
        t(
          'It contains no animal products, so it suits fasting days. Keep it covered in the fridge, take it out 20 minutes before serving, and eat it within 2 days.',
          'Nu conține produse de origine animală, deci se potrivește în zilele de post. Ține-o acoperită la frigider, scoate-o cu 20 de minute înainte de servire și consum-o în 2 zile.',
        ),
      ],
      nutritionNote: t(
        'Starchy and filling, with raw onion and parsley for freshness and a little oil rather than mayonnaise, so it is lighter than the creamy version. The olives and salt add sodium, and the peeled potatoes give little fibre; it works best next to fish or a protein.',
        'Bogată în amidon și săturătoare, cu ceapă crudă și pătrunjel pentru prospețime și puțin ulei în loc de maioneză, deci mai ușoară decât varianta cremoasă. Măslinele și sarea aduc sodiu, iar cartofii curățați dau puține fibre; se potrivește cel mai bine lângă pește sau altă proteină.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Romanian chicken schnitzel', 'Șnițel de pui'),
          reason: t(
            'Șnițel with a potato salad is a common Romanian home and celebration plate: the crisp, golden chicken against the tangy, soft potatoes.',
            'Șnițelul cu salată de cartofi e o farfurie des întâlnită în casele românești și la sărbători: puiul crocant și auriu în contrast cu cartofii moi și acrișori.',
          ),
          principle: 'contrast_texture',
          recipe: 'fried-chicken-snitel',
        },
        {
          kind: 'food',
          label: t('Grilled mackerel', 'Macrou la grătar'),
          reason: t(
            'The sharp onion and vinegar cut through the oily fish.',
            'Ceapa și oțetul înțepătoare taie din grăsimea peștelui.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'mackerel',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its acidity echoes the vinegar and refreshes the palate.',
            'Aciditatea lui reia nota de oțet și împrospătează gustul.',
          ),
          principle: 'complement_flavour',
          ingredient: 'white-wine',
        },
        {
          kind: 'drink',
          label: t('Lager beer', 'Bere blondă'),
          reason: t(
            'Cold, light beer refreshes the palate after the sharp onion and vinegar.',
            'Berea rece și ușoară împrospătează gustul după ceapa și oțetul înțepătoare.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Simple, quick, and easy to pair with fish or a fried cutlet.',
            'Simplă, rapidă și ușor de asociat cu pește sau cu un șnițel.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Served cool, with no mayonnaise, it is a refreshing side in the heat.',
            'Servită rece, fără maioneză, e o garnitură răcoritoare pe căldură.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Carbohydrates help refill energy; add a protein on the side.',
            'Carbohidrații ajută la refacerea energiei; adaugă o proteină alături.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Raw onion can be heavy on the stomach late at night.',
            'Ceapa crudă poate cădea greu pe stomac seara târziu.',
          ),
        },
      ],
    },
  ],
};
