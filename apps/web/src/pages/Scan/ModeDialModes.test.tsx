import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ModeDial } from './components/ModeDial';
import { renderWithProviders } from '../../test/render';

const renderDial = (
  modes: Parameters<typeof ModeDial>[0]['modes'],
  mode: Parameters<typeof ModeDial>[0]['mode'],
  onChange = vi.fn(),
) => {
  renderWithProviders(
    <ModeDial
      modes={modes}
      mode={mode}
      disabled={false}
      keysDisabled={false}
      dragEndedAt={createRef<number | null>() as { current: number | null }}
      onChange={onChange}
    />,
  );
  return onChange;
};

describe('ModeDial with a configured mode list', () => {
  it('lists only the given modes, in the given order', () => {
    renderDial(['product', 'receipt'], 'product');
    const dial = screen.getByRole('radiogroup', { name: 'Scan mode' });
    expect(
      within(dial)
        .getAllByRole('radio')
        .map((radio) => radio.getAttribute('aria-label')),
    ).toEqual(['Product', 'Receipt']);
  });

  it('steps through the given list with the arrow keys and stops at its ends', async () => {
    const onChange = renderDial(['product', 'receipt'], 'product');
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('receipt');
    onChange.mockClear();
    await userEvent.keyboard('{ArrowLeft}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('is not rendered when only one mode is allowed', () => {
    renderDial(['product'], 'product');
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });
});
