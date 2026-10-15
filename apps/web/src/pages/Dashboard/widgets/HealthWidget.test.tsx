import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Batch } from '../../../lib/pantry';
import type { Staple } from '../../../lib/staples';
import { renderWithProviders, stubApi } from '../../../test/render';
import { stubMotion } from '../../../test/viewport';
import { HealthWidget } from './HealthWidget';

const isoIn = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

let counter = 0;
const batch = (overrides: Partial<Batch> = {}): Batch => {
  counter += 1;
  return {
    id: `b${counter}`,
    name: 'Item',
    ingredientId: `ing${counter}`,
    unmatched: false,
    aisle: null,
    amountScale: null,
    defaultUnit: null,
    quantity: null,
    unit: null,
    location: 'fridge',
    expiryDate: isoIn(30),
    productDescription: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
};

const staple = (ingredientId: string): Staple => ({
  id: `s-${ingredientId}`,
  ingredientId,
  name: ingredientId,
  quantity: null,
  unit: null,
  aisle: null,
});

/**
 * Ten Batches: eight in date, one expired, one undated; two Staples, one stocked and one missing.
 * Fresh 89, Staples 50, Dated 90, Rotation 100: 79, with three Health To-dos (expired, missing Staple, undated).
 */
function tenBatchPantry() {
  return {
    batches: [
      batch({ ingredientId: 'milk' }),
      ...Array.from({ length: 7 }, () => batch()),
      batch({ expiryDate: isoIn(-2) }),
      batch({ expiryDate: null }),
    ],
    runningLow: [] as string[],
  };
}

function stub(
  pantry: { batches: Batch[]; runningLow: string[] },
  staples: Staple[] = [staple('milk'), staple('eggs')],
  settings: () => Response | Promise<Response> = () =>
    Response.json({ staleThresholdDays: 3, expiryOverrides: [] }),
  dismissed: string[] = [],
) {
  const { fetchMock, calls } = stubApi({
    'GET /api/settings/family': settings,
    'GET /api/pantry': () => Response.json(pantry),
    'GET /api/shopping-list/suggestions': () =>
      Response.json({
        staples: [],
        usedUp: [],
        runningLow: [],
        expired: [],
        dismissed,
      }),
    'GET /api/staples': () => Response.json({ staples }),
    'GET /api/shopping-list': () =>
      Response.json({
        id: 'l1',
        groups: [],
        summary: { remaining: 0, checked: 0 },
      }),
  });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
}

/** The element's markup under the active Theme: a Theme is its CSS variables, set on the root. */
const snapshotOf = (element: Element) =>
  `data-theme=${document.documentElement.dataset.theme}\n${element.outerHTML.replace(/_r_\w+_/g, '_r_N_')}`;

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('HealthWidget', () => {
  it('shows the score, verdict and to-do count on the wide card, named for a screen reader', async () => {
    stub(tenBatchPantry());

    renderWithProviders(<HealthWidget size="wide" columns={2} />);

    const card = await screen.findByRole('button', {
      name: 'Pantry health, 79, A few things to sort, 3 things to do',
    });
    expect(card).toHaveAttribute('aria-haspopup', 'dialog');
    expect(card).toHaveTextContent('79');
    expect(card).toHaveTextContent('A few things to sort');
    expect(card).toHaveTextContent('3 to do');
    expect(card.querySelectorAll('[data-factor]')).toHaveLength(4);
  });

  it('counts a dismissed missing Staple neither for nor against the score', async () => {
    const name = 'Pantry health, 94, In good shape, 2 things to do';

    // Eggs is not a Staple at all: the score a dismissed Staple must match.
    stub(tenBatchPantry(), [staple('milk')]);
    const first = renderWithProviders(<HealthWidget size="wide" columns={2} />);
    expect(await screen.findByRole('button', { name })).toBeInTheDocument();
    first.unmount();
    vi.unstubAllGlobals();

    stub(tenBatchPantry(), [staple('milk'), staple('eggs')], undefined, [
      'eggs',
    ]);
    renderWithProviders(<HealthWidget size="wide" columns={2} />);

    // Fresh 89, Staples 100 (eggs left out), Dated 90, Rotation 100.
    expect(await screen.findByRole('button', { name })).toBeInTheDocument();
  });

  it('shows the same on the small card, without the bar', async () => {
    stub(tenBatchPantry());

    renderWithProviders(<HealthWidget size="small" columns={2} />);

    const card = await screen.findByRole('button', {
      name: 'Pantry health, 79, A few things to sort, 3 things to do',
    });
    expect(card).toHaveTextContent('3 to do');
    expect(card.querySelector('[data-factor]')).toBeNull();
  });

  it('says there is nothing to do for a Pantry in order', async () => {
    stub(
      {
        batches: Array.from({ length: 10 }, () => batch()),
        runningLow: [],
      },
      [],
    );

    renderWithProviders(<HealthWidget size="wide" columns={2} />);

    const card = await screen.findByRole('button', {
      name: 'Pantry health, 100, In good shape, nothing to do',
    });
    expect(card).toHaveTextContent('Nothing to do');
  });

  it('shows a progress ring and no verdict under ten Batches', async () => {
    stub(
      {
        batches: [batch(), batch(), batch(), batch({ expiryDate: isoIn(-1) })],
        runningLow: [],
      },
      [],
    );

    renderWithProviders(<HealthWidget size="wide" columns={2} />);

    const card = await screen.findByRole('button', {
      name: 'Pantry health, Add 6 more to the Pantry to get your score, 1 thing to do',
    });
    expect(card).toHaveTextContent(
      'Add 6 more to the Pantry to get your score',
    );
    expect(card).toHaveTextContent('1 to do');
    expect(card).not.toHaveTextContent('In good shape');
    expect(card.querySelector('[data-factor]')).toBeNull();
  });

  it('waits for the Family Settings before scoring, so the default Stale Threshold never shows', async () => {
    let release: () => void = () => {};
    const settingsLoaded = new Promise<void>((resolve) => {
      release = resolve;
    });
    const calls = stub(
      {
        batches: [
          ...Array.from({ length: 9 }, () => batch()),
          batch({ expiryDate: isoIn(5) }),
        ],
        runningLow: [],
      },
      [],
      async () => {
        await settingsLoaded;
        return Response.json({ staleThresholdDays: 10, expiryOverrides: [] });
      },
    );

    renderWithProviders(<HealthWidget size="wide" columns={2} />);

    await waitFor(() =>
      expect(calls.some((call) => call.key === 'GET /api/pantry')).toBe(true),
    );
    expect(
      await screen.findByRole('progressbar', { name: 'Loading' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    release();
    // With the default threshold of 3 the Batch five days out would count as fresh and the score be 100.
    expect(
      await screen.findByRole('button', { name: /^Pantry health, 98/ }),
    ).toBeInTheDocument();
  });

  it('speaks Romanian', async () => {
    stub({ batches: [batch()], runningLow: [] }, []);

    renderWithProviders(<HealthWidget size="wide" columns={2} />, {
      locale: 'ro',
    });

    expect(
      await screen.findByRole('button', { name: /^Starea cămării, / }),
    ).toHaveTextContent('Adaugă încă 9 în cămară');
  });

  describe('when the score changes', () => {
    async function changeScore(reduceMotion: boolean) {
      const pantry = tenBatchPantry();
      stub(pantry);
      stubMotion(reduceMotion);
      const { queryClient } = renderWithProviders(
        <HealthWidget size="wide" columns={2} />,
      );
      const card = await screen.findByRole('button', {
        name: /^Pantry health, 79/,
      });
      // Swapping the expired Batch for a dated one lifts Fresh to 100: 40 + 15 + 13.5 + 15 = 83.5, rounded to 84.
      pantry.batches.splice(8, 1);
      pantry.batches.push(batch());
      await queryClient.invalidateQueries({ queryKey: ['pantry'] });
      return card;
    }

    it('jumps to the new score with reduced motion', async () => {
      const card = await changeScore(true);

      await waitFor(() => expect(card).toHaveTextContent('84'));
    });

    it('counts to the new score otherwise', async () => {
      const card = await changeScore(false);

      expect(card).toHaveTextContent('79');
      await waitFor(() => expect(card).toHaveTextContent('84'), {
        timeout: 2000,
      });
    });
  });

  describe('sheet', () => {
    it('opens on a tap with the header: the ring, verdict and each Health Factor', async () => {
      stub(tenBatchPantry());
      const user = userEvent.setup();
      renderWithProviders(<HealthWidget size="wide" columns={2} />);

      await user.click(
        await screen.findByRole('button', { name: /^Pantry health, 79/ }),
      );

      const sheet = await screen.findByRole('dialog', {
        name: 'Pantry health',
      });
      expect(sheet).toHaveTextContent('79');
      expect(sheet).toHaveTextContent('A few things to sort');
      expect(sheet).toHaveTextContent(
        'Fresh 89 · Staples 50 · Dated 90 · Rotation 100',
      );
      expect(
        within(sheet).getByRole('button', { name: 'Close' }),
      ).toBeInTheDocument();
    });

    it('explains the progress instead of the Health Factors under ten Batches', async () => {
      stub({ batches: [batch(), batch()], runningLow: [] }, []);
      const user = userEvent.setup();
      renderWithProviders(<HealthWidget size="small" columns={2} />);

      await user.click(
        await screen.findByRole('button', { name: /^Pantry health, Add 8/ }),
      );

      const sheet = await screen.findByRole('dialog', {
        name: 'Pantry health',
      });
      expect(sheet).toHaveTextContent(
        'Add 8 more to the Pantry to get your score',
      );
      expect(sheet).not.toHaveTextContent('Fresh');
    });

    async function openSheet() {
      stub(tenBatchPantry());
      stubMotion(true);
      const user = userEvent.setup();
      renderWithProviders(<HealthWidget size="wide" columns={2} />);
      const card = await screen.findByRole('button', {
        name: /^Pantry health, 79/,
      });
      await user.click(card);
      await screen.findByRole('dialog', { name: 'Pantry health' });
      return { user, card };
    }

    const closed = () =>
      waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );

    it('closes on Escape and gives focus back to the card', async () => {
      const { user, card } = await openSheet();

      await user.keyboard('{Escape}');

      await closed();
      expect(card).toHaveFocus();
    });

    it('closes on the scrim and gives focus back to the card', async () => {
      const { user, card } = await openSheet();

      await user.click(document.querySelector('.MuiBackdrop-root') as Element);

      await closed();
      expect(card).toHaveFocus();
    });

    it('closes on the close button and gives focus back to the card', async () => {
      const { user, card } = await openSheet();

      await user.click(screen.getByRole('button', { name: 'Close' }));

      await closed();
      expect(card).toHaveFocus();
    });
  });

  describe.each(['warm', 'minimal', 'dark'] as const)(
    'in the %s Theme',
    (theme) => {
      async function render(size: 'wide' | 'small') {
        localStorage.setItem(
          'pp.appearance',
          JSON.stringify({ theme, matchSystem: false }),
        );
        stub(tenBatchPantry());
        stubMotion(true);
        const result = renderWithProviders(
          <HealthWidget size={size} columns={2} />,
        );
        const card = await screen.findByRole('button', {
          name: /^Pantry health, 79/,
        });
        return { ...result, card };
      }

      it('looks the same wide', async () => {
        const { card } = await render('wide');
        expect(snapshotOf(card)).toMatchSnapshot();
      });

      it('looks the same small', async () => {
        const { card } = await render('small');
        expect(snapshotOf(card)).toMatchSnapshot();
      });

      it('looks the same as an open sheet header', async () => {
        const { card } = await render('wide');
        await userEvent.setup().click(card);
        const sheet = await screen.findByRole('dialog', {
          name: 'Pantry health',
        });
        expect(snapshotOf(sheet)).toMatchSnapshot();
      });
    },
  );
});
