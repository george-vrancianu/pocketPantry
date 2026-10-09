import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
};

export const userRole = pgEnum('user_role', ['admin', 'regular']);
export const familyRole = pgEnum('family_role', ['owner', 'member']);

// A Family owns the Pantry, Shopping List and Family Settings.
// The Invite Code is replaced in place on regeneration, which revokes the old one.
export const family = pgTable('family', {
  id: uuid('id').primaryKey().defaultRandom(),
  inviteCode: text('invite_code').notNull().unique(),
  inviteCodeExpiresAt: timestamp('invite_code_expires_at', {
    withTimezone: true,
  }).notNull(),
  // Family Setting: days before expiry a Batch counts as Expiring Soon.
  staleThresholdDays: integer('stale_threshold_days').notNull().default(3),
  ...timestamps,
});

// Better Auth core tables. User IDs intentionally remain text because Better Auth owns them.
export const user = pgTable(
  'user',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull().default(false),
    image: text('image'),
    role: userRole('role').notNull().default('regular'),
    // Every Member belongs to exactly one Family: never nullable.
    familyId: uuid('family_id')
      .notNull()
      .references(() => family.id),
    familyRole: familyRole('family_role').notNull().default('member'),
    // Member Preference: 'en' | 'ro' | 'da' (validated in the API); null until chosen.
    locale: text('locale'),
    ...timestamps,
  },
  (table) => [
    index('user_family_id_idx').on(table.familyId),
    // A Family has a single Owner.
    uniqueIndex('user_family_owner_idx')
      .on(table.familyId)
      .where(sql`${table.familyRole} = 'owner'`),
  ],
);

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    ...timestamps,
  },
  (table) => [index('session_user_id_idx').on(table.userId)],
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
      withTimezone: true,
    }),
    scope: text('scope'),
    password: text('password'),
    ...timestamps,
  },
  (table) => [
    index('account_user_id_idx').on(table.userId),
    uniqueIndex('account_provider_account_idx').on(
      table.providerId,
      table.accountId,
    ),
  ],
);

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
);

// Catalog: two-level Categories, Ingredients, and translated names/Synonyms.
export const storageLocation = pgEnum('storage_location', [
  'fridge',
  'freezer',
  'cupboard',
  'spices',
]);

export const ingredientUnit = pgEnum('ingredient_unit', [
  'g',
  'kg',
  'ml',
  'l',
  'pcs',
]);

export const catalogEntityType = pgEnum('catalog_entity_type', [
  'aisle',
  'parent_category',
  'leaf_category',
  'ingredient',
]);

export const translationKind = pgEnum('translation_kind', ['name', 'synonym']);

// An Aisle is an ordered shop section; several Parent Categories may share one.
// `name` is the canonical English name; display names live in catalog_translations.
export const aisles = pgTable(
  'aisles',
  {
    id: uuid('id').primaryKey(),
    name: text('name').notNull(),
    normalizedName: text('normalized_name').notNull(),
    sortOrder: integer('sort_order').notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('aisles_normalized_name_idx').on(table.normalizedName),
    uniqueIndex('aisles_sort_order_idx').on(table.sortOrder),
  ],
);

// `name` is the canonical English name; `normalizedName` is its matching key.
// A Parent Category belongs to an Aisle; the Aisle carries the shop-walk sort order.
export const parentCategories = pgTable(
  'parent_categories',
  {
    id: uuid('id').primaryKey(),
    name: text('name').notNull(),
    normalizedName: text('normalized_name').notNull(),
    aisleId: uuid('aisle_id')
      .notNull()
      .references(() => aisles.id),
    defaultExpiryDays: integer('default_expiry_days'),
    defaultLocation: storageLocation('default_location'),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('parent_categories_normalized_name_idx').on(
      table.normalizedName,
    ),
    index('parent_categories_aisle_idx').on(table.aisleId),
  ],
);

// Null Default Expiry / default Location fall back to the Parent Category.
export const leafCategories = pgTable(
  'leaf_categories',
  {
    id: uuid('id').primaryKey(),
    parentId: uuid('parent_id')
      .notNull()
      .references(() => parentCategories.id),
    name: text('name').notNull(),
    normalizedName: text('normalized_name').notNull(),
    defaultExpiryDays: integer('default_expiry_days'),
    defaultLocation: storageLocation('default_location'),
    // Marks the Parent's catch-all "Other" Leaf that receives Unmatched Batches.
    // Structural, so renaming a Leaf never breaks the lookup.
    isOther: boolean('is_other').notNull().default(false),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('leaf_categories_normalized_name_idx').on(table.normalizedName),
    index('leaf_categories_parent_idx').on(table.parentId),
    // At most one "Other" Leaf per Parent.
    uniqueIndex('leaf_categories_one_other_per_parent_idx')
      .on(table.parentId)
      .where(sql`${table.isOther}`),
  ],
);

