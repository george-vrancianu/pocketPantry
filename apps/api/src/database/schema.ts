import {
  boolean,
  index,
  pgEnum,
  pgTable,
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

// Better Auth core tables. User IDs intentionally remain text because Better Auth owns them.
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  role: userRole('role').notNull().default('regular'),
  ...timestamps,
});

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

// TODO(ticket #4): placeholder catalog tables, copied from retzetar only so the
// scan services and IngredientCatalogService compile. Ticket #4 replaces them
// with the two-level Category tree, translations, and Aisle ordering.
export const ingredientCategories = pgTable(
  'ingredient_categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    normalizedName: text('normalized_name').notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('ingredient_categories_normalized_name_idx').on(
      table.normalizedName,
    ),
  ],
);

export const ingredients = pgTable(
  'ingredients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    normalizedName: text('normalized_name').notNull(),
    defaultUnit: text('default_unit').notNull(),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => ingredientCategories.id),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('ingredients_normalized_name_idx').on(table.normalizedName),
    index('ingredients_category_idx').on(table.categoryId),
  ],
);
