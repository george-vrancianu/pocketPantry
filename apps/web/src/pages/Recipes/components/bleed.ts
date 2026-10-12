/** Lets a scrolling row run to the screen edges while its first item still lines up with the page gutter. */
export const bleedSx = {
  mx: { xs: '-20px', md: '-48px' },
  px: { xs: '20px', md: '48px' },
  scrollPaddingInline: { xs: '20px', md: '48px' },
} as const;
