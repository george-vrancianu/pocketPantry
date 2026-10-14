import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { count, eq } from 'drizzle-orm';
import { catalogScope, SHARED_ONLY } from '../src/catalog/catalog-scope';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { catalogTranslations, ingredients } from '../src/database/schema';
import { createTestApp } from './support/create-test-app';

describe('Catalog scope (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
  });

  afterAll(async () => {
    await app.close();
  });

  it('shows a Family the shared Ingredients and translations', async () => {
    const [{ total }] = await database
      .select({ total: count() })
      .from(ingredients);
    const scope = catalogScope('some-family-id');
    const ingredientRows = scope.ingredients(database);
    const [seen] = await database
      .select({ total: count() })
      .from(ingredientRows);
    expect(total).toBeGreaterThan(0);
    expect(seen.total).toBe(total);

    const [{ translations }] = await database
      .select({ translations: count() })
      .from(catalogTranslations);
    const translationRows = scope.translations(database);
    const [seenTranslations] = await database
      .select({ total: count() })
      .from(translationRows);
    expect(seenTranslations.total).toBe(translations);
  });

  it('shows the shared-only scope the shared Ingredients', async () => {
    const scoped = catalogScope(SHARED_ONLY).ingredients(database);
    const rows = await database
      .select({ id: scoped.id })
      .from(scoped)
      .where(eq(scoped.name, 'Milk'));
    expect(rows).toHaveLength(1);
  });
});
