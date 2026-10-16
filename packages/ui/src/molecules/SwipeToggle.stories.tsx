import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
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
  const [sweep, setSweep] = useState<{ on: boolean; id: number } | null>(null);
  return (
    <li>
      <SwipeToggle
        on={on}
        sweep={sweep}
        label={on ? 'Not low' : 'Running low'}
        onToggle={() => {
          setSweep({ on: !on, id: Date.now() });
          setOn((value) => !value);
        }}
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

function List({ children }: { children: ReactNode }) {
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

/** Buttons that flip the flag the way a swipe does: Play on sweep, then Play off wipe. */
function PlayRow() {
  const [on, setOn] = useState(false);
  const [sweep, setSweep] = useState<{ on: boolean; id: number } | null>(null);
  const play = (next: boolean) => {
    setSweep({ on: next, id: Date.now() });
    setOn(next);
  };
  return (
    <Box sx={{ maxWidth: 420, p: 2 }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <button type="button" disabled={on} onClick={() => play(true)}>
          Play on sweep
        </button>
        <button type="button" disabled={!on} onClick={() => play(false)}>
          Play off wipe
        </button>
        <button type="button" onClick={() => setOn((value) => !value)}>
          Snap flip
        </button>
      </Box>
      <SwipeToggle
        on={on}
        sweep={sweep}
        label={on ? 'Not low' : 'Running low'}
        onToggle={() => play(!on)}
      >
        <Box
          sx={{
            minHeight: 60,
            px: '16px',
            display: 'flex',
            alignItems: 'center',
            fontWeight: 600,
          }}
        >
          Milk
        </Box>
      </SwipeToggle>
    </Box>
  );
}

/** Needs a human look in all three Themes; the off wipe must never flash white in Dark-first. */
export const PlaySweepAndWipe: Story = { render: () => <PlayRow /> };
