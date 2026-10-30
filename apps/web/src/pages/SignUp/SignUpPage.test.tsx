import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../App';
import { renderWithProviders, stubApi } from '../../test/render';

afterEach(() => vi.unstubAllGlobals());

function stub(
  promoCodeRequired: boolean,
  signUp: () => Response = () => Response.json({}),
) {
  const api = stubApi({
    'GET /api/auth/get-session': () => Response.json(null),
    'GET /api/signup-config': () => Response.json({ promoCodeRequired }),
    'POST /api/auth/sign-up/email': signUp,
  });
  vi.stubGlobal('fetch', api.fetchMock);
  return api;
}

async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByLabelText(/^Name/), 'Ana');
  await user.type(screen.getByLabelText(/^Email/), 'ana@example.com');
  await user.type(screen.getByLabelText(/^Password/), 'long-enough-1');
}

describe('SignUpPage Promo Code field', () => {
  it('requires a Promo Code when the deploy asks for one', async () => {
    const { calls } = stub(true);
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: '/sign-up' });
    const field = await screen.findByLabelText(/^Promo Code/);
    expect(field).toBeRequired();
    expect(screen.queryByText('Have a Promo Code?')).toBeNull();
    await fill(user);
    await user.type(field, 'abcde-fghjk');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    await waitFor(() =>
      expect(
        calls.find((c) => c.key === 'POST /api/auth/sign-up/email')?.body,
      ).toEqual({
        name: 'Ana',
        email: 'ana@example.com',
        password: 'long-enough-1',
        promoCode: 'abcde-fghjk',
      }),
    );
  });

  it('offers an optional field otherwise, and sends no code when it is empty', async () => {
    const { calls } = stub(false);
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: '/sign-up' });
    const field = await screen.findByLabelText('Have a Promo Code?');
    expect(field).not.toBeRequired();
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    await waitFor(() =>
      expect(
        calls.find((c) => c.key === 'POST /api/auth/sign-up/email')?.body,
      ).toEqual({
        name: 'Ana',
        email: 'ana@example.com',
        password: 'long-enough-1',
      }),
    );
  });

  it('shows a Promo Code refusal on the Promo Code field', async () => {
    stub(true, () =>
      Response.json(
        { code: 'promo_code.already_redeemed', params: {} },
        { status: 409 },
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: '/sign-up' });
    await fill(user);
    await user.type(screen.getByLabelText(/^Promo Code/), 'ABCDEFGHJK');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    const field = await screen.findByLabelText(/^Promo Code/);
    await waitFor(() => expect(field).toBeInvalid());
    expect(
      screen.getByText('That Promo Code has already been used.'),
    ).toBeVisible();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('keeps other refusals in the form alert, not on the field', async () => {
    stub(false, () =>
      Response.json(
        { code: 'auth.user_already_exists', params: {} },
        { status: 422 },
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: '/sign-up' });
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    await screen.findByRole('alert');
    expect(await screen.findByLabelText('Have a Promo Code?')).toBeValid();
  });
});
