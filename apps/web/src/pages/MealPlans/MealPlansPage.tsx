import {
  Alert,
  Box,
  PlusIcon,
  Spinner,
  Tag,
  Typography,
  tokens,
  type TagTone,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { localIso } from '../../lib/pantry';
import {
  dateRange,
  planPhase,
  planTitle,
  useMealPlans,
  type PlanPhase,
} from '../../lib/mealPlans';
import { useToday } from '../../lib/useToday';
import { translateApiError } from '../../i18n/translateApiError';

const PHASE_TONE: Record<PlanPhase, TagTone> = {
  past: 'neutral',
  current: 'accent',
  upcoming: 'ok',
};

/** The Family's Meal Plans, newest first: open one, or start a new one. */
export function MealPlansPage() {
  const { t, i18n } = useTranslation(['mealPlans', 'common']);
  const today = localIso(useToday());
  const plans = useMealPlans();
  const items = plans.data ?? [];

  return (
    <>
      <AppScreenHeader
        title={t('mealPlans:title')}
        action={{
          label: t('mealPlans:newPlan'),
          icon: <PlusIcon size={20} />,
          href: '/meal-plans/new',
        }}
      />
      {plans.error ? <Alert>{translateApiError(t, plans.error)}</Alert> : null}
      {plans.isPending ? <Spinner label={t('common:loading')} /> : null}
      {plans.data && items.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: '32px' }}>
          <Typography>{t('mealPlans:empty')}</Typography>
          <Typography variant="meta" color="text.secondary">
            {t('mealPlans:emptyHint')}
          </Typography>
        </Box>
      ) : null}
      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {items.map((plan) => {
          const phase = planPhase(plan, today);
          return (
            <Box
              component="li"
              key={plan.id}
              sx={{ '& + &': { borderTop: `1px solid ${tokens.color.line}` } }}
            >
              <Box
                component={Link}
                to={`/meal-plans/${plan.id}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  minHeight: 56,
                  p: '10px 4px',
                  color: tokens.color.ink,
                  textDecoration: 'none',
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ fontSize: 15, fontWeight: 700 }}>
                    {planTitle(plan, i18n.language)}
                  </Box>
                  <Typography variant="meta" color="text.secondary">
                    {[
                      plan.name ? dateRange(plan, i18n.language) : null,
                      t('mealPlans:dayCount', { count: plan.days }),
                      t('mealPlans:servings', { count: plan.servings }),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Typography>
                </Box>
                <Tag tone={PHASE_TONE[phase]}>
                  {t(`mealPlans:phase.${phase}`)}
                </Tag>
              </Box>
            </Box>
          );
        })}
      </Box>
    </>
  );
}
