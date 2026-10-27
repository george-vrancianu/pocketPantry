import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Gogoși base is the Romanian yeast doughnut: a soft enriched dough, risen
// twice, fried in sunflower oil and dusted with icing sugar. Each Variant is a
// full Recipe with its own lines, steps and guidance. All of them are deep-fried,
// so the base's two oil Tips are inherited; the yeast, rising and storage Tips
// are hidden where they do not apply.
export const gogosi: BaseRecipeSeed = {
  slug: 'gogosi',
  title: t(
    'Romanian yeast doughnuts (gogoși)',
    'Gogoși pufoase cu zahăr pudră',
  ),
  servings: 8,
  prepMinutes: 95,
  cookMinutes: 85,
  difficulty: 'medium',
  lines: [
    { ingredient: 'fresh-yeast', quantity: 25, unit: 'g' },
    {
      ingredient: 'milk',
      quantity: 0.2,
      unit: 'l',
      note: t('lukewarm', 'căldicel'),
    },
    {
      ingredient: 'sugar',
      quantity: 60,
      unit: 'g',
      note: t(
        '10 g for the yeast, 50 g for the dough',
        '10 g pentru drojdie, 50 g pentru aluat',
      ),
    },
    {
      ingredient: 'flour',
      quantity: 500,
      unit: 'g',
      note: t(
        '10 g for the yeast, 490 g for the dough',
        '10 g pentru drojdie, 490 g pentru aluat',
      ),
    },
    { ingredient: 'salt', quantity: 5, unit: 'g' },
    { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
    {
      ingredient: 'lemon',
      quantity: 1,
      unit: 'pcs',
      note: t('zest only', 'doar coaja rasă'),
    },
    { ingredient: 'vanilla-sugar', quantity: 8, unit: 'g' },
    {
      ingredient: 'rum-essence',
      quantity: 5,
      unit: 'ml',
      optional: true,
    },
    {
      ingredient: 'butter',
      quantity: 50,
      unit: 'g',
      note: t('melted and cooled', 'topit și răcit'),
    },
    {
      ingredient: 'sunflower-oil',
      quantity: 1000,
      unit: 'ml',
      note: t(
        'for frying, in a heavy pot of at least 3 litres and 22 cm wide',
        'pentru prăjit, într-o oală grea de cel puțin 3 litri și 22 cm lățime',
      ),
    },
    { ingredient: 'icing-sugar', quantity: 60, unit: 'g' },
    {
      ingredient: 'jam',
      quantity: 200,
      unit: 'g',
      optional: true,
      note: t('for filling', 'pentru umplut'),
    },
  ],
  steps: [
    {
      key: 'starter',
      text: t(
        'Warm the milk until it is only lukewarm: a drop on your wrist should not feel hot. Crumble in the yeast, add 10 g of the sugar and 10 g of the flour, stir, and leave for 10 minutes until the top is foamy.',
        'Încălzește laptele până e doar căldicel: o picătură pe încheietura mâinii nu trebuie să se simtă fierbinte. Mărunțește drojdia în lapte, adaugă 10 g din zahăr și 10 g din făină, amestecă și lasă 10 minute, până se face spumă deasupra.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'mix',
      text: t(
        'In a large bowl mix the remaining 490 g of flour, the remaining 50 g of sugar, the salt, the vanilla sugar and the lemon zest. Beat the eggs lightly, then add them with the foamy yeast and the rum essence, if using, and stir to a rough, grainy dough.',
        'Într-un castron mare amestecă cele 490 g de făină rămase, cele 50 g de zahăr rămase, sarea, zahărul vanilat și coaja de lămâie. Bate ouăle ușor, apoi adaugă-le împreună cu drojdia spumată și cu esența de rom, dacă o folosești, și amestecă până ingredientele se leagă într-un aluat grunjos.',
      ),
    },
    {
      key: 'knead',
      text: t(
        'Pour in the melted butter and knead for 10 minutes, on the table or in a mixer with a dough hook, until the dough is soft, smooth, slightly sticky and comes away from the bowl.',
        'Toarnă untul topit și frământă 10 minute, pe masă sau cu mixerul cu cârlige de aluat, până când aluatul e moale, neted, ușor lipicios și se desprinde de pe pereții castronului.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'rise-1',
      text: t(
        'Cover the bowl and leave it in a warm place for about 1 hour, until the dough has doubled in size and is full of bubbles.',
        'Acoperă castronul și lasă-l la loc călduț cam 1 oră, până când aluatul și-a dublat volumul și e plin de bule.',
      ),
      timerSeconds: 3600,
    },
    {
      key: 'shape',
      text: t(
        'Tip the dough onto a floured table and roll it out 1.5 cm thick. Cut rounds of about 7 cm with a floured glass, pressing straight down. Make a small hole in the middle of each, if you like. Gather the scraps, knead them once and cut again. You should get about 16 rounds. Set them well apart on floured baking paper.',
        'Răstoarnă aluatul pe masa înfăinată și întinde-l într-o foaie groasă de 1,5 cm. Taie rondele de cam 7 cm cu un pahar înfăinat, apăsând drept în jos. Fă o gaură mică în mijlocul fiecăreia, dacă vrei. Strânge resturile, frământă-le o dată și taie din nou. Ar trebui să iasă cam 16 rondele. Pune-le la distanță pe hârtie de copt presărată cu făină.',
      ),
    },
    {
      key: 'rise-2',
      text: t(
        'Cover the rounds and leave them for about 25 minutes, until puffy. A floured fingertip pressed gently into one should leave a dent that fills back slowly.',
        'Acoperă rondelele și lasă-le cam 25 de minute, până se umflă. Dacă apeși ușor cu degetul înfăinat, urma trebuie să se umple înapoi încet.',
      ),
      timerSeconds: 1500,
    },
    {
      key: 'heat-oil',
      text: t(
        'Pour the oil into a heavy pot of at least 3 litres and 22 cm wide, so it is no more than a third full. Clip a thermometer to the side and heat over medium heat to 170 °C. Do not leave the pot, keep a lid within reach and keep water well away from it. If the oil starts to smoke, turn the heat off.',
        'Toarnă uleiul într-o oală grea de cel puțin 3 litri și 22 cm lățime, astfel încât să fie umplută cel mult o treime. Prinde un termometru de margine și încălzește la foc mediu până la 170 °C. Nu pleca de lângă oală, ține un capac la îndemână și ține apa departe de ea. Dacă uleiul începe să fumege, stinge focul.',
      ),
    },
    {
      key: 'fry',
      text: t(
        'Lower 3 rounds into the oil one at a time, close to the surface and away from you. Fry for about 5 minutes in total, turning once after about 2½ minutes with a slotted spoon, until deep golden on both sides.',
        'Coboară în ulei 3 rondele, pe rând, aproape de suprafață și în direcția opusă ție. Prăjește-le cam 5 minute în total, întorcându-le o dată după aproximativ 2 minute și jumătate, cu o spumieră, până sunt auriu-închis pe ambele părți.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'check',
      text: t(
        'Lift the first doughnuts onto a paper-lined tray and tear one open: the inside should be cooked, airy and dry, with no wet, doughy centre (about 90 °C if you probe it). If it is raw in the middle, put it and the rest of the batch back in the oil for another minute or two, then lower the heat a little and fry the next ones a minute longer.',
        'Scoate primele gogoși pe o tavă tapetată cu hârtie de bucătărie și rupe una: în interior trebuie să fie coaptă, pufoasă și uscată, fără miez crud și lipicios (cam 90 °C dacă o verifici cu termometrul). Dacă e crudă la mijloc, pune-o înapoi în ulei împreună cu restul seriei încă un minut-două, apoi micșorează puțin focul și prăjește următoarele cu un minut mai mult.',
      ),
    },
    {
      key: 'batches',
      text: t(
        'Fry the rest the same way, 3 at a time. Let the oil come back to 170 °C between batches and keep the unfried rounds covered.',
        'Prăjește restul la fel, câte 3 deodată. Lasă uleiul să revină la 170 °C între serii și ține acoperite rondelele neprăjite.',
      ),
    },
    {
      key: 'finish',
      text: t(
        'Let the doughnuts cool for 10 minutes. For jam-filled ones, poke a hole in the side with a skewer and pipe in a smooth jam. Dust generously with icing sugar and serve warm.',
        'Lasă gogoșile să se răcească 10 minute. Pentru cele umplute, înțeapă o gaură în lateral cu o frigăruie și introdu cu un săculeț de cofetărie dulceață fără bucăți (sau gem). Pudrează din belșug cu zahăr pudră și servește-le calde.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'cool-oil',
      text: t(
        'Turn the heat off and leave the pot where it is until the oil is completely cold, which takes some hours. Only then strain it into a bottle with a lid, or throw it away with the household waste, never down the sink.',
        'Stinge focul și lasă oala pe loc până când uleiul s-a răcit complet, ceea ce durează câteva ore. Abia apoi strecoară-l într-o sticlă cu capac sau aruncă-l la gunoiul menajer, niciodată în chiuvetă.',
      ),
    },
  ],
  tips: [
    t(
      'If the oil catches fire, switch the heat off only if you can do it safely and do not move the pot. Smother the flames with the lid or a damp, not dripping, towel. Never use water. If the fire does not go out at once, get everyone out, close the door and call 112.',
      'Dacă uleiul ia foc, oprește aragazul doar dacă poți face asta în siguranță și nu muta oala. Sufocă flăcările cu capacul sau cu un prosop umed, nu ud leoarcă. Nu folosi niciodată apă. Dacă focul nu se stinge imediat, scoate pe toată lumea din casă, închide ușa și sună la 112.',
    ),
    t(
      'Keep the oil or fat at the temperature in the recipe. If it is too cool the dough soaks up oil and turns heavy; if it is too hot the outside burns before the inside is cooked.',
      'Ține uleiul sau grăsimea la temperatura din rețetă. Dacă e prea rece, aluatul se îmbibă cu grăsime și iese greu; dacă e prea fierbinte, se arde la exterior înainte să se coacă în interior.',
    ),
    t(
      'No fresh yeast? use about 8 g of dry yeast for this amount of flour. Add it straight to the flour, skip the 10-minute foaming and pour in the lukewarm milk with the eggs.',
      'Nu ai drojdie proaspătă? Folosește cam 8 g de drojdie uscată pentru această cantitate de făină. Adaugă-o direct în făină, sari peste cele 10 minute de spumare și toarnă laptele căldicel odată cu ouăle.',
    ),
    t(
      'A good warm place for rising is the oven switched off with only its light on, or near a radiator, away from draughts.',
      'Un loc bun pentru dospit e cuptorul oprit, cu becul aprins, sau lângă un calorifer, ferit de curent.',
    ),
    t(
      'Best eaten the same day. Cool leftovers completely, keep them in an airtight tin at room temperature until the next day and warm them for 5 minutes in a 160 °C oven. Dust with fresh icing sugar, as the first coat melts in.',
      'Sunt mai bune în ziua în care le prăjești. Lasă resturile să se răcească complet, ține-le într-o cutie ermetică la temperatura camerei până a doua zi și încălzește-le 5 minute în cuptorul încins la 160 °C. Pudrează din nou cu zahăr pudră, pentru că primul strat se topește.',
    ),
  ],
  stepTips: [
    {
      step: 'starter',
      text: t(
        'Milk that is too hot kills the yeast and the dough will not rise. If in doubt, let it cool a little longer.',
        'Laptele prea fierbinte omoară drojdia și aluatul nu crește. Dacă ai dubii, lasă-l să se răcească puțin.',
      ),
    },
    {
      step: 'shape',
      text: t(
        'Do not twist the glass as you cut: a clean, straight press lets the edges rise evenly.',
        'Nu răsuci paharul când tai: o apăsare dreaptă lasă marginile să crească uniform.',
      ),
    },
    {
      step: 'fry',
      text: t(
        'Fry only a few at a time. A crowded pot drops the oil temperature at once, and the doughnuts turn greasy.',
        'Prăjește doar câteva deodată. O oală încărcată scade imediat temperatura uleiului, iar gogoșile ies grase.',
      ),
    },
  ],
  nutritionNote: t(
    'A treat: refined flour, sugar and the oil the dough soaks up make these energy-dense and low in fibre, and the icing sugar adds more. The oil is mostly unsaturated; the butter, eggs and milk add some saturated fat and a little protein and calcium. Keep them for special occasions, one or two at a time.',
    'Un răsfăț: făina albă, zahărul și uleiul pe care îl absoarbe aluatul le fac bogate în energie și sărace în fibre, iar zahărul pudră mai adaugă. Uleiul e în mare parte nesaturat; untul, ouăle și laptele aduc ceva grăsimi saturate, puține proteine și calciu. Păstrează-le pentru ocazii, câte una sau două.',
  ),
  pairings: [
    {
      kind: 'drink',
      label: t('Coffee', 'Cafea'),
      reason: t(
        'Its bitterness balances the sugar and the rich fried dough.',
        'Amăreala ei echilibrează zahărul și aluatul prăjit, bogat.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'coffee',
    },
    {
      kind: 'drink',
      label: t('Tea', 'Ceai'),
      reason: t(
        'A hot, unsweetened tea refreshes the palate between sweet bites.',
        'Un ceai fierbinte, neîndulcit, împrospătează gustul între îmbucăturile dulci.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'tea',
    },
    {
      kind: 'food',
      label: t('Fresh strawberries', 'Căpșuni proaspete'),
      reason: t(
        'Their light acidity cuts through the fried, sugared dough.',
        'Aciditatea lor ușoară taie din greutatea aluatului prăjit și îndulcit.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'strawberry',
    },
  ],
  eatingMoments: [
    {
      moment: 'brunch',
      polarity: 'good_for',
      reason: t(
        'A weekend treat with coffee, best eaten warm from the pot.',
        'Un răsfăț de weekend, cu cafea, cel mai bun cald, abia scos din ulei.',
      ),
    },
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'Warm, sweet and comforting on a chilly day.',
        'Calde, dulci și reconfortante într-o zi rece.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Fried, fatty dough sits heavy in the stomach during exercise.',
        'Aluatul prăjit și gras cade greu la stomac în timpul efortului.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A heavy, sugary, fried food is a poor choice just before bed.',
        'O mâncare grea, prăjită și dulce nu e o alegere bună chiar înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'gogosi-greek',
      cuisine: 'greek',
      hideBaseTips: [2, 4],
      title: t(
        'Loukoumades (Greek honey-soaked dough puffs)',
        'Loukoumades (gogoșele grecești însiropate cu miere)',
      ),
      servings: 6,
      prepMinutes: 60,
      cookMinutes: 45,
      difficulty: 'medium',
      lines: [
        { ingredient: 'flour', quantity: 300, unit: 'g' },
        { ingredient: 'dry-yeast', quantity: 7, unit: 'g' },
        {
          ingredient: 'sugar',
          key: 'sugar-batter',
          quantity: 10,
          unit: 'g',
          note: t('for the batter', 'pentru aluat'),
        },
        { ingredient: 'salt', quantity: 3, unit: 'g' },
        {
          ingredient: 'still-water',
          quantity: 0.4,
          unit: 'l',
          note: t('lukewarm, for the batter', 'căldicică, pentru aluat'),
        },
        {
          ingredient: 'sunflower-oil',
          quantity: 1000,
          unit: 'ml',
          note: t(
            'for frying, in a heavy pot of at least 3 litres',
            'pentru prăjit, într-o oală grea de cel puțin 3 litri',
          ),
        },
        { ingredient: 'honey', quantity: 200, unit: 'g' },
        {
          ingredient: 'sugar',
          key: 'sugar-syrup',
          quantity: 100,
          unit: 'g',
          note: t('for the syrup', 'pentru sirop'),
        },
        {
          ingredient: 'still-water',
          key: 'water-syrup',
          quantity: 0.2,
          unit: 'l',
          note: t('for the syrup', 'pentru sirop'),
        },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t('peel in wide strips', 'coaja tăiată în fâșii late'),
        },
        { ingredient: 'cinnamon-sticks', quantity: 3, unit: 'g' },
        {
          ingredient: 'cinnamon',
          quantity: 2,
          unit: 'g',
          note: t('to finish', 'pentru final'),
        },
        {
          ingredient: 'walnuts',
          quantity: 40,
          unit: 'g',
          optional: true,
          note: t('chopped', 'tocate'),
        },
      ],
      steps: [
        {
          key: 'batter',
          text: t(
            'In a large bowl mix the flour, yeast, the 10 g of sugar and the salt. Pour in the lukewarm water and beat with a spoon or whisk for 3 minutes until you have a thick, sticky batter, thicker than pancake batter, that falls slowly from the spoon.',
            'Într-un castron mare amestecă făina, drojdia, cele 10 g de zahăr și sarea. Toarnă apa căldicică și bate cu lingura sau cu telul 3 minute, până obții un aluat gros și lipicios, mai gros decât cel de clătite, care cade greu de pe lingură.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'rise',
          text: t(
            'Cover the bowl and leave it in a warm place for about 1 hour, until the batter has doubled and is full of bubbles. Do not stir it down afterwards.',
            'Acoperă castronul și lasă-l la loc călduț cam 1 oră, până când aluatul și-a dublat volumul și e plin de bule. După aceea nu-l mai amesteca.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'syrup',
          text: t(
            'While the batter rises, put the honey, the 100 g of sugar, the 0.2 l of water, the lemon peel and the cinnamon stick in a small pan. Bring to a gentle simmer and simmer for 5 minutes. Take it off the heat and leave it to cool to room temperature.',
            'În timp ce aluatul crește, pune mierea, cele 100 g de zahăr, cei 0,2 l de apă, coaja de lămâie și batonul de scorțișoară într-o cratiță mică. Adu la un clocot ușor și fierbe 5 minute. Dă-o de pe foc și lasă siropul să se răcească până ajunge la temperatura camerei.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'heat-oil',
          text: t(
            'Pour the oil into a heavy pot of at least 3 litres, so it is no more than a third full. Clip a thermometer to the side and heat over medium heat to 175 °C. Do not leave the pot, keep a lid within reach and keep water well away from it. If the oil starts to smoke, turn the heat off. Pour a little cold oil into a cup for the spoon.',
            'Toarnă uleiul într-o oală grea de cel puțin 3 litri, astfel încât să fie umplută cel mult o treime. Prinde un termometru de margine și încălzește la foc mediu până la 175 °C. Nu pleca de lângă oală, ține un capac la îndemână și ține apa departe de ea. Dacă uleiul începe să fumege, stinge focul. Toarnă puțin ulei rece într-o ceașcă, pentru lingură.',
          ),
        },
        {
          key: 'fry',
          text: t(
            'Dip a spoon in the cold oil in the cup, scoop up a walnut-sized spoonful of batter and slide it into the hot oil close to the surface, away from you. Add 5 more the same way. Fry for about 3½ minutes, turning them with a slotted spoon, until deep golden all over.',
            'Înmoaie o lingură în uleiul rece din ceașcă, ia o lingură de aluat cât o nucă și lasă-l să alunece în uleiul fierbinte, aproape de suprafață și în direcția opusă ție. Mai adaugă 5 în același fel. Prăjește-le cam 3 minute și jumătate, întorcându-le cu o spumieră, până sunt auriu-închis peste tot.',
          ),
          timerSeconds: 210,
        },
        {
          key: 'check',
          text: t(
            'Lift the first puffs onto a paper-lined tray and tear one open: it should be airy and cooked, with no raw, gummy batter inside (about 90 °C if you probe it). If it is raw, lower the heat a little and fry the next batch a minute longer.',
            'Scoate primele gogoșele pe o tavă tapetată cu hârtie de bucătărie și rupe una: trebuie să fie pufoasă și coaptă, fără aluat crud și lipicios în interior (cam 90 °C dacă o verifici cu termometrul). Dacă e crudă, micșorează puțin focul și prăjește următoarea serie cu un minut mai mult.',
          ),
        },
        {
          key: 'soak',
          text: t(
            'Put the first batch into the syrup too, then fry the rest in batches of 6, letting the oil come back to 175 °C each time. Put each batch straight from the oil into the cool syrup, turn them in it for about a minute, and lift them out with a slotted spoon onto a plate.',
            'Pune și prima serie în sirop, apoi prăjește restul în serii de câte 6, lăsând uleiul să revină la 175 °C de fiecare dată. Pune fiecare serie direct din ulei în siropul rece, întoarce-le prin sirop cam un minut și scoate-le cu o spumieră pe o farfurie.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'finish',
          text: t(
            'Sprinkle the puffs with the ground cinnamon and the chopped walnuts, if using, and spoon over a little more syrup. Serve while still warm.',
            'Presară gogoșelele cu scorțișoara măcinată și cu nucile tocate, dacă le folosești, și toarnă peste ele puțin sirop. Servește-le calde.',
          ),
        },
        {
          key: 'cool-oil',
          text: t(
            'Turn the heat off and leave the pot where it is until the oil is completely cold, which takes some hours. Only then strain it into a bottle with a lid, or throw it away with the household waste, never down the sink.',
            'Stinge focul și lasă oala pe loc până când uleiul s-a răcit complet, ceea ce durează câteva ore. Abia apoi strecoară-l într-o sticlă cu capac sau aruncă-l la gunoiul menajer, niciodată în chiuvetă.',
          ),
        },
      ],
      tips: [
        t(
          'Hot puffs, cool syrup: drop the puffs in straight from the oil so they soak up the syrup and stay crisp. Hot syrup on hot puffs turns them soggy.',
          'Gogoșele fierbinți, sirop rece: pune-le în sirop direct din ulei, ca să-l absoarbă și să rămână crocante. Siropul fierbinte peste gogoșele fierbinți le face moi.',
        ),
        t(
          'Eat them the same day, as soon as they are soaked. Leftovers go soft, so keep them covered at room temperature and eat them within a day.',
          'Mănâncă-le în aceeași zi, imediat după ce s-au însiropat. Resturile se înmoaie, așa că ține-le acoperite la temperatura camerei și mănâncă-le în cel mult o zi.',
        ),
      ],
      stepTips: [
        {
          step: 'fry',
          text: t(
            'Wet batter sticks to a dry spoon. A spoon dipped in cold oil, never in water, lets it slide off in a round shape without spitting.',
            'Aluatul umed se lipește de lingura uscată. O lingură înmuiată în ulei rece, niciodată în apă, îl lasă să alunece rotund, fără să stropească.',
          ),
        },
      ],
      nutritionNote: t(
        'A sweet treat: the honey and sugar syrup adds a lot of sugar on top of fried, refined-flour dough, and there is little fibre. The oil is mostly unsaturated and there is no butter or egg in the dough, so the saturated fat stays low. Walnuts add a little fibre and healthy fat. Keep portions small.',
        'Un desert dulce: siropul de miere și zahăr adaugă mult zahăr peste un aluat prăjit din făină albă, iar fibrele sunt puține. Uleiul e în mare parte nesaturat, iar în aluat nu sunt unt și ouă, deci grăsimile saturate rămân puține. Nucile aduc puține fibre și grăsimi bune. Păstrează porțiile mici.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'Its bitterness balances the very sweet honey syrup.',
            'Amăreala ei echilibrează siropul de miere foarte dulce.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'coffee',
        },
        {
          kind: 'food',
          label: t('Greek yogurt', 'Iaurt grecesc'),
          reason: t(
            'A spoonful of cool, tangy yogurt contrasts with the warm, sweet puffs.',
            'O lingură de iaurt rece și acrișor contrastează cu gogoșelele calde și dulci.',
          ),
          principle: 'contrast_texture',
          ingredient: 'greek-yogurt',
        },
        {
          kind: 'drink',
          label: t('Tea', 'Ceai'),
          reason: t(
            'A hot, unsweetened tea refreshes the palate between sweet bites.',
            'Un ceai fierbinte, neîndulcit, împrospătează gustul între îmbucăturile dulci.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'A shared plate of warm puffs suits a slow weekend morning.',
            'O farfurie de gogoșele calde, de împărțit, se potrivește unei dimineți lente de weekend.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Warm, honeyed and cinnamon-scented on a chilly day.',
            'Calde, cu miere și miros de scorțișoară, într-o zi rece.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Fried dough soaked in syrup sits heavy in the stomach during exercise.',
            'Aluatul prăjit și îmbibat în sirop cade greu la stomac în timpul efortului.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Very sweet, fried and heavy just before bed.',
            'Foarte dulci, prăjite și grele chiar înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'gogosi-spanish',
      cuisine: 'spanish',
      hideBaseTips: [2, 3, 4],
      title: t(
        'Churros con chocolate',
        'Churros cu ciocolată caldă groasă, ca în Spania',
      ),
      servings: 4,
      prepMinutes: 10,
      cookMinutes: 45,
      difficulty: 'medium',
      lines: [
        { ingredient: 'flour', quantity: 200, unit: 'g' },
        {
          ingredient: 'still-water',
          quantity: 0.4,
          unit: 'l',
        },
        { ingredient: 'salt', quantity: 3, unit: 'g' },
        {
          ingredient: 'sunflower-oil',
          quantity: 1000,
          unit: 'ml',
          note: t(
            'for frying, in a heavy pot of at least 3 litres',
            'pentru prăjit, într-o oală grea de cel puțin 3 litri',
          ),
        },
        {
          ingredient: 'sugar',
          key: 'sugar-rolling',
          quantity: 60,
          unit: 'g',
          note: t('for rolling', 'pentru tăvălit'),
        },
        {
          ingredient: 'cinnamon',
          quantity: 3,
          unit: 'g',
          optional: true,
          note: t(
            'mixed into the rolling sugar',
            'amestecată în zahărul de tăvălit',
          ),
        },
        {
          ingredient: 'milk',
          quantity: 0.4,
          unit: 'l',
          note: t('for the chocolate', 'pentru ciocolată'),
        },
        {
          ingredient: 'dark-chocolate',
          quantity: 150,
          unit: 'g',
          note: t('chopped', 'tocată mărunt'),
        },
        {
          ingredient: 'sugar',
          key: 'sugar-chocolate',
          quantity: 25,
          unit: 'g',
          note: t('for the chocolate', 'pentru ciocolată'),
        },
        {
          ingredient: 'corn-starch',
          quantity: 15,
          unit: 'g',
        },
      ],
      steps: [
        {
          key: 'dough',
          text: t(
            'Bring the water and the salt to the boil in a medium pan. Take it off the heat, tip in all the flour at once and beat hard with a wooden spoon for 2 minutes, until you have a stiff, smooth paste with no lumps that leaves the sides of the pan.',
            'Adu apa cu sarea la fierbere într-o cratiță mijlocie. Dă-o de pe foc, toarnă toată făina deodată și bate energic cu o lingură de lemn 2 minute, până obții o pastă tare și netedă, fără cocoloașe, care se desprinde de pe pereții cratiței.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'cool-dough',
          text: t(
            'Scrape the paste into a bowl and leave it for 10 minutes, until it is warm and no longer too hot to hold. Make the chocolate (next steps) while you wait.',
            'Răstoarnă pasta într-un castron și lasă-o 10 minute, până e caldă și nu mai frige la atingere. Fă ciocolata (pașii următori) cât timp aștepți.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'chocolate',
          text: t(
            'Whisk the corn starch with 50 ml of the cold milk in a cup. Heat the remaining 350 ml of milk with the 25 g of sugar in a small pan over low heat until steaming. Add the chocolate and stir until melted and smooth.',
            'Amestecă amidonul de porumb cu 50 ml din laptele rece într-o ceașcă. Încălzește cei 350 ml de lapte rămași cu cele 25 g de zahăr într-o cratiță mică, la foc mic, până scoate abur. Adaugă ciocolata și amestecă până se topește și devine netedă.',
          ),
        },
        {
          key: 'thicken',
          text: t(
            'Whisk in the starch mixture and keep stirring over low heat for about 2 minutes, until the chocolate is thick enough to coat the back of a spoon. Do not let it boil hard. Cover and keep warm on the lowest heat.',
            'Adaugă amestecul de amidon, amestecând, și continuă să mesteci la foc mic cam 2 minute, până când ciocolata e destul de groasă cât să acopere dosul unei linguri. Nu o lăsa să fiarbă tare. Acoperă și ține-o caldă la cel mai mic foc.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'heat-oil',
          text: t(
            'Pour the oil into a heavy pot of at least 3 litres, so it is no more than a third full. Clip a thermometer to the side and heat over medium heat to 180 °C. Do not leave the pot, keep a lid within reach and keep water well away from it. If the oil starts to smoke, turn the heat off.',
            'Toarnă uleiul într-o oală grea de cel puțin 3 litri, astfel încât să fie umplută cel mult o treime. Prinde un termometru de margine și încălzește la foc mediu până la 180 °C. Nu pleca de lângă oală, ține un capac la îndemână și ține apa departe de ea. Dacă uleiul începe să fumege, stinge focul.',
          ),
        },
        {
          key: 'bag',
          text: t(
            'Fit a sturdy piping bag, a reusable cloth or heavy-duty one, with a large star nozzle of about 1 cm, and fill it only half full: hot dough can burst a thin or overfilled bag. Squeeze out the first bit into a bowl to remove air. Mix the rolling sugar with the cinnamon on a plate.',
            'Pregătește un săculeț de cofetărie rezistent, textil sau din plastic gros, cu o duză mare în stea de cam 1 cm și umple-l doar pe jumătate: aluatul cald poate sparge un săculeț subțire sau prea plin. Stoarce puțin aluat într-un castron, ca să scoți aerul. Amestecă zahărul de tăvălit cu scorțișoara pe o farfurie.',
          ),
        },
        {
          key: 'fry',
          text: t(
            'Holding the bag close to the surface of the oil and away from you, pipe four 12 cm lengths into the oil, snipping each with scissors. Fry for about 2½ minutes, turning once with tongs, until golden and crisp.',
            'Ținând săculețul aproape de suprafața uleiului și în direcția opusă ție, presează în ulei patru bucăți de 12 cm, tăind fiecare cu foarfeca. Prăjește-i cam 2 minute și jumătate, întorcându-i o dată cu un clește, până sunt aurii și crocanți.',
          ),
          timerSeconds: 150,
        },
        {
          key: 'check',
          text: t(
            'Lift the first churros onto a paper-lined tray and break one open: it should be cooked through and hollow-ish, with no wet, doughy centre (about 90 °C if you probe it). If it is doughy, lower the heat a little and fry the next batch a little longer.',
            'Scoate primii churros pe o tavă tapetată cu hârtie de bucătărie și rupe unul: trebuie să fie copt în interior, ușor gol pe dinăuntru, fără miez crud și lipicios (cam 90 °C dacă îl verifici cu termometrul). Dacă e crud, micșorează puțin focul și prăjește următoarea serie ceva mai mult.',
          ),
        },
        {
          key: 'batches',
          text: t(
            'Fry the rest in batches of 4, letting the oil come back to 180 °C each time. Roll the churros in the cinnamon sugar while still warm.',
            'Prăjește restul în serii de câte 4, lăsând uleiul să revină la 180 °C de fiecare dată. Tăvălește churros în zahărul cu scorțișoară cât sunt încă calzi.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Serve the churros at once with the warm chocolate in small cups for dipping. Let the chocolate cool for a minute before giving it to children.',
            'Servește churros imediat, cu ciocolata caldă în căni mici, pentru înmuiat. Lasă ciocolata să se răcească un minut înainte s-o dai copiilor.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'cool-oil',
          text: t(
            'Turn the heat off and leave the pot where it is until the oil is completely cold, which takes some hours. Only then strain it into a bottle with a lid, or throw it away with the household waste, never down the sink.',
            'Stinge focul și lasă oala pe loc până când uleiul s-a răcit complet, ceea ce durează câteva ore. Abia apoi strecoară-l într-o sticlă cu capac sau aruncă-l la gunoiul menajer, niciodată în chiuvetă.',
          ),
        },
      ],
      tips: [
        t(
          'The ridges from the star nozzle matter: they let steam escape and the churros stay crisp and do not burst. Pipe close and steady, with no air pockets in the dough.',
          'Dungile făcute de duza în stea contează: lasă aburul să iasă, churros rămân crocanți și nu pocnesc. Presează aproape și constant, fără pungi de aer în aluat.',
        ),
        t(
          'Churros are best straight from the pot. Eat them the same day; leftovers go soft, so keep them in a loosely covered container at room temperature and re-crisp them for 5 minutes in a 180 °C oven. Keep leftover chocolate in the fridge and warm it up gently, within 2 days.',
          'Churros sunt cei mai buni direct din ulei. Mănâncă-i în aceeași zi; cei rămași se înmoaie, așa că ține-i într-un vas acoperit lejer la temperatura camerei și încălzește-i 5 minute în cuptorul încins la 180 °C, ca să se facă iar crocanți. Ciocolata rămasă ține-o la frigider și încălzește-o încet, în cel mult 2 zile.',
        ),
      ],
      stepTips: [
        {
          step: 'dough',
          text: t(
            'Beat the paste while it is hot: it must be smooth before it cools, because lumps stay in the churros.',
            'Bate pasta cât e fierbinte: trebuie să fie netedă înainte să se răcească, pentru că cocoloașele rămân în churros.',
          ),
        },
        {
          step: 'thicken',
          text: t(
            'Stir constantly over low heat. Chocolate scorches easily on the bottom of the pan, and a burnt taste cannot be fixed.',
            'Amestecă mereu, la foc mic. Ciocolata se prinde ușor de fundul cratiței, iar gustul de ars nu se mai repară.',
          ),
        },
      ],
      nutritionNote: t(
        'A rich treat: fried refined-flour dough, rolled in sugar and dipped in sweet chocolate, so lots of sugar and energy and little fibre. The oil is mostly unsaturated; the milk and chocolate add some saturated fat. Keep it for special occasions and share the chocolate.',
        'Un răsfăț bogat: aluat prăjit din făină albă, tăvălit prin zahăr și înmuiat în ciocolată dulce, deci mult zahăr și multă energie, cu puține fibre. Uleiul e în mare parte nesaturat; laptele și ciocolata aduc ceva grăsimi saturate. Păstrează-i pentru ocazii și împarte ciocolata.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'Its bitterness balances the sugar and the thick chocolate.',
            'Amăreala ei echilibrează zahărul și ciocolata groasă.',
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
            'Fun to share at a slow weekend breakfast.',
            'Plăcut de împărțit la un mic dejun lent de weekend.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Hot chocolate and warm fried dough comfort on a cold day.',
            'Ciocolata caldă și aluatul prăjit cald reconfortează într-o zi rece.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Fried dough and thick chocolate sit heavy during exercise.',
            'Aluatul prăjit și ciocolata groasă cad greu la stomac în timpul efortului.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Heavy, sugary and fried, and chocolate can keep some people awake.',
            'Greu, dulce și prăjit, iar ciocolata îi poate ține treji pe unii.',
          ),
        },
      ],
    },
    {
      slug: 'gogosi-scandinavian',
      cuisine: 'scandinavian',
      hideBaseTips: [2, 3, 4],
      title: t(
        'Klejner (Danish fried Christmas knots with cardamom)',
        'Klejner (minciunele daneze cu cardamom, prăjite în untură)',
      ),
      servings: 10,
      prepMinutes: 60,
      cookMinutes: 85,
      difficulty: 'medium',
      lines: [
        { ingredient: 'flour', quantity: 500, unit: 'g' },
        {
          ingredient: 'butter',
          quantity: 100,
          unit: 'g',
          note: t('cold, diced', 'rece, tăiat cubulețe'),
        },
        { ingredient: 'sugar', quantity: 100, unit: 'g' },
        { ingredient: 'cardamom', quantity: 3, unit: 'g' },
        { ingredient: 'bakers-ammonia', quantity: 4, unit: 'g' },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t('zest only', 'doar coaja rasă'),
        },
        { ingredient: 'salt', quantity: 2, unit: 'g' },
        { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
        { ingredient: 'whipping-cream', quantity: 100, unit: 'ml' },
        {
          ingredient: 'lard',
          quantity: 1000,
          unit: 'g',
          note: t(
            'for frying, in a heavy pot of at least 4 litres',
            'pentru prăjit, într-o oală grea de cel puțin 4 litri',
          ),
        },
      ],
      steps: [
        {
          key: 'rub',
          text: t(
            'Sift the baker’s ammonia (hjortetakssalt) with the flour into a large bowl, then mix in the sugar, cardamom, salt and lemon zest. Add the cold butter and rub it in with your fingertips until the mixture looks like fine breadcrumbs.',
            'Cerne amoniacul alimentar (hjortetakssalt) împreună cu făina într-un castron mare, apoi amestecă zahărul, cardamomul, sarea și coaja de lămâie. Adaugă untul rece și freacă-l între degete până când compoziția arată ca pesmetul fin.',
          ),
        },
        {
          key: 'bind',
          text: t(
            'Beat the eggs with the cream, pour them in and knead quickly, just until the dough comes together into a smooth ball. Flatten it, wrap it in cling film and put it in the fridge.',
            'Bate ouăle cu frișca, toarnă-le peste și frământă repede, doar până când aluatul se leagă într-o bilă netedă. Aplatizează-o, învelește-o în folie și pune-o la frigider.',
          ),
        },
        {
          key: 'chill',
          text: t(
            'Chill the dough for 1 hour, until firm.',
            'Lasă aluatul la rece 1 oră, până se întărește.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'roll',
          text: t(
            'Divide the dough in 4 and keep the rest cold while you work. Roll each piece out 3 mm thick on a floured table. Cut strips 4 cm wide, then cut them across into diamonds about 9 cm long. Cut a slit of about 4 cm along the middle of each diamond and pull one tip through it to make a knot.',
            'Împarte aluatul în 4 și ține restul la rece cât lucrezi. Întinde fiecare bucată subțire de 3 mm pe masa înfăinată. Taie fâșii late de 4 cm, apoi taie-le în diagonală în romburi lungi de cam 9 cm. Fă în mijlocul fiecărui romb o tăietură de cam 4 cm pe lungime și trece unul dintre vârfuri prin ea, ca să faci un nod.',
          ),
        },
        {
          key: 'melt-lard',
          text: t(
            'Put the lard in a heavy pot of at least 4 litres, so it is no more than a third full once melted. Melt it over low heat, then clip a thermometer to the side and bring it to 175 °C. Do not leave the pot, keep a lid within reach and keep water well away from it. If the fat starts to smoke, turn the heat off.',
            'Pune untura într-o oală grea de cel puțin 4 litri, astfel încât, topită, să umple cel mult o treime din ea. Topește-o la foc mic, apoi prinde un termometru de margine și încălzește la 175 °C. Nu pleca de lângă oală, ține un capac la îndemână și ține apa departe de ea. Dacă untura începe să fumege, stinge focul.',
          ),
        },
        {
          key: 'fry',
          text: t(
            'Lower 6 to 8 klejner into the hot lard one at a time, close to the surface and away from you. Fry for about 1½ minutes in total, turning once with a fork or tongs, until golden brown.',
            'Coboară în untura fierbinte 6-8 klejner, pe rând, aproape de suprafață și în direcția opusă ție. Prăjește-i cam 1 minut și jumătate în total, întorcându-i o dată cu furculița sau cu cleștele, până sunt brun-aurii.',
          ),
          timerSeconds: 90,
        },
        {
          key: 'check',
          text: t(
            'Lift the first klejner onto a paper-lined tray, let one cool for a moment and break it: it should be crisp and golden all the way through, with no pale, raw dough in the fold of the knot. If it is pale inside, put it and the rest of the batch back in the lard for another minute, then fry the next batch a little longer.',
            'Scoate primii klejner pe o tavă tapetată cu hârtie de bucătărie, lasă unul să se răcorească puțin și rupe-l: trebuie să fie crocant și auriu până la mijloc, fără aluat palid și crud în cuta nodului. Dacă înăuntru e palid, pune-l înapoi în untură împreună cu restul seriei încă un minut, apoi prăjește următoarea serie puțin mai mult.',
          ),
        },
        {
          key: 'batches',
          text: t(
            'Fry the rest in batches, letting the lard come back to 175 °C each time and keeping the unfried klejner covered.',
            'Prăjește restul în serii, lăsând untura să revină la 175 °C de fiecare dată și ținând acoperite nodurile neprăjite.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Let the klejner cool completely on a rack or fresh paper, then pack them in an airtight tin.',
            'Lasă klejner să se răcească complet pe un grătar sau pe hârtie curată, apoi pune-i într-o cutie metalică ermetică.',
          ),
        },
        {
          key: 'cool-fat',
          text: t(
            'Turn the heat off and leave the pot where it is until the lard is completely cold and has set, which takes some hours. Then scrape it into a container to use again, or throw it away with the household waste, never down the sink.',
            'Stinge focul și lasă oala pe loc până când untura s-a răcit complet și s-a întărit, ceea ce durează câteva ore. Apoi răzuiește-o într-un recipient, ca s-o folosești din nou, sau aruncă-o la gunoiul menajer, niciodată în chiuvetă.',
          ),
        },
      ],
      tips: [
        t(
          'Work with cold dough. Warm dough turns sticky and tough to roll, so roll one piece at a time and keep the rest in the fridge. Keep the cut knots covered and cool until you fry them.',
          'Lucrează cu aluat rece. Aluatul călduț devine lipicios și greu de întins, așa că întinde câte o bucată și ține restul la frigider. Ține nodurile tăiate acoperite și la rece până le prăjești.',
        ),
        t(
          'Best fresh. Once completely cool, keep the klejner in a tight tin in a cool, dry place for a few days.',
          'Sunt mai buni proaspeți. După ce s-au răcit complet, ține-i câteva zile într-o cutie metalică bine închisă, într-un loc răcoros și uscat.',
        ),
        t(
          'Baker’s ammonia smells sharply of ammonia in the raw dough. The smell fries off completely and is normal; the klejner taste only of cardamom and lemon.',
          'Amoniacul alimentar miroase puternic a amoniac în aluatul crud. Mirosul dispare complet la prăjit și e normal; klejner au gust doar de cardamom și lămâie.',
        ),
      ],
      stepTips: [
        {
          step: 'roll',
          text: t(
            'Roll the dough thin and even, or the thick klejner stay doughy inside before the thin ones are brown.',
            'Întinde aluatul subțire și uniform, altfel klejner mai groși rămân cruzi pe dinăuntru până se rumenesc cei subțiri.',
          ),
        },
      ],
      nutritionNote: t(
        'A once-in-a-while Christmas sweet: fried in lard, with butter and cream in the dough, so they are high in saturated fat as well as sugar, with little fibre. Each one is small and crisp, so a few go a long way. The cardamom and lemon give a lot of flavour without extra sugar.',
        'Un dulce de Crăciun, ocazional: prăjit în untură, cu unt și frișcă în aluat, deci bogat în grăsimi saturate, pe lângă zahăr, și sărac în fibre. Fiecare e mic și crocant, așa că și câțiva sunt de ajuns. Cardamomul și lămâia dau mult gust fără zahăr în plus.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Coffee', 'Cafea'),
          reason: t(
            'Its bitterness balances the sweet, rich fried pastry.',
            'Amăreala ei echilibrează aluatul prăjit, dulce și bogat.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'coffee',
        },
        {
          kind: 'drink',
          label: t('Mulled wine', 'Vin fiert cu condimente'),
          reason: t(
            'Its warm spices echo the cardamom in the dough.',
            'Condimentele lui calde răspund cardamomului din aluat.',
          ),
          principle: 'complement_flavour',
          ingredient: 'mulled-wine-base',
        },
        {
          kind: 'drink',
          label: t('Tea', 'Ceai'),
          reason: t(
            'A hot tea refreshes the palate between buttery, sweet bites.',
            'Un ceai fierbinte împrospătează gustul între îmbucăturile dulci și untoase.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A crisp, spiced treat with a hot drink in winter.',
            'Un răsfăț crocant și condimentat, alături de o băutură fierbinte, iarna.',
          ),
        },
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'A few on the table with coffee suit a slow weekend morning.',
            'Câțiva pe masă, lângă cafea, se potrivesc unei dimineți lente de weekend.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Fat-fried pastry sits heavy in the stomach during exercise.',
            'Aluatul prăjit în grăsime cade greu la stomac în timpul efortului.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Rich with lard, butter and sugar just before bed.',
            'Bogați în untură, unt și zahăr chiar înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
