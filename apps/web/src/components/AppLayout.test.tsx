import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { paintedColour } from '@pocket-pantry/ui/test/colour';
import { renderWithProviders } from '../test/render';
import { AppLayout } from './AppLayout';

function renderAt(route: string) {
  renderWithProviders(
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/scan" element={<p>camera</p>} />
        <Route path="/pantry" element={<p>pantry</p>} />
      </Route>
    </Routes>,
    { route },
  );
}

afterEach(() => {
  document.documentElement.removeAttribute('data-theme');
});

describe('AppLayout Dock', () => {
  it('renders no Dock navigation or links behind the camera on /scan', () => {
    renderAt('/scan');
    expect(screen.getByText('camera')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('still renders the Dock on other screens', () => {
    renderAt('/pantry');
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('paints the dock and its tabs from the active Theme', () => {
    localStorage.setItem(
      'pp.appearance',
      JSON.stringify({ theme: 'dark', matchSystem: false }),
    );
    renderAt('/pantry');
    const dock = screen.getByRole('navigation');
    expect(paintedColour(dock, 'background-color')).toBe('RGBA(25,33,28,.9)');

    const active = screen.getByRole('link', { current: 'page' });
    expect(paintedColour(active, 'background-color')).toBe('#1F3A2A');
    expect(paintedColour(active, 'color')).toBe('#A9EDBD');

    const inactive = screen.getByRole('link', { name: /shopping/i });
    expect(paintedColour(inactive, 'background-color')).toBe(
      'RGBA(0, 0, 0, 0)',
    );
    expect(paintedColour(inactive, 'color')).toBe('#97A69B');
  });
});
