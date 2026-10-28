import { Logger } from '@nestjs/common';
import type { Database } from '../database/database.types';
import { UsageRecordsService } from './usage-records.service';

describe('UsageRecordsService', () => {
  it('never lets a failed insert break the read: it logs and swallows the error', async () => {
    const error = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const database = {
      insert: () => ({ values: () => Promise.reject(new Error('db down')) }),
    } as unknown as Database;
    await expect(
      new UsageRecordsService(database).record({
        step: 'reading',
        model: 'gpt-6-luna',
        success: true,
      }),
    ).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledTimes(1);
    error.mockRestore();
  });

  it('writes a row with no kind for a call outside any read, rather than dropping it', async () => {
    const values = jest.fn().mockResolvedValue(undefined);
    const database = { insert: () => ({ values }) } as unknown as Database;
    await new UsageRecordsService(database).record({
      step: 'reading',
      model: 'gpt-6-luna',
      success: true,
      usage: { inputTokens: 10, outputTokens: 10 },
    });
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({ kind: null, memberId: null, familyId: null }),
    );
  });
});
