import { useNavigate } from 'react-router-dom';
import { INTRO_PATHS, setupReviewPath } from '../../lib/intro';
import type { CameraMode } from '../../lib/cameraMode';
import { ScanPage } from '../Scan/ScanPage';

/** Setup's photo is of ingredients or a receipt: the only modes the Intro's camera offers. */
const INTRO_MODES: readonly CameraMode[] = ['ingredients', 'receipt'];

/**
 * The Intro's camera (opened from Snap's Dock): the shared Scan screen with the Intro's settings. Only
 * Ingredients and Receipt, no Import, and the mode is not remembered. The shutter opens that photo's Setup
 * Review (it waits there while the photo is read), the photo stack opens the first photo's, and Close
 * goes back to Snap.
 */
export function IntroCameraPage() {
  const navigate = useNavigate();
  return (
    <ScanPage
      modes={INTRO_MODES}
      defaultMode="ingredients"
      rememberMode={false}
      importOffered={false}
      onShot={(id) => navigate(setupReviewPath(id), { replace: true })}
      openStack={(first) => {
        if (first) navigate(setupReviewPath(first));
      }}
      closeTo={INTRO_PATHS.snap}
    />
  );
}
