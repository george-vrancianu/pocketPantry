import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, stubApi } from '../../test/render';
import { SiriSection } from './components/SiriSection';

type Row = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
};

const IPHONE: Row = {
  id: 't1',
  name: 'iPhone',
  prefix: 'pp_aB3x',
  createdAt: '2030-03-05T12:00:00.000Z',
  lastUsedAt: '2030-03-09T12:00:00.000Z',
};
const IPAD: Row = {
  id: 't2',
  name: 'iPad',
  prefix: 'pp_Zq9k',
  createdAt: '2030-03-06T12:00:00.000Z',
  lastUsedAt: null,
};

function stubTokens(initial: Row[]) {
  let rows = initial;
  const { fetchMock, calls } = stubApi({
    'GET /api/assistant-tokens': () => Response.json(rows),
    'POST /api/assistant-tokens': () => {
      const created: Row = {
        id: 't3',
        name: 'Kitchen',
        prefix: 'pp_Wm2d',
        createdAt: '2030-03-10T12:00:00.000Z',
        lastUsedAt: null,
      };
      rows = [...rows, created];
      return Response.json(
        { ...created, secret: 'pp_Wm2dTHE-WHOLE-SECRET' },
        { status: 201 },
      );
    },
  });
  const wrapped = (input: RequestInfo | URL, init?: RequestInit) => {
    const match = /\/api\/assistant-tokens\/(.+)$/.exec(String(input));
    if (init?.method === 'DELETE' && match) {
      rows = rows.filter((row) => row.id !== match[1]);
      return Promise.resolve(Response.json({ id: match[1] }));
    }
    return fetchMock(input, init);
  };
  vi.stubGlobal('fetch', wrapped);
  return calls;
}

describe('Settings Siri section', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('lists each token with its name, prefix, created and last used dates', async () => {
    stubTokens([IPHONE, IPAD]);
    renderWithProviders(<SiriSection />);

    const rows = await screen.findAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText('iPhone')).toBeInTheDocument();
    expect(within(rows[0]).getByText('pp_aB3x…')).toBeInTheDocument();
    expect(
      within(rows[0]).getByText(/Created 05\.03\.2030/),
    ).toBeInTheDocument();
    expect(
      within(rows[0]).getByText(/Last used 09\.03\.2030/),
    ).toBeInTheDocument();
    expect(within(rows[1]).getByText(/Never used/)).toBeInTheDocument();
  });

  it('shows the secret once after creating, with Copy, and forgets it when closed', async () => {
    const calls = stubTokens([]);
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined);
    renderWithProviders(<SiriSection />);

    await user.type(await screen.findByLabelText('Token name'), '  Kitchen ');
    await user.click(screen.getByRole('button', { name: 'Create token' }));

    expect(
      await screen.findByText('pp_Wm2dTHE-WHOLE-SECRET'),
    ).toBeInTheDocument();
    expect(
      calls.find((c) => c.key === 'POST /api/assistant-tokens')?.body,
    ).toEqual({
      name: 'Kitchen',
    });
    await user.click(screen.getByRole('button', { name: 'Copy' }));
    expect(writeText).toHaveBeenCalledWith('pp_Wm2dTHE-WHOLE-SECRET');
    expect(await screen.findByText('Token copied')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Done/ }));
    expect(
      screen.queryByText('pp_Wm2dTHE-WHOLE-SECRET'),
    ).not.toBeInTheDocument();
    // The list only ever has the prefix.
    expect(await screen.findByText('pp_Wm2d…')).toBeInTheDocument();
    expect(screen.queryByText(/THE-WHOLE-SECRET/)).not.toBeInTheDocument();
  });

  it('asks for confirmation before revoking, and removes the row once confirmed', async () => {
    const calls = stubTokens([IPHONE, IPAD]);
    const user = userEvent.setup();
    renderWithProviders(<SiriSection />);

    await user.click(
      await screen.findByRole('button', { name: 'Revoke iPhone' }),
    );
    expect(calls.some((c) => c.key.startsWith('DELETE'))).toBe(false);

    const confirm = screen.getByRole('group', { name: /Revoke iPhone\?/ });
    await user.click(within(confirm).getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('iPhone')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Revoke iPhone' }));
    await user.click(
      within(screen.getByRole('group', { name: /Revoke iPhone\?/ })).getByRole(
        'button',
        { name: 'Revoke' },
      ),
    );

    expect(await screen.findByText('Token revoked')).toBeInTheDocument();
    expect(screen.queryByText('iPhone')).not.toBeInTheDocument();
    expect(screen.getByText('iPad')).toBeInTheDocument();
  });
});
