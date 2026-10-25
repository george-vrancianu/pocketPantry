import { Box, Typography, usePrefersReducedMotion } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { BarcodeLookupNotes } from '../../../components/BarcodeLookupNotes';
import type { BarcodeLookup } from '../../../lib/barcode';
import { BARCODE_GLYPH } from './barcodeGlyph';

const INK = '#2B2418';
const MUTED = '#766A58';

const button = {
  minHeight: 42,
  border: 0,
  borderRadius: '12px',
  font: 'inherit',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
};

type Props = {
  code: string;
  /** Null while the lookup is out. */
  lookup: BarcodeLookup | null;
  /** The lookup failed: shown instead of the product, with only Scan again. */
  error?: string;
  onScanAgain: () => void;
  onUse: () => void;
  onTakePhoto: () => void;
  onTypeIt: () => void;
};

/**
 * What a read barcode shows over the camera before anything is filled: the product (with the Open
 * Food Facts credit when its data came from there) and Scan again / Use this, or, for a code
 * nobody knows yet, Take a photo / Type it. A polite live region, so the read is announced.
 */
export function BarcodeResultCard({
  code,
  lookup,
  error,
  onScanAgain,
  onUse,
  onTakePhoto,
  onTypeIt,
}: Props) {
  const { t } = useTranslation('scan');
  const reduced = usePrefersReducedMotion();
  const found = lookup?.found ? lookup : null;
  const name = found ? (found.unmatchedName ?? found.productDescription) : '';
  const match = found?.match ?? null;
  return (
    <Box
      role="status"
      data-testid="barcode-card"
      sx={{
        position: 'absolute',
        left: 14,
        right: 14,
        bottom: 190,
        p: 1.5,
        borderRadius: '18px',
        backgroundColor: 'rgba(251,248,241,.97)',
        color: INK,
        boxShadow: '0 14px 34px rgba(0,0,0,.4)',
        ...(!reduced && {
          animation: 'pp-card-up 280ms ease-out',
          '@keyframes pp-card-up': {
            from: { transform: 'translateY(24px)', opacity: 0 },
            to: { transform: 'none', opacity: 1 },
          },
        }),
      }}
    >
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1.5 }}>
        <Box
          aria-hidden="true"
          sx={{
            width: 46,
            height: 46,
            flex: 'none',
            borderRadius: '12px',
            backgroundColor: '#EAE1CF',
            display: 'grid',
            placeItems: 'center',
            '& svg': {
              width: 26,
              height: 26,
              fill: 'none',
              stroke: INK,
              strokeWidth: 1.8,
            },
          }}
        >
          {BARCODE_GLYPH}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="div"
            sx={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 11,
              letterSpacing: '.06em',
              color: MUTED,
            }}
          >
            {code}
          </Typography>
          {error ? (
            <Typography component="div" sx={{ fontWeight: 700, fontSize: 14 }}>
              {error}
            </Typography>
          ) : lookup === null ? (
            <Typography
              component="div"
              sx={{ fontWeight: 700, fontSize: 15.5 }}
            >
              {t('barcode.lookingUp')}
            </Typography>
          ) : found ? (
            <>
              <Typography
                component="div"
                sx={{ fontWeight: 700, fontSize: 15.5 }}
              >
                {name}
              </Typography>
              {match ? (
                <Typography
                  component="div"
                  sx={{ fontSize: 12.5, color: MUTED }}
                >
                  {t('barcode.ingredientAisle', {
                    ingredient: match.name,
                    aisle: match.parentCategory.aisle.name,
                  })}
                </Typography>
              ) : null}
            </>
          ) : (
            <Typography
              component="div"
              sx={{ fontWeight: 700, fontSize: 15.5 }}
            >
              {t('barcode.unknown')}
            </Typography>
          )}
        </Box>
      </Box>
      {found ? (
        <Box sx={{ mb: 1, color: MUTED }}>
          <BarcodeLookupNotes
            lookup={{
              fromOpenFoodFacts: found.source === 'open_food_facts',
              missingAllergens: found.missingAllergens,
            }}
          />
        </Box>
      ) : null}
      {error ? (
        <Box
          component="button"
          type="button"
          onClick={onScanAgain}
          sx={{
            ...button,
            width: '100%',
            backgroundColor: '#EAE1CF',
            color: INK,
          }}
        >
          {t('barcode.scanAgain')}
        </Box>
      ) : lookup === null ? null : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.3fr',
            gap: 1,
          }}
        >
          {found ? (
            <>
              <Box
                component="button"
                type="button"
                onClick={onScanAgain}
                sx={{ ...button, backgroundColor: '#EAE1CF', color: INK }}
              >
                {t('barcode.scanAgain')}
              </Box>
              <Box
                component="button"
                type="button"
                onClick={onUse}
                sx={{ ...button, backgroundColor: '#5F6F2E', color: '#fff' }}
              >
                {t('barcode.use')}
              </Box>
            </>
          ) : (
            <>
              <Box
                component="button"
                type="button"
                onClick={onTypeIt}
                sx={{ ...button, backgroundColor: '#EAE1CF', color: INK }}
              >
                {t('typeIt')}
              </Box>
              <Box
                component="button"
                type="button"
                onClick={onTakePhoto}
                sx={{ ...button, backgroundColor: '#5F6F2E', color: '#fff' }}
              >
                {t('barcode.takePhoto')}
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
