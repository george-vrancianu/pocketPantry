import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import { useState } from 'react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
};
export default meta;

function Checkboxes() {
  const [checked, setChecked] = useState(true);
  return (
    <Box sx={{ p: 3, display: 'grid', gap: 1 }}>
      <Checkbox
        label="Staple"
        helperText="Kept on the list after shopping"
        checked={checked}
        onChange={(event) => setChecked(event.target.checked)}
      />
      <Checkbox label="Unchecked" checked={false} onChange={() => undefined} />
      <Checkbox label="Disabled" checked disabled onChange={() => undefined} />
    </Box>
  );
}

export const Interactive: StoryObj<typeof Checkbox> = {
  render: () => <Checkboxes />,
};
