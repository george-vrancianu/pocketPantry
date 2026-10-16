import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from '../atoms/Layout';
import { SwipeToggle } from './SwipeToggle';

const meta: Meta<typeof SwipeToggle> = {
  title: 'Molecules/SwipeToggle',
  component: SwipeToggle,
};
export default meta;
type Story = StoryObj<typeof SwipeToggle>;

function Row({ on }: { on: boolean }) {
  return (
    <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 2, maxWidth: 420 }}>
      <li>
        <SwipeToggle
          on={on}
          label={on ? 'Not low' : 'Running low'}
          onToggle={() => {}}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: '14px 16px',
            }}
          >
            <span>Milk</span>
            <span>Expires tomorrow</span>
          </Box>
        </SwipeToggle>
      </li>
    </Box>
  );
}

export const RunningLowOff: Story = { render: () => <Row on={false} /> };
export const RunningLowOn: Story = { render: () => <Row on /> };
