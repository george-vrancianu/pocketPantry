import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Alert } from '../index';
import { paintedColour } from '../test/colour';
import { renderWithTheme as render } from '../test/render';

describe('Alert', () => {
  afterEach(cleanup);

  it("paints each severity with the Theme's status pair", () => {
    render(
      <div data-theme="dark">
        <Alert severity="success">Saved</Alert>
        <Alert severity="warning">Unverified</Alert>
        <Alert severity="error">Failed</Alert>
        <Alert severity="info">Tip</Alert>
      </div>,
    );
    const alert = (name: string) =>
      screen.getByText(name).closest<HTMLElement>('.MuiAlert-root')!;
    expect(paintedColour(alert('Saved'), 'background-color')).toBe('#26312A');
    expect(paintedColour(alert('Saved'), 'color')).toBe('#B9C7BC');
    expect(paintedColour(alert('Unverified'), 'background-color')).toBe(
      '#3A3118',
    );
    expect(paintedColour(alert('Unverified'), 'color')).toBe('#F2CF72');
    expect(paintedColour(alert('Failed'), 'background-color')).toBe('#3F241B');
    expect(paintedColour(alert('Failed'), 'color')).toBe('#FFA27E');
    expect(paintedColour(alert('Tip'), 'background-color')).toBe('#1F3A2A');
    expect(paintedColour(alert('Tip'), 'color')).toBe('#A9EDBD');
  });
});