export const ingredients = pgTable(
  'ingredients',
  {
    id: uuid('id').primaryKey(),
    leafCategoryId: uuid('leaf_category_id')
      .notNull()
      .references(() => leafCategories.id),
    name: text('name').notNull(),
    normalizedName: text('normalized_name').notNull(),
    defaultUnit: ingredientUnit('default_unit').notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('ingredients_normalized_name_idx').on(table.normalizedName),
    index('ingredients_leaf_category_idx').on(table.leafCategoryId),
  ],
);

// Display names and Synonyms per entity and locale. `entityId` is polymorphic
// (selected by `entityType`), so it carries no foreign key.
export const catalogTranslations = pgTable(
  'catalog_translations',
  {
    id: uuid('id').primaryKey(),
    entityType: catalogEntityType('entity_type').notNull(),
    entityId: uuid('entity_id').notNull(),
    locale: text('locale').notNull(),
    kind: translationKind('kind').notNull(),
    value: text('value').notNull(),
    normalizedValue: text('normalized_value').notNull(),
    ...timestamps,
  },
  (table) => [
    // One display name per entity and locale, unique within the locale.
    uniqueIndex('catalog_translations_display_entity_idx')
      .on(table.entityType, table.entityId, table.locale)
      .where(sql`${table.kind} = 'name'`),
    uniqueIndex('catalog_translations_display_value_idx')
      .on(table.entityType, table.locale, table.normalizedValue)
      .where(sql`${table.kind} = 'name'`),
    uniqueIndex('catalog_translations_synonym_idx')
      .on(table.entityType, table.entityId, table.locale, table.normalizedValue)
      .where(sql`${table.kind} = 'synonym'`),
    index('catalog_translations_lookup_idx').on(table.normalizedValue),
  ],
);

// Shopping: one active Shopping List per Family (Finish Shopping archives the old one).
export const shoppingListStatus = pgEnum('shopping_list_status', [
  'active',
  'archived',
]);

export const shoppingLists = pgTable(
  'shopping_lists',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    familyId: uuid('family_id')
      .notNull()
      .references(() => family.id, { onDelete: 'cascade' }),
    status: shoppingListStatus('status').notNull().default('active'),
    ...timestamps,
  },
  (table) => [
    // Exactly one active list per Family.
    uniqueIndex('shopping_lists_active_family_idx')
      .on(table.familyId)
      .where(sql`${table.status} = 'active'`),
  ],
);

// A matched Shopping Item points at an Ingredient; an Unmatched one has no
// `ingredientId` and keeps the typed `name` (with its matching key).
export const shoppingItems = pgTable(
  'shopping_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    listId: uuid('list_id')
      .notNull()
      .references(() => shoppingLists.id, { onDelete: 'cascade' }),
    ingredientId: uuid('ingredient_id').references(() => ingredients.id),
    name: text('name'),
    normalizedName: text('normalized_name'),
    quantity: numeric('quantity', { precision: 12, scale: 3 }),
    unit: ingredientUnit('unit'),
    checked: boolean('checked').notNull().default(false),
    ...timestamps,
  },
  (table) => [
    index('shopping_items_list_idx').on(table.listId),
    check(
      'shopping_items_matched_or_named',
      sql`(${table.ingredientId} IS NOT NULL) <> (${table.name} IS NOT NULL)`,
    ),
  ],
);

// Created now, empty until recipes land in wave 2. `recipeId` has no foreign
// key yet because the recipes table does not exist.
export const shoppingItemSourceRecipes = pgTable(
  'shopping_item_source_recipes',
  {
    shoppingItemId: uuid('shopping_item_id')
      .notNull()
      .references(() => shoppingItems.id, { onDelete: 'cascade' }),
    recipeId: uuid('recipe_id').notNull(),
    ...timestamps,
  },
  (table) => [primaryKey({ columns: [table.shoppingItemId, table.recipeId] })],
);

