import {
  Box,
  Button,
  MicIcon,
  MicOffIcon,
  Sheet,
  Stack,
  Typography,
  color,
  radius,
  tokens,
} from '@pocket-pantry/ui';
import type { ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { detectMobileBrowser } from '../../lib/browserKind';
import type { VoiceList } from '../../lib/voice';
import type { MicSheet } from './useMicPermission';

type MicSheetsProps = {
  sheet: MicSheet;
  target: VoiceList;
  shakes: number;
  onClose: () => void;
  onAllow: () => void;
  onRecheck: () => void;
};

const bold = { b: <b /> };

const footerSx = {
  display: 'flex',
  gap: '12px',
  p: '12px 16px calc(20px + env(safe-area-inset-bottom))',
  borderTop: `1px solid ${tokens.color.line}`,
  '& > :last-child': { flex: 1 },
};

function Hero({
  tone,
  shakes = 0,
  children,
}: {
  tone: 'accent' | 'urgent';
  shakes?: number;
  children: ReactNode;
}) {
  return (
    <Box
      // A new key replays the shake for each "still blocked".
      key={shakes}
      data-testid="mic-hero"
      data-shaking={shakes > 0 ? '' : undefined}
      aria-hidden
      sx={{
        width: 76,
        height: 76,
        mx: 'auto',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:
          tone === 'accent' ? tokens.color.accentTint : tokens.color.urgentBg,
        color: tone === 'accent' ? color.accentOnTint : tokens.color.urgentFg,
        ...(shakes > 0
          ? {
              animation: 'pp-voice-shake 420ms ease-in-out',
              '@keyframes pp-voice-shake': {
                '0%, 100%': { transform: 'translateX(0)' },
                '20%, 60%': { transform: 'translateX(-8px)' },
                '40%, 80%': { transform: 'translateX(8px)' },
              },
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }
          : {}),
      }}
    >
      {children}
    </Box>
  );
}

const examples = ['one', 'two', 'three'] as const;

function Intro({
  target,
  onClose,
  onAllow,
  open,
}: Pick<MicSheetsProps, 'target' | 'onClose' | 'onAllow'> & { open: boolean }) {
  const { t } = useTranslation('voice');
  return (
    <Sheet
      open={open}
      onClose={onClose}
      label={t('intro.title')}
      size="content"
      footer={
        <Box sx={footerSx}>
          <Button variant="ghost" onClick={onClose}>
            {t('intro.notNow')}
          </Button>
          <Button startIcon={<MicIcon size={18} />} onClick={onAllow}>
            {t('intro.allow')}
          </Button>
        </Box>
      }
    >
      <Stack spacing={2} sx={{ p: '20px 16px 16px' }}>
        <Hero tone="accent">
          <MicIcon size={34} />
        </Hero>
        <Typography variant="h2" sx={{ textAlign: 'center' }}>
          {t('intro.title')}
        </Typography>
        <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>
          {t('intro.body')}
        </Typography>
        <Stack
          spacing={1}
          component="ul"
          sx={{ m: 0, p: 0, listStyle: 'none' }}
        >
          {examples.map((key) => (
            <Box
              component="li"
              key={key}
              sx={{
                p: '9px 12px',
                borderRadius: radius.control,
                backgroundColor: 'pp.cardBg',
                border: `1px solid ${color.cardLine}`,
              }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                {`“${t(`intro.examples.${target}.${key}.say`)}”`}
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                {t(`intro.examples.${target}.${key}.result`)}
              </Typography>
            </Box>
          ))}
        </Stack>
        <Typography sx={{ color: 'text.secondary' }}>
          <Trans t={t} i18nKey="intro.privacy" components={bold} />
        </Typography>
      </Stack>
    </Sheet>
  );
}

function Steps({ browser }: { browser: 'safari' | 'chrome' }) {
  const { t } = useTranslation('voice');
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: 'text.secondary',
        }}
      >
        {t(`blocked.${browser}`)}
      </Typography>
      <Box
        component="ol"
        sx={{ m: 0, mt: 1, pl: '24px', color: 'text.secondary' }}
      >
        {(['Step1', 'Step2'] as const).map((step) => (
          <li key={step}>
            <Trans
              t={t}
              i18nKey={`blocked.${browser}${step}`}
              components={bold}
            />
          </li>
        ))}
      </Box>
    </Box>
  );
}

function Blocked({
  shakes,
  onClose,
  onRecheck,
  open,
}: Pick<MicSheetsProps, 'shakes' | 'onClose' | 'onRecheck'> & {
  open: boolean;
}) {
  const { t } = useTranslation('voice');
  const detected = detectMobileBrowser();
  const browsers = detected ? [detected] : (['safari', 'chrome'] as const);
  return (
    <Sheet
      open={open}
      onClose={onClose}
      label={t('blocked.title')}
      size="content"
      footer={
        <Box sx={footerSx}>
          <Button variant="ghost" onClick={onClose}>
            {t('blocked.close')}
          </Button>
          <Button onClick={onRecheck}>{t('blocked.retry')}</Button>
        </Box>
      }
    >
      <Stack spacing={2} sx={{ p: '20px 16px 16px' }}>
        <Hero tone="urgent" shakes={shakes}>
          <MicOffIcon size={34} />
        </Hero>
        <Typography variant="h2" sx={{ textAlign: 'center' }}>
          {t('blocked.title')}
        </Typography>
        <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>
          {t('blocked.body')}
        </Typography>
        <Stack
          spacing={2}
          sx={{
            p: '14px 16px',
            borderRadius: radius.control,
            backgroundColor: 'pp.cardBg',
            border: `1px solid ${color.cardLine}`,
          }}
        >
          {browsers.map((browser) => (
            <Steps key={browser} browser={browser} />
          ))}
        </Stack>
      </Stack>
    </Sheet>
  );
}

/** The two microphone sheets: the intro before the microphone is asked for, and the blocked one after a refusal. */
export function MicSheets({ sheet, ...props }: MicSheetsProps) {
  return (
    <>
      <Intro {...props} open={sheet === 'intro'} />
      <Blocked {...props} open={sheet === 'blocked'} />
    </>
  );
}
