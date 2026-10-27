import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Ciorbă de varză base is the Romanian sauerkraut soup with smoked pork:
// the sauerkraut and its brine are the souring, so there is no borș. Each
// Variant is a full Recipe with its own lines, steps and guidance; the base's
// Recipe-level Tips are inherited unless hidden.
export const ciorbaDeVarza: BaseRecipeSeed = {
  slug: 'ciorba-de-varza',
  title: t(
    'Romanian sauerkraut sour soup with smoked pork (ciorbă de varză)',
    'Ciorbă de varză acră cu afumătură',
  ),
  servings: 6,
  prepMinutes: 25,
  cookMinutes: 120,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'smoked-pork',
      quantity: 700,
      unit: 'g',
      note: t(
        'smoked ribs or a piece on the bone',
        'coaste afumate sau o bucată cu os',
      ),
    },
    {
      ingredient: 'still-water',
      quantity: 3,
      unit: 'l',
      note: t('cold, for the pot', 'rece, pentru oală'),
    },
    {
      ingredient: 'sauerkraut',
      quantity: 800,
      unit: 'g',
      note: t(
        'chopped fine; squeeze it out over a bowl and keep about 200 ml of the brine, or more if there is plenty, for souring the soup at the end',
        'tocată mărunt; stoar-o deasupra unui bol și păstrează cam 200 ml de zeamă, sau mai multă dacă ai, pentru a acri ciorba la final',
      ),
    },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('diced', 'tăiate cubulețe'),
    },
    {
      ingredient: 'carrot',
      quantity: 200,
      unit: 'g',
      note: t('diced small', 'tăiați cubulețe mici'),
    },
    {
      ingredient: 'bell-pepper',
      quantity: 1,
      unit: 'pcs',
      optional: true,
      note: t('red, seeded, diced', 'roșu, curățat de semințe, tăiat cubulețe'),
    },
    { ingredient: 'sunflower-oil', quantity: 50, unit: 'ml' },
    { ingredient: 'tomato-paste', quantity: 40, unit: 'g' },
    {
      ingredient: 'bay-leaves',
      quantity: 0.4,
      unit: 'g',
      note: t('about 2 leaves', 'cam 2 foi'),
    },
    { ingredient: 'peppercorns', quantity: 3, unit: 'g' },
    {
      ingredient: 'round-rice',
      quantity: 60,
      unit: 'g',
      optional: true,
      note: t('a small handful', 'o mână mică'),
    },
    {
      ingredient: 'savory',
      quantity: 2,
      unit: 'g',
      note: t('dried (cimbru)', 'uscat (cimbru)'),
    },
    {
      ingredient: 'dill',
      quantity: 20,
      unit: 'g',
      note: t('fresh, chopped', 'proaspăt, tocat'),
    },
    {
      ingredient: 'salt',
      note: t('to taste, at the very end', 'după gust, abia la sfârșit'),
    },
    {
      ingredient: 'sour-cream',
      quantity: 150,
      unit: 'g',
      optional: true,
      note: t('at the table', 'la masă'),
    },
    {
      ingredient: 'hot-pepper',
      quantity: 1,
      unit: 'pcs',
      optional: true,
      note: t('fresh, at the table', 'proaspăt, la masă'),
    },
  ],
  steps: [
    {
      key: 'boil-pork',
      text: t(
        'Put the smoked pork in the pot, then wash your hands, the board and the knife with hot soapy water after handling the raw smoked meat. Cover the pork with the cold water. Bring to the boil over high heat, about 15 minutes.',
        'Pune afumătura în oală, apoi spală-ți mâinile, tocătorul și cuțitul cu apă fierbinte și săpun după ce ai atins carnea afumată crudă. Acoper-o cu apa rece. Adu la fierbere la foc mare, cam 15 minute.',
      ),
    },
    {
      key: 'simmer-pork',
      text: t(
        'Skim off the grey foam until the surface is clear. Turn the heat down and simmer gently, partly covered, for 50 minutes, until the meat is tender: a knife slides easily into the thickest part and the meat starts to come off the bone. Smoked pork stays pink, so go by tenderness, not colour. If it is not tender yet, especially a thick piece on the bone, simmer on and check every 15 minutes; that adds to the total time.',
        'Ia spuma cenușie până se limpezește suprafața. Dă focul mai mic și fierbe încet, cu oala acoperită pe jumătate, 50 de minute, până când carnea e fragedă: cuțitul intră ușor în partea cea mai groasă, iar carnea începe să se desprindă de os. Afumătura rămâne roz, așa că te iei după fragezime, nu după culoare. Dacă nu e încă fragedă, mai ales o bucată groasă, cu os, fierbe mai departe și verific-o din 15 în 15 minute; timpul total crește.',
      ),
      timerSeconds: 3000,
    },
    {
      key: 'prep-cabbage',
      text: t(
        'While the pork simmers, squeeze the sauerkraut out over a bowl and keep about 200 ml of the brine. Taste a piece; rinse it briefly in cold water only if it is very sour or salty, then chop it fine.',
        'Cât fierbe afumătura, stoarce varza deasupra unui bol și păstrează cam 200 ml de zeamă. Gustă o bucățică; clătește varza scurt cu apă rece doar dacă e foarte acră sau sărată, apoi toac-o mărunt.',
      ),
    },
    {
      key: 'soften-veg',
      text: t(
        'While the pork simmers, heat the oil in a wide pan over medium heat. Add the onion, carrot and pepper and cook, stirring, for 6 to 8 minutes until soft and translucent but not browned.',
        'Cât fierbe afumătura, încinge uleiul într-o tigaie lată la foc mediu. Adaugă ceapa, morcovul și ardeiul și călește-le, amestecând, 6-8 minute, până se înmoaie și devin translucide, fără să se rumenească.',
      ),
      timerSeconds: 420,
    },
    {
      key: 'tomato-paste',
      text: t(
        'Stir in the tomato paste and cook for 1 minute, stirring, until it darkens slightly.',
        'Adaugă pasta de roșii și călește un minut, amestecând, până se închide ușor la culoare.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'cut-meat',
      text: t(
        'Lift the pork onto a clean board. Cut the meat off the bones, discarding the bones and any tough skin, and cut it into bite-size pieces. Keep the stock in the pot.',
        'Scoate carnea pe un tocător curat. Desprinde carnea de pe oase, aruncă oasele și pielea tare, apoi taie carnea bucăți mici. Lasă supa în oală.',
      ),
    },
    {
      key: 'combine',
      text: t(
        'Add the sauerkraut, the softened vegetables, the bay leaves and the peppercorns to the stock. Bring back to the boil, then simmer for 20 minutes.',
        'Pune în supă varza, legumele călite, foile de dafin și boabele de piper. Adu din nou la fierbere, apoi fierbe 20 de minute.',
      ),
      timerSeconds: 1200,
    },
    {
      key: 'rice',
      text: t(
        'Stir in the rice, if using, and simmer for 15 minutes more, until the rice is tender and the sauerkraut is soft. Without rice, simmer the same 15 minutes until the sauerkraut is soft.',
        'Adaugă orezul, dacă îl folosești, și fierbe încă 15 minute, până se fierbe orezul și se înmoaie varza. Fără orez, fierbe tot 15 minute, până se înmoaie varza.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'sour',
      text: t(
        'Return the meat to the pot. Pour in 150 ml of the sauerkraut brine and simmer for 5 minutes. Taste, and add more brine until it is as sour as you like.',
        'Pune carnea înapoi în oală. Toarnă 150 ml din zeama de varză și fierbe 5 minute. Gustă și adaugă mai multă zeamă, până e ciorba atât de acră cât îți place.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'finish',
      text: t(
        'Take the pot off the heat and stir in the savory and dill. Taste and add salt last; the smoked pork and sauerkraut are already salty. Serve hot, with sour cream and fresh hot pepper on the table.',
        'Ia oala de pe foc și adaugă cimbrul și mărarul. Gustă și sărează abia la sfârșit; afumătura și varza sunt deja sărate. Servește fierbinte, cu smântână și ardei iute proaspăt la masă.',
      ),
    },
    {
      key: 'store',
      text: t(
        'Cool the leftover soup and get it into the fridge within 2 hours. Keep it covered for up to 3 days (eat soup with rice within 1 day) and reheat only the portion you need, until it boils.',
        'Lasă ciorba rămasă să se răcească și pune-o la frigider în cel mult 2 ore. Păstreaz-o acoperită cel mult 3 zile (ciorba cu orez se mănâncă în cel mult o zi) și încălzește doar porția de care ai nevoie, până fierbe.',
      ),
    },
  ],
  tips: [
    t(
      'Rice keeps swelling in the pot, so soup with rice thickens overnight; add a little hot water when you reheat it.',
      'Orezul continuă să se umfle în oală, așa că ciorba cu orez se îngroașă până a doua zi; adaugă puțină apă fierbinte când o încălzești.',
    ),
  ],
  stepTips: [
    {
      step: 'simmer-pork',
      text: t(
        'Keep the simmer lazy: a hard boil makes the meat stringy and the stock greasy and cloudy.',
        'Ține fierberea domoală: o fierbere tare face carnea fibroasă, iar supa grasă și tulbure.',
      ),
    },
  ],
  nutritionNote: t(
    'Mostly cabbage and vegetables, so it is filling, and the pork adds protein. The smoked pork and the sauerkraut are very salty and the pork brings saturated fat, so choose lean pieces, skip the sour cream if you want it lighter, and salt only after tasting.',
    'Conține mai ales varză și legume, deci te satură, iar carnea adaugă proteine. Afumătura și varza sunt foarte sărate, iar porcul aduce grăsimi saturate, așa că alege bucăți slabe, renunță la smântână dacă o vrei mai ușoară și sărează abia după ce ai gustat.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Bread', 'Pâine'),
      reason: t(
        'A slice of bread soaks up the sour, smoky broth and gives the soft cabbage something to bite against.',
        'O felie de pâine se înmoaie în zeama acră și afumată și dă ceva de mușcat lângă varza moale.',
      ),
      principle: 'contrast_texture',
      ingredient: 'bread',
    },
    {
      kind: 'drink',
      label: t('Țuică', 'Țuică'),
      reason: t(
        'A small glass of strong plum spirit cleans the palate between spoonfuls of fatty, smoky soup.',
        'Un păhărel de țuică de prune curăță gustul între lingurile de ciorbă grasă și afumată.',
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
        'A hot, sour, smoky soup warms you through on a cold day.',
        'O ciorbă fierbinte, acrișoară și afumată te încălzește într-o zi rece.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A big bowl of salty smoked pork soup sits heavy before bed.',
        'Un castron mare de ciorbă sărată cu afumătură cade greu înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'ciorba-de-varza-slovak',
      cuisine: 'slovak',
      title: t(
        'Kapustnica (Slovak sauerkraut soup with smoked sausage, dried mushrooms and prunes)',
        'Kapustnica (supă slovacă de varză murată cu cârnați afumați, ciuperci uscate și prune uscate)',
      ),
      servings: 6,
      prepMinutes: 40,
      cookMinutes: 115,
      difficulty: 'medium',
      hideBaseTips: [0],
      lines: [
        {
          ingredient: 'smoked-pork',
          quantity: 500,
          unit: 'g',
          note: t(
            'smoked ribs or a piece on the bone',
            'coaste afumate sau o bucată cu os',
          ),
        },
        {
          ingredient: 'smoked-sausages',
          quantity: 300,
          unit: 'g',
          note: t('klobása-style, sliced', 'tip klobása, tăiați felii'),
        },
        {
          ingredient: 'still-water',
          quantity: 2.75,
          unit: 'l',
          note: t(
            '2.5 l cold for the pot, 250 ml warm for soaking the mushrooms',
            '2,5 l rece pentru oală, 250 ml caldă pentru înmuiat ciupercile',
          ),
        },
        {
          ingredient: 'dried-porcini',
          quantity: 30,
          unit: 'g',
          note: t(
            'soaked in warm water for 30 minutes; strain the soaking liquid through a fine sieve into the pot',
            'înmuiați în apă caldă 30 de minute; strecoară apa de la înmuiat printr-o sită deasă în oală',
          ),
        },
        {
          ingredient: 'sauerkraut',
          quantity: 800,
          unit: 'g',
          note: t('chopped fine', 'tocată mărunt'),
        },
        {
          ingredient: 'prunes',
          quantity: 100,
          unit: 'g',
          note: t('pitted', 'fără sâmburi'),
        },
        {
          ingredient: 'bay-leaves',
          quantity: 0.4,
          unit: 'g',
          note: t('about 2 leaves', 'cam 2 foi'),
        },
        {
          ingredient: 'allspice-berries',
          quantity: 2,
          unit: 'g',
          note: t('about 6 berries', 'cam 6 boabe'),
        },
        { ingredient: 'peppercorns', quantity: 2, unit: 'g' },
        { ingredient: 'caraway-seeds', quantity: 2, unit: 'g' },
        { ingredient: 'lard', quantity: 40, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('finely diced', 'tăiate mărunt'),
        },
        { ingredient: 'flour', quantity: 30, unit: 'g' },
        { ingredient: 'paprika', quantity: 8, unit: 'g' },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          optional: true,
          note: t('2 cloves, crushed', '2 căței, striviți'),
        },
        {
          ingredient: 'salt',
          note: t('to taste, at the end', 'după gust, la sfârșit'),
        },
        {
          ingredient: 'sour-cream',
          quantity: 150,
          unit: 'g',
          optional: true,
          note: t('at the table', 'la masă'),
        },
      ],
      steps: [
        {
          key: 'soak',
          text: t(
            'Cover the dried porcini with the 250 ml of warm water and leave them for 30 minutes to soften.',
            'Acoperă hribii uscați cu cei 250 ml de apă caldă și lasă-i 30 de minute să se înmoaie.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'boil-pork',
          text: t(
            'Put the smoked pork in the pot, then wash your hands, the board and the knife with hot soapy water after handling the raw smoked meat. Add the cold water, the bay leaves, allspice, peppercorns and caraway. Bring to the boil over high heat, about 15 minutes.',
            'Pune afumătura în oală, apoi spală-ți mâinile, tocătorul și cuțitul cu apă fierbinte și săpun după ce ai atins carnea afumată crudă. Adaugă apa rece, foile de dafin, ienibaharul, boabele de piper și chimenul. Adu la fierbere la foc mare, cam 15 minute.',
          ),
        },
        {
          key: 'simmer-pork',
          text: t(
            'Skim off the grey foam until the surface is clear. Turn the heat down and simmer gently, partly covered, for 50 minutes, until the meat is tender: a knife slides easily into the thickest part and the meat starts to come off the bone. Smoked pork stays pink, so go by tenderness, not colour. If it is not tender yet, especially a thick piece on the bone, simmer on and check every 15 minutes; that adds to the total time.',
            'Ia spuma cenușie până se limpezește suprafața. Dă focul mai mic și fierbe încet, cu oala acoperită pe jumătate, 50 de minute, până când carnea e fragedă: cuțitul intră ușor în partea cea mai groasă, iar carnea începe să se desprindă de os. Afumătura rămâne roz, așa că te iei după fragezime, nu după culoare. Dacă nu e încă fragedă, mai ales o bucată groasă, cu os, fierbe mai departe și verific-o din 15 în 15 minute; timpul total crește.',
          ),
          timerSeconds: 3000,
        },
        {
          key: 'cut-meat',
          text: t(
            'Lift the pork onto a clean board. Cut the meat off the bones, discarding the bones and any tough skin, and cut it into bite-size pieces. Keep the stock in the pot.',
            'Scoate carnea pe un tocător curat. Desprinde carnea de pe oase, aruncă oasele și pielea tare, apoi taie carnea bucăți mici. Lasă supa în oală.',
          ),
        },
        {
          key: 'combine',
          text: t(
            'Lift the mushrooms out of their liquid and chop them. Strain the soaking liquid through a fine sieve into the pot, leaving any grit behind. Add the sauerkraut, mushrooms, prunes and the meat. Bring to the boil, then simmer for 30 minutes, until the sauerkraut is soft.',
            'Scoate ciupercile din apa lor și toacă-le. Strecoară apa de la înmuiat printr-o sită deasă direct în oală, lăsând nisipul deoparte. Adaugă varza, ciupercile, prunele și carnea. Adu la fierbere, apoi fierbe 30 de minute, până se înmoaie varza.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'roux-onion',
          text: t(
            'While the soup simmers, melt the lard in a pan over medium heat. Cook the onion, stirring, for 6 minutes until soft and golden at the edges. Add the garlic, if using, for the last 30 seconds.',
            'Cât fierbe supa, topește untura într-o tigaie la foc mediu. Călește ceapa, amestecând, 6 minute, până se înmoaie și se aurește pe margini. Adaugă usturoiul, dacă îl folosești, în ultimele 30 de secunde.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'roux-flour',
          text: t(
            'Sprinkle in the flour and cook, stirring, for 1 to 2 minutes until it smells toasty. Take the pan off the heat, stir in the paprika, then stir in a ladle of the hot soup until smooth.',
            'Presară făina și călește, amestecând, 1-2 minute, până miroase a prăjit. Ia tigaia de pe foc, adaugă boiaua, apoi amestecă cu un polonic de supă fierbinte până se omogenizează rântașul.',
          ),
          timerSeconds: 90,
        },
        {
          key: 'sausage',
          text: t(
            'Stir the roux back into the pot and add the sliced sausage. Simmer for 10 minutes, stirring now and then, until the soup has thickened slightly and the sausage is hot all the way through.',
            'Toarnă rântașul în oală și adaugă cârnații tăiați felii. Fierbe 10 minute, amestecând din când în când, până se îngroașă ușor supa și cârnații sunt fierbinți pe dinăuntru.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'season',
          text: t(
            'Taste and add salt last; the smoked meats and the sauerkraut are already salty. Serve hot, with bread and sour cream.',
            'Gustă și sărează abia la sfârșit; afumăturile și varza sunt deja sărate. Servește fierbinte, cu pâine și smântână.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Cool the leftover soup and get it into the fridge within 2 hours. Keep it covered for up to 3 days and reheat only the portion you need, until it boils.',
            'Lasă supa rămasă să se răcească și pune-o la frigider în cel mult 2 ore. Păstreaz-o acoperită cel mult 3 zile și încălzește doar porția de care ai nevoie, până fierbe.',
          ),
        },
      ],
      tips: [
        t(
          'Start with fewer prunes if your sauerkraut is mild; they should leave a hint of sweetness, not turn the soup into compote.',
          'Pune mai puține prune dacă varza e doar puțin acră: trebuie să lase un gust dulceag, nu să transforme supa în compot.',
        ),
      ],
      stepTips: [
        {
          step: 'combine',
          text: t(
            'Do not skip the sieve: dried mushrooms often carry grit, and the soaking liquid carries most of their flavour.',
            'Nu sări peste sită: ciupercile uscate au adesea nisip, iar apa de la înmuiat are cea mai mare parte din gustul lor.',
          ),
        },
      ],
      nutritionNote: t(
        'Sauerkraut, mushrooms and prunes bring fibre, and the pork and sausage add protein. The two smoked meats and the sauerkraut are very salty, the sausage and lard add saturated fat, and the prunes add some sugar, so serve modest portions and salt only after tasting.',
        'Varza, ciupercile și prunele aduc fibre, iar porcul și cârnații adaugă proteine. Cele două afumături și varza sunt foarte sărate, cârnații și untura adaugă grăsimi saturate, iar prunele aduc ceva zahăr, așa că servește porții moderate și sărează abia după ce ai gustat.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Bread', 'Pâine'),
          reason: t(
            'A slice of bread soaks up the thick, sour broth.',
            'O felie de pâine se îmbibă cu zeama groasă și acrișoară.',
          ),
          principle: 'contrast_texture',
          ingredient: 'bread',
        },
        {
          kind: 'food',
          label: t('Rye bread', 'Pâine de secară'),
          reason: t(
            'Its dense crumb and slight sourness go with the smoky sausage and the sauerkraut.',
            'Miezul ei dens și gustul ușor acrișor se potrivesc cu cârnații afumați și cu varza.',
          ),
          principle: 'complement_flavour',
          ingredient: 'rye-bread',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, thick, smoky soup warms you through on a cold day.',
            'O supă groasă, fierbinte și afumată te încălzește într-o zi rece.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Smoked sausage and a flour-thickened soup sit heavy before bed.',
            'Cârnații afumați și o supă îngroșată cu făină cad greu înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'ciorba-de-varza-korean',
      cuisine: 'korean',
      title: t(
        'Kimchi jjigae (Korean kimchi stew with pork and tofu)',
        'Kimchi jjigae (supă groasă coreeană de kimchi, cu porc și tofu)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 40,
      difficulty: 'easy',
      hideBaseTips: [0],
      lines: [
        {
          ingredient: 'kimchi',
          quantity: 400,
          unit: 'g',
          note: t(
            'well fermented and sour, chopped; keep the brine from the tub (about 100 ml) for the stew',
            'bine fermentat și acru, tocat; păstrează zeama din recipient (cam 100 ml) pentru supă',
          ),
        },
        {
          ingredient: 'pork-belly',
          quantity: 250,
          unit: 'g',
          note: t(
            'sliced about 5 mm thick, in bite-size pieces',
            'tăiat felii de cam 5 mm, bucăți mici',
          ),
        },
        { ingredient: 'sesame-oil', quantity: 15, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('sliced', 'tăiată felii'),
        },
        {
          ingredient: 'garlic',
          quantity: 12,
          unit: 'g',
          note: t('4 cloves, crushed', '4 căței, striviți'),
        },
        {
          ingredient: 'still-water',
          quantity: 0.5,
          unit: 'l',
        },
        {
          ingredient: 'gochugaru',
          quantity: 10,
          unit: 'g',
        },
        { ingredient: 'gochujang', quantity: 20, unit: 'g' },
        { ingredient: 'sugar', quantity: 5, unit: 'g' },
        {
          ingredient: 'tofu',
          quantity: 300,
          unit: 'g',
          note: t('cut in 1.5 cm slabs', 'tăiat felii de 1,5 cm'),
        },
        {
          ingredient: 'spring-onion',
          quantity: 30,
          unit: 'g',
          note: t('sliced', 'tăiată felii'),
        },
        {
          ingredient: 'salt',
          note: t('to taste, only if needed', 'după gust, doar dacă e nevoie'),
        },
      ],
      steps: [
        {
          key: 'prep',
          text: t(
            'Chop the kimchi, slice the onion and spring onion, crush the garlic and cut the tofu into slabs, before you handle the raw pork.',
            'Toacă kimchi, taie ceapa și ceapa verde felii, strivește usturoiul și taie tofu felii groase, înainte să atingi carnea crudă.',
          ),
        },
        {
          key: 'slice-pork',
          text: t(
            'Slice the pork belly into thin bite-size pieces and put them on a plate. Wash the board and the knife with hot soapy water.',
            'Taie pieptul de porc felii subțiri, bucăți mici, și pune-le pe o farfurie. Spală tocătorul și cuțitul cu apă fierbinte și săpun.',
          ),
        },
        {
          key: 'fry-pork',
          text: t(
            'Heat the sesame oil in a heavy pot over medium heat. Add the pork, then wash your hands and put the plate the raw pork sat on aside to wash. Fry the pork, stirring, for 5 minutes until the fat has rendered and the pieces are opaque and lightly golden at the edges.',
            'Încinge uleiul de susan într-o oală cu fund gros, la foc mediu. Adaugă carnea, apoi spală-ți mâinile și pune deoparte, la spălat, farfuria pe care a stat carnea crudă. Prăjește carnea, amestecând, 5 minute, până se topește grăsimea, iar bucățile devin opace și ușor aurii pe margini.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'fry-kimchi',
          text: t(
            'Add the kimchi and onion and stir-fry for 4 minutes, until the kimchi softens and the onion turns translucent.',
            'Adaugă kimchi și ceapa și călește-le, amestecând, 4 minute, până se înmoaie kimchi-ul și ceapa devine translucidă.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'seasoning',
          text: t(
            'Stir in the garlic, gochugaru, gochujang and sugar and cook for 30 seconds, stirring, so the chilli does not scorch.',
            'Adaugă usturoiul, gochugaru, gochujang și zahărul și amestecă 30 de secunde, ca ardeiul să nu se ardă.',
          ),
          timerSeconds: 30,
        },
        {
          key: 'simmer',
          text: t(
            'Take the pot off the heat for a moment. Pour in the water and the kimchi brine slowly, then bring to the boil. Cover and simmer gently for 20 minutes, until the kimchi is soft and the pork is tender: a piece of belly yields easily when pressed and the fat is soft and translucent. Cut a piece open to check there is nothing raw-looking inside.',
            'Ia oala de pe foc pentru un moment. Toarnă încet apa și zeama de kimchi, apoi adu la fierbere. Acoperă și fierbe încet 20 de minute, până se înmoaie kimchi, iar carnea e fragedă: o bucată de piept cedează ușor la apăsare, iar grăsimea e moale și translucidă. Taie o bucată ca să te asiguri că nu are nimic crud înăuntru.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'tofu',
          text: t(
            'Lay the tofu slabs on top and simmer for 5 minutes, until hot through. Taste, and add salt only if needed; kimchi and gochujang are already salty.',
            'Așază feliile de tofu deasupra și fierbe 5 minute, până se încălzesc bine. Gustă și sărează doar dacă e nevoie; kimchi și gochujang sunt deja sărate.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'serve',
          text: t(
            'Scatter the spring onion on top and serve bubbling hot, with plain rice.',
            'Presară ceapa verde deasupra și servește fierbinte, încă clocotind, cu orez simplu.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Cool the leftover stew and get it into the fridge within 2 hours. Keep it covered for up to 3 days and reheat only the portion you need, until it boils.',
            'Lasă mâncarea rămasă să se răcească și pune-o la frigider în cel mult 2 ore. Păstreaz-o acoperită cel mult 3 zile și încălzește doar porția de care ai nevoie, până fierbe.',
          ),
        },
      ],
      tips: [
        t(
          'Use well-fermented, properly sour kimchi: fresh kimchi gives a flat stew.',
          'Folosește kimchi bine fermentat, cu adevărat acru: kimchi proaspăt dă o supă searbădă.',
        ),
        t(
          'If the stew tastes too sour, a little more sugar rounds it out.',
          'Dacă supa iese prea acră, puțin zahăr în plus o rotunjește.',
        ),
      ],
      stepTips: [
        {
          step: 'fry-pork',
          text: t(
            'Leave the rendered fat in the pot: it carries the chilli and the kimchi flavour into the broth.',
            'Lasă grăsimea topită în oală: duce gustul ardeiului și al kimchi-ului în supă.',
          ),
        },
      ],
      nutritionNote: t(
        'Kimchi brings fibre, and the pork and tofu add protein, so one bowl with rice is a full meal. The pork belly adds saturated fat, and the kimchi, brine and gochujang make the stew very salty, so add little or no extra salt and drink water alongside.',
        'Kimchi aduce fibre, iar porcul și tofu adaugă proteine, așa că un castron cu orez e o masă completă. Pieptul de porc adaugă grăsimi saturate, iar kimchi, zeama lui și gochujang fac mâncarea foarte sărată, așa că pune puțină sare în plus, sau deloc, și bea apă alături.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Plain rice', 'Orez simplu'),
          reason: t(
            'Mild rice soaks up the spicy, salty broth and calms the heat.',
            'Orezul neutru absoarbe zeama iute și sărată și moderează iuțeala.',
          ),
          principle: 'complement_flavour',
          ingredient: 'rice',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A bubbling, spicy stew warms you through on a cold day.',
            'O supă iute și clocotită te încălzește într-o zi rece.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Pork and tofu give protein, and eaten with rice it brings carbohydrates and salt back.',
            'Porcul și tofu dau proteine, iar cu orez reface rezervele de carbohidrați și sare.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'The chilli and the salt can sit heavy before bed.',
            'Ardeiul iute și sarea pot cădea greu înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
