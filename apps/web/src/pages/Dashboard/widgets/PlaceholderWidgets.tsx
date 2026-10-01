import { Box, tokens } from '@pocket-pantry/ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { WidgetCard } from './WidgetCard';
import type { WidgetProps } from './types';

/** Static Widgets for features that do not exist yet, clearly marked as coming soon. */
function Placeholder({
  title,
  size,
  children,
}: {
  title: string;
  size: WidgetProps['size'];
  children: ReactNode;
}) {
  const { t } = useTranslation('dashboard');
  return (
    <WidgetCard label={title} size={size}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          mb: '10px',
        }}
      >
        <Box
          component="span"
          sx={{ fontSize: 13, fontWeight: 600, color: tokens.color.muted }}
        >
          {title}
        </Box>
        <Box
          component="span"
          sx={{
            fontSize: 11,
            fontWeight: 700,
            px: '8px',
            py: '2px',
            borderRadius: `${tokens.radius.chip}px`,
            bgcolor: tokens.color.soonBg,
            color: tokens.color.soonFg,
            whiteSpace: 'nowrap',
          }}
        >
          {t('comingSoon')}
        </Box>
      </Box>
      {children}
    </WidgetCard>
  );
}

const DAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function MealPlanWidget({ size }: WidgetProps) {
  const { t } = useTranslation('dashboard');
  return (
    <Placeholder title={t('widgets.mealPlan.title')} size={size}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '6px',
        }}
      >
        {DAY_INITIALS.map((initial, index) => (
          <Box
            key={index}
            aria-hidden="true"
            sx={{
              height: 44,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              ...(index === 0
                ? { bgcolor: tokens.color.ink, color: tokens.color.surface }
                : {
                    border: `1px dashed ${tokens.color.line}`,
                    color: tokens.color.muted,
                  }),
            }}
          >
            {initial}
          </Box>
        ))}
      </Box>
    </Placeholder>
  );
}

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <Box
      aria-hidden="true"
      sx={{ height: 6, borderRadius: 3, bgcolor: tokens.color.bg }}
    >
      <Box
        sx={{
          width: `${value}%`,
          height: '100%',
          borderRadius: 3,
          bgcolor: color,
        }}
      />
    </Box>
  );
}

export function BudgetWidget({ size }: WidgetProps) {
  const { t } = useTranslation('dashboard');
  return (
    <Placeholder title={t('widgets.budget.title')} size={size}>
      <Box
        component="p"
        sx={{
          m: 0,
          mb: '8px',
          fontFamily: tokens.font.display,
          fontSize: 28,
          fontWeight: 700,
        }}
      >
        {t('widgets.budget.sample')}
      </Box>
      <Bar value={60} color={tokens.color.accent} />
    </Placeholder>
  );
}

export function NutritionWidget({ size }: WidgetProps) {
  const { t } = useTranslation('dashboard');
  return (
    <Placeholder title={t('widgets.nutrition.title')} size={size}>
      <Box sx={{ display: 'grid', gap: '8px' }}>
        {(
          [
            ['protein', 70],
            ['carbs', 45],
            ['fat', 30],
          ] as const
        ).map(([nutrient, value]) => (
          <Box key={nutrient}>
            <Box
              component="span"
              sx={{ fontSize: 11, color: tokens.color.muted }}
            >
              {t(`widgets.nutrition.${nutrient}`)}
            </Box>
            <Bar value={value} color={tokens.color.accentMid} />
          </Box>
        ))}
      </Box>
    </Placeholder>
  );
}
