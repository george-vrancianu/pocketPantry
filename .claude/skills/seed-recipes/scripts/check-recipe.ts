// Validates one Base Recipe data file with the seed's own rules, before it is
// imported into SEED_BASE_RECIPES, so parallel writers can each check their file.
// Usage: npx tsx check-recipe.ts <worktree>/apps/api <path to the data file>
// Prints the problems and acceptance gaps for that base and exits 1 if any.
// A link to a Recipe slug that another writer in the batch is still writing
// shows up as `links unknown Recipe`; that one is expected until all files land.
import { resolve } from 'node:path';

type Base = { slug: string; variants: { slug: string }[] };

async function main(): Promise<void> {
  const [apiDir, file] = process.argv.slice(2);
  if (!apiDir || !file) throw new Error('usage: check-recipe.ts <apps/api dir> <data file>');
  const seed = resolve(apiDir, 'src/catalog/seed');
  const { SEED_INGREDIENTS } = await import(`${seed}/catalog-seed-data.ts`);
  const { SEED_BASE_RECIPES } = await import(`${seed}/recipes/recipe-seed-data.ts`);
  const registries = await import(`${seed}/recipes/registries.ts`);
  const validate = await import(`${seed}/recipes/validate-recipe-seed.ts`);
  const exported = Object.values(await import(resolve(file))).filter(
    (value): value is Base =>
      typeof value === 'object' && value !== null && 'variants' in value,
  );
  if (exported.length !== 1) {
    throw new Error(`${file} must export exactly one BaseRecipeSeed, found ${exported.length}`);
  }
  const mine = exported[0];
  const others = (SEED_BASE_RECIPES as Base[]).filter((b) => b.slug !== mine.slug);
  const problems: string[] = [
    ...validate.findRecipeSeedProblems({
      bases: [...others, mine],
      tags: registries.SEED_TAGS,
      eatingMoments: registries.SEED_EATING_MOMENTS,
      ingredientSlugs: new Set(SEED_INGREDIENTS.map((i: { slug: string }) => i.slug)),
    }),
    ...validate.findAcceptanceGaps([mine]),
  ];
  if (problems.length === 0) {
    console.log(`${mine.slug}: no problems (${mine.variants.length} Variants)`);
    return;
  }
  console.log(problems.map((p) => `- ${p}`).join('\n'));
  process.exit(1);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
