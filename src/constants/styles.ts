import { StyleSheet } from 'react-native';
import { COLORS } from './colors';

export const commonStyles = StyleSheet.create({
  // Контейнеры
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: 'center',
    padding: 12,
  },
  buttonDisabled: {
    alignItems: 'center',
    backgroundColor: COLORS.gray[400],
    borderRadius: 8,
    justifyContent: 'center',
    padding: 12,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.background.card.light,
    borderRadius: 8,
    elevation: 3,
    marginVertical: 8,
    padding: 16,
    shadowColor: COLORS.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardDark: {
    backgroundColor: COLORS.background.card.dark,
    borderRadius: 8,
    elevation: 3,
    marginVertical: 8,
    padding: 16,
    shadowColor: COLORS.shadow.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  container: {
    backgroundColor: COLORS.background.light,
    flex: 1,
  },
  containerDark: {
    backgroundColor: COLORS.background.dark,
    flex: 1,
  },
  divider: {
    backgroundColor: COLORS.border.light,
    height: 1,
    marginVertical: 8,
  },
  dividerDark: {
    backgroundColor: COLORS.border.dark,
    height: 1,
    marginVertical: 8,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    marginTop: 4,
  },
  heading: {
    color: COLORS.text.primary.light,
    fontSize: 24,
    fontWeight: 'bold',
  },
  headingDark: {
    color: COLORS.text.primary.dark,
    fontSize: 24,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border.light,
    borderRadius: 8,
    borderWidth: 1,
    color: COLORS.text.primary.light,
    fontSize: 16,
    padding: 12,
  },
  inputDark: {
    backgroundColor: COLORS.background.card.dark,
    borderColor: COLORS.border.dark,
    borderRadius: 8,
    borderWidth: 1,
    color: COLORS.text.primary.dark,
    fontSize: 16,
    padding: 12,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.overlay,
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    color: COLORS.text.primary.light,
    fontSize: 16,
  },
  textDark: {
    color: COLORS.text.primary.dark,
    fontSize: 16,
  },
  textSecondary: {
    color: COLORS.text.secondary.light,
    fontSize: 14,
  },
  textSecondaryDark: {
    color: COLORS.text.secondary.dark,
    fontSize: 14,
  },
});

export const spacing = {
  large: 24,
  medium: 16,
  small: 8,
} as const;
