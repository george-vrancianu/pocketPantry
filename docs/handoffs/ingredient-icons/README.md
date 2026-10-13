# PocketPantry ingredient icons — duotone set

Preview artifact (light/dark, in context, tap-to-copy SVG): https://claude.ai/artifact/D1HobFHsmzCT2daYDF2zfA

## Decision (2026-10-13)
**Duotone** chosen after a four-style comparison (outline, filled, duotone, playful) on a 20-icon starter set. Reasons: it carries the aisle colour-coding from the shopping screen into every row, the outline inherits text colour so one set works in light and dark, and pale ingredients stay visible on white cards (which ruled out the Filled option).

## The set
All 42 catalog ingredients from `docs/shopping/prototype.html`, ids identical to the catalog ids:
- Produce (13): tomato, cucumber, onion, redonion, garlic, potato, carrot, spinach, lemon, banana, apple, pepper, parsley
- Bakery (3): bread, tortilla, croissant
- Dairy & eggs (8): milk, eggs, butter, yogurt, feta, parmesan, mozz, cream
- Meat & fish (4): chicken, mince, salmon, bacon
- Pantry (10): pasta, rice, oil, flour, sugar, passata, chickpeas, oats, honey, coffee
- Frozen (2): peas, icecream
- Drinks (2): water, oj

## Spec
- 24-pt grid, 1.5 pt stroke, round caps and joins. Stroke = `currentColor`. The `body` part(s) are filled with the aisle tint; a few tiny parts (fish eye) are filled `currentColor`.
- Aisle tints, light (from the shopping handoff): Produce `#DDEBE2`, Bakery `#F6EBC8`, Dairy & eggs `#E3ECF3`, Meat & fish `#FBE6DA`, Pantry `#E2E8DD`, Frozen `#E6E9F4`, Drinks `#EFE6F1`.
- Aisle tints, dark (new): Produce `#24392E`, Bakery `#3B3320`, Dairy & eggs `#243440`, Meat & fish `#42291E`, Pantry `#2B332C`, Frozen `#272C3F`, Drinks `#362A3A`.
- Fallback for unknown aisles: `--chip`.
- Sizes: 24 px in shopping/pantry/recipe rows, 40 px in scan tiles. Not below 20 px. Keep the stroke unscaled (`vector-effect: non-scaling-stroke`) above 48 px.

## Files
- `ingredient-icons.svg` — sprite of `<symbol id="ing-{id}" viewBox="0 0 24 24">`. Blob fill is `var(--ingredient-tint, #E7E9E4)`; set the variable per row/tile from the aisle.
  ```html
  <svg width="24" height="24" style="--ingredient-tint:#DDEBE2"><use href="ingredient-icons.svg#ing-tomato"/></svg>
  ```
- `ingredientIcons.ts` — `INGREDIENT_ICONS` (id → name, aisle, parts) and `AISLE_TINTS` (light/dark) for react-native-svg:
  ```tsx
  <Svg viewBox="0 0 24 24" width={24} height={24}>
    {INGREDIENT_ICONS[id].parts.map((p, i) => (
      <Path key={i} d={p.d} fill={p.body ? tint : p.dot ? ink : 'none'}
            stroke={ink} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    ))}
  </Svg>
  ```

## Follow-ups
- New catalog items need an icon drawn in the same parts format; until then fall back to the aisle letter tile from the shopping handoff.
- Bottles/jars (oil, passata, water, honey, sugar, flour) differ mainly by label; revisit if users confuse them.
- Possible later: replace the letter category tile in search results with these icons.
