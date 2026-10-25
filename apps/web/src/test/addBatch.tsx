import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { PantryPage } from '../pages/Pantry/PantryPage';
import { renderWithProviders, stubApi } from './render';

/** Stubs the Pantry's API (and the Scan reads) for the add-Batch camera tests; returns the recorded calls. */
export function stubPantry(
  extra: Record<string, () => Response | Promise<Response>> = {},
) {
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
    ...extra,
  });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
}

/** Opens the add-Batch camera overlay from the Pantry in `mode`; returns the user. */
export async function openOverlay(mode: 'product' | 'barcode') {
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

/** Clears the picked Ingredient (the token's ×), as a Member does before using the camera. */
export async function clearPick(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Change ingredient' }));
}

/** Types a note, unfolding it first when it is folded. */
export async function typeNote(
  user: ReturnType<typeof userEvent.setup>,
  text: string,
) {
  const fold = screen.queryByRole('button', { name: /Add a note/ });
  if (fold) await user.click(fold);
  await user.type(screen.getByLabelText('Note · optional'), text);
}
