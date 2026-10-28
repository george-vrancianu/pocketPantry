import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, stubApi } from '../../test/render';
import { CreditsSection } from './components/CreditsSection';

const PRICES = {
  scan: 1,
  voice: 1,
  assistant: 1,
  'link-page': 2,
  'link-text': 1,
  guidance: 1,
};

describe('CreditsSection', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows the Family Credit Balance', async () => {
    const { fetchMock } = stubApi({
      'GET /api/credits': () => Response.json({ balance: 100, prices: PRICES }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<CreditsSection />);

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Credits' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('100')).toBeInTheDocument();
    expect(screen.getByText('Credits left')).toBeInTheDocument();
  });

  it('says "Credit left" for a balance of one', async () => {
    const { fetchMock } = stubApi({
      'GET /api/credits': () => Response.json({ balance: 1, prices: PRICES }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<CreditsSection />);

    expect(await screen.findByText('Credit left')).toBeInTheDocument();
  });

  it('shows 0 when the Family has run out', async () => {
    const { fetchMock } = stubApi({
      'GET /api/credits': () => Response.json({ balance: 0, prices: PRICES }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<CreditsSection />);

    expect(await screen.findByText('0')).toBeInTheDocument();
  });

  it('shows the error when the balance cannot be loaded', async () => {
    const { fetchMock } = stubApi({
      'GET /api/credits': () =>
        Response.json(
          { code: 'internal_server_error', params: {} },
          { status: 500 },
        ),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<CreditsSection />);

    expect(
      await screen.findByText(
        'Something went wrong on our side. Please try again.',
      ),
    ).toBeInTheDocument();
  });
});
