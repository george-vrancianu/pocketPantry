import { Alert, Box, Typography, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { MAX_RECEIPT_SECTIONS } from '../../../lib/receiptSections';
import type { useReceiptSections } from '../hooks/useReceiptSections';

type Props = {
  batch: ReturnType<typeof useReceiptSections>;
  onFinish: () => void;
};

const buttonSx = (primary = false) =>
  ({
    minHeight: 44,
    px: 2,
    borderRadius: `${tokens.radius.input}px`,
    border: primary ? 0 : '1px solid rgba(255,255,255,0.25)',
    backgroundColor: primary ? '#FFFFFF' : 'rgba(255,255,255,0.10)',
    color: primary ? tokens.color.ink : '#FFFFFF',
    fontFamily: 'inherit',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    '&:disabled': { opacity: 0.5, cursor: 'default' },
    '&:focus-visible': {
      outline: `2px solid ${tokens.color.accentMid}`,
      outlineOffset: 2,
    },
  }) as const;

/** The Receipt Sections taken so far: thumbnails, the selected section's lines, and what to do next. */
export function ReceiptSections({ batch, onFinish }: Props) {
  const { t } = useTranslation('scan');
  const { sections, selected, pending } = batch;
  const section = selected === null ? undefined : sections[selected];
  const panelIndex = selected ?? batch.failedIndex;

  if (sections.length === 0 && panelIndex === null) return null;

  return (
    <Box sx={{ mt: 2 }}>
      {sections.length > 0 ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          {sections.map((done, index) => (
            <Box
              key={index}
              component="button"
              type="button"
              aria-label={t('sections.open', { number: index + 1 })}
              aria-pressed={selected === index}
              disabled={pending}
              onClick={() => batch.select(index)}
              sx={{
                p: 0,
                width: 44,
                height: 56,
                overflow: 'hidden',
                borderRadius: '6px',
                border:
                  selected === index
                    ? '2px solid #FFFFFF'
                    : '1px solid rgba(255,255,255,0.25)',
                background: 'none',
                cursor: 'pointer',
              }}
            >
              <Box
                component="img"
                src={done.thumbnail}
                alt=""
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          ))}
          <Typography sx={{ fontSize: 13, color: tokens.color.cameraMuted }}>
            {t('sections.count', {
              count: sections.length,
              max: MAX_RECEIPT_SECTIONS,
            })}
          </Typography>
          <Box
            component="button"
            type="button"
            disabled={pending}
            onClick={onFinish}
            sx={buttonSx(true)}
          >
            {t('sections.finish')}
          </Box>
        </Box>
      ) : null}

      {panelIndex !== null ? (
        <Box
          role="group"
          aria-label={t('sections.section', { number: panelIndex + 1 })}
          sx={{ mt: 1.5 }}
        >
          {section ? (
            <>
              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                {t('sections.found', {
                  number: panelIndex + 1,
                  count: section.lines.length,
                })}
              </Typography>
              {section.lines.length === 0 ? (
                <Alert severity="warning">{t('sections.empty')}</Alert>
              ) : (
                <Box
                  component="ul"
                  sx={{
                    m: 0,
                    mt: 0.5,
                    pl: 2.5,
                    fontSize: 13,
                    textAlign: 'left',
                  }}
                >
                  {section.lines.map((line, i) => (
                    <li key={i}>{line.name}</li>
                  ))}
                </Box>
              )}
            </>
          ) : null}
          <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Box
              component="button"
              type="button"
              onClick={() => batch.retake(panelIndex)}
              sx={buttonSx()}
            >
              {t('sections.retake')}
            </Box>
            {section ? (
              <Box
                component="button"
                type="button"
                onClick={() => batch.remove(panelIndex)}
                sx={buttonSx()}
              >
                {t('sections.delete')}
              </Box>
            ) : null}
            <Box
              component="button"
              type="button"
              onClick={batch.nextPhoto}
              sx={buttonSx()}
            >
              {t('sections.next')}
            </Box>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
