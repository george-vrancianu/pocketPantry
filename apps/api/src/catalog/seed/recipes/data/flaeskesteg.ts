import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Flæskesteg base is Danish roast pork loin with crackling: the rind scored
// through to the fat, salted, roasted on a rack over water and blasted at the
// end, with a gravy made from the pan juices, cream and redcurrant jelly. Each
// Variant is a full Recipe with its own lines, steps and guidance; the base's
// Recipe-level Tips are inherited.
export const flaeskesteg: BaseRecipeSeed = {
  slug: 'flaeskesteg',
  title: t(
    'Danish roast pork with crackling (flæskesteg)',
    'Friptură daneză de porc cu șorici crocant (flæskesteg)',
  ),
  servings: 6,
  prepMinutes: 135,
  cookMinutes: 145,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'rind-on-pork-loin',
      quantity: 2000,
      unit: 'g',
      note: t('with the rind on, bone in or out', 'cu șorici, cu os sau fără'),
    },
    {
      ingredient: 'coarse-salt',
      quantity: 25,
      unit: 'g',
      note: t('for the rind and the cuts', 'pentru șorici și pentru tăieturi'),
    },
    {
      ingredient: 'bay-leaves',
      quantity: 2,
      unit: 'g',
      note: t('about 10 leaves, torn in half', 'cam 10 foi, rupte în jumătăți'),
    },
    {
      ingredient: 'peppercorns',
      quantity: 5,
      unit: 'g',
      optional: true,
      note: t('for the tin', 'pentru tavă'),
    },
    {
      ingredient: 'still-water',
      key: 'water-tin',
      quantity: 1,
      unit: 'l',
      note: t('for the roasting tin', 'pentru tava de copt'),
    },
    { ingredient: 'black-pepper', quantity: 3, unit: 'g' },
    {
      ingredient: 'butter',
      quantity: 30,
      unit: 'g',
      note: t('for the gravy', 'pentru sos'),
    },
    {
      ingredient: 'flour',
      quantity: 30,
      unit: 'g',
      note: t('for the gravy', 'pentru sos'),
    },
    {
      ingredient: 'whipping-cream',
      quantity: 150,
      unit: 'ml',
      note: t('for the gravy', 'pentru sos'),
    },
    {
      ingredient: 'redcurrant-jelly',
      quantity: 20,
      unit: 'g',
      note: t('about 1 tablespoon', 'cam o lingură'),
    },
    {
      ingredient: 'potato',
      quantity: 1.2,
      unit: 'kg',
      note: t('peeled, large ones halved', 'curățați, cei mari tăiați în două'),
    },
    {
      ingredient: 'still-water',
      key: 'water-potatoes',
      quantity: 1.5,
      unit: 'l',
      note: t('for the potatoes', 'pentru cartofi'),
    },
    {
      ingredient: 'salt',
      quantity: 12,
      unit: 'g',
      note: t(
        'for the potato water and the gravy',
        'pentru apa cartofilor și pentru sos',
      ),
    },
  ],
  steps: [
    {
      key: 'score',
      text: t(
        'Pat the rind of the pork completely dry with paper towels. With a very sharp knife, score the rind in straight lines about 1 cm apart, cutting through the rind to the fat but not into the meat.',
        'Șterge șoriciul porcului bine, cu prosoape de hârtie. Cu un cuțit foarte ascuțit, taie șoriciul în linii drepte, la cam 1 cm distanță, prin șorici până la grăsime, dar fără să tai în carne.',
      ),
    },
    {
      key: 'salt',
      text: t(
        'Rub the coarse salt into the cuts and over the rind. Tuck the torn bay leaves into the cuts. Season the meat sides with the black pepper.',
        'Freacă sarea grunjoasă în tăieturi și peste șorici. Strecoară foile de dafin rupte în tăieturi. Presară piperul măcinat pe părțile cu carne.',
      ),
    },
    {
      key: 'dry',
      text: t(
        'Leave the pork uncovered in the fridge for at least 2 hours, or overnight, so the rind dries out.',
        'Lasă carnea neacoperită la frigider cel puțin 2 ore, sau peste noapte, ca șoriciul să se usuce.',
      ),
      timerSeconds: 7200,
    },
    {
      key: 'stand',
      text: t(
        'Take the pork out of the fridge and let it stand for 30 minutes. About 15 minutes into the wait, heat the oven to 180 °C (conventional; 160 °C if it is a fan oven) with a rack in the middle.',
        'Scoate carnea din frigider și las-o 30 de minute la temperatura camerei. După vreo 15 minute, încinge cuptorul la 180 °C (static; 160 °C dacă are ventilator), cu grătarul la mijloc.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'tin',
      text: t(
        'Set a rack in a roasting tin. Pour the water into the tin, add the peppercorns if using, and lay the pork on the rack, rind up. The rack must sit above the water.',
        'Pune un grătar într-o tavă adâncă. Toarnă apa în tavă, adaugă boabele de piper, dacă folosești, și așază carnea pe grătar, cu șoriciul în sus. Grătarul trebuie să stea deasupra apei.',
      ),
    },
    {
      key: 'roast',
      text: t(
        'Roast at 180 °C for 1 hour 15 minutes without opening the oven or basting. The water under the rack catches the drippings so they do not burn, and becomes the base of the gravy.',
        'Coace la 180 °C o oră și 15 minute, fără să deschizi cuptorul și fără să uzi carnea. Apa de sub grătar prinde picăturile ca să nu se ardă și devine baza sosului.',
      ),
      timerSeconds: 4500,
    },
    {
      key: 'crackle',
      text: t(
        'Turn the oven up to 250 °C (or to its top grill setting) and roast for 15 minutes, until the rind blisters, puffs and turns golden brown. Turn the tin around halfway if one side browns faster. If the rind is still hard and pale, give it up to 5 more minutes, and pull it out at once if any part darkens.',
        'Crește cuptorul la 250 °C (sau la grill-ul de sus) și coace 15 minute, până când șoriciul face bășici, se umflă și devine auriu-brun. Rotește tava la jumătate dacă o parte se rumenește mai repede. Dacă șoriciul e încă tare și palid, mai dă-i cel mult 5 minute, dar scoate-l imediat dacă vreo parte se înnegrește.',
      ),
      timerSeconds: 900,
    },
    {
      key: 'potatoes',
      text: t(
        'As the pork goes in for its final blast, put the potatoes in a pot with the water and the salt for the potato water (about 2 teaspoons), bring to the boil, then simmer for about 20 minutes, until a knife slides in easily. Drain.',
        'Când friptura intră la focul puternic, pune cartofii într-o oală cu apa și o parte din sare (cam două lingurițe), adu la fiert, apoi fierbe la foc mic cam 20 de minute, până intră ușor cuțitul în ei. Scurge-i.',
      ),
      timerSeconds: 1200,
    },
    {
      key: 'check',
      text: t(
        'Push a meat thermometer into the thickest part of the meat, away from any bone. It should read at least 65 °C, and the juices should run clear. If it is lower, turn the oven back to 180 °C and keep roasting, checking every 5 minutes.',
        'Înfige un termometru de carne în partea cea mai groasă, departe de os. Trebuie să arate cel puțin 65 °C, iar zeama să iasă limpede. Dacă e mai puțin, coboară cuptorul la 180 °C și mai coace, verificând din 5 în 5 minute.',
      ),
    },
    {
      key: 'rest',
      text: t(
        'Lift the pork onto a board and leave it uncovered in a warm spot for 20 minutes. The core will climb a couple of degrees and the juices settle. Make the gravy while it rests; the potatoes should finish about the same time.',
        'Mută friptura pe o planșetă și las-o neacoperită, la căldură, 20 de minute. Centrul mai urcă cu câteva grade, iar zeama se așază. Fă sosul cât se odihnește; cartofii trebuie să se termine cam atunci.',
      ),
      timerSeconds: 1200,
    },
    {
      key: 'gravy',
      text: t(
        'Also while it rests, strain the juices from the tin into a jug and skim off the fat. Topping up with water if needed, measure 400 ml. Melt the butter in a saucepan until it foams, stir in the flour and cook, stirring, until it smells nutty and is pale gold. Whisk in the juices a little at a time, then simmer for 5 minutes, stirring now and then.',
        'Tot cât se odihnește friptura, strecoară zeama din tavă într-o cană și ia grăsimea de deasupra. Completează cu apă, dacă e nevoie, până la 400 ml. Topește untul într-o cratiță până face spumă, adaugă făina și amestecă până miroase a nucă și devine auriu-pal. Adaugă zeama treptat, amestecând cu telul, apoi fierbe 5 minute, amestecând din când în când.',
      ),
      timerSeconds: 300,
    },
    {
      key: 'finish-gravy',
      text: t(
        'Stir the cream and the redcurrant jelly into the gravy and warm it through until the jelly has melted. Taste and season with the remaining salt and pepper: the juices already carry salt from the rind, so add little.',
        'Amestecă frișca lichidă și jeleul de coacăze în sos și încălzește-l până se topește jeleul. Gustă și potrivește de sare și piper: zeama are deja sare de la șorici, așa că pune puțin.',
      ),
    },
    {
      key: 'carve',
      text: t(
        'Cut the crackling off the pork in one piece and break it into strips, or slice through it with a serrated knife. Slice the meat about 1 cm thick and serve with the potatoes, the gravy and braised red cabbage.',
        'Taie șoriciul de pe carne dintr-o bucată și rupe-l în fâșii, sau feliază cu un cuțit zimțat chiar prin el. Taie carnea în felii de cam 1 cm și servește cu cartofii, sosul și varză roșie înăbușită.',
      ),
    },
  ],
  tips: [
    t(
      'Moisture is what ruins crackling: dry the rind well before roasting and rest the pork uncovered, because foil traps steam and turns the rind chewy.',
      'Umezeala strică șoriciul crocant: usucă bine șoriciul înainte de copt și lasă friptura neacoperită la odihnă, pentru că folia reține aburii și face șoriciul gumos.',
    ),
    t(
      'Cook to the thermometer, not the clock: ovens and joints vary, and a lean loin goes dry quickly once it is past done.',
      'Gătește după termometru, nu după ceas: cuptoarele și bucățile de carne diferă, iar un cotlet slab se usucă repede după ce a trecut de punctul bun.',
    ),
    t(
      'Watch the final blast: crackling goes from golden to burnt in a couple of minutes, and hot spots in the oven make one side go first.',
      'Stai lângă cuptor la focul puternic de la sfârșit: șoriciul trece de la auriu la ars în câteva minute, iar punctele fierbinți din cuptor ard mai întâi o parte.',
    ),
    t(
      'Cool leftovers within 2 hours and keep them in the fridge for up to 3 days. The crackling softens; crisp it again in a hot oven for a few minutes.',
      'Răcește resturile în cel mult 2 ore și ține-le la frigider până la 3 zile. Șoriciul se înmoaie; reîncălzește-l câteva minute în cuptor fierbinte ca să se întărească din nou.',
    ),
  ],
  stepTips: [
    {
      step: 'score',
      text: t(
        'Score in the direction you will carve, so every slice comes away with its own strip of crackling. A craft knife or box cutter does it more cleanly than a kitchen knife.',
        'Taie în direcția în care vei feli, ca fiecare felie să aibă fâșia ei de șorici. Un cuțit de tapet sau un cutter taie mai curat decât un cuțit de bucătărie.',
      ),
    },
    {
      step: 'finish-gravy',
      text: t(
        'If the gravy turns out thin, simmer it a few minutes before adding the cream. If it is too thick, loosen it with a splash of water.',
        'Dacă sosul iese subțire, fierbe-l câteva minute înainte să pui frișca. Dacă e prea gros, subțiază-l cu puțină apă.',
      ),
    },
  ],
  nutritionNote: t(
    'A good source of protein, with potatoes for energy. But the rind and fat cap are rich in saturated fat, the salted crackling and gravy add a lot of salt, and the cream adds more fat. Eat the crackling in moderation, go easy on the gravy, and fill half the plate with the cabbage or other vegetables.',
    'O sursă bună de proteine, cu cartofi pentru energie. Dar șoriciul și stratul de grăsime sunt bogate în grăsimi saturate, șoriciul sărat și sosul aduc multă sare, iar frișca adaugă și mai multă grăsime. Mănâncă șoriciul cu măsură, pune sos puțin și umple jumătate din farfurie cu varza sau alte legume.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t(
        'Braised red cabbage (rødkål)',
        'Varză roșie înăbușită (rødkål)',
      ),
      reason: t(
        'The sweet-sour cabbage is the usual Danish partner: its acidity cuts through the fat of the crackling.',
        'Varza dulce-acrișoară e partenera obișnuită a fripturii în Danemarca: aciditatea ei taie grăsimea șoriciului.',
      ),
      principle: 'acid_cuts_fat',
      recipe: 'braised-red-cabbage',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Sharp, crunchy pickles refresh the palate between rich bites.',
        'Murăturile acre și crocante împrospătează gustul între îmbucăturile grase.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'food',
      label: t('Mustard', 'Muștar'),
      reason: t(
        'Its heat and sharpness lift the sweet, fatty pork.',
        'Iuțeala și ascuțimea lui pun în valoare porcul dulceag și gras.',
      ),
      principle: 'complement_flavour',
      ingredient: 'mustard',
    },
    {
      kind: 'drink',
      label: t('Cold beer', 'Bere rece'),
      reason: t(
        'Cold bubbles and gentle bitterness cleanse the palate after the fat and salt.',
        'Bulele reci și amăreala ușoară curăță gustul după grăsime și sare.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'beer',
    },
    {
      kind: 'drink',
      label: t('Dry cider', 'Cidru sec'),
      reason: t(
        'Apple acidity is a familiar match for pork and cuts the richness.',
        'Aciditatea merelor se potrivește bine cu porcul și taie bogăția.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'cider',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'A hot roast with gravy and potatoes is warming and filling on a cold day.',
        'O friptură caldă cu sos și cartofi încălzește și satură într-o zi rece.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'avoid',
      reason: t(
        'Two hours of oven heat and a heavy, fatty plate are a poor fit for a warm day.',
        'Ore întregi de cuptor și o farfurie grea și grasă nu se potrivesc într-o zi caldă.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Fat and a big portion digest slowly and sit heavy during exercise.',
        'Grăsimea și o porție mare se digeră greu și cad greu la stomac în timpul efortului.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A fatty, salty plate late at night can sit heavy and disturb sleep.',
        'O farfurie grasă și sărată seara târziu poate cădea greu și îți poate strica somnul.',
      ),
    },
  ],
  variants: [
    {
      slug: 'flaeskesteg-italian',
      cuisine: 'italian',
      title: t(
        'Porchetta-style rolled pork belly',
        'Piept de porc rulat cu ierburi, ca porchetta',
      ),
      servings: 6,
      prepMinutes: 750,
      cookMinutes: 210,
      difficulty: 'medium',
      hideBaseTips: [1],
      lines: [
        {
          ingredient: 'pork-belly',
          quantity: 1500,
          unit: 'g',
          note: t(
            'one flat piece with the rind on, boneless',
            'o bucată plată, cu șorici, fără oase',
          ),
        },
        {
          ingredient: 'fennel-seeds',
          quantity: 10,
          unit: 'g',
          note: t('toasted and crushed', 'prăjite și pisate'),
        },
        {
          ingredient: 'garlic',
          quantity: 25,
          unit: 'g',
          note: t(
            'about 6 cloves, finely chopped',
            'cam 6 căței, tocați mărunt',
          ),
        },
        {
          ingredient: 'rosemary',
          quantity: 10,
          unit: 'g',
          note: t('leaves, finely chopped', 'frunze, tocate mărunt'),
        },
        {
          ingredient: 'sage',
          quantity: 8,
          unit: 'g',
          note: t('leaves, finely chopped', 'frunze, tocate mărunt'),
        },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t('the zest only', 'doar coaja rasă'),
        },
        { ingredient: 'chilli-flakes', quantity: 2, unit: 'g' },
        {
          ingredient: 'coarse-salt',
          quantity: 22,
          unit: 'g',
          note: t(
            '12 g for the paste, 10 g for the rind',
            '12 g pentru pastă, 10 g pentru șorici',
          ),
        },
        { ingredient: 'black-pepper', quantity: 3, unit: 'g' },
        {
          ingredient: 'olive-oil',
          quantity: 30,
          unit: 'ml',
          note: t('for the paste', 'pentru pastă'),
        },
        {
          ingredient: 'white-wine',
          quantity: 100,
          unit: 'ml',
          optional: true,
          note: t(
            'for the tin; use water if you prefer',
            'pentru tavă; poți folosi apă',
          ),
        },
        {
          ingredient: 'still-water',
          quantity: 0.6,
          unit: 'l',
          note: t('for the roasting tin', 'pentru tava de copt'),
        },
        {
          ingredient: 'ciabatta',
          quantity: 3,
          unit: 'pcs',
          optional: true,
          note: t('to serve, halved', 'pentru servit, tăiate în două'),
        },
      ],
      steps: [
        {
          key: 'score',
          text: t(
            'Pat the belly dry. With the rind facing up, score it in lines about 1 cm apart, cutting through the rind only and not into the meat.',
            'Șterge bine pieptul de porc. Cu șoriciul în sus, taie-l în linii la cam 1 cm distanță, doar prin șorici, fără să tai în carne.',
          ),
        },
        {
          key: 'paste',
          text: t(
            'Mix the crushed fennel seeds, garlic, rosemary, sage, lemon zest, chilli flakes, 12 g of the coarse salt, the pepper and the olive oil into a paste. Turn the belly rind-down and spread the paste over the meat in an even layer.',
            'Amestecă semințele de fenicul pisate, usturoiul, rozmarinul, salvia, coaja de lămâie, fulgii de chili, 12 g din sarea grunjoasă, piperul și uleiul de măsline până obții o pastă. Întoarce pieptul cu șoriciul în jos și întinde pasta într-un strat uniform pe carne.',
          ),
        },
        {
          key: 'roll',
          text: t(
            'Roll the belly up tightly from a long side so the rind ends up on the outside. Tie it with kitchen string at 3 cm intervals.',
            'Rulează pieptul strâns, de pe o latură lungă, astfel încât șoriciul să rămână pe exterior. Leagă-l cu ață de bucătărie la fiecare 3 cm.',
          ),
        },
        {
          key: 'salt',
          text: t(
            'Rub the remaining 10 g of coarse salt into the cuts and over the rind.',
            'Freacă cele 10 g de sare grunjoasă rămase în tăieturi și peste șorici.',
          ),
        },
        {
          key: 'dry',
          text: t(
            'Leave the roll uncovered on a tray in the fridge for at least 12 hours, so the rind dries out completely.',
            'Lasă rulada neacoperită pe o tavă la frigider cel puțin 12 ore, ca șoriciul să se usuce complet.',
          ),
          timerSeconds: 43200,
        },
        {
          key: 'stand',
          text: t(
            'Take the roll out of the fridge and let it stand for 30 minutes. About 10 minutes into the wait, heat the oven to 160 °C (conventional; 140 °C if it is a fan oven).',
            'Scoate rulada din frigider și las-o 30 de minute la temperatura camerei. După vreo 10 minute, încinge cuptorul la 160 °C (static; 140 °C dacă are ventilator).',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'tin',
          text: t(
            'Set a rack in a roasting tin and pour in the white wine and the water (or all water). Lay the roll on the rack, seam side down.',
            'Pune un grătar într-o tavă adâncă și toarnă vinul alb și apa (sau doar apă). Așază rulada pe grătar, cu cusătura în jos.',
          ),
        },
        {
          key: 'slow-roast',
          text: t(
            'Roast at 160 °C for 2 hours 15 minutes, until a skewer slides into the thickest part with no resistance and the core reads about 80 °C.',
            'Coace la 160 °C două ore și 15 minute, până când o frigăruie intră fără rezistență în cel mai gros loc, iar centrul arată cam 80 °C.',
          ),
          timerSeconds: 8100,
        },
        {
          key: 'crackle',
          text: t(
            'Turn the oven up to 250 °C (or to its top grill setting) and roast for about 20 minutes, until the rind has blistered all over and turned golden and crisp. Look from 15 minutes on and turn the tin if one side browns faster.',
            'Crește cuptorul la 250 °C (sau la grill-ul de sus) și coace cam 20 de minute, până când șoriciul face bășici peste tot și devine auriu și crocant. Verifică de la 15 minute și rotește tava dacă o parte se rumenește mai repede.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'rest',
          text: t(
            'Lift the roll onto a board and leave it uncovered for 20 minutes. Snip off the string.',
            'Mută rulada pe o planșetă și las-o neacoperită 20 de minute. Taie ața.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'serve',
          text: t(
            'Slice with a serrated knife, pressing down firmly through the crackling. Serve warm, or tucked into halved ciabatta.',
            'Feliază cu un cuțit zimțat, apăsând ferm prin șorici. Servește caldă sau în jumătăți de ciabatta.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'roll',
          text: t(
            'If the belly will not roll flat, trim a thin slice of the thickest meat from the edge. Tie it firmly and evenly so the roll cooks at the same rate along its length.',
            'Dacă pieptul nu se rulează uniform, taie o felie subțire din cea mai groasă carne de pe margine. Leagă-l ferm și uniform, ca rulada să se gătească la fel pe toată lungimea.',
          ),
        },
        {
          step: 'slow-roast',
          text: t(
            'Belly needs far more heat than a loin to turn tender, so the core should go well past the point where a lean roast would be done.',
            'Pieptul are nevoie de mult mai multă căldură decât cotletul ca să se înmoaie, deci centrul trebuie să treacă mult de punctul la care o friptură slabă ar fi gata.',
          ),
        },
      ],
      nutritionNote: t(
        'Pork belly gives protein, and the herbs, garlic and lemon carry the flavour. But belly is one of the fattiest cuts, so a portion is high in saturated fat and the rubbed rind adds salt. Keep slices thin, serve with a bitter leaf salad, and go easy on the bread.',
        'Pieptul de porc oferă proteine, iar ierburile, usturoiul și lămâia dau gustul. Dar e una dintre cele mai grase bucăți, așa că o porție e bogată în grăsimi saturate, iar șoriciul frecat cu sare adaugă sodiu. Taie felii subțiri, servește cu o salată de frunze amărui și nu exagera cu pâinea.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Rocket salad', 'Salată de rucola'),
          reason: t(
            'Its peppery bitterness balances the rich, fatty pork.',
            'Amăreala ei piperată echilibrează porcul gras și bogat.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'rocket',
        },
        {
          kind: 'food',
          label: t('Raw fennel salad', 'Salată de fenicul crud'),
          reason: t(
            'Crisp, fresh fennel cleanses the palate and echoes the fennel seed in the rub.',
            'Fenicul crud și crocant curăță gustul și reia aroma semințelor din pastă.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'fennel',
        },
        {
          kind: 'drink',
          label: t('Sparkling wine', 'Vin spumant'),
          reason: t(
            'Bubbles and acidity cut through the fat of the belly.',
            'Bulele și aciditatea taie grăsimea pieptului.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'sparkling-wine',
        },
        {
          kind: 'drink',
          label: t('Cold beer', 'Bere rece'),
          reason: t(
            'Light bitterness and cold bubbles refresh between rich bites.',
            'Amăreala ușoară și bulele reci împrospătează între îmbucături grase.',
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
            'Warm, rich sliced pork is a hearty meal for a cold day.',
            'Porcul feliat, cald și bogat, e o masă consistentă pentru o zi rece.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'Nearly three hours of oven heat and very fatty meat are heavy on a warm day.',
            'Aproape trei ore de cuptor și carne foarte grasă sunt grele într-o zi caldă.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Fatty belly digests slowly and sits heavy during exercise.',
            'Pieptul gras se digeră greu și cade greu la stomac în timpul efortului.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A fatty, salty meal late at night can sit heavy and disturb sleep.',
            'O masă grasă și sărată seara târziu poate cădea greu și îți poate strica somnul.',
          ),
        },
      ],
    },
    {
      slug: 'flaeskesteg-german',
      cuisine: 'german',
      title: t(
        'Bavarian roast pork with crackling (Krustenbraten)',
        'Friptură bavareză de porc cu șorici crocant (Krustenbraten)',
      ),
      servings: 6,
      prepMinutes: 100,
      cookMinutes: 205,
      difficulty: 'medium',
      hideBaseTips: [1],
      lines: [
        {
          ingredient: 'rind-on-pork-shoulder',
          quantity: 2000,
          unit: 'g',
          note: t(
            'with the rind on, bone in or out',
            'cu șorici, cu os sau fără',
          ),
        },
        {
          ingredient: 'still-water',
          key: 'water-simmer',
          quantity: 0.6,
          unit: 'l',
          note: t('to soften the rind', 'pentru înmuiat șoriciul'),
        },
        {
          ingredient: 'coarse-salt',
          quantity: 20,
          unit: 'g',
          note: t(
            'half on the rind, half on the meat',
            'jumătate pe șorici, jumătate pe carne',
          ),
        },
        { ingredient: 'black-pepper', quantity: 3, unit: 'g' },
        {
          ingredient: 'caraway-seeds',
          quantity: 6,
          unit: 'g',
          note: t('crushed', 'pisat'),
        },
        {
          ingredient: 'marjoram',
          quantity: 4,
          unit: 'g',
          note: t('dried', 'uscat'),
        },
        {
          ingredient: 'garlic',
          quantity: 20,
          unit: 'g',
          note: t('about 4 cloves, crushed', 'cam 4 căței, striviți'),
        },
        {
          ingredient: 'onion',
          quantity: 3,
          unit: 'pcs',
          note: t('quartered', 'tăiate în sferturi'),
        },
        {
          ingredient: 'carrot',
          quantity: 300,
          unit: 'g',
          note: t('in thick chunks', 'în bucăți groase'),
        },
        {
          ingredient: 'celeriac',
          quantity: 300,
          unit: 'g',
          note: t('peeled, in chunks', 'curățată, în bucăți'),
        },
        {
          ingredient: 'dark-beer',
          quantity: 500,
          unit: 'ml',
          note: t(
            '250 ml for the tin, 200 ml for basting, 50 ml for the rind',
            '250 ml pentru tavă, 200 ml pentru uns, 50 ml pentru șorici',
          ),
        },
        {
          ingredient: 'still-water',
          key: 'water-tin',
          quantity: 0.25,
          unit: 'l',
          note: t('for the roasting tin', 'pentru tava de copt'),
        },
        {
          ingredient: 'flour',
          quantity: 25,
          unit: 'g',
          note: t('for the gravy', 'pentru sos'),
        },
        {
          ingredient: 'still-water',
          key: 'water-gravy',
          quantity: 0.3,
          unit: 'l',
          note: t(
            '100 ml to mix with the flour, the rest to top up the gravy',
            '100 ml pentru amestecat cu făina, restul pentru completat sosul',
          ),
        },
        {
          ingredient: 'potato',
          quantity: 1.2,
          unit: 'kg',
          note: t(
            'peeled, large ones halved',
            'curățați, cei mari tăiați în două',
          ),
        },
        {
          ingredient: 'still-water',
          key: 'water-potatoes',
          quantity: 1.5,
          unit: 'l',
          note: t('for the potatoes', 'pentru cartofi'),
        },
        {
          ingredient: 'salt',
          quantity: 12,
          unit: 'g',
          note: t(
            'for the potato water and the gravy',
            'pentru apa cartofilor și pentru sos',
          ),
        },
      ],
      steps: [
        {
          key: 'soften',
          text: t(
            'Set the pork rind-down in a wide, hob-proof roasting tin or pan and pour in the water for softening the rind, so it just covers the rind. Bring to a gentle simmer and simmer for 10 minutes, until the rind looks pale and swollen. Do not let it boil hard.',
            'Așază carnea cu șoriciul în jos într-o tavă adâncă sau o tigaie lată, bună pentru plită, și toarnă apa pentru înmuiat, cât să acopere doar șoriciul. Adu la un fiert domol și fierbe 10 minute, până când șoriciul devine palid și umflat. Nu lăsa să fiarbă tare.',
          ),
          timerSeconds: 600,
        },
        {
          key: 'score',
          text: t(
            'Lift the pork out, pour away the water, and pat the rind dry. Leave it for 15 minutes so the steam escapes, then pat it dry again. Score the softened rind in straight lines about 1 cm apart, through the rind to the fat but not into the meat.',
            'Scoate carnea, aruncă apa și șterge șoriciul. Las-o 15 minute ca aburul să se evapore, apoi șterge-o din nou. Taie șoriciul înmuiat în linii drepte, la cam 1 cm distanță, prin șorici până la grăsime, fără să tai în carne.',
          ),
        },
        {
          key: 'season',
          text: t(
            'Mix the caraway, marjoram, garlic, pepper and 10 g of the coarse salt into a paste with a splash of water. Rub it over the meat sides. Rub the remaining 10 g of coarse salt into the cuts of the rind.',
            'Amestecă chimenul, maghiranul, usturoiul, piperul și 10 g din sarea grunjoasă într-o pastă cu puțină apă. Freac-o pe părțile cu carne. Freacă cele 10 g de sare grunjoasă rămase în tăieturile șoriciului.',
          ),
        },
        {
          key: 'dry',
          text: t(
            'Leave the pork uncovered in the fridge for at least 1 hour so the rind dries again.',
            'Lasă carnea neacoperită la frigider cel puțin o oră, ca șoriciul să se usuce din nou.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'preheat',
          text: t(
            'Take the pork out of the fridge. Heat the oven to 180 °C (conventional; 160 °C if it is a fan oven) and let it come up for 15 minutes.',
            'Scoate carnea din frigider. Încinge cuptorul la 180 °C (static; 160 °C dacă are ventilator) și lasă-l 15 minute să ajungă la temperatură.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'tin',
          text: t(
            'Spread the onions, carrots and celeriac in a roasting tin. Pour in 250 ml of the beer and the tin water. Set the pork on the vegetables, rind up.',
            'Întinde ceapa, morcovii și țelina într-o tavă adâncă. Toarnă 250 ml din bere și apa pentru tavă. Așază carnea peste legume, cu șoriciul în sus.',
          ),
        },
        {
          key: 'roast-1',
          text: t(
            'Roast at 180 °C for 1 hour.',
            'Coace la 180 °C timp de o oră.',
          ),
          timerSeconds: 3600,
        },
        {
          key: 'baste-1',
          text: t(
            'Spoon 100 ml of the beer and some of the liquid from the tin over the sides of the pork, keeping it off the rind. Roast for 30 minutes more.',
            'Toarnă cu lingura 100 ml din bere și puțin din lichidul din tavă peste părțile laterale ale cărnii, ferind șoriciul. Mai coace 30 de minute.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'baste-2',
          text: t(
            'Baste the sides again with another 100 ml of the beer and the tin liquid, keeping it off the rind, and roast for 30 minutes more. If the vegetables look dry or dark, add a splash of water to the tin.',
            'Unge din nou părțile laterale cu alți 100 ml de bere și cu lichidul din tavă, ferind șoriciul, și coace încă 30 de minute. Dacă legumele par uscate sau întunecate, adaugă puțină apă în tavă.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'crackle',
          text: t(
            'Brush the rind with the last 50 ml of beer. Turn the oven up to 250 °C (or to its top grill setting) and roast for about 20 minutes, until the rind has blistered and turned deep golden. Check the core with a meat thermometer: it should read at least 75 °C, and about 80 °C gives the tender, sliceable texture of a shoulder. If it is lower, turn the oven back to 180 °C and keep roasting.',
            'Unge șoriciul cu ultimii 50 ml de bere. Crește cuptorul la 250 °C (sau la grill-ul de sus) și coace cam 20 de minute, până când șoriciul face bășici și devine auriu închis. Verifică centrul cu un termometru de carne: trebuie să arate cel puțin 75 °C, iar la cam 80 °C spata e fragedă și se feliază bine. Dacă e mai puțin, coboară cuptorul la 180 °C și mai coace.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'potatoes',
          text: t(
            'As the pork goes in for its final blast, put the potatoes in a pot with the water and the salt for the potato water (about 2 teaspoons), bring to the boil, then simmer for about 20 minutes, until a knife slides in easily. Drain.',
            'Când carnea intră la focul puternic, pune cartofii într-o oală cu apa și o parte din sare (cam două lingurițe), adu la fiert, apoi fierbe la foc mic cam 20 de minute, până intră ușor cuțitul în ei. Scurge-i.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'rest',
          text: t(
            'Lift the pork onto a board and leave it uncovered in a warm spot for 20 minutes. Make the gravy while it rests; the potatoes should finish about the same time.',
            'Mută carnea pe o planșetă și las-o neacoperită, la căldură, 20 de minute. Fă sosul cât se odihnește; cartofii trebuie să se termine cam atunci.',
          ),
          timerSeconds: 1200,
        },
        {
          key: 'gravy',
          text: t(
            'Also while it rests, pour the tin through a sieve into a saucepan, pressing the soft vegetables to squeeze out all their juices. Spoon off the fat that rises. Whisk the flour with 100 ml of the gravy water until smooth, then whisk it into the juices. Top up with some of the remaining gravy water if there is less than 500 ml. Bring to a simmer and cook for 5 minutes, stirring, until lightly thickened.',
            'Tot cât se odihnește carnea, trece conținutul tăvii printr-o sită într-o cratiță, apăsând legumele moi ca să iasă tot sucul. Ia cu lingura grăsimea de deasupra. Amestecă făina cu 100 ml din apa pentru sos până se omogenizează, apoi adaug-o în zeamă, amestecând cu telul. Completează cu puțin din restul apei pentru sos dacă sunt sub 500 ml. Adu la fiert domol și fierbe 5 minute, amestecând, până se îngroașă ușor.',
          ),
          timerSeconds: 300,
        },
        {
          key: 'serve',
          text: t(
            'Taste the gravy and season it with the remaining salt, as the juices are already salty. Cut the crackling off in one piece and break it into strips, then slice the meat about 1 cm thick. Serve with the potatoes, gravy and braised red cabbage.',
            'Gustă sosul și potrivește de sare cu ce a rămas, pentru că zeama e deja sărată. Taie șoriciul dintr-o bucată și rupe-l în fâșii, apoi taie carnea în felii de cam 1 cm. Servește cu cartofii, sosul și varză roșie înăbușită.',
          ),
        },
      ],
      stepTips: [
        {
          step: 'soften',
          text: t(
            'Softening the rind makes it easy to score cleanly and opens the pores, which is what gives the blistered, bubbly crackling of a Krustenbraten.',
            'Înmuierea șoriciului îl face ușor de tăiat curat și deschide porii, ceea ce dă șoriciul cu bășici al unui Krustenbraten.',
          ),
        },
        {
          step: 'gravy',
          text: t(
            'Pressing the caramelised vegetables through the sieve is what gives the gravy body, so you do not need to add stock.',
            'Apăsarea legumelor caramelizate prin sită dă corp sosului, deci nu mai ai nevoie de supă.',
          ),
        },
      ],
      nutritionNote: t(
        'Shoulder gives plenty of protein, and the celeriac, carrots and onions add some fibre. But the rind and fat are rich in saturated fat, the salted crackling and gravy add a lot of salt, and the beer adds alcohol. Eat the crackling in moderation, go easy on the gravy, and fill half the plate with red cabbage or other vegetables.',
        'Spata oferă multe proteine, iar țelina, morcovii și ceapa aduc fibre. Dar șoriciul și grăsimea sunt bogate în grăsimi saturate, șoriciul sărat și sosul aduc multă sare, iar berea adaugă alcool. Mănâncă șoriciul cu măsură, pune sos puțin și umple jumătate din farfurie cu varză roșie sau alte legume.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t(
            'Apfelrotkohl (German red cabbage with apples)',
            'Varză roșie cu mere, ca în Germania (Apfelrotkohl)',
          ),
          reason: t(
            'Sweet-sour red cabbage with apple is the usual partner of Krustenbraten and its acidity cuts the fat.',
            'Varza roșie dulce-acrișoară cu mere e partenera obișnuită a Krustenbraten-ului, iar aciditatea ei taie grăsimea.',
          ),
          principle: 'acid_cuts_fat',
          recipe: 'braised-red-cabbage-german',
        },
        {
          kind: 'food',
          label: t('Sauerkraut', 'Varză murată'),
          reason: t(
            'Sharp, sour cabbage cuts the fatty crackling.',
            'Varza murată, acră, taie grăsimea șoriciului.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'sauerkraut',
        },
        {
          kind: 'food',
          label: t('Mustard', 'Muștar'),
          reason: t(
            'Its heat and sharpness lift the sweet, rich pork.',
            'Iuțeala și ascuțimea lui pun în valoare porcul dulceag și bogat.',
          ),
          principle: 'complement_flavour',
          ingredient: 'mustard',
        },
        {
          kind: 'drink',
          label: t('Cold lager', 'Bere blondă rece'),
          reason: t(
            'Cold bubbles and gentle bitterness refresh after the fat and salt.',
            'Bulele reci și amăreala ușoară împrospătează după grăsime și sare.',
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
            'A hot roast with gravy and potatoes is warming and filling on a cold day.',
            'O friptură caldă cu sos și cartofi încălzește și satură într-o zi rece.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'avoid',
          reason: t(
            'Two and a half hours of oven heat and a heavy, fatty plate are a poor fit for a warm day.',
            'Două ore și jumătate de cuptor și o farfurie grea și grasă nu se potrivesc într-o zi caldă.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Fat and a big portion digest slowly and sit heavy during exercise.',
            'Grăsimea și o porție mare se digeră greu și cad greu la stomac în timpul efortului.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'A fatty, salty plate late at night can sit heavy and disturb sleep.',
            'O farfurie grasă și sărată seara târziu poate cădea greu și îți poate strica somnul.',
          ),
        },
      ],
    },
  ],
};
