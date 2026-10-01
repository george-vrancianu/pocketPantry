import { runWithAdapter } from '@better-auth/core/context';
import { createHouseholdOfOne } from './household-of-one';

describe('createHouseholdOfOne', () => {
  it('refuses to run outside a Better Auth transaction', async () => {
    await expect(createHouseholdOfOne()).rejects.toThrow(/transaction/);
  });

  it('refuses to run under a plain, non-transactional adapter', async () => {
    const create = jest.fn();
    await expect(
      runWithAdapter({ create } as never, () => createHouseholdOfOne()),
    ).rejects.toThrow(/transaction/);
    expect(create).not.toHaveBeenCalled();
  });
});
