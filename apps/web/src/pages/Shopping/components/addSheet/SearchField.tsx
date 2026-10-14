import {
  Box,
  CloseIcon,
  IconButton,
  SearchIcon,
  tokens,
  border,
  color,
  radius,
} from '@pocket-pantry/ui';
import type { KeyboardEvent, Ref } from 'react';
import { useTranslation } from 'react-i18next';

export type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  inputRef: Ref<HTMLInputElement>;
  /** Combobox wiring: the listbox it controls and whether it is showing. */
  listboxId: string;
  expanded: boolean;
  activeOptionId?: string;
};

/** The sheet's 50 pt search input: search icon, clear button, combobox attributes. */
export function SearchField({
  value,
  onChange,
  onClear,
  onKeyDown,
  inputRef,
  listboxId,
  expanded,
  activeOptionId,
}: SearchFieldProps) {
  const { t } = useTranslation('shopping');
  return (
    <Box
      sx={{
        position: 'relative',
        height: 50,
        display: 'flex',
        alignItems: 'center',
        borderRadius: radius.control,
        border: `${border.field} solid ${tokens.color.line}`,
        backgroundColor: color.fieldBg,
        '&:focus-within': {
          borderColor: tokens.color.accent,
          boxShadow: `0 0 0 3px ${tokens.color.accentTint}`,
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 14,
          display: 'flex',
          color: tokens.color.muted,
        }}
      >
        <SearchIcon size={20} />
      </Box>
      <Box
        component="input"
        ref={inputRef}
        role="combobox"
        aria-label={t('search.placeholder')}
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listboxId}
        aria-activedescendant={activeOptionId}
        autoComplete="off"
        placeholder={t('search.placeholder')}
        value={value}
        onChange={(event: { target: { value: string } }) =>
          onChange(event.target.value)
        }
        onKeyDown={onKeyDown}
        sx={{
          flex: 1,
          minWidth: 0,
          height: '100%',
          pl: '46px',
          pr: value ? '44px' : '14px',
          border: 0,
          outline: 0,
          background: 'transparent',
          font: 'inherit',
          fontSize: 16,
          fontWeight: 500,
          color: tokens.color.ink,
        }}
      />
      {value ? (
        <Box sx={{ position: 'absolute', right: 6, display: 'flex' }}>
          <IconButton
            label={t('search.clear')}
            tone="plain"
            size={34}
            onClick={onClear}
          >
            <CloseIcon size={18} />
          </IconButton>
        </Box>
      ) : null}
    </Box>
  );
}
