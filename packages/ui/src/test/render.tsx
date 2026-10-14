import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { PocketPantryUiProvider } from '../theme/PocketPantryUiProvider';

function Providers({ children }: { children: ReactNode }) {
  return <PocketPantryUiProvider>{children}</PocketPantryUiProvider>;
}

/** Renders inside the real UI provider, so components see the Themes. */
export function renderWithTheme(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: Providers, ...options });
}
