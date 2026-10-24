import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlusIcon } from '../atoms/icons';
import { ScreenHeader } from './ScreenHeader';

const meta: Meta<typeof ScreenHeader> = {
  title: 'Molecules/ScreenHeader',
  component: ScreenHeader,
  args: { title: 'Pantry' },
};
export default meta;

export const Default: StoryObj<typeof ScreenHeader> = {};

/** The screen's add action, the only button in the header. */
export const WithAction: StoryObj<typeof ScreenHeader> = {
  args: { action: { label: 'Add', icon: <PlusIcon size={20} />, href: '#' } },
};

/** An add action with more than one way to add opens a menu. */
export const WithActionMenu: StoryObj<typeof ScreenHeader> = {
  args: {
    title: 'Recipes',
    action: {
      label: 'Add',
      icon: <PlusIcon size={20} />,
      items: [
        { label: 'New recipe', href: '#' },
        { label: 'From a link', href: '#' },
      ],
    },
  },
};

/** Screens without the Dock keep a Home button. */
export const WithHome: StoryObj<typeof ScreenHeader> = {
  args: { title: 'Customise', home: { label: 'Home' } },
};
