import {
  Box,
  displayType,
  nestedRadius,
  PulseIcon,
  radius,
  tokens,
  usePrefersReducedMotion,
} from '@pocket-pantry/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScoreRing } from '../../../components/HealthSheet/HealthRing';
import { HealthSheet } from '../../../components/HealthSheet/HealthSheet';
import {
  HealthGator,
  HealthGatorNote,
  useHealthGatorLine,
} from '../../../components/HealthSheet/HealthGator';
import { VERDICT_COLOR } from '../../../components/HealthSheet/healthStyle';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  FACTOR_WEIGHTS,
  presentFactors,
  MIN_BATCHES_FOR_SCORE,
  verdictOf,
} from '../../../lib/health';
import { TAP_BEFORE_NEXT_MS } from '../../../lib/gatorTap';
import { usePantryHealth } from '../../../lib/usePantryHealth';
import { useToday } from '../../../lib/useToday';
import {
  expiringSoonDay,
  todoTitle,
} from '../../../components/HealthSheet/todoText';
import { WidgetCard, WidgetTitle } from './WidgetCard';
import type { WidgetProps } from './types';

/** The Pantry Health score in a ring with its verdict and to-do count; tapping it plays Gator's Tap, then opens the sheet. */
export function HealthWidget({ size, columns }: WidgetProps) {
  const { t, i18n } = useTranslation('dashboard');
  const today = useToday();
  const [open, setOpen] = useState(false);
  const [tapSignal, setTapSignal] = useState(0);
  const [opening, setOpening] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  useEffect(() => {
    if (!opening) return;
    const timer = setTimeout(() => {
      setOpening(false);
      setOpen(true);
    }, TAP_BEFORE_NEXT_MS);
    return () => clearTimeout(timer);
  }, [opening]);
  const state = usePantryHealth();
  const { isPending, error, batchCount, health, todos } = state;
  const wide = size !== 'small';

  const todoCount = todos.length;
  const gatorLine = useHealthGatorLine(
    health,
    todos,
    state.staleThresholdDays,
    today,
  );
  const subline =
    todoCount === 0
      ? t('health.nothingToDo')
      : t('health.toDo', { count: todoCount });
  const firstTodo = todos[0];
  const wideSubline =
    firstTodo && !gatorLine
      ? t('health.toDoFirst', {
          count: todoCount,
          title: todoTitle(
            t,
            firstTodo,
            expiringSoonDay(today, state.staleThresholdDays, i18n.language),
          ),
        })
      : subline;
  const spokenTodos =
    todoCount === 0
      ? t('health.nothingToDoSpoken')
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
        onPress={() => {
          setTapSignal((n) => n + 1);
          // With reduced motion there is no Tap to show, so the sheet opens at once.
          if (reduceMotion) setOpen(true);
          else setOpening(true);
        }}
        pressLabel={wide && gatorLine ? `${cardName}. ${gatorLine}` : cardName}
        padding="12px 14px 14px"
      >
        {wide ? (
          <Box
            component="span"
            sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <Box
              component="span"
              sx={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}
            >
              <Box
                component="span"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <WidgetTitle component="span" icon={<PulseIcon size={16} />}>
                  {t('health.title')}
                </WidgetTitle>
                <Box
                  component="span"
                  sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                  <ScoreRing
                    health={health}
                    batchCount={batchCount}
                    size={56}
                  />
                  <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      component="span"
                      sx={{ display: 'block', ...displayType, fontSize: 16 }}
                    >
                      {headline}
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        display: 'block',
                        fontSize: 12.5,
                        color: tokens.color.muted,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {wideSubline}
                    </Box>
                  </Box>
                </Box>
              </Box>
              {/* Spans the title and ring rows, sitting a touch below the title. */}
              <Box component="span" sx={{ mt: '8px' }}>
                <HealthGator
                  health={health}
                  size={112}
                  entrance
                  tapSignal={tapSignal}
                />
              </Box>
            </Box>
            {gatorLine ? (
              <HealthGatorNote health={health} line={gatorLine} />
            ) : null}
            {health.scored ? (
              <Box
                component="span"
                aria-hidden="true"
                sx={{ display: 'flex', gap: '2px', height: 8 }}
              >
                {presentFactors(health).map(([factor, value]) => (
                  <Box
                    component="span"
                    key={factor}
                    data-factor={factor}
                    sx={{
                      flex: FACTOR_WEIGHTS[factor],
                      borderRadius: nestedRadius(radius.control, 9),
                      bgcolor: VERDICT_COLOR[verdictOf(value)],
                    }}
                  />
                ))}
              </Box>
            ) : null}
          </Box>
        ) : (
          <Box
            component="span"
            sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            <Box
              component="span"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <ScoreRing health={health} batchCount={batchCount} size={56} />
              <HealthGator
                health={health}
                size={52}
                entrance
                tapSignal={tapSignal}
              />
            </Box>
            <Box component="span">
              <Box
                component="span"
                sx={{ display: 'block', ...displayType, fontSize: 14.5 }}
              >
                {headline}
              </Box>
              <Box
                component="span"
                sx={{
                  display: 'block',
                  fontSize: 12.5,
                  color: tokens.color.muted,
                }}
              >
                {subline}
              </Box>
            </Box>
          </Box>
        )}
      </WidgetCard>
      <HealthSheet
        open={open}
        onClose={() => setOpen(false)}
        state={state}
        today={today}
      />
    </>
  );
}
