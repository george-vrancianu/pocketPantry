import { vi } from 'vitest';

/**
 * jsdom has no layout: give every <li> a 60px-tall box stacked by its position
 * among its siblings, so a sortable list can tell which row is above which.
 */
export function stubRowLayout() {
  return vi
    .spyOn(Element.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: Element) {
      const index =
        this.tagName === 'LI' && this.parentElement
          ? Array.from(this.parentElement.children).indexOf(this)
          : 0;
      const top = index * 60;
      return {
        x: 0,
        y: top,
        top,
        bottom: top + 60,
        left: 0,
        right: 300,
        width: 300,
        height: 60,
        toJSON: () => ({}),
      } as DOMRect;
    });
}
