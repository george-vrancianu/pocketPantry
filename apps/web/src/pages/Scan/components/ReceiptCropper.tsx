import { Box, Button, Typography, tokens } from '@pocket-pantry/ui';
import { useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';
import { useTranslation } from 'react-i18next';
import type { Rect } from '../../../lib/image';
import { RECEIPT_GUIDE_ASPECT } from '../../../lib/receiptGuide';

/** What the Member framed: the crop in the rotated photo's pixels, and the rotation it was made at. */
export type ReceiptCrop = { area: Rect; rotation: number };

const FINE_ROTATION_LIMIT = 15;

/**
 * The crop step for a receipt photo from the gallery: pan, zoom and rotate the photo under a
 * fixed 1:3 frame (the same shape as the camera guide). Reusable per photo.
 */
export function ReceiptCropper({
  photo,
  onConfirm,
  onCancel,
}: {
  photo: Blob;
  onConfirm: (crop: ReceiptCrop) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation('scan');
  const [url, setUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [quarterTurns, setQuarterTurns] = useState(0);
  const [fine, setFine] = useState(0);
  const [area, setArea] = useState<Rect | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(photo);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  const rotation = quarterTurns * 90 + fine;

  return (
    <Box
      role="dialog"
      aria-modal="true"
      aria-label={t('crop.title')}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#000000',
        color: '#FFFFFF',
      }}
    >
      <Typography sx={{ p: 2, textAlign: 'center', fontSize: 14 }}>
        {t('crop.instruction')}
      </Typography>
      <Box sx={{ position: 'relative', flex: 1 }}>
        {url ? (
          <Cropper
            image={url}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={RECEIPT_GUIDE_ASPECT}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setArea(pixels)}
          />
        ) : null}
      </Box>
      <Box sx={{ px: 3, pt: 2 }}>
        <Box
          component="label"
          sx={{ display: 'block', fontSize: 13, textAlign: 'center' }}
        >
          {t('crop.fine', { degrees: fine })}
          <Box
            component="input"
            type="range"
            min={-FINE_ROTATION_LIMIT}
            max={FINE_ROTATION_LIMIT}
            step={1}
            value={fine}
            onChange={(event) => setFine(Number(event.target.value))}
            sx={{
              display: 'block',
              width: '100%',
              accentColor: tokens.color.accentMid,
            }}
          />
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          justifyContent: 'center',
          flexWrap: 'wrap',
          p: 2,
        }}
      >
        <Button
          variant="text"
          sx={{ color: '#FFFFFF' }}
          onClick={() => onCancel()}
        >
          {t('crop.cancel')}
        </Button>
        <Button
          variant="text"
          sx={{ color: '#FFFFFF' }}
          onClick={() => setQuarterTurns((turns) => (turns + 3) % 4)}
        >
          {t('crop.rotateLeft')}
        </Button>
        <Button
          variant="text"
          sx={{ color: '#FFFFFF' }}
          onClick={() => setQuarterTurns((turns) => (turns + 1) % 4)}
        >
          {t('crop.rotateRight')}
        </Button>
        <Button
          disabled={!area}
          onClick={() => area && onConfirm({ area, rotation })}
        >
          {t('crop.confirm')}
        </Button>
      </Box>
    </Box>
  );
}
