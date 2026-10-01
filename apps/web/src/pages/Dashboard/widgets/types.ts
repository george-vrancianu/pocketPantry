import type { WidgetSize } from '../../../lib/dashboard';

/** Every Widget component takes only its size and fetches its own data. */
export type WidgetProps = { size: WidgetSize };
