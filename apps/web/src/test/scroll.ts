import { onTestFinished } from 'vitest';

type Scroll = { list: Element; top: number; behavior?: ScrollBehavior };

/**
 * jsdom has no layout and no `Element.scrollTo`. This gives every element an `offsetTop` of 1000 × its index among
 * its siblings and records `scrollTo` calls, so a test can ask which child a scrolling list was last brought to
 * (and how), without depending on real offsets. Call it inside a test; it is undone when the test finishes.
 */
export function trackScrolling() {
  const scrolls: Scroll[] = [];
  const offsetTop = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'offsetTop',
  );
  const scrollTo = Object.getOwnPropertyDescriptor(
    Element.prototype,
    'scrollTo',
  );

  Object.defineProperty(HTMLElement.prototype, 'offsetTop', {
    configurable: true,
    get(this: HTMLElement) {
      const siblings = this.parentElement
        ? [...this.parentElement.children]
        : [this];
      return siblings.indexOf(this) * 1000;
    },
  });
  Object.defineProperty(Element.prototype, 'scrollTo', {
    configurable: true,
    writable: true,
    value(this: Element, options: ScrollToOptions) {
      scrolls.push({
        list: this,
        top: options.top ?? 0,
        behavior: options.behavior,
      });
    },
  });

  onTestFinished(() => {
    if (offsetTop)
      Object.defineProperty(HTMLElement.prototype, 'offsetTop', offsetTop);
    if (scrollTo)
      Object.defineProperty(Element.prototype, 'scrollTo', scrollTo);
    else delete (Element.prototype as Partial<Element>).scrollTo;
  });

  return {
    /** Every `scrollTo` so far on `list`. */
    scrollsOf: (list: Element) => scrolls.filter((s) => s.list === list),
    /** The child `list` was last scrolled to, with the behaviour used; null if it never scrolled. */
    scrolledTo(list: Element) {
      const last = scrolls.filter((s) => s.list === list).at(-1);
      if (!last) return null;
      return {
        child: list.children[last.top / 1000] as HTMLElement | undefined,
        behavior: last.behavior ?? 'auto',
      };
    },
  };
}
