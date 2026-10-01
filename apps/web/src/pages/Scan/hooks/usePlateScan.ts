import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../../lib/api';
import {
  usePlateDishes,
  usePlateIngredients,
  type PlateDishes,
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
  const [dishes, setDishes] = useState<PlateDishes | null>(null);

  const reset = () => {
    dishesScan.reset();
    ingredients.reset();
    setDishes(null);
  };

  return {
    dishes: dishes?.dishes ?? null,
    pending: dishesScan.isPending || ingredients.isPending,
    error: dishesScan.error ?? ingredients.error,
    scan: (image: string) => {
      ingredients.reset();
      dishesScan.mutate(image, {
        onSuccess: setDishes,
      });
    },
    pick: (title: string) =>
      dishes &&
      ingredients.mutate(
        { dishTitle: title, plateToken: dishes.token },
        {
          onSuccess: ({ lines }) => {
            startReview({ mode: 'plate', lines });
            navigate('/scan/review');
          },
          // The dish list is stale or not ours: back to the scan step, with the error shown.
          onError: (error) => {
            if (
              error instanceof ApiError &&
              error.code === 'scan.plate_token_invalid'
            ) {
              setDishes(null);
            }
          },
        },
      ),
    reset,
  };
}
