import { PocketPantryUiProvider } from '@pocket-pantry/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter, type InitialEntry } from 'react-router-dom';
import { createI18n, type Locale } from '../i18n';
import { RouterLink } from '../lib/RouterLink';

type Options = { route?: InitialEntry; locale?: Locale };

/** Render with the same providers as `main.tsx`, but a memory router and a fresh query cache. */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/', locale = 'en' }: Options = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const i18n = createI18n(locale);
  return render(
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <PocketPantryUiProvider linkComponent={RouterLink}>
          <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
        </PocketPantryUiProvider>
      </QueryClientProvider>
    </I18nextProvider>,
  );
}

/** A fetch stub that answers by method and path, e.g. `'POST /api/auth/sign-in/email'`. */
export function stubApi(routes: Record<string, (url: URL) => Response>) {
  const calls: Array<{ key: string; body: unknown }> = [];
  const fetchMock = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    const key = `${init?.method ?? 'GET'} ${url.pathname}`;
    calls.push({
      key,
      body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
    });
    const handler = routes[key];
    return Promise.resolve(
      handler
        ? handler(url)
        : Response.json({ code: 'not_found', params: {} }, { status: 404 }),
    );
  };
  return { fetchMock, calls };
}
