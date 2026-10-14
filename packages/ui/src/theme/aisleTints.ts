import { tokens } from './tokens';

/** An Aisle's tint for Ingredient Icons, per theme (`light` is the minimal theme). Dark is stored but unused until a dark theme exists. */
type AisleTint = { light: string; dark: string; warm: string };

const produce = { light: '#DDEBE2', dark: '#24392E', warm: '#DFE7CF' };
const bakery = { light: '#F6EBC8', dark: '#3B3320', warm: '#F3E4BF' };
const dairy = { light: '#E3ECF3', dark: '#243440', warm: '#E4E9EA' };
const meat = { light: '#FBE6DA', dark: '#42291E', warm: '#F5DCCB' };
const frozen = { light: '#E6E9F4', dark: '#272C3F', warm: '#E3E5EE' };
const pantry = { light: '#E2E8DD', dark: '#2B332C', warm: '#E8E3D1' };
const drinks = { light: '#EFE6F1', dark: '#362A3A', warm: '#ECE1E7' };

/**
 * Icon tints by Aisle id. The ids are the seeded Aisles' stable ids
 * (`seedId.aisle(slug)` in apps/api/src/catalog/seed/seed-catalog.ts); Aisles
 * have no slug column, so the slug is noted beside each.
 */
const aisleTints: Readonly<Record<string, AisleTint>> = {
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

/** The tint for an Aisle; no Aisle, "Other" and any Admin-created Aisle get the neutral chip. */
export function aisleTint(aisleId?: string | null): AisleTint {
  return (
    (aisleId ? aisleTints[aisleId] : undefined) ?? {
      light: tokens.color.chipNeutral,
      // Placeholder until the dark theme is designed; dark values are unused for now.
      dark: tokens.color.chipNeutral,
      warm: tokens.color.chipNeutral,
    }
  );
}
