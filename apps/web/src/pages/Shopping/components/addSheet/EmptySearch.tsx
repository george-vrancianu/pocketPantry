import {
  Alert,
  Box,
  CheckIcon,
  CloseIcon,
  Link,
  PlusIcon,
  Typography,
  tokens,
  useToast,
} from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../../i18n/translateApiError';
import type { NewShoppingItem } from '../../../../lib/shopping';
import { TOAST_ABOVE_SHEET } from './sheetToast';
import { TemplateChips } from './TemplateChips';
import {
  useDismissSuggestion,
  type Suggestion,
} from '../../../../lib/suggestions';

export type EmptySearchProps = {
  /** Missing Staples in Aisle order. */
  staples: Suggestion[];
  /** Ingredients recently used up, in Aisle order. */
  usedUp: Suggestion[];
  /** Ingredient ids already added from a chip; their chips stay disabled until the Suggestions drop them. */
  addedIds: string[];
  /** Resolves true when added. */
  onAdd: (item: NewShoppingItem) => Promise<boolean>;
  /** Called with the Ingredient id after a successful add. */
  onAdded: (ingredientId: string) => void;
  /** Opens a template's apply view. */
  onOpenTemplate: (id: string) => void;
  /** Switches to the Templates tab. */
  onSeeAllTemplates: () => void;
};

/** What the Ingredients tab shows while the search is empty. */
export function EmptySearch(props: EmptySearchProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
      <SuggestionChips {...props} />
      <TemplateChips
        onOpenTemplate={props.onOpenTemplate}
        onSeeAll={props.onSeeAllTemplates}
      />
    </Box>
  );
}

function SectionHeader({ label, manage }: { label: string; manage?: string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 1,
      }}
    >
      <Typography component="h3" variant="sectionLabel">
        {label}
      </Typography>
      {manage ? (
        <Link href="/shopping/staples" sx={{ fontSize: 13, fontWeight: 700 }}>
          {manage}
        </Link>
      ) : null}
    </Box>
  );
}

function SuggestionChips({
  staples,
  usedUp,
  addedIds,
  onAdd,
  onAdded,
}: EmptySearchProps) {
  const { t } = useTranslation('shopping');
  const toast = useToast();
  const dismiss = useDismissSuggestion();

  // Chips whose add has not resolved yet, so a double tap sends one request.
  const [pending, setPending] = useState<string[]>([]);

  const add = async (suggestion: Suggestion) => {
    const id = suggestion.ingredientId;
    if (pending.includes(id)) return;
    setPending((ids) => [...ids, id]);
    const added = await onAdd({
      ingredientId: suggestion.ingredientId,
      ...(suggestion.quantity !== null
        ? { quantity: suggestion.quantity }
        : {}),
      ...(suggestion.unit ? { unit: suggestion.unit } : {}),
    });
    setPending((ids) => ids.filter((other) => other !== id));
    if (!added) return;
    toast.show(t('added', { name: suggestion.name }), {
      bottom: TOAST_ABOVE_SHEET,
    });
    onAdded(suggestion.ingredientId);
  };
  // mutateAsync, not per-call mutate callbacks: those are dropped when a later
  // dismiss replaces the observer or this component unmounts.
  const remove = (suggestion: Suggestion) =>
    void dismiss.mutateAsync(suggestion.ingredientId).then(
      () =>
        toast.show(t('suggestions.dismissed', { name: suggestion.name }), {
          bottom: TOAST_ABOVE_SHEET,
        }),
      () => undefined, // dismiss.error shows it
    );

  const group = (label: string, suggestions: Suggestion[], manage?: string) => (
    <Box component="section" aria-label={label}>
      <SectionHeader label={label} manage={manage} />
      <Box
        component="ul"
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, m: 0, p: 0 }}
      >
        {suggestions.map((suggestion) => (
          <SuggestionChip
            key={suggestion.ingredientId}
            suggestion={suggestion}
            added={addedIds.includes(suggestion.ingredientId)}
            pending={pending.includes(suggestion.ingredientId)}
            onAdd={() => void add(suggestion)}
            onDismiss={() => remove(suggestion)}
          />
        ))}
      </Box>
    </Box>
  );

  const stocked = staples.length === 0 && usedUp.length === 0;
  return (
    <>
      {dismiss.error ? (
        <Alert>{translateApiError(t, dismiss.error)}</Alert>
      ) : null}
      {stocked ? (
        <Box>
          <SectionHeader
            label={t('suggestions.stapleLabel')}
            manage={t('suggestions.manage')}
          />
          <Typography sx={{ fontSize: 13, color: tokens.color.muted }}>
            {t('suggestions.allStocked')}
          </Typography>
        </Box>
      ) : (
        <>
          {staples.length > 0
            ? group(
                t('suggestions.missingLabel', { count: staples.length }),
                staples,
                t('suggestions.manage'),
              )
            : null}
          {usedUp.length > 0
            ? group(
                t('suggestions.usedUpLabel', { count: usedUp.length }),
                usedUp,
                // With no missing Staples this is the first header, so it carries Manage.
                staples.length === 0 ? t('suggestions.manage') : undefined,
              )
            : null}
        </>
      )}
    </>
  );
}

function SuggestionChip({
  suggestion,
  added,
  pending,
  onAdd,
  onDismiss,
}: {
  suggestion: Suggestion;
  added: boolean;
  pending: boolean;
  onAdd: () => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslation('shopping');
  const { color } = tokens;
  const amount =
    suggestion.quantity === null
      ? null
      : suggestion.unit
        ? `${suggestion.quantity} ${t(`common:units.${suggestion.unit}`)}`
        : String(suggestion.quantity);
  const part = {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    border: 0,
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    cursor: 'pointer',
    '&:disabled': { cursor: 'default' },
  } as const;

  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: 38,
        listStyle: 'none',
        borderRadius: 999,
        border: `1px solid ${added ? color.accentMid : color.line}`,
        backgroundColor: added ? color.accentTint : color.surface,
        color: color.ink,
        overflow: 'hidden',
      }}
    >
      <Box
        component="button"
        type="button"
        disabled={added || pending}
        aria-label={t('amount.add', { name: suggestion.name })}
        onClick={onAdd}
        sx={{ ...part, gap: 0.75, pl: 1.5, pr: 1.25 }}
      >
        <Box
          component="span"
          aria-hidden
          sx={{ display: 'flex', color: color.accent }}
        >
          {added ? <CheckIcon size={16} /> : <PlusIcon size={16} />}
        </Box>
        <Box component="span" sx={{ fontSize: 14, fontWeight: 600 }}>
          {suggestion.name}
        </Box>
        {amount ? (
          <Box
            component="span"
            sx={{
              fontSize: 12.5,
              fontWeight: 500,
              color: color.muted,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {amount}
          </Box>
        ) : null}
      </Box>
      <Box
        component="button"
        type="button"
        aria-label={t('suggestions.dismiss', { name: suggestion.name })}
        onClick={onDismiss}
        sx={{
          ...part,
          px: 1.25,
          color: color.muted,
          borderLeft: `1px solid ${color.divider}`,
        }}
      >
        <CloseIcon size={13} aria-hidden />
      </Box>
    </Box>
  );
}
