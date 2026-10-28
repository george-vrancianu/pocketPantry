import { act, cleanup, fireEvent, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FieldUnit, InputAdornment, TextField } from '../index';
import { paintedColour } from '../test/colour';
import { renderWithTheme as render } from '../test/render';

describe('TextField', () => {
  afterEach(cleanup);

  /** The painted field around the native input. */
  const field = (name: string) =>
    screen.getByRole('textbox', { name }).parentElement!;

  it('is a 50 high field in the Theme field colour and control radius', () => {
    render(
      <div data-theme="dark">
        <TextField label="Name" />
      </div>,
    );
    const frame = field('Name');
    expect(paintedColour(frame, 'background-color')).toBe('#111915');
    expect(getComputedStyle(frame).borderRadius).toBe('var(--pp-r-ctl)');
    expect(getComputedStyle(frame).minHeight).toBe('50px');
  });

  it('rings the focused field in the accent tint', () => {
    render(<TextField label="Name" />);
    expect(getComputedStyle(field('Name')).boxShadow).toBe('');
    fireEvent.focus(screen.getByRole('textbox', { name: 'Name' }));
    expect(getComputedStyle(field('Name')).boxShadow.toLowerCase()).toBe(
      '0 0 0 3px var(--mui-palette-pp-accenttint)',
    );
  });

  it('floats a native select label above an empty "None" option', () => {
    render(
      <TextField
        select
        label="Cuisine"
        value=""
        slotProps={{ select: { native: true } }}
      >
        <option value="">None</option>
        <option value="it">Italian</option>
      </TextField>,
    );
    expect(
      screen
        .getByText('Cuisine', { selector: 'label' })
        .getAttribute('data-shrink'),
    ).toBe('true');
  });

  it('keeps a caller inputLabel prop on a native select', () => {
    render(
      <TextField
        select
        label="Cuisine"
        value=""
        slotProps={{
          select: { native: true },
          inputLabel: { className: 'mine' },
        }}
      >
        <option value="">None</option>
      </TextField>,
    );
    const label = screen.getByText('Cuisine', { selector: 'label' });
    expect(label.getAttribute('data-shrink')).toBe('true');
    expect(label.classList).toContain('mine');
  });

  it('leaves an empty text field label inside the field', () => {
    render(<TextField label="Name" value="" />);
    expect(
      screen
        .getByText('Name', { selector: 'label' })
        .getAttribute('data-shrink'),
    ).toBe('false');
  });
});

describe('TextField paste', () => {
  const paste = { label: 'Paste', emptyMessage: 'Nothing to paste' };

  /** Stubs the browser clipboard; `undefined` is a browser that cannot read it. */
  function stubClipboard(readText?: () => Promise<string>) {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: readText ? { readText } : undefined,
    });
  }

  afterEach(() => {
    cleanup();
    Reflect.deleteProperty(navigator, 'clipboard');
  });

  /** A controlled field, as the app uses it. */
  function Field({
    initial = '',
    onChange,
  }: {
    initial?: string;
    onChange?: (value: string) => void;
  }) {
    const [value, setValue] = useState(initial);
    return (
      <TextField
        label="Link"
        value={value}
        paste={paste}
        onChange={(event) => {
          setValue(event.target.value);
          onChange?.(event.target.value);
        }}
      />
    );
  }

  it('shows a Paste button named by its label while the field is empty', () => {
    stubClipboard(() => Promise.resolve(''));
    render(<Field />);
    expect(screen.getByRole('button', { name: 'Paste' })).toBeTruthy();
  });

  it('replaces the value with the trimmed clipboard text and focuses the input', async () => {
    stubClipboard(() => Promise.resolve('  https://example.test/soup \n'));
    const onChange = vi.fn();
    render(<Field onChange={onChange} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Paste' }));
    });

    const input = screen.getByRole('textbox', { name: 'Link' });
    expect(onChange.mock.calls).toEqual([['https://example.test/soup']]);
    expect((input as HTMLInputElement).value).toBe('https://example.test/soup');
    expect(document.activeElement).toBe(input);
  });

  it.each([
    ['empty', () => Promise.resolve('')],
    ['whitespace only', () => Promise.resolve(' \n\t ')],
    [
      'refused',
      () => Promise.reject(new DOMException('denied', 'NotAllowedError')),
    ],
  ])('says so politely when the clipboard read is %s', async (_, readText) => {
    stubClipboard(readText);
    const onChange = vi.fn();
    render(<Field onChange={onChange} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Paste' }));
    });

    expect(screen.getByRole('status').textContent).toContain(
      'Nothing to paste',
    );
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Paste' })).toBeTruthy();
  });

  it('fills the field without submitting its form', async () => {
    stubClipboard(() => Promise.resolve('K7M2PQ9X'));
    const onSubmit = vi.fn((event: { preventDefault: () => void }) =>
      event.preventDefault(),
    );
    render(
      <form onSubmit={onSubmit}>
        <Field />
      </form>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Paste' }));
    });

    expect(
      (screen.getByRole('textbox', { name: 'Link' }) as HTMLInputElement).value,
    ).toBe('K7M2PQ9X');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('offers no Paste button when the browser cannot read the clipboard', () => {
    stubClipboard(undefined);
    render(<Field />);
    expect(screen.queryByRole('button', { name: 'Paste' })).toBeNull();
  });

  it('hides the Paste button once an uncontrolled field has text, and shows it again when emptied', async () => {
    stubClipboard(() => Promise.resolve('K7M2PQ9X'));
    render(<TextField label="Code" paste={paste} />);
    const input = screen.getByRole('textbox', { name: 'Code' });

    fireEvent.change(input, { target: { value: 'k' } });
    expect(screen.queryByRole('button', { name: 'Paste' })).toBeNull();

    fireEvent.change(input, { target: { value: '' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Paste' }));
    });
    expect((input as HTMLInputElement).value).toBe('K7M2PQ9X');
    expect(screen.queryByRole('button', { name: 'Paste' })).toBeNull();
  });

  it('offers no Paste button on an uncontrolled field that starts with text', () => {
    stubClipboard(() => Promise.resolve(''));
    render(<TextField label="Code" paste={paste} defaultValue="K7M2" />);
    expect(screen.queryByRole('button', { name: 'Paste' })).toBeNull();
  });

  it('hands the end of a filled field back to its other end content', () => {
    stubClipboard(() => Promise.resolve(''));
    function Cleared() {
      const [value, setValue] = useState('');
      return (
        <TextField
          label="Link"
          value={value}
          paste={paste}
          onChange={(event) => setValue(event.target.value)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <button type="button" onClick={() => setValue('')}>
                    Clear
                  </button>
                </InputAdornment>
              ),
            },
          }}
        />
      );
    }
    render(<Cleared />);
    expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();

    fireEvent.change(screen.getByRole('textbox', { name: 'Link' }), {
      target: { value: 'k' },
    });
    expect(screen.queryByRole('button', { name: 'Paste' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeTruthy();
  });
});

describe('FieldUnit', () => {
  afterEach(cleanup);

  it('is a chip button inside the field', () => {
    render(
      <div data-theme="minimal">
        <TextField
          label="Amount"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <FieldUnit aria-label="Unit: kg">kg</FieldUnit>
                </InputAdornment>
              ),
            },
          }}
        />
      </div>,
    );
    const unit = screen.getByRole('button', { name: 'Unit: kg' });
    expect(paintedColour(unit, 'background-color')).toBe('#EEF0EB');
    expect(getComputedStyle(unit).borderRadius).toBe(
      'max(2px, calc(var(--pp-r-ctl) - 5px))',
    );
  });
});
