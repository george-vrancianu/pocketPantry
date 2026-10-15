// Proposed addition to apps/api/src/database/schema.ts (handoff §6.1). Needs schema review:
// the user merges schema PRs. Uses the file's existing imports and `timestamps` helper.

// A Meal Plan Entry: one planned meal for a Family on a date and in a slot.
// Plan length is not stored; it is whatever dates in the next 7 days have entries.
// Recipes are never hard-deleted (archived ones stay readable here).
export const mealSlot = pgEnum('meal_slot', ['breakfast', 'lunch', 'dinner']);

export const mealPlanEntries = pgTable(
  'meal_plan_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    familyId: uuid('family_id')
      .notNull()
      .references(() => family.id, { onDelete: 'cascade' }),
    // Family-local calendar date, like batches.expiry_date.
    date: date('date', { mode: 'string' }).notNull(),
    slot: mealSlot('slot').notNull(),
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id),
    servings: integer('servings').notNull(),
    createdBy: text('created_by').references(() => user.id, {
      onDelete: 'set null',
    }),
    ...timestamps,
  },
  (table) => [
    // One meal per slot per day.
    uniqueIndex('meal_plan_entries_family_date_slot_idx').on(
      table.familyId,
      table.date,
      table.slot,
    ),
    index('meal_plan_entries_recipe_idx').on(table.recipeId),
    check('meal_plan_entries_servings_positive', sql`${table.servings} > 0`),
  ],
);

// Read endpoint (handoff §6.2), response shape:
// GET /meal-plan?from=YYYY-MM-DD&days=7
// {
//   days: Array<{
//     date: string;
//     status: 'covered' | 'onList' | 'short' | 'empty';
//     meals: Array<{
//       id: string; slot: 'breakfast' | 'lunch' | 'dinner';
//       recipe: { id: string; title: string; minutes: number | null; aisleId: string | null };
//       servings: number;
//       status: 'covered' | 'onList' | 'short';
//       issues: Array<{
//         ingredientId: string | null; rawName: string | null;
//         kind: 'short' | 'missing'; need: number | null; unit: 'g' | 'ml' | 'pcs' | null;
//         onList: boolean;
//         reason: { code: 'usesLast' | 'expires' | 'notInPantry' | 'onlyLeftAfter' | 'onlyInPantry'; params: Record<string, unknown> };
//       }>;
//     }>;
//   }>;
//   tag: { kind: 'short'; meals: number } | { kind: 'coveredOnceYouShop' } | { kind: 'allCovered' } | { kind: 'none' };
// }
// Computed by planCoverage.ts in this folder.
