import {
  Alert,
  Box,
  Button,
  Collapse,
  IconButton,
  PlusIcon,
  CloseIcon,
  Typography,
} from '@pocket-pantry/ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import type { NewShoppingItem } from '../../../lib/shopping';
import { useDismissSuggestion, type Suggestion } from '../../../lib/staples';

export type SuggestionsSectionProps = {
  /** Missing Staples in Aisle order. */
  suggestions: Suggestion[];
  /** Adds through the normal add endpoint; resolves true when added. */
  onAdd: (item: NewShoppingItem) => Promise<boolean>;
};

/** A collapsible group at the top of the Shopping List: one tap adds, the cross dismisses for the Family. */
export function SuggestionsSection({
  suggestions,
  onAdd,
}: SuggestionsSectionProps) {
  const { t } = useTranslation('staples');
  const [open, setOpen] = useState(true);
  const panelId = useId();
  const dismiss = useDismissSuggestion();

  if (suggestions.length === 0) return null;

  return (
    <Box component="section" aria-label={t('suggestions.title')}>
      <Box
        component="button"
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        sx={{
          display: 'flex',
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
          mx: 0.5,
          mb: 1,
          p: 0,
          border: 0,
          bgcolor: 'transparent',
          color: 'text.secondary',
          font: 'inherit',
          cursor: 'pointer',
        }}
      >
        <Typography component="h2" variant="sectionLabel">
          {t('suggestions.heading', { count: suggestions.length })}
        </Typography>
        <Typography component="span" variant="meta" aria-hidden="true">
          {open ? '−' : '+'}
        </Typography>
      </Box>
      {dismiss.error ? (
        <Box sx={{ mb: 1 }}>
          <Alert>{translateApiError(t, dismiss.error)}</Alert>
        </Box>
      ) : null}
      <Collapse open={open}>
        <Box
          component="ul"
          id={panelId}
          sx={{
            listStyle: 'none',
            m: 0,
            py: 0,
            px: 0.75,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: '20px',
            overflow: 'hidden',
          }}
        >
          {suggestions.map((suggestion) => (
            <SuggestionRow
              key={suggestion.ingredientId}
              suggestion={suggestion}
              onAdd={onAdd}
              onDismiss={(id) => dismiss.mutate(id)}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

function SuggestionRow({
  suggestion,
  onAdd,
  onDismiss,
}: {
  suggestion: Suggestion;
  onAdd: SuggestionsSectionProps['onAdd'];
  onDismiss: (ingredientId: string) => void;
}) {
  const { t } = useTranslation('staples');
  const amount =
    suggestion.quantity === null
      ? null
      : suggestion.unit
        ? `${suggestion.quantity} ${t(`common:units.${suggestion.unit}`)}`
        : String(suggestion.quantity);

  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        minHeight: 50,
        pl: 1.25,
        '& + &': { borderTop: 1, borderColor: 'divider' },
      }}
    >
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          component="span"
          sx={{ display: 'block', fontSize: 15, fontWeight: 600 }}
        >
          {suggestion.name}
        </Typography>
        {amount ? (
          <Typography
            component="span"
            variant="meta"
            color="text.secondary"
            sx={{ display: 'block' }}
          >
            {amount}
          </Typography>
        ) : null}
      </Box>
      <Button
        startIcon={<PlusIcon />}
        aria-label={t('suggestions.add', { name: suggestion.name })}
        onClick={() =>
          void onAdd({
            ingredientId: suggestion.ingredientId,
            ...(suggestion.quantity !== null
              ? { quantity: suggestion.quantity }
              : {}),
            ...(suggestion.unit ? { unit: suggestion.unit } : {}),
          })
        }
      >
        {t('suggestions.addShort')}
      </Button>
      <IconButton
        label={t('suggestions.dismiss', { name: suggestion.name })}
        tone="plain"
        size={40}
        onClick={() => onDismiss(suggestion.ingredientId)}
      >
        <CloseIcon size={18} />
      </IconButton>
    </Box>
  );
}
