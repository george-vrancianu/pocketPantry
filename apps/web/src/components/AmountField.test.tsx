import { act, screen, within } from '@testing-library/react';
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
  scale?: AmountScale | null;
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
  it('shows the chips with an empty quantity once a unit is chosen', () => {
    renderWithProviders(<Harness unit="g" start="" />);
    expect(chipNames()).toEqual(['100 g', '250 g', '500 g', '1,000 g']);
    for (const name of chipNames()) {
      expect(chip(name ?? '')).toHaveAttribute('aria-pressed', 'false');
    }
  });

  it('hides the chip row while there is no unit', () => {
    renderWithProviders(<Harness unit="" start="250" />);
    expect(
      screen.queryByRole('group', { name: 'Usual amounts for Paprika' }),
    ).not.toBeInTheDocument();
  });

  it('shows the chips once a unit is picked in an empty field', async () => {
    renderWithProviders(<Harness unit="" start="" scale={null} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Unit: unit' }));
    await user.click(screen.getByRole('button', { name: 'pcs' }));

    expect(chipNames()).toEqual(['1 pcs', '2 pcs', '3 pcs', '4 pcs']);
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

  it('shows no hint label above the chips, only the matching chip pressed', () => {
    renderWithProviders(<Harness unit="g" start="250" />);

    expect(screen.queryByText('usual amount')).not.toBeInTheDocument();
    expect(chip('250 g')).toHaveAttribute('aria-pressed', 'true');
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

  it('takes the chips hidden for lack of width out of the accessibility tree', () => {
    renderWithProviders(<Harness unit="g" start="250" />);

    // 200 g is in the scale but does not fit the 300 pt row: it is in the DOM, not announced.
    expect(within(usualGroup()).getByLabelText('200 g')).not.toBeVisible();
    expect(
      within(usualGroup()).queryByRole('button', { name: '200 g' }),
    ).not.toBeInTheDocument();
    expect(chipNames()).toEqual(['100 g', '250 g', '500 g', '1,000 g']);
  });

  it('removes the chip transitions when the Member prefers reduced motion', () => {
    renderWithProviders(<Harness unit="g" start="250" />);
    const css = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('\n');
    const classes = Array.from(chip('250 g').classList);

    expect(
      classes.some((c) =>
        new RegExp(`\\.${c}\\{[^}]*transition:background-color`).test(css),
      ),
    ).toBe(true);
    expect(
      classes.some((c) =>
        new RegExp(
          `@media \\(prefers-reduced-motion: reduce\\)\\{\\.${c}\\{[^}]*transition:none`,
        ).test(css),
      ),
    ).toBe(true);
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

  it('steps the amount with the arrow keys when the field has no Amount Scale', async () => {
    const onQuantity = vi.fn();
    renderWithProviders(
      <Harness unit="g" start="250" scale={null} onQuantity={onQuantity} />,
    );
    const user = userEvent.setup();

    await user.click(field());
    await user.keyboard('{ArrowUp}');
    expect(onQuantity).toHaveBeenLastCalledWith('260', undefined);
    await user.keyboard('{Shift>}{ArrowDown}{/Shift}');
    expect(onQuantity).toHaveBeenLastCalledWith('210', undefined);
  });

  it('steps a field with no Amount Scale and no unit by one', async () => {
    const onQuantity = vi.fn();
    renderWithProviders(
      <Harness unit="" start="" scale={null} onQuantity={onQuantity} />,
    );
    const user = userEvent.setup();

    await user.click(field());
    await user.keyboard('{ArrowUp}');
    expect(onQuantity).toHaveBeenLastCalledWith('1', undefined);
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

    chip('100 g').focus();
    await user.keyboard('{ArrowRight}');
    expect(chip('250 g')).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(field()).toHaveValue('250');
    expect(chip('250 g')).toHaveAttribute('aria-pressed', 'true');
  });

  it.each([
    ['g', ['100 g', '250 g', '500 g', '1,000 g']],
    ['ml', ['100 ml', '250 ml', '500 ml', '1,000 ml']],
    ['kg', ['1 kg', '2 kg', '3 kg', '4 kg']],
    ['l', ['1 L', '2 L', '3 L', '4 L']],
    ['pcs', ['1 pcs', '2 pcs', '3 pcs', '4 pcs']],
  ] as const)(
    'offers %s chips from the unit alone when no Amount Scale is given',
    (unit, expected) => {
      renderWithProviders(
        <AmountField
          name="Paprika"
          quantity=""
          unit={unit}
          onQuantityChange={() => {}}
          onUnitChange={() => {}}
          error={null}
          onSubmit={() => {}}
        />,
      );
      expect(chipNames()).toEqual(expected);
    },
  );

  it('keeps the matching unit-only chip pressed in a narrow row', () => {
    renderWithProviders(<Harness unit="pcs" start="12" scale={null} />);
    // 12 is the last priority, so it is kept first; then 1, 2 and 3 fill the rest.
    expect(chipNames()).toEqual(['1 pcs', '2 pcs', '3 pcs', '12 pcs']);
    expect(chip('12 pcs')).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('AmountField usual amount keyboard access', () => {
  it('selects the focused chip with Space', async () => {
    renderWithProviders(<Harness unit="g" start="" />);
    const user = userEvent.setup();

    chip('250 g').focus();
    await user.keyboard(' ');

    expect(field()).toHaveValue('250');
    expect(chip('250 g')).toHaveAttribute('aria-pressed', 'true');
  });

  it('reaches the chips with Tab, after the unit control', async () => {
    renderWithProviders(<Harness unit="g" start="5" />);
    const user = userEvent.setup();

    field().focus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Unit: g' })).toHaveFocus();

    await user.tab();
    expect(chip('100 g')).toHaveFocus();
  });

  it('fits the chips again when only the language changes', async () => {
    const { i18n } = renderWithProviders(<Harness unit="g" start="250" />);
    const reads = vi.fn(() => 60);
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(
      reads,
    );

    await act(() => i18n.changeLanguage('ro'));

    // The chips are measured again in the new language, so a longer label is fitted too.
    expect(reads).toHaveBeenCalled();
  });
});
