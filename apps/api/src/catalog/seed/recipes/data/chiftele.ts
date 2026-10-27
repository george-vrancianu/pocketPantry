import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Chiftele base is the Romanian home-style fried pork patty: minced pork
// with grated raw potato, onion, garlic, egg, dill and parsley, floured and
// shallow-fried. Each Variant is a full Recipe with its own lines, steps and
// guidance; the base's Recipe-level Tips are inherited unless a Variant hides
// them.
export const chiftele: BaseRecipeSeed = {
  slug: 'chiftele',
  title: t(
    'Chiftele (Romanian fried pork patties with dill and garlic)',
    'Chiftele de porc cu mărar și usturoi',
  ),
  servings: 4,
  prepMinutes: 45,
  cookMinutes: 35,
  difficulty: 'easy',
  lines: [
    { ingredient: 'minced-pork', quantity: 600, unit: 'g' },
    {
      ingredient: 'potato',
      quantity: 0.15,
      unit: 'kg',
      note: t(
        'peeled, finely grated and squeezed dry',
        'curățați, dați pe răzătoarea mică și storși bine',
      ),
    },
    {
      ingredient: 'onion',
      quantity: 1,
      unit: 'pcs',
      note: t('finely grated', 'dată pe răzătoarea mică'),
    },
    {
      ingredient: 'garlic',
      quantity: 10,
      unit: 'g',
      note: t('crushed', 'zdrobit'),
    },
    { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
    {
      ingredient: 'dill',
      quantity: 20,
      unit: 'g',
      note: t('finely chopped', 'tocat mărunt'),
    },
    {
      ingredient: 'parsley',
      quantity: 10,
      unit: 'g',
      note: t('finely chopped', 'tocat mărunt'),
    },
    { ingredient: 'salt', quantity: 8, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 1.5, unit: 'g' },
    {
      ingredient: 'flour',
      quantity: 50,
      unit: 'g',
      note: t('for rolling', 'pentru tăvălit'),
    },
    {
      ingredient: 'sunflower-oil',
      quantity: 250,
      unit: 'ml',
      note: t(
        'for shallow frying, about 5 mm deep in a 26 cm pan, plus a little to top up',
        'pentru prăjit, cam 5 mm adâncime într-o tigaie de 26 cm, plus puțin pentru completat',
      ),
    },
  ],
  steps: [
    {
      key: 'prep-onion-garlic',
      text: t(
        'Grate the onion on the fine side of the grater straight into a large bowl, so the juice stays in. Crush the garlic and chop the dill and parsley finely.',
        'Dă ceapa pe partea fină a răzătorii direct într-un castron mare, ca să rămână sucul. Zdrobește usturoiul și toacă mărunt mărarul și pătrunjelul.',
      ),
    },
    {
      key: 'grate-potato',
      text: t(
        'Peel the potato and grate it on the fine side of a box grater. Wrap it in a clean tea towel and squeeze hard over the sink until almost no liquid comes out.',
        'Curăță cartoful și dă-l pe partea fină a răzătorii. Înfășoară-l într-un prosop curat de bucătărie și strânge tare deasupra chiuvetei, până nu mai iese aproape deloc lichid.',
      ),
    },
    {
      key: 'mix',
      text: t(
        'Add the minced pork, the squeezed potato, garlic, eggs, dill, parsley, salt and pepper to the onion. Knead with your hand for about a minute, until the mixture is sticky and holds together.',
        'Adaugă carnea tocată de porc, cartoful stors, usturoiul, ouăle, mărarul, pătrunjelul, sarea și piperul peste ceapă. Frământă cu mâna cam un minut, până când compoziția devine lipicioasă și se leagă.',
      ),
    },
    {
      key: 'rest',
      text: t(
        'Cover the bowl and chill the mixture in the fridge for 15 minutes, so it firms up and is easier to shape.',
        'Acoperă castronul și ține compoziția la frigider 15 minute, ca să se întărească puțin și să fie mai ușor de modelat.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'shape',
      text: t(
        'Put the flour on a plate. With wet hands, divide the mixture into about 16 balls (roughly 60 g each), flatten each to a patty about 1.5 cm thick and roll it in the flour. Lay the patties on a tray. Then wash your hands thoroughly with soap and hot water: from here on move the patties only with a spatula.',
        'Pune făina pe o farfurie. Cu mâinile umede, împarte compoziția în vreo 16 bile (cam 60 g fiecare), aplatizează-le în chiftele groase de aproximativ 1,5 cm și tăvălește-le prin făină. Așază chiftelele pe o tavă. Apoi spală-ți bine mâinile cu săpun și apă caldă: de acum mută chiftelele numai cu spatula.',
      ),
    },
    {
      key: 'heat-oil',
      text: t(
        'Pour the oil into a 26 cm frying pan on a stable burner and heat it over medium heat, turning the handle inward. It is ready when a pinch of flour dropped in sizzles at once without darkening. Keep a lid nearby and do not walk away from the pan.',
        'Toarnă uleiul într-o tigaie de 26 cm pusă pe un ochi stabil și încălzește-l la foc mediu, cu mânerul întors spre interior. E gata când un praf de făină aruncat în ulei sfârâie imediat, fără să se închidă la culoare. Ține un capac la îndemână și nu pleca de lângă tigaie.',
      ),
    },
    {
      key: 'fry-first-side',
      text: t(
        'Slide the first 5 or 6 patties into the oil with a spatula, away from you, without crowding. Fry for 4 to 5 minutes until the underside is deep golden.',
        'Strecoară în ulei primele 5-6 chiftele cu o spatulă, dinspre tine spre exterior, fără să le înghesui. Prăjește-le 4-5 minute, până când partea de jos e aurie închis.',
      ),
      timerSeconds: 270,
    },
    {
      key: 'turn',
      text: t(
        'Turn the patties with the spatula and fry the second side for 4 to 5 minutes, until deep golden.',
        'Întoarce chiftelele cu spatula și prăjește-le și pe cealaltă parte 4-5 minute, până se rumenesc frumos.',
      ),
      timerSeconds: 270,
    },
    {
      key: 'check',
      text: t(
        'Lift one patty onto a clean board and cut it open. It must be cooked through with no pink in the centre, or read 71 °C on a probe thermometer. If it is still pink, put it back in the pan and fry the rest a minute or two longer per side. Then lift the first batch onto a clean plate lined with kitchen paper with a clean slotted spoon or tongs, never the tray the raw patties sat on.',
        'Scoate o chiftea pe o planșetă curată și taie-o în două. Trebuie să fie gătită complet, fără roz în centru, sau să arate 71 °C la termometrul de carne. Dacă mai e roz, pune-o înapoi în tigaie și prăjește restul încă un minut-două pe fiecare parte. Apoi ridică prima serie cu o lingură cu găuri sau cu un clește curat și pune-o pe o farfurie curată, căptușită cu hârtie de bucătărie, nu pe tava pe care au stat chiftelele crude.',
      ),
    },
    {
      key: 'fry-rest',
      text: t(
        'Fry the remaining patties in two more batches the same way, 4 to 5 minutes a side (or the longer time, if the first batch needed it), and cut one from each batch open: no pink, 71 °C. Lift out any burnt flour between batches and topping up the oil if the pan is dry. Reheat the oil to sizzling before each batch.',
        'Prăjește restul chiftelelor în încă două serii, la fel, câte 4-5 minute pe parte (sau cât a fost nevoie la prima serie) și taie câte o chiftea din fiecare serie: fără roz, 71 °C. Scoate făina arsă între serii și adăugând ulei dacă tigaia s-a uscat. Încălzește uleiul până sfârâie înainte de fiecare serie.',
      ),
      timerSeconds: 270,
    },
    {
      key: 'finish',
      text: t(
        'When the last batch is deep golden on both sides, cut one open: no pink in the centre, 71 °C. Lift the patties onto the clean plate with the rest and turn the heat off straight away.',
        'Când ultima serie e aurie închis pe ambele părți, taie o chiftea: fără roz în centru, 71 °C. Scoate chiftelele pe farfuria curată, la celelalte, și oprește imediat focul.',
      ),
    },
    {
      key: 'wash-up',
      text: t(
        'With the heat off, wash the bowl, tray, flour plate, spatula, board and knife in hot soapy water, and wash your hands again: you have finished with the raw pork.',
        'Cu focul oprit, spală castronul, tava, farfuria cu făină, spatula, planșeta și cuțitul cu apă caldă și detergent și spală-ți din nou mâinile: ai terminat cu carnea crudă de porc.',
      ),
    },
    {
      key: 'serve',
      text: t(
        'Serve the chiftele hot. After serving, leave the pan where it is until the oil is completely cold. Pour it into a sealed container and put it in the bin, never down the sink.',
        'Servește chiftelele fierbinți. După masă, lasă tigaia pe loc până când uleiul s-a răcit complet. Toarnă-l într-un recipient închis și aruncă-l la gunoi, nu pe chiuvetă.',
      ),
    },
    {
      key: 'store',
      text: t(
        'Put leftover chiftele in the fridge within 2 hours, in a covered container, and eat them within 3 days. Reheat until steaming hot all the way through, or eat them cold.',
        'Pune chiftelele rămase la frigider în cel mult 2 ore, într-un recipient acoperit, și consumă-le în 3 zile. Reîncălzește-le până sunt fierbinți în tot centrul, sau mănâncă-le reci.',
      ),
    },
  ],
  tips: [
    t(
      'Fry over steady medium heat: too hot and the crust darkens before the centre is cooked through.',
      'Prăjește la foc mediu, constant: dacă e prea mare, crusta se închide la culoare înainte să se gătească miezul.',
    ),
    t(
      'Make a few extra: chiftele keep for three days in the fridge and are good cold, with pickles and mustard.',
      'Fă câteva în plus: chiftelele țin trei zile la frigider și sunt bune și reci, cu murături și muștar.',
    ),
    t(
      'If the pinch of flour burns at once, the oil is too hot: take the pan off the heat and wait. If the oil ever smokes, turn the heat off.',
      'Dacă praful de făină se arde pe loc, uleiul e prea încins: ia tigaia de pe foc și așteaptă. Dacă uleiul scoate fum, oprește focul.',
    ),
  ],
  stepTips: [
    {
      step: 'grate-potato',
      text: t(
        'Grate the potato just before mixing and squeeze it hard: it darkens quickly, and its liquid makes the chiftele watery and apt to fall apart in the pan.',
        'Dă cartoful pe răzătoare chiar înainte de amestecat și strânge-l bine: se închide repede la culoare, iar lichidul lui face chiftelele moi și le destramă în tigaie.',
      ),
    },
    {
      step: 'heat-oil',
      text: t(
        'If the oil catches fire: turn the heat off only if you can do it safely, do not move the pan, and cover it with the lid or a damp towel. Never use water. If it does not go out at once, get everyone out, close the door and call 112.',
        'Dacă uleiul ia foc: oprește focul numai dacă poți face asta în siguranță, nu muta tigaia și acoper-o cu capacul sau cu un prosop umed. Nu folosi niciodată apă. Dacă nu se stinge imediat, scoate pe toată lumea din casă, închide ușa și sună la 112.',
      ),
    },
  ],
  nutritionNote: t(
    'Pork mince gives plenty of protein and B vitamins, especially B1, and the egg and potato make the chiftele filling. The pork brings saturated fat, the frying adds oil and calories, and salt builds up with pickles and mustard. Serve with a salad or cabbage for fibre, and drain on kitchen paper.',
    'Carnea tocată de porc dă multe proteine și vitamine din grupa B, mai ales B1, iar oul și cartoful fac chiftelele săturătoare. Porcul aduce grăsimi saturate, prăjirea adaugă ulei și calorii, iar sarea se adună odată cu murăturile și muștarul. Servește cu o salată sau cu varză pentru fibre și scurge chiftelele pe hârtie de bucătărie.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t(
        'Romanian piure with sautéed onion',
        'Piure de cartofi cu ceapă călită',
      ),
      reason: t(
        'The soft, buttery purée sets off the crisp crust of the chiftele.',
        'Piureul moale, cu unt, pune în valoare crusta crocantă a chiftelelor.',
      ),
      principle: 'contrast_texture',
      recipe: 'potato-puree-romanian',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sharp acidity cuts the richness of the fried pork.',
        'Aciditatea lor ascuțită taie din grăsimea porcului prăjit.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'food',
      label: t('Mustard', 'Muștar'),
      reason: t(
        'Its vinegary sharpness cuts through the fat and brightens the pork.',
        'Ascuțimea lui cu oțet taie din grăsime și înviorează carnea de porc.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'mustard',
    },
    {
      kind: 'food',
      label: t('Ripe tomato salad', 'Salată de roșii coapte'),
      reason: t(
        'The juicy acidity of the tomato freshens each bite of fried patty.',
        'Aciditatea suculentă a roșiilor înviorează fiecare îmbucătură de chiftea prăjită.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'tomato',
    },
    {
      kind: 'drink',
      label: t('Cold beer', 'Bere rece'),
      reason: t(
        'The cold bubbles refresh the palate between rich, fried bites.',
        'Bulele reci înviorează gura între îmbucăturile bogate și prăjite.',
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
        'Hot, hearty and filling when it is cold outside.',
        'Fierbinți, consistente și săturătoare când afară e frig.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Pork and egg give protein for recovery; add potato or bread for carbohydrates.',
        'Porcul și oul dau proteine pentru refacere; adaugă cartofi sau pâine pentru carbohidrați.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Fried and rich, so heavy to sleep on.',
        'Prăjite și bogate, deci greu de digerat înainte de somn.',
      ),
    },
  ],
  variants: [
    {
      slug: 'chiftele-russian',
      cuisine: 'russian',
      title: t(
        'Pozharsky cutlets (Russian breaded minced-chicken cutlets with butter)',
        'Chiftele Pojarski (chiftele rusești de pui cu unt, date prin pesmet)',
      ),
      servings: 4,
      prepMinutes: 55,
      cookMinutes: 30,
      difficulty: 'medium',
      hideBaseTips: [0, 1, 2],
      lines: [
        { ingredient: 'minced-chicken', quantity: 600, unit: 'g' },
        {
          ingredient: 'bread',
          quantity: 3,
          unit: 'pcs',
          note: t(
            'slices of white bread (about 30 g each), crusts removed',
            'felii de pâine albă (cam 30 g fiecare), fără coajă',
          ),
        },
        { ingredient: 'milk', quantity: 0.1, unit: 'l' },
        {
          ingredient: 'butter',
          quantity: 60,
          unit: 'g',
          note: t(
            'very cold, coarsely grated',
            'foarte rece, dat pe răzătoarea mare',
          ),
        },
        { ingredient: 'salt', quantity: 6, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        {
          ingredient: 'breadcrumbs',
          quantity: 80,
          unit: 'g',
          note: t('for coating', 'pentru pane'),
        },
        {
          ingredient: 'clarified-butter',
          quantity: 100,
          unit: 'g',
          note: t('for frying', 'pentru prăjit'),
        },
      ],
      steps: [
        {
          key: 'grate-butter',
          text: t(
            'Coarsely grate the cold butter onto a plate and put it back in the fridge until you need it.',
            'Dă untul rece pe răzătoarea mare, pe o farfurie, și pune-l înapoi la frigider până ai nevoie de el.',
          ),
        },
        {
          key: 'soak-bread',
          text: t(
            'Tear the bread into a bowl, pour the milk over it and leave it for 5 minutes, until completely soft. Squeeze it out well with your hands.',
            'Rupe pâinea într-un bol, toarnă laptele peste ea și las-o 5 minute, până se înmoaie complet. Strânge-o bine cu mâinile.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'mix',
          text: t(
            'Mix the minced chicken, squeezed bread, salt and pepper in a bowl until just combined. Fold in the cold grated butter with a spoon, so it stays in little pieces.',
            'Amestecă carnea tocată de pui, pâinea storsă, sarea și piperul într-un castron, doar până se leagă. Încorporează cu o lingură untul rece ras, ca să rămână în bucățele mici.',
          ),
        },
        {
          key: 'chill',
          text: t(
            'Cover the bowl and chill the mixture for 30 minutes, so the butter stays firm and the mixture is easy to shape.',
            'Acoperă castronul și ține compoziția la frigider 30 de minute, ca untul să rămână tare și compoziția să se modeleze ușor.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'shape',
          text: t(
            'Spread the breadcrumbs on a plate. With wet hands, divide the mixture into 8 portions, shape each into an oval cutlet about 2 cm thick and roll it in the breadcrumbs, pressing them on lightly. Lay the cutlets on a tray. Then wash your hands thoroughly with soap and hot water: from here on move the cutlets only with a spatula.',
            'Întinde pesmetul pe o farfurie. Cu mâinile umede, împarte compoziția în 8 porții, modelează fiecare în câte o chiftea ovală groasă de vreo 2 cm și tăvălește-o prin pesmet, apăsând ușor. Așază chiftelele pe o tavă. Apoi spală-ți bine mâinile cu săpun și apă caldă: de acum mută chiftelele numai cu spatula.',
          ),
        },
        {
          key: 'heat-butter',
          text: t(
            'Heat half of the clarified butter in a 26 cm frying pan over medium-low heat, with the handle turned inward, until a few crumbs dropped in sizzle gently. Keep a lid nearby and do not walk away from the pan. If the fat starts to smoke, turn the heat off.',
            'Încinge jumătate din untul clarifiat într-o tigaie de 26 cm, la foc mic-mediu, cu mânerul întors spre interior, până când câteva firimituri aruncate în el sfârâie ușor. Ține un capac la îndemână și nu pleca de lângă tigaie. Dacă grăsimea începe să scoată fum, oprește focul.',
          ),
        },
        {
          key: 'fry-first-side',
          text: t(
            'Slide 4 cutlets into the butter with a spatula, away from you. Fry for 5 to 6 minutes, until the underside is golden.',
            'Strecoară 4 chiftele în unt cu o spatulă, dinspre tine spre exterior. Prăjește-le 5-6 minute, până când partea de jos e aurie.',
          ),
          timerSeconds: 330,
        },
        {
          key: 'turn',
          text: t(
            'Turn the cutlets with the spatula and fry the second side for 5 to 6 minutes, until golden.',
            'Întoarce chiftelele cu spatula și prăjește-le pe cealaltă parte 5-6 minute, până se rumenesc.',
          ),
          timerSeconds: 330,
        },
        {
          key: 'check',
          text: t(
            'Cut one cutlet open: the chicken must be white all the way through with no pink, the juices clear, or read 75 °C on a probe thermometer. If not, give the rest a minute or two longer per side.',
            'Taie o chiftea: puiul trebuie să fie alb în tot centrul, fără roz, cu zeama limpede, sau să arate 75 °C la termometrul de carne. Dacă nu, mai prăjește restul încă un minut-două pe fiecare parte.',
          ),
        },
        {
          key: 'rest',
          text: t(
            'Lift the cutlets with a clean slotted spoon or tongs onto a clean plate, never the tray the raw ones sat on, and keep them warm, loosely covered, while the second batch fries.',
            'Mută chiftelele cu o lingură cu găuri sau cu un clește curat pe o farfurie curată, nu pe tava pe care au stat cele crude, și ține-le calde, acoperite lejer, în timp ce se prăjește a doua serie.',
          ),
        },
        {
          key: 'fry-second-batch',
          text: t(
            'Take the pan off the heat and carefully wipe out the burnt crumbs with a wad of kitchen paper. Add the rest of the clarified butter, heat until a few crumbs sizzle gently, and fry the second batch of 4 the same way, 5 to 6 minutes a side. Use a spatula to turn them.',
            'Ia tigaia de pe foc și șterge cu grijă firimiturile arse cu un ghemotoc de hârtie de bucătărie. Adaugă restul de unt clarifiat, încinge-l până când câteva firimituri sfârâie ușor și prăjește a doua serie de 4 chiftele la fel, 5-6 minute pe parte. Întoarce-le cu spatula.',
          ),
          timerSeconds: 330,
        },
        {
          key: 'finish',
          text: t(
            'When the second batch is golden on both sides, cut one open: no pink, clear juices, 75 °C. Turn the heat off straight away. Lift the cutlets onto the clean plate with the first batch, rest them 2 minutes and serve hot.',
            'Când a doua serie e aurie pe ambele părți, taie o chiftea: fără roz, cu zeama limpede, 75 °C. Oprește imediat focul. Scoate chiftelele pe farfuria curată, la prima serie, lasă-le 2 minute și servește-le fierbinți.',
          ),
        },
        {
          key: 'wash-up',
          text: t(
            'With the heat off, wash the bowl, tray, breadcrumb plate, spatula, board and knife in hot soapy water, and wash your hands again: you have finished with the raw chicken. Leave the pan to cool before cleaning it.',
            'Cu focul oprit, spală castronul, tava, farfuria cu pesmet, spatula, planșeta și cuțitul cu apă caldă și detergent și spală-ți din nou mâinile: ai terminat cu puiul crud. Lasă tigaia să se răcească înainte să o speli.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Put leftovers in the fridge within 2 hours, in a covered container, and eat them within 3 days. Reheat until steaming hot all the way through.',
            'Pune chiftelele rămase la frigider în cel mult 2 ore, într-un recipient acoperit, și consumă-le în 3 zile. Reîncălzește-le până sunt fierbinți în tot centrul.',
          ),
        },
      ],
      tips: [
        t(
          'The classic coating is finely diced crustless white bread instead of breadcrumbs: dice it very small, roll the cutlets in it and press it on well. It gives a crunchier, rougher crust.',
          'Un înveliș clasic este pâinea albă fără coajă, tăiată cubulețe foarte mici, în loc de pesmet: tăvălește chiftelele prin ea și apasă-o bine. Crusta iese mai crocantă și mai aspră.',
        ),
        t(
          'Test the butter with a few crumbs: they should sizzle gently, not brown at once. If they do, take the pan off the heat for a minute.',
          'Verifică untul cu câteva firimituri: trebuie să sfârâie ușor, nu să se rumenească pe loc. Dacă se rumenesc, ia tigaia de pe foc un minut.',
        ),
        t(
          'Keep the butter cold until the last moment: grated cold butter melts in the pan and leaves little pockets of juice, so the cutlets stay moist inside.',
          'Ține untul rece până în ultimul moment: untul rece ras se topește în tigaie și lasă mici buzunare de zeamă, așa că chiftelele rămân fragede în interior.',
        ),
      ],
      stepTips: [
        {
          step: 'soak-bread',
          text: t(
            'Squeeze the bread properly: if it is left wet, the mixture goes slack and the crumbs will not stick.',
            'Strânge bine pâinea: dacă rămâne udă, compoziția se înmoaie și pesmetul nu se prinde.',
          ),
        },
        {
          step: 'heat-butter',
          text: t(
            'If the fat catches fire: turn the heat off only if you can do it safely, do not move the pan, and cover it with the lid or a damp towel. Never use water. If it does not go out at once, get everyone out, close the door and call 112.',
            'Dacă grăsimea ia foc: oprește focul numai dacă poți face asta în siguranță, nu muta tigaia și acoper-o cu capacul sau cu un prosop umed. Nu folosi niciodată apă. Dacă nu se stinge imediat, scoate pe toată lumea din casă, închide ușa și sună la 112.',
          ),
        },
      ],
      nutritionNote: t(
        'Chicken mince is a lean source of protein, but the butter, milk and clarified butter bring plenty of saturated fat, and the breadcrumb crust adds refined carbohydrate and calories from frying. Serve with a green salad or pickles for freshness and fibre, and drain on kitchen paper.',
        'Carnea tocată de pui e o sursă de proteine cu puțină grăsime, dar untul, laptele și untul topit aduc multe grăsimi saturate, iar crusta de pesmet adaugă carbohidrați rafinați și calorii din prăjire. Servește cu o salată verde sau cu murături pentru prospețime și fibre și scurge chiftelele pe hârtie de bucătărie.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Potato puree', 'Piure de cartofi'),
          reason: t(
            'The smooth purée takes up the melted butter from the cutlets.',
            'Piureul fin se îmbibă cu untul care curge din chiftele.',
          ),
          principle: 'complement_flavour',
          recipe: 'potato-puree',
        },
        {
          kind: 'food',
          label: t('Pickled cucumbers', 'Castraveți murați'),
          reason: t(
            'Their acidity cuts the richness of the butter-fried crust.',
            'Aciditatea lor taie din bogăția crustei prăjite în unt.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-cucumbers',
        },
        {
          kind: 'food',
          label: t('Sour cream', 'Smântână'),
          reason: t(
            'A cool, tangy spoonful balances the buttery cutlets.',
            'O lingură de smântână rece și acrișoară echilibrează chiftelele cu unt.',
          ),
          principle: 'complement_flavour',
          ingredient: 'sour-cream',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its acidity cuts the butter and refreshes the palate.',
            'Aciditatea lui taie untul și înviorează gura.',
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
            'Hot and buttery, comforting on a cold day.',
            'Fierbinți și cu gust de unt, reconfortante într-o zi rece.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Chicken gives protein for recovery; add mashed potato for carbohydrates.',
            'Puiul dă proteine pentru refacere; adaugă piure de cartofi pentru carbohidrați.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Butter-fried and rich, so heavy before bed.',
            'Prăjite în unt și bogate, deci grele înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'chiftele-indian',
      cuisine: 'indian',
      title: t(
        'Shami kebab (Indian minced lamb and chana dal patties)',
        'Shami kebab (chiftele indiene din carne tocată de miel și chana dal)',
      ),
      servings: 4,
      prepMinutes: 115,
      cookMinutes: 65,
      difficulty: 'medium',
      hideBaseTips: [0, 1, 2],
      lines: [
        { ingredient: 'minced-lamb', quantity: 500, unit: 'g' },
        {
          ingredient: 'chana-dal',
          quantity: 150,
          unit: 'g',
          note: t(
            'soaked in cold water for 1 hour, then drained',
            'înmuiat 1 oră în apă rece, apoi scurs',
          ),
        },
        {
          ingredient: 'onion',
          key: 'onion-pot',
          quantity: 1,
          unit: 'pcs',
          note: t('sliced, for the pot', 'tăiată felii, pentru oală'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t('lightly crushed', 'ușor strivit'),
        },
        {
          ingredient: 'ginger',
          quantity: 15,
          unit: 'g',
          note: t('sliced', 'tăiat felii'),
        },
        { ingredient: 'cinnamon-sticks', quantity: 3, unit: 'g' },
        { ingredient: 'cloves', quantity: 0.5, unit: 'g' },
        { ingredient: 'green-cardamom-pods', quantity: 1, unit: 'g' },
        { ingredient: 'peppercorns', quantity: 2, unit: 'g' },
        { ingredient: 'bay-leaves', quantity: 0.4, unit: 'g' },
        { ingredient: 'dried-red-chillies', quantity: 2, unit: 'g' },
        { ingredient: 'cumin-seeds', quantity: 3, unit: 'g' },
        { ingredient: 'salt', quantity: 8, unit: 'g' },
        { ingredient: 'still-water', quantity: 0.3, unit: 'l' },
        {
          ingredient: 'onion',
          key: 'onion-raw',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'small, very finely chopped, for the mixture',
            'mică, tocată foarte mărunt, pentru compoziție',
          ),
        },
        {
          ingredient: 'mint',
          quantity: 10,
          unit: 'g',
          note: t('chopped', 'tocată'),
        },
        {
          ingredient: 'coriander',
          quantity: 15,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'hot-pepper',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'fresh green chilli, finely chopped',
            'ardei iute verde proaspăt, tocat mărunt',
          ),
        },
        { ingredient: 'garam-masala', quantity: 3, unit: 'g' },
        {
          ingredient: 'eggs',
          quantity: 1,
          unit: 'pcs',
          note: t('beaten', 'bătut'),
        },
        {
          ingredient: 'sunflower-oil',
          quantity: 160,
          unit: 'ml',
          note: t(
            'for shallow frying, about 3 mm deep in a 26 cm pan',
            'pentru prăjit, cam 3 mm adâncime într-o tigaie de 26 cm',
          ),
        },
      ],
      steps: [
        {
          key: 'pot',
          text: t(
            'Put the minced lamb, drained chana dal, sliced onion, garlic, ginger, cinnamon, cloves, cardamom pods, peppercorns, bay leaves, dried chillies, cumin seeds, salt and the water in a wide, heavy pot. Break the mince up with a wooden spoon.',
            'Pune carnea tocată de miel, chana dal scurs, ceapa felii, usturoiul, ghimbirul, scorțișoara, cuișoarele, păstăile de cardamom, piperul boabe, foile de dafin, ardeii uscați, semințele de chimion, sarea și apa într-o oală lată, cu fund gros. Desfă carnea cu o lingură de lemn.',
          ),
        },
        {
          key: 'wash-raw-lamb',
          text: t(
            'Wash your hands, the board, the knife and the spoon in hot soapy water: you have finished with the raw lamb.',
            'Spală-ți mâinile, planșeta, cuțitul și lingura cu apă caldă și detergent: ai terminat cu carnea crudă de miel.',
          ),
        },
        {
          key: 'boil',
          text: t(
            'Bring the pot to the boil over medium-high heat, skimming off any foam. Then cover, turn the heat to low and simmer for 25 minutes, stirring now and then.',
            'Adu oala la fierbere la foc mediu-mare, luând spuma. Apoi acoperă, dă focul la mic și fierbe 25 de minute, amestecând din când în când.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'dry',
          text: t(
            'Uncover and cook for about 10 minutes more, stirring often, until the pot is completely dry. The dal should be soft enough to crush between your fingers and the lamb grey-brown all through, with no pink.',
            'Descoperă și mai gătește cam 10 minute, amestecând des, până când oala e complet uscată. Dalul trebuie să fie atât de moale încât să se strivească între degete, iar mielul gri-maroniu peste tot, fără roz.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'cool',
          text: t(
            'Fish out the cinnamon, cloves, cardamom pods, bay leaves and dried chillies. Spread the mixture on a plate and leave it for 15 minutes, until warm rather than hot.',
            'Scoate scorțișoara, cuișoarele, păstăile de cardamom, foile de dafin și ardeii uscați. Întinde amestecul pe o farfurie și lasă-l 15 minute, până e cald, nu fierbinte.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'grind',
          text: t(
            'Grind the mixture in a food processor in short pulses, scraping down the sides, to a smooth, stiff paste that holds together when squeezed.',
            'Mărunțește amestecul în robotul de bucătărie, prin impulsuri scurte, răzuind pereții, până obții o pastă fină și compactă, care se ține când o strângi în mână.',
          ),
        },
        {
          key: 'mix',
          text: t(
            'Transfer the paste to a bowl. Add the chopped onion, mint, coriander, green chilli, garam masala and beaten egg and mix well.',
            'Trece pasta într-un castron. Adaugă ceapa, menta, coriandrul, ardeiul iute verde, garam masala și oul bătut și amestecă bine.',
          ),
        },
        {
          key: 'shape',
          text: t(
            'With wet hands, shape the mixture into about 12 flat patties, roughly 8 cm across and 1.5 cm thick, and lay them on a tray.',
            'Cu mâinile umede, modelează compoziția în vreo 12 chiftele plate, de aproximativ 8 cm diametru și 1,5 cm grosime, și așază-le pe o tavă.',
          ),
        },
        {
          key: 'wash-egg',
          text: t(
            'Wash your hands, the bowl and the board in hot soapy water: you have finished with the raw egg.',
            'Spală-ți mâinile, castronul și planșeta cu apă caldă și detergent: ai terminat cu oul crud.',
          ),
        },
        {
          key: 'chill',
          text: t(
            'Chill the patties in the fridge for 20 minutes, so they firm up and do not break in the pan.',
            'Ține chiftelele la frigider 20 de minute, ca să se întărească și să nu se rupă în tigaie.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'heat-oil',
          text: t(
            'Pour the oil into a 26 cm frying pan on a stable burner and heat it over medium heat, with the handle turned inward. It is ready when a patty edge sizzles gently as it goes in. Keep a lid nearby and do not walk away from the pan.',
            'Toarnă uleiul într-o tigaie de 26 cm pusă pe un ochi stabil și încălzește-l la foc mediu, cu mânerul întors spre interior. E gata când marginea unei chiftele sfârâie ușor la intrarea în ulei. Ține un capac la îndemână și nu pleca de lângă tigaie.',
          ),
        },
        {
          key: 'fry-first-side',
          text: t(
            'Slide 6 patties into the oil with a spatula, away from you. Fry for 2 to 3 minutes, until the underside is browned.',
            'Strecoară 6 chiftele în ulei cu o spatulă, dinspre tine spre exterior. Prăjește-le 2-3 minute, până când partea de jos se rumenește.',
          ),
          timerSeconds: 150,
        },
        {
          key: 'turn',
          text: t(
            'Turn the patties with the spatula and fry the second side for 2 to 3 minutes, until browned.',
            'Întoarce chiftelele cu spatula și prăjește-le pe cealaltă parte 2-3 minute, până se rumenesc.',
          ),
          timerSeconds: 150,
        },
        {
          key: 'check',
          text: t(
            'Break one patty open: it must be steaming hot all the way through with the egg set, or read 71 °C on a probe thermometer. If not, give the rest another minute per side. Move the first batch onto a clean plate lined with kitchen paper.',
            'Rupe o chiftea: trebuie să fie fierbinte în tot centrul, cu oul închegat, sau să arate 71 °C la termometrul de carne. Dacă nu, mai prăjește restul încă un minut pe parte. Mută prima serie pe o farfurie curată, căptușită cu hârtie de bucătărie.',
          ),
        },
        {
          key: 'fry-rest',
          text: t(
            'Fry the second batch of 6 the same way, 2 to 3 minutes a side, using a spatula to turn them.',
            'Prăjește a doua serie de 6 chiftele la fel, 2-3 minute pe parte, întorcându-le cu spatula.',
          ),
          timerSeconds: 150,
        },
        {
          key: 'finish',
          text: t(
            'Break one patty from the second batch open to check it is hot through and the egg is set. Lift all the patties onto the clean plate, turn the heat off straight away and serve hot.',
            'Rupe o chiftea din a doua serie ca să verifici că e fierbinte în centru și oul e închegat. Scoate toate chiftelele pe farfuria curată, oprește imediat focul și servește-le fierbinți.',
          ),
        },
        {
          key: 'wash-up',
          text: t(
            'With the heat off, wash the spatula, tray and any bowl or board that touched the raw-egg patties in hot soapy water, and wash your hands again.',
            'Cu focul oprit, spală spatula, tava și castronul sau planșeta care au atins chiftelele cu ou crud cu apă caldă și detergent și spală-ți din nou mâinile.',
          ),
        },
        {
          key: 'cool-oil',
          text: t(
            'After serving, leave the pan where it is until the oil is completely cold. Pour it into a sealed container and put it in the bin, never down the sink.',
            'După masă, lasă tigaia pe loc până când uleiul s-a răcit complet. Toarnă-l într-un recipient închis și aruncă-l la gunoi, nu pe chiuvetă.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Put leftover kebabs in the fridge within 2 hours, in a covered container, and eat them within 3 days; reheat until steaming hot. Shaped, unfried patties can be frozen on a tray, then bagged, and fried from frozen with a minute or two more per side; break one open to check it is hot through and the egg is set (71 °C).',
            'Pune kebaburile rămase la frigider în cel mult 2 ore, într-un recipient acoperit, și consumă-le în 3 zile; reîncălzește-le până sunt fierbinți. Chiftelele modelate, neprăjite, se pot congela pe o tavă, apoi la pungă, și se prăjesc direct din congelator, cu un minut-două în plus pe parte; rupe una ca să verifici că e fierbinte în centru și oul e închegat (71 °C).',
          ),
        },
      ],
      tips: [
        t(
          'Wrap a patty in warm naan with raw onion rings and a squeeze of lemon: the sharp onion and lemon lift the rich lamb.',
          'Înfășoară o chiftea într-un naan cald, cu rondele de ceapă crudă și un strop de lămâie: ceapa iute și lămâia înviorează mielul gras.',
        ),
      ],
      stepTips: [
        {
          step: 'dry',
          text: t(
            'If the pot dries out before the dal is soft, add a splash of water and keep going; if it is still wet when the dal is soft, turn the heat up a little and stir until dry.',
            'Dacă oala se usucă înainte ca dalul să fie moale, adaugă un strop de apă și continuă; dacă e încă umedă când dalul e moale, mărește puțin focul și amestecă până se usucă.',
          ),
        },
        {
          step: 'heat-oil',
          text: t(
            'If the oil catches fire: turn the heat off only if you can do it safely, do not move the pan, and cover it with the lid or a damp towel. Never use water. If it does not go out at once, get everyone out, close the door and call 112. If the oil smokes, turn the heat off.',
            'Dacă uleiul ia foc: oprește focul numai dacă poți face asta în siguranță, nu muta tigaia și acoper-o cu capacul sau cu un prosop umed. Nu folosi niciodată apă. Dacă nu se stinge imediat, scoate pe toată lumea din casă, închide ușa și sună la 112. Dacă uleiul scoate fum, oprește focul.',
          ),
        },
      ],
      nutritionNote: t(
        'Chana dal adds fibre and plant protein, and lamb gives protein, iron and zinc, so the patties are filling. Lamb brings saturated fat, the salt in the pot adds up, and frying adds oil. The patties are only fried for a crust, which keeps the oil modest. Serve with raw onion and lemon for freshness.',
        'Chana dal adaugă fibre și proteine vegetale, iar mielul dă proteine, fier și zinc, deci chiftelele sunt săturătoare. Mielul aduce grăsimi saturate, sarea din oală se adună, iar prăjirea adaugă ulei. Chiftelele se prăjesc doar pentru crustă, așa că uleiul rămâne în limite. Servește cu ceapă crudă și lămâie pentru prospețime.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Raw red onion rings', 'Rondele de ceapă roșie crudă'),
          reason: t(
            'Their sharp crunch cuts the richness of the spiced lamb.',
            'Ceapa crudă, crocantă și iute, taie din bogăția mielului condimentat.',
          ),
          principle: 'contrast_texture',
          ingredient: 'red-onion',
        },
        {
          kind: 'food',
          label: t('Lemon wedges', 'Felii de lămâie'),
          reason: t(
            'A squeeze of lemon brightens the spices and cuts the fat.',
            'Un strop de lămâie înviorează condimentele și taie din grăsime.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'lemon',
        },
        {
          kind: 'food',
          label: t('Plain yogurt', 'Iaurt natural'),
          reason: t(
            'Cool, tangy yogurt calms the chilli heat of the kebabs.',
            'Iaurtul rece și acrișor domolește iuțeala ardeiului din kebab.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'yogurt',
        },
        {
          kind: 'food',
          label: t('Naan', 'Naan'),
          reason: t(
            'Soft bread to wrap the crisp-edged patties.',
            'Pâine moale în care se pot înfășura chiftelele cu margini crocante.',
          ),
          principle: 'contrast_texture',
          ingredient: 'naan',
        },
        {
          kind: 'food',
          label: t('Cucumber', 'Castravete'),
          reason: t(
            'Cool, crisp cucumber refreshes the mouth between spiced bites.',
            'Castravetele rece și crocant înviorează gura între îmbucăturile condimentate.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'cucumber',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Warming spices and hot patties suit a cold day.',
            'Condimentele calde și chiftelele fierbinți se potrivesc unei zile reci.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Lamb and dal give protein for recovery; add naan or rice for carbohydrates.',
            'Mielul și dalul dau proteine pentru refacere; adaugă naan sau orez pentru carbohidrați.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Spiced, fried and rich, so heavy and warming just before bed.',
            'Condimentate, prăjite și bogate, deci grele înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
