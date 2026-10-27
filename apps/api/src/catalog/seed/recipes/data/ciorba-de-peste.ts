import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Ciorbă de pește base is the Romanian soured fish soup: carp steaks
// poached in a vegetable stock made from the head, soured with borș and
// finished with lovage. Each Variant is a full Recipe with its own lines,
// steps and guidance. Tips 0 (borș) and 1 (mixed river fish) are base-specific,
// so both Variants hide them; Tip 2 (leftovers) holds for every fish soup.
export const ciorbaDePeste: BaseRecipeSeed = {
  slug: 'ciorba-de-peste',
  title: t(
    'Romanian sour fish soup with lovage (ciorbă de pește)',
    'Ciorbă de pește',
  ),
  servings: 6,
  prepMinutes: 30,
  cookMinutes: 105,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'carp',
      quantity: 1500,
      unit: 'g',
      note: t(
        'one whole fish, gutted and scaled',
        'un pește întreg, curățat de solzi și de mațe',
      ),
    },
    {
      ingredient: 'onion',
      key: 'onion-stock',
      quantity: 1,
      unit: 'pcs',
      note: t('halved, for the stock', 'tăiată în două, pentru supa de bază'),
    },
    {
      ingredient: 'onion',
      key: 'onion-soup',
      quantity: 2,
      unit: 'pcs',
      note: t('finely diced, for the soup', 'tăiate mărunt, pentru ciorbă'),
    },
    {
      ingredient: 'carrot',
      quantity: 200,
      unit: 'g',
      note: t('diced small', 'tăiați cubulețe'),
    },
    {
      ingredient: 'parsley-root',
      quantity: 100,
      unit: 'g',
      note: t('diced small', 'tăiată cubulețe'),
    },
    {
      ingredient: 'celeriac',
      quantity: 150,
      unit: 'g',
      note: t('peeled, diced small', 'curățată, tăiată cubulețe'),
    },
    {
      ingredient: 'bell-pepper',
      quantity: 1,
      unit: 'pcs',
      note: t('seeded, diced small', 'fără semințe, tăiat cubulețe'),
    },
    {
      ingredient: 'tomato',
      quantity: 300,
      unit: 'g',
      note: t('ripe, peeled and chopped', 'coapte, decojite și tocate'),
    },
    { ingredient: 'still-water', quantity: 3, unit: 'l' },
    {
      ingredient: 'ciorba-sour-base',
      quantity: 1000,
      unit: 'ml',
      note: t(
        'added to taste, you may not need all of it',
        'adăugat după gust, s-ar putea să nu ai nevoie de tot',
      ),
    },
    {
      ingredient: 'peppercorns',
      quantity: 2,
      unit: 'g',
    },
    {
      ingredient: 'hot-pepper',
      quantity: 1,
      unit: 'pcs',
      optional: true,
      note: t('whole', 'întreg'),
    },
    {
      ingredient: 'lovage',
      quantity: 30,
      unit: 'g',
      note: t('finely chopped, to finish', 'tocat mărunt, la final'),
    },
    {
      ingredient: 'garlic',
      quantity: 30,
      unit: 'g',
      note: t('peeled, for the mujdei', 'curățat, pentru mujdei'),
    },
    {
      ingredient: 'salt',
      key: 'salt-fish',
      quantity: 8,
      unit: 'g',
      note: t('for the fish steaks', 'pentru bucățile de pește'),
    },
    {
      ingredient: 'salt',
      key: 'salt-pot',
      quantity: 15,
      unit: 'g',
      note: t(
        'for the pot, adjust at the end',
        'pentru oală, ajustează la final',
      ),
    },
    {
      ingredient: 'salt',
      key: 'salt-mujdei',
      quantity: 3,
      unit: 'g',
      note: t('for the mujdei', 'pentru mujdei'),
    },
  ],
  steps: [
    {
      key: 'cut-fish',
      text: t(
        'Rinse the carp. Cut off the head, tail and fins, and pull the gills out of the head, because they are bitter. Cut the body into steaks about 3 cm thick. Keep the head, tail and fins for the stock.',
        'Spală crapul. Taie capul, coada și aripioarele și scoate branhiile din cap, pentru că sunt amare. Taie corpul în felii groase de aproximativ 3 cm. Păstrează capul, coada și aripioarele pentru supa de bază.',
      ),
    },
    {
      key: 'salt-fish',
      text: t(
        'Sprinkle the steaks with 8 g salt, cover them and put them in the fridge while the stock cooks. Then wash your hands, the board and the knife with hot soapy water, so the raw fish touches nothing you will use for the vegetables.',
        'Presară feliile cu cele 8 g de sare, acoperă-le și pune-le la frigider cât timp fierbe supa de bază. Apoi spală-ți mâinile, tocătorul și cuțitul cu apă fierbinte și detergent, ca peștele crud să nu atingă nimic din ce folosești pentru legume.',
      ),
    },
    {
      key: 'stock',
      text: t(
        'Put the head, tail, fins and the halved onion in a large pot with the water. Bring to the boil, skim off the foam, then simmer gently for 30 minutes.',
        'Pune capul, coada, aripioarele și ceapa tăiată în două într-o oală mare, cu apa. Adu la fierbere, ia spuma, apoi fierbe domol 30 de minute.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'prep-veg',
      text: t(
        'While the stock simmers, finely dice the soup onions, carrot, parsley root, celeriac and bell pepper, and peel and chop the tomatoes.',
        'Cât timp fierbe supa de bază, taie mărunt cele 2 cepe pentru ciorbă, morcovul, rădăcina de pătrunjel, țelina și ardeiul, iar roșiile decojește-le și toacă-le.',
      ),
    },
    {
      key: 'strain',
      text: t(
        'Strain the stock through a fine sieve into a clean 6 l pot, to catch the small bones. Throw away the head, tail, fins and onion.',
        'Strecoară supa de bază printr-o sită deasă într-o oală curată de 6 l, ca să rămână oasele mici în sită. Aruncă capul, coada, aripioarele și ceapa.',
      ),
    },
    {
      key: 'veg-first',
      text: t(
        'Bring the stock back to a simmer and add the diced onions, carrot, parsley root and celeriac. Simmer gently for 20 minutes, until the carrot is nearly tender.',
        'Readu supa la fierbere domoală și adaugă ceapa, morcovul, rădăcina de pătrunjel și țelina. Fierbe domol 20 de minute, până când morcovul e aproape fiert.',
      ),
      timerSeconds: 1200,
    },
    {
      key: 'veg-second',
      text: t(
        'Add the bell pepper and tomatoes and simmer for 10 minutes more, until the tomatoes have broken down.',
        'Adaugă ardeiul și roșiile și mai fierbe 10 minute, până când roșiile se destramă.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'sour-base',
      text: t(
        'While the tomatoes simmer, pour the 1 l borș into a small separate pan and boil it for 2 minutes, skimming off any foam. Boiled first, it tastes clean instead of raw.',
        'Cât timp fierb roșiile, toarnă cei 1000 ml de borș într-o cratiță separată și fierbe-l 2 minute, luând spuma. Fiert dinainte, are gust curat, nu crud.',
      ),
      timerSeconds: 120,
    },
    {
      key: 'season',
      text: t(
        'Pour the hot borș into the soup a little at a time, tasting after each addition, until it is pleasantly sour but not too sour. You may not need all of it. Add 15 g salt, the peppercorns and the whole hot pepper, if using. Bring back to a bare simmer.',
        'Toarnă borșul fierbinte în ciorbă puțin câte puțin, gustând după fiecare adăugare: până când e plăcut acrișoară, dar nu prea acră. S-ar putea să nu ai nevoie de tot borșul. Adaugă cele 15 g de sare, boabele de piper și ardeiul iute întreg, dacă folosești. Lasă să fiarbă foarte încet, abia să clocotească.',
      ),
    },
    {
      key: 'poach',
      text: t(
        'Slip the fish steaks into the soup so the liquid covers them. Keep it at a bare simmer, without stirring, for 12 minutes. The fish is done when the flesh is opaque all the way to the bone, flakes easily and reads 63 °C at the thickest steak.',
        'Introdu feliile de pește în ciorbă, astfel încât lichidul să le acopere. Lasă să fiarbă foarte încet, abia să clocotească, fără să amesteci, 12 minute. Peștele e gata când carnea e opacă până la os, se desface ușor în bucăți și are 63 °C în cea mai groasă felie.',
      ),
      timerSeconds: 720,
    },
    {
      key: 'mujdei',
      text: t(
        'While the fish poaches, crush the garlic with 3 g salt to a paste in a small bowl.',
        'Cât timp fierbe peștele, pisează usturoiul cu cele 3 g de sare până face o pastă, într-un bol mic.',
      ),
    },
    {
      key: 'lift-fish',
      text: t(
        'Lift the steaks with a slotted spoon onto a clean warm platter, never the plate the raw fish sat on. Take the pot off the heat, stir in the lovage and taste for salt and sourness. Loosen the garlic paste with a ladle of hot broth to make the mujdei.',
        'Scoate feliile cu o lingură cu găuri pe un platou curat și cald, nu pe farfuria pe care a stat peștele crud. Ia oala de pe foc, amestecă leușteanul și gustă de sare și de acreală. Diluează pasta de usturoi cu un polonic de supă fierbinte, ca să obții mujdeiul.',
      ),
    },
    {
      key: 'serve',
      text: t(
        'Ladle the soup into bowls and put the fish platter and the mujdei on the table, with hot mămăligă. Eat the fish from a separate plate and take care: carp has many fine, forked bones. For children and older people, flake the fish and pick out every bone first.',
        'Pune ciorba în boluri și așază pe masă platoul cu pește și mujdeiul, împreună cu mămăligă caldă. Mănâncă peștele pe o farfurie separată și ai grijă: crapul are multe oase fine, ramificate. Pentru copii și vârstnici, desfă peștele în bucăți și scoate toate oasele înainte.',
      ),
    },
  ],
  tips: [
    t(
      'Borș differs a lot from one brand or batch to the next, so add it gradually. If you have none, lemon juice or the juice of green tomatoes also sours the soup; add it at the end, off the heat.',
      'Borșul diferă mult de la un producător la altul, așa că adaugă-l treptat. Dacă nu ai, poți acri ciorba cu suc de lămâie sau cu suc de roșii verzi; pune-l la final, de pe foc.',
    ),
    t(
      'Cooks who fish the Danube often mix carp with catfish, pike and pike-perch: the lean fish keep their shape, and the carp gives body to the broth.',
      'Cei care pescuiesc pe Dunăre amestecă adesea crapul cu somn, știucă și șalău: peștii slabi își păstrează forma, iar crapul dă corp supei.',
    ),
    t(
      'Cool leftover fish soup and put it in the fridge within 2 hours. Eat it within 1 to 2 days at most, and reheat it until it boils, once. Do not reheat it a second time.',
      'Răcește ciorba rămasă și pune-o la frigider în cel mult 2 ore. Consum-o în maximum 1-2 zile și încălzește-o până dă în clocot, o singură dată. Nu o mai reîncălzi a doua oară.',
    ),
  ],
  stepTips: [
    {
      step: 'cut-fish',
      text: t(
        'Ask the fishmonger to scale and gut the carp and to leave the head on: the head is what gives the stock its body.',
        'Cere la pescărie să-ți curețe crapul de solzi și de mațe și să-i lase capul: capul dă corp supei de bază.',
      ),
    },
    {
      step: 'poach',
      text: t(
        'Shake the pot gently instead of stirring; a spoon breaks the steaks and clouds the broth.',
        'Scutură ușor oala în loc să amesteci; lingura sparge feliile și tulbură supa.',
      ),
    },
  ],
  nutritionNote: t(
    'A light, high-protein soup with plenty of vegetables. The salt in the borș, the salted fish and the pot adds sodium, so season in steps. Plain mămăligă adds carbohydrate, and the mujdei adds a lot of garlic.',
    'O supă ușoară, bogată în proteine, cu multe legume. Sarea din borș, din pește și din oală aduce sodiu, așa că sărează treptat. Mămăliga simplă adaugă carbohidrați, iar mujdeiul aduce mult usturoi.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t(
        'Mămăligă with cheese and sour cream',
        'Mămăligă cu brânză și smântână',
      ),
      reason: t(
        'Hot, soft mămăligă is a familiar Romanian partner for fish soup and its fish with mujdei; serve it plain, without the cheese and sour cream.',
        'Mămăliga caldă și moale e un acompaniament cunoscut pentru ciorba de pește și peștele cu mujdei; servește-o simplă, fără brânză și smântână.',
      ),
      principle: 'regional_tradition',
      recipe: 'mamaliga',
    },
    {
      kind: 'food',
      label: t('Fresh bread', 'Pâine proaspătă'),
      reason: t(
        'A crusty slice soaks up the sour broth and gives the soft fish something to bite against.',
        'O felie cu crustă se îmbibă cu supa acrișoară și oferă peștelui moale un contrast la mestecat.',
      ),
      principle: 'contrast_texture',
      ingredient: 'bread',
    },
    {
      kind: 'drink',
      label: t('Dry white wine', 'Vin alb sec'),
      reason: t(
        'Its crisp acidity refreshes the palate between bites of fish and garlic.',
        'Aciditatea lui proaspătă împrospătează gustul între îmbucăturile de pește și usturoi.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'white-wine',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot, sour soup warms you through on a cold day.',
        'O supă fierbinte și acrișoară te încălzește într-o zi rece.',
      ),
    },
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'Fish and plenty of vegetables in a broth make a filling meal without anything heavy or fried.',
        'Peștele și multe legume într-o supă fac o masă săturătoare, fără nimic greu sau prăjit.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'The sour broth and the raw garlic in the mujdei can bring on heartburn before bed.',
        'Zeama acră și usturoiul crud din mujdei pot da arsuri înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'ciorba-de-peste-hungarian',
      cuisine: 'hungarian',
      title: t(
        'Halászlé (Hungarian paprika fish soup, Szeged style)',
        'Halászlé (ciorbă ungurească de pește cu boia, ca la Szeged)',
      ),
      servings: 6,
      prepMinutes: 30,
      cookMinutes: 100,
      difficulty: 'medium',
      hideBaseTips: [0, 1],
      lines: [
        {
          ingredient: 'carp',
          quantity: 1500,
          unit: 'g',
          note: t(
            'one whole fish, gutted and scaled',
            'un pește întreg, curățat de solzi și de mațe',
          ),
        },
        {
          ingredient: 'catfish',
          quantity: 500,
          unit: 'g',
          note: t('cut into steaks', 'tăiat în felii'),
        },
        {
          ingredient: 'pike-perch',
          quantity: 400,
          unit: 'g',
          optional: true,
          note: t('cut into steaks', 'tăiat în felii'),
        },
        {
          ingredient: 'onion',
          quantity: 4,
          unit: 'pcs',
          note: t('thickly sliced', 'tăiate felii groase'),
        },
        { ingredient: 'still-water', quantity: 2.5, unit: 'l' },
        {
          ingredient: 'paprika',
          quantity: 25,
          unit: 'g',
          note: t('Hungarian sweet paprika', 'boia dulce ungurească'),
        },
        {
          ingredient: 'hot-pepper',
          quantity: 2,
          unit: 'pcs',
          optional: true,
          note: t('whole', 'întregi'),
        },
        {
          ingredient: 'salt',
          key: 'salt-fish',
          quantity: 10,
          unit: 'g',
          note: t('for the fish steaks', 'pentru bucățile de pește'),
        },
        {
          ingredient: 'salt',
          key: 'salt-pot',
          quantity: 12,
          unit: 'g',
          note: t(
            'for the pot, adjust at the end',
            'pentru oală, ajustează la final',
          ),
        },
      ],
      steps: [
        {
          key: 'cut-fish',
          text: t(
            'Rinse the carp. Cut off the head, tail and fins, pull the gills out of the head because they are bitter, and cut the body into steaks about 3 cm thick. Keep the head, tail, fins and the small trimmings for the broth. Cut the catfish (and the pike-perch, if using) into steaks of the same size.',
            'Spală crapul. Taie capul, coada și aripioarele, scoate branhiile din cap pentru că sunt amare și taie corpul în felii groase de aproximativ 3 cm. Păstrează capul, coada, aripioarele și resturile mici pentru supă. Taie somnul (și șalăul, dacă folosești) în felii de aceeași grosime.',
          ),
        },
        {
          key: 'salt-fish',
          text: t(
            'Sprinkle the steaks with 10 g salt, cover them and put them in the fridge. Then wash your hands, the board and the knife with hot soapy water.',
            'Presară feliile cu cele 10 g de sare, acoperă-le și pune-le la frigider. Apoi spală-ți mâinile, tocătorul și cuțitul cu apă fierbinte și detergent.',
          ),
        },
        {
          key: 'broth',
          text: t(
            'Put the sliced onions, the paprika, the head, tail, fins and trimmings in a wide pot with the water. Bring to the boil, skim off the foam, then simmer gently for 1 hour, until the onions fall apart.',
            'Pune ceapa tăiată felii, boiaua, capul, coada, aripioarele și resturile într-o oală lată, cu apa. Adu la fierbere, ia spuma, apoi fierbe domol 1 oră, până când ceapa se destramă.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'sieve',
          text: t(
            'Set a fine sieve over a clean pot. Ladle in the contents of the first pot and press the onion and the softened fish through with the back of the ladle. This thickens the broth. Throw away the bones left in the sieve.',
            'Pune o sită deasă peste o oală curată. Toarnă conținutul primei oale și strecoară ceapa și peștele înmuiat apăsându-le cu dosul polonicului. Așa se îngroașă supa. Aruncă oasele rămase în sită.',
          ),
        },
        {
          key: 'hot-pepper',
          text: t(
            'Return the broth to the heat and add the whole hot peppers, if using. Bring to a bare simmer; the broth is already deep red from the paprika.',
            'Pune supa la loc pe foc și adaugă ardeii iuți întregi, dacă folosești. Lasă să fiarbă foarte încet, abia să clocotească; supa e deja roșie intens de la boia.',
          ),
        },
        {
          key: 'salt-broth',
          text: t(
            'Stir in 12 g salt and taste the broth.',
            'Amestecă cele 12 g de sare și gustă supa.',
          ),
        },
        {
          key: 'poach',
          text: t(
            'Lay the carp, catfish and pike-perch steaks in the broth so it just covers them. Keep it at a bare simmer for 12 minutes and shake the pot gently now and then instead of stirring. The fish is done when the flesh is opaque all the way to the bone, flakes easily and reads 63 °C at the thickest steak.',
            'Așază feliile de crap, somn și șalău în supă, astfel încât lichidul abia să le acopere. Lasă să fiarbă foarte încet, abia să clocotească, 12 minute și scutură ușor oala din când în când, în loc să amesteci. Peștele e gata când carnea e opacă până la os, se desface ușor în bucăți și are 63 °C în cea mai groasă felie.',
          ),
          timerSeconds: 720,
        },
        {
          key: 'serve',
          text: t(
            'Ladle the broth into deep bowls and lift the fish onto a clean platter, never the plate the raw fish sat on. Eat the fish from a separate plate and take care: carp has many fine, forked bones, while catfish has few. For children and older people, flake the fish and pick out every bone first.',
            'Pune supa în boluri adânci și scoate peștele pe un platou curat, nu pe farfuria pe care a stat peștele crud. Mănâncă peștele pe o farfurie separată și ai grijă: crapul are multe oase fine, ramificate, iar somnul are puține. Pentru copii și vârstnici, desfă peștele în bucăți și scoate toate oasele înainte.',
          ),
        },
      ],
      tips: [
        t(
          'Press the onion through the sieve rather than blending it: a blender would also grind the fine bones into the broth.',
          'Treci ceapa prin sită, nu o mixa: mixerul ar tăia mărunt și oasele fine din supă.',
        ),
      ],
      stepTips: [
        {
          step: 'poach',
          text: t(
            'Lay the thicker carp steaks at the bottom and the catfish on top so everything stays under the broth.',
            'Pune feliile mai groase de crap la fund și somnul deasupra, ca totul să rămână sub supă.',
          ),
        },
      ],
      nutritionNote: t(
        'A thick, spicy soup that is high in protein from the fish. The onions add a little fibre, but there are few other vegetables. Salt from the fish and the pot adds sodium, and bread eaten with it adds carbohydrate. The hot pepper is optional for anyone who cannot take heat.',
        'O supă groasă și iute, bogată în proteine din pește. Ceapa aduce puține fibre, dar sunt puține alte legume. Sarea din pește și din oală aduce sodiu, iar pâinea servită alături adaugă carbohidrați. Ardeiul iute e opțional pentru cine nu suportă iuțeala.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Country bread', 'Pâine de casă'),
          reason: t(
            'A thick crusty slice soaks up the paprika broth and gives the soft fish a contrast in texture.',
            'O felie groasă cu crustă se îmbibă cu supa cu boia și oferă peștelui moale un contrast de textură.',
          ),
          principle: 'contrast_texture',
          ingredient: 'country-bread',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Its acidity cuts through the paprika and the richness of the carp.',
            'Aciditatea lui taie din bogăția boielii și a crapului.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'white-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, thick, spicy soup warms you through on a cold day.',
            'O supă fierbinte, groasă și iute te încălzește într-o zi rece.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Paprika, hot pepper and a big bowl of fish can sit heavy before bed.',
            'Boiaua, ardeiul iute și un castron mare de pește pot cădea greu înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'ciorba-de-peste-finnish',
      cuisine: 'finnish',
      title: t(
        'Lohikeitto (Finnish creamy salmon soup)',
        'Lohikeitto (supă cremoasă finlandeză de somon)',
      ),
      servings: 4,
      prepMinutes: 25,
      cookMinutes: 35,
      difficulty: 'easy',
      hideBaseTips: [0, 1],
      lines: [
        {
          ingredient: 'salmon',
          quantity: 500,
          unit: 'g',
          note: t('skinless fillet', 'file fără piele'),
        },
        {
          ingredient: 'potato',
          quantity: 0.6,
          unit: 'kg',
          note: t('peeled, diced 1.5 cm', 'curățați, tăiați cuburi de 1,5 cm'),
        },
        {
          ingredient: 'leek',
          quantity: 150,
          unit: 'g',
          note: t(
            'white and pale green part, sliced',
            'doar partea albă și verde-deschis, tăiată rondele',
          ),
        },
        {
          ingredient: 'carrot',
          quantity: 100,
          unit: 'g',
          optional: true,
          note: t('diced small', 'tăiat cubulețe'),
        },
        { ingredient: 'butter', quantity: 30, unit: 'g' },
        { ingredient: 'still-water', quantity: 800, unit: 'ml' },
        {
          ingredient: 'allspice-berries',
          quantity: 1,
          unit: 'g',
          note: t('about 6 berries', 'aproximativ 6 boabe'),
        },
        {
          ingredient: 'bay-leaves',
          quantity: 0.4,
          unit: 'g',
          note: t('2 leaves', '2 frunze'),
        },
        { ingredient: 'whipping-cream', quantity: 300, unit: 'ml' },
        {
          ingredient: 'dill',
          quantity: 15,
          unit: 'g',
          note: t('chopped, to finish', 'tocat, la final'),
        },
        { ingredient: 'salt', quantity: 8, unit: 'g' },
        {
          ingredient: 'white-pepper',
          quantity: 1,
          unit: 'g',
          optional: true,
        },
      ],
      steps: [
        {
          key: 'bones',
          text: t(
            'Lay the salmon on a board and run a finger along the fillet against the grain to feel for pin bones. Pull out each one with clean tweezers. Cut the salmon into 3 cm cubes, cover them and keep them in the fridge.',
            'Așază somonul pe un tocător și treci degetul peste file, contra firului, ca să simți oasele mici. Scoate-le pe fiecare cu o pensetă curată. Taie somonul cuburi de 3 cm, acoperă-le și păstrează-le la frigider.',
          ),
        },
        {
          key: 'wash',
          text: t(
            'Wash your hands, the board and the knife with hot soapy water. Peel and dice the potatoes and carrot, and slice the leek.',
            'Spală-ți mâinile, tocătorul și cuțitul cu apă fierbinte și detergent. Curăță și taie cartofii și morcovul cuburi, iar prazul rondele.',
          ),
        },
        {
          key: 'leek',
          text: t(
            'Melt the butter in a pot over medium heat and cook the leek for 3 minutes, stirring, until soft but not browned.',
            'Topește untul într-o oală la foc mediu și călește prazul 3 minute, amestecând, până se înmoaie, fără să se rumenească.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'potatoes',
          text: t(
            'Add the water, potatoes, carrot, allspice, bay leaves and the salt. Bring to the boil, then simmer for 15 minutes, until a knife slides into a potato cube with no resistance.',
            'Adaugă apa, cartofii, morcovul, ienibaharul, foile de dafin și sarea. Adu la fierbere, apoi fierbe domol 15 minute, până când cuțitul intră fără rezistență într-un cub de cartof.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'cream',
          text: t(
            'Pour in the cream and heat until small bubbles rise at the edge of the pot. Do not let it boil hard.',
            'Toarnă frișca și încălzește până se ridică bule mici la marginea oalei. Nu o lăsa să fiarbă tare.',
          ),
        },
        {
          key: 'salmon',
          text: t(
            'Slide in the salmon cubes and keep the soup at a bare simmer for 6 minutes, without stirring much. The salmon is done when the cubes are opaque all through, flake easily and read 63 °C in the centre.',
            'Introdu cuburile de somon și lasă supa să fiarbă foarte încet, abia să clocotească, 6 minute, fără să amesteci prea mult. Somonul e gata când cuburile sunt complet opace, până în centru, se desfac ușor în bucăți și au 63 °C în centru.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'finish',
          text: t(
            'Take the pot off the heat and fish out the bay leaves. Stir in the dill, add white pepper if you like, and taste for salt. Serve at once, with rye bread and butter.',
            'Ia oala de pe foc și scoate foile de dafin. Amestecă mărarul, adaugă piper alb dacă dorești și gustă de sare. Servește imediat, cu pâine de secară și unt.',
          ),
        },
      ],
      tips: [
        t(
          'Buy the salmon as one thick fillet rather than thin tail pieces: the cubes hold their shape, and the tail overcooks before the centre is done.',
          'Cumpără somonul dintr-un file gros, nu din bucăți subțiri de la coadă: cuburile își păstrează forma, iar coada se gătește prea tare înainte ca centrul să fie gata.',
        ),
      ],
      stepTips: [
        {
          step: 'bones',
          text: t(
            'Even a fillet sold boneless can hide a few pin bones, so run your finger along the whole length of it.',
            'Chiar și un file vândut fără oase poate ascunde câteva oase mici, așa că treci degetul pe toată lungimea lui.',
          ),
        },
      ],
      nutritionNote: t(
        'Salmon gives protein and fat that is mostly unsaturated, and the potatoes make the soup filling. The cream and butter add saturated fat and salt adds sodium. There are few vegetables, so serve with a side of crunchy salad or raw carrot.',
        'Somonul aduce proteine și grăsime în mare parte nesaturată, iar cartofii fac supa săturătoare. Frișca și untul adaugă grăsimi saturate, iar sarea aduce sodiu. Sunt puține legume, așa că servește cu o salată crocantă sau cu morcov crud.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Rye bread', 'Pâine de secară'),
          reason: t(
            'Its dense, slightly sour crumb is a contrast to the soft potatoes and creamy broth.',
            'Miezul ei dens, ușor acrișor, contrastează cu cartofii moi și cu supa cremoasă.',
          ),
          principle: 'contrast_texture',
          ingredient: 'rye-bread',
        },
        {
          kind: 'food',
          label: t('Lemon', 'Lămâie'),
          reason: t(
            'A squeeze of juice cuts the richness of the cream and the salmon.',
            'Câteva picături de suc taie din bogăția frișcii și a somonului.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'lemon',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A hot, creamy soup warms you through on a cold day.',
            'O supă fierbinte și cremoasă te încălzește într-o zi rece.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from the salmon and carbohydrate from the potatoes help you recover.',
            'Proteinele din somon și carbohidrații din cartofi ajută la refacere.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A bowl rich in cream can sit heavy before bed.',
            'Un castron bogat în frișcă poate cădea greu înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
