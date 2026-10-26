import { t, type BaseRecipeSeed } from '../recipe-seed-types';

// The Smørrebrød base is the hot open sandwich with liver pâté (lun leverpostej).
// Each Variant is a full Recipe with its own lines, steps and guidance; the
// base's Recipe-level Tips are inherited unless a Variant hides them.
export const smorrebrod: BaseRecipeSeed = {
  slug: 'smorrebrod',
  title: t(
    'Smørrebrød with warm liver pâté',
    'Smørrebrød cu pateu cald de ficat',
  ),
  servings: 4,
  prepMinutes: 15,
  cookMinutes: 12,
  difficulty: 'easy',
  lines: [
    {
      ingredient: 'rye-bread',
      quantity: 1,
      unit: 'pcs',
      note: t(
        'sliced thinly, 8 slices of about 1 cm',
        'tăiată subțire, 8 felii de aproximativ 1 cm',
      ),
    },
    {
      ingredient: 'butter',
      key: 'butter-bread',
      quantity: 40,
      unit: 'g',
      note: t('soft, for the bread', 'moale, pentru pâine'),
    },
    {
      ingredient: 'liver-pate',
      quantity: 280,
      unit: 'g',
      note: t('about 35 g per slice', 'aproximativ 35 g pe felie'),
    },
    {
      ingredient: 'bacon',
      quantity: 160,
      unit: 'g',
      note: t('8 rashers', '8 felii'),
    },
    {
      ingredient: 'button-mushrooms',
      quantity: 250,
      unit: 'g',
      note: t('sliced', 'tăiate felii'),
    },
    {
      ingredient: 'butter',
      key: 'butter-mushrooms',
      quantity: 20,
      unit: 'g',
      note: t('for the mushrooms', 'pentru ciuperci'),
    },
    {
      ingredient: 'canned-beetroot',
      quantity: 120,
      unit: 'g',
      note: t('sliced, to serve', 'felii, pentru servire'),
    },
    {
      ingredient: 'pickled-cucumbers',
      quantity: 80,
      unit: 'g',
      note: t('sliced, to serve', 'felii, pentru servire'),
    },
    {
      ingredient: 'parsley',
      quantity: 10,
      unit: 'g',
      note: t('finely chopped', 'tocat mărunt'),
    },
    { ingredient: 'salt', quantity: 1, unit: 'g' },
    { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
  ],
  steps: [
    {
      key: 'prep-bread',
      text: t(
        'Heat the oven to 200 °C (180 °C fan). Butter each rye slice right out to the edges, spread about 35 g of pâté over it, and lay the slices side by side on a baking tray.',
        'Încinge cuptorul la 200 °C (180 °C cu ventilator). Unge fiecare felie de pâine de secară cu unt până la margini, întinde deasupra aproximativ 35 g de pateu și așază feliile una lângă alta pe o tavă.',
      ),
    },
    {
      key: 'bake',
      text: t(
        'Bake the slices for 10 minutes, until the pâté is steaming hot all the way through and the bread edges have turned a little crisp.',
        'Coace feliile 10 minute, până când pateul scoate aburi și e fierbinte în toată grosimea, iar marginile pâinii devin ușor crocante.',
      ),
      timerSeconds: 600,
    },
    {
      key: 'bacon',
      text: t(
        'While the bread bakes, lay the bacon in a cold frying pan, set it over medium heat and fry for 8 minutes, turning once, until deep golden and crisp. Lift it onto kitchen paper.',
        'Cât se coace pâinea, pune baconul într-o tigaie rece, așaz-o la foc mediu și prăjește 8 minute, întorcând o dată, până devine auriu intens și crocant. Scoate-l pe hârtie absorbantă.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'mushrooms',
      text: t(
        'In a second pan, melt the 20 g of butter over medium-high heat, add the mushrooms in one layer and fry for 8 minutes, stirring now and then, until golden brown and no liquid is left in the pan. Season with salt and pepper at the end.',
        'Într-o a doua tigaie topește cele 20 g de unt la foc mediu-mare, adaugă ciupercile într-un singur strat și prăjește-le 8 minute, amestecând din când în când, până se rumenesc și nu mai rămâne lichid în tigaie. Sărează și piperează abia la final.',
      ),
      timerSeconds: 480,
    },
    {
      key: 'top',
      text: t(
        'Break each bacon rasher in two and lay it over the hot pâté, then pile the mushrooms on top. Scatter with the parsley.',
        'Rupe fiecare felie de bacon în două și așaz-o peste pateul fierbinte, apoi pune ciupercile deasupra. Presară pătrunjelul.',
      ),
    },
    {
      key: 'serve',
      text: t(
        'Serve at once, two slices per person, with the sliced beetroot and pickled cucumbers on the side.',
        'Servește imediat, câte două felii de persoană, cu feliile de sfeclă murată și castraveții murați alături.',
      ),
    },
  ],
  tips: [
    t(
      'Butter the rye right to the edges, so the edges crisp up in the oven instead of drying out.',
      'Unge pâinea de secară cu unt până la margini, ca marginile să se rumenească crocant în cuptor, nu să se usuce.',
    ),
    t(
      'Add the toppings only just before serving; an open sandwich that waits goes soft and does not keep.',
      'Pune ingredientele de deasupra abia înainte de servire; un sandviș deschis care așteaptă se înmoaie și nu se păstrează.',
    ),
  ],
  stepTips: [
    {
      step: 'bacon',
      text: t(
        'Start the bacon in a cold pan so the fat melts out slowly and the rashers crisp instead of curling and burning.',
        'Începe baconul într-o tigaie rece, ca grăsimea să se topească treptat, iar feliile să se rumenească crocant în loc să se încrețească și să se ardă.',
      ),
    },
    {
      step: 'mushrooms',
      text: t(
        'Do not crowd the pan or salt early: crowded or salted mushrooms release water and stew instead of browning.',
        'Nu aglomera tigaia și nu săra devreme: ciupercile îngrămădite sau sărate din start elimină apă și se fierb în loc să se rumenească.',
      ),
    },
  ],
  nutritionNote: t(
    'Filling, with protein from the pâté and fibre from the rye; the bacon, pâté and butter bring a lot of saturated fat and salt, and the pickles add more salt. One slice with the mushrooms and beetroot makes a lighter lunch than two.',
    'Săturător, cu proteine din pateu și fibre din secară; baconul, pateul și untul aduc multe grăsimi saturate și sare, iar murăturile adaugă și mai multă sare. O felie cu ciuperci și sfeclă face un prânz mai ușor decât două.',
  ),
  pairings: [
    {
      kind: 'food',
      label: t('Pickled beetroot', 'Sfeclă murată'),
      reason: t(
        'Its sharp sweetness balances the fatty pâté and bacon.',
        'Dulceața ei acrișoară echilibrează gustul gras al pateului și al baconului.',
      ),
      principle: 'acid_cuts_fat',
      ingredient: 'canned-beetroot',
    },
    {
      kind: 'food',
      label: t(
        'Cucumber salad (agurkesalat)',
        'Salată de castraveți (agurkesalat)',
      ),
      reason: t(
        'Thin, sweet-sour cucumber slices are the usual cool, crisp side to hot pâté.',
        'Felii subțiri de castravete dulce-acrișor, garnitura răcoroasă și crocantă obișnuită lângă pateul cald.',
      ),
      principle: 'contrast_texture',
      ingredient: 'cucumber',
    },
    {
      kind: 'food',
      label: t('Cold smørrebrød selection', 'Selecție de smørrebrød rece'),
      reason: t(
        'A warm open sandwich next to herring and egg-and-shrimp rounds makes a full Danish lunch table.',
        'Un sandviș deschis cald lângă heringi și felii cu ou și creveți completează o masă daneză de prânz.',
      ),
      principle: 'regional_tradition',
      recipe: 'appetizer-platter-scandinavian',
    },
    {
      kind: 'drink',
      label: t('Cold lager', 'Bere blondă rece'),
      reason: t(
        'The fizz and light bitterness refresh the palate between salty, fatty bites; beer is the usual Danish lunch drink.',
        'Bulele și amăreala ușoară împrospătează gustul între îmbucăturile sărate și grase; berea e băutura obișnuită la prânzul danez.',
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
        'One slice with the pickles on the side makes a quick, warm lunch.',
        'O felie cu murături alături face un prânz rapid și cald.',
      ),
    },
    {
      moment: 'cold-day',
      polarity: 'good_for',
      reason: t(
        'Hot pâté and crisp bacon are warming on a chilly day.',
        'Pateul fierbinte și baconul crocant încălzesc într-o zi rece.',
      ),
    },
    {
      moment: 'before-workout',
      polarity: 'avoid',
      reason: t(
        'Fatty and salty, it sits heavily in the stomach.',
        'Fiind gras și sărat, stă greu în stomac.',
      ),
    },
    {
      moment: 'late-evening',
      polarity: 'avoid',
      reason: t(
        'The fat and salt make it a heavy meal just before bed.',
        'Grăsimea și sarea îl fac o masă grea chiar înainte de culcare.',
      ),
    },
  ],
  variants: [
    {
      slug: 'smorrebrod-italian',
      cuisine: 'italian',
      // The bread is toasted and dipped in broth, not buttered.
      hideBaseTips: [0],
      title: t(
        'Crostini di fegatini (Tuscan chicken-liver crostini)',
        'Crostini toscani cu ficăței de pui',
      ),
      servings: 4,
      prepMinutes: 20,
      cookMinutes: 25,
      difficulty: 'medium',
      lines: [
        {
          ingredient: 'chicken-liver',
          quantity: 300,
          unit: 'g',
          note: t(
            'trimmed of sinew and any green spots, patted dry',
            'curățat de vinișoare și de pete verzi, tamponat uscat',
          ),
        },
        {
          ingredient: 'onion',
          quantity: 1,
          unit: 'pcs',
          note: t('finely chopped', 'tocată mărunt'),
        },
        {
          ingredient: 'butter',
          quantity: 40,
          unit: 'g',
          note: t(
            '20 g for cooking, 20 g to finish',
            '20 g la gătit, 20 g la final',
          ),
        },
        { ingredient: 'olive-oil', quantity: 30, unit: 'ml' },
        {
          ingredient: 'sage',
          quantity: 4,
          unit: 'g',
          note: t('about 6 leaves', 'aproximativ 6 frunze'),
        },
        {
          ingredient: 'white-wine',
          quantity: 80,
          unit: 'ml',
          note: t('dry', 'sec'),
        },
        {
          ingredient: 'capers',
          quantity: 15,
          unit: 'g',
          note: t('rinsed and chopped', 'clătite și tocate'),
        },
        {
          ingredient: 'anchovies',
          quantity: 15,
          unit: 'g',
          note: t('about 4 fillets', 'aproximativ 4 fileuri'),
        },
        {
          ingredient: 'chicken-stock',
          quantity: 150,
          unit: 'ml',
          note: t('hot, made up', 'fierbinte, diluată'),
        },
        {
          ingredient: 'country-bread',
          quantity: 1,
          unit: 'pcs',
          note: t(
            'sliced, 12 slices of about 1.5 cm',
            'tăiată, 12 felii de aproximativ 1,5 cm',
          ),
        },
        { ingredient: 'salt', quantity: 1, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 1, unit: 'g' },
      ],
      steps: [
        {
          key: 'onion',
          text: t(
            'Warm the olive oil and 20 g of the butter in a wide pan over medium-low heat. Add the onion and cook for 8 minutes, stirring, until soft and translucent but not browned.',
            'Încălzește uleiul de măsline și 20 g din unt într-o tigaie lată, la foc mic-mediu. Adaugă ceapa și gătește 8 minute, amestecând, până se înmoaie și devine translucidă, fără să se rumenească.',
          ),
          timerSeconds: 480,
        },
        {
          key: 'brown-livers',
          text: t(
            'Turn the heat to medium-high, add the sage and the livers and fry for 3 minutes, stirring, until the outside of the livers is browned.',
            'Mărește focul la mediu-mare, adaugă salvia și ficățeii și prăjește 3 minute, amestecând, până se rumenesc la exterior.',
          ),
          timerSeconds: 180,
        },
        {
          key: 'wine',
          text: t(
            'Pour in the wine and simmer for 6 minutes, until it has almost all evaporated. Cut the largest liver open: it must be grey-brown all the way through with no pink and no red juices. If not, cook a minute or two longer.',
            'Toarnă vinul și fierbe 6 minute, până se evaporă aproape complet. Taie ficățelul cel mai mare: trebuie să fie cenușiu-maroniu în toată grosimea, fără roz și fără suc roșu. Dacă nu, mai gătește un minut-două.',
          ),
          timerSeconds: 360,
        },
        {
          key: 'anchovies',
          text: t(
            'Stir in the anchovies and capers for 1 minute, until the anchovies melt into the pan. Take the pan off the heat and leave it for 5 minutes.',
            'Amestecă anșoa și caperele 1 minut, până se topesc anșoa în tigaie. Ia tigaia de pe foc și las-o 5 minute.',
          ),
          timerSeconds: 60,
        },
        {
          key: 'chop',
          text: t(
            'Tip the contents of the pan onto a board and chop with a knife into a coarse, spreadable paste; do not purée it. Return it to the pan with 50 ml of the stock and the remaining 20 g of butter, and warm gently, stirring, until it is hot and loose. Season with pepper and a little salt if needed; the anchovies and capers are already salty.',
            'Pune conținutul tigăii pe un tocător și toacă-l cu cuțitul într-o pastă grosieră, ușor de întins; nu o pasa. Pune-o înapoi în tigaie cu 50 ml din supă și cu cele 20 g de unt rămase și încălzește blând, amestecând, până devine fierbinte și moale. Condimentează cu piper și, dacă e nevoie, puțină sare; anșoa și caperele sunt deja sărate.',
          ),
        },
        {
          key: 'toast',
          text: t(
            'Meanwhile, toast the bread slices under a hot grill or in an oven heated to 200 °C for 4 to 5 minutes, turning once, until golden at the edges but still soft in the middle.',
            'Între timp, prăjește feliile de pâine sub grill încins sau în cuptorul încins la 200 °C timp de 4-5 minute, întorcându-le o dată, până se rumenesc la margini, dar rămân moi în mijloc.',
          ),
          timerSeconds: 270,
        },
        {
          key: 'dip',
          text: t(
            'Warm the remaining 100 ml of stock. Dip each toast in it for one second on each side, just to dampen the surface.',
            'Încălzește cei 100 ml de supă rămași. Înmoaie fiecare felie prăjită în ea o secundă pe fiecare parte, doar cât să se umezească suprafața.',
          ),
        },
        {
          key: 'spread',
          text: t(
            'Spread the warm paste generously over the dipped toasts and serve warm, or leave to come to room temperature as is common in Tuscany.',
            'Întinde generos pasta caldă peste feliile înmuiate și servește calde sau lasă-le să ajungă la temperatura camerei, cum se face adesea în Toscana.',
          ),
        },
      ],
      tips: [
        t(
          'Cook the livers through but no further: pink inside is unsafe, while too long makes them dry and grainy. The paste can be made a day ahead: cool it within 2 hours, keep it covered in the fridge (without the bread) for up to 2 days, and reheat it until steaming hot.',
          'Gătește ficățeii complet, dar nu mai mult: roz în interior nu e sigur, iar prea mult îi face uscați și sfărâmicioși. Pasta se poate face cu o zi înainte: răcește-o în maximum 2 ore, ține-o acoperită la frigider (fără pâine) cel mult 2 zile și reîncălzește-o până scoate aburi.',
        ),
      ],
      stepTips: [
        {
          step: 'brown-livers',
          text: t(
            'Livers spit hot fat: keep the pan wide, and dry the livers well so they brown instead of steaming.',
            'Ficatul stropește cu grăsime fierbinte: folosește o tigaie lată și usucă bine ficățeii, ca să se rumenească în loc să se fiarbă în aburi.',
          ),
        },
      ],
      nutritionNote: t(
        'Rich in protein; butter and olive oil share the fat, and the butter brings saturated fat, while the anchovies, capers and stock add a lot of salt. Three small crostini are a starter, and the bread brings the carbohydrate and little fibre.',
        'Bogat în proteine; untul și uleiul de măsline își împart grăsimea, iar untul aduce grăsimi saturate, în timp ce anșoa, caperele și supa adaugă multă sare. Trei crostini mici sunt un aperitiv, iar pâinea aduce carbohidrații și puține fibre.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Green olives', 'Măsline verzi'),
          reason: t(
            'Their brine and bitterness set off the rich liver.',
            'Saramura și amăreala lor pun în valoare ficatul bogat.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'olives',
        },
        {
          kind: 'food',
          label: t('Rocket', 'Rucola'),
          reason: t(
            'Its peppery bitterness balances the rich, soft paste.',
            'Gustul ei piperat și amar echilibrează pasta bogată și moale.',
          ),
          principle: 'bitter_balances_rich',
          ingredient: 'rocket',
        },
        {
          kind: 'drink',
          label: t('Light red wine', 'Vin roșu ușor'),
          reason: t(
            'A fresh, acidic red, in the style of Chianti, is the usual Tuscan partner and balances the richness.',
            'Un roșu proaspăt și acidulat, în stilul Chianti, e partenerul toscan obișnuit și echilibrează bogăția.',
          ),
          principle: 'acid_cuts_fat',
          ingredient: 'red-wine',
        },
        {
          kind: 'drink',
          label: t('Sparkling wine', 'Vin spumant'),
          reason: t(
            'The bubbles and acidity refresh the palate between bites.',
            'Bulele și aciditatea împrospătează gustul între îmbucături.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'sparkling-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'A few crostini with a salad make a light meal.',
            'Câteva crostini cu o salată fac o masă ușoară.',
          ),
        },
        {
          moment: 'before-workout',
          polarity: 'avoid',
          reason: t(
            'Rich and salty, it sits heavily before exercise.',
            'Fiind bogat și sărat, stă greu în stomac înainte de efort.',
          ),
        },
        {
          moment: 'late-evening',
          polarity: 'avoid',
          reason: t(
            'Rich liver and salty toppings are heavy just before bed.',
            'Ficatul bogat și garniturile sărate sunt grele chiar înainte de culcare.',
          ),
        },
      ],
    },
    {
      slug: 'smorrebrod-greek',
      cuisine: 'greek',
      // Nothing is buttered, and the rusk is meant to sit and soften under its topping.
      hideBaseTips: [0, 1],
      title: t(
        'Dakos (Cretan barley rusk with tomato and mizithra)',
        'Dakos (pesmet cretan de orz cu roșii și mizithra)',
      ),
      servings: 4,
      prepMinutes: 15,
      difficulty: 'easy',
      lines: [
        {
          ingredient: 'barley-rusks',
          quantity: 200,
          unit: 'g',
          note: t('4 large rusks', '4 pesmeți mari'),
        },
        {
          ingredient: 'tomato',
          quantity: 600,
          unit: 'g',
          note: t('very ripe, 4 tomatoes', 'foarte coapte, 4 roșii'),
        },
        {
          ingredient: 'mizithra',
          quantity: 150,
          unit: 'g',
          note: t('crumbled', 'mărunțită'),
        },
        { ingredient: 'olive-oil', quantity: 60, unit: 'ml' },
        { ingredient: 'oregano', quantity: 2, unit: 'g' },
        {
          ingredient: 'capers',
          quantity: 20,
          unit: 'g',
          optional: true,
          note: t('rinsed', 'clătite'),
        },
        {
          ingredient: 'olives',
          quantity: 60,
          unit: 'g',
          optional: true,
          note: t('pitted if you like', 'fără sâmburi, după preferință'),
        },
        {
          ingredient: 'still-water',
          quantity: 0.1,
          unit: 'l',
          note: t('for wetting the rusks', 'pentru umezirea pesmeților'),
        },
        { ingredient: 'salt', quantity: 1, unit: 'g' },
        { ingredient: 'black-pepper', quantity: 0.5, unit: 'g' },
      ],
      steps: [
        {
          key: 'grate',
          text: t(
            'Halve the tomatoes and grate them on the coarse side of a box grater into a bowl, leaving the skins behind. Season with the salt and pepper and stir.',
            'Taie roșiile în două și dă-le pe partea mare a răzătorii într-un bol, lăsând cojile. Sărează, piperează și amestecă.',
          ),
        },
        {
          key: 'wet',
          text: t(
            'Set the rusks on a large platter. Sprinkle each with about 25 ml of water, or hold it under the tap for one or two seconds, just until the surface is damp but the rusk is still hard in the middle.',
            'Pune pesmeții pe un platou mare. Stropește fiecare cu aproximativ 25 ml de apă sau ține-l sub jet de apă una-două secunde, doar până suprafața e umedă, dar pesmetul rămâne tare în mijloc.',
          ),
        },
        {
          key: 'tomato',
          text: t(
            'Spoon the grated tomato and its juice over the rusks, covering them to the edges.',
            'Pune cu lingura roșiile rase și sucul lor peste pesmeți, acoperindu-i până la margini.',
          ),
        },
        {
          key: 'topping',
          text: t(
            'Crumble the mizithra over the tomato, then add the olives and capers if using. Sprinkle with the oregano and drizzle 15 ml of olive oil over each rusk.',
            'Fărâmițează mizithra peste roșii, apoi adaugă măslinele și caperele, dacă le folosești. Presară oregano și toarnă 15 ml de ulei de măsline peste fiecare pesmet.',
          ),
        },
        {
          key: 'rest',
          text: t(
            'Leave the rusks for 5 minutes, until the edges have softened but the centre still has some bite. Serve with a knife and fork.',
            'Lasă pesmeții 5 minute, până când marginile se înmoaie, dar centrul păstrează puțină fermitate. Servește cu cuțit și furculiță.',
          ),
          timerSeconds: 300,
        },
      ],
      tips: [
        t(
          'Use the ripest tomatoes you can find; with pale, watery ones the dish is not worth making.',
          'Folosește cele mai coapte roșii pe care le găsești; cu unele palide și apoase preparatul nu merită făcut.',
        ),
        t(
          'Eat it within about 15 minutes of assembling; after that the rusk turns to mush. It is not a dish to keep.',
          'Mănâncă-l în cel mult 15 minute de la asamblare; după aceea pesmetul se înmoaie de tot. Nu e un preparat de păstrat.',
        ),
      ],
      stepTips: [
        {
          step: 'wet',
          text: t(
            'Rusks vary in hardness. Wet a very hard one a little longer, but never soak it: the tomato juice keeps softening it afterwards.',
            'Pesmeții diferă ca duritate. Umezește unul foarte tare puțin mai mult, dar nu-l înmuia: sucul de roșii îl înmoaie și după aceea.',
          ),
        },
      ],
      nutritionNote: t(
        'Mostly tomato, with the barley rusk supplying the carbohydrate and the mizithra some protein; olive oil is the main fat, and the cheese, olives and capers add salt. Easy to keep light by measuring the oil.',
        'În mare parte roșii, cu pesmetul de orz ca sursă de carbohidrați și mizithra aducând proteine; uleiul de măsline e grăsimea principală, iar brânza, măslinele și caperele adaugă sare. Rămâne ușor dacă măsori uleiul.',
      ),
      pairings: [
        {
          kind: 'food',
          label: t('Lentil soup (fakes)', 'Supă de linte (fakes)'),
          reason: t(
            'A cool, fresh rusk beside a hot, earthy bowl of lentils makes a full meatless Greek lunch.',
            'Un pesmet răcoros și proaspăt lângă un castron cald de linte cu gust de pământ alcătuiesc un prânz grecesc complet, fără carne.',
          ),
          principle: 'contrast_texture',
          recipe: 'lentil-soup-greek',
        },
        {
          kind: 'food',
          label: t('Cucumber', 'Castravete'),
          reason: t(
            'Cool, crunchy slices contrast with the softened rusk.',
            'Feliile răcoroase și crocante fac contrast cu pesmetul înmuiat.',
          ),
          principle: 'contrast_texture',
          ingredient: 'cucumber',
        },
        {
          kind: 'drink',
          label: t('Chilled rosé', 'Vin rosé rece'),
          reason: t(
            'Its fresh acidity cleanses the palate after olive oil and cheese.',
            'Aciditatea lui proaspătă curăță gustul după uleiul de măsline și brânză.',
          ),
          principle: 'cleanses_palate',
          ingredient: 'rose-wine',
        },
      ],
      eatingMoments: [
        {
          moment: 'light-lunch',
          polarity: 'good_for',
          reason: t(
            'Fresh and quick, with no cooking at all.',
            'Proaspăt și rapid, fără să gătești nimic.',
          ),
        },
        {
          moment: 'hot-day',
          polarity: 'good_for',
          reason: t(
            'No cooking and juicy tomato make it refreshing in the heat.',
            'Fără gătit și cu roșii zemoase, e răcoritor pe căldură.',
          ),
        },
        {
          moment: 'brunch',
          polarity: 'good_for',
          reason: t(
            'Quick to assemble on a platter for the table.',
            'Se asamblează repede pe un platou pentru masă.',
          ),
        },
      ],
    },
  ],
};
