import {
  aboveDock,
  Box,
  color,
  DOCK_HEIGHT,
  IngredientsScanIcon,
  ReceiptIcon,
} from '@pocket-pantry/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppDock } from '../../components/AppDock';
import { ChoiceRadioGroup } from '../../components/ChoiceRadioGroup';
import { IntroLook } from '../../components/IntroLook';
import { creamFocus } from '../../components/Setup/creamFocus';
import { GatorBubble } from '../../components/Setup/GatorBubble';
import { SetupCallout } from '../../components/Setup/SetupCallout';
import { SetupOliveTopRow } from '../../components/Setup/SetupOliveTopRow';
import { INTRO_CAMERA_PATH, introPath, skipStep } from '../../lib/intro';
import { resetScanSession } from '../../lib/scanSession';

type Pick = 'ingredients' | 'receipt';

/** Where Skip goes: the Intro module's rule, never a path written here. */
const SKIP_TO = introPath(skipStep('snap'));

/**
 * Setup 1, Snap: the olive screen that teaches where the camera lives. Gator's line follows the pick,
 * and the real Dock is shown with only the camera lit, which opens the Scan screen in the picked mode.
 */
export function SnapPage() {
  const { t } = useTranslation('onboarding');
  const [pick, setPick] = useState<Pick>('ingredients');

  // Setup takes one photo, so one left from before (browser Back from the Setup Review) must not be stacked
  // under the next. (Setup is started on Set up or skip: a reload here goes back there.)
  useEffect(() => {
    resetScanSession();
  }, []);

  return (
    <IntroLook ground="olive">
      <Box
        component="main"
        sx={[
          {
            boxSizing: 'border-box',
            maxWidth: 520,
            mx: 'auto',
            px: '24px',
            pt: '48px',
            pb: '240px',
            color: color.cardBg,
          },
          creamFocus,
        ]}
      >
        <SetupOliveTopRow skipTo={SKIP_TO} />

        <GatorBubble live mt="24px">
          {t(`snap.bubble.${pick}`)}
        </GatorBubble>

        <Box sx={{ mt: '32px' }}>
          <ChoiceRadioGroup<Pick>
            tone="olive"
            label={t('snap.question')}
            value={pick}
            onChange={setPick}
            choices={[
              {
                value: 'ingredients',
                label: t('snap.choices.ingredients.label'),
                description: t('snap.choices.ingredients.hint'),
                icon: <IngredientsScanIcon size={22} />,
              },
              {
                value: 'receipt',
                label: t('snap.choices.receipt.label'),
                description: t('snap.choices.receipt.hint'),
                icon: <ReceiptIcon size={22} />,
              },
            ]}
          />
        </Box>
      </Box>
      <SetupCallout
        title={t('snap.callout.title')}
        body={t('snap.callout.body')}
        bottom={aboveDock(DOCK_HEIGHT.xs)}
      />
      <AppDock
        teach="camera"
        cameraHref={`${INTRO_CAMERA_PATH}?mode=${pick}`}
      />
    </IntroLook>
  );
}
