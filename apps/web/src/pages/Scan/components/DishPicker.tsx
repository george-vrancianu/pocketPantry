import { Box, Typography, tokens } from '@pocket-pantry/ui';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { DishGuess } from '../../../lib/plate';

type Props = {
  dishes: DishGuess[];
  disabled: boolean;
  onPick: (title: string) => void;
  onRetake: () => void;
};

const optionSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 2,
  minHeight: 48,
  px: 2,
  borderRadius: `${tokens.radius.input}px`,
  border: '1px solid rgba(255,255,255,0.25)',
  backgroundColor: 'rgba(255,255,255,0.10)',
  color: '#FFFFFF',
  fontFamily: 'inherit',
  fontSize: 15,
  fontWeight: 600,
  textAlign: 'left',
  cursor: 'pointer',
  '&:disabled': { opacity: 0.5, cursor: 'default' },
  '&:focus-visible': {
    outline: `2px solid ${tokens.color.accentMid}`,
    outlineOffset: 2,
  },
} as const;

/** The dish guesses from a Plate Scan, most likely first. Picking one loads its Ingredients. */
export function DishPicker({ dishes, disabled, onPick, onRetake }: Props) {
  const { t } = useTranslation('scan');
  const heading = useRef<HTMLHeadingElement>(null);
  // Hand focus to the new choice so keyboard and screen reader users land on it.
  useEffect(() => heading.current?.focus(), [dishes]);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        component="h2"
        id="dish-picker-heading"
        ref={heading}
        tabIndex={-1}
        sx={{ fontSize: 16, fontWeight: 700, textAlign: 'center' }}
      >
        {t('plate.pickTitle')}
      </Typography>
      <Box
        role="group"
        aria-labelledby="dish-picker-heading"
        sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}
      >
        {dishes.map((dish) => {
          const percent = Math.round(dish.confidence * 100);
          return (
            <Box
              key={dish.title}
              component="button"
              type="button"
              disabled={disabled}
              aria-label={t('plate.option', { title: dish.title, percent })}
              onClick={() => onPick(dish.title)}
              sx={optionSx}
            >
              <span>{dish.title}</span>
              <span aria-hidden="true">{percent}%</span>
            </Box>
          );
        })}
      </Box>
      <Box
        component="button"
        type="button"
        disabled={disabled}
        onClick={onRetake}
        sx={{ ...optionSx, mt: 1, width: '100%', justifyContent: 'center' }}
      >
        {t('plate.retake')}
      </Box>
    </Box>
  );
}
