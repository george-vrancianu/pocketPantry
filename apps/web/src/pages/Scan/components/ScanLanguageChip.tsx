import { Box, GlobeIcon, tokens, radius } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { Locale, ScanLanguage } from '../../../i18n/resources';
import { glassFocusRing, translucent } from './glass';
import { scanLanguageOptions } from '../../../lib/scanLanguage';

type Props = {
  value: ScanLanguage;
  /** The UI language, listed first. */
  locale: Locale;
  disabled: boolean;
  onChange: (language: ScanLanguage) => void;
};

/** The language this Scan is read in: a pill with a globe and the language code, picked without touching the UI language. */
export function ScanLanguageChip({ value, locale, disabled, onChange }: Props) {
  const { t } = useTranslation('scan');
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        mx: '4px',
        color: tokens.color.ink,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <GlobeIcon
        size={13}
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 10,
          pointerEvents: 'none',
        }}
      />
      <Box
        component="select"
        aria-label={t('scanLanguage.label')}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as ScanLanguage)}
        sx={{
          appearance: 'none',
          height: 28,
          minWidth: 44,
          boxSizing: 'border-box',
          pl: '28px',
          pr: '10px',
          borderRadius: radius.pill,
          border: `1.5px solid ${translucent(tokens.color.ink, 75)}`,
          backgroundColor: 'transparent',
          color: 'inherit',
          fontFamily: 'inherit',
          fontSize: 12.5,
          fontWeight: 800,
          letterSpacing: '0.06em',
          cursor: disabled ? 'default' : 'pointer',
          '&:focus-visible': glassFocusRing,
          '& option': {
            color: tokens.color.ink,
            backgroundColor: tokens.color.bg,
          },
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
