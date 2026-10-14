import {
  Box,
  Card,
  CheckIcon,
  Stack,
  THEME_IDS,
  Toggle,
  Typography,
  type ThemeId,
  displayType,
  nestedRadius,
  radius,
  focusRing,
  resolveTheme,
  useToast,
} from '@pocket-pantry/ui';
import { useEffect, useId, useRef, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  onThemeSaveFailed,
  pickThemeOutcome,
  setMatchSystem,
  setMatchSystemOutcome,
  systemPrefersDark,
  useAppearance,
  useChooseTheme,
} from '../../../lib/appearance';
import { ScopeCaption, SectionHeading } from './SectionHeading';

const NEXT_KEYS = ['ArrowRight', 'ArrowDown'];
const PREVIOUS_KEYS = ['ArrowLeft', 'ArrowUp'];

/**
 * Settings → You → Appearance (handoff §3.1): a radiogroup of Theme tiles and
 * the Match system switch. The rules for what a tap does live in
 * `pickThemeOutcome` and `setMatchSystemOutcome`; this component applies them
 * and shows their notices as toasts.
 */
export function AppearanceCard() {
  const { t } = useTranslation('settings');
  const id = useId();
  const toast = useToast();
  const appearance = useAppearance();
  const chooseTheme = useChooseTheme();
  const tiles = useRef<Partial<Record<ThemeId, HTMLButtonElement | null>>>({});

  useEffect(
    () =>
      onThemeSaveFailed(() => {
        toast.show(t('appearance.syncedOnDevice'));
      }),
    [toast, t],
  );

  const pick = (theme: ThemeId) => {
    const { next, notice } = pickThemeOutcome(
      appearance,
      theme,
      systemPrefersDark(),
    );
    if (next.theme !== appearance.theme) chooseTheme(next.theme);
    if (next.matchSystem !== appearance.matchSystem) {
      setMatchSystem(next.matchSystem);
    }
    if (notice === 'lightOnly') {
      toast.show(
        t('appearance.lightOnlyToast', { name: t(`appearance.${theme}`) }),
      );
    } else if (notice === 'darkEverywhere') {
      toast.show(t('appearance.darkEverywhereToast'));
    }
  };

  const toggleMatchSystem = (matchSystem: boolean) => {
    const next = setMatchSystemOutcome(appearance, matchSystem);
    if (next.theme !== appearance.theme) chooseTheme(next.theme);
    setMatchSystem(next.matchSystem);
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
    pick(next);
    tiles.current[next]?.focus();
  };

  // The light Theme in use while Match system is on (Warm editorial if Dark-first was chosen).
  const lightInUse = resolveTheme({ ...appearance, matchSystem: true }, false);

  return (
    <Stack spacing={1}>
      <SectionHeading
        id={`${id}-title`}
        title={t('appearance.title')}
        scope={<ScopeCaption scope="you" label={t('scope.you')} />}
      />
      <Card>
        <Stack spacing={1.5}>
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
              const usedInLight =
                appearance.matchSystem &&
                theme === lightInUse &&
                theme !== 'dark';
              const note = usedInDark
                ? t('appearance.usedInDark')
                : usedInLight
                  ? t('appearance.usedInLight')
                  : null;
              return (
                <Box
                  key={theme}
                  component="button"
                  type="button"
                  ref={(node: HTMLButtonElement | null) => {
                    tiles.current[theme] = node;
                  }}
                  role="radio"
                  aria-checked={selected}
                  // Named by the Theme alone; the mode note is its description.
                  aria-labelledby={`${id}-name-${theme}`}
                  aria-describedby={note ? `${id}-note-${theme}` : undefined}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => pick(theme)}
                  onKeyDown={(event) => onKeyDown(event, theme)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: 0.75,
                    minWidth: 0,
                    p: '5px 5px 8px',
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
                  <ThemePreview theme={theme} selected={selected} />
                  <Typography
                    component="span"
                    id={`${id}-name-${theme}`}
                    sx={{
                      fontSize: 13,
                      fontWeight: 700,
                      lineHeight: 1.2,
                      px: 0.5,
                    }}
                  >
                    {t(`appearance.${theme}`)}
                  </Typography>
                  {note ? (
                    <Typography
                      id={`${id}-note-${theme}`}
                      component="span"
                      sx={{ fontSize: 11.5, color: 'text.secondary', px: 0.5 }}
                    >
                      {note}
                    </Typography>
                  ) : null}
                </Box>
              );
            })}
          </Box>
          <Box sx={{ borderTop: 1, borderColor: 'pp.divider', pt: 1.5 }}>
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
                <Box sx={{ mt: 0.5 }}>
                  <ScopeCaption scope="device" label={t('scope.device')} />
                </Box>
              </Box>
              <Toggle
                checked={appearance.matchSystem}
                onChange={toggleMatchSystem}
                aria-labelledby={`${id}-match`}
                aria-describedby={`${id}-match-hint`}
              />
            </Stack>
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
}

/** A 72 pt sketch of a screen painted in the Theme's own colours, with the check on the selected one. */
function ThemePreview({
  theme,
  selected,
}: {
  theme: ThemeId;
  selected: boolean;
}) {
  return (
    <Box
      data-theme={theme}
      aria-hidden
      sx={{
        position: 'relative',
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
        component="span"
        sx={{
          ...displayType,
          fontSize: 19,
          lineHeight: 1,
          color: 'text.primary',
        }}
      >
        Aa
      </Box>
      <Box
        sx={{
          height: 5,
          width: '78%',
          bgcolor: 'text.primary',
          borderRadius: radius.pill,
        }}
      />
      <Box
        sx={{
          height: 5,
          width: '52%',
          bgcolor: 'text.secondary',
          borderRadius: radius.pill,
        }}
      />
      <Box
        sx={{
          mt: 'auto',
          height: 12,
          width: '38%',
          bgcolor: 'primary.main',
          borderRadius: nestedRadius(radius.control, 2),
        }}
      />
      {selected ? (
        <Box
          sx={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 20,
            height: 20,
            borderRadius: radius.pill,
            bgcolor: 'pp.accent',
            color: 'pp.accentInk',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckIcon size={14} />
        </Box>
      ) : null}
    </Box>
  );
}
