import { cleanup, fireEvent, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TagField, type TagFieldOption, type TagFieldProps } from '../index';
import { renderWithTheme as render } from '../test/render';

const OPTIONS: TagFieldOption[] = [
  { id: 'mine', name: 'Meal prep', kind: 'family', groupName: null },
  {
    id: 'dinner',
    name: 'Dinner',
    kind: 'catalog',
    groupName: 'Meal',
    groupOrder: 1,
  },
  {
    id: 'vegan',
    name: 'Vegan',
    kind: 'catalog',
    groupName: 'Diet',
    groupOrder: 2,
  },
  {
    id: 'romana',
    name: 'Română',
    kind: 'catalog',
    groupName: 'Cuisine',
    groupOrder: 3,
  },
];

const labels: TagFieldProps['labels'] = {
  field: 'Filter by Tags',
  placeholder: 'Type to find a Tag',
  yourTags: 'Your Tags',
  yourTagsNote: 'only your family sees these',
  noOptions: 'No Tag by that name',
  clear: 'Clear Tags',
  remove: (name) => `Remove Tag ${name}`,
  more: (count) => `and ${count} more Tags`,
  optionCount: (count) => `${count} Recipes`,
};

function type(text: string) {
  const input = screen.getByRole('combobox', { name: 'Filter by Tags' });
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: text } });
}

function Harness({
  initial = [],
  ...props
}: { initial?: TagFieldOption[] } & Partial<TagFieldProps>) {
  const [value, setValue] = useState<TagFieldOption[]>(initial);
  return (
    <TagField
      options={OPTIONS}
      value={value}
      onChange={setValue}
      labels={labels}
      list="inline"
      {...props}
    />
  );
}

