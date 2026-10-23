import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { stubApi } from '../test/render';
import {
  preferencesQueryKey,
  useSaveCatalogLanguage,
  useSaveScanLanguage,
  useSaveSpokenLanguage,
  type MemberPreferences,
} from './settings';

const stored: MemberPreferences = {
  locale: 'en',
  catalogLanguage: null,
  effectiveCatalogLanguage: 'en',
  scanLanguage: null,
  effectiveScanLanguage: 'en',
  spokenLanguage: null,
  effectiveSpokenLanguage: 'en',
  theme: null,
  hideRecipesWithAllergies: false,
};

function setup(answer: Partial<MemberPreferences>) {
  const { fetchMock } = stubApi({
    'PUT /api/settings/preferences': () =>
      Response.json({ ...stored, ...answer }),
  });
  vi.stubGlobal('fetch', fetchMock);
  const queryClient = new QueryClient();
  queryClient.setQueryData(preferencesQueryKey, stored);
  queryClient.setQueryData(['pantry'], { batches: [], runningLow: [] });
  queryClient.setQueryData(['shopping-list'], {});
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const named = () =>
    ['pantry', 'shopping-list'].map(
      (key) => queryClient.getQueryState([key])?.isInvalidated,
    );
  return { wrapper, named };
}

describe('saving a language Preference', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('refetches the Catalog names when the effective Catalog Language changed', async () => {
    const { wrapper, named } = setup({
      catalogLanguage: 'ro',
      effectiveCatalogLanguage: 'ro',
    });
    const { result } = renderHook(() => useSaveCatalogLanguage(), { wrapper });

    await act(() => result.current.mutateAsync('ro'));

    expect(named()).toEqual([true, true]);
  });

  it('leaves the Catalog names alone on a Scan Language save', async () => {
    const { wrapper, named } = setup({
      scanLanguage: 'da',
      effectiveScanLanguage: 'da',
    });
    const { result } = renderHook(() => useSaveScanLanguage(), { wrapper });

    await act(() => result.current.mutateAsync('da'));

    expect(named()).toEqual([false, false]);
  });

  it('leaves the Catalog names alone on a Spoken Language save', async () => {
    const { wrapper, named } = setup({
      spokenLanguage: 'ro',
      effectiveSpokenLanguage: 'ro',
    });
    const { result } = renderHook(() => useSaveSpokenLanguage(), { wrapper });

    await act(() => result.current.mutateAsync('ro'));

    expect(named()).toEqual([false, false]);
  });
});
