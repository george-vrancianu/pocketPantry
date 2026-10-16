import { planPicked, planRemoval, type PlanBatch } from './pantry-removal';

const batch = (
  id: string,
  quantity: number | null,
  unit: PlanBatch['unit'],
  expiryDate: string | null,
): PlanBatch => ({ id, quantity, unit, expiryDate });

const soon = batch('soon', 300, 'g', '2026-10-20');
const later = batch('later', 400, 'g', '2026-11-20');
const undated = batch('undated', 1000, 'g', null);
const sorted = [soon, later, undated];
const noAmount = { quantity: null, unit: null, scope: null } as const;

describe('planRemoval', () => {
  it('takes the whole soonest-expiring Batch when no amount is spoken', () => {
    expect(planRemoval(noAmount, sorted)).toEqual([{ id: 'soon', take: null }]);
  });

  it('takes the soonest dated Batch before an undated one', () => {
    expect(planRemoval(noAmount, [undated, later].sort(byExpiry))).toEqual([
      { id: 'later', take: null },
    ]);
  });

  it('takes every Batch for "all"', () => {
    expect(planRemoval({ ...noAmount, scope: 'all' }, sorted)).toEqual([
      { id: 'soon', take: null },
      { id: 'later', take: null },
      { id: 'undated', take: null },
    ]);
  });

  it('subtracts soonest-expiring first, deleting Batches that reach zero and carrying the rest', () => {
    expect(
      planRemoval({ quantity: 500, unit: 'g', scope: 'one' }, sorted),
    ).toEqual([
      { id: 'soon', take: null },
      { id: 'later', take: 200, remaining: 200 },
    ]);
  });

  it('deletes a Batch the amount exactly empties', () => {
    expect(
      planRemoval({ quantity: 300, unit: 'g', scope: null }, sorted),
    ).toEqual([{ id: 'soon', take: null }]);
  });

  it('needs a Batch picked when the amount is more than there is', () => {
    expect(
      planRemoval({ quantity: 5000, unit: 'g', scope: null }, sorted),
    ).toBeNull();
  });

  it('needs a Batch picked when the unit differs or a Batch has no amount', () => {
    expect(
      planRemoval({ quantity: 1, unit: 'kg', scope: null }, sorted),
    ).toBeNull();
    expect(
      planRemoval({ quantity: 100, unit: 'g', scope: null }, [
        soon,
        batch('plain', null, null, null),
      ]),
    ).toBeNull();
  });

  it('does not drift on decimal amounts', () => {
    const a = batch('a', 0.1, 'l', '2026-10-20');
    const b = batch('b', 0.2, 'l', '2026-10-21');
    expect(
      planRemoval({ quantity: 0.3, unit: 'l', scope: null }, [a, b]),
    ).toEqual([
      { id: 'a', take: null },
      { id: 'b', take: null },
    ]);
  });
});

describe('planPicked', () => {
  it('subtracts a fitting amount from the picked Batch', () => {
    expect(planPicked({ quantity: 100, unit: 'g', scope: null }, soon)).toEqual(
      {
        id: 'soon',
        take: 100,
        remaining: 200,
      },
    );
  });

  it('removes the whole picked Batch when the amount does not fit or there is none', () => {
    expect(planPicked({ quantity: 900, unit: 'g', scope: null }, soon)).toEqual(
      {
        id: 'soon',
        take: null,
      },
    );
    expect(planPicked({ quantity: 2, unit: 'l', scope: null }, soon)).toEqual({
      id: 'soon',
      take: null,
    });
    expect(planPicked(noAmount, soon)).toEqual({ id: 'soon', take: null });
  });
});

function byExpiry(a: PlanBatch, b: PlanBatch) {
  return (a.expiryDate ?? '9999').localeCompare(b.expiryDate ?? '9999');
}
