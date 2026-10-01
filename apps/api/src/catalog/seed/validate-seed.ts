import { normalizeName } from '../normalize';
import type {
  SeedAisle,
  SeedIngredient,
  SeedLeaf,
  SeedParent,
} from './seed-types';

export type CatalogSeed = {
  aisles: SeedAisle[];
  parents: SeedParent[];
  leaves: SeedLeaf[];
  ingredients: SeedIngredient[];
};

type Named = { slug: string; en: string; ro: string };

function duplicatesIn(
  label: string,
  rows: Named[],
  checkNames = true,
): string[] {
  const problems: string[] = [];
  const slugs = new Set<string>();
  const names = {
    en: new Map<string, string>(),
    ro: new Map<string, string>(),
  };
  for (const row of rows) {
    if (slugs.has(row.slug))
      problems.push(`${label}: duplicate slug "${row.slug}"`);
    slugs.add(row.slug);
    if (!checkNames) continue;
    for (const locale of ['en', 'ro'] as const) {
      const key = normalizeName(row[locale]);
      const other = names[locale].get(key);
      if (other !== undefined && other !== row.slug) {
        problems.push(
          `${label}: "${other}" and "${row.slug}" share the ${locale} name "${key}"`,
        );
      }
      names[locale].set(key, row.slug);
    }
  }
  return problems;
}

/**
 * Everything wrong with a Catalog seed, as readable lines. Beyond the database
 * constraints, an Ingredient name or Synonym must point at one Ingredient only,
 * in any locale, so a stage-one Match is never ambiguous.
 */
export function findSeedProblems(seed: CatalogSeed): string[] {
  const problems = [
    ...duplicatesIn('aisle', seed.aisles),
    ...duplicatesIn('parent', seed.parents),
    ...duplicatesIn('leaf', seed.leaves),
    ...duplicatesIn('ingredient', seed.ingredients, false),
  ];

  const aisles = new Set(seed.aisles.map((a) => a.slug));
  const parents = new Set(seed.parents.map((p) => p.slug));
  const leaves = new Set(seed.leaves.map((l) => l.slug));
  for (const p of seed.parents) {
    if (!aisles.has(p.aisle)) {
      problems.push(`parent "${p.slug}": unknown Aisle "${p.aisle}"`);
    }
  }
  for (const l of seed.leaves) {
    if (!parents.has(l.parent)) {
      problems.push(`leaf "${l.slug}": unknown Parent "${l.parent}"`);
    }
  }
  for (const p of seed.parents) {
    const others = seed.leaves.filter((l) => l.parent === p.slug && l.isOther);
    if (others.length !== 1) {
      problems.push(
        `parent "${p.slug}": expected exactly one is_other Leaf, found ${others.length}`,
      );
    }
  }
  for (const i of seed.ingredients) {
    if (!leaves.has(i.leaf)) {
      problems.push(`ingredient "${i.slug}": unknown Leaf "${i.leaf}"`);
    }
  }

  const owners = new Map<string, Set<string>>();
  for (const i of seed.ingredients) {
    const keys = [
      i.en,
      i.ro,
      ...(i.synonyms?.en ?? []),
      ...(i.synonyms?.ro ?? []),
    ].map(normalizeName);
    for (const key of new Set(keys)) {
      owners.set(key, (owners.get(key) ?? new Set()).add(i.slug));
    }
  }
  for (const [key, slugs] of owners) {
    if (slugs.size > 1) {
      problems.push(
        `ingredient name or Synonym "${key}" is shared by ${[...slugs].join(' and ')}`,
      );
    }
  }
  return problems;
}

export function assertCatalogSeedValid(seed: CatalogSeed): void {
  const problems = findSeedProblems(seed);
  if (problems.length > 0) {
    throw new Error(
      `Catalog seed is invalid:\n${problems.map((p) => `  - ${p}`).join('\n')}`,
    );
  }
}
