import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Lasagne base is the home lasagne al forno: meat ragù, béchamel and
// dried sheets. Each Variant is a full Recipe with its own lines, steps and
// guidance; the base's Recipe-level Tips are inherited unless hidden.
export const lasagne: BaseRecipeSeed = {
  slug: 'lasagne',
  title: t(
    'Lasagne with meat ragù and béchamel',
    'Lasagna cu ragù de carne și sos béchamel',
  ),
  servings: 6,
  prepMinutes: 35,
  cookMinutes: 158,
  difficulty: 'medium',
  lines: [
    { ingredient: 'olive-oil', quantity: 45, unit: 'ml' },
    {
      ingredient: 'onion',
      quantity: 1,
      unit: 'pcs',
      note: t('large, finely chopped', 'mare, tăiată mărunt'),
    },
    {
      ingredient: 'carrot',
      quantity: 100,
      unit: 'g',
      note: t('finely chopped', 'tăiat mărunt'),
    },
    {
      ingredient: 'celery',
      quantity: 100,
      unit: 'g',
      note: t('finely chopped', 'tăiată mărunt'),
    },
    {
      ingredient: 'garlic',
      quantity: 10,
      unit: 'g',
      note: t('about 3 cloves, minced', 'aproximativ 3 căței, tocați'),
    },
    { ingredient: 'minced-beef', quantity: 400, unit: 'g' },
    { ingredient: 'minced-pork', quantity: 250, unit: 'g' },
    { ingredient: 'red-wine', quantity: 150, unit: 'ml', optional: true },
    { ingredient: 'canned-tomatoes', quantity: 800, unit: 'g' },
    { ingredient: 'tomato-paste', quantity: 40, unit: 'g' },
    {
      ingredient: 'bay-leaves',
      quantity: 0.4,
      unit: 'g',
      note: t('2 leaves', '2 foi'),
    },
    {
      ingredient: 'basil',
      quantity: 10,
      unit: 'g',
      optional: true,
      note: t('torn', 'rupt cu mâna'),
    },
    {
      ingredient: 'salt',
      quantity: 8,
      unit: 'g',
      note: t(
        '1 g for the soffritto, 5 g for the ragù, 2 g for the béchamel',
        '1 g pentru soffritto, 5 g pentru ragù, 2 g pentru béchamel',
      ),
    },
    {
      ingredient: 'black-pepper',
      quantity: 2,
      unit: 'g',
      note: t(
        '1.5 g for the ragù, 0.5 g for the béchamel',
        '1,5 g pentru ragù, 0,5 g pentru béchamel',
      ),
    },
    {
      ingredient: 'butter',
      quantity: 50,
      unit: 'g',
      note: t('for the béchamel', 'pentru béchamel'),
    },
    {
      ingredient: 'flour',
      quantity: 50,
      unit: 'g',
      note: t('for the béchamel', 'pentru béchamel'),
    },
    {
      ingredient: 'milk',
      quantity: 0.8,
      unit: 'l',
      note: t('for the béchamel', 'pentru béchamel'),
    },
    { ingredient: 'nutmeg', quantity: 0.5, unit: 'g' },
    {
      ingredient: 'lasagne-sheets',
      quantity: 250,
      unit: 'g',
      note: t('dried, about 12 sheets', 'uscate, aproximativ 12 foi'),
    },
    {
      ingredient: 'parmesan',
      quantity: 90,
      unit: 'g',
      note: t('grated', 'dat pe răzătoare'),
    },
    {
      ingredient: 'mozzarella',
      quantity: 125,
      unit: 'g',
      optional: true,
      note: t('drained and torn', 'scursă și ruptă în bucăți'),
    },
    {
      ingredient: 'still-water',
      quantity: 2,
      unit: 'l',
      optional: true,
      note: t(
        'only if the pack says to boil the sheets',
        'doar dacă pe ambalaj scrie că foile se fierb',
      ),
    },
    {
      ingredient: 'salt',
      key: 'salt-sheet-water',
      quantity: 15,
      unit: 'g',
      optional: true,
      note: t(
        'for the sheet-boiling water',
        'pentru apa în care se fierb foile',
      ),
    },
  ],
  steps: [
    {
      key: 'chop',
      text: t(
        'Chop the onion, carrot and celery into pieces about 5 mm across, and mince the garlic. Keep the garlic separate.',
        'Taie ceapa, morcovul și țelina pai în bucățele de aproximativ 5 mm și toacă usturoiul. Ține usturoiul separat.',
      ),
    },
    {
      key: 'soffritto',
      text: t(
        'Heat the oil in a wide heavy pot over medium heat. Add the onion, carrot and celery with 1 g of the salt and cook for 10 minutes, stirring often, until soft and golden at the edges but not dark. Stir in the garlic for the last minute.',
        'Încinge uleiul într-o oală lată cu fund gros, la foc mediu. Adaugă ceapa, morcovul și țelina pai cu 1 g din sare și gătește 10 minute, amestecând des, până se înmoaie și se aurește pe margini, fără să se închidă la culoare. Adaugă usturoiul în ultimul minut.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'brown',
      text: t(
        'Turn the heat to medium-high. Add the beef and pork in two batches, breaking the meat up with a wooden spoon. Cook each batch until no pink remains, the juices have boiled away and the meat is browned in places, about 10 minutes in all.',
        'Mărește focul la mediu-mare. Adaugă carnea de vită și de porc în două reprize, mărunțind-o cu o lingură de lemn. Gătește fiecare repriză până nu mai rămâne nimic roz, sucul s-a evaporat și carnea e rumenită pe alocuri, aproximativ 10 minute în total.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'wine',
      text: t(
        'Pour in the wine, if you are using it, and boil for 3 minutes, scraping up the brown bits from the bottom, until it has almost disappeared and no longer smells of alcohol. Without wine, go straight to the next step.',
        'Toarnă vinul, dacă îl folosești, și fierbe 3 minute, răzuind ce s-a prins de fundul oalei, până aproape dispare și nu mai miroase a alcool. Fără vin, treci direct la pasul următor.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'tomato',
      text: t(
        'Stir in the tomato paste and cook for 1 minute. Add the canned tomatoes, crushing them against the side of the pot, then the bay leaves, 5 g of the salt and 1.5 g of the pepper. Bring to a gentle bubble.',
        'Adaugă pasta de roșii și gătește 1 minut. Pune roșiile conservate, strivindu-le de peretele oalei, apoi foile de dafin, 5 g din sare și 1,5 g din piper. Adu la fiert ușor.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'simmer',
      text: t(
        'Lower the heat, partly cover and simmer for 1 hour, stirring now and then, until the ragù is thick and a spoon dragged across the bottom leaves a clear trail. It should still drop off the spoon rather than sit on it: dried sheets absorb liquid as they bake. Remove the bay leaves and stir in the basil, if using.',
        'Scade focul, acoperă parțial oala și fierbe 1 oră, amestecând din când în când, până când ragù-ul se îngroașă și lingura trasă pe fund lasă o urmă clară. Trebuie să cadă totuși de pe lingură, nu să stea pe ea: foile uscate absorb lichid la copt. Scoate foile de dafin și amestecă busuiocul, dacă îl folosești.',
      ),
      timerSeconds: 3600,
    },
    {
      key: 'roux',
      text: t(
        'While the ragù simmers, melt the butter in a saucepan over medium-low heat. Whisk in the flour and cook for 2 minutes, stirring, until it smells nutty but has not taken colour. Heat the milk in a second pan or the microwave until steaming. If the pack says to boil the sheets, also put a large pot of water with the 15 g of salt on to boil now.',
        'În timp ce ragù-ul fierbe, topește untul într-o cratiță la foc mediu-mic. Adaugă făina amestecând continuu și gătește 2 minute, până miroase a nucă, fără să capete culoare. Încălzește laptele într-o altă cratiță sau la microunde până scoate aburi. Dacă pe ambalaj scrie că foile se fierb, pune acum și o oală mare cu apă și cele 15 g de sare la fiert.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'bechamel',
      text: t(
        'Pour the warm milk into the roux a ladleful at a time, whisking smooth after each. Cook over medium heat for 8 minutes, whisking, until it coats the back of a spoon like thin cream. Season with the nutmeg, 2 g of salt and 0.5 g of pepper. Cover the surface with baking paper so no skin forms.',
        'Toarnă laptele cald peste rântaș câte un polonic, amestecând fiecare dată până se omogenizează. Gătește la foc mediu 8 minute, amestecând, până când acoperă dosul lingurii ca o smântână lichidă. Condimentează cu nucșoară, 2 g de sare și 0,5 g de piper. Acoperă suprafața cu hârtie de copt, ca să nu facă pojghiță.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'sheets',
      text: t(
        'Read the pack. No-precook sheets go in dry. If the pack says to boil them, boil a few sheets at a time for 1 minute less than it says, lift them out and lay them flat on a clean tea towel. Divide the ragù into 3 equal portions and the béchamel into 4 (about 200 ml each), and the Parmesan into 3 (30 g each).',
        'Citește ambalajul. Foile care nu se fierb se folosesc uscate. Dacă pe ambalaj scrie că se fierb, fierbe câteva foi odată, cu 1 minut mai puțin decât scrie, scoate-le și întinde-le pe un prosop curat de bucătărie. Împarte ragù-ul în 3 porții egale, béchamelul în 4 (aproximativ 200 ml fiecare) și parmezanul în 3 (câte 30 g).',
      ),
    },
    {
      key: 'preheat',
      text: t(
        'Heat the oven to 180 °C (160 °C fan), which takes about 15 minutes; assemble the lasagne in the meantime. Stand a 24 × 32 cm baking dish, at least 6 cm deep, on a baking tray to catch any sauce that bubbles over.',
        'Încălzește cuptorul la 180 °C (160 °C cu ventilator), ceea ce durează aproximativ 15 minute; asamblează lasagna între timp. Așază o tavă de copt de 24 × 32 cm, adâncă de cel puțin 6 cm, pe o tavă mare de cuptor, care va prinde sosul dacă dă în clocot peste margini.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'layer',
      text: t(
        'Spread one portion of béchamel over the bottom of the dish. Then make 3 layers, each of: sheets (about 4, trimmed to fit, not overlapping), a portion of ragù, a portion of béchamel spread right to the edges so no sheet shows, and a portion of Parmesan. Scatter the mozzarella over the top, if using.',
        'Întinde o porție de béchamel pe fundul tăvii. Apoi fă 3 straturi, fiecare din: foi (aproximativ 4, tăiate să încapă, fără să se suprapună), o porție de ragù, o porție de béchamel întinsă până la margini, ca să nu se vadă nicio foaie, și o porție de parmezan. Presară mozzarella deasupra, dacă o folosești.',
      ),
    },
    {
      key: 'bake-covered',
      text: t(
        'Cover the dish loosely with foil, tented so it does not touch the cheese, and bake for 25 minutes.',
        'Acoperă tava lejer cu folie de aluminiu, ridicată în cort ca să nu atingă brânza, și coace 25 de minute.',
      ),
      timerSeconds: 1500,
    },
    {
      key: 'bake-open',
      text: t(
        'Remove the foil and bake for 15 minutes more, until the top is golden in patches and the edges bubble. A knife slid into the middle should meet no resistance in the sheets, and the centre should read 75 °C. If the top is still pale, give it a few more minutes.',
        'Îndepărtează folia și coace încă 15 minute, până când partea de sus se aurește pe alocuri și marginile clocotesc. Un cuțit înfipt la mijloc nu trebuie să întâmpine rezistență în foi, iar în centru termometrul trebuie să arate 75 °C. Dacă partea de sus e încă palidă, mai las-o câteva minute.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'bake-more',
      text: t(
        'If the sheets still resisted the knife, cover the dish with foil again and bake for 10 minutes more. If they were tender, skip this step.',
        'Dacă foile au opus încă rezistență cuțitului, acoperă din nou tava cu folie și coace încă 10 minute. Dacă erau fragede, sari peste acest pas.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'rest',
      text: t(
        'Leave the lasagne to rest on the counter for 15 minutes. It firms up as it cools slightly, so it cuts into neat squares instead of sliding apart.',
        'Lasă lasagna să se odihnească 15 minute pe blat. Se întărește pe măsură ce se răcește puțin, așa că se taie în pătrate frumoase, în loc să se desfacă.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'serve-store',
      text: t(
        'Cut into 6 portions and serve. Cut any leftovers into portions and move them to shallow containers within 2 hours of leaving the oven; cool, then chill. Keep in the fridge for up to 3 days or freeze for up to 3 months. Reheat until steaming hot all the way through (75 °C).',
        'Taie în 6 porții și servește. Resturile taie-le în porții și mută-le în recipiente joase în maximum 2 ore de la scoaterea din cuptor; lasă-le să se răcească, apoi pune-le la frigider. Se păstrează la frigider până la 3 zile sau la congelator până la 3 luni. Încălzește-le până devin fierbinți în tot interiorul (75 °C).',
      ),
    },
  ],
  tips: [
    t(
      'Keep the béchamel pourable, like thin cream: it thickens in the oven and as it cools. Too thick and the dried sheets stay hard. If it goes lumpy, take it off the heat and whisk hard, or blend it for a few seconds.',
      'Păstrează béchamelul curgător, ca o smântână lichidă: se îngroașă în cuptor și când se răcește. Dacă e prea gros, foile uscate rămân tari. Dacă a făcut cocoloașe, ia-l de pe foc și bate-l energic sau dă-l o clipă prin blender.',
    ),
    t(
      'Make the ragù a day ahead if you can. It tastes better after a night in the fridge, and any fat sets on top where you can lift it off.',
      'Fă ragù-ul cu o zi înainte dacă poți. Are gust mai bun după o noapte la frigider, iar grăsimea se întărește deasupra și o poți ridica.',
    ),
    t(
      'Reheat single portions covered, with a spoonful of water or sauce beside them: the pasta dries out fast if left open.',
      'Reîncălzește porțiile individuale acoperite, cu o lingură de apă sau de sos alături: pastele se usucă repede dacă rămân descoperite.',
    ),
  ],
  stepTips: [
    {
      step: 'brown',
      text: t(
        'Do not crowd the pot. Mince piled in a thick layer steams and turns grey instead of browning, and the brown crust is much of the flavour.',
        'Nu aglomera oala. Carnea tocată pusă într-un strat gros se fierbe în abur și se face cenușie în loc să se rumenească, iar crusta rumenă dă mare parte din gust.',
      ),
    },
    {
      step: 'layer',
      text: t(
        'Spread each layer all the way to the corners. Sheet ends poking out of the sauce dry and turn hard and brittle in the oven.',
        'Întinde fiecare strat până în colțuri. Capetele foilor care ies din sos se usucă și se fac tari și casante la cuptor.',
      ),
    },
  ],
  nutritionNote: t(
    'Good protein from the meat and cheese, with some vegetables in the ragù and calcium from the milk and Parmesan. Butter, whole milk, cheese and beef-and-pork mince make it rich in saturated fat, and the cheese and seasoning add salt. A large green salad on the side adds the fibre it lacks.',
    'Proteine bune din carne și brânză, cu legume în ragù și calciu din lapte și parmezan. Untul, laptele integral, brânza și carnea tocată de vită și porc îl fac bogat în grăsimi saturate, iar brânza și condimentele adaugă sare. O salată verde mare alături aduce fibrele care îi lipsesc.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t(
        'Green salad with a sharp vinaigrette',
        'Salată verde cu vinaigretă acrișoară',
      ),
      reason: t(
        'The acidity cuts through the cheese and béchamel and makes the next forkful taste fresh again.',
        'Aciditatea taie din bogăția brânzei și a béchamelului și face următoarea îmbucătură să aibă din nou gust proaspăt.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'lettuce',
    },
    {
      kind: 'food',
      label: t('Italian antipasto platter', 'Platou italian antipasto'),
      reason: t(
        'Cured meats, cheese and pickled vegetables make a light start while the lasagne rests, before the rich baked pasta follows as the main.',
        'Mezelurile, brânza și murăturile sunt o intrare ușoară cât se odihnește lasagna, înainte ca pastele bogate la cuptor să vină ca fel principal.',
      ),
      principle: 'complement_flavour',
      recipe: 'appetizer-platter-italian',
    },
    {
      kind: 'drink',
      label: t('Sparkling water', 'Apă minerală'),
      reason: t(
        'The bubbles and the lack of sweetness clear the palate of cheese and meat between bites.',
        'Bulele și lipsa dulceții curăță gustul de brânză și carne între îmbucături.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'sparkling-water',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot, filling dish that is welcome when the weather is cold.',
        'Un preparat fierbinte și sățios, binevenit când e frig afară.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Protein from the meat and cheese helps muscles recover, and the pasta refills energy.',
        'Proteinele din carne și brânză ajută mușchii să se refacă, iar pastele refac rezervele de energie.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Fat-heavy and slow to digest, it sits heavy in the stomach during hard exercise.',
        'Bogată în grăsimi și greu de digerat, cade greu la stomac în timpul unui efort intens.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A large, rich portion late at night can make sleep restless.',
        'O porție mare și bogată seara târziu poate face somnul agitat.',
      ),
    },
  ],
  variants: [
    {
      slug: 'lasagne-italian',
      cuisine: 'italian',
      title: t(
        'Lasagna napoletana (Neapolitan lasagne with meatballs, sausage and ricotta)',
        'Lasagna napoletana (lasagna napolitană cu perișoare, cârnați și ricotta)',
      ),
      servings: 8,
      prepMinutes: 30,
      cookMinutes: 140,
      difficulty: 'medium',
      hideBaseTips: [0, 1],
      lines: [
        {
          ingredient: 'italian-sausage',
          quantity: 300,
          unit: 'g',
          note: t('whole sausages', 'cârnați întregi'),
        },
        {
          ingredient: 'olive-oil',
          key: 'olive-oil-sugo',
          quantity: 45,
          unit: 'ml',
          note: t('for the sugo', 'pentru sugo'),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('large, finely chopped', 'mare, tăiată mărunt'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t('about 3 cloves, minced', 'aproximativ 3 căței, tocați'),
        },
        { ingredient: 'tomato-paste', quantity: 40, unit: 'g' },
        { ingredient: 'passata', quantity: 1000, unit: 'ml' },
        {
          ingredient: 'basil',
          quantity: 15,
          unit: 'g',
          note: t('torn', 'rupt cu mâna'),
        },
        {
          ingredient: 'minced-mixed-meat',
          quantity: 300,
          unit: 'g',
          note: t('beef and pork', 'vită și porc'),
        },
        {
          ingredient: 'eggs',
          key: 'eggs-meatballs',
          quantity: 1,
          unit: 'pcs',
          note: t('for the meatballs', 'pentru perișoare'),
        },
        { ingredient: 'breadcrumbs', quantity: 40, unit: 'g' },
        {
          ingredient: 'parmesan',
          key: 'parmesan-meatballs',
          quantity: 30,
          unit: 'g',
          note: t(
            'grated, for the meatballs',
            'dat pe răzătoare, pentru perișoare',
          ),
        },
        {
          ingredient: 'olive-oil',
          key: 'olive-oil-frying',
          quantity: 45,
          unit: 'ml',
          note: t('for frying the meatballs', 'pentru prăjit perișoarele'),
        },
        {
          ingredient: 'eggs',
          key: 'eggs-boiled',
          quantity: 4,
          unit: 'pcs',
          note: t('for hard-boiling', 'pentru ouă fierte tari'),
        },
        {
          ingredient: 'ricotta',
          quantity: 300,
          unit: 'g',
        },
        {
          ingredient: 'mozzarella',
          quantity: 240,
          unit: 'g',
          note: t(
            'diced 1 cm and well drained',
            'tăiată cubulețe de 1 cm și bine scursă',
          ),
        },
        {
          ingredient: 'parmesan',
          quantity: 60,
          unit: 'g',
          note: t(
            'grated, for the layers',
            'dat pe răzătoare, pentru straturi',
          ),
        },
        {
          ingredient: 'lasagne-sheets',
          quantity: 300,
          unit: 'g',
          note: t('dried, about 15 sheets', 'uscate, aproximativ 15 foi'),
        },
        {
          ingredient: 'salt',
          quantity: 5,
          unit: 'g',
          note: t(
            '3 g for the sugo, 1.5 g for the meatballs, 0.5 g for the ricotta',
            '3 g pentru sos, 1,5 g pentru perișoare, 0,5 g pentru ricotta',
          ),
        },
        {
          ingredient: 'black-pepper',
          quantity: 1.5,
          unit: 'g',
          note: t(
            '1 g for the sugo, 0.5 g for the meatballs',
            '1 g pentru sos, 0,5 g pentru perișoare',
          ),
        },
        {
          ingredient: 'still-water',
          quantity: 3,
          unit: 'l',
          optional: true,
          note: t(
            'only if the pack says to boil the sheets',
            'doar dacă pe ambalaj scrie că foile se fierb',
          ),
        },
        {
          ingredient: 'salt',
          key: 'salt-sheet-water',
          quantity: 20,
          unit: 'g',
          optional: true,
          note: t(
            'for the sheet-boiling water',
            'pentru apa în care se fierb foile',
          ),
        },
      ],
      steps: [
        {
          key: 'brown-sausage',
          text: t(
            'Heat the 45 ml of olive oil for the sugo in a wide heavy pot over medium-high heat. Brown the whole sausages on all sides for about 6 minutes, then lift them onto a plate. They are not cooked through yet, and this plate has held raw sausage.',
            'Încinge cei 45 ml de ulei de măsline pentru sosul de roșii (sugo) într-o oală lată cu fund gros, la foc mediu-mare. Rumenește cârnații întregi pe toate părțile, aproximativ 6 minute, apoi scoate-i pe o farfurie. Încă nu sunt gătiți complet, iar farfuria a atins cârnați cruzi.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'onion',
          text: t(
            'Lower the heat to medium. Cook the onion in the fat left in the pot for 8 minutes, stirring, until soft and translucent. Add the garlic for the last minute.',
            'Scade focul la mediu. Gătește ceapa în grăsimea rămasă în oală 8 minute, amestecând, până se înmoaie și devine translucidă. Adaugă usturoiul în ultimul minut.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'sugo',
          text: t(
            'Stir in the tomato paste for 1 minute, then the passata, 3 g of the salt, half the basil and 1 g of the pepper. Return the sausages to the pot and bring to a gentle bubble.',
            'Amestecă pasta de roșii 1 minut, apoi adaugă pasata, 3 g din sare, jumătate din busuioc și 1 g din piper. Pune cârnații înapoi în oală și adu la fiert ușor.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'simmer-sugo',
          text: t(
            'Partly cover and simmer for 35 minutes, stirring now and then. Make the eggs and meatballs in the meantime.',
            'Acoperă parțial și fierbe 35 de minute, amestecând din când în când. Pregătește între timp ouăle și perișoarele.',
          ),
          timerSeconds: 2100,
        },
        {
          key: 'boil-eggs',
          text: t(
            'While the sugo simmers, put the 4 eggs in a small pan of cold water, bring to the boil and boil for 10 minutes, until the yolks are completely firm. Cool in cold water, peel and slice.',
            'În timp ce sosul fierbe, pune cele 4 ouă într-o cratiță mică cu apă rece, adu la fiert și fierbe 10 minute, până când gălbenușurile sunt complet întărite. Răcește-le în apă rece, curăță-le și taie-le felii.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'meatballs',
          text: t(
            'Mix the mince with the 1 egg, breadcrumbs, the 30 g of Parmesan, 1.5 g of salt and 0.5 g of pepper. Roll into about 50 balls the size of a hazelnut in the shell (about 2 cm). Wash your hands and the board straight afterwards.',
            'Amestecă carnea tocată cu cel 1 ou, pesmetul, cele 30 g de parmezan, 1,5 g de sare și 0,5 g de piper. Formează aproximativ 50 de bile cam cât o alună cu coajă (aproximativ 2 cm). Spală-te pe mâini și curăță blatul imediat după aceea.',
          ),
        },
        {
          key: 'fry-meatballs',
          text: t(
            'Heat the frying oil in a large frying pan over medium-high heat. Fry the meatballs in 3 batches for about 5 minutes each, turning, until browned on all sides. Cut one from the first batch open: there must be no pink, the juices must run clear and the centre must read 71 °C. If not, give the batch 2 more minutes, and check one from each later batch too. Lift the cooked meatballs onto a clean plate.',
            'Încinge uleiul pentru prăjit într-o tigaie mare, la foc mediu-mare. Prăjește perișoarele în 3 reprize, câte aproximativ 5 minute, întorcându-le, până se rumenesc pe toate părțile. Taie una din prima repriză: nu trebuie să mai fie roz, sucul trebuie să curgă limpede, iar în centru termometrul trebuie să arate 71 °C. Dacă nu, mai ține repriza 2 minute și verifică câte una și din fiecare repriză următoare. Pune perișoarele gătite pe o farfurie curată.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'finish-sugo',
          text: t(
            'Stir the meatballs into the sugo and simmer for 10 minutes. Lift the sausages out onto a clean board and cut one open: there must be no pink and the centre must read 71 °C. If not, return them to the sauce and simmer 5 minutes more. Cut the sausages into 1 cm slices and stir the remaining basil into the sugo.',
            'Amestecă perișoarele în sugo și fierbe 10 minute. Scoate cârnații pe o planșetă curată și taie unul: nu trebuie să mai fie roz, iar în centru termometrul trebuie să arate 71 °C. Dacă nu, pune-i înapoi în sos și mai fierbe 5 minute. Taie cârnații felii de 1 cm și amestecă restul de busuioc în sugo.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'sheets',
          text: t(
            'Read the pack. No-precook sheets go in dry. If the pack says to boil them, boil a few at a time in water with the 20 g of salt for 1 minute less than it says, lift them out and lay them flat on a clean tea towel.',
            'Citește ambalajul. Foile care nu se fierb se folosesc uscate. Dacă pe ambalaj scrie că se fierb, fierbe câteva odată în apă cu cele 20 g de sare, cu 1 minut mai puțin decât scrie, scoate-le și întinde-le pe un prosop curat de bucătărie.',
          ),
        },
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 180 °C (160 °C fan), which takes about 15 minutes; assemble in the meantime. Stand a 26 × 36 cm baking dish, at least 7 cm deep, on a baking tray to catch any sauce that bubbles over.',
            'Încălzește cuptorul la 180 °C (160 °C cu ventilator), ceea ce durează aproximativ 15 minute; asamblează între timp. Așază o tavă de 26 × 36 cm, adâncă de cel puțin 7 cm, pe o tavă mare de cuptor, care va prinde sosul dacă dă în clocot peste margini.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'divide',
          text: t(
            'Stir the 0.5 g of salt into the ricotta. Divide the sugo (with the meatballs in it) into 4 equal portions. Divide the sausage slices, ricotta (150 g each) and egg slices into 2 portions for the fillings, and the mozzarella (80 g each) and the 60 g of Parmesan (20 g each) into 3: two for the fillings and one for the top.',
            'Amestecă cele 0,5 g de sare în ricotta. Împarte sosul (cu perișoare cu tot) în 4 porții egale. Împarte rondelele de cârnat, ricotta (câte 150 g) și feliile de ou în 2 porții pentru umpluturi, iar mozzarella (câte 80 g) și cele 60 g de parmezan (câte 20 g) în 3: două pentru umpluturi și una pentru deasupra.',
          ),
        },
        {
          key: 'layer',
          text: t(
            'Spread one portion of sugo over the bottom of the dish and cover with a layer of sheets (about 5, not overlapping). Spoon over a portion of sugo, then half the sausage, ricotta in dollops, mozzarella, egg slices and Parmesan. Add a second layer of sheets and repeat with the next portion of sugo and fillings. Cover with the last sheets and the last portion of sugo, making sure every bit of sheet is covered, and finish with the mozzarella and Parmesan kept for the top.',
            'Întinde o porție de sugo pe fundul tăvii și acoperă cu un strat de foi (aproximativ 5, fără să se suprapună). Pune deasupra o porție de sugo, apoi jumătate din cârnați, ricotta în linguri, mozzarella, felii de ou și parmezan. Adaugă al doilea strat de foi și repetă cu următoarea porție de sugo și umpluturile. Acoperă cu ultimele foi și cu ultima porție de sugo, având grijă ca toată foaia să fie acoperită, și termină cu mozzarella și parmezanul păstrate pentru deasupra.',
          ),
        },
        {
          key: 'bake-covered',
          text: t(
            'Cover the dish loosely with foil, tented so it does not touch the cheese, and bake for 35 minutes.',
            'Acoperă tava lejer cu folie de aluminiu, ridicată în cort ca să nu atingă brânza, și coace 35 de minute.',
          ),
          timerSeconds: 2100,
        },
        {
          key: 'bake-open',
          text: t(
            'Remove the foil and bake for 15 minutes more, until the mozzarella is melted and spotted with brown and the edges bubble. The centre should read 75 °C.',
            'Îndepărtează folia și coace încă 15 minute, până când mozzarella se topește și are pete rumene, iar marginile clocotesc. În centru termometrul trebuie să arate 75 °C.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'rest',
          text: t(
            'Leave the lasagne to rest on the counter for 20 minutes so the cheese and sauce set and it cuts into clean squares.',
            'Lasă lasagna să se odihnească 20 de minute pe blat, ca brânza și sosul să se prindă și să se taie în pătrate curate.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'serve-store',
          text: t(
            'Cut into 8 portions and serve. Cut any leftovers into portions and move them to shallow containers within 2 hours of leaving the oven; cool, then chill. Keep in the fridge for up to 3 days or freeze for up to 3 months. Reheat until steaming hot all the way through (75 °C).',
            'Taie în 8 porții și servește. Resturile taie-le în porții și mută-le în recipiente joase în maximum 2 ore de la scoaterea din cuptor; lasă-le să se răcească, apoi pune-le la frigider. Se păstrează la frigider până la 3 zile sau la congelator până la 3 luni. Încălzește-le până devin fierbinți în tot interiorul (75 °C).',
          ),
        },
      ],
      stepTips: [
        {
          step: 'fry-meatballs',
          text: t(
            'Wet your hands when rolling the meatballs and keep them small: tiny balls cook through quickly and spread evenly through every slice.',
            'Udă-ți mâinile când rulezi perișoarele și păstrează-le mici: bilele mici se gătesc repede și se distribuie uniform în fiecare felie.',
          ),
        },
        {
          step: 'divide',
          text: t(
            'Drain the diced mozzarella on kitchen paper for a few minutes. Wet cheese waters down the layers and the lasagne turns soupy.',
            'Lasă mozzarella tăiată cubulețe să se scurgă câteva minute pe hârtie de bucătărie. Brânza udă înmoaie straturile și lasagna iese apoasă.',
          ),
        },
      ],
      tips: [
        t(
          'Make the sugo and meatballs a day ahead: they taste better rested, and assembling cold sauce is far easier than juggling it hot. Add 10 minutes to the covered bake if the filling is cold from the fridge.',
          'Fă sosul și perișoarele cu o zi înainte: au gust mai bun după odihnă, iar asamblarea cu sos rece e mult mai ușoară decât cu sos fierbinte. Adaugă 10 minute la coacerea acoperită dacă umplutura e rece de la frigider.',
        ),
      ],
      nutritionNote: t(
        'Plenty of protein from meatballs, sausage, eggs and cheeses, and the tomato sugo adds some vegetables. Sausage, meatballs, ricotta, mozzarella and Parmesan together make it high in saturated fat and salt, and a portion is very filling. Keep slices modest and serve with a bitter-leaf salad for fibre.',
        'Multe proteine din perișoare, cârnați, ouă și brânzeturi, iar sosul de roșii adaugă puține legume. Cârnații, perișoarele, ricotta, mozzarella și parmezanul la un loc îl fac bogat în grăsimi saturate și sare, iar o porție e foarte sățioasă. Taie porții moderate și servește cu o salată de frunze amărui pentru fibre.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Bitter leaf salad', 'Salată de frunze amărui'),
          reason: t(
            'Bitter radicchio with a sharp dressing cuts through the cheese and fatty sausage.',
            'Radicchio amărui cu un sos de salată acrișor taie din bogăția brânzei și a cârnaților grași.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'radicchio',
        },
        {
          kind: 'drink',
          label: t('Medium-bodied red wine', 'Vin roșu cu corp mediu'),
          reason: t(
            'Its acidity and light tannin stand up to the tomato, sausage and cheese without overpowering them.',
            'Aciditatea și taninul ușor țin piept roșiilor, cârnaților și brânzei fără să le acopere.',
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
            'A hot, hearty bake that suits a cold day.',
            'Un preparat copt, fierbinte și consistent, potrivit pentru o zi rece.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Meat, eggs and cheese give protein, and the pasta gives carbohydrate to refill energy.',
            'Carnea, ouăle și brânza dau proteine, iar pastele dau carbohidrați care refac rezervele de energie.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Very rich and heavy, it can make it hard to sleep.',
            'Foarte bogată și grea, poate îngreuna somnul.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'A big hot bake feels heavy when the weather is hot.',
            'Un preparat mare și fierbinte cade greu când afară e cald.',
          ),
        },
      ],
    },
    {
      slug: 'lasagne-greek',
      cuisine: 'greek',
      title: t(
        'Pastitsio (Greek baked pasta with spiced meat sauce and béchamel)',
        'Pastitsio (paste grecești la cuptor cu sos de carne condimentat și béchamel)',
      ),
      servings: 8,
      prepMinutes: 50,
      cookMinutes: 135,
      difficulty: 'medium',
      hideBaseTips: [0, 1],
      lines: [
        { ingredient: 'olive-oil', quantity: 45, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('finely chopped', 'tăiate mărunt'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t('about 3 cloves, minced', 'aproximativ 3 căței, tocați'),
        },
        { ingredient: 'minced-beef', quantity: 700, unit: 'g' },
        { ingredient: 'red-wine', quantity: 150, unit: 'ml' },
        { ingredient: 'canned-tomatoes', quantity: 400, unit: 'g' },
        { ingredient: 'tomato-paste', quantity: 40, unit: 'g' },
        { ingredient: 'cinnamon', quantity: 2, unit: 'g' },
        { ingredient: 'allspice', quantity: 1.5, unit: 'g' },
        {
          ingredient: 'cloves',
          quantity: 0.4,
          unit: 'g',
          optional: true,
          note: t('about 4 whole cloves', 'aproximativ 4 cuișoare întregi'),
        },
        {
          ingredient: 'bay-leaves',
          quantity: 0.4,
          unit: 'g',
          note: t('2 leaves', '2 foi'),
        },
        {
          ingredient: 'salt',
          quantity: 10,
          unit: 'g',
          note: t(
            '6 g for the sauce, 4 g for the béchamel',
            '6 g pentru sos, 4 g pentru béchamel',
          ),
        },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
        {
          ingredient: 'still-water',
          quantity: 4,
          unit: 'l',
          note: t('for boiling the pasta', 'pentru fiertul pastelor'),
        },
        {
          ingredient: 'salt',
          key: 'salt-pasta-water',
          quantity: 30,
          unit: 'g',
          note: t('for the pasta water', 'pentru apa de fiert pastele'),
        },
        { ingredient: 'pastitsio-pasta', quantity: 500, unit: 'g' },
        {
          ingredient: 'butter',
          key: 'butter-pasta',
          quantity: 30,
          unit: 'g',
          note: t('for the pasta', 'pentru paste'),
        },
        {
          ingredient: 'eggs',
          quantity: 3,
          unit: 'pcs',
          note: t(
            'separated: whites into the pasta, yolks into the béchamel',
            'separate: albușurile în paste, gălbenușurile în béchamel',
          ),
        },
        {
          ingredient: 'kefalotyri',
          quantity: 140,
          unit: 'g',
          note: t(
            'grated: 50 g in the pasta, 60 g in the béchamel, 30 g on top',
            'dat pe răzătoare: 50 g în paste, 60 g în béchamel, 30 g deasupra',
          ),
        },
        {
          ingredient: 'butter',
          key: 'butter-dish',
          quantity: 10,
          unit: 'g',
          note: t('to grease the dish', 'pentru uns tava'),
        },
        {
          ingredient: 'butter',
          quantity: 120,
          unit: 'g',
          note: t('for the béchamel', 'pentru béchamel'),
        },
        {
          ingredient: 'flour',
          quantity: 120,
          unit: 'g',
          note: t('for the béchamel', 'pentru béchamel'),
        },
        {
          ingredient: 'milk',
          quantity: 1.2,
          unit: 'l',
          note: t('for the béchamel', 'pentru béchamel'),
        },
        { ingredient: 'nutmeg', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'soften',
          text: t(
            'Heat the oil in a wide heavy pot over medium heat. Cook the onions for 10 minutes, stirring, until soft and golden. Add the garlic for the last minute.',
            'Încinge uleiul într-o oală lată cu fund gros, la foc mediu. Gătește ceapa 10 minute, amestecând, până se înmoaie și se aurește. Adaugă usturoiul în ultimul minut.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'brown',
          text: t(
            'Turn the heat to medium-high. Add the beef in two batches, breaking it up with a wooden spoon. Cook each batch until no pink remains, the liquid has boiled away and the meat is browned in places, about 10 minutes in all.',
            'Mărește focul la mediu-mare. Adaugă carnea de vită în două reprize, mărunțind-o cu o lingură de lemn. Gătește fiecare repriză până nu mai rămâne nimic roz, lichidul s-a evaporat și carnea e rumenită pe alocuri, aproximativ 10 minute în total.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'wine',
          text: t(
            'Pour in the wine and boil for 3 minutes, scraping up the brown bits, until it has almost disappeared.',
            'Toarnă vinul și fierbe 3 minute, răzuind ce s-a prins de fundul oalei, până aproape dispare.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'spice',
          text: t(
            'Stir in the tomato paste for 1 minute, then the canned tomatoes, crushing them against the side of the pot. Add the cinnamon, allspice, the 4 cloves (count them), bay leaves, the 6 g of salt for the sauce and the pepper. Bring to a gentle bubble.',
            'Amestecă pasta de roșii 1 minut, apoi roșiile conservate, strivindu-le de peretele oalei. Adaugă scorțișoara, ienibaharul, cele 4 cuișoare (numără-le), foile de dafin, cele 6 g de sare pentru sos și piperul. Adu la fiert ușor.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'simmer',
          text: t(
            'Lower the heat and simmer uncovered for 40 minutes, stirring now and then, until the sauce is thick with almost no loose liquid: it will go under the béchamel, so a wet sauce would make the layers slide. Fish out the bay leaves and all 4 cloves. Cook the pasta and make the béchamel in the meantime.',
            'Scade focul și fierbe fără capac 40 de minute, amestecând din când în când, până când sosul se îngroașă și nu mai are aproape deloc lichid: va sta sub béchamel, iar un sos apos ar face straturile să alunece. Scoate foile de dafin și toate cele 4 cuișoare. Fierbe pastele și fă béchamelul între timp.',
          ),
          timerSeconds: 2400,
        },
        {
          key: 'boil-pasta',
          text: t(
            'While the sauce simmers, bring the water to the boil in a large pot and add the salt. Cook the pasta for 2 minutes less than the pack says, so it is still firm; it finishes in the oven. Drain well.',
            'În timp ce sosul fierbe, adu apa la fiert într-o oală mare și adaugă sarea. Fierbe pastele cu 2 minute mai puțin decât scrie pe ambalaj, ca să rămână ferme; se termină la cuptor. Scurge-le bine.',
          ),
        },
        {
          key: 'dress-pasta',
          text: t(
            'Toss the hot pasta with the 30 g of butter and let it cool for 10 minutes, so the egg whites will not scramble when you add them. Then stir in the 3 egg whites, lightly beaten, and 50 g of the kefalotyri.',
            'Amestecă pastele fierbinți cu cele 30 g de unt și lasă-le să se răcească 10 minute, ca albușurile să nu se taie când le adaugi. Apoi amestecă 3 albușuri bătute ușor și 50 g din kefalotyri.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'roux',
          text: t(
            'Melt the 120 g of butter in a saucepan over medium-low heat. Whisk in the flour and cook for 2 minutes, stirring, until it smells nutty but has not taken colour. Heat the milk in another pan or the microwave until steaming.',
            'Topește cele 120 g de unt într-o cratiță la foc mediu-mic. Adaugă făina amestecând și gătește 2 minute, până miroase a nucă, fără să capete culoare. Încălzește laptele într-o altă cratiță sau la microunde până scoate aburi.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'bechamel',
          text: t(
            'Pour the warm milk into the roux a ladleful at a time, whisking smooth after each. Cook over medium heat for 10 minutes, whisking, until it is thick enough to coat a spoon heavily. Season with the nutmeg, the 4 g of salt for the béchamel and 60 g of the kefalotyri.',
            'Toarnă laptele cald peste rântaș câte un polonic, amestecând fiecare dată până se omogenizează. Gătește la foc mediu 10 minute, amestecând, până se îngroașă bine și îmbracă lingura. Condimentează cu nucșoară, cele 4 g de sare pentru béchamel și 60 g din kefalotyri.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'add-yolks',
          text: t(
            'Take the béchamel off the heat and let it cool for 5 minutes. Whisk the 3 yolks together in a bowl, whisk in a ladleful of the béchamel, then stir the mixture back into the pan until smooth.',
            'Ia béchamelul de pe foc și lasă-l să se răcească 5 minute. Bate cele 3 gălbenușuri într-un bol, amestecă un polonic de béchamel în ele, apoi toarnă amestecul înapoi în cratiță, amestecând până se omogenizează.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 180 °C (160 °C fan), which takes about 15 minutes; assemble in the meantime. Grease a 26 × 36 cm baking dish, at least 7 cm deep, with the 10 g of butter and stand it on a baking tray to catch any sauce that bubbles over.',
            'Încălzește cuptorul la 180 °C (160 °C cu ventilator), ceea ce durează aproximativ 15 minute; asamblează între timp. Unge cu cele 10 g de unt o tavă de 26 × 36 cm, adâncă de cel puțin 7 cm, și așaz-o pe o tavă mare de cuptor, care va prinde sosul dacă dă în clocot peste margini.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'layer',
          text: t(
            'Spread the pasta in an even layer over the bottom of the dish and press it level. Spoon over the meat sauce and level it. Pour the béchamel over the top to cover everything and smooth it. Scatter the last 30 g of kefalotyri over the surface.',
            'Întinde pastele într-un strat uniform pe fundul tăvii și netezește-le. Pune deasupra sosul de carne și nivelează-l. Toarnă béchamelul deasupra, să acopere totul, și netezește-l. Presară ultimele 30 g de kefalotyri pe suprafață.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 45 minutes, until the top is puffed and deep golden, the edges bubble and the centre reads 75 °C: the eggs in the pasta and béchamel must be cooked through.',
            'Coace 45 de minute, până când partea de sus se umflă și capătă o culoare aurie intensă, marginile clocotesc, iar în centru termometrul arată 75 °C: ouăle din paste și din béchamel trebuie să fie gătite complet.',
          ),
          timerSeconds: 2700,
        },
        {
          key: 'rest',
          text: t(
            'Leave the pastitsio to rest on the counter for 30 minutes. The béchamel sets as it cools, and the layers hold together for clean squares.',
            'Lasă pastitsio să se odihnească 30 de minute pe blat. Béchamelul se întărește pe măsură ce se răcește, iar straturile se țin împreună, ca să poți tăia pătrate curate.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'serve-store',
          text: t(
            'Cut into 8 squares with a sharp knife and serve. Cut any leftovers into portions and move them to shallow containers within 2 hours of leaving the oven; cool, then chill. Keep in the fridge for up to 3 days or freeze for up to 3 months. Reheat until steaming hot all the way through (75 °C).',
            'Taie în 8 pătrate cu un cuțit ascuțit și servește. Resturile taie-le în porții și mută-le în recipiente joase în maximum 2 ore de la scoaterea din cuptor; lasă-le să se răcească, apoi pune-le la frigider. Se păstrează la frigider până la 3 zile sau la congelator până la 3 luni. Încălzește-le până devin fierbinți în tot interiorul (75 °C).',
          ),
        },
      ],
      stepTips: [
        {
          step: 'boil-pasta',
          text: t(
            'Stir in the first minute: the long tubes stick together as they release starch.',
            'Amestecă în primul minut: tuburile lungi se lipesc între ele când eliberează amidon.',
          ),
        },
        {
          step: 'add-yolks',
          text: t(
            'Do not add the yolks to a bubbling béchamel: they scramble into specks. If it still goes grainy, whisk hard or blend it for a few seconds.',
            'Nu adăuga gălbenușurile într-un béchamel care fierbe: se taie în granule. Dacă tot iese granulat, bate-l energic sau dă-l o clipă prin blender.',
          ),
        },
      ],
      tips: [
        t(
          'Make the meat sauce a day ahead: it tastes better rested, and the fat sets on top where you can lift it off.',
          'Fă sosul de carne cu o zi înainte: are gust mai bun după odihnă, iar grăsimea se întărește deasupra și o poți ridica.',
        ),
      ],
      nutritionNote: t(
        'Protein from beef, eggs and cheese, and carbohydrate from the pasta for energy, with some vegetables in the tomato sauce. The butter-and-milk béchamel, egg yolks, kefalotyri and beef mince make it high in saturated fat, and the cheese adds salt. A fresh salad on the side lightens the meal.',
        'Proteine din vită, ouă și brânză și carbohidrați din paste pentru energie, cu puține legume în sosul de roșii. Béchamelul cu unt și lapte, gălbenușurile, kefalotyri și carnea de vită tocată îl fac bogat în grăsimi saturate, iar brânza adaugă sare. O salată proaspătă alături face masa mai ușoară.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Greek meze platter', 'Platou grecesc de meze'),
          reason: t(
            'Fresh vegetables and sharp feta make a light start that readies the palate for the rich pastitsio, and give everyone something to nibble while it rests.',
            'Legumele proaspete și feta ascuțită sunt o intrare ușoară care pregătește gustul pentru pastitsio bogat și îi ține pe toți ocupați cât se odihnește.',
          ),
          principle: 'complement_flavour',
          recipe: 'appetizer-platter-greek',
        },
        {
          kind: 'food',
          label: t(
            'Tomato salad with olive oil and vinegar',
            'Salată de roșii cu ulei de măsline și oțet',
          ),
          reason: t(
            'Juicy, tangy tomatoes with a little vinegar cut the richness of the béchamel.',
            'Roșiile zemoase și acrișoare, cu puțin oțet, taie din bogăția béchamelului.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'tomato',
        },
        {
          kind: 'drink',
          label: t('Sparkling water', 'Apă minerală'),
          reason: t(
            'The bubbles clear the palate of cheese and béchamel between bites.',
            'Bulele curăță gustul de brânză și béchamel între îmbucături.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'sparkling-water',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, filling bake that suits a cold day.',
            'Un preparat copt, fierbinte și sățios, potrivit pentru o zi rece.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Beef, egg and cheese give protein, and the pasta refills energy.',
            'Vita, oul și brânza dau proteine, iar pastele refac rezervele de energie.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Rich and slow to digest, it sits heavy in the stomach during hard exercise.',
            'Bogat și greu de digerat, cade greu la stomac în timpul unui efort intens.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'A big, hot, creamy bake feels heavy when the weather is hot.',
            'Un preparat mare, fierbinte și cremos cade greu când afară e cald.',
          ),
        },
      ],
    },
  ],
};
