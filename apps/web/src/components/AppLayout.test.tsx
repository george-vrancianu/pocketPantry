import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
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
});
