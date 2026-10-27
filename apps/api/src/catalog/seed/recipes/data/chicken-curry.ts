import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Chicken curry base is a North-Indian-style home curry: an onion and
// tomato masala with boneless thighs, served with basmati rice. Each Variant is
// a full Recipe with its own lines, steps and guidance; the base's Recipe-level
// Tips are inherited unless a Variant hides them.
export const chickenCurry: BaseRecipeSeed = {
  slug: 'chicken-curry',
  title: t('Home-style chicken curry', 'Curry de pui'),
  servings: 4,
  prepMinutes: 15,
  cookMinutes: 65,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'chicken-thighs',
      quantity: 800,
      unit: 'g',
      note: t('cut into 3 cm pieces', 'tăiate în bucăți de 3 cm'),
    },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('finely chopped', 'tocate mărunt'),
    },
    {
      ingredient: 'garlic',
      quantity: 15,
      unit: 'g',
      note: t('grated or crushed', 'ras sau pisat'),
    },
    {
      ingredient: 'ginger',
      quantity: 20,
      unit: 'g',
      note: t('grated', 'dat pe răzătoare'),
    },
    { ingredient: 'cumin-seeds', quantity: 3, unit: 'g' },
    { ingredient: 'turmeric', quantity: 3, unit: 'g' },
    { ingredient: 'ground-coriander', quantity: 8, unit: 'g' },
    { ingredient: 'chili-powder', quantity: 3, unit: 'g' },
    { ingredient: 'garam-masala', quantity: 4, unit: 'g' },
    { ingredient: 'canned-tomatoes', quantity: 400, unit: 'g' },
    { ingredient: 'yogurt', quantity: 100, unit: 'g' },
    { ingredient: 'sunflower-oil', quantity: 45, unit: 'ml' },
    { ingredient: 'still-water', quantity: 250, unit: 'ml' },
    {
      ingredient: 'coriander',
      quantity: 20,
      unit: 'g',
      note: t(
        'stalks and leaves chopped separately',
        'tulpini și frunze tocate separat',
      ),
    },
    {
      ingredient: 'hot-pepper',
      quantity: 1,
      unit: 'pcs',
      optional: true,
      note: t('green, slit lengthwise', 'verde, crestat pe lungime'),
    },
    { ingredient: 'salt', quantity: 7, unit: 'g' },
    { ingredient: 'basmati-rice', quantity: 300, unit: 'g' },
    {
      ingredient: 'still-water',
      key: 'rice-water',
      quantity: 450,
      unit: 'ml',
      note: t('for the rice', 'pentru orez'),
    },
    {
      ingredient: 'salt',
      key: 'salt-rice',
      quantity: 3,
      unit: 'g',
      note: t('for the rice', 'pentru orez'),
    },
  ],
  steps: [
    {
      key: 'prep',
      text: t(
        'Chop the onions, grate the ginger and garlic, and cut the chicken into 3 cm pieces. Chop the coriander stalks and leaves separately.',
        'Toacă ceapa, dă ghimbirul și usturoiul pe răzătoare și taie puiul în bucăți de 3 cm. Toacă separat tulpinile și frunzele de coriandru.',
      ),
    },
    {
      key: 'cumin',
      text: t(
        'Heat the oil in a wide, heavy pot over medium heat. Add the cumin seeds and let them sizzle for about 30 seconds, until they darken a shade and smell toasty.',
        'Încinge uleiul într-o oală lată, cu fundul gros, la foc mediu. Adaugă semințele de chimion și lasă-le să sfârâie aproximativ 30 de secunde, până se închid puțin la culoare și miros a prăjit.',
      ),
      timerSeconds: 30,
    },
    {
      key: 'onion',
      text: t(
        'Add the onions and the coriander stalks with a pinch of the salt. Cook for about 15 minutes, stirring often, until the onions are deep golden brown.',
        'Adaugă ceapa și tulpinile de coriandru, cu un praf din sare. Gătește aproximativ 15 minute, amestecând des, până când ceapa devine aurie închis.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'ginger-garlic',
      text: t(
        'Stir in the ginger and garlic and cook for 1 minute, until the raw smell goes.',
        'Adaugă ghimbirul și usturoiul și gătește 1 minut, până dispare mirosul de crud.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'spices',
      text: t(
        'Add the turmeric, ground coriander and chilli powder with a splash of water. Stir for 30 seconds so the spices cook without catching.',
        'Adaugă turmericul, coriandrul măcinat și ardeiul iute măcinat, cu un strop de apă. Amestecă 30 de secunde, ca mirodeniile să se prăjească fără să se prindă.',
      ),
      timerSeconds: 30,
    },
    {
      key: 'tomatoes',
      text: t(
        'Add the tomatoes and the rest of the curry salt, crushing any large pieces with the spoon. Cook for about 10 minutes, stirring now and then, until the sauce is thick and the oil separates at the edges.',
        'Adaugă roșiile și restul de sare pentru curry, strivind bucățile mari cu lingura. Gătește aproximativ 10 minute, amestecând din când în când, până când sosul se îngroașă și uleiul se separă pe margini.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'chicken',
      text: t(
        'Add the chicken and stir to coat it in the masala. Cook for about 5 minutes, turning the pieces, until the outside is opaque with no raw pink.',
        'Adaugă puiul și amestecă să se acopere cu masala. Gătește aproximativ 5 minute, întorcând bucățile, până când exteriorul devine opac, fără urme de roz crud.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'simmer',
      text: t(
        'Pour in the water, add the green chilli if using, and bring to a gentle simmer. Cover with the lid slightly ajar and simmer for 20 minutes, stirring once or twice.',
        'Toarnă apa, adaugă ardeiul iute verde dacă folosești și adu la fierbere domoală. Acoperă cu capacul întredeschis și fierbe 20 de minute, amestecând o dată sau de două ori.',
      ),
      timerSeconds: 1200,
    },
    {
      key: 'rice',
      text: t(
        'While the curry simmers, rinse the rice in several changes of water until it runs nearly clear. Bring it to the boil with the rice water and its salt, cover, and cook on the lowest heat for 10 minutes.',
        'În timp ce curry fierbe, spală orezul în mai multe ape, până când apa se limpezește aproape complet. Adu-l la fierbere cu apa pentru orez și sarea lui, acoperă și gătește la foc foarte mic 10 minute.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'rice-rest',
      text: t(
        'Take the rice off the heat and leave it covered for 5 minutes, then fluff it with a fork.',
        'Ia orezul de pe foc și lasă-l acoperit 5 minute, apoi răscolește-l cu furculița.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'yogurt',
      text: t(
        'Turn the heat to low. Whisk the yogurt in a bowl with 2 spoonfuls of the hot sauce, then stir it into the pot and warm for 3 minutes without letting it boil.',
        'Dă focul la minim. Amestecă iaurtul într-un bol cu 2 linguri din sosul fierbinte, apoi toarnă-l în oală și încălzește 3 minute, fără să fiarbă.',
      ),
      timerSeconds: 180,
    },
    {
      key: 'check',
      text: t(
        'Cut open the thickest piece of chicken. It is cooked through when it is white with no pink, the juices run clear, and a thermometer reads 75 °C. If not, simmer a few minutes more.',
        'Taie cea mai groasă bucată de pui. E gătită când e albă, fără roz, zeama curge limpede, iar termometrul arată 75 °C. Dacă nu, mai fierbe câteva minute.',
      ),
    },
    {
      key: 'finish',
      text: t(
        'Stir in the garam masala and half of the coriander leaves, and taste for salt. Leave it off the heat for 5 minutes so the flavours settle.',
        'Amestecă garam masala și jumătate din frunzele de coriandru și gustă de sare. Ia curry-ul de pe foc și lasă-l 5 minute, ca aromele să se așeze.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'serve',
      text: t(
        'Serve the curry over the rice, scattered with the remaining coriander leaves.',
        'Servește curry-ul peste orez, presărat cu restul frunzelor de coriandru.',
      ),
    },
  ],
  tips: [
    t(
      'Cool leftover rice quickly, spread flat, within an hour, then refrigerate it and eat it within a day; reheat until piping hot. Cooked rice left warm for hours can make you ill. Store the curry in the fridge within 2 hours and reheat it until it bubbles.',
      'Răcește repede orezul rămas, întins în strat subțire, în cel mult o oră, apoi păstrează-l la frigider și consumă-l în cel mult o zi; reîncălzește-l până fierbe de tot. Orezul gătit lăsat ore întregi la căldură poate îmbolnăvi. Păstrează curry-ul la frigider în cel mult 2 ore și reîncălzește-l până dă în clocot.',
    ),
    t(
      'Be patient with the onions and tomatoes: a deep golden onion and a masala that has lost its raw tomato smell and shows oil at the edges are what make the curry taste cooked, not just spiced.',
      'Fii răbdător cu ceapa și roșiile: o ceapă aurie închis și o masala care nu mai miroase a roșie crudă și lasă ulei pe margini fac ca curry-ul să aibă gust gătit, nu doar condimentat.',
    ),
    t(
      'Boneless thighs stay tender in a simmering sauce; breast meat tends to turn dry and stringy.',
      'Pulpele dezosate rămân fragede într-un sos care fierbe; pieptul se usucă și iese fibros.',
    ),
  ],
  stepTips: [
    {
      step: 'onion',
      text: t(
        'If the onions start to stick before they colour, add a spoonful of water and scrape the bottom instead of turning the heat up.',
        'Dacă ceapa începe să se lipească înainte să se rumenească, adaugă o lingură de apă și răzuiește fundul, în loc să mărești focul.',
      ),
    },
    {
      step: 'yogurt',
      text: t(
        'Thinning the yogurt with hot sauce first and keeping the heat low stops it from splitting into grains.',
        'Subțiază iaurtul întâi cu sos fierbinte și ține focul mic, ca să nu se brânzească.',
      ),
    },
  ],
  nutritionNote: t(
    'A filling dish with plenty of protein from the chicken, and onion and tomato in the sauce. The thighs and the oil bring more fat than a breast-based curry, white rice adds mostly starch, and the salt adds up, so serve it with a side of vegetables.',
    'Un preparat săturător, cu multe proteine din pui și cu ceapă și roșii în sos. Pulpele și uleiul aduc mai multă grăsime decât un curry cu piept, orezul alb aduce mai ales amidon, iar sarea se adună, așa că servește-l cu legume alături.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Naan', 'Naan'),
      reason: t(
        'Soft bread for scooping up the sauce.',
        'Pâine moale cu care ștergi sosul din farfurie.',
      ),
      principle: 'complement_flavour',
      ingredient: 'naan',
    },
    {
      kind: 'food',
      label: t('Mango chutney', 'Chutney de mango'),
      reason: t(
        'Its sweet-sharp tang cuts through the rich, spiced sauce.',
        'Gustul dulce-acrișor taie bogăția sosului condimentat.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'mango-chutney',
    },
    {
      kind: 'food',
      label: t('Cucumber', 'Castraveți'),
      reason: t(
        'Cool, crisp slices (stirred into yogurt, if you like) calm the chilli heat.',
        'Felii reci și crocante (amestecate cu iaurt, dacă vrei) liniștesc iuțeala.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'cucumber',
    },
    {
      kind: 'drink',
      label: t('Cold lager', 'Bere blondă rece'),
      reason: t(
        'Its fizz and light bitterness refresh the palate between spiced mouthfuls.',
        'Bulele și amăreala ușoară împrospătează gustul între îmbucăturile condimentate.',
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
        'A hot, warmly spiced dish that suits a cold evening.',
        'Un preparat fierbinte, cu condimente calde, potrivit pentru o seară rece.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Protein from the chicken and carbohydrates from the rice help you refuel.',
        'Proteinele din pui și carbohidrații din orez te ajută să te refaci.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'A rich, spiced meal sits heavy during hard exercise.',
        'O masă bogată și condimentată cade greu în timpul unui efort intens.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Spice and fat can disturb sleep if eaten just before bed.',
        'Condimentele și grăsimea pot strica somnul dacă mănânci chiar înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'chicken-curry-thai',
      cuisine: 'thai',
      title: t(
        'Thai red chicken curry with bamboo shoots (gaeng phed gai)',
        'Curry roșu thailandez cu pui și lăstari de bambus (gaeng phed gai)',
      ),
      servings: 4,
      prepMinutes: 10,
      cookMinutes: 45,
      difficulty: 'easy',
      hideBaseTips: [1],
      lines: [
        {
          ingredient: 'chicken-thighs',
          quantity: 600,
          unit: 'g',
          note: t('thinly sliced', 'tăiate felii subțiri'),
        },
        {
          ingredient: 'coconut-milk',
          quantity: 400,
          unit: 'ml',
          note: t('one can, not shaken', 'o cutie, nescuturată'),
        },
        { ingredient: 'red-curry-paste', quantity: 50, unit: 'g' },
        {
          ingredient: 'canned-bamboo-shoots',
          quantity: 200,
          unit: 'g',
          note: t('drained and rinsed', 'scurși și clătiți'),
        },
        {
          ingredient: 'makrut-lime-leaves',
          quantity: 3,
          unit: 'g',
          note: t('torn', 'rupte'),
        },
        { ingredient: 'still-water', quantity: 150, unit: 'ml' },
        { ingredient: 'fish-sauce', quantity: 30, unit: 'ml' },
        { ingredient: 'palm-sugar', quantity: 15, unit: 'g' },
        { ingredient: 'thai-basil', quantity: 20, unit: 'g' },
        {
          ingredient: 'hot-pepper',
          quantity: 1,
          unit: 'pcs',
          optional: true,
          note: t(
            'long red, sliced, to garnish',
            'roșu lung, tăiat felii, pentru servire',
          ),
        },
        { ingredient: 'jasmine-rice', quantity: 300, unit: 'g' },
        {
          ingredient: 'still-water',
          key: 'rice-water',
          quantity: 420,
          unit: 'ml',
          note: t('for the rice', 'pentru orez'),
        },
      ],
      steps: [
        {
          key: 'rice',
          text: t(
            'Rinse the rice in several changes of water until it runs nearly clear. Bring it to the boil with the rice water, cover, and cook on the lowest heat for 10 minutes. While it cooks, slice the chicken thinly and tear the lime leaves.',
            'Spală orezul în mai multe ape, până când apa se limpezește aproape complet. Adu-l la fierbere cu apa pentru orez, acoperă și gătește la foc foarte mic 10 minute. Cât se gătește, taie puiul în felii subțiri și rupe frunzele de lămâi kaffir.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'rice-rest',
          text: t(
            'Take the rice off the heat and keep it covered while you make the curry.',
            'Ia orezul de pe foc și ține-l acoperit cât pregătești curry.',
          ),
        },
        {
          key: 'cream',
          text: t(
            'Without shaking the can, spoon the thick top, about 150 ml, into a wide pan over medium heat. Simmer for about 4 minutes, until it bubbles and the oil begins to separate.',
            'Fără să scuturi cutia, pune cu lingura partea groasă de deasupra, circa 150 ml, într-o tigaie lată la foc mediu. Fierbe aproximativ 4 minute, până face bule și uleiul începe să se separe.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'paste',
          text: t(
            'Add the curry paste (with a hot brand such as Mae Ploy, start with about two-thirds and add the rest after tasting) and fry for about 2 minutes, stirring and pressing it into the cream, until it smells fragrant and the oil turns red.',
            'Adaugă pasta de curry (la o marcă iute, ca Mae Ploy, pornește cu aproximativ două treimi și adaugă restul după ce guști) și prăjește-o aproximativ 2 minute, amestecând și presând-o în cremă, până miroase puternic și uleiul devine roșu.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'chicken',
          text: t(
            'Add the chicken and stir for about 3 minutes, until the outside turns opaque.',
            'Adaugă puiul și amestecă aproximativ 3 minute, până când exteriorul devine opac.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'simmer',
          text: t(
            'Pour in the rest of the coconut milk and the water, add the lime leaves, and simmer gently for 10 minutes.',
            'Toarnă restul de lapte de cocos și apa, adaugă frunzele de lămâi kaffir și fierbe domol 10 minute.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'bamboo',
          text: t(
            'Add the bamboo shoots and simmer for 5 minutes more.',
            'Adaugă lăstarii de bambus și mai fierbe 5 minute.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'season',
          text: t(
            'Stir in the fish sauce and palm sugar, then taste: it should be salty, lightly sweet and hot, in balance.',
            'Adaugă sosul de pește și zahărul de palmier, apoi gustă: trebuie să fie sărat, ușor dulce și iute, în echilibru.',
          ),
        },
        {
          key: 'check',
          text: t(
            'Cut open the thickest slice of chicken. It is cooked through when it is white with no pink, the juices run clear, and a thermometer reads 75 °C.',
            'Taie cea mai groasă felie de pui. E gătită când e albă, fără roz, zeama curge limpede, iar termometrul arată 75 °C.',
          ),
        },
        {
          key: 'basil',
          text: t(
            'Take the pan off the heat and stir in most of the Thai basil until it just wilts. Serve over the rice, topped with the remaining basil and the chilli slices.',
            'Ia tigaia de pe foc și amestecă cea mai mare parte din busuiocul thailandez, până se ofilește ușor. Servește peste orez, cu restul de busuioc și felii de ardei iute deasupra.',
          ),
        },
      ],
      tips: [
        t(
          'Curry pastes differ a lot in heat and saltiness between brands. Start with less paste than you think, and season with the fish sauce last.',
          'Pastele de curry diferă mult în iuțeală și sărătură de la o marcă la alta. Începe cu mai puțină pastă decât crezi și potrivește gustul la final cu sosul de pește.',
        ),
      ],
      stepTips: [
        {
          step: 'cream',
          text: t(
            'Do not shake the can: you want the thick cream on top to fry the paste. If it is all thin, simmer the cream a few minutes longer until the oil shows.',
            'Nu scutura cutia: ai nevoie de crema groasă de deasupra pentru a prăji pasta. Dacă tot conținutul e subțire, fierbe crema câteva minute în plus, până apare uleiul.',
          ),
        },
      ],
      nutritionNote: t(
        'Chicken gives protein, and the bamboo shoots add bulk for few calories. Coconut milk is high in saturated fat, and the paste and fish sauce are salty, so keep the portion of sauce moderate; jasmine rice is mostly starch.',
        'Puiul aduce proteine, iar lăstarii de bambus dau volum cu puține calorii. Laptele de cocos conține multe grăsimi saturate, iar pasta și sosul de pește sunt sărate, așa că ia o porție moderată de sos; orezul jasmine este în mare parte amidon.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Lime wedge', 'Felie de lime'),
          reason: t(
            'A squeeze of acidity brightens the rich coconut sauce.',
            'Puțină zeamă de lime înviorează sosul bogat de cocos.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'lime',
        },
        {
          kind: 'food',
          label: t('Cucumber', 'Castraveți'),
          reason: t(
            'Cool, crisp slices are a relief next to the chilli heat.',
            'Feliile reci și crocante sunt o ușurare lângă iuțeală.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'cucumber',
        },
        {
          kind: 'drink',
          label: t('Cold lager', 'Bere blondă rece'),
          reason: t(
            'Cold and lightly bitter, it resets the palate after chilli and coconut.',
            'Rece și ușor amăruie, resetează gustul după iuțeală și cocos.',
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
            'Warming chilli and a creamy sauce suit a cold evening.',
            'Iuțeala care încălzește și sosul cremos se potrivesc unei seri reci.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from the chicken and carbohydrates from the rice.',
            'Proteine din pui și carbohidrați din orez.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Coconut fat and chilli sit heavy during hard exercise.',
            'Grăsimea din cocos și iuțeala cad greu în timpul unui efort intens.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A rich, hot dish can disturb sleep close to bedtime.',
            'Un preparat bogat și iute poate strica somnul dacă îl mănânci aproape de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'chicken-curry-japanese',
      cuisine: 'japanese',
      title: t(
        'Japanese chicken curry (kare raisu)',
        'Curry japonez cu pui (kare raisu)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 50,
      difficulty: 'easy',
      hideBaseTips: [1],
      lines: [
        {
          ingredient: 'chicken-thighs',
          quantity: 600,
          unit: 'g',
          note: t('cut into 3 cm pieces', 'tăiate în bucăți de 3 cm'),
        },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('thinly sliced', 'tăiate felii subțiri'),
        },
        {
          ingredient: 'carrot',
          quantity: 200,
          unit: 'g',
          note: t('cut into chunks', 'tăiați bucăți'),
        },
        {
          ingredient: 'potato',
          quantity: 0.5,
          unit: 'kg',
          note: t('peeled, cut into chunks', 'curățați, tăiați bucăți'),
        },
        { ingredient: 'sunflower-oil', quantity: 30, unit: 'ml' },
        { ingredient: 'still-water', quantity: 600, unit: 'ml' },
        {
          ingredient: 'japanese-curry-roux',
          quantity: 90,
          unit: 'g',
          note: t(
            'about half a standard box',
            'aproximativ jumătate dintr-o cutie standard',
          ),
        },
        {
          ingredient: 'apple',
          quantity: 0.5,
          unit: 'pcs',
          optional: true,
          note: t('grated', 'dat pe răzătoare'),
        },
        {
          ingredient: 'honey',
          quantity: 10,
          unit: 'g',
          optional: true,
        },
        { ingredient: 'sushi-rice', quantity: 300, unit: 'g' },
        {
          ingredient: 'still-water',
          key: 'rice-water',
          quantity: 400,
          unit: 'ml',
          note: t('for the rice', 'pentru orez'),
        },
      ],
      steps: [
        {
          key: 'onion',
          text: t(
            'Heat the oil in a heavy pot over medium heat. Cook the onions for about 10 minutes, stirring, until soft and golden at the edges.',
            'Încinge uleiul într-o oală cu fundul gros la foc mediu. Gătește ceapa aproximativ 10 minute, amestecând, până se înmoaie și devine aurie pe margini.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'chicken',
          text: t(
            'Add the chicken and stir for about 5 minutes, until the outside is no longer pink.',
            'Adaugă puiul și amestecă aproximativ 5 minute, până când exteriorul nu mai e roz.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'vegetables',
          text: t(
            'Add the carrot and potato and stir for 2 minutes, coating them in the oil.',
            'Adaugă morcovul și cartofii și amestecă 2 minute, să se îmbrace în ulei.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'simmer',
          text: t(
            'Pour in the water, bring to the boil, and skim off any grey foam. Reduce to a gentle simmer, cover, and cook for 15 minutes, until the potato is tender when pierced.',
            'Toarnă apa, adu la fierbere și ia spuma cenușie de deasupra. Redu la fierbere domoală, acoperă și gătește 15 minute, până când cartoful se înțeapă ușor.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'rice',
          text: t(
            'While the stew simmers, rinse the rice until the water runs nearly clear. Bring it to the boil with the rice water, cover, and cook on the lowest heat for 12 minutes.',
            'Cât fierbe tocănița, spală orezul până când apa se limpezește aproape complet. Adu-l la fierbere cu apa pentru orez, acoperă și gătește la foc foarte mic 12 minute.',
          ),
          timerSeconds: 720,
        },
        {
          key: 'rice-rest',
          text: t(
            'Take the rice off the heat and leave it covered for 10 minutes, then fluff it.',
            'Ia orezul de pe foc și lasă-l acoperit 10 minute, apoi răscolește-l.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'roux',
          text: t(
            'While the rice rests, turn the stew heat off. Break the roux into pieces, add the grated apple and honey if using, and stir until the roux has fully dissolved.',
            'Cât se odihnește orezul, oprește focul sub tocăniță. Rupe roux-ul în bucăți, adaugă mărul ras și mierea, dacă folosești, și amestecă până se dizolvă complet.',
          ),
        },
        {
          key: 'thicken',
          text: t(
            'Return to low heat and simmer for about 5 minutes, stirring often, until the sauce is thick and glossy.',
            'Pune din nou la foc mic și fierbe aproximativ 5 minute, amestecând des, până când sosul se îngroașă și devine lucios.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'check',
          text: t(
            'Cut open a large piece of chicken. It is cooked through when it is white with no pink, the juices run clear, and a thermometer reads 75 °C. Serve the curry beside the rice.',
            'Taie o bucată mare de pui. E gătită când e albă, fără roz, zeama curge limpede, iar termometrul arată 75 °C. Servește curry-ul lângă orez.',
          ),
        },
      ],
      tips: [
        t(
          'The roux blocks are already salted, so taste before adding anything. Their water amount varies by brand: follow the packet if it differs from this recipe, and dissolve the roux off the heat so it does not clump.',
          'Cuburile de roux sunt deja sărate, așa că gustă înainte să adaugi ceva. Cantitatea de apă diferă de la o marcă la alta: urmează ambalajul dacă diferă de rețetă și dizolvă roux-ul de pe foc, ca să nu facă cocoloașe.',
        ),
      ],
      stepTips: [
        {
          step: 'onion',
          text: t(
            'Cooking the onions slowly until golden gives the sauce its sweetness, so do not rush them.',
            'Ceapa gătită încet până se rumenește dă sosului dulceața lui, așa că nu o grăbi.',
          ),
        },
      ],
      nutritionNote: t(
        'Potato, carrot and onion make it a one-pot meal with some vegetables, and the chicken brings protein. The roux blocks are fairly high in fat and salt, so use no more than the recipe says; the rice and potato together make it heavy on starch.',
        'Cartofii, morcovul și ceapa îl fac un preparat într-o oală, cu legume, iar puiul aduce proteine. Cuburile de roux conțin destulă grăsime și sare, așa că nu depăși cantitatea din rețetă; orezul și cartofii îl fac bogat în amidon.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Japanese karaage', 'Karaage japonez'),
          reason: t(
            'Crisp fried chicken is a common topping for kare raisu: it adds crunch to the smooth sauce.',
            'Puiul prăjit crocant este un topping frecvent pentru kare raisu: adaugă crocant sosului fin.',
          ),
          principle: 'contrast_texture',
          recipe: 'fried-chicken-karaage',
        },
        {
          kind: 'drink',
          label: t('Green tea', 'Ceai verde'),
          reason: t(
            'Its light bitterness clears the palate after the rich sauce.',
            'Amăreala lui ușoară curăță gustul după sosul bogat.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'green-tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A thick, hot, mild stew that warms you through.',
            'O tocăniță groasă, fierbinte și blândă, care te încălzește.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Rice and potato refill carbohydrates, and the chicken adds protein.',
            'Orezul și cartofii refac carbohidrații, iar puiul adaugă proteine.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'avoid',
          reason: t(
            'A thick, starchy plate is too heavy for a light lunch.',
            'O farfurie groasă și bogată în amidon e prea grea pentru un prânz ușor.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Heavy and salty, it sits badly just before bed.',
            'Fiind greu și sărat, cade rău chiar înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'chicken-curry-british',
      cuisine: 'british',
      title: t('Chicken tikka masala', 'Pui tikka masala'),
      servings: 4,
      prepMinutes: 75,
      cookMinutes: 45,
      difficulty: 'medium',
      hideBaseTips: [1],
      lines: [
        {
          ingredient: 'chicken-thighs',
          quantity: 800,
          unit: 'g',
          note: t('cut into 4 cm pieces', 'tăiate în bucăți de 4 cm'),
        },
        { ingredient: 'yogurt', quantity: 150, unit: 'g' },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t('juiced', 'doar zeama'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t('grated, for the marinade', 'ras, pentru marinadă'),
        },
        {
          ingredient: 'ginger',
          quantity: 12,
          unit: 'g',
          note: t('grated, for the marinade', 'ras, pentru marinadă'),
        },
        {
          ingredient: 'paprika',
          quantity: 4,
          unit: 'g',
          note: t('for the marinade', 'pentru marinadă'),
        },
        {
          ingredient: 'chili-powder',
          quantity: 2,
          unit: 'g',
          note: t('for the marinade', 'pentru marinadă'),
        },
        {
          ingredient: 'turmeric',
          quantity: 2,
          unit: 'g',
          note: t('for the marinade', 'pentru marinadă'),
        },
        {
          ingredient: 'cumin',
          quantity: 3,
          unit: 'g',
          note: t('for the marinade', 'pentru marinadă'),
        },
        {
          ingredient: 'salt',
          quantity: 4,
          unit: 'g',
          note: t('for the marinade', 'pentru marinadă'),
        },
        {
          ingredient: 'sunflower-oil',
          quantity: 15,
          unit: 'ml',
          note: t('for the marinade', 'pentru marinadă'),
        },
        { ingredient: 'butter', quantity: 40, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('finely chopped', 'tocate mărunt'),
        },
        {
          ingredient: 'garlic',
          key: 'garlic-sauce',
          quantity: 10,
          unit: 'g',
          note: t('grated, for the sauce', 'ras, pentru sos'),
        },
        {
          ingredient: 'ginger',
          key: 'ginger-sauce',
          quantity: 12,
          unit: 'g',
          note: t('grated, for the sauce', 'ras, pentru sos'),
        },
        {
          ingredient: 'cumin',
          key: 'cumin-sauce',
          quantity: 4,
          unit: 'g',
          note: t('for the sauce', 'pentru sos'),
        },
        {
          ingredient: 'paprika',
          key: 'paprika-sauce',
          quantity: 6,
          unit: 'g',
          note: t('for the sauce', 'pentru sos'),
        },
        { ingredient: 'garam-masala', quantity: 5, unit: 'g' },
        { ingredient: 'passata', quantity: 400, unit: 'ml' },
        { ingredient: 'sugar', quantity: 5, unit: 'g' },
        {
          ingredient: 'salt',
          key: 'salt-sauce',
          quantity: 4,
          unit: 'g',
          note: t('for the sauce', 'pentru sos'),
        },
        { ingredient: 'whipping-cream', quantity: 150, unit: 'ml' },
        {
          ingredient: 'dried-fenugreek-leaves',
          quantity: 2,
          unit: 'g',
          optional: true,
        },
        {
          ingredient: 'coriander',
          quantity: 15,
          unit: 'g',
          note: t('chopped', 'tocat'),
        },
        { ingredient: 'basmati-rice', quantity: 300, unit: 'g' },
        {
          ingredient: 'still-water',
          key: 'rice-water',
          quantity: 450,
          unit: 'ml',
          note: t('for the rice', 'pentru orez'),
        },
        {
          ingredient: 'salt',
          key: 'salt-rice',
          quantity: 3,
          unit: 'g',
          note: t('for the rice', 'pentru orez'),
        },
      ],
      steps: [
        {
          key: 'marinate',
          text: t(
            'Mix the yogurt, lemon juice, marinade garlic, ginger, paprika, chilli powder, turmeric, cumin, salt and oil in a bowl. Stir in the chicken, cover, and refrigerate for at least 1 hour, up to overnight. Never marinate raw chicken at room temperature.',
            'Amestecă într-un bol iaurtul, zeama de lămâie, usturoiul și ghimbirul pentru marinadă, boiaua, ardeiul iute măcinat, turmericul, chimionul, sarea și uleiul. Adaugă puiul, acoperă și ține la frigider cel puțin 1 oră, până la o noapte. Nu marina niciodată puiul crud la temperatura camerei.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'onion',
          text: t(
            'While the chicken marinates, melt the butter in a wide pot over medium-low heat. Cook the onions for about 12 minutes, stirring, until soft and pale golden.',
            'În timp ce puiul se marinează, topește untul într-o oală lată la foc mic-mediu. Gătește ceapa aproximativ 12 minute, amestecând, până se înmoaie și devine ușor aurie.',
          ),
          timerSeconds: 720,
        },
        {
          key: 'spices',
          text: t(
            'Add the sauce garlic, ginger, cumin, paprika and garam masala and stir for 1 minute, until fragrant.',
            'Adaugă usturoiul și ghimbirul pentru sos, chimionul, boiaua și garam masala și amestecă 1 minut, până miros intens.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'passata',
          text: t(
            'Pour in the passata, add the sugar and sauce salt, and simmer on medium-low for about 15 minutes, stirring now and then, until the sauce is thick and darker red.',
            'Toarnă pasata, adaugă zahărul și sarea pentru sos și fierbe la foc mic-mediu aproximativ 15 minute, amestecând din când în când, până când sosul se îngroașă și capătă un roșu mai închis.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'blend',
          text: t(
            'Blend the sauce until completely smooth with a stick blender, then set it aside off the heat, covered. If the sauce will wait more than 30 minutes before the chicken goes under the grill, cool it and refrigerate it too.',
            'Mixează sosul fin cu un blender vertical, apoi lasă-l acoperit, de pe foc. Dacă sosul va aștepta mai mult de 30 de minute până când puiul ajunge sub grill, răcește-l și pune-l și pe el la frigider.',
          ),
        },
        {
          key: 'preheat',
          text: t(
            'Set the grill to its highest setting with the rack 10 to 15 cm from the heat, and let it heat for 10 minutes.',
            'Pornește grillul cuptorului la maxim, cu grătarul la 10-15 cm de rezistență, și lasă-l să se încălzească 10 minute.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'grill',
          text: t(
            'Lay the chicken on a rack set over a tray in a single layer, not touching, shaking off the excess marinade. Grill for about 7 minutes, until the edges start to char.',
            'Așază puiul pe un grătar așezat peste o tavă, într-un singur strat, fără să se atingă, scuturând marinada în exces. Gătește sub grill aproximativ 7 minute, până când marginile încep să se înnegrească ușor.',
          ),
          timerSeconds: 420,
        },
        {
          key: 'rice',
          text: t(
            'While the chicken grills, rinse the rice until the water runs nearly clear. Bring it to the boil with the rice water and its salt, cover, and cook on the lowest heat for 12 minutes.',
            'Cât se gătește puiul, spală orezul până când apa se limpezește aproape complet. Adu-l la fierbere cu apa pentru orez și sarea lui, acoperă și gătește la foc foarte mic 12 minute.',
          ),
          timerSeconds: 720,
        },
        {
          key: 'turn',
          text: t(
            'Turn the chicken over and grill for about 6 minutes more, until charred in spots and cooked through.',
            'Întoarce puiul și mai gătește sub grill aproximativ 6 minute, până când e rumenit pe alocuri și gătit complet.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'rice-rest',
          text: t(
            'Take the rice off the heat and leave it covered until serving.',
            'Ia orezul de pe foc și ține-l acoperit până la servire.',
          ),
        },
        {
          key: 'combine',
          text: t(
            'Warm the sauce in the pot over medium-low heat, add the chicken and any juices from the tray, and simmer gently for 10 minutes.',
            'Încălzește sosul în oală la foc mic-mediu, adaugă puiul și zeama de pe tavă și fierbe domol 10 minute.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'check',
          text: t(
            'Cut open the thickest piece of chicken. It is cooked through when it is white with no pink, the juices run clear, and a thermometer reads 75 °C. If not, simmer a few minutes more.',
            'Taie cea mai groasă bucată de pui. E gătită când e albă, fără roz, zeama curge limpede, iar termometrul arată 75 °C. Dacă nu, mai fierbe câteva minute.',
          ),
        },
        {
          key: 'cream',
          text: t(
            'Turn the heat to low and stir in the cream, crushing the fenugreek leaves between your fingers over the pot if using. Warm for 2 minutes without boiling, then taste for salt.',
            'Dă focul la minim și amestecă frișca, frecând frunzele de schinduf între degete deasupra oalei, dacă folosești. Încălzește 2 minute fără să fiarbă, apoi gustă de sare.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'serve',
          text: t(
            'Fluff the rice with a fork. Serve the curry over the rice, scattered with the coriander.',
            'Răscolește orezul cu furculița. Servește curry-ul peste orez, presărat cu coriandru.',
          ),
        },
      ],
      tips: [
        t(
          'The darker, charred edges on the chicken are what give this dish its smoky depth, but pull the tray out before they turn black and bitter.',
          'Marginile mai închise, arse ușor, dau preparatului gustul afumat, dar scoate tava înainte să devină negre și amare.',
        ),
      ],
      stepTips: [
        {
          step: 'cream',
          text: t(
            'Add the cream last and keep it below a boil so the sauce stays smooth and the cream tastes fresh; lighter creams split if boiled.',
            'Adaugă frișca la sfârșit și nu o lăsa să fiarbă, ca sosul să rămână fin și frișca să aibă gust proaspăt; frișcile mai slabe se taie dacă fierb.',
          ),
        },
      ],
      nutritionNote: t(
        'Grilling lets some of the chicken fat drip away, and the yogurt marinade and tomatoes add flavour without much oil. The butter and cream bring a lot of saturated fat and the sauce is salty, so treat it as a richer meal and keep the rice portion modest.',
        'Grătarul lasă o parte din grăsimea puiului să se scurgă, iar marinada de iaurt și roșiile dau gust fără mult ulei. Untul și frișca aduc multe grăsimi saturate, iar sosul e sărat, așa că tratează-l ca pe o masă mai bogată și ia o porție moderată de orez.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Naan', 'Naan'),
          reason: t(
            'Soft bread for scooping up the creamy sauce.',
            'Pâine moale cu care ștergi sosul cremos.',
          ),
          principle: 'complement_flavour',
          ingredient: 'naan',
        },
        {
          kind: 'food',
          label: t('Red onion', 'Ceapă roșie'),
          reason: t(
            'Thin raw rings, with a squeeze of lemon, add a sharp crunch against the creamy sauce.',
            'Rondele subțiri de ceapă crudă, cu zeamă de lămâie, adaugă un crocant acrișor lângă sosul cremos.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'red-onion',
        },
        {
          kind: 'food',
          label: t('Mango chutney', 'Chutney de mango'),
          reason: t(
            'Its sweet-sharp tang lifts the rich sauce.',
            'Gustul dulce-acrișor înviorează sosul bogat.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'mango-chutney',
        },
        {
          kind: 'drink',
          label: t('Cold lager', 'Bere blondă rece'),
          reason: t(
            'Its fizz and light bitterness cut through the cream.',
            'Bulele și amăreala ușoară taie bogăția frișcii.',
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
            'A warm, creamy, gently spiced dish for a cold evening.',
            'Un preparat cald, cremos, cu condimente blânde, pentru o seară rece.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Protein from the chicken and carbohydrates from the rice.',
            'Proteine din pui și carbohidrați din orez.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Cream and butter sit heavy in the stomach during hard exercise.',
            'Frișca și untul cad greu la stomac în timpul unui efort intens.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A rich, creamy meal close to bedtime can disturb sleep.',
            'O masă bogată și cremoasă aproape de culcare poate strica somnul.',
          ),
        },
      ],
    },
  ],
};
