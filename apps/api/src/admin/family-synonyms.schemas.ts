import { z } from 'zod';
import { CATALOG_LOCALES } from '../catalog/catalog.schemas';
import { MAX_PAGE_SIZE } from './unmatched-queue.schemas';

export type FamilySynonymCursor = { count: number; name: string; id: string };
export const encodeSynonymCursor = ({
  count,
  name,
  id,
}: FamilySynonymCursor): string =>
  Buffer.from(JSON.stringify([count, name, id])).toString('base64url');

/** Keyset paging: Family count descending, then normalised name, then Ingredient id. */
export const familySynonymsListQuery = z.object({
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(50),
  cursor: z
    .string()
    .max(500)
    .optional()
    .transform((value, ctx): FamilySynonymCursor | undefined => {
      if (value === undefined) return undefined;
      try {
        const [count, name, id] = z
          .tuple([
            z.number().int().min(1),
            z.string().min(1).max(200),
            z.uuid(),
          ])
          .parse(JSON.parse(Buffer.from(value, 'base64url').toString()));
        return { count, name, id };
      } catch {
        ctx.addIssue({ code: 'custom', message: 'malformed cursor' });
        return z.NEVER;
      }
    }),
});
export type FamilySynonymsListQuery = z.infer<typeof familySynonymsListQuery>;

export const familySynonymPromoteBody = z.object({
  normalizedName: z.string().trim().min(1).max(200),
  ingredientId: z.uuid(),
  locale: z.enum(CATALOG_LOCALES),
});
export type FamilySynonymPromoteBody = z.infer<typeof familySynonymPromoteBody>;

/** One (normalised name, Ingredient) over Family Synonym rows. No Family identity. */
export type FamilySynonymCandidate = {
  normalizedName: string;
  /** As typed in the oldest row. */
  name: string;
  ingredient: { id: string; name: string };
  familyCount: number;
};

export type FamilySynonymsPage = {
  candidates: FamilySynonymCandidate[];
  nextCursor: string | null;
};

export type PromotedFamilySynonym = {
  ingredientId: string;
  name: string;
  locale: string;
};
