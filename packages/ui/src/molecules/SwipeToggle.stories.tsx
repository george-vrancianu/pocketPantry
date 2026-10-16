import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Box } from '../atoms/Layout';
import { tokens } from '../theme/tokens';
import { SwipeToggle } from './SwipeToggle';

const meta: Meta<typeof SwipeToggle> = {
  title: 'Molecules/SwipeToggle',
  component: SwipeToggle,
};
export default meta;
type Story = StoryObj<typeof SwipeToggle>;

function ExpiryTag({ urgent }: { urgent?: boolean }) {
  return (
    <Box
      component="span"
      sx={{
        px: '8px',
        py: '2px',
        borderRadius: '999px',
        fontSize: 12,
        fontWeight: 600,
        bgcolor: urgent ? tokens.color.urgentBg : tokens.color.soonBg,
        color: urgent ? tokens.color.urgentFg : tokens.color.soonFg,
      }}
    >
      {urgent ? 'Expires today' : 'Expires in 2 days'}
    </Box>
  );
}

/** A row that flips its own `on` when swiped to the zone. */
function Row({
  name,
  initialOn,
  urgent,
}: {
  name: string;
  initialOn: boolean;
  urgent?: boolean;
}) {
  const [on, setOn] = useState(initialOn);
  return (
    <li>
      <SwipeToggle
        on={on}
        label={on ? 'Not low' : 'Running low'}
        onToggle={() => setOn((value) => !value)}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
            minHeight: 60,
            px: '16px',
          }}
        >
          <Box>
            <Box sx={{ fontWeight: 600 }}>{name}</Box>
            {on ? (
              <Box sx={{ fontSize: 12, color: tokens.color.butterInk }}>
                Running low
              </Box>
            ) : null}
          </Box>
          <ExpiryTag urgent={urgent} />
        </Box>
      </SwipeToggle>
    </li>
  );
}

function List({ children }: { children: React.ReactNode }) {
  return (
    <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 2, maxWidth: 420 }}>
      {children}
    </Box>
  );
}

export const RunningLowOff: Story = {
  render: () => (
    <List>
      <Row name="Milk" initialOn={false} />
    </List>
  ),
};
export const RunningLowOn: Story = {
  render: () => (
    <List>
      <Row name="Milk" initialOn />
    </List>
  ),
};
export const OffAndOnStacked: Story = {
  render: () => (
    <List>
      <Row name="Milk" initialOn={false} />
      <Row name="Eggs" initialOn />
      <Row name="Spinach" initialOn urgent />
      <Row name="Yoghurt" initialOn={false} urgent />
    </List>
  ),
};
