import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Mac and cheese base is the stovetop one: macaroni folded through a
// béchamel with mature cheddar melted in. Each Variant is a full Recipe with
// its own lines, steps and guidance; the base's Recipe-level Tips are inherited
// unless a Variant hides them.
export const macAndCheese: BaseRecipeSeed = {
  slug: 'mac-and-cheese',
  title: t(
    'Macaroni and cheese',
    'Macaroane cu sos de brânză (mac and cheese)',
  ),
  servings: 4,
  prepMinutes: 10,
  cookMinutes: 22,
  difficulty: 'easy',
  lines: [
    { ingredient: 'macaroni', quantity: 350, unit: 'g' },
    {
      ingredient: 'butter',
      quantity: 50,
      unit: 'g',
    },
    { ingredient: 'flour', quantity: 50, unit: 'g' },
    { ingredient: 'milk', quantity: 0.7, unit: 'l' },
    {
      ingredient: 'cheddar',
      quantity: 250,
      unit: 'g',
      note: t('mature, coarsely grated', 'maturat, ras pe răzătoarea mare'),
    },
    { ingredient: 'mustard-powder', quantity: 3, unit: 'g' },
    { ingredient: 'nutmeg', quantity: 0.5, unit: 'g', optional: true },
    {
      ingredient: 'salt',
      key: 'salt-water',
      quantity: 15,
      unit: 'g',
      note: t('for the pasta water', 'pentru apa de fiert'),
    },
    {
      ingredient: 'salt',
      key: 'salt-sauce',
      quantity: 2,
      unit: 'g',
      note: t('for the sauce', 'pentru sos'),
    },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
  ],
  steps: [
    {
      key: 'water',
      text: t(
        'Fill a large pot with about 2.5 litres of water, add the 15 g of salt and put it on to boil while you make the sauce.',
        'Pune într-o oală mare circa 2,5 litri de apă, adaugă cele 15 g de sare și lasă-o la fiert cât faci sosul.',
      ),
    },
    {
      key: 'roux',
      text: t(
        'Melt the butter in a medium saucepan over medium-low heat. Stir in the flour and cook for 1 minute, stirring, until it looks like wet sand and smells slightly nutty. Do not let it brown.',
        'Topește untul într-o cratiță medie la foc mic-mediu. Adaugă făina și gătește un minut, amestecând, până arată ca nisipul umed și miroase ușor a nucă. Nu o lăsa să se rumenească.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'milk',
      text: t(
        'Pour in about a quarter of the milk and whisk to a thick, smooth paste. Add the rest in three or four goes, whisking each time until smooth before adding more.',
        'Toarnă aproximativ un sfert din lapte și amestecă cu un tel până obții o pastă groasă și fină. Adaugă restul în trei-patru reprize, amestecând de fiecare dată până se omogenizează.',
      ),
    },
    {
      key: 'thicken',
      text: t(
        'Bring the sauce to a gentle simmer and cook for 5 minutes, stirring often and scraping the corners, until it coats the back of a spoon and a finger drawn across leaves a clear line.',
        'Adu sosul la un clocot slab și gătește-l 5 minute, amestecând des și răzuind colțurile, până acoperă dosul lingurii și un deget tras peste el lasă o dungă clară.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'pasta',
      text: t(
        'When the water is at a full boil, add the macaroni and cook for 2 minutes less than the packet says, usually about 7 minutes, so they are still firm in the middle. Take the sauce off the heat.',
        'Când apa fierbe puternic, adaugă macaroanele și fierbe-le cu 2 minute mai puțin decât scrie pe pachet, de obicei circa 7 minute, ca să rămână ferme în mijloc. Ia sosul de pe foc.',
      ),
      timerSeconds: 420,
    },
    {
      key: 'cheese',
      text: t(
        'While the pasta cooks, stir the mustard powder, nutmeg, 2 g of salt and the pepper into the sauce. Add the cheddar a handful at a time, stirring until each one has melted and the sauce is smooth and glossy.',
        'Cât fierb macaroanele, amestecă în sos muștarul pudră, nucșoara, cele 2 g de sare și piperul. Adaugă cheddarul câte o mână, amestecând până se topește complet și sosul devine fin și lucios.',
      ),
    },
    {
      key: 'combine',
      text: t(
        'Drain the macaroni, keeping a mugful of the cooking water. Tip them into the sauce and fold until every piece is coated. Loosen with a splash of the cooking water if the sauce is too thick, and serve straight away.',
        'Scurge macaroanele, păstrând o cană din apa de fiert. Pune-le în sos și amestecă până se învelesc bine. Dacă sosul e prea gros, subțiaz-l cu puțină apă de fiert și servește imediat.',
      ),
    },
  ],
  tips: [
    t(
      'Grate the cheddar yourself from a block. Pre-grated cheese is coated with starch to stop it clumping, which can leave the sauce slightly grainy.',
      'Rade cheddarul chiar tu, dintr-un bloc. Brânza rasă gata e tratată cu amidon ca să nu se lipească, iar sosul poate ieși ușor granulat.',
    ),
    t(
      'Melt the cheese in off the heat. Cheddar in a boiling sauce turns stringy and greasy, while in a hot but not bubbling sauce it melts smooth.',
      'Topește brânza de pe foc. Cheddarul într-un sos care fierbe devine firos și gras, pe când într-un sos fierbinte, dar fără clocot, se topește fin.',
    ),
    t(
      'Cool leftovers within 2 hours and keep them in the fridge for up to 3 days. Reheat gently with a splash of milk until steaming hot all the way through.',
      'Răcește rămășițele în maximum 2 ore și ține-le la frigider până la 3 zile. Încălzește-le încet, cu puțin lapte, până sunt fierbinți în tot conținutul.',
    ),
  ],
  stepTips: [
    {
      step: 'milk',
      text: t(
        'Start with a small splash of milk and whisk it into a paste before adding more. Adding it all at once is what makes a lumpy sauce.',
        'Începe cu puțin lapte, amestecat într-o pastă, și abia apoi adaugă restul. Laptele turnat deodată e cel care face sosul cu cocoloașe.',
      ),
    },
    {
      step: 'pasta',
      text: t(
        'Pull the macaroni while they still have a bite. They carry on softening in the hot sauce, and fully cooked ones end up mushy.',
        'Scoate macaroanele cât mai au rezistență la mușcat. Se înmoaie în continuare în sosul fierbinte, iar cele fierte complet ajung moi și lipicioase.',
      ),
    },
  ],
  nutritionNote: t(
    'Filling, and the cheese and milk give protein and calcium. It is also high in saturated fat and salt from the butter and cheddar, and the white pasta adds little fibre. Serve a smaller portion with greens, such as broccoli or a salad.',
    'Săturătoare, iar brânza și laptele aduc proteine și calciu. Are însă multe grăsimi saturate și multă sare din unt și cheddar, iar pastele albe aduc puține fibre. Servește o porție mai mică, cu verdețuri, de exemplu broccoli sau o salată.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Steamed broccoli', 'Broccoli la aburi'),
      reason: t(
        'A fresh, slightly bitter green next to a rich sauce, and it adds the fibre the dish lacks.',
        'O verdeață proaspătă, ușor amăruie, lângă un sos bogat, care aduce fibrele ce lipsesc din fel.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'broccoli',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sharp acidity cuts through the cheese and butter.',
        'Aciditatea lor ascuțită taie din bogăția brânzei și a untului.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'food',
      label: t('Crisp bacon', 'Bacon crocant'),
      reason: t(
        'Salty, smoky crunch against the soft, creamy pasta.',
        'Un crocant sărat și afumat lângă pastele moi și cremoase.',
      ),
      principle: 'contrast_texture',
      ingredient: 'bacon',
    },
    {
      kind: 'food',
      label: t('Mixed green salad', 'Salată de frunze verzi'),
      reason: t(
        'A lightly dressed, crisp salad refreshes the palate between creamy forkfuls.',
        'O salată crocantă, cu dressing ușor, împrospătează gustul între îmbucăturile cremoase.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'mixed-salad',
    },
    {
      kind: 'drink',
      label: t('Cold lager', 'Bere blondă rece'),
      reason: t(
        'The bubbles and light bitterness clear the richness from the mouth.',
        'Bulele și amăreala ușoară curăță gura de senzația grasă.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'beer',
    },
    {
      kind: 'drink',
      label: t('Sparkling water with lemon', 'Apă minerală cu lămâie'),
      reason: t(
        'A light, acidic drink that keeps a creamy plate from feeling heavy.',
        'O băutură ușoară și acidulată, care nu lasă farfuria cremoasă să cadă greu.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'sparkling-water',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'Hot, creamy and filling when it is cold outside.',
        'Fierbinte, cremos și săturător când e frig afară.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Pasta gives carbohydrates and the cheese and milk give protein for recovery.',
        'Pastele aduc carbohidrați, iar brânza și laptele aduc proteine pentru refacere.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'A hot, rich dish is heavy when it is already warm outside.',
        'Un fel fierbinte și bogat cade greu când e deja cald afară.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'The fat and cheese sit heavy in the stomach during hard exercise.',
        'Grăsimile și brânza cad greu la stomac în timpul unui efort intens.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A big portion of cheese and butter late at night can sit heavy before bed.',
        'O porție mare de brânză și unt seara târziu poate cădea greu înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'mac-and-cheese-romanian',
      cuisine: 'romanian',
      title: t(
        'Romanian baked macaroni with cottage cheese and telemea',
        'Macaroane cu brânză la cuptor',
      ),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 60,
      difficulty: 'easy',
      hideBaseTips: [0, 1, 2],
      lines: [
        { ingredient: 'macaroni', quantity: 300, unit: 'g' },
        {
          ingredient: 'cottage-cheese',
          quantity: 400,
          unit: 'g',
          note: t('drained if watery', 'scursă, dacă are zer'),
        },
        {
          ingredient: 'telemea',
          quantity: 200,
          unit: 'g',
          note: t('crumbled', 'mărunțită cu mâna'),
        },
        { ingredient: 'eggs', quantity: 4, unit: 'pcs' },
        { ingredient: 'sour-cream', quantity: 200, unit: 'g' },
        {
          ingredient: 'butter',
          quantity: 30,
          unit: 'g',
          note: t('for the dish and the top', 'pentru tavă și deasupra'),
        },
        {
          ingredient: 'dill',
          quantity: 15,
          unit: 'g',
          optional: true,
          note: t('finely chopped', 'tocat mărunt'),
        },
        {
          ingredient: 'salt',
          key: 'salt-water',
          quantity: 12,
          unit: 'g',
          note: t('for the pasta water', 'pentru apa de fiert'),
        },
        {
          ingredient: 'salt',
          key: 'salt-filling',
          quantity: 1,
          unit: 'g',
          optional: true,
          note: t(
            'only if the telemea is mild',
            'doar dacă telemeaua e slabă de sare',
          ),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 180 °C (170 °C fan). Put a pot of about 2 litres of water with the 12 g of salt on to boil.',
            'Încinge cuptorul la 180 °C (170 °C cu ventilator). Pune la fiert o oală cu circa 2 litri de apă și cele 12 g de sare.',
          ),
        },
        {
          key: 'pasta',
          text: t(
            'Boil the macaroni for 1 minute less than the packet says, about 8 minutes, so they stay a little firm. Drain well.',
            'Fierbe macaroanele cu un minut mai puțin decât scrie pe pachet, circa 8 minute, ca să rămână puțin ferme. Scurge-le bine.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'filling',
          text: t(
            'While the pasta cooks, beat the eggs in a large bowl with 150 g of the sour cream and the pepper. Stir in the cottage cheese, 150 g of the crumbled telemea and the dill.',
            'Cât fierb macaroanele, bate ouăle într-un castron mare cu 150 g din smântână și cu piperul. Adaugă brânza de vaci, 150 g din telemeaua mărunțită și mărarul.',
          ),
        },
        {
          key: 'mix',
          text: t(
            'Fold the drained macaroni into the filling. Add a pinch of salt only if the telemea you tasted earlier was mild.',
            'Amestecă macaroanele scurse cu compoziția. Adaugă un praf de sare doar dacă telemeaua gustată mai devreme a fost slabă de sare.',
          ),
        },
        {
          key: 'dish',
          text: t(
            'Grease a 22 by 30 cm baking dish with half of the butter and pour in the mixture. Spread the last 50 g of sour cream on top, scatter over the remaining 50 g of telemea and dot with the rest of the butter.',
            'Unge cu jumătate din unt o tavă de 22 pe 30 cm și toarnă compoziția. Întinde deasupra ultimele 50 g de smântână, presară restul de 50 g de telemea și pune bucățele din untul rămas.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 40 minutes, until golden at the edges and the egg is fully set: the middle should not wobble, and a knife pushed into the centre should come out clean with no liquid egg.',
            'Coace 40 de minute, până se rumenește pe margini și compoziția s-a legat complet: mijlocul nu mai tremură, iar un cuțit înfipt în mijloc iese curat, fără ou crud.',
          ),
          timerSeconds: 2400,
        },
        {
          key: 'rest',
          text: t(
            'Leave the dish to rest for 10 minutes so it firms up, then cut into squares and serve warm.',
            'Lasă macaroanele 10 minute în tavă, ca să se lege, apoi taie-le în pătrate și servește-le calde.',
          ),
          timerSeconds: 600,
        },
      ],
      tips: [
        t(
          'Cool leftovers within 2 hours and keep them covered in the fridge for up to 3 days. Reheat the squares covered in a 160 °C oven until hot all the way through.',
          'Răcește rămășițele în maximum 2 ore și ține-le acoperite la frigider până la 3 zile. Încălzește pătratele acoperite, în cuptor la 160 °C, până sunt fierbinți în tot conținutul.',
        ),
        t(
          'Telemea varies a lot in saltiness. Taste a crumb before you mix (never taste the mix itself, it holds raw egg), and soak a very salty one in cold water for 10 minutes.',
          'Telemeaua diferă mult de la una la alta: unele sunt foarte sărate. Gustă o fărâmă înainte să amesteci (compoziția în sine nu o gusta, are ou crud) și, dacă e foarte sărată, ține-o 10 minute în apă rece.',
        ),
      ],
      stepTips: [
        {
          step: 'filling',
          text: t(
            'If the cottage cheese sits in a pool of whey, drain it in a sieve first. Otherwise the bake comes out watery.',
            'Dacă brânza de vaci stă în zer, scurge-o întâi printr-o strecurătoare. Altfel, macaroanele ies apoase.',
          ),
        },
      ],
      nutritionNote: t(
        'A good amount of protein and calcium from the cottage cheese, telemea and eggs, and it fills you up. Telemea makes it salty, the sour cream and butter add saturated fat, and there are no vegetables, so serve it with pickles or a tomato salad.',
        'Multe proteine și calciu din brânza de vaci, telemea și ouă, și te satură. Telemeaua o face sărată, iar smântâna și untul aduc grăsimi saturate; nu are legume, așa că servește-o cu murături sau cu salată de roșii.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Pickled vegetables', 'Murături asortate'),
          reason: t(
            'Their acidity and crunch cut through the creamy, baked cheese.',
            'Aciditatea și crocantul lor taie din bogăția brânzei coapte.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-mixed-vegetables',
        },
        {
          kind: 'food',
          label: t('Sliced tomatoes', 'Roșii tăiate felii'),
          reason: t(
            'Fresh, juicy tomato lifts the salty, creamy bake.',
            'Roșiile proaspete și zemoase înviorează coptul sărat și cremos.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'tomato',
        },
        {
          kind: 'drink',
          label: t('Sparkling water', 'Apă minerală'),
          reason: t(
            'Bubbles clear the salty richness from the mouth.',
            'Bulele curăță gura de gustul sărat și gras.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'sparkling-water',
        },
      ],
      eatingMoments: [
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'Cut in squares, it is a filling savoury bake that is easy to share.',
            'Tăiată în pătrate, e o budincă sărată, săturătoare, ușor de împărțit.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Warm from the oven and filling when it is cold outside.',
            'Caldă din cuptor și săturătoare când e frig afară.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'Turning the oven on for an hour and eating a heavy dish is a poor fit for a hot day.',
            'Cuptorul pornit o oră și un fel greu nu se potrivesc într-o zi caldă.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Salty and heavy, it can sit on the stomach before bed.',
            'Sărată și grea, poate rămâne pe stomac înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'mac-and-cheese-american',
      cuisine: 'american',
      title: t(
        'Southern baked macaroni and cheese',
        'Macaroane cu cheddar la cuptor, ca în sudul SUA',
      ),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 50,
      difficulty: 'easy',
      hideBaseTips: [1, 2],
      lines: [
        { ingredient: 'macaroni', quantity: 350, unit: 'g' },
        {
          ingredient: 'cheddar',
          quantity: 350,
          unit: 'g',
          note: t('sharp, coarsely grated', 'maturat, ras pe răzătoarea mare'),
        },
        { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
        { ingredient: 'evaporated-milk', quantity: 350, unit: 'g' },
        { ingredient: 'milk', quantity: 0.25, unit: 'l' },
        {
          ingredient: 'butter',
          quantity: 40,
          unit: 'g',
          note: t('melted, for the pasta', 'topit, pentru paste'),
        },
        {
          ingredient: 'butter',
          key: 'butter-dish',
          quantity: 10,
          unit: 'g',
          note: t('for greasing the dish', 'pentru uns tava'),
        },
        { ingredient: 'mustard-powder', quantity: 3, unit: 'g' },
        { ingredient: 'paprika', quantity: 2, unit: 'g', optional: true },
        { ingredient: 'cayenne', quantity: 0.5, unit: 'g', optional: true },
        {
          ingredient: 'salt',
          key: 'salt-water',
          quantity: 15,
          unit: 'g',
          note: t('for the pasta water', 'pentru apa de fiert'),
        },
        {
          ingredient: 'salt',
          key: 'salt-custard',
          quantity: 3,
          unit: 'g',
          note: t('for the custard', 'pentru compoziție'),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 175 °C (160 °C fan). Put a large pot of about 2.5 litres of water with the 15 g of salt on to boil.',
            'Încinge cuptorul la 175 °C (160 °C cu ventilator). Pune la fiert o oală mare cu circa 2,5 litri de apă și cele 15 g de sare.',
          ),
        },
        {
          key: 'pasta',
          text: t(
            'Boil the macaroni for 2 minutes less than the packet says, about 6 minutes, so they are quite firm. They finish cooking in the oven. Drain and tip into a large bowl.',
            'Fierbe macaroanele cu 2 minute mai puțin decât scrie pe pachet, circa 6 minute, ca să fie destul de ferme. Își termină fierberea în cuptor. Scurge-le și pune-le într-un castron mare.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'melt',
          text: t(
            'Melt the 40 g of butter in a small pan over low heat, or in the microwave, and set it aside.',
            'Topește cele 40 g de unt într-o cratiță mică la foc mic sau la cuptorul cu microunde și pune-l deoparte.',
          ),
        },
        {
          key: 'custard',
          text: t(
            'While the pasta cooks, whisk the eggs in a jug with the evaporated milk, milk, mustard powder, cayenne, 3 g of salt and the pepper until smooth.',
            'Cât fierb macaroanele, bate ouăle într-un vas cu laptele concentrat, laptele, muștarul pudră, cayenne, cele 3 g de sare și piperul, până se omogenizează.',
          ),
        },
        {
          key: 'toss',
          text: t(
            'Toss the hot macaroni with the melted butter and 250 g of the cheddar until the cheese starts to melt in.',
            'Amestecă macaroanele fierbinți cu untul topit și cu 250 g din cheddar, până începe să se topească brânza.',
          ),
        },
        {
          key: 'assemble',
          text: t(
            'Grease a 22 by 30 cm baking dish with the 10 g of butter, tip the pasta in and pour the custard over it. Scatter the last 100 g of cheddar on top and dust with the paprika.',
            'Unge cu puțin din untul rămas o tavă de 22 pe 30 cm, pune pastele în ea și toarnă compoziția peste ele. Presară deasupra ultimele 100 g de cheddar și pudrează cu boia.',
          ),
        },
        {
          key: 'bake',
          text: t(
            'Bake for 30 minutes, until the top is golden with darker spots and the edges bubble. The custard must be fully set: the middle should barely wobble and no liquid egg should show when you press the surface.',
            'Coace 30 de minute, până deasupra e aurie, cu pete mai închise, iar marginile bolborosesc. Compoziția trebuie să se fi legat complet: mijlocul abia tremură și nu iese ou lichid când apeși pe suprafață.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'rest',
          text: t(
            'Rest the dish for 10 minutes so the custard firms up enough to cut into clean squares.',
            'Lasă tava să stea 10 minute, ca să se lege compoziția și să poți tăia pătrate curate.',
          ),
          timerSeconds: 600,
        },
      ],
      tips: [
        t(
          'Cool leftovers within 2 hours and keep them covered in the fridge for up to 3 days. Reheat the squares covered in a 160 °C oven until hot all the way through.',
          'Răcește rămășițele în maximum 2 ore și ține-le acoperite la frigider până la 3 zile. Încălzește pătratele acoperite, în cuptor la 160 °C, până sunt fierbinți în tot conținutul.',
        ),
        t(
          'Undercook the pasta here. Soaking up the custard in the oven finishes it, and fully boiled macaroni turns soft and mushy.',
          'Fierbe pastele mai puțin aici. Amestecul din cuptor le termină, iar macaroanele fierte complet ajung moi și lipicioase.',
        ),
      ],
      stepTips: [
        {
          step: 'assemble',
          text: t(
            'Leave a gap of a couple of centimetres between the pasta and the rim of the dish, because the custard puffs up as it bakes.',
            'Lasă câțiva centimetri între paste și marginea tăvii, pentru că amestecul se umflă la copt.',
          ),
        },
      ],
      nutritionNote: t(
        'Plenty of protein and calcium from the cheddar, eggs and milk, and it is very filling. It is also rich in saturated fat and salt from all that cheese and butter, with little fibre, so keep portions modest and add a green vegetable.',
        'Multe proteine și calciu din cheddar, ouă și lapte, și e foarte săturătoare. Are însă multe grăsimi saturate și multă sare din brânză și unt, cu puține fibre, așa că ține porțiile mici și adaugă o legumă verde.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t(
            'Southern buttermilk fried chicken',
            'Pui prăjit în stil sudist, cu zară',
          ),
          reason: t(
            'The two are often served together: crisp, savoury chicken against the soft, creamy pasta.',
            'Cele două se servesc adesea împreună: puiul crocant și condimentat contrastează cu pastele moi și cremoase.',
          ),
          principle: 'contrast_texture',
          recipe: 'fried-chicken-southern',
        },
        {
          kind: 'food',
          label: t('Steamed broccoli', 'Broccoli la aburi'),
          reason: t(
            'A fresh, slightly bitter green next to a very rich bake.',
            'O verdeață proaspătă, ușor amăruie, lângă o coptură foarte bogată.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'broccoli',
        },
        {
          kind: 'food',
          label: t(
            'Crisp cabbage slaw with a tangy dressing',
            'Salată de varză cu dressing acrișor',
          ),
          reason: t(
            'Crunchy cabbage with a tangy dressing cuts the richness of the cheese.',
            'Varza crocantă, cu dressing acrișor, taie din bogăția brânzei.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'cabbage',
        },
        {
          kind: 'drink',
          label: t('Iced tea', 'Ceai rece'),
          reason: t(
            'A cold, lightly bitter drink refreshes between heavy bites.',
            'O băutură rece și ușor amăruie înviorează între îmbucături grele.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'iced-tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, cheesy bake is a comfort on a cold day.',
            'O coptură fierbinte, cu multă brânză, mângâie într-o zi rece.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Carbohydrates from the pasta and protein from the cheese and eggs help recovery.',
            'Carbohidrații din paste și proteinele din brânză și ouă ajută la refacere.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'An hour of oven heat and a very rich dish suit a hot day badly.',
            'O oră de cuptor pornit și un fel foarte bogat nu se potrivesc într-o zi caldă.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'The fat and cheese sit heavy in the stomach during hard exercise.',
            'Grăsimile și brânza cad greu la stomac în timpul unui efort intens.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Very rich food late at night can sit heavy before bed.',
            'Mâncarea foarte bogată seara târziu poate cădea greu înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'mac-and-cheese-one-pot',
      method: 'one-pot',
      title: t(
        'One-pot macaroni and cheese',
        'Macaroane cu brânză într-o singură oală',
      ),
      servings: 4,
      prepMinutes: 5,
      cookMinutes: 20,
      difficulty: 'easy',
      lines: [
        { ingredient: 'macaroni', quantity: 350, unit: 'g' },
        { ingredient: 'milk', quantity: 0.5, unit: 'l' },
        { ingredient: 'still-water', quantity: 0.5, unit: 'l' },
        { ingredient: 'butter', quantity: 30, unit: 'g' },
        {
          ingredient: 'cheddar',
          quantity: 250,
          unit: 'g',
          note: t('mature, coarsely grated', 'maturat, ras pe răzătoarea mare'),
        },
        { ingredient: 'mustard-powder', quantity: 3, unit: 'g' },
        { ingredient: 'salt', quantity: 4, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'combine',
          text: t(
            'Put the dry macaroni, milk, water, butter, salt and mustard powder in a wide, heavy 3 to 4 litre pot.',
            'Pune în aceeași oală lată, cu fund gros, de 3-4 litri, macaroanele nefierte, laptele, apa, untul, sarea și muștarul pudră.',
          ),
        },
        {
          key: 'boil',
          text: t(
            'Set the pot over medium-high heat and bring to a boil, stirring every minute or so and scraping the bottom, about 6 minutes.',
            'Pune oala la foc mare-mediu și adu la fierbere, amestecând din minut în minut și răzuind fundul oalei, circa 6 minute.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Turn the heat down to medium-low and keep it at a lively simmer for 9 minutes, stirring often, until the pasta is tender and the liquid has turned into a thick, creamy sauce that just coats the macaroni.',
            'Dă focul la mic-mediu și ține un clocot viu 9 minute, amestecând des, până când macaroanele sunt moi, iar lichidul s-a făcut un sos gros și cremos, care abia acoperă pastele.',
          ),
          timerSeconds: 540,
        },
        {
          key: 'cheese',
          text: t(
            'Take the pot off the heat. Add the pepper and the cheddar a handful at a time, stirring until each one has melted and the sauce is smooth. Taste, and add salt only if it needs it.',
            'Ia oala de pe foc. Adaugă piperul și cheddarul câte o mână, amestecând până se topește complet și sosul e fin. Gustă și adaugă sare doar dacă mai are nevoie.',
          ),
        },
        {
          key: 'rest',
          text: t(
            'Leave it for 2 minutes with the lid off to thicken a little, stir once more and serve straight away.',
            'Lasă oala 2 minute descoperită, ca sosul să se îngroașe puțin, amestecă încă o dată și servește imediat.',
          ),
          timerSeconds: 120,
        },
      ],
      tips: [
        t(
          'Use a wide pot and keep stirring along the bottom. The starch from the pasta thickens the sauce, and it also catches and scorches easily.',
          'Folosește o oală lată și amestecă mereu pe fund. Amidonul din paste îngroașă sosul, dar se și prinde ușor de fund.',
        ),
      ],
      stepTips: [
        {
          step: 'simmer',
          text: t(
            'If the sauce looks thin at the end of the simmer, keep simmering for a minute or two. If it has gone too thick, loosen it with a splash of milk after the cheese is in.',
            'Dacă sosul pare subțire la sfârșitul fierberii, mai ține-l un minut-două. Dacă s-a îngroșat prea tare, subțiaz-l cu puțin lapte după ce ai pus brânza.',
          ),
        },
      ],
      nutritionNote: t(
        'Quick, filling and a source of protein and calcium from the cheddar and milk. It is also rich in saturated fat and salt, and the pasta is refined with little fibre, so serve a modest portion with vegetables.',
        'Rapidă, săturătoare și cu proteine și calciu din cheddar și lapte. Are însă multe grăsimi saturate și multă sare, iar pastele sunt rafinate, cu puține fibre, așa că servește o porție moderată, alături de legume.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Steamed broccoli', 'Broccoli la aburi'),
          reason: t(
            'A fresh, slightly bitter green next to a rich, creamy sauce.',
            'O verdeață proaspătă, ușor amăruie, lângă un sos bogat și cremos.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'broccoli',
        },
        {
          kind: 'food',
          label: t('Cherry tomatoes', 'Roșii cherry'),
          reason: t(
            'Raw, juicy tomatoes add acidity that cuts the creamy sauce.',
            'Roșiile crude și zemoase aduc aciditate care taie din sosul cremos.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'cherry-tomato',
        },
        {
          kind: 'drink',
          label: t('Sparkling water with lemon', 'Apă minerală cu lămâie'),
          reason: t(
            'A light, acidic drink keeps the creamy plate from feeling heavy.',
            'O băutură ușoară și acidulată nu lasă farfuria cremoasă să cadă greu.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'sparkling-water',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Hot, creamy and ready in 20 minutes when it is cold.',
            'Fierbinte, cremoasă și gata în 20 de minute când e frig.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Quick carbohydrates from the pasta and protein from the cheese and milk.',
            'Carbohidrați rapizi din paste și proteine din brânză și lapte.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'A hot, rich dish is heavy when it is already warm outside.',
            'Un fel fierbinte și bogat cade greu când e deja cald afară.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'The fat and cheese sit heavy in the stomach during hard exercise.',
            'Grăsimile și brânza cad greu la stomac în timpul unui efort intens.',
          ),
        },
      ],
    },
  ],
};
