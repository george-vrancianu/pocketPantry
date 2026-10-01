import { Box, TextField, Typography } from '@pocket-pantry/ui';
import { useId, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useCatalogSearch, type CatalogSearchResult } from '../lib/catalog';

export type CatalogSearchProps = {
  onSelect: (ingredient: CatalogSearchResult) => void;
  autoFocus?: boolean;
  /** Called with the text as the Member types it (not on selection). */
  onQueryChange?: (query: string) => void;
};

/**
 * Reusable Catalog search (WAI-ARIA combobox with a listbox popup). Names come
 * back in the Member's locale; ArrowUp/Down move, Enter selects, Escape closes.
 */
export function CatalogSearch({
  onSelect,
  autoFocus,
  onQueryChange,
}: CatalogSearchProps) {
  const { t, i18n } = useTranslation('catalog');
  const id = useId();
  const listId = `${id}-list`;
  const optionId = (index: number) => `${id}-option-${index}`;

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const search = useCatalogSearch(query, i18n.language);
  const results = search.data ?? [];
  const expanded = open && search.active && results.length > 0;

  const change = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    onQueryChange?.(event.target.value);
    setOpen(true);
    setActiveIndex(-1);
  };

  const select = (ingredient: CatalogSearchResult) => {
    setQuery(ingredient.name);
    setOpen(false);
    setActiveIndex(-1);
    onSelect(ingredient);
  };

  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && results.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === 'ArrowUp' && results.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (index <= 0 ? results.length - 1 : index - 1));
    } else if (event.key === 'Enter' && expanded && activeIndex >= 0) {
      event.preventDefault();
      select(results[activeIndex]);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  let status: string | null = null;
  if (open && search.active) {
    if (search.isSearching && results.length === 0) {
      status = t('search.searching');
    } else if (!search.isSearching && results.length === 0) {
      status = t('search.noResults');
    } else {
      status = t('search.resultCount', { count: results.length });
    }
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        label={t('search.label')}
        placeholder={t('search.placeholder')}
        value={query}
        onChange={change}
        onKeyDown={keyDown}
        autoFocus={autoFocus}
        autoComplete="off"
        slotProps={{
          htmlInput: {
            role: 'combobox',
            'aria-autocomplete': 'list',
            'aria-expanded': expanded,
            'aria-controls': listId,
            'aria-activedescendant':
              expanded && activeIndex >= 0 ? optionId(activeIndex) : undefined,
          },
        }}
      />
      <Typography
        role="status"
        variant="body2"
        color="text.secondary"
        sx={{ minHeight: '1.5em', mt: 0.5 }}
      >
        {status}
      </Typography>
      <Box
        component="ul"
        id={listId}
        role="listbox"
        aria-label={t('search.label')}
        hidden={!expanded}
        sx={{ listStyle: 'none', m: 0, p: 0 }}
      >
        {expanded &&
          results.map((result, index) => (
            <Box
              component="li"
              key={result.id}
              id={optionId(index)}
              role="option"
              aria-selected={index === activeIndex}
              // Keep focus in the input so the click handler still fires.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => select(result)}
              sx={{
                cursor: 'pointer',
                px: 2,
                py: 1,
                borderRadius: 1,
                bgcolor: index === activeIndex ? 'action.selected' : undefined,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Typography sx={{ display: 'block', fontWeight: 600 }}>
                {result.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: 'block' }}
              >
                {result.parentCategory.name} › {result.leafCategory.name}
              </Typography>
            </Box>
          ))}
      </Box>
    </Box>
  );
}
