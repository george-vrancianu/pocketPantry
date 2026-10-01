import type { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/env';
import type { Database } from '../database/database.types';
import { ScanCapService } from './scan-cap.service';

const withCap = (cap: number) =>
  new ScanCapService(
    // A cap of 0 must never reach the database.
    {
      insert: () => {
        throw new Error('database touched');
      },
    } as unknown as Database,
    { get: () => cap } as unknown as ConfigService<AppConfig, true>,
  );

describe('ScanCapService', () => {
  it('treats a cap of 0 as disabled: Scans are never blocked or counted', async () => {
    const day = await withCap(0).consume(
      'member',
      new Date('2026-01-01T12:00:00Z'),
    );
    expect(day).toBe('2026-01-01');
  });
});
