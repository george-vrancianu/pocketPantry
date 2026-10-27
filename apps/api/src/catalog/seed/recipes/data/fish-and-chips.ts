import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Fish and chips base is beer-battered cod with twice-fried chips. Its
// Variants share no batter and no deep-frying: a Romanian shallow-fried crucian
// carp with mujdei, and a Danish butter-fried breaded plaice. Each is a full
// Recipe; the base's Recipe-level Tips are inherited unless hidden.
export const fishAndChips: BaseRecipeSeed = {
  slug: 'fish-and-chips',
  title: t(
    'Beer-battered fish and chips',
    'Fish and chips (pește în aluat cu bere și cartofi prăjiți)',
  ),
  servings: 4,
  prepMinutes: 45,
  cookMinutes: 75,
  difficulty: 'medium',
  lines: [
    {
      ingredient: 'potato',
      quantity: 1.2,
      unit: 'kg',
      note: t(
        'floury, such as Maris Piper or Russet',
        'făinoși, de exemplu soiuri pentru piure',
      ),
    },
    {
      ingredient: 'sunflower-oil',
      quantity: 2000,
      unit: 'ml',
      note: t(
        'for deep-frying, in a pot of at least 6 litres',
        'pentru prăjit în baie de ulei, într-o oală de cel puțin 6 litri',
      ),
    },
    {
      ingredient: 'cod',
      quantity: 720,
      unit: 'g',
      note: t(
        'four thick, centre-cut skinless fillets of about 180 g each',
        'patru fileuri groase, fără piele, din mijlocul peștelui, de aproximativ 180 g fiecare',
      ),
    },
    {
      ingredient: 'flour',
      key: 'flour-batter',
      quantity: 200,
      unit: 'g',
      note: t('for the batter', 'pentru aluat'),
    },
    {
      ingredient: 'flour',
      key: 'flour-dusting',
      quantity: 40,
      unit: 'g',
      note: t('for dusting the fish', 'pentru pudrat peștele'),
    },
    { ingredient: 'baking-powder', quantity: 5, unit: 'g' },
    {
      ingredient: 'beer',
      quantity: 300,
      unit: 'ml',
      note: t(
        'lager or pale ale, ice-cold',
        'blondă sau pale ale, foarte rece',
      ),
    },
    {
      ingredient: 'salt',
      quantity: 10,
      unit: 'g',
      note: t(
        '2 g on the fish, 3 g in the batter, 5 g on the chips',
        '2 g pe pește, 3 g în aluat, 5 g pe cartofi',
      ),
    },
    {
      ingredient: 'malt-vinegar',
      quantity: 60,
      unit: 'ml',
      optional: true,
      note: t('for sprinkling', 'pentru stropit'),
    },
    {
      ingredient: 'lemon',
      quantity: 2,
      unit: 'pcs',
      note: t('cut into wedges', 'tăiate felii'),
    },
  ],
  steps: [
    {
      key: 'cut',
      text: t(
        'Peel the potatoes, or scrub them and leave the skin on, and cut them into chips about 1.5 cm thick.',
        'Curăță cartofii de coajă sau spală-i bine și lasă coaja, apoi taie-i în bețe groase de aproximativ 1,5 cm.',
      ),
    },
    {
      key: 'soak',
      text: t(
        'Rinse the chips in a bowl of cold water, then leave them in fresh cold water for 30 minutes to wash off the surface starch.',
        'Clătește cartofii într-un bol cu apă rece, apoi lasă-i 30 de minute în apă rece proaspătă, ca să se spele amidonul de la suprafață.',
      ),
      timerSeconds: 1800,
    },
    {
      key: 'dry',
      text: t(
        'Drain the chips and dry them thoroughly in clean tea towels. Wet chips make the hot oil spit and bubble over.',
        'Scurge cartofii și șterge-i bine în prosoape curate de bucătărie. Cartofii uzi fac uleiul fierbinte să stropească și să dea pe dinafară.',
      ),
    },
    {
      key: 'pot',
      text: t(
        'Set a heavy, deep pot of at least 6 litres on a steady hob and pour in the oil: the pot must be no more than a third full. Clip a cooking thermometer to the side and heat the oil to 135 °C, keeping it between 130 and 140 °C. Stay by the hob from now until the heat is off.',
        'Pune pe aragaz, pe o suprafață stabilă, o oală grea și adâncă de cel puțin 6 litri și toarnă uleiul: oala trebuie să fie plină cel mult o treime. Prinde un termometru de gătit pe margine și încălzește uleiul la 135 °C, ținându-l între 130 și 140 °C. Rămâi lângă aragaz de acum până închizi focul.',
      ),
    },
    {
      key: 'first-fry-1',
      text: t(
        'Lower half of the chips into the oil in a frying basket, slowly and away from you. Fry for 8 to 10 minutes at 130 to 140 °C, until a chip squashes softly between two spoons but is still pale.',
        'Coboară jumătate din cartofi în ulei, într-un coș de prăjit, încet și departe de tine. Prăjește-i 8-10 minute la 130-140 °C, până când un cartof se strivește ușor între două linguri, dar e încă palid.',
      ),
      timerSeconds: 540,
    },
    {
      key: 'drain-1',
      text: t(
        'Lift the basket out, tip the chips onto a wire rack and leave them uncovered. Bring the oil back to 130 to 140 °C.',
        'Scoate coșul, răstoarnă cartofii pe un grătar și lasă-i descoperiți. Adu uleiul înapoi la 130-140 °C.',
      ),
    },
    {
      key: 'first-fry-2',
      text: t(
        'Fry the second half of the chips in the same way for 8 to 10 minutes, until soft but still pale, then drain them on the rack. They can wait there for up to an hour.',
        'Prăjește a doua jumătate de cartofi la fel, 8-10 minute, până se înmoaie dar rămân palizi, apoi scurge-i pe grătar. Pot aștepta acolo până la o oră.',
      ),
      timerSeconds: 540,
    },
    {
      key: 'oven',
      text: t(
        'Heat the oven to 100 °C and put a baking tray fitted with a wire rack inside. It warms while the oil climbs to 180 °C in the next step.',
        'Încălzește cuptorul la 100 °C și pune înăuntru o tavă cu un grătar. Se încălzește în timp ce uleiul urcă la 180 °C, în pasul următor.',
      ),
    },
    {
      key: 'heat',
      text: t(
        'Turn the heat up and bring the oil to 180 °C on the thermometer, which takes about 8 minutes.',
        'Mărește focul și adu uleiul la 180 °C pe termometru, ceea ce durează aproximativ 8 minute.',
      ),
    },
    {
      key: 'fish-prep',
      text: t(
        'While the oil heats, pat the fillets very dry with kitchen paper, sprinkle them with 2 g of the salt and dust them with the 40 g of flour, shaking off the excess.',
        'În timp ce se încinge uleiul, șterge fileurile foarte bine cu hârtie de bucătărie, presară-le cu 2 g din sare și pudrează-le cu cele 40 g de făină, scuturând surplusul.',
      ),
    },
    {
      key: 'batter',
      text: t(
        'Just before frying, whisk the 200 g of flour, baking powder and 3 g of salt in a bowl, pour in the ice-cold beer and whisk briefly until it is the thickness of double cream. A few small lumps are fine.',
        'Chiar înainte de prăjit, amestecă într-un bol cele 200 g de făină, praful de copt și 3 g de sare, toarnă berea foarte rece și amestecă scurt, până aluatul are consistența smântânii groase. Câteva cocoloașe mici nu strică.',
      ),
    },
    {
      key: 'fish-1',
      text: t(
        'With the oil at 180 °C, hold one fillet by one end, dip it in the batter and let the excess drip off. Lower it slowly into the oil away from you, and do the same with a second fillet. Fry for 6 to 8 minutes, turning once, until deep golden.',
        'Cu uleiul la 180 °C, ține un file de un capăt, înmoaie-l în aluat și lasă surplusul să se scurgă. Coboară-l încet în ulei, departe de tine, și fă la fel cu al doilea file. Prăjește 6-8 minute, întorcând o dată, până se rumenesc intens.',
      ),
      timerSeconds: 420,
    },
    {
      key: 'check',
      text: t(
        'Lift out the first fillet and check the thickest part: the flesh must be opaque all through and flake easily, and a probe thermometer must read 63 °C. If not, return it to the oil for a minute or two. Then put both fillets on the rack in the oven.',
        'Scoate primul file și verifică partea cea mai groasă: carnea trebuie să fie opacă peste tot și să se desfacă ușor în foi, iar un termometru cu sondă să arate 63 °C. Dacă nu, pune-l înapoi în ulei un minut sau două. Apoi pune ambele fileuri pe grătarul din cuptor.',
      ),
    },
    {
      key: 'fish-2',
      text: t(
        'Bring the oil back to 180 °C and fry the other two fillets the same way for 6 to 8 minutes, turning once. Check the thickest part of the first one as before, then put them in the oven.',
        'Adu uleiul înapoi la 180 °C și prăjește celelalte două fileuri la fel, 6-8 minute, întorcând o dată. Verifică partea cea mai groasă a primului, ca înainte, apoi pune-le în cuptor.',
      ),
      timerSeconds: 420,
    },
    {
      key: 'second-fry-1',
      text: t(
        'Bring the oil to 180 °C again and fry half of the chips for 3 to 4 minutes, until deep golden and crisp. Lift them out, let them drain for a moment, then put them on the rack in the oven and sprinkle them at once with 2.5 g of the chip salt.',
        'Adu din nou uleiul la 180 °C și prăjește jumătate din cartofi 3-4 minute, până se rumenesc intens și devin crocanți. Scoate-i, lasă-i o clipă să se scurgă, apoi pune-i pe grătarul din cuptor și presară-i imediat cu 2,5 g din sarea pentru cartofi.',
      ),
      timerSeconds: 210,
    },
    {
      key: 'second-fry-2',
      text: t(
        'Bring the oil back to 180 °C and fry the rest of the chips for 3 to 4 minutes in the same way, and sprinkle them at once with the last 2.5 g of salt.',
        'Adu uleiul înapoi la 180 °C și prăjește restul cartofilor 3-4 minute, la fel, și presară-i imediat cu ultimele 2,5 g de sare.',
      ),
      timerSeconds: 210,
    },
    {
      key: 'heat-off',
      text: t(
        'Turn the heat off, put the lid on the pot and leave it where it is to cool.',
        'Oprește focul, pune capacul pe oală și las-o unde este, să se răcească.',
      ),
    },
    {
      key: 'serve',
      text: t(
        'Tip all the chips into a warm bowl and serve them straight away with the fish, the lemon wedges and the malt vinegar.',
        'Pune toți cartofii într-un bol cald și servește-i pe loc cu peștele, feliile de lămâie și oțetul de malț.',
      ),
    },
    {
      key: 'oil-cool',
      text: t(
        'Leave the oil until it is completely cold, which takes several hours. Then strain it through a fine sieve into a lidded container to use once more for fish, or pour it into a sealed container and put it in the bin. Never pour it down the sink.',
        'Lasă uleiul până se răcește complet, ceea ce durează câteva ore. Apoi strecoară-l printr-o sită deasă într-un recipient cu capac, ca să-l mai folosești o dată pentru pește, sau toarnă-l într-un recipient închis și pune-l la gunoi. Nu-l turna niciodată în chiuvetă.',
      ),
    },
  ],
  tips: [
    t(
      'Ask for thick, centre-cut fillets: thin tail pieces overcook before the batter colours. Haddock works as well as cod.',
      'Alege fileuri groase, din mijlocul peștelui: bucățile subțiri de la coadă se gătesc prea mult până se rumenește aluatul. Merge la fel de bine și cu eglefin.',
    ),
    t(
      'Fry in small batches and wait for the thermometer to read 180 °C again before the next one. Cold oil gives greasy, pale results.',
      'Prăjește în loturi mici și așteaptă ca termometrul să arate din nou 180 °C înainte de următorul. Uleiul prea rece dă un rezultat gras și palid.',
    ),
    t(
      'Salt the chips the second they leave the oil: salt sticks to the hot surface and falls off once they are cool.',
      'Sărează cartofii imediat ce ies din ulei: sarea se prinde de suprafața fierbinte și cade după ce se răcesc.',
    ),
    t(
      'Keep fried food on a wire rack, uncovered, while you finish the batches. A lid, foil or a plate traps steam and softens the crust.',
      'Ține mâncarea prăjită pe un grătar, descoperită, cât timp termini loturile. Un capac, folie sau o farfurie rețin aburul și înmoaie crusta.',
    ),
  ],
  stepTips: [
    {
      step: 'pot',
      text: t(
        'Keep the pot lid within reach. If the oil smokes, turn the heat off: it is too hot. If it catches fire, do not move the pot. If it is safe, slide the lid or a damp tea towel on, turn the heat off and leave it covered until cold. Never throw water on it. If the fire does not go out at once, get everyone out, close the door and call 112.',
        'Ține capacul oalei la îndemână. Dacă uleiul fumegă, oprește focul: e prea încins. Dacă ia foc, nu muta oala. Dacă ești în siguranță, așază capacul sau un prosop de bucătărie umed peste ea, oprește focul și las-o acoperită până se răcește complet. Nu arunca niciodată apă peste ulei. Dacă focul nu se stinge imediat, scoate pe toată lumea din casă, închide ușa și sună la 112.',
      ),
    },
    {
      step: 'batter',
      text: t(
        'Keep the beer in the fridge until the last moment and do not rest the batter: the cold and the bubbles are what make it light and crisp.',
        'Ține berea la frigider până în ultimul moment și nu lăsa aluatul să stea: frigul și bulele îl fac ușor și crocant.',
      ),
    },
    {
      step: 'check',
      text: t(
        'Fish is cooked at 63 °C; it keeps cooking a little in the oven, so do not push it much past that.',
        'Peștele e gătit la 63 °C; mai continuă să se gătească puțin în cuptor, așa că nu-l ține mult peste această temperatură.',
      ),
    },
  ],
  nutritionNote: t(
    'Cod is lean and a good source of protein, and potatoes give filling carbohydrates. Deep-frying adds a lot of fat to both the batter and the chips, and the salt on the chips, plus refined flour with little fibre, makes it a meal for now and then. Lemon and a crunchy salad lighten it.',
    'Codul e slab și o sursă bună de proteine, iar cartofii dau carbohidrați care satură. Prăjirea în baie de ulei adaugă multă grăsime în aluat și în cartofi, iar sarea de pe cartofi și făina albă, cu puține fibre, fac din el o masă pentru din când în când. Lămâia și o salată crocantă îl fac mai ușor.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Tartar sauce', 'Sos tartar'),
      reason: t(
        'The creamy, tangy sauce with pickles and capers cuts through the hot batter and the fish.',
        'Sosul cremos și acrișor, cu murături și capere, taie din grăsimea aluatului fierbinte și completează peștele.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'tartar-sauce',
    },
    {
      kind: 'food',
      label: t('Coleslaw', 'Coleslaw (salată de varză și morcov cu maioneză)'),
      reason: t(
        'A cool, crunchy side that sits against the hot, crisp batter and brings some vegetables to the plate.',
        'Un acompaniament rece și crocant, care contrastează cu aluatul cald și aduce niște legume în farfurie.',
      ),
      principle: 'contrast_texture',
      recipe: 'coleslaw',
    },
    {
      kind: 'food',
      label: t('Pickled cucumbers', 'Castraveți murați'),
      reason: t(
        'Their sharp acidity refreshes the mouth between fried bites.',
        'Aciditatea lor ascuțită împrospătează gura între îmbucăturile prăjite.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'pickled-cucumbers',
    },
    {
      kind: 'drink',
      label: t('Sparkling water', 'Apă minerală'),
      reason: t(
        'The bubbles clear the fat from the mouth between bites.',
        'Bulele curăță grăsimea din gură între îmbucături.',
      ),
      principle: 'cleanses_palate',
      ingredient: 'sparkling-water',
    },
  ],
  eatingMoments: [
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'Hot, crisp and filling, a comforting meal for a cold day.',
        'Fierbinte, crocant și săturător, o masă reconfortantă într-o zi rece.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Deep-fried food sits heavy in the stomach during exercise.',
        'Mâncarea prăjită în baie de ulei cade greu la stomac în timpul efortului.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'A heavy, fatty meal late at night can disturb sleep.',
        'O masă grasă și grea târziu seara poate strica somnul.',
      ),
    },
  ],
  variants: [
    {
      slug: 'fish-and-chips-romanian',
      cuisine: 'romanian',
      title: t(
        'Fried crucian carp with mujdei (caras prăjit cu mujdei)',
        'Caras prăjit cu mujdei',
      ),
      servings: 4,
      prepMinutes: 30,
      cookMinutes: 40,
      difficulty: 'medium',
      hideBaseTips: [0, 1, 2],
      lines: [
        {
          ingredient: 'crucian-carp',
          quantity: 1400,
          unit: 'g',
          note: t(
            'about 6 whole fish of 220 to 250 g, gutted and scaled',
            'aproximativ 6 pești întregi de 220-250 g, eviscerați și curățați de solzi',
          ),
        },
        {
          ingredient: 'salt',
          quantity: 15,
          unit: 'g',
          note: t(
            '12 g on the fish, 3 g in the mujdei',
            '12 g pe pește, 3 g în mujdei',
          ),
        },
        {
          ingredient: 'flour',
          quantity: 80,
          unit: 'g',
          note: t('for rolling the fish', 'pentru trecut peștele'),
        },
        {
          ingredient: 'sunflower-oil',
          key: 'oil-frying',
          quantity: 300,
          unit: 'ml',
          note: t('for frying', 'pentru prăjit'),
        },
        {
          ingredient: 'garlic',
          quantity: 30,
          unit: 'g',
          note: t('about 6 cloves', 'aproximativ 6 căței'),
        },
        {
          ingredient: 'still-water',
          quantity: 0.06,
          unit: 'l',
          note: t('cold, for the mujdei', 'rece, pentru mujdei'),
        },
        {
          ingredient: 'sunflower-oil',
          key: 'oil-mujdei',
          quantity: 20,
          unit: 'ml',
          note: t('for the mujdei', 'pentru mujdei'),
        },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          optional: true,
          note: t('cut into wedges', 'tăiată felii'),
        },
      ],
      steps: [
        {
          key: 'slash',
          text: t(
            'Rinse the fish inside and out. Cut slashes across both sides every 1.5 cm, down almost to the backbone but not through it.',
            'Spală peștii pe dinăuntru și pe dinafară. Crestează-i pe ambele părți, din 1,5 în 1,5 cm, aproape până la os, dar fără să-l tai.',
          ),
        },
        {
          key: 'salt',
          text: t(
            'Rub the fish with 12 g of the salt, inside and into the slashes. Cover them and leave them in the fridge for 15 minutes.',
            'Freacă peștii cu 12 g din sare, pe dinăuntru și în crestături. Acoperă-i și lasă-i 15 minute la frigider.',
          ),
          timerSeconds: 900,
        },
        {
          key: 'mujdei',
          text: t(
            'While the fish rest, crush the garlic with the remaining 3 g of salt in a mortar to a smooth paste. Stir in the cold water a little at a time, then the 20 ml of oil. Cover it and keep it in the fridge.',
            'Cât stau peștii, pisează usturoiul cu cele 3 g de sare rămase, în piuă, până face o pastă fină. Adaugă treptat apa rece, apoi cei 20 ml de ulei. Acoperă mujdeiul și ține-l la frigider.',
          ),
        },
        {
          key: 'oven',
          text: t(
            'Heat the oven to 100 °C and put a baking tray fitted with a wire rack inside.',
            'Încălzește cuptorul la 100 °C și pune înăuntru o tavă cu un grătar.',
          ),
        },
        {
          key: 'dry',
          text: t(
            'Pat the fish very dry with kitchen paper, inside and in the slashes, then roll them in the flour, pressing it into the slashes and shaking off the excess.',
            'Șterge peștii foarte bine cu hârtie de bucătărie, pe dinăuntru și în crestături, apoi trece-i prin făină, apăsând-o în crestături și scuturând surplusul.',
          ),
        },
        {
          key: 'heat',
          text: t(
            'Pour the 300 ml of oil into a heavy 30 cm pan, a thin layer of about 5 mm. Heat it over medium-high heat until it shimmers and the handle of a wooden spoon dipped in it sizzles steadily; do not let it smoke. Stay by the hob while you fry.',
            'Toarnă cei 300 ml de ulei într-o tigaie grea de 30 cm, un strat subțire de vreo 5 mm. Încălzește-l la foc mediu spre mare până se încinge și mânerul unei linguri de lemn băgat în el sfârâie constant; nu-l lăsa să fumege. Rămâi lângă aragaz cât prăjești.',
          ),
        },
        {
          key: 'fry-1',
          text: t(
            'Lay 2 or 3 fish into the oil one at a time, away from you, not touching. Fry for 5 to 6 minutes, until the underside is deep golden.',
            'Pune în ulei 2-3 pești, pe rând, departe de tine, fără să se atingă. Prăjește-i 5-6 minute, până se rumenesc intens pe partea de jos.',
          ),
          timerSeconds: 330,
        },
        {
          key: 'fry-2',
          text: t(
            'Turn the fish carefully with a fish slice and fry the other side for 5 to 6 minutes, until deep golden with crisp slashes.',
            'Întoarce peștii cu grijă, cu o spatulă, și prăjește-i pe cealaltă parte 5-6 minute, până se rumenesc intens și crestăturile devin crocante.',
          ),
          timerSeconds: 330,
        },
        {
          key: 'check',
          text: t(
            'Check the first fish at the thickest part by the backbone: the flesh must be opaque and flake easily, and a probe thermometer must read 63 °C. If not, fry it a minute or two longer. Then put the fish on the rack in the oven.',
            'Verifică primul pește în locul cel mai gros, lângă coloană: carnea trebuie să fie opacă și să se desfacă ușor, iar un termometru cu sondă să arate 63 °C. Dacă nu, mai prăjește-l un minut sau două. Apoi pune peștii pe grătarul din cuptor.',
          ),
        },
        {
          key: 'fry-rest',
          text: t(
            'Fry the remaining fish in batches the same way, letting the oil get back to the same sizzle before each batch and checking the first fish of each batch as before.',
            'Prăjește restul peștilor în loturi, la fel, lăsând uleiul să se încingă din nou ca înainte de fiecare lot și verificând primul pește din fiecare lot ca înainte.',
          ),
        },
        {
          key: 'heat-off',
          text: t(
            'Turn the heat off and leave the pan where it is.',
            'Oprește focul și lasă tigaia unde este.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Serve the fish hot, with the mujdei on the side or spooned over, and the lemon wedges.',
            'Servește peștele fierbinte, cu mujdeiul alături sau turnat peste, și cu felii de lămâie.',
          ),
        },
        {
          key: 'oil-cool',
          text: t(
            'Leave the oil until it is completely cold, then pour it into a sealed container and put it in the bin. Never pour it down the sink.',
            'Lasă uleiul până se răcește complet, apoi toarnă-l într-un recipient închis și pune-l la gunoi. Nu-l turna niciodată în chiuvetă.',
          ),
        },
      ],
      tips: [
        t(
          'Crucian carp has many small bones. For children, older people or anyone who struggles to spot bones, lift the flesh off the backbone for them and check it with a fork before they eat.',
          'Carasul are multe oase mici. Pentru copii, vârstnici sau oricine are probleme în a observa oasele, desprinde tu carnea de pe coloană și verific-o cu furculița înainte să mănânce.',
        ),
        t(
          'Mujdei keeps in the fridge, covered, for 1 to 2 days; stir it before serving. Make it fresh if you can, as the garlic gets harsher over time.',
          'Mujdeiul se păstrează acoperit la frigider 1-2 zile; amestecă-l înainte de servire. Fă-l proaspăt dacă poți, pentru că usturoiul devine mai iute în timp.',
        ),
      ],
      stepTips: [
        {
          step: 'heat',
          text: t(
            'Keep a lid within reach. If the oil smokes, turn the heat off: it is too hot. If it catches fire, do not move the pan. If it is safe, slide the lid or a damp tea towel on, turn the heat off and leave it covered until cold. Never throw water on it. If the fire does not go out at once, get everyone out, close the door and call 112.',
            'Ține un capac la îndemână. Dacă uleiul fumegă, oprește focul: e prea încins. Dacă ia foc, nu muta tigaia. Dacă ești în siguranță, așază capacul sau un prosop de bucătărie umed peste ea, oprește focul și las-o acoperită până se răcește complet. Nu arunca niciodată apă peste ulei. Dacă focul nu se stinge imediat, scoate pe toată lumea din casă, închide ușa și sună la 112.',
          ),
        },
        {
          step: 'slash',
          text: t(
            'The slashes cut through the fine bones, so they crisp in the oil and are easier to eat.',
            'Crestăturile taie oasele fine, așa că se rumenesc și devin mai ușor de mâncat.',
          ),
        },
      ],
      nutritionNote: t(
        'Crucian carp is a lean source of protein, and sunflower oil is mostly unsaturated fat. Frying still adds fat, the salt used on the fish is easy to overdo, and raw garlic in the mujdei is strong. Serve with a salad to add fibre and vegetables.',
        'Carasul e o sursă slabă de proteine, iar uleiul de floarea-soarelui are mai ales grăsimi nesaturate. Prăjirea adaugă totuși grăsime, sarea de pe pește se pune ușor în exces, iar usturoiul crud din mujdei e iute. Servește cu o salată, pentru fibre și legume.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t(
            'Mămăligă with cheese and sour cream',
            'Mămăligă cu brânză și smântână',
          ),
          reason: t(
            'Hot, soft mămăligă goes with fried fish and mujdei; serve it plain, without the cheese and sour cream.',
            'Mămăliga caldă și moale se potrivește cu peștele prăjit și cu mujdeiul; servește-o simplă, fără brânză și smântână.',
          ),
          principle: 'regional_tradition',
          recipe: 'mamaliga',
        },
        {
          kind: 'food',
          label: t(
            'Romanian white cabbage salad with dill (salată de varză)',
            'Salată de varză albă cu mărar',
          ),
          reason: t(
            'The sharp, vinegary salad cuts through the fried fish.',
            'Salata acrișoară, cu oțet, taie din grăsimea peștelui prăjit.',
          ),
          principle: 'acid_cuts_fat',
          recipe: 'coleslaw-romanian',
        },
        {
          kind: 'drink',
          label: t('Beer', 'Bere'),
          reason: t(
            'Cold, bubbly beer refreshes the mouth between bites of fried fish.',
            'Berea rece și spumoasă împrospătează gura între îmbucăturile de pește prăjit.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
      ],
      eatingMoments: [
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Fish gives protein; with mămăligă it also refills carbohydrates.',
            'Peștele dă proteine; cu mămăligă reface și carbohidrații.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Fried fish with garlic sits heavy in the stomach during exercise.',
            'Peștele prăjit cu usturoi cade greu la stomac în timpul efortului.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Fried food and raw garlic can weigh on the stomach before bed.',
            'Mâncarea prăjită și usturoiul crud pot îngreuna stomacul înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'fish-and-chips-scandinavian',
      cuisine: 'scandinavian',
      title: t(
        'Danish pan-fried breaded plaice with remoulade (stegt rødspætte)',
        'Cambulă pane prăjită în unt, cu remuladă, ca în Danemarca (stegt rødspætte)',
      ),
      servings: 4,
      prepMinutes: 10,
      cookMinutes: 32,
      difficulty: 'easy',
      hideBaseTips: [0, 1, 2],
      lines: [
        {
          ingredient: 'plaice-fillet',
          quantity: 600,
          unit: 'g',
          note: t(
            'four fillets of about 150 g',
            'patru fileuri de aproximativ 150 g',
          ),
        },
        {
          ingredient: 'salt',
          quantity: 12,
          unit: 'g',
          note: t(
            '4 g on the fish, 8 g in the potato water',
            '4 g pe pește, 8 g în apa de la cartofi',
          ),
        },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
        { ingredient: 'flour', quantity: 60, unit: 'g' },
        {
          ingredient: 'eggs',
          quantity: 2,
          unit: 'pcs',
          note: t('beaten', 'bătute'),
        },
        { ingredient: 'breadcrumbs', quantity: 100, unit: 'g' },
        { ingredient: 'butter', quantity: 60, unit: 'g' },
        { ingredient: 'sunflower-oil', quantity: 30, unit: 'ml' },
        {
          ingredient: 'potato',
          quantity: 0.8,
          unit: 'kg',
          note: t(
            'small new potatoes, scrubbed',
            'cartofi noi mici, spălați bine',
          ),
        },
        { ingredient: 'still-water', quantity: 1, unit: 'l' },
        {
          ingredient: 'curly-parsley',
          quantity: 10,
          unit: 'g',
          optional: true,
          note: t('chopped', 'tocat mărunt'),
        },
        { ingredient: 'remoulade', quantity: 120, unit: 'g' },
        {
          ingredient: 'lemon',
          quantity: 1,
          unit: 'pcs',
          note: t('cut into wedges', 'tăiată felii'),
        },
      ],
      steps: [
        {
          key: 'potatoes',
          text: t(
            'Put the potatoes in a pan with the water and 8 g of the salt, bring to the boil and simmer for 15 to 20 minutes, until a knife slides in easily. Drain and keep them covered and warm.',
            'Pune cartofii într-o oală cu apa și 8 g din sare, adu la fierbere și fierbe-i la foc mic 15-20 de minute, până când un cuțit intră ușor în ei. Scurge-i și ține-i acoperiți și calzi.',
          ),
          timerSeconds: 1080,
        },
        {
          key: 'stations',
          text: t(
            'While the potatoes come to the boil, put the flour and pepper on one plate, the beaten eggs in a shallow bowl and the breadcrumbs on a third plate.',
            'Până dau cartofii în clocot, pune făina și piperul pe o farfurie, ouăle bătute într-un bol lat și pesmetul pe o a treia farfurie.',
          ),
        },
        {
          key: 'coat',
          text: t(
            'Pat the fillets very dry with kitchen paper and sprinkle them with 4 g of salt. Dip each one in the flour, then the egg, then press it firmly into the breadcrumbs, and lay it on a plate.',
            'Șterge fileurile foarte bine cu hârtie de bucătărie și presară-le cu 4 g de sare. Trece fiecare file prin făină, apoi prin ou, apoi apasă-l bine în pesmet și pune-l pe o farfurie.',
          ),
        },
        {
          key: 'oven',
          text: t(
            'While the potatoes simmer, heat the oven to 100 °C and put a baking tray fitted with a wire rack inside.',
            'Cât fierb cartofii, încălzește cuptorul la 100 °C și pune înăuntru o tavă cu un grătar.',
          ),
        },
        {
          key: 'melt',
          text: t(
            'When the potatoes have simmered for about 8 minutes, melt 30 g of the butter with half of the oil in a 28 cm frying pan over medium heat, until the butter foams and the foam begins to settle. Stay by the hob while you fry.',
            'După ce cartofii au fiert vreo 8 minute, topește 30 g din unt cu jumătate din ulei într-o tigaie de 28 cm, la foc mediu, până face spumă și spuma începe să se așeze. Rămâi lângă aragaz cât prăjești.',
          ),
        },
        {
          key: 'fry-1',
          text: t(
            'Lay two fillets in the pan, away from you, and fry for 2 to 3 minutes, until the underside is golden.',
            'Pune două fileuri în tigaie, departe de tine, și prăjește-le 2-3 minute, până se rumenesc pe partea de jos.',
          ),
          timerSeconds: 150,
        },
        {
          key: 'fry-2',
          text: t(
            'Turn them carefully and fry the other side for 2 to 3 minutes, until golden. The fish is done when it is opaque all through and flakes easily at the thickest part (63 °C).',
            'Întoarce-le cu grijă și prăjește-le pe cealaltă parte 2-3 minute, până se rumenesc. Peștele e gata când e opac peste tot și se desface ușor în locul cel mai gros (63 °C).',
          ),
          timerSeconds: 150,
        },
        {
          key: 'rest',
          text: t(
            'Lift the first two fillets onto the rack in the oven. Wipe the pan clean with kitchen paper, then fry the other two fillets with the remaining butter and oil in the same way, checking them for doneness as before.',
            'Pune primele două fileuri pe grătarul din cuptor. Șterge tigaia cu hârtie de bucătărie, apoi prăjește celelalte două fileuri cu untul și uleiul rămase, la fel, verificând dacă sunt gata ca înainte.',
          ),
        },
        {
          key: 'parsley',
          text: t(
            'Toss the warm potatoes with the chopped parsley, if using.',
            'Amestecă cartofii calzi cu pătrunjelul tocat, dacă folosești.',
          ),
        },
        {
          key: 'serve',
          text: t(
            'Serve the fish straight away with the potatoes, the remoulade and the lemon wedges.',
            'Servește peștele imediat, cu cartofii, remulada și feliile de lămâie.',
          ),
        },
      ],
      tips: [
        t(
          'Keep the heat at medium: if the butter turns dark brown, the crumbs taste bitter.',
          'Ține focul mediu: dacă untul se face maro închis, pesmetul capătă gust amar.',
        ),
      ],
      stepTips: [
        {
          step: 'coat',
          text: t(
            'Damp fish makes the coating slide off, so dry it first and press the crumbs on firmly.',
            'Peștele ud face pesmetul să se desprindă, așa că usucă-l bine și apasă pesmetul ferm.',
          ),
        },
      ],
      nutritionNote: t(
        'Plaice is a lean white fish with plenty of protein, and the boiled potatoes add filling carbohydrates. The butter brings saturated fat, the breadcrumbs add refined carbohydrates, and the remoulade adds more fat and some salt. Serve with a green salad for fibre.',
        'Cambula e un pește alb slab, bogat în proteine, iar cartofii fierți adaugă carbohidrați care satură. Untul aduce grăsimi saturate, pesmetul adaugă carbohidrați rafinați, iar remulada mai multă grăsime și puțină sare. Servește cu o salată verde, pentru fibre.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Pickled cucumbers', 'Castraveți murați'),
          reason: t(
            'Their sharp acidity cuts through the butter and the breadcrumbs.',
            'Aciditatea lor ascuțită taie din untul și pesmetul prăjit.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'pickled-cucumbers',
        },
        {
          kind: 'drink',
          label: t('Beer', 'Bere'),
          reason: t(
            'A cold, light beer clears the mouth between bites of buttery fish.',
            'O bere rece și ușoară curăță gura între îmbucăturile de pește cu unt.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'beer',
        },
      ],
      eatingMoments: [
        {
          moment: 'after-workout',
          polarity: 'good_for',
          reason: t(
            'Lean fish gives protein and the potatoes refill carbohydrates.',
            'Peștele slab dă proteine, iar cartofii refac rezerva de carbohidrați.',
          ),
        },
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Mild fish and boiled potatoes make a gentle midday meal.',
            'Peștele blând și cartofii fierți fac o masă de prânz fără îngreunare.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Fried, buttery food can sit heavy before bed.',
            'Mâncarea prăjită, cu unt, poate cădea greu înainte de culcare.',
          ),
        },
      ],
    },
  ],
};
