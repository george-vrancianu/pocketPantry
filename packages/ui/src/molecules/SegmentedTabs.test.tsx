import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { renderWithTheme } from '../test/render';
import { SegmentedTabs } from './SegmentedTabs';

describe('SegmentedTabs', () => {
  afterEach(cleanup);

  it('uses `accessibleName` as the tab name in place of label and badge', () => {
    renderWithTheme(
      <SegmentedTabs
        label="Sections"
        id="t"
        value="a"
        onChange={() => {}}
        tabs={[
          {
            value: 'a',
            label: 'Ingredients',
            badge: '6',
            accessibleName: 'Ingredients, 6',
          },
          { value: 'b', label: 'Steps' },
        ]}
      />,
    );
    expect(screen.getByRole('tab', { name: 'Ingredients, 6' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Steps' })).toBeTruthy();
  });
});
