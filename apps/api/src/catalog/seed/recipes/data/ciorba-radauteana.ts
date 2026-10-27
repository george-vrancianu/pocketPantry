import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Ciorbă rădăuțeană base is the Romanian chicken soup thickened and
// soured with sour cream, egg yolks, garlic and vinegar. Each Variant is a
// full Recipe with its own lines, steps and guidance; the base's Recipe-level
// Tips are inherited unless hidden.
export const ciorbaRadauteana: BaseRecipeSeed = {
  slug: 'ciorba-radauteana',
  title: t(
    'Ciorbă rădăuțeană (Romanian sour chicken soup with garlic and sour cream)',
    'Ciorbă rădăuțeană',
  ),
  servings: 6,
  prepMinutes: 25,
  cookMinutes: 120,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'whole-chicken',
      quantity: 1500,
      unit: 'g',
      note: t('cut into 8 pieces', 'tăiat în 8 bucăți'),
    },
    { ingredient: 'still-water', quantity: 3, unit: 'l' },
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
      ingredient: 'carrot',
      quantity: 250,
      unit: 'g',
      note: t('cut into rounds', 'tăiați rondele'),
    },
    {
      ingredient: 'parsnip',
      quantity: 100,
      unit: 'g',
      note: t('cut into rounds', 'tăiat rondele'),
    },
    {
      ingredient: 'parsley-root',
      quantity: 80,
      unit: 'g',
      optional: true,
      note: t('cut into rounds', 'tăiată rondele'),
    },
    {
      ingredient: 'celeriac',
      quantity: 150,
      unit: 'g',
      note: t('peeled, in small cubes', 'curățată, tăiată cubulețe'),
    },
    {
      ingredient: 'bell-pepper',
      quantity: 1,
      unit: 'pcs',
      optional: true,
      note: t('in thin strips', 'tăiat fâșii subțiri'),
    },
    { ingredient: 'salt', quantity: 18, unit: 'g' },
    { ingredient: 'sour-cream', quantity: 300, unit: 'g' },
    {
      ingredient: 'eggs',
      quantity: 3,
      unit: 'pcs',
      note: t('yolks only', 'doar gălbenușurile'),
    },
    {
      ingredient: 'garlic',
      quantity: 20,
      unit: 'g',
      note: t('5 cloves, crushed', '5 căței, striviți'),
    },
    {
      ingredient: 'vinegar',
      quantity: 40,
      unit: 'ml',
      note: t('to taste', 'după gust'),
    },
    {
      ingredient: 'lovage',
      quantity: 15,
      unit: 'g',
      optional: true,
      note: t('chopped', 'tocat'),
    },
    {
      ingredient: 'parsley',
      quantity: 15,
      unit: 'g',
      optional: true,
      note: t('chopped', 'tocat'),
    },
  ],
  steps: [
    {
      key: 'start',
      text: t(
        'Put the chicken pieces in a 6 litre pot and cover with the cold water. Wash your hands, the board and the knife with hot soapy water after handling the raw chicken.',
        'Pune bucățile de pui într-o oală de 6 litri și acoperă-le cu apa rece. Spală-ți mâinile, tocătorul și cuțitul cu apă caldă și săpun după ce ai atins puiul crud.',
      ),
    },
    {
      key: 'skim',
      text: t(
        'Set the pot over medium heat and bring it slowly to the boil, about 20 minutes. As grey foam rises, skim it off with a spoon until the surface is clear.',
        'Pune oala la foc mediu și adu încet la fierbere, cam 20 de minute. Pe măsură ce se ridică spuma cenușie, ia-o cu lingura până când suprafața e limpede.',
      ),
    },
    {
      key: 'simmer-chicken',
      text: t(
        'Add the whole onion, bay leaves, peppercorns and salt. Lower the heat so the broth barely bubbles, cover with the lid ajar, and simmer for 30 minutes.',
        'Adaugă ceapa întreagă, foile de dafin, boabele de piper și sarea. Dă focul mai mic, ca supa să fiarbă domol, abia să clocotească, pune capacul întredeschis și fierbe 30 de minute.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'vegetables',
      text: t(
        'Add the carrots, parsnip, parsley root, celeriac and bell pepper. Simmer for another 30 minutes, until the vegetables are tender when pierced with a knife.',
        'Adaugă morcovii, păstârnacul, rădăcina de pătrunjel, țelina și ardeiul. Mai fierbe 30 de minute, până când legumele se străpung ușor cu cuțitul.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'check-chicken',
      text: t(
        'Test the chicken: a thermometer in the thickest part of a thigh must read 75 °C, the meat must have no pink and the juices must run clear. If not, simmer 5 minutes more and test again. Lift the pieces onto a clean plate and let them cool for 10 minutes.',
        'Verifică puiul: un termometru băgat în partea cea mai groasă a pulpei trebuie să arate 75 °C, carnea să nu mai fie roz, iar zeama să curgă limpede. Dacă nu, mai fierbe 5 minute și verifică din nou. Scoate bucățile pe o farfurie curată și lasă-le 10 minute să se răcească.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'liaison',
      text: t(
        'While the chicken cools, separate the eggs and put the 3 yolks in a large bowl (keep the whites for another dish). Add the sour cream and the crushed garlic and whisk until smooth. Wash your hands after handling the raw eggs.',
        'Cât se răcește puiul, separă ouăle și pune cele 3 gălbenușuri într-un bol mare (albușurile le păstrezi pentru altceva). Adaugă smântâna și usturoiul pisat și amestecă până se omogenizează. Spală-ți mâinile după ce ai atins ouăle crude.',
      ),
    },
    {
      key: 'pull',
      text: t(
        'Spoon the fat off the surface of the broth. Pull the meat off the bones in bite-size pieces and discard the skin and bones. Fish the onion and bay leaves out of the pot. Return the meat to the pot, bring it back to a gentle simmer, then take the pot off the heat and wait until it stops bubbling.',
        'Ia grăsimea de la suprafața supei cu lingura. Desprinde carnea de pe oase în bucăți mici și aruncă pielea și oasele. Scoate ceapa și foile de dafin din oală. Pune carnea înapoi în oală, adu-o din nou la o fierbere ușoară, apoi ia oala de pe foc și așteaptă să nu mai bolborosească.',
      ),
    },
    {
      key: 'temper',
      text: t(
        'Add about 6 small ladles (about 400 ml) of hot broth to the sour cream mix one at a time, whisking constantly, until the mix is warm and runny.',
        'Pune în amestecul de smântână cam 6 polonice mici (cam 400 ml) de supă fierbinte, pe rând, amestecând continuu, până când compoziția e caldă și curge.',
      ),
    },
    {
      key: 'stir-in',
      text: t(
        'Pour the tempered mix into the pot in a thin stream, stirring all the time. Put the pot back on the lowest heat.',
        'Toarnă amestecul temperat în oală într-un fir subțire, amestecând mereu. Pune oala înapoi pe foc foarte mic.',
      ),
    },
    {
      key: 'heat-liaison',
      text: t(
        'Stir gently for about 4 minutes, until the soup steams, turns slightly thicker and creamy and reads at least 71 °C on a thermometer. Do not let it boil. Reaching 71 °C is what makes the yolks safe for children, older people, anyone pregnant and anyone immunocompromised, so check it with a thermometer rather than by eye.',
        'Amestecă ușor cam 4 minute, până când supa scoate abur, se îngroașă puțin, devine cremoasă și termometrul arată cel puțin 71 °C. Nu o lăsa să fiarbă. Atingerea a 71 °C face gălbenușurile sigure pentru copii, vârstnici, gravide și persoane cu imunitate scăzută, așa că verifică cu termometrul, nu din ochi.',
      ),
      timerSeconds: 240,
    },
    {
      key: 'sour',
      text: t(
        'Take the pot off the heat. Stir in 40 ml of vinegar, taste, and add more a spoonful at a time until pleasantly sour. Add salt if needed, then the lovage and parsley, and serve at once.',
        'Ia oala de pe foc. Amestecă 40 ml de oțet, gustă și mai adaugă câte o lingură până când supa e plăcut acrișoară. Potrivește de sare, adaugă leușteanul și pătrunjelul și servește imediat.',
      ),
    },
  ],
  tips: [
    t(
      'Once the sour cream and yolks are in, never let the soup boil: the sour cream splits and the yolks turn grainy. Keep it steaming, at least 71 °C but below the boil, on the lowest heat.',
      'După ce ai pus smântâna și gălbenușurile, nu mai lăsa supa să fiarbă: smântâna se taie, iar gălbenușurile se fac grunji. Ține-o fierbinte, să scoată abur (cel puțin 71 °C, dar sub fierbere), pe foc foarte mic.',
    ),
    t(
      'Vinegar strength varies from bottle to bottle. Start with a little, add a spoonful at a time and taste after each, so the soup ends up pleasantly tart and not sharp.',
      'Tăria oțetului diferă de la sticlă la sticlă. Pornește cu puțin, adaugă câte o lingură și gustă după fiecare, ca ciorba să iasă plăcut acrișoară, nu ascuțită.',
    ),
    t(
      'Freeze the leftover egg whites, or use them within 2 days in an omelette or a batter.',
      'Albușurile rămase le poți îngheța sau le poți folosi în maximum 2 zile într-o omletă sau într-un aluat.',
    ),
    t(
      'Cool leftovers within 2 hours and keep them in the fridge for up to 2 days. Reheat gently over low heat, stirring, until steaming hot at 74 °C. Avoid a hard boil.',
      'Răcește resturile în maximum 2 ore și ține-le la frigider cel mult 2 zile. Încălzește-le încet, pe foc mic, amestecând, până când sunt fierbinți, la 74 °C. Evită fierberea puternică.',
    ),
  ],
  stepTips: [
    {
      step: 'liaison',
      text: t(
        'Use full-fat (20%) sour cream; low-fat sour cream splits in hot soup.',
        'Folosește smântână grasă (20%); cea slabă se taie în supa fierbinte.',
      ),
    },
    {
      step: 'temper',
      text: t(
        'Add the broth slowly while whisking. Hot broth poured in fast cooks the yolks into small scrambled bits.',
        'Adaugă supa încet, amestecând. Dacă torni supa fierbinte repede, gălbenușurile se taie în bucățele ca niște ouă jumări.',
      ),
    },
    {
      step: 'check-chicken',
      text: t(
        'If the breast is done before the legs, lift it out first: it dries out when it simmers too long.',
        'Dacă pieptul e gata înaintea pulpelor, scoate-l primul: se usucă dacă fierbe prea mult.',
      ),
    },
  ],
  nutritionNote: t(
    'Chicken and vegetables make a filling, protein-rich soup. The sour cream and egg yolks add saturated fat, and the salt adds sodium, so serve a modest bowl and skim the broth well. The soup is light on fibre unless you add plenty of vegetables and have it with bread.',
    'Puiul și legumele fac o supă săturătoare și bogată în proteine. Smântâna și gălbenușurile aduc grăsimi saturate, iar sarea aduce sodiu, așa că servește o porție moderată și degresează bine supa. Aduce puține fibre, dacă nu pui multe legume și nu o mănânci cu pâine.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Hot peppers', 'Ardei iute'),
      reason: t(
        'A bite of fresh hot pepper sharpens the soft, creamy sourness of the soup.',
        'O mușcătură de ardei iute proaspăt înviorează acrișorul cremos al supei.',
      ),
      principle: 'complement_flavour',
      ingredient: 'hot-pepper',
    },
    {
      kind: 'food',
      label: t('Fresh bread', 'Pâine proaspătă'),
      reason: t(
        'Fresh bread soaks up the creamy broth, and its crust gives a crisp bite next to the soft chicken.',
        'Pâinea proaspătă se înmoaie în supa cremoasă, iar coaja crocantă contrastează cu carnea moale de pui.',
      ),
      principle: 'contrast_texture',
      ingredient: 'bread',
    },
    {
      kind: 'drink',
      label: t('Dry white wine', 'Vin alb sec'),
      reason: t(
        'Its acidity matches the tang of the soup and refreshes the palate after the sour cream.',
        'Aciditatea lui se potrivește cu acrișorul supei și răcorește gustul după smântână.',
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
        'A hot, soured soup that warms you through.',
        'O supă fierbinte și acrișoară care te încălzește.',
      ),
    },
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'One bowl with bread is a full lunch without being heavy.',
        'Un bol cu pâine face un prânz complet, fără să fie greu.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'The garlic and vinegar can cause heartburn before bed.',
        'Usturoiul și oțetul pot da arsuri înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'ciorba-radauteana-turkish',
      cuisine: 'turkish',
      hideBaseTips: [0, 1],
      title: t(
        'Yayla çorbası (Turkish yogurt and rice soup with mint)',
        'Yayla çorbası (supă turcească de iaurt cu orez și mentă)',
      ),
      servings: 4,
      prepMinutes: 10,
      cookMinutes: 35,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'chicken-stock',
          quantity: 1200,
          unit: 'ml',
          note: t(
            'ready to use, or made from cube or concentrate as the pack directs',
            'gata de folosit, sau preparată din cub ori concentrat după instrucțiunile de pe ambalaj',
          ),
        },
        { ingredient: 'still-water', quantity: 0.3, unit: 'l' },
        {
          ingredient: 'round-rice',
          quantity: 80,
          unit: 'g',
          note: t('rinsed', 'spălat'),
        },
        { ingredient: 'yogurt', quantity: 400, unit: 'g' },
        {
          ingredient: 'eggs',
          quantity: 1,
          unit: 'pcs',
          note: t('yolk only', 'doar gălbenușul'),
        },
        { ingredient: 'flour', quantity: 20, unit: 'g' },
        { ingredient: 'butter', quantity: 30, unit: 'g' },
        { ingredient: 'dried-mint', quantity: 3, unit: 'g' },
        { ingredient: 'pul-biber', quantity: 2, unit: 'g', optional: true },
        { ingredient: 'salt', note: t('to taste', 'după gust') },
      ],
      steps: [
        {
          key: 'boil',
          text: t(
            'Bring the stock and water to the boil in a medium pot and stir in the rinsed rice.',
            'Adu supa și apa la fierbere într-o oală mijlocie și amestecă orezul spălat.',
          ),
        },
        {
          key: 'rice',
          text: t(
            'Lower the heat and simmer for 15 minutes, stirring now and then, until the rice is soft and the broth is slightly thicker.',
            'Dă focul mai mic și fierbe 15 minute, amestecând din când în când, până când orezul e moale, iar supa puțin mai groasă.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'mix',
          text: t(
            'Meanwhile, put the yogurt, egg yolk and flour in a large bowl and whisk until completely smooth, with no lumps of flour. Wash your hands after handling the raw egg.',
            'Între timp, pune iaurtul, gălbenușul și făina într-un bol mare și amestecă până se omogenizează complet, fără cocoloașe de făină. Spală-ți mâinile după ce ai atins oul crud.',
          ),
        },
        {
          key: 'temper',
          text: t(
            'Take the pot off the heat. Add 4 ladles of hot stock to the yogurt mix one at a time, whisking constantly, until it is warm and runny.',
            'Ia oala de pe foc. Pune în amestecul de iaurt 4 polonice de supă fierbinte, pe rând, amestecând continuu, până când e cald și curge.',
          ),
        },
        {
          key: 'stir-in',
          text: t(
            'Pour the tempered mix into the pot, stirring all the time, and put it back on low heat.',
            'Toarnă amestecul temperat în oală, amestecând mereu, și pune-o înapoi pe foc mic.',
          ),
        },
        {
          key: 'thicken',
          text: t(
            'Stir constantly for about 5 minutes, until the soup comes to a gentle simmer with only a few bubbles and is lightly thickened. The flour is what keeps the yogurt from splitting, so keep stirring.',
            'Amestecă continuu cam 5 minute, până când supa ajunge la o fierbere ușoară, cu doar câteva bule, și se îngroașă ușor. Făina e cea care ține iaurtul să nu se taie, așa că nu înceta să amesteci.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'mint-butter',
          text: t(
            'Melt the butter in a small pan until it foams. Take it off the heat, stir in the mint and pul biber for 20 seconds, then pour the sizzling butter over the soup.',
            'Topește untul într-o tigăiță mică până face spumă. Ia tigaia de pe foc, amestecă menta și pul biber 20 de secunde, apoi toarnă untul sfârâind peste supă.',
          ),
          timerSeconds: 20,
        },
      ],
      tips: [
        t(
          'For a vegetarian version, cook the rice in vegetable stock or lightly salted water instead of chicken stock.',
          'Pentru o variantă vegetariană, fierbe orezul în supă de legume sau în apă ușor sărată, în loc de supă de pui.',
        ),
      ],
      stepTips: [
        {
          step: 'mint-butter',
          text: t(
            'If the mint turns dark brown it is burnt and bitter; start the butter again.',
            'Dacă menta se face maronie închis, e arsă și amară; ia untul de la capăt.',
          ),
        },
      ],
      nutritionNote: t(
        'Yogurt and rice make a soft, filling soup that is easy to eat when you are tired. The butter adds saturated fat, and stock adds salt, so use a light hand with both. It has little fibre and almost no vegetables.',
        'Iaurtul și orezul fac o supă moale și săturătoare, ușor de mâncat când ești obosit. Untul aduce grăsimi saturate, iar supa de pui aduce sare, așa că folosește-le cu măsură. Are puține fibre și aproape deloc legume.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Warm pita', 'Lipie caldă'),
          reason: t(
            'Warm flatbread is good for mopping up the mint butter and the creamy soup.',
            'Lipia caldă e bună de înmuiat în untul cu mentă și în supă.',
          ),
          principle: 'contrast_texture',
          ingredient: 'pita',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A warm, creamy soup with rice that comforts on a cold day.',
            'O supă caldă și cremoasă, cu orez, care alină într-o zi rece.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Quick to make and gentle on the stomach.',
            'Se face repede și e blândă cu stomacul.',
          ),
        },
      ],
    },
    {
      slug: 'ciorba-radauteana-georgian',
      cuisine: 'georgian',
      hideBaseTips: [0, 1],
      title: t(
        'Chikhirtma (Georgian chicken soup with egg, vinegar and coriander)',
        'Chikhirtma (supă georgiană de pui cu ou, oțet și coriandru)',
      ),
      servings: 6,
      prepMinutes: 25,
      cookMinutes: 130,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'whole-chicken',
          quantity: 1500,
          unit: 'g',
          note: t('cut into 8 pieces', 'tăiat în 8 bucăți'),
        },
        { ingredient: 'still-water', quantity: 3, unit: 'l' },
        {
          ingredient: 'bay-leaves',
          quantity: 0.4,
          unit: 'g',
          note: t('2 leaves', '2 foi'),
        },
        { ingredient: 'peppercorns', quantity: 3, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 4,
          unit: 'pcs',
          note: t('thinly sliced', 'tăiate subțire'),
        },
        { ingredient: 'butter', quantity: 60, unit: 'g' },
        { ingredient: 'flour', quantity: 40, unit: 'g' },
        { ingredient: 'ground-coriander', quantity: 3, unit: 'g' },
        {
          ingredient: 'eggs',
          quantity: 4,
          unit: 'pcs',
          note: t('yolks only', 'doar gălbenușurile'),
        },
        {
          ingredient: 'wine-vinegar',
          quantity: 40,
          unit: 'ml',
          note: t(
            '30 ml in the yolks, 10 ml to taste at the end',
            '30 ml în gălbenușuri, 10 ml la final, după gust',
          ),
        },
        {
          ingredient: 'garlic',
          quantity: 15,
          unit: 'g',
          note: t('4 cloves, crushed', '4 căței, striviți'),
        },
        {
          ingredient: 'coriander',
          quantity: 40,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        { ingredient: 'salt', quantity: 15, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'start',
          text: t(
            'Put the chicken pieces in a 6 litre pot with the bay leaves, peppercorns and the cold water. Wash your hands, the board and the knife with hot soapy water after handling the raw chicken.',
            'Pune bucățile de pui într-o oală de 6 litri, cu foile de dafin, boabele de piper și apa rece. Spală-ți mâinile, tocătorul și cuțitul cu apă caldă și săpun după ce ai atins puiul crud.',
          ),
        },
        {
          key: 'skim',
          text: t(
            'Bring slowly to the boil over medium heat, about 20 minutes, skimming off the grey foam. Add 10 g of the salt.',
            'Adu încet la fierbere la foc mediu, cam 20 de minute, luând spuma cenușie. Adaugă 10 g din sare.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Lower the heat so the broth barely bubbles and simmer for 55 minutes.',
            'Dă focul mai mic, ca supa să fiarbă domol, abia să clocotească, și fierbe 55 de minute.',
          ),
          timerSeconds: 3300,
        },
        {
          key: 'onions',
          text: t(
            'While the chicken simmers, melt the butter in a wide pan over medium-low heat. Add the sliced onions and a pinch of the remaining salt and cook for 15 minutes, stirring, until soft and pale gold, not browned.',
            'Cât fierbe puiul, topește untul într-o tigaie lată la foc mic-mediu. Adaugă ceapa tăiată subțire și un praf din sarea rămasă și călește 15 minute, amestecând, până se înmoaie și capătă o culoare aurie deschisă, fără să se rumenească.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'check-chicken',
          text: t(
            'Test the chicken: a thermometer in the thickest part of a thigh must read 75 °C, the meat must have no pink and the juices must run clear. If not, simmer 5 minutes more and test again. Lift the pieces onto a clean plate and let them cool for 10 minutes, then pull the meat off the bones and discard the skin and bones. Strain the broth into a large bowl, rinse the pot and set it aside.',
            'Verifică puiul: un termometru băgat în partea cea mai groasă a pulpei trebuie să arate 75 °C, carnea să nu mai fie roz, iar zeama să curgă limpede. Dacă nu, mai fierbe 5 minute și verifică din nou. Scoate bucățile pe o farfurie curată, lasă-le 10 minute să se răcească, apoi desprinde carnea de pe oase și aruncă pielea și oasele. Strecoară supa într-un bol mare, clătește oala și lasă-o deoparte.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'roux',
          text: t(
            'Sprinkle the flour and ground coriander over the onions and stir for 2 minutes over low heat, until the flour smells toasty and no dry streaks remain.',
            'Presară făina și coriandrul măcinat peste ceapă și amestecă 2 minute pe foc mic, până când făina miroase a prăjit și nu mai sunt dungi uscate.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'loosen',
          text: t(
            'Add 1 litre of the hot strained broth from the bowl to the onion pan, a ladle at a time, stirring well after each so no lumps form. Simmer for 10 minutes, until the soup is lightly thickened and the flour no longer tastes raw.',
            'Adaugă în tigaia cu ceapă 1 litru din supa strecurată, fierbinte, din bol, câte un polonic, amestecând bine după fiecare ca să nu se facă cocoloașe. Fierbe 10 minute, până când supa se îngroașă ușor, iar făina nu mai are gust de crud.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'combine',
          text: t(
            'Scrape the onion mixture into the clean pot, add the rest of the broth and the pulled chicken, and bring it back to a gentle simmer for 5 minutes. Take the pot off the heat and wait until it stops bubbling. Remove the bay leaves.',
            'Răzuiește amestecul de ceapă în oala curată, adaugă restul de supă și carnea de pui desprinsă și adu din nou la o fierbere ușoară, 5 minute. Ia oala de pe foc și așteaptă să nu mai bolborosească. Scoate foile de dafin.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'liaison',
          text: t(
            'Separate the eggs and whisk the 4 yolks with 30 ml of the wine vinegar and the crushed garlic in a large bowl (keep the whites for another dish). Wash your hands after handling the raw eggs.',
            'Separă ouăle și bate cele 4 gălbenușuri cu 30 ml din oțetul de vin și usturoiul pisat într-un bol mare (albușurile le păstrezi pentru altceva). Spală-ți mâinile după ce ai atins ouăle crude.',
          ),
        },
        {
          key: 'temper',
          text: t(
            'Add about 6 small ladles (about 400 ml) of the hot soup to the yolk mix one at a time, whisking constantly, until it is warm and runny.',
            'Pune în amestecul de gălbenușuri cam 6 polonice mici (cam 400 ml) de supă fierbinte, pe rând, amestecând continuu, până când e cald și curge.',
          ),
        },
        {
          key: 'stir-in',
          text: t(
            'Pour the tempered mix into the pot in a thin stream, stirring all the time, and put it back on the lowest heat.',
            'Toarnă amestecul temperat în oală într-un fir subțire, amestecând mereu, și pune oala înapoi pe foc foarte mic.',
          ),
        },
        {
          key: 'heat-liaison',
          text: t(
            'Stir gently for about 4 minutes, until the soup steams, thickens slightly and reads at least 71 °C on a thermometer. Do not let it boil. Reaching 71 °C is what makes the yolks safe for children, older people, anyone pregnant and anyone immunocompromised, so check it with a thermometer rather than by eye.',
            'Amestecă ușor cam 4 minute, până când supa scoate abur, se îngroașă puțin și termometrul arată cel puțin 71 °C. Nu o lăsa să fiarbă. Atingerea a 71 °C face gălbenușurile sigure pentru copii, vârstnici, gravide și persoane cu imunitate scăzută, așa că verifică cu termometrul, nu din ochi.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'finish',
          text: t(
            'Take the pot off the heat, stir in the fresh coriander and the black pepper, taste, and adjust the salt and the remaining 10 ml of vinegar. Serve hot.',
            'Ia oala de pe foc, amestecă coriandrul proaspăt și piperul negru, gustă și potrivește de sare și de restul de 10 ml de oțet. Servește fierbinte.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'onions',
          text: t(
            'The onions are the body of this soup: cook them slowly and do not let them brown, or the soup loses its pale colour and gentle sweetness.',
            'Ceapa dă corp supei: o călești încet și nu o lași să se rumenească, altfel supa își pierde culoarea deschisă și dulceața blândă.',
          ),
        },
      ],
      nutritionNote: t(
        'A filling chicken soup with a lot of cooked onion. The butter and egg yolks add saturated fat, and the flour thickens without adding much else. It is light on vegetables beyond the onion, so serve it with a fresh salad for fibre.',
        'O supă de pui săturătoare, cu multă ceapă fiartă. Untul și gălbenușurile aduc grăsimi saturate, iar făina doar îngroașă supa. Are puține legume în afară de ceapă, așa că servește-o cu o salată proaspătă pentru fibre.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Fresh bread', 'Pâine proaspătă'),
          reason: t(
            'Bread soaks up the tangy, silky broth.',
            'Pâinea se înmoaie bine în supa mătăsoasă și acrișoară.',
          ),
          principle: 'contrast_texture',
          ingredient: 'bread',
        },
        {
          kind: 'food',
          label: t('Pickled peppers', 'Ardei murați'),
          reason: t(
            'A sharp, briny crunch next to the soft, buttery onions.',
            'O notă ascuțită, sărată și crocantă, lângă ceapa moale, cu gust de unt.',
          ),
          principle: 'contrast_texture',
          ingredient: 'pickled-peppers',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its acidity echoes the vinegar and cuts through the butter and yolks.',
            'Aciditatea lui se potrivește cu oțetul și taie din bogăția untului și a gălbenușurilor.',
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
            'A hot, tangy soup that warms you through.',
            'O supă fierbinte și acrișoară care te încălzește.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'The garlic and vinegar can cause heartburn before bed.',
            'Usturoiul și oțetul pot da arsuri înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
