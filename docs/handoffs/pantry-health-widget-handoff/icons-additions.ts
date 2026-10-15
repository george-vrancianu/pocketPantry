// New icons for the Pantry health widget. Same grid as packages/ui icons (24 px, stroke 2,
// round caps and joins, currentColor, no fill). Merge into ICON_PATHS in icons.tsx.
// `calendar` comes from the expiry handoff and `low` (battery) from pantry-batches; repeated
// here so this folder is complete. `trash`, `star`, `check`, `close`, `info`, `plus`,
// `chevron-down` and `chevron-right` already exist.

export const HEALTH_ICON_PATHS = {
  pulse: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
  cook: '<path d="M4 11h16v3a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6z"/><path d="M9 7c0-1 1-1 1-2M14 7c0-1 1-1 1-2"/>',
  hourglass: '<path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  low: '<rect x="2.5" y="7" width="17" height="10" rx="2.5"/><path d="M22 10.5v3"/><path d="M6.5 10.5v3" stroke-width="3.2"/>',
} as const;
