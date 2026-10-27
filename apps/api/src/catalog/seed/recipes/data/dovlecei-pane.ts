import { t, type BaseRecipeSeed, type Text } from '../recipe-seed-types';

// The Dovlecei pane base is breaded, shallow-fried courgettes with a garlic
// yogurt sauce. Each Variant is a full Recipe with its own lines, steps and
// guidance: a Neapolitan marinated one, Turkish fritters and an oven-baked
// version. The base's Recipe-level Tips are inherited.

// The oil-fire advice, repeated on every shallow-frying Recipe because step
// Tips are never inherited.
const oilFireTip: Text = t(
  'Keep the pan lid within reach and stay by the hob. If the oil smokes, turn the heat off: it is too hot. If it catches fire, do not move the pan. If it is safe, slide the lid or a damp tea towel on, turn the heat off and leave it covered until cold. Never throw water on it. If the fire does not go out at once, get everyone out, close the door and call 112.',
  'Ține capacul tigăii la îndemână și nu pleca de lângă aragaz. Dacă uleiul fumegă, oprește focul: e prea încins. Dacă ia foc, nu muta tigaia. Dacă ești în siguranță, așază capacul sau un prosop de bucătărie umed peste ea, oprește focul și las-o acoperită până se răcește complet. Nu arunca niciodată apă peste ulei. Dacă focul nu se stinge imediat, scoate pe toată lumea din casă, închide ușa și sună la 112.',
);

