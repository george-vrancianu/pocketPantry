import {
  Box,
  Card,
  CheckIcon,
  Stack,
  THEME_IDS,
  Toggle,
  Typography,
  type ThemeId,
  nestedRadius,
  radius,
  focusRing,
} from '@pocket-pantry/ui';
import { useId, useRef, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  setMatchSystem,
  useAppearance,
  useChooseTheme,
} from '../../../lib/appearance';

const NEXT_KEYS = ['ArrowRight', 'ArrowDown'];
const PREVIOUS_KEYS = ['ArrowLeft', 'ArrowUp'];

/**
 * Settings → Appearance (handoff section 4.1): a radiogroup of Theme tiles and
 * the Match system switch. With Match system on, the tiles keep showing the
 * chosen Theme and Dark-first is marked as the one used in dark mode.
 */
export function AppearanceCard() {
  const { t } = useTranslation('settings');
  const id = useId();
  const appearance = useAppearance();
  const chooseTheme = useChooseTheme();
  const tiles = useRef<Partial<Record<ThemeId, HTMLButtonElement | null>>>({});

  const choose = (theme: ThemeId) => {
    if (theme !== appearance.theme) chooseTheme(theme);
  };

  const onKeyDown = (event: KeyboardEvent, theme: ThemeId) => {
    const step = NEXT_KEYS.includes(event.key)
      ? 1
      : PREVIOUS_KEYS.includes(event.key)
        ? -1
        : 0;
    if (step === 0) return;
    event.preventDefault();
    const index = THEME_IDS.indexOf(theme);
    const next =
      THEME_IDS[(index + step + THEME_IDS.length) % THEME_IDS.length];
    choose(next);
    tiles.current[next]?.focus();
  };

  return (
    <Card>
      <Stack spacing={1.5}>
        <Typography
          id={`${id}-title`}
          component="h3"
          variant="body1"
          sx={{ fontWeight: 700 }}
        >
          {t('appearance.title')}
        </Typography>
        <Box
          role="radiogroup"
          aria-labelledby={`${id}-title`}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 1,
          }}
        >
          {THEME_IDS.map((theme) => {
            const selected = theme === appearance.theme;
            const usedInDark = appearance.matchSystem && theme === 'dark';
            return (
              <Stack key={theme} spacing={0.5} sx={{ minWidth: 0 }}>
                <Box
                  component="button"
                  type="button"
                  ref={(node: HTMLButtonElement | null) => {
                    tiles.current[theme] = node;
                  }}
                  role="radio"
                  aria-checked={selected}
                  aria-describedby={usedInDark ? `${id}-dark` : undefined}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => choose(theme)}
                  onKeyDown={(event) => onKeyDown(event, theme)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: 0.75,
                    p: 0.75,
                    borderWidth: 2,
                    borderStyle: 'solid',
                    borderColor: selected ? 'pp.accent' : 'pp.line',
                    borderRadius: radius.control,
                    bgcolor: 'transparent',
                    color: 'inherit',
                    font: 'inherit',
                    textAlign: 'left',
                    cursor: 'pointer',
                    ...focusRing,
                  }}
                >
                  <ThemePreview theme={theme} />
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 0.5,
                      minHeight: 20,
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}
                    >
                      {t(`appearance.${theme}`)}
                    </Typography>
                    {selected ? (
                      <Box
                        component="span"
                        sx={{ color: 'pp.accent', display: 'inline-flex' }}
                      >
                        <CheckIcon size={18} />
                      </Box>
                    ) : null}
                  </Box>
                </Box>
                {usedInDark ? (
                  <Typography
                    id={`${id}-dark`}
                    sx={{ fontSize: 12.5, color: 'text.secondary' }}
                  >
                    {t('appearance.usedInDark')}
                  </Typography>
                ) : null}
              </Stack>
            );
          })}
        </Box>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography id={`${id}-match`} variant="body1">
              {t('appearance.matchSystem')}
            </Typography>
            <Typography
              id={`${id}-match-hint`}
              variant="meta"
              color="text.secondary"
            >
              {t('appearance.matchSystemHint')}
            </Typography>
          </Box>
          <Toggle
            checked={appearance.matchSystem}
            onChange={setMatchSystem}
            aria-labelledby={`${id}-match`}
            aria-describedby={`${id}-match-hint`}
          />
        </Stack>
      </Stack>
    </Card>
  );
}

/** A 72 pt sketch of a screen painted in the Theme's own bg, ink, muted and primary. */
function ThemePreview({ theme }: { theme: ThemeId }) {
  return (
    <Box
      data-theme={theme}
      aria-hidden
      sx={{
        height: 72,
        p: 1.25,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.75,
        bgcolor: 'background.default',
        borderRadius: nestedRadius(radius.control, 6),
      }}
    >
      <Box
        sx={{
          height: 8,
          width: '70%',
          bgcolor: 'text.primary',
          borderRadius: radius.pill,
        }}
      />
      <Box
        sx={{
          height: 6,
          width: '50%',
          bgcolor: 'text.secondary',
          borderRadius: radius.pill,
        }}
      />
      <Box
        sx={{
          mt: 'auto',
          height: 16,
          width: '45%',
          bgcolor: 'primary.main',
          borderRadius: nestedRadius(radius.control, 8),
        }}
      />
    </Box>
  );
}
