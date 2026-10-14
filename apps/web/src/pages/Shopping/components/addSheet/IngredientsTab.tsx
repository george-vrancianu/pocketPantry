import { Alert, Box, Typography, tokens } from '@pocket-pantry/ui';
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type KeyboardEvent,
  type RefObject,
  type SetStateAction,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCatalogSearch,
  type CatalogSearchResult,
  type Unit,
} from '../../../../lib/catalog';
import { AmountField } from '../../../../components/AmountField';
import { normalizeName } from '../../../../lib/normalizeName';
import { parseAmountText } from '../../../../lib/pantry';
import {
  isOnList,
  uncheckedItems,
  useShoppingList,
  type NewShoppingItem,
  type ShoppingItem,
} from '../../../../lib/shopping';
import type { Suggestion } from '../../../../lib/suggestions';
import { EmptySearch } from './EmptySearch';
import { useSheetToast } from './SheetFooter';

import { INNER_RADIUS, LIST_RADIUS, ResultRow } from './ResultRow';
import { SearchField } from './SearchField';

/** A result row: a Catalog match, or the typed text as an Unmatched item. */
type Row =
  | { key: string; kind: 'catalog'; result: CatalogSearchResult }
  | { key: 'free-text'; kind: 'unmatched'; name: string };

/** The row being filled in; only one is open at a time. */
export type OpenRow = {
  key: string;
  quantity: string;
  unit: Unit | '';
  /** An add was tried, so an invalid amount now shows its error. */
  attempted?: boolean;
};

/** What the Ingredients tab remembers; the Add sheet owns it so it survives a tab switch. */
export type IngredientsState = {
  query: string;
  open: OpenRow | null;
  /** Ingredient ids added from a Suggestion chip, until the Suggestions drop them. */
  suggestionsAdded: string[];
};

export const emptyIngredients: IngredientsState = {
  query: '',
  open: null,
  suggestionsAdded: [],
};

export type IngredientsTabProps = {
  state: IngredientsState;
  onStateChange: Dispatch<SetStateAction<IngredientsState>>;
  /** The search input, so the sheet can focus it once it has slid in. */
  searchRef: RefObject<HTMLInputElement | null>;
  adding: boolean;
  /** Resolves true when added; on false the sheet shows `error`. */
  onAdd: (item: NewShoppingItem) => Promise<boolean>;
  /** Why the last add failed, shown above the search. */
  error: string | null;
  staples: Suggestion[];
  usedUp: Suggestion[];
  runningLow: Suggestion[];
  /** Called after each successful add. */
  onAdded: () => void;
  /** Opens a template's apply view. */
  onOpenTemplate: (id: string) => void;
  /** Switches to the Templates tab. */
  onSeeAllTemplates: () => void;
};

