import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Ciorbă de burtă base is the Romanian tripe soup, simmered for hours with
// beef bones and soured at the table with garlic (mujdei) and vinegar, with an
// egg-yolk and sour-cream liaison. Each Variant is a full Recipe with its own
// lines, steps and guidance; the base's Recipe-level Tips are inherited unless
// hidden.
export const ciorbaDeBurta: BaseRecipeSeed = {
  slug: 'ciorba-de-burta',
  title: t(
    'Romanian tripe sour soup with garlic and sour cream (ciorbă de burtă)',
    'Ciorbă de burtă',
  ),
  servings: 6,
  prepMinutes: 30,
  cookMinutes: 270,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'beef-tripe',
      quantity: 800,
      unit: 'g',
      note: t('cleaned (white) tripe', 'burtă curățată (albă)'),
    },
    {
      ingredient: 'beef-soup-bones',
      quantity: 600,
      unit: 'g',
      note: t('with marrow, if you can', 'de preferat cu măduvă'),
    },
    {
      ingredient: 'beef-feet',
      quantity: 500,
      unit: 'g',
      optional: true,
      note: t(
        'cut into pieces by the butcher; for a more gelatinous, richer soup',
        'tăiate în bucăți de măcelar; pentru o ciorbă mai gelatinoasă și mai bogată',
      ),
    },
    { ingredient: 'still-water', quantity: 3, unit: 'l' },
    {
      ingredient: 'carrot',
      quantity: 200,
      unit: 'g',
      note: t('peeled, left whole', 'curățați, întregi'),
    },
    {
      ingredient: 'parsley-root',
      quantity: 80,
      unit: 'g',
      note: t('peeled, left whole', 'curățată, întreagă'),
    },
    {
      ingredient: 'celeriac',
      quantity: 150,
      unit: 'g',
      note: t('peeled, in one piece', 'curățată, dintr-o bucată'),
    },
    {
      ingredient: 'onion',
      quantity: 1,
      unit: 'pcs',
      note: t('peeled, left whole', 'curățată, întreagă'),
    },
    {
      ingredient: 'bay-leaves',
      quantity: 0.4,
      unit: 'g',
      note: t('2 leaves', '2 foi'),
    },
    { ingredient: 'peppercorns', quantity: 3, unit: 'g' },
    {
      ingredient: 'salt',
      key: 'salt-soup',
      quantity: 16,
      unit: 'g',
      note: t('for the soup', 'pentru ciorbă'),
    },
    {
      ingredient: 'eggs',
      quantity: 3,
      unit: 'pcs',
      note: t('yolks only', 'doar gălbenușurile'),
    },
    {
      ingredient: 'sour-cream',
      key: 'sour-cream-liaison',
      quantity: 300,
      unit: 'g',
      note: t('for the liaison', 'pentru dreasă'),
    },
    {
      ingredient: 'sour-cream',
      key: 'sour-cream-table',
      quantity: 150,
      unit: 'g',
      note: t('at the table', 'la masă'),
    },
    {
      ingredient: 'garlic',
      quantity: 25,
      unit: 'g',
      note: t(
        '6 cloves, for the mujdei at the table',
        '6 căței, pentru mujdeiul de la masă',
      ),
    },
    {
      ingredient: 'salt',
      key: 'salt-mujdei',
      quantity: 2,
      unit: 'g',
      note: t('for the mujdei', 'pentru mujdei'),
    },
    {
      ingredient: 'vinegar',
      quantity: 100,
      unit: 'ml',
      note: t('in a small jug at the table', 'într-un bol mic, la masă'),
    },
    {
      ingredient: 'hot-pepper',
      quantity: 2,
      unit: 'pcs',
      optional: true,
      note: t('whole, at the table', 'întregi, la masă'),
    },
  ],
  steps: [
    {
      key: 'blanch',
      text: t(
        'Put the tripe and the beef feet (if using) in a 7 litre pot, cover with cold water and bring to the boil. Boil for 5 minutes, then carry the pot to the sink and pour the water through a colander. Do not rinse the tripe or the feet. Rinse out the pot.',
        'Pune burta și picioarele de vită (dacă le folosești) într-o oală de 7 litri, acoperă-le cu apă rece și adu la fierbere. Fierbe 5 minute, apoi du oala la chiuvetă și strecoară apa printr-o strecurătoare. Nu clăti burta și nici picioarele. Clătește oala.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'start-stock',
      text: t(
        'Put the blanched tripe and feet back in the pot, add the beef bones and cover with the 3 litres of cold water.',
        'Pune la loc în oală burta și picioarele opărite, adaugă oasele de vită și acoperă cu cei 3 litri de apă rece.',
      ),
    },
    {
      key: 'wash-up',
      text: t(
        'Wash your hands, the colander and anything else that touched the raw tripe, bones or feet with hot soapy water.',
        'Spală-ți mâinile, strecurătoarea și tot ce a atins burta, oasele sau picioarele crude cu apă caldă și săpun.',
      ),
    },
    {
      key: 'skim',
      text: t(
        'Bring slowly to the boil over medium heat, about 20 minutes. As the grey foam rises, skim it off with a spoon until the surface is clear.',
        'Adu încet la fierbere la foc mediu, cam 20 de minute. Pe măsură ce se ridică spuma cenușie, ia-o cu lingura până când suprafața e limpede.',
      ),
      timerSeconds: 1200,
    },
    {
      key: 'simmer-tripe',
      text: t(
        'Lower the heat so the soup barely bubbles, put the lid on ajar and simmer for 2 hours.',
        'Dă focul mai mic, ca ciorba să abia clocotească, pune capacul întredeschis și fierbe 2 ore.',
      ),
      timerSeconds: 7200,
    },
    {
      key: 'vegetables',
      text: t(
        'Add the whole carrots, parsley root, celeriac and onion, the bay leaves, peppercorns and 16 g of salt. Simmer for 1 hour more. The tripe is ready when a strip can be cut with the side of a spoon; if it is still rubbery, simmer on and check every 15 minutes.',
        'Adaugă morcovii, rădăcina de pătrunjel, țelina și ceapa întregi, foile de dafin, piperul boabe și 16 g de sare. Mai fierbe 1 oră. Burta e gata când o fâșie se taie cu marginea lingurii; dacă e încă gumoasă, fierbe în continuare și verifică din 15 în 15 minute.',
      ),
      timerSeconds: 3600,
    },
    {
      key: 'liaison',
      text: t(
        'While the tripe cooks its last hour, separate the eggs and put the 3 yolks and the 300 g of sour cream for the liaison in a large bowl (keep the whites for another dish). Whisk until smooth, then cover the bowl and keep it in the fridge until the tempering step. Wash your hands after handling the raw eggs.',
        'În ultima oră de fierbere a burții, separă ouăle și pune cele 3 gălbenușuri și cele 300 g de smântână pentru dreasă într-un bol mare (albușurile le păstrezi pentru altceva). Amestecă până se omogenizează, apoi acoperă bolul și ține-l la frigider până la temperare. Spală-ți mâinile după ce ai atins ouăle crude.',
      ),
    },
    {
      key: 'strain',
      text: t(
        'Lift the tripe, bones, feet, vegetables and onion onto a clean plate. Strain the stock through a sieve into a clean pot of at least 4 litres and discard the bay leaves, peppercorns and the onion. Spoon off excess fat from the surface.',
        'Scoate burta, oasele, picioarele, legumele și ceapa pe o farfurie curată. Strecoară supa printr-o sită într-o oală curată de cel puțin 4 litri și aruncă foile de dafin, boabele de piper și ceapa. Ia cu lingura surplusul de grăsime de la suprafață.',
      ),
    },
    {
      key: 'cut',
      text: t(
        'Let the tripe cool for 10 minutes. Cut it into thin strips about 5 cm long, cut the carrot into strips too. Pick off any meat that comes away easily from the feet. Discard the bones and feet; keep the celeriac and parsley root for another dish or discard them. Return the tripe, the carrot and the foot meat to the stock.',
        'Lasă burta să se răcească 10 minute. Taie-o în fâșii subțiri de cam 5 cm, taie și morcovul fâșii. Desprinde carnea care se ia ușor de pe picioare. Aruncă oasele și picioarele; păstrează țelina și rădăcina de pătrunjel pentru altă mâncare sau aruncă-le. Pune burta, morcovul și carnea de pe picioare înapoi în supa strecurată.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'reheat',
      text: t(
        'Bring the soup back to a gentle simmer, then take the pot off the heat and wait until it stops bubbling.',
        'Adu ciorba din nou la o fierbere ușoară, apoi ia oala de pe foc și așteaptă să nu mai clocotească.',
      ),
    },
    {
      key: 'temper',
      text: t(
        'Add about 6 small ladles (about 400 ml) of the hot broth to the sour cream and yolks one at a time, whisking constantly, until the mix is warm and runny.',
        'Pune în amestecul de smântână și gălbenușuri cam 6 polonice mici (cam 400 ml) de zeamă fierbinte, pe rând, amestecând continuu, până când compoziția e caldă și curge.',
      ),
    },
    {
      key: 'stir-in',
      text: t(
        'Pour the tempered mix into the pot in a thin stream, stirring all the time. Put the pot back on the lowest heat.',
        'Toarnă dreasa în oală într-un fir subțire, amestecând mereu. Pune oala înapoi pe foc foarte mic.',
      ),
    },
    {
      key: 'heat-liaison',
      text: t(
        'Stir gently for about 3 minutes, until the soup steams, turns slightly thicker and reads at least 71 °C on a thermometer. It must stay hot but below the boil. Reaching 71 °C is what makes the yolks safe for children, older people, anyone pregnant and anyone immunocompromised, so check with a thermometer rather than by eye. Take the pot off the heat.',
        'Amestecă ușor cam 3 minute, până când ciorba scoate abur, se îngroașă puțin și termometrul arată cel puțin 71 °C. Trebuie să rămână fierbinte, dar sub punctul de fierbere. Abia la 71 °C gălbenușurile devin sigure pentru copii, vârstnici, gravide și persoane cu imunitate scăzută, așa că verifică cu termometrul, nu din ochi. Ia oala de pe foc.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'mujdei',
      text: t(
        'Crush the garlic with the 2 g of salt to a paste in a small bowl and stir in 3 tablespoons of the hot soup. Pour the vinegar into a small jug.',
        'Pisează usturoiul cu cele 2 g de sare până face pastă, într-un bol mic, și adaugă 3 linguri de ciorbă fierbinte și amestecă. Toarnă oțetul într-un bol mic.',
      ),
    },
    {
      key: 'serve',
      text: t(
        'Taste the soup and add salt if needed. Ladle it into bowls and bring the mujdei, the vinegar, the hot peppers (if using), extra sour cream and bread to the table, so everyone sours and seasons their own bowl.',
        'Gustă ciorba și potrivește de sare. Pune-o în boluri și adu la masă mujdeiul, oțetul, ardeii iuți (dacă îi folosești), smântână în plus și pâine, ca fiecare să-și acrească și să-și condimenteze singur castronul.',
      ),
    },
  ],
  tips: [
    t(
      'Once the yolks and sour cream are in, never let the soup boil: the sour cream splits and the yolks turn grainy. Keep it steaming, at least 71 °C but below the boil, on the lowest heat.',
      'După ce ai pus gălbenușurile și smântâna, nu mai lăsa ciorba să fiarbă: smântâna se taie, iar gălbenușurile se taie și fac cocoloașe. Ține-o fierbinte, să scoată abur (cel puțin 71 °C, dar sub fierbere), pe foc foarte mic.',
    ),
    t(
      'Vinegar strength differs from bottle to bottle, so sour the bowl, not the pot: stir in the mujdei first, then the vinegar a spoonful at a time, tasting after each.',
      'Tăria oțetului diferă de la sticlă la sticlă, așa că acrește castronul, nu oala: pune întâi mujdeiul, apoi oțetul câte o lingură, gustând după fiecare.',
    ),
    t(
      'Freeze the leftover egg whites, or use them within 2 days in an omelette or a batter.',
      'Albușurile rămase le poți îngheța sau le poți folosi în maximum 2 zile într-o omletă sau într-un aluat.',
    ),
    t(
      'Tripe sold ready-boiled still needs a long simmer to turn tender, usually far less time than the raw tripe here. Judge by texture, not by the clock: a strip should give way easily under the side of a spoon.',
      'Burta vândută deja fiartă are nevoie tot de o fierbere lungă ca să se înmoaie, de obicei mult mai puțin decât burta crudă de aici. Judecă după textură, nu după ceas: o fâșie trebuie să cedeze ușor sub marginea lingurii.',
    ),
    t(
      'Cool leftovers within 2 hours and keep them in the fridge for up to 3 days. Reheat gently over low heat, stirring, until steaming hot at 74 °C, and do not let it boil. Do not freeze it once the liaison is in. To freeze, set aside stock and tripe before the tempering step and freeze them for up to 3 months. Thaw in the fridge, bring to a simmer and make a fresh liaison (1 yolk and 100 g of sour cream per about 2 servings) for each batch you thaw.',
      'Răcește ciorba rămasă în maximum 2 ore și ține-o la frigider cel mult 3 zile. Încălzește-o încet, pe foc mic, amestecând, până e fierbinte, la 74 °C, și nu o lăsa să fiarbă. Nu o congela după ce ai pus dreasa. Ca s-o congelezi, pune deoparte zeama și burta înainte de temperare și congeleaz-o până la 3 luni. Decongelează la frigider, adu la fierbere ușoară și fă o dreasă proaspătă (1 gălbenuș și 100 g de smântână la cam 2 porții) pentru fiecare tranșă pe care o decongelezi.',
    ),
  ],
  stepTips: [
    {
      step: 'blanch',
      text: t(
        'Pour the blanching water straight down the drain and keep the tripe out of the running tap: rinsing raw tripe only splashes bacteria around the sink, and the boil has already cleaned it.',
        'Toarnă apa de la opărit direct în chiuvetă și nu ține burta sub jetul de apă: clătirea burții crude doar împrăștie bacterii prin chiuvetă, iar fierberea a curățat-o deja.',
      ),
    },
    {
      step: 'temper',
      text: t(
        'Use full-fat (20%) sour cream, and add the broth slowly while whisking. Hot broth poured in fast cooks the yolks into small scrambled bits.',
        'Folosește smântână grasă (20%) și adaugă zeama încet, amestecând. Dacă torni zeama fierbinte repede, gălbenușurile se taie în bucățele ca niște ouă jumări.',
      ),
    },
    {
      step: 'strain',
      text: t(
        'If you make the stock a day ahead, cool it within 2 hours and refrigerate it overnight: the fat sets on top and lifts off in one piece. Keep the tripe covered in the fridge separately.',
        'Dacă faci zeama cu o zi înainte, răcește-o în maximum 2 ore și ține-o la frigider peste noapte: grăsimea se prinde deasupra și se ridică dintr-o bucată. Ține burta acoperită la frigider, separat.',
      ),
    },
  ],
  nutritionNote: t(
    'Tripe and bones make a filling soup with plenty of protein and not much fat once skimmed. The yolks and sour cream add saturated fat, the offal adds cholesterol, and the salt, including the salted mujdei, adds sodium. It has little fibre unless you eat it with bread and vegetables.',
    'Burta și oasele fac o ciorbă săturătoare, cu multe proteine și puțină grăsime după degresare. Gălbenușurile și smântâna aduc grăsimi saturate, măruntaiele aduc colesterol, iar sarea, inclusiv cea din mujdei, aduce sodiu. Are puține fibre, dacă nu o mănânci cu pâine și legume.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Fresh bread', 'Pâine proaspătă'),
      reason: t(
        'A crusty slice soaks up the garlicky, creamy broth and gives a crisp bite beside the soft tripe.',
        'O felie cu coajă crocantă se înmoaie în zeama cu usturoi și smântână și contrastează cu burta moale.',
      ),
      principle: 'contrast_texture',
      ingredient: 'bread',
    },
    {
      kind: 'drink',
      label: t('Țuică', 'Țuică'),
      reason: t(
        'A small glass of the strong plum spirit cuts through the rich, creamy soup.',
        'Un păhărel din tăria de prune taie din bogăția ciorbei cremoase.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'tuica',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot, soured soup that warms you through.',
        'O ciorbă fierbinte și acrișoară care te încălzește.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'The garlic, vinegar and rich cream can cause heartburn before bed.',
        'Usturoiul, oțetul și smântâna bogată pot da arsuri înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'ciorba-de-burta-italian',
      cuisine: 'italian',
      hideBaseTips: [0, 1, 2, 3, 4],
      title: t(
        'Trippa alla fiorentina (Florentine tripe stewed in tomato with Parmesan)',
        'Trippa alla fiorentina (burtă de vită înăbușită în sos de roșii, cu parmezan, ca la Florența)',
      ),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 250,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'beef-tripe',
          quantity: 600,
          unit: 'g',
          note: t('cleaned (white) tripe', 'burtă curățată (albă)'),
        },
        {
          ingredient: 'still-water',
          quantity: 2,
          unit: 'l',
          key: 'water-boil',
        },
        {
          ingredient: 'salt',
          key: 'salt-boil',
          quantity: 10,
          unit: 'g',
          note: t('for the boiling water', 'pentru apa de fiert'),
        },
        { ingredient: 'olive-oil', quantity: 50, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely chopped', 'tocată mărunt'),
        },
        {
          ingredient: 'carrot',
          quantity: 100,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        {
          ingredient: 'celery',
          quantity: 80,
          unit: 'g',
          note: t('finely chopped', 'tocată mărunt'),
        },
        { ingredient: 'white-wine', quantity: 100, unit: 'ml' },
        {
          ingredient: 'canned-tomatoes',
          quantity: 400,
          unit: 'g',
          note: t('crushed', 'zdrobite'),
        },
        {
          ingredient: 'still-water',
          quantity: 0.15,
          unit: 'l',
          key: 'water-sauce',
        },
        {
          ingredient: 'salt',
          key: 'salt-sauce',
          quantity: 3,
          unit: 'g',
          note: t('for the sauce, to taste', 'pentru sos, după gust'),
        },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
        {
          ingredient: 'parmesan',
          quantity: 60,
          unit: 'g',
          note: t(
            'grated, half for the pot and half at the table',
            'ras, jumătate în oală și jumătate la masă',
          ),
        },
        {
          ingredient: 'basil',
          quantity: 10,
          unit: 'g',
          optional: true,
          note: t('torn', 'rupt'),
        },
      ],
      steps: [
        {
          key: 'blanch',
          text: t(
            'Put the tripe in a 4 litre pot, cover with cold water and bring to the boil. Boil for 5 minutes, then carry the pot to the sink and pour the water through a colander. Do not rinse the tripe.',
            'Pune burta într-o oală de 4 litri, acoperă-o cu apă rece și adu la fierbere. Fierbe 5 minute, apoi du oala la chiuvetă și strecoară apa printr-o strecurătoare. Nu clăti burta.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'start-boil',
          text: t(
            'Rinse out the pot, put the tripe back in with the 2 litres of cold water and 10 g of salt and bring to the boil.',
            'Clătește oala, pune burta înapoi cu cei 2 litri de apă rece și 10 g de sare și adu la fierbere.',
          ),
        },
        {
          key: 'wash-up',
          text: t(
            'Wash your hands and the colander with hot soapy water after handling the raw tripe.',
            'Spală-ți mâinile și strecurătoarea cu apă caldă și săpun după ce ai atins burta crudă.',
          ),
        },
        {
          key: 'simmer-tripe',
          text: t(
            'Lower the heat so it barely bubbles and simmer for 2 and a half hours, until a strip can be cut with the side of a spoon. If it is still rubbery, simmer on and check every 15 minutes.',
            'Dă focul mai mic, ca să abia clocotească, și fierbe 2 ore și jumătate, până când o fâșie se taie cu marginea lingurii. Dacă e încă gumoasă, fierbe în continuare și verifică din 15 în 15 minute.',
          ),
          timerSeconds: 9000,
        },
        {
          key: 'cut',
          text: t(
            'Drain the tripe in the colander, let it cool for 10 minutes and cut it into strips about 1 cm wide and 5 cm long. Discard the cooking water.',
            'Scurge burta în strecurătoare, lasă-o 10 minute să se răcească și taie-o fâșii late de cam 1 cm și lungi de cam 5 cm. Aruncă apa de fiert.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'soffritto',
          text: t(
            'Heat the olive oil in the pot over medium-low heat. Add the onion, carrot and celery and cook for 10 minutes, stirring often, until soft and sweet but not browned.',
            'Încinge uleiul de măsline în oală la foc mediu-mic. Adaugă ceapa, morcovul și țelina pai și gătește 10 minute, amestecând des, până se înmoaie și devin dulci, fără să se rumenească.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'wine',
          text: t(
            'Add the tripe, stir for 1 minute, then pour in the wine and let it bubble for about 4 minutes, until the smell of alcohol is gone. About 5 minutes in all.',
            'Adaugă burta, amestecă 1 minut, apoi toarnă vinul și lasă-l să fiarbă cam 4 minute, până dispare mirosul de alcool. În total, cam 5 minute.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'stew',
          text: t(
            'Add the tomatoes and the 150 ml of water, bring to a simmer and cook uncovered over low heat for 40 minutes, stirring now and then, until the sauce is thick and clings to the tripe.',
            'Adaugă roșiile și cei 150 ml de apă, adu la fierbere ușoară și gătește fără capac, la foc mic, 40 de minute, amestecând din când în când, până când sosul se îngroașă și se prinde de burtă.',
          ),
          timerSeconds: 2400,
        },
        {
          key: 'finish',
          text: t(
            'Take the pot off the heat. Stir in half the Parmesan (30 g), the pepper and the basil. Taste and add salt if needed. Serve with the rest of the Parmesan at the table.',
            'Ia oala de pe foc. Amestecă jumătate din parmezan (30 g), piperul și busuiocul. Gustă și potrivește de sare. Servește cu restul de parmezan la masă.',
          ),
        },
      ],
      tips: [
        t(
          'In Florence and across Italy tripe is often sold already boiled (trippa precotta). If yours is, skip the blanch and the boil and stew it in the sauce, covered, for about 1 to 1 and a half hours, adding a little water as needed, until tender.',
          'La Florența și în toată Italia, burta se vinde adesea deja fiartă (trippa precotta). Dacă a ta e așa, sari peste opărire și fierbere și fierbe-o în sos, cu capac, cam o oră până la o oră și jumătate, adăugând puțină apă la nevoie, până se înmoaie.',
        ),
        t(
          'Cool leftovers within 2 hours and keep them in the fridge for up to 3 days. Reheat until steaming hot at 74 °C; the stew tastes better the next day.',
          'Răcește resturile în maximum 2 ore și ține-le la frigider cel mult 3 zile. Încălzește-le până sunt fierbinți, la 74 °C; tocana e mai bună a doua zi.',
        ),
      ],
      stepTips: [
        {
          step: 'soffritto',
          text: t(
            'Chop the vegetables very fine: they should melt into the sauce rather than stay in pieces.',
            'Taie legumele foarte mărunt: trebuie să se topească în sos, nu să rămână bucăți.',
          ),
        },
      ],
      nutritionNote: t(
        'A hearty stew with plenty of protein from the tripe and vegetables from the tomato sauce. The olive oil is mostly unsaturated fat, the Parmesan and the salt add sodium and some saturated fat, and the tripe adds cholesterol. Serve it with bread and a salad for fibre.',
        'O tocană consistentă, cu multe proteine din burtă și legume din sosul de roșii. Uleiul de măsline are mai ales grăsimi nesaturate, parmezanul și sarea aduc sodiu, parmezanul și ceva grăsimi saturate, iar burta aduce colesterol. Servește-o cu pâine și o salată pentru fibre.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Country bread', 'Pâine de casă'),
          reason: t(
            'A thick slice of crusty country bread mops up the tomato sauce and gives a crisp bite beside the soft tripe.',
            'O felie groasă de pâine de casă cu coajă crocantă strânge sosul de roșii și contrastează cu burta moale.',
          ),
          principle: 'contrast_texture',
          ingredient: 'country-bread',
        },
        {
          kind: 'drink',
          label: t('Red wine', 'Vin roșu'),
          reason: t(
            'A dry red matches the tomato and its acidity cuts the richness of the Parmesan.',
            'Un vin roșu sec se potrivește cu roșiile, iar aciditatea lui taie bogăția parmezanului.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'red-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A thick, hot stew that warms you through.',
            'O tocană groasă și fierbinte care te încălzește.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A heavy, tomato-rich stew can cause heartburn before bed.',
            'O tocană grea, cu multe roșii, poate da arsuri înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'ciorba-de-burta-polish',
      cuisine: 'polish',
      hideBaseTips: [0, 1, 2, 4],
      title: t(
        'Flaki (Polish tripe soup with marjoram)',
        'Flaki (supă poloneză de burtă cu maghiran)',
      ),
      servings: 6,
      prepMinutes: 25,
      cookMinutes: 285,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'beef-tripe',
          quantity: 800,
          unit: 'g',
          note: t('cleaned (white) tripe', 'burtă curățată (albă)'),
        },
        { ingredient: 'beef-soup-bones', quantity: 500, unit: 'g' },
        { ingredient: 'still-water', quantity: 3, unit: 'l' },
        {
          ingredient: 'bay-leaves',
          quantity: 0.4,
          unit: 'g',
          note: t('2 leaves', '2 foi'),
        },
        { ingredient: 'allspice-berries', quantity: 3, unit: 'g' },
        {
          ingredient: 'salt',
          quantity: 16,
          unit: 'g',
          note: t(
            'added at the end of the simmer, to taste',
            'adăugată la sfârșit, după gust',
          ),
        },
        {
          ingredient: 'carrot',
          quantity: 200,
          unit: 'g',
          note: t('peeled, in thin strips', 'curățați, tăiați fâșii subțiri'),
        },
        {
          ingredient: 'parsley-root',
          quantity: 80,
          unit: 'g',
          note: t('peeled, in thin strips', 'curățată, tăiată fâșii subțiri'),
        },
        {
          ingredient: 'celeriac',
          quantity: 150,
          unit: 'g',
          note: t('peeled, in thin strips', 'curățată, tăiată fâșii subțiri'),
        },
        { ingredient: 'butter', quantity: 40, unit: 'g' },
        { ingredient: 'flour', quantity: 40, unit: 'g' },
        { ingredient: 'marjoram', quantity: 5, unit: 'g' },
        { ingredient: 'nutmeg', quantity: 1, unit: 'g' },
        { ingredient: 'ground-ginger', quantity: 1, unit: 'g' },
        {
          ingredient: 'paprika',
          quantity: 4,
          unit: 'g',
          note: t('sweet', 'dulce'),
        },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
      ],
      steps: [
        {
          key: 'blanch',
          text: t(
            'Put the tripe in a 6 litre pot, cover with cold water and bring to the boil. Boil for 5 minutes, then carry the pot to the sink and pour the water through a colander. Do not rinse the tripe. Rinse out the pot.',
            'Pune burta într-o oală de 6 litri, acoperă-o cu apă rece și adu la fierbere. Fierbe 5 minute, apoi du oala la chiuvetă și strecoară apa printr-o strecurătoare. Nu clăti burta. Clătește oala.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'start-stock',
          text: t(
            'Put the blanched tripe and the beef bones in the pot and cover with the 3 litres of cold water.',
            'Pune în oală burta opărită și oasele de vită și acoperă cu cei 3 litri de apă rece.',
          ),
        },
        {
          key: 'wash-up',
          text: t(
            'Wash your hands, the colander and anything else that touched the raw tripe or bones with hot soapy water.',
            'Spală-ți mâinile, strecurătoarea și tot ce a atins burta sau oasele crude cu apă caldă și săpun.',
          ),
        },
        {
          key: 'skim',
          text: t(
            'Bring slowly to the boil over medium heat, about 20 minutes. As the grey foam rises, skim it off with a spoon until the surface is clear.',
            'Adu încet la fierbere la foc mediu, cam 20 de minute. Pe măsură ce se ridică spuma cenușie, ia-o cu lingura până când suprafața e limpede.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'simmer-tripe',
          text: t(
            'Add the bay leaves and allspice berries. Lower the heat so the soup barely bubbles, put the lid on ajar and simmer for 3 hours, until a strip of tripe can be cut with the side of a spoon. If it is still rubbery, simmer on and check every 15 minutes.',
            'Adaugă foile de dafin și boabele de ienibahar. Dă focul mai mic, ca supa să abia clocotească, pune capacul întredeschis și fierbe 3 ore, până când o fâșie de burtă se taie cu marginea lingurii. Dacă e încă gumoasă, fierbe în continuare și verifică din 15 în 15 minute.',
          ),
          timerSeconds: 10800,
        },
        {
          key: 'strain',
          text: t(
            'Lift the tripe and bones onto a clean plate. Strain the stock through a sieve into a clean pot of at least 4 litres, discard the bay leaves and allspice, and spoon the excess fat off the surface. Let the tripe cool for 10 minutes.',
            'Scoate burta și oasele pe o farfurie curată. Strecoară supa printr-o sită într-o oală curată de cel puțin 4 litri, aruncă foile de dafin și ienibaharul și ia cu lingura surplusul de grăsime de la suprafață. Lasă burta 10 minute să se răcească.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'cut',
          text: t(
            'Cut the tripe into thin strips about 5 cm long and discard the bones. Return the tripe to the stock.',
            'Taie burta fâșii subțiri de cam 5 cm și aruncă oasele. Pune burta înapoi în supă.',
          ),
        },
        {
          key: 'vegetables',
          text: t(
            'Add the carrot, parsley root and celeriac strips to the stock, bring to a simmer and cook for 15 to 20 minutes, until tender.',
            'Adaugă în supă fâșiile de morcov, rădăcină de pătrunjel și țelină, adu la fierbere ușoară și fierbe 15-20 de minute, până se înmoaie.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'roux',
          text: t(
            'While the vegetables cook, melt the butter in a small pan over low heat, stir in the flour and cook for 2 minutes, stirring, until it smells nutty and is pale gold. Add a ladle of hot stock and stir until smooth.',
            'În timp ce se fierb legumele, topește untul într-o tigăiță la foc mic, amestecă făina și gătește 2 minute, amestecând, până miroase a nucă și e galben-pal. Adaugă un polonic de supă fierbinte și amestecă până se omogenizează.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'thicken',
          text: t(
            'Stir the roux into the soup and simmer for 5 minutes, stirring, until the soup is lightly thickened.',
            'Amestecă rântașul în supă și fierbe 5 minute, amestecând, până când supa se îngroașă ușor.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'season',
          text: t(
            'Take the pot off the heat. Rub the marjoram between your palms into the soup, then add the nutmeg, ginger and paprika a little at a time, tasting, followed by the pepper and 16 g of salt. Adjust. Let it stand for 5 minutes and serve hot.',
            'Ia oala de pe foc. Freacă maghiranul între palme deasupra supei, apoi adaugă nucșoara, ghimbirul și boia puțin câte puțin, gustând, apoi piperul și 16 g de sare. Potrivește. Lasă 5 minute și servește fierbinte.',
          ),
          timerSeconds: 300,
        },
      ],
      tips: [
        t(
          'Marjoram goes in at the end, off the heat: its flavour fades with long cooking, and it is the herb that makes flaki taste like flaki.',
          'Maghiranul se pune la sfârșit, de pe foc: aroma lui slăbește la fierbere lungă, iar el e cel care dă gustul de flaki.',
        ),
        t(
          'Flaki is sharper and peppery rather than sour; season in small pinches and taste, because ginger and nutmeg quickly take over.',
          'Flaki e mai degrabă iute și piperat decât acru; condimentează cu câte un vârf de cuțit și gustă, fiindcă ghimbirul și nucșoara domină repede.',
        ),
        t(
          'Cool leftovers within 2 hours and keep them in the fridge for up to 3 days. Reheat until steaming hot at 74 °C; the soup is often better the next day.',
          'Răcește resturile în maximum 2 ore și ține-le la frigider cel mult 3 zile. Încălzește-le până sunt fierbinți, la 74 °C; supa e adesea mai bună a doua zi.',
        ),
      ],
      stepTips: [
        {
          step: 'roux',
          text: t(
            'Cook the flour until it smells nutty but stay with it: a roux that scorches turns bitter, so keep it pale gold.',
            'Gătește făina până miroase a nucă, dar nu te depărta: un rântaș care se arde se face amar, așa că ține-l galben-pal.',
          ),
        },
      ],
      nutritionNote: t(
        'A thick, filling soup with plenty of protein from the tripe and some vegetables. The butter and roux add saturated fat and refined flour, the tripe adds cholesterol, and the salt adds sodium. Spices give plenty of flavour without extra salt.',
        'O supă groasă și săturătoare, cu multe proteine din burtă și ceva legume. Untul și rântașul aduc grăsimi saturate și făină rafinată, burta aduce colesterol, iar sarea aduce sodiu. Condimentele dau mult gust fără sare în plus.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Bread rolls', 'Chifle'),
          reason: t(
            'A crusty roll gives a crisp bite beside the soft tripe and soaks up the peppery broth.',
            'O chiflă cu coajă crocantă oferă o mușcătură crocantă lângă burta moale și se înmoaie în supa piperată.',
          ),
          principle: 'contrast_texture',
          ingredient: 'bread-rolls',
        },
        {
          kind: 'drink',
          label: t('Beer', 'Bere'),
          reason: t(
            'A cold lager cleanses the palate between spoonfuls of the rich, spiced soup.',
            'O bere blondă rece răcorește gustul între lingurile de supă bogată și condimentată.',
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
            'A hot, spiced soup that warms you through.',
            'O supă fierbinte și condimentată care te încălzește.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A heavy, spiced soup can sit uncomfortably before bed.',
            'O supă grea și condimentată te poate încurca înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
