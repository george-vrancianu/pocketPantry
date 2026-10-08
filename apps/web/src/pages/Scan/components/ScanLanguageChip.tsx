import { Box, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { Locale, ScanLanguage } from '../../../i18n/resources';
import { scanLanguageOptions } from '../../../lib/scanLanguage';

type Props = {
  value: ScanLanguage;
  /** The UI language, listed first. */
  locale: Locale;
  disabled: boolean;
  onChange: (language: ScanLanguage) => void;
};

/** "Reading as: Română ▾": the language this Scan is read in, picked without touching the UI language. */
export function ScanLanguageChip({ value, locale, disabled, onChange }: Props) {
  const { t } = useTranslation('scan');
  return (
    <Box
      component="label"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        height: 36,
        px: '14px',
        borderRadius: '18px',
        backgroundColor: 'rgba(255,255,255,0.12)',
        color: '#FFFFFF',
        fontSize: 13,
        opacity: disabled ? 0.5 : 1,
        '&:focus-within': {
          outline: `2px solid ${tokens.color.accentMid}`,
          outlineOffset: 2,
        },
      }}
    >
      {t('scanLanguage.label')}
      <Box
        component="select"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as ScanLanguage)}
        sx={{
          border: 0,
          outline: 0,
          background: 'transparent',
          color: 'inherit',
          fontFamily: 'inherit',
          fontSize: 13,
          fontWeight: 700,
          cursor: disabled ? 'default' : 'pointer',
          '& option': { color: tokens.color.ink },
        }}
      >
        {scanLanguageOptions(locale).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Box>
    </Box>
  );
}
