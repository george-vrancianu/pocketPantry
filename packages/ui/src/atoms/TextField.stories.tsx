import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import { FieldUnit } from './FieldUnit';
import { InputAdornment } from './InputAdornment';
import { SearchIcon } from './icons';
import { TextField } from './TextField';

const meta: Meta<typeof TextField> = {
  title: 'Atoms/Field',
  component: TextField,
};
export default meta;

/** Click a field for the accent border and tint ring. */
export const Fields: StoryObj<typeof TextField> = {
  render: () => (
    <Box sx={{ p: 3, display: 'grid', gap: 2, maxWidth: 420 }}>
      <TextField
        placeholder="Search ingredients"
        slotProps={{
          htmlInput: { 'aria-label': 'Search ingredients' },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon size={20} />
              </InputAdornment>
            ),
          },
        }}
      />
      <TextField label="Name" />
      <TextField
        label="Amount"
        defaultValue="1"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <FieldUnit aria-label="Unit: kg">kg</FieldUnit>
              </InputAdornment>
            ),
          },
        }}
      />
      <TextField label="With an error" error helperText="Required" />
    </Box>
  ),
};