/** The Ingredients tab: search the Catalog, open a result, give an amount, add. */
export function IngredientsTab({
  state,
  onStateChange,
  searchRef,
  adding,
  onAdd,
  error,
  staples,
  usedUp,
  runningLow,
  onAdded,
  onOpenTemplate,
  onSeeAllTemplates,
}: IngredientsTabProps) {
  const { t, i18n } = useTranslation('shopping');
  const toast = useSheetToast();
  const listboxId = useId();
  const { query, open } = state;
  // What adding will do, following the server: it merges only on the same Ingredient (or typed name) and unit.
  const mergeHint = (lines: ShoppingItem[], unit: Unit | '') => {
    if (lines.length === 0) return null;
    if (lines.some((line) => (line.unit ?? '') === unit)) {
      return t('search.onListHint');
    }
    const named = [
      ...new Set(
        lines.flatMap((line) =>
          line.unit ? [t(`common:units.${line.unit}`)] : [],
        ),
      ),
    ];
    if (named.length === 0) return t('search.onListNoUnit');
    if (lines.some((line) => !line.unit)) {
      return t('search.onListOtherUnits');
    }
    return t('search.onListOtherUnit', {
      unit: new Intl.ListFormat(i18n.language, { type: 'conjunction' }).format(
        named,
      ),
    });
  };
  const setOpen = (next: OpenRow | null) =>
    onStateChange((s) => ({ ...s, open: next }));
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Where the amount panel sits: the open option's bottom edge, and its height.
  const [panel, setPanel] = useState({ top: 0, height: 0 });

  const search = useCatalogSearch(query, i18n.language);
  // The loaded list (shared with the screen behind), for the "On list" hints.
  const list = useShoppingList(i18n.language);
  const unchecked = uncheckedItems(list.data);
  const typed = query.trim();
  // The debounce lags a cleared field, so go by what is typed now.
  const results = typed && search.active ? (search.data ?? []) : [];
  const rows: Row[] = results.map((result) => ({
    key: result.id,
    kind: 'catalog',
    result,
  }));
  if (
    typed &&
    !search.isSearching &&
    !results.some(
      (result) => normalizeName(result.name) === normalizeName(typed),
    )
  ) {
    rows.push({ key: 'free-text', kind: 'unmatched', name: typed });
  }

  // Rows come and go as results load; never point at one that is gone.
  const active = activeIndex < rows.length ? activeIndex : -1;
  const optionId = (index: number) => `${listboxId}-option-${index}`;
  const openIndex = rows.findIndex((row) => row.key === open?.key);
  const openRow = rows[openIndex];
  const rowName = (row: Row) =>
    row.kind === 'catalog' ? row.result.name : row.name;
  // Unmatched lines merge on the normalised typed name, as the server does.
  const onListLinesOf = (row: Row) =>
    unchecked.filter((line) =>
      isOnList(
        line,
        row.kind === 'catalog'
          ? { ingredientId: row.result.id, name: row.result.name }
          : { ingredientId: null, name: row.name },
      ),
    );
  const panelShown = Boolean(open && openRow);
  // The panel overlays the list (so the listbox stays a real box of options only)
  // and the open option makes room for it; follow both as they resize, and the
  // list itself, since a row above the option resizing moves it.
  useLayoutEffect(() => {
    const list = listRef.current;
    const panelEl = panelRef.current;
    const option = openIndex >= 0 ? list?.children[openIndex] : undefined;
    if (!list || !panelEl || !(option instanceof HTMLElement)) {
      setPanel((prev) => (prev.height === 0 ? prev : { top: 0, height: 0 }));
      return;
    }
    const measure = () => {
      const next = {
        top: option.offsetTop + option.offsetHeight,
        height: panelEl.offsetHeight,
      };
      setPanel((prev) =>
        prev.top === next.top && prev.height === next.height ? prev : next,
      );
    };
    measure();
    // jsdom has no ResizeObserver; the measurement above is then all we get.
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(panelEl);
    observer.observe(option);
    observer.observe(list);
    return () => observer.disconnect();
  }, [openIndex, rows.length, panelShown]);
  const hint =
    open && openRow ? mergeHint(onListLinesOf(openRow), open.unit) : null;
  const amount = parseAmountText(open?.quantity ?? '');

  const toggle = (row: Row) => {
    setOpen(
      open?.key === row.key
        ? null
        : {
            key: row.key,
            quantity: '',
            unit: row.kind === 'catalog' ? row.result.defaultUnit : '',
          },
    );
  };

  const change = (value: string) => {
    onStateChange((s) => ({ ...s, query: value, open: null }));
    setActiveIndex(-1);
  };

  const keyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' && rows.length > 0) {
      event.preventDefault();
      setActiveIndex((active + 1) % rows.length);
    } else if (event.key === 'ArrowUp' && rows.length > 0) {
      event.preventDefault();
      setActiveIndex(active <= 0 ? rows.length - 1 : active - 1);
    } else if (event.key === 'Enter' && rows.length > 0) {
      event.preventDefault();
      const row = rows[Math.max(active, 0)];
      if (row) toggle(row);
    }
  };

  const submit = async () => {
    if (!open || !openRow) return;
    if (!amount.valid) {
      setOpen({ ...open, attempted: true });
      return;
    }
    const name = rowName(openRow);
    const added = await onAdd({
      ...(openRow.kind === 'catalog'
        ? { ingredientId: openRow.result.id }
        : { name }),
      ...(amount.value !== null ? { quantity: amount.value } : {}),
      ...(open.unit ? { unit: open.unit } : {}),
    });
    // On failure everything typed stays, and the sheet shows the error.
    if (!added) return;
    toast.show(t('added', { name }));
    onAdded();
    onStateChange((s) => ({
      ...emptyIngredients,
      suggestionsAdded: s.suggestionsAdded,
    }));
    setActiveIndex(-1);
    searchRef.current?.focus();
  };

  let status = '';
  if (typed && search.active && !search.isSearching) {
    status =
      results.length > 0
        ? t('search.matches', { count: results.length })
        : t('search.noMatch');
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
      {error ? <Alert>{error}</Alert> : null}
      <SearchField
        value={query}
        onChange={change}
        onClear={() => {
          change('');
          searchRef.current?.focus();
        }}
        onKeyDown={keyDown}
        inputRef={searchRef}
        listboxId={listboxId}
        expanded={rows.length > 0}
        activeOptionId={active >= 0 ? optionId(active) : undefined}
      />
      {typed ? null : (
        <EmptySearch
          staples={staples}
          usedUp={usedUp}
          runningLow={runningLow}
          addedIds={state.suggestionsAdded}
          onAdd={onAdd}
          onOpenTemplate={onOpenTemplate}
          onSeeAllTemplates={onSeeAllTemplates}
          onAdded={(ingredientId) => {
            onAdded();
            onStateChange((s) => ({
              ...s,
              suggestionsAdded: [...s.suggestionsAdded, ingredientId],
            }));
          }}
        />
      )}
      <Typography
        role="status"
        variant="sectionLabel"
        sx={{ minHeight: '1.5em', color: tokens.color.muted }}
      >
        {status}
      </Typography>
      <Box
        hidden={rows.length === 0}
        sx={{
          position: 'relative',
          display: rows.length === 0 ? 'none' : 'block',
          borderRadius: `${LIST_RADIUS}px`,
          border: `1px solid ${tokens.color.line}`,
          backgroundColor: tokens.color.surface,
        }}
      >
        {/* Only options in the listbox. The open row's amount panel is a sibling
            laid over the space the open option leaves under itself. */}
        <Box
          ref={listRef}
          role="listbox"
          id={listboxId}
          aria-label={t('search.placeholder')}
          sx={{ display: 'flex', flexDirection: 'column' }}
        >
          {rows.map((row, index) => (
            <ResultRow
              key={row.key}
              id={optionId(index)}
              ingredientId={row.kind === 'catalog' ? row.result.id : undefined}
              name={
                row.kind === 'unmatched'
                  ? t('search.freeText', { name: rowName(row) })
                  : rowName(row)
              }
              highlight={row.kind === 'catalog' ? typed : undefined}
              meta={
                row.kind === 'catalog'
                  ? `${row.result.leafCategory.name} · ${row.result.parentCategory.aisle.name}`
                  : t('search.freeTextHint')
              }
              aisleId={
                row.kind === 'catalog'
                  ? row.result.parentCategory.aisle.id
                  : undefined
              }
              onList={onListLinesOf(row).length > 0}
              open={open?.key === row.key}
              active={index === active}
              onToggle={() => toggle(row)}
              spaceBelow={index === openIndex ? panel.height : 0}
              first={index === 0}
              last={index === rows.length - 1}
            />
          ))}
        </Box>
        {open && openRow ? (
          <Box
            ref={panelRef}
            sx={{
              position: 'absolute',
              top: panel.top,
              left: 0,
              right: 0,
              backgroundColor: tokens.color.subtle,
              borderRadius:
                openIndex === rows.length - 1
                  ? `0 0 ${INNER_RADIUS}px ${INNER_RADIUS}px`
                  : 0,
            }}
          >
            <Box sx={{ p: '0 14px 12px 64px' }}>
              <AmountField
                name={rowName(openRow)}
                quantity={open.quantity}
                unit={open.unit}
                onQuantityChange={(quantity, unit) =>
                  setOpen({
                    ...open,
                    quantity,
                    ...(unit !== undefined ? { unit } : {}),
                  })
                }
                onUnitChange={(unit) => setOpen({ ...open, unit })}
                error={
                  open.attempted && !amount.valid
                    ? t('finish.quantityInvalid')
                    : null
                }
                onSubmit={() => void submit()}
                submit={{
                  label: t('amount.add', { name: rowName(openRow) }),
                  disabled: adding,
                }}
              />
            </Box>
            {hint ? (
              <Typography
                sx={{
                  p: '0 14px 12px 64px',
                  fontSize: 12.5,
                  color: tokens.color.muted,
                }}
              >
                {hint}
              </Typography>
            ) : null}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
