import {
  Box,
  color,
  GatorImage,
  radius,
  tokens,
  Typography,
} from '@pocket-pantry/ui';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useGatorAlt } from '../../../lib/useGatorAlt';
import { ReviewActionBar } from '../../Review/components/ReviewActionBar';
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
  saveLabel: string;
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
  saveLabel,
  canSave,
  onSave,
  onRetake,
  onSkip,
  children,
}: Props) {
  const { t } = useTranslation('onboarding');
  const { t: tReview } = useTranslation('review');
  const gatorAlt = useGatorAlt();
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
        <Box
          role="status"
          data-testid="setup-review-banner"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mb: 1.5,
            py: 1.25,
            pr: 2,
            pl: 0.25,
            borderRadius: radius.card,
            backgroundColor: tokens.color.accent,
            color: color.accentInk,
          }}
        >
          <Box sx={{ flex: 'none' }}>
            <GatorImage mood="happy" size={88} alt={gatorAlt('happy')} />
          </Box>
          <Typography sx={{ fontSize: 15, lineHeight: 1.4 }}>
            <strong>{t('review.banner', { count })}</strong>
            <br />
            {check > 0
              ? t('review.bannerCheck', { count: check })
              : t('review.bannerClear')}
          </Typography>
        </Box>
      ) : null}
      {children}
      {count > 0 ? (
        <ReviewActionBar
          saveLabel={saveLabel}
          canSave={canSave}
          onSave={onSave}
          onDiscard={onRetake}
          discardLabel={tReview('overview.retake')}
        />
      ) : null}
    </SetupReviewFrame>
  );
}
