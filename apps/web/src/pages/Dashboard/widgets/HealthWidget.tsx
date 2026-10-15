import {
  Box,
  ChevronRightIcon,
  displayType,
  InfoIcon,
  PulseIcon,
  tokens,
} from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HealthRing } from '../../../components/HealthSheet/HealthRing';
import { HealthSheet } from '../../../components/HealthSheet/HealthSheet';
import { VERDICT_COLOR } from '../../../components/HealthSheet/healthStyle';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  FACTORS,
  FACTOR_WEIGHTS,
  MIN_BATCHES_FOR_SCORE,
  verdictOf,
} from '../../../lib/health';
import { usePantryHealth } from '../../../lib/usePantryHealth';
import { WidgetCard, WidgetTitle } from './WidgetCard';
import type { WidgetProps } from './types';

/** The Pantry Health score in a ring with its verdict and to-do count; tapping it opens the sheet. */
export function HealthWidget({ size, columns }: WidgetProps) {
  const { t } = useTranslation('dashboard');
  const [open, setOpen] = useState(false);
  const { isPending, error, batchCount, health, todos } = usePantryHealth();
  const wide = size !== 'small';

  const todoCount = todos.length;
  const subline =
    todoCount === 0
      ? t('health.nothingToDo')
      : t('health.toDo', { count: todoCount });
  const spokenTodos =
    todoCount === 0
      ? t('health.nothingToDo').toLocaleLowerCase()
      : t('health.toDoLong', { count: todoCount });
  const headline = health.scored
    ? t(`health.verdict.${health.verdict}`)
    : t('health.progress', { count: MIN_BATCHES_FOR_SCORE - batchCount });
  const cardName = health.scored
    ? t('health.cardName', {
        title: t('health.title'),
        score: health.total,
        verdict: headline,
        todos: spokenTodos,
      })
    : t('health.cardNameProgress', {
        title: t('health.title'),
        progress: headline,
        todos: spokenTodos,
      });

  return (
    <>
      <WidgetCard
        label={t('health.title')}
        size={size}
        columns={columns}
        isLoading={isPending}
        error={error ? translateApiError(t, error) : null}
        onPress={() => setOpen(true)}
        pressLabel={cardName}
        padding="12px 14px 14px"
      >
        {wide ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: tokens.color.muted,
              }}
            >
              <WidgetTitle icon={<PulseIcon size={16} />}>
                {t('health.title')}
              </WidgetTitle>
              <InfoIcon size={15} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Ring health={health} batchCount={batchCount} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ ...displayType, fontSize: 16 }}>{headline}</Box>
                <Box sx={{ fontSize: 12.5, color: tokens.color.muted }}>
                  {subline}
                </Box>
              </Box>
              <Box sx={{ color: tokens.color.muted, display: 'flex' }}>
                <ChevronRightIcon size={18} />
              </Box>
            </Box>
            {health.scored ? (
              <Box
                aria-hidden="true"
                sx={{ display: 'flex', gap: '2px', height: 8 }}
              >
                {FACTORS.map((factor) => (
                  <Box
                    key={factor}
                    data-factor={factor}
                    sx={{
                      flex: FACTOR_WEIGHTS[factor],
                      borderRadius: '2px',
                      bgcolor: VERDICT_COLOR[verdictOf(health.factors[factor])],
                    }}
                  />
                ))}
              </Box>
            ) : null}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Ring health={health} batchCount={batchCount} />
            <Box>
              <Box sx={{ ...displayType, fontSize: 14.5 }}>{headline}</Box>
              <Box sx={{ fontSize: 12.5, color: tokens.color.muted }}>
                {subline}
              </Box>
            </Box>
          </Box>
        )}
      </WidgetCard>
      <HealthSheet
        open={open}
        onClose={() => setOpen(false)}
        health={health}
        batchCount={batchCount}
      />
    </>
  );
}

function Ring({
  health,
  batchCount,
}: {
  health: ReturnType<typeof usePantryHealth>['health'];
  batchCount: number;
}) {
  return health.scored ? (
    <HealthRing
      percent={health.total}
      label={health.total}
      color={VERDICT_COLOR[health.verdict]}
      size={56}
      stroke={6}
    />
  ) : (
    <HealthRing
      percent={(batchCount / MIN_BATCHES_FOR_SCORE) * 100}
      label={batchCount}
      color={tokens.color.muted}
      size={56}
      stroke={6}
    />
  );
}