// Pantry: one Batch is one purchase of one Ingredient, owned by a Family (not a Member).
// An Unmatched Batch has no Ingredient: it keeps the typed `rawName` and sits under an
// "Other" Leaf Category (`leafCategoryId` is always set so Admin curation can find it).
export const batches = pgTable(
  'batches',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    familyId: uuid('family_id')
      .notNull()
      .references(() => family.id, { onDelete: 'cascade' }),
    ingredientId: uuid('ingredient_id').references(() => ingredients.id),
    leafCategoryId: uuid('leaf_category_id')
      .notNull()
      .references(() => leafCategories.id),
    unmatched: boolean('unmatched').notNull().default(false),
    rawName: text('raw_name'),
    quantity: numeric('quantity', { precision: 10, scale: 3, mode: 'number' }),
    unit: ingredientUnit('unit'),
    location: storageLocation('location').notNull(),
    expiryDate: date('expiry_date', { mode: 'string' }),
    productDescription: text('product_description'),
    ...timestamps,
  },
  (table) => [
    index('batches_family_idx').on(table.familyId),
    check(
      'batches_unit_with_quantity',
      sql`${table.quantity} IS NULL OR ${table.unit} IS NOT NULL`,
    ),
    check(
      'batches_quantity_positive',
      sql`${table.quantity} IS NULL OR ${table.quantity} > 0`,
    ),
    check(
      'batches_match_state',
      sql`(${table.unmatched} AND ${table.ingredientId} IS NULL AND ${table.rawName} IS NOT NULL) OR (NOT ${table.unmatched} AND ${table.ingredientId} IS NOT NULL)`,
    ),
  ],
);

// Where an Unmatched name was saved from: a Scan Mode, a typed entry, or Finish Shopping.
export const unmatchedSource = pgEnum('unmatched_source', [
  'product',
  'receipt',
  'plate',
  'ingredients',
  'manual',
  'finish_shopping',
]);

// The Admin review queue: one row per Unmatched Batch or Shopping Item, recording the
// raw text, its locale and source. `rawName` is UI-locale text (the AI's fallback name or
// what the Member typed); `sourceText` is the text as printed, read in `sourceLanguage`
// (a Scan Language). The queue groups rows by `normalizedName`.
// Resolving a name deletes its rows; dismissing keeps them with `dismissedAt` set.
// Rows vanish with the Batch or Shopping Item they were saved on.
export const unmatchedEntries = pgTable(
  'unmatched_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    normalizedName: text('normalized_name').notNull(),
    rawName: text('raw_name').notNull(),
    locale: text('locale').notNull(),
    sourceText: text('source_text'),
    sourceLanguage: text('source_language'),
    source: unmatchedSource('source').notNull(),
    batchId: uuid('batch_id').references(() => batches.id, {
      onDelete: 'cascade',
    }),
    shoppingItemId: uuid('shopping_item_id').references(
      () => shoppingItems.id,
      {
        onDelete: 'cascade',
      },
    ),
    dismissedAt: timestamp('dismissed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('unmatched_entries_name_recency_idx').on(
      table.normalizedName,
      table.createdAt.desc(),
    ),
    uniqueIndex('unmatched_entries_batch_idx')
      .on(table.batchId)
      .where(sql`${table.batchId} IS NOT NULL`),
    uniqueIndex('unmatched_entries_shopping_item_idx')
      .on(table.shoppingItemId)
      .where(sql`${table.shoppingItemId} IS NOT NULL`),
    check(
      'unmatched_entries_one_target',
      sql`(${table.batchId} IS NOT NULL) <> (${table.shoppingItemId} IS NOT NULL)`,
    ),
  ],
);

// Scan Cap bookkeeping: one row per Member per UTC day, counting Scans that reached the provider.
export const scanUsage = pgTable(
  'scan_usage',
  {
    memberId: text('member_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    day: date('day', { mode: 'string' }).notNull(),
    count: integer('count').notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.memberId, table.day] }),
    check('scan_usage_count_non_negative', sql`${table.count} >= 0`),
  ],
);
// Dashboard: a Member's own layout, an ordered list of Widget instances (type and size).
// No row means the Member never customised it and gets the default layout.
export const dashboardLayouts = pgTable('dashboard_layouts', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  widgets: jsonb('widgets')
    .$type<Array<{ id: string; type: string; size: string }>>()
    .notNull(),
  ...timestamps,
});

// Family Settings: a Default Expiry override per Category. `entityId` is a Parent or
// Leaf Category id (selected by `entityType`), so it carries no foreign key.
export const familyExpiryOverrides = pgTable(
  'family_expiry_overrides',
  {
    familyId: uuid('family_id')
      .notNull()
      .references(() => family.id, { onDelete: 'cascade' }),
    entityType: catalogEntityType('entity_type').notNull(),
    entityId: uuid('entity_id').notNull(),
    days: integer('days').notNull(),
    ...timestamps,
  },
  (table) => [
    primaryKey({ columns: [table.familyId, table.entityType, table.entityId] }),
    check(
      'family_expiry_overrides_category',
      sql`${table.entityType} IN ('parent_category', 'leaf_category')`,
    ),
    check(
      'family_expiry_overrides_days',
      sql`${table.days} BETWEEN 1 AND 3650`,
    ),
  ],
);
