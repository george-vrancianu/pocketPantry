import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Pui la ceaun base is the Romanian pot-cooked chicken: legs braised in
// lard and a little water, then fried in their own fat, with mujdei on the side.
// The Variants are two other garlic-forward chicken dishes, each a full Recipe
// with its own lines, steps and guidance. They inherit the base's tips about
// room in the pan and leftovers, and hide the ones about salting ahead and mujdei.
export const puiLaCeaun: BaseRecipeSeed = {
  slug: 'pui-la-ceaun',
  title: t(
    'Pui la ceaun (Romanian pot-fried chicken with garlic sauce)',
    'Pui la ceaun cu mujdei',
  ),
  servings: 4,
  prepMinutes: 40,
  cookMinutes: 60,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'chicken-leg-quarters',
      quantity: 1200,
      unit: 'g',
      note: t(
        '4 legs, cut at the joint into 8 pieces',
        '4 pulpe, tăiate la încheietură în 8 bucăți',
      ),
    },
    { ingredient: 'lard', quantity: 50, unit: 'g' },
    { ingredient: 'still-water', quantity: 0.15, unit: 'l' },
    {
      ingredient: 'salt',
      key: 'salt-chicken',
      quantity: 9,
      unit: 'g',
      note: t('for the chicken', 'pentru pui'),
    },
    { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
    { ingredient: 'savory', quantity: 2, unit: 'g', optional: true },
    { ingredient: 'paprika', quantity: 3, unit: 'g', optional: true },
    {
      ingredient: 'garlic',
      quantity: 30,
      unit: 'g',
      note: t('about 6 cloves, for the mujdei', 'cam 6 căței, pentru mujdei'),
    },
    {
      ingredient: 'salt',
      key: 'salt-mujdei',
      quantity: 2,
      unit: 'g',
      note: t('for the mujdei', 'pentru mujdei'),
    },
    {
      ingredient: 'still-water',
      key: 'water-mujdei',
      quantity: 0.06,
      unit: 'l',
      note: t('cold, for the mujdei', 'rece, pentru mujdei'),
    },
    {
      ingredient: 'sunflower-oil',
      quantity: 15,
      unit: 'ml',
      optional: true,
      note: t('for a milder mujdei', 'pentru un mujdei mai blând'),
    },
  ],
  steps: [
    {
      key: 'cut',
      text: t(
        'Cut each leg through the joint into a thigh and a drumstick, so you have 8 pieces. Pat them dry with paper towels.',
        'Taie fiecare pulpă la încheietură în două, pulpa superioară și pulpa inferioară, ca să ai 8 bucăți. Șterge-le cu un prosop de hârtie.',
      ),
    },
    {
      key: 'salt',
      text: t(
        'Rub the pieces with the chicken salt and the pepper, cover and leave them in the fridge for at least 30 minutes.',
        'Freacă bucățile cu sarea pentru pui și cu piperul, acoperă-le și lasă-le la frigider cel puțin 30 de minute.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'pot',
      text: t(
        'Put the lard in a heavy 28 to 30 cm pot with a lid (a ceaun or a Dutch oven), lay the chicken on top in a single layer and pour in the water. The heat is still off: the water goes in with the cold fat and the cold chicken, never into hot fat. Now wash your hands, the board and the knife with hot soapy water, before you touch anything else.',
        'Pune untura într-un ceaun sau o oală grea de 28-30 cm cu capac, așază puiul deasupra într-un singur strat și toarnă apa. Focul e încă stins: apa intră odată cu untura rece și cu puiul rece, niciodată peste grăsime încinsă. Acum spală-ți mâinile, tocătorul și cuțitul cu apă caldă și săpun, înainte să atingi altceva.',
      ),
    },
    {
      key: 'simmer',
      text: t(
        'Cover the pot and bring it to a gentle simmer over medium heat, about 5 minutes, until the lard has melted and you hear it bubbling quietly.',
        'Acoperă oala și adu-o la fierbere ușoară, la foc mediu, cam 5 minute, până se topește untura și se aude un clocot lin.',
      ),
    },
    {
      key: 'braise',
      text: t(
        'Turn the heat down to low-medium and cook, covered, for 30 minutes, turning the pieces every 10 minutes, until the meat is tender. For the last 10 minutes leave the lid ajar so the water can boil away.',
        'Dă focul la mic-mediu și gătește sub capac 30 de minute, întorcând bucățile din 10 în 10 minute, până când carnea e fragedă. În ultimele 10 minute lasă capacul întredeschis, ca apa să se evapore.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'mujdei',
      text: t(
        'While the chicken cooks, peel the garlic and crush it with the mujdei salt in a mortar, or press it, into a smooth paste. Stir in the cold water a little at a time, and the oil if you use it. Cover and keep it in the fridge until you serve.',
        'Cât timp se gătește puiul, curăță usturoiul și pisează-l cu sarea pentru mujdei în mojar, sau dă-l prin presă, până face o pastă fină. Adaugă apa rece puțin câte puțin, și uleiul dacă îl folosești. Acoperă și ține mujdeiul la frigider până servești.',
      ),
    },
    {
      key: 'fry',
      text: t(
        'Lift the lid tilted away from you, so the steam and drips go away from your face and hands. If any water is left, turn the heat to medium-high for up to 5 minutes until it boils off; stand back, because it spits as the last water goes. Then fry the chicken uncovered for about 15 minutes, turning every 4 to 5 minutes, until it is deep golden and crisp all over.',
        'Ridică capacul înclinându-l dinspre tine, ca aburul să nu vină spre tine. Dacă a mai rămas apă, dă focul la mediu-tare până la 5 minute, până se evaporă; dă-te înapoi, pentru că stropește când se duc ultimele picături. Apoi prăjește puiul fără capac cam 15 minute, întorcându-l la fiecare 4-5 minute, până se rumenește bine și devine crocant pe toate părțile.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'check',
      text: t(
        'Push a thermometer into the thickest piece, next to the bone without touching it: it should read 75 °C, and the juices should run clear. If not, fry for 3 more minutes and check again.',
        'Bagă un termometru în cea mai groasă bucată, lângă os, fără să atingă osul: trebuie să arate 75 °C, iar zeama să fie limpede. Dacă nu, mai prăjește 3 minute și verifică din nou.',
      ),
    },
    {
      key: 'season',
      text: t(
        'Take the pot off the heat. Sprinkle over the savory and the paprika, if you use them, and turn the pieces so they pick up the fat. Leave them to rest for 5 minutes.',
        'Ia oala de pe foc. Presară cimbrul și boiaua, dacă le folosești, și întoarce bucățile ca să se îmbibe cu grăsime. Lasă-le să se odihnească 5 minute.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'serve',
      text: t(
        'Lift the chicken onto a clean plate, never the one the raw chicken sat on, and serve it hot with mujdei and, if you like, mămăligă (see the pairing).',
        'Scoate puiul pe o farfurie curată, nu pe cea pe care a stat puiul crud, și servește-l cald cu mujdei și, dacă vrei, mămăligă.',
      ),
    },
  ],
  tips: [
    t(
      'Leave space between the pieces: crowded chicken steams instead of browning.',
      'Lasă loc între bucăți: puiul înghesuit se fierbe în abur în loc să se rumenească.',
    ),
    t(
      'Cool leftovers within 2 hours, keep them covered in the fridge for up to 3 days, and reheat until steaming hot all the way through.',
      'Răcește resturile în maximum 2 ore, ține-le acoperite la frigider până la 3 zile și încălzește-le până se încing bine peste tot.',
    ),
    t(
      'Salting the chicken ahead, even 30 minutes in the fridge, seasons it better than salting just before cooking; a few hours seasons it more deeply.',
      'Puiul sărat dinainte, chiar și doar 30 de minute la frigider, prinde mai bine gustul decât dacă îl sărezi chiar înainte de gătit; dacă îl lași câteva ore, sarea pătrunde mai adânc.',
    ),
    t(
      'Mujdei is raw garlic, so keep it cold: use it within a day or two and throw away what is left. Do not leave it out for more than 2 hours, and never keep garlic in oil at room temperature: that carries a botulism risk.',
      'Mujdeiul e usturoi crud, așa că ține-l la rece: consumă-l în una-două zile și aruncă ce rămâne. Nu-l lăsa afară mai mult de 2 ore și nu ține niciodată usturoi în ulei la temperatura camerei: există risc de botulism.',
    ),
  ],
  stepTips: [
    {
      step: 'braise',
      text: t(
        'Never add water once the fat is hot: it spits violently. If the pot seems dry before the meat is tender, lower the heat to the minimum and keep the lid shut.',
        'Nu turna apă peste grăsimea încinsă: stropește violent. Dacă oala pare uscată înainte ca carnea să fie fragedă, dă focul la minimum și ține capacul închis.',
      ),
    },
    {
      step: 'fry',
      text: t(
        'Let each side sit still for a few minutes before you turn it: the crust forms when the meat touches the pot undisturbed.',
        'Lasă fiecare parte nemișcată câteva minute înainte s-o întorci: crusta se formează când carnea stă netulburată pe fundul oalei.',
      ),
    },
    {
      step: 'mujdei',
      text: t(
        'Crushing the garlic with the salt breaks it down into a smooth paste that blends into the water. At the table, a spoonful of the juices or fat from the pot, once it has cooled a little, stirred into your own portion of mujdei is lovely.',
        'Usturoiul pisat cu sare se face pastă fină, care se amestecă bine cu apa. La masă, o lingură de zeamă sau de grăsime din oală, după ce s-a răcit puțin, amestecată în porția ta de mujdei e foarte bună.',
      ),
    },
  ],
  nutritionNote: t(
    'Plenty of protein from the chicken, but the skin and the lard add fat, much of it saturated, and the dish is salty once you add pickles or cheese. Mămăligă brings carbohydrate with little fibre, so serve it with fresh vegetables or a salad.',
    'Puiul aduce multe proteine, dar pielea și untura aduc multă grăsime, o bună parte din ea saturată, iar preparatul devine sărat odată ce adaugi murături sau brânză. Mămăliga aduce carbohidrați cu puține fibre, așa că servește-o cu legume proaspete sau cu o salată.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t(
        'Mămăligă with cheese and sour cream',
        'Mămăligă cu brânză și smântână',
      ),
      reason: t(
        'Pui la ceaun is often served with mămăligă, whose soft, plain taste soaks up the fat and the mujdei. Make the mămăligă; the cheese and sour cream are up to you.',
        'Puiul la ceaun se servește des cu mămăligă, al cărei gust moale și neutru absoarbe grăsimea și mujdeiul. Fă mămăliga; brânza și smântâna rămân la alegerea ta.',
      ),
      principle: 'regional_tradition',
      recipe: 'mamaliga',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sourness cuts through the rich, fried chicken.',
        'Aciditatea lor echilibrează gustul gras al puiului prăjit.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'food',
      label: t('Pickled peppers', 'Ardei murați'),
      reason: t(
        'Their sharp, crunchy bite contrasts with the soft meat and the mămăligă.',
        'Gustul lor acru și crocant contrastează cu carnea moale și cu mămăliga.',
      ),
      principle: 'contrast_texture',
      ingredient: 'pickled-peppers',
    },
    {
      kind: 'food',
      label: t('Tomato salad', 'Salată de roșii'),
      reason: t(
        'Fresh, juicy tomatoes lift the fat and add the vegetables the plate lacks.',
        'Roșiile proaspete și zemoase echilibrează grăsimea și adaugă legumele care lipsesc din farfurie.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'tomato',
    },
    {
      kind: 'drink',
      label: t('Cold beer', 'Bere rece'),
      reason: t(
        'Its bubbles and bitterness refresh the palate after fatty, garlicky bites.',
        'Bulele și amăreala ei împrospătează gustul după îmbucături grase, cu usturoi.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'beer',
    },
    {
      kind: 'drink',
      label: t('Red wine', 'Vin roșu'),
      reason: t(
        'A light red wine matches the savoury, golden meat without covering it.',
        'Un vin roșu ușor se potrivește cu carnea rumenă și savuroasă, fără s-o acopere.',
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
        'Hot, rich and filling, with mămăligă to warm you up.',
        'Cald, bogat și săturător, cu mămăligă care te încălzește.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Protein from the chicken helps muscles recover; the mămăligă adds carbohydrates.',
        'Proteinele din pui ajută mușchii să se refacă, iar mămăliga adaugă carbohidrați.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Fried chicken in lard sits heavy in the stomach during exercise.',
        'Puiul prăjit în untură cade greu la stomac în timpul efortului.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Fatty and heavy with raw garlic, it is hard to sleep on.',
        'E gras și greu, cu usturoi crud, și îți strică somnul.',
      ),
    },
  ],
  variants: [
    {
      slug: 'pui-la-ceaun-spanish',
      cuisine: 'spanish',
      title: t(
        'Pollo al ajillo (Spanish garlic chicken with white wine)',
        'Pollo al ajillo (pui cu usturoi și vin alb, ca în Spania)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 50,
      difficulty: 'easy',
      hideBaseTips: [2, 3],
      lines: [
        {
          ingredient: 'chicken-leg-quarters',
          quantity: 1200,
          unit: 'g',
          note: t(
            '4 legs, chopped through the bone into 4 to 5 cm pieces (or ask the butcher)',
            '4 pulpe, tăiate prin os în bucăți de 4-5 cm (sau roagă măcelarul)',
          ),
        },
        { ingredient: 'olive-oil', quantity: 80, unit: 'ml' },
        {
          ingredient: 'garlic',
          quantity: 60,
          unit: 'g',
          note: t(
            'one whole head, cloves unpeeled and lightly crushed',
            'un cap întreg, căței nedecojiți și ușor striviți',
          ),
        },
        { ingredient: 'bay-leaves', quantity: 0.4, unit: 'g' },
        {
          ingredient: 'thyme',
          quantity: 4,
          unit: 'g',
          note: t('3 to 4 sprigs', '3-4 crenguțe'),
        },
        {
          ingredient: 'dried-red-chillies',
          quantity: 1,
          unit: 'g',
          optional: true,
          note: t('1 small dried chilli', '1 ardei iute mic'),
        },
        { ingredient: 'white-wine', quantity: 150, unit: 'ml' },
        {
          ingredient: 'parsley',
          quantity: 10,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        { ingredient: 'salt', quantity: 8, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
      ],
      steps: [
        {
          key: 'prep',
          text: t(
            'Pat the chicken pieces dry and season them with the salt and pepper.',
            'Șterge bucățile de pui cu un prosop de hârtie și condimentează-le cu sare și piper.',
          ),
        },
        {
          key: 'brown',
          text: t(
            'Heat half of the oil in a wide 30 cm pan over medium-high heat. Brown half of the chicken, skin-side down first, for about 8 minutes, turning, until golden all over. Move the pieces to a plate, then brown the second batch with the rest of the oil and move it to the plate too. Wash your hands, the board and the knife with hot soapy water.',
            'Încălzește jumătate din ulei într-o tigaie lată de 30 cm, la foc mediu-tare. Rumenește jumătate din pui, întâi cu pielea în jos, cam 8 minute, întorcându-l, până se aurește pe toate părțile. Pune bucățile pe o farfurie, apoi rumenește a doua serie cu restul uleiului și pune-o tot pe farfurie. Spală-ți mâinile, tocătorul și cuțitul cu apă caldă și săpun.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'drain',
          text: t(
            'Turn the heat to low. Carefully pour off all but about 3 tablespoons of fat into a heatproof bowl. The plate holds half-cooked chicken that goes back into the pan, so do not serve from it.',
            'Dă focul la mic. Scurge cu grijă grăsimea într-un bol rezistent la căldură, lăsând în tigaie cam 3 linguri. Farfuria are pui pe jumătate gătit care se întoarce în tigaie, deci nu servi din ea.',
          ),
        },
        {
          key: 'garlic',
          text: t(
            'Add the garlic, bay, thyme and chilli, if you use it, and return all the chicken to the pan. Cook for 4 minutes, stirring now and then, until the garlic smells sweet and turns light golden. Do not let it go dark, or it turns bitter.',
            'Adaugă usturoiul, dafinul, cimbrișorul și ardeiul iute, dacă îl folosești, și pune tot puiul înapoi în tigaie. Gătește 4 minute, amestecând din când în când, până când usturoiul miroase dulce și se aurește ușor. Nu-l lăsa să se înnegrească, altfel devine amar.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'wine',
          text: t(
            'Take the pan off the heat and wait 30 seconds. Stand back and pour the wine in slowly around the edge: it hisses and steams. Put the pan back on medium heat.',
            'Ia tigaia de pe foc și așteaptă 30 de secunde. Dă-te un pas înapoi și toarnă vinul încet, pe lângă margine: sfârâie și scoate abur. Pune tigaia înapoi pe foc mediu.',
          ),
        },
        {
          key: 'reduce',
          text: t(
            'Simmer over low heat with the lid ajar for 20 minutes, turning the pieces now and then, until the wine has cooked down to a glossy, garlicky sauce that coats the chicken. If the pan looks dry before the time is up, put the lid on.',
            'Fierbe la foc mic, cu capacul întredeschis, 20 de minute, întorcând bucățile din când în când, până când vinul se reduce la un sos lucios, cu usturoi, care îmbracă puiul. Dacă tigaia pare uscată înainte de vreme, pune capacul.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'check',
          text: t(
            'Check the thickest piece, next to the bone: it should read 75 °C, and the juices should run clear. If not, simmer for 3 more minutes and check again. Scatter over the parsley and serve on a clean plate.',
            'Verifică cea mai groasă bucată, lângă os: trebuie să arate 75 °C, iar zeama să fie limpede. Dacă nu, mai fierbe 3 minute și verifică din nou. Presară pătrunjelul și servește pe o farfurie curată.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'drain',
          text: t(
            'Keep the poured-off fat in the fridge: it tastes of chicken and is good for roasting potatoes.',
            'Păstrează grăsimea scursă la frigider: are gust de pui și e bună pentru cartofi la cuptor.',
          ),
        },
      ],
      nutritionNote: t(
        'Olive oil is mostly unsaturated fat and the garlic and herbs add flavour without much salt, but the chicken skin still brings saturated fat, and the sauce is oily, so mop it up with a little bread. Add a salad for fibre, which the dish lacks.',
        'Uleiul de măsline este în mare parte grăsime nesaturată, iar usturoiul și ierburile dau gust fără multă sare, dar pielea de pui aduce totuși grăsime saturată, iar sosul e uleios, așa că șterge-l cu puțină pâine. Adaugă o salată pentru fibre, care lipsesc din preparat.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Baguette', 'Baghetă'),
          reason: t(
            'The crumb mops up the garlicky oil and wine sauce.',
            'Miezul ia cu el sosul de ulei, usturoi și vin.',
          ),
          principle: 'fat_carries_flavour',
          ingredient: 'baguette',
        },
        {
          kind: 'food',
          label: t('Spanish tapas platter', 'Platou spaniol de tapas'),
          reason: t(
            'Pollo al ajillo works as one tapa among several or as a main; put it beside the platter.',
            'Pollo al ajillo merge ca o tapa printre altele sau ca fel principal; pune-l lângă platou.',
          ),
          recipe: 'appetizer-platter-spanish',
        },
        {
          kind: 'food',
          label: t('Green salad', 'Salată verde'),
          reason: t(
            'Crisp, cool leaves add the freshness and fibre the plate lacks.',
            'Frunzele crocante și răcoroase aduc prospețimea și fibrele care lipsesc din farfurie.',
          ),
          principle: 'contrast_texture',
          ingredient: 'lettuce',
        },
        {
          kind: 'drink',
          label: t('Rosé wine', 'Vin rosé'),
          reason: t(
            'Its fresh acidity cuts the oil and keeps up with the garlic.',
            'Aciditatea lui proaspătă taie din ulei și ține pasul cu usturoiul.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'rose-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein helps muscles recover; add bread for carbohydrates.',
            'Proteinele ajută mușchii să se refacă; adaugă pâine pentru carbohidrați.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'The oily garlic sauce sits heavy in the stomach during exercise.',
            'Sosul uleios, cu usturoi, cade greu la stomac în timpul efortului.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Rich, garlicky and cooked with wine, it is a lot before bed.',
            'E bogat, cu mult usturoi și cu vin, deci prea mult înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'pui-la-ceaun-georgian',
      cuisine: 'georgian',
      title: t(
        'Chkmeruli (Georgian crisp chicken in garlic cream sauce)',
        'Chkmeruli (pui georgian crocant în sos de usturoi cu smântână)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 65,
      difficulty: 'medium',
      hideBaseTips: [2, 3],
      lines: [
        {
          ingredient: 'chicken-leg-quarters',
          quantity: 1200,
          unit: 'g',
          note: t('4 whole legs, skin on', '4 pulpe întregi, cu piele'),
        },
        {
          ingredient: 'butter',
          key: 'butter-sear',
          quantity: 30,
          unit: 'g',
          note: t('for searing', 'pentru rumenit'),
        },
        {
          ingredient: 'butter',
          key: 'butter-sauce',
          quantity: 30,
          unit: 'g',
          note: t('for the sauce', 'pentru sos'),
        },
        {
          ingredient: 'garlic',
          quantity: 50,
          unit: 'g',
          note: t('about 10 cloves, crushed', 'cam 10 căței, striviți'),
        },
        { ingredient: 'whipping-cream', quantity: 250, unit: 'ml' },
        { ingredient: 'milk', quantity: 0.1, unit: 'l', optional: true },
        { ingredient: 'salt', quantity: 8, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
        {
          ingredient: 'coriander',
          quantity: 15,
          unit: 'g',
          note: t('roughly chopped', 'tocat grosier'),
        },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 200 °C and wait about 15 minutes for it to come up to temperature while you prepare the chicken.',
            'Încinge cuptorul la 200 °C și așteaptă cam 15 minute să ajungă la temperatură cât pregătești puiul.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'prep',
          text: t(
            'Pat the legs very dry with paper towels and season them all over with the salt and pepper.',
            'Șterge pulpele foarte bine cu un prosop de hârtie și condimentează-le peste tot cu sare și piper.',
          ),
        },
        {
          key: 'sear',
          text: t(
            'Melt the searing butter in a heavy 30 cm ovenproof pan (cast iron works well) over medium heat. Lay the legs in skin-side down and sear for 10 to 12 minutes, without moving them, until the skin is deep golden and crisp. Wash your hands with hot soapy water.',
            'Topește untul pentru rumenit într-o tigaie grea de 30 cm, care intră la cuptor (merge bine una din fontă), la foc mediu. Așază pulpele cu pielea în jos și rumenește-le 10-12 minute, fără să le muți, până când pielea devine aurie închis și crocantă. Spală-ți mâinile cu apă caldă și săpun.',
          ),
          timerSeconds: 660,
        },
        {
          key: 'roast',
          text: t(
            'Turn the legs over and put the pan in the hot oven for 25 minutes, until the meat is cooked through. Use oven gloves: the handle stays hot after this.',
            'Întoarce pulpele și pune tigaia în cuptorul încins pentru 25 de minute, până când carnea e gătită. Folosește mănuși de bucătărie: mânerul rămâne fierbinte după asta.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'sauce',
          text: t(
            'In the last 10 minutes of roasting, melt the sauce butter in a small pan over medium-low heat and stir the garlic in for 1 to 2 minutes, until fragrant but not browned. Pour in the cream, and the milk if you use it, and simmer gently for 4 minutes, stirring, until slightly thickened.',
            'În ultimele 10 minute de coacere, topește untul pentru sos într-o cratiță mică la foc mic-mediu și călește usturoiul 1-2 minute, până miroase bine, fără să se rumenească. Toarnă smântâna lichidă, și laptele dacă îl folosești, și fierbe încet 4 minute, amestecând, până se îngroașă puțin.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'check',
          text: t(
            'Take the pan out of the oven and push a thermometer into the thickest part of a leg, next to the bone without touching it: it should read 75 °C, and the juices should run clear. If not, roast for 5 more minutes. Carefully spoon off most of the fat from the pan.',
            'Scoate tigaia din cuptor și bagă un termometru în partea cea mai groasă a unei pulpe, lângă os, fără să atingă osul: trebuie să arate 75 °C, iar zeama să fie limpede. Dacă nu, mai coace 5 minute. Scoate cu grijă cu lingura cea mai mare parte din grăsime din tigaie.',
          ),
        },
        {
          key: 'finish',
          text: t(
            'Take the pan off the heat and let it stand for 1 minute. Stand back and pour the hot garlic cream in slowly around the legs, not over the skin. Then set the pan over medium-low heat and let it bubble for 3 minutes so the flavours join and the skin stays crisp above the sauce.',
            'Ia tigaia de pe foc și lasă-o 1 minut să se liniștească. Dă-te înapoi și toarnă încet smântâna fierbinte cu usturoi în jurul pulpelor, nu peste piele. Apoi pune tigaia pe foc mic-mediu și lasă să bolborosească 3 minute ca să se lege gusturile, iar pielea să rămână crocantă deasupra sosului.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'serve',
          text: t(
            'Scatter the coriander over the top and serve straight from the pan, with bread for the sauce.',
            'Presară coriandrul deasupra și servește direct din tigaie, cu pâine pentru sos.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'sear',
          text: t(
            'Press the legs down for the first minute so all of the skin touches the pan; it crisps evenly that way.',
            'Apasă pulpele în primul minut, ca toată pielea să atingă tigaia; așa se rumenește uniform.',
          ),
        },
      ],
      nutritionNote: t(
        'Plenty of protein, but the butter and cream make this rich and high in saturated fat, and the skin adds more. A small portion with a fresh salad or a plain vegetable balances it, and the bread for the sauce adds carbohydrate but little fibre.',
        'Conține multe proteine, dar untul și smântâna îl fac bogat și cu multe grăsimi saturate, iar pielea adaugă și mai multe. O porție mică, cu o salată proaspătă sau cu o legumă simplă, îl echilibrează, iar pâinea pentru sos aduce carbohidrați, dar puține fibre.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Fresh bread', 'Pâine proaspătă'),
          reason: t(
            'It mops up the garlic cream sauce from the pan.',
            'Șterge din tigaie sosul de smântână cu usturoi.',
          ),
          principle: 'fat_carries_flavour',
          ingredient: 'bread',
        },
        {
          kind: 'food',
          label: t('Tomato salad', 'Salată de roșii'),
          reason: t(
            'Fresh tomatoes cut the cream and butter with their acidity.',
            'Roșiile proaspete taie din smântână și din unt cu aciditatea lor.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'tomato',
        },
        {
          kind: 'food',
          label: t('Cucumber', 'Castraveți'),
          reason: t(
            'Cool, crisp slices contrast with the crisp-skinned, creamy chicken.',
            'Rondelele reci și crocante fac contrast cu puiul cremos, cu piele crocantă.',
          ),
          principle: 'contrast_texture',
          ingredient: 'cucumber',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its acidity cleans the palate after cream and garlic.',
            'Aciditatea lui curăță gustul după smântână și usturoi.',
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
            'A hot, creamy, garlicky dish that warms you from the inside.',
            'Un fel cald, cremos, cu usturoi, care te încălzește pe dinăuntru.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein helps muscles recover; the bread adds carbohydrates.',
            'Proteinele ajută mușchii să se refacă, iar pâinea adaugă carbohidrați.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Cream and butter sit heavy in the stomach during exercise.',
            'Smântâna și untul cad greu la stomac în timpul efortului.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Very rich and garlicky, it is hard to sleep on.',
            'Foarte bogat și cu mult usturoi, îți strică somnul.',
          ),
        },
      ],
    },
  ],
};
