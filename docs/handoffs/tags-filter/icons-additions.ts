// Tags filter (#706 / #711) — icon additions in the themes/ icon style (24 viewBox, currentColor, round caps/joins).
// Add to packages/ui icons next to the existing set from docs/themes/icons.tsx.

export const ICONS_ADDITIONS = {
  /** Tags button, Tag field leading icon. Stroke 1.9; the hole is a filled dot. */
  tag: {
    strokeWidth: 1.9,
    paths: [
      'M3.5 12.3V5a1.5 1.5 0 0 1 1.5-1.5h7.3a1.5 1.5 0 0 1 1 .4l7.3 7.3a1.5 1.5 0 0 1 0 2.1l-7.3 7.3a1.5 1.5 0 0 1-2.1 0L3.9 13.3a1.5 1.5 0 0 1-.4-1z',
    ],
    circles: [{ cx: 8.2, cy: 8.2, r: 1.4, fill: 'currentColor', stroke: 'none' }],
  },
} as const;
