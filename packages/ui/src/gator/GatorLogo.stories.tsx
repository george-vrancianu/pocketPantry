import type { Meta, StoryObj } from '@storybook/react-vite';
import Box from '@mui/material/Box';
import { useState } from 'react';
import { PlusIcon } from '../atoms/icons';
import { RefreshStatusLine } from '../molecules/RefreshStatusLine';
import { ScreenHeader } from '../molecules/ScreenHeader';
import { GatorLogo } from './GatorLogo';

const meta: Meta<typeof GatorLogo> = {
  title: 'Atoms/GatorLogo',
  component: GatorLogo,
  args: { label: 'Refresh', size: 38 },
};
export default meta;

type Story = StoryObj<typeof GatorLogo>;

/** Switch the Theme in the toolbar: on Dark the head has a light rim and no shadow. */
export const Mark: Story = {};

export const Dashboard42: Story = { args: { size: 42 } };

type Status = 'idle' | 'busy' | 'done' | 'failed';

const LABELS = {
  busy: 'Refreshing…',
  done: 'Updated just now',
  failed: "Couldn't refresh · showing what you had",
};

function TabRootHeader({ status }: { status: Status }) {
  const [taps, setTaps] = useState(0);
  return (
    <Box sx={{ maxWidth: 390, p: 2 }} data-taps={taps}>
      <ScreenHeader
        title="Pantry"
        leading={
          <GatorLogo label="Refresh" onClick={() => setTaps((n) => n + 1)} />
        }
        subline={<RefreshStatusLine state={status} labels={LABELS} />}
        action={{ label: 'Add', icon: <PlusIcon size={20} /> }}
      />
      <Box
        sx={{
          opacity: status === 'busy' ? 0.55 : 1,
          transition: 'opacity 250ms',
        }}
      >
        Milk, eggs, flour
      </Box>
    </Box>
  );
}

/** A tab-root header at rest, busy, done and failed; switch the Theme in the toolbar. */
export const HeaderRest: Story = {
  render: () => <TabRootHeader status="idle" />,
};
export const HeaderBusy: Story = {
  render: () => <TabRootHeader status="busy" />,
};
export const HeaderDone: Story = {
  render: () => <TabRootHeader status="done" />,
};
export const HeaderFailed: Story = {
  render: () => <TabRootHeader status="failed" />,
};
