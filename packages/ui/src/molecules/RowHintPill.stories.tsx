import type { Meta, StoryObj } from '@storybook/react-vite';
import { RowHintPill } from './RowHintPill';

const meta: Meta<typeof RowHintPill> = {
  title: 'Molecules/RowHintPill',
  component: RowHintPill,
  args: { visible: true, children: 'Swipe left to remove · hold to edit' },
};
export default meta;

export const Shown: StoryObj<typeof RowHintPill> = {};

/** Toggle `visible` in the controls to see the 250 ms fade. */
export const Closed: StoryObj<typeof RowHintPill> = {
  args: { visible: false },
};
