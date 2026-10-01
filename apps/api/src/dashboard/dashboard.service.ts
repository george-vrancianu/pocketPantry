import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { dashboardLayouts } from '../database/schema';
import type { DashboardLayoutBody, WidgetInstance } from './dashboard.schemas';

/** The handoff's Main mockup: Use Soon, Shopping, Pantry Stock, Quick Scan. */
/** Fixed ids keep the default layout identical across fetches until the Member first saves. */
const DEFAULT_LAYOUT: WidgetInstance[] = [
  { id: 'default-use-soon', type: 'use-soon', size: 'wide' },
  { id: 'default-shopping', type: 'shopping', size: 'small' },
  { id: 'default-pantry-stock', type: 'pantry-stock', size: 'small' },
  { id: 'default-quick-scan', type: 'quick-scan', size: 'wide' },
];

@Injectable()
export class DashboardService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  /** The Member's saved layout, or the default one until they first save. */
  async get(memberId: string): Promise<DashboardLayoutBody> {
    const [row] = await this.database
      .select({ widgets: dashboardLayouts.widgets })
      .from(dashboardLayouts)
      .where(eq(dashboardLayouts.userId, memberId));
    if (row) return { widgets: row.widgets as WidgetInstance[] };
    return { widgets: DEFAULT_LAYOUT };
  }

  async replace(
    memberId: string,
    layout: DashboardLayoutBody,
  ): Promise<DashboardLayoutBody> {
    await this.database
      .insert(dashboardLayouts)
      .values({ userId: memberId, widgets: layout.widgets })
      .onConflictDoUpdate({
        target: dashboardLayouts.userId,
        set: { widgets: layout.widgets, updatedAt: new Date() },
      });
    return layout;
  }
}
