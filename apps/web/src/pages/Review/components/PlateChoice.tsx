import { Alert, Box, Typography, tokens } from '@pocket-pantry/ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import { ApiError } from '../../../lib/api';
import { usePlateIngredients } from '../../../lib/plate';
import { readScans } from '../../../lib/scanReads';
import {
  dispatchScanSession,
  type SessionScan,
} from '../../../lib/scanSession';

const buttonSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 2,
  minHeight: 44,
  px: 1.5,
  borderRadius: `${tokens.radius.input}px`,
  border: `1px solid ${tokens.color.line}`,
  backgroundColor: tokens.color.surface,
  color: 'inherit',
  font: 'inherit',
  fontWeight: 600,
  textAlign: 'left',
  cursor: 'pointer',
  '&:disabled': { opacity: 0.5, cursor: 'default' },
} as const;

/**
 * A read Plate Scan's dish guesses, most likely first. Picking one loads its ingredients into the
 * card. When the Plate token has expired the guesses are no use: the Member reads the photo again.
 */
export function PlateChoice({ scan }: { scan: SessionScan }) {
  const { t, i18n } = useTranslation('review');
  const headingId = useId();
  const ingredients = usePlateIngredients(i18n.language);
  const [expired, setExpired] = useState(false);

  if (expired) {
    return (
      <Box
        component="button"
        type="button"
        onClick={() => {
          dispatchScanSession({ type: 'reread', id: scan.id });
          readScans(i18n.language);
        }}
        sx={{ ...buttonSx, mt: 0.5 }}
      >
        {t('overview.readAgain')}
      </Box>
    );
  }

  const pick = (dishTitle: string) =>
    ingredients.mutate(
      { dishTitle, plateToken: scan.plateToken ?? '' },
      {
        onSuccess: ({ lines }) =>
          dispatchScanSession({ type: 'pick', id: scan.id, lines }),
        onError: (error) =>
          setExpired(
            error instanceof ApiError &&
              error.code === 'scan.plate_token_invalid',
          ),
      },
    );

  return (
    <Box sx={{ mt: 0.5, position: 'relative', zIndex: 1 }}>
      <Typography id={headingId} sx={{ fontWeight: 700 }}>
        {t('overview.pickDish')}
      </Typography>
      <Box
        role="group"
        aria-labelledby={headingId}
        sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}
      >
        {(scan.dishes ?? []).map((dish) => {
          const percent = Math.round(dish.confidence * 100);
          return (
            <Box
              key={dish.title}
              component="button"
              type="button"
              disabled={ingredients.isPending}
              aria-label={t('overview.dishOption', {
                title: dish.title,
                percent,
              })}
              onClick={() => pick(dish.title)}
              sx={buttonSx}
            >
              <span>{dish.title}</span>
              <span aria-hidden="true">{percent}%</span>
            </Box>
          );
        })}
      </Box>
      {ingredients.error && !expired ? (
        <Box sx={{ mt: 1 }}>
          <Alert>{translateApiError(t, ingredients.error)}</Alert>
        </Box>
      ) : null}
    </Box>
  );
}
