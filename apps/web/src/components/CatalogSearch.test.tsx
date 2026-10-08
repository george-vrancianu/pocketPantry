import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CatalogSearchResult } from '../lib/catalog';
import { renderWithProviders } from '../test/render';
import { CatalogSearch } from './CatalogSearch';

const parmesan = (locale: 'en' | 'ro'): CatalogSearchResult => ({
  id: 'parmesan-id',
  name: locale === 'ro' ? 'Parmezan' : 'Parmesan',
  defaultUnit: 'g',
  leafCategory: {
    id: 'hard-cheese',
    name: locale === 'ro' ? 'Brânzeturi tari' : 'Hard cheese',
  },
  parentCategory: {
    id: 'dairy',
    name: locale === 'ro' ? 'Lactate' : 'Dairy',
    aisle: 'Dairy & eggs',
  },
  defaults: { expiryDays: 30, location: 'fridge' },
});

const cheddar: CatalogSearchResult = {
  id: 'cheddar-id',
  name: 'Cheddar',
  defaultUnit: 'g',
  leafCategory: { id: 'hard-cheese', name: 'Hard cheese' },
  parentCategory: { id: 'dairy', name: 'Dairy', aisle: 'Dairy & eggs' },
  defaults: { expiryDays: 30, location: 'fridge' },
};

function stubSearch(results: (locale: 'en' | 'ro') => CatalogSearchResult[]) {
  const requests: URL[] = [];
  vi.stubGlobal('fetch', (input: RequestInfo | URL) => {
    const url = new URL(String(input), window.location.origin);
    requests.push(url);
    const locale = url.searchParams.get('locale') === 'ro' ? 'ro' : 'en';
    return Promise.resolve(Response.json({ results: results(locale) }));
  });
  return requests;
}

describe('CatalogSearch', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows localised names with the Parent and Leaf Category', async () => {
    const requests = stubSearch((locale) => [parmesan(locale)]);
    renderWithProviders(<CatalogSearch onSelect={() => {}} />, {
      locale: 'ro',
    });

    await userEvent.setup().type(screen.getByRole('combobox'), 'parmezan');

    const option = await screen.findByRole('option', { name: /Parmezan/ });
    expect(option).toHaveTextContent('Lactate');
    expect(option).toHaveTextContent('Brânzeturi tari');
    expect(requests.at(-1)?.searchParams.get('locale')).toBe('ro');
    expect(requests.at(-1)?.searchParams.get('q')).toBe('parmezan');
  });

  it('is usable from the keyboard alone', async () => {
    stubSearch((locale) => [parmesan(locale), cheddar]);
    const onSelect = vi.fn();
    renderWithProviders(<CatalogSearch onSelect={onSelect} />);
    const user = userEvent.setup();

    await user.tab();
    const input = screen.getByRole('combobox');
    expect(input).toHaveFocus();
    await user.keyboard('che');
    await screen.findAllByRole('option');
    expect(input).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(input.getAttribute('aria-activedescendant')).toBe(
      screen.getByRole('option', { name: /Cheddar/ }).id,
    );
    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledWith(cheddar);
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the list on Escape and selects with a click', async () => {
    stubSearch((locale) => [parmesan(locale)]);
    const onSelect = vi.fn();
    renderWithProviders(<CatalogSearch onSelect={onSelect} />);
    const user = userEvent.setup();

    await user.type(screen.getByRole('combobox'), 'parm');
    await screen.findByRole('option');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('option')).not.toBeInTheDocument();

    await user.keyboard('a');
    await user.click(await screen.findByRole('option', { name: /Parmesan/ }));
    expect(onSelect).toHaveBeenCalledWith(parmesan('en'));
  });

  it('says so when nothing matches', async () => {
    stubSearch(() => []);
    renderWithProviders(<CatalogSearch onSelect={() => {}} />);

    await userEvent.setup().type(screen.getByRole('combobox'), 'zzz');

    expect(await screen.findByText('No ingredients found')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent(
      'No ingredients found',
    );
  });
});
