import {
  Box,
  CameraIcon,
  color,
  MicIcon,
  focusRing,
  radius,
  ScanBarcodeIcon,
  shadow,
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
  /** Present when the Dock has a mic: closes the sheet and lights it. */
  onSayIt?: () => void;
};

/** The Add to Pantry sheet's fastest ways in: the camera on Product, or on Barcode. */
export function QuickRow({ disabled, openerRef, onOpen, onSayIt }: Props) {
  const { t } = useTranslation('pantry');
  return (
    <Box
      role="group"
      aria-label={t('form.quick.label')}
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${onSayIt ? 3 : 2}, minmax(0, 1fr))`,
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
      {onSayIt ? (
        <Tile
          label={t('form.quick.sayIt')}
          icon={<MicIcon size={24} />}
          disabled={disabled}
          openerRef={openerRef}
          onOpen={onSayIt}
        />
      ) : null}
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
        color: 'text.primary',
        backgroundColor: color.cardBg,
        border: `1px solid ${color.cardLine}`,
        borderRadius: radius.card,
        boxShadow: shadow.card,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        '&:hover': { backgroundColor: 'pp.subtle' },
        ...focusRing,
      }}
    >
      <Box aria-hidden="true" sx={{ display: 'grid', color: 'pp.accent' }}>
        {icon}
      </Box>
      {label}
    </Box>
  );
}
