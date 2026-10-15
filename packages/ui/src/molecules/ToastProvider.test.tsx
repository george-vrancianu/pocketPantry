import { act, cleanup, fireEvent, screen } from '@testing-library/react';
import { useState, type ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { useToast, writeAppearance, type ThemeId } from '../index';
import { useToastHost } from './ToastProvider';
import { paintedColour } from '../test/colour';
import { renderWithTheme as render } from '../test/render';

function ShowToast() {
  const toast = useToast();
  return (
    <button
      onClick={() =>
        toast.show('Saved “Weekly shop”', {
          action: { label: 'Edit', onClick: () => undefined },
        })
      }
    >
      show
    </button>
  );
}

describe('Toasts', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  const showIn = (theme: ThemeId) => {
    writeAppearance({ theme, matchSystem: false });
    render(<ShowToast />);
    act(() => fireEvent.click(screen.getByText('show')));
    const message = screen.getByText('Saved “Weekly shop”');
    return {
      toast: message.closest<HTMLElement>('.MuiSnackbarContent-root')!,
      action: screen.getByRole('button', { name: 'Edit' }),
    };
  };

  it('is dark ink with a butter action in Warm editorial', () => {
    const { toast, action } = showIn('warm');
    expect(paintedColour(toast, 'background-color')).toBe('#2B2418');
    expect(paintedColour(toast, 'color')).toBe('#FBF8F1');
    expect(paintedColour(action, 'color')).toBe('#F0C96B');
  });

  it('is a light toast in Dark-first', () => {
    const { toast, action } = showIn('dark');
    expect(paintedColour(toast, 'background-color')).toBe('#ECF2EC');
    expect(paintedColour(toast, 'color')).toBe('#0F1512');
    expect(paintedColour(action, 'color')).toBe('#1E7A4E');
  });

  it('takes the Theme control radius and float shadow', () => {
    const { toast } = showIn('minimal');
    expect(getComputedStyle(toast).borderRadius).toBe('var(--pp-r-ctl)');
    expect(getComputedStyle(toast).boxShadow).toBe('var(--pp-shadow-float)');
  });
});

describe('Toast hosts', () => {
  afterEach(cleanup);

  function Modal({ name, children }: { name: string; children?: ReactNode }) {
    const [element, setElement] = useState<HTMLElement | null>(null);
    useToastHost(element);
    return (
      <div data-testid={name} ref={setElement}>
        {children}
      </div>
    );
  }

  it('goes back to the outer modal when the modal opened over it closes', () => {
    function App() {
      const [innerOpen, setInnerOpen] = useState(true);
      const toast = useToast();
      return (
        <>
          <Modal name="outer">
            {innerOpen ? <Modal name="inner" /> : null}
          </Modal>
          <button onClick={() => setInnerOpen(false)}>close inner</button>
          <button onClick={() => toast.show('Saved')}>show</button>
        </>
      );
    }
    render(<App />);
    act(() => fireEvent.click(screen.getByText('close inner')));
    act(() => fireEvent.click(screen.getByText('show')));

    expect(
      screen.getByTestId('outer').contains(screen.getByText('Saved')),
    ).toBe(true);
  });
});
