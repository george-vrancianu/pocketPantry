import {
  Box,
  CupboardIcon,
  FreezerIcon,
  FridgeIcon,
  SegmentedControl,
  SpicesIcon,
  Typography,
} from '@pocket-pantry/ui';
import type { ComponentProps, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LOCATIONS, type StorageLocation } from '../lib/catalog';

const ICONS: Record<StorageLocation, ReactNode> = {
  fridge: <FridgeIcon size={18} />,
  freezer: <FreezerIcon size={18} />,
  cupboard: <CupboardIcon size={18} />,
  spices: <SpicesIcon size={18} />,
};

type Props = {
  /** The visible caption above the toggle, also the group's accessible name. */
  label: string;
  /** The pressed Location; null when none is chosen yet. */
  value: StorageLocation | null;
  onChange: (location: StorageLocation) => void;
  /** The caption's look, to match the labels of the fields around it. */
  captionSx?: ComponentProps<typeof Typography>['sx'];
  /** Marks the toggle as the Voice review's focus target for this action. */
  voicePicker?: string;
};

/**
 * The four Locations as one full-width row of toggle buttons, an icon above
 * each label. Labels too long for a 320 px phone (Romanian) show their short
 * form; the button keeps the full name.
 */
export function LocationToggle({
  label,
  value,
  onChange,
  captionSx,
  voicePicker,
}: Props) {
  const { t } = useTranslation('common');
  return (
    <Box data-voice-picker={voicePicker}>
      {/* The group carries the same name, so the caption is not read twice. */}
      <Typography
        component="div"
        aria-hidden
        sx={[
          { fontSize: 12, fontWeight: 600, color: 'text.secondary', mb: '4px' },
          ...(Array.isArray(captionSx) ? captionSx : [captionSx]),
        ]}
      >
        {label}
      </Typography>
      <SegmentedControl
        label={label}
        fullWidth
        dense
        value={value}
        onChange={onChange}
        options={LOCATIONS.map((location) => {
          const full = t(`locations.${location}`);
          const short = t(`locationsShort.${location}`);
          return {
            value: location,
            label: short,
            accessibleLabel: short === full ? undefined : full,
            icon: ICONS[location],
          };
        })}
      />
    </Box>
  );
}
