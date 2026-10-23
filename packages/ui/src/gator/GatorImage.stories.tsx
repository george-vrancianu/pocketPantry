import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box, Typography } from '@mui/material';
import { GATOR_MOODS, GatorImage } from './GatorImage';

const meta: Meta<typeof GatorImage> = {
  title: 'Atoms/GatorImage',
  component: GatorImage,
  args: { mood: 'happy', size: 160 },
  decorators: [
    (Story) => (
      <Box sx={{ p: 3 }}>
        <Story />
      </Box>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof GatorImage>;

export const Single: Story = {};

/** Every mood with its name. */
export const AllMoods: Story = {
  render: () => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 3,
      }}
    >
      {GATOR_MOODS.map((mood) => (
        <Box key={mood} sx={{ textAlign: 'center' }}>
          <GatorImage mood={mood} size={140} />
          <Typography variant="caption">{mood}</Typography>
        </Box>
      ))}
    </Box>
  ),
};

/** Empty alt, hidden from assistive tech. */
export const Decorative: Story = { args: { decorative: true } };

/**
 * The gleaming tooth plays once when the image appears. With the system's
 * reduced-motion setting on, it never shows; reload to replay it.
 */
export const DapperGlint: Story = {
  args: { mood: 'health-dapper', size: 320 },
};
