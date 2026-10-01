import type { Preview } from '@storybook/react-vite';
import { PocketPantryUiProvider } from '../src';

const preview: Preview = {
  decorators: [
    (Story) => (
      <PocketPantryUiProvider>
        <Story />
      </PocketPantryUiProvider>
    ),
  ],
  parameters: { layout: 'fullscreen' },
};

export default preview;
