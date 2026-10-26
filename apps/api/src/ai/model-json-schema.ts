import { z } from 'zod';
import { catalogIndexSchema } from '../ingredients/ingredient-catalog';

/**
 * The structured-output contract for a model answer, generated from the zod
 * schema that parses it so the two cannot drift. A Catalog index
 * (`catalogIndexSchema`) is advertised as an integer or null, while parsing
 * stays loose: a malformed index makes the item Unmatched, never the answer
 * invalid.
 */
export function modelJsonSchema(schema: z.ZodType): Record<string, unknown> {
  const json: Record<string, unknown> = z.toJSONSchema(schema, {
    target: 'draft-7',
    override: ({ zodSchema, jsonSchema }) => {
      if (zodSchema !== catalogIndexSchema) return;
      for (const key of Object.keys(jsonSchema)) {
        delete (jsonSchema as Record<string, unknown>)[key];
      }
      Object.assign(jsonSchema, {
        type: ['integer', 'null'],
        description: catalogIndexSchema.description,
      });
    },
  });
  delete json.$schema;
  return json;
}
