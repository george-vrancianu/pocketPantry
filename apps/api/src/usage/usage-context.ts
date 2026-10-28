import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Who a provider call is for. Set once around a read (by `PaidReadsService`); the metering layer
 * reads it to write the Usage Record. `kind` is a read kind (scan, voice, ...). The Admin Catalog
 * Suggest Guidance has neither a Member nor a Family.
 */
export type UsageContext = {
  kind: string;
  memberId: string | null;
  familyId: string | null;
};

const storage = new AsyncLocalStorage<UsageContext>();

export const runInUsageContext = <T>(
  context: UsageContext,
  run: () => Promise<T>,
): Promise<T> => storage.run(context, run);

/** The context of the read the current call belongs to; undefined outside any read. */
export const currentUsageContext = (): UsageContext | undefined =>
  storage.getStore();
