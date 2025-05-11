import { StyleSheet, Platform } from 'react-native';
import { COLORS } from './colors';

// Теневые стили
export const shadows = {
  light: Platform.select({
    web: {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    },
    default: {
      elevation: 3,
      shadowColor: COLORS.palette.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
  }),
  dark: Platform.select({
    web: {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    },
    default: {
      elevation: 3,
      shadowColor: COLORS.palette.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
  }),
};

// Общие стили для переиспользования
export const commonStyles = StyleSheet.create({
  // Layout
  body: {
    fontSize: 16,
  },
  caption: {
    fontSize: 14,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  flex: {
    flex: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  margin: {
    margin: 16,
  },
  marginBottom: {
    marginBottom: 16,
  },
  marginHorizontal: {
    marginHorizontal: 16,
  },
  marginTop: {
    marginTop: 16,
  },
  marginVertical: {
    marginVertical: 16,
  },
  padding: {
    padding: 16,
  },
  paddingHorizontal: {
    paddingHorizontal: 16,
  },
  paddingVertical: {
    paddingVertical: 16,
  },
  row: {
    flexDirection: 'row',
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
  },
});
