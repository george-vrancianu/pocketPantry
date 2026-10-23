import { Box, Button, GatorImage, tokens, Typography } from '@pocket-pantry/ui';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { IntroLook } from '../../components/IntroLook';
import { INTRO_PATHS, introPath, nextStep, skipStep } from '../../lib/intro';
import { readScans } from '../../lib/scanReads';
import {
  canRetry,
  dispatchScanSession,
  scanDisplayState,
  showsErrorCopy,
  useScanSession,
  type SessionScan,
} from '../../lib/scanSession';
import { useGatorAlt } from '../../lib/useGatorAlt';
import { useIntro } from '../../lib/useIntro';
import { ReviewPage } from '../Review/ReviewPage';
import { SetupReviewFrame } from './components/SetupReviewView';
import { SetupTopRow } from './components/SetupTopRow';

/** Setup's Review while the photo is still being read, or when the read failed. */
function Waiting({
  scan,
  onRetake,
  onSkip,
}: {
  scan: SessionScan;
  onRetake: () => void;
  onSkip: () => void;
}) {
  const { t } = useTranslation('review');
  const { t: tScan } = useTranslation('scan');
  const gatorAlt = useGatorAlt();
  const failed = scanDisplayState(scan) === 'failed';
  let body: ReactNode;
  if (failed) {
    body = (
      <>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GatorImage mood="worried" size={64} alt={gatorAlt('worried')} />
          <Typography sx={{ fontWeight: 700 }}>
            {t('overview.failed')}
          </Typography>
        </Box>
        {scan.failure === 'cap' ? (
          <Typography sx={{ fontSize: 13, mt: 1 }}>
            {tScan('capReached')}
          </Typography>
        ) : showsErrorCopy(scan) ? (
          <Typography sx={{ fontSize: 13, mt: 1 }}>
            {tScan(`errors:${scan.errorCode}`, scan.errorParams)}
          </Typography>
        ) : null}
        <Box sx={{ display: 'flex', gap: '10px', mt: 2 }}>
          <Button variant="ghost" onClick={onRetake}>
            {t('overview.retake')}
          </Button>
          {canRetry(scan) ? (
            <Button
              onClick={() => {
                dispatchScanSession({ type: 'retry', id: scan.id });
                readScans();
              }}
            >
              {t('overview.readAgain')}
            </Button>
          ) : null}
        </Box>
      </>
    );
  } else {
    body = (
      <Box role="status" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* The line beside Gator says what it is doing, so the image is decorative. */}
        <GatorImage mood="list-keeper" size={96} decorative />
        <Typography>{t('overview.reading')}</Typography>
      </Box>
    );
  }
  return (
    <SetupReviewFrame>
      <SetupTopRow onCamera={onRetake} onSkip={onSkip} />
      <Typography
        variant="h2"
        component="h1"
        sx={{ pt: '20px', pb: '14px', color: tokens.color.ink }}
      >
        {t('title')}
      </Typography>
      {body}
    </SetupReviewFrame>
  );
}

/**
 * The Setup Review (Setup 1, after Snap): the real line editor of the one photo the Member took, in the
 * Intro's frame with Gator's banner. It lives at `setupReviewPath(scanId)`, outside the app shell, so the
 * Dock cannot lead the Member away. Saving counts the Batches for All set; Retake and the top row's
 * "‹ Camera" drop the photo and go back to the camera in the same mode; Skip drops it and goes on.
 */
export function SetupReviewPage() {
  const { scanId = '' } = useParams();
  const navigate = useNavigate();
  const { recordSaved } = useIntro();
  const scan = useScanSession().scans.find((s) => s.id === scanId);
  // Leaving drops the card from the Scan Session, which must not bounce this page to Snap on the way out.
  const [leaving, setLeaving] = useState(false);

  if (!scan) return leaving ? null : <Navigate to={INTRO_PATHS.snap} replace />;

  const drop = () => {
    setLeaving(true);
    dispatchScanSession({ type: 'remove', id: scan.id });
    // A photo held back by the Scan Cap can go on now.
    readScans();
  };
  const onRetake = () => {
    const { mode } = scan;
    drop();
    navigate(`/scan?mode=${mode}`, { replace: true });
  };
  const onSkip = () => {
    drop();
    navigate(introPath(skipStep('setup-review') ?? 'all-set'), {
      replace: true,
    });
  };

  return (
    <IntroLook>
      {scanDisplayState(scan) === 'read' ? (
        <ReviewPage
          key={scan.id}
          setup={{
            onSaved: (saved) => {
              setLeaving(true);
              recordSaved({ batches: saved });
              navigate(introPath(nextStep('setup-review')), { replace: true });
            },
            onRetake,
            onSkip,
          }}
        />
      ) : (
        <Waiting scan={scan} onRetake={onRetake} onSkip={onSkip} />
      )}
    </IntroLook>
  );
}
