import type { ingredientUnit } from '../database/schema';

/** One Ingredient Line as the diff sees it. `key` is the line's identity. */
export type DiffLine = {
  id: string;
  /** `i:<ingredientId>`, or `n:<normalised name>` for an Unmatched line. */
  key: string;
  ingredientId: string | null;
  ingredientName: string;
  quantity: number | null;
  unit: (typeof ingredientUnit.enumValues)[number] | null;
};

export type DiffEntry = DiffLine;

/** What a Variant's ingredients change against its base. */
export type RecipeDiff = {
  /** Lines only the Variant has. */
  added: DiffEntry[];
  /** Lines only the base has. */
  removed: DiffEntry[];
  /** A base line replaced by a Variant line at the same place. */
  swapped: { from: DiffEntry; to: DiffEntry }[];
};

/** The identity of a line: its Ingredient, or its normalised name when Unmatched. */
export const lineKey = (line: {
  ingredientId: string | null;
  normalizedName: string | null;
}): string =>
  line.ingredientId ? `i:${line.ingredientId}` : `n:${line.normalizedName}`;

/**
 * Compares a base's lines with a Variant's. Lines are aligned by key in order
 * (longest common subsequence, like a text diff); in each gap between common
 * lines, removed and added lines pair up in order as `swapped`, and what is
 * left over is `added` or `removed`. A common line with another quantity is
 * not reported.
 */
export function diffIngredients(
  base: DiffLine[],
  variant: DiffLine[],
): RecipeDiff {
  const n = base.length;
  const m = variant.length;
  // lcs[i][j]: common length of base[i..] and variant[j..]
  const lcs = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  );
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] =
        base[i].key === variant[j].key
          ? lcs[i + 1][j + 1] + 1
          : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const result: RecipeDiff = { added: [], removed: [], swapped: [] };
  let removed: DiffLine[] = [];
  let added: DiffLine[] = [];
  const flush = () => {
    const pairs = Math.min(removed.length, added.length);
    for (let k = 0; k < pairs; k++) {
      result.swapped.push({ from: removed[k], to: added[k] });
    }
    result.removed.push(...removed.slice(pairs));
    result.added.push(...added.slice(pairs));
    removed = [];
    added = [];
  };

  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && base[i].key === variant[j].key) {
      flush();
      i++;
      j++;
    } else if (j >= m || (i < n && lcs[i + 1][j] >= lcs[i][j + 1])) {
      removed.push(base[i++]);
    } else {
      added.push(variant[j++]);
    }
  }
  flush();
  return result;
}
