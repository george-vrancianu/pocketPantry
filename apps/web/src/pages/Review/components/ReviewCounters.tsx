import { Box, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';

type Props = { save: number; check: number; excluded: number };

/** Three live tiles: lines to save, lines to check, lines excluded. */
export function ReviewCounters({ save, check, excluded }: Props) {
  const { t } = useTranslation('review');
  const tiles = [
    {
      key: 'save',
      value: save,
      sx: {
        bgcolor: tokens.color.surface,
        border: `1px solid ${tokens.color.line}`,
        color: tokens.color.ink,
      },
    },
    {
      key: 'check',
      value: check,
      sx: {
        bgcolor: tokens.color.urgentBg,
        border: '1px solid transparent',
        color: tokens.color.urgentFg,
      },
    },
    {
      key: 'excluded',
      value: excluded,
      sx: {
        bgcolor: tokens.color.chipNeutral,
        border: '1px solid transparent',
        color: tokens.color.muted,
      },
    },
  ];
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        mt: '14px',
      }}
    >
      {tiles.map((tile) => (
        <Box
          key={tile.key}
          sx={{ borderRadius: '16px', px: '12px', py: '10px', ...tile.sx }}
        >
          <Box
            sx={{
              fontFamily: tokens.font.display,
              fontSize: 24,
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            {tile.value}
          </Box>
          <Box sx={{ fontSize: 12, fontWeight: 600 }}>
            {t(`counter.${tile.key}`)}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
