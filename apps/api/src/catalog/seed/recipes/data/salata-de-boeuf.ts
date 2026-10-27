import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Salată de boeuf base is the Romanian beef and vegetable salad with
// mayonnaise. Each Variant is a full Recipe with its own lines, steps and
// guidance; the base's Recipe-level Tips are inherited, and the Variants hide
// the two that only make sense with boiled beef.
export const salataDeBoeuf: BaseRecipeSeed = {
  slug: 'salata-de-boeuf',
  title: t(
    'Salată de boeuf (Romanian beef and vegetable salad with mayonnaise)',
    'Salată de boeuf',
  ),
  servings: 8,
  prepMinutes: 240,
  cookMinutes: 120,
  difficulty: 'medium',
  lines: [
    { ingredient: 'beef-round', quantity: 700, unit: 'g' },
    {
      ingredient: 'onion',
      quantity: 1,
      unit: 'pcs',
      note: t(
        'peeled, left whole, for the broth',
        'curățată, întreagă, pentru supă',
      ),
    },
    { ingredient: 'bay-leaves', quantity: 1, unit: 'g' },
    { ingredient: 'peppercorns', quantity: 3, unit: 'g' },
    {
      ingredient: 'still-water',
      quantity: 3.5,
      unit: 'l',
      note: t(
        '2 l for the beef, 1.5 l for the vegetables',
        '2 l pentru carne, 1,5 l pentru legume',
      ),
    },
    {
      ingredient: 'potato',
      quantity: 0.6,
      unit: 'kg',
      note: t('waxy, peeled', 'cu carne fermă, curățați'),
    },
    {
      ingredient: 'carrot',
      quantity: 300,
      unit: 'g',
      note: t('peeled', 'curățați'),
    },
    {
      ingredient: 'parsnip',
      quantity: 150,
      unit: 'g',
      note: t('peeled', 'curățat'),
    },
    {
      ingredient: 'parsley-root',
      quantity: 100,
      unit: 'g',
      optional: true,
      note: t('peeled', 'curățată'),
    },
    {
      ingredient: 'celeriac',
      quantity: 200,
      unit: 'g',
      note: t('peeled, in 3 cm chunks', 'curățată, tăiată în bucăți de 3 cm'),
    },
    {
      ingredient: 'frozen-peas',
      quantity: 250,
      unit: 'g',
    },
    {
      ingredient: 'pickled-cucumbers',
      quantity: 250,
      unit: 'g',
      note: t('drained', 'scurși'),
    },
    {
      ingredient: 'pickled-green-tomatoes',
      quantity: 150,
      unit: 'g',
      optional: true,
      note: t('drained', 'scurse'),
    },
    {
      ingredient: 'mayonnaise',
      key: 'mayonnaise-salad',
      quantity: 300,
      unit: 'g',
      note: t('for the salad', 'pentru salată'),
    },
    {
      ingredient: 'mayonnaise',
      key: 'mayonnaise-coating',
      quantity: 150,
      unit: 'g',
      note: t('to coat the top', 'pentru stratul de deasupra'),
    },
    { ingredient: 'mustard', quantity: 20, unit: 'g' },
    {
      ingredient: 'pickled-peppers',
      quantity: 150,
      unit: 'g',
      note: t(
        'gogoșari, drained; two thirds diced, the rest in strips for the top',
        'gogoșari, scurși; două treimi cubulețe, restul fâșii pentru deasupra',
      ),
    },
    {
      ingredient: 'roasted-peppers',
      quantity: 100,
      unit: 'g',
      optional: true,
      note: t(
        'optional, instead of some of the gogoșari',
        'opțional, în locul unei părți din gogoșari',
      ),
    },
    {
      ingredient: 'olives',
      quantity: 60,
      unit: 'g',
      optional: true,
      note: t('for decoration', 'pentru decor'),
    },
    {
      ingredient: 'salt',
      key: 'salt-beef',
      quantity: 6,
      unit: 'g',
      note: t('for the beef water', 'pentru apa de la carne'),
    },
    {
      ingredient: 'salt',
      key: 'salt-vegetables',
      quantity: 12,
      unit: 'g',
      note: t('for the vegetable water', 'pentru apa de la legume'),
    },
    {
      ingredient: 'salt',
      key: 'salt-salad',
      quantity: 3,
      unit: 'g',
      note: t('for the salad, to taste', 'pentru salată, după gust'),
    },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
  ],
  steps: [
    {
      key: 'start-beef',
      text: t(
        'Put the beef in a large pot with 2 l of cold water. Bring it to the boil over high heat, about 15 minutes, and skim off the grey foam that rises. Wash your hands in hot soapy water after handling the raw beef.',
        'Pune carnea de vită într-o oală mare cu 2 l de apă rece. Adu la fierbere la foc mare, aproximativ 15 minute, și ia spuma cenușie care iese la suprafață. Spală-ți mâinile cu apă caldă și săpun după ce ai atins carnea crudă.',
      ),
    },
    {
      key: 'simmer-beef',
      text: t(
        'Add the whole onion, the bay leaves, the peppercorns and 6 g of salt. Lower the heat until the water barely bubbles, half-cover the pot and simmer for 1 hour 30 minutes.',
        'Adaugă ceapa întreagă, foile de dafin, piperul boabe și 6 g de sare. Dă focul mai mic, până când apa abia clocotește, acoperă oala pe jumătate și fierbe 1 oră și 30 de minute.',
      ),
      timerSeconds: 5400,
    },
    {
      key: 'boil-vegetables',
      text: t(
        'When the beef has about 40 minutes of its 1 hour 30 minutes left, put the potatoes, carrots, parsnip, parsley root and celeriac in a second pot with 1.5 l of cold water and 12 g of salt. Bring to the boil, then simmer for 25 minutes, until a knife slides into the thickest potato with no resistance. Halve any large potato so they cook evenly.',
        'Când mai sunt aproximativ 40 de minute din cele 1 oră și 30 de minute de fierbere ale cărnii, pune cartofii, morcovii, păstârnacul, rădăcina de pătrunjel și țelina într-o a doua oală, cu 1,5 l de apă rece și 12 g de sare. Adu la fierbere, apoi fierbe 25 de minute, până când un cuțit intră fără rezistență în cel mai gros cartof. Taie în două cartofii mari, ca să se fiarbă uniform.',
      ),
      timerSeconds: 1500,
    },
    {
      key: 'boil-peas',
      text: t(
        'Lift the vegetables onto a tray (the beef keeps simmering). Tip the frozen peas into the same boiling water, bring it back to the boil and cook for 2 minutes, then drain well and spread them on a plate.',
        'Scoate legumele pe o tavă (carnea continuă să fiarbă). Toarnă mazărea congelată în aceeași apă clocotită, readu la fierbere și fierbe 2 minute, apoi scurge-o bine și întinde-o pe o farfurie.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'test-beef',
      text: t(
        'Push a fork into the thickest part of the beef. It is done when the fork slides in with no resistance and the meat starts to pull apart into strands; by then it is far past cooked through. If it still grips the fork, simmer another 20 minutes and test again.',
        'Înfige o furculiță în partea cea mai groasă a cărnii. E gata când furculița intră fără nicio rezistență și carnea începe să se desfacă în fire; atunci e de mult gătită complet. Dacă încă se agață de furculiță, mai fierbe 20 de minute și verifică din nou.',
      ),
    },
    {
      key: 'lift-beef',
      text: t(
        'Lift the beef out onto a clean board and cut it into 3 or 4 pieces so it cools faster. Strain the broth and keep it for another dish.',
        'Scoate carnea pe un tocător curat și taie-o în 3-4 bucăți, ca să se răcească mai repede. Strecoară supa și păstreaz-o pentru altă mâncare.',
      ),
    },
    {
      key: 'cool',
      text: t(
        'Leave the beef pieces, the vegetables and the peas to cool until they are no longer hot, then put them in the fridge, uncovered, for about an hour, until the middle of the biggest piece of beef is cold. Everything must be cold before it meets the mayonnaise, and the cooked food must be in the fridge within 2 hours of coming off the heat.',
        'Lasă bucățile de carne, legumele și mazărea să se răcească până nu mai sunt fierbinți, apoi pune-le la frigider, neacoperite, aproximativ o oră, până când mijlocul celei mai mari bucăți de carne e rece. Totul trebuie să fie rece înainte să intre maioneza, iar mâncarea gătită trebuie să ajungă la frigider în cel mult 2 ore de la luarea de pe foc.',
      ),
      timerSeconds: 3600,
    },
    {
      key: 'dice-beef',
      text: t(
        'Cut the cold beef into 8 mm cubes, about the size of a pea. Check that the middle of the biggest piece is cold first.',
        'Taie carnea rece în cubulețe de 8 mm, cam cât o boabă de mazăre. Verifică mai întâi că mijlocul celei mai mari bucăți e rece.',
      ),
    },
    {
      key: 'dice-vegetables',
      text: t(
        'Cut the potatoes, carrots, parsnip, parsley root, celeriac, pickled cucumbers, pickled green tomatoes and two thirds of the pickled peppers (and the roasted peppers, if you use them) into the same 8 mm cubes. Keep the rest of the pickled peppers cut into strips, a few olives and a few pickle slices for decoration.',
        'Taie cartofii, morcovii, păstârnacul, rădăcina de pătrunjel, țelina, castraveții murați, gogonelele și două treimi din gogoșari (și ardeii copți, dacă îi folosești) în aceleași cubulețe de 8 mm. Păstrează restul de gogoșari tăiați fâșii, câteva măsline și câteva felii de castravete murat pentru decor.',
      ),
    },
    {
      key: 'dress',
      text: t(
        'In a large bowl, stir 300 g of the mayonnaise with the mustard, 3 g of salt and the pepper. Add the beef, the diced vegetables and the peas, and fold gently with a spatula until everything is coated. Taste and add salt only if needed; the pickles and the mayonnaise are already salty.',
        'Într-un castron mare, amestecă 300 g de maioneză cu muștarul, 3 g de sare și piperul. Adaugă carnea, legumele tăiate cubulețe și mazărea și amestecă ușor cu o spatulă, până când totul e acoperit. Gustă și sărează doar dacă e nevoie; murăturile și maioneza sunt deja sărate.',
      ),
    },
    {
      key: 'shape',
      text: t(
        'Pile the salad on a platter and smooth it into a dome with a spatula dipped in cold water. Coat it with the remaining 150 g of mayonnaise and decorate with the pepper strips, the olives and the pickle slices.',
        'Pune salata pe o tavă de servire și netezește-o într-o cupolă cu o spatulă înmuiată în apă rece. Acoperă-o cu cele 150 g de maioneză rămase și decorează cu fâșiile de gogoșari, măslinele și feliile de castravete murat.',
      ),
    },
    {
      key: 'chill',
      text: t(
        'Cover the platter and chill it in the fridge for at least 2 hours, so the flavours blend and the salad firms up. Take it out only when it is time to serve, and do not leave it at room temperature for more than 2 hours in total. Keep leftovers in the fridge and eat them within 2 days.',
        'Acoperă platoul și ține salata la frigider cel puțin 2 ore, ca aromele să se lege și salata să se întărească. Scoate-o abia când o servești și nu o lăsa la temperatura camerei mai mult de 2 ore în total. Păstrează resturile la frigider și mănâncă-le în cel mult 2 zile.',
      ),
      timerSeconds: 7200,
    },
  ],
  tips: [
    t(
      'Mix the mayonnaise in only when everything is fully cold. Warm vegetables turn it oily and thin, and the salad spoils faster.',
      'Pune maioneza abia când totul s-a răcit complet. Legumele calde o fac uleioasă și subțire, iar salata se strică mai repede.',
    ),
    t(
      'Homemade mayonnaise works well here: whisk 2 egg yolks with 1 teaspoon of mustard, then add 250 ml of sunflower oil in a thin thread while whisking, and finish with a squeeze of lemon. It contains raw egg, so do not serve it to small children, older people or anyone pregnant, use pasteurised yolks if in doubt, and eat the salad within 2 days.',
      'Maioneza făcută în casă merge foarte bine: bate 2 gălbenușuri cu 1 linguriță de muștar, apoi adaugă 250 ml de ulei de floarea soarelui în fir subțire, amestecând continuu, și termină cu puțină zeamă de lămâie. Conține ou crud, deci nu o da copiilor mici, persoanelor în vârstă sau gravidelor, folosește gălbenușuri pasteurizate dacă ai dubii și mănâncă salata în cel mult 2 zile.',
    ),
    t(
      'Freeze the beef broth in portions: it makes a good base for a soup or a ciorbă.',
      'Congelează supa de la carne în porții: e o bază bună pentru o supă sau o ciorbă.',
    ),
    t(
      'Boiled boneless chicken thighs (about 800 g) can replace the beef. Simmer them for about 20 to 25 minutes, until the thickest part reaches 74 °C and the juices run clear.',
      'Pulpele de pui dezosate (aproximativ 800 g), fierte pot înlocui carnea de vită. Fierbe-le aproximativ 20-25 de minute, până când partea cea mai groasă ajunge la 74 °C și sucul iese limpede.',
    ),
  ],
  stepTips: [
    {
      step: 'simmer-beef',
      text: t(
        'Keep the water just trembling: a hard boil makes lean round tough and stringy.',
        'Ține focul mic, să fiarbă abia clocotind: un clocot puternic face carnea slabă de pulpă tare și fibroasă.',
      ),
    },
    {
      step: 'dice-vegetables',
      text: t(
        'Pat the pickles dry on kitchen paper before dicing them, or they will water the salad down.',
        'Tamponează murăturile cu un prosop de hârtie înainte să le tai, altfel vor face salata apoasă.',
      ),
    },
  ],
  nutritionNote: t(
    'Beef and peas give protein, and the root vegetables add fibre and starch. The mayonnaise is mostly oil, so mainly unsaturated fat, but it is energy-dense in this quantity, and the pickles, olives and mayonnaise add a lot of salt.',
    'Carnea de vită și mazărea dau proteine, iar legumele rădăcinoase aduc fibre și amidon. Maioneza e mai ales ulei, deci grăsime în principal nesaturată, dar la această cantitate e foarte calorică, iar murăturile, măslinele și maioneza aduc multă sare.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Romanian appetizer platter', 'Platou românesc de aperitive'),
      reason: t(
        'Both are cold dishes made ahead for the same holiday table, so they can sit side by side.',
        'Amândouă sunt preparate reci, făcute dinainte pentru aceeași masă de sărbătoare, așa că pot sta una lângă alta.',
      ),
      principle: 'regional_tradition',
      recipe: 'appetizer-platter-romanian',
    },
    {
      kind: 'food',
      label: t('Fresh bread', 'Pâine proaspătă'),
      reason: t(
        'The crumb soaks up the mayonnaise and the soft salad gets a crust to bite against.',
        'Miezul absoarbe maioneza, iar coaja crocantă contrastează cu salata moale.',
      ),
      principle: 'contrast_texture',
      ingredient: 'bread',
    },
    {
      kind: 'food',
      label: t('Horseradish', 'Hrean'),
      reason: t(
        'Its sharp heat refreshes the palate between creamy bites.',
        'Iuțeala lui împrospătează gustul între îmbucăturile cremoase.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'horseradish',
    },
    {
      kind: 'drink',
      label: t('Dry white wine', 'Vin alb sec'),
      reason: t(
        'Its acidity cuts through the mayonnaise and refreshes the palate.',
        'Aciditatea lui taie din maioneză și împrospătează gustul.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'white-wine',
    },
    {
      kind: 'drink',
      label: t('Sparkling water', 'Apă minerală'),
      reason: t(
        'The bubbles clear the creaminess between bites.',
        'Bulele curăță cremozitatea între îmbucături.',
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
        'Hearty and filling, with beef, potatoes and root vegetables, and made the day before.',
        'Consistentă și săturătoare, cu carne de vită, cartofi și rădăcinoase, și se face cu o zi înainte.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'The mayonnaise and the beef make it heavy to digest right before exercise.',
        'Maioneza și carnea o fac grea de digerat chiar înainte de efort.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A big, rich portion sits heavy before bed.',
        'O porție mare și bogată cade greu înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'salata-de-boeuf-spanish',
      cuisine: 'spanish',
      hideBaseTips: [2, 3],
      title: t(
        'Ensaladilla rusa (Spanish potato, tuna and vegetable salad)',
        'Ensaladilla rusa (salată spaniolă de cartofi cu ton și legume)',
      ),
      servings: 6,
      prepMinutes: 90,
      cookMinutes: 30,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'potato',
          quantity: 0.7,
          unit: 'kg',
          note: t(
            'waxy, peeled, in 1.5 cm cubes',
            'cu carne fermă, curățați, tăiați în cuburi de 1,5 cm',
          ),
        },
        {
          ingredient: 'carrot',
          quantity: 200,
          unit: 'g',
          note: t(
            'peeled, in 1 cm cubes',
            'curățați, tăiați în cuburi de 1 cm',
          ),
        },
        { ingredient: 'frozen-peas', quantity: 150, unit: 'g' },
        { ingredient: 'eggs', quantity: 4, unit: 'pcs' },
        {
          ingredient: 'canned-tuna',
          quantity: 220,
          unit: 'g',
          note: t(
            'in olive oil, drained and flaked',
            'în ulei de măsline, scurs și desfăcut în bucăți',
          ),
        },
        {
          ingredient: 'mayonnaise',
          quantity: 250,
          unit: 'g',
        },
        {
          ingredient: 'roasted-peppers',
          quantity: 100,
          unit: 'g',
          note: t(
            'a third diced into the salad, the rest in strips for the top',
            'o treime tăiată cubulețe în salată, restul fâșii pentru deasupra',
          ),
        },
        {
          ingredient: 'olives',
          quantity: 60,
          unit: 'g',
          note: t('green, for the top', 'verzi, pentru deasupra'),
        },
        {
          ingredient: 'salt',
          key: 'salt-boiling',
          quantity: 10,
          unit: 'g',
          note: t('for the boiling water', 'pentru apa de fiert'),
        },
        {
          ingredient: 'salt',
          key: 'salt-salad',
          quantity: 2,
          unit: 'g',
          note: t('for the salad, to taste', 'pentru salată, după gust'),
        },
      ],
      steps: [
        {
          key: 'boil-vegetables',
          text: t(
            'Put the potatoes and carrots in a pot, cover them with cold water, add 10 g of salt and bring to the boil. Simmer for 10 minutes, until a knife slides into a potato cube with no resistance but the cube still holds its shape.',
            'Pune cartofii și morcovii într-o oală, acoperă-i cu apă rece, adaugă 10 g de sare și adu la fierbere. Fierbe 10 minute, până când un cuțit intră într-un cub de cartof fără rezistență, dar cubul își păstrează forma.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'boil-peas',
          text: t(
            'Add the frozen peas to the pot, bring it back to the boil and cook for 2 minutes more, then drain well and spread everything on a tray to steam dry.',
            'Adaugă mazărea congelată în oală, readu la fierbere și mai fierbe 2 minute, apoi scurge bine și întinde totul pe o tavă, ca aburul să se evapore.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'boil-eggs',
          text: t(
            'While the vegetables cook, lower the eggs into a second pot of boiling water and cook them for 10 minutes, until the yolks are fully set. Cool them under cold running water, then peel and chop them.',
            'Cât timp se fierb legumele, pune ouăle într-o a doua oală cu apă clocotită și fierbe-le 10 minute, până când gălbenușurile sunt complet întărite. Răcește-le sub jet de apă rece, apoi curăță-le și taie-le mărunt.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'cool',
          text: t(
            'Leave the vegetables and the chopped eggs to cool, then chill them in the fridge for about 45 minutes. The salad must be fully cold before the mayonnaise goes in, and the cooked food should be in the fridge within 2 hours of coming off the heat.',
            'Lasă legumele și ouăle tocate să se răcească, apoi ține-le la frigider aproximativ 45 de minute. Salata trebuie să fie complet rece înainte să intre maioneza, iar mâncarea gătită trebuie să ajungă la frigider în cel mult 2 ore de la luarea de pe foc.',
          ),
          timerSeconds: 2700,
        },
        {
          key: 'fold',
          text: t(
            'In a large bowl, combine the cold vegetables, the chopped eggs, the flaked tuna, a third of the roasted peppers (diced) and 2 g of salt. Fold in the mayonnaise gently, so the potato cubes do not break, then taste and add salt only if needed.',
            'Într-un castron mare, amestecă legumele reci, ouăle tocate, tonul desfăcut în bucăți, o treime din ardeii copți (tăiați cubulețe) și 2 g de sare. Adaugă maioneza amestecând ușor, ca să nu se rupă cuburile de cartof, apoi gustă și sărează doar dacă e nevoie.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Pile the salad on a plate, smooth the top and decorate with the remaining roasted pepper strips and the olives. Chill for at least 1 hour before serving. Keep it in the fridge, do not leave it out for more than 2 hours in total, and eat leftovers within 2 days.',
            'Pune salata pe o farfurie, netezește suprafața și decorează cu fâșiile de ardei copți rămase și cu măslinele. Ține-o la frigider cel puțin 1 oră înainte de servire. Păstreaz-o la frigider, nu o lăsa la temperatura camerei mai mult de 2 ore în total și mănâncă resturile în cel mult 2 zile.',
          ),
          timerSeconds: 3600,
        },
      ],
      tips: [
        t(
          'Let the drained potatoes steam dry for a few minutes: wet cubes thin out the mayonnaise.',
          'Lasă cartofii scurși să se zvânte câteva minute: cuburile ude subțiază maioneza.',
        ),
      ],
      stepTips: [
        {
          step: 'fold',
          text: t(
            'Tuna in olive oil is moister and tastier than tuna in brine, but drain it well, or the oil will loosen the mayonnaise.',
            'Tonul în ulei de măsline e mai suculent și mai gustos decât cel în saramură, dar scurge-l bine, altfel uleiul va subția maioneza.',
          ),
        },
      ],
      nutritionNote: t(
        'Eggs and tuna give protein, and the potatoes make it filling. The mayonnaise is mostly oil, so mainly unsaturated fat, but it adds a lot of energy, and the tuna, olives and mayonnaise bring salt. Little fibre beyond the peas and carrot.',
        'Ouăle și tonul dau proteine, iar cartofii o fac săturătoare. Maioneza e mai ales ulei, deci grăsime în principal nesaturată, dar aduce multă energie, iar tonul, măslinele și maioneza aduc sare. Fibre puține, în afară de cele din mazăre și morcov.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Spanish tapas platter', 'Platou spaniol de tapas'),
          reason: t(
            'Ensaladilla rusa is itself a tapa, served cold, so it sits naturally next to the other small plates.',
            'Ensaladilla rusa e ea însăși o tapa, servită rece, așa că se așază firesc lângă celelalte farfurii mici.',
          ),
          principle: 'regional_tradition',
          recipe: 'appetizer-platter-spanish',
        },
        {
          kind: 'food',
          label: t('Picos (Spanish breadsticks)', 'Picos (grisine spaniole)'),
          reason: t(
            'Crisp little breadsticks to scoop up the creamy salad.',
            'Grisine mici și crocante cu care iei salata cremoasă.',
          ),
          principle: 'contrast_texture',
          ingredient: 'breadsticks',
        },
        {
          kind: 'drink',
          label: t('Cold beer', 'Bere rece'),
          reason: t(
            'Its bitterness and bubbles cut through the mayonnaise.',
            'Amăreala și bulele ei taie din maioneză.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'beer',
        },
      ],
      eatingMoments: [
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Served cold, it is refreshing in the heat; keep it chilled until you serve it.',
            'Servită rece, e răcoritoare pe căldură; ține-o la frigider până o servești.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Made ahead, it is a filling lunch with bread.',
            'Făcută dinainte, e un prânz sățios, cu pâine.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'The mayonnaise makes it heavy to digest right before exercise.',
            'Maioneza o face grea de digerat chiar înainte de efort.',
          ),
        },
      ],
    },
    {
      slug: 'salata-de-boeuf-french',
      cuisine: 'french',
      hideBaseTips: [2, 3],
      title: t(
        'Macédoine de légumes (French diced vegetable salad with mayonnaise)',
        'Macédoine de légumes (salată franțuzească de legume în cubulețe, cu maioneză)',
      ),
      servings: 4,
      prepMinutes: 60,
      cookMinutes: 20,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'carrot',
          quantity: 200,
          unit: 'g',
          note: t(
            'peeled, in 5 mm cubes',
            'curățați, tăiați în cubulețe de 5 mm',
          ),
        },
        {
          ingredient: 'turnip',
          quantity: 200,
          unit: 'g',
          note: t(
            'peeled, in 5 mm cubes',
            'curățat, tăiat în cubulețe de 5 mm',
          ),
        },
        {
          ingredient: 'green-beans',
          quantity: 150,
          unit: 'g',
          note: t('in 5 mm pieces', 'tăiată în bucățele de 5 mm'),
        },
        { ingredient: 'frozen-peas', quantity: 100, unit: 'g' },
        { ingredient: 'mayonnaise', quantity: 120, unit: 'g' },
        { ingredient: 'mustard', quantity: 10, unit: 'g' },
        { ingredient: 'lemon-juice', quantity: 15, unit: 'ml' },
        {
          ingredient: 'salt',
          key: 'salt-boiling',
          quantity: 10,
          unit: 'g',
          note: t('for the boiling water', 'pentru apa de fiert'),
        },
        {
          ingredient: 'salt',
          key: 'salt-salad',
          quantity: 1,
          unit: 'g',
          note: t('for the salad, to taste', 'pentru salată, după gust'),
        },
        { ingredient: 'white-pepper', quantity: 0.5, unit: 'g' },
        {
          ingredient: 'lettuce',
          quantity: 1,
          unit: 'pcs',
          optional: true,
          note: t('leaves, to serve on', 'frunze, pentru servire'),
        },
      ],
      steps: [
        {
          key: 'dice',
          text: t(
            'Cut the carrots, turnip and green beans into tiny, even 5 mm pieces, so they cook at the same speed and look neat in the bowl.',
            'Taie morcovii, napul și fasolea verde în bucățele mici și egale de 5 mm, ca să se gătească la fel de repede și să arate îngrijit în bol.',
          ),
        },
        {
          key: 'boil-roots',
          text: t(
            'Bring 2 l of water and 10 g of salt to the boil. Add the carrots and turnip and cook for 4 minutes, until just tender but still with a bite. Lift them out with a slotted spoon into a bowl of iced water.',
            'Adu la fierbere 2 l de apă cu 10 g de sare. Adaugă morcovii și napul și fierbe 4 minute, până sunt abia fragezi, dar încă păstrează un pic de fermitate. Scoate-i cu o strecurătoare într-un bol cu apă cu gheață.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'boil-greens',
          text: t(
            'In the same boiling water, cook the green beans and the frozen peas for 3 minutes, until the beans are just tender and still bright green. Move them into the iced water too.',
            'În aceeași apă clocotită, fierbe fasolea verde și mazărea congelată 3 minute, până când fasolea e abia fragedă și încă de un verde viu. Mută-le și pe ele în apa cu gheață.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'dry',
          text: t(
            'Drain everything well and spread it on a clean tea towel to dry, then chill in the fridge for 30 minutes. The vegetables must be cold and dry, or the dressing will turn watery.',
            'Scurge totul bine și întinde legumele pe un prosop curat, ca să se usuce, apoi ține-le 30 de minute la frigider. Legumele trebuie să fie reci și uscate, altfel dresingul devine apos.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'dress',
          text: t(
            'Stir the mayonnaise with the mustard, lemon juice, white pepper and 1 g of salt. Fold in the cold vegetables gently, until they are just coated and still look like separate colours. Taste and adjust the salt and lemon.',
            'Amestecă maioneza cu muștarul, zeama de lămâie, piperul alb și 1 g de sare. Adaugă legumele reci, amestecând ușor, până când sunt abia acoperite și se văd încă culorile separate. Gustă și potrivește sarea și lămâia.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Serve as a starter on lettuce leaves, with a few leaves under each portion. Keep it in the fridge until you serve it, do not leave it out for more than 2 hours, and eat leftovers within 2 days.',
            'Servește ca aperitiv pe frunze de salată verde, câteva sub fiecare porție. Ține salata la frigider până o servești, nu o lăsa la temperatura camerei mai mult de 2 ore și mănâncă resturile în cel mult 2 zile.',
          ),
        },
      ],
      tips: [
        t(
          'Cooking each vegetable in its own time and cooling it in iced water keeps the colours bright and the bite firm.',
          'Dacă gătești fiecare legumă pe cât are nevoie și o răcești în apă cu gheață, culorile rămân vii, iar legumele păstrează fermitatea.',
        ),
      ],
      stepTips: [
        {
          step: 'dress',
          text: t(
            'Use less mayonnaise than you think you need: it should only bind the vegetables, not drown them.',
            'Pune mai puțină maioneză decât crezi că trebuie: ea doar leagă legumele, nu le îneacă.',
          ),
        },
      ],
      nutritionNote: t(
        'Mostly vegetables, so it is light and gives fibre, with no meat or potato. The mayonnaise is mostly oil, so mainly unsaturated fat, but it is energy-dense and adds salt. Low in protein on its own.',
        'Aproape numai legume, deci e ușoară și dă fibre, fără carne sau cartofi. Maioneza e mai ales ulei, deci grăsime în principal nesaturată, dar e foarte calorică și aduce sare. Cu puține proteine de una singură.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Ham', 'Șuncă'),
          reason: t(
            'Slices of ham add protein and salty depth to the light salad.',
            'Feliile de șuncă adaugă proteine și un gust sărat, plin, salatei ușoare.',
          ),
          principle: 'complement_flavour',
          ingredient: 'ham',
        },
        {
          kind: 'food',
          label: t('Hard-boiled eggs', 'Ouă fierte tari'),
          reason: t(
            'Egg halves on top make it a more filling starter.',
            'Jumătățile de ou de deasupra o fac un aperitiv mai sățios.',
          ),
          principle: 'complement_flavour',
          ingredient: 'eggs',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its acidity cuts through the mayonnaise.',
            'Aciditatea lui taie din maioneză.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'white-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'A cold, light dish for the heat.',
            'Un preparat rece și ușor pentru zilele calde.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Mostly vegetables and quick to put together ahead of time.',
            'Aproape numai legume și se pregătește ușor dinainte.',
          ),
        },
      ],
    },
  ],
};
