import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Spaghetti aglio, olio e peperoncino base is the plain Italian pantry
// dish: garlic, olive oil and chilli, no cheese. Each Variant is a full Recipe
// with its own lines, steps and guidance. The base's Recipe-level Tips are
// inherited: 0 garlic, 1 pasta water, 2 leftovers.
export const spaghettiAglioOlio: BaseRecipeSeed = {
  slug: 'spaghetti-aglio-olio',
  title: t(
    'Spaghetti aglio, olio e peperoncino',
    'Spaghete aglio, olio e peperoncino (cu usturoi, ulei de măsline și ardei iute)',
  ),
  servings: 4,
  prepMinutes: 10,
  cookMinutes: 22,
  difficulty: 'easy',
  lines: [
    { ingredient: 'spaghetti', quantity: 400, unit: 'g' },
    {
      ingredient: 'still-water',
      quantity: 4,
      unit: 'l',
      note: t('for the pasta pot', 'pentru oala de paste'),
    },
    {
      ingredient: 'salt',
      quantity: 40,
      unit: 'g',
      note: t(
        'for the cooking water, 10 g per litre',
        'pentru apa de fiert, 10 g la litru',
      ),
    },
    {
      ingredient: 'garlic',
      quantity: 30,
      unit: 'g',
      note: t(
        'about 6 cloves, sliced paper-thin',
        'aproximativ 6 căței, tăiați foarte subțire',
      ),
    },
    {
      ingredient: 'olive-oil',
      quantity: 85,
      unit: 'ml',
      note: t('for the pan', 'pentru tigaie'),
    },
    {
      ingredient: 'dried-red-chillies',
      quantity: 3,
      unit: 'g',
      note: t('about 2 chillies, crumbled', 'aproximativ 2 ardei, fărâmițați'),
    },
    {
      ingredient: 'parsley',
      quantity: 20,
      unit: 'g',
      note: t('finely chopped', 'tocat mărunt'),
    },
    {
      ingredient: 'olive-oil',
      key: 'finishing-oil',
      quantity: 15,
      unit: 'ml',
      note: t('raw, to finish', 'crud, la final'),
    },
  ],
  steps: [
    {
      key: 'boil',
      text: t(
        'Bring 4 litres of water to a rolling boil in a large pot with the lid on. Add the 40 g of salt: the water should taste like mild seawater.',
        'Adu 4 litri de apă la fiert puternic într-o oală mare, cu capacul pus. Adaugă cei 40 g de sare: apa trebuie să aibă gust de apă de mare ușoară.',
      ),
    },
    {
      key: 'prep',
      text: t(
        'While the water heats, slice the garlic as thinly as you can so the slices cook evenly. Crumble the chillies and chop the parsley.',
        'Cât se încălzește apa, taie usturoiul cât mai subțire, ca felioarele să se gătească uniform. Fărâmițează ardeii iuți și toacă pătrunjelul.',
      ),
    },
    {
      key: 'spaghetti',
      text: t(
        'Add the spaghetti, press it under as it softens and stir in the first minute so it does not stick. Cook until 1 to 2 minutes short of the packet time, usually about 9 minutes. It should still have a firm core.',
        'Adaugă spaghetele, apasă-le în apă pe măsură ce se înmoaie și amestecă în primul minut ca să nu se lipească. Fierbe-le până cu 1-2 minute înainte de timpul de pe pachet, de obicei cam 9 minute. Trebuie să mai aibă un miez ferm.',
      ),
      timerSeconds: 540,
    },
    {
      key: 'garlic',
      text: t(
        'When the spaghetti has cooked for about 4 minutes, put the 85 ml of oil, the garlic and the chillies in a cold, wide frying pan (28 to 30 cm). Set it over low heat and warm gently for 4 to 5 minutes, stirring, until the garlic is pale gold at the edges and the oil sizzles softly. Take the pan off the heat the moment the slices start to colour.',
        'Când spaghetele fierb de vreo 4 minute, pune cei 85 ml de ulei, usturoiul și ardeii iuți într-o tigaie largă (28-30 cm), rece. Așaz-o pe foc mic și încălzește-le încet 4-5 minute, amestecând, până când usturoiul devine auriu-pal la margini, iar uleiul sfârâie ușor. Ia tigaia de pe foc în clipa în care felioarele încep să se coloreze.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'reserve',
      text: t(
        'Just before the spaghetti is ready, scoop out a mug (about 250 ml) of the cooking water. Drain the spaghetti in a colander and do not rinse it.',
        'Chiar înainte să fie gata spaghetele, ia cu o cană (cam 250 ml) din apa de fiert. Scurge spaghetele într-o strecurătoare și nu le clăti.',
      ),
    },
    {
      key: 'toss',
      text: t(
        'Tip the spaghetti into the garlic oil and put the pan back over high heat. Standing back, pour in 100 ml of the cooking water: it spits in hot oil. Toss and turn with tongs for 1 to 2 minutes, until the water and oil blend into a glossy coating that clings to the spaghetti. If it looks dry, add up to 50 ml more water, a spoonful at a time.',
        'Pune spaghetele în uleiul cu usturoi și așază tigaia la loc, pe foc mare. Ține-te la distanță și toarnă 100 ml din apa de fiert: stropește când ajunge în uleiul fierbinte. Amestecă și răsucește cu cleștele 1-2 minute, până când apa și uleiul se leagă într-un strat lucios care se prinde de spaghete. Dacă pare uscat, mai adaugă cel mult 50 ml de apă, câte o lingură.',
      ),
      timerSeconds: 90,
    },
    {
      key: 'finish',
      text: t(
        'Take the pan off the heat, add the parsley and the 15 ml of raw olive oil and toss once more. Taste for salt, then serve at once on warm plates.',
        'Ia tigaia de pe foc, adaugă pătrunjelul și cei 15 ml de ulei de măsline crud și amestecă încă o dată. Gustă de sare, apoi servește imediat în farfurii calde.',
      ),
    },
  ],
  tips: [
    t(
      'Cook the garlic to pale gold only. Start it in cold oil, keep the heat low and lift the pan off the heat as soon as it colours. Browned garlic turns bitter and flavours all the oil, so if the slices go brown, start again with fresh garlic.',
      'Gătește usturoiul doar până devine auriu-pal. Pornește-l în ulei rece, ține focul mic și ia tigaia de pe foc imediat ce se colorează. Usturoiul rumenit se amărește și dă gust amar întregului ulei, așa că, dacă felioarele s-au rumenit, ia-o de la capăt cu usturoi proaspăt.',
    ),
    t(
      'Keep the starchy cooking water: scoop out about 250 ml before draining and add it a splash at a time, around 100 ml in all. The starch binds oil and water into a light sauce that coats the pasta, so you get a glossy coating instead of oil pooling at the bottom of the plate.',
      'Păstrează apa de la fiert, plină de amidon: ia cam 250 ml înainte să scurgi pastele și adaug-o treptat, în total în jur de 100 ml. Amidonul leagă uleiul și apa într-un sos ușor care îmbracă pastele, așa că obții un strat lucios, nu ulei adunat pe fundul farfuriei.',
    ),
    t(
      'Leftover pasta: spread it in a shallow container and put it in the fridge within 2 hours of cooking, covered. Eat it within 2 days. Reheat in a pan with a splash of water until steaming hot all the way through, and do it once only. Never leave it on the counter overnight: bacteria grow fast in cooked pasta at room temperature.',
      'Dacă rămân paste: întinde-le într-un recipient plat, acoperă-le și pune-le la frigider în cel mult 2 ore de la gătit. Mănâncă-le în maximum 2 zile. Reîncălzește-le într-o tigaie, cu un strop de apă, până sunt fierbinți pe tot parcursul, o singură dată. Nu le lăsa peste noapte la temperatura camerei: bacteriile se înmulțesc repede în pastele gătite ținute la temperatura camerei.',
    ),
  ],
  stepTips: [
    {
      step: 'boil',
      text: t(
        'Salt the water properly, about 10 g per litre. The pasta takes up its seasoning here, and the sauce has no cheese or anything else to make up for bland spaghetti.',
        'Sărează apa bine, cam 10 g la litru. Pastele se asezonează aici, iar sosul nu are brânză sau altceva care să acopere niște spaghete fade.',
      ),
    },
    {
      step: 'toss',
      text: t(
        'Toss rather than stir, and keep the pan hot: the sauce comes together through movement and heat. If it turns oily and separate, add a spoonful of hot cooking water and toss harder.',
        'Nu amesteca cu lingura, ci saltă și întoarce pastele în tigaie, și ține tigaia fierbinte: sosul se leagă prin mișcare și căldură. Dacă ies ulei și apă separate, adaugă o lingură de apă fierbinte de la paste și amestecă mai energic.',
      ),
    },
  ],
  nutritionNote: t(
    'Pasta gives steady energy from carbohydrate, and olive oil is mostly unsaturated fat, but the dish has little protein or fibre and is quite salty from the cooking water. Add a green salad or some fish, chicken or beans on the side, and go easy on the oil if you watch your fat intake.',
    'Pastele dau energie constantă din carbohidrați, iar uleiul de măsline are mai ales grăsimi nesaturate, dar preparatul are puține proteine și fibre și e destul de sărat din apa de fiert. Adaugă alături o salată verde sau puțin pește, pui ori fasole și folosește mai puțin ulei dacă îți urmărești aportul de grăsimi.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Rocket salad with lemon', 'Salată de rucola cu lămâie'),
      reason: t(
        'The peppery bitterness and the lemon cut through the rich oil and add the greens the pasta lacks.',
        'Amăreala piperată și lămâia taie bogăția uleiului și aduc verdeața care lipsește din paste.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'rocket',
    },
    {
      kind: 'food',
      label: t('Ripe tomato salad', 'Salată de roșii coapte'),
      reason: t(
        'Juicy, slightly acidic tomatoes freshen a plate that is all oil and garlic.',
        'Roșiile zemoase, ușor acidulate, înviorează o farfurie în care e doar ulei și usturoi.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'tomato',
    },
    {
      kind: 'drink',
      label: t('Dry white wine', 'Vin alb sec'),
      reason: t(
        'Crisp acidity cuts the olive oil and rounds off the garlic and chilli.',
        'Aciditatea fină taie uleiul de măsline și rotunjește usturoiul și ardeiul iute.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'white-wine',
    },
    {
      kind: 'drink',
      label: t('Sparkling water', 'Apă minerală'),
      reason: t(
        'The bubbles refresh the mouth between forkfuls of oily, garlicky pasta.',
        'Bulele împrospătează gura între îmbucăturile de paste cu ulei și usturoi.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'sparkling-water',
    },
  ],
  eatingMoments: [
    {
      moment: 'late-evening',
      polarity: 'good_for',
      reason: t(
        'Ready in about 30 minutes from pantry staples, so it works when you come home hungry and late.',
        'E gata în vreo 30 de minute din alimente de bază, deci merge bine când ajungi acasă târziu și flămând.',
      ),
    },
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'A quick, filling plate; serve a smaller portion with a salad for a lighter lunch.',
        'O farfurie rapidă și săturătoare; servește o porție mai mică, cu salată, pentru un prânz mai ușor.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'The carbohydrate refuels tired muscles; add an egg or some fish for protein.',
        'Carbohidrații reîncarcă mușchii obosiți; adaugă un ou sau puțin pește pentru proteine.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Oil and garlic sit heavy in the stomach during hard exercise.',
        'Uleiul și usturoiul cad greu la stomac în timpul unui efort intens.',
      ),
    },
  ],
  variants: [
    {
      slug: 'spaghetti-aglio-olio-italian',
      cuisine: 'italian',
      hideBaseTips: [1, 2],
      title: t(
        'Spaghetti alle vongole (with clams, garlic and white wine)',
        'Spaghete alle vongole (cu scoici venus, usturoi și vin alb)',
      ),
      servings: 4,
      prepMinutes: 70,
      cookMinutes: 22,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'clams',
          quantity: 1000,
          unit: 'g',
          note: t('live, in the shell', 'vii, în cochilie'),
        },
        {
          ingredient: 'still-water',
          key: 'purge-water',
          quantity: 1.5,
          unit: 'l',
          note: t(
            'cold, for purging the clams',
            'rece, pentru curățarea scoicilor de nisip',
          ),
        },
        {
          ingredient: 'salt',
          key: 'purge-salt',
          quantity: 50,
          unit: 'g',
          note: t('for the purging water', 'pentru apa sărată'),
        },
        { ingredient: 'spaghetti', quantity: 400, unit: 'g' },
        {
          ingredient: 'still-water',
          quantity: 4,
          unit: 'l',
          note: t('for the pasta pot', 'pentru oala de paste'),
        },
        {
          ingredient: 'salt',
          quantity: 30,
          unit: 'g',
          note: t(
            'for the cooking water, a little less than usual because the clams are salty',
            'pentru apa de fiert, puțin mai puțină decât de obicei, fiindcă scoicile sunt sărate',
          ),
        },
        {
          ingredient: 'olive-oil',
          quantity: 80,
          unit: 'ml',
          note: t('for the pan', 'pentru tigaie'),
        },
        {
          ingredient: 'garlic',
          quantity: 30,
          unit: 'g',
          note: t(
            'about 6 cloves, sliced thinly',
            'aproximativ 6 căței, tăiați subțire',
          ),
        },
        {
          ingredient: 'dried-red-chillies',
          quantity: 3,
          unit: 'g',
          optional: true,
          note: t(
            'about 2 chillies, crumbled',
            'aproximativ 2 ardei, fărâmițați',
          ),
        },
        { ingredient: 'white-wine', quantity: 120, unit: 'ml' },
        {
          ingredient: 'parsley',
          quantity: 20,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        {
          ingredient: 'olive-oil',
          key: 'finishing-oil',
          quantity: 15,
          unit: 'ml',
          note: t('raw, to finish', 'crud, la final'),
        },
      ],
      steps: [
        {
          key: 'purge',
          text: t(
            'Dissolve the 50 g of salt in the 1.5 litres of cold water in a large bowl. Add the clams in a single layer and leave them in the fridge for 1 hour, so they spit out their sand.',
            'Dizolvă cei 50 g de sare în cei 1,5 litri de apă rece, într-un castron mare. Adaugă scoicile într-un singur strat și lasă-le la frigider 1 oră, ca să elimine nisipul.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'inspect',
          text: t(
            'Lift the clams out by hand without tipping the bowl, because the sand is on the bottom. Scrub the shells under cold running water and throw away any that are cracked or broken. Tap each open clam on the counter and wait a minute: if it does not close, it is dead, so discard it. Then wash your hands, the bowl and the board.',
            'Scoate scoicile cu mâna, fără să răstorni castronul, fiindcă nisipul s-a adunat pe fund. Freacă cochiliile sub jet de apă rece și aruncă-le pe cele crăpate sau sparte. Lovește ușor fiecare scoică deschisă de blat și așteaptă un minut: dacă nu se închide, e moartă, așa că aruncă-o. Apoi spală-ți mâinile, castronul și tocătorul.',
          ),
        },
        {
          key: 'boil',
          text: t(
            'Bring 4 litres of water to a rolling boil in a large pot with the lid on, then add the 30 g of salt. Slice the garlic, crumble the chillies and chop the parsley while it heats.',
            'Adu 4 litri de apă la fiert puternic într-o oală mare, cu capacul pus, apoi adaugă cei 30 g de sare. Cât se încălzește, taie usturoiul, fărâmițează ardeii iuți și toacă pătrunjelul.',
          ),
        },
        {
          key: 'spaghetti',
          text: t(
            'Add the spaghetti and stir in the first minute. Cook until 2 to 3 minutes short of the packet time, usually about 8 minutes, because it finishes in the sauce.',
            'Adaugă spaghetele și amestecă în primul minut. Fierbe-le până cu 2-3 minute înainte de timpul de pe pachet, de obicei cam 8 minute, fiindcă se termină de gătit în sos.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'garlic',
          text: t(
            'When the spaghetti goes into the water, put the 80 ml of oil, the garlic and the chillies in a cold, wide, deep pan with a lid (28 to 30 cm). Warm over low heat for 3 to 4 minutes, stirring, until the garlic is pale gold at the edges. Do not let it brown.',
            'Când pui spaghetele în apă, pune cei 80 ml de ulei, usturoiul și ardeii iuți într-o tigaie largă și adâncă, cu capac (28-30 cm), rece. Încălzește-le pe foc mic 3-4 minute, amestecând, până când usturoiul devine auriu-pal la margini. Nu-l lăsa să se rumenească.',
          ),
          timerSeconds: 210,
        },
        {
          key: 'steam',
          text: t(
            'Turn the heat to high. Standing back, because wet clams and wine spit in hot oil, add the clams and the wine and cover at once. Cook for 3 to 4 minutes, shaking the pan now and then, until the shells open wide.',
            'Dă focul la maxim. Ține-te la distanță, fiindcă scoicile ude și vinul stropesc în uleiul fierbinte, adaugă scoicile și vinul și acoperă imediat. Gătește 3-4 minute, scuturând din când în când tigaia, până când cochiliile se deschid larg.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'sort',
          text: t(
            'Lift the open clams out with tongs into a clean bowl, not the one they were purged in. Leave any still-shut clams covered for up to 2 more minutes; throw away every clam that stays shut and never force one open. Keep the clam juices in the pan.',
            'Scoate scoicile deschise cu cleștele într-un castron curat, nu în cel în care au stat în apă sărată. Lasă acoperite încă cel mult 2 minute scoicile care sunt tot închise; aruncă orice scoică rămasă închisă și nu forța niciodată una să se deschidă. Păstrează zeama de scoici în tigaie.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'reserve',
          text: t(
            'As soon as the spaghetti timer ends, scoop out a mug (about 250 ml) of the cooking water, then drain the spaghetti and do not rinse it, even if you are still sorting clams.',
            'Imediat ce se termină timpul spaghetelor, ia cu o cană (cam 250 ml) din apa de fiert, apoi scurge spaghetele și nu le clăti, chiar dacă încă sortezi scoicile.',
          ),
        },
        {
          key: 'toss',
          text: t(
            'Put the pan with the clam juices over high heat, add the spaghetti and 60 ml of the cooking water and toss for 1 to 2 minutes, until the sauce turns glossy and clings to the spaghetti. Add more water a spoonful at a time if it is dry.',
            'Pune tigaia cu zeama de scoici pe foc mare, adaugă spaghetele și 60 ml din apa de fiert și amestecă 1-2 minute, până când sosul devine lucios și se prinde de spaghete. Dacă e prea uscat, mai adaugă apă, câte o lingură.',
          ),
          timerSeconds: 90,
        },
        {
          key: 'finish',
          text: t(
            'Return the clams and add the parsley and the 15 ml of raw olive oil. Toss for 30 seconds until everything is steaming hot. Taste before adding any salt, because the clam juices are already salty. Serve at once, with an empty bowl on the table for the shells.',
            'Pune scoicile la loc și adaugă pătrunjelul și cei 15 ml de ulei de măsline crud. Amestecă 30 de secunde, până când totul e fierbinte, cu aburi. Gustă înainte să adaugi sare, fiindcă zeama de scoici e deja sărată. Servește imediat, cu un castron gol pe masă pentru cochilii.',
          ),
          timerSeconds: 30,
        },
      ],
      tips: [
        t(
          'Buy live clams from a fishmonger you trust, keep them in the fridge in a bowl covered with a damp cloth, not in water or a sealed bag, and cook them the day you buy them. Handle raw clams apart from cooked food: wash your hands, the board and anything they touched, and never put cooked clams back in the bowl they were purged in. Anyone who is pregnant, elderly, very young or has a weak immune system should eat shellfish only when fully cooked, as here.',
          'Cumpără scoici vii de la o pescărie în care ai încredere, ține-le la frigider într-un castron acoperit cu o cârpă umedă, nu în apă și nici într-o pungă închisă, și gătește-le în ziua în care le cumperi. Ține scoicile crude departe de mâncarea gătită: spală-ți mâinile, tocătorul și tot ce a atins scoicile și nu pune niciodată scoicile gătite înapoi în castronul în care au stat în apă sărată. Femeile însărcinate, vârstnicii, copiii mici și cei cu imunitate scăzută ar trebui să mănânce fructe de mare doar bine gătite, ca aici.',
        ),
        t(
          'Leftovers: this dish is best eaten straight away. If some is left, take the shells out, put it in the fridge within 2 hours in a covered container and eat it the next day at the latest. Reheat it once, until steaming hot all the way through, and throw away anything that smells off.',
          'Resturi: preparatul e cel mai bun mâncat pe loc. Dacă rămâne, scoate cochiliile, pune-l la frigider în cel mult 2 ore, într-un recipient acoperit, și mănâncă-l cel târziu a doua zi. Reîncălzește-l o singură dată, până e fierbinte pe tot parcursul, și aruncă tot ce miroase ciudat.',
        ),
      ],
      stepTips: [
        {
          step: 'purge',
          text: t(
            'Use cold water that is about as salty as the sea (roughly 30 g of salt per litre), not tap water on its own: clams purge best in water like the sea they come from. Keep them in one layer so the sand they release does not settle back in.',
            'Folosește apă rece, cam la fel de sărată ca marea (aproximativ 30 g de sare la litru), nu doar apă de la robinet: scoicile elimină nisipul cel mai bine în apă ca cea din care provin. Ține-le într-un singur strat ca nisipul eliminat să nu se întoarcă în ele.',
          ),
        },
        {
          step: 'steam',
          text: t(
            'Keep the lid on and the heat high: the steam opens all the clams at about the same moment, and the sooner they open the less likely they are to turn rubbery.',
            'Ține capacul pus și focul mare: aburul deschide toate scoicile aproape deodată, iar cu cât se deschid mai repede, cu atât e mai puțin probabil să devină gumoase.',
          ),
        },
      ],
      nutritionNote: t(
        'Clams add protein and the olive oil is mostly unsaturated fat, which makes this a more balanced plate than plain aglio e olio. It is still short on fibre, the clam juice and salted water make it salty, and shellfish is a common allergen.',
        'Scoicile aduc proteine, iar uleiul de măsline are mai ales grăsimi nesaturate, așa că farfuria e mai echilibrată decât la aglio e olio simplu. Tot are puține fibre, zeama de scoici și apa sărată o fac sărată, iar fructele de mare sunt un alergen frecvent.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Crusty sourdough', 'Pâine cu maia, cu crustă'),
          reason: t(
            'Tear it to mop up the clam juices left in the bowl.',
            'Rupe-o și șterge cu ea zeama de scoici rămasă în farfurie.',
          ),
          principle: 'complement_flavour',
          ingredient: 'sourdough',
        },
        {
          kind: 'food',
          label: t('Lemon wedges', 'Felii de lămâie'),
          reason: t(
            'A squeeze brightens the sweet shellfish and cuts the oil.',
            'Câteva picături de lămâie înviorează gustul dulceag al scoicilor și taie uleiul.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'lemon',
        },
        {
          kind: 'food',
          label: t('Rocket salad', 'Salată de rucola'),
          reason: t(
            'Peppery leaves give a fresh, bitter contrast to the soft pasta and clams.',
            'Frunzele piperate dau un contrast proaspăt și amărui față de pastele și scoicile moi.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'rocket',
        },
        {
          kind: 'drink',
          label: t('Sparkling water', 'Apă minerală'),
          reason: t(
            'Clean bubbles refresh the mouth between salty, garlicky forkfuls.',
            'Bulele curate împrospătează gura între îmbucăturile sărate, cu usturoi.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'sparkling-water',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Protein from the clams makes a filling but not heavy lunch.',
            'Proteinele din scoici fac un prânz care satură, fără să fie greu.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'good_for',
          reason: t(
            'Light enough for a late supper.',
            'E destul de ușoară pentru o cină târzie.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Briny, light and quick, so it suits warm weather.',
            'Sărat-marin, ușor și rapid, deci se potrivește vremii calde.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Oil, garlic and shellfish are best left to settle before exercise.',
            'Uleiul, usturoiul și fructele de mare trebuie lăsate să se așeze înainte de efort.',
          ),
        },
      ],
    },
    {
      slug: 'spaghetti-aglio-olio-chinese',
      cuisine: 'chinese',
      hideBaseTips: [0, 1, 2],
      title: t(
        'Shanghai scallion oil noodles (cong you ban mian)',
        'Tăiței cu ulei de ceapă verde, ca la Shanghai (cong you ban mian)',
      ),
      servings: 2,
      prepMinutes: 15,
      cookMinutes: 20,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'chinese-wheat-noodles',
          quantity: 200,
          unit: 'g',
          note: t('thin, dried', 'subțiri, uscați'),
        },
        {
          ingredient: 'still-water',
          quantity: 2,
          unit: 'l',
          note: t('for the noodle pot', 'pentru oala de tăiței'),
        },
        {
          ingredient: 'spring-onion',
          quantity: 120,
          unit: 'g',
          note: t(
            'about 8, washed and dried well, cut into 5 to 6 cm lengths',
            'aproximativ 8, spălate și uscate bine, tăiate în bucăți de 5-6 cm',
          ),
        },
        {
          ingredient: 'sunflower-oil',
          quantity: 80,
          unit: 'ml',
        },
        {
          ingredient: 'dried-shrimp',
          quantity: 10,
          unit: 'g',
          optional: true,
          note: t(
            'soaked in warm water for 10 minutes, drained and patted dry',
            'înmuiați 10 minute în apă caldă, scurși și uscați cu un prosop',
          ),
        },
        { ingredient: 'soy-sauce', quantity: 30, unit: 'ml' },
        { ingredient: 'dark-soy-sauce', quantity: 10, unit: 'ml' },
        { ingredient: 'sugar', quantity: 8, unit: 'g' },
      ],
      steps: [
        {
          key: 'soak',
          text: t(
            'If you are using the dried shrimp, cover them with warm water and leave them for 10 minutes.',
            'Dacă folosești creveții uscați, acoperă-i cu apă caldă și lasă-i 10 minute.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'cut',
          text: t(
            'Wash the spring onions and dry them thoroughly, since wet pieces spit in hot oil. Cut them into 5 to 6 cm lengths and keep the white parts apart from the green. Drain and pat dry the shrimp.',
            'Spală ceapa verde și usuc-o foarte bine, fiindcă bucățile ude stropesc în uleiul încins. Taie-o în bucăți de 5-6 cm și ține părțile albe separat de cele verzi. Scurge creveții și usucă-i cu un prosop.',
          ),
        },
        {
          key: 'fry-whites',
          text: t(
            'Put the oil and the white parts in a cold wok or wide pan and set over medium-low heat. Fry gently for about 5 minutes, stirring now and then. Never leave the pan, and turn the heat down if the oil smokes.',
            'Pune uleiul și părțile albe într-un wok sau o tigaie largă, reci, și așază pe foc mic spre mediu. Prăjește încet circa 5 minute, amestecând din când în când. Nu pleca de lângă tigaie și dă focul mai mic dacă uleiul scoate fum.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'fry-greens',
          text: t(
            'Add the green parts and fry for about 7 more minutes, stirring, until everything is deep brown and crisp, but not black. At the same time, bring 2 litres of water to the boil in a pot for the noodles.',
            'Adaugă părțile verzi și prăjește încă vreo 7 minute, amestecând, până când totul e brun-închis și crocant, dar nu ars. În același timp, adu la fiert 2 litri de apă într-o oală pentru tăiței.',
          ),
          timerSeconds: 420,
        },
        {
          key: 'lift',
          text: t(
            'Lift the spring onion out with a slotted spoon onto a plate lined with kitchen paper and leave the oil in the pan. If you are using the shrimp, fry them in that oil for 30 seconds, until they smell toasty, then lift them out as well.',
            'Scoate ceapa verde cu o lingură cu găuri pe o farfurie tapetată cu hârtie de bucătărie și lasă uleiul în tigaie. Dacă folosești creveții, prăjește-i în acel ulei 30 de secunde, până miros a prăjit, apoi scoate-i și pe ei.',
          ),
          timerSeconds: 30,
        },
        {
          key: 'sauce',
          text: t(
            'Take the pan off the heat and let it cool for 1 minute. Standing back, pour in the soy sauce, dark soy sauce and sugar: it will bubble up and spit. Return to low heat and simmer for 1 minute, until the sugar dissolves.',
            'Ia tigaia de pe foc și lasă-o să se răcorească 1 minut. Ține-te la distanță și toarnă sosul de soia, sosul de soia închis și zahărul: face spumă și stropește. Pune tigaia înapoi pe foc mic și fierbe 1 minut, până se topește zahărul.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'noodles',
          text: t(
            'Cook the noodles in the boiling water as the packet says, usually 2 to 4 minutes, until tender with a slight bite. Drain well and shake off the water.',
            'Fierbe tăițeii în apa clocotită după instrucțiunile de pe pachet, de obicei 2-4 minute, până sunt fragezi, dar cu un ușor miez. Scurge-i bine și scutură apa.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'toss',
          text: t(
            'Divide the noodles between 2 bowls. Spoon 3 tablespoons of the hot oil sauce over each bowl and toss until every strand is coated. Top with the crisp spring onion and the shrimp, if using, and serve at once.',
            'Împarte tăițeii în 2 boluri. Pune peste fiecare bol câte 3 linguri din sosul de ulei fierbinte și amestecă până când fiecare fir e acoperit. Pune deasupra ceapa verde crocantă și creveții, dacă îi folosești, și servește imediat.',
          ),
        },
      ],
      tips: [
        t(
          'If you keep any scallion oil, strain out every piece of spring onion, let the oil cool within 2 hours and store it in a clean, lidded jar in the fridge for up to 4 days. Never keep garlic or spring onion in oil at room temperature: it is a botulism risk. Keep the crisp spring onion out of the oil and eat it the same day.',
          'Dacă păstrezi puțin ulei de ceapă verde, scoate din el toate bucățile de ceapă, lasă-l să se răcească în cel mult 2 ore și ține-l într-un borcan curat, cu capac, la frigider, cel mult 4 zile. Nu ține niciodată usturoi sau ceapă verde în ulei la temperatura camerei: există risc de botulism. Ceapa verde crocantă păstreaz-o separat de ulei și mănâncă-o în aceeași zi.',
        ),
        t(
          'Stop frying as soon as the spring onion turns deep brown. A shade darker and it goes bitter, like burnt garlic, and flavours the whole oil.',
          'Oprește prăjitul de îndată ce ceapa verde devine brun-închis. Încă o nuanță și se amărește, ca usturoiul ars, și dă gust întregului ulei.',
        ),
        t(
          'Leftover noodles: put them in the fridge within 2 hours, covered, eat them within 1 day and reheat once until steaming hot all the way through. They go soft and clump, so loosen them with a splash of hot water.',
          'Dacă rămân tăiței: pune-i la frigider în cel mult 2 ore, acoperiți, mănâncă-i în maximum 1 zi și reîncălzește-i o singură dată, până sunt fierbinți pe tot parcursul. Se înmoaie și se lipesc, așa că desfă-i cu un strop de apă fierbinte.',
        ),
      ],
      stepTips: [
        {
          step: 'fry-whites',
          text: t(
            'Start in cold oil over medium-low heat. The spring onion should sizzle gently and give up its water slowly. Too much heat browns the outside before the inside dries out, and the pieces turn limp instead of crisp.',
            'Începe cu ulei rece pe foc mic spre mediu. Ceapa verde trebuie să sfârâie încet și să-și piardă apa treptat. Dacă focul e prea mare, se rumenește pe dinafară înainte să se usuce înăuntru, iar bucățile ies moi, nu crocante.',
          ),
        },
      ],
      nutritionNote: t(
        'Sunflower oil is mostly unsaturated fat, and the spring onion adds flavour more than nutrients, but these noodles are refined wheat with little protein or fibre, and the soy sauce is very salty. Add greens or an egg, and use less of the oil sauce if you watch fat and salt.',
        'Uleiul de floarea-soarelui are mai ales grăsimi nesaturate, iar ceapa verde aduce mai ales aromă, dar tăițeii sunt din grâu rafinat, cu puține proteine și fibre, iar sosul de soia e foarte sărat. Adaugă legume verzi sau un ou și folosește mai puțin sos de ulei dacă îți urmărești aportul de grăsimi și sare.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Smashed cucumber salad', 'Salată de castraveți striviți'),
          reason: t(
            'Cool, crunchy cucumber contrasts with the soft, rich noodles.',
            'Castravetele rece și crocant face contrast cu tăițeii moi și bogați.',
          ),
          principle: 'contrast_texture',
          ingredient: 'cucumber',
        },
        {
          kind: 'drink',
          label: t('Green tea', 'Ceai verde'),
          reason: t(
            'Light bitterness cleans the mouth after the oil and soy.',
            'Amăreala ușoară curăță gura după ulei și soia.',
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
            'Ready in about 35 minutes with few ingredients.',
            'E gata în vreo 35 de minute, cu puține ingrediente.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'good_for',
          reason: t(
            'A simple bowl that is quick to make when you are hungry late.',
            'Un bol simplu, care se face repede când ți-e foame seara târziu.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Oil-coated noodles sit heavy in the stomach during hard exercise.',
            'Tăițeii îmbrăcați în ulei cad greu la stomac în timpul unui efort intens.',
          ),
        },
      ],
    },
  ],
};
