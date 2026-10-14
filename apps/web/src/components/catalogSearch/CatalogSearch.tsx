import {
  Box,
  tokens,
  usePrefersReducedMotion,
  visuallyHidden,
} from '@pocket-pantry/ui';
import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useCatalogSearch, type CatalogSearchResult } from '../../lib/catalog';
import { ErrorRow } from './ErrorRow';
import { NoMatchRow } from './NoMatchRow';
import { SearchField } from './SearchField';
import { SearchResultRow } from './SearchResultRow';
import { SearchSkeleton } from './SearchSkeleton';

export type CatalogSearchProps = {
  onSelect: (ingredient: CatalogSearchResult) => void;
  autoFocus?: boolean;
  /** Called with the text as the Member types it (not on selection). */
  onQueryChange?: (query: string) => void;
  /** Accessible name of the input and its listbox; defaults to the generic search label. */
  label?: string;
  /** Id of an element that describes the input. */
  describedBy?: string;
  /** Show the default unit as a chip on each row (default true). */
  showUnit?: boolean;
  /**
   * The picked ingredient, shown as a token. The host owns it: the token is
   * cleared (by ×, a tap, Backspace/Delete or typing) by calling
   * `onQueryChange('')`, so a host passing `selected` must drop it when
   * `onQueryChange` reports an empty query (and may also drop it for any change).
   */
  selected?: CatalogSearchResult | null;
};

/**
 * Reusable Catalog search (WAI-ARIA combobox with a listbox popup). Names come
 * back in the Member's locale; ArrowUp/Down move (wrapping), Home/End jump,
 * Enter selects, Escape closes. A pick can be shown as a token the host owns.
 */
export function CatalogSearch({
  onSelect,
  autoFocus,
  onQueryChange,
  label,
  describedBy,
  showUnit = true,
  selected = null,
}: CatalogSearchProps) {
  const { t, i18n } = useTranslation('catalog');
  const id = useId();
  const name = label ?? t('search.label');
  const listId = `${id}-list`;
  const optionId = (index: number) => `${id}-option-${index}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const search = useCatalogSearch(query, i18n.language);
  const typed = query.trim();

  // A failed search keeps the rows that were already showing, under the error row.
  const [lastRows, setLastRows] = useState<CatalogSearchResult[]>([]);
  if (search.data && search.data !== lastRows) setLastRows(search.data);
  const failed = typed !== '' && search.active && search.isError;
  const loaded = search.data ?? (failed ? lastRows : undefined);
  // The debounce lags a cleared field, so go by what is typed now.
  const results = typed && search.active ? (loaded ?? []) : [];

  const firstLoad = typed !== '' && search.active && !search.data && !failed;
  // Any data on hand (even none matching) keeps the panel and shows the spinner.
  const refetching =
    typed !== '' && search.data !== undefined && search.isSearching && !failed;
  const noMatch =
    typed !== '' &&
    search.active &&
    search.data !== undefined &&
    results.length === 0 &&
    !failed;

  const showPanel = open && !selected;
  const expanded = showPanel && results.length > 0;
  const active = activeIndex < results.length ? activeIndex : -1;

  const change = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    onQueryChange?.(event.target.value);
    setOpen(true);
    setActiveIndex(-1);
  };

  const clear = () => {
    setQuery('');
    setOpen(false);
    setActiveIndex(-1);
    onQueryChange?.('');
    inputRef.current?.focus();
  };

  const select = (ingredient: CatalogSearchResult) => {
    setQuery(ingredient.name);
    setOpen(false);
    setActiveIndex(-1);
    onSelect(ingredient);
  };

  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (selected) {
      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault();
        clear();
      } else if (
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        // Typing over a token replaces it; the key then lands in the emptied input.
        clear();
      }
      return;
    }
    if (event.key === 'ArrowDown' && results.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((active + 1) % results.length);
    } else if (event.key === 'ArrowUp' && results.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(active <= 0 ? results.length - 1 : active - 1);
    } else if (event.key === 'Home' && expanded && active >= 0) {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End' && expanded && active >= 0) {
      event.preventDefault();
      setActiveIndex(results.length - 1);
    } else if (event.key === 'Enter' && expanded && active >= 0) {
      event.preventDefault();
      select(results[active]);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  let status = '';
  if (showPanel && typed && search.active) {
    if (failed) status = t('search.failed');
    else if (firstLoad || (results.length === 0 && search.isSearching)) {
      status = t('search.searching');
    } else if (results.length === 0) status = t('search.noResults');
    else status = t('search.resultCount', { count: results.length });
  } else if (showPanel && typed) {
    // Typing ahead of the debounce.
    status = t('search.searching');
  }

  const panelVisible =
    showPanel && typed !== '' && (expanded || firstLoad || failed || noMatch);

  return (
    <Box sx={{ position: 'relative' }}>
      <SearchField
        inputRef={inputRef}
        label={name}
        value={query}
        onChange={change}
        onKeyDown={keyDown}
        onFocus={() => {
          if (typed) setOpen(true);
        }}
        autoFocus={autoFocus}
        describedBy={describedBy}
        listboxId={listId}
        expanded={expanded}
        activeOptionId={expanded && active >= 0 ? optionId(active) : undefined}
        selected={selected}
        onClear={clear}
        refetching={refetching}
        reducedMotion={reducedMotion}
      />
      <Box role="status" aria-live="polite" sx={visuallyHidden}>
        {status}
      </Box>
      <Box
        hidden={!panelVisible}
        sx={{
          mt: 1,
          borderRadius: `${tokens.radius.card}px`,
          border: `1px solid ${tokens.color.line}`,
          backgroundColor: tokens.color.surface,
          overflow: 'hidden',
        }}
      >
        {failed ? (
          <ErrorRow
            onRetry={() => {
              // The error row unmounts as the refetch starts; keep focus in the field.
              inputRef.current?.focus();
              void search.refetch();
            }}
          />
        ) : null}
        {firstLoad ? <SearchSkeleton animate={!reducedMotion} /> : null}
        {noMatch ? <NoMatchRow query={typed} /> : null}
        <Box
          component="ul"
          id={listId}
          role="listbox"
          aria-label={name}
          hidden={!expanded}
          sx={{ listStyle: 'none', m: 0, p: 0 }}
        >
          {expanded &&
            results.map((result, index) => (
              <SearchResultRow
                key={result.id}
                id={optionId(index)}
                result={result}
                query={typed}
                showUnit={showUnit}
                active={index === active}
                dimmed={refetching && !reducedMotion && index !== active}
                first={index === 0}
                onSelect={() => select(result)}
              />
            ))}
        </Box>
      </Box>
    </Box>
  );
}
