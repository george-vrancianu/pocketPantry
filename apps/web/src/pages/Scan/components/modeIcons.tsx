import type { ReactNode } from 'react';
import type { CameraMode } from '../../../lib/cameraMode';

const icon = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    {children}
  </svg>
);

/** A small outline icon per camera mode: the glyph on a Session thumbnail with no photo. */
export const MODE_ICONS: Record<CameraMode, ReactNode> = {
  receipt: icon(
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </>,
  ),
  product: icon(
    <>
      <path d="M4 7a3 3 0 013-3h10a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3z" />
      <path d="M8 9h8M8 12.5h8M8 16h5" />
    </>,
  ),
  ingredients: icon(
    <>
      <path d="M3 10h18M3 18h18" />
      <path d="M6 10V6h3v4M12 10V5h4v5M7 18v-4h4v4M14 18v-5h3v5" />
    </>,
  ),
  barcode: icon(
    <>
      <path d="M4 6v12M7 6v12M11 6v12M14 6v12M17 6v12M20 6v12" />
    </>,
  ),
  plate: icon(
    <>
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M3 4v5a1.5 1.5 0 003 0V4M4.5 4v16M21 4c-1.5 1-2 3-2 5s.7 2 2 2v9" />
    </>,
  ),
};
