import { linkReadingJsonSchema } from '../recipes/link-reading.schemas';
import { plateIngredientsJsonSchema } from '../scan/plate-scan.schemas';
import { tagIdsAt, tagIndexesSchema, tagsPrompt } from './ai-tags';

const allowed = {
  tags: Array.from({ length: 14 }, (_, i) => ({
    id: `id-${i}`,
    name: `T${i}`,
  })),
};

describe('tagIdsAt', () => {
  it('maps indices to ids, drops anything outside the list, and dedupes', () => {
    expect(tagIdsAt(allowed, [2, 2, 99, -1, 1.5, 'x', null, 0])).toEqual([
      'id-2',
      'id-0',
    ]);
  });

  it('keeps at most 10', () => {
    expect(tagIdsAt(allowed, [...allowed.tags.keys()])).toHaveLength(10);
  });

  it('is empty for anything that is not a list', () => {
    expect(tagIdsAt(allowed, undefined)).toEqual([]);
    expect(tagIdsAt(allowed, 'id-1')).toEqual([]);
  });
});

describe('tagsPrompt', () => {
  it('names Tags by index, never by id', () => {
    expect(tagsPrompt(allowed)).toContain('[1,"T1"]');
    expect(tagsPrompt(allowed)).not.toContain('id-1');
  });
});

describe('tagIndexesSchema', () => {
  it('turns entries that are not numbers into an index no list holds, and a non-list into none', () => {
    expect(tagIndexesSchema.parse([1, 'a', null])).toEqual([1, -1, -1]);
    expect(tagIndexesSchema.parse('nope')).toEqual([]);
    expect(tagIndexesSchema.parse(undefined)).toEqual([]);
  });

  it('is advertised to the model as a list of numbers, in both reads', () => {
    for (const schema of [linkReadingJsonSchema, plateIngredientsJsonSchema]) {
      const property = (
        schema as { properties: Record<string, Record<string, unknown>> }
      ).properties.tagIndexes;
      expect(property).toMatchObject({
        type: 'array',
        items: { type: 'number' },
      });
    }
  });
});
