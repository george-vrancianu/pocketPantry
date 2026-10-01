import { useBreakpointUp } from '@pocket-pantry/ui';
import type { WidgetSize } from './dashboard';

/** Dashboard grid columns: 2 on phones, 3 from 600 px, 4 from 900 px (handoff section 9). */
export type GridColumns = 2 | 3 | 4;

const TABLET_MIN = 600;
const LAPTOP_MIN = 900;

export function columnsForWidth(width: number): GridColumns {
  if (width >= LAPTOP_MIN) return 4;
  if (width >= TABLET_MIN) return 3;
  return 2;
}

/** The Dashboard grid's column count for the current viewport. */
export function useGridColumns(): GridColumns {
  const laptop = useBreakpointUp('md');
  const tablet = useBreakpointUp('sm');
  return laptop ? 4 : tablet ? 3 : 2;
}

/** Cells a Widget size covers. A tall Widget is only two rows high on a four-column grid. */
export function widgetSpan(size: WidgetSize, columns: GridColumns) {
  if (size === 'small') return { columns: 1, rows: 1 };
  if (size === 'tall' && columns === 4) return { columns: 2, rows: 2 };
  return { columns: 2, rows: 1 };
}

/** The sizes a Widget offers at this width: tall needs the four-column grid. */
export function sizesAvailableAt(
  sizes: WidgetSize[],
  columns: GridColumns,
): WidgetSize[] {
  return sizes.filter((size) => size !== 'tall' || columns === 4);
}
