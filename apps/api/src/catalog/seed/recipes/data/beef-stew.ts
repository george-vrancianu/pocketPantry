import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Beef stew base is a floured, browned chuck braised in stock with root
// vegetables. Each Variant is a full Recipe with its own lines, steps and
// guidance; the base's Recipe-level Tips (storage, gentle heat, seasoning at
// the end) hold for every Variant, so none is hidden.
export const beefStew: BaseRecipeSeed = {
  slug: 'beef-stew',
  title: t('Beef stew', 'Vită înăbușită cu legume'),
  servings: 6,
  prepMinutes: 30,
  cookMinutes: 170,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'beef-for-stew',
      quantity: 1000,
      unit: 'g',
      note: t('chuck, in 4 cm cubes', 'spată de vită, cuburi de 4 cm'),
    },
    { ingredient: 'flour', quantity: 40, unit: 'g' },
    { ingredient: 'sunflower-oil', quantity: 60, unit: 'ml' },
    {
      ingredient: 'onion',
      quantity: 2,
      unit: 'pcs',
      note: t('sliced', 'tăiată felii'),
    },
    {
      ingredient: 'celery',
      quantity: 150,
      unit: 'g',
      note: t('in 1 cm slices', 'felii de 1 cm'),
    },
    {
      ingredient: 'garlic',
      quantity: 15,
      unit: 'g',
      note: t('crushed', 'zdrobit'),
    },
    { ingredient: 'tomato-paste', quantity: 30, unit: 'g' },
    { ingredient: 'worcestershire-sauce', quantity: 15, unit: 'ml' },
    { ingredient: 'beef-stock', quantity: 900, unit: 'ml' },
    {
      ingredient: 'thyme',
      quantity: 4,
      unit: 'g',
      note: t('a few sprigs', 'câteva crenguțe'),
    },
    {
      ingredient: 'bay-leaves',
      quantity: 0.4,
      unit: 'g',
      note: t('2 leaves', '2 foi'),
    },
    {
      ingredient: 'carrot',
      quantity: 300,
      unit: 'g',
      note: t('in 3 cm chunks', 'bucăți de 3 cm'),
    },
    {
      ingredient: 'potato',
      quantity: 0.6,
      unit: 'kg',
      note: t('in 3 cm chunks', 'bucăți de 3 cm'),
    },
    { ingredient: 'salt', quantity: 9, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
    {
      ingredient: 'parsley',
      quantity: 10,
      unit: 'g',
      note: t('chopped, to finish', 'tocat, pentru final'),
    },
  ],
  steps: [
    {
      key: 'preheat',
      text: t(
        'Put a rack in the lower third and heat the oven to 160°C (140°C fan) while you prepare the beef.',
        'Pune grătarul în treimea de jos a cuptorului și încălzește cuptorul la 160°C (140°C cu ventilator) cât pregătești carnea.',
      ),
    },
    {
      key: 'season',
      text: t(
        'Pat the beef very dry with paper towels. Toss it in a bowl with the flour, 5 g of the salt and the pepper until every cube is lightly coated.',
        'Șterge carnea bine cu prosoape de hârtie. Amestec-o într-un bol cu făina, 5 g din sare și piperul, până când fiecare cub e acoperit subțire.',
      ),
    },
    {
      key: 'brown-first',
      text: t(
        'Heat 20 ml of the oil in a heavy 5 litre ovenproof pot over medium-high heat. Add a third of the beef in a single layer and brown it for about 8 minutes, turning, until deep brown on most sides. Lift it onto a plate.',
        'Încinge 20 ml din ulei într-o oală grea de 5 litri, potrivită pentru cuptor, la foc mare-mediu. Adaugă o treime din carne într-un singur strat și rumenește-o aproximativ 8 minute, întorcând-o, până se face maro închis pe aproape toate părțile. Scoate-o pe o farfurie.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'brown-rest',
      text: t(
        'Brown the other two thirds in the same way, one batch at a time with 20 ml of oil each, about 8 minutes per batch. Put them with the first batch.',
        'Rumenește la fel restul de carne, câte o tură pe rând, cu câte 20 ml de ulei, aproximativ 8 minute pentru fiecare. Pune-le laolaltă cu prima tură.',
      ),
      timerSeconds: 960,
    },
    {
      key: 'soften',
      text: t(
        'Lower the heat to medium. Add the onions and celery and cook for about 8 minutes, scraping up the brown bits from the bottom, until the onions are soft and golden at the edges.',
        'Dă focul la mediu. Adaugă ceapa și țelina și gătește aproximativ 8 minute, răzuind bucățelele rumenite de pe fund, până când ceapa se înmoaie și capătă margini aurii.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'paste',
      text: t(
        'Stir in the garlic and tomato paste and cook for 1 minute, until the paste darkens to brick red.',
        'Adaugă usturoiul și pasta de roșii și gătește 1 minut, până când pasta se închide la culoare, spre roșu-cărămiziu.',
      ),
      timerSeconds: 60,
    },
    {
      key: 'liquid',
      text: t(
        'Pour in the stock and Worcestershire sauce, add the thyme, bay leaves, the beef and any juices on the plate, and stir. Bring to a gentle boil, which takes about 5 minutes.',
        'Toarnă supa și sosul Worcestershire, adaugă cimbrul, foile de dafin, carnea și zeama de pe farfurie și amestecă. Adu la fierbere încet, ceea ce durează aproximativ 5 minute.',
      ),
    },
    {
      key: 'braise',
      text: t(
        'Cover the pot, move it to the oven and braise for 1 hour 15 minutes.',
        'Acoperă oala, du-o în cuptor și lasă-o să se înăbușe 1 oră și 15 minute.',
      ),
      timerSeconds: 4500,
    },
    {
      key: 'vegetables',
      text: t(
        'Stir in the carrots and potatoes, pushing them under the liquid. Cover and return to the oven for 45 minutes, until a cube of beef crushes easily against the side of the pot with a fork and a knife slides through the potato.',
        'Adaugă morcovii și cartofii, scufundându-i în lichid. Acoperă și pune la loc în cuptor pentru 45 de minute, până când un cub de carne se zdrobește ușor cu furculița de peretele oalei, iar cuțitul intră fără efort în cartof.',
      ),
      timerSeconds: 2700,
    },
    {
      key: 'finish',
      text: t(
        'Take the pot out, fish out the thyme stalks and bay leaves and spoon off the fat on top. Set it over medium heat and simmer uncovered for 10 minutes to thicken the gravy until it lightly coats a spoon. Taste and add the rest of the salt, then stir in the parsley.',
        'Scoate oala, ia afară crenguțele de cimbru și foile de dafin și ridică grăsimea de la suprafață. Pune oala pe foc mediu și fierbe fără capac 10 minute, ca sosul să se îngroașe până acoperă ușor lingura. Gustă, adaugă restul de sare și amestecă pătrunjelul.',
      ),
      timerSeconds: 600,
    },
  ],
  tips: [
    t(
      'Cool leftovers within 2 hours, keep them covered in the fridge for up to 3 days and reheat until steaming hot all the way through. The flavour is deeper on the second day.',
      'Răcește rămășițele în cel mult 2 ore, păstrează-le acoperite la frigider până la 3 zile și reîncălzește-le până fierb bine în toată masa. Gustul e mai profund a doua zi.',
    ),
    t(
      'Braise, do not boil: the liquid should barely bubble. Hard boiling makes beef tough and stringy, however long it cooks.',
      'Fierbe la foc mic, nu la foc tare: lichidul trebuie să bolborosească abia. Fierberea puternică face carnea de vită tare și fibroasă, oricât ar sta pe foc.',
    ),
    t(
      'Season lightly at the start and finish the salt at the end: the liquid reduces and gets saltier as it cooks.',
      'Sărează puțin la început și completează sarea la final: lichidul scade și devine mai sărat pe parcurs.',
    ),
  ],
  stepTips: [
    {
      step: 'brown-first',
      text: t(
        'Dry, floured cubes and a pot that is not crowded brown instead of steaming grey. The brown crust is where much of the flavour of the gravy comes from.',
        'Cuburile uscate și tăvălite prin făină, într-o oală neaglomerată, se rumenesc în loc să se fiarbă și să rămână cenușii. Crusta maro dă mare parte din gustul sosului.',
      ),
    },
    {
      step: 'vegetables',
      text: t(
        'Judge the beef by feel, not by the clock: chuck needs longer if your cubes are big. If a cube still resists, give it another 20 minutes.',
        'Judecă carnea după cum se simte, nu după ceas: spata are nevoie de mai mult timp dacă bucățile sunt mari. Dacă un cub încă opune rezistență, mai dă-i 20 de minute.',
      ),
    },
  ],
  nutritionNote: t(
    'A filling dish with plenty of protein and iron from the beef, and fibre and vitamins from the vegetables. The stock, Worcestershire sauce and added salt make it salty, and chuck carries saturated fat: skim the top and go easy on the salt.',
    'Un fel sățios, cu multe proteine și fier din carne, plus fibre și vitamine din legume. Supa, sosul Worcestershire și sarea îl fac sărat, iar spata are grăsimi saturate: ridică grăsimea de deasupra și ai grijă cu sarea.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Crusty country bread', 'Pâine de casă cu crustă'),
      reason: t(
        'The crisp crust gives the soft stew a contrast and mops up the gravy.',
        'Crusta crocantă face contrast cu tocana moale și adună sosul din farfurie.',
      ),
      principle: 'contrast_texture',
      ingredient: 'country-bread',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sharp acidity cuts through the rich, fatty gravy.',
        'Aciditatea lor ascuțită taie din bogăția sosului gras.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'food',
      label: t('Crisp green beans', 'Fasole verde crocantă'),
      reason: t(
        'A quickly cooked green vegetable that stays crisp beside the very soft stew.',
        'O legumă verde fiartă scurt, care rămâne crocantă lângă mâncarea foarte moale.',
      ),
      principle: 'contrast_texture',
      ingredient: 'green-beans',
    },
    {
      kind: 'drink',
      label: t('Dark beer', 'Bere neagră'),
      reason: t(
        'Its malty bitterness balances the rich, savoury gravy.',
        'Amăreala ei maltată echilibrează sosul bogat și sărat.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'dark-beer',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot, hearty stew warms you up on a cold day.',
        'O mâncare fierbinte și sățioasă te încălzește într-o zi rece.',
      ),
    },
    {
      moment: 'after-workout',
      polarity: 'good_for',
      reason: t(
        'Protein from the beef and carbohydrates from the potatoes help recovery.',
        'Proteinele din carne și carbohidrații din cartofi ajută la refacere.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A large, rich stew sits heavy before bed.',
        'O porție mare de mâncare grasă cade greu înainte de culcare.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'Hours of oven heat and a heavy plate are the wrong thing in hot weather.',
        'Ore întregi de cuptor și o farfurie grea nu se potrivesc pe vreme caldă.',
      ),
    },
  ],
  variants: [
    {
      slug: 'beef-stew-french',
      cuisine: 'french',
      title: t(
        'Boeuf bourguignon',
        'Boeuf bourguignon (vită în vin roșu, ca în Burgundia)',
      ),
      servings: 6,
      prepMinutes: 40,
      cookMinutes: 200,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'beef-for-stew',
          quantity: 1200,
          unit: 'g',
          note: t('chuck, in 5 cm cubes', 'spată de vită, cuburi de 5 cm'),
        },
        {
          ingredient: 'bacon',
          quantity: 150,
          unit: 'g',
          note: t(
            'slab, cut into lardons 1.5 cm thick',
            'bucată, tăiată în bastonașe de 1,5 cm',
          ),
        },
        { ingredient: 'sunflower-oil', quantity: 30, unit: 'ml' },
        {
          ingredient: 'red-wine',
          quantity: 750,
          unit: 'ml',
          note: t('a dry Burgundy-style red', 'vin roșu sec, de tip Burgundia'),
        },
        { ingredient: 'beef-stock', quantity: 300, unit: 'ml' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely chopped', 'tocată mărunt'),
        },
        {
          ingredient: 'carrot',
          quantity: 200,
          unit: 'g',
          note: t('diced 1 cm', 'cubulețe de 1 cm'),
        },
        {
          ingredient: 'garlic',
          quantity: 12,
          unit: 'g',
          note: t('crushed', 'zdrobit'),
        },
        { ingredient: 'tomato-paste', quantity: 20, unit: 'g' },
        { ingredient: 'flour', quantity: 30, unit: 'g' },
        {
          ingredient: 'thyme',
          quantity: 4,
          unit: 'g',
          note: t('a few sprigs', 'câteva crenguțe'),
        },
        {
          ingredient: 'bay-leaves',
          quantity: 0.4,
          unit: 'g',
          note: t('2 leaves', '2 foi'),
        },
        {
          ingredient: 'pearl-onions',
          quantity: 300,
          unit: 'g',
          note: t('small, fresh', 'mici, proaspete'),
        },
        {
          ingredient: 'button-mushrooms',
          quantity: 300,
          unit: 'g',
          note: t(
            'halved, or quartered if large',
            'tăiate în două, sau în patru dacă sunt mari',
          ),
        },
        { ingredient: 'butter', quantity: 40, unit: 'g' },
        { ingredient: 'salt', quantity: 6, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 2, unit: 'g' },
        {
          ingredient: 'parsley',
          quantity: 10,
          unit: 'g',
          note: t('chopped, to finish', 'tocat, pentru final'),
        },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Put a rack in the lower third and heat the oven to 160°C (140°C fan) while you prepare the beef.',
            'Pune grătarul în treimea de jos a cuptorului și încălzește cuptorul la 160°C (140°C cu ventilator) cât pregătești carnea.',
          ),
        },
        {
          key: 'lardons',
          text: t(
            'Put the lardons and the oil in a heavy 5 litre ovenproof pot over medium heat. Cook for about 8 minutes, stirring, until the fat runs and the edges are golden. Lift the lardons out with a slotted spoon and leave the fat in the pot.',
            'Pune bastonașele de bacon și uleiul într-o oală grea de 5 litri, potrivită pentru cuptor, la foc mediu. Gătește aproximativ 8 minute, amestecând, până când grăsimea se topește și marginile se auresc. Scoate baconul cu o lingură cu găuri și lasă grăsimea în oală.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'brown-first',
          text: t(
            'Pat the beef very dry and season it with 4 g of the salt and the pepper. Turn the heat to medium-high, add a third of the beef in a single layer and brown it for about 8 minutes, turning, until deep brown. Lift it onto a plate.',
            'Șterge carnea bine cu prosoape de hârtie și presară peste ea 4 g din sare și piperul. Dă focul la mare-mediu, adaugă o treime din carne într-un singur strat și rumenește-o aproximativ 8 minute, întorcând-o, până se face maro închis. Scoate-o pe o farfurie.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'brown-rest',
          text: t(
            'Brown the other two thirds in the same way, one batch at a time, about 8 minutes per batch. Put them with the first batch and the lardons.',
            'Rumenește la fel restul de carne, câte o tură pe rând, aproximativ 8 minute pentru fiecare. Pune-le laolaltă cu prima tură și cu baconul.',
          ),
          timerSeconds: 960,
        },
        {
          key: 'soften',
          text: t(
            'Lower the heat to medium. Add the chopped onion and the carrots and cook for about 6 minutes, scraping up the brown bits, until the onion is soft.',
            'Dă focul la mediu. Adaugă ceapa tocată și morcovii și gătește aproximativ 6 minute, răzuind bucățelele rumenite de pe fund, până când ceapa se înmoaie.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'flour',
          text: t(
            'Return the beef and lardons to the pot, sprinkle over the flour and stir for 2 minutes until no dry flour is left.',
            'Pune la loc carnea și baconul în oală, presară făina și amestecă 2 minute, până nu mai rămâne făină uscată.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'paste',
          text: t(
            'Push the beef aside, add the garlic and tomato paste in the cleared space and cook for 1 minute, then stir everything together.',
            'Dă carnea într-o parte, adaugă usturoiul și pasta de roșii în locul eliberat și gătește 1 minut, apoi amestecă totul.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'wine',
          text: t(
            'Pour in the wine, scraping the bottom of the pot, and bring to the boil. Boil hard for 5 minutes to cook off the raw edge of the alcohol.',
            'Toarnă vinul, răzuind fundul oalei, și adu la fierbere. Fierbe tare 5 minute, ca să piardă tăria alcoolului.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'liquid',
          text: t(
            'Add the stock, thyme and bay leaves and bring back to a gentle simmer, which takes about 3 minutes. The beef should be just covered.',
            'Adaugă supa, cimbrul și foile de dafin și adu din nou la o fierbere ușoară, ceea ce durează aproximativ 3 minute. Carnea trebuie să fie abia acoperită de lichid.',
          ),
        },
        {
          key: 'braise',
          text: t(
            'Cover the pot, move it to the oven and braise for 2 hours 15 minutes, until a cube of beef crushes easily against the side of the pot with a fork. If one still resists, give it another 20 minutes.',
            'Acoperă oala, du-o în cuptor și lasă-o să se înăbușe 2 ore și 15 minute, până când un cub de carne se zdrobește ușor cu furculița de peretele oalei. Dacă unul încă opune rezistență, mai dă-i 20 de minute.',
          ),
          timerSeconds: 8100,
        },
        {
          key: 'peel-onions',
          text: t(
            'While the stew braises, boil the pearl onions in a pan of water for 1 minute. Drain, rinse under cold water, trim the root end and slip off the skins.',
            'Cât timp se fierbe tocana în cuptor, fierbe ceapa perlată 1 minut într-o cratiță cu apă. Scurge-o, clătește-o sub apă rece, taie vârful cu rădăcina și curăță-le de coajă.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'fry-onions',
          text: t(
            'Still while the stew braises, melt 20 g of the butter in a frying pan over medium heat. Fry the pearl onions for 12 minutes, shaking the pan, until golden in spots and just tender when pierced with a knife. Tip them onto a plate.',
            'Tot cât timp se fierbe tocana, topește 20 g din unt într-o tigaie la foc mediu. Prăjește ceapa perlată 12 minute, scuturând tigaia, până se aurește pe alocuri și se înmoaie când o străpungi cu cuțitul. Pune-o pe o farfurie.',
          ),
          timerSeconds: 720,
        },
        {
          key: 'fry-mushrooms',
          text: t(
            'Wipe the pan, melt the remaining 20 g of butter over medium-high heat and fry the mushrooms for about 8 minutes, in two batches if they crowd the pan, until golden and the liquid they release has cooked away. Season with a pinch of salt.',
            'Șterge tigaia, topește restul de 20 g de unt la foc mare-mediu și prăjește ciupercile aproximativ 8 minute, în două ture dacă înghesuie tigaia, până se auresc și lichidul eliberat s-a evaporat. Presară un praf de sare peste ele.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'finish',
          text: t(
            'Take the pot out, fish out the thyme stalks and bay leaves and spoon off the fat on top. Stir in the fried onions and mushrooms and simmer uncovered over medium heat for 10 minutes, until the sauce is glossy, lightly coats a spoon and the garnish is hot through. Taste, add the rest of the salt and sprinkle with the parsley.',
            'Scoate oala, ia afară crenguțele de cimbru și foile de dafin și ridică grăsimea de la suprafață. Amestecă ceapa și ciupercile prăjite și fierbe fără capac, la foc mediu, 10 minute, până când sosul e lucios, acoperă ușor lingura, iar garnitura e fierbinte. Gustă, adaugă restul de sare și presară pătrunjel.',
          ),
          timerSeconds: 600,
        },
      ],
      hideBaseTips: [1],
      tips: [
        t(
          'Only the wine gets a hard boil, at the start. Once the pot is covered in the oven, keep the stew at a barely bubbling braise: hard boiling toughens beef.',
          'Doar vinul se fierbe tare, la început. După ce oala acoperită intră în cuptor, ține mâncarea la un clocot abia perceptibil: fierberea puternică face carnea tare.',
        ),
        t(
          'Marinating the beef in the wine overnight in the fridge deepens the flavour, but dry it well before browning or it will steam; use the wine from the marinade in the recipe. It also works well without the marinade.',
          'Dacă marinezi carnea în vin peste noapte, la frigider, gustul e mai adânc, dar șterge-o bine înainte de rumenit, altfel se fierbe în loc să se rumenească; folosește la rețetă vinul din marinadă. Iese bine și fără marinadă.',
        ),
      ],
      stepTips: [
        {
          step: 'wine',
          text: t(
            'Use a wine you would drink. Its acidity and fruit carry the sauce, and a thin, sour wine gives a thin, sour sauce.',
            'Folosește un vin pe care l-ai bea. Aciditatea și fructul lui duc sosul, iar un vin slab și acru dă un sos slab și acru.',
          ),
        },
        {
          step: 'fry-mushrooms',
          text: t(
            'Do not salt the mushrooms until they are golden; early salt draws out water and they stew instead of browning.',
            'Nu săra ciupercile decât după ce s-au rumenit; sarea pusă devreme scoate apa din ele și se fierb în loc să se rumenească.',
          ),
        },
      ],
      nutritionNote: t(
        'Rich in protein and iron from the beef, with some vegetables and mushrooms. The bacon, butter and wine sauce make it heavy in saturated fat and salt, and it carries little fibre: serve it with a green vegetable and keep the portion moderate.',
        'Bogat în proteine și fier din carne, cu ceva legume și ciuperci. Baconul, untul și sosul cu vin îl fac încărcat cu grăsimi saturate și sare și sărac în fibre: servește-l cu o legumă verde și o porție moderată.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('French mashed potatoes', 'Piure de cartofi franțuzesc'),
          reason: t(
            'Butter-rich purée takes up the wine sauce, so the fat carries the flavour to every forkful.',
            'Piureul bogat în unt absoarbe sosul de vin, iar grăsimea duce aroma la fiecare îmbucătură.',
          ),
          principle: 'fat_carries_flavour',
          recipe: 'potato-puree-french',
        },
        {
          kind: 'food',
          label: t('Buttered egg noodles', 'Tăiței cu ou și unt'),
          reason: t(
            'A plain, soft base to soak up the sauce when you do not want potatoes.',
            'O garnitură simplă și moale care absoarbe sosul când nu vrei cartofi.',
          ),
          principle: 'complement_flavour',
          ingredient: 'egg-noodles',
        },
        {
          kind: 'food',
          label: t('Crusty country bread', 'Pâine de casă cu crustă'),
          reason: t(
            'The crisp crust mops up the wine sauce.',
            'Crusta crocantă adună sosul de vin.',
          ),
          principle: 'contrast_texture',
          ingredient: 'country-bread',
        },
        {
          kind: 'food',
          label: t('Crisp green beans', 'Fasole verde crocantă'),
          reason: t(
            'A quickly cooked green vegetable adds the fresh, crisp contrast the stew lacks.',
            'O legumă verde fiartă scurt aduce prospețimea și crocanțul care lipsesc din tocană.',
          ),
          principle: 'contrast_texture',
          ingredient: 'green-beans',
        },
        {
          kind: 'drink',
          label: t('A red Burgundy', 'Un vin roșu de Burgundia'),
          reason: t(
            'A glass of the same style of wine as in the pot echoes the sauce.',
            'Un pahar din același fel de vin ca cel din oală face ecou sosului.',
          ),
          principle: 'complement_flavour',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'A slow-cooked, warming dish for a cold day.',
            'O mâncare gătită lent și încălzitoare pentru o zi rece.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Bacon, butter and a wine sauce sit heavy before bed.',
            'Baconul, untul și sosul cu vin cad greu înainte de culcare.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'More than two hours of oven heat and a heavy plate suit cool weather.',
            'Peste două ore de cuptor și o farfurie grea se potrivesc vremii răcoroase.',
          ),
        },
      ],
    },
    {
      slug: 'beef-stew-scandinavian',
      cuisine: 'scandinavian',
      title: t(
        'Danish beef and potato stew (skipperlabskovs)',
        'Vită cu cartofi, ca în Danemarca (skipperlabskovs)',
      ),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 170,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'beef-for-stew',
          quantity: 600,
          unit: 'g',
          note: t('in 2.5 cm cubes', 'cuburi de 2,5 cm'),
        },
        {
          ingredient: 'butter',
          quantity: 35,
          unit: 'g',
          note: t(
            '20 g for browning, 15 g to finish',
            '20 g pentru rumenit, 15 g pentru final',
          ),
        },
        {
          ingredient: 'onion',
          quantity: 2,
          unit: 'pcs',
          note: t('sliced', 'tăiată felii'),
        },
        { ingredient: 'still-water', quantity: 0.9, unit: 'l' },
        {
          ingredient: 'peppercorns',
          quantity: 1,
          unit: 'g',
          note: t(
            'about 15, tied in cheesecloth with the bay',
            'aproximativ 15, legate cu dafinul într-o bucată de tifon',
          ),
        },
        {
          ingredient: 'bay-leaves',
          quantity: 0.4,
          unit: 'g',
          note: t('2 leaves', '2 foi'),
        },
        {
          ingredient: 'potato',
          quantity: 0.8,
          unit: 'kg',
          note: t('floury, in 3 cm chunks', 'făinoși, bucăți de 3 cm'),
        },
        { ingredient: 'salt', quantity: 8, unit: 'g' },
        {
          ingredient: 'chives',
          quantity: 10,
          unit: 'g',
          note: t('snipped, to finish', 'tăiat mărunt, pentru final'),
        },
        {
          ingredient: 'rye-bread',
          quantity: 4,
          unit: 'pcs',
          note: t('slices, to serve', 'felii, pentru servire'),
        },
        {
          ingredient: 'canned-beetroot',
          quantity: 200,
          unit: 'g',
          note: t('sliced, to serve', 'felii, pentru servire'),
        },
      ],
      steps: [
        {
          key: 'brown-first',
          text: t(
            'Pat the beef dry. Melt 10 g of the butter in a heavy 3 litre pot over medium-high heat, add half the beef in a single layer and brown it for about 6 minutes, turning, until browned on most sides. Lift it onto a plate.',
            'Șterge carnea cu prosoape de hârtie. Topește 10 g din unt într-o oală grea de 3 litri la foc mare-mediu, adaugă jumătate din carne într-un singur strat și rumenește-o aproximativ 6 minute, întorcând-o, până se rumenește pe aproape toate părțile. Scoate-o pe o farfurie.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'brown-rest',
          text: t(
            'Melt another 10 g of butter and brown the second half the same way, about 6 minutes. Put it with the first batch.',
            'Topește încă 10 g de unt și rumenește la fel a doua jumătate, aproximativ 6 minute. Pune-o laolaltă cu prima tură.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'onions',
          text: t(
            'Lower the heat to medium, add the onions to the pot and cook for about 5 minutes, scraping up the brown bits, until soft.',
            'Dă focul la mediu, adaugă ceapa în oală și gătește aproximativ 5 minute, răzuind bucățelele rumenite de pe fund, până se înmoaie.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'liquid',
          text: t(
            'Return the beef with its juices to the pot. Add the water and 4 g of the salt. Tie the peppercorns and bay leaves in a square of cheesecloth and add the bundle. Bring to the boil, which takes about 6 minutes, and skim off the grey foam.',
            'Pune la loc carnea cu zeama ei în oală. Adaugă apa și 4 g din sare. Leagă boabele de piper și foile de dafin într-o bucată de tifon și pune legătura în oală. Adu la fierbere, ceea ce durează aproximativ 6 minute, și ia spuma cenușie de la suprafață.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Turn the heat down so the water barely bubbles, cover and simmer for 1 hour 30 minutes, until the beef is nearly tender.',
            'Micșorează focul ca apa să bolborosească abia, acoperă și fierbe 1 oră și 30 de minute, până când carnea e aproape fragedă.',
          ),
          timerSeconds: 5400,
        },
        {
          key: 'potatoes',
          text: t(
            'Add the potatoes, pushing them under the liquid. Cover and simmer for 45 minutes, until a knife slides into a potato with no resistance and the edges have started to crumble into the broth.',
            'Adaugă cartofii, scufundându-i în lichid. Acoperă și fierbe 45 de minute, până când cuțitul intră fără rezistență în cartof, iar marginile încep să se desfacă în supă.',
          ),
          timerSeconds: 2700,
        },
        {
          key: 'thicken',
          text: t(
            'Uncover and crush about a third of the potatoes against the side of the pot with a wooden spoon. Simmer for 5 minutes, stirring, until the stew is thick like a coarse porridge. A cube of beef should break apart under a fork.',
            'Scoate capacul și zdrobește aproximativ o treime din cartofi de peretele oalei cu o lingură de lemn. Fierbe 5 minute, amestecând, până când mâncarea se îngroașe ca un terci gros. Un cub de carne trebuie să se desfacă sub furculiță.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'finish',
          text: t(
            'Lift out the cheesecloth bundle, taste and add the rest of the salt. Ladle into bowls and top each with a little of the remaining butter and the chives. Serve with the rye bread and beetroot.',
            'Ia afară legătura de tifon, gustă și adaugă restul de sare. Pune în boluri și pune peste fiecare puțin din untul rămas și arpagicul. Servește cu pâine de secară și sfeclă.',
          ),
        },
      ],
      tips: [
        t(
          'Use floury potatoes such as Maris Piper or Russet; waxy ones hold their shape and will not thicken the stew.',
          'Folosește cartofi făinoși; cei ceroși își păstrează forma și nu îngroașă mâncarea.',
        ),
      ],
      stepTips: [
        {
          step: 'simmer',
          text: t(
            'Cubes this small are usually tender in 1 hour 30 minutes, but if one still resists a fork, simmer another 15 minutes before adding the potatoes.',
            'Cuburile atât de mici sunt de obicei fragede în 1 oră și 30 de minute, dar dacă unul încă opune rezistență furculiței, mai fierbe 15 minute înainte să pui cartofii.',
          ),
        },
        {
          step: 'finish',
          text: t(
            'The beetroot and rye bread are not a garnish: their sharpness is what balances the soft, mild stew.',
            'Sfecla și pâinea de secară nu sunt doar decor: acreala lor echilibrează mâncarea moale și blândă.',
          ),
        },
      ],
      nutritionNote: t(
        'Beef gives protein and iron, and the potatoes make it a filling plate with plenty of carbohydrate. It has little in the way of vegetables beyond onion, and the pickled beetroot adds sugar and salt; add a salad or a green vegetable.',
        'Carnea aduce proteine și fier, iar cartofii fac din el o masă sățioasă, bogată în carbohidrați. Are puține legume în afară de ceapă, iar sfecla murată adaugă zahăr și sare; completează cu o salată sau o legumă verde.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Pickled cucumbers', 'Castraveți murați'),
          reason: t(
            'A sharp, crunchy bite that cuts the mild, soft stew.',
            'O notă ascuțită și crocantă care taie din blândețea mâncării moi.',
          ),
          principle: 'contrast_texture',
          ingredient: 'pickled-cucumbers',
        },
        {
          kind: 'drink',
          label: t('Beer', 'Bere'),
          reason: t(
            'Cold, bubbly beer refreshes the palate between spoonfuls of the buttery stew.',
            'Berea rece și spumoasă împrospătează gustul între lingurile de mâncare cu unt.',
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
            'Warm, soft and filling on a cold day.',
            'Caldă, moale și sățioasă într-o zi rece.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A big bowl of potato and beef sits heavy before bed.',
            'Un bol mare de cartofi cu carne cade greu înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'beef-stew-hungarian',
      cuisine: 'hungarian',
      title: t('Hungarian goulash (gulyás)', 'Gulaș unguresc (gulyás)'),
      servings: 6,
      prepMinutes: 40,
      cookMinutes: 165,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'beef-shank',
          quantity: 1200,
          unit: 'g',
          note: t('boneless, in 3 cm cubes', 'fără os, cuburi de 3 cm'),
        },
        { ingredient: 'lard', quantity: 60, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 3,
          unit: 'pcs',
          note: t('large, finely chopped', 'mari, tocate mărunt'),
        },
        {
          ingredient: 'paprika',
          quantity: 30,
          unit: 'g',
          note: t('sweet', 'dulce'),
        },
        {
          ingredient: 'caraway-seeds',
          quantity: 2,
          unit: 'g',
          note: t('crushed in a mortar', 'pisate în mojar'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t('crushed', 'zdrobit'),
        },
        { ingredient: 'still-water', quantity: 1.8, unit: 'l' },
        {
          ingredient: 'carrot',
          quantity: 250,
          unit: 'g',
          note: t('in 1 cm slices', 'felii de 1 cm'),
        },
        {
          ingredient: 'parsley-root',
          quantity: 150,
          unit: 'g',
          note: t('in 1 cm slices', 'felii de 1 cm'),
        },
        {
          ingredient: 'bell-pepper',
          quantity: 1,
          unit: 'pcs',
          note: t('pale, diced', 'ardei gras deschis la culoare, cubulețe'),
        },
        {
          ingredient: 'tomato',
          quantity: 200,
          unit: 'g',
          note: t('diced', 'cubulețe'),
        },
        {
          ingredient: 'hot-pepper',
          quantity: 1,
          unit: 'pcs',
          optional: true,
          note: t('whole, for gentle heat', 'întreg, pentru iuțeală ușoară'),
        },
        {
          ingredient: 'potato',
          quantity: 0.6,
          unit: 'kg',
          note: t('in 2 cm cubes', 'cuburi de 2 cm'),
        },
        {
          ingredient: 'flour',
          quantity: 100,
          unit: 'g',
          note: t('for the csipetke', 'pentru csipetke'),
        },
        {
          ingredient: 'eggs',
          quantity: 1,
          unit: 'pcs',
          note: t('for the csipetke', 'pentru csipetke'),
        },
        { ingredient: 'salt', quantity: 16, unit: 'g' },
      ],
      steps: [
        {
          key: 'onions',
          text: t(
            'Melt the lard in a heavy 5 litre pot over medium heat. Add the onions and cook for about 15 minutes, stirring often, until they are very soft and pale golden, with no brown edges.',
            'Topește untura într-o oală grea de 5 litri la foc mediu. Adaugă ceapa și gătește aproximativ 15 minute, amestecând des, până când e foarte moale și galben-pal, fără să se rumenească pe margini.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'paprika',
          text: t(
            'Take the pot off the heat. Stir in the paprika, caraway and garlic, then immediately pour in 100 ml of the water to stop the paprika scorching.',
            'Ia oala de pe foc. Amestecă boiaua, chimenul și usturoiul, apoi toarnă imediat 100 ml din apă, ca boiaua să nu se ardă.',
          ),
        },
        {
          key: 'stew-beef',
          text: t(
            'Stir in the beef and 8 g of the salt. Return to low-medium heat, cover and cook for 20 minutes, stirring now and then, until the beef has given off its juices and turned grey-brown.',
            'Amestecă carnea și 8 g din sare. Pune oala la loc pe foc mic-mediu, acoperă și gătește 20 de minute, amestecând din când în când, până când carnea și-a lăsat zeama și s-a făcut gri-maronie.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'water',
          text: t(
            'Pour in 1.5 litres of the water, bring to the boil, which takes about 8 minutes, and skim off the foam. Turn the heat down so it barely bubbles.',
            'Toarnă 1,5 litri din apă, adu la fierbere, ceea ce durează aproximativ 8 minute, și ia spuma de la suprafață. Micșorează focul ca să bolborosească abia.',
          ),
        },
        {
          key: 'simmer',
          text: t(
            'Partly cover and simmer for 1 hour, stirring now and then.',
            'Acoperă pe jumătate și fierbe 1 oră, amestecând din când în când.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'vegetables',
          text: t(
            'Add the carrots, parsley root, bell pepper, tomato and the whole hot pepper, if using. Simmer for 20 minutes, partly covered.',
            'Adaugă morcovii, rădăcina de pătrunjel, ardeiul gras, roșiile și ardeiul iute întreg, dacă folosești. Fierbe 20 de minute, acoperit pe jumătate.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'dough',
          text: t(
            'While the vegetables simmer, mix the flour, the egg, 2 g of the salt and 2 tablespoons of the remaining water into a stiff dough. Cover it and rest it for 10 minutes.',
            'Cât fierb legumele, amestecă făina, oul, 2 g de sare și 2 linguri din apa rămasă într-un aluat tare. Acoperă-l și lasă-l să se odihnească 10 minute.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'potatoes',
          text: t(
            'Add the potatoes and the rest of the water if the stew looks dry. Simmer for 25 minutes, until a knife slides through the potato and the shank cubes fall apart when pressed with a spoon.',
            'Adaugă cartofii și restul de apă, dacă mâncarea pare uscată. Fierbe 25 de minute, până când cuțitul trece ușor prin cartof, iar cuburile de carne se desfac când le apeși cu lingura.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'csipetke',
          text: t(
            'Pinch the dough into small flat pieces the size of a thumbnail and drop them straight into the simmering stew. Simmer for 8 minutes, until they float and no raw dough is left in the middle of a piece.',
            'Ciupește aluatul în bucățele mici și plate, cât unghia degetului mare, și lasă-le să cadă direct în mâncarea care fierbe. Fierbe 8 minute, până când plutesc și nu mai rămâne aluat crud în mijlocul unei bucăți.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'finish',
          text: t(
            'Taste and add the remaining 6 g of the salt. Fish out the hot pepper. Spoon into deep bowls.',
            'Gustă și adaugă restul de 6 g de sare. Ia afară ardeiul iute. Pune în boluri adânci.',
          ),
        },
      ],
      tips: [
        t(
          'Paprika scorches and turns bitter in hot fat, so take the pot off the heat before stirring it in and add liquid straight away.',
          'Boiaua se arde și se amărăște în grăsime fierbinte, așa că ia oala de pe foc înainte s-o amesteci și adaugă imediat lichid.',
        ),
      ],
      stepTips: [
        {
          step: 'onions',
          text: t(
            'Do not rush the onions. They are the base of the sauce and melt away completely, so the stew gets its body from them, not from flour.',
            'Nu grăbi ceapa. Ea e baza sosului și se topește complet, așa că mâncarea capătă corp din ceapă, nu din făină.',
          ),
        },
      ],
      nutritionNote: t(
        'Plenty of protein and iron from the shank, with carrots, parsley root, pepper and tomato for fibre and vitamins. The lard, the dumplings and the potatoes make it filling and heavy on energy, and it is salty; one bowl is a full meal.',
        'Multe proteine și fier din fluierul de vită, plus morcovi, rădăcină de pătrunjel, ardei și roșii pentru fibre și vitamine. Untura, găluștile și cartofii îl fac sățios și bogat în energie, și e sărat; un bol este o masă întreagă.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Crusty country bread', 'Pâine de casă cu crustă'),
          reason: t(
            'Fresh bread soaks up the paprika broth.',
            'Pâinea proaspătă adună supa cu boia.',
          ),
          principle: 'contrast_texture',
          ingredient: 'country-bread',
        },
        {
          kind: 'food',
          label: t('Pickled peppers', 'Ardei murați'),
          reason: t(
            'Their sharp acidity cuts through the lard and rich broth.',
            'Aciditatea lor ascuțită taie din bogăția grăsimii și a supei.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-peppers',
        },
        {
          kind: 'food',
          label: t('Sour cream', 'Smântână'),
          reason: t(
            'Some add a spoon of sour cream to round off the paprika.',
            'Unii pun o lingură de smântână, ca să rotunjească gustul boiei.',
          ),
          principle: 'complement_flavour',
          ingredient: 'sour-cream',
        },
        {
          kind: 'drink',
          label: t('Beer', 'Bere'),
          reason: t(
            'Cold beer refreshes the palate between spoonfuls of the rich stew.',
            'Berea rece împrospătează gustul între lingurile de mâncare bogată.',
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
            'A hot, thick bowl that warms you through.',
            'Un bol fierbinte și gros care te încălzește bine.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Beef protein and carbohydrates from the potatoes and dumplings.',
            'Proteinele din carne și carbohidrații din cartofi și găluște.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A rich, filling bowl sits heavy before bed.',
            'Un bol bogat și sățios cade greu înainte de culcare.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'Hours of simmering and a heavy bowl suit cooler weather.',
            'Ore de fiert și un bol greu se potrivesc vremii mai răcoroase.',
          ),
        },
      ],
    },
  ],
};
