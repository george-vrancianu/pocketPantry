import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import { Gator, type GatorLoop } from './Gator';
import { GATOR_GEOMETRY, type AnimatedGatorMood } from './gatorGeometry';

const MOODS = Object.keys(GATOR_GEOMETRY) as AnimatedGatorMood[];

const meta: Meta<typeof Gator> = {
  title: 'Atoms/Gator',
  component: Gator,
  args: { mood: 'happy', size: 160, alt: 'Gator, happy' },
  decorators: [
    (Story) => (
      <Box sx={{ p: 6 }}>
        <Story />
      </Box>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Gator>;

export const Single: Story = {};

export const Signature: Story = { args: { loop: 'signature' } };

export const WithoutEntrance: Story = { args: { entrance: false } };

function Grid({ loop, entrance }: { loop: GatorLoop; entrance: boolean }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 4,
      }}
    >
      {MOODS.map((mood) => (
        <Box key={mood} sx={{ textAlign: 'center' }}>
          <Box sx={{ display: 'inline-block' }}>
            <Gator
              mood={mood}
              size={140}
              loop={loop}
              entrance={entrance}
              decorative
            />
          </Box>
          <Typography variant="caption" sx={{ display: 'block' }}>
            {mood}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

/** Every mood on its idle loop, after the Entrance. */
export const AllMoodsIdle: Story = {
  render: () => <Grid loop="idle" entrance />,
};

/** Every mood on its signature loop, after the Entrance. */
export const AllMoodsSignature: Story = {
  render: () => <Grid loop="signature" entrance />,
};

/** Every mood idling, starting straight on the loop. */
export const AllMoodsIdleWithoutEntrance: Story = {
  render: () => <Grid loop="idle" entrance={false} />,
};

/** Every mood on signature, starting straight on the loop. */
export const AllMoodsSignatureWithoutEntrance: Story = {
  render: () => <Grid loop="signature" entrance={false} />,
};

/** Switch loop or mood while mounted: no Entrance replays, and no blank gap. */
export const Switching: Story = {
  render: () => {
    const [loop, setLoop] = useState<GatorLoop>('idle');
    const [mood, setMood] = useState<AnimatedGatorMood>('shopping-buddy');
    return (
      <Box>
        <Box
          component="button"
          onClick={() => setLoop(loop === 'idle' ? 'signature' : 'idle')}
        >
          loop: {loop}
        </Box>{' '}
        <Box
          component="button"
          onClick={() =>
            setMood(MOODS[(MOODS.indexOf(mood) + 1) % MOODS.length]!)
          }
        >
          mood: {mood}
        </Box>
        <Box sx={{ mt: 4 }}>
          <Gator mood={mood} size={200} loop={loop} decorative />
        </Box>
      </Box>
    );
  },
};
