import { useMutation } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { ScanResponse } from './scan';

/** Ingredients Scan: the counter photo goes up as a data URL and is never stored. */
export function useIngredientsScan(locale: string) {
  return useMutation({
    mutationFn: (ingredientsImage: string) =>
      apiRequest<ScanResponse>(
        `/scan/ingredients?${new URLSearchParams({ locale })}`,
        { method: 'POST', body: { ingredientsImage } },
      ),
  });
}
