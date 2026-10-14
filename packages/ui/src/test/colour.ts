type ColourProperty =
  | 'color'
  | 'background-color'
  | 'background-image'
  | 'border-top-color'
  | 'border-bottom-color'
  | 'fill';

const VAR = /var\((--[\w-]+)\)/i;

/** Custom property names as written in the page's style sheets. */
function customPropertyNames() {
  const names = new Set<string>();
  for (const sheet of Array.from(document.styleSheets)) {
    for (const rule of Array.from(sheet.cssRules)) {
      const text = rule.cssText;
      for (const match of text.matchAll(/(--[\w-]+)\s*:/g)) names.add(match[1]);
    }
  }
  return names;
}

/** jsdom lower-cases `var()` names in some properties; MUI's are camelCase. */
function lookup(style: CSSStyleDeclaration, name: string) {
  const direct = style.getPropertyValue(name).trim();
  if (direct) return direct;
  for (const candidate of customPropertyNames()) {
    if (candidate.toLowerCase() === name.toLowerCase()) {
      return style.getPropertyValue(candidate).trim();
    }
  }
  return '';
}

/**
 * The colour an element paints for `property`, with Theme variables resolved
 * as a browser would: jsdom cascades custom properties but leaves `var()`
 * unresolved in ordinary ones. Hex values come back upper-case.
 */
export function paintedColour(element: Element, property: ColourProperty) {
  const style = getComputedStyle(element);
  let value = style.getPropertyValue(property).trim();
  for (let match = VAR.exec(value); match; match = VAR.exec(value)) {
    value = value.replace(match[0], lookup(style, match[1]));
  }
  return value.toUpperCase();
}
