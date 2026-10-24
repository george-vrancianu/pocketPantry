import { writeAppearance } from '@pocket-pantry/ui';
import { paintedColour } from '@pocket-pantry/ui/test/colour';
import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/render';
import { AuthShell } from './AuthShell';
import { IntroLook } from './IntroLook';

const WARM_INK = '#2B2418';

/** The `color` a style sheet rule sets on the element itself, not one it inherits. */
function ownColour(element: Element) {
  for (const sheet of Array.from(document.styleSheets)) {
    for (const rule of Array.from(sheet.cssRules)) {
      if (
        rule instanceof CSSStyleRule &&
        element.matches(rule.selectorText) &&
        rule.style.color
      ) {
        return rule.style.color;
      }
    }
  }
  return null;
}

afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  vi.unstubAllGlobals();
});

describe('IntroLook', () => {
  it('paints its text in Warm ink when the device is in Dark', () => {
    writeAppearance({ theme: 'dark', matchSystem: false });
    renderWithProviders(
      <IntroLook>
        <p>Create your account</p>
      </IntroLook>,
    );
    expect(document.documentElement.dataset.theme).toBe('dark');
    const look = screen.getByText('Create your account').parentElement!;
    expect(look.dataset.theme).toBe('warm');
    // A browser resolves an inherited colour where it is declared, so text with no colour of its own
    // would keep the root's Dark ink (light on cream) unless the look declares one; jsdom can't show that.
    expect(ownColour(look)).not.toBeNull();
    expect(paintedColour(look, 'color')).toBe(WARM_INK);
  });
});

describe('AuthShell', () => {
  it('shows the app name beside the logo, leaving the title the only heading', () => {
    renderWithProviders(
      <AuthShell title="Create your account" subtitle="Start" back="Back">
        <p>Form</p>
      </AuthShell>,
    );
    expect(screen.getByText('PantryGator')).toBeInTheDocument();
    expect(screen.getAllByRole('heading')).toHaveLength(1);
    expect(
      screen.getByRole('heading', { name: 'Create your account' }),
    ).toBeInTheDocument();
  });
});
