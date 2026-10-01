import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  usePlateDishes,
  usePlateIngredients,
  type DishGuess,
} from '../../../lib/plate';
import { startReview } from '../../../lib/review';

/**
 * Plate Scan, two steps: the photo yields dish guesses the Member picks from,
 * and the picked dish yields proposed lines that go to Review as a Plate draft.
 */
export function usePlateScan() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const dishesScan = usePlateDishes(i18n.language);
  const ingredients = usePlateIngredients(i18n.language);
  const [dishes, setDishes] = useState<DishGuess[] | null>(null);

  const reset = () => {
    dishesScan.reset();
    ingredients.reset();
    setDishes(null);
  };

  return {
    dishes,
    pending: dishesScan.isPending || ingredients.isPending,
    error: dishesScan.error ?? ingredients.error,
    scan: (image: string) => {
      ingredients.reset();
      dishesScan.mutate(image, {
        onSuccess: (result) => setDishes(result.dishes),
      });
    },
    pick: (title: string) =>
      ingredients.mutate(title, {
        onSuccess: ({ lines }) => {
          startReview({ mode: 'plate', lines });
          navigate('/scan/review');
        },
      }),
    reset,
  };
}
