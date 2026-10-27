import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Brunede kartofler base is the Danish side dish: small boiled potatoes,
// peeled and chilled, rolled in a butter caramel until glazed. The Variants are
// the Korean soy-braised gamja jorim and the Chinese pulled-sugar ba si tudou.
// Each Variant is a full Recipe with its own lines, steps and guidance; the
// base's Recipe-level Tips are inherited unless hidden.
export const brunedeKartofler: BaseRecipeSeed = {
  slug: 'brunede-kartofler',
  title: t(
    'Danish caramelised potatoes (brunede kartofler)',
    'Cartofi caramelizați, ca în Danemarca (brunede kartofler)',
  ),
  servings: 4,
  prepMinutes: 165,
  cookMinutes: 46,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'potato',
      quantity: 0.8,
      unit: 'kg',
      note: t(
        'small and waxy, about 3 to 4 cm, all the same size',
        'mici și cu pulpă fermă, de 3-4 cm, toți de aceeași mărime',
      ),
    },
    {
      ingredient: 'salt',
      quantity: 8,
      unit: 'g',
      note: t('for the boiling water', 'pentru apa de fiert'),
    },
    { ingredient: 'sugar', quantity: 100, unit: 'g' },
    { ingredient: 'butter', quantity: 40, unit: 'g' },
  ],
  steps: [
    {
      key: 'boil',
      text: t(
        'Scrub the potatoes and put them in a pot. Cover with cold water by about 3 cm, add the salt and bring to the boil. Turn the heat down and simmer for about 18 minutes, until a knife slides into the largest potato with no resistance.',
        'Spală cartofii cu peria și pune-i într-o oală. Acoperă-i cu apă rece, cu aproximativ 3 cm deasupra, adaugă sarea și adu la fierbere. Redu focul și fierbe mocnit cam 18 minute, până când un cuțit intră fără rezistență în cel mai mare cartof.',
      ),
      timerSeconds: 1080,
    },
    {
      key: 'peel',
      text: t(
        'Drain the potatoes. As soon as you can hold them, peel them: the skins slip off easily while they are still warm. Use a fork or a tea towel to hold them if they are too hot.',
        'Scurge cartofii. Imediat ce poți să-i ții în mână, curăță-i de coajă: coaja se desprinde ușor cât sunt încă calzi. Dacă ard, ține-i cu o furculiță sau cu un prosop de bucătărie.',
      ),
    },
    {
      key: 'cool',
      text: t(
        'Spread the peeled potatoes in a single layer on a tray and let them cool uncovered for 30 minutes.',
        'Întinde cartofii curățați într-un singur strat pe o tavă și lasă-i să se răcească 30 de minute, neacoperiți.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'chill',
      text: t(
        'Put the tray in the fridge for at least 2 hours, or overnight. The potatoes must be completely cold and firm before they go into the caramel.',
        'Pune tava la frigider pentru cel puțin 2 ore sau peste noapte. Cartofii trebuie să fie complet reci și fermi înainte să intre în caramel.',
      ),
      timerSeconds: 7200,
    },
    {
      key: 'dry',
      text: t(
        'Take the potatoes out and pat them very dry with kitchen paper. Any surface moisture will make the caramel spit and turn the glaze wet.',
        'Scoate cartofii și tamponează-i bine cu șervețele de bucătărie. Orice urmă de umezeală face caramelul să sară și glazura să iasă apoasă.',
      ),
    },
    {
      key: 'melt',
      text: t(
        'Spread the sugar in an even layer in a wide, heavy pan over medium heat. Do not stir. As it melts at the edges, swirl the pan gently. After 5 to 7 minutes it should be a clear, light golden amber. Caramel is far hotter than boiling water and sticks to skin, so keep children away from the stove and take care.',
        'Presară zahărul într-un strat uniform într-o tigaie lată și groasă, la foc mediu. Nu amesteca. Pe măsură ce se topește la margini, învârte ușor tigaia. După 5-7 minute trebuie să fie un caramel limpede, auriu deschis. Caramelul e mult mai fierbinte decât apa clocotită și se lipește de piele, așa că ține copiii departe de aragaz și fii atent.',
      ),
      timerSeconds: 360,
    },
    {
      key: 'butter',
      text: t(
        'Add the butter and stir with a wooden spoon. It will foam and may spit, so stand back. Keep stirring over the heat for about 30 seconds, until the butter is blended in and the caramel is smooth.',
        'Adaugă untul și amestecă cu o lingură de lemn. Va face spumă și poate să sară, așa că ține-te la distanță. Continuă să amesteci pe foc cam 30 de secunde, până când untul se omogenizează cu caramelul și acesta devine neted.',
      ),
      timerSeconds: 30,
    },
    {
      key: 'coat',
      text: t(
        'Add the cold, dry potatoes. The caramel may stiffen around them at first; keep shaking the pan over medium heat and it melts again. Roll the potatoes gently in the caramel with the spoon, or shake the pan, for 10 to 12 minutes, until they are glossy and golden brown and hot all the way through. If the caramel darkens too fast, turn the heat down.',
        'Adaugă cartofii reci și uscați. La început caramelul se poate întări în jurul lor; continuă să scuturi tigaia la foc mediu și se topește la loc. Rostogolește ușor cartofii în caramel cu lingura sau scutură tigaia 10-12 minute, până când sunt lucioși, bruni-aurii și fierbinți și la mijloc. Dacă caramelul se închide prea repede la culoare, dă focul mai mic.',
      ),
      timerSeconds: 660,
    },
    {
      key: 'serve',
      text: t(
        'Tip them into a warm dish and serve straight away, while the glaze is still soft and shiny.',
        'Pune-i într-un vas cald și servește imediat, cât glazura e încă moale și lucioasă.',
      ),
    },
  ],
  tips: [
    t(
      'Boil the potatoes the day before and leave them uncovered in the fridge: the surface dries out, and cold, firm potatoes take the glaze without breaking up.',
      'Fierbe cartofii cu o zi înainte și lasă-i neacoperiți la frigider: suprafața se usucă, iar cartofii reci și fermi preiau glazura fără să se desfacă.',
    ),
    t(
      'If the caramel turns dark brown or smells bitter, throw it away and start again; it will not recover. If it clumps or goes grainy, keep it on low heat and it will melt smooth.',
      'Dacă caramelul devine maro închis sau miroase amărui, aruncă-l și începe din nou; nu mai poate fi salvat. Dacă face cocoloașe sau devine granulat, ține-l pe foc mic și se topește la loc.',
    ),
    t(
      'Jarred or tinned small peeled potatoes also work: drain them and dry them well, and skip the boiling and chilling.',
      'Merg și cartofii mici, curățați, din borcan sau din conservă: scurge-i și usucă-i bine, iar fierberea și răcirea le sari.',
    ),
  ],
  stepTips: [
    {
      step: 'melt',
      text: t(
        'Use a light-coloured pan so you can see the colour change, and take it off the heat a shade before it looks right: it keeps darkening for a few seconds.',
        'Folosește o tigaie de culoare deschisă ca să vezi cum se schimbă culoarea și ia-o de pe foc puțin înainte să pară gata: mai închide la culoare câteva secunde.',
      ),
    },
    {
      step: 'coat',
      text: t(
        'Roll rather than stir hard: constant gentle turning gives an even glaze, and rough stirring breaks the potatoes.',
        'Rostogolește cartofii, nu-i amesteca energic: întoarcerea blândă și continuă dă o glazură uniformă, iar amestecatul brusc îi sfărâmă.',
      ),
    },
  ],
  nutritionNote: t(
    'Potatoes make it a filling side, but the caramel adds sugar (about two tablespoons per serving) and the butter adds saturated fat, so treat it as a rich accompaniment rather than an everyday side. Serve it with a tart vegetable such as red cabbage to balance the sweetness.',
    'Cartofii o fac o garnitură săturătoare, dar caramelul aduce zahăr (cam două linguri pe porție), iar untul grăsimi saturate, așa că ia-o ca pe o garnitură bogată, nu ca pe una de fiecare zi. Servește-o cu o legumă acrișoară, cum e varza roșie, ca să echilibrezi dulceața.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t(
        'Danish roast pork with crackling (flæskesteg)',
        'Friptură daneză de porc cu șorici crocant (flæskesteg)',
      ),
      reason: t(
        'Sweet glazed potatoes next to salty crackling and rich pork is a common plate in Denmark, especially at Christmas.',
        'Cartofii dulci, glazurați, lângă șoricul sărat și carnea suculentă de porc sunt o farfurie des întâlnită în Danemarca, mai ales de Crăciun.',
      ),
      principle: 'regional_tradition',
      recipe: 'flaeskesteg',
    },
    {
      kind: 'food',
      label: t(
        'Danish braised red cabbage (rødkål)',
        'Varză roșie înăbușită, ca în Danemarca (rødkål)',
      ),
      reason: t(
        'The sweet-sour cabbage cuts through the butter and pork fat on the plate and keeps it from feeling heavy.',
        'Varza dulce-acrișoară taie din untul și grăsimea de porc din farfurie și o împiedică să pară grea.',
      ),
      principle: 'acid_cuts_fat',
      recipe: 'braised-red-cabbage',
    },
    {
      kind: 'food',
      label: t('Roast duck', 'Rață la cuptor'),
      reason: t(
        'The sweet glaze balances the salty, fatty duck skin and meat.',
        'Glazura dulce echilibrează pielea și carnea de rață, sărate și grase.',
      ),
      principle: 'salt_balances_sweet',
      ingredient: 'duck',
    },
    {
      kind: 'drink',
      label: t('Cold beer', 'Bere rece'),
      reason: t(
        'The bitterness and fizz of a cold beer balance the sweet glaze and the fat of a roast.',
        'Amăreala și bulele unei beri reci echilibrează glazura dulce și grăsimea fripturii.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'beer',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A warm, sweet, filling side that suits a heavy winter meal.',
        'O garnitură caldă, dulce și săturătoare, potrivită pentru o masă consistentă de iarnă.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'The potato carbohydrate helps refuel after exercise; pair it with a protein.',
        'Carbohidrații din cartofi ajută la refacerea energiei după efort; combină-i cu o sursă de proteine.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'A hot, sweet, buttery side feels heavy in warm weather.',
        'O garnitură fierbinte, dulce și cu unt cade greu pe vreme caldă.',
      ),
    },
  ],
  variants: [
    {
      slug: 'brunede-kartofler-korean',
      cuisine: 'korean',
      title: t(
        'Korean soy-glazed baby potatoes (gamja jorim)',
        'Cartofi mici glasați cu sos de soia, ca în Coreea (gamja jorim)',
      ),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 27,
      difficulty: 'easy',
      hideBaseTips: [0, 1, 2],
      lines: [
        {
          ingredient: 'potato',
          quantity: 0.5,
          unit: 'kg',
          note: t(
            'baby potatoes, about 3 cm; halve any that are larger',
            'cartofi mici, de circa 3 cm; taie în jumătate pe cei mai mari',
          ),
        },
        { ingredient: 'sunflower-oil', quantity: 30, unit: 'ml' },
        { ingredient: 'soy-sauce', quantity: 45, unit: 'ml' },
        { ingredient: 'sugar', quantity: 20, unit: 'g' },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t('about 3 cloves, minced', 'cam 3 căței, tocați mărunt'),
        },
        { ingredient: 'still-water', quantity: 0.2, unit: 'l' },
        { ingredient: 'glucose-syrup', quantity: 30, unit: 'g' },
        { ingredient: 'sesame-oil', quantity: 5, unit: 'ml' },
        { ingredient: 'sesame-seeds', quantity: 5, unit: 'g' },
      ],
      steps: [
        {
          key: 'peel',
          text: t(
            'Peel the potatoes and halve any that are bigger than about 3 cm so they cook at the same speed.',
            'Curăță cartofii de coajă și taie în jumătate pe cei mai mari de aproximativ 3 cm, ca să se gătească în același timp.',
          ),
        },
        {
          key: 'soak',
          text: t(
            'Cover the potatoes with cold water and leave them for 10 minutes to rinse off surface starch. Drain and pat them dry.',
            'Acoperă cartofii cu apă rece și lasă-i 10 minute, ca să se spele amidonul de la suprafață. Scurge-i și tamponează-i bine.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'fry',
          text: t(
            'Heat the oil in a wide, heavy pan over medium-high heat. Add the potatoes in one layer and fry for about 7 minutes, turning now and then, until golden in patches.',
            'Încinge uleiul într-o tigaie lată și groasă, la foc mediu-mare. Adaugă cartofii într-un singur strat și prăjește-i cam 7 minute, întorcându-i din când în când, până se rumenesc pe alocuri.',
          ),
          timerSeconds: 420,
        },
        {
          key: 'braise',
          text: t(
            'Add the soy sauce, water, sugar and garlic. Bring to the boil, then turn the heat to medium and simmer uncovered for about 14 minutes, stirring every few minutes, until a knife slides into a potato and most of the liquid has gone, leaving just a few spoonfuls.',
            'Adaugă sosul de soia, apa, zahărul și usturoiul. Adu la fierbere, apoi redu focul la mediu și lasă să fiarbă, fără capac, cam 14 minute, amestecând din câteva în câteva minute, până când un cuțit intră ușor într-un cartof și aproape tot lichidul s-a evaporat, rămânând doar câteva linguri.',
          ),
          timerSeconds: 840,
        },
        {
          key: 'glaze',
          text: t(
            'Stir in the glucose syrup and cook for 1 to 2 minutes, turning the potatoes constantly, until the sauce is sticky and coats them in a shiny glaze. The glaze is very hot and sticks to skin, so do not taste it straight from the pan.',
            'Amestecă siropul de glucoză și gătește 1-2 minute, întorcând cartofii mereu, până când sosul devine lipicios și îi acoperă cu o glazură lucioasă. Glazura e foarte fierbinte și se lipește de piele, așa că nu o gusta direct din tigaie.',
          ),
          timerSeconds: 90,
        },
        {
          key: 'finish',
          text: t(
            'Take the pan off the heat, stir in the sesame oil, then sprinkle with the sesame seeds. Serve warm or at room temperature.',
            'Ia tigaia de pe foc, amestecă uleiul de susan, apoi presară semințele de susan. Servește cald sau la temperatura camerei.',
          ),
        },
      ],
      tips: [
        t(
          'Cool leftovers within 2 hours and keep them in a covered box in the fridge for up to 3 days; they are good cold, straight from the box.',
          'Răcește rămășițele în maximum 2 ore și ține-le într-o cutie acoperită la frigider până la 3 zile; sunt bune și reci, direct din cutie.',
        ),
      ],
      stepTips: [
        {
          step: 'braise',
          text: t(
            'Keep the simmer lively but not fierce, and stir more often in the last few minutes: as the liquid thins out the sugar can catch on the pan.',
            'Ține fierberea vioaie, dar nu puternică, și amestecă mai des în ultimele minute: pe măsură ce lichidul scade, zahărul se poate lipi de tigaie.',
          ),
        },
      ],
      nutritionNote: t(
        'Potatoes make a filling side, but the soy sauce is salty and the sugar and syrup add sweetness, so keep portions small, as with a side dish eaten alongside rice, vegetables and a protein. The frying oil adds fat.',
        'Cartofii fac o garnitură săturătoare, dar sosul de soia e sărat, iar zahărul și siropul adaugă dulce, așa că ține porțiile mici, ca la o garnitură mâncată alături de orez, legume și o sursă de proteine. Uleiul de prăjit adaugă grăsime.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Steamed rice', 'Orez fiert'),
          reason: t(
            'Plain rice soaks up the salty-sweet glaze and makes the potatoes part of a full meal.',
            'Orezul simplu absoarbe glazura dulce-sărată și transformă cartofii într-o masă completă.',
          ),
          principle: 'complement_flavour',
          ingredient: 'rice',
        },
        {
          kind: 'food',
          label: t('Kimchi', 'Kimchi'),
          reason: t(
            'Its sour, spicy crunch refreshes the palate after the sticky, sweet potatoes.',
            'Crocanțeala lui acră și picantă împrospătează gustul după cartofii dulci și lipicioși.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'kimchi',
        },
        {
          kind: 'drink',
          label: t('Green tea', 'Ceai verde'),
          reason: t(
            'Its light bitterness resets the palate between sweet, salty bites.',
            'Amăreala lui ușoară resetează gustul între îmbucăturile dulci și sărate.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'green-tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Good cold or at room temperature, so it packs well in a lunch box.',
            'Este bun rece sau la temperatura camerei, deci se ia ușor la pachet.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Served cold, it is a light side that needs no reheating.',
            'Servit rece, e o garnitură ușoară care nu trebuie reîncălzită.',
          ),
        },
      ],
    },
    {
      slug: 'brunede-kartofler-chinese',
      cuisine: 'chinese',
      title: t(
        'Candied potatoes with pulled sugar threads (ba si tudou)',
        'Cartofi în caramel tras în fire, ca în China (ba si tudou)',
      ),
      servings: 4,
      prepMinutes: 30,
      cookMinutes: 27,
      difficulty: 'hard',
      hideBaseTips: [0, 1, 2],
      lines: [
        {
          ingredient: 'potato',
          quantity: 0.6,
          unit: 'kg',
          note: t(
            'peeled and cut into 3 cm chunks',
            'curățați de coajă și tăiați în bucăți de 3 cm',
          ),
        },
        { ingredient: 'corn-starch', quantity: 40, unit: 'g' },
        {
          ingredient: 'sunflower-oil',
          key: 'frying-oil',
          quantity: 700,
          unit: 'ml',
          note: t(
            'for deep-frying, in a wide, deep pan or wok',
            'pentru prăjit în ulei încins, într-o tigaie lată și adâncă sau un wok',
          ),
        },
        {
          ingredient: 'sunflower-oil',
          key: 'caramel-oil',
          quantity: 15,
          unit: 'ml',
          note: t('for the caramel', 'pentru caramel'),
        },
        { ingredient: 'sugar', quantity: 100, unit: 'g' },
        {
          ingredient: 'still-water',
          key: 'caramel-water',
          quantity: 0.03,
          unit: 'l',
          note: t('for the caramel', 'pentru caramel'),
        },
        {
          ingredient: 'still-water',
          key: 'dip-water',
          quantity: 0.5,
          unit: 'l',
          note: t(
            'cold, in a bowl for dipping at the table',
            'rece, într-un bol, pentru înmuiat la masă',
          ),
        },
        {
          ingredient: 'sesame-seeds',
          quantity: 5,
          unit: 'g',
          optional: true,
        },
      ],
      steps: [
        {
          key: 'cut',
          text: t(
            'Peel the potatoes and cut them into chunks of about 3 cm, so they fry evenly.',
            'Curăță cartofii de coajă și taie-i în bucăți de aproximativ 3 cm, ca să se prăjească uniform.',
          ),
        },
        {
          key: 'soak',
          text: t(
            'Rinse the chunks in cold water, then leave them in a bowl of cold water for 10 minutes to wash off surface starch.',
            'Clătește bucățile în apă rece, apoi lasă-le 10 minute într-un bol cu apă rece, ca să se spele amidonul de la suprafață.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'dry',
          text: t(
            'Drain the potatoes and dry them thoroughly with a clean tea towel. Wet potatoes make hot oil spit violently.',
            'Scurge cartofii și usucă-i bine cu un prosop curat de bucătărie. Cartofii umezi fac uleiul fierbinte să sară violent.',
          ),
        },
        {
          key: 'heat-oil',
          text: t(
            'Pour the frying oil into a wide, deep pan or wok. It must be no more than a third full. Heat it over medium-high heat for about 8 minutes, until a cube of potato sizzles steadily or a thermometer shows 175 °C. Hot oil can cause serious burns: keep children away, never leave the pan, keep a lid close by to smother a flare-up, and never pour water into hot oil.',
            'Toarnă uleiul de prăjit într-o tigaie lată și adâncă sau într-un wok. Trebuie să fie umplut cel mult o treime. Încălzește-l la foc mediu-mare cam 8 minute, până când un cub de cartof sfârâie constant sau un termometru arată 175 °C. Uleiul fierbinte poate provoca arsuri grave: ține copiii departe, nu lăsa tigaia nesupravegheată, ține un capac la îndemână ca să sufoci o flacără și nu turna niciodată apă în ulei încins.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'starch',
          text: t(
            'Just before frying, toss the dry potatoes with the corn starch until each piece is lightly and evenly coated. Shake off the excess.',
            'Chiar înainte de prăjit, amestecă cartofii uscați cu amidonul de porumb, până când fiecare bucată e acoperită ușor și uniform. Scutură excesul.',
          ),
        },
        {
          key: 'fry-1',
          text: t(
            'Lower half the potatoes into the oil with a slotted spoon, away from you. Fry for about 5 minutes, until pale gold and crisp, and a skewer slides easily into the centre of a chunk. Lift out onto a rack or a tray lined with kitchen paper.',
            'Coboară jumătate din cartofi în ulei cu o lingură cu orificii, departe de tine. Prăjește-i cam 5 minute, până sunt galbeni deschis și crocanți, iar o scobitoare intră ușor până la mijlocul unei bucăți. Scoate-i pe un grătar sau pe o tavă tapetată cu șervețele de bucătărie.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'fry-2',
          text: t(
            'Let the oil come back to temperature, then fry the second half the same way for about 5 minutes.',
            'Lasă uleiul să revină la temperatură, apoi prăjește a doua jumătate la fel, cam 5 minute.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'fry-again',
          text: t(
            'Put all the potatoes back in the oil for 1 minute to make them extra crisp. Lift out and drain well. Then switch off the heat and leave the pan of oil where it is, on a back burner if you can, to cool completely; do not carry it while it is hot.',
            'Pune toți cartofii înapoi în ulei pentru 1 minut, ca să iasă și mai crocanți. Scoate-i și lasă-i să se scurgă bine. Apoi oprește focul și lasă tigaia cu ulei pe loc, pe un ochi din spate dacă poți, să se răcească complet; nu o căra cât e fierbinte.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'caramel',
          text: t(
            'Prepare an oiled plate for the finished potatoes and set the bowl of cold water on the table. Heat the caramel oil, sugar and 30 ml water in a clean, wide pan over medium-low heat, stirring until the sugar dissolves. Then cook for 5 to 7 minutes, stirring occasionally, until the bubbles turn small and thick and the syrup is light amber. Test: lift a spoonful and let it drip, and it should pull into fine threads. Hot sugar sticks to skin and burns far worse than boiling water: keep children away, and do not touch or taste it.',
            'Pregătește o farfurie unsă cu ulei pentru cartofii gata și pune pe masă bolul cu apă rece. Încălzește uleiul pentru caramel, zahărul și 30 ml de apă într-o tigaie curată și lată, la foc mic-mediu, amestecând până se dizolvă zahărul. Apoi gătește 5-7 minute, amestecând din când în când, până când bulele devin mici și dese, iar siropul e ambrat deschis. Test: ridică o lingură de sirop și lasă-l să picure; trebuie să se întindă în fire fine. Zahărul fierbinte se lipește de piele și arde mult mai rău decât apa clocotită: ține copiii departe și nu-l atinge, nici nu-l gusta.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'toss',
          text: t(
            'Take the pan off the heat, add the fried potatoes and toss quickly with a spatula for about 20 seconds, until every piece is coated in the syrup. Tip them onto the oiled plate and sprinkle with the sesame seeds, if using.',
            'Ia tigaia de pe foc, adaugă cartofii prăjiți și amestecă repede cu o spatulă cam 20 de secunde, până când fiecare bucată e acoperită cu sirop. Răstoarnă-i pe farfuria unsă cu ulei și presară semințele de susan, dacă le folosești.',
          ),
          timerSeconds: 20,
        },
        {
          key: 'serve',
          text: t(
            'Wait 15 seconds, as the potato inside is very hot. Then, with chopsticks, lift a piece, pulling out the sugar threads, and dip it in the cold water for 2 to 3 seconds until the shell sets glass-hard and the threads stop sticking. The water will hiss, so keep your hands back. Eat right away.',
            'Așteaptă 15 secunde, fiindcă cartoful dinăuntru e foarte fierbinte. Apoi, cu bețișoare, ridică o bucată, trăgând firele de zahăr, și scufund-o 2-3 secunde în apa rece, până când învelișul se întărește ca sticla și firele nu se mai lipesc. Apa va sâsâi, așa că ține mâinile departe. Mănâncă imediat.',
          ),
          timerSeconds: 15,
        },
      ],
      tips: [
        t(
          'Cook it just before you serve it: left standing, the shell goes soft and sticky within minutes, so leftovers are not worth keeping.',
          'Gătește-l chiar înainte de servire: dacă stă, învelișul devine moale și lipicios în câteva minute, deci rămășițele nu merită păstrate.',
        ),
        t(
          'Strain the cooled oil and keep it for frying only; or throw it away in a sealed container, never down the sink.',
          'Strecoară uleiul răcit și păstrează-l doar pentru prăjit; altfel aruncă-l într-un recipient închis, niciodată în chiuvetă.',
        ),
      ],
      stepTips: [
        {
          step: 'caramel',
          text: t(
            'Work fast once the syrup is ready: it keeps darkening and sets quickly. Have the potatoes, the oiled plate and the cold water in place before the sugar starts to colour.',
            'Lucrează repede când siropul e gata: continuă să se închidă la culoare și se întărește repede. Pregătește cartofii, farfuria unsă și apa rece înainte ca zahărul să înceapă să se coloreze.',
          ),
        },
        {
          step: 'fry-again',
          text: t(
            'Start the caramel as soon as the last batch comes out, so the potatoes are still hot when they meet the syrup.',
            'Începe caramelul imediat ce scoți ultima tranșă, ca să fie cartofii încă fierbinți când ajung în sirop.',
          ),
        },
        {
          step: 'dry',
          text: t(
            'The drier the potatoes, the crisper the shell: damp pieces steam in the oil and go leathery.',
            'Cu cât cartofii sunt mai uscați, cu atât învelișul e mai crocant: bucățile umede se aburesc în ulei și devin cauciucate.',
          ),
        },
      ],
      nutritionNote: t(
        'A sweet, deep-fried treat: the potato is filling, but the frying oil and the large amount of sugar make it very energy-dense and high in sugar. Share it in small portions as an occasional dish rather than a side for every day.',
        'O bunătate dulce, prăjită în ulei încins: cartoful e săturător, dar uleiul de prăjit și cantitatea mare de zahăr îl fac foarte bogat în energie și în zahăr. Împarte-l în porții mici, ca preparat ocazional, nu ca garnitură de fiecare zi.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Green tea', 'Ceai verde'),
          reason: t(
            'Its bitterness balances the sweet shell and cleans the palate between pieces.',
            'Amăreala lui echilibrează învelișul dulce și curăță gustul între bucăți.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'green-tea',
        },
        {
          kind: 'drink',
          label: t('Sparkling water', 'Apă minerală'),
          reason: t(
            'The bubbles refresh the mouth after the sticky sugar and the oil.',
            'Bulele împrospătează gura după zahărul lipicios și ulei.',
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
            'Hot, sweet and crisp, it is a warming treat when it is cold outside.',
            'Fierbinte, dulce și crocant, e o bunătate care încălzește când afară e frig.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Fried and very sugary, it is a lot to digest late at night.',
            'Prăjit și foarte dulce, e greu de digerat seara târziu.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Deep-fried food sits heavy in the stomach during exercise.',
            'Mâncarea prăjită în ulei încins cade greu la stomac în timpul efortului.',
          ),
        },
      ],
    },
  ],
};