export const dovleceiPane: BaseRecipeSeed = {
  slug: 'dovlecei-pane',
  title: t(
    'Breaded fried courgettes with garlic yogurt sauce (dovlecei pane)',
    'Dovlecei pane cu sos de iaurt și usturoi',
  ),
  servings: 4,
  prepMinutes: 40,
  cookMinutes: 40,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'zucchini',
      quantity: 3,
      unit: 'pcs',
      note: t(
        'small to medium, about 600 g in all',
        'mici sau mijlocii, circa 600 g în total',
      ),
    },
    {
      ingredient: 'salt',
      key: 'salt-courgettes',
      quantity: 5,
      unit: 'g',
      note: t('for salting the slices', 'pentru sărat feliile'),
    },
    { ingredient: 'flour', quantity: 70, unit: 'g' },
    { ingredient: 'eggs', quantity: 3, unit: 'pcs' },
    {
      ingredient: 'salt',
      key: 'salt-egg',
      quantity: 1,
      unit: 'g',
      note: t('for the beaten egg', 'pentru ouăle bătute'),
    },
    { ingredient: 'breadcrumbs', quantity: 150, unit: 'g' },
    {
      ingredient: 'sunflower-oil',
      key: 'oil-frying',
      quantity: 450,
      unit: 'ml',
      note: t(
        'for frying, about 1 cm deep in a 28 cm pan',
        'pentru prăjit, cam 1 cm adâncime într-o tigaie de 28 cm',
      ),
    },
    { ingredient: 'yogurt', quantity: 300, unit: 'g' },
    {
      ingredient: 'garlic',
      quantity: 16,
      unit: 'g',
      note: t('about 4 cloves, crushed', 'cam 4 căței, striviți'),
    },
    {
      ingredient: 'dill',
      quantity: 10,
      unit: 'g',
      note: t('finely chopped', 'tocat mărunt'),
    },
    {
      ingredient: 'salt',
      key: 'salt-sauce',
      quantity: 1,
      unit: 'g',
      note: t('for the sauce', 'pentru sos'),
    },
    {
      ingredient: 'sunflower-oil',
      key: 'oil-sauce',
      quantity: 15,
      unit: 'ml',
      optional: true,
      note: t('for the sauce', 'pentru sos'),
    },
  ],
  steps: [
    {
      key: 'slice',
      text: t(
        'Cut each courgette in half across, then lengthwise into slices 7 to 8 mm thick. You should get about 36 slices.',
        'Taie fiecare dovlecel în două, pe lățime, apoi pe lungime în felii de 7-8 mm grosime. Ar trebui să obții cam 36 de felii.',
      ),
    },
    {
      key: 'salt',
      text: t(
        'Spread the slices in a colander or on a tray and sprinkle the 5 g of salt over both sides. Leave them for 20 minutes, until beads of water show on the surface.',
        'Întinde feliile într-un strecurător sau pe o tavă și presară cele 5 g de sare pe ambele părți. Lasă-le 20 de minute, până apar picături de apă la suprafață.',
      ),
      timerSeconds: 1200,
    },
    {
      key: 'sauce',
      text: t(
        'While the courgettes stand, stir the yogurt with the crushed garlic, the dill, the 1 g of salt and the oil, if using. Cover it and put it in the fridge until serving.',
        'Cât stau dovleceii, amestecă iaurtul cu usturoiul strivit, mărarul, gramul de sare și uleiul, dacă îl folosești. Acoperă sosul și ține-l la frigider până la servire.',
      ),
    },
    {
      key: 'dry',
      text: t(
        'Pat every slice dry on both sides with a clean tea towel or kitchen paper. Do not rinse them.',
        'Șterge fiecare felie pe ambele părți cu un prosop curat de bucătărie sau cu șervețele de hârtie. Nu le clăti.',
      ),
    },
    {
      key: 'stations',
      text: t(
        'Put the flour on one plate and the breadcrumbs on another. Beat the eggs with the 1 g of salt in a shallow bowl.',
        'Pune făina pe o farfurie și pesmetul pe alta. Bate ouăle cu gramul de sare într-un castron lat.',
      ),
    },
    {
      key: 'coat',
      text: t(
        'Dip each slice in the flour and shake off the excess, then in the egg and let it drip, then press it into the breadcrumbs on both sides. Lay the slices in a single layer on two trays lined with baking paper.',
        'Treci fiecare felie prin făină și scutur-o de surplus, apoi prin ou și lasă-o să se scurgă, apoi apas-o în pesmet pe ambele părți. Așază feliile într-un singur strat pe două tăvi tapetate cu hârtie de copt.',
      ),
    },
    {
      key: 'wash',
      text: t(
        'Wash your hands, the plates, the bowl and the fork with soap and hot water, because they touched raw egg. Throw away any leftover egg.',
        'Spală-te pe mâini, farfuriile, castronul și furculița cu săpun și apă fierbinte, pentru că au atins ou crud. Aruncă oul rămas.',
      ),
    },
    {
      key: 'oil',
      text: t(
        'Pour the oil into a wide, heavy 28 cm pan, about 1 cm deep and never more than 1.5 cm. Clip a cooking thermometer to the side and heat over medium heat to 170 to 175 °C, which takes about 5 minutes. Without a thermometer, a pinch of breadcrumbs should sizzle steadily and turn golden in about 30 seconds.',
        'Toarnă uleiul într-o tigaie lată și cu fund gros, de 28 cm, cam 1 cm adâncime și niciodată peste 1,5 cm. Prinde un termometru de bucătărie pe margine și încinge la foc mediu până la 170-175 °C, ceea ce durează cam 5 minute. Fără termometru, un praf de pesmet aruncat în ulei ar trebui să sfârâie constant și să se rumenească în vreo 30 de secunde.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'fry-first',
      text: t(
        'Lay about 9 slices in the oil, slowly and away from you, without crowding. Fry them for 2 to 3 minutes, until the underside is deep golden.',
        'Pune în ulei cam 9 felii, încet, lăsându-le să alunece în ulei dinspre tine spre partea opusă, fără să le înghesui. Prăjește-le 2-3 minute, până când partea de jos se rumenește intens.',
      ),
      timerSeconds: 150,
    },
    {
      key: 'turn-first',
      text: t(
        'Turn the slices with tongs and fry the other side for 2 to 3 minutes, until deep golden as well.',
        'Întoarce feliile cu cleștele și prăjește cealaltă parte 2-3 minute, până se rumenește intens și ea.',
      ),
      timerSeconds: 150,
    },
    {
      key: 'check',
      text: t(
        'Lift out the first slice onto a wire rack set over a tray (not the trays that held the raw coated slices) and cut it in half. The coating must be crisp and golden, the egg set with no wet or glossy patches between the flour and the crumbs, and the courgette tender when a knife slides in. If it is not, leave the rest of the batch in the oil for another minute. Set the cut slice aside on kitchen paper without putting it back in the oil, and eat it only if it was done; throw it away if it was raw. Then move the whole batch to the rack.',
        'Scoate prima felie pe un grătar așezat deasupra unei tăvi (nu pe tăvile pe care au stat feliile crude) și taie-o în două. Crusta trebuie să fie crocantă și aurie, oul închegat, fără zone umede sau lucioase între făină și pesmet, iar dovlecelul e fraged când intră cuțitul. Dacă nu e așa, lasă restul lotului în ulei încă un minut. Pune felia tăiată deoparte pe hârtie de bucătărie, fără să o mai pui în ulei, și mănânc-o doar dacă era gătită; aruncă-o dacă era crudă. Apoi mută tot lotul pe grătar.',
      ),
    },
    {
      key: 'fry-rest',
      text: t(
        'Bring the oil back to 170 to 175 °C and fry the remaining slices in batches the same way, to the same cues. Cut one slice of each batch open to check the egg is set. When the last batch is in the pan, wash your hands and the tongs with soap and hot water, and wash the two trays that held the raw coated slices.',
        'Adu uleiul înapoi la 170-175 °C și prăjește restul feliilor pe loturi, la fel, după aceleași semne. Taie câte o felie din fiecare lot ca să te asiguri că oul e închegat. Când ultimul lot e în tigaie, spală-te pe mâini și spală cleștele cu săpun și apă fierbinte, apoi spală cele două tăvi pe care au stat feliile crude.',
      ),
    },
    {
      key: 'heat-off',
      text: t(
        'As soon as the last batch is out, turn the heat off. Leave the pan where it is, with the lid beside it, and keep children away from the hot oil.',
        'Imediat ce ai scos ultimul lot, oprește focul. Lasă tigaia pe loc, cu capacul alături, și ține copiii departe de uleiul fierbinte.',
      ),
    },
    {
      key: 'serve',
      text: t(
        'Serve the courgettes hot, straight from the rack, with the cold garlic yogurt sauce.',
        'Servește dovleceii fierbinți, direct de pe grătar, cu sosul rece de iaurt și usturoi.',
      ),
    },
    {
      key: 'oil-cool',
      text: t(
        'After the meal, leave the oil until it is completely cold, which takes several hours. Then strain it into a container with a lid and put it in the bin, or use it once more for frying. Never pour it down the sink.',
        'După masă, lasă uleiul până se răcește complet, ceea ce durează câteva ore. Apoi strecoară-l într-un recipient cu capac și pune-l la gunoi sau folosește-l încă o dată la prăjit. Nu-l turna niciodată în chiuvetă.',
      ),
    },
  ],
  tips: [
    t(
      'Wet courgette is the usual reason for a soggy result: take the water out first, by salting, drying or squeezing, before it meets the pan or the tray.',
      'Dovleceii uzi sunt cauza obișnuită a unui rezultat moale: scoate întâi apa din ei, prin sărare, uscare sau stoarcere, înainte să ajungă în tigaie sau pe tavă.',
    ),
    t(
      'Fry in small batches and let the oil come back to temperature before the next one. Crowding drops the heat and the pieces turn greasy.',
      'Prăjește pe loturi mici și lasă uleiul să revină la temperatură înainte de următorul lot. Dacă înghesui, uleiul se răcește și bucățile ies grase.',
    ),
    t(
      'Pick small, firm courgettes with thin skin: big ones are watery and seedy. If a raw slice tastes markedly bitter, throw the whole courgette away; do not cook it.',
      'Alege dovlecei mici, fermi și cu coaja subțire: cei mari sunt apoși și cu multe semințe. Dacă o felie crudă are un gust pronunțat amar, aruncă tot dovlecelul; nu-l găti.',
    ),
    t(
      'Best eaten the same day. Cool leftovers within 2 hours, keep them in the fridge for up to 2 days and reheat on a rack in a 200 °C oven for 8 to 10 minutes, until hot through and crisp again. The microwave makes them soft.',
      'Sunt cele mai bune în aceeași zi. Răcește resturile în cel mult 2 ore, ține-le la frigider cel mult 2 zile și reîncălzește-le pe un grătar în cuptorul la 200 °C, 8-10 minute, până se încălzesc complet și se întăresc din nou. La microunde se înmoaie.',
    ),
  ],
  stepTips: [
    {
      step: 'salt',
      text: t(
        'Salting draws out water, so the slices fry crisp instead of steaming inside the coating. If you are short of time, 10 minutes still helps.',
        'Sarea scoate apa, așa că feliile se prăjesc crocante și nu se aburesc sub crustă. Dacă ești grăbit, și 10 minute ajută.',
      ),
    },
    {
      step: 'sauce',
      text: t(
        'Keep the sauce covered in the fridge and use it within 2 days. Put it out only for serving, and return what is left to the fridge within 2 hours. For a richer sauce, replace a third of the yogurt with sour cream.',
        'Ține sosul acoperit la frigider și folosește-l în cel mult 2 zile. Scoate-l doar la servit și pune ce rămâne înapoi la frigider în cel mult 2 ore. Pentru un sos mai bogat, înlocuiește o treime din iaurt cu smântână.',
      ),
    },
    { step: 'oil', text: oilFireTip },
    {
      step: 'coat',
      text: t(
        'Use one hand for the dry flour and crumbs and the other for the wet egg, so your fingers do not turn into thick dumplings of coating.',
        'Folosește o mână pentru făina și pesmetul uscate și cealaltă pentru ou, ca degetele să nu se umple de aluat gros.',
      ),
    },
  ],
  nutritionNote: t(
    'Courgettes bring water and a little fibre, and the egg and yogurt add protein and calcium. Frying lets the breadcrumbs soak up oil, which makes it rich in fat; sunflower oil is mostly unsaturated, while the egg adds some saturated fat. Salting the slices and the egg adds salt (and shop breadcrumbs carry some too); the garlic yogurt sauce lightens the plate.',
    'Dovleceii aduc apă și puține fibre, iar oul și iaurtul adaugă proteine și calciu. La prăjit, pesmetul absoarbe ulei, deci preparatul e bogat în grăsimi; uleiul de floarea soarelui e în mare parte nesaturat, iar oul adaugă ceva grăsimi saturate. Sărarea feliilor și a oului adaugă sare (iar pesmetul din magazin conține și el); sosul de iaurt cu usturoi mai ușurează farfuria.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Tomato salad', 'Salată de roșii'),
      reason: t(
        'Its juicy acidity cuts through the fried coating.',
        'Aciditatea ei suculentă taie din greutatea crustei prăjite.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'tomato',
    },
    {
      kind: 'food',
      label: t('Fresh bread', 'Pâine proaspătă'),
      reason: t(
        'Bread mops up the garlic yogurt sauce and turns the courgettes into a fuller meal.',
        'Pâinea șterge sosul de iaurt cu usturoi și face din dovlecei o masă mai săturătoare.',
      ),
      principle: 'complement_flavour',
      ingredient: 'bread',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'The sharp brine refreshes the palate between fried bites.',
        'Zeama acră înviorează gustul între îmbucăturile prăjite.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'drink',
      label: t('Cold beer', 'Bere rece'),
      reason: t(
        'Its bitterness and bubbles cut through the fried coating.',
        'Amăreala și bulele ei taie din greutatea crustei prăjite.',
      ),
      principle: 'bitter_balances_rich',
      ingredient: 'beer',
    },
    {
      kind: 'drink',
      label: t('Dry white wine', 'Vin alb sec'),
      reason: t(
        'Its acidity lifts the oil in the coating.',
        'Aciditatea lui echilibrează gustul uleios al crustei.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'white-wine',
    },
  ],
  eatingMoments: [
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'A vegetable main that needs only a salad and bread beside it.',
        'Un fel principal cu legume, care are nevoie doar de o salată și de pâine alături.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Fried food sits heavy in the stomach during exercise.',
        'Mâncarea prăjită cade greu la stomac în timpul efortului.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'The fried coating is heavy just before bed.',
        'Crusta prăjită e grea chiar înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'dovlecei-pane-italian',
      cuisine: 'italian',
      title: t(
        'Zucchine alla scapece (Neapolitan fried courgettes marinated with mint and vinegar)',
        'Zucchine alla scapece (dovlecei prăjiți și marinați cu mentă și oțet, ca la Napoli)',
      ),
      servings: 4,
      prepMinutes: 130,
      cookMinutes: 35,
      difficulty: 'easy',
      hideBaseTips: [3],
      lines: [
        {
          ingredient: 'zucchini',
          quantity: 3,
          unit: 'pcs',
          note: t(
            'small to medium, about 600 g in all, in 5 mm rounds',
            'mici sau mijlocii, circa 600 g în total, rondele de 5 mm',
          ),
        },
        {
          ingredient: 'olive-oil',
          quantity: 450,
          unit: 'ml',
          note: t(
            'for frying, about 1 cm deep in a 28 cm pan',
            'pentru prăjit, cam 1 cm adâncime într-o tigaie de 28 cm',
          ),
        },
        {
          ingredient: 'salt',
          quantity: 4,
          unit: 'g',
          note: t('sprinkled on after frying', 'presărată după prăjit'),
        },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t(
            'about 2 cloves, sliced thinly',
            'cam 2 căței, tăiați în felii subțiri',
          ),
        },
        {
          ingredient: 'mint',
          quantity: 15,
          unit: 'g',
          note: t('leaves, torn', 'frunze, rupte cu mâna'),
        },
        {
          ingredient: 'wine-vinegar',
          quantity: 50,
          unit: 'ml',
          note: t('white wine vinegar', 'oțet de vin alb'),
        },
      ],
      steps: [
        {
          key: 'slice',
          text: t(
            'Cut the courgettes into rounds 5 mm thick. You should get about 100 rounds.',
            'Taie dovleceii rondele de 5 mm grosime. Ar trebui să obții cam 100 de rondele.',
          ),
        },
        {
          key: 'dry',
          text: t(
            'Spread the rounds in a single layer on clean tea towels, without salting them. Leave them for 1 hour, turning them once, until the cut surfaces feel dry to the touch; on a humid day leave them up to 2 hours.',
            'Întinde rondelele într-un singur strat pe prosoape curate de bucătărie, fără să le sărezi. Lasă-le 1 oră, întorcându-le o dată, până când suprafețele tăiate sunt uscate la atingere; într-o zi umedă lasă-le până la 2 ore.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'herbs',
          text: t(
            'Slice the garlic thinly and tear the mint leaves. Set both aside for layering.',
            'Taie usturoiul felii subțiri și rupe frunzele de mentă. Pune-le deoparte pentru straturi.',
          ),
        },
        {
          key: 'oil',
          text: t(
            'Pour the olive oil into a wide, heavy 28 cm pan, about 1 cm deep and never more than 1.5 cm. Clip a cooking thermometer to the side and heat over medium heat to about 170 to 175 °C, which takes about 5 minutes. Without a thermometer, a round should sizzle steadily when it goes in and start to colour after about 30 seconds. If the oil smokes, turn the heat off and let it cool a little.',
            'Toarnă uleiul de măsline într-o tigaie lată și cu fund gros, de 28 cm, cam 1 cm adâncime și niciodată peste 1,5 cm. Prinde un termometru de bucătărie pe margine și încinge la foc mediu până la 170-175 °C, ceea ce durează cam 5 minute. Fără termometru, o rondelă pusă în ulei trebuie să sfârâie constant și să înceapă să se rumenească după vreo 30 de secunde. Dacă uleiul fumegă, oprește focul și lasă-l să se răcească puțin.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'fry-first',
          text: t(
            'Lay about 20 rounds in the oil, slowly and away from you, in a single layer. Fry for 3 to 4 minutes, turning once, until golden-brown in patches and soft.',
            'Pune în ulei cam 20 de rondele, încet, lăsându-le să alunece în ulei dinspre tine spre partea opusă, într-un singur strat. Prăjește 3-4 minute, întorcându-le o dată, până se rumenesc pe alocuri și se înmoaie.',
          ),
          timerSeconds: 210,
        },
        {
          key: 'drain',
          text: t(
            'Lift the rounds out with a slotted spoon onto a tray lined with kitchen paper and sprinkle them lightly with salt. Taste one: it should be soft right through, with no raw crunch in the middle. If it is not, return the batch to the oil for another minute.',
            'Scoate rondelele cu o lingură cu găuri pe o tavă tapetată cu șervețele de hârtie și presară-le ușor cu sare. Gustă una: trebuie să fie moale pe de-a-ntregul, fără miez crud și crocant. Dacă nu e așa, pune lotul înapoi în ulei încă un minut.',
          ),
        },
        {
          key: 'fry-rest',
          text: t(
            'Fry the remaining rounds in batches the same way, bringing the oil back to the same heat between batches, and drain and salt each one.',
            'Prăjește restul rondelelor pe loturi, la fel, readucând uleiul la aceeași temperatură între loturi, și scurge și sărează fiecare lot.',
          ),
        },
        {
          key: 'heat-off',
          text: t(
            'As soon as the last batch is out, turn the heat off. Leave the pan where it is and keep children away from the hot oil.',
            'Imediat ce ai scos ultimul lot, oprește focul. Lasă tigaia pe loc și ține copiii departe de uleiul fierbinte.',
          ),
        },
        {
          key: 'layer',
          text: t(
            'While the courgettes are still warm, layer them in a shallow dish with the garlic, the mint and a sprinkle of the vinegar between the layers. Finish with the rest of the vinegar and the remaining mint.',
            'Cât dovleceii sunt încă calzi, așază-i în straturi într-un vas larg, cu usturoiul, menta și puțin oțet între straturi. Termină cu restul de oțet și cu menta rămasă.',
          ),
        },
        {
          key: 'marinate',
          text: t(
            'Cover the dish and leave it for 1 hour, until the courgettes have taken up the vinegar and the mint.',
            'Acoperă vasul și lasă-l 1 oră, până când dovleceii se îmbibă cu oțet și mentă.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'serve',
          text: t(
            'Serve at room temperature. Like any cooked dish, it must not stand out for more than 2 hours after frying. Put it in the fridge if you wait longer, and take it out 20 minutes before serving.',
            'Servește la temperatura camerei. Ca orice mâncare gătită, nu are voie să stea afară mai mult de 2 ore după prăjire. Dacă aștepți mai mult, pune-l la frigider și scoate-l cu 20 de minute înainte de servit.',
          ),
        },
        {
          key: 'oil-cool',
          text: t(
            'After the meal, leave the oil until it is completely cold, which takes several hours. Then strain it into a container with a lid and put it in the bin. Never pour it down the sink.',
            'După masă, lasă uleiul până se răcește complet, ceea ce durează câteva ore. Apoi strecoară-l într-un recipient cu capac și pune-l la gunoi. Nu-l turna niciodată în chiuvetă.',
          ),
        },
      ],
      tips: [
        t(
          'Cover the dish and keep it in the fridge for 2 to 3 days; take it out 20 minutes before serving.',
          'Ține vasul acoperit la frigider 2-3 zile; scoate-l cu 20 de minute înainte de servit.',
        ),
      ],
      stepTips: [
        { step: 'oil', text: oilFireTip },
        {
          step: 'dry',
          text: t(
            'Drying instead of salting keeps the rounds from weeping in the pan, so they brown in patches instead of steaming.',
            'Uscarea în loc de sărare face ca rondelele să nu elimine apă în tigaie, așa că se rumenesc pe alocuri și nu se aburesc.',
          ),
        },
      ],
      nutritionNote: t(
        'Vegan and full of courgette, mint and garlic. The fried rounds soak up a lot of olive oil, which is mostly unsaturated fat but still dense in energy, so drain them well. The vinegar and salt make it sharp and salty; it holds no protein to speak of.',
        'Vegan și plin de dovlecei, mentă și usturoi. Rondelele prăjite absorb mult ulei de măsline, în mare parte grăsimi nesaturate, dar tot bogat în energie, așa că scurge-le bine. Oțetul și sarea îl fac acru și sărat; proteine nu are prea multe.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Country bread', 'Pâine de casă'),
          reason: t(
            'Bread soaks up the vinegar and oil left in the dish.',
            'Pâinea absoarbe oțetul și uleiul rămase în vas.',
          ),
          principle: 'complement_flavour',
          ingredient: 'country-bread',
        },
        {
          kind: 'food',
          label: t('Mozzarella', 'Mozzarella'),
          reason: t(
            'Its mild creaminess softens the sharp vinegar and garlic.',
            'Cremozitatea ei blândă domolește oțetul și usturoiul tari.',
          ),
          principle: 'complement_flavour',
          ingredient: 'mozzarella',
        },
        {
          kind: 'drink',
          label: t('Chilled white wine', 'Vin alb răcit'),
          reason: t(
            'Its freshness stands up to the vinegar without clashing.',
            'Prospețimea lui ține piept oțetului fără să se bată cu el.',
          ),
          principle: 'complement_flavour',
          ingredient: 'white-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Served cool or at room temperature, with a fresh sharp taste.',
            'Se servește rece sau la temperatura camerei, cu un gust proaspăt și acrișor.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Easy to make ahead and eat with bread and cheese.',
            'Se poate pregăti dinainte și se mănâncă cu pâine și brânză.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'The oil-soaked courgettes sit heavy in the stomach.',
            'Dovleceii îmbibați în ulei cad greu la stomac.',
          ),
        },
      ],
    },
    {
      slug: 'dovlecei-pane-turkish',
      cuisine: 'turkish',
      title: t(
        'Mücver (Turkish courgette fritters with white cheese and herbs)',
        'Mücver (turtițe turcești de dovlecei cu brânză albă și verdețuri)',
      ),
      servings: 4,
      prepMinutes: 35,
      cookMinutes: 45,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'zucchini',
          quantity: 3,
          unit: 'pcs',
          note: t(
            'small to medium, about 600 g in all, coarsely grated',
            'mici sau mijlocii, circa 600 g în total, rași pe răzătoarea mare',
          ),
        },
        {
          ingredient: 'salt',
          key: 'salt-courgettes',
          quantity: 4,
          unit: 'g',
          note: t('for salting the courgette', 'pentru sărat dovleceii'),
        },
        { ingredient: 'eggs', quantity: 3, unit: 'pcs' },
        { ingredient: 'flour', quantity: 80, unit: 'g' },
        {
          ingredient: 'beyaz-peynir',
          quantity: 150,
          unit: 'g',
          note: t('crumbled', 'mărunțită'),
        },
        {
          ingredient: 'spring-onion',
          quantity: 40,
          unit: 'g',
          note: t('about 4, finely sliced', 'cam 4, tăiate mărunt'),
        },
        {
          ingredient: 'dill',
          quantity: 10,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        {
          ingredient: 'parsley',
          quantity: 15,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        {
          ingredient: 'mint',
          quantity: 8,
          unit: 'g',
          note: t('finely chopped', 'tocată mărunt'),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        { ingredient: 'pul-biber', quantity: 2, unit: 'g' },
        {
          ingredient: 'sunflower-oil',
          quantity: 450,
          unit: 'ml',
          note: t(
            'for frying, about 1 cm deep in a 28 cm pan',
            'pentru prăjit, cam 1 cm adâncime într-o tigaie de 28 cm',
          ),
        },
        { ingredient: 'yogurt', quantity: 250, unit: 'g' },
        {
          ingredient: 'garlic',
          quantity: 10,
          unit: 'g',
          note: t('about 2 cloves, crushed', 'cam 2 căței, striviți'),
        },
        {
          ingredient: 'salt',
          key: 'salt-sauce',
          quantity: 1,
          unit: 'g',
          note: t('for the sauce', 'pentru sos'),
        },
      ],
      steps: [
        {
          key: 'grate',
          text: t(
            'Grate the courgettes on the coarse side of a grater into a bowl and mix in the 4 g of salt.',
            'Rade dovleceii pe partea mare a răzătorii într-un bol și amestecă-i cu cele 4 g de sare.',
          ),
        },
        {
          key: 'rest',
          text: t(
            'Leave the grated courgette for 10 minutes, until a puddle of liquid collects in the bowl.',
            'Lasă dovleceii rași 10 minute, până se adună lichid în bol.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'squeeze',
          text: t(
            'Squeeze the courgette hard in a clean tea towel, a handful at a time, until almost no more water comes out. The courgette must be squeezed dry or the fritters turn to mush in the pan.',
            'Stoarce dovleceii tare într-un prosop curat de bucătărie, câte o mână, până nu mai iese aproape deloc apă. Trebuie să fie stoarși bine, altfel turtițele se destramă în tigaie.',
          ),
        },
        {
          key: 'sauce',
          text: t(
            'Stir the yogurt with the crushed garlic and the 1 g of salt. Cover it and put it in the fridge until serving.',
            'Amestecă iaurtul cu usturoiul strivit și cu gramul de sare. Acoperă sosul și ține-l la frigider până la servire.',
          ),
        },
        {
          key: 'mix',
          text: t(
            'In a large bowl beat the eggs, then stir in the flour, the crumbled cheese, the spring onion, the dill, the parsley, the mint, the pepper and the pul biber. Fold in the squeezed courgette. The mixture should be thick enough to hold on a spoon and makes about 20 fritters.',
            'Într-un castron mare bate ouăle, apoi adaugă făina, brânza mărunțită, ceapa verde, mărarul, pătrunjelul, menta, piperul și pul biber. Încorporează dovleceii storși. Compoziția trebuie să fie destul de groasă ca să stea pe lingură și iese cam 20 de turtițe.',
          ),
        },
        {
          key: 'wash-mix',
          text: t(
            'Wash your hands with soap and hot water, because they touched raw egg. Do the same for the beating fork.',
            'Spală-te pe mâini cu săpun și apă fierbinte, pentru că au atins ou crud. Fă la fel cu furculița de bătut.',
          ),
        },
        {
          key: 'oil',
          text: t(
            'Pour the oil into a wide, heavy 28 cm pan, about 1 cm deep and never more than 1.5 cm. Clip a cooking thermometer to the side and heat over medium heat to about 165 to 170 °C, which takes about 5 minutes. Without a thermometer, a small drop of the mixture should sizzle steadily at once and turn golden in about a minute. If the oil smokes, turn the heat off and let it cool a little.',
            'Toarnă uleiul într-o tigaie lată și cu fund gros, de 28 cm, cam 1 cm adâncime și niciodată peste 1,5 cm. Prinde un termometru de bucătărie pe margine și încinge la foc mediu până la 165-170 °C, ceea ce durează cam 5 minute. Fără termometru, o picătură mică din compoziție trebuie să sfârâie constant imediat și să se rumenească în cam un minut. Dacă uleiul fumegă, oprește focul și lasă-l să se răcească puțin.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'fry-first',
          text: t(
            'Spoon in about 5 heaped tablespoons of the mixture, slowly and away from you, and flatten each into a round about 1.5 cm thick. Fry for 3 to 4 minutes, until the underside is golden.',
            'Pune în ulei cam 5 linguri pline de compoziție, încet, lăsând compoziția să alunece în ulei dinspre tine, și turtește fiecare într-o formă rotundă de vreo 1,5 cm grosime. Prăjește 3-4 minute, până când partea de jos se rumenește.',
          ),
          timerSeconds: 210,
        },
        {
          key: 'turn-first',
          text: t(
            'Turn the fritters with a fish slice and fry the other side for 3 to 4 minutes, until golden as well.',
            'Întoarce turtițele cu o spatulă și prăjește cealaltă parte 3-4 minute, până se rumenește și ea.',
          ),
          timerSeconds: 210,
        },
        {
          key: 'check',
          text: t(
            'Lift one fritter onto a wire rack set over a tray and cut it open. The centre must be hot, set and firm, with no wet or glossy egg or soft paste in the middle. If it is raw, leave the rest of the batch in the oil for a minute or two longer, lower the heat a little, and throw the cut fritter away without putting it back in the oil. If it was done, eat it. Then move the whole batch to the rack.',
            'Scoate o turtiță pe un grătar așezat deasupra unei tăvi și taie-o în două. Mijlocul trebuie să fie fierbinte, închegat și ferm, fără ou umed sau lucios ori pastă moale la mijloc. Dacă e crudă, lasă restul lotului în ulei încă un minut sau două, scade puțin focul și aruncă turtița tăiată, fără să o mai pui în ulei. Dacă era gătită, mănânc-o. Apoi mută tot lotul pe grătar.',
          ),
        },
        {
          key: 'fry-rest',
          text: t(
            'Bring the oil back to the same heat and fry the rest of the mixture in batches the same way, to the same cues. Cut one fritter of each batch open to check the centre. When the last batch is in the pan, wash your hands and the spoons.',
            'Adu uleiul înapoi la aceeași temperatură și prăjește restul compoziției pe loturi, la fel, după aceleași semne. Taie câte o turtiță din fiecare lot ca să verifici mijlocul. Când ultimul lot e în tigaie, spală-te pe mâini și spală lingurile.',
          ),
        },
        {
          key: 'heat-off',
          text: t(
            'As soon as the last batch is out, turn the heat off. Leave the pan where it is, with the lid beside it, and keep children away from the hot oil.',
            'Imediat ce ai scos ultimul lot, oprește focul. Lasă tigaia pe loc, cu capacul alături, și ține copiii departe de uleiul fierbinte.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Serve the fritters hot, with the cold garlic yogurt sauce.',
            'Servește turtițele fierbinți, cu sosul rece de iaurt și usturoi.',
          ),
        },
        {
          key: 'oil-cool',
          text: t(
            'After the meal, leave the oil until it is completely cold, which takes several hours. Then strain it into a container with a lid and put it in the bin. Never pour it down the sink.',
            'După masă, lasă uleiul până se răcește complet, ceea ce durează câteva ore. Apoi strecoară-l într-un recipient cu capac și pune-l la gunoi. Nu-l turna niciodată în chiuvetă.',
          ),
        },
      ],
      stepTips: [
        { step: 'oil', text: oilFireTip },
        {
          step: 'squeeze',
          text: t(
            'A potato ricer or a tied-up cloth twisted over the sink gets the last water out better than your hands.',
            'O presă de cartofi sau o cârpă legată și răsucită deasupra chiuvetei scoate ultima apă mai bine decât mâinile.',
          ),
        },
        {
          step: 'sauce',
          text: t(
            'Keep the sauce covered in the fridge and use it within 2 days. Put it out only for serving, and return what is left to the fridge within 2 hours.',
            'Ține sosul acoperit la frigider și folosește-l în cel mult 2 zile. Scoate-l doar la servit și pune ce rămâne înapoi la frigider în cel mult 2 ore.',
          ),
        },
      ],
      nutritionNote: t(
        'Eggs and white cheese bring protein and calcium, and courgette with the herbs adds a little fibre. The cheese is salty, so no extra salt goes into the mixture, and frying the fritters in oil makes them rich; the eggs and cheese add some saturated fat. Draining them on a rack keeps the oil down.',
        'Ouăle și brânza albă aduc proteine și calciu, iar dovleceii cu verdețurile adaugă puține fibre. Brânza e sărată, așa că în compoziție nu se mai pune sare în plus, iar prăjitul în ulei le face bogate; ouăle și brânza adaugă ceva grăsimi saturate. Scurse pe grătar, rețin mai puțin ulei.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Tomato salad', 'Salată de roșii'),
          reason: t(
            'Juicy tomatoes freshen the salty, fried fritters.',
            'Roșiile suculente înviorează turtițele sărate și prăjite.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'tomato',
        },
        {
          kind: 'food',
          label: t('Cucumber', 'Castravete'),
          reason: t(
            'Cool, crisp slices contrast with the hot soft centre.',
            'Feliile reci și crocante fac contrast cu mijlocul moale și fierbinte.',
          ),
          principle: 'contrast_texture',
          ingredient: 'cucumber',
        },
        {
          kind: 'drink',
          label: t('Black tea', 'Ceai negru'),
          reason: t(
            'The slight bitterness of tea cleanses the palate after fried food.',
            'Ușoara amăreală a ceaiului curăță gustul după mâncarea prăjită.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'tea',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Protein from egg and cheese in a light, vegetable-led meal.',
            'Proteine din ou și brânză într-o masă ușoară, cu legume.',
          ),
        },
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'Fritters with yogurt suit a relaxed late breakfast.',
            'Turtițele cu iaurt se potrivesc la un mic dejun târziu și relaxat.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Fried food sits heavy in the stomach during exercise.',
            'Mâncarea prăjită cade greu la stomac în timpul efortului.',
          ),
        },
      ],
    },
    {
      slug: 'dovlecei-pane-oven-baked',
      method: 'oven-baked',
      title: t('Oven-baked breaded courgettes', 'Dovlecei pane la cuptor'),
      servings: 4,
      prepMinutes: 30,
      cookMinutes: 40,
      difficulty: 'easy',
      hideBaseTips: [1],
      lines: [
        {
          ingredient: 'zucchini',
          quantity: 3,
          unit: 'pcs',
          note: t(
            'small to medium, about 600 g in all',
            'mici sau mijlocii, circa 600 g în total',
          ),
        },
        {
          ingredient: 'salt',
          key: 'salt-courgettes',
          quantity: 5,
          unit: 'g',
          note: t('for salting the slices', 'pentru sărat feliile'),
        },
        { ingredient: 'flour', quantity: 70, unit: 'g' },
        { ingredient: 'eggs', quantity: 3, unit: 'pcs' },
        {
          ingredient: 'salt',
          key: 'salt-egg',
          quantity: 1,
          unit: 'g',
          note: t('for the beaten egg', 'pentru ouăle bătute'),
        },
        { ingredient: 'breadcrumbs', quantity: 150, unit: 'g' },
        {
          ingredient: 'sunflower-oil',
          key: 'oil-crumbs',
          quantity: 30,
          unit: 'ml',
          note: t('stirred into the breadcrumbs', 'amestecat în pesmet'),
        },
        {
          ingredient: 'sunflower-oil',
          key: 'oil-trays',
          quantity: 15,
          unit: 'ml',
          note: t('for brushing the baking paper', 'pentru uns hârtia de copt'),
        },
        { ingredient: 'yogurt', quantity: 300, unit: 'g' },
        {
          ingredient: 'garlic',
          quantity: 16,
          unit: 'g',
          note: t('about 4 cloves, crushed', 'cam 4 căței, striviți'),
        },
        {
          ingredient: 'dill',
          quantity: 10,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        {
          ingredient: 'salt',
          key: 'salt-sauce',
          quantity: 1,
          unit: 'g',
          note: t('for the sauce', 'pentru sos'),
        },
      ],
      steps: [
        {
          key: 'slice',
          text: t(
            'Cut each courgette in half across, then lengthwise into slices 7 to 8 mm thick. You should get about 36 slices.',
            'Taie fiecare dovlecel în două, pe lățime, apoi pe lungime în felii de 7-8 mm grosime. Ar trebui să obții cam 36 de felii.',
          ),
        },
        {
          key: 'salt',
          text: t(
            'Spread the slices in a colander or on a tray and sprinkle the 5 g of salt over both sides. Leave them for 20 minutes, until beads of water show on the surface.',
            'Întinde feliile într-un strecurător sau pe o tavă și presară cele 5 g de sare pe ambele părți. Lasă-le 20 de minute, până apar picături de apă la suprafață.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'sauce',
          text: t(
            'While the courgettes stand, stir the yogurt with the crushed garlic, the dill and the 1 g of salt. Cover it and put it in the fridge until serving.',
            'Cât stau dovleceii, amestecă iaurtul cu usturoiul strivit, mărarul și gramul de sare. Acoperă sosul și ține-l la frigider până la servire.',
          ),
        },
        {
          key: 'dry',
          text: t(
            'Pat every slice dry on both sides with a clean tea towel or kitchen paper. Do not rinse them.',
            'Șterge fiecare felie pe ambele părți cu un prosop curat de bucătărie sau cu șervețele de hârtie. Nu le clăti.',
          ),
        },
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 220 °C (200 °C fan). It needs about 15 minutes to get fully hot; coat the slices while it heats.',
            'Încinge cuptorul la 220 °C (200 °C cu ventilator). Are nevoie de vreo 15 minute ca să se încălzească complet; panează feliile cât se încălzește.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'trays',
          text: t(
            'Line two baking trays with baking paper and brush the paper with the 15 ml of oil. Stir the other 30 ml of oil into the breadcrumbs until they look like damp sand.',
            'Tapetează două tăvi cu hârtie de copt și unge hârtia cu cei 15 ml de ulei. Amestecă ceilalți 30 ml de ulei cu pesmetul, până seamănă cu nisipul umed.',
          ),
        },
        {
          key: 'stations',
          text: t(
            'Put the flour on one plate and the oiled breadcrumbs on another. Beat the eggs with the 1 g of salt in a shallow bowl.',
            'Pune făina pe o farfurie și pesmetul cu ulei pe alta. Bate ouăle cu gramul de sare într-un castron lat.',
          ),
        },
        {
          key: 'coat',
          text: t(
            'Dip each slice in the flour and shake off the excess, then in the egg and let it drip, then press it into the breadcrumbs on both sides. Lay the slices in a single layer on the trays.',
            'Treci fiecare felie prin făină și scutur-o de surplus, apoi prin ou și lasă-o să se scurgă, apoi apas-o în pesmet pe ambele părți. Așază feliile într-un singur strat pe tăvi.',
          ),
        },
        {
          key: 'wash',
          text: t(
            'Wash your hands, the plates, the bowl and the fork with soap and hot water, because they touched raw egg. Throw away any leftover egg.',
            'Spală-te pe mâini, farfuriile, castronul și furculița cu săpun și apă fierbinte, pentru că au atins ou crud. Aruncă oul rămas.',
          ),
        },
        {
          key: 'bake-first',
          text: t(
            'Put the trays on two oven shelves and bake for 12 minutes, until the underside is golden and the crumbs feel crisp.',
            'Pune tăvile pe două rafturi ale cuptorului și coace 12 minute, până când partea de jos se rumenește și pesmetul e crocant.',
          ),
          timerSeconds: 720,
        },
        {
          key: 'turn',
          text: t(
            'Turn the slices over with a fish slice, swap the trays between the shelves and bake for 11 minutes more, until deep golden all over.',
            'Întoarce feliile cu o spatulă, schimbă tăvile între rafturi și coace încă 11 minute, până se rumenesc intens pe toate părțile.',
          ),
          timerSeconds: 660,
        },
        {
          key: 'check',
          text: t(
            'Cut one slice open. The coating must be crisp and golden, the egg set with no wet or glossy patches, and the courgette tender when a knife slides in. If it is not, bake the trays for 3 to 5 minutes more.',
            'Taie o felie în două. Crusta trebuie să fie crocantă și aurie, oul închegat, fără zone umede sau lucioase, iar dovlecelul e fraged când intră cuțitul. Dacă nu e așa, mai coace tăvile 3-5 minute.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Serve the courgettes hot, straight from the trays, with the cold garlic yogurt sauce.',
            'Servește dovleceii fierbinți, direct de pe tăvi, cu sosul rece de iaurt și usturoi.',
          ),
        },
      ],
      tips: [
        t(
          'Turn the slices once and otherwise leave them alone: opening the oven often drops the heat and softens the crust.',
          'Întoarce feliile o singură dată și în rest las-le în pace: deschiderea deasă a cuptorului scade temperatura și înmoaie crusta.',
        ),
      ],
      stepTips: [
        {
          step: 'trays',
          text: t(
            'Oil in the breadcrumbs is what turns them golden in the oven; without it they stay pale and dusty.',
            'Uleiul din pesmet îl face să se rumenească în cuptor; fără el rămâne palid și prăfos.',
          ),
        },
        {
          step: 'sauce',
          text: t(
            'Keep the sauce covered in the fridge and use it within 2 days. Put it out only for serving, and return what is left to the fridge within 2 hours.',
            'Ține sosul acoperit la frigider și folosește-l în cel mult 2 zile. Scoate-l doar la servit și pune ce rămâne înapoi la frigider în cel mult 2 ore.',
          ),
        },
      ],
      nutritionNote: t(
        'Baking uses far less oil than frying, so the plate is lighter, though the crumbs and flour still bring plenty of starch. The egg and yogurt add protein and calcium, the courgette a little fibre. Sunflower oil is mostly unsaturated; the salted slices, crumbs and sauce add salt.',
        'Coacerea folosește mult mai puțin ulei decât prăjitul, deci farfuria e mai ușoară, deși pesmetul și făina aduc totuși destul amidon. Oul și iaurtul adaugă proteine și calciu, iar dovleceii puține fibre. Uleiul de floarea soarelui e în mare parte nesaturat; feliile sărate, pesmetul și sosul adaugă sare.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Tomato salad', 'Salată de roșii'),
          reason: t(
            'Its juicy acidity brightens the crumb coating.',
            'Aciditatea ei suculentă înviorează crusta de pesmet.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'tomato',
        },
        {
          kind: 'food',
          label: t('Fresh bread', 'Pâine proaspătă'),
          reason: t(
            'Bread mops up the garlic yogurt sauce.',
            'Pâinea șterge sosul de iaurt cu usturoi.',
          ),
          principle: 'complement_flavour',
          ingredient: 'bread',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'A vegetable-led main with much less oil than the fried version.',
            'Un fel principal cu legume, cu mult mai puțin ulei decât varianta prăjită.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'The crumb coating is still heavy just before bed.',
            'Crusta de pesmet cade totuși greu chiar înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
