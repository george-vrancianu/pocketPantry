import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Salată de ardei copți base is the Romanian roasted pepper salad: whole
// fleshy peppers blackened over a flame, steamed under a lid, peeled and
// dressed with oil, vinegar and garlic. Each Variant is a full Recipe with its
// own lines, steps and guidance; the base's Recipe-level Tips are inherited.
export const salataDeArdeiCopti: BaseRecipeSeed = {
  slug: 'salata-de-ardei-copti',
  title: t(
    'Romanian roasted pepper salad (salată de ardei copți)',
    'Salată de ardei copți',
  ),
  servings: 4,
  prepMinutes: 45,
  cookMinutes: 50,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'bell-pepper',
      quantity: 4,
      unit: 'pcs',
      note: t(
        'large, fleshy, about 250 g each',
        'mari, cărnoși, de câte 250 g fiecare',
      ),
    },
    { ingredient: 'sunflower-oil', quantity: 80, unit: 'ml' },
    { ingredient: 'vinegar', quantity: 30, unit: 'ml' },
    {
      ingredient: 'garlic',
      quantity: 12,
      unit: 'g',
      note: t('about 3 cloves, crushed', 'aproximativ 3 căței, zdrobiți'),
    },
    { ingredient: 'salt', quantity: 5, unit: 'g' },
    {
      ingredient: 'sugar',
      quantity: 3,
      unit: 'g',
      optional: true,
      note: t('half a teaspoon', 'o jumătate de linguriță'),
    },
    {
      ingredient: 'parsley',
      quantity: 10,
      unit: 'g',
      optional: true,
      note: t('finely chopped', 'tocat mărunt'),
    },
  ],
  steps: [
    {
      key: 'prepare',
      text: t(
        'Wash the peppers and dry them well. Leave them whole, with the stems on: the stem is your handle when you turn them.',
        'Spală ardeii și șterge-i bine. Lasă-i întregi, cu cotorul, de care îi prinzi când îi întorci.',
      ),
    },
    {
      key: 'roast',
      text: t(
        'Set two peppers straight on the grate over a medium-high gas flame. Turn them with tongs every 2 to 3 minutes for about 12 minutes, until the skin is blistered and black all over and the flesh has softened and begun to collapse. Stay by the hob and open a window.',
        'Pune doi ardei direct pe grătarul aragazului, la flacără medie-mare. Întoarce-i cu cleștele la 2-3 minute, timp de aproximativ 12 minute, până când coaja e umflată și neagră peste tot, iar carnea s-a înmuiat și începe să se lase. Rămâi lângă aragaz și deschide fereastra.',
      ),
      timerSeconds: 720,
    },
    {
      key: 'roast-second',
      text: t(
        'Drop the first two peppers into a pot, put the lid on, and roast the other two the same way, for about 12 minutes.',
        'Pune primii doi ardei într-o oală și acoper-o cu capacul, apoi coace ceilalți doi la fel, aproximativ 12 minute.',
      ),
      timerSeconds: 720,
    },
    {
      key: 'steam',
      text: t(
        'Add the second pair to the pot, close the lid and leave the peppers to steam for 15 minutes, until they are cool enough to handle and the skins have loosened.',
        'Pune și al doilea rând de ardei în oală, închide capacul și lasă ardeii acoperiți 15 minute să se înăbușe, până se răcesc suficient cât să-i poți ține în mână, iar coaja se desprinde.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'peel',
      text: t(
        'Peel off the skins with your fingers, working from the stem end, and do not rinse the peppers (see the Tip). Pull out the stems, seeds and white ribs, and pour any juice in the pot through a sieve into a bowl to keep it.',
        'Curăță ardeii de coajă cu degetele, începând de la cotor, și nu spăla ardeii (vezi sfatul). Scoate cotoarele, semințele și pereții albi, iar zeama din oală strecoar-o într-un bol și păstreaz-o.',
      ),
    },
    {
      key: 'cut',
      text: t(
        'Tear the peppers lengthwise into wide strips, or leave them in halves, and lay them in a shallow dish.',
        'Rupe ardeii pe lung în fâșii late sau lasă-i jumătăți și așază-i într-un vas lat.',
      ),
    },
    {
      key: 'dressing',
      text: t(
        'Crush the garlic with the salt to a paste. Stir it with the sunflower oil, vinegar, sugar (if using) and 3 tablespoons of the saved pepper juice.',
        'Zdrobește usturoiul cu sarea până devine pastă. Amestec-o cu uleiul de floarea soarelui, oțetul, zahărul (dacă folosești) și 3 linguri din zeama ardeilor.',
      ),
    },
    {
      key: 'dress',
      text: t(
        'Pour the dressing over the peppers, add the parsley and turn the strips gently so each one is coated. The peppers should sit in a little dressing.',
        'Toarnă sosul peste ardei, adaugă pătrunjelul și întoarce ușor fâșiile, ca fiecare să se îmbibe. Ardeii trebuie să stea într-un pic de sos.',
      ),
    },
    {
      key: 'rest',
      text: t(
        'Cover the dish and refrigerate it for 30 minutes so the dressing soaks in. Take it out 15 minutes before serving.',
        'Acoperă vasul și pune-l la frigider 30 de minute, ca ardeii să se îmbibe. Scoate-l cu 15 minute înainte de servire.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'store',
      text: t(
        'Put leftovers back in the fridge, covered, within 2 hours of serving. They keep for 3 to 4 days.',
        'Ce rămâne pune înapoi la frigider, acoperit, în cel mult 2 ore de la servire. Se păstrează 3-4 zile.',
      ),
    },
  ],
  tips: [
    t(
      'Over a flame or under the grill, let the skin go properly black all over. Pale patches stay stuck to the flesh and are a nuisance to peel, and the char is where the smoky flavour comes from.',
      'Pe flacără sau la grill, lasă coaja să se înnegrească bine peste tot. Zonele palide rămân lipite de carne și se curăță greu, iar gustul de afumat vine tocmai din coaja arsă.',
    ),
    t(
      'Do not rinse the peeled peppers under the tap. It washes away the smoky juice you went to the trouble of making; wipe off bits of skin with your fingers instead.',
      'Nu clăti ardeii curățați sub jet de apă. Se duce zeama afumată pentru care te-ai chinuit; curăță bucățelele de coajă cu degetele.',
    ),
    t(
      'Garlic in oil is not safe at room temperature for long, because it can grow the bacteria that cause botulism. Keep the dish covered in the fridge, take out only what you will eat, and keep it out of the fridge for no more than 2 hours.',
      'Usturoiul în ulei nu se ține mult la temperatura camerei, pentru că pot să se dezvolte bacteriile care provoacă botulism. Păstrează vasul acoperit la frigider, scoate doar cât mănânci și nu-l ține mai mult de 2 ore în afara frigiderului.',
    ),
    t(
      'Kapia peppers work just as well. They are sweeter, narrower and thinner-skinned, so they roast faster: start checking them after about 8 minutes on the flame.',
      'Merg la fel de bine și ardeii kapia. Sunt mai dulci, mai înguste și cu coaja mai subțire, deci se coc mai repede: începe să-i verifici după aproximativ 8 minute pe flacără.',
    ),
  ],
  stepTips: [
    {
      step: 'roast',
      text: t(
        'No gas hob? Under a grill: heat it on full for 10 minutes, set the peppers about 8 cm below it and turn them every 5 minutes for 15 to 20 minutes, until blackened all over. In the oven: heat it to 230 °C (fan 210 °C) for 15 minutes, then roast the peppers whole on a lined tray for 25 to 30 minutes, turning them halfway, until blackened in patches and collapsed. Both methods take all four peppers at once.',
        'Nu ai aragaz? La grill: încinge-l 10 minute la maximum, pune ardeii la aproximativ 8 cm sub el și întoarce-i la 5 minute, timp de 15-20 de minute, până se înnegresc peste tot. La cuptor: încălzește-l la 230 °C (la ventilator 210 °C) timp de 15 minute, apoi coace ardeii întregi pe o tavă tapetată 25-30 de minute, întorcându-i la jumătate, până când sunt înnegriți pe alocuri și s-au lăsat. Prin ambele metode se coc toți cei patru ardei odată.',
      ),
    },
    {
      step: 'steam',
      text: t(
        'Steam is what loosens the skin, so keep the lid tight. A bowl covered with a plate works as well as a pot.',
        'Aburul este cel care desprinde coaja, așa că ține capacul bine închis. Un bol acoperit cu o farfurie merge la fel de bine ca o oală.',
      ),
    },
    {
      step: 'dressing',
      text: t(
        'Raw garlic is sharp on the first day and mellows by the next. Use two cloves if you want it gentler.',
        'Usturoiul crud e iute în prima zi și se domolește a doua zi. Pune doi căței dacă vrei să iasă mai blând.',
      ),
    },
  ],
  nutritionNote: t(
    'Peppers bring fibre and vitamin C, though roasting takes some of the vitamin C. The sunflower oil is where most of the calories come from, but it is mostly unsaturated fat. Salt adds up when you eat it with telemea and bread, so season the peppers lightly.',
    'Ardeii aduc fibre și vitamina C, deși o parte din vitamina C se pierde la coacere. Uleiul de floarea soarelui este sursa principală de calorii, dar conține în mare parte grăsimi nesaturate. Sarea se adună când mănânci salata cu telemea și pâine, așa că sărează ardeii cu măsură.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Country bread', 'Pâine de casă'),
      reason: t(
        'A thick slice with a good crust soaks up the garlicky dressing.',
        'O felie groasă cu coaja bună îmbibă sosul cu usturoi.',
      ),
      principle: 'contrast_texture',
      ingredient: 'country-bread',
    },
    {
      kind: 'food',
      label: t('Telemea', 'Telemea'),
      reason: t(
        'The salty, tangy brined cheese sets off the sweet, smoky peppers.',
        'Brânza sărată și ușor acrișoară, din saramură, scoate în evidență dulceața afumată a ardeilor.',
      ),
      principle: 'complement_flavour',
      ingredient: 'telemea',
    },
    {
      kind: 'food',
      label: t('Mici (Romanian grilled skinless sausages)', 'Mici'),
      reason: t(
        'The sour, garlicky peppers cut through the fat of grilled mici at a summer barbecue.',
        'Ardeii acri și cu usturoi taie din grăsimea micilor la un grătar de vară.',
      ),
      principle: 'acid_cuts_fat',
      recipe: 'mici',
    },
    {
      kind: 'drink',
      label: t('Beer', 'Bere'),
      reason: t(
        'Cold, light beer refreshes the palate between vinegary bites.',
        'Berea rece și ușoară împrospătează gustul între îmbucăturile acrișoare.',
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
        'With bread and telemea it makes a filling meal with nothing left to cook.',
        'Cu pâine și telemea face o masă săturătoare, fără altă gătire.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'good_for',
      reason: t(
        'It is eaten cool and can be made the day before.',
        'Se mănâncă rece și se poate face din ajun.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Raw garlic and vinegar can cause heartburn before bed.',
        'Usturoiul crud și oțetul pot provoca arsuri la stomac înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'salata-de-ardei-copti-middle-eastern',
      cuisine: 'middle-eastern',
      title: t(
        'Muhammara (roasted red pepper and walnut dip)',
        'Muhammara (pastă de ardei roșii copți cu nuci)',
      ),
      servings: 6,
      prepMinutes: 15,
      cookMinutes: 62,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'bell-pepper',
          quantity: 4,
          unit: 'pcs',
          note: t(
            'red, large, about 250 g each',
            'roșii, mari, de câte 250 g fiecare',
          ),
        },
        {
          ingredient: 'walnuts',
          quantity: 100,
          unit: 'g',
          note: t(
            'keep 4 halves for the top',
            'păstrează 4 jumătăți pentru decor',
          ),
        },
        { ingredient: 'breadcrumbs', quantity: 40, unit: 'g' },
        { ingredient: 'pomegranate-molasses', quantity: 30, unit: 'ml' },
        {
          ingredient: 'pul-biber',
          quantity: 4,
          unit: 'g',
          note: t('Aleppo pepper', 'ardei Aleppo'),
        },
        { ingredient: 'cumin', quantity: 3, unit: 'g' },
        {
          ingredient: 'garlic',
          quantity: 8,
          unit: 'g',
          note: t('about 2 cloves', 'aproximativ 2 căței'),
        },
        {
          ingredient: 'lemon',
          quantity: 0.5,
          unit: 'pcs',
          note: t('juiced', 'doar sucul'),
        },
        {
          ingredient: 'olive-oil',
          key: 'olive-oil-dip',
          quantity: 60,
          unit: 'ml',
        },
        {
          ingredient: 'olive-oil',
          key: 'olive-oil-top',
          quantity: 15,
          unit: 'ml',
          note: t('for the top', 'pentru deasupra'),
        },
        { ingredient: 'salt', quantity: 4, unit: 'g' },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 230 °C (fan 210 °C) for 15 minutes and line a tray with baking paper.',
            'Încălzește cuptorul la 230 °C (la ventilator 210 °C) timp de 15 minute și tapetează o tavă cu hârtie de copt.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'roast',
          text: t(
            'Wash and dry the peppers and lay them whole on the tray. Roast them for about 25 minutes, turning them halfway, until the skin is blackened in patches and the peppers have collapsed. If they are still firm, give them 5 more minutes.',
            'Spală și șterge ardeii și așază-i întregi pe tavă. Coace-i aproximativ 25 de minute, întorcându-i la jumătate, până când coaja e înnegrită pe alocuri, iar ardeii s-au lăsat. Dacă sunt încă tari, mai lasă-i 5 minute.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'steam',
          text: t(
            'Tip the hot peppers into a bowl, cover it with a plate and leave them for 15 minutes, until they are cool enough to handle.',
            'Pune ardeii fierbinți într-un bol, acoper-l cu o farfurie și lasă-i 15 minute, până se răcesc suficient cât să-i poți ține în mână.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'toast',
          text: t(
            'While the peppers steam, toast the walnuts in a dry frying pan over medium heat for about 4 minutes, stirring, until they smell nutty and darken a shade. Tip them onto a plate to cool straight away, because they burn quickly.',
            'Cât timp ardeii se înăbușă, prăjește nucile într-o tigaie uscată, la foc mediu, aproximativ 4 minute, amestecând, până miros a nucă prăjită și se închid puțin la culoare. Pune-le imediat pe o farfurie să se răcească, pentru că se ard repede.',
          ),
          timerSeconds: 240,
        },
        {
          key: 'peel',
          text: t(
            'Peel off the skins, and pull out the stems, seeds and white ribs. Keep the juice in the bowl, and do not rinse the peppers.',
            'Curăță ardeii de coajă și scoate cotoarele, semințele și pereții albi. Păstrează zeama din bol și nu spăla ardeii.',
          ),
        },
        {
          key: 'blend',
          text: t(
            'Put the walnuts (keeping 4 halves back), breadcrumbs and garlic in a food processor and pulse to coarse crumbs. Add the peppers, pomegranate molasses, pul biber, cumin, lemon juice, 60 ml of the olive oil and the salt, and pulse until thick and coarse, not smooth.',
            'Pune nucile (păstrează 4 jumătăți), pesmetul și usturoiul în robotul de bucătărie și mixează în reprize scurte până obții firimituri mari. Adaugă ardeii, melasa de rodie, pul biber, chimionul, sucul de lămâie, 60 ml din uleiul de măsline și sarea și mixează în reprize scurte până obții o pastă groasă, cu textură, nu fină.',
          ),
        },
        {
          key: 'adjust',
          text: t(
            'Taste and add salt, lemon or molasses if it needs them. If it is too stiff to scoop, stir in a spoonful of the saved pepper juice.',
            'Gustă și adaugă sare, lămâie sau melasă dacă e nevoie. Dacă e prea groasă ca să o iei cu lingura, amestecă o lingură din zeama ardeilor păstrată.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Spoon the dip into a shallow bowl, swirl a hollow in the top and pour in the last 15 ml of olive oil. Top with the walnut halves and a pinch of pul biber. Refrigerate what is left, covered, within 2 hours; it keeps for 3 to 4 days.',
            'Pune pasta într-un bol lat, fă o adâncitură în mijloc și toarnă ultimii 15 ml de ulei de măsline. Decorează cu jumătățile de nucă și un vârf de pul biber. Ce rămâne pune la frigider, acoperit, în cel mult 2 ore; se păstrează 3-4 zile.',
          ),
        },
      ],
      tips: [
        t(
          'Muhammara contains walnuts (tree nuts) and breadcrumbs (gluten). Tell anyone with a nut allergy before they dip.',
          'Muhammara conține nuci (fructe cu coajă lemnoasă) și pesmet (gluten). Spune-le celor alergici la nuci înainte să guste.',
        ),
        t(
          'Pulse, do not run the processor: a smooth paste turns pasty and oily as the walnuts release their oil.',
          'Mixează în reprize scurte, nu lăsa robotul să meargă continuu: o pastă prea fină devine păstoasă și unsuroasă, pentru că nucile își eliberează uleiul.',
        ),
      ],
      hideBaseTips: [3],
      stepTips: [
        {
          step: 'toast',
          text: t(
            'Taste one: if it tastes burnt, start again. Burnt walnuts spoil the whole dip.',
            'Gustă o nucă: dacă are gust de ars, ia-o de la capăt. Nucile arse strică toată pasta.',
          ),
        },
      ],
      nutritionNote: t(
        'Walnuts and olive oil make it rich in mostly unsaturated fat and calories, so a spoonful goes a long way. The peppers add fibre and vitamin C, and the breadcrumbs and molasses add a little starch and sugar. It contains nuts, so it is not for anyone with a nut allergy.',
        'Nucile și uleiul de măsline îl fac bogat în grăsimi, în mare parte nesaturate, și în calorii, așa că ajunge o lingură. Ardeii aduc fibre și vitamina C, iar pesmetul și melasa adaugă puțin amidon și zahăr. Conține nuci, deci nu este potrivit pentru cei alergici la nuci.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Pita bread', 'Lipie'),
          reason: t(
            'Warm pita scoops up the thick dip.',
            'Lipia caldă ia cu ea pasta groasă.',
          ),
          principle: 'contrast_texture',
          ingredient: 'pita',
        },
        {
          kind: 'food',
          label: t(
            'Hummus (chickpea and tahini dip)',
            'Humus (pastă de năut cu tahini)',
          ),
          reason: t(
            'Two dips side by side on a mezze table: creamy and mild next to sweet-sour and nutty.',
            'Două paste pe aceeași masă de mezze: una cremoasă și blândă, alta dulce-acrișoară și cu gust de nucă.',
          ),
          principle: 'regional_tradition',
          recipe: 'hummus',
        },
        {
          kind: 'food',
          label: t('Cucumber', 'Castravete'),
          reason: t(
            'Cool, crisp slices refresh the palate between rich bites.',
            'Feliile reci și crocante împrospătează gustul între îmbucături bogate.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'cucumber',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'With pita and raw vegetables it makes a quick meal.',
            'Cu lipie și legume crude face o masă rapidă.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Rich in oil and nuts, it can sit heavy before bed.',
            'Fiind bogat în ulei și nuci, poate cădea greu înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'salata-de-ardei-copti-tunisian',
      cuisine: 'tunisian',
      title: t(
        'Slata mechouia (Tunisian grilled pepper and tomato salad with tuna and egg)',
        'Slata mechouia (salată tunisiană de ardei și roșii coapte, cu ton și ou)',
      ),
      servings: 4,
      prepMinutes: 15,
      cookMinutes: 60,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'baklouti-pepper',
          quantity: 6,
          unit: 'pcs',
          note: t('long green peppers', 'ardei verzi lungi'),
        },
        {
          ingredient: 'hot-pepper',
          quantity: 1,
          unit: 'pcs',
          note: t('green or red', 'verde sau roșu'),
        },
        { ingredient: 'tomato', quantity: 400, unit: 'g' },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('cut into 4 wedges', 'tăiată în sferturi'),
        },
        {
          ingredient: 'garlic',
          quantity: 12,
          unit: 'g',
          note: t('about 3 cloves, unpeeled', 'aproximativ 3 căței, cu coajă'),
        },
        { ingredient: 'caraway-seeds', quantity: 2, unit: 'g' },
        { ingredient: 'coriander-seeds', quantity: 3, unit: 'g' },
        { ingredient: 'salt', quantity: 5, unit: 'g' },
        {
          ingredient: 'lemon',
          quantity: 0.5,
          unit: 'pcs',
          note: t('juiced', 'doar sucul'),
        },
        {
          ingredient: 'olive-oil',
          key: 'olive-oil-salad',
          quantity: 45,
          unit: 'ml',
        },
        {
          ingredient: 'olive-oil',
          key: 'olive-oil-top',
          quantity: 15,
          unit: 'ml',
          note: t('for drizzling', 'pentru stropit deasupra'),
        },
        {
          ingredient: 'canned-tuna',
          quantity: 160,
          unit: 'g',
          note: t('in oil, drained', 'în ulei, scurs'),
        },
        { ingredient: 'eggs', quantity: 4, unit: 'pcs' },
        {
          ingredient: 'olives',
          quantity: 40,
          unit: 'g',
          optional: true,
        },
        {
          ingredient: 'capers',
          quantity: 15,
          unit: 'g',
          optional: true,
        },
      ],
      steps: [
        {
          key: 'preheat',
          text: t(
            'Heat the oven to 230 °C (fan 210 °C) for 15 minutes.',
            'Încălzește cuptorul la 230 °C (la ventilator 210 °C) timp de 15 minute.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'tray',
          text: t(
            'Wash and dry the peppers, hot pepper and tomatoes. Put them whole on a tray lined with baking paper, with the onion wedges and the unpeeled garlic cloves wrapped in a small foil parcel.',
            'Spală și șterge ardeii, ardeiul iute și roșiile. Așază-le întregi pe o tavă tapetată cu hârtie de copt, împreună cu sferturile de ceapă și cu cățeii de usturoi nedecojiți, înveliți într-un pachețel de folie.',
          ),
        },
        {
          key: 'roast',
          text: t(
            'Roast for about 25 minutes, turning once halfway, until the pepper skins are blackened in patches, the tomato skins have split and blistered, and the onion is soft with charred edges.',
            'Coace aproximativ 25 de minute, întorcând o dată la jumătate, până când coaja ardeilor e înnegrită pe alocuri, coaja roșiilor a crăpat și s-a umflat, iar ceapa e moale, cu marginile arse.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'steam',
          text: t(
            'Tip the peppers and the hot pepper into a bowl, cover it with a plate and leave them for 15 minutes, until they are cool enough to handle.',
            'Pune ardeii și ardeiul iute într-un bol, acoper-l cu o farfurie și lasă-i 15 minute, până se răcesc suficient cât să-i poți ține în mână.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'eggs',
          text: t(
            'While the peppers steam, lower the eggs into a pan of boiling water and boil them for 10 minutes, until the yolks are completely set. Drain, cool them under cold water, then peel.',
            'În timp ce ardeii se aburesc, pune ouăle într-o oală cu apă clocotită și fierbe-le 10 minute, până când gălbenușul se întărește complet. Scurge-le, răcește-le sub jet de apă rece, apoi curăță-le.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'peel',
          text: t(
            'Peel the peppers and tomatoes and squeeze the garlic from its skins. Remove the stems and seeds from the peppers (keep a few seeds of the hot pepper if you like it hot), and discard the tomato cores.',
            'Curăță ardeii și roșiile de coajă și scoate usturoiul din coji. Scoate cotoarele și semințele ardeilor (păstrează câteva semințe din ardeiul iute dacă îți place iute) și aruncă cotoarele roșiilor.',
          ),
        },
        {
          key: 'spices',
          text: t(
            'Toast the caraway and coriander seeds in a dry pan over medium heat for about 1 minute, until fragrant, then crush them in a mortar.',
            'Prăjește semințele de chimen și de coriandru într-o tigaie uscată, la foc mediu, aproximativ 1 minut, până miros intens, apoi pisează-le într-un mojar.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'chop',
          text: t(
            'Chop the vegetables finely, or pound them with the garlic in the mortar. Spoon off any very watery juice, and leave the salad lightly chunky, not puréed.',
            'Taie legumele mărunt sau pisează-le în mojar împreună cu usturoiul. Scoate cu lingura zeama prea apoasă și lasă salata puțin grunjoasă, nu pasată.',
          ),
        },
        {
          key: 'season',
          text: t(
            'Stir in the crushed spices, the salt, the lemon juice and 45 ml of the olive oil. Taste and add salt or lemon if it needs them.',
            'Amestecă condimentele pisate, sarea, sucul de lămâie și 45 ml din uleiul de măsline. Gustă și adaugă sare sau lămâie dacă e nevoie.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Spread the salad on a plate and top with the tuna in chunks, the eggs in quarters, and the olives and capers if using. Drizzle with the last 15 ml of olive oil. Refrigerate any left-over salad within 2 hours; it keeps for 3 days. Keep left-over egg and tuna separate and eat them the next day.',
            'Întinde salata pe o farfurie și pune deasupra bucăți de ton, ouăle tăiate în sferturi, iar dacă folosești, măslinele și caperele. Stropește cu ultimii 15 ml de ulei de măsline. Salata rămasă pune-o la frigider în cel mult 2 ore; se păstrează 3 zile. Oul și tonul rămase păstrează-le separat și mănâncă-le a doua zi.',
          ),
        },
      ],
      tips: [
        t(
          'Long, mildly hot green peppers are what this salad calls for, with baklouti the best known. Add the hot pepper to taste.',
          'Salata se face cu ardei verzi lungi, ușor iuți, dintre care baklouti este cel mai cunoscut. Adaugă ardeiul iute după gust.',
        ),
        t(
          'Leave the peeled vegetables in a sieve for a few minutes before chopping, so the salad does not weep onto the plate.',
          'Lasă legumele curățate câteva minute într-o sită înainte să le tai, ca salata să nu elimine apă în farfurie.',
        ),
      ],
      hideBaseTips: [3],
      stepTips: [
        {
          step: 'roast',
          text: t(
            'For a smokier salad, char the vegetables over a gas flame or on a charcoal grill instead, turning them until blackened, then steam and peel as above. Cook the onion wedges and garlic on the grill until soft.',
            'Pentru un gust mai afumat, coace legumele pe flacăra aragazului sau pe un grătar la cărbuni, întorcându-le până se înnegresc, apoi lasă-le să se înăbușe și curăță-le ca mai sus. Coace sferturile de ceapă și usturoiul pe grătar până se înmoaie.',
          ),
        },
        {
          step: 'spices',
          text: t(
            'Grinding the toasted seeds yourself gives a far stronger smell than ready ground spice.',
            'Semințele prăjite și pisate de tine au un miros mult mai intens decât condimentele gata măcinate.',
          ),
        },
      ],
      nutritionNote: t(
        'Mostly vegetables, so it is low in calories and gives fibre, while the tuna and eggs add protein and the olive oil adds mostly unsaturated fat. Tinned tuna, olives and capers all bring salt, so go easy on the added salt.',
        'În mare parte legume, deci are puține calorii și aduce fibre. Tonul și ouăle adaugă proteine, iar uleiul de măsline grăsimi în mare parte nesaturate. Tonul la conservă, măslinele și caperele aduc sare, așa că adaugă puțină sare.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Baguette', 'Baghetă'),
          reason: t(
            'Crusty bread scoops up the salad and its juices.',
            'Pâinea crocantă ia cu ea salata și zeama ei.',
          ),
          principle: 'contrast_texture',
          ingredient: 'baguette',
        },
        {
          kind: 'food',
          label: t('Harissa', 'Harissa'),
          reason: t(
            'A spoonful on the side adds heat for those who want more fire.',
            'O lingură alături adaugă iuțeală pentru cei care vor mai mult foc.',
          ),
          principle: 'complement_flavour',
          ingredient: 'harissa',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Tuna, egg and bread make it a complete light meal.',
            'Tonul, oul și pâinea o fac o masă ușoară completă.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Served cool and made ahead.',
            'Se servește rece și se poate face dinainte.',
          ),
        },
      ],
    },
  ],
};
