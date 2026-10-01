import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

/**
 * Lets UI-library components take a plain `href` and still navigate client-side.
 * Passed to `PocketPantryUiProvider` as its `linkComponent`.
 */
export const RouterLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>(function RouterLink({ href, ...props }, ref) {
  return <Link ref={ref} to={href} {...props} />;
});
