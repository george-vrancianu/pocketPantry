import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../../test/render';
import { SessionStrip } from './SessionStrip';

describe('SessionStrip', () => {
  it('renders no image for a barcode card whose frame could not be prepared', () => {
    renderWithProviders(
      <SessionStrip
        scans={[
          {
            id: 'a',
            mode: 'barcode',
            code: '5941234567899',
            thumbnail: '',
            status: 'read',
          } as never,
        ]}
        onRetry={() => {}}
      />,
    );
    const card = screen.getByTestId('scan-thumbnail');
    expect(card.querySelector('img')).toBeNull();
    expect(card).toHaveAttribute('data-mode', 'barcode');
  });

  it.each([
    ['barcode', 'Barcode Lookup failed'],
    ['product', 'Could not read photo'],
  ])('labels a failed %s card as "%s"', (mode, label) => {
    renderWithProviders(
      <SessionStrip
        scans={[
          {
            id: 'a',
            mode,
            code: mode === 'barcode' ? '5941234567899' : undefined,
            thumbnail: '',
            status: 'failed',
            failure: 'error',
          } as never,
        ]}
        onRetry={() => {}}
      />,
    );
    expect(screen.getByTestId('scan-thumbnail')).toHaveAttribute(
      'aria-label',
      label,
    );
  });
});
