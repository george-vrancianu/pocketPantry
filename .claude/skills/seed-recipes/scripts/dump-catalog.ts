// Prints the Catalog seed as TSV so agents can search it with grep.
// Usage: npx tsx dump-catalog.ts <worktree>/apps/api [ingredients|leaves|recipes]
//   ingredients (default): slug, en, ro, unit, leaf, en Synonyms, ro Synonyms
//   leaves: slug, parent, en, ro
//   recipes: every seeded Recipe slug, base first, then its Variants
import { resolve } from 'node:path';

async function main(): Promise<void> {
  const [apiDir, what = 'ingredients'] = process.argv.slice(2);
  if (!apiDir) throw new Error('usage: dump-catalog.ts <apps/api dir> [ingredients|leaves|recipes]');
  const seed = resolve(apiDir, 'src/catalog/seed');
  const catalog = await import(`${seed}/catalog-seed-data.ts`);
  const join = (list?: string[]) => (list ?? []).join('|');
  if (what === 'leaves') {
    for (const l of catalog.SEED_LEAVES) console.log([l.slug, l.parent, l.en, l.ro].join('\t'));
  } else if (what === 'recipes') {
    const { SEED_BASE_RECIPES } = await import(`${seed}/recipes/recipe-seed-data.ts`);
    for (const b of SEED_BASE_RECIPES) {
      console.log([b.slug, ...b.variants.map((v: { slug: string }) => v.slug)].join('\t'));
    }
  } else {
    for (const i of catalog.SEED_INGREDIENTS) {
      console.log(
        [i.slug, i.en, i.ro, i.unit, i.leaf, join(i.synonyms?.en), join(i.synonyms?.ro)].join('\t'),
      );
    }
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
