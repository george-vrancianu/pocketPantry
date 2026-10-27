import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Fasole bătută base is the Romanian meatless (de post) whipped white bean
// dip: soft beans beaten with garlic and sunflower oil, topped with slowly
// fried onion. Each Variant is a full Recipe with its own lines, steps and
// guidance; the base's Recipe-level Tips are inherited. The Greek Variant hides
// the "very soft beans" Tip (split peas need no such advice); the Mexican one
// keeps both, and says plainly that lard makes it not de post.
export const fasoleBatuta: BaseRecipeSeed = {
  slug: 'fasole-batuta',
  title: t(
    'Fasole bătută (Romanian whipped bean dip with fried onion)',
    'Fasole bătută cu ceapă prăjită',
  ),
  servings: 6,
  prepMinutes: 495,
  cookMinutes: 115,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'white-beans',
      quantity: 400,
      unit: 'g',
      note: t(
        'keep 250 ml of the cooking liquid',
        'păstrează 250 ml din apa în care a fiert fasolea',
      ),
    },
    { ingredient: 'still-water', quantity: 4, unit: 'l' },
    { ingredient: 'bay-leaves', quantity: 0.4, unit: 'g' },
    { ingredient: 'salt', quantity: 10, unit: 'g' },
    {
      ingredient: 'garlic',
      quantity: 25,
      unit: 'g',
      note: t('crushed', 'pisat'),
    },
    {
      ingredient: 'sunflower-oil',
      key: 'oil-mash',
      quantity: 60,
      unit: 'ml',
      note: t('for the beans', 'pentru fasole'),
    },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
    {
      ingredient: 'onion',
      quantity: 3,
      unit: 'pcs',
      note: t(
        'medium, in thin half-rings',
        'medii, tăiate în semiluni subțiri',
      ),
    },
    {
      ingredient: 'sunflower-oil',
      key: 'oil-onion',
      quantity: 80,
      unit: 'ml',
      note: t('for the onion', 'pentru ceapă'),
    },
    {
      ingredient: 'tomato-paste',
      quantity: 20,
      unit: 'g',
      optional: true,
    },
    { ingredient: 'paprika', quantity: 5, unit: 'g' },
  ],
  steps: [
    {
      key: 'soak',
      text: t(
        'Rinse the beans, put them in a large bowl and cover with 1.5 litres of cold water. Leave them to soak for about 8 hours, or overnight.',
        'Spală fasolea, pune-o într-un bol mare și acoperă-o cu 1,5 litri de apă rece. Las-o la înmuiat circa 8 ore sau peste noapte.',
      ),
      timerSeconds: 28800,
    },
    {
      key: 'boil-hard',
      text: t(
        'Drain the beans and throw away the soaking water. Put the beans in a pot with 1.3 litres of fresh water. Bring to a full, rolling boil and boil hard for 10 minutes. Drain again and throw away this water too.',
        'Scurge fasolea și aruncă apa de la înmuiat. Pune boabele într-o oală cu 1,3 litri de apă proaspătă. Adu la clocot și fierbe în clocot puternic 10 minute. Scurge din nou și aruncă și această apă.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'simmer',
      text: t(
        'Cover the beans with 1.2 litres of fresh hot water, add the bay leaves and bring to the boil. Turn the heat down and simmer, half covered, for about 75 minutes, until a bean falls apart when you press it between two fingers. Top up with boiling water if the beans start to show above the liquid.',
        'Acoperă fasolea cu 1,2 litri de apă fierbinte proaspătă, adaugă dafinul și adu la fiert. Dă focul mic și lasă să fiarbă încet, cu capacul pe jumătate, circa 75 de minute, până când o boabă se desface când o apeși între două degete. Dacă boabele ies deasupra apei, completează cu apă clocotită.',
      ),
      timerSeconds: 4500,
    },
    {
      key: 'onion',
      text: t(
        'While the beans simmer, heat the 80 ml of oil in a wide pan over medium-low heat until a piece of onion dropped in sizzles quietly at once. Add the onions and fry for about 25 minutes, stirring often, until they are soft and deep golden at the edges. If they brown before they are soft, lower the heat.',
        'Cât fierbe fasolea, încălzește cei 80 ml de ulei într-o tigaie largă, la foc mic-mediu, până când o bucățică de ceapă aruncată în ulei sfârâie încet, imediat. Adaugă ceapa și prăjește-o circa 25 de minute, amestecând des, până se înmoaie și se rumenește auriu-închis pe margini. Dacă se rumenește înainte să se înmoaie, dă focul mai mic.',
      ),
      timerSeconds: 1500,
    },
    {
      key: 'paprika',
      text: t(
        'If you use tomato paste, stir it into the onion and cook for 1 minute. Take the pan off the heat, stir in the paprika for 10 seconds so it does not burn, and leave the onion to wait in its oil.',
        'Dacă folosești pastă de roșii, amestecă-o cu ceapa și călește 1 minut. Ia tigaia de pe foc, amestecă boiaua 10 secunde, ca să nu se ardă, și lasă ceapa să aștepte în uleiul ei.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'salt',
      text: t(
        'In the last 10 minutes of the simmer, stir 4 g of the salt into the bean pot.',
        'În ultimele 10 minute de fiert, amestecă în oala cu fasole 4 g din sare.',
      ),
    },
    {
      key: 'mash',
      text: t(
        'Scoop 250 ml of the cooking liquid into a jug and drain the beans. Take out the bay leaves. Return the beans to the hot pot, add the garlic and mash them with a potato masher, or blend with a stick blender, until completely smooth.',
        'Pune într-o cană 250 ml din apa în care a fiert fasolea și scurge fasolea. Scoate foile de dafin. Pune fasolea înapoi în oala caldă, adaugă usturoiul și zdrobește-o cu un pisător de cartofi, sau mixeaz-o cu blenderul vertical, până devine complet netedă.',
      ),
    },
    {
      key: 'beat',
      text: t(
        'Beat the bean paste with a wooden spoon while you pour in the 60 ml of oil in a thin stream. Loosen it with the cooking liquid, a spoonful at a time, until it is pale, fluffy and spreadable. Season with the remaining 6 g of salt and the pepper, adding the salt little by little and tasting.',
        'Bate pasta de fasole cu lingura de lemn și toarnă în același timp cei 60 ml de ulei, în fir subțire. Subțiaz-o cu apa de la fiert, câte o lingură, până devine deschisă la culoare, pufoasă și ușor de întins. Condimentează cu restul de 6 g de sare, pusă treptat, gustând pe parcurs, și cu piper.',
      ),
    },
    {
      key: 'serve',
      text: t(
        'Spread the fasole bătută on a plate, make a shallow dip in the middle and pile the fried onion with its oil on top. Serve warm or at room temperature.',
        'Întinde fasolea bătută pe o farfurie, fă o adâncitură în mijloc și pune deasupra ceapa prăjită, cu tot cu ulei. Servește caldă sau la temperatura camerei.',
      ),
    },
  ],
  tips: [
    t(
      'Cook the beans until they are softer than you would eat them whole. Any bean that is only just tender stays grainy and leaves the dip gritty.',
      'Fierbe fasolea mai moale decât ai mânca-o întreagă. O boabă abia fiartă rămâne făinoasă și lasă pasta cu textură de nisip.',
    ),
    t(
      'Cool leftovers and put them in the fridge within 2 hours. They keep 3 to 4 days. The paste firms up as it chills: loosen it with a spoonful of warm water. Reheat anything hot until steaming.',
      'Răcește resturile și pune-le la frigider în cel mult 2 ore. Se păstrează 3–4 zile. Pasta se întărește la rece: subțiaz-o cu o lingură de apă caldă. Ce mănânci cald, încălzește până scoate aburi.',
    ),
  ],
  stepTips: [
    {
      step: 'soak',
      text: t(
        'With canned beans, use about 900 g drained and rinsed (4 tins of 400 g). Skip the soaking, boiling and simmering steps and the salt step, because they are already cooked, and mash them with 150 ml of water instead of the cooking liquid.',
        'Dacă folosești fasole la conservă, ia circa 900 g scursă și clătită (4 conserve de 400 g). Sari peste înmuiere, fierbere și pasul cu sarea, fiindcă e deja fiartă, și zdrobește-o cu 150 ml de apă în loc de zeama de fiert.',
      ),
    },
    {
      step: 'boil-hard',
      text: t(
        'Raw dried beans contain a natural compound that upsets the stomach. A hard, rolling boil of at least 10 minutes destroys it (the long simmer afterwards finishes the job), and a gentle heat or a slow cooker does not, so do not shorten this step.',
        'Fasolea uscată crudă conține o substanță naturală care irită stomacul. Un clocot puternic de cel puțin 10 minute o distruge (fierberea lungă de după termină treaba), iar fierberea la foc mic sau în slow cooker nu, așa că nu scurta acest pas.',
      ),
    },
    {
      step: 'onion',
      text: t(
        'Stay near the pan for the last 5 minutes: onion goes from golden to bitter quickly. Pull the pan off the heat while the onion is still a shade lighter than you want, because it keeps colouring in the hot oil.',
        'Rămâi lângă tigaie în ultimele 5 minute: ceapa trece repede de la auriu la amar. Ia tigaia de pe foc când ceapa e încă puțin mai deschisă decât vrei, pentru că se mai rumenește în uleiul fierbinte.',
      ),
    },
    {
      step: 'beat',
      text: t(
        'The raw garlic is mixed into the oil, so treat this like any cooked dish: it can sit on the table while you eat, but not for more than 2 hours. Keep the rest covered in the fridge only, for 3 to 4 days.',
        'Usturoiul crud e amestecat în ulei, așa că tratează pasta ca orice mâncare gătită: poate sta pe masă cât mănânci, dar nu mai mult de 2 ore. Ce rămâne ține doar la frigider, acoperit, 3–4 zile.',
      ),
    },
  ],
  nutritionNote: t(
    'Beans bring plenty of fibre and plant protein and keep you full, and sunflower oil is mostly unsaturated fat. The oil, beaten in and used for the onion, still makes up a good share of the calories, and the pickles and bread served with it add salt and starch. Beans can cause wind if you are not used to them.',
    'Fasolea aduce multe fibre și proteine vegetale și te satură, iar uleiul de floarea soarelui e în mare parte grăsime nesaturată. Totuși, uleiul bătut în pastă și cel de la ceapă aduc o bună parte din calorii, iar murăturile și pâinea servite alături adaugă sare și amidon. Fasolea poate provoca balonare dacă nu ești obișnuit cu ea.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sharp, salty sourness cuts through the oily, soft bean paste.',
        'Aciditatea lor ascuțită și sărată taie din ulei și din moliciunea pastei de fasole.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'food',
      label: t('Bread', 'Pâine'),
      reason: t(
        'A slice with a crisp crust gives the soft paste something to bite against and something to scoop it with.',
        'O felie cu crustă crocantă dă pastei moi un contrast la mestecat și îți ține loc de lingură.',
      ),
      principle: 'contrast_texture',
      ingredient: 'bread',
    },
    {
      kind: 'food',
      label: t(
        'Romanian roasted pepper salad (salată de ardei copți)',
        'Salată de ardei copți',
      ),
      reason: t(
        'The vinegar-dressed peppers cut the oil of the bean paste and the fried onion, and both dishes fit a fasting-day table.',
        'Ardeii cu oțet taie uleiul din pasta de fasole și din ceapa prăjită, iar amândouă se potrivesc la o masă de post.',
      ),
      principle: 'acid_cuts_fat',
      recipe: 'salata-de-ardei-copti',
    },
    {
      kind: 'food',
      label: t(
        'Romanian braised white cabbage with tomato (varză călită)',
        'Varză călită',
      ),
      reason: t(
        'The soft, sweet braised cabbage with tomato rounds out a meatless table with the bean paste.',
        'Varza călită, moale și dulceagă, cu roșii, completează o masă de post alături de pasta de fasole.',
      ),
      principle: 'complement_flavour',
      recipe: 'varza-calita',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'Warm, filling beans with fried onion are a good meal when it is cold out.',
        'Fasolea caldă și sățioasă, cu ceapă prăjită, e o masă potrivită pentru zilele reci.',
      ),
    },
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'Spread on bread with pickles, it makes a quick, filling lunch without meat.',
        'Întinsă pe pâine, cu murături, face un prânz rapid și săturător, fără carne.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Plant protein and carbohydrate from the beans (with bread) help you refuel.',
        'Proteinele vegetale și carbohidrații din fasole (cu pâine) te ajută să te refaci.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Beans, oil and raw garlic sit heavy and can cause wind during exercise.',
        'Fasolea, uleiul și usturoiul crud cad greu și pot provoca balonare în timpul efortului.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A big bowl of beans and raw garlic can sit heavy and keep you from sleeping well.',
        'O porție mare de fasole cu usturoi crud cade greu și poate strica somnul.',
      ),
    },
  ],
  variants: [
    {
      slug: 'fasole-batuta-mexican',
      cuisine: 'mexican',
      title: t(
        'Frijoles refritos (Mexican refried black beans)',
        'Frijoles refritos (fasole neagră mexicană pasată și prăjită)',
      ),
      servings: 6,
      prepMinutes: 495,
      cookMinutes: 130,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'black-beans',
          quantity: 400,
          unit: 'g',
          note: t(
            'keep their cooking liquid',
            'păstrează apa în care a fiert fasolea',
          ),
        },
        { ingredient: 'still-water', quantity: 4, unit: 'l' },
        {
          ingredient: 'onion',
          key: 'onion-pot',
          quantity: 0.5,
          unit: 'pcs',
          note: t('for the pot, left whole', 'pentru oală, întreagă'),
        },
        {
          ingredient: 'garlic',
          quantity: 15,
          unit: 'g',
          note: t('3 cloves, peeled, whole', '3 căței, curățați, întregi'),
        },
        { ingredient: 'salt', quantity: 10, unit: 'g' },
        {
          ingredient: 'lard',
          quantity: 60,
          unit: 'g',
        },
        {
          ingredient: 'onion',
          key: 'onion-fry',
          quantity: 1,
          unit: 'pcs',
          note: t('medium, finely chopped', 'medie, tăiată mărunt'),
        },
      ],
      steps: [
        {
          key: 'soak',
          text: t(
            'Rinse the beans, put them in a large bowl and cover with 1.5 litres of cold water. Leave them to soak for about 8 hours, or overnight.',
            'Spală fasolea, pune-o într-un bol mare și acoperă-o cu 1,5 litri de apă rece. Las-o la înmuiat circa 8 ore sau peste noapte.',
          ),
          timerSeconds: 28800,
        },
        {
          key: 'boil-hard',
          text: t(
            'Drain the beans and throw away the soaking water. Put the beans in a pot with 1.3 litres of fresh water. Bring to a full, rolling boil and boil hard for 10 minutes. Drain again and throw away this water too.',
            'Scurge fasolea și aruncă apa de la înmuiat. Pune boabele într-o oală cu 1,3 litri de apă proaspătă. Adu la clocot și fierbe în clocot puternic 10 minute. Scurge din nou și aruncă și această apă.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'simmer',
          text: t(
            'Cover the beans with 1.2 litres of fresh hot water, add the half onion and the whole garlic cloves and bring to the boil. Turn the heat down and simmer, half covered, for about 75 minutes, until a bean falls apart when you press it between two fingers. Stir in 4 g of the salt for the last 15 minutes. Top up with boiling water if the beans show above the liquid.',
            'Acoperă fasolea cu 1,2 litri de apă fierbinte proaspătă, adaugă jumătatea de ceapă și cățeii de usturoi întregi și adu la fiert. Dă focul mic și lasă să fiarbă încet, cu capacul pe jumătate, circa 75 de minute, până când o boabă se desface când o apeși între două degete. În ultimele 15 minute amestecă 4 g din sare. Dacă boabele ies deasupra apei, completează cu apă clocotită.',
          ),
          timerSeconds: 4500,
        },
        {
          key: 'onion',
          text: t(
            'Put the lard in a wide, deep pan (about 28 cm) over medium heat until it is melted and shimmering. Add the chopped onion and fry for about 8 minutes, stirring, until soft and golden at the edges.',
            'Pune untura într-o tigaie largă și adâncă (de vreo 28 cm), la foc mediu, până se topește și lucește. Adaugă ceapa tocată și prăjește-o circa 8 minute, amestecând, până se înmoaie și se rumenește auriu pe margini.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'mash',
          text: t(
            'Lift the half onion and the garlic out of the bean pot and mash them into the pan with the first ladleful of beans. Add the beans in ladlefuls with a little of their liquid, mashing each one with a potato masher before adding the next. Hot beans spatter, so use a long spoon and keep your face back.',
            'Scoate jumătatea de ceapă și usturoiul din oala cu fasole și strivește-le în tigaie, odată cu primul polonic de fasole. Adaugă fasolea câte un polonic, cu puțină zeamă, și zdrobește fiecare polonic cu pisătorul de cartofi înainte să-l pui pe următorul. Fasolea fierbinte stropește, așa că folosește o lingură lungă și stai deoparte.',
          ),
        },
        {
          key: 'fry-down',
          text: t(
            'Fry the paste over medium heat for about 15 minutes, stirring often, and add a splash of the bean liquid if it catches. It is ready when it is thick and glossy and comes away from the sides of the pan as you stir. Season with the remaining 6 g of salt, adding it little by little and tasting.',
            'Prăjește pasta la foc mediu circa 15 minute, amestecând des, și adaugă un strop din zeama fasolei dacă se prinde. E gata când e groasă și lucioasă și se desprinde de marginile tigăii pe măsură ce amesteci. Sărează cu restul de 6 g de sare, pusă treptat, gustând pe parcurs.',
          ),
          timerSeconds: 900,
        },
      ],
      tips: [
        t(
          'Fried in lard, these beans are not vegan and not suitable for Orthodox fasting days. For a fasting day, fry in sunflower oil instead; the beans will taste lighter and a little less rich.',
          'Prăjită în untură, fasolea nu e nici vegană, nici de post. Într-o zi de post, prăjește-o în ulei de floarea soarelui; va avea un gust mai ușor, ceva mai puțin bogat.',
        ),
      ],
      stepTips: [
        {
          step: 'boil-hard',
          text: t(
            'Raw dried beans contain a natural compound that upsets the stomach. A hard, rolling boil of at least 10 minutes destroys it (the long simmer afterwards finishes the job), and a gentle heat or a slow cooker does not, so do not shorten this step.',
            'Fasolea uscată crudă conține o substanță naturală care irită stomacul. Un clocot puternic de cel puțin 10 minute o distruge (fierberea lungă de după termină treaba), iar fierberea la foc mic sau în slow cooker nu, așa că nu scurta acest pas.',
          ),
        },
        {
          step: 'fry-down',
          text: t(
            'Mash a little less than you think you need at the start: you can always mash more while frying. Some cooks leave a few whole beans for texture.',
            'La început zdrobește ceva mai puțin decât crezi că trebuie, că poți zdrobi oricând în timp ce prăjești. Unii bucătari lasă câteva boabe întregi, pentru textură.',
          ),
        },
      ],
      nutritionNote: t(
        'Black beans bring plenty of fibre and plant protein and keep you full, but the lard adds saturated fat, so a little goes a long way. The 10 g of salt is spread over six servings, and the tortilla chips add more. These beans can cause wind if you are not used to them.',
        'Fasolea neagră aduce multe fibre și proteine vegetale și te satură, dar untura adaugă grăsimi saturate, așa că ajunge puțină. Cei 10 g de sare se împart la șase porții, iar chipsurile tortilla mai adaugă. Fasolea poate provoca balonare dacă nu ești obișnuit cu ea.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Tortilla chips', 'Chipsuri tortilla'),
          reason: t(
            'The crunch against the soft, thick paste makes a good scoop.',
            'Chipsurile crocante contrastează cu pasta groasă și moale și îți țin loc de lingură.',
          ),
          principle: 'contrast_texture',
          ingredient: 'tortilla-chips',
        },
        {
          kind: 'food',
          label: t('Corn tortillas', 'Tortilla de porumb'),
          reason: t(
            'Warm, soft tortillas wrap around the beans and share their earthy corn-and-bean flavour.',
            'Tortillele calde și moi se înfășoară în jurul fasolei și au un gust de porumb care se potrivește cu cel al fasolei.',
          ),
          principle: 'regional_tradition',
          ingredient: 'corn-tortillas',
        },
        {
          kind: 'food',
          label: t('Avocado', 'Avocado'),
          reason: t(
            'Cool, creamy slices balance the hot, earthy beans.',
            'Feliile răcoroase și cremoase echilibrează fasolea fierbinte, cu gust de pământ.',
          ),
          principle: 'complement_flavour',
          ingredient: 'avocado',
        },
        {
          kind: 'food',
          label: t(
            'Beef tacos (taco night)',
            'Tacos cu carne de vită (seara de tacos)',
          ),
          reason: t(
            'Refried beans make a hearty side for a taco night.',
            'Fasolea prăjită e o garnitură consistentă pentru o seară de tacos.',
          ),
          principle: 'complement_flavour',
          recipe: 'tacos',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Hot, thick beans are comforting when it is cold out.',
            'Fasolea groasă și fierbinte îți face bine într-o zi rece.',
          ),
        },
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'A warm spoonful next to eggs and tortillas makes a filling brunch plate.',
            'O lingură de fasole caldă lângă ouă și tortilla face un brunch săturător.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Beans and lard sit heavy and can cause wind during exercise.',
            'Fasolea și untura cad greu și pot provoca balonare în timpul efortului.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A heavy bowl of fried beans can keep you from sleeping well.',
            'O porție mare de fasole prăjită cade greu și poate strica somnul.',
          ),
        },
      ],
    },
    {
      slug: 'fasole-batuta-greek',
      cuisine: 'greek',
      hideBaseTips: [0],
      title: t(
        'Fava (Greek yellow split pea purée with onion and capers)',
        'Fava (piure grecesc de mazăre galbenă despicată, cu ceapă și capere)',
      ),
      servings: 6,
      prepMinutes: 35,
      cookMinutes: 60,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'split-peas',
          quantity: 350,
          unit: 'g',
          note: t('yellow, rinsed', 'galbenă, spălată'),
        },
        { ingredient: 'still-water', quantity: 1.2, unit: 'l' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('medium, roughly chopped', 'medie, tăiată grosier'),
        },
        { ingredient: 'bay-leaves', quantity: 0.2, unit: 'g' },
        {
          ingredient: 'olive-oil',
          key: 'oil-puree',
          quantity: 60,
          unit: 'ml',
          note: t('for the purée', 'pentru piure'),
        },
        { ingredient: 'lemon-juice', quantity: 40, unit: 'ml' },
        { ingredient: 'salt', quantity: 6, unit: 'g' },
        {
          ingredient: 'red-onion',
          quantity: 1,
          unit: 'pcs',
          note: t('small, finely chopped', 'mică, tăiată mărunt'),
        },
        {
          ingredient: 'capers',
          quantity: 30,
          unit: 'g',
          note: t('rinsed', 'clătite'),
        },
        { ingredient: 'oregano', quantity: 1, unit: 'g' },
        {
          ingredient: 'olive-oil',
          key: 'oil-topping',
          quantity: 30,
          unit: 'ml',
          note: t('for the topping', 'pentru deasupra'),
        },
      ],
      steps: [
        {
          key: 'boil',
          text: t(
            'Rinse the split peas well in a sieve. Put them in a pot with the water and bring to the boil over medium-high heat. As it comes to the boil a grey-white foam rises: skim it off with a spoon until the surface is clear.',
            'Spală bine mazărea într-o strecurătoare. Pune-o într-o oală cu apa și adu la fiert la foc mare-mediu. Când începe să fiarbă se ridică o spumă cenușie-albicioasă: ia-o cu lingura până când suprafața devine limpede.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Add the chopped onion and the bay leaf. Turn the heat down and simmer, half covered, for about 45 minutes, stirring often so it does not catch on the bottom, until the peas have collapsed into a thick, soft porridge. If it gets too dry before that, add a splash of boiling water. Take out the bay leaf.',
            'Adaugă ceapa tocată și foaia de dafin. Dă focul mic și lasă să fiarbă încet, cu capacul pe jumătate, circa 45 de minute, amestecând des ca să nu se prindă de fund, până când mazărea s-a desfăcut într-o fiertură groasă și moale. Dacă se usucă prea tare până atunci, adaugă un strop de apă clocotită. Scoate foaia de dafin.',
          ),
          timerSeconds: 2700,
        },
        {
          key: 'blend',
          text: t(
            'While it is still hot, blend with a stick blender until completely smooth, pouring in the 60 ml of olive oil in a thin stream. Stir in the lemon juice and the salt, and taste. It should be thick enough to hold a spoon for a moment.',
            'Cât e încă fierbinte, mixeaz-o cu blenderul vertical până devine complet netedă, turnând în același timp cei 60 ml de ulei de măsline, în fir subțire. Amestecă sucul de lămâie și sarea și gustă. Trebuie să fie destul de groasă cât să țină o clipă lingura în picioare.',
          ),
        },
        {
          key: 'rest',
          text: t(
            'Pour the purée into a shallow dish and leave it for 20 to 30 minutes. It firms as it cools, like soft polenta, and is best warm or at room temperature.',
            'Toarnă piureul într-un vas plat și lasă-l 20–30 de minute. Se îngroașă pe măsură ce se răcește, ca o mămăligă moale, și e mai bun cald sau la temperatura camerei.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'top',
          text: t(
            'Scatter the red onion, the capers and the oregano over the fava and drizzle with the 30 ml of olive oil.',
            'Presară deasupra ceapa roșie, caperele și oregano și stropește cu cei 30 ml de ulei de măsline.',
          ),
        },
      ],
      tips: [
        t(
          'Taste before the topping goes on: the capers (and olives, if you serve them) are salty, so go lightly with the salt in the purée.',
          'Gustă înainte să pui ceapa și caperele deasupra: caperele (și măslinele, dacă le servești) sunt sărate, așa că pune puțină sare în piure.',
        ),
      ],
      stepTips: [
        {
          step: 'boil',
          text: t(
            'If you skim early, the purée stays clean in colour and flavour. Do not skip it, because otherwise the foam ends up in the finished purée.',
            'Dacă iei spuma la început, piureul rămâne curat la culoare și la gust. Nu sări peste asta, pentru că altfel spuma rămâne în piureul gata.',
          ),
        },
      ],
      nutritionNote: t(
        'Split peas bring fibre and plant protein and keep you full, and olive oil is mostly unsaturated fat. The oil still adds a good share of the calories, and the capers, olives and pita add salt. Peas can cause wind if you are not used to them.',
        'Mazărea despicată aduce fibre și proteine vegetale și te satură, iar uleiul de măsline e în mare parte grăsime nesaturată. Totuși, uleiul aduce o bună parte din calorii, iar caperele, măslinele și lipia adaugă sare. Mazărea poate provoca balonare dacă nu ești obișnuit cu ea.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Warm pita', 'Lipie caldă'),
          reason: t(
            'Soft bread to scoop up the smooth purée and its oil.',
            'Pâine moale cu care iei piureul fin și uleiul lui.',
          ),
          principle: 'regional_tradition',
          ingredient: 'pita',
        },
        {
          kind: 'food',
          label: t('Olives', 'Măsline'),
          reason: t(
            'Their salty, bitter bite cuts through the soft, mild purée.',
            'Gustul lor sărat și ușor amar taie din moliciunea blândă a piureului.',
          ),
          principle: 'complement_flavour',
          ingredient: 'olives',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Crisp acidity cuts through the olive oil.',
            'Aciditatea fină taie uleiul de măsline.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'white-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'With pita and olives alongside, it is a filling lunch without meat.',
            'Cu lipie și măsline alături, e un prânz săturător, fără carne.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'It is best warm or at room temperature, so it needs no hot plate.',
            'Se mănâncă cel mai bine călduț sau la temperatura camerei, deci nu trebuie servit fierbinte.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Split peas and oil sit heavy and can cause wind during exercise.',
            'Mazărea despicată și uleiul cad greu și pot provoca balonare în timpul efortului.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A big portion of peas late at night can keep you from sleeping well.',
            'O porție mare de mazăre seara târziu poate strica somnul.',
          ),
        },
      ],
    },
  ],
};
