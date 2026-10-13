import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { SwipeRow, type SwipeRowHandle } from './SwipeRow';

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

  it('opens the editor after a 500 ms hold, and a short press does nothing', async () => {
    vi.useFakeTimers();
    const onEdit = vi.fn();
    render(
      <ul>
        <SwipeRow
          name="Milk"
          labels={labels}
          onRemove={vi.fn()}
          onEdit={onEdit}
        >
          <span>Milk</span>
        </SwipeRow>
      </ul>,
    );
    const content = document.querySelector('[data-swipe-row-content]')!;
    fireEvent.pointerDown(content, { pointerId: 1, clientX: 50, clientY: 20 });
    await act(() => vi.advanceTimersByTimeAsync(300));
    fireEvent.pointerUp(content, { pointerId: 1, clientX: 50, clientY: 20 });
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(onEdit).not.toHaveBeenCalled();

    fireEvent.pointerDown(content, { pointerId: 2, clientX: 50, clientY: 20 });
    await act(() => vi.advanceTimersByTimeAsync(659));
    expect(onEdit).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('describes the row and opens its confirmation through the ref', () => {
    const ref = createRef<SwipeRowHandle>();
    render(
      <ul>
        <SwipeRow
          ref={ref}
          name="Milk"
          labels={{ ...labels, hint: 'Swipe left to remove, hold to edit' }}
          onRemove={vi.fn()}
        >
          <span>Milk</span>
        </SwipeRow>
      </ul>,
    );
    const row = screen.getByRole('group', { name: 'Milk' });
    const describedBy = row.getAttribute('aria-describedby') ?? '';
    expect(document.getElementById(describedBy)?.textContent).toBe(
      'Swipe left to remove, hold to edit',
    );
    act(() => ref.current?.askToRemove());
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Keep' }),
    );
  });
});
