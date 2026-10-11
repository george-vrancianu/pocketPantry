import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type {
  DetailEatingMoment,
  DetailPairing,
  RecipeDetail,
  RecipeGuidance,
} from '../../../lib/recipes';
import { renderWithProviders } from '../../../test/render';
import { GuidanceSection } from './GuidanceSection';

const pairing = (over: Partial<DetailPairing>): DetailPairing => ({
  id: 'p',
  kind: 'food',
  label: 'Steamed greens',
  reason: 'Light next to the butter',
  principle: null,
  link: null,
  ...over,
});
const moment = (over: Partial<DetailEatingMoment>): DetailEatingMoment => ({
  eatingMomentId: 'm',
  name: 'Dinner',
  polarity: 'good_for',
  reason: null,
  ...over,
});

function show(
  guidance: Partial<RecipeGuidance>,
  locale: 'en' | 'ro' | 'da' = 'en',
) {
  const full: RecipeGuidance = {
    nutritionNote: null,
    pairings: [],
    eatingMoments: [],
    ...guidance,
  };
  return renderWithProviders(
    <GuidanceSection recipe={{ guidance: full } as RecipeDetail} />,
    { locale },
  );
}

const DISCLAIMER = 'General guidance, not medical or dietary advice.';

describe('GuidanceSection', () => {
  it('renders nothing, not even the disclaimer, without guidance', () => {
    const { container } = show({});
    expect(container).toBeEmptyDOMElement();
  });

  it('groups Pairings as Food and Drink with label, Principle label and reason', () => {
    show({
      pairings: [
        pairing({
          id: '1',
          kind: 'drink',
          label: 'Dry white wine',
          reason: 'Its acidity cuts the butter',
          principle: 'acid_cuts_fat',
        }),
        pairing({ id: '2', kind: 'food', label: 'Steamed greens' }),
        pairing({ id: '3', kind: 'food', label: 'Crusty bread' }),
      ],
    });
    const food = screen.getByRole('list', { name: 'Food' });
    expect(
      within(food)
        .getAllByRole('listitem')
        .map((li) => li.textContent),
    ).toEqual([
      expect.stringContaining('Steamed greens'),
      expect.stringContaining('Crusty bread'),
    ]);
    const drink = within(screen.getByRole('list', { name: 'Drink' }));
    expect(drink.getByText('Dry white wine')).toBeInTheDocument();
    expect(drink.getByText('Acid cuts fat')).toBeInTheDocument();
    expect(drink.getByText('Its acidity cuts the butter')).toBeInTheDocument();
  });

  it('hides a Pairing group that is empty', () => {
    show({ pairings: [pairing({ kind: 'food' })] });
    expect(screen.queryByRole('list', { name: 'Drink' })).toBeNull();
  });

  it('links a Recipe Pairing through to the Recipe', () => {
    show({
      pairings: [
        pairing({
          label: 'A salad',
          link: { type: 'recipe', id: 'r-1', title: 'Green salad' },
        }),
      ],
    });
    expect(screen.getByRole('link', { name: /Green salad/ })).toHaveAttribute(
      'href',
      '/recipes/r-1',
    );
  });

  it('shows a linked Ingredient as plain text', () => {
    show({
      pairings: [
        pairing({
          label: 'Lemon on the side',
          link: { type: 'ingredient', id: 'i-1', name: 'Lemon' },
        }),
      ],
    });
    expect(screen.getByText(/Lemon on the side/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows the label only when the link was hidden', () => {
    show({ pairings: [pairing({ label: 'Old side', link: null })] });
    expect(screen.getByText('Old side')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('shows Good for and Avoid chips with their reasons', () => {
    show({
      eatingMoments: [
        moment({
          eatingMomentId: '1',
          name: 'Dinner',
          reason: 'Filling and warm',
        }),
        moment({
          eatingMomentId: '2',
          name: 'Before bed',
          polarity: 'avoid',
          reason: 'Heavy to sleep on',
        }),
        moment({ eatingMomentId: '3', name: 'Lunch', polarity: 'good_for' }),
      ],
    });
    const good = within(screen.getByRole('list', { name: 'Good for' }));
    expect(good.getAllByRole('listitem')).toHaveLength(2);
    expect(good.getByText('Dinner')).toBeInTheDocument();
    expect(good.getByText('Filling and warm')).toBeInTheDocument();
    const avoid = within(screen.getByRole('list', { name: 'Avoid' }));
    expect(avoid.getByText('Before bed')).toBeInTheDocument();
    expect(avoid.getByText('Heavy to sleep on')).toBeInTheDocument();
  });

  it('shows the Nutrition note, then the disclaimer last', () => {
    show({ nutritionNote: 'Rich in fat; fine as a treat.' });
    const nutrition = screen.getByRole('region', { name: 'Nutrition' });
    expect(
      within(nutrition).getByText('Rich in fat; fine as a treat.'),
    ).toBeInTheDocument();
    expect(screen.getByText(DISCLAIMER)).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Pairings' })).toBeNull();
    expect(screen.queryByRole('region', { name: 'When to eat' })).toBeNull();
  });

  it('shows one disclaimer for all three sections', () => {
    show({
      nutritionNote: 'Note',
      pairings: [pairing({})],
      eatingMoments: [moment({})],
    });
    expect(screen.getAllByText(DISCLAIMER)).toHaveLength(1);
    expect(screen.getAllByRole('region')).toHaveLength(3);
  });

  it('uses the Member locale for the fixed strings', () => {
    show(
      {
        nutritionNote: 'Bogat in grasimi.',
        pairings: [pairing({ principle: 'acid_cuts_fat' })],
      },
      'ro',
    );
    expect(screen.getByText('Aciditatea taie grăsimea')).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Nutriție' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Recomandări generale, nu sfaturi medicale sau dietetice.',
      ),
    ).toBeInTheDocument();
  });
});
