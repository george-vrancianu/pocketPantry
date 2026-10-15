import {
  Alert,
  Box,
  Button,
  Sheet,
  Stack,
  Tag,
  Typography,
  tokens,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { reasonText } from '../../../components/MealPlanPopover/mealPlanText';
import { ingredientKey, type PlanIssue } from '../../../lib/mealPlan';
import type { AddMissingScope } from '../../../lib/mealPlan';
import type { PlanSlot } from '../../../lib/mealPlans';
import type { PantryLine } from '../../../lib/recipes';
import { LineStatusPill } from '../../Recipes/components/PantryStatus';
import { ServingsStepper } from '../../Recipes/components/Servings';

/** A forecast issue as a Pantry-status line, so the Recipe page's pill words it. */
function asPantryLine(issue: PlanIssue): PantryLine {
  const quantified =
    issue.kind === 'short' && issue.quantity !== null && issue.unit !== null;
  return {
    lineId: ingredientKey(issue),
    ingredientId: issue.ingredientId,
    name: issue.name,
    status: quantified ? 'short' : 'missing',
    optional: false,
    pantryBasic: false,
    quantity: issue.quantity,
    unit: issue.unit,
    shortfall: quantified
      ? { quantity: issue.quantity!, unit: issue.unit! }
      : null,
    usesExpiringSoon: false,
    onShoppingList: issue.onList,
  };
}

type Props = {
  slot: PlanSlot | undefined;
  /** "Dinner on Fri 16 Oct". */
  context: string;
  planServings: number;
  today: string;
  error: string | null;
  busy: boolean;
  adding: boolean;
  onServings: (servings: number | undefined) => void;
  onChangeRecipe: () => void;
  onClear: () => void;
  onAddLine: (scope: AddMissingScope) => void;
  onClose: () => void;
};

/** A filled slot's detail: its forecast lines with reasons, the Servings override, Change Recipe and Clear. */
export function SlotSheet({
  slot,
  context,
  planServings,
  today,
  error,
  busy,
  adding,
  onServings,
  onChangeRecipe,
  onClear,
  onAddLine,
  onClose,
}: Props) {
  const { t, i18n } = useTranslation('mealPlans');
  const { t: tDashboard } = useTranslation('dashboard');
  return (
    <Sheet
      open={slot !== undefined}
      onClose={onClose}
      label={slot?.recipeTitle ?? t('detail.lines')}
      header={
        slot ? (
          <Box sx={{ px: 3, pt: 2, pb: 1.5 }}>
            <Typography component="h2" variant="h3">
              {slot.recipeTitle}
            </Typography>
            <Typography variant="meta" color="text.secondary">
              {context}
            </Typography>
          </Box>
        ) : null
      }
      footer={
        <Stack direction="row" spacing={1.25} sx={{ px: 3, py: 1.5 }}>
          <Button variant="secondary" disabled={busy} onClick={onChangeRecipe}>
            {t('detail.changeRecipe')}
          </Button>
          <Button variant="ghost" disabled={busy} onClick={onClear}>
            {t('detail.clear')}
          </Button>
          <Button onClick={onClose} sx={{ flex: 1 }}>
            {t('detail.done')}
          </Button>
        </Stack>
      }
    >
      {slot ? (
        <Stack spacing={2} sx={{ px: 3, pb: 2 }}>
          {error ? <Alert>{error}</Alert> : null}
          <Box>
            <Typography
              variant="sectionLabel"
              color="text.secondary"
              component="p"
              sx={{ mb: 0.5 }}
            >
              {t('detail.servings')}
            </Typography>
            <ServingsStepper
              servings={slot.servings}
              onChange={(servings) =>
                onServings(servings === planServings ? undefined : servings)
              }
            />
          </Box>
          {slot.unavailable ? (
            <Alert severity="warning">{t('detail.unavailable')}</Alert>
          ) : slot.issues.length === 0 ? (
            <Typography color="text.secondary">
              {t('detail.nothingShort')}
            </Typography>
          ) : (
            <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
              {slot.issues.map((issue) => {
                const reason = reasonText(
                  tDashboard,
                  i18n.language,
                  issue,
                  today,
                );
                const uncertain = issue.kind === 'uncertain';
                return (
                  <Box
                    component="li"
                    key={ingredientKey(issue)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      py: '10px',
                      borderTop: `1px solid ${tokens.color.divider}`,
                      '&:first-of-type': { borderTop: 0 },
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ fontSize: 15, fontWeight: 600 }}>
                        {issue.name}
                      </Box>
                      {reason ? (
                        <Box sx={{ fontSize: 13, color: tokens.color.muted }}>
                          {reason}
                        </Box>
                      ) : null}
                      {uncertain ? (
                        <Box sx={{ fontSize: 13, color: tokens.color.muted }}>
                          {t('detail.uncertainNote')}
                        </Box>
                      ) : null}
                    </Box>
                    {uncertain ? (
                      <Tag tone="neutral">{t('detail.uncertain')}</Tag>
                    ) : (
                      <LineStatusPill line={asPantryLine(issue)} />
                    )}
                    {uncertain || issue.onList ? null : (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={adding}
                        aria-label={t('detail.addLine', {
                          name: issue.name,
                        })}
                        onClick={() =>
                          onAddLine(
                            issue.ingredientId
                              ? {
                                  scope: 'ingredient',
                                  ingredientId: issue.ingredientId,
                                }
                              : { scope: 'ingredient', name: issue.name },
                          )
                        }
                      >
                        {t('slot.add')}
                      </Button>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </Stack>
      ) : null}
    </Sheet>
  );
}
