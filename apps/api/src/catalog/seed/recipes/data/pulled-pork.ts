import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Pulled pork base is a pork shoulder rubbed with sugar and spices, cooked
// slowly in the oven until it shreds, then tossed with barbecue sauce and piled
// into buns. Each Variant is a full Recipe with its own lines, steps and
// guidance; the base's Recipe-level Tips are inherited. The carnitas Variant
// hides the two Tips about sauce and reheating in juices (it has no sauce and
// is crisped in its fat).
export const pulledPork: BaseRecipeSeed = {
  slug: 'pulled-pork',
  title: t(
    'Oven pulled pork with barbecue sauce',
    'Pulled pork (spată de porc gătită lent la cuptor, trasă în fibre, cu sos barbecue)',
  ),
  servings: 8,
  prepMinutes: 70,
  cookMinutes: 365,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'pork-shoulder',
      quantity: 2000,
      unit: 'g',
      note: t('boneless, with its fat cap', 'fără os, cu stratul de grăsime'),
    },
    { ingredient: 'brown-sugar', quantity: 40, unit: 'g' },
    { ingredient: 'smoked-paprika', quantity: 15, unit: 'g' },
    { ingredient: 'garlic-powder', quantity: 10, unit: 'g' },
    { ingredient: 'onion-powder', quantity: 10, unit: 'g' },
    { ingredient: 'mustard-powder', quantity: 5, unit: 'g' },
    { ingredient: 'cayenne', quantity: 2, unit: 'g' },
    { ingredient: 'salt', quantity: 18, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 4, unit: 'g' },
    { ingredient: 'apple-cider-vinegar', quantity: 100, unit: 'ml' },
    { ingredient: 'still-water', quantity: 0.1, unit: 'l' },
    { ingredient: 'bbq-sauce', quantity: 250, unit: 'ml' },
    {
      ingredient: 'burger-buns',
      quantity: 8,
      unit: 'pcs',
      note: t('split', 'tăiate în două'),
    },
  ],
  steps: [
    {
      key: 'rub',
      text: t(
        'Mix the sugar, paprika, garlic powder, onion powder, mustard powder, cayenne, salt and pepper in a small bowl. Pat the pork dry with paper towels, set it in an oven-safe lidded casserole (or a deep roasting tin) and rub the mixture all over, pressing it into the fat. Put the lid on, then wash your hands, the bowl and anything else that touched the raw pork with hot soapy water.',
        'Amestecă zahărul, boiaua afumată, usturoiul granulat, ceapa granulată, muștarul pudră, ardeiul cayenne, sarea și piperul într-un bol mic. Șterge carnea cu șervețele de hârtie, pune-o într-o oală cu capac rezistentă la cuptor (sau într-o tavă adâncă) și freacă amestecul peste tot, apăsându-l în grăsime. Pune capacul, apoi spală-te pe mâini, spală bolul și tot ce a atins carnea crudă cu apă caldă și săpun.',
      ),
    },
    {
      key: 'chill',
      text: t(
        'Refrigerate the covered pork for at least 1 hour; overnight is better.',
        'Ține carnea acoperită la frigider cel puțin 1 oră; peste noapte e și mai bine.',
      ),
      timerSeconds: 3600,
    },
    {
      key: 'preheat',
      text: t(
        'Heat the oven to 150 °C (130 °C fan) with a rack in the lower third. This takes about 15 minutes.',
        'Încinge cuptorul la 150 °C (130 °C cu ventilator), cu grătarul în treimea de jos. Durează aproximativ 15 minute.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'oven',
      text: t(
        'Pour the cider vinegar and water into the bottom of the casserole, down the side so they do not wash off the rub. Cover tightly (add a sheet of foil under the lid if it does not seal well), put it in the oven and cook for 4 hours 30 minutes.',
        'Toarnă oțetul de mere și apa pe lângă carne, la baza oalei, ca să nu spele amestecul de condimente. Acoperă strâns (pune o foaie de folie sub capac dacă nu se închide bine), dă oala la cuptor și gătește 4 ore și jumătate.',
      ),
      timerSeconds: 16200,
    },
    {
      key: 'uncover',
      text: t(
        'Take the casserole out and lift the lid away from you, since the steam is scalding. Spoon some of the juices over the pork, then return it, uncovered, for 30 minutes to darken the crust.',
        'Scoate oala și ridică capacul înclinat dinspre tine, ca aburul să nu-ți vină în față: frige. Toarnă cu lingura din zeama din oală peste carne, apoi pune-o înapoi, fără capac, pentru 30 de minute, ca să se rumenească crusta.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'check',
      text: t(
        'Push a probe thermometer into the centre of the pork: it should read 90 to 95 °C, and a fork should twist in with almost no resistance. If not, cover it again and cook on, checking every 30 minutes.',
        'Înfige un termometru cu sondă în centrul cărnii: trebuie să arate 90-95 °C, iar furculița trebuie să intre și să se răsucească aproape fără rezistență. Dacă nu, acoperă din nou și mai gătește, verificând din 30 în 30 de minute.',
      ),
    },
    {
      key: 'rest',
      text: t(
        'Lift the pork onto a clean board or tray and let it rest for 20 minutes. Meanwhile spoon the fat off the surface of the juices in the casserole.',
        'Scoate carnea pe un tocător sau o tavă curate și las-o 20 de minute să se odihnească. Între timp, ia cu lingura grăsimea de pe suprafața zemii din oală.',
      ),
      timerSeconds: 1200,
    },
    {
      key: 'shred',
      text: t(
        'Pull the pork apart with two forks while it is still warm, discarding the large pieces of fat and any gristle. Stir in about 150 ml of the skimmed juices and the barbecue sauce, a little at a time, until the meat is moist and coated. Taste and add salt if needed.',
        'Trage carnea în fibre cu două furculițe cât e încă caldă, aruncând bucățile mari de grăsime și zgârciurile. Amestecă cu aproximativ 150 ml din zeama degresată și cu sosul barbecue, puțin câte puțin, până când carnea e suculentă și învelită în sos. Gustă și mai adaugă sare dacă e nevoie.',
      ),
    },
    {
      key: 'buns',
      text: t(
        'Toast the buns cut side down in a hot dry pan for about 1 minute, until golden. Fill with the pork and top with coleslaw and pickles if you have them (see Pairings).',
        'Rumenește chiflele cu fața tăiată în jos într-o tigaie uscată și încinsă, aproximativ 1 minut, până devin aurii. Umple-le cu carne și adaugă deasupra coleslaw și murături, dacă le ai (vezi Asocieri).',
      ),
      timerSeconds: 60,
    },
    {
      key: 'store',
      text: t(
        'Spread any leftover pork in a shallow container, let it cool and get it into the fridge within 2 hours.',
        'Întinde carnea rămasă într-un recipient plat, lasă-o să se răcească și pune-o la frigider în cel mult 2 ore.',
      ),
    },
  ],
  tips: [
    t(
      'Pork neck (ceafă) works the same way and turns just as tender. Lean cuts such as loin dry out and never become tender enough to pull or chop.',
      'Ceafa de porc se gătește la fel și iese la fel de fragedă. Bucățile slabe, cum e mușchiul sau cotletul, se usucă și nu ajung destul de fragede ca să fie trase în fibre sau tocate.',
    ),
    t(
      'Add the barbecue sauce gradually: the pork is already well seasoned, and too much sauce hides it. Put extra on the table instead.',
      'Adaugă sosul barbecue treptat: carnea e deja bine condimentată, iar prea mult sos îi acoperă gustul. Pune restul pe masă, în loc să-l amesteci în carne.',
    ),
    t(
      'It keeps 3 to 4 days in the fridge and about 3 months in the freezer. Reheat in a covered pan or in the microwave with a splash of juices or water, until steaming hot all the way through.',
      'Se ține 3-4 zile la frigider și aproximativ 3 luni la congelator. Reîncălzește-o într-o tigaie acoperită sau la microunde, cu puțină zeamă sau apă, până scoate aburi și e fierbinte în tot miezul.',
    ),
  ],
  stepTips: [
    {
      step: 'chill',
      text: t(
        'Overnight is worth it: the salt works into the meat, and on the day you only need to heat the oven.',
        'Merită peste noapte: sarea pătrunde în carne, iar în ziua gătitului nu mai ai decât să încingi cuptorul.',
      ),
    },
    {
      step: 'oven',
      text: t(
        'Resist lifting the lid before the time is up: every peek lets the heat and steam out and adds to the cooking time.',
        'Nu ridica capacul înainte să treacă timpul: de fiecare dată iese căldura și aburul, iar gătitul durează mai mult.',
      ),
    },
    {
      step: 'shred',
      text: t(
        'Shred it while warm: once the fat chills and sets, the meat is much harder to pull.',
        'Trage-o în fibre cât e caldă: după ce grăsimea se răcește și se întărește, carnea se desface mult mai greu.',
      ),
    },
  ],
  nutritionNote: t(
    'Pork shoulder is rich in protein and filling, and serving it with coleslaw or pickles adds some vegetables. The meat is fatty, though, much of it saturated, and the rub, barbecue sauce and bun add sugar, salt and refined carbohydrate. Skim the fat and go easy on the sauce.',
    'Spata de porc e bogată în proteine și săturătoare, iar dacă o servești cu coleslaw sau murături adaugi ceva legume. Carnea e totuși grasă, în mare parte cu grăsimi saturate, iar condimentele, sosul barbecue și chifla adaugă zahăr, sare și carbohidrați rafinați. Degresează zeama și pune sos barbecue cu măsură.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Coleslaw', 'Coleslaw (salată de varză și morcov cu maioneză)'),
      reason: t(
        'The crisp, creamy slaw sets off the soft, sweet and smoky pork, in the bun or beside it.',
        'Salata crocantă și cremoasă contrastează cu carnea moale, dulce și afumată, în chiflă sau alături.',
      ),
      principle: 'contrast_texture',
      recipe: 'coleslaw',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sourness cuts the richness of the fatty pork and the sweetness of the sauce.',
        'Aciditatea lor taie bogăția cărnii grase și dulceața sosului.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'drink',
      label: t('Cold beer', 'Bere rece'),
      reason: t(
        'Cold bubbles refresh the palate between smoky, sweet bites.',
        'Bulele reci împrospătează gustul între îmbucături afumate și dulci.',
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
        'Hours in the oven warm the house, and the tender, rich pork is comforting when it is cold out.',
        'Orele petrecute în cuptor încălzesc casa, iar carnea fragedă și bogată te reconfortează într-o zi rece.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'Hours of oven heat and a heavy, sweet bun are the last thing you want in a heat wave.',
        'Orele de cuptor aprins și o chiflă grea, dulce nu sunt ce-ți dorești pe o caniculă.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Fatty, sweet and salty, it sits heavy before bed.',
        'Grasă, dulce și sărată, cade greu la stomac înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'pulled-pork-slow-cooker',
      method: 'slow-cooker',
      title: t('Slow-cooker pulled pork', 'Pulled pork la slow cooker'),
      servings: 8,
      prepMinutes: 20,
      cookMinutes: 585,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'pork-shoulder',
          quantity: 2000,
          unit: 'g',
          note: t(
            'boneless, thawed, cut into 2 or 3 pieces',
            'fără os, dezghețată, tăiată în 2-3 bucăți',
          ),
        },
        { ingredient: 'brown-sugar', quantity: 40, unit: 'g' },
        { ingredient: 'smoked-paprika', quantity: 15, unit: 'g' },
        { ingredient: 'garlic-powder', quantity: 10, unit: 'g' },
        { ingredient: 'onion-powder', quantity: 10, unit: 'g' },
        { ingredient: 'mustard-powder', quantity: 5, unit: 'g' },
        { ingredient: 'cayenne', quantity: 2, unit: 'g' },
        { ingredient: 'salt', quantity: 18, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 4, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('thickly sliced', 'tăiate felii groase'),
        },
        { ingredient: 'apple-cider-vinegar', quantity: 60, unit: 'ml' },
        { ingredient: 'bbq-sauce', quantity: 250, unit: 'ml' },
        {
          ingredient: 'burger-buns',
          quantity: 8,
          unit: 'pcs',
          note: t('split', 'tăiate în două'),
        },
      ],
      steps: [
        {
          key: 'onion',
          text: t(
            'Spread the sliced onions over the bottom of a 5.5 to 6 litre slow cooker and pour the cider vinegar over them.',
            'Întinde ceapa tăiată pe fundul unui slow cooker de 5,5-6 litri și toarnă oțetul de mere peste ea.',
          ),
        },
        {
          key: 'rub',
          text: t(
            'Measure 150 ml of the barbecue sauce into a jug and set it aside. Mix the sugar, paprika, garlic powder, onion powder, mustard powder, cayenne, salt and pepper. Pat the pork pieces dry, rub the mixture all over them on a tray, lay them on the onions and pour the measured sauce over the top. Put the lid on, then wash your hands, the board, the knife, the tray and the bowl with hot soapy water.',
            'Măsoară 150 ml din sosul barbecue într-o cană și pune-o deoparte. Amestecă zahărul, boiaua afumată, usturoiul granulat, ceapa granulată, muștarul pudră, ardeiul cayenne, sarea și piperul. Șterge bucățile de carne, freacă-le peste tot cu amestecul pe o tavă, așază-le pe ceapă și toarnă deasupra sosul măsurat. Pune capacul, apoi spală-te pe mâini și spală tocătorul, cuțitul, tava și bolul cu apă caldă și săpun.',
          ),
        },
        {
          key: 'cook',
          text: t(
            'Cook on LOW for 9 hours, with the lid on the whole time.',
            'Gătește la setarea LOW 9 ore, cu capacul pus tot timpul.',
          ),
          timerSeconds: 32400,
        },
        {
          key: 'check',
          text: t(
            'Push a probe thermometer into the thickest piece: it should read 90 to 95 °C, and a fork should twist in with almost no resistance. If not, put the lid back on and cook on, checking every 30 minutes.',
            'Înfige un termometru cu sondă în cea mai groasă bucată: trebuie să arate 90-95 °C, iar furculița trebuie să intre și să se răsucească aproape fără rezistență. Dacă nu, pune la loc capacul și mai gătește, verificând din 30 în 30 de minute.',
          ),
        },
        {
          key: 'rest',
          text: t(
            'Lift the pieces onto a clean tray with two spatulas, since they are very soft, and let them rest for 20 minutes.',
            'Scoate bucățile pe o tavă curată cu două spatule, pentru că sunt foarte moi, și lasă-le 20 de minute să se odihnească.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'reduce',
          text: t(
            'While the pork rests, strain the juices from the cooker through a sieve into a wide pan, keeping the onions, spoon off the fat and boil the juices for 15 minutes, until slightly syrupy. Chop the soft onions and keep them for the next step.',
            'În timp ce carnea se odihnește, strecoară zeama din slow cooker printr-o sită într-o tigaie lată, păstrând ceapa, ia grăsimea cu lingura și fierbe zeama 15 minute, până se îngroașă puțin. Toacă ceapa moale și păstrează-o pentru pasul următor.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'shred',
          text: t(
            'Pull the pork apart with two forks while it is still warm, discarding the large pieces of fat and any gristle. Stir in the chopped onions, the reduced juices and the remaining 100 ml of barbecue sauce, a little at a time, until the meat is moist and coated. Taste and add salt if needed.',
            'Trage carnea în fibre cu două furculițe cât e încă caldă, aruncând bucățile mari de grăsime și zgârciurile. Amestecă cu ceapa tocată, cu zeama redusă și cu cei 100 ml de sos barbecue rămași, puțin câte puțin, până când carnea e suculentă și învelită în sos. Gustă și mai adaugă sare dacă e nevoie.',
          ),
        },
        {
          key: 'buns',
          text: t(
            'Toast the buns cut side down in a hot dry pan for about 1 minute, until golden. Fill with the pork and top with coleslaw and pickles if you have them (see Pairings).',
            'Rumenește chiflele cu fața tăiată în jos într-o tigaie uscată și încinsă, aproximativ 1 minut, până devin aurii. Umple-le cu carne și adaugă deasupra coleslaw și murături, dacă le ai (vezi Asocieri).',
          ),
          timerSeconds: 60,
        },
        {
          key: 'store',
          text: t(
            'Spread any leftover pork in a shallow container, let it cool and get it into the fridge within 2 hours.',
            'Întinde carnea rămasă într-un recipient plat, lasă-o să se răcească și pune-o la frigider în cel mult 2 ore.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'cook',
          text: t(
            'Do not lift the lid to look: every peek lets out heat and adds to the cooking time. Cut the pork into pieces so it heats through quickly, and only use thawed meat. If you can, start on HIGH for the first hour, then switch to LOW.',
            'Nu ridica capacul să te uiți: de fiecare dată iese căldura, iar gătitul durează mai mult. Taie carnea în bucăți ca să se încălzească repede în centru și folosește doar carne dezghețată. Dacă poți, începe la HIGH în prima oră, apoi treci pe LOW.',
          ),
        },
        {
          step: 'rub',
          text: t(
            'No fridge time needed: the rub flavours the juices the pork cooks in. Rub it the night before and keep it covered in the fridge if you want a stronger flavour.',
            'Nu e nevoie de timp la frigider: condimentele dau gust zemii în care se gătește carnea. Dacă vrei un gust mai pronunțat, freacă carnea cu o seară înainte și ține-o acoperită la frigider.',
          ),
        },
      ],
      nutritionNote: t(
        'Pork shoulder is rich in protein and filling, and the onions cooked in the juices add a little fibre. The meat is still fatty, much of it saturated, and the rub, barbecue sauce and bun add sugar, salt and refined carbohydrate. Spoon off the fat from the juices and go easy on the sauce.',
        'Spata de porc e bogată în proteine și săturătoare, iar ceapa gătită în zeamă adaugă puține fibre. Carnea rămâne totuși grasă, în mare parte cu grăsimi saturate, iar condimentele, sosul barbecue și chifla adaugă zahăr, sare și carbohidrați rafinați. Ia grăsimea din zeamă și pune sos barbecue cu măsură.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t(
            'Coleslaw',
            'Coleslaw (salată de varză și morcov cu maioneză)',
          ),
          reason: t(
            'The crisp, creamy slaw sets off the soft, sweet and smoky pork, in the bun or beside it.',
            'Salata crocantă și cremoasă contrastează cu carnea moale, dulce și afumată, în chiflă sau alături.',
          ),
          principle: 'contrast_texture',
          recipe: 'coleslaw',
        },
        {
          kind: 'food',
          label: t('Pickled cucumbers', 'Castraveți murați'),
          reason: t(
            'Their sourness cuts the richness of the fatty pork and the sweetness of the sauce.',
            'Aciditatea lor taie bogăția cărnii grase și dulceața sosului.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-cucumbers',
        },
        {
          kind: 'drink',
          label: t('Cold beer', 'Bere rece'),
          reason: t(
            'Cold bubbles refresh the palate between smoky, sweet bites.',
            'Bulele reci împrospătează gustul între îmbucături afumate și dulci.',
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
            'The cooker does the work all day and the house smells of it by evening.',
            'Aparatul lucrează singur toată ziua, iar seara toată casa miroase a mâncare bună.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'Rich, sweet and heavy, even if the cooker keeps the kitchen cooler than an oven would.',
            'Bogată, dulce și grea, chiar dacă slow cooker-ul ține bucătăria mai răcoroasă decât un cuptor.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Fatty, sweet and salty, it sits heavy before bed.',
            'Grasă, dulce și sărată, cade greu la stomac înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'pulled-pork-mexican',
      cuisine: 'mexican',
      // No sauce and no covered reheating in juices: the meat is chopped and
      // crisped in its own fat.
      hideBaseTips: [1, 2],
      title: t(
        'Carnitas (Mexican pork slow-cooked in lard, in corn tortillas)',
        'Carnitas (porc gătit lent în untură, ca în Mexic, servit în tortille de porumb)',
      ),
      servings: 6,
      prepMinutes: 25,
      cookMinutes: 165,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'pork-shoulder',
          quantity: 1500,
          unit: 'g',
          note: t(
            'boneless, cut into 5 cm chunks, most of the fat left on',
            'fără os, tăiată în bucăți de 5 cm, cu cea mai mare parte din grăsime',
          ),
        },
        { ingredient: 'salt', quantity: 16, unit: 'g' },
        { ingredient: 'lard', quantity: 300, unit: 'g' },
        { ingredient: 'still-water', quantity: 0.15, unit: 'l' },
        {
          ingredient: 'orange',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'juiced; keep the squeezed halves',
            'stoarse; păstrează jumătățile stoarse',
          ),
        },
        {
          ingredient: 'garlic',
          quantity: 30,
          unit: 'g',
          note: t('whole peeled cloves', 'căței întregi, curățați'),
        },
        { ingredient: 'bay-leaves', quantity: 1, unit: 'g' },
        { ingredient: 'corn-tortillas', quantity: 18, unit: 'pcs' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely chopped', 'tocată mărunt'),
        },
        {
          ingredient: 'coriander',
          quantity: 20,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'lime',
          quantity: 3,
          unit: 'pcs',
          note: t('cut into wedges', 'tăiate în sferturi pe lungime'),
        },
        {
          ingredient: 'hot-pepper',
          quantity: 1,
          unit: 'pcs',
          optional: true,
          note: t('finely chopped', 'tocat mărunt'),
        },
      ],
      steps: [
        {
          key: 'garnish',
          text: t(
            'Chop the onion, coriander and hot pepper, cut the limes into wedges, and halve and juice the oranges, keeping the squeezed halves. Cover the garnish and put it in the fridge. Do all of this before touching the raw pork.',
            'Toacă ceapa, coriandrul și ardeiul iute, taie lime-urile în sferturi pe lungime, taie portocalele în două și stoarce-le, păstrând jumătățile stoarse. Acoperă garnitura și pune-o la frigider. Fă toate acestea înainte să atingi carnea crudă.',
          ),
        },
        {
          key: 'cut',
          text: t(
            'Cut the pork into 5 cm chunks, leaving most of the fat on, and toss them in a bowl with the salt.',
            'Taie carnea în bucăți de 5 cm, lăsând cea mai mare parte din grăsime, și amestec-o într-un bol cu sarea.',
          ),
        },
        {
          key: 'pot',
          text: t(
            'Put the lard, water, orange juice, squeezed orange halves, garlic and bay leaves into a cold, heavy 4 to 5 litre pot, then add the pork so that it fits snugly. Now wash your hands, the board, the knife and the bowl with hot soapy water.',
            'Pune untura, apa, sucul de portocale, jumătățile de portocală stoarse, usturoiul și foile de dafin într-o oală grea de 4-5 litri, rece, apoi adaugă carnea, așa încât să încapă strâns. Acum spală-te pe mâini și spală tocătorul, cuțitul și bolul cu apă caldă și săpun.',
          ),
        },
        {
          key: 'heat',
          text: t(
            'Set the pot over medium heat for about 10 minutes, until the lard has melted and the liquid bubbles gently. Then turn the heat to low so that it keeps bubbling gently, never boiling hard.',
            'Pune oala la foc mediu aproximativ 10 minute, până se topește untura și lichidul fierbe ușor. Apoi dă focul la mic, ca să continue să fiarbă lin, fără să clocotească.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'simmer',
          text: t(
            'Cook uncovered for 2 hours, turning the pieces with tongs every 30 minutes, until a fork slides into the largest piece with no resistance and it reads 90 to 95 °C in the centre. If it is not tender yet, cook on and check every 15 minutes. The water cooks off as it goes. If the liquid is gone and the pieces start to brown before they are tender, turn the heat to its lowest and turn them more often. If you must add liquid, add a splash of water only while there is still liquid in the pot, never to hot fat alone.',
            'Gătește fără capac 2 ore, întorcând bucățile cu cleștele din 30 în 30 de minute, până când furculița intră în cea mai mare bucată fără rezistență, iar în centru termometrul arată 90-95 °C. Dacă nu e fragedă încă, mai gătește și verifică din 15 în 15 minute. Apa se evaporă pe parcurs. Dacă lichidul s-a evaporat și bucățile se rumenesc înainte să fie fragede, dă focul la minimum și întoarce-le mai des. Dacă trebuie să adaugi lichid, toarnă puțină apă doar cât mai e lichid în oală, niciodată peste grăsimea încinsă singură.',
          ),
          timerSeconds: 7200,
        },
        {
          key: 'crisp',
          text: t(
            'Once the liquid has cooked off and only clear fat bubbles around the meat, lift out the orange halves and bay leaves with the tongs, then turn the heat to medium-high and cook for 10 to 15 minutes, turning the pieces, until browned with crisp edges. The fat should sizzle steadily (about 160 °C if you have a thermometer) and spits, so stand back. If the fat smokes, turn the heat off. If it catches fire, turn the heat off only if safe, do not move the pot, smother it with the lid or a damp towel, never use water, and if it does not go out at once get everyone out, close the door and call 112.',
            'Când lichidul s-a evaporat și în jurul cărnii mai bolborosește doar grăsime limpede, scoate cu cleștele jumătățile de portocală și foile de dafin, apoi dă focul la mediu spre mare și gătește 10-15 minute, întorcând bucățile, până se rumenesc și capătă margini crocante. Grăsimea trebuie să sfârâie constant (aproximativ 160 °C dacă ai termometru) și stropește, așa că stai la distanță. Dacă grăsimea scoate fum, oprește focul. Dacă ia foc, oprește focul doar dacă e în siguranță, nu muta oala, înăbușă flacăra cu capacul sau cu un prosop umed (bine stors), nu turna niciodată apă, iar dacă nu se stinge imediat, scoate toți oamenii din casă, închide ușa și sună la 112.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'lift',
          text: t(
            'Turn the heat off as soon as the meat is ready. Lift the pieces out with a slotted spoon onto a clean tray, and leave the pot on the burner with the handle turned inwards: the lard stays scalding for a long time. Chop the meat coarsely on a clean board.',
            'Oprește focul imediat ce carnea e gata. Scoate bucățile cu o lingură cu găuri pe o tavă curată și lasă oala cu untura pe aragaz, cu mânerul întors spre interior: untura rămâne arzătoare multă vreme. Toacă grosier carnea pe un tocător curat.',
          ),
        },
        {
          key: 'tortillas',
          text: t(
            'Warm the tortillas 2 or 3 at a time in a hot dry pan, about 30 seconds on each side, and keep them stacked in a clean cloth.',
            'Încălzește tortillele într-o tigaie uscată și încinsă, aproximativ 30 de secunde pe fiecare parte, și ține-le învelite într-un prosop curat.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'serve',
          text: t(
            'Fill the tortillas with the meat and top with the onion, coriander and hot pepper. Serve with the lime wedges to squeeze over.',
            'Umple tortillele cu carne și pune deasupra ceapa, coriandrul și ardeiul iute. Servește cu sferturi de lime, ca să le stoarcă fiecare peste.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Get the leftover meat into the fridge within 2 hours, in a shallow container.',
            'Pune carnea rămasă la frigider în cel mult 2 ore, într-un recipient plat.',
          ),
        },
        {
          key: 'lard',
          text: t(
            'Once the lard is warm rather than hot, strain it through a fine sieve into a clean jar, leaving the dark juices and bits at the bottom of the pot behind, cover it and refrigerate; use it within about 2 weeks for frying beans or potatoes. Or let it cool completely and set, then scrape it into a container and put it in the bin, never down the drain.',
            'Când untura e caldă, nu fierbinte, strecoară-o printr-o sită deasă într-un borcan curat, lăsând pe fund zeama închisă și resturile, acoperă-o și pune-o la frigider; folosește-o în cel mult 2 săptămâni la prăjit fasole sau cartofi. Sau lasă-o să se răcească complet și să se întărească, apoi răzuiește-o într-un recipient și aruncă-o la gunoi, niciodată în chiuvetă.',
          ),
        },
      ],
      tips: [
        t(
          'Chop the meat rather than shredding it: carnitas should be chunky, with crisp edges next to tender middles.',
          'Toacă carnea, nu o trage în fibre: carnitas trebuie să fie în bucăți, cu margini crocante și mijloc fraged.',
        ),
        t(
          'Keeps 3 to 4 days in the fridge and about 3 months in the freezer. Reheat in a hot pan with a spoonful of the saved lard (or a little oil), turning, until sizzling and steaming hot all the way through.',
          'Carnea se ține 3-4 zile la frigider și aproximativ 3 luni la congelator. Reîncălzește-o într-o tigaie încinsă, cu o lingură din untura păstrată (sau puțin ulei), întorcând-o, până sfârâie și e fierbinte în tot miezul.',
        ),
      ],
      stepTips: [
        {
          step: 'pot',
          text: t(
            'Start everything cold: lard, water and juice go in together. Never pour water into hot fat, as it spits violently.',
            'Pornește totul la rece: untura, apa și sucul intră împreună. Nu turna niciodată apă în grăsime încinsă, pentru că stropește violent.',
          ),
        },
        {
          step: 'crisp',
          text: t(
            'The sugar in the orange juice helps the pieces brown. Keep the lid and a damp towel within reach before you start.',
            'Zahărul din sucul de portocale ajută bucățile să se rumenească. Ține capacul și un prosop umed la îndemână înainte să începi.',
          ),
        },
      ],
      nutritionNote: t(
        'Pork is rich in protein, corn tortillas add carbohydrate and some fibre, and fresh onion, coriander and lime lighten the plate. Cooking in lard makes it high in fat, much of it saturated, so serve a modest portion and fill the rest with vegetables or beans.',
        'Carnea de porc e bogată în proteine, tortilla de porumb adaugă carbohidrați și ceva fibre, iar ceapa, coriandrul și lime-ul proaspete ușurează farfuria. Gătitul în untură o face bogată în grăsimi, în mare parte saturate, așa că servește o porție moderată și completează cu legume sau fasole.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Avocado', 'Avocado'),
          reason: t(
            'Its cool, creamy flesh softens the crisp, rich meat and the heat of the pepper.',
            'Pulpa rece și cremoasă echilibrează carnea crocantă și bogată și îmblânzește iuțeala ardeiului.',
          ),
          principle: 'contrast_texture',
          ingredient: 'avocado',
        },
        {
          kind: 'drink',
          label: t('Cold beer', 'Bere rece'),
          reason: t(
            'Cold bubbles cut through the fat of the pork between bites.',
            'Bulele reci taie grăsimea cărnii între îmbucături.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
      ],
      eatingMoments: [
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from the pork and carbohydrate from the tortillas help you recover.',
            'Proteinele din carne și carbohidrații din tortilla te ajută să te refaci.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Warm, tender, rich meat is comforting when it is cold out.',
            'Carnea caldă, fragedă și bogată te reconfortează într-o zi rece.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Fried, fatty pork digests slowly and sits heavy during hard exercise.',
            'Carnea de porc prăjită și grasă se digeră greu și cade greu la stomac în timpul unui efort intens.',
          ),
        },
      ],
    },
  ],
};
