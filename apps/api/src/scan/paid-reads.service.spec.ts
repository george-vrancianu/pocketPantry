import { found, foundNothing, PaidReadsService } from './paid-reads.service';
import type { CreditsService } from '../credits/credits.service';
import type { UsageRecordsService } from '../usage/usage-records.service';
import type { ScanCapService } from './scan-cap.service';

describe('PaidReadsService', () => {
  const setup = () => {
    const caps = {
      consume: jest.fn().mockResolvedValue('2026-01-01'),
      refund: jest.fn().mockResolvedValue(undefined),
      assertBelowCap: jest.fn().mockResolvedValue(undefined),
    };
    const credits = {
      priceOf: jest.fn().mockReturnValue(1),
      hold: jest.fn().mockResolvedValue({ entryId: 'e1' }),
      release: jest.fn().mockResolvedValue(undefined),
      assertCanAfford: jest.fn().mockResolvedValue(undefined),
    };
    const usage = {
      inContext: jest.fn((_m, _k, run: () => Promise<unknown>) => run()),
    };
    return {
      usage,
      caps,
      credits,
      paid: new PaidReadsService(
        caps as unknown as ScanCapService,
        credits as unknown as CreditsService,
        usage as unknown as UsageRecordsService,
      ),
    };
  };

  it('counts before the read and keeps the use when something was found', async () => {
    const { caps, paid } = setup();
    expect(await paid.read('m', 'voice', () => Promise.resolve(found(7)))).toBe(
      7,
    );
    expect(caps.consume).toHaveBeenCalledWith('m', expect.any(Date), 'voice');
    expect(caps.refund).not.toHaveBeenCalled();
  });

  it('hands the use back on the day it was counted when the read finds nothing', async () => {
    const { caps, paid } = setup();
    expect(
      await paid.read('m', 'scan', () => Promise.resolve(foundNothing(0))),
    ).toBe(0);
    expect(caps.refund).toHaveBeenCalledWith('m', '2026-01-01', 'scan');
  });

  it('hands the use back and rethrows when the read throws', async () => {
    const { caps, paid } = setup();
    await expect(
      paid.read('m', 'assistant', () => Promise.reject(new Error('boom'))),
    ).rejects.toThrow('boom');
    expect(caps.refund).toHaveBeenCalledWith('m', '2026-01-01', 'assistant');
  });

  it('maps both Link kinds to the Link Cap', async () => {
    const { caps, paid } = setup();
    await paid.read('m', 'link-text', () => Promise.resolve(found(1)));
    await paid.assertCanGoAhead('m', 'link-page');
    expect(caps.consume).toHaveBeenCalledWith('m', expect.any(Date), 'link');
    expect(caps.assertBelowCap).toHaveBeenCalledWith(
      'm',
      expect.any(Date),
      'link',
    );
  });

  it('counts nothing for the Admin path', async () => {
    const { caps, paid } = setup();
    await paid.assertCanGoAhead(null, 'guidance-admin');
    await paid.read(null, 'guidance-admin', () =>
      Promise.resolve(foundNothing(1)),
    );
    expect(caps.consume).not.toHaveBeenCalled();
    expect(caps.refund).not.toHaveBeenCalled();
    expect(caps.assertBelowCap).not.toHaveBeenCalled();
  });

  it('ties a missing Member to the Admin kind in the types', () => {
    const { paid } = setup();
    const run = () => Promise.resolve(found(1));
    // @ts-expect-error a Member kind needs a Member
    void paid.read(null, 'scan', run);
    // @ts-expect-error the Admin kind has no Member
    void paid.read('m', 'guidance-admin', run);
    // @ts-expect-error a Member kind needs a Member
    void paid.assertCanGoAhead(null, 'link-page');
  });

  describe('Credits', () => {
    it('holds the Credit Price after the Cap use and keeps it when something was found', async () => {
      const { caps, credits, paid } = setup();
      await paid.read('m', 'scan', () => Promise.resolve(found(1)));
      expect(credits.hold).toHaveBeenCalledWith('m', 'scan', 1);
      expect(caps.consume.mock.invocationCallOrder[0]).toBeLessThan(
        credits.hold.mock.invocationCallOrder[0],
      );
      expect(credits.release).not.toHaveBeenCalled();
    });

    it('gives the Credits and the Cap use back when the read finds nothing or throws', async () => {
      const { caps, credits, paid } = setup();
      await paid.read('m', 'scan', () => Promise.resolve(foundNothing(0)));
      await expect(
        paid.read('m', 'scan', () => Promise.reject(new Error('boom'))),
      ).rejects.toThrow('boom');
      expect(credits.release).toHaveBeenCalledTimes(2);
      expect(credits.release).toHaveBeenCalledWith({ entryId: 'e1' });
      expect(caps.refund).toHaveBeenCalledTimes(2);
    });

    it('hands the Cap use back and never runs the read when the Credits refuse', async () => {
      const { caps, credits, paid } = setup();
      credits.hold.mockRejectedValue(new Error('credits.insufficient'));
      const run = jest.fn();
      await expect(paid.read('m', 'scan', run)).rejects.toThrow(
        'credits.insufficient',
      );
      expect(run).not.toHaveBeenCalled();
      expect(caps.refund).toHaveBeenCalledWith('m', '2026-01-01', 'scan');
    });

    it('does not touch Credits when the Cap refuses', async () => {
      const { caps, credits, paid } = setup();
      caps.consume.mockRejectedValue(new Error('scan.cap_reached'));
      await expect(
        paid.read('m', 'scan', () => Promise.resolve(found(1))),
      ).rejects.toThrow('scan.cap_reached');
      expect(credits.hold).not.toHaveBeenCalled();
    });

    it.each([
      'scan',
      'voice',
      'assistant',
      'link-page',
      'link-text',
      'guidance',
    ] as const)('charges a %s read, and never the Admin read', async (kind) => {
      const { credits, paid } = setup();
      await paid.read('m', kind, () => Promise.resolve(found(1)));
      expect(credits.hold).toHaveBeenCalledTimes(1);
      await paid.read(null, 'guidance-admin', () => Promise.resolve(found(1)));
      expect(credits.hold).toHaveBeenCalledTimes(1);
    });
  });
});
