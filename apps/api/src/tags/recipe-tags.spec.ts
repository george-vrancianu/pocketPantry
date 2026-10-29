import { SHARED_ONLY, catalogScope } from '../catalog/catalog-scope';
import type { Executor } from '../database/database.types';
import { loadUsableTag } from './recipe-tags';

/** An executor whose Tag lookup finds nothing, as when the Tag was deleted a moment ago. */
const emptyExecutor = {
  select: () => ({
    from: () => ({ leftJoin: () => ({ where: () => Promise.resolve([]) }) }),
  }),
} as unknown as Executor;

describe('loadUsableTag', () => {
  it('answers 404 recipes.tag_not_found when the Tag vanished, not a server error', async () => {
    await expect(
      loadUsableTag(
        emptyExecutor,
        catalogScope(SHARED_ONLY),
        'en',
        'family-id',
        'tag-id',
      ),
    ).rejects.toMatchObject({
      status: 404,
      code: 'recipes.tag_not_found',
    });
  });
});
