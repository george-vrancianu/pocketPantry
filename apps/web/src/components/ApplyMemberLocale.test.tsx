import { act, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, stubApi } from '../test/render';
import { ApplyMemberLocale } from './ApplyMemberLocale';

function stubPreferences(stored: 'en' | 'ro' | 'da' | null) {
  const preferences = {
    locale: stored,
    catalogLanguage: null,
    effectiveCatalogLanguage: stored ?? 'en',
    scanLanguage: null,
    effectiveScanLanguage: stored ?? 'en',
    spokenLanguage: null,
    effectiveSpokenLanguage: stored ?? 'en',
    theme: null,
    hideRecipesWithAllergies: false,
  };
  const { fetchMock, calls } = stubApi({
    'GET /api/settings/preferences': () => Response.json(preferences),
    // Like the API: the saved UI Language is what names come back in.
    'PUT /api/settings/preferences': () => {
      const body = calls.at(-1)?.body as { locale: 'en' | 'ro' | 'da' };
      return Response.json({
        ...preferences,
        ...body,
        effectiveCatalogLanguage: body.locale,
      });
    },
  });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
}

const saves = (calls: ReturnType<typeof stubPreferences>) =>
  calls.filter((call) => call.key === 'PUT /api/settings/preferences');

describe('ApplyMemberLocale', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('saves the UI Language the app shows when none is stored', async () => {
    const calls = stubPreferences(null);
    renderWithProviders(<ApplyMemberLocale />, { locale: 'ro' });

    await waitFor(() => expect(saves(calls)).toHaveLength(1));
    expect(saves(calls)[0]?.body).toEqual({ locale: 'ro' });
  });

  it('refetches the Catalog names the save changed', async () => {
    stubPreferences(null);
    const { queryClient } = renderWithProviders(<ApplyMemberLocale />, {
      locale: 'ro',
    });
    queryClient.setQueryData(['pantry'], { batches: [], runningLow: [] });

    await waitFor(() =>
      expect(queryClient.getQueryState(['pantry'])?.isInvalidated).toBe(true),
    );
  });

  it('saves it once, not on every load', async () => {
    const calls = stubPreferences(null);
    const { queryClient } = renderWithProviders(<ApplyMemberLocale />, {
      locale: 'da',
    });
    await waitFor(() => expect(saves(calls)).toHaveLength(1));

    await queryClient.invalidateQueries({
      queryKey: ['settings', 'preferences'],
    });
    await queryClient.invalidateQueries({
      queryKey: ['settings', 'preferences'],
    });
    expect(saves(calls)).toHaveLength(1);
  });

  it('saves nothing when a UI Language is already stored', async () => {
    const calls = stubPreferences('ro');
    const { queryClient } = renderWithProviders(<ApplyMemberLocale />, {
      locale: 'en',
    });

    await waitFor(() =>
      expect(
        queryClient.getQueryData(['settings', 'preferences']),
      ).toBeDefined(),
    );
    await act(async () => {});
    expect(saves(calls)).toHaveLength(0);
  });
});
