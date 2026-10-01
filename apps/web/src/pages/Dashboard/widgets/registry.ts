import type { ComponentType } from 'react';
import type { WidgetSize, WidgetType } from '../../../lib/dashboard';
import {
  BudgetWidget,
  MealPlanWidget,
  NutritionWidget,
} from './PlaceholderWidgets';
import { PantryStockWidget } from './PantryStockWidget';
import { QuickScanWidget } from './QuickScanWidget';
import { ShoppingWidget } from './ShoppingWidget';
import type { WidgetProps } from './types';
import { UseSoonWidget } from './UseSoonWidget';

export type WidgetDefinition = {
  component: ComponentType<WidgetProps>;
  /** Translation key (`dashboard` namespace) of the Widget's name, for the customise screen. */
  nameKey: string;
  sizes: WidgetSize[];
  defaultSize: WidgetSize;
};

/**
 * Every Widget type and its component. Widgets are independent: each fetches
 * its own data, so adding one is a new component and one entry here.
 */
export const WIDGET_REGISTRY: Record<WidgetType, WidgetDefinition> = {
  'use-soon': {
    component: UseSoonWidget,
    nameKey: 'widgets.useSoon.title',
    sizes: ['small', 'wide', 'tall'],
    defaultSize: 'wide',
  },
  shopping: {
    component: ShoppingWidget,
    nameKey: 'widgets.shopping.title',
    sizes: ['small', 'wide'],
    defaultSize: 'small',
  },
  'pantry-stock': {
    component: PantryStockWidget,
    nameKey: 'widgets.pantryStock.title',
    sizes: ['small', 'wide'],
    defaultSize: 'small',
  },
  'quick-scan': {
    component: QuickScanWidget,
    nameKey: 'widgets.quickScan.title',
    sizes: ['wide'],
    defaultSize: 'wide',
  },
  'meal-plan': {
    component: MealPlanWidget,
    nameKey: 'widgets.mealPlan.title',
    sizes: ['wide'],
    defaultSize: 'wide',
  },
  budget: {
    component: BudgetWidget,
    nameKey: 'widgets.budget.title',
    sizes: ['small', 'wide'],
    defaultSize: 'small',
  },
  nutrition: {
    component: NutritionWidget,
    nameKey: 'widgets.nutrition.title',
    sizes: ['small', 'wide'],
    defaultSize: 'small',
  },
};
