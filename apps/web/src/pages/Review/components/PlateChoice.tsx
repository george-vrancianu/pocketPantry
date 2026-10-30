import { Alert, Box, Typography, tokens, radius } from '@pocket-pantry/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CreditPrice,
  useCreditPriceText,
} from '../../../components/CreditPrice';
import { apiRequest } from '../../../lib/api';
import { creditsQueryKey, type Credits } from '../../../lib/credits';
import { recipeReads } from '../../../lib/recipeReads';
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
  borderRadius: radius.control,
  border: `1px solid ${tokens.color.line}`,
  backgroundColor: tokens.color.surface,
  color: 'inherit',
  font: 'inherit',
  fontWeight: 600,
  textAlign: 'left',
  cursor: 'pointer',
  '&:disabled': { opacity: 0.5, cursor: 'default' },
  '&:focus-visible': {
    outline: `2px solid ${tokens.color.accentMid}`,
    outlineOffset: 2,
  },
} as const;

export const cardId = (id: string) => `review-card-${id}`;

/**
 * A read Plate Scan's dish guesses, most likely first, and nothing else to review (ADR 0035).
 * Picking one leaves the Scan Session: the dish is handed to the recipe-reads holder, which has the
 * server write it as a Recipe Draft while the Member keeps scanning. A full holder keeps the card, and so
 * does a Family without the Credits the writing costs (its own Credit Price, besides the photo's): the
 * balance is looked up fresh before anything is handed over, so a refused pick never reaches the strip.
 */
export function PlateChoice({
  scan,
  onPicked,
}: {
  scan: SessionScan;
  /** Called once the dish is handed over and the card is gone: the overview moves focus on, as Remove does. */
  onPicked: () => void;
}) {
  const { t } = useTranslation(['review', 'errors']);
  const queryClient = useQueryClient();
  const headingId = useId();
  const priceText = useCreditPriceText('plate-recipe');
  const [full, setFull] = useState(false);
  const [short, setShort] = useState<{ price: number; balance: number } | null>(
    null,
  );
  const [checking, setChecking] = useState(false);

  /** The Credits the Family is short of for the writing step, or null when it can pay (or this cannot be told). */
  const shortOfCredits = async () => {
    try {
      const credits = await queryClient.fetchQuery({
        queryKey: creditsQueryKey,
        queryFn: () => apiRequest<Credits>('/credits'),
        staleTime: 0,
      });
      const price = credits.prices['plate-recipe'];
      return credits.balance < price
        ? { price, balance: credits.balance }
        : null;
    } catch {
      // Not known: the server refuses a short balance too, and the row says so.
      return null;
    }
  };

  const pick = async (title: string) => {
    setFull(false);
    setShort(null);
    setChecking(true);
    const refused = await shortOfCredits();
    setChecking(false);
    if (refused) {
      setShort(refused);
      return;
    }
    const outcome = recipeReads.add({
      kind: 'plate',
      title,
      token: scan.plateToken ?? '',
    });
    if (outcome === 'full') {
      setFull(true);
      return;
    }
    dispatchScanSession({ type: 'remove', id: scan.id });
    onPicked();
  };

  return (
    <Box sx={{ mt: 0.5 }}>
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
              aria-label={t(
                priceText ? 'overview.dishOptionPriced' : 'overview.dishOption',
                { title: dish.title, percent, price: priceText },
              )}
              disabled={checking}
              onClick={() => void pick(dish.title)}
              sx={buttonSx}
            >
              <span>{dish.title}</span>
              <Box
                component="span"
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5 }}
              >
                <span aria-hidden="true">{percent}%</span>
                <CreditPrice kind="plate-recipe" />
              </Box>
            </Box>
          );
        })}
      </Box>
      {short ? (
        <Box sx={{ mt: 1 }}>
          <Alert severity="error">
            {t('errors:credits.insufficient', short)}
          </Alert>
        </Box>
      ) : null}
      {full ? (
        <Box sx={{ mt: 1 }}>
          <Alert>{t('overview.readsFull')}</Alert>
        </Box>
      ) : null}
    </Box>
  );
}
