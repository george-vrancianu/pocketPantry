import {
  Alert,
  Box,
  Button,
  CheckCircleIcon,
  Stack,
  Typography,
  visuallyHidden,
  WarningIcon,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { formatAmount } from '../../../lib/amount';
import type { PantryLine, PantryMatch } from '../../../lib/recipes';

/** Required, non-Basic lines the server would add (short or missing). */
const addable = (line: PantryLine) =>
  !line.optional && !line.pantryBasic && line.status !== 'covered';

/** The lines "Add missing" adds. The Shopping List is not stock, so lines already on it count (the server sums them). */
export function linesToAdd(match: PantryMatch | undefined): PantryLine[] {
  return (match?.lines ?? []).filter(addable);
}

/** The status after one Ingredient Line: words first, so colour is never the only cue. */
export function LineStatus({ line }: { line: PantryLine }) {
  const { t, i18n } = useTranslation(['recipes', 'common']);
  const label =
    line.status === 'short' && line.shortfall
      ? t('recipes:pantry.short', {
          amount: formatAmount(
            line.shortfall.quantity,
            line.shortfall.unit,
            i18n.language,
            t,
          ),
        })
      : line.pantryBasic
        ? t('recipes:pantry.basic')
        : t(`recipes:pantry.${line.status}`);
  const covered = line.status === 'covered';
  return (
    <Typography
      variant="meta"
      component="span"
      color={covered ? 'text.secondary' : 'text.primary'}
      sx={{ ml: 1, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
    >
      {covered ? (
        <CheckCircleIcon size={14} aria-hidden />
      ) : (
        <WarningIcon size={14} aria-hidden />
      )}
      <span>{label}</span>
      {line.onShoppingList && !covered ? (
        <span>
          <span aria-hidden> · </span>
          <Box component="span" sx={visuallyHidden}>
            ,{' '}
          </Box>
          {t('recipes:pantry.onList')}
        </span>
      ) : null}
    </Typography>
  );
}

type SummaryProps = {
  match: PantryMatch | undefined;
  /** The answer is for another Servings or Recipe; wait for the current one. */
  stale: boolean;
  adding: boolean;
  /** Why the last add failed, shown beside the button. */
  error: string | null;
  onAddMissing: () => void;
};

/** Can Make (or how many ingredients are missing) and the Add missing button. */
export function PantrySummary({
  match,
  stale,
  adding,
  error,
  onAddMissing,
}: SummaryProps) {
  const { t } = useTranslation('recipes');
  if (!match) return null;
  const toAdd = linesToAdd(match);
  return (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      <Typography role="status" sx={{ fontWeight: 600 }}>
        {match.canMake
          ? t('pantry.canMake')
          : t('pantry.missingCount', { count: match.shortOrMissingCount })}
      </Typography>
      <Button
        variant="secondary"
        disabled={adding || stale || toAdd.length === 0}
        onClick={onAddMissing}
      >
        {t('pantry.addMissing')}
      </Button>
      {toAdd.some((line) => line.onShoppingList) ? (
        <Typography variant="meta" color="text.secondary">
          {t('pantry.someOnList')}
        </Typography>
      ) : null}
      {error ? <Alert>{error}</Alert> : null}
    </Stack>
  );
}
