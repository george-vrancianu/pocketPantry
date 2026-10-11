import { z } from 'zod';
import { ingredientUnit } from '../database/schema';
import { MAX_QUANTITY } from '../common/quantity';

export const MAX_TEMPLATES_PER_FAMILY = 50;
export const MAX_TEMPLATE_LINES = 100;

/** A line has the shape of a Shopping Item: an Ingredient or a typed name, with an optional quantity and unit. */
export const templateLineBody = z
  .object({
    ingredientId: z.uuid().optional(),
    name: z.string().trim().min(1).max(100).optional(),
    quantity: z.number().positive().max(MAX_QUANTITY).optional(),
    unit: z.enum(ingredientUnit.enumValues).optional(),
  })
  .refine(
    (body) => (body.ingredientId === undefined) !== (body.name === undefined),
    { message: 'Provide either ingredientId or name', path: ['ingredientId'] },
  );
export type TemplateLineBody = z.infer<typeof templateLineBody>;

const templateName = z.string().trim().min(1).max(100);

/** The line count is checked by the service, which answers with a coded error. */
export const createTemplateBody = z.object({
  name: templateName,
  lines: z.array(templateLineBody).max(1000).default([]),
});
export type CreateTemplateBody = z.infer<typeof createTemplateBody>;

export const createTemplateFromListBody = z.object({ name: templateName });
export type CreateTemplateFromListBody = z.infer<
  typeof createTemplateFromListBody
>;

/** `lines` replaces all the lines. */
export const updateTemplateBody = z
  .object({
    name: templateName.optional(),
    lines: z.array(templateLineBody).max(1000).optional(),
  })
  .refine((body) => body.name !== undefined || body.lines !== undefined, {
    message: 'Provide name or lines',
  });
export type UpdateTemplateBody = z.infer<typeof updateTemplateBody>;

export const templateIdParam = z.object({ id: z.uuid() });

export type TemplateSummaryView = {
  id: string;
  name: string;
  lineCount: number;
};

export type TemplateLineView = {
  id: string;
  ingredientId: string | null;
  name: string;
  quantity: number | null;
  unit: (typeof ingredientUnit.enumValues)[number] | null;
  /** True when the name never matched a Catalog Ingredient. */
  unmatched: boolean;
  /** The Family's Pantry holds an unexpired Batch of the Ingredient. */
  inPantry: boolean;
  /** Null for Unmatched lines. */
  aisle: { id: string; name: string; sortOrder: number } | null;
};

export type TemplateView = {
  id: string;
  name: string;
  /** In saved order. */
  lines: TemplateLineView[];
};
