import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { linkReads } from '../../lib/linkReads';
import { renderWithProviders } from '../../test/render';
import { BackgroundHost } from './BackgroundHost';

afterEach(() => {
  vi.unstubAllGlobals();
});

const holdARead = () => {
  vi.stubGlobal('fetch', () => new Promise<Response>(() => {}));
  linkReads.submit({ kind: 'link', url: 'https://example.com/soup' }, 'source');
};

describe('BackgroundHost link reads', () => {
  it('leaves link reads to a host that asks for them (the Intro hosts Voice Notes only)', () => {
    holdARead();
    renderWithProviders(<BackgroundHost />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByText(/recipe link/i)).not.toBeInTheDocument();
  });

  it('shows them when the host asks', () => {
    holdARead();
    renderWithProviders(<BackgroundHost linkReads />);
    expect(screen.getByText(/Reading a recipe link/)).toBeInTheDocument();
  });
});
