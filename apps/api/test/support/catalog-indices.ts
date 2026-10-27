import type {
  StructuredOutputAiService,
  StructuredOutputRequest,
} from '../../src/ai/structured-output-ai.service';
import type { IngredientCatalog } from '../../src/ingredients/ingredient-catalog';
import type { IngredientCatalogService } from '../../src/ingredients/ingredient-catalog.service';

type Generate = StructuredOutputAiService['generate'];

/**
 * The id field a test may write in a fake answer, and the index field the model
 * really fills in its place.
 */
const INDEX_KEY_OF: Record<string, string> = {
  matchedIngredientId: 'matchedIngredientIndex',
  ingredientId: 'ingredientIndex',
};

/** The `[index, name, category]` tuples of the Catalog text inside `prompt`, if it has one. */
function promptTuples(prompt: string): [unknown, string, string][] | null {
  const start = prompt.indexOf('{"categories":');
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  for (let i = start; i < prompt.length; i++) {
    const char = prompt[i];
    if (inString) {
      if (char === '\\') i++;
      else if (char === '"') inString = false;
    } else if (char === '"') inString = true;
    else if (char === '{' || char === '[') depth++;
    else if (char === '}' || char === ']') {
      depth--;
      if (depth === 0) {
        const parsed = JSON.parse(prompt.slice(start, i + 1)) as {
          ingredients: [unknown, string, string][];
        };
        return parsed.ingredients;
      }
    }
  }
  return null;
}

/**
 * Lets a test write a fake model answer with Ingredient ids
 * (`matchedIngredientId: seedId.ingredient('milk')`) while the app receives what the real
 * model sends: the index the request's Catalog text gave that Ingredient, under the index
 * field (`matchedIngredientIndex`). An id is found through the Catalog snapshots the app
 * loaded (by name and category, so a filtered Catalog works too); any other value (null,
 * an index, an id the prompt does not offer) moves to the index field as is. A field the
 * test already wrote as the index field wins, and any other field reaches the app unchanged.
 */
export function answerWithCatalogIndices(
  generate: Generate,
  catalogs: IngredientCatalogService,
): Generate {
  const seen: IngredientCatalog[] = [];
  const load = catalogs.getCatalogIn.bind(catalogs);
  catalogs.getCatalogIn = async (...args) => {
    const catalog = await load(...args);
    seen.unshift(catalog);
    seen.length = Math.min(seen.length, 20);
    return catalog;
  };

  return async (
    request: StructuredOutputRequest,
    options?: Parameters<Generate>[1],
  ) => {
    const response = await generate(request, options);
    const tuples = promptTuples(request.prompt);
    if (!tuples) return response;
    const indexOf = (id: string): unknown => {
      for (const catalog of seen) {
        const ingredient = catalog.ingredients.find((i) => i.id === id);
        if (!ingredient) continue;
        const tuple = tuples.find(
          ([, name, category]) =>
            name === ingredient.name && category === ingredient.category,
        );
        if (tuple) return tuple[0];
      }
      return id;
    };
    const translate = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.map(translate);
      if (value === null || typeof value !== 'object') return value;
      const entries = Object.entries(value).flatMap(([key, field]) => {
        const indexKey = INDEX_KEY_OF[key];
        if (indexKey === undefined) return [[key, translate(field)]];
        if (indexKey in value) return [];
        return [[indexKey, typeof field === 'string' ? indexOf(field) : field]];
      });
      return Object.fromEntries(entries);
    };
    return { ...response, data: translate(response.data) };
  };
}

/** The index the Catalog text in `prompt` gives the Ingredient called `name`. */
export function catalogIndexIn(prompt: string, name: string): unknown {
  const tuple = promptTuples(prompt)?.find(
    ([, tupleName]) => tupleName === name,
  );
  if (!tuple)
    throw new Error(`No Ingredient "${name}" in the prompt's Catalog`);
  return tuple[0];
}

/**
 * Asserts the prompt's Catalog text names every Ingredient by its index (0, 1, 2, ...)
 * and none by its id. (Checked per tuple: other tests may leave Ingredients whose names
 * hold a UUID in the shared Catalog.)
 */
export function expectCatalogByIndex(prompt: string): void {
  const references = (promptTuples(prompt) ?? []).map(
    ([reference]) => reference,
  );
  expect(references.length).toBeGreaterThan(0);
  expect(references).toEqual(references.map((_, index) => index));
}
