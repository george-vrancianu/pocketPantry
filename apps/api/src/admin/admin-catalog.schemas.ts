import { z } from 'zod';
import { CATALOG_LOCALES } from '../catalog/catalog.schemas';
import { normalizeName } from '../catalog/normalize';
import {
  catalogEntityType,
  ingredientUnit,
  storageLocation,
  translationKind,
} from '../database/schema';

const text = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .refine((value) => normalizeName(value).length > 0, 'must contain a letter');

const id = z.uuid();

/** A PATCH that changes nothing is a client error, not a no-op the database rejects. */
const atLeastOne = (value: object) => Object.keys(value).length > 0;
const atLeastOneMessage = 'at least one field is required';
const expiryDays = z.number().int().min(0).max(3650).nullable();
const location = z.enum(storageLocation.enumValues).nullable();

export const parentCategoryCreate = z.object({
  name: text,
  aisleId: id,
  defaultExpiryDays: expiryDays.default(null),
  defaultLocation: location.default(null),
});
export const parentCategoryUpdate = z
  .object({
    name: text,
    aisleId: id,
    defaultExpiryDays: expiryDays,
    defaultLocation: location,
  })
  .partial()
  .refine(atLeastOne, atLeastOneMessage);

export const leafCategoryCreate = z.object({
  parentId: id,
  name: text,
  defaultExpiryDays: expiryDays.default(null),
  defaultLocation: location.default(null),
});
export const leafCategoryUpdate = z
  .object({
    parentId: id,
    name: text,
    defaultExpiryDays: expiryDays,
    defaultLocation: location,
  })
  .partial()
  .refine(atLeastOne, atLeastOneMessage);

export const ingredientCreate = z.object({
  leafCategoryId: id,
  name: text,
  defaultUnit: z.enum(ingredientUnit.enumValues),
});
export const ingredientUpdate = ingredientCreate
  .partial()
  .refine(atLeastOne, atLeastOneMessage);

export const translationCreate = z.object({
  entityType: z.enum(catalogEntityType.enumValues),
  entityId: id,
  locale: z.enum(CATALOG_LOCALES),
  kind: z.enum(translationKind.enumValues),
  value: text,
});
export const translationUpdate = z.object({ value: text });

export const idParam = z.object({ id });

export type ParentCategoryCreate = z.infer<typeof parentCategoryCreate>;
export type ParentCategoryUpdate = z.infer<typeof parentCategoryUpdate>;
export type LeafCategoryCreate = z.infer<typeof leafCategoryCreate>;
export type LeafCategoryUpdate = z.infer<typeof leafCategoryUpdate>;
export type IngredientCreate = z.infer<typeof ingredientCreate>;
export type IngredientUpdate = z.infer<typeof ingredientUpdate>;
export type TranslationCreate = z.infer<typeof translationCreate>;
export type TranslationUpdate = z.infer<typeof translationUpdate>;
