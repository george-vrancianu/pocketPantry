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
    value = value.replace(match[0], customProperty(style, match[1]));
  }
  return value.toUpperCase();
}

/**
 * jsdom lower-cases variable names inside `color` (e.g. `--mui-palette-pp-
 * accentOnTint` becomes `--mui-palette-pp-accentontint`), so fall back to the
 * declared name that matches regardless of case.
 */
function customProperty(style: CSSStyleDeclaration, name: string) {
  const exact = style.getPropertyValue(name).trim();
  if (exact) return exact;
  const declared = declaredCustomProperties().find(
    (candidate) => candidate.toLowerCase() === name.toLowerCase(),
  );
  return declared ? style.getPropertyValue(declared).trim() : '';
}

function declaredCustomProperties() {
  const names = new Set<string>();
  for (const sheet of Array.from(document.styleSheets)) {
    for (const rule of Array.from(sheet.cssRules)) {
      if (!(rule instanceof CSSStyleRule)) continue;
      for (const property of Array.from(rule.style)) {
        if (property.startsWith('--')) names.add(property);
      }
    }
  }
  return [...names];
}
