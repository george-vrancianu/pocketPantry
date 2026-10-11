import {
  t,
  type BaseRecipeSeed,
  type LineSeed,
  type Text,
} from '../recipe-seed-types';
import type { Unit } from '../../seed-types';

// The Appetizer platter base is a basic platter you assemble: cheese, cured
// meat, bread and raw vegetables. Each Variant is a regional platter with its
// own components; the base's Recipe-level Tips are inherited.

/** One Ingredient Line, `line('eggs', 3, 'pcs', t('en', 'ro'))`; omit quantity for "to taste". */
const line = (
  ingredient: string,
  quantity?: number,
  unit?: Unit,
  note?: Text,
): LineSeed => ({
  ingredient,
  ...(quantity !== undefined ? { quantity, unit } : {}),
  ...(note ? { note } : {}),
});

export const appetizerPlatter: BaseRecipeSeed = {
  slug: 'appetizer-platter',
  title: t('Appetizer platter', 'Platou de aperitive'),
  servings: 4,
  prepMinutes: 20,
  cookMinutes: 0,
  difficulty: 'easy',
  lines: [
    line('gouda', 150, 'g', t('cut into cubes', 'tăiat cubulețe')),
    line('salami', 100, 'g', t('thinly sliced', 'tăiat felii subțiri')),
    line('baguette', 1, 'pcs', t('sliced', 'tăiată felii')),
    line('cucumber', 1, 'pcs', t('cut into sticks', 'tăiat bastonașe')),
    line('carrot', 150, 'g', t('cut into sticks', 'tăiat bastonașe')),
    line('cherry-tomato', 150, 'g'),
    line('radish', 100, 'g', t('trimmed', 'curățate de codițe')),
    line('olives', 80, 'g'),
    line('grapes', 150, 'g'),
    line('mustard', 30, 'g'),
  ],
  steps: [
    {
      key: 'rest',
      text: t(
        'Take the cheese and the salami out of the fridge 20 to 30 minutes before serving so they lose their chill and taste of more.',
        'Scoate brânza și salamul din frigider cu 20-30 de minute înainte de servire, ca să se încălzească puțin și să aibă mai mult gust.',
      ),
    },
    {
      key: 'vegetables',
      text: t(
        'Wash and dry the cucumber, carrot, tomatoes, radishes and grapes. Cut the cucumber and carrot into sticks and leave the tomatoes, radishes and grapes whole.',
        'Spală și șterge castravetele, morcovul, roșiile, ridichile și strugurii. Taie castravetele și morcovul bastonașe, iar roșiile, ridichile și strugurii lasă-le întregi.',
      ),
    },
    {
      key: 'slice',
      text: t(
        'Cut the cheese into cubes, slice the salami thinly and slice the baguette. Drain the olives and put them, and the mustard, in two small bowls.',
        'Taie brânza cubulețe, salamul felii subțiri și bagheta felii. Scurge măslinele și pune-le, împreună cu muștarul, în două boluri mici.',
      ),
    },
    {
      key: 'arrange',
      text: t(
        'Arrange everything on a large board in groups: cheese beside the salami, bread at one edge, vegetables in loose piles. Set the bowls in the gaps and fill the remaining space with the grapes.',
        'Aranjează totul pe un platou mare, în grupuri: brânza lângă salam, pâinea la un capăt, legumele în grămezi libere. Pune bolurile în spațiile goale și completează restul cu struguri.',
      ),
    },
  ],
  tips: [
    t(
      'Serve cheese and cured meat at room temperature; straight from the fridge they taste of very little.',
      'Servește brânza și mezelurile la temperatura camerei; direct din frigider au foarte puțin gust.',
    ),
    t(
      'Plan about 150 g of food per person as a starter, and about double if the platter is the meal.',
      'Calculează aproximativ 150 g de mâncare de persoană pentru un aperitiv și cam dublu dacă platoul ține loc de masă.',
    ),
    t(
      'Group items by colour and texture rather than mixing them, and leave a little space so people can reach each one.',
      'Grupează ingredientele după culoare și textură, nu le amesteca, și lasă puțin spațiu ca fiecare să poată fi luat ușor.',
    ),
  ],
  stepTips: [
    {
      step: 'slice',
      text: t(
        'Slice the bread last so it stays soft; put it in a cloth-lined basket if you slice it earlier.',
        'Taie pâinea la sfârșit ca să rămână moale; dacă o tai mai devreme, pune-o într-un coș căptușit cu un prosop.',
      ),
    },
  ],
  nutritionNote: t(
    'Filling and varied, with fibre and vitamins from the raw vegetables; cheese and cured meat are high in salt and saturated fat, so keep them to modest portions and let the vegetables fill most of the board.',
    'Săturător și variat, cu fibre și vitamine din legumele crude; brânza și mezelurile sunt bogate în sare și grăsimi saturate, așa că ține-le în porții moderate și lasă legumele să umple cea mai mare parte a platoului.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Chicken salad', 'Salată cu pui'),
      reason: t(
        'A light platter to nibble before a main-course salad.',
        'Un platou ușor, din care ciugulești înainte de o salată servită ca fel principal.',
      ),
      recipe: 'chicken-salad',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sharp acidity cuts through the fat of the cheese and salami.',
        'Aciditatea lor ascuțită taie grăsimea brânzei și a salamului.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'food',
      label: t('Fig jam', 'Dulceață de smochine'),
      reason: t(
        'Sweet jam balances the saltiness of cheese and cured meat.',
        'Dulceața echilibrează sărătura brânzei și a mezelurilor.',
      ),
      principle: 'salt_balances_sweet',
    },
    {
      kind: 'food',
      label: t('Apple slices', 'Felii de măr'),
      reason: t(
        'Crisp, tart apple refreshes the palate and cuts the richness of the cheese.',
        'Mărul crocant și acrișor împrospătează gustul și taie grăsimea brânzei.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'apple',
    },
    {
      kind: 'drink',
      label: t('Sparkling wine', 'Vin spumant'),
      reason: t(
        'The bubbles and acidity refresh the palate between salty, fatty bites.',
        'Bulele și aciditatea împrospătează gura între îmbucături sărate și grase.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'sparkling-wine',
    },
    {
      kind: 'drink',
      label: t('Light lager', 'Bere blondă ușoară'),
      reason: t(
        'A cold, crisp beer is an easy match for cheese, bread and cured meat.',
        'O bere rece și proaspătă se potrivește ușor cu brânza, pâinea și mezelurile.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'beer',
    },
  ],
  eatingMoments: [
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'Cold, no cooking, and the vegetables keep it light.',
        'Rece, fără gătit, iar legumele îl mențin ușor.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'good_for',
      reason: t(
        'Nothing to cook and plenty of cool, crisp vegetables.',
        'Nu trebuie gătit nimic și include multe legume răcoroase și crocante.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Salty cured meat and cheese can sit heavy and make you thirsty at night.',
        'Mezelurile sărate și brânza cad greu și provoacă sete noaptea.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'The fat and salt are slow to digest and feel heavy during exercise.',
        'Grăsimea și sarea se digeră greu și dau senzația de greutate în timpul efortului.',
      ),
    },
  ],
  variants: [
    // ---------------------------------------------------------------- Romanian
    {
      slug: 'appetizer-platter-romanian',
      cuisine: 'romanian',
      title: t('Romanian appetizer platter', 'Platou românesc de aperitive'),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 50,
      difficulty: 'medium',
      lines: [
        line('aubergine', 2, 'pcs', t('large, about 600 g', 'mari, cam 600 g')),
        line('sunflower-oil', 60, 'ml'),
        line(
          'red-onion',
          1,
          'pcs',
          t('very finely chopped', 'tocată foarte mărunt'),
        ),
        line('salt', 2, 'g'),
        line('zacusca', 150, 'g'),
        line('telemea', 150, 'g', t('sliced', 'tăiată felii')),
        line(
          'pork-fat',
          100,
          'g',
          t('smoked, thinly sliced', 'afumată, tăiată felii subțiri'),
        ),
        line(
          'sausage-sibiu',
          100,
          'g',
          t('thinly sliced', 'tăiat felii subțiri'),
        ),
        line('country-bread', 1, 'pcs', t('sliced', 'tăiată felii')),
        line('tomato', 200, 'g', t('cut into wedges', 'tăiate sferturi')),
        line('radish', 100, 'g'),
        line('pickled-cucumbers', 100, 'g'),
      ],
      steps: [
        {
          key: 'roast',
          text: t(
            'Roast the whole aubergines for 15 to 20 minutes over a gas flame or on a grill, or for 40 to 45 minutes in a 220 °C oven, turning them, until the skin is charred and the flesh is completely soft.',
            'Coace vinetele întregi 15-20 de minute pe flacără sau pe grătar, ori 40-45 de minute în cuptor la 220 °C, întorcându-le, până când coaja e arsă, iar miezul complet moale.',
          ),
          timerSeconds: 2520,
        },
        {
          key: 'peel',
          text: t(
            'Peel the aubergines while still warm and leave the flesh in a colander for 10 minutes to drain the bitter liquid. Chop the flesh finely with a wooden or plastic knife until pasty.',
            'Curăță vinetele de coajă cât sunt calde și lasă pulpa 10 minute într-o strecurătoare, ca să se scurgă zeama amară. Toac-o mărunt cu un cuțit de lemn sau de plastic, până devine ca o pastă.',
          ),
        },
        {
          key: 'salad',
          text: t(
            'Put the flesh in a bowl, add the salt and beat in the oil a little at a time with a wooden spoon, as for mayonnaise, until pale and creamy. Stir in the onion and chill.',
            'Pune pulpa într-un bol, adaugă sarea și încorporează uleiul treptat, cu o lingură de lemn, ca la maioneză, până când compoziția devine deschisă la culoare și cremoasă. Adaugă ceapa și dă la rece.',
          ),
        },
        {
          key: 'arrange',
          text: t(
            'On a board or large plate, set the salată de vinete and the zacuscă in bowls and arrange the telemea, slănină, winter salami, bread, tomatoes, radishes and pickles around them.',
            'Pe un platou mare, pune salata de vinete și zacusca în boluri și așază în jur telemeaua, slănina, salamul de iarnă, pâinea, roșiile, ridichile și murăturile.',
          ),
        },
      ],
      tips: [
        t(
          'A metal knife makes the aubergine dark and a little bitter, which is why Romanian cooks chop it with wood or plastic.',
          'Un cuțit de metal înnegrește vinetele și le dă un gust ușor amar, de aceea se toacă cu lemn sau plastic.',
        ),
      ],
      stepTips: [
        {
          step: 'salad',
          text: t(
            'Add the oil very slowly; poured in all at once it will not be absorbed and the salad turns oily instead of creamy.',
            'Adaugă uleiul foarte încet; dacă îl torni deodată, nu se absoarbe, iar salata iese uleioasă, nu cremoasă.',
          ),
        },
      ],
      nutritionNote: t(
        'Aubergine and vegetable spread bring fibre and few calories, and the bread makes it filling; slănină, winter salami and telemea are very salty and rich in saturated fat, and the oil in the salad adds up, so eat them in small slices.',
        'Vinetele și zacusca aduc fibre și puține calorii, iar pâinea îl face sățios; slănina, salamul de iarnă și telemeaua sunt foarte sărate și bogate în grăsimi saturate, iar uleiul din salată se adună, așa că mănâncă-le în felii mici.',
      ),
      pairings: [
        {
          kind: 'drink',
          label: t('Țuică', 'Țuică'),
          reason: t(
            'The traditional shot with a Romanian spread; its strength cuts the richness of the slănină.',
            'Paharul nelipsit de lângă un platou românesc; tăria ei taie grăsimea slăninii.',
          ),
          principle: 'regional_tradition',
          ingredient: 'tuica',
        },
        {
          kind: 'food',
          label: t('Green hot peppers', 'Ardei iute verzi'),
          reason: t(
            'A crunchy, fiery bite cuts through the slănină and winter salami.',
            'O mușcătură crocantă și iute taie grăsimea slăninii și a salamului.',
          ),
          principle: 'complement_flavour',
          ingredient: 'hot-pepper',
        },
        {
          kind: 'food',
          label: t('Fresh onion', 'Ceapă proaspătă'),
          reason: t(
            'A raw onion bite is the classic partner of slănină and zacuscă.',
            'O mușcătură de ceapă crudă este perechea clasică a slăninii și a zacuștii.',
          ),
          principle: 'regional_tradition',
          ingredient: 'onion',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'Crisp acidity refreshes the palate after the salty cheese and cured pork.',
            'Aciditatea proaspătă împrospătează gura după brânza sărată și carnea afumată.',
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
            'Hearty, with fat and bread to keep you warm.',
            'Consistent, cu grăsime și pâine care țin de cald.',
          ),
        },
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'A relaxed, shared meal that suits a long table.',
            'O masă relaxată, de împărțit, potrivită pentru o masă lungă.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'Salty fatty meats feel heavy in the heat.',
            'Carnea sărată și grasă cade greu pe căldură.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Fat and salt close to bedtime can disturb sleep.',
            'Grăsimea și sarea înainte de culcare pot strica somnul.',
          ),
        },
      ],
    },
    // ----------------------------------------------------------------- Italian
    {
      slug: 'appetizer-platter-italian',
      cuisine: 'italian',
      title: t('Italian antipasto platter', 'Platou italian antipasto'),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 0,
      difficulty: 'easy',
      lines: [
        line('prosciutto', 80, 'g'),
        line('salami', 80, 'g', t('thinly sliced', 'tăiat felii subțiri')),
        line(
          'parmesan',
          60,
          'g',
          t('broken into chunks', 'rupt bucăți neregulate'),
        ),
        line('mozzarella', 125, 'g', t('torn into pieces', 'ruptă bucăți')),
        line('cherry-tomato', 150, 'g', t('halved', 'tăiate pe jumătate')),
        line('basil', 5, 'g', t('leaves', 'frunze')),
        line('olives', 80, 'g'),
        line('artichoke-hearts', 100, 'g', t('drained', 'scurse')),
        line(
          'roasted-peppers',
          100,
          'g',
          t('drained, in strips', 'scurși, tăiați fâșii'),
        ),
        line('breadsticks', 60, 'g'),
        line('olive-oil', 30, 'ml'),
        line('balsamic-vinegar', 15, 'ml'),
        line('salt'),
      ],
      steps: [
        {
          key: 'caprese',
          text: t(
            'Toss the tomatoes and the torn mozzarella with the basil, half of the olive oil and a pinch of salt, and leave for 10 minutes so the tomatoes release their juices.',
            'Amestecă roșiile și mozzarella ruptă cu busuioc, jumătate din uleiul de măsline și un praf de sare și lasă 10 minute, ca roșiile să-și elibereze sucul.',
          ),
        },
        {
          key: 'marinate',
          text: t(
            'Toss the artichokes and roasted peppers with the remaining olive oil and the balsamic vinegar.',
            'Amestecă anghinarea și ardeii copți cu uleiul de măsline rămas și oțetul balsamic.',
          ),
        },
        {
          key: 'meats',
          text: t(
            'Lay the prosciutto in loose folds and the salami in overlapping slices on a large board.',
            'Așază prosciutto în falduri libere și salamul în felii suprapuse pe un platou mare.',
          ),
        },
        {
          key: 'arrange',
          text: t(
            'Add the tomato and mozzarella, the artichokes and peppers, the olives and chunks of parmesan in separate groups, and finish with the breadsticks standing in a glass or lying alongside.',
            'Adaugă roșiile cu mozzarella, anghinarea cu ardeii, măslinele și bucățile de parmezan, în grupuri separate, și completează cu grisinele puse într-un pahar sau lângă celelalte.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'meats',
          text: t(
            'Separate prosciutto slices gently and fold rather than pile them; thin, airy folds taste silkier.',
            'Desparte feliile de prosciutto cu grijă și împăturește-le, nu le îngrămădi; foile subțiri și aerisite au un gust mai fin.',
          ),
        },
      ],
      nutritionNote: t(
        'Olive oil, vegetables and tomatoes give a Mediterranean balance and plenty of flavour; prosciutto, salami, parmesan and olives are very salty and the cheeses add saturated fat, so keep the cured items modest and fill up on vegetables.',
        'Uleiul de măsline, legumele și roșiile dau un echilibru mediteranean și mult gust; prosciutto, salamul, parmezanul și măslinele sunt foarte sărate, iar brânzeturile aduc grăsimi saturate, așa că ține mezelurile la porții moderate și mănâncă mai ales legume.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Fresh figs or melon', 'Smochine proaspete sau pepene'),
          reason: t(
            'Sweet fruit against salty prosciutto is a classic Italian contrast.',
            'Fructele dulci alături de prosciutto sărat sunt un contrast clasic italian.',
          ),
          principle: 'salt_balances_sweet',
          ingredient: 'melon',
        },
        {
          kind: 'food',
          label: t('Ciabatta', 'Ciabatta'),
          reason: t(
            'Soft, open crumb soaks up the oil and marinade from the vegetables.',
            'Miezul moale și aerat absoarbe uleiul și marinada de la legume.',
          ),
          principle: 'fat_carries_flavour',
          ingredient: 'ciabatta',
        },
        {
          kind: 'drink',
          label: t('Prosecco', 'Prosecco'),
          reason: t(
            'Dry bubbles cleanse the palate after cured meat and cheese.',
            'Bulele seci curăță gura după mezeluri și brânză.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'sparkling-wine',
        },
        {
          kind: 'drink',
          label: t('Light red wine', 'Vin roșu ușor'),
          reason: t(
            'Soft tannins and fruit suit salami and parmesan without overwhelming the vegetables.',
            'Taninurile fine și fructul se potrivesc cu salamul și parmezanul fără să acopere legumele.',
          ),
          principle: 'complement_flavour',
          ingredient: 'red-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Many small bites and plenty of vegetables, no cooking.',
            'Multe bucățele mici și multe legume, fără gătit.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Served cool and fresh, with tomatoes and mozzarella.',
            'Se servește rece și proaspăt, cu roșii și mozzarella.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'avoid',
          reason: t(
            'Mostly salt and fat, with little of the carbohydrate you need to recover.',
            'Conține mai ales sare și grăsime, cu puțini carbohidrați pentru refacere.',
          ),
        },
      ],
    },
    // ----------------------------------------------------------------- Spanish
    {
      slug: 'appetizer-platter-spanish',
      cuisine: 'spanish',
      title: t('Spanish tapas platter', 'Platou spaniol de tapas'),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 5,
      difficulty: 'easy',
      lines: [
        line('manchego', 120, 'g', t('cut into wedges', 'tăiat felii groase')),
        line('chorizo', 100, 'g', t('sliced', 'tăiat rondele')),
        line(
          'prosciutto',
          60,
          'g',
          t('jamón serrano if you can find it', 'jamón serrano, dacă găsești'),
        ),
        line('olives', 100, 'g'),
        line('almonds', 60, 'g'),
        line('roasted-peppers', 100, 'g', t('drained', 'scurși')),
        line('baguette', 1, 'pcs', t('sliced', 'tăiată felii')),
        line('tomato', 300, 'g', t('very ripe', 'foarte coapte')),
        line('garlic', 5, 'g', t('1 clove', '1 cățel')),
        line('olive-oil', 45, 'ml'),
        line('flaky-salt', 2, 'g'),
      ],
      steps: [
        {
          key: 'almonds',
          text: t(
            'Warm 15 ml of the olive oil in a small pan over medium heat and toast the almonds for 3 to 4 minutes, stirring, until golden. Tip them into a bowl and toss with half of the salt.',
            'Încălzește 15 ml din uleiul de măsline într-o tigăiță la foc mediu și prăjește migdalele 3-4 minute, amestecând, până se rumenesc. Pune-le într-un bol și amestecă-le cu jumătate din sare.',
          ),
          timerSeconds: 210,
        },
        {
          key: 'toast',
          text: t(
            'Toast the baguette slices in a hot, dry pan or under the grill until golden and crisp at the edges. Rub each slice lightly with the cut clove of garlic.',
            'Prăjește feliile de baghetă într-o tigaie uscată și încinsă sau sub grătarul cuptorului, până se rumenesc și devin crocante la margini. Frecă fiecare felie ușor cu cățelul de usturoi tăiat.',
          ),
        },
        {
          key: 'tomato',
          text: t(
            'Halve the tomatoes and grate them on the coarse side of a box grater, discarding the skins. Spread the pulp on the toast with the remaining oil and the rest of the salt for pan con tomate.',
            'Taie roșiile în două și dă-le pe răzătoarea mare, aruncând cojile. Întinde pulpa pe pâinea prăjită, cu uleiul rămas și restul de sare, pentru pan con tomate.',
          ),
        },
        {
          key: 'arrange',
          text: t(
            'Arrange the pan con tomate, manchego, chorizo, ham, olives, peppers and warm almonds on a board or in small dishes.',
            'Aranjează pan con tomate, manchego, chorizo, șunca, măslinele, ardeii și migdalele calde pe un platou sau în farfurioare mici.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'tomato',
          text: t(
            'Assemble the pan con tomate just before serving; the juicy tomato softens the toast within minutes.',
            'Pregătește pan con tomate chiar înainte de servire; roșia zemoasă înmoaie pâinea în câteva minute.',
          ),
        },
      ],
      nutritionNote: t(
        'Olive oil, almonds and tomatoes bring healthy fats and vitamins, and olives and peppers add variety; chorizo, ham and olives are salty and fatty, and manchego is rich, so enjoy them in small amounts.',
        'Uleiul de măsline, migdalele și roșiile aduc grăsimi sănătoase și vitamine, iar măslinele și ardeii dau varietate; chorizo, șunca și măslinele sunt sărate și grase, iar manchego este bogat, așa că mănâncă-le în cantități mici.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Smoked paprika', 'Boia afumată'),
          reason: t(
            'A pinch over the almonds or the olive oil echoes the smoke of the chorizo.',
            'Un praf peste migdale sau uleiul de măsline repetă fumul din chorizo.',
          ),
          principle: 'complement_flavour',
          ingredient: 'smoked-paprika',
        },
        {
          kind: 'drink',
          label: t('Fino sherry', 'Sherry fino'),
          reason: t(
            'Bone-dry and nutty, the classic bar partner of olives, almonds and cured ham.',
            'Foarte sec și cu gust de nucă, partenerul clasic din baruri pentru măsline, migdale și jamón.',
          ),
          principle: 'regional_tradition',
        },
        {
          kind: 'drink',
          label: t('Dry white wine', 'Vin alb sec'),
          reason: t(
            'A bone-dry, crisp white matches salty almonds and olives, as in Andalusian bars.',
            'Un vin alb sec și proaspăt merge cu migdalele sărate și cu măslinele, ca în barurile din Andaluzia.',
          ),
          principle: 'regional_tradition',
          ingredient: 'white-wine',
        },
        {
          kind: 'drink',
          label: t('Red wine', 'Vin roșu'),
          reason: t(
            'Fruit and gentle tannin stand up to chorizo and manchego.',
            'Fructul și taninul blând țin piept chorizoului și brânzei manchego.',
          ),
          principle: 'complement_flavour',
          ingredient: 'red-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Salty cured meats and cheese are heavy shortly before bed.',
            'Mezelurile sărate și brânza sunt grele cu puțin timp înainte de culcare.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Little cooking, and cool tomato on toast is refreshing.',
            'Se gătește puțin, iar roșia rece pe pâine prăjită e răcoritoare.',
          ),
        },
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'Small shared plates suit a slow, social meal.',
            'Porțiile mici de împărțit se potrivesc unei mese lente, în companie.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Chorizo and nuts are rich and slow to settle.',
            'Chorizo și migdalele sunt grase și se digeră greu.',
          ),
        },
      ],
    },
    // ------------------------------------------------------------------- Greek
    {
      slug: 'appetizer-platter-greek',
      cuisine: 'greek',
      title: t('Greek meze platter', 'Platou grecesc de meze'),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 5,
      difficulty: 'easy',
      lines: [
        line('feta', 150, 'g', t('in one slab', 'o bucată întreagă')),
        line('olives', 100, 'g', t('kalamata', 'kalamata')),
        line('dolmades', 150, 'g'),
        line('pita', 4, 'pcs', t('cut into wedges', 'tăiate triunghiuri')),
        line('greek-yogurt', 250, 'g'),
        line(
          'cucumber',
          1,
          'pcs',
          t('half grated, half sliced', 'jumătate rasă, jumătate felii'),
        ),
        line('garlic', 5, 'g', t('1 clove, crushed', '1 cățel, zdrobit')),
        line('dill', 5, 'g', t('chopped', 'tocat')),
        line('lemon-juice', 10, 'ml'),
        line('olive-oil', 40, 'ml'),
        line('oregano', 1, 'g'),
        line('salt', 2, 'g'),
      ],
      steps: [
        {
          key: 'tzatziki',
          text: t(
            'Grate half of the cucumber, squeeze out the water with your hands and mix it with the yogurt, garlic, dill, lemon juice, 10 ml of the olive oil and the salt. Chill for at least 15 minutes.',
            'Dă jumătate din castravete pe răzătoare, stoarce apa cu mâinile și amestecă-l cu iaurtul, usturoiul, mărarul, zeama de lămâie, 10 ml din uleiul de măsline și sarea. Dă la rece cel puțin 15 minute.',
          ),
        },
        {
          key: 'feta',
          text: t(
            'Set the feta on a plate, drizzle with 15 ml of olive oil and scatter the oregano over it.',
            'Pune feta pe o farfurie, stropește-o cu 15 ml de ulei de măsline și presară oregano deasupra.',
          ),
        },
        {
          key: 'pita',
          text: t(
            'Warm the pita in a dry pan or under the grill for about 1 minute per side until soft and puffed.',
            'Încălzește lipiile într-o tigaie uscată sau sub grătar, cam 1 minut pe fiecare parte, până se înmoaie și se umflă.',
          ),
          timerSeconds: 120,
        },
        {
          key: 'arrange',
          text: t(
            'Serve the tzatziki in a bowl, drizzled with the remaining oil. Arrange the feta, dolmades, olives, cucumber slices and warm pita around it.',
            'Servește tzatziki într-un bol, stropit cu uleiul rămas. Așază în jur feta, dolmades, măslinele, feliile de castravete și lipiile calde.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'tzatziki',
          text: t(
            'Squeeze the grated cucumber really dry, or the tzatziki turns thin and watery within the hour.',
            'Stoarce castravetele ras bine de tot, altfel tzatziki devine subțire și apos în mai puțin de o oră.',
          ),
        },
      ],
      nutritionNote: t(
        'Yogurt and cucumber give protein and freshness, olive oil and dolmades are mostly plant-based, and pita adds energy; feta and olives are very salty, and the olive oil adds up, so keep the pours modest.',
        'Iaurtul și castravetele dau proteine și prospețime, uleiul de măsline și dolmades sunt în mare parte vegetale, iar pita aduce energie; feta și măslinele sunt foarte sărate, iar uleiul de măsline se adună, așa că toarnă-l cu măsură.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Greek chicken salad', 'Salată grecească cu pui'),
          reason: t(
            'The meze starter leads into the Greek salad with the same flavours.',
            'Mezeurile deschid masa și duc la salata grecească, cu aceleași arome.',
          ),
          principle: 'complement_flavour',
          recipe: 'chicken-salad-greek',
        },
        {
          kind: 'food',
          label: t('Fresh tomato wedges', 'Felii de roșii proaspete'),
          reason: t(
            'Their juice and acidity lighten the salty feta and olives.',
            'Sucul și aciditatea lor ușurează feta sărată și măslinele.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'tomato',
        },
        {
          kind: 'food',
          label: t('Lemon wedges', 'Felii de lămâie'),
          reason: t(
            'A squeeze brightens the dolmades and the olive oil.',
            'Câteva picături înviorează dolmades și uleiul de măsline.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'lemon',
        },
        {
          kind: 'drink',
          label: t('Chilled dry white wine', 'Vin alb sec rece'),
          reason: t(
            'Crisp acidity stands up to feta and olives and suits the herbs.',
            'Aciditatea proaspătă ține piept fetei și măslinelor și se potrivește cu ierburile.',
          ),
          principle: 'regional_tradition',
          ingredient: 'white-wine',
        },
        {
          kind: 'drink',
          label: t(
            'Cold sparkling water with lemon',
            'Apă minerală rece cu lămâie',
          ),
          reason: t(
            'A light, thirst-quenching drink between salty bites.',
            'O băutură ușoară, care potolește setea, între îmbucături sărate.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'sparkling-water',
        },
        {
          kind: 'drink',
          label: t('Ouzo', 'Ouzo'),
          reason: t(
            'Served cold with water, the aniseed spirit is the classic meze companion in Greece.',
            'Servit rece, cu apă, rachiul de anason este însoțitorul clasic al mezelor în Grecia.',
          ),
          principle: 'regional_tradition',
        },
      ],
      eatingMoments: [
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Served cool, with cucumber and yogurt for refreshment.',
            'Se servește rece, cu castravete și iaurt pentru răcorire.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Plant-forward and filling without being heavy.',
            'Mai mult vegetal și sățios, fără să fie greu.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Yogurt and cheese give protein, and pita gives carbohydrates.',
            'Iaurtul și brânza dau proteine, iar pita carbohidrați.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Raw garlic and salty cheese can sit badly before bed.',
            'Usturoiul crud și brânza sărată pot cădea prost înainte de culcare.',
          ),
        },
      ],
    },
    // ---------------------------------------------------------------- Levantine
    {
      slug: 'appetizer-platter-levantine',
      cuisine: 'middle-eastern',
      // Cured fish or no cheese and meat: not served at room temperature.
      hideBaseTips: [0],
      title: t('Levantine mezze platter', 'Platou levantin de mezze'),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 50,
      difficulty: 'medium',
      lines: [
        line('aubergine', 2, 'pcs', t('large', 'mari')),
        line('tahini', 40, 'g'),
        line('garlic', 5, 'g', t('1 clove, crushed', '1 cățel, zdrobit')),
        line('lemon-juice', 30, 'ml'),
        line('olive-oil', 30, 'ml'),
        line('salt', 2, 'g'),
        line('hummus', 200, 'g'),
        line(
          'falafel',
          200,
          'g',
          t(
            'ready-made, chilled or frozen',
            'gata preparat, refrigerat sau congelat',
          ),
        ),
        line('pita', 4, 'pcs', t('cut into wedges', 'tăiate triunghiuri')),
        line('cucumber', 1, 'pcs', t('cut into sticks', 'tăiat bastonașe')),
        line('cherry-tomato', 150, 'g'),
        line('parsley', 10, 'g', t('chopped', 'tocat')),
      ],
      steps: [
        {
          key: 'roast',
          text: t(
            'Prick the aubergines with a fork and roast them whole for 15 to 20 minutes directly over a gas flame, or for 40 to 45 minutes in a 220 °C oven, turning once, until the skin is charred and the flesh is collapsing.',
            'Înțeapă vinetele cu furculița și coace-le întregi 15-20 de minute direct pe flacără, ori 40-45 de minute în cuptor la 220 °C, întorcându-le o dată, până când coaja e arsă, iar miezul se destramă.',
          ),
          timerSeconds: 2520,
        },
        {
          key: 'baba',
          text: t(
            'Scoop the flesh out of the skins and drain it in a sieve for 5 minutes. Mash it roughly with the tahini, garlic, lemon juice and salt, then spread it in a bowl and drizzle with the olive oil.',
            'Scoate pulpa din coajă și scurge-o 5 minute într-o strecurătoare. Zdrobește-o grosier cu tahini, usturoiul, zeama de lămâie și sarea, apoi întinde-o într-un bol și stropește-o cu ulei de măsline.',
          ),
        },
        {
          key: 'falafel',
          text: t(
            'Heat the falafel as the pack says, usually 15 to 20 minutes in a 200 °C oven, until crisp and hot all the way through.',
            'Încălzește falafelul conform indicațiilor de pe pachet, de obicei 15-20 de minute în cuptor la 200 °C, până devine crocant și fierbinte și la mijloc.',
          ),
          timerSeconds: 1020,
        },
        {
          key: 'arrange',
          text: t(
            'Put the baba ghanoush and the hummus in bowls on a large platter and arrange the hot falafel, pita, cucumber and tomatoes around them. Scatter the parsley over everything.',
            'Pune baba ghanoush și humusul în boluri pe un platou mare și așază în jur falafelul fierbinte, pita, castravetele și roșiile. Presară pătrunjel peste toate.',
          ),
        },
      ],
      tips: [
        t(
          'Charring the aubergine skin properly is what gives baba ghanoush its smoky flavour; do not rush this step.',
          'Arderea bună a cojii de vinete dă baba ghanoush gustul afumat; nu grăbi acest pas.',
        ),
      ],
      stepTips: [
        {
          step: 'baba',
          text: t(
            'Mash with a fork rather than a blender; a slightly rough texture is what makes it baba ghanoush and not a smooth dip.',
            'Zdrobește cu furculița, nu cu blenderul; o textură ușor aspră face din ea baba ghanoush, nu o cremă fină.',
          ),
        },
      ],
      nutritionNote: t(
        'Aubergine, chickpeas and vegetables are rich in fibre and plant protein, and tahini adds minerals and healthy fats; falafel is usually fried and soaks up oil, and tahini and olive oil are calorie-dense, so go easy on the dips.',
        'Vinetele, năutul și legumele sunt bogate în fibre și proteine vegetale, iar tahini aduce minerale și grăsimi sănătoase; falafelul este de obicei prăjit și absoarbe ulei, iar tahini și uleiul de măsline sunt foarte calorice, așa că nu exagera cu pastele tartinabile.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Sumac and lemon', 'Sumac și lămâie'),
          reason: t(
            'Sour, fruity sumac brightens the creamy dips and the falafel.',
            'Sumacul acrișor și fructat înviorează dipurile cremoase și falafelul.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'sumac',
        },
        {
          kind: 'food',
          label: t('Pickled peppers', 'Ardei murați'),
          reason: t(
            'Their sharpness cuts through the richness of tahini and fried falafel.',
            'Aciditatea lor taie grăsimea tahiniului și a falafelului prăjit.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-peppers',
        },
        {
          kind: 'food',
          label: t('Fresh mint', 'Mentă proaspătă'),
          reason: t(
            'A cool herb note lifts the earthy chickpeas and aubergine.',
            'O notă răcoritoare de ierburi pune în valoare gustul de pământ al năutului și al vinetelor.',
          ),
          principle: 'complement_flavour',
          ingredient: 'mint',
        },
        {
          kind: 'drink',
          label: t('Arak', 'Arak'),
          reason: t(
            'The aniseed spirit is the traditional partner of a Levantine mezze table, served with water and ice.',
            'Rachiul de anason este însoțitorul tradițional al unei mese levantine cu mezze, servit cu apă și gheață.',
          ),
          principle: 'regional_tradition',
        },
        {
          kind: 'drink',
          label: t('Ayran', 'Ayran'),
          reason: t(
            'Cold, salty yogurt drink cools the palate between rich bites.',
            'Băutura rece și sărată din iaurt răcorește gura între îmbucături bogate.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'drinking-yogurt',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Plant-based and filling without meat.',
            'Vegetal și sățios, fără carne.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Chickpeas and pita give protein and carbohydrates for recovery.',
            'Năutul și pita dau proteine și carbohidrați pentru refacere.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Fried falafel and legumes can cause bloating during exercise.',
            'Falafelul prăjit și leguminoasele pot da balonare în timpul efortului.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Chickpeas and garlic are heavy shortly before sleep.',
            'Năutul și usturoiul sunt grele cu puțin timp înainte de somn.',
          ),
        },
      ],
    },
    // ------------------------------------------------------------------ French
    {
      slug: 'appetizer-platter-french',
      cuisine: 'french',
      title: t('French apéritif platter', 'Platou franțuzesc de aperitiv'),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 0,
      difficulty: 'easy',
      lines: [
        line(
          'salami',
          100,
          'g',
          t(
            'saucisson sec, thinly sliced',
            'saucisson sec, tăiat felii subțiri',
          ),
        ),
        line(
          'liver-pate',
          100,
          'g',
          t('country-style pâté', 'pateu rustic (pâté de campagne)'),
        ),
        line('brie', 150, 'g', t('a wedge', 'o felie triunghiulară')),
        line(
          'gruyere',
          100,
          'g',
          t('Comté if you can find it', 'sau Comté, dacă găsești'),
        ),
        line('baguette', 1, 'pcs', t('sliced', 'tăiată felii')),
        line('pickled-cucumbers', 80, 'g', t('cornichons', 'cornichoni')),
        line('olives', 80, 'g'),
        line(
          'radish',
          100,
          'g',
          t('with their tops if possible', 'cu frunze, dacă se poate'),
        ),
        line('butter', 40, 'g', t('soft', 'moale')),
        line('flaky-salt', 2, 'g'),
        line('grapes', 150, 'g'),
        line('mustard', 20, 'g', t('Dijon', 'Dijon')),
      ],
      steps: [
        {
          key: 'rest',
          text: t(
            'Take the brie, gruyère and pâté out of the fridge 30 minutes before serving; the brie should be soft at the centre.',
            'Scoate brie, gruyère și pateul din frigider cu 30 de minute înainte de servire; brie trebuie să fie moale în mijloc.',
          ),
        },
        {
          key: 'radishes',
          text: t(
            'Wash the radishes and set them in a dish beside the soft butter and a little flaky salt, to be dipped and eaten together.',
            'Spală ridichile și pune-le într-o farfurioară lângă untul moale și fulgii de sare, ca fiecare să înmoaie ridichea în unt și apoi în sare.',
          ),
        },
        {
          key: 'slice',
          text: t(
            'Slice the baguette on the diagonal and cut the gruyère into small slabs. Put the cornichons, olives and mustard in small bowls.',
            'Taie bagheta pieziș și brânza gruyère în bucăți mici. Pune cornichonii, măslinele și muștarul în boluri mici.',
          ),
        },
        {
          key: 'arrange',
          text: t(
            'Arrange the saucisson, pâté with a knife, cheeses, bread, radishes with butter, bowls and grapes on a wooden board.',
            'Aranjează saucisson, pateul cu un cuțit, brânzeturile, pâinea, ridichile cu unt, bolurile și strugurii pe un platou de lemn.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'rest',
          text: t(
            'Do not cut the brie until you serve it; once cut, the rind starts to dry out.',
            'Nu tăia brie decât la servire; odată tăiată, coaja începe să se usuce.',
          ),
        },
      ],
      nutritionNote: t(
        'Radishes, cornichons and grapes add freshness, and bread, cheese and pâté are satisfying in small amounts; pâté, saucisson, butter and the cheeses are rich in saturated fat and salt, so this is a platter for nibbling, not a meal.',
        'Ridichile, cornichonii și strugurii aduc prospețime, iar pâinea, brânza și pateul sunt sățioase în cantități mici; pateul, saucisson, untul și brânzeturile sunt bogate în grăsimi saturate și sare, deci e un platou pentru ciugulit, nu o masă.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Fresh pear', 'Pară proaspătă'),
          reason: t(
            'Juicy, sweet pear sets off the salty brie and gruyère.',
            'Para zemoasă și dulce pune în valoare brie și gruyère sărate.',
          ),
          principle: 'salt_balances_sweet',
          ingredient: 'pear',
        },
        {
          kind: 'food',
          label: t('Walnuts', 'Nuci'),
          reason: t(
            'Crunchy, slightly bitter nuts contrast the soft cheeses.',
            'Nucile crocante, ușor amărui, fac contrast cu brânzeturile moi.',
          ),
          principle: 'contrast_texture',
          ingredient: 'walnuts',
        },
        {
          kind: 'drink',
          label: t(
            'Champagne or dry sparkling wine',
            'Șampanie sau vin spumant sec',
          ),
          reason: t(
            'The classic apéritif: bubbles and acidity clean the palate after rich bites.',
            'Aperitivul clasic: bulele și aciditatea curăță gustul după îmbucăturile bogate.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'sparkling-wine',
        },
        {
          kind: 'drink',
          label: t('Rosé wine', 'Vin rosé'),
          reason: t(
            'A chilled dry rosé is fruity enough for pâté and light enough for brie.',
            'Un rosé sec și rece este destul de fructat pentru pateu și destul de ușor pentru brie.',
          ),
          principle: 'regional_tradition',
          ingredient: 'rose-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Rich pâté and cheese are heavy late at night.',
            'Pateul gras și brânzeturile sunt grele seara târziu.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Cold dishes with crisp radishes and chilled wine.',
            'Preparate reci, cu ridichi crocante și vin răcit.',
          ),
        },
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'A relaxed spread that people can graze over a long time.',
            'O masă relaxată, din care fiecare ciugulește mult timp.',
          ),
        },
      ],
    },
    // ------------------------------------------------------------ Scandinavian
    {
      slug: 'appetizer-platter-scandinavian',
      cuisine: 'scandinavian',
      // Cured fish or no cheese and meat: not served at room temperature.
      hideBaseTips: [0],
      title: t(
        'Scandinavian smørrebrød platter',
        'Platou scandinav de smørrebrød',
      ),
      servings: 4,
      prepMinutes: 25,
      cookMinutes: 0,
      difficulty: 'easy',
      lines: [
        line(
          'rye-bread',
          1,
          'pcs',
          t('sliced thinly, 8 slices', 'tăiată subțire, 8 felii'),
        ),
        line('butter', 50, 'g', t('soft', 'moale')),
        line(
          'salted-herring',
          120,
          'g',
          t('pickled herring', 'hering marinat'),
        ),
        line(
          'red-onion',
          1,
          'pcs',
          t('thinly sliced into rings', 'tăiată felii subțiri, inele'),
        ),
        line('boiled-eggs', 4, 'pcs', t('sliced', 'tăiate felii')),
        line('shrimp', 150, 'g', t('cooked and peeled', 'fierți și curățați')),
        line('mayonnaise', 40, 'g'),
        line('smoked-salmon', 120, 'g'),
        line('liver-pate', 100, 'g'),
        line('pickled-cucumbers', 60, 'g', t('sliced', 'feliați')),
        line('dill', 10, 'g', t('sprigs', 'crenguțe')),
        line('lemon', 1, 'pcs', t('cut into wedges', 'tăiată sferturi')),
      ],
      steps: [
        {
          key: 'butter',
          text: t(
            'Butter every slice of rye bread right to the edges; the butter keeps the toppings from soaking the bread.',
            'Unge fiecare felie de pâine de secară cu unt, până la margini; untul împiedică ingredientele de deasupra să înmoaie pâinea.',
          ),
        },
        {
          key: 'herring',
          text: t(
            'Top two slices with the herring pieces and a few rings of red onion and dill.',
            'Acoperă două felii cu bucăți de hering, câteva inele de ceapă roșie și mărar.',
          ),
        },
        {
          key: 'egg',
          text: t(
            'Fold the shrimp into the mayonnaise, then pile onto two slices, each topped with sliced egg and a sprig of dill.',
            'Amestecă creveții cu maioneza, apoi pune-i pe două felii și completează cu felii de ou și o crenguță de mărar.',
          ),
        },
        {
          key: 'salmon',
          text: t(
            'Fold the salmon over two slices with a lemon wedge on the side, and spread the pâté on the last two slices, topped with pickled cucumber.',
            'Împăturește somonul pe două felii, cu o felie de lămâie alături, și întinde pateul pe ultimele două felii, acoperit cu castraveți murați.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Arrange the open sandwiches on a board and serve straight away with knife and fork.',
            'Așază sandvișurile deschise pe un platou și servește imediat, cu cuțit și furculiță.',
          ),
        },
      ],
      tips: [
        t(
          'Smørrebrød is built to be eaten with knife and fork; keep the toppings in neat, generous layers.',
          'Smørrebrød se mănâncă cu cuțitul și furculița; așază ingredientele de deasupra în straturi ordonate și generoase.',
        ),
      ],
      stepTips: [
        {
          step: 'butter',
          text: t(
            'Use dense, thinly sliced rye; soft white bread collapses under the toppings.',
            'Folosește pâine de secară densă, tăiată subțire; pâinea albă moale se rupe sub ingredientele de deasupra.',
          ),
        },
      ],
      nutritionNote: t(
        'Rye bread gives fibre and keeps you full, fish brings protein and omega-3 fats, and eggs and pickles add variety; butter, mayonnaise, pâté and the cured or smoked fish are rich and salty, so watch how thickly you spread.',
        'Pâinea de secară dă fibre și te menține sătul, peștele aduce proteine și grăsimi omega-3, iar ouăle și murăturile dau varietate; untul, maioneza, pateul și peștele afumat sau marinat sunt bogate și sărate, așa că ai grijă cât de gros întinzi.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Pickled beetroot', 'Sfeclă murată'),
          reason: t(
            'Sweet-sour beetroot cuts the richness of herring and pâté.',
            'Sfecla dulce-acrișoară taie grăsimea heringului și a pateului.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'canned-beetroot',
        },
        {
          kind: 'food',
          label: t('Fresh dill', 'Mărar proaspăt'),
          reason: t(
            'Its fresh, aniseed note is the signature herb with fish and eggs.',
            'Nota lui proaspătă, ușor anasonată, îl face nelipsit lângă pește și ouă.',
          ),
          principle: 'regional_tradition',
          ingredient: 'dill',
        },
        {
          kind: 'drink',
          label: t('Cold lager', 'Bere blondă rece'),
          reason: t(
            'Crisp, cold beer is the usual partner of smørrebrød and cleans the palate between rich toppings.',
            'Berea rece și proaspătă însoțește de obicei smørrebrød și curăță gura între ingredientele bogate de deasupra.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
        {
          kind: 'drink',
          label: t('Sparkling water with lemon', 'Apă minerală cu lămâie'),
          reason: t(
            'A light, clean drink for a lunch of rich fish and bread.',
            'O băutură ușoară și curată pentru un prânz cu pește gras și pâine.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'sparkling-water',
        },
        {
          kind: 'drink',
          label: t('Aquavit', 'Akvavit'),
          reason: t(
            'A chilled shot of caraway and dill spirit, the traditional match for herring and rye bread.',
            'Un păhărel rece de băutură cu chimen și mărar, perechea tradițională a heringului și a pâinii de secară.',
          ),
          principle: 'regional_tradition',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'The traditional Danish lunch: filling and cold.',
            'Prânzul tradițional danez: săturător și rece.',
          ),
        },
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'Easy to make ahead and share.',
            'Se pregătește ușor din timp și se împarte.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Fish and egg give protein and rye bread gives carbohydrates.',
            'Peștele și oul dau proteine, iar pâinea neagră carbohidrați.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Salty fish and fatty spreads are heavy before bed.',
            'Peștele sărat și tartinele grase sunt grele înainte de culcare.',
          ),
        },
      ],
    },
    // ---------------------------------------------------------------- Japanese
    {
      slug: 'appetizer-platter-japanese',
      cuisine: 'japanese',
      // Cured fish or no cheese and meat: not served at room temperature.
      hideBaseTips: [0],
      title: t('Japanese otsumami platter', 'Platou japonez otsumami'),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 5,
      difficulty: 'easy',
      lines: [
        line(
          'edamame',
          250,
          'g',
          t('in the pod, frozen is fine', 'în păstăi, merge și congelat'),
        ),
        line(
          'salt',
          12,
          'g',
          t(
            'for the water and the cucumber',
            'pentru apă și pentru castravete',
          ),
        ),
        line('cucumber', 1, 'pcs', t('thinly sliced', 'tăiat felii subțiri')),
        line('rice-vinegar', 30, 'ml'),
        line('sugar', 5, 'g'),
        line('sesame-seeds', 5, 'g'),
        line(
          'tofu',
          200,
          'g',
          t('chilled, firm, in 4 pieces', 'rece, ferm, în 4 bucăți'),
        ),
        line('soy-sauce', 15, 'ml'),
        line(
          'spring-onion',
          20,
          'g',
          t('thinly sliced', 'tăiată felii subțiri'),
        ),
        line('ginger', 5, 'g', t('finely grated', 'dat pe răzătoare fină')),
        line('rice-crackers', 60, 'g'),
        line('nori', 2, 'g', t('cut into strips', 'tăiată fâșii')),
      ],
      steps: [
        {
          key: 'cucumber',
          text: t(
            'Toss the cucumber with 2 g of the salt and leave it for 10 minutes. Squeeze out the water, then mix with the rice vinegar, sugar and sesame seeds for a quick pickle.',
            'Amestecă castravetele cu 2 g din sare și lasă-l 10 minute. Stoarce apa, apoi amestecă-l cu oțetul de orez, zahărul și semințele de susan ca să obții o murătură rapidă.',
          ),
        },
        {
          key: 'edamame',
          text: t(
            'Boil the edamame in water with 10 g of salt for 4 to 5 minutes, then drain. Serve warm or at room temperature, sprinkled with a pinch of salt.',
            'Fierbe edamame în apă cu 10 g de sare 4-5 minute, apoi scurge-l. Servește-l cald sau la temperatura camerei, presărat cu un praf de sare.',
          ),
          timerSeconds: 270,
        },
        {
          key: 'tofu',
          text: t(
            'Put the tofu pieces on small plates, drizzle with the soy sauce and top with the spring onion and ginger.',
            'Pune bucățile de tofu pe farfurioare, stropește-le cu sosul de soia și completează cu ceapă verde și ghimbir.',
          ),
        },
        {
          key: 'arrange',
          text: t(
            'Arrange the edamame, quick-pickled cucumber, tofu and rice crackers on a tray, with the nori strips for wrapping around the crackers.',
            'Aranjează edamame, castraveții murați rapid, tofu și biscuiții de orez pe o tavă, cu fâșiile de nori în care să înfășori biscuiții.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'edamame',
          text: t(
            'Salt the water well; edamame are eaten by squeezing the beans out of the pods, and the salt on the pod flavours each one.',
            'Sărează bine apa; edamame se mănâncă scoțând boabele din păstăi, iar sarea de pe păstaie dă gust fiecărei boabe.',
          ),
        },
      ],
      nutritionNote: t(
        'Edamame and tofu are good plant protein with fibre, and cucumber keeps the plate light; soy sauce, salted crackers and the salted pickle are high in salt, so use soy sauce sparingly.',
        'Edamame și tofu sunt o sursă bună de proteine vegetale și fibre, iar castravetele ține farfuria ușoară; sosul de soia, biscuiții sărați și murătura sărată au mult sodiu, așa că folosește sosul de soia cu măsură.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Karaage', 'Karaage'),
          reason: t(
            'Otsumami and karaage are both izakaya fare.',
            'Otsumami și karaage fac parte, amândouă, din bucătăria izakaya.',
          ),
          principle: 'regional_tradition',
          recipe: 'fried-chicken-karaage',
        },
        {
          kind: 'food',
          label: t('Wasabi', 'Wasabi'),
          reason: t(
            'A little heat cuts through the soft tofu and keeps the palate lively.',
            'Puțină iuțeală dă viață tofu-ului moale și înviorează gustul.',
          ),
          principle: 'complement_flavour',
          ingredient: 'wasabi',
        },
        {
          kind: 'food',
          label: t('Pickled ginger', 'Ghimbir murat'),
          reason: t(
            'Its sweet-sour bite resets the palate between salty snacks.',
            'Gustul lui dulce-acrișor reîmprospătează gura între gustările sărate.',
          ),
          principle: 'cleanses_palate',
        },
        {
          kind: 'drink',
          label: t('Green tea', 'Ceai verde'),
          reason: t(
            'Its gentle bitterness refreshes the palate between salty bites.',
            'Amăreala lui blândă împrospătează gura între îmbucături sărate.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'green-tea',
        },
        {
          kind: 'drink',
          label: t('Cold lager', 'Bere blondă rece'),
          reason: t(
            'The standard izakaya partner for salty snacks.',
            'Perechea clasică din izakaya pentru gustări sărate.',
          ),
          principle: 'regional_tradition',
          ingredient: 'beer',
        },
        {
          kind: 'drink',
          label: t('Sake', 'Sake'),
          reason: t(
            'Cold or warm, its gentle sweetness suits tofu, edamame and salty snacks.',
            'Rece sau cald, dulceața lui blândă se potrivește cu tofu, edamame și gustări sărate.',
          ),
          principle: 'regional_tradition',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Light, high in plant protein and low in fat.',
            'Ușor, bogat în proteine vegetale și sărac în grăsime.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Cool cucumber and tofu are refreshing.',
            'Castravetele și tofu-ul reci sunt răcoritoare.',
          ),
        },
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Soy protein helps recovery; add rice for carbohydrates.',
            'Proteinele din soia ajută la refacere; adaugă orez pentru carbohidrați.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Soy sauce and salted crackers are salty and can make you thirsty at night.',
            'Sosul de soia și biscuiții sărați conțin multă sare și pot provoca sete noaptea.',
          ),
        },
      ],
    },
  ],
};
