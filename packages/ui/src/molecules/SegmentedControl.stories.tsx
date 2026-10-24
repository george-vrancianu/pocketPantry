import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import { useState } from 'react';
import { SegmentedControl } from './SegmentedControl';
import {
  CupboardIcon,
  FreezerIcon,
  FridgeIcon,
  SpicesIcon,
} from '../atoms/icons';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Molecules/SegmentedControl',
  component: SegmentedControl,
};
export default meta;

function Segments() {
  const [value, setValue] = useState<'ingredients' | 'templates'>(
    'ingredients',
  );
  return (
    <Box sx={{ p: 3 }}>
      <SegmentedControl
        label="Add from"
        options={[
          { value: 'ingredients', label: 'Ingredients' },
          { value: 'templates', label: 'Templates' },
        ]}
        value={value}
        onChange={setValue}
      />
    </Box>
  );
}

export const Interactive: StoryObj<typeof SegmentedControl> = {
  render: () => <Segments />,
};

const LOCATIONS = [
  { value: 'fridge', label: 'Frigider', icon: <FridgeIcon size={18} /> },
  {
    value: 'freezer',
    label: 'Congel',
    accessibleLabel: 'Congelator',
    icon: <FreezerIcon size={18} />,
  },
  { value: 'cupboard', label: 'Dulap', icon: <CupboardIcon size={18} /> },
  {
    value: 'spices',
    label: 'Condim',
    accessibleLabel: 'Condimente',
    icon: <SpicesIcon size={18} />,
  },
] as const;

function DenseSegments() {
  const [value, setValue] =
    useState<(typeof LOCATIONS)[number]['value']>('fridge');
  return (
    // The narrowest phone: 320 px less the page padding.
    <Box sx={{ width: 280, p: 0 }} lang="ro">
      <SegmentedControl
        label="Locație"
        options={[...LOCATIONS]}
        value={value}
        onChange={setValue}
        fullWidth
        dense
      />
    </Box>
  );
}

/** `dense` with icons: the four Locations in Romanian, the longest labels, on a 320 px phone. */
export const Dense: StoryObj<typeof SegmentedControl> = {
  render: () => <DenseSegments />,
};
