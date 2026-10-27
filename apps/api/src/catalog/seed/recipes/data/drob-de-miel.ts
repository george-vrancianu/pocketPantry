import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Drob de miel base is the Romanian Easter loaf of lamb offal, spring
// onion and herbs, baked in caul fat and sliced cold. Each Variant is a full
// Recipe with its own lines, steps and guidance; the base's Recipe-level Tips
// are inherited, and the ones that only fit the loaf are hidden.
export const drobDeMiel: BaseRecipeSeed = {
  slug: 'drob-de-miel',
  title: t(
    'Romanian lamb offal and spring-herb loaf (drob de miel)',
    'Drob de miel',
  ),
  servings: 10,
  prepMinutes: 275,
  cookMinutes: 195,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'lamb-offal',
      quantity: 1000,
      unit: 'g',
      note: t(
        'liver, heart, lungs and kidneys, as sold in one set',
        'ficat, inimă, plămâni și rinichi, așa cum se vând într-un set',
      ),
    },
    {
      ingredient: 'spring-onion',
      quantity: 300,
      unit: 'g',
      note: t('finely sliced', 'tăiată mărunt'),
    },
    {
      ingredient: 'green-garlic',
      quantity: 50,
      unit: 'g',
      note: t('finely chopped', 'tocat mărunt'),
    },
    {
      ingredient: 'dill',
      quantity: 40,
      unit: 'g',
      note: t('finely chopped', 'tocat mărunt'),
    },
    {
      ingredient: 'parsley',
      quantity: 40,
      unit: 'g',
      note: t('finely chopped', 'tocat mărunt'),
    },
    {
      ingredient: 'eggs',
      key: 'eggs-raw',
      quantity: 4,
      unit: 'pcs',
      note: t('raw, for the mixture', 'crude, pentru compoziție'),
    },
    {
      ingredient: 'eggs',
      key: 'eggs-boiled',
      quantity: 4,
      unit: 'pcs',
      note: t(
        'hard-boiled and peeled, for the middle of the loaf',
        'fierte tari și curățate, pentru mijlocul drobului',
      ),
    },
    {
      ingredient: 'bread',
      quantity: 2,
      unit: 'pcs',
      optional: true,
      note: t(
        'slices, crusts removed, soaked in the milk and squeezed',
        'felii fără coajă, înmuiate în lapte și stoarse',
      ),
    },
    { ingredient: 'milk', quantity: 0.1, unit: 'l', optional: true },
    {
      ingredient: 'caul-fat',
      quantity: 150,
      unit: 'g',
      note: t(
        'to line and wrap the loaf',
        'pentru căptușit și acoperit drobul',
      ),
    },
    { ingredient: 'salt', quantity: 14, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
    {
      ingredient: 'still-water',
      quantity: 4,
      unit: 'l',
      note: t(
        'for boiling the eggs and for blanching and simmering the offal',
        'pentru fiertul ouălor și pentru opărit și fiert organele',
      ),
    },
  ],
  steps: [
    {
      key: 'herbs',
      text: t(
        'Slice the spring onion and chop the green garlic, dill and parsley first, before any raw offal is on the board. Mix them in a large bowl. If you are using the bread, tear it into the milk to soak.',
        'Taie ceapa verde și toacă usturoiul verde, mărarul și pătrunjelul mai întâi, înainte să ajungă organele crude pe tocător. Amestecă-le într-un castron mare. Dacă folosești pâine, rupe-o în lapte să se înmoaie.',
      ),
    },
    {
      key: 'eggs',
      text: t(
        'Put the 4 eggs for the middle of the loaf in a small pan, cover with cold water, bring to the boil and boil for 10 minutes. Cool them in cold water and leave them in it until the loaf is assembled.',
        'Pune cele 4 ouă pentru mijlocul drobului într-o cratiță mică, acoperă-le cu apă rece, adu la fierbere și fierbe 10 minute. Răcește-le în apă rece și lasă-le în ea până asamblezi drobul.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'trim',
      text: t(
        'Do not rinse the offal. On a clean board, cut away the gristle, the windpipe, any bile ducts or greenish patches from the liver, and the white core and skin from the kidneys. Cut everything into pieces of about 4 cm and put them in a large pot with 1.5 l of cold water. Wash your hands, the board and the knife with hot soapy water.',
        'Nu clăti organele. Pe un tocător curat, taie cartilajele, traheea, canalele biliare sau petele verzui de pe ficat, precum și miezul alb și pielița de pe rinichi. Taie totul bucăți de circa 4 cm și pune-le într-o oală mare cu 1,5 l de apă rece. Spală-ți mâinile, tocătorul și cuțitul cu apă fierbinte și săpun.',
      ),
    },
    {
      key: 'blanch',
      text: t(
        'Bring the pot to the boil, skim off the grey scum, and boil for 5 minutes. Drain in a colander, discard the water and put the offal back in the pot with 1.5 l of fresh water. Wash the colander.',
        'Adu oala la fierbere, ia spuma cenușie și fierbe 5 minute. Scurge într-o strecurătoare, aruncă apa și pune organele înapoi în oală cu 1,5 l de apă proaspătă. Spală strecurătoarea.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'simmer',
      text: t(
        'Bring to a gentle simmer, part-cover and cook for 30 minutes. Cut the largest piece of liver open: it must be brown right through with no pink, and the heart and lungs should be firm. If not, simmer on and check every 10 minutes.',
        'Adu la un clocot domol, acoperă pe jumătate și fierbe 30 de minute. Taie în două cea mai mare bucată de ficat: trebuie să fie maronie până în centru, fără roz, iar inima și plămânii să fie fermi. Dacă nu, mai fierbe și verifică din 10 în 10 minute.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'drain',
      text: t(
        'Drain the offal, spread it on a tray and leave it to cool for 20 minutes, until you can handle it comfortably.',
        'Scurge organele, întinde-le pe o tavă și lasă-le să se răcească 20 de minute, până poți să le atingi fără să te frigi.',
      ),
      timerSeconds: 1200,
    },
    {
      key: 'preheat',
      text: t(
        'While the offal cools, heat the oven to 180 °C (160 °C fan), which takes about 15 minutes. Put a baking tray on the middle shelf to catch drips.',
        'În timp ce organele se răcesc, încinge cuptorul la 180 °C (160 °C cu ventilator), ceea ce durează cam 15 minute. Pune o tavă pe grătarul din mijloc, să prindă picăturile de grăsime.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'caul',
      text: t(
        'Spread the caul fat out in a bowl of cold water for a few minutes until it opens up, then lift it out and pat it dry. Lay it over a 30 × 11 cm loaf tin so it hangs about 10 cm over each side. Wash your hands and the bowl.',
        'Întinde prapurul într-un bol cu apă rece câteva minute, până se desface, apoi scoate-l și tamponează-l. Așază-l peste o tavă de chec de 30 × 11 cm, astfel încât să atârne cam 10 cm pe fiecare margine. Spală-ți mâinile și bolul.',
      ),
    },
    {
      key: 'chop',
      text: t(
        'Chop the cooled offal small, to pieces of about 5 mm, on a clean board with a clean knife, or put it through a mincer on the coarse plate.',
        'Toacă mărunt organele răcite, în bucățele de circa 5 mm, pe un tocător curat cu un cuțit curat, sau dă-le prin mașina de tocat cu sită mare.',
      ),
    },
    {
      key: 'mix',
      text: t(
        'Add the offal to the herbs. Squeeze the bread dry and add it, then add the 4 raw eggs, the salt and the pepper. Mix well with a spoon. Wash your hands after cracking the eggs.',
        'Adaugă organele peste verdețuri. Stoarce pâinea și pune-o și pe ea, apoi adaugă cele 4 ouă crude, sarea și piperul. Amestecă bine cu o lingură. Spală-te pe mâini după ce ai spart ouăle.',
      ),
    },
    {
      key: 'assemble',
      text: t(
        'Peel the boiled eggs. Spoon half the mixture into the tin and press it level. Lay the eggs end to end down the middle, cover with the rest of the mixture and press firmly. Fold the overhanging caul fat over the top. Wash your hands.',
        'Curăță ouăle fierte. Pune în tavă jumătate din compoziție și netezește-o. Așază ouăle cap la cap pe mijloc, acoperă cu restul compoziției și presează bine. Îndoaie peste ea prapurul care atârnă. Spală-te pe mâini.',
      ),
    },
    {
      key: 'bake',
      text: t(
        'Set the tin on the tray in the oven and bake for 55 minutes, until the top is browned and the loaf has shrunk slightly from the sides. The centre must reach 71 °C, or a knife pushed into the middle must come out clean and hot. If not, bake on for 10 minutes and check again.',
        'Pune tava de chec pe tava din cuptor și coace 55 de minute, până se rumenește deasupra și drobul s-a retras puțin de la margini. Centrul trebuie să ajungă la 71 °C, sau un cuțit băgat la mijloc trebuie să iasă curat și fierbinte. Dacă nu, mai coace 10 minute și verifică din nou.',
      ),
      timerSeconds: 3300,
    },
    {
      key: 'rest',
      text: t(
        'Leave the loaf in the tin for 20 minutes, then lift it out onto a rack and leave it to cool.',
        'Lasă drobul în tavă 20 de minute, apoi scoate-l pe un grătar și lasă-l să se răcească.',
      ),
      timerSeconds: 1200,
    },
    {
      key: 'chill',
      text: t(
        'Within 2 hours of taking it out of the oven, wrap the cooled loaf and chill it for at least 4 hours. Slice it with a long sharp knife into 1.5 cm slices and serve cold. Keep leftovers in the fridge and eat them within 3 days.',
        'În cel mult 2 ore de la scoaterea din cuptor, înfășoară drobul răcit și ține-l la frigider cel puțin 4 ore. Taie-l cu un cuțit lung și ascuțit felii de 1,5 cm și servește-l rece. Păstrează resturile la frigider și mănâncă-le în cel mult 3 zile.',
      ),
    },
  ],
  tips: [
    t(
      'People who are pregnant should avoid liver and liver products, because of the very high vitamin A (NHS, "Foods to avoid in pregnancy"). This dish contains liver, so it is not for them.',
      'Persoanele însărcinate ar trebui să evite ficatul și produsele din ficat, din cauza cantității foarte mari de vitamina A (NHS, „Foods to avoid in pregnancy”). Preparatul conține ficat, așa că nu este pentru ele.',
    ),
    t(
      'If you cannot find caul fat, line the tin with baking paper and cover the top with a sheet of baking paper or foil. The loaf bakes the same but is a little less moist.',
      'Dacă nu găsești prapur, căptușește tava cu hârtie de copt și acoperă drobul deasupra cu hârtie de copt sau folie. Se coace la fel, dar iese puțin mai puțin suculent.',
    ),
    t(
      'Chill the loaf fully before slicing, and wipe the knife between slices: a warm loaf crumbles, a cold one cuts clean.',
      'Răcește drobul complet înainte să-l tai și șterge cuțitul între felii: cald se desface, rece se taie curat.',
    ),
  ],
  stepTips: [
    {
      step: 'blanch',
      text: t(
        'The blanching water turns grey and scummy; throwing it away gives a cleaner flavour and a lighter-coloured loaf.',
        'Apa de la opărit devine cenușie și plină de spumă; dacă o arunci, drobul are un gust mai curat și o culoare mai deschisă.',
      ),
    },
    {
      step: 'mix',
      text: t(
        'Do not taste the raw mixture, it contains raw egg. To check the salt, fry a spoonful in a small pan until cooked through, then taste that.',
        'Nu gusta compoziția crudă, are ou crud. Ca să verifici sarea, prăjește o lingură într-o tigaie mică până se gătește complet, apoi gustă din ea.',
      ),
    },
  ],
  nutritionNote: t(
    'Lamb offal is dense in protein and iron, and the herbs add some freshness. It is also high in cholesterol and liver carries a lot of vitamin A; with the eggs and caul fat it is a rich dish, best in small slices and not every day.',
    'Organele de miel au multe proteine și fier, iar verdețurile aduc prospețime. Au însă mult colesterol, iar ficatul are multă vitamina A; împreună cu ouăle și prapurul, drobul e un preparat bogat, bun în felii mici și nu în fiecare zi.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t(
        'Romanian beetroot salad with horseradish (salată de sfeclă cu hrean)',
        'Salată de sfeclă roșie cu hrean',
      ),
      reason: t(
        'Sharp horseradish and sweet-sour beetroot cut the rich offal and egg.',
        'Hreanul iute și sfecla dulce-acrișoară taie bogăția organelor și a oului.',
      ),
      principle: 'acid_cuts_fat',
      recipe: 'salata-de-sfecla',
    },
    {
      kind: 'food',
      label: t('Mustard', 'Muștar'),
      reason: t(
        'A sharp dab refreshes the mouth between slices of the rich loaf.',
        'Puțin muștar iute împrospătează gura între feliile bogate de drob.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'mustard',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sourness and crunch cut the richness of the offal and egg.',
        'Aciditatea și textura lor crocantă taie bogăția organelor și a oului.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'food',
      label: t('Crusty sourdough', 'Pâine cu maia, cu crustă'),
      reason: t(
        'A crusty slice gives the soft loaf a firm bite.',
        'O felie cu crustă dă drobului moale o mușcătură fermă.',
      ),
      principle: 'contrast_texture',
      ingredient: 'sourdough',
    },
    {
      kind: 'drink',
      label: t('Dry white wine', 'Vin alb sec'),
      reason: t(
        'Crisp acidity cuts through the fat of the offal and caul.',
        'Aciditatea fină taie grăsimea organelor și a prapurului.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'white-wine',
    },
    {
      kind: 'drink',
      label: t('Sparkling water', 'Apă minerală'),
      reason: t(
        'Bubbles refresh the palate between rich bites.',
        'Bulele împrospătează gustul între îmbucături bogate.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'sparkling-water',
    },
  ],
  eatingMoments: [
    {
      moment: 'brunch',
      polarity: 'good_for',
      reason: t(
        'It is made ahead and served in cold slices, so nothing is left to cook on the day.',
        'Se face dinainte și se servește în felii reci, așa că nu mai ai nimic de gătit în ziua mesei.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Slices are rich in protein; add bread for carbohydrates.',
        'Feliile sunt bogate în proteine; adaugă pâine pentru carbohidrați.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Offal, eggs and fat sit heavy in the stomach during exercise.',
        'Organele, ouăle și grăsimea cad greu la stomac în timpul efortului.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Too rich and heavy to eat shortly before bed.',
        'Prea bogat și greu ca să-l mănânci înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'drob-de-miel-balkan',
      cuisine: 'balkan',
      title: t(
        'Agneshka drob sarma (Bulgarian lamb offal and rice bake with egg and yogurt topping)',
        'Agneșka drob sarma (organe de miel cu orez la cuptor, cu ou și iaurt, ca în Bulgaria)',
      ),
      servings: 6,
      prepMinutes: 25,
      cookMinutes: 130,
      difficulty: 'medium',
      hideBaseTips: [1, 2],
      lines: [
        {
          ingredient: 'lamb-offal',
          quantity: 600,
          unit: 'g',
          note: t(
            'liver, heart, lungs and kidneys, as sold in one set',
            'ficat, inimă, plămâni și rinichi, așa cum se vând într-un set',
          ),
        },
        {
          ingredient: 'spring-onion',
          quantity: 200,
          unit: 'g',
          note: t('finely sliced', 'tăiată mărunt'),
        },
        { ingredient: 'butter', quantity: 40, unit: 'g' },
        {
          ingredient: 'round-rice',
          quantity: 150,
          unit: 'g',
          note: t('rinsed', 'clătit'),
        },
        { ingredient: 'paprika', quantity: 5, unit: 'g' },
        { ingredient: 'dried-mint', quantity: 3, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1.5, unit: 'g' },
        { ingredient: 'salt', quantity: 7, unit: 'g' },
        {
          ingredient: 'still-water',
          quantity: 2,
          unit: 'l',
          note: t(
            'for blanching and simmering the offal; 450 ml of the strained broth goes into the bake',
            'pentru opărit și fiert organele; 450 ml din supa strecurată intră în preparat',
          ),
        },
        { ingredient: 'yogurt', quantity: 250, unit: 'g' },
        { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
        {
          ingredient: 'dill',
          quantity: 15,
          unit: 'g',
          optional: true,
          note: t('chopped', 'tocat'),
        },
      ],
      steps: [
        {
          key: 'slice',
          text: t(
            'Slice the spring onion and chop the dill first, before any raw offal is on the board. Rinse the rice in a sieve and set it aside.',
            'Taie ceapa verde și toacă mărarul mai întâi, înainte să ajungă organele crude pe tocător. Clătește orezul într-o sită și pune-l deoparte.',
          ),
        },
        {
          key: 'trim',
          text: t(
            'Do not rinse the offal. On a clean board, cut away the gristle, the windpipe, any bile ducts or greenish patches from the liver, and the white core and skin from the kidneys. Cut everything into pieces of about 4 cm and put them in a pot with 1 l of cold water. Wash your hands, the board and the knife with hot soapy water.',
            'Nu clăti organele. Pe un tocător curat, taie cartilajele, traheea, canalele biliare sau petele verzui de pe ficat, precum și miezul alb și pielița de pe rinichi. Taie totul bucăți de circa 4 cm și pune-le într-o oală cu 1 l de apă rece. Spală-ți mâinile, tocătorul și cuțitul cu apă fierbinte și săpun.',
          ),
        },
        {
          key: 'blanch',
          text: t(
            'Bring the pot to the boil, skim off the grey scum, and boil for 5 minutes. Drain in a colander, discard the water and put the offal back in the pot with 1 l of fresh water. Wash the colander.',
            'Adu oala la fierbere, ia spuma cenușie și fierbe 5 minute. Scurge într-o strecurătoare, aruncă apa și pune organele înapoi în oală cu 1 l de apă proaspătă. Spală strecurătoarea.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'simmer',
          text: t(
            'Bring to a gentle simmer, part-cover and cook for 30 minutes. Cut the largest piece of liver open: it must be brown right through with no pink, and the heart and lungs should be firm. If not, simmer on and check every 10 minutes.',
            'Adu la un clocot domol, acoperă pe jumătate și fierbe 30 de minute. Taie în două cea mai mare bucată de ficat: trebuie să fie maronie până în centru, fără roz, iar inima și plămânii să fie fermi. Dacă nu, mai fierbe și verifică din 10 în 10 minute.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'preheat',
          text: t(
            'For the last 15 minutes of simmering, heat the oven to 180 °C (160 °C fan).',
            'În ultimele 15 minute de fiert, încinge cuptorul la 180 °C (160 °C cu ventilator).',
          ),
          timerSeconds: 900,
        },
        {
          key: 'chop',
          text: t(
            'Lift the offal out and strain 450 ml of the broth through a sieve into a small pan, cover it and keep it on the lowest heat; discard the rest. Leave the offal for 10 minutes, then chop it small, to about 5 mm, on a clean board with a clean knife.',
            'Scoate organele și strecoară 450 ml din supă printr-o sită într-o cratiță mică, acoper-o și ține-o la foc foarte mic; restul îl arunci. Lasă organele 10 minute, apoi toacă-le mărunt, la circa 5 mm, pe un tocător curat cu un cuțit curat.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'saute',
          text: t(
            'Melt the butter in a large wide pan over medium heat and cook the spring onion for 4 minutes, until soft. Take the pan off the heat and stir in the paprika, so it does not burn and turn bitter. Add the chopped offal and the rice, put back over low heat and stir for 1 minute, until the rice is coated in the butter.',
            'Topește untul într-o tigaie mare și lată la foc mediu și gătește ceapa verde 4 minute, până se înmoaie. Ia tigaia de pe foc și amestecă boiaua, ca să nu se ardă și să nu se amărască. Adaugă organele tocate și orezul, pune la loc pe foc mic și amestecă 1 minut, până se acoperă orezul cu unt.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'assemble',
          text: t(
            'Stir in the mint, the pepper, 6 g of the salt and the 450 ml of hot broth. Taste the broth for salt: it should taste lightly over-seasoned, because the rice and offal absorb it; add a pinch from the salt kept for the topping if it tastes flat. Tip into a 20 × 30 cm baking dish, level it and cover tightly with foil.',
            'Adaugă menta, piperul, 6 g din sare și cei 450 ml de supă fierbinte. Gustă supa de sare: trebuie să fie ușor prea sărată, pentru că orezul și organele o absorb; dacă e fadă, adaugă un praf din sarea pentru compoziția de deasupra. Toarnă într-un vas de copt de 20 × 30 cm, nivelează și acoperă bine cu folie.',
          ),
        },
        {
          key: 'bake-rice',
          text: t(
            'Bake for 30 minutes. Taste a few grains of rice: they should be tender. If they are still firm, add 50 ml of hot water, cover again and bake for 10 minutes more.',
            'Coace 30 de minute. Gustă câteva boabe de orez: trebuie să fie moi. Dacă sunt încă tari, adaugă 50 ml de apă fierbinte, acoperă din nou și mai coace 10 minute.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'topping',
          text: t(
            'Whisk the yogurt with the eggs, the remaining 1 g of salt and the dill. Wash your hands after cracking the eggs. Take off the foil and pour the topping evenly over the rice.',
            'Bate iaurtul cu ouăle, cu gramul de sare rămas și cu mărarul. Spală-te pe mâini după ce ai spart ouăle. Scoate folia și toarnă compoziția uniform peste orez.',
          ),
        },
        {
          key: 'bake-topping',
          text: t(
            'Bake uncovered for 25 minutes, until the topping is set and golden in patches. The centre of the topping must reach 71 °C, or a knife pushed in must come out clean. If it is still wobbly, bake on for 5 minutes.',
            'Coace neacoperit 25 de minute, până se prinde compoziția de deasupra și se rumenește pe alocuri. Centrul trebuie să ajungă la 71 °C, sau un cuțit băgat în el trebuie să iasă curat. Dacă încă se clatină, mai coace 5 minute.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'rest',
          text: t(
            'Leave to stand for 10 minutes so it holds together when cut, then serve warm. Chill leftovers within 2 hours and eat them within 1 day, reheated until steaming hot all through.',
            'Lasă 10 minute să se odihnească, ca să se țină la tăiere, apoi servește cald. Pune resturile la frigider în cel mult 2 ore și mănâncă-le în cel mult o zi, încălzite până scot aburi peste tot.',
          ),
          timerSeconds: 600,
        },
      ],
      tips: [
        t(
          'Some older recipes wrap this dish in caul fat. Today it is usually baked uncovered under the egg and yogurt topping, as here.',
          'Unele rețete mai vechi înfășoară preparatul în prapur. Azi se coace de obicei neacoperit, sub compoziția de ou și iaurt, ca aici.',
        ),
        t(
          'Cooked rice is a food-safety risk if it sits warm: chill leftovers within 2 hours, and reheat them only once.',
          'Orezul gătit este riscant dacă stă la căldură: pune resturile la frigider în cel mult 2 ore și încălzește-le o singură dată.',
        ),
      ],
      stepTips: [
        {
          step: 'saute',
          text: t(
            'Paprika burns in seconds in hot butter and turns bitter, so always stir it in off the heat.',
            'Boiaua se arde în câteva secunde în untul încins și se amărăște, așa că amestec-o mereu de pe foc.',
          ),
        },
      ],
      nutritionNote: t(
        'Offal and the egg and yogurt topping give plenty of protein, and rice makes it filling. The offal is high in cholesterol and liver is very rich in vitamin A, and butter, egg and yogurt add saturated fat, so serve a modest portion with a fresh salad.',
        'Organele și compoziția de ou cu iaurt aduc multe proteine, iar orezul îl face săturător. Organele au mult colesterol, iar ficatul, multă vitamina A; untul, oul și iaurtul adaugă grăsimi saturate, așa că servește o porție moderată, cu o salată proaspătă.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t(
            'Tomato and cucumber salad',
            'Salată de roșii și castraveți',
          ),
          reason: t(
            'Fresh acidity and crunch cut the richness of the offal and topping.',
            'Aciditatea proaspătă și crocanța taie bogăția organelor și a compoziției de deasupra.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'tomato',
        },
        {
          kind: 'food',
          label: t('Pickled peppers', 'Ardei murați'),
          reason: t(
            'Their sharp sourness lifts the soft rice and yogurt.',
            'Aciditatea lor ascuțită înviorează orezul moale și iaurtul.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-peppers',
        },
        {
          kind: 'drink',
          label: t('Cold drinking yogurt', 'Iaurt de băut rece'),
          reason: t(
            'Cool and tangy, it refreshes the palate between rich bites.',
            'Rece și acrișor, împrospătează gustul între îmbucături bogate.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'drinking-yogurt',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Crisp acidity cuts through the butter and egg.',
            'Aciditatea fină taie untul și oul.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'white-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, filling bake of rice and meat warms you up.',
            'Un preparat fierbinte și săturător, cu orez și carne, te încălzește.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from offal, egg and yogurt, with rice for carbohydrates.',
            'Proteine din organe, ou și iaurt, cu orez pentru carbohidrați.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Offal, egg and butter sit heavy in the stomach during exercise.',
            'Organele, oul și untul cad greu la stomac în timpul efortului.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Too rich and heavy to eat shortly before bed.',
            'Prea bogat și greu ca să-l mănânci înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'drob-de-miel-turkish',
      cuisine: 'turkish',
      title: t(
        'Arnavut ciğeri (Turkish fried lamb liver with sumac onions)',
        'Arnavut ciğeri (ficat de miel prăjit, cu ceapă și sumac, ca în Turcia)',
      ),
      servings: 4,
      prepMinutes: 25,
      cookMinutes: 20,
      difficulty: 'easy',
      hideBaseTips: [1, 2],
      lines: [
        {
          ingredient: 'lamb-liver',
          quantity: 500,
          unit: 'g',
          note: t('cut into 2 cm cubes', 'tăiat cuburi de 2 cm'),
        },
        {
          ingredient: 'red-onion',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'halved and very thinly sliced',
            'tăiată în jumătăți și apoi în felii foarte subțiri',
          ),
        },
        { ingredient: 'sumac', quantity: 6, unit: 'g' },
        {
          ingredient: 'parsley',
          quantity: 30,
          unit: 'g',
          note: t('leaves roughly chopped', 'frunze tocate grosier'),
        },
        { ingredient: 'flour', quantity: 40, unit: 'g' },
        { ingredient: 'pul-biber', quantity: 3, unit: 'g' },
        { ingredient: 'cumin', quantity: 2, unit: 'g' },
        { ingredient: 'salt', quantity: 4, unit: 'g' },
        {
          ingredient: 'sunflower-oil',
          quantity: 400,
          unit: 'ml',
          note: t(
            'for shallow frying, about 1 cm deep',
            'pentru prăjit în ulei puțin, cam 1 cm adâncime',
          ),
        },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          optional: true,
          note: t('cut into wedges', 'tăiată felii'),
        },
      ],
      steps: [
        {
          key: 'onion',
          text: t(
            'Do this first, before any raw liver is on the board. Mix the sliced onion with the sumac and 1 g of the salt, rub it with your fingers for a minute until it softens, then fold in the parsley. Leave it to stand while you prepare the liver.',
            'Fă asta mai întâi, înainte să ajungă ficatul crud pe tocător. Amestecă ceapa tăiată cu sumacul și cu 1 g din sare, freac-o cu degetele un minut până se înmoaie, apoi adaugă pătrunjelul. Las-o să stea cât pregătești ficatul.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'trim',
          text: t(
            'Do not rinse the liver. On a clean board, peel off the thin outer skin and cut away any tubes or greenish patches. Cut it into 2 cm cubes and pat them dry with paper towel. Wash your hands, the board and the knife with hot soapy water.',
            'Nu clăti ficatul. Pe un tocător curat, dezlipește pielița subțire de la exterior și taie tuburile sau petele verzui. Taie-l cuburi de 2 cm și tamponează-le cu un prosop de hârtie. Spală-ți mâinile, tocătorul și cuțitul cu apă fierbinte și săpun.',
          ),
        },
        {
          key: 'coat',
          text: t(
            'In a bowl, mix the flour with the pul biber, the cumin and the remaining 3 g of salt. Toss the liver cubes through it with a spoon, then lift them with a slotted spoon into a sieve and shake off the excess flour.',
            'Într-un bol, amestecă făina cu pul biber, chimionul și cele 3 g de sare rămase. Tăvălește cuburile de ficat prin amestec cu o lingură, apoi scoate-le cu o lingură cu găuri într-o sită și scutură făina în exces.',
          ),
        },
        {
          key: 'heat',
          text: t(
            'Heat the oil in a 28 cm frying pan over medium-high heat to about 180 °C. Without a thermometer, drop in a pinch of flour: it should sizzle at once but not burn. Have a lid and a damp towel beside the stove.',
            'Încălzește uleiul într-o tigaie de 28 cm la foc potrivit spre mare, până la circa 180 °C. Fără termometru, aruncă un praf de făină: trebuie să sfârâie imediat, dar să nu se ardă. Ține un capac și un prosop umed lângă aragaz.',
          ),
        },
        {
          key: 'fry-first',
          text: t(
            'Lay a third of the cubes in the oil with a slotted spoon, in one layer with space between them, and fry for 3 minutes, turning them every 45 seconds, until deep brown and crisp. Lift one of the biggest cubes onto a small plate and cut it open with a knife: it must be brown right through with no pink. If it is pink, pat the halves dry, put them back, keep frying the batch for another minute and check another cube. Lift the batch out with a clean slotted spoon onto a clean plate lined with paper towel.',
            'Pune o treime din cuburi în ulei cu o lingură cu găuri, într-un singur strat și cu spațiu între ele, și prăjește 3 minute, întorcându-le din 45 în 45 de secunde, până sunt maronii și crocante. Scoate unul dintre cele mai mari cuburi pe o farfurioară și taie-l în două cu un cuțit: trebuie să fie maroniu până în centru, fără roz. Dacă e roz, tamponează jumătățile, pune-le înapoi, mai prăjește lotul încă un minut și verifică alt cub. Scoate lotul cu o lingură cu găuri curată pe o farfurie curată, tapetată cu hârtie de bucătărie.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'fry-rest',
          text: t(
            'Fry the other two batches in the same way for 3 minutes each, checking each batch the same way, including the last: if a cube is pink, keep frying that batch and check again. Turn the heat off as soon as the last batch is out. Wash your hands, the bowl, the sieve, the spoon, the slotted spoon, the knife and the small plate that touched the raw liver.',
            'Prăjește celelalte două loturi la fel, câte 3 minute fiecare, verificând fiecare lot la fel, inclusiv ultimul: dacă un cub e roz, mai prăjește lotul și verifică din nou. Oprește focul imediat ce ai scos ultimul lot. Spală-ți mâinile, bolul, sita, lingura, lingura cu găuri, cuțitul și farfurioara care au atins ficatul crud.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'serve',
          text: t(
            'Pile the hot liver on the sumac onions and serve at once with lemon wedges. Leave the oil to cool completely in the pan before you pour it into a sealed container to throw away.',
            'Pune ficatul fierbinte peste ceapa cu sumac și servește imediat, cu felii de lămâie. Lasă uleiul să se răcească complet în tigaie înainte să-l torni într-un recipient închis și să-l arunci.',
          ),
        },
      ],
      tips: [
        t(
          'Fry in batches: crowding the pan drops the oil temperature, and the coating steams instead of crisping.',
          'Prăjește în loturi: o tigaie aglomerată răcește uleiul, iar învelișul se fierbe în abur în loc să devină crocant.',
        ),
        t(
          'If the oil catches fire, turn the heat off only if it is safe, do not move the pan, and smother the flames with the lid or a damp towel. Never use water. If it does not go out at once, get everyone out, close the door and call 112.',
          'Dacă uleiul ia foc, oprește focul doar dacă poți face asta în siguranță, nu muta tigaia și înăbușă flăcările cu capacul sau cu un prosop umed (bine stors). Nu folosi apă. Dacă nu se stinge imediat, scoate pe toată lumea din casă, închide ușa și sună la 112.',
        ),
      ],
      stepTips: [
        {
          step: 'fry-first',
          text: t(
            'Do not fry longer than needed: past about 3 minutes the cubes turn dry and grainy. Take a batch out only once the cut cube is cooked through; if it is not, keep frying.',
            'Nu prăji mai mult decât trebuie: peste 3 minute cuburile se usucă și devin făinoase. Scoate lotul abia când cubul tăiat este gătit în centru; dacă nu, mai prăjește.',
          ),
        },
      ],
      nutritionNote: t(
        'Liver is rich in protein and iron, and the onion and parsley add freshness. It is very high in vitamin A and cholesterol, and shallow frying in oil with a flour coating adds fat, so serve a small portion, with a salad or bread and not as an everyday dish.',
        'Ficatul este bogat în proteine și fier, iar ceapa și pătrunjelul aduc prospețime. Are foarte multă vitamina A și mult colesterol, iar prăjitul în ulei, cu înveliș de făină, adaugă grăsime, așa că servește o porție mică, cu salată sau pâine, și nu ca un fel de mâncare de zi cu zi.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Warm pita', 'Lipie caldă'),
          reason: t(
            'Soft bread to wrap the crisp liver and soak up the juices.',
            'Pâine moale în care înfășori ficatul crocant și cu care ștergi sucurile.',
          ),
          principle: 'contrast_texture',
          ingredient: 'pita',
        },
        {
          kind: 'food',
          label: t('Pickled peppers', 'Ardei murați'),
          reason: t(
            'Their sour crunch cuts the richness of the fried liver.',
            'Aciditatea și crocanța lor taie bogăția ficatului prăjit.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-peppers',
        },
        {
          kind: 'food',
          label: t('Tomato salad', 'Salată de roșii'),
          reason: t(
            'Juicy, acidic tomatoes cut the richness of the fried liver.',
            'Roșiile zemoase și acidulate taie bogăția ficatului prăjit.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'tomato',
        },
        {
          kind: 'drink',
          label: t('Cold drinking yogurt', 'Iaurt de băut rece'),
          reason: t(
            'It cools the chilli heat and refreshes the palate between bites.',
            'Răcorește iuțeala și împrospătează gustul între îmbucături.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'drinking-yogurt',
        },
        {
          kind: 'drink',
          label: t('Cold lager', 'Bere blondă rece'),
          reason: t(
            'Its light bitterness and bubbles balance the rich, fried liver.',
            'Amăreala ușoară și bulele echilibrează ficatul prăjit, bogat.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'beer',
        },
      ],
      eatingMoments: [
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein and iron from the liver; add pita for carbohydrates.',
            'Proteine și fier din ficat; adaugă lipie pentru carbohidrați.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Fried liver and chilli sit heavy in the stomach during exercise.',
            'Ficatul prăjit și ardeiul iute cad greu la stomac în timpul efortului.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Fried, spiced and rich, too heavy to eat shortly before bed.',
            'Prăjit, condimentat și bogat, prea greu ca să-l mănânci înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
