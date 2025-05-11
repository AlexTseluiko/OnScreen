export const SCREEN_SIZES = {
  XS: 320,
  SM: 375,
  MD: 768,
  LG: 1024,
  XL: 1280,
} as const;

export type ScreenSize = (typeof SCREEN_SIZES)[keyof typeof SCREEN_SIZES];

export const BREAKPOINTS = {
  xs: `@media (min-width: ${SCREEN_SIZES.XS}px)`,
  sm: `@media (min-width: ${SCREEN_SIZES.SM}px)`,
  md: `@media (min-width: ${SCREEN_SIZES.MD}px)`,
  lg: `@media (min-width: ${SCREEN_SIZES.LG}px)`,
  xl: `@media (min-width: ${SCREEN_SIZES.XL}px)`,
} as const;
