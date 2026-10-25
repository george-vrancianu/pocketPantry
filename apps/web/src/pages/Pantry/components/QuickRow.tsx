import {
  Box,
  CameraIcon,
  focusRing,
  radius,
  ScanBarcodeIcon,
  tokens,
} from '@pocket-pantry/ui';
import type { MouseEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { CameraMode } from '../../../lib/cameraMode';

type Props = {
  /** A read is under way: the tiles stay focusable but do nothing. */
  disabled: boolean;
  /** Set to the tile that opened the camera, so focus can return to it. */
  openerRef: { current: HTMLButtonElement | null };
  onOpen: (mode: CameraMode) => void;
};

/** The Add to Pantry sheet's fastest ways in: the camera on Product, or on Barcode. */
export function QuickRow({ disabled, openerRef, onOpen }: Props) {
  const { t } = useTranslation('pantry');
  return (
    <Box
      role="group"
      aria-label={t('form.quick.label')}
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '8px',
      }}
    >
      <Tile
        label={t('form.quick.photo')}
        icon={<CameraIcon size={24} />}
        disabled={disabled}
        openerRef={openerRef}
        onOpen={() => onOpen('product')}
      />
      <Tile
        label={t('form.quick.barcode')}
        icon={<ScanBarcodeIcon size={24} />}
        disabled={disabled}
        openerRef={openerRef}
        onOpen={() => onOpen('barcode')}
      />
    </Box>
  );
}

function Tile({
  label,
  icon,
  disabled,
  openerRef,
  onOpen,
}: {
  label: string;
  icon: ReactNode;
  disabled: boolean;
  openerRef: { current: HTMLButtonElement | null };
  onOpen: () => void;
}) {
  const { color } = tokens;
  return (
    <Box
      component="button"
      type="button"
      aria-disabled={disabled || undefined}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        if (disabled) return;
        openerRef.current = event.currentTarget;
        onOpen();
      }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        minHeight: 66,
        font: 'inherit',
        fontSize: 13,
        fontWeight: 700,
        color: color.ink,
        backgroundColor: color.surface,
        border: `1px solid ${color.line}`,
        borderRadius: radius.chip,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        '&:hover': { backgroundColor: color.subtle },
        ...focusRing,
      }}
    >
      <Box aria-hidden="true" sx={{ display: 'grid', color: color.accent }}>
        {icon}
      </Box>
      {label}
    </Box>
  );
}
