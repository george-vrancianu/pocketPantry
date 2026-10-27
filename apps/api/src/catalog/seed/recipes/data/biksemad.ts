import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Biksemad base is the Danish hash: cold boiled potato fried crisp with
// onion and diced pork, topped with a fried egg. Each Variant is a full Recipe
// with its own lines, steps and guidance; the base's Recipe-level Tips are
// inherited unless a Variant hides them.
export const biksemad: BaseRecipeSeed = {
  slug: 'biksemad',
  title: t(
    'Danish hash with fried egg (biksemad)',
    'Cartofi prăjiți cu carne și ou ochi, ca în Danemarca (biksemad)',
  ),
  servings: 4,
  prepMinutes: 75,
  cookMinutes: 60,
  difficulty: 'easy',
  lines: [
    { ingredient: 'potato', quantity: 0.8, unit: 'kg' },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('finely chopped', 'tocate mărunt'),
    },
    {
      ingredient: 'pork-neck',
      quantity: 400,
      unit: 'g',
      note: t('cut into 1.5 cm cubes', 'tăiată cuburi de 1,5 cm'),
    },
    { ingredient: 'butter', quantity: 70, unit: 'g' },
    { ingredient: 'eggs', quantity: 4, unit: 'pcs' },
    { ingredient: 'canned-beetroot', quantity: 200, unit: 'g' },
    { ingredient: 'worcestershire-sauce', quantity: 20, unit: 'ml' },
    { ingredient: 'ketchup', quantity: 60, unit: 'g', optional: true },
    {
      ingredient: 'parsley',
      quantity: 10,
      unit: 'g',
      optional: true,
      note: t('chopped', 'tocat'),
    },
    { ingredient: 'salt', quantity: 8, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
  ],
  steps: [
    {
      key: 'boil',
      text: t(
        'Put the whole unpeeled potatoes in a pot, cover with cold water, add 5 g of the salt and bring to the boil. Simmer for about 20 minutes, until a knife slides in with only a little resistance. Do not let them go soft.',
        'Pune cartofii întregi, cu coajă, într-o oală, acoperă-i cu apă rece, adaugă 5 g din sare și adu la fierbere. Fierbe-i la foc mic aproximativ 20 de minute, până când un cuțit intră cu puțină rezistență. Nu-i lăsa să se înmoaie prea tare.',
      ),
      timerSeconds: 1200,
    },
    {
      key: 'chill',
      text: t(
        'Drain the potatoes and let them cool, then refrigerate them for at least 1 hour, or overnight. Peel them and cut them into 1.5 cm cubes.',
        'Scurge cartofii și lasă-i să se răcească, apoi ține-i la frigider cel puțin 1 oră sau peste noapte. Curăță-i de coajă și taie-i cuburi de 1,5 cm.',
      ),
      timerSeconds: 3600,
    },
    {
      key: 'pork',
      text: t(
        'Season the pork with half the pepper. Melt 15 g of the butter in a large frying pan over medium-high heat and fry the pork in a single layer, stirring now and then, for about 8 minutes, until browned all over. Cut a cube open: there must be no pink inside, the juices must run clear and the centre must reach at least 71 °C. Tip the pork onto a plate.',
        'Condimentează carnea cu jumătate din piper. Topește 15 g din unt într-o tigaie mare la foc potrivit-mare și prăjește carnea într-un singur strat, amestecând din când în când, aproximativ 8 minute, până se rumenește pe toate părțile. Taie un cub în două: înăuntru nu trebuie să fie roz, zeama trebuie să iasă limpede, iar centrul trebuie să atingă cel puțin 71 °C. Pune carnea pe o farfurie.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'onion',
      text: t(
        'In the same pan, melt another 15 g of butter over medium heat and cook the onions for about 5 minutes, until soft and golden at the edges. Add them to the pork.',
        'În aceeași tigaie topește alte 15 g de unt la foc mediu și călește ceapa aproximativ 5 minute, până se înmoaie și se rumenește pe margini. Adaug-o peste carne.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'potatoes',
      text: t(
        'Melt 30 g of butter in the pan over medium-high heat. Add the potatoes in a single layer (fry in two batches if the pan is crowded) and leave them for a few minutes at a time, turning only now and then, for about 12 minutes, until crisp and golden on most sides.',
        'Topește 30 g de unt în tigaie la foc potrivit-mare. Adaugă cartofii într-un singur strat (prăjește-i în două reprize dacă tigaia e prea plină) și lasă-i câteva minute pe loc, întorcându-i doar din când în când, aproximativ 12 minute, până devin crocanți și aurii pe cele mai multe fețe.',
      ),
      timerSeconds: 720,
    },
    {
      key: 'combine',
      text: t(
        'Fold the pork and onions back into the potatoes and heat everything together for 3 minutes, until piping hot. Season with the remaining pepper and the remaining salt, and taste.',
        'Amestecă la loc carnea și ceapa cu cartofii și încălzește totul împreună 3 minute, până se încinge bine. Condimentează cu restul de piper și de sare și gustă.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'eggs',
      text: t(
        'In a second pan, melt the last 10 g of butter over medium heat and fry the eggs for about 3 minutes, until the whites are set and lacy at the edges. Leave the yolks runny only for healthy adults: for children, older people, anyone pregnant or anyone with a weakened immune system, cook the eggs until the yolks are firm.',
        'Într-o a doua tigaie topește ultimele 10 g de unt la foc mediu și prăjește ouăle aproximativ 3 minute, până albușul se încheagă și are margini dantelate. Lasă gălbenușul curgător doar pentru adulții sănătoși: pentru copii, vârstnici, femei însărcinate sau persoane cu imunitate scăzută, gătește ouăle până când gălbenușul se întărește.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'serve',
      text: t(
        'Divide the hash between 4 plates and top each with a fried egg. Scatter over the parsley and serve with the pickled beetroot, with the Worcestershire sauce and ketchup on the table.',
        'Împarte biksemad în 4 farfurii și pune câte un ou ochi deasupra. Presară pătrunjelul și servește cu sfecla murată, iar sosul Worcestershire și ketchupul pune-le pe masă.',
      ),
    },
  ],
  tips: [
    t(
      'Use potatoes boiled and chilled the day before: warm ones break up and turn mushy, while cold, firm ones hold their cubes and fry crisp.',
      'Folosește cartofi fierți și răciți cu o zi înainte: cei calzi se destramă și se fac păstoși, în timp ce cei reci și fermi își păstrează cuburile și se prăjesc crocant.',
    ),
    t(
      'Leftover roast pork or beef, diced, can replace the raw pork: add it after the potatoes are crisp, just to heat through. Leftover roast and potatoes should have been refrigerated within 2 hours of cooking and used within 3 days, and the hash is reheated until piping hot all the way through.',
      'Friptura rămasă de porc sau de vită, tăiată cubulețe, poate înlocui carnea crudă: adaug-o după ce cartofii sunt crocanți, doar cât să se încălzească. Friptura și cartofii rămași trebuie puși la frigider în cel mult 2 ore de la gătire și folosiți în cel mult 3 zile, iar biksemad se încălzește până când e fierbinte până în mijloc.',
    ),
  ],
  stepTips: [
    {
      step: 'pork',
      text: t(
        'Brown the pork in a single layer; if the pan is crowded it steams and turns grey instead of browning.',
        'Rumenește carnea într-un singur strat; dacă tigaia e prea plină, carnea se fierbe în aburi și se face cenușie în loc să se rumenească.',
      ),
    },
    {
      step: 'potatoes',
      text: t(
        'Resist stirring: the crust forms only where the potatoes sit still against the hot pan.',
        'Nu amesteca des: crusta se formează doar acolo unde cartofii stau nemișcați pe tigaia fierbinte.',
      ),
    },
  ],
  nutritionNote: t(
    'Potatoes bring filling carbohydrate, and the pork and egg bring protein. Frying in butter, the pork and the yolk add saturated fat, and the pickled beetroot, Worcestershire sauce and ketchup add salt and sugar, so go easy on them. Add a fresh salad for the vegetables the hash lacks.',
    'Cartofii aduc carbohidrați care satură, iar carnea și oul aduc proteine. Prăjirea în unt, carnea și gălbenușul adaugă grăsimi saturate, iar sfecla murată, sosul Worcestershire și ketchupul aduc sare și zahăr, așa că nu exagera cu ele. Adaugă o salată proaspătă pentru legumele care lipsesc din preparat.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Rye bread', 'Pâine de secară'),
      reason: t(
        'Dense, slightly sour bread to mop up the egg yolk.',
        'Pâine densă, ușor acrișoară, cu care ștergi gălbenușul.',
      ),
      principle: 'contrast_texture',
      ingredient: 'rye-bread',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sharp acidity cuts through the butter and fried pork.',
        'Aciditatea lor ascuțită taie untul și carnea prăjită.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'food',
      label: t('Mustard', 'Muștar'),
      reason: t(
        'Its sharpness gives the mild potato and pork a lift.',
        'Iuțeala lui înviorează gustul blând al cartofilor și al cărnii.',
      ),
      principle: 'complement_flavour',
      ingredient: 'mustard',
    },
    {
      kind: 'drink',
      label: t('Cold beer', 'Bere rece'),
      reason: t(
        'Light bitterness and bubbles refresh the palate between rich bites.',
        'Amăreala ușoară și bulele împrospătează gustul între îmbucături bogate.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'beer',
    },
  ],
  eatingMoments: [
    {
      moment: 'brunch',
      polarity: 'good_for',
      reason: t(
        'A hearty one-pan plate that suits a late, leisurely meal.',
        'O farfurie consistentă dintr-o singură tigaie, potrivită pentru o masă târzie și fără grabă.',
      ),
    },
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'Hot, crisp and filling when you need warming up.',
        'Fierbinte, crocant și sățios când ai nevoie să te încălzești.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Potato carbohydrate and pork and egg protein help you refuel.',
        'Carbohidrații din cartofi și proteinele din carne și ou ajută la refacere.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Fried, fatty food sits heavy on the stomach before bed.',
        'Mâncarea prăjită și grasă cade greu la stomac înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'biksemad-american',
      cuisine: 'american',
      // The potatoes are boiled and fried the same day; the leftovers Tip is about roast.
      hideBaseTips: [0, 1],
      title: t(
        'Corned beef hash',
        'Corned beef hash (cartofi prăjiți cu corned beef și ou)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 40,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'potato',
          quantity: 0.8,
          unit: 'kg',
          note: t(
            'peeled, cut into 1.5 cm cubes',
            'curățați, tăiați cuburi de 1,5 cm',
          ),
        },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('finely chopped', 'tocate mărunt'),
        },
        { ingredient: 'corned-beef', quantity: 340, unit: 'g' },
        { ingredient: 'butter', quantity: 60, unit: 'g' },
        { ingredient: 'eggs', quantity: 4, unit: 'pcs' },
        {
          ingredient: 'worcestershire-sauce',
          quantity: 10,
          unit: 'ml',
          optional: true,
        },
        {
          ingredient: 'parsley',
          quantity: 10,
          unit: 'g',
          optional: true,
          note: t('chopped', 'tocat'),
        },
        { ingredient: 'salt', quantity: 5, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
      ],
      steps: [
        {
          key: 'boil',
          text: t(
            'Put the potato cubes in a pot, cover with cold water, add the salt and bring to the boil. Simmer for about 7 minutes, until just tender but still holding their shape.',
            'Pune cuburile de cartofi într-o oală, acoperă-le cu apă rece, adaugă sarea și adu la fierbere. Fierbe-le la foc mic aproximativ 7 minute, până se înmoaie, dar își păstrează forma.',
          ),
          timerSeconds: 420,
        },
        {
          key: 'dry',
          text: t(
            'Drain the potatoes well and leave them in the colander for 5 minutes so the steam escapes and they dry. Meanwhile, break the corned beef into small chunks with a fork.',
            'Scurge bine cartofii și lasă-i 5 minute în strecurătoare, ca să iasă aburul și să se usuce. Între timp, rupe corned beef în bucăți mici cu o furculiță.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'onion',
          text: t(
            'Melt 30 g of the butter in a 30 cm cast-iron or non-stick pan over medium heat and cook the onions for about 5 minutes, until soft and translucent.',
            'Topește 30 g din unt într-o tigaie de 30 cm din fontă sau antiaderentă la foc mediu și călește ceapa aproximativ 5 minute, până se înmoaie și devine translucidă.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'press',
          text: t(
            'Add the potatoes and corned beef, season with the pepper and press everything flat with a spatula. Cook over medium-high heat for about 8 minutes without stirring, until the underside is deep brown and crusty.',
            'Adaugă cartofii și corned beef, condimentează cu piper și apasă totul cu o spatulă, ca să se aplatizeze. Gătește la foc potrivit-mare aproximativ 8 minute fără să amesteci, până când partea de jos devine maro închis și crocantă.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'turn',
          text: t(
            'Turn the hash over in large pieces, press it flat again and cook for another 6 minutes, until the second side is crusty too.',
            'Întoarce preparatul în bucăți mari, apasă-l din nou și mai gătește 6 minute, până când și cealaltă parte e crocantă.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'eggs',
          text: t(
            'Make 4 wells in the hash with the back of a spoon, put a little of the remaining butter in each and crack an egg into each well. Cover the pan and cook for about 4 minutes, until the whites are set. Leave the yolks runny only for healthy adults: for children, older people, anyone pregnant or anyone with a weakened immune system, keep the pan covered a few minutes longer, until the yolks are firm.',
            'Fă 4 adâncituri în preparat cu dosul unei linguri, pune puțin din untul rămas în fiecare și sparge câte un ou în fiecare adâncitură. Acoperă tigaia și gătește aproximativ 4 minute, până când albușul se încheagă. Lasă gălbenușul curgător doar pentru adulții sănătoși: pentru copii, vârstnici, femei însărcinate sau persoane cu imunitate scăzută, ține tigaia acoperită încă câteva minute, până când gălbenușul se întărește.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'serve',
          text: t(
            'Sprinkle with Worcestershire sauce and parsley and bring the pan to the table, then spoon out the hash with one egg per plate.',
            'Stropește cu sos Worcestershire, presară pătrunjel și adu tigaia la masă, apoi servește câte o porție de preparat cu un ou pe farfurie.',
          ),
        },
      ],
      tips: [
        t(
          'Corned beef is already salty: taste the hash before you add any more salt.',
          'Corned beef este deja sărat: gustă preparatul înainte să adaugi sare.',
        ),
      ],
      stepTips: [
        {
          step: 'press',
          text: t(
            'Do not stir while the crust forms; if it sticks, wait another minute and it will release by itself.',
            'Nu amesteca cât se formează crusta; dacă se lipește, mai așteaptă un minut și se desprinde singură.',
          ),
        },
      ],
      nutritionNote: t(
        'Corned beef and egg bring protein and potatoes bring filling carbohydrate. Canned corned beef is cured, so the hash is salty and fatty, and the butter adds more saturated fat. Serve it with a fresh salad or tomatoes and keep the portion moderate.',
        'Corned beef și oul aduc proteine, iar cartofii aduc carbohidrați care satură. Corned beef din conservă este carne sărată (în saramură), deci preparatul e sărat și gras, iar untul adaugă și mai multe grăsimi saturate. Servește-l cu o salată proaspătă sau cu roșii și păstrează porția moderată.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Hot sauce', 'Sos picant'),
          reason: t(
            'Vinegary heat cuts through the salty, fatty beef.',
            'Iuțeala acrișoară taie carnea sărată și grasă.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'hot-sauce',
        },
        {
          kind: 'food',
          label: t('Pickled cucumbers', 'Castraveți murați'),
          reason: t(
            'Crunch and sharp acidity against the soft, rich hash.',
            'Crocant și aciditate ascuțită față de preparatul moale și bogat.',
          ),
          principle: 'contrast_texture',
          ingredient: 'pickled-cucumbers',
        },
        {
          kind: 'food',
          label: t('Toasted sourdough', 'Pâine cu maia, prăjită'),
          reason: t(
            'Crisp toast to soak up the runny yolk.',
            'Pâine prăjită crocantă, care se îmbibă cu gălbenușul curgător.',
          ),
          principle: 'contrast_texture',
          ingredient: 'sourdough',
        },
        {
          kind: 'drink',
          label: t('Black coffee', 'Cafea neagră'),
          reason: t(
            'Bitterness balances the rich, salty beef.',
            'Amăreala echilibrează carnea bogată și sărată.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'coffee',
        },
      ],
      eatingMoments: [
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'One pan, quick from a can, and it feeds a table.',
            'O singură tigaie, se face repede cu conservă și hrănește o masă întreagă.',
          ),
        },
        {
          moment: 'morning',
          polarity: 'good_for',
          reason: t(
            'Protein and carbohydrate keep you going until lunch.',
            'Proteinele și carbohidrații te țin sătul până la prânz.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Hot, crusty and filling when it is cold out.',
            'Fierbinte, crocant și sățios când e frig afară.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Salty, fatty food can leave you thirsty and heavy at night.',
            'Mâncarea sărată și grasă te poate lăsa însetat și cu stomacul greu noaptea.',
          ),
        },
      ],
    },
    {
      slug: 'biksemad-british',
      cuisine: 'british',
      // Meatless mash and cabbage cake; base Tips about cold potatoes and roast do not apply.
      hideBaseTips: [0, 1],
      title: t(
        'Bubble and squeak',
        'Bubble and squeak (turtă britanică de cartofi și varză, prăjită)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 55,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'potato',
          quantity: 0.8,
          unit: 'kg',
          note: t('peeled, cut into chunks', 'curățați, tăiați bucăți'),
        },
        {
          ingredient: 'cabbage',
          quantity: 300,
          unit: 'g',
          note: t('core removed, finely shredded', 'fără cotor, tăiată fin'),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely chopped', 'tocată mărunt'),
        },
        { ingredient: 'butter', quantity: 80, unit: 'g' },
        { ingredient: 'eggs', quantity: 4, unit: 'pcs', optional: true },
        { ingredient: 'salt', quantity: 10, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
      ],
      steps: [
        {
          key: 'boil',
          text: t(
            'Put the potato chunks in a pot, cover with cold water, add 5 g of the salt and bring to the boil. Simmer for about 18 minutes, until a knife slides in with no resistance.',
            'Pune bucățile de cartofi într-o oală, acoperă-le cu apă rece, adaugă 5 g din sare și adu la fierbere. Fierbe-le la foc mic aproximativ 18 minute, până când un cuțit intră fără nicio rezistență.',
          ),
          timerSeconds: 1080,
        },
        {
          key: 'cabbage',
          text: t(
            'While the potatoes simmer, bring a second pot of water with 3 g of salt to the boil and cook the cabbage for about 5 minutes, until tender. Drain it, then press out as much water as you can in a clean tea towel.',
            'Cât fierb cartofii, adu la fiert o a doua oală cu apă și 3 g de sare și fierbe varza aproximativ 5 minute, până se înmoaie. Scurge-o, apoi stoarce cât mai multă apă într-un prosop curat de bucătărie.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'mash',
          text: t(
            'Drain the potatoes and leave them in the colander for 3 minutes so they steam dry. Mash them roughly with 15 g of the butter and 2 g of the salt, leaving a few lumps.',
            'Scurge cartofii și lasă-i 3 minute în strecurătoare, ca să se usuce în abur. Zdrobește-i grosier cu 15 g din unt și 2 g din sare, lăsând câteva cocoloașe.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'onion',
          text: t(
            'Melt 15 g of butter in a 26 cm non-stick frying pan over medium heat and cook the onion for about 5 minutes, until soft and golden. Mix it into the mash with the cabbage and the pepper, and taste for salt.',
            'Topește 15 g de unt într-o tigaie antiaderentă de 26 cm la foc mediu și călește ceapa aproximativ 5 minute, până se înmoaie și se rumenește. Amestec-o în piure cu varza și piperul și gustă de sare.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'first-side',
          text: t(
            'Melt 30 g of butter in the same pan over medium heat. Press the mixture in as one cake about 2 cm thick and cook for about 8 minutes, until the underside is dark brown and crusty.',
            'Topește 30 g de unt în aceeași tigaie la foc mediu. Presează amestecul într-o singură turtă groasă de aproximativ 2 cm și gătește-o aproximativ 8 minute, până când partea de jos devine maro închis și crocantă.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'flip',
          text: t(
            'Slide the cake onto a large plate, melt 10 g of butter in the pan, invert the cake back into the pan and cook for about 6 minutes, until the second side is crusty too.',
            'Lasă turta să alunece pe o farfurie mare, topește 10 g de unt în tigaie, răstoarnă turta la loc în tigaie și gătește-o aproximativ 6 minute, până când și cealaltă parte e crocantă.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'eggs',
          text: t(
            'If using eggs, while the second side cooks, melt the last 10 g of butter in a small pan over medium heat and fry the eggs for about 3 minutes, until the whites are set. Leave the yolks runny only for healthy adults: for children, older people, anyone pregnant or anyone with a weakened immune system, cook the eggs until the yolks are firm.',
            'Dacă folosești ouă, cât se gătește a doua parte, topește ultimele 10 g de unt într-o tigaie mică la foc mediu și prăjește ouăle aproximativ 3 minute, până când albușul se încheagă. Lasă gălbenușul curgător doar pentru adulții sănătoși: pentru copii, vârstnici, femei însărcinate sau persoane cu imunitate scăzută, gătește ouăle până când gălbenușul se întărește.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'serve',
          text: t(
            'Cut the cake into wedges and serve, with a fried egg on each portion if you like.',
            'Taie turta în felii triunghiulare și servește, dacă vrei, cu câte un ou ochi pe fiecare porție.',
          ),
        },
      ],
      tips: [
        t(
          'If you make it from leftover mash and cooked cabbage, they should have been refrigerated within 2 hours of cooking and used within 3 days, and the cake is fried until piping hot all the way through.',
          'Dacă o faci din piure și varză gătită rămase, acestea trebuie puse la frigider în cel mult 2 ore de la gătire și folosite în cel mult 3 zile, iar turta se prăjește până e fierbinte până în mijloc.',
        ),
      ],
      stepTips: [
        {
          step: 'cabbage',
          text: t(
            'Squeeze the cabbage dry: wet cabbage steams the cake and keeps it from forming a crust.',
            'Stoarce bine varza: varza umedă fierbe turta în aburi și o împiedică să facă crustă.',
          ),
        },
        {
          step: 'first-side',
          text: t(
            'Do not move the cake until the underside has darkened; loosen the edge with a spatula before turning.',
            'Nu mișca turta până nu s-a închis la culoare partea de jos; desprinde marginea cu o spatulă înainte să o întorci.',
          ),
        },
      ],
      nutritionNote: t(
        'Potatoes bring filling carbohydrate and the cabbage adds some fibre, so there is more vegetable here than in the meaty hashes. Frying in butter adds saturated fat, and a plain potato cake is low in protein unless you add the egg.',
        'Cartofii aduc carbohidrați care satură, iar varza adaugă fibre, deci aici e mai multă legumă decât în variantele cu carne. Prăjirea în unt adaugă grăsimi saturate, iar o turtă simplă de cartofi are puține proteine dacă nu adaugi oul.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Baked beans', 'Fasole în sos de roșii'),
          reason: t(
            'Sweet, tangy tomato sauce against the crusty potato cake.',
            'Sosul de roșii dulce-acrișor se potrivește cu turta crocantă de cartofi.',
          ),
          principle: 'complement_flavour',
          ingredient: 'baked-beans',
        },
        {
          kind: 'food',
          label: t('Mustard', 'Muștar'),
          reason: t(
            'A sharp note that lifts the mild potato and cabbage.',
            'O notă ascuțită care înviorează gustul blând al cartofilor și al verzei.',
          ),
          principle: 'complement_flavour',
          ingredient: 'mustard',
        },
        {
          kind: 'food',
          label: t('Bacon', 'Bacon'),
          reason: t(
            'Salty, smoky rashers season the otherwise mild cake.',
            'Feliile sărate și afumate de bacon dau gust turtei, altfel blândă.',
          ),
          principle: 'complement_flavour',
          ingredient: 'bacon',
        },
        {
          kind: 'drink',
          label: t('Hot tea', 'Ceai fierbinte'),
          reason: t(
            'Gentle bitterness balances the buttery, fried cake.',
            'Amăreala ușoară echilibrează turta prăjită în unt.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'Easy to share, and it takes a fried egg or bacon alongside.',
            'Ușor de împărțit și merge bine cu ou ochi sau cu bacon alături.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Hot, crisp-crusted comfort food.',
            'Mâncare reconfortantă, fierbinte, cu crustă crocantă.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Fried, buttery food sits heavy during exercise.',
            'Mâncarea prăjită în unt cade greu la stomac în timpul efortului.',
          ),
        },
      ],
    },
  ],
};
