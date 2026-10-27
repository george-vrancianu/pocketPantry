import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  LinkReadingArt,
  PhotoReadingArt,
  ReceiptReadingArt,
} from './ReadingArt';

const meta: Meta<typeof LinkReadingArt> = {
  title: 'Atoms/ReadingArt',
  args: { size: 44 },
  argTypes: { size: { control: { type: 'number', min: 24, max: 160 } } },
};
export default meta;

type Story = StoryObj<typeof LinkReadingArt>;

/** A recipe link landing in the open book. Switch the Theme in the toolbar. */
export const Link: Story = { render: (args) => <LinkReadingArt {...args} /> };

/** A receipt read line by line. */
export const Receipt: Story = {
  render: (args) => <ReceiptReadingArt {...args} />,
};

/** Ingredients found in a photo. */
export const Photo: Story = {
  render: (args) => <PhotoReadingArt {...args} />,
};
