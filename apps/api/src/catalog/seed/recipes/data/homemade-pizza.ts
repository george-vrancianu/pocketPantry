import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Homemade pizza base is a tray pizza with ham and mushrooms on a yeast
// dough made at home. Each Variant is a full Recipe with its own dough, lines,
// steps and guidance. The dough rises are passive waits, so they sit in
// prepMinutes, each with a timer. The base's Recipe-level Tips 0 (bought dough)
// and 1 (ham and mushroom toppings) are about the base itself, so every Variant
// hides them and keeps tip 2 (leftovers).
export const homemadePizza: BaseRecipeSeed = {
  slug: 'homemade-pizza',
  title: t(
    'Homemade pizza with ham and mushrooms',
    'Pizza de casă cu șuncă și ciuperci',
  ),
  servings: 4,
  prepMinutes: 80,
  cookMinutes: 30,
  difficulty: 'medium',
  lines: [
    { ingredient: 'flour', quantity: 400, unit: 'g' },
    { ingredient: 'dry-yeast', quantity: 7, unit: 'g' },
    { ingredient: 'sugar', quantity: 5, unit: 'g' },
    { ingredient: 'salt', quantity: 8, unit: 'g' },
    {
      ingredient: 'still-water',
      quantity: 0.25,
      unit: 'l',
      note: t('warm, about 35 °C', 'caldă, la circa 35 °C'),
    },
    {
      ingredient: 'olive-oil',
      key: 'olive-oil-dough',
      quantity: 25,
      unit: 'ml',
      note: t('for the dough', 'pentru aluat'),
    },
    {
      ingredient: 'olive-oil',
      key: 'olive-oil-trays',
      quantity: 15,
      unit: 'ml',
      note: t('for the bowl and trays', 'pentru bol și tăvi'),
    },
    { ingredient: 'pizza-sauce', quantity: 200, unit: 'g' },
    { ingredient: 'grated-mozzarella', quantity: 250, unit: 'g' },
    {
      ingredient: 'ham',
      quantity: 150,
      unit: 'g',
      note: t('sliced, torn into pieces', 'felii, rupte în bucăți'),
    },
    {
      ingredient: 'button-mushrooms',
      quantity: 200,
      unit: 'g',
      note: t('sliced 5 mm thick', 'tăiate felii de 5 mm'),
    },
    { ingredient: 'oregano', quantity: 2, unit: 'g' },
    {
      ingredient: 'olives',
      quantity: 60,
      unit: 'g',
      optional: true,
      note: t('pitted, sliced', 'fără sâmburi, felii'),
    },
  ],
  steps: [
    {
      key: 'foam',
      text: t(
        'Pour the warm water (about 35 °C, pleasantly warm on the inside of your wrist) into a large bowl, stir in the yeast and the sugar, and leave for 5 minutes until a foam forms on top.',
        'Toarnă apa caldă (circa 35 °C, plăcut de caldă pe interiorul încheieturii) într-un bol mare, amestecă drojdia și zahărul și lasă 5 minute, până se formează spumă deasupra.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'mix',
      text: t(
        'Add the flour, salt and the olive oil for the dough, and stir with a wooden spoon until no dry flour is left and the dough comes together.',
        'Adaugă făina, sarea și uleiul de măsline pentru aluat și amestecă cu lingura de lemn până nu mai rămâne făină uscată și aluatul se leagă.',
      ),
    },
    {
      key: 'knead',
      text: t(
        'Knead on a lightly floured counter for 8 minutes, until the dough is smooth and springy and no longer sticks to your hands.',
        'Frământă aluatul pe blatul presărat ușor cu făină 8 minute, până devine neted și elastic și nu se mai lipește de mâini.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'rise',
      text: t(
        'Put the dough in a bowl greased with a little of the olive oil for the trays, cover with a clean towel and leave in a warm place for 1 hour, until doubled in size. When you press a finger in, the dent should spring back slowly.',
        'Pune aluatul într-un bol uns cu puțin din uleiul de măsline pentru tăvi, acoperă-l cu un prosop curat și lasă-l la loc călduț 1 oră, până își dublează volumul. Când apeși cu degetul, urma trebuie să revină încet.',
      ),
      timerSeconds: 3600,
    },
    {
      key: 'preheat',
      text: t(
        'About 30 minutes before the dough has finished rising, set the oven to 250 °C (230 °C fan) with a rack in the lower third and another one above it. It needs the full 30 minutes to be properly hot.',
        'Cu circa 30 de minute înainte ca aluatul să termine de crescut, setează cuptorul la 250 °C (230 °C cu ventilator), cu un grătar în treimea de jos și altul deasupra. Are nevoie de cele 30 de minute ca să fie bine încins.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'mushrooms',
      text: t(
        'While the oven heats, cook the mushrooms in a dry non-stick pan over medium-high heat for about 4 minutes, until they have given off their water, it has evaporated and the slices are lightly golden.',
        'Cât se încălzește cuptorul, rumenește ciupercile într-o tigaie antiaderentă, fără grăsime, la foc mediu spre mare, circa 4 minute, până își lasă apa, aceasta se evaporă și feliile se rumenesc ușor.',
      ),
      timerSeconds: 240,
    },
    {
      key: 'shape',
      text: t(
        'Punch the risen dough down, cut it in half and stretch or roll each half into a round of about 30 cm on two trays brushed with the remaining olive oil, leaving the edge slightly thicker. If the dough springs back, rest it for 5 minutes and try again.',
        'Dezumflă aluatul crescut, taie-l în două și întinde cu mâna sau cu sucitorul fiecare jumătate într-un cerc de circa 30 cm pe două tăvi unse cu uleiul de măsline rămas, lăsând marginea ceva mai groasă. Dacă aluatul se retrage, lasă-l 5 minute să se odihnească și încearcă din nou.',
      ),
    },
    {
      key: 'top',
      text: t(
        'Spread the pizza sauce over both rounds, leaving a rim of 1.5 cm. Scatter the mozzarella, then the ham, mushrooms and olives, and finish with the oregano.',
        'Întinde sosul de pizza peste ambele cercuri, lăsând o margine de 1,5 cm. Presară mozzarella, apoi șunca, ciupercile și măslinele și termină cu oregano.',
      ),
    },
    {
      key: 'bake',
      text: t(
        'Bake both trays, one on each rack, for 12 minutes, swapping their places halfway through. The pizzas are ready when the rim is golden, the cheese bubbles and browns in spots, and the base is firm when lifted with a spatula.',
        'Coace ambele tăvi, câte una pe fiecare grătar, 12 minute, schimbându-le locurile la jumătatea timpului. Pizza e gata când marginea e aurie, brânza face bule și se rumenește pe alocuri, iar baza e fermă când o ridici cu o spatulă.',
      ),
      timerSeconds: 720,
    },
    {
      key: 'rest',
      text: t(
        'Let the pizzas stand on the trays for 2 minutes so the cheese sets, then slice and serve.',
        'Lasă pizza 2 minute în tavă, ca brânza să se prindă, apoi taie-o felii și servește.',
      ),
      timerSeconds: 120,
    },
  ],
  tips: [
    t(
      'No time for dough? Use about 500 g of ready-made pizza dough from the shop: let it come to room temperature, then start at the shaping step.',
      'Nu ai timp de aluat? Folosește circa 500 g de aluat de pizza gata făcut din magazin: lasă-l să ajungă la temperatura camerei, apoi treci direct la întinderea lui.',
    ),
    t(
      'Mushrooms release a lot of water, so cook them first, and keep the sauce and toppings to the amounts given.',
      'Ciupercile lasă multă apă, așa că rumenește-le întâi în tigaia uscată și respectă cantitățile de sos și de ingrediente deasupra din rețetă.',
    ),
    t(
      'Cool leftover pizza within 2 hours and keep it in the fridge for up to 2 days. Reheat in a hot oven or a dry frying pan with a lid until piping hot; the microwave makes the base rubbery.',
      'Răcește pizza rămasă în maximum 2 ore și păstrează-o la frigider până la 2 zile. Încălzește-o în cuptor încins sau într-o tigaie uscată cu capac, până e fierbinte; la microunde baza devine cauciucată.',
    ),
  ],
  stepTips: [
    {
      step: 'knead',
      text: t(
        'The dough is 250 ml of water to 400 g of flour (about 62% hydration), which is soft but not sticky. If your flour is thirstier and the dough feels stiff, add a tablespoon of water at a time rather than flouring the counter heavily.',
        'Aluatul are 250 ml de apă la 400 g de făină (hidratare de circa 62%), deci e moale, dar nu lipicios. Dacă făina ta absoarbe mai multă apă și aluatul e tare, adaugă apă câte o lingură, în loc să tot presari făină pe blat.',
      ),
    },
    {
      step: 'bake',
      text: t(
        'If the top browns faster than the base, move that tray down a rack for the last 2 minutes.',
        'Dacă partea de sus se rumenește mai repede decât baza, mută tava respectivă pe grătarul de jos pentru ultimele 2 minute.',
      ),
    },
  ],
  nutritionNote: t(
    'The dough gives carbohydrate for energy, and the mozzarella and ham add protein, but the ham, cheese and sauce are all salty and the cheese brings saturated fat. Mushrooms add a little fibre. Half a pizza with a green salad balances better than a whole one.',
    'Aluatul dă carbohidrați pentru energie, iar mozzarella și șunca aduc proteine, dar șunca, brânza și sosul sunt sărate, iar brânza aduce grăsimi saturate. Ciupercile adaugă puține fibre. O jumătate de pizza cu o salată verde e mai echilibrată decât una întreagă.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Rocket salad', 'Salată de rucola'),
      reason: t(
        'Peppery, lightly dressed leaves refresh the mouth between rich, cheesy bites.',
        'Frunzele piperate, asezonate ușor, împrospătează gura între îmbucăturile bogate, cu brânză.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'rocket',
    },
    {
      kind: 'food',
      label: t('Chilli flakes', 'Fulgi de chili'),
      reason: t(
        'A pinch of heat sharpens the tomato sauce and cuts through the melted cheese.',
        'Un praf de iuțeală pune în valoare sosul de roșii și taie din bogăția brânzei topite.',
      ),
      principle: 'complement_flavour',
      ingredient: 'chilli-flakes',
    },
    {
      kind: 'drink',
      label: t('Cold beer', 'Bere rece'),
      reason: t(
        'Carbonation and a little bitterness clear the cheese and oil from the palate.',
        'Bulele și puțina amăreală curăță gura de brânză și de ulei.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'beer',
    },
    {
      kind: 'drink',
      label: t('Light red wine', 'Vin roșu ușor'),
      reason: t(
        'Its acidity matches the tomato sauce and cuts the fat of the cheese and ham.',
        'Aciditatea lui se potrivește cu sosul de roșii și taie din grăsimea brânzei și a șuncii.',
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
        'A hot, filling meal, and the oven warms the kitchen.',
        'O masă caldă și săturătoare, iar cuptorul încălzește bucătăria.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Carbohydrates from the dough and protein from the cheese and ham help you refuel.',
        'Carbohidrații din aluat și proteinele din brânză și din șuncă te ajută să te refaci.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Cheese and oil make it sit heavy in the stomach during exercise.',
        'Brânza și uleiul o fac grea la stomac în timpul efortului.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A big, salty, fatty meal close to bedtime can disturb sleep.',
        'O masă mare, sărată și grasă aproape de culcare poate strica somnul.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'An oven at 250 °C heats the whole home for half an hour.',
        'Un cuptor la 250 °C încălzește toată casa o jumătate de oră.',
      ),
    },
  ],
  variants: [
    // ---------------------------------------------------------------- Italian
    {
      slug: 'homemade-pizza-italian',
      cuisine: 'italian',
      hideBaseTips: [0, 1],
      title: t(
        'Pizza Margherita, Neapolitan style in a home oven',
        'Pizza Margherita în stil napolitan, la cuptorul de acasă',
      ),
      servings: 2,
      prepMinutes: 1640,
      cookMinutes: 30,
      difficulty: 'hard',
      lines: [
        { ingredient: 'tipo-00-flour', quantity: 300, unit: 'g' },
        {
          ingredient: 'tipo-00-flour',
          key: 'flour-dusting',
          quantity: 20,
          unit: 'g',
          note: t('for dusting', 'pentru presărat'),
        },
        { ingredient: 'dry-yeast', quantity: 1, unit: 'g' },
        {
          ingredient: 'salt',
          quantity: 8,
          unit: 'g',
          note: t('for the dough', 'pentru aluat'),
        },
        {
          ingredient: 'salt',
          key: 'salt-sauce',
          quantity: 2,
          unit: 'g',
          note: t('for the tomatoes', 'pentru roșii'),
        },
        {
          ingredient: 'still-water',
          quantity: 0.19,
          unit: 'l',
          note: t('cool, about 20 °C', 'răcoroasă, la circa 20 °C'),
        },
        {
          ingredient: 'canned-tomatoes',
          quantity: 200,
          unit: 'g',
          note: t('whole peeled, drained', 'întregi, decojite, scurse'),
        },
        {
          ingredient: 'mozzarella',
          quantity: 200,
          unit: 'g',
          note: t(
            'fior di latte ball, drained and patted dry',
            'bilă fior di latte, scursă și tamponată',
          ),
        },
        {
          ingredient: 'basil',
          quantity: 8,
          unit: 'g',
          note: t('fresh leaves', 'frunze proaspete'),
        },
        { ingredient: 'olive-oil', quantity: 30, unit: 'ml' },
        {
          ingredient: 'parmesan',
          quantity: 20,
          unit: 'g',
          optional: true,
          note: t('finely grated', 'ras fin'),
        },
      ],
      steps: [
        {
          key: 'mix',
          text: t(
            'In a large bowl, stir the yeast into the cool water until it dissolves. Add the 300 g of flour and the 8 g of salt for the dough and mix until no dry flour is left.',
            'Într-un bol mare, amestecă drojdia în apa răcoroasă până se dizolvă. Adaugă cele 300 g de făină și cele 8 g de sare pentru aluat și amestecă până nu mai rămâne făină uscată.',
          ),
        },
        {
          key: 'knead',
          text: t(
            'Knead on the counter for 10 minutes, until the dough is smooth, elastic and only slightly tacky.',
            'Frământă aluatul pe blat 10 minute, până devine neted, elastic și doar ușor lipicios.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'bulk',
          text: t(
            'Return the dough to the bowl, cover it and leave it at room temperature for 1 hour, until it has puffed up a little.',
            'Pune aluatul înapoi în bol, acoperă-l și lasă-l la temperatura camerei 1 oră, până se umflă puțin.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'ball',
          text: t(
            'Cut the dough in two and shape each piece into a tight ball by tucking the edges underneath. Put the balls in separate lidded, floured containers.',
            'Taie aluatul în două și modelează fiecare bucată într-o bilă strânsă, strângând marginile pe dedesubt. Pune bilele în recipiente separate cu capac, presărate cu făină.',
          ),
        },
        {
          key: 'cold',
          text: t(
            'Refrigerate the balls for 24 hours. The long, cold rest gives the crust its flavour and blistered rim with very little yeast. By then they should have grown by about half.',
            'Ține bilele la frigider 24 de ore. Odihna lungă, la rece, dă crustei aroma și marginea cu bășici, cu foarte puțină drojdie. Până atunci trebuie să crească cu aproximativ jumătate.',
          ),
          timerSeconds: 86400,
        },
        {
          key: 'temper',
          text: t(
            'Take the balls out of the fridge 2 hours before baking and leave them covered at room temperature. Cold dough tears when stretched.',
            'Scoate bilele din frigider cu 2 ore înainte de coacere și lasă-le acoperite la temperatura camerei. Aluatul rece se rupe când e întins.',
          ),
          timerSeconds: 7200,
        },
        {
          key: 'sauce',
          text: t(
            'Crush the drained tomatoes with your hands in a bowl, leaving some small pieces, and stir in the 2 g of salt for the tomatoes. Do not cook the sauce.',
            'Strivește roșiile scurse cu mâinile într-un bol, lăsând niște bucățele mici, și amestecă cu cele 2 g de sare pentru roșii. Nu găti sosul.',
          ),
        },
        {
          key: 'heat',
          text: t(
            'Set a dry 28 cm cast-iron pan (flat base about 24 cm) on the hob over high heat for 10 minutes. At the same time heat the grill to maximum with the rack about 15 cm from the element. The pan should be smoking hot; open a window.',
            'Pune o tigaie uscată din fontă de 28 cm (fund plat de circa 24 cm) pe aragaz, la foc mare, 10 minute. În același timp încinge grillul la maximum, cu grătarul la circa 15 cm de rezistență. Tigaia trebuie să fie încinsă până scoate fum; deschide o fereastră.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'stretch',
          text: t(
            'Dust the counter with the dusting flour and press the first ball out from the centre with your fingertips, leaving the rim untouched, then stretch it over the backs of your hands to about 25 cm, to fit the flat base of the pan. Do not use a rolling pin: it knocks out the air.',
            'Presară blatul cu făina pentru presărat și apasă prima bilă dinspre centru cu vârfurile degetelor, lăsând marginea neatinsă, apoi întinde-o peste dosul mâinilor până la circa 25 cm, ca să încapă pe fundul plat al tigaii. Nu folosi sucitorul: scoate aerul din aluat.',
          ),
        },
        {
          key: 'top',
          text: t(
            'Lay the dough in the hot pan, quickly spoon over half of the tomatoes, scatter half of the mozzarella torn into pieces, and add a few basil leaves.',
            'Așază aluatul în tigaia încinsă, pune repede jumătate din roșii, presară jumătate din mozzarella ruptă în bucăți și adaugă câteva frunze de busuioc.',
          ),
        },
        {
          key: 'hob',
          text: t(
            'Cook on the hob for 2 minutes, until the underside is set and has dark spots when you lift an edge with a spatula.',
            'Gătește pe aragaz 2 minute, până când partea de jos se prinde și are pete închise la culoare când ridici marginea cu o spatulă.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'grill',
          text: t(
            'Using an oven glove, move the pan under the grill for 2 to 3 minutes, until the rim puffs up and blisters and the cheese bubbles. Slide the pizza onto a board, drizzle with half of the olive oil, add fresh basil and the Parmesan if using. Repeat with the second ball.',
            'Cu o mănușă de bucătărie, mută tigaia sub grill 2-3 minute, până când marginea se umflă și face bășici, iar brânza face bule. Glisează pizza pe un tocător, stropește cu jumătate din uleiul de măsline, adaugă busuioc proaspăt și parmezanul, dacă îl folosești. Repetă cu a doua bilă.',
          ),
          timerSeconds: 150,
        },
      ],
      tips: [
        t(
          'Fridge dough ferments slowly, so the clock matters less than the temperature: balls that are still cold in the middle will not stretch, so give them the full 2 hours.',
          'Aluatul din frigider fermentează încet, deci contează mai puțin ceasul și mai mult temperatura: bilele reci în mijloc nu se întind, așa că dă-le cele 2 ore întregi.',
        ),
        t(
          'A home oven tops out far below a wood-fired one, so this is Neapolitan in style, not in heat; the screaming-hot pan and the grill make up for it.',
          'Cuptorul de acasă nu ajunge nici pe departe la căldura unuia pe lemne, deci pizza e napolitană ca stil, nu ca temperatură; tigaia foarte încinsă și grillul compensează.',
        ),
      ],
      stepTips: [
        {
          step: 'top',
          text: t(
            'Pat the mozzarella dry with a paper towel first: wet cheese makes a soupy middle.',
            'Tamponează mozzarella cu un prosop de hârtie înainte: brânza udă face centrul apos.',
          ),
        },
        {
          step: 'grill',
          text: t(
            'The pan handle will be extremely hot. Leave an oven glove over it and warn everyone in the kitchen.',
            'Mânerul tigaii va fi extrem de fierbinte. Lasă o mănușă de bucătărie peste el și avertizează pe toți cei din bucătărie.',
          ),
        },
      ],
      nutritionNote: t(
        'A thin pizza with little topping is lighter than the loaded kind, and the mozzarella gives protein. It is still mostly refined white flour with little fibre, and the cheese adds saturated fat and salt, so a rocket or tomato salad on the side helps.',
        'O pizza subțire, cu puține ingrediente deasupra, e mai ușoară decât cea încărcată, iar mozzarella dă proteine. Rămâne totuși în mare parte făină albă rafinată, cu puține fibre, iar brânza aduce grăsimi saturate și sare, deci o salată de rucola sau de roșii alături ajută.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Italian antipasto platter', 'Platou italian antipasto'),
          reason: t(
            'A few cured and pickled bites to start while the pizzas are baked one at a time.',
            'Câteva mezeluri maturate și legume marinate cu care începi masa, cât pizzele se coc pe rând.',
          ),
          principle: 'regional_tradition',
          recipe: 'appetizer-platter-italian',
        },
        {
          kind: 'food',
          label: t('Rocket salad', 'Salată de rucola'),
          reason: t(
            'Peppery leaves with a squeeze of lemon cleanse the palate after the melted cheese.',
            'Frunzele piperate, cu puțină lămâie, curăță gura după brânza topită.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'rocket',
        },
        {
          kind: 'drink',
          label: t('Cold beer', 'Bere rece'),
          reason: t(
            'Light bubbles and bitterness refresh the mouth between slices.',
            'Bulele ușoare și amăreala împrospătează gura între felii.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
        {
          kind: 'drink',
          label: t('Light red wine', 'Vin roșu ușor'),
          reason: t(
            'Its acidity matches the fresh tomato and lifts the mozzarella.',
            'Aciditatea lui se potrivește cu roșiile proaspete și scoate în evidență mozzarella.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'red-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Carbohydrates from the crust and protein from the cheese help you refuel.',
            'Carbohidrații din crustă și proteinele din brânză te ajută să te refaci.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Cheese and oil sit heavy in the stomach during exercise.',
            'Brânza și uleiul cad greu la stomac în timpul efortului.',
          ),
        },
      ],
    },
    // --------------------------------------------------------------- American
    {
      slug: 'homemade-pizza-american',
      cuisine: 'american',
      hideBaseTips: [0, 1],
      title: t(
        'Chicago deep-dish pizza',
        'Pizza Chicago deep-dish (pizza înaltă în tavă)',
      ),
      servings: 6,
      prepMinutes: 85,
      cookMinutes: 57,
      difficulty: 'hard',
      lines: [
        { ingredient: 'flour', quantity: 300, unit: 'g' },
        { ingredient: 'cornmeal', quantity: 40, unit: 'g' },
        { ingredient: 'dry-yeast', quantity: 4, unit: 'g' },
        { ingredient: 'sugar', quantity: 5, unit: 'g' },
        {
          ingredient: 'salt',
          quantity: 6,
          unit: 'g',
          note: t('for the dough', 'pentru aluat'),
        },
        {
          ingredient: 'salt',
          key: 'salt-sauce',
          quantity: 3,
          unit: 'g',
          note: t('for the sauce', 'pentru sos'),
        },
        {
          ingredient: 'still-water',
          quantity: 0.19,
          unit: 'l',
          note: t('warm, about 35 °C', 'caldă, la circa 35 °C'),
        },
        {
          ingredient: 'butter',
          quantity: 60,
          unit: 'g',
          note: t('soft, for the dough', 'moale, pentru aluat'),
        },
        {
          ingredient: 'olive-oil',
          key: 'olive-oil-pan',
          quantity: 25,
          unit: 'ml',
          note: t('for the bowl and pan', 'pentru bol și tavă'),
        },
        {
          ingredient: 'grated-mozzarella',
          quantity: 450,
          unit: 'g',
          note: t('low-moisture', 'cu umiditate redusă'),
        },
        {
          ingredient: 'italian-sausage',
          quantity: 400,
          unit: 'g',
          note: t('raw, casings removed', 'cruzi, fără membrană'),
        },
        {
          ingredient: 'canned-tomatoes',
          quantity: 800,
          unit: 'g',
          note: t(
            'one large can, crushed and drained',
            'o conservă mare, zdrobite și scurse',
          ),
        },
        {
          ingredient: 'garlic',
          quantity: 8,
          unit: 'g',
          note: t('2 cloves, grated', '2 căței, dați pe răzătoare'),
        },
        { ingredient: 'oregano', quantity: 2, unit: 'g' },
        {
          ingredient: 'basil',
          quantity: 5,
          unit: 'g',
          optional: true,
          note: t('torn', 'rupt'),
        },
        {
          ingredient: 'olive-oil',
          key: 'olive-oil-sauce',
          quantity: 15,
          unit: 'ml',
          note: t('for the sauce', 'pentru sos'),
        },
        {
          ingredient: 'parmesan',
          quantity: 40,
          unit: 'g',
          note: t('finely grated', 'ras fin'),
        },
      ],
      steps: [
        {
          key: 'foam',
          text: t(
            'Stir the yeast and the sugar into the warm water and leave for 5 minutes, until foamy.',
            'Amestecă drojdia și zahărul în apa caldă și lasă 5 minute, până face spumă.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'dough',
          text: t(
            'In a large bowl mix the flour, cornmeal and the salt for the dough. Add the foamy yeast water and the soft butter, and knead for 8 minutes, until the dough is smooth, soft and only slightly tacky.',
            'Într-un bol mare amestecă făina, mălaiul și sarea pentru aluat. Adaugă apa cu drojdie spumoasă și untul moale și frământă 8 minute, până când aluatul e neted, moale și doar ușor lipicios.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'rise',
          text: t(
            'Shape the dough into a ball, put it in a lightly oiled bowl, cover and leave in a warm place for 1 hour, until doubled in size.',
            'Modelează aluatul într-o bilă, pune-l într-un bol uns ușor cu ulei, acoperă-l și lasă-l la loc călduț 1 oră, până își dublează volumul.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'preheat',
          text: t(
            'About 20 minutes before the dough finishes rising, heat the oven to 220 °C (200 °C fan) with a rack in the lower middle. It needs the full 20 minutes to be properly hot.',
            'Cu circa 20 de minute înainte ca aluatul să termine de crescut, încinge cuptorul la 220 °C (200 °C cu ventilator), cu grătarul puțin sub mijlocul cuptorului. Are nevoie de cele 20 de minute ca să fie bine încins.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'sauce',
          text: t(
            'Stir the drained tomatoes with the garlic, oregano, basil, the 3 g of salt for the sauce and the olive oil for the sauce. Keep it raw and chunky; it cooks in the oven.',
            'Amestecă roșiile scurse cu usturoiul, oregano, busuiocul, cele 3 g de sare pentru sos și uleiul de măsline pentru sos. Păstrează sosul crud și cu bucățele; se gătește în cuptor.',
          ),
        },
        {
          key: 'press',
          text: t(
            'Grease a 30 cm round pan, at least 5 cm deep, with the olive oil for the bowl and pan. Punch the dough down, roll it to about 38 cm, lay it in the pan and press it 4 cm up the sides, with no thin spots or holes.',
            'Unge cu uleiul de măsline pentru bol și tavă o tavă rotundă de 30 cm, adâncă de cel puțin 5 cm. Dezumflă aluatul, întinde-l la circa 38 cm, așază-l în tavă și apasă-l 4 cm pe pereți, fără locuri subțiri sau găuri.',
          ),
        },
        {
          key: 'cheese',
          text: t(
            'Cover the base with the mozzarella in an even layer that reaches the edge of the crust.',
            'Acoperă baza cu mozzarella într-un strat uniform, care ajunge până la marginea crustei.',
          ),
        },
        {
          key: 'sausage',
          text: t(
            'Squeeze the sausage out of its casings and press it into one flat layer about 1 cm thick over the cheese, right up to the edge with no gaps. Wash your hands, board and knife with hot soapy water after touching the raw meat.',
            'Scoate cârnații din membrană și apasă carnea într-un singur strat plat, gros de circa 1 cm, peste brânză, până la margine, fără goluri. Spală-ți mâinile, tocătorul și cuțitul cu apă fierbinte și detergent după ce ai atins carnea crudă.',
          ),
        },
        {
          key: 'tomato',
          text: t(
            'Spoon the tomato mixture thickly over the sausage and sprinkle with the Parmesan.',
            'Pune sosul de roșii gros peste cârnați și presară parmezanul.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 35 minutes, until the crust is deep golden and the tomatoes bubble at the edges. If the top darkens before 25 minutes, cover it loosely with foil.',
            'Coace 35 de minute, până când crusta e de un auriu închis, iar roșiile fac bule pe margini. Dacă partea de sus se întunecă înainte de 25 de minute, acoper-o lejer cu folie de aluminiu.',
          ),
          timerSeconds: 2100,
        },
        {
          key: 'check',
          text: t(
            'Push a probe thermometer through the topping into the middle of the sausage layer: it must read at least 71 °C, and the meat must look no longer pink. If not, bake on and check again in the next step.',
            'Înfige un termometru cu sondă prin umplutură, în mijlocul stratului de cârnați: trebuie să arate cel puțin 71 °C, iar carnea să nu mai fie roz. Dacă nu, mai coace și verifică din nou la pasul următor.',
          ),
        },
        {
          key: 'recheck',
          text: t(
            'Only if the sausage was not yet at 71 °C: bake 5 minutes more and probe again. Repeat until it reads at least 71 °C and shows no pink.',
            'Doar dacă cârnații nu aveau încă 71 °C: mai coace 5 minute și verifică din nou. Repetă până arată cel puțin 71 °C și nu mai e roz.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'rest',
          text: t(
            'Rest the pizza in the pan for 10 minutes so the filling sets, run a knife around the edge, lift it out and cut into 8 slices.',
            'Lasă pizza 10 minute în tavă, ca umplutura să se prindă, trece un cuțit pe margine, scoate-o din tavă și taie-o în 8 felii.',
          ),
          timerSeconds: 600,
        },
      ],
      tips: [
        t(
          'The dough is firmer than the base dough on purpose, at 190 ml of water to 340 g of flour and cornmeal (about 56%), so it holds a tall wall under a heavy filling. Do not add extra water.',
          'Aluatul e intenționat mai ferm decât cel de bază, la 190 ml de apă pentru 340 g de făină și mălai (circa 56%), ca să țină un perete înalt sub o umplutură grea. Nu adăuga apă în plus.',
        ),
      ],
      stepTips: [
        {
          step: 'cheese',
          text: t(
            'The cheese goes first, under the sausage and sauce, so it protects the crust from the wet tomatoes. Fresh mozzarella would flood the pan, so keep to the low-moisture kind.',
            'Brânza se pune prima, sub cârnați și sos, ca să apere crusta de roșiile umede. Mozzarella proaspătă ar inunda tava, deci rămâi la cea cu umiditate redusă.',
          ),
        },
      ],
      nutritionNote: t(
        'A slice is a very filling meal: the sausage and cheese give plenty of protein, and the tomatoes add some vegetable. It is also high in saturated fat, salt and refined flour, with little fibre, so one serving (a slice or so) with a big salad is a sensible portion.',
        'O felie e o masă foarte săturătoare: cârnații și brânza dau multe proteine, iar roșiile adaugă ceva legume. E însă bogată în grăsimi saturate, sare și făină rafinată, cu puține fibre, așa că o porție (o felie sau cam atât) cu o salată mare e rezonabilă.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Mixed leaf salad', 'Salată de frunze mixte'),
          reason: t(
            'Sharply dressed leaves cut the fat of the sausage and cheese.',
            'Frunzele asezonate acrișor taie din grăsimea cârnaților și a brânzei.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'mixed-salad',
        },
        {
          kind: 'food',
          label: t('Chilli flakes', 'Fulgi de chili'),
          reason: t(
            'Heat lifts the fennel in the sausage and the sweetness of the tomato.',
            'Iuțeala scoate în față feniculul din cârnați și dulceața roșiilor.',
          ),
          principle: 'complement_flavour',
          ingredient: 'chilli-flakes',
        },
        {
          kind: 'drink',
          label: t('Cold beer', 'Bere rece'),
          reason: t(
            'Bubbles and bitterness cleanse the palate after a rich slice.',
            'Bulele și amăreala curăță gura după o felie bogată.',
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
            'A heavy, hot meal that suits a cold evening.',
            'O masă grea și caldă, potrivită pentru o seară rece.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from the sausage and cheese and carbohydrate from the crust help you recover.',
            'Proteinele din cârnați și brânză și carbohidrații din crustă te ajută să te refaci.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Very heavy and fatty, which can disturb sleep.',
            'Foarte grea și grasă, ceea ce poate strica somnul.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Fat and cheese sit heavy in the stomach during exercise.',
            'Grăsimea și brânza cad greu la stomac în timpul efortului.',
          ),
        },
      ],
    },
    // ---------------------------------------------------------- Middle Eastern
    {
      slug: 'homemade-pizza-middle-eastern',
      cuisine: 'middle-eastern',
      hideBaseTips: [0, 1],
      title: t(
        "Manakish za'atar (Levantine za'atar flatbread)",
        "Manakish cu za'atar (lipie levantină cu za'atar)",
      ),
      servings: 4,
      prepMinutes: 100,
      cookMinutes: 25,
      difficulty: 'easy',
      lines: [
        { ingredient: 'flour', quantity: 400, unit: 'g' },
        { ingredient: 'dry-yeast', quantity: 5, unit: 'g' },
        { ingredient: 'sugar', quantity: 5, unit: 'g' },
        { ingredient: 'salt', quantity: 8, unit: 'g' },
        {
          ingredient: 'still-water',
          quantity: 0.25,
          unit: 'l',
          note: t('warm, about 35 °C', 'caldă, la circa 35 °C'),
        },
        {
          ingredient: 'olive-oil',
          key: 'olive-oil-dough',
          quantity: 30,
          unit: 'ml',
          note: t('for the dough', 'pentru aluat'),
        },
        {
          ingredient: 'olive-oil',
          key: 'olive-oil-bowl',
          quantity: 10,
          unit: 'ml',
          note: t('for the bowl', 'pentru bol'),
        },
        {
          ingredient: 'za-atar',
          quantity: 40,
          unit: 'g',
        },
        {
          ingredient: 'olive-oil',
          key: 'olive-oil-topping',
          quantity: 60,
          unit: 'ml',
          note: t('for the topping', 'pentru deasupra'),
        },
        {
          ingredient: 'tomato',
          quantity: 200,
          unit: 'g',
          optional: true,
          note: t('sliced, to serve', 'felii, pentru servit'),
        },
        {
          ingredient: 'cucumber',
          quantity: 1,
          unit: 'pcs',
          optional: true,
          note: t('sliced, to serve', 'felii, pentru servit'),
        },
        {
          ingredient: 'mint',
          quantity: 10,
          unit: 'g',
          optional: true,
          note: t('fresh leaves, to serve', 'frunze proaspete, pentru servit'),
        },
        {
          ingredient: 'labneh',
          quantity: 150,
          unit: 'g',
          optional: true,
          note: t('to serve', 'pentru servit'),
        },
      ],
      steps: [
        {
          key: 'foam',
          text: t(
            'Stir the yeast and the sugar into the warm water and leave for 5 minutes, until foamy.',
            'Amestecă drojdia și zahărul în apa caldă și lasă 5 minute, până face spumă.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'knead',
          text: t(
            'Add the flour, salt and the olive oil for the dough and mix. Knead on the counter for 8 minutes, until the dough is smooth and soft.',
            'Adaugă făina, sarea și uleiul de măsline pentru aluat și amestecă. Frământă pe blat 8 minute, până când aluatul e neted și moale.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'rise',
          text: t(
            'Put the dough in an oiled bowl, cover and leave in a warm place for 1 hour, until doubled in size.',
            'Pune aluatul într-un bol uns cu ulei, acoperă-l și lasă-l la loc călduț 1 oră, până își dublează volumul.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'preheat',
          text: t(
            'About 20 minutes before the dough finishes rising, heat the oven to 240 °C (220 °C fan) with a rack in the lower third and another one above it, and line two trays with baking paper.',
            'Cu circa 20 de minute înainte ca aluatul să termine de crescut, încinge cuptorul la 240 °C (220 °C cu ventilator), cu un grătar în treimea de jos și altul deasupra, și tapetează două tăvi cu hârtie de copt.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'divide',
          text: t(
            'Divide the dough into 6 pieces of about 115 g, roll each into a smooth ball, cover with a towel and rest for 15 minutes so they relax and are easier to press out.',
            'Împarte aluatul în 6 bucăți de circa 115 g, rotunjește fiecare bucată într-o bilă netedă, acoperă-le cu un prosop și lasă-le 15 minute să se relaxeze, ca să se întindă mai ușor.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'paste',
          text: t(
            "Stir the za'atar into the olive oil for the topping until it makes a loose paste.",
            "Amestecă za'atarul cu uleiul de măsline pentru acoperit până obții o pastă fluidă.",
          ),
        },
        {
          key: 'shape',
          text: t(
            'Press each ball with your fingers into a round of about 15 cm, a little thicker at the rim, then dimple the whole surface with your fingertips, so the paste stays in the hollows.',
            'Apasă fiecare bilă cu degetele într-un cerc de circa 15 cm, puțin mai gros la margine, apoi apasă toată suprafața cu vârfurile degetelor, ca pasta să rămână în adânciturile făcute.',
          ),
        },
        {
          key: 'top',
          text: t(
            'Spread a sixth of the paste over each round, leaving a rim of 1 cm. Put 3 rounds on each tray.',
            'Întinde o șesime din pastă pe fiecare cerc, lăsând o margine de 1 cm. Pune câte 3 cercuri pe fiecare tavă.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for about 9 minutes, swapping the trays after 5, until the edges are just golden and the base is pale gold. The flatbreads should still be soft and bend without cracking.',
            'Coace circa 9 minute, schimbând tăvile între ele după 5, până când marginile sunt abia aurii, iar baza e galben-pai. Lipiile trebuie să fie încă moi și să se îndoaie fără să crape.',
          ),
          timerSeconds: 540,
        },
        {
          key: 'serve',
          text: t(
            'Serve warm, folded around slices of tomato and cucumber, mint leaves and a spoon of labneh.',
            'Servește-le calde, îndoite în jurul feliilor de roșie și de castravete, cu frunze de mentă și o lingură de labneh.',
          ),
        },
      ],
      tips: [
        t(
          'The paste should be loose enough to spread but not swimming in oil, which would run off in the oven and leave the dough soggy at the rim.',
          'Pasta trebuie să fie destul de fluidă ca să se întindă, dar fără exces de ulei, care s-ar scurge în cuptor și ar înmuia marginea.',
        ),
        t(
          'Take them out when they are just coloured. Over-baked manakish turn into crackers; the point is that they stay soft enough to fold.',
          'Scoate-le când abia s-au colorat. Manakish prea coapte devin crocante ca biscuiții; ideea e să rămână destul de moi cât să poată fi îndoite.',
        ),
      ],
      stepTips: [
        {
          step: 'shape',
          text: t(
            "Za'atar blends differ in how salty they are. Taste a pinch, and if yours is mild, stir a pinch of salt into the oil paste.",
            "Amestecurile de za'atar diferă ca sărătură. Gustă un praf și, dacă al tău e fad, amestecă un praf de sare în pasta cu ulei.",
          ),
        },
      ],
      nutritionNote: t(
        "Za'atar is herbs and sesame, which add a lot of flavour, and olive oil brings mostly unsaturated fat, but the dough is refined white flour with little fibre. The optional tomato, cucumber and labneh add freshness and protein; the oil still adds calories.",
        "Za'atar are ierburi și susan, care dau multă aromă, iar uleiul de măsline aduce în special grăsimi nesaturate, dar aluatul e din făină albă rafinată, cu puține fibre. Roșiile, castraveții și labneh, dacă le pui, adaugă prospețime și proteine; uleiul tot aduce calorii.",
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Levantine mezze platter', 'Platou levantin de mezze'),
          reason: t(
            'Manakish also sit well alongside a mezze spread of dips, olives and pickles.',
            'Manakish merg bine și alături de mezze: sosuri, măsline și murături.',
          ),
          principle: 'regional_tradition',
          recipe: 'appetizer-platter-levantine',
        },
        {
          kind: 'food',
          label: t('Olives', 'Măsline'),
          reason: t(
            'Salty, briny bites contrast with the soft, herby bread.',
            'Îmbucăturile sărate, murate, fac contrast cu pâinea moale, cu ierburi.',
          ),
          principle: 'contrast_texture',
          ingredient: 'olives',
        },
        {
          kind: 'drink',
          label: t('Mint tea', 'Ceai de mentă'),
          reason: t(
            'Fresh mint clears the oil and the herbs from the mouth between bites.',
            'Menta proaspătă curăță gura de ulei și de ierburi între îmbucături.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'mint-tea',
        },
        {
          kind: 'drink',
          label: t('Drinking yogurt', 'Iaurt de băut'),
          reason: t(
            'Cool, tangy yogurt balances the oil and the herbs.',
            'Iaurtul rece și acrișor echilibrează uleiul și ierburile.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'drinking-yogurt',
        },
      ],
      eatingMoments: [
        {
          moment: 'morning',
          polarity: 'good_for',
          reason: t(
            'A light, savoury breakfast without cheese or meat.',
            'Un mic dejun ușor, sărat, fără brânză sau carne.',
          ),
        },
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'Easy to share, with plenty of fresh sides.',
            'Se împarte ușor și se servește cu multe garnituri proaspete.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Two with salad and labneh make a light lunch.',
            'Două bucăți cu salată și labneh fac un prânz ușor.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'The olive oil makes it sit heavier than its size suggests during exercise.',
            'Uleiul de măsline o face mai grea la stomac decât pare în timpul efortului.',
          ),
        },
      ],
    },
  ],
};
