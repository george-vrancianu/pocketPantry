import type { CatalogSearchResult } from './catalog';
import { statusOf, withMatch, type ReviewLine, type RowStatus } from './review';

/**
 * The Review screen's state as a pure reducer, so grouping and counting are
 * testable without React. `lines` holds every line, included or excluded, in
 * receipt order; the selectors split them.
 */
export type ReviewState = {
  lines: ReviewLine[];
  /** Rows shown as an edit panel. */
  open: Record<string, boolean>;
  /** The Member confirmed the row, or edited it while it was sure: always `ok`. */
  confirmed: Record<string, boolean>;
  /** A row's status when it was opened, so an open row stays in its group while being typed in. */
  held: Record<string, RowStatus>;
  /** The "Sigure" group shows its rows (otherwise one line of names). */
  sureOpen: boolean;
};

export type ReviewAction =
  | { type: 'toggle'; key: string }
  | { type: 'open'; key: string }
  | { type: 'confirm'; key: string }
  | { type: 'remove'; key: string }
  | { type: 'restore'; key: string }
  | { type: 'update'; key: string; patch: Partial<ReviewLine> }
  | {
      type: 'changeMatch';
      key: string;
      match: CatalogSearchResult;
      today: Date;
    }
  | { type: 'toggleSureGroup' };

const isIncluded = (line: ReviewLine) => line.excluded === null;

/** The group a row sits in: frozen while it is open. */
export function rowGroup(state: ReviewState, line: ReviewLine): RowStatus {
  return state.held[line.key] ?? statusOf(line, !!state.confirmed[line.key]);
}

/** Open a row, remembering its status; opening twice changes nothing. */
function openRow(state: ReviewState, key: string): ReviewState {
  if (state.open[key]) return state;
  const line = state.lines.find((l) => l.key === key);
  if (!line) return state;
  const group = rowGroup(state, line);
  return {
    ...state,
    open: { ...state.open, [key]: true },
    // A sure row opened to fix it must be on screen, so the Sigure group shows; a row to check does not need it.
    sureOpen: group === 'ok' ? true : state.sureOpen,
    held: { ...state.held, [key]: group },
  };
}

function shutRow(state: ReviewState, key: string): ReviewState {
  const open = { ...state.open };
  const held = { ...state.held };
  delete open[key];
  delete held[key];
  return { ...state, open, held };
}

export function initReviewState(lines: ReviewLine[]): ReviewState {
  const initial: ReviewState = {
    lines,
    open: {},
    confirmed: {},
    held: {},
    sureOpen: true,
  };
  return lines
    .filter(isIncluded)
    .filter((line) => statusOf(line, false) === 'low')
    .reduce((state, line) => openRow(state, line.key), initial);
}

const mapLine = (
  state: ReviewState,
  key: string,
  change: (line: ReviewLine) => ReviewLine,
): ReviewState => ({
  ...state,
  lines: state.lines.map((line) => (line.key === key ? change(line) : line)),
});

export function reviewReducer(
  state: ReviewState,
  action: ReviewAction,
): ReviewState {
  switch (action.type) {
    case 'toggle':
      return state.open[action.key]
        ? shutRow(state, action.key)
        : openRow(state, action.key);
    case 'open':
      return openRow(state, action.key);
    case 'confirm':
      // The row moves to Confident, which must show for the row to take focus.
      return shutRow(
        {
          ...state,
          sureOpen: true,
          confirmed: { ...state.confirmed, [action.key]: true },
        },
        action.key,
      );
    case 'remove':
      return shutRow(
        mapLine(state, action.key, (line) => ({
          ...line,
          excluded: { reason: 'removed' },
        })),
        action.key,
      );
    case 'restore': {
      const restored = mapLine(state, action.key, (line) => ({
        ...line,
        excluded: null,
      }));
      const line = restored.lines.find((l) => l.key === action.key);
      return line && statusOf(line, !!state.confirmed[action.key]) !== 'ok'
        ? openRow(restored, action.key)
        : { ...restored, sureOpen: true };
    }
    case 'update': {
      const line = state.lines.find((l) => l.key === action.key);
      if (!line) return state;
      // Editing a sure row keeps it sure, even if the edit would otherwise flag it.
      const sure = rowGroup(state, line) === 'ok';
      const next = mapLine(state, action.key, (l) => ({
        ...l,
        ...action.patch,
      }));
      return sure
        ? { ...next, confirmed: { ...next.confirmed, [action.key]: true } }
        : next;
    }
    case 'changeMatch':
      return mapLine(state, action.key, (line) =>
        withMatch(line, action.match, action.today),
      );
    case 'toggleSureGroup':
      return { ...state, sureOpen: !state.sureOpen };
  }
}

/** Rows to check (low, then qty, each in receipt order), sure rows, and excluded lines. */
export function reviewGroups(state: ReviewState) {
  const included = state.lines.filter(isIncluded);
  const inGroup = (status: RowStatus) =>
    included.filter((line) => rowGroup(state, line) === status);
  return {
    review: [...inGroup('low'), ...inGroup('qty')],
    sure: inGroup('ok'),
    excluded: state.lines.filter((line) => !isIncluded(line)),
  };
}

export function reviewCounts(state: ReviewState) {
  const { review, excluded } = reviewGroups(state);
  return {
    save: state.lines.length - excluded.length,
    check: review.length,
    excluded: excluded.length,
  };
}
