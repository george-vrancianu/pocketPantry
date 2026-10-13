import { Alert, Box, Typography, tokens, useToast } from '@pocket-pantry/ui';
import {
  useId,
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
import { normalizeName } from '../../../../lib/normalizeName';
import { parseQuantity } from '../../../../lib/pantry';
import {
  useShoppingList,
  type NewShoppingItem,
  type ShoppingItem,
} from '../../../../lib/shopping';
import type { Suggestion } from '../../../../lib/suggestions';
import { EmptySearch } from './EmptySearch';
import { TOAST_ABOVE_SHEET } from './sheetToast';
import { AmountField } from './AmountField';
import { ResultRow } from './ResultRow';
import { SearchField } from './SearchField';

/** A result row: a Catalog match, or the typed text as an Unmatched item. */
type Row =
  | { key: string; kind: 'catalog'; result: CatalogSearchResult }
  | { key: 'free-text'; kind: 'free'; name: string };

/** The row being filled in; only one is open at a time. */
export type OpenRow = { key: string; quantity: string; unit: Unit | '' };

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
  /** Called after each successful add. */
  onAdded: () => void;
};

/** The Ingredients tab: search the Catalog, open a result, give an amount, add. */
export function IngredientsTab({
  state,
  onStateChange,
  searchRef: searchInput,
  adding,
  onAdd,
  error,
  staples,
  usedUp,
  onAdded,
}: IngredientsTabProps) {
  const { t, i18n } = useTranslation('shopping');
  const toast = useToast();
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

  const search = useCatalogSearch(query, i18n.language);
  // The loaded list (shared with the screen behind), for the "On list" hints.
  const list = useShoppingList(i18n.language);
  const unchecked = (list.data?.groups ?? []).flatMap((group) =>
    group.items.filter((line) => !line.checked),
  );
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
    !results.some((result) => result.name.toLowerCase() === typed.toLowerCase())
  ) {
    rows.push({ key: 'free-text', kind: 'free', name: typed });
  }

  // Rows come and go as results load; never point at one that is gone.
  const active = activeIndex < rows.length ? activeIndex : -1;
  const optionId = (index: number) => `${listboxId}-option-${index}`;
  const openRow = rows.find((row) => row.key === open?.key);
  const amount = parseQuantity((open?.quantity ?? '').replace(',', '.'));

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
    if (!open || !openRow || !amount.valid) return;
    const name =
      openRow.kind === 'catalog' ? openRow.result.name : openRow.name;
    const added = await onAdd({
      ...(openRow.kind === 'catalog'
        ? { ingredientId: openRow.result.id }
        : { name }),
      ...(amount.value !== null ? { quantity: amount.value } : {}),
      ...(open.unit ? { unit: open.unit } : {}),
    });
    // On failure everything typed stays, and the sheet shows the error.
    if (!added) return;
    toast.show(t('added', { name }), { bottom: TOAST_ABOVE_SHEET });
    onAdded();
    onStateChange((s) => ({
      ...emptyIngredients,
      suggestionsAdded: s.suggestionsAdded,
    }));
    setActiveIndex(-1);
    searchInput.current?.focus();
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
          searchInput.current?.focus();
        }}
        onKeyDown={keyDown}
        inputRef={searchInput}
        listboxId={listboxId}
        expanded={rows.length > 0}
        activeOptionId={active >= 0 ? optionId(active) : undefined}
      />
      {typed ? null : (
        <EmptySearch
          staples={staples}
          usedUp={usedUp}
          addedIds={state.suggestionsAdded}
          onAdd={onAdd}
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
        role="listbox"
        id={listboxId}
        aria-label={t('search.placeholder')}
        hidden={rows.length === 0}
        sx={{
          borderRadius: '20px',
          border: `1px solid ${tokens.color.line}`,
          backgroundColor: tokens.color.surface,
        }}
      >
        {rows.map((row, index) => {
          const name = row.kind === 'catalog' ? row.result.name : row.name;
          const isOpen = open?.key === row.key;
          // Unmatched lines merge on the normalised typed name, as the server does.
          const onListLines = unchecked.filter((line) =>
            row.kind === 'catalog'
              ? line.ingredientId === row.result.id
              : line.ingredientId === null &&
                normalizeName(line.name) === normalizeName(row.name),
          );
          const hint =
            isOpen && open ? mergeHint(onListLines, open.unit) : null;
          return (
            <ResultRow
              key={row.key}
              id={optionId(index)}
              free={row.kind === 'free'}
              name={row.kind === 'free' ? t('search.freeText', { name }) : name}
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
              onList={onListLines.length > 0}
              open={isOpen}
              active={index === active}
              onToggle={() => toggle(row)}
            >
              {isOpen && open ? (
                <>
                  <AmountField
                    name={name}
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
                    error={amount.valid ? null : t('finish.quantityInvalid')}
                    disabled={adding}
                    onSubmit={() => void submit()}
                  />
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
                </>
              ) : null}
            </ResultRow>
          );
        })}
      </Box>
    </Box>
  );
}
