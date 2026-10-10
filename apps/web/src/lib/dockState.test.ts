import { describe, expect, it } from 'vitest';
import { dockStateFor } from './dockState';

describe('dockStateFor', () => {
  it.each(['/shopping', '/pantry', '/recipes'])(
    'highlights %s in the dock',
    (path) => {
      expect(dockStateFor(path)).toEqual({
        visible: true,
        activeKey: path.slice(1),
      });
    },
  );

  it('highlights nested routes under their section', () => {
    expect(dockStateFor('/pantry/abc').activeKey).toBe('pantry');
  });

  it('hides the dock on the scan screen, where the camera is full screen', () => {
    expect(dockStateFor('/scan').visible).toBe(false);
  });

  it('hides the dock on the Review screen, where the action bar takes its place', () => {
    expect(dockStateFor('/scan/review').visible).toBe(false);
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
