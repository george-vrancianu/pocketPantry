import { z } from 'zod';

/** Widget types a layout may hold. Cook Tonight and Recipe of the Day arrive in wave 2. */
export const WIDGET_TYPES = [
  'use-soon',
  'shopping',
  'pantry-stock',
  'quick-scan',
  'meal-plan',
  'budget',
  'nutrition',
] as const;
export const WIDGET_SIZES = ['small', 'wide', 'tall'] as const;

export const widgetInstance = z.object({
  /** Client-chosen, unique within the layout, so one type can appear twice. */
  id: z.string().trim().min(1).max(64),
  type: z.enum(WIDGET_TYPES),
  size: z.enum(WIDGET_SIZES),
});
export type WidgetInstance = z.infer<typeof widgetInstance>;

export const dashboardLayoutBody = z.object({
  widgets: z
    .array(widgetInstance)
    .max(30)
    .refine(
      (widgets) => new Set(widgets.map((w) => w.id)).size === widgets.length,
      { message: 'widget ids must be unique' },
    ),
});
export type DashboardLayoutBody = z.infer<typeof dashboardLayoutBody>;
