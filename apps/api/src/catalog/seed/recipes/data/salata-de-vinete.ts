import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Salată de vinete base is the Romanian aubergine spread: aubergines
// charred whole over a flame, peeled, drained, chopped with a wooden knife and
// worked with sunflower oil and raw onion. Each Variant is a full Recipe with
// its own lines, steps and guidance; the base's Recipe-level Tips are
// inherited.
export const salataDeVinete: BaseRecipeSeed = {
  slug: 'salata-de-vinete',
  title: t('Romanian aubergine spread (salată de vinete)', 'Salată de vinete'),
  servings: 6,
  prepMinutes: 60,
  cookMinutes: 25,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'aubergine',
      quantity: 4,
      unit: 'pcs',
      note: t('about 300 g each', 'de câte 300 g fiecare'),
    },
    { ingredient: 'sunflower-oil', quantity: 150, unit: 'ml' },
    {
      ingredient: 'onion',
      quantity: 1,
      unit: 'pcs',
      note: t('small, very finely chopped', 'mică, tocată foarte mărunt'),
    },
    { ingredient: 'salt', quantity: 6, unit: 'g' },
    {
      ingredient: 'lemon-juice',
      quantity: 10,
      unit: 'ml',
      optional: true,
    },
    {
      ingredient: 'mayonnaise',
      quantity: 60,
      unit: 'g',
      optional: true,
      note: t('for the creamier version', 'pentru varianta mai cremoasă'),
    },
  ],
  steps: [
    {
      key: 'char',
      text: t(
        'Prick each aubergine a few times with a fork so the steam can escape. Lay them straight on the grate of a gas hob over a medium-high flame, or on a barbecue, and turn them with tongs every 4 to 5 minutes for 20 to 25 minutes, until the skin is black and cracked and the flesh has collapsed. Open a window, and stay by the hob.',
        'Înțeapă fiecare vânătă de câteva ori cu furculița, ca aburul să poată ieși. Pune-le direct pe grătarul aragazului, la foc mediu-mare, sau pe un grătar la cărbuni și întoarce-le cu cleștele la fiecare 4-5 minute, timp de 20-25 de minute, până când coaja e neagră și crăpată, iar miezul s-a muiat de tot. Deschide fereastra și nu te îndepărta de aragaz.',
      ),
      timerSeconds: 1500,
    },
    {
      key: 'peel',
      text: t(
        'Move the aubergines to a plate and leave them for 5 minutes, until you can handle them. Holding each by the stalk, peel off the skin and cut away the stalk. Do not rinse the flesh.',
        'Mută vinetele pe o farfurie și lasă-le 5 minute, până poți să le atingi. Ține fiecare vânătă de codiță, curăță-i coaja și taie codița. Nu spăla miezul.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'drain',
      text: t(
        'Put the flesh in a sieve or colander over a bowl and press it lightly with a wooden spoon. Leave it to drain for 30 minutes, then throw away the dark liquid.',
        'Pune miezul într-o strecurătoare sau într-o sită, deasupra unui vas, și apasă-l ușor cu lingura de lemn. Lasă-l la scurs 30 de minute, apoi aruncă lichidul închis la culoare.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'chop',
      text: t(
        'Chop the drained flesh on a wooden board with a wooden or plastic knife, or the edge of a wooden spoon, until it is finely chopped and fluffy, with no long strings. Tip it into a wide bowl of wood, glass or ceramic.',
        'Toacă miezul scurs pe o tocătoare de lemn, cu un cuțit de lemn sau de plastic ori cu marginea unei linguri de lemn, până e tocat mărunt și pufos, fără fire lungi. Pune-l într-un castron larg de lemn, sticlă sau ceramică.',
      ),
    },
    {
      key: 'emulsify',
      text: t(
        'Stir in the salt. Then add the sunflower oil a thin trickle at a time, stirring hard in one direction with a wooden spoon and waiting until each addition is absorbed, until the spread is pale, creamy and fluffy with no oil pooling on top.',
        'Adaugă sarea. Apoi toarnă uleiul de floarea soarelui într-un fir subțire, puțin câte puțin, amestecând energic într-un singur sens cu lingura de lemn și așteptând să se absoarbă fiecare cantitate, până când salata e pufoasă, cremoasă și mai deschisă la culoare, fără ulei adunat deasupra.',
      ),
    },
    {
      key: 'finish',
      text: t(
        'Stir in the onion, then the lemon juice and the mayonnaise if you are using them. Taste and add salt if it needs it. Leave it for 10 minutes so the onion mellows into it.',
        'Amestecă ceapa, apoi sucul de lămâie și maioneza, dacă le folosești. Gustă și mai adaugă sare dacă e nevoie. Las-o 10 minute, ca gusturile să se îmbine.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'serve',
      text: t(
        'Serve cool on thick slices of bread with sliced tomatoes. Cover what is left and refrigerate it within 2 hours; it keeps for up to 2 days.',
        'Servește salata rece pe felii groase de pâine, cu roșii tăiate felii. Acoperă ce rămâne și pune-l la frigider în maximum 2 ore; se păstrează până la 2 zile.',
      ),
    },
  ],
  tips: [
    t(
      'Char the aubergines until they slump completely. Pale, firm patches stay watery and bland instead of smoky.',
      'Coace vinetele până se înmoaie complet. Zonele palide și ferme rămân apoase și fade, în loc să fie afumate.',
    ),
    t(
      'Never rinse charred aubergine under the tap: it washes away the smoke you spent 25 minutes building. Let the sieve do the work.',
      'Nu spăla niciodată vinetele coapte sub jet de apă: se duce gustul afumat pentru care ai stat 25 de minute lângă flacără. Lasă strecurătoarea să facă treaba.',
    ),
  ],
  stepTips: [
    {
      step: 'char',
      text: t(
        'No gas or barbecue? Cook them under a very hot oven grill, turning them often, instead. You lose some of the smoke, but it still works.',
        'Nu ai aragaz sau grătar? Coace vinetele sub grill-ul foarte încins al cuptorului, întorcându-le des. Pierzi din gustul afumat, dar tot iese bine.',
      ),
    },
    {
      step: 'chop',
      text: t(
        'Cooks have long said a steel blade darkens the flesh and leaves a faint metallic taste. The effect is small, but a wooden or plastic knife costs nothing, and it chops the flesh fine and fluffy instead of mashing it to a smooth paste.',
        'Se spune de mult că lama de oțel închide la culoare vinetele și le lasă un gust ușor metalic. Efectul e mic, dar un cuțit de lemn sau de plastic nu costă nimic și toacă miezul mărunt și pufos, fără să-l transforme într-o pastă netedă.',
      ),
    },
    {
      step: 'emulsify',
      text: t(
        'Go slowly with the oil. Added too fast, it floats on top and the spread turns greasy instead of fluffy.',
        'Pune uleiul încet. Dacă îl torni prea repede, rămâne deasupra, iar salata iese grasă, nu pufoasă.',
      ),
    },
  ],
  nutritionNote: t(
    'The aubergine itself is light and gives some fibre, but most of the energy here comes from the oil, and the mayonnaise adds more fat and salt. Sunflower oil is mostly unsaturated fat. Spread it thinly, and let the tomatoes and wholemeal bread add fibre.',
    'Vânăta în sine e ușoară și aduce fibre, dar cea mai mare parte din energie vine din ulei, iar maioneza adaugă și mai multe grăsimi și sare. Uleiul de floarea soarelui conține mai ales grăsimi nesaturate. Întinde salata subțire, iar roșiile și pâinea integrală aduc fibre.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Sliced tomatoes', 'Roșii tăiate felii'),
      reason: t(
        'Their juicy acidity cuts through the oily, smoky spread.',
        'Aciditatea lor suculentă taie din grăsimea și afumatul salatei.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'tomato',
    },
    {
      kind: 'food',
      label: t('Country bread', 'Pâine de casă'),
      reason: t(
        'A thick slice with a chewy crust gives the soft spread something to sit on and bite against.',
        'O felie groasă de pâine cu coajă bună ține salata moale și îi dă ceva de mușcat.',
      ),
      principle: 'contrast_texture',
      ingredient: 'country-bread',
    },
    {
      kind: 'food',
      label: t('Telemea', 'Telemea'),
      reason: t(
        'The salty, tangy brined cheese sharpens the mild aubergine.',
        'Brânza sărată și ușor acrișoară, din saramură, înviorează gustul blând al vinetelor.',
      ),
      principle: 'complement_flavour',
      ingredient: 'telemea',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'The sour crunch cuts the richness of the oil.',
        'Acreala crocantă taie din bogăția uleiului.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'drink',
      label: t('Cold dry white wine', 'Vin alb sec, rece'),
      reason: t(
        'Its acidity refreshes the palate between oily, smoky bites.',
        'Aciditatea lui împrospătează gustul între îmbucăturile uleioase și afumate.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'white-wine',
    },
  ],
  eatingMoments: [
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'On bread with tomatoes it makes a filling meal with no cooking left to do.',
        'Pe pâine, cu roșii, face o masă săturătoare, fără altă gătire.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'good_for',
      reason: t(
        'It is eaten cool, and the aubergines are cooked well ahead.',
        'Se mănâncă rece, iar vinetele se coc dinainte.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Raw onion and a lot of oil can sit heavy before bed.',
        'Ceapa crudă și uleiul din belșug pot cădea greu înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'salata-de-vinete-middle-eastern',
      cuisine: 'middle-eastern',
      title: t(
        'Moutabal (smoky aubergine and tahini dip)',
        'Moutabal (salată de vinete cu tahini)',
      ),
      servings: 6,
      prepMinutes: 25,
      cookMinutes: 25,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'aubergine',
          quantity: 4,
          unit: 'pcs',
          note: t('about 300 g each', 'de câte 300 g fiecare'),
        },
        { ingredient: 'tahini', quantity: 60, unit: 'g' },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t('juiced', 'storsă'),
        },
        {
          ingredient: 'garlic',
          quantity: 8,
          unit: 'g',
          note: t('2 cloves, crushed', '2 căței, striviți'),
        },
        { ingredient: 'salt', quantity: 5, unit: 'g' },
        {
          ingredient: 'still-water',
          quantity: 0.03,
          unit: 'l',
          optional: true,
          note: t(
            '1 to 2 tablespoons, only if needed',
            '1-2 linguri, doar dacă e nevoie',
          ),
        },
        { ingredient: 'olive-oil', quantity: 30, unit: 'ml' },
        {
          ingredient: 'parsley',
          quantity: 10,
          unit: 'g',
          optional: true,
          note: t('chopped', 'tocat'),
        },
        {
          ingredient: 'pomegranate',
          quantity: 0.5,
          unit: 'pcs',
          optional: true,
          note: t('seeds only', 'doar semințele'),
        },
        { ingredient: 'cumin', quantity: 1, unit: 'g', optional: true },
      ],
      steps: [
        {
          key: 'char',
          text: t(
            'Prick each aubergine a few times with a fork. Lay them straight on the grate of a gas hob over a medium-high flame, or on a barbecue, and turn them with tongs every 4 to 5 minutes for 20 to 25 minutes, until the skin is black and cracked and the flesh has collapsed. Open a window, and stay by the hob.',
            'Înțeapă fiecare vânătă de câteva ori cu furculița. Pune-le direct pe grătarul aragazului, la foc mediu-mare, sau pe un grătar la cărbuni și întoarce-le cu cleștele la fiecare 4-5 minute, timp de 20-25 de minute, până când coaja e neagră și crăpată, iar miezul s-a muiat de tot. Deschide fereastra și nu te îndepărta de aragaz.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'peel',
          text: t(
            'Move the aubergines to a plate and leave them for 5 minutes, until you can handle them. Peel off the skin, cut away the stalks and keep the flesh unrinsed.',
            'Mută vinetele pe o farfurie și lasă-le 5 minute, până poți să le atingi. Curăță coaja, taie codițele și nu spăla miezul.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'drain',
          text: t(
            'Put the flesh in a sieve over a bowl and let it drain for 15 minutes, then throw away the liquid.',
            'Pune miezul într-o strecurătoare, deasupra unui vas, și lasă-l la scurs 15 minute, apoi aruncă lichidul.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'tahini',
          text: t(
            'In a bowl, stir the tahini with the lemon juice, the crushed garlic and the salt. It will thicken at first. If it turns stiff and pasty, stir in the water a spoonful at a time, up to 2 tablespoons, until it is smooth; the wet aubergine will loosen it further.',
            'Într-un castron, amestecă tahini cu sucul de lămâie, usturoiul strivit și sarea. Se îngroașă la început. Dacă devine prea tare și păstoasă, adaugă apa câte o lingură, maximum 2 linguri, amestecând până se netezește; miezul umed o va subția și mai mult.',
          ),
        },
        {
          key: 'mash',
          text: t(
            'Add the drained flesh and mash it with a fork into a coarse, creamy dip with some strands left. Taste and add more salt or lemon if needed.',
            'Adaugă miezul scurs și zdrobește-l cu furculița, până obții o pastă cremoasă, cu câteva fire rămase. Gustă și adaugă sare sau lămâie, dacă e nevoie.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Spread the dip on a plate, make a shallow well in the middle and pour in the olive oil. Scatter with the parsley, pomegranate seeds and cumin. Serve with warm flatbread. Cover what is left and refrigerate it within 2 hours; it keeps for up to 2 days.',
            'Întinde crema pe o farfurie, fă o adâncitură mică la mijloc și toarnă uleiul de măsline. Presară pătrunjelul, semințele de rodie și chimionul. Servește cu lipie caldă. Acoperă ce rămâne și pune-l la frigider în maximum 2 ore; se păstrează până la 2 zile.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'tahini',
          text: t(
            'Do not worry when the tahini goes stiff and pasty as the lemon goes in: it is normal, and the water loosens it again.',
            'Nu te speria dacă tahini se întărește și devine păstos când pui lămâia: așa se întâmplă, iar apa îl înmoaie la loc.',
          ),
        },
      ],
      nutritionNote: t(
        'Tahini brings sesame protein and mostly unsaturated fat in place of the sunflower oil, with less oil overall than the Romanian spread, but it is still energy-dense. The olive oil and any salty extras add more. Eaten with white flatbread it is light on fibre, so add raw vegetables.',
        'Tahini aduce proteine din susan și mai ales grăsimi nesaturate, în locul uleiului de floarea soarelui, cu mai puțin ulei decât în salata românească, dar rămâne bogată în energie. Uleiul de măsline și adaosurile sărate o îngreunează. Mâncată cu lipie albă are puține fibre, așa că adaugă legume crude.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Warm pita bread', 'Lipie caldă'),
          reason: t(
            'The soft, warm bread scoops up the dip and carries its nutty flavour.',
            'Lipia moale și caldă e bună de luat crema cu ea și duce mai departe gustul de nucă.',
          ),
          principle: 'complement_flavour',
          ingredient: 'pita',
        },
        {
          kind: 'food',
          label: t('Cucumber', 'Castraveți'),
          reason: t(
            'Cool, crunchy slices give a fresh contrast to the smoky, rich dip.',
            'Felii răcoroase și crocante dau un contrast proaspăt cremei afumate și bogate.',
          ),
          principle: 'contrast_texture',
          ingredient: 'cucumber',
        },
        {
          kind: 'food',
          label: t('Olives', 'Măsline'),
          reason: t(
            'Their salty bite sharpens the mild aubergine.',
            'Gustul lor sărat ascute gustul blând al vinetelor.',
          ),
          principle: 'complement_flavour',
          ingredient: 'olives',
        },
        {
          kind: 'drink',
          label: t('Mint tea', 'Ceai de mentă'),
          reason: t(
            'Its cool freshness clears the palate after the rich tahini.',
            'Răcoarea mentei curăță gustul după tahini.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'mint-tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'With flatbread and raw vegetables it makes a quick meal.',
            'Cu lipie și legume crude face o masă rapidă.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Served cool, with nothing to cook once the aubergines are done.',
            'Se servește rece, fără nimic de gătit după ce vinetele sunt coapte.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Raw garlic and rich tahini can sit heavy before bed.',
            'Usturoiul crud și tahini bogat pot cădea greu înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'salata-de-vinete-greek',
      cuisine: 'greek',
      title: t(
        'Melitzanosalata (Greek aubergine dip)',
        'Melitzanosalata (salată grecească de vinete)',
      ),
      servings: 6,
      prepMinutes: 35,
      cookMinutes: 25,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'aubergine',
          quantity: 4,
          unit: 'pcs',
          note: t('about 300 g each', 'de câte 300 g fiecare'),
        },
        { ingredient: 'olive-oil', quantity: 60, unit: 'ml' },
        {
          ingredient: 'wine-vinegar',
          quantity: 15,
          unit: 'ml',
          note: t('red', 'roșu'),
        },
        {
          ingredient: 'garlic',
          quantity: 8,
          unit: 'g',
          note: t('2 cloves, crushed', '2 căței, striviți'),
        },
        {
          ingredient: 'red-onion',
          quantity: 0.5,
          unit: 'pcs',
          note: t('grated', 'rasă'),
        },
        {
          ingredient: 'parsley',
          quantity: 30,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        { ingredient: 'salt', quantity: 5, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        {
          ingredient: 'walnuts',
          quantity: 30,
          unit: 'g',
          optional: true,
          note: t('chopped', 'tocate'),
        },
        {
          ingredient: 'feta',
          quantity: 60,
          unit: 'g',
          optional: true,
          note: t('crumbled, to serve', 'mărunțită, pentru servit'),
        },
      ],
      steps: [
        {
          key: 'char',
          text: t(
            'Prick each aubergine a few times with a fork. Lay them straight on the grate of a gas hob over a medium-high flame, or on a barbecue, and turn them with tongs every 4 to 5 minutes for 20 to 25 minutes, until the skin is black and cracked and the flesh has collapsed. Open a window, and stay by the hob.',
            'Înțeapă fiecare vânătă de câteva ori cu furculița. Pune-le direct pe grătarul aragazului, la foc mediu-mare, sau pe un grătar la cărbuni și întoarce-le cu cleștele la fiecare 4-5 minute, timp de 20-25 de minute, până când coaja e neagră și crăpată, iar miezul s-a muiat de tot. Deschide fereastra și nu te îndepărta de aragaz.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'peel',
          text: t(
            'Move the aubergines to a plate and leave them for 5 minutes, until you can handle them. Peel off the skin, cut away the stalks and keep the flesh unrinsed.',
            'Mută vinetele pe o farfurie și lasă-le 5 minute, până poți să le atingi. Curăță coaja, taie codițele și nu spăla miezul.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'drain',
          text: t(
            'Put the flesh in a sieve over a bowl and let it drain for 20 minutes, pressing it lightly once or twice, then throw away the liquid.',
            'Pune miezul într-o strecurătoare, deasupra unui vas, și lasă-l la scurs 20 de minute, apăsându-l ușor o dată sau de două ori, apoi aruncă lichidul.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'chop',
          text: t(
            'Chop the flesh roughly with a wooden or plastic knife, leaving it chunky with some strands, and tip it into a bowl.',
            'Toacă miezul grosier cu un cuțit de lemn sau de plastic, lăsându-l cu bucățele și fire, și pune-l într-un castron.',
          ),
        },
        {
          key: 'dress',
          text: t(
            'Add the garlic, red onion, vinegar, salt and pepper. Stir in the olive oil a spoonful at a time, then fold in the parsley. Keep it chunky: do not whisk it smooth.',
            'Adaugă usturoiul, ceapa roșie, oțetul, sarea și piperul. Amestecă uleiul de măsline câte o lingură, apoi încorporează pătrunjelul. Las-o cu bucăți: nu o bate până devine netedă.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Taste and adjust the salt and vinegar. Top with the walnuts and feta if you are using them, and serve with bread. Cover what is left and refrigerate it within 2 hours; it keeps for up to 2 days.',
            'Gustă și corectează sarea și oțetul. Presară nucile și feta deasupra, dacă le folosești, și servește cu pâine. Acoperă ce rămâne și pune-l la frigider în maximum 2 ore; se păstrează până la 2 zile.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'drain',
          text: t(
            'This version has no thick oil emulsion to hold it together, so drain it well or it weeps in the bowl.',
            'Salata aceasta nu e legată cu ulei ca cea românească, așa că scurge miezul bine, altfel lasă apă în castron.',
          ),
        },
      ],
      nutritionNote: t(
        'Olive oil gives mostly unsaturated fat, and there is far less of it than in the Romanian spread, with parsley and a little onion adding freshness. Feta and walnuts add salt and fat but also flavour, so a little goes a long way. White bread on the side is light on fibre.',
        'Uleiul de măsline aduce mai ales grăsimi nesaturate, iar cantitatea e mult mai mică decât în salata românească, iar pătrunjelul și ceapa adaugă prospețime. Feta și nucile aduc sare și grăsimi, dar și gust, așa că ajunge puțin. Pâinea albă servită alături are puține fibre.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Greek meze platter', 'Platou grecesc de meze'),
          reason: t(
            'Melitzanosalata is a meze dip, and it sits well with the other small plates.',
            'Melitzanosalata este una dintre salatele de meze și se potrivește cu celelalte farfurioare.',
          ),
          principle: 'regional_tradition',
          recipe: 'appetizer-platter-greek',
        },
        {
          kind: 'food',
          label: t('Warm pita bread', 'Lipie caldă'),
          reason: t(
            'Soft, warm bread scoops up the chunky dip.',
            'Pâinea moale și caldă ia cu ea salata cu bucăți.',
          ),
          principle: 'complement_flavour',
          ingredient: 'pita',
        },
        {
          kind: 'food',
          label: t('Olives', 'Măsline'),
          reason: t(
            'Their briny bite sharpens the mild, smoky aubergine.',
            'Gustul lor sărat ascute gustul blând și afumat al vinetelor.',
          ),
          principle: 'complement_flavour',
          ingredient: 'olives',
        },
        {
          kind: 'drink',
          label: t('Cold dry white wine', 'Vin alb sec, rece'),
          reason: t(
            'Its acidity refreshes the palate between oily bites.',
            'Aciditatea lui împrospătează gustul între îmbucăturile uleioase.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'white-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'With bread, feta and tomatoes it makes an easy light meal.',
            'Cu pâine, feta și roșii face o masă ușoară, simplă.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Served cool, with fresh parsley and a sharp vinegar note.',
            'Se servește rece, cu pătrunjel proaspăt și o notă acră de oțet.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Raw garlic and onion can sit heavy before bed.',
            'Usturoiul și ceapa crude pot cădea greu înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
