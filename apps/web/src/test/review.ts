import { screen, waitFor } from '@testing-library/react';

/** Names of the Review rows on screen, in display order (rows to check first). */
export const reviewRowNames = () =>
  Array.from(
    document.querySelectorAll('[id^="review-line-"][id$="-title"]'),
  ).map((name) => name.textContent);

/** A Review row's own button, once it has rendered. */
export const findReviewRow = (name: string) =>
  waitFor(() => {
    const row = screen
      .getAllByRole('button')
      .find(
        (button) =>
          button.hasAttribute('aria-controls') &&
          button.querySelector('[id$="-title"]')?.textContent === name,
      );
    if (!row) throw new Error(`No Review row named ${name}`);
    return row;
  });
