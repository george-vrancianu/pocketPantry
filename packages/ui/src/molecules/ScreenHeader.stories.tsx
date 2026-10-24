import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlusIcon } from '../atoms/icons';
import { ScreenHeader } from './ScreenHeader';

const meta: Meta<typeof ScreenHeader> = {
  title: 'Molecules/ScreenHeader',
  component: ScreenHeader,
  args: {
    title: 'Pantry',
    homeLabel: 'Home',
    settings: { label: 'Settings', href: '/settings' },
  },
};
export default meta;

export const Default: StoryObj<typeof ScreenHeader> = {};

/** The gear stays rightmost; the page's action sits just left of it. */
export const WithAction: StoryObj<typeof ScreenHeader> = {
  args: { action: { label: 'Add', icon: <PlusIcon size={20} />, href: '#' } },
};

/** On Settings itself the gear is left out. */
export const WithoutSettings: StoryObj<typeof ScreenHeader> = {
  args: { title: 'Settings', settings: undefined },
};
