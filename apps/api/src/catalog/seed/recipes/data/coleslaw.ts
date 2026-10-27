import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Coleslaw base is the creamy, mayonnaise-dressed white cabbage and carrot
// slaw, chilled before serving. Each Variant is a full Recipe with its own
// lines, steps and guidance; the base's Recipe-level Tips are inherited unless
// hidden (the two Variants have no mayonnaise, so they hide its Tips).
export const coleslaw: BaseRecipeSeed = {
  slug: 'coleslaw',
  title: t('Coleslaw', 'Coleslaw (salată de varză și morcov cu maioneză)'),
  servings: 6,
  prepMinutes: 40,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'cabbage',
      quantity: 500,
      unit: 'g',
      note: t(
        'about half a small head',
        'aproximativ jumătate de căpățână mică',
      ),
    },
    {
      ingredient: 'carrot',
      quantity: 150,
      unit: 'g',
      note: t('coarsely grated', 'dat pe răzătoarea mare'),
    },
    {
      ingredient: 'onion',
      quantity: 0.25,
      unit: 'pcs',
      optional: true,
      note: t('grated', 'rasă'),
    },
    { ingredient: 'mayonnaise', quantity: 150, unit: 'g' },
    { ingredient: 'apple-cider-vinegar', quantity: 20, unit: 'ml' },
    { ingredient: 'sugar', quantity: 10, unit: 'g' },
    { ingredient: 'mustard', quantity: 5, unit: 'g', optional: true },
    { ingredient: 'salt', quantity: 3, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
  ],
  steps: [
    {
      key: 'shred',
      text: t(
        'Remove any tough outer leaves from the cabbage, cut it into quarters and cut out the core. Shred the quarters as finely as you can with a sharp knife and put them in a large bowl.',
        'Scoate frunzele tari de la exterior, taie varza în sferturi și scoate cotorul. Taie sferturile cât mai fin, cu un cuțit bine ascuțit, și pune varza într-un castron mare.',
      ),
    },
    {
      key: 'grate',
      text: t(
        'Coarsely grate the carrots and the onion, if using, and add them to the cabbage.',
        'Dă morcovii și ceapa, dacă folosești, pe răzătoarea mare și adaugă-i peste varză.',
      ),
    },
    {
      key: 'dressing',
      text: t(
        'In a small bowl, whisk the mayonnaise with the cider vinegar, sugar, mustard if using, salt and pepper until smooth and loose enough to pour in a thick ribbon.',
        'Într-un castron mic, amestecă maioneza cu oțetul de mere, zahărul, muștarul, dacă folosești, sarea și piperul, până obții un sos neted, care curge în fir gros.',
      ),
    },
    {
      key: 'toss',
      text: t(
        'Pour the dressing over the vegetables and toss with two forks until every shred is coated.',
        'Toarnă sosul peste legume și amestecă cu două furculițe, până când fiecare fir este acoperit.',
      ),
    },
    {
      key: 'chill',
      text: t(
        'Cover the bowl and chill for 30 minutes, so the cabbage softens slightly and the flavours join.',
        'Acoperă castronul și ține salata la frigider 30 de minute, ca varza să se înmoaie puțin și aromele să se lege.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'serve',
      text: t(
        'Stir, taste and add salt, pepper or a splash of vinegar if it needs it. Serve cold, straight from the fridge.',
        'Amestecă, gustă și corectează cu sare, piper sau puțin oțet, dacă e nevoie. Servește rece, direct din frigider.',
      ),
    },
  ],
  tips: [
    t(
      'Shred the cabbage as finely as you can: fine shreds soften in the dressing, while thick pieces stay hard and squeaky.',
      'Taie varza cât mai fin: firele subțiri se înmoaie în sos, pe când bucățile groase rămân tari.',
    ),
    t(
      'Mayonnaise-dressed slaw must stay cold. Keep it covered in the fridge, put it back within 2 hours of serving (1 hour if the room is above 32 °C), and eat it within 3 days. It releases water as it stands, so stir it and pour off any liquid before serving.',
      'Salata cu maioneză trebuie ținută la rece. Păstreaz-o acoperită la frigider, pune-o la loc în cel mult 2 ore de la servire (1 oră dacă temperatura depășește 32 °C) și consumă-o în maximum 3 zile. Salata elimină apă pe măsură ce stă, așa că amestec-o și scurge lichidul înainte să o servești.',
    ),
    t(
      'If you make your own mayonnaise, it contains raw egg yolk. For young children, older people, anyone pregnant or anyone immunocompromised, use pasteurised eggs or jarred mayonnaise (usually made with pasteurised egg), and keep the slaw cold.',
      'Dacă faci maioneza acasă, ea conține gălbenuș crud de ou. Pentru copii mici, vârstnici, femei însărcinate sau persoane cu imunitatea scăzută, folosește ouă pasteurizate sau maioneză din borcan (de obicei făcută cu ou pasteurizat) și ține salata la rece.',
    ),
  ],
  stepTips: [
    {
      step: 'shred',
      text: t(
        'Cut the core out of each quarter at an angle in a V; the quarters then lie flat and are easy to slice thinly.',
        'Taie cotorul fiecărui sfert pieziș, în formă de V; sferturile stau astfel drept și se feliază ușor, subțire.',
      ),
    },
    {
      step: 'serve',
      text: t(
        'Taste it cold, not at room temperature: chilling dulls sweetness and tang, so it often needs a little more vinegar or salt.',
        'Gust-o rece, nu la temperatura camerei: frigul estompează dulceața și aciditatea, așa că poate avea nevoie de puțin oțet sau sare.',
      ),
    },
  ],
  nutritionNote: t(
    'Cabbage and carrot add crunch and fibre for very little energy. The mayonnaise is mostly oil, so it brings plenty of fat (largely unsaturated) and energy, and the sugar and salt add a little more. Use less mayonnaise, or replace part of it with yogurt, for a lighter slaw.',
    'Varza și morcovul aduc textură crocantă și fibre, cu foarte puține calorii. Maioneza este în mare parte ulei, așa că aduce multe grăsimi (în mare parte nesaturate) și calorii, iar zahărul și sarea mai adaugă puțin. Pentru o salată mai ușoară, folosește mai puțină maioneză sau înlocuiește o parte cu iaurt.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Classic beef burgers', 'Burgeri clasici de vită'),
      reason: t(
        'The cool, crunchy slaw is a contrast to the hot, soft, juicy burger.',
        'Salata rece și crocantă contrastează cu burgerul cald, moale și suculent.',
      ),
      principle: 'contrast_texture',
      recipe: 'burgers',
    },
    {
      kind: 'food',
      label: t(
        'Southern buttermilk fried chicken',
        'Pui prăjit în stil sudist, cu zară',
      ),
      reason: t(
        'The cold, creamy, tangy slaw cuts through the rich, hot crust.',
        'Salata rece, cremoasă și acrișoară taie din bogăția crustei calde.',
      ),
      principle: 'acid_cuts_fat',
      recipe: 'fried-chicken-southern',
    },
    {
      kind: 'food',
      label: t('Grilled sausages', 'Cârnați proaspeți la grătar'),
      reason: t(
        'The tang of the vinegar lifts the fattiness of the sausages.',
        'Aciditatea oțetului taie din grăsimea cârnaților.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'fresh-sausages',
    },
    {
      kind: 'drink',
      label: t('Cold beer', 'Bere rece'),
      reason: t(
        'The bubbles and light bitterness refresh the palate between creamy, rich bites.',
        'Bulele și amăreala ușoară împrospătează gustul între îmbucăturile cremoase și bogate.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'beer',
    },
  ],
  eatingMoments: [
    {
      moment: 'hot-day',
      polarity: 'good_for',
      reason: t(
        'Served cold and crunchy, it is refreshing next to something hot off the grill.',
        'Servită rece și crocantă, e răcoritoare lângă ceva fierbinte de pe grătar.',
      ),
    },
    {
      moment: 'light-lunch',
      polarity: 'good_for',
      reason: t(
        'Quick to make ahead and a good vegetable side for a sandwich or a burger.',
        'Se pregătește repede dinainte și e o garnitură bună de legume pentru un sandviș sau un burger.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Raw cabbage and a rich dressing can sit heavy and cause gas late at night.',
        'Varza crudă și un sos bogat pot cădea greu și pot produce gaze seara târziu.',
      ),
    },
  ],
  variants: [
    {
      slug: 'coleslaw-romanian',
      cuisine: 'romanian',
      title: t(
        'Romanian white cabbage salad with dill (salată de varză)',
        'Salată de varză albă cu mărar',
      ),
      servings: 4,
      prepMinutes: 30,
      difficulty: 'easy',
      hideBaseTips: [1, 2],
      lines: [
        {
          ingredient: 'cabbage',
          quantity: 500,
          unit: 'g',
          note: t(
            'about half a small head',
            'aproximativ jumătate de căpățână mică',
          ),
        },
        { ingredient: 'salt', quantity: 6, unit: 'g' },
        {
          ingredient: 'carrot',
          quantity: 80,
          unit: 'g',
          optional: true,
          note: t('finely grated', 'dat pe răzătoarea mică'),
        },
        { ingredient: 'vinegar', quantity: 30, unit: 'ml' },
        { ingredient: 'sunflower-oil', quantity: 45, unit: 'ml' },
        {
          ingredient: 'dill',
          quantity: 15,
          unit: 'g',
          note: t('finely chopped', 'tocat mărunt'),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'shred',
          text: t(
            'Remove any tough outer leaves from the cabbage, cut it into quarters and cut out the core. Shred the quarters very finely with a sharp knife and put them in a large bowl.',
            'Scoate frunzele tari de la exterior, taie varza în sferturi și scoate cotorul. Taie sferturile foarte fin, cu un cuțit bine ascuțit, și pune varza într-un castron mare.',
          ),
        },
        {
          key: 'knead',
          text: t(
            'Sprinkle the salt over the cabbage and rub and squeeze it hard with your hands for about 3 minutes, until it turns glossy, soft and limp and sits in its own juice.',
            'Presară sarea peste varză și frământ-o bine cu mâinile, apăsând și frecând, vreo 3 minute, până se înmoaie, devine lucioasă și stă în zeama ei.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'squeeze',
          text: t(
            'Squeeze the cabbage a fistful at a time over the sink and pour off the juice, then put the cabbage back in the dry bowl. Grate the carrot, if using, and mix it in.',
            'Stoarce varza câte un pumn, deasupra chiuvetei, și varsă zeama, apoi pune varza la loc în castronul golit. Dă morcovul pe răzătoare, dacă folosești, și amestecă-l în varză.',
          ),
        },
        {
          key: 'dress',
          text: t(
            'Add the vinegar, oil, pepper and dill and toss well.',
            'Adaugă oțetul, uleiul, piperul și mărarul și amestecă bine.',
          ),
        },
        {
          key: 'rest',
          text: t(
            'Leave the salad to stand for 15 minutes so it soaks up the dressing, then taste and add a little more vinegar or pepper if needed. Serve cool.',
            'Lasă salata să stea 15 minute, ca să se îmbibe cu sosul, apoi gustă și mai adaugă oțet sau piper, dacă e nevoie. Servește rece.',
          ),
          timerSeconds: 900,
        },
      ],
      stepTips: [
        {
          step: 'squeeze',
          text: t(
            'Taste a shred after squeezing. If it is too salty, rinse the cabbage quickly under cold water, squeeze it dry again and then dress it.',
            'Gustă un fir după ce ai stors varza. Dacă e prea sărată, clătește-o repede sub apă rece, stoarce-o din nou și abia apoi pune sosul.',
          ),
        },
      ],
      tips: [
        t(
          'Wine vinegar gives a milder, rounder taste than plain vinegar; use it if you find the plain one too sharp.',
          'Oțetul de vin dă un gust mai blând și mai rotund decât oțetul alimentar; folosește-l dacă ți se pare că oțetul alimentar e prea tare.',
        ),
        t(
          'Keep the salad covered in the fridge (put it back within 2 hours of serving) and eat it within 3 days; if you make it ahead, stir in the dill just before serving, because it wilts and darkens as it stands.',
          'Păstrează salata acoperită la frigider (pune-o acolo în cel mult 2 ore de la servire) și consumă-o în cel mult 3 zile; dacă o pregătești dinainte, adaugă mărarul chiar înainte de servire, pentru că se ofilește și se închide la culoare cu timpul.',
        ),
      ],
      nutritionNote: t(
        'Raw cabbage gives fibre for few calories. The oil adds energy but is mostly unsaturated fat, with no saturated animal fat and no mayonnaise. Squeezing off the juice removes some of the salt, but it still adds sodium, and raw cabbage can cause gas in some people.',
        'Varza crudă dă fibre cu puține calorii. Uleiul adaugă calorii, dar e în mare parte grăsime nesaturată, fără grăsime animală saturată și fără maioneză. Stoarcerea zemii scoate o parte din sare, dar salata tot aduce sodiu, iar varza crudă poate produce gaze unor persoane.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Romanian chicken schnitzel', 'Șnițel de pui'),
          reason: t(
            'The sharp, fresh salad cuts through the fried breadcrumb crust.',
            'Salata proaspătă și acrișoară taie din bogăția crustei prăjite de pesmet.',
          ),
          principle: 'acid_cuts_fat',
          recipe: 'fried-chicken-snitel',
        },
        {
          kind: 'food',
          label: t('Fried carp', 'Crap prăjit'),
          reason: t(
            'The sharp, fresh salad cuts through the richness of the fried fish.',
            'Salata proaspătă și acrișoară taie din bogăția peștelui prăjit.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'carp',
        },
        {
          kind: 'food',
          label: t('Smoked sausages', 'Cârnați afumați'),
          reason: t(
            'The acidity and crunch balance the salty, smoky fat.',
            'Aciditatea și textura crocantă echilibrează grăsimea sărată și afumată.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'smoked-sausages',
        },
      ],
      eatingMoments: [
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Cool, crunchy and light, and refreshing next to something hot.',
            'Rece, crocantă și ușoară, răcoritoare lângă ceva fierbinte.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'A quick vegetable side for a plate of fried or roast mains.',
            'O garnitură rapidă de legume pentru o farfurie cu mâncare prăjită sau friptă.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Raw cabbage can sit heavy and cause gas late at night.',
            'Varza crudă poate cădea greu și produce gaze seara târziu.',
          ),
        },
      ],
    },
    {
      slug: 'coleslaw-german',
      cuisine: 'german',
      title: t(
        'Bavarian cabbage salad with bacon (bayerischer Krautsalat)',
        'Salată bavareză de varză cu bacon (bayerischer Krautsalat)',
      ),
      servings: 6,
      prepMinutes: 75,
      cookMinutes: 12,
      difficulty: 'easy',
      hideBaseTips: [1, 2],
      lines: [
        {
          ingredient: 'cabbage',
          quantity: 700,
          unit: 'g',
          note: t(
            'about half a medium head',
            'aproximativ jumătate de căpățână medie',
          ),
        },
        { ingredient: 'salt', quantity: 4, unit: 'g' },
        { ingredient: 'wine-vinegar', quantity: 60, unit: 'ml' },
        { ingredient: 'still-water', quantity: 0.1, unit: 'l' },
        { ingredient: 'sugar', quantity: 15, unit: 'g' },
        { ingredient: 'sunflower-oil', quantity: 30, unit: 'ml' },
        { ingredient: 'caraway-seeds', quantity: 3, unit: 'g' },
        {
          ingredient: 'bacon',
          quantity: 100,
          unit: 'g',
          note: t('smoked, diced', 'afumat, tăiat cubulețe'),
        },
        {
          ingredient: 'onion',
          quantity: 0.5,
          unit: 'pcs',
          optional: true,
          note: t('finely diced', 'tăiată mărunt'),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'shred',
          text: t(
            'Remove any tough outer leaves from the cabbage, cut it into quarters and cut out the core. Shred the quarters as finely as you can and put them in a large heatproof bowl.',
            'Scoate frunzele tari de la exterior, taie varza în sferturi și scoate cotorul. Taie sferturile cât mai fin și pune varza într-un castron mare, rezistent la căldură.',
          ),
        },
        {
          key: 'knead',
          text: t(
            'Sprinkle the salt over the cabbage and knead it with your hands for about 3 minutes, until it softens and starts to release juice. Do not drain it.',
            'Presară sarea peste varză și frământ-o cu mâinile vreo 3 minute, până se înmoaie și începe să lase zeamă. Nu o scurge.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'marinade',
          text: t(
            'In a small saucepan, bring the vinegar, water, sugar, oil and caraway seeds to the boil, stirring until the sugar dissolves.',
            'Într-o cratiță mică, adu la fiert oțetul, apa, zahărul, uleiul și semințele de chimen, amestecând până se dizolvă zahărul.',
          ),
        },
        {
          key: 'pour',
          text: t(
            'Pour the boiling marinade over the cabbage, leaning away from the bowl, add the pepper and toss with a spoon. The cabbage will wilt a little straight away.',
            'Toarnă cu grijă marinada clocotită peste varză, fără să te apleci deasupra castronului, adaugă piperul și amestecă cu o lingură. Varza se va înmuia puțin imediat.',
          ),
        },
        {
          key: 'rest',
          text: t(
            'Cover the bowl and leave it for 1 hour at room temperature, stirring once or twice, so the cabbage softens and takes up the marinade.',
            'Acoperă castronul și lasă varza 1 oră la temperatura camerei, amestecând de una-două ori, ca să se înmoaie și să se îmbibe cu marinada.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'bacon',
          text: t(
            'Put the diced bacon in a cold frying pan, set it over medium heat and fry, stirring now and then, until the fat has melted and the bacon is crisp and golden, about 6 minutes. Add the onion, if using, for the last 2 minutes, until soft and translucent. Then wash your hands, board and knife that touched the raw bacon.',
            'Pune baconul afumat tăiat cubulețe într-o tigaie rece, pune tigaia pe foc mediu și prăjește, amestecând din când în când, până se topește grăsimea, iar baconul devine auriu și crocant, cam 6 minute. Adaugă ceapa, dacă folosești, în ultimele 2 minute, până se înmoaie și devine translucidă. Apoi spală-ți mâinile, tocătorul și cuțitul care au atins baconul crud.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'combine',
          text: t(
            'Take the pan off the heat and let it stand for 1 minute. Spoon the bacon and its warm fat over the cabbage, standing back in case it spits, and stir through. Add nothing wet to the pan.',
            'Ia tigaia de pe foc și las-o 1 minut. Pune cu lingura baconul și grăsimea lui caldă peste varză, ținându-te la distanță în caz că stropește, și amestecă. Nu turna nimic lichid în tigaie.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Taste the salad, adding vinegar or pepper if needed, and serve cool or lukewarm.',
            'Gustă salata, adaugă oțet sau piper dacă e nevoie, și servește-o rece sau călduță.',
          ),
        },
      ],
      tips: [
        t(
          'Never pour the marinade, water or any other liquid into the hot pan of bacon fat: it spits violently. Keep the marinade in its own pan and add the fat to the salad, not the other way round.',
          'Nu turna niciodată marinada, apa sau alt lichid în tigaia cu grăsime încinsă de la bacon: stropește violent. Ține marinada în cratița ei și pune grăsimea peste salată, nu invers.',
        ),
        t(
          'Once the bacon is in, serve within 2 hours of mixing; keep leftovers covered in the fridge, put them there within 2 hours, and eat them within 3 days. The bacon softens as it stands.',
          'După ce ai adăugat baconul, servește salata în cel mult 2 ore de la amestecare; păstrează resturile acoperite la frigider, pune-le acolo în cel mult 2 ore și consumă-le în maximum 3 zile. Baconul se înmoaie pe măsură ce stă.',
        ),
      ],
      stepTips: [
        {
          step: 'rest',
          text: t(
            'If you want to leave it longer than an hour, put it in the fridge after the first hour and add the bacon just before serving.',
            'Dacă vrei să o lași mai mult de o oră, pune-o la frigider după prima oră și adaugă baconul chiar înainte de servire.',
          ),
        },
      ],
      nutritionNote: t(
        'The cabbage gives fibre for few calories and the marinade is mostly vinegar and a little oil. The bacon adds saturated fat and a lot of salt, and the sugar adds a little energy. Use less bacon and keep some of the fat in the pan for a lighter plate.',
        'Varza dă fibre cu puține calorii, iar marinada este în mare parte oțet și puțin ulei. Baconul adaugă grăsimi saturate și multă sare, iar zahărul aduce puțină energie. Pentru o porție mai ușoară, folosește mai puțin bacon și lasă o parte din grăsime în tigaie.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t(
            'Bavarian roast pork with crackling (Krustenbraten)',
            'Friptură bavareză de porc cu șorici crocant (Krustenbraten)',
          ),
          reason: t(
            'The tang of the vinegar cuts through the rich pork and crackling.',
            'Aciditatea oțetului taie din bogăția cărnii de porc și a șoricului crocant.',
          ),
          principle: 'acid_cuts_fat',
          recipe: 'flaeskesteg-german',
        },
        {
          kind: 'food',
          label: t('Grilled sausages', 'Cârnați proaspeți la grătar'),
          reason: t(
            'The sweet-sour cabbage balances the salty, fatty sausage.',
            'Varza dulce-acrișoară echilibrează cârnatul sărat și gras.',
          ),
          principle: 'salt_balances_sweet',
          ingredient: 'fresh-sausages',
        },
        {
          kind: 'drink',
          label: t('Cold beer', 'Bere rece'),
          reason: t(
            'Its bubbles and light bitterness refresh the palate after the bacon and vinegar.',
            'Bulele și amăreala ușoară împrospătează gustul după bacon și oțet.',
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
            'Served lukewarm with crisp bacon, it is a hearty side for roast or sausages.',
            'Servită călduță, cu bacon crocant, este o garnitură consistentă pentru friptură sau cârnați.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'avoid',
          reason: t(
            'The bacon makes it salty and fatty for a light meal.',
            'Baconul o face sărată și grasă pentru o masă ușoară.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Raw cabbage with bacon fat can sit heavy late at night.',
            'Varza crudă cu grăsime de bacon poate cădea greu seara târziu.',
          ),
        },
      ],
    },
  ],
};
