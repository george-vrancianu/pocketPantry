import { Box, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { Locale, ScanLanguage } from '../../../i18n/resources';
import { glassControl, glassFocusRing } from './glass';
import { scanLanguageOptions } from '../../../lib/scanLanguage';

type Props = {
  value: ScanLanguage;
  /** The UI language, listed first. */
  locale: Locale;
  disabled: boolean;
  onChange: (language: ScanLanguage) => void;
};

/** The language this Scan is read in ("EN ▾"), picked without touching the UI language. */
export function ScanLanguageChip({ value, locale, disabled, onChange }: Props) {
  const { t } = useTranslation('scan');
  return (
    <Box
      component="select"
      aria-label={t('scanLanguage.label')}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as ScanLanguage)}
      sx={{
        height: 36,
        px: '10px',
        borderRadius: '18px',
        ...glassControl(disabled),
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
