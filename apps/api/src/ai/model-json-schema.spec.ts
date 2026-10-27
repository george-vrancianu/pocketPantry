import { z } from 'zod';
import { catalogIndexSchema } from '../ingredients/ingredient-catalog';
import { modelJsonSchema } from './model-json-schema';

describe('modelJsonSchema', () => {
  const schema = z.object({
    name: z.string().min(1),
    matchedIngredientIndex: catalogIndexSchema,
    pairings: z.array(z.object({ ingredientIndex: catalogIndexSchema })),
  });

  it('advertises every Catalog index field to the model as an integer or null', () => {
    const json = modelJsonSchema(schema) as {
      properties: {
        matchedIngredientIndex: unknown;
        pairings: { items: { properties: { ingredientIndex: unknown } } };
      };
    };
    const asked = {
      type: ['integer', 'null'],
      description: catalogIndexSchema.description,
    };
    expect(json.properties.matchedIngredientIndex).toEqual(asked);
    expect(json.properties.pairings.items.properties.ingredientIndex).toEqual(
      asked,
    );
  });

  it('keeps the rest of the parsing rules, as draft-7 without a $schema', () => {
    const json = modelJsonSchema(schema);
    expect(json).not.toHaveProperty('$schema');
    expect(json).toMatchObject({
      type: 'object',
      additionalProperties: false,
      properties: { name: { type: 'string', minLength: 1 } },
    });
  });

  it('still parses a malformed index leniently, so the item is Unmatched rather than the answer invalid', () => {
    for (const value of [2.5, '7', 'milk', -3]) {
      expect(catalogIndexSchema.safeParse(value).success).toBe(true);
    }
  });
});
