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

type Location = 'fridge' | 'freezer' | 'cupboard' | 'spices';

const ICONS = {
  fridge: <FridgeIcon size={18} />,
  freezer: <FreezerIcon size={18} />,
  cupboard: <CupboardIcon size={18} />,
  spices: <SpicesIcon size={18} />,
};

const LABELS: Record<'en' | 'ro', Record<Location, string>> = {
  en: {
    fridge: 'Fridge',
    freezer: 'Freezer',
    cupboard: 'Cupboard',
    spices: 'Spices',
  },
  ro: {
    fridge: 'Frigider',
    freezer: 'Congelator',
    cupboard: 'Dulap',
    spices: 'Condimente',
  },
};

function DenseSegments({ lang }: { lang: 'en' | 'ro' }) {
  const [value, setValue] = useState<Location>('fridge');
  const labels = LABELS[lang];
  return (
    // The narrowest form on a 320 px phone: the Finish Shopping card, about 246 px.
    <Box sx={{ width: 246 }} lang={lang}>
      <SegmentedControl
        label={lang === 'ro' ? 'Locație' : 'Location'}
        options={(Object.keys(labels) as Location[]).map((location) => ({
          value: location,
          label: labels[location],
          icon: ICONS[location],
        }))}
        value={value}
        onChange={setValue}
        fullWidth
        dense
      />
    </Box>
  );
}

/** `dense` with icons: the four Locations at the narrowest width a 320 px phone gives them. */
export const Dense: StoryObj<typeof SegmentedControl> = {
  render: () => <DenseSegments lang="en" />,
};

/** The longest labels, Romanian: shrunk towards 11 px to fit whole, never shortened. */
export const DenseRomanian: StoryObj<typeof SegmentedControl> = {
  render: () => <DenseSegments lang="ro" />,
};
