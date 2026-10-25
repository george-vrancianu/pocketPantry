import { useRecentlyStocked } from '../../../lib/recentlyStocked';
import { PopularToStart } from './PopularToStart';
import { RecentlyStocked } from './RecentlyStocked';
import { MAX_TILES } from './TileSection';

/** Recently Stocked, or Popular to start once the Family has stocked nothing. Waits for the answer before showing either. */
export function RecentlyStockedOrPopular() {
  const recent = useRecentlyStocked(MAX_TILES);
  if (!recent.data) return null;
  return recent.data.length > 0 ? <RecentlyStocked /> : <PopularToStart />;
}
