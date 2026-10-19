import { Box, CheckIcon, radius, shadow, useToast } from '@pocket-pantry/ui';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { SCAN_LANGUAGES, type ScanLanguage } from '../../i18n/resources';
import { buttonBottom, toastBottom } from './placement';

/** Each language in its own name, whatever the UI language. */
const OWN_NAME: Record<ScanLanguage, string> = {
  en: 'English',
  ro: 'Română',
  da: 'Dansk',
};

type Props = {
  value: ScanLanguage;
  disabled: boolean;
  onChange: (language: ScanLanguage) => void;
};

/**
 * The Scan Language chip left of the Voice Note button, and the menu it opens. It reads and
 * writes the stored Scan Language (ADR 0003), so the camera's chip follows.
 */
export function LanguageMenu({ value, disabled, onChange }: Props) {
  const { t } = useTranslation('voice');
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const chip = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  const close = () => {
    setOpen(false);
    chip.current?.focus();
  };

  // Focus the current language on open; a tap outside closes without stealing focus.
  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    const away = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menu.current?.contains(target) && !chip.current?.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open]);

  const choose = (language: ScanLanguage) => {
    onChange(language);
    toast.show(
      `${t('languageMenu.saved', {
        language: t(`languageMenu.names.${language}`),
      })} · ${t('languageMenu.savedHint')}`,
      { polite: true, bottom: toastBottom },
    );
    close();
  };

  const onMenuKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    const delta =
      event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
    if (delta === 0) return;
    event.preventDefault();
    const items = Array.from(
      menu.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ??
        [],
    );
    const at = items.indexOf(document.activeElement as HTMLElement);
    items[(at + delta + items.length) % items.length]?.focus();
  };

  return (
    <>
      <Box
        component="button"
        ref={chip}
        type="button"
        aria-label={t('languageMenu.chipLabel', {
          language: t(`languageMenu.names.${value}`),
        })}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((was) => !was)}
        sx={{
          position: 'relative',
          height: 30,
          minWidth: 40,
          px: '9px',
          border: '1px solid',
          borderColor: 'pp.lineStrong',
          borderRadius: radius.chip,
          backgroundColor: 'pp.cardBg',
          color: 'text.primary',
          boxShadow: shadow.card,
          font: 'inherit',
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          // A 44 pt target around the 30 pt pill.
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: '-7px -2px',
          },
        }}
      >
        {value}
      </Box>
      {open ? (
        <Box
          ref={menu}
          role="menu"
          aria-label={t('languageMenu.title')}
          onKeyDown={onMenuKeyDown}
          sx={{
            position: 'fixed',
            right: 16,
            bottom: {
              xs: `calc(${buttonBottom.xs} + 72px)`,
              md: `calc(${buttonBottom.md} + 72px)`,
            },
            width: 220,
            p: '6px',
            zIndex: 1250,
            backgroundColor: 'pp.cardBg',
            borderRadius: radius.control,
            boxShadow: shadow.float,
          }}
        >
          <Box
            sx={{
              p: '6px 10px 4px',
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: '.07em',
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            {t('languageMenu.title')}
          </Box>
          {SCAN_LANGUAGES.map((language) => (
            <Box
              key={language}
              component="button"
              type="button"
              role="menuitemradio"
              lang={language}
              aria-checked={language === value}
              onClick={() => choose(language)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                p: '9px 10px',
                border: 0,
                borderRadius: radius.box,
                background: 'none',
                color: 'text.primary',
                font: 'inherit',
                fontSize: 14.5,
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer',
                '&:hover, &:focus-visible': {
                  backgroundColor: 'pp.subtle',
                },
              }}
            >
              <span style={{ flex: 1 }}>{OWN_NAME[language]}</span>
              <Box
                component="span"
                sx={{ fontSize: 12, color: 'text.secondary' }}
              >
                {language.toUpperCase()}
              </Box>
              <Box
                component="span"
                aria-hidden
                sx={{ width: 16, color: 'pp.accent', display: 'flex' }}
              >
                {language === value ? <CheckIcon size={16} /> : null}
              </Box>
            </Box>
          ))}
        </Box>
      ) : null}
    </>
  );
}
