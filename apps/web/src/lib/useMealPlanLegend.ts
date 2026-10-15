import { useCallback, useState } from 'react';

const KEY = 'pp.mealPlan.legendSeen';

function wasSeen(): boolean {
  try {
    return window.localStorage.getItem(KEY) !== null;
  } catch {
    // Storage can be blocked: the legend then shows on every visit, which is harmless.
    return false;
  }
}

function remember(): void {
  try {
    window.localStorage.setItem(KEY, '1');
  } catch {
    // Not persisting is acceptable.
  }
}

/**
 * The Meal plan Widget's legend shows until the Member has opened a day's popover once on this device,
 * remembered locally like the Row hint.
 */
export function useMealPlanLegend(): {
  visible: boolean;
  markSeen: () => void;
} {
  const [seen, setSeen] = useState(wasSeen);
  const markSeen = useCallback(() => {
    remember();
    setSeen(true);
  }, []);
  return { visible: !seen, markSeen };
}
