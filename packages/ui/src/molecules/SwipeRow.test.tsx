import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SwipeRow } from './SwipeRow';

const labels = {
  question: 'Remove Tomato?',
  context: 'from your list',
  keep: 'Keep',
  remove: 'Remove',
  releaseToDelete: 'Release to delete',
};

function renderRow(onRemove: () => void) {
  return render(
    <ul>
      <SwipeRow name="Tomato" labels={labels} onRemove={onRemove}>
        <span>Tomato</span>
      </SwipeRow>
    </ul>,
  );
}

describe('SwipeRow', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('calls onRemove once, after the collapse', async () => {
    vi.useFakeTimers();
    const onRemove = vi.fn();
    renderRow(onRemove);
    fireEvent.keyDown(screen.getByRole('group', { name: 'Tomato' }), {
      key: 'Delete',
    });
    const remove = screen.getByRole('button', { name: 'Remove' });

    fireEvent.click(remove);
    fireEvent.click(remove);
    expect(onRemove).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(300));

    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('does not call onRemove when the row unmounts mid-collapse', async () => {
    vi.useFakeTimers();
    const onRemove = vi.fn();
    const view = renderRow(onRemove);
    fireEvent.keyDown(screen.getByRole('group', { name: 'Tomato' }), {
      key: 'Delete',
    });
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

    view.unmount();
    await vi.advanceTimersByTimeAsync(500);

    expect(onRemove).not.toHaveBeenCalled();
  });
});
