import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import { useState } from 'react';
import { Toggle } from './Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Atoms/Toggle',
  component: Toggle,
};
export default meta;

function Toggles() {
  const [on, setOn] = useState(true);
  return (
    <Box sx={{ p: 3, display: 'flex', gap: 2 }}>
      <Toggle aria-label="Match system" checked={on} onChange={setOn} />
      <Toggle
        aria-label="Disabled"
        checked={false}
        disabled
        onChange={() => undefined}
      />
    </Box>
  );
}

/** Press it, or Tab to it for the focus ring. */
export const Interactive: StoryObj<typeof Toggle> = {
  render: () => <Toggles />,
};
