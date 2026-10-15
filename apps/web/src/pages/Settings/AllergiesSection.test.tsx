import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, stubApi } from '../../test/render';
import { stubSystemScheme } from '../../test/viewport';
import { SettingsPage } from './SettingsPage';

const ALLERGENS = [
  { id: 'a-gluten', name: 'Gluten' },
  { id: 'a-milk', name: 'Milk' },
  { id: 'a-peanuts', name: 'Peanuts' },
];

function stubAllergies(initial: string[], saveOk = true, gate?: Promise<void>) {
  let current = initial;
  const { fetchMock, calls } = stubApi({
    'GET /api/auth/get-session': () =>
      Response.json({
        user: { id: 'u1', name: 'Ana', email: 'a@x.io', role: 'member' },
      }),
    'GET /api/settings/preferences': () =>
      Response.json({ locale: null, theme: null }),
    'GET /api/settings/allergies': () =>
      Response.json({ allergens: ALLERGENS, allergenIds: current }),
    'PUT /api/settings/allergies': async () => {
      await gate;
      if (!saveOk)
        return Response.json(
          { code: 'server_error', params: {} },
          { status: 500 },
        );
      return Response.json({ allergens: ALLERGENS, allergenIds: current });
    },
  });
  const wrapped = (input: RequestInfo | URL, init?: RequestInit) => {
    if (init?.method === 'PUT' && String(input).includes('/allergies')) {
      current = (JSON.parse(String(init.body)) as { allergenIds: string[] })
        .allergenIds;
    }
    return fetchMock(input, init);
  };
  vi.stubGlobal('fetch', wrapped);
  return calls;
}

describe('Settings You tab: Allergies', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.removeAttribute('data-theme');
  });

  const open = async () => {
    stubSystemScheme(false);
    renderWithProviders(<SettingsPage />, { route: '/settings' });
    return within(await screen.findByRole('region', { name: 'Allergies' }));
  };

  it('lists the Allergens with the Member own Allergies pressed', async () => {
    stubAllergies(['a-milk']);
    const section = await open();
    expect(
      await section.findByRole('button', { name: 'Milk', pressed: true }),
    ).toBeInTheDocument();
    expect(
      section.getByRole('button', { name: 'Gluten', pressed: false }),
    ).toBeInTheDocument();
    expect(
      section.getByRole('button', { name: 'Peanuts', pressed: false }),
    ).toBeInTheDocument();
  });

  it('saves the whole set when an Allergen is picked', async () => {
    const user = userEvent.setup();
    const calls = stubAllergies(['a-milk']);
    const section = await open();
    await user.click(await section.findByRole('button', { name: 'Peanuts' }));
    expect(
      await section.findByRole('button', { name: 'Peanuts', pressed: true }),
    ).toBeInTheDocument();
    const put = calls.find((c) => c.key === 'PUT /api/settings/allergies');
    expect(put?.body).toEqual({ allergenIds: ['a-milk', 'a-peanuts'] });
  });

  it('disables the chips while a save is pending, so a quick second tap cannot drop a change', async () => {
    const user = userEvent.setup();
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    stubAllergies([], true, gate);
    const section = await open();
    await user.click(await section.findByRole('button', { name: 'Milk' }));
    expect(section.getByRole('button', { name: 'Gluten' })).toBeDisabled();
    release();
    await vi.waitFor(() =>
      expect(section.getByRole('button', { name: 'Gluten' })).toBeEnabled(),
    );
  });

  it('clears an Allergy', async () => {
    const user = userEvent.setup();
    const calls = stubAllergies(['a-milk']);
    const section = await open();
    await user.click(
      await section.findByRole('button', { name: 'Milk', pressed: true }),
    );
    expect(
      await section.findByRole('button', { name: 'Milk', pressed: false }),
    ).toBeInTheDocument();
    expect(
      calls.find((c) => c.key === 'PUT /api/settings/allergies')?.body,
    ).toEqual({ allergenIds: [] });
  });

  it('tells the Member when saving fails', async () => {
    const user = userEvent.setup();
    stubAllergies([], false);
    const section = await open();
    await user.click(await section.findByRole('button', { name: 'Milk' }));
    expect(
      await section.findByText('Could not save your Allergies. Try again.'),
    ).toBeInTheDocument();
  });

  it('says the Family can see them, and never calls anything safe', async () => {
    stubAllergies([]);
    const section = await open();
    expect(
      await section.findByText(
        /Everyone in your family can see your Allergies\./,
      ),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/\bsafe\b|allergen-free/i);
  });
});
