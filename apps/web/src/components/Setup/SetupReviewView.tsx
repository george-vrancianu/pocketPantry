import { Box, tokens, Typography } from '@pocket-pantry/ui';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { GatorBanner } from '../GatorBanner';
import { ReviewActionBar } from '../ReviewActionBar';
import { SetupTopRow } from './SetupTopRow';

/** The cream page frame of every Setup Review state (reading, failed, read): a phone-width column. */
export function SetupReviewFrame({
  children,
  bottomRoom = false,
}: {
  children: ReactNode;
  /** Room under the content for the fixed action bar. */
  bottomRoom?: boolean;
}) {
  return (
    <Box
      component="main"
      sx={{
        boxSizing: 'border-box',
        maxWidth: 520,
        mx: 'auto',
        px: '20px',
        pt: '40px',
        pb: bottomRoom ? '120px' : '40px',
      }}
    >
      {children}
    </Box>
  );
}

type Props = {
  subtitle: string;
  /** How many lines the Scan read: said once, when the Review opens. */
  spotted: number;
  /** Lines still to check, live. */
  check: number;
  saveCount: number;
  saving: boolean;
  canSave: boolean;
  onSave: () => void;
  onRetake: () => void;
  onSkip: () => void;
  children: ReactNode;
};

/**
 * The Setup Review's chrome around the real line editor: the top row, "Review" with its subtitle,
 * Gator's banner and the Retake / Add footer. The banner's count is what was read, however many
 * lines the Member removes after; the second line follows how many are left to check.
 */
export function SetupReviewView({
  subtitle,
  spotted,
  check,
  saveCount,
  saving,
  canSave,
  onSave,
  onRetake,
  onSkip,
  children,
}: Props) {
  const { t } = useTranslation('onboarding');
  const { t: tReview } = useTranslation('review');
  const { t: tPantry } = useTranslation('pantry');
  // Read once: removing a line later must not rewrite what Gator said it spotted.
  const [count] = useState(spotted);
  return (
    <SetupReviewFrame bottomRoom>
      <SetupTopRow onCamera={onRetake} onSkip={onSkip} />
      <Box component="header" sx={{ pt: '20px', pb: '14px' }}>
        <Typography variant="h2" component="h1">
          {tReview('title')}
        </Typography>
        <Typography sx={{ fontSize: 13, color: tokens.color.muted, mt: '2px' }}>
          {subtitle}
        </Typography>
      </Box>
      {count > 0 ? (
        <GatorBanner
          testId="setup-review-banner"
          title={t('review.banner', { count })}
          detail={
            check > 0
              ? t('review.bannerCheck', { count: check })
              : t('review.bannerClear', { count })
          }
        />
      ) : null}
      {children}
      {count > 0 ? (
        <ReviewActionBar
          saveLabel={
            saving
              ? tPantry('form.saving')
              : t('review.add', { count: saveCount })
          }
          canSave={canSave}
          onSave={onSave}
          onDiscard={onRetake}
          discardLabel={tReview('overview.retake')}
        />
      ) : null}
    </SetupReviewFrame>
  );
}
