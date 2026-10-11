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
 * (longest common subsequence, like a text diff). Reordered lines are not
 * changes: a removed and an added line with the same key cancel one-to-one
 * (duplicates are counted) before anything is reported. In each gap between
 * common lines, the removed and added lines that are left pair up in order as
 * `swapped`, and what is left over is `added` or `removed`. A common line
 * with another quantity is not reported.
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

  const gaps: { removed: DiffLine[]; added: DiffLine[] }[] = [];
  let removed: DiffLine[] = [];
  let added: DiffLine[] = [];
  const flush = () => {
    if (removed.length > 0 || added.length > 0) gaps.push({ removed, added });
    removed = [];
    added = [];
  };

  let i = 0;
  let j = 0;
  // On a tie in the alignment the Variant's line goes first, so a line moved
  // forward in the Variant is the one treated as moved. Known limitation: the
  // mirrored case [c,a,b] vs [a,x,c] reports added x / removed b, not a swap.
  while (i < n || j < m) {
    if (i < n && j < m && base[i].key === variant[j].key) {
      flush();
      i++;
      j++;
    } else if (j >= m || (i < n && lcs[i + 1][j] > lcs[i][j + 1])) {
      removed.push(base[i++]);
    } else {
      added.push(variant[j++]);
    }
  }
  flush();

  // A line removed in one gap and added in another is a reorder, not a change:
  // cancel such pairs one-to-one before pairing what is left.
  const unmatchedAdded = new Map<string, DiffLine[]>();
  for (const gap of gaps) {
    for (const line of gap.added) {
      unmatchedAdded.set(line.key, [
        ...(unmatchedAdded.get(line.key) ?? []),
        line,
      ]);
    }
  }
  const cancelled = new Set<DiffLine>();
  for (const gap of gaps) {
    for (const line of gap.removed) {
      const twin = unmatchedAdded.get(line.key)?.shift();
      if (twin) {
        cancelled.add(line);
        cancelled.add(twin);
      }
    }
  }

  const result: RecipeDiff = { added: [], removed: [], swapped: [] };
  for (const gap of gaps) {
    const out = gap.removed.filter((line) => !cancelled.has(line));
    const inn = gap.added.filter((line) => !cancelled.has(line));
    const pairs = Math.min(out.length, inn.length);
    for (let k = 0; k < pairs; k++) {
      result.swapped.push({ from: out[k], to: inn[k] });
    }
    result.removed.push(...out.slice(pairs));
    result.added.push(...inn.slice(pairs));
  }
  return result;
}
