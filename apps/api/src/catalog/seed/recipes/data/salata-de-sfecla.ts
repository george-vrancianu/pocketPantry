import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Salata de sfecla base is the home-made Romanian beetroot salad with
// horseradish (the store-bought jar is the Catalog's horseradish-beetroot).
// Each Variant is a full Recipe; the base's Recipe-level Tips are inherited
// unless a Variant hides them. All three Variants boil the beetroot whole, as
// the base does, so the "gloves" and "boil whole" Tips hold everywhere; the
// horseradish Tip is hidden in each.
export const salataDeSfecla: BaseRecipeSeed = {
  slug: 'salata-de-sfecla',
  title: t(
    'Romanian beetroot salad with horseradish (salată de sfeclă cu hrean)',
    'Salată de sfeclă roșie cu hrean',
  ),
  servings: 6,
  prepMinutes: 100,
  cookMinutes: 70,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'beetroot',
      quantity: 1000,
      unit: 'g',
      note: t(
        'raw, whole, about 4 to 6 medium',
        'crudă, întreagă, aproximativ 4-6 bucăți mijlocii',
      ),
    },
    {
      ingredient: 'still-water',
      quantity: 2,
      unit: 'l',
      note: t('for boiling the beetroot', 'pentru fiertul sfeclei'),
    },
    {
      ingredient: 'horseradish',
      quantity: 60,
      unit: 'g',
      note: t(
        'freshly grated root, or from a jar',
        'rădăcină rasă proaspăt sau din borcan',
      ),
    },
    { ingredient: 'vinegar', quantity: 45, unit: 'ml' },
    { ingredient: 'sugar', quantity: 10, unit: 'g' },
    { ingredient: 'salt', quantity: 6, unit: 'g' },
    {
      ingredient: 'caraway-seeds',
      quantity: 2,
      unit: 'g',
      optional: true,
    },
    {
      ingredient: 'sunflower-oil',
      quantity: 30,
      unit: 'ml',
      optional: true,
    },
  ],
  steps: [
    {
      key: 'trim',
      text: t(
        'Scrub the beetroot under running water. Leave the roots and about 2 cm of the stems on, and do not cut or pierce the skin.',
        'Spală sfecla sub jet de apă, frecând-o bine. Lasă rădăcinile și aproximativ 2 cm din cozi și nu tăia și nu înțepa coaja.',
      ),
    },
    {
      key: 'boil',
      text: t(
        'Put the beetroot in a large pot (4 l or more) and cover with the cold water. Bring to the boil over high heat, then lower the heat to a gentle simmer.',
        'Pune sfecla într-o oală mare (de 4 l sau mai mult) și acoper-o cu apa rece. Adu la fierbere la foc mare, apoi scade focul la o fierbere domoală.',
      ),
    },
    {
      key: 'simmer',
      text: t(
        'Simmer for 50 minutes, until a knife slides into the biggest beetroot with no resistance. If it is not tender yet, simmer on and check every 10 minutes.',
        'Fierbe 50 de minute, până când un cuțit intră fără rezistență în cea mai mare sfeclă. Dacă nu e încă moale, mai fierbe și verifică din 10 în 10 minute.',
      ),
      timerSeconds: 3000,
    },
    {
      key: 'cool',
      text: t(
        'Drain the beetroot and leave it for 30 minutes, until cool enough to handle.',
        'Scurge sfecla și las-o 30 de minute, până se răcește destul cât s-o poți ține în mână.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'peel',
      text: t(
        'Wearing thin gloves, rub off the skins and cut off the roots and stems. Grate the beetroot coarsely into a large bowl.',
        'Cu mănuși subțiri, dă jos coaja frecând-o și taie rădăcinile și cozile. Dă sfecla pe răzătoarea mare, într-un castron încăpător.',
      ),
    },
    {
      key: 'dress',
      text: t(
        'Grate the horseradish into a bowl, then stir in the vinegar, sugar and salt: at once for a milder salad, or after 2 to 3 minutes for a hotter one. Mix about two thirds of it into the beetroot with the caraway and oil if you use them, taste, then add as much of the rest as you like. If you use jarred horseradish, use more of it and less vinegar, to taste, and check the label: jarred horseradish often contains sulphites, sometimes milk. Add a pinch of salt or sugar if it needs it.',
        'Rade hreanul într-un bol, apoi amestecă oțetul, zahărul și sarea: imediat pentru o salată mai blândă sau după 2-3 minute pentru una mai iute. Amestecă cam două treimi din ea cu sfecla, împreună cu chimenul și uleiul, dacă le folosești, gustă, apoi adaugă din restul cât îți place. Dacă folosești hrean din borcan, pune mai mult hrean și mai puțin oțet, după gust, și verifică eticheta: hreanul din borcan conține adesea sulfiți, uneori și lapte. Mai pune un praf de sare sau de zahăr dacă e nevoie.',
      ),
    },
    {
      key: 'rest',
      text: t(
        'Cover and chill for 1 hour so the beetroot takes up the flavours.',
        'Acoperă și ține la frigider 1 oră, ca sfecla să se pătrundă de gust.',
      ),
      timerSeconds: 3600,
    },
    {
      key: 'serve',
      text: t(
        'Stir once more and serve cold. Put any leftovers back in the fridge in a covered container within 2 hours and eat them within 3 days.',
        'Amestecă încă o dată și servește rece. Pune salata rămasă înapoi la frigider, într-un recipient acoperit, în maximum 2 ore și mănâncă-o în 3 zile.',
      ),
    },
  ],
  tips: [
    t(
      'Beetroot juice stains hands, boards and cloths: wear thin gloves to peel and cut, and keep a plastic or glass bowl for it.',
      'Sucul de sfeclă pătează mâinile, tocătorul și prosoapele: poartă mănuși subțiri la curățat și la tăiat și folosește un castron de plastic sau de sticlă.',
    ),
    t(
      'Boil the beetroot whole and unpeeled, with roots and part of the stems on: cut beetroot bleeds colour and flavour into the water.',
      'Fierbe sfecla întreagă și necurățată, cu rădăcinile și o parte din cozi: sfecla tăiată își lasă culoarea și gustul în apă.',
    ),
    t(
      'Grated horseradish gets hotter for the first 2 to 3 minutes, then fades in the air. Vinegar stops it where it is: add the vinegar at once for a milder salad, or after 2 to 3 minutes for a hotter one, but not much later.',
      'Hreanul ras devine mai iute în primele 2-3 minute, apoi se estompează la aer. Oțetul îl oprește unde e: pune oțetul imediat pentru o salată mai blândă sau după 2-3 minute pentru una mai iute, dar nu mult mai târziu.',
    ),
  ],
  stepTips: [
    {
      step: 'dress',
      text: t(
        'Grate the horseradish with a window open: the fumes sting the eyes and nose. Taste before adding the last of it, because fresh roots vary a lot in strength.',
        'Rade hreanul cu fereastra deschisă: aburii înțeapă ochii și nasul. Gustă înainte să pui ultima parte, pentru că rădăcinile proaspete diferă mult în iuțeală.',
      ),
    },
  ],
  nutritionNote: t(
    'Mostly beetroot, so it is low in fat and gives fibre and some natural sugar; the sugar and salt are small additions. The optional oil is mostly unsaturated. Raw horseradish is very pungent and can upset a sensitive stomach, so start with less.',
    'În principal sfeclă, deci are puține grăsimi și aduce fibre și ceva zaharuri naturale; zahărul și sarea sunt adaosuri mici. Uleiul opțional e în mare parte nesaturat. Hreanul crud e foarte iute și poate deranja un stomac sensibil, așa că începe cu mai puțin.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t(
        'Pan-fried pork chops with garlic and thyme butter',
        'Cotlete de porc la tigaie cu unt, usturoi și cimbrișor',
      ),
      reason: t(
        'The sharp horseradish and vinegar cut through the buttery, rich chops.',
        'Hreanul iute și oțetul taie din bogăția cotletelor cu unt.',
      ),
      principle: 'acid_cuts_fat',
      recipe: 'pork-chops',
    },
    {
      kind: 'food',
      label: t('Bread', 'Pâine'),
      reason: t(
        'Fresh bread soaks up the sweet-sour beetroot juice and mellows the horseradish.',
        'Pâinea proaspătă absoarbe sucul dulce-acrișor al sfeclei și domolește hreanul.',
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
        'A cold, fat-light vegetable dish that is made ahead and goes well with bread.',
        'O mâncare rece de legume, cu puține grăsimi, care se pregătește dinainte și merge bine cu pâine.',
      ),
    },
    {
      moment: 'hot-day',
      polarity: 'good_for',
      reason: t(
        'Served cold, and the sharp, hot taste is refreshing.',
        'Se servește rece, iar gustul acrișor și iute e răcoritor.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'Raw horseradish and vinegar can cause heartburn if you lie down soon after.',
        'Hreanul crud și oțetul pot da arsuri la stomac dacă te culci curând după masă.',
      ),
    },
  ],
  variants: [
    {
      slug: 'salata-de-sfecla-russian',
      cuisine: 'russian',
      title: t(
        'Vinegret (Russian beetroot, potato and pickle salad)',
        'Vinegret (salată de sfeclă, cartofi și castraveți murați, ca în Rusia)',
      ),
      servings: 6,
      prepMinutes: 75,
      cookMinutes: 65,
      difficulty: 'easy',
      hideBaseTips: [2],
      lines: [
        {
          ingredient: 'beetroot',
          quantity: 400,
          unit: 'g',
          note: t('raw, whole', 'crudă, întreagă'),
        },
        { ingredient: 'potato', quantity: 0.4, unit: 'kg' },
        { ingredient: 'carrot', quantity: 200, unit: 'g' },
        {
          ingredient: 'still-water',
          quantity: 2.5,
          unit: 'l',
          note: t(
            '1 l for the beetroot, 1.5 l for the potatoes and carrots',
            '1 l pentru sfeclă, 1,5 l pentru cartofi și morcovi',
          ),
        },
        {
          ingredient: 'pickled-cucumbers',
          quantity: 150,
          unit: 'g',
          note: t('diced', 'tăiați cubulețe'),
        },
        {
          ingredient: 'sauerkraut',
          quantity: 150,
          unit: 'g',
          note: t('squeezed and chopped', 'stoarsă și tocată'),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('small, finely chopped', 'mică, tocată mărunt'),
        },
        {
          ingredient: 'canned-peas',
          quantity: 150,
          unit: 'g',
          note: t('drained', 'scursă'),
        },
        { ingredient: 'sunflower-oil', quantity: 45, unit: 'ml' },
        { ingredient: 'salt' },
        { ingredient: 'dill', quantity: 10, unit: 'g', optional: true },
      ],
      steps: [
        {
          key: 'boil-beet',
          text: t(
            'Scrub the beetroot, leaving roots and 2 cm of stems on. Put it in a pot with 1 l of cold water, bring to the boil, then simmer gently for 50 minutes, until a knife slides in with no resistance. If it is not tender yet, simmer on and check every 10 minutes.',
            'Spală sfecla, lăsând rădăcinile și 2 cm din cozi. Pune-o într-o oală cu 1 l de apă rece, adu la fierbere, apoi fierbe domol 50 de minute, până când un cuțit intră fără rezistență. Dacă nu e încă moale, mai fierbe și verifică din 10 în 10 minute.',
          ),
          timerSeconds: 3000,
        },
        {
          key: 'boil-veg',
          text: t(
            'After the beetroot has simmered for 25 minutes, scrub the potatoes and carrots and put them whole, in their skins, in a second pot with 1.5 l of cold water. Bring to the boil and simmer for 25 minutes, until a knife slides in easily.',
            'După ce sfecla a fiert 25 de minute, spală cartofii și morcovii și pune-i întregi, cu coajă, într-o a doua oală cu 1,5 l de apă rece. Adu la fierbere și fierbe 25 de minute, până când un cuțit intră ușor.',
          ),
          timerSeconds: 1500,
        },
        {
          key: 'cool',
          text: t(
            'Drain all the vegetables and leave them for 30 minutes, until cool enough to handle. Cool vegetables dice cleanly and do not turn mushy.',
            'Scurge toate legumele și las-le 30 de minute, până se răcesc cât să le poți ține în mână. Legumele reci se taie curat și nu se strivesc.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'dice',
          text: t(
            'Wearing thin gloves, peel the beetroot, potatoes and carrots and cut them into 1 cm dice. Put the beetroot in its own large bowl.',
            'Cu mănuși subțiri, curăță sfecla, cartofii și morcovii și taie-i cubulețe de 1 cm. Pune sfecla într-un castron mare separat.',
          ),
        },
        {
          key: 'oil-beet',
          text: t(
            'Toss the beetroot with 15 ml of the oil until every cube is glossy. This coats it so it stains the other vegetables less.',
            'Amestecă sfecla cu 15 ml din ulei, până când fiecare cubuleț e lucios. Așa se învelește în ulei și pătează mai puțin celelalte legume.',
          ),
        },
        {
          key: 'mix',
          text: t(
            'Add the potatoes, carrots, pickled cucumbers, sauerkraut, onion and peas, then the remaining 30 ml of oil and the dill if you use it. Fold gently, taste, and add salt only if needed, because the pickles and sauerkraut are already salty.',
            'Adaugă cartofii, morcovii, castraveții murați, varza murată, ceapa și mazărea, apoi cei 30 ml de ulei rămași și mărarul, dacă îl folosești. Amestecă ușor, gustă și pune sare doar dacă e nevoie, pentru că murăturile și varza murată sunt deja sărate.',
          ),
        },
        {
          key: 'rest',
          text: t(
            'Cover and chill for 30 minutes so the flavours come together, then serve cold. Put leftovers in a covered container in the fridge within 2 hours and eat them within 2 days.',
            'Acoperă și ține la frigider 30 de minute ca aromele să se lege, apoi servește rece. Pune restul într-un recipient acoperit la frigider în maximum 2 ore și mănâncă salata în 2 zile.',
          ),
          timerSeconds: 1800,
        },
      ],
      tips: [
        t(
          'Squeeze the sauerkraut well and drain the peas: loose brine makes the salad watery and pink within hours.',
          'Stoarce bine varza murată și scurge mazărea: zeama în exces face salata apoasă și roz în câteva ore.',
        ),
      ],
      stepTips: [
        {
          step: 'oil-beet',
          text: t(
            'Keep the beetroot apart until the oil is on it, then fold everything else in at the end: the salad stays more colourful.',
            'Ține sfecla separat până o ungi cu ulei, apoi adaugă restul la sfârșit: salata rămâne mai colorată.',
          ),
        },
      ],
      nutritionNote: t(
        'A vegetable salad with fibre from beetroot, peas, potato and cabbage and no animal fat; the oil is mostly unsaturated. The pickles and sauerkraut make it salty, and potato adds starch, so it is more filling than it looks.',
        'O salată de legume, cu fibre din sfeclă, mazăre, cartofi și varză și fără grăsimi animale; uleiul e în mare parte nesaturat. Murăturile și varza o fac sărată, iar cartofii aduc amidon, așa că satură mai mult decât pare.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Rye bread', 'Pâine de secară'),
          reason: t(
            'Its dense, sour crumb is a sturdy base for the sweet-sour, salty salad.',
            'Miezul des și acrișor e o bază solidă pentru salata dulce-acrișoară și sărată.',
          ),
          principle: 'complement_flavour',
          ingredient: 'rye-bread',
        },
        {
          kind: 'food',
          label: t('Salted herring', 'Hering sărat'),
          reason: t(
            'The sharp pickles and the sweet beetroot balance the salty, oily fish.',
            'Murăturile ascuțite și sfecla dulce echilibrează peștele sărat și gras.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'salted-herring',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Made ahead, cold and filling, with no mayonnaise.',
            'Se face dinainte, e rece și săturătoare, fără maioneză.',
          ),
        },
        {
          moment: 'cold-day',
          polarity: 'good_for',
          reason: t(
            'Potato and peas make it a hearty side next to something hot.',
            'Cartofii și mazărea o fac o garnitură consistentă lângă ceva fierbinte.',
          ),
        },
      ],
    },
    {
      slug: 'salata-de-sfecla-scandinavian',
      cuisine: 'scandinavian',
      title: t(
        'Danish pickled beetroot (syltede rødbeder)',
        'Sfeclă roșie murată, dulce-acrișoară, ca în Danemarca (syltede rødbeder)',
      ),
      servings: 10,
      prepMinutes: 1500,
      cookMinutes: 70,
      difficulty: 'easy',
      hideBaseTips: [2],
      lines: [
        {
          ingredient: 'beetroot',
          quantity: 700,
          unit: 'g',
          note: t('raw, whole', 'crudă, întreagă'),
        },
        {
          ingredient: 'still-water',
          quantity: 1.65,
          unit: 'l',
          note: t(
            '1.5 l for boiling the beetroot, 150 ml for the pickling liquid',
            '1,5 l pentru fiertul sfeclei, 150 ml pentru zeama de oțet',
          ),
        },
        { ingredient: 'vinegar', quantity: 150, unit: 'ml' },
        { ingredient: 'sugar', quantity: 100, unit: 'g' },
        { ingredient: 'salt', quantity: 3, unit: 'g' },
        {
          ingredient: 'bay-leaves',
          quantity: 0.4,
          unit: 'g',
          optional: true,
          note: t('about 2 leaves', 'aproximativ 2 foi'),
        },
        {
          ingredient: 'allspice-berries',
          quantity: 1,
          unit: 'g',
          optional: true,
          note: t('about 10 berries', 'aproximativ 10 boabe'),
        },
      ],
      steps: [
        {
          key: 'boil',
          text: t(
            'Scrub the beetroot, leaving roots and 2 cm of stems on. Put it in a pot with 1.5 l of cold water, bring to the boil, then simmer gently for 45 minutes, until a knife slides into the biggest one with no resistance. If it is not tender yet, simmer on and check every 10 minutes.',
            'Spală sfecla, lăsând rădăcinile și 2 cm din cozi. Pune-o într-o oală cu 1,5 l de apă rece, adu la fierbere, apoi fierbe domol 45 de minute, până când un cuțit intră fără rezistență în cea mai mare. Dacă nu e încă moale, mai fierbe și verifică din 10 în 10 minute.',
          ),
          timerSeconds: 2700,
        },
        {
          key: 'jar',
          text: t(
            'While the beetroot simmers, wash a heat-safe 1 l jar and its lid in hot soapy water, rinse, then fill the jar with boiling water, leave it for a minute and pour out. Leave to drain upside down on a clean cloth.',
            'În timp ce sfecla fierbe, spală cu apă caldă și detergent un borcan de 1 l rezistent la căldură și capacul lui, clătește, apoi umple borcanul cu apă clocotită, lasă-l un minut și golește-l. Lasă-l la scurs cu gura în jos pe un prosop curat.',
          ),
        },
        {
          key: 'cool',
          text: t(
            'Drain the beetroot and leave it for 30 minutes, until cool enough to handle.',
            'Scurge sfecla și las-o 30 de minute, până se răcește cât s-o poți ține în mână.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'slice',
          text: t(
            'Wearing thin gloves, rub off the skins, cut off the roots and stems, and slice the beetroot 5 mm thick. Pack the slices into the jar, with the bay leaves and allspice berries between the layers.',
            'Cu mănuși subțiri, dă jos coaja, taie rădăcinile și cozile și taie sfecla felii de 5 mm. Pune feliile în borcan, cu foile de dafin și boabele de ienibahar printre straturi.',
          ),
        },
        {
          key: 'brine',
          text: t(
            'In a small pot, bring the vinegar, 150 ml of water, sugar and salt to the boil, stirring until the sugar has dissolved completely. Take it off the heat.',
            'Într-o oală mică, adu la fierbere oțetul, 150 ml de apă, zahărul și sarea, amestecând până se topește complet zahărul. Dă oala de pe foc.',
          ),
        },
        {
          key: 'fill',
          text: t(
            'Pour the hot brine over the slices until they are completely covered. If they are not, top up with equal parts vinegar and water, boiled. Tap the jar on the counter to release air bubbles, wipe the rim and close the lid.',
            'Toarnă zeama fierbinte peste felii, până sunt acoperite complet. Dacă nu sunt acoperite, completează cu oțet și apă în părți egale, fierte. Lovește ușor borcanul de blat ca să iasă bulele de aer, șterge gura borcanului și închide capacul.',
          ),
        },
        {
          key: 'chill',
          text: t(
            'Leave the jar to cool on the counter, then put it in the fridge within 2 hours. Write the date on the jar and let the beetroot pickle for at least 24 hours before eating.',
            'Lasă borcanul să se răcească pe blat, apoi pune-l la frigider în maximum 2 ore. Notează data pe borcan și lasă sfecla la murat cel puțin 24 de ore înainte s-o mănânci.',
          ),
        },
      ],
      tips: [
        t(
          'Keep the slices under the liquid and take them out with a clean fork, never fingers: it keeps the pickle from spoiling.',
          'Ține feliile sub zeamă și scoate-le cu o furculiță curată, niciodată cu degetele: așa murătura nu se strică.',
        ),
        t(
          'Keep the jar in the fridge and eat it within 2 weeks, and throw it out sooner if the liquid turns cloudy or slimy, you see mould, the slices go soft, or it smells off.',
          'Ține borcanul la frigider și mănâncă sfecla în 2 săptămâni și aruncă-o mai devreme dacă zeama se tulbură sau devine vâscoasă, apare mucegai, feliile se înmoaie sau miroase ciudat.',
        ),
      ],
      stepTips: [
        {
          step: 'slice',
          text: t(
            'Slice the beetroot with a sharp knife or a mandoline set to 5 mm, so the slices all take up the pickling liquid at the same pace.',
            'Taie sfecla cu un cuțit bine ascuțit sau cu o mandolină reglată la 5 mm, ca toate feliile să se îmbibe cu zeamă în același ritm.',
          ),
        },
      ],
      nutritionNote: t(
        'Beetroot gives fibre and the pickle has no fat, but the pickling liquid holds a fair amount of sugar and a little salt, so keep portions to a few slices as a side. The vinegar makes it sharp and can irritate reflux.',
        'Sfecla aduce fibre și murătura nu are grăsimi, dar zeama conține destul zahăr și puțină sare, așa că ia câteva felii ca garnitură. Oțetul o face ascuțită și poate agrava refluxul.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t(
            'Danish hash with fried egg (biksemad)',
            'Cartofi prăjiți cu carne și ou ochi, ca în Danemarca (biksemad)',
          ),
          reason: t(
            'The sweet-sour beetroot slices cut through the fried potatoes, meat and egg yolk.',
            'Feliile de sfeclă dulce-acrișoară taie din bogăția cartofilor prăjiți, a cărnii și a gălbenușului.',
          ),
          principle: 'acid_cuts_fat',
          recipe: 'biksemad',
        },
        {
          kind: 'food',
          label: t('Rye bread', 'Pâine de secară'),
          reason: t(
            'The dense, slightly sour bread suits the sweet-sour slices.',
            'Pâinea densă, ușor acrișoară se potrivește cu feliile dulce-acrișoare.',
          ),
          principle: 'complement_flavour',
          ingredient: 'rye-bread',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Ready from the fridge, a quick side for bread or a plate of leftovers.',
            'Gata din frigider, o garnitură rapidă lângă pâine sau mâncare rămasă.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'The vinegar can cause heartburn if you lie down soon after.',
            'Oțetul poate da arsuri la stomac dacă te culci curând după masă.',
          ),
        },
      ],
    },
    {
      slug: 'salata-de-sfecla-georgian',
      cuisine: 'georgian',
      title: t(
        'Beetroot pkhali (Georgian beetroot and walnut balls)',
        'Pkhali de sfeclă (bile georgiene din sfeclă și nucă)',
      ),
      servings: 6,
      prepMinutes: 105,
      cookMinutes: 75,
      difficulty: 'easy',
      hideBaseTips: [2],
      lines: [
        {
          ingredient: 'beetroot',
          quantity: 500,
          unit: 'g',
          note: t('raw, whole', 'crudă, întreagă'),
        },
        {
          ingredient: 'still-water',
          quantity: 1.5,
          unit: 'l',
          note: t('for boiling the beetroot', 'pentru fiertul sfeclei'),
        },
        { ingredient: 'walnuts', quantity: 100, unit: 'g' },
        {
          ingredient: 'garlic',
          quantity: 15,
          unit: 'g',
          note: t('about 3 cloves', 'aproximativ 3 căței'),
        },
        { ingredient: 'salt', quantity: 4, unit: 'g' },
        { ingredient: 'khmeli-suneli', quantity: 3, unit: 'g' },
        { ingredient: 'wine-vinegar', quantity: 20, unit: 'ml' },
        {
          ingredient: 'coriander',
          quantity: 20,
          unit: 'g',
          note: t('leaves, finely chopped', 'frunze, tocate mărunt'),
        },
        {
          ingredient: 'onion',
          quantity: 0.5,
          unit: 'pcs',
          optional: true,
          note: t('finely chopped', 'tocată mărunt'),
        },
        {
          ingredient: 'hot-pepper',
          quantity: 0.5,
          unit: 'pcs',
          optional: true,
          note: t('seeded, finely chopped', 'fără semințe, tocat mărunt'),
        },
        {
          ingredient: 'pomegranate',
          quantity: 1,
          unit: 'pcs',
          note: t('for the seeds', 'pentru semințe'),
        },
      ],
      steps: [
        {
          key: 'boil',
          text: t(
            'Scrub the beetroot, leaving roots and 2 cm of stems on. Put it in a pot with the cold water, bring to the boil, then simmer gently for 50 minutes, until a knife slides in with no resistance. If it is not tender yet, simmer on and check every 10 minutes.',
            'Spală sfecla, lăsând rădăcinile și 2 cm din cozi. Pune-o într-o oală cu apa rece, adu la fierbere, apoi fierbe domol 50 de minute, până când un cuțit intră fără rezistență. Dacă nu e încă moale, mai fierbe și verifică din 10 în 10 minute.',
          ),
          timerSeconds: 3000,
        },
        {
          key: 'cool',
          text: t(
            'Drain the beetroot and leave it for 30 minutes, until cool enough to handle.',
            'Scurge sfecla și las-o 30 de minute, până se răcește cât s-o poți ține în mână.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'paste',
          text: t(
            'While the beetroot cools, grind the walnuts with the garlic, salt and khmeli suneli in a food processor, or pound them in a mortar, to a thick, slightly oily paste. Stir in the vinegar.',
            'În timp ce sfecla se răcește, macină nucile cu usturoiul, sarea și khmeli suneli în robotul de bucătărie sau pisează-le în mojar, până obții o pastă groasă, ușor unsuroasă. Adaugă oțetul.',
          ),
        },
        {
          key: 'grate',
          text: t(
            'Wearing thin gloves, peel the beetroot and grate it on the fine side of the grater. Squeeze it in handfuls to wring out the excess juice: it should feel moist but not drip.',
            'Cu mănuși subțiri, curăță sfecla și dă-o pe partea fină a răzătorii. Strânge-o în pumn, câte puțin, ca să scurgi sucul în exces: trebuie să fie umedă, dar să nu picure.',
          ),
        },
        {
          key: 'mix',
          text: t(
            'Mix the beetroot with the walnut paste, coriander, and the onion and hot pepper if you use them. Taste and add salt or vinegar if needed.',
            'Amestecă sfecla cu pasta de nuci, coriandrul și, dacă le folosești, ceapa și ardeiul iute. Gustă și corectează cu sare sau oțet dacă e nevoie.',
          ),
        },
        {
          key: 'chill',
          text: t(
            'Cover and chill for 30 minutes, until firm enough to shape.',
            'Acoperă și ține la frigider 30 de minute, până se întărește destul cât să poată fi modelată.',
          ),
          timerSeconds: 1800,
        },
        {
          key: 'seeds',
          text: t(
            'Cut the pomegranate in half and tap the skin with a wooden spoon over a bowl to knock out the seeds. Remove any white pith.',
            'Taie rodia în două și lovește coaja cu o lingură de lemn deasupra unui bol, ca să cadă semințele. Îndepărtează pielițele albe.',
          ),
        },
        {
          key: 'shape',
          text: t(
            'With damp hands, roll the mixture into about 24 balls of roughly 20 g each. Press a few pomegranate seeds on top of each ball and serve. Keep leftovers covered in the fridge, put them there within 2 hours, and eat them within 3 days.',
            'Cu mâinile umede, rulează compoziția în aproximativ 24 de bile de cam 20 g fiecare. Apasă câteva semințe de rodie deasupra fiecărei bile și servește. Păstrează bilele rămase acoperite la frigider, pune-le acolo în maximum 2 ore și mănâncă-le în 3 zile.',
          ),
        },
      ],
      tips: [
        t(
          'Taste a walnut before you start: old walnuts turn the paste bitter, and bitterness will not go away.',
          'Gustă o nucă înainte să începi: nucile vechi dau pastei un gust amar care nu mai dispare.',
        ),
      ],
      stepTips: [
        {
          step: 'grate',
          text: t(
            'Do not skip the squeezing: too much beetroot juice makes the mixture too loose to roll.',
            'Nu sări peste stors: dacă rămâne prea mult suc de sfeclă, compoziția e prea moale ca să poată fi rulată.',
          ),
        },
      ],
      nutritionNote: t(
        'Walnuts add fat that is mostly unsaturated, along with fibre and some protein, and beetroot adds more fibre, so the balls are filling. They are also calorie-dense, so a few go a long way, and the salt adds up if you serve them with bread.',
        'Nucile aduc grăsimi în mare parte nesaturate, plus fibre și ceva proteine, iar sfecla adaugă fibre, deci bilele satură. Sunt și bogate în calorii, așa că ajung câteva, iar sarea se adună dacă le servești cu pâine.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Lavash', 'Lavaș'),
          reason: t(
            'The soft flatbread lets you scoop up or wrap the balls, and its mild taste softens the strong spices.',
            'Lipia moale îți permite să iei sau să înfășori bilele, iar gustul ei blând domolește condimentele puternice.',
          ),
          principle: 'complement_flavour',
          ingredient: 'lavash',
        },
        {
          kind: 'drink',
          label: t('Red wine', 'Vin roșu'),
          reason: t(
            'A fruity red with some acidity echoes the earthy, tangy beetroot and walnuts.',
            'Un vin roșu fructat, cu puțină aciditate, se potrivește cu sfecla și nucile, pământii și ușor acrișoare.',
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
            'Made ahead and served cold, with some fibre and some protein.',
            'Se face dinainte și se servește rece, cu ceva fibre și ceva proteine.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'Cold, tangy and fresh with pomegranate and coriander.',
            'Bilele sunt reci, acrișoare și proaspete, cu rodie și coriandru.',
          ),
        },
      ],
    },
  ],
};
