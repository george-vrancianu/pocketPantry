import {
  Box,
  CloseIcon,
  IconButton,
  SearchIcon,
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
import { useCatalogSearch, type CatalogSearchResult } from '../lib/catalog';
import { SearchResultRow } from './catalogSearch/SearchResultRow';
import { SearchSkeleton } from './catalogSearch/SearchSkeleton';
import { SelectedToken } from './catalogSearch/SelectedToken';
import { IngredientIconSlot } from './IngredientIconSlot';

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
  /** The picked ingredient, shown as a token; host-controlled so it can clear it. */
  selected?: CatalogSearchResult | null;
};

const SPINNER_SIZE = 18;

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
  const { color } = tokens;
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
  const lastRows = useRef<CatalogSearchResult[]>([]);
  if (search.data) lastRows.current = search.data;
  const failed = typed !== '' && search.active && search.isError;
  const loaded = search.data ?? (failed ? lastRows.current : undefined);
  // The debounce lags a cleared field, so go by what is typed now.
  const results = typed && search.active ? (loaded ?? []) : [];

  const firstLoad = typed !== '' && search.active && !search.data && !failed;
  const refetching = results.length > 0 && search.isSearching && !failed;
  const noMatch =
    typed !== '' &&
    search.active &&
    search.data !== undefined &&
    !search.isSearching &&
    results.length === 0;

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

  const rightSlot = selected ? null : refetching ? (
    <Box
      data-testid="search-spinner"
      data-spinning={reducedMotion ? 'false' : 'true'}
      aria-hidden="true"
      sx={{
        width: SPINNER_SIZE,
        height: SPINNER_SIZE,
        m: '9px',
        boxSizing: 'border-box',
        borderRadius: '50%',
        border: `2px solid ${color.accentTint}`,
        borderTopColor: color.accent,
        ...(reducedMotion
          ? { opacity: 0.7 }
          : {
              '@keyframes pp-search-spin': {
                to: { transform: 'rotate(360deg)' },
              },
              animation: 'pp-search-spin 800ms linear infinite',
            }),
      }}
    />
  ) : query ? (
    <IconButton
      label={t('search.clear')}
      tone="plain"
      size={34}
      onMouseDown={(event) => event.preventDefault()}
      onClick={clear}
    >
      <CloseIcon size={18} />
    </IconButton>
  ) : null;

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        sx={{
          position: 'relative',
          height: 50,
          display: 'flex',
          alignItems: 'center',
          borderRadius: '16px',
          border: `1.5px solid ${selected ? 'transparent' : color.line}`,
          backgroundColor: color.surface,
          '&:focus-within': {
            borderColor: selected ? 'transparent' : color.accent,
            boxShadow: `0 0 0 3px ${color.accentTint}`,
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: 14,
            display: 'flex',
            color: color.muted,
          }}
        >
          <SearchIcon size={20} />
        </Box>
        <Box
          component="input"
          ref={inputRef}
          role="combobox"
          aria-label={
            selected ? t('search.selectedLabel', { name: selected.name }) : name
          }
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-describedby={describedBy}
          aria-activedescendant={
            expanded && active >= 0 ? optionId(active) : undefined
          }
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          autoFocus={autoFocus}
          placeholder={t('search.placeholder')}
          value={query}
          onChange={change}
          onKeyDown={keyDown}
          onFocus={() => {
            if (typed) setOpen(true);
          }}
          sx={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            pl: '46px',
            pr: '44px',
            border: 0,
            outline: 0,
            background: 'transparent',
            font: 'inherit',
            fontSize: 16,
            fontWeight: 500,
            color: color.ink,
            '&::placeholder': { color: color.muted },
            // As a token the real input stays for focus and semantics, but unseen.
            ...(selected ? visuallyHidden : {}),
          }}
        />
        <Box sx={{ position: 'absolute', right: 6, display: 'flex' }}>
          {rightSlot}
        </Box>
        {selected ? (
          <SelectedToken selected={selected} onClear={clear} />
        ) : null}
      </Box>
      <Box role="status" aria-live="polite" sx={visuallyHidden}>
        {status}
      </Box>
      <Box
        hidden={
          !(showPanel && typed && (expanded || firstLoad || failed || noMatch))
        }
        sx={{
          mt: 1,
          borderRadius: '20px',
          border: `1px solid ${color.line}`,
          backgroundColor: color.surface,
          overflow: 'hidden',
          display:
            showPanel && typed && (expanded || firstLoad || failed || noMatch)
              ? 'block'
              : 'none',
        }}
      >
        {failed ? (
          <Box
            role="alert"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: '10px 14px',
              backgroundColor: color.urgentBg,
              color: color.urgentFg,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ fontSize: 15, fontWeight: 600 }}>
                {t('search.errorTitle')}
              </Box>
              <Box sx={{ fontSize: 13 }}>{t('search.errorHint')}</Box>
            </Box>
            <Box
              component="button"
              type="button"
              // Keep focus in the input.
              onMouseDown={(event: { preventDefault: () => void }) =>
                event.preventDefault()
              }
              onClick={() => void search.refetch()}
              sx={{
                flexShrink: 0,
                px: '12px',
                py: '9px',
                border: `1.5px solid ${color.urgentFg}`,
                borderRadius: 999,
                background: 'none',
                color: color.urgentFg,
                font: 'inherit',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {t('search.retry')}
            </Box>
          </Box>
        ) : null}
        {firstLoad ? <SearchSkeleton animate={!reducedMotion} /> : null}
        {noMatch ? (
          <Box
            onMouseDown={(event) => event.preventDefault()}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: '10px 14px',
            }}
          >
            <Box sx={{ color: color.muted, display: 'flex' }}>
              <IngredientIconSlot />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ fontSize: 15, fontWeight: 600 }}>
                {t('search.noMatchFor', { query: typed })}
              </Box>
              <Box sx={{ fontSize: 13, color: color.muted }}>
                {t('search.noMatchHint')}
              </Box>
            </Box>
          </Box>
        ) : null}
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
