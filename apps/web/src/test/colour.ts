import { createPocketPantryTheme } from '@pocket-pantry/ui';

type ColourProperty = 'color' | 'background-color' | 'border-top-color';

/**
 * jsdom lower-cases `var()` names inside ordinary properties, but custom
 * property names are case-sensitive and the Theme's own keys are camelCase
 * (`--mui-palette-pp-accentTint`, `--mui-palette-primary-contrastText`), so
 * map them back.
 */
const CASED = new Map(
  Object.keys(createPocketPantryTheme().palette.pp).map((key) => [
    `--mui-palette-pp-${key.toLowerCase()}`,
    `--mui-palette-pp-${key}`,
  ]),
);

/**
 * The colour an element paints for `property`, with Theme variables resolved
 * as a browser would: jsdom cascades custom properties but leaves `var()`
 * unresolved in ordinary ones. Hex values come back upper-case.
 */
export function paintedColour(element: Element, property: ColourProperty) {
  const style = getComputedStyle(element);
  let value = style.getPropertyValue(property).trim();
  for (
    let match = /var\((--[\w-]+)\)/.exec(value);
    match;
    match = /var\((--[\w-]+)\)/.exec(value)
  ) {
    const name =
      CASED.get(match[1]) ?? match[1].replace(/contrasttext$/, 'contrastText');
    value = value.replace(match[0], style.getPropertyValue(name).trim());
  }
  return value.toUpperCase();
}