describe('TagField', () => {
  afterEach(cleanup);

  it('lists the options in place, grouped, with Your Tags first and its note', () => {
    render(<Harness />);
    expect(screen.getByRole('listbox')).toBeTruthy();
    const names = screen.getAllByRole('option').map((o) => o.textContent);
    expect(names).toEqual(['Meal prep', 'Dinner', 'Vegan', 'Română']);
    expect(screen.getByText('Your Tags')).toBeTruthy();
    expect(screen.getByText('only your family sees these')).toBeTruthy();
    expect(screen.getByText('Diet')).toBeTruthy();
  });

  it('picks several Tags in a row and keeps the list open', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('option', { name: 'Dinner' }));
    fireEvent.click(screen.getByRole('option', { name: 'Vegan' }));
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Remove Tag Vegan' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Remove Tag Dinner' }),
    ).toBeTruthy();
  });

  it('matches while typing ignoring case and accents', () => {
    render(<Harness />);
    type('ROMANA');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Română',
    ]);
  });

  it('says so when nothing matches, and never offers to create a Tag', () => {
    render(<Harness />);
    type('zzz');
    expect(screen.getByText('No Tag by that name')).toBeTruthy();
    expect(screen.queryByText(/create/i)).toBeNull();
  });

  it('inline, lets the sheet scroll: no capped listbox and no raised paper', () => {
    render(<Harness />);
    const listbox = screen.getByRole('listbox');
    expect(getComputedStyle(listbox).maxHeight).toBe('none');
    expect(getComputedStyle(listbox.parentElement!).boxShadow).toBe('none');
  });

  it('keeps two groups that share a position apart', () => {
    const tie: TagFieldOption[] = [
      {
        id: 'a1',
        name: 'Alpha',
        kind: 'catalog',
        groupName: 'Zeta',
        groupOrder: 1,
      },
      {
        id: 'b1',
        name: 'Bravo',
        kind: 'catalog',
        groupName: 'Eta',
        groupOrder: 1,
      },
      {
        id: 'a2',
        name: 'Charlie',
        kind: 'catalog',
        groupName: 'Zeta',
        groupOrder: 1,
      },
    ];
    render(<Harness options={tie} />);
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Bravo',
      'Alpha',
      'Charlie',
    ]);
    expect(screen.getAllByText(/^(Zeta|Eta)$/)).toHaveLength(2);
  });

  it('shows no counts and disables nothing without countOf', () => {
    render(<Harness />);
    expect(
      screen
        .getAllByRole('option')
        .some((o) => o.getAttribute('aria-disabled') === 'true'),
    ).toBe(false);
    expect(screen.queryByText(/Recipes$/)).toBeNull();
  });

  describe('with counts', () => {
    const counts: Record<string, number> = {
      mine: 0,
      dinner: 3,
      vegan: 1,
      romana: 0,
    };
    const countOf = (tag: TagFieldOption) => counts[tag.id];

    it('shows each unpicked option’s count and dims the ones at 0', () => {
      render(<Harness countOf={countOf} />);
      // The number is hidden from assistive tech; the option's own name carries "3 Recipes".
      expect(
        screen.getByRole('option', { name: /Dinner.*3 Recipes/ }),
      ).toBeTruthy();
      expect(
        screen.getByRole('option', { name: /Vegan.*1 Recipes/ }),
      ).toBeTruthy();
      const meal = screen.getByRole('option', { name: /Meal prep/ });
      expect(meal.getAttribute('aria-disabled')).toBe('true');
      expect(meal.getAttribute('aria-disabled')).toBe('true');
      expect(
        screen
          .getByRole('option', { name: /Dinner/ })
          .getAttribute('aria-disabled'),
      ).not.toBe('true');
    });

    it('keeps a picked Tag enabled even at 0 and shows no count on it', () => {
      render(<Harness countOf={countOf} initial={[OPTIONS[3]]} />);
      const picked = screen.getByRole('option', { name: /Română/ });
      expect(picked.getAttribute('aria-disabled')).not.toBe('true');
      expect(picked.getAttribute('aria-selected')).toBe('true');
      expect(within(picked).queryByText(/Recipes$/)).toBeNull();
    });

    it('does not pick a disabled option', () => {
      render(<Harness countOf={countOf} />);
      fireEvent.click(screen.getByRole('option', { name: /Meal prep/ }));
      expect(screen.queryByRole('button', { name: /Remove Tag/ })).toBeNull();
    });
  });

  it('removes a Tag by tapping its chip, and all with the clear indicator', () => {
    render(<Harness initial={[OPTIONS[1], OPTIONS[2]]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Tag Dinner' }));
    expect(
      screen.queryByRole('button', { name: 'Remove Tag Dinner' }),
    ).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Clear Tags' }));
    expect(screen.queryByRole('button', { name: /Remove Tag/ })).toBeNull();
    expect(screen.getByPlaceholderText('Type to find a Tag')).toBeTruthy();
  });

  it('calls onEscape for Escape in the open list', () => {
    const onEscape = vi.fn();
    render(<Harness onEscape={onEscape} />);
    fireEvent.keyDown(
      screen.getByRole('combobox', { name: 'Filter by Tags' }),
      {
        key: 'Escape',
      },
    );
    expect(onEscape).toHaveBeenCalled();
  });

  it('cuts the chips to limitTags with a labelled "+N" while the field is not focused', () => {
    render(
      <Harness
        list="popup"
        limitTags={1}
        initial={[OPTIONS[1], OPTIONS[2], OPTIONS[3]]}
      />,
    );
    expect(screen.getAllByRole('button', { name: /Remove Tag/ })).toHaveLength(
      1,
    );
    // Named by text (a bare aria-label on a span is not exposed), the "+2" itself is hidden.
    expect(screen.getByText('and 2 more Tags')).toBeTruthy();
    const pill = screen.getByTestId('tag-field-more');
    expect(pill.textContent).toBe('+2');
    const style = getComputedStyle(pill);
    expect(style.height).toBe('26px');
    expect(style.fontWeight).toBe('700');
    expect(screen.getByText('+2').getAttribute('aria-hidden')).toBe('true');
  });

  it('floats the list only while focused in popup mode', () => {
    render(<Harness list="popup" />);
    expect(screen.queryByRole('listbox')).toBeNull();
    fireEvent.focus(screen.getByRole('combobox', { name: 'Filter by Tags' }));
    fireEvent.keyDown(
      screen.getByRole('combobox', { name: 'Filter by Tags' }),
      {
        key: 'ArrowDown',
      },
    );
    expect(screen.getByRole('listbox')).toBeTruthy();
  });
});
