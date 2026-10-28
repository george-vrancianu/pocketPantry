import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import { TagChip } from './TagChip';

const meta: Meta<typeof TagChip> = {
  title: 'Atoms/TagChip',
  component: TagChip,
};
export default meta;

export const Kinds: StoryObj<typeof TagChip> = {
  render: () => (
    <Box sx={{ p: 3, display: 'grid', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        <TagChip kind="family">Meal prep</TagChip>
        <TagChip kind="catalog">Dinner</TagChip>
        <TagChip kind="catalog" matched>
          Keto
        </TagChip>
      </Box>
      <Box sx={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <TagChip kind="family" size="medium">
          Meal prep
        </TagChip>
        <TagChip kind="catalog" size="medium">
          Dinner
        </TagChip>
      </Box>
    </Box>
  ),
};
