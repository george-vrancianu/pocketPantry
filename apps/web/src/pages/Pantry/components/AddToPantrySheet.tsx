import {
  Box,
  CloseIcon,
  displayType,
  IconButton,
  Sheet,
} from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { AddBatchStart } from '../hooks/useAddBatchForm';
import { AddBatchForm } from './AddBatchForm';

type Props = {
  open: boolean;
  onClose: () => void;
  /** Called once the sheet has slid away and focus is back on the opener. */
  onExited?: () => void;
  /** Start with an Ingredient picked, or an Unmatched name typed in; empty without. */
  start?: AddBatchStart;
};

/**
 * The Add to Pantry sheet: a modal bottom sheet over the Pantry. The title row is the header; the
 * body holds the add-Batch form, which focuses its search on open. Later additions (a footer, an
 * Added strip) go into the `header`, `footer` and body slots here.
 */
export function AddToPantrySheet({ open, onClose, onExited, start }: Props) {
  const { t } = useTranslation('pantry');
  // The camera overlay owns Escape while it is up; the sheet must not close under it.
  const [cameraOpen, setCameraOpen] = useState(false);
  const navigate = useNavigate();
  const close = () => {
    if (!cameraOpen) onClose();
  };
  return (
    <Sheet
      open={open}
      onClose={close}
      onExited={onExited}
      label={t('form.title')}
      header={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            p: '4px 18px 10px',
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0, ...displayType, fontSize: 22 }}>
            {t('form.title')}
          </Box>
          <IconButton
            label={t('form.close')}
            tone="neutral"
            size={40}
            onClick={onClose}
          >
            <CloseIcon size={18} />
          </IconButton>
        </Box>
      }
    >
      <Box sx={{ p: '0 18px 20px' }}>
        <AddBatchForm
          start={start}
          onSaved={onClose}
          onCancel={onClose}
          onCameraOpenChange={setCameraOpen}
          onScanSeveral={(mode) => {
            onClose();
            navigate(`/scan?mode=${mode}`);
          }}
        />
      </Box>
    </Sheet>
  );
}
