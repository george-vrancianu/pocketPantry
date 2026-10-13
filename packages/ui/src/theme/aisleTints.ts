import { tokens } from './tokens';

/** An Aisle's tint for Ingredient Icons, per theme. Dark is stored but unused until a dark theme exists. */
export type AisleTint = { light: string; dark: string };

const produce = { light: '#DDEBE2', dark: '#24392E' };
const bakery = { light: '#F6EBC8', dark: '#3B3320' };
const dairy = { light: '#E3ECF3', dark: '#243440' };
const meat = { light: '#FBE6DA', dark: '#42291E' };
const frozen = { light: '#E6E9F4', dark: '#272C3F' };
const pantry = { light: '#E2E8DD', dark: '#2B332C' };
const drinks = { light: '#EFE6F1', dark: '#362A3A' };

/**
 * Icon tints by Aisle id. The ids are the seeded Aisles' stable ids
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
      light: tokens.color.chipNeutral,
      dark: tokens.color.chipNeutral,
    }
  );
}
