import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Unit } from '../lib/catalog';
import type { AmountScale } from '../lib/usualAmounts';
import { renderWithProviders } from '../test/render';
import { AmountField } from './AmountField';

// Chips are 60 pt wide and the row is 300 pt: four fit (60+6+60+6+60+6+60 = 258; a fifth is 324).
beforeEach(() => {
  vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(300);
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(60);
});

afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(navigator, 'vibrate');
});

type HarnessProps = {
  start?: string;
  unit?: Unit | '';
  scale?: AmountScale;
  onQuantity?: (quantity: string, typedUnit?: Unit | '') => void;
  onUnit?: (unit: Unit | '') => void;
};

/** A controlled field, so chip taps and unit changes show up in what the field displays. */
function Harness({
  start = '',
  unit: startUnit = 'g',
  scale = 'medium',
  onQuantity = () => {},
  onUnit = () => {},
}: HarnessProps) {
  const [quantity, setQuantity] = useState(start);
  const [unit, setUnit] = useState<Unit | ''>(startUnit);
  return (
    <AmountField
      name="Paprika"
      quantity={quantity}
      unit={unit}
      amountScale={scale}
      onQuantityChange={(next, typedUnit) => {
        onQuantity(next, typedUnit);
        setQuantity(next);
        if (typedUnit) setUnit(typedUnit);
      }}
      onUnitChange={(next) => {
        onUnit(next);
        setUnit(next);
      }}
      error={null}
      onSubmit={() => {}}
    />
  );
}

const usualGroup = () =>
  screen.getByRole('group', { name: 'Usual amounts for Paprika' });
const chipNames = () =>
  within(usualGroup())
    .getAllByRole('button')
    .map((chip) => chip.getAttribute('aria-label'));
const chip = (name: string) =>
  within(usualGroup()).getByRole('button', { name });
const field = () => screen.getByRole('textbox');

describe('AmountField usual amount chips', () => {
  it('hides the chip row while the field is empty', () => {
    renderWithProviders(<Harness unit="g" start="" />);
    expect(
      screen.queryByRole('group', { name: 'Usual amounts for Paprika' }),
    ).not.toBeInTheDocument();
  });

  it('shows the kept chips in ascending order when the field has a value', () => {
    renderWithProviders(<Harness unit="g" start="250" />);
    expect(chipNames()).toEqual(['100 g', '250 g', '500 g', '1,000 g']);
  });

  it('shows kilogram chips in kilograms for the large scale', () => {
    renderWithProviders(<Harness unit="kg" start="1" scale="large" />);
    expect(chipNames()).toEqual(['0.5 kg', '1 kg', '2 kg', '5 kg']);
  });

  it('sets the amount on tap, selects that chip, and does not move focus to the field', async () => {
    const vibrate = vi.fn(() => true);
    Object.defineProperty(navigator, 'vibrate', {
      value: vibrate,
      configurable: true,
    });
    const onQuantity = vi.fn();
    renderWithProviders(<Harness unit="g" start="" onQuantity={onQuantity} />);
    const user = userEvent.setup();

    // Hidden while empty; type a value so the row shows, then tap a chip.
    await user.type(field(), '7');
    await user.click(chip('500 g'));

    expect(onQuantity).toHaveBeenLastCalledWith('500', undefined);
    expect(field()).toHaveValue('500');
    expect(chip('500 g')).toHaveAttribute('aria-pressed', 'true');
    expect(chip('250 g')).toHaveAttribute('aria-pressed', 'false');
    expect(field()).not.toHaveFocus();
    expect(vibrate).toHaveBeenCalledWith(6);
  });

  it('selects no chip for a typed value that is not a usual amount', async () => {
    renderWithProviders(<Harness unit="g" start="250" />);
    const user = userEvent.setup();

    await user.clear(field());
    await user.type(field(), '260');

    for (const name of ['100 g', '250 g', '500 g', '1,000 g']) {
      expect(chip(name)).toHaveAttribute('aria-pressed', 'false');
    }
  });

  it('shows the usual amount hint only while a chip matches', async () => {
    renderWithProviders(<Harness unit="g" start="250" />);
    const user = userEvent.setup();

    expect(screen.getByText('usual amount')).toBeVisible();

    await user.type(field(), '3');
    expect(screen.queryByText('usual amount')).not.toBeInTheDocument();
  });

  it('keeps the chip matching a typed value even when the row narrows', () => {
    renderWithProviders(<Harness unit="g" start="750" />);
    // 750 is priority index 6, so it is placed first; then 250, 500 and 100 fill the rest.
    expect(chipNames()).toEqual(['100 g', '250 g', '500 g', '750 g']);
    expect(chip('750 g')).toHaveAttribute('aria-pressed', 'true');
    expect(
      within(usualGroup()).queryByRole('button', { name: '1,000 g' }),
    ).not.toBeInTheDocument();
  });

  it('converts the number when the unit changes between g and kg', async () => {
    const onQuantity = vi.fn();
    const onUnit = vi.fn();
    renderWithProviders(
      <Harness unit="kg" start="1.5" onQuantity={onQuantity} onUnit={onUnit} />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Unit: kg' }));
    await user.click(screen.getByRole('button', { name: 'g' }));

    expect(onQuantity).toHaveBeenLastCalledWith('1500', undefined);
    expect(onUnit).toHaveBeenLastCalledWith('g');
    expect(field()).toHaveValue('1500');
    expect(chipNames()).toEqual(['100 g', '250 g', '500 g', '1,000 g']);
  });

  it('offers only the unit family, and no alternative for pieces', async () => {
    renderWithProviders(<Harness unit="pcs" start="6" scale="medium" />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Unit: pcs' }));
    const units = within(
      screen.getByRole('group', { name: 'Units' }),
    ).getAllByRole('button');
    expect(units.map((unit) => unit.textContent)).toEqual(['—', 'pcs']);
  });

  it('steps the amount with the arrow keys, five steps with Shift, and never below zero', async () => {
    const onQuantity = vi.fn();
    renderWithProviders(
      <Harness unit="g" start="250" onQuantity={onQuantity} />,
    );
    const user = userEvent.setup();

    await user.click(field());
    await user.keyboard('{ArrowUp}');
    expect(onQuantity).toHaveBeenLastCalledWith('260', undefined);
    await user.keyboard('{Shift>}{ArrowDown}{/Shift}');
    expect(onQuantity).toHaveBeenLastCalledWith('210', undefined);
  });

  it('keeps a zero amount at zero when stepping down', async () => {
    const onQuantity = vi.fn();
    renderWithProviders(<Harness unit="g" start="0" onQuantity={onQuantity} />);
    const user = userEvent.setup();

    await user.click(field());
    await user.keyboard('{ArrowDown}');
    expect(onQuantity).toHaveBeenLastCalledWith('0', undefined);
  });

  it('moves between chips with the arrow keys and selects with Enter', async () => {
    renderWithProviders(<Harness unit="g" start="" />);
    const user = userEvent.setup();
    await user.type(field(), '5');

    chip('100 g').focus();
    await user.keyboard('{ArrowRight}');
    expect(chip('250 g')).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(field()).toHaveValue('250');
    expect(chip('250 g')).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps chips out of the amount when no scale is given', () => {
    renderWithProviders(
      <AmountField
        name="Paprika"
        quantity="250"
        unit="g"
        onQuantityChange={() => {}}
        onUnitChange={() => {}}
        error={null}
        onSubmit={() => {}}
      />,
    );
    expect(
      screen.queryByRole('group', { name: 'Usual amounts for Paprika' }),
    ).not.toBeInTheDocument();
  });
});
