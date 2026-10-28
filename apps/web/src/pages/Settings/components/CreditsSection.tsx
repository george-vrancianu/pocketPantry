import {
  Alert,
  Box,
  Card,
  Stack,
  Typography,
  radius,
  tokens,
} from '@pocket-pantry/ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import { useCredits } from '../../../lib/credits';
import { SectionHeading } from './SectionHeading';

/** The Credits panel: how many Credits the Family has left, shared by every Member. */
export function CreditsSection() {
  const { t } = useTranslation('settings');
  const id = useId();
  const credits = useCredits();
  const headingId = `${id}-credits`;
  return (
    <Stack component="section" spacing={1} aria-labelledby={headingId}>
      <SectionHeading id={headingId} title={t('credits.title')} />
      <Card>
        <Stack spacing={1.5}>
          {credits.isPending ? (
            <Box
              role="status"
              aria-label={t('loading')}
              sx={{
                height: 44,
                borderRadius: radius.control,
                bgcolor: tokens.color.subtle,
              }}
            />
          ) : null}
          {credits.error ? (
            <Alert>{translateApiError(t, credits.error)}</Alert>
          ) : null}
          {credits.data ? (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
              <Typography
                component="span"
                aria-live="polite"
                sx={{
                  fontSize: 28,
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {credits.data.balance}
              </Typography>
              <Typography component="span" color="text.secondary">
                {t('credits.left', { count: credits.data.balance })}
              </Typography>
            </Stack>
          ) : null}
          <Typography variant="meta" color="text.secondary">
            {t('credits.hint')}
          </Typography>
        </Stack>
      </Card>
    </Stack>
  );
}
