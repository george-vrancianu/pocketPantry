// Icons for the Meal Plan widget. Same grid as packages/ui icons (24 px, stroke 2,
// round caps and joins, currentColor, no fill). Merge into ICON_PATHS in icons.tsx.
// `calendar` comes from the expiry handoff (also in health-widget/icons-additions.ts);
// repeated here so this folder is complete. `plus`, `check`, `close`, `basket`,
// `chevron-left` and `chevron-right` already exist.

export const MEAL_PLAN_ICON_PATHS = {
  // Short marker inside the 16 pt day mark and the "{n} meals short" Tag (drawn at 10–12 px, stroke 3–3.4).
  bang: '<path d="M12 6v8M12 18v.01"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
} as const;
