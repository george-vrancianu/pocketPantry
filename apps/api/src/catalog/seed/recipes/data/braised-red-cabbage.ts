import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Braised red cabbage base is the Danish rødkål: finely shredded cabbage
// braised in butter with vinegar and sugar, sweetened and glossed with
// redcurrant jelly at the end. Each Variant is a full Recipe with its own lines,
// steps and guidance; the base's Recipe-level Tips (make ahead, acid early,
// storage) hold for every Variant and are all inherited.
export const braisedRedCabbage: BaseRecipeSeed = {
  slug: 'braised-red-cabbage',
  title: t(
    'Danish braised red cabbage (rødkål)',
    'Varză roșie înăbușită, ca în Danemarca (rødkål)',
  ),
  servings: 8,
  prepMinutes: 20,
  cookMinutes: 80,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'red-cabbage',
      quantity: 1000,
      unit: 'g',
      note: t(
        'outer leaves and core removed, finely shredded',
        'fără frunzele exterioare și cotor, tăiată fin',
      ),
    },
    { ingredient: 'butter', quantity: 50, unit: 'g' },
    { ingredient: 'vinegar', quantity: 100, unit: 'ml' },
    { ingredient: 'sugar', quantity: 60, unit: 'g' },
    { ingredient: 'salt', quantity: 8, unit: 'g' },
    { ingredient: 'still-water', quantity: 0.1, unit: 'l' },
    { ingredient: 'redcurrant-jelly', quantity: 150, unit: 'g' },
    {
      ingredient: 'cinnamon-sticks',
      quantity: 3,
      unit: 'g',
      optional: true,
      note: t('1 stick', '1 baton'),
    },
    {
      ingredient: 'cloves',
      quantity: 0.5,
      unit: 'g',
      optional: true,
      note: t('about 5, whole', 'aproximativ 5, întregi'),
    },
    {
      ingredient: 'bay-leaves',
      quantity: 0.4,
      unit: 'g',
      optional: true,
      note: t('2 leaves', '2 foi'),
    },
  ],
  steps: [
    {
      key: 'shred',
      text: t(
        'Quarter the cabbage, cut out the core and slice each quarter across the leaves as thinly as you can, about 3 mm.',
        'Taie varza în patru, scoate cotorul și feliază fiecare sfert pe curmezișul frunzelor cât mai subțire, de aproximativ 3 mm.',
      ),
    },
    {
      key: 'wilt',
      text: t(
        'Melt the butter in a wide, heavy pot over medium heat. Add the cabbage in handfuls and stir for about 5 minutes, until it has wilted and turned glossy.',
        'Topește untul într-o oală lată și grea, la foc mediu. Adaugă varza câte o mână și amestecă aproximativ 5 minute, până se ofilește și devine lucioasă.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'season',
      text: t(
        'Stir in the vinegar, sugar, salt and water, and add the cinnamon stick, cloves and bay leaves if you are using them. Bring to a simmer.',
        'Adaugă oțetul, zahărul, sarea și apa și pune batonul de scorțișoară, cuișoarele și foile de dafin, dacă le folosești. Adu la fierbere ușoară.',
      ),
    },
    {
      key: 'braise',
      text: t(
        'Cover and cook over low heat for 1 hour, stirring now and then, until the cabbage is completely tender and the liquid has mostly cooked down. Add a splash of water if it looks dry.',
        'Acoperă și gătește la foc mic o oră, amestecând din când în când, până când varza e complet moale, iar lichidul s-a redus aproape de tot. Dacă pare uscată, adaugă puțină apă.',
      ),
      timerSeconds: 3600,
    },
    {
      key: 'jelly',
      text: t(
        'Stir in the redcurrant jelly, take off the lid and simmer for 10 minutes, until the cabbage is glossy and the liquid is a thick, dark red syrup.',
        'Amestecă jeleul de coacăze roșii, ia capacul și fierbe încă 10 minute, până când varza e lucioasă, iar lichidul devine un sirop gros, roșu închis.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'taste',
      text: t(
        'Fish out the cinnamon stick, cloves and bay leaves. Taste and balance with a pinch of salt, a little sugar or a splash of vinegar.',
        'Scoate batonul de scorțișoară, cuișoarele și foile de dafin. Gustă și potrivește cu un praf de sare, puțin zahăr sau o picătură de oțet.',
      ),
    },
    {
      key: 'store',
      text: t(
        'Serve warm. Cool any leftovers, then keep them in a covered container in the fridge for up to 5 days, or freeze in portions for up to 3 months.',
        'Servește caldă. Răcește restul, apoi păstrează-l într-un recipient acoperit la frigider până la 5 zile sau congelează-l în porții până la 3 luni.',
      ),
    },
  ],
  tips: [
    t(
      'Make it a day ahead if you can: the flavours settle and it reheats well, over low heat with a splash of water, until steaming hot all through.',
      'Gătește-o cu o zi înainte, dacă poți: aromele se așază și se reîncălzește bine, la foc mic, cu puțină apă, până e fierbinte peste tot.',
    ),
    t(
      'Keep some acid in from the start: vinegar keeps red cabbage a clear red, while with none it fades towards blue-grey.',
      'Pune oțet de la început: oțetul păstrează varza roșie de un roșu limpede, iar fără el culoarea se stinge spre albastru-cenușiu.',
    ),
  ],
  stepTips: [
    {
      step: 'shred',
      text: t(
        'Thin shreds braise to a silky tangle; thick ones stay chewy. A mandoline or the slicing disc of a food processor makes it quick.',
        'Fâșiile subțiri devin moi și mătăsoase; cele groase rămân tari. Cu o mandolină sau cu discul de feliat al robotului merge repede.',
      ),
    },
    {
      step: 'jelly',
      text: t(
        'Add the jelly last: it sweetens and gives the gloss, so you can judge how much sugar and vinegar the cabbage still needs.',
        'Adaugă jeleul la urmă: îndulcește și dă luciul, așa că poți judeca cât zahăr și oțet mai are nevoie varza.',
      ),
    },
  ],
  nutritionNote: t(
    'Cabbage is low in calories and brings fibre, so a spoonful alongside roast meat adds bulk cheaply. The sugar and jelly add a fair amount of sugar and the butter some saturated fat, so keep it a side dish in modest portions.',
    'Varza are puține calorii și aduce fibre, așa că o lingură lângă carne la cuptor adaugă volum ieftin. Zahărul și jeleul aduc destul zahăr, iar untul ceva grăsimi saturate, așa că păstreaz-o ca garnitură, în porții moderate.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Frikadeller', 'Frikadeller'),
      reason: t(
        'Frikadeller with potatoes, brown gravy and rødkål is an everyday Danish plate; the sweet-sour cabbage suits the fried pork patties.',
        'Frikadeller cu cartofi, sos brun și rødkål e o farfurie de zi cu zi în Danemarca; varza dulce-acrișoară se potrivește cu chiftelele de porc prăjite.',
      ),
      principle: 'regional_tradition',
      recipe: 'frikadeller',
    },
    {
      kind: 'food',
      label: t('Roast pork belly', 'Piept de porc la cuptor'),
      reason: t(
        'The sharp sweetness cuts through the fat of the pork.',
        'Dulceața acrișoară taie grăsimea cărnii de porc.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pork-belly',
    },
    {
      kind: 'food',
      label: t('Boiled potatoes', 'Cartofi fierți'),
      reason: t(
        'Plain, soft potatoes soak up the dark sweet-sour juices.',
        'Cartofii fierți, simpli și moi, absorb sucul dulce-acrișor și închis la culoare.',
      ),
      principle: 'complement_flavour',
      ingredient: 'potato',
    },
    {
      kind: 'drink',
      label: t('Cold lager', 'Bere blondă rece'),
      reason: t(
        'Its light bitterness and bubbles balance a sweet, rich plate.',
        'Amăreala ușoară și bulele echilibrează o farfurie dulce și bogată.',
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
        'Served warm, sweet and tangy beside a hearty plate.',
        'Servită caldă, dulce și acrișoară, lângă o farfurie consistentă.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Cooked cabbage is filling and can cause gas and bloating, which is unwelcome just before bed.',
        'Varza gătită săturește și poate provoca gaze și balonare, ceea ce nu e plăcut chiar înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'braised-red-cabbage-german',
      cuisine: 'german',
      title: t(
        'Apfelrotkohl (German red cabbage with apples)',
        'Varză roșie cu mere, ca în Germania (Apfelrotkohl)',
      ),
      servings: 6,
      prepMinutes: 25,
      cookMinutes: 80,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'red-cabbage',
          quantity: 800,
          unit: 'g',
          note: t(
            'outer leaves and core removed, finely shredded',
            'fără frunzele exterioare și cotor, tăiată fin',
          ),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely chopped', 'tocată mărunt'),
        },
        {
          ingredient: 'apple',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'tart, peeled, cored and diced',
            'acre, curățate, fără cotor, tăiate cubulețe',
          ),
        },
        { ingredient: 'lard', quantity: 40, unit: 'g' },
        { ingredient: 'red-wine', quantity: 150, unit: 'ml' },
        { ingredient: 'wine-vinegar', quantity: 50, unit: 'ml' },
        { ingredient: 'sugar', quantity: 30, unit: 'g' },
        { ingredient: 'salt', quantity: 6, unit: 'g' },
        {
          ingredient: 'cloves',
          quantity: 0.5,
          unit: 'g',
          note: t('about 5, whole', 'aproximativ 5, întregi'),
        },
        {
          ingredient: 'bay-leaves',
          quantity: 0.4,
          unit: 'g',
          note: t('2 leaves', '2 foi'),
        },
        {
          ingredient: 'juniper-berries',
          quantity: 2,
          unit: 'g',
          note: t('about 8, lightly crushed', 'aproximativ 8, ușor zdrobite'),
        },
        { ingredient: 'redcurrant-jelly', quantity: 60, unit: 'g' },
      ],
      steps: [
        {
          key: 'shred',
          text: t(
            'Quarter the cabbage, cut out the core and slice each quarter across the leaves as thinly as you can, about 3 mm.',
            'Taie varza în patru, scoate cotorul și feliază fiecare sfert pe curmezișul frunzelor cât mai subțire, de aproximativ 3 mm.',
          ),
        },
        {
          key: 'sweat',
          text: t(
            'Melt the lard in a wide, heavy pot over medium heat and soften the onion for about 5 minutes, until translucent.',
            'Topește untura într-o oală lată și grea, la foc mediu, și înmoaie ceapa aproximativ 5 minute, până devine translucidă.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'wilt',
          text: t(
            'Add the cabbage in handfuls and stir for about 5 minutes, until it has wilted and turned glossy.',
            'Adaugă varza câte o mână și amestecă aproximativ 5 minute, până se ofilește și devine lucioasă.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'season',
          text: t(
            'Stir in the apples, wine, vinegar, sugar, salt, cloves, bay leaves and juniper berries. Bring to a simmer.',
            'Adaugă merele, vinul, oțetul, zahărul, sarea, cuișoarele, foile de dafin și boabele de ienupăr. Adu la fierbere ușoară.',
          ),
        },
        {
          key: 'braise',
          text: t(
            'Cover and cook over low heat for 1 hour, stirring now and then, until the cabbage is tender and the apple has melted into the juices. Add a splash of water if it looks dry.',
            'Acoperă și gătește la foc mic o oră, amestecând din când în când, până când varza e moale, iar merele s-au topit în sos. Dacă pare uscată, adaugă puțină apă.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'jelly',
          text: t(
            'Stir in the redcurrant jelly, take off the lid and simmer for 10 minutes, until glossy and the liquid has cooked down to a thick syrup.',
            'Amestecă jeleul de coacăze roșii, ia capacul și fierbe încă 10 minute, până când varza e lucioasă, iar lichidul s-a redus la un sirop gros.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'taste',
          text: t(
            'Fish out the cloves, bay leaves and juniper berries. Taste and balance with a pinch of salt, a little sugar or a splash of vinegar.',
            'Scoate cuișoarele, foile de dafin și boabele de ienupăr. Gustă și potrivește cu un praf de sare, puțin zahăr sau o picătură de oțet.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Serve warm. Cool any leftovers, then keep them in a covered container in the fridge for up to 5 days, or freeze in portions for up to 3 months.',
            'Servește caldă. Răcește restul, apoi păstrează-l într-un recipient acoperit la frigider până la 5 zile sau congelează-l în porții până la 3 luni.',
          ),
        },
      ],
      tips: [
        t(
          'Choose a tart apple that breaks down as it cooks, such as Boskoop: it thickens the juices and balances the sugar.',
          'Alege un măr acru, care se destramă la gătit, de exemplu Boskoop: îngroașă sosul și echilibrează zahărul.',
        ),
      ],
      stepTips: [
        {
          step: 'season',
          text: t(
            'Count the cloves and juniper berries in and out; they are hard to spot in the cabbage and unpleasant to bite on.',
            'Numără cuișoarele și boabele de ienupăr la intrare și la ieșire; se văd greu în varză și nu e plăcut să le mușți.',
          ),
        },
      ],
      nutritionNote: t(
        'Cabbage and apple bring fibre and keep it fairly light for a braise, and most of the alcohol in the wine cooks off, but not all. The sugar, jelly and lard add sugar and saturated fat, so keep portions modest as a side.',
        'Varza și merele aduc fibre și o păstrează destul de ușoară pentru o mâncare înăbușită, iar cea mai mare parte din alcoolul vinului se evaporă, dar nu tot. Zahărul, jeleul și untura aduc zahăr și grăsimi saturate, așa că servește porții moderate, ca garnitură.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Pork knuckle', 'Ciolan de porc'),
          reason: t(
            'Sharp, sweet cabbage cuts through the fat of the pork.',
            'Varza dulce-acrișoară taie grăsimea cărnii de porc.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pork-knuckle',
        },
        {
          kind: 'food',
          label: t('Roast duck', 'Rață la cuptor'),
          reason: t(
            'Fruit and acid lighten the rich, fatty meat.',
            'Fructele și aciditatea ușurează carnea bogată și grasă.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'duck',
        },
        {
          kind: 'food',
          label: t('Boiled potatoes', 'Cartofi fierți'),
          reason: t(
            'Plain potatoes soak up the dark, spiced juices.',
            'Cartofii fierți, simpli, absorb sucul închis la culoare și condimentat.',
          ),
          principle: 'complement_flavour',
          ingredient: 'potato',
        },
        {
          kind: 'drink',
          label: t('Wheat beer', 'Bere de grâu'),
          reason: t(
            'Its fizz and soft, fruity notes refresh the palate between sweet-sour, rich bites.',
            'Efervescența și notele fructate, blânde, împrospătează gustul între îmbucături dulci-acrișoare și bogate.',
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
            'Warm, spiced and comforting beside roast meat.',
            'Caldă, condimentată și reconfortantă lângă carnea la cuptor.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Cooked cabbage is filling and can cause gas, and onion can cause heartburn when you lie down.',
            'Varza gătită săturește și poate provoca gaze, iar ceapa poate da arsuri când te culci.',
          ),
        },
      ],
    },
    {
      slug: 'braised-red-cabbage-british',
      cuisine: 'british',
      title: t(
        'British braised red cabbage with apple',
        'Varză roșie înăbușită cu mere, ca în Marea Britanie',
      ),
      servings: 8,
      prepMinutes: 25,
      cookMinutes: 125,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'red-cabbage',
          quantity: 900,
          unit: 'g',
          note: t(
            'outer leaves and core removed, finely shredded',
            'fără frunzele exterioare și cotor, tăiată fin',
          ),
        },
        {
          ingredient: 'red-onion',
          quantity: 2,
          unit: 'pcs',
          note: t('thinly sliced', 'tăiate subțire'),
        },
        {
          ingredient: 'cooking-apples',
          quantity: 2,
          unit: 'pcs',
          note: t(
            'peeled, cored and thinly sliced',
            'curățate, fără cotor, tăiate felii subțiri',
          ),
        },
        {
          ingredient: 'garlic',
          quantity: 6,
          unit: 'g',
          note: t('2 cloves, crushed', '2 căței, striviți'),
        },
        { ingredient: 'brown-sugar', quantity: 50, unit: 'g' },
        { ingredient: 'wine-vinegar', quantity: 60, unit: 'ml' },
        { ingredient: 'salt', quantity: 6, unit: 'g' },
        {
          ingredient: 'nutmeg',
          quantity: 1,
          unit: 'g',
          note: t('ground', 'măcinată'),
        },
        { ingredient: 'cinnamon', quantity: 1, unit: 'g' },
        {
          ingredient: 'cloves',
          quantity: 0.5,
          unit: 'g',
          note: t('about 5, whole', 'aproximativ 5, întregi'),
        },
        { ingredient: 'butter', quantity: 30, unit: 'g' },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 150 °C (130 °C fan).',
            'Încălzește cuptorul la 150 °C (130 °C cu ventilator).',
          ),
        },
        {
          key: 'layer',
          text: t(
            'In a large casserole with a tight lid, layer the cabbage, red onion, apples and garlic, sprinkling each layer with some of the sugar, salt, nutmeg and cinnamon. Push the cloves into the middle layer.',
            'Într-o cratiță mare cu capac bine închis, pune straturi de varză, ceapă roșie, mere și usturoi, presărând fiecare strat cu puțin zahăr, sare, nucșoară și scorțișoară. Înfige cuișoarele în stratul din mijloc.',
          ),
        },
        {
          key: 'vinegar',
          text: t(
            'Pour the vinegar over the top, dot with the butter and press a sheet of baking paper onto the surface. Put the lid on.',
            'Toarnă oțetul deasupra, pune bucățele de unt și apasă o foaie de hârtie de copt pe suprafață. Pune capacul.',
          ),
        },
        {
          key: 'bake-1',
          text: t(
            'Bake for 1 hour, until the cabbage has sunk and begun to soften.',
            'Coace o oră, până când varza s-a lăsat și a început să se înmoaie.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'stir',
          text: t(
            'Take out the casserole and stir everything well so the apple and juices coat the cabbage. Cover again.',
            'Scoate cratița și amestecă bine, ca merele și sucul să acopere varza. Acoperă la loc.',
          ),
        },
        {
          key: 'bake-2',
          text: t(
            'Bake for another hour, until the cabbage is completely tender and the juices are dark and syrupy.',
            'Mai coace o oră, până când varza e complet moale, iar sucul e închis la culoare și siropos.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'taste',
          text: t(
            'Fish out the cloves. Taste and balance with a pinch of salt, a little sugar or a splash of vinegar.',
            'Scoate cuișoarele. Gustă și potrivește cu un praf de sare, puțin zahăr sau o picătură de oțet.',
          ),
        },
        {
          key: 'store',
          text: t(
            'Serve warm. Cool any leftovers, then keep them in a covered container in the fridge for up to 5 days, or freeze in portions for up to 3 months.',
            'Servește caldă. Răcește restul, apoi păstrează-l într-un recipient acoperit la frigider până la 5 zile sau congelează-l în porții până la 3 luni.',
          ),
        },
      ],
      tips: [
        t(
          'Use a tight lid or seal the pot with foil: the cabbage braises in its own steam, and in a loose pot the top layer dries out and catches.',
          'Folosește un capac bine închis sau sigilează oala cu folie: varza se înăbușe în propriul abur, iar într-o oală neetanșă stratul de sus se usucă și se arde.',
        ),
      ],
      stepTips: [
        {
          step: 'taste',
          text: t(
            'Count the cloves back out: five whole cloves are easy to lose in the cabbage and unpleasant to bite on.',
            'Numără cuișoarele la ieșire: cinci cuișoare întregi se pierd ușor în varză și nu e plăcut să le mușți.',
          ),
        },
        {
          step: 'layer',
          text: t(
            'Layering the sugar and spices through the pot, not just on top, seasons the cabbage evenly without stirring it first.',
            'Dacă pui zahărul și condimentele între straturi, nu doar deasupra, varza se condimentează uniform fără să o amesteci mai întâi.',
          ),
        },
      ],
      nutritionNote: t(
        'Cabbage, onion and apple bring fibre and make it a fairly light braise, with only a little butter. The brown sugar adds sugar, so keep to a modest spoonful or two as a side dish.',
        'Varza, ceapa și merele aduc fibre și o fac o mâncare înăbușită destul de ușoară, cu puțin unt. Zahărul brun adaugă zahăr, așa că servește una-două linguri, ca garnitură.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Mashed potatoes', 'Piure de cartofi'),
          reason: t(
            'Soft, buttery mash gives a plain base for the sweet-sour cabbage.',
            'Piureul moale, cu unt, e o bază simplă pentru varza dulce-acrișoară.',
          ),
          principle: 'complement_flavour',
          recipe: 'potato-puree',
        },
        {
          kind: 'food',
          label: t('Roast goose', 'Gâscă la cuptor'),
          reason: t(
            'Sharp apple and vinegar cut through the fat of the rich meat.',
            'Merele acrișoare și oțetul taie grăsimea cărnii bogate.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'goose',
        },
        {
          kind: 'food',
          label: t('Roast ham', 'Șuncă la cuptor'),
          reason: t(
            'The sweetness balances the saltiness of the ham.',
            'Dulceața echilibrează gustul sărat al șuncii.',
          ),
          principle: 'salt_balances_sweet',
          ingredient: 'ham',
        },
        {
          kind: 'drink',
          label: t('Dry cider', 'Cidru sec'),
          reason: t(
            'Apple on apple: its acidity and bubbles refresh the palate between spiced, rich bites.',
            'Măr lângă măr: aciditatea și bulele împrospătează gustul între îmbucături condimentate și bogate.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'cider',
        },
      ],
      eatingMoments: [
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Slow-baked, warm and spiced, it suits a cold day.',
            'Coaptă lent, caldă și condimentată, se potrivește unei zile reci.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Cooked cabbage is filling and can cause gas, and onion can cause heartburn when you lie down.',
            'Varza gătită săturește și poate provoca gaze, iar ceapa poate da arsuri când te culci.',
          ),
        },
      ],
    },
  ],
};
