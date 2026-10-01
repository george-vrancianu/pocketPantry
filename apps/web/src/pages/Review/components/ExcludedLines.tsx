import { Box, Button, Stack, Typography, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { ReviewLine } from '../../../lib/review';

type Props = {
  lines: ReviewLine[];
  onInclude: (key: string) => void;
};

/**
 * Receipt lines the Scan left out of the Pantry (carrier bags, cleaning
 * products, unreadable lines), collapsed, each with its reason and a way to
 * put it back. A native disclosure keeps keyboard and screen-reader behaviour.
 */
export function ExcludedLines({ lines, onInclude }: Props) {
  const { t } = useTranslation('review');
  if (lines.length === 0) return null;
  const title = t('excluded.title', { count: lines.length });

  return (
    <Box
      component="details"
      role="group"
      aria-label={title}
      sx={{
        borderRadius: `${tokens.radius.card}px`,
        bgcolor: tokens.color.surface,
        border: `1px solid ${tokens.color.line}`,
      }}
    >
      <Box
        component="summary"
        sx={{
          cursor: 'pointer',
          minHeight: 44,
          display: 'flex',
          alignItems: 'center',
          px: 2,
          fontWeight: 700,
        }}
      >
        {title}
      </Box>
      <Stack
        component="ul"
        spacing={1}
        sx={{ m: 0, p: 2, pt: 0, listStyle: 'none' }}
      >
        {lines.map((line) => (
          <Stack
            key={line.key}
            component="li"
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center' }}
          >
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600 }}>{line.name}</Typography>
              <Typography sx={{ fontSize: 13, color: tokens.color.muted }}>
                {line.excluded?.reason ?? t('excluded.noReason')}
              </Typography>
            </Box>
            <Button
              variant="text"
              type="button"
              onClick={() => onInclude(line.key)}
              aria-label={t('excluded.include', { name: line.name })}
            >
              {t('excluded.includeShort')}
            </Button>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
