import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { PantryPage } from '../pages/Pantry/PantryPage';
import { renderWithProviders, stubApi } from './render';

/** Stubs the Pantry's API (and the Scan reads) for the add-Batch camera tests; returns the recorded calls. */
export function stubPantry() {
  const { fetchMock, calls } = stubApi({
    'GET /api/pantry': () => Response.json({ batches: [], runningLow: [] }),
    'GET /api/staples': () => Response.json({ staples: [] }),
    'GET /api/settings/family': () =>
      Response.json({ staleThresholdDays: 3, expiryOverrides: [] }),
    'GET /api/catalog/search': () => Response.json({ results: [] }),
    'GET /api/pantry/recently-stocked': () =>
      Response.json({ ingredients: [] }),
    'POST /api/scan/product': () => Response.json({ lines: [] }),
    'GET /api/barcode-lookup/3017620422003': () =>
      Response.json({ found: false }, { status: 404 }),
  });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
}

/** Opens the add-Batch camera overlay from the Pantry in `mode`; returns the user. */
export async function openOverlay(mode: 'product' | 'barcode') {
  localStorage.setItem('pocket-pantry.camera-overlay-mode', mode);
  const user = userEvent.setup();
  renderWithProviders(<PantryPage />);
  await user.click(await screen.findByRole('button', { name: 'Add batch' }));
  await user.click(
    screen.getByRole('button', {
      name: mode === 'product' ? 'Take a photo' : 'Scan barcode',
    }),
  );
  return user;
}
