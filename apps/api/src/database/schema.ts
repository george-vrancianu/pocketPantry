import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

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

// A Family owns the Pantry, Shopping List and Family Settings (later tickets).
// The Invite Code is replaced in place on regeneration, which revokes the old one.
export const family = pgTable('family', {
  id: uuid('id').primaryKey().defaultRandom(),
  inviteCode: text('invite_code').notNull().unique(),
  inviteCodeExpiresAt: timestamp('invite_code_expires_at', {
    withTimezone: true,
  }).notNull(),
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
  'parent_category',
  'leaf_category',
  'ingredient',
]);

export const translationKind = pgEnum('translation_kind', ['name', 'synonym']);

// `name` is the canonical English name; `normalizedName` is its matching key.
// A Parent Category carries the Aisle and its shop-walk sort order.
export const parentCategories = pgTable(
  'parent_categories',
  {
    id: uuid('id').primaryKey(),
    name: text('name').notNull(),
    normalizedName: text('normalized_name').notNull(),
    aisle: text('aisle').notNull(),
    aisleSortOrder: integer('aisle_sort_order').notNull(),
    defaultExpiryDays: integer('default_expiry_days'),
    defaultLocation: storageLocation('default_location'),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('parent_categories_normalized_name_idx').on(
      table.normalizedName,
    ),
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
    ...timestamps,
  },
  (table) => [
    uniqueIndex('leaf_categories_normalized_name_idx').on(table.normalizedName),
    index('leaf_categories_parent_idx').on(table.parentId),
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
