import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DockItem } from './DockItem';
import { renderWithTheme as render } from '../test/render';

describe('DockItem', () => {
  afterEach(cleanup);

  it('rings the tab for keyboard focus, as the global rule loses to ButtonBase', () => {
    render(<DockItem label="Pantry" href="/pantry" icon={<svg />} />);
    const tab = screen.getByRole('link', { name: 'Pantry' });
    const css = Array.from(document.styleSheets)
      .flatMap((sheet) => Array.from(sheet.cssRules))
      .map((rule) => rule.cssText)
      .filter((text) => tab.className.split(' ').some((c) => text.includes(c)));

    expect(
      css.some(
        (text) =>
          text.includes('Mui-focusVisible') && /outline: 2px solid/.test(text),
      ),
    ).toBe(true);
  });
});
