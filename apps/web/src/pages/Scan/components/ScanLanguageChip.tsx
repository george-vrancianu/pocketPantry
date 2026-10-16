import { Box, tokens, radius } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { Locale, ScanLanguage } from '../../../i18n/resources';
import { glassControl, glassFocusRing } from './glass';
import { scanLanguageOptions } from '../../../lib/scanLanguage';

type Props = {
  value: ScanLanguage;
  /** The UI language, listed first. */
  locale: Locale;
  disabled: boolean;
  /** `glass` is the translucent look on the camera; `surface` the plain pill used on a page. */
  variant?: 'glass' | 'surface';
  onChange: (language: ScanLanguage) => void;
};

/** The language this Scan is read in ("EN ▾"), picked without touching the UI language. */
export function ScanLanguageChip({
  value,
  locale,
  disabled,
  variant = 'glass',
  onChange,
}: Props) {
  const { t } = useTranslation('scan');
  return (
    <Box
      component="select"
      aria-label={t('scanLanguage.label')}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as ScanLanguage)}
      sx={{
        // As tall as the Info and Done buttons beside it.
        height: variant === 'glass' ? 40 : 48,
        px: variant === 'glass' ? '10px' : '12px',
        borderRadius: radius.pill,
        ...(variant === 'glass'
          ? glassControl(disabled)
          : {
              border: 0,
              backgroundColor: tokens.color.surface,
              boxShadow: `inset 0 0 0 1px ${tokens.color.line}`,
              color: tokens.color.ink,
              opacity: disabled ? 0.5 : 1,
            }),
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 700,
        cursor: disabled ? 'default' : 'pointer',
        '&:focus-visible': glassFocusRing,
        '& option': { color: tokens.color.ink },
      }}
    >
      {scanLanguageOptions(locale).map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Box>
  );
}
