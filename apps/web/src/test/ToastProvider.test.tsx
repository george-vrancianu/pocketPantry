import {
  PocketPantryUiProvider,
  useToast,
  type ToastOptions,
} from '@pocket-pantry/ui';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

function Harness({ options }: { options: ToastOptions }) {
  const toast = useToast();
  return (
    <>
      <button onClick={() => toast.show('First', options)}>show</button>
      <button onClick={() => toast.show('Second')}>replace</button>
    </>
  );
}

function setup(options: ToastOptions = {}) {
  const view = render(
    <PocketPantryUiProvider>
      <Harness options={options} />
    </PocketPantryUiProvider>,
  );
  return { ...view, show: () => userEvent.click(screen.getByText('show')) };
}

describe('ToastProvider', () => {
  afterEach(() => vi.useRealTimers());

  const withTimers = () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  };

  it('stays 2600 ms by default', async () => {
    withTimers();
    const onClose = vi.fn();
    const { show } = setup({ onClose });
    await show();

    await act(() => vi.advanceTimersByTimeAsync(2500));
    expect(onClose).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(200));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('stays as long as its duration says', async () => {
    withTimers();
    const onClose = vi.fn();
    const { show } = setup({ duration: 5000, onClose });
    await show();

    await act(() => vi.advanceTimersByTimeAsync(4900));
    expect(onClose).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(200));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose once when dismissed with Escape', async () => {
    const onClose = vi.fn();
    const { show } = setup({ onClose });
    await show();

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when another toast replaces it', async () => {
    const onClose = vi.fn();
    const { show } = setup({ onClose });
    await show();

    await userEvent.click(screen.getByText('replace'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the provider unmounts', async () => {
    const onClose = vi.fn();
    const { show, unmount } = setup({ onClose });
    await show();

    unmount();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when the action is used', async () => {
    const onClick = vi.fn();
    const onClose = vi.fn();
    const { show } = setup({ action: { label: 'Undo', onClick }, onClose });
    await show();

    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    await userEvent.keyboard('{Escape}');

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not run the action of a toast that already closed', async () => {
    withTimers();
    const onClick = vi.fn();
    const { show } = setup({ action: { label: 'Undo', onClick } });
    await show();
    const undo = screen.getByRole('button', { name: 'Undo' });

    await act(() => vi.advanceTimersByTimeAsync(2700));
    undo.click();

    expect(onClick).not.toHaveBeenCalled();
  });
});
