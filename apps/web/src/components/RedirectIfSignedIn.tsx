import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../lib/auth';
import { FullPageSpinner } from './FullPageSpinner';

/** Route guard for sign-in and sign-up: Members who are already signed in go home. */
export function RedirectIfSignedIn() {
  const session = useSession();
  if (session.isPending) return <FullPageSpinner />;
  if (session.data) return <Navigate to="/" replace />;
  return <Outlet />;
}
