import { describe, expect, it } from 'vitest';
import { dockStateFor } from './dockState';

describe('dockStateFor', () => {
  it.each(['/shopping', '/pantry', '/recipes'])(
    'highlights %s in the light dock',
    (path) => {
      expect(dockStateFor(path)).toEqual({
        visible: true,
        variant: 'light',
        activeKey: path.slice(1),
      });
    },
  );

  it('highlights nested routes under their section', () => {
    expect(dockStateFor('/pantry/abc').activeKey).toBe('pantry');
  });

  it('uses the dark dock on the scan screen', () => {
    expect(dockStateFor('/scan')).toEqual({
      visible: true,
      variant: 'dark',
      activeKey: 'scan',
    });
  });

  it('shows the dock with nothing active on the dashboard and other screens', () => {
    expect(dockStateFor('/')).toMatchObject({
      visible: true,
      activeKey: undefined,
    });
    expect(dockStateFor('/settings')).toMatchObject({
      visible: true,
      activeKey: undefined,
    });
  });

  it('hides the dock while customising the dashboard', () => {
    expect(dockStateFor('/customise').visible).toBe(false);
  });
});
