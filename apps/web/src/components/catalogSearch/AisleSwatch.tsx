import { aisleTint, Box } from '@pocket-pantry/ui';

/** A small rounded square in an Aisle's tint. */
export function AisleSwatch({
  aisleId,
  size,
  radius,
}: {
  aisleId: string;
  size: number;
  radius: number;
}) {
  const tint = aisleTint(aisleId).light;
  return (
    <Box
      aria-hidden="true"
      data-testid="aisle-swatch"
      data-tint={tint}
      sx={{
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: `${radius}px`,
        backgroundColor: tint,
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.08)',
      }}
    />
  );
}
