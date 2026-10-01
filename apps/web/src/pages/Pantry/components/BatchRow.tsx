import { Box, Typography, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { expiryChipFor, type Batch } from '../../../lib/pantry';
import { ExpiryChip } from './ExpiryChip';

type Props = { batch: Batch; today: Date };

export function BatchRow({ batch, today }: Props) {
  const { t, i18n } = useTranslation('pantry');
  const chip = expiryChipFor(batch.expiryDate, today);

  const amount =
    batch.quantity === null
      ? null
      : [
          new Intl.NumberFormat(i18n.language).format(batch.quantity),
          batch.unit ? t(`units.${batch.unit}`) : null,
        ]
          .filter(Boolean)
          .join(' ');
  const detail = [amount, batch.productDescription].filter(Boolean).join(' · ');

  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minHeight: 60,
        borderTop: `1px solid ${tokens.color.divider}`,
        '&:first-of-type': { borderTop: 0 },
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: '12px',
          bgcolor: batch.unmatched
            ? tokens.color.soonBg
            : tokens.color.accentTint,
          color: batch.unmatched ? tokens.color.soonFg : tokens.color.accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: tokens.font.display,
          fontWeight: 700,
          fontSize: 15,
        }}
      >
        {batch.name.charAt(0).toLocaleUpperCase(i18n.language)}
      </Box>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography component="p" sx={{ fontSize: 15, fontWeight: 600, m: 0 }}>
          {batch.name}
          {batch.unmatched ? (
            <Box
              component="span"
              sx={{
                ml: 1,
                fontSize: 11,
                fontWeight: 700,
                px: '8px',
                py: '2px',
                borderRadius: `${tokens.radius.chip}px`,
                bgcolor: tokens.color.soonBg,
                color: tokens.color.soonFg,
              }}
            >
              {t('unmatched')}
            </Box>
          ) : null}
        </Typography>
        {detail ? (
          <Typography
            component="p"
            sx={{ fontSize: 12, color: tokens.color.muted, m: 0, mt: '2px' }}
          >
            {detail}
          </Typography>
        ) : null}
      </Box>
      {chip && batch.expiryDate ? (
        <ExpiryChip chip={chip} expiryDate={batch.expiryDate} />
      ) : null}
    </Box>
  );
}
