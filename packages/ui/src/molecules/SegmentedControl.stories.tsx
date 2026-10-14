import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import { useState } from 'react';
import { SegmentedControl } from './SegmentedControl';

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
