import { useToast } from '@pocket-pantry/ui';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/render';

function Trigger({ onAction }: { onAction: () => void }) {
  const toast = useToast();
  return (
    <>
      <button type="button" onClick={() => toast.show('First')}>
        first
      </button>
      <button
        type="button"
        onClick={() =>
          toast.show('Second', { action: { label: 'Edit', onClick: onAction } })
        }
      >
        second
      </button>
    </>
  );
}

describe('ToastProvider', () => {
  afterEach(() => vi.useRealTimers());

  it('replaces the showing toast and runs the action from the keyboard', async () => {
    const onAction = vi.fn();
    renderWithProviders(<Trigger onAction={onAction} />);

    await userEvent.click(screen.getByText('first'));
    expect(await screen.findByText('First')).toBeVisible();
    await userEvent.click(screen.getByText('second'));

    expect(await screen.findByText('Second')).toBeVisible();
    expect(screen.queryByText('First')).not.toBeInTheDocument();

    const action = screen.getByRole('button', { name: 'Edit' });
    action.focus();
    await userEvent.keyboard('{Enter}');
    expect(onAction).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(screen.queryByText('Second')).not.toBeInTheDocument(),
    );
  });

  it('hides after 2.6 seconds', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderWithProviders(<Trigger onAction={() => undefined} />);

    await userEvent.click(screen.getByText('first'));
    expect(screen.getByText('First')).toBeVisible();
    await act(() => vi.advanceTimersByTimeAsync(2700));

    await waitFor(() =>
      expect(screen.queryByText('First')).not.toBeInTheDocument(),
    );
  });
});
