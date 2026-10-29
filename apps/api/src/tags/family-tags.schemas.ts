import { z } from 'zod';

/** What a Member typed in the Tag field. Length and emptiness are checked after trimming (coded errors). */
export const resolveTagBody = z.object({ name: z.string().max(400) }).strict();
export type ResolveTagBody = z.infer<typeof resolveTagBody>;

/** Rename a Family Tag. `merge` agrees to fold it into the Tag that already has the new name. */
export const renameTagBody = z
  .object({ name: z.string().max(400), merge: z.boolean().default(false) })
  .strict();
export type RenameTagBody = z.infer<typeof renameTagBody>;

export const tagParam = z.object({ id: z.uuid() });

/** What Undo sends back: the removed Tag and the Recipes it was on. */
export const restoreTagBody = z
  .object({
    id: z.uuid(),
    name: z.string().max(400),
    recipeIds: z.array(z.uuid()).max(5000),
  })
  .strict();
export type RestoreTagBody = z.infer<typeof restoreTagBody>;

/** A Family Tag with the number of the Family's live Recipes that carry it. */
export type ManagedTag = { id: string; name: string; recipeCount: number };

export type RenamedTag = ManagedTag & {
  /** True when the Tag was folded into the existing one; `id`/`name` are then the survivor's. */
  merged: boolean;
};

export type DeletedTag = {
  tag: { id: string; name: string };
  /** Every Recipe the Tag was removed from (archived ones too): send back to restore. */
  recipeIds: string[];
  /** How many of those are live Recipes, the number to show. */
  recipeCount: number;
};

export type RestoredTag = ManagedTag & {
  /** Links recreated: Recipes deleted meanwhile or already at the Tag cap are skipped. */
  restoredLinks: number;
};
