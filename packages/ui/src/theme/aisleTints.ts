import { tokens } from './tokens';

export type AisleTint = { background: string; text: string };

const produce = { background: '#DDEBE2', text: '#2E6A4D' };
const bakery = { background: '#F6EBC8', text: '#6E5200' };
const dairy = { background: '#E3ECF3', text: '#2F5674' };
const meat = { background: '#FBE6DA', text: '#B54A17' };
const frozen = { background: '#E6E9F4', text: '#3E4C7A' };
const pantry = { background: '#E2E8DD', text: '#3C4A41' };
const drinks = { background: '#EFE6F1', text: '#6A3F72' };

/**
 * Tile colours by Aisle id. The ids are the seeded Aisles' stable ids
 * (`seedId.aisle(slug)` in apps/api/src/catalog/seed/seed-catalog.ts); Aisles
 * have no slug column, so the slug is noted beside each.
 */
export const aisleTints: Readonly<Record<string, AisleTint>> = {
  '1dff107d-5280-500f-807e-d694a53e24d9': produce, // fruit-veg
  '28ebc9e6-2bd5-5698-ba01-8a4a0b232e36': bakery, // bakery
  '5275409d-8e0e-584a-8b21-94dfdcf2edb0': meat, // meat-fish
  '244cde4d-f9a5-5df8-9f40-5e1f48fd4fcf': dairy, // dairy-eggs
  'b658eb31-01a3-52d2-8f87-255332e5c6c6': frozen, // frozen
  'b81caa56-7e3c-5d0d-a59d-f74137b77e08': pantry, // dry-goods
  '94e1e744-1a94-5ace-9390-7a379077ab77': pantry, // tins-jars
  '8e7904b6-9b1e-5bb1-b2fe-5be62dfd0750': bakery, // oils-spices
  '233a1edd-a872-5885-bbf3-d77182e67050': drinks, // snacks-drinks
};

/** The tint for an Aisle; "Other" and any Admin-created Aisle get the neutral chip. */
export function aisleTint(aisleId: string): AisleTint {
  return (
    aisleTints[aisleId] ?? {
      background: tokens.color.chipNeutral,
      text: tokens.color.muted,
    }
  );
}
