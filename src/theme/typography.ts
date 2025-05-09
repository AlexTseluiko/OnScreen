import { StyleSheet } from 'react-native';

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
  thin: 'System',
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const LINE_HEIGHTS = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  xxl: 36,
  xxxl: 40,
};

export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  bold: '700' as const,
  light: '300' as const,
  thin: '100' as const,
};

export const createTextStyle = (
  size: keyof typeof FONT_SIZES = 'md',
  weight: keyof typeof FONT_WEIGHTS = 'regular',
  lineHeight: keyof typeof LINE_HEIGHTS = 'md'
) => {
  return {
    fontFamily: FONTS[weight],
    fontSize: FONT_SIZES[size],
    lineHeight: LINE_HEIGHTS[lineHeight],
    fontWeight: FONT_WEIGHTS[weight],
  } as const;
};

export const TYPOGRAPHY = StyleSheet.create({
  body1: createTextStyle('md', 'regular', 'md'),
  body2: createTextStyle('sm', 'regular', 'sm'),
  button: createTextStyle('md', 'medium', 'md'),
  caption: createTextStyle('xs', 'regular', 'xs'),
  h1: createTextStyle('xxxl', 'bold', 'xxxl'),
  h2: createTextStyle('xxl', 'bold', 'xxl'),
  h3: createTextStyle('xl', 'bold', 'xl'),
  h4: createTextStyle('lg', 'bold', 'lg'),
  h5: createTextStyle('md', 'bold', 'md'),
  h6: createTextStyle('sm', 'bold', 'sm'),
  overline: createTextStyle('xs', 'medium', 'xs'),
});
