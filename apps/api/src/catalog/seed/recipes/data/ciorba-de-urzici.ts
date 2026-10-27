import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Ciorbă de urzici base is the Romanian spring soup of young nettle tops:
// a fasting (de post) pot of onion, rice and blanched nettles, soured with
// borș and finished with raw garlic and lovage, with no egg and no dairy in
// the pot. Each Variant is a full Recipe with its own lines, steps and
// guidance. The Swedish nässelsoppa is a roux soup served with halved boiled
// eggs; the British one is a blended potato and leek soup finished with cream.
// The base's first Recipe-level Tip (nettle handling) holds in both Variants.
// The other three are about borș, the fasting pot and the rice, so both
// Variants hide them.
export const ciorbaDeUrzici: BaseRecipeSeed = {
  slug: 'ciorba-de-urzici',
  title: t(
    'Romanian nettle sour soup with rice and garlic (ciorbă de urzici)',
    'Ciorbă de urzici cu orez și usturoi',
  ),
  servings: 6,
  prepMinutes: 30,
  cookMinutes: 50,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'nettles',
      quantity: 500,
      unit: 'g',
      note: t(
        'young tops only, picked over and washed with gloves on',
        'doar vârfuri tinere, alese și spălate cu mănuși',
      ),
    },
    { ingredient: 'sunflower-oil', quantity: 60, unit: 'ml' },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('finely diced', 'tăiate mărunt'),
    },
    {
      ingredient: 'spring-onion',
      quantity: 100,
      unit: 'g',
      note: t('chopped', 'tocată'),
    },
    {
      ingredient: 'carrot',
      quantity: 150,
      unit: 'g',
      optional: true,
      note: t('diced small', 'tăiat cubulețe'),
    },
    {
      ingredient: 'still-water',
      quantity: 5.5,
      unit: 'l',
      note: t(
        '3 l to blanch the nettles (poured away), 2.5 l for the soup',
        '3 l pentru opărit urzicile (se aruncă), 2,5 l pentru ciorbă',
      ),
    },
    {
      ingredient: 'rice',
      quantity: 70,
      unit: 'g',
      note: t('rinsed', 'spălat'),
    },
    {
      ingredient: 'ciorba-sour-base',
      quantity: 600,
      unit: 'ml',
      note: t(
        'borș: 400 ml first, up to 200 ml more, to taste',
        'borș: întâi 400 ml, apoi până la 200 ml în plus, după gust',
      ),
    },
    {
      ingredient: 'garlic',
      quantity: 20,
      unit: 'g',
      note: t('crushed, about 5 cloves', 'zdrobit, cam 5 căței'),
    },
    {
      ingredient: 'lovage',
      quantity: 20,
      unit: 'g',
      note: t('fresh, chopped', 'proaspăt, tocat'),
    },
    {
      ingredient: 'salt',
      quantity: 30,
      unit: 'g',
      note: t(
        '15 g for the blanching water (poured away), 10 g with the soup water, the rest at the end to taste',
        '15 g la apa de opărit (se aruncă), 10 g la apa ciorbei, restul la final, după gust',
      ),
    },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
    {
      ingredient: 'sour-cream',
      quantity: 150,
      unit: 'g',
      optional: true,
      note: t('a spoonful in each bowl', 'o lingură în fiecare bol'),
    },
  ],
  steps: [
    {
      key: 'prep',
      text: t(
        'Put on rubber or thick kitchen gloves. Tip the nettles onto a tray and pick them over leaf by leaf, keeping the young tops and dropping anything that is not nettle, any thick stems and any flowering stalks. Wash them in 3 or 4 changes of cold water, lifting them out each time and leaving the grit behind, and move them with tongs. Dice the onions and the carrot, if using, and chop the spring onion and the lovage. Crush the garlic and keep it aside.',
        'Pune-ți mănuși de cauciuc sau mănuși groase de bucătărie. Răstoarnă urzicile pe o tavă și alege-le frunză cu frunză: păstrează vârfurile tinere și scoate tot ce nu e urzică, tulpinile groase și lăstarii înfloriți. Spală-le în 3 sau 4 ape reci, scoțându-le de fiecare dată din apă și lăsând nisipul în fund, și mută-le cu cleștele. Taie ceapa și morcovul, dacă îl folosești, cubulețe și toacă ceapa verde și leușteanul. Zdrobește usturoiul și ține-l deoparte.',
      ),
    },
    {
      key: 'blanch-water',
      text: t(
        'Put 3 l of water and 15 g of the salt in a pot of at least 5 l over high heat and bring it to the boil, about 10 minutes. Do the next step while it heats.',
        'Pune 3 l de apă și 15 g din sare într-o oală de cel puțin 5 l la foc mare și adu la fierbere, cam 10 minute. Fă pasul următor cât se încălzește apa.',
      ),
    },
    {
      key: 'soften',
      text: t(
        'Heat the oil in a pot of at least 6 l over medium-low heat. Add the onions, the spring onion and the carrot, if using, and cook for 8 minutes, stirring often, until soft and shiny but not browned.',
        'Încinge uleiul într-o oală de cel puțin 6 l la foc mic spre mediu. Adaugă ceapa, ceapa verde și morcovul, dacă îl folosești, și călește 8 minute, amestecând des, până se înmoaie și devin lucioase, fără să se rumenească.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'soup-water',
      text: t(
        'Pour 2.5 l of water and 10 g of the salt into the big pot and bring it to the boil over high heat, about 10 minutes. Do the next two steps while it heats.',
        'Toarnă 2,5 l de apă și 10 g din sare în oala mare și adu la fierbere la foc mare, cam 10 minute. Fă următorii doi pași cât se încălzește apa.',
      ),
    },
    {
      key: 'blanch',
      text: t(
        'Once the blanching water is boiling, push half of the nettles under the water with tongs and blanch them for 2 minutes, until limp and dark green. Lift them out into a colander with a skimmer and blanch the second half the same way.',
        'Când apa de opărit fierbe, scufundă jumătate din urzici cu cleștele și opărește-le 2 minute, până se moaie și devin verde închis. Scoate-le cu o spumieră într-o strecurătoare și opărește la fel a doua jumătate.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'chop',
      text: t(
        'Pour the blanching water down the sink; it is not used. Rinse the nettles under cold water for a minute. Cooking takes away the sting, so once they have cooled you can handle them bare-handed: squeeze out the water and chop them coarsely.',
        'Varsă apa de opărit în chiuvetă; nu se mai folosește. Clătește urzicile sub jet de apă rece un minut. Prin fierbere își pierd înțepătura, așa că după ce se răcesc le poți lua cu mâna goală: stoarce-le de apă și toacă-le mare.',
      ),
    },
    {
      key: 'rice',
      text: t(
        'When the soup water boils, add the rice and simmer gently for 15 minutes, until the rice is tender and the carrot, if using, is soft.',
        'Când apa ciorbei fierbe, adaugă orezul și fierbe domol 15 minute, până când orezul e fiert și morcovul, dacă l-ai pus, e moale.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'nettles',
      text: t(
        'Stir the chopped nettles into the pot and simmer for 5 minutes.',
        'Amestecă urzicile tocate în oală și fierbe 5 minute.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'bors',
      text: t(
        'While the nettles simmer, bring 400 ml of the borș to the boil in a small pot. Pour the hot borș into the soup and simmer for 3 minutes.',
        'Cât fierbe ciorba cu urzici, adu la fierbere 400 ml din borș într-o oală mică. Toarnă borșul fierbinte în ciorbă și fierbe 3 minute.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'taste',
      text: t(
        'Taste. If the soup is not sour enough, bring some of the remaining 200 ml of borș to the boil in the small pot and add it a little at a time, then add salt if it needs it.',
        'Gustă. Dacă ciorba nu e destul de acră, fierbe în oala mică o parte din cei 200 ml de borș rămași și adaug-o puțin câte puțin, apoi pune sare dacă mai trebuie.',
      ),
    },
    {
      key: 'garlic',
      text: t(
        'Take the pot off the heat. Stir in the crushed garlic, cover and leave for 2 minutes.',
        'Ia oala de pe foc. Amestecă usturoiul zdrobit, acoperă și lasă 2 minute.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'finish',
      text: t(
        'Stir in the lovage and the pepper. Ladle into hot bowls and serve at once, with a spoonful of sour cream in each bowl if you like.',
        'Amestecă leușteanul și piperul. Servește imediat, în boluri calde, cu o lingură de smântână în fiecare, dacă vrei.',
      ),
    },
    {
      key: 'store',
      text: t(
        'Cool the leftovers and divide them into shallow containers so they cool quickly, and put them in the fridge within 2 hours. Because the soup has rice in it, eat it within 1 day and reheat it only once, gently, until steaming.',
        'Răcește ce rămâne, împărțit în recipiente puțin adânci ca să se răcească repede, și pune-l la frigider în cel mult 2 ore. Fiindcă ciorba conține orez, consum-o în cel mult o zi și încălzește-o o singură dată, ușor, până scoate aburi.',
      ),
    },
  ],
  tips: [
    t(
      'Wear gloves to pick, sort and wash raw nettles, and use only the young tops (the top 4 to 6 leaves) picked before the plant flowers. Pick well away from roads, dog-walking verges and any ground that may have been sprayed with weedkiller or pesticide, or buy them from a market stall. Once blanched they no longer sting.',
      'Poartă mănuși când alegi, sortezi și speli urzicile crude și folosește doar vârfurile tinere (primele 4-6 frunze), culese înainte să înflorească planta. Culege-le departe de drumuri, de marginile unde sunt scoși câinii la plimbare și de orice teren care poate fi stropit cu ierbicide sau pesticide, sau cumpără-le de la piață. După ce sunt opărite nu mai înțeapă.',
    ),
    t(
      'Borș differs a lot from one brand to another, so build the sourness in two goes and taste after each; you cannot take it back out. Add it once the rice is tender.',
      'Borșul diferă mult de la o marcă la alta, așa că acrește ciorba în două rânduri și gustă după fiecare; acreala nu se mai scoate. Pune-l după ce orezul e fiert.',
    ),
    t(
      'The pot itself has no egg and no dairy, so it fits fasting days (de post). The sour cream is only for the bowl, so leave it out on fasting days.',
      'Ciorba propriu-zisă nu conține ouă sau lactate, deci e bună în zilele de post. Smântâna se pune doar în bol, așa că în zilele de post las-o deoparte.',
    ),
    t(
      'Borș is made with wheat bran, so it contains gluten, and the sour cream is milk. If you avoid gluten, check the label of the borș you buy; if you avoid milk, leave out the sour cream.',
      'Borșul se face cu tărâțe de grâu, deci conține gluten, iar smântâna e lapte. Dacă eviți glutenul, citește eticheta borșului pe care îl cumperi; dacă eviți laptele, nu pune smântână.',
    ),
  ],
  stepTips: [
    {
      step: 'blanch',
      text: t(
        'Blanch in two batches so the water comes back to the boil quickly. The leaves float, so keep pushing them under with the tongs.',
        'Opărește-le în două rânduri, ca apa să revină repede la fiert. Frunzele plutesc, așa că le tot scufunzi cu cleștele.',
      ),
    },
    {
      step: 'garlic',
      text: t(
        'Garlic added off the heat keeps its bite and its smell; boiled for long it turns dull.',
        'Usturoiul pus după ce iei oala de pe foc își păstrează iuțeala și mirosul; dacă fierbe mult, se înmoaie și își pierde gustul.',
      ),
    },
  ],
  nutritionNote: t(
    'Nettles, onion and carrot make a light green soup with some fibre, and the oil is mostly unsaturated. The rice gives starch but little protein, so it suits a first course or a light lunch. Borș and added salt make it salty, so season at the end; sour cream, if you add it, brings saturated fat.',
    'Urzicile, ceapa și morcovul fac o ciorbă verde și ușoară, cu fibre, iar uleiul e în mare parte nesaturat. Orezul dă amidon, dar puține proteine, așa că ciorba se potrivește ca fel întâi sau la un prânz ușor. Borșul și sarea o fac sărată, așa că sărează la final; smântâna, dacă o pui, aduce grăsimi saturate.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Fresh bread', 'Pâine proaspătă'),
      reason: t(
        'A crusty slice soaks up the sour, green broth.',
        'O felie cu crustă se îmbibă cu zeama acrișoară și verde.',
      ),
      principle: 'contrast_texture',
      ingredient: 'bread',
    },
    {
      kind: 'food',
      label: t('Fresh hot pepper', 'Ardei iute proaspăt'),
      reason: t(
        'A bite of hot pepper sharpens the sour, mild-tasting soup.',
        'O îmbucătură de ardei iute ascute gustul blând și acrișor al ciorbei.',
      ),
      principle: 'complement_flavour',
      ingredient: 'hot-pepper',
    },
  ],
  eatingMoments: [
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'A light green soup that is filling enough with a slice of bread.',
        'O supă verde și ușoară, destul de săturătoare cu o felie de pâine.',
      ),
    },
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'Hot and sour, it warms you through.',
        'Fierbinte și acrișoară, te încălzește.',
      ),
    },
  ],
  variants: [
    {
      slug: 'ciorba-de-urzici-scandinavian',
      cuisine: 'scandinavian',
      title: t(
        'Nässelsoppa (Swedish nettle soup with egg halves)',
        'Nässelsoppa (supă suedeză de urzici cu jumătăți de ou)',
      ),
      servings: 4,
      prepMinutes: 25,
      cookMinutes: 50,
      difficulty: 'easy',
      hideBaseTips: [1, 2, 3],
      lines: [
        {
          ingredient: 'nettles',
          quantity: 300,
          unit: 'g',
          note: t(
            'young tops only, picked over and washed with gloves on',
            'doar vârfuri tinere, alese și spălate cu mănuși',
          ),
        },
        {
          ingredient: 'still-water',
          quantity: 3,
          unit: 'l',
          note: t(
            '2 l to blanch the nettles (poured away), 1 l to boil the eggs',
            '2 l pentru opărit urzicile (se aruncă), 1 l pentru fiert ouăle',
          ),
        },
        {
          ingredient: 'eggs',
          quantity: 4,
          unit: 'pcs',
          note: t(
            'hard-boiled, peeled and halved',
            'fierte tari, curățate și tăiate în jumătăți',
          ),
        },
        { ingredient: 'butter', quantity: 40, unit: 'g' },
        {
          ingredient: 'flour',
          quantity: 30,
          unit: 'g',
          note: t('about 3 tbsp', 'cam 3 linguri'),
        },
        {
          ingredient: 'vegetable-stock',
          quantity: 1.2,
          unit: 'l',
          note: t('made up', 'pregătită'),
        },
        {
          ingredient: 'whipping-cream',
          quantity: 100,
          unit: 'ml',
          optional: true,
        },
        {
          ingredient: 'chives',
          quantity: 15,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        {
          ingredient: 'salt',
          quantity: 12,
          unit: 'g',
          note: t(
            '10 g for the blanching water (poured away), up to 2 g at the end to taste, as the stock is already salty',
            '10 g la apa de opărit (se aruncă), cel mult 2 g la final, după gust, fiindcă supa de legume e deja sărată',
          ),
        },
        { ingredient: 'white-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'prep',
          text: t(
            'Put on rubber or thick kitchen gloves. Tip the nettles onto a tray and pick them over leaf by leaf, keeping the young tops and dropping anything that is not nettle, any thick stems and any flowering stalks. Wash them in 3 or 4 changes of cold water, lifting them out each time and leaving the grit behind, and move them with tongs. Chop the chives.',
            'Pune-ți mănuși de cauciuc sau mănuși groase de bucătărie. Răstoarnă urzicile pe o tavă și alege-le frunză cu frunză: păstrează vârfurile tinere și scoate tot ce nu e urzică, tulpinile groase și lăstarii înfloriți. Spală-le în 3 sau 4 ape reci, scoțându-le de fiecare dată din apă și lăsând nisipul în fund, și mută-le cu cleștele. Toacă arpagicul.',
          ),
        },
        {
          key: 'eggs',
          text: t(
            'Put the eggs in a small pot, cover them with cold water by about 2 cm (about 1 l) and bring to the boil over high heat, about 8 minutes.',
            'Pune ouăle într-o oală mică, acoperă-le cu apă rece cam 2 cm (cam 1 l) și adu la fierbere la foc mare, cam 8 minute.',
          ),
        },
        {
          key: 'eggs-cook',
          text: t(
            'Once the water boils, turn the heat to medium and cook the eggs for 9 minutes, until the yolks are completely firm. While they cook, put 2 l of water and 10 g of the salt in a pot of at least 4 l over high heat and bring it to the boil, about 8 minutes.',
            'Când apa fierbe, dă focul la mediu și fierbe ouăle 9 minute, până când gălbenușurile se întăresc complet. Cât fierb, pune 2 l de apă și 10 g din sare într-o oală de cel puțin 4 l la foc mare și adu la fierbere, cam 8 minute.',
          ),
          timerSeconds: 540,
        },
        {
          key: 'eggs-cool',
          text: t(
            'Lift the eggs into a bowl of cold water and leave them to cool.',
            'Scoate ouăle într-un bol cu apă rece și lasă-le să se răcească.',
          ),
        },
        {
          key: 'blanch',
          text: t(
            'Push half of the nettles under the boiling water with tongs and blanch them for 2 minutes, until limp and dark green. Lift them out into a colander with a skimmer and blanch the second half the same way.',
            'Scufundă jumătate din urzici în apa clocotită cu cleștele și opărește-le 2 minute, până se moaie și devin verde închis. Scoate-le cu o spumieră într-o strecurătoare și opărește la fel a doua jumătate.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'chop',
          text: t(
            'Pour the blanching water down the sink; it is not used. Rinse the nettles under cold water for a minute. Cooking takes away the sting, so once they have cooled you can handle them bare-handed: squeeze out the water and chop them finely. Peel the eggs and halve them.',
            'Varsă apa de opărit în chiuvetă; nu se mai folosește. Clătește urzicile sub jet de apă rece un minut. Prin fierbere își pierd înțepătura, așa că după ce se răcesc le poți lua cu mâna goală: stoarce-le de apă și toacă-le mărunt. Curăță ouăle și taie-le în jumătăți.',
          ),
        },
        {
          key: 'roux',
          text: t(
            'Melt the butter in a pot of at least 3 l over medium-low heat. Whisk in the flour and cook for 2 minutes, stirring, until it smells cooked rather than floury and is still pale.',
            'Topește untul într-o oală de cel puțin 3 l la foc mic spre mediu. Amestecă făina cu telul și călește 2 minute, amestecând, până nu mai miroase a făină crudă, dar e tot deschis la culoare.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'stock',
          text: t(
            'Pour in the stock a splash at a time, whisking until smooth after each. Bring to the boil over medium heat, about 10 minutes, then simmer for 5 minutes, until it coats the back of a spoon lightly.',
            'Toarnă supa de legume câte puțin, amestecând cu telul până se omogenizează după fiecare adaos. Adu la fierbere la foc mediu, cam 10 minute, apoi fierbe 5 minute, până când acoperă ușor dosul lingurii.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'nettles',
          text: t(
            'Stir in the chopped nettles and simmer for 3 minutes. Stir in the cream, if using, and season with the white pepper and salt, if needed. Heat until steaming; do not let it boil hard.',
            'Amestecă urzicile tocate și fierbe 3 minute. Adaugă smântâna lichidă, dacă o folosești, și condimentează cu piperul alb și sare, dacă mai trebuie. Încălzește până scoate aburi; nu o lăsa să fiarbă tare.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'serve',
          text: t(
            'Ladle into hot bowls, put 2 egg halves in each and scatter over the chives. Serve at once.',
            'Servește în boluri calde, cu câte 2 jumătăți de ou în fiecare și arpagic presărat deasupra. Servește imediat.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Cool the leftovers and divide them into shallow containers so they cool quickly, and put them in the fridge within 2 hours, with any leftover eggs. Keep for up to 3 to 4 days, and reheat the soup gently until steaming.',
            'Răcește ce rămâne, împărțit în recipiente puțin adânci ca să se răcească repede, și pune-l la frigider în cel mult 2 ore, împreună cu ouăle rămase. Se păstrează 3-4 zile; încălzește supa ușor, până scoate aburi.',
          ),
        },
      ],
      tips: [
        t(
          'Contains gluten (flour), milk (butter, cream), eggs and celery (the stock concentrate); check the stock label.',
          'Conține gluten (făina), lapte (untul, smântâna lichidă), ouă și țelină (supa concentrată de legume); citește eticheta supei.',
        ),
      ],
      stepTips: [
        {
          step: 'stock',
          text: t(
            'The roux first turns into a stiff paste, then loosens as the stock goes in. Adding the stock a splash at a time and whisking is what keeps it free of lumps.',
            'Rântașul se face întâi o pastă tare, apoi se desface pe măsură ce intră supa. Adăugarea supei câte puțin, cu amestecare, îl ferește de cocoloașe.',
          ),
        },
        {
          step: 'nettles',
          text: t(
            'Keep the simmer short: nettles lose their fresh green colour the longer they cook.',
            'Ține fierberea scurtă: cu cât se gătesc mai mult, cu atât urzicile pierd din verdele proaspăt.',
          ),
        },
      ],
      nutritionNote: t(
        'Nettles and stock make a light base, but the butter and the optional cream bring saturated fat, and the flour is refined starch. The boiled eggs add protein, which makes it more filling, especially with rye bread. The stock is salty, so season at the end.',
        'Urzicile și supa de legume fac o bază ușoară, dar untul și smântâna lichidă, dacă o pui, aduc grăsimi saturate, iar făina e amidon rafinat. Ouăle fierte adaugă proteine, așa că supa e mai săturătoare, mai ales cu pâine de secară. Supa de legume e sărată, așa că sărează la final.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Rye bread', 'Pâine de secară'),
          reason: t(
            'Its dense crumb and tang go well with the mild, buttery soup and the egg.',
            'Miezul dens și gustul ușor acrișor se potrivesc cu supa blândă și untoasă și cu oul.',
          ),
          principle: 'complement_flavour',
          ingredient: 'rye-bread',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'The egg makes it a filling lunch without being heavy.',
            'Cu ou, supa devine un prânz săturător, fără să fie grea.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, buttery bowl warms you through.',
            'Un bol fierbinte și untos te încălzește.',
          ),
        },
      ],
    },
    {
      slug: 'ciorba-de-urzici-british',
      cuisine: 'british',
      title: t(
        'British nettle and potato soup',
        'Supă-cremă britanică de urzici cu cartofi',
      ),
      servings: 4,
      prepMinutes: 25,
      cookMinutes: 45,
      difficulty: 'easy',
      hideBaseTips: [1, 2, 3],
      lines: [
        {
          ingredient: 'nettles',
          quantity: 200,
          unit: 'g',
          note: t(
            'young tops only, picked over and washed with gloves on',
            'doar vârfuri tinere, alese și spălate cu mănuși',
          ),
        },
        {
          ingredient: 'still-water',
          quantity: 2,
          unit: 'l',
          note: t(
            'to blanch the nettles (poured away)',
            'pentru opărit urzicile (se aruncă)',
          ),
        },
        { ingredient: 'butter', quantity: 30, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely diced', 'tăiată mărunt'),
        },
        {
          ingredient: 'leek',
          quantity: 150,
          unit: 'g',
          note: t(
            'white and pale green part, sliced, washed',
            'partea albă și verde-deschis, tăiată rondele, spălată',
          ),
        },
        {
          ingredient: 'potato',
          quantity: 0.35,
          unit: 'kg',
          note: t(
            'peeled, cut into 2 cm dice',
            'curățați, tăiați cubulețe de 2 cm',
          ),
        },
        {
          ingredient: 'vegetable-stock',
          quantity: 1,
          unit: 'l',
          note: t('made up, hot', 'pregătită, fierbinte'),
        },
        {
          ingredient: 'whipping-cream',
          quantity: 100,
          unit: 'ml',
        },
        {
          ingredient: 'nutmeg',
          quantity: 0.5,
          unit: 'g',
          optional: true,
          note: t('ground, a pinch', 'măcinată, un praf'),
        },
        {
          ingredient: 'salt',
          quantity: 12,
          unit: 'g',
          note: t(
            '10 g for the blanching water (poured away), the rest at the end to taste, as the stock is already salty',
            '10 g la apa de opărit (se aruncă), restul la final, după gust, fiindcă supa de legume e deja sărată',
          ),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'prep',
          text: t(
            'Put on rubber or thick kitchen gloves. Tip the nettles onto a tray and pick them over leaf by leaf, keeping the young tops and dropping anything that is not nettle, any thick stems and any flowering stalks. Wash them in 3 or 4 changes of cold water, lifting them out each time and leaving the grit behind, and move them with tongs. Dice the onion, slice and wash the leek, and peel and dice the potatoes.',
            'Pune-ți mănuși de cauciuc sau mănuși groase de bucătărie. Răstoarnă urzicile pe o tavă și alege-le frunză cu frunză: păstrează vârfurile tinere și scoate tot ce nu e urzică, tulpinile groase și lăstarii înfloriți. Spală-le în 3 sau 4 ape reci, scoțându-le de fiecare dată din apă și lăsând nisipul în fund, și mută-le cu cleștele. Taie ceapa cubulețe, taie prazul rondele și spală-l, apoi curăță și taie cartofii cubulețe.',
          ),
        },
        {
          key: 'stock',
          text: t(
            'Heat the stock in a small pan until hot, about 5 minutes, then keep it on the lowest heat.',
            'Încălzește supa de legume într-o oală mică până e fierbinte, cam 5 minute, apoi ține-o pe cel mai mic foc.',
          ),
        },
        {
          key: 'sweat',
          text: t(
            'Melt the butter in a pot of at least 3 l over medium-low heat. Add the onion and the leek and cook for 8 minutes, stirring often, until soft but not browned.',
            'Topește untul într-o oală de cel puțin 3 l la foc mic spre mediu. Adaugă ceapa și prazul și călește 8 minute, amestecând des, până se înmoaie, fără să se rumenească.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'potato',
          text: t(
            'Add the potatoes and the hot stock, bring to the boil and simmer gently for 15 minutes, until a knife slides into the potato without resistance. If not, simmer a few minutes more and check again. Do the next step while the potatoes simmer.',
            'Adaugă cartofii și supa fierbinte, adu la fierbere și fierbe domol 15 minute, până când un cuțit intră în cartof fără rezistență. Dacă nu, mai fierbe câteva minute și verifică din nou. Fă pasul următor cât fierb cartofii.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'blanch-water',
          text: t(
            'Put 2 l of water and 10 g of the salt in a pot of at least 4 l over high heat and bring it to the boil, about 8 minutes.',
            'Pune 2 l de apă și 10 g din sare într-o oală de cel puțin 4 l la foc mare și adu la fierbere, cam 8 minute.',
          ),
        },
        {
          key: 'blanch',
          text: t(
            'Once the blanching water is boiling, and while the potatoes still simmer, push the nettles under the water with tongs and blanch them for 2 minutes, until limp and dark green. Lift them out into a colander with a skimmer.',
            'Când apa de opărit fierbe, cât mai fierb cartofii, scufundă urzicile cu cleștele și opărește-le 2 minute, până se moaie și devin verde închis. Scoate-le cu o spumieră într-o strecurătoare.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'chop',
          text: t(
            'Pour the blanching water down the sink; it is not used. Rinse the nettles under cold water for a minute. Cooking takes away the sting, so once they have cooled you can handle them bare-handed: squeeze out the water and chop them roughly.',
            'Varsă apa de opărit în chiuvetă; nu se mai folosește. Clătește urzicile sub jet de apă rece un minut. Prin fierbere își pierd înțepătura, așa că după ce se răcesc le poți lua cu mâna goală: stoarce-le de apă și toacă-le mare.',
          ),
        },
        {
          key: 'nettles',
          text: t(
            'Stir the chopped nettles into the soup and simmer for 2 minutes.',
            'Amestecă urzicile tocate în supă și fierbe 2 minute.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'blend',
          text: t(
            'Take the pot off the heat and let the bubbling stop. Blend with a stick blender until smooth and bright green.',
            'Ia oala de pe foc și așteaptă să nu mai bolborosească. Mixează cu mixerul vertical până se omogenizează și devine verde intens.',
          ),
        },
        {
          key: 'cream',
          text: t(
            'Stir in the cream and the nutmeg, if using. Put the pot back over low heat for 3 minutes, until hot and steaming; do not let it boil hard. Season with pepper and, if needed, salt.',
            'Amestecă smântâna lichidă și nucșoara, dacă o folosești. Pune oala la loc pe foc mic 3 minute, până când supa e fierbinte și scoate aburi; nu o lăsa să fiarbă tare. Condimentează cu piper și, dacă mai trebuie, cu sare.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'serve',
          text: t(
            'Ladle into hot bowls and serve at once. Cool leftovers and put them in the fridge within 2 hours; keep for up to 3 to 4 days.',
            'Servește imediat, în boluri calde. Răcește ce rămâne și pune-l la frigider în cel mult 2 ore; se păstrează 3-4 zile.',
          ),
        },
      ],
      tips: [
        t(
          'The potato thickens the soup as it cools, so loosen it with a splash of stock or water when you reheat it, gently, until steaming.',
          'Cartoful îngroașă supa pe măsură ce se răcește, așa că, la încălzire, subțiaz-o cu puțină supă sau apă și încălzește-o ușor, până scoate aburi.',
        ),
        t(
          'Contains milk (butter, cream) and celery (the stock concentrate); check the stock label.',
          'Conține lapte (untul, smântâna lichidă) și țelină (supa concentrată de legume); citește eticheta supei.',
        ),
      ],
      stepTips: [
        {
          step: 'blend',
          text: t(
            'Use a stick blender in the pot, or blend in batches in a jug blender filled no more than half: take out the centre cap, cover the hole with a folded tea towel and start on the lowest speed. Steam builds up under a sealed lid and can blow it off.',
            'Folosește un mixer vertical în oală sau mixează pe porții într-un blender cu vas, umplut cel mult pe jumătate: scoate dopul din mijlocul capacului, acoperă orificiul cu un prosop de bucătărie împăturit și pornește la viteza cea mai mică. Aburul se adună sub un capac închis ermetic și îl poate arunca.',
          ),
        },
        {
          step: 'nettles',
          text: t(
            'Keep the simmer short: nettles lose their fresh green colour the longer they cook.',
            'Ține fierberea scurtă: cu cât se gătesc mai mult, cu atât urzicile pierd din verdele proaspăt.',
          ),
        },
      ],
      nutritionNote: t(
        'Potato makes it filling, and the leek, onion and nettles add fibre. The butter and the cream bring most of the saturated fat, so keep the cream modest. The stock and salt make it salty, so season at the end. It is low in protein, so it suits a starter or a light lunch with bread.',
        'Cartofii o fac săturătoare, iar prazul, ceapa și urzicile adaugă fibre. Untul și smântâna lichidă aduc cea mai mare parte din grăsimile saturate, așa că pune smântână puțină. Supa de legume și sarea o fac sărată, așa că sărează la final. Are puține proteine, deci se potrivește ca fel întâi sau la un prânz ușor, cu pâine.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Country bread', 'Pâine de casă'),
          reason: t(
            'A crusty slice gives the smooth soup something to bite against.',
            'O felie cu coajă crocantă face contrast cu supa fină.',
          ),
          principle: 'contrast_texture',
          ingredient: 'country-bread',
        },
        {
          kind: 'food',
          label: t('Croutons', 'Crutoane'),
          reason: t(
            'A scatter of crisp croutons adds crunch on top of the smooth purée.',
            'Câteva crutoane dau supei-cremă ceva crocant de ronțăit.',
          ),
          principle: 'contrast_texture',
          ingredient: 'croutons',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Light but filling with the potato; a slice of bread makes it a lunch.',
            'Ușoară, dar sățioasă datorită cartofului; cu o felie de pâine devine prânz.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, creamy bowl warms you through.',
            'Un bol fierbinte și cremos te încălzește.',
          ),
        },
      ],
    },
  ],
};
