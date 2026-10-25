import type { Meta, StoryObj } from '@storybook/react-vite';
import { CustomiseIcon, SettingsIcon } from '../atoms/icons';
import { IconButton } from '../atoms/IconButton';
import { GatorLogo } from '../gator/GatorLogo';
import { RefreshStatusLine } from './RefreshStatusLine';
import { DashboardHeader } from './DashboardHeader';

const labels = {
  busy: 'Refreshing…',
  done: 'Updated just now',
  failed: "Couldn't refresh · showing what you had",
};

const meta: Meta<typeof DashboardHeader> = {
  title: 'Molecules/DashboardHeader',
  component: DashboardHeader,
  args: {
    greeting: 'Good evening',
    leading: <GatorLogo label="Refresh" size={42} onClick={() => {}} />,
    actions: (
      <>
        <IconButton label="Customise" href="#">
          <CustomiseIcon size={20} />
        </IconButton>
        <IconButton label="Settings" href="#">
          <SettingsIcon size={20} />
        </IconButton>
      </>
    ),
    subline: (
      <RefreshStatusLine
        state="idle"
        labels={labels}
        rest="Sunday, 25 October"
      />
    ),
  },
};
export default meta;

type Story = StoryObj<typeof DashboardHeader>;

/** At rest the line under the greeting is today's date. Switch the Theme in the toolbar. */
export const AtRest: Story = {};

export const Busy: Story = {
  args: {
    subline: (
      <RefreshStatusLine
        state="busy"
        labels={labels}
        rest="Sunday, 25 October"
      />
    ),
  },
};

export const Done: Story = {
  args: {
    subline: (
      <RefreshStatusLine
        state="done"
        labels={labels}
        rest="Sunday, 25 October"
      />
    ),
  },
};

export const Failed: Story = {
  args: {
    subline: (
      <RefreshStatusLine
        state="failed"
        labels={labels}
        rest="Sunday, 25 October"
      />
    ),
  },
};

/** A long greeting ends in an ellipsis and keeps the buttons in place. */
export const LongGreeting: Story = {
  args: {
    greeting:
      'Good evening and welcome back to your pantry, what is for dinner',
  },
};
