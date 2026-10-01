import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';
import {
  DASHBOARD_LAYOUT_KEY,
  type DashboardLayout,
  type WidgetInstance,
  type WidgetSize,
  type WidgetType,
} from './dashboard';
import { WIDGET_REGISTRY } from '../pages/Dashboard/widgets/registry';

/** Move a Widget to `toIndex` (clamped); an unknown id leaves the layout unchanged. */
export function moveWidget(
  widgets: WidgetInstance[],
  id: string,
  toIndex: number,
): WidgetInstance[] {
  const from = widgets.findIndex((w) => w.id === id);
  if (from === -1) return widgets;
  const target = Math.max(0, Math.min(toIndex, widgets.length - 1));
  if (target === from) return widgets;
  const next = widgets.slice();
  const [moved] = next.splice(from, 1);
  next.splice(target, 0, moved as WidgetInstance);
  return next;
}

export function removeWidget(
  widgets: WidgetInstance[],
  id: string,
): WidgetInstance[] {
  return widgets.filter((w) => w.id !== id);
}

/** Change a Widget's size, ignoring sizes its type does not support. */
export function resizeWidget(
  widgets: WidgetInstance[],
  id: string,
  size: WidgetSize,
): WidgetInstance[] {
  return widgets.map((w) =>
    w.id === id && WIDGET_REGISTRY[w.type]?.sizes.includes(size)
      ? { ...w, size }
      : w,
  );
}

/** Append a new Widget of `type` at its default size. */
export function addWidget(
  widgets: WidgetInstance[],
  type: WidgetType,
  newId: () => string = () => crypto.randomUUID(),
): WidgetInstance[] {
  return [
    ...widgets,
    { id: newId(), type, size: WIDGET_REGISTRY[type].defaultSize },
  ];
}

/** Widget types not yet on the dashboard, in registry order (the gallery never offers a type twice). */
export function availableWidgetTypes(widgets: WidgetInstance[]): WidgetType[] {
  const present = new Set(widgets.map((w) => w.type));
  return (Object.keys(WIDGET_REGISTRY) as WidgetType[]).filter(
    (type) => !present.has(type),
  );
}

/**
 * Apply an edit to the Member's layout: the cache updates at once (changes are
 * live) and the whole layout is saved. Saves are serialised so the last edit
 * wins; a failed save refetches the stored layout.
 */
export function useEditDashboardLayout() {
  const queryClient = useQueryClient();
  const save = useMutation({
    mutationKey: DASHBOARD_LAYOUT_KEY,
    scope: { id: 'dashboard-layout' },
    mutationFn: (layout: DashboardLayout) =>
      apiRequest<DashboardLayout>('/dashboard-layout', {
        method: 'PUT',
        body: layout,
      }),
    onError: () =>
      queryClient.invalidateQueries({ queryKey: DASHBOARD_LAYOUT_KEY }),
  });

  return {
    error: save.error,
    reset: save.reset,
    edit(change: (widgets: WidgetInstance[]) => WidgetInstance[]) {
      const current =
        queryClient.getQueryData<DashboardLayout>(DASHBOARD_LAYOUT_KEY);
      if (!current) return;
      const next = { widgets: change(current.widgets) };
      if (next.widgets === current.widgets) return;
      queryClient.setQueryData(DASHBOARD_LAYOUT_KEY, next);
      save.mutate(next);
    },
  };
}
