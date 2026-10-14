type ColourProperty = 'color' | 'background-color' | 'border-top-color';

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
    value = value.replace(match[0], style.getPropertyValue(match[1]).trim());
  }
  return value.toUpperCase();
}
