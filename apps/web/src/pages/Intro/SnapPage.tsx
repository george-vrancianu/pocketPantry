import {
  aboveDock,
  Box,
  color,
  DOCK_HEIGHT,
  GatorImage,
  IngredientsScanIcon,
  Link,
  radius,
  ReceiptIcon,
  shadow,
  Typography,
} from '@pocket-pantry/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppDock } from '../../components/AppDock';
import { ChoiceRadioGroup } from '../../components/ChoiceRadioGroup';
import { IntroLook } from '../../components/IntroLook';
import { SetupProgress } from '../../components/SetupReview/SetupProgress';
import { introPath, skipStep } from '../../lib/intro';
import { useGatorAlt } from '../../lib/useGatorAlt';
import { resetScanSession } from '../../lib/scanSession';
import { useIntro } from '../../lib/useIntro';

type Pick = 'ingredients' | 'receipt';

/** Where Skip goes: the Intro module's rule, never a path written here. */
const SKIP_TO = introPath(skipStep('snap') ?? 'all-set');

/** Keyboard rings are the olive page colour by default, which vanishes on the olive ground: make them cream. */
const creamFocus = {
  '&& :focus-visible, && .Mui-focusVisible, && label:has(:focus-visible), && a:focus-visible':
    { outlineColor: color.cardBg },
} as const;

/** A cream card with a pointer at the bottom, aimed at the capsule below it. */
function Callout({ title, body }: { title: string; body: string }) {
  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: aboveDock(DOCK_HEIGHT.xs),
        mx: 'auto',
        width: 'fit-content',
        maxWidth: 'calc(100% - 32px)',
        boxSizing: 'border-box',
        px: '14px',
        py: '10px',
        textAlign: 'center',
        borderRadius: radius.card,
        backgroundColor: 'pp.cardBg',
        color: 'text.primary',
        boxShadow: shadow.float,
        '&::after': {
          content: '""',
          position: 'absolute',
          left: '50%',
          bottom: -6,
          width: 12,
          height: 12,
          transform: 'translateX(-50%) rotate(45deg)',
          backgroundColor: 'pp.cardBg',
        },
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{title}</Typography>
      <Typography
        variant="meta"
        sx={{ display: 'block', color: 'text.secondary' }}
      >
        {body}
      </Typography>
    </Box>
  );
}

/**
 * Setup 1, Snap: the olive screen that teaches where the camera lives. Gator's line follows the pick,
 * and the real Dock is shown with only the camera lit, which opens the Scan screen in the picked mode.
 */
export function SnapPage() {
  const { t } = useTranslation('onboarding');
  const gatorAlt = useGatorAlt();
  const { startSetup } = useIntro();
  const [pick, setPick] = useState<Pick>('ingredients');

  // Opening Snap on its own (a reload) must still let the camera through to the Scan screen. Setup takes one
  // photo, so one left from before (browser Back from the Setup Review) must not be stacked under the next.
  useEffect(() => {
    resetScanSession();
    return startSetup();
  }, [startSetup]);

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <SetupProgress tone="olive" />
          <Link
            href={SKIP_TO}
            underline="always"
            sx={{
              color: color.cardBg,
              fontWeight: 600,
              fontSize: 15,
              '&:hover': { color: color.cardBg },
            }}
          >
            {t('snap.skip')}
          </Link>
        </Box>

        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: '8px', mt: '24px' }}
        >
          <Box sx={{ flexShrink: 0 }}>
            <GatorImage mood="talking" size={132} alt={gatorAlt('talking')} />
          </Box>
          <Typography
            role="status"
            sx={{
              flex: 1,
              px: '16px',
              py: '14px',
              borderRadius: radius.sheet,
              backgroundColor: 'pp.cardBg',
              color: 'text.primary',
              fontSize: 15.5,
              fontWeight: 600,
            }}
          >
            {t(`snap.bubble.${pick}`)}
          </Typography>
        </Box>

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
      <Callout title={t('snap.callout.title')} body={t('snap.callout.body')} />
      <AppDock teach="camera" cameraHref={`/scan?mode=${pick}`} />
    </IntroLook>
  );
}
