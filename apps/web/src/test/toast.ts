import { screen, waitFor } from '@testing-library/react';

/**
 * Toasts are polite `status` regions, but so is the always-mounted (often empty) Tags status line
 * on the Recipes and Explore pages. These pick out the toast: the status region that has text.
 */
export const queryToast = () =>
  screen
    .queryAllByRole('status')
    .find((el) => (el.textContent ?? '').trim() !== '') ?? null;

export const getToast = () => {
  const toast = queryToast();
  if (!toast) throw new Error('No toast (status region with text) on screen');
  return toast;
};

export const findToast = () => waitFor(getToast);
