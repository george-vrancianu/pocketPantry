import { useMutation } from '@tanstack/react-query';
import { useRefreshCredits } from './credits';
import { apiRequest } from './api';
import { scanQuery, type ScanResponse } from './scan';

/** Ingredients Scan: the counter photo goes up as a data URL and is never stored. */
export function useIngredientsScan(scanLanguage: string) {
  const refreshCredits = useRefreshCredits();
  return useMutation({
    onSettled: () => void refreshCredits(),
    mutationFn: (ingredientsImage: string) =>
      apiRequest<ScanResponse>(`/scan/ingredients${scanQuery(scanLanguage)}`, {
        method: 'POST',
        body: { ingredientsImage },
      }),
  });
}
