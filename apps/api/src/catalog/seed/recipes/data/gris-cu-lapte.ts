import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// Griș cu lapte is a semolina milk pudding cooked in one pot. The Turkish
// Variant toasts the semolina in butter and pours hot sweet milk over it (a
// halva); the Greek one bakes a semolina custard between filo sheets and
// soaks it in syrup. Each Variant is a full Recipe; the first base Tip is
// inherited by the Turkish Variant only.
export const grisCuLapte: BaseRecipeSeed = {
  slug: 'gris-cu-lapte',
  title: t('Romanian semolina milk pudding (griș cu lapte)', 'Griș cu lapte'),
  servings: 4,
  prepMinutes: 10,
  cookMinutes: 14,
  difficulty: 'easy',
  lines: [
    { ingredient: 'milk', quantity: 1, unit: 'l' },
    { ingredient: 'sugar', quantity: 70, unit: 'g' },
    { ingredient: 'salt', quantity: 1, unit: 'g' },
    {
      ingredient: 'lemon',
      quantity: 1,
      unit: 'pcs',
      note: t(
        'zest only, grated; leave the white pith',
        'doar coaja, rasă; fără partea albă',
      ),
    },
    { ingredient: 'semolina', quantity: 100, unit: 'g' },
    { ingredient: 'butter', quantity: 15, unit: 'g' },
    { ingredient: 'vanilla-sugar', quantity: 8, unit: 'g' },
    {
      ingredient: 'jam',
      quantity: 80,
      unit: 'g',
      optional: true,
      note: t('to serve', 'pentru servit'),
    },
    {
      ingredient: 'cinnamon',
      quantity: 1,
      unit: 'g',
      optional: true,
      note: t('to dust on top', 'pentru presărat deasupra'),
    },
  ],
  steps: [
    {
      key: 'zest',
      text: t(
        'Grate the zest of the lemon on the fine side of the grater. Take only the yellow part and leave the bitter white pith behind.',
        'Dă pe răzătoarea fină coaja de lămâie. Ia doar partea galbenă și lasă partea albă, amară.',
      ),
    },
    {
      key: 'heat-milk',
      text: t(
        'Pour the milk into a 3 litre pot and add the sugar, the salt and the zest. Heat over medium heat for about 7 minutes, until the milk steams and tiny bubbles appear at the edge. Stay at the stove: milk rises and boils over in seconds.',
        'Toarnă laptele într-o oală de 3 litri și adaugă zahărul, sarea și coaja de lămâie. Încălzește la foc mediu aproximativ 7 minute, până când laptele scoate aburi și apar bule mici pe margine. Rămâi lângă aragaz: laptele crește și dă în foc în câteva secunde.',
      ),
      timerSeconds: 420,
    },
    {
      key: 'semolina',
      text: t(
        'Turn the heat to low. Whisking all the time with one hand, rain the semolina into the milk in a thin stream with the other, so it does not form lumps.',
        'Dă focul la mic. Amestecând continuu cu telul într-o mână, toarnă grișul în lapte într-un fir subțire cu cealaltă, ca să nu se formeze cocoloașe.',
      ),
    },
    {
      key: 'simmer',
      text: t(
        'Switch to a wooden spoon and simmer for 5 minutes, stirring and scraping the bottom and corners, until the pudding is as thick as soft porridge and bubbles slowly. It may spit, so use a long spoon and keep your hand and face back. Taste, and stir in more sugar if you like it sweeter.',
        'Treci la o lingură de lemn și fierbe 5 minute la foc mic, amestecând și răzuind fundul și colțurile oalei, până când grișul e gros ca un păsat moale și face bule rare. Poate stropi, așa că folosește o lingură lungă și ține mâna și fața departe. Gustă și mai adaugă zahăr, dacă îl vrei mai dulce.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'finish',
      text: t(
        'Take the pot off the heat. Stir in the butter and the vanilla sugar until the butter has melted.',
        'Ia oala de pe foc. Amestecă untul și zahărul vanilat până se topește untul.',
      ),
    },
    {
      key: 'rest',
      text: t(
        'Leave the pudding to rest for 5 minutes, stirring once or twice to let the steam out. Taste a small spoonful yourself before you serve it to children.',
        'Lasă grișul să stea 5 minute, amestecând o dată sau de două ori ca să iasă aburul. Gustă tu întâi o lingură mică înainte să-l dai copiilor.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'serve',
      text: t(
        'Spoon the pudding into bowls and top with jam, or dust with cinnamon (and a little more sugar if you like).',
        'Pune grișul în boluri și adaugă deasupra dulceață sau presară scorțișoară (și puțin zahăr în plus, dacă vrei).',
      ),
    },
  ],
  tips: [
    t(
      'This dish is very hot and clings to skin, and it holds its heat much longer than it looks, so let it rest before you give it to children and keep the pot or pan out of their reach.',
      'Acest preparat e foarte fierbinte, se lipește de piele și își păstrează căldura mult mai mult decât pare, așa că lasă-l să stea înainte să-l dai copiilor și ține oala sau tigaia departe de ei.',
    ),
    t(
      'The pudding keeps thickening as it cools. If it has gone stiff, stir in a splash of warm milk to loosen it.',
      'Grișul se îngroașă pe măsură ce se răcește. Dacă s-a întărit prea tare, amestecă-l cu un strop de lapte cald.',
    ),
    t(
      'Leftovers: press cling film onto the surface so no skin forms, cool them and get them into the fridge within 2 hours. Eat within 3 days; USDA gives 3 to 4 days for cooked leftovers.',
      'Dacă rămâne: apasă folie alimentară pe suprafață ca să nu se formeze pieliță, răcește grișul și pune-l la frigider în cel mult 2 ore. Consumă-l în 3 zile; USDA indică 3-4 zile pentru mâncarea gătită rămasă.',
    ),
    t(
      'This dish contains gluten (semolina) and milk.',
      'Acest preparat conține gluten (griș) și lapte.',
    ),
  ],
  stepTips: [
    {
      step: 'semolina',
      text: t(
        'Let the semolina fall through your fingers close to the milk, and keep whisking; dumping it in at once makes lumps that will not break up.',
        'Lasă grișul să cadă printre degete aproape de lapte și continuă să amesteci; dacă îl torni deodată, se fac cocoloașe care nu se mai desfac.',
      ),
    },
    {
      step: 'simmer',
      text: t(
        'The pudding catches first in the corners of the pot, so keep scraping them.',
        'Grișul se prinde mai întâi în colțurile oalei, așa că răzuiește-le mereu.',
      ),
    },
  ],
  nutritionNote: t(
    'Milk adds protein and calcium and the pudding is filling, but semolina is refined wheat with little fibre, and the sugar, vanilla sugar and any jam make it sweet. Fruit instead of jam gives more fibre and vitamins.',
    'Laptele aduce proteine și calciu, iar grișul satură, dar grișul e grâu rafinat cu puține fibre, iar zahărul, zahărul vanilat și dulceața îl îndulcesc. Fructele în loc de dulceață aduc mai multe fibre și vitamine.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Sour cherries', 'Vișine'),
      reason: t(
        'Their tartness cuts the sweet, creamy pudding.',
        'Aciditatea lor taie dulceața și cremozitatea grișului.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'sour-cherry',
    },
    {
      kind: 'food',
      label: t('Chopped walnuts', 'Nuci tocate'),
      reason: t(
        'A crunch against the smooth pudding.',
        'Un crocant care contrastează cu textura fină a grișului.',
      ),
      principle: 'contrast_texture',
      ingredient: 'walnuts',
    },
    {
      kind: 'drink',
      label: t('Tea', 'Ceai'),
      reason: t(
        'Its light bitterness balances the sweetness of the milk and sugar.',
        'Amăreala ușoară echilibrează dulceața laptelui și a zahărului.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'tea',
    },
  ],
  eatingMoments: [
    {
      moment: 'morning',
      polarity: 'good_for',
      reason: t(
        'Warm, filling and quick to make from the pantry.',
        'Cald, săturător și se face repede din ce ai în cămară.',
      ),
    },
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A warm bowl is comforting when it is cold outside.',
        'Un bol cald te încălzește când afară e frig.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'A bowl of thick milk pudding can sit heavy during exercise.',
        'Un bol de griș gros cu lapte poate cădea greu în timpul efortului.',
      ),
    },
  ],
  variants: [
    {
      slug: 'gris-cu-lapte-turkish',
      cuisine: 'turkish',
      title: t(
        'İrmik helvası (Turkish toasted semolina halva with milk and pine nuts)',
        'İrmik helvası (halva turcească de griș prăjit, cu lapte și semințe de pin)',
      ),
      servings: 8,
      prepMinutes: 15,
      cookMinutes: 31,
      difficulty: 'easy',
      hideBaseTips: [1, 2, 3],
      lines: [
        { ingredient: 'butter', quantity: 125, unit: 'g' },
        { ingredient: 'pine-nuts', quantity: 50, unit: 'g' },
        { ingredient: 'semolina', quantity: 250, unit: 'g' },
        { ingredient: 'milk', quantity: 0.4, unit: 'l' },
        { ingredient: 'still-water', quantity: 0.2, unit: 'l' },
        { ingredient: 'sugar', quantity: 200, unit: 'g' },
        {
          ingredient: 'cinnamon',
          quantity: 2,
          unit: 'g',
          optional: true,
          note: t('to dust on top', 'pentru presărat deasupra'),
        },
      ],
      steps: [
        {
          key: 'hot-milk',
          text: t(
            'In a small pot, heat the milk, the water and the sugar for about 5 minutes, stirring, until the sugar has dissolved and the liquid steams. Do not let it boil over. Take it off the heat and cover it with a lid so it stays hot.',
            'Într-o oală mică, încălzește laptele, apa și zahărul aproximativ 5 minute, amestecând, până se dizolvă zahărul și lichidul scoate aburi. Nu-l lăsa să dea în foc. Ia oala de pe foc și acoper-o cu un capac, ca lichidul să rămână fierbinte.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'melt',
          text: t(
            'Melt the butter in a deep 28 cm heavy pan over medium-low heat.',
            'Topește untul într-o tigaie adâncă și grea de 28 cm, la foc mic-mediu.',
          ),
        },
        {
          key: 'toast',
          text: t(
            'Add the pine nuts and the semolina and stir constantly for about 15 minutes, until the pine nuts are pale golden and the semolina turns the colour of light hazelnuts and smells of toasted nuts. Do not stop stirring: it catches quickly.',
            'Adaugă semințele de pin și grișul și amestecă continuu aproximativ 15 minute, până când semințele sunt galben-pal, iar grișul capătă culoarea alunei deschise și miroase a alune prăjite. Nu te opri din amestecat: se prinde repede.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'off-heat',
          text: t(
            'Move the pan off the heat onto a switched-off hob ring and leave the long wooden spoon in it. If the liquid has stopped steaming, heat it again until it does, then take it off the heat.',
            'Mută tigaia de pe foc pe un ochi de aragaz stins și lasă lingura lungă de lemn în ea. Dacă lichidul nu mai scoate aburi, încălzește-l din nou până scoate, apoi ia-l de pe foc.',
          ),
        },
        {
          key: 'pour',
          text: t(
            "Safety first: it will hiss, spit and send up steam. Keep children away, pull your sleeves down and stand back. Pour the hot liquid into the semolina in a thin stream from arm's length, with a lid held in your other hand as a shield.",
            'Mai întâi siguranța: va sfârâi, va stropi și va ieși abur. Ține copiii departe, trage mânecile în jos și stai într-o parte. Toarnă lichidul fierbinte peste griș într-un fir subțire, cu brațul întins, ținând un capac în cealaltă mână ca scut.',
          ),
        },
        {
          key: 'stir',
          text: t(
            'When the hissing has died down, put the pan back on low heat and stir with the long wooden spoon for about 4 minutes, until the semolina has absorbed all the liquid and the mixture pulls away from the sides.',
            'Când sfârâitul s-a potolit, pune tigaia înapoi la foc mic și amestecă cu lingura lungă de lemn aproximativ 4 minute, până când grișul a absorbit tot lichidul și compoziția se desprinde de pe margini.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'rest',
          text: t(
            'Take the pan off the heat, cover it with a lid and a clean tea towel and leave it for 10 minutes, so the semolina swells and steams through.',
            'Ia tigaia de pe foc, acoper-o cu un capac și un prosop curat și lasă-o 10 minute, ca grișul să se umfle și să se gătească în abur.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'serve',
          text: t(
            'Fluff the halva with a fork. Shape it with two spoons into quenelles, or press it into small bowls and turn them out, and dust with cinnamon. It is still very hot, so let it cool for a few minutes before it goes to children.',
            'Desfă halvaua cu o furculiță. Modelează-o cu două linguri în găluște ovale sau apasă-o în boluri mici și răstoarnă-le în farfurii, apoi presară scorțișoară deasupra. E încă foarte fierbinte, așa că lasă-o să se răcească câteva minute înainte să ajungă la copii.',
          ),
        },
      ],
      tips: [
        t(
          'Toasting is the whole dish: pale semolina tastes raw and floury, while too dark tastes bitter. Go by the smell of toasted nuts and the hazelnut colour.',
          'Prăjirea face tot preparatul: grișul palid are gust de făină crudă, iar cel prea închis e amar. Ghidează-te după mirosul de alune prăjite și culoarea de alună.',
        ),
        t(
          'This dish contains gluten (semolina), milk and pine nuts (tree nuts).',
          'Acest preparat conține gluten (griș), lapte și semințe de pin (fructe cu coajă lemnoasă).',
        ),
        t(
          'Leftovers: cool the halva and get it into the fridge within 2 hours. Eat within 3 days; USDA gives 3 to 4 days for cooked leftovers.',
          'Dacă rămâne: răcește halvaua și pune-o la frigider în cel mult 2 ore. Consum-o în 3 zile; USDA indică 3-4 zile pentru mâncarea gătită rămasă.',
        ),
      ],
      stepTips: [
        {
          step: 'pour',
          text: t(
            'Hot liquid on hot fat sprays, so use a deep pan with high sides and never lean over it.',
            'Lichidul fierbinte peste grăsime încinsă stropește, așa că folosește o tigaie adâncă, cu pereți înalți, și nu te apleca deasupra ei.',
          ),
        },
      ],
      nutritionNote: t(
        'Butter and a lot of sugar make it rich and sweet, and semolina is refined wheat with little fibre; the butter is mostly saturated fat. Milk adds some protein, and pine nuts add unsaturated fat. A small portion goes a long way.',
        'Untul și mult zahăr o fac bogată și dulce, iar grișul e grâu rafinat cu puține fibre; untul e în mare parte grăsime saturată. Laptele adaugă puține proteine, iar semințele de pin grăsimi nesaturate. O porție mică e de ajuns.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Black tea', 'Ceai negru'),
          reason: t(
            'Strong tea cuts through the butter and sugar.',
            'Un ceai tare taie bogăția untului și a zahărului.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'tea',
        },
        {
          kind: 'drink',
          label: t('Strong coffee', 'Cafea tare'),
          reason: t(
            'Its bitterness balances the sweet, buttery halva.',
            'Amăreala ei echilibrează halvaua dulce și untoasă.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'coffee',
        },
        {
          kind: 'food',
          label: t('Vanilla ice cream', 'Înghețată de vanilie'),
          reason: t(
            'Cold and creamy against the hot, crumbly halva.',
            'Rece și cremoasă lângă halvaua fierbinte și sfărâmicioasă.',
          ),
          principle: 'contrast_texture',
          ingredient: 'ice-cream',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Hot, buttery and filling when it is cold outside.',
            'Fierbinte, untoasă și săturătoare când afară e frig.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Very rich and sweet; it sits heavy before bed.',
            'Foarte bogată și dulce; cade greu înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'gris-cu-lapte-greek',
      cuisine: 'greek',
      title: t(
        'Galaktoboureko (Greek semolina custard pie in filo with syrup)',
        'Galaktoboureko (plăcintă grecească cu cremă de griș, în foi subțiri, cu sirop)',
      ),
      servings: 12,
      prepMinutes: 180,
      cookMinutes: 105,
      difficulty: 'medium',
      hideBaseTips: [0, 1, 2, 3],
      lines: [
        {
          ingredient: 'filo-pastry',
          quantity: 250,
          unit: 'g',
          note: t(
            'about 10 sheets, at least 45 x 35 cm (if they are smaller, overlap two per layer); thawed in the fridge overnight if frozen',
            'aproximativ 10 foi, de cel puțin 45 x 35 cm (dacă sunt mai mici, suprapune două pentru fiecare strat); decongelate la frigider peste noapte, dacă sunt congelate',
          ),
        },
        {
          ingredient: 'butter',
          key: 'butter-filo',
          quantity: 120,
          unit: 'g',
          note: t('melted, for the filo', 'topit, pentru foi'),
        },
        { ingredient: 'milk', quantity: 1, unit: 'l' },
        {
          ingredient: 'sugar',
          key: 'sugar-custard',
          quantity: 150,
          unit: 'g',
          note: t('for the custard', 'pentru cremă'),
        },
        { ingredient: 'semolina', quantity: 100, unit: 'g' },
        {
          ingredient: 'butter',
          key: 'butter-custard',
          quantity: 30,
          unit: 'g',
          note: t('for the custard', 'pentru cremă'),
        },
        { ingredient: 'eggs', quantity: 4, unit: 'pcs' },
        { ingredient: 'vanilla-extract', quantity: 10, unit: 'ml' },
        { ingredient: 'salt', quantity: 1, unit: 'g' },
        {
          ingredient: 'sugar',
          key: 'sugar-syrup',
          quantity: 350,
          unit: 'g',
          note: t('for the syrup', 'pentru sirop'),
        },
        { ingredient: 'still-water', quantity: 0.3, unit: 'l' },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'peel in wide strips, white pith left on the lemon',
            'coaja în fâșii late, fără partea albă',
          ),
        },
        { ingredient: 'cinnamon-sticks', quantity: 3, unit: 'g' },
      ],
      steps: [
        {
          key: 'syrup',
          text: t(
            'Put the syrup sugar, the water, the lemon peel strips and the cinnamon stick in a pot and bring to the boil, stirring until the sugar dissolves. Simmer for 10 minutes, then take it off the heat and remove the peel and the cinnamon. Pour the syrup into a jug and put it in the fridge to get cold while you make the custard. You can also make it the day before.',
            'Pune zahărul pentru sirop, apa, fâșiile de coajă de lămâie și batonul de scorțișoară într-o oală și adu la fierbere, amestecând până se dizolvă zahărul. Fierbe 10 minute, apoi ia oala de pe foc și scoate coaja și scorțișoara. Toarnă siropul într-un ulcior și pune-l la frigider să se răcească cât faci crema. Îl poți face și cu o zi înainte.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 180 °C (160 °C fan) with a rack in the middle. It will be hot by the time the pie is assembled.',
            'Încălzește cuptorul la 180 °C (160 °C cu ventilator), cu grătarul la mijloc. Va fi fierbinte până termini de asamblat plăcinta.',
          ),
        },
        {
          key: 'heat-milk',
          text: t(
            'Pour the milk into a 3 litre pot and add the custard sugar and the salt. Heat over medium heat for about 6 minutes until the milk steams and small bubbles appear at the edge. Stay at the stove: milk boils over in seconds.',
            'Toarnă laptele într-o oală de 3 litri și adaugă zahărul pentru cremă și sarea. Încălzește la foc mediu aproximativ 6 minute, până când laptele scoate aburi și apar bule mici pe margine. Rămâi lângă aragaz: laptele dă în foc în câteva secunde.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'semolina',
          text: t(
            'Turn the heat to low. Whisking all the time, rain the semolina into the milk in a thin stream.',
            'Dă focul la mic. Amestecând continuu cu telul, toarnă grișul în lapte într-un fir subțire.',
          ),
        },
        {
          key: 'thicken',
          text: t(
            'Switch to a wooden spoon and cook for 8 minutes, stirring and scraping the bottom and corners, until the custard is thick and bubbles slowly. It may spit, so keep your hand and face back.',
            'Treci la o lingură de lemn și fierbe 8 minute, amestecând și răzuind fundul și colțurile, până când crema e groasă și face bule rare. Poate stropi, așa că ține mâna și fața departe.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'cool-custard',
          text: t(
            'Take the pot off the heat, stir in the custard butter and the vanilla, and let it cool for 10 minutes, stirring now and then so no skin forms. Meanwhile, melt the filo butter.',
            'Ia oala de pe foc, amestecă untul pentru cremă și vanilia și lasă crema să se răcească 10 minute, amestecând din când în când ca să nu se formeze pieliță. Între timp, topește untul pentru foi.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'eggs',
          text: t(
            'Whisk the eggs in a large bowl. Whisk in a ladle of the warm custard, then pour in the rest in a thin stream, whisking all the time, until smooth. The custard should be warm, not hot, so the eggs do not scramble. Do not taste the raw custard: it is baked until it is cooked through.',
            'Bate ouăle într-un castron mare. Amestecă cu telul un polonic de cremă caldă, apoi toarnă restul într-un fir subțire, amestecând continuu, până se omogenizează. Crema trebuie să fie caldă, nu fierbinte, ca ouăle să nu se taie. Nu gusta crema crudă: se coace până se gătește complet.',
          ),
        },
        {
          key: 'bottom',
          text: t(
            'Brush a 22 x 32 cm tin, at least 4 cm deep, with butter. Lay in 5 layers of filo one at a time (two overlapping sheets per layer if yours are small), brushing each with melted butter and letting the edges hang over. Keep the remaining filo under a damp tea towel so it does not dry out and crack.',
            'Unge cu unt o tavă de 22 x 32 cm, adâncă de cel puțin 4 cm. Așază 5 straturi de foi, pe rând (două foi suprapuse pentru fiecare strat, dacă ale tale sunt mici), ungând fiecare cu unt topit și lăsând marginile să atârne peste tavă. Ține foile rămase sub un prosop umed, ca să nu se usuce și să nu crape.',
          ),
        },
        {
          key: 'fill',
          text: t(
            'Pour in the custard and level it. The layer of custard should be about 2 cm deep.',
            'Toarnă crema și nivelează-o. Stratul de cremă ar trebui să aibă cam 2 cm.',
          ),
        },
        {
          key: 'top',
          text: t(
            'Fold the overhanging filo over the custard. Lay the remaining 5 layers on top one at a time, brushing each with melted butter and tucking the edges down the sides. Brush the top with the rest of the butter and score the top sheets into squares or diamonds with a sharp knife, without cutting into the custard.',
            'Îndoaie peste cremă foile care atârnă. Așază deasupra cele 5 straturi rămase, pe rând, ungând fiecare cu unt topit și strecurând marginile pe lângă pereți. Unge fața cu untul rămas și taie foile de deasupra în pătrate sau romburi cu un cuțit ascuțit, fără să tai în cremă.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for about 45 minutes, until the top is deep golden and puffed and the custard is set with a slight wobble in the middle. A probe thermometer in the centre should read at least 71 °C. If you have no thermometer, a knife pushed into the middle should come out clean, not wet. If it is not ready, bake on and check every 5 minutes, covering the top with foil if it gets too dark.',
            'Coace aproximativ 45 de minute, până când plăcinta s-a rumenit bine și s-a umflat, iar crema s-a închegat, cu un mic tremur în mijloc. Un termometru-sondă în centru trebuie să arate cel puțin 71 °C. Dacă n-ai termometru, un cuțit băgat în mijloc trebuie să iasă curat, nu ud. Dacă nu e gata, mai coace și verifică din 5 în 5 minute, acoperind cu folie dacă se închide prea tare la culoare.',
          ),
          timerSeconds: 2700,
        },
        {
          key: 'syrup-pour',
          text: t(
            'Take the pie out and put it on a heatproof surface. Straight away, pour the cold syrup evenly over the hot pie, close to the surface and slowly: it sizzles and steam rises, so keep your face back and children away.',
            'Scoate plăcinta și pune-o pe o suprafață rezistentă la căldură. Imediat, toarnă siropul rece uniform peste plăcinta fierbinte, lent și aproape de suprafață: sfârâie și iese abur, așa că ține fața departe, iar copiii la distanță.',
          ),
        },
        {
          key: 'cool',
          text: t(
            'Leave the pie to cool at room temperature for 1 hour, then cover it and put it in the fridge for at least 2 hours. Serve in squares, cold or at room temperature.',
            'Lasă plăcinta să se răcească la temperatura camerei 1 oră, apoi acoper-o și pune-o la frigider cel puțin 2 ore. Servește în pătrate, rece sau la temperatura camerei.',
          ),
        },
      ],
      tips: [
        t(
          'Pour the cold syrup over the hot pie straight from the oven, as Greek recipes do; the pie soaks it up and the top stays crisp for the first hours.',
          'Toarnă siropul rece peste plăcinta fierbinte, direct din cuptor, cum se face în rețetele grecești; plăcinta îl absoarbe, iar fața rămâne crocantă în primele ore.',
        ),
        t(
          'Cooked custard is an egg dish: cool the pie, get it into the fridge within 2 hours, and eat it within 3 days. Custard pies keep 3 to 4 days in the fridge (USDA and extension guidance); filo goes soft after the first day or two.',
          'Crema coaptă e un preparat cu ou: răcește plăcinta, pune-o la frigider în cel mult 2 ore și consum-o în 3 zile. Plăcintele cu cremă se păstrează 3-4 zile la frigider (ghiduri USDA și universitare); foile se înmoaie după prima sau a doua zi.',
        ),
        t(
          'Filo dries in minutes: thaw it in the fridge, open the packet only when the custard is ready, and keep the sheets under a damp tea towel.',
          'Foile se usucă în câteva minute: decongelează-le la frigider, deschide pachetul doar când crema e gata și ține foile sub un prosop umed.',
        ),
        t(
          'This dish contains gluten (filo, semolina), milk and eggs.',
          'Acest preparat conține gluten (foi, griș), lapte și ouă.',
        ),
      ],
      stepTips: [
        {
          step: 'eggs',
          text: t(
            'If the custard turns grainy, it was too hot when the eggs went in. Cool it a few more minutes next time.',
            'Dacă crema iese granulată, era prea fierbinte când au intrat ouăle. Data viitoare lasă-o să se răcească câteva minute în plus.',
          ),
        },
        {
          step: 'top',
          text: t(
            'Score before baking: the baked top shatters if you cut it later.',
            'Taie înainte de coacere: fața coaptă se sfărâmă dacă o tai după.',
          ),
        },
      ],
      nutritionNote: t(
        'Milk and eggs add protein and calcium, but the butter in the filo and the sugar-heavy syrup make it high in sugar and saturated fat, and filo and semolina are refined wheat with little fibre. A treat for a crowd, in small squares.',
        'Laptele și ouăle aduc proteine și calciu, dar untul din foi și siropul bogat în zahăr o fac bogată în zahăr și grăsimi saturate, iar foile și grișul sunt grâu rafinat cu puține fibre. Un desert pentru o masă mare, în pătrate mici.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Strong coffee', 'Cafea tare'),
          reason: t(
            'Its bitterness cuts the syrup and the rich custard.',
            'Amăreala ei taie siropul și crema bogată.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'coffee',
        },
        {
          kind: 'food',
          label: t('Greek yogurt', 'Iaurt grecesc'),
          reason: t(
            'Its sourness cuts the sweet, buttery pie.',
            'Aciditatea lui taie dulceața plăcintei untoase.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'greek-yogurt',
        },
      ],
      eatingMoments: [
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Served cold, it is a cool dessert for a hot afternoon.',
            'Servită rece, e un desert răcoritor pentru o după-amiază caldă.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Very sweet and rich; it sits heavy before bed.',
            'Foarte dulce și bogată; cade greu înainte de culcare.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Butter and syrup sit heavy in the stomach during exercise.',
            'Untul și siropul cad greu la stomac în timpul efortului.',
          ),
        },
      ],
    },
  ],
};
