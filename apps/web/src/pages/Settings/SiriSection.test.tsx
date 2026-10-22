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
    'DELETE /api/assistant-tokens/t1': () => {
      rows = rows.filter((row) => row.id !== 't1');
      return Response.json({ id: 't1' });
    },
  });
  vi.stubGlobal('fetch', fetchMock);
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

    await screen.findByText('iPhone');
    // The setup steps are list items too; the token list comes first.
    const rows = within(screen.getAllByRole('list')[0]).getAllByRole(
      'listitem',
    );
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
    expect(await screen.findByRole('status')).toHaveTextContent('Token copied');

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
    const deleted = () =>
      calls.some((c) => c.key === 'DELETE /api/assistant-tokens/t1');
    expect(deleted()).toBe(false);

    const confirm = screen.getByRole('group', { name: /Revoke iPhone\?/ });
    await user.click(within(confirm).getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('iPhone')).toBeInTheDocument();
    expect(deleted()).toBe(false);

    await user.click(screen.getByRole('button', { name: 'Revoke iPhone' }));
    await user.click(
      within(screen.getByRole('group', { name: /Revoke iPhone\?/ })).getByRole(
        'button',
        { name: 'Revoke' },
      ),
    );

    expect(await screen.findByText('Token revoked')).toBeInTheDocument();
    expect(deleted()).toBe(true);
    expect(screen.queryByText('iPhone')).not.toBeInTheDocument();
    expect(screen.getByText('iPad')).toBeInTheDocument();
  });

  it('clears a failed create error once a revoke succeeds', async () => {
    const { fetchMock } = stubApi({
      'GET /api/assistant-tokens': () => Response.json([IPHONE]),
      'POST /api/assistant-tokens': () =>
        Response.json({ message: 'boom' }, { status: 500 }),
      'DELETE /api/assistant-tokens/t1': () => Response.json({ id: 't1' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderWithProviders(<SiriSection />);

    await user.type(await screen.findByLabelText('Token name'), 'Kitchen');
    await user.click(screen.getByRole('button', { name: 'Create token' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Revoke iPhone' }));
    await user.click(
      within(screen.getByRole('group', { name: /Revoke iPhone\?/ })).getByRole(
        'button',
        { name: 'Revoke' },
      ),
    );
    expect(await screen.findByText('Token revoked')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('still reveals the secret when a revoke is confirmed while the create is pending', async () => {
    let finishCreate: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      finishCreate = resolve;
    });
    const { fetchMock, calls } = stubApi({
      'GET /api/assistant-tokens': () => Response.json([IPHONE]),
      'POST /api/assistant-tokens': async () => {
        await gate;
        return Response.json(
          {
            id: 't3',
            name: 'Kitchen',
            prefix: 'pp_Wm2d',
            createdAt: '2030-03-10T12:00:00.000Z',
            lastUsedAt: null,
            secret: 'pp_Wm2dTHE-WHOLE-SECRET',
          },
          { status: 201 },
        );
      },
      'DELETE /api/assistant-tokens/t1': () => Response.json({ id: 't1' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderWithProviders(<SiriSection />);

    await user.type(await screen.findByLabelText('Token name'), 'Kitchen');
    await user.click(screen.getByRole('button', { name: 'Create token' }));
    await user.click(screen.getByRole('button', { name: 'Revoke iPhone' }));
    await user.click(
      within(screen.getByRole('group', { name: /Revoke iPhone\?/ })).getByRole(
        'button',
        { name: 'Revoke' },
      ),
    );
    expect(await screen.findByText('Token revoked')).toBeInTheDocument();
    expect(calls.some((c) => c.key === 'POST /api/assistant-tokens')).toBe(
      true,
    );

    finishCreate();
    expect(
      await screen.findByText('pp_Wm2dTHE-WHOLE-SECRET'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });

  describe('setup guide', () => {
    afterEach(() => vi.unstubAllEnvs());

    it('links to the Pantry add Shortcut in a new tab when its URL is configured', async () => {
      vi.stubEnv(
        'VITE_SIRI_SHORTCUT_URL',
        'https://www.icloud.com/shortcuts/abc',
      );
      stubTokens([]);
      renderWithProviders(<SiriSection />);

      const link = await screen.findByRole('link', {
        name: /Open the “Pantry add” Shortcut/,
      });
      expect(link).toHaveAttribute(
        'href',
        'https://www.icloud.com/shortcuts/abc',
      );
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('links to the Pantry check Shortcut in a new tab when its URL is configured', async () => {
      vi.stubEnv(
        'VITE_SIRI_CHECK_SHORTCUT_URL',
        'https://www.icloud.com/shortcuts/check',
      );
      stubTokens([]);
      renderWithProviders(<SiriSection />);

      const link = await screen.findByRole('link', {
        name: /Open the “Pantry check” Shortcut/,
      });
      expect(link).toHaveAttribute(
        'href',
        'https://www.icloud.com/shortcuts/check',
      );
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      // The Pantry add link stays hidden while its own variable is unset.
      expect(screen.getAllByRole('link')).toHaveLength(1);
    });

    it.each(['unset', 'empty'])(
      'hides the Pantry check link when its URL is %s',
      async (kind) => {
        vi.stubEnv(
          'VITE_SIRI_SHORTCUT_URL',
          'https://www.icloud.com/shortcuts/abc',
        );
        vi.stubEnv(
          'VITE_SIRI_CHECK_SHORTCUT_URL',
          kind === 'empty' ? '' : undefined,
        );
        stubTokens([]);
        renderWithProviders(<SiriSection />);

        await screen.findByText('No tokens yet.');
        expect(
          screen.queryByRole('link', { name: /Pantry check/ }),
        ).not.toBeInTheDocument();
        expect(
          screen.getByRole('link', { name: /Pantry add/ }),
        ).toBeInTheDocument();
      },
    );

    it.each([
      [
        'en',
        /read your Pantry and Shopping List/,
        /“Pantry add” answers questions too/,
      ],
      ['ro', /poate citi Cămara/, /Și „Pantry add” răspunde la întrebări/],
      ['da', /læse dit spisekammer/, /“Pantry add” svarer også på spørgsmål/],
    ] as const)(
      'says in %s what a token can read, and that Pantry add answers questions, with no Pantry check link',
      async (locale, hint, note) => {
        vi.stubEnv('VITE_SIRI_CHECK_SHORTCUT_URL', undefined);
        stubTokens([]);
        renderWithProviders(<SiriSection />, { locale });
        expect(await screen.findByText(hint)).toBeInTheDocument();
        expect(screen.getByText(note)).toBeInTheDocument();
      },
    );

    it.each(['unset', 'empty'])(
      'hides the Shortcut link when the URL is %s',
      async (kind) => {
        vi.stubEnv('VITE_SIRI_SHORTCUT_URL', kind === 'empty' ? '' : undefined);
        stubTokens([]);
        renderWithProviders(<SiriSection />);

        await screen.findByText('No tokens yet.');
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(
          4,
        );
      },
    );

    it.each([
      ['en', /Hey Siri, Pantry add/, /always English/],
      ['ro', /Hey Siri, Pantry add/, /mereu în engleză/],
      ['da', /Hey Siri, Pantry add/, /altid på engelsk/],
    ] as const)(
      'shows the setup steps and the language note in %s',
      async (locale, phrase, note) => {
        stubTokens([]);
        renderWithProviders(<SiriSection />, { locale });

        const steps = await screen.findByRole('list', { name: /.+/ });
        expect(within(steps).getAllByRole('listitem')).toHaveLength(4);
        expect(within(steps).getByText(phrase)).toBeInTheDocument();
        expect(screen.getByText(note)).toBeInTheDocument();
      },
    );
  });
});
