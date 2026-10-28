import { found, foundNothing, PaidReadsService } from './paid-reads.service';
import type { ScanCapService } from './scan-cap.service';

describe('PaidReadsService', () => {
  const setup = () => {
    const caps = {
      consume: jest.fn().mockResolvedValue('2026-01-01'),
      refund: jest.fn().mockResolvedValue(undefined),
      assertBelowCap: jest.fn().mockResolvedValue(undefined),
    };
    return {
      caps,
      paid: new PaidReadsService(caps as unknown as ScanCapService),
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
});
